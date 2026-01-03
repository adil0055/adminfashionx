import React from 'react';
import { X, Warning, ShieldCheck, CheckCircle, Info } from '@phosphor-icons/react';

const Modal = ({
    show,
    onClose,
    title,
    type = 'info',
    children,
    footer,
    maxWidth = '500px'
}) => {
    if (!show) return null;

    const getIcon = () => {
        switch (type) {
            case 'confirm': return <Warning size={24} color="var(--warning)" />;
            case 'secret': return <ShieldCheck size={24} color="var(--primary)" />;
            case 'success': return <CheckCircle size={24} color="var(--success)" />;
            case 'error': return <X size={24} color="var(--danger)" />;
            case 'info': return <Info size={24} color="var(--primary)" />;
            default: return null;
        }
    };

    return (
        <div className="modal-overlay active" style={{ zIndex: 2000 }}>
            <div className="modal-content" style={{ maxWidth }}>
                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getIcon()}
                        {title}
                    </h2>
                    <button className="close-modal" onClick={onClose}><X /></button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
