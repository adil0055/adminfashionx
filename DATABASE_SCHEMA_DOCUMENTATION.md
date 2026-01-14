# Database Schema Documentation - Product & Client Architecture

## Overview
This document provides a comprehensive description of all product-related and client-related tables in the FashionX database, including their relationships, purposes, and data flow.

---

## 🏢 CLIENT MANAGEMENT ARCHITECTURE

### Hierarchy Flow
```
api_subs_tiers (Subscription Plans)
    ↓
api_clients (API Credentials)
    ↓
client_organizations (Organization Details)
    ↓
client_locations (Physical Locations)
    ↓
kiosks (Physical Kiosk Devices)
    ↓
kiosk_sessions (User Sessions on Kiosks)
```

---

## 📊 CLIENT-RELATED TABLES

### 1. `api_subs_tiers` - Subscription Tiers/Plans
**Purpose**: Defines subscription plans with rate limits and quotas for API clients.

**Fields**:
- `id` (PK): Unique tier identifier
- `name` (VARCHAR 50): Tier name (e.g., "Starter", "Pro", "Enterprise")
- `daily_quota` (INTEGER): Maximum requests per day
- `monthly_quota` (INTEGER): Maximum requests per month
- `rate_limit_rpm` (INTEGER): Requests per minute limit
- `price_monthly` (NUMERIC 10,2): Monthly subscription price
- `period` (VARCHAR 20): Billing period
- `description` (VARCHAR 255): Tier description
- `features` (TEXT): JSON or text list of features
- `recommended` (BOOLEAN): Whether this tier is recommended
- `color` (VARCHAR 20): UI color for display
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- One-to-Many → `api_clients` (via `tier_id`)

**Use Case**: 
- Admin defines subscription tiers
- Clients are assigned to tiers
- Tiers determine rate limits and quotas

---

### 2. `api_clients` - API Client Credentials
**Purpose**: Stores API authentication credentials for external clients (Shopify plugins, mobile apps, etc.).

**Fields**:
- `id` (PK): Internal database ID
- `client_id` (VARCHAR 64, UNIQUE): Public client identifier (used in `X-Client-ID` header)
- `client_secret_hash` (VARCHAR 255): SHA256 hash of client secret (used in `X-Client-Secret` header)
- `name` (VARCHAR 100): Display name (e.g., "Shopify Store A")
- `callback_url` (VARCHAR 500): Default webhook URL for VTON completion notifications
- `status` (VARCHAR 20): Account status (`active`, `suspended`, `inactive`)
- `tier_id` (FK → `api_subs_tiers.id`): Subscription tier assignment
- `config` (TEXT): JSON configuration for client-specific overrides:
  ```json
  {
    "daily_quota": 200,        // Override tier limit
    "rate_limit_rpm": 60,      // Override RPM
    "monthly_quota": 5000      // Override monthly limit
  }
  ```
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `api_subs_tiers` (via `tier_id`)
- One-to-One → `client_organizations` (via `api_client_id`)
- One-to-Many → `api_usage_logs` (via `client_id`)
- One-to-Many → `external_user_mappings` (via `client_id`)

**Indexes**:
- `ix_api_clients_client_id` (UNIQUE): Fast lookup by client_id

**Use Case**:
- External clients authenticate using `client_id` and `client_secret`
- System checks tier limits and applies custom config overrides
- Used for rate limiting and quota management

---

### 3. `client_organizations` - Organization Details
**Purpose**: Extended organization information for B2B clients (kiosk operators, enterprise clients).

**Fields**:
- `id` (PK): Organization ID
- `api_client_id` (FK → `api_clients.id`, UNIQUE): Links to API client credentials
- `display_name` (VARCHAR 100): Organization display name
- `client_type` (VARCHAR 20): Type of client (`kiosk`, `enterprise`, `partner`)
- `logo_url` (VARCHAR 500): Organization logo URL
- `timezone` (VARCHAR 50): Organization timezone
- `hq_address` (TEXT): Headquarters address
- `contact_email` (VARCHAR 255): Contact email
- `contact_phone` (VARCHAR 50): Contact phone
- `billing_plan` (VARCHAR 50): Billing plan identifier
- `image_specs` (TEXT): Image specifications/requirements (JSON)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- One-to-One → `api_clients` (via `api_client_id`)
- One-to-Many → `client_locations` (via `client_org_id`)
- One-to-Many → `kiosks` (via `client_org_id`)
- One-to-Many → `kiosk_sessions` (via `client_org_id`)
- One-to-Many → `kiosk_usage_logs` (via `client_org_id`)

**Indexes**:
- `ix_client_organizations_api_client_id` (UNIQUE): Fast lookup by API client

**Use Case**:
- Stores business/organization details for B2B clients
- Links API credentials to organization context
- Used for kiosk management and multi-location support

---

### 4. `client_locations` - Physical Store Locations
**Purpose**: Represents physical store locations for organizations (multi-location support).

**Fields**:
- `id` (PK): Location ID
- `client_org_id` (FK → `client_organizations.id`): Parent organization
- `name` (VARCHAR 100): Location name (e.g., "Downtown Store", "Mall Location")
- `address` (TEXT): Physical address
- `is_primary` (BOOLEAN): Whether this is the primary location
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `client_organizations` (via `client_org_id`)
- One-to-Many → `kiosks` (via `location_id`)
- One-to-Many → `kiosk_sessions` (via `location_id`)
- One-to-Many → `location_products` (via `location_id`)

**Indexes**:
- `ix_client_locations_client_org_id`: Fast lookup by organization

**Use Case**:
- Organizations can have multiple physical locations
- Each location can have multiple kiosks
- Products can be assigned to specific locations

---

### 5. `kiosks` - Physical Kiosk Devices
**Purpose**: Represents physical kiosk hardware devices deployed at locations.

**Fields**:
- `id` (PK): Internal kiosk ID
- `kiosk_id` (VARCHAR 50, UNIQUE): Public kiosk identifier (used in `X-Kiosk-ID` header)
- `client_org_id` (FK → `client_organizations.id`): Parent organization
- `location_id` (FK → `client_locations.id`): Physical location
- `status` (VARCHAR 30): Kiosk status (`active`, `inactive`, `maintenance`, `offline`)
- `version` (VARCHAR 20): Kiosk software version
- `last_heartbeat` (TIMESTAMP): Last heartbeat/health check timestamp
- `warehouse_location` (VARCHAR 100): Warehouse/storage location
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Many-to-One → `client_organizations` (via `client_org_id`)
- Many-to-One → `client_locations` (via `location_id`)
- One-to-Many → `kiosk_sessions` (via `kiosk_id`)
- One-to-Many → `kiosk_usage_logs` (via `kiosk_id`)
- One-to-Many → `kiosk_history` (via `kiosk_id`)
- One-to-Many → `vton_job` (via `kiosk_id`)

**Indexes**:
- `ix_kiosks_kiosk_id` (UNIQUE): Fast lookup by kiosk_id
- `ix_kiosks_client_org_id`: Fast lookup by organization
- `ix_kiosks_location_id`: Fast lookup by location

**Use Case**:
- Tracks physical kiosk devices
- Monitors kiosk health via heartbeat
- Links kiosks to organizations and locations
- Used for kiosk-specific VTON jobs

---

### 6. `kiosk_sessions` - User Sessions on Kiosks
**Purpose**: Tracks user sessions on kiosk devices (from image upload to VTON completion).

**Fields**:
- `id` (PK): Session record ID
- `session_id` (VARCHAR 100, UNIQUE): Public session identifier (UUID)
- `kiosk_id` (FK → `kiosks.id`): Kiosk device
- `client_org_id` (FK → `client_organizations.id`): Organization
- `location_id` (FK → `client_locations.id`): Location
- `user_id` (FK → `users.id`): Internal user created for this session
- `age` (INTEGER): User's age (optional)
- `height` (DOUBLE PRECISION): User's height (optional)
- `status` (VARCHAR 20): Session status (`active`, `completed`, `abandoned`, `expired`)
- `current_step` (VARCHAR 50): Current step in workflow (`image_upload`, `catalog`, `vton`, `complete`)
- `created_at`, `updated_at`: Timestamps
- `expires_at` (TIMESTAMP): Session expiration time
- `completed_at` (TIMESTAMP): Session completion time

**Relationships**:
- Many-to-One → `kiosks` (via `kiosk_id`)
- Many-to-One → `client_organizations` (via `client_org_id`)
- Many-to-One → `client_locations` (via `location_id`)
- Many-to-One → `users` (via `user_id`)
- One-to-Many → `kiosk_usage_logs` (via `session_id`)
- One-to-Many → `vton_job` (via `session_id`)

**Indexes**:
- `ix_kiosk_sessions_session_id` (UNIQUE): Fast lookup by session_id
- `ix_kiosk_sessions_kiosk_id`: Fast lookup by kiosk
- `ix_kiosk_sessions_client_org_id`: Fast lookup by organization
- `ix_kiosk_sessions_location_id`: Fast lookup by location
- `ix_kiosk_sessions_user_id`: Fast lookup by user

**Use Case**:
- Tracks user journey on kiosk
- Manages session state (image upload → catalog → VTON)
- Links to internal user account
- Used for analytics and session management

---

### 7. `kiosk_usage_logs` - Kiosk Event Logging
**Purpose**: Logs all events/actions on kiosk devices for analytics and monitoring.

**Fields**:
- `id` (PK): Log entry ID
- `kiosk_id` (FK → `kiosks.id`): Kiosk device
- `client_org_id` (FK → `client_organizations.id`): Organization
- `session_id` (FK → `kiosk_sessions.session_id`): Session (optional)
- `event_type` (VARCHAR 50): Event type (`image_uploaded`, `vton_requested`, `product_viewed`, `session_started`, etc.)
- `metadata_json` (TEXT): JSON metadata for event details
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `kiosks` (via `kiosk_id`)
- Many-to-One → `client_organizations` (via `client_org_id`)
- Many-to-One → `kiosk_sessions` (via `session_id`)

**Indexes**:
- `ix_kiosk_usage_logs_kiosk_id`: Fast lookup by kiosk
- `ix_kiosk_usage_logs_client_org_id`: Fast lookup by organization
- `ix_kiosk_usage_logs_session_id`: Fast lookup by session
- `ix_kiosk_usage_logs_created_at`: Time-based queries

**Use Case**:
- Analytics and reporting
- Usage monitoring
- Debugging and troubleshooting
- Business intelligence

---

### 8. `kiosk_history` - Kiosk Administrative History
**Purpose**: Tracks administrative actions performed on kiosks (deployment, maintenance, configuration changes).

**Fields**:
- `id` (PK): History entry ID
- `kiosk_id` (FK → `kiosks.id`): Kiosk device
- `event_type` (VARCHAR 50): Event type (`deployed`, `maintenance`, `configured`, `updated`, etc.)
- `details` (TEXT): Event details/description
- `performed_by` (FK → `admin_users.id`): Admin user who performed action
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `kiosks` (via `kiosk_id`)
- Many-to-One → `admin_users` (via `performed_by`)

**Indexes**:
- `ix_kiosk_history_kiosk_id`: Fast lookup by kiosk

**Use Case**:
- Audit trail for kiosk management
- Track configuration changes
- Maintenance history

---

### 9. `api_usage_logs` - API Usage Tracking
**Purpose**: Daily usage statistics for API clients (for billing, analytics, quota monitoring).

**Fields**:
- `id` (PK): Log entry ID
- `client_id` (FK → `api_clients.id`): API client
- `date` (DATE): Date of usage
- `request_count` (INTEGER): Total requests
- `successful_calls` (INTEGER): Successful API calls
- `failed_calls` (INTEGER): Failed API calls

**Relationships**:
- Many-to-One → `api_clients` (via `client_id`)

**Indexes**:
- `ix_api_usage_logs_client_id`: Fast lookup by client

**Use Case**:
- Daily usage aggregation
- Billing calculations
- Quota monitoring
- Analytics and reporting

---

### 10. `external_user_mappings` - External User Mapping
**Purpose**: Maps external user IDs (from client systems) to internal user accounts.

**Fields**:
- `id` (PK): Mapping ID
- `client_id` (FK → `api_clients.id`): API client
- `external_user_id` (VARCHAR 100): User ID from client's system
- `internal_user_id` (FK → `users.id`): Internal user account
- `current_image_version_id` (VARCHAR 100): Current user image version (e.g., "v1", "v2")

**Relationships**:
- Many-to-One → `api_clients` (via `client_id`)
- Many-to-One → `users` (via `internal_user_id`)

**Indexes**:
- `ix_external_user_mappings_client_id`: Fast lookup by client
- `ix_external_user_mappings_external_user_id`: Fast lookup by external user ID

**Use Case**:
- External API clients use their own user IDs
- System creates internal user accounts automatically
- Tracks image versioning for external users
- Enables multi-tenant user management

---

## 🛍️ PRODUCT MANAGEMENT ARCHITECTURE

### Hierarchy Flow
```
brands (Brand Master)
    ↓
categories (Category Master)
    ↓
products (Product Catalog)
    ↓
product_images (Product Images)
    ↓
product_attributes (Product Attributes)
    ↓
location_products (Location-Specific Product Assignment)
```

---

## 📦 PRODUCT-RELATED TABLES

### 1. `brands` - Brand Master Data
**Purpose**: Master list of clothing brands.

**Fields**:
- `id` (PK): Brand ID
- `name` (VARCHAR 100, UNIQUE): Brand name (e.g., "Nike", "Adidas")
- `created_at`: Timestamp

**Relationships**:
- One-to-Many → `products` (via `brand_id`)

**Indexes**:
- `brands_name_key` (UNIQUE): Ensures unique brand names

**Use Case**:
- Master brand catalog
- Used for product categorization
- Brand filtering in product search

---

### 2. `categories` - Category Master Data
**Purpose**: Master list of product categories (gender-specific).

**Fields**:
- `id` (PK): Category ID
- `name` (VARCHAR 100): Category name (e.g., "Tops", "Bottoms", "Dresses")
- `gender` (VARCHAR 20): Gender (`male`, `female`, `unisex`)
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- One-to-Many → `products` (via `category_id`)

**Indexes**:
- `ix_categories_id`: Fast lookup by category ID

**Use Case**:
- Product categorization
- Gender-specific category filtering
- Used for VTON mask selection (tops vs bottoms)

---

### 3. `products` - Product Catalog
**Purpose**: Main product catalog with all product information.

**Fields**:
- `id` (PK): Internal product ID
- `product_id` (BIGINT, UNIQUE): External product identifier (from source system)
- `name` (TEXT): Product name
- `brand_id` (FK → `brands.id`): Brand
- `category_id` (FK → `categories.id`): Category
- `mrp` (NUMERIC 10,2): Maximum Retail Price
- `base_colour` (VARCHAR 50): Base color
- `description` (TEXT): Product description
- `material_care` (TEXT): Material and care instructions
- `original_url` (TEXT): Source URL (if scraped)
- `ratings` (NUMERIC 3,2): Product rating (0.00 to 5.00)
- `sizes` (TEXT): Available sizes (JSON array or comma-separated)
- `image_count` (INTEGER): Number of product images
- `first_image_filename` (VARCHAR 255): Primary image filename
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Many-to-One → `brands` (via `brand_id`)
- Many-to-One → `categories` (via `category_id`)
- One-to-Many → `product_images` (via `product_id`)
- One-to-Many → `product_attributes` (via `product_id`)
- One-to-Many → `location_products` (via `product_id`)
- One-to-Many → `vton_job` (via `garment_id`)

**Indexes**:
- `ix_products_product_id` (UNIQUE): Fast lookup by external product_id
- `ix_products_brand_id`: Fast lookup by brand
- `ix_products_category_id`: Fast lookup by category

**Use Case**:
- Main product catalog
- Product search and filtering
- VTON garment selection
- Product details display

---

### 4. `product_images` - Product Images
**Purpose**: Stores all images for each product (multiple images per product).

**Fields**:
- `id` (PK): Image ID
- `product_id` (FK → `products.id`): Product
- `image_filename` (VARCHAR 255): Image filename
- `image_order` (INTEGER): Display order (1, 2, 3, ...)
- `image_path` (TEXT): S3/MinIO storage path
- `is_thumbnail` (BOOLEAN): Whether this is the thumbnail image
- `vton_image` (BOOLEAN): Whether this image is suitable for Virtual Try-On processing
- `file_size` (BIGINT): Image file size in bytes
- `uploaded_at` (TIMESTAMP): Upload timestamp
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `products` (via `product_id`)

**Indexes**:
- `ix_product_images_product_id`: Fast lookup by product

**Use Case**:
- Product image gallery
- Thumbnail selection
- Image ordering for display
- VTON garment image source

---

### 5. `product_attributes` - Product Attributes
**Purpose**: Flexible attribute storage for products (key-value pairs).

**Fields**:
- `id` (PK): Attribute ID
- `product_id` (FK → `products.id`): Product
- `attribute_name` (VARCHAR 100): Attribute name (e.g., "fabric", "fit", "style")
- `attribute_value` (TEXT): Attribute value
- `created_at`: Timestamp

**Relationships**:
- Many-to-One → `products` (via `product_id`)

**Indexes**:
- `ix_product_attributes_product_id`: Fast lookup by product

**Use Case**:
- Flexible product metadata
- Searchable attributes
- Product filtering
- Extended product information

---

### 6. `location_products` - Location-Specific Product Assignment
**Purpose**: Assigns products to specific client locations (multi-tenant product catalog).

**Fields**:
- `id` (PK): Assignment ID
- `location_id` (FK → `client_locations.id`): Location
- `product_id` (FK → `products.id`): Product
- `is_active` (BOOLEAN): Whether product is active at this location
- `custom_price` (NUMERIC 10,2): Location-specific price override
- `display_order` (INTEGER): Display order for this location
- `created_at`, `updated_at`: Timestamps

**Relationships**:
- Many-to-One → `client_locations` (via `location_id`)
- Many-to-One → `products` (via `product_id`)

**Indexes**:
- `ix_location_products_location_id`: Fast lookup by location
- `ix_location_products_product_id`: Fast lookup by product
- `uq_location_product` (UNIQUE): Ensures one product per location (no duplicates)

**Use Case**:
- Multi-tenant product catalog
- Location-specific pricing
- Product availability by location
- Custom product ordering per location
- Kiosk product catalog filtering

---

## 🔗 RELATIONSHIP DIAGRAMS

### Client Hierarchy
```
api_subs_tiers (1)
    ↓ (1:N)
api_clients (N)
    ↓ (1:1)
client_organizations (1)
    ↓ (1:N)
client_locations (N)
    ↓ (1:N)
kiosks (N)
    ↓ (1:N)
kiosk_sessions (N)
```

### Product Hierarchy
```
brands (1)
    ↓ (1:N)
products (N)
    ↓ (1:N)
product_images (N)
product_attributes (N)
location_products (N)
```

### Cross-Relationships
```
client_locations (1)
    ↓ (1:N)
location_products (N)
    ↓ (N:1)
products (1)
```

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: External API Client Flow
```
1. Client authenticates with api_clients (client_id + secret)
2. System checks api_subs_tiers for rate limits
3. External user mapped via external_user_mappings
4. VTON request uses products from catalog
5. Usage logged in api_usage_logs
```

### Example 2: Kiosk Flow
```
1. Kiosk authenticates (kiosks table)
2. Organization identified (client_organizations)
3. Location identified (client_locations)
4. Session created (kiosk_sessions)
5. Products filtered by location (location_products)
6. User uploads image → VTON processed
7. Events logged (kiosk_usage_logs)
```

### Example 3: Product Catalog Flow
```
1. Products stored in products table
2. Images stored in product_images
3. Attributes stored in product_attributes
4. Products assigned to locations (location_products)
5. Kiosks show location-specific catalog
6. VTON uses product images
```

---

## 📋 KEY CONSTRAINTS & BUSINESS RULES

### Client Constraints
- **One API Client → One Organization**: `client_organizations.api_client_id` is UNIQUE
- **One Organization → Many Locations**: Organizations can have multiple locations
- **One Location → Many Kiosks**: Locations can have multiple kiosks
- **One Kiosk → Many Sessions**: Kiosks can have multiple concurrent sessions

### Product Constraints
- **One Product → One Brand**: Products belong to one brand
- **One Product → One Category**: Products belong to one category
- **One Product → Many Images**: Products can have multiple images
- **One Location → One Product Assignment**: `uq_location_product` ensures uniqueness

### Data Integrity
- **Cascade Deletes**: 
  - Deleting `client_organizations` → deletes `client_locations`
  - Deleting `client_locations` → deletes `location_products`
  - Deleting `products` → deletes `product_images`, `product_attributes`, `location_products`
  - Deleting `users` → deletes `external_user_mappings`, `flux_mask_table`, `qwen_mask_table`

---

## 🎯 USE CASES BY TABLE

### Client Management
- **api_subs_tiers**: Define subscription plans
- **api_clients**: Manage API credentials and authentication
- **client_organizations**: Store B2B organization details
- **client_locations**: Multi-location support
- **kiosks**: Physical device management
- **kiosk_sessions**: User session tracking
- **kiosk_usage_logs**: Analytics and monitoring
- **api_usage_logs**: Usage tracking and billing

### Product Management
- **brands**: Brand master data
- **categories**: Category master data
- **products**: Main product catalog
- **product_images**: Product image gallery
- **product_attributes**: Flexible product metadata
- **location_products**: Multi-tenant product assignment

### User Management
- **external_user_mappings**: Map external users to internal accounts
- **users**: Internal user accounts (referenced but not detailed here)

---

## 🔍 QUERY PATTERNS

### Get Products for a Location
```sql
SELECT p.*, pi.image_filename, pi.minio_path
FROM products p
JOIN location_products lp ON p.id = lp.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_thumbnail = true
WHERE lp.location_id = ? AND lp.is_active = true
ORDER BY lp.display_order;
```

### Get Client Rate Limits
```sql
SELECT 
    ac.client_id,
    ast.rate_limit_rpm as tier_rpm,
    ast.daily_quota as tier_daily,
    COALESCE((ac.config::json->>'rate_limit_rpm')::int, ast.rate_limit_rpm) as final_rpm,
    COALESCE((ac.config::json->>'daily_quota')::int, ast.daily_quota) as final_daily
FROM api_clients ac
JOIN api_subs_tiers ast ON ac.tier_id = ast.id
WHERE ac.client_id = ?;
```

### Get Kiosk Session with Organization
```sql
SELECT 
    ks.*,
    co.display_name as org_name,
    cl.name as location_name,
    k.kiosk_id
FROM kiosk_sessions ks
JOIN client_organizations co ON ks.client_org_id = co.id
JOIN client_locations cl ON ks.location_id = cl.id
JOIN kiosks k ON ks.kiosk_id = k.id
WHERE ks.session_id = ?;
```

---

## 📊 SUMMARY

### Client Architecture (9 tables)
1. **Subscription Management**: `api_subs_tiers`
2. **Authentication**: `api_clients`
3. **Organization**: `client_organizations`
4. **Locations**: `client_locations`
5. **Devices**: `kiosks`
6. **Sessions**: `kiosk_sessions`
7. **Analytics**: `kiosk_usage_logs`, `api_usage_logs`
8. **History**: `kiosk_history`
9. **User Mapping**: `external_user_mappings`

### Product Architecture (6 tables)
1. **Master Data**: `brands`, `categories`
2. **Catalog**: `products`
3. **Media**: `product_images`
4. **Metadata**: `product_attributes`
5. **Multi-Tenant**: `location_products`

### Key Features
- ✅ Multi-tenant architecture (organizations → locations → kiosks)
- ✅ Flexible subscription tiers with overrides
- ✅ Location-specific product catalogs
- ✅ Comprehensive usage tracking
- ✅ External API user mapping
- ✅ Audit trails and history

---

*Last Updated: 2026-01-12*

