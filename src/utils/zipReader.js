/**
 * Efficiently reads file names from a ZIP file without loading the entire file into memory.
 * Reads only the Central Directory at the end of the file.
 * 
 * @param {File} file - The ZIP file object (Blob)
 * @returns {Promise<Set<string>>} - A Set containing all file paths in the zip
 */
export const getZipFileNames = async (file) => {
    const textDecoder = new TextDecoder("utf-8");

    const readBlob = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsArrayBuffer(blob);
        });
    };

    const fileSize = file.size;
    // EOCD is at least 22 bytes. Comment can be up to 65535 bytes.
    // We read the last 65535 + 22 bytes (or file size if smaller).
    const eocdSearchSize = Math.min(fileSize, 65535 + 22);
    const eocdSlice = file.slice(fileSize - eocdSearchSize, fileSize);
    const eocdBuffer = await readBlob(eocdSlice);
    const eocdView = new DataView(eocdBuffer);

    // Find EOCD signature: 0x06054b50 (Little Endian)
    let eocdOffset = -1;
    for (let i = eocdBuffer.byteLength - 22; i >= 0; i--) {
        if (eocdView.getUint32(i, true) === 0x06054b50) {
            eocdOffset = i;
            break;
        }
    }

    if (eocdOffset === -1) {
        throw new Error("Invalid ZIP file: End of Central Directory record not found.");
    }

    // Read CD info from EOCD
    // Offset 10: Total number of entries in the central directory (2 bytes)
    // Offset 12: Size of the central directory (4 bytes)
    // Offset 16: Offset of start of central directory with respect to the starting disk number (4 bytes)

    // Sometimes these might be 0xFFFFFFFF for Zip64, providing a basic fallback (Zip64 not fully implemented here for simplicity, 
    // assuming <4GB central directory which is typical even for large asset files unless millions of files)
    // But our files are large (2.7GB), so Zip64 might be used if >4GB or >65k files. 
    // Standard EOCD handles up to 4GB files comfortably unless offset > 4GB.

    const cdSize = eocdView.getUint32(eocdOffset + 12, true);
    let cdOffset = eocdView.getUint32(eocdOffset + 16, true);

    // Handling Zip64 is complex. If cdOffset is 0xFFFFFFFF, we need to look for Zip64 EOCD.
    // For now, let's assume standard Zip unless we hit issues. 
    // If the file is just 2.7GB, standard offset (32-bit uint) goes up to 4GB, so it should be fine.

    // Calculate absolute position of CD in file
    // eocdSlice started at (fileSize - eocdSearchSize)
    // But eocdOffset is relative to eocdSlice.

    // We need to fetch the Central Directory now.
    const cdSlice = file.slice(cdOffset, cdOffset + cdSize);
    const cdBuffer = await readBlob(cdSlice);
    const cdView = new DataView(cdBuffer);

    const paths = new Set();
    let offset = 0;

    // CD Header Signature: 0x02014b50
    // Header size: 46 bytes (base) + variable filenames
    while (offset < cdBuffer.byteLength) {
        if (cdView.getUint32(offset, true) !== 0x02014b50) {
            break; // Stop if invalid signature (end of CD)
        }

        const fileNameLen = cdView.getUint16(offset + 28, true);
        const extraFieldLen = cdView.getUint16(offset + 30, true);
        const fileCommentLen = cdView.getUint16(offset + 32, true);

        // Filename is at offset 46
        const fileNameBytes = new Uint8Array(cdBuffer, offset + 46, fileNameLen);
        const fileName = textDecoder.decode(fileNameBytes);

        // Only add files, not directories (usually differ by trailing slash, or external attrs)
        // Basic check: if it ends with /, it's a directory
        if (!fileName.endsWith('/')) {
            paths.add(fileName);
        }

        // Move to next entry
        offset += 46 + fileNameLen + extraFieldLen + fileCommentLen;
    }

    return paths;
};
