--
-- PostgreSQL database dump
--

\restrict hIi6J70ylwhwogg4UNDRQ7g7SlNenksQy0JNXok6lJeYpUMBa1jdWRBzyN1If5n

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
            DECLARE
                author_names TEXT := '';
                kw_text TEXT := '';
            BEGIN
                -- Extract author names from JSONB array
                BEGIN
                    SELECT string_agg(elem->>'name', ' ')
                    INTO author_names
                    FROM jsonb_array_elements(
                        CASE jsonb_typeof(NEW.authors)
                            WHEN 'array' THEN NEW.authors
                            ELSE '[]'::jsonb
                        END
                    ) AS elem;
                EXCEPTION WHEN OTHERS THEN
                    author_names := '';
                END;

                -- Extract keywords from text array
                BEGIN
                    kw_text := array_to_string(
                        COALESCE(NEW.keywords, ARRAY[]::text[]),
                        ' '
                    );
                EXCEPTION WHEN OTHERS THEN
                    kw_text := '';
                END;

                NEW.search_vector :=
                    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(NEW.title_alternative, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.subtitle, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(author_names, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.publisher, '')), 'C') ||
                    setweight(to_tsvector('english', coalesce(kw_text, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(NEW.abstract, '')), 'C') ||
                    setweight(to_tsvector('simple',  coalesce(NEW.isbn, '')), 'A') ||
                    setweight(to_tsvector('simple',  coalesce(NEW.issn, '')), 'A');

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
-- Name: activity_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_log (
    id bigint NOT NULL,
    log_name character varying(255),
    description text NOT NULL,
    subject_type character varying(255),
    subject_id character varying(255),
    event character varying(255),
    causer_type character varying(255),
    causer_id character varying(255),
    properties json,
    batch_uuid uuid,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.activity_log OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_log_id_seq OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: agents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agents (
    id uuid NOT NULL,
    type character varying(20) DEFAULT 'person'::character varying NOT NULL,
    name character varying(500) NOT NULL,
    name_km character varying(500),
    numeration character varying(50),
    title_words character varying(200),
    dates character varying(100),
    fuller_form character varying(300),
    birth_date character varying(20),
    death_date character varying(20),
    location character varying(300),
    date_range character varying(100),
    authority_uri character varying(500),
    lc_id character varying(50),
    isni character varying(30),
    viaf_id character varying(50),
    orcid character varying(30),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.agents OWNER TO postgres;

--
-- Name: ai_suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_suggestions (
    id uuid NOT NULL,
    record_id uuid NOT NULL,
    field_name character varying(50) NOT NULL,
    suggested_value text NOT NULL,
    confidence numeric(3,2),
    source character varying(20) DEFAULT 'gemini'::character varying NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp(0) with time zone,
    metadata json,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone
);


ALTER TABLE public.ai_suggestions OWNER TO postgres;

--
-- Name: ai_usage_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_usage_logs (
    id uuid NOT NULL,
    feature character varying(50) NOT NULL,
    input_tokens integer DEFAULT 0 NOT NULL,
    output_tokens integer DEFAULT 0 NOT NULL,
    cost_usd numeric(10,6) DEFAULT '0'::numeric NOT NULL,
    response_time_ms integer DEFAULT 0 NOT NULL,
    cache_hit boolean DEFAULT false NOT NULL,
    status character varying(20) NOT NULL,
    error_message text,
    user_id uuid,
    record_id uuid,
    created_at timestamp(0) with time zone NOT NULL,
    provider character varying(20) DEFAULT 'gemini'::character varying NOT NULL
);


ALTER TABLE public.ai_usage_logs OWNER TO postgres;

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
    deleted_by uuid,
    work_id uuid,
    responsibility_statement character varying(500),
    content_type character varying(50),
    media_type character varying(50),
    carrier_type character varying(50),
    issuance character varying(30),
    dimensions character varying(100),
    frequency character varying(50),
    color_content character varying(50),
    illustrative_content json DEFAULT '[]'::json NOT NULL,
    publication_date_full character varying(50),
    country_code character varying(3),
    genre_form json DEFAULT '[]'::json NOT NULL,
    identifiers json DEFAULT '[]'::json NOT NULL,
    marc_xml text,
    marc_leader character varying(30),
    marc_008 character varying(45),
    bibframe_data jsonb,
    bibframe_instance_uri character varying(500),
    ai_assisted_ddc boolean DEFAULT false NOT NULL,
    ai_assisted_lcc boolean DEFAULT false NOT NULL,
    ai_assisted_abstract boolean DEFAULT false NOT NULL,
    ai_assisted_subjects boolean DEFAULT false NOT NULL,
    ai_confidence_ddc numeric(3,2),
    ai_confidence_lcc numeric(3,2)
);


ALTER TABLE public.bibliographic_records OWNER TO postgres;

--
-- Name: card_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.card_templates (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    width_mm numeric(6,2) DEFAULT 85.6 NOT NULL,
    height_mm numeric(6,2) DEFAULT '54'::numeric NOT NULL,
    background_color character varying(20) DEFAULT '#ffffff'::character varying NOT NULL,
    background_image_path character varying(500),
    elements jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.card_templates OWNER TO postgres;

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
-- Name: instance_contributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.instance_contributions (
    id uuid NOT NULL,
    instance_id uuid NOT NULL,
    agent_id uuid,
    agent_name character varying(500),
    agent_type character varying(20) DEFAULT 'person'::character varying NOT NULL,
    role_code character varying(10) DEFAULT 'trl'::character varying NOT NULL,
    role_label character varying(100),
    relator_uri character varying(200),
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.instance_contributions OWNER TO postgres;

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
-- Name: label_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.label_templates (
    id uuid NOT NULL,
    name character varying(150) NOT NULL,
    page_size character varying(10) DEFAULT 'A4'::character varying NOT NULL,
    margin_top_mm numeric(6,2) DEFAULT '10'::numeric NOT NULL,
    margin_left_mm numeric(6,2) DEFAULT '8'::numeric NOT NULL,
    columns smallint DEFAULT '3'::smallint NOT NULL,
    rows smallint DEFAULT '8'::smallint NOT NULL,
    label_width_mm numeric(6,2) DEFAULT 63.5 NOT NULL,
    label_height_mm numeric(6,2) DEFAULT 33.9 NOT NULL,
    gap_x_mm numeric(6,2) DEFAULT 2.5 NOT NULL,
    gap_y_mm numeric(6,2) DEFAULT '0'::numeric NOT NULL,
    background_color character varying(20) DEFAULT '#ffffff'::character varying NOT NULL,
    elements jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


ALTER TABLE public.label_templates OWNER TO postgres;

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
    model_id uuid NOT NULL
);


ALTER TABLE public.model_has_permissions OWNER TO postgres;

--
-- Name: model_has_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.model_has_roles (
    role_id bigint NOT NULL,
    model_type character varying(255) NOT NULL,
    model_id uuid NOT NULL
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
    deleted_at timestamp(0) without time zone,
    photo_url character varying(255)
);


ALTER TABLE public.patrons OWNER TO postgres;

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
    description character varying(255),
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
    updated_at timestamp(0) without time zone,
    expected_date date,
    notes text,
    claimed_at timestamp(0) without time zone
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
    updated_at timestamp(0) without time zone,
    issn character varying(10),
    subscription_cost numeric(8,2),
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    location_id integer,
    collection_id integer,
    call_number character varying(100)
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
-- Name: work_contributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.work_contributions (
    id uuid NOT NULL,
    work_id uuid NOT NULL,
    agent_id uuid,
    agent_name character varying(500),
    agent_type character varying(20) DEFAULT 'person'::character varying NOT NULL,
    role_code character varying(10) DEFAULT 'aut'::character varying NOT NULL,
    role_label character varying(100),
    relator_uri character varying(200),
    is_primary boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.work_contributions OWNER TO postgres;

--
-- Name: works; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.works (
    id uuid NOT NULL,
    title character varying(500) NOT NULL,
    title_km character varying(1000),
    title_uniform character varying(500),
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    languages json DEFAULT '[]'::json NOT NULL,
    content_type character varying(50),
    issuance character varying(30) DEFAULT 'mono'::character varying NOT NULL,
    origin_date character varying(20),
    subjects json DEFAULT '[]'::json NOT NULL,
    keywords text,
    genre_form json DEFAULT '[]'::json NOT NULL,
    ddc_class character varying(50),
    lcc_class character varying(50),
    summary text,
    summary_km text,
    table_of_contents text,
    notes text,
    series_title character varying(300),
    series_number character varying(20),
    lccn character varying(30),
    oclc_number character varying(30),
    authority_uri character varying(500),
    bibframe_data jsonb,
    record_status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    cataloger_id uuid,
    cataloged_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    ai_assisted_ddc boolean DEFAULT false NOT NULL,
    ai_assisted_lcc boolean DEFAULT false NOT NULL,
    ai_confidence_ddc numeric(3,2),
    ai_confidence_lcc numeric(3,2)
);


ALTER TABLE public.works OWNER TO postgres;

--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: collections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.collections ALTER COLUMN id SET DEFAULT nextval('public.collections_id_seq'::regclass);


--
-- Name: daily_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_stats ALTER COLUMN id SET DEFAULT nextval('public.daily_stats_id_seq'::regclass);


--
-- Name: inventory_scans id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_scans ALTER COLUMN id SET DEFAULT nextval('public.inventory_scans_id_seq'::regclass);


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
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


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
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_log (id, log_name, description, subject_type, subject_id, event, causer_type, causer_id, properties, batch_uuid, created_at, updated_at) FROM stdin;
1	default	created	App\\Models\\Tenant\\BibliographicRecord	2e239870-8cf7-48f2-adb3-2aa771097f17	\N	\N	\N	[]	\N	2026-06-10 18:49:45	2026-06-10 18:49:45
2	default	created	App\\Models\\Tenant\\BibliographicRecord	af345410-b59a-428a-bf34-c948b3be6386	\N	App\\Models\\Tenant\\User	2392aec3-31de-4980-9f32-0d6d1ca5e501	[]	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
3	default	created	App\\Models\\Tenant\\BibliographicRecord	8586b00b-c8e9-4721-8180-3c0d75e067f0	\N	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	[]	\N	2026-06-10 19:06:43	2026-06-10 19:06:43
4	default	created	App\\Models\\Tenant\\BibliographicRecord	c610de35-7024-41a5-9d12-e49b6d05b89d	\N	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	[]	\N	2026-06-10 19:11:52	2026-06-10 19:11:52
5	default	created	App\\Models\\Tenant\\BibliographicRecord	682e8bf6-eef7-4bb4-95bf-c6e201dbb766	\N	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	[]	\N	2026-06-10 19:13:36	2026-06-10 19:13:36
6	default	created	App\\Models\\Tenant\\BibliographicRecord	d85e1270-66b6-42fd-a1ea-e80c99e2db8a	\N	App\\Models\\Tenant\\User	2392aec3-31de-4980-9f32-0d6d1ca5e501	[]	\N	2026-06-10 19:18:15	2026-06-10 19:18:15
7	default	created	App\\Models\\Tenant\\BibliographicRecord	246d1403-8e1b-46da-89d1-d07f8b6aee44	\N	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	[]	\N	2026-06-10 23:14:45	2026-06-10 23:14:45
8	default	created	App\\Models\\Tenant\\BibliographicRecord	4cc89bfd-8c20-47a7-a41e-d20d2aea03fb	\N	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	[]	\N	2026-06-11 00:08:57	2026-06-11 00:08:57
9	default	created	App\\Models\\Tenant\\BibliographicRecord	bfc00a0d-333a-4b6e-93fc-2e28fd8cb0c1	\N	\N	\N	[]	\N	2026-06-11 09:05:18	2026-06-11 09:05:18
10	default	updated	App\\Models\\Tenant\\BibliographicRecord	bfc00a0d-333a-4b6e-93fc-2e28fd8cb0c1	\N	\N	\N	[]	\N	2026-06-11 09:05:18	2026-06-11 09:05:18
11	default	created	App\\Models\\Tenant\\BibliographicRecord	3efe7c29-3b9f-4bf1-afbc-956733a8212c	\N	\N	\N	[]	\N	2026-06-11 09:06:51	2026-06-11 09:06:51
12	default	updated	App\\Models\\Tenant\\BibliographicRecord	3efe7c29-3b9f-4bf1-afbc-956733a8212c	\N	\N	\N	[]	\N	2026-06-11 09:06:51	2026-06-11 09:06:51
13	default	created	App\\Models\\Tenant\\BibliographicRecord	3c5b88c9-f216-49fb-9d02-b4f4393d754c	\N	\N	\N	[]	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
14	default	updated	App\\Models\\Tenant\\BibliographicRecord	3c5b88c9-f216-49fb-9d02-b4f4393d754c	\N	\N	\N	[]	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
15	default	created	App\\Models\\Tenant\\BibliographicRecord	072f8ca6-b49d-4ca4-b054-4664a5bfaa3e	\N	\N	\N	[]	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
16	default	created	App\\Models\\Tenant\\BibliographicRecord	aae94d9e-df3f-42f2-a6fa-130840529b05	\N	\N	\N	[]	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
17	default	updated	App\\Models\\Tenant\\BibliographicRecord	aae94d9e-df3f-42f2-a6fa-130840529b05	\N	\N	\N	[]	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
\.


--
-- Data for Name: agents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agents (id, type, name, name_km, numeration, title_words, dates, fuller_form, birth_date, death_date, location, date_range, authority_uri, lc_id, isni, viaf_id, orcid, created_at, updated_at) FROM stdin;
019eb2de-7a32-70da-819e-54ce58b5a531	person	Robertson Davies	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 18:49:45	2026-06-10 18:49:45
019eb2eb-fbae-7197-95f3-757e0fb1a5a0	person	John D. Daniels	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbc2-7114-8d7d-884681f7b1f0	person	Lee H. Radebaugh	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbd2-727e-9121-7e7b4c6eaa3b	person	Daniel P. Sullivan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbe2-7201-84de-2b3affc38726	person	John Daniels	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbf3-710c-a257-82bbb2944865	person	Daniel Sullivan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2f8-92f6-714e-af0b-8498721cfc14	person	Eric Carle	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-10 19:18:15	2026-06-10 19:18:15
019eb5ed-b9da-7070-a3ac-60d661b033e7	person	Test Author	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-11 09:05:16	2026-06-11 09:05:16
019eb5f3-14a7-7182-a66c-dd4e827874f1	person	Sole Author	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
019eb5f3-1593-73a9-b56e-cb9e9213c4e2	person	Shared Author	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-11 09:11:07	2026-06-11 09:11:07
\.


--
-- Data for Name: ai_suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_suggestions (id, record_id, field_name, suggested_value, confidence, source, status, reviewed_by, reviewed_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_usage_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ai_usage_logs (id, feature, input_tokens, output_tokens, cost_usd, response_time_ms, cache_hit, status, error_message, user_id, record_id, created_at, provider) FROM stdin;
019eba05-2a57-7395-8788-a5ffb500342e	ddc_lcc_classification	0	0	0.000000	3197	f	error	Gemini API error: 403 - {\n  "error": {\n    "code": 403,\n    "message": "Method doesn't allow unregistered callers (callers without established identity). Please use API Key or other form of API consumer identity to call this API.",\n    "status": "PERMISSION_DENIED"\n  }\n}\n	1be6c56a-cc16-4005-971d-4e2d01068e49	\N	2026-06-12 04:09:21+07	gemini
\.


--
-- Data for Name: bibliographic_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bibliographic_records (id, title, title_alternative, subtitle, title_km, authors, isbn, issn, doi, publisher, publisher_place, publication_year, edition, volume, issue, pages, language, subjects, keywords, ddc_class, lcc_class, abstract, abstract_km, material_type_id, rights, series_title, series_number, geographic_coverage, source, notes, table_of_contents, cover_image_url, search_vector, record_status, cataloger_id, cataloged_at, created_at, updated_at, deleted_at, deleted_by, work_id, responsibility_statement, content_type, media_type, carrier_type, issuance, dimensions, frequency, color_content, illustrative_content, publication_date_full, country_code, genre_form, identifiers, marc_xml, marc_leader, marc_008, bibframe_data, bibframe_instance_uri, ai_assisted_ddc, ai_assisted_lcc, ai_assisted_abstract, ai_assisted_subjects, ai_confidence_ddc, ai_confidence_lcc) FROM stdin;
a7891701-d3ec-4093-9187-f734ce4bfed0	Clean Code: A Handbook of Agile Software Craftsmanship	\N	\N	\N	[{"name":"Robert C. Martin","role":"author"}]	9780132350884	\N	\N	Prentice Hall	Upper Saddle River, NJ	2008	1st	\N	\N	431	en	[{"term":"Computer programming","scheme":"LCSH"},{"term":"Software engineering","scheme":"LCSH"}]	clean code, refactoring, software craftsmanship	005.133	\N	Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must for any developer, software engineer, project manager, team lead, or systems analyst.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780132350884':48A 'agil':6A 'analyst':47C 'bad':12C 'book':32C 'bring':24C 'clean':1A,21C 'code':2A,13C,18C 'craftsmanship':8A 'develop':26C,38C 'engin':40C 'even':11C 'function':15C 'hall':10C 'handbook':4A 'isn':19C 'knee':30C 'lead':44C 'manag':42C 'must':35C 'organ':27C 'prentic':9C 'project':41C 'softwar':7A,39C 'system':46C 'team':43C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
0e119795-0761-4bbe-8ebf-82790e17e2a4	The Pragmatic Programmer: Your Journey to Mastery	\N	\N	\N	[{"name":"David Thomas","role":"author"},{"name":"Andrew Hunt","role":"author"}]	9780135957059	\N	\N	Addison-Wesley	Boston, MA	2019	2nd	\N	\N	352	en	[{"term":"Software engineering","scheme":"LCSH"}]	pragmatic, programming, best practices	005.1	\N	The classic guide for software developers, fully updated for modern development practices.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780135957059':23A 'addison':9C 'addison-wesley':8C 'classic':12C 'develop':16C,21C 'fulli':17C 'guid':13C 'journey':5A 'masteri':7A 'modern':20C 'practic':22C 'pragmat':2A 'programm':3A 'softwar':15C 'updat':18C 'wesley':10C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
68b81613-71a8-487e-a8a9-e16dacb43888	Design Patterns: Elements of Reusable Object-Oriented Software	\N	\N	\N	[{"name":"Erich Gamma","role":"author"},{"name":"Richard Helm","role":"author"},{"name":"Ralph Johnson","role":"author"},{"name":"John Vlissides","role":"author"}]	9780201633610	\N	\N	Addison-Wesley	Reading, MA	1994	1st	\N	\N	395	en	[{"term":"Object-oriented programming","scheme":"LCSH"},{"term":"Software patterns","scheme":"LCSH"}]	design patterns, OOP, gang of four	005.117	\N	Capturing a wealth of experience about the design of object-oriented software. This book is a catalog of design patterns that serve as templates for solutions to common problems.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780201633610':43A 'addison':11C 'addison-wesley':10C 'book':27C 'captur':13C 'catalog':30C 'common':41C 'design':1A,20C,32C 'element':3A 'experi':17C 'object':7A,23C 'object-ori':6A,22C 'orient':8A,24C 'pattern':2A,33C 'problem':42C 'reusabl':5A 'serv':35C 'softwar':9A,25C 'solut':39C 'templat':37C 'wealth':15C 'wesley':12C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7460ddba-e374-4298-a7a3-b479c27e8fe4	Introduction to Algorithms	\N	\N	\N	[{"name":"Thomas H. Cormen","role":"author"},{"name":"Charles E. Leiserson","role":"author"}]	9780262046305	\N	\N	MIT Press	Cambridge, MA	2022	4th	\N	\N	1312	en	[{"term":"Computer algorithms","scheme":"LCSH"},{"term":"Data structures","scheme":"LCSH"}]	algorithms, data structures, computer science	005.1	\N	A comprehensive introduction to algorithms covering a broad range of algorithms in depth, yet making their design and analysis accessible to all levels.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780262046305':29A 'access':25C 'algorithm':3A,10C,16C 'analysi':24C 'broad':13C 'comprehens':7C 'cover':11C 'depth':18C 'design':22C 'introduct':1A,8C 'level':28C 'make':20C 'mit':4C 'press':5C 'rang':14C 'yet':19C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9c69fa5a-1a23-4f9a-8a1e-bf3ebe08b1e0	Laravel: Up & Running	\N	A Framework for Building Modern PHP Apps	\N	[{"name":"Matt Stauffer","role":"author"}]	9781098153267	\N	\N	O'Reilly Media	Sebastopol, CA	2023	3rd	\N	\N	560	en	[{"term":"PHP (Computer program language)","scheme":"LCSH"},{"term":"Web application development","scheme":"LCSH"}]	laravel, php, web development	005.276	\N	The best guide to Laravel, the PHP framework that makes building modern web apps fast and enjoyable.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9781098153267':31A 'app':10B,27C 'best':15C 'build':7B,24C 'enjoy':30C 'fast':28C 'framework':5B,21C 'guid':16C 'laravel':1A,18C 'make':23C 'media':13C 'modern':8B,25C 'o':11C 'php':9B,20C 'reilli':12C 'run':3A 'web':26C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
72bb8b21-c803-4a20-afd1-d10ce79e047c	JavaScript: The Good Parts	\N	\N	\N	[{"name":"Douglas Crockford","role":"author"}]	9780596517748	\N	\N	O'Reilly Media	Sebastopol, CA	2008	1st	\N	\N	153	en	[{"term":"JavaScript (Computer program language)","scheme":"LCSH"}]	javascript, web development, programming	005.276	\N	Most programming languages contain good and bad parts, but JavaScript has more than its share of the bad. This book identifies the good parts of JavaScript.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780596517748':34A 'bad':14C,25C 'book':27C 'contain':11C 'good':3A,12C,30C 'identifi':28C 'javascript':1A,17C,33C 'languag':10C 'media':7C 'o':5C 'part':4A,15C,31C 'program':9C 'reilli':6C 'share':22C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5fb0e8c6-6089-4de9-8f66-f5a571a19287	The Art of War	\N	\N	\N	[{"name":"Sun Tzu","role":"author"},{"name":"Lionel Giles","role":"translator"}]	9781599869773	\N	\N	Filiquarian Publishing	Minneapolis, MN	2007	\N	\N	\N	68	en	[{"term":"Military art and science","scheme":"LCSH"},{"term":"War","scheme":"LCSH"}]	strategy, military, philosophy	355.02	\N	The Art of War is an ancient Chinese military treatise attributed to Sun Tzu. This timeless text on strategy has influenced military thinking, business tactics and beyond.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9781599869773':34A 'ancient':13C 'art':2A,8C 'attribut':17C 'beyond':33C 'busi':30C 'chines':14C 'filiquarian':5C 'influenc':27C 'militari':15C,28C 'publish':6C 'strategi':25C 'sun':19C 'tactic':31C 'text':23C 'think':29C 'timeless':22C 'treatis':16C 'tzu':20C 'war':4A,10C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
57a63df8-328d-4d58-b120-164d15d14541	Thinking, Fast and Slow	\N	\N	\N	[{"name":"Daniel Kahneman","role":"author"}]	9780374533557	\N	\N	Farrar, Straus and Giroux	New York, NY	2013	\N	\N	\N	499	en	[{"term":"Thought and thinking","scheme":"LCSH"},{"term":"Psychology","scheme":"LCSH"}]	psychology, behavioural economics, decision making	153.4	\N	Daniel Kahneman explains the two systems that drive the way we think. System 1 is fast, intuitive, and emotional; System 2 is slower, more deliberative, and more logical.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'1':22C '2':29C '9780374533557':37A 'daniel':9C 'delib':33C 'drive':16C 'emot':27C 'explain':11C 'farrar':5C 'fast':2A,24C 'giroux':8C 'intuit':25C 'kahneman':10C 'logic':36C 'slow':4A 'slower':31C 'straus':6C 'system':14C,21C,28C 'think':1A,20C 'two':13C 'way':18C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
a619ccea-d8f1-4f3b-b5b4-47c958b75017	Sapiens: A Brief History of Humankind	\N	\N	\N	[{"name":"Yuval Noah Harari","role":"author"}]	9780062316097	\N	\N	Harper	New York, NY	2015	\N	\N	\N	443	en	[{"term":"Human evolution","scheme":"LCSH"},{"term":"History","scheme":"LCSH"}]	history, human evolution, anthropology	909	\N	A brief history of humankind — from the Stone Age through to the 21st century. Explores how biology and history have defined us and enhanced our understanding of what it means to be human.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'21st':20C '9780062316097':41A 'age':16C 'biolog':24C 'brief':3A,9C 'centuri':21C 'defin':28C 'enhanc':31C 'explor':22C 'harper':7C 'histori':4A,10C,26C 'human':40C 'humankind':6A,12C 'mean':37C 'sapien':1A 'stone':15C 'understand':33C 'us':29C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
31e35699-6d26-413b-bb21-1e2d3ac888a2	Atomic Habits	\N	An Easy & Proven Way to Build Good Habits & Break Bad Ones	\N	[{"name":"James Clear","role":"author"}]	9780735211292	\N	\N	Avery	New York, NY	2018	\N	\N	\N	320	en	[{"term":"Habit","scheme":"LCSH"},{"term":"Self-improvement","scheme":"LCSH"}]	habits, self-improvement, productivity	158.1	\N	James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780735211292':43A 'atom':1A 'averi':14C 'bad':12B,41C 'break':11B,40C 'build':8B 'clear':16C 'easi':4B 'exact':34C 'expert':23C 'form':37C 'format':26C 'good':9B,38C 'habit':2A,10B,25C,39C 'jame':15C 'lead':22C 'one':13B,17C,42C 'practic':28C 'proven':5B 'reveal':27C 'strategi':29C 'teach':32C 'way':6B 'world':20C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
b27f9424-f52c-453b-9f90-70bffbe572a6	The Great Gatsby	\N	\N	\N	[{"name":"F. Scott Fitzgerald","role":"author"}]	9780743273565	\N	\N	Scribner	New York, NY	2004	\N	\N	\N	180	en	[{"term":"Fiction","scheme":"LCSH"},{"term":"American literature","scheme":"LCSH"}]	american dream, jazz age, classic fiction	813.52	\N	Set in the Jazz Age on Long Island, the novel depicts narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession with Daisy Buchanan.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9780743273565':33A 'age':9C 'buchanan':32C 'carraway':18C 'daisi':31C 'depict':15C 'gatsbi':3A,25C,27C 'great':2A 'interact':20C 'island':12C 'jay':24C 'jazz':8C 'long':11C 'millionair':23C 'mysteri':22C 'narrat':16C 'nick':17C 'novel':14C 'obsess':29C 'scribner':4C 'set':5C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f6099df4-21be-449b-88b1-a47b2d4d39fa	Digital Transformation in Education	\N	Strategies for ASEAN Institutions	\N	[{"name":"Sophea Chann","role":"author"},{"name":"Dara Prak","role":"editor"}]	9789997100015	\N	\N	Corasoft Press	Phnom Penh	2023	1st	\N	\N	280	en	[{"term":"Education and technology","scheme":"LCSH"},{"term":"Educational change","scheme":"LCSH"}]	digital transformation, education, ASEAN, Cambodia	371.33	\N	A comprehensive guide to digital transformation strategies for educational institutions across Southeast Asia, with case studies from Cambodia, Vietnam, and Thailand.	\N	1	\N	\N	\N	\N	\N	\N	\N	\N	'9789997100015':32A 'across':21C 'asean':7B 'asia':23C 'cambodia':28C 'case':25C 'comprehens':12C 'corasoft':9C 'digit':1A,15C 'educ':4A,19C 'guid':13C 'institut':8B,20C 'press':10C 'southeast':22C 'strategi':5B,17C 'studi':26C 'thailand':31C 'transform':2A,16C 'vietnam':29C	active	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f1322884-c7fc-4ace-b00a-ca3d6a29ec0f	Clean Code	\N	\N	\N	[{"name":"Robert C. Martin","role":"author"}]	\N	\N	\N	Prentice Hall	\N	2008	\N	\N	\N	\N	en	[]	\N	005.133	\N	A handbook of agile software craftsmanship covering naming, functions, comments, and refactoring.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg	'agil':8C 'clean':1A 'code':2A 'comment':14C 'cover':11C 'craftsmanship':10C 'function':13C 'hall':4C 'handbook':6C 'name':12C 'prentic':3C 'refactor':16C 'softwar':9C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
3f41060e-77e4-45a8-b5d9-640e31b4210d	The Pragmatic Programmer	\N	\N	\N	[{"name":"David Thomas","role":"author"}]	\N	\N	\N	Addison-Wesley	\N	2019	\N	\N	\N	\N	en	[]	\N	005.1	\N	Your journey to mastery — from apprentice to journeyman. Updated for modern development practices.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg	'addison':5C 'addison-wesley':4C 'apprentic':12C 'develop':18C 'journey':8C 'journeyman':14C 'masteri':10C 'modern':17C 'practic':19C 'pragmat':2A 'programm':3A 'updat':15C 'wesley':6C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
0e2e0f57-e910-408c-a62b-657cd00947ae	Nature — Vol. 621 (2023)	\N	\N	\N	[{"name":"Nature Editorial Board","role":"editor"}]	\N	\N	\N	Springer Nature	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Weekly international science journal covering all branches of natural sciences.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/nature621/200/280	'2023':4A '621':3A 'branch':13C 'cover':11C 'intern':8C 'journal':10C 'natur':1A,6C,15C 'scienc':9C,16C 'springer':5C 'vol':2A 'week':7C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
6ee6cb52-14c9-4893-bcbf-7b4b3eb41255	Harvard Business Review — Nov/Dec 2023	\N	\N	\N	[{"name":"HBR Editors","role":"editor"}]	\N	\N	\N	Harvard Business Publishing	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Management insights, research, and best practices for business leaders.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/hbr2023/200/280	'2023':5A 'best':13C 'busi':2A,7C,16C 'harvard':1A,6C 'insight':10C 'leader':17C 'manag':9C 'nov/dec':4A 'practic':14C 'publish':8C 'research':11C 'review':3A	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e33bd29a-dc90-4be4-a661-8b495b8e173e	Machine Learning Fundamentals — Lecture Series	\N	\N	\N	[{"name":"Dr. Andrew Ng","role":"author"}]	\N	\N	\N	Coursera Audio	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures covering supervised learning, neural networks, and practical ML tips.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/mlng/200/280	'audio':7C 'coursera':6C 'cover':10C 'fundament':3A 'learn':2A,12C 'lectur':4A,9C 'machin':1A 'ml':17C 'network':14C 'neural':13C 'practic':16C 'record':8C 'seri':5A 'supervis':11C 'tip':18C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
d1d30095-adcc-4a0d-800f-12d906018543	The Psychology of Money — Audiobook	\N	\N	\N	[{"name":"Morgan Housel","role":"author"}]	\N	\N	\N	Harriman House	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Timeless lessons on wealth, greed, and happiness from one of the most acclaimed finance writers.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/psychmoney/200/280	'acclaim':20C 'audiobook':5A 'financ':21C 'greed':12C 'happi':14C 'harriman':6C 'hous':7C 'lesson':9C 'money':4A 'one':16C 'psycholog':2A 'timeless':8C 'wealth':11C 'writer':22C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5bb43021-caba-4bde-a192-bc4e12afefd6	Angkor Wat: A Civilisation Uncovered	\N	\N	\N	[{"name":"BBC Documentary Team","role":"author"}]	\N	\N	\N	BBC Studios	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary exploring the history, archaeology, and cultural significance of the Angkor temples.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/angkorwat/200/280	'angkor':1A,18C 'archaeolog':12C 'bbc':6C 'civilis':4A 'cultur':14C 'documentari':8C 'explor':9C 'histori':11C 'signific':15C 'studio':7C 'templ':19C 'uncov':5A 'wat':2A	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
4be6a5c6-d7e5-442c-8ec2-24fbeb4e3643	Introduction to Blockchain Technology	\N	\N	\N	[{"name":"MIT OpenCourseWare","role":"author"}]	\N	\N	\N	MIT OCW	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures from MIT 6.S974: cryptocurrency and blockchain fundamentals.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/blockchain/200/280	'6':11C 'blockchain':3A,15C 'cryptocurr':13C 'fundament':16C 'introduct':1A 'lectur':8C 'mit':5C,10C 'ocw':6C 'record':7C 's974':12C 'technolog':4A	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e7c0445b-edcf-42ad-acbd-21210cfa551a	The Impact of Microfinance on Rural Poverty Reduction in Cambodia	\N	\N	\N	[{"name":"Ratana Chan","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2022	\N	\N	\N	198	en	[]	\N	332.7	\N	Empirical study examining how MFI lending affects household income and poverty indicators across three provinces.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/thesis-micro/200/280	'across':28C 'affect':22C 'cambodia':10A 'empir':16C 'examin':18C 'household':23C 'impact':2A 'incom':24C 'indic':27C 'lend':21C 'mfi':20C 'microfin':4A 'penh':15C 'phnom':14C 'poverti':7A,26C 'provinc':30C 'reduct':8A 'royal':11C 'rural':6A 'studi':17C 'three':29C 'univers':12C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
fd6cd00e-2e3f-4e39-83ee-6707e3276431	AI-Assisted Language Learning for Khmer Secondary Students	\N	\N	\N	[{"name":"Bunna Heng","role":"author"}]	\N	\N	\N	Institute of Technology of Cambodia	\N	2023	\N	\N	\N	142	en	[]	\N	418.0078	\N	Mixed-methods research on the effectiveness of AI chatbots in improving English proficiency among Khmer-speaking students.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/thesis-ai/200/280	'ai':2A,23C 'ai-assist':1A 'among':29C 'assist':3A 'cambodia':14C 'chatbot':24C 'effect':21C 'english':27C 'improv':26C 'institut':10C 'khmer':7A,31C 'khmer-speak':30C 'languag':4A 'learn':5A 'method':17C 'mix':16C 'mixed-method':15C 'profici':28C 'research':18C 'secondari':8A 'speak':32C 'student':9A,33C 'technolog':12C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9a205de1-3003-40e3-9451-c768c14dae08	Design Patterns: Elements of Reusable Object-Oriented Software	\N	\N	\N	[{"name":"Erich Gamma","role":"author"}]	9780201633610	\N	\N	Addison-Wesley	\N	1994	\N	\N	\N	395	en	[]	\N	005.117	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg	'9780201633610':13A 'addison':11C 'addison-wesley':10C 'design':1A 'element':3A 'object':7A 'object-ori':6A 'orient':8A 'pattern':2A 'reusabl':5A 'softwar':9A 'wesley':12C	active	\N	2026-06-10 05:32:12	2026-06-10 05:32:12	2026-06-10 05:32:12	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f9631283-af0f-4667-967e-1e111437f085	Introduction to Algorithms	\N	\N	\N	[{"name":"Thomas H. Cormen","role":"author"}]	9780262046305	\N	\N	MIT Press	\N	2022	\N	\N	\N	1312	en	[]	\N	005.1	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg	'9780262046305':6A 'algorithm':3A 'introduct':1A 'mit':4C 'press':5C	active	\N	2026-06-10 05:32:13	2026-06-10 05:32:13	2026-06-10 05:32:13	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
497c43a9-30e3-42b5-b6c0-6e879df0c204	Clean Code	\N	\N	\N	[{"name":"Robert C. Martin","role":"author"}]	\N	\N	\N	Prentice Hall	\N	2008	\N	\N	\N	\N	en	[]	\N	005.133	\N	A handbook of agile software craftsmanship covering naming, functions, comments, and refactoring.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg	'agil':8C 'clean':1A 'code':2A 'comment':14C 'cover':11C 'craftsmanship':10C 'function':13C 'hall':4C 'handbook':6C 'name':12C 'prentic':3C 'refactor':16C 'softwar':9C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
09137895-7297-4ce0-b8e1-093f1e973d1f	The Pragmatic Programmer	\N	\N	\N	[{"name":"David Thomas","role":"author"}]	\N	\N	\N	Addison-Wesley	\N	2019	\N	\N	\N	\N	en	[]	\N	005.1	\N	Your journey to mastery — from apprentice to journeyman. Updated for modern development practices.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg	'addison':5C 'addison-wesley':4C 'apprentic':12C 'develop':18C 'journey':8C 'journeyman':14C 'masteri':10C 'modern':17C 'practic':19C 'pragmat':2A 'programm':3A 'updat':15C 'wesley':6C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e3136c44-1ea7-479b-ba92-cf1de73862a5	Deep Learning	\N	\N	\N	[{"name":"Ian Goodfellow","role":"author"}]	\N	\N	\N	MIT Press	\N	2016	\N	\N	\N	\N	en	[]	\N	006.31	\N	The definitive textbook on deep learning, covering feedforward networks, CNNs, RNNs, and more.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780262035613-M.jpg	'cnns':14C 'cover':11C 'deep':1A,9C 'definit':6C 'feedforward':12C 'learn':2A,10C 'mit':3C 'network':13C 'press':4C 'rnns':15C 'textbook':7C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
02809529-fe7e-4dc4-ac10-a039942f207f	Python Crash Course	\N	\N	\N	[{"name":"Eric Matthes","role":"author"}]	\N	\N	\N	No Starch Press	\N	2023	\N	\N	\N	\N	en	[]	\N	005.133	\N	A hands-on, project-based introduction to programming in Python 3.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg	'3':19C 'base':13C 'cours':3A 'crash':2A 'hand':9C 'hands-on':8C 'introduct':14C 'press':6C 'program':16C 'project':12C 'project-bas':11C 'python':1A,18C 'starch':5C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
67e1fb8b-8341-4501-9b1d-c22f8c6c05fd	Designing Data-Intensive Applications	\N	\N	\N	[{"name":"Martin Kleppmann","role":"author"}]	\N	\N	\N	O'Reilly Media	\N	2017	\N	\N	\N	\N	en	[]	\N	005.74	\N	The big ideas behind reliable, scalable, and maintainable systems.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781449373320-M.jpg	'applic':5A 'behind':12C 'big':10C 'data':3A 'data-intens':2A 'design':1A 'idea':11C 'intens':4A 'maintain':16C 'media':8C 'o':6C 'reilli':7C 'reliabl':13C 'scalabl':14C 'system':17C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
4ea406ea-c7cb-43a9-aa70-781e90557b8a	The Lean Startup	\N	\N	\N	[{"name":"Eric Ries","role":"author"}]	\N	\N	\N	Crown Business	\N	2011	\N	\N	\N	\N	en	[]	\N	658.11	\N	How today's entrepreneurs use continuous innovation to create radically successful businesses.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg	'busi':5C,17C 'continu':11C 'creat':14C 'crown':4C 'entrepreneur':9C 'innov':12C 'lean':2A 'radic':15C 'startup':3A 'success':16C 'today':7C 'use':10C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
cfcfa658-5951-42f4-9e08-d0bfec8abf8f	Atomic Habits	\N	\N	\N	[{"name":"James Clear","role":"author"}]	\N	\N	\N	Avery	\N	2018	\N	\N	\N	\N	en	[]	\N	158.1	\N	An easy and proven way to build good habits and break bad ones.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg	'atom':1A 'averi':3C 'bad':15C 'break':14C 'build':10C 'easi':5C 'good':11C 'habit':2A,12C 'one':16C 'proven':7C 'way':8C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
2d102962-8971-460a-9656-731937e68711	Sapiens: A Brief History of Humankind	\N	\N	\N	[{"name":"Yuval Noah Harari","role":"author"}]	\N	\N	\N	Harper	\N	2015	\N	\N	\N	\N	en	[]	\N	909	\N	How biology and history defined us and enhanced our understanding of what it means to be human.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg	'biolog':9C 'brief':3A 'defin':12C 'enhanc':15C 'harper':7C 'histori':4A,11C 'human':24C 'humankind':6A 'mean':21C 'sapien':1A 'understand':17C 'us':13C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
c3276010-420c-4619-8863-9fc1fecbe452	Introduction to Machine Learning with Python	\N	\N	\N	[{"name":"Andreas M\\u00fcller","role":"author"}]	\N	\N	\N	O'Reilly Media	\N	2017	\N	\N	\N	\N	en	[]	\N	006.31	\N	A guide for scientists and engineers to build machine learning systems with scikit-learn.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781449369415-M.jpg	'build':17C 'engin':15C 'guid':11C 'introduct':1A 'learn':4A,19C,24C 'machin':3A,18C 'media':9C 'o':7C 'python':6A 'reilli':8C 'scientist':13C 'scikit':23C 'scikit-learn':22C 'system':20C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e99f7fd6-a763-4a63-bd84-a1a856e559aa	Thinking, Fast and Slow	\N	\N	\N	[{"name":"Daniel Kahneman","role":"author"}]	\N	\N	\N	Farrar & Giroux	\N	2013	\N	\N	\N	\N	en	[]	\N	153.4	\N	Two systems that drive the way we think — the fast, intuitive System 1 and the deliberative System 2.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg	'1':19C '2':24C 'delib':22C 'drive':10C 'farrar':5C 'fast':2A,16C 'giroux':6C 'intuit':17C 'slow':4A 'system':8C,18C,23C 'think':1A,14C 'two':7C 'way':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
90585af6-d18d-4ad5-b1dc-58162706be67	Zero to One	\N	\N	\N	[{"name":"Peter Thiel","role":"author"}]	\N	\N	\N	Crown Business	\N	2014	\N	\N	\N	\N	en	[]	\N	658.11	\N	Notes on startups, or how to build the future by creating something genuinely new.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780804139021-M.jpg	'build':12C 'busi':5C 'creat':16C 'crown':4C 'futur':14C 'genuin':18C 'new':19C 'note':6C 'one':3A 'someth':17C 'startup':8C 'zero':1A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8d84d552-ccc4-448a-859f-9feb51fcd181	Digital Cambodia	\N	\N	\N	[{"name":"Sophea Chann","role":"author"}]	\N	\N	\N	Corasoft Press	\N	2023	\N	\N	\N	\N	km	[]	\N	338.9	\N	An examination of Cambodia's digital economy, fintech ecosystem, and tech startup landscape.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/digital-cambodia/200/280	'cambodia':2A,8C 'corasoft':3C 'digit':1A,10C 'economi':11C 'ecosystem':13C 'examin':6C 'fintech':12C 'landscap':17C 'press':4C 'startup':16C 'tech':15C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
fe382cd0-3c79-48da-baeb-d2bfc8b45f4c	Nature — Vol. 621 (2023)	\N	\N	\N	[{"name":"Nature Editorial Board","role":"editor"}]	\N	\N	\N	Springer Nature	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Weekly international science journal covering all branches of natural sciences.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/nature621/200/280	'2023':4A '621':3A 'branch':13C 'cover':11C 'intern':8C 'journal':10C 'natur':1A,6C,15C 'scienc':9C,16C 'springer':5C 'vol':2A 'week':7C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
21c04bd2-5882-4ef2-bb3a-6b9d61fe1745	The Lancet — Issue 10391 (2023)	\N	\N	\N	[{"name":"Lancet Editorial Board","role":"editor"}]	\N	\N	\N	Elsevier	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Leading peer-reviewed general medical journal covering global health topics.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/lancet2023/200/280	'10391':4A '2023':5A 'cover':14C 'elsevi':6C 'general':11C 'global':15C 'health':16C 'issu':3A 'journal':13C 'lancet':2A 'lead':7C 'medic':12C 'peer':9C 'peer-review':8C 'review':10C 'topic':17C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
170f2a85-eb89-4672-9883-799971f1fc57	Harvard Business Review — Nov/Dec 2023	\N	\N	\N	[{"name":"HBR Editors","role":"editor"}]	\N	\N	\N	Harvard Business Publishing	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Management insights, research, and best practices for business leaders.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/hbr2023/200/280	'2023':5A 'best':13C 'busi':2A,7C,16C 'harvard':1A,6C 'insight':10C 'leader':17C 'manag':9C 'nov/dec':4A 'practic':14C 'publish':8C 'research':11C 'review':3A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
2ec65667-1d5e-4c93-a61b-9070c570d609	IEEE Spectrum — October 2023	\N	\N	\N	[{"name":"IEEE Editorial Staff","role":"editor"}]	\N	\N	\N	IEEE	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Technology news and analysis from the world's largest technical professional organization.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/ieeespectrum/200/280	'2023':4A 'analysi':9C 'ieee':1A,5C 'largest':14C 'news':7C 'octob':3A 'organ':17C 'profession':16C 'spectrum':2A 'technic':15C 'technolog':6C 'world':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
db824b19-f284-4518-ba05-ead82f67a1a7	Journal of Southeast Asian Studies — Vol. 54 (2023)	\N	\N	\N	[{"name":"NUS Editorial Board","role":"editor"}]	\N	\N	\N	Cambridge University Press	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Scholarly articles on the history, politics, and cultures of Southeast Asia.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/jseas2023/200/280	'2023':8A '54':7A 'articl':13C 'asia':22C 'asian':4A 'cambridg':9C 'cultur':19C 'histori':16C 'journal':1A 'polit':17C 'press':11C 'scholar':12C 'southeast':3A,21C 'studi':5A 'univers':10C 'vol':6A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9214a178-a8f9-45f4-86c5-2d43dbfdc1c3	Cambodian Development Review — Q3 2023	\N	\N	\N	[{"name":"CDRI Staff","role":"editor"}]	\N	\N	\N	CDRI	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Policy research on economics, governance, and social development in Cambodia.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/cdri2023/200/280	'2023':5A 'cambodia':16C 'cambodian':1A 'cdri':6C 'develop':2A,14C 'econom':10C 'govern':11C 'polici':7C 'q3':4A 'research':8C 'review':3A 'social':13C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9132d0d7-2acc-4c2d-af4a-72679b1de670	Asian Survey — Vol. 63 (2023)	\N	\N	\N	[{"name":"UC Berkeley Press","role":"editor"}]	\N	\N	\N	University of California Press	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Bimonthly journal of current affairs and scholarly analysis of Asia and the Pacific.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/asiansurvey/200/280	'2023':5A '63':4A 'affair':14C 'analysi':17C 'asia':19C 'asian':1A 'bimonth':10C 'california':8C 'current':13C 'journal':11C 'pacif':22C 'press':9C 'scholar':16C 'survey':2A 'univers':6C 'vol':3A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
23cc291c-4ad0-4c55-9101-9ea34b5687c8	The Economist — November 2023	\N	\N	\N	[{"name":"The Economist Group","role":"editor"}]	\N	\N	\N	The Economist Group	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	International coverage of world affairs, business, finance, and technology.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/economist2023/200/280	'2023':4A 'affair':12C 'busi':13C 'coverag':9C 'economist':2A,6C 'financ':14C 'group':7C 'intern':8C 'novemb':3A 'technolog':16C 'world':11C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
53ebd656-f50d-4496-9430-039eb97496f0	Science Advances — Vol. 9 (2023)	\N	\N	\N	[{"name":"AAAS Editorial Board","role":"editor"}]	\N	\N	\N	AAAS	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Open-access multidisciplinary journal publishing cutting-edge research across STEM disciplines.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/sciadvances/200/280	'2023':5A '9':4A 'aaa':6C 'access':9C 'across':17C 'advanc':2A 'cut':14C 'cutting-edg':13C 'disciplin':19C 'edg':15C 'journal':11C 'multidisciplinari':10C 'open':8C 'open-access':7C 'publish':12C 'research':16C 'scienc':1A 'stem':18C 'vol':3A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
1840aa77-a500-40c0-8333-29468f4f78db	PLOS ONE — November 2023	\N	\N	\N	[{"name":"PLOS Editorial Team","role":"editor"}]	\N	\N	\N	PLOS	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Peer-reviewed open-access scientific journal covering primary research across all disciplines.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/plosone2023/200/280	'2023':4A 'access':11C 'across':17C 'cover':14C 'disciplin':19C 'journal':13C 'novemb':3A 'one':2A 'open':10C 'open-access':9C 'peer':7C 'peer-review':6C 'plos':1A,5C 'primari':15C 'research':16C 'review':8C 'scientif':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
2a494f3a-a705-45b1-8426-7dcbd3995050	Foreign Affairs — Nov/Dec 2023	\N	\N	\N	[{"name":"CFR Editors","role":"editor"}]	\N	\N	\N	Council on Foreign Relations	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Analysis and commentary on global politics, economics, and security from leading experts.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/foreignaffairs/200/280	'2023':4A 'affair':2A 'analysi':9C 'commentari':11C 'council':5C 'econom':15C 'expert':20C 'foreign':1A,7C 'global':13C 'lead':19C 'nov/dec':3A 'polit':14C 'relat':8C 'secur':17C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
6f5d4d07-27d9-4c46-986f-173871f2f4e1	Phnom Penh Post — Digital Edition Q4 2023	\N	\N	\N	[{"name":"PP Post Editorial","role":"editor"}]	\N	\N	\N	Phnom Penh Post	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Cambodia's leading English-language newspaper covering local and regional news.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/pnhpost2023/200/280	'2023':7A 'cambodia':11C 'cover':18C 'digit':4A 'edit':5A 'english':15C 'english-languag':14C 'languag':16C 'lead':13C 'local':19C 'news':22C 'newspap':17C 'penh':2A,9C 'phnom':1A,8C 'post':3A,10C 'q4':6A 'region':21C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
ea1ad682-0eab-4781-919b-d8e2a876f68a	Machine Learning Fundamentals — Lecture Series	\N	\N	\N	[{"name":"Dr. Andrew Ng","role":"author"}]	\N	\N	\N	Coursera Audio	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures covering supervised learning, neural networks, and practical ML tips.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-ml/200/280	'audio':7C 'coursera':6C 'cover':10C 'fundament':3A 'learn':2A,12C 'lectur':4A,9C 'machin':1A 'ml':17C 'network':14C 'neural':13C 'practic':16C 'record':8C 'seri':5A 'supervis':11C 'tip':18C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8b5c183f-c085-4ac9-b457-fca3e3ceb79c	Cambodian History: Ancient to Modern	\N	\N	\N	[{"name":"Prof. David Chandler","role":"author"}]	\N	\N	\N	SOAS Audio	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	A comprehensive audio journey from the Angkor Empire to post-independence Cambodia.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-kh-hist/200/280	'ancient':3A 'angkor':14C 'audio':7C,10C 'cambodia':20C 'cambodian':1A 'comprehens':9C 'empir':15C 'histori':2A 'independ':19C 'journey':11C 'modern':5A 'post':18C 'post-independ':17C 'soa':6C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
fe028fc9-151c-4017-b564-8e3e0fe82725	The Psychology of Money — Audiobook	\N	\N	\N	[{"name":"Morgan Housel","role":"author"}]	\N	\N	\N	Harriman House	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Timeless lessons on wealth, greed, and happiness from one of the most acclaimed finance writers.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-psymoney/200/280	'acclaim':20C 'audiobook':5A 'financ':21C 'greed':12C 'happi':14C 'harriman':6C 'hous':7C 'lesson':9C 'money':4A 'one':16C 'psycholog':2A 'timeless':8C 'wealth':11C 'writer':22C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
1ef52d65-213e-468e-8488-96b0d5e47f99	Public Speaking Masterclass — Khmer	\N	\N	\N	[{"name":"Dara Prak","role":"author"}]	\N	\N	\N	CamEdu Audio	\N	2023	\N	\N	\N	\N	km	[]	\N	\N	\N	Practical techniques for confident public speaking in professional and academic settings.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-speaking/200/280	'academ':16C 'audio':6C 'camedu':5C 'confid':10C 'khmer':4A 'masterclass':3A 'practic':7C 'profession':14C 'public':1A,11C 'set':17C 'speak':2A,12C 'techniqu':8C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
32b26361-9b73-4aef-8d91-99ba3d751611	Digital Marketing for ASEAN SMEs	\N	\N	\N	[{"name":"Sophea Kim","role":"author"}]	\N	\N	\N	Corasoft Audio	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Step-by-step audio guide on social media, SEO, and paid advertising strategies for Southeast Asian markets.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-digmkt/200/280	'advertis':20C 'asean':4A 'asian':24C 'audio':7C,12C 'corasoft':6C 'digit':1A 'guid':13C 'market':2A,25C 'media':16C 'paid':19C 'seo':17C 'smes':5A 'social':15C 'southeast':23C 'step':9C,11C 'step-by-step':8C 'strategi':21C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
09c5b8c8-c9c3-4003-96cf-0d43625cc82c	Mindfulness and Meditation — Guided Sessions	\N	\N	\N	[{"name":"Thich Nhat Hanh","role":"author"}]	\N	\N	\N	Parallax Press	\N	2019	\N	\N	\N	\N	en	[]	\N	\N	\N	Guided mindfulness meditations and dharma talks for daily practice.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-mindful/200/280	'daili':15C 'dharma':12C 'guid':4A,8C 'medit':3A,10C 'mind':1A,9C 'parallax':6C 'practic':16C 'press':7C 'session':5A 'talk':13C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f033783c-f9d3-4408-9ffa-33636c6e6d37	Introduction to Khmer Literature	\N	\N	\N	[{"name":"Khing Hoc Dy","role":"author"}]	\N	\N	\N	Royal Academy KH	\N	2020	\N	\N	\N	\N	km	[]	\N	\N	\N	An audio exploration of classical and modern Khmer literary traditions, poetry, and prose.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-khmer-lit/200/280	'academi':6C 'audio':9C 'classic':12C 'explor':10C 'introduct':1A 'kh':7C 'khmer':3A,15C 'literari':16C 'literatur':4A 'modern':14C 'poetri':18C 'prose':20C 'royal':5C 'tradit':17C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
d0ff57e6-a02b-47ec-a0b6-aa570b6c48e1	Entrepreneurship in Southeast Asia	\N	\N	\N	[{"name":"Chan Sophal","role":"author"}]	\N	\N	\N	ASEAN Biz Audio	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Stories and strategies from successful entrepreneurs across ASEAN markets, including Cambodia, Vietnam, and Thailand.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-entrsea/200/280	'across':14C 'asean':5C,15C 'asia':4A 'audio':7C 'biz':6C 'cambodia':18C 'entrepreneur':13C 'entrepreneurship':1A 'includ':17C 'market':16C 'southeast':3A 'stori':8C 'strategi':10C 'success':12C 'thailand':21C 'vietnam':19C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
86ec3a75-8fd3-4172-8a8b-6bef631e894a	Climate Science for Non-Scientists	\N	\N	\N	[{"name":"Dr. Keo Vy","role":"author"}]	\N	\N	\N	GreenKH Audio	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	An accessible guide to understanding climate science, greenhouse gases, and global warming impacts.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-climate/200/280	'access':10C 'audio':8C 'climat':1A,14C 'gase':17C 'global':19C 'greenhous':16C 'greenkh':7C 'guid':11C 'impact':21C 'non':5A 'non-scientist':4A 'scienc':2A,15C 'scientist':6A 'understand':13C 'warm':20C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9b980984-39ad-4cb5-8db8-1a15ce2895aa	IELTS Preparation — Academic Module	\N	\N	\N	[{"name":"Sandra Clark","role":"author"}]	\N	\N	\N	Cambridge Audio	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	Comprehensive audio preparation for the IELTS Academic module, covering all four skills.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-ielts/200/280	'academ':3A,13C 'audio':6C,8C 'cambridg':5C 'comprehens':7C 'cover':15C 'four':17C 'ielt':1A,12C 'modul':4A,14C 'prepar':2A,9C 'skill':18C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
3d9d7799-3751-49ed-9dc0-ae5761348075	Buddhist Philosophy and Ethics	\N	\N	\N	[{"name":"Ven. Bhikkhu Bodhi","role":"author"}]	\N	\N	\N	Wisdom Audio	\N	2018	\N	\N	\N	\N	en	[]	\N	\N	\N	Lectures on core Buddhist teachings — the Four Noble Truths, Eightfold Path, and the nature of suffering.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-buddhist/200/280	'audio':6C 'buddhist':1A,10C 'core':9C 'eightfold':16C 'ethic':4A 'four':13C 'lectur':7C 'natur':20C 'nobl':14C 'path':17C 'philosophi':2A 'suffer':22C 'teach':11C 'truth':15C 'wisdom':5C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
85f50958-5f16-4cef-925d-4afe960928c1	Macroeconomics for Development	\N	\N	\N	[{"name":"Prof. Tol Narin","role":"author"}]	\N	\N	\N	NUM Audio Press	\N	2022	\N	\N	\N	\N	km	[]	\N	\N	\N	Audio lectures on macroeconomic fundamentals applied to developing economies in Southeast Asia.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-macro/200/280	'appli':12C 'asia':18C 'audio':5C,7C 'develop':3A,14C 'economi':15C 'fundament':11C 'lectur':8C 'macroeconom':1A,10C 'num':4C 'press':6C 'southeast':17C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5559b320-d586-4368-a7c4-530c63408749	Angkor Wat: A Civilisation Uncovered	\N	\N	\N	[{"name":"BBC Documentary Team","role":"author"}]	\N	\N	\N	BBC Studios	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary exploring the history, archaeology, and cultural significance of the Angkor temples.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-angkor/200/280	'angkor':1A,18C 'archaeolog':12C 'bbc':6C 'civilis':4A 'cultur':14C 'documentari':8C 'explor':9C 'histori':11C 'signific':15C 'studio':7C 'templ':19C 'uncov':5A 'wat':2A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8104d8df-f175-4d26-9008-6649e31991d4	Introduction to Blockchain Technology	\N	\N	\N	[{"name":"MIT OpenCourseWare","role":"author"}]	\N	\N	\N	MIT OCW	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures from MIT 6.S974: cryptocurrency and blockchain fundamentals.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-blockchain/200/280	'6':11C 'blockchain':3A,15C 'cryptocurr':13C 'fundament':16C 'introduct':1A 'lectur':8C 'mit':5C,10C 'ocw':6C 'record':7C 's974':12C 'technolog':4A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
3dc04bb7-824e-40ed-8733-ffc0a0768e3b	Khmer Classical Dance — A Living Heritage	\N	\N	\N	[{"name":"Ministry of Culture KH","role":"author"}]	\N	\N	\N	MOFA Cambodia	\N	2021	\N	\N	\N	\N	km	[]	\N	\N	\N	Documentary preserving the traditions of Khmer classical dance — a UNESCO intangible heritage.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-khmerdance/200/280	'cambodia':8C 'classic':2A,15C 'danc':3A,16C 'documentari':9C 'heritag':6A,20C 'intang':19C 'khmer':1A,14C 'live':5A 'mofa':7C 'preserv':10C 'tradit':12C 'unesco':18C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
c9099905-004e-49d1-94ed-a06750427aa9	Climate Change and the Mekong River	\N	\N	\N	[{"name":"MRC Research Unit","role":"author"}]	\N	\N	\N	Mekong River Commission	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Scientific documentary on how climate change is affecting water levels, biodiversity, and communities along the Mekong.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-mekong/200/280	'affect':17C 'along':23C 'biodivers':20C 'chang':2A,15C 'climat':1A,14C 'commiss':9C 'communiti':22C 'documentari':11C 'level':19C 'mekong':5A,7C,25C 'river':6A,8C 'scientif':10C 'water':18C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8c22cd94-0878-4b89-9dfb-8d6c0015bacc	Web Development Bootcamp — Full Course	\N	\N	\N	[{"name":"Angela Yu","role":"author"}]	\N	\N	\N	Udemy Video	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete web development course covering HTML, CSS, JavaScript, Node.js, React, and MongoDB.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-webdev/200/280	'bootcamp':3A 'complet':8C 'cours':5A,11C 'cover':12C 'css':14C 'develop':2A,10C 'full':4A 'html':13C 'javascript':15C 'mongodb':19C 'node.js':16C 'react':17C 'udemi':6C 'video':7C 'web':1A,9C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
67fd6f1c-9be0-40f2-94d9-cbe0874914fa	Cambodia's Floating Villages	\N	\N	\N	[{"name":"NatGeo Asia","role":"author"}]	\N	\N	\N	National Geographic	\N	2019	\N	\N	\N	\N	en	[]	\N	\N	\N	A journey through the unique floating communities on Tonle Sap Lake and their way of life.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-floating/200/280	'cambodia':1A 'communiti':13C 'float':3A,12C 'geograph':6C 'journey':8C 'lake':17C 'life':22C 'nation':5C 'sap':16C 'tonl':15C 'uniqu':11C 'villag':4A 'way':20C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
dcbbc925-5c6a-4531-b6e9-c85c724f5a49	Data Science with Python — Full Course	\N	\N	\N	[{"name":"Jose Portilla","role":"author"}]	\N	\N	\N	Udemy Video	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete data science course: NumPy, Pandas, Matplotlib, Seaborn, scikit-learn, and machine learning projects.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-datascience/200/280	'complet':9C 'cours':6A,12C 'data':1A,10C 'full':5A 'learn':19C,22C 'machin':21C 'matplotlib':15C 'numpi':13C 'panda':14C 'project':23C 'python':4A 'scienc':2A,11C 'scikit':18C 'scikit-learn':17C 'seaborn':16C 'udemi':7C 'video':8C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
57b25975-3483-480e-b551-da63d56f63cf	The Khmer Rouge Tribunal — Justice Delayed	\N	\N	\N	[{"name":"ECCC Media Unit","role":"author"}]	\N	\N	\N	ECCC	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary on the Extraordinary Chambers in the Courts of Cambodia and the pursuit of justice for genocide survivors.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-eccc/200/280	'cambodia':17C 'chamber':12C 'court':15C 'delay':6A 'documentari':8C 'eccc':7C 'extraordinari':11C 'genocid':24C 'justic':5A,22C 'khmer':2A 'pursuit':20C 'roug':3A 'survivor':25C 'tribun':4A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
720247b6-695e-44f5-b6e5-82ec4b7079a9	Project Management Professional — PMP Prep	\N	\N	\N	[{"name":"Joseph Phillips","role":"author"}]	\N	\N	\N	Udemy Video	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete PMP exam preparation covering all PMBOK process groups and knowledge areas.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-pmp/200/280	'area':19C 'complet':8C 'cover':12C 'exam':10C 'group':16C 'knowledg':18C 'manag':2A 'pmbok':14C 'pmp':4A,9C 'prep':5A 'prepar':11C 'process':15C 'profession':3A 'project':1A 'udemi':6C 'video':7C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
52f426aa-ed83-48d5-b9a5-8376b8b06075	Phnom Penh: City in Transformation	\N	\N	\N	[{"name":"Urban Stories Asia","role":"author"}]	\N	\N	\N	Urban Stories	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary on the rapid urban development and changing cityscape of Phnom Penh from 2010 to 2023.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-pnhpenh/200/280	'2010':21C '2023':23C 'chang':15C 'citi':3A 'cityscap':16C 'develop':13C 'documentari':8C 'penh':2A,19C 'phnom':1A,18C 'rapid':11C 'stori':7C 'transform':5A 'urban':6C,12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
de4f870d-3549-4b84-9dab-a9b7eb55f517	Artificial Intelligence: The Future of Work	\N	\N	\N	[{"name":"DW Documentary","role":"author"}]	\N	\N	\N	Deutsche Welle	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Explores how AI and automation are reshaping industries and labor markets across the globe.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-aiwork/200/280	'across':20C 'ai':11C 'artifici':1A 'autom':13C 'deutsch':7C 'explor':9C 'futur':4A 'globe':22C 'industri':16C 'intellig':2A 'labor':18C 'market':19C 'reshap':15C 'well':8C 'work':6A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
01fa1926-5c98-4aa9-afde-610c9418a678	Rice Farming and Food Security in Cambodia	\N	\N	\N	[{"name":"FAO Asia-Pacific","role":"author"}]	\N	\N	\N	FAO	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary covering traditional and modern rice cultivation practices and their impact on Cambodia's food security.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-rice/200/280	'cambodia':7A,21C 'cover':10C 'cultiv':15C 'documentari':9C 'fao':8C 'farm':2A 'food':4A,23C 'impact':19C 'modern':13C 'practic':16C 'rice':1A,14C 'secur':5A,24C 'tradit':11C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8420c0bf-4435-4e63-a3e9-490b40d44295	The Impact of Microfinance on Rural Poverty Reduction in Cambodia	\N	\N	\N	[{"name":"Ratana Chan","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2022	\N	\N	\N	198	en	[]	\N	332.7	\N	Empirical study examining how MFI lending affects household income and poverty indicators across three provinces.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-microfinance/200/280	'across':28C 'affect':22C 'cambodia':10A 'empir':16C 'examin':18C 'household':23C 'impact':2A 'incom':24C 'indic':27C 'lend':21C 'mfi':20C 'microfin':4A 'penh':15C 'phnom':14C 'poverti':7A,26C 'provinc':30C 'reduct':8A 'royal':11C 'rural':6A 'studi':17C 'three':29C 'univers':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
19a2147e-51c8-4cb3-bb62-c4000b4ca5e0	AI-Assisted Language Learning for Khmer Secondary Students	\N	\N	\N	[{"name":"Bunna Heng","role":"author"}]	\N	\N	\N	Institute of Technology of Cambodia	\N	2023	\N	\N	\N	142	en	[]	\N	418.0078	\N	Mixed-methods research on the effectiveness of AI chatbots in improving English proficiency among Khmer-speaking students.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-aillang/200/280	'ai':2A,23C 'ai-assist':1A 'among':29C 'assist':3A 'cambodia':14C 'chatbot':24C 'effect':21C 'english':27C 'improv':26C 'institut':10C 'khmer':7A,31C 'khmer-speak':30C 'languag':4A 'learn':5A 'method':17C 'mix':16C 'mixed-method':15C 'profici':28C 'research':18C 'secondari':8A 'speak':32C 'student':9A,33C 'technolog':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
0ae5cbee-51d9-4be9-8317-916211794209	Urban Heat Islands and Green Infrastructure Planning in Phnom Penh	\N	\N	\N	[{"name":"Pisey Mao","role":"author"}]	\N	\N	\N	Paññāsāstra University	\N	2023	\N	\N	\N	176	en	[]	\N	307.76	\N	GIS-based analysis of urban heat distribution and proposed green-corridor interventions in Phnom Penh.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-urbanheat/200/280	'analysi':16C 'base':15C 'corridor':25C 'distribut':20C 'gis':14C 'gis-bas':13C 'green':5A,24C 'green-corridor':23C 'heat':2A,19C 'infrastructur':6A 'intervent':26C 'island':3A 'paññāsāstra':11C 'penh':10A,29C 'phnom':9A,28C 'plan':7A 'propos':22C 'univers':12C 'urban':1A,18C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
08277d0c-42aa-43ea-a417-aba64d6e8034	The Innovator's Dilemma	\N	\N	\N	[{"name":"Clayton Christensen","role":"author"}]	9781633691780	\N	\N	Harvard Business Review Press	\N	2016	\N	\N	\N	288	en	[]	\N	658.4	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781633691780-M.jpg	'9781633691780':9A 'busi':6C 'dilemma':4A 'harvard':5C 'innov':2A 'press':8C 'review':7C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e39e2a2b-364d-470b-8e83-23bb58139f55	Digital Transformation Readiness of Cambodian SMEs Post-COVID-19	\N	\N	\N	[{"name":"Makara Tep","role":"author"}]	\N	\N	\N	National University of Management	\N	2022	\N	\N	\N	210	en	[]	\N	338.642	\N	Survey-based assessment of technology adoption barriers and digital readiness among 300 SMEs in Cambodia.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-digitaltrans/200/280	'19':10A '300':27C 'adopt':21C 'among':26C 'assess':18C 'barrier':22C 'base':17C 'cambodia':30C 'cambodian':5A 'covid':9A 'digit':1A,24C 'manag':14C 'nation':11C 'post':8A 'post-covid':7A 'readi':3A,25C 'smes':6A,28C 'survey':16C 'survey-bas':15C 'technolog':20C 'transform':2A 'univers':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
e0a8d49f-9dd4-4803-980b-ded023d3c9aa	Water Quality Assessment of the Tonle Sap Lake Basin	\N	\N	\N	[{"name":"Sothea Khun","role":"author"}]	\N	\N	\N	Royal University of Agriculture	\N	2022	\N	\N	\N	164	en	[]	\N	551.48	\N	Environmental monitoring study of heavy metal contamination, turbidity, and nutrient levels in Tonle Sap Lake.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-water/200/280	'agricultur':13C 'assess':3A 'basin':9A 'contamin':20C 'environment':14C 'heavi':18C 'lake':8A,28C 'level':24C 'metal':19C 'monitor':15C 'nutrient':23C 'qualiti':2A 'royal':10C 'sap':7A,27C 'studi':16C 'tonl':6A,26C 'turbid':21C 'univers':11C 'water':1A	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
8fea5618-1aba-4719-bf4a-2d082fe07908	Gender Inequality in STEM Education in Cambodian Universities	\N	\N	\N	[{"name":"Channary Sok","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2023	\N	\N	\N	155	en	[]	\N	305.43	\N	Qualitative research examining systemic and cultural barriers preventing women from pursuing STEM degrees in Cambodia.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-gender/200/280	'barrier':20C 'cambodia':28C 'cambodian':7A 'cultur':19C 'degre':26C 'educ':5A 'examin':16C 'gender':1A 'inequ':2A 'penh':13C 'phnom':12C 'prevent':21C 'pursu':24C 'qualit':14C 'research':15C 'royal':9C 'stem':4A,25C 'system':17C 'univers':8A,10C 'women':22C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9dfb9602-1034-43d8-9ebb-ceec19a3da44	E-Government Adoption and Citizen Trust in Cambodia	\N	\N	\N	[{"name":"Dara Vong","role":"author"}]	\N	\N	\N	National University of Management	\N	2021	\N	\N	\N	187	en	[]	\N	351	\N	Technology acceptance model analysis of citizen willingness to use e-government services in Phnom Penh and provincial areas.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-egov/200/280	'accept':15C 'adopt':4A 'analysi':17C 'area':32C 'cambodia':9A 'citizen':6A,19C 'e':2A,24C 'e-govern':1A,23C 'govern':3A,25C 'manag':13C 'model':16C 'nation':10C 'penh':29C 'phnom':28C 'provinci':31C 'servic':26C 'technolog':14C 'trust':7A 'univers':11C 'use':22C 'willing':20C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9368afff-c2a2-4921-aeca-c859a455bea0	Soil Erosion and Conservation Practices in Kampong Speu Province	\N	\N	\N	[{"name":"Vichet Phan","role":"author"}]	\N	\N	\N	Royal University of Agriculture	\N	2021	\N	\N	\N	140	km	[]	\N	631.45	\N	Field-based assessment of soil erosion rates and evaluation of traditional and modern conservation measures in upland farming areas.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-soil/200/280	'agricultur':13C 'area':33C 'assess':17C 'base':16C 'conserv':4A,28C 'eros':2A,20C 'evalu':23C 'farm':32C 'field':15C 'field-bas':14C 'kampong':7A 'measur':29C 'modern':27C 'practic':5A 'provinc':9A 'rate':21C 'royal':10C 'soil':1A,19C 'speu':8A 'tradit':25C 'univers':11C 'upland':31C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
97ebe156-4536-4d4a-b96a-a6f962ecd6be	Tourism and Cultural Heritage Preservation in Siem Reap	\N	\N	\N	[{"name":"Sreymom Hout","role":"author"}]	\N	\N	\N	Paññāsāstra University	\N	2022	\N	\N	\N	195	en	[]	\N	363.69	\N	Case study examining the tension between mass tourism growth and the long-term preservation of Angkor UNESCO World Heritage Sites.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-tourism/200/280	'angkor':27C 'case':11C 'cultur':3A 'examin':13C 'growth':19C 'heritag':4A,30C 'long':23C 'long-term':22C 'mass':17C 'paññāsāstra':9C 'preserv':5A,25C 'reap':8A 'siem':7A 'site':31C 'studi':12C 'tension':15C 'term':24C 'tourism':1A,18C 'unesco':28C 'univers':10C 'world':29C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
90980678-0e04-48f7-9293-4f99de6eef8a	Mobile Banking Adoption Among Unbanked Populations in Rural Cambodia	\N	\N	\N	[{"name":"Lyda Chhim","role":"author"}]	\N	\N	\N	Institute of Technology of Cambodia	\N	2023	\N	\N	\N	168	en	[]	\N	332.1	\N	Investigates factors influencing mobile banking uptake in rural Cambodian provinces with limited banking infrastructure.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-mobilebank/200/280	'adopt':3A 'among':4A 'bank':2A,19C,27C 'cambodia':9A,14C 'cambodian':23C 'factor':16C 'influenc':17C 'infrastructur':28C 'institut':10C 'investig':15C 'limit':26C 'mobil':1A,18C 'popul':6A 'provinc':24C 'rural':8A,22C 'technolog':12C 'unbank':5A 'uptak':20C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
db0a55f7-49c8-4b6a-8ff1-43cdeefb9e6e	Supply Chain Resilience in Cambodian Garment Manufacturing Post-Pandemic	\N	\N	\N	[{"name":"Kosal Meng","role":"author"}]	\N	\N	\N	National University of Management	\N	2022	\N	\N	\N	222	en	[]	\N	338.47	\N	Analysis of disruption recovery strategies and resilience-building practices in Cambodia's export-oriented garment sector.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-supplychain/200/280	'analysi':15C 'build':23C 'cambodia':26C 'cambodian':5A 'chain':2A 'disrupt':17C 'export':29C 'export-ori':28C 'garment':6A,31C 'manag':14C 'manufactur':7A 'nation':11C 'orient':30C 'pandem':10A 'post':9A 'post-pandem':8A 'practic':24C 'recoveri':18C 'resili':3A,22C 'resilience-build':21C 'sector':32C 'strategi':19C 'suppli':1A 'univers':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
88fbf738-892f-4abf-b7d0-686bf6e7c36f	Renewable Energy Transition and Policy Gaps in Cambodia	\N	\N	\N	[{"name":"Sophary Nhem","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2023	\N	\N	\N	183	en	[]	\N	333.79	\N	Policy analysis of Cambodia's solar and hydropower development roadmap and identification of regulatory gaps for a just energy transition.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-energy/200/280	'analysi':15C 'cambodia':8A,17C 'develop':22C 'energi':2A,32C 'gap':6A,28C 'hydropow':21C 'identif':25C 'penh':13C 'phnom':12C 'polici':5A,14C 'regulatori':27C 'renew':1A 'roadmap':23C 'royal':9C 'solar':19C 'transit':3A,33C 'univers':10C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
c35c2a1f-e5c5-40f3-96e3-72b8e588f5fe	Design Patterns: Elements of Reusable Object-Oriented Software	\N	\N	\N	[{"name":"Erich Gamma","role":"author"}]	9780201633610	\N	\N	Addison-Wesley	\N	1994	\N	\N	\N	395	en	[]	\N	005.117	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg	'9780201633610':13A 'addison':11C 'addison-wesley':10C 'design':1A 'element':3A 'object':7A 'object-ori':6A 'orient':8A 'pattern':2A 'reusabl':5A 'softwar':9A 'wesley':12C	active	\N	2026-06-10 05:43:31	2026-06-10 05:43:31	2026-06-10 05:43:31	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
b8efe3b4-b49a-42a5-97a3-09b79eb52c6f	Clean Code	\N	\N	\N	[{"name":"Robert C. Martin","role":"author"}]	\N	\N	\N	Prentice Hall	\N	2008	\N	\N	\N	\N	en	[]	\N	005.133	\N	A handbook of agile software craftsmanship covering naming, functions, comments, and refactoring.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg	'agil':8C 'clean':1A 'code':2A 'comment':14C 'cover':11C 'craftsmanship':10C 'function':13C 'hall':4C 'handbook':6C 'name':12C 'prentic':3C 'refactor':16C 'softwar':9C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
79bdd86b-ed2a-4cea-819d-1d6d9c9becd4	The Pragmatic Programmer	\N	\N	\N	[{"name":"David Thomas","role":"author"}]	\N	\N	\N	Addison-Wesley	\N	2019	\N	\N	\N	\N	en	[]	\N	005.1	\N	Your journey to mastery — from apprentice to journeyman. Updated for modern development practices.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg	'addison':5C 'addison-wesley':4C 'apprentic':12C 'develop':18C 'journey':8C 'journeyman':14C 'masteri':10C 'modern':17C 'practic':19C 'pragmat':2A 'programm':3A 'updat':15C 'wesley':6C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
c2489c4c-b3b6-465e-b0d9-ff53ae170872	Deep Learning	\N	\N	\N	[{"name":"Ian Goodfellow","role":"author"}]	\N	\N	\N	MIT Press	\N	2016	\N	\N	\N	\N	en	[]	\N	006.31	\N	The definitive textbook on deep learning, covering feedforward networks, CNNs, RNNs, and more.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780262035613-M.jpg	'cnns':14C 'cover':11C 'deep':1A,9C 'definit':6C 'feedforward':12C 'learn':2A,10C 'mit':3C 'network':13C 'press':4C 'rnns':15C 'textbook':7C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
ebbd1887-1a57-4565-8c49-22c287ce1c05	Python Crash Course	\N	\N	\N	[{"name":"Eric Matthes","role":"author"}]	\N	\N	\N	No Starch Press	\N	2023	\N	\N	\N	\N	en	[]	\N	005.133	\N	A hands-on, project-based introduction to programming in Python 3.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781593279288-M.jpg	'3':19C 'base':13C 'cours':3A 'crash':2A 'hand':9C 'hands-on':8C 'introduct':14C 'press':6C 'program':16C 'project':12C 'project-bas':11C 'python':1A,18C 'starch':5C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5469ad2e-df05-4dc9-a590-84197eca50ef	Designing Data-Intensive Applications	\N	\N	\N	[{"name":"Martin Kleppmann","role":"author"}]	\N	\N	\N	O'Reilly Media	\N	2017	\N	\N	\N	\N	en	[]	\N	005.74	\N	The big ideas behind reliable, scalable, and maintainable systems.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781449373320-M.jpg	'applic':5A 'behind':12C 'big':10C 'data':3A 'data-intens':2A 'design':1A 'idea':11C 'intens':4A 'maintain':16C 'media':8C 'o':6C 'reilli':7C 'reliabl':13C 'scalabl':14C 'system':17C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
bd2d6ea0-a5b3-4c1c-9f22-0242a3563032	The Lean Startup	\N	\N	\N	[{"name":"Eric Ries","role":"author"}]	\N	\N	\N	Crown Business	\N	2011	\N	\N	\N	\N	en	[]	\N	658.11	\N	How today's entrepreneurs use continuous innovation to create radically successful businesses.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg	'busi':5C,17C 'continu':11C 'creat':14C 'crown':4C 'entrepreneur':9C 'innov':12C 'lean':2A 'radic':15C 'startup':3A 'success':16C 'today':7C 'use':10C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9362e65f-0f18-47ed-bdeb-b767b4e0cc0d	Atomic Habits	\N	\N	\N	[{"name":"James Clear","role":"author"}]	\N	\N	\N	Avery	\N	2018	\N	\N	\N	\N	en	[]	\N	158.1	\N	An easy and proven way to build good habits and break bad ones.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg	'atom':1A 'averi':3C 'bad':15C 'break':14C 'build':10C 'easi':5C 'good':11C 'habit':2A,12C 'one':16C 'proven':7C 'way':8C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
86c12fac-e993-4244-b93a-c837055666fa	Sapiens: A Brief History of Humankind	\N	\N	\N	[{"name":"Yuval Noah Harari","role":"author"}]	\N	\N	\N	Harper	\N	2015	\N	\N	\N	\N	en	[]	\N	909	\N	How biology and history defined us and enhanced our understanding of what it means to be human.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg	'biolog':9C 'brief':3A 'defin':12C 'enhanc':15C 'harper':7C 'histori':4A,11C 'human':24C 'humankind':6A 'mean':21C 'sapien':1A 'understand':17C 'us':13C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5f450bf7-cbe4-4ae5-aa05-968deebdc5c3	Introduction to Machine Learning with Python	\N	\N	\N	[{"name":"Andreas M\\u00fcller","role":"author"}]	\N	\N	\N	O'Reilly Media	\N	2017	\N	\N	\N	\N	en	[]	\N	006.31	\N	A guide for scientists and engineers to build machine learning systems with scikit-learn.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781449369415-M.jpg	'build':17C 'engin':15C 'guid':11C 'introduct':1A 'learn':4A,19C,24C 'machin':3A,18C 'media':9C 'o':7C 'python':6A 'reilli':8C 'scientist':13C 'scikit':23C 'scikit-learn':22C 'system':20C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
32cb0e74-3974-47cd-9463-2b74649d4596	Thinking, Fast and Slow	\N	\N	\N	[{"name":"Daniel Kahneman","role":"author"}]	\N	\N	\N	Farrar & Giroux	\N	2013	\N	\N	\N	\N	en	[]	\N	153.4	\N	Two systems that drive the way we think — the fast, intuitive System 1 and the deliberative System 2.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg	'1':19C '2':24C 'delib':22C 'drive':10C 'farrar':5C 'fast':2A,16C 'giroux':6C 'intuit':17C 'slow':4A 'system':8C,18C,23C 'think':1A,14C 'two':7C 'way':12C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
b2ca1a7d-2a7f-4ff0-92aa-d4f82543fda5	Zero to One	\N	\N	\N	[{"name":"Peter Thiel","role":"author"}]	\N	\N	\N	Crown Business	\N	2014	\N	\N	\N	\N	en	[]	\N	658.11	\N	Notes on startups, or how to build the future by creating something genuinely new.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780804139021-M.jpg	'build':12C 'busi':5C 'creat':16C 'crown':4C 'futur':14C 'genuin':18C 'new':19C 'note':6C 'one':3A 'someth':17C 'startup':8C 'zero':1A	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
0186227a-ef99-44a3-b892-27d699632026	Digital Cambodia	\N	\N	\N	[{"name":"Sophea Chann","role":"author"}]	\N	\N	\N	Corasoft Press	\N	2023	\N	\N	\N	\N	km	[]	\N	338.9	\N	An examination of Cambodia's digital economy, fintech ecosystem, and tech startup landscape.	\N	2	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/digital-cambodia/200/280	'cambodia':2A,8C 'corasoft':3C 'digit':1A,10C 'economi':11C 'ecosystem':13C 'examin':6C 'fintech':12C 'landscap':17C 'press':4C 'startup':16C 'tech':15C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
a53a5907-f3cf-4e88-a288-c63d0483aaa5	Nature — Vol. 621 (2023)	\N	\N	\N	[{"name":"Nature Editorial Board","role":"editor"}]	\N	\N	\N	Springer Nature	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Weekly international science journal covering all branches of natural sciences.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/nature621/200/280	'2023':4A '621':3A 'branch':13C 'cover':11C 'intern':8C 'journal':10C 'natur':1A,6C,15C 'scienc':9C,16C 'springer':5C 'vol':2A 'week':7C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
23894833-773a-4e04-aeeb-769f32888c7a	The Lancet — Issue 10391 (2023)	\N	\N	\N	[{"name":"Lancet Editorial Board","role":"editor"}]	\N	\N	\N	Elsevier	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Leading peer-reviewed general medical journal covering global health topics.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/lancet2023/200/280	'10391':4A '2023':5A 'cover':14C 'elsevi':6C 'general':11C 'global':15C 'health':16C 'issu':3A 'journal':13C 'lancet':2A 'lead':7C 'medic':12C 'peer':9C 'peer-review':8C 'review':10C 'topic':17C	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
a3441812-74fe-4944-94e4-fb1b3a700d97	Harvard Business Review — Nov/Dec 2023	\N	\N	\N	[{"name":"HBR Editors","role":"editor"}]	\N	\N	\N	Harvard Business Publishing	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Management insights, research, and best practices for business leaders.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/hbr2023/200/280	'2023':5A 'best':13C 'busi':2A,7C,16C 'harvard':1A,6C 'insight':10C 'leader':17C 'manag':9C 'nov/dec':4A 'practic':14C 'publish':8C 'research':11C 'review':3A	active	\N	2026-06-10 05:44:04	2026-06-10 05:44:04	2026-06-10 05:44:04	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
2c6c548b-2622-4601-8f4d-e459721d9a4d	Environmental Science: Earth as a Living Planet	\N	\N	\N	[{"name":"Daniel B. Botkin","role":"author"}]	9781119700005	\N	\N	Wiley	\N	2021	\N	\N	\N	672	en	[]	\N	363.7	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781119700005-M.jpg	'9781119700005':9A 'earth':3A 'environment':1A 'live':6A 'planet':7A 'scienc':2A 'wiley':8C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
d62a1ea7-6e63-4785-b4af-3e3ef417be26	IEEE Spectrum — October 2023	\N	\N	\N	[{"name":"IEEE Editorial Staff","role":"editor"}]	\N	\N	\N	IEEE	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Technology news and analysis from the world's largest technical professional organization.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/ieeespectrum/200/280	'2023':4A 'analysi':9C 'ieee':1A,5C 'largest':14C 'news':7C 'octob':3A 'organ':17C 'profession':16C 'spectrum':2A 'technic':15C 'technolog':6C 'world':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
44295566-73c5-419d-afcc-e7d802a2712f	Journal of Southeast Asian Studies — Vol. 54 (2023)	\N	\N	\N	[{"name":"NUS Editorial Board","role":"editor"}]	\N	\N	\N	Cambridge University Press	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Scholarly articles on the history, politics, and cultures of Southeast Asia.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/jseas2023/200/280	'2023':8A '54':7A 'articl':13C 'asia':22C 'asian':4A 'cambridg':9C 'cultur':19C 'histori':16C 'journal':1A 'polit':17C 'press':11C 'scholar':12C 'southeast':3A,21C 'studi':5A 'univers':10C 'vol':6A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7fcdbb95-3dc5-467b-b863-413244b724da	Cambodian Development Review — Q3 2023	\N	\N	\N	[{"name":"CDRI Staff","role":"editor"}]	\N	\N	\N	CDRI	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Policy research on economics, governance, and social development in Cambodia.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/cdri2023/200/280	'2023':5A 'cambodia':16C 'cambodian':1A 'cdri':6C 'develop':2A,14C 'econom':10C 'govern':11C 'polici':7C 'q3':4A 'research':8C 'review':3A 'social':13C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
eb0adcda-cdf2-42b9-9d6f-eb14477d66cd	Asian Survey — Vol. 63 (2023)	\N	\N	\N	[{"name":"UC Berkeley Press","role":"editor"}]	\N	\N	\N	University of California Press	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Bimonthly journal of current affairs and scholarly analysis of Asia and the Pacific.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/asiansurvey/200/280	'2023':5A '63':4A 'affair':14C 'analysi':17C 'asia':19C 'asian':1A 'bimonth':10C 'california':8C 'current':13C 'journal':11C 'pacif':22C 'press':9C 'scholar':16C 'survey':2A 'univers':6C 'vol':3A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
001a5bd9-5cc7-4fcc-9c9b-b0b83e83f32d	The Economist — November 2023	\N	\N	\N	[{"name":"The Economist Group","role":"editor"}]	\N	\N	\N	The Economist Group	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	International coverage of world affairs, business, finance, and technology.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/economist2023/200/280	'2023':4A 'affair':12C 'busi':13C 'coverag':9C 'economist':2A,6C 'financ':14C 'group':7C 'intern':8C 'novemb':3A 'technolog':16C 'world':11C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
361f4959-25eb-4baf-a190-514fc59e259d	Science Advances — Vol. 9 (2023)	\N	\N	\N	[{"name":"AAAS Editorial Board","role":"editor"}]	\N	\N	\N	AAAS	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Open-access multidisciplinary journal publishing cutting-edge research across STEM disciplines.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/sciadvances/200/280	'2023':5A '9':4A 'aaa':6C 'access':9C 'across':17C 'advanc':2A 'cut':14C 'cutting-edg':13C 'disciplin':19C 'edg':15C 'journal':11C 'multidisciplinari':10C 'open':8C 'open-access':7C 'publish':12C 'research':16C 'scienc':1A 'stem':18C 'vol':3A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9620c53d-82d5-4bb2-85ba-34206fb1efe6	PLOS ONE — November 2023	\N	\N	\N	[{"name":"PLOS Editorial Team","role":"editor"}]	\N	\N	\N	PLOS	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Peer-reviewed open-access scientific journal covering primary research across all disciplines.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/plosone2023/200/280	'2023':4A 'access':11C 'across':17C 'cover':14C 'disciplin':19C 'journal':13C 'novemb':3A 'one':2A 'open':10C 'open-access':9C 'peer':7C 'peer-review':6C 'plos':1A,5C 'primari':15C 'research':16C 'review':8C 'scientif':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
328a611f-5e8a-42df-9c9f-77f14c2482e4	Foreign Affairs — Nov/Dec 2023	\N	\N	\N	[{"name":"CFR Editors","role":"editor"}]	\N	\N	\N	Council on Foreign Relations	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Analysis and commentary on global politics, economics, and security from leading experts.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/foreignaffairs/200/280	'2023':4A 'affair':2A 'analysi':9C 'commentari':11C 'council':5C 'econom':15C 'expert':20C 'foreign':1A,7C 'global':13C 'lead':19C 'nov/dec':3A 'polit':14C 'relat':8C 'secur':17C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
3252db23-44f1-45a5-b335-4e41b4083a47	Phnom Penh Post — Digital Edition Q4 2023	\N	\N	\N	[{"name":"PP Post Editorial","role":"editor"}]	\N	\N	\N	Phnom Penh Post	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Cambodia's leading English-language newspaper covering local and regional news.	\N	13	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/pnhpost2023/200/280	'2023':7A 'cambodia':11C 'cover':18C 'digit':4A 'edit':5A 'english':15C 'english-languag':14C 'languag':16C 'lead':13C 'local':19C 'news':22C 'newspap':17C 'penh':2A,9C 'phnom':1A,8C 'post':3A,10C 'q4':6A 'region':21C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
57967422-146c-496b-a707-310aecf62618	Machine Learning Fundamentals — Lecture Series	\N	\N	\N	[{"name":"Dr. Andrew Ng","role":"author"}]	\N	\N	\N	Coursera Audio	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures covering supervised learning, neural networks, and practical ML tips.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-ml/200/280	'audio':7C 'coursera':6C 'cover':10C 'fundament':3A 'learn':2A,12C 'lectur':4A,9C 'machin':1A 'ml':17C 'network':14C 'neural':13C 'practic':16C 'record':8C 'seri':5A 'supervis':11C 'tip':18C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
ee8bf5fa-b81d-4825-87d1-98d37bddd760	Cambodian History: Ancient to Modern	\N	\N	\N	[{"name":"Prof. David Chandler","role":"author"}]	\N	\N	\N	SOAS Audio	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	A comprehensive audio journey from the Angkor Empire to post-independence Cambodia.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-kh-hist/200/280	'ancient':3A 'angkor':14C 'audio':7C,10C 'cambodia':20C 'cambodian':1A 'comprehens':9C 'empir':15C 'histori':2A 'independ':19C 'journey':11C 'modern':5A 'post':18C 'post-independ':17C 'soa':6C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
08a54aa7-c559-41d9-a5b5-351951ec8a2d	The Psychology of Money — Audiobook	\N	\N	\N	[{"name":"Morgan Housel","role":"author"}]	\N	\N	\N	Harriman House	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Timeless lessons on wealth, greed, and happiness from one of the most acclaimed finance writers.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-psymoney/200/280	'acclaim':20C 'audiobook':5A 'financ':21C 'greed':12C 'happi':14C 'harriman':6C 'hous':7C 'lesson':9C 'money':4A 'one':16C 'psycholog':2A 'timeless':8C 'wealth':11C 'writer':22C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
93a26991-5365-4feb-aa28-00d0cd43958c	Public Speaking Masterclass — Khmer	\N	\N	\N	[{"name":"Dara Prak","role":"author"}]	\N	\N	\N	CamEdu Audio	\N	2023	\N	\N	\N	\N	km	[]	\N	\N	\N	Practical techniques for confident public speaking in professional and academic settings.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-speaking/200/280	'academ':16C 'audio':6C 'camedu':5C 'confid':10C 'khmer':4A 'masterclass':3A 'practic':7C 'profession':14C 'public':1A,11C 'set':17C 'speak':2A,12C 'techniqu':8C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7dfd31dc-4e86-42c2-a47d-260c5fd4d96b	Fundamentals of Database Systems	\N	\N	\N	[{"name":"Ramez Elmasri","role":"author"}]	9780133970777	\N	\N	Pearson	\N	2016	\N	\N	\N	1254	en	[]	\N	005.74	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780133970777-M.jpg	'9780133970777':6A 'databas':3A 'fundament':1A 'pearson':5C 'system':4A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
b261aa57-164b-4ac8-95c2-10379b0e1b1e	Digital Marketing for ASEAN SMEs	\N	\N	\N	[{"name":"Sophea Kim","role":"author"}]	\N	\N	\N	Corasoft Audio	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Step-by-step audio guide on social media, SEO, and paid advertising strategies for Southeast Asian markets.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-digmkt/200/280	'advertis':20C 'asean':4A 'asian':24C 'audio':7C,12C 'corasoft':6C 'digit':1A 'guid':13C 'market':2A,25C 'media':16C 'paid':19C 'seo':17C 'smes':5A 'social':15C 'southeast':23C 'step':9C,11C 'step-by-step':8C 'strategi':21C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
243df0f1-48c5-4f47-a82e-a31edbc74204	Mindfulness and Meditation — Guided Sessions	\N	\N	\N	[{"name":"Thich Nhat Hanh","role":"author"}]	\N	\N	\N	Parallax Press	\N	2019	\N	\N	\N	\N	en	[]	\N	\N	\N	Guided mindfulness meditations and dharma talks for daily practice.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-mindful/200/280	'daili':15C 'dharma':12C 'guid':4A,8C 'medit':3A,10C 'mind':1A,9C 'parallax':6C 'practic':16C 'press':7C 'session':5A 'talk':13C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
9a1f3e96-4666-47d6-b8a5-c0407a2d3470	Introduction to Khmer Literature	\N	\N	\N	[{"name":"Khing Hoc Dy","role":"author"}]	\N	\N	\N	Royal Academy KH	\N	2020	\N	\N	\N	\N	km	[]	\N	\N	\N	An audio exploration of classical and modern Khmer literary traditions, poetry, and prose.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-khmer-lit/200/280	'academi':6C 'audio':9C 'classic':12C 'explor':10C 'introduct':1A 'kh':7C 'khmer':3A,15C 'literari':16C 'literatur':4A 'modern':14C 'poetri':18C 'prose':20C 'royal':5C 'tradit':17C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
17f98be4-2fdf-4820-9a61-cf1bbbe960c5	Entrepreneurship in Southeast Asia	\N	\N	\N	[{"name":"Chan Sophal","role":"author"}]	\N	\N	\N	ASEAN Biz Audio	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Stories and strategies from successful entrepreneurs across ASEAN markets, including Cambodia, Vietnam, and Thailand.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-entrsea/200/280	'across':14C 'asean':5C,15C 'asia':4A 'audio':7C 'biz':6C 'cambodia':18C 'entrepreneur':13C 'entrepreneurship':1A 'includ':17C 'market':16C 'southeast':3A 'stori':8C 'strategi':10C 'success':12C 'thailand':21C 'vietnam':19C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
a4eedf88-1a90-4b5a-bbd1-222c57b58365	Climate Science for Non-Scientists	\N	\N	\N	[{"name":"Dr. Keo Vy","role":"author"}]	\N	\N	\N	GreenKH Audio	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	An accessible guide to understanding climate science, greenhouse gases, and global warming impacts.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-climate/200/280	'access':10C 'audio':8C 'climat':1A,14C 'gase':17C 'global':19C 'greenhous':16C 'greenkh':7C 'guid':11C 'impact':21C 'non':5A 'non-scientist':4A 'scienc':2A,15C 'scientist':6A 'understand':13C 'warm':20C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f15a4c23-8be9-4b64-a830-dcf2adb6cccf	IELTS Preparation — Academic Module	\N	\N	\N	[{"name":"Sandra Clark","role":"author"}]	\N	\N	\N	Cambridge Audio	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	Comprehensive audio preparation for the IELTS Academic module, covering all four skills.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-ielts/200/280	'academ':3A,13C 'audio':6C,8C 'cambridg':5C 'comprehens':7C 'cover':15C 'four':17C 'ielt':1A,12C 'modul':4A,14C 'prepar':2A,9C 'skill':18C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
db75a3ca-463c-4d98-853e-0c081a35b89d	Buddhist Philosophy and Ethics	\N	\N	\N	[{"name":"Ven. Bhikkhu Bodhi","role":"author"}]	\N	\N	\N	Wisdom Audio	\N	2018	\N	\N	\N	\N	en	[]	\N	\N	\N	Lectures on core Buddhist teachings — the Four Noble Truths, Eightfold Path, and the nature of suffering.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-buddhist/200/280	'audio':6C 'buddhist':1A,10C 'core':9C 'eightfold':16C 'ethic':4A 'four':13C 'lectur':7C 'natur':20C 'nobl':14C 'path':17C 'philosophi':2A 'suffer':22C 'teach':11C 'truth':15C 'wisdom':5C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
a67e45c0-a5df-4aee-980c-0fee294f4584	Macroeconomics for Development	\N	\N	\N	[{"name":"Prof. Tol Narin","role":"author"}]	\N	\N	\N	NUM Audio Press	\N	2022	\N	\N	\N	\N	km	[]	\N	\N	\N	Audio lectures on macroeconomic fundamentals applied to developing economies in Southeast Asia.	\N	7	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/audio-macro/200/280	'appli':12C 'asia':18C 'audio':5C,7C 'develop':3A,14C 'economi':15C 'fundament':11C 'lectur':8C 'macroeconom':1A,10C 'num':4C 'press':6C 'southeast':17C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
21300773-6915-4dbf-aff2-8b6ce615826d	Angkor Wat: A Civilisation Uncovered	\N	\N	\N	[{"name":"BBC Documentary Team","role":"author"}]	\N	\N	\N	BBC Studios	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary exploring the history, archaeology, and cultural significance of the Angkor temples.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-angkor/200/280	'angkor':1A,18C 'archaeolog':12C 'bbc':6C 'civilis':4A 'cultur':14C 'documentari':8C 'explor':9C 'histori':11C 'signific':15C 'studio':7C 'templ':19C 'uncov':5A 'wat':2A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f931b0cf-ff4e-431c-8a04-a405ea8c6b9e	Introduction to Blockchain Technology	\N	\N	\N	[{"name":"MIT OpenCourseWare","role":"author"}]	\N	\N	\N	MIT OCW	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Recorded lectures from MIT 6.S974: cryptocurrency and blockchain fundamentals.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-blockchain/200/280	'6':11C 'blockchain':3A,15C 'cryptocurr':13C 'fundament':16C 'introduct':1A 'lectur':8C 'mit':5C,10C 'ocw':6C 'record':7C 's974':12C 'technolog':4A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
89dcd1a9-21e0-4a39-bddf-80cd3226ee7a	Khmer Classical Dance — A Living Heritage	\N	\N	\N	[{"name":"Ministry of Culture KH","role":"author"}]	\N	\N	\N	MOFA Cambodia	\N	2021	\N	\N	\N	\N	km	[]	\N	\N	\N	Documentary preserving the traditions of Khmer classical dance — a UNESCO intangible heritage.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-khmerdance/200/280	'cambodia':8C 'classic':2A,15C 'danc':3A,16C 'documentari':9C 'heritag':6A,20C 'intang':19C 'khmer':1A,14C 'live':5A 'mofa':7C 'preserv':10C 'tradit':12C 'unesco':18C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
08bfd860-5f4f-405c-9285-225eada7f89a	Climate Change and the Mekong River	\N	\N	\N	[{"name":"MRC Research Unit","role":"author"}]	\N	\N	\N	Mekong River Commission	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Scientific documentary on how climate change is affecting water levels, biodiversity, and communities along the Mekong.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-mekong/200/280	'affect':17C 'along':23C 'biodivers':20C 'chang':2A,15C 'climat':1A,14C 'commiss':9C 'communiti':22C 'documentari':11C 'level':19C 'mekong':5A,7C,25C 'river':6A,8C 'scientif':10C 'water':18C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
111c05a0-ef63-4dc9-a0f8-5aafc44a2d04	Web Development Bootcamp — Full Course	\N	\N	\N	[{"name":"Angela Yu","role":"author"}]	\N	\N	\N	Udemy Video	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete web development course covering HTML, CSS, JavaScript, Node.js, React, and MongoDB.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-webdev/200/280	'bootcamp':3A 'complet':8C 'cours':5A,11C 'cover':12C 'css':14C 'develop':2A,10C 'full':4A 'html':13C 'javascript':15C 'mongodb':19C 'node.js':16C 'react':17C 'udemi':6C 'video':7C 'web':1A,9C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
2f23a2a2-c976-422f-a96e-8d372b7290e1	Cambodia's Floating Villages	\N	\N	\N	[{"name":"NatGeo Asia","role":"author"}]	\N	\N	\N	National Geographic	\N	2019	\N	\N	\N	\N	en	[]	\N	\N	\N	A journey through the unique floating communities on Tonle Sap Lake and their way of life.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-floating/200/280	'cambodia':1A 'communiti':13C 'float':3A,12C 'geograph':6C 'journey':8C 'lake':17C 'life':22C 'nation':5C 'sap':16C 'tonl':15C 'uniqu':11C 'villag':4A 'way':20C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
86f0f670-1d7b-4d73-bb8d-e0a99885eeb0	Data Science with Python — Full Course	\N	\N	\N	[{"name":"Jose Portilla","role":"author"}]	\N	\N	\N	Udemy Video	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete data science course: NumPy, Pandas, Matplotlib, Seaborn, scikit-learn, and machine learning projects.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-datascience/200/280	'complet':9C 'cours':6A,12C 'data':1A,10C 'full':5A 'learn':19C,22C 'machin':21C 'matplotlib':15C 'numpi':13C 'panda':14C 'project':23C 'python':4A 'scienc':2A,11C 'scikit':18C 'scikit-learn':17C 'seaborn':16C 'udemi':7C 'video':8C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
597b22d1-6808-438a-8f83-678262052615	The Khmer Rouge Tribunal — Justice Delayed	\N	\N	\N	[{"name":"ECCC Media Unit","role":"author"}]	\N	\N	\N	ECCC	\N	2020	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary on the Extraordinary Chambers in the Courts of Cambodia and the pursuit of justice for genocide survivors.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-eccc/200/280	'cambodia':17C 'chamber':12C 'court':15C 'delay':6A 'documentari':8C 'eccc':7C 'extraordinari':11C 'genocid':24C 'justic':5A,22C 'khmer':2A 'pursuit':20C 'roug':3A 'survivor':25C 'tribun':4A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
44e1466f-01c2-4618-9f12-b0af0271285d	Project Management Professional — PMP Prep	\N	\N	\N	[{"name":"Joseph Phillips","role":"author"}]	\N	\N	\N	Udemy Video	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Complete PMP exam preparation covering all PMBOK process groups and knowledge areas.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-pmp/200/280	'area':19C 'complet':8C 'cover':12C 'exam':10C 'group':16C 'knowledg':18C 'manag':2A 'pmbok':14C 'pmp':4A,9C 'prep':5A 'prepar':11C 'process':15C 'profession':3A 'project':1A 'udemi':6C 'video':7C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
dd095f93-e31e-4775-bef5-fc870bca5f72	Phnom Penh: City in Transformation	\N	\N	\N	[{"name":"Urban Stories Asia","role":"author"}]	\N	\N	\N	Urban Stories	\N	2023	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary on the rapid urban development and changing cityscape of Phnom Penh from 2010 to 2023.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-pnhpenh/200/280	'2010':21C '2023':23C 'chang':15C 'citi':3A 'cityscap':16C 'develop':13C 'documentari':8C 'penh':2A,19C 'phnom':1A,18C 'rapid':11C 'stori':7C 'transform':5A 'urban':6C,12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7710b171-c98b-4c4f-a55a-a2fd85289c93	Artificial Intelligence: The Future of Work	\N	\N	\N	[{"name":"DW Documentary","role":"author"}]	\N	\N	\N	Deutsche Welle	\N	2022	\N	\N	\N	\N	en	[]	\N	\N	\N	Explores how AI and automation are reshaping industries and labor markets across the globe.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-aiwork/200/280	'across':20C 'ai':11C 'artifici':1A 'autom':13C 'deutsch':7C 'explor':9C 'futur':4A 'globe':22C 'industri':16C 'intellig':2A 'labor':18C 'market':19C 'reshap':15C 'well':8C 'work':6A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
1c2286e1-6a62-4ae0-bb58-61179fe7f162	Rice Farming and Food Security in Cambodia	\N	\N	\N	[{"name":"FAO Asia-Pacific","role":"author"}]	\N	\N	\N	FAO	\N	2021	\N	\N	\N	\N	en	[]	\N	\N	\N	Documentary covering traditional and modern rice cultivation practices and their impact on Cambodia's food security.	\N	8	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/vid-rice/200/280	'cambodia':7A,21C 'cover':10C 'cultiv':15C 'documentari':9C 'fao':8C 'farm':2A 'food':4A,23C 'impact':19C 'modern':13C 'practic':16C 'rice':1A,14C 'secur':5A,24C 'tradit':11C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
eb72b35e-727a-4b3d-ae4a-b68d79613a4d	The Impact of Microfinance on Rural Poverty Reduction in Cambodia	\N	\N	\N	[{"name":"Ratana Chan","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2022	\N	\N	\N	198	en	[]	\N	332.7	\N	Empirical study examining how MFI lending affects household income and poverty indicators across three provinces.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-microfinance/200/280	'across':28C 'affect':22C 'cambodia':10A 'empir':16C 'examin':18C 'household':23C 'impact':2A 'incom':24C 'indic':27C 'lend':21C 'mfi':20C 'microfin':4A 'penh':15C 'phnom':14C 'poverti':7A,26C 'provinc':30C 'reduct':8A 'royal':11C 'rural':6A 'studi':17C 'three':29C 'univers':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
01153b10-4770-49ea-9222-9627f42934ae	AI-Assisted Language Learning for Khmer Secondary Students	\N	\N	\N	[{"name":"Bunna Heng","role":"author"}]	\N	\N	\N	Institute of Technology of Cambodia	\N	2023	\N	\N	\N	142	en	[]	\N	418.0078	\N	Mixed-methods research on the effectiveness of AI chatbots in improving English proficiency among Khmer-speaking students.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-aillang/200/280	'ai':2A,23C 'ai-assist':1A 'among':29C 'assist':3A 'cambodia':14C 'chatbot':24C 'effect':21C 'english':27C 'improv':26C 'institut':10C 'khmer':7A,31C 'khmer-speak':30C 'languag':4A 'learn':5A 'method':17C 'mix':16C 'mixed-method':15C 'profici':28C 'research':18C 'secondari':8A 'speak':32C 'student':9A,33C 'technolog':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
48fdeb6b-db7d-4703-8ddd-95f87eff37d7	Urban Heat Islands and Green Infrastructure Planning in Phnom Penh	\N	\N	\N	[{"name":"Pisey Mao","role":"author"}]	\N	\N	\N	Paññāsāstra University	\N	2023	\N	\N	\N	176	en	[]	\N	307.76	\N	GIS-based analysis of urban heat distribution and proposed green-corridor interventions in Phnom Penh.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-urbanheat/200/280	'analysi':16C 'base':15C 'corridor':25C 'distribut':20C 'gis':14C 'gis-bas':13C 'green':5A,24C 'green-corridor':23C 'heat':2A,19C 'infrastructur':6A 'intervent':26C 'island':3A 'paññāsāstra':11C 'penh':10A,29C 'phnom':9A,28C 'plan':7A 'propos':22C 'univers':12C 'urban':1A,18C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
5a71f0b6-fbc8-4b97-8db1-a342cc143aac	Digital Transformation Readiness of Cambodian SMEs Post-COVID-19	\N	\N	\N	[{"name":"Makara Tep","role":"author"}]	\N	\N	\N	National University of Management	\N	2022	\N	\N	\N	210	en	[]	\N	338.642	\N	Survey-based assessment of technology adoption barriers and digital readiness among 300 SMEs in Cambodia.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-digitaltrans/200/280	'19':10A '300':27C 'adopt':21C 'among':26C 'assess':18C 'barrier':22C 'base':17C 'cambodia':30C 'cambodian':5A 'covid':9A 'digit':1A,24C 'manag':14C 'nation':11C 'post':8A 'post-covid':7A 'readi':3A,25C 'smes':6A,28C 'survey':16C 'survey-bas':15C 'technolog':20C 'transform':2A 'univers':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
bc243319-98c1-4ffb-81ea-7c3d69c16e54	Water Quality Assessment of the Tonle Sap Lake Basin	\N	\N	\N	[{"name":"Sothea Khun","role":"author"}]	\N	\N	\N	Royal University of Agriculture	\N	2022	\N	\N	\N	164	en	[]	\N	551.48	\N	Environmental monitoring study of heavy metal contamination, turbidity, and nutrient levels in Tonle Sap Lake.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-water/200/280	'agricultur':13C 'assess':3A 'basin':9A 'contamin':20C 'environment':14C 'heavi':18C 'lake':8A,28C 'level':24C 'metal':19C 'monitor':15C 'nutrient':23C 'qualiti':2A 'royal':10C 'sap':7A,27C 'studi':16C 'tonl':6A,26C 'turbid':21C 'univers':11C 'water':1A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7018a9ca-5c57-44ac-ac23-3697b7aa5894	Gender Inequality in STEM Education in Cambodian Universities	\N	\N	\N	[{"name":"Channary Sok","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2023	\N	\N	\N	155	en	[]	\N	305.43	\N	Qualitative research examining systemic and cultural barriers preventing women from pursuing STEM degrees in Cambodia.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-gender/200/280	'barrier':20C 'cambodia':28C 'cambodian':7A 'cultur':19C 'degre':26C 'educ':5A 'examin':16C 'gender':1A 'inequ':2A 'penh':13C 'phnom':12C 'prevent':21C 'pursu':24C 'qualit':14C 'research':15C 'royal':9C 'stem':4A,25C 'system':17C 'univers':8A,10C 'women':22C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
32fce104-1c96-40d4-a891-1256afd55d8f	E-Government Adoption and Citizen Trust in Cambodia	\N	\N	\N	[{"name":"Dara Vong","role":"author"}]	\N	\N	\N	National University of Management	\N	2021	\N	\N	\N	187	en	[]	\N	351	\N	Technology acceptance model analysis of citizen willingness to use e-government services in Phnom Penh and provincial areas.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-egov/200/280	'accept':15C 'adopt':4A 'analysi':17C 'area':32C 'cambodia':9A 'citizen':6A,19C 'e':2A,24C 'e-govern':1A,23C 'govern':3A,25C 'manag':13C 'model':16C 'nation':10C 'penh':29C 'phnom':28C 'provinci':31C 'servic':26C 'technolog':14C 'trust':7A 'univers':11C 'use':22C 'willing':20C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7e8897f1-fe97-4350-9f9f-9879ac9ebcb8	Soil Erosion and Conservation Practices in Kampong Speu Province	\N	\N	\N	[{"name":"Vichet Phan","role":"author"}]	\N	\N	\N	Royal University of Agriculture	\N	2021	\N	\N	\N	140	km	[]	\N	631.45	\N	Field-based assessment of soil erosion rates and evaluation of traditional and modern conservation measures in upland farming areas.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-soil/200/280	'agricultur':13C 'area':33C 'assess':17C 'base':16C 'conserv':4A,28C 'eros':2A,20C 'evalu':23C 'farm':32C 'field':15C 'field-bas':14C 'kampong':7A 'measur':29C 'modern':27C 'practic':5A 'provinc':9A 'rate':21C 'royal':10C 'soil':1A,19C 'speu':8A 'tradit':25C 'univers':11C 'upland':31C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
fe4f1644-1896-4b89-a4fb-b9259a72ec4e	Tourism and Cultural Heritage Preservation in Siem Reap	\N	\N	\N	[{"name":"Sreymom Hout","role":"author"}]	\N	\N	\N	Paññāsāstra University	\N	2022	\N	\N	\N	195	en	[]	\N	363.69	\N	Case study examining the tension between mass tourism growth and the long-term preservation of Angkor UNESCO World Heritage Sites.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-tourism/200/280	'angkor':27C 'case':11C 'cultur':3A 'examin':13C 'growth':19C 'heritag':4A,30C 'long':23C 'long-term':22C 'mass':17C 'paññāsāstra':9C 'preserv':5A,25C 'reap':8A 'siem':7A 'site':31C 'studi':12C 'tension':15C 'term':24C 'tourism':1A,18C 'unesco':28C 'univers':10C 'world':29C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
379164cf-e255-4b27-9705-2e2fb285b73d	Mobile Banking Adoption Among Unbanked Populations in Rural Cambodia	\N	\N	\N	[{"name":"Lyda Chhim","role":"author"}]	\N	\N	\N	Institute of Technology of Cambodia	\N	2023	\N	\N	\N	168	en	[]	\N	332.1	\N	Investigates factors influencing mobile banking uptake in rural Cambodian provinces with limited banking infrastructure.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-mobilebank/200/280	'adopt':3A 'among':4A 'bank':2A,19C,27C 'cambodia':9A,14C 'cambodian':23C 'factor':16C 'influenc':17C 'infrastructur':28C 'institut':10C 'investig':15C 'limit':26C 'mobil':1A,18C 'popul':6A 'provinc':24C 'rural':8A,22C 'technolog':12C 'unbank':5A 'uptak':20C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
79fecaa0-3ea1-4059-a217-3e1f626e2287	Supply Chain Resilience in Cambodian Garment Manufacturing Post-Pandemic	\N	\N	\N	[{"name":"Kosal Meng","role":"author"}]	\N	\N	\N	National University of Management	\N	2022	\N	\N	\N	222	en	[]	\N	338.47	\N	Analysis of disruption recovery strategies and resilience-building practices in Cambodia's export-oriented garment sector.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-supplychain/200/280	'analysi':15C 'build':23C 'cambodia':26C 'cambodian':5A 'chain':2A 'disrupt':17C 'export':29C 'export-ori':28C 'garment':6A,31C 'manag':14C 'manufactur':7A 'nation':11C 'orient':30C 'pandem':10A 'post':9A 'post-pandem':8A 'practic':24C 'recoveri':18C 'resili':3A,22C 'resilience-build':21C 'sector':32C 'strategi':19C 'suppli':1A 'univers':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7ce2c0d4-7198-44a8-ad19-e422a85a3473	Renewable Energy Transition and Policy Gaps in Cambodia	\N	\N	\N	[{"name":"Sophary Nhem","role":"author"}]	\N	\N	\N	Royal University of Phnom Penh	\N	2023	\N	\N	\N	183	en	[]	\N	333.79	\N	Policy analysis of Cambodia's solar and hydropower development roadmap and identification of regulatory gaps for a just energy transition.	\N	6	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/th-energy/200/280	'analysi':15C 'cambodia':8A,17C 'develop':22C 'energi':2A,32C 'gap':6A,28C 'hydropow':21C 'identif':25C 'penh':13C 'phnom':12C 'polici':5A,14C 'regulatori':27C 'renew':1A 'roadmap':23C 'royal':9C 'solar':19C 'transit':3A,33C 'univers':10C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
934f1859-d549-41a7-a0ae-f63e8cab50e1	Design Patterns: Elements of Reusable Object-Oriented Software	\N	\N	\N	[{"name":"Erich Gamma","role":"author"}]	9780201633610	\N	\N	Addison-Wesley	\N	1994	\N	\N	\N	395	en	[]	\N	005.117	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780201633610-M.jpg	'9780201633610':13A 'addison':11C 'addison-wesley':10C 'design':1A 'element':3A 'object':7A 'object-ori':6A 'orient':8A 'pattern':2A 'reusabl':5A 'softwar':9A 'wesley':12C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
602eb942-3b03-4187-87ab-7e779dbcf7a4	Introduction to Algorithms	\N	\N	\N	[{"name":"Thomas H. Cormen","role":"author"}]	9780262046305	\N	\N	MIT Press	\N	2022	\N	\N	\N	1312	en	[]	\N	005.1	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg	'9780262046305':6A 'algorithm':3A 'introduct':1A 'mit':4C 'press':5C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
bcf934c0-bdc7-47bb-8845-da5fbe7fb592	The Art of War	\N	\N	\N	[{"name":"Sun Tzu","role":"author"}]	9781599869773	\N	\N	Filiquarian	\N	2007	\N	\N	\N	68	en	[]	\N	355.02	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781599869773-M.jpg	'9781599869773':6A 'art':2A 'filiquarian':5C 'war':4A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
446c35b2-6743-4cfe-b8f9-5d73171d1128	Khmer Grammar for Foreigners	\N	\N	\N	[{"name":"Judith Jacob","role":"author"}]	9780197135976	\N	\N	Oxford University Press	\N	1968	\N	\N	\N	219	en	[]	\N	495.932	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780197135976-M.jpg	'9780197135976':8A 'foreign':4A 'grammar':2A 'khmer':1A 'oxford':5C 'press':7C 'univers':6C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
96385e93-452a-45b0-a1a9-68d2e664ca3c	The Great Gatsby	\N	\N	\N	[{"name":"F. Scott Fitzgerald","role":"author"}]	9780743273565	\N	\N	Scribner	\N	2004	\N	\N	\N	180	en	[]	\N	813.52	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg	'9780743273565':5A 'gatsbi':3A 'great':2A 'scribner':4C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
171652e6-8e30-4b44-bc69-b8a187aad580	Principles of Economics	\N	\N	\N	[{"name":"N. Gregory Mankiw","role":"author"}]	9781305585126	\N	\N	Cengage Learning	\N	2020	\N	\N	\N	860	en	[]	\N	330	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9781305585126-M.jpg	'9781305585126':6A 'cengag':4C 'econom':3A 'learn':5C 'principl':1A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
ea7efc4e-e5c9-421d-acef-76fe296971d6	A History of Cambodia	\N	\N	\N	[{"name":"David P. Chandler","role":"author"}]	9780813343631	\N	\N	Westview Press	\N	2008	\N	\N	\N	320	en	[]	\N	959.6	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780813343631-M.jpg	'9780813343631':7A 'cambodia':4A 'histori':2A 'press':6C 'westview':5C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
f176a38a-b063-4eb3-9169-742505f6dadd	Molecular Biology of the Cell	\N	\N	\N	[{"name":"Bruce Alberts","role":"author"}]	9780393884821	\N	\N	W. W. Norton	\N	2022	\N	\N	\N	1342	en	[]	\N	571.6	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/isbn/9780393884821-M.jpg	'9780393884821':9A 'biolog':2A 'cell':5A 'molecular':1A 'norton':8C 'w':6C,7C	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
7c6fb597-ac60-4c0e-ac5e-e0a2205051af	Understanding Cambodia's Economy	\N	\N	\N	[{"name":"Toshiyasu Kato","role":"author"}]	9789996395000	\N	\N	Cambodia Development Resource Institute	\N	2020	\N	\N	\N	246	en	[]	\N	330.9596	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://picsum.photos/seed/cat-cambodia-econ/200/280	'9789996395000':9A 'cambodia':2A,5C 'develop':6C 'economi':4A 'institut':8C 'resourc':7C 'understand':1A	active	\N	2026-06-10 05:44:05	2026-06-10 05:44:05	2026-06-10 05:44:05	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
af345410-b59a-428a-bf34-c948b3be6386	International business	\N	\N	\N	[{"name":"John D. Daniels","role":"aut"},{"name":"Lee H. Radebaugh","role":"aut"},{"name":"Daniel P. Sullivan","role":"aut"},{"name":"John Daniels","role":"aut"},{"name":"Daniel Sullivan","role":"aut"}]	0133457230	\N	\N	Addison-Wesley	\N	1976	\N	\N	\N	\N	eng	[{"term":"International business enterprises","scheme":"LCSH"},{"term":"International economic relations","scheme":"LCSH"},{"term":"Foreign Investments","scheme":"LCSH"},{"term":"Buitenlandse investeringen","scheme":"LCSH"},{"term":"Inversiones extranjeras","scheme":"LCSH"}]	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/id/87440-L.jpg	'0133457230':6A 'addison':4C 'addison-wesley':3C 'busi':2A 'intern':1A 'wesley':5C	active	\N	2026-06-11 02:04:30	2026-06-10 19:04:30	2026-06-10 19:04:30	\N	\N	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	\N	\N	\N	\N	mono	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
d85e1270-66b6-42fd-a1ea-e80c99e2db8a	The Very Busy Spider	\N	\N	\N	[{"name":"Eric Carle","role":"aut"}]	9781484421680	\N	\N	Gerstenberg	\N	1984	\N	\N	\N	\N	spa	[{"term":"Spider webs","scheme":"LCSH"},{"term":"Ara\\u00f1as","scheme":"LCSH"},{"term":"Juvenile fiction","scheme":"LCSH"},{"term":"Spider","scheme":"LCSH"},{"term":"Fiction","scheme":"LCSH"}]	\N	\N	\N	\N	\N	1	\N	\N	\N	\N	\N	\N	\N	https://covers.openlibrary.org/b/id/1199659-L.jpg	'9781484421680':6A 'busi':3A 'gerstenberg':5C 'spider':4A	active	\N	2026-06-11 02:18:15	2026-06-10 19:18:15	2026-06-10 19:18:15	\N	\N	019eb2f8-92d0-71be-ace8-4d21abdf32ef	\N	\N	\N	\N	mono	\N	\N	\N	[]	\N	\N	[]	[]	\N	\N	\N	\N	\N	f	f	f	f	\N	\N
\.


--
-- Data for Name: card_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.card_templates (id, name, width_mm, height_mm, background_color, background_image_path, elements, is_default, created_at, updated_at, deleted_at) FROM stdin;
0eaf59c5-e943-4391-bf66-78ee1206f617	Default Library Card	85.60	54.00	#ffffff	\N	[{"h": 13, "w": 85.6, "x": 0, "y": 0, "id": "el_header", "type": "rect", "borderRadius": 0, "backgroundColor": "#1e3a8a"}, {"h": 8, "w": 8, "x": 3, "y": 2.5, "id": "el_logo", "type": "logo"}, {"h": 7, "w": 60, "x": 13, "y": 3.5, "id": "el_libnm", "type": "field", "align": "left", "color": "#ffffff", "field": "library_name", "fontSize": 9, "fontWeight": "bold"}, {"h": 18, "w": 18, "x": 3, "y": 17, "id": "el_avatar", "type": "initials"}, {"h": 6, "w": 58, "x": 24, "y": 17, "id": "el_name", "type": "field", "align": "left", "color": "#111827", "field": "full_name", "fontSize": 11, "fontWeight": "bold"}, {"h": 5, "w": 58, "x": 24, "y": 23, "id": "el_namekm", "type": "field", "align": "left", "color": "#374151", "field": "full_name_km", "fontSize": 9, "fontWeight": "normal"}, {"h": 4, "w": 30, "x": 24, "y": 29, "id": "el_cat", "type": "field", "align": "left", "color": "#6b7280", "field": "category", "fontSize": 8, "fontWeight": "normal"}, {"h": 4, "w": 28, "x": 54, "y": 29, "id": "el_exp", "type": "field", "align": "right", "color": "#6b7280", "field": "membership_expiry", "fontSize": 7, "fontWeight": "normal"}, {"h": 11, "w": 60, "x": 3, "y": 38, "id": "el_barcode", "type": "barcode"}, {"h": 5, "w": 19, "x": 64, "y": 42, "id": "el_cardno", "type": "field", "align": "right", "color": "#111827", "field": "patron_number", "fontSize": 8, "fontWeight": "bold"}]	t	2026-06-10 17:07:28	2026-06-10 17:07:28	\N
18cfbee7-98ab-4856-9020-99c856499f04	New Card Template	94.60	54.00	#c39797	\N	[{"h": 13, "w": 85.6, "x": 0, "y": 0, "id": "el_header", "type": "rect", "borderRadius": 0, "backgroundColor": "#1e3a8a"}, {"h": 8, "w": 8, "x": 3, "y": 2.5, "id": "el_logo", "type": "logo"}, {"h": 7, "w": 60, "x": 13, "y": 3.5, "id": "el_libnm", "type": "field", "align": "left", "color": "#ffffff", "field": "library_name", "fontSize": 9, "fontWeight": "bold"}, {"h": 18, "w": 18, "x": 1.9, "y": 14.8, "id": "el_avatar", "type": "initials"}, {"h": 6, "w": 58, "x": 24, "y": 17, "id": "el_name", "type": "field", "align": "left", "color": "#111827", "field": "full_name", "fontSize": 11, "fontWeight": "bold"}, {"h": 5, "w": 58, "x": 14.2, "y": 22.9, "id": "el_namekm", "type": "field", "align": "left", "color": "#374151", "field": "full_name_km", "fontSize": 9, "fontWeight": "normal"}, {"h": 4, "w": 30, "x": 24, "y": 29, "id": "el_cat", "type": "field", "align": "left", "color": "#6b7280", "field": "category", "fontSize": 8, "fontWeight": "normal"}, {"h": 4, "w": 28, "x": 54, "y": 29, "id": "el_exp", "type": "field", "align": "right", "color": "#6b7280", "field": "membership_expiry", "fontSize": 7, "fontWeight": "normal"}, {"h": 11, "w": 60, "x": 5.6, "y": 38.4, "id": "el_barcode", "type": "barcode"}, {"h": 5, "w": 19, "x": 53.1, "y": 30.4, "id": "el_cardno", "type": "field", "align": "right", "color": "#111827", "field": "patron_number", "fontSize": 8, "fontWeight": "bold"}, {"h": 11, "w": 55, "x": 8.2, "y": 39.6, "id": "el_1781164657342_0", "type": "barcode"}, {"h": 12, "w": 12, "x": 1.5, "y": 1.7, "id": "el_1781164667638_1", "type": "logo"}]	f	2026-06-11 08:01:23	2026-06-11 08:01:23	\N
\.


--
-- Data for Name: collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.collections (id, name, name_km, code, description, is_loanable, loan_period_days, renewals_allowed, fine_rate_per_day, is_active, created_at, updated_at) FROM stdin;
1	General Collection	\N	GEN	\N	t	14	2	0.10	t	2026-06-08 13:53:25	2026-06-08 13:53:25
2	Reference Collection	\N	REF	\N	f	0	0	0.00	t	2026-06-08 13:53:25	2026-06-08 13:53:25
3	Khmer Collection	\N	KHM	\N	t	14	2	0.10	t	2026-06-08 13:53:25	2026-06-08 13:53:25
4	Periodicals	\N	PER	\N	f	0	0	0.00	t	2026-06-08 13:53:25	2026-06-08 13:53:25
5	Thesis & Dissertation	\N	THES	\N	t	7	1	0.20	t	2026-06-08 13:53:25	2026-06-08 13:53:25
6	Reserve Collection	\N	RES	\N	t	3	0	0.50	t	2026-06-08 13:53:25	2026-06-08 13:53:25
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
063a7d98-b69b-4a0e-a032-f38f5622ecfa	216f1ef1-ea2d-4d7b-8a0e-e68f9316872f	\N	view	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	gt62pVcOByvLlt3bSbwig3AGlsNaV1plVwfoqJjA	\N	2026-06-10 05:30:16
ec1ff79d-5969-4e26-accf-bbb60e5d1dad	8f8829b0-7674-4d88-a431-da9ebb43cf5c	\N	view	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	7Qwk2sScibnThMeZpZ5JnG2LwauGgPGOdHHJrtYt	\N	2026-06-12 04:20:54
\.


--
-- Data for Name: digital_resources; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_resources (id, biblio_id, file_path, original_filename, file_size_bytes, mime_type, format, url, is_external, thumbnail_path, access_type, embargo_until, handle, ocr_text, ocr_processed_at, duration_seconds, bitrate, download_count, view_count, version, created_at, updated_at, deleted_at) FROM stdin;
216f1ef1-ea2d-4d7b-8a0e-e68f9316872f	72bb8b21-c803-4a20-afd1-d10ce79e047c	\N	\N	\N	\N	epub	\N	f	\N	open_access	\N	\N	\N	\N	\N	\N	0	1	1.0	2026-06-08 15:38:58	2026-06-10 05:30:20	\N
3cfbae29-f5c0-4ba9-a75c-cf706c3bbd64	f1322884-c7fc-4ace-b00a-ca3d6a29ec0f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	2579	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
4d4e9264-903c-4daa-a97e-8a3c134e5754	3f41060e-77e4-45a8-b5d9-640e31b4210d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3699	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
f1a0f22a-388f-4ec5-809c-d3020047ee4f	0e2e0f57-e910-408c-a62b-657cd00947ae	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1972	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
87597ccf-1b98-45cf-85e5-182c7d881192	6ee6cb52-14c9-4893-bcbf-7b4b3eb41255	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	356	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
cc86e6ec-f216-4719-b6fc-a6c05ca1c31b	e33bd29a-dc90-4be4-a661-8b495b8e173e	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	7200	\N	0	1483	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
23822641-a4de-4cab-a209-a4987b360a4a	d1d30095-adcc-4a0d-800f-12d906018543	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	27600	\N	0	899	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
c7f5a178-2cde-4a85-a5c5-995385825cc3	5bb43021-caba-4bde-a192-bc4e12afefd6	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	5400	\N	0	1819	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
409a59cf-4f54-4184-9528-43a33356f415	4be6a5c6-d7e5-442c-8ec2-24fbeb4e3643	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	10800	\N	0	2727	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
d735d05d-b9f9-4a1d-a96a-d1dd38a809d0	e7c0445b-edcf-42ad-acbd-21210cfa551a	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	493	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
fca88521-448e-4498-8340-93cbc5db32e7	fd6cd00e-2e3f-4e39-83ee-6707e3276431	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	301	1.0	2026-06-10 05:32:12	2026-06-10 05:32:12	\N
57b3f534-c951-4706-947b-508e680ac25f	497c43a9-30e3-42b5-b6c0-6e879df0c204	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1072	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
1cf3a62b-138c-4473-a7da-7da6dfbdae0a	09137895-7297-4ce0-b8e1-093f1e973d1f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	4745	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
6acd2a59-8091-4942-af4f-b2b929c9d455	e3136c44-1ea7-479b-ba92-cf1de73862a5	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	423	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
2fe47e46-7da7-4fd8-80c1-a521012bf063	02809529-fe7e-4dc4-ac10-a039942f207f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	2895	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
443e23d5-a54b-4642-8b51-0a4e6fce84fe	67e1fb8b-8341-4501-9b1d-c22f8c6c05fd	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3946	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
ec886ebd-6b71-4f3b-a913-072340863c08	4ea406ea-c7cb-43a9-aa70-781e90557b8a	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	4630	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
81adb53a-46e6-4576-a3a7-da2371c8b81a	cfcfa658-5951-42f4-9e08-d0bfec8abf8f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	4815	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
d6723d63-cef5-4589-9c48-c7a3c4098afe	2d102962-8971-460a-9656-731937e68711	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	2385	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
e1ec5fd8-1f92-442a-aab9-eb44ba7726fc	c3276010-420c-4619-8863-9fc1fecbe452	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1573	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
375c045d-6beb-46f2-bbcc-97f05f8f15a8	e99f7fd6-a763-4a63-bd84-a1a856e559aa	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1980	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
7fcb138f-c310-4215-9ace-022f51da243c	90585af6-d18d-4ad5-b1dc-58162706be67	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	4725	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
02a07547-d8ef-41db-9630-2e55cdde6815	8d84d552-ccc4-448a-859f-9feb51fcd181	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	169	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
3214e7dd-77dd-4603-93ed-e695f3e1ff2b	fe382cd0-3c79-48da-baeb-d2bfc8b45f4c	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1474	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
34b796b2-3cc6-44f1-857e-a53b561a5222	21c04bd2-5882-4ef2-bb3a-6b9d61fe1745	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	280	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
5af354ad-1252-4b90-bfd0-11d43e13b6cc	170f2a85-eb89-4672-9883-799971f1fc57	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1805	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
35fb0387-f5aa-446e-ae07-786a396d4659	2ec65667-1d5e-4c93-a61b-9070c570d609	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1387	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
33029934-97cc-48c0-878a-2e94fef598a5	db824b19-f284-4518-ba05-ead82f67a1a7	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1131	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
a3cd62ba-43b1-4374-9e01-65bcbae776e8	9214a178-a8f9-45f4-86c5-2d43dbfdc1c3	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	94	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
eaeb82a6-f545-46b7-9823-750b9ad5453a	9132d0d7-2acc-4c2d-af4a-72679b1de670	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	178	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
0f749870-30b3-48de-bb43-5ca02a777d80	23cc291c-4ad0-4c55-9101-9ea34b5687c8	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	892	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
0f483bb0-858f-440f-8bf3-a9427abeb90d	53ebd656-f50d-4496-9430-039eb97496f0	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	161	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
7ed32567-3b4b-46fd-a45b-1a9b2f956500	1840aa77-a500-40c0-8333-29468f4f78db	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	246	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
68949b74-d6c4-4417-8f03-a48a6e2e5ca7	2a494f3a-a705-45b1-8426-7dcbd3995050	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1506	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
97ac1c25-dc27-48e6-b712-0a512244e6e4	6f5d4d07-27d9-4c46-986f-173871f2f4e1	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1194	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
c7163ba6-bed4-4135-9944-c6b9e65a10ab	ea1ad682-0eab-4781-919b-d8e2a876f68a	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	7200	\N	0	185	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
5a564e25-abe2-4992-8731-38f13fb0e6ee	8b5c183f-c085-4ac9-b457-fca3e3ceb79c	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	9450	\N	0	426	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
9335995c-f9c9-4fd0-bd1a-1a8bd32c9e27	fe028fc9-151c-4017-b564-8e3e0fe82725	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	27600	\N	0	1162	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
309b8209-e5a4-4da2-88c8-036ca7598ee3	1ef52d65-213e-468e-8488-96b0d5e47f99	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	5400	\N	0	262	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
9fde035e-0730-4d4f-9561-03065ad2aead	32b26361-9b73-4aef-8d91-99ba3d751611	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	14400	\N	0	1117	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
0d47452c-eb4f-47dd-8ab3-50e085e19de1	09c5b8c8-c9c3-4003-96cf-0d43625cc82c	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	3600	\N	0	1069	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
1d91e5e9-001e-4f67-8dcc-fbe42c35de7b	f033783c-f9d3-4408-9ffa-33636c6e6d37	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	6300	\N	0	775	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
63490637-4f38-47d1-beb5-ed8bcd1f1a4d	d0ff57e6-a02b-47ec-a0b6-aa570b6c48e1	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	10800	\N	0	1363	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
b556ad09-81ea-45d5-a6dc-9e87c46529b1	86ec3a75-8fd3-4172-8a8b-6bef631e894a	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	7800	\N	0	93	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
51578d1f-dc90-4448-8beb-feaf5753e8d8	9b980984-39ad-4cb5-8db8-1a15ce2895aa	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	18000	\N	0	1497	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
abf6cd11-f0ab-47a4-b291-6aa56d0a7554	3d9d7799-3751-49ed-9dc0-ae5761348075	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	12600	\N	0	196	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
f4fc587a-87e7-4088-87cd-0e39d57c0e9b	85f50958-5f16-4cef-925d-4afe960928c1	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	9000	\N	0	875	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
61787906-1691-4512-b6c5-1b5e857f95a9	5559b320-d586-4368-a7c4-530c63408749	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	5400	\N	0	486	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
fbd3ff89-c7d1-49f9-8c65-2b2444a79f49	8104d8df-f175-4d26-9008-6649e31991d4	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	10800	\N	0	1178	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
e3967007-1c21-43f8-a8c2-8dd00c372e15	3dc04bb7-824e-40ed-8733-ffc0a0768e3b	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3600	\N	0	2899	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
4fb2c62d-a4c2-4129-870d-1b6d9a6ba9b1	c9099905-004e-49d1-94ed-a06750427aa9	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	4800	\N	0	211	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
ef71f01c-770b-498a-a0cc-0ec65c795383	8c22cd94-0878-4b89-9dfb-8d6c0015bacc	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	57600	\N	0	2489	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
e3c18c3b-fb21-4272-9abe-8ad6cd33ff71	67fd6f1c-9be0-40f2-94d9-cbe0874914fa	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	2700	\N	0	1212	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
ab4e4061-aa55-40d3-a1f1-8e285132b038	dcbbc925-5c6a-4531-b6e9-c85c724f5a49	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	43200	\N	0	227	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
c68fd7a5-9043-4815-a4bb-adacb419664d	57b25975-3483-480e-b551-da63d56f63cf	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	5100	\N	0	232	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
b72dec07-eeff-4c81-a3a8-6758a86e80e1	720247b6-695e-44f5-b6e5-82ec4b7079a9	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	32400	\N	0	2485	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
da1679fa-3502-4f56-a5a6-d97d0418d40b	52f426aa-ed83-48d5-b9a5-8376b8b06075	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3300	\N	0	1197	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
d7766231-77e2-46e4-ac73-7c4a0e5865eb	de4f870d-3549-4b84-9dab-a9b7eb55f517	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	4200	\N	0	2320	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
6559f6dc-0d6c-40a2-b87e-d325dc5bc16e	01fa1926-5c98-4aa9-afde-610c9418a678	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3900	\N	0	2697	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
4e711134-a587-446a-a438-82bf64cd45e8	8420c0bf-4435-4e63-a3e9-490b40d44295	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	204	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
b23b2f16-068c-493d-aa0c-5661dc1f7883	19a2147e-51c8-4cb3-bb62-c4000b4ca5e0	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	302	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
e57fdc8b-5b1b-443c-90f9-841cd44084d3	0ae5cbee-51d9-4be9-8317-916211794209	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	377	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
ee880807-f782-46a8-a59e-487c762e136d	e39e2a2b-364d-470b-8e83-23bb58139f55	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	416	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
f5881724-5232-4629-a528-ead9716eecf7	e0a8d49f-9dd4-4803-980b-ded023d3c9aa	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	386	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
5792e618-e8ed-461a-a244-62e908216065	8fea5618-1aba-4719-bf4a-2d082fe07908	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	304	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
ff0c94fa-5266-43dc-bcf5-6e7b0855f8f8	9dfb9602-1034-43d8-9ebb-ceec19a3da44	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	365	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
73fcc851-b7a8-4509-8541-229ec4a3d9fc	9368afff-c2a2-4921-aeca-c859a455bea0	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	66	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
8f70c212-d69d-4c60-a31c-1611df795d80	97ebe156-4536-4d4a-b96a-a6f962ecd6be	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	422	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
b30f8303-fa37-4088-b192-3db1e67cc396	90980678-0e04-48f7-9293-4f99de6eef8a	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	360	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
681159ea-3790-4a09-a5aa-33a1a41b4e93	db0a55f7-49c8-4b6a-8ff1-43cdeefb9e6e	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	13	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
d53042dc-ad87-4595-a696-db54673d2331	88fbf738-892f-4abf-b7d0-686bf6e7c36f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	78	1.0	2026-06-10 05:43:31	2026-06-10 05:43:31	\N
574e2ba0-e01a-4be2-ac4f-da2afcf5ac51	b8efe3b4-b49a-42a5-97a3-09b79eb52c6f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3826	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
8637eda5-a6d0-4e36-8251-cbcb2e156d80	79bdd86b-ed2a-4cea-819d-1d6d9c9becd4	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	2529	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
dfcf63cb-97d3-46ec-87b0-e83bada679ee	c2489c4c-b3b6-465e-b0d9-ff53ae170872	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	2323	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
0bb47082-a180-4de3-bd43-d75ba99346b6	ebbd1887-1a57-4565-8c49-22c287ce1c05	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	821	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
db038f31-35bd-4b63-9864-71b1aa3620c6	5469ad2e-df05-4dc9-a590-84197eca50ef	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3262	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
d22d80d1-e84d-471c-bcaf-2b9fa54bd7e9	bd2d6ea0-a5b3-4c1c-9f22-0242a3563032	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	4166	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
e47fc5f5-7d5d-4d10-a370-9c2dee5c0244	9362e65f-0f18-47ed-bdeb-b767b4e0cc0d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	899	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
bbfa5df3-fd83-4777-859c-de6f27643e86	86c12fac-e993-4244-b93a-c837055666fa	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3845	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
bc178212-1e32-45c1-bf1f-7ec9404f5412	5f450bf7-cbe4-4ae5-aa05-968deebdc5c3	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3917	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
8e83da6f-5e27-474d-95f6-f0e99c439f9d	32cb0e74-3974-47cd-9463-2b74649d4596	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	3665	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
bd83c348-e9f0-49a3-a1a4-91e69d6a8059	b2ca1a7d-2a7f-4ff0-92aa-d4f82543fda5	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	454	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
6366e13f-6201-4e6c-a8e3-e8c35f5b5937	0186227a-ef99-44a3-b892-27d699632026	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	361	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
39b5817d-e74f-4df0-b973-0327cea67723	a53a5907-f3cf-4e88-a288-c63d0483aaa5	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	85	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
cf6fa762-afcc-4a83-97e3-0bdd095d29c6	23894833-773a-4e04-aeeb-769f32888c7a	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	60	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
a2e9d723-6294-42ee-9ddb-604ae43d884d	a3441812-74fe-4944-94e4-fb1b3a700d97	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	762	1.0	2026-06-10 05:44:04	2026-06-10 05:44:04	\N
8939c0ae-c745-4e5e-8ddb-904312c8dc28	d62a1ea7-6e63-4785-b4af-3e3ef417be26	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1504	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
e72ec3db-84e3-418c-aadd-a3e2be4222ba	44295566-73c5-419d-afcc-e7d802a2712f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	921	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
53a8adaf-e1dc-48fb-8ced-94a5bfc39a21	7fcdbb95-3dc5-467b-b863-413244b724da	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1564	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
e666722b-b673-4160-9147-497dacaa1343	eb0adcda-cdf2-42b9-9d6f-eb14477d66cd	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1111	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
495611f8-395e-4bf2-a4c8-1d7aa4a96278	001a5bd9-5cc7-4fcc-9c9b-b0b83e83f32d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1907	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
40534d25-5bfb-4b75-a49f-85384e538532	361f4959-25eb-4baf-a190-514fc59e259d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	152	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
f73a330d-1fb0-4ec1-be61-9dcd15fc877e	9620c53d-82d5-4bb2-85ba-34206fb1efe6	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	1554	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
9ce20dea-b393-4720-abeb-9f1b22e4cfe7	328a611f-5e8a-42df-9c9f-77f14c2482e4	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	265	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
382595ae-8b60-4dda-85f7-a9c92686e58a	3252db23-44f1-45a5-b335-4e41b4083a47	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	119	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
44407863-3906-44e2-a4f5-19c0783f9afb	57967422-146c-496b-a707-310aecf62618	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	7200	\N	0	168	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
0312e1df-f5da-48e8-bfa1-12851f3098df	ee8bf5fa-b81d-4825-87d1-98d37bddd760	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	9450	\N	0	959	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
145791e1-5da4-4d9e-9c8a-18ccde9d1c76	08a54aa7-c559-41d9-a5b5-351951ec8a2d	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	27600	\N	0	336	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
bb40c967-aa9d-4767-afb3-743240b92796	93a26991-5365-4feb-aa28-00d0cd43958c	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	5400	\N	0	750	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
e367a3c5-cc21-46aa-967a-7832d84857eb	b261aa57-164b-4ac8-95c2-10379b0e1b1e	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	14400	\N	0	1463	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
e8847e60-bd93-4711-a5e2-f77f2b7432e8	243df0f1-48c5-4f47-a82e-a31edbc74204	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	3600	\N	0	145	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
8a202e25-d93b-4316-93ed-429299fd02d7	9a1f3e96-4666-47d6-b8a5-c0407a2d3470	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	6300	\N	0	1168	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
85fa80be-2358-4f27-a704-f15dd1246344	17f98be4-2fdf-4820-9a61-cf1bbbe960c5	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	10800	\N	0	1033	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
08f192ed-70e5-4a39-afdf-a241e0e2426a	a4eedf88-1a90-4b5a-bbd1-222c57b58365	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	7800	\N	0	614	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
8c92c0c8-b22b-43ed-93e9-5ea7a5b7fc36	f15a4c23-8be9-4b64-a830-dcf2adb6cccf	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	18000	\N	0	1499	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
13609dfe-0f7c-41b7-8dd6-7b7e1d5f61ac	db75a3ca-463c-4d98-853e-0c081a35b89d	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	12600	\N	0	552	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
5c6f0bfc-bb0f-4bf4-9c5b-13ca4dc0cc32	a67e45c0-a5df-4aee-980c-0fee294f4584	\N	\N	\N	\N	audio	\N	f	\N	registered	\N	\N	\N	\N	9000	\N	0	275	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
b5997de3-fac5-4c9d-9ff8-0c520e7a9516	21300773-6915-4dbf-aff2-8b6ce615826d	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	5400	\N	0	676	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
9c6fd5a7-c432-4fab-b6b3-193b165c0b51	f931b0cf-ff4e-431c-8a04-a405ea8c6b9e	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	10800	\N	0	966	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
a569775b-c02e-4094-91e5-f60f7e6e2b87	89dcd1a9-21e0-4a39-bddf-80cd3226ee7a	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3600	\N	0	2951	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
e0006f02-ed23-47d6-9037-21ec23bbb146	08bfd860-5f4f-405c-9285-225eada7f89a	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	4800	\N	0	1592	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
38056140-35ec-403e-bdc9-6e46481cd4b8	111c05a0-ef63-4dc9-a0f8-5aafc44a2d04	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	57600	\N	0	193	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
d0c59d98-0626-4974-956a-2867323c68b8	2f23a2a2-c976-422f-a96e-8d372b7290e1	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	2700	\N	0	1421	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
315ce990-a4b8-4770-91ac-149baaf4928d	86f0f670-1d7b-4d73-bb8d-e0a99885eeb0	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	43200	\N	0	1411	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
d52077a9-4da5-4cc2-80aa-1900e402d83b	597b22d1-6808-438a-8f83-678262052615	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	5100	\N	0	2203	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
379b4d6e-f747-425f-831b-0dadecb6b2c7	44e1466f-01c2-4618-9f12-b0af0271285d	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	32400	\N	0	1511	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
df42b633-c78d-4ee4-b754-c77dad0c62ef	dd095f93-e31e-4775-bef5-fc870bca5f72	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3300	\N	0	184	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
71503428-2516-4bf0-af6b-ca4ac0efb92c	7710b171-c98b-4c4f-a55a-a2fd85289c93	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	4200	\N	0	1757	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
69686a73-b3c4-4b53-92f5-2b10ba5eed72	1c2286e1-6a62-4ae0-bb58-61179fe7f162	\N	\N	\N	\N	video	\N	f	\N	registered	\N	\N	\N	\N	3900	\N	0	2282	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
7f2e3036-c9f1-43b5-b3d5-94c0b38e7a62	eb72b35e-727a-4b3d-ae4a-b68d79613a4d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	121	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
c584e305-5d9f-472b-abe1-135a269bc44c	01153b10-4770-49ea-9222-9627f42934ae	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	478	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
55b1a67c-a0d3-4de5-b7f4-75228a4e1295	48fdeb6b-db7d-4703-8ddd-95f87eff37d7	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	201	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
8ce0390e-2adb-4cbf-afcd-c4db673da49d	5a71f0b6-fbc8-4b97-8db1-a342cc143aac	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	458	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
3a1f7982-9f12-4134-8e11-67cb87dc38a5	bc243319-98c1-4ffb-81ea-7c3d69c16e54	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	281	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
0fca4a47-23ea-4670-bff8-6ec7d9b876f4	7018a9ca-5c57-44ac-ac23-3697b7aa5894	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	306	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
741c2379-4579-4e64-8c77-9bc5d53eeb9c	32fce104-1c96-40d4-a891-1256afd55d8f	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	493	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
bee3186b-8714-493e-99b9-e7c16cd454b9	7e8897f1-fe97-4350-9f9f-9879ac9ebcb8	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	64	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
a40e2331-26e1-49a6-b7b6-ac9b5d010d23	fe4f1644-1896-4b89-a4fb-b9259a72ec4e	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	398	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
ce15c483-c617-41ee-855f-371bd5b647ec	379164cf-e255-4b27-9705-2e2fb285b73d	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	298	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
b0b23296-1684-4ae1-8dd3-62edf4be24e9	79fecaa0-3ea1-4059-a217-3e1f626e2287	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	479	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
b3474199-c003-49a9-ad11-a15ee3b95974	7ce2c0d4-7198-44a8-ad19-e422a85a3473	\N	\N	\N	\N	pdf	\N	f	\N	registered	\N	\N	\N	\N	\N	\N	0	257	1.0	2026-06-10 05:44:05	2026-06-10 05:44:05	\N
8f8829b0-7674-4d88-a431-da9ebb43cf5c	ea7efc4e-e5c9-421d-acef-76fe296971d6	\N	\N	\N	\N	mp4	https://www.youtube.com/watch?v=f7lVXETlViI	t	\N	open_access	\N	\N	\N	\N	\N	\N	0	1	1.0	2026-06-12 04:20:26	2026-06-12 04:20:54	\N
\.


--
-- Data for Name: instance_contributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.instance_contributions (id, instance_id, agent_id, agent_name, agent_type, role_code, role_label, relator_uri, is_primary, sort_order, created_at, updated_at) FROM stdin;
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
6ae6048a-af04-4990-a0ae-344cf2674ad5	dddd	\N	\N	\N	closed	58	0	51	0	1be6c56a-cc16-4005-971d-4e2d01068e49	2026-06-11 16:00:23	2026-06-11 16:03:03	2026-06-11 16:00:23	2026-06-11 16:03:03
\.


--
-- Data for Name: label_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.label_templates (id, name, page_size, margin_top_mm, margin_left_mm, columns, rows, label_width_mm, label_height_mm, gap_x_mm, gap_y_mm, background_color, elements, is_default, created_at, updated_at, deleted_at) FROM stdin;
adadeed7-9c59-4a8e-99f5-8add12d9dca7	Default — Avery L7159 — 24/sheet (63.5×33.9)	A4	13.00	7.20	3	8	63.50	33.90	2.50	0.00	#ffffff	[{"h": 6, "w": 40, "x": 2, "y": 1.5, "id": "el_call", "type": "field", "align": "left", "color": "#111827", "field": "call_number", "fontSize": 9, "fontWeight": "bold"}, {"h": 5, "w": 59, "x": 2, "y": 7, "id": "el_title", "type": "field", "align": "left", "color": "#374151", "field": "title", "fontSize": 7, "fontWeight": "normal"}, {"h": 13, "w": 52, "x": 6, "y": 13, "id": "el_barcode", "type": "barcode", "field": "barcode_value", "symbology": "code128"}, {"h": 5, "w": 59, "x": 2, "y": 27, "id": "el_num", "type": "field", "align": "center", "color": "#111827", "field": "barcode_value", "fontSize": 8, "fontWeight": "normal"}]	t	2026-06-10 17:48:35	2026-06-10 17:48:35	\N
\.


--
-- Data for Name: library_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.library_settings (id, key, value, "group", label, description, updated_at) FROM stdin;
7	max_fine_cap	10.00	circulation	Maximum Fine Cap (USD)	\N	2026-06-08 13:53:18
10	overdue_notice_days	3	email	Send due-date reminder N days before	\N	2026-06-08 13:53:18
11	email_footer	Thank you for using our library.	email	Email Footer Text	\N	2026-06-08 13:53:18
15	barcode_prefix	LIB-	\N	\N	\N	2026-06-10 17:49:06
16	barcode_padding	6	\N	\N	\N	2026-06-10 17:49:06
26	require_email_verification	0	\N	\N	\N	2026-06-12 04:22:37
27	notifications_email	\N	\N	\N	\N	2026-06-12 04:22:37
28	send_overdue_notices	1	\N	\N	\N	2026-06-12 04:22:37
29	send_due_reminders	1	\N	\N	\N	2026-06-12 04:22:37
30	reminder_days_before	3	\N	\N	\N	2026-06-12 04:22:37
17	active_template	cambodia-tax	\N	\N	\N	2026-06-12 03:50:20
18	custom_colors	{"primary":"#1B3D8F","secondary":"#2952BE","accent":"#E8971D","success":"#22C55E","warning":"#F59E0B","danger":"#EF4444"}	\N	\N	\N	2026-06-12 03:50:20
19	custom_fonts	{"heading":"Noto Sans","body":"Noto Sans"}	\N	\N	\N	2026-06-12 03:50:20
31	ai_features_enabled	1	\N	\N	\N	2026-06-12 03:55:40
32	ai_chatbot_enabled	1	\N	\N	\N	2026-06-12 03:55:40
33	ai_search_enabled	1	\N	\N	\N	2026-06-12 03:55:40
34	ai_cataloging_enabled	1	\N	\N	\N	2026-06-12 03:55:40
35	ai_monthly_budget	50	\N	\N	\N	2026-06-12 03:55:40
12	logo_url	/storage/branding/zWfgFEVAvG9umJw5z7RRUiCk6tb5DYm8tkDuRfSL.png	branding	Logo URL	\N	2026-06-12 04:12:59
1	library_name	General Department of Tax School	general	Library Name	\N	2026-06-12 04:22:37
20	library_tagline	\N	\N	\N	\N	2026-06-12 04:22:37
2	library_email	\N	general	Library Email	\N	2026-06-12 04:22:37
3	library_phone	\N	general	Library Phone	\N	2026-06-12 04:22:37
4	library_address	\N	general	Library Address	\N	2026-06-12 04:22:37
5	default_language	en	general	Default Language	\N	2026-06-12 04:22:37
6	timezone	Asia/Phnom_Penh	general	Timezone	\N	2026-06-12 04:22:37
14	opac_welcome_text	Welcome to our library catalog.	branding	OPAC Welcome Message	\N	2026-06-12 04:22:37
13	primary_color	#0ea5e9	branding	Primary Brand Color	\N	2026-06-12 04:22:37
21	default_loan_days	14	\N	\N	\N	2026-06-12 04:22:37
22	max_loans_per_patron	5	\N	\N	\N	2026-06-12 04:22:37
23	fine_rate_per_day	0.10	\N	\N	\N	2026-06-12 04:22:37
24	max_fine	10.00	\N	\N	\N	2026-06-12 04:22:37
8	grace_period_days	0	circulation	Grace Period (days before fines)	\N	2026-06-12 04:22:37
9	reservation_expiry	7	circulation	Reservation Expiry (days)	\N	2026-06-12 04:22:37
25	enable_self_registration	1	\N	\N	\N	2026-06-12 04:22:37
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loans (id, patron_id, item_id, checked_out_at, due_date, returned_at, renewed_at, renewals_count, checked_out_by, returned_by, fine_amount, fine_paid, fine_paid_at, fine_waived, fine_waived_by, notes, created_at, updated_at) FROM stdin;
56222650-54c0-4877-9f6a-b81074967aa8	c67fe61c-c6e8-4168-9d8c-b8588099059f	fe2e3a59-4403-4360-b29c-a2414d962cee	2026-06-01 13:53:33	2026-06-15	\N	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-06-01 13:53:33	2026-06-01 13:53:33
83429eb0-795c-4251-862a-30de62584dd1	10c2a961-f915-4cdd-80bd-b299ae9e415c	3a766f7d-9ccd-4faf-b417-0c05c175b5db	2026-05-29 13:53:33	2026-06-12	\N	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-05-29 13:53:33	2026-05-29 13:53:33
b2422d05-a639-438a-8bee-ac3f1334c140	88a17b1a-528f-46c2-862d-2fab7ef8c5fe	715743f4-2bff-4ce9-ab5c-bb8d59d1bd65	2026-06-03 13:53:33	2026-06-17	\N	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-06-03 13:53:33	2026-06-03 13:53:33
be2abd95-0747-4835-8bff-e0ca67e14789	67ad4f91-5697-477e-bc98-82881107b266	b9daff02-1e65-4a09-8d8b-e48d8562f989	2026-05-29 13:53:33	2026-06-12	\N	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-05-29 13:53:33	2026-05-29 13:53:33
933ff8ec-8e46-4bbb-9b01-3ff99958b010	86ee5328-ddd0-4d39-a2e5-17470af6d52a	17dff2e8-c865-49b2-b867-62a221fec4d0	2026-06-06 13:53:33	2026-06-20	\N	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-06-06 13:53:33	2026-06-06 13:53:33
ecf28f94-1432-4b4e-aa1c-535181d59f3f	ebb37d32-83b1-42a1-a480-1174c9b28a03	dcabfc19-a78b-4af3-97e8-2c8cd8ac72c1	2026-05-16 13:53:33	2026-05-30	\N	\N	0	\N	\N	0.90	f	\N	f	\N	\N	2026-05-16 13:53:33	2026-06-08 13:53:33
fde86655-404c-478c-b9a9-24b870f3ec55	fd715919-25f8-4955-82f4-add1081eae28	c692fa82-c1ea-405b-b8a6-345c9780c4a0	2026-05-15 13:53:33	2026-05-29	\N	\N	0	\N	\N	1.00	f	\N	f	\N	\N	2026-05-15 13:53:33	2026-06-08 13:53:33
c6b8db8b-6a58-4fe9-b53d-d8fb30d279c2	c67fe61c-c6e8-4168-9d8c-b8588099059f	df18b742-0b21-4f19-8a01-95677ee0e69d	2026-04-22 13:53:33	2026-05-06	2026-05-05 13:53:33	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-04-22 13:53:33	2026-05-05 13:53:33
7e4b3e59-c2a4-4afe-9879-989975efe649	10c2a961-f915-4cdd-80bd-b299ae9e415c	7262f850-0838-4646-9075-917315d62eae	2026-04-13 13:53:33	2026-04-27	2026-04-25 13:53:33	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-04-13 13:53:33	2026-04-25 13:53:33
2b32bb47-b8b9-4bfa-8622-4ea33bf68c16	02426220-2a20-4948-ba97-4df2172ab337	097c7a47-3523-4555-a433-d519059eacb2	2026-04-21 13:53:33	2026-05-05	2026-04-30 13:53:33	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-04-21 13:53:33	2026-04-30 13:53:33
6210c2d0-754c-4421-8fbc-9744bb7379bb	53a2cebd-28dd-44bf-91cd-040e8793680e	1118ff24-74a8-4f05-8e7e-f35b450fb3b3	2026-05-02 13:53:33	2026-05-16	2026-05-14 13:53:33	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-05-02 13:53:33	2026-05-14 13:53:33
bf83e416-2d70-4d72-a722-02f109d76c23	fe2f82e0-982d-4c37-bf61-1341f1fda88b	5a5aa49a-c02a-411c-ab11-4c3dab4597ae	2026-03-31 13:53:33	2026-04-14	2026-04-05 13:53:33	\N	0	\N	\N	0.00	f	\N	f	\N	\N	2026-03-31 13:53:33	2026-04-05 13:53:33
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, parent_id, name, name_km, code, address, is_branch, is_active, created_at, updated_at) FROM stdin;
1	\N	Main Library	បណ្ណាល័យកណ្តាល	MAIN	\N	t	t	2026-06-08 13:53:25	2026-06-08 13:53:25
2	1	Ground Floor	ជាន់ទី១	GF	\N	f	t	2026-06-08 13:53:25	2026-06-08 13:53:25
3	1	First Floor	ជាន់ទី២	FF	\N	f	t	2026-06-08 13:53:25	2026-06-08 13:53:25
4	1	Reference Room	បន្ទប់យោងក	REF	\N	f	t	2026-06-08 13:53:25	2026-06-08 13:53:25
5	\N	Branch — Toul Kork	សាខា — ទួលគោក	TK	\N	t	t	2026-06-08 13:53:25	2026-06-08 13:53:25
\.


--
-- Data for Name: material_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.material_types (id, code, name, name_km, icon, has_physical, has_digital, is_active, sort_order, created_at, updated_at) FROM stdin;
3	book_ebook	Book + eBook	សៀវភៅ + eBook	layers	t	t	t	3	2026-06-08 13:53:18	2026-06-08 13:53:18
4	journal	Journal / Serial	ទស្សនាវដ្ដី	newspaper	t	t	t	4	2026-06-08 13:53:18	2026-06-08 13:53:18
5	article	Article	អត្ថបទ	file-text	f	t	t	5	2026-06-08 13:53:18	2026-06-08 13:53:18
9	map	Map	ផែនទី	map	t	t	t	9	2026-06-08 13:53:18	2026-06-08 13:53:18
10	dataset	Dataset	ទិន្នន័យ	database	f	t	t	10	2026-06-08 13:53:18	2026-06-08 13:53:18
11	dvd	DVD / CD	DVD / CD	disc	t	f	t	11	2026-06-08 13:53:18	2026-06-08 13:53:18
12	magazine	Magazine	ទស្សនាវដ្ដី	book	t	t	t	12	2026-06-08 13:53:18	2026-06-08 13:53:18
1	book	Book	សៀវភៅ	book-open	t	f	t	1	2026-06-10 05:44:04	2026-06-10 05:44:04
2	ebook	eBook	សៀវភៅអេឡិចត្រូនិក	file-text	f	t	t	2	2026-06-10 05:44:04	2026-06-10 05:44:04
13	epub	ePublication	ការបោះពុម្ពអេឡិចត្រូនិក	\N	f	t	t	3	2026-06-10 05:44:04	2026-06-10 05:44:04
7	audio	Audio	សម្លេង	headphones	f	t	t	4	2026-06-10 05:44:04	2026-06-10 05:44:04
8	video	Video	វីដេអូ	film	f	t	t	5	2026-06-10 05:44:04	2026-06-10 05:44:04
6	thesis	Thesis	និក្ខេបបទ	graduation-cap	t	t	t	6	2026-06-10 05:44:04	2026-06-10 05:44:04
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2026_01_02_000000_create_permission_tables	1
2	2026_01_02_000001_create_material_types_table	1
3	2026_01_02_000002_create_bibliographic_records_table	1
4	2026_01_02_000003_create_locations_collections_table	1
5	2026_01_02_000004_create_physical_items_table	1
6	2026_01_02_000005_create_digital_resources_table	1
7	2026_01_02_000006_create_patrons_table	1
8	2026_01_02_000007_create_circulation_tables	1
9	2026_01_02_000008_create_acquisitions_serials_tables	1
10	2026_01_02_000009_create_digital_access_logs_table	1
11	2026_01_02_000010_create_staff_users_table	1
12	2026_05_31_000001_add_deleted_by_to_bibliographic_records	1
13	2026_05_31_000002_add_bibframe_fields_to_bibliographic_records	1
14	2026_05_31_000003_create_works_table	1
15	2026_05_31_000004_create_agents_table	1
16	2026_05_31_000005_create_work_contributions_table	1
17	2026_05_31_000007_add_serial_fields	1
18	2026_05_31_000010_add_fulltext_search_trigger	1
19	2026_06_07_000001_create_ai_suggestions_table	1
20	2026_06_07_000002_create_ai_usage_logs_table	1
21	2026_06_07_000003_add_ai_fields_to_bibliographic_records	1
22	2026_06_08_000001_add_vector_search_support	1
23	2026_06_10_000001_create_card_templates_table	2
24	2026_06_11_000001_create_label_templates_table	3
25	2026_06_11_000002_create_activity_log_table	4
26	2026_06_11_000003_add_provider_to_ai_usage_logs	5
27	2026_06_11_073650_add_photo_to_patrons_table	6
28	2026_06_11_000010_create_inventory_tables	7
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
1	App\\Models\\Tenant\\User	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0
2	App\\Models\\Tenant\\User	2392aec3-31de-4980-9f32-0d6d1ca5e501
3	App\\Models\\Tenant\\User	4f9da13e-574e-43c6-83df-4dc6b84e78f6
4	App\\Models\\Tenant\\User	f2283006-0b45-480e-98cb-db297eec7301
5	App\\Models\\Tenant\\User	b56d9693-a177-4124-9f4e-7b46e0de8549
2	App\\Models\\Tenant\\User	7e32cd8c-835b-4f14-ba8b-bafef41e844b
3	App\\Models\\Tenant\\User	0615f9ac-f694-4f3e-bc48-0534655a57bd
4	App\\Models\\Tenant\\User	e2e123f7-a438-4b0e-9fec-ed4d5c394a80
2	App\\Models\\Tenant\\User	1be6c56a-cc16-4005-971d-4e2d01068e49
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
1	Student	និស្សិត	5	14	2	3	0.10	10.00	t	2026-06-08 13:53:18	2026-06-08 13:53:18
2	Faculty	គ្រូ / សាស្ត្រាចារ្យ	10	30	3	5	0.10	10.00	t	2026-06-08 13:53:18	2026-06-08 13:53:18
3	Staff	បុគ្គលិក	7	21	2	3	0.10	10.00	t	2026-06-08 13:53:18	2026-06-08 13:53:18
4	Public	សាធារណៈ	3	7	1	2	0.15	5.00	t	2026-06-08 13:53:18	2026-06-08 13:53:18
5	VIP	VIP	15	30	5	10	0.00	0.00	t	2026-06-08 13:53:18	2026-06-08 13:53:18
\.


--
-- Data for Name: patrons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patrons (id, patron_number, email, password, email_verified_at, first_name, last_name, first_name_km, last_name_km, gender, date_of_birth, phone, address, city, country, patron_category_id, status, membership_expiry, preferred_language, total_checkouts, active_loans, notes, remember_token, created_at, updated_at, deleted_at, photo_url) FROM stdin;
02426220-2a20-4948-ba97-4df2172ab337	P-2024-008	makara.tep@faculty.edu.kh	$2y$12$rAVry3TEptHJOM1z2mGXRu6w2aU1X.VQnXbCl3wXcDzadfgoZzTui	2026-06-08 13:53:32	Makara	Tep	មករា	តែប	male	\N	+855 11 222 333	\N	Phnom Penh	KHM	2	active	2027-12-31	en	1	0	\N	\N	2026-06-08 13:53:32	2026-06-08 13:53:32	\N	\N
53a2cebd-28dd-44bf-91cd-040e8793680e	P-2024-009	pisey.mao@gmail.com	$2y$12$okuF3V31RbE0NPD.8x69FuZ8DrbnZe8BeD6hVl67lvKdEWIyegekW	2026-06-08 13:53:32	Pisey	Mao	ពិសី	មៅ	female	\N	+855 70 111 222	\N	Siem Reap	KHM	4	active	2025-12-31	en	1	0	\N	\N	2026-06-08 13:53:32	2026-06-08 13:53:32	\N	\N
fe2f82e0-982d-4c37-bf61-1341f1fda88b	P-2024-010	rith.noun@student.edu.kh	$2y$12$4IlwnJS9RQqCd4hksM2SnenWHK.O20POhdkAhxqdfoK6pHADWmkbG	2026-06-08 13:53:33	Rith	Noun	រិទ្ធ	នួន	male	\N	+855 85 333 444	\N	Phnom Penh	KHM	1	active	2026-12-31	en	1	0	\N	\N	2026-06-08 13:53:33	2026-06-08 13:53:33	\N	\N
88a17b1a-528f-46c2-862d-2fab7ef8c5fe	P-2024-003	ratana.chan@university.edu.kh	$2y$12$YUiCa3n4UsE61qqP8ZuvsO1E/WNfdeM4uc.uGPewcSMra21jhMzRK	2026-06-08 13:53:27	Ratana	Chan	រតនា	ចាន់	female	\N	+855 96 123 456	\N	Siem Reap	KHM	1	active	2025-12-31	en	1	1	\N	\N	2026-06-08 13:53:27	2026-06-08 13:53:27	\N	\N
67ad4f91-5697-477e-bc98-82881107b266	P-2024-006	bunna.heng@student.edu.kh	$2y$12$K3ev0O3R6CMedoc7svOcYOHqlanYc2MMRbsUqYxR8GThvVWU5X49q	2026-06-08 13:53:30	Bunna	Heng	បុណ្ណា	ហេង	male	\N	+855 23 456 789	\N	Phnom Penh	KHM	1	active	2026-12-31	en	1	1	\N	\N	2026-06-08 13:53:30	2026-06-08 13:53:30	\N	\N
86ee5328-ddd0-4d39-a2e5-17470af6d52a	P-2024-007	sreymom.oun@university.edu	$2y$12$/4jPnyuGjhzFKnkThzhNDuuuufMdsQ0P0Stt9yyB71DB565TTv8wm	2026-06-08 13:53:31	Sreymom	Oun	ស្រីមុំ	អ៊ូន	female	\N	+855 99 876 543	\N	Kampong Cham	KHM	1	active	2026-12-31	en	1	1	\N	\N	2026-06-08 13:53:31	2026-06-08 13:53:31	\N	\N
ebb37d32-83b1-42a1-a480-1174c9b28a03	P-2024-004	virak.sok@library.org	$2y$12$UYn1HuZcqhhIXk5gdpWHh.xjAjuGpK.O6Y8/eTmyc2OWvsfkPz1AW	2026-06-08 13:53:28	Virak	Sok	វីរៈ	សុខ	male	\N	+855 78 901 234	\N	Phnom Penh	KHM	3	active	2026-08-31	en	1	1	\N	\N	2026-06-08 13:53:28	2026-06-08 13:53:28	\N	\N
c67fe61c-c6e8-4168-9d8c-b8588099059f	P-2024-001	sophea.kim@university.edu.kh	$2y$12$g8QR4o.pEPTGdOpxIqiaDugHvwGSaW/mFwpHRGo9q5kdhMZqC/BIC	2026-06-08 13:53:26	Sophea	Kim	សុភា	គីម	female	\N	+855 12 345 678	\N	Phnom Penh	KHM	1	active	2026-12-31	en	4	1	\N	\N	2026-06-08 13:53:26	2026-06-11 00:09:02	\N	\N
fd715919-25f8-4955-82f4-add1081eae28	P-2024-005	channary.lim@gmail.com	$2y$12$8XvDsmaeh0VcMUxcEtorJu4fnty9IX4Mtw.QlTWHYZhQNRWtxBYLi	2026-06-08 13:53:29	Channary	Lim	ចន្ទនារ	លីម	female	\N	+855 15 678 901	\N	Battambang	KHM	4	active	2025-06-30	en	1	1	\N	\N	2026-06-08 13:53:29	2026-06-08 13:53:29	\N	\N
10c2a961-f915-4cdd-80bd-b299ae9e415c	P-2024-002	dara.prak@university.edu.kh	$2y$12$GbIbzzJbr1WDbVYLOCMrRumGO2dGxpZR4ogsyK7JLY3T.I8ahxTeS	2026-06-08 13:53:26	Dara	Prak	ដារា	ប្រាក់	male	\N	+855 17 234 567	\N	Phnom Penh	KHM	2	active	2027-06-30	en	2	1	\N	\N	2026-06-08 13:53:26	2026-06-08 13:53:26	\N	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, name, guard_name, created_at, updated_at) FROM stdin;
1	catalog.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
2	catalog.create	web	2026-06-08 13:53:18	2026-06-08 13:53:18
3	catalog.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
4	catalog.delete	web	2026-06-08 13:53:18	2026-06-08 13:53:18
5	catalog.import	web	2026-06-08 13:53:18	2026-06-08 13:53:18
6	catalog.export	web	2026-06-08 13:53:18	2026-06-08 13:53:18
7	circulation.checkout	web	2026-06-08 13:53:18	2026-06-08 13:53:18
8	circulation.checkin	web	2026-06-08 13:53:18	2026-06-08 13:53:18
9	circulation.renew	web	2026-06-08 13:53:18	2026-06-08 13:53:18
10	circulation.view_loans	web	2026-06-08 13:53:18	2026-06-08 13:53:18
11	circulation.manage_fines	web	2026-06-08 13:53:18	2026-06-08 13:53:18
12	patrons.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
13	patrons.create	web	2026-06-08 13:53:18	2026-06-08 13:53:18
14	patrons.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
15	patrons.delete	web	2026-06-08 13:53:18	2026-06-08 13:53:18
16	digital.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
17	digital.create	web	2026-06-08 13:53:18	2026-06-08 13:53:18
18	digital.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
19	digital.delete	web	2026-06-08 13:53:18	2026-06-08 13:53:18
20	reports.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
21	reports.export	web	2026-06-08 13:53:18	2026-06-08 13:53:18
22	settings.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
23	settings.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
24	acquisitions.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
25	acquisitions.create	web	2026-06-08 13:53:18	2026-06-08 13:53:18
26	acquisitions.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
27	acquisitions.delete	web	2026-06-08 13:53:18	2026-06-08 13:53:18
28	serials.view	web	2026-06-08 13:53:18	2026-06-08 13:53:18
29	serials.create	web	2026-06-08 13:53:18	2026-06-08 13:53:18
30	serials.edit	web	2026-06-08 13:53:18	2026-06-08 13:53:18
31	serials.delete	web	2026-06-08 13:53:18	2026-06-08 13:53:18
\.


--
-- Data for Name: physical_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.physical_items (id, biblio_id, barcode, accession_number, call_number, collection_id, location_id, shelf, item_status, condition, price, currency, acquired_date, supplier, purchase_order, notes, created_at, updated_at, deleted_at, last_seen_at) FROM stdin;
fe2e3a59-4403-4360-b29c-a2414d962cee	a7891701-d3ec-4093-9187-f734ce4bfed0	BK0001	ACC-2024-001	005.133 MAR	1	2	\N	checked_out	good	45.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
3a766f7d-9ccd-4faf-b417-0c05c175b5db	0e119795-0761-4bbe-8ebf-82790e17e2a4	BK0002	ACC-2024-002	005.1 THO	1	2	\N	checked_out	good	50.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
715743f4-2bff-4ce9-ab5c-bb8d59d1bd65	7460ddba-e374-4298-a7a3-b479c27e8fe4	BK0004	ACC-2024-004	005.1 COR	1	3	\N	checked_out	good	90.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
b9daff02-1e65-4a09-8d8b-e48d8562f989	9c69fa5a-1a23-4f9a-8a1e-bf3ebe08b1e0	BK0005B	ACC-2024-B05	005.276 STA	1	2	\N	checked_out	excellent	60.00	USD	2024-06-01	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
17dff2e8-c865-49b2-b867-62a221fec4d0	72bb8b21-c803-4a20-afd1-d10ce79e047c	BK0006	ACC-2024-006	005.276 CRO	1	2	\N	checked_out	good	35.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
dcabfc19-a78b-4af3-97e8-2c8cd8ac72c1	7460ddba-e374-4298-a7a3-b479c27e8fe4	BK0004B	ACC-2024-B04	005.1 COR	1	3	\N	checked_out	excellent	90.00	USD	2024-06-01	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
c692fa82-c1ea-405b-b8a6-345c9780c4a0	5fb0e8c6-6089-4de9-8f66-f5a571a19287	BK0007	ACC-2024-007	355.02 SUN	1	2	\N	checked_out	good	12.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N	\N
25c734df-9022-40e5-8643-b2e07d067c27	48fdeb6b-db7d-4703-8ddd-95f87eff37d7	TH-XIUDYA	THES-2023-4936	307.76 PIS	5	\N	\N	available	excellent	\N	USD	2025-04-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 09:20:53	2026-06-11 09:20:53	\N
097c7a47-3523-4555-a433-d519059eacb2	9c69fa5a-1a23-4f9a-8a1e-bf3ebe08b1e0	BK0005	ACC-2024-005	005.276 STA	1	2	\N	missing	good	60.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
1118ff24-74a8-4f05-8e7e-f35b450fb3b3	57a63df8-328d-4d58-b120-164d15d14541	BK0008	ACC-2024-008	153.4 KAH	1	3	\N	missing	good	18.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
5a5aa49a-c02a-411c-ab11-4c3dab4597ae	a619ccea-d8f1-4f3b-b5b4-47c958b75017	BK0009	ACC-2024-009	909 HAR	1	3	\N	missing	good	20.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
b9b85d2d-6f7c-46d7-a1f9-53217332360e	a619ccea-d8f1-4f3b-b5b4-47c958b75017	BK0009B	ACC-2024-B09	909 HAR	1	3	\N	missing	excellent	20.00	USD	2024-06-01	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
e2ea6a59-4531-4a43-ad60-42a07208382e	31e35699-6d26-413b-bb21-1e2d3ac888a2	BK0010	ACC-2024-010	158.1 CLE	1	2	\N	missing	good	22.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
56fb3b3b-7f9d-4822-bf8d-c6b94dce3432	31e35699-6d26-413b-bb21-1e2d3ac888a2	BK0010B	ACC-2024-B10	158.1 CLE	1	2	\N	missing	excellent	22.00	USD	2024-06-01	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
595dc58d-272d-442c-927c-0509af703f37	b27f9424-f52c-453b-9f90-70bffbe572a6	BK0011	ACC-2024-011	813.52 FIT	1	3	\N	missing	good	15.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
c4a967f5-acf6-4920-820b-b646feff1188	f6099df4-21be-449b-88b1-a47b2d4d39fa	BK0012	ACC-2024-012	371.33 CHA	5	3	\N	missing	good	30.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
e68eef6b-4e76-46a2-b563-7336a1e28c2d	e7c0445b-edcf-42ad-acbd-21210cfa551a	TH-JDA11J	THES-2022-1850	332.7 RAT	5	\N	\N	missing	excellent	\N	USD	2025-07-10	\N	\N	\N	2026-06-10 05:32:12	2026-06-11 16:03:03	\N	\N
59549c3c-671d-4400-a24b-582931bc9812	fd6cd00e-2e3f-4e39-83ee-6707e3276431	TH-VHUYTP	THES-2023-3687	418.0078 BUN	5	\N	\N	missing	excellent	\N	USD	2025-01-10	\N	\N	\N	2026-06-10 05:32:12	2026-06-11 16:03:03	\N	\N
da2cbc5c-f5fc-40d5-ad54-f865c6334714	9a205de1-3003-40e3-9451-c768c14dae08	BK-0001	ACC-1994-001	005.117 ERI	1	\N	\N	missing	good	55.00	USD	2025-07-10	\N	\N	\N	2026-06-10 05:32:12	2026-06-11 16:03:03	\N	\N
940a309a-d320-4070-b15d-36882a09d341	f9631283-af0f-4667-967e-1e111437f085	BK-0002	ACC-2022-002	005.1 THO	1	\N	\N	missing	good	90.00	USD	2025-08-10	\N	\N	\N	2026-06-10 05:32:13	2026-06-11 16:03:03	\N	\N
e39a93cd-2c1d-423a-987a-fc29924c8cc3	8420c0bf-4435-4e63-a3e9-490b40d44295	TH-3UFMBH	THES-2022-5540	332.7 RAT	5	\N	\N	missing	excellent	\N	USD	2025-09-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
d719edb9-6ab0-4f7c-8fa4-8136204e1a7e	19a2147e-51c8-4cb3-bb62-c4000b4ca5e0	TH-LUTTPG	THES-2023-4703	418.0078 BUN	5	\N	\N	missing	excellent	\N	USD	2026-01-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
39003bfb-9813-4147-bd7f-af895f6a92ff	0ae5cbee-51d9-4be9-8317-916211794209	TH-EBHLWL	THES-2023-5235	307.76 PIS	5	\N	\N	missing	excellent	\N	USD	2025-11-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
b8e98ba9-6c3e-436e-af6a-2df0d44830f7	e39e2a2b-364d-470b-8e83-23bb58139f55	TH-DFVNSV	THES-2022-1069	338.642 MAK	5	\N	\N	missing	excellent	\N	USD	2025-11-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
02fbe567-4ed9-420b-90c3-8ca416940176	e0a8d49f-9dd4-4803-980b-ded023d3c9aa	TH-DXNMR8	THES-2022-4696	551.48 SOT	5	\N	\N	missing	excellent	\N	USD	2025-08-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
6180be2e-fa8c-42f1-b2bf-4e94aa9e948a	8fea5618-1aba-4719-bf4a-2d082fe07908	TH-ZNIIWY	THES-2023-3822	305.43 CHA	5	\N	\N	missing	excellent	\N	USD	2026-01-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
6304a709-7e52-468a-9046-83c5f1446827	9dfb9602-1034-43d8-9ebb-ceec19a3da44	TH-CKONMC	THES-2021-8278	351 DAR	5	\N	\N	missing	excellent	\N	USD	2025-07-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
58814576-6399-4932-a04b-3b880d803787	9368afff-c2a2-4921-aeca-c859a455bea0	TH-MAQ7YC	THES-2021-7013	631.45 VIC	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
ccdf0ce8-1bed-445a-b0f3-7ca045a3839b	97ebe156-4536-4d4a-b96a-a6f962ecd6be	TH-LRTMUD	THES-2022-4079	363.69 SRE	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
d6c38326-304a-4960-8092-f189bab65f3e	90980678-0e04-48f7-9293-4f99de6eef8a	TH-2NYTJZ	THES-2023-4191	332.1 LYD	5	\N	\N	missing	excellent	\N	USD	2024-12-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
01a469b5-5c0d-4b33-a04b-319a0f771d19	db0a55f7-49c8-4b6a-8ff1-43cdeefb9e6e	TH-AH9ZDU	THES-2022-7464	338.47 KOS	5	\N	\N	missing	excellent	\N	USD	2025-09-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
c328a7da-4946-4591-909c-addd41e71a59	88fbf738-892f-4abf-b7d0-686bf6e7c36f	TH-1WXYWL	THES-2023-8978	333.79 SOP	5	\N	\N	missing	excellent	\N	USD	2025-12-10	\N	\N	\N	2026-06-10 05:43:31	2026-06-11 16:03:03	\N	\N
083034c3-2d56-43d2-ac5a-7425dc132cfb	eb72b35e-727a-4b3d-ae4a-b68d79613a4d	TH-IZS3NL	THES-2022-9649	332.7 RAT	5	\N	\N	missing	excellent	\N	USD	2026-03-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
bd8d4c13-7ca8-43ed-9762-09a76a0a0466	01153b10-4770-49ea-9222-9627f42934ae	TH-0WM6PF	THES-2023-9115	418.0078 BUN	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
57b7c9aa-a67d-4cf6-b068-3dd378ae43f6	5a71f0b6-fbc8-4b97-8db1-a342cc143aac	TH-JINQCJ	THES-2022-6603	338.642 MAK	5	\N	\N	missing	excellent	\N	USD	2025-07-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
dd5f5e63-92a4-44f9-960e-5cbbea1e3907	bc243319-98c1-4ffb-81ea-7c3d69c16e54	TH-MWIRRS	THES-2022-6593	551.48 SOT	5	\N	\N	missing	excellent	\N	USD	2025-12-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
3dc672e7-e700-43cc-a91c-bab4d5de1d30	7018a9ca-5c57-44ac-ac23-3697b7aa5894	TH-FKH7AC	THES-2023-1847	305.43 CHA	5	\N	\N	missing	excellent	\N	USD	2025-03-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
3eadce4f-67ef-42e4-81d2-af77aabf27bf	32fce104-1c96-40d4-a891-1256afd55d8f	TH-VV2AWA	THES-2021-2560	351 DAR	5	\N	\N	missing	excellent	\N	USD	2025-09-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
2f6f5ad8-bfcd-48c8-b601-d88bba6c6ed9	7e8897f1-fe97-4350-9f9f-9879ac9ebcb8	TH-NZ074B	THES-2021-6857	631.45 VIC	5	\N	\N	missing	excellent	\N	USD	2026-01-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
df18b742-0b21-4f19-8a01-95677ee0e69d	a7891701-d3ec-4093-9187-f734ce4bfed0	BK0001B	ACC-2024-B01	005.133 MAR	1	2	\N	missing	excellent	45.00	USD	2024-06-01	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
7262f850-0838-4646-9075-917315d62eae	68b81613-71a8-487e-a8a9-e16dacb43888	BK0003	ACC-2024-003	005.117 GAM	1	2	\N	missing	good	55.00	USD	2024-01-15	\N	\N	\N	2026-06-08 13:53:25	2026-06-11 16:03:03	\N	\N
1b3d0d56-7448-4b9f-88c5-46c011d0ea86	fe4f1644-1896-4b89-a4fb-b9259a72ec4e	TH-THW3Z1	THES-2022-6369	363.69 SRE	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
213af384-9e43-4dc6-bcf5-b6d6d042c654	379164cf-e255-4b27-9705-2e2fb285b73d	TH-OOZ8UR	THES-2023-5912	332.1 LYD	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
eb661e39-5998-4fff-b30f-203bf1c9faca	79fecaa0-3ea1-4059-a217-3e1f626e2287	TH-99YIMP	THES-2022-3026	338.47 KOS	5	\N	\N	missing	excellent	\N	USD	2026-02-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
d17c2bc3-4b5e-4975-8e96-cc1e223c378e	7ce2c0d4-7198-44a8-ad19-e422a85a3473	TH-1B43EP	THES-2023-9779	333.79 SOP	5	\N	\N	missing	excellent	\N	USD	2025-10-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
c9a2f33a-38a9-48ba-b12a-33835dcb4318	934f1859-d549-41a7-a0ae-f63e8cab50e1	BK-LJDPIJ	ACC-1994-UYDM	005.117 ERI	1	\N	\N	missing	good	55.00	USD	2025-10-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
301d6fda-3289-40a9-93c3-61ac54752700	602eb942-3b03-4187-87ab-7e779dbcf7a4	BK-JE2GTV	ACC-2022-R87P	005.1 THO	1	\N	\N	missing	good	90.00	USD	2025-05-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
23bf177b-7ff6-47f1-9118-eb7b065da597	bcf934c0-bdc7-47bb-8845-da5fbe7fb592	BK-AYRCEF	ACC-2007-EJXE	355.02 SUN	1	\N	\N	missing	good	12.00	USD	2024-08-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
f8afb2e0-ef0a-4d81-bdef-8906e0b431fa	446c35b2-6743-4cfe-b8f9-5d73171d1128	BK-1QLS22	ACC-1968-NSW8	495.932 JUD	1	\N	\N	missing	good	40.00	USD	2026-03-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
742867b5-2fce-41f0-8690-c8107854e785	96385e93-452a-45b0-a1a9-68d2e664ca3c	BK-MT5QO1	ACC-2004-1L3P	813.52 F.	1	\N	\N	missing	good	15.00	USD	2025-01-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
7fcdd995-d765-4a5e-96e9-26fb1906c1cf	171652e6-8e30-4b44-bc69-b8a187aad580	BK-AHTGSX	ACC-2020-I9SS	330 N.	1	\N	\N	missing	good	75.00	USD	2025-09-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
cb43ca49-0fd5-4983-a124-cec5b07389a0	ea7efc4e-e5c9-421d-acef-76fe296971d6	BK-2QWTHN	ACC-2008-QSWF	959.6 DAV	1	\N	\N	missing	good	35.00	USD	2026-04-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
e42c17cf-9423-4436-940b-daa9db3015e7	f176a38a-b063-4eb3-9169-742505f6dadd	BK-RZDYPV	ACC-2022-TT6R	571.6 BRU	1	\N	\N	missing	good	120.00	USD	2025-02-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
8969cd35-7a7c-473c-97cc-6e45a780146b	08277d0c-42aa-43ea-a417-aba64d6e8034	BK-CTI1X5	ACC-2016-XPPG	658.4 CLA	1	\N	\N	missing	good	28.00	USD	2026-04-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
9658e20f-fb1c-4800-9d6a-255581718374	2c6c548b-2622-4601-8f4d-e459721d9a4d	BK-XK1HGN	ACC-2021-DJVG	363.7 DAN	1	\N	\N	missing	good	85.00	USD	2025-09-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
aa956a15-312b-4237-9a24-b1a27eb6c227	7dfd31dc-4e86-42c2-a47d-260c5fd4d96b	BK-CN5VU4	ACC-2016-ZFLQ	005.74 RAM	1	\N	\N	missing	good	95.00	USD	2026-02-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
f2ba6476-84ad-4d53-9e8f-2fe2af356cd4	7c6fb597-ac60-4c0e-ac5e-e0a2205051af	BK-ZMDEQ8	ACC-2020-TDEE	330.9596 TOS	1	\N	\N	missing	good	25.00	USD	2025-01-10	\N	\N	\N	2026-06-10 05:44:05	2026-06-11 16:03:03	\N	\N
ff859787-792c-489b-8a94-f635e5231426	af345410-b59a-428a-bf34-c948b3be6386	LIB-000001	\N	\N	\N	\N	\N	missing	good	\N	USD	\N	\N	\N	\N	2026-06-10 19:04:30	2026-06-11 16:03:03	\N	\N
3ddb786a-00de-4da2-8a90-10f26ae5b358	d85e1270-66b6-42fd-a1ea-e80c99e2db8a	LIB-000002	\N	\N	\N	\N	\N	missing	good	\N	USD	\N	\N	\N	\N	2026-06-10 19:18:15	2026-06-11 16:03:03	\N	\N
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, patron_id, biblio_id, item_id, status, reserved_at, expiry_date, notified_at, notes, created_at, updated_at) FROM stdin;
ab908382-db8a-46d2-8a45-57aba36b39ac	ebb37d32-83b1-42a1-a480-1174c9b28a03	0e119795-0761-4bbe-8ebf-82790e17e2a4	\N	pending	2026-06-05 13:53:33	2026-06-15	\N	\N	2026-06-08 13:53:33	2026-06-08 13:53:33
6f17a688-f13a-4a11-9162-53f99688fb3e	fd715919-25f8-4955-82f4-add1081eae28	7460ddba-e374-4298-a7a3-b479c27e8fe4	\N	pending	2026-06-06 13:53:33	2026-06-15	\N	\N	2026-06-08 13:53:33	2026-06-08 13:53:33
8a136c21-42dc-40a6-9065-242d5c0c9720	86ee5328-ddd0-4d39-a2e5-17470af6d52a	a7891701-d3ec-4093-9187-f734ce4bfed0	\N	ready	2026-06-04 13:53:33	2026-06-15	2026-06-10 23:14:48	\N	2026-06-08 13:53:33	2026-06-10 23:14:48
\.


--
-- Data for Name: role_has_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_has_permissions (permission_id, role_id) FROM stdin;
1	1
2	1
3	1
4	1
5	1
6	1
7	1
8	1
9	1
10	1
11	1
12	1
13	1
14	1
15	1
16	1
17	1
18	1
19	1
20	1
21	1
22	1
23	1
24	1
25	1
26	1
27	1
28	1
29	1
30	1
31	1
1	2
2	2
3	2
4	2
5	2
6	2
7	2
8	2
9	2
10	2
11	2
12	2
13	2
14	2
15	2
16	2
17	2
18	2
19	2
20	2
21	2
22	2
23	2
24	2
25	2
26	2
27	2
28	2
29	2
30	2
31	2
1	3
2	3
3	3
4	3
5	3
6	3
16	3
17	3
18	3
19	3
20	3
24	3
28	3
1	4
7	4
8	4
9	4
10	4
11	4
12	4
13	4
14	4
20	4
1	5
10	5
12	5
13	5
14	5
16	5
20	5
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, guard_name, description, created_at, updated_at) FROM stdin;
1	super_admin	web	Super Administrator - Full system access	2026-06-08 13:53:18	2026-06-08 13:53:18
2	library_admin	web	Library Administrator - Manage library settings	2026-06-08 13:53:18	2026-06-08 13:53:18
3	cataloger	web	Cataloger - Manage bibliographic records	2026-06-08 13:53:18	2026-06-08 13:53:18
4	circulation_staff	web	Circulation Staff - Checkout/return operations	2026-06-08 13:53:18	2026-06-08 13:53:18
5	reader_services	web	Reader Services - Patron assistance	2026-06-08 13:53:18	2026-06-08 13:53:18
\.


--
-- Data for Name: serial_issues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serial_issues (id, serial_id, volume, issue_number, publication_date, received_date, item_id, status, created_at, updated_at, expected_date, notes, claimed_at) FROM stdin;
52713698-6414-4cac-aaa4-65241d12db02	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	1	2026-06-12	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-06-12	\N	\N
e7bb851b-d6a7-4c41-922b-b1af85bdaf74	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	2	2026-06-26	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-06-26	\N	\N
84f2e7a7-efb2-4a5e-ae6a-15ce7e76bb9d	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	3	2026-07-10	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-07-10	\N	\N
8e3c9f78-0313-4afb-9ab5-f3ba1ace0386	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	4	2026-07-24	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-07-24	\N	\N
aff847ea-01a7-4147-9a47-e8e0c9f45ac5	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	5	2026-08-07	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-08-07	\N	\N
d4297468-c089-47d6-a8b9-d1c6fee2606e	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	6	2026-08-21	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-08-21	\N	\N
07705759-edbc-45d0-bd9b-ec8bdb411a3d	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	7	2026-09-04	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-09-04	\N	\N
9882ca79-2b13-4486-98cd-bd05c180b0f0	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	8	2026-09-18	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-09-18	\N	\N
49a944c9-9817-40c4-9bcb-6f79cc4ae98b	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	9	2026-10-02	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-10-02	\N	\N
00806616-84de-4cc5-834b-22ad49427540	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	10	2026-10-16	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-10-16	\N	\N
6f461309-083d-4b20-9805-86a7fc91a693	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	11	2026-10-30	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-10-30	\N	\N
d209045b-cad5-404e-8e3f-2706c7f4f35a	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	12	2026-11-13	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-11-13	\N	\N
e732739d-a436-4250-910c-e0233d98d5dd	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	13	2026-11-27	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-11-27	\N	\N
d7f806ca-13d4-44cb-8d6b-934d19f62ce1	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	14	2026-12-11	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-12-11	\N	\N
0accb578-bcea-49e9-8fa4-5b27d9a14df4	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	15	2026-12-25	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2026-12-25	\N	\N
c4e25c0c-12c2-4fa7-8c69-6ba9c8782edc	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	16	2027-01-08	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-01-08	\N	\N
6cad748b-9d7b-4927-8648-d275fa21ca31	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	17	2027-01-22	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-01-22	\N	\N
4955c1b9-d75b-439a-859e-090e21f496da	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	18	2027-02-05	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-02-05	\N	\N
3fb33111-ae15-459e-817e-becbe3d2bb44	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	19	2027-02-19	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-02-19	\N	\N
a03372ea-5bc8-4ca1-8e05-dcdbe1a9a7a8	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	20	2027-03-05	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-03-05	\N	\N
101dbce7-c205-4356-b31a-dc9027bf61c6	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	21	2027-03-19	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-03-19	\N	\N
b4d17317-4ce9-4941-ad01-e995632f9992	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	22	2027-04-02	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-04-02	\N	\N
ab23fbe8-abfd-4b6a-bab1-7f9125025b2f	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	23	2027-04-16	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-04-16	\N	\N
f6b480cb-fdb6-46a0-92c2-925e7357c44c	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	24	2027-04-30	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-04-30	\N	\N
6cc6839f-8ec0-491d-9872-f7758c56467e	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	25	2027-05-14	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-05-14	\N	\N
3b3f6439-a5d7-45fa-b342-dc4b794f1d97	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	1	26	2027-05-28	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-05-28	\N	\N
c2b8b5e2-01f3-430e-8e0b-40774d54afce	f923e1cf-9cb8-419a-ab3e-f7961b20c4db	2	1	2027-06-11	\N	\N	expected	2026-06-11 08:16:59	2026-06-11 08:16:59	2027-06-11	\N	\N
\.


--
-- Data for Name: serials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.serials (id, biblio_id, frequency, start_date, end_date, subscription_expiry, supplier, notes, created_at, updated_at, issn, subscription_cost, currency, location_id, collection_id, call_number) FROM stdin;
f923e1cf-9cb8-419a-ab3e-f7961b20c4db	19a2147e-51c8-4cb3-bb62-c4000b4ca5e0	biweekly	2026-06-12	\N	\N	\N	\N	2026-06-11 08:16:59	2026-06-11 08:16:59	\N	\N	USD	\N	\N	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, email_verified_at, avatar_url, preferred_language, is_active, remember_token, created_at, updated_at, deleted_at) FROM stdin;
c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	Super Admin	admin@bannalai.com	$2y$12$2rNrC6qhiE2WWCMqnzt1FO.4.BgVXwP6qEdRkXsnC3kt5TxrcmG4m	2026-06-08 13:53:19	\N	en	t	\N	2026-06-08 13:53:19	2026-06-08 13:53:19	\N
2392aec3-31de-4980-9f32-0d6d1ca5e501	Library Admin	library.admin@bannalai.com	$2y$12$UqAIMFqGa9apmslc5r33yuF81ZtfyDzvo.Ic3RptrY7gsCbVrGB46	2026-06-08 13:53:20	\N	en	t	\N	2026-06-08 13:53:20	2026-06-08 13:53:20	\N
4f9da13e-574e-43c6-83df-4dc6b84e78f6	Cataloger User	cataloger@bannalai.com	$2y$12$r4iqfP/blNw0wi1EuR7TteaK1sPsbyqlfmgv.O2qnDfinN66Dmj0G	2026-06-08 13:53:21	\N	en	t	\N	2026-06-08 13:53:21	2026-06-08 13:53:21	\N
f2283006-0b45-480e-98cb-db297eec7301	Circulation Staff	circulation@bannalai.com	$2y$12$4LaAb4a0JA7KiNwdCtKMieeiqlk8oF1WpE5wNFnsiZlxbvOMMzxrK	2026-06-08 13:53:22	\N	en	t	\N	2026-06-08 13:53:22	2026-06-08 13:53:22	\N
b56d9693-a177-4124-9f4e-7b46e0de8549	Reader Services	reader.services@bannalai.com	$2y$12$Lkag5El.xl89IjnQLQB9UO6r5Ca3.0yrnjyj8CPAmLYTZBAbZzmMu	2026-06-08 13:53:22	\N	en	t	\N	2026-06-08 13:53:22	2026-06-08 13:53:22	\N
7e32cd8c-835b-4f14-ba8b-bafef41e844b	Sopheak Chea	sopheak@bannalai.com	$2y$12$j0TpTJRcaSd3Gpkox45/8OEtRYotDkmYsc/IBwpWSzUjVqW325sum	2026-06-08 13:53:23	\N	en	t	\N	2026-06-08 13:53:23	2026-06-08 13:53:23	\N
0615f9ac-f694-4f3e-bc48-0534655a57bd	Sreymom Kong	sreymom@bannalai.com	$2y$12$cHPdCYZ0w.ACPDvQ9.hO2umnaSiYbBmrgm34X.CXJtBw8nch8wqA6	2026-06-08 13:53:24	\N	en	t	\N	2026-06-08 13:53:24	2026-06-08 13:53:24	\N
e2e123f7-a438-4b0e-9fec-ed4d5c394a80	Dara Meas	dara@bannalai.com	$2y$12$44WKpglJ62LpVyP4t1CXPOAAbkfhBWGT2d42e6WGXxryGBrz.k6xW	2026-06-08 13:53:25	\N	en	t	\N	2026-06-08 13:53:25	2026-06-08 13:53:25	\N
1be6c56a-cc16-4005-971d-4e2d01068e49	bora	bora@gmail.com	$2y$12$A3P60GthVC7BnuSIrVE5E.k5gAL29c1UGqckKTzSfXCYmM6.wcU0O	2026-06-08 14:35:18	\N	en	t	\N	2026-06-08 14:35:22	2026-06-08 14:35:22	\N
\.


--
-- Data for Name: work_contributions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.work_contributions (id, work_id, agent_id, agent_name, agent_type, role_code, role_label, relator_uri, is_primary, sort_order, created_at, updated_at) FROM stdin;
019eb2de-7a35-7323-b9ec-3686ae9c2de2	019eb2de-7a24-73f3-bce0-33120a51a113	019eb2de-7a32-70da-819e-54ce58b5a531	Robertson Davies	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	t	0	2026-06-10 18:49:45	2026-06-10 18:49:45
019eb2eb-fbb4-72c5-8f6e-bf4e102801b7	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	019eb2eb-fbae-7197-95f3-757e0fb1a5a0	John D. Daniels	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	t	0	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbc8-7249-9976-a3b0ffb9c00a	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	019eb2eb-fbc2-7114-8d7d-884681f7b1f0	Lee H. Radebaugh	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	f	1	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbd7-72ef-8ed5-90ef46dd99a6	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	019eb2eb-fbd2-727e-9121-7e7b4c6eaa3b	Daniel P. Sullivan	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	f	2	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbe8-72aa-8cb0-4f1d1af0b6b1	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	019eb2eb-fbe2-7201-84de-2b3affc38726	John Daniels	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	f	3	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2eb-fbf8-7318-a4e6-121f50e03036	019eb2eb-fb88-7222-ba6a-e92280fe9a7f	019eb2eb-fbf3-710c-a257-82bbb2944865	Daniel Sullivan	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	f	4	2026-06-10 19:04:30	2026-06-10 19:04:30
019eb2f8-92ff-7183-a665-a55fbb4e79f8	019eb2f8-92d0-71be-ace8-4d21abdf32ef	019eb2f8-92f6-714e-af0b-8498721cfc14	Eric Carle	person	aut	author	http://id.loc.gov/vocabulary/relators/aut	t	0	2026-06-10 19:18:15	2026-06-10 19:18:15
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.works (id, title, title_km, title_uniform, language, languages, content_type, issuance, origin_date, subjects, keywords, genre_form, ddc_class, lcc_class, summary, summary_km, table_of_contents, notes, series_title, series_number, lccn, oclc_number, authority_uri, bibframe_data, record_status, cataloger_id, cataloged_at, created_at, updated_at, deleted_at, ai_assisted_ddc, ai_assisted_lcc, ai_confidence_ddc, ai_confidence_lcc) FROM stdin;
019eb2de-7a24-73f3-bce0-33120a51a113	AUDIT SAVE OK	\N	\N	en	[]	\N	mono	\N	[{"term":"Fiction","scheme":"LCSH"}]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "AUDIT SAVE OK"}, "bf:subject": [{"@type": "bf:Topic", "rdfs:label": "Fiction"}], "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "AUDIT SAVE OK"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": [{"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "Robertson Davies"}}]}	active	\N	2026-06-11 01:49:45	2026-06-10 18:49:45	2026-06-10 18:49:45	\N	f	f	\N	\N
019eb2eb-fb88-7222-ba6a-e92280fe9a7f	International business	\N	\N	eng	[]	\N	mono	\N	[{"term":"International business enterprises","scheme":"LCSH"},{"term":"International economic relations","scheme":"LCSH"},{"term":"Foreign Investments","scheme":"LCSH"},{"term":"Buitenlandse investeringen","scheme":"LCSH"},{"term":"Inversiones extranjeras","scheme":"LCSH"}]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "International business"}, "bf:subject": [{"@type": "bf:Topic", "rdfs:label": "International business enterprises"}, {"@type": "bf:Topic", "rdfs:label": "International economic relations"}, {"@type": "bf:Topic", "rdfs:label": "Foreign Investments"}, {"@type": "bf:Topic", "rdfs:label": "Buitenlandse investeringen"}, {"@type": "bf:Topic", "rdfs:label": "Inversiones extranjeras"}], "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/eng"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "International business"}, "bf:hasItem": [{"@type": "bf:Item", "bf:barcode": null, "bf:shelfMark": null, "bf:itemStatus": "available"}], "bf:identifiedBy": [{"@type": "bf:Isbn", "rdf:value": "0133457230"}], "bf:provisionActivity": [{"@type": "bf:Publication", "bf:date": "1976", "bf:agent": {"@type": "bf:Agent", "rdfs:label": "Addison-Wesley"}, "bf:place": null}]}], "bf:contribution": [{"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "John D. Daniels"}}, {"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "Lee H. Radebaugh"}}, {"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "Daniel P. Sullivan"}}, {"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "John Daniels"}}, {"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "Daniel Sullivan"}}]}	active	2392aec3-31de-4980-9f32-0d6d1ca5e501	2026-06-11 02:04:30	2026-06-10 19:04:30	2026-06-10 19:04:30	\N	f	f	\N	\N
019eb2ee-03b7-719d-be7e-49d27889fdd7	CTRL TEST 190643	\N	\N	en	[]	\N	mono	\N	[]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "CTRL TEST 190643"}, "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "CTRL TEST 190643"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": []}	active	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	2026-06-11 02:06:43	2026-06-10 19:06:43	2026-06-10 19:06:43	\N	f	f	\N	\N
019eb2f2-b9ba-7217-a287-806bd7864882	MW TEST 191151	\N	\N	en	[]	\N	mono	\N	[]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "MW TEST 191151"}, "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "MW TEST 191151"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": []}	active	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	2026-06-11 02:11:52	2026-06-10 19:11:52	2026-06-10 19:11:52	\N	f	f	\N	\N
019eb2f4-5131-7231-bb2f-db5eaf3b0eaa	HOST TEST 191335	\N	\N	en	[]	\N	mono	\N	[]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "HOST TEST 191335"}, "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "HOST TEST 191335"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": []}	active	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	2026-06-11 02:13:36	2026-06-10 19:13:36	2026-06-10 19:13:36	\N	f	f	\N	\N
019eb3d1-17fe-724c-86d7-4d016628ea39	__audit__	\N	\N	en	[]	\N	mono	\N	[]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "__audit__"}, "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "__audit__"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": []}	active	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	2026-06-11 06:14:45	2026-06-10 23:14:45	2026-06-10 23:14:45	\N	f	f	\N	\N
019eb402-b6d2-72c6-b950-fc080f7969e2	__audit__	\N	\N	en	[]	\N	mono	\N	[]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "__audit__"}, "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/en"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "__audit__"}, "bf:identifiedBy": [], "bf:provisionActivity": []}], "bf:contribution": []}	active	c9110956-b7f3-4b50-9cba-b2d7dbc6eec0	2026-06-11 07:08:57	2026-06-11 00:08:57	2026-06-11 00:08:57	\N	f	f	\N	\N
019eb2f8-92d0-71be-ace8-4d21abdf32ef	The Very Busy Spider	\N	\N	spa	[]	\N	mono	\N	[{"term":"Spider webs","scheme":"LCSH"},{"term":"Ara\\u00f1as","scheme":"LCSH"},{"term":"Juvenile fiction","scheme":"LCSH"},{"term":"Spider","scheme":"LCSH"},{"term":"Fiction","scheme":"LCSH"}]	\N	[]	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"@type": "bf:Work", "@context": {"bf": "http://id.loc.gov/ontologies/bibframe/", "bflc": "http://id.loc.gov/ontologies/bflc/", "rdfs": "http://www.w3.org/2000/01/rdf-schema#", "madsrdf": "http://www.loc.gov/mads/rdf/v1#"}, "bf:title": {"@type": "bf:Title", "bf:mainTitle": "The Very Busy Spider"}, "bf:subject": [{"@type": "bf:Topic", "rdfs:label": "Spider webs"}, {"@type": "bf:Topic", "rdfs:label": "Arañas"}, {"@type": "bf:Topic", "rdfs:label": "Juvenile fiction"}, {"@type": "bf:Topic", "rdfs:label": "Spider"}, {"@type": "bf:Topic", "rdfs:label": "Fiction"}], "bf:issuance": {"@type": "bf:Issuance", "rdfs:label": "mono"}, "bf:language": {"@id": "http://id.loc.gov/vocabulary/languages/spa"}, "bf:hasInstance": [{"@type": "bf:Instance", "bf:title": {"@type": "bf:Title", "bf:mainTitle": "The Very Busy Spider"}, "bf:hasItem": [{"@type": "bf:Item", "bf:barcode": "LIB-000002", "bf:shelfMark": null, "bf:itemStatus": "available"}], "bf:identifiedBy": [{"@type": "bf:Isbn", "rdf:value": "9781484421680"}], "bf:provisionActivity": [{"@type": "bf:Publication", "bf:date": "1984", "bf:agent": {"@type": "bf:Agent", "rdfs:label": "Gerstenberg"}, "bf:place": null}]}], "bf:contribution": [{"@type": "bf:Contribution", "bf:agent": {"@type": "bf:Person", "bf:role": {"@id": "http://id.loc.gov/vocabulary/relators/aut", "@type": "bf:Role", "bf:code": "aut", "rdfs:label": "author"}, "bf:label": "Eric Carle"}}]}	active	2392aec3-31de-4980-9f32-0d6d1ca5e501	2026-06-11 02:18:15	2026-06-10 19:18:15	2026-06-11 09:20:24	\N	f	f	\N	\N
\.


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 17, true);


--
-- Name: collections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.collections_id_seq', 1, false);


--
-- Name: daily_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.daily_stats_id_seq', 1, false);


--
-- Name: inventory_scans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventory_scans_id_seq', 1, false);


--
-- Name: library_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.library_settings_id_seq', 35, true);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: material_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.material_types_id_seq', 13, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 28, true);


--
-- Name: patron_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patron_categories_id_seq', 5, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 31, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 5, true);


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
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: agents agents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agents
    ADD CONSTRAINT agents_pkey PRIMARY KEY (id);


--
-- Name: ai_suggestions ai_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_logs ai_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: bibliographic_records bibliographic_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bibliographic_records
    ADD CONSTRAINT bibliographic_records_pkey PRIMARY KEY (id);


--
-- Name: card_templates card_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_templates
    ADD CONSTRAINT card_templates_pkey PRIMARY KEY (id);


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
-- Name: instance_contributions instance_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_contributions
    ADD CONSTRAINT instance_contributions_pkey PRIMARY KEY (id);


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
-- Name: label_templates label_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.label_templates
    ADD CONSTRAINT label_templates_pkey PRIMARY KEY (id);


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
-- Name: work_contributions work_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_contributions
    ADD CONSTRAINT work_contributions_pkey PRIMARY KEY (id);


--
-- Name: works works_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_pkey PRIMARY KEY (id);


--
-- Name: acquisition_orders_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX acquisition_orders_status_index ON public.acquisition_orders USING btree (status);


--
-- Name: activity_log_causer_type_causer_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_log_causer_type_causer_id_index ON public.activity_log USING btree (causer_type, causer_id);


--
-- Name: activity_log_log_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_log_log_name_index ON public.activity_log USING btree (log_name);


--
-- Name: activity_log_subject_type_subject_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_log_subject_type_subject_id_index ON public.activity_log USING btree (subject_type, subject_id);


--
-- Name: agents_authority_uri_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX agents_authority_uri_index ON public.agents USING btree (authority_uri);


--
-- Name: ai_suggestions_record_id_field_name_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_suggestions_record_id_field_name_index ON public.ai_suggestions USING btree (record_id, field_name);


--
-- Name: ai_suggestions_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_suggestions_status_index ON public.ai_suggestions USING btree (status);


--
-- Name: ai_usage_logs_created_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_logs_created_at_index ON public.ai_usage_logs USING btree (created_at);


--
-- Name: ai_usage_logs_feature_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_logs_feature_index ON public.ai_usage_logs USING btree (feature);


--
-- Name: ai_usage_logs_provider_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_logs_provider_index ON public.ai_usage_logs USING btree (provider);


--
-- Name: ai_usage_logs_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ai_usage_logs_status_index ON public.ai_usage_logs USING btree (status);


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
-- Name: bibliographic_records_work_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bibliographic_records_work_id_index ON public.bibliographic_records USING btree (work_id);


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
-- Name: instance_contributions_agent_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX instance_contributions_agent_id_index ON public.instance_contributions USING btree (agent_id);


--
-- Name: instance_contributions_instance_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX instance_contributions_instance_id_index ON public.instance_contributions USING btree (instance_id);


--
-- Name: inventory_scans_session_id_barcode_scanned_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_scans_session_id_barcode_scanned_index ON public.inventory_scans USING btree (session_id, barcode_scanned);


--
-- Name: inventory_scans_session_id_item_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_scans_session_id_item_id_index ON public.inventory_scans USING btree (session_id, item_id);


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
-- Name: physical_items_item_status_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX physical_items_item_status_index ON public.physical_items USING btree (item_status);


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
-- Name: work_contributions_agent_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_contributions_agent_id_index ON public.work_contributions USING btree (agent_id);


--
-- Name: work_contributions_work_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX work_contributions_work_id_index ON public.work_contributions USING btree (work_id);


--
-- Name: works_language_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_language_index ON public.works USING btree (language);


--
-- Name: works_lccn_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX works_lccn_index ON public.works USING btree (lccn);


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
-- Name: ai_suggestions ai_suggestions_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_record_id_foreign FOREIGN KEY (record_id) REFERENCES public.bibliographic_records(id) ON DELETE CASCADE;


--
-- Name: ai_suggestions ai_suggestions_reviewed_by_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_suggestions
    ADD CONSTRAINT ai_suggestions_reviewed_by_foreign FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ai_usage_logs ai_usage_logs_record_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_record_id_foreign FOREIGN KEY (record_id) REFERENCES public.bibliographic_records(id) ON DELETE SET NULL;


--
-- Name: ai_usage_logs ai_usage_logs_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: bibliographic_records bibliographic_records_material_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bibliographic_records
    ADD CONSTRAINT bibliographic_records_material_type_id_foreign FOREIGN KEY (material_type_id) REFERENCES public.material_types(id) ON DELETE SET NULL;


--
-- Name: bibliographic_records bibliographic_records_work_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bibliographic_records
    ADD CONSTRAINT bibliographic_records_work_id_foreign FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE SET NULL;


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
-- Name: instance_contributions instance_contributions_agent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_contributions
    ADD CONSTRAINT instance_contributions_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: instance_contributions instance_contributions_instance_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.instance_contributions
    ADD CONSTRAINT instance_contributions_instance_id_foreign FOREIGN KEY (instance_id) REFERENCES public.bibliographic_records(id) ON DELETE CASCADE;


--
-- Name: inventory_scans inventory_scans_session_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_scans
    ADD CONSTRAINT inventory_scans_session_id_foreign FOREIGN KEY (session_id) REFERENCES public.inventory_sessions(id) ON DELETE CASCADE;


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
-- Name: work_contributions work_contributions_agent_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_contributions
    ADD CONSTRAINT work_contributions_agent_id_foreign FOREIGN KEY (agent_id) REFERENCES public.agents(id) ON DELETE SET NULL;


--
-- Name: work_contributions work_contributions_work_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.work_contributions
    ADD CONSTRAINT work_contributions_work_id_foreign FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict hIi6J70ylwhwogg4UNDRQ7g7SlNenksQy0JNXok6lJeYpUMBa1jdWRBzyN1If5n

