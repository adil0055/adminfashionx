--
-- PostgreSQL database dump
--

\restrict 5cI7yt133uG6bvHF1CFqxV7k1ANP57cKSzBUVJKHUlXTBOSPk3kzzRWeuRCP1gq

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vton_job DROP CONSTRAINT IF EXISTS vton_job_kiosk_id_fkey;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.skin_tone DROP CONSTRAINT IF EXISTS skin_tone_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.qwen_mask_table DROP CONSTRAINT IF EXISTS qwen_mask_table_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_brand_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.product_attributes DROP CONSTRAINT IF EXISTS product_attributes_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pending_vton_requests DROP CONSTRAINT IF EXISTS pending_vton_requests_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.measurements DROP CONSTRAINT IF EXISTS measurements_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.location_products DROP CONSTRAINT IF EXISTS location_products_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.location_products DROP CONSTRAINT IF EXISTS location_products_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosks DROP CONSTRAINT IF EXISTS kiosks_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosks DROP CONSTRAINT IF EXISTS kiosks_client_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_usage_logs DROP CONSTRAINT IF EXISTS kiosk_usage_logs_session_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_usage_logs DROP CONSTRAINT IF EXISTS kiosk_usage_logs_kiosk_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_usage_logs DROP CONSTRAINT IF EXISTS kiosk_usage_logs_client_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_sessions DROP CONSTRAINT IF EXISTS kiosk_sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_sessions DROP CONSTRAINT IF EXISTS kiosk_sessions_location_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_sessions DROP CONSTRAINT IF EXISTS kiosk_sessions_kiosk_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_sessions DROP CONSTRAINT IF EXISTS kiosk_sessions_client_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_history DROP CONSTRAINT IF EXISTS kiosk_history_performed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_history DROP CONSTRAINT IF EXISTS kiosk_history_kiosk_id_fkey;
ALTER TABLE IF EXISTS ONLY public.flux_mask_table DROP CONSTRAINT IF EXISTS flux_mask_table_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.external_user_mappings DROP CONSTRAINT IF EXISTS external_user_mappings_internal_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.external_user_mappings DROP CONSTRAINT IF EXISTS external_user_mappings_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.client_organizations DROP CONSTRAINT IF EXISTS client_organizations_api_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.client_locations DROP CONSTRAINT IF EXISTS client_locations_client_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_admin_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.api_usage_logs DROP CONSTRAINT IF EXISTS api_usage_logs_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.api_clients DROP CONSTRAINT IF EXISTS api_clients_tier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_id_fkey;
DROP INDEX IF EXISTS public.ix_vton_job_user_id;
DROP INDEX IF EXISTS public.ix_vton_job_session_id;
DROP INDEX IF EXISTS public.ix_vton_job_kiosk_id;
DROP INDEX IF EXISTS public.ix_vton_job_job_id;
DROP INDEX IF EXISTS public.ix_vton_job_id;
DROP INDEX IF EXISTS public.ix_vton_job_garment_id;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_system_config_key;
DROP INDEX IF EXISTS public.ix_system_config_id;
DROP INDEX IF EXISTS public.ix_skin_tone_user_id;
DROP INDEX IF EXISTS public.ix_skin_tone_id;
DROP INDEX IF EXISTS public.ix_qwen_mask_table_user_id;
DROP INDEX IF EXISTS public.ix_qwen_mask_table_id;
DROP INDEX IF EXISTS public.ix_products_product_id;
DROP INDEX IF EXISTS public.ix_products_id;
DROP INDEX IF EXISTS public.ix_products_category_id;
DROP INDEX IF EXISTS public.ix_products_brand_id;
DROP INDEX IF EXISTS public.ix_product_images_product_id;
DROP INDEX IF EXISTS public.ix_product_images_id;
DROP INDEX IF EXISTS public.ix_product_attributes_product_id;
DROP INDEX IF EXISTS public.ix_product_attributes_id;
DROP INDEX IF EXISTS public.ix_pending_vton_requests_user_id;
DROP INDEX IF EXISTS public.ix_pending_vton_requests_session_id;
DROP INDEX IF EXISTS public.ix_pending_vton_requests_id;
DROP INDEX IF EXISTS public.ix_measurements_user_id;
DROP INDEX IF EXISTS public.ix_measurements_measurement_id;
DROP INDEX IF EXISTS public.ix_location_products_product_id;
DROP INDEX IF EXISTS public.ix_location_products_location_id;
DROP INDEX IF EXISTS public.ix_location_products_id;
DROP INDEX IF EXISTS public.ix_kiosks_location_id;
DROP INDEX IF EXISTS public.ix_kiosks_kiosk_id;
DROP INDEX IF EXISTS public.ix_kiosks_id;
DROP INDEX IF EXISTS public.ix_kiosks_client_org_id;
DROP INDEX IF EXISTS public.ix_kiosk_usage_logs_session_id;
DROP INDEX IF EXISTS public.ix_kiosk_usage_logs_kiosk_id;
DROP INDEX IF EXISTS public.ix_kiosk_usage_logs_id;
DROP INDEX IF EXISTS public.ix_kiosk_usage_logs_created_at;
DROP INDEX IF EXISTS public.ix_kiosk_usage_logs_client_org_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_user_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_session_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_location_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_kiosk_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_id;
DROP INDEX IF EXISTS public.ix_kiosk_sessions_client_org_id;
DROP INDEX IF EXISTS public.ix_kiosk_history_kiosk_id;
DROP INDEX IF EXISTS public.ix_kiosk_history_id;
DROP INDEX IF EXISTS public.ix_flux_mask_table_user_id;
DROP INDEX IF EXISTS public.ix_flux_mask_table_request_id;
DROP INDEX IF EXISTS public.ix_flux_mask_table_id;
DROP INDEX IF EXISTS public.ix_external_user_mappings_id;
DROP INDEX IF EXISTS public.ix_external_user_mappings_external_user_id;
DROP INDEX IF EXISTS public.ix_external_user_mappings_client_id;
DROP INDEX IF EXISTS public.ix_client_organizations_id;
DROP INDEX IF EXISTS public.ix_client_organizations_api_client_id;
DROP INDEX IF EXISTS public.ix_client_locations_id;
DROP INDEX IF EXISTS public.ix_client_locations_client_org_id;
DROP INDEX IF EXISTS public.ix_categories_id;
DROP INDEX IF EXISTS public.ix_brands_id;
DROP INDEX IF EXISTS public.ix_audit_logs_id;
DROP INDEX IF EXISTS public.ix_audit_logs_created_at;
DROP INDEX IF EXISTS public.ix_audit_logs_admin_user_id;
DROP INDEX IF EXISTS public.ix_api_usage_logs_id;
DROP INDEX IF EXISTS public.ix_api_usage_logs_client_id;
DROP INDEX IF EXISTS public.ix_api_subs_tiers_id;
DROP INDEX IF EXISTS public.ix_api_clients_id;
DROP INDEX IF EXISTS public.ix_api_clients_client_id;
DROP INDEX IF EXISTS public.ix_admin_users_role_id;
DROP INDEX IF EXISTS public.ix_admin_users_id;
DROP INDEX IF EXISTS public.ix_admin_users_email;
DROP INDEX IF EXISTS public.ix_admin_roles_id;
ALTER TABLE IF EXISTS ONLY public.vton_job DROP CONSTRAINT IF EXISTS vton_job_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.location_products DROP CONSTRAINT IF EXISTS uq_location_product;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_pkey;
ALTER TABLE IF EXISTS ONLY public.skin_tone DROP CONSTRAINT IF EXISTS skin_tone_pkey;
ALTER TABLE IF EXISTS ONLY public.qwen_mask_table DROP CONSTRAINT IF EXISTS qwen_mask_table_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.product_images DROP CONSTRAINT IF EXISTS product_images_pkey;
ALTER TABLE IF EXISTS ONLY public.product_attributes DROP CONSTRAINT IF EXISTS product_attributes_pkey;
ALTER TABLE IF EXISTS ONLY public.pending_vton_requests DROP CONSTRAINT IF EXISTS pending_vton_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.measurements DROP CONSTRAINT IF EXISTS measurements_pkey;
ALTER TABLE IF EXISTS ONLY public.location_products DROP CONSTRAINT IF EXISTS location_products_pkey;
ALTER TABLE IF EXISTS ONLY public.kiosks DROP CONSTRAINT IF EXISTS kiosks_pkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_usage_logs DROP CONSTRAINT IF EXISTS kiosk_usage_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_sessions DROP CONSTRAINT IF EXISTS kiosk_sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.kiosk_history DROP CONSTRAINT IF EXISTS kiosk_history_pkey;
ALTER TABLE IF EXISTS ONLY public.flux_mask_table DROP CONSTRAINT IF EXISTS flux_mask_table_pkey;
ALTER TABLE IF EXISTS ONLY public.external_user_mappings DROP CONSTRAINT IF EXISTS external_user_mappings_pkey;
ALTER TABLE IF EXISTS ONLY public.client_organizations DROP CONSTRAINT IF EXISTS client_organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.client_locations DROP CONSTRAINT IF EXISTS client_locations_pkey;
ALTER TABLE IF EXISTS ONLY public.categories DROP CONSTRAINT IF EXISTS categories_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_pkey;
ALTER TABLE IF EXISTS ONLY public.brands DROP CONSTRAINT IF EXISTS brands_name_key;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.api_usage_logs DROP CONSTRAINT IF EXISTS api_usage_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.api_subs_tiers DROP CONSTRAINT IF EXISTS api_subs_tiers_pkey;
ALTER TABLE IF EXISTS ONLY public.api_clients DROP CONSTRAINT IF EXISTS api_clients_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_roles DROP CONSTRAINT IF EXISTS admin_roles_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_roles DROP CONSTRAINT IF EXISTS admin_roles_name_key;
ALTER TABLE IF EXISTS public.vton_job ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_config ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.skin_tone ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.qwen_mask_table ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_images ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.product_attributes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.pending_vton_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.measurements ALTER COLUMN measurement_id DROP DEFAULT;
ALTER TABLE IF EXISTS public.location_products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kiosks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kiosk_usage_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kiosk_sessions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kiosk_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.flux_mask_table ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.external_user_mappings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.client_organizations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.client_locations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.categories ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.brands ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.api_usage_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.api_subs_tiers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.api_clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admin_users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.admin_roles ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vton_job_id_seq;
DROP TABLE IF EXISTS public.vton_job;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.system_config_id_seq;
DROP TABLE IF EXISTS public.system_config;
DROP SEQUENCE IF EXISTS public.skin_tone_id_seq;
DROP TABLE IF EXISTS public.skin_tone;
DROP SEQUENCE IF EXISTS public.qwen_mask_table_id_seq;
DROP TABLE IF EXISTS public.qwen_mask_table;
DROP SEQUENCE IF EXISTS public.products_id_seq;
DROP TABLE IF EXISTS public.products;
DROP SEQUENCE IF EXISTS public.product_images_id_seq;
DROP TABLE IF EXISTS public.product_images;
DROP SEQUENCE IF EXISTS public.product_attributes_id_seq;
DROP TABLE IF EXISTS public.product_attributes;
DROP SEQUENCE IF EXISTS public.pending_vton_requests_id_seq;
DROP TABLE IF EXISTS public.pending_vton_requests;
DROP SEQUENCE IF EXISTS public.measurements_measurement_id_seq;
DROP TABLE IF EXISTS public.measurements;
DROP SEQUENCE IF EXISTS public.location_products_id_seq;
DROP TABLE IF EXISTS public.location_products;
DROP SEQUENCE IF EXISTS public.kiosks_id_seq;
DROP TABLE IF EXISTS public.kiosks;
DROP SEQUENCE IF EXISTS public.kiosk_usage_logs_id_seq;
DROP TABLE IF EXISTS public.kiosk_usage_logs;
DROP SEQUENCE IF EXISTS public.kiosk_sessions_id_seq;
DROP TABLE IF EXISTS public.kiosk_sessions;
DROP SEQUENCE IF EXISTS public.kiosk_history_id_seq;
DROP TABLE IF EXISTS public.kiosk_history;
DROP SEQUENCE IF EXISTS public.flux_mask_table_id_seq;
DROP TABLE IF EXISTS public.flux_mask_table;
DROP SEQUENCE IF EXISTS public.external_user_mappings_id_seq;
DROP TABLE IF EXISTS public.external_user_mappings;
DROP SEQUENCE IF EXISTS public.client_organizations_id_seq;
DROP TABLE IF EXISTS public.client_organizations;
DROP SEQUENCE IF EXISTS public.client_locations_id_seq;
DROP TABLE IF EXISTS public.client_locations;
DROP SEQUENCE IF EXISTS public.categories_id_seq;
DROP TABLE IF EXISTS public.categories;
DROP SEQUENCE IF EXISTS public.brands_id_seq;
DROP TABLE IF EXISTS public.brands;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.api_usage_logs_id_seq;
DROP TABLE IF EXISTS public.api_usage_logs;
DROP SEQUENCE IF EXISTS public.api_subs_tiers_id_seq;
DROP TABLE IF EXISTS public.api_subs_tiers;
DROP SEQUENCE IF EXISTS public.api_clients_id_seq;
DROP TABLE IF EXISTS public.api_clients;
DROP SEQUENCE IF EXISTS public.admin_users_id_seq;
DROP TABLE IF EXISTS public.admin_users;
DROP SEQUENCE IF EXISTS public.admin_roles_id_seq;
DROP TABLE IF EXISTS public.admin_roles;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(255),
    color character varying(7),
    permissions text NOT NULL,
    is_system boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_roles_id_seq OWNED BY public.admin_roles.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    role_id integer,
    status character varying(20),
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: api_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_clients (
    id integer NOT NULL,
    client_id character varying(64) NOT NULL,
    client_secret_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    callback_url character varying(500),
    status character varying(20),
    tier_id integer,
    config text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: api_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_clients_id_seq OWNED BY public.api_clients.id;


--
-- Name: api_subs_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_subs_tiers (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    daily_quota integer NOT NULL,
    monthly_quota integer NOT NULL,
    rate_limit_rpm integer NOT NULL,
    price_monthly numeric(10,2),
    period character varying(20),
    description character varying(255),
    features text,
    recommended boolean,
    color character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: api_subs_tiers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_subs_tiers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_subs_tiers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_subs_tiers_id_seq OWNED BY public.api_subs_tiers.id;


--
-- Name: api_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_usage_logs (
    id integer NOT NULL,
    client_id integer NOT NULL,
    date timestamp without time zone NOT NULL,
    request_count integer,
    successful_calls integer,
    failed_calls integer
);


--
-- Name: api_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_usage_logs_id_seq OWNED BY public.api_usage_logs.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    admin_user_id integer,
    action character varying(100) NOT NULL,
    resource_type character varying(50),
    resource_id character varying(100),
    details text,
    ip_address character varying(45),
    user_agent character varying(255),
    status character varying(20),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    gender character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: client_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_locations (
    id integer NOT NULL,
    client_org_id integer NOT NULL,
    name character varying(100) NOT NULL,
    address text,
    is_primary boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_locations_id_seq OWNED BY public.client_locations.id;


--
-- Name: client_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_organizations (
    id integer NOT NULL,
    api_client_id integer NOT NULL,
    display_name character varying(100) NOT NULL,
    client_type character varying(20) NOT NULL,
    logo_url character varying(500),
    timezone character varying(50),
    hq_address text,
    contact_email character varying(255),
    contact_phone character varying(50),
    billing_plan character varying(50),
    image_specs text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: client_organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.client_organizations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: client_organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.client_organizations_id_seq OWNED BY public.client_organizations.id;


--
-- Name: external_user_mappings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_user_mappings (
    id integer NOT NULL,
    client_id integer NOT NULL,
    external_user_id character varying(100) NOT NULL,
    internal_user_id integer,
    current_image_version_id character varying(100)
);


--
-- Name: external_user_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.external_user_mappings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_user_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.external_user_mappings_id_seq OWNED BY public.external_user_mappings.id;


--
-- Name: flux_mask_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flux_mask_table (
    id integer NOT NULL,
    user_id integer NOT NULL,
    request_id character varying(100) NOT NULL,
    status character varying(50) NOT NULL,
    gender character varying(10),
    mask_paths text,
    error_message text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flux_mask_table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.flux_mask_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: flux_mask_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.flux_mask_table_id_seq OWNED BY public.flux_mask_table.id;


--
-- Name: kiosk_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kiosk_history (
    id integer NOT NULL,
    kiosk_id integer NOT NULL,
    event_type character varying(50) NOT NULL,
    details text,
    performed_by integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: kiosk_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kiosk_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kiosk_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kiosk_history_id_seq OWNED BY public.kiosk_history.id;


--
-- Name: kiosk_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kiosk_sessions (
    id integer NOT NULL,
    session_id character varying(100) NOT NULL,
    kiosk_id integer NOT NULL,
    client_org_id integer NOT NULL,
    location_id integer,
    user_id integer,
    age integer,
    height double precision,
    status character varying(20) NOT NULL,
    current_step character varying(50),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    completed_at timestamp with time zone
);


--
-- Name: kiosk_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kiosk_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kiosk_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kiosk_sessions_id_seq OWNED BY public.kiosk_sessions.id;


--
-- Name: kiosk_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kiosk_usage_logs (
    id integer NOT NULL,
    kiosk_id integer NOT NULL,
    client_org_id integer NOT NULL,
    session_id character varying(100),
    event_type character varying(50) NOT NULL,
    metadata_json text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: kiosk_usage_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kiosk_usage_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kiosk_usage_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kiosk_usage_logs_id_seq OWNED BY public.kiosk_usage_logs.id;


--
-- Name: kiosks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kiosks (
    id integer NOT NULL,
    kiosk_id character varying(50) NOT NULL,
    client_org_id integer,
    location_id integer,
    status character varying(30),
    version character varying(20),
    last_heartbeat timestamp with time zone,
    warehouse_location character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: kiosks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kiosks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kiosks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kiosks_id_seq OWNED BY public.kiosks.id;


--
-- Name: location_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.location_products (
    id integer NOT NULL,
    location_id integer NOT NULL,
    product_id integer NOT NULL,
    is_active boolean NOT NULL,
    custom_price numeric(10,2),
    display_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: location_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.location_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: location_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.location_products_id_seq OWNED BY public.location_products.id;


--
-- Name: measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.measurements (
    measurement_id integer NOT NULL,
    user_id integer NOT NULL,
    measurements text,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: measurements_measurement_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.measurements_measurement_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: measurements_measurement_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.measurements_measurement_id_seq OWNED BY public.measurements.measurement_id;


--
-- Name: pending_vton_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_vton_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    session_id character varying(100) NOT NULL,
    product_ids text NOT NULL,
    top_k integer,
    status character varying(50) NOT NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone
);


--
-- Name: pending_vton_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pending_vton_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pending_vton_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pending_vton_requests_id_seq OWNED BY public.pending_vton_requests.id;


--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_attributes (
    id integer NOT NULL,
    product_id integer NOT NULL,
    attribute_name character varying(100) NOT NULL,
    attribute_value text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: product_attributes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_attributes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_attributes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_attributes_id_seq OWNED BY public.product_attributes.id;


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_filename character varying(255) NOT NULL,
    image_order integer NOT NULL,
    image_path text,
    is_thumbnail boolean NOT NULL,
    file_size bigint,
    uploaded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    vton_image boolean DEFAULT false NOT NULL
);


--
-- Name: COLUMN product_images.image_path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_images.image_path IS 'S3/MinIO storage path for the product image';


--
-- Name: COLUMN product_images.vton_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.product_images.vton_image IS 'Marks images suitable for Virtual Try-On processing';


--
-- Name: product_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    product_id bigint NOT NULL,
    name text NOT NULL,
    brand_id integer,
    category_id integer,
    mrp numeric(10,2),
    base_colour character varying(50),
    description text,
    material_care text,
    original_url text,
    ratings numeric(3,2),
    sizes text,
    image_count integer NOT NULL,
    first_image_filename character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: qwen_mask_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.qwen_mask_table (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status character varying(50) NOT NULL,
    original_image text,
    upper_body_output_path text,
    lower_body_output_path text,
    error_message text,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: qwen_mask_table_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.qwen_mask_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: qwen_mask_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.qwen_mask_table_id_seq OWNED BY public.qwen_mask_table.id;


--
-- Name: skin_tone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.skin_tone (
    id integer NOT NULL,
    user_id integer NOT NULL,
    detected_hex character varying(7),
    matched_tone_hex character varying(7) NOT NULL,
    delta_e_distance double precision,
    color_palette character varying(500),
    region_type character varying(20),
    image_url character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: skin_tone_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.skin_tone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: skin_tone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.skin_tone_id_seq OWNED BY public.skin_tone.id;


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    updated_by integer,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: system_config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_config_id_seq OWNED BY public.system_config.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    name character varying NOT NULL,
    hashed_password character varying NOT NULL,
    gender character varying,
    age integer,
    height double precision,
    weight double precision,
    image_url character varying,
    skin_tone character varying(50),
    initial_style_vector_generated boolean NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vton_job; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vton_job (
    id integer NOT NULL,
    job_id character varying(100) NOT NULL,
    user_id character varying(50) NOT NULL,
    garment_id integer NOT NULL,
    status character varying(50) NOT NULL,
    output_image_url text,
    error_message text,
    session_id character varying(100),
    kiosk_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vton_job_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vton_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vton_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vton_job_id_seq OWNED BY public.vton_job.id;


--
-- Name: admin_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles ALTER COLUMN id SET DEFAULT nextval('public.admin_roles_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: api_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients ALTER COLUMN id SET DEFAULT nextval('public.api_clients_id_seq'::regclass);


--
-- Name: api_subs_tiers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_subs_tiers ALTER COLUMN id SET DEFAULT nextval('public.api_subs_tiers_id_seq'::regclass);


--
-- Name: api_usage_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.api_usage_logs_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: client_locations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations ALTER COLUMN id SET DEFAULT nextval('public.client_locations_id_seq'::regclass);


--
-- Name: client_organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_organizations ALTER COLUMN id SET DEFAULT nextval('public.client_organizations_id_seq'::regclass);


--
-- Name: external_user_mappings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_user_mappings ALTER COLUMN id SET DEFAULT nextval('public.external_user_mappings_id_seq'::regclass);


--
-- Name: flux_mask_table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flux_mask_table ALTER COLUMN id SET DEFAULT nextval('public.flux_mask_table_id_seq'::regclass);


--
-- Name: kiosk_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_history ALTER COLUMN id SET DEFAULT nextval('public.kiosk_history_id_seq'::regclass);


--
-- Name: kiosk_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions ALTER COLUMN id SET DEFAULT nextval('public.kiosk_sessions_id_seq'::regclass);


--
-- Name: kiosk_usage_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_usage_logs ALTER COLUMN id SET DEFAULT nextval('public.kiosk_usage_logs_id_seq'::regclass);


--
-- Name: kiosks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosks ALTER COLUMN id SET DEFAULT nextval('public.kiosks_id_seq'::regclass);


--
-- Name: location_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_products ALTER COLUMN id SET DEFAULT nextval('public.location_products_id_seq'::regclass);


--
-- Name: measurements measurement_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurements ALTER COLUMN measurement_id SET DEFAULT nextval('public.measurements_measurement_id_seq'::regclass);


--
-- Name: pending_vton_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_vton_requests ALTER COLUMN id SET DEFAULT nextval('public.pending_vton_requests_id_seq'::regclass);


--
-- Name: product_attributes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes ALTER COLUMN id SET DEFAULT nextval('public.product_attributes_id_seq'::regclass);


--
-- Name: product_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: qwen_mask_table id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qwen_mask_table ALTER COLUMN id SET DEFAULT nextval('public.qwen_mask_table_id_seq'::regclass);


--
-- Name: skin_tone id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skin_tone ALTER COLUMN id SET DEFAULT nextval('public.skin_tone_id_seq'::regclass);


--
-- Name: system_config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config ALTER COLUMN id SET DEFAULT nextval('public.system_config_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vton_job id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vton_job ALTER COLUMN id SET DEFAULT nextval('public.vton_job_id_seq'::regclass);


--
-- Name: admin_roles admin_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_name_key UNIQUE (name);


--
-- Name: admin_roles admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_roles
    ADD CONSTRAINT admin_roles_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: api_clients api_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT api_clients_pkey PRIMARY KEY (id);


--
-- Name: api_subs_tiers api_subs_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_subs_tiers
    ADD CONSTRAINT api_subs_tiers_pkey PRIMARY KEY (id);


--
-- Name: api_usage_logs api_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: brands brands_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_name_key UNIQUE (name);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: client_locations client_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations
    ADD CONSTRAINT client_locations_pkey PRIMARY KEY (id);


--
-- Name: client_organizations client_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_organizations
    ADD CONSTRAINT client_organizations_pkey PRIMARY KEY (id);


--
-- Name: external_user_mappings external_user_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_user_mappings
    ADD CONSTRAINT external_user_mappings_pkey PRIMARY KEY (id);


--
-- Name: flux_mask_table flux_mask_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flux_mask_table
    ADD CONSTRAINT flux_mask_table_pkey PRIMARY KEY (id);


--
-- Name: kiosk_history kiosk_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_history
    ADD CONSTRAINT kiosk_history_pkey PRIMARY KEY (id);


--
-- Name: kiosk_sessions kiosk_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions
    ADD CONSTRAINT kiosk_sessions_pkey PRIMARY KEY (id);


--
-- Name: kiosk_usage_logs kiosk_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_usage_logs
    ADD CONSTRAINT kiosk_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: kiosks kiosks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosks
    ADD CONSTRAINT kiosks_pkey PRIMARY KEY (id);


--
-- Name: location_products location_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_products
    ADD CONSTRAINT location_products_pkey PRIMARY KEY (id);


--
-- Name: measurements measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurements
    ADD CONSTRAINT measurements_pkey PRIMARY KEY (measurement_id);


--
-- Name: pending_vton_requests pending_vton_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_vton_requests
    ADD CONSTRAINT pending_vton_requests_pkey PRIMARY KEY (id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: qwen_mask_table qwen_mask_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qwen_mask_table
    ADD CONSTRAINT qwen_mask_table_pkey PRIMARY KEY (id);


--
-- Name: skin_tone skin_tone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skin_tone
    ADD CONSTRAINT skin_tone_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: location_products uq_location_product; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_products
    ADD CONSTRAINT uq_location_product UNIQUE (location_id, product_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vton_job vton_job_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vton_job
    ADD CONSTRAINT vton_job_pkey PRIMARY KEY (id);


--
-- Name: ix_admin_roles_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_admin_roles_id ON public.admin_roles USING btree (id);


--
-- Name: ix_admin_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_admin_users_email ON public.admin_users USING btree (email);


--
-- Name: ix_admin_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_admin_users_id ON public.admin_users USING btree (id);


--
-- Name: ix_admin_users_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_admin_users_role_id ON public.admin_users USING btree (role_id);


--
-- Name: ix_api_clients_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_api_clients_client_id ON public.api_clients USING btree (client_id);


--
-- Name: ix_api_clients_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_clients_id ON public.api_clients USING btree (id);


--
-- Name: ix_api_subs_tiers_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_subs_tiers_id ON public.api_subs_tiers USING btree (id);


--
-- Name: ix_api_usage_logs_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_usage_logs_client_id ON public.api_usage_logs USING btree (client_id);


--
-- Name: ix_api_usage_logs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_api_usage_logs_id ON public.api_usage_logs USING btree (id);


--
-- Name: ix_audit_logs_admin_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_audit_logs_admin_user_id ON public.audit_logs USING btree (admin_user_id);


--
-- Name: ix_audit_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_audit_logs_created_at ON public.audit_logs USING btree (created_at);


--
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_brands_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_brands_id ON public.brands USING btree (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_client_locations_client_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_client_locations_client_org_id ON public.client_locations USING btree (client_org_id);


--
-- Name: ix_client_locations_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_client_locations_id ON public.client_locations USING btree (id);


--
-- Name: ix_client_organizations_api_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_client_organizations_api_client_id ON public.client_organizations USING btree (api_client_id);


--
-- Name: ix_client_organizations_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_client_organizations_id ON public.client_organizations USING btree (id);


--
-- Name: ix_external_user_mappings_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_external_user_mappings_client_id ON public.external_user_mappings USING btree (client_id);


--
-- Name: ix_external_user_mappings_external_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_external_user_mappings_external_user_id ON public.external_user_mappings USING btree (external_user_id);


--
-- Name: ix_external_user_mappings_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_external_user_mappings_id ON public.external_user_mappings USING btree (id);


--
-- Name: ix_flux_mask_table_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flux_mask_table_id ON public.flux_mask_table USING btree (id);


--
-- Name: ix_flux_mask_table_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_flux_mask_table_request_id ON public.flux_mask_table USING btree (request_id);


--
-- Name: ix_flux_mask_table_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_flux_mask_table_user_id ON public.flux_mask_table USING btree (user_id);


--
-- Name: ix_kiosk_history_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_history_id ON public.kiosk_history USING btree (id);


--
-- Name: ix_kiosk_history_kiosk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_history_kiosk_id ON public.kiosk_history USING btree (kiosk_id);


--
-- Name: ix_kiosk_sessions_client_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_sessions_client_org_id ON public.kiosk_sessions USING btree (client_org_id);


--
-- Name: ix_kiosk_sessions_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_sessions_id ON public.kiosk_sessions USING btree (id);


--
-- Name: ix_kiosk_sessions_kiosk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_sessions_kiosk_id ON public.kiosk_sessions USING btree (kiosk_id);


--
-- Name: ix_kiosk_sessions_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_sessions_location_id ON public.kiosk_sessions USING btree (location_id);


--
-- Name: ix_kiosk_sessions_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_kiosk_sessions_session_id ON public.kiosk_sessions USING btree (session_id);


--
-- Name: ix_kiosk_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_sessions_user_id ON public.kiosk_sessions USING btree (user_id);


--
-- Name: ix_kiosk_usage_logs_client_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_usage_logs_client_org_id ON public.kiosk_usage_logs USING btree (client_org_id);


--
-- Name: ix_kiosk_usage_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_usage_logs_created_at ON public.kiosk_usage_logs USING btree (created_at);


--
-- Name: ix_kiosk_usage_logs_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_usage_logs_id ON public.kiosk_usage_logs USING btree (id);


--
-- Name: ix_kiosk_usage_logs_kiosk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_usage_logs_kiosk_id ON public.kiosk_usage_logs USING btree (kiosk_id);


--
-- Name: ix_kiosk_usage_logs_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosk_usage_logs_session_id ON public.kiosk_usage_logs USING btree (session_id);


--
-- Name: ix_kiosks_client_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosks_client_org_id ON public.kiosks USING btree (client_org_id);


--
-- Name: ix_kiosks_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosks_id ON public.kiosks USING btree (id);


--
-- Name: ix_kiosks_kiosk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_kiosks_kiosk_id ON public.kiosks USING btree (kiosk_id);


--
-- Name: ix_kiosks_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_kiosks_location_id ON public.kiosks USING btree (location_id);


--
-- Name: ix_location_products_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_location_products_id ON public.location_products USING btree (id);


--
-- Name: ix_location_products_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_location_products_location_id ON public.location_products USING btree (location_id);


--
-- Name: ix_location_products_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_location_products_product_id ON public.location_products USING btree (product_id);


--
-- Name: ix_measurements_measurement_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_measurements_measurement_id ON public.measurements USING btree (measurement_id);


--
-- Name: ix_measurements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_measurements_user_id ON public.measurements USING btree (user_id);


--
-- Name: ix_pending_vton_requests_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pending_vton_requests_id ON public.pending_vton_requests USING btree (id);


--
-- Name: ix_pending_vton_requests_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pending_vton_requests_session_id ON public.pending_vton_requests USING btree (session_id);


--
-- Name: ix_pending_vton_requests_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pending_vton_requests_user_id ON public.pending_vton_requests USING btree (user_id);


--
-- Name: ix_product_attributes_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_attributes_id ON public.product_attributes USING btree (id);


--
-- Name: ix_product_attributes_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_attributes_product_id ON public.product_attributes USING btree (product_id);


--
-- Name: ix_product_images_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_images_id ON public.product_images USING btree (id);


--
-- Name: ix_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_product_images_product_id ON public.product_images USING btree (product_id);


--
-- Name: ix_products_brand_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_brand_id ON public.products USING btree (brand_id);


--
-- Name: ix_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_category_id ON public.products USING btree (category_id);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_products_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_products_product_id ON public.products USING btree (product_id);


--
-- Name: ix_qwen_mask_table_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_qwen_mask_table_id ON public.qwen_mask_table USING btree (id);


--
-- Name: ix_qwen_mask_table_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_qwen_mask_table_user_id ON public.qwen_mask_table USING btree (user_id);


--
-- Name: ix_skin_tone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_skin_tone_id ON public.skin_tone USING btree (id);


--
-- Name: ix_skin_tone_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_skin_tone_user_id ON public.skin_tone USING btree (user_id);


--
-- Name: ix_system_config_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_system_config_id ON public.system_config USING btree (id);


--
-- Name: ix_system_config_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_system_config_key ON public.system_config USING btree (key);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_vton_job_garment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_garment_id ON public.vton_job USING btree (garment_id);


--
-- Name: ix_vton_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_id ON public.vton_job USING btree (id);


--
-- Name: ix_vton_job_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_job_id ON public.vton_job USING btree (job_id);


--
-- Name: ix_vton_job_kiosk_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_kiosk_id ON public.vton_job USING btree (kiosk_id);


--
-- Name: ix_vton_job_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_session_id ON public.vton_job USING btree (session_id);


--
-- Name: ix_vton_job_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vton_job_user_id ON public.vton_job USING btree (user_id);


--
-- Name: admin_users admin_users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.admin_roles(id);


--
-- Name: api_clients api_clients_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_clients
    ADD CONSTRAINT api_clients_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.api_subs_tiers(id);


--
-- Name: api_usage_logs api_usage_logs_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.api_clients(id);


--
-- Name: audit_logs audit_logs_admin_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id);


--
-- Name: client_locations client_locations_client_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_locations
    ADD CONSTRAINT client_locations_client_org_id_fkey FOREIGN KEY (client_org_id) REFERENCES public.client_organizations(id) ON DELETE CASCADE;


--
-- Name: client_organizations client_organizations_api_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_organizations
    ADD CONSTRAINT client_organizations_api_client_id_fkey FOREIGN KEY (api_client_id) REFERENCES public.api_clients(id);


--
-- Name: external_user_mappings external_user_mappings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_user_mappings
    ADD CONSTRAINT external_user_mappings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.api_clients(id);


--
-- Name: external_user_mappings external_user_mappings_internal_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_user_mappings
    ADD CONSTRAINT external_user_mappings_internal_user_id_fkey FOREIGN KEY (internal_user_id) REFERENCES public.users(id);


--
-- Name: flux_mask_table flux_mask_table_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flux_mask_table
    ADD CONSTRAINT flux_mask_table_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: kiosk_history kiosk_history_kiosk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_history
    ADD CONSTRAINT kiosk_history_kiosk_id_fkey FOREIGN KEY (kiosk_id) REFERENCES public.kiosks(id) ON DELETE CASCADE;


--
-- Name: kiosk_history kiosk_history_performed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_history
    ADD CONSTRAINT kiosk_history_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES public.admin_users(id);


--
-- Name: kiosk_sessions kiosk_sessions_client_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions
    ADD CONSTRAINT kiosk_sessions_client_org_id_fkey FOREIGN KEY (client_org_id) REFERENCES public.client_organizations(id);


--
-- Name: kiosk_sessions kiosk_sessions_kiosk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions
    ADD CONSTRAINT kiosk_sessions_kiosk_id_fkey FOREIGN KEY (kiosk_id) REFERENCES public.kiosks(id);


--
-- Name: kiosk_sessions kiosk_sessions_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions
    ADD CONSTRAINT kiosk_sessions_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.client_locations(id);


--
-- Name: kiosk_sessions kiosk_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_sessions
    ADD CONSTRAINT kiosk_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: kiosk_usage_logs kiosk_usage_logs_client_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_usage_logs
    ADD CONSTRAINT kiosk_usage_logs_client_org_id_fkey FOREIGN KEY (client_org_id) REFERENCES public.client_organizations(id);


--
-- Name: kiosk_usage_logs kiosk_usage_logs_kiosk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_usage_logs
    ADD CONSTRAINT kiosk_usage_logs_kiosk_id_fkey FOREIGN KEY (kiosk_id) REFERENCES public.kiosks(id);


--
-- Name: kiosk_usage_logs kiosk_usage_logs_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosk_usage_logs
    ADD CONSTRAINT kiosk_usage_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.kiosk_sessions(session_id);


--
-- Name: kiosks kiosks_client_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosks
    ADD CONSTRAINT kiosks_client_org_id_fkey FOREIGN KEY (client_org_id) REFERENCES public.client_organizations(id);


--
-- Name: kiosks kiosks_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kiosks
    ADD CONSTRAINT kiosks_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.client_locations(id);


--
-- Name: location_products location_products_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_products
    ADD CONSTRAINT location_products_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.client_locations(id) ON DELETE CASCADE;


--
-- Name: location_products location_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.location_products
    ADD CONSTRAINT location_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: measurements measurements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.measurements
    ADD CONSTRAINT measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pending_vton_requests pending_vton_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_vton_requests
    ADD CONSTRAINT pending_vton_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: product_attributes product_attributes_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: qwen_mask_table qwen_mask_table_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.qwen_mask_table
    ADD CONSTRAINT qwen_mask_table_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: skin_tone skin_tone_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.skin_tone
    ADD CONSTRAINT skin_tone_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: system_config system_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.admin_users(id);


--
-- Name: vton_job vton_job_kiosk_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vton_job
    ADD CONSTRAINT vton_job_kiosk_id_fkey FOREIGN KEY (kiosk_id) REFERENCES public.kiosks(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 5cI7yt133uG6bvHF1CFqxV7k1ANP57cKSzBUVJKHUlXTBOSPk3kzzRWeuRCP1gq

