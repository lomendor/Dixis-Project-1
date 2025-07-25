--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

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

--
-- Name: ActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ActivityType" AS ENUM (
    'CREATE_ORDER',
    'UPDATE_ORDER',
    'DELETE_ORDER',
    'CHANGE_ORDER_STATUS',
    'CREATE_PRODUCT',
    'UPDATE_PRODUCT',
    'DELETE_PRODUCT',
    'CHANGE_PRODUCT_STATUS',
    'CREATE_CATEGORY',
    'UPDATE_CATEGORY',
    'DELETE_CATEGORY',
    'CREATE_USER',
    'UPDATE_USER',
    'DELETE_USER',
    'CREATE_REVIEW',
    'UPDATE_REVIEW',
    'DELETE_REVIEW',
    'CREATE_PRODUCER',
    'UPDATE_PRODUCER',
    'DELETE_PRODUCER',
    'SYSTEM_EVENT'
);


ALTER TYPE public."ActivityType" OWNER TO postgres;

--
-- Name: AddressType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AddressType" AS ENUM (
    'DELIVERY',
    'BILLING',
    'BUSINESS'
);


ALTER TYPE public."AddressType" OWNER TO postgres;

--
-- Name: BlogPostStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BlogPostStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."BlogPostStatus" OWNER TO postgres;

--
-- Name: DiscountType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DiscountType" AS ENUM (
    'PERCENTAGE',
    'FIXED_AMOUNT'
);


ALTER TYPE public."DiscountType" OWNER TO postgres;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'ISSUED',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO postgres;

--
-- Name: LogType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."LogType" AS ENUM (
    'ERROR',
    'WARNING',
    'INFO',
    'SECURITY'
);


ALTER TYPE public."LogType" OWNER TO postgres;

--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MediaType" AS ENUM (
    'IMAGE',
    'VIDEO',
    'DOCUMENT'
);


ALTER TYPE public."MediaType" OWNER TO postgres;

--
-- Name: OrderItemStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderItemStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."OrderItemStatus" OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PageStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PageStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."PageStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CARD',
    'PAYPAL',
    'CASH_ON_DELIVERY'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: ProducerStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ProducerStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."ProducerStatus" OWNER TO postgres;

--
-- Name: QuestionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuestionStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."QuestionStatus" OWNER TO postgres;

--
-- Name: ReferralStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReferralStatus" AS ENUM (
    'PENDING',
    'CONVERTED',
    'REWARDED'
);


ALTER TYPE public."ReferralStatus" OWNER TO postgres;

--
-- Name: RefundStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."RefundStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'REJECTED'
);


ALTER TYPE public."RefundStatus" OWNER TO postgres;

--
-- Name: ReturnStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReturnStatus" AS ENUM (
    'REQUESTED',
    'APPROVED',
    'RECEIVED',
    'REFUNDED',
    'REJECTED'
);


ALTER TYPE public."ReturnStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'CONSUMER',
    'PRODUCER',
    'BUSINESS',
    'ADMIN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'DELETED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- Name: VerificationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);


ALTER TYPE public."VerificationStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abandoned_carts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.abandoned_carts (
    cart_id text NOT NULL,
    user_id text,
    session_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_activity timestamp(3) without time zone NOT NULL,
    recovery_email_sent boolean DEFAULT false NOT NULL,
    recovered boolean DEFAULT false NOT NULL,
    total_value numeric(10,2) NOT NULL
);


ALTER TABLE public.abandoned_carts OWNER TO postgres;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activities (
    id text NOT NULL,
    type public."ActivityType" NOT NULL,
    user_id text NOT NULL,
    details jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.activities OWNER TO postgres;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.addresses (
    id text NOT NULL,
    user_id text NOT NULL,
    address_type public."AddressType" DEFAULT 'DELIVERY'::public."AddressType" NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    recipient_name text NOT NULL,
    street text NOT NULL,
    street_number text NOT NULL,
    city text NOT NULL,
    region text,
    postal_code text NOT NULL,
    country text DEFAULT 'Ελλάδα'::text NOT NULL,
    floor text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.addresses OWNER TO postgres;

--
-- Name: analytics_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analytics_events (
    id text NOT NULL,
    "userId" text,
    "eventType" text NOT NULL,
    "eventData" jsonb NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sessionId" text,
    "ipAddress" text,
    "userAgent" text
);


ALTER TABLE public.analytics_events OWNER TO postgres;

--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_categories (
    category_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.blog_categories OWNER TO postgres;

--
-- Name: blog_post_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_post_categories (
    post_id text NOT NULL,
    category_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blog_post_categories OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    post_id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text,
    feature_image_url text,
    author_id text NOT NULL,
    producer_id text,
    status public."BlogPostStatus" DEFAULT 'DRAFT'::public."BlogPostStatus" NOT NULL,
    publish_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    meta_title text,
    meta_description text,
    view_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: business_customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_customers (
    business_id text NOT NULL,
    user_id text NOT NULL,
    business_name text NOT NULL,
    tax_id text NOT NULL,
    tax_office text NOT NULL,
    legal_form text NOT NULL,
    contact_person text NOT NULL,
    business_type text NOT NULL,
    verification_status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    credit_limit numeric(10,2),
    payment_terms text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.business_customers OWNER TO postgres;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    cart_item_id text NOT NULL,
    cart_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    quantity integer NOT NULL,
    added_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    price numeric(10,2) NOT NULL
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_on_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories_on_products (
    product_id text NOT NULL,
    category_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories_on_products OWNER TO postgres;

--
-- Name: certification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certification_types (
    certification_type_id text NOT NULL,
    name text NOT NULL,
    description text,
    icon_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.certification_types OWNER TO postgres;

--
-- Name: conversion_funnels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversion_funnels (
    funnel_id text NOT NULL,
    name text NOT NULL,
    description text,
    steps jsonb NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conversion_funnels OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    coupon_id text NOT NULL,
    code text NOT NULL,
    description text,
    discount_type public."DiscountType" NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    minimum_order_amount numeric(10,2),
    maximum_discount_amount numeric(10,2),
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    is_active boolean DEFAULT true NOT NULL,
    usage_limit integer,
    usage_count integer DEFAULT 0 NOT NULL,
    applies_to text DEFAULT 'all'::text NOT NULL,
    applies_to_ids jsonb,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.email_campaigns (
    campaign_id text NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    content_html text NOT NULL,
    content_text text,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_at timestamp(3) without time zone,
    sent_at timestamp(3) without time zone,
    target_audience jsonb,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.email_campaigns OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    invoice_id text NOT NULL,
    order_id text NOT NULL,
    invoice_number text NOT NULL,
    invoice_date timestamp(3) without time zone NOT NULL,
    due_date timestamp(3) without time zone,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status public."InvoiceStatus" DEFAULT 'ISSUED'::public."InvoiceStatus" NOT NULL,
    pdf_url text,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs (
    log_id text NOT NULL,
    log_type public."LogType" NOT NULL,
    source text NOT NULL,
    user_id text,
    message text NOT NULL,
    details jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address text
);


ALTER TABLE public.logs OWNER TO postgres;

--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_points (
    point_id text NOT NULL,
    user_id text NOT NULL,
    order_id text,
    action text NOT NULL,
    points_earned integer DEFAULT 0 NOT NULL,
    points_spent integer DEFAULT 0 NOT NULL,
    balance_change integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone,
    description text
);


ALTER TABLE public.loyalty_points OWNER TO postgres;

--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.newsletter_subscribers (
    subscriber_id text NOT NULL,
    email text NOT NULL,
    name text,
    subscription_date timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    user_id text,
    preferences jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.newsletter_subscribers OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id text NOT NULL,
    user_id text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone,
    link text,
    is_read boolean DEFAULT false NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id text NOT NULL,
    order_id text NOT NULL,
    product_id text NOT NULL,
    variant_id text,
    producer_id text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    status public."OrderItemStatus" DEFAULT 'PENDING'::public."OrderItemStatus" NOT NULL,
    tracking_number text,
    shipping_method text,
    shipping_cost numeric(10,2),
    expected_shipping_date timestamp(3) without time zone,
    actual_shipping_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    history_id text NOT NULL,
    order_id text NOT NULL,
    order_item_id text,
    status text NOT NULL,
    comment text,
    created_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id text NOT NULL,
    order_number text NOT NULL,
    user_id text NOT NULL,
    business_id text,
    status public."OrderStatus" DEFAULT 'PENDING'::public."OrderStatus" NOT NULL,
    payment_status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    payment_intent_id text,
    subtotal numeric(10,2) NOT NULL,
    shipping_cost numeric(10,2) NOT NULL,
    tax_amount numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    total numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    tracking_number text,
    notes text,
    expected_delivery_date timestamp(3) without time zone,
    actual_delivery_date timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    ip_address text,
    user_agent text,
    coupon_code text,
    is_gift boolean DEFAULT false NOT NULL,
    gift_message text,
    shipping_address_id text NOT NULL,
    billing_address_id text,
    invoice_details jsonb,
    invoice_issued boolean DEFAULT false NOT NULL,
    invoice_number text,
    is_business_order boolean DEFAULT false NOT NULL
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: pages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pages (
    page_id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    status public."PageStatus" DEFAULT 'DRAFT'::public."PageStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    template text DEFAULT 'default'::text NOT NULL,
    meta_title text,
    meta_description text
);


ALTER TABLE public.pages OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    payment_id text NOT NULL,
    order_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'EUR'::text NOT NULL,
    payment_method public."PaymentMethod" NOT NULL,
    payment_gateway text,
    transaction_id text,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    gateway_response jsonb,
    error_message text
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: producer_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_categories (
    producer_id text NOT NULL,
    category_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.producer_categories OWNER TO postgres;

--
-- Name: producer_certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_certifications (
    certification_id text NOT NULL,
    producer_id text NOT NULL,
    certification_type_id text NOT NULL,
    issue_date timestamp(3) without time zone NOT NULL,
    expiry_date timestamp(3) without time zone,
    document_url text,
    "verificationStatus" public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.producer_certifications OWNER TO postgres;

--
-- Name: producer_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_media (
    media_id text NOT NULL,
    producer_id text NOT NULL,
    media_type public."MediaType" DEFAULT 'IMAGE'::public."MediaType" NOT NULL,
    url text NOT NULL,
    title text,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.producer_media OWNER TO postgres;

--
-- Name: producer_shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producer_shipping_methods (
    producer_id text NOT NULL,
    shipping_method_id text NOT NULL,
    additional_cost numeric(10,2) DEFAULT 0 NOT NULL,
    free_shipping_threshold numeric(10,2),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.producer_shipping_methods OWNER TO postgres;

--
-- Name: producers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producers (
    producer_id text NOT NULL,
    user_id text NOT NULL,
    business_name text NOT NULL,
    tax_id text NOT NULL,
    tax_office text NOT NULL,
    legal_form text NOT NULL,
    bio text,
    founding_year integer,
    logo_url text,
    cover_image_url text,
    website text,
    commission_percentage double precision DEFAULT 10 NOT NULL,
    bank_account_info text,
    paypal_email text,
    is_verified boolean DEFAULT false NOT NULL,
    has_physical_store boolean DEFAULT false NOT NULL,
    verification_documents jsonb,
    average_rating double precision DEFAULT 0,
    total_ratings integer DEFAULT 0 NOT NULL,
    total_sales integer DEFAULT 0 NOT NULL,
    status public."ProducerStatus" DEFAULT 'PENDING'::public."ProducerStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.producers OWNER TO postgres;

--
-- Name: product_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_attributes (
    attribute_id text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'text'::text NOT NULL,
    is_required boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_attributes OWNER TO postgres;

--
-- Name: product_certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_certifications (
    certification_id text NOT NULL,
    product_id text NOT NULL,
    certification_type_id text NOT NULL,
    issue_date timestamp(3) without time zone NOT NULL,
    expiry_date timestamp(3) without time zone,
    document_url text,
    verification_status public."VerificationStatus" DEFAULT 'PENDING'::public."VerificationStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_certifications OWNER TO postgres;

--
-- Name: product_frequently_bought_together; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_frequently_bought_together (
    id integer NOT NULL,
    product_id text NOT NULL,
    related_product_id text NOT NULL,
    frequency integer DEFAULT 1 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_frequently_bought_together OWNER TO postgres;

--
-- Name: product_frequently_bought_together_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_frequently_bought_together_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_frequently_bought_together_id_seq OWNER TO postgres;

--
-- Name: product_frequently_bought_together_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_frequently_bought_together_id_seq OWNED BY public.product_frequently_bought_together.id;


--
-- Name: product_media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_media (
    media_id text NOT NULL,
    product_id text NOT NULL,
    media_type public."MediaType" DEFAULT 'IMAGE'::public."MediaType" NOT NULL,
    url text NOT NULL,
    alt_text text,
    title text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_media OWNER TO postgres;

--
-- Name: product_question_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_question_answers (
    answer_id text NOT NULL,
    question_id text NOT NULL,
    producer_id text,
    user_id text,
    answer text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    helpful_votes integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_question_answers OWNER TO postgres;

--
-- Name: product_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_questions (
    question_id text NOT NULL,
    product_id text NOT NULL,
    user_id text NOT NULL,
    question text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."QuestionStatus" DEFAULT 'PENDING'::public."QuestionStatus" NOT NULL,
    is_anonymous boolean DEFAULT false NOT NULL
);


ALTER TABLE public.product_questions OWNER TO postgres;

--
-- Name: product_sustainability_metrics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_sustainability_metrics (
    metric_id text NOT NULL,
    product_id text NOT NULL,
    carbon_footprint double precision,
    water_usage double precision,
    packaging_recyclability boolean,
    eco_friendly_description text,
    sustainable_practices jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_sustainability_metrics OWNER TO postgres;

--
-- Name: product_tag_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tag_relations (
    product_id text NOT NULL,
    tag_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.product_tag_relations OWNER TO postgres;

--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_tags (
    tag_id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_tags OWNER TO postgres;

--
-- Name: product_variant_attributes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variant_attributes (
    attribute_value_id text NOT NULL,
    variant_id text NOT NULL,
    attribute_id text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variant_attributes OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    variant_id text NOT NULL,
    product_id text NOT NULL,
    name text NOT NULL,
    sku text,
    barcode text,
    price_adjustment numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    weight_adjustment integer,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    short_description text,
    full_description text NOT NULL,
    regular_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2),
    wholesale_price numeric(10,2),
    currency text DEFAULT 'EUR'::text NOT NULL,
    tax_rate double precision DEFAULT 24 NOT NULL,
    include_tax boolean DEFAULT true NOT NULL,
    sku text,
    barcode text,
    stock_quantity integer DEFAULT 0 NOT NULL,
    weight integer,
    dimensions jsonb,
    unit text DEFAULT 'τεμάχιο'::text NOT NULL,
    minimum_order_quantity integer DEFAULT 1 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_digital boolean DEFAULT false NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    image_url text,
    producer_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    publish_date timestamp(3) without time zone,
    meta_title text,
    meta_description text,
    average_rating double precision,
    reviews_count integer DEFAULT 0 NOT NULL,
    total_sales integer DEFAULT 0 NOT NULL,
    views_count integer DEFAULT 0 NOT NULL,
    sustainability_info text,
    usage_instructions text,
    suggested_uses text,
    is_limited_edition boolean DEFAULT false NOT NULL,
    story text,
    shelf_life text,
    images text[],
    "productionMethods" text[]
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: recently_viewed; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recently_viewed (
    view_id text NOT NULL,
    user_id text NOT NULL,
    product_id text NOT NULL,
    viewed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.recently_viewed OWNER TO postgres;

--
-- Name: referrals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.referrals (
    referral_id text NOT NULL,
    referrer_id text NOT NULL,
    referred_id text NOT NULL,
    referral_code text NOT NULL,
    status public."ReferralStatus" DEFAULT 'PENDING'::public."ReferralStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    converted_at timestamp(3) without time zone,
    reward_points integer,
    reward_amount numeric(10,2)
);


ALTER TABLE public.referrals OWNER TO postgres;

--
-- Name: refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refunds (
    refund_id text NOT NULL,
    order_id text NOT NULL,
    payment_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    reason text NOT NULL,
    status public."RefundStatus" DEFAULT 'PENDING'::public."RefundStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp(3) without time zone,
    processed_by text,
    notes text
);


ALTER TABLE public.refunds OWNER TO postgres;

--
-- Name: returns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.returns (
    return_id text NOT NULL,
    order_id text NOT NULL,
    order_item_id text NOT NULL,
    reason text NOT NULL,
    description text,
    status public."ReturnStatus" DEFAULT 'REQUESTED'::public."ReturnStatus" NOT NULL,
    requested_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    processed_at timestamp(3) without time zone,
    refund_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.returns OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    user_id text NOT NULL,
    product_id text,
    producer_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_verified_purchase boolean DEFAULT false NOT NULL,
    "orderItemId" text
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    setting_id text NOT NULL,
    category text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    is_public boolean DEFAULT false NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: shipping_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_methods (
    shipping_method_id text NOT NULL,
    name text NOT NULL,
    description text,
    base_cost numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    delivery_estimate_min integer DEFAULT 1 NOT NULL,
    delivery_estimate_max integer DEFAULT 3 NOT NULL,
    tracking_url_template text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_methods OWNER TO postgres;

--
-- Name: shipping_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_rates (
    rate_id text NOT NULL,
    shipping_method_id text NOT NULL,
    zone_id text NOT NULL,
    min_weight integer DEFAULT 0 NOT NULL,
    max_weight integer,
    price numeric(10,2) NOT NULL,
    free_shipping_threshold numeric(10,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_rates OWNER TO postgres;

--
-- Name: shipping_zones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipping_zones (
    zone_id text NOT NULL,
    name text NOT NULL,
    regions jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shipping_zones OWNER TO postgres;

--
-- Name: user_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_events (
    event_id text NOT NULL,
    user_id text,
    event_type text NOT NULL,
    event_data jsonb NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    session_id text,
    ip_address text,
    user_agent text
);


ALTER TABLE public.user_events OWNER TO postgres;

--
-- Name: user_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_messages (
    message_id text NOT NULL,
    sender_id text NOT NULL,
    recipient_id text NOT NULL,
    subject text,
    content text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp(3) without time zone,
    status text DEFAULT 'sent'::text NOT NULL,
    related_order_id text,
    related_product_id text
);


ALTER TABLE public.user_messages OWNER TO postgres;

--
-- Name: user_product_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_product_views (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    "viewedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.user_product_views OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    session_id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    device_info text,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'CONSUMER'::public."UserRole" NOT NULL,
    phone text,
    is_verified boolean DEFAULT false NOT NULL,
    verification_token text,
    reset_password_token text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_login timestamp(3) without time zone,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    login_attempts integer DEFAULT 0 NOT NULL,
    referral_code text,
    referred_by text,
    certifications text[],
    description text,
    image_url text,
    images text[],
    location text,
    rating double precision,
    region text,
    reviews_count integer DEFAULT 0 NOT NULL,
    specialty text[]
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wishlist_items (
    wishlist_id text NOT NULL,
    user_id text NOT NULL,
    product_id text NOT NULL,
    added_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text
);


ALTER TABLE public.wishlist_items OWNER TO postgres;

--
-- Name: product_frequently_bought_together id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_frequently_bought_together ALTER COLUMN id SET DEFAULT nextval('public.product_frequently_bought_together_id_seq'::regclass);


--
-- Data for Name: abandoned_carts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.abandoned_carts (cart_id, user_id, session_id, created_at, last_activity, recovery_email_sent, recovered, total_value) FROM stdin;
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activities (id, type, user_id, details, created_at) FROM stdin;
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.addresses (id, user_id, address_type, is_default, recipient_name, street, street_number, city, region, postal_code, country, floor, notes, created_at, updated_at) FROM stdin;
61a7d2b9-1944-4ac7-9c75-24305fb344ba	99080e23-111f-43ad-9045-6d38447bbc03	DELIVERY	t	Γιώργος Παπαδόπουλος	Λεωφόρος Αλεξάνδρας	15	Αθήνα	\N	11521	Ελλάδα	\N	\N	2025-03-16 06:52:51.414	2025-03-16 06:52:51.414
\.


--
-- Data for Name: analytics_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.analytics_events (id, "userId", "eventType", "eventData", "timestamp", "sessionId", "ipAddress", "userAgent") FROM stdin;
\.


--
-- Data for Name: blog_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_categories (category_id, name, slug, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: blog_post_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_post_categories (post_id, category_id, created_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blog_posts (post_id, title, slug, content, excerpt, feature_image_url, author_id, producer_id, status, publish_date, created_at, updated_at, meta_title, meta_description, view_count) FROM stdin;
\.


--
-- Data for Name: business_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_customers (business_id, user_id, business_name, tax_id, tax_office, legal_form, contact_person, business_type, verification_status, credit_limit, payment_terms, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (cart_item_id, cart_id, product_id, variant_id, quantity, added_at, price) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, description, created_at, updated_at) FROM stdin;
5993cd32-5954-4efd-a544-eb9156835f2b	dairy	Τυριά, γιαούρτι και άλλα γαλακτοκομικά προϊόντα	2025-03-16 06:52:51.247	2025-03-16 06:52:51.247
a1e574ad-5149-463c-9323-794cc0901723	honey	Μέλι και προϊόντα μελιού	2025-03-16 06:52:51.247	2025-03-16 06:52:51.247
f2fbd674-6ae3-4817-8126-9666cb68b3e9	herbs	Βότανα, μπαχαρικά και αρωματικά φυτά	2025-03-16 06:52:51.247	2025-03-16 06:52:51.247
c59aefbc-5b85-47a6-8dd5-6ea501f2db1f	olive-products	Ελαιόλαδο, ελιές και άλλα προϊόντα ελιάς	2025-03-16 06:52:51.247	2025-03-16 06:52:51.247
1b78fba1-3a3c-4e1e-bd0b-3a75c25ad09d	wine	Κρασιά, τσίπουρο και άλλα αποστάγματα	2025-03-16 06:52:51.247	2025-03-16 06:52:51.247
\.


--
-- Data for Name: categories_on_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories_on_products (product_id, category_id, created_at) FROM stdin;
ad62aaca-8343-449c-ac6d-8a8b7c0d3551	c59aefbc-5b85-47a6-8dd5-6ea501f2db1f	2025-03-16 06:52:51.398
bdb2eb64-9655-431c-8055-2f0bd2dc8d22	c59aefbc-5b85-47a6-8dd5-6ea501f2db1f	2025-03-16 06:52:51.405
8798f885-594a-4ed4-8b98-240aed7ee8aa	c59aefbc-5b85-47a6-8dd5-6ea501f2db1f	2025-03-16 06:52:51.408
\.


--
-- Data for Name: certification_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certification_types (certification_type_id, name, description, icon_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: conversion_funnels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversion_funnels (funnel_id, name, description, steps, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (coupon_id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, start_date, end_date, is_active, usage_limit, usage_count, applies_to, applies_to_ids, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.email_campaigns (campaign_id, name, subject, content_html, content_text, status, scheduled_at, sent_at, target_audience, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (invoice_id, order_id, invoice_number, invoice_date, due_date, subtotal, tax_amount, total_amount, status, pdf_url, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs (log_id, log_type, source, user_id, message, details, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: loyalty_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_points (point_id, user_id, order_id, action, points_earned, points_spent, balance_change, created_at, expires_at, description) FROM stdin;
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.newsletter_subscribers (subscriber_id, email, name, subscription_date, status, user_id, preferences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, type, title, content, created_at, read_at, link, is_read) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (id, order_id, product_id, variant_id, producer_id, quantity, unit_price, subtotal, tax_amount, total, status, tracking_number, shipping_method, shipping_cost, expected_shipping_date, actual_shipping_date, created_at, updated_at) FROM stdin;
ccd922b8-4265-4544-bcd7-f7ba60de22ed	897dc4f1-8906-4d6f-86e2-4961f642ae31	ad62aaca-8343-449c-ac6d-8a8b7c0d3551	\N	7395647f-e949-4844-afb3-f6b2b25b68b7	2	12.90	25.80	6.19	31.99	PENDING	\N	\N	\N	\N	\N	2025-03-16 06:52:51.418	2025-03-16 06:52:51.418
e0b1ee6e-50ef-4fc3-aa60-2bf6d154b09d	897dc4f1-8906-4d6f-86e2-4961f642ae31	bdb2eb64-9655-431c-8055-2f0bd2dc8d22	\N	7395647f-e949-4844-afb3-f6b2b25b68b7	1	8.50	8.50	2.04	10.54	PENDING	\N	\N	\N	\N	\N	2025-03-16 06:52:51.419	2025-03-16 06:52:51.419
62fe755f-4f1b-4967-bfa1-2f32303dede0	39db496b-424f-4100-84d7-5765306f1def	8798f885-594a-4ed4-8b98-240aed7ee8aa	\N	7395647f-e949-4844-afb3-f6b2b25b68b7	1	15.90	15.90	3.82	19.72	PENDING	\N	\N	\N	\N	\N	2025-03-16 06:52:51.42	2025-03-16 06:52:51.42
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (history_id, order_id, order_item_id, status, comment, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (id, order_number, user_id, business_id, status, payment_status, payment_method, payment_intent_id, subtotal, shipping_cost, tax_amount, discount_amount, total, currency, tracking_number, notes, expected_delivery_date, actual_delivery_date, created_at, updated_at, ip_address, user_agent, coupon_code, is_gift, gift_message, shipping_address_id, billing_address_id, invoice_details, invoice_issued, invoice_number, is_business_order) FROM stdin;
897dc4f1-8906-4d6f-86e2-4961f642ae31	ORD-971414	99080e23-111f-43ad-9045-6d38447bbc03	\N	PENDING	PENDING	CARD	\N	34.30	5.00	9.44	0.00	48.74	EUR	\N	\N	\N	\N	2025-03-16 06:52:51.415	2025-03-16 06:52:51.415	\N	\N	\N	f	\N	61a7d2b9-1944-4ac7-9c75-24305fb344ba	61a7d2b9-1944-4ac7-9c75-24305fb344ba	\N	f	\N	f
39db496b-424f-4100-84d7-5765306f1def	ORD-171419	99080e23-111f-43ad-9045-6d38447bbc03	\N	DELIVERED	PAID	CARD	\N	15.90	5.00	5.02	0.00	25.92	EUR	\N	\N	\N	\N	2025-03-09 06:52:51.419	2025-03-16 06:52:51.42	\N	\N	\N	f	\N	61a7d2b9-1944-4ac7-9c75-24305fb344ba	61a7d2b9-1944-4ac7-9c75-24305fb344ba	\N	f	\N	f
\.


--
-- Data for Name: pages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pages (page_id, title, slug, content, status, created_at, updated_at, template, meta_title, meta_description) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (payment_id, order_id, amount, currency, payment_method, payment_gateway, transaction_id, status, created_at, updated_at, gateway_response, error_message) FROM stdin;
\.


--
-- Data for Name: producer_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_categories (producer_id, category_id, created_at) FROM stdin;
\.


--
-- Data for Name: producer_certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_certifications (certification_id, producer_id, certification_type_id, issue_date, expiry_date, document_url, "verificationStatus", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_media (media_id, producer_id, media_type, url, title, description, sort_order, is_featured, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producer_shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producer_shipping_methods (producer_id, shipping_method_id, additional_cost, free_shipping_threshold, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: producers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producers (producer_id, user_id, business_name, tax_id, tax_office, legal_form, bio, founding_year, logo_url, cover_image_url, website, commission_percentage, bank_account_info, paypal_email, is_verified, has_physical_store, verification_documents, average_rating, total_ratings, total_sales, status, created_at, updated_at) FROM stdin;
7395647f-e949-4844-afb3-f6b2b25b68b7	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	Ελαιώνες Μεσσηνίας	123456789	ΔΟΥ Καλαμάτας	Ατομική Επιχείρηση	Παραγωγός βιολογικού ελαιόλαδου και ελιών από τη Μεσσηνία με παράδοση τριών γενεών.	1985	https://i.pravatar.cc/150?u=producer@dixis.gr	\N	https://elaionesMessinias.gr	10	\N	\N	t	t	\N	0	0	0	ACTIVE	2025-03-16 06:52:51.353	2025-03-16 06:52:51.353
\.


--
-- Data for Name: product_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_attributes (attribute_id, name, type, is_required, display_order, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_certifications (certification_id, product_id, certification_type_id, issue_date, expiry_date, document_url, verification_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_frequently_bought_together; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_frequently_bought_together (id, product_id, related_product_id, frequency, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_media (media_id, product_id, media_type, url, alt_text, title, sort_order, is_featured, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_question_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_question_answers (answer_id, question_id, producer_id, user_id, answer, created_at, is_verified, helpful_votes) FROM stdin;
\.


--
-- Data for Name: product_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_questions (question_id, product_id, user_id, question, created_at, status, is_anonymous) FROM stdin;
\.


--
-- Data for Name: product_sustainability_metrics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_sustainability_metrics (metric_id, product_id, carbon_footprint, water_usage, packaging_recyclability, eco_friendly_description, sustainable_practices, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_tag_relations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tag_relations (product_id, tag_id, created_at) FROM stdin;
\.


--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_tags (tag_id, name, slug, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_variant_attributes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variant_attributes (attribute_value_id, variant_id, attribute_id, value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (variant_id, product_id, name, sku, barcode, price_adjustment, stock_quantity, weight_adjustment, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, slug, short_description, full_description, regular_price, sale_price, wholesale_price, currency, tax_rate, include_tax, sku, barcode, stock_quantity, weight, dimensions, unit, minimum_order_quantity, is_featured, is_active, is_digital, status, image_url, producer_id, created_at, updated_at, publish_date, meta_title, meta_description, average_rating, reviews_count, total_sales, views_count, sustainability_info, usage_instructions, suggested_uses, is_limited_edition, story, shelf_life, images, "productionMethods") FROM stdin;
ad62aaca-8343-449c-ac6d-8a8b7c0d3551	Βιολογικό Εξαιρετικό Παρθένο Ελαιόλαδο	viologiko-exairetiko-partheno-elaiolado	\N	Εξαιρετικό παρθένο ελαιόλαδο από βιολογικές καλλιέργειες στη Μεσσηνία. Χαμηλή οξύτητα και πλούσια γεύση.	12.90	\N	\N	EUR	24	t	\N	\N	100	\N	\N	λίτρο	1	f	t	f	draft	/images/products/olive-oil-1.jpg	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	2025-03-16 06:52:51.398	2025-03-16 06:52:51.398	\N	\N	\N	4.8	24	0	0	\N	\N	\N	f	\N	\N	{/images/products/olive-oil-2.jpg,/images/products/olive-oil-3.jpg}	{organic,traditional}
bdb2eb64-9655-431c-8055-2f0bd2dc8d22	Ελιές Καλαμών	elies-kalamwn	\N	Παραδοσιακές ελιές Καλαμών ΠΟΠ. Συλλεγμένες με το χέρι και επεξεργασμένες με παραδοσιακές μεθόδους.	8.50	\N	\N	EUR	24	t	\N	\N	150	\N	\N	κιλό	1	f	t	f	draft	/images/products/olives.jpg	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	2025-03-16 06:52:51.405	2025-03-16 06:52:51.405	\N	\N	\N	4.7	18	0	0	\N	\N	\N	f	\N	\N	{}	{traditional}
8798f885-594a-4ed4-8b98-240aed7ee8aa	Βιολογικό Ελαιόλαδο Premium	viologiko-elaiolado-premium	\N	Premium βιολογικό ελαιόλαδο από επιλεγμένες ποικιλίες ελιάς. Ιδανικό για σαλάτες και ωμή κατανάλωση.	15.90	\N	\N	EUR	24	t	\N	\N	80	\N	\N	λίτρο	1	f	t	f	draft	/images/products/premium-olive-oil.jpg	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	2025-03-16 06:52:51.408	2025-03-16 06:52:51.408	\N	\N	\N	4.9	32	0	0	\N	\N	\N	f	\N	\N	{}	{organic,biodynamic}
\.


--
-- Data for Name: recently_viewed; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recently_viewed (view_id, user_id, product_id, viewed_at) FROM stdin;
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.referrals (referral_id, referrer_id, referred_id, referral_code, status, created_at, converted_at, reward_points, reward_amount) FROM stdin;
\.


--
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refunds (refund_id, order_id, payment_id, amount, reason, status, created_at, processed_at, processed_by, notes) FROM stdin;
\.


--
-- Data for Name: returns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.returns (return_id, order_id, order_item_id, reason, description, status, requested_at, processed_at, refund_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, rating, comment, user_id, product_id, producer_id, created_at, updated_at, is_verified_purchase, "orderItemId") FROM stdin;
9ce2793c-e47c-4f22-8846-223b6142caba	5	Εξαιρετικό προϊόν, πολύ καλή γεύση!	99080e23-111f-43ad-9045-6d38447bbc03	ad62aaca-8343-449c-ac6d-8a8b7c0d3551	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	2025-03-16 06:52:51.41	2025-03-16 06:52:51.41	f	\N
a07d4969-167a-42ba-9fc2-28fa7bfc54b3	4	Πολύ καλό ελαιόλαδο, το χρησιμοποιώ καθημερινά.	99080e23-111f-43ad-9045-6d38447bbc03	ad62aaca-8343-449c-ac6d-8a8b7c0d3551	79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	2025-03-16 06:52:51.412	2025-03-16 06:52:51.412	f	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (setting_id, category, key, value, description, is_public, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: shipping_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_methods (shipping_method_id, name, description, base_cost, is_active, delivery_estimate_min, delivery_estimate_max, tracking_url_template, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipping_rates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_rates (rate_id, shipping_method_id, zone_id, min_weight, max_weight, price, free_shipping_threshold, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: shipping_zones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shipping_zones (zone_id, name, regions, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_events (event_id, user_id, event_type, event_data, "timestamp", session_id, ip_address, user_agent) FROM stdin;
\.


--
-- Data for Name: user_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_messages (message_id, sender_id, recipient_id, subject, content, created_at, read_at, status, related_order_id, related_product_id) FROM stdin;
\.


--
-- Data for Name: user_product_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_product_views (id, "userId", "productId", "viewedAt") FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (session_id, user_id, token, device_info, ip_address, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password, role, phone, is_verified, verification_token, reset_password_token, created_at, updated_at, last_login, status, login_attempts, referral_code, referred_by, certifications, description, image_url, images, location, rating, region, reviews_count, specialty) FROM stdin;
99080e23-111f-43ad-9045-6d38447bbc03	customer@example.com	Γιώργος Παπαδόπουλος	$2b$10$I.d1r4aaRTcWd0phPWt0FekoeLpVCDcb4Amn0s0.uNxMW9vSCG9VK	CONSUMER	\N	f	\N	\N	2025-03-16 06:52:51.396	2025-03-16 06:52:51.396	\N	ACTIVE	0	\N	\N	{}	\N	https://i.pravatar.cc/150?u=customer@example.com	{}	\N	\N	\N	0	{}
b66a4574-1917-41f2-b3c5-5dd44e3ee1bc	admin@dixis.gr	Διαχειριστής Συστήματος	$2b$10$lGv68xv0JLgAOrStG2hwpe9pLxHNLntMU0.QaNIYMNBrcAGyZjpnu	ADMIN	\N	t	\N	\N	2025-03-16 06:52:51.302	2025-03-16 06:52:51.302	\N	ACTIVE	0	\N	\N	{}	\N	\N	{}	\N	\N	\N	0	{}
79c7f5a4-1a55-4cf0-a958-b55ec62bc5a4	producer@dixis.gr	Ελαιώνες Μεσσηνίας	$2b$10$kWS/Ms0qpBXtq4rddnMsbe1Fpb3uBu/hkzVRH3mfz8ohKoPzWaOF2	PRODUCER	\N	f	\N	\N	2025-03-16 06:52:51.351	2025-03-16 06:52:51.351	\N	ACTIVE	0	\N	\N	{}	Παραγωγός βιολογικού ελαιόλαδου και ελιών από τη Μεσσηνία	https://i.pravatar.cc/150?u=producer@dixis.gr	{}	Καλαμάτα, Μεσσηνία	\N	\N	0	{}
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wishlist_items (wishlist_id, user_id, product_id, added_at, notes) FROM stdin;
\.


--
-- Name: product_frequently_bought_together_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_frequently_bought_together_id_seq', 1, false);


--
-- Name: abandoned_carts abandoned_carts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT abandoned_carts_pkey PRIMARY KEY (cart_id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (category_id);


--
-- Name: blog_post_categories blog_post_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_pkey PRIMARY KEY (post_id, category_id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (post_id);


--
-- Name: business_customers business_customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_pkey PRIMARY KEY (business_id);


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_item_id);


--
-- Name: categories_on_products categories_on_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_on_products
    ADD CONSTRAINT categories_on_products_pkey PRIMARY KEY (product_id, category_id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: certification_types certification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certification_types
    ADD CONSTRAINT certification_types_pkey PRIMARY KEY (certification_type_id);


--
-- Name: conversion_funnels conversion_funnels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversion_funnels
    ADD CONSTRAINT conversion_funnels_pkey PRIMARY KEY (funnel_id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (campaign_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (invoice_id);


--
-- Name: logs logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs
    ADD CONSTRAINT logs_pkey PRIMARY KEY (log_id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (point_id);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (subscriber_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (history_id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (page_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (payment_id);


--
-- Name: producer_categories producer_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_categories
    ADD CONSTRAINT producer_categories_pkey PRIMARY KEY (producer_id, category_id);


--
-- Name: producer_certifications producer_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_certifications
    ADD CONSTRAINT producer_certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: producer_media producer_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_media
    ADD CONSTRAINT producer_media_pkey PRIMARY KEY (media_id);


--
-- Name: producer_shipping_methods producer_shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_pkey PRIMARY KEY (producer_id, shipping_method_id);


--
-- Name: producers producers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_pkey PRIMARY KEY (producer_id);


--
-- Name: product_attributes product_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (attribute_id);


--
-- Name: product_certifications product_certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_certifications
    ADD CONSTRAINT product_certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: product_frequently_bought_together product_frequently_bought_together_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_frequently_bought_together
    ADD CONSTRAINT product_frequently_bought_together_pkey PRIMARY KEY (id);


--
-- Name: product_media product_media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media
    ADD CONSTRAINT product_media_pkey PRIMARY KEY (media_id);


--
-- Name: product_question_answers product_question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_question_answers
    ADD CONSTRAINT product_question_answers_pkey PRIMARY KEY (answer_id);


--
-- Name: product_questions product_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_pkey PRIMARY KEY (question_id);


--
-- Name: product_sustainability_metrics product_sustainability_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sustainability_metrics
    ADD CONSTRAINT product_sustainability_metrics_pkey PRIMARY KEY (metric_id);


--
-- Name: product_tag_relations product_tag_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tag_relations
    ADD CONSTRAINT product_tag_relations_pkey PRIMARY KEY (product_id, tag_id);


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (tag_id);


--
-- Name: product_variant_attributes product_variant_attributes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_attributes
    ADD CONSTRAINT product_variant_attributes_pkey PRIMARY KEY (attribute_value_id);


--
-- Name: product_variants product_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (variant_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: recently_viewed recently_viewed_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_pkey PRIMARY KEY (view_id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (referral_id);


--
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (refund_id);


--
-- Name: returns returns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_pkey PRIMARY KEY (return_id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (setting_id);


--
-- Name: shipping_methods shipping_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_methods
    ADD CONSTRAINT shipping_methods_pkey PRIMARY KEY (shipping_method_id);


--
-- Name: shipping_rates shipping_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_pkey PRIMARY KEY (rate_id);


--
-- Name: shipping_zones shipping_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_zones
    ADD CONSTRAINT shipping_zones_pkey PRIMARY KEY (zone_id);


--
-- Name: user_events user_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_pkey PRIMARY KEY (event_id);


--
-- Name: user_messages user_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_pkey PRIMARY KEY (message_id);


--
-- Name: user_product_views user_product_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_views
    ADD CONSTRAINT user_product_views_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (wishlist_id);


--
-- Name: blog_categories_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_categories_slug_key ON public.blog_categories USING btree (slug);


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: business_customers_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX business_customers_user_id_key ON public.business_customers USING btree (user_id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: coupons_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX coupons_code_key ON public.coupons USING btree (code);


--
-- Name: invoices_invoice_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invoices_invoice_number_key ON public.invoices USING btree (invoice_number);


--
-- Name: newsletter_subscribers_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX newsletter_subscribers_email_key ON public.newsletter_subscribers USING btree (email);


--
-- Name: orders_order_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number);


--
-- Name: pages_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pages_slug_key ON public.pages USING btree (slug);


--
-- Name: producers_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX producers_user_id_key ON public.producers USING btree (user_id);


--
-- Name: product_frequently_bought_together_product_id_related_produ_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_frequently_bought_together_product_id_related_produ_key ON public.product_frequently_bought_together USING btree (product_id, related_product_id);


--
-- Name: product_sustainability_metrics_product_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_sustainability_metrics_product_id_key ON public.product_sustainability_metrics USING btree (product_id);


--
-- Name: product_tags_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_tags_name_key ON public.product_tags USING btree (name);


--
-- Name: product_tags_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_tags_slug_key ON public.product_tags USING btree (slug);


--
-- Name: product_variants_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_barcode_key ON public.product_variants USING btree (barcode);


--
-- Name: product_variants_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX product_variants_sku_key ON public.product_variants USING btree (sku);


--
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: products_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_slug_key ON public.products USING btree (slug);


--
-- Name: settings_category_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_category_key_key ON public.settings USING btree (category, key);


--
-- Name: user_sessions_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_sessions_token_key ON public.user_sessions USING btree (token);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_referral_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_referral_code_key ON public.users USING btree (referral_code);


--
-- Name: wishlist_items_user_id_product_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX wishlist_items_user_id_product_id_key ON public.wishlist_items USING btree (user_id, product_id);


--
-- Name: abandoned_carts abandoned_carts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.abandoned_carts
    ADD CONSTRAINT abandoned_carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: activities activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: analytics_events analytics_events_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analytics_events
    ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: blog_post_categories blog_post_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(category_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blog_post_categories blog_post_categories_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_post_categories
    ADD CONSTRAINT blog_post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(post_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: blog_posts blog_posts_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: business_customers business_customers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_customers
    ADD CONSTRAINT business_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.abandoned_carts(cart_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cart_items cart_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: categories_on_products categories_on_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_on_products
    ADD CONSTRAINT categories_on_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: categories_on_products categories_on_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories_on_products
    ADD CONSTRAINT categories_on_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: loyalty_points loyalty_points_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: newsletter_subscribers newsletter_subscribers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_items order_items_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: order_status_history order_status_history_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_billing_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.business_customers(business_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_shipping_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_categories producer_categories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_categories
    ADD CONSTRAINT producer_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_categories producer_categories_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_categories
    ADD CONSTRAINT producer_categories_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_certifications producer_certifications_certification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_certifications
    ADD CONSTRAINT producer_certifications_certification_type_id_fkey FOREIGN KEY (certification_type_id) REFERENCES public.certification_types(certification_type_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_certifications producer_certifications_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_certifications
    ADD CONSTRAINT producer_certifications_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_media producer_media_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_media
    ADD CONSTRAINT producer_media_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_shipping_methods producer_shipping_methods_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producer_shipping_methods producer_shipping_methods_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producer_shipping_methods
    ADD CONSTRAINT producer_shipping_methods_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(shipping_method_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: producers producers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producers
    ADD CONSTRAINT producers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_certifications product_certifications_certification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_certifications
    ADD CONSTRAINT product_certifications_certification_type_id_fkey FOREIGN KEY (certification_type_id) REFERENCES public.certification_types(certification_type_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_certifications product_certifications_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_certifications
    ADD CONSTRAINT product_certifications_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_frequently_bought_together product_frequently_bought_together_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_frequently_bought_together
    ADD CONSTRAINT product_frequently_bought_together_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_frequently_bought_together product_frequently_bought_together_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_frequently_bought_together
    ADD CONSTRAINT product_frequently_bought_together_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_media product_media_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_media
    ADD CONSTRAINT product_media_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_question_answers product_question_answers_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_question_answers
    ADD CONSTRAINT product_question_answers_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.producers(producer_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_question_answers product_question_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_question_answers
    ADD CONSTRAINT product_question_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.product_questions(question_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_question_answers product_question_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_question_answers
    ADD CONSTRAINT product_question_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_questions product_questions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_questions product_questions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_questions
    ADD CONSTRAINT product_questions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_sustainability_metrics product_sustainability_metrics_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_sustainability_metrics
    ADD CONSTRAINT product_sustainability_metrics_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_tag_relations product_tag_relations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tag_relations
    ADD CONSTRAINT product_tag_relations_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_tag_relations product_tag_relations_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_tag_relations
    ADD CONSTRAINT product_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.product_tags(tag_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variant_attributes product_variant_attributes_attribute_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_attributes
    ADD CONSTRAINT product_variant_attributes_attribute_id_fkey FOREIGN KEY (attribute_id) REFERENCES public.product_attributes(attribute_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variant_attributes product_variant_attributes_variant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variant_attributes
    ADD CONSTRAINT product_variant_attributes_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(variant_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: product_variants product_variants_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: products products_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recently_viewed recently_viewed_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: recently_viewed recently_viewed_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recently_viewed
    ADD CONSTRAINT recently_viewed_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refunds refunds_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(payment_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: returns returns_order_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: returns returns_refund_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.returns
    ADD CONSTRAINT returns_refund_id_fkey FOREIGN KEY (refund_id) REFERENCES public.refunds(refund_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_orderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT "reviews_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES public.order_items(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_producer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_producer_id_fkey FOREIGN KEY (producer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shipping_rates shipping_rates_shipping_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_shipping_method_id_fkey FOREIGN KEY (shipping_method_id) REFERENCES public.shipping_methods(shipping_method_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: shipping_rates shipping_rates_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipping_rates
    ADD CONSTRAINT shipping_rates_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.shipping_zones(zone_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_events user_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_events
    ADD CONSTRAINT user_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_messages user_messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_messages user_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_product_views user_product_views_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_views
    ADD CONSTRAINT "user_product_views_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_product_views user_product_views_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_product_views
    ADD CONSTRAINT "user_product_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_referred_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wishlist_items wishlist_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

