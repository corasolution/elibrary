--
-- PostgreSQL database dump
--

\restrict ldEcqG3HXSxahxhPjieVdwU3yR6J2QaJVtoDbYSPKJlvw25pEcdauUzmdxy1gGb

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_biblio_search_vector(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_biblio_search_vector() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
                BEGIN
                    NEW.search_vector :=
                        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                        setweight(to_tsvector('english', coalesce(NEW.title_alternative, '')), 'B') ||
                        setweight(to_tsvector('english', coalesce(NEW.publisher, '')), 'C') ||
                        setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'C');
                    RETURN NEW;
                END;
                $$;


ALTER FUNCTION public.update_biblio_search_vector() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: acquisition_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acquisition_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    biblio_id uuid,
    quantity smallint DEFAULT '1'::smallint NOT NULL,
    unit_price numeric(8,2),
    received_qty smallint DEFAULT '0'::smallint NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.acquisition_items OWNER TO postgres;

--
-- Name: acquisition_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.acquisition_orders (
    id uuid NOT NULL,
    order_number character varying(50) NOT NULL,
    supplier character varying(200),
    order_date date,
    expected_date date,
    received_date date,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    total_amount numeric(10,2),
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.acquisition_orders OWNER TO postgres;

--
-- Name: ai_usage_ledger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_usage_ledger (
    id bigint NOT NULL,
    tenant_id uuid,
    provider character varying(20) NOT NULL,
    feature character varying(60) NOT NULL,
    input_tokens integer DEFAULT 0 NOT NULL,
    output_tokens integer DEFAULT 0 NOT NULL,
    api_cost_usd numeric(12,6) DEFAULT '0'::numeric NOT NULL,
    billed_usd numeric(12,6) DEFAULT '0'::numeric NOT NULL,
    earning_usd numeric(12,6) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.ai_usage_ledger OWNER TO postgres;

--
-- Name: ai_usage_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_usage_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_usage_ledger_id_seq OWNER TO postgres;

--
-- Name: ai_usage_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_usage_ledger_id_seq OWNED BY public.ai_usage_ledger.id;


--
-- Name: bibliographic_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bibliographic_records (
    id uuid NOT NULL,
    title character varying(500) NOT NULL,
    title_alternative character varying(500),
    subtitle character varying(500),
    title_km character varying(1000),
    authors json DEFAULT '[]'::json NOT NULL,
    isbn character varying(20),
    issn character varying(10),
    doi character varying(200),
    publisher character varying(300),
    publisher_place character varying(200),
    publication_year integer,
    edition character varying(50),
    volume character varying(20),
    issue character varying(20),
    pages character varying(30),
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    subjects json DEFAULT '[]'::json NOT NULL,
    keywords text,
    ddc_class character varying(50),
    lcc_class character varying(50),
    abstract text,
    abstract_km text,
    material_type_id bigint,
    rights character varying(200),
    series_title character varying(300),
    series_number character varying(20),
    geographic_coverage character varying(200),
    source character varying(500),
    notes text,
    table_of_contents text,
    cover_image_url character varying(500),
    search_vector tsvector,
    record_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    cataloger_id uuid,
    cataloged_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    deleted_by uuid
);


ALTER TABLE public.bibliographic_records OWNER TO postgres;

--
-- Name: central_user_tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.central_user_tenants (
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    assigned_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    assigned_by uuid,
    notes text
);


ALTER TABLE public.central_user_tenants OWNER TO postgres;

--
-- Name: central_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.central_users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    email_verified_at timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.central_users OWNER TO postgres;

--
-- Name: cms_translation_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_translation_versions (
    id bigint NOT NULL,
    translation_id bigint NOT NULL,
    en_value_old text,
    km_value_old text,
    en_value_new text,
    km_value_new text,
    changed_by bigint,
    change_note text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cms_translation_versions OWNER TO postgres;

--
-- Name: cms_translation_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cms_translation_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cms_translation_versions_id_seq OWNER TO postgres;

--
-- Name: cms_translation_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cms_translation_versions_id_seq OWNED BY public.cms_translation_versions.id;


--
-- Name: cms_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cms_translations (
    id bigint NOT NULL,
    section character varying(50) NOT NULL,
    key character varying(100) NOT NULL,
    en_value text NOT NULL,
    km_value text,
    translation_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    translation_method character varying(20),
    description text,
    is_published boolean DEFAULT false NOT NULL,
    last_published_at timestamp(0) without time zone,
    created_by bigint,
    updated_by bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.cms_translations OWNER TO postgres;

--
-- Name: cms_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cms_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cms_translations_id_seq OWNER TO postgres;

--
-- Name: cms_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cms_translations_id_seq OWNED BY public.cms_translations.id;


--
-- Name: collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.collections (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    name_km character varying(200),
    code character varying(20),
    description text,
    is_loanable boolean DEFAULT true NOT NULL,
    loan_period_days integer DEFAULT 14 NOT NULL,
    renewals_allowed integer DEFAULT 2 NOT NULL,
    fine_rate_per_day numeric(6,2) DEFAULT 0.1 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.collections OWNER TO postgres;

--
-- Name: collections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.collections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.collections_id_seq OWNER TO postgres;

--
-- Name: collections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.collections_id_seq OWNED BY public.collections.id;


--
-- Name: daily_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_stats (
    id bigint NOT NULL,
    date date NOT NULL,
    total_loans integer DEFAULT 0 NOT NULL,
    total_returns integer DEFAULT 0 NOT NULL,
    new_patrons integer DEFAULT 0 NOT NULL,
    digital_views integer DEFAULT 0 NOT NULL,
    digital_downloads integer DEFAULT 0 NOT NULL,
    overdue_items integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.daily_stats OWNER TO postgres;

--
-- Name: daily_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.daily_stats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_stats_id_seq OWNER TO postgres;

--
-- Name: daily_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.daily_stats_id_seq OWNED BY public.daily_stats.id;


--
-- Name: digital_access_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_access_logs (
    id uuid NOT NULL,
    resource_id uuid,
    patron_id uuid,
    action character varying(20) NOT NULL,
    ip_address inet,
    user_agent text,
    session_id character varying(100),
    duration_seconds integer,
    accessed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.digital_access_logs OWNER TO postgres;

--
-- Name: digital_resources; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_resources (
    id uuid NOT NULL,
    biblio_id uuid NOT NULL,
    file_path character varying(500),
    original_filename character varying(255),
    file_size_bytes bigint,
    mime_type character varying(100),
    format character varying(20),
    url character varying(1000),
    is_external boolean DEFAULT false NOT NULL,
    thumbnail_path character varying(500),
    access_type character varying(20) DEFAULT 'restricted'::character varying NOT NULL,
    embargo_until date,
    handle character varying(200),
    ocr_text text,
    ocr_processed_at timestamp(0) without time zone,
    duration_seconds integer,
    bitrate character varying(20),
    download_count integer DEFAULT 0 NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    version character varying(20) DEFAULT '1.0'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.digital_resources OWNER TO postgres;

--
-- Name: domains; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.domains (
    id bigint NOT NULL,
    domain character varying(255) NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.domains OWNER TO postgres;

--
-- Name: domains_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.domains_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.domains_id_seq OWNER TO postgres;

--
-- Name: domains_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.domains_id_seq OWNED BY public.domains.id;


--
-- Name: inventory_scans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_scans (
    id bigint NOT NULL,
    session_id uuid NOT NULL,
    item_id uuid,
    barcode_scanned character varying(100) NOT NULL,
    scan_status character varying(30) DEFAULT 'found'::character varying NOT NULL,
    scanned_by uuid,
    scanned_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.inventory_scans OWNER TO postgres;

--
-- Name: inventory_scans_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventory_scans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_scans_id_seq OWNER TO postgres;

--
-- Name: inventory_scans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventory_scans_id_seq OWNED BY public.inventory_scans.id;


--
-- Name: inventory_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_sessions (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    notes text,
    collection_id bigint,
    location_id bigint,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    expected_count integer DEFAULT 0 NOT NULL,
    scanned_count integer DEFAULT 0 NOT NULL,
    missing_count integer DEFAULT 0 NOT NULL,
    unknown_count integer DEFAULT 0 NOT NULL,
    started_by uuid,
    started_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.inventory_sessions OWNER TO postgres;

--
-- Name: invoice_number_sequence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_number_sequence (
    current_value bigint NOT NULL
);


ALTER TABLE public.invoice_number_sequence OWNER TO postgres;

--
-- Name: invoice_number_sequence_current_value_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.invoice_number_sequence_current_value_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_number_sequence_current_value_seq OWNER TO postgres;

--
-- Name: invoice_number_sequence_current_value_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.invoice_number_sequence_current_value_seq OWNED BY public.invoice_number_sequence.current_value;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid NOT NULL,
    invoice_number character varying(50) NOT NULL,
    payment_transaction_id uuid,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    invoice_date date NOT NULL,
    due_date date,
    subtotal numeric(10,2) NOT NULL,
    tax_rate numeric(5,2) DEFAULT '10'::numeric NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    exchange_rate numeric(10,4),
    total_khr numeric(15,2),
    pdf_path character varying(500),
    status character varying(20) DEFAULT 'issued'::character varying NOT NULL,
    sent_at timestamp(0) without time zone,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: library_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.library_settings (
    id bigint NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "group" character varying(50),
    label character varying(200),
    description text,
    updated_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.library_settings OWNER TO postgres;

--
-- Name: library_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.library_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.library_settings_id_seq OWNER TO postgres;

--
-- Name: library_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.library_settings_id_seq OWNED BY public.library_settings.id;


--
-- Name: loans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loans (
    id uuid NOT NULL,
    patron_id uuid NOT NULL,
    item_id uuid NOT NULL,
    checked_out_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date date NOT NULL,
    returned_at timestamp(0) without time zone,
    renewed_at timestamp(0) without time zone,
    renewals_count smallint DEFAULT '0'::smallint NOT NULL,
    checked_out_by uuid,
    returned_by uuid,
    fine_amount numeric(8,2) DEFAULT '0'::numeric NOT NULL,
    fine_paid boolean DEFAULT false NOT NULL,
    fine_paid_at timestamp(0) without time zone,
    fine_waived boolean DEFAULT false NOT NULL,
    fine_waived_by uuid,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.loans OWNER TO postgres;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id bigint NOT NULL,
    parent_id bigint,
    name character varying(100) NOT NULL,
    name_km character varying(200),
    code character varying(20),
    address text,
    is_branch boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO postgres;

--
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.locations_id_seq OWNED BY public.locations.id;


--
-- Name: material_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.material_types (
    id bigint NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(100) NOT NULL,
    name_km character varying(200),
    icon character varying(50),
    has_physical boolean DEFAULT false NOT NULL,
    has_digital boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.material_types OWNER TO postgres;

--
-- Name: material_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.material_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.material_types_id_seq OWNER TO postgres;

--
-- Name: material_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.material_types_id_seq OWNED BY public.material_types.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: model_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_permissions (
    permission_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO postgres;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id bigint NOT NULL
);


ALTER TABLE public.model_has_roles OWNER TO postgres;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- Name: patron_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patron_categories (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    name_km character varying(200),
    loan_limit integer DEFAULT 5 NOT NULL,
    loan_period_days integer DEFAULT 14 NOT NULL,
    renewals_allowed integer DEFAULT 2 NOT NULL,
    reservation_limit integer DEFAULT 3 NOT NULL,
    fine_rate_per_day numeric(6,2) DEFAULT 0.1 NOT NULL,
    max_fine numeric(8,2) DEFAULT '10'::numeric NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.patron_categories OWNER TO postgres;

--
-- Name: patron_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patron_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patron_categories_id_seq OWNER TO postgres;

--
-- Name: patron_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patron_categories_id_seq OWNED BY public.patron_categories.id;


--
-- Name: patrons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patrons (
    id uuid NOT NULL,
    patron_number character varying(30) NOT NULL,
    email character varying(255),
    password character varying(255),
    email_verified_at timestamp(0) without time zone,
    first_name character varying(100) NOT NULL,
    last_name character varying(100),
    first_name_km character varying(200),
    last_name_km character varying(200),
    gender character varying(20),
    date_of_birth date,
    phone character varying(30),
    address text,
    city character varying(100),
    country character varying(3) DEFAULT 'KHM'::character varying NOT NULL,
    patron_category_id bigint,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    membership_expiry date,
    preferred_language character varying(5) DEFAULT 'en'::character varying NOT NULL,
    total_checkouts integer DEFAULT 0 NOT NULL,
    active_loans integer DEFAULT 0 NOT NULL,
    notes text,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.patrons OWNER TO postgres;

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_transactions (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid,
    amount numeric(10,2) NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    payment_method character varying(255) DEFAULT 'qr_code'::character varying NOT NULL,
    transaction_proof character varying(255),
    notes text,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL,
    paid_at timestamp(0) without time zone,
    verified_at timestamp(0) without time zone,
    verified_by uuid,
    rejection_reason text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.payment_transactions OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: physical_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.physical_items (
    id uuid NOT NULL,
    biblio_id uuid NOT NULL,
    barcode character varying(50),
    accession_number character varying(50),
    call_number character varying(100),
    collection_id bigint,
    location_id bigint,
    shelf character varying(50),
    item_status character varying(30) DEFAULT 'available'::character varying NOT NULL,
    condition character varying(20) DEFAULT 'good'::character varying NOT NULL,
    price numeric(10,2),
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    acquired_date date,
    supplier character varying(200),
    purchase_order character varying(100),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    last_seen_at timestamp(0) without time zone
);


ALTER TABLE public.physical_items OWNER TO postgres;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id uuid NOT NULL,
    name character varying(50) NOT NULL,
    price_usd numeric(8,2) NOT NULL,
    billing_cycle character varying(10) DEFAULT 'monthly'::character varying NOT NULL,
    max_titles integer,
    max_patrons integer,
    max_storage_gb integer,
    features json DEFAULT '[]'::json NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id bigint NOT NULL,
    key character varying(100) NOT NULL,
    value text,
    "group" character varying(50),
    label character varying(200),
    description text,
    is_encrypted boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.platform_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.platform_settings_id_seq OWNER TO postgres;

--
-- Name: platform_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.platform_settings_id_seq OWNED BY public.platform_settings.id;


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservations (
    id uuid NOT NULL,
    patron_id uuid NOT NULL,
    biblio_id uuid NOT NULL,
    item_id uuid,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reserved_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiry_date date,
    notified_at timestamp(0) without time zone,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.reservations OWNER TO postgres;

--
-- Name: role_has_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_has_permissions (
    permission_id bigint NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.role_has_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    guard_name character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: serial_issues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.serial_issues (
    id uuid NOT NULL,
    serial_id uuid NOT NULL,
    volume character varying(20),
    issue_number character varying(20),
    publication_date date,
    received_date date,
    item_id uuid,
    status character varying(20) DEFAULT 'expected'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.serial_issues OWNER TO postgres;

--
-- Name: serials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.serials (
    id uuid NOT NULL,
    biblio_id uuid,
    frequency character varying(30),
    start_date date,
    end_date date,
    subscription_expiry date,
    supplier character varying(200),
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.serials OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id uuid,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    current_period_start timestamp(0) without time zone,
    current_period_end timestamp(0) without time zone,
    payment_method character varying(50),
    external_subscription_id character varying(255),
    metadata json DEFAULT '{}'::json NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenants (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    slug character varying(100) NOT NULL,
    domain character varying(255),
    data json DEFAULT '{}'::json NOT NULL,
    plan_id uuid,
    trial_ends_at timestamp(0) without time zone,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    created_by_id uuid,
    managed_by_id uuid,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.tenants OWNER TO postgres;

--
-- Name: translation_api_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translation_api_logs (
    id bigint NOT NULL,
    tenant_id uuid,
    translation_id bigint,
    text_length integer,
    input_tokens integer,
    output_tokens integer,
    cost_usd numeric(10,6),
    response_time_ms integer,
    status character varying(20) NOT NULL,
    error_message text,
    created_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.translation_api_logs OWNER TO postgres;

--
-- Name: translation_api_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translation_api_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translation_api_logs_id_seq OWNER TO postgres;

--
-- Name: translation_api_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translation_api_logs_id_seq OWNED BY public.translation_api_logs.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    email_verified_at timestamp(0) without time zone,
    avatar_url character varying(255),
    preferred_language character varying(5) DEFAULT 'en'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: ai_usage_ledger id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_ledger ALTER COLUMN id SET DEFAULT nextval('public.ai_usage_ledger_id_seq'::regclass);


--
-- Name: cms_translation_versions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translation_versions ALTER COLUMN id SET DEFAULT nextval('public.cms_translation_versions_id_seq'::regclass);


--
-- Name: cms_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translations ALTER COLUMN id SET DEFAULT nextval('public.cms_translations_id_seq'::regclass);


--
-- Name: collections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);


--
-- Name: daily_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats ALTER COLUMN id SET DEFAULT nextval('public.daily_stats_id_seq'::regclass);


--
-- Name: domains id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains ALTER COLUMN id SET DEFAULT nextval('public.domains_id_seq'::regclass);


--
-- Name: inventory_scans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_scans ALTER COLUMN id SET DEFAULT nextval('public.inventory_scans_id_seq'::regclass);


--
-- Name: invoice_number_sequence current_value; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_number_sequence ALTER COLUMN current_value SET DEFAULT nextval('public.invoice_number_sequence_current_value_seq'::regclass);


--
-- Name: library_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library_settings ALTER COLUMN id SET DEFAULT nextval('public.library_settings_id_seq'::regclass);


--
-- Name: locations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations ALTER COLUMN id SET DEFAULT nextval('public.locations_id_seq'::regclass);


--
-- Name: material_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_types ALTER COLUMN id SET DEFAULT nextval('public.material_types_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: patron_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patron_categories ALTER COLUMN id SET DEFAULT nextval('public.patron_categories_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: platform_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings ALTER COLUMN id SET DEFAULT nextval('public.platform_settings_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: translation_api_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation_api_logs ALTER COLUMN id SET DEFAULT nextval('public.translation_api_logs_id_seq'::regclass);


--
-- Data for Name: acquisition_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acquisition_items (id, order_id, biblio_id, quantity, unit_price, received_qty, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: acquisition_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.acquisition_orders (id, order_number, supplier, order_date, expected_date, received_date, status, total_amount, currency, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_usage_ledger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_usage_ledger (id, tenant_id, provider, feature, input_tokens, output_tokens, api_cost_usd, billed_usd, earning_usd, created_at) FROM stdin;
\.


--
-- Data for Name: bibliographic_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bibliographic_records (id, title, title_alternative, subtitle, title_km, authors, isbn, issn, doi, publisher, publisher_place, publication_year, edition, volume, issue, pages, language, subjects, keywords, ddc_class, lcc_class, abstract, abstract_km, material_type_id, rights, series_title, series_number, geographic_coverage, source, notes, table_of_contents, cover_image_url, search_vector, record_status, cataloger_id, cataloged_at, created_at, updated_at, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: central_user_tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.central_user_tenants (user_id, tenant_id, assigned_at, assigned_by, notes) FROM stdin;
\.


--
-- Data for Name: central_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.central_users (id, name, email, password, role, is_active, email_verified_at, remember_token, created_at, updated_at, deleted_at) FROM stdin;
711f60b9-8e3d-4366-9fd8-70b835d9808e	Super Admin	admin@bannalai.com	$2y$12$t5Br1ckJszopug9OFlhr2eTx73/RuInpACyd2N1zXnvjGXWQBCAc2	super_admin	t	2026-06-08 13:33:46	\N	2026-06-08 13:33:46	2026-06-08 13:33:46	\N
a37d2815-4b06-4d88-83e4-a121f3bce60d	Demo Partner	partner@example.com	$2y$12$lFuHZBz3ybdFjasmpoNJyeRrj.91HLAg6wHlsCecuR//Pli4jCXLi	partner	t	2026-06-08 13:33:46	\N	2026-06-08 13:33:46	2026-06-08 13:33:46	\N
d9500eee-b47e-4957-8643-90118cac4f8c	Demo Sales Agent	sales@example.com	$2y$12$O5mFgxH0E7gVFwNRrZc56.weChvyPlpWDbeNBPuaXuvUiEtmjXv5O	sales_agent	t	2026-06-08 13:33:46	\N	2026-06-08 13:33:46	2026-06-08 13:33:46	\N
\.


--
-- Data for Name: cms_translation_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_translation_versions (id, translation_id, en_value_old, km_value_old, en_value_new, km_value_new, changed_by, change_note, created_at) FROM stdin;
\.


--
-- Data for Name: cms_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cms_translations (id, section, key, en_value, km_value, translation_status, translation_method, description, is_published, last_published_at, created_by, updated_by, created_at, updated_at, is_active) FROM stdin;
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, name, name_km, code, description, is_loanable, loan_period_days, renewals_allowed, fine_rate_per_day, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: daily_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_stats (id, date, total_loans, total_returns, new_patrons, digital_views, digital_downloads, overdue_items, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: digital_access_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_access_logs (id, resource_id, patron_id, action, ip_address, user_agent, session_id, duration_seconds, accessed_at) FROM stdin;
\.


--
-- Data for Name: digital_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_resources (id, biblio_id, file_path, original_filename, file_size_bytes, mime_type, format, url, is_external, thumbnail_path, access_type, embargo_until, handle, ocr_text, ocr_processed_at, duration_seconds, bitrate, download_count, view_count, version, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: domains; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.domains (id, domain, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_scans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_scans (id, session_id, item_id, barcode_scanned, scan_status, scanned_by, scanned_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_sessions (id, name, notes, collection_id, location_id, status, expected_count, scanned_count, missing_count, unknown_count, started_by, started_at, closed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoice_number_sequence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_number_sequence (current_value) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, payment_transaction_id, tenant_id, plan_id, invoice_date, due_date, subtotal, tax_rate, tax_amount, total_amount, currency, exchange_rate, total_khr, pdf_path, status, sent_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: library_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.library_settings (id, key, value, "group", label, description, updated_at) FROM stdin;
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loans (id, patron_id, item_id, checked_out_at, due_date, returned_at, renewed_at, renewals_count, checked_out_by, returned_by, fine_amount, fine_paid, fine_paid_at, fine_waived, fine_waived_by, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, parent_id, name, name_km, code, address, is_branch, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: material_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_types (id, code, name, name_km, icon, has_physical, has_digital, is_active, sort_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2026_01_01_000001_create_tenants_table	1
2	2026_01_01_000002_create_plans_table	1
3	2026_01_01_000003_create_subscriptions_table	1
4	2026_05_30_112228_create_permission_tables	1
5	2026_06_06_000001_create_central_users_table	1
6	2026_06_06_000002_create_central_user_tenants_table	1
7	2026_06_06_000003_add_ownership_to_tenants_table	1
8	2026_06_07_000001_create_platform_settings_table	1
9	2026_06_07_000002_add_soft_deletes_to_tenants	1
10	2026_06_07_000003_create_cms_tables	1
11	2026_06_07_044925_create_payment_transactions_table	1
12	2026_06_07_132133_add_is_active_to_cms_translations_table	1
13	2026_06_07_140000_create_invoices_table	1
14	2026_01_02_000001_create_material_types_table	2
15	2026_01_02_000002_create_bibliographic_records_table	2
16	2026_01_02_000003_create_locations_collections_table	2
17	2026_01_02_000004_create_physical_items_table	2
18	2026_01_02_000005_create_digital_resources_table	2
19	2026_01_02_000006_create_patrons_table	2
20	2026_01_02_000007_create_circulation_tables	2
21	2026_01_02_000008_create_acquisitions_serials_tables	2
22	2026_01_02_000009_create_digital_access_logs_table	2
23	2026_01_02_000010_create_staff_users_table	2
24	2026_05_31_000001_add_deleted_by_to_bibliographic_records	2
25	2026_06_11_000001_create_ai_usage_ledger_table	3
26	2026_06_11_000010_create_inventory_tables	4
\.


--
-- Data for Name: model_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_permissions (permission_id, model_type, model_id) FROM stdin;
\.


--
-- Data for Name: model_has_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.model_has_roles (role_id, model_type, model_id) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: patron_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patron_categories (id, name, name_km, loan_limit, loan_period_days, renewals_allowed, reservation_limit, fine_rate_per_day, max_fine, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: patrons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patrons (id, patron_number, email, password, email_verified_at, first_name, last_name, first_name_km, last_name_km, gender, date_of_birth, phone, address, city, country, patron_category_id, status, membership_expiry, preferred_language, total_checkouts, active_loans, notes, remember_token, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: payment_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_transactions (id, tenant_id, plan_id, amount, currency, payment_method, transaction_proof, notes, status, paid_at, verified_at, verified_by, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: physical_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_items (id, biblio_id, barcode, accession_number, call_number, collection_id, location_id, shelf, item_status, condition, price, currency, acquired_date, supplier, purchase_order, notes, created_at, updated_at, deleted_at, last_seen_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, name, price_usd, billing_cycle, max_titles, max_patrons, max_storage_gb, features, is_active, sort_order, created_at, updated_at) FROM stdin;
764e1e08-8f50-4630-9580-127fa3fd9ea2	Free	0.00	monthly	500	100	1	[]	t	1	2026-06-08 13:33:29	2026-06-08 13:33:29
1c78887f-dea3-40e3-b7d7-24a62a95244d	Starter	29.00	monthly	5000	1000	20	["digital_library","email_notifications","reports"]	t	2	2026-06-08 13:33:29	2026-06-08 13:33:29
583ec911-ea59-45f7-aa72-8987e1153b32	Pro	79.00	monthly	50000	10000	200	["digital_library","email_notifications","reports","multi_branch","custom_domain","api_access"]	t	3	2026-06-08 13:33:29	2026-06-08 13:33:29
7c189337-5474-48b8-9235-9142aa124aa4	Enterprise	0.00	annual	\N	\N	\N	["digital_library","email_notifications","reports","multi_branch","custom_domain","api_access","dedicated_support","sla"]	t	4	2026-06-08 13:33:29	2026-06-08 13:33:29
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, key, value, "group", label, description, is_encrypted, created_at, updated_at) FROM stdin;
1	gemini_api_key		ai	Gemini API Key	Google Gemini API key for AI-powered cataloging features	t	2026-06-08 13:33:31	2026-06-08 13:33:31
2	gemini_api_url	https://generativelanguage.googleapis.com/v1beta	ai	Gemini API URL	Google Gemini API base URL	f	2026-06-08 13:33:31	2026-06-08 13:33:31
3	gemini_model	gemini-1.5-flash	ai	Gemini Model	Gemini model to use (gemini-1.5-flash recommended for cost)	f	2026-06-08 13:33:31	2026-06-08 13:33:31
4	ai_markup_percentage	30	ai	AI Markup Percentage	Profit margin to add on top of Gemini API costs (default: 30%)	f	2026-06-08 13:33:31	2026-06-08 13:33:31
5	ai_platform_enabled	true	ai	Enable AI Platform-Wide	Master switch for all AI features across all tenants	f	2026-06-08 13:33:31	2026-06-08 13:33:31
6	platform_name	Alpha eLibrary	general	Platform Name	Name of the SaaS platform	f	2026-06-08 13:33:31	2026-06-08 13:33:31
7	support_email	support@alphaelibrary.com	general	Support Email	Platform support contact email	f	2026-06-08 13:33:31	2026-06-08 13:33:31
8	embedding_provider	openai	embedding	Embedding Provider	Provider for generating vector embeddings (openai, gemini, custom)	f	2026-06-08 13:33:48	2026-06-08 13:33:48
9	embedding_model	text-embedding-3-small	embedding	Embedding Model	Model to use for embeddings (text-embedding-3-small, text-embedding-ada-002, embedding-001)	f	2026-06-08 13:33:48	2026-06-08 13:33:48
10	embedding_api_key		embedding	Embedding API Key	API key for embedding provider (encrypted)	t	2026-06-08 13:33:48	2026-06-08 13:33:48
11	embedding_api_url	https://api.openai.com/v1/embeddings	embedding	Embedding API URL	API endpoint for embeddings	f	2026-06-08 13:33:48	2026-06-08 13:33:48
12	enable_semantic_search	false	embedding	Enable Semantic Search	Enable vector-based semantic search (requires pgvector and embeddings)	f	2026-06-08 13:33:48	2026-06-08 13:33:48
13	embedding_batch_size	50	embedding	Embedding Batch Size	Number of records to process per batch for embedding generation	f	2026-06-08 13:33:48	2026-06-08 13:33:48
14	embedding_monthly_budget_usd	100.00	embedding	Monthly Embedding Budget (USD)	Maximum monthly spend on embedding API calls	f	2026-06-08 13:33:48	2026-06-08 13:33:48
15	search_tsvector_weight	0.4	search	Keyword Search Weight	Weight for tsvector (keyword) search in hybrid mode (0.0-1.0)	f	2026-06-08 13:33:48	2026-06-08 13:33:48
16	search_vector_weight	0.6	search	Semantic Search Weight	Weight for vector (semantic) search in hybrid mode (0.0-1.0)	f	2026-06-08 13:33:48	2026-06-08 13:33:48
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, patron_id, biblio_id, item_id, status, reserved_at, expiry_date, notified_at, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, guard_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: serial_issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serial_issues (id, serial_id, volume, issue_number, publication_date, received_date, item_id, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: serials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serials (id, biblio_id, frequency, start_date, end_date, subscription_expiry, supplier, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (id, tenant_id, plan_id, status, current_period_start, current_period_end, payment_method, external_subscription_id, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tenants (id, name, slug, domain, data, plan_id, trial_ends_at, status, created_at, updated_at, created_by_id, managed_by_id, deleted_at) FROM stdin;
f0621539-5d16-478f-876a-951673b136b3	eLibrary	elibrary	\N	{"updated_at":"2026-06-08 13:53:15","created_at":"2026-06-08 13:53:15","tenancy_db_name":"alpha_elibrary_tenant_f0621539-5d16-478f-876a-951673b136b3"}	\N	\N	active	2026-06-08 13:53:15	2026-06-08 13:53:15	\N	\N	\N
\.


--
-- Data for Name: translation_api_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.translation_api_logs (id, tenant_id, translation_id, text_length, input_tokens, output_tokens, cost_usd, response_time_ms, status, error_message, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, email_verified_at, avatar_url, preferred_language, is_active, remember_token, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Name: ai_usage_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ai_usage_ledger_id_seq', 1, true);


--
-- Name: cms_translation_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cms_translation_versions_id_seq', 1, false);


--
-- Name: cms_translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cms_translations_id_seq', 1, false);


--
-- Name: collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.collections_id_seq', 1, false);


--
-- Name: daily_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_stats_id_seq', 1, false);


--
-- Name: domains_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.domains_id_seq', 1, false);


--
-- Name: inventory_scans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_scans_id_seq', 1, false);


--
-- Name: invoice_number_sequence_current_value_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.invoice_number_sequence_current_value_seq', 1, false);


--
-- Name: library_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.library_settings_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: material_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_types_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 26, true);


--
-- Name: patron_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patron_categories_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: platform_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.platform_settings_id_seq', 16, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: translation_api_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.translation_api_logs_id_seq', 1, false);


--
-- Name: acquisition_items acquisition_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisition_items
    ADD CONSTRAINT acquisition_items_pkey PRIMARY KEY (id);


--
-- Name: acquisition_orders acquisition_orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisition_orders
    ADD CONSTRAINT acquisition_orders_order_number_unique UNIQUE (order_number);


--
-- Name: acquisition_orders acquisition_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisition_orders
    ADD CONSTRAINT acquisition_orders_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_ledger ai_usage_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_ledger
    ADD CONSTRAINT ai_usage_ledger_pkey PRIMARY KEY (id);


--
-- Name: bibliographic_records bibliographic_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bibliographic_records
    ADD CONSTRAINT bibliographic_records_pkey PRIMARY KEY (id);


--
-- Name: central_user_tenants central_user_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_user_tenants
    ADD CONSTRAINT central_user_tenants_pkey PRIMARY KEY (user_id, tenant_id);


--
-- Name: central_users central_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_users
    ADD CONSTRAINT central_users_email_unique UNIQUE (email);


--
-- Name: central_users central_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_users
    ADD CONSTRAINT central_users_pkey PRIMARY KEY (id);


--
-- Name: cms_translation_versions cms_translation_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translation_versions
    ADD CONSTRAINT cms_translation_versions_pkey PRIMARY KEY (id);


--
-- Name: cms_translations cms_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translations
    ADD CONSTRAINT cms_translations_pkey PRIMARY KEY (id);


--
-- Name: cms_translations cms_translations_section_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translations
    ADD CONSTRAINT cms_translations_section_key_unique UNIQUE (section, key);


--
-- Name: collections collections_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_code_unique UNIQUE (code);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: daily_stats daily_stats_date_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_date_unique UNIQUE (date);


--
-- Name: daily_stats daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats
    ADD CONSTRAINT daily_stats_pkey PRIMARY KEY (id);


--
-- Name: digital_access_logs digital_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_access_logs
    ADD CONSTRAINT digital_access_logs_pkey PRIMARY KEY (id);


--
-- Name: digital_resources digital_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_resources
    ADD CONSTRAINT digital_resources_pkey PRIMARY KEY (id);


--
-- Name: domains domains_domain_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_domain_unique UNIQUE (domain);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: inventory_scans inventory_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_scans
    ADD CONSTRAINT inventory_scans_pkey PRIMARY KEY (id);


--
-- Name: inventory_sessions inventory_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_sessions
    ADD CONSTRAINT inventory_sessions_pkey PRIMARY KEY (id);


--
-- Name: invoice_number_sequence invoice_number_sequence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_number_sequence
    ADD CONSTRAINT invoice_number_sequence_pkey PRIMARY KEY (current_value);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: library_settings library_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library_settings
    ADD CONSTRAINT library_settings_key_unique UNIQUE (key);


--
-- Name: library_settings library_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library_settings
    ADD CONSTRAINT library_settings_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: locations locations_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_code_unique UNIQUE (code);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: material_types material_types_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_types
    ADD CONSTRAINT material_types_code_unique UNIQUE (code);


--
-- Name: material_types material_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.material_types
    ADD CONSTRAINT material_types_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: model_has_permissions model_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_pkey PRIMARY KEY (permission_id, model_id, model_type);


--
-- Name: model_has_roles model_has_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_pkey PRIMARY KEY (role_id, model_id, model_type);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: patron_categories patron_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patron_categories
    ADD CONSTRAINT patron_categories_pkey PRIMARY KEY (id);


--
-- Name: patrons patrons_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_email_unique UNIQUE (email);


--
-- Name: patrons patrons_patron_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_patron_number_unique UNIQUE (patron_number);


--
-- Name: patrons patrons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_pkey PRIMARY KEY (id);


--
-- Name: payment_transactions payment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: physical_items physical_items_accession_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_accession_number_unique UNIQUE (accession_number);


--
-- Name: physical_items physical_items_barcode_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_barcode_unique UNIQUE (barcode);


--
-- Name: physical_items physical_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_key_unique UNIQUE (key);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: role_has_permissions role_has_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_pkey PRIMARY KEY (permission_id, role_id);


--
-- Name: roles roles_name_guard_name_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_guard_name_unique UNIQUE (name, guard_name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: serial_issues serial_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_issues
    ADD CONSTRAINT serial_issues_pkey PRIMARY KEY (id);


--
-- Name: serials serials_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT serials_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_slug_unique UNIQUE (slug);


--
-- Name: translation_api_logs translation_api_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation_api_logs
    ADD CONSTRAINT translation_api_logs_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: acquisition_orders_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX acquisition_orders_status_index ON public.acquisition_orders USING btree (status);


--
-- Name: ai_usage_ledger_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_ledger_created_at_index ON public.ai_usage_ledger USING btree (created_at);


--
-- Name: ai_usage_ledger_feature_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_ledger_feature_index ON public.ai_usage_ledger USING btree (feature);


--
-- Name: ai_usage_ledger_provider_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_ledger_provider_index ON public.ai_usage_ledger USING btree (provider);


--
-- Name: ai_usage_ledger_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_ledger_tenant_id_index ON public.ai_usage_ledger USING btree (tenant_id);


--
-- Name: bibliographic_records_isbn_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bibliographic_records_isbn_index ON public.bibliographic_records USING btree (isbn);


--
-- Name: bibliographic_records_language_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bibliographic_records_language_index ON public.bibliographic_records USING btree (language);


--
-- Name: bibliographic_records_publication_year_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bibliographic_records_publication_year_index ON public.bibliographic_records USING btree (publication_year);


--
-- Name: central_user_tenants_assigned_by_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_user_tenants_assigned_by_index ON public.central_user_tenants USING btree (assigned_by);


--
-- Name: central_user_tenants_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_user_tenants_tenant_id_index ON public.central_user_tenants USING btree (tenant_id);


--
-- Name: central_user_tenants_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_user_tenants_user_id_index ON public.central_user_tenants USING btree (user_id);


--
-- Name: central_users_email_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_users_email_index ON public.central_users USING btree (email);


--
-- Name: central_users_is_active_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_users_is_active_index ON public.central_users USING btree (is_active);


--
-- Name: central_users_role_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX central_users_role_index ON public.central_users USING btree (role);


--
-- Name: cms_translations_is_published_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_translations_is_published_index ON public.cms_translations USING btree (is_published);


--
-- Name: cms_translations_section_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_translations_section_index ON public.cms_translations USING btree (section);


--
-- Name: cms_translations_translation_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cms_translations_translation_status_index ON public.cms_translations USING btree (translation_status);


--
-- Name: digital_access_logs_accessed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_access_logs_accessed_at_index ON public.digital_access_logs USING btree (accessed_at);


--
-- Name: digital_access_logs_resource_id_action_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_access_logs_resource_id_action_index ON public.digital_access_logs USING btree (resource_id, action);


--
-- Name: digital_resources_access_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX digital_resources_access_type_index ON public.digital_resources USING btree (access_type);


--
-- Name: idx_biblio_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biblio_search ON public.bibliographic_records USING gin (search_vector);


--
-- Name: inventory_scans_session_id_barcode_scanned_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_scans_session_id_barcode_scanned_index ON public.inventory_scans USING btree (session_id, barcode_scanned);


--
-- Name: inventory_scans_session_id_item_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_scans_session_id_item_id_index ON public.inventory_scans USING btree (session_id, item_id);


--
-- Name: invoices_invoice_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_invoice_date_index ON public.invoices USING btree (invoice_date);


--
-- Name: invoices_invoice_number_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_invoice_number_index ON public.invoices USING btree (invoice_number);


--
-- Name: invoices_payment_transaction_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_payment_transaction_id_index ON public.invoices USING btree (payment_transaction_id);


--
-- Name: invoices_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invoices_tenant_id_index ON public.invoices USING btree (tenant_id);


--
-- Name: loans_due_date_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_due_date_index ON public.loans USING btree (due_date);


--
-- Name: loans_patron_id_returned_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_patron_id_returned_at_index ON public.loans USING btree (patron_id, returned_at);


--
-- Name: loans_returned_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loans_returned_at_index ON public.loans USING btree (returned_at);


--
-- Name: model_has_permissions_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_permissions_model_id_model_type_index ON public.model_has_permissions USING btree (model_id, model_type);


--
-- Name: model_has_roles_model_id_model_type_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX model_has_roles_model_id_model_type_index ON public.model_has_roles USING btree (model_id, model_type);


--
-- Name: patrons_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patrons_status_index ON public.patrons USING btree (status);


--
-- Name: payment_transactions_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_created_at_index ON public.payment_transactions USING btree (created_at);


--
-- Name: payment_transactions_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_status_index ON public.payment_transactions USING btree (status);


--
-- Name: payment_transactions_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_transactions_tenant_id_index ON public.payment_transactions USING btree (tenant_id);


--
-- Name: physical_items_item_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX physical_items_item_status_index ON public.physical_items USING btree (item_status);


--
-- Name: platform_settings_group_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX platform_settings_group_index ON public.platform_settings USING btree ("group");


--
-- Name: reservations_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reservations_status_index ON public.reservations USING btree (status);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: tenants_created_by_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_created_by_id_index ON public.tenants USING btree (created_by_id);


--
-- Name: tenants_managed_by_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tenants_managed_by_id_index ON public.tenants USING btree (managed_by_id);


--
-- Name: translation_api_logs_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translation_api_logs_created_at_index ON public.translation_api_logs USING btree (created_at);


--
-- Name: translation_api_logs_tenant_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translation_api_logs_tenant_id_index ON public.translation_api_logs USING btree (tenant_id);


--
-- Name: bibliographic_records trig_biblio_search_vector; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trig_biblio_search_vector BEFORE INSERT OR UPDATE ON public.bibliographic_records FOR EACH ROW EXECUTE FUNCTION public.update_biblio_search_vector();


--
-- Name: acquisition_items acquisition_items_biblio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisition_items
    ADD CONSTRAINT acquisition_items_biblio_id_foreign FOREIGN KEY (biblio_id) REFERENCES public.bibliographic_records(id) ON DELETE SET NULL;


--
-- Name: acquisition_items acquisition_items_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.acquisition_items
    ADD CONSTRAINT acquisition_items_order_id_foreign FOREIGN KEY (order_id) REFERENCES public.acquisition_orders(id) ON DELETE CASCADE;


--
-- Name: bibliographic_records bibliographic_records_material_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bibliographic_records
    ADD CONSTRAINT bibliographic_records_material_type_id_foreign FOREIGN KEY (material_type_id) REFERENCES public.material_types(id) ON DELETE SET NULL;


--
-- Name: central_user_tenants central_user_tenants_assigned_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_user_tenants
    ADD CONSTRAINT central_user_tenants_assigned_by_foreign FOREIGN KEY (assigned_by) REFERENCES public.central_users(id) ON DELETE SET NULL;


--
-- Name: central_user_tenants central_user_tenants_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_user_tenants
    ADD CONSTRAINT central_user_tenants_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: central_user_tenants central_user_tenants_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.central_user_tenants
    ADD CONSTRAINT central_user_tenants_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.central_users(id) ON DELETE CASCADE;


--
-- Name: cms_translation_versions cms_translation_versions_translation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cms_translation_versions
    ADD CONSTRAINT cms_translation_versions_translation_id_foreign FOREIGN KEY (translation_id) REFERENCES public.cms_translations(id) ON DELETE CASCADE;


--
-- Name: digital_access_logs digital_access_logs_patron_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_access_logs
    ADD CONSTRAINT digital_access_logs_patron_id_foreign FOREIGN KEY (patron_id) REFERENCES public.patrons(id) ON DELETE SET NULL;


--
-- Name: digital_access_logs digital_access_logs_resource_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_access_logs
    ADD CONSTRAINT digital_access_logs_resource_id_foreign FOREIGN KEY (resource_id) REFERENCES public.digital_resources(id) ON DELETE SET NULL;


--
-- Name: digital_resources digital_resources_biblio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_resources
    ADD CONSTRAINT digital_resources_biblio_id_foreign FOREIGN KEY (biblio_id) REFERENCES public.bibliographic_records(id) ON DELETE CASCADE;


--
-- Name: domains domains_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: inventory_scans inventory_scans_session_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_scans
    ADD CONSTRAINT inventory_scans_session_id_foreign FOREIGN KEY (session_id) REFERENCES public.inventory_sessions(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_payment_transaction_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_payment_transaction_id_foreign FOREIGN KEY (payment_transaction_id) REFERENCES public.payment_transactions(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: loans loans_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.physical_items(id) ON DELETE CASCADE;


--
-- Name: loans loans_patron_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_patron_id_foreign FOREIGN KEY (patron_id) REFERENCES public.patrons(id) ON DELETE CASCADE;


--
-- Name: locations locations_parent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_parent_id_foreign FOREIGN KEY (parent_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: model_has_permissions model_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_permissions
    ADD CONSTRAINT model_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: model_has_roles model_has_roles_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.model_has_roles
    ADD CONSTRAINT model_has_roles_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: patrons patrons_patron_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patrons
    ADD CONSTRAINT patrons_patron_category_id_foreign FOREIGN KEY (patron_category_id) REFERENCES public.patron_categories(id) ON DELETE SET NULL;


--
-- Name: payment_transactions payment_transactions_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: payment_transactions payment_transactions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: payment_transactions payment_transactions_verified_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_transactions
    ADD CONSTRAINT payment_transactions_verified_by_foreign FOREIGN KEY (verified_by) REFERENCES public.central_users(id) ON DELETE SET NULL;


--
-- Name: physical_items physical_items_biblio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_biblio_id_foreign FOREIGN KEY (biblio_id) REFERENCES public.bibliographic_records(id) ON DELETE CASCADE;


--
-- Name: physical_items physical_items_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_collection_id_foreign FOREIGN KEY (collection_id) REFERENCES public.collections(id) ON DELETE SET NULL;


--
-- Name: physical_items physical_items_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.physical_items
    ADD CONSTRAINT physical_items_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.locations(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_biblio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_biblio_id_foreign FOREIGN KEY (biblio_id) REFERENCES public.bibliographic_records(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.physical_items(id) ON DELETE SET NULL;


--
-- Name: reservations reservations_patron_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_patron_id_foreign FOREIGN KEY (patron_id) REFERENCES public.patrons(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_has_permissions role_has_permissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_has_permissions
    ADD CONSTRAINT role_has_permissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: serial_issues serial_issues_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_issues
    ADD CONSTRAINT serial_issues_item_id_foreign FOREIGN KEY (item_id) REFERENCES public.physical_items(id) ON DELETE SET NULL;


--
-- Name: serial_issues serial_issues_serial_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serial_issues
    ADD CONSTRAINT serial_issues_serial_id_foreign FOREIGN KEY (serial_id) REFERENCES public.serials(id) ON DELETE CASCADE;


--
-- Name: serials serials_biblio_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.serials
    ADD CONSTRAINT serials_biblio_id_foreign FOREIGN KEY (biblio_id) REFERENCES public.bibliographic_records(id) ON DELETE SET NULL;


--
-- Name: subscriptions subscriptions_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: subscriptions subscriptions_tenant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_tenant_id_foreign FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: tenants tenants_created_by_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_created_by_id_foreign FOREIGN KEY (created_by_id) REFERENCES public.central_users(id) ON DELETE SET NULL;


--
-- Name: tenants tenants_managed_by_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_managed_by_id_foreign FOREIGN KEY (managed_by_id) REFERENCES public.central_users(id) ON DELETE SET NULL;


--
-- Name: tenants tenants_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_plan_id_foreign FOREIGN KEY (plan_id) REFERENCES public.plans(id) ON DELETE SET NULL;


--
-- Name: translation_api_logs translation_api_logs_translation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translation_api_logs
    ADD CONSTRAINT translation_api_logs_translation_id_foreign FOREIGN KEY (translation_id) REFERENCES public.cms_translations(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict ldEcqG3HXSxahxhPjieVdwU3yR6J2QaJVtoDbYSPKJlvw25pEcdauUzmdxy1gGb

