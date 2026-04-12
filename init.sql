--
-- PostgreSQL database dump
--

\restrict pnTT1OBfA9ZQ8s0AWA3BHcH45GyLd3Fe9gaqb9s6iPPjfyQTiA86dWMTJVERHbE

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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
-- Name: assignmentstatus; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.assignmentstatus AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'CLOSED'
);


ALTER TYPE public.assignmentstatus OWNER TO lms_user;

--
-- Name: coupon_applicability; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.coupon_applicability AS ENUM (
    'all_courses',
    'specific_courses'
);


ALTER TYPE public.coupon_applicability OWNER TO lms_user;

--
-- Name: discount_type; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.discount_type AS ENUM (
    'percentage',
    'fixed'
);


ALTER TYPE public.discount_type OWNER TO lms_user;

--
-- Name: orderstatus; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.orderstatus AS ENUM (
    'PENDING',
    'PROCESSING',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED',
    'FAILED'
);


ALTER TYPE public.orderstatus OWNER TO lms_user;

--
-- Name: paymentstatus; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.paymentstatus AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public.paymentstatus OWNER TO lms_user;

--
-- Name: submissionstatus; Type: TYPE; Schema: public; Owner: lms_user
--

CREATE TYPE public.submissionstatus AS ENUM (
    'SUBMITTED',
    'GRADED',
    'RETURNED'
);


ALTER TYPE public.submissionstatus OWNER TO lms_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.assignment_submissions (
    id integer NOT NULL,
    assignment_id integer NOT NULL,
    user_id integer NOT NULL,
    text_content text,
    files json,
    grade numeric(9,2),
    feedback text,
    status public.submissionstatus NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    graded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.assignment_submissions OWNER TO lms_user;

--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.assignment_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_submissions_id_seq OWNER TO lms_user;

--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.assignment_submissions_id_seq OWNED BY public.assignment_submissions.id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    course_id integer NOT NULL,
    created_by integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    instructions text,
    due_date timestamp with time zone,
    total_points integer,
    allowed_file_types json,
    max_file_size integer,
    max_files integer,
    submission_type character varying(50),
    attachments json,
    status public.assignmentstatus NOT NULL,
    "order" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.assignments OWNER TO lms_user;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO lms_user;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: blog_comments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.blog_comments (
    id integer NOT NULL,
    blog_post_id integer NOT NULL,
    user_id integer NOT NULL,
    content text NOT NULL,
    status character varying(20),
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.blog_comments OWNER TO lms_user;

--
-- Name: blog_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.blog_comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_comments_id_seq OWNER TO lms_user;

--
-- Name: blog_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.blog_comments_id_seq OWNED BY public.blog_comments.id;


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    author_id integer NOT NULL,
    title character varying(500) NOT NULL,
    slug character varying(500) NOT NULL,
    content text NOT NULL,
    excerpt text,
    featured_image character varying(500),
    status character varying(20),
    post_date timestamp without time zone,
    post_modified timestamp without time zone,
    meta_title character varying(500),
    meta_description text,
    category character varying(100),
    tags character varying(500),
    view_count integer,
    comment_count integer,
    created_at timestamp without time zone,
    updated_at timestamp without time zone
);


ALTER TABLE public.blog_posts OWNER TO lms_user;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.blog_posts_id_seq OWNER TO lms_user;

--
-- Name: blog_posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;


--
-- Name: certificate_element_templates; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.certificate_element_templates (
    id integer NOT NULL,
    element_name character varying(255) NOT NULL,
    element_type character varying(50) NOT NULL,
    element_content text,
    element_image_url character varying(500),
    element_styles json,
    default_position_x integer,
    default_position_y integer,
    default_width integer,
    default_height integer,
    is_active boolean,
    usage_count integer,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.certificate_element_templates OWNER TO lms_user;

--
-- Name: certificate_element_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.certificate_element_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificate_element_templates_id_seq OWNER TO lms_user;

--
-- Name: certificate_element_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.certificate_element_templates_id_seq OWNED BY public.certificate_element_templates.id;


--
-- Name: certificate_verifications; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.certificate_verifications (
    id integer NOT NULL,
    certificate_id integer,
    certificate_hash character varying(255) NOT NULL,
    verified_by_ip character varying(45),
    verified_by_user_agent text,
    verification_result character varying(50),
    verified_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.certificate_verifications OWNER TO lms_user;

--
-- Name: certificate_verifications_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.certificate_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificate_verifications_id_seq OWNER TO lms_user;

--
-- Name: certificate_verifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.certificate_verifications_id_seq OWNED BY public.certificate_verifications.id;


--
-- Name: certificates; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.certificates (
    id integer NOT NULL,
    post_author integer NOT NULL,
    post_date timestamp with time zone DEFAULT now(),
    post_content text,
    post_title text NOT NULL,
    post_excerpt text,
    post_status character varying(20),
    post_name character varying(200),
    post_modified timestamp with time zone DEFAULT now(),
    post_parent integer,
    menu_order integer,
    post_type character varying(20),
    certificate_orientation character varying(50),
    certificate_size character varying(50),
    certificate_width integer,
    certificate_height integer,
    background_image character varying(255),
    background_color character varying(7),
    title_font_size integer,
    title_font_color character varying(7),
    title_font_family character varying(100),
    body_font_size integer,
    body_font_color character varying(7),
    body_font_family character varying(100),
    elements_config json,
    show_student_name boolean,
    show_course_name boolean,
    show_completion_date boolean,
    show_certificate_id boolean,
    show_instructor_signature boolean,
    show_admin_signature boolean,
    enable_qr_code boolean,
    qr_code_size integer,
    qr_code_position character varying(50),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.certificates OWNER TO lms_user;

--
-- Name: certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.certificates_id_seq OWNER TO lms_user;

--
-- Name: certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.certificates_id_seq OWNED BY public.certificates.id;


--
-- Name: coupon_course_restrictions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.coupon_course_restrictions (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    course_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.coupon_course_restrictions OWNER TO lms_user;

--
-- Name: coupon_course_restrictions_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.coupon_course_restrictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_course_restrictions_id_seq OWNER TO lms_user;

--
-- Name: coupon_course_restrictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.coupon_course_restrictions_id_seq OWNED BY public.coupon_course_restrictions.id;


--
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.coupon_usage (
    id integer NOT NULL,
    coupon_id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer,
    discount_amount numeric(10,2) NOT NULL,
    used_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.coupon_usage OWNER TO lms_user;

--
-- Name: coupon_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.coupon_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_usage_id_seq OWNER TO lms_user;

--
-- Name: coupon_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.coupon_usage_id_seq OWNED BY public.coupon_usage.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type public.discount_type NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    applicability public.coupon_applicability NOT NULL,
    usage_limit integer,
    usage_count integer,
    per_user_limit integer,
    minimum_purchase_amount numeric(10,2),
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    is_active boolean,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.coupons OWNER TO lms_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO lms_user;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: course_announcements; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_announcements (
    id integer NOT NULL,
    course_id integer NOT NULL,
    post_author integer NOT NULL,
    post_title text NOT NULL,
    post_content text,
    post_excerpt text,
    post_status character varying(20),
    post_date timestamp with time zone DEFAULT now(),
    post_modified timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.course_announcements OWNER TO lms_user;

--
-- Name: course_announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.course_announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_announcements_id_seq OWNER TO lms_user;

--
-- Name: course_announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.course_announcements_id_seq OWNED BY public.course_announcements.id;


--
-- Name: course_categories; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_categories (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    description text,
    parent_id integer,
    term_order integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.course_categories OWNER TO lms_user;

--
-- Name: course_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.course_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_categories_id_seq OWNER TO lms_user;

--
-- Name: course_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.course_categories_id_seq OWNED BY public.course_categories.id;


--
-- Name: course_category_relations; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_category_relations (
    course_id integer NOT NULL,
    category_id integer NOT NULL
);


ALTER TABLE public.course_category_relations OWNER TO lms_user;

--
-- Name: course_certificates; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_certificates (
    id integer NOT NULL,
    course_id integer NOT NULL,
    certificate_id integer NOT NULL,
    required_completion_percentage integer,
    required_quiz_pass boolean,
    required_assignment_pass boolean,
    auto_generate boolean,
    email_to_student boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.course_certificates OWNER TO lms_user;

--
-- Name: course_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.course_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_certificates_id_seq OWNER TO lms_user;

--
-- Name: course_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.course_certificates_id_seq OWNED BY public.course_certificates.id;


--
-- Name: course_reviews; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_reviews (
    id integer NOT NULL,
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    review_title character varying(255),
    review_content text,
    review_status character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.course_reviews OWNER TO lms_user;

--
-- Name: course_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.course_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_reviews_id_seq OWNER TO lms_user;

--
-- Name: course_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.course_reviews_id_seq OWNED BY public.course_reviews.id;


--
-- Name: course_tag_relations; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_tag_relations (
    course_id integer NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE public.course_tag_relations OWNER TO lms_user;

--
-- Name: course_tags; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.course_tags (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    slug character varying(200) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.course_tags OWNER TO lms_user;

--
-- Name: course_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.course_tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.course_tags_id_seq OWNER TO lms_user;

--
-- Name: course_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.course_tags_id_seq OWNED BY public.course_tags.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    post_author integer NOT NULL,
    post_date timestamp with time zone DEFAULT now(),
    post_date_gmt timestamp with time zone DEFAULT now(),
    post_content text,
    post_title text NOT NULL,
    post_excerpt text,
    post_status character varying(20),
    comment_status character varying(20),
    ping_status character varying(20),
    post_password character varying(255),
    post_name character varying(200),
    to_ping text,
    pinged text,
    post_modified timestamp with time zone DEFAULT now(),
    post_modified_gmt timestamp with time zone DEFAULT now(),
    post_content_filtered text,
    post_parent integer,
    guid character varying(255),
    menu_order integer,
    post_type character varying(20),
    post_mime_type character varying(100),
    comment_count integer,
    course_price_type character varying(20),
    course_price numeric(10,2),
    course_sale_price numeric(10,2),
    course_duration character varying(255),
    course_level character varying(50),
    course_category character varying(100),
    course_language character varying(50),
    course_benefits text,
    course_requirements text,
    course_target_audience text,
    course_material_includes text,
    course_thumbnail character varying(255),
    course_cover_image character varying(255),
    course_intro_video character varying(255),
    course_retakes_allowed boolean,
    course_auto_start_next_lesson boolean,
    course_content_drip_type character varying(50),
    certificate_template character varying(255),
    certificate_design json,
    total_enrollments integer,
    average_rating numeric(3,2),
    total_reviews integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    course_sections_meta text DEFAULT ''::text,
    course_type character varying(50) DEFAULT ''::character varying
);


ALTER TABLE public.courses OWNER TO lms_user;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO lms_user;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: earnings; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.earnings (
    earning_id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    order_id integer NOT NULL,
    order_status character varying(50),
    course_price_total numeric(16,2),
    course_price_grand_total numeric(16,2),
    instructor_amount numeric(16,2),
    instructor_rate numeric(16,2),
    admin_amount numeric(16,2),
    admin_rate numeric(16,2),
    commission_type character varying(20),
    deduct_fees_amount numeric(16,2),
    deduct_fees_name character varying(250),
    deduct_fees_type character varying(20),
    process_by character varying(20),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.earnings OWNER TO lms_user;

--
-- Name: earnings_earning_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.earnings_earning_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.earnings_earning_id_seq OWNER TO lms_user;

--
-- Name: earnings_earning_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.earnings_earning_id_seq OWNED BY public.earnings.earning_id;


--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.enrollments (
    id integer NOT NULL,
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer,
    enrollment_date timestamp with time zone DEFAULT now(),
    enrollment_status character varying(50),
    course_progress_percentage integer,
    completed_lessons integer,
    total_lessons integer,
    completed_quizzes integer,
    total_quizzes integer,
    completion_date timestamp with time zone,
    completion_mode character varying(50),
    completion_mode_text text,
    certificate_id character varying(100),
    certificate_url character varying(500),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.enrollments OWNER TO lms_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.enrollments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.enrollments_id_seq OWNER TO lms_user;

--
-- Name: enrollments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.enrollments_id_seq OWNED BY public.enrollments.id;


--
-- Name: instructor_profiles; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.instructor_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    instructor_rating character varying(10),
    instructor_bio text,
    instructor_designation character varying(255),
    profile_completion integer,
    is_approved boolean,
    is_blocked boolean,
    earning_commission_type character varying(20),
    earning_commission_amount character varying(20),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.instructor_profiles OWNER TO lms_user;

--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.instructor_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructor_profiles_id_seq OWNER TO lms_user;

--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.instructor_profiles_id_seq OWNED BY public.instructor_profiles.id;


--
-- Name: instructor_reviews; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.instructor_reviews (
    id integer NOT NULL,
    course_id integer NOT NULL,
    instructor_id integer NOT NULL,
    student_id integer NOT NULL,
    rating integer NOT NULL,
    review_title character varying(255),
    review_content text NOT NULL,
    is_private boolean,
    is_read boolean,
    instructor_response text,
    response_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.instructor_reviews OWNER TO lms_user;

--
-- Name: instructor_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.instructor_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.instructor_reviews_id_seq OWNER TO lms_user;

--
-- Name: instructor_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.instructor_reviews_id_seq OWNED BY public.instructor_reviews.id;


--
-- Name: issued_certificates; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.issued_certificates (
    id integer NOT NULL,
    certificate_id integer NOT NULL,
    course_id integer NOT NULL,
    user_id integer NOT NULL,
    certificate_hash character varying(255) NOT NULL,
    secure_certificate_id character varying(100) NOT NULL,
    certificate_title character varying(255) NOT NULL,
    certificate_content text,
    completion_date timestamp with time zone NOT NULL,
    course_completion_percentage numeric(5,2),
    quiz_completion_percentage numeric(5,2),
    assignment_completion_percentage numeric(5,2),
    certificate_file_path character varying(500),
    certificate_download_url character varying(500),
    is_valid boolean,
    expires_at timestamp with time zone,
    invalidated_date timestamp with time zone,
    invalidation_reason text,
    email_sent boolean,
    email_sent_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.issued_certificates OWNER TO lms_user;

--
-- Name: issued_certificates_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.issued_certificates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issued_certificates_id_seq OWNER TO lms_user;

--
-- Name: issued_certificates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.issued_certificates_id_seq OWNED BY public.issued_certificates.id;


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.lesson_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer NOT NULL,
    enrollment_id integer NOT NULL,
    progress_status character varying(50),
    completion_date timestamp with time zone,
    video_current_time integer,
    video_total_duration integer,
    video_completion_percentage integer,
    reading_time integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.lesson_progress OWNER TO lms_user;

--
-- Name: lesson_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.lesson_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesson_progress_id_seq OWNER TO lms_user;

--
-- Name: lesson_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.lesson_progress_id_seq OWNED BY public.lesson_progress.id;


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.lessons (
    id integer NOT NULL,
    post_author integer NOT NULL,
    post_date timestamp with time zone DEFAULT now(),
    post_content text,
    post_title text NOT NULL,
    post_excerpt text,
    post_status character varying(20),
    post_name character varying(200),
    post_modified timestamp with time zone DEFAULT now(),
    post_parent integer NOT NULL,
    menu_order integer,
    post_type character varying(20),
    lesson_video_source character varying(50),
    lesson_video_url character varying(255),
    lesson_youtube_url character varying(255),
    lesson_video_duration character varying(50),
    lesson_video_poster character varying(255),
    lesson_attachments text,
    lesson_preview boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    lesson_attachment_url text DEFAULT ''::text
);


ALTER TABLE public.lessons OWNER TO lms_user;

--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.lessons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lessons_id_seq OWNER TO lms_user;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    course_id integer NOT NULL,
    order_item_name text NOT NULL,
    order_item_type character varying(200),
    quantity integer,
    subtotal numeric(13,4),
    subtotal_tax numeric(13,4),
    total numeric(13,4),
    total_tax numeric(13,4),
    product_data json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.order_items OWNER TO lms_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO lms_user;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    order_key character varying(255) NOT NULL,
    order_status public.orderstatus,
    currency character varying(3),
    total_amount numeric(13,4),
    subtotal_amount numeric(13,4),
    tax_amount numeric(13,4),
    shipping_amount numeric(13,4),
    discount_amount numeric(13,4),
    payment_method character varying(255),
    payment_method_title character varying(255),
    transaction_id character varying(255),
    billing_first_name character varying(255),
    billing_last_name character varying(255),
    billing_company character varying(255),
    billing_address_1 character varying(255),
    billing_address_2 character varying(255),
    billing_city character varying(255),
    billing_state character varying(255),
    billing_postcode character varying(20),
    billing_country character varying(2),
    billing_email character varying(255),
    billing_phone character varying(20),
    customer_note text,
    order_notes text,
    date_created timestamp with time zone DEFAULT now(),
    date_modified timestamp with time zone,
    date_paid timestamp with time zone,
    date_completed timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.orders OWNER TO lms_user;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO lms_user;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    payment_method character varying(50) NOT NULL,
    gateway_transaction_id character varying(255),
    gateway_payment_id character varying(255),
    gateway_order_id character varying(255),
    amount numeric(13,4) NOT NULL,
    currency character varying(3),
    payment_status public.paymentstatus,
    gateway_response json,
    failure_reason text,
    payment_date timestamp with time zone DEFAULT now(),
    processed_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payments OWNER TO lms_user;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO lms_user;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: quiz_attempt_answers; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_attempt_answers (
    attempt_answer_id integer NOT NULL,
    user_id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_id integer NOT NULL,
    quiz_attempt_id integer NOT NULL,
    given_answer text,
    question_mark numeric(8,2),
    achieved_mark numeric(8,2),
    minus_mark numeric(8,2),
    is_correct boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quiz_attempt_answers OWNER TO lms_user;

--
-- Name: quiz_attempt_answers_attempt_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.quiz_attempt_answers_attempt_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempt_answers_attempt_answer_id_seq OWNER TO lms_user;

--
-- Name: quiz_attempt_answers_attempt_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.quiz_attempt_answers_attempt_answer_id_seq OWNED BY public.quiz_attempt_answers.attempt_answer_id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_attempts (
    attempt_id integer NOT NULL,
    course_id integer NOT NULL,
    quiz_id integer NOT NULL,
    user_id integer NOT NULL,
    total_questions integer,
    total_answered_questions integer,
    total_marks numeric(9,2),
    earned_marks numeric(9,2),
    attempt_info json,
    attempt_status character varying(50),
    attempt_ip character varying(250),
    attempt_started_at timestamp with time zone DEFAULT now(),
    attempt_ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quiz_attempts OWNER TO lms_user;

--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.quiz_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNER TO lms_user;

--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.quiz_attempts_attempt_id_seq OWNED BY public.quiz_attempts.attempt_id;


--
-- Name: quiz_question_answers; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_question_answers (
    answer_id integer NOT NULL,
    belongs_question_id integer NOT NULL,
    belongs_question_type character varying(250),
    answer_title text NOT NULL,
    is_correct boolean,
    image_id integer,
    answer_two_gap_match text,
    answer_view_format character varying(250),
    answer_settings json,
    answer_order integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quiz_question_answers OWNER TO lms_user;

--
-- Name: quiz_question_answers_answer_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.quiz_question_answers_answer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_question_answers_answer_id_seq OWNER TO lms_user;

--
-- Name: quiz_question_answers_answer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.quiz_question_answers_answer_id_seq OWNED BY public.quiz_question_answers.answer_id;


--
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quiz_questions (
    question_id integer NOT NULL,
    quiz_id integer NOT NULL,
    question_title text NOT NULL,
    question_description text,
    answer_explanation text,
    question_type character varying(50) NOT NULL,
    question_mark numeric(9,2),
    question_settings json,
    question_order integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quiz_questions OWNER TO lms_user;

--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.quiz_questions_question_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_questions_question_id_seq OWNER TO lms_user;

--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.quiz_questions_question_id_seq OWNED BY public.quiz_questions.question_id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    post_author integer NOT NULL,
    post_date timestamp with time zone DEFAULT now(),
    post_content text,
    post_title text NOT NULL,
    post_excerpt text,
    post_status character varying(20),
    post_name character varying(200),
    post_modified timestamp with time zone DEFAULT now(),
    post_parent integer NOT NULL,
    menu_order integer,
    post_type character varying(20),
    quiz_time_limit integer,
    quiz_feedback_mode character varying(50),
    quiz_max_questions_for_take integer,
    quiz_max_attempts_allowed integer,
    quiz_passing_grade integer,
    quiz_question_layout_view character varying(50),
    quiz_questions_order character varying(50),
    quiz_hide_quiz_details boolean,
    quiz_hide_quiz_time_display boolean,
    quiz_auto_start boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quizzes OWNER TO lms_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO lms_user;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: student_course_activities; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.student_course_activities (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer,
    quiz_id integer,
    activity_type character varying(50) NOT NULL,
    activity_value text,
    activity_status character varying(50),
    activity_meta json,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.student_course_activities OWNER TO lms_user;

--
-- Name: student_course_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.student_course_activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_course_activities_id_seq OWNER TO lms_user;

--
-- Name: student_course_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.student_course_activities_id_seq OWNED BY public.student_course_activities.id;


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.user_profiles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    first_name character varying(255),
    last_name character varying(255),
    description text,
    phone character varying(20),
    designation character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    country character varying(100),
    postal_code character varying(20),
    profile_photo character varying(255),
    cover_photo character varying(255),
    facebook character varying(255),
    twitter character varying(255),
    linkedin character varying(255),
    website character varying(255),
    show_email boolean,
    receive_notifications boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_profiles OWNER TO lms_user;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.user_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_profiles_id_seq OWNER TO lms_user;

--
-- Name: user_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.user_profiles_id_seq OWNED BY public.user_profiles.id;


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO lms_user;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_roles_id_seq OWNER TO lms_user;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    user_login character varying(60) NOT NULL,
    user_pass character varying(255) NOT NULL,
    user_nicename character varying(50) NOT NULL,
    user_email character varying(100) NOT NULL,
    user_url character varying(100),
    user_registered timestamp with time zone DEFAULT now(),
    user_activation_key character varying(255),
    user_status integer,
    display_name character varying(250) NOT NULL,
    role character varying(50),
    is_active boolean,
    is_verified boolean,
    profile_completed boolean,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO lms_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO lms_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_progress; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.video_progress (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    lesson_id integer NOT NULL,
    watched_seconds double precision DEFAULT 0 NOT NULL,
    total_seconds double precision,
    is_completed boolean DEFAULT false NOT NULL,
    last_watched_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.video_progress OWNER TO lms_user;

--
-- Name: video_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.video_progress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_progress_id_seq OWNER TO lms_user;

--
-- Name: video_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.video_progress_id_seq OWNED BY public.video_progress.id;


--
-- Name: wishlist_items; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.wishlist_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    course_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wishlist_items OWNER TO lms_user;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.wishlist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wishlist_items_id_seq OWNER TO lms_user;

--
-- Name: wishlist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.wishlist_items_id_seq OWNED BY public.wishlist_items.id;


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: lms_user
--

CREATE TABLE public.withdrawals (
    withdraw_id integer NOT NULL,
    user_id integer NOT NULL,
    amount numeric(16,2) NOT NULL,
    method_data json,
    status character varying(50),
    reject_detail text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.withdrawals OWNER TO lms_user;

--
-- Name: withdrawals_withdraw_id_seq; Type: SEQUENCE; Schema: public; Owner: lms_user
--

CREATE SEQUENCE public.withdrawals_withdraw_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawals_withdraw_id_seq OWNER TO lms_user;

--
-- Name: withdrawals_withdraw_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: lms_user
--

ALTER SEQUENCE public.withdrawals_withdraw_id_seq OWNED BY public.withdrawals.withdraw_id;


--
-- Name: assignment_submissions id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions ALTER COLUMN id SET DEFAULT nextval('public.assignment_submissions_id_seq'::regclass);


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: blog_comments id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_comments ALTER COLUMN id SET DEFAULT nextval('public.blog_comments_id_seq'::regclass);


--
-- Name: blog_posts id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);


--
-- Name: certificate_element_templates id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_element_templates ALTER COLUMN id SET DEFAULT nextval('public.certificate_element_templates_id_seq'::regclass);


--
-- Name: certificate_verifications id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_verifications ALTER COLUMN id SET DEFAULT nextval('public.certificate_verifications_id_seq'::regclass);


--
-- Name: certificates id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificates ALTER COLUMN id SET DEFAULT nextval('public.certificates_id_seq'::regclass);


--
-- Name: coupon_course_restrictions id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_course_restrictions ALTER COLUMN id SET DEFAULT nextval('public.coupon_course_restrictions_id_seq'::regclass);


--
-- Name: coupon_usage id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_usage ALTER COLUMN id SET DEFAULT nextval('public.coupon_usage_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: course_announcements id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_announcements ALTER COLUMN id SET DEFAULT nextval('public.course_announcements_id_seq'::regclass);


--
-- Name: course_categories id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_categories ALTER COLUMN id SET DEFAULT nextval('public.course_categories_id_seq'::regclass);


--
-- Name: course_certificates id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_certificates ALTER COLUMN id SET DEFAULT nextval('public.course_certificates_id_seq'::regclass);


--
-- Name: course_reviews id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_reviews ALTER COLUMN id SET DEFAULT nextval('public.course_reviews_id_seq'::regclass);


--
-- Name: course_tags id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tags ALTER COLUMN id SET DEFAULT nextval('public.course_tags_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: earnings earning_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.earnings ALTER COLUMN earning_id SET DEFAULT nextval('public.earnings_earning_id_seq'::regclass);


--
-- Name: enrollments id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments ALTER COLUMN id SET DEFAULT nextval('public.enrollments_id_seq'::regclass);


--
-- Name: instructor_profiles id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_profiles ALTER COLUMN id SET DEFAULT nextval('public.instructor_profiles_id_seq'::regclass);


--
-- Name: instructor_reviews id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_reviews ALTER COLUMN id SET DEFAULT nextval('public.instructor_reviews_id_seq'::regclass);


--
-- Name: issued_certificates id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates ALTER COLUMN id SET DEFAULT nextval('public.issued_certificates_id_seq'::regclass);


--
-- Name: lesson_progress id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress ALTER COLUMN id SET DEFAULT nextval('public.lesson_progress_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: quiz_attempt_answers attempt_answer_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers ALTER COLUMN attempt_answer_id SET DEFAULT nextval('public.quiz_attempt_answers_attempt_answer_id_seq'::regclass);


--
-- Name: quiz_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.quiz_attempts_attempt_id_seq'::regclass);


--
-- Name: quiz_question_answers answer_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_question_answers ALTER COLUMN answer_id SET DEFAULT nextval('public.quiz_question_answers_answer_id_seq'::regclass);


--
-- Name: quiz_questions question_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_questions ALTER COLUMN question_id SET DEFAULT nextval('public.quiz_questions_question_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: student_course_activities id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities ALTER COLUMN id SET DEFAULT nextval('public.student_course_activities_id_seq'::regclass);


--
-- Name: user_profiles id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_profiles ALTER COLUMN id SET DEFAULT nextval('public.user_profiles_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_progress id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress ALTER COLUMN id SET DEFAULT nextval('public.video_progress_id_seq'::regclass);


--
-- Name: wishlist_items id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.wishlist_items ALTER COLUMN id SET DEFAULT nextval('public.wishlist_items_id_seq'::regclass);


--
-- Name: withdrawals withdraw_id; Type: DEFAULT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN withdraw_id SET DEFAULT nextval('public.withdrawals_withdraw_id_seq'::regclass);


--
-- Data for Name: assignment_submissions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.assignment_submissions (id, assignment_id, user_id, text_content, files, grade, feedback, status, submitted_at, graded_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.assignments (id, course_id, created_by, title, description, instructions, due_date, total_points, allowed_file_types, max_file_size, max_files, submission_type, attachments, status, "order", created_at, updated_at) FROM stdin;
7	11	4	Assignment -1 | HTML	Build a strong foundation in website structure, elements, and semantic markup.	🧩 Assignments:\n\n1.Create Your First Webpage\nBuild a simple webpage titled “My First HTML Page” with heading, paragraph, and image.\n\n2.Personal Profile Page\nDesign an HTML page about yourself with headings, paragraphs, lists (skills, hobbies), and links.\n\n3.Contact Form\nCreate a contact form with fields: Name, Email, Message, and a Submit button (no backend needed).\n\n4.Product Table\nDesign a product listing table with 3 columns – Product Name, Price, and Category.\n\n5.Navigation Menu\nCreate a basic navbar using <a> links for Home, About, and Contact.\n\n6.Submit the Assignment as .HTML file only	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-03-27 12:14:35.473588+00	2026-03-27 12:14:35.473588+00
2	10	4	Assignment -1 | HTML	🎯 Objective:\nBuild a strong foundation in website structure, elements, and semantic markup.	🧩 Assignments:\n\n1. Create Your First Webpage\nBuild a simple webpage titled “My First HTML Page” with heading, paragraph, and image.\n\n2. Personal Profile Page\nDesign an HTML page about yourself with headings, paragraphs, lists (skills, hobbies), and links.\n\n3. Contact Form\nCreate a contact form with fields: Name, Email, Message, and a Submit button (no backend needed).\n\n4. Product Table\nDesign a product listing table with 3 columns – Product Name, Price, and Category.\n\n5. Navigation Menu\nCreate a basic navbar using <a> links for Home, About, and Contact.\n\nSubmit the Assignment as .HTML file only	\N	10	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	2	both	"[]"	PUBLISHED	0	2026-03-26 19:19:32.14378+00	2026-03-26 19:26:46.837027+00
3	10	4	CSS | Assignment	🎯 Objective:\n\nStyle HTML pages using colors, fonts, layout systems (Flexbox & Grid), and responsive design.	🧩 Assignments:\n\n1. Apply Styling to Your Profile Page\nAdd background color, padding, and custom fonts using internal CSS.\n\n2. External CSS File\nCreate a styles.css file and link it to your HTML pages. Apply consistent design across all pages.\n\n3. Flexbox Layout\nRedesign your product list using a Flexbox container with evenly spaced product cards.\n\n4. Grid Layout\nCreate a 3-column layout with sections for sidebar, content, and footer.\n\n5. Media Queries\nMake your profile page responsive for mobile, tablet, and desktop breakpoints.\n\nSubmit Your Assignment after adding the style sheet with your HTML page as separate the files and upload as ZIP 	\N	10	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	2	both	"[]"	PUBLISHED	0	2026-03-26 21:43:18.723547+00	2026-03-26 21:43:18.723547+00
4	10	4	GIT (assignment)	🎯 Objective:\n\nLearn version control, commits, branches, and collaboration using GitHub.	🧩 Assignments:\n\n1. Initialize Git Repository\nRun git init in your project folder and connect it to your local code.\n\n2. First Commit\nStage and commit your HTML, CSS, and JS files with a proper commit message.\n\n3. GitHub Upload\nCreate a GitHub repository and push your project.\n\n4. Branching Task\nCreate a new branch feature-ui and add a new section to your project. Merge it into main.\n\n5. Collaboration Simulation\nFork a classmate’s repository, make small design changes, and open a pull request.	\N	10	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	2	both	"[]"	PUBLISHED	0	2026-03-26 23:28:02.192403+00	2026-03-26 23:28:02.192403+00
6	12	4	Build a Basic React To-Do App (ASSIGNMENT)	You are required to build a simple To-Do Application using React.js.\nThe app should allow users to:\n\nAdd new tasks\nDisplay the list of tasks\nMark tasks as completed\nDelete tasks	The project must use component-based architecture and follow React best practices.\n\nYour application must contain at least three components, such as:\n\nTodoInput.jsx – for entering new tasks\n\nTodoList.jsx – for displaying all tasks\n\nTodoItem.jsx – for handling individual tasks\n\nApp.jsx – the main component where the state is managed\n\nThe main application should store all tasks using React state and pass data using props to child components.\n\nExpected Project Features\n\nYour application should include the following:\n\n1. Add Task\n\nUser types a task in an input field\n\nClicking “Add” or pressing Enter should add the task to the task list\n\n2. Display Tasks\n\nAll tasks must be shown in a clean list format\n\nEach task should display the task name\n\n3. Mark Task as Completed\n\nClicking a task should toggle its completed state\n\nCompleted tasks must show a line-through styling\n\n4. Delete Task\n\nEach task must include a delete button\n\nClicking the delete button should remove the task from the list\n\n5. Use React Concepts Properly\n\nYour solution must include:\n\nuseState hook\nMultiple components\nProps for passing data\nFunctions for event handling\nList rendering using .map()	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-03-27 11:33:26.554176+00	2026-03-27 11:33:26.554176+00
9	11	4	CSS | Assignment	Style HTML pages using colors, fonts, layout systems (Flexbox & Grid), and responsive design.	🧩 Assignments:\n\nApply Styling to Your Profile Page\nAdd background color, padding, and custom fonts using internal CSS.\n\nExternal CSS File\nCreate a styles.css file and link it to your HTML pages. Apply consistent design across all pages.\n\nFlexbox Layout\nRedesign your product list using a Flexbox container with evenly spaced product cards.\n\nGrid Layout\nCreate a 3-column layout with sections for sidebar, content, and footer.\n\nMedia Queries\nMake your profile page responsive for mobile, tablet, and desktop breakpoints.\n\nSubmit Your Assignment after adding the style sheet with your HTML page as separate the files and upload as ZIP 	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-02 04:50:48.684287+00	2026-04-02 04:50:48.684287+00
10	11	4	GIT (assignment)	Learn version control, commits, branches, and collaboration using GitHub	🎯 Objective:\n\nLearn version control, commits, branches, and collaboration using GitHub.\n\n🧩 Assignments:\n\nInitialize Git Repository\nRun git init in your project folder and connect it to your local code.\n\nFirst Commit\nStage and commit your HTML, CSS, and JS files with a proper commit message.\n\nGitHub Upload\nCreate a GitHub repository and push your project.\n\nBranching Task\nCreate a new branch feature-ui and add a new section to your project. Merge it into main.\n\nCollaboration Simulation\nFork a classmate’s repository, make small design changes, and open a pull request.	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-02 07:06:47.678886+00	2026-04-02 07:06:47.678886+00
13	10	4	Portfolio | (complete assignment)	Create a script that shows a welcome alert when the page loads.	🧩 Assignments:\n\nJavaScript Introduction\nCreate a script that shows a welcome alert when the page loads.\n\nForm Validation\nAdd validation to your contact form – check if all fields are filled before submission.\n\nDynamic Greeting\nDisplay a personalized greeting message based on the current time (Morning/Afternoon/Evening).\n\nInteractive Counter\nBuild a counter with + and – buttons that update a number in real time.\n\nDOM Manipulation\nAdd a button that changes the color of a text element when clicked.\nGet me the Full site Portfolio as assignement	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-02 15:48:42.686705+00	2026-04-02 15:48:42.686705+00
15	11	4	GIT (assignment)	Learn version control, commits, branches, and collaboration using GitHub.	🎯 Objective:\n\nLearn version control, commits, branches, and collaboration using GitHub.\n\n🧩 Assignments:\n\nInitialize Git Repository\nRun git init in your project folder and connect it to your local code.\n\nFirst Commit\nStage and commit your HTML, CSS, and JS files with a proper commit message.\n\nGitHub Upload\nCreate a GitHub repository and push your project.\n\nBranching Task\nCreate a new branch feature-ui and add a new section to your project. Merge it into main.\n\nCollaboration Simulation\nFork a classmate’s repository, make small design changes, and open a pull request.	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-03 11:22:57.030481+00	2026-04-03 11:22:57.030481+00
16	11	4	🎓 Final Assignment: AI-Integrated Portfolio Development	Build a fully responsive portfolio website that reflects your personality, skills, and projects. The site must be coded using HTML, CSS, and JavaScript, and must include AI-generated components or styling suggestions integrated thoughtfully.	🧩 Assignment Guidelines\nComponent\tDetails\nTitle\tAI-Assisted Full-Stack Portfolio Website\nDescription\tBuild a fully responsive portfolio website that reflects your personality, skills, and projects. The site must be coded using HTML, CSS, and JavaScript, and must include AI-generated components or styling suggestions integrated thoughtfully.\nDesign Freedom\tStudents can choose their own design theme (e.g., minimalist, futuristic, cyberpunk, professional, dark mode, etc.).\nMandatory Pages\t1️⃣ Home\n2️⃣ About Me\n3️⃣ Projects\n4️⃣ Contact\n(Bonus: Resume / Blog section optional)\nAI Integration Requirement\tUse at least two AI tools taught in the course (e.g., Gemini for layout, Codeium for optimization, ChatGPT for debugging, or Claude for documentation). Clearly document which AI tools were used and how.\nTechnical Requirements\t- Use HTML5 semantic structure\n- Apply CSS Flexbox or Grid for layout\n- Add JavaScript interactivity (e.g., form validation, dynamic greetings, theme toggle)\n- Include GitHub link or Vercel deployment link\n- Include at least one API (e.g., weather, quotes, or contact form API)\nDocumentation Format\tSubmit a Word document (.docx) containing:\n- Project Overview\n- Tools and Technologies Used\n- AI Tools Used (with screenshots of prompts and outputs)\n- Git Commands Summary\n- Deployment Steps\n- Reflection (What did you learn?)\nSubmission Format\tCompress the following into one .zip file (≤ 2 MB):\n📁 /portfolio-code/ – HTML, CSS, JS, assets\n📄 project-documentation.docx – formatted report\nFile Naming Format\tFullStackAI_[StudentName]_Portfolio.zip\n🧠 Evaluation Criteria\nCategory\tWeightage\tDescription\nFunctionality\t25%\tCorrect implementation of HTML, CSS, JS, and API integration\nDesign Aesthetics\t15%\tCreativity, responsiveness, and visual appeal\nAI Integration\t25%\tUse of AI tools to enhance code, documentation, or content\nDocumentation Quality\t20%\tProper formatting, explanation, and screenshots\nVersion Control & Hosting\t15%\tUse of Git/GitHub and successful live deployment	\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-03 11:36:03.912163+00	2026-04-03 11:36:03.912163+00
17	9	4	Practice assignment	Download the attached Excel file, complete all tasks, and upload the completed file here.		\N	100	"[\\".pdf\\", \\".doc\\", \\".docx\\", \\".zip\\"]"	10	5	both	"[]"	PUBLISHED	0	2026-04-03 11:43:56.591379+00	2026-04-03 11:43:56.591379+00
\.


--
-- Data for Name: blog_comments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.blog_comments (id, blog_post_id, user_id, content, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.blog_posts (id, author_id, title, slug, content, excerpt, featured_image, status, post_date, post_modified, meta_title, meta_description, category, tags, view_count, comment_count, created_at, updated_at) FROM stdin;
15	4	Linear Equation in 2 variables	linear-equation-in-2-variables	<!-- wp:paragraph --><br><p>Lets Play:<br><strong>The father’s age is six times his son’s age. Six years hence the age of the father will be<br>four times that of his son's age. Find the present ages (in years) of the son and father.</strong><br>In this we can take two variables father’s age and the son’s age<br><strong>STEP 1:</strong><br>● Let's take the present age of both the father’s age as x and the son’s age as y :<br>x = 6y -------- (1) (father’s age is six times his son’s age)<br>After six years,<br>x = 4y ----------- (2) (the age of the father will be four times that of his son age)<br><strong>STEP 2</strong><br>● lets combine both the equations top form a resulting equation.<br>x + 6 = 4(y + 6)<br>x - 4y = 18 —--------- (3)<br><strong>STEP 3:</strong><br>● Substitute equation 1 in 3<br>6y - 4y = 18<br>2y = 18<br>y = 9<br>● Sub y = 9 in eqn 1<br>So x = 6(9)<br>X = 54<br><strong>Hence, The present age of the father is 54 and the present age of the son is 9.</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>TIPS FOR TRICKS:</strong> If you doubt whether it is an answer or not put the value of x and y in equations 1<br>and 2 it will perfectly equate otherwise it won’t be an answer</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>Lets Play:<br><strong>The father’s age is six times his son’s age. Six years hence the age of the father will be<br>four times that of his son's age. Find the present ages (i	\N	PUBLISHED	2024-12-12 17:11:00	2026-04-08 09:01:59.900659	\N	\N	\N	\N	2	\N	2026-04-08 01:10:45.118913	2026-04-08 09:01:59.900664
2	4	Transforming Math Education: Innovative Approaches for a Brighter Future	transforming-math-education-innovative-approaches-for-a-brighter-future	<!-- wp:image {"lightbox":{"enabled":false},"id":98,"sizeSlug":"full","linkDestination":"custom"} --><br><figure class="wp-block-image size-full"><a href="https://sashainfinity.com/"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/09/Designer.jpg" alt="" class="wp-image-98"/></a><figcaption class="wp-element-caption">Students getting benefited from VR &amp; AR Especially when it comes to mathematics</figcaption></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph {"style":{"color":{"background":"#050a30"},"elements":{"link":{"color":{"text":"var:preset|color|base-3"}}}},"textColor":"base-3"} --><br><p class="has-base-3-color has-text-color has-background has-link-color" style="background-color:#050a30">Augmented reality (AR) and virtual reality (VR) technologies are game-changers in education, offering immersive experiences that bring abstract mathematical concepts to life. Imagine students exploring geometric shapes in a 3D space or visualizing complex equations through interactive simulations. These technologies allow learners to engage with math in a way that traditional methods cannot match.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"style":{"elements":{"link":{"color":{"text":"#050a30"}}},"color":{"text":"#050a30"}}} --><br><p class="has-text-color has-link-color" style="color:#050a30"><strong>Overcoming Math Anxiety with Innovative Teaching Methods</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Math anxiety is a common barrier that many students face, leading to a lack of confidence and engagement. To combat this, educators can implement hands-on activities, collaborative problem-solving sessions, and positive reinforcement techniques. By creating a supportive learning environment where mistakes are viewed as opportunities for growth, teachers can help students overcome their fears and develop a love for math.</p><br><!-- /wp:paragraph --></p><p><!-- wp:generateblocks/container {"uniqueId":"d953afb4","isDynamic":true,"blockVersion":4} --><br><!-- wp:generateblocks/container {"uniqueId":"6303dec8","isDynamic":true,"blockVersion":4} --><br><!-- wp:image {"lightbox":{"enabled":false},"id":99,"width":"234px","height":"auto","sizeSlug":"full","linkDestination":"custom"} --><br><figure class="wp-block-image size-full is-resized"><a href="https://sashainfinity.com/"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/09/Designer-2.jpg" alt="" class="wp-image-99" style="width:234px;height:auto"/></a></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph {"style":{"color":{"background":"#050a30"},"elements":{"link":{"color":{"text":"var:preset|color|base-3"}}}},"textColor":"base-3"} --><br><p class="has-base-3-color has-text-color has-background has-link-color" style="background-color:#050a30">Hybrid learning models combine online resources with traditional classroom instruction, catering to diverse learning styles. This flexible approach allows students to learn at their own pace while still benefiting from face-to-face interactions with educators. By integrating technology into the learning process, we can create a more personalized educational experience that meets the needs of every student.</p><br><!-- /wp:paragraph --><br><!-- /wp:generateblocks/container --><br><!-- /wp:generateblocks/container --></p><p><!-- wp:generateblocks/headline {"uniqueId":"132144cb","element":"p","blockVersion":3,"display":"block","typography":{"fontWeight":"600","textTransform":"uppercase"},"backgroundColor":"var(\\\\u002d\\\\u002dbase-3)","textColor":"#050A30"} --><br><p class="gb-headline gb-headline-132144cb gb-headline-text"><strong><em>Practical Applications of Mathematics in Daily Life</em></strong></p><br><!-- /wp:generateblocks/headline --></p><p><!-- wp:paragraph --><br><p>One effective way to make math more relatable is by highlighting its practical applications in everyday life. From budgeting to cooking, math is an integral part of our daily activities. By showing students how math skills are used outside the classroom, we can foster a deeper appreciation for the subject and encourage them to apply their knowledge in real-world situations.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>at <a href="https://sashainfinity.com/" data-type="link" data-id="https://sashainfinity.com/">Sashainfinity,</a> we have witnessed numerous success stories from our innovative programs. From students who have overcome their fear of math to those who have excelled academically through personalized instruction, these stories serve as powerful testimonials to the impact of our approach. Sharing these experiences not only inspires others but also highlights the effectiveness of our methodologies.</p><br><!-- /wp:paragraph --></p><p><!-- wp:generateblocks/headline {"uniqueId":"a6d5b482","element":"p","blockVersion":3,"textColor":"#050a30"} --><br><p class="gb-headline gb-headline-a6d5b482 gb-headline-text"><strong><em>Conclusion</em></strong></p><br><!-- /wp:generateblocks/headline --></p><p><!-- wp:paragraph --><br><p>Transforming math education requires creativity, innovation, and collaboration. At Sashainfinity, we are dedicated to reshaping how mathematics is taught by integrating technology and fostering supportive learning environments. By embracing these innovative approaches, we can inspire confidence in our students and empower them to become the mathematicians of tomorrow. Join us on this journey as we work towards making math education engaging and accessible for all!&nbsp;This blog aims to provide valuable insights into innovative approaches to math education while promoting Sashainfinity's mission. By incorporating relevant images alongside each section, it enhances visual appeal and aids reader comprehension.</p><br><!-- /wp:paragraph -->	<!-- wp:image {"lightbox":{"enabled":false},"id":98,"sizeSlug":"full","linkDestination":"custom"} -->\\n<figure class="wp-block-image size-full"><a href="https://sashainfinity.com/"><img src="https://b	\N	PUBLISHED	2024-09-03 12:51:09	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
29	556	Ai Era 	ai-era	Ai is gtrowing rapidly at the current trate	Ai is gtrowing rapidly at the current trate...	https://lms.sashainfinity.com/uploads/images/38141613-368d-45fd-83f9-f89f68a37ff4.png	PUBLISHED	2026-04-08 09:03:01.777426	2026-04-08 09:18:00.398926	Ai Era 	Ai is gtrowing rapidly at the current trate...	News	#ai	4	0	2026-04-08 09:03:01.777433	2026-04-08 09:18:00.39893
3	4	Addition and Subtraction of Integers:	addition-and-subtraction-of-integers	<!-- wp:paragraph --><br><p><strong>Let’s take a moment to overview integers:</strong><br>➢ Just Imagine you are playing a game where you can win or lose<br>points.<br>➢ If you win, you get +5 or +10 points. But if you lose a game, you<br>lose your points likes -5 or -10.<br>➢ These numbers, both positive and negative are called Integers.<br>➢ They help us to keep track of gains and losses in real life, just like<br>in the game!<br>➢ It is a key idea in mathematics, integers are the collection of entire<br>numbers that can be zero, positive, or negative.<br>➢ They are represented by the letter Z, which is derived from the<br>German word "Zahlen," which means "number”.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Example for Integer</strong>: lets consider a set of integers which is represented as Z<br>Z= {…,-3,-3,-1,0,1,2,3,…}</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Zero</strong>: Zero (0) is neutral; it is neither positive nor negative.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Positive Integers</strong>: Z= {1, 2, 3, …}</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Negative Integers</strong>: Z= {-1, -2, -3 ,…}</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>1)Closure under Addition:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>For any two integers a and b, a + b is an integers.</strong><br>Let us see whether this property is true for integers or not.<br>Statement Observation<br>(i) 17 + 23 = 40 <strong><em><strong><em>___</em></strong></em></strong><br>(ii) (-10) + 3 = -7 <strong><em><strong><em>___</em></strong></em></strong><br>(iii) (-20) + 0 = <em>_ <strong><em><strong>____</strong></em></strong></em><br>(iv) 3 + (-5) = -2 <strong><em><strong><em>___</em></strong></em></strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>2)Closure under Subtraction:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>For any two integers a and b, a – b is an integers.</strong><br>What happens when we subtract an integer from another integer? Can we<br>say that their difference is also an integer?<br>Statement Observation<br>(i) 7 - 9 = -2 <strong><em><strong><em>____</em></strong></em></strong><br>(ii) (-10) - (-3) = 7 <strong><em><strong><em>____</em></strong></em></strong><br>(iii) 17 - (-21) = <em>_ <strong><em><strong>_____</strong></em></strong></em><br>(iv) 3 - (-5) = -2 <strong><em><strong><em>__</em></strong></em>___</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>3)Commutative Property:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>For ant two integers a and b, we can say a + b = b + a</strong><br>We know that 3 + 5 = 5 + 3 = 8, addition is commutative for whole numbers.<br>We have 5 + (-6) = -1 and (-6) + 5 = -1<br>So, 5 + (-6) = (-6) + 5<br>Are the following equal?<br>(i) (-8) + (-9) and (-9) + (-8)<br>(ii) (-45) + 0 and 0 + (-45)<br>And also we know that subtraction is not commutative for whole numbers.<br>Consider an integers 5 and (-3).<br>Is 5 – (-3) the same as (-3) - 5? No, Because 5 – (-3) = 8 and (-3) – 5 = -8.<br></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>4)Associative Property:</strong> </p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>In general, for ant two integers a and b, we can say a + (b + c) = (a + b) +c</strong><br>Consider the integers 3, 2 and 5.<br>Look at 3 + (2 + 5) and (3 + 2) + 5 are equal?<br>Answer:<br>Yes, In both cases we get 10.<br>3 + (2 + 5) = 10 and (3 + 2) + 5 = 10.<br>Similarly consider -3, 1 and -7.<br>(-3) + [1 +(-7)] = -3 + <em>_ =</em><br>[(-3) + 1] + (-7) = -2 + =<em>_</em><br>Is (-3) + [1 +(-7)] same as [(-3) + 1] + (-7) ?</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>5)Additive Identity:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>0 is the additive identity, (a + 0 = a).</strong><br>Observe the following and fill in the blanks:<br>(i) (-8) + 0 = -8<br>(ii) (-23) + 0 = <em>_ (iii) 0 + (-59) = _</em><br>(iv) -61 + <em>_ = -61 (v) 0 + _</em> = -37<br>(vi) <em>_ + 0 = _</em></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p><strong>Let’s take a moment to overview integers:</strong><br>➢ Just Imagine you are playing a game where you can win or lose<br>points.<br>➢ If you win, you get +5 or +10 po	\N	PUBLISHED	2024-11-29 09:43:49	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
24	4	MATRICS LINEAR EQUATIONS	matrics-linear-equations	<strong>Applications of Matrices: Solving Systems of Linear Equations</strong></p><p></p><p>Matrices are one of the most powerful tools in mathematics, especially in linear algebra. They not only simplify complex calculations but also provide efficient methods to solve real-world problems. One of the major applications of matrices is solving systems of linear equations.</p><p></p><p><strong>What is a System of Linear Equations?</strong></p><p></p><p>A system of linear equations is a collection of one or more linear equations involving the same set of variables. For example:</p><p></p><p>2x + 3y = 8 x - y = 1</p><p></p><p>Here, we have two equations and two variables x and y.</p><p></p><p><strong>Why Use Matrices?</strong></p><p></p><p>Using matrices, we can represent a system of linear equations in a compact form, which allows us to use matrix operations to find solutions efficiently. This is especially useful when dealing with large systems.</p><p></p><p>A system of linear equations can be written in matrix form as: AX = B</p><p></p><p>Where: - A = Coefficient matrix - X = Column matrix of variables - B = Column matrix of constants</p><p></p><p><strong>Example:</strong></p><p></p><p>Consider the system: x + 2y = 5 3x + 4y = 11</p><p></p><p>This can be written as:</p><p></p><p>[1 2] [x] = [5] [3 4] [y] [11]</p><p></p><p>Here, A = [[1, 2], [3, 4]], X = [[x], [y]], B = [[5], [11]]</p><p></p><p><strong>Methods to Solve Using Matrices</strong></p><p></p><p><em>                    Using the Inverse Matrix Method</em></p><p></p><p>If A is a square matrix and invertible, the solution is given by: X = A^-1 * B</p><p></p><p>Step-by-step Example:</p><p></p><p>A = [[1, 2], [3, 4]], B = [[5], [11]]</p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Find A^-1 (inverse of A):</li></p><p></ol></p><p>A^-1 = 1/(1<em>4 - 2</em>3) * [[4, -2], [-3, 1]] = [[-2, 1], [1.5, -0.5]]</p><p><ol start="2"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Multiply A^-1 by B:X = A^-1 * B = [[-2, 1], [1.5, -0.5]] * [[5], [11]] = [[1], [2]]</p><p></p><p>So, the solution is x = 1, y = 2.</p><p></p><p>Another method is row reduction, where we transform the augmented matrix [A|B] into row-echelon form and solve by back-substitution.</p><p></p><p>Augmented matrix for our example:</p><p></p><p>[1 2 | 5] [3 4 | 11]</p><p><ul></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Subtract 3 times the first row from the second row:</li></p><p></ul></p><p>[1 2 | 5] [0 -2 | -4]</p><p><ul></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Solve for y: -2y = -4 =&gt; y = 2</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Substitute y = 2 in the first equation: x + 2*2 = 5 =&gt; x = 1</li></p><p></ul></p><p>The solution is the same: x = 1, y = 2.</p><p></p><p><strong>Real-Life Applications</strong></p><p></p><p>Matrices are not just theoretical; they are widely used in: - Engineering: Circuit analysis and structural engineering - Computer Graphics: Transformations and 3D modeling - Economics: Input-output models for industries - Physics: Solving complex systems in mechanics and thermodynamics - Computer Science: Network theory and data science</p><p></p><p><strong>Conclusion</strong></p><p></p><p>Matrices provide a systematic and efficient way to solve systems of linear equations. Whether using the inverse method or row reduction, they simplify calculations and are fundamental in both academics and real-world applications. Mastery of matrix methods opens doors to advanced studies in mathematics, engineering ,economics ,and technology.</li></p><p></ol>	<strong>Applications of Matrices: Solving Systems of Linear Equations</strong>\n\\n\n\\nMatrices are one of the most powerful tools in mathematics, especially in linear algebra. They not only simplify com	\N	PUBLISHED	2025-11-21 09:18:47	2026-04-08 07:28:50.085797	\N	\N	\N	\N	1	\N	2026-04-08 01:12:23.859977	2026-04-08 07:28:50.085801
21	4	Application of Matrices to Cryptography	application-of-matrices-to-cryptography	<h2>Introduction</h2></p><p>Cryptography is the art of protecting information by transforming it into a form that cannot be understood by unauthorized people. It ensures the confidentiality, integrity, and authenticity of data. One of the fascinating mathematical tools used in cryptography is matrices — a structured arrangement of numbers that makes data encryption both systematic and secure.</p><p><h2>What is a Matrix?</h2></p><p>A matrix is a rectangular array of numbers arranged in rows and columns. Matrices are used in various fields like computer graphics, engineering, and data science. In cryptography, they help convert plain text into cipher text through matrix operations such as multiplication and modular arithmetic.</p><p><h2>How Matrices are Used in Cryptography</h2></p><p>Matrices play an essential role in Hill Cipher, a classical encryption technique developed by Lester S. Hill in 1929. The Hill Cipher uses linear algebra concepts to encrypt and decrypt messages.</p><p><h3></h3></p><p><h3>1. Encryption Process</h3></p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Convert each letter of the plaintext into numbers (A = 0, B = 1, ..., Z = 25).</p><p>2. Group the letters into blocks of size n (based on the size of the matrix).</p><p>3. Multiply each block by an n × n encryption matrix.</p><p>4. Take the result modulo 26 to get the cipher text numbers.</p><p>5. Convert those numbers back into letters.</li></p><p></ol></p><p><h3>2. Decryption Process</h3></p><p>Decryption requires finding the inverse of the encryption matrix (mod 26). By multiplying the cipher text block with this inverse matrix (and again taking modulo 26), we retrieve the original plain text.</p><p><h2>Example: Hill Cipher Using a 2×2 Matrix</h2></p><p>Plain text: HI</p><p>Matrix Key (K):</p><p>K = [[3, 3], [2, 5]]</p><p></p><p>Step 1: Convert letters into numbers</p><p>H = 7, I = 8</p><p>P = [[7], [8]]</p><p></p><p>Step 2: Multiply K × P</p><p>C = [[3, 3], [2, 5]] × [[7], [8]] = [[45], [54]]</p><p></p><p>Step 3: Take modulo 26</p><p>C = [[45 mod 26], [54 mod 26]] = [[19], [2]]</p><p></p><p>Step 4: Convert numbers to letters</p><p>19 → T, 2 → C</p><p>Cipher text: TC</p><p><h2>Advantages of Using Matrices in Cryptography</h2></p><p>- Mathematical Strength: Complex to break without knowing the key matrix.</p><p>- Efficiency: Can encrypt multiple letters at once.</p><p>- Flexibility: Works well with different key sizes (2×2, 3×3, etc.).</p><p>- Integration: Can be combined with modern algorithms for enhanced security.</p><p><h2>Limitations</h2></p><p>- Requires an invertible matrix modulo 26 for decryption.</p><p>- Vulnerable to known plaintext attacks if enough message–cipher pairs are captured.</p><p><h2>Modern Applications</h2></p><p>While classical matrix-based ciphers like the Hill Cipher are mostly educational, the concept of matrices extends into modern cryptography techniques such as:</p><p>- Public Key Algorithms (RSA, ECC) which rely on linear algebra and modular arithmetic.</p><p>- Quantum Cryptography, where matrices represent quantum states and transformations.</p><p><h2>Conclusion</h2></p><p>Matrices bring a powerful mathematical foundation to cryptography. They transform messages systematically, ensuring both secrecy and structure. Although newer cryptographic techniques have evolved, matrix-based encryption remains an essential stepping stone in understanding the relationship between mathematics and information security.	<h2>Introduction</h2>\n\\nCryptography is the art of protecting information by transforming it into a form that cannot be understood by unauthorized people. It ensures the confidentiality, integrity, an	\N	PUBLISHED	2025-11-13 10:14:29	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
1	4	The Albert Testing	the-albert-testing	<!-- wp:image {"id":50,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/08/letter-w_13041163-1.png" alt="" class="wp-image-50"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Some Random Content to check the Font and the views of our website.</p><br><!-- /wp:paragraph -->	<!-- wp:image {"id":50,"sizeSlug":"full","linkDestination":"none"} -->\\n<figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/08/letter-w_13041163-1	\N	PUBLISHED	2024-09-03 12:45:01	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
13	4	Example: Inverse of a Non-Singular Square Matrix	example-inverse-of-a-non-singular-square-matrix	<!-- wp:paragraph --><br><p>Let us take a scenario,</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Imagine a school assembly where children are asked to stand in a equal number of lines as per neat arrangement which explains discipline and coordination.&nbsp;</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>This will be an equivalent example of the term matrix.</p><br><!-- /wp:paragraph --></p><p><!-- wp:list {"ordered":true} --><br><ol class="wp-block-list"><!-- wp:list-item --><br><li><strong>MATRIX:</strong> The arrangement of numbers in rows and columns in a rectangular array. Mathematicians Gauss, Jordan, Cayley, and Hamilton have developed the theory of matrices which has been used in investigating solutions of systems of linear equations.</li><br><!-- /wp:list-item --></ol><br><!-- /wp:list --></p><p><!-- wp:list {"ordered":true,"start":2} --><br><ol start="2" class="wp-block-list"><!-- wp:list-item --><br><li>Here we will learn about <strong>4 important methods</strong>:<!-- wp:list {"ordered":true} --><br><ol class="wp-block-list"><!-- wp:list-item --><br><li><strong>Matrix inversion method, </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li><strong>Crammers rule,</strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li><strong>Gaussian elimination method, and </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li><strong>Rank method.</strong></li><br><!-- /wp:list-item --></ol><br><!-- /wp:list --></li><br><!-- /wp:list-item --></ol><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p>Let's recollect the basics of this chapter to experiment with these concepts.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Let us consider a matrix&nbsp;</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfrKAGxWEEIb0CXDMAHrFihYtlLMigvtNWM_vAKjc9uFlDSzBt_4GHjXcp9ehy49NHlhEb1XBq3FnTkYR69gHaJQYiFxc83_jCkdWBYbZyksl2yH_bF3sOMF-w9uMjTpEw4NGuAGBu4CAPvsrrgVoAfhydG?key=lXXqjGUhFobTs0B3DhOY1Q" width="254" height="100">and calculate its inverse.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>SOLUTION:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>STEPS:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list {"ordered":true} --><br><ol class="wp-block-list"><!-- wp:list-item --><br><li>Arrange the matrix based on the first row, first row second column, and so on.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Find the inverse of each element in the matrix.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>interpretation.</li><br><!-- /wp:list-item --></ol><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p>Let's make it manually</p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li>let us see if the determinant of the matrix is zero to make sure we can inverse it.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Since it is a 3✕3 matrix let's write the elements as follows and find the determinants as follows:</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXdScx-1aYBccs3p5RpkREIu88-dgkl7vMu6So8mhoIabWo-xdYRWl4R4kWCcTRo7RqN0ly6cbvL815fNMwefxqTqmXoCjdyNEhZprOVN5UAQe5HDRP_h2zZQHZrnj18I1azX2Pj8-ttISgmtQ20RW1oytp9?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfw9mIJTlGf_Bc32tlxK1m1esfO7K41TMwL4m_GBaa_5nBILuYsnzAKTMU14IFAm0U4II92n_tqGEfCSScy_P4FxtKyJWHSh2p_3MzIhTIvVqnbNMHEav68PGoshn4WmVfQjbcd7wd4TsSxZJge3VTe3IS9?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>The formula for the determinant is given as follows&nbsp;</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":169,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/4415FC19-EB82-4582-AB6B-FE0AB992D2A6.png" alt="" class="wp-image-169"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Let us apply the formula to check the determinant is not&nbsp; 0 so that it is an inverse matrix.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXcj1vQps7pcrcZCBO3P4oJM-7VFX81sECx9DjLZ3DQFWLDuFEHVoTZpWAbT35_chWrfmDSHsQ3FcNn1S0SJ_yqP0Qh_3vWcZaugStBKtbtO0AgigwM8su7W2lovXhqungTw8IikQSJju1ukp07LcG--xpQ?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Since the determinant is not zero let us proceed with the next step.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Let's find minor for the given matrix.</p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A11=0.3</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE FIRST ROW AND FIRST COLUMN</strong>:</p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfStXAWgzoMLA15nnN2YUYmt3Gk-SEcpr5sxGZGH4vXT9MOQVAQ1VTpobQqQ84iGwGQzj2vfojKjuA6x_gVNoemm2dUlDVZZ_mPkNXuXmhCRkFgZt8B2Wa8MnFJLgDp2CS7CkmH5NCjr4AT5lRBlKxHsCE?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A12</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE FIRST ROW AND SECOND COLUMN</strong>:</p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXe3MvsZWNevUUAKiTR7T_6fIYTucItblf-uDXIQPy_S_v1RBY7i6UEmKFVFMTLD0sraRmG4xwk4B6AJWFkKnHMbjUhOrH5VJYZjCDsU-8ODVwR4uLtmJdBot3acdnoScPDHgHWfEeOxrpDY9A_Vw0QFmH4D?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A13</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE FIRST ROW AND THIRD COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXeipLb190BSoGZIlNgcmSlpfYUPNrWWsZ0IuvaeLRTO1kIL59DVqWgA2Lx36qvrYH6-EXX1JXqod_tpo2fTBG4HTuNLfWjNdlsR3PHsFwmrnPlckuhDRw8LwGsjzc8KHzsm-J-VzEyjfHjL5V7g_swtLJPM?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A21</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE SECOND ROW AND FIRST COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfhNJJEhm6BCuKRqGsY-Zd88FT_TH82k81owT0ZrOmu8ACG7y7uxzmDYgsxfITrrZoUksGdJmyUTGg5sFhhU62rygPk4bSEXLNH88keKKG4_zzViBuW8TBIkFL3TQoM5wirW6QNvjg_--_G0f_i4Lvekbg?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A22</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE SECOND ROW AND SECOND COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfFmDXb93Q7W3B0hBwA5EV6-Ibh-fRXkpJLHIpToSxCLAEZ15OY5Nx8A0YZrKKbTVRGDbNuHQfPDQPF9PfhUYaKKuTBripO4oMAd6BkW89DjG66aKv8IFr-SI-r9eyVuAG7PusmB7KcQcB_yoMEOZ577Anb?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A23</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE SECOND ROW AND THIRD COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXfPF4iQ1tI2uYbzQPhTvMPrYX_t9ZRUofRuKA4xV19ERImh2S278O5hreNwdW4S7oyvk3MgLRnuZx6yJfV2wbCfDS6vX3Wjv2dA5649jBOkO13ieOPdcIQQxeXAdDUAUZLtl-zDMnYnlaS4Qy9BfDrGOAyX?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A31</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE THIRD ROW AND FIRST COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXdfMZa85aZCCGyPQ4ENBO8S3caDJsWRUWeYOMC6Z17OhGaNkXhst4ta88MSmuGOjNh6H7J09hYfTqgrvFsCUdtNyS0FlECHZTBLetWILFHHGNkeoqLdgXplsH0RSbfMfS6cjUYvznvEtzF684L1YX4TdKMc?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A32</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE THIRD ROW AND SECOND COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXcTEzWjIXMTx6KxSayRC6N2U4Erqw0tNm4-2q10DZdoj9jbMqVCidbDxuW3p5VSkVWa0-E8at6K1V54x2t31QLHorjVNRJRvGq5wNJjRwqNYxsWBf2B71cf0xlxeSdDm2xxbKUdo31LhX1Dzgq5AkW6wXY?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>MINOR OF A33</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>NEGLECT THE THIRD ROW AND THIRD COLUMN</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXdKvV9LFPZAmzEVBpLChm_7YoHBTH6ElE-krVwOAI6gJWnBQN04iEpP-v0Jo1y4aw-Jeo8YNIVwNFDVxLrcDiVoVnf_HN3gaUWxPwWQPmy2xBx3WiMCpIL14IB-HALwYxpIxgVuhcsZvr8_AvNDv5M6pU2f?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p><strong>THUS WE GET</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A11</strong>=0.18</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A12</strong>=0.00</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A13</strong>=-0.09</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A21</strong>=0.07</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A22</strong>=0.10</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A23</strong>=-0.01</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A31</strong>=-0.01</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A32</strong>=0.05</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>MINOR OF A33</strong>=0.13</p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>Lets take cofactors from the minors </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li><strong>Now lets take transpose </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>It is nothing but taking adjoint matrix</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXcsW_FQVlShPLKFciZrEdjdRWX1iqyQjO-4caOxArYxzfWhSJlEtkUf9T8duk9Utnj2x1q_aaQ8JqRrUQ_6wW8ic-ut1ZtWSE4QdmIHWpnz56-75p2REx89qytfvLdCnQi-MIFC77YUI3qjLE1hji9RPjm6?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>Let us take a scenario,</p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p>Imagine a school assembly where children are asked to stand in a equal number of lines as per	\N	PUBLISHED	2024-12-12 05:35:35	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
4	4	Multiplication of Integers	multiplication-of-integers	<!-- wp:paragraph --><br><p><strong>Here’s a short story to explain the multiplication of positive and negative<br>integers:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>“The Adventure of Tom and the Treasure Hunt”</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Tom is going on a treasure hunt in a forest, and he has to follow a few rules for<br>his journey. He carries two kinds of maps:<br>➢ <strong>Positive Maps:</strong> These maps lead him in the right direction to find<br>treasure.<br>➢ <strong>Negative Maps</strong>: These maps send him backwards away from the<br>treasure</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>1)Multiplication of Both Positive Integers:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li>Tom gets a map with both directions marked as positive. </li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>This means that he’s moving in the right direction getting closure to treasure.<br><strong>Example</strong>: </li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom has a map showing 5 steps forward and then he moves 3<br>steps forward again.<br>So, 5* 3= 15<br><strong>Result</strong>: </li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom reaches 15 steps ahead. He is closure to the treasure!</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>2)Multiplication of Positive and Negative Integers:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li>Now, Tom finds a map with one direction marked positive and other<br>negative.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>This means he moves in the right direction for some steps, but then<br>has to turn around and move backwards.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>This might seem confusing, but tom realizes that if he moves forward<br>and then backward, he’s still going away from the treasure.<br><strong>Example: </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom has a map showing 5 steps forward, but then 3 steps<br>backward.<br>So, 5* (-3) = -15<br><strong>Result: </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom ends up with 15 steps behind where he started. He if farther<br>form the treasure!</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>3)Multiplication of Both Negative Integers:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li>Next, Tom finds a map with both directions marked as negative.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>This means he has to go in the wrong direction, away from the<br>treasure and then after going backwards, he must turn around and<br>go forward again.</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>It’s like a double negative- Tom actually ends up moving forward<br>towards the treasure.<br><strong>Example: </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom has a map showing 5 steps backwards, but then he<br>turns around and moves 3 steps backward again.<br>This makes him move forward instead of backward.<br>So, (-5) * (-3) = 15<br><strong>Result: </strong></li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Tom ends up 15 steps forward, closure to the treasure!<br>Because two negative directions cancel each other out, putting him<br>back on the path towards success.</li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>➢ Through this treasure hunt, Tom learns that multiplication<br>with both positive and negative integers helps him<br>understand the twists and turns of his journey.<br>➢ But the rules of multiplication always guides him back on the<br>right track!<br>➢ Finally, Tom understand Multiplication is Magical!</strong></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p><strong>Here’s a short story to explain the multiplication of positive and negative<br>integers:</strong></p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p><strong>“Th	\N	PUBLISHED	2024-11-30 09:05:45	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
5	4	Properties of Multiplication of Integers	properties-of-multiplication-of-integers	<!-- wp:paragraph --><br><p>Examples with explanation of the properties of multiplication of integers<br>along with a small story to make it engaging. Lets dive into it.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>1)Closure Property:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Imagine a magical kingdom where every number has a home inside a big<br>fortress called “Integers”.<br>❖ If two residents (integers) join fortress (multiply) and their result (the<br>product) also become a resident of the same fortress!<br><strong>Property:</strong> The product of two integers is always an integer.<br><strong>Example:</strong> 3* (-4) = -12</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>2)Commutative Property:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Two friends, Alex and Benny decide to paint a house. Alex paints first,<br>then Benny paints, and the house gets painted.<br>❖ If Benny starts and Alex follows, the result is still the same – a painted<br>house!<br><strong>Property:</strong> The order of multiplying two integers doesn’t matter.<br>(a<em>b = b</em>a)<br><strong>Example: </strong>(-3) * 5 = 5 * (-3) = -15</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>3)Associative Property:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Three siblings, Ray, Mia and Sam build a tower using blocks.<br>❖ Ray and Mia first stack their blocks and then Sam adds his, or Sam and<br>Mia stack their first and Ray adds his.<br>❖ Either way, the tower height is the same!<br><strong>Property: </strong>When multiplying three integers, the grouping doesn’t affect<br>the result. (a*b) *c = a * (b<em>c) Example: (2</em>3) *4 = 2 * (3*4) = 24</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>4)Multiplicative Identity:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Think of number 1 as a magic mirror. When any number looks into the<br>mirror, it stays exactly as it is.<br>❖ No changes, No surprises!<br><strong>Property</strong>: Any integer multiplied by 1 remains the same. (a<em>1 = 1</em>a = a)<br><strong>Example: </strong>5<em>1 = 5 and 1</em> (-7) = -7</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>5)Distributive Property:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ A farmer has 3 baskets of fruits. Each baskets have apples and oranges.<br>❖ To count the fruits, the farmer could either count all the apples and<br>oranges together in each basket (combine, then multiply).<br>❖ Another way to count the apples first, then oranges and add them up.<br>❖ Both ways work perfectly<br><strong>Property:</strong> Multiplication distributes over addition or subtraction.<br>a* (b + c) = (a<em>b) + (a</em>c)<br><strong>Example:</strong> 3* (4 + 5) = (3<em>4) + (3</em>5) = 27</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>6)Multiplication by Zero:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Imagine 0 is a magical number, if any integer multiply by 0, it always<br>remains 0.<br><strong>Property:</strong> Any integer multiplied by 0, remains 0. (a<em>0 = 0</em>a = 0)<br><strong>Example:</strong> 3*0 = 0 and 0 * (-5) = 0</p><br><!-- /wp:paragraph --></p><p><!-- wp:group {"layout":{"type":"constrained"}} --><br><div class="wp-block-group"><!-- wp:paragraph --><br><p>Fun!!! Fun!!! Fun!!! everything is not Fun but we can make this chapter seriously Fun. Lets solve a activity to understand these rules in a more effective way in the next session. Until then stay practicing.</p><br><!-- /wp:paragraph --></div><br><!-- /wp:group --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>Examples with explanation of the properties of multiplication of integers<br>along with a small story to make it engaging. Lets dive into it.</p>\\n<!-- /wp:paragraph -->\\n\\n<	\N	PUBLISHED	2024-12-01 16:07:06	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
6	4	Properties of Division of Integers	properties-of-division-of-integers	<!-- wp:paragraph {"align":"center","fontSize":"medium"} --><br><p class="has-text-align-center has-medium-font-size">Here’s a short story to explain the properties of division of integers:<br><strong>“The Village Market”</strong><br>In a small village, a market has 12 apples. The market keeper, Mr. Positive and<br>his assistant, Ms. Negative work together to divide the apples fairly.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>1)Division by Same Sign:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ Mr. Positive wants to divide the 12 apples among 4 happy customers<br>equally.<br>❖ Each customer gets +3 apples.<br>❖ Later, Ms. Negative divides the apples among 4 unhappy customers. Even<br>though she’s upset, she ensures fairness, so each customer still gets +3<br>apples.<br><strong>Property</strong>: When dividing two integers with the same sign (both positive<br>or both negative) , the result is positive.<br><strong>Example:</strong> (12) / (4) = 3 and (-12) / (-4) = 3</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>2)Division by Different Sign:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ One day, Mr. Positive has 12 apples, but Ms. Negative is responsible for<br>dividing them.<br>❖ She’s grumpy and gives each customer -3 apples.<br>❖ Another day, Ms. Negative has -12 apples, but Mr. Positive helps<br>distribute them.<br>❖ Each customer still receives -3 apples.<br><strong>Property:</strong> When dividing two integers with different signs (one positive ,<br>one negative) ,the result is negative.<br><strong>Example:</strong> (12) / (-4) = -3 and (-12) / (4) = -3</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>3)Division by zero:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>❖ The customers ask, “What if we divide the apples into 0 groups?” Mr.<br>Positive laughs and says, “You can’t do that! No groups means no<br>division – it’s undefined!”<br>Property: Division by 0 is undefined. You cannot divide any number by<br>zero.<br><strong>Example:</strong> 8 / 0 = not possible</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Lets Explore:</strong> (-15) / (3) or (20) / (-5)</p><br><!-- /wp:paragraph -->	<!-- wp:paragraph {"align":"center","fontSize":"medium"} -->\\n<p class="has-text-align-center has-medium-font-size">Here’s a short story to explain the properties of division of integers:<br><strong>“	\N	PUBLISHED	2024-12-04 15:00:21	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
7	4	GEOMETRICAL IDEA	geometrical-idea	<!-- wp:paragraph --><br><p>The word “Geometric”may suggest complexity at first glance but it actually refers to some of the<br>most fundamental mathematics that influence our daily lives,such as shape ,size , dimension ,<br>line,and surfaces. The term “Geometry” is formed from two Greek roots : “Geo”,which denotes Earth, and “metros”, which signifies Measurement. “Children's form a line”. “Stand straight and stiff . It's a National Anthem”<br>We have often listened to our teachers ordering us the above shown statement as an order in<br>our school assemblies. Is it?.<br>What does it really mean in terms of Mathematics?<br>Well let's define the term as a line.<br>● A Line is a formalization of more than one point or joining many numbers of points.A<br>line is a straight one -dimensional figure it may extend in two directions with infinitely .It<br>can be denoted by 2 points or in the equation of a plane .<br>● A line segment should contain two points which are a starting point and the ending<br>point .<br>Now take a pause. Look around yourself. Try to find more examples for line segments from your<br>surroundings.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Let me give you a sample: Mark any two points A and B on a sheet of paper. Try to connect A to<br>B by all possible routes.<br>Ans: A-----------B<br>Draw a horizontal line.<br>Ans <strong><em>__</em></strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Lets drive deep into the chapter to level up.<br>A story to link with the concept:<br>● Scene describe two friends ,Mia and Aryan , who said reside in the<br>same on<br>● On a sunny morning ,they made the decision to go shopping .<br>● They decided to have a challenge between them to choose different<br>routes. It is amusing to note that they crossed the same road at<br>precisely the same location.<br>● Now , let us interpret this scenario as a geometric lesson:<br>● The Road : Envision the road as a flat surface or plane .<br>● Their Paths: The routes taken by Mia and Aryan can be likened to two<br>straight lines.<br>● The crossing point : The location where Mai and Aryan intersected on<br>the road is referred to as the intersection point , where both line<br>coverage</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>What Happens in 3D Geometry?</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>In the context of our story ,two lines are covered at a designated point .<br>In contrast ,three dimensional geometry reveals a captivating event when two<br>planes intersect ,<br>These planes resemble enormous sheets of paper adrift in space .<br>When they meet , they do not simply intersect at a point ,as friends might on<br>a road .<br>Instead ,they establish a straight line !</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Lets work on detail understanding over this. Stay tuned. </p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>The word “Geometric”may suggest complexity at first glance but it actually refers to some of the<br>most fundamental mathematics that influence our daily lives,such as shape 	\N	PUBLISHED	2024-12-05 15:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
10	4	Circle Family	circle-family	<!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>CIRCLE</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>A perfect closed curve where every point on the curve is equidistant from the center</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>ELLIPSE</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>A stretched circle , often seen in the shapes of orbits .</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>PARABOLA AND HYPERBOLA</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Curve studied in advantage geometry and physics</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Real -Life example of curve</strong><br>● Nature ; The shape of rainbows, rivers,or petals of flowers.<br>● Arts and Design ; curves are used to create patterns , sculptures, and decorations.<br>● Daily life ; curve are present in roads , bridges and even in handwriting .</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":130,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/CB244F68-1F5E-4C2D-BB6C-6628353CB570.png" alt="" class="wp-image-130"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>POLYGON</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>A polygon in a 2D shape formed by straight line segments that are joined to create a<br>closed figure .<br>Eg : triangle , square , rectangle , pentagon etc</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>PROPERTIES OF POLYGON</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Polygon have sides (straight lines),vertical (corners),and angle (interior and exterior )<br>The sum of the interior angles depends on the number of sides , calculate as ;<br><strong>Sum of interior angles =(n-2)x180^o</strong><br><strong>Where n is the number of sides</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Regular polygon </strong>:<br>All sides and angle are equal (eg, Equilateral triangle )<br><strong>Irregular polygon :</strong><br>Sides and angle are not equal (eg; scalene triangle)</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"center"} --><br><p class="has-text-align-center"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAboAAAFdCAYAAAB1tqi/AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAP+lSURBVHhe7L0HgGVHdSb8vdy5e3pyHuWcEEgCBAKEQIhsMgYnsMHrsPau12uvd23vrn+v/S+/195dDA6YaJNMRkgghISkURxlzUgTpMm5p3N6+f++qlvv1b393uvXaaZHzPf69A1VderUqVN1quqm2MP3faecSqVQjsUA/jkk/AOUA7Iol6v7M0M82DKrWH0es+c/f4hJHwZWZiuTo/lDNZ+piMWq+oqiXC4FezPTV6P8ZopG+dbKp1F5fDhdN1Ou2eqvFnydNoOZ8m8GM5VhPuD0PJ+2MVPMxIZ9LIjMpaosZm+aLCR7PJHQTnDm1KFSlw1EKXvl8eM1U9ZpwfxLxQJSqaQ9LMXq9phVOWKsR248vZciqaar51r249t1HGys5Zqlm2uJa0GdF4twChqz0ZujJnAqG31jTHUAzct6ssrk56N9R9PDlq3JSjrFkKyOTheZa6FqP35dNVdfL0oExTc12oQaisUS4gsw6JkLnEVOoUh5/LB5qXLaUpITJ/ks+RXl5+fhk4PxCUxQK8wh2uf5qBXmn9N+xdG50zJ6Z/jFYhElz8vOHcwwTu8aP/lGoRI5qqnJCEqlEgYGBoIjq5fFgHqdqqu3xhREnifUzkMURKC2/fPNYT7tbaHh6kLOzpw4bWHrx6efYUgXhoLjBpDe0ul0zc72lMJVY5SiaBQ2S1ScnCHCz8OnAMb26oTNF4zHkePRiEQZauv2k8kUEpqSz1POtjEJjY1C8apxTy5c3tJJd3ePztgAwoXVooVArdmvlssWYsnsDM7AQYPb08FxL1S7c4i28Xr5nbJVqkWO+Xb+4leLmkHcRg6OGkKdq2j6il+MMFPogAStTTsKQxE4y2XEeFxOvjlFnmw4h+fTyYKt+6n5i2aL2k59pjYWlqtZ2DawODoqX/4wRfVQvw4czRzSgZbhOBaf2jAWFK6uZ0KnAotBhlMDldWn+cNMHNZsoXVLYrpM/ILNbyFPBZopwUIrfmFwsuqmms9i0tPs+53Toa7DhVvQPvZkmdEZnDaw7VyG4ej0Qpy+NNitDzt6OXkzhsWA/v7+067MJ7ueYnHlFxwEcLMJS/PTINzouRadSixEWecTTrb5xHyPvksBv8WovzOwMHXDKp/f+zWq8NvyfNlX1J5iD9zz3XKmJcMAHZUrdw/5Kxduua8ULO/EF2iZZ7YFdOmabSxUq/41RLWD0NYp39HJxUw7q8bLcD6vaHn8sPo85rvzFOZj6dDWf3M2MDs04n9ybaNqjxazs5Hag4WTtYzryxwtz2KB+kFfQ6WFNK95wGz70EaQjSwE34VALTk1mDIzumYdRBQnvfDKzqcAxnG9qFGj0GewaFBpBzJDR6cUvr3Usxk5uWB3ChZFIeYP06niDBpjEeqtUCgEe9NDlswhVbUUM3F4atwn08+Z/KI/r4OZrbM+HWB17ZX3DBYVZHtROpXw7aWezVgZa8tpyxAcvAhALVR+ZzBzLDa96Y54+zRA84jdd/e/ltvbO4xh+0sJbpmyFuzSpWsJ86OERp14ozBhrh3Lqe6YZoJmlqjCS08qW7Plq5+uvoqi/E/OstfJQyN927LqWmUUegB2IWHbRHN5zG6pmd3bNO2uNmbn6GdSnunQjNwnu83PTpeN5Zwtz5MLye+XYe79Qy2dRHVhj6t52xbAhDOveDE6HRR9BmdwBmewMFC/6ZPrWF8MkLM4PZzp9IjreRlWEXdfPBV0BicTZwY7Z/CzCTmBXD7PrY5sHzrj+cLPFBayr2is+HgyFue0jhM7d2vlaYZaM9HoKGs6enFDxqXlgmbIRzRdIzQbTwsIjuZL7z7PKFVh6lqPQzRJVfH8skWpPmrxdPTihmYB9uH/mdDCdoLzDy0H64US6VS60ofYssxvOdysqhadHvD7kfmVWXdTFgol6j9JShjy4eespsczi7vx+U4pSmdQRbXTmH843lPpdGlwM4Oxrxe9U3rxYCEcQLWf8Z+XnPpsomsLLzbMtY+t6q9K/GfumIzWk94tPNO6i5NXIqG3WCld47SsNUWp/hwo1pTf6Q3J7+hkYn7zrV+pjSt64eDkqUVRNAjz1RSlKWgY6KHZeEKdeD6LKIUPImgUNl+YD96N5PTD6sV5MYLlZCcqK60+JF3HbmueO4O6YP+VTGoGVrUl38HN0NcFfLz0rDuR6k/Qf5GZ0SkjRw7ygI4q3vh0RSB/tRwnpyzMLZLvfCBcT0K07k42XP61KAwd+1SFr6coheHqz1F9hEbgU/h4KDNcqxqOPNSSp0oB7xrpQvyiYfMAJ8PcoPQ++YiWdT7ym3/UtrO5wZQ1+LkvrdTKp1HeLqxRnJOFqCzN0lwxE15R2/LT1qNa0HdVLanNy3tZy9bsr2m4LxssVtRtjBWlSEHNrRU3UmazIIea0/SfHVh9z3Vpx1zbmoGh1rWDRQL/el2UFjuMczddx+LHfLRhh8qgJkCz/chiwGJqD04WUS6XC52zaL7O/Pqdrq7jZV2qi4nqRzKvwQlourp1Gc6UFho2n+CgCYSVP3skk/Zb7bXKeDLKfXqCGovOhrhxdeJ+FtJhE2Q2EZ4OFcMmRYJmD5+nts2hUsZKWeVY7OjUUrA0E5B+M+EfhiejodMLjdrP/LWtqq4tLU4U6rwpxPZ7J6ePnSn0HT8f1poDm54BOIy2zTo49qFzohlPzxZvVU8HV+STC2NkNfJejIa3aGBU4zoWz+LcbnBajsBGjpAblflkECSsMHLw47m4c8SUvJtESET+UxmNw3P71tnZpqvj4HDWcGWeoZynGI3az/y3LSnY0eJEKhV2GoJu8DitMAs1+9YbHb/6YWwt2pzBGSw85rqEWQun4/LfXCEHXyjkoa/1zydq6dLRYoOb8Z5sLIQNzwdqyXQq9DNXmInBNAOVZuJEYT68al2hVYpe/TX19V9iqnOOFiecAmaqBB8+jyjNF+aDl2tw1sDnT7ZFATMTYrkcmZtFAjLhXliziPKcLaKyVMD244c1Ih9mzaVGHFFkaOtPEhNJfUpS5VB69wyR0ojCaGQjIWcWkiVmXmPmaH6g8jgZp8o5X3BOsJEzbNS2/bYVpcaolq0ZGRYS0fJNRzOFb4tR+GEsfc3y18vT6atYdM/IzY+tBBxk4Ce/MhYSs6m86bAALM9gpjilZrp42oi7G7AKv0OZKmdd29V5R166M7Y+VyweW1lsaKZvTqVSSMQ1eJNd23NzwdxdZQO40YKjk42Z5j19vHB5fJp3mJGNvdOrFp3BGUyFsxm7DUN2OnVGUsuWRYp/BjOHVGfUdwY1YW1reihasVQMjuaO2JbNXy8nUz2c0JGzt6ST8HzglMleqf63gJotyGKAGwEvtMyN8qmOwgXtu5G5qP5SyfTLKIsXjRz1dNeDjA7rVJfRW+PkVZilwQCNljL9eMrYX6sJhTVCo3Sz5WlRtalaTmzqudkOkhbG3iJ6qFexDbAQbTfcJqOYnczNyumbwnSotQgn2V1ec9VNIz00ktOXy/FoVpaZyNy4nsiLnYF5pq5UbnJGx8wlgKMXC15s5Tl1kMHNhOrDVMeZKpknTNV5uB2fUfRMIbU5WozQnZaFwvzNhOaKmfSxzcabCRzPuNkY91w/Exta/Z3B7KARSJROf0wt03TUEGoYZ2xsXhDWudO7a+vU8hk1zwK+/hafAlXXenb3DAjVT1BF8VjQsczXvSjhRnUGs4EdBdW+68vRyYa99lOLFqCuaYzlUpXmBTJwLQs6ahb+nZozWVcKIZK3z1Pww2YNpXUUhu2PpcfaYVWqbWuihYH4OpqtbhcaTm+WzGfNKhQOW2yQfD41g+niV8J0iYFkmlWEmoXt56o076AsMU3l2M5m9AqwZiGevsLmQqc7FksZjB29CPS5EKClhWxupnQqsRhkeLFhJh1vs/EWQx05W2lEL1bQ39nCLdYins7KX0yym4eLF2LUdNKxADo9fU2sDhoV6EVX2FOGmTanF7MjWcxQPcW2bP7XcjLdbZYvK0sphH/XZckubgZH8o4LtZRRGwsyrfWweAxQcviyLLSem89Py5QLi/r8G9aPZ7NT0ORSoFneqIcZLCcutJ1OC2bvt9Mq5tmOWM7a+Zw+aKauattdI3uYXs+18p3tivhMlgnnC1GdzMXm59pepuu3xd0spzIfW2tzy+8MXoSQEfnX4l5s0AzXlnH+eov55HUGpx/UodbqvIvF+b0LUtebztjazBD0YMb32d0zOIVw9bCQ9aEG4kjw8/PDXHgz8NJ4u1MofDANfLkawefpUYPhrjoJ2ynpFUPmTAOaGdgFBXsLgWl0Ujdrvzw+zRImaZTXdORQK0w0RwR1GsY852Hg10GUlEskH8qlt3zMF+arFPOBWk59sYKOTtPt00fg+YCM0Y3mF9/IKNxw5h+u0btyV/ObnU4Uvzrz83lEKZx3ozx8HYgawN3qFaU6/K0cmtHFkUjoHZFemlo0UzCJy2PeoTUuR3X04nQdlkH79Wg2CNfr9FRJVSPM0uxlsRCPaMc7JQ9RgGhYLaoNp/upZNJEk1GmuXxFwDfFqFzuuBY1iyZMyoBcQ3xNmWaQz3xipmUU6OimTyCm7qOri/nDq3aU3qC2zuAMApRK6oAsncFCQx2TupqF6xjL7Hinvv+zikq/cIo6ZwfXSfu0EDgZ/OXETybmUp7A0TWXuBlH4uLUooWCWC8k/4VEVEc+LQzE16e5gjxCw0KLWgbpP4PU2OScTTqaD/gyVuUUzBlm46hWeU4a5pj39Paj846YjZmFT52N859CPfIRtlNl5Wi2sFm6jiya39xh+M5VyAVCyPYaQJJXbdScagpOr1a3swNrmaqrTbOFL1c9mi94jm56piyW+S0+LEaZFitMcwlovjCVpxpAMfoqIs/Uprc2L/J8wLAJZIw6kVAWrhyOTjZmn39zfU6Ut6fnyG7ohA+TNMrHYvb9XjWv+ezgqpi1YIsHVEttrTcPajfY+9nCjNYhGy1dztW7zwULNQo4g7khceZVRAsG09kFba7a9hq1v6B96G5Tj1zYwr395Axe7Jhqh/OH+erXY1s2f6OcTHfI1kPM/EHvlCl1ja8XzLaAzRZgNvzr89Z5P+zUN/Ja5Ztr5daGP1BRntV8zXWUOWK6rw80BEWxegjXT1gPDA8ZZ6Q8NcJmpsf6/I1U05Sv0TW/+ekE1JkEu3XQWF+mFHY/CGM3Yo9CDV35VNtF86IrYtORFwBefVWK4+Splq95x958J3s6DRaasUU/TlQHjdLPrL0tHCSheQacstIqFodQ8wkVsNlOJZ/P87904OgMThmaUX+jOAtdfU3wX/g2Pn0Gsv3qnX7R+DXS69SCy33q0GxfMBVycsHuzzhmr8NTiarM/nB4UUOjhOlGCi6O7sAqFOp/M8/Bjb5dOsv/1Fh2Nf/myvpihVlSC8q/WPUgmeZyy3gt2HLOT2eiTunMUmQVs+2jbZ28ONvhbNqWtStLpxtiWzZ/s5xMt7PQqtLaBTcfZfUbYdDI56PAM1W2Q628HS8twdlwP05zPl1l1c+h0duhFi/8sjbSQzSsPuova0rn1Tps+DqtZtHotrKoLTZ6RVfwejBjF414NgnTRqaxV9sRBAcR1LJZc8Zj6a8yNkKUV9l7FVosKOvc2pYji3plslhYp2rLMbuy1EN4IFCbv7X5sB5mi5kOPKL1O9u6rIdathhFM3FqYb5lbQRTO152sVj1vgArvnXMDXqJqVCC2RZ+MUIzumojcrR48CJS9c885rvdhDqTYPfF1DbPYLFhcfWN9TA0OFTT0c7M0QW/FwvcO+ikGEeLCeaLA2dw2mOh/E/FboNO6MXUNs9gcaFQyCObzS7awZRrC93d3TVlrCxdqq1M19GXgum3W52yDB3NDNPldTJQXY6r+vtyWc5v5uWZHzTvbJtZeqmNRkso/rgnHK/ZpctwOpXHSzcPXxqYAn/JLqo7n+cMljxnM8BQU2i2E1jsM6/a7drXV+0wa5PRMIuanU8DW69vbwuBqA1PRW1ZWSZvrbnc8I7bYMdAB/XjTgfpUm+BaXSduK5umW2zA6Jonbl8fehcNK9ml98bwV+OnA5+/iXPbqz4LK3kNmfqQPHk3BzNBIVCoaIER4sVaqCOzmD+ITsQLSYsNnkWA2arE7XtYnH6m79Od4yPjwd7px4zqSvX/gw16eRqQfUsHfh9+WLu1yWa5BNNM2yqr5Tp1KU3djd699ziwOwr/cUP34AXrzHPCq7az1R/CBrozWYipUsAi7+tzw1yEm1tbcHRXDE3wzt1ziVmdHA6NpvYlvu/Xk4mu4Kb0qpF0BtQjP9vMHJQWExUo+jTVUaU76kdGVQb6am967LRzNdUkN01qD/7bFBlEShi7chWjmbqpEE8ntZ7LU1de9nUfOi6ibsnayEG7+0rxn5rlycwcLs/DRotXfr149uwbQVeulL9b5A1alMnG6E71iLLzgqcuay2Dua6OrLYli4darXPqo6qZZ6qttnpYzHZynzAX9b0bW/2CF8eKXk8repshvJms4PSkUxFsPJlAD7NFC+2Cj2DnyHISc9Pq110mG17VucznbNycWy800N/6qeidAaLH2qhwW7zoOkbu1QD0NduRdZQ52asp85olG9AksE7XFzwBfNpLpifuqsPn38jiiAU5B9EKQzZZs0fozZH/NcAVuNu9haQ2w3BCz9t4Mk8J7Py+JjVknpUjWf17pOPRmGnElKSZmqOHObaJi3OONH5Q+yR+75aTqV7gpWdqmIbLV36L3bW0qVfsc0uWcykEpsdUZ5Kw5jNqHcqXIOfHmE9m8qzu3NClWe145kODeKZoOrylzOvacvIiKEoTd6RKb71WStz3z6a4xkCeZeVgW0s9lwEFRsM3YEXznsh7NTX6YK3A7JX3xCtx7nlq7T10kf13Vwf0zyi/JuDbYN+m5FNuT5zdjIveN2dZDgbaaZcteJM21dQx/7KQd2ly0b5k4VxalGaC1SYF1tlvrjgDGc6A5seukkhX9C7RF8sqKcTpy+R9hu3EeuQ565fQXxKwfOgLz6orzh97oi2cjbu2+bW9zkbO/mQL3B261MtTBc+36ilU3suOM9NpUUaFfJELXJQYpG5ASWgCrOfcTjd1KKZohYPSwqzxJqJUD0osk/zjTB/TXYc6U68JKlqKxYqS2N4TERNIyzLVIiXo+ahWZyoZNIlEYunkUiIMixjhuXRK+fCg4NmxJ+fDqE8o88hGc042eypUwi/rmpJU9WPVVG9eDxLm5oJVe3A0WzQiIeTNSzzXOva51UP1TJOn19Vv42pnopqxj2psDqpDoiqZfcRe/jer5bTmR5TEF15cPCng66xumfpGjWr6UZetYSYDs0qbza8Twaar3xrKLYc0bKIR7N8fER5NZptqO7mZqzl0Iw/7OCieTfKZzYy2K+XBwcGjcraPMpx2zJypRie2rob3/3RT/HQE9uQyxbxhhtegfe97U3YuLqXTr3AeNb+7YsHAlAHftuqhbnarq+vRryijtcfyDYNpmF3MqWOZl6G+ZulzXTGF4slg73ZY2o7nXt55moHBqwXzfJVPxpsNuI5m3Y2GzRTrlpxZiqf/8B4BWQbe/g+Orp0c47OIdbAqBba0bn0tRQwG94nA/NjTOIxGz7Sia+XRp2/6q55R2frOhz/xejoVMrxbBbfvv1efPbLP8LweJbOTx1lnIO+MpYv6cbHf/E9uOU1V/GIHYzKXPYfoI7WQX3M1oZDddCAx4vL0Sk/K8NMHZ2zDb+fmylsef0yT5Whlk7mrrf6aNRumpFlodBMGedDvnqOjg6fHZWWlxjBJx9qDD5ZI6lFjYWajwpVwesVvlGYg5VBcabKrzdfh0nnLM/pKIpGYWH4MkwXt1mowTkS/Dz8sNnVhzqVasfiLxuUIrYS1fNCw89r7vmx9pBQGWgLh44P4bNfvwNjxQxi6Q6eSiOW5Gg5mcCJkUncdvdD2HWgj1qVTsvQncjT1/1U+HYzE2oW4foJTs4YSqj6LgZUe7loevh1VasM1rZsfrVgVz+qtjhfcO2jUd7MXaZhxHZx6yOk8/os54zZ10UtTFc/02Mm8szEjuujdt2xBGwowcHsscC1NwPMWx0bzIfiz+B0hGkV/NOyZYm/Ozc/irEcm0sihXgiwRGiFvAVxz6K+tz2XXjyqa0h+5P1WAtye9UzZ9AsptPZXBu80kdpprAy2o76TP0uRshVE7OpXAvnsWfiuRcKNv/GMszPqOEMflZQ4mwuXyziznu2IJVqQyIRN5TkbC6ZSNKeOPNnvGw+h5ze72qTVUfw/MVNDJ/OoDnMbLY6G0T7L9uHzAySUaSXLM8lfS2aLWrJMZ/8TyuwmByOqrBSSuOptw8lcWQV5pY8xevkYC6G6eAquxwnH1IppoUnf+rbvE4cL0fNw8+rUVlcHTnyEQ1zyw2isCy6CF8ltzzr00zrUPH9/Hw5GpRHyfRqL0cRzEf9zhSh+tOSvspDPX3ik19B34mcWY5M0E662ltwxeXnoLOt3RaD5SxQd9+760E8+PR2jBYLtKUyipoNBlXgXqxgXq7A8xXiXz347UzUNIyHra/buUPC+HXuo5GdRuHHO3n1bOHnHaVo2WrFEYVltrYTHEQQqsc6cWaKymBKZPIOUxTTtyel8cteLatlN0+CzxHhy0tRql12V5OnIVQYRw5BIVmXtkJrxXkxg+Vv9KthAGcQhqymSDWZIU8ihu/86G6zbIl0GmXN5FrTeM/PvR7/90//Pf7gt38JHZ0tKCWTZolz376j+NLXfozdx4ZwYCSLLHno3sui0TsHEYZmXwe2EQcHZ7BgONkDrJOH2fcB0sdMv2AzHzrUs7j6YoJ9abhkb1b+cDymPj1bjurLkYPbl3q1jFArzosZxogb0Wla1ycTsh3r7GLY9vxufP5fv4tSpo0zM+qOs7nrrrkU73zjq9CZBt7wqsvxlre/EbF0KxsSTyTSeGb7Xnz91rtRbu3E9oN9mORMT5fzdEeobaezrwfZtL6KfwYLDWcFLy4Y05sDzGrESUYikUBbW3uoP28G0XiBo3Pesjb8abeZegcwI59g30KB4uVodrAj1yqFoIbukRt9mdFDcE45J6kgH1GePt94mZ1ROYEEkqxMjrrN6GE+4eskUp4G8JcUwzxEPuZH72EePunuNl1/sBQN86Fq8KkuFGZehhzQDKG7haPkVWnTkB2Y5+RIen2QeCRYrgOHh/DJL9yKExOcrSUynLXFsX79SrznptdgdWcncqUxxEojeM/N1+HsSzaaLzLE6cwS3N59xwO4a/NDWLJ8PfYcnUT/WImOM2746+sYtk5lnyy3tvSEeizDkuJYiqJqu8GJOqAkpESF5h+qvOqyVvOIplO9O5qmUHXgt5Eo6csjjjTOOBWo1lmVZoJa6R1Vlr9Fs4ZfB4JfP83B74N9mg2mlNGgES/FY12zz9YgUG03TLYVuNLNCkaYYH8xopbSp68AlohRbGNZzKU7ufA7kBcDwg2peqxBzuDoBL7yvR/jub3H6Icy7Eda0NXbjfe86QZce8EmlIsFlPNArlBCojWJa2+6Bh2re016jXrlxL74ua9i37796GxtxdGRLAZyjMuB1Hy4nUYm7BWpAr+cZxBGrT4iDN1kYnV+Ro+LF6ofDXbrYYF7rVNnGA36gjpwKWaecnosBM+TiVnUI5M06hcW1RDJe31XrhDHD+59Aj++/3E9+o1CImGu1b38qkvwzptfj1K8yLHuJHIM3UaH+M3n9+JoewpnXX8V2ugMNbPTWKCYi+NL//ot5OITdIYJ9I1MYDJXNKawcLMLy3ihnZ2dbeqfo0UKv8xNiFl1doysSjSrFyI7C1/UZT2DoI5qo37ILBEe+cswtLVkRsxN0ExgLn0E1GjZx8Hyl0E7I64as7Z2dOeW6XRutqiWO5zfXHieSvj16FNE2UE08wFbkl+vPjXqM6ShZuoyCl/LIh/RMC0j2qVEycNyUGjNuZ7cvhdf+f5dyJZb6MqSDC/hsgtW4N994BYk86NMmWVYCT/ddxife+xZPNM3iON0YvFVS7H8qouQbG9FQuUj8527juC2Ox9BKpYyTnP/6ChyzMuVyeghQEU3FNTRTFHhQfKXdB38cEeN4McL1Yc5V7WBZqHs7EAgII//QsC8o5QzdJHJvAZM3iaeXbrmJB2bH3sOD255DsVSwvQB9kYI8ptFnZxekI6CBmzIR+2wufWRzaKRXMrfb9k2jsQyIUwqiqZ60cI6sEaVYh2cVc8ZuA5IOnP7jsLQuamdXiFfUEhwNDdMX3ezBzlTSspaKmE0G8P/+qcvY3Asz7Mpzt7SWNbZgr//k9/DspYWpIo5ni/hgYOHceeJYQxlWlDKMX22xBleDF0XnoW2jasRSyfo7BIoTpRx111P4r4t25BIZzBI8zo8Lh7zo5fpoAv4uVzOOLsp1RYgWrc++QiFNSF/TWcmmgPUPsVzPlDPpsYmJ/Hf/vyv8Ld//wWM52n/GuyYEZFsu5r33AfCpxdU1FrlNfV6GiBuKpy/ZmBimhKbA0tT0DCwSUh5PnmIBIVyCx1MRf1K8ZnOFj6P6fhE49YjC2tg4UJNU9R5QzKZwMTERDi/RsZth/xIp9MnvRE4rTmKolaYRNSIPR5P4pOf+zp2Hxuhg9MXCoDOtiT+y2/+ElrUwZaLHO3nse34CTwwOIJhPWqQYRnb6OxSCcNUL05ZdvkFiPV0cxRJ58l6O3F8CHfcvQUv7D+KVLIVB4cmMJonP2rSviLNl4aQQAHpZ8PtvhdUE6ZpeqSBh+qhFhQ+HRTFUfSg/sPRgcyV6Z8Hk752mLWVemSh8pR1w1lDhNNqUOHIngujUgRupeOO1gy++Kn/F3/+J7+L1ox6PDv41db0lYxn01he7tie81GVwcWtIhrm08mGBHfUCDaO1UFVD1PLHcVsy9d8Ol8W1ZN+qjEdudURM8er1ZHWgimgEnO/fvaO1/T86qNBDqHWrq3dRHanZN+40/VTNorXCM3yUIfVHFUxVZd+fzEXTU8HmUaGsxm/aGYTkq8KSm468Ji5m7J2nIWCZAo9mO3ByOyRYPWs2/9b8PUfP4Bb73uc+/rsThn5wgQ+8p434bqLz0WpPEF+Ezg4Oow79h/BwbyWtOhA9NxAOoVYK/VDZ1ei8ysv68LKa65CPs45YamAFB3kvt2Hcc8DT2JkdAKJZAb7hsdRoPNkbGkrkCaAPKxHlZmy2UpeR0H8CKodkaX6jyPY8IbwFObtUhd6M0zCyCGE5RJR3kpsH+5c7TBX1ihNjdsIVf7mI7keWXlFOnTH1AH1oEGJSLktZx2uXd3LWYAGK3R0Zh1ZDk/kUOVVHy5OrXh+mE8nGyqbT/Xgwp0emknjUC1f1UamI98G7LlmYJ0cKVj7dznTZptjIMzHh1fngsnJbLAXgKL7yvE7Of4tGkQrbTZQn2RGsw3sqv4oe/YQv6jTONlw9ev2/etOc0ccmx/bik999XaUMx16cIfOKIa3v+4VePPLX4J4MQfQ6Q1P5nAXndzuXAJZOvBykXrWvSWm72O7SKbNrLBE5xdftxTLr76CVcXzbHRyaPff9ySe2vqcuX43UYpjd/84xvXBVBZFZdIt0K6crqzzBTm7qFnMJZ/GDnR2KBQK5uHghUCJ8k5OTLK8Opq53Cqvo59V+LYZpdMBTXktN/1zZI3FURQquKPZwudfzaOlJRPshTF3I6yd38ww01FO87DGRJ7cGu51Gp6W4ObL8KL8w/W/sDDWw3xYmhk5WV8vhqSvOmR+sQSe2XUAf/u12zBmnFQMBZ674qLz8Cvvuhkr2lsQz2Wh13k9sP8wnhwtYTKRYh2wo+c5jR4lqPk8kJ4bSGl2yJ1UGr1XXoreyy9AMaZbXLT0WcI3v30X9hw5ZBzfcK6AfX1DGMty8BboOapaHZsZu8iccAcBLTBUB44WAn5REsmkeTi4Flhdxq6rVB042i5MuhCFuzMnuwYXra2tVLOL4+LXo9mh+hoqkW2LVWoU5lM1XrQ8Cw9VtE+N0KzOZsLTR7Q/rZJvNzoThpNHJNg0s9RkOOMwohnNBvV4LxTmK7+FklkNwFXVQvBfnMjn8yp5cDQL+KbokVYx5ET7+kfx+W//BC8cHuHMLcl+pYxz1/fgd95/My5Y1csOMo9MpogDo6P48dEBjCVbqH2t9sdMM/RhOqkEuZLipHw6iY4rz0fb+lWMW0SSeeYny/jkJ7+GETpPTUqHJ4DDJ8aR1afrgo7OIqhjHoYtKiiAoVMHfwA0X2hYIuklVPTQQbB1+zVQUaKfrhHNFrV4zZ6q9nAy4ZQ1XR37sk6HZnlG4aerkn80NfuoXDbmyR4yLAjcaGgxoDpa09bSzGCqz6D6mIMlP2yxYr7qQjxSKc6e5rFTlXOTaOI9PFnAV2+7B48+u5uOiHUUS6OtpQU/f9Nr8LILzuEZOqN4AX2Tk/jKs3txorUTec7ONIqMltEekz9n1JqVmJm1nr/racWSl12M1lVLEC8VkY4VUJwo4R///hvoH51Emb51aDKHI4NjKJT1Hgfy4BRETtBuA6Lcp3r52GEhnNxMoPy1xLmQl1DMaoBHPmqdmylUlTkOdpwd+TRX3gsBV+Z6dDqAY1gJqrXx5gVW2aqkwoY7ZEeWp7aO5gOmOwgo3PjdMxMiWk3IgJqH4vp5NIIfz5LTy+xRW1YVwbwvMdBl5dVG83ytJIpGxlxLty6+If0Y7OikI3i9mF7xlpAjYeeoBSHdAvLQ1j34+k8exjgFK1KRuUQWV198Dt5z06sYv4AkdZ1FAV9/9iB2x1sYR8tJqgR7V1dRZfN0I556FksfY42nEkzPk0yTWL0E3Zefj2R3B3WQRDqZRt+BIXzn+/cjxygxOvMhOr3+4VGkzHJVoCstX1Fa+xIjC6vvYF+zUnnEGgjVgZOxRhXqVJHtVDRd/VT4zCNkzo4awehWbUttjHrRYGKmLxgWl2qfVLs87pzrrVzs6co90wGt2KVS6Up+Ptn69XOv9i3zhVr5OmoeUS3NL8Jy6ViDAEtx1qMj8zX/EKpy2cdbrN74P2BkDvXf0XxgvvjUgiyiHv2MYSHVvOhg7XV6VO1A1+T0yRzr+JLYd3QAn//WrchzRMRuk06riIs2rsZffPwX0EreCWaQ5azhh9v2YWdJ1+7SSPK8ultlbfydZT0FckappK7T0UGpocWTaNu0Bh2Xng20ZozT1Y0cL+w8gPsfepr7BSTScZwYG8FQNlfH4eikC6iXc2NYycNQORKUtd61sTNYOEQHiFU0ZdyzxwzZz8z5LR7oxr3KzU3UtZqiTqtEplCOTjZmmqcd3danFytOVflOpW34UPbTyWB1FBwE0LjOPPKQ6cDff+072Hto0MywNFNb1dODv/7dj2F1W5ItIY9sPIcth4/i4eE8RpBCkbOIUozuMKaLacq7sa3JscbTSbN8mWTaImd5HRduosNbDU4szTLkxOQEHn34abzw/D4JhlKCDrivn7Mr8TMNs+ratD81mxljit6kS3NHZmN9/qxiMdj7qcSpKPt86dzO5sSPMzu1RzWn6p1APtVvyI3hT2mVVl2M6WYqhahFYbg0U8nJ51DUC3bNkkQVBXpyPYqg24qrmMqrFll5ih7Vk1HwyxqGkSlIo77LJx+K50j3qusNHY4awa+fqVXkZBLN3WiicOWg1Ib8soVIcRvqbxYwa10l1m3RkA8tcel6m6ME4yYoh+YrcQpUpuP54b0P4e5HdtJppc07LNPpAv7wl38OG5e1M32B6XLY0deHHx4ZwCHaWS7uFioF2p7ZC3Sr5+gC0sug5cAq19J4nEmlzPW6OPMqZ1JY9dKLUFraSg4lJOlg+vuHcdfD23B0cJKcU0yTwoETI6zPtMknxryZvMLXLctridQh+pqv6RCtC7d0KIpivusuah/NwpexlpzNQMmc/hoS47neQHdrVuqzKbg2J2pe0LBOXD/E4yksnGRaxq3ag2gh4PcxjaHwqmy10ByfejC155GPaFhVDuPeCA3muDc1cyfQfBp5M5hJfk7GBEfCvuMTkjzX2trStJG6fKfLeybyCYw9o/jNwsmxAKzrwhmqb6z+/nyjWsaZFFLyBbsBdKzRXTKRwa59ffg/X/wOkNID8Fq0TOIX3nwTbrjqPKRKY2wMEzg+Pow79h3D3nwB+bgcnwYhksMO1JqB0ROj8r+xRVoo0uReak1h42teinhHiw1nD7V71wHced+jGM5m2dFxppcr4sjgMDuvhOnMTJ5z6eFngZnr/cUF+92/aocatfnqcXX/VOrLymplqUWnCxZSh/QQYeZRxSxug69fiYtH7PkVZHwi55Xt1BfypDekRkU2olh5JBfnxUH0GJ1WHP/tU5/FwLjOcIYVS+Lqi87FO199LTrTKSTKcYzR8dyx+wCeHdENGmwcRtGWg+n8zd70qGiEMui5uph5RRhlYWvLL23HxptejlzCDs5KpTgefuQZbNm61cTVcd/oKPpHx8wA1b6xw0Q9/XGalEOOY3BgMDiaDifZ/iOgK+OA3q7AWVlq0RmwtWkNMziKQMqr1ZG5pc1TC406q6MuH/Z8o1alMMVx1AjqkJqh+nADckvSWzVdjB2uSPuaYJeo21qksLHxIr78jc14eutRFAte+VQX7Mijyx+WFr6enJ1MR/MDFVLLgbqLkg5E3oMUvFvE5GMaPsuuJUNQtxOFGD7xha9gXx87L914wYpYvawNv/CWV+O8NcsRZ8eWS6Xw0/192Nyfw1gygWJMjzYwbmAehq/y1n6F5EotWZuSxjmLYyXoal9c9zRr+TFBufSMHeVK0JHll3ZhxcuvQCGpc0zPfG6/7RE8tXs/4mnO5EoJ9A+NYyyr5whZTqYxZfT0WPlYLPdFbglT5OLVolMJo7NKO7DnZguNQWYyCGfppUmzhG3uVvZ0opUfWY8h7XMWns7oTTeMT/LjOkT7QBtODgEpx6ahGVlAlcsY04C5mRub9EuY/sOH8vb7AI+8stSieqgVt0oK54CsQlPjnCyE7si0Zwzp/4xhK2OOltoAZvQ8DX8FRxU4nZHoLpxcLh8cLS7Y5ddGBhFHNlfEwaPHsPfIYR46I5ou3ezgG2lUzycL0bz9ztwhGkd2o2M5Fw4RuJ/GrXc/hDvvfxLZYtJ8X66tI413v+5avO7KC5Eqcn6XSGHnwAhuPXAUI8kUBxbiF1CV9RS4vEXqIFNyZOoA6dQS6iR17Lbm7kZ1jnEUJcO569B97nojrzrg7GQMX/jibXjhwBEVlLLqTsxJZNlxaPDii2HydFvZQWALDlEd+XDyNoKLU4/mG66916P5hC2DrRNHPOOFydHF0dHRYc45uHSOHFwa0RnMDQuhQ2tDumLfqCVPg6oJas+Rj4Wo/Ghe0eN6KJsX0eo1YvOl0GZzbhYNxWKHt6SnEx/75bfh5tdeqb6Q5wInd8obmfJ3FEWjsPnA1BpQx2/PFbF1+wv4/l0PYWiMZ+It5rrY1edtwq++683GORXpEPfQoXz5uZ0YpI41ErTf0mN8UcDJHdeCTqf4v4P10cqGlSSp87R2Vt3G9VydcUJ0bq0ZdF98LpJrVxgZYrEi8pM5/Ou37uBsbhQlzgT1BpVByqZl1OqzrgFV6tzyNlFOkh3MZ4fUjCNTlKDUtpwG06ebCzSTC2NqmRvq4STVRRXR/KZq7HTA/NpWVQN2vUv+rkZF1gWNQPehFTXVrrCqsqxSs3AyTJ/OH+m5maWjMKI8bXw9t2Tj+mGzQ6UznFZ1fl7TRp4KszRHYge5alkvMuk2zhDSPE6QZcAzWMITNS/XfECZVIk+wpCVOPybT6hBmEYRZCjdmMPgvJxK32gWX771bmzfe4S1TwlY/8va0vjPv/ornPElUU6lcIzO5Js7dmN/ifqS7ji/kpvy9Wf25TxJjr/Jg47NzAjcgIN2pdRaCgstYylcaeXk6NT4x1ljGall3VhxxYVIdLZz7plAIZ7Ckf5xfOe2ezE4rptjEjgxkkP/RN7kxwwq5dVuxS48eedyR+ZMYOWZHhW5akT326wfLxrXFJUnq1RNF4VfP1FSHTj+To2G9Avq0dSl2pQjdy4Cwy8K6TrIQ6E14ywYlJfkdLIarRmSGBUK4skuJyYiL8lfJJiZ3mx5omTshHuuvp1WZgyzfh1cUF8o1HZgzcGljdLiRrjB+csrtsEpPDCEimPTORIbmKO5Yi4NtNK5G9MK87HyV6kR/HC/w47ysBTWmZaoJ/JFfPWHP8VdjzyNZDxDl1FCqjyJ//2Hv4MNK5YZpzdezOOO5/fg0bEJTJb1gc04CsFrvlw34fJoBIXrEz3ZRAK5uL7DJx1U02lj6sacs5+4UdvRQ+zptcvRdfFZQEtKMVEolLFt+yH86KdPsAz2Gt3R0UkMT0oPui4ZsQsDxzuQ098nnP6apVp1VwuhPE8TOJmbo+pgpUo2zIf9asj019UWBYz8tn7b2trNvj0+tdB7bUfHxoKjuSNaT1NK2KxjIJvKT0dVmn+4TmeqNNG8LVXF9lNG4zVC7XiOk5vH+qPCavxaVB9KGiaNRCyZHpdVZI2RmpZBBoZZqUhTmY6mwu+0RQsJI5O2jkIHOpbMwfkm0GxcG0+dtDp1fSw2jVvv2YIvf/cndChp81WClkwSf/xbv4ZrLjqbjWoEE4VhPLB/Lzb3D2FcM7lSDEWTl5pE9TYTWw/Ud5mdnOIx1K75a5lTMS1kEVrlKPGkZmv2x/NKbgrBssuR6DodHVbSvK2feXF613P+RnSds86+1oqdZqlUxJNP7MLmR7YjVyghGUvhYP8YJrWGSYaaebqcpXGjdZuRPa9d7rlThnRsyLMvkq0zu++o+n8eUM3Y3yXpv4dAULVdQzoVUBTRMjiY9hBBiE/oIALDiv9Mp68Dbe0pH7VY2PebcnDnCz8jmMwDCsPlVYulzsm9mv6I+VaJYXVJ4dYxW7LnwzJYCvOsT3OB46H32na0tzfgOVU+S43hYtnanCWMYRlL8KkebKOaMZjEb7BToZO1SJDCHEXDqjCNPaBwvEhcHho5uCvj8mP5PKLUEGEm0RMBD47e2ZCMg3OOj52mCTM/nQuOI2Tgs1wg1MpbxH8VshsXFiRsgAqPAP6+DxdPMxzp5RCd1//9zDfovFpZXwn6qTx++xfeirfd8FJks0NMkcfugQHcuf8w+nmka3JyUJphOecmkoPUW1HK6vy0lZ5Z+brpJM3OTc/HJZxBkOyAR/xsWnuzpAodyC75mC6R0oxOnaP4Ml46gaUvOR8tG1fo5ZPGgeYn8/jxjx/CviNHKFOJciRxuH+CM07loGZrm64ru8mEJFsw8ptD5WmpKma1fCZM4NbYkCOTxgY1g6oMU6GzjtwOuzL+aoFyMcD0c6GEUVQDjah18rc6qJJ/GIXThx78D8ewvCt5OAYkV4ZK56wTJD91Mwjxj8DUW0A+TFY6H/yCMx7Vg8Kse7TkoAyitLDwHVp9ByfUks2n2lCILFrtkn2D2bUhJwF+pVYpCJwJpBOSmeWcNPnDcp8MaJBfKR7LWmKZReZdUqZTItk+bxpjWXjYvCWTXeaRc/DrV+HVD3aGdRmlZmDK7tV/gvlNTAB/+Od/h2wpRSeTQinTije+7ga86fpXoSVepIMZx/HsAO7YdwQHC+re1OlTp2ThbtkXrBzkzVmX3qhS5jaeTJg7NFOMXMq79+i5uGGZ3blapESm3QVLmOqwJlsSWPvqlyC5cik4iaMwMUxmC/jGd+9Gvz44TO83no3h4MCYeSOMlTqo+CZg8mbZwnIE5/Xzzqvcus4YXs6cHo7nXBBekj2ZsHYpE9b7SWO0nThn0vYxFmdjMy+f06kPHbvlzvnQ2XxjofuR2fJ3unTtvhEViyUUCtU3JyU+9pH3/2kikTYHzarcVbmJP0Ve00oDinJsVLj6ubNoJrSSJ2FHMVHYvKu246eyJ61hOfkcDxsmVJVZg4I02tqmGE5XD2Y0VodsxYTzECtLDGNGOl9mB3vHXY/j//zfL+M7t/4Ya9dtxOqVyxioxyVcmf2y10ajYMlp0vNfNF6oDJWdquzmrNmXDGWMFWPoH5xAIsnOIsFz7KiDFCapTRKUuS4pjuMbHASwM9wgHo91G38s0Yo//9SX8fD2A5xN0dHSQZ111mr85nvfggvWcrZUynIuV8YPdu3GQ5Qtzw5NMpilRY+/nYXpvEJNDLM13R1NwFiNHFQQz8SxETkwUfnZkSmOg8KCuhEZ56F9ZSDHzz/t6yH2riU9mDh4HOV8gfzjGBrJY2R0GFdyxgc6uDzPo1xASypDeWQcJgeyMFIZ6JSkcj8bFJyVvKaOSlYGMxjRm2JazWMR5YLsiXNIhSlZAKMBpnU6qQsG+rbix3WnTXm1cScqZBRh96cEeqDsLq4pXz1Eg3x2USLU9x44NoxP/PU38PBje7Bs+Qr09nZSXHaYTi6DIJGr0IB0Nop6HbpNYnsRv6iqRx078hE6HwmLHEYgGRy5xJb0KI2flzmrskhAE78ebHqRidokwvqo8rBUhdqkIwXJVgXJNTExaZb+o884GpkdMYHdtQmtphcMjRTVPCSqI4dKwRqiVsooZiZjldv8lG2KjP5hcEp55TmDuO++B0gP4aEHt+B//fXfs/zsqLXOXhlczB3NcfGFs/u2PrgXKyLLkdRf/c+v4Q03fwz/7yc+i+HhLBJyAC56ABu/PtVDqO610QgukcG/cADw0yeeZWNieDmFno4OfPiNr8Q1569HrMCZEDvIJ47146eHR5DliN2OIsTPsjIwB7bxC2ogIvuGEjkIBtCBarYahTouc72GDsPJWJHV/lnSPhtpgs7YLGHyhN7MohlpfGkXei873zidJOtW9zc/+vh23HHPE8b56G7RE9Rn/1jWLGMGWo3A5FKfgo25qkiZP/X57+Flr/8IPvZ7n0Au3mauVU4ZSAZpBKebhYPydhkueGYWLFScDv/W79+D2279Eb7+r9/Ct757u61r074c+XJFaSaoHX++epUwolxryzwxOYl8088Z1+YxM9TnYe26GuY7yLa2VtPOasJjZ5ehLRbY0c0/zFen2TgNuRJFMJtp8cyhDiyQg7SQUGmSiSLe+bYb8MH334SP/eoH8Cf/9XfY7MYphi2ryuxorjB8gv1GMB242ZoN0+m/dJFAR0caG9au4qxzFUdfwUPYpFDnPwvYdC5fyycRb8FDTz6Hb9+xGaMTnAnxl0jG8OaXX453vupaJIpF8524Z0/04Z+f243xTCvF1Btp1Fi8xhDYlDpydns8rtOY6kI5a3lWHWIYRlaNMkl684Y6FF2AV37mZ8rCrpTOL7l+OVo2reGMkxxVv6UEbr91Mx57aqdxTHos4vDQIAbGx0w4JQ5yqQ2nJ5EPzRjVkRdyYxyITOLgngM6y7rS0In52GgG82VbQi1ZFgNKnO+/5OqLcO215+PNt7wKb3/Lazl5dLfgS97FJ/N8orWlBam0/djxfNX1fEEv6NdP7Uf1MJ18xsaCfSH26P3fZLvpsg0q6DQFb3eG8Bt51DiqYVqf9lFPcNOMvYahC/VV6KB6QiP5evAblknFwypPbWdeubN1cL6Y4Qavff/YwlRaQBJRW92hpw7OGmUQsQKr21rlUVdeD5obOtiyVeOG5QzDD0tKRi0rJtPmEzX5fJYdf8HOhoI4si1jtlqCagI+fzuwqNpDMpXB3oOD+It//Aoe2fY8821Dnhmcs6YT3/qrP0OnHlrjxHdr33F8dtszOKAD8ijFMkY/RpaAvZYOzbU6kk6ZfDwV6py++O3AUgZ7Kk+Vj6Cl2gpMQDVQX0PQDS26zlcgafVS1xT0WESJlOVgLn+kHwMPb0W8b9iUWXIt723D+z7wBpyzfiVnf5Q9n8PZq3qRYV5F707MZmBeeK4/knRYKlIGzsTjrJNCQe9T1bVDrww+ZFeR9uvQqA2ZOg/25wuN7Nmvj6kIt12znKtOlLrOF6yNqYxqY8rDlotUTydEzNNJIz00gm48mk3KcL9YbR9TQBntCpDD1D5sprJPzcvXQ/2wqajKEubZoDwNIGtTaZlanFUoMZk5o9ljdkawEFDj1gi8epNEM7AO51TA1rdzGie73qaHJJN5FQtZOjnOOMsFNkIn71wR5qI1+lE9FH7bj7Hl2d30PBkUOPNd0duK//P7v43utK6jFbDt+AH86zNP45iRg+avxkfS1lwiI6n56S5J3S0pJUcdvcH8FMLkJ6fmrucpLy3FaIYnB6S7OVMretB9ydkotKVNJyY6Rqf33e9txv4jfeTCxsvBxIFjAxgtqFRW3mZ/tjC2QIXcJEqFCRY+z3pjfek3TVllh45Od1TLQM1Qz0k91E+Fm/IFOrJY6MIy8zOYJ1QHVdqrutCTBI0WZjvaqYfZ8pQRu4uazd5ZJqhzmu8yLDRsh9q4jC7OdPHqQenMeJR/msFZSyOvCD8zyGsii6gs2rWHVvd6dOCrP7of37vjIXqClLlhp7stg0/+4a/jEs564uU8dg/147s7D2FviU4QjMOf+QCr2eOPPZtmS0We0rUp5acP+JilS/6cDIZMrk0icKYaQOn7iOaUs1Nt5VmD/MzsSqANxrWcmeKsk3bZtmkVei45C/m0PhBLXrTT3QeO4Z57nsHwkL5GHkcx2YK9R08gzxmhrvmF5G1ABhV5dGDPmTBD5rA2TJQIrwWEn1eUmkGjdHY/OG/PsBpU78Gsrrks5o6gLqxln8Fc4dqZg+foWKPqAAIK2um0NBVi6UgZmbFyQDIeNUZ7t1szMGNV9gqOwhAPx7P56ykmFUXT6K3BSkRD1L0YWgNRnbl8p+atE1V9uUbpGmNVr6LpEU4/M6jZU7MV8nlFaTqYUjGaI3eueTidBKmYp+4UfuDJ5/B3//I95ONtPJfCqs5W/PXv/jKuPms1nVYOhydH8YPd+7GjUOJML033lWFJ9GydbvHQs2lAjg6kQAdiFqhk+8xGNZvQsdfhWdK+tTWRX6YomWtpjKMH1nWN0odxpMzTfJmC+etJEXNfEY0ynoyhhY6uhWEJOu7eSy5AatNycK5F2RmPjvORx57B5ke2YjJPJ802oRdGHzjeR4eqpTbFahbMm8K6BTonuwFV7WaSIh/Kw69//zEEkR9mpoYBmbhMO1Py20uUGqEiQw24u4Mt6ZgD3lgGiVgrD3QXapoyJ1mH1A/DQ7qpQAJU2+tsoT7B8VeZpG/Zn8g9blGLXBxR1VZFUUGjMjbuR5zefP0ppXv8RhQOj+rB5z8THTUbL4xo/+r0qa0Jp8OrXdImYEYfnsd0sOfs+XpxfDQTp1n4yo9SLbi851OGmaCeXM2iqun5ga8vzTL84+ng4jQT1zfC6eDyN7cSVxpYEjv3H8F//+S/AOl2M9Pp6Enit37hZlx72VkMz2GyOI6fPL8fz4xmmZ86TPGyHQR3SNSc6cWVS1WLckAt6Vak9ehBs0LWhE1rbcvsVlBk3nKyZpnU6zSMbIS2qYQ63jgdNLD6pZeibc0KBgSdGM/fee8jeHL7LnYJZc7kksiXSjg6NGCObd4+NYDYReK4+nFyTaUg4mkMVxa7b49dwYx7pY5FOjoZqOq2Ktdige0bI0a8gJiP8hs9enWnVs/NzAtiH3hkmilCRRv2yVPQzOHKffJlnFNleh2w2Z3nhmFls2biqBlEy2SMrdnEEdi0LrE6Hc2i5PBiyHMK9Cf/9wsYymo2kjFW/JZXX4ubX/5SZDjTLsbyePjgUTw4MIpJTZWYVk7CCCOWhnfQmRn+9r/sOcW4Z/Uux+runib8nGFWJSVwRGijN6HIQXPeEMTjeZLGrDaaPaetymeeB9SW6ZLaZ8hkOoE1178E8fYWE6a4I7kcvviV2zA4Om50kkxnzF2YJ0aGbQYmJXlOY9qMEezNF+ab38LD1A31ZHWlepC5WN3bGSrPGr0vLFQXtj4WMK9ZsDaXdozTX3jMl56tHquwjs7UcKRFeMuYtbRjnhdS5xF4NffuNAs5O+0rndI7qsJ2XPYW7yiFIUPTuak8FhNUQT75kHpD1KAy6/FQQvPgqlBW5207RP6zHWooXVXnehDZz9vBxFP96cFqR4rvdK3O2SOff20ybA3UKEQ6r4DqTMwnBfnLR+Fwh4pNmPNxTJbi+MQ/fQP7Dw+jlI8bh3Hx2evwtutfivY0HV+5gL0Dk7hj/whGzVJUCloqVNHdzSZ6y0lJn0albZv3V1JHJUMljOezeOzgXuwaOG7yZ8Ykq0stgBQVj1tLelW0JX23wC16isQ7T5nj6RTSumWb5+IlhtFJ60Oq+gCrKM665PzNXF/Thbu41jHZtkpJ5qkvk1NePZeXa01g5bWXIqFniJhCC7HlQgqf+sdv4ejwhHkOL5lsQd9oDhM5PWJRG7rjs4SCoTJ1xRFrlQKYWSi3bjlN1AiheuOf7NGRszuR4IfNHrY+LDULZein80iySffqa5J6K0qae0najurGnGWEhYOvI18/jXSkIF/vjSha3tnMVA0XyldrKTsI9aiKWvI4cvFtG9e2OZmifFRDUTL61H7QF4WlOgWojKxJVmFTC3IGMgf+4uzkWnpRaulAodzChsDZDPsn14nMB/zZeLQeXF3Y5bj6mZqXExPqLitp9dNdhiQ1lKjMfh5hUhjT6aePqP7kIdz72Dbk6CBKyQy621P48FtvwEUb15BLGSOlPL61/TCOyREovWXfPJignNDggRScEmqVWcu7UXLQzS3CxOAwRvoHzMzAChOVSMfMi6zdbE6kQWSCnW4yQWJYXGOc3k50nLfOOMEUVUwN4MCRAXzpGz9EjmyS7KDTiQyODA2aN8DothoNiOYb4fqxJBj9hFV0mkD1zTrjAOPERALf2bIPj+4ZRRZ67Erfr1RHbOvEL+9igFbWZiOOLYfre+dWnpmk981DyU6WLtkKXNbRDHXeUYAagrlQP7aj2UN5OJoJomlmmt6iVllEdVErGyfKjETwE4mquY5kS/jrv/0Gbnnr7+BXf+PPcfDYJErsTROMotv368GOCn2e1U0tOONj02bHHUf/cBZbdxzFoePjnM2w42xibKQ7GXPFMo6dGMXIGLvcytCUcppddcKC/juqA/Kyo9sYHn/2eXzvJw9jaLzEWSZlScXxzptfgZuuvQwpxpsslPBjOrkXuNWMRflIM/pvfjzQsb35QnmqLFPLY52w+RfoLwwbojCO+7WyQT3JtVfOB9u4BiGZNOLt7ebbjS5OiGK6quYGBlYWdkFWOjpHPXKQSujBcsZOJpDauBItG1aixLJL0DSd296dR/G9H9yNbE7vxNRjz2XW2wj/6waWYBUggMrmSDmFpYmiGqaYVmvBsTp/87lZPWCs2a5gY9VQ2TyjKpfLs0L+oUHooC7ESXPdj/7yR/BHv/xh/NI734E/+i//A+PFjJnt1+fhwqbPIwpnl3OBnG+D5t8kmpPfaTyaXaNB71T4+vLzrHHedkaVw2ZRSxrbsmioU7h5LcLmZ0c0o2OjZr9SOIbZjqgG2RizABOHqD4qujDkRltutNI4bS3ULIejII6DO28yj8IKZMjnMU1xCBdJpBxt96iH2gdOHMSh/U9i++MP4UTfCVaNOjE2FS//qUan/H2yXI0sdWD1qJ0E/uITX8Lv/Ie/wV/81b9g194TNrH9VxPGydHHfO5L38G/+a3/hj/4o/8PTz+3l6UgQ/1V7Er7bkQ51dkIJowmmuD2aP84vnTb/dhxhPYHdj4U8JVXbcQvv+2VnPFMYrKUxQP7DuLhgSHkGIMlNVLKjajj180f0paeEtNSo11iVL7aqrABjHhMy5mnc0HSqZuFiqeiS3/m48Pc5jmDLRS1HGjTmJ94KK5kUfvigbvJI0T6kbHNhyeUghtny1r2TbbQWabTjMlStbei46KzkFqua4ic5etB80IBDz+2Ew89tZ1lT9AftmIsl0P/+DAHJ1FHZ+WxZE5UKQTvPMlsjARF5DmQuPVHj+E//9m/4H9/9keUvZ3xOYM261r8k9xB0hCCc7XCQjqxaqgL6cuRpAqRVZ4lU7/BeUONYMt26YUbuTeAVCaPZcs7eV7P2Cq8Vnqf93T8q3BlrNhLcDxduWcLn39E7RW4frMelM7nM1vQMsz/2nl5YfQ1rh4rbSGgRjCykZyMztZsC2wSavwd7R1m303jHSproSTFE1vzLj9SVEhtlN5fClCIvfAr46wPhTcaQSjMTuddXsqjMc+5oHJTzgJCTbClJYY/+S//Bg/c/w3cffeXcNnFqxiSZ0NRx80uSB0r9T4fsoiH7gyUhSQ0QxgbQCvV2d3exlA7U4rC9DnBtkydPL9zF3aR9H7O3S8cRrmoa2V0WwyvvXRp68mQjNzYhwZXMRQ4k/zB5ifwyLY99L3s8DmN3bS6G//fb30EPWl29PE8dgwO4oG+QQzSwuXQ9f04yWnsgaRPmMrJFYMPrDp9qf5qlYcRTJjSyjhN/AipB5ws5MmTtUB5zbkApi7UDsxBsHHpGsBez6zqQtfnxDvTkkFCz9gxfamzBT1XnI9ibwfryV5fHBrN4c67nsDW7XuRLxbNtcSjQ2MYnpQ7tm2hWfhttRYGhsdxz+ZHcPsd9+LrX70VJc7e9VNBlcqmN1HnBU6eWuRgnCt1N3uo3yrgv/3Zf8QTTz2IBx/4KX73tz/K+WrW2GAUjWRpFq6/PJmQmG6JXbYYLoM5vfgwS8FUpgIHgaacj97/jXIq5e4w8xqh93qmaCVO11j1Pko1zlRSt2gHJw3UIVsn5HhaVmHnFH09mNL5UDxbScGJCuwJnY+KOJVnbUgPflK/Q67qoZqxTlU6OS9uJPsQqqltfhbO0PxQz/jUIBjZ8TUdS3Bs/pv8bUcaev2U+IUO3UG1DqrgOXee2WmTK8ax/dm9WL1qOZb2tpK/HJ1iuf8WZo8JzOyEB7v3HMBdP7mfNpDBzTe9DqtW9TDr4FkwkuT3b3KoNHhlas7bFQRdp/rJlh34s7/9MibkoHhuxZJW/PFv/jyuOWs145VwYGIS399xCC9MyOlZwTXj00uPVevq6gvkV+A5OTw5wrgcEcNEIaervAMRrH5s522+O8c/yez0pnQmPcmwsFHMgTtWp1KxvcAoba1xy43iuzRyYtKCiaZ/docb6oqUY7vKjo6xTgp0cCW0TBRw5L4nUOwbMnHEb9P6Zfjwu9+ANauWmngJ6nzT8m60Uo9aJlWzdvVmNVBtF7akDgrzwEPJLTVoYLX/YB8OHDiBZUuX4YLzWA9lvTZMZWBc/gu/aUhlCPb8034eJmsvfz8o0LeDnckF8PiaaKGogU3VgAYRFZh0/EfSIKtcTFLftFXVnVGPMtGAViWPzJCDrYHeo+ahWlZPXqLa5gP4J/yyNYAROZx7XYij42rqkHWjVQA9f2k+GBvA9GF2L5C9Kkt1z6K5nIVZpgzqRzpXPzCTspotC+CnWBBHp/gmTcjYp/JxED+fZ9gpBbzmiNk6urDPYKAni7PJucjnbLwWD3O3YQVmPhTsq/P2GpUqlbJUdBhTmN03n4LxqjzUpqJ5aomNp3ReQSLH068fly6kG0LnS+bClO3KZUKmIckOvPQqBWucTql6TncSCoY3ydySn0hhrJTCe3/9TzA6QSfAcrW3xvHbv/4ruPFlVyJVyOLY+Bi+tu157M1SB0mmJRvdEaxyalnRZEtS7csJsjvmHh0oC2oavGYjRWsbakySqyz9GXFsOQUrV7Bvfg2gfIMddai6OUdyWL1Z3Qj2iKQwnjVvkzHH3PJPzlgJde1IoPugs8thYlIvc4b5Nl5XPoaH/vnb1IVNU2YHfd6GFfiNj78HLRxkFLOTaEsWsYEDFb3206pcuQpqd+HOuRmIhfK3ZXI8dRzsEOH98LFDLZuqDYVVw5t9R2pQiTURaluGveoqyMNcyrGQjOaFwhVZqa+g4dt68xBxdD5C+gglIrz8/H63EYzI4dzrIpSfxJhG707WZvvMhUBoIEI0to+p8PUtLIijE5TGOYJmIJ6WbzSRZ4BzwOnk6Kr7trLtcdjRldgZS11GZ6SQrms4OldnvtFPkdtzdNY1VOP4de7O+bpR/uKt2aS5FqVzYsaT0Q5B+0YOz5Y1ZhPE21yXSsYxXEjit/7kr7Ft1zEgr3dD5lDkzKG9vRO9vb1MVMLQ+ATQlkGS+ZbzdAr5Agq5PPJ0CHKwJTqxsnsFF3+JhGbf3Nc/Oj7NGPWsm14FpzeRaCSpD29q1kdhkEzZuzft29MttKf0ZpmeP5XTyW1GnySk9eiMnodLMh+G0cskU2kzw9MXxcXbNGaFkafuuCwXimapRWUoczYWK1D2HMtTzJnyaEnYyMC0+lxPKZlCmjwmObsqZjnTViCZFQs5vPK6S/GBd9+EFO0+l8+it70Na7u69WYxD0pgy2L3m4OJbdTDfzxwDtq3kfB++NjBP+dsqjYUVg1v5OjCfDwDC1DJM3AuZrnTsLd1aPBidnREqK+oASfrYnJ0s4Ethy3LFEdnKtvs1y+kXhtUQaRijBINCy9OgKCZToGJWTuIsMKaazV6u7reWFGBDatk5RtMBH6lmVSeeCFnVhNeIyAaN0oL0xFoRw3I4292p0le5R80RvHgCNT/bEyhrLVnlcv8CxtvvcaiON4IXjcz+LD5urwtw1pljS4k+HE0/3CQCzBuwAvXXsVGPCZyEIIckWaByUwb/uLvv4Kv/OABOgByodMydejKS2vSQqSFzUnv0WJqbuMocJOijszMTXkpFnmYcMa1pSOULwWJ6zVdtB91fEbfSqFE6ggJc63OnjAtw1yD4zlDJkT/TWm5qXC3MAV25P4TFMydET+9E7Ok5UbOMk0s8pErNQMH7UthAenr6ZrxKj/jJOmsnZ6VWs7ntTdcine/80YU6AQL2XGs7urA6iU9FZ1Y2DJMkVkIGVUNBHpybcvwCRDeDx83B2sPgtGwJ4svlhmQSAqvPFVUeTSEEtNmatm66sU6OnMU1L4D6ztUTj/vMEL6mJpNFSawUQQLWU4NcWsimp9kcWWtVcVO1kaOzsWppTMfiuXy12Y6k6rCj6j69evScLW7lqvdJfyySkZjO8TUPt6L2BxqJJjCtOapChqFOWjN33WGUZg3rs/DCGD+MVU3M1ZvBUrpE//PlNmU+LU0r3PN1EgVxqACmg6K4WZ8URgHI2InfuvdW3D7fY+zowk6UTPyZh27Doktxsy0NJPTc2+6BmW2jMzxQJpR9MkgOSo5gVKKjiHTglImw20rYi1tiLUG1EZqaeE+iVuYOKI0GdEBkmKcoYEzsXKarjLFmWAmQeI+j/XtO72jktlwpkU7Nfu6+5Fx9Covzeo0W9SX/JOc1XEbT2QYL8NwUrKFs712ZtuBTEsHEq0dlKPdythCWVMZ+nDKoxtxqJsSB3vmJc8c0GhspxuHfP2ba3Es++bNj+PRx7Zxv8wiZHD0xBAGxsfNkm4VclU6EaXp0VyseUDDjFxg83LPCBWWNSx2enNfQMyurLXaqM7paxoLAk/MmalLsX3y4R9Hw2ojtmXzN8rptDejC0awzc/owoI08tjRkYWP+unC/MOjtEZhYZyaGZ35N6VsjfQgVPnb8sjB29mcndGJnX2zBUebHABwJ5xHjRmdM/DQN7NMPrWFqchgC8JjeyhEZ3R+4/FvhKFUhmrpS2eM7wrCtNVsLsGZ1Y69x/Dnn/oKnt51kDMzOgvOcvSikHQqzfLapbye3h70LO02L2XWl5E14kv30Emk05g4egJDew/RA3DGx+OlF52Dng0bGYcOR3nypwvxWmK0RDmD84LK434FKtauRJCkOucluLH650kG6VpXSUtX1K8ttZZI7a3/WkIt6rtzWkZl0pKWGbnnJtcJFs6sVEiPul5InmNH+jBy7LiZ4S1fvpQO0C57aoaRJ0+R+Jk7HpWGYZOTWXNe+6oGXS5dtaILH/rAzdi4ehkKhSyzyGHT2jXoTrUyDtMG+hfcoMKCDBo1ZsLWHWUKbMq3g/B++Lg5VNuyvfmkmt4Xy61KVG3ML0P9/iAEpSWpziyYgeFH/XBXbczJH5rR8Zzq2qFRGUP6qKp8KkxgowgWJtY09ePyrJVfpd0ximxYjs68wYfHlXR+X1GnbFW914by9lP6fa30Gn05vs1H5NejKa3dNagf5rsmH7FH7vtGuaW1mwLVLohgv98VHAh+RxqpGC0pNQNf+aZwVHZF+fMwO6sqzKKeAqKQGqZGDXfWjSq3VlgtQ6vCL6uVOZpXnMagV0hJL3r+yfSFFFSdq2l4cnYe3A0G0oFrDM5QG1RzBcrT2AOnR3n6iicefwLXXXsVQ4LE9ZZGp0B8ghlYBOpWdN6E8U83SujaWC5fxqe+civ++fv3sFzs/DNJrO4C/p//9JvYtHoNToycwPN0ZPvRggO5IgqMoreQaBFTt9qnc3nc/8kv0NkdN3poW7USF7zp9ejauNHcdu+Kb7e2HK5+nJNW92XcFfnZFIpgz9ktda+9IJ2BMRxbHuOQGKYORM7DfI9PI2aeMzzl+HicYPZyo3KQylMR1PBTuRIO3/cUjj+5jY5yEr/0a7+Iqy7chDbxZizz5pl4zuQZj8v5lzFazqJvYhyb79+CR+56EqXhvH3dGeNfftk5eN97bkRLisflPFIcJF20fgNay/oCg5V1Ciizs5npEI4nPTSXttRsozSl8PlV24y7XlfLxsKw+q0HZ4umGhWPf/ZL66yZ4HEUAw60wrJMxXRlj4ZrQbQZVCchFmrbjpfkdtCutVAL8xxnBQzxIvvpHKJLltOVZ3rdRxG0+xCiNuPLoLjN5lFNJ26mzXJHlwDmhhkXcipMMTw+KrDIjTTmLGOTkIHPvTTzD6MPOow9B8bw8JMHsWP/KEfx7WyA7OVNZyEFkRSPOgtjZiWq1gO37ER088LFF18QnJsfmA6FjTa81Wgyhru3PIPb73kEqUQrEpzBtbTSyf3hx3HZpnXoTBWwrLMNky2d2FWIow9J89zcKDuirAYAhSK2P/gYho73IcaZjbr5tq5OZNo6UJjMoTieRWmCxP2SmRFJXyKpjrE5WzMkFeqc2VIPInrTmGZzQZj6V30NXGTqJzgPvZVFs7c8DzTeMGmVjiPXIolyF+nIitmiuYGknGVTpJeO08HHuS0wbGKMsjJM1xN1bfa5Z59FQp0cZ3dlzdhYzjzj93EU8sz4IO4fPo57Bvrw2NgIEpeci7VXX2beoiJHqk5u+44juOehrZhkOrpSurk09h05jknZinQftRGVJ9idLabwrAHFiNIpgbF5lTiGYxwg3PfIATz81GEMjuiMHtR3mEYrpglOr7lqG5sb1D+aFYXTAraGTVuvUf5m9DYXJH71V977p6mUvr8UnKmJSGAwDJDA2WzWjEKdYatzaQoN86vCXZdzCqqnqOlQc9QawIy8qWjzYt2aCOepG2MUv5YcNWVrKG5jHnYUF8Mzzx3EX/zlF/DFL/4rvv/d25HsasF5F53LbitvRiuyE3XaJk2QPMSH+4aCstSjCio8yshwVlVdJmFArWFgTShuhC9h7kzUeZZNsx8tH+rJgP3Hx/Hf//YL7GzohBKad4ziT3/nQ7j20vM5K4phknHuPTyIewfGMKw3PcY449RdlBwEJOhQ+rftwAu3/QSJiQnyLCPZ2Yq2ZcuQTrchlUyjkKfz4+wpTkekGz4SdEqiJPWW0jGdU9Kcp9MJtmbgwCl0jMduWTFGh8ERmN2K9BJl3SnJ2WSJzqekuz4nJums5LDy5s5J3TWqJUvtlyZ5jhTTeTo25Mibs9MSnd/k+AQKI+PIHjqO3MAw8y/i0JGDuO6lVyGVSSBH3WdJx+Il7CxN4PncBPro/MZZhgK97SRnbK1d3RjtG8LE8Ji5fqdXox3tH8VZ69diGR2/2oIecs9lJ9HT2aUqsnOKoJ5M7c6l4xEbUrTeo9D81Nmdo+Zy9fgGtjhdXjZNvTiUgz89o/lH//2v8NnPfhO33XYb9h8+jOtecR3SMW8WZ0Y0tTGT4UFY3ulktwil4a76If2Cw7pwcSoIs6mBmdX99LpXHFvX1qy0ElGte3OGeg3z8WXQ+enzsAjLbldKmPrR+79VTmdo/DrwmPm38E7xtpoKM6oVTGHqaCNxiGh/6DsbFxadJvuY6RJmyJmZnr8qgJn41IGT3Sieu35UpZNeXJhQrZCqfNElFL/sYSerg9CJKajyd/sx7NrXh7/91L/gqSeeRtfSpfjox38J17/iIrRyOpAo2zvunKMz040A0TpgiYLtzFDr7RC1EOYuvVmD9uHW5XXeGXw+lsYf/sWncf/TzyNv3h5fxrtf9zL82w+/h7PKLPSGkCdPDOE7B/pw1Lh21YpqIMGJThnD23fg+VtvQ/7oMSQzKSRbMlh1wTlIplpx4JkX0LtuPVacdzbGJ0eRmMyaG1WKnCEVC3Q6dGDGBkp0QtRhkc7FXpdh3VlBzXJjRZVBeXRG6TSTlAMUKY1x3ip3oDOVV3eSxvWArklrZVcc8ZR9qNPXfp6qEc/86BjG+4ato2TAhvWr8Rsfey9SbRmMMt0xDgMO5EYwkp1AlnJrpifHO8ntBPVRHMhh1633o9g/ZviqXs4/bzU+8I5XY2lvu8lfL4te1t6Otb29JneWmmctVDZ7p6mFf21Fu+G2rKlrbdTqF2rCMIyF8qzC5Gh3Dfx2Z7dVG/MtsNn+Q/1ZCfFUEn/5P/+OTu5u1mkBr33ta/Af/v2/QXuLymfzD4nHg1quudkyu3j+0qWnVgOfk7ssFG1PUSiNZ62sH18PDPE6han9A2NE+mTJaSw2km2987UQ7ctVhrCeAqnNualCVd+Xa9NWUTu+oLNu6fJF5ehy7LT0ElwDyePJ1MjR+ZBcftRT7egEHevjokf7BnHixAhaW7qwcsVSOgC92VDX6SQfZXF5LlJHp61+clruWI4umW7Bp//l+/inb9+BQrwNBdbjDVefj9/7pQ9gbc9Sxs9hfy6Lf955AHtoL7qupLRqZrr/Y3zbVjz37e+heHyATi7D2W4belavxtU33ojSWA47HngMR/YeNGk6e9rNzSxlzrZMZ0Ab0YzO6lCdAMtg7MbK6mSXzSu++2SRYK7FKUgHTj0K14E5Nns2jnesf6bsusGI25geqTA3yrA81FchQcdKFU0OTyBP+XXTCdWEiy5chw++701o7V2Cw5Rxz+QwhnOTmCzmzWxOy6iTuRyyjF/QM4XHx3DorieQPTZA/qqZBF7y0nPx8++5CfGSbIcDAjqpVUu6sYwzO7VFc1WKvO2vipPl6FzscDqTo9018Nud3VbqKWSB1XiNoQpheRMcMA2PY/++IxzzxLB27RoOCjqYSS6IJ7m8glPGWo7OR6Pyu7DmHR3zi0aoAaXxa6+eo5POQv2Uk6dJR2eyaEIeYfq+nHKZfD2BPMzV0SU+9pH3/2kimTEBQTO0mNpDemA8/ZkM68fzuFn47INtw/TN1KoHPYcUvYvHwbfPRlA0P6rSSS/GKIJzVbm8mJ7xmK35H2DKQejEFETLbfKmIK2tbejq7kQPR/UpjUClO0atcgzSeXUX5iTU13c9SJyoTPUQ5h7oLUhrlriDY+cAdfv9Q088i//n0/9MJ8dOJZ7C+Xqzx3vfigvWrUasJYEhNtSvbd+P7ZO6mCXnYOXRcubEwYN49mv/iuKRo+y4Y2jp6qQj6MJl17wUq9dswGtefi1uePU1WHPueuzZvwcHDx3AK2+8HqtWrTYzv5wal2Zb8aSdcSXZ+evhcW71WECc+xrpU1DGY2M1M1C3zxx5Xg+a68FzbZPaZzotg+vL35WZnGZ1Ircf5Gk/zKoy0dlxX/nEUkyri6Msd54zOlOdLPOJE33oO3Ycl110FrrbOzBAZz3CWWmWWjdLkWzW5isJpmNiktYMOpZ2YXj3AcRybPLlJI4cO4b2ZW1Yv2Y5WuhcdcfnGGeFrekM0pRbnWC4m7OYUvveiek6++ZgJA7+T2elocztxthYNJUXbzqYqCVkMgmsXL4Sy6m39jbWwRRthHnOIIcGqHJpxK/JseYUWK164KH0VXFgTcDqN4IZyFMz/RTUsjyHavrmeFnYlsA0mtGlMnpRs4pcZeC/GqhZJyFoZFwPtUY3dhQZzsMfPRq5GhTMT9fQNxto1NA4kvj5MdgdBXuE5JhRfgFCFqp9/7g5aERjxjvKk//UqVfYUJBm695/vCCKZmdtteDqKDxz5gHlVph+msnZaHYmx//YdWgAv/eXn8ahgRwKdCCrl7bhdz9wC17/squQSBWR52zvn596Hg+MjJrvz4mP7ulQLaVGcnjsnz6HsR076Pg5s+1oQdeG1Xj1tdfgqmuuw+33b8fbbroe56/qMsu7hwaG8OkvfJWOdDVuYZx8aRLHBgex7+Ah7H7+MDoySaxdvgwZPQdHXYyNT1jbpL4lr375XNHMmGJ0EAkzSyojm8sbpxunY5LDUfyCuTuP9kPHZh5hUNnJzA5sVV92OVQzuDy3+bx9ZGAyW8LExCRnteKTwL49BzjLGOGMXrZoZ57XXHsJ3vq2V6GPzunp4TFMIk9nl7MvmM6TtBRL0XR9MZYvYfiZ3Tj68HYwEkp0ZulW4Dd/7R04ZzVnyyynXivWQV5nLV1u5NQ9oOZOUW5VFv0awd1yb9qWaZBVI9CCaFOIpNO7JquI8KyxYqFymLqiNAsLv6y+VI1h4kdQPddIZq+szTbyCMIvhmC9Ml/x0juJNahziMrYaLVtpqjO6OrzDGcfjufLFtZD2Db8dMaCGVdpT7mjE9SQrLuzWDhHNz0kh9+wF4Ojk95st2MrTTCOjrC64bkmhanl6Obi4AS/fpyjs+dIrCDt62cdXRCBnf9EPoE/+Mt/xIPPvcAG18YOOIFfuOV6fPwdN3Niwy6yLYFvbduFWw8No6DrbkiRpZb26ORI2z7/FfRveQop3f3I486zluOiy8/H777vA+Y7bf946yNIdnTg7Te8DCs7W9mJF3F8cgLfu/VOvOWal6GzPcZZJHVLlehux31HjuHy9WsQp5OSvNKonFSBjkMPf+sVXnI+/bpjkjO3jiRnUcU8hsZHaSUFdDGO3lKia3x6hZc6EenWOkExs/YqzjpUXdLHmVmY8tOBnIyutWpWmE6mMZkv43988jPYsb+fcqXNJ4vUNm9508vx0ldchV3lAvZRhvFSFtl8FgXdDCNHJ5sRf/IuTOTQ99BzGHn2EOuf9kwey1d24d99/OfQnYlTl0nkClks4yxxVe8SlAoUis6kXkdn7VElsPhZdHQGprzBfpMwOpqCejLbEs0VIUfH/ONGaVV9OjjZastoMVvn14yjkx5s3qJm8wnbhp/Od3TB0mWap01T81AtrDk/VS9TYLNsIuIU2DRKa37qDCtkz9eFF1TdlewN0kyLiiTmV0EgjwGzaD4HL51B8ymrYBp1BsrXseOO3epfbShoKkV+YsjtbFFxXgJ3DTcadnVr89Ct7fZGjRhnH3F85uu34Z6HnzbOUTOht772SvzW+99FJ8VjOq4Hjgziq3uOIZduo5OyeajR6mXHe396Lw7fdQ/MHI/84r3tOPfys/H+m2/Emp5laE+msGRJOx7fvhNDE+NYs6obqXQSLZyJLV++HLsOHzbvf2yRI+IvqetkdAo9mTT5sZNlZ6BimVVFLRMz/yTj6pyWF0ucferr3+pezbNocbphOUM6OpNWpZXjU/kZbto5t3KEOjB60Ck2zHiCxDTKK8l8mIwU4yw1hkw8j8svvQiPP74d4zm6F8qQYPz9+w7j3HM2YPWKdgzQsU7SsZrrdCyD+grHXYOsWDqFls5OjPcPoTg2Sh6cRdKBjo6O49yz1iLDvDRjHefMtJXOPEPdVTu7gI+PWocmeiTAwPGpBcd7ajrfkU4J9w6pInNsdEyS5hceQab6Xyu7IFhhjpqBqbcm484IHk8jjx1t6cicmwmcI6o6rulg61F1Y6Gto1qw/KeiXrroOT8tzwf5eo5uKgsfjl0jEqoFmop6YTZ99WeE80jhdeEF2l07km0kh1GFggPyY1alsD8f4uklaxpmsFpB45T1dUTDouBajlKnbIeytjOOwsjpyKS0W/PzwwKyMpEMz9nB8lG/Sp786ZVsRmYdsbMVkrGUWRJEIoM7H3wSX/j27RjJcwzGNDe89FL80a9+CN10Rpr5bRsewVf2HMAJvTJLsy6y0vKdwgae2YrdP7gDCc7OxBMtGWw6bwOuv+oKrF+1EV2cmaTpNXrZuXd2tmDL1q0ocJaydtUKOo802lvTZtlwkJ1+d1sL3S9/DF/a2U4V2Dm9kZv/0+m0eTRBI1m9uUU60pJlgd5Z19la6IjMbIJl0gwuRVmT8RJaWH7d2WmKq+kcZyjqhs27POUI5djoXOTQpDNdz5MTNGQcpG5OUYFLaKXzPWf9Rtz78FOcudo600zwuV278IbXvpyukjPLggYPBSO57TBtrTMTU/9J8uhc2oP+A0eRnMyjSGfe3zdgZk6bNqymTVGP8RRGx8bQQn1qBmshLYiTdSEiQfk4VL6Q4U7KjvzI9aBKdRHNppqu4mdrQXECGLsjFejsVR/OpuvR3BEISBI7kZPVqaFWvi6Of86HBig6FTldE9VBSH34/LXnyO1ZR6V9y6sZng7VMgQnpoV4W/7VfKt5h1GNW4WLXyudO+cQCQuEbNrRNYtoBUZRVZKlmoicbsjRC7S7wX+zaZBySrrpMV3Z6iKUTAf1+dTKw+qKHQ07TGMnrEzTkVXi1tdp49wiUEczC/h5us5GMDKyY9ex6bz1TioksW33UfzN57+OI0M5FNjBr1rajS/+z/+KjMrImdyhbAFff2EfdubpBXXOFprlKCN36DB2fed2xI4PGqcRSyXRvrwbb7jx5XR0V+L+Z7ZjhI12eU8nMqkEVi3rQVdHKx576mk6oAyWLe1lupRxcGOTk8gyjy7OeFrpQDLMmxsja9I4niTS5G9emkzRdazzaXovOQ96N7RKLoUn6BApZoYyytmJrBOz+tHMTnzl1DQIMNcoqW7xNk6FvWSaMykzA+TPuiebXp8n6u5pM7PG7Tv28oSWMJN03jns3L4Hb3ztK5EopjCUm+CszurLfBpIstEjKh9pPsYyr1y9GkepW53XEuWRI/3o7GrD2pUrWTZdBSxjopBFhoMBDjmMDNYsVKeOZIFVW7FnPEw5UQ9exEiahv1uEFd6dS8c0HKv+dJEo3TzDIlhSHKQ+M9uvTCHShwP7pzIvKs3HDwFM3VGtWElq4Zbnn58J1MtcuEW1XPNQfFtW7aYWh4/ryrRDg3pxf4F0+7NjVsBPxcm8pcuBZdD4tc+8r4/1QtmTZwmFelGLiJtfNjMZg6fZy6bM4VxYBGCvakwBXQ/U1hzNqDacKGNY03FbMsWyo//Qsch0q/WeZE6sMAozT/fYFy5LRTNTxuCF6j1az+i8pgtqrqxW3Xkgs4nSDpUyNBkAX/5d1/GU7sO0Um10xml8Gf/7tfNx0H1HbiRUhY/2n8QDw+NomAcg9btrVEXBodw4M57MP78bnbBlJUdW5JO7NLLz8FNr3olVixZjpbWTjywdQfGOdtb2duFVjqPVd3ddKZLcf8jT2GSM7FVy5bSWcXR1dLKDpJOJJMyS5r2Ij0FpUPR1jgkLU9SfmlGzcNcZ5Sj47mcnJMRjdLwXIKNzNQRC6rZnH7kaHjpzspELLgxRbpQuPQSbHXSHOvmAOaha3U8QZ2Qt87TaS7r7cHhw304emyI8bTEmkB//wjKuSJe8bIrMZkvYJCOO8+0+knfpjZM4yJbydNKJ79iKfp2HzAPxedyZRw80of1m1ZwcNBOueN0lsBkLo+2jPoFlSLgU4Hl71A5CiJVU2gv2K9EiFIAb9fC6qUmOQfMn/5EsjfrCKYwqmAmjqI5uLysEIEolbM+KjEpv4lrtrXgODiqwpV/pginsXyr52amEyPDFLmC89OS+oRwWntci2x78EkDRb0uT3Vt3/1bDasi6uhsGB3de/80EW/hLhM0W2iPr5+FEM50BvCSmS+TS5bAcBvxNAXV1h4SjePPBfPF15c5So2hdPZHJsE5gWe8Q2dONfkFztJBhqBlE3PtaIZG78PpxslhjZqy8FhLewpPJlvwd1+9Dd+9Zwti6RbkikV86C1vwJtfcTUdnr6aXcYTJwZx2/6jGNPzkEHD0A0UWjrse/oZHH/gEST1bToxppmsW7cUH37Xm7Fh1Tp20hn0tnegvTWBzduexUQ2j/Ureuns4lja2YlzNq3Fd35wO3pWr0UPHaRmZksyCXSm5QTss2pqTCnuaInVZMF/ctSa7Whap/KJVCaKbxyQyqaZYFJ3fpKHnFeaMzptk0nNDrllSVLa8py5QUVk9u1ypdk38Xls+MvfcbancOpBjyt0tLViWWcLdr2wF6NZZk5Z5ez2HzyMnvYMrn/ZVTg2PIrhXNZc9zQ+lzz1qjMtL+onvWU629FOJ398z37yBSYmsth/+AhecsXFaOEMlnNR5PTGGAa2pOlQNQAwtekQdXRV2FwUu0r2WAifDyF6yOO6VMPRVRE6mBVM+1RGTcEJIKm8wQUR1ksVrhy1/a7j4KhmpBkhXBbLt3puFvx9dgaWZ3Pko1a4JStf+Fhk7xK1/YKF2zrUc3S/8r4/TSTsK8AWi6OzYlQL1wizzq8GXH71aL4wH7zMzKAiW3AygDushlcpbNg6tud1tun6jyDM38I5OpMH/+KJFH6y5Rn8z7//GhKZDtPhXnfJufiVd74Bvd0dLE8R20fH8K3dh3CcZdMNE4YfSR+ZHWdnfvgnmxEfHLbdHB1Cpi2NN99yA1Ys32g+b9PC6ZUeM1jb04ElXS3YcewwBsazWNLZwxlbik4DOPuCddixeydSLS3oySTRk8wzjXVYWkVQ554SMbLI3BxCWRP0GqkUHZI+yUM+egC7jQnTibJZ8qRvJdExBKQXF4j0xYUUKcl983wdG2pCM1Fdz1N4mtu0tmmkMyQ6L305PMPjFoYb4nk5PIWtoeNevWoZnt97AGMTOVanbkAp4sTxfpy/cQPOozM/OjmKMc7szHs8WQOahZpKYM+qB9GFhK5TctY2cWLUOMThkQlMcBZ88SVnM2bB6H8yn0OGOmiRQ1X6gKyVkHeNntrFmjFmlMhGNnar65/BviHTCdZGJU4jku3RdrlryxIN9yiKRu2nVvEaOzqHGjquk389hONa/tVzth5FGuQJM+UfhXjpHcVmeT7gVYsaIRpeTVdPbw51Z3S6RsfRc+XUVBi+CgzIjBSDQ3/J0YSZnZnDZ3OqUEv5fvlmK1u1kiz5COmvujEI5c105gYPx8f8gvjmnwc1fp7TTQomjG1fDwLrZ9+SYFNKFDVOR82iIkNA7lyww/wkp+0s1GHKw2zffxi//xd/h4ligsFpbFi+Ah95xxtxybkbgUwRB/MFfO35fTgsO1VnI6HJwDwzxw744A/vQ+6F/UZO8905Opc3ve31eO2rbsTdjzyH7c8fweplnehq0/Jg0czg2jgDenbPIQxN5tDW0W5ueknQqSxd2oVkdgRrW1vQFnTiegZOjwGYGysMMV+RKRb/Ma12ZfssmfnZE5VgUz9upqbZaGipxpxiKqMbOxNTuJnJMdjN6ozeFE/nec5c11MYnZWZ7dFJrqGjW76kE08+9RyyBWXMWdlkCYMDo7iMg4fe7m4cGxpFTh2Y3tMoneoiI4VX/Yu/OouW1jZMHh8ExvTmjzj27T+GtetWkP8SxtMMNobxXA4dLW3m1ca6GcjMFKUEo5ypUGmDEofg24sj8wYf05nU5uVgrdPOl0zOthKMk5P2yI1nq7qulRf/wqjkrT+lTSEfz2DHkWE88uxBuvokepf0sE6YD5Ul+9DXIKw0FuJprptrq5Nuxxyonr38jeQBTMOuzv/MJQRzWvHsfhWNddMMlH8F3DVXb03WgQQMl93akzOHkdAlJ5lSGJ7Sa31UdFODnF2oCfGMYps0U52cjWeF0L9wBFdb5hrdtDejRAJCh1PC6nJZ9DAKjsI7NduS1eTr4AdxPxTTO6g2aEcegsNKCI1Dy5G6IUEPLFeic2vvkAvg7c4EtcpTORcYtzpTWamMfYizhT/5q3/EwQF9Ny6Frs4WfPBNr8Itr30ZLbCMQUb9yrP78HyBMjONccnkZ0SlEfdvfgQnHnzCvIhZN/Trd9b5m/DbH/sV9LZ0obunC0/vPYRHn92Nnq5uLFvCGWIsj9bWTsQyLXjh8FHzXbnWjhRy5K8Z15qWDJYwjBmwNZiMPPLB4+CU38h0KqxK99NBIHsTULR6UY0e5KyCjN1WndK6dSvBKRme2b6X9ZxizDhO9A8pFi65cBMHAiUMZLPssGUMhpNJa5cwJTu3LVqWjGH0cB84NjAy735hLy6//CK00blpEVNvWdEbh9pakkpsKeBVC43KMxX1+YThc9VWzoVb8+eHNUIkjimH2UGWPu8H9z6O//jfP40vfe12/PSnW/Dt7/0Et9+9BcmWDqxesYKz6oxpV6HnUBtm6+SyFHJ0wbnKGcPH/Av++2hWR4zJumrYNgXuyhaM+mQDwWnZlLOvGSOSpR2wRU7OFEH92HoWrwb8TJCTPVyGM47Og6nwehUTnHZGZPVu4zdLDREJDh0GB4ZP8KsJnlYc6wrVyVJWGq5mA1HjpevxZFO6gP8MKIpqGHkzXzNTUafAc5PZAj79he/g4af3oVDWHYwpXPuS8/GRd92CTDqGXCaOW/cexBMT4/qCjX1gWkzJJ0U+Aw89jUN33Ik4Z3wqp8qjh7yvvOE6XPeSK9DKFL3dGZy9aSVOTAwxn60oMu7G1XQEYPk5g5tMJLFz924kWjPIZfO4uDuNJSndLymWauDhMvllbOSw/DDx0a+CiJ78evD5ay8csz6qPOx1t3PPPQvHjx/Grr2HoVeJSaDDB0+gvasdZ5+9GqN5zuqoCzOrVirdaUkWjo80HW9NIzc2juzQCE8UzVtejvUN4/wL1qFNy7ScyYySx2RujDO7jLlZRSnrYSblkRqc7TSG5eriGhGCtBzPmWVg6X46XpX0htQWuI0n8MyuvfgH2ujhw9SBuWmoaJaqx0cm8dQTO9DV0YXzzl5rlrJpluLE9J6zCIiKNmFVqmJ6R2cRTiXU17UP5a8lbLuKEIaRzYeTV7vmv4Xswo+rfUcNEWVfoxSCW85sCr6jM/wayBAKCuur6ug+qptR2Oh5XI+VzvvkY0qYRgbmp+No7KloWpkLCD9v03l55JyHGaXohKGZIcrTbMivckOCRyF9uK1JZn8OWkISX52xzasaphrQkWzFjOC1XGW21TgWJlaVAuOaDuZGEE8+eyehjrkt0ZnFEkameCqFb975EL52+0PI0ouVS3Gs6M3gL3/3l7Giu9W8vPjBIwO4bWAQk0E5ldDM5ihP7sgR7Pzat5Cis1SoylhMFPD6D96E/eNZ3PfoTlxw1npzY8mythZcxv1Cdhw/fehRDIwVsWrtSuToCAvpNMbYw29/+GH80nVXo1WdFGdBykz5mDdtWGVZMtYbkJErkC0CF+JCzcdwg5/PQzdz2DoKSGwDslF4thnycrQDmTKuveoqPPHwY+gf1DN0MRRyOTy3fTeuftml6O3MYCKnt6UED7UrM91QY2LyR52o7lra2jB2pB+FyQkzgxs+MYIsBwTnn7cJBXqSIu1HD6tnOCjJpPU+TKaV/NpGSLD/A3i6tcWQvm1xrD0GRNsxb/CoQeHr0bpemmRb0ZKzXTEwOvTgx61Fpp3RoaXjSRwdGMPnv3obHn9qN8+rnWiZkqQ4/Kn8z+7YhSVLu7Fx43qkEhyKMUxyaVVdA0ft6b/EqJWfyAwwyM8Qj40OjLD6Z7eKx38R8vSgaDoXwOcvSBf+scOUY0P6hRGNFwYllxw1YPlVyYfPs2knZ2C5qY6ncrWolNUZlOJzY/M0taEDRQ1mdOZmFDGNWMxsID4kLZuJo1/QxYqQjBFxVYY5I2ChEZPeMK878ZSlG1nX05FfG0aXASPFD6rRkp/eBIRTWmoCoXT1YWZu+jFfZ/xuX87byMP9Z3buxz998w4c6h9nR5tGe6aAv/qPH8N5a1fT8lLYQwf2/QOHcTyfs84zKLGZ1Y2NYt8P70L5+AnTIWomUU7Hcc3rrsHrXvMKXHbeBgwNj+JHP92KkWwZS3va0dnSgrM2bkTPkiV4YtszGClk0buily2M6SezuOWy87BCD4XrIXNmZdUmWcPlDmuryVZhyhzs10JzqrW6mwYymzKdj2VZwDnnrsNTz2zD8NA4Geh9m0Xs2H0A115zOcNjoM8yn/IxX2WoJUeG+uhowdihY4jr5c/kcaJ/EHHOYFatWWa6Gn09YyJXRGs6YZ77a9RlhUrQwBbD8YJtDTidVGzORdamSTIsSLrOVmL7KxQT+N5dD+HvtNqw5Tmqza5qCW550kmeLxTxwANP4+mtdIZ6XGXFUmR0SYAMK7IY2GN7jjZMfTvZXVufC2bbP09nU83Z3MLkPR0apa8tkzunLdMG6T1Hp7/ZFSaEgLEZHYnpaYCQMiMiz0sZAha6XqY7++yt/Gx0HOZplKP6ms4eTPNRJJLd6qTGO5GE5rxfj+aE3Z0ODRyd8qxQMHIM3RwTkPkcDMMHhybwd1/6Nh7edYQFz6BYKOEvfvdDeOUl55vZ6GC8hNv2H8e2Ec4i4uoUqA/mYz5Jw4Mj9z+Cka3P6gTFYgKGd6xajutvfA02rVmNDp66aP0K9PRk8NMHH8czO/Zg7crlWNnTjRUre7F83Qps3fkCYuyY021JXNTdhrO7eyUa+bGjNmqR4qeW2deWRuBNwfCrHddkE+xPB+lwWpChnjl0WLKkFUt7l2DLlq3IUbmavQ2MjODY4X5c/4qrkOe5Uc7sskW7/GvyoEwquUiOLdHVhkxbK07QQeoOzyxnMgcPn8C6tcuxfGkH8nKs5KMZ4tL2FtYRq1npa4gbOhXSr0KqoeF4wbYGnE5CfQo3Ot+Y7CxE+/xnqSWDp3Y9j3/3X/8Gd9zzNI4dHw94qqbtdwiLRdkjrbFcQFoPoXNgpBcCHO4bwOZHnsLmLU9hxapVWLdmJfVgnaKByUsyMmnQCZu8A/j7gpOzEULpTW1V002X1qGZeM3yminmynfm6Z29acu0QfrExz76/j+NxzP2XCWSzSBKzYAxxcrQYkKoHOrltA3Il1X7IYrZkZul2cGlVsegrd8IYrB339kpOjsT7rsGo1+l8TCuWTIyMiutRtU6NsnsHWjaJ9FVmGZrSGGmYwxI5xjHzvSVhrI4agC3XGmdnCVl5vZF7q7DUjyBz3/rDnzzri2IpVqNun/+llfj5990g4kzQWd/15HjuPdEP0Z1aYnCqKza6pb40RdewMADjyI2Mo5Eyd7tlultw+pLLsTegTyGOMJe2t2KJa0tWLGkE2etW43BExN4YusLyMcKWLdiObq729G9pAd7jvdjRWsK53d3IkM+0tmU8pp1pTrklGrAY4/MciCDjC4JX5WKUUFwYOrO7LBz9CP75PEPM2FwkF5WY5ai+TM6pw0tW7rE1M2zz1MHTKeSalY2OTKJKy5cz5YOjOcLdIT2jSmyBLNVGcSTrPUdv67uLoxyZic/mifp+4ebNq3jhI+DNFqWvhWoj5K2652gTCd9alvRAbeVuzK1lQGaGFZeu2cpBCY07aEOqZwO9jrwFA5ToDUluSHpZTyfx9MvHMQ//sut+Mcv3c6BAJ1+OW1Wnlo7E7j+urPwB7/1Qc7cHsfYuB7bKOKai9fgw2+9AQePjmIoT/uk3ardDQ2N4e67H8e2bXuRbm1FT2830i1OPsnmyl9bRts2q21UbbwWiYvaTkUH0rY5P33ZXRpRrZmPzp9MLHR+rqxG7wbaGuWZIzq694UcXTXBVDQKq4WZxBVmyn8mCPENdisOx52oiWqYNeDZo1bZZL4heFHUkaorKSGJUoKj7ZEcXjh4DLliAh3t7ZAPZtdj05iexpGHyKF/okZsA1cPPqnFVY/V4ILzofiavKXwo3sexd9+6QcoJ1spXxk3XXslfv29t6BT74xMJTmLG8N39+7HMNUpDuosS5S/yLJkB/sw/NATKB44bsokneu7cRe/9DK8590/h9WcrT29ey8eplNb2t6N3q4uM8NYs7oXBTrYgycGzGvElrPjN++LLGVxTmcrlrW08Fi5WZlDaFCttlNRBBdJXac9tmeqYZTWbAXX8QtTcjVOVNup5HRqEU7phzmdC5IxmUliA2dfR472Yf/Bfp6xNyId7+vDMs5yL9y03nzdYIROSnalpLaTtXwMr2Qcbct6zDN/cnYpOqmh0Un0j47i8os2MLaW3mOYnBxHho6vJZ0x1ivRnZjaGHJ8TedczaMR8d+Uc4YC5mZfPX+AKfECElR2OfE0ZXzo2T34m89/F1//wQPY/vwxFEuckeboxWN5XHLRWvybX7wZH377NVjWFsPXvncvhid0XZc2t64b/+5t1+HVV5yNrq52PLf3EHWXogxJ8xznob4TeOiJbbj/0acwyTZ5/lnSkYaZU+HkMtuAfJmnEqMwvq4VOlT2FG52GvfXtRxcPdTjMV9oxL/SD8+LDK7M2pJfwNPO6PQKsCDCfBZ4oZU3E0yRxTt0ZlMb1bC5FqeWPho5Oo3dCsUkO/Y+/Pnffgl/+ckv4Vs/vB9f/s5P8OVv3o0Tw1lz510bOzmbTP9rCBk6VT2oHds2shB4QrLb865h2UjSnY61BKu3d+w/3I/f/KNPcLDcjgI7gwvOXovffP9bcPbKVYxZxFHOuL6ycw/265tuTKdns8RJjq6cHcPgY09h5OkdiMt/M4DFNx9Sfc97fg4rOCtb1ZHGRRvXmg74kS272Zll6PyWoK09geUrO83r43b0H0Y8rWfkkliXKmBTdzf0jJyTeQoa9AfWYbl0kYhWIQZGDx7/ho6uQYZhGwnvh4IqUK7q8ErIcOa6ZtUqbH9uH2csEwyiY8rlMTYyivPOWotlvZ0Y0BfJOSM26TR4MXxVf7YOS6kEMt0d5mHykaP9qhgcPzKCDAdVGzetYTI6gXKBzqKADs5m9Co1U5pANm3CYtYUeioog+So9XPwnZxQ0ZVmjZVBqBycZq8lOqaj+M+f+Af8w9dux+Fj48hOJCl3DKlUEat64/itX34jfvej78R5a/W1C+AoHddXb3sYQzk9PJ3ChSvb8O6rN2JlZwovu3QTXnPlRjy3Zw9Gs8AER5mlRMJ8+29oYAyPPLoN3/vRnVhG/S/p7THvSNVAwvargZxOXldWHtanIFzRbSqDyrH559uRH8uh1rnaqOhygdAM//mRwdOJYWd5GkdnHi/gcb2MKn1EQKo+WxG14zeGrcBGaMTbl8VE0WigTlzHZyovNxoP4C2vyDh9smsHLlgNSseW9AsCSJajuxnDJzewMvuM6y9baDYTQugwiQefPYT/8j/+Drt27rV56o4zpM11l117D7DhFnHFJedCLxR2SV2+wVGEqnDLXy7MFc+Hmb2ZsGp6y5vnlI86SJNQo/8s/ugvP4VjY+wJOOpds6wXH3/3m/HSi89jvdFpp4Dv7NuLx0fHeKxrH5a31BNDHrnn9+HE/Y8hPlmwspF3sQW46d1vw5Pb9+BY/yh6u5dgeXsGF61bgZVLe/HczkM4dKwfXT3t5vVf65Yvg+z5+PAYzm2PYWNPp5FaOldetgz2TAUhYwjD2JuJYCP5o2RXeyYKIatyv3BuLn2VT12EovkHpJAsloKqMHWhPHtZ3h4OCDTLsO4sgfHxSSSTKZy1cY150fXwhL5FrjrTS6zFl3yCi27altjpt3S2IXdiiDPsUTOJ3bn7AFasXsaZcrd5lEF2l2H9taU5Sze2YRG1KX+Z1jhW1bnsphZVU4XIQXF8uGPzOI30Qf5jhRLu3PI0PvXP38dnvvJDHBnIsYxtFIMDsUQJV1+yBh95x8vxb3/pHbjs/HPtgCo/jvKJHRgfHsC37nwWY5P2SxUXr+7Am8/pRGLgMGe3RazesB5veO1VWE8HODGexfETY5zh0Y71eEMqY65rPrjlGTzxzC6z7Ltm1QrzZhx7OUI6MEJXyxuQj0q0gAyCeAwy9mhsUunIVyW3++Fj89PW6NsjhRtOtRGVpx6c7FGqh1ph0Rlno/SN4NKZL0DoMRuWkycVYs4r3Dq6xByeo5sxpJBgdzbw08ooGjBrVnGUKNibCp9HlJ9/pLbuRpyqPzk8B9/R2VTVMJleCMGhzFrvSPzcN+/FlkefUR+Esm7U0M845jjy5RI7mRIuOW+9eVu/LYeoviH7mPo4g9JpX40iOOcQ7NvzNlwzADk53RiR5gzuk5/9Ju7b9gIK8QzaObv4uRuvxbve8GqjC73N5JGBIXzz4FHkuK9uuUgettGWkRobxu7v3IEEZyLmIwfsoPVWlI/8h1/Hq156JYqcLf7k4efwyNaDaGcnvJaj5tWdXVhzzhIcGhnDLjq7Xs78OtNJdLV0Ymkii0uW9yBRVAZGe2IKfebIVojJxJaxgbqso6sN6aEenMML6XCOqMXLnauGlbFh40r0HT2OXfv6aR/q/Eo4cuQo1q5bg3UrVyKrb9FxRpbQjRTGcJmMpLsyTUfKc3EOJkqMM3z4GMqc3eUZZfcLB3DuhWeZB/4TtMGJySxS6QxaqHOHgFUF1rk5WwqHuvPTkWSseZ4wX1xQe0hk8MCT2/Ef/uIf8O0fPorDx0dR1NtdiimU6MjWLIvj9z/6Vvz6e27ChZvWIk4HpJue0tl+xF+4G+1HtyJejONfHziMPg4E0hxQXrysDbdsaENm8BiKA0cwenw3ejrbcfEF63DTdRfhkg0rsOfAYQxNasGS+dAedLm3r2+EM7ytuPOex7HxrI1Yv6qHSrX2ZtFAD/pVjhXawDgboMo9AgaIbyhPj+aKWjxFPmx/WLtcjG1knA5yaup/xDu09OmlreTNv+YcneAzCLZCtBDTYabxp6COHLVQPy+dr1I4VuTI4xHl58ZHuo7kgvL5AlKpasMXQqMuwvxn5ejuy1B1K4rZ2ArSNQa9Rf7Oex4wI3DnmNRvF9X4OXo5Z8Nq3HDt5ehpb7F8DZprHC4fK1twzmwdJ20DMgE2vuvgzUyOMwA9mH7HPVvw9ds3YzSbQEtLCy4/dyP+7Yffb3Sh59R2DY3jyy/sQb+SkodGuUWWv8SwVD6L/bffhfz+o/R51vnFWhLItaVxyWUvwaZlHbhwZQ+uPn893V8MT+3ajyzz3chzbfSKy7qWIJuM4RCdZTrTgk6W//xePc+n65vUMWe/IZ3oUBuzjYQZBBGIxo6uQWCAZuI0i1q83LnKNqBLLzoPDz38OEbH8zQ1dsScYRw92odzNm6kvrowmpvEBHLGxgQ5ZfP4gdkneDrZ2oKR/ezkWXcaqOSKZQwPTeCcczaiPa1rVXGMjI2aB8lTut1e7cBwsP8FK5dHoV3t1EElHmPRkTk2dvamAzqOZJwztiHc/fAz+F+f/Tb+8cu3YZgTUK2E6HNFWuW46ry1+PlbXoHf/sW34+Kz1pt3mcZoM4nxY0gc24bUC/eifewoZ2y6mtyOr28+iBPZonmx92Ur23HzWV3GPlWOdIHTv77D5uO1+gTT2RtW4uZXXIH1S9s5gytigLrRu7aZmtJxJj2Zxw/vehAPbtuBFs76lvZ0m5dka/JsGrHKwz2Vxoc7rlqlzoiqZ6ZDlGcYjl+UFgdq2XkIDLeDSHUmEZ3UTNpgRmcaeEDerqEoJFizNBPUStNIjmZhm6NHmsm4Q4PKTij/kCxUkO52s05OozUbpmfkBH9abpcuFM7ymP96rEB7GkFza0+ajZyndWjcYwPv6uzEM9v34OCxE+acpuW6riWZ1yzvwkfe/zZcft5GpmMjrGD6BqGyaERk5ApIG+6YcLv1yATa+nAjKW21xKOL9H/3tdux//gQEimOgONF/Pd/9zGsWtJOUfLoo/P/6q7d2K3eVg464Kqyx0p5jD69Df0PP20+G6N88sUCLr32Yrzp596Gf/nqPXh+dz/O27gKGzjCvmDdCixfvgSbH37C3EJ/9qaNaNVjG0w3mM9xtjKGy3tasSSZ0WhAmZDE1+pEclsyR+ac0ZcTKnTeJq8Hy6MxlNd8weflyuEQzidmPjt0wbnn4Cd338fS6YvhwNDIKIaGRnDN1ZewHvLoz41z1qMuw/6kfpPaqIsdezKNkb3HMDEwSrOTXVPHWspkmrNYH6p7Pbg9PjKMnu6uqtYkiw60MZ2RPTAimjBLOnRwg0VHsnMXx5RVkdRmeFqfThoaz+HL37sb/+cz38L373wc+46NsfGxzlWG0iSuu3g9/v1H3omfe/21uOKCDWjTYyZ0cOWRo8D+LWg5+iTaBncjVciRJX/xHHLxFvwzZ3SDuQSdUQmXrGzBm87toYObZP4JDso4MyD/xIiWOk+gNDaBltZWnH/OKrzm8jV42QVrMEDHu79Pb/mxg13NqI/0DeMhzvCe2vY82trbOKtebhyuqRTBFC6AKbAj/jNR3IkgfjOo8IgS/3kUaDigxYOwPYehNhmy/WBrUCOZTtWf0XkHNdLOOxoVzId5voUV3mz82lBav4C+AYXDQgoN9rXVT3Zqr8lZeWrFFaxjtdCeIRcuh8Z93chhnJv4BI5EM6H2TJtpTD/Z/BBncPraNp0LZ0m6trJp3Up88F1vQWda8uuKjMP0DcLkb/4COQg54CqMlFYeI5NzwFVHp3MDY1l84dt3YPMTOylfKzvLAj7+vjfj+ivOo58pYjJWxPf37MOjE+PIMo1kUy7mLSKaDdKB7//xPYhN5NmVaIZbRj6Wxy1vfj1e+9LL8PKrzsZDjz+Fn2zZSXGSWLdiKdYs7THvc3zyuV04Pj6G1ct70N3Rhhz3N7UUca6WcZWJcXLcCqE6FvzjaFhVJ40dXYPAAM3EaRqBmEb3Eb7+sXZ1tGRJBzo72/DIk8+ah8il86PsoJPs9C8+bz2GC3mMcyYiy9GSm1lcC/hotp7nTG704HHOjxLIZ/MMsvU+ODSEnt4urFzZyzDO2Nlpj42Nsw66jI2ElsRN+wjkFXnw401BcM7apIjxaP/HB0bwvbsfwR//1edx94PbMDwuqTPkpc8rlXAuZ1m//vNvwq+89yZsWLUMHWlKWM4inRtA/PDjyBzegraJo8jkx2kSRaYr0aFr4FlEIdmOL3FG15+T6yvi4pVtuOX8pUjmJmgHgaNjiBYqYyU6yPEB5PuPoZTLoqUlbQaeWtK8+OxVHBCMoH9kElmOSjWgy1HBhzkQvOOuLXjw8a3mhpUlXW3mixW1iu/AUgd7ViU1dVUDTq/Tkn7B/tR2sDBQVja/5hGKH0nqH9reZSq8L4zbQttkJD+1dzpK2vgwHUOdsDCqCnaF8Pd9+Oe0a4+nxosiLEv1wP4qQQHCZyqyBBHCMsTMe9v00U6NahXJLgF5VOlk7bELYWJL7kzAt5qfttXgickivnnbvdi+5yg7DXYqHKnrvJY/RobHMZEdY6d/HtIJpWWjp2NhVxMwqA/lpY5majx3LjhvOiodmX/eFigUY/jWjx/GN26/F/k4nTAd3csvvxC/8cG3UII88mzc9x85iruOH8co5S2yo9S1HTFktwuMDaPvngdQPHjM9LQaNRc4kEmvW46lm87CBStXYl1HEi+9YhPKxRTuvH8HBrM5bFi/FEvaWnHe2RtwpP84ntq5A+nODvMYwcU9XWgp2zveBGcD9siH3yD8fZU3cOSm4HZrKGBUOfbiWfLDAlKCeUKFX5BPGOqATYD+m/KrQ9YNEVpC2/nCPkVhcBl79xzG+jWrsHJFL4ZyeUxS9+ZNRlSD4UKllZlm8Nk9SMZTWHPlReZ68OTwCAdYdHqFIkYmxsysrrNdz0mmzauy9Ayk7sT0B0xT5fSgMAUHGwel1/UzK5AGRDEMZQv48nfuwt//y634Lp3FWI72m2ihXcRRKuVx6flr8Cvvvwm/8I7X4fLzNphvWuqTTeXBQ4gfehRtx59C6/ghpMuawamsZST1hpxCCbmCXn1WwFCeM7r7D2CwqBu+SrhoZTteu6GbPIY4EKU4yRidJp2jbNfIHkOKDi8xcgLFoWOYLNC+29px1trleOVVG3DRWcuQy8dw8OgACoUUi5ImnwxODI3hrgcexZM79mJwYBibVq9FW4v0ppeaSwHKXz87gDY64dZm6WvKna+eix7Xgotj4xmmtp2YsGj4AsJmFlBwrg58WbTnyKCy47fjMBo4uvqJfFTycPBOTAnzMHslKt30aY30IVlc518rrTtfDTM3lnhRQ4rmvmY1Kd3hY8+EHR2txqrPHnshpk6Df4YcX21dnuacOU7j6z96GJ//xo9MoxZTmX8iluNuDkV2Lvv2HzIPRm/asMGkQUKNWHlavvWgEbtfJgsdO7KoyGd+9lhl5VwMO/eewH//m8+gEGeHk0hidXc7/vK3P8JRNGdlHCHvGuzD9zibO0J5KDVF45Z6UaNK5nMYfexpjD7zvHntlDozdZSr1q/C1Te8BvsH8xgYGsHF61dgeWsG569bbT4/c/+W7UBLAutWrkAH1b9+xTJ1Wzix/whetnYluhL29V5R662WyMGP4e+znNSN0aUpuy25KX2EiWYRXmhA4d98wrfJKXUnpeovkNlCz5GlsHrVUhw6egKHjw7aInGwsW/fPlx44TlItMQxms9z4BbUDYsufeYZd2zPESw9ez0Sy7vRtW4Fxjj7Lo1Osi7peEYmMF4o4LxNa8ydlxQOuVzO3JiS1mAswFQbq8IPC8fiQEj2wJwmKNC373kcv/dnf4fNT+zGwIi+1JBiWrmbPM5d34v/8m/fh1//4M3cZ/1zhqRl/PjYEcR33IO2E0+jvdhnZnWSSi1W5YzLMU9OYHIii7E8sPVYAp+4bS+eOJ6k70sjWSrg0LFRPD8ILFvai7axEePUYi2UVDfAkJNp8xwAMIWx5/LYEIp9fSaX9iWd2Lh2CW5+6bl4/bWX4gXq//gQZ4b6JiFJbfs4ndwjT+/CD3/6ADp6OrCeNp4hb+lXpdOKjvar2qnaaSO9NoK7iaMCnz0R5TrbfJqCy9tk0TifenK4pPVmcg41HF2ARevoZoCQLDPLLyqff+z2rRFaqJ8x22DdPZzawqYj6Y/7jo/RvI6DMP3TNwJ/8vAz+PNPf5mjPDVsfT+shDfccBXG+4cwxpmNvruWy5dw5MQQzjn/bHR3tCJbTCBj7mq0efiNIwQTQX/aqY+wjPa4zJnlscFJ/P7/+FuM6CUSyQw6u1rxmx98O85dQ8cTy+PY6Ch+8NwOPE8npjG0vbBY4kyOs2B2Crldu9H/2FYUdLMEeSq0lfK/6W034nXXvMR8Gmbrvn4cODSMtct7sKQjjU2renDhuWuwfe9ejLCDWbaimzPEJJa2pnE5R99LdYNEUB5XH9oEuxH4evH3VU6vI/BgdeCTHSxYYjiTueNp2t2sYPgG8PctgmPlG5CL09nRhiXseHft3o9B8+05OhJ2eMeP9WH92hXQxGaC+lQaLQSWGGd4/1F0dHWhlfWpG1F0ubO9qwMj7LDN5WDOOo4eH0J7RwvO5QxccxDNdSayE+jkwMR9UcCJVQuh8lT+UQw6gh2c5X/19s34n//4Hdx+19PIl9rMzBGcvXW1x/Cql16IX6Nz+42fvwlnr11m7iBNFtkmho4gffRJtBx5FB2FQToVqw7NjuTgEgXOXsezmBgew/DIGJ45kce/PDOKT20exKPHysjpdV9yspy95WlbO/oncOfeIewY5WBqvIQM88/Qwcq5xdlH6o5W3XgidxfnQC5VyHIGeBjFgePms1L6wG/vkna88bqLce3FG7XQi76BUUxQDnocJFIpzgQL2PzwU7j7wadwfHAEXUu6WF9d1DMVYvoTUkVB1u7svsIspMt6VLnUoDT643491AppFH+2MI8CiG2TvBvK0ASLqqMTI0M8axJWlej0XAky/yy8XQOz7u5+2g9IvE3nE1BQfRUK5W1OzA2OlSM/N+P95cgDstK6eBZRxfrHbl/czJbHYiXzk/PTzzxbZMpUJVd+l15bN7Nyo/UyOxCN9vYcGsS//bNPYVjP/+hHp/aR996EP/j1D2Jd7yr8+KdboDeAmPcajo6ZuxQvv/BctJTYBItsdroWzjSS0eYWhslTVDM0CJdMpusLFgJZQFPGdAd+/Q8/gQP9BcbhCJRG+543vho3XnsFMrECR8RZ/GTHdjw0MIAJzrDMq704MjerUWzg8aNHcfyhLcj3j5Cbln8YQFp/0dl48xtfjxUtaZy1tAt6NeOBoQx2HejDkvY4lna2ooPTuLM3rML2Fw6inx1ydxcdXDyLJXRyeuxCS1JGXm1JZuBRk0w0S6q8CljSOo7OBgV6I5kTFbhjS9YJWpotwhyt2ILN26Ky79lzhVQ46l7DiFWclWnZbdvz+5DjbEXLZCMjw0ixQ9csepQDi4LqiR5t4iAdBPd7z1pLG4vTRrVUx3prz6C1rRX9R4+AU0BzXfnAvsPYsGkFVnDWo2tow5zV6dt/HVqKk56Mgi2c3ux5zYq4NfpkHM0yKEt/roD/9n++gL//0o+xZeshDI4qbz3qwCwnR/DW11yK//ib7+H2OjPLb+WA0Lza7fh+lHc9hPb+J9E2cUhPmlJk6kaOrpzjHLCI0uQkxoZHzMuvnx0u4PPPZPHJhyaxeX8CI3l785KcuuosTicXT3L2Q0eUJbcdwyXc3zeJu/YNYyiXwvpODigLo+bSeInhRdp5nPpVA0nQo2ZyWSQGjiB7eA/PFZHq6MYaDsxe+ZKzcONLLuBMcgw7DxyjDugk1YbokUfGsnh6x37cde8THJQcxEWXnIfuTDs1p5UDxgwMQLNungiI/0RVNU9B1UbsfuXYgz2vnYCV4mo7R6gKrJyWHE932cQLqshWixrBhFJos60TNfFrv6Lv0ekVYCYre9agqrkpab0T0bB6Qulsg7oIp6sZsTbf2SAqIlUZ7FURLYd/XCtsSnc2lWUFLr25PZ8wN5/omD9dA+nnLOeP/8/ncfD4GOOk2fhKuOH6S/AbH3wXVvUswwVnn4VnOVvaffC4fVg1ncH+/UfMW1LWLF9u3meYL+aRMo22tiiSwZAfqt2AqmUMePCf7iArxFP4zNd+gHse38l+Ic3OrYjrrjgPH7j51VjOmUO8nEVfIY87nt+GYTZMva6sxE6jyM6yRM+VHhnB0OPPYOjAYXYQ9jqEbhnvPmc5bn7PO/Dj+57E8p7lWNmRwYWcTaSTkxiYKOLgiUmOsMucnSTRmYxj04oO7GSZM5Tt/J6U6QR0XccvT7UE08A4BQcVdkptVphU9SJMy9nAxqpj/Qqsw6bmaZ70ZQjLUwu2noWzNq7DsRMnaDeH2flzbsHBxfhkDq2d7UhkWjAxQed38ASKoxNYumE17YrukJ23UktFMdpThrNujaEmjvWjVCghy4HLzp0v4PKrLkB7axu75BT6RsaRYsV0mBm2LbcVoSqLTphxFP9N5AvYzrr84vfvw3/6y8+wk6cMJToP9ZKsiuXdKbzyio3443/7PrzrDddjGe2shbLE8wOI972A4s7NSB59HB2lPso2ziT2JhPZZpkzrxj5ZwfHcOzIMJ48lsXXd03ik1vyeOhAEsOFdtplmYOoMl5+9Xno7x82X3pIsUu86Pw1WM2Z8PCo7k4VrxiGyP0xDvDuPpjD4DiwLFlENwdayRLD6VRLZm3UbuUwW+j0ykO09YEDKHO2l0qlad/duOGa83H9tedT/2OYzJUxNpk3g9YkFV0o5TjQPYLb7nzAfB2/s6uNA7wW6GXbeu+rNGqWmQPdSq+VUVANTG8jtWHqZ66I8HCHs5VpWtRhax2datVk7MeqKm5KWu+EBPapEepXheVTQY2ICo7mNVviv/A5WmYlLIC/L0wXFj5DTDkRxAvS2jT80Zo0uuUJc2PLRL6M//3F7+Dex19gJ5MwjmXjxhX4nQ+9C1eevZEpC+zcR9i5j+HJZ3egj6PLmC7Kc+b37PbduOryC9HdwfErR8DZPEeSHCmyT5gCJ4t+ajCK4u72dDIK9lhhNPxEBvdseQZfuvVejNGBqeNbu6ITv/rOm3E+ZwUx5JCL5fHDnc/iyCQ7HHZU2TzLxFZfKHKEW5hEbtt2nNi5mz2BRs1knEygdWUPfunXfxWrli5Be1sGz2w/jExLB5Z2xbB6WQt6OuJ0/qM4kstzxjBp3lu5NNmCDZz1rWtNclRPd8lO29SjKUkVplx2tz6acHRuJmf2Ax35dhOlqQgbtVvidstKNW0+2IYg8Tz+tfPyoLJRz2aWwvrSN+aeenYX+odziLEOJ9nBjk9MoI3ObuD4KLJ9Q1h1znqk2lPscO2KgOb0+iiudBDn7KOzowOTA8OkEfNw/zjt7EhfP6689Gwzw1JPf2xoGEs6O+wyuhHRCG7KZGQmvxwHdU/uOIBPf+G7+MxXOIN7eh9dFPuiZBoJDtbWLW/Du295BX75va/Du954LVb2dpu06eI4Yke2InnwIWT6njFLlGnaHWI58rVOTvwLlGvo+DAOHhnFPbuH8U9PTODLW4t4YH+cDqaTgy/KmszhJZetwh98/Bacs2kp7n9iB8ayuhMzjptfugn//l0vR2sqiQPHRswzcgl9zZ06GKRdbx0oY9tgwTj+FQktZTLvMo91Q1hCVxit3pKUJ52fQHL4CMr9B1HkbC6ZTpov4b/uinNx7aXnYXlvJw4d7cfAeM7ckKJnP/N0gFt37MZ9jzyFp3ftR2d3B9atWIE4BxhWkVaX9hfs16BaaCas9s1qM0QkuTusl7dD6CHwmaBO9MSvfuR9f6q3BCiGfg66jb/yRVielpEzV0O2O3G/+ohOWxvBL5Dy1TevGgxS5gQrd7UUIXgdmg97TgKxQ9UuyS5N2bgqq6MoS8Vx8ZSfZnKVJUue1mdjxKuUSOOL37kPX//RIygUOFOjDjra0/jou16Hd7765UyphY48YiPPIbnvLixvT+KpA+z8C1r+iGN0Erifjuj6ay9Bd2sKw+NFOs4i2tPkr2pkA7TCWXkMSR7X2dZARUam33v4OD711duw5+gkZc2gg7p6/+uvwRtefplp4MVYAc/1DeLBgy9QD1qOiaHATmN8osAZ5iRS7ESP3P+kXb7kjEIX9UvpON7xoffikk0XoCcVw5olLcik4nh4xx6Ms1NZ1UOH1xrnNoNjo8M4wcZ/IjuGrvZWrGzV+ywpH5WuG0NULltDUykK05k4Mumq5OvCOThLrDctM5G0rxGECQ/IdAz641b8uROQ/qTjgFQXQRoHl0dNYQOYNIpTA/XOGxhnp50iHVES53DAdM9Dj2v1kWCnPzKJiaFxTIxPomt5L1advQ7D2XFamm6IsLoSf4ptymg+fURnN3qYs7oxfUswiaGJPGcdKZyj14yxLlKMd3RkCCu6OVvUkh5t2ZZdXxIoYOfew/jP/+sz+NvPfQt7D9BpFjiDi+lW+zJW9CTxkXe9Fn/wsfdwJkcnQBtIU+fpwgRSJ7Yjuf1HaBl8Di3FIToR3byhqqBNkZKSuRg3L0DfsusY7j2SwN88OIIvP1PAjqFejObbWZgkkqkiujpi+NC7X4c/+c134LxVSWzfdQCbn9yPiazGXwlcftYSvPPKTlx3Vho3XXcO8uU8jh4fgd4HzR6KjjqJ/bkk7mIbvIdtIs0BWFcbZ3HlScrDmSRntLoAKrlYcg1nkSzkkRo4jvHDB9gGynSoSc4mU3jJuctwy6svMcuwBw8OYqKoVRA7BM1NlnDo0An88K4teOSZ7Tj3gnNMm07rxivVierW2Jatp0bk4D/nW4XCq2TeIhQgmr5ZhDlWMR2vmeZXiR9sbdpqeuPokprR8aR+Dorn353j32Thx2uIJqMJfqFkFAsLW4qaqHfak09xzGMFxqtND5fW6M388UeDNp2IOk41Tzbyu7Zsw+e+fSeGOMpW08jHs/i1992Mj77tFvOwa4Kj1mS+DxPP/gDZ/kPoai2iI5PE3uNljGfFL84OI4lnn9+P885fY768PTQ2iWyhiO6WJNQstFxoZKFMhvTzy2ZQPW9CyLdvcBT/9I2f4JFth8iDHRkd2ysuXYuP/fxb2NDyHO1OYuvRQ/jp3hcwwLAYG4kasm7AGxscQmloBCcefAoxfQJFdkUn0d7bjrdyNjgwmseTuw9jCWdza7o7sZwj15VLOs3S7AuHT2DNyi50ZzJYwc51mN788AnOFugM13dmTB5GqTNEo6rz9eH27VaDArt1UbS1enLntNXJYN/E4dbvV0IHETQIcrLUQqMw23bZaXKrpa/ezjZz+/3TO/cgz75MweMjo5zdTdBuzkUun8fY2KiZJespcs3azNfIRTwlPom2VpSYeIx1pGXjPGfsQ6PjWLVqGZYt7YEeV0jRtuU8dTOMruedGB7F7fc8gr//l9vxyS/ciqPH6LiSnWSeQbGUx6YNPfjFd9+A3/mFt+MVV16ITJJ606vKxk4gfuxpJPbfj/QxOrj4uPkorJZJ5XiLSTq3ZBGJAgdUI3nsHU7gthfK+Mq2Mr785AQOT7Rx0NjJuEmk2WZecvUGfPg9L8fv/soteN11Z6Mltwel8Rew9+AJbH7sKCZztHDa5+Vnd+KGCzOcXfajKzWMV13QgddcuYKDrjbOCIs4MTrBwQBVlEygj47pvqN5PDKQwECxFV3JDFo5k1ObVfs2AwRTC7oOSCel/f5jKA8e4YAjb24+6+D5ay9cj+uv3IgVXRlMjOYwMDjBQaXSUucMP35iELf/5AE8f8De3bl8WS9S7ANYWdbk6iDq2BrZSwWRNPOJpvKfDWqwNe3vkc3fLKdbu3QYiVP15lE064iinUlU2T5CBVcDW1Aor9plqNcBWvkkF03VPDun3WA7DVzZ3DU5wYzOpUk2Pl3439U3gt//n3/P2RIbDxuuXo31xmsux9/84e+gnY4kUR5DsjiM3KGHMLHrLkyODzN9gk4sha88Bnz50TyGSi3IqQNIpXDZeUvwbz58C9rZOPrpHORA1vXYB7rNRXrJYmSwslRh5TJ7ZqjITjCXN485fPabP2Xd6LI+R6aU533vvB5rV63CgeMD2NN/HEMxDoXpTUscsWtZUqP3Ikf7Y4N0To8/j9zgsH1zDCnWnsDNN9+Am2+4Hu3tbfjinY9gz7Esrti4Gm+67lx0Jkp6xAmP7TyEXXv24703XceOYxL7mVcxV8DlG1cwK9YFZ32SWTD21WTjNDOuOojWk9mqsRjSzCQ4R92arY6Zr5yAOnjjUIyt8Fi2HIRV7F9La3VgnEsdhOspDCdTLShfqxse0N5KpKHxIXzmm7fjR/dtM3cLqs6ypaKxD12P0kBE+SVT7KRpTynOTnSNNqNXWHGQUWDZS0yX5QwnMc56lzXS9s49ZzU+8PbXY93SZcibcjJOdhI/uft+/OjuLRgYyfI87YIznTTT60amzo4M3v321+LdN70cy9uSZsBW1pxpog/5Q1uRGdiJVjNLss+ZmZv7yyxHkgWinUifRQ7o+o+O44mJXvzDlgE8tidP+2lV9kzDWVR5HJeeswIf/5W34mWXnkdHM4n8ZB/K4weRmtyrloSfbh3Ef/vMHraXlPlU0Qdfvxp/9I7liBd0ZU71Km3SLsst6J/oxHe2jOALd+7FsQnpnjLT1tVuk7SBdZzZffCyHrxzUxG98VHEM+3G0UogreBopqbLEKpvLeFm051IrDsbsSXL2T40m4thYKKEHz28F5+79REcGaLe4qyDnFLq4X86drrZs9ctx6/9wptx7aXn0p2qjmV5RlDC2YStf2d/9WylYp8OepNRBFPizBKSYb54+fD7b8ue+qI9xbZs/kY5nelRzqRqxmUZO+ErpZaCooNT18CFaJgvRDSsPhjRj+w7F4lcJ8ycDeXnpTOh1XTmFV3aUjPurj0H++FVBxvmRvUuXS34unLLaoJRM5O5cDXYiXwKf/qpL+EHj23jiRYmKOOys5fhy//jv6IrrUbNRl4cRWFkO3IH7kS57yDyHHXrwV3dkXmCI9bPbh7Hd5/hzC7ZhZLuQEyVcP1Vm/CeN16DllQMo2MFrF/ahRWaBcnBMp1kMO8ODJUxgOTkRn351j1H8Ht/8TkMj7FTkR6ZJhGbQHFylBWutGzk5FUpctBZS59ldpy6JTyuc3LC6QxH33Gcc+FGvPXNr8O5a9dgSUc7iuw8H3rqBTz0TB+WtCbw6mvOwaa13cw/jef27sPOo324ZOM6nNfdhl4KlXKDDdWD8vGWWZqCt1rRCFqmVB7GyaiM3EpvehbKr1d1Lra8lvQQsznPff5TBHNLtTGhBo5uQcEGGDedbBwjnL199yeb8dlv3wV9tcfIzG2O58u6K5Oy2uueshGVV8vjTM9OOMXZh5x8SQOWjO56pOPKMk2xSPMoYe26FXjdq6/F0t4u7Hp+D+666wEcPTrMcrOjJi914hQBF61ZilddfQluec3LsY4zQaOXUg7liRNIHN+B1PHtaCuNcjaoeqCNUXdaBpTDQ6xAB1HCeD6GF/aP4aGjCdx9KIFH9xQxMWmdjmaDnS05vOySZXjzDVfgNddchtYM3QsdaHnsEJ3GEQ6WxslPlQJseW4S/+nTz+HweAsdOvDh163C7799KX3pqOmCNHwxQlB4rYyUYu04NJTBtx/qww8eH8S+41kOEqyTkrlo+fb6s3tx48oCXrKmhE2cTWY4aNW1bjYEyqh2QffEetGDN3pqo9BBR7d8A4p0eOV0m+lPjw/ncNeWXfjhY/vx+PNHOSBhRInBtpVAjqoo4MrLNuHdb7kRLzl/E5a0txhbU9u2P3sHqrHFCPw+2ZTNi+LHd/1iLR6zgel7pvDScSBQqI3wXEjQ+vCjWfbW0SV+7aPv+9OEeRiZMbxI5lD/asA/H43hiz4ltXeiNucwlI+Vw+2r2WkW5PYVyUQNEOEapNOLlrV0UheMYzfahpUvJUVh4xkVBkntsQ8XR7A8rMz22IaLUm1d+OSXv4Vv3vMkyqwHzSb0qZW/+f3fwDkrlpiHVONFOpXcCRQGnkJ5+AVmzBkTDVnNQ29C0S39Z6/I4MjxHPYM0sATrZQtjcPHhtgY6eDWrGBjpkMdHedINY7WFuZjlCM5rGxVaJ9GSGcrOfO0nLu3PIl7HtzJ83akrfcA6s0nehsGm5Bp2HohcJEdo96dWKQDkJnqwwE6r/gJtXw5F84U4uwgL7zgPGzYuAmPPL0D+4/0c2a4EhtX9GD9yi4co9xPPfk8Mp0tWLm0G0vbUmjPJDF4YhAbl/SijY5SVmwN2cLo1j8xHRS/ERhsnFqgD8Nff9SXOl1RQnedGmdnbdKOphVHaaQBbT2ZuGvDZiDnfIJ52zfsl3Do2AD+9+e/aa7hOt3lS1nOa/KctLOzNjM6pqGXSaQ1e2K9pXlCM3LakI4TmQSSPKeJimZz6qyF0ZExPPvc83jk4Sfx9JO7MM6Zifm4MyEzOHtdL37rw2/CR999I2645lIs6WxjOONMcra+9wFkDt2PzpE9dKBjxmQkh7mLUisMdF5lzujHJvJ45lgJn7pnjDO4En7IZrH3BB1uQS83L6E1NYY3vmYd/sNHr8eH33IFLj93CRL5Q2xDzyA2+gIyhT5k9ISnqT7blo70F/CTx/swko+zmGVccXYrXnlhK+1XVq4YjCfnoepTG+D5JelxvPTcNG64fAk2Le/GnsPHMDKuoUSaM7AYdvaP4d59Wdy7fwKHJtNYRk/bXs4iWaCDJT+1M/1kFSqeZsex/qMoHT/CNj+OWFsb2ttaOcjrxQ2XrcV1F29Ef/8o6++EkUmfwzIvtz4+hAce2YqHnniOPGNYv3aVHSCY9socWMeq5yhJuZV94yVq26ZCzNbFXRB4fIPBh1vhYK5mOy1qRDMyP3r/N8updJcsKTjt4HvUMPyCBvJUYJu6RTTM97bRsFqw+TCiHzk6M6sTZs4yuUYNpqBNzOgMaMB+h1lvRifTtObp5AzDP+dG/uac/tholTaWbMFtDz6NP/zrzyGZWWLySrNT+d1f+jn88s2vQXsiSyPN0tsMoTi6Hdmjm1EaOYBYdoJDP3YrIg7D2faRy5dxZKgV/++t43h8ZDkK+pgui1XCKD78nlfj6ovPYRrdIVbEhpXLsaTFPjvJ8bEVsgKdI3T3GvdzrLQv33YP/unL99KJKVgj90lcd8VFeN+H3o0HDu7Bc5OTGCrqLfkwr99SOundyMYZwuALe9HPBpgYo9zsINkr4rKXXYLXvPY6OuMR7Dk0jnbOOt9w41VYvbQVBQ5MHnvieTywZSde8fIrce0l69CaLKKFHVNHzDppMxpU3aonDGDeg2qEnwamHqr1UwuVumJu+m9ndDqvm1HYfVAvh/vG7LfeOLtpaU2jq6sVbZzhyLGbmSyFsbM4yco/N9MNHMKpgKQqsS38l098Bo9s1TNe1ml3d2XwgZ+70TwYfmRiHOPsPFlbGC9y5sSZ2nhOgy06wckcmRRpeznanZ3FTY6ynkfzGD8xjDzj6G5H5OgUVHTd2UgrbG1JYMPapXjzjdfgraz3FjlO6sP0MpMjKB/ZhmTfNrQUBzlbp2PVrNK0beqe/3WdcHIySydSws4jefzg+TLu2JXDsXw7eaRMp45yEV3tJdrmEnzwnS/BJWetRItmTZOHURjcT3nHZHqmLzDXds0NUUqo9ljCo9vH8Z/+YRcOjnCWmi7hQ69Zjt9/xwoki3Q+rG+97MBko6VeU6WSjYKpPVPAYrwdJ8Y68I2fnsD3tnCGN0Q1ML76qLz6n1gOS5Jl3HJeF969IY6LOwpo57FWOOKa7Zq2SJ7BKkmB+eU4e44vX4/4qg2ItS8hP85YmeXmrfvxpdsexfYDo3TMGqRICxzQc1ssZHHe2avxi+++GVddsNp8WshZnvhWwXYk5ToYnch2g9jB1oKl9Y7DYQsAU/fUjWkz1InfRzeAXx4no9qyfamzeWDcnDIBFtMXxHUGPqkTMteAasCP2gyss4iSj2nCzGhFCrKNpQo/jTVWde+WeIb5OrJ6CJRuyiuDtTwdbDyLajq7b6/32EpShyLoJSHJdJt5EfKff/qr7BM0ok0h3ZrAB+jgPvLWm8DJDCc/k2QyjlKuD+XB7SgO76Gf4Tl1nuxLVDbVpS0jO5NkAVetb8PAcAF7hznC5shbYr6w7wDOOXcllrTaxxBydCStnCGlza3gklXpqQUal6k6kikHDySzbmN56JFtGFXnpdhaouLvvW+/BUt72hDr7cFEDx01t8kl3Ygt6UCpkw6Lhch3t6Nl/RqtXmJs/2Hqgykp9GSuiOUrl+DcDWvQkWpF31A/duzdbcYqK3vbcc7aZVi3eime2XGAnQdw/uol6E7oDTGqL8I1NG0d1YLiswyuXhw1gnNqZt/s2AP9l35yFPLT//xd/NnffAb/+M/fwD9/8wf4xu134f7HnkaqvQsbOTvVpFONNdQhBLvKvhk55opKebVMbVomZ2exDL71k3vxnR89QF2z/lnWjq4WfOQDt+Btr3wpLl+3CudtWIee5b1I9vQitXQJupYvR/eqZejmAKl33Wos3bAKS9euQPcyfbGgZJ5RGzs8gvwwu+GslkDVkuxydiYdwyuvOg8fpRP9lXe+HldfeC51w3KzQ42N9gOHtyJ96GG0DD6P1tIkJbU2q41pLhxd5UcLGB3I4aHdWXzhiSz+aWsK9x9KYazYQpulBHHZ8xjeeuNZ+O33XokP3Hg+NixNITnZh9LwsyhzdpjkbFX52htD5O2UjyrEkuajh4+O4c7HhzCSo8VzenX5WS14xQW6a1R2T6G0ysHoVpdKx0YYhBnt0jl3pfN46TlteNWlbVi3NInjgzn0jWhwnDFl03OlzxyfxJ2Hstg5mKbz6sTa9jQyeqtLWUSWFE0zPd2Eout9SbaN4rH9KA4dNTm1dHTirDXLcMPVF+LCDcsxmdXryoZNt2AG5jS+fs6q73v4KTy+bS9GOQhZt3Yl2jgYk2J1A5yWoWUVplwVO1HZVC57LDgbMnqyESwp2oLCz6wqz7QIovntTmmDrxfQ4A0jn1lzJYkKYI74zynIp5liNmmqMEIE++aoAZqsNcNvaln84+i+fkpTOeZuIpXG7sMD+It/+FccG9GFchp8smTeifcHv/R+LO9Uhz6mZmEeisXYATq5XRxND5hRstq/7UjFlU5HvW+ZzYg23pqewPnLWrDnGBtYVo1ZS7cl7NK7IK84m422yMmgHkotor1Fd8Ox0Qdwjt6KzH+mp4mjs72NjimHp559wZzn+B2DnJ11d3fiknUrOZAu4vDYJI5NjiOnlwRnJ5HjaL9UZCegUTvTLF2zEvu3PctZ3Zi5JXxysogUHe8l525CKzku6V2Bicky9u87aq4VrV7Wi1Vd7bjknDU4NngcZ/d2mFvjnXh1HZsH5+Cmg7vu5siHqz/bcOTegfse3Y6//cL3cPQo64a9kgYPk9kcDh85gR//9GG8+Y1vQFcb07DncWJamc0uD6aXfT5QLYstl3I9wg7wP/3lpznjZ6dHm4txJn3L66/Bu258uXkQfzJRwnf2HMaubBGDrActXZvOnPallyAnaS96MXdhooDjzx/BznuewsAzfchm07QK2jHjaxkzw0HXy648B//Pv/8Q3nPLK3EuHWiLeVM/HZOczuHtKG+/Hd3jB9nJ68UItDSSqQPpm3aTHc/ixMA4Ht2XxSc29+OzT5TxTH8LBkt6iYIcHAtUGsYrL1uC//vHb8Hbrl6KTT10ZXHOEMf2ID6+H4minudM0OnqmrT4s5GY+maZtGRpnBfbGWdBe/cM466nJzGcYzkZfuGaFG64pJsOrGjKZerfzDDsAEZnfHvROb3oPRabQE97DpdtiOFdr9qIDcuW4Knn+jjrksB6mTQwUUxh+0AMt+8YwIMHhnDWumVYwfrQg+caPMjx2ubH/Ggv+l5eLDuK8tG9mDi4D/HWNnQu6aXDW4qbXnYhXvvSC7Bv/wEcHWIclVF6ZJqB/gk8+tzz+NYPHzIP95+n9qZr+EZgc/sKIcWoPHSjSqszQbFMfQQH2rhjnansR2g+MWOeNaIqfeLjdHRxGb1h5sdqrjFGhagpElnZLmJmmJvSmNZLH+pbZtvRBPwqbGn8ZvTvwcmskZci6sdIdl/XPRJ6mHYSf/uV2/HUzkNsHHZ0tWHDUvz7X3g3Llq3gs5hkgY/iXJ+hCPkPhQGdqE4sg/Qd7Ho6Kw22YmacqhZ6C4sc6OzcVypOGdLHL290FfGADsgOatxOqKdOw5i06ZVaGtvtZ9d4a+ttZVpuFfRifYVEpSL+5lUkk4xjZ3PH0Df8Khphnpotv9EH667+mJ00QFJDUcmJzDB0aXk0NU8tVHdFKeb48RueW8vjj67C2nTEFMYmsjiLM4ezuNoU1+BXtZNZ0YdDR4fIv80upe0m45ofVsGKzs7yILMTIdDNHJ0qgOVQdt6UFBAjeJZPdj/9rVuCTz1zPPY/MDTdMzSuS1cnD+5En337J1vfwN6OVjR7FUwHHx5Z2t/M4Qrl3IrUW9ZzrQ+8enPYe/hIXMdTjOu885agw+95TU4d+VSJcA91P1WOphJyWhmK6xLmm+5xIEUT+U5wDn43C5s+9H92HffNuQHS3RsPVRLC1pSZVx81jK85TVX4rd/8R34+be+hnXajVSJAzfyiuf6UTr2HLDzPmT6t3ImT0/K2ZgktM+a0aY5QBqjre4fyOOnO0fxucdJTxWwdaAD2WQXDUr2XEZvWwKvumIZ28xL8fG3X4LlyXHa2SSQPWoGhsj303YKjEmrUd9t+KuIdHh01DEUSKo/UnES4yNZbNk6hM07ixihE9L1gKXtwEvO70VbSo1OcQWtZhhrCEzR6lhwn55S29S1aV0LTWACF64u4+ZrV2FVJ3Nk+xgY0aqAHC7jJpLYP5nA3fsn8dwQME5nuCTNWVsyy9k32zP56FJJMcFc2fgT3Opdm4njh821PA0k42zrvT3tuPmVl+El562lHjhIGWGZcpRV9agZNsv85HO78d27H8bOg33IZFqxfPkycJxD3dN+ZZ8skF214r4pIrcBzOmg5BXSv8WGGjKpHXBG9wE6unme0UWgqp8NGnZUNWAML6BGOYbu1JwJAnGcWOIypfyBHjUyMu5Cy4s8Z5fDYjRk4Ft3bcH37n4UORq1DFgvf//wzdfjXa95BQ2Oo0u9ab2UQ378GEqjB1AYegGxyX5maK6wmHzMHVXKi2SvMdr8JJNuA+9lI02R/47jajx604S+GTaBI8cP4YJzNrJDbjXXPHRtqSXDjogprbz6r44gMPoAS3q6keOsZduuPeaajXIc46g+ni7jsvM3oVuj42Kezm4SBXPrMxslRbXasP9ali4x13EKx4fZeJOc9ZUwRMf5iutexpnGINLU0Uo6u54lbWp9mODoNsMOZ0NXp7mDzVZbUHe+44jAzeTqx1CcoKxeGWtBejDCm7hW7+mWDO7e/DCOj+pOQnVmurqiOi/i47/0btzA0XVaq2OSwVQI//nCzNb+ZginA2N/lPCO+x7Dj9jRjcm/JDmQaEvi3TdeyxnBZZxlxLB3Moe7jx7DsMxMnSspznRpXWdjp/n8Q0/hme9txoEHdiB7LEf+nYi1dpvZ1ZplKfzuL74BH33Xq3HNleeZQUucM4iyaJx1fuAplPc8iPbBbejgLMysJBjVqgPX49d0JLkx9I/k8EB/Ev/7p0P416eL2D7YgRHQwWVa6EwLSLXkccPL1+L3PvRSfOA1G3DBSsk3Rl91iG1lL8o5zbI5iDPtjuw1xqQWZK+yarOlIyjFxs215uLEOPYdyePvf9yPL96fxfHxdjMo0CMWB49O4Jnnh9Cqm6J6gDbj5PQIhtqG9GqYV0hOjhkHB/wv5ZtZfRbdrWN4ydktuPGKXlzBwUAfvd0hOvMSHZ2WkPP5GHYOTmDzEb1ejPks7cTaFmv/iZg+4aNrw7IxloJb3XmayOoDsMc4CKYdZjJUURpr6J2vv3QdrrtwDUbHxnCgb5jloa45MJVD0/XT3fsP4v4tW3Hf/U+itWsJNq3Xl/vVS2t4StkluDYqiWyHZEJ0Lji2cNtTC7/frwXJm/jYr2rpMhNE8mOqlqZHtdAWtfIKK6c+XLxm409BkMQuM+mABqmlBr8oQdBs2Dv+TjZ7bax6LNh9yW87WwMTTfsJPPTMC/j013+I0SwdA52h7op89UvOwZ/95keRMXdTqgGOoZQdRHH0IErDu1Ge5Ci1OEH7C0ZUhq8tl865fjQ4S2IjYJ4rlybonIC9fWycbDDqpEdHcyiwEW9avxZpjuqHx4bQ0d7GfY4waTH6VRwcN7rwLsTZiFcu78Xze/fj4DHOuDgizbMTG6XzPO+sDVjW2YYuOszDo6MYKGgkyYalCZjYkJ+2OfLQKPLEzr2mE9QF+JGhMTrMUdz4quuwlyPNUkrXjbTMVOastoTLNm2kw5ZzFwf3nzB1XBt+fdRDM3EE6cMoglCO0m0PZ5eXXXEx9uzdh2KxxBlyBhvP0jNa78HP3fIqtHJWx77IpgnEDOVmesCFhyujuqmj/aP47Fe/hz1HBti5ps3Nk1dftAm/+t63oj0VR47O6kcHD+MgO0LTgbPe8wPjOPbsHjx160/xxDfvwOGn9rJTZfXE2hDL0JFxVrB+VQ8+8MYr8Ce/+V5ces5681kgPTtYYCcbGziEwsHHETv8MNpGnkcL7VrQzFi3LEkPuv5VphM9PpDDliMx/N8nC/jkjw9i72AauWQbZdUQokhbTuOGq1fgjz9+E37xxkuwoTeHNAY5ADyC8vB+xCdP0N4067I2bOxYWVAH6uDNqgXtHrkJFLJjGKaD27mvhK8/WMD/z957wFlyVOfi381hct6dzTlnraRVDghlhJBAMjkLbDDGNsY2DtjYPGcDBoOJ5gECI0BIQjnH3dVqc86zOzmHm/P/+6puz9yZndldEez33u9/Zup2d3WFU6dOnVBdXf25H/fi2X1ZRDT9qg6jgWXeLWRpHQMJPLm9DztOUKmQp/WB1TJ6XFKaqssxPA3wUrrO4MBzM45M0BhlunzKrAad25TFmy+djkuXNyHC8TIUy5svGOiViDRDX86NF07EsLVH3/crQ10gTw/PKppi6fwTBppJIS6ZKNy9bSgM97GqNPs2j4YqP96wbi4uXNSEKMdYhJ5kIk08VAgHZiaXRn8kToNtOx5+6gVkiLfeZy0zX56wsmtUbBVHXbH6UbDNmxj7PwDnQEEq3LVj8/1m1aXRiiVQ6vWUPtibCBMbWjqGz5ZvIvw6CKaJFguq1547K92sqOUAJEMJfBKoRTjfuh0aOenNFIg5lXIwUcV7GlwS1kWGJ2N58x60D6fw6X/+No50DtOT0xcJ9MC7AV/97B9hZnmQyoxKLh9FPhNBOtqFfP9BFBKtQHYABXpL4+UjBy2v9XxOwlZBbdUqPz2DK9BCzHKw9sfD+O5LGTx/ioKDGbTnil7QveXaC7Bh5XxiygFIy3bp3JkUePSkyN56SiDmMGCkhdolxezCzr3H8Pkv34feoTioluHxunDNlRtwxy2Xmi9XH4/F8XBPN2IUQ2q3kLQDxtLFk84iuuMwOl7ZA33UUx9zcXMQ333Hjbj68guw59gpU3tzhQ/LZjXAT+Xp1e4cKoMgvMyfUX4TwNRRcjwLTJxynhpK0unUdDSpxkM0kcGptk54aCQ0NNRR2ZcbwW2zWPqZIaCfIjkN2PnnKeH1jJuzgcOn8lB++IsX8N2fPkbv3kfjP4xqXw5/96cfwYr5M+mRFbB3aBiPt3djhHyWS+bRuvc4Wl/dj2hXP5VDFl5633lPCG7yiDaAnjuvGbdcvRqXUpjOq6uGjyinsikkR7TbRwt80Q74UlFygRZY0NqiEWemL0kILbKgzYdsPI5EtICdfcD9B4bxckuW/Oq3Y4eWmqhUV+3BrdesxI2Xr8ZKekL+zACQ6EQ+0Q7EqehoGOq7beJTiX89BhCo6ZJhbg85nuNM287FEzkMJn3YeiyOR7f2Y89RD7piehNNKx7JzYUYltBoY1K0nWhjv8ortH2XN5s2pLFkWhmuXV2BN22qx8xavWKiUSDbTGPd9pvw0JkjE8xYEl8I6L1q7avJ4w4hni3Hno4QHt8dx5N7+jEYU075V5p2LaDOn8fls0K4c4Efq6tcCDBOU5PmqyEiImPMghzWJQpIYWX89BLLQyhUVqMQrEDGVYZDrSk8e6gTT+06go4RKjqhJBmiRySaoaHMaNDem5duwN1vvha1FewH9pkZa4Z/ScMSvizlUZ2bNk4Cvy5eLgWHrgZY/LhLh+al+PHPLkZxU8gqeUmO85AVBpzB5MB5ZjsDJpbzy4D1dwQlZRXba0Q3G696POYp71id5113MZmTXowl0LVDYHtPTE9LS1NoHHiqzeMP4e++8xC20kJ20ZPRpq9zG0O49+/+AtP1nCybIK4RGpMjtIb7kKGVWki0IZcuTllKsKtTVRfL04P/vIts79JnfTS0RpvKc9YoYcHBX+7LY9H0EPa0xdCf1nSRjwKJ1l0mieYZ9eYdHb1jNzI4jPoaveIgUcSyxCimPodWCi40NzUgPRLBrkOnzQvDWnLdOzCIxoZqTG+qR9jjQzSTRm9KX222dFE+4acdYAoUYIGyELJDMYaouadEh4604MILV6K2vIrCL4EVs5tQFdSUqkNnG0YH1GQDyCJZvDg72H56vaB2WGxElRAFyjQK+YbqClr58lEsf5mSi+jp/IyaxlssZ8Avh9t4cMrQmDh4qhP/9ehz6BqIsPv9Zqusd95+Na7ZtI4p9EyqgGfbOtCWSCKXyaKvvQsHH30J6e4oDSZrUInjtHvA9Ok1+Mi7b8LH33sj1i2egepwgB4FlWOkB5n2HfD17kZZugP+XNQsoJC6kpEkAS/PTG9eFlJpDNNbPDzox79tj+HfXxrCob4AUvkA0xBvKqZgOIcrL5yB//UHN9P7WYRplez7OD3owYPIRo9SVwwaxWlaKHYXTdUpGgssQpwSoGLS2ElEXTg14MfDh3z4m/t68cOnYzjZW45YqhxZjiFv2IuVy2bgc3/6QfzFx96NPVu3Y/GsGixbPAv9vTRK8+zZXJAletEzksFrR2P4xeY+9FJpaqu6Cmp5H/mxKFYs7Uu7UNfGABIhiZ8GBUM2K+WZwKyKOC5bEsCmpTWIDIzQy8sinfaxTCphKqCDfWn8ZO8wdgwGMK++ivSNcPRTQVGGaNpTU/XiSv3JhpAi9NKI8HT3wj88CB8N6MYqNzbSqL5x1TyESZfO3gSiWSpI4wVrnsKFeDKLvYeOoXlaAxbPbWZZDp86klW/ThA452fn5187ONULeF56Of5iDIqrLvXCOK9KEp3vWJs4KM8z2xnw6xjcTneMg2IfiPGdKsxg4oVT5/nXzcJK85XWV1KW+ZOiEQMyBEJl+N8PvowfP/IiLU7Nl/voVfnwl7/zDqye2cRc2o0iSpkTQyY5gMwQFVzkFMeolFyS8VR0UhJS1OJkjuysV0urq3hdwXtSguaNHePpWEUnJauRl0eQ1vvSpgocbM+jJ2uHxCAVm6aY5s1qhs9rXis179+UhfWpHZag9hjr2GmXOZACBSxZMoeK6SQHy7ARLtpLs58ewdzZjagPawNeL9qSEXoPwrWYj0c9OzTnQb/ZADfWPUDvgdY+cc1wUPcO9ePi1XNRF3BTgATh1fI0Y6mrXgeKZ/9jim4sXyn/vK7yzqHoBE6ZpeF8QMlsWk0NezBC4fXQszvw7Kt7KQGplNgFi2aG8ccf/4B5JqouerWzF7vZfxlNW5InBlo70XvwJJC0z2IFxIDlZnH5JSvwttuupkFCjyI5CPSfgKfvIDxDRxDK9BnlYr5KofqNcJcgzVGo62OncQwMJPFaewrf3xvHV1+J4bXOPFKusPG6tCJ4dmM5brh6KX7nnVfhfTdvQFNZGvlYK1xDh5AbOAg3x4h8GWuA2TGt2my7i7qO8RoH8VgeR3uC+P6reXzx8Qh+9sIAeiNUWP5yptVHUQt4w1Wr8fH33Izff8+bsH7BNDz99JP4yrd/xGGTwF++ayPed8NqzK6vRIrGW+fAEAunoUC6xalqdp1I4pl9I2iLkDaeAJWJFz4qH/Gm4XcFg48wFC14IFhFR6/N0ElKVB5VHPVlKVy7pgEXL6Ly9LsxGIljOE4jQrvQ+INojxfw6OkUWjI0cBnXwHESoIFsdooxckF1cPyTjlpc4pEM0GYZkX64hzoQGGxFRaQV6+o8WN0QQCsN1PYR7eZCNBgkD3Qqz/y6yzeY1aG230lV3bA/k8BU8b8hKNLRgXGXE+45YJ/RyaNTgpJEZqycB5wxAJ1yFF5H+893IBvemCrYn/FQxEGKTr+qx86d69Ie1ZnnBUUcHVxVjsPQTpyOxuo3Co3nPh+2HGjBn37pf3Mwi85akZXF+2+/Fndetcm8r6PFJx49GE/1IjHcSo+ujQO6H95MjMnzBnMpcau4jN9AoVWOnLsKOS0IKNBKzicNelJzBh+DiwSBmRxEbVkW88ncW48nOWjpiXGgtbf1oLw6iGkzpzGPH9mMngW4EKLVb+msgli7KUcRFrTh7WUXb8Bjj7yAFEeJbg0PR83zv2WLms1L07Ld29IUUuY5gsooFscf0c1fVWb2V0xQ2WmG002reSSWQUNtGS5YOod4aOqXlZlMar/9s5TQQedsr+4Vg9Keb1+WtsdmFm2LcaVFlN5jntI+N9dKMkkoLeIMED0cGFc3Q+m9CWB46xxB5ZFypkh90+1Aaze++N2fIKF+ooGRj0fwtf/1R6gpo3Ih3U+ODOFFWv6DOfYV87pI0FjvAHqOthghaaesybNmQ4AUjh49jieefhldHR1oyJ7GnEALwtle5pOCs1NdggJ5UiuB8+kEIv3D6Owawq7WKL62ZQjf2Z7G1p4QIskyptNXOpKYP7eSCucG/P57r8O1F83A/IoEvNETyPbtQYFGnyer11KKBpj514/arLGWpVFkeVS7piTiObQNevGtrTl6cB14+QDQGyW/cczofVVNd1591Qp84W9+D3ffsAkrZjWi3JMxRubff/0HaO8bQtgHXL6yEqvnuLBurhe3XjIPN25agp6hCFp6osjQwPQEyulXeXCwM4Undw/jmZ09mNVUg+k1WhlKepFu6l63Vqyq/4p/Fjju+WtsSYHIxrHupofXSIW3caEHb1hXi+nV5WjpjND7pAfo8ZuX+A8NZfFCWwxH4z7Ma25ETYg0IA31Oo82ejDTo3mOQCpr7YkpnvJLxmTj5oX+wwNp3L+/By+2RMgXWjZGPHP0vY3XTQOAouv26y+Ged9xFF/LqkLTsKz6wTkv9vlkMJE/S8PZwNYxFkpTT7g1Pu0UMDZ1OSHhOfAYhbMiPHX7z4BzNXwUzppsipuMtiLJglOVUyfJbo4OKHqy4MAYrmORTpy2GrMr+sjGLh/aBxP4qy99G/0U4orT97luvnwdPnLHG1EXlBJIU8mlOEBHkBxpRSbSBqT7zP56HgkOWlkGDBLFo06omHKuMgYO3IIUYpz0Lm2jbZWOWq3lZb1VYQ/VTgj7ODBTxEUq4/jxVsykV1dTV2u/3E/rsixAq5UWo4ozpei/2D4LLuMFzp43E69u32umV3S3q6sb1bR+F8yegRDpEEulEdGzQz1zED6s0xnwWpAQrqlCZmAEucGIYmhJ5s03uJYvaEZlWZAWqanY1OgMMl3ZGIK5p9Lsn/0fvTs52CxntMeGIpTeMhgXwSQbuzm+jPEw9R3COGVmCrWngikUnTPtfi4Q7+mxqsRoJFnA3375B+jqj5k9KvXKyj133ohL1q1lOhonNERe7uzGsUjMWgzKz+rTwzH0Hj0l096gprTz5zWRV3M0ZqKIxVPYS+PtlX3tiCbJUUEfeUsfv82Rl8nn+SyyKRpUiSR6qDQPt4zg/gMZfHdvHrt7y5HO6FURt3lR/ZKLZuN333UZPv72S7F+XhnCmXa4I4fpwR1m/Z0sU1tlEQchQTDPwvTMTYHIqr+1gYHeuRuJFbC7NY6f7szgi49E8NzuDFKopkfkMzSprPDhso0z8Fe/9xZ89C1vpEekVx6GzWKvQvIY8W3Bjx/fif7+lFEet1+1ENOrKPwLEdJuiB5blgpvLq66aBk8vpB5nmY+xmHGUoFj3I0ndg1hT2uSmHpQX+lDBZE3U7fi3qn6z0hq+X32vsrSvihhbxLLZ7px1YoqVHlzGI4WMJyQYQxkcz4cHUrjieNRHEt6kKAnGSzzotJPepgZHhbkcXMcqz/c6GA/PdFZwD/tiuAfXx3Cy+102AthZKgQtVBGY9SayXmsW7sUV25cYb4+YfAxLKk2TIDR9pgEv16YQKopKGfhrDcteO75gLPqkqlLMpzHmDJw1sH3Otp/PoPYwFmTnXlT5ZpQcs6fsXgFm9TAuPgJgT82jMLYublPENPLTBNzJ6k5vvCtn2DXkU5ay/Si6C0tn9eMP33vHVgwrZqp4xxEel8uSi+unwLmJNwJDu68vkygd+bE8MU6SuvWwTCnpin0/pAWsXDEadpSaUh3YlD8UzZ1RIHKLof6qgC6hzxoHdSjaG0o68PhQyewcvVChEJB4pwz01vhgDxBgTURijUbFHSt6amGxmq4KEB37j3CGxzsDMdPt2L96mVm/0KNnT4Ky5TwYKFqiyxySyse/V5U1dWg50iLRi7j3RiKRFHu92Ap6WS+SWjSm9T8K8WjWE7xaMLo3anBGiET05WWTBh3e0L8GXkVRRpRGpiVdUxkcTkL/BKKbvTbkGcBp11iQY+/HP/y3Qex+bXDdrqcdaxfMgcfeOtNCFEpJZHGtr5BhiGY7ak0lcb8mvLKxhLGoysk9QoBy+T/3Xdeiw+/7UakR4bR0tJOHmBfJdLYcWgAz+7oQ8dAEvOm63lVHLlEFMODIzjW2o9HDiSo4Fx4qbsMIxkaL8ynfVLfcPkifPqj1+Adb1yC5bP88GU6gMHD8EWPw53V6kG2V/iYRRfy2hREW7VT74tSyTFNIRJHojeB3W1efPX5KL79XAovHvCgLxYwRqDw1FcOVi6rwac+eCPed8smzG+ohDsVQz7ZA0/0EPzxAwgkTyBIZfbES6fR2ZtFVaCAt1w9D7XhFPLZFPnTbnfmccXRXOPGletm4sKVs8x7o6e6OH7ptelPm+y1dGfx0v4YthwaRk19NZqo8CQPzPIaqzXGAVvJoL4TH9kY9YWOylcVyGLtPD8uXlqGhpALbR36Xp3ev/UjRuNwf2cCzx2L4OWjcUSzBcxqDNEjpTwgI5weLuA/qNz+13NtuHd/BPu680hkg5RHbnizETQHUigLBhHX0xHWKE98w4alWDJrulF0Xo5vw9dT8KWFs937JUHNL4EJl+PhrDct2PfotBWUSTyWw1pQuhax2RHjgu4rnoFttKlssD8W1Hmj6aYIk8HE+KldU0WU4jl1MKNfuMvjGtcWCmhND7Iz5cUo6dQwvj4HVL5w1EB0CtCKwkee2YafP7MFMS1xotCvqgjiw7e/AdetX0ErlIpM7w5lqehSEWSGW+CKaauiftJU37CS3pIyE4ElRHk0tNaf7CstEkiauX1Xcad8s6O8PECzxZF9Idh0EIWCLYcKLOhBY2U5Wnsy6IvmachT4RG/blr2q1YthT7CG0knjLIJUBFpusi2SUGnql9lUXESSX31ub97AC2d2mTWy0FEy3awH2tWLUAZaZBgG4ZYfpYD1vSDKUPksErPHQ4iWEHr+Fib8Qj0vGBweASzZ9Rjen0VcS/u4mDQMDXbi9FgYyaHsb5SnaZ/HJBwd8owTOyEifeKg1yBQI5x7oyFYrbRe7yWylMOk6t4fxSKZRkYLaAYpoCplJzpDxNkfetIfibNXtl5BF/9/gMUhtrz1IX6Mhc+/p5bMX/OdGTdebREM3jyZCdiBmeLoDZ81l6X6XgcvUdOIUcviUxl6rnyklW49uKVuPrC5VjWUI7+9lbj2WVYdyyTx77WIbx6dAAVgRB5MonnDkXxtR0ZPNHmR1eWngOVbSjsxsLZ1fjL37sTv/22SzGrMo1AuhPpwQNwRU4jkE+QL+SpqU7xC9UUcZLhqBkAUUdd6NMq42gcQx3D2NGSwxdfTuLvH6MndSqAWCrMMaDP5bgRoLJqrA7inruvwGc+8iYsa66F35WCJ9MHRA7AE9mNULKd5Y1wiCRpMLrw3LY+HO9Mozrooke3AJVBKjp6PTIitXBDU7g5jg9vIYpZ9W7cfPFSbFoxB60dvYhrC1qt6vYGkIAPHcMePPhCOx7dNoSqygrUsP2aElU/q59M38s9c84tk9pgI2y7ld6dRXVZChfM8eCmtVUIUnYMxFJI0bMreMM0GmlIuIPY3lPAKyfokdPI/sbOPvzNs5148ngeXckgUvo6Og0a7a+5qCKDj26ci99dPQe7evTNPuJBGeMqZHHR5atRX1uGeDKFAgdkkAaw2E/8LXDGsQOGaw3uZwb+TgljvGvDODjL5Th9MCHdZCAszNTlZDujnFHxODBNM3BGqpKIs5XgwMTGTlrvlAXpxrlrOVvZitLDZavkzlXW5PWZfMVonevTMkdO9OA7P3scrQMjZFbZpH5ce+FKfOIdt8HPQaUH+1J0riRt66ETVHQHgUyPibPewRiNx2CsDeZ9H9MPshLtqc2jQDCo8tyE4iWDJlmqywuoLffhWE8OI2lyMJl/eLgfGXqF8xbMo7IpIBpP0poNweeRvSlvTYWyDFN/sQ5CeVmInmAYR46eZh7t5uDCyFA/KioqMGfObAomD4bSSQ5867FpxatRcMXBnaVMC9PqDbGC/tOdkNEVjecwNBTHksXzUEFFKIWqam3TRQNTtQHjrZZcj4exGybPuHSlhYy1x8JU91j3+EKmBIdeAp2Oy3VGfb88jPGs5Q3RuGsohr/80v8GScieknB14R23XIKrLl5ltprroRfyC+0harPxn/zGfEZJErdMNIr+w1J0mm5nmeSBjRuXYdXCBTR88lhclccb5wexvNKF5EgSbVEqKK+HgreA11qjeL41g6dbfGiPhZGmYVkdAm7cNAsfuWsdPnTnOiqcJBA9RmVzgt5fG8dDnAqoSNlie4wHxHFpZgC8GlN2NaEUXGQwhl0n0/gGPbh/fymD107pmXA5MzERswcr3Lj84vl4/x2X4JPvuQFXrtb357I0KDuBkb1wjeyEL34SYap58xUQtllThZpBeWJrLw53ZVAdcONNV1pFp8cHo+ORnpvGR4YGakZbcqVH0FxXwG1XLsfaZTPQUFtnphhHtIiaf3pkEEm68fy+EWw5lkA0ncO0qgD7RMpMz8ek69RmGywVdK94TRrYflUsjXHSoCIQw3oqvEsWB7CwUZ+syqA7QmNSs0ZM05Es4MXTaewfAD01em9Uui5XGk3hPG5Z2YgPrWnEJ1Y04yKJfXrtj3Yn0J6iUU06FCiXVq5fhOl1Vchl3RhOcuRS0ZebHZTYJocO5wlqxS8FEzKOuzxLoVPh9z+u6M4LpixIN85ey9naYe+Jtc638yavz6lDg1MrqUbiaXz7gaexZfcJMipNOFmzPNz7z3+Ncj2T09JgaPf3ONIjp5Hq2w9XuoOMrLl9YqPOmhQly/SCXDGBk1axo50sQcpgn2EoFIEnSiHrcEY1L3JeHG7LIqX06Qz6I4NmqqWucbrZoiidjGJ6WNPamvoy2fljatKZAZ1Nn16LoeFhHD3RSRyEB4Vp3zDmzp2FpqpqenVZDOSyyFGQSsGpDRJgKsu88M76A9PqzPO6JIW0DIPOnhFEKS0u2bCCio7CiPWopyw4R54ZfTl2PR5K0tkCSqDkQu0fB1PdU03jCpkS/rsVnUpUcHEs//3Xf4gDx9rJTfo0Th5XrJ+Dj9x5IwK8R92H+4+24qQWMDGr2iOxKgKZa/JwdoSKjoZLNpYmfeUhwnjoa5YupTGWhr/3KKrJt4tqgrhmaZ3ZgHz/yW5kPAGMFLz0HnxIGl7UM7ssVs8O4W8+cRPWTqdhlGqHK94FV3aA/n+OfSt+sP7veOpaBSTh6uPRTSNqoHMAx9uT+NoLSfyvB6N4tbWMRlGZMY6Eo5sKcdOaGfj7P3o73nPrxVg5u9F8md5DAzI/sAXegZcQSLVRuSXIf1Icqk9TpBqTVIT0TB+jojuiF7UDLtx06RzUBjNExT4moHtDnKhKRChVqNmTzAgVXhfyyX7MnxbCRcun4eZLVlC1uHGitQfJnBaRiK5u9I7k8eLBETx/OI76pmmYW5eFn8allg+NTlXyT+fmT0f1CWs344VnnrzuU4F6EzQgkphXk8TiaR56cQmOX6JFlPS5LLXOrMDOJlBRGMC71zfgX2lo3DG7EsuyBZTRCvJryz427yF6dG1UjsqV51hbvGoOpjdUsQ+JF53ZGD18fd6rkoav2mxwdWTNOUBY/1IwIeO4y1+iUM+HP3BX8esFyj1WgrGUTdMnCyXgZCsGZXMuf1kwQqI0nBVK8Rqf2BECpWCFLNmAiFolMKE9E0Az62Pq4szyneAl4xvm5GB/5NlX8YOHn0NerwDQoqusAL71N5/CgoYycmGC6VPI8ZiNcgB2vUpL8xT5JsomEBctkiIzqSbZmarTTnOIwS0TG29OcaP4qOYxGH1JnnkccM4NjsyvFwoWTg9RQWVwuDuLLAVOkl5cNBY1qzCrwmHEtR+mR5s/a+d1LVe2GGkQCR9TGk/1LbGm+locPnYKvYMUpUyXiMcwOBzBvHmzUVdRiQgVaSxnV4BZVHg0eAgj2qo+L6rq6zDS1g13gkKH1vnJU50I+r1YtXjBaB4mNm1xgsMshka6OS6MgclfGmUYVbgojJVng02vMB4YoWxn3jgDlKI0jAPV/WsCiwuFMAWwpiwfemYrfvH8btKbfEIFsmJWGT75zlvQWF2GlDuHF7sHsSMWMUaHOs9Y8TzVWhRDEjYwORhB94ET5hmdJQSwYcUirF66GO5k3HwU1R3pJbuKVmksrs1ieXUQJ/vT6Ez5xSnM4vQsBfxADA88uQP7Tgxq4KGhys1+lcemfiYPkA/EX+abc7rm0ePOUKhrJWQK7T1JPL59EP/5Uh5feDqGzcd8SBWqUSh+daWsIoArL1qIP/rQTfjoXVdjZm3YeD4ubaE3vBPZnpfhibcQExqYbKOepfk4RvzkRz13y1Dga4eevUdS+PHWGHoSAWQK2nqL3mhZGaqC+n6HpbEYIEfDz5peuiLmmhLM5ZGJDyGXiSAcSODiNc24+oKlCFAJ9w6OIBbT4wgqKncAsagXj2/rwitUeJG0D55ACBVlHtNuFWu4g3WbzwmJ/KSJjAEZBmYRjiePSMqHna0+PLC7gK8+HUFLb8hsEKG9MTXdLto2+FL45PoZ+Ls3rML18xtRyXZ69ToPDRnNs2r7iCiV2SNdcfSaDeBZN8f7/JXNKKsMYZDec5KGitfnx4heNXH7aQDQqjFwnjwsMk0RdCiFceNqws1xlxMzTgEihTWh5NFpMcqkiq548jrhXNnUGHkeGgRTJv4l656Y0Qqt8cHEF8P5gDCdCkbL41GeipYuH23tx19/9V5ktMO6ESYZ/O0ffBhXr11OLRUns+urwhwwiUHEurYjN3yI1/rela1JgkH0MaFY/ug1e0xHYWXZrKj07GnxXvGoU2aX8HLA4GusUV4wjYTU0hlV2HUyhqGkvjyex1CEzJ3JYNr0OoTDZRimrCvz5RDWnlFGqZiCbBgFKfNKTGtqwJYdu5DSVkMUAAP00PSBzoX07CqpyHo5yKSD7ebIFh9bjIQyaaJPB9H1jbb3kGyynoF9e09g7pwZmEV8pFAlnC3dFdQGpwynvMnD2ZSLuX9eYOs9//RTwFlweb1gcRH/+XCkpR3f/9lzaOmO0DL3sM/y+MyH78DK+Q0UkTkcohHz9GA/IszjphC1ZoZ4zuKjbd4kKBOd/eg9fJJ9IHpbA2vVknlYs3wxPOkEPIMt8CRZR578zfT+RMy89zWc9GB7L5WTnjuxr/Slck0/aivdNAV3S3cKrx6MYveJOGqqK8zuN16QwfScOkMFSu9GK411zGkrueECnj4K/N0Dg/jRazns6fAhnqGx6A0jpylwbxZXX7EYn/2DO/DOGy7C0pmNCJHvOKiQ6nuNCvk1+KngvFRweu6nmQIf8dHWcq5ElMqP3mt8BJ1DwA+3RPGFp6I4PqjXLhifK2BvyzCe2t2LPaeTqKwMo6nKLiqRsUkuMFRTcJ6PKuRyGWRTpE12BI01Ply6dh5u2rQRdXVVOHq6Q68mGmPY7Q2goy+NLYcjeG5fFIfaUmisKgOdZKPIRHdNaZrdhYyiU99QdrjLsHugDH95byu+9eQQXjycxgAVp97N83klMxSolIjZkvoavH9ZM2Z4MsZz9BI38726OL35ZNZgH6Oie7g7ge6U7We9z7hs7SLMmTkTfo8fsZSMAxdCZZU4ORBHeXk5+1qGjJT+rwai2JQw4ea4y7NkHB3v9oLBygsqOnl0ou743BMuzxvOJ5tB5GwJX3fdyuAEC05jRxttQGzJhrPj9GfSnyF0StOLme21dEdpUbZcEVGBY4+e22Akiz/8/H+gL6b5bk1ZFnD7TZfjfTdeCV8uRWGkbZDSyKcGEO/ZidzAfjKfltbrzzK0yhxVY1KUZ4Bzzznlj40yoFMHV+FYgrIFtV33zR/xptW3pKkCrxyJIKa5fAqC7o5ebTeJmbNnIOAL0PhL0JLzI0AGN0VQYKgEC7YkTVc2N1TDHQhg+67DrJtWLivq6elFY2MVFsxulrgxS9rlPciLsCCMKXh4yJFe/jC9YCrEZC+tfw5O7QV68OARXLR+FWoqKeTOgDNaWAIquwhnSTaeR84DmNzkMIaMLl5v/hK8fkVwcB9JpHDfwy/hudcOkY6kPQXRnddfhLdeu5FCN42RbB7PdQ/gFI0YyzxWyQkXXaqvKKURP9GG7n3HEesbpAOje+RH3l+1jIpuxRIqP3oFg6fgSQxbo4X58uTtTN6LYwM5bKX3pS/Oa86rsiyAa9YvNTuhZHISjfqCghsdvWk882o/jnTm4Al54PemzIvm6cgwskRP+xC8Qq/tq88n8JWnBnGsL4QUDcesZtC9btRU+XHxupn449+5HR952xvNFmTlupdh/uHdyHS/QAV3Er6CPv/DOijMtSuPUaTkZXckilwsi86eLB4/lMXnHxmmZ+RDT6oKVLPkOzZM0/XMk8gUcLw3iV9s7cJLVNI5ejU1ZX5U+pnGDANRUYaaHU9a2m/olopTf+uZ+wj5Nof1KxfghssuRNgTQjSZwTCNDn1VoeANIZ7z4nh3Bo+81o3TAwWUl1WhMpgnXYi7plRZ9lDCjT2tXvzT/T34y+8cwOFuL2JU+lJC1eE81s/x4ZJ183GkddCixb+ZVWFcRY++2p2mkycNy0DhUIilUUhomWUBUZoBD/dQ0aVtP2tcrtqwBPOm06tze1FXVk4lX055QGSpnHe09EJfpKgKmFHPmgjKaHwnHScDxZ8Z9DsRRsdi6U11R/HUwGQZJwUltIk993yQiu5X2AJsIpRmE9Ky6IzAZTAeSjGYh8yKK6WVE84blNhRNmP1KDgwes4K7HQsgXEGF506FY5m4UkJMuaUYGQ7YbQOIyi8o+3rjafwZ//8VRxvH2KX+4zQXrGoGb//W7dgRh0ZhdaYRwvt9b5c30Fk+nfTOh6hnEkZJaEl4PKCitWaINaR0rN/tm7T6wQ9NTB3DQGLadQ+I7gsPYqGoQFZ8MLaJDGRvLbJ0aD3b+i97TgVR0Yv8ErZdfeYDzXOmjWD6QNI0OoOUHcHxfAaSk7BBDO1UjxfumAWYvEk9p9sNwpRX6Lu6e7GokUL0UQrfiSdQpRWpZkqUyuKDCB6GkeA5QcqyhEZGEJqJAYPBWMy7UFXzyDWrlyIsoDqV4ZiP5jgRNnrUTAN1NFeTgXj8pwLTFJRG+gbTuChh59HJJbBjJnN5GlNvRVxsM2aAhykivUWD2eAYT4rtqYK4n3tbfrynsP4zkPPIU7pKb7ZsLgOn73nDvi1PRdjdg5F8BrpmVSZwk2B9NHekOqLfCyB40+9jJbntyHVQ00jg11p1Rbx8tL5VHSL4crG4R+glxQvbk3H/ssyrfZaPdiXxJZOemNUEiwWDTVh3PuPH8Ulq6dh/iwqkWQSA4NUFjSC8vSCTvdnqDyGsOVIAsc6s+iIhrHttB9fe6IXP9iSwN5WLbDQNxNlgBUQCntpOF6K33/nzXj3LVdiyawmKrAclUofsr274e7ZAk/kIL2XEY5MymWNJ3pEPjfVV5IiPTZIBRdHz4gLP9mdxr+9UsB9e11oj1Uj76XS8JEvPTlcfMlas2tMNBKjd+XhGOdYoXfTM1LAln3D2HJoCD1xD720Mo6bvJ3SpyLWrIxAM5B0C0kUlpcYQSbaRY912Ky6vHTtQlyxfjGWzJtJ6ZtFd9+AWWmsBWzIh0iHFF7aP4J9p9MYSrmR8Vbh2X1JfOkXHaRLF3Yep7zwEF+fD+FKYNOaKnzwhpl455UzkIwmsfnwELtOr2QUaAAEcWUzcaSx6KERw95md/E4TEUn15Igj+4RGic9GckeO7bWrlmKeU3TEPBq82+32SFFw67M56fy9WNv9xCWN1WxnWoob0qWjPK+WMaOgXMFQy1lLwYdBLqnmyW3xsHYAh0bpoax3EbReWlV2EyMHs1sO+31Qmm1TpkOlJboRDuK7ozWnBco09kb69zTzuApWi3xRMF8Idrt95sVgno2ICSt4rLarLQ8R9HZttgLTVXo/R6rOCVYvPjcF76FHce6kHUHGLKoqQ7gk+++FVesXmSEg5YvI6PXCFqR6d0LV7KPheeoCLQwhWWab/yLYUwVBsbUhwNjFBw7mwRMe4x84rmJ4aF4ojgGebUq34hRdsK0ch+04e2JvqzZckiP044cPoHZVHSNjbU0cnPIZNIo8wfJ/MLVlu/IQoHoo89vyvI/cLQF3b1DRkDFYykMDY1g5bJFCDJtJJ9BWoPE4CmFyyHoNEiF0XsM1VQi1t6DPA0I7eLS2dOPbLaAdasXs9+UrIRWUrSjFxYPG2xx54LSvOcDUs7i2/2HT+Jzn/snHD9xEhs3rqUHo8+pqFIlsmnPCyZUP4b/uYNw6e6P4G+/+iN0R+QVgx6HB//25x9FrbqJtOlIZ/B8fwwd9OrMtlNFpjYKTlI5mcbRB59FdN8x8irFJPtYX+HW0nKjsSjoly2ajfWrlsKTScLXfwI+enRGmBOUTntkak/GV7romTFvjveClN0fvW0D6j39WNkM3HTJXFy+fg4G2Jc9A8NUeAWtbUHvUA4HWtN4cX8cWw4n0T5Ck1DujkvbbXnh82dxxabV+LfPfRxv3rQKs+sqOOKSyMY6Ee/ajkL3KwgliBPiTK/FJfYdUD/Lz+fiyI0MGS9mMObFY8dc+MwDUdx3IIi2hL6OoI+4cgSzuqZpFXjfe27D22+5DNdcshHl1eU4caoFes3H6STtdzkYz2P7sQie3t5FerswuyHEutJUdnkzJszsjGEA9hGP5gPKsX6O/VPE5RSq/VGsWdiAN129Du+49TrU02Pq7Oyl95hBlnwdpxfZRvHw/J5h/PiZ03hixzBa+im/cnbHovJABlesrcKfvWsNPnjlNCyqoPGRjeLoKRoaLRwvrFXPIGdXh3DltDJU0CvUps0yjzXWChEqupTtO72O/3hfhh4dC1YT6TGvoEcXCPlolBJvv9vslOLzULFS0dVVerG0MYyyYnKBh8pQ4zib1ZSm+PL8mN8YyA4vj5Z2HsD05wdKZ9Naj87sdcmIM/KPJTxfKE2tBpwruwTGGXDWPLpZGvg7ZcNFSMty3YPDeP8Hfhdf+cp/4pFHn8La1avR2FDLEjRXXZK/mN4ci9G2fBuMgJVwLt7XV4PvffBJPPPqfkQylDJk/OqQG++97Wrcfu1G+AppelZaopxALt5Pb24/3NHT5DnFZfTiDRmFA1Nfz2Z5qsWBiYrO4mOtLlln+i1ejAMlsyq7FIxKs/QuIq/pFtWhX6/PhbpwwLxD1JOQPUimZRXHj5/EgrkzUc9Br8/y5CgI9YKpjATlkxep54pjrKrdGPS+1AwcPnwMgyN2L8vO7j6zy/+KJfPY5gyGOfDs43mhY9wHg5ZAA8BPKemhCznY0m4sR43Tnp4BlIdDmDe7qbgPn63/nCDCFcueCs5xexyYlrLeaTQA3nbnTbj15mtQR/qM8qElsj2fFMZwtn2qHxs002FWyxX7xsbb9A6FBcZ7MLdd+PzXvou9pwZYVoBeuAefeNebsHrmdArvHEbyWbzQRw+BnozeeXOyGdAJDYmuF3ZgaP8J8iTpTprfeMP1kono7e1nmTxhvlVLF2D9yiVmWzpf/zG4k1R0BN3PU9Glcxkc6E/ilY4k69E0WAGBgBsfuGUN8tGTZmViLjWAal8c12xoxAULqhCgchykd0FHhM4P85j5bD2LIh1YrZ8e0JWXL8ZnPnYH3nXzJaj10zBND5uNFZI9u4jgNoRTLfQ0MmQx5mWdem3HbEVGhZyIxDE0nMUrxwu4d5cH//QCPbhdXvRm6uEKyCihgvNRsC+ZjdtvvATvvvMGLJvRCFc6SXVWIN/PwIXrKSfqKSdIA73fSSfNeGoytuIZF7Ydj2O3vK9oAUHyd1UZ+d9Fnlfvia9FP9ZEW804TF4qRBc90HzkGApUzq5cO9bMDeFNlyzAuvkN5iXtU+30PEnTvDbyoKfpYrmBYB6rFpbh9k31+NSd8/Deq2dgQUUWwUIC6dgA6ZugsVDAttbi6mbWOa8miMumh6AJWXaSaa9hgGiWhjbx42mcRsGj9MS7Ui7mo9nvzePCC5Zg6bQqVHg4tjMp+FQeyeunEgwxLsDOCdAAcfhIM1KiT5T01ru3puDzBsPE/Cd3m2z22inbQDHJaBh/9ywwmuFsis5JNC7ynDC+CF6dT/ZiMiecPY8V2E6iUeFyBohq7EyTnJ2YcqO7s4fCqQmr6XFcfNEa87kaPew1m6wasFNS5tLgToKb8u1RSs5ZHq9ovXv3yq4j+PZDz6GfFqNWaYX8eVyzcQn+4L1vQ5hKT9OVWrqvT+9kho4jN3wU7lyUzEGriorOPC+Ud6gpQVUpNIpgBZ0FI3AI8biHFi4tcw5oyxliXp0qtQ0ywouRJrAGXosQUmACR4iaU5ZlhURVuQtBrx8Hqewi1MEazFkKo86ODqxYthCVwTKkqKT00qzeq1Epyj+m5kQXe1ZdSUuyvAw79x1FPG0/HXSy5TSWLJiFWbX1FBIZxBlnpi7NA3f2g8FKGDKQHD56dSHWM3C4hc3MI5lK4sTxVqxYvhANtdpGKmf7akpwbvJoR9GvB1RcsZ0Bvw9+Dm57TezVHiURg0wFpl90NBfFvrBBfTeWt0gRJlepdol5EXiqe/f+4nHc//Q2Cii9L1XA7ddcjLdcthblNDY0WbVzMEJFN4CkCi4hluoQLw8dO42Ol3dR+FI5MI+mJ99043Xo6ujGiZP0QFiq+HPtioVYs5yKTntO9h+BN6217CpIfSiDL4NDg2lsaU8gK7eSVfn9HnzohlUoRFsoiIeoIOLsxgQ9wCE0VKRw4Xw/VkwL0oDpR9eQPBE917W01MKjOfPq8OYbL8WKmY0U6Pbdu2zfZrhH9iOU60PInTUCV9+NEHeLh7w5enrRGIboFd6/O4M/e2AAPz3kw46ucgwmq2hQUnnQqCswbyM9sT/+7bfj7hsvx6JZ08w0aCabNnTUu2O5QgZlIS+WLZmLiy9ci00XbUCcwlzT+lkqZW0tpt1JOgeBV4+n8NSeHpzsy2J6Yw3Mt4Plyak0029sk3pMyo9103UmHWL0kPvhjg+QrjSE0ynsPtqHA50RntOAoILyB3K4eVMzPvPOFXj35VW4erEfMytomGrvSi1OYZvTiTjSxHdfpwc7W4k36xNvzDWKLojqnHpR68cl64hKjMZA0o63BGXWIzRQOpMeM50sR3oDPbq5dZUIU6mF6OqSBDTYSWtea1FakIa5XgsxnTwKeeIqGaYKzhcsXZxgzV4BjyzHjCkFcz0WlMoJZ4exVJ4Pv+9tn/X6QqaA88h5ThhXxHmUOdqQUjhrnrGb5yNUbPlAKODHZZdeiOuvuwwXX7wWZWE/Y5mfg18EttNR6npl0k8psAyj4GwomGlLD9r6hvHtB57EoVO9vJYl48X82bX4x9//IGpDfjJjhswc5wCnlTvUjszAfniyek1XXg6ZzUPm8xEPKjnNOxsotkkgZh0DWckuWnZaYkwRVspPPC+loUMPtcnyHa+NkCumKaG5oY9plwRpAc21frN44Hhvyk4faTDEokhQycydP5tK1ksnIMZy8/Qe9FkVler8FcszR6C+tgaRaByHTnZQqetZUhZt7W1YR8+gOhxElANb71tJsCi98prFD0VaiCbBplrj4UTaO41VGUsTtxNtRvBWUpmWTn+YPDqW0kZ4Fe/9uqG0XlNPsa5z1jdOGCjtWHqHDSzYe6VlOrfzJMaRlg78zZe/RylUTrpp27QZeN8tl2M2jYACBVM3++j+U20YIH+JxmRG5rRlamunVP8QTr+0HfmhGCsm3QMF/NbtN2NGfT1aTrdj/8EjNMA4Pijc1i5fTI9uKXzaaLz3KHxpvZGnKWdND+oF6jQO92ewtS2FdMHuyhOg4PvgTcvphXUxjfbTlLel6T3xpQRvDnXhNC6aFcJIpIATgy6OjCDj2SQqo2wyjlc378QDj76AZ17eg9hIL2bU+VAfyph3K+3mAxT6LhqM2uuVRtip9gwe3O/C3zw5jAf2ZjGQryEtQkxHo5PjRptALZxdh7fedjk+8YE70RimsiIfaos1DlSSwY2w34+aygrU11SjuiJMwc44Du/GyiCuumgtLrn4AnqbAURiCRqeesZuFUuS4+V4VwbP7xhC7whQq6/lV+gxR4aKgviyfHmcWmCiFZXJXAgHO7x4+lAOX3qoE//64HFsPxFBKmNXTeq5fn3Ijbde2oDLFrlRjhHmpQVaNApNV6ocKjrNSx3u8mLnqQxTkF9oRC6oLcMVMypQbp6lKo81lt0x4pFgYD/o83eP9KXQmfJCK1nTlEmr1y/CzIZK49WaVbOGduwv4q7N1kM07iQzxrhxanBktANTjg0lUxi9Pz5faVXnrtUBpbSpjUenjynq+vwLOAs4Zau8qRo1EUwyEk7pTR4nn3M+MfCX6cwWWSTkZNsjsauNPLHHogLTcNdgZ6cbQpr7JtbeNwKIMbaKEmAZJloDmGncZBDy2zd/+hSe27KflpC+C6dP+qfxpc/8DpbMqKa1pVcG5P3EkYt2U8kdhSvZyqwUFKNTdfJJxNLmkrg5gfgyaLpuFAzDyHtjyKs9opctx9DO4G2DbW2xEcRXPKmBWPwn8L7jQSnCtJsHHn2eLOY2BRGL6xMnWeLHezkPhkeiqKoL0yOuMc/okhmtocwZpjdebrFkW78FbfxcS2FxmIqpb2CYgyVgvDJtDLx+9VIO2gKGKJxSzGOnP8ZaI0FgnzHSqmysQ5r5Y/2DZrFKP72ULlrVV1+1kc2gZSz3T6B2qCyDwBgeAtvW0phfHayJZP90ZRrgnJoUZwOb0MGymK3krHjFMp14s8iIxFFr9Rznc//2HbRToGq7q/KyIO66/jJctWaZMa7iFEz/dewUWvL0koz2lKcvnuG5+CFNT/21fYjQo/PSQCvQ4FqwcAZuvuZyMy18jIpurxSd8tCwW7lkMS5YtQTu1AhcPVR0VHjiSXk+Irie3x7pz2JrBxWdeb5Gb5eK7gM3rbKKTh6ZHHdVboaf+pzaI59Ennm3nSS/DVAF8J7Pl8elF8zG1Rvmoa2tjcZNBkPJNHbt78fOo4PwBAKYO6uOQjdN3GIsO06ecOG7T/bh315K4aGDBXTFQmx3AD62X7h4PGmsWjgd77rzWtz5xk1YPme6mWkR38nT0c4sFaEQasvLeAyybDcNVU2jEh/KFz8NAx+1pHb0r6sKY/2KBbho7RLUVlfidEcPovSI3VrIRU8vTtlw8PQINh8axsnuOKY3VKOuXEtjqHDoBfakQvjhS3H8ywM9+O5zI/j55hEca88hmSaPylPTKDAk1JdEXNi0pAzLmrV6VC+X8566UX9F3kia3Us8ONLtxvaWtJEp4sy5tUFcPjNMRaeZI/YTx7zGiDtKPOJZys8c9MLTk/RCO9JUdOzrHPlm5YaFCGtHIn/IeHHGKyUNND3sp6IL+7WJBJEQLib8cjB+PKocKwMmBXOjGEpOzeUkmUbjyGc683xYXy/wyqOz+X6dMBkCk4MqLwlO3KTBgsrW1OGUewCSbraJFqzws2BLGrs77t4kOJuYUfzIjKTXoy+8hu/+18NkOhkJVIG+HD77O3fj+guWmyXYbnlt8uSSA0gNnkQ+0kJGHWRSjoIiBgpGAdkaikfnXF1vmcji5DAV8ealLGkTbYAnBrfiKWvXUc/TtIjEfmjW3jQPip0gULQ52vKEUdCbxaqZ5TjQMoTOaIDM7+EgzCKRzGBmcz0FAdtMaZhmnI8KPiivtIjMOPrxvKq6nCc5HKLQ1XfrJOSGhqJUli6sWDgXWQqbQU0TleCjU9OrQlMHKtNKeYenOoBEwpTb0dFLFHzmJWaBbZdOmF5FFcsZhXEXvx4wdHYqZZjIY1PDWJ4zr8ZAtBQ5FW+wL7ZBeuJnjzyLZ187hCR87F/g8nXL8JG33ooCeS+dT+Ol7kG8ROVgXwWxBJGXpVff9MwldqoTJ196DQH+acWfJ+jFXW+6Hg3l5VSIHiq6Nuzep9dEiAPLWLlkCS5cs9SsGpZH501HDV52b1XyQiaFo/LoOtKs33p0waAb779+JbzZXhp8VHQSOlQElucpPnWelzHowpYTBRzryZvttfRa73WXLcZv33EVZjUG0EFchgejxsbrH8zi5Z092HZwBIFQHXxBP7Yfz+N3v30ST5wMoScZIrf5WYMeG+TMN+fmzarAR95xI97z5jeguYGGmo/4keeMV0k8Q/TgaisqEA4GaehJRcgInAyIOenHLEbh1VSUY9WSObj5BhoHVIw9XX005DJUZ/KvXGYbsIPtKdz/XCt2Hk9iENV4fE8ef/H1o3h8RwYn+72IxM3r66gK57FmYQAfuW0lTp8aMC+E61mln4rngsVhLJ2hhR7yCC1thZ9+hUsqmaSBQG+yx4PXTtA7JZIyEudQ0V0xqxyVlAHGmxMBCVJ0hRiNWHp6WoX75GAebSmpM01f5rFi9Rw0NdZjKJFCOZVaUEYxK5KsFU4Bxpl1Bar8V4CJsmJsNsPy+RjwhknrhIn3pwZDIx41Cgjnn/F/GuzgF+rEmoNiomv86wZbH5lfddKD8tGy277vBP7tWz8iw/nNlIcrH8MHbrkUb75svXkWp+dv6XQMqRgZf/A0spGTcGW1ypLWK5nN8Jukonn4bttyvmAXKpAhc7RUCwqy78eXIStVu6PIEPDSArN0kjc7Oa1KaWqFaR7l3hF87KoqLArTPpTl7Qng2MkePPv8LkRjmurRPhNe9EUSHKz6SpbKMYdR0KSklqC/8YoLcOWmteYZpkzVFBXm5q0HcOTISSwoC2Aei9cLLqOMbmjNoAjSXh6Jr74K0zYsZ5NlNcvC9ODH9Ki37zjKEikERM//JhhHr/8m0IvceoYkwbz7wFE89tJ2ROkBiIMaa6rwoTtuQYDeQJbW+97hOF6OxJGmYJJPLp83y37VZ5hMWZTALc9TyZF3tAgqG/Bj9drFFIw1cJvnaxL2EtZjbTVfw6YwH2u35ROm4JnOFZi2yItSljm6ZzLILN9JkEk4srPZX5b3lc5r39HipVIpu9oY9AWMQrr2wtX4/EdvxIfesBCza+jRuOJsYwG7jw7hj/99G9721zvwe984gfZYhVm8oeeJem5VFnLjqouX4VMfvg2f/9QHcOHKZfZdvpxXj3tZDnkuFEB1dRUqqyrNODHG0usAs7E6FVEZPdAPvuVqfO3vP4FPvP/NWLdkPhWUHZd67phy1+D5o1n81feP4z8eakdPvMys1vS6U1i3shzvv7UBf/eRBfiH9y7EVTPpMdFQ0Lt/pgYim8upL2SIWpqNB0tztcejBW0cGxofSq926nHKaJeJuGyiPDk7dSyTgxGkpxk/PNVR25dVEP8ybwDt0STHuV4xIF3Z3KHhIQxGhpmQ6Rl+3eNAxWm69NcNpkjTv6MMORkolYjshPOFiflKQymoXvWKE84P1EmyQ5zggCE+W2Z2/i4GWThOEFp2abUN4+6pHOPiF4OAafS8SIzUPRDDx/787xHNUEC4fYYJb9m0xrzX49WXwnMReikR5OMxZEe6UIjQC4n3IZeJ2kFvVpeJ3A69VUdJGFe3DZpu1cNk4aq26FmX20NrXXPvpIFT1liZJWAEigLjXVmWorJs0A4KJn4UdM4y+JenwFzQkMZvX1UG+lLwUnHq46g7d53Gw89uRypD8cnkEaLYEYsjkU3b/MRbLyub93U04JhIGwHf846bsHhOPdMwjoTuHY7giWe3IDYcw7JABea4vQhKOcvlEL7FQSSmNyss/W7UrFmEymX0AlmGcIzmMviP//o5+klrjVN9d0tBis8oP+Y9n3Goes47OEKaoZSHJurZUt4TLxpcimFcvmJ6B0rvmaA4E88L/nf0dOO+R57D0Y4hw3+pdBofvPMmLGqsoZGVQw+NkFdI2wEOavPysikVRjmks6RcpoCtP3wYhWG7W4g8aS2rv2ztUvjIV+orPUvTHKKe88hgMi9AEwstTvKpi8Vnwo3BrnqVxyCBavmMrVYiw6dpFuejIvMYmtFAY0ZhZV+wVl8xH4WqchnOUdnM4y1oesxnDMNp9T4qgyX42h9egXddMQ1VmoDyuZGhJzqc8NtdiFiumzzno+K5dP1i/OtnPozfe+8duGj5KgTdIdMkrd7VVGBjdSWa6+tRTy+ujOXoab3I68AZfVAadN8EtZIRMhZkCLL+2vIg3vyGjfjnv/gIPvXxd2G6PmNFRZMjnhkvPc1gJbL0Gitq3HjHrYvx8BduxdfvWYCPXl2ODY1JVOX7SN9BGqiafCR9tOmE6CKCsKpSEC86Mk4doz+zb6i0G2koeZFhH2iksyfMrx5DSD7ow8nKrr5ToCRjbk1t2r6TItRG93U0gPQq1rEIrwMe1FR6MYN8FpAxYWosjlWenS+wirFArMbkNyOK40pB/DUWiJd4uRheFxRlqbD8/2EcqNPGgv4EYqze/jj+5B//g6OwnINTxE9hw4qZeN+db0RdOZVeJo58ml5behipSDtSw+3Ix/rp1KRMfuMZFssdC78kONwiBjHHMSjGjgtTw/i7Uk45Wu+FLIUPy10+O4N3bipHrRbO8L5WZr2yeT+eenkHLWReU9jqu2Tt/YNImQf6FiQax6BAAZTDn3/iHRQwlFIUDH4yc09bD17aspvl+rEgWIY6lq09PTR2HSaXcDFDifTzBP2Yvn45gtPqGa8bbrR1D+AH9z2BhHkviHG/UfgNlK8iS8MkYIQaIR7P4MEnN+PlfUeRp3dVyKdxy1UbcfNlFyGZimEgk8SWkRGczqSp2CSKRXmqIZ6oPyQE2559FR7tjME/Cb9yao1r1q3CnPIKsz2U+Ro8DShNSVrFZahvpq3EGwYTKUAVrA5ywPC3OfBHeW3/a9WuWehhM5i/MSjyi4QbSzZJdMkyMlRaZuVjJoJcogupbD+qK6P40G0z8S8fWYw3b6xBg6bQEaBylODNYf3yufjbP3g3/ugDb8XM2jq2hXhTBwVCflRXlWMaPdammkrzCSrtVinhahbG8Pz1gxpq8bbgSAp6ilSmN165Ft/6wp/jjz78VlRQSXi89JPopV54wQx888+uwSduqMa03FGUZYfNu6dBv5Q1jRHKD83EGFKQEKKdHkGUyg3bL7Y2S3OODdM/MlDVN8ytwHgZEQKH7qZfZNGb/rFx5lhEXorOTwUnhzLnzWFataaCc9jTPYSRvA+hYDlqyvU4opjhVwFW66AqnIWNE37dIIr9PwNOp5t+LMYZoEa3isaGs0JRwspaMUHlkbH0fOrfv/szHDrZB302JEdBM3fONPzO3Tdg8YwqWspxejxp5ChwMtE+enSdcCUHUEhG6OXpuZzFzQaVa8OvBEUGOYMzxrhnNIzVXRKU1vycUQAViTw2Mr0ng6uW5vDGZTyHpo4yDB48/fQ+vLRjP4UMLX1vAL3RDAYjem3C1iXqjeJHUDVNNWX404+911i+XglNCszXtuzHlm17UBMuw4JQBapJEy0CMPn1z6BzM7R54W+qReP6pXBReKnMNC3157cQl637mWCMnhNb9JuAcbScEM4Gk6WfLIy1gUKART772k7c/9SrVFwSPsDyBbPwx++5A/kEjYxCEvsjw9gdT5it1hxQGfIIXLk8IodaED3eaugpgejxebF26RKsmTPTGBjagFjPTuUZSElYyltvywjfYt8aD8P0rYJqYDomN4uSFIo9pnMtGNM9TbmPnz43mLFdPJKfjEWje0yn8tMU8HkpyBy99cwQUpoVSUXhz8WxojGBt1xchuY6vTOmrMLZhQ1UYbYAAP/0SURBVCsvWIOlM6fRIIjB6/eiqbYaTfTeGsrCqKSR5DcLK1gm3TtDXbXj1wyGbDoyVJT58ZabLkMwTM+VtJayqw37zQxJKN0Pbz5VxEE0sBnVZrXF0Eu0oDedNfu+amrVUXDOcQw88oqNAcLydCwaKm6Ps0LS5jC5+CN+MlDsD/2Wcpz60u8l3QJBLKYXV1nhx4sHDmN7G/vBJR/4VwfxwlTh1w2kgOwaDZtig89S0RgiJMkUwXaCDZaxVbY6cyJTjaWzaUvLKAXh4uQfX4YGoLHLihahKUn4iWmKjGGsOg1WuQlFZnIEiQPOtITSKFaK0gmqJUNmu++RF/HyruO80hRNkAMohA/ecgWuWDnffkRVL4SnqezSVGzRboZeZKjksrkEmS5JZUemZSWG0qqrGNR2J6g9prVsg4IFHs0UoxUSo4FlOfRW0tJ7k0Hp/bHAeDM4pNS0akxtdptdEDR1of7Th1lrygq4bY0fV86XEqLS1hx/xoVnHt2CtrZu4ueFNxjCiYF+xLJU9irT9IEoL1GpPtBUnweLZtbhvXdcS6HDviQC+VQaj/3kKRzf34aZlXWYV1aDMg5aL29rmszs2K6iTJ+xtykTG1fMR/m8JnqT1iofjsZw32OvYNeRDtLNrozNszGllDD0sp18ZhgHqke8Y0NpOtHb4RPDT2cBTbk6QdOVZMTR4MQLhOPk3M36jIBSCz04fLIdX/juzxGlkClQ6TRR8PzJ+9+GkCtFA6uAUwk7ZTnMYu0CFOFrOpj8mUPqdCcGXzsI0PvWlDXtNCxdvBDNzdOQ0MdCpeAojCXgzLJ91mFewiYIR79fqxd5pqkgEyP8dd+2Q2CGFPOb+tU+/msKTXiYaVuee8w0kqbmyNMsT2lVYpbjw8h8gtJnpeRUPmmuFCFW6UlkKfTTZuMC4afptLyWRTKZdtiP0+rR0nzlDYeC5DH7vpcz1qUQ5Rvp+a4dOjzn0bAAy9E7tVqM4ciHyYJts8IYGBmje6Y8HfU6B+lHt6htKIKhNI1Dr+QGDTWOLbvZAesx8tHpdfUyvUFeVtCY1LSz6inkNd3LIMVHkkiG6JbpWv0UYdSIKMbLIxcFM7YygsXZ5HDaLVoQJ1OMkQMycHnby/rUN+QJfQKpMlSOOfSQL1qxEJ19vfgxja2sLeCcMJF+Dq0MvRhMMcVgR4ANhtVKwrnAKd+20wmmUFuvOfsNgwho+sAcJw/nC5OlF5E0fCTk1FHkWnZQiFZUmAQNUDhrae8YsR2w1zra87G4omXKcwmknQdP4qEXdiFW3D2AUh7vuu4C3HnFCo77OEumoqOl6dK3qSId5vMgBS1KycSQpgBKmC/wkNSmbAnQMRwmAyMUlMRNpULPysLZ8/zqII6S8CkGNdOrg5Y1Z9BUmcTd6124qCmDgHZ3YHwiksVjD7+Ivv5+4kyh4q/Goc4BDjJakXmpNlmVRZozmHee/C5csnEprr9qHb0IIwaR9xbwvXvvQ19HJ5ZX12COv8xs36QW+3LsB3awYXYdWU7e58H8yzeiUF1GLOyzwJOnWvFfDzyLjsE4clTCkn92gYrD8L8c/Rz8S8N/D2hjOSmIAvqGoviHr30PaRpYbgrMEIXX+2+/EbOnVRKfHJVbBs/1DaFdwk1t5viwuKr1FCa9wxh89SDyw1HTJ/Jorrj8Qtx9/TWYUVGJvR1dODWSYN9o424ffBR0Pi36MWWYXjRlyQNX2SqidIyItvYg8c3iGa/3/Oyeq8qiWIeWOmMBRdCZGc4U5KMSvHgYrZu3OSSM12IWNDHeQ4Xho3LzkhfMQhIKZcULnGk8JzivIVm58frkza8KfQND/GV9rNMsz9fWgzIiDB2IsgL70OwVyb7WrkJaBSpeF5p6pqmpSxmkap9oYvKpAAaTxigpZjF0Y7wJyku6cVyOOQ+iJiMFys94ec/qbxtnD6KXx+dDXzyJ54+cxmvtA+S9ClT663Hl6hVYv2webV2N3GJZ/xfAf4uis/CbJYosELkkLjLK3oOncNe7PoFP/sk/oFs7LtCyM0xSTDseFFt6R8ykjidLcGC19kfw3fsfQ3svGVbuBMtZtngmPvL2N/OSdRompUdEry6l78vFuujVDVDQUvkV0khJ0cWpOMhUxrqfAgvB6B0W6yWjhYJ6mK2PZ+rOb5qpVL6UnFmjZ6xbkcE0mW3U51SW1KfwvktCmFtmPSnB0aOteO7ZbbSyaaXT+ksjgH0UnBpc5ttYAqJvv/+n0zxqKty49Y0bsXLZbKajIOLAT6ZTuPfe+82Ltcsa6tGo/Rb5p2eADih/0YCHp7YCS268HCmWpwGtsHX3YfyMitcsukgxgjhYAafc5uf1g0V6LPzGwVZk5JhwptD5l//4Jk71aMGNzwi8yzaux2Vr1ph9Q7N+L57t7sIR8y6VNlTWFx+Yj4JTFM/2DePEk5sRbe82np+X3sGiFUtw87VXoC7kwdzpVVgyqxHbT59AhvwZoJA174xxzJgPjJLfjZUvoWow0689c8Loqx2Ml0rTXbPoxOTjVVHRnQGmfKVXPqZTJyoz0ydTKWXWBfvPlmoUKxlS49OMJfGmqd9UbkDZVabJafrexIzCr8QLrwdYhdoUZ79o+tEBu1WZcFZbJGsUq/ZZReemwpaxoXaZmQMe7V1bhuIt6Gh7Q5XpqGDoYe7pmmesR/S0zyJJUtaprfiKFZtM2rjZKV0nopmXCrK+qhyL5tRgR+spfO35nTg4Qsngq8D8Wc3GU7bg1Px/NogKxdPJkbXMQjKPm4I833A2KE13NkKZ7ikJkwN5xDz3EXT3deP4saN47snn0NVNL4uDo7jO0Ay+s9VmGYvKy5NHLJnBN3/0KHYc7iAaUpRZLJtViS9/6t1w52JkGno2BXoQSX32oxfuZDcFsTYypnfnoqKjsgiVUWFVUslpaTYHtqZhxoEG82hQNcTOKAUfsnkjxvknq4zKegqwlvJY0PSLE+wQKIVSulvFZr04tVqxHDxqKz1QM2A0UDQQ2JYsPYcFTWl85Ao/Gn10U81tL3bvO4Kt2/chlXUZ6zqaz+Hk4AAyrNrQvFib2i4K6HWFOY3TcNfN12P2dG29xJtM19U1iJ/e/whq2V+rqupRQyWn72OZnRkUjJupQHxYYNm0Rsy8aA2VnV1RJko9/OyreHzLIQ5Ir1n15wg7J0wKxalJG9ioEnBwVxAwxWiYDER/My05rkwb7BQ78Z8S7H0tzZeASlLwf/VHD2LXERkObvM8dHZDDW65eDUaq1gPheL+wSg2j4wgQcGj6TK9HqCX7ZkB+UQSp17YDHT1m+eeUppl06oBbSI8OAS3z41gwIWFjXW4ccVqVJeHKWS98FMQ6n0yMwVMumr804YRZxA/BXGKpaVpr+EDCWkTxTtqq6orwK8xwhjpu/EgPlMGN/lE45IJWIbKEfpa2KRedZmdQHSuP5sv7+J40LQaedZD3Jwey+T0bhjT0dvQsnylF37nC0pvut/kKQaej2eJUo4oBuJhQmlfM167ueqbfVbFEISbDqZcjWl/sT7+0wAxNgF/An5KK94Qv2bdOcQptPRFCMPhRg6rDP6ZepVfdRKToueqxx6ig5l+lDzhTRmd5uPQPBply/4Vtylo1aXGt8rMk4Z5875rHuW+ABZW1+Pd5LcrFzXilb07ce/mvTgYyTA9+84gr/LPDlkZnixPIJlkZTHrYH4jZ4qhFFR0afhVYXzpvwawAqV48d8I4k0xhareuGE1PvcXf4qvf/VLWDx/GmW5XWV2LoKZh+mkiJlD9pbj37/3MzyzZS8jKHDZqNrKHP7h0+/A7EovPNkEK0wilx5GLtWLfLwdrkw/+S7KelIU+DmEy/OoqnOhps4PX0BMWRywUxJICFJMEInISAKZ4hL+Ijfr5DcEqmQMJwmH0iBw7rrppa6akcJ7NoUQcieM0krSY33i8ZfQcqrDCDefR4tTUugepjKcALY0qdA81q6YRc/uYvMFcylMDeEtO/bila2vYSaF8ayyMPRSuDrXwUXq1+yawqP2ZtQrB2Wzm0y5+minXlz++vcexc797aSdnm3wjul4W/NvAqTYnFAk1yi+pUF8ZTBxrkvy2cC+18tKJo0fDzzxAh55fhtiVF5SF34K9+s3rcYFS+eQLh4MMekDJ1sQYx9IeIpXNBVlFpPzXvere5Bt6ZH6U4moaKrFuz70NkyfPxuP7TiAw3rp3ksPzufC/OZ6lGnbOi9NLNJ1tMeLuGpKjSga/M3UGyuTDLW6TQaOn7Uwn5BgIpHcCFVlMExs8RvjfaWz41WlmOefxSAHKJNWi5WLikz5eG5fPZAaJa1swQ6WFKBSdGy0hD3T2GfPZxtrZ4KpT3VREfj8lUQraHBW3GQgFNRvk4EV3KSTPFDlp/EnfEVLk1F5SUfDE0ReqdUugQwNgdR83jyjk1JU3IS6VC6DKUN4sE4bVaQ75YjoYL06/huaMJ7tUx47LNh35uVvi5Zkjwwb8VEPDSh9VaUqFMaG+TPwW5esxqYFM/Gz559FZ28vM58faLu5qTb2OBeY/nsdfTgVFGs3LbanBHtmSWbD64Wp8vwqZZ4d1Ll2wUEB5Rywb7hmA9asngmfN8H2yPNih49WO9ZWB6zwsYNZ93/22PN48OnN9GK0agkoD3rwiXfeivnVYZajXR7iyKe09HkQmVg3XJquzA8zZ4r5WRHLslMsDGZOXoPZMuvUVFCM7tMTDGvMWiuIZ4y292w4OzipnJTj6xu7stdTg0mhQhwJV8zncmdw1UIv3rhQH82U9+tDPJHHQw89gf6hiG03hURnNIloWlOhFmxuG/SjBRG3XrcRF66dD30RW891krE8XnhhJ06fbseiqkrUeXL2Hb5iJjsgrfBVCFZXYN6l6+Gvq6AglODMIpvK4N++eR9OtWtfUdFcA70YiiJljDoEU/YY2MFlz1WvQqmw0+nYZUk554SSekvKKwX1uCj24qu78PNHX8BgVCsLNfUOXLluMe6+7hIKxjz602787Hgretg3EqHCzwp2XlDgR053YnjnQfKk5TdNK1934w2Y30BP+tILsXhZE17oaMFzp1rpOXoR8tAYk1AmTSWU/D77DpeuBTqamR0Tq3Y4ULzPOKY27RpTMOovGzcpMI0Zl0VFJ8FrgrmlclWYTWfq0ZH/qscqBYYifoqPRLRZg9IoSEHyaAuw8cXzqUAqtHskjX/49kN404c+gw9+5gu475nXMKxHD8SxtNXnhCJajpIRCAezmpQRhp7FG4ZyRdQ01asX8+1rAkxDhpAYkEdvmmVy2LIsBVSW8o2VNwrKIKvBiRa5inUV0TNH8+6kKmJ9Zjq1KLN2HT6Iv//2D/HY1n0YjKRR5g1iGY2lT956PeoqK0ZJfyaowpJgEC+GUVDm4v3RUAKTRJ0fTCzPIml7ochhIoBl13Mg8UvD1OUZ4k8RJgN1tGXeIhTbQA5hp+c5WLWLRJZx6kClF6OQGZTGtE9sOxY02MSUXgroJ1/ZjS//8CEUvGXQN6Z8yODWK1fhGn2niYLdnUuhkIohm+hHLt5jnsm5s1EaqCk7E1jQMgu3EVBaiqsBJLY0Uw/8NWjqalzHTwA2XArDChqlUyjFXaCjc38MxtGOtx3SmKaPlmUTjL83BppCMYFSXkdblfKJHlQwnjRuXxfEqnrbsgLb3NEZw09//ISZpnUHfMj5g2inZ5rkYJOyKNY6FvgToJfyO+++DXMaalkuPWW2ubW1F8+8uAPeTA5LyysQzOkZg+0lNUieg841uGWBls1sxMxL18FXWUZPW5MiCXQP9uNb//UIOvvlYVuhZ8ogO5jgXJvGGzIxjcYAz6QcGGeQ5B07HuylJsqcYFuudij9hDD6p3y6duKK6XU9IY8t14sjrd34zgOPoXUgBq8vSEFUwLL50/Hxd96CsN+N4Xwaj7e34kBc232Rx9gesj1lmqarC8hEYuh8bit8OZWXJw9SwJJi2sYtSG+7kjS/ac0aXLFiOY4PDuPQ0Ij5kKemQt303HzmXMrHcCsxJs6GTKyIYKxzRRDEnqMSg0mVR76ISSt89E4eDRCTzmYZBTNlxaP6UaUY2oym0YmlmKWZjiqb/UYc5WEq2DzyAq0XojqdiWz7xQ/mMzjx2nTqmSC2llcFTzn++ev3497v/QLHDp/Cli278dVv/gx7DrYQR9Uzef6pQEWqPToaPPgnI8aZUrRjzNwqAunItmiLLfWnLYD/apZpvy1FLTRQbI/yGBLy2vSE0uqexp15Pqhr20tFVJwSTIwWfpkYHq288dBB8OPyjRtx+xuvxsDAIP73Tx/D5t3HqXR9CDKdnuUKF1VjcNPJKBTLUyj2iROEh2pVGJUxxTAObMGmb0xRJaC40jAeFFESVB/5zC0P6GxgG/7/LlgmsW0UJXYdO4lv/ORJJDMUum69++LGJWsW4D23XoKGCqpDenJ6PpdLDiIf70UhYRUd8toGSyskLWGtIBMDaJBNDWY6oTQUmWY84/zPgl0FaoM1C4i3N4VZ1WnctT6EaQGtzJSYzuDYsdN48MGnzBJv7SSjl8n7aA3qpV6b0wJbyEFjg17m/dTvvhNBeorag1CCcfPL27Hj1UOYHihDc1gLU7wURrQ0Ofi13x6v4OXRTNt4PahbvgC1a5YhzzpzuTSy2SRe23cA//HDn6CtdxCJXNYEfR4oyaOeAaWoIewxhyQVpJ6JKaQVeM/s75lKI86QopeYTjIfPVdN1aaTzFsMiQTLSFLB0JnXMRFjWUyXShV4zbSpLDIsK0PFnUnr2uZT+jRDLuM2x0zKhd6hOO596GkcOt1DUzvMcepFZciDz/7e+1FT5sdgNo4XerqwPT6MuAS6PATiG08nzcvFHtbR89p+5Iai5jUPkXzxynn49J9+lF53BD995gXEiEs5DYr1M2bjknkLEfYGzIIEM99AyUGDnkrEKh4zXchgNm8mmOl9GWD6k/BUMB4nPXIKVeHi8L3Jp0VKxfE1EexULfmGdUp4i4Ny7F8ZidpA2RgzTKc6zGhgMXqGJI+W6MIrz8MYgxRkHhqXEuziUSbWO2g207lB+kRfWteQO3TgsBGeBn+2pba6ApXlVDy0YPXO3vmDEotWXpaj8ixNMvriO8t1aGIFNc95lNHlZbw2kVZ6QxP1Ie/bdObH/Gr86F/xThnmMA5snXYmg8CE5o/V2RhKKY1taXGh45JBkjMLllzkvaA3hPnNDbjj+otwx02XYt/xozTAnkZvRMYLDQvR2GZUYWeA2jAJUmcFS6fXmek8wLX9lZ8VfIEqNtBcjh5F5jFQ5fZooBSPYvpSKPahBSft+CQWxrVnLMHEpObdlDPAwfVMmFw5T57YDlx1tgdtPQP45+/+FFv3nSbTBVDwZLGouRJ/8aHbcMGSZiq4KDw5TVkOIzUiJdeBXHqIaWMsyXqPjsXiWJMGDPFIQzGtcGNwlFqRSw0YDEvQ1IA3YPKPx5+5i2e6M3ZuQMw9Crxbcnt8WourA0WxUjx3oJhDhVCQFPSgmv8FehLykiKpAH66y42f7ilgOKvXO/SRkDzu/q3rcOGFa8wD8Eh8BIsaq1GrZ3GmVZafTLnFvpKyeeTpHfja93+BrO4xQSgUxDvf9SbULpqJ7b3DEJVlrevXyW+2ZuRRLc4NxbD/vseRZT9qubamMmX9L5k/C82NdRSqlu7Fmp2qi1e6ZgSDBKd5l5E42fe5zF1bJ/tXwscR/BZUkOVHM1XNoPcQtTDH3Cv2sfllIaNKgwLNpNUqRwYJtj56V1t37udNv+FN3sZH3n4z7njDhRgY7sWekRhe7B/BAPtBcibNQrXMPpHV+3R5jJxoRd/m3ShE4jQGCghXBHH729+M6y7exL7L4kDLKWzbexALFs3DRUuXwkMNW+GnoRD2Gk9XoO3CfvbYS/i7r/6YaLDPSMuP0+v+4G1Xwh/tQ3b/k/AO95hmWTkhwyCNB/cN4G9e7EHEFTaKI+BJYfO/3ora9Ekq5Iyh6XhBpvECjES9+Nuf9OGxA2njeeoVlLtvvACfee8V8A7tBfr3EveEzZfVohw3+tJ+/K+f9+K5IxS6htbADVddhLdff6lpZ2NTAxVUiLg79ZXWOwYGHx6l7Khe8dhTm/Hv3/kpZcEg5s2bgw+880245iLN5OjdMqYpKcKyC38c0Ng3/4pzE1UXdh7rwG9/+u/hpoekV5OuumgWPn1DLeb4upClAWW3tGIO4uFOxZGhofSfLwJfeWYYafFSPo73MP3Hbm5A2K21Bhw9LNcZqeLVRJRGTc6P+zZn8ZUn+pBiPfLiL13WjL+9ai5m0SAH64LegaWH7YmT7u2sK57CsMuHL3Wk8P1OGnHaK5R9fdf7boK3rg5lVbXYMK8ejQF5RCwim8HhE6ewfc8J/NaVF2DWtBqLv+SeoaIFtUVXk9HbYl0EIyNLwIzNUrBpS0k8GRiRW4TSOs0pgxS55yMf/K3PerRduO01/utoE9oTe1FamRNrgslj7zvBAQ0Ek6YY7I+FSe8Vg7keBUWMjxGMY7AJcLZ7Djh4G4+A19r55IePvowntuwlblrt50Z1RRaf/eDtuHTlXDKWTO8o0gl6ckkyYbSHQmKIhCyu+dOAIvdJwem8FANLekdQykor6WARogRKcR8tRXE6LQ0lYKNsahNM24p9WRrPMB7Gx5rnCcWo0rQmqhhvb6ih1hr0e12YURNA93AarYOqjZKZhGjv7sT8hbNQXVkObyCAzoF+NGvzXOYWffRCt8XPFMhfD6bVV6FncBhHT7UqlVmQsHfPQVywfi1yPh8itIbtFIcGEv+IQ1YeIEMhk8XQidOIneygIaKX2vXsSh4C0NMfwfHWThOOne7isQsn23p53oPjp7tNOMFze93D+hXH89ZenGzvZ9p+nGrtQ4uOnX043TWAtu5BtJowRKE4PHp9umsYLR0DONHRgxOs40QbjyxHQWXqeJJxqv9kuw3C51BLBw6daEcby7YbH1ual1PIfOy9b0aKxtQ2KvDnWP4ItVteW2tRMGiaUa92iCzpviF0bt+H7MCIWaUqnpixcgnpEMbcGdNRWxXAzLpqLF00H4+/tg0t3b1YMX8eGvx2n1F1hfpEXtz+46fxMj1DPduTgL9kzVIae3PI8zT0+k7CxaPhLPUjs2qF66FeepunY0hrup7laM/GD96wFIGc3iWTQFSrzE8R2A6mS9CjfeFgHMd66SVIuVOprF4+F1esmQUXjUlXgt6tYxzwj6nogXvx0pE4WgY03jSN6cLCuTOxdslc0+7ysjL4A/L7zw1KI8WhXWEWzGvG7W+6Fm9/6414221Xm/1ZffalTFOuTW1B/WN5uAjFU0VJIemkm8bXQ09Sc4nzeT17ZjUuXVSBGk/U8KzAKlDSJy9vD9h9OodXW8TrMpSyWL0oiAuXliGghUosw+pT/chsZIo082VdONrtwtYjUWRJD42P2Y1VeMO8GlTRSHDRE7azS+QVLYemV1bI5MlXHuyM5LA7wjLcWpRSwIoLZmPhogX44fOb8fShNko+H5pry1FGA2RuUxPmzaglX4YQDtLrNmWOBzshraCDxdMJzh2FcbKvlC0IVn6ZLOeGs6VRv/G++ve8wVZ+PjX/nw0S6Ga6o9gWfS342W378Itnt9LypB3MDocvhw+/5VpcvZ5Wr569ZeKUJEkeE0jFepHL9DMfmZU26FRgrEWGUhD9zrYCyckzMd8vC6bPqJDOBufq13E4FdN6KIx0rR0umsJp3LnGhyU1endQgsiLgd4kHnl4Mz0U0k2CKFCGU0MD5hmF+Jul8KhfndvBUVNdibfecgVWLqaAE+fzRprK7Wf33Y8ABZ2LAzodTyOTSCObSCGbTCGXSLI/4hjpH8JIdz/HMQee2mIqscEsfWdhqs9MKjNOnoisV5OGYL0NtpUC3/yZC96wt02ZhkTmRzTRr+qx50ovT89M6Zh6WRPv6WmRnh8pqFwDphx7YvPaS7MjSbF8Q2PxqduHbcdP4b49h/B05wCG6FWnKbSs2Keip7DMalVxIoHhwy3IUlFqVxlVtXD5Enz4He+BP1yBZ3YewumeKJWiB5Ws7QPXX4dKnxv7Dh2Ai4JcCsf2hvChANXuI+ofliNr3hhBusc/MwtC6WxWvxrrjngTd0NKNka0UFlmglNpi21SKx1eUzDThSa7epvXqk+T0vRk/FSwar+e2Zq+YxFOPpWToddmViWrrcWg1wpUQjGxKnxdIANUuUKkS33YjTK3PkPF9hMPMyWqQFydYHGZAkgM5dOnf/Sqg1b/5rPkA/LI2Hi0NBNfillEMb2/Zq5JT7P7jqlH6l1/mqbV99SlkGx/2JKURqWxGBNjY50eM8CKDL62k0wSU4+hHftMszWMzrGzYxxXK+sr8ZdvvRmbFjZj69EWfOWF3djaFUWMjDe9uh7V1do0jplNucU6iuB47ucLSqs/p3/PStdfEsRm/FfBpQwp0KC11rIoYDukSKcJUHqvNEyEX+6e6iYDjobxaScGMyhlnU5BaENI86f0ZEa66wdP9eEr9z6MYXp18hiyFIA3Xr4G7775WuTSMRqTMVpMMWRTEQrZHgqVbnhzEdZBz0H0M8ASi4Pe0nMMTEeKmXQshlFw0jMYAcNynDA+PYMRzDaMT2m4tSSMgckvekwCipU1qTABZZYiNrZh4j0z0Bln3vnTMxZvAotn2JfJG4IJFpaHJ+/BsUOteGHzLvNMKOALoj9JCzfF+8yrl5dNP7BwFa8FRHpGsGh2I+666Up6dzWmDG/Oj1Z6OrtffgUVhTQSI4NIUainORgV2DFmM+IAPcuy+gp4akJwl3mQDVJsBLR7ho9C08P6vcXgQ0C7arBOreb0UvjosXqQ7aigVKsMelBdHqA3b0NNZZAhhLqaMtTRqm2oKce0Ou1+X405TbW0cGuxYGY95s9sxDziPqe5DjMbKtDAfNVhH6po9ZaHvAiH3AiFPWbfQz9x8weIH5HQNJ3X74aP3oeP+Ba8NB08FGq86Q+WwVNRjV/sOIwD0SyG6bllcrS8SSf9ybNR33vYjhF6qgMHTyJAJ8HPzomnorjm+muwZHo9br/iAqbz4qmtB3CovZvCzMd2luMN69ZgcWMtxaf6WcrGmAHGo5PQt7xj+ckRDToUTwn2jNxAQakvDdgtxCxnMWhAjoNinAmqUeOV6anM6FwYAalW6UaICkLJChxjWtBix4BAtXlGn6/aZ4EMxDNH5ScbUs/vjPAtjrnJwLRtwr3ROB11PSoPdXTC+QJLYHLl0LNTGUBOdVJ0VqBL5ho1btKpOpFD23bJQLL4MN4WVfxxwOYnBW1Z/PN67PSqClKc2StzvDgwdSib+lnomGsF22KTLxajQUlPb3Z5Gd530Sp86rqNWFBRhh/QcP3myycwiAD7TUvSlEeFCY8xkLxwwpkghGwYZYViOF8oLV/ZxpVD/BVKQXR07dj8s4LPXy1JYxo8BnlkKUQEsqpKb5UyyMRCf/NgiepYvlOBIfIkaSwhaCUygSymkZQH7/v0X6FzIG0GqdZF6cvBX/6Te1CRj9KbG6T8lZIbRi7ejUTkNNypPni1moyUtczGsiSoCXZ6wLKRQydH0ZTSbTLQXYP3ZGDqKp4TjDIfBZPTnhoYYzxTZ+mtEjD73BFTpw+N0CnCRFzFRDZKlr61RBUh5WyEIUdYNh/CA1uz+PctWaQ9+uYWBXtVEHe87WqsWboQWSpGV2IYKxsqURWgpWu4SsHSTsJP/ZqlwPzmDx/Fzx/bghyNj4wrg8ppVVh5+QWIhIPm+1g+v9/g7aFQUL9pBV7Q78G0miosrJ2OplAVQghSiVGx6DmYUR6aCrK8Y1/5sApbK3SltNWFardEj0Sd/ixIAFsfSsaRHQ/800Mt0YDx5pke+968CyYByziNH9HHUFnpTLzS6a6lvY0hkKaiwsBwDHvpwe3cdRDDfUPGYyuwXeFZtcjNLEOWClJ/ZlKO3ZVjG1xDCZx8/BUUhqLGgMi5spixcC7Ky+rx1x9/LyqocPtjSTz12nYcOnEKl2xchwuWzkMl2xEiNbXsQ36T6CL+096X9/3iOXzxW/dz8FOgkWyffN/t+MAtl8Eb60P+4DNwDXazTbbv5MUn0mncv68X/7ilC4MFv1az0DPK4JV/vQ3VqeM0FmlEmnZbxWSB9bGMgXgAf/GDDjx1II08Pbkg8f39996ED123EBjcinzffipSS3997ofOBw515/D5B/uw4zSJILyRwdWb1uB333Ubsukk6usbaGDoUz+GugTS2dRvYSJ//zpBfCUu0nZth9sH8JYP/RGVULnp58sumoPP3jkTc70dlCd2T0vzqIPt02rubNaFf38+ha89TQObvYJ8HB+4qQ4fY5CHqelMDX1RntWY81SMhnjGjUd3u/H5BzqRMbsJ5bFp6TT8zVXzMCc5yERxxkl9puCmW5ZvSyEXTSOS9+KrnUl8hyHhD6HgK+DqWy7E+++8jXxeQEg8QgMszfP2oWF8//HdKHi8+PStF2CaXy+ii+etQezA2Whrn0mOBye9I4fOBYbtSmC0iwnOPZVpi7U3ZQ6Yk8nACBAKifOr/v8eKJKVHRbGn/3TF9E1QM9AUwWk2NK50/Dp97wZ4YK8hRhDkkoujlwiQsbshzszxJxpyiUO8PPsmLOBFXQlPfV/MKi5ps0MdlqFQkZyhqFAZeF1xXDTai+unktPjLcLbj9GYi489sR29Az0m1GZdvlwdHAYEQpGC2o7CygBD2l7xw2XYun8JuQ9qo8ey8AwWg+fhJ9KVRxppqmYVXvuCQ1tOlwWClO4BDHCsgcTMYxk4khQ6Kc8tPalyCg3PH6qCCoON4OHnpTbx9J4rq3jhLS2R9K0rJ4TaQpNjZPQ0qYBVr1oayw3lTqQzrmQoi2YzLBdjMjwmKFrks3yyKBjmtfJdI4eVgbxNAOP0RQFTCKFoVgcvRRSHbEo2mMjOE1vtVOzB3UBTFs3D7PWzUd1YyW8zBc50o7MyR6eW26R5S5jzUOp37nrALLDEcZS4BDVxcsX409+/7exeMkMfOfBh3G8vYveqR+3Xr4Bt127CQf27cVPHnmMgtV+Q9DxiuTFGSVsKhBxrSrmiTFmtG8iCWIUuREuSsP0yqepRAkX46GLP4Sf+o5gvTzDNgwSOUUvpHgtkPyzu7+Q3vQm/L6AwUkGnRS7AxKpLgr8JA2gZMp6SuaZNwuLRKKmXGNoFNs0FoTw6wOL4+sINpPJq0VQOtV2agYfdph4VlPxorGmeiVbzfgxeZVPy/q1apiGl96lE2k4zjQrYTanlrgW9xdpaKw0AdsnBaKVsyzNBFEtZ6Yji+22ZCYIF9KrtA91bo52+ZumT+UtP7H7ID7//efwi21HMZxIY1ZlJf7wjitw29rZ6O7vMlWVUtUql9KY8wOHfr9J8Nzzwbs/6/EEVZv+S2AMYaJvr5RAaUrb4sQVgw5TgdG255HubGCmE0wZGkzEa1ywA8zUY5KM1eIQ01rzBfNC7Nd/9DB+8dJ23tQy7oJ5KfxP3vcWXLyoGZ6sXnxOUZAmzIdUc7FO5BPtxruze1wKjxJCjFZl48ZqJpQkEyVLcRYHyliV9TeRKOPppb8xRranumHvWIFRvDcOhOtY0LMYh0YSSs7wUS7zfk8xyAOxiNtgU1iQ6LdDSfesEHHS69P/S2fUYNeJNPrzAWRpoQ/H00gko1hCC1NZKBPNT20gQLVBPKiBjEdVrILD1uzS0VhTjSdf2Gw8LUYiGU2YVYTh2iqzK4qqlCft44APkn4+0kBCIpaOoyMyiJNDvTgy2IkD/e3Y39eOPb1t2NV7Gju6T2Fb50lsbT+OzW1H8UrrMWxuP4kt7afwSkcLXu5sweaOU9ja1co8nczTgX39Pdjd14Xd/d3Y0dOO7d2tPHZiB+/tGejB3t4eHOhjGOjFwcE+HB7uxdHIAI4M9+PISL85P8zjkeEB3u/BoeE+c9S947o/2IvjQ31oJ96DVNBpL5mi0odQfSXiVISpgSHkB0eo0APw11aa6U0t6BncdxyDOw5LRtr+IEF/7+MfwvzaWqxeNA8dw0P4+bMvwF8WxvSGWkyrqsOmDWvgopKd21ANT56ehPqPecVB7H3zTGnvoePYuvMQ+0XPg4CL1i3D6mVzqN1p/PUchzvJo2Ui5qXpR4PwcF8cmztT9BE9hoeCITfuuW4p/NlBCld5ZKqBocjY9vmbh7zhxjO7h3CsT/iHEKIBcvnGxVg1J2AXoyT7VQ3xYF00qDReDrWm8ezBBA0arS3lH8uvrSzH1ZdeYHAJhkLmOZ/xOk1glfbnnODIitcHQpAek4wB5tVL2H4d3UF8/Qc/pSEVMm0o9/tx2ZrpmFGRhT+j/UupqJnOqDAxNGny3IEYtnfoKxN6GpfGRctrsHFBmOccOBrnBj+m5anol00lqaNyaO3L48WDNMypQHOUUfU1Qbxhfi0qtfG8Zuek4FiHV29CjbBeLUahAn4tksHOSBZZ7QnMfHodZcH8WZg9rd4sDnvwiS0YiKYwb3YTash/M6orMa0ixLaxvQ5ppwIqYK1ANsr4POl/LlDPlAaLg/7GYKLCFedNCkqYNRLp/w3QYBxTdh68vPsw7n/mFTJmiHc5KDm43nbD5bhIn90hc8lqRJ7ufTaGfFqLT3rYV0nxGGnDLpOVWEpa0qv0+ry7lEygHdhfR47/w6CoKo2FSU/H50JVZRTv2eTDrFAKPg4kjgds33II217dbVa2uV0hDCQLGEhkOLAkSMWuYyCmVMz61Stxx03XUtHJAqWnlEqh50QrUiPDyNCid2ddZif/MD0y2ihmeiyTSVFwJpHg4I+mYohQwQ7FoxiIj6A/NoTeyDD6oyMYpvKIJunx0ftL0mNKyNsaDWlzjPLYx7w99LY65W0x9AwPoj8ywjLjxmscSsTRx2uTJh5hGEFHfBjt0SG0RYbM0Qm615kYQW8mgb5sEkMFemp51kO8E4UcUhR6miLSBJM+MVNF5VTWUI55F69A/ZJZFEw5JFq6QcsB2oYr2dqL7i37zCscvqzHeLRzFizCoZZ+RKgN9Cmkmy9aize/4XJs270XD7y4FT3pYfJzGhcsm0+WJY+T7Qzn6UgedowXRcjyd7ha/O6IFnOtc40FE2fv63UMZ9Ni8bVxiCWQyQM2VSmYzMYzJerI8EKqsOhg6Ix/Gof02qTgiKsm5GJJD546mMX3t9ELjqguy3/imhH21bG2FlO9+NHi+ZsGtcwGyRW9JKLvyQ2mXXjo5b340y99g/f8ao6h78HDLfj0vzyLLz3Yi5PxMuIZhJeum0rQ/p3CW89ITZmiHY9mbKmdLHd0IYttpD1n4YYCphD1l+ST+kmBZTjJCCpaU+iKcqLN80D9mXqVnneIk8cVwE1XrMcnP/pmuCijvvvYy3itswdp8p5PllUxfUnxZ4Ce50sJO+iOovzfDKLPpCDho8HknE8URv+3gIO7M5UgK+l41xC+ft8TGIlpIGkqxIWLVi3Cu265HHQY2HWMl3VGQZRNjSATazPKTq8SCJyFJepo/Zk4HU3HW7BMc26YSNVfhc7/E/2k6uwu7HrGI8amBefJYP28JG5fW0CZO0pBTCvS5cWD97+AttZO02hZnS0jUURoTMnLNn9F/O2XDsh/LOtDb38zli1eYOipFWsjveyP/n5alX7U1XlQGfJRybFuClq7Uz77jQJXQtp8nTlHYa3+KgYzFaaHPIrX/KPeC9SRSkTn+kCpucfgYrxJLyFl0mVZhsSCVQBmqk/KQHyg/pYyMEc1kY0sHm37eK6yFFcMyqNpLAm2LCOot6GXkjXVVxYIoSYYQkM4jPrGGsy/eDWqFs5CpH8Iqa5B+CIptL24Hb60VQSeUAHX33Ap3vfuu/Hq0SH8449fxZEhKkRfAetpnb/z5qsQoyL+xvcehCdp39+yKsuCzsbaYUNpnN2B37TC9LU63vqAWg5js6h/dNQ9JdUUsD73Y6boTN4xUPtpZXI8usz7ZtrYWeWp56X8tIF6QePNlaVxRCOHZb94Mo0Pf+cYPvPjbrx80o2E2QdVhfGfZXT0DOHvv/wjfP1HT+F09+Do+5hm1aMpnwll/v+S4Iwttd8G0WIs6GW+vK8MT207jHs+/Xf4k7/7Op59dg+jK5hLMxCkFPMda4vgX+7bj7f9zRZ848UY4t5K6D07D/EjJxueVXGqzfSRyi8xIMxjA/2bYFpleYxlm141So74KSi7UjBO6Szd+aNOK4LZAFvxBmx9HAkcA8SGuMyrqcBd167EprVz8cPN2/FIRx9OaBW6+EDpVLDODA7jg+6bFblnxP/3gjV7NJLNSQmQsUQqQ5gJoIY5QWCIWQxng/NNVwqiycQlvWOE0lHEdsLZQPk8iKfy+NEvnseBk90cUCEyVxiLZlfhk++4ETOrwvDQwjbvhkhIJmPIRLqR1pfCOdAt7hTMsqB47uytKYvFPJAtCWqinh9pFw9l1EdCtXO3zoWpsyO/oT2Vqg2WMKMMYeorRjM4Qkfh7KD+tMFU4ZTHILxHg+7pxOBg2+SE0jwKpWVKECnoZW1Nu6ggPU8wCyOIqKY0QvTmrlmSxs2LcwggadPnA/jZ/U8hmaFn7PEhTkq0DkcokHI806AsCayJQx5BXx6/84E7EA7pmQ31EQX78Z2Hke7sR3kyhRA9L28qDTe9FDe9OU+WXmJG3p6CdgphH+hIpeWh5NO54s0OLArsZzMXxmAUIO+Zb23pywcMeSk3lcV2GQ4TCYqKUjuzmN1Z1HVGmObM+2QK2gEjy5CmF5omftoZJcuytVOIdoeXIpWClTL1sjwfcfMqsGg/DUzxhhbMaP/JIDukotyHaYvnGI+5bc9hHLjvSeSp9EUU8ce8+TNx5SUbcdGCWfjEXRcjGYjjcz95As8cbKe36EFVsAK3X3Yp3rp+KYJ5edpsjzrFNoi/xEl9xHayJVawmnsKiisqCsbryCpHecOk0q4veplbys7cLSAQyJkNoqWEbIwFoyhVjmE21kmFpWAorDJ58Hn1IeAUvfAcPTgv7vnWIN79tQ68fKoSQ+kwAlTg8xpdWDA9gFBAGYL0iMroZefw0rZd+Min/hZ//s9fx9YDxzAQjbEuLeKwuOtbiaPInAfYdjKP2s2D+SoIx7NWHIv4LvZTfzSOh7ftxzs/+U/4+F/8O3YdHyDXlyPnp4yp8GLuvErcfNVSvOGChahlX2rKvmuggH/44SH81ue34ed7M+hDLdL+SjOFqA+uWo9aQIXu1le9rbyx49XcYPePnWv0iaB6l1UGfcDjp4GptkqRmd4zfaz+Uh+J/ALFG29RaRmClSEzjd4SiZrXWbJZL4KFANZPn46PXX0RDu07hOPteofYyhOzep1HJ5wLSE4jy38doOrOLQ9Z5/ZX7i/4OQhM7Q7FCKWrY0ScqcAI4V8zGFQMiPjF0yJYJ/3sYAWzPWo6wZxzwFHc4bFXduNL3/056EywT70UKgn86598ENdcsISCMkohmKQASnDgDiEyeAK5wSMUdP1kTCkmddAYXUpxsYKgCKZ6q+TkCVDOmAFiPIribQdHI2sEzGyEi/IUO+5sHWgUVBGMMiyeC+wnlaYAIeJAaSZB6b2JoAE2CqXpxOwWZzOYiul0nqcmPNoVxhde8mN3n4dWe5oDL41LNy3HrTe/wQhzKZrmcgrqulqWpDJMdgNCTxSLU4h+83uP4qePP0960cxggz1BL8ortfO1vG+qSfN8gUKVQkdeglZlFrSohHEqSR/qFDMZuhfbrf6QMjKLGVivLGETr7aYM2FUhFF5UsxMsAJDfcjeZ7RJWzwxtOBR3pmxaBm0rZWMAn3J2wglFcU0Omh1pdU7el3CUtjDPjYbEAhP8lF0aAQDfTS6SA8fy5cVz0IRKvfgHe+6GTW1zVgybTZmT6tDW3QEP976Gg6e7MHVa1fiquUL4Y6NYFpQq1BZuAFhTDxVDkFjRThoIcJPH34eX/zGz+DxB80inQ/edRN+57duhlfb3u19Gp4huzOKhKgWhIyMDOCne0fw5b3DGCGt9THd+TODeP7Pb4V3+BhSyagp2wpjgXqWhgHLaB/248/v7cJzR3jPQ8VVnsc9v7URoUwPnntpH46dTpIHvMixbzOFBGY3efDOa+fixuXVFOZBHOkEXjicxgObDyGeZh0yXOTZU6HrGd3C+XNxxcZVuPnqTairovdExKW61QDb9vFyRnEOTXRv9JdxxlgtgvaDHKQS/eFDT+HZV/bj4IleeuV+8qB2VWJTPPSml83A2964GhcsqsHcmgDifaewbdtxfOvBXdh5aAgyoWQqlJX5sWJBHa7dOB27W3rx0LYIecENbz6Bj92xBPdcXwt/doh4y0AwfhsxYKChlBgZNkbai0dD+MPvdyHhDZsvr1+9fCb++rImzEoNwB1PUi+Tx2TID6ZQ6CahEhmMUKF+oTOO7+rZqi+MXLiAt95zCzasXYXDp3uwt3OQ47MW1yyejZkcp16WO5zMoorjaka5+Jj0sKQchVGZRhCeJaNoHDhjXWPllwXldEZrKUws07X9ZSq60P9Zis6iz4EnwT8BzlfROcFRdNo54UDbEP78i9/FqbYBCpEyJszhzls24vMfupOKLULFlKCyS1DPjSCVaEe0/wCFQytrzLIsvcwpoWVx06+xQIswTtHpjIQ2ipE01eu9Rv6dRdGZa0NoskWxk87GAL+0ojsb/X4FReeAmeLTkbib1YlZP57a68N/bM2ju0ChmUuiqsyHm268GBvWrzMP7WPpGNY3N9DrkNWqsknLIv+pVu30cPjwafzVv34f7YMRQzNj2fKuJ6dtjYSF6MZTG23pLatRik5p2X+isaxkpVUiYm7SOfSTUDS9yPTOoicJcVug7jBnsa36Nf1jrlWOjg4OSql6Sr0ZW6Z42pTEc1OSKZcHenjiIaU2K1blYZJvlNPkUToylNpkUKMbmaUiz9HDu/XGTbjz+svxiy2H6BF6cZcEemUFPTngJ1R2j+zswBXrFuGtyxsx3S+rSzUKLGYGddYmHldzUvRipei+9M2fUu+wz1jv+956Ez7+ztvgjVHR7XsKnuHeIk+QPqTR0HAf7tvejy/vjyFG5VigTl++sApP/NG1THvCKDq1xi5aEmgky8vN4nSfD3/5s2E8f5RFaTGHO2GEuhRJTmOOGaU0wvRSb7i0Ch+6cRaavTQkaaR4qVTc/jLSogbHByrwjz/aje0nB5HMsD3kDY8+RksloI/xVpf78Y633IQbSZ+q8qBhDdMPJhTRIthry+M8M1Qy98kopo94TzPdTzy3DV/42r3oHUmiECpD3ldB+rFcduCMBg/ef+d63EUvLphJE48UsuRzT0KL2gaQygRx3zOn8O3796Evzr6En8pJe2qyfOImXa2X8v05Krq3LsdHbqiHN9Vn+MAaDJZXNN2ZigybVyp2tlbjnq+fRNJbTh3pxrWr5uAvNlHBpqkI41T6pEe+QJoMOIouTUXnxRe7E/jPjhQSvnJkqOju/vCNuHrDSgTpjfZEkxy/LWjvSeLm9ctw2awwwp40qtQvhoDEgwQq0f/nregc0KrUXxaU046g8WDGZgl47vnA3Z/1+PS+ielJGysYHf32ciqYeNuM+2I4R9YiiHEkAByGGwuTgch2LtCAVe1G0JApFfRw+B+++WPsPdzKW7T2Wd/KBU345z98H1ksTWtHjJCmg5BAKt6P+NBxpAePU/nRAnJwYufyp4iDGsjeNXRiKCGXEwQitzOPXhrvtM8qS4ur0hrBMVqmYiYP5iG/c14MY/fPBg4GgtI8DAZBHXUtGEtrYsx9/ZeWQbBNsPHkci3LN6jzUtbztGpZvjkcMbKRlnkiiVgkguaZDaisqYSflmT/8DCqK7W5MK1EMpFqcJhVyqksFKQBmsOhYyfNlKPFyE6jiuesjctAulolxTIY9MxL/Ub1wUDBYHBVpFAlLua1AfGLduJQWRqxSiQTRaAj2+PEqf+dUKzPJtSPrVM8YoIUrbbz4rny6Y8ZTInOakCjENkUnemL9FqSIWFU0CbC7oxZPZdTfuaS8MqyAWpTlkVJoF5y8XJ8+I4bUBYsR4raZfPRE+jp78SiOXNQRYUzv6kJ5SxrQSiL5Y3VY107KVguypLeB4+0YOtOGnpe9gfJs2b5Yly8ejXcaXoavSd5jCm5oYHomU0OYk/rIDb3s0/MKm4PmqeF8fZL5qKQHjQvc6tyPfvW+1n6soiMma4+4KGtA3jxSAojtFncvhzv6VUVtpkGW3kggXULA3jr5dX4g1ub8ZalAVSlaJSm6KFQGzjPY72kXUNZHm/cuBBrF86gPAHLpsLLknKekNmZJ+Xx49Vd+/Hki6/hFD0VbX1YV1uFIL1ivRtq+5X9YejNv2Jf6ije8XrdVJgu/OKJl/HP//4D3Pvwc4jkqaCk5MifHpazYn4tPnDTCvzR2y/CpsXVVGxDcGmjiUg3wymzNy4pTKM5hVULa/GGC2abL+4PRBJUeFRAXspidzmNmiDxZv1siDYJiHHMhFlPbdhDbtQskQwFLRghX+jbmKTncNqLn77STx6h8mf8/OZaXD4riGo9KhD9tfKSNHcneIywDHqDesFka6yAHcPEinTSLMiqVfOxdO5MhF0+0AnF2pm1WNxYjhNd3Wjti9FIqER9WN6cur5oqCmIH4Ty2Gg0ac4FE3TSrw+EDLEhklbR6UHoRFAfnw+ckawk4vyKsKkcwX8uOBvpVIYth8xdZFCzya4viL/66vfx/NZDvJbllEV9pQ9f/cvfxawKP62tKHVWnIwQQyYxSAupHbH+E2TKCHwSKGQ28z6hRk8plEiN8V9gZ3xJ503WNKe9TnvG2l+S8SwMUFqmTksuTVlTB0sXhTMrGFdKMZwJzF08s2DLsvHGgybnmjoMGTRVl8eyWTXYeXAYfVpfwBtDQ4OkVBozZk5HkJ6cphb7B4eoFCvImhw8HJCOopPzKiEye/Z0JNMpnDhxEulElPcz5qXsfJ4eNxNph3ktvihQQbi8FEx6J44ejKZx8vQA9C5dXrxOfEJVfpRXhalIWA8FWGVVEP4aKr0Q+5hJ/OVhlNeHUTa9HBV11aibVo/GmXWo5oAPlJMXKJDpdlCAFliOH5V1QdTyXnVDGTyhPNO4EWY8dTh8FMDucA6+Sg+q6kOom16BqkaWXav6gKqGMIMXNdP9qJ1XjibWNWN+M5asWowFS+eheU4TgpV+CtUUamY0Y+GquZg2s4pW9wp87M6bEfbSH6BQnNZQhQTR336yBftOHMdFVEw+0np+XRjz6tgoQ08rxCcD04380XO2wyda8doujhcPxw8V9vrli3DRmpVwZaJUdC30prTFtvhIRgD7ITaInacT2D5A1c3xJj6b1VyOuy6eSaU4jFxxX0djHHKsZClkN1O5fe4nbXj0cIGGaBl1I4Un8dUuOT4qg/XzAvjLdy7D+6+oxAXTU6guDMDsYq2pZhUlhCXoKdC0xVYhm0QgM4BZNTlctWYG7njjZaguK8fBox1IuQLIBaQAvEgm0zh0ug8vbzuGl7fuQ1V1OWY2N5h22oLZv1R8Kl4+HIlA3gnhiWe34Z7f/xwe3bwXHdTK7kAVO5fek89HHgD+7J434o/uugQXL6qjgkjBnRlBPtqF/OAJuEe6zfNcl9u+xK6FViHyf3UoRsUcwnUb2a8zqtAdKVDhkSeJp2hIyw993SPYsqcdD7x0CllXOVYva6Cy04Ii9aT+9DK+VglX4t7nuundsg7Gzp1WjStnk7dovLsyVD7ynGgkmk2dtZcXDcdkwUNFl8eeOI0o5fO5MGfVLMyfP4NF+BFiX9JsQU3Ii0XNLCscxsMv7cWGeY12ClwsNQGsuXT+YOVHkfa/ViiWq3/79YJKno2vyHoM5wHFZE5uo0SLcK4ixqrUgCmengPONnU5KnBHhTnTkmHue+wF/PP3fkGLWAwA1Ff58Gcf/S3ceBHdczFMloOWA1eLTuIjbYj1HaeiO0nhkUM4oJc4PbTm9IzHWi+jYKx/AiO1TdFYrxOPcYTgv6JKTBcHV9k+Al2P2UYWxrnfJaeC0f5RO3UsuX92RpP3QrzVltJk5tziYsDgP3Y9DvfStjFNsSkEKro81ZQGFNMoh/litFpJb+NYTz3+9Cc96E2ZCRd2TQY333YtLti4njSmBZtNobFMz+tqDG6a5hJ9zFHtNSh5kNA+l7RQOXaxt7UTHcMJeobVRmH66KEV6OkksjmcbOvExkXzUR3US95Z0FfHv/78GSxcuQaXLqDHw7I6YzFsOd2ON6xZi+k+CowcvYxIDPsoCFdTwUyvoHBkPceGknjywBFsWDobM8J+8g15qyiw5YXqXSF5lzrqr2NogPLRjwYqTMoOdA8N0SIexKKZzagsDxIf9YELr+07jH2HT+CKDWuwoLkRwYDLvAj9xI5jaB/O4JYrNmAFFWGhEMf+7giePtaDa9fMxcIKF57ZdRhtgy7cvHIeVtbSG6bCjrP+J3cdxDPb92DGrNn4rauvQBM9AilDu2jAznbYYIjMowXDgxwzetXip794Dl///kM0Ev3sJxfee+dN+Ng73gZXtAP5A0/CN6JVyMwkT6iQQKTnKL69NYpvHafXQ+9JMyaXXjgd9350PVwjJ5GKRkzZcTofe04O4cFtvXh0VxRxVNL4kLISRtrHkTjSMNHzyTAF+PJGH25YW40LFpEvaugJEUdHAlhvmv3NPtdWftRi+mcJahs5xxdAPtCEgdx0/Pylk6RLF450jiCqeUem8ZBX3eQjmr5Yt3oubrz2AqxbsgANVdRaSsHCeocj2Lz7IH70k0exa/8JFIJVcAUpC8hr5eFyLJ/djJsvW4bbrluDKjc9pxQ9OMqRfKLT7KSE5IhZYEStSNYNs0zW7dXMURLZ6DCyqSjaBwp45WgSD+1OY18PVby/irJKe/qQt9SOxAhlVNLoeL3itKK5Gm+/YTauWV2JGRVUWqyzkInjaH8NbvrLHcgEG4xyvnrtPPzV5fWYFemBm8pdi7HMdO5ACrnuJAqMG2YNX+zO4rs9RNVbjkwgh5vedxmuv3gDHnv2IIazHiyfU40LF9ahqcxHWnnhz9GIo0ca8JMOk4A8cUe+TQZmbE+4rbhx8u48QTkmSGUDtiwxAwP/Pfd88K7PetzS2TbCKgieTJJ5IoxDzDAd/xml3Apng/FTlcXI8wDHA5oMnPKsN6c2urHzWBs+/x8/pnvvNdchfw4fvP1K3H71RrDfOB6SZLo4cqk4ktFuxAdOIDLQRhmWpJdBA4dKTp9ROcObExhlwQarzaxvrD3C8eyEsGmEoy50bY+lUFrehFsEm8GWwzBagNKW9MsZoHZYq750mk+hROYRnPIsOPgKxs4E8t6KpwSJIQmI0vwmjoU3cFBWhyqw4/iAeV7DMYy2tlbMnjsH9TU1VMEexHJp80WEEK1kgxvL1wvNlsa8pjWvlYh6GVhpptVWG6XRHUujrLKWfUrPjELCQ+VzYiCGrQdOYva0BjRROZVToC5ZtAj3v9pOD8KPBU2VtLz96EkDzx05hTXN9Qhm9RzDjRcPdKClM0orthFl8vpY5v6BnBn4+j6eNjBjMv76sOtUNw60DSPjo1dCfrHP29yM68VIIoeGsjIEKIjbKGCef/UgmppnoFwKhIK2obYSbR0DeHXLMWxYsxyVfhfK6d1WVDVh67E4trV0Yc2yJtTRI62nNT2UdeGFI31oqKOXM7cJyWAQPz7UQ8s8hzk1ZQiTzjMb61BRWYOfP7oFb1i9mIqZXlmOdFQ/GLbUKBLvmM4ZBUNf/qfTOeyiAt5z8CTlpZ3JWL9yMTauWkbPgEZh7wl40jFbhgwnjqEkhen29iw9OornotKZS6/ztgtncHwNYWAojScPRvDFR9rw3Wd72S7ali4qOQr+xpoC7r68Eptm0UAZ1ruPSeIhn66A7miedIji5cMJ7O9xkS51mFYVAB13Icwgxc2WEU/xi22COE4KmCXkEgjlR3DBgkpcu3YOli6chc6+GPqGNU1ML5f5csS1tbOH3t1OvLR5Ozp6h1HZ1Ij7H3kaX/nWfXjgsc3oZN+5A9VAgPxFnrlgzWz8wbuuxYfefCkuXj4L/kIa7hiNgN7dKAwdRoGKzpXTphOktVuGkEzMLEMCuaEupPo70D8YwSN7c/jikwk8sNeNlqi8ThoJ5H9fIE1l04SP3TIfixr96OyI0GMjv5HXBwcSeG1PJ7bsJ10T5WieNg2VoSD6khX43hMtyOl1BhoKsxtqcc3cctRkiAcVulbZms0B4jTK5dFpIQvptDlewO6EXvOgyvcCy0Wn5masW9CM+uoADrT0YQt5rLK6Ck3l9PLYVj/HkpFLIvgEMPw1SbwDkplnu38ucGSmExw8SsscO7fxVtEVd0ZxMlkYJ/XOCU4+J/e5oBSp1wMaolOByjR/UqLswEQyj7/78o/Q3p0wz2PUxmsuXorfufN6NFVpNxQyOy2hgvayTPYhOdRCRdeORIRWX4JcxUEkj07bS9l3QUwRY1CqGYrn52uVOO03nUawuI/Fny+UpjeWDf+NV6HySoLelbHl0zuiIDYPu6n4TWQRSptjb4zHZbQ8/fHowNi57hQNAjZM0ZYcZH09G6BH1VTpQyThxsm+jPH0MrksTrW2YuXyRQiHQ+ajqAlanZWhkPGEtLWYNnc2uOi/WL+pi+cB9ks9BXyGgr5lMGp2iy/3UFAwy/TGSnTRk3hx7ynMqGtAQ9iN2qAbs6ZXYcupYYTobc0KF7CotoxKqQ2JlBtzKqsQZv66ujK8cqQLPn8YS+orEXJnjGd4ejCOCgq6RgojNdWdY0UFqj16YcO0/n00Gn2alvK70VgZRPtQnPLEi5lV5Zg/rQozptfg2VcPo5FCiM6imf6ZP286TnV147X9p7Bu8WLzFfF6Kubp9OS2HmjB8fZ+rJs3G9VU8LOqfBiIJbGnI4uF1TW4sM6PplrghWOnMUgFoV0ryrwhzK1vxMYF07Gsqc48y1JfWLo5ICPHHEbB7E5D7a3tzPYfOom9B04wnxpZwPrlC3DR2pX0HqIoUNF5OW6MASNtn+o3+y2+1pXDjn4qOgpMFTutKYxN6xbi2W09+PNv78e9z/TgWK8+y0PDkZqqmY7H266dgT9481xcv9CDyxZ4qBgbML8miK7uXiS13ZksIiI6kvDhcEcej+8cwr6OHLzhCo5Ljk3SWgap2qKvMBiG4zltKJ7qhHyX16snI+SLESyod+Ntb1iHlVR4ra3diNIApphgfm0sTQ8uEseWHQfxg5/cj1f3HCWt2R4pDvKBm/0+d1YV/uCD1+HT774aK2ZWI+xLAYlTyHRsoQGwjdq7yyh+IWF2lRFNXcSB/J8lneLdbejpHcF+tuFfnozhmy9l0BqhJ6VXncwUegFv2FSPf/zgcty9NoQlNRlctCiES1dPp7Lrw8Cwdj4pIEu+6xnJ4+X9nfjZsydwOlaOqqa5eOCFg8hrvpxNn9NYgxuW1KAqMmh4QC+mi0SuJIkaZ6AcSLJ/X4pksD+pyVAZNTl6twuwcPZc+DkAG8u9WDuvgeMpj+d3t8JXUYdQmQfV5H890pkMjJ17FiiVHQ4Y/jTx58gsOI8kY2DlxFkUnUDnk4UzYTRfSbLJU1qYrLEOGNlYAqUpJ1N0BnX+WMFNW44hXfDhGz99Ci/uOkpBow5xY3ZzFX733Tdj5fwZ7FIqskwUeQ7cdLwf6eE2pKPtSMaGMTCYQc9AWpMGtGhowfk4oMlcRhOY6oUhFQaZd7ReDXjdZJyd0jwTz1Jw2m+EDcG5tlXYv8no4ARiZOsujTNtd3JaJjT0YpyeMRqLl3EyBMyDbvs/Gqx3xxNz7cROAk60Sa+UJWmde6KDwGhPUZICicFPz6SOFvmp3iz6YsSDAiYVT6G1/TRWrl9h9p7M6KMQxFwfBNWqzAL7T+/r8axYvFOJpYNCY3kZlaMXRylERtgXNRX04EiPOQ1VoKrBg68dpUVag+aaclQwXRW9suN9KdTTrZe3NK+5FltOd8FNBVtHgVanLxhUh/HEztOYM30aGkMUQlRAWijSmXajOhBAmEJBHo0v6MLKmbVoripDV3+MFrUfAaJYRq+yjhZw1wgNLeFUHqSyDaKxsQp7DrXQM6igUqO1TxLNnduI3lgcB0/2YcmsGVS2BdSX+9BEfJ/cfgJtI1Esnl3PeoEZNWG0R2jVd8Uwo7YO88sCmFdbgeNdAzjYO4haKrtKGnbTq+ix6PULMVmR0dQrCmP2mASxQ09NKXNY0ODffeAYFd1xEph8xP8Nq5dg/aoVQHIYhe6D8NJTUtu1sESKTosltrTTExyUAqVRyQoikSSeefk0/uuRg+iL6rmd3uvKYv3SStzzppn4nVtm4rolVNT+GLxUWOJJnzeH+U0FXLmsGksaw3qDjMI9hbQWqmhBkduHlogbLxyNGo+3pS9LOrLPyphXz2iJlfhfvGLaxjNiY44F0UJb+yU7ML82h1svXYglzVSYVJS9A3HEMwWkmE1euTtYAVewHDkfZSPHy/rVs/HRt12KT73jUly4sAaB3AjckVPI9+xBtmcv/CzTY/hBVGEgvc1L+fkMsvERtJ/qw6sHR/C9l4bx7S0efOcVD/uqHFlt9kz6T2/y4q7rmvHJOxup4MJozPTDRU/Yo3dNaCDWlGdw+fomLGogHTkeeugh52gAauYiXfBi78khvHSwg3RinKZJ2S+NDZW4ZVkDaqJ9NBa11ZvucbTQu88n5NG5kKKV8Hgkjf0J+puSC3o2umY+fLXVCIbC5GOXmdqdXRfEHBouBzv6sac/iQtoLPqLbKODIxptlJV/YivLZ+bnDBjjuzGwUWfGl4LuOmFi0tIydepcUdG9bQpFp+NU4UzEJ0W6eJwMJkvvQGnpTo0OTFR0Bm0KNLs0WmzGzqJF+9SWvfj+L17ACK0X5fAH8mTUq3D7lRewM+mwu1K0TvXZnQFkR1qRj59CgYOgmwru8IkRMowLzTPKzfM8WYyjz8QM8NygUcSFvWk/lqk0uqfjeDwngtP+UkWn09JQWqNg3P1J0jtxRjIptwpnnOhiytJ9e6Kf8XkZLC7FtDw6pU0KoxmddE6wB1MKKzNTNwzCSFtVFVw+UH/AVwjhcGuO3oP1tEeGh+GjYJ85axbT+hBN6TUEP4KamiJiBjcG4abg4GZxJSPzsibgo5dTjZ0nT+IILfPmmjoqOw89qSZqHeDeh7Zg2fxFVCAeTKPn15/NoiVJIVMWQi3RaK6rwUsdPaivrEAFLdbp1fQUKWge29uNixY3ocyVQR3zddKjknRspFL2UhDqZeRsnkqTw6i20ot99CxrwuUIUFmVB7yoLvOiZSBqpi81VVobJg1qQtjX3o3KMgpaCh9vwIOVc6eb1ZR7T3VjwYxp0BPl6dUhNM+pwi/IzwP0TlbNmYVqMuRyCp2O4T48erQfy2bUYQZpN3t6LQ719OG53SdxCT0Wkhk+PTomfQUaO5pxcFaqCnTL3mbFpJVOk+kstu85jINHTjKacYy8YM1SrNPUZWII6DkIf85+wdzryWJksB/JTAovtWawb0jjkH3GkvRFpuEBLQzymV3xZ80pwx9/5DJ88o7ZWDc9g5rCMBWPViepXk1VCwfyCrVbVTCPBc0+XLmyClcsm47+oQjae6g0AmEaEvK+3OiPA0c6M3hkdwRH2tI0KsKoLUtQOOeoaMygtW1jkOoz7qFWtObSKKRHqKy7sagpi+svaMYVGxaiq6vX7K5iPlPkDrFPyrBkQRP+9pN34GO3r8XqGUHyRZLeYS/yvbtQGDgID+WHn/VpkYsq00vweV77kEOABlz7yXbsaUnia68k8G9PF7C1oxHtsUak8lU0OOmRhtO45abF+NyH1uKWJTnMoNL3611KMrTHTGmQw4220P68GSyc48XlK8tx9QWN7Kc4unuTpEWQXlzIfERcn3eSsav+LSdPvGXjElQmB4kPGSFPDiBfy2bPR6X0XYjRwHiSHt1BKrq8eV0ggzWrF+FgPI5XOmj4s08qg356cF40hDzGi00MDmBRXSW0x6xAMqVIZhPs1CTPDfEnrAUoAUcGTgRFT5VnIpgSJhQzrlydMpzDo5sKzsRisnxnK+ls9ZSWrlSlKTVYJ4LKMs/lOPTUyftPdOAbP34MbT32JVV3IYu7r78Af/ju2ylgk7SIaHWnh2lpDSAV6URh5DDc6X5aOxkKzDym02paPr8G06olyDR3QqCQNjWPQ6YUU/u8zkxdisvMveJAmwSc9o8JnDF1ITBlTchbejkpvYtxOmhrs1yWwoM0MZ+TKYKYciow9SmvwUW4TwgUyKKzYDTOXplfgWk/YSxG5/aK4kB2NYWjh8omaF45ODWULS6fd6GnfwAzZs5EVVUVx6QLyWQCNRxk5nmLLagISm0vnPrsTS1kyGPJtEYkEiPY09kDbzBEr8mH+Q3VqG4I495HtmHhvDnGQ2sKenEqSl7w+9FID62G19UUym2xKDz+AKrobS2aVoET+qr4cJrKJYQQhWx10I2OaBTV5eX02shfFFhJCqcw6VHBPPJET1Bx15RXIcD0lRQQVVRuxwYiCPooNHhdHQiinIq8n3WVl5UjnqZgpOCoqw3T0M6jeyhKGoVYlr7uXEkB14Sd9Di7klk01tcgSBoua6o3ryBsOdWPkC+MhopKzG1owsXT69BEvKgO2KekizPbYCg0xlc66LaCAdMPQDyZwmu7D+LI8Vbb58y+ca02dV5kFlcUug9QSUSBdAIZXg/FC9jWlcVTLVl0JuhFmjzsIVN4DktnB/DRu5bTW1mANXURuKOdyOlZX06fWlKwL6qPosl8wltyVC8os/m4amM9rl5Pw6Uij+FoHlHWaQwnBSq9lr48XjisL46Tjj4fqkhja6AWyxRv8GgD8aMXJG+3QDz0DLEuGMGbLp5Dz9KDV3acMkrmxksX4T8+dStW1Kbhyw3Ckx2EN94C1+BhINpDOaIytSqVOJj2Fug5ZZAj37a2DeOJvQnce9CHr7wSwK7OJqQDM1h5GMGwC0uWV+G2m2bh9949H+++OIAmVxdlk/YKsjhqmLn16ospl7TgUZ/E0XuG2tu1OZjFVUuqcdECKkwq7xNDOWSobNW3mj/RmBkaHMErr+1FIFyJ6bWagUibkWQmp+jFmb1TOX6eGcnicJIGCm+43VlcuGEpVqxYhGEadC19URzsHkKMHrWMtxpaTosbqgz/2VFrwTkKxGOm6w3xpwbnvv3aBPOVhNcFZ6/GgFF0+rSJMFP6MeTMBEcxCEpLs3FK6wQHSrX7RChdgHI2cPLbVGR60z06juUrrVtBxNWnVYYjKfzLfz6AHUc4SDmI9M7Ksrll+Jc/+SjKzMqzBJUcPbZkH5VcG7JD+6nkuowyFJOFAhRWlF4+H9mlREEYMNWX9AJPzZXpHSlEi+U40GUxlLbbOXeEjplSsJMetj3FqT/dVhDjsqWjf5qNVd7xQstemK8iSGiZwSJLlpfE8WxKTpDL58yzPPM8ktfGiy0J6RTvkaaUBbzn8Id+S9IZLpUwtfeEa7EwxlrvQK3xkc71FSEc60qhX1434xOpLGLJGBYsmEth5Uc8noDPa78qIWvfvB/JBtsaLDg0KNZqFKQ+RDqrqhxNoTIcaOnCib4ImqqrsJiKoaG2As/u68DyWQ0Ubh7MotvTTVNY33xroIc2I+BG2ONHR8yHENvQ4CL/TKvHEBWih95ZXVkQtaEg7wGRbAZl9PDKaCX7qcZlEFMOGWWnBTPtAzGEqDDDFJp1Pi8ag2EMjSToDNKAouVdyby1oZCZSkok2Fbm0/uCjWVh87pAMkfp4vEa5dhMJbaByk6fAmqP5JFhO8tpZa+rr8Kaxhp6hS4qgDgVNr1ieode9qXoIu3hfJFC/SM6O0ECVWD7xEboVC+Mb997ZFTRaWuz6y6/hN7wLHjpHRS6j8KTiiKRc2FLRxyfe7QF9+1K4FRcO6LQ2CTuEtBe9pfHm8P0chcunOnGfF8UFdkh+DV9SM1m+pCVswqmF3466kf3hDf7mzwjvDzsh7rKLDbOC2DTglqU0wDookuXoHOt3XKyzEMbAIf6MthKD+pEdxyVpEMjDSqSlcXkOWZUhxkUDDzXMzTWIdq4EEeAyvtE6zBe2tVj7q+YVYa7Ns1mW08hHzkO76AW4ej7lDLZ7FSs2qoxVnDFkR6J0XDJ4vGTXvzLMwn81/YgXjtehli2gfWGmSeGDesb8ScfvQjvvqkK1y9NYIFvBIH0AFvJsUUsnGeilhhSPhz54n3z5yMveZA6cgwsCoPDeRzpSWPzsThaYxob8irV5UzLcajnqTIenznQid2nhzF3fhOm1wThzdL104bqiRRSVHYv0GY5QI9Oik7P6FatnIXLV83DuqYarGisRjlxONoxhAODETRUl6HWny/uzGMNV2GrILBHcZFkmI5TgxGbTsbXAabYkmBYu3hpf3iwTD0Krtc2/9R+eJU3xF5jCUqF/GgxRZigAEpAlU4Fo++pvA4QCypMBAdPHQ3mvNRqr2/86Cl894EnaQoGGOujkMzhZ1/+YyymZe7JJZDPRs3Lramhk0j27YQ3M8yMKaYVM+kZgAaYOuAsDVEHmSM72UlnFNNYnslym0FcBAd/WbIC82C3QEWgyklEvRs2rpTR3rWgvTMdMHeYtLRMnQs3hwnO2h4H1Hb9leQzQKUm9IzQIY7OzitKZ4o1uBVB68SLYHqm5J7BgYLX5exrWPDjhf0FfO3lOPpTehGaVjo1yOVXbcKlF16IIAdSNDqAVQum03PS50GFhKnQlDcRbPnFC4L2mxDv9NN6DVHRBOi5aYcNIkBZIrtX+MtKlrUsJSmLnHiwsebpG/FROu3hqWeEUl5mqThBz2elfLVbiR7qS7BocY3oZxNIcJBiEly85ybN7IsWQlGKTrRkVpVDPMUaLuYxvcp4q5x4LiEnlIWfLF9dCF/RggrS3iSdDd8qrQQmS+G/yc/bY5wyOTC7flmu+A8YpgD8+vcfxEOPvkRZqwnKHP7pz37P7Jbhibehc8fj2He4BT/a1okt9KKyeZ/ZvcZPL7m2OkiFk0dMvMy8bj0LJwKudAZza714+wU1uHxJAdPrtZBE1KJypJGRo5csS8GMZ6VnWw1aBPW6LUQ0zBohm6dndHoghJ+/omdTVFADKcTI+OZBRYY0TadYXApXrm7EnRuqsarZhYYa9rtd/mjobZhXg4V4uD059q0P33yyF3933ymk6U298eJZ+MYfbEJuaLd9D9BVjQzHnWaNtILRlWa/6WsZsSG0jaTxWocX9x0o4NVjOSSTYRSyLJvt9rFtS5dW4V23LcRN6ypRlmqHK0PvUNjmKadMXxmE2H71p+k2gnBjT+simYFrKIVM/wgG0nnsipbhof1RbD0SQSytZ3JU2iYPyyQPzKwgFwwPoo1GXs4VQo59UkmD7K4L5+Ddq+owV9OZvRH0UFl+vs2FHw962WZW5EnjbXddbbZLq+SYkQElmsXY/gM9vTjRG0fz9CZc3lSOBpJS64st7mOgJoyBLsZF/MpQKm4EpfWV3iuVeZ4Pl0xdKo0jLMcjZ+7YUwNTI16aaiKMlf16YGLdFsyAMDhzcLAz9Kzk4ee346s/fNi8FKznJj4y72fuuQvXrl0Md26Ezp32soySAejJDR6AK2U9OaFlcdOQ0oWpYkpwCFhKyLPRxIHS9jvnTsdo8Khi0wvsufFlF0vnz1i+sfuKsfktjFOoxXC+YNMbLCYAYwxOZOxi1RbHCTWMoWVKGSvJ5tWlidMlad9cQyGXDZhVhMYyp4XZ0zmApsYGVNN69NK7GhgZQV15FT0EZmG7S2obB4YfioFcYRZ5aGeW8oAfYXatl8pG/S3RLaVJUWwWDdgvpkuJWVUqNSJyevTsxRCd5Ui5UIBYs0v5qa4oobxsklaFmjbpn+UJP7bKKE8pCbNJuHIY2qSZj+noOWsWQN6SblgH2QopszsHj16zYlCim9dsh9qkekfjpCgknHhPuHmYXvEWLB4CU+1ZwLKOkFLrZexn8NqeIzh89DTviTYFXHPpGsxprsNTr76GL977PH74YiuOdOco+Om1FbTa04P3XT4X91wyF1fMqUONH/Qm+vSWKsvQdwlDGEh56H0k8MLhFPa3Z1BJw2N6IEvZSprQWPCxD/QleOORCCP14+i57QPnz40MqsqzuHBJBa5YWYVFM6uQiCfRTS8vLQOA5eTIOy308J4/MIQdJ/TaQp585EEZPWyqSlOmyjZ0Zb95aCg/tbffLHIRhec2eHH9hnKyrTYhp6EsD9BLHqGnnYuPID04jBPtUfzn9hF8ZYsL927L4XhPAOlCoFh+CksXh/HRd67Ax97UgEtmxlCW6IQvmzC8ASp547UyGJ6TBta4VlA/q92pHOLdA4hwTLR3R/EcldJ/7Ezgh9uiONKaQEbPuJlQu8nwB7W1PrzpqiX41N0X4/ZNi9De1orTXQOyu5Agf+xq68GTx3pxKuvBtGmNtNEyeLE/i8Mp7RLEWlm3Niioq69HTyyK/qQWvRRQEaBHXlmGObVhdA4PSJ9iejhIuglXZhQhi1By+puBCRWMuyxeTJSfru3y6HzWoxOBHUE6HizhXy+Y/iqBKT06RpdaBcaCKYIVK6X57GB0mNS6Gi50DcRxx8f/hkpO7/DQMqZH9OHbr8Qfvv0WdpI+ID9Alz0J6F25ji3IjJxgLr1CQEVHhjPl0vWXVex4WQ4Ymk0gnDBzpheFiDYG1meNtHR/KrAKyCmHw8tIt1LQfVu5yjOMT7B9wnylBJW7QFCZEqdiUEfZOcnU2VKkupzY8RNBebwUNJrq1UXeTBtNDvpqQymUll2K4kRQMtNkOYSks6Y29Iwj467G3/4shhdP5CicvDTI05g1rwF33nk9qqvKENSUDbXWkqYGo1zk+U0OiicdRm+LRuQeXlta2PusfIymBkRD/U4Nzn3RezQvK9Jz0Pa+GMI+H6rLGU+yyfvT9OnE8iydxuoUGIFozsbqEJTmdZqrvjRHe3CcEQOlxo2glLOcjbYtWL4RKNYp04Dp8wIGogl85T8fxBPPbGFbxacF3H771Rhq78UjDz/LNpYxn7ZOS6Pcm8Fd16/Fey5ZhLr0MAI5Gp3sQ1cghDgVxw+3tuAH24+jI1tGz4+047jU88wclXplIY6blrnwzgubsJAens9Nb40WibucAtQfMJRxUanrXbtSIthVzqKvztkiygAXx27aVY6Xj2XwxYePYW970uyzKm9ZW4TpczPaYm1xowvvvmY6rltbjypfBtr+z3Qnf9y+Mvz1j47j20/3mrrfuK4GX/nkBtJ4mPW54cuRP6nghoboCfXq2Sjw7W1DONRPj9ZdwTEbYjE5+LwprFzViPe+aQOuXehHRbKVijzC+tkrBm8H7Pg0fcJ7xoASf/G8QH5Pdw6h//ggIijDrpgPP9oewYHTNKHYn3onTyskZVi5aVTUUOnfccNG3H3DhWgiDb3pJHwZto3a6xv3PoMv/2wzhqkU1Qd6pplmvrAnj/dfsgx7ehLY3EfZJTTcGVx65XK8847r0BaLm+8ahqgMG8I+zKoIoyakWRFSbTiB+jK2mXQrfYwxEcbGnAWnG39TQMoVz8bDL7kYZTwYATZJtolRU5at6JJ741OZm/bUgAgrFmeviOE5OLV121984T/R2Z+gDKWyoid3xfqF+Pjdt6C5mmlyUaZPI58dRKJvF1IDx+hMpI2Q1e6zmrI0Ekr1sOxxg38ScAS7FJ2mjOy5HXhng4ntF/rjQfdtGlueTTCarzS74sw//4oK1ElXmmz8xVnAlEXlY8rQAhbR2d46A85CoLNVZ70DnphQpKEUQi6JpbOqsf90Gr3anoh1D/QNwRv0YO682fCzn+KJEQquJMrDZazDIDsljN3SmaEQD7Y+c20S2Hs2OL9Tg0hs+E6ZzbmlVZwW95e+eh/2HziOOfNmolL7dcpDLKYvhbHrsXgTVQzO+YRstm4eHbL/f+x9BYBkR7X21z49vruz7pLdeDYuxIkRIVgSSIAfCQECeUgg6IPg9nDnBQIEjyDBQoi7Z6Mb2826zuz4tM//fafunb7d09PbMyvZPPLN1va9padOnTqnTl0bKuMdu3MvwoPfW6FUuZTmKzlVn2g5e3v7ccNtD2DN2s2KZAjjkUdWYOkzaykaSS42BjF7cgKvO3ImPnbGvjhtdj2aBjoRN8WaZeMZjusAPdJ+LJ7RgFfuNxv7TGtAQzyCLb1ppDM0Xlxg5riwWroe+PtTKTy6NoNUtoBWeltxemaDKXrChai9a5Puj9cJR4vJkX7tXMs8xeq1YSnMa8vRC5uI3ac3I5OJYPWmAYoa87F8gR4Z1yS4YUk7rn+oHes6Q6SpDq0NcbvppUCz96/7ttCYsAyLzJ+WxGmHT0Mo041U3wB62tNYuaoTNz02gJ/cSa9qSQ6r+xuo+PXmmgIa67I46agp+OD/2wfvfcU07N+6GfXpteQFF9g0tKY3/HGyMeF/9iv6CRqVQS4y8u30pNb24nHy5Pp1EfziyRz++EgWa9v1uIg8aO0SpNHaPIgjD5yKd5y5Pz72luNx3L7zUK8XYHR3IL+lg8aoC4X+Puy/aBJOPWwBJk8gPwfj6OrL0+BxScvj+zf0YG04yYWH5FmLCnpqk5tw7EH7op6LlV7SLMPal+K4sm3t4OpdMgk6E4mErnHK91UnvH6Voyx6hFzbDR47h4Ee3TX06FrcAFAYyieng4pXrsJX+pXKlU4wDqYp5ApgdC0enWuDKz7PQug8TEH99m/+jt9ee4utrnUxfMr0Bnzqba/Eqw7dG4P5dpZOU4j60L95CfpW3Q+keqw7UTPwMnRSYGpUb7uQN2PVD8G66PVT8Pvs3BMH9zb96igaJDtjUPlgYzp251vz6NyNGd6JZQukeYeiUxNWp0M0VwP5mk7JM43aA8+2PtIqlAiWH6tHp7GTdzGYY2C1yuqu4XEZUojh4bXN+Po/O7EhnbBv1EXDGbzprWdi0axZzJy2l9fOmzgZE5r0yroi74tQjeUenaPJvax5bPBl2/ea7JxBbJBRS6edlIZ1Ozi9D2uezYmOEr5VHAPGVWBaMMrvj892O+WxeuR6OBzB3tbq0enqnq6Drd/YhU9+5TI8/dx6OTKkJWyKsJDLYm5rGhccvwDHzGpFW6IO0XyU8479z2g7LmPbwipTIK9CMRlOGiq9X5Qy1R9OYE2mHlfc9RyuvOcZpGggMpEQPXQqS3rxuqFnct0gXrHfJLxqrwbMjnQj2QDEJzUiXO82nMVCyb7NWR7rerG2cHXsPr+jDNqVCXMB3EBjkcRXf/8olqzoQ5auj97L6fKyw3rnbT1w6Nx6vPGYadhjehM+dtmj+OeSPtJfoMEch/95127oWfUkNrWHcNsz/bjygT4s72xCP72sQV1n5aI6lKdB3308PvPuo7H3pAjiuQ4a6i32JRSNkz7dY/uClEHpOTXNnhjHBb2aa7Avhb72TmS40NuQqsffVhXw1yW9WN1J3nPgpZ/itEK6rhdje6ccNx/nnXGAvR+zTmuBTBaZjfREWUeUiwT3PUXmp1edzGat/hz1XsdAHsu6w7hlZS/++XwHnuqi0Ys1kyfkr3Qf+3MiPbr3vOF09OiLCJs3oyHZBH3DMZ7PYEFzK+dnL1qiYfZ1ElnNdjgokpFK2HU8une8/lI9eyHum/B4k9oNgiNy+ARVp5RP+fn/UJlSlMe6alyZcmh9pgz2Nm4TA9/Aucy2XcF4Z+RUB134SBg33P84fvWXW9HbzVUk4/QhhnNefgDecvrRzNtH2Rqgosii0LscvaseRKZ3M5Wqpox7wau2wZzQCVrVSRiLfS/RBMPg00eDyx/xwQ+K8I+tN0r3fvWfz1N3pYiRasong7A6rO7gcTHIkbQ6dSr4v4QG26hXHCuVcLlSamb42PkhIv7FGCjE4oTqkI70x6IYXN1+8CqyYLQGjvUWert4b0HR7liWTpT4fdb4tzaEURdL4ql1XPXnY3rkCcuXr8LixfOQTCbsZhHdkKE7E6PkmyYRaxqC+qk6izBKXUIZ/D4PD0yT4nRdYP2lNfr5BD1WIAKiXBToPZP+ey7tTx2zOnTmMFRW8mWD4vJUhLJ5h6W8dsEpFyVWDkPV67wEXgaG0lEVVLGu0Q3ikaUrsHztOpZn/9mWzHddPI+TF03HQckwZqQG0JrtQzKUQR37pJdyhyJU6BRMbSXKLOmmkSi9Ml0H1fXDOMe8jarm+N1n4pX7L6Bw5dDVn0FvNowMPUV9cLSbBuGR5/tw3eMd2Biigo020FPLI0G6IrrhQrfcGw8duT7dUgvGcq0GbPrmSFc/po7rwxlHzsa+s5uQocfZ2TeIjJ4wrEsixEVxJhvH8o05XL9kC5YsT+PRlT3oSokfBXpAdZg4oQnX3L0F3/pXN/62pICNqRako40AjXhLSwT77zaO3tQR+MLbD8aM0BrE0puRT3dxgS0ey7DSi6LBsZvxjWaNvQjUVmoO2YEBZDZtQc+mHjzbDvz5uRi+dUc/blmSQmcvZZ78kAcXj+Yxe0oUJx06HZ9+50l4/cv35qIggmgvvbb16xFbuQ4ReoLhtOpmE2RINBtCfWcGieUbEF3VhRg90hANXm8mgy0c4+e5QFs7oOuJHC1jpGQ1h8MO2ROL5s9AI3VBhgZuRU8PCokYGqMhJPM5NNcnUUhnMKmpiX3QdQjpG08vlAVftvxQCb4u1LgGj8cEFg+2ZZSxrtD9d/9xMBbnwDHJ/oYacAwTKhs6B+cJVUalJGu0Qh+CHXMqsBTO0ElJer+cWI8uX4Ov/OwqPPGcvhZOl54ljzl4Pr7+kbdhWgO7OLAJcdabT7ejffXN6F7zvE2sjf2NrK8Os8bn0Zbsd4rX2pc3x3JB+kZYqfgYGpgAv4RgHbY370PxbMsvpykg6NxiKrRdadDtdmz9qi47sFODDIIPU3besWLdqtgdWbUMfv1OqTsZ8D25St+KGi4PRfgbSoK+4q1bzINQWb3Zwb7szSY0T1TdIBXioLZVco341b05/OWJNFfkHLt8GrvPHYe3vf0sKlNOQyqraeNaMKW5heNWSoeMi8eNraIiTy2O5QP1lnivPFSeobLmFrhzO1I/SIP+7GOuPhQXJMsUXQ0QKd6hEFyt2hgE6xwlhq4vD0ELTP7POvUqrFsefBrf+9nV2LSengnp1V9OD35z5T8+HsderQmcOrcRZ8yuwwT6N/oy+yANfqihASEqRdomU/YSH3HHJIv/Dcb1Pke9MYBKNBbD0/0hXP/8AH51Dw3rll4qdT1AnjbjIG9tfDKGhRNCOG3xOJy+eAIawv1I1FGJ29uKNNpiAinXIkOLJx66MaCnxQGxkbExi6AnF8fTmxvw9ycGcdXd69FDIxOmwtfNJYVCml3IMOQpm1T9/K1L0jjTa23vVnf0HkjKX6RALzOG4w6bh3OOno+D5iTQgs00MB1se8CTF92ZLLkPzDXNDHmfuicgR++qnx5mKove/jxWdoRp2Ptx07I8VnckkOEiTwZb8jxIj2kRjfRrX74bjtpnMma3NiHST37399Bo9dJ7o/HKsU4uCmmj2NcCIgkunjd2I7S5D+Fu/qZz9NoSWN3YhN+v7sffV3Th2V69BSZOHnJxQhKlr0LhLBYfuBCvOe1Y9PSlcfheC5DL9WMljemTm9qN37u1tGBave5gz2BOaysXHxx30enPiTJohCqnbD84HpfC4tiwnxL4TI9EQgLhkzW8cBFF0kfon6FSklMU3kkAxXb9lkszycD5W5ZK6ujqweXXXI87OCH1pgTNpBmTmvDTr1yMGc00H5ktKKTWIz+wEZvX3ofeDc9jSw/w6Pp63L2qEU9sALr705g+EUjooXAKiDwEa7uEwArEBuHlHaZgA8VK0pTf0vxyXp98BMoN5anAMD9qKC2QJUiJov0k/QbFzooyyNC7WBfh6nS1VJChqnCLBv7Typ7jVWaLDDKGeVMo2p6V9mN+vU2WB3WRLMY1RfDs5gg29uiZrAJ6Odb5wQHMWTCHCi6Ovr4e+/xKTLcvGs0OpWfVUZGnMlzl0SUrFleuyHP3a3H6ZfC7Wzr5vPw+KjGlAspKDdW9PeBJegDuXGMjts7kxNhr0QL09fRynnTTEERRkDJlDt29t6I/h3+v7sM1Tw0g19SCqVwrJwt6GHwAec4reTBZyoA9u8a6Zdv1vGBIz3Dl+jj2GcTpEU6Ip3Hw1BhO2X8mF0V5dOjZOBqEnJ4Jo/eWpleyujuPG57cgluXdlBj1dHTGDRFqztN7Zk9Ty+UK1WL17ymBdB7bRM0klOa0jhyQQSH7DUdq1Z207spIM0FmbYHZZXtBikpbpbJZPQVjCTyEXo9tN2tzVEccWATvnHJabjwxKlYkFyPxtQahKhrZAq1gNMWoH/JwcaZ9YkC/S9DVxhIYWBjB7rbe2g8gN88mMLX/9GNO5bFsWUgadclVS7BPs6ZHsI7XrM3LnnDYhw+sw6T9Pzh5nWIbuICvrvXHm/QtT+9My+aLaCOBi3U04nB59aC1gn5TB69dcCyhhZctjmGjz+4Bf9Y2491Gd1hqR0tR6M2JhqbYzj2uP3wprNPxKJpE/HEug14dkMvZkwZj8lNYUxKJtDT2Y9nVm9Cti7GhaZ7Ibot8CvMJR/WhDvcIaimnyzJazz04F1/GowlKKVGbJAkdsBDJYvpo5LC8FFpPjtF4Z0EEKzHFkVD4AmFxR6oZh6JTJoT7c+3PYSvX/ZH6KsEuWgB08Yn8PPPfgSLd5uMSK4dufQ6zqfV6F31GHo2LbfXGq3fksSdKxuwpksvru3G7JYenHdMMyeOnqMjsaKBwmpt+gh4JEajyKnk5Ri/RuaT4PcxyJfgtSO95UF99fk9lN9+RV+xoO9J+zzhgZ0LQY+uHJ4jaFA5heK1U9HiFLlfhe/RBfV9cIB05NSMwNoCDUj96xqc3x8pUR3bNSP+Ur+Y8tS1hEFtVVptuqYRwU3LY/jfO0L2AG6BinHchATOfPXLsftuC6gMOKk5LAumtbE/xdb9u9pqgc9bwb/2VgklY81sKjdU1ivnK1rB9ZWhREakQL1DolR+eFxpolSB8bCsSMn4VIDRxX/ui+mVYXXoP69/aqKQ5xhs6cITz6zHQ48/hwcefxbLV61nNi1ktH0cYZ1hLKSHd/iUBPZsBY5qC2OGnmiWe0WPKFRPbcvFtHuMg5Wyet1wJCMo3ocirIeeXq6uAevz9bjpWRq1lV24/bmN2ERDJE9KdxhGMmnU0ZjOHRfHKfuMw4l7JDGXbdXXJRDR1y7o/dht+6pfnga9J/agREZItY3XIL3TvlwD7n2+gOsf6cQ9T2zG2s0ppDNh5Gk4ctBHb7XQimHBnIk45fBZOPbgCThgDmW4n95NmkadcqitXfG2ZHx57NhdNJyFVDfSXfpqQg4PrsrhxqWDuG9FDpt7Ke+RepuDenpzfEMYh+w9BS/fbxIOXzQOE8IZRPsHEB3IIJzSl1ZomHJsk3mz1B2hXBbxngEaQDbczfYiA9RtGXSQrgfyUfybi4Q71hSwvksvUWcpnycciPqmJPbeexH2XrgAdS0NaGhqxl5zp2FyUndgFnDPk6uwfFMv9ps/DfPa4tCHWp+nLDy6cj0WTpqA4+bNQqRgbqS6HUBAp5UljVLUK8LNscrw2yvPs8sbOlMirMe9rSOMGCfW+t483vCBz2Fzd5o54hy8FH78uQvx2pcdhHihG4PpDcj0rUHvmiXoWv8YFeUgUvQgNnYlcc9zIa7UerHH9AL2m53EuBYuirTqYx/VTT1PJQU9hICh8yFlYS9J9soYgQGDNRL8Poov6k+WEyqsh8M81GLoinxy7encDMRQvOhz5QWlF1OsiiG47QZ5V+7RCNtvUu9Vp5dva4ZOkG3zaaZuYBlt0ahd/rGgT7NW+ZaP/NO2phYVubQMHtvzDJ1uBRf9A7k4fnNfFH9emufY9Vv5+Qum4ZWnHYvJkyabYmiI5DGHE06LINVbbuh8mgSfBh/B8201dBVRxdCVQgkKqktjWqVOg1eX/gvUWa5QyuH4LrJGltNiHc4wqIwUtQyZoCFLpQp44tmVuOKav+Kxp5bTCCXpfSWZTx6YlDowr7kO5+5ehzOnpjCOnriuG4Wb6xFrbFal+ud+qUztWHWz4GCM5WnskGhCvqENzw/W42f3r8DVDz6Hbnow2mLUhVsZmOhgDnNawrjguKk4bs8GtCRy9Pb1lRHKnqaR6q5g6IrjTn0SSXP+UYHHxqEz04q/39eFr175ODZ0saPk07iJMVxw1uF47VHT0RJah0SuE8j0s0YZCmvEgi8j/hrPuseJpvN0Lz3Urm4M0Mtd0R7GL+/cgn8vLWAgMoEOa8xkVvcJNEYyOP6wWXj3aftht/oc6rIZ5HrpGffTcxtII0rvTLc8agtWX/QoaIuXcaEOLgRXMU+Khi8yiE3jG3Fzbwp/WD6Ax7rkkcYQK+i6Jj08pNhWGFF6Z/sfui+OPfZoHL3PAiTJ084BvTN0HdZ0pnHGAbMxt5VGkfx+fgsXHQ89hwMWzMW+Myax5znOxzQ206s8YMZ0RO1apG7+sa57KMpYuVwG9c9oEZzPI0Hesw+TX/5prCIXvF2PFyQkAUwKUlUsIIU1EsoVSDmCqS6rFIWdDsHqL8noThUv42ZbYOIQf/Xy0ku/82s8oTvCNLlI55knHox3vPZkJKNc9Qz2IJ/eiIEtz6Fvw9NcAfWzmO7goxcQz2L2xCwWzwtjwdQ46uNkjI2JJgLbsi67Nn0KhhErMM5xxxHqDI13XiHoz35Vl7rBM81w92gCzyze5XG0+PH8EZhudejX4jR8OvDzeMce/JFzSa51yYjKFnMRrjITCBkOl8dry4PiDMGCJdIrSjjxSbK2QGQYZcQFVxP/vHa0VEmn9aosrpSl2Fi5roeYnrBrMoqTsdKbQjL0uKN4cm0WmwdoIllnd6fulh3EjJlTEYvXIaOJz7YbEjEaUZWzZirCkVCkOyi31l8OPs299cbkIDgjlVVZ9B+7Zr8Wr75xYcRFgpMZwnYEhGL5crKsNPuhx1rMo3ENKtJ+RZqNgx2QqZR7G/FyrRHEUJKo04kLHA3+ry1itVccl+ooplst/E+/kpE458zUyeNx7MsOxj67z6PByaI3lUY3lTJCCXY/Zl+Rv3ldFr+kx/JUfxiN8QjGheh15PW+LvaR/ZFRtK2+oT/GS2nqWl8uRcXei7ZwP46d04wD507BIGVA19d1m7s9bcDFUQfXP7cu7cQzmygH5E2Si8a6hPQFZYHzXYbG3hYjHlhH9E8H5IUZWaZoCzTfibrBTZg9Po5/Pd2DFf1R1NOrueDV83DRCRPRkHkO4WwHDdoAOSk+smL96joc69C1NLvCyXG0Z8oKWWT70ti0tgPL1/Th9qfIiwcK+OEtady/LoZMdDx5SZnJpTFnah1OP3ISPnruwXjz4TMxNd+DRE8/YlvIr85uhPoGyJMMaaVnR28uykV+uC+L0MYeFJ7vwiCZ0JfJ4vFQFFemIvjasgz+tDyLVX1RpNlVe7UhjaKuDU6ZNhlHvfxlOOf1p+HQQxZjyYYuPLOhD5ObYpjcEMLsSXH0ZPtw4+OrkY3VoSUZt697tNGDfuTZVdjc04MpExrRRG94an096iLqtZjqeFoJSnH/ERo373BHoTIVukb3Nv8aXSk0JUSUT6g/8YIKQig/L4FfgZWXbKu8pQzBTWbvxINOFZRfIqRCyhaJN+Dn1/wLf/jH3ZQvqbYC9tptCj75rnMwu60ZscE+yncXsl3PoHftI/ZlAqkvuyjNiRWLD6KFA5fUxVrGmd5gkNfIFvjHX1v9+RRYIn/LQMG2H0+hFy/EBsoFgtU7dO7/78O156rkMdv3aXFvvVAy/2N/7cYVU4parTq+aNqVC5CvD4vX3hgnxWpleOIHD/7Wpe9RWqK1ozj7KSvm/vdhZ8YDtueVE1w/FMc0RtvrtHge5QTRHXeqXOMiJW72Tf3iitHxYBANXLjMm9SEe5/XGyC48ia/N7W3Y9LUiRjfNt7eit+f5mqXfGqI69pIGV3qvxf8fpTDpZMckqQbDsTnqC5ShbiC1o/+vDrcUPFY/OJvLt6IH1/+L/zo8r/igceWobG5FRMntCHCNG2dGTkKZVB/9a21x55eh/aObrS0NCIadTLpFnWuvQj7lxtM4IFHlyNdiNrLn6VI3agX6TLaho7ZgP0Xteel9GoosduVUd0uXTQIkosirIPuULC8lp0/rm6bK/zVq9TaWpuw56I52H2PGWhoiGPdpnZktLWmvDQkWa4il/cUcGsH8FRKbwwB2gZ7zYNQs3p7v4jL22MZpI7jqz6EtVjSA1sZLlzTfZhdV8AxC1px7B5z0DquBavWd6CXC6ZCOIEUw7M0dLc/0YlbH92Ijb1htLXUozVJDoTZDhdVUfLAHnfwZZrNOTBOxlXGlwR19sdw9cP9WNcTRR3zHrkoiUNmMReNjxkM5jMjyz/JqIOTWQXdaZqjB7dhTTeeWpvDtU9G8IM7s/jzY0k8sb6e3lU9vUc9VF7AxKYcLnzNInz4lQvw6j3HYXY4jVhnJ8JdNPLd9NK20HtN0cixTnISell0tJsytaoL+fW9yHVmbNH4fC6M35Pe764HbtgSxfoB6TXykG1oERIJZTF9wRSc8uqXY9/998MhBx2MWeNb7AO9k6kzl9NbfGzNFjRRt07nGM5pTdjY3PHMemzipBhXn0BbYwNmTRuHbs612x55HofttgiNMugGMVN8VagM5fBDEKWyt30wUo12M0pEhk7SGyClhKgyCksmWI2w2gP5beXvK94yFOtnuoyJjsNx3L90JT73/V8ib3fo6d11SXz4/NfgmP0X0gT0cc50ItS7HB3P349M9wYOMgWTE0lB9elFwfoSsWuj2A6PLM6h7NzSS+GXK73TqNpA66+I0hrLU4rn7hkUxqg9pz7Yb2e4g22XluKxTWovRmU95VQdqtvRaWWH2qYiyrutyCJKK7Mza0cHRT6oNvvzyuq6gBSg3lrjLyhMuWuIee7uBOQ5f3WjAWcqmhIZ1Cea8MS6DKd7HFlWv6l9CxbsPht1nISqI53Ooj4Whb4G75T1yGPho8gft3WdRwKf/vQP8O1vXU5DF6Py3o216BVgXj5Bh9ZP5yP9665H8Kn//hrWrliDxx95Gnff/yj222cPTJuou5hJQ6BoEBrXp7hCfv/Fn8LNN9+JvfdeiClTJrhEeYha1JDv8o6u+dPtuOSSb+E3v/ur3e239z4LSZMzdCXwTtVzeaYf/+T/4CMf+wb++Jd/YtrMKZg7d6Yp6mK+SjyqXKeDf+J+JWN63jJOvjc31WO3edPsg53xeB59fR10QqikOYS6mUgvp366K4S76eX1hmL23FeYHoq75kRvQzJNcgry0EWitr51/SvPcxq7QqofCYZJkQG8bHoTzqA30tzUiC16iJveI8UTqVQOnakYHliews2PdmFjZwHNdRG7a9O91Fk0O7oVJGPGRWvQ9iToISZw1UN9NJbsG72ofWfFcMSiRgySfudNS77EeZXTPNTqjLVkgGxvlgauE0+uzOJvq+vxPRq4fzySx8Z0A9LRBltM1ulegnEFvOGYWfjKWw/DCdNjmIi0GbfBHnq79NSiPRnE2+nNcT7kB1NskZKpXZDVnSis6UemJ0sProAVJPsGumw/2DKIP7UPYmMmam9/kSertwfFEyG0TG7F0a86Eee87hQcvHA2xrc04JnVayh/9LDrYmiO5mnY6rnoStGzo5FlvL7EP4eLy7bGKOfcFqztz6EumeQ8TGLqeH0jsAWTyVMbM3HD5lElWXLYEcasGkZqLfKOt519aVQPn/ly7MN64YWxQjLEH6uC/wWVpX/s//qOhOXzlKDce03qCGJY3TGAS7/7U2zoSEOPEtTXxXH2KYfjTaccgWRcW129lPYVaH/2DqS3bFAlplg127RFqP17e/Gt/akhteGHYOMKwVMd6NiPVH51TatiB+ct+enDg/9nhoRRQ31mnJs8rNMYQNjEc0H59GerfCVZnMvGs5I/nVcKLo0wYoenF4OyDPWo7Fc5inwy8obOXBBhRpv1w/HVWvf7pVwsZ3wTH+zP8VLlrK/KYnnkXemAE5eNTWgIYyAdxYrOQWQoEz16FijVQ2M0jzmpCrgqT6VkEOsQ8xYy5TAyAkFtGC0er/VVgKv+8Ece5nHwIXtj/oLZTPUpLELlfOhW9Dtuvh993X1oaqzHice/DMccuQ8aknqhuGtB8Oe6i+H/ap/tbdnYgdk0Qocfvj+amhqYKuIcTE7Z1zTdoFQ/PRMahJMp73NmTWEu+cVMZ8X2cmn9qgx/1UY2H8KSJU9joD+DBfNn4JijDsbEia0sI+UuWGk7qgobUA8e30SZi3XzS9dH5XnqeUl9Pmb3BdOxeK95mDG9zb7R17651+jS+GYYHuvI4ObVKTywgQqbHsOkZAjJwgAiaSp1Gja9Oq0g95pz3II3P8Ic47Buo0/3onGwDwfOmoBj9l6A+VOnYPW6DrT302DGIiiQlu5sAQ8/34/bn+zHis0ZzJqcpNHTlibpEI/MsDoOuMWVvO9BtPclcM39Pfb2FFnP/ebV4di9mmlwma6FGGnRZZACPUXlL6TyGNjYiy725YkVOfz6ceA3j0Xx98fzWNOtuzXpwdGzj4b7cNTebXjziXPx3lN2w+l7tGJ8tgcRen+DXex77wDCpD9MjymirVkaF/Nm+/oQ6+hHaNMAPbweynwey8jnPw7kcVl7Fte0R7GsX59FJSJ5LtjyqG9KYJ/9F+DYlx+KeXvvjvZMzt5dOm1Co905OYHG7ul1G/DUum6MH1eHJi4fJzfWoY5j98SaHnQNhGns6hgXpVFuxKbeNFbrbUVROhaREOZxsaWvldudqR4vnSTVIE87ASNREbr3tqsG6+r1ZhQvxoOvjLcFlIUS+FtkQagdE7hAkn00kZD3ZVVwRf/F7/0Gf7rpHtsOochj/92n4yeXvhdzxtNLC6cQC23G5mduQPeapdDDxOYp6OESVqDPz8QScsndMx9Frbd1GB/0j796A4R//Ul02RDbYDO9Qt98OJWv/qtfmmBBOlxf3QVtVcRJ5UEre/erfEpTntoRHENrbyuwCTMC7EHcivDpdoaquKXDKIVgsz7/CdVX4i2x9UKOqphzPJejh0WlN2ivTbKviWBtZwI/vTeKJV0NyIvXkQxOPPFAHEkjEeNfri+DSY1JTG9romJR26W90VgFSfFhNHs81wuk7WvmPo1Mk3rzoSPVqrFWbdpaHhiI4G9/uc0+LbTvfnM5mv6Xt62IQeWGauFqWzvSBsq52lI7Roei/HKM0PZ0nhG68UmMKNCz0M065k2IRhkFU9QqJ/67MdBX0PXGnwQ9iRyNQ4Hek78CZ4L9P1TO6+twqH2fmBHgzSOZPlJm10x7+geQ1rajHpYOxfHMqtX4wx9vwHMrN7FNzYMcohxke5k2x3jhuDDeuHsSRyTTmBzL0fui1x7jGCc4r7UdreufJNG2DDXupNu8XXoYqG9EobEFqeQ4XPtMD77+57uxqquXtDCPXXzPI8M2WvMDeM3RU3H2yxqxsK2AenpWZkf5n26usC9LsOpnNjbjzT9Zj2e7aBQzWZx3TBJfecs8hPXtPD0aoHrJez1v17s5jX4am829YdyyMYnfPZTFys36AK+MoT4bJK88hQMWhvHJcw/Dvi0JemtdiJI3ti0rb5YGbnBA1944XnrUhuNZxzhaaj21z0VbThv5yHFOrUkP4q89IfxybQ9WpmRE62zsNHqaD3rJ034H7oFjD94HcyeMR4zGWOuF+5ZtxGObsthzQgNeddAcNIRz9jHVv9y+DBvY7uuPWYQk+xaOJLCBbd+zfDMaqCuP2Ws6FxQFbKLxfYTe3sFTWzAvSb6QRjkiBc5fLa9q0Ss7E6aTPTj+uHPPo9OrsOx8CEElOVaU11CpzqG4QJImtpu0VFeRGK6762Fc+Y87saVfilJ7xlF86O2vweG7zyDTeylY3RjY8Ch6Vj9GI6c63WRw63Gt5KT51IAmWlERV4Pfvjtx51YPobE1FgYGeShvAGrNynnnDiwzlJXCovlYrIZRwTpdySAdtaD09vXaUa3UyDdCKN4raT8un2jWUWkpqcTgXxBMo4LQlnYu520Vib/kj1b5jXF96TiCFVtC6MzGbKIte+Z5jB/fgGlTJts33nr7ehCOhdHIiaq30Qd5OVLfHGvFZ8qalKNdW5PxUQm1z+Ad+sOtIjJWmvQJKsx99piL6VMaqYxTluaukVjFJTB5UTkm2UpYCtZSyAsvv4yBPF5B/ysvCXMGzhSy5JoGgHWZWPtlGZTV5E3X5diQttwkYGYYLdUtnARfAYwMV6cPG8+yYJ1hkBESnbrOWCfvTq/94vjobt7W1jocuP8e9Fwn0whk0N3dzQWjtoRzVNYhrKfn8u8VA3hgs5YHcUwYpBHM6uPIzEMjpXtxZY601ajtTH0twrR/lrxg2VCKXs9AB3ZvHcRrDpqHRZPHc7FUQHt3Gn26WS2ilmJ49Plu/H3JFjy3hYaKRmgidQiljRWJFv0CHf1JXHlPJzrS8lrCWDgVOPmQNsoW+Z8NYWBLBlvWd2LT6l48sVrv6AQuf6iAa/m7qY96ZjCOKMclGUrjoPlRfOBVC/GRk/fELKQQ7SedfewXvbhQTz/C9OQSAzT6KQb2JdqTRnxjN8KdPewX5Z8MTXG4lpEnf+sK4TvLs7hyXRadBepqe5SCYxIHpswcj6OP2R9vPftUnHLQXtjI8itYd2tTK9ricSyc1MQ1YQ7L6cH1pAbR0lRvN+0smtmG7s5u3P/UJsyYNBGN9FRbEjFM4nit6+3BU+sHMIde4Jz6KBZPSGISGW/XKGnI81okGMeK8rGrYCSpjpz/1rMu1R1sgsj2AyVZ/28TymuweV4WrBkLxdxuy5KgkXtyVTu++6u/YfnaLXYezmbw+pMX48LXn4hwjootmkI+tQ5dy+5jGo0eqxna4mOwC9y6Gm/wIqsFKhn35/lhfkW+AjIl5ILUtn9seY3qQJyV9eoZCoT67v26aDFCQZHFvK48j3waagxOGZbSMhRMgXuwvhTzuXL8Ew/EQy/FYHl9lJZzx37w43z+SOVKwVKRqV7m0Z/jbzE4je5oiEaj9K6i9liIHioP65EPKqcJjVRaVHLPbCxgYJAr+sEY1q5bjxkzJ2BCaz3FI8yJ3sHJ2mo3BrC6IQR6PQyOci2I1HfSIzotMGFobJxMDcVbhVKQMhn8pTBrp0E1WbN+Hi9YFTxkaZ7ryOu3yz2Uz12XdcHNEf2nDGxDRtcML9OYT+ZLRtUMq/HWq1v5Va4Eakd1is5imm+0hgeVEI3+n6tBwaB0L687djzUK/wS9MqScc5VGtgU3QrN5wnjW7H7HvOxcK+F5mWtWbOWxoSywXRt0banwriPxu6mVX1Y3ZfF5GQc9aGsGT19tw40oFKyolx06cYkbTJYb2gAdU2tMTeAPcbX4fiF03HC7rORTRfwHPUHovUYpAc4EErg6XVp3PpkP65/kJ4L5WT2xCSlkwaTbWwYSOCqe/QKsCR1SQELpkXwiiMmo3v9KmxY0YGuriwe7Ijip/cW8KsHQrhndR02aetQ84ZB37WcMb6A9792X1x0ykIcOLEOSd01qefcuvoQ0me66alFBtKI9LJfqTwinb1IbO7hbw+NXj/S9HY7khHcS6/2G6vT+N5TKfx9TQ4rMvQWyYMCdVmWtLZMHYcTXnUijjziYCycPA0LpkxAkguHia0tWNfdg8dWtmPiuGbUx/OY1RbHuKYGPPJcB/qygxjX0ohWLhpnTxuHJNv6yy2PY8b0qWhJhtBMYzelsRHjElHMb4rQaOfc1q2JuOY0+U8ZkhjuihiSVqPPyadC5Py3nO0ZOksugomaFBZbklA7ainmTxS1pwP9OQ8sgm4K/6//fBNuve8JziLdGZrGvrNa8J3PX4yE3sIQTnOV143e1Q8h17PGbj7xoXr9rcJhsLYqw09ReVMIwbwe83wEa7Z+lMHn3fAUogJZ5fDrrFT3mBHgkbkEAagdo9lQTmCQhtJyI8NGM3CsH085+/Xpx4JTv3ZIo2fvNfS8At3GrTJ6c8aU5hhWbhmkMoxzwuv6fRqdPV2YP3c66unJacS7ujoxadx4HhX7UI3dfq+H85nnQX65XO5QCGa3ssGIscFs4DB4NAS1S1m+0lPnoRRRTA0auepQmYrEuNhg0lBW8tGL1+va4vTwEgnNZ/lN9JjZuab6euy55yIsopc3kM0hnUojl87a810DNF7raMwe6g3jb+tzWJaLIs6ySXpCDeySLn0U6LlLP0iq9HB4mIshvRQ5RAMS1nWt7ACSuX5MjqZx7IJmnLTvHLsTtJtGr09eIL28bC6EjlQMNzzSgbufyyPZ0ERDPA7rupL46z0D9Ogoe7ks5k0DDlkYx6rV6/HA6gL+94FBXHHnIJ5tr8dAoR55LRroZbc2DGKvOVGcf9ru+NhrD8IhEyOoT3ci3NuNSFc34jR2sUweMXpUsQF6cv39iPekEG7vogfXS+M3gAw91uWk7a+ZOL60toDvLB3AY70JdIbr2fGYOs91XZgeXBuOOuVwvOasMzBv5nTSWcB1/7wbGzf3Yfr0cWik4ZpCY693aD67qh91dUm01dMANsfR0hrHc2s3obM3Q4NYjyZWO3FcHfMk8OiTmzB/xgQ0RQcxPgHM4qJSL9l24hKYrx7Kz3dZ+PL4pnPPvDRDAUgmnVc3BCkjDqQyjlXR1lLK6lZG/kopagNDK2u9zPXGu57Az373N2Tpo0sBNCTz+PmXPoBpXGmEQ3pbei8GNjyOVPvTtiKz7Rz+Ka9fbSW45iqn+rG6yO62srwIwt9S8hE8rVSfqU/3rwTG1xrg1zlW/htYVuWLwdVnQX9D8cU2dOxoDNJZTkMtNLk2hsAxkifivBDWTW3l89DGTs15hkWSQL9Ol0bo1elKmbbvBlFHozexuQFLNqTRno1QNkKcuP0sV8Dc6ZNRH6MBpJLSHXyNDd4NHoF6K8GnMsiDIZSUs1zuUKiWNkYEZapcToY1F0Dp6ch93R6GzlAxyUX6bNQ6iroZSXoHulFF1051nUvXJZvqG7D7nvMwf9FcxKhoN27pss/36JEDXZsfYCVPdedwx6YcnsvVoaWuHuMK9Iz08DTbsS/yMw+HHfpo66Cev6PnoZcVICuDR48p3Yup4RSOntGEg6c22hv413WlkKbXruuH8sI2dA7iVhqVJSsHkYm24P6l7ei3a2Z5tLVRAusa8MvrtuDPD0fwXHuS1NdLEvmXQRsN3KmHTMNFr5iPt71sKg4dR0Pes5ne2xZ7FVpkQM/oaVcih3iG8jyQQqy/E9H2PhT0gdj+NLrpYT3BRfzPu8P49oYQrt4YwjPpBEK6Qzzstnj1RYFpC2fh5FefgJNfcRzmTp6CafRG9TrmcTRku82ahbufWIn7lq7HlCktmEhjN7W5njwfxFNruu0RlemtSYyvj2H6uCasWduF5ZvTaJhAb5Y8mTOxCXtMqaOBG7TvPurxGBtD7W7YmDJ4YuPLpG/oatVlLxh8WbzvlivtZhS9ksePrBUVFUMVBCdqcUJTYAlf2SrEEnV4Zm0Kb77oUq50tDUgZZfCRy94Jd59zgkciAFEByksHU+jZ8XdTOxyAyMhJ+PthhHv4pcEX836H0S1geG/IuU6Eg0cOm2RFDWv3Rihc7+fRgeDG3weW80OilH/lNcpcycKflmlqW3Lw/PKAsJ0ZfChfnhQm7a750Ob9IQmq4yAqKkEo0IaxzvTWxWsNtLlmipWajcoiE6VonExSJOw7oI3ToLXI/tfUBvGE/7ztyn9a1TWhsWzO3aiay1+AnOL32pTFs2S6b1xrHRdBlkaukwBdNjQn4raO0lFWzqUwHXP1+FHD2X1UAnHpGAPMr/hjMNxxD4L7KaSdM8WzJo5FQ1xKg3Wa7xzJA2Dhl2wsdOfY4yh2OutQf0oNhB8FZqLH6FxdTrQXolclJVzkuzgFnWBvLXCmO9BxQOnQSgp0J0yOLpMhvinOTEMKhzol6C+6eX6m3vT6KAHprtWpcr1Op1NPX342/W34NFHnkG+L4OY6GJxGw/WlQhncfq88Xjt5DAW1mcxLpxDgsYT0SgiyqsbSzQXfANoMu9mRsjefhJFKtmMezcP4ts3PoElPTkatBDy0Zi9mSTPRW043IdMmgv+fB3nfh/ikRSNNP2aQiProFxG1UwB4xIFvHzxRLz9hIWY30hZ7e9BmAZY35ILsU4399l/0q13ctalacA7aITp2ela3UBviou0AlY0teKazRlcu2oAGzOqXw2wpB7BGaQXW5/AzPmzcOwrTsA+CxciSYO4YsNmXPa/V+HYQ/fBSUfubzygY4Z+zutf/OFWdKztxhtO3w/zpjfZXNdD9v+4fxVm0JgdtdscNNdpFyyMe57cgLkzx2O3CQmEqejsur7mrMc7pzeKwmHbloHhrKy/dg6CcqlD8boSPYqR/JicOkPX6vRmoIJa4CvxWhGU+yIRUoyuLgW9W259Vw7nf/jz2Nype6Ii5HcBB+85G9/41Ds4YPQ+9Sn8vtXofPo2gL8RDiinm9vvNwXg6paYa/9ePLC7hPjrpytoVZjjikbtaqtFBNqdlRRmbZPkMmG7AKutEt0kYQbM6lZ51hNUZh6MJ/ynryD4GFKW5dnLB0dEuf/cj88bP86j3eAZOp8ia1b/6czykUKrw+Uw6Jj90NagbQ9LuINEefS4aLbNX3vwWfWrZS+rjZV3rBQFH2pTScpvf1oVenRpAqW4qk3EdPs9Rywfsg9axjie9Q1UVGy4rzMC6gK0tOZQJ8PG8cn0R9Cd1uMhpJ8N6NtoA5EEfvZgAX99roCM+kI6J42L4c1nH4+FNHC6Hb2QT2Pm1KlI6J2FxgsjYxh2ZUMXPA0alJ1t6DReRbj++ONa0dCNBFVKi5HOFdCZTnFcc+il9UuxPzm6fJs2deDpR5fhiaXPYuXKtbZ2FTH2wzFNDGax/+Q6nDI1ghMmFDCLWl6f8NH1e05cTgvSxXltd2iqjNJ4rC3PbCKGwWQTekNNuGVFN65b3okbl29EV17Lqig9nwgD5YveoOQuxv7p6wUF6YZ8LxbOqMPJ+0/A8bu3YZ/xjYiluMxiH8IprojNC2T7embXvstHvZLJIdY5AGykQHPRNsDOrOe0urk7jxs7BnEfF3Cb+iin4qO26inDgxhA47g67Hfo3thj3/1Y3wRMaWvFDHpozXE9ohHGUvLl1luWoJ7z5YSj9sU8Gqwk6+im53jT7eTbsg046tC52Gv+OLuRJpXuxoOr89RnjThuL3p2XBRGuJDVvbL22jyDvFz+2Jh6chcQ/qHdLMYHNIrJqy8HOwtFUvjHRbGu59u5EV2EzpTH9NV9t141WJeUR8fYUdI72g4G5rNMkP3K0Fkt/E9vcYgmmvDGiz6DJ1duwWC8jiv+PNqaE/jKh96Kl+07jd7cZtQPdqD9iXsQGtjIsaBA2eThQOY4QBo3TggbKUZr+9F1lvGK1rFHh5S9i6ZhY6QpUpdEuLo0wY1/lsAzPwMVhl6r40P57H825BSl6uIv/ynFytuBV1UZXMuqxQ0EqeGPCz6fg/xTHsvniOQ/TmZfaP18jLdDV9x+zHR6+a1sRWL0AIQzsu7OQBp747FFEUUeZqkQ/GcUVX/QSGjnVwZTNygoLceJ3t+TRmNDwhYeWXtYmIYslceEtiZltsWKth71ijB7QW8hw7IRKsUYsiHdg6dcMmwFdFOdfPb6ATzYkUCeq+Awvf4ZUxrwsfecg3o9KkCPIUblN33yZDN0HhuHYVc1dKZcAtW8kIbOFkZDKO1PrYbO5in/yYOy+qmo9VmbHBeXm/vTWN/bj7S8ecpSD43GyhXrccP1t2L1mnZ7zEJKTc9wFZBGlHVMjIXxuoXj8OaJEUzFFvdCiJgzTI43ngwzr7SAjN1gfQNy9Y0Ix5NI09N7sq+An9y6FP9+uhs94WaamQjymQw75d3xGWU7TYO44BULceZedZgSpmHrpUxmRDsD6YlkaaBosOsKDfasX5ieYGHzFhQ6U0yj7G7pw4bxzfhzbxRXr+zHc70FZLWQ1NwOp033GLVc2B198iE46eXHYmpzG+sO4/5nNmLp6s3Yf8/52HtGIxo5DnkarzWdW3DbzQ9jA+s77Mg9ccg+0+jx6Zp2CI8/uw7X3/Ukjd08HLpoApIFGbSw3Q2biOj9P5xB2kCxCaGWhaKh8z9NZbt8ZRhmTCSHI02sHYSgXBrJnixWM3SRd77tnEtj3uMFrtDw4P4bjkod1JwdsZyfUBLvyBH1g9EEvv3zP+O2+5czRgaQCrAxgneecyxeceRcrtx0gXcVup+9j776ZqtGylpOxyAHWHvheqVPmMe6PZgzign8VaBAqg1dxhZjjDlqlsyhjmQ5nuuXgxzmilOfjdG9n3rGRo68CxRGdtCUJo9Vm9VkSkAx3q94wLYkXHbZnHW682IQLX4eGQN7mTSPLU718twuunvnbiWiiatfCaXieKh0r357OzyPzUhaORdfEowelhc7eG6B5+Y9cjwdPX5+tuQdCzYdeajVsnniuo1dykOTQ/UoP/+snH5Fv37VKvNnqRDsHSTxuPUkTiOkB7yTdVxiDnLsmKpb4SM0EuqlHivQVwatUf2fi9Ooki9MT8SiqKcHoG/TPbKqF11ZXToPob27C519ndhv9wWo4yo/z47abe8JepGkxwXVJ+Y5qHvWRcUz+Hcw6s86UyuU1w8erC2rO5BWEly+ymB6ILiR9cMYoTaDKDstQaCR0rluHXKHhH9Wa9AKSIbaxpj06BVu8lbauADS7fnaZQlz3Ce1tuDAxXuibdo4DGT60NPT49JIiySjtxDBPesGcEN7GgOxelaeR4PeDKJrDlxU6eYXtei6rFU/ZVUyJioke9EQpjTHccr+83H8HrOYmsezG/vtTtE6emUHzI7grMMn4xOvWoRTJubR0tdujwGEUqwjy5BhW/wdpFcXpREObcxgcEUHPbgeZDf0oLsng8cHE/hFXwxfXFXAP9ZksDHFuUe6wqRTuyUtbQksWjgPRx+zL1555tHIgQa4J4GZ4yegNUb6xiWRYX8eW7kJW6jTpk5oQGO8gPrGGGZMkzGM4PFH1mITaZo8pRlN8Rimt9Vj1oxWbNjSzXrqMYkLgnoym8tBm02S8aFLVTaPNf8ZZ4FxGhhFSR+Sd8Y/hkqiUskG7GgY2V7YGnz6QvfTo0voGp3XjYqEW621VMtsAW4Y00ZA0Poqm+6QXPLcWnzp+1di2Wr69IwcHEzj5CP3w7f/+x1oinVSUXJlt+FZ5NvXULh6KcwSaAoMBU5Gyq7geMZOW5auZtHESaWBUp2Mo/5UdoPOzYhJeWt/XwOsPw0+46V0bWKoKivPoJUcOyoj6PjmCQiDU+wCW2CS+FG+0hCP5WnqorxoEW9dLWpAbfNX/2xFxTQrrnrdJFGlzhtT60xkfuX0YVkUp3qYol+fAnvcQrmHCvhKUzk8mnVUZBAD8/DXPB3WpbFyaqpYUpNFzekr2xajX884O4XDqIjjjr0CzJSdlA6Lqi/maah+tc1eSXHIM88qL+O0hZmm187xyGmsuCjSq4xS2Xr87qF+/OyxXvTrEofe78cV7DlnvAxnHneEfdW6jgaxqaHZPE8Hj38jQLIyhKAHNEbYMHi82hrKZcUxtwgb77K4USHYH9UzQveU5A2boZpHN3pYL7y++mOhOJ7zUGvSHnp563tT2NKXsQVMWp/Z2tCJ+5c8hiUPP0VZoFxw/M3Ti+RoaGgUOL5HNA/i3Hn12K8hzYVxzrxDybzkdZBefjhKGeAiKZfk4orenT4jFGmswyBPu8MteN13b8Cdm1OYGe3G5e85HHvFI4inUgDbG4ySMNKiNXGI8ihPLr+lH9FOekydacRobPSyg166S8+xb3/tyeOfPVE8PRBCtkAjLplnBwsh1pUIY/9D98HRhx+AfedNQ3OYXiKN87LNXbjupuVoSEzA2Wceiob6AaTyKTxOQ/fAsm5MmzoFx+0zHc2UdT2g39efweZ13bjlsfVIjqvHkXtPxvz6ECbE2XcaUr3nU5PZl2mNqXfooTiuNhqBYbXFv4fytNoh/eMdlmGYrG9nWO3qr/TX/bfR0NXR0EmJKb4SVYqrsZNeNYZqjCnpJI/D0Siu+PNN+Nkf70B/n1b3FKJ8Bo31EUyf2IK+7k509OoT9fIggCS9ggYKa0N9DPV1Wv/lUR+P2nvtdI06yRViHRWiHgu125C1/80mdbu6buXlPLJjdUwvM9bFaL3TUVsKBQYlKX+OHdJtxDkpXQMVfSRqNGg7xLwu8keG0jMhBKem3EymW4wq0hnbNVba5HN3jim/bILdvEE6tF0huvLMm2Xb4pNdV3M1IEoPyHklLEMZtYnMFKWrLcVbBJuUwZBBNfo5ATU42moUOa47UgAurxsrZ9CUwcZH/1SHKSJHgRoI6aK516JltyOdk2a99UGcUSTjtAtiL+9VOf75vDIeyBtULjZutfM/GdEolbGenaojn+NUXnYNL6l3JIY5tuK51JYzlDkucpZuyOLe1XkMML9RRQU3rjGBj194NvacNpmTnIownkC9FJvl8PpnrQ/H9jZ0QsV5VQEl86ISmLzVPNVQq6EjucFWfEOntl1figpyrBh6O4v9eXXbRTnFuW24AQrq+t4+dPT1mzxnOTc2dg3gnnsfxdKlK9DbnWUcDQf7pa/U6wOk8cEUDpkcw1vnJnBQawhN+QEqfXWojo1qp4jtSs7qosjHKYc0dHl9yiTWivN+djv+sSWEqfEU/ufVu+OEyUkqgbSVy2snQm+a0dbmlh7kN/VicIAeJtMKlMNO0vZkLop/9oNeZgqrslGkKZN6LEbPACKcRZxtzV40G8eedDR2nz4V/3rwacybMhMHT69DS7gf+bBe2RXH365fRnKm44QjpmFiksae8U+s68GtS9ejsXUSTlo8B630CvUhW83C7t4BNDHPjEbOG/VPc4p91s4P2TY0WsZnmwM+iseWFkgqMXRin3c8GlST+22S4xpgtYtu6d37b/s9Dd14t89OBVKJsGrEmmIMIMioajDPZAhUXBSI71zxV/z+73dRWWpYqKALGQq33u7ARiy/FKcbQFOeshD8Z9NEcTQw/oSUCpcAWCmfRuuHH5SPv6pD8DLZ/zI4nmioaWvPy6Yczttzx6pDSVooOLU/HJbDKnD0uP8EUcw4K8Y6beDdqtGBv4zy1ICLcT+Ed84gQVYeM7TMoD/FKzgBFQU6c5Cx8f/0TwKn2mS4RYPllDHVj61CleraE6Se/OGzNO/YoeTE453iivlUs9smYYSatFSjhs26OIuxcZfR9DM5Ov2K1GO9g09KSzcxmUeuJBLXkIzgPW84Ccftu4fnecNeTptI6EXQAsuqXoOncIfOi5BB3R6oNoeCGO3k10KkOsTZYh5frn0EqQp+BFgoylqxnIyTjWlJySAUX1tfBZNWjasZPXc8BB5KJhX6M3m096Sxuacfev+MHivZvKUbz67YRA/vSaxbsZ52hEZLc5ce1WAoa19JOGRqE06ZFsXh4/Ux2EHEaJDsjmLrDnmjl0nokRR90aSxBe/726P4zYosJjUM4vNnLMQpU7hQpiHV5Z38QD8G2weAThoXGri8vhlH/m/mMvvO3hz+1RvCgz2D2JTRi85It+YQmRiO5LFo4SxMmtaGfHICDj7iMOzR1ozGUBqb0lnc83y3yehhMxowpUmeqq5fh/HQM11c3Odw0F7TMGM8F4XRCFZ1pei9rUFz2zgcMncSpkWzGM+FXEIeocbP5EGdk0F3Y2E3uwQQ1L3VpLtWWaxVtssxWlmvBYGuaXiNA5KtyDvffvalkShddxGrfx7RJsw1hGGoEFUJ/rUSq4NBhvb51Rvx8DNrkUrzXDwg1TYRXAGu9jmA9qsyOtYPf81j0C/r8/+sfheU5t6kwJWXAoVAb2Mo0K0vWDx/QzH7HbTgHYfjFK44Cgo0xAo6z7OsHwpWD+u3PvCXQqZVlF1DY93aXvPPQyrP/NaGLnXrQVC2pYfhdaxPihQYrH36ojIx2raR0FpnGVxbfv2qy/VFfAjp1UvKq3QTdvXdtW9pPPb35O0mIJbTMW0Zf8VMF1ekmXH03gbleTEor9J0c4gf5E8an/VbFnRdzv3qPPDnxeuYxFubGgewjQLjrW8MOtbVGo2XjRn5ltf9bCzvxswZOKNbbYheqz+EGCf9SYfui8kTx1n/REOByiShdyiKX651Zrf/R4RvJHxZ3Vqohq2ljwamJBxpW0Vpq1XOgpaNqJTT+lmWUgqlVUsvhdVmdbJtr5jPS7FL10vjCtEYWhuSmMigd01mclnU1zVgxpQJOGDxXpg1bzY2dGxEb08PdLlBI6yH0Ff0ZXHjuhT+sSqHHPXc/OY46jj+UXqOerektsftGjfb1Z3XD29J4+41nWiMhnH8golY2JSkkYsitKUPuWXtGOzhQjQtI5dFHwl8kOW/tLIXl60Gnk5F0KVhYfu2g0QPrqGlDu945+tx3quPwcsWz0eiLok7n+rApOmT0ZrIYRy9slnj4+gZ6MMzpHNcYxMa9LqtaB7TJtC4srnlG/vR2liPFsY319dhrh7sLqSwZ2sU49lWPKSX2qsPnKOaVzYf/HHQgpI/JShG1ChCVaG29BFpfSWmpO4dYMi2irK+ulOO8QN3XDkYizebUjPmeBkdoxyCxwavA4ovn3DDmRpEeaI7N2NGoVy9sQff/s0/cd/Dz0HPvdVxldXSnIS+D5Ye0Fdw+xHlqlyCl6OVTmXTFPoCWptbKPTMx+qy+Sw2bd6CxuYmTJkyyXR9KtOH51avQ1vrBExivNRmVlsQFPBENGHbY7aNqH5Kx5IW9UkrSfFF24U6V7LESTc4hEiT4rVZVlBdUsUsZ+yQV8VJVKCUyihH9foilSOtOWYQu9Rz6RUZdNusIePsTjqRwP/ca8zUmiaNZbBjV1DxFjkE1WkPevJXSkCfrrHPfTNCOxDqr9rXewnVqOiNx+N2p1qCxkzbtv0U1jrG6XZdu6OaPO5PpVEfT1CIpRCoLJhPW6Fa2WfSGXuBr7WthvhPNtM8Q7XBH20LG2+15cgytp3KPDLMjXGOJQ1VjpO9PdWHaF29jaF6obslo+SJPTA7GEGKdPT16Q0SWq2755705WvxXrTb1q/aJo1NNGaH7LkQbzrzGNKsax9sX22yXB3Tmhr1XTeNsRFofRGKE9P/lTjo2I1FbeD4FouXoJY6alYOzGc5a8hucuNBUhRESZoE0kPg0FBeTiVHxkhpI5cxqQiMhZ/X66WbG3ZEuaRA99DD6xjIoJNyPpDJUS7CyNDoLH9+FZ54/Bksf3qVfVVCI6i3+mvOJFj1ng0hvGJ8EsdPCGNuMkwZSzOJi6gEOVEfw7eXduNLd63D+MYovnjK3jhjIhegnR3I6h2UuRDnFmWVOub+/gz+tSmHO7YAm/ToNuVZal47EMmGOObtPgMHHrQnJs+Zj9seWonD95mFg2c2o54C/tTmPtyxtAct48fjqAWNaAilqCvSeG5jBmu2RDBvWj1mNXEpTG8tVIjg+bVd6B5MYB8auLZGvU80S0PN+WQrVIFLYi0YGcQxH74o2YI1gODQao6OhFplUXKdo9erG9N8vfSCGDkiaH/s0Mig7Dxw59V0UuptsEuUp9OuhvIJagPqQR0K9qm6oSuWDDLCbZvKh4miOzOI3v40lW2M7UapjJ23qedbfnH3Ety+chPOP/1IjI+H8fiatfjTTfdhjxkzce5xh2J8JG5fO77yhlvxfHsPzjrjZExtacBAtg8/ueUeJPqzuPCVx9mWRs9AioNDeqgk41T2ptglOJzhGRpQsUIKWgZCwQwAadDEyzGfbpWXgUzIo6C0DOjOKxqMSDQi1WzKV8xQLxPMF7XuhtCtC9tsrF7XnhinG1J6M1kKdZTnyk9jpEnD9u1aloqZaaByJ200qzYefoo4ameKGxonrrBUF/mn62mqK53LI0VFUEc+S4n1UTnoho4k06NcEepaXhcNVyKRRCsXDaFC1ozSuu4ujKtvRpLERpFhHeqdrpVROXDSp2TkC1E0xDVe7Ddbz7HdBA1VhnzupZHRDc3NUb2lvZ+eYQK9OaCLYzyxro75OGFjBazt67OPRu7JxUkf6Xh60xZMqK/H7Ab1kEsTtrOuL400FUksSuNqN7REaLjdIx5mTDnR7ZVRVGzjG+o4Hlp4eHLmKYEoedTItPqGBo4dPULxicbTslhePzgEXyu3MzBaBbH1rctqYNlA/2rvquTUl7XRQGVGKqfGg4bOjZdjhx/nIE9M0NwZyOapM3LY0J1CF42f3uSf5tzc3NGFO2+7H48+tJRzz3/JN8eZZRMsNy0Wxmkzm3DqlBBmD2YoU3kUkgl889lefOu+TWhpiOLzL1+IM5oGMNi7hXJfQC/1xd09Ifx2RTce6Qnbt/Vs94N9EoUhWtK9D9gTEyfrU0V7Y9G0cbbwXt6fx63LV2L/ya04dk4r6iNZbEklcO297chQD5y+VxtlXXOjgDVdadz1TA/2nTsHc5pzaGRcjDNIi9iWOupD08vsv1hginNkFGVJvCxCrPChOb41VJLJoE0I1mfYJpncRhh/PJAMnYnUyDvffs6ldn2DK9wShRnIH+yUUHpWhlEmanK5TSql6rZxuudcdTfGo/aSUj3TEpdnp+8sLZqDlZ3duPPRJ3HQHvNxwOxZiCTrceeTz2Lp8+uw/+6zsGDieMyb1YZn2jcgR6W6cNJ4tNEWzZo2EQ8/u8bcmz1mTkK3PstPQUmnB2jg6P7HB7G6t9P21uuo/EWLVigieYBKX1snSRksKXjGydDJ4EXoXYapUO0ZMV1P1O3vzCDDIZOQ0o0QLKM3gEjXDlCp6gaXehrwJA2seJvX9gP7HGM9UU5A1adtWhk626YVIvSMdNeixoJ1BbfqJFea9BIveVP2IVGW4wJU6wfmyKGLoZMTtYm8TITz2DjQi1U0HOPYbgJpK6vXLnWRbrLL7lyUgZcZ6c6k0MTxkMnK0GC29/RhXEMjJ6waoOFnt+vraTxkVGkMn93USy+7ES3JCLaw4uvX99OANtj785oTCaN3yYbNzBnFzOZ68pvee7IRq7j40PNv0xpoDEn3MwPAFB7Xsd36RBSFujiy2sKiIW7W4wWJmD02kEzQYNYlGOK2gJCBsx6R4dr6lXRpG9jmK/9Lk2A96qDvqLkFniUwDEdw3uyK8Ofr2ILKF+sYgQUVIKaMwBjVR6aVtuMF/VWID8KPc6T4eYrxFvx8HFfNLY35hCbKHwU3k+U80OMBjUks2nMR9tl3T/RR1nv6eiinaZagvDJ0UmYf2pLCLd0ZtLOuRnphulHkuhVdeKIji2Q8gqPm1GNeXQobWO6m3hC+tmwAlz07gFWpJNL6Lo4uB3BOh+gZLth7Di688DyccuLhGN/WjPuoa3SD3XQqn0nUaeMaB/Hc+m7Onzgm1jeilSvffWY3o6uvC8va+9HSyHmgxwk4Z2a21OOhZd2YPC6OWQ1Aa2IQjczP2e/NfWOOHVdDkWe+rvAQOKxgw4ahWE8x+MZPx8H6DDXL0Q6A6CFM/1J/mQ4nIu9++xsujdAgWAbL435lgBTlbwmNhGF9Ksmuk/JQBj+Kil2rI5LEOEkPj6jYQ3T1+/IZeih5eyDygHlTsJbe2u0PPYVZk+px0PwpmDSxFUuWrcdDz6zCgtkTMLMtiYnjm/D4ig1obGpCczyNSfRU6ijIT1PBTh7XhLb6ODbTyE1riqObvdA3mEL02uQ1NSbruHKisSMNuvOvLhq3X22nKVKrK237yYMTf2SUdCzDZg9laquSDLa38PM8rq1A9YX54vR86rRdyHS9eUHXpzRZlScqY8Y+6iOWUebVsbv25gye2tL2qBlBCS//igbRi1cZ5hMDtXiI8VzXHmKsW9/p0jagnqmpr4uhnwZBSqKB3VKfYuS/aNEVQpoALhi1/+8mswQizvq1ranh0e3/MSoD3TlpD+JS8LXaDLOtOhqcDhqtVn3FmP1NsdyNG3oxr6kBzWyrjmOaJolruRIfTwWTJG11DDL2HelBjGeTk7milvHuiSUcfVwMNNBbZgfZhowzSWJbut5mpor1uUnoySSJ1Eo7onGkwXMsYQpplNFT0AJHHm9MvFQh5SmTaGYvgT/Rg8FHpbgXBOyCdbdCcP/5IK2W1/urmf6h2kqw1bJ+sWDQKPHXBYtwGIorplngn42QRbK0dUBGAJzDNHj1CTRxTNOFNOjgobGxEQt2m4fpc6ciVMeFV0cH8int2OgSxCC2UAYf6czg3k4u/goJ3LdqCzYxWVM9mgjj/i1p/Pi5LK5aOYhlvXHGJ03GC3oOjoZp5p5zsPhli9HYPJEL7d0xIZpAW0Md2sbX4+Z7n8Z61rv7jHFo4zxq5HxZ3dmPjkyE+qeOcxz2Ne9IbBAPrwK6sqyvJYLptNh7TklgVpPmhXpMYrQ74/GArl8lBpUEs4HBOMLF2eEQajF0FWH1ul8nQ8Wqh9ph8ON2Bow3gQbtmiFpk26ioTvXDJ3/FLxl1q8dF89rRkl205CBMBKcAPvKuwinOKXw+1IZG5QWKuM9p0/G0tXraNiWY7epk7F48kQsmDMFDy5fjadWr8W8aVMxp3WcvbB0dT8VJKtsaGjClJYkWuhp6MaTKckYlXXInr0aZBt2rUpGh21qW07nuldPrx1yW4mshEH8oM61X303T2mKF/9UVscyiMqjMvxHhUxVTKZrg8z6w0irg2VkyPR8WQmfeaztWl3UVpXy1ZTP9tr1G8zDoGyq020+q03xkVnJMP0pPkmaGli2O5vjcZiBBpgGIEZPLcFf+WLyBhtUlnTpWOMh77Cexi1Lj1VGVu3o0Q4yhoKka4Cu/5m8zjVe7rEAEdA+kMcEelozuErlghjXre7G7hPr0ciZMU5xmTQXA1yJ65MuLNdIuvpIH20d02MYV5/E8z0DVGD02JgeC9NrY9luGqgIDbTe8JBysmxQP7W9LF7aNTjmtYWB8US5GJgm4tyZM3ZxLVhcN1yeALxpMYRK88G1Nzz+hUJVSsr7YxHDQyVeFOHnK4XdMTta+FX5wWuyNDrwR8Ik0zx0QT8e7/V/nMeN9P4nNdSjIVaHdCaLHGWgvrkV0xbMxSwavY4tPejr6aHn52710nOemzI0aut7sTlFWYjEkKEsL92cxv3tIazPJ5AxY8Pc/BmkwZxKffO6178Krzn15dh97hzc9/AGLr7XYI/dJ2EiV2FtdVHMmdWGa294CF0p7SK10ADS5dQzdp3d2EIvcUrTeNKbx2Qat4lNUew+IUYjx3nJdmTgnDakYA4FQRT7hk4/+q0QDPr1jv2oMozV0Pleux3b/w46DlY5QrPbHUPzL9igJyb6tTejRLgKUUxwsurI8awYVxNKstdeVu24toplNMyiUqqqjjTqxhO9LUNKb7dpk7GmqxuPrNmMSRNasHBiExbObsOa9j4sX7cZU9rGY8EUnndsROv4VmR66WEk9Z2sCIU/ZVthjfQQInRxJ8Q5IXQXFxVek5Q0oRs45OFI2My7krHyaJPnpMG0Lz8bk3jCX8vHElplytORsrU7/CwLRVaKQArYhMTV6YyhUvXrV+XF8cR5jKpDOZjmSZHL7/JY8OoeMogukwW77uHl0ZtIUgV5jRG7PmcP1puWZzm2o7JR/upmH7UhGnUDiN4yYu/v9IyHbghy14d03Ut3kbIdpsX1VngZUNaZYrkU62+kUVrUksCUhkas7dVyOWpe20R61R39WTRxJZ6kQY2ynLzGAVam545auOSdWNeA9f0FGze9VkuLEF1n6yP9Nj6kUzLhddWpA+/EeOdItigdaOzENzvlrwUNCduS+oh4/baylh7Ip5MaESxTS9ieqFpbIFGH1WnQqFaClXSHRFDpbSuC9IwY9Ocd+2X8X42/rhVrV6KJ83uSrtWGMpzfKbsuHa+rx24LF6GNi2G9p6e7u8suQdidvpQA3V1sj7xp5uvLpjyX3GghO27iOOx3xGIccdKhGDd1CuUvgflcZOvbefvvOwUbUt24b8lKepH1lO06Ltxy2G/hVNy15Gl09ocxg3knNbvv7G3op+6pb8DEeAiT2cy0ZBitbEuPR7Dhof446Lc8FH8qoVi2CMWVx4/W0Pk7RsFi5S1VS9tR8Ptli6AAFGv9fuDOawZjiSZ34tJ2EKxJd0iYexuEBthDcGUosh3p8jL0v0cn/+vjKP31sWV4cN0WvOa4xdivZTw66AH87fFnaahieOW+i0BnAXc/swoHz5mGzb0DmNCYQP9ABnqhsO6G7KdXoe+Y6aYKM0QSelZf4J8UXZReoRqT4BeZSFqoEHVuceyM+uN4qPsEB+2BdFOUzO3TrzvHdMxoa8s8RfXKr5bp7i0hbjunuA/OX/6zFmWYPKhuY4rfgk1W/dJToYel2+nNgCmnBJR/alOqXEWk2nVXpDVG2HU+z3ipQ7o5R9uoefmiyiIjwKBXJ1kRVcv/ZNRljPWOyvpwTOQzTdcKs1jX34/6hlZ7X2l9pJ6eeR6PdPRgeiTLFW0Em/tSXC3XYRJXyVy/2GJGF/A7cgW0Jej9MX6AY7O0mx5fUyPGsxwXu+ginRndJaq2CjmjVW9FIdXWB9GgG4DsFnL98j9xRx61xkW8Jck02HEz7Lou3BAjf8gzJ5uuj/4EGi1K5Fvte4cjwR9r/3dnIdi/krYlC97hcCilmOru9vOg6gJ1mix4sMOtMaIGBOmsfDOO4hz9utlC+bOFMBfGA3hs7QbqDW3B19k1u/Xr1uH2W+/FmpUb6WxRVrTCtcHjHGc/CrqBJRHCgYcfhJefcBSaxyURp/x39w/gxjuX2vst33jyYkxsyWFzOoMb730e9z2+Eq86el8cNNN5bFs44665aQkisSaccfTumBzOkDbKnG4uYZrtCkne2G5RboL9qsQ0169qGCk9GF/LzSijRcn4lJEelIdh0A0FPoIyNUaoKUmB6WVn6Nzt1pXYuX1RJL6UATwJRFQ2dD4CdTDQP8Dj7b1Y0t6B/aZMxR6Tx9EjyOKRVZvRVJfE3AlNyKQkVgX0ZNnpSN6+SCBvQJ6Jailw5cXRYZApkMC5ymVaRYqoYUkbQBtD0cpBcSTrTjG/rKB3tNAjpHKWkZEHoUKa+/bIgPenCLumJsNGqG63TqLCtmTX3hAxPNaRGULv3Oobimet1h9T9SbAUv6qVf/0n55rs7w6tQPmV2OMce25BP1qO6fAie8e5HUwuvQXYb3GOtHgPFP7IrhtX9J6sLzIdiYyjY4+Zk7WI0sFoRtYMlwFDAykMa1F26kxbOzP0avWatZvz/FWb7pI1tMw0wPVnZq6zqibMPWewDyJUU57cz3Lyaj7E8y+SUaIn6rP3g5DA6p8xhOPt+KNXlSga3RJeqi6TqhaVYtNDuXzjv26dVwOPy0IJxsOxjPvWHDZg2WK9Qf5PRYEaa2MIiXlXSkvN3I9ii+mlRo6Vhrse6CKIE+2BSV0lZCoMS2FP17iqh7u7k/nsWz9Rqzp7UevboBOJNHb14fHH3sKTzz6DDZt6MRghpLBRc+ESeMxa84MHHH4/pg5YxK2DKSQr2/E1AZdY8+jPd2PO+5ZiVR3jAvtOZjfVo92LqKvf+Q5PPTcGpxw0CK8bPZELqSzaM/2475nqaPo1e07qYVaoohKMrV1SLa9w2FwCSONXzB+1zF0TCgRloBMjRGqzZeIF7Whs26E9eBnFBkOWDYDxBO6qYMlaIgkP8qt6mLSfdqao3Hxm5JHZ5nk2ejXGyCX7BSjvBgX6/ijYxkMeXxUr6LADJ28BEvVzRs89wdbQmzq0s71a/+8/5jO+k0RqrwGmvmcQdShMrlgA8Z/xhoFnqiceVQaO2vfEtwWo/vnvDT9qdP85+Ra5/zfiljrHs91pCiqeya6X6uFpKmMa1N9t7yqjHn87UCl+96Sv5LWs3hqTDyQcZIxUzl7+NsfZ1XDeEH1y1SbweHg0fzxiAccT21nqsfik57Lk52OhbXVXKRdsK1l82bVtNpnXfpVQ/arHjna/Wh1RXfr2WiIRqtSbfGcdIo86z/j1Vfrry0kXLxVEpioWlpZHCGag7PL8ZR18c9upiCvXR08FN1BqB0m8X8vQnncsWgQrA/iiU8X05XDl0mX32/flxVXjzt09fn1+vDr8XLz3M/jl3Nwm74OVkMgLcASJ2/bgCDdI6E8zS9jv0yyRQ751Z/JYW1PD57e1I4u7ZXTt9q0pQsPLHnEvrhz4OK9MX1yK5ob6+2ShF48HY9HsYLlNmbrcGBbHZLRDNLpAh58dAUeWrYBrzh4Hxy2aDJSeT0isArX3fUsFi+ajvOOmos6Lr4bQnG2oqvhbpzEUF1qkDSOBtX67+DGfKR8wfj/BEMnemoydLUTWzvcnnhl6JZvH47YIPxyUklF2DahMlIpubvseMIMQ4LudcIUug4Zr2f1YHfm6G0kSvVaY1l5AWopQuWnNOO76mT5yKAzmGF6Ghatspw9GU4GGRk9SuC8K+anINmzWvxjVfarf4KRIf9PlTOfPlnDzJYgulW/Va32VUhCKSNL9ihFeTSI3uakGQR9Oiimd3UqlvWxCsLxU/X4ho+J/OcmmAylNapgtFuywfFP/dKZa8dXusZvg2h3NVgqC1s79qtHFbWN6oyCwZtcQ+eEK+vDS9FYWkpREdg5/4lmbT3KgxRVJr+k3W0D0bMkH/WCbytJ/irPID13eZniq6NPXqAeDdGx6FZmmVbyWNso7JS95YLnObtwo61c1z8xyX+Vkp1bS44Pgq4S2SJMdHI8RLdL0i4B69WRK2LtOJ7rRLTonPnpmbrbJUiBMuuzUFaJG49Bu/vO3RDlvtXnKnRvr+GfnvtQW+qLZJb1OIoZzT/NGROpkLZr3Vg5uL45fnCBwYNCKGtxJnzKITaPAH/OjQ6u70VUaaAaNL89+Hy0hQYJdsPl6tVoiFu6zLByUxeeWt+OLSn2sa4eLS3Nxjt9kUAPZZsMk7e6y7i1OYI7NxfQ3xfFodPq7A0qySTw6IbNuPqG+/Hy/ffFsXvORmOERvG51Zg1uRmTmzhGlFPJp0bAxom0+LISpHkozlDKEycfRZSflyMoT+UojxutwfNE31BKsySmGFGeVgLJpQ/mG7k/aizAoxrlS7Wx91bvi9rQCeqzyLOJbXRSmGQ4XOQQU3yahxk6KUZ6BdYOB9tWwWSMzq2MhJNxVo2UHoO9hotppsSkbXksHtlA8cAZWdXlmvIVYj7LuiIUdO37i37lo7I1enlKn4fBlc8xn4ys6nBeCVUa65GnkKc3Y7fVy9j6E5jp+pilDnTdSt9ns16YgVE51SOzyvxmtVyaUjTyRqH3nwmG2tWZjQVrCgil44vKCXbiiqpKHYl/5KWUg1Jl6JwQS+i8jIZinRVhTBdIp0eb/c8f8d6eK4zJm08gx5V2A5UOT8lj1euuUaolux5LvknmZABRSKO9u8+eE9S7L1WX6tbupuyJjJ8e8tcLAfSatxgNll6KLWMQ9ZSS+lnQ1+/JBbWjRYq9kJjVi++6/dxegUZibW55MmkjQb64BYd4rdr8/glsx+L0H49llBlkyGwsJF9MyRekoiVjSnM8cWUIRuitMdqW9b1HedKg4WcEa6UsaXeDZWz0jUYad9ap7echRcIy+tq1lH1ONDDeKWlXp4P/62OoIzVDJdQX/W+lrf1a6ynL54SScPH2eI5Fin7FqL86L8qUeJjh4G/uT2FTXwp92QxlivMpy8VrhvzSYpd8U98bkhkkGsK4YWUG2WwUL5s9BW1N1B8JenrdXVi9pgMHzpiOhc1JxO2ascaTcqAmyXBHnuPZEOWSSQ/G2hIowuX0FzLu2H6qQPT6eYuZK8UJL6ShG6JlxLxqrNjgkHxuBarOyRXLvPgMnU+M1wGeivJg52s1dFpl5UNRXHnrA9i8pROTJ03CpNbxdvu8bhaRci8UKNhUCpPGj8f0cfVorK/jyu0epAox9OWz6EsN2FbcgskTcNyBB6GOyjFXGGB5mhRdr2JfvvbNy7C5oxuf/MiH0VCnfqcYr7U6JzaFVy+offjJNbj9zntwxqnHYPaE8bJqRrvIlyJt7+nH9bc+joXzd8MBu89GTNcao+oITR/bWb8pg/d9+Q+kqQ/vPPNQnHb4XuRLCpynFCTWwYrSVPePr+7EHXcswYQJjTjmgL0wtbWZy1pd6ZTSpIJkv/U4BK0Ty/nX3KQcZZwdEyMaH/FP7wBVBJnrXv7MHOZquJy5TMou+Ntdn6yjdJIx1CxIUkqqXc26X9suZVjXmccHP/NrPLH0aXzpkjfgNScfTAPF/KQ9z/Q//fNOfPqLP0U8EcM1v/gedpvejKWrVuGc8z+N9Zt77DlNumnqPevWs0pxJBvG45P/9UYcddCeeP27voqudA5fvfT/cbU+jxzkeJOGQjiO1771q3j2+S6cfOrL8Pqzj8CEZB59vb32jOXEtgl44pGnseceu3HMtV0lSJHremGOdQIPPbkCrQ112G+3GeRbhp3TpjD57/HHFkg0Vms6B/DLq/+N2+9agvUbNmLqxIl4w2lH4pUnHYH6OhlUZje+ePISj2F9F/DDX16Pf9x8L4c3h73mz8Fbzj0RL9t7OhdC+jio+sBh5pj/9s8348HHnsM7zj4Ve+82m7S4BYK9SYSV/+Kam/Ddn/wBh+6/J950zkk4YI/ZFE8aWm88q8HPIers1xu/ICQGWtwVFaTrSxCl5ZTPnevIFntmBDRnXd6gnLiFJo2MZFu/0nUWpf+0A+MWlKJBixnF6iYU+yICz3J6CF3fnePCaH16ABtSOayjkbv60S5s6OnGbgvasO/kBBY3NGBeUxLRAg2cXRNmRYK8YUqAdnZUtw/fvtnugZfZeGG5JDE2u4ZgOxDe8chwfbKxsfFxHmkQSisfuxfU0G21bTVWbLCSDFWCamVPLX/o/juuHozXNbG0GBusrNh4LQLtY2RzWZ05wTQ3yD5IpNHm4ProF9aJ0oe3aSmB6KDxVHVKU7n8YBT7HHamvTILg/TwtIeuiaN0Sr+eI6O2QbIuiZ98/RM488TDceQr34VHnlxHb0ICQ+HLR6APRkZjOZx1zml467mvwqK5U2iIYujsHsApJ56DNeva8eY3vw5fuPRD7HsfK9dEkEIGV4KDOOuNH8ZTTz+Hlx2zGJ/9yHuwx9zJzMNB4opanbnh7seosK/AquXrcfZrX46PXPT/MKmtAXpxrB40v+eptbjgA9/F2o3dOObAGfjt9z7OJnpZhZReL/559xL87LfXY9mzq9gfejusVg9TH3XoATjvVS/H8Ucs5mo+ix/85k/4yc//gJOPORifufhCNHH16iakDB0hNpGXf7/5IVz0iS8j0thIxa4be0irPAIqhGyKypzOw8uPOgifeP95mKAVL8XfXsPEYPLE/HZ9qgKYS6PqTjxYnMmByogvUmohrO7I43Vv/x42bdiET3zwTFzwhmNpWLTFSC8Mcfzkin/gE1/4JaLRBG6+9sfYd9543P7QIzjtjZ9EKNGCvJ7a1fY169LKPhpPYu6cafj0Ra9Dliv8D332SmzoymFqWw7f+Oy7cfTiucxXwEOPrcTZZ38KfbRP02e24tLPXISpCybiiiuvxHW/+SPaxrVhy+YuXPL+C/D/3vAKN9aeJ58hj/7ORctHP/INNI9vxiUXvwknH7U/EqRFqsx96b6Ap55fgx//+jr87boHqQzpXWo3gEo5Qg81RK9jv73n4uL3vgaH7TWHXciQH1Gs3tCDK/52G37zx9uRyiRozORtkvd5jWMGxx29D9573slYNGuCPXesL3p/+fu/w19vfAhhLtre+sYz8KbXnmyP4uT07ppYEp/82uX47V9uRYxCc9JRu+N/Lr0IoRwXax78HYtyaKS0lS9v0mawhl0Tj9Cv5o7GWXNTx07hcxzYR7vOHJAB/0jltBzQXLU3EHFBqB0StzjQHHc53XOlTk7cVwRkzCI2xjLy/s1b1or4Y+VIE+vWlrPGyffCjSplVD94omXhAMvbR1aMZrZP3kTzXCjl1V/t0nAkmUeP5iiPxk191cj6OlLzwFoVL9Su8qk+LqKNLzbnXF5Bd4W69sRKlrFyxlbjscvr6rKb1rSS4bFdNmCSFgPK5X8fUrDr7B6srmIS6/QOCPFctFfCCNO4IirZEhfnh0pw/Rot3CwipzTmXtxOxWgM53BsS9nh0A0Fu82djbDuyMxRYKmEkEsinGvkL0VS21EUrlQ6hfUd7ciRadOmz2EUhbEQxcJ587DHbnNs/z6fzuN3v/47Pv75n+CpdT0YjNZj9boOZDJO6JctW2bbpZqCYr08kkK0DlddexOWPvkM84Rx952P4W+33IcB3flFT1LelR6OXk9FvnnzRvPu/nDl33HRhz6Hjq4sa0pYPTmuNrX1pNVRJpPlZK5jaMaSpzbgok9dhk98/pd4+rF1GOylyNI7HOzvR44r05tvegDv/eDnsKbbvRJtbXs3+rvTuO2WO+mZkh+kwbZJSYdWx5Qa8wIef+JJegrkS2caPet70L2mE13rutCzsRP9nV1I92xBe/sm9KZkVClwHDZfIZqyY9Bv5SClVBoUN5Su5bfqYdANRaGYeJkjvbQ6jI3SQ3PX6qiCOL7awqtvbkasrk4F0MO+S//oE1DHHrYXrvj2R3HdL7+E63/xZfzrp5/Gb7/8Hhy77zwcedAizJqql4X3czGSxo9+/3es2NyH9GA9vvXdazBAYx6h93jEkfvhoMP3Ri89+URjHSLpDNqfX4kwPbsevcc0XocY6dQD9hrP/nwcX/v6Zejs6cLK1Wvxxe/8Cs+u7aNaY1l6ivpKxv2PrqAcXYa/XvcQMuEGJFuSeO3rXo4jDt8H0XoqbxqiR55tx/s++hMg1sBuNWLpii34729fiZ//8S4q4zjbS+GIg+fjyMN2w/i2KI16Adfd+iDe9d/fxdL1m6nJwuju6UVvH71UymM4ksAvKFtf+9EV6Mnq+p62eiMYGEgZP7UwUh8UVzJGTHNjFBxDqxF6rD+qt4nQYMbqm1DXNA5JhrrGVi6Q6tmmynGMWKduLLJX7MXizN9A/tUjykV4NNGEiEJdMyLxBtTFG+11eXGOu17jFo01sn224Rsy0qM5EY0m7WHt9R1pZNNRxDgnool6pAYT6OGCtpcLg3SsHpl4E1LM2x9ifD7GMowH29dzdAyREOUm0oRsoR5ZzrccVwi6QaWOXEtyoVw3GEecQddvtcsRrmsAks3IRRtIcz2NhxbPTm7FP3fZwc0n0SmZDbGeaKgBsZAe9XJp4bBkRq8dFA/jlHN9sUPP9pEej9+qx+rSM8EJ0ppkH9mm3mNrN8bZLoXyKmgh4Mr58MdqR0M6v1zvq13F7Wga1Aa5LA2kRnZ8Zw012anyTDr3QzmCaZWCQ/AseByNDuLnP/safv7TL+Omf/8GX/3qJ9E2aSLlI4K586bh6fv/iXv+dQV+dflnccaJh9lLkRsTEpgM5jD90k+8Fzf99TJ86mPvQkNTg3lKD9//MH792z8jxZX3hq5Oe32ZOG0PpkqoKZg2yIzsGSjgm9++jOectJz0BXqHf7r2Zqzv7Ld8tkpl3p7eAfT3ay1JQxXK4K77luD9H/8S1m3q5CSiItUWo1Z7mjecULoq9chjz1FZfge33f4Ycv1hjKeyPPfcV+KKX/8Il//iW3jDG07GfgfOw2FH7Idp09q4+tQLcWnIkknk9UwZeaCJ6AuijrVtmWDdnWs3uBVfKIu99p6Fiy56Iz5y8VvwyY+9A1/83EX49S++gu985RLMmsiJyz/btvFWo2OFjVmZmEqZ6ppcmIYuyxVrdzpLng9gzZYBrNrUa1+otk8A8Z9u7dAI6LqVDGM4ksYxR+6DYw9ehP13m4y9F07GXvOnYfbkNnpXEUxIRnH5N96HA/acYIrnllsew/kXfxuvfcunccudTyDeQE/8Dafio5/4AOsaRHN9PWZMnkxFF0Eu4j4erBtdwlQ6YSlvKuUwFerPfv83PLt0OWUsjMap49HOBctXv/9rZKnMhE7SfvWfb8YDDzxtstM2JYprKJ9fv+Td+P13Pombr/4mvf7z8LrT98e73nQSEjR67X3AL669HXc9vpxthHHk4km47lcfx88//yb88nNvxRXfeDeOO3AOEnS1163uwpe+9TukuOIfoNcqQ+auC7trcf++7UF84ye/xZZebTtTJjIZyiYNEQ2L7jzUqkVj6gZDR/wNKCrJihk+8lxj8pfbHsE57/8Wjnnjpdj7tPdit5PehYNe81F88BvX4vYnN9M74mKChi3EugebJuAdl3wHb3jPl/Hat30Wp77+IzjhtR/E4aecj8VHvRGLj3sLvvj9a6jrx5lBvPBj38IRr3gP/njDoxgoUMnT0OgF6TKABRr/A444C4cefR5ef/6H8cSKDbjmuntwxPEXYrc9Xot5u52BWXNOxKz5J2H2wlMxe/dTMW+P07Bg77Nw/ge+wfGgseKY6Ms87/nYT3DICR/A4yt6qDRooPknw2aixV+97i9LQ3nvs+vx4W/8Hvue/iEsfPl/4eizPodf/uNBdHCeh0ibjI0pdS+kyMsn1nfilzc9gou+cTXe+2UuVK59GM+t6UGOukDGzvQF53SYRvqnf7kX3/7NzVixoZ+yTCMmQ8fxDnNssjT2777khzjs1A/jv795DZZv7uKiVB6vGycFa7sMvi60LDsR2sK3Z5d3EIb6RXCYTFt5sVJEfth2yH4Gg1xc/rBR/V8KS/OCI0ZbPbL2Og6GIMrTisHcVltBKKg258a6S0ju2FYYDJNa6riy39u2c8aPH8dJ1IhCHVdulOJ6CtGcSc046cA97TU9+XzaPCFdx4gmYojplisq8Leedxb222shqytw9ZjGKq7Ut/T10zNLUd0N2q30KT3YbF0XB8h6moxf/eaf6O3JcYVbjykzprG+Jjz/7Cb8/ZYHWYqKkX8yiPKK9PxYKExlzZWvvKpb7rgfF3/y61jyxGpMnTQTcVsd55Ggou3t68FVf78eDz75FNvJYNrEOL7zP5/AJy65APvtsQAH7bM3leXFuPKnP8JPvvMNxKT8tWWkrdu6JLI0BPq8iSYxtTiDvBEGKRGuLPXArDwpWlhMmDIZp552Cv7feefg9ee8Cq955Wk4YK+90MB8g3lqCW0B2V1/NO7sg4I30DVBY2bjZmMXgIaPf/o+WZ7G5Oq/3Y23f/jbOO9938PrGc573zdxxZ9uYz/olaS7bMzNWNPYaNsuP5jFlX/8B95HHn7gM9/Cx7/wY3zzp9dgRXsX2yLNDPom2O+++3F88P+dwDV+Ck8+sBwP3LMUifoCPvGp9+PiD72ThKStn7mcPhSsa1eMYjv2SIbulNSqmvQNhuvQ3RvGZd/+OdcvBcxeMB1veedbMGfBHNx0+324+oab7eaXDfSKn3xqpdxFei9cCH36o9h7/myODD1seu5zJozHBa87Hd/93Ptw4TvO4lIojmdXbcCN9z+BfCKKA3afjq9c/G7MHT+BXgc9GfZ8n7lT8N63nolJ4+g1krwnn1mJW+5/mobN8VZ7cpI0KcUBOnPX3ngXvvCD32DZ+m6ktLNhhkvXnW3muHMv2OsDLXhx+mM98jT0WZs7H3oS9z20FCtWbcSW7gH0soF167px1Z9uwUUfJc8v/yfWdqVp6OipNY7DHeTv3fc8iQeXLMPjT2/AM8+3c0GXRmcv0NU9iPUbujj3Etjc1c+5sgEb6Q3/96e+h2/94GrWrcWYPDEaH8qnLpVJdjtSaaxt34ScPpjK+RuiB6YFIoWdvdGLxnXMuUwaQK+on155nvNJHtp1N96H2267F+vWrMeFF38O69rT5qFr8aM+a/HSkYrjki9egbdT7v5w1W22WNFuwpo1G/DlL/wMl/z3T3DPQyvZLg2X5DgawtObevCx71yFd3zycnzh+9fi77c+in/e9hC+8t3f480X/Y8Z9FXtKRoxerakI8uB+t5lv8UPf/oXvPODX8df/nWfPQgvOY2xD3VcjDz6zPPYyEXyDTffi9WUCbuJRu3ZGPM/NR7A0LximsZVmrIYivB1sx+qwW/P2vRgC+VhQXqN8qR5YnWyL0OhGoI0lhJTqW3Bq7EsdifAda40lGOk+HLUmm8k+OW1l62bMXQtRC98zSpQsVgeDQz/tIXQ3d3Lowg61m/G00ufw/qOXnzzh5dzcj7Awcshnixg/rwZaG5uQirFweBEE4/1xnxdlzKhovLrL0Txw8t/y5VpDNNnjMMHP/R2HHjAXqQjatfJOjNULIU4onkaVK7stErWVp1WedoGzFOJ3HjnA3j/p76M51esp+7U9YgcJkxoxeYtm/DUitV2UTyc2oxPfvjdOOqgxVzB9+CnV1yJo498Nd7ylnfj45+4FF/7xrfxyONP2jww0KDp5hVtI/lCKfrtf52TXntBNI9lgG++8Q6ceMq52H3x6dhjz1djn71fjd/97t9Uy1pxsowXhmCGb3vIHNvnGHX30Z2hAV6xugP3PbgKDzy8DkseW4Mnl67DRq58STSNYdYUj4ytVpEFria1VfzkE8/jz3+5Fb/9w034319cjV9dfRWWrlgOjbrGX9fLJlD3vft1J+D4IxezfIq0Z3D4Efvj5ccdSgWTYdBECqEuQcWapzamd6c2xVB5Qu56kZRmPT7z+a+js2MLDV8Biw/aB+ed/gpMnzSO+SP46td/hBTlyxQo2+Aw4/CD98MhC+ehwMXTDbfchYX7HItZexyLyQsPxcTdDschJ78Jf/jnbeilZ9bb24dcNoNZM1uRTGi8ZIQo17qxieN10OKFaGyMm6z39w/innseo8HnWGshY4skoCFKI5BNIdObxY3X34uLPvFFPPz0CqaRfubVtWpWUKZeHIoKzAWBpahsxQutLDJ42X4L8d//dR4uePPxaKhLoaO9Az/5xbX4wW//jo40echOj2tqpg6LYfLESTjrNafjA+87Hx/iAu2jn3gHeXQxPvax8ymbIXT09CHNcaWA2/cXf/Hb6/D1n1yF/pzmShxxGsPGhgbrbyaTQ6o/g0O5YH3fu8/GBy98HT7w3rMxh/NucLATC3cbhw/81zn40mffhY985I34r3e/ngp9AKvXb8JVV96AdRvayceMfe/ux5f/mXxrZJcSiIYbSEMjXnnmR3DNX+7nGERRT2O55x5zML4hyQUkaYnHcc99NGL/usu2YJOJFjz6xAac/fav4O83LkM7jVk0n0Jdpgtx/uqjrR093bjimn/gY1/4Hp5f10n5bsDK9V3I6iG/XBor1m7CF773e/zx33fSkxPzOdZaZNP71s6BdIxsoB6DcvPNBclEcJv5hYSjYefQwt77MG4NBcrGUBgNlN0P1cCueUe1oFirM2jBEECQaC+4H050BeZXcHBn5PBQTdTZVAcqoGQaEjojPbqrUhbA2OJoTg1Q2el25LXr8PGPfAYH7H8SJ+AP7cXH9Qng/AvehLe89U2uTdPwXl/5o9W0blwJcbX+q6v+TqPZTx2Txl57zMXJxx5Oz4uTfDCPTVz9/uzy3w+NkFaW0bi7HnfKK47HG899DRUrPSYq0iWPL8NHvvhNrNtCBUoaW2lgRWqc+bV1QfGHvpQg7yLPetrbN9BIP4vbbrwBv//17/Dj7/wQV/3695wAMhz0Goxc/sey6rpuvtBt+YqXfZIitoWBsjGChyhk6emm+2l8+1hHGhkqSz2K4ZjpB/2ocu+4JK00BP9UQsEa0o8fGJnN6nMczvNsbarDHgtncjzmk5cH4vSTDsH82RM5VjTLuax9JFZbcbq+osIyP22TxuOUU47B2950Ft71lrPxtte/BvvMm8++yoMmD8MJbOnN4xuX/Rk33fEIO6/tpCgV1xLccPvtsq9I0BuKikehLHq626loOHk5vroWo8cX7DEIMvLfN9yOa67+iz0ekqiroyJK4K4lT6KT3obePbqlYwC/vOpaNE+YiJlzZlrPH3nmKSxds4yGlwuYtmYcd+Kx2PuQgzB5zhzbylpH7+9b37+MfW/C1PEtpgT/dcvteGLNGvZBewnilMYohI00sCndPUg/T1/o2H/vuewODZ0F+XN5fOL978JbzzrNbc+Tbyu4kOvv6KQYOqWkL0w4+RgBTBsaHwZ5zTF9JJD0N7dE8YEL34QLz30lPvXe8/DL730aU6fUQd8+/N0Vf8LTz6wzntW30COj8dpnv+n4yPtfh4+/90x86K2n4/1vfDXOe8VxmNs2gT5sCHEaUHfjip4bdeP7uz/ejC99X9uuWcpsFNOmTrMbNVL04vTh3unTWvHmNx6PD73/1bjgraeiubVeawyMn9yMU048Eue86iRc+IYzcMQ+C+j55fGPv92D+x54jq25hWYun8Dtdz+MJUtXsH56g7EmXPLZK7CyfYDjHsLCeQl8/cvvwN+v+Br+9Muv4vKffBw/+/4n8LvffgOf/MSFSDQ24rG1PfjwV39FA5mk0cvj1Sfvg9/96BI8fP33cd1vPoOvfPxNOGTfGeRLGvfe+yi+9/M/Yl13Fl16zi+n/R1yln3q7E7hqz+8Gj/+3b/sWnCe/EjRWxbftWCX/JToWZbRvHU61J2XQnmLQalDgVHB86qoMaMzcN7JqBCkszYEDJ0QrKBGassRrKIamF6bFQ/SoSBXlypW/nNZ8fKcLrg/G3YOrBs+FtTIsX3FaHujoF+m6O4i30BJqHrTKYtTkyop1aHPxlvN0vSshiqO//Gciu6oEw7Hu9/5djQ31NsE0zUtv5+2UlcBhi09A/jLH2/gSlMGNYLb7nkWp51zIa677V6u9qlWwnH84H+vwEau0rUY08VmXWtiVrRObMSlH303/vtj76Ei5QqdeZ96ejX6uaqVwk/Gkxjf0ow950znZCFdsQQu+dRH8MyzyzC9qQXnn3cOTn/l6VRACdLMfrJeXVt008LRp2/m6ZqaDFw4knceiQUpF/bLjIV6FcIeixfhuz/6Av7+j1/jL3+9HNf+/XKc/YbTWF580ngx67BAuirGi5UyosVgQ+0FK8daLfC/rL5wrgEk2a849TB8/38uxk++8WF88zP/hS9/8r9w5slHIpTLMLPMvRtE3cigjxZFooM445Sj8fVPXYLPf/QifPojF+H8N5+LiRPa2D8uKvj3fHs/XvH/PoMf0OPrT2nbiTTRG+vs7sPnv/BdXHvT7VpMc2yz9IQGqIApIZILKmzx1l7uzbB81QZ86UvfQl9a22YxpNIF/OPf93HF/r946Kl1yHDcCvRmfvOHv6GbMnfsEYfSeDXSM0/j7R/8NH74m99jt/lz8Y3/+SR++IMv4qxzX4fkuFZEOLZS1PNmt+Hkw/ZGHWno25LCRz77bSx9fhPpokdTqENPOoJv//TPWEtjqm2zlx+2F15z7EEI6zESjqqMRWowhSmTG3DhW85gOMu+vzgYoltJObCxIdd0Tcjdys9o0lw+h21cGOWHcCiKOnqBkkvLOqibQpqRiLeibdxE8ou10qBm+gfQ25cix6Ocj26ePPTgUnzrO1fgR7/8M376h+vwyz9dhxvvuZ+0Kp2BXpt2WvSZqFBUW+Rp1pGhZ3c9PvWt39h1sQbySChk8vT60qxV19a4cGSf9Oo3MxsiVNuUrEd3MOvTWvoSx7IV6/Hna29HH41mOJrFx792MaKxKL27FK7956004mF0dHbjwQeXUKhSnPMpvPutZ+I1Jx1nC8sY5WQh5+D+e++BmZMnobennwvnLK76911Y3dHFOZeihzkLn7n47dh/wSw0xiLYY9Y0vPlVx+HH3/okZsxos+8//vWfN+LhJ5+1tz9F6PGbp0b6NR862tP4zk+uxQe/9FN0Zevs1Xo2izk/tZOgtaY/RjY2/p83j4ZDeV0IjqPlLSZVRY3Z7BqddoRGj2ALW2vFQRKzy6BktRFAxTgpcAWvzNaCbUsyBMuJyS5dE5nnnPRaUUpQNLp5Cpm2RKRHbSuT1iDLkwyPZdsW7j4TF/3X+dh/8UJOXm1PRvHQo0vx9IrVbMOINKXtns2JUPB1JxyNFZXKFX/4J55dtskEMkZjVciH0b65x74EPhilAHBk+rMx/O+V/0Re25ZUzvqcENU6DVoKyboQXn36sbj4orejqaWBjTnhliLWN+/0nfNXvPxAHHnQHvZtve4enp95Di7+2Cew/Oln8M63vxkHHnQAy1EZU1kuWLibKSN9lSDE/FkqiY3tPejqJw9yIdBPg6aQtKpWtslkPXmmGRe27+9NmTQRCxbM5Cp8ERYtWmBbRvFY0uiSsXPBx9aF0x83Gxdv7Gz8vDjLw6AbfGRUNJkbmhvRTJe6lQq6jsa5IVFAayMNAcdMSkF91cu29V5OaQApuIefXYUf/Olv+OaV1+KbV/8bP7zy37j7/sc5HiFs6Ejjre/7HJ5a22GyMn1qEu9/92tw4Tteh9bxzUinCvj8576Hf975AFf6rDffh3g2Y9vMkh/JkraaBqjcfvCj3+KxpasoR+Qxvf5jTjwCp9LjPGSviTjt1P3QMq6RfE9i/eY+/PbqP+EVJx2NN591MlrptW/pyuF/fvR7HPKKN+BdH/s8Pvjxz+GKy39L40AFTG/yqEMPtI/pvvqkA3Dyy/aiv5bHptWb8Nq3Xoy3fuxbuOjLv8Cr3vUV/OZP95CsPF514p748kfeRAMzYM/DaVGXo+zKO25pG0cZzeJ1px2JD9PrmkovUu9jtTnCYXMe3dbHz4e701AGBejq6sc73ncJznjDO3D0aefihFNfj1XPr+PkSmPu/BmYO2sGPW99rV8bxzQim/rw699eh//+78vw8Y/+GJd86Bv43Oe/h/5MxuaBPYLAOaGtusaGBM477wzUx+jhc/Fz9R9vxave+mE8+viTNlezhQwXlRnS7mgyGeSJrhEJevZRdAohLoLypOP+J5bjvkee5PzL4sxXnYhXc8xOO+04LnhyuP/h5/DEcyttzg3qi5Y0WojoQfO0zY8773gI557zThx28AnYb5+jcfABJ+LgA0/Czy//PbKUBz2OUMinqDsWIamPqmruUj+EeRynhzupuQH70kAK2kFa9vzzGBD9cV3vjWDO7Ek47RWHoClJPUUj/vd/3ImjXnkedYsMlGRPW5T81TllV7CFSQ1zrxz+fBsL/PlaKbjdrmIeH1qQBM+3B9iSGuNgO02wfcEqVa0ffIylE+XMcNB5MIweqtMZPM8o2f62rmO462q681CTQY8eaC8zSyEcjNEgxsKYNGsyznvra/Dtb16Kfffdh9mT2LR2AJ/77LfwOI2J3qaf1wSQhiCf43GtiEN4ZOnzuPbf96Orj0om043LfvRp/OQ7l+Bn3/owfv7ti/HKUw9Bop40JJrwj5vvRAeVpT4CGWN57b3n6FFmUhkqc+CcUw7DW8+hQmytZ/u6HpJHsj6KXI7KY1YbPnjhudhzwRwqkEbS0orfXHUb3vaeL+B1b74E9z3wLMmK47AjDsIrX3sGlTXVB/ufZ79zqXq864PfxBsu+jJe/56v4NwLFb6Kb1z+Z9KdoXGdQB6RV9RJTz+8Ap/575/gne/+Ks6/4Mt4+zu/jgve931c/tsbyFN5aI7PxmvxmTS6X8d7479eIF0WvIJDZRV0boFp5nlzeV5H71l3lzQ1tJg0R3LyDFJU5PqiNJUKlbspN/IrXcghojsHpee4mnjw7qX4Nlf/X/7y5fjaF3+Kr3z1p/grvbRcKIc///NmPLN8LTiMmDmtHl/63Ltw/htPwQVvPBVnnf5yxKN1yHIMf3bZVXju+Q2I0ch1rdlI5UJlxMYyqTSWL6dCfGYpHnroYRpG0kPDdNEHLsDXP/8xfOni/4fLPnsBvnrBq/C2s09FpK4B6WwEjz6xEpu7evDON56Jz3zoHZgxaTzrjNMLjOCu2x7Fg/c8joGeNAoDfTjt8APwvvNeg0KqBzPp6V/89tfhza85DXHyRjea3Hbrg/Swb8fS51Zh3PgEPnzBGfjM+15DFvZSKeaQTJBvej8sxTucDaOtoZWOUZ5eTw5nnLA/PvuRt2H2xCYalTTnQsjuLNVckUQXx8UzhAz8r2zOa0OUize9UisziN7NXbj//kfw1FMrKKNMDmWw3+L5+PSnPogZUybYQpLNK8EWd1OnT8SxRx2BV55BQ/Pak/GqM09CHT0fVS3DHNL1P8p9rLERbz73LLz/nW92ixu2t+TuR9yNYxx70aZr2nnJnp735FzO6zooFz2DEXmuMsi6t4o+Jed8Z18vrrrmH7a4pCBhCQ3eBz/0Fc7dp1nHIB7lHNbuSzKZQFtLAmHW2dOf4WLiH7jj0Uex+NB98YnPfQTnnn8uQGNU4PylY41QYhCL95hrW8fRSAK33noX+nu5QGIzevZTu0J56peOrj489MAjZqgmjG/FonmzSWuMclmHAhej48c14Z3nvRLvedsrMaGFiw8K/kD3gMk/uMiTvEvt6NKFDRZhY1WmJ4tjWBrvoDgtBPRbmh4cYy3jxT8/8N+YITq0UPePXSgucBWK9Phh6xAfHbU7AJX6a3RuV4yuww7FvKInyMS2CeOR0AV31HNiJylEzTQeZLQCjV0mk8LCvWejQKFLJBuRjANzZjZzpfkeTNBHXaksHrrrcVzzhz9xwvbTjmgR4TyOKROmUhBDuG/JUjyxdDW5X8Dxpx6PYw/eH/vvNgOL95yGQ/efgbeddxLaWsdTxpqweXMW9z/yNFqb9YLZFpaOYXxrG3LpAa7kMmisG8R733QC3vTaIzGuMUmFFcXhB9Doel7UYnqdl//wMzjtpIM4uRo5iSeRnEnsWzOmzJmGr3/nE/jjb7+Dpqg+bNvNic5f9lHblM/R23novsdx9x1LcM9tS3DHrQ/j8UeWob+/n0qzkeRTI2UKnKh5PPH4atx608O48bp78e9/3okbr78DS5/Qs4GUAvFYvGbQ/zRtJTxX4H8Vgis0lEenfppLwKSmOM4+bn9Mo4c7b0ILV8dUYAVdKyR/cn2oT+TR2hTBvOmT0BTnooUKsJEGZc85u9Hzq8P4ZAxtdTlMqs9icmMai2Y34wAqogK95v4tm1FHw982PoQvfOoCHLRwNqK0evWJAXzowlfhtBO4IGF676Z2rHzsEbTFW/CBd7wF3/36BzCBbTbFcujevIqcbKdxOxOHHL0n5u+3B977nregkcosQhpjWXrnuQwuPPtlOOuVh2BKUzPiVMidHTScVFins8zff/kZ1vsqLJg0DpObqFhbk9hnz5n46qXvxuc/wbpIj32iiEZiEr3797z5NPzmx1+id3cgjV8rZk8fh1edfgh++pX34M1nvMyeP+Myg3zKYkIrFzp7TcbMhix2m9aCevJPX/cg82xX4JB9ZtMovxcnHjIPZ51wAE592b7kgZ5XdOPh4I2HNyb+r5v/HDvqF6p6iqO29wqY2BbHlEkNOPTQPfDVL30Ml132LRx6yGL2gZLhedr6esDiQxfg8p99Blf+5jO47Icfwg++eQk96jeSL6SfGt295o7TyFrR82QFvPP8s/CB976JY9bIWM09ZfAoEVnsmxauCvlBLVijNKh1NHK6CYielbbrafHueegp3HXnk6QpYdfBl63txM13PoPnlm00z60/O8jF6t14+tnlOO/VJ3DeDdDyyiA+jU9/9qt46OHHceTLjsZ73/tfpE1brGEusOQ1RnE8F5azpo2j0QMefWolPvXdn2F1ex96B3LoGkjjkZWdOONtH8LaDT2or0vg/73x1Tj0oL3MOOvuXS1EtXPTRgP37re8Ghdd8DqMa9VNN1rAsT/sIx068zYdh8YKv+xW6jD26j8XNEdH4/VXhtr0gxA8D4baEHrgzqsH9T06KeNSSFGOHeYmV6HDV1yVYA4QMXpm2XqmBH4dJb9a/nhus+CSSC8FOhNpwF//+iBuuP0xzJ/TjI+95yxOjgGGLGsv2APjz65pxy9/9S/MXjAb73jTGVxA0YMIx/CvGx7Aj/73akyaMgVvedMrsHjfmVwZDuCHP/gdVqzYiHe+7Swcc+heuOuhJ3ET649EBnHc8QdiAVet9k4MTlR74S89pW9c9g/c8/BzOP7ofXDOK48xd/5GvaqMK+KTTz4Si6ZPIMXadmLgr55/u/W+p7DiuQ14x3mnUekNkFp5M1wZiy+RJJY8sxaPPk7FSy9u5qyJ2GPhZBo/ml56T5o4utv0/seW4957lyLK5bauYzi+MY2TR1u4++67CC8/fD8sW7ECf/vX3chyVS7vRWNNymnc04hzMieicRx84J5YvM8cJkjh+OPtjFw5dC2hHP6Y+dAqVXQKxTro5cbkgTMvlbPSOdUsXUfa5l21tgP19S2YPWMiYlo1k5zNHVvsbfWxuqjzaugVaitFW1YJKpM4x6Y3ncPqLT00JI1cpNRTgTCdhIrnUfIjxUXFHVx162UB+y6YgRau7rWRpTdrrN/ci56+bkyZOpHGgwaW9GhxpMdC5EXIKEXZBf+NFlnG6xrsuk1dlKc8pkweR6/WmMsanaxGOW565i2fz5LmGOXVeVbkivsjD4pvm9GSKkplru3dDGJsTNemxBN2wHJYWcqNaummt6nopjoq5IJW1OZWWZ32SAy9K71YOq+H8m2rWHlcPfY2D8K2otieyrjzEHozefzPb/6BX/3yWnp03fjcpRfjtNNON9rkIXKg+I8UcGzjLF5PQ7/HEW9Ax6YNmDylCcccfhCmT55sN1Yl65OcWxOw7+6zsHDmZCylkXn7e7+A5as60NwUwxU//xb2njuFfAvhL/+8DZ/74nfQ3tFBbzRHw9eKS95/Pl5/xjGkj94p+9eVGsT5F38T9z64lPPwALtWttvsieRHA152yrvx7MpeNDaGcMLJB9HbnMbFZQ597MO9NIJPPddLujvxmY++FWefdBh+8esrcflv/4n23gzHucDFVQLTJk/FhhUb2Jd2soUL5IVz8amPvg+H02jdfv/j+PCXfoiuPj2rmMbkVsrYpBb09fRh2bOrocvK41rr8c63n4tXnnYCF7lxPLJ8A974js8jk+vGEXtNx3e/8AG0NdWzf8CN9z6Kz/7PL7Byve4yDmMWFzefu/g8HLj7NK2nDW7OaF4U52CluehDb6sZCUNiRsiLY4w7IeytLB6q1x9Mc3O2iGIdru5A/cVDojTNtx2C6tOfELr/jqsG43XNPKrd0JV20jvwUGtaNQTL6VCT2Ed5nSPDlfRRrjSDsOfDhgZLSiVMha034MO2FHxeaFWmp43IQXuwNsQMyThXUEqjUGTtmp72gPRyYfFTW3QUKyq1PDVOggpVb4LXytUUM5Vmzuq3/wy+ws9yskrMElx9K79lYRn9iFQnFD5DJbiMZ7rPH/ux/5SgAi5C+WyLSRGD7tqJFJSy2jUwHfjtMFgZV5jzh0paq2MqWk0W6j3XD+WwLMqp6wIyBkVah0AF6cPSXLUGTdaRoKumQ2CFfh8F8cuqYWVOsEsaZHDUO2rcBFesIpWiPnvEl8HVY3LBBv3rN1L6inPjpBFyZVW/a8Ody2MSdOZxYuhc13sFF+PSXAxBeqxu66eLF806MjkwDOUugeO5q1V1Gu0ai6FyPPe8Gx9mlJjuuOTyuezuWJLh+K3/3LjaoWRGxyVwPLJ4b5C6OR++8cvr8Ocrr0c+3Y4vfeFjOPa4oylHuslFNyuJpJAtQOhcoa5uHI447Z1YtmytpVmbokLNkjetLfW4+N2vw1tefzw6aVTOectH8dQzm2iQEjSm36QBbDZvRtt899y/DK9//fl2TWvWvKk0Mhfi2EP2YP/0ZYIIttBwfeyL/2t3055y4mH42H+9AXOmNuOq6x/Hez7wvxS8EE4/aV987ANvwcQJLSSFC8doDvc8sBLnf/BHSGe68NrXH44P0YMeH49hTUc/Pv21n+C2+x8lzZR1Tu7BVIbdzKK5JYF3v+v1ePPZp7I3GS46BrGqYwDv+uiXsYyGmoJo4wwuqENcHCQiOXz/e1/C4r3mMT95wE71pMI45rQLeBbBy/aZgh995RIuysQYLVXyWNuZwf9771ewbE0n9t9nLhfpr8MeM1tZ3jNsNs42CxxrieArwBSvee0jOD+t/EjwZcKDX65SmZHr8fpfA/xre5VRpF+1+WeRd7zt7Ev1HkAJbilGbjTQp7KTUaRVQyCjDouTlxhVJcXMwydlERprx2Q/0MhxtEzAfEXIYB8jtRya8C6tQOOmj6za9S2ex9iMtkBsi8Qrq+0QLoiZX/VQKBUvseK5a8UhSLHudrT3RzKfaFe8dFSxG34pa4JQop0OQeUsTe14IVhOMNXIckpS8WBwEA3u3N/CdXEuh8paUBx/jUaL1/8uzoeraQRUSXJm2MH0sncsDE1G/QYbE0zZWg/5I7oF8cE74oHfD0dAMDhYP/hPNxhYMS/JmvP+Vwj+71JcIy67H+/+90s5uDQ/hzOgPPIyuC75dbnfkWBZvXIq48t8sXYPPp/ECJ8ZhkC82iJzdVRkK2viiT+OvkwNBY/F7pz5VEU0ijiFf/O6VRjf0oSTTjgaE/WO1rwe0aHHWqAXri1EBr3YWtfQOrv6sKWjFxNaWzFx/Hi0NY+zywKTxjVg5rRWnHjsAZjCOlRvd9cWJGODmD97Ek46/lDURWk8ZSxYl7YHjzvmcKxcuRp7774QZ552DL1GbdFzrmr+8S+TSeOZpY/jxCMPwBGLd2NsAQ8/ugorVm/BzOmtOOPEg3HIvvNYXz9pzNCrHcS4hgT7lcSWzm4ce9Re2Gt2m9GvrfETjjoQ++6xEHrtWVNjI+bNm4ajjz4Al7zv/+G4l+1FW9lHBuXoZWXQlAjhtBOPxpTxDfay98kTx2Py5DYcfcT++Pwn/gu707uMMJ8ev9CdqfowcJzu2YSGKA47YB4W7z2fiybpHS64OC+TiSgOP3QvgF7nsUfshcV7zrQvb0imNBb6Tz9BUXARPkpOSrJVhTJKSPhPd6TrRQGSgR0FX64ro7Rd/yx0321XOo8uLK/GizX4imE4hpQL4S3chlBrWjUEy+nQTVSH8jpHhitZDT7DzEsbATI2PoY8ugCUbLX42zc8F4020f2y3qrJ3p5OAXDbVczDoDfse7msHnfR1KF85RIc4FoFyeUbIa8xc3R1GgmeRquW39Fa2rb458O1HGi7eDgMul7ow3jrHQvOMDjYFkqgHkemIpjJGwvnzbrT2vrrKvQNXZDOoGwoOtgf+vDekeBSffgenUNpmikl/TFPOU/8LaEg3dUmvWgWSnIEPTrrUJAWB38xIya5+hW8urz2ho8XI0oiyS+Vp3LW9mlvT8oeH2gZp3dcMm1QyxfmZ32qUr6+tkDz4RxS9Fza23UnIwuSFl2bEk1yquuSUbS2NtCg0c+nkWQKPSsaAj3GkNDbJ912r5s7epk4aDj72Z6eL+WCXncWaa5y3ulNQBl6nBs2daClpYWGOMF8BfSlQtiwpRvxZBzNyaQZGL3iTeX0GIYEq6evgK6eAbSRlnicRpOuvpYAZj7Z1oAeTWJ/6+v0gVa9G1OXEXT3jco73og2/e8ep6F9ytLwMrQ2JaGXwYULEbsO6eCWFzkavRzza9tXjw8oTvzTtrq8upyYrTZIq24DUluWR/KkoJoU4cPTTYKlBmW6eGhlR0K5LATLlWPkehx9tWAsHl3ovttp6BKjM3RBVOvUzsBIE93ICiSVMlEJmmCVywYRzCNR81ezDn6dwTgNQhnvPCMYNGJW1E6Dg6bIIp2l9FFgRxhgp7wrj5c/Pn7/g8amHP6t1g7BttV6kS5tlPhwHAmkBYrpsJp81MJ/IZhPx256+yj2RxOupDndLGPgJPKK+HwI0lV1gmkfTC167Tq14cPxy+7oHIZyXhbzuO8BOki5FK+rEYExKFcgJUqpLK0Snyvx17oTgJS99V/Bk1NB1ZW0wXxBlI5BEcVy+s/l0faYSLd4haED96OXMbudDZkt1UCwgOiSbPlb7eqP/25EGw3VaflV2lPolG+Vsz/1X/XrP2bzDZGUvhsC+4//80/j606NFfarEkNteIl2zBgvj2Dp4k9IhsWjy/5jazZmXt0KirZ0bX+7CHmRVrvilFH/9Mt0xyrVQXjj74+rfn3euEJq3474K+pdPnd5wcHxJiibRVSdB2NE7XWKp8W8pbpO8cF6aktzPXVpL3pDNyLYl5FJU0dLOjsEX4gqIbjN6IqLR2ooWEaMZrwxppSCEkPnIfj5IJe/WKaUllJDVypAnrDzn0r45CiPHQaymqGzrMHyDnorShEun6A63Katw/Dt1kAaI0rSAs1U4201BMvp2J/ADgGeBNq2oyFDR5SkEZ7S2CpKDB2PAmPt3xijBEvVPy/Z9xwdFOklEEFDJ6qCYxEsp9hgmt+cxtUnY4g37E8t/PUNnepVX2S6WaHVWSKzrCrYg3JDNyJYztXg8htFVq2ZLP7wpKQu5XAKXdn8PhSvK1JVBZS5ki2PTslHvaJNkDF1ZV0eodKiy9VSnqYyihAfeO5X4Mm56HalBJfHHydLH6LV5TI2erz0n2ErhavLlyX3IWYvTm3znxsPi7B4waokbF4zvkinT4szdILPYctLD0+/lmS/JSNbM4L9DMKnw08vP68N4msx//Y2dMES/6cwKh7XjEClfgPD2hkp3kWVh7FjeC3FKRFAhUYkACLfuuCFYUIZOFf+IErPy8u5CenN8x0Ao37EP9fo8Ia3Bymu5mBbHngo/ulB5bxuTa08EiPCcrN8qXEUKlHtxTliikE/5WNYAT7tUu4uQu365Yrla6iqIorlvINAPTpUuqPAO/f/XMIQRJ1Mo/v1Y1x5d+D9BuD64dU1ArxeV4TK6W845DmpXje20uMKLq5SfkdHdfiUKF8FqhTN5lS9H4bgHbu2gwlenJfZ0WeHBjsvy18rKvfzxYOaPLpqnbTVkHf8YoG/Gvbhr5SE2tL8g2Lm4upqZNSSpwT+No2Vq7B1qXGxsfGDQ6XxqhRnioTRukYg2FbPCKhYvkL+IL+EID+rplVpe9R8q4CxTtRa6HLXwqSUGby4alvE8mhEj6PJBaeAFKcMDtVoFi9LKAtsOw7bZgz2IZhvKyhpP1CnUVsymJXby+fz9CAD5UrqK6GeNcp78vPqKLi7QFQYB9fOyP0p6fcwBGhWtkDe4DyzbpJun3T3UVZFMUJ9CHYpuO0ciDeU893SWb5sUlSnuRwq68rbR2KHIHprH2cf1eStGsppHms9taJaeyViZWPk0oJSaG62H/6vQEwIhu0D1TP6ukZLQ7lhGAYOuJSsv9RQ/pKbM7bSb8XbnaFef4L5y0MQErTRTcito1I7Pqql7Whsre3yuVIrrT4PFbSlrXFz12y2Pxw9W6dpe8HnwYhGTpCwlgTKobbwLOg4kCbopyxsTU/5dFQKo4HJepCWIZSdB2ne2lAqfVh9o4HKFstX61952kjh/zKCy4D/GGyTfJXAFzYGCUpJCCQHEJT/4nGFjMOg3DRqpjwYmF0P+1JEvdW1+7X3/1ldfqiCYcnlZUcIfh8rpW1TECrFKwjB40oI5i8PQqX48jAaSEH4C4Uy2NjIW1aqxk532+laiX/dR7cgyB8ZRJ516JpR8LpRRQTli+VK/gJJgVjL52IE938tsCacNvZCsS47LUmrBr9cJQTqFDc8Qzf8A73BfGVBP2NCsB4heO5GxoflkLHz4RchipwORBr8urxQMkDbKwSaMHpLInYats1IjoVev8zIZf0R8UNx67LsgXH/Iq9QrSPyJrYm6i8ERqK5kidSsoVWVqxaWnUU1xDBNnWkc9HnVorBSc3zoQY5UNKNVIx64dIzy9fh9rseQSqdxYL5c3H0wfuiqSFGmtwXAkrq8SaB44G1aNFBWPuWXuxUtXGuhEq8HA1GcmAUHbxxJ8ihkfoj2M0h5UmM2lq/gqs95SxuoQ1HsM962ERwcQxDc8iNrQxXe3cGDy55FqvXbkRdXR0WLJhnzzdFwxxV7YKRNj2KYLNI1QS8lGF0B26uKeddNdn071QcHVimRPiLoyDD7Yz3cJQPQSFYbtiAl45sKYaPioPqqNy2MFqZ9PMPlSO97liLSb3vlvMwWGVBjwioL+5GhyDbgw9fVxu7aqhOP+v0B9qICuQtmf/SL97xLo3y8R953gURtE1iScldpd6h26ly0Fi4N6Mkmpm/tJEXo6Hz6ZSwjERzJUHKk+F6y7y+HVauMHzGGbNG1dciP4Nt6qiEhqCAKnVo0EgIV7ed/Vn85Jd/xm//eAMQr/eSwmhONuBzn/gvHL7/LMRDORZzE1DQm1iKsBYr88OuKVTm0/ZCtYkbkM9SqOveoeDnc3X5oRLUl8r9qSbDMqp+ja6G6hPO71M1Q6dP4dz38NP41Bd+hHVbUtAb9m3y0fotmrsbPvfJt2H+tBaEC+4tM36dQTqH0TxGQxdE7UaP+YKNjNHQ6YXORSglmBqU03IEx8CNShEjj081easGlVPQFyfSGbWll2jkEIu5nrrr2Dz2FKjGZqcbuhF1hdobmc+1X69zPNh5KKer+rzzMWZDF4s3MUPJi5ZKKyOGDZyH0Sn/4RipXh9bY/zWyo+MYjn/OShjSFlvhnho7fBkhOaG01l+7qB8JW3YoV9psP4Q0vkwPvLpb+K2+x/HYEyf/PduSGEdeU7I+TNn4NMfegv2mzee+WXovMLehHO8cW0Nsclr2tKsv8E8fqbq2C6ToUod5SlGoRfp2i7mCFLs+lJEyRn7NlL3SnV/aS12+30ZhvrvWZehMfVuYtA3266/cwk+/dX/RZe9Ei5KOZJ34BCOxHHoXgtx6QffgKmtejQ4YOhKnmUkAsSUv3vQTyohfyvwSXcg1dUKBw1dAIp26r8CJFMBRvu3dzuUlwmmbQ0j9bZ4Pqwv1W4IKoMuCWzo6MWNt96Pux96DqlUHo1NSey312445sj9MWtSK+2Mdk/cPNNc8f98lNghy+MdCjUbG4fKc6yUX6XyXJrGGrxf5StPKz/3IXkIthvMV4mebcXINFdDOWuC3RvJ0EUuePvZl2rilXeyvDKbzJWCl74joXYqYqTx2ipUMMgdHnvcsqYCYehQ/40w8YURaayEYXmtBXfoQW9g+eXV/8DVf7sDiCXZtAwclQiz6bmYAqLopRJtakjgsP0WMI5enbsg5FSzuuO6ZBhqYagZX1UNRdSMUfW1Cnz5KQ/lCMaphOOBC4EuDsVVShPK0/1QDe5mn7IyHt3uLlUG79f3DDWf3vCuj6M3F6Nnp/IaEXl7NKLMo5c3p3NhzJoxCYtmtjFe46qSzMEx9GodFoJKVfDjxwo1WXUs/QYsi/oQiLC4SigVvECJUYUS7VUF1gf9utNS1GrouBC554Gn8dmvXoa/3XQvlq9ej7XrN+L5lWtw34OP4e77Hsfee++JyfqCu10q8EAafd+2PLi0wPkoUXlcgjWWp4+cZvLqBy+uMlyeIirNoO0Jn1Y/1AZHYzEE++dTXD5XODc1Qd1NDvZ2eC/saNiKqEZh3pkwuqhsKoXhA1/E9uyP6tGY6Lt1hUid1vuKdYkepFTGRebgAAApbUlEQVRzuRx6+/rcIJM+Tesap/YugbHwS2VKvmPn8d1CIL48rcrQbVeorUw2g9SArqzGSZN3A4poIDhSPAbSgzn0D/TZOGsvRRsoZZsoL2EHYEgefHDuPPnsKvzwF3/E08+3I68xo0deoPFTyHB8nl2zCT/+9bXozxQvD+xoaLtRj2cE4dM+rA//RxA0WNsbbrmq/8S8gHLYkRht/T5Nw0KZ9rIXLdt2ktzW6kGC5ILqsu5bMF6UhNHBp21sUFnRp98c9tt9N1LgvRaJ8XpWJkTFqa2hSCGNyc1x7Dt/GkL5wCqT8JW8D9tq8oJtazJ4u26GbaN55yPYH/XDD+WollY7OB7BiqwyF6dDGSeLdpltkoYjYbRNnkieUlEpjfzWKwttS4/jqM/zzGxK4NA9ZrKqUmUWhMZdd9G6ILl44eDPF9dZhgCcV+OHnYttll0WXb5iLZ5+dqX1S13UkrEoY2HzwB9+7AmOgSKUgWEHXd92/VHd7osZfv+KIai7Rg6S0aI+rBXK68q6EEQwbax1Vi5Xybj5cZXCWOA5AGMrPCaMhkejRD6fo/yNrDh8UF4CKCXIpYkfO5EnJRABDFSS577qGOy3mz7Wqq1KfXNNL6nVJCygsTGOc884Cq8+/hDKUBVl+UJ1Ywdhp/fH2vPGxA9enE9KOUm6SeVrn3svJk9o5MTUrbNRRExrcqFCxblgWjM+ddG5mDO1jYVVp4MUWQlK2t7+KG+uGqhi7a8SLUFDt6No3d7wDYeoj0UTiMYauP7TZ7SCQ6IBcL7Aovmz3bf41E8rxzCUb3uiWOnw8Rldg/IIndHb3hhrx3cIw2pC5F3nv/7SSLSO41luNWsjyubiaMACwXaK7W07KtXlBlp9CYZylLcfzFcs796YUButI/dpa/0t0ieFeeABi5BIhNDT3Qt95XT6lFYcccieOP/cV+D04w6lt+BtpwSqLJkgXryvRGujvjq213gJo66rLPv2o6QyKtFXjHO/Q+fksY7E6UkTmnHUgfuhPhlFOpdFsi6KPRdMw6tOOcK+AL6bvjBNcZIaLSrdMpQ3XSHLtkLN+iHYVxenBiWv7lxwefzg4AwcZ4p2C14gVBonY/AICPI7WZfE6vWbsHzdRvOc9b039tr+tLSc3taCC990BuZMa7SP1xZ7TASarUBBTSjVUQ5+fyql1QIVrzRWW0MlNlZG7XWWYni5imNXBeVzReWH4ryq3KKsiNCDd10zGIu3WHSwOf+rwVvDqDzjMmSzGcRiuhGGlQQr4so3iIpKwKD4ymmuzEjlyhFsr7xcMW34eIw8kaoNXjBt+LNFRbgkDhknbDTiPsNfsG/fZalUcvbmCU1G96HToKIZ3p9KPByZr9UxWsGshu1ZVzkrxyqbtd6Cbx/XHAnsl2rR3cwaP133LnDc7AXY/Ke0kgnqoeTcOlA8fyENyY7GWGXRx9bliLweKU8hgnWb+vDVH/0Kdzz4JEK5BL2hNItksedu0/DBC8/D4kUzEaPR0Yd3t0bpaOfa2Lwu1VesM+Td1evaUQjWObKeKkV5nbWWM2l2h2NApbEbqzwEdYDq8A3eC2boRIRTKJrsmvmBioxaR031DistmF48dsWqlQ1iuGEoopg2fDxGFoRqEy+YtnVD54Ed8teRKu9uUKEy5Y/etaHflwydd+DhhTR0rluuHsn3oEaMkQr+1wvsuGwMSs5fMnQ1Y+tyVMXQ2fzQV/0H8cSTz+Dhh59iXAF77LkAey6ag+Z6Lsa1UOF413LDUO1zzbWr39FDZYLlIrZVGYlIJhX/kqFTHQFDd7Vn6NwK1MfO8OiKYCWBiko/Y1INKhMoN6aVkTDcMBRRTBs+HiMLwtYmnp8+WkM3VC4ghNUMXXHrYzjGKkxbVyq1Y3vWtSsZulKQkCAx3o6F+l4+BiXnYzR0fh3bk7c7EmOVwyC23tdqho40FAo0Yt4c4/BoYWLDZokRFOgxSScqfWuo1p9g2tj1laB6gu0EdVG1tGooLfd/ytA9cKcMnR4Yd95BTRjjyjLYIb8jleJKobhg/MjM152KY0M1ISnC0ToSk0rp2vrEqwbXztCg2YFv6PyoQHskN9iav0gRP6sp+7EK02j6VmJ8PLkJlt82PpVirIau9reFlCJIuzc63lkRQQ/Ap0frOJ9WxQVL2TfFPNhErbEPuwrGKlPVylWTkSE+enlGHnOlj1xPEJXeMlKkoTbjNFJ/KsVXM3hq1tLtIEi/6hmZZ6WoZrCCbbu++ihle2larXwYjmq0jIRqfS2lK+igidV+KbZa0puqcBOvVuaOjGAdfp1jqVeuuvsqdu3lg+354SXsHMigjNWovBDYmmiUyFDgeMQ4T06rxb2EsWN78U9GrTyUIzhmlcL2xYtnzuyqCJjXncPM7SkEkbDIp2CZp/CfqyReLNNAQ7/ddcAOw+i4Wqlbw+JqyvQSxgItePXcmWzS9jc02wtjo8uM7UvGbpvgvetSH16NmJD40F199pYUMdg0lJew06GGg40HbDNdettLrwHVhL/Siq0SXL6R8gZd8lKa7VmqbYTVxqZ9Wss/tBhsr1pfx6oEauXRaLGj6h0Nyr1MseiFIuvFfsPJCy171fKq/dHKmyO5RrqD9zXYNmOgLaWxGseDsrSadVht+YbXXytEW7GvwWt0Idv8K9ZZ/t7VsSGow8pRra8j674gFOvXEhbjK92wIIEoriJ4NEoB2VEQHW670k74T6s4F6rB+uOFXRljVQaCG8uxl38JDttDRGSwRjJaflql8GKA+LOrbkH7c6BSqJY+FqjYttbxQkH6Ul9qqASnJwNGTmM9iuGWPdnV+FHsjRs1HVioaBBG7GyxXGkYDSqVVxDUsB9Em+Iqpe0qCNKkUKlPlcA068bwfBYtDCX5B6X5XsKORpHv/pSpFHxUS3sJLwZUGzClBULw1DAsYgQEdUU1VMtXLW045JFp1660XHkYK2QovcOqCPKnPJQjSFd5vmBaEcFa3Ka2YLNQ71OkIbHAYl5QeeeJ879h2zzFFY2z4uWhFqisXlfjh2CdSrfGLWi1sOsbOqFIl1vh+CHYt2LwoXfTcW3PuOGuu42F8loZP49FKrkiRmqnEoJeb3l4sUPyGwxjg89rF8p5Gww+KqWV0OLl8xFMewmV4fNxe6JkfAKhOpwc+EGPChWDzovzvjo02H6ohmC+8rzV0kqh6VxpjrudMXl58n+q11ENqqu28qX8Kw1B+PX5oTxfMc2fOwpBhO3LBYHOVgOHjquA6oPmBrac0G1BqcCUhtJ2atnC3FXhTyy7scbr1lBcIJSjWtqLAUH6Xyx9EJ3uQ5z/mVDXX8ht1qCuGq38jDZ/ObalrHSx2wasrmdfbHD82Jox37GQPFSzTc6jE9/NXagM50kwmBIeOvE6p+NyjCQIftmisAwFWWMvDEexnEesFxgTqKOIYnoluEkig8ju229tUBOV29sW+P2qrb5a2h4rjcFywVAjadsF1t4uC2+1LtkqXzIS5XwbKQSHfFgtgbQdBataXfDp2YEo6Y7Nu2DYDjD95QdFFFu0vwDfK/W1PL1SnupQo34otu1QTAt6e0PJQwiWK5YpD05vlYexoNbyXh5P1kt55Jf36fK9QJd3JATrqBaC9TsEeRSEi5MtMjIC2Wymsi4F0/K1fMpBddi3s+wCpl/bSIZOqBTvlysN9j+p9EMpyvP7nffzBdMc/NXeyAh4sFvNG0SwrWJ724YdUef2hRuhnQcn6LseRJaRZhN/NHJTCr90pRqqpW0PDJFOud8p4xrokNfsUNgusEqDgX3yww7vXnnjatAPQiCtPKkE5YmBcmXB11tD+sviR4PS+qqjmG/4lAzW4e+k+efVEOxrtSAE6ytPC8LFix1+CSvFaDN2DN5dl5UKOwTTtpb3Jew8+GPhghe5A7Gz2nkhUH7no8L/1b760Hjax5ZNWZbCf7A/GLYHClx1Bz8mWlTW1eHLuY/y8/9kOB46Q1PbZRvxrnj5Z1eFG+PKl6jGgtD9d+qlzknHJC73ygXPNeI3VKlB5ZfF95lWZF4p410+H9uHyUHa1J57g7dDaVpp24ovth+ORFAITMDaUexfdSEL9rWcD2rXp7M0rRpqE+rtCfbBJhUPy74uUfr80PahqxYFuDV4Oy6G8k2LammCUyDeiQeJTbVJV+uEHDbHtkLLjkR527lcFvG4vn1Ye3+CsBIj9sedVKp2LG0F4XjKOgINuhdJ+FB6gLDtAtUfbGNnz8kiHP+CtAQxsq6tpqN9iLfl41NdZkfSd6U01m4DSulyY731Ol2KSxvq5dblLJhhq5k9jKXMjoLPnCLDfOSy2WHKZ+fhhebLaFCJ1hcT/aPBzunXrsQ9KbN4PGG6YFsNT0VQO+6Ial/CiwU7W8c6M6ew1SVIJQOgu1t8S+lDK4OhsBM6pIk4PDhX131lvPYZpe+6qfyLCX5fdyrIop31urUXejzUvLYw/5OguW5zuwrvi3OtcqgqG1QLL9yC8sUF8WmkUAku7YXzKHcmnKyNTveF7r/j6sForJ5Mcq8A8xnphLYySr8SoPxB5m9/5Wt3KtWASkLgD/7Yv2wQxMh9dc+f1EKnrxB8BPlVXn+tGHkC+KzT9REhsh22V0Zq64VGOV3Vt1d2LKrNn53Nv7HyoVofgiiZniwylt6VT/EgnbXS8WLFtshDZd5Ix9R2KabUOIqOsdNSCf645ul8iNaYvZ/YYUcv1IO88VrVfSkEE5T4f0mwrC//h/ozVtAU2t9LeAm7Kqh5vKOXUBNeROzS3frRSOAeip2skwP3U0nMZORegC2xHQrXr/90aNXorxz1m8mkkcvlhuL9tJfwn4sXcpEr8cvnSr0QbaMq7IryGZw3LxR9L1a9ZnK2k2kPPXj7VYOReKOt9gdDehZh61tbpYZQBO9YokecfIzWUxI+/OcBndD5wcfojHd5m1sT5OF8C56Xth2surTayjQ7fpenBVH7RCvZxrK/4X3dGl6IST0a1EJfCR/Kul8tbUej2q381a4ZbgvNNY1/8M5aSU2wwTGiFppFW/l41i6vZTRb2DpK6LJQudxo581I2Jb5VJkGLViCi4agLlL+4WWc/nK93VbkA3zXuJbWGByT4fD7U/rFl8o0bw0ypn5rYb3tZNu79gKBAiIh8YOgFWA2m7UbTMrTXizI50uvJzr6t94H5evv79/h/ZYwjjTJd3TbY0U1mv+TUM6HXZ0nu5ocBbEryPmuONfGih0pi/bAeCle3MpABs5/DohiEAg7GtuPb9FotEx4JczeYQX4afL86uvr3ckLgHJR+r8yAV9CGV40KmJ7yN9LMvzCYHsImRs7ak+E7r3ld4Px5DgesuLAmFbawvS3LKtZ3tLXianCoKBUd1tHQq2WfkcoVr/t0dc9nH8O1VdgI6U5MkbiQ6khHCu/tnXLTt60FhoOqsD1tSI9jNLWwkgYPb+Ho9bdNT0QE8S28mFbMNaty2qoVR5ejKjWt2oyNNZy1TBWPm//9hQ/QhqjS1OCOtk9HjZaODpGaK8KnD2prdxoeeRoUhlXbvS92gUhJoxVWLaGHVl3LdCA6blA2Y8Xko5aUDRyotUdj3Xyv4RdE1JOL43pS3DQNnjtxmpnQLJZST5lwt2R/QZDrVClxRA8cwjGjKX+/2w4Q6sH2r2Iiqia+BK2gl2Be5p+u/Y6xs3hcERfpt7VCHW0DRvJXWFgdxCqLzZ8HeuHcgT5VZ4vmFY91LLekUUwq8DqtWD3dwWL9ew4+G3rLxwK60FxUkFl6nsvvucwknUcDp9o3eXiQl4rPy+uGHyGuvq3B3xatwa/L9YfkfIiQrCPwTHyg1DSvzHC7pDywrbCp0PbgH4YDYL9CYbRjF2wP+WhBH7dNaBaf6qlbQ3BsRwLtqXtmuAxzjy6XWoCiZZgKEJ0lsuPH3YlVKMpSHMwbB0SBD8E4fPJD6X5KrXlgjz50o9ju/LVyjDoT7KjDZ6I2lCZneUFyha5v61uXerZluAbx7cGf8IGt7FewvaDdOE26MMXFOUT4CXsmnAG143TS3gJ2wO6fi9sy2JuJAT1ykgI3Xf71YPxRJNpT+/9KBWgStzvcBTjylPLuxT81pw+hleKSnVvG0bquHpaSlzwZHvRETT0Xp3qP2kKPiMynJbRY3sppB0ihEF+bi/WbiuM5SP0VTwIJA3z/gIo8Z6Yb4Qaa0ItrB/rMI9FPnxZKJYN1rEtPd2+cPRtX9rGOg+q8Xmkm/S2Ze6WyJ93o1Jl2oNt6Lh4Xvp6xXJaStNGJnXEhNIqiOC8K25jjoxK/amVZ8plbGEVYcctKeXhFfpw9Y5Uucq5UP4XTFNQDX4oTdv+GJ0ABWnZEfS4XmuPethdTTum+7sOSgd910A1WsaqeLZxHNXs1sLOhOZP6RzakfNjW7Er0+ZhBBK31+JS9YxcV7Dx8lAOjbkfiti6/AXLFcPw1obH7DCIBK+dcGho3/Q/HRIUd3vtSGFbByZMQaxlFfMSXsJLeAlV4amibfEIa8XOaGNHI3T/nVcPxmLDty61OvBXdcbTwGoh6O1W3drRRUc/r+UrejMhpZXBMXRnMFVEFTtRuhAKppXSM5y+oHdWqwGTQQ2+3mZk1Lra2xGCuD1Wmo5bRdqqyUrNIFnBbaDBQpFOi+Wpv5hw2SqvdINxJfJsYXj+0UK3bPiw2gJ93x68rQU7Qi58bK3uUfdR+QNFgrJih36aTgJt195HK+gODWU7KwHUTDurK9mar6IDqs35WvtQsstIhEoWzSP3pxSlfKjetKt/6/SJsJIBcodENV7W0u9K5auVC6gDI8Mfn3CApmFQI5FIxD65PyYEG+WxTv1QCSPFv3DY9Sj6T8fI15GJoeEqjlvtitBhdLlrwyhJ2PXxQvZnF5qSpUZuZ2PXESrJt3+zSfkAvZCyHxyfrVowKYrRKosxg4bVbRFuO0TyC8nk7YGdyvsXLYbzRws0t91c2ZsTXuLtiwfl737dUagmL//J2BpPXLrj3fC82zbPttc8Dd132zWDsUSDR6QXS1Tq3PZVDCO7+aUYTUeDRlJlguWGG9DRG9XyOosYfu0tWHcwTXyubeuyGiqNj4/tIhhV6vex4+RBbQ9vXzQN377xDojq9CgtmO7GZ2v9rIUPlVALb8Za92hRQsuO+ApBlb7W3Efl87OyusFC3t75qteeVau/alpZ09tj67ykTtZX2kQ1nTZaXbM1qDPBDo2t/lK9VV7n2FBdHoK6b2R+VaujVlhvOECqKzxSfUr0w0v4z8PWxv4/RS4cH7yTl7BzQOWkSybF7bBtg5PVlwaxMmSq/bCj4dopX/z09vZ5RzsGai9sN4yMgK0pu5fwn4n/PJl4aQ7sbDgR2z7Kl1oMuVx+6EPDL6EI8cMP24vfxfrKMWgvH0ml0ijkZXdcnmR90n53JEL33vqHwViikYTpmoYXS1Tb1qv2Yb3ScqNbkfkrL7+Oyrfi1+qiu7qKGF6uUh/tdTWBcqHBYJ5qddbaV3GrkhCMDtW3UEaHykJZiu1v3KrxslqaQyWah9MYHBPlD5ZhGk+tnpIx3jpq4VetMIoD1VXbXisdc2askrcEwe3KUfa1MthwgNDgna/l2J68qoTyMQ/yqJSXOglGVONDNbkpolDIee/9rKWPY+V7kJZgHdX6M7a+2v31gfEK3tU5fPoH6RobSh9WV9PFRoY/yD6MgK1C/fFfUkLrZr/bDRI8P1RGaVpp/tIybpJsZwIDkCEdmc6XsCujKDO7GrRQ8w5f5HhpblSHWygXB9uXSce3F4Z3QRqKwem5rYWdSbNrrxSltIweshcjhaKpHzY5/Y6PttHq5Vwfgun+sX8exM7QGGXtDiMjSN+wxF0C/0f06k6EP44+50Y3rmOchy8QxkisX+xF1dedCynQUohZLmwfGSmvpFqlxbaHB6FSfHkQys+3htFrn9p4U2v7DsPHohShe2+7cjCWSDJjhCQHM9fmvpejENgmCdH9HLnOWlF722N3p2tz7ctRbXu3FMF85UJUax07HkFhqX1VVXt/QuFAPh7W3sb24NHIdJbQJdS4vbe1ybWtKNvZKYV4NxL7Su6sJKr0Z6yr5+2NsfKyOv1BPqj+bR+v0h011l/x8spwlOqKarTUVh8brtL3avWrTLBckK7RpjlvSTTLa6x+ycmHPjkWrGckVBu70vpHkp3SrcuX8BLGiG3a+qX8hXa575q9hBcDJHN+eKHg2pai3zEq1M2tWo3eC4sXeixqAUdJymYkhTNSvDoVDA7s7lBtxVqH5xsdguXHWsfWUN5GMFRDMH14z4uoVl8wrTxI0P3jcgTz7SgE26gUth22Gitn1zCUtzdGGoaGx2vTD7ZM90JVN2rnotqNKVVRY392JeVUKy0uX7UQRIAP2w1sQ4pdjz4MGaJgOyOFcoxEsxCMC+YrhursKs9fjiBd1fIF08rT/Th5cvosW/CLLMUwOmytrUpp5al6d5ILQQJC991+lW1dyuaVbDNqlg1xs5RsfXiviNK00s9R7AhUW0HVtgIqv9snWG70Wyi++x6ky2f71lFdYB1dxYveQdqCfS1PGxuCfXerycrEldNcyrKRx2fYFmEAg95nRirBtefzWSfBvNXkoQiTy5FYtF3uRCxFNTkqEb8qZJWjtBwLBtlQBTvCoI3Uv/K2gjRvP9VQbZ5v37E0kkv6UK3tsaJIs9Oto2dU9TEu5Unp2G2//vjebSjw/KPGv5SykbYuFTf6fmtsgp9/G2n8R5aKHTA5tifE1PLwwkCrq5GNwgsNCdWLZQvkJbyEFwu07a4drG2d95qfuVzxFWcyQjtal1U3iv83Ebr3tqsHE8kGHZasLIPKscQNJI9siI1XlRjG3FVWs2ND5fpcO8E07WvrV/+Vl6lE6/aEhDPY5vZoz/VjeD+F0vpHll0/wZUvHZryOoNQuWKlpZNj5HLDJ2mxXIlc2GGgTi79RpYpH3752mgJYphIBtwLa7ek2WLm7S/LRLDKsu5Wa88pVg9l5apheyi2WvmwY5RoeZ3V2gjSuQPGzt9lkaHz+7oNXVYVegNMJFLu6Wy90qCHHPSchw9BkA/licW0bd+Nc3XJPvgYXmMlj0681BboGNsPyOZgmf7x2wrrKXVxyZm5EQL/KbsFRTGiVPkOpbqz4ZzeBvjt+KHYlmsnGHy6fATL7QwEadke8OmuRH+xb47dwbaDwUelNIWRUJ5WS5lyBMsoFGkeXk1QpkYKPirFbQ3BMmXlhsnRDsZYmxpruf8TqLXztebbdvz/9s6+x3HchsObbGZuZrvt9/8SRa8o2v7d4q67KNp+liuwPWAxL6l+pGiRsiRLtpw4M36ynHUsiSKpF9uK46C/1p4A5EBxHORa+6DuybEFbFIuFaTrWT5ts860do21CQd6/uL9PHKeDv64/4+//PLfD//79Ve31d5o0tApuSUQ6HyjXAa+EuK4yVKsyHuiZ9+Z6o84USp9NnjrkH8zZi+EC+WOxyNNwvj1AB3LXDx3to66Cr0i6D66L9GBnvav06/g8+FfP/94vn/A0iXCENABecWSoPrQ8mg+vEe+MKCuMQjkYGDbkO2aS50/4zgwKNMWB/Yhtlnrj1FLy7rIiJTOmsnKfq5XriNQOjDX9o1eg7FHfdfoz70p+aeXvGTlaK7Py9oNZXX53NhqoW78bJGln6vbG+6W+9pvHOTahNu4uQ85s+zNKAGJAU5mcR3XOCUzUz+fcUnYjmvboutvsQXRn9MCS9lG212DN3Dsquf9NnOCLQSj1gbppNvorOvN9Uv9K5UPNh/nHKl5SQ1XBeHozO+v1SjrHXShN5aeXCdu4sdanTfNGvFrBWfKz+out7cMxXvFNt5Ce9ZznT5vqbcB+V6d8NxwrXnV0rOt+SeY5s19Mme2lD385+ufz3d399j0wujvyrV1kGsuCSxf7mhpTBvo0jJJntJSXxkdZ267uuWOcblAKS0NRVllK3xVboGvy0gNiNp2bhlMW2PpxJTzndpcja35N+uF/kZ1ZUI9/nWEmn6eRuayuX3RjjHYpW3L23U4nPwWYBsC2pZp31qXNZf2A037eKiP0ZSddXVzLKGLXr5zJlv76enJb+3s3D49B/qt8B59roHnytbJ+tZ5b/6OcQc6OyBw1MRP2O/s7Nwm+0GuxDU/YrkOcBc+a3lvHP795Y/n+/tPbtNe3IWlS1lXrqV0acoB5kC3XX6ngR7daCWd2j/4k/Zp7iShOw9pV0sj5eU8v0HE/pTQvtpy5/Pcz6CSF/iN5O2y9B9w3HYh2Hp5ytyE5qhfbmN/+AHUTmJFG+E2Dm62ffr3tz7YUJZsrvenPM5r563afKU5O7aZqe0/dWOWbQnjsU73FDV1v+i6XP0yzo9TDlb6/+5BHGs7y05vEHtMAjb+2Jdqk7fQTtLfRHaWwP1H5PbBSaT9Lu7UQaLnSecW+6Q/Dcg5CWP7GtwxnjfD+5qGLt/AVWPK5HlfLbIG24ng8v7mzvv91taI7Wq38z2fBOloHf7504/nx4ff+XdyO6u7BNTLXwhWZcDsD6/OaZoW+GwlUH9pz8KUzuLmd5RQ31k93gZbetnM2m/tsjbHaJtJK2861li6tCco1uZ8jKb94f5mlDdRewY+PsEqxVbD+jexdKnGFn0MkAv7yrgWd1HhuYJe1XZM94cU85ed8xidDfNbCTuWt8D5w8tL/HituA0CpbkO7Yx/Ndgvq+fra6H2ilP7oLdHLYNEyMvLCwmgzry5RrwcPS/rbw1e9ghtj8dBlQbEVuF+XXdQTIGnK6z5uDB+3t92x5gs67HYOGB4bNn2FHSQvvC4xkM2np95/Ej969qAx2t9dHXEFwTvD/8ZnRfVf08uQAhS6mCsSkTvsAhgX3wshfRqUOgRccD+QfDeywidmMyQpf/EHuwg3Sn7SbBPi5uoBynkrUbH0sdzYFDsxaW7QXk63UWDU5fX+0GcFuvsAGwRIeI6RIDYIXmFVF5Bl4nL9YNjGtddsiumNl8rTp/rU0Z7FAZ8HYlPImrqboilzzbkHgzQyM5kYpbv378HnRFtGsU6iC9Bl5xjwW+T3t2dwkmB2z2eW2wZSymtRKFMIclAwcqhYxBl9LtqquiOqpcOdLwQAVGmuM3c0iOtmojwnkHcucMgcibR94wCFomgRv1SluCPQadeE20Hi33lUqSNRHL5sKcFG8+ArYHSXYPbZQlGn51ivtZC5QbR+jphKtT6YwFiB0STyivkyvQFscMZv4GqdftEiiBdS8C2j5UpMI6oV7msdswHTqeP6kAXp2rIISV5hnpg5/BKlZI6p+p2qdDp5eH+B8qe0qnzlXE2mVi6OLk4nF+xEqbjgfhRFOl/3kd76X9LKCP5Arn9Y6wPupwt662iF9D+aJkGeVhMOSd4FmVdPPsj9bqjjzMCT+8XwYFvfJQg+h6wdnZ2durRE+gwkdLk2o7Mc6ml2CWwXfkVrFDv/DrZ5ry8enG1fHh+eRn2X5O43SCX5PD17384Pz7+xjeL+zsYkA8MAqixJrs0qHGv4enR1KiQHsHOH2jHwavtTOh4/P/Im+oOgpMAv0mEN9oKHxH6y8Q2a3Q+vQ10HNBx/KZDP75tmlDQnsSgPoikx2k5atO039jW7y2lQWFqK7aV5BRdWmdsc0hbY0DqM9vihRrykU++gM5MSkRRPHHWTyRTE66M3VQu1IEX0gN19abQNovGaW2xZZh3UtZaQp5xXr2nXH8c55b5La15PN+kxl3KP6sPObCHcpp4YDtVnpnX31Em409Un85V006CtSuuK9Lj3qJeqtllRT0uij4TFFU6yd07vLhiEafxlW9mKXWmdbB21OO8MEXa9XD5dLnx3vGeNNRUXqao1Rmj9cc6crq0XbGUiPULU+XyWI36XUpAys5UvstQ8hxji08Wp+zSedCXS3nnYWsIwoz3tBLbXK9NctaXYFL9gJmjrR2pv0UEsSyVxkiOdX2YRuIo0ocJjYnd6maUfqDT4gPXFcbbimCCwNnTTRndBV6Svn2/4YMIbpCQ7a2CsQfRdmuRtJ3+cJ/XV0s7QhwbeT9HliJjIQ/Sx/VxObX95W+/P3/69Nm9iyb56PtweUoHSujDgBVdLZf2OXTw4iD00G9pWbqcR61+jmWaXnHQPsQ65qSVbK5H+0Y9TakcreZ5cJA4IhH/6GRuni02rn3QdsI+siyqh2wm5yCM/XoDleLNCQ76GXTmR5N9PUm4bk6HjPs321xnwxQ945z3aUzrZ1flybtWl41bvQ2lfGxX2vfpcoJuB9sk1maL9JEx1px8vjJcN15sVN4fHUvU9OptLrXazk4Fuc6/EpXVrXGAuhQtE/XOUtBPWqQXftLfZFtHvnZze5kiRCr3yzrP9BuTyKFtD/X5A103T3Z2dhawH+QuC06IWqQHaONBaHLeFrGvYfvatp6jp7wE5LuJOduPr+5SHF/zdrtoRw10J4sXLodKxsKNWXtZPgcEHvpFdP0lf2Kb8/Dab0mXoO2AaOI0LfPQ69Jj+7RvNbYLwS7qMK5TDWLqKOkvpc1DTwxYUceKnohG76c0WqZDfD4iFVk2gbHT7xP/5hPajsdFHdTOXix4z7HDj4YimbO06V8b3TeWx3AaHa9YdN/HTUQwJSXurxPdXiXq8pV9D3aNhQk+aHweGkdIi9MF67sW1us2q3zVaD1cL3R9/HhK+soHuhBzXQ4cybmRg6xUBOl6uxaj46Z5Cz4s55bb8m30w3Xh+JRjJHGE8KSSm1x3LgmazrXK+CXtVXqh8MpwHevXkwP3RtKrhE5tM1Wcu0ww10V82dl5u0wPUxkHknE/0G0D1x66aXzzDCcicZqWi9DvGEAH7kZdh68//en8+PDo3wb0nVq0DKSwX0guRavlUlUapWXg4NIYl6gpWnTldIC8D3ZZdp6Oemyc837HtMaUYf3pdt3SWfzcwYPnRgg42esBL+Uz8ZjpQWncmTioO6aJ6E7LFtJtjX16/3z9QqkdeZzl6ovH1nJb5hNsKQ+RufErzSMlHcou12fwSC4h9aPQ9XNLK1hybHmYhYX7CMTap8cdnggTgz7sSkhhCxJzshZwhD9zCpKybStYW8e2i7w12NfttksNYv+3b9/8r3Ss169vmbfQ1jtbIT9HTvUx5EH5udAs7A5f9CbH/Clg+QApBsAlse0i16TkK9JysnMt0Ld++/nzh9PdaXHvuUzvq+07Oq2U75YQP2J/bt3XFptv0b9aUu2qZRmHLz//5fzw8IO/AywzXGkdJqStsSyTB1eR+nLXXiFxGs4U3N/DiXcS1ubypf01sZfa9oJZp3GD85nNEsY6U8QnGHp5QKi5up/TV6iIqq+ko8fVRuxbqb5UHCZx+nLFWnzdAmut6NS045qrSeujlg9HbpTGpE5bew7rf/VeP7aQoBO1r6U0y4uJF4N+c6TfnFsJBG2OwCn9Q472ElcJpaEM52slrhfSEwT49fXlw/NzeBxVuQ6kJ/xUUoOua7rOduBXzaTD7ZO2JydL6KlrJw3Fllq2H7Vt1bNdRVet9IR1psd3vZRsKujv3Ha3wNH5Tc+6TB5lEQ8R88ZJ9LYWOS6nqtNpT0/6V6zrK9M6mLpymtmdWlflVUAX+cJvItuEqNCQCxKn1aE1BESH1pmzyeogcX9E6uFb0AXSkxENWZpLdMS722xiREe6qI6Ryktvbdoc6IYAL37HIGpzklK+Yf+EmaIjpSeVRn0gmXuD6KaaiMMUyw92JWNq0+IW0WlK3L845wD5kZbYxawOR3WaelNerYjt0ZTSTBVZDl//8dfz4/0951KW4EvCecLlYctSi76MjcvpNJx3ADnYZa8ezrh3Tl2qHtXSpSuS84DOanKJMznrO91grnHIVgbf0z5RQd4k2pYqZDAW46zq1fmAyQtd7l829orcJIC9iPXQjj6bvNflpO6p+ihVVSexTK1MlHTFvmsO6i5F067eo8B4mSSJM0OXOrszzAFnI59uMKW205TaTtJwk83d6Y7qyMWiVF8qbap95rD8IJKmFKM1WCM2llJftJTatZbWviH0qLsFXV/qrkvMQfyF8Rm8vr76u9WuiLNdX5bXQP7Oc7keVEG2saTQ6VreAyVfW2OA/HqZWyP1tOp8K5xOuMmGZxodiyEmkAkweWu5RRCD56cndzJ0dH0lisFbhJp27CO9X33yW0K+r2opQcuUkRwOhw//B1sCPPmtu9RqAAAAAElFTkSuQmCC" alt=""></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>How does each one of them defer from the other ?</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":131,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/2627273B-ABBC-4627-BD94-AA95B9690559.png" alt="" class="wp-image-131"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph {"align":"center","fontSize":"medium"} --><br><p class="has-text-align-center has-medium-font-size"><strong>LETS US CONSIDER ABOVE PICTURE TO DIFFERENTIATE</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"center"} --><br><p class="has-text-align-center">This diagram consists entirely of <strong>line segments</strong> . Out of these some of them are<br>also called <strong>closed curves</strong> . They are called <strong>polygons</strong>. </p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph {"fontSize":"medium"} -->\\n<p class="has-medium-font-size"><strong>CIRCLE</strong></p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p>A perfect closed curve where every point o	\N	PUBLISHED	2024-12-08 15:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
8	4	Basics of Geometry	basics-of-geometry	<!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Activity Time: Let's See It!</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>A person is taking two books or sheets of paper and elevating them until they<br>touch at one edge .<br>If they examine it carefully , they will notice a line where they connect .<br>The intricacies of geometry are indeed fascinating ! just as Mai and Aryan’s<br>trajectories intersect a point , two planes in three - dimensional space meet to<br>generate a line .</p><br><!-- /wp:paragraph --></p><p><!-- wp:generateblocks/container {"uniqueId":"bd7d7cb8","isDynamic":true,"blockVersion":4,"position":"relative"} --><br><!-- wp:image {"id":122,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/A47614BF-BAC2-41F8-B838-757B423D90B4.png" alt="" class="wp-image-122"/></figure><br><!-- /wp:image --><br><!-- /wp:generateblocks/container --></p><p><!-- wp:paragraph --><br><p>Lines that are classified as parallel do not converge at any point no matter<br>how extensively they are extended .<br>They consistently maintain an equal separation from each other.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Let us go with an example here,</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"left"} --><br><p class="has-text-align-left">Imagine the side rails of two ladders;<br>They maintain a distance from one another and do not intersect .<br>Non -parallel lines:<br>Picture a pair of scissors .<br>The blades overlap when they are closed </p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"center"} --><br><p class="has-text-align-center"><strong>"Geometry is all around us - persist in discovering it in your surroundings</strong>"</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":123,"width":"736px","height":"auto","sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full is-resized"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/E4D79AA7-AB41-482F-8526-7C2289712BD4.png" alt="" class="wp-image-123" style="width:736px;height:auto"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>A ray can be described as a line that originates from a single point and<br>continues infinitely in one direction .<br>A common example of ray can be observed in the ray emitted by the sun .<br>The light begins at the sun , a designated point of origin , travels indefinitely in<br>a single direction , paralleling the geometric representation of a ray .</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>EXAMPLE :<br>5) Draw a ray with endpoints A and B .</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":124,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/258C655D-308D-4613-8618-E0B39F5C0D6D.png" alt="" class="wp-image-124"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p></p><br><!-- /wp:paragraph -->	<!-- wp:paragraph {"fontSize":"medium"} -->\\n<p class="has-medium-font-size"><strong>Activity Time: Let's See It!</strong></p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p>A person is taking t	\N	PUBLISHED	2024-12-06 15:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
9	4	Curves	curves	<!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Here we go with an example:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"center"} --><br><p class="has-text-align-center">"In the absence of the teacher in the classroom , all students chose to play quietly.<br>As a result, the student commenced their activities .One of the students suggested a<br>game , but the rest were hesitant to join .<br>Another student took a piece of paper and started doodling .<br>This sparked a new idea among the students, who then silently grabbed their own paper<br>to doodle, ultimately producing a curve "</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Let we start here with an explanation:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>A curve is a line that isn’t straight and can twist and turn in any direction .<br>It flow continuously without any interruption and can from different shape based on how it<br>bends</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>TYPES OF CURVE</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>OPEN CURVE:<br>A curve that does not enclose a space or come back to its starting point .<br>Eg; A circle ,an oval or the boundary of a triangle or square.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>CLOSED CURVE :<br>A curve that starts and ends at the same point ,enclosing a space.<br>Eg; A circle ,an oval or the boundary of a triangle or square.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>In the field of geometry , curves can be categorized as either simple or complex .Simple<br>curves do not intersect themselves while complex curves do. An example of a simple closed<br>curve is a circle , whereas a figure -eight shape serves as an illustration of a closed curve.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":127,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/ED3F8A06-370C-494F-B0C5-D07D45C9BB3A.png" alt="" class="wp-image-127"/></figure><br><!-- /wp:image -->	<!-- wp:paragraph {"fontSize":"medium"} -->\\n<p class="has-medium-font-size"><strong>Here we go with an example:</strong></p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph {"align":"center"} -->\\n<p cl	\N	PUBLISHED	2024-12-07 15:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
11	4	Angle	angle	<!-- wp:paragraph {"fontSize":"medium"} --><br><p class="has-medium-font-size"><strong>Case study with Carpenters</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Mukesh ‘s father is a talented carpenter .One day, while he was crafting a wooden<br>picture frame, he needed to join two pieces of wood at a precise angle .<br>Mukesh inquired ,<br>“What angle are you using to connect the wood?”<br>His father replied "I am using a 90-degree angle , which is known as right angle; this will<br>ensure that the frame is stable enough to securely hold the picture."</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>What is an angle?</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>An angle is defined as a geometric figure created by the intersection of two<br>rays at a shared point . The rays are referred to as the arms of the angle , while the point of<br>intersection is known as the vertex.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>What is a vertex?</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>The point where two rays meet .</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>What is an Arm?</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>The two rays that form the angle interior and exterior .<br>● The region between the arms are called<strong> INTERIOR</strong><br>● The region outside the arms is called the <strong>EXTERIOR</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Measuring an angle</strong> : Angles are measured in degree (^0).<br>A full circle has 360^0.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Types of angle</strong>:</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Based on the size , angle are classified as:<br><strong>Acute angle</strong> : Less than 90-degree.<br><strong>Right angle</strong>: Exactly 90-degree.<br><strong>Obtuse angle</strong> : Greater than 90-degree, but less than 180-degree.<br><strong>Straight angle</strong> : Exactly 180-degree.<br><strong>Reflex angle</strong> : Greater than 180-degree,but less than 360-degree.<br><strong>Complete angle</strong> : Exactly 360-degree.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>Real life Examples:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>The corner of the door is at a right angle .<br>When watch or clock show 10:10 it is an acute angle<br>An open window is an obtuse angle .<br>Understanding the angle are very easy by designing structure,analyzing patterns, and showing<br>and solving the problem in everyday life .</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":149,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/284D1647-5390-433D-A8C2-D5EFC7EEAE91.png" alt="" class="wp-image-149"/></figure><br><!-- /wp:image -->	<!-- wp:paragraph {"fontSize":"medium"} -->\\n<p class="has-medium-font-size"><strong>Case study with Carpenters</strong></p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p>Mukesh ‘s father is a 	\N	PUBLISHED	2024-12-10 10:26:22	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
12	4	Types of Equations:	types-of-equations	<!-- wp:paragraph --><br><p>When we hear the word “Algebra” we think of complicated equations but it's nothing but the<br>simplest math in our everyday life.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph {"align":"left","fontSize":"medium"} --><br><p class="has-text-align-left has-medium-font-size">Let's imagine:<br>●<strong> On a weekend, you are nagging your mom to buy you a lot of delicious chocolates, The total bill only for your chocolates is ₹50. She bought ten ₹5 rupee dairy milk for you. So,How many chocolates did she buy for you?</strong><br>So, your answer is she bought 10 chocolates for you<br>Well, you know if 1 chocolate is ₹5 then ten chocolates is ₹50.<br>So, the equation turns out to be,<br>5x = 50 ----------- (1), (equating on both sides based on the condition)<br>The condition here is the cost of each chocolate is ₹5, and also the total cost is ₹50<br>X is variable and 5 is the coefficient of the variable. Here, we take x as the number of chocolates.<br>●<strong> By solving the equation,</strong><br>5x = 50<br>x = 50/5,<br>x = 5<br>we got the value of variable x is 10. Hence the number of chocolates is 10.<br>It's elementary,</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>There are types of equations based on the highest power of variable</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>1) Linear Equation</strong>: Here, y is the variable and the power of y is 1. So It is called Linear Equation also called as First degree equation.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":152,"width":"217px","height":"auto","sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full is-resized"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/614A4A3F-0222-4EA3-968B-3B17C84A80E9.png" alt="" class="wp-image-152" style="width:217px;height:auto"/></figure><br><!-- /wp:image --></p><p><!-- wp:image {"id":153,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/51392A88-DC7B-429B-B5F4-3D5C23BDAD59.png" alt="" class="wp-image-153"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Comparing the both the equations we know that,<br>● x is the variable<br>● a is the coefficient of variable<br>● b and c are constants</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>2) Quadratic Equation:</strong> It is called Quadratic Equation as you can see the variable x has both power 1 and 2 in this equation but the highest power is <strong>2</strong>.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":154,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/B142D388-4FD6-4699-AA09-E7665F5534D5.png" alt="" class="wp-image-154"/></figure><br><!-- /wp:image --></p><p><!-- wp:image {"id":156,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/1D00FA6F-798D-42F5-8B46-3A2C7D800197.png" alt="" class="wp-image-156"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>● x is the variable<br>● a and b is the coefficient of variable<br>● c is constant</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong>3) Cubic Equation</strong>: For the cubic equation, the highest power of variable x is 3</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":157,"sizeSlug":"full","linkDestination":"none"} --><br><figure class="wp-block-image size-full"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/92B49BB2-036C-4999-B825-6C7C1755E593.png" alt="" class="wp-image-157"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>These are the different types of equations.</p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>When we hear the word “Algebra” we think of complicated equations but it's nothing but the<br>simplest math in our everyday life.</p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:parag	\N	PUBLISHED	2024-12-11 17:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
14	4	Example:The Rank of a Matrix	examplethe-rank-of-a-matrix	<!-- wp:paragraph --><br><p>Examples are the best way to understand a complicated view. Let's directly dive into the example of this topic.</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Let us consider a matrix. name the matrix as A.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":172} --><br><figure class="wp-block-image"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/EE2B4B91-DAF7-4AF4-8EC3-27668B1C58BE.png" alt="" class="wp-image-172"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Now let us break this into 2 two-stage processes.</p><br><!-- /wp:paragraph --></p><p><!-- wp:list {"ordered":true} --><br><ol class="wp-block-list"><!-- wp:list-item --><br><li>Echelon form:</li><br><!-- /wp:list-item --></p><p><!-- wp:list-item --><br><li>Count the non-zero rows.</li><br><!-- /wp:list-item --></ol><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p><strong>STEP 1: LET US TAKE ECHELON FORM:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>Subtract 2 times the first row from the second row:</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:image {"id":165} --><br><figure class="wp-block-image"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/16784E00-2FF4-4458-BA26-92572145A38A.png" alt="" class="wp-image-165"/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>Subtract the first row from the third row:</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:image --><br><figure class="wp-block-image"><img src="https://lh7-rt.googleusercontent.com/docsz/AD_4nXd9niDzn6fN7K_PHM4Cf61D5yVtjMEnmwjxSd7djxJKIN5mbRlJHY9XT_9UHkpE5myuLKjQmK2QKkt4eRNHYkO_uc7IX9z0c4Xuv80wrqQXlrUOdGCiKvUJ69bIAlpLcSTkhNy8y-ToF7EhJdbxg1Q3ZSA2?key=lXXqjGUhFobTs0B3DhOY1Q" alt=""/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p>Let's take now the values which have been generated so far </p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":164} --><br><figure class="wp-block-image"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/E7BBD711-FBF4-4CA1-B37D-AF5ADA404E9F.png" alt="" class="wp-image-164"/></figure><br><!-- /wp:image --></p><p><!-- wp:list --><br><ul class="wp-block-list"><!-- wp:list-item --><br><li><strong>Now multiply the third row by -1&nbsp;</strong></li><br><!-- /wp:list-item --></ul><br><!-- /wp:list --></p><p><!-- wp:paragraph --><br><p>By the result of this we get a positive leading factor.</p><br><!-- /wp:paragraph --></p><p><!-- wp:image {"id":157} --><br><figure class="wp-block-image"><img src="https://blog.sashainfinity.com/wp-content/uploads/2024/12/92B49BB2-036C-4999-B825-6C7C1755E593.png" alt="" class="wp-image-157"/></figure><br><!-- /wp:image --></p><p><!-- wp:paragraph --><br><p><strong>STEP 2: let's COUNT THE NON-ZERO ROWS:</strong></p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p>Before this lets us conclude the definition of the rank of a matrix</p><br><!-- /wp:paragraph --></p><p><!-- wp:paragraph --><br><p><strong><em>RANK OF MATRIX = NO. OF. ZERO ROW&nbsp; IN ECHELON FORM&nbsp;</em></strong>HENCE WE CAN CONCLUDE THAT THE RANK OF THE MATRIX IS 2</p><br><!-- /wp:paragraph -->	<!-- wp:paragraph -->\\n<p>Examples are the best way to understand a complicated view. Let's directly dive into the example of this topic.</p>\\n<!-- /wp:paragraph -->\\n\\n<!-- wp:paragraph -->\\n<p>Let u	\N	PUBLISHED	2024-12-12 05:37:15	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
16	4	Example: Two Variable Linear Equation	example-two-variable-linear-equation	<p> </p><p><style><br>        .math-post {<br />            max-width: 800px;<br />            margin: 0 auto;<br />            font-family: system-ui, -apple-system, sans-serif;<br />            line-height: 1.6;<br />            color: #2d3748;<br />            padding: 2rem;<br />        }</p><br><p>        .post-title {<br />            color: #1a365d;<br />            font-size: 2.25rem;<br />            font-weight: 700;<br />            margin-bottom: 2rem;<br />            text-align: center;<br />            line-height: 1.2;<br />        }</p><br><p>        .math-content {<br />            background: #ffffff;<br />            padding: 2rem;<br />            border-radius: 0.5rem;<br />            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);<br />        }</p><br><p>        .step-container {<br />            margin-bottom: 2rem;<br />            border-left: 4px solid #4299e1;<br />            padding-left: 1rem;<br />        }</p><br><p>        .step-header {<br />            font-size: 1.25rem;<br />            font-weight: 600;<br />            color: #2b6cb0;<br />            margin: 1.5rem 0 1rem;<br />        }</p><br><p>        .equation {<br />            background: #f7fafc;<br />            padding: 1rem;<br />            border-radius: 0.375rem;<br />            font-family: 'Courier New', monospace;<br />            margin: 1rem 0;<br />            overflow-x: auto;<br />        }</p><br><p>        .key-point {<br />            background: #ebf8ff;<br />            padding: 1rem;<br />            border-radius: 0.375rem;<br />            margin: 1rem 0;<br />            position: relative;<br />        }</p><br><p>        .key-point::before {<br />            content: "•";<br />            color: #4299e1;<br />            font-weight: bold;<br />            margin-right: 0.5rem;<br />        }</p><br><p>        @media (max-width: 640px) {<br />            .math-post {<br />                padding: 1rem;<br />            }</p><br><p>            .post-title {<br />                font-size: 1.875rem;<br />            }</p><br><p>            .math-content {<br />                padding: 1rem;<br />            }<br />        }<br />    </style></p><article><h1>Solving Linear Equations: A Step-by-Step Guide</h1><em>Solving the equation means the values of x and y need to be found that satisfies both the given equation. It has 2 variables x, y and the condition is also given.</em><em>There are a lot of methods to solve the equation easiest method is the (elimination method).</em> <strong>Step 1</strong>: Align the Equations2x - 3y = 6 —(1)<br />x + y = 1 —(2) <strong>Step 2</strong>: Make Coefficients EqualMake the coefficient of any one variable (x or y) sameWhen you substitute the value of x and y in equation 1 and 2 it satisfies both the equations.When you plot a graph for these 2 equations, the intersection of these 2 equations will be the value of x and y.Linear equations represent lines. <strong>Step 3</strong>: Plot the SolutionThe intersection point of the two lines represents the solution to our system of equations.</article>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<iframe scrolling="no" title="linear equation in two variables_blog" src="https://www.geogebra.org/material/iframe/id/y8nkggwu/width/698/height/500/border/888888/sfsb/true/smb/false/stb/false/stbh/false/ai/false/asb/false/sri/false/rc/false/ld/false/sdz/true/ctl/false" width="698px" height="500px" style="border:0px;"> </iframe>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://sashainfinity.com/linear-equation-in-2-variables/" rel="prev">PREVIOUSLinear Equation in 2 variables</a>	<p> </p><p><style>\\n        .math-post {<br />            max-width: 800px;<br />            margin: 0 auto;<br />            font-family: system-ui, -apple-system, sans-serif;<br />            line-h	\N	PUBLISHED	2024-12-13 17:11:00	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:10:45.118913	2026-04-08 01:10:45.118913
17	4	The Potentially Dangerous Non Accessibility Of Cookie Notices	the-potentially-dangerous-non-accessibility-of-cookie-notices	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.</p><p><blockquote>“ urabitur varius eros rutrum consequat Mauris sollicitudin enim condimentum luctus enim justo non molestie nisl ”</blockquote></p><p><h4 class="inner-title">During this program</h4></p><p>Grursus mal suada faci lisis Lorem ipsum dolarorit more ametion consectetur elit. Vesti at bulum nec odio aea the dumm ipsumm ipsum that dolocons rsus mal suada and fadolorit.</p><p><div class="event-details-list"></p><p><ul class="list-wrap"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UX designer.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Create quick wireframes.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>You will be able to add UX designe</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Downloadable exercise files</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UI designer.</li></p><p></ul></p><p></div></p><p>Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr	\N	PUBLISHED	2023-06-22 07:24:19	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
18	4	What Leonardo Teach us About Web Design	what-leonardo-teach-us-about-web-design	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.</p><p><blockquote>“ urabitur varius eros rutrum consequat Mauris sollicitudin enim condimentum luctus enim justo non molestie nisl ”</blockquote></p><p><h4 class="inner-title">During this program</h4></p><p>Grursus mal suada faci lisis Lorem ipsum dolarorit more ametion consectetur elit. Vesti at bulum nec odio aea the dumm ipsumm ipsum that dolocons rsus mal suada and fadolorit.</p><p><div class="event-details-list"></p><p><ul class="list-wrap"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UX designer.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Create quick wireframes.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>You will be able to add UX designe</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Downloadable exercise files</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UI designer.</li></p><p></ul></p><p></div></p><p>Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr	\N	PUBLISHED	2023-06-22 07:26:38	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
19	4	Full Stack GraphQL With Next.js And Vercel	full-stack-graphql-with-nextjs-and-vercel	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.</p><p><blockquote>“ urabitur varius eros rutrum consequat Mauris sollicitudin enim condimentum luctus enim justo non molestie nisl ”</blockquote></p><p><h4 class="inner-title">During this program</h4></p><p>Grursus mal suada faci lisis Lorem ipsum dolarorit more ametion consectetur elit. Vesti at bulum nec odio aea the dumm ipsumm ipsum that dolocons rsus mal suada and fadolorit.</p><p><div class="event-details-list"></p><p><ul class="list-wrap"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UX designer.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Create quick wireframes.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>You will be able to add UX designe</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Downloadable exercise files</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UI designer.</li></p><p></ul></p><p></div></p><p>Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr	\N	PUBLISHED	2023-06-22 07:27:32	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
20	4	when aeunkno printer took galley of scrambled	when-aeunkno-printer-took-galley-of-scrambled	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.</p><p><blockquote>“ urabitur varius eros rutrum consequat Mauris sollicitudin enim condimentum luctus enim justo non molestie nisl ”</blockquote></p><p><h4 class="inner-title">During this program</h4></p><p>Grursus mal suada faci lisis Lorem ipsum dolarorit more ametion consectetur elit. Vesti at bulum nec odio aea the dumm ipsumm ipsum that dolocons rsus mal suada and fadolorit.</p><p><div class="event-details-list"></p><p><ul class="list-wrap"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UX designer.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Create quick wireframes.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>You will be able to add UX designe</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Downloadable exercise files</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><i class="fas fa-check-circle"></i>Become a UI designer.</li></p><p></ul></p><p></div></p><p>Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr ipsum quia dolor sit ame consec tetur. Esse mo lestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et ac cumsan et iusto odio dignissim qui blandit praesent consectetur adipiscing idealorem.	Horem ipsum dolor sitter metting Great consectetur adipiscing idealorem ipsum dolor sitter mettingtablished of a page when lookinThe point of using Lorem Ipsu ss normal distribution.est, qui dolor emr	\N	PUBLISHED	2023-06-22 07:30:49	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
22	4	Inverse of a Non-Singular Square Matrix	inverse-of-a-non-singular-square-matrix	<h2> Introduction</h2></p><p>In linear algebra, the inverse of a matrix plays a role similar to the reciprocal of a number. For a non-zero number a, the reciprocal 1/a satisfies a × (1/a) = 1. Likewise, for a square matrix A, its inverse matrix A⁻¹ satisfies: A × A⁻¹ = A⁻¹ × A = I, where I is the identity matrix of the same order as A.</p><p><h2> What is a Non-Singular Matrix?</h2></p><p>A square matrix is called non-singular if its determinant is not zero.</p><p>If det(A) ≠ 0, then A is non-singular and has an inverse.</p><p>If det(A) = 0, then A is singular and has no inverse.</p><p><h2> Condition for Existence of Inverse</h2></p><p>A square matrix A has an inverse if and only if det(A) ≠ 0. This means only non-singular matrices have inverses.</p><p><h2>Formula for the Inverse of a Matrix</h2></p><p>For a 2 × 2 matrix A = [[a, b], [c, d]], the inverse is given by:</p><p>A⁻¹ = (1 / (ad - bc)) * [[d, -b], [-c, a]]</p><p>Note: The determinant ad - bc must not be zero.</p><p><h2>General Formula (Using Adjoint)</h2></p><p>For a square matrix A: A⁻¹ = (1 / |A|) Adj(A)</p><p>where |A| is the determinant of A and Adj(A) is the adjugate (adjoint) of A.</p><p><h2> Steps to Find the Inverse of a Matrix</h2></p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Find the determinant |A|.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Find the cofactor matrix of A.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Transpose the cofactor matrix to get the adjoint matrix.</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Divide the adjoint by the determinant to get A⁻¹ = (1 / |A|) Adj(A).</li></p><p></ol></p><p><h2> Example</h2></p><p>Find the inverse of A = [[2, 1], [5, 3]]</p><p></p><p>Step 1: |A| = (2×3) - (1×5) = 1</p><p>Step 2: Adj(A) = [[3, -1], [-5, 2]]</p><p>Step 3: A⁻¹ = 1/1 × [[3, -1], [-5, 2]] = [[3, -1], [-5, 2]]</p><p><h2> Verification</h2></p><p>A × A⁻¹ = [[2, 1], [5, 3]] × [[3, -1], [-5, 2]] = [[1, 0], [0, 1]]</p><p>Hence, A⁻¹ is correct.</p><p><h2> Applications of Matrix Inverse</h2></p><p><ul></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Solving systems of linear equations (AX = B ⇒ X = A⁻¹B)</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Computer graphics transformations</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Cryptography and encoding</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Engineering simulations and data modeling</p><p><h2> Summary</h2></p><p><table></p><p><tbody></p><p><tr></p><p><td width="288">Concept</td></p><p><td width="288">Key Idea</td></p><p></tr></p><p><tr></p><p><td width="288">Non-Singular Matrix</td></p><p><td width="288">Determinant ≠ 0</td></p><p></tr></p><p><tr></p><p><td width="288">Singular Matrix</td></p><p><td width="288">Determinant = 0</td></p><p></tr></p><p><tr></p><p><td width="288">Inverse Formula</td></p><p><td width="288">A⁻¹ = (1 / |A|) Adj(A)</td></p><p></tr></p><p><tr></p><p><td width="288">Condition</td></p><p><td width="288">Only non-singular matrices have inverses</td></p><p></tr></p><p></tbody></p><p></table></p><p><h2>Conclusion</h2></p><p>The inverse of a non-singular square matrix is a powerful concept that simplifies solving equations and performing matrix operations. Remember — only matrices with a non-zero determinant can be inverted</li></p><p></ul>	<h2> Introduction</h2>\n\\nIn linear algebra, the inverse of a matrix plays a role similar to the reciprocal of a number. For a non-zero number a, the reciprocal 1/a satisfies a × (1/a) = 1. Likewise, f	\N	PUBLISHED	2025-11-21 08:58:59	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
23	4	Elementary Transformations of a Matrix	elementary-transformations-of-a-matrix	<h2>Introduction</h2></p><p>Matrices are one of the most important tools in mathematics. They are widely used in computer science, economics, engineering, and cryptography. In linear algebra, we often need to simplify or manipulate matrices to solve problems like finding inverses, solving systems of equations, or determining ranks. One powerful way to do this is through elementary transformations (or elementary operations) of a matrix.</p><p><h2>Meaning of Elementary Transformations</h2></p><p>Elementary transformations are simple operations performed on the rows or columns of a matrix to obtain an equivalent matrix. These transformations do not change the basic properties of the matrix, such as its rank or the solutions of the corresponding system of equations.</p><p></p><p>There are two types of elementary transformations:</p><p>1. Row transformations (Row operations)</p><p>2. Column transformations (Column operations)</p><p></p><p>When these operations are applied to rows, the process is called elementary row transformations, and when applied to columns, it is called elementary column transformations.</p><p><h2>Types of Elementary Row (or Column) Transformations</h2></p><p>There are three main types of elementary transformations:</p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Interchanging Two Rows (or Columns)</li></p><p></ol></p><p>Denoted as: Ri ↔ Rj or Ci ↔ Cj</p><p>This operation swaps the positions of two rows (or columns).</p><p></p><p>Example:</p><p>If A = [[1, 2], [3, 4]] and we interchange R1 and R2, then A' = [[3, 4], [1, 2]]</p><p><ol start="2"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Multiplying a Row (or Column) by a Non-Zero Scalar</li></p><p></ol></p><p>Denoted as: Ri → kRi or Ci → kCi, where k ≠ 0</p><p>This means multiplying all elements of a row (or column) by a constant.</p><p></p><p>Example:</p><p>Multiply the first row by 2: A = [[1, 2], [3, 4]] → A' = [[2, 4], [3, 4]]</p><p><ol start="3"></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>Adding a Multiple of One Row (or Column) to AnotherDenoted as: Ri → Ri + kRj or Ci → Ci + kCj</p><p>This operation adds a multiple of one row (or column) to another.</p><p></p><p>Example:</p><p>R2 → R2 - 3R1</p><p>A = [[1, 2], [3, 4]] → A' = [[1, 2], [0, -2]]</p><p><h2>Example</h2></p><p>Find the matrix obtained from A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]] by performing the following operations:</p><p>(i) R2 ↔ R3</p><p>(ii) R1 → R1 + R2</p><p></p><p>Solution:</p><p>(i) Interchange R2 and R3:</p><p>A1 = [[1, 2, 3], [7, 8, 9], [4, 5, 6]]</p><p></p><p>(ii) Add R2 to R1:</p><p>A2 = [[8, 10, 12], [7, 8, 9], [4, 5, 6]]</p><p></p><p>Hence, the final matrix is A2 = [[8, 10, 12], [7, 8, 9], [4, 5, 6]].</p><p><h2><span lang="EN-US">Conclusion</span></h2></p><p>Elementary transformations are powerful tools in matrix algebra that help in simplifying and solving mathematical problems efficiently. By using these operations, we can reduce complex matrices into simpler forms, making them easier to analyze and apply in various mathematical and real-world problems.</li></p><p></ol>	<h2>Introduction</h2>\n\\nMatrices are one of the most important tools in mathematics. They are widely used in computer science, economics, engineering, and cryptography. In linear algebra, we often nee	\N	PUBLISHED	2025-11-21 09:07:50	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
25	4	Complex Numbers	complex-numbers	Complex numbers are an essential concept in mathematics, especially in algebra, engineering, and physics. They extend our understanding of numbers beyond the real number line and allow us to solve equations that have no real solutions.</p><p><h1>What Are Complex Numbers?</h1></p><p>A complex number is a number of the form:</p><p></p><p>z = a + bi</p><p></p><p>Where:</p><p>- a is called the real part of the complex number.</p><p>- b is called the imaginary part of the complex number.</p><p>- i is the imaginary unit, defined by the property i^2 = -1.</p><p></p><p>Example:</p><p>3 + 4i where 3 is the real part and 4 is the imaginary part.</p><p><h1>Types of Complex Numbers</h1></p><p>1.  Purely Real Number: If b = 0, the complex number is real.</p><p>Example: 5 + 0i = 5</p><p></p><p>2.Purely Imaginary Number: If a = 0, the complex number is purely imaginary.</p><p>Example: 0 + 3i = 3i</p><p></p><p>3.General Complex Number: Both a and b are non-zero.</p><p>Example: 2 + 5i</p><p><h1>Operations on Complex Numbers</h1></p><p><h2>1. Addition</h2></p><p>(a + bi) + (c + di) = (a + c) + (b + d)i</p><p></p><p>Example:</p><p>(3 + 2i) + (1 + 4i) = 4 + 6i</p><p><h2>2. Subtraction</h2></p><p>(a + bi) - (c + di) = (a - c) + (b - d)i</p><p></p><p>Example:</p><p>(5 + 6i) - (2 + 3i) = 3 + 3i</p><p><h2>3. Multiplication</h2></p><p>(a + bi)(c + di) = (ac - bd) + (ad + bc)i</p><p></p><p>Example:</p><p>(2 + 3i)(1 + 4i) = 2 + 8i + 3i + 12i^2 = 2 + 11i - 12 = -10 + 11i</p><p><h2>4. Division</h2></p><p>Divide by multiplying numerator and denominator by the conjugate of the denominator:</p><p>(a+bi)/(c+di) = ((a+bi)(c-di)) / (c^2+d^2)</p><p></p><p>Example:</p><p>(3 + 2i)/(1 + i) = ((3+2i)(1-i))/(1^2 + 1^2) = (3 - 3i + 2i - 2i^2)/2 = (5 - i)/2 = 2.5 - 0.5i</p><p><h1>Conjugate of a Complex Number</h1></p><p>The conjugate of a + bi is a - bi. Conjugates are useful in division and in finding magnitudes.</p><p></p><p>Example:</p><p>Conjugate of 4 + 5i is 4 - 5i</p><p><h1>Magnitude (Modulus) of a Complex Number</h1></p><p>The magnitude of z = a + bi is given by:</p><p>|z| = √(a^2 + b^2)</p><p></p><p>Example:</p><p>For 3 + 4i, |3 + 4i| = √(3^2 + 4^2) = √(9 + 16) = 5</p><p><h1><span lang="EN-US">Why Complex Numbers Are Important</span></h1></p><p>Solve equations like x^2 + 1 = 0, which have no real solution.</p><p>Used in electrical engineering for AC circuits.</p><p>Applied in physics, quantum mechanics, and signal processing.</p><p>Helpful in computer graphics and control systems.	Complex numbers are an essential concept in mathematics, especially in algebra, engineering, and physics. They extend our understanding of numbers beyond the real number line and allow us to solve equ	\N	PUBLISHED	2025-11-21 09:26:56	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
26	4	Basic Algebraic Properties of Complex Numbers	basic-algebraic-properties-of-complex-numbers	Complex numbers are an essential concept in mathematics, extending the idea of numbers beyond the real number line. A complex number is usually expressed in the form:</p><p></p><p>z = a + bi</p><p></p><p>where:</p><p>- a is the real part of z (Re(z))</p><p>- b is the imaginary part of z (Im(z))</p><p>- i is the imaginary unit, defined as i^2 = -1</p><p></p><p>Understanding the algebraic properties of complex numbers is crucial for solving equations, analyzing functions, and exploring advanced mathematics.</p><p><h1>Addition of Complex Numbers</h1></p><p>If z1 = a + bi and z2 = c + di are two complex numbers, their sum is:</p><p></p><p>z1 + z2 = (a + c) + (b + d)i</p><p></p><p>Example:</p><p>(3 + 2i) + (1 + 4i) = (3+1) + (2+4)i = 4 + 6i</p><p></p><p>Property: Addition of complex numbers is commutative and associative:</p><p>- Commutative: z1 + z2 = z2 + z1</p><p>- Associative: (z1 + z2) + z3 = z1 + (z2 + z3)</p><p><h1>Subtraction of Complex Numbers</h1></p><p>The difference of two complex numbers is:</p><p></p><p>z1 - z2 = (a - c) + (b - d)i</p><p></p><p>Example:</p><p>(5 + 3i) - (2 + i) = (5-2) + (3-1)i = 3 + 2i</p><p><h1> Multiplication of Complex Numbers</h1></p><p>For z1 = a + bi and z2 = c + di, the product is:</p><p></p><p>z1 * z2 = (ac - bd) + (ad + bc)i</p><p></p><p>Example:</p><p>(1 + 2i)(3 + 4i) = (1*3 - 2*4) + (1*4 + 2*3)i = -5 + 10i</p><p></p><p>Property: Multiplication is commutative and associative, and distributes over addition:</p><p>z1 * z2 = z2 * z1, z1(z2 + z3) = z1 * z2 + z1 * z3</p><p><h1>Conjugate of a Complex Number</h1></p><p>The conjugate of z = a + bi is:</p><p></p><p>z̅ = a - bi</p><p></p><p>Properties of Conjugates:</p><p>1. z + z̅ = 2a (real number)</p><p>2. z * z̅ = a^2 + b^2 (non-negative real number)</p><p>3. z̅1 + z̅2 = z̅1 + z̅2</p><p>4. z̅1 * z̅2 = z̅1 * z̅2</p><p><h1>Division of Complex Numbers</h1></p><p>To divide z1 by z2 ≠ 0, multiply numerator and denominator by the conjugate of the denominator:</p><p></p><p>z1 / z2 = (a+bi)/(c+di) * (c-di)/(c-di) = ((ac+bd) + (bc-ad)i)/(c^2 + d^2)</p><p></p><p>Example:</p><p>(1 + 2i)/(3 + 4i) = ((1*3 + 2*4) + (2*3 - 1*4)i)/(3^2 + 4^2) = (11 + 2i)/25 = 11/25 + 2/25i</p><p><h1> Important Algebraic Properties Summary</h1></p><p><table></p><p><tbody></p><p><tr></p><p><td width="288"><strong>Property</strong></td></p><p><td width="288"><strong>Formula</strong></td></p><p></tr></p><p><tr></p><p><td width="288"><strong>Commutative (Addition)</strong></td></p><p><td width="288">z1 + z2 = z2 + z1</td></p><p></tr></p><p><tr></p><p><td width="288"><strong>Commutative (Multiplication)</strong></td></p><p><td width="288">z1 * z2 = z2 * z1</td></p><p></tr></p><p><tr></p><p><td width="288"><strong>Associative (Addition)</strong></td></p><p><td width="288">(z1 + z2) + z3 = z1 + (z2 + z3)</td></p><p></tr></p><p><tr></p><p><td width="288"><strong>Associative (Multiplication)</strong></td></p><p><td width="288">(z1 * z2) * z3 = z1 * (z2 * z3)</td></p><p></tr></p><p><tr></p><p><td width="288"><strong>Distributive</strong></td></p><p><td width="288">z1 * (z2 + z3) = z1 * z2 + z1 * z3</td></p><p></tr></p><p></tbody></p><p></table></p><p><h1>Conclusion</h1></p><p>Complex numbers form a complete algebraic system with well-defined addition, subtraction, multiplication, and division. Mastering these basic algebraic properties helps in solving quadratic equations, analyzing signals in engineering, and exploring higher mathematics in a structured way.	Complex numbers are an essential concept in mathematics, extending the idea of numbers beyond the real number line. A complex number is usually expressed in the form:\n\\n\n\\nz = a + bi\n\\n\n\\nwhere:\n\\n- a	\N	PUBLISHED	2025-11-21 09:33:31	2026-04-08 01:44:02.096696	\N	\N	\N	\N	\N	\N	2026-04-08 01:12:23.859977	2026-04-08 01:12:23.859977
27	4	Conjugate of a Complex Number	conjugate-of-a-complex-number	<h2>Introduction</h2></p><p>Complex numbers play a crucial role in various fields of mathematics, physics, and engineering. A <strong>complex number</strong> is generally expressed as:</p><p></p><p>z = a + bi</p><p></p><p>where:</p><p>- a is the <strong>real part</strong></p><p>- b is the <strong>imaginary part</strong></p><p>- i is the imaginary unit with the property i^2 = -1</p><p></p><p>One important concept associated with complex numbers is the <strong>conjugate</strong>. Understanding the conjugate is essential for performing operations like division, finding magnitudes, and simplifying expressions.</p><p><h2>What is the Conjugate of a Complex Number?</h2></p><p>The <strong>conjugate</strong> of a complex number is obtained by changing the sign of its imaginary part. If the complex number is:</p><p></p><p>z = a + bi</p><p></p><p>then its conjugate, denoted as {z}, is:</p><p></p><p>{z} = a - bi</p><p></p><p><strong>Example:</strong></p><p>If z = 3 + 4i, then the conjugate is:</p><p>{z} = 3 - 4i</p><p><h2>Properties of the Conjugate</h2></p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Sum of a Complex Number and its Conjugate:</strong></p><p>z + {z} = (a + bi) + (a - bi) = 2a</p><p><em>The result is always a real number.</em></li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Difference of a Complex Number and its Conjugate:</strong></p><p>z - {z} = (a + bi) - (a - bi) = 2bi</p><p><em>The result is purely imaginary.</em></li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Product of a Complex Number and its Conjugate:</strong></p><p>z {z} = (a + bi)(a - bi) = a^2 + b^2</p><p><em>The result is always a non-negative real number.</em></li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Conjugate of a Conjugate:</strong></p><p>= z</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Conjugate of a Sum or Difference:</strong></p><p>= {z_1} + {z_2},  = {z_1} - {z_2}</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Conjugate of a Product or Quotient:</strong></p><p>= {z_1} {z_2},  = , z_2</li></p><p></ol></p><p><h2>Applications of Conjugates</h2></p><p><ul></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Division of Complex Numbers:</strong> Conjugates help in rationalizing the denominator.</p><p>Example:</p><p>=  =  =  - i</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Magnitude of a Complex Number:</strong></p><p>|z| =  =</li></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li><strong>Solving Equations:</strong> Conjugates are used to find roots of polynomials with real coefficients.</li></p><p></ul></p><p><h2>Conclusion</h2></p><p>The <strong>conjugate of a complex number</strong> is a simple yet powerful concept in mathematics. It allows us to perform algebraic operations, simplify expressions, and solve problems more efficiently. By understanding its properties and applications, one can gain deeper insights into the world of complex numbers.	<h2>Introduction</h2>\n\\nComplex numbers play a crucial role in various fields of mathematics, physics, and engineering. A <strong>complex number</strong> is generally expressed as:\n\\n\n\\nz = a + bi\n\\n\n	\N	PUBLISHED	2025-11-21 09:40:54	2026-04-08 07:28:29.613459	\N	\N	\N	\N	2	\N	2026-04-08 01:12:23.859977	2026-04-08 07:28:29.613464
28	4	Modulus of a Complex Number	modulus-of-a-complex-number	Complex numbers are an essential part of mathematics, widely used in engineering, physics, and computer science. Understanding their properties helps solve many real-world problems. One fundamental concept in complex numbers is the modulus. In this blog, we will explore what the modulus of a complex number is, how to calculate it, and its importance.</p><p><h1>What is a Complex Number?</h1></p><p>A complex number is a number that has two parts:</p><p>1. Real part (denoted by a)</p><p>2. Imaginary part (denoted by b)</p><p></p><p>It is generally written in the form:</p><p>z = a + bi</p><p></p><p>where i is the imaginary unit with the property i^2 = -1.</p><p></p><p>Example:</p><p>z = 3 + 4i</p><p>Here, 3 is the real part and 4 is the imaginary part.</p><p><h1>Definition of Modulus</h1></p><p>The modulus of a complex number is the distance of that number from the origin in the complex plane. It is denoted by |z|.</p><p></p><p>Mathematically, for a complex number z = a + bi:</p><p>|z| = √(a^2 + b^2)</p><p></p><p>This formula comes from the Pythagorean theorem, considering the complex number as a point (a, b) on a plane.</p><p><h1>How to Calculate the Modulus</h1></p><p>Step 1: Identify the real part a and imaginary part b.</p><p>Step 2: Square both a and b.</p><p>Step 3: Add the squares.</p><p>Step 4: Take the square root of the sum.</p><p></p><p>Example 1:</p><p>z = 3 + 4i</p><p>|z| = √(3^2 + 4^2) = √(9 + 16) = √25 = 5</p><p>So, the modulus of 3 + 4i is 5.</p><p></p><p>Example 2:</p><p>z = 1 - i</p><p>|z| = √(1^2 + (-1)^2) = √(1 + 1) = √2</p><p><h1>Geometric Interpretation</h1></p><p>A complex number can be represented as a point on the complex plane, with the x-axis as the real axis and y-axis as the imaginary axis. The modulus represents the distance from the origin (0,0) to the point (a,b).</p><p></p><p>Distance = √((x2 - x1)^2 + (y2 - y1)^2) = √(a^2 + b^2)</p><p></p><p>Thus, modulus gives a way to measure how “far” a complex number is from zero.</p><p><h1>Properties of Modulus</h1></p><p><ol></p><p> &nbsp;&nbsp;&nbsp;&nbsp;<li>|z| ≥ 0 for any complex number z.</p><p>2. |z| = 0 if and only if z = 0.</p><p>3. For two complex numbers z1 and z2:</p><p>|z1 z2| = |z1| |z2| and |z1/z2| = |z1| / |z2| (z2 ≠ 0)</p><p>4. |z̅| = |z|, where z̅ is the conjugate of z.</li></p><p></ol></p><p><h1>Applications of Modulus</h1></p><p>- Engineering: Calculating the amplitude of electrical signals.</p><p>- Physics: Representing wave magnitudes and oscillations.</p><p>- Mathematics: Solving equations and inequalities involving complex numbers.</p><p>- Computer Science: Signal processing, graphics, and simulations.</p><p><h1>Conclusion</h1></p><p>The modulus of a complex number is a fundamental concept that provides a geometric interpretation of complex numbers as distances on the plane. By understanding the modulus, one can analyze the size and relationships between complex numbers effectively. Whether in academics or real-world applications, mastering this concept is crucial for deeper study in mathematics and related fields.	Complex numbers are an essential part of mathematics, widely used in engineering, physics, and computer science. Understanding their properties helps solve many real-world problems. One fundamental co	\N	PUBLISHED	2025-11-21 09:46:42	2026-04-08 07:28:16.635898	\N	\N	\N	\N	17	\N	2026-04-08 01:12:23.859977	2026-04-08 07:28:16.635902
\.


--
-- Data for Name: certificate_element_templates; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.certificate_element_templates (id, element_name, element_type, element_content, element_image_url, element_styles, default_position_x, default_position_y, default_width, default_height, is_active, usage_count, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: certificate_verifications; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.certificate_verifications (id, certificate_id, certificate_hash, verified_by_ip, verified_by_user_agent, verification_result, verified_at) FROM stdin;
\.


--
-- Data for Name: certificates; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.certificates (id, post_author, post_date, post_content, post_title, post_excerpt, post_status, post_name, post_modified, post_parent, menu_order, post_type, certificate_orientation, certificate_size, certificate_width, certificate_height, background_image, background_color, title_font_size, title_font_color, title_font_family, body_font_size, body_font_color, body_font_family, elements_config, show_student_name, show_course_name, show_completion_date, show_certificate_id, show_instructor_signature, show_admin_signature, enable_qr_code, qr_code_size, qr_code_position, created_at, updated_at) FROM stdin;
1	1	2026-03-17 10:15:23.714404+00	\N	Classic Gold	\N	publish	\N	2026-03-17 10:15:23.714404+00	\N	\N	certificate	landscape	A4	1122	794	\N	#FFF8DC	36	#8B6914	Georgia	18	#333333	Georgia	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:15:23.714404+00	2026-03-17 10:15:23.714404+00
2	1	2026-03-17 10:15:23.714404+00	\N	Modern Blue	\N	publish	\N	2026-03-17 10:15:23.714404+00	\N	\N	certificate	landscape	A4	1122	794	\N	#F0F4FF	36	#1a3a8f	Arial	18	#222222	Arial	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:15:23.714404+00	2026-03-17 10:15:23.714404+00
3	1	2026-03-17 10:15:23.714404+00	\N	Elegant Dark	\N	publish	\N	2026-03-17 10:15:23.714404+00	\N	\N	certificate	landscape	A4	1122	794	\N	#1a1a2e	36	#FFD700	Times New Roman	18	#FFFFFF	Times New Roman	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:15:23.714404+00	2026-03-17 10:15:23.714404+00
4	1	2026-03-17 10:15:23.714404+00	\N	Minimal White	\N	publish	\N	2026-03-17 10:15:23.714404+00	\N	\N	certificate	landscape	A4	1122	794	\N	#FFFFFF	36	#000000	Helvetica	18	#444444	Helvetica	\N	t	t	t	t	f	\N	t	\N	\N	2026-03-17 10:15:23.714404+00	2026-03-17 10:15:23.714404+00
5	1	2026-03-17 10:15:23.714404+00	\N	Nature Green	\N	publish	\N	2026-03-17 10:15:23.714404+00	\N	\N	certificate	landscape	A4	1122	794	\N	#F0FFF0	36	#2d6a4f	Palatino	18	#333333	Palatino	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:15:23.714404+00	2026-03-17 10:15:23.714404+00
6	1	2026-03-17 10:17:57.545718+00	\N	Classic Gold	\N	publish	\N	2026-03-17 10:17:57.545718+00	\N	\N	certificate	landscape	A4	1122	794	\N	#FFF8DC	36	#8B6914	Georgia	18	#333333	Georgia	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:17:57.545718+00	2026-03-17 10:17:57.545718+00
7	1	2026-03-17 10:17:57.545718+00	\N	Modern Blue	\N	publish	\N	2026-03-17 10:17:57.545718+00	\N	\N	certificate	landscape	A4	1122	794	\N	#F0F4FF	36	#1a3a8f	Arial	18	#222222	Arial	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:17:57.545718+00	2026-03-17 10:17:57.545718+00
8	1	2026-03-17 10:17:57.545718+00	\N	Elegant Dark	\N	publish	\N	2026-03-17 10:17:57.545718+00	\N	\N	certificate	landscape	A4	1122	794	\N	#1a1a2e	36	#FFD700	Times New Roman	18	#FFFFFF	Times New Roman	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:17:57.545718+00	2026-03-17 10:17:57.545718+00
9	1	2026-03-17 10:17:57.545718+00	\N	Minimal White	\N	publish	\N	2026-03-17 10:17:57.545718+00	\N	\N	certificate	landscape	A4	1122	794	\N	#FFFFFF	36	#000000	Helvetica	18	#444444	Helvetica	\N	t	t	t	t	f	\N	t	\N	\N	2026-03-17 10:17:57.545718+00	2026-03-17 10:17:57.545718+00
10	1	2026-03-17 10:17:57.545718+00	\N	Nature Green	\N	publish	\N	2026-03-17 10:17:57.545718+00	\N	\N	certificate	landscape	A4	1122	794	\N	#F0FFF0	36	#2d6a4f	Palatino	18	#333333	Palatino	\N	t	t	t	t	t	\N	t	\N	\N	2026-03-17 10:17:57.545718+00	2026-03-17 10:17:57.545718+00
\.


--
-- Data for Name: coupon_course_restrictions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.coupon_course_restrictions (id, coupon_id, course_id, created_at) FROM stdin;
\.


--
-- Data for Name: coupon_usage; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.coupon_usage (id, coupon_id, user_id, order_id, discount_amount, used_at) FROM stdin;
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.coupons (id, code, description, discount_type, discount_value, applicability, usage_limit, usage_count, per_user_limit, minimum_purchase_amount, valid_from, valid_until, is_active, created_by, created_at, updated_at) FROM stdin;
1	ASD		percentage	1.00	all_courses	2	0	1	1.00	2026-04-08 09:12:09.286705+00	2026-04-22 02:45:00+00	t	4	2026-04-08 09:15:50.284686+00	2026-04-08 09:15:50.284686+00
2	SAVE20		percentage	10.00	all_courses	10	0	1	0.00	2026-04-08 09:12:09.286705+00	2026-04-22 15:27:00+00	t	4	2026-04-08 09:31:33.103474+00	2026-04-08 09:57:08.826736+00
\.


--
-- Data for Name: course_announcements; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_announcements (id, course_id, post_author, post_title, post_content, post_excerpt, post_status, post_date, post_modified, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_categories; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_categories (id, name, slug, description, parent_id, term_order, created_at) FROM stdin;
\.


--
-- Data for Name: course_category_relations; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_category_relations (course_id, category_id) FROM stdin;
\.


--
-- Data for Name: course_certificates; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_certificates (id, course_id, certificate_id, required_completion_percentage, required_quiz_pass, required_assignment_pass, auto_generate, email_to_student, created_at) FROM stdin;
\.


--
-- Data for Name: course_reviews; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_reviews (id, course_id, user_id, rating, review_title, review_content, review_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: course_tag_relations; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_tag_relations (course_id, tag_id) FROM stdin;
\.


--
-- Data for Name: course_tags; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.course_tags (id, name, slug, description, created_at) FROM stdin;
\.


--
-- Data for Name: courses; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.courses (id, post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt, post_status, comment_status, ping_status, post_password, post_name, to_ping, pinged, post_modified, post_modified_gmt, post_content_filtered, post_parent, guid, menu_order, post_type, post_mime_type, comment_count, course_price_type, course_price, course_sale_price, course_duration, course_level, course_category, course_language, course_benefits, course_requirements, course_target_audience, course_material_includes, course_thumbnail, course_cover_image, course_intro_video, course_retakes_allowed, course_auto_start_next_lesson, course_content_drip_type, certificate_template, certificate_design, total_enrollments, average_rating, total_reviews, created_at, updated_at, course_sections_meta, course_type) FROM stdin;
12	4	2026-03-26 16:44:00.753638+00	2026-03-26 16:44:00.753638+00	🎯 Course Overview\n\nThis React.js course introduces learners to one of the most widely used JavaScript libraries for building fast, interactive, and scalable user interfaces. The course focuses on hands-on practice, guiding you from the basics of React components and state management to more advanced concepts like hooks, routing, and API integration.\n\nThrough real-world examples and mini-projects, you will learn how to structure applications, manage data flow, and create dynamic web pages that respond to user interactions. By the end of the course, you will be able to build modern front-end applications confidently using React’s component-based architecture.	React JS Mastery (TAMIL)	Learn how to build fast, interactive, and scalable user interfaces using React.js. This course covers core concepts like components, state management, hooks, routing, and API integration through hands-on projects, helping you confidently create modern front-end applications.	publish	open	open		react-js-mastery-(tamil)			2026-03-26 16:44:00.753638+00	2026-03-26 16:44:00.753638+00		0		0	courses		0	paid	500.00	0.00	0	intermediate	Web Development	Tamil	[]	[]			https://lms.sashainfinity.com/uploads/images/007a699f-f47d-43c7-aba7-a5a75256650c.png			t	f	none		{}	5	0.00	0	2026-03-26 16:44:00.753638+00	2026-04-08 09:30:05.208778+00	[{"id":"section-1","title":"React","description":"All course content","order":0,"lectureIds":["lesson-51","lesson-52","lesson-53","quiz-2","lesson-55","lesson-80","lesson-81","quiz-7","lesson-83","lesson-84","lesson-85","quiz-8","lesson-87","lesson-88","quiz-9","assignment-6"]}]	
10	11	2026-03-18 09:23:14.538977+00	2026-03-18 09:23:14.538977+00	🎯 Course Overview\n\nThis beginner-friendly course introduces you to the fundamentals of web development — from creating websites using HTML, CSS, and JavaScript to managing your code with Git and GitHub — all explained through Tamil-language video lessons.\n\nIn addition, you’ll learn how to integrate Artificial Intelligence (AI) tools to enhance your development workflow, generate creative ideas, and even build AI-assisted portfolio websites.\n\nBy the end of the course, you’ll have a fully functional personal portfolio site built with your own code and customized through AI tools.\n\n🧠 What You’ll Learn\n\nHTML (Structure of the Web)\n\nBuilding web page layouts\n\nAdding text, images, links, tables, and forms\n\nCSS (Design and Styling)\n\nDesigning beautiful and responsive layouts\n\nWorking with colors, fonts, and animations\n\nJavaScript (Interactivity & Logic)\n\nMaking your website dynamic\n\nDOM manipulation, event handling\n\nBasic AI interactivity (chatbots, auto-suggest features, etc.)\n\nGit & GitHub (Version Control)\n\nSaving and managing your code\n\nUploading your portfolio to GitHub\n\nAI Integration for Developers\n\nIntroduction to top AI tools like ChatGPT, Gemini, Copilot, and Blackbox AI\n\nWriting effective prompts for code generation and debugging\n\nUsing AI to generate web content, designs, and personalized portfolio templates\n\nPortfolio Website Creation\n\nBuild your own portfolio using HTML, CSS, and JS\n\nUse different AI tools to generate unique portfolio themes\n\nChatGPT – Resume-focused portfolio\n\nGemini – Creative designer portfolio\n\nCodeium - alternative generation of portfolio site\n\nClaude AI - extended\nAmazon Q coder\nAWS coder	Full Stack Development with AI (Tamil)	Beginner-friendly Tamil course covering HTML, CSS, JavaScript, Git, and GitHub fundamentals. Learn to build structured, styled, and interactive websites with real examples. Understand version control and how to manage and upload projects using GitHub. Explore AI tools like ChatGPT, Gemini, Copilot, and others for coding and design. Create a personalized portfolio website using both coding skills and AI assistance.	publish	open	open		full-stack-development-with-ai-(tamil)			2026-03-18 09:23:14.538977+00	2026-03-18 09:23:14.538977+00		0		0	courses		0	free	0.00	\N	24	intermediate	Web Development	English	["Overview  This course blends the power of traditional web development with modern Artificial Intelligence tools. Students will learn to build, style, and deploy dynamic websites using HTML, CSS, JavaScript, Git, APIs, and integrate AI-assisted coding through tools like Gemini, Claude, ChatGPT, Codeium, Amazon Q Developer, and AWS CodeWhisperer. By the end of this program, learners will have a fully functional AI-enhanced portfolio website \\u2014 coded, designed, and deployed by themselves.  \\ud83d\\udca1 What Will I Learn?  Build responsive websites using HTML5, CSS3, and JavaScript (ES6)  Implement version control and collaboration using Git & GitHub  Work with public APIs and fetch real-time data for web applications  Deploy projects using GitHub Pages and Vercel  Integrate AI tools inside VS Code for coding assistance, layout generation, and documentation  Create and deploy an AI-generated personal portfolio  Use AI tools for debugging, optimization, and documentation  Apply best practices for secure, efficient, and automated web development"]	["Laptop", "Internet"]			https://lms.sashainfinity.com/uploads/images/5d9d645b-fd01-4acd-8b7f-31dc6de46ff9.jpeg		https://vz-60dda74a-f32.b-cdn.net/c517092a-0461-4e3a-9037-051a6003be82/playlist.m3u8	t	f	none		{}	5	0.00	0	2026-03-18 09:23:14.538977+00	2026-04-08 09:21:43.194077+00	[{"id":"section-1","title":"HTML","description":"HTML Module","order":0,"lectureIds":["lesson-43","quiz-3","lesson-46","assignment-2"]},{"id":"1774439953929","title":"CSS","description":"CSS Course Description","order":1,"lectureIds":["lesson-61","lesson-62","lesson-63","quiz-4","assignment-3"]},{"id":"1775143043040","title":"Lecture Documents","description":"","order":2,"lectureIds":["lesson-127"]},{"id":"1774565769582","title":"Java Script","description":"","order":3,"lectureIds":["lesson-69","lesson-70","quiz-5","lesson-73"]},{"id":"1774567369285","title":"GIT","description":"GIT Course Description","order":4,"lectureIds":["lesson-74","assignment-4","quiz-6"]},{"id":"1775143031308","title":"Portfolio assignment","description":"","order":5,"lectureIds":["lesson-128","assignment-13"]},{"id":"1775143057279","title":"Lecture Documents 2","description":"","order":6,"lectureIds":[]},{"id":"1775143057619","title":"AI with Full stack","description":"","order":7,"lectureIds":["lesson-130","lesson-131","lesson-132","quiz-16","lesson-134","quiz-17","lesson-136","lesson-137","lesson-138","lesson-139"]}]	
11	4	2026-03-23 16:25:28.989369+00	2026-03-23 16:25:28.989369+00	🎯 Course Overview\n\nThis beginner-friendly course introduces you to the fundamentals of web development — from creating websites using HTML, CSS, and JavaScript to managing your code with Git and GitHub — all explained through Tamil-language video lessons.\n\nIn addition, you’ll learn how to integrate Artificial Intelligence (AI) tools to enhance your development workflow, generate creative ideas, and even build AI-assisted portfolio websites.\n\nBy the end of the course, you’ll have a fully functional personal portfolio site built with your own code and customized through AI tools.\n\n🧠 What You’ll Learn\n\nHTML (Structure of the Web)\n\nBuilding web page layouts\n\nAdding text, images, links, tables, and forms\n\nCSS (Design and Styling)\n\nDesigning beautiful and responsive layouts\n\nWorking with colors, fonts, and animations\n\nJavaScript (Interactivity & Logic)\n\nMaking your website dynamic\n\nDOM manipulation, event handling\n\nBasic AI interactivity (chatbots, auto-suggest features, etc.)\n\nGit & GitHub (Version Control)\n\nSaving and managing your code\n\nUploading your portfolio to GitHub\n\nAI Integration for Developers\n\nIntroduction to top AI tools like ChatGPT, Gemini, Copilot, and Blackbox AI\n\nWriting effective prompts for code generation and debugging\n\nUsing AI to generate web content, designs, and personalized portfolio templates\n\nPortfolio Website Creation\n\nBuild your own portfolio using HTML, CSS, and JS\n\nUse different AI tools to generate unique portfolio themes\n\nChatGPT – Resume-focused portfolio\n\nGemini – Creative designer portfolio\n\nCodeium - alternative generation of portfolio site\n\nClaude AI - extended\nAmazon Q coder\nAWS coder	Full Stack Development with AI-Advance (Tamil)	This beginner-friendly course teaches the basics of web development using HTML, CSS, and JavaScript through Tamil-language videos. You’ll learn how to build and design websites, add interactivity, manage code with Git and GitHub, and use AI tools like ChatGPT and others to speed up development. By the end, you’ll create your own fully functional, AI-enhanced portfolio website.	publish	open	open		digital-marketing			2026-03-23 16:25:28.989369+00	2026-03-23 16:25:28.989369+00		0		0	courses		0	free	0.00	\N	0	advanced	Digital Marketing	English	["new"]	["laptop"]			https://lms.sashainfinity.com/uploads/images/f0cb4102-4582-4b4c-b1ee-bc98372f1eaf.jpg		https://vz-60dda74a-f32.b-cdn.net/05312f3d-e9cb-41cd-82c5-ce025d2b1cc5/playlist.m3u8	t	f	none		{}	3	0.00	0	2026-03-23 16:25:28.989369+00	2026-04-08 07:13:58.392687+00	[{"id":"section-1","title":"HTML","description":"HTML Module","order":0,"lectureIds":["lesson-93","quiz-10","lesson-94","assignment-7"]},{"id":"1775104459349","title":"CSS","description":"CSS Module","order":1,"lectureIds":["lesson-114","lesson-115","lesson-116","quiz-13","assignment-9"]},{"id":"1775104978195","title":"Java Script","description":"JavaScript Module","order":2,"lectureIds":["lesson-119","lesson-120","quiz-14","lesson-124"]},{"id":"1775145785548","title":"GIT","description":"","order":3,"lectureIds":["lesson-144","assignment-15","quiz-18"]},{"id":"1775145786046","title":"API","description":"","order":4,"lectureIds":["lesson-148","quiz-19"]},{"id":"1775145786526","title":"Portfolio assignment","description":"","order":5,"lectureIds":["assignment-10","lesson-150"]},{"id":"1775145758398","title":"Lecture Documents","description":"","order":6,"lectureIds":[]},{"id":"1775145786916","title":"Lecture Documents 2","description":"","order":7,"lectureIds":[]},{"id":"1775145787264","title":"AI with Full stack","description":"","order":8,"lectureIds":["lesson-151","lesson-152","lesson-153","quiz-20","lesson-154","quiz-21","lesson-155","lesson-156","lesson-157","lesson-158","lesson-159"]},{"id":"1775145787644","title":"React","description":"","order":9,"lectureIds":["lesson-161","lesson-162","lesson-163","lesson-164","lesson-165","lesson-166","lesson-167","lesson-145","lesson-168","lesson-169","lesson-160"]},{"id":"1775145788820","title":"Node Js","description":"","order":10,"lectureIds":["lesson-170","lesson-171","lesson-172"]},{"id":"1775145789130","title":"Back end Development","description":"","order":11,"lectureIds":["lesson-173","lesson-174","lesson-175","lesson-176","lesson-177"]},{"id":"1775146024107","title":"🎓 Final Assignment: AI-Integrated Portfolio Development","description":"","order":12,"lectureIds":["assignment-16"]}]	
9	4	2026-03-17 10:33:17.531602+00	2026-03-17 10:33:17.531602+00	LearnThis course is designed to help beginners build a strong foundation in data analytics using Microsoft Excel. It covers essential concepts such as data entry, cleaning, and organization, along with key Excel tools like formulas, functions, sorting, filtering, and basic data visualization techniques.\n\nLearners will gain hands-on experience working with real-world datasets to understand how to analyze information effectively and present insights using charts and pivot tables. The course also introduces basic analytical thinking, enabling students to identify patterns and trends in data.\n\nBy the end of the course, participants will be equipped with practical Excel skills to perform simple data analysis tasks and create clear, informative reports, making it ideal for students, professionals, and anyone looking to start a career in data analytics.	Data analytics using MS-Excel-Beginner	This Intermediate course introduces the fundamentals of data analytics using Microsoft Excel. You’ll learn how to organize, clean, and analyze data using essential tools like formulas, functions, charts, and pivot tables. By the end, you’ll be able to turn raw data into meaningful insights and create simple reports for decision-making—no prior experience required.	publish	open	open		hello			2026-03-17 10:33:17.531602+00	2026-03-17 10:33:17.531602+00		0		0	course		0	paid	0.00	0.00		intermediate	Data Science	English	[]	[]			https://lms.sashainfinity.com/uploads/images/93bc2ce5-7d58-48ea-bad9-142111912c74.jpg		https://vz-60dda74a-f32.b-cdn.net/1200863f-6cb4-4a78-aef4-5049dfd54756/playlist.m3u8	t	f	none	1	{}	3	0.00	0	2026-03-17 10:33:17.531602+00	2026-04-08 07:44:31.409328+00	[{"id":"section-1","title":"Introduction to Excel","description":"• Overview of Excel interface • Understanding workbooks, worksheets, and cells • Navigating through rows and columns • Range • Basic keyboard shortcuts","order":0,"lectureIds":["lesson-10","lesson-112","quiz-12"]},{"id":"1775216295456","title":"Data Entry and Formatting","description":"• Introduction to basic formulas (Difference between Formula and Function) • Data Type • Auto Fill Option • Paste specials • Fill Without Formatting","order":1,"lectureIds":["lesson-179","lesson-180","quiz-22"]},{"id":"1775216295802","title":"Statistical Function and Reference","description":"• Functions: (SUM, MIN, MAX, AVG, COUNT, COUNTA, LARGE, SMALL)\\n• Using cell references (relative and absolute)","order":2,"lectureIds":["lesson-182","lesson-183"]},{"id":"1775216296260","title":"Data Management","description":"• Sorting data in Excel • Filtering data to display specific information • Data validation and drop-down lists • Introduction to tables (Table Properties, Table Styles, Difference between Range and Table)","order":3,"lectureIds":["lesson-184","lesson-185","lesson-186"]},{"id":"1775216297182","title":"Charts and Graphs","description":"• Creating basic charts (Column/bar, pie, line) • Formatting and customizing charts • Adding titles and labels to charts • Using chart templates","order":4,"lectureIds":["lesson-187"]},{"id":"1775216297580","title":"Pivot Table","description":"• Introduction to PivotTables • Understanding PivotTables and Pivot Charts • Creating and formatting PivotTables • Analyzing and summarizing data with PivotTables","order":5,"lectureIds":["lesson-188"]},{"id":"1775216297974","title":"Assignment","description":"Upload the assignment","order":6,"lectureIds":["assignment-17"]}]	
\.


--
-- Data for Name: earnings; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.earnings (earning_id, user_id, course_id, order_id, order_status, course_price_total, course_price_grand_total, instructor_amount, instructor_rate, admin_amount, admin_rate, commission_type, deduct_fees_amount, deduct_fees_name, deduct_fees_type, process_by, created_at) FROM stdin;
\.


--
-- Data for Name: enrollments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.enrollments (id, course_id, user_id, order_id, enrollment_date, enrollment_status, course_progress_percentage, completed_lessons, total_lessons, completed_quizzes, total_quizzes, completion_date, completion_mode, completion_mode_text, certificate_id, certificate_url, created_at, updated_at) FROM stdin;
22	11	4	\N	2026-03-23 16:27:54.917377+00	enrolled	0	0	1	0	0	2026-03-23 17:44:11.181528+00			\N	\N	2026-03-23 16:27:54.917377+00	2026-03-23 19:51:01.031302+00
28	9	10	\N	2026-04-01 11:25:55.269804+00	enrolled	0	0	0	0	0	\N			\N	\N	2026-04-01 11:25:55.269804+00	2026-04-01 11:25:55.269804+00
25	9	9	\N	2026-03-24 04:44:40.466655+00	cancelled	0	0	1	0	0	2026-03-24 09:38:10.662123+00			\N	\N	2026-03-24 04:44:40.466655+00	2026-04-02 06:23:59.629543+00
30	9	54	\N	2026-04-06 10:10:56.561881+00	enrolled	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:10:56.561881+00	2026-04-06 10:14:51.732046+00
31	12	14	\N	2026-04-06 10:44:57.13318+00	enrolled	0	0	0	0	0	\N			\N	\N	2026-04-06 10:44:57.13318+00	2026-04-06 10:44:57.13318+00
29	10	14	\N	2026-04-04 18:48:19.049275+00	enrolled	6	2	19	0	0	\N			\N	\N	2026-04-04 18:48:19.049275+00	2026-04-07 11:04:32.303599+00
24	11	9	\N	2026-03-24 04:44:14.764191+00	cancelled	0	0	2	0	0	2026-03-24 09:38:08.020895+00			\N	\N	2026-03-24 04:44:14.764191+00	2026-03-24 09:42:05.660189+00
23	10	9	\N	2026-03-24 04:43:48.209783+00	cancelled	0	0	0	0	0	\N			\N	\N	2026-03-24 04:43:48.209783+00	2026-03-24 09:42:08.959521+00
21	10	4	\N	2026-03-18 10:20:25.781172+00	enrolled	10	3	19	0	0	2026-03-25 11:14:19.940255+00			\N	\N	2026-03-18 10:20:25.781172+00	2026-04-08 00:45:30.287523+00
33	12	54	\N	2026-04-08 06:02:02.474522+00	enrolled	0	0	11	0	0	\N			\N	\N	2026-04-08 06:02:02.474522+00	2026-04-08 06:02:02.474522+00
34	11	54	\N	2026-04-08 06:47:38.882662+00	enrolled	0	0	39	0	0	\N			\N	\N	2026-04-08 06:47:38.882662+00	2026-04-08 06:47:38.882662+00
20	9	4	\N	2026-03-17 10:34:55.739387+00	enrolled	21	2	11	0	0	2026-03-17 10:35:10.602626+00			\N	\N	2026-03-17 10:34:55.739387+00	2026-04-08 07:11:25.184851+00
27	12	4	\N	2026-03-27 12:36:40.462534+00	enrolled	0	0	11	0	0	\N			\N	\N	2026-03-27 12:36:40.462534+00	2026-03-27 12:36:40.462534+00
32	10	54	\N	2026-04-08 06:00:25.723037+00	enrolled	10	1	19	0	0	\N			\N	\N	2026-04-08 06:00:25.723037+00	2026-04-08 07:43:51.399961+00
37	10	556	\N	2026-04-08 09:10:44.498098+00	enrolled	0	0	19	0	0	\N			\N	\N	2026-04-08 09:10:44.498098+00	2026-04-08 09:10:44.498098+00
38	12	556	\N	2026-04-08 09:11:33.034215+00	enrolled	0	0	0	0	0	\N			\N	\N	2026-04-08 09:11:33.034215+00	2026-04-08 09:11:33.034215+00
\.


--
-- Data for Name: instructor_profiles; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.instructor_profiles (id, user_id, instructor_rating, instructor_bio, instructor_designation, profile_completion, is_approved, is_blocked, earning_commission_type, earning_commission_amount, created_at, updated_at) FROM stdin;
3	8	0	learn to new thing\n	web developer	50	t	f	percentage	80	2026-03-10 11:02:21.58354+00	2026-03-10 11:07:09.017453+00
4	11	0	Expertise in software development 	Software engineer	50	t	f	percentage	80	2026-04-02 05:09:26.807757+00	2026-04-02 05:10:26.130064+00
5	556	0	A senior software engineer	Software engineer	50	t	f	percentage	80	2026-04-08 08:57:15.199332+00	2026-04-08 08:59:05.77728+00
\.


--
-- Data for Name: instructor_reviews; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.instructor_reviews (id, course_id, instructor_id, student_id, rating, review_title, review_content, is_private, is_read, instructor_response, response_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: issued_certificates; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.issued_certificates (id, certificate_id, course_id, user_id, certificate_hash, secure_certificate_id, certificate_title, certificate_content, completion_date, course_completion_percentage, quiz_completion_percentage, assignment_completion_percentage, certificate_file_path, certificate_download_url, is_valid, expires_at, invalidated_date, invalidation_reason, email_sent, email_sent_date, created_at, updated_at) FROM stdin;
6	1	9	4	94f8cc7b1968a1e42a837175f3244fe7	9B5080CF33807DCBD636	Certificate of Completion - HELLO		2026-03-17 10:35:10.602626+00	100.00	0.00	0.00		/certificate-files/certificate_b1a044ad108e470abba3679dd0df8cca.pdf	t	\N	\N		f	\N	2026-03-18 10:51:39.894392+00	2026-03-18 10:51:39.906653+00
\.


--
-- Data for Name: lesson_progress; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.lesson_progress (id, user_id, course_id, lesson_id, enrollment_id, progress_status, completion_date, video_current_time, video_total_duration, video_completion_percentage, reading_time, created_at, updated_at) FROM stdin;
2	4	9	10	20	completed	2026-03-17 10:35:06.80489+00	0	0	0	0	2026-03-17 10:35:06.789532+00	2026-03-17 10:35:06.789532+00
3	4	10	43	21	completed	2026-03-24 08:47:45.734496+00	0	0	0	0	2026-03-24 08:47:45.72672+00	2026-03-24 08:47:45.72672+00
4	4	10	61	21	completed	2026-04-02 03:59:50.019781+00	0	0	0	0	2026-04-02 03:59:50.013786+00	2026-04-02 03:59:50.013786+00
5	14	10	43	29	completed	2026-04-07 10:59:45.737417+00	0	0	0	0	2026-04-07 10:59:45.731313+00	2026-04-07 10:59:45.731313+00
6	14	10	46	29	completed	2026-04-07 11:00:07.875346+00	0	0	0	0	2026-04-07 11:00:07.861133+00	2026-04-07 11:00:07.861133+00
7	4	10	46	21	completed	2026-04-08 00:45:27.324938+00	0	0	0	0	2026-04-08 00:45:27.3144+00	2026-04-08 00:45:27.3144+00
8	4	9	180	20	completed	2026-04-08 07:01:37.235633+00	0	0	0	0	2026-04-08 07:01:37.224209+00	2026-04-08 07:01:37.224209+00
9	54	10	43	32	completed	2026-04-08 07:41:40.659048+00	0	0	0	0	2026-04-08 07:41:40.651578+00	2026-04-08 07:41:40.651578+00
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.lessons (id, post_author, post_date, post_content, post_title, post_excerpt, post_status, post_name, post_modified, post_parent, menu_order, post_type, lesson_video_source, lesson_video_url, lesson_youtube_url, lesson_video_duration, lesson_video_poster, lesson_attachments, lesson_preview, created_at, updated_at, lesson_attachment_url) FROM stdin;
119	4	2026-04-02 04:51:21.532506+00		Java script		publish	new-lesson	2026-04-02 04:51:21.532506+00	11	8	lesson	html5		https://player.mediadelivery.net/play/618286/11c50aa1-f56a-42f8-9526-ce1a42a86717	0			f	2026-04-02 04:51:21.532506+00	2026-04-03 11:19:04.271804+00	
128	4	2026-04-02 15:19:41.422274+00		Portfolio lecture		publish	new-lesson	2026-04-02 15:19:41.422274+00	10	11	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/caf01bc8-dd56-4e5d-a278-7aeae85c3e23/playlist.m3u8		2			f	2026-04-02 15:19:41.422274+00	2026-04-03 03:40:23.597962+00	
43	4	2026-03-24 08:45:35.474933+00		HTML Introduction		publish	new-lesson	2026-03-24 08:45:35.474933+00	10	1	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/780ee97e-f36f-460b-89b3-3703c10a71ac/playlist.m3u8		24			f	2026-03-24 08:45:35.474933+00	2026-03-26 16:56:02.803459+00	[]
131	4	2026-04-02 15:52:39.80978+00		AI overview		publish	new-lesson	2026-04-02 15:52:39.80978+00	10	13	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/d6c2158c-e191-4996-961e-e1dd06f50ced/playlist.m3u8		3			f	2026-04-02 15:52:39.80978+00	2026-04-03 09:40:06.180191+00	
124	4	2026-04-02 07:04:52.660762+00		Java Script (String Methods & Conclusion)		publish	new-lesson	2026-04-02 07:04:52.660762+00	11	9	lesson	html5		https://player.mediadelivery.net/play/618286/98a52601-fb3b-4d9f-8725-fdac88e48305	0			f	2026-04-02 07:04:52.660762+00	2026-04-03 11:20:50.479018+00	
132	4	2026-04-02 15:52:40.833661+00		Google Gemini & Full stack		publish	new-lesson	2026-04-02 15:52:40.833661+00	10	14	lesson	html5		https://player.mediadelivery.net/play/618286/9fb7a064-9d0a-4389-b5d8-40d5ea416ec5	15			f	2026-04-02 15:52:40.833661+00	2026-04-03 15:33:54.526508+00	
88	4	2026-03-27 09:45:32.349396+00		React Tailwind		publish	new-lesson	2026-03-27 09:45:32.349396+00	12	14	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/4ba6e649-b7c2-4b5e-b959-07d27dee86ba/playlist.m3u8		16			f	2026-03-27 09:45:32.349396+00	2026-03-27 11:20:49.453149+00	
87	4	2026-03-27 09:45:31.909065+00		React Bootstrap		publish	new-lesson	2026-03-27 09:45:31.909065+00	12	13	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/1882e723-4f63-4d56-8216-d3fa34063983/playlist.m3u8		15			f	2026-03-27 09:45:31.909065+00	2026-03-27 11:25:35.04011+00	
63	4	2026-03-26 20:12:14.369732+00		CSS (Colors & Conclusion)		publish	new-lesson	2026-03-26 20:12:14.369732+00	10	5	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/83cf0791-906b-4fd8-af4f-835cb1be085d/playlist.m3u8		28			f	2026-03-26 20:12:14.369732+00	2026-03-26 20:34:34.326914+00	
84	4	2026-03-27 09:41:37.04268+00		React Axios		publish	new-lesson	2026-03-27 09:41:37.04268+00	12	10	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/15f5490b-3899-4425-817f-ed962a53eb73/playlist.m3u8		9			f	2026-03-27 09:41:37.04268+00	2026-03-27 11:29:07.971371+00	
46	4	2026-03-25 11:12:53.281159+00		HTML ELEMENTS		publish	new-lesson	2026-03-25 11:12:53.281159+00	10	2	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/364eac36-b512-4837-84f8-b65d04372f8c/playlist.m3u8		15			f	2026-03-25 11:12:53.281159+00	2026-03-25 11:31:07.28448+00	
69	4	2026-03-26 22:20:03.126673+00		Java script		publish	new-lesson	2026-03-26 22:20:03.126673+00	10	7	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/11c50aa1-f56a-42f8-9526-ce1a42a86717/playlist.m3u8		20			f	2026-03-26 22:20:03.126673+00	2026-03-26 22:24:19.675366+00	
55	4	2026-03-26 17:23:33.844883+00		React Props		publish	new-lesson	2026-03-26 17:23:33.844883+00	12	4	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/afe85f35-48f5-44e5-8019-e299518d4a21/playlist.m3u8		31			f	2026-03-26 17:23:33.844883+00	2026-03-27 10:39:18.914879+00	
61	4	2026-03-26 20:00:36.521968+00		CSS (Introduction)		publish	new-lesson	2026-03-26 20:00:36.521968+00	10	3	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/1dc34c59-1e12-442c-958d-63cf48f7dd8c/playlist.m3u8		30			f	2026-03-26 20:00:36.521968+00	2026-03-26 20:07:18.938151+00	
70	4	2026-03-26 22:25:45.680487+00		Java Script (Continuation)		publish	new-lesson	2026-03-26 22:25:45.680487+00	10	8	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/89ab0992-6e46-401e-8cc3-de9d141797b2/playlist.m3u8		15			f	2026-03-26 22:25:45.680487+00	2026-03-26 22:28:15.545356+00	
62	4	2026-03-26 20:09:04.459286+00		CSS (Continuation)		publish	new-lesson	2026-03-26 20:09:04.459286+00	10	4	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/83c116de-4628-482d-af60-181cb0b97bc5/playlist.m3u8		17			f	2026-03-26 20:09:04.459286+00	2026-03-26 20:11:35.916408+00	
73	4	2026-03-26 23:17:54.642791+00		Java Script (String Methods & Conclusion)		publish	new-lesson	2026-03-26 23:17:54.642791+00	10	8	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/98a52601-fb3b-4d9f-8725-fdac88e48305/playlist.m3u8		26			f	2026-03-26 23:17:54.642791+00	2026-03-26 23:21:31.439408+00	
94	4	2026-03-27 11:55:29.735362+00		HTML (Elements)		publish	new-lesson	2026-03-27 11:55:29.735362+00	11	2	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/b62b1aa3-894c-4075-b37d-4404cfe4b27d/playlist.m3u8		15			f	2026-03-27 11:55:29.735362+00	2026-03-27 11:56:59.47246+00	
52	4	2026-03-26 16:58:35.733206+00		React Js Setup		publish	new-lesson	2026-03-26 16:58:35.733206+00	12	2	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/2f728aea-75d7-47c8-bb42-30dc64c24ee8/playlist.m3u8		8			f	2026-03-26 16:58:35.733206+00	2026-03-27 09:40:44.907983+00	
74	4	2026-03-26 23:23:05.366154+00		GIT		publish	new-lesson	2026-03-26 23:23:05.366154+00	10	9	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/1d5d496f-fcd7-47da-8d3b-4d6a331d624c/playlist.m3u8		7			f	2026-03-26 23:23:05.366154+00	2026-03-26 23:24:42.532787+00	
51	4	2026-03-26 16:44:53.591112+00		React Js Introduction		publish	new-lesson	2026-03-26 16:44:53.591112+00	12	1	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/06a9a0c1-f131-49b4-b831-aa3b6b62df7a/playlist.m3u8		9			f	2026-03-26 16:44:53.591112+00	2026-03-27 09:40:45.839115+00	
53	4	2026-03-26 17:02:17.022803+00		React Components		publish	new-lesson	2026-03-26 17:02:17.022803+00	12	3	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/7126d794-b801-4a2b-b92e-5d5947c72752/playlist.m3u8		19			f	2026-03-26 17:02:17.022803+00	2026-03-27 09:41:00.60964+00	
80	4	2026-03-27 09:41:32.138929+00		React States		publish	new-lesson	2026-03-27 09:41:32.138929+00	12	6	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/469224c6-9ddb-4366-9923-89eeeb37df9f/playlist.m3u8		7			f	2026-03-27 09:41:32.138929+00	2026-03-27 10:41:59.500249+00	
81	4	2026-03-27 09:41:35.842642+00		React Hooks		publish	new-lesson	2026-03-27 09:41:35.842642+00	12	7	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/b0b03b34-e1a6-43ac-8bf7-cac6348cb134/playlist.m3u8		8			f	2026-03-27 09:41:35.842642+00	2026-03-27 09:45:33.166121+00	
83	4	2026-03-27 09:41:36.634752+00		React Routers		publish	new-lesson	2026-03-27 09:41:36.634752+00	12	9	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/c5be995f-58bc-42d5-9a43-88f8a705469d/playlist.m3u8		15			f	2026-03-27 09:41:36.634752+00	2026-03-27 10:44:30.652393+00	
85	4	2026-03-27 09:41:37.345304+00		React Context		publish	new-lesson	2026-03-27 09:41:37.345304+00	12	11	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/4083a5e8-f0bb-4642-9418-5d9cb75d902a/playlist.m3u8		7			f	2026-03-27 09:41:37.345304+00	2026-03-27 11:08:50.798883+00	
93	4	2026-03-27 11:53:06.504508+00		HTML Introduction		publish	new-lesson	2026-03-27 11:53:06.504508+00	11	1	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/7868963d-50c7-4981-ba0f-8fb536271448/playlist.m3u8		24			f	2026-03-27 11:53:06.504508+00	2026-03-27 11:57:47.930156+00	
112	4	2026-03-28 09:46:32.10132+00		Take a look of Interface		publish	new-lesson	2026-03-28 09:46:32.10132+00	9	2	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/f833f348-550e-4569-b376-d89f98a13a9c/playlist.m3u8		3			f	2026-03-28 09:46:32.10132+00	2026-03-28 09:47:16.596788+00	
10	8	2026-03-17 10:34:21.796818+00		Introduction to Excel		publish	new-lesson	2026-03-17 10:34:21.796818+00	9	1	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/0f5e3112-8fa1-4f02-8f3b-5a7eccba51bf/playlist.m3u8		4			f	2026-03-17 10:34:21.796818+00	2026-03-28 09:41:54.367238+00	
114	4	2026-04-02 04:34:40.177866+00		CSS (Introduction)		publish	new-lesson	2026-04-02 04:34:40.177866+00	11	3	lesson	html5			30			f	2026-04-02 04:34:40.177866+00	2026-04-02 04:35:58.913114+00	
116	4	2026-04-02 04:37:04.328866+00		CSS (Colors & Conclusion)		publish	new-lesson	2026-04-02 04:37:04.328866+00	11	5	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/5219b407-46f2-4f1d-8332-8bd26f296500/playlist.m3u8		28			f	2026-04-02 04:37:04.328866+00	2026-04-02 04:41:07.215953+00	
115	4	2026-04-02 04:36:33.777783+00		CSS (Continuation)		publish	new-lesson	2026-04-02 04:36:33.777783+00	11	4	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/324c614b-75df-40e6-9416-b3b5b9091a0d/playlist.m3u8		17			f	2026-04-02 04:36:33.777783+00	2026-04-02 04:50:53.798993+00	
127	4	2026-04-02 15:18:48.556332+00		Lecture Documents		publish	new-lesson	2026-04-02 15:18:48.556332+00	10	10	lesson	html5			0			f	2026-04-02 15:18:48.556332+00	2026-04-02 15:19:24.107375+00	
169	4	2026-04-03 11:31:39.584526+00		React Bootstrap		publish	new-lesson	2026-04-03 11:31:39.584526+00	11	31	lesson	html5		https://player.mediadelivery.net/play/618286/1882e723-4f63-4d56-8216-d3fa34063983	0			f	2026-04-03 11:31:39.584526+00	2026-04-03 15:39:45.653412+00	
166	4	2026-04-03 11:31:36.754024+00		React Hooks		publish	new-lesson	2026-04-03 11:31:36.754024+00	11	28	lesson	html5			0			f	2026-04-03 11:31:36.754024+00	2026-04-03 11:32:35.187784+00	
152	4	2026-04-03 11:26:55.893868+00		AI overview		publish	new-lesson	2026-04-03 11:26:55.893868+00	11	14	lesson	html5			0			f	2026-04-03 11:26:55.893868+00	2026-04-03 11:27:07.240119+00	
153	4	2026-04-03 11:26:56.207907+00		Google Gemini & Full stack		publish	new-lesson	2026-04-03 11:26:56.207907+00	11	15	lesson	html5			0			f	2026-04-03 11:26:56.207907+00	2026-04-03 11:27:13.72934+00	
154	4	2026-04-03 11:26:56.516893+00		Claude AI & Full Stack		publish	new-lesson	2026-04-03 11:26:56.516893+00	11	16	lesson	html5			0			f	2026-04-03 11:26:56.516893+00	2026-04-03 11:27:21.061592+00	
130	4	2026-04-02 15:52:38.909332+00		Introduction to AI with Full stack		publish	new-lesson	2026-04-02 15:52:38.909332+00	10	12	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/4f0e1e1c-5d45-4391-b3ac-797a9fac88d1/playlist.m3u8		3			f	2026-04-02 15:52:38.909332+00	2026-04-03 03:38:33.460109+00	
136	4	2026-04-02 15:52:45.619962+00		Chat GPT & Full Stack		publish	new-lesson	2026-04-02 15:52:45.619962+00	10	18	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/437792cc-407d-4f63-8e0f-365addf0e0cf/playlist.m3u8		12			f	2026-04-02 15:52:45.619962+00	2026-04-07 06:45:40.450069+00	
160	4	2026-04-03 11:31:31.398816+00		React Tailwind		publish	new-lesson	2026-04-03 11:31:31.398816+00	11	22	lesson	html5		https://player.mediadelivery.net/play/618286/4ba6e649-b7c2-4b5e-b959-07d27dee86ba	0			f	2026-04-03 11:31:31.398816+00	2026-04-03 15:40:25.465913+00	
137	4	2026-04-02 15:52:46.28078+00		Windsurf (formerly Codeium) & Full stack		publish	new-lesson	2026-04-02 15:52:46.28078+00	10	19	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/1d51b1c6-b514-4184-8397-2b3edacfa5d9/playlist.m3u8		14			f	2026-04-02 15:52:46.28078+00	2026-04-03 09:47:31.169827+00	
138	4	2026-04-02 15:52:46.927505+00		Amazon Q coder		publish	new-lesson	2026-04-02 15:52:46.927505+00	10	20	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/66e20334-de12-4d23-83ae-17d254097916/playlist.m3u8		17			f	2026-04-02 15:52:46.927505+00	2026-04-03 09:47:56.576953+00	
155	4	2026-04-03 11:27:24.910529+00		Chat GPT & Full Stack		publish	new-lesson	2026-04-03 11:27:24.910529+00	11	17	lesson	html5			0			f	2026-04-03 11:27:24.910529+00	2026-04-03 11:27:36.500295+00	
156	4	2026-04-03 11:27:25.265637+00		Windsurf (formerly Codeium) & Full stack		publish	new-lesson	2026-04-03 11:27:25.265637+00	11	18	lesson	html5			0			f	2026-04-03 11:27:25.265637+00	2026-04-03 11:27:44.174907+00	
157	4	2026-04-03 11:27:25.689295+00		Amazon Q coder		publish	new-lesson	2026-04-03 11:27:25.689295+00	11	19	lesson	html5			0			f	2026-04-03 11:27:25.689295+00	2026-04-03 11:27:50.756266+00	
162	4	2026-04-03 11:31:32.211885+00		React Js Setup		publish	new-lesson	2026-04-03 11:31:32.211885+00	11	24	lesson	html5		https://player.mediadelivery.net/play/618286/2f728aea-75d7-47c8-bb42-30dc64c24ee8	0			f	2026-04-03 11:31:32.211885+00	2026-04-03 15:41:27.561906+00	
120	4	2026-04-02 04:52:22.71544+00		Java Script (Continuation)		publish	new-lesson	2026-04-02 04:52:22.71544+00	11	9	lesson	html5		https://player.mediadelivery.net/play/618286/89ab0992-6e46-401e-8cc3-de9d141797b2	0			f	2026-04-02 04:52:22.71544+00	2026-04-03 11:19:59.766943+00	
170	4	2026-04-03 11:34:01.200759+00		Node Js Setup		publish	new-lesson	2026-04-03 11:34:01.200759+00	11	32	lesson	html5		https://player.mediadelivery.net/play/618286/092d29e0-54bf-4399-bb1d-1e3a2b439d8d	0			f	2026-04-03 11:34:01.200759+00	2026-04-03 15:44:38.563284+00	
148	4	2026-04-03 11:24:11.313391+00		API		publish	new-lesson	2026-04-03 11:24:11.313391+00	11	11	lesson	html5			0			f	2026-04-03 11:24:11.313391+00	2026-04-03 11:24:17.972599+00	
158	4	2026-04-03 11:27:26.101386+00		AWS Code whisperer & Conclusion		publish	new-lesson	2026-04-03 11:27:26.101386+00	11	20	lesson	html5			0			f	2026-04-03 11:27:26.101386+00	2026-04-03 11:27:56.6443+00	
159	4	2026-04-03 11:27:58.947009+00		New Lesson		publish	new-lesson	2026-04-03 11:27:58.947009+00	11	21	lesson	html5			0			f	2026-04-03 11:27:58.947009+00	2026-04-03 11:27:58.947009+00	
150	4	2026-04-03 11:25:33.841285+00		Protfolio lecture		publish	new-lesson	2026-04-03 11:25:33.841285+00	11	12	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/5eb3da79-b59a-48f8-a074-d4273e4ffc65/playlist.m3u8		2			f	2026-04-03 11:25:33.841285+00	2026-04-03 11:26:08.787316+00	
151	4	2026-04-03 11:26:41.473767+00		Introduction to AI with Full stack		publish	new-lesson	2026-04-03 11:26:41.473767+00	11	13	lesson	html5			0			f	2026-04-03 11:26:41.473767+00	2026-04-03 11:26:53.533646+00	
167	4	2026-04-03 11:31:37.262139+00		React Routers		publish	new-lesson	2026-04-03 11:31:37.262139+00	11	29	lesson	html5		https://player.mediadelivery.net/play/618286/c5be995f-58bc-42d5-9a43-88f8a705469d	0			f	2026-04-03 11:31:37.262139+00	2026-04-03 15:40:53.642356+00	
145	4	2026-04-03 10:36:25.556665+00		React Axios		publish	new-lesson	2026-04-03 10:36:25.556665+00	11	10	lesson	html5		https://player.mediadelivery.net/play/618286/15f5490b-3899-4425-817f-ed962a53eb73	0			f	2026-04-03 10:36:25.556665+00	2026-04-03 11:31:51.425443+00	
163	4	2026-04-03 11:31:35.040159+00		React Components		publish	new-lesson	2026-04-03 11:31:35.040159+00	11	25	lesson	html5		https://player.mediadelivery.net/play/618286/7126d794-b801-4a2b-b92e-5d5947c72752	0			f	2026-04-03 11:31:35.040159+00	2026-04-03 15:41:54.46389+00	
164	4	2026-04-03 11:31:35.563752+00		React Props		publish	new-lesson	2026-04-03 11:31:35.563752+00	11	26	lesson	html5		https://player.mediadelivery.net/play/618286/afe85f35-48f5-44e5-8019-e299518d4a21	0			f	2026-04-03 11:31:35.563752+00	2026-04-03 15:42:08.503365+00	
144	4	2026-04-03 10:30:19.487534+00		GIT		publish	new-lesson	2026-04-03 10:30:19.487534+00	11	9	lesson	html5		https://player.mediadelivery.net/play/618286/849526f4-9276-4539-bf74-a998dd4417dd	0			f	2026-04-03 10:30:19.487534+00	2026-04-03 15:43:43.684646+00	
172	4	2026-04-03 11:34:02.004131+00		Server Creation		publish	new-lesson	2026-04-03 11:34:02.004131+00	11	34	lesson	html5		https://player.mediadelivery.net/play/618286/2870cd94-bc2b-4d70-a936-5f4babfe4c40	0			f	2026-04-03 11:34:02.004131+00	2026-04-03 15:45:11.948131+00	
176	4	2026-04-03 11:34:28.87023+00		Mongoose & MongoDB		publish	new-lesson	2026-04-03 11:34:28.87023+00	11	38	lesson	html5		https://player.mediadelivery.net/play/618286/1a72fde5-f84e-4710-ac93-e4aa7262cb33	0			f	2026-04-03 11:34:28.87023+00	2026-04-03 15:45:50.465803+00	
177	4	2026-04-03 11:34:28.998501+00		Authentication & Security		publish	new-lesson	2026-04-03 11:34:28.998501+00	11	39	lesson	html5		https://player.mediadelivery.net/play/618286/115b8a4c-6e24-4bca-b56c-7bc71248a479	0			f	2026-04-03 11:34:28.998501+00	2026-04-03 15:49:46.709926+00	
174	4	2026-04-03 11:34:27.862077+00		Mongo DB Introduction		publish	new-lesson	2026-04-03 11:34:27.862077+00	11	36	lesson	html5		https://player.mediadelivery.net/play/618286/9760da21-83cf-4020-a61f-932205e8b1e6	0			f	2026-04-03 11:34:27.862077+00	2026-04-03 15:52:30.017536+00	
185	4	2026-04-03 11:39:38.610298+00		If Condition		publish	new-lesson	2026-04-03 11:39:38.610298+00	9	9	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/76bf9601-06f0-4c0a-9015-752e40f4f047/playlist.m3u8		13			f	2026-04-03 11:39:38.610298+00	2026-04-08 09:45:30.726252+00	
180	4	2026-04-03 11:38:38.270467+00		Conditional formatting		publish	new-lesson	2026-04-03 11:38:38.270467+00	9	4	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/fbb9eb90-5ccd-4ca3-8675-ee4d9e50e4f6/playlist.m3u8		12			f	2026-04-03 11:38:38.270467+00	2026-04-08 06:57:24.979144+00	
182	4	2026-04-03 11:39:12.421551+00		Statistical Functions		publish	new-lesson	2026-04-03 11:39:12.421551+00	9	6	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/47b257b9-b507-4da0-affa-0db3d16288ad/playlist.m3u8		14			f	2026-04-03 11:39:12.421551+00	2026-04-08 07:37:05.83065+00	
184	4	2026-04-03 11:39:38.306532+00		Sort & Filter		publish	new-lesson	2026-04-03 11:39:38.306532+00	9	8	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/029efc5d-ea49-4341-a8a3-2c6313fd209d/playlist.m3u8		15			f	2026-04-03 11:39:38.306532+00	2026-04-08 09:36:12.587919+00	
187	4	2026-04-03 11:40:13.814976+00		Charts & Graphs		publish	new-lesson	2026-04-03 11:40:13.814976+00	9	11	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/1786623f-fe32-47d3-8159-671ef5a2f44d/playlist.m3u8		15			f	2026-04-03 11:40:13.814976+00	2026-04-08 10:23:46.958774+00	
134	4	2026-04-02 15:52:44.220126+00		Claude AI & Full Stack		publish	new-lesson	2026-04-02 15:52:44.220126+00	10	16	lesson	html5		https://player.mediadelivery.net/play/618286/e7e06d9e-8c49-4d39-bfe4-26c1af4aabc5	0			f	2026-04-02 15:52:44.220126+00	2026-04-03 15:34:40.713436+00	
139	4	2026-04-02 15:54:53.038569+00		AWS Code whisperer & Conclusion		publish	new-lesson	2026-04-02 15:54:53.038569+00	10	21	lesson	html5		https://player.mediadelivery.net/play/618286/c047aa02-acc6-474e-b070-4eb42a5b2bf1	7			f	2026-04-02 15:54:53.038569+00	2026-04-03 15:37:26.999057+00	
168	4	2026-04-03 11:31:37.857496+00		React Context		publish	new-lesson	2026-04-03 11:31:37.857496+00	11	30	lesson	html5		https://player.mediadelivery.net/play/618286/4083a5e8-f0bb-4642-9418-5d9cb75d902a	0			f	2026-04-03 11:31:37.857496+00	2026-04-03 15:40:40.244069+00	
161	4	2026-04-03 11:31:31.729552+00		React Js Introduction		publish	new-lesson	2026-04-03 11:31:31.729552+00	11	23	lesson	html5		https://player.mediadelivery.net/play/618286/06a9a0c1-f131-49b4-b831-aa3b6b62df7a	0			f	2026-04-03 11:31:31.729552+00	2026-04-03 15:41:38.322602+00	
165	4	2026-04-03 11:31:36.053563+00		React States		publish	new-lesson	2026-04-03 11:31:36.053563+00	11	27	lesson	html5		https://player.mediadelivery.net/play/618286/469224c6-9ddb-4366-9923-89eeeb37df9f	0			f	2026-04-03 11:31:36.053563+00	2026-04-03 15:42:22.107578+00	
171	4	2026-04-03 11:34:01.594812+00		Project Setup		publish	new-lesson	2026-04-03 11:34:01.594812+00	11	33	lesson	html5		https://player.mediadelivery.net/play/618286/f78c9662-3714-4b87-8f12-e14fa5e78770	0			f	2026-04-03 11:34:01.594812+00	2026-04-03 15:44:54.064311+00	
173	4	2026-04-03 11:34:26.502797+00		Backend Core Concepts		publish	new-lesson	2026-04-03 11:34:26.502797+00	11	35	lesson	html5		https://player.mediadelivery.net/play/618286/6770a6d9-cd2d-4aa7-8c32-7efdea77f40d	0			f	2026-04-03 11:34:26.502797+00	2026-04-03 15:45:29.629987+00	
175	4	2026-04-03 11:34:28.09013+00		Mongo DB Setup		publish	new-lesson	2026-04-03 11:34:28.09013+00	11	37	lesson	html5		https://player.mediadelivery.net/play/618286/9760da21-83cf-4020-a61f-932205e8b1e6	0			f	2026-04-03 11:34:28.09013+00	2026-04-03 15:51:47.43757+00	
179	4	2026-04-03 11:38:38.062596+00		Data Entry and formatting		publish	new-lesson	2026-04-03 11:38:38.062596+00	9	3	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/93b2fd82-071a-4c22-bbe0-1bc316ad2580/playlist.m3u8		24			f	2026-04-03 11:38:38.062596+00	2026-04-08 07:03:10.22705+00	
183	4	2026-04-03 11:39:13.173656+00		Relative and absolute references		publish	new-lesson	2026-04-03 11:39:13.173656+00	9	7	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/2d7cdf25-c55a-4d38-afd6-1b8e6cab4882/playlist.m3u8		7			f	2026-04-03 11:39:13.173656+00	2026-04-08 07:42:47.328202+00	
186	4	2026-04-03 11:39:40.242023+00		Data Validation		publish	new-lesson	2026-04-03 11:39:40.242023+00	9	10	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/286f0ede-8964-479b-babd-b091067e4fdc/playlist.m3u8		9			f	2026-04-03 11:39:40.242023+00	2026-04-08 10:13:51.807886+00	
188	4	2026-04-03 11:40:32.106021+00		Pivot Tables		publish	new-lesson	2026-04-03 11:40:32.106021+00	9	12	lesson	html5	https://vz-60dda74a-f32.b-cdn.net/c8f04d51-29f1-44a6-96ae-66be25958909/playlist.m3u8		23			f	2026-04-03 11:40:32.106021+00	2026-04-08 10:37:08.443923+00	
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.order_items (id, order_id, course_id, order_item_name, order_item_type, quantity, subtotal, subtotal_tax, total, total_tax, product_data, created_at) FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.orders (id, user_id, order_key, order_status, currency, total_amount, subtotal_amount, tax_amount, shipping_amount, discount_amount, payment_method, payment_method_title, transaction_id, billing_first_name, billing_last_name, billing_company, billing_address_1, billing_address_2, billing_city, billing_state, billing_postcode, billing_country, billing_email, billing_phone, customer_note, order_notes, date_created, date_modified, date_paid, date_completed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.payments (id, order_id, user_id, payment_method, gateway_transaction_id, gateway_payment_id, gateway_order_id, amount, currency, payment_status, gateway_response, failure_reason, payment_date, processed_date, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quiz_attempt_answers; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_attempt_answers (attempt_answer_id, user_id, quiz_id, question_id, quiz_attempt_id, given_answer, question_mark, achieved_mark, minus_mark, is_correct, created_at) FROM stdin;
\.


--
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_attempts (attempt_id, course_id, quiz_id, user_id, total_questions, total_answered_questions, total_marks, earned_marks, attempt_info, attempt_status, attempt_ip, attempt_started_at, attempt_ended_at, created_at, updated_at) FROM stdin;
2	10	17	4	4	4	40.00	0.00	"{\\"168\\": \\"true\\", \\"169\\": \\"advanced reasoning\\", \\"170\\": \\"context\\", \\"171\\": \\"context\\"}"	attempt_ended		2026-04-07 10:21:00.622654+00	2026-04-07 10:21:00.622659+00	2026-04-07 10:21:00.6077+00	2026-04-07 10:21:00.6077+00
3	11	10	4	6	6	60.00	40.00	"{\\"187\\": \\"true\\", \\"188\\": 1, \\"189\\": 2, \\"190\\": \\"true\\", \\"191\\": \\"<br>\\", \\"192\\": \\"input/data\\"}"	attempt_ended		2026-04-07 10:36:00.491618+00	2026-04-07 10:36:00.491623+00	2026-04-07 10:36:00.461653+00	2026-04-07 10:36:00.461653+00
4	9	22	4	3	3	30.00	30.00	"{\\"217\\": 2, \\"218\\": \\"false\\", \\"219\\": \\"Alphanumeric\\"}"	attempt_ended		2026-04-08 07:11:09.066372+00	2026-04-08 07:11:09.066378+00	2026-04-08 07:11:09.048788+00	2026-04-08 07:11:09.048788+00
5	10	6	54	5	5	5.00	4.00	"{\\"56\\": 0, \\"57\\": 0, \\"58\\": 0, \\"59\\": 0, \\"60\\": 1}"	attempt_ended		2026-04-08 07:42:40.443897+00	2026-04-08 07:42:40.443903+00	2026-04-08 07:42:40.422765+00	2026-04-08 07:42:40.422765+00
6	10	3	54	6	6	6.00	3.00	"{\\"38\\": 0, \\"39\\": 1, \\"40\\": 1, \\"41\\": 0, \\"42\\": 0, \\"43\\": 1}"	attempt_ended		2026-04-08 07:43:45.374113+00	2026-04-08 07:43:45.374118+00	2026-04-08 07:43:45.342057+00	2026-04-08 07:43:45.342057+00
\.


--
-- Data for Name: quiz_question_answers; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_question_answers (answer_id, belongs_question_id, belongs_question_type, answer_title, is_correct, image_id, answer_two_gap_match, answer_view_format, answer_settings, answer_order, created_at) FROM stdin;
77	38	multiple_choice	True	f	0			{}	0	2026-03-26 19:16:55.889996+00
78	38	multiple_choice	False	t	0			{}	1	2026-03-26 19:16:55.889996+00
79	39	multiple_choice	www.example.com	f	0			{}	0	2026-03-26 19:16:55.906906+00
80	39	multiple_choice	<a href="www.example.com">Visit</a>	t	0			{}	1	2026-03-26 19:16:55.906906+00
81	39	multiple_choice	<link>Visit</link>	f	0			{}	2	2026-03-26 19:16:55.906906+00
82	39	multiple_choice	<a link="www.example.com">Visit</a>	f	0			{}	3	2026-03-26 19:16:55.906906+00
83	40	multiple_choice	Display images	f	0			{}	0	2026-03-26 19:16:55.913044+00
84	40	multiple_choice	Create lists	f	0			{}	1	2026-03-26 19:16:55.913044+00
85	40	multiple_choice	Organize data into rows and columns	t	0			{}	2	2026-03-26 19:16:55.913044+00
86	40	multiple_choice	Format text	f	0			{}	3	2026-03-26 19:16:55.913044+00
87	41	multiple_choice	True	t	0			{}	0	2026-03-26 19:16:55.923948+00
88	41	multiple_choice	False	f	0			{}	1	2026-03-26 19:16:55.923948+00
89	42	multiple_choice	<lb>	f	0			{}	0	2026-03-26 19:16:55.946639+00
90	42	multiple_choice	<break>	f	0			{}	1	2026-03-26 19:16:55.946639+00
91	42	multiple_choice	<br>	t	0			{}	2	2026-03-26 19:16:55.946639+00
92	42	multiple_choice	<line>	f	0			{}	3	2026-03-26 19:16:55.946639+00
93	43	multiple_choice	Styles	f	0			{}	0	2026-03-26 19:16:55.954502+00
94	43	multiple_choice	Data	t	0			{}	1	2026-03-26 19:16:55.954502+00
95	43	multiple_choice	Images	f	0			{}	2	2026-03-26 19:16:55.954502+00
96	43	multiple_choice	Links	f	0			{}	3	2026-03-26 19:16:55.954502+00
57	28	multiple_choice	Databases	f	0			{}	0	2026-03-26 17:16:38.71421+00
58	28	multiple_choice	User Interfaces	t	0			{}	1	2026-03-26 17:16:38.71421+00
59	28	multiple_choice	Servers	f	0			{}	2	2026-03-26 17:16:38.71421+00
60	28	multiple_choice	Mobile Networks	f	0			{}	3	2026-03-26 17:16:38.71421+00
61	29	multiple_choice	npx create-react-app myapp	f	0			{}	0	2026-03-26 17:16:38.73979+00
62	29	multiple_choice	npm init vite@latest myapp	t	0			{}	1	2026-03-26 17:16:38.73979+00
63	29	multiple_choice	react new project	f	0			{}	2	2026-03-26 17:16:38.73979+00
64	29	multiple_choice	npm start myapp	f	0			{}	3	2026-03-26 17:16:38.73979+00
65	30	multiple_choice	JavaScript XML	t	0			{}	0	2026-03-26 17:16:38.760262+00
66	30	multiple_choice	JSON Extended	f	0			{}	1	2026-03-26 17:16:38.760262+00
67	30	multiple_choice	Java Syntax Extension	f	0			{}	2	2026-03-26 17:16:38.760262+00
68	30	multiple_choice	JavaScript Execution	f	0			{}	3	2026-03-26 17:16:38.760262+00
69	31	multiple_choice	A number	f	0			{}	0	2026-03-26 17:16:38.780336+00
70	31	multiple_choice	JSX	t	0			{}	1	2026-03-26 17:16:38.780336+00
71	31	multiple_choice	A CSS file	f	0			{}	2	2026-03-26 17:16:38.780336+00
72	31	multiple_choice	A Database	f	0			{}	3	2026-03-26 17:16:38.780336+00
73	36	true_false	True	f	0			{}	0	2026-03-26 17:16:38.848013+00
74	36	true_false	False	t	0			{}	1	2026-03-26 17:16:38.848013+00
75	37	true_false	True	t	0			{}	0	2026-03-26 17:16:38.865338+00
76	37	true_false	False	f	0			{}	1	2026-03-26 17:16:38.865338+00
135	56	multiple_choice	True	t	0			{}	0	2026-03-26 23:33:31.242338+00
136	56	multiple_choice	False	f	0			{}	1	2026-03-26 23:33:31.242338+00
137	57	multiple_choice	git status	t	0			{}	0	2026-03-26 23:33:31.252609+00
138	57	multiple_choice	git check	f	0			{}	1	2026-03-26 23:33:31.252609+00
139	57	multiple_choice	git state	f	0			{}	2	2026-03-26 23:33:31.252609+00
140	57	multiple_choice	git info	f	0			{}	3	2026-03-26 23:33:31.252609+00
141	58	multiple_choice	git add	t	0			{}	0	2026-03-26 23:33:31.263571+00
142	58	multiple_choice	git commit	f	0			{}	1	2026-03-26 23:33:31.263571+00
143	58	multiple_choice	git push	f	0			{}	2	2026-03-26 23:33:31.263571+00
144	58	multiple_choice	git stage	f	0			{}	3	2026-03-26 23:33:31.263571+00
145	59	multiple_choice	git commit -m "message"	t	0			{}	0	2026-03-26 23:33:31.270187+00
146	59	multiple_choice	git save	f	0			{}	1	2026-03-26 23:33:31.270187+00
147	59	multiple_choice	git push	f	0			{}	2	2026-03-26 23:33:31.270187+00
148	59	multiple_choice	git add	f	0			{}	3	2026-03-26 23:33:31.270187+00
398	199	multiple_choice	Color Style Sheet	f	0			{}	0	2026-04-07 10:40:56.98275+00
399	199	multiple_choice	Cascading Style Sheets	t	0			{}	1	2026-04-07 10:40:56.98275+00
400	199	multiple_choice	Creative Style Script	f	0			{}	2	2026-04-07 10:40:56.98275+00
401	199	multiple_choice	Computer Style System	f	0			{}	3	2026-04-07 10:40:56.98275+00
408	202	multiple_choice	margin	t	0			{}	0	2026-04-07 10:40:57.001116+00
409	202	multiple_choice	outline	f	0			{}	1	2026-04-07 10:40:57.001116+00
410	202	multiple_choice	spacing	f	0			{}	2	2026-04-07 10:40:57.001116+00
411	202	multiple_choice	alignment	f	0			{}	3	2026-04-07 10:40:57.001116+00
418	205	multiple_choice	True	f	0			{}	0	2026-04-07 10:41:46.313856+00
419	205	multiple_choice	False	t	0			{}	1	2026-04-07 10:41:46.313856+00
424	207	multiple_choice	True	f	0			{}	0	2026-04-07 10:41:46.332616+00
425	207	multiple_choice	False	t	0			{}	1	2026-04-07 10:41:46.332616+00
426	208	multiple_choice	class	f	0			{}	0	2026-04-07 10:41:46.339098+00
427	208	multiple_choice	name	f	0			{}	1	2026-04-07 10:41:46.339098+00
428	208	multiple_choice	id	t	0			{}	2	2026-04-07 10:41:46.339098+00
429	208	multiple_choice	tag	f	0			{}	3	2026-04-07 10:41:46.339098+00
434	210	multiple_choice	True	t	0			{}	0	2026-04-07 10:41:46.350216+00
435	210	multiple_choice	False	f	0			{}	1	2026-04-07 10:41:46.350216+00
438	212	true_false	True	f	0			{}	0	2026-04-08 07:05:26.453267+00
439	212	true_false	False	t	0			{}	1	2026-04-08 07:05:26.453267+00
443	215	true_false	True	t	0			{}	0	2026-04-08 07:05:26.475424+00
444	215	true_false	False	f	0			{}	1	2026-04-08 07:05:26.475424+00
478	230	true_false	True	f	0			{}	0	2026-04-08 07:33:26.515333+00
479	230	true_false	False	t	0			{}	1	2026-04-08 07:33:26.515333+00
481	232	true_false	True	t	0			{}	0	2026-04-08 12:21:51.363085+00
482	232	true_false	False	f	0			{}	1	2026-04-08 12:21:51.363085+00
486	234	multiple_choice	Display images	f	0			{}	0	2026-04-08 12:21:51.389823+00
487	234	multiple_choice	Create lists	f	0			{}	1	2026-04-08 12:21:51.389823+00
488	234	multiple_choice	Organize data into rows and columns	t	0			{}	2	2026-04-08 12:21:51.389823+00
489	235	true_false	True	t	0			{}	0	2026-04-08 12:21:51.398638+00
490	235	true_false	False	f	0			{}	1	2026-04-08 12:21:51.398638+00
492	237	fill_in_blank	rifath	t	0			{}	0	2026-04-08 12:21:51.412202+00
149	60	multiple_choice	git push	t	0			{}	0	2026-03-26 23:33:31.276709+00
150	60	multiple_choice	git pull	f	0			{}	1	2026-03-26 23:33:31.276709+00
151	60	multiple_choice	git fetch	f	0			{}	2	2026-03-26 23:33:31.276709+00
152	60	multiple_choice	git fetch	f	0			{}	3	2026-03-26 23:33:31.276709+00
153	61	multiple_choice	Modify state	f	0			{}	0	2026-03-27 10:03:02.009296+00
154	61	multiple_choice	Pass data from parent to child	t	0			{}	1	2026-03-27 10:03:02.009296+00
155	61	multiple_choice	Store global variables	f	0			{}	2	2026-03-27 10:03:02.009296+00
156	61	multiple_choice	Handle API calls	f	0			{}	3	2026-03-27 10:03:02.009296+00
157	62	multiple_choice	useState	t	0			{}	0	2026-03-27 10:03:02.036647+00
158	62	multiple_choice	useEffect	f	0			{}	1	2026-03-27 10:03:02.036647+00
159	62	multiple_choice	useProp	f	0			{}	2	2026-03-27 10:03:02.036647+00
160	62	multiple_choice	useRoute	f	0			{}	3	2026-03-27 10:03:02.036647+00
161	63	multiple_choice	UI renders	t	0			{}	0	2026-03-27 10:03:02.057462+00
162	63	multiple_choice	Browser closes	f	0			{}	1	2026-03-27 10:03:02.057462+00
163	63	multiple_choice	Data deletion	f	0			{}	2	2026-03-27 10:03:02.057462+00
164	63	multiple_choice	On server start	f	0			{}	3	2026-03-27 10:03:02.057462+00
165	64	multiple_choice	Read-only	f	0			{}	0	2026-03-27 10:03:02.087014+00
166	64	multiple_choice	Mutable	t	0			{}	1	2026-03-27 10:03:02.087014+00
167	64	multiple_choice	Cannot be used in components	f	0			{}	2	2026-03-27 10:03:02.087014+00
168	64	multiple_choice	Only for styling	f	0			{}	3	2026-03-27 10:03:02.087014+00
169	69	true_false	True	t	0			{}	0	2026-03-27 10:03:02.20883+00
170	69	true_false	False	f	0			{}	1	2026-03-27 10:03:02.20883+00
171	70	true_false	True	f	0			{}	0	2026-03-27 10:03:02.228375+00
172	70	true_false	False	t	0			{}	1	2026-03-27 10:03:02.228375+00
173	71	multiple_choice	npm install react-router-dom	t	0			{}	0	2026-03-27 10:23:40.840778+00
174	71	multiple_choice	npm install router-react	f	0			{}	1	2026-03-27 10:23:40.840778+00
175	71	multiple_choice	npm install react-path	f	0			{}	2	2026-03-27 10:23:40.840778+00
176	71	multiple_choice	npm install react-links	f	0			{}	3	2026-03-27 10:23:40.840778+00
177	72	multiple_choice	Creating components	f	0			{}	0	2026-03-27 10:23:40.849715+00
178	72	multiple_choice	Making API requests	t	0			{}	1	2026-03-27 10:23:40.849715+00
179	72	multiple_choice	Routing pages	f	0			{}	2	2026-03-27 10:23:40.849715+00
180	72	multiple_choice	Adding CSS	f	0			{}	3	2026-03-27 10:23:40.849715+00
181	73	multiple_choice	Props drilling	t	0			{}	0	2026-03-27 10:23:40.857892+00
182	73	multiple_choice	API calls	f	0			{}	1	2026-03-27 10:23:40.857892+00
183	73	multiple_choice	Router setup	f	0			{}	2	2026-03-27 10:23:40.857892+00
184	73	multiple_choice	useState	f	0			{}	3	2026-03-27 10:23:40.857892+00
185	74	multiple_choice	<Route>	f	0			{}	0	2026-03-27 10:23:40.865256+00
186	74	multiple_choice	<BrowserRouter>	t	0			{}	1	2026-03-27 10:23:40.865256+00
187	74	multiple_choice	<Switch>	f	0			{}	2	2026-03-27 10:23:40.865256+00
188	74	multiple_choice	<Link>	f	0			{}	3	2026-03-27 10:23:40.865256+00
189	79	true_false	True	t	0			{}	0	2026-03-27 10:23:40.884382+00
190	79	true_false	False	f	0			{}	1	2026-03-27 10:23:40.884382+00
191	80	true_false	True	f	0			{}	0	2026-03-27 10:23:40.88972+00
192	80	true_false	False	t	0			{}	1	2026-03-27 10:23:40.88972+00
193	81	multiple_choice	Routing	f	0			{}	0	2026-03-27 10:33:28.810926+00
194	81	multiple_choice	Styling and layout	t	0			{}	1	2026-03-27 10:33:28.810926+00
195	81	multiple_choice	API calls	f	0			{}	2	2026-03-27 10:33:28.810926+00
196	81	multiple_choice	Data storage	f	0			{}	3	2026-03-27 10:33:28.810926+00
197	82	multiple_choice	Utility-first	t	0			{}	0	2026-03-27 10:33:28.81722+00
198	82	multiple_choice	Component	f	0			{}	1	2026-03-27 10:33:28.81722+00
199	82	multiple_choice	Server-side	f	0			{}	2	2026-03-27 10:33:28.81722+00
200	82	multiple_choice	Animation	f	0			{}	3	2026-03-27 10:33:28.81722+00
201	83	multiple_choice	npm install react-bootstrap bootstrap	t	0			{}	0	2026-03-27 10:33:28.824515+00
202	83	multiple_choice	npm install react-css	f	0			{}	1	2026-03-27 10:33:28.824515+00
203	83	multiple_choice	npx install bootstrap-kit	f	0			{}	2	2026-03-27 10:33:28.824515+00
204	83	multiple_choice	npm add tailwind bootstrap	f	0			{}	3	2026-03-27 10:33:28.824515+00
205	84	multiple_choice	JS files	f	0			{}	0	2026-03-27 10:33:28.831346+00
206	84	multiple_choice	JSX elements	t	0			{}	1	2026-03-27 10:33:28.831346+00
207	84	multiple_choice	JSON	f	0			{}	2	2026-03-27 10:33:28.831346+00
208	84	multiple_choice	Node modules	f	0			{}	3	2026-03-27 10:33:28.831346+00
209	89	true_false	True	t	0			{}	0	2026-03-27 10:33:28.852838+00
210	89	true_false	False	f	0			{}	1	2026-03-27 10:33:28.852838+00
211	90	true_false	True	t	0			{}	0	2026-03-27 10:33:28.857503+00
212	90	true_false	False	f	0			{}	1	2026-03-27 10:33:28.857503+00
402	200	multiple_choice	True	f	0			{}	0	2026-04-07 10:40:56.989251+00
403	200	multiple_choice	False	t	0			{}	1	2026-04-07 10:40:56.989251+00
412	203	multiple_choice	{p: color=red;}	f	0			{}	0	2026-04-07 10:40:57.006294+00
413	203	multiple_choice	p { color: red; }	t	0			{}	1	2026-04-07 10:40:57.006294+00
414	203	multiple_choice	p (color: red;)	f	0			{}	2	2026-04-07 10:40:57.006294+00
415	203	multiple_choice	p = color: red;	f	0			{}	3	2026-04-07 10:40:57.006294+00
420	206	multiple_choice	var	f	0			{}	0	2026-04-07 10:41:46.323431+00
421	206	multiple_choice	let	f	0			{}	1	2026-04-07 10:41:46.323431+00
237	103	multiple_choice	A software tool for creating visuals	f	0			{}	0	2026-03-28 09:50:09.311357+00
238	103	multiple_choice	Information like numbers, words, or facts used to make sense of things	t	0			{}	1	2026-03-28 09:50:09.311357+00
239	103	multiple_choice	A type of spreadsheet program	f	0			{}	2	2026-03-28 09:50:09.311357+00
240	103	multiple_choice	A dashboard for decision-making	f	0			{}	3	2026-03-28 09:50:09.311357+00
241	104	multiple_choice	A word processing program	f	0			{}	0	2026-03-28 09:50:09.331791+00
242	104	multiple_choice	A spreadsheet program for organizing data	t	0			{}	1	2026-03-28 09:50:09.331791+00
243	104	multiple_choice	A database management system	f	0			{}	2	2026-03-28 09:50:09.331791+00
244	104	multiple_choice	A programming language	f	0			{}	3	2026-03-28 09:50:09.331791+00
245	105	multiple_choice	1987	f	0			{}	0	2026-03-28 09:50:09.344175+00
246	105	multiple_choice	1990	f	0			{}	1	2026-03-28 09:50:09.344175+00
247	105	multiple_choice	1985	t	0			{}	2	2026-03-28 09:50:09.344175+00
248	105	multiple_choice	2000	f	0			{}	3	2026-03-28 09:50:09.344175+00
249	106	multiple_choice	Color Style Sheet	f	0			{}	0	2026-04-02 04:47:59.797981+00
250	106	multiple_choice	Cascading Style Sheets	t	0			{}	1	2026-04-02 04:47:59.797981+00
251	106	multiple_choice	Creative Style Script	f	0			{}	2	2026-04-02 04:47:59.797981+00
252	106	multiple_choice		f	0			{}	3	2026-04-02 04:47:59.797981+00
253	107	true_false	True	f	0			{}	0	2026-04-02 04:47:59.83537+00
254	107	true_false	False	t	0			{}	1	2026-04-02 04:47:59.83537+00
255	110	multiple_choice	{p: color=red;}	f	0			{}	0	2026-04-02 04:47:59.850317+00
256	110	multiple_choice	p {color: red;}	t	0			{}	1	2026-04-02 04:47:59.850317+00
257	110	multiple_choice	p (color: red;)	f	0			{}	2	2026-04-02 04:47:59.850317+00
258	110	multiple_choice		f	0			{}	3	2026-04-02 04:47:59.850317+00
259	111	true_false	True	t	0			{}	0	2026-04-02 04:47:59.857246+00
260	111	true_false	False	f	0			{}	1	2026-04-02 04:47:59.857246+00
404	201	multiple_choice	color	f	0			{}	0	2026-04-07 10:40:56.994656+00
405	201	multiple_choice	background-color	t	0			{}	1	2026-04-07 10:40:56.994656+00
406	201	multiple_choice	font-color	f	0			{}	2	2026-04-07 10:40:56.994656+00
407	201	multiple_choice	bgcolor	f	0			{}	3	2026-04-07 10:40:56.994656+00
416	204	multiple_choice	True	t	0			{}	0	2026-04-07 10:40:57.011265+00
417	204	multiple_choice	False	f	0			{}	1	2026-04-07 10:40:57.011265+00
281	124	true_false	True	f	0			{}	0	2026-04-02 15:56:35.716131+00
282	124	true_false	False	t	0			{}	1	2026-04-02 15:56:35.716131+00
283	125	true_false	True	f	0			{}	0	2026-04-02 15:56:35.747164+00
284	125	true_false	False	t	0			{}	1	2026-04-02 15:56:35.747164+00
422	206	multiple_choice	const	t	0			{}	2	2026-04-07 10:41:46.323431+00
423	206	multiple_choice	static	f	0			{}	3	2026-04-07 10:41:46.323431+00
287	129	true_false	True	t	0			{}	0	2026-04-03 11:23:47.412732+00
288	129	true_false	False	f	0			{}	1	2026-04-03 11:23:47.412732+00
289	130	true_false	True	f	0			{}	0	2026-04-03 11:25:07.042823+00
290	130	true_false	False	t	0			{}	1	2026-04-03 11:25:07.042823+00
291	131	true_false	True	f	0			{}	0	2026-04-03 11:28:47.355083+00
292	131	true_false	False	t	0			{}	1	2026-04-03 11:28:47.355083+00
293	132	true_false	True	f	0			{}	0	2026-04-03 11:28:47.386482+00
294	132	true_false	False	t	0			{}	1	2026-04-03 11:28:47.386482+00
295	133	true_false	True	f	0			{}	0	2026-04-03 11:30:30.152216+00
296	133	true_false	False	t	0			{}	1	2026-04-03 11:30:30.152216+00
297	134	multiple_choice	reasoning	t	0			{}	0	2026-04-03 11:30:30.162526+00
298	134	multiple_choice	Coding	f	0			{}	1	2026-04-03 11:30:30.162526+00
299	134	multiple_choice	Tokenization	f	0			{}	2	2026-04-03 11:30:30.162526+00
300	135	multiple_choice	Data points	f	0			{}	0	2026-04-03 11:30:30.178272+00
301	135	multiple_choice	Context	t	0			{}	1	2026-04-03 11:30:30.178272+00
302	135	multiple_choice	Visuals	f	0			{}	2	2026-04-03 11:30:30.178272+00
430	209	multiple_choice	const add = (a, b) => a + b;	t	0			{}	0	2026-04-07 10:41:46.344773+00
431	209	multiple_choice	const add = (a, b) { return a + b; }	f	0			{}	1	2026-04-07 10:41:46.344773+00
432	209	multiple_choice	const add => (a, b) = a + b;	f	0			{}	2	2026-04-07 10:41:46.344773+00
433	209	multiple_choice	function add = (a, b) => a + b;	f	0			{}	3	2026-04-07 10:41:46.344773+00
436	211	true_false	True	f	0			{}	0	2026-04-08 07:05:26.441532+00
437	211	true_false	False	t	0			{}	1	2026-04-08 07:05:26.441532+00
440	213	fill_in_blank	id	t	0			{}	0	2026-04-08 07:05:26.460264+00
441	214	multiple_choice	const add = (a,b) => a + b;	t	0			{}	0	2026-04-08 07:05:26.468524+00
442	214	multiple_choice	const add = (a,b) { return a + b; }	f	0			{}	1	2026-04-08 07:05:26.468524+00
445	216	fill_in_blank	const	t	0			{}	0	2026-04-08 07:05:26.484202+00
474	229	multiple_choice	FIFO (First In, First Out)	f	0			{}	0	2026-04-08 07:33:26.504284+00
475	229	multiple_choice	LIFO (Last In, First Out)	f	0			{}	1	2026-04-08 07:33:26.504284+00
476	229	multiple_choice	BODMAS (Bracket, Order, Division, Multiplication, Addition, Subtraction)	t	0			{}	2	2026-04-08 07:33:26.504284+00
477	229	multiple_choice	PEMDAS (Parentheses, Exponents, Multiplication, Division, Addition, Subtraction)	f	0			{}	3	2026-04-08 07:33:26.504284+00
480	231	fill_in_blank	Alphanumeric	t	0			{}	0	2026-04-08 07:33:26.522735+00
483	233	multiple_choice	www.example.com	f	0			{}	0	2026-04-08 12:21:51.377536+00
484	233	multiple_choice	Visit	t	0			{}	1	2026-04-08 12:21:51.377536+00
485	233	multiple_choice	create	f	0			{}	2	2026-04-08 12:21:51.377536+00
491	236	fill_in_blank	hello	t	0			{}	0	2026-04-08 12:21:51.40457+00
342	172	true_false	True	f	0			{}	0	2026-04-07 10:23:40.759801+00
343	172	true_false	False	t	0			{}	1	2026-04-07 10:23:40.759801+00
344	173	fill_in_blank	advanced reasoning	t	0			{}	0	2026-04-07 10:23:40.766143+00
345	174	fill_in_blank	context	t	0			{}	0	2026-04-07 10:23:40.771239+00
\.


--
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quiz_questions (question_id, quiz_id, question_title, question_description, answer_explanation, question_type, question_mark, question_settings, question_order, created_at, updated_at) FROM stdin;
172	17	Claude AI is developed by Google			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-07 10:23:40.734474+00	2026-04-07 10:23:40.734474+00
28	2	React is mainly used for building:		b) User Interfaces\n\nExplanation:\nReact is a frontend JavaScript library mainly used for building UI components.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-26 17:16:38.610594+00	2026-03-26 17:16:38.610594+00
29	2	Which command is used to create a new React project using Vite?		b) npm init vite@latest myapp\n\nExplanation:\nVite uses this command to create a new React project.\ncreate-react-app is older and not related to Vite.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-26 17:16:38.71421+00	2026-03-26 17:16:38.71421+00
30	2	JSX stands for:		a) JavaScript XML\n\nExplanation:\nJSX allows HTML-like syntax inside JavaScript, which React uses to create UI.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-26 17:16:38.73979+00	2026-03-26 17:16:38.73979+00
31	2	A React component must return:		b) JSX\n\nExplanation:\nA component must return UI, which is written in JSX (converted to JavaScript).	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-26 17:16:38.760262+00	2026-03-26 17:16:38.760262+00
32	2	Fill in the blanks\nReact was developed by _____ | _____.		Facebook|Meta	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-26 17:16:38.780336+00	2026-03-26 17:16:38.780336+00
33	2	Fill in the blanks\nJSX allows writing HTML inside _____ code.		JSX mixes HTML inside JavaScript code.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-03-26 17:16:38.800625+00	2026-03-26 17:16:38.800625+00
34	2	Fill in the blanks\nA React application contains multiple _____ that build UI.		A React app is made up of multiple components.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	6	2026-03-26 17:16:38.812525+00	2026-03-26 17:16:38.812525+00
35	2	Fill in the blanks\nTo start a Vite React project, we run the command: npm install and then _____		npm run dev -->This command runs the development server in Vite.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	7	2026-03-26 17:16:38.82567+00	2026-03-26 17:16:38.82567+00
36	2	React is a backend framework.		React is not a backend framework; it is frontend only.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	8	2026-03-26 17:16:38.837869+00	2026-03-26 17:16:38.837869+00
37	2	Components in React can be reused across the application.		True\n\nReact components are reusable, which is a major benefit of using React.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	9	2026-03-26 17:16:38.848013+00	2026-03-26 17:16:38.848013+00
38	3	The tag contains the visible content of the webpage.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-26 19:16:55.87992+00	2026-03-26 19:16:55.87992+00
39	3	Which of the following is the correct HTML for creating a hyperlink?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-26 19:16:55.889996+00	2026-03-26 19:16:55.889996+00
40	3	The <table> element is used to			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-26 19:16:55.906906+00	2026-03-26 19:16:55.906906+00
41	3	HTML stands for HyperText Markup Language.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-26 19:16:55.913044+00	2026-03-26 19:16:55.913044+00
42	3	Which tag is used to insert a line break in HTML?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-26 19:16:55.923948+00	2026-03-26 19:16:55.923948+00
43	3	The <input> element is used to collect ______ from users.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	5	2026-03-26 19:16:55.946639+00	2026-03-26 19:16:55.946639+00
56	6	git init initializes a local repository.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-26 23:33:31.229079+00	2026-03-26 23:33:31.229079+00
57	6	Which command is used to check the current status of a Git repository?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-26 23:33:31.242338+00	2026-03-26 23:33:31.242338+00
58	6	Which command is used to add files to staging area?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-26 23:33:31.252609+00	2026-03-26 23:33:31.252609+00
59	6	Which command is used to save changes with a message?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-26 23:33:31.263571+00	2026-03-26 23:33:31.263571+00
60	6	Which command is used to upload code to remote repository?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-26 23:33:31.270187+00	2026-03-26 23:33:31.270187+00
61	7	Props are used to:		b) Pass data from parent to child\n\nExplanation:\nProps are read-only data that parents send to child components.	multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-27 10:03:01.989834+00	2026-03-27 10:03:01.989834+00
62	7	Which hook stores component data?		a) useState\n\nExplanation:\nuseState stores and updates local component data.	multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-27 10:03:02.009296+00	2026-03-27 10:03:02.009296+00
63	7	useEffect is triggered after:		a) UI renders\n\nExplanation:\nuseEffect runs after the UI renders—used for side effects like API calls.\n\n\n	multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-27 10:03:02.036647+00	2026-03-27 10:03:02.036647+00
64	7	State in React is:		b) Mutable\n\nExplanation:\nState can be updated using the state setter function.	multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-27 10:03:02.057462+00	2026-03-27 10:03:02.057462+00
65	7	Props are _____ by the child component but cannot be changed.		Props cannot be changed by the child component.	short_answer	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-27 10:03:02.087014+00	2026-03-27 10:03:02.087014+00
66	7	The hook used for side effects is _____		Used for side effects like fetching data or updating the DOM.	short_answer	1.00	"{\\"image_url\\": \\"\\"}"	5	2026-03-27 10:03:02.102849+00	2026-03-27 10:03:02.102849+00
67	7	The initial value inside useState() is called the _____ state.		The argument inside useState() is the initial value of the state.	short_answer	1.00	"{\\"image_url\\": \\"\\"}"	6	2026-03-27 10:03:02.137453+00	2026-03-27 10:03:02.137453+00
68	7	The function used to update state is known as the state _____		Returned as the second value from useState, used to update state.	short_answer	1.00	"{\\"image_url\\": \\"\\"}"	7	2026-03-27 10:03:02.162961+00	2026-03-27 10:03:02.162961+00
69	7	useState returns a value and an update function.		useState returns [value, setValue].	true_false	1.00	"{\\"image_url\\": \\"\\"}"	8	2026-03-27 10:03:02.195712+00	2026-03-27 10:03:02.195712+00
70	7	Props can be modified inside a child component.		Props cannot be modified inside a child component.	true_false	1.00	"{\\"image_url\\": \\"\\"}"	9	2026-03-27 10:03:02.20883+00	2026-03-27 10:03:02.20883+00
71	8	React Router is installed using:		a) npm install react-router-dom\n\nExplanation:\nThis is the official routing package for React.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-27 10:23:40.833654+00	2026-03-27 10:23:40.833654+00
72	8	Axios is used for:		b) Making API requests\n\nExplanation:\nAxios is a promise-based HTTP client.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-27 10:23:40.840778+00	2026-03-27 10:23:40.840778+00
73	8	React Context is used to avoid:		a) Props drilling\n\nExplanation:\nContext API helps avoid passing props through many layers.	multiple_choice	12.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-27 10:23:40.849715+00	2026-03-27 10:23:40.849715+00
74	8	Which component wraps all routes?		b) <BrowserRouter>\n\nExplanation:\nThe top-level wrapper that activates routing in React.	multiple_choice	12.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-27 10:23:40.857892+00	2026-03-27 10:23:40.857892+00
75	8	The main React Router package is _____		The official routing library.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-27 10:23:40.865256+00	2026-03-27 10:23:40.865256+00
76	8	Axios returns data using _____ and _____ functions.		Promises handle API success and error responses.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-03-27 10:23:40.870646+00	2026-03-27 10:23:40.870646+00
77	8	To share data across multiple components easily, we use _____		Used to provide values across components.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	6	2026-03-27 10:23:40.874162+00	2026-03-27 10:23:40.874162+00
78	8	A URL path is matched to a UI component using the {dash} element.		Maps a path to a component.	short_answer	11.00	"{\\"image_url\\": \\"\\"}"	7	2026-03-27 10:23:40.877613+00	2026-03-27 10:23:40.877613+00
79	8	Axios can send GET and POST requests.		Axios supports GET, POST, PUT, DELETE, etc.	true_false	9.00	"{\\"image_url\\": \\"\\"}"	8	2026-03-27 10:23:40.881208+00	2026-03-27 10:23:40.881208+00
80	8	Context API is used only for styling components.		Context API is for global state, not styling.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	9	2026-03-27 10:23:40.884382+00	2026-03-27 10:23:40.884382+00
81	9	Bootstrap is used for:		b) Styling and layout\n\nExplanation:\nBootstrap offers ready-made UI components.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-27 10:33:28.804203+00	2026-03-27 10:33:28.804203+00
82	9	Tailwind is a ____________ CSS framework.		a) Utility-first\n\nExplanation:\nTailwind uses small utility classes like flex, mt-4, text-blue-500.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-27 10:33:28.810926+00	2026-03-27 10:33:28.810926+00
83	9	To install Bootstrap in React, we use:		a) npm install react-bootstrap bootstrap\n\nExplanation:\nBoth packages are required to use Bootstrap components in React.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-27 10:33:28.81722+00	2026-03-27 10:33:28.81722+00
84	9	Tailwind classes are written inside:		b) JSX elements\n\nExplanation:\nTailwind classes are added directly to elements like:\n<div className="bg-blue-500 p-4">	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	3	2026-03-27 10:33:28.824515+00	2026-03-27 10:33:28.824515+00
85	9	Tailwind allows applying CSS using _____ classes.		Tailwind is built around utility classes.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	4	2026-03-27 10:33:28.831346+00	2026-03-27 10:33:28.831346+00
86	9	Bootstrap components in React are imported from _____.		import components like Button, Card, etc., from this package.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-03-27 10:33:28.836956+00	2026-03-27 10:33:28.836956+00
87	9	Tailwind config file name is _____ js.		This config file stores Tailwind custom settings.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	6	2026-03-27 10:33:28.842225+00	2026-03-27 10:33:28.842225+00
88	9	To enable Tailwind, we must include styles inside the _____ file.		Tailwind’s base, components, utilities must be added to index.css.	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	7	2026-03-27 10:33:28.846359+00	2026-03-27 10:33:28.846359+00
89	9	Tailwind CSS can be used with React projects.		Tailwind is commonly used with modern React projects.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	8	2026-03-27 10:33:28.849753+00	2026-03-27 10:33:28.849753+00
90	9	Bootstrap provides pre-built components like buttons and cards.		Bootstrap includes buttons, modals, cards, alerts, etc.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	9	2026-03-27 10:33:28.852838+00	2026-03-27 10:33:28.852838+00
173	17	Claude is known for its ______ capabilities in problem-solving			fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-07 10:23:40.759801+00	2026-04-07 10:23:40.759801+00
103	12	What is the definition of data as described in the session?			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-03-28 09:50:09.303227+00	2026-03-28 09:50:09.303227+00
104	12	What is Microsoft Excel primarily described as in the session?			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-03-28 09:50:09.311357+00	2026-03-28 09:50:09.311357+00
105	12	When was Microsoft Excel first launched for Macintosh?			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-03-28 09:50:09.331791+00	2026-03-28 09:50:09.331791+00
106	13	CSS stands for:			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-02 04:47:59.770035+00	2026-04-02 04:47:59.770035+00
107	13	Inline CSS is defined inside a separate .css file.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-02 04:47:59.797981+00	2026-04-02 04:47:59.797981+00
108	13	Which property changes the background color of an element?		background-color	short_answer	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-02 04:47:59.83537+00	2026-04-02 04:47:59.83537+00
109	13	The CSS box model includes content, padding, border, and			short_answer	10.00	"{\\"image_url\\": \\"\\"}"	3	2026-04-02 04:47:59.842362+00	2026-04-02 04:47:59.842362+00
110	13	Choose the correct syntax:			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-04-02 04:47:59.846583+00	2026-04-02 04:47:59.846583+00
111	13	Flexbox is used for one-dimensional layout, while Grid is for two-dimensional layout.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-04-02 04:47:59.850317+00	2026-04-02 04:47:59.850317+00
199	4	CSS stands for			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-07 10:40:56.953908+00	2026-04-07 10:40:56.953908+00
201	4	Which property changes the background color of an element?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-07 10:40:56.989251+00	2026-04-07 10:40:56.989251+00
174	17	Claude can maintain ______ across multiple sessions.			fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-07 10:23:40.766143+00	2026-04-07 10:23:40.766143+00
124	16	Gemini requires manual code input for each tag.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-02 15:56:35.699707+00	2026-04-02 15:56:35.699707+00
125	16	True/False: Gemini supports only Python and JavaScript.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-02 15:56:35.716131+00	2026-04-02 15:56:35.716131+00
129	18	git init initializes a local repository.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-03 11:23:47.395259+00	2026-04-03 11:23:47.395259+00
130	19	Fetch API returns data in XML by default.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-03 11:25:06.986766+00	2026-04-03 11:25:06.986766+00
131	20	Gemini requires manual code input for each tag.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-03 11:28:47.339477+00	2026-04-03 11:28:47.339477+00
132	20	True/False: Gemini supports only Python and JavaScript.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-03 11:28:47.355083+00	2026-04-03 11:28:47.355083+00
133	21	Claude AI is developed by Google			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-03 11:30:30.146077+00	2026-04-03 11:30:30.146077+00
134	21	Claude is known for its ______ capabilities in problem-solving			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-03 11:30:30.152216+00	2026-04-03 11:30:30.152216+00
135	21	Fill in the blank: Claude can maintain ______ across multiple sessions.			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-03 11:30:30.162526+00	2026-04-03 11:30:30.162526+00
200	4	Inline CSS is defined inside a separate .css file.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-07 10:40:56.98275+00	2026-04-07 10:40:56.98275+00
202	4	The CSS box model includes content, padding, border, and ______			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	3	2026-04-07 10:40:56.994656+00	2026-04-07 10:40:56.994656+00
203	4	Choose the correct syntax:			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-04-07 10:40:57.001116+00	2026-04-07 10:40:57.001116+00
204	4	Flexbox is used for one-dimensional layout, while Grid is for two-dimensional layout.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	5	2026-04-07 10:40:57.006294+00	2026-04-07 10:40:57.006294+00
205	5	JavaScript runs only on the server side.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-07 10:41:46.24801+00	2026-04-07 10:41:46.24801+00
206	5	Which keyword declares a variable that cannot be reassigned?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-07 10:41:46.313856+00	2026-04-07 10:41:46.313856+00
207	5	What is the output of: 5 === "5" ?			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-07 10:41:46.323431+00	2026-04-07 10:41:46.323431+00
208	5	document.getElementById() is used to select an element by its ______			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	3	2026-04-07 10:41:46.332616+00	2026-04-07 10:41:46.332616+00
209	5	Choose the correct arrow function syntax:			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	4	2026-04-07 10:41:46.339098+00	2026-04-07 10:41:46.339098+00
210	5	Promises are used in JavaScript to handle asynchronous operations.			multiple_choice	1.00	"{\\"image_url\\": \\"\\"}"	5	2026-04-07 10:41:46.344773+00	2026-04-07 10:41:46.344773+00
211	14	JavaScript runs only on the server side.		JavaScript runs both on the client side (in web browsers) and on the server side using environments like Node.js.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-08 07:05:26.385359+00	2026-04-08 07:05:26.385359+00
212	14	What is the output of: 5 === "5" ?		The === operator checks both value and type. Here, 5 is a number and "5" is a string, so they are not equal.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-08 07:05:26.441532+00	2026-04-08 07:05:26.441532+00
213	14	Fill in the blank: document.getElementById() is used to select an element by its ______.\n		document.getElementById() selects an HTML element using its unique id attribute.	fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-08 07:05:26.453267+00	2026-04-08 07:05:26.453267+00
214	14	Choose the correct arrow function syntax:		Arrow functions use the => syntax. The second option is incorrect because it’s missing =>.	multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	3	2026-04-08 07:05:26.460264+00	2026-04-08 07:05:26.460264+00
215	14	Promises are used in JavaScript to handle asynchronous operations.		Promises are used to handle asynchronous operations like API calls, making code easier to manage.	true_false	10.00	"{\\"image_url\\": \\"\\"}"	4	2026-04-08 07:05:26.468524+00	2026-04-08 07:05:26.468524+00
216	14	Which keyword declares a variable that cannot be reassigned ______.		const declares a variable whose value cannot be reassigned after it is set.	fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-04-08 07:05:26.475424+00	2026-04-08 07:05:26.475424+00
229	22	What rule does Excel follow when performing calculations?			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-08 07:33:26.456504+00	2026-04-08 07:33:26.456504+00
230	22	In Excel, using a single bracket in a calculation will not affect the output.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-08 07:33:26.504284+00	2026-04-08 07:33:26.504284+00
231	22	The four major data types in Excel are number, text, date, and ________			fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-08 07:33:26.515333+00	2026-04-08 07:33:26.515333+00
232	10	The tag contains the visible content of the webpage.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	0	2026-04-08 12:21:51.293275+00	2026-04-08 12:21:51.293275+00
233	10	Which of the following is the correct HTML for creating a hyperlink?			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	1	2026-04-08 12:21:51.363085+00	2026-04-08 12:21:51.363085+00
234	10	The element is used to:			multiple_choice	10.00	"{\\"image_url\\": \\"\\"}"	2	2026-04-08 12:21:51.377536+00	2026-04-08 12:21:51.377536+00
235	10	HTML stands for HyperText Markup Language.			true_false	10.00	"{\\"image_url\\": \\"\\"}"	3	2026-04-08 12:21:51.389823+00	2026-04-08 12:21:51.389823+00
236	10	Which tag is used to insert a line break in HTML?\n______________			fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	4	2026-04-08 12:21:51.398638+00	2026-04-08 12:21:51.398638+00
237	10	The element is used to collect _____ from users.			fill_in_blank	10.00	"{\\"image_url\\": \\"\\"}"	5	2026-04-08 12:21:51.40457+00	2026-04-08 12:21:51.40457+00
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.quizzes (id, post_author, post_date, post_content, post_title, post_excerpt, post_status, post_name, post_modified, post_parent, menu_order, post_type, quiz_time_limit, quiz_feedback_mode, quiz_max_questions_for_take, quiz_max_attempts_allowed, quiz_passing_grade, quiz_question_layout_view, quiz_questions_order, quiz_hide_quiz_details, quiz_hide_quiz_time_display, quiz_auto_start, created_at, updated_at) FROM stdin;
2	4	2026-03-26 17:15:36.965744+00		(QUIZ 1–3: Introduction, Setup, Components)		publish		2026-03-26 17:15:36.965744+00	12	0	tutor_quiz	30	default	10	10	80	single_question	rand	f	f	f	2026-03-26 17:15:36.965744+00	2026-03-26 17:15:36.965744+00
3	4	2026-03-26 19:16:55.865798+00		Quiz-1 , HTML		publish		2026-03-26 19:16:55.865798+00	10	0	tutor_quiz	30	default	10	3	50	single_question	asc	f	f	f	2026-03-26 19:16:55.865798+00	2026-03-26 19:16:55.865798+00
4	4	2026-03-26 20:45:46.517218+00		Quiz 2 |CSS		publish		2026-03-26 20:45:46.517218+00	10	0	tutor_quiz	30	default	10	3	50	single_question	asc	f	f	f	2026-03-26 20:45:46.517218+00	2026-03-26 20:45:46.517218+00
5	4	2026-03-26 22:35:18.255779+00		Java script | Quiz-3		publish		2026-03-26 22:35:18.255779+00	10	0	tutor_quiz	30	default	10	3	50	single_question	asc	f	f	f	2026-03-26 22:35:18.255779+00	2026-03-26 22:35:18.255779+00
6	4	2026-03-26 23:33:31.20104+00		Quiz 4| GIT		publish		2026-03-26 23:33:31.20104+00	10	0	tutor_quiz	30	default	10	3	50	single_question	asc	f	f	f	2026-03-26 23:33:31.20104+00	2026-03-26 23:33:31.20104+00
7	4	2026-03-27 10:03:01.964761+00		QUIZ 4–6: Props, State, Hooks		publish		2026-03-27 10:03:01.964761+00	12	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-03-27 10:03:01.964761+00	2026-03-27 10:03:01.964761+00
8	4	2026-03-27 10:23:40.821748+00		(QUIZ 7–9: Router, Axios, Context)		publish		2026-03-27 10:23:40.821748+00	12	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-03-27 10:23:40.821748+00	2026-03-27 10:23:40.821748+00
9	4	2026-03-27 10:33:28.786611+00		(QUIZ 10–11: Bootstrap, Tailwind)		publish		2026-03-27 10:33:28.786611+00	12	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-03-27 10:33:28.786611+00	2026-03-27 10:33:28.786611+00
10	4	2026-03-27 12:12:58.301469+00		Quiz-1 , HTML		publish		2026-03-27 12:12:58.301469+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-03-27 12:12:58.301469+00	2026-03-27 12:12:58.301469+00
12	4	2026-03-28 09:50:09.281599+00		Quiz 1		publish		2026-03-28 09:50:09.281599+00	9	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-03-28 09:50:09.281599+00	2026-03-28 09:50:09.281599+00
13	4	2026-04-02 04:47:59.734082+00		Quiz 2 |CSS		publish		2026-04-02 04:47:59.734082+00	11	0	tutor_quiz	30	default	10	3	50	single_question	asc	f	f	f	2026-04-02 04:47:59.734082+00	2026-04-02 04:47:59.734082+00
14	4	2026-04-02 04:55:31.840559+00		Java script | Quiz-3		publish		2026-04-02 04:55:31.840559+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-02 04:55:31.840559+00	2026-04-02 04:55:31.840559+00
16	4	2026-04-02 15:56:35.676934+00		Quiz - 6 | Gemini		publish		2026-04-02 15:56:35.676934+00	10	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-02 15:56:35.676934+00	2026-04-02 15:56:35.676934+00
17	4	2026-04-02 15:58:07.477079+00		Quiz - 7 | Claude ai		publish		2026-04-02 15:58:07.477079+00	10	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-02 15:58:07.477079+00	2026-04-02 15:58:07.477079+00
18	4	2026-04-03 11:23:47.374164+00		Quiz Topic: GIT		publish		2026-04-03 11:23:47.374164+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-03 11:23:47.374164+00	2026-04-03 11:23:47.374164+00
19	4	2026-04-03 11:25:06.970165+00		Quiz Topic: API		publish		2026-04-03 11:25:06.970165+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-03 11:25:06.970165+00	2026-04-03 11:25:06.970165+00
20	4	2026-04-03 11:28:47.310815+00		Quiz - 6 | Gemini		publish		2026-04-03 11:28:47.310815+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-03 11:28:47.310815+00	2026-04-03 11:28:47.310815+00
21	4	2026-04-03 11:30:30.134957+00		Quiz - 7 | Claude ai		publish		2026-04-03 11:30:30.134957+00	11	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-03 11:30:30.134957+00	2026-04-03 11:30:30.134957+00
22	4	2026-04-03 11:42:47.421328+00		Quiz 2		publish		2026-04-03 11:42:47.421328+00	9	0	tutor_quiz	30	default	10	3	70	single_question	asc	f	f	f	2026-04-03 11:42:47.421328+00	2026-04-03 11:42:47.421328+00
\.


--
-- Data for Name: student_course_activities; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.student_course_activities (id, user_id, course_id, lesson_id, quiz_id, activity_type, activity_value, activity_status, activity_meta, created_at) FROM stdin;
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.user_profiles (id, user_id, first_name, last_name, description, phone, designation, address, city, state, country, postal_code, profile_photo, cover_photo, facebook, twitter, linkedin, website, show_email, receive_notifications, created_at, updated_at) FROM stdin;
38	455	MichaelFoedySD	MichaelFoedySD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
39	44	Mohammed Bilal	A			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
40	451	ShaneWaiffJD	ShaneWaiffJD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
41	99	JerryelestKA	JerryelestKA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
42	117	EthankirugNY	EthankirugNY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
47	411	ScottUnumnFX	ScottUnumnFX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
48	162	LavernlekBC	LavernlekBC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
49	393	GeorgeGaumbGA	GeorgeGaumbGA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
50	24	Keerthana	A			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
51	549	AndrewTattyNK	AndrewTattyNK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
52	292	VictorwafGX	VictorwafGX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
53	251	JordanricBU	JordanricBU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
54	71	ThomasBiblyTW	ThomasBiblyTW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
55	359	WilliamnarVS	WilliamnarVS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
56	111	DonaldMowSF	DonaldMowSF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
57	473	TerryidestFS	TerryidestFS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
58	385	MichaelwexHY	MichaelwexHY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
59	145	RobertbeankSF	RobertbeankSF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
60	260	StephenlarCU	StephenlarCU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
61	247	WilliamJeardIQ	WilliamJeardIQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
62	81	GeorgemotTI	GeorgemotTI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
63	331	BrianSeiseBG	BrianSeiseBG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
64	533	OrlandoKedBS	OrlandoKedBS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
65	50	Ashra	Fathima S		9361360752	\N	B-13bakery lane block 12 neyveli township	Neyveli	TN	IN	607803	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
66	51	Athmiga	Malleswaran		9361687411	\N	154,Gugai maariyamman kovil street, Gugai	Salem	TN	IN	636006	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
67	284	RichardBriepWW	RichardBriepWW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
68	330	AustinimporYY	AustinimporYY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
69	298	MichaelnalOK	MichaelnalOK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
70	182	MichaelTomDN	MichaelTomDN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
71	263	DaviditellWV	DaviditellWV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
72	278	AnthonyGoawnUF	AnthonyGoawnUF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
73	459	ArthurTwertEI	ArthurTwertEI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
74	109	GeorgeGrileYZ	GeorgeGrileYZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
75	448	RomanvagMR	RomanvagMR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
76	502	HermanbesSF	HermanbesSF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
77	439	CharlesBexMY	CharlesBexMY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
78	156	UlyssesSwentWC	UlyssesSwentWC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
79	240	DavidvapVZ	DavidvapVZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
80	102	GregorymupQZ	GregorymupQZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
81	86	TimothyRawPT	TimothyRawPT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
82	43	Bharath	M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
83	108	EdisonCalWU	EdisonCalWU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
84	440	JasonputleXJ	JasonputleXJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
85	384	RubencriNgSF	RubencriNgSF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
86	136	SheldonlibXJ	SheldonlibXJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
87	146	StephenNenDY	StephenNenDY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
88	315	MichaelpiermTC	MichaelpiermTC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
89	413	DillonhomMQ	DillonhomMQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
90	205	RodgerpouptOX	RodgerpouptOX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
91	282	DerekJewKV	DerekJewKV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
92	238	HerbertgerAF	HerbertgerAF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
93	512	KevinSpebyYQ	KevinSpebyYQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
94	48	Buvanesh	M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
95	536	MichaelHerAP	MichaelHerAP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
96	221	StanleyrakTS	StanleyrakTS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
97	194	ArthurNizLT	ArthurNizLT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
98	224	DwayneKemTS	DwayneKemTS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
99	279	ChrisSkyncKN	ChrisSkyncKN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
100	294	JamesbapBW	JamesbapBW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
101	165	DavidInsusKC	DavidInsusKC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
102	274	StanleycetQR	StanleycetQR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
103	209	AlbertShashDH	AlbertShashDH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
104	326	JaredgomQZ	JaredgomQZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
105	412	KennydiarpWA	KennydiarpWA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
106	458	JamesquofsME	JamesquofsME			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
107	466	RobertUsellLE	RobertUsellLE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
108	452	JeffreysmilsHK	JeffreysmilsHK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
109	404	CharlesMuhGJ	CharlesMuhGJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
110	60	sashatest	02			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
111	305	Chassidy	Hummel			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
112	392	PeterHefWS	PeterHefWS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
113	195	MichaelnokBN	MichaelnokBN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
114	123	JamesDakEL	JamesDakEL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
115	398	JohnieassetDW	JohnieassetDW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
116	449	KennethjabAB	KennethjabAB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
117	396	LeonardKetFS	LeonardKetFS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
118	174	JefferyVamWD	JefferyVamWD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
119	288	JerrycewGW	JerrycewGW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
120	110	SidneyaginaYM	SidneyaginaYM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
121	83	StanleyRizAM	StanleyRizAM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
122	173	DanielkigMK	DanielkigMK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
123	406	JorgeExaraNQ	JorgeExaraNQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
125	36	sudharshan	P		7010740893	\N	1477/5/630-E, near Sona College of Technology, Kamarajar Nagar, Subramania Nagar, Suramangalam	salem	TN	IN	636005	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
126	73	ZacharyKennyZS	ZacharyKennyZS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
127	468	WillienipGG	WillienipGG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
128	163	FideljoinaIQ	FideljoinaIQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
129	417	ClaytongetDN	ClaytongetDN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
130	370	DanielMizFO	DanielMizFO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
131	237	JeffreyconHV	JeffreyconHV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
132	433	PeterdyertVM	PeterdyertVM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
133	89	DavidAcideUO	DavidAcideUO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
134	465	ShawnAloryCL	ShawnAloryCL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
135	507	WilliamnexHF	WilliamnexHF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
136	522	AaronCekWX	AaronCekWX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
137	457	JosephSleleNH	JosephSleleNH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
138	445	AngeloDaypeAY	AngeloDaypeAY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
139	546	DexterSaxNU	DexterSaxNU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
140	548	StevenImmenZN	StevenImmenZN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
141	75	DuaneLekRG	DuaneLekRG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
142	500	NathanunilsEB	NathanunilsEB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
143	225	WilliamHoopeVV	WilliamHoopeVV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
144	537	RobertSniniCO	RobertSniniCO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
145	180	HaroldmopOQ	HaroldmopOQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
146	159	MichaelTorJO	MichaelTorJO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
147	293	MelvinwedSE	MelvinwedSE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
148	432	SamuelNobefZI	SamuelNobefZI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
149	128	RickyWexNP	RickyWexNP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
150	504	JimmyunsafFV	JimmyunsafFV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
151	88	SamuelSubRF	SamuelSubRF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
152	148	AndrewcepZG	AndrewcepZG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
153	471	WilliamMeawlST	WilliamMeawlST			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
154	496	JeremyclincNG	JeremyclincNG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
155	42	Ken	San			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
156	257	JeffreyTigCM	JeffreyTigCM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
157	45	Sashainfinity	education			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
158	20	Dhanus	E M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
159	204	GordonguemiZZ	GordonguemiZZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
160	21	Divakar	Ravi			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
161	197	WilliamwootaIA	WilliamwootaIA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
162	271	MichealGlitsLP	MichealGlitsLP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
163	409	GlenntexBZ	GlenntexBZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
164	543	WilliamTaisaKA	WilliamTaisaKA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
165	230	DavidDefWI	DavidDefWI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
166	378	RalphCruptUM	RalphCruptUM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
167	76	DavidowelfRP	DavidowelfRP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
168	78	FrankbaWBE	FrankbaWBE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
169	175	CharlietamHL	CharlietamHL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
170	231	NathancakNT	NathancakNT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
171	503	JamesVahVR	JamesVahVR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
172	319	CharlestethyWS	CharlestethyWS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
173	254	HenryFaistLG	HenryFaistLG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
174	438	JeromesobGQ	JeromesobGQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
175	310	EESSHWHAR	B D			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
176	308	Eesshwhar	B D			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
177	141	FrankLonLR	FrankLonLR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
178	113	DanielGeonaND	DanielGeonaND			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
179	555	ThomasterCX	ThomasterCX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
180	477	CharlesExidaER	CharlesExidaER			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
181	360	LutherpubreFU	LutherpubreFU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
182	211	WilliefexYD	WilliefexYD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
183	399	CalebReDTA	CalebReDTA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
184	187	DanielSlicaMH	DanielSlicaMH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
185	276	EdwardshuseRC	EdwardshuseRC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
186	356	DavidflamiVJ	DavidflamiVJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
187	133	DavidKibWN	DavidKibWN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
188	252	AlbertMopVX	AlbertMopVX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
189	470	EugenebumXJ	EugenebumXJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
190	248	RobertEmifyUB	RobertEmifyUB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
191	364	JameshealoFP	JameshealoFP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
192	509	GlennPhivaOW	GlennPhivaOW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
193	236	DavidpepPX	DavidpepPX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
194	255	StanleyJerOL	StanleyJerOL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
195	357	WilburnFagLY	WilburnFagLY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
196	85	VincentgamMJ	VincentgamMJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
197	193	JamesvowOW	JamesvowOW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
198	540	LeonardtrakeEO	LeonardtrakeEO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
199	481	DanieldekCY	DanieldekCY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
200	22	Gowtham	Murugan			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
201	534	EdwardtahJU	EdwardtahJU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
202	68	Gurudev	Murugan			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
203	198	AnthonyvoilkPR	AnthonyvoilkPR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
204	246	DonaldHeawnVF	DonaldHeawnVF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
205	542	StephenvotEA	StephenvotEA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
206	516	StevenbagPN	StevenbagPN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
207	515	StephenkiGCM	StephenkiGCM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
208	410	ArthurLoolfVJ	ArthurLoolfVJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
209	261	GeorgemaxYZ	GeorgemaxYZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
210	243	MarcoscigSQ	MarcoscigSQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
211	321	DonaldMaictUS	DonaldMaictUS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
212	530	EdwardRokYR	EdwardRokYR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
213	390	DavidAgernZR	DavidAgernZR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
214	550	AlfredmesJL	AlfredmesJL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
215	325	RichardUseseHJ	RichardUseseHJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
216	475	RichardMumQC	RichardMumQC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
217	265	RonaldareteBT	RonaldareteBT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
218	340	JoshuaclemyGZ	JoshuaclemyGZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
219	389	GeorgeOvawlSA	GeorgeOvawlSA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
220	312	AndrehefFA	AndrehefFA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
221	227	MichealmizJM	MichealmizJM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
222	101	PhilipmumLM	PhilipmumLM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
223	15	logan	f		753987545	\N	sfc gdgdjg dhrdhrt	sal	TN	IN	678543	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
224	505	LarryvekPA	LarryvekPA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
225	18	Deepikasri	DC		+917010740893	\N	1477/5/630-E, near Sona College of Technology, Kamarajar Nagar, Subramania Nagar, Suramangalam	salem	TN	IN	636004	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
226	304	Curlo	Test			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
227	403	BrianHafFW	BrianHafFW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
228	222	SheldonjerFM	SheldonjerFM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
229	478	KevinVahHU	KevinVahHU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
230	486	JosephdrymnAN	JosephdrymnAN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
231	425	TommybrowsMF	TommybrowsMF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
232	414	PeterfesPB	PeterfesPB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
233	324	StephennekDT	StephennekDT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
234	333	WilliamnowGW	WilliamnowGW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
235	497	DavidMomBI	DavidMomBI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
236	191	EduardonulkyMA	EduardonulkyMA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
237	220	RoberthequeHD	RoberthequeHD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
238	235	RonaldKetFX	RonaldKetFX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
239	250	JohnnygatYL	JohnnygatYL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
240	447	EdwardFetTX	EdwardFetTX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
241	212	GregoryShariUC	GregoryShariUC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
242	469	StevenFumKI	StevenFumKI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
243	520	AnthonyBorCW	AnthonyBorCW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
245	82	KevinvafMN	KevinvafMN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
246	170	AnthonyJetXY	AnthonyJetXY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
247	535	RaymondPoxRQ	RaymondPoxRQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
248	482	WaynePsymnXQ	WaynePsymnXQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
249	434	MartinBoigeCW	MartinBoigeCW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
250	23	Jenifer	R			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
251	199	RogerpeabsAQ	RogerpeabsAQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
252	462	KeithphypeKW	KeithphypeKW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
253	554	MichaelmeattLP	MichaelmeattLP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
254	316	ReubensafEK	ReubensafEK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
255	314	JimmieFetPH	JimmieFetPH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
256	144	EdwardCerUW	EdwardCerUW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
257	490	GeorgeAdubsFT	GeorgeAdubsFT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
258	339	ThomasKashyXH	ThomasKashyXH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
259	258	JosephnonRD	JosephnonRD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
260	153	JorgeVowJD	JorgeVowJD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
261	275	HaroldcepMT	HaroldcepMT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
262	118	JeffreyloxYB	JeffreyloxYB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
263	217	KennethKitTD	KennethKitTD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
264	167	RichardFenOZ	RichardFenOZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
265	493	DonaldtabIE	DonaldtabIE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
266	214	WilliamDiaskBS	WilliamDiaskBS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
267	491	RobertmorHB	RobertmorHB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
268	335	DanielbizEU	DanielbizEU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
269	467	LucascahOK	LucascahOK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
270	342	BrianUnopeRE	BrianUnopeRE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
271	97	JustingafFC	JustingafFC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
272	394	DouglassuhOX	DouglassuhOX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
273	483	DonaldWhishZN	DonaldWhishZN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
274	363	WalterapodsHJ	WalterapodsHJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
275	355	AnthonycycleRP	AnthonycycleRP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
276	241	SamuelmumIT	SamuelmumIT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
277	547	HowardDioftQH	HowardDioftQH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
278	272	RichardMaGDE	RichardMaGDE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
279	69	Kalaiyarasan	Dhandapani			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
280	277	EdgarWalTE	EdgarWalTE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
281	239	CarlosWemTS	CarlosWemTS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
282	161	MarvinpydayBM	MarvinpydayBM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
283	526	RonnieEconeBP	RonnieEconeBP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
284	74	ArnoldpawWV	ArnoldpawWV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
285	484	PhilipboindBN	PhilipboindBN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
286	348	HowardGicleHD	HowardGicleHD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
287	395	DonaldFalBZ	DonaldFalBZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
288	368	MichaelBuicsHP	MichaelBuicsHP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
289	369	AaronNekWB	AaronNekWB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
290	518	IsidrokAkVW	IsidrokAkVW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
291	289	HenryIncugHN	HenryIncugHN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
292	391	AndrewHofUG	AndrewHofUG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
293	234	AlonzotuhCN	AlonzotuhCN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
294	450	CurtishitXG	CurtishitXG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
295	347	WilliamSeistSD	WilliamSeistSD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
296	112	JosephiCodsVL	JosephiCodsVL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
297	327	KirbyTibigSU	KirbyTibigSU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
298	297	HaroldCetMP	HaroldCetMP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
299	135	BillyIncupBA	BillyIncupBA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
300	506	WilliamSibBQ	WilliamSibBQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
301	172	AaronheakeDI	AaronheakeDI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
302	329	JamesNaingFG	JamesNaingFG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
303	387	FrancisImipsQJ	FrancisImipsQJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
304	122	BlairEnvipOJ	BlairEnvipOJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
305	303	LMailcigCW	LaravelMailcigCW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
306	431	DavidSletaEW	DavidSletaEW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
307	40	Bharath	M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
308	418	ScotttrinkFS	ScotttrinkFS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
309	386	TimothyerardPF	TimothyerardPF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
310	513	RobertoNawMM	RobertoNawMM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
311	190	EdwinpowDF	EdwinpowDF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
312	143	CharlesgewIZ	CharlesgewIZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
313	344	ShawnRipFU	ShawnRipFU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
314	444	KennethSaikeBK	KennethSaikeBK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
315	32	Shanmugavel	S			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
316	436	RonaldwixXN	RonaldwixXN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
317	358	DonaldRoakyRC	DonaldRoakyRC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
318	541	WilliamgobZO	WilliamgobZO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
319	107	MichealFemOB	MichealFemOB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
320	226	DuanebrisaFX	DuanebrisaFX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
321	401	MichealdabGL	MichealdabGL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
322	39	logan	f			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
323	52	LOGADHEENAN	V M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
324	53	LOGADHEENAN	V M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
325	25	loki	l			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
326	72	JessebuhBC	JessebuhBC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
327	552	FreddietoFNP	FreddietoFNP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
328	521	DanielCredyIA	DanielCredyIA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
329	223	MichaelBreraIB	MichaelBreraIB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
330	213	AaronNobSB	AaronNobSB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
331	121	DouglasDitUJ	DouglasDitUJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
332	343	CharlesPipFY	CharlesPipFY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
333	49	K. P. Senthamiz	maaran		9345890923	\N	108-Vinayagapuram,Attur	Attur	TN	IN	636102	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
334	96	BrandonBeignIW	BrandonBeignIW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
335	286	RobertSnurnPO	RobertSnurnPO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
336	437	CecilrowOJ	CecilrowOJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
337	538	MichaelvotQA	MichaelvotQA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
338	487	MatthewElulkEX	MatthewElulkEX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
339	374	WilliamSmureAS	WilliamSmureAS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
340	361	CarrollcouncBN	CarrollcouncBN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
341	216	MorrisFubFN	MorrisFubFN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
342	242	TrevorMydayHF	TrevorMydayHF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
343	336	AnthonyCeXBR	AnthonyCeXBR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
344	442	BryanFedHY	BryanFedHY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
345	460	RichardadasyPL	RichardadasyPL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
346	420	CraigHixYO	CraigHixYO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
347	531	PeterhewKP	PeterhewKP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
348	151	StevePewTQ	StevePewTQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
349	296	RichardDutZO	RichardDutZO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
350	253	JeffreyHexYA	JeffreyHexYA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
351	79	ChesterutishOR	ChesterutishOR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
352	87	StevenEngewSD	StevenEngewSD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
353	351	JimmyPloftQK	JimmyPloftQK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
354	474	RobertApalkMU	RobertApalkMU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
355	443	BillysoovaAM	BillysoovaAM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
356	472	EdwardcaxDZ	EdwardcaxDZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
357	529	CharlesMumHI	CharlesMumHI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
358	124	JoshuagargoBA	JoshuagargoBA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
359	186	JuniorselveGK	JuniorselveGK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
360	280	CharlesPailtKT	CharlesPailtKT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
361	366	PeterbapUG	PeterbapUG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
362	388	ScottJoisaUE	ScottJoisaUE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
363	454	NorbertzekHA	NorbertzekHA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
364	527	DerrickGefFV	DerrickGefFV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
365	77	JamesFizBG	JamesFizBG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
366	98	WilliamabispTZ	WilliamabispTZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
367	67	Viveganandan	S			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
368	322	RoyceWafVG	RoyceWafVG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
369	244	CedricgealoEW	CedricgealoEW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
370	422	CeciliroldMO	CeciliroldMO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
371	233	JamessobVN	JamessobVN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
372	426	AlvinLarseHV	AlvinLarseHV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
373	249	AntoniofluogON	AntoniofluogON			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
374	320	ThomasSnireKA	ThomasSnireKA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
375	26	MP	test		8438740893	\N	adfad	salem	TN	IN	636004	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
376	59	Logadheenan	Vv			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
377	428	DanielJafPK	DanielJafPK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
379	408	JulianZenXP	JulianZenXP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
380	528	ThomasVokKR	ThomasVokKR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
381	157	CharlesimmorBM	CharlesimmorBM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
382	183	FloydMicBX	FloydMicBX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
383	300	DanielgainiIX	DanielgainiIX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
384	338	BruceGobAO	BruceGobAO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
385	328	BrooksvuslyUR	BrooksvuslyUR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
386	480	MichaelKeypeCC	MichaelKeypeCC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
387	93	MatthewDebraPC	MatthewDebraPC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
388	137	AlonzomonWQ	AlonzomonWQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
389	125	AnthonyGReraCG	AnthonyGReraCG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
390	185	SteveVahCE	SteveVahCE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
391	435	AngeldoxYR	AngeldoxYR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
392	229	MartinLibJM	MartinLibJM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
393	311	DavidDaurlOD	DavidDaurlOD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
394	341	MichaelHuslyBK	MichaelHuslyBK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
395	309	JamesdusOO	JamesdusOO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
396	380	JaredvowWE	JaredvowWE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
397	90	HermanButVE	HermanButVE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
398	371	MohamedbemEY	MohamedbemEY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
399	427	GerardoMusDH	GerardoMusDH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
400	84	CharlesicectQX	CharlesicectQX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
401	551	RobertInicaNV	RobertInicaNV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
402	169	KennethTwimiKX	KennethTwimiKX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
403	130	GeorgeKemUR	GeorgeKemUR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
404	91	CharlesFusRO	CharlesFusRO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
405	200	AndrewSpedoHJ	AndrewSpedoHJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
406	421	JeffreymuhNL	JeffreymuhNL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
407	464	HowarddupTF	HowarddupTF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
408	456	JamesCraliCB	JamesCraliCB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
409	158	DerrickOrideYE	DerrickOrideYE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
410	176	SandybluseAW	SandybluseAW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
411	206	RogerPlobeZY	RogerPlobeZY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
412	41	Gurudev	G			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
413	317	JamesacifyQM	JamesacifyQM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
414	375	RubenmeeceMG	RubenmeeceMG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
415	287	DavidAbicyWM	DavidAbicyWM			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
416	334	RandyNakLK	RandyNakLK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
417	476	StephenpatIK	StephenpatIK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
418	34	SOWMIYA	PR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
419	405	ScottdamJC	ScottdamJC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
420	171	ArturoshagsFF	ArturoshagsFF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
421	27	Pushpa	K			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
422	92	AaronSPOPEMO	AaronSPOPEMO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
424	377	WilliamgrozySG	WilliamgrozySG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
425	94	ScottclickHX	ScottclickHX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
426	245	MichaeltOfYW	MichaeltOfYW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
427	114	KevinCupXX	KevinCupXX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
428	116	AlbertDaypeZH	AlbertDaypeZH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
429	142	JamesbalRA	JamesbalRA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
430	259	HenryNewFE	HenryNewFE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
431	346	CaseyBoulpLJ	CaseyBoulpLJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
432	517	WilliamhakFJ	WilliamhakFJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
433	177	DonaldelingXS	DonaldelingXS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
434	178	StephenRedHN	StephenRedHN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
435	430	CharlievobrePQ	CharlievobrePQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
436	31	Seralathan	Rajendran			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
437	423	StephenbowSW	StephenbowSW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
438	218	WilliamKixGJ	WilliamKixGJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
439	373	WilliamSpeniDW	WilliamSpeniDW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
440	532	PhillipmedNC	PhillipmedNC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
441	523	WilliamVussyLU	WilliamVussyLU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
442	35	Subhasri	M			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
443	499	BrucedroxyNR	BrucedroxyNR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
444	299	MiguelEdinaVW	MiguelEdinaVW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
445	285	ByronkaxZC	ByronkaxZC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
446	228	GeorgeExersWL	GeorgeExersWL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
447	61	Saran	T			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
448	28	sanjaykumaran	v			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
449	29	Sanjay	L			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
450	511	PatrickBiGPI	PatrickBiGPI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
451	524	KennethSmaftEY	KennethSmaftEY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
452	345	DwayneLonTR	DwayneLonTR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
453	525	HenryWalHY	HenryWalHY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
454	57	Saran	T			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
455	62	Saran	t			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
456	37	Utporul	Sasha		8438740893	\N	Salem	Salem	TN	IN	636005	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
457	492	ThomasSEKVU	ThomasSEKVU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
458	501	MatthewsuichCQ	MatthewsuichCQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
459	353	RichardEmadaSK	RichardEmadaSK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
460	424	KelvingycleQD	KelvingycleQD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
461	323	RobertsomIZ	RobertsomIZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
462	256	RonaldBedUR	RonaldBedUR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
463	208	JamesdubLI	JamesdubLI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
464	103	JamesbuiftJL	JamesbuiftJL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
465	362	StephenAmameUY	StephenAmameUY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
466	407	RaymondfesMY	RaymondfesMY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
467	301	JacobSahXF	JacobSahXF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
468	262	PierreNewYY	PierreNewYY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
469	397	VincentLiaspSS	VincentLiaspSS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
470	129	RichardsnistQX	RichardsnistQX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
471	494	FrankOccawNW	FrankOccawNW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
472	149	TerryNAtRL	TerryNAtRL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
473	80	RobertOvetaTC	RobertOvetaTC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
474	16	Sharveshwar	Rajkumar			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
475	147	LancelagAV	LancelagAV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
476	66	shreelekha	S V		+91 93607 78640	\N	18/1,reddipatty	salem	TN	IN	636503	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
477	150	PhillipsAtteBF	PhillipsAtteBF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
478	33	siximi	si			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
479	350	PeterFugRF	PeterFugRF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
480	232	TimothywahWU	TimothywahWU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
1	1	LOKESHWARAN	S	Iam a student at sona college of technology		Student												f	t	2026-03-07 10:53:36.302943+00	2026-04-06 10:27:27.650787+00
481	269	MichaelWeimaJH	MichaelWeimaJH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
482	264	OscarDepAE	OscarDepAE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
483	100	JustinbumGI	JustinbumGI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
484	17	Sowmiya	R			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
485	400	ClaudePeadoLS	ClaudePeadoLS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
486	138	RobertfrectOV	RobertfrectOV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
487	55	Srina	S		9543999953	\N	New busstand	Salem	TN	IN	636009	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
488	119	JamesspemnHR	JamesspemnHR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
489	132	VinceCoulaST	VinceCoulaST			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
490	201	RonaldtrotsDX	RonaldtrotsDX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
491	160	NathanthispXP	NathanthispXP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
492	58	learn-with-sasha	ss			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
493	318	LarrykarJH	LarrykarJH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
494	544	RussellpedakRQ	RussellpedakRQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
495	295	GeorgefrimiCP	GeorgefrimiCP			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
496	402	LarryMorPX	LarryMorPX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
497	139	PatricklobUO	PatricklobUO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
498	283	BillyfeeliML	BillyfeeliML			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
499	164	JeffreybusQB	JeffreybusQB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
500	181	GeorgeDumXC	GeorgeDumXC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
501	553	DavidMefZQ	DavidMefZQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
502	416	DevinLahDQ	DevinLahDQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
503	381	GeraldhubBO	GeraldhubBO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
504	365	ErnestCipsyWD	ErnestCipsyWD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
505	127	DorseyFapLR	DorseyFapLR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
506	281	DevinKitRS	DevinKitRS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
507	441	WilliamSeflyVW	WilliamSeflyVW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
508	485	ScottJEDDS	ScottJEDDS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
509	179	MichealCycleOI	MichealCycleOI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
510	354	KennethReuncVT	KennethReuncVT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
511	46	Gurudev	F			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
512	95	RusselavaftRY	RusselavaftRY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
513	463	ClaudeEtellGR	ClaudeEtellGR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
514	545	RobertBlarmKI	RobertBlarmKI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
544	219	JamesthiptFI	JamesthiptFI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
545	367	MichaelFaincFR	MichaelFaincFR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
546	495	RobertPepQA	RobertPepQA			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
547	453	DonaldnigWV	DonaldnigWV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
548	419	JamesgerWB	JamesgerWB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
549	376	LewisprusaPG	LewisprusaPG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
550	508	GradyHaxQE	GradyHaxQE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
551	290	NathanjakLQ	NathanjakLQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
552	488	BookeraffokMH	BookeraffokMH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
553	215	SidneySetPY	SidneySetPY			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
554	267	WilliepowlyPT	WilliepowlyPT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
555	382	DanielunemiYB	DanielunemiYB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
556	556	Sashainfinity	education			Software engineer						/uploads/avatars/556_f471215dd1454467a58ed2728810a819.jpeg						f	t	2026-04-08 08:57:15.187283+00	2026-04-08 09:23:43.884188+00
423	30	sharveshwar	R			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
557	557	lokiw	S															f	t	2026-04-08 09:31:56.334383+00	2026-04-08 09:31:56.334383+00
16	56	SRINA	S			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
17	429	RogerskartQN	RogerskartQN			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
18	105	HenrysefKX	HenrysefKX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
19	302	AaronPrevyUQ	AaronPrevyUQ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
20	196	JeromeboypeUF	JeromeboypeUF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
21	349	MatthewvawWU	MatthewvawWU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
22	106	ThomasgaxMU	ThomasgaxMU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
23	539	JesusweickQT	JesusweickQT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
24	268	MauricesofMB	MauricesofMB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
25	307	admin_1				\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
4	4	Curlo	Test	System Administrator		System Administrator								https://www.instagram.com/sashainfinityedu?igsh=cmVycTFseHRjYmw2		https://www.linkedin.com/company/sashainfinity/	https://sashainfinity.com	f	t	2026-03-07 11:14:06.510513+00	2026-04-06 10:27:27.650787+00
26	332	SheldonMumZU	SheldonMumZU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
27	19	Akil	Sadik M H			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
28	47	Albert	Das			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
29	140	BuddycicWC	BuddycicWC			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
30	352	EdwardGaPKK	EdwardGaPKK			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
31	479	MatthewLuntyFT	MatthewLuntyFT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
32	337	DavidtusTF	DavidtusTF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
33	498	EddieLesKL	EddieLesKL			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
34	154	JerrellmibPX	JerrellmibPX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
35	115	HenryKahBW	HenryKahBW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
36	489	LioneldournYR	LioneldournYR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
11	11	Dinesh	S M	Expertise in the field of software development	9566455286	Software engineer	12/15 church street ,  moscow 	Chennai	Tamilnadu	India	636001	/uploads/avatars/11_3e230ace3bb44c54aa7d331dec6c2026.jpg		https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	f	t	2026-04-02 05:09:26.800855+00	2026-04-08 09:24:30.890484+00
5	5	MohammedRifath	M															f	t	2026-03-07 11:58:32.699413+00	2026-04-06 10:26:03.594728+00
6	6	tretrbvtre	rvrdf	fvdvdfxv	0987654321	ufivuisdfbvsdv	bfbnfnfn	fnfnfn	fdnfdfn	fdnfnfdnf	nfnfnfn							f	t	2026-03-07 11:59:14.804052+00	2026-04-06 10:26:03.594728+00
7	7	MohammedRifath	M		8056640884	web developer		salem	TAMINADU	india	636015							f	t	2026-03-10 09:01:12.087073+00	2026-04-06 10:26:03.594728+00
9	9	SUBASH	KRISHNAN		9345471612	VR Developer												f	t	2026-03-24 04:41:15.369194+00	2026-04-06 10:26:03.594728+00
10	10	Dinesh	R	A college student	6379853092	Student	12/15 , church street	chennai	Tamilnadu	India	636001			https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	https://lms.sashainfinity.com/profile	f	t	2026-04-01 11:21:23.187578+00	2026-04-06 10:26:03.594728+00
12	12	Lokeshwaran	S	learn to earn	7824995050	Student	207, Appu Chetty St	Salem	Tamil Nadu	India	636002			www.facebook.com	www.twitter.com	www.linkedin.com	www.YouTube.com	f	t	2026-04-04 08:32:35.537564+00	2026-04-06 10:26:03.594728+00
13	13	Rifath	M	I am a student	7010740893	Student	18/1, Reddipatty	Salem	Tamil Nadu	India	636503			www.facebook.com	www.twitter.com	www.linkedin.com	www.netlify.com	f	t	2026-04-04 12:53:26.921386+00	2026-04-06 10:26:03.594728+00
14	14	Bhuvaneshwaran	R															f	t	2026-04-04 18:46:27.018757+00	2026-04-06 10:26:03.594728+00
43	131	ArmandoNigXG	ArmandoNigXG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
44	514	WilliamRarmaEU	WilliamRarmaEU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
45	273	EdwardelavaPU	EdwardelavaPU			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
46	63	CharlesDopTE	CharlesDopTE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
8	8	Rifath	M			web developer												f	t	2026-03-10 11:02:21.576736+00	2026-04-06 10:27:27.650787+00
37	446	HarrywekWO	HarrywekWO			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
124	306	contact				\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
244	192	NathanValMT	NathanValMT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
378	266	MarcosCoxZT	MarcosCoxZT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
15	54	Poornasri	J M		+917010663166		226/125 - I, GUha Aashram Rd, Saradha College Main Rd, Fairlands, Salem - 636016	Salem	TN	IN	636016							f	t	2026-04-06 10:15:43.956442+00	2026-04-06 10:27:27.650787+00
515	104	DwayneMycleBW	DwayneMycleBW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
516	461	JerrysitGT	JerrysitGT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
517	120	CharlesHaplyMX	CharlesHaplyMX			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
518	166	JavierErodsQH	JavierErodsQH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
519	152	DanielHieniOG	DanielHieniOG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
520	415	NelsonTelayAJ	NelsonTelayAJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
521	184	RonaldmaHLZ	RonaldmaHLZ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
522	270	DavidcesUF	DavidcesUF			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
523	134	CharlessalIW	CharlessalIW			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
524	207	RobertzesteRG	RobertzesteRG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
525	510	MathewJoidaWB	MathewJoidaWB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
526	188	RobertFapleNS	RobertFapleNS			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
527	189	AlbertKenIV	AlbertKenIV			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
528	38	Vairamanivel	Murugesan			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
529	379	BradleyPaypeUH	BradleyPaypeUH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
530	155	MichaeltigKT	MichaeltigKT			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
531	126	PeterhobNG	PeterhobNG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
532	168	HaroldRoxIR	HaroldRoxIR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
533	202	JoshuaTugYG	JoshuaTugYG			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
534	203	JamesnagFR	JamesnagFR			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
535	210	MiltonSledsVH	MiltonSledsVH			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
536	70	MichaelnagQE	MichaelnagQE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
537	65	Vinoth	M T			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
538	64	Vinoth	M T		6369407887	\N	Periyakinnaru st, Near Kumaragiri lake park, Ammapet,Salem	Salem	TN	IN	636003	\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
539	313	WilliamTaitoQJ	WilliamTaitoQJ			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
540	372	JeromeSabDB	JeromeSabDB			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
541	519	LewisLipKI	LewisLipKI			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
542	383	AaroneduffOD	AaroneduffOD			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
543	291	PerryliedyEE	PerryliedyEE			\N						\N	\N	\N	\N	\N	\N	\N	\N	2026-04-06 10:22:34.655186+00	2026-04-06 10:27:27.650787+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.user_roles (id, user_id, role, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.users (id, user_login, user_pass, user_nicename, user_email, user_url, user_registered, user_activation_key, user_status, display_name, role, is_active, is_verified, profile_completed, last_login, created_at, updated_at) FROM stdin;
4	sashainfinity_admin	$2b$12$JqQV8.WUxLHcMilqQDFoP.QnS6GVr9QP38b6jgDelPJJfKymM9fqC	sashainfinity_admin	admin@sashainfinity.com		2026-03-07 11:14:06.510513+00		0	Curlo Test	admin	t	t	f	2026-03-07 11:14:06.772665+00	2026-03-07 11:14:06.510513+00	2026-03-07 11:14:06.510513+00
19	akilsadik	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	akilsadik	akilsadik@sashainfinity.com	\N	2025-05-23 11:48:49+00	\N	\N	Akil Sadik M H	student	t	t	f	\N	2026-04-06 10:10:56.255696+00	2026-04-06 10:10:56.255696+00
24	keerthana	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	keerthana	anandhikeerthi321@gmail.com	\N	2025-05-03 17:50:09+00	\N	\N	Keerthana A	student	t	t	f	\N	2026-04-06 10:10:56.259024+00	2026-04-06 10:10:56.259024+00
54	poornasri007	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	poornasri007	kowshikpoorna@gmail.com	\N	2025-10-16 12:22:32+00	\N	\N	Poornasri J M	student	t	t	t	\N	2026-04-06 10:10:56.280764+00	2026-04-06 10:10:56.280764+00
13	mrifath2005m	$2b$12$vOAMLs4m6M9UESzFWOK0AeJg.GtgWEp1P4Za9fnQNuXay5XdgnS.q	mrifath2005m	mrifath2005m@gmail.com		2026-04-04 12:53:26.559495+00		1	Rifath M	student	t	t	t	\N	2026-04-04 12:53:26.559495+00	2026-04-04 12:55:47.787522+00
14	bhuvaneshwarangdg	$2b$12$iF0vS0WSHujvUE3c5EeAoe190G1NPHxt/KSfZT5fI2EoNSlNb8YmO	bhuvaneshwarangdg	bhuvaneshwarangdg@gmail.com		2026-04-04 18:46:26.695216+00		1	Bhuvaneshwaran R	student	t	t	f	\N	2026-04-04 18:46:26.695216+00	2026-04-04 18:47:22.603233+00
556	dineshsm0715	$2b$12$Uxh/VgiTpK1qwnT7ASSZlOVZsKveyPkM8rcXpdizV3HZzXUKsCdbS	dineshsm0715	dineshsm0715@gmail.com		2026-04-08 08:57:14.893395+00		1	Sashainfinity education	instructor	t	t	f	\N	2026-04-08 08:57:14.893395+00	2026-04-08 08:58:38.05805+00
5	mohammedrifathm3	$2b$12$YwH4ZLs//SPv.u88RyYtFez9en4qbghcns7nObankueKCZVg6ly2y	mohammedrifathm3	mohammedrifathm3@gmail.com		2026-03-07 11:58:32.462374+00		1	MohammedRifath M	student	t	f	f	\N	2026-03-07 11:58:32.462374+00	2026-03-07 11:58:32.462374+00
6	jaisai2005	$2b$12$0rdRalDIdy8BPh6AXCIudOVNCfPlgdaj1fDYaFXL7vpF906ZoB5fm	jaisai2005	jaisai2005@gmail.com		2026-03-07 11:59:14.563324+00		1	tretrbvtre rvrdf	student	t	t	t	\N	2026-03-07 11:59:14.563324+00	2026-03-07 12:03:05.152931+00
7	mohammedrifathm695	$2b$12$SVkzQgmVTR5EYg7840j1/eENa0Y3keY9ANrUQnutoRQyERDtyUhDG	mohammedrifathm695	mohammedrifathm695@gmail.com		2026-03-10 09:01:11.830122+00		1	MohammedRifath M	student	t	t	t	\N	2026-03-10 09:01:11.830122+00	2026-03-10 09:03:05.168635+00
9	subashkaran912	$2b$12$fwy6D5xLZmTD1pjXl4hrC.7Zn5W72cwtd8Kj3YjUU3WVlED38UqqS	subashkaran912	subashkaran912@gmail.com		2026-03-24 04:41:15.039385+00		1	SUBASH KRISHNAN	student	t	t	t	\N	2026-03-24 04:41:15.039385+00	2026-03-24 04:43:14.289666+00
10	dulquerdk	$2b$12$czZwlUoePZARyOd6tw/qduBt.yvgWB4UnhfCf81XWxF7r6shgm1XO	dulquerdk	dulquerdk@gmail.com		2026-04-01 11:21:22.910543+00		1	Dinesh R	student	t	t	t	\N	2026-04-01 11:21:22.910543+00	2026-04-01 11:23:27.979787+00
11	dineshsm715	$2b$12$DSy9I.kGkBuFCEDkYVw5QOoNQjLtxd9IfXZ8ngUUfeoMKw6nevvYm	dineshsm715	dineshsm715@gmail.com		2026-04-02 05:09:26.517347+00		1	Dinesh S M	instructor	t	t	t	\N	2026-04-02 05:09:26.517347+00	2026-04-02 05:11:49.947388+00
12	slokeshwaran2105	$2b$12$PeE9WQ7e8XEO.OOrrPiRGOJmbqr.EI7K1wLWLEJW/Au3JS6G7Ik/6	slokeshwaran2105	slokeshwaran2105@gmail.com		2026-04-04 08:32:35.161335+00		1	Lokeshwaran S	student	t	t	t	\N	2026-04-04 08:32:35.161335+00	2026-04-04 08:35:17.540315+00
47	albertdas	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	albertdas	akilsadik2004@gmail.com	\N	2025-07-01 10:02:55+00	\N	\N	Albert Das	student	t	t	f	\N	2026-04-06 10:10:56.27585+00	2026-04-06 10:10:56.27585+00
99	Jerryelest	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jerryelest	amalkamog@yahoo.com	\N	2026-02-09 02:52:19+00	\N	\N	JerryelestKA JerryelestKA	student	t	t	f	\N	2026-04-06 10:10:56.322462+00	2026-04-06 10:10:56.322462+00
117	Ethankirug	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Ethankirug	amanda4414@hotmail.com	\N	2026-02-09 06:01:16+00	\N	\N	EthankirugNY EthankirugNY	student	t	t	f	\N	2026-04-06 10:10:56.335593+00	2026-04-06 10:10:56.335593+00
131	ArmandoNig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ArmandoNig	amandasunshine1@yahoo.com	\N	2026-02-09 19:25:20+00	\N	\N	ArmandoNigXG ArmandoNigXG	student	t	t	f	\N	2026-04-06 10:10:56.343675+00	2026-04-06 10:10:56.343675+00
273	Edwardelava	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Edwardelava	amberhuff77@gmail.com	\N	2026-02-10 09:27:26+00	\N	\N	EdwardelavaPU EdwardelavaPU	student	t	t	f	\N	2026-04-06 10:10:56.414994+00	2026-04-06 10:10:56.414994+00
63	CharlesDop	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesDop	amitagrawal23@gmail.com	\N	2025-12-12 19:28:28+00	\N	\N	CharlesDopTE CharlesDopTE	student	t	t	f	\N	2026-04-06 10:10:56.286152+00	2026-04-06 10:10:56.286152+00
411	ScottUnumn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ScottUnumn	amministrazione@securityitalia.it	\N	2026-04-04 13:41:26+00	\N	\N	ScottUnumnFX ScottUnumnFX	student	t	t	f	\N	2026-04-06 10:10:56.478629+00	2026-04-06 10:10:56.478629+00
549	AndrewTatty	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AndrewTatty	anantharam.tl@gmail.com	\N	2026-04-05 15:23:59+00	\N	\N	AndrewTattyNK AndrewTattyNK	student	t	t	f	\N	2026-04-06 10:10:56.558474+00	2026-04-06 10:10:56.558474+00
292	Victorwaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Victorwaf	andycong55@outlook.com	\N	2026-02-10 11:38:55+00	\N	\N	VictorwafGX VictorwafGX	student	t	t	f	\N	2026-04-06 10:10:56.422362+00	2026-04-06 10:10:56.422362+00
251	Jordanric	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jordanric	anjurr_henderson@yahoo.com	\N	2026-02-10 06:32:58+00	\N	\N	JordanricBU JordanricBU	student	t	t	f	\N	2026-04-06 10:10:56.406044+00	2026-04-06 10:10:56.406044+00
71	ThomasBibly	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ThomasBibly	anorisenuw75@gmail.com	\N	2026-02-07 15:46:34+00	\N	\N	ThomasBiblyTW ThomasBiblyTW	student	t	t	f	\N	2026-04-06 10:10:56.291695+00	2026-04-06 10:10:56.291695+00
359	Williamnar	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamnar	anthony.sarmiento@icloud.com	\N	2026-04-04 06:43:15+00	\N	\N	WilliamnarVS WilliamnarVS	student	t	t	f	\N	2026-04-06 10:10:56.452466+00	2026-04-06 10:10:56.452466+00
111	DonaldMow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldMow	anthony@genlabdirect.com	\N	2026-02-09 04:53:16+00	\N	\N	DonaldMowSF DonaldMowSF	student	t	t	f	\N	2026-04-06 10:10:56.330729+00	2026-04-06 10:10:56.330729+00
473	Terryidest	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Terryidest	aonwaite@yahoo.com	\N	2026-04-04 23:10:09+00	\N	\N	TerryidestFS TerryidestFS	student	t	t	f	\N	2026-04-06 10:10:56.510823+00	2026-04-06 10:10:56.510823+00
385	Michaelwex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelwex	aprilfrye45@gmail.com	\N	2026-04-04 09:32:36+00	\N	\N	MichaelwexHY MichaelwexHY	student	t	t	f	\N	2026-04-06 10:10:56.46456+00	2026-04-06 10:10:56.46456+00
145	Robertbeank	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertbeank	arfonzoadams@ymail.com	\N	2026-02-09 20:14:06+00	\N	\N	RobertbeankSF RobertbeankSF	student	t	t	f	\N	2026-04-06 10:10:56.351496+00	2026-04-06 10:10:56.351496+00
81	Georgemot	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Georgemot	ASADEGHI@HOTMAIL.COM	\N	2026-02-08 23:40:15+00	\N	\N	GeorgemotTI GeorgemotTI	student	t	t	f	\N	2026-04-06 10:10:56.30067+00	2026-04-06 10:10:56.30067+00
331	BrianSeise	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BrianSeise	ashleykh1@gmail.com	\N	2026-04-04 03:13:31+00	\N	\N	BrianSeiseBG BrianSeiseBG	student	t	t	f	\N	2026-04-06 10:10:56.4401+00	2026-04-06 10:10:56.4401+00
533	OrlandoKed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	OrlandoKed	ashleystubblefield.clark@gmail.com	\N	2026-04-05 12:46:25+00	\N	\N	OrlandoKedBS OrlandoKedBS	student	t	t	f	\N	2026-04-06 10:10:56.549745+00	2026-04-06 10:10:56.549745+00
50	ashra	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ashra	ashrafathima1707@gmail.com	\N	2025-07-10 05:02:55+00	\N	\N	Ashra Fathima S	student	t	t	t	\N	2026-04-06 10:10:56.278031+00	2026-04-06 10:10:56.278031+00
51	athmiga	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	athmiga	athmigamalleswaran@gmail.com	\N	2025-07-10 05:03:51+00	\N	\N	Athmiga Malleswaran	student	t	t	t	\N	2026-04-06 10:10:56.27863+00	2026-04-06 10:10:56.27863+00
284	RichardBriep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardBriep	athulphilip46@gmail.com	\N	2026-02-10 10:52:07+00	\N	\N	RichardBriepWW RichardBriepWW	student	t	t	f	\N	2026-04-06 10:10:56.419291+00	2026-04-06 10:10:56.419291+00
330	Austinimpor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Austinimpor	atthejones@hotmail.com	\N	2026-04-04 02:12:50+00	\N	\N	AustinimporYY AustinimporYY	student	t	t	f	\N	2026-04-06 10:10:56.439624+00	2026-04-06 10:10:56.439624+00
298	Michaelnal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelnal	ava@bhbnyc.com	\N	2026-02-10 12:02:26+00	\N	\N	MichaelnalOK MichaelnalOK	student	t	t	f	\N	2026-04-06 10:10:56.425007+00	2026-04-06 10:10:56.425007+00
182	MichaelTom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelTom	bakerkg@comcast.net	\N	2026-02-09 23:18:22+00	\N	\N	MichaelTomDN MichaelTomDN	student	t	t	f	\N	2026-04-06 10:10:56.37427+00	2026-04-06 10:10:56.37427+00
263	Daviditell	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Daviditell	bal106@hotmail.ca	\N	2026-02-10 08:33:01+00	\N	\N	DaviditellWV DaviditellWV	student	t	t	f	\N	2026-04-06 10:10:56.410973+00	2026-04-06 10:10:56.410973+00
278	AnthonyGoawn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AnthonyGoawn	barneralena@gmail.com	\N	2026-02-10 10:01:11+00	\N	\N	AnthonyGoawnUF AnthonyGoawnUF	student	t	t	f	\N	2026-04-06 10:10:56.416996+00	2026-04-06 10:10:56.416996+00
459	ArthurTwert	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ArthurTwert	bbelljohnson@yahoo.com	\N	2026-04-04 20:55:22+00	\N	\N	ArthurTwertEI ArthurTwertEI	student	t	t	f	\N	2026-04-06 10:10:56.502238+00	2026-04-06 10:10:56.502238+00
109	GeorgeGrile	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeGrile	beatonpar@gmail.com	\N	2026-02-09 04:17:18+00	\N	\N	GeorgeGrileYZ GeorgeGrileYZ	student	t	t	f	\N	2026-04-06 10:10:56.329195+00	2026-04-06 10:10:56.329195+00
448	Romanvag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Romanvag	befranz@comcast.net	\N	2026-04-04 19:11:47+00	\N	\N	RomanvagMR RomanvagMR	student	t	t	f	\N	2026-04-06 10:10:56.497011+00	2026-04-06 10:10:56.497011+00
502	Hermanbes	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Hermanbes	benothman.safa92@gmail.com	\N	2026-04-05 07:32:40+00	\N	\N	HermanbesSF HermanbesSF	student	t	t	f	\N	2026-04-06 10:10:56.530711+00	2026-04-06 10:10:56.530711+00
439	CharlesBex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesBex	benrapp320@gmail.com	\N	2026-04-04 17:42:43+00	\N	\N	CharlesBexMY CharlesBexMY	student	t	t	f	\N	2026-04-06 10:10:56.492472+00	2026-04-06 10:10:56.492472+00
156	UlyssesSwent	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	UlyssesSwent	bertweiss@sbcglobal.net	\N	2026-02-09 20:58:46+00	\N	\N	UlyssesSwentWC UlyssesSwentWC	student	t	t	f	\N	2026-04-06 10:10:56.358136+00	2026-04-06 10:10:56.358136+00
240	Davidvap	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidvap	bethaustin20@gmail.com	\N	2026-02-10 04:45:59+00	\N	\N	DavidvapVZ DavidvapVZ	student	t	t	f	\N	2026-04-06 10:10:56.400356+00	2026-04-06 10:10:56.400356+00
102	Gregorymup	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Gregorymup	beuneyaimara37@gmail.com	\N	2026-02-09 03:05:18+00	\N	\N	GregorymupQZ GregorymupQZ	student	t	t	f	\N	2026-04-06 10:10:56.324632+00	2026-04-06 10:10:56.324632+00
86	TimothyRaw	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	TimothyRaw	beverlymeidow@gmail.com	\N	2026-02-09 00:01:00+00	\N	\N	TimothyRawPT TimothyRawPT	student	t	t	f	\N	2026-04-06 10:10:56.306279+00	2026-04-06 10:10:56.306279+00
557	jaisaikishoreb	$2b$12$KH2F9930/eRD0bHyCxkH/ut94mJIOwxx/gTC5gEhAbXxuipuidLrW	jaisaikishoreb	jaisaikishoreb@gmail.com		2026-04-08 09:31:56.088638+00		1	lokiw S	student	t	t	f	\N	2026-04-08 09:31:56.088638+00	2026-04-08 09:32:21.506331+00
106	Thomasgax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Thomasgax	abwelch02@hotmail.com	\N	2026-02-09 04:03:35+00	\N	\N	ThomasgaxMU ThomasgaxMU	student	t	t	f	\N	2026-04-06 10:10:56.327014+00	2026-04-06 10:10:56.327014+00
43	bharath03	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	bharath03	bharathm032004@gmail.com	\N	2025-07-01 06:25:36+00	\N	\N	Bharath M	student	t	t	f	\N	2026-04-06 10:10:56.273186+00	2026-04-06 10:10:56.273186+00
108	EdisonCal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdisonCal	bighappyg33@gmail.com	\N	2026-02-09 04:15:40+00	\N	\N	EdisonCalWU EdisonCalWU	student	t	t	f	\N	2026-04-06 10:10:56.328428+00	2026-04-06 10:10:56.328428+00
440	Jasonputle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jasonputle	Bigrob419glass@gmail.com	\N	2026-04-04 17:57:18+00	\N	\N	JasonputleXJ JasonputleXJ	student	t	t	f	\N	2026-04-06 10:10:56.492951+00	2026-04-06 10:10:56.492951+00
384	RubencriNg	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RubencriNg	birgit@wiedenbach-tiefbau.de	\N	2026-04-04 09:32:33+00	\N	\N	RubencriNgSF RubencriNgSF	student	t	t	f	\N	2026-04-06 10:10:56.464126+00	2026-04-06 10:10:56.464126+00
136	Sheldonlib	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Sheldonlib	blake@kay-del.com	\N	2026-02-09 19:40:12+00	\N	\N	SheldonlibXJ SheldonlibXJ	student	t	t	f	\N	2026-04-06 10:10:56.347041+00	2026-04-06 10:10:56.347041+00
146	StephenNen	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StephenNen	BLUECHIPBILES@GMAIL.COM	\N	2026-02-09 20:20:18+00	\N	\N	StephenNenDY StephenNenDY	student	t	t	f	\N	2026-04-06 10:10:56.352036+00	2026-04-06 10:10:56.352036+00
315	Michaelpierm	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelpierm	bmeyer@themeyergroup.com	\N	2026-04-04 01:19:56+00	\N	\N	MichaelpiermTC MichaelpiermTC	student	t	t	f	\N	2026-04-06 10:10:56.432206+00	2026-04-06 10:10:56.432206+00
413	Dillonhom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Dillonhom	bonetticar@gmail.com	\N	2026-04-04 14:11:03+00	\N	\N	DillonhomMQ DillonhomMQ	student	t	t	f	\N	2026-04-06 10:10:56.479645+00	2026-04-06 10:10:56.479645+00
205	Rodgerpoupt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Rodgerpoupt	brian.richard.moon@gmail.com	\N	2026-02-10 00:50:06+00	\N	\N	RodgerpouptOX RodgerpouptOX	student	t	t	f	\N	2026-04-06 10:10:56.384484+00	2026-04-06 10:10:56.384484+00
282	DerekJew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DerekJew	bridgegrlt5@yahoo.com	\N	2026-02-10 10:27:25+00	\N	\N	DerekJewKV DerekJewKV	student	t	t	f	\N	2026-04-06 10:10:56.418478+00	2026-04-06 10:10:56.418478+00
238	Herbertger	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Herbertger	btytler@hotmail.com	\N	2026-02-10 04:30:23+00	\N	\N	HerbertgerAF HerbertgerAF	student	t	t	f	\N	2026-04-06 10:10:56.399583+00	2026-04-06 10:10:56.399583+00
512	KevinSpeby	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KevinSpeby	bukuriemorina495@gmail.com	\N	2026-04-05 10:13:40+00	\N	\N	KevinSpebyYQ KevinSpebyYQ	student	t	t	f	\N	2026-04-06 10:10:56.537694+00	2026-04-06 10:10:56.537694+00
48	buvanesh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	buvanesh	buvanesh2396@gmail.com	\N	2025-07-04 10:46:25+00	\N	\N	Buvanesh M	student	t	t	f	\N	2026-04-06 10:10:56.276475+00	2026-04-06 10:10:56.276475+00
536	MichaelHer	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelHer	buyer@shssrl.com	\N	2026-04-05 13:34:49+00	\N	\N	MichaelHerAP MichaelHerAP	student	t	t	f	\N	2026-04-06 10:10:56.55179+00	2026-04-06 10:10:56.55179+00
194	ArthurNiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ArthurNiz	bveaalaska@gmail.com	\N	2026-02-10 00:13:21+00	\N	\N	ArthurNizLT ArthurNizLT	student	t	t	f	\N	2026-04-06 10:10:56.379992+00	2026-04-06 10:10:56.379992+00
224	DwayneKem	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DwayneKem	c032tr@ashrae.net	\N	2026-02-10 03:16:22+00	\N	\N	DwayneKemTS DwayneKemTS	student	t	t	f	\N	2026-04-06 10:10:56.393508+00	2026-04-06 10:10:56.393508+00
279	ChrisSkync	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ChrisSkync	cadotte@gmail.com	\N	2026-02-10 10:02:27+00	\N	\N	ChrisSkyncKN ChrisSkyncKN	student	t	t	f	\N	2026-04-06 10:10:56.417389+00	2026-04-06 10:10:56.417389+00
294	Jamesbap	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesbap	calvarezrecio@gmail.com	\N	2026-02-10 11:42:52+00	\N	\N	JamesbapBW JamesbapBW	student	t	t	f	\N	2026-04-06 10:10:56.423072+00	2026-04-06 10:10:56.423072+00
165	DavidInsus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidInsus	cameronryan08@hotmail.ca	\N	2026-02-09 21:44:03+00	\N	\N	DavidInsusKC DavidInsusKC	student	t	t	f	\N	2026-04-06 10:10:56.365448+00	2026-04-06 10:10:56.365448+00
274	Stanleycet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stanleycet	capobchtim@gmail.com	\N	2026-02-10 09:34:53+00	\N	\N	StanleycetQR StanleycetQR	student	t	t	f	\N	2026-04-06 10:10:56.415412+00	2026-04-06 10:10:56.415412+00
209	AlbertShash	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AlbertShash	captz@jfayacht.com	\N	2026-02-10 01:14:35+00	\N	\N	AlbertShashDH AlbertShashDH	student	t	t	f	\N	2026-04-06 10:10:56.386021+00	2026-04-06 10:10:56.386021+00
326	Jaredgom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jaredgom	carol85739@yahoo.com	\N	2026-04-04 01:51:48+00	\N	\N	JaredgomQZ JaredgomQZ	student	t	t	f	\N	2026-04-06 10:10:56.437795+00	2026-04-06 10:10:56.437795+00
412	Kennydiarp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Kennydiarp	catgrt@outlook.com	\N	2026-04-04 14:05:26+00	\N	\N	KennydiarpWA KennydiarpWA	student	t	t	f	\N	2026-04-06 10:10:56.479143+00	2026-04-06 10:10:56.479143+00
458	Jamesquofs	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesquofs	catherinemorin212003@yahoo.com	\N	2026-04-04 20:51:33+00	\N	\N	JamesquofsME JamesquofsME	student	t	t	f	\N	2026-04-06 10:10:56.501736+00	2026-04-06 10:10:56.501736+00
466	RobertUsell	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertUsell	cazbill@netins.net	\N	2026-04-04 21:36:03+00	\N	\N	RobertUsellLE RobertUsellLE	student	t	t	f	\N	2026-04-06 10:10:56.506745+00	2026-04-06 10:10:56.506745+00
452	Jeffreysmils	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeffreysmils	ccapx.rc@pm.me	\N	2026-04-04 19:27:26+00	\N	\N	JeffreysmilsHK JeffreysmilsHK	student	t	t	f	\N	2026-04-06 10:10:56.498725+00	2026-04-06 10:10:56.498725+00
404	CharlesMuh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesMuh	cdavis405@gmail.com	\N	2026-04-04 12:49:50+00	\N	\N	CharlesMuhGJ CharlesMuhGJ	student	t	t	f	\N	2026-04-06 10:10:56.474508+00	2026-04-06 10:10:56.474508+00
60	sashatest02	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sashatest02	ceo@sashainfinity.com	\N	2025-11-17 09:16:53+00	\N	\N	sashatest 02	student	t	t	f	\N	2026-04-06 10:10:56.284459+00	2026-04-06 10:10:56.284459+00
305	chassidyhummel	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	chassidyhummel	chassidy-hummel27@emailus.getwisetransfer.click	\N	2026-03-16 23:51:26+00	\N	\N	Chassidy Hummel	student	t	t	f	\N	2026-04-06 10:10:56.428093+00	2026-04-06 10:10:56.428093+00
392	PeterHef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	PeterHef	cherligon@gmail.com	\N	2026-04-04 11:15:30+00	\N	\N	PeterHefWS PeterHefWS	student	t	t	f	\N	2026-04-06 10:10:56.467939+00	2026-04-06 10:10:56.467939+00
195	Michaelnok	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelnok	chibuikeebin@gmail.com	\N	2026-02-10 00:13:38+00	\N	\N	MichaelnokBN MichaelnokBN	student	t	t	f	\N	2026-04-06 10:10:56.380495+00	2026-04-06 10:10:56.380495+00
123	JamesDak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JamesDak	chrisdvorsky@yahoo.com	\N	2026-02-09 07:02:45+00	\N	\N	JamesDakEL JamesDakEL	student	t	t	f	\N	2026-04-06 10:10:56.338686+00	2026-04-06 10:10:56.338686+00
398	Johnieasset	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Johnieasset	christim386@icloud.com	\N	2026-04-04 12:02:39+00	\N	\N	JohnieassetDW JohnieassetDW	student	t	t	f	\N	2026-04-06 10:10:56.471292+00	2026-04-06 10:10:56.471292+00
449	Kennethjab	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Kennethjab	cmconger@gmail.com	\N	2026-04-04 19:14:29+00	\N	\N	KennethjabAB KennethjabAB	student	t	t	f	\N	2026-04-06 10:10:56.497464+00	2026-04-06 10:10:56.497464+00
396	LeonardKet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	LeonardKet	cmgoldsmith@hotmail.com	\N	2026-04-04 11:46:45+00	\N	\N	LeonardKetFS LeonardKetFS	student	t	t	f	\N	2026-04-06 10:10:56.470349+00	2026-04-06 10:10:56.470349+00
558	bhuvanesh637453_2ef12609	738a03d3f6912eade874a31eb20c66937a6628c871f926549896e51ae00ed1e4	bhuvanesh637453_2ef12609	bhuvanesh637453@gmail.com		2026-04-08 10:01:25.843342+00		0	Bhuvaneshwaran R	student	t	t	f	\N	2026-04-08 10:01:25.843342+00	2026-04-08 10:01:25.843342+00
115	HenryKah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HenryKah	alexolenich1003@gmail.com	\N	2026-02-09 05:46:17+00	\N	\N	HenryKahBW HenryKahBW	student	t	t	f	\N	2026-04-06 10:10:56.334548+00	2026-04-06 10:10:56.334548+00
174	JefferyVam	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JefferyVam	cmiller0794@gmail.com	\N	2026-02-09 22:24:41+00	\N	\N	JefferyVamWD JefferyVamWD	student	t	t	f	\N	2026-04-06 10:10:56.370487+00	2026-04-06 10:10:56.370487+00
288	Jerrycew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jerrycew	coccinella.ry@gmail.com	\N	2026-02-10 11:20:43+00	\N	\N	JerrycewGW JerrycewGW	student	t	t	f	\N	2026-04-06 10:10:56.42079+00	2026-04-06 10:10:56.42079+00
110	Sidneyagina	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Sidneyagina	codyritzz@gmail.com	\N	2026-02-09 04:45:18+00	\N	\N	SidneyaginaYM SidneyaginaYM	student	t	t	f	\N	2026-04-06 10:10:56.329988+00	2026-04-06 10:10:56.329988+00
83	StanleyRiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StanleyRiz	codytaylor6@hotmail.com	\N	2026-02-08 23:51:48+00	\N	\N	StanleyRizAM StanleyRizAM	student	t	t	f	\N	2026-04-06 10:10:56.303184+00	2026-04-06 10:10:56.303184+00
173	Danielkig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Danielkig	collettim728@gmail.com	\N	2026-02-09 22:19:42+00	\N	\N	DanielkigMK DanielkigMK	student	t	t	f	\N	2026-04-06 10:10:56.370071+00	2026-04-06 10:10:56.370071+00
406	JorgeExara	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JorgeExara	CONNIEDUVAL@YAHOO.COM	\N	2026-04-04 13:04:53+00	\N	\N	JorgeExaraNQ JorgeExaraNQ	student	t	t	f	\N	2026-04-06 10:10:56.475361+00	2026-04-06 10:10:56.475361+00
306	contact	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	contact	contact@sashainfinity.com	\N	2026-03-20 09:47:40+00	\N	\N	contact	student	t	t	f	\N	2026-04-06 10:10:56.428583+00	2026-04-06 10:10:56.428583+00
36	sudharshan	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sudharshan	coo@sashainfinity.com	\N	2025-05-25 05:11:42+00	\N	\N	sudharshan P	student	t	t	t	\N	2026-04-06 10:10:56.267158+00	2026-04-06 10:10:56.267158+00
73	ZacharyKenny	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ZacharyKenny	coreyjmorrison@gmail.com	\N	2026-02-08 23:12:46+00	\N	\N	ZacharyKennyZS ZacharyKennyZS	student	t	t	f	\N	2026-04-06 10:10:56.293964+00	2026-04-06 10:10:56.293964+00
468	Willienip	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Willienip	costejon@icloud.com	\N	2026-04-04 21:46:55+00	\N	\N	WillienipGG WillienipGG	student	t	t	f	\N	2026-04-06 10:10:56.508069+00	2026-04-06 10:10:56.508069+00
163	Fideljoina	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Fideljoina	costy@alphainternalmedicine.com	\N	2026-02-09 21:33:42+00	\N	\N	FideljoinaIQ FideljoinaIQ	student	t	t	f	\N	2026-04-06 10:10:56.364459+00	2026-04-06 10:10:56.364459+00
417	Claytonget	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Claytonget	cowboy8337@yahoo.com	\N	2026-04-04 14:49:46+00	\N	\N	ClaytongetDN ClaytongetDN	student	t	t	f	\N	2026-04-06 10:10:56.481831+00	2026-04-06 10:10:56.481831+00
370	DanielMiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielMiz	cpcrey@gmail.com	\N	2026-04-04 07:55:10+00	\N	\N	DanielMizFO DanielMizFO	student	t	t	f	\N	2026-04-06 10:10:56.457439+00	2026-04-06 10:10:56.457439+00
237	Jeffreycon	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeffreycon	cpurves74@yahoo.com	\N	2026-02-10 04:26:37+00	\N	\N	JeffreyconHV JeffreyconHV	student	t	t	f	\N	2026-04-06 10:10:56.399159+00	2026-04-06 10:10:56.399159+00
433	Peterdyert	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Peterdyert	crystaalreneex3@gmail.com	\N	2026-04-04 16:44:39+00	\N	\N	PeterdyertVM PeterdyertVM	student	t	t	f	\N	2026-04-06 10:10:56.489622+00	2026-04-06 10:10:56.489622+00
89	DavidAcide	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidAcide	cthompson160@cfl.rr.com	\N	2026-02-09 00:33:21+00	\N	\N	DavidAcideUO DavidAcideUO	student	t	t	f	\N	2026-04-06 10:10:56.309289+00	2026-04-06 10:10:56.309289+00
465	ShawnAlory	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ShawnAlory	cubanito1369@yahoo.com	\N	2026-04-04 21:29:42+00	\N	\N	ShawnAloryCL ShawnAloryCL	student	t	t	f	\N	2026-04-06 10:10:56.505983+00	2026-04-06 10:10:56.505983+00
507	Williamnex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamnex	cutelilmonkey906@gmail.com	\N	2026-04-05 08:25:33+00	\N	\N	WilliamnexHF WilliamnexHF	student	t	t	f	\N	2026-04-06 10:10:56.533879+00	2026-04-06 10:10:56.533879+00
522	AaronCek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AaronCek	cyesitis@yahoo.com	\N	2026-04-05 11:44:27+00	\N	\N	AaronCekWX AaronCekWX	student	t	t	f	\N	2026-04-06 10:10:56.543261+00	2026-04-06 10:10:56.543261+00
457	JosephSlele	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JosephSlele	cynth.chann@gmail.com	\N	2026-04-04 20:36:33+00	\N	\N	JosephSleleNH JosephSleleNH	student	t	t	f	\N	2026-04-06 10:10:56.501071+00	2026-04-06 10:10:56.501071+00
445	AngeloDaype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AngeloDaype	daczyk259@gmail.com	\N	2026-04-04 18:45:07+00	\N	\N	AngeloDaypeAY AngeloDaypeAY	student	t	t	f	\N	2026-04-06 10:10:56.495385+00	2026-04-06 10:10:56.495385+00
546	DexterSax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DexterSax	dae.slusser@gmail.com	\N	2026-04-05 15:05:41+00	\N	\N	DexterSaxNU DexterSaxNU	student	t	t	f	\N	2026-04-06 10:10:56.55696+00	2026-04-06 10:10:56.55696+00
548	StevenImmen	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StevenImmen	daivada@gmail.com	\N	2026-04-05 15:19:42+00	\N	\N	StevenImmenZN StevenImmenZN	student	t	t	f	\N	2026-04-06 10:10:56.557967+00	2026-04-06 10:10:56.557967+00
75	DuaneLek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DuaneLek	danalhirsch@gmail.com	\N	2026-02-08 23:21:47+00	\N	\N	DuaneLekRG DuaneLekRG	student	t	t	f	\N	2026-04-06 10:10:56.296131+00	2026-04-06 10:10:56.296131+00
500	Nathanunils	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Nathanunils	danss454@msn.com	\N	2026-04-05 06:21:53+00	\N	\N	NathanunilsEB NathanunilsEB	student	t	t	f	\N	2026-04-06 10:10:56.529019+00	2026-04-06 10:10:56.529019+00
225	WilliamHoope	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamHoope	darcie.cobb@yahoo.com	\N	2026-02-10 03:17:18+00	\N	\N	WilliamHoopeVV WilliamHoopeVV	student	t	t	f	\N	2026-04-06 10:10:56.393927+00	2026-04-06 10:10:56.393927+00
537	RobertSnini	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertSnini	dario.petrovic@renault.hr	\N	2026-04-05 13:36:44+00	\N	\N	RobertSniniCO RobertSniniCO	student	t	t	f	\N	2026-04-06 10:10:56.552302+00	2026-04-06 10:10:56.552302+00
180	Haroldmop	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Haroldmop	darricbennett@yahoo.com	\N	2026-02-09 23:12:38+00	\N	\N	HaroldmopOQ HaroldmopOQ	student	t	t	f	\N	2026-04-06 10:10:56.373366+00	2026-04-06 10:10:56.373366+00
159	MichaelTor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelTor	darryl.larue@yahoo.com	\N	2026-02-09 21:14:20+00	\N	\N	MichaelTorJO MichaelTorJO	student	t	t	f	\N	2026-04-06 10:10:56.359559+00	2026-04-06 10:10:56.359559+00
293	Melvinwed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Melvinwed	datkha13@gmail.com	\N	2026-02-10 11:41:39+00	\N	\N	MelvinwedSE MelvinwedSE	student	t	t	f	\N	2026-04-06 10:10:56.42271+00	2026-04-06 10:10:56.42271+00
432	SamuelNobef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	SamuelNobef	david_gingrich@verizon.net	\N	2026-04-04 16:43:11+00	\N	\N	SamuelNobefZI SamuelNobefZI	student	t	t	f	\N	2026-04-06 10:10:56.489131+00	2026-04-06 10:10:56.489131+00
128	RickyWex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RickyWex	davidbroyles@live.com	\N	2026-02-09 18:57:43+00	\N	\N	RickyWexNP RickyWexNP	student	t	t	f	\N	2026-04-06 10:10:56.341627+00	2026-04-06 10:10:56.341627+00
504	Jimmyunsaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jimmyunsaf	debherman@gmail.com	\N	2026-04-05 07:43:50+00	\N	\N	JimmyunsafFV JimmyunsafFV	student	t	t	f	\N	2026-04-06 10:10:56.532081+00	2026-04-06 10:10:56.532081+00
88	SamuelSub	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	SamuelSub	deborahbyers59@gmail.com	\N	2026-02-09 00:23:46+00	\N	\N	SamuelSubRF SamuelSubRF	student	t	t	f	\N	2026-04-06 10:10:56.308471+00	2026-04-06 10:10:56.308471+00
148	Andrewcep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Andrewcep	dedriagarner07@gmail.com	\N	2026-02-09 20:29:27+00	\N	\N	AndrewcepZG AndrewcepZG	student	t	t	f	\N	2026-04-06 10:10:56.352962+00	2026-04-06 10:10:56.352962+00
559	naveenthangaraj07_1deca7a1	faca1ab1dd83f645eb5f631e24557bb6c0897d1b301bcab05fae8eeaf7a23943	naveenthangaraj07_1deca7a1	naveenthangaraj07@gmail.com		2026-04-08 10:41:22.268672+00		0	Naveenkumar	student	t	t	f	\N	2026-04-08 10:41:22.268672+00	2026-04-08 10:41:22.268672+00
162	Lavernlek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lavernlek	amoser@live.com	\N	2026-02-09 21:29:20+00	\N	\N	LavernlekBC LavernlekBC	student	t	t	f	\N	2026-04-06 10:10:56.363914+00	2026-04-06 10:10:56.363914+00
471	WilliamMeawl	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamMeawl	denicpoo@yahoo.com	\N	2026-04-04 22:14:52+00	\N	\N	WilliamMeawlST WilliamMeawlST	student	t	t	f	\N	2026-04-06 10:10:56.50962+00	2026-04-06 10:10:56.50962+00
496	Jeremyclinc	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeremyclinc	dennis_sawyer@hotmail.com	\N	2026-04-05 06:01:11+00	\N	\N	JeremyclincNG JeremyclincNG	student	t	t	f	\N	2026-04-06 10:10:56.527062+00	2026-04-06 10:10:56.527062+00
42	kensan	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	kensan	denod12029@iridales.com	\N	2025-07-01 06:20:46+00	\N	\N	Ken San	student	t	t	f	\N	2026-04-06 10:10:56.272528+00	2026-04-06 10:10:56.272528+00
257	JeffreyTig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JeffreyTig	DFARY@WTFARYBROS.COM	\N	2026-02-10 07:29:35+00	\N	\N	JeffreyTigCM JeffreyTigCM	student	t	t	f	\N	2026-04-06 10:10:56.408494+00	2026-04-06 10:10:56.408494+00
45	infosashainfinitygmailcom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	infosashainfinitygmailcom	dhakshnashree1@gmail.com	\N	2025-07-01 09:15:28+00	\N	\N	Sashainfinity education	student	t	t	f	\N	2026-04-06 10:10:56.274556+00	2026-04-06 10:10:56.274556+00
20	dhanus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	dhanus	dhanusemdts@gmail.com	\N	2025-05-26 13:01:34+00	\N	\N	Dhanus E M	student	t	t	f	\N	2026-04-06 10:10:56.256433+00	2026-04-06 10:10:56.256433+00
204	Gordonguemi	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Gordonguemi	dhoglund@buildersne.com	\N	2026-02-10 00:43:33+00	\N	\N	GordonguemiZZ GordonguemiZZ	student	t	t	f	\N	2026-04-06 10:10:56.384121+00	2026-04-06 10:10:56.384121+00
21	divakar007	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	divakar007	divakar2252007@gmail.com	\N	2025-05-06 10:33:14+00	\N	\N	Divakar Ravi	student	t	t	f	\N	2026-04-06 10:10:56.256952+00	2026-04-06 10:10:56.256952+00
197	Williamwoota	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamwoota	dlgjstoller@gmail.com	\N	2026-02-10 00:14:30+00	\N	\N	WilliamwootaIA WilliamwootaIA	student	t	t	f	\N	2026-04-06 10:10:56.381325+00	2026-04-06 10:10:56.381325+00
271	MichealGlits	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichealGlits	dofu0921@msn.com	\N	2026-02-10 09:19:47+00	\N	\N	MichealGlitsLP MichealGlitsLP	student	t	t	f	\N	2026-04-06 10:10:56.414119+00	2026-04-06 10:10:56.414119+00
409	Glenntex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Glenntex	doriswong0806@hotmail.com	\N	2026-04-04 13:23:24+00	\N	\N	GlenntexBZ GlenntexBZ	student	t	t	f	\N	2026-04-06 10:10:56.476892+00	2026-04-06 10:10:56.476892+00
543	WilliamTaisa	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamTaisa	doronleiby@gmail.com	\N	2026-04-05 14:26:18+00	\N	\N	WilliamTaisaKA WilliamTaisaKA	student	t	t	f	\N	2026-04-06 10:10:56.555495+00	2026-04-06 10:10:56.555495+00
230	DavidDef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidDef	dorryer313@gmail.com	\N	2026-02-10 04:02:22+00	\N	\N	DavidDefWI DavidDefWI	student	t	t	f	\N	2026-04-06 10:10:56.395991+00	2026-04-06 10:10:56.395991+00
378	RalphCrupt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RalphCrupt	dquintanar9@gmail.com	\N	2026-04-04 08:57:50+00	\N	\N	RalphCruptUM RalphCruptUM	student	t	t	f	\N	2026-04-06 10:10:56.460902+00	2026-04-06 10:10:56.460902+00
76	Davidowelf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidowelf	dr.david.patrick@gmail.com	\N	2026-02-08 23:22:59+00	\N	\N	DavidowelfRP DavidowelfRP	student	t	t	f	\N	2026-04-06 10:10:56.296813+00	2026-04-06 10:10:56.296813+00
78	FrankbaW	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FrankbaW	drapeaumn@hotmail.com	\N	2026-02-08 23:24:16+00	\N	\N	FrankbaWBE FrankbaWBE	student	t	t	f	\N	2026-04-06 10:10:56.298289+00	2026-04-06 10:10:56.298289+00
175	Charlietam	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlietam	drhorton@alphainternalmedicine.com	\N	2026-02-09 22:28:55+00	\N	\N	CharlietamHL CharlietamHL	student	t	t	f	\N	2026-04-06 10:10:56.370938+00	2026-04-06 10:10:56.370938+00
231	Nathancak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Nathancak	drwurm88@gmail.com	\N	2026-02-10 04:06:20+00	\N	\N	NathancakNT NathancakNT	student	t	t	f	\N	2026-04-06 10:10:56.396465+00	2026-04-06 10:10:56.396465+00
503	JamesVah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JamesVah	duke0196@aol.com	\N	2026-04-05 07:39:01+00	\N	\N	JamesVahVR JamesVahVR	student	t	t	f	\N	2026-04-06 10:10:56.531298+00	2026-04-06 10:10:56.531298+00
319	Charlestethy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlestethy	dwgrant54@hotmail.com	\N	2026-04-04 01:27:14+00	\N	\N	CharlestethyWS CharlestethyWS	student	t	t	f	\N	2026-04-06 10:10:56.433993+00	2026-04-06 10:10:56.433993+00
254	HenryFaist	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HenryFaist	e.Metzger.1988@web.de	\N	2026-02-10 07:16:40+00	\N	\N	HenryFaistLG HenryFaistLG	student	t	t	f	\N	2026-04-06 10:10:56.407274+00	2026-04-06 10:10:56.407274+00
438	Jeromesob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeromesob	EATSASROMA@GMAIL.COM	\N	2026-04-04 17:38:39+00	\N	\N	JeromesobGQ JeromesobGQ	student	t	t	f	\N	2026-04-06 10:10:56.49196+00	2026-04-06 10:10:56.49196+00
310	eesshofflgmailcom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	eesshofflgmailcom	eesshoffl@gmail.com	\N	2026-03-30 06:01:40+00	\N	\N	EESSHWHAR B D	student	t	t	f	\N	2026-04-06 10:10:56.430158+00	2026-04-06 10:10:56.430158+00
308	eesshwhareesshwhargmailcom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	eesshwhareesshwhargmailcom	eesshwhareesshwhar@gmail.com	\N	2026-03-28 11:13:32+00	\N	\N	Eesshwhar B D	student	t	t	f	\N	2026-04-06 10:10:56.429363+00	2026-04-06 10:10:56.429363+00
141	FrankLon	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FrankLon	elisabethnobles3@gmail.com	\N	2026-02-09 19:59:49+00	\N	\N	FrankLonLR FrankLonLR	student	t	t	f	\N	2026-04-06 10:10:56.349545+00	2026-04-06 10:10:56.349545+00
113	DanielGeona	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielGeona	ellen.karnak@gmail.com	\N	2026-02-09 05:17:31+00	\N	\N	DanielGeonaND DanielGeonaND	student	t	t	f	\N	2026-04-06 10:10:56.332299+00	2026-04-06 10:10:56.332299+00
555	Thomaster	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Thomaster	elysenicole724@gmail.com	\N	2026-04-05 16:04:44+00	\N	\N	ThomasterCX ThomasterCX	student	t	t	f	\N	2026-04-06 10:10:56.561432+00	2026-04-06 10:10:56.561432+00
477	CharlesExida	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesExida	emmanuelbastian@icloud.com	\N	2026-04-05 00:17:29+00	\N	\N	CharlesExidaER CharlesExidaER	student	t	t	f	\N	2026-04-06 10:10:56.515186+00	2026-04-06 10:10:56.515186+00
360	Lutherpubre	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lutherpubre	ephilyaw@philyawcpa.com	\N	2026-04-04 06:45:28+00	\N	\N	LutherpubreFU LutherpubreFU	student	t	t	f	\N	2026-04-06 10:10:56.45293+00	2026-04-06 10:10:56.45293+00
211	Williefex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williefex	epshirer@comcast.net	\N	2026-02-10 01:26:46+00	\N	\N	WilliefexYD WilliefexYD	student	t	t	f	\N	2026-04-06 10:10:56.387425+00	2026-04-06 10:10:56.387425+00
399	CalebReD	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CalebReD	eric.schubert@gmail.com	\N	2026-04-04 12:09:00+00	\N	\N	CalebReDTA CalebReDTA	student	t	t	f	\N	2026-04-06 10:10:56.47176+00	2026-04-06 10:10:56.47176+00
187	DanielSlica	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielSlica	evaldez@ejvsandblastingandcoating.com	\N	2026-02-09 23:45:29+00	\N	\N	DanielSlicaMH DanielSlicaMH	student	t	t	f	\N	2026-04-06 10:10:56.376447+00	2026-04-06 10:10:56.376447+00
276	Edwardshuse	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Edwardshuse	ezpops10@gmail.com	\N	2026-02-10 09:53:26+00	\N	\N	EdwardshuseRC EdwardshuseRC	student	t	t	f	\N	2026-04-06 10:10:56.416153+00	2026-04-06 10:10:56.416153+00
356	Davidflami	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidflami	farana@gmail.com	\N	2026-04-04 06:25:27+00	\N	\N	DavidflamiVJ DavidflamiVJ	student	t	t	f	\N	2026-04-06 10:10:56.450992+00	2026-04-06 10:10:56.450992+00
133	DavidKib	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidKib	fatjim@netzero.net	\N	2026-02-09 19:27:54+00	\N	\N	DavidKibWN DavidKibWN	student	t	t	f	\N	2026-04-06 10:10:56.344883+00	2026-04-06 10:10:56.344883+00
221	Stanleyrak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stanleyrak	buzzard_2929@hotmail.com	\N	2026-02-10 02:51:38+00	\N	\N	StanleyrakTS StanleyrakTS	student	t	t	f	\N	2026-04-06 10:10:56.392242+00	2026-04-06 10:10:56.392242+00
252	AlbertMop	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AlbertMop	feobenny@gmail.com	\N	2026-02-10 07:04:45+00	\N	\N	AlbertMopVX AlbertMopVX	student	t	t	f	\N	2026-04-06 10:10:56.406467+00	2026-04-06 10:10:56.406467+00
470	Eugenebum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Eugenebum	fertilitym1@gmail.com	\N	2026-04-04 22:08:34+00	\N	\N	EugenebumXJ EugenebumXJ	student	t	t	f	\N	2026-04-06 10:10:56.509072+00	2026-04-06 10:10:56.509072+00
248	RobertEmify	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertEmify	Finance@iammm.org	\N	2026-02-10 06:03:02+00	\N	\N	RobertEmifyUB RobertEmifyUB	student	t	t	f	\N	2026-04-06 10:10:56.404635+00	2026-04-06 10:10:56.404635+00
364	Jameshealo	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jameshealo	flemmism@ptd.net	\N	2026-04-04 07:18:19+00	\N	\N	JameshealoFP JameshealoFP	student	t	t	f	\N	2026-04-06 10:10:56.454669+00	2026-04-06 10:10:56.454669+00
509	GlennPhiva	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GlennPhiva	gabriel.garcia9@orange.fr	\N	2026-04-05 08:47:44+00	\N	\N	GlennPhivaOW GlennPhivaOW	student	t	t	f	\N	2026-04-06 10:10:56.535118+00	2026-04-06 10:10:56.535118+00
236	Davidpep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidpep	gama64@live.com	\N	2026-02-10 04:17:51+00	\N	\N	DavidpepPX DavidpepPX	student	t	t	f	\N	2026-04-06 10:10:56.398737+00	2026-04-06 10:10:56.398737+00
255	StanleyJer	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StanleyJer	garamara744@gmail.com	\N	2026-02-10 07:20:44+00	\N	\N	StanleyJerOL StanleyJerOL	student	t	t	f	\N	2026-04-06 10:10:56.407739+00	2026-04-06 10:10:56.407739+00
357	WilburnFag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilburnFag	gary82allan@gmail.com	\N	2026-04-04 06:29:44+00	\N	\N	WilburnFagLY WilburnFagLY	student	t	t	f	\N	2026-04-06 10:10:56.451379+00	2026-04-06 10:10:56.451379+00
85	Vincentgam	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Vincentgam	gcliff2@gmail.com	\N	2026-02-08 23:53:04+00	\N	\N	VincentgamMJ VincentgamMJ	student	t	t	f	\N	2026-04-06 10:10:56.305449+00	2026-04-06 10:10:56.305449+00
193	Jamesvow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesvow	ghisuq@gmail.com	\N	2026-02-10 00:09:51+00	\N	\N	JamesvowOW JamesvowOW	student	t	t	f	\N	2026-04-06 10:10:56.379612+00	2026-04-06 10:10:56.379612+00
540	Leonardtrake	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Leonardtrake	gianclaudio.laterza@techtre.it	\N	2026-04-05 14:14:37+00	\N	\N	LeonardtrakeEO LeonardtrakeEO	student	t	t	f	\N	2026-04-06 10:10:56.553993+00	2026-04-06 10:10:56.553993+00
481	Danieldek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Danieldek	gominiak@gmail.com	\N	2026-04-05 01:23:13+00	\N	\N	DanieldekCY DanieldekCY	student	t	t	f	\N	2026-04-06 10:10:56.517649+00	2026-04-06 10:10:56.517649+00
22	gowtham	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	gowtham	gowthammurugan2023@gmail.com	\N	2025-06-08 11:42:52+00	\N	\N	Gowtham Murugan	student	t	t	f	\N	2026-04-06 10:10:56.25767+00	2026-04-06 10:10:56.25767+00
534	Edwardtah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Edwardtah	gs4769819@gmail.com	\N	2026-04-05 13:10:45+00	\N	\N	EdwardtahJU EdwardtahJU	student	t	t	f	\N	2026-04-06 10:10:56.55079+00	2026-04-06 10:10:56.55079+00
68	guru	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	guru	gurudevmrp@gmail.com	\N	2026-01-15 09:45:19+00	\N	\N	Gurudev Murugan	student	t	t	f	\N	2026-04-06 10:10:56.289546+00	2026-04-06 10:10:56.289546+00
198	Anthonyvoilk	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Anthonyvoilk	gvossmer@valleylandscaping.net	\N	2026-02-10 00:25:28+00	\N	\N	AnthonyvoilkPR AnthonyvoilkPR	student	t	t	f	\N	2026-04-06 10:10:56.381709+00	2026-04-06 10:10:56.381709+00
246	DonaldHeawn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldHeawn	hardstylewon@gmail.com	\N	2026-02-10 05:40:23+00	\N	\N	DonaldHeawnVF DonaldHeawnVF	student	t	t	f	\N	2026-04-06 10:10:56.403579+00	2026-04-06 10:10:56.403579+00
542	Stephenvot	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stephenvot	harryhlykens3rd@aol.com	\N	2026-04-05 14:23:09+00	\N	\N	StephenvotEA StephenvotEA	student	t	t	f	\N	2026-04-06 10:10:56.555027+00	2026-04-06 10:10:56.555027+00
516	Stevenbag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stevenbag	hasan3ni@hotmail.com	\N	2026-04-05 10:50:21+00	\N	\N	StevenbagPN StevenbagPN	student	t	t	f	\N	2026-04-06 10:10:56.540337+00	2026-04-06 10:10:56.540337+00
515	StephenkiG	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StephenkiG	hatmane.elezaj@gmail.com	\N	2026-04-05 10:41:37+00	\N	\N	StephenkiGCM StephenkiGCM	student	t	t	f	\N	2026-04-06 10:10:56.539493+00	2026-04-06 10:10:56.539493+00
410	ArthurLoolf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ArthurLoolf	haus.walchhofer@yahoo.at	\N	2026-04-04 13:34:13+00	\N	\N	ArthurLoolfVJ ArthurLoolfVJ	student	t	t	f	\N	2026-04-06 10:10:56.477314+00	2026-04-06 10:10:56.477314+00
261	Georgemax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Georgemax	hedwingjosue@gmail.com	\N	2026-02-10 08:21:16+00	\N	\N	GeorgemaxYZ GeorgemaxYZ	student	t	t	f	\N	2026-04-06 10:10:56.410172+00	2026-04-06 10:10:56.410172+00
243	Marcoscig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Marcoscig	heidiholmes36@gmail.com	\N	2026-02-10 05:15:31+00	\N	\N	MarcoscigSQ MarcoscigSQ	student	t	t	f	\N	2026-04-06 10:10:56.401907+00	2026-04-06 10:10:56.401907+00
321	DonaldMaict	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldMaict	helenandianb42@virginmedia.com	\N	2026-04-04 01:28:56+00	\N	\N	DonaldMaictUS DonaldMaictUS	student	t	t	f	\N	2026-04-06 10:10:56.435002+00	2026-04-06 10:10:56.435002+00
530	EdwardRok	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdwardRok	herllonhj@hotmail.com	\N	2026-04-05 12:34:17+00	\N	\N	EdwardRokYR EdwardRokYR	student	t	t	f	\N	2026-04-06 10:10:56.547885+00	2026-04-06 10:10:56.547885+00
390	DavidAgern	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidAgern	hkopenc270@yahoo.com.hk	\N	2026-04-04 11:05:41+00	\N	\N	DavidAgernZR DavidAgernZR	student	t	t	f	\N	2026-04-06 10:10:56.46689+00	2026-04-06 10:10:56.46689+00
550	Alfredmes	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Alfredmes	hm@zoppelts.de	\N	2026-04-05 15:27:02+00	\N	\N	AlfredmesJL AlfredmesJL	student	t	t	f	\N	2026-04-06 10:10:56.55899+00	2026-04-06 10:10:56.55899+00
325	RichardUsese	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardUsese	hmi@twc.com	\N	2026-04-04 01:36:24+00	\N	\N	RichardUseseHJ RichardUseseHJ	student	t	t	f	\N	2026-04-06 10:10:56.437215+00	2026-04-06 10:10:56.437215+00
475	RichardMum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardMum	howard.ky.tom@hotmail.com	\N	2026-04-04 23:51:06+00	\N	\N	RichardMumQC RichardMumQC	student	t	t	f	\N	2026-04-06 10:10:56.513317+00	2026-04-06 10:10:56.513317+00
265	Ronaldarete	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Ronaldarete	hubb1214@yahoo.com	\N	2026-02-10 08:47:28+00	\N	\N	RonaldareteBT RonaldareteBT	student	t	t	f	\N	2026-04-06 10:10:56.41177+00	2026-04-06 10:10:56.41177+00
340	Joshuaclemy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Joshuaclemy	hunterwill@gmail.com	\N	2026-04-04 04:20:51+00	\N	\N	JoshuaclemyGZ JoshuaclemyGZ	student	t	t	f	\N	2026-04-06 10:10:56.443881+00	2026-04-06 10:10:56.443881+00
389	GeorgeOvawl	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeOvawl	iagomessi2000@gmail.com	\N	2026-04-04 11:00:07+00	\N	\N	GeorgeOvawlSA GeorgeOvawlSA	student	t	t	f	\N	2026-04-06 10:10:56.46636+00	2026-04-06 10:10:56.46636+00
312	Andrehef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Andrehef	iamparacha@yahoo.com	\N	2026-04-04 01:13:11+00	\N	\N	AndrehefFA AndrehefFA	student	t	t	f	\N	2026-04-06 10:10:56.430986+00	2026-04-06 10:10:56.430986+00
227	Michealmiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michealmiz	igor.stativkin@gmail.com	\N	2026-02-10 03:40:22+00	\N	\N	MichealmizJM MichealmizJM	student	t	t	f	\N	2026-04-06 10:10:56.394707+00	2026-04-06 10:10:56.394707+00
101	Philipmum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Philipmum	ilse.fritz.wi@gmail.com	\N	2026-02-09 02:58:13+00	\N	\N	PhilipmumLM PhilipmumLM	student	t	t	f	\N	2026-04-06 10:10:56.324033+00	2026-04-06 10:10:56.324033+00
260	Stephenlar	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stephenlar	ariane14@gmx.de	\N	2026-02-10 08:16:30+00	\N	\N	StephenlarCU StephenlarCU	student	t	t	f	\N	2026-04-06 10:10:56.409699+00	2026-04-06 10:10:56.409699+00
247	WilliamJeard	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamJeard	arizy36@yahoo.com	\N	2026-02-10 05:51:42+00	\N	\N	WilliamJeardIQ WilliamJeardIQ	student	t	t	f	\N	2026-04-06 10:10:56.404017+00	2026-04-06 10:10:56.404017+00
15	639b7a	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	639b7a	info.sashainfinity@gmail.com	\N	2025-06-18 04:36:22+00	\N	\N	logan f	student	t	t	t	\N	2026-04-06 10:10:56.250169+00	2026-04-06 10:10:56.250169+00
505	Larryvek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Larryvek	info@fuerza-group.de	\N	2026-04-05 08:15:19+00	\N	\N	LarryvekPA LarryvekPA	student	t	t	f	\N	2026-04-06 10:10:56.53274+00	2026-04-06 10:10:56.53274+00
18	deepikasri	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	deepikasri	info@mindlogix.co	\N	2025-06-18 07:35:50+00	\N	\N	Deepikasri DC	student	t	t	t	\N	2026-04-06 10:10:56.255109+00	2026-04-06 10:10:56.255109+00
304	info	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	info	info@sashainfinity.com	\N	2026-03-12 13:57:54+00	\N	\N	Curlo Test	student	t	t	f	\N	2026-04-06 10:10:56.427682+00	2026-04-06 10:10:56.427682+00
403	BrianHaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BrianHaf	info@weingut-bischmann.de	\N	2026-04-04 12:49:16+00	\N	\N	BrianHafFW BrianHafFW	student	t	t	f	\N	2026-04-06 10:10:56.473726+00	2026-04-06 10:10:56.473726+00
222	Sheldonjer	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Sheldonjer	irihopecuh116@gmail.com	\N	2026-02-10 03:02:04+00	\N	\N	SheldonjerFM SheldonjerFM	student	t	t	f	\N	2026-04-06 10:10:56.392675+00	2026-04-06 10:10:56.392675+00
478	KevinVah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KevinVah	isai4910@gmail.com	\N	2026-04-05 00:29:34+00	\N	\N	KevinVahHU KevinVahHU	student	t	t	f	\N	2026-04-06 10:10:56.51601+00	2026-04-06 10:10:56.51601+00
486	Josephdrymn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Josephdrymn	ismar302001@yahoo.com	\N	2026-04-05 03:51:55+00	\N	\N	JosephdrymnAN JosephdrymnAN	student	t	t	f	\N	2026-04-06 10:10:56.520953+00	2026-04-06 10:10:56.520953+00
425	Tommybrows	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Tommybrows	italiacaritas@coopoltre.it	\N	2026-04-04 15:50:18+00	\N	\N	TommybrowsMF TommybrowsMF	student	t	t	f	\N	2026-04-06 10:10:56.485712+00	2026-04-06 10:10:56.485712+00
414	Peterfes	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Peterfes	ivan.kfoto@gmail.com	\N	2026-04-04 14:15:49+00	\N	\N	PeterfesPB PeterfesPB	student	t	t	f	\N	2026-04-06 10:10:56.480188+00	2026-04-06 10:10:56.480188+00
324	Stephennek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stephennek	j.val.kelley@yahoo.com	\N	2026-04-04 01:34:14+00	\N	\N	StephennekDT StephennekDT	student	t	t	f	\N	2026-04-06 10:10:56.436625+00	2026-04-06 10:10:56.436625+00
333	Williamnow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamnow	jackieptrinh@gmail.com	\N	2026-04-04 03:25:54+00	\N	\N	WilliamnowGW WilliamnowGW	student	t	t	f	\N	2026-04-06 10:10:56.440918+00	2026-04-06 10:10:56.440918+00
497	DavidMom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidMom	jackwsnow929@gmail.com	\N	2026-04-05 06:07:58+00	\N	\N	DavidMomBI DavidMomBI	student	t	t	f	\N	2026-04-06 10:10:56.527555+00	2026-04-06 10:10:56.527555+00
191	Eduardonulky	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Eduardonulky	jacques.combot@wanadoo.fr	\N	2026-02-09 23:58:37+00	\N	\N	EduardonulkyMA EduardonulkyMA	student	t	t	f	\N	2026-04-06 10:10:56.37829+00	2026-04-06 10:10:56.37829+00
220	Robertheque	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertheque	jadetoledo640@gmail.com	\N	2026-02-10 02:50:08+00	\N	\N	RoberthequeHD RoberthequeHD	student	t	t	f	\N	2026-04-06 10:10:56.391768+00	2026-04-06 10:10:56.391768+00
235	RonaldKet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RonaldKet	jaime5019@aol.com	\N	2026-02-10 04:16:30+00	\N	\N	RonaldKetFX RonaldKetFX	student	t	t	f	\N	2026-04-06 10:10:56.398379+00	2026-04-06 10:10:56.398379+00
250	Johnnygat	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Johnnygat	jaime5019@hotmail.com	\N	2026-02-10 06:20:17+00	\N	\N	JohnnygatYL JohnnygatYL	student	t	t	f	\N	2026-04-06 10:10:56.405585+00	2026-04-06 10:10:56.405585+00
447	EdwardFet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdwardFet	jake@meyersearthwork.com	\N	2026-04-04 19:05:49+00	\N	\N	EdwardFetTX EdwardFetTX	student	t	t	f	\N	2026-04-06 10:10:56.496531+00	2026-04-06 10:10:56.496531+00
212	GregoryShari	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GregoryShari	james@jfayacht.com	\N	2026-02-10 01:42:27+00	\N	\N	GregoryShariUC GregoryShariUC	student	t	t	f	\N	2026-04-06 10:10:56.388152+00	2026-04-06 10:10:56.388152+00
469	StevenFum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StevenFum	jasontwilliams@outlook.com	\N	2026-04-04 21:49:50+00	\N	\N	StevenFumKI StevenFumKI	student	t	t	f	\N	2026-04-06 10:10:56.508569+00	2026-04-06 10:10:56.508569+00
520	AnthonyBor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AnthonyBor	jasonwhatt@yahoo.com.au	\N	2026-04-05 11:36:25+00	\N	\N	AnthonyBorCW AnthonyBorCW	student	t	t	f	\N	2026-04-06 10:10:56.542241+00	2026-04-06 10:10:56.542241+00
192	NathanVal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	NathanVal	jaume@sanpera.com	\N	2026-02-10 00:05:20+00	\N	\N	NathanValMT NathanValMT	student	t	t	f	\N	2026-04-06 10:10:56.379189+00	2026-04-06 10:10:56.379189+00
82	Kevinvaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Kevinvaf	jbasinc@yahoo.com	\N	2026-02-08 23:43:50+00	\N	\N	KevinvafMN KevinvafMN	student	t	t	f	\N	2026-04-06 10:10:56.301406+00	2026-04-06 10:10:56.301406+00
170	AnthonyJet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AnthonyJet	jcsheppard76@gmail.com	\N	2026-02-09 22:10:17+00	\N	\N	AnthonyJetXY AnthonyJetXY	student	t	t	f	\N	2026-04-06 10:10:56.368711+00	2026-04-06 10:10:56.368711+00
535	RaymondPox	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RaymondPox	jd3295@hotmail.com	\N	2026-04-05 13:19:23+00	\N	\N	RaymondPoxRQ RaymondPoxRQ	student	t	t	f	\N	2026-04-06 10:10:56.551296+00	2026-04-06 10:10:56.551296+00
482	WaynePsymn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WaynePsymn	jdmorgan8@gmail.com	\N	2026-04-05 02:25:05+00	\N	\N	WaynePsymnXQ WaynePsymnXQ	student	t	t	f	\N	2026-04-06 10:10:56.518137+00	2026-04-06 10:10:56.518137+00
434	MartinBoige	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MartinBoige	jenandchad01@yahoo.com	\N	2026-04-04 16:49:53+00	\N	\N	MartinBoigeCW MartinBoigeCW	student	t	t	f	\N	2026-04-06 10:10:56.490037+00	2026-04-06 10:10:56.490037+00
23	jeniravi	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	jeniravi	jeniferravi1669@gmail.com	\N	2025-05-26 16:37:25+00	\N	\N	Jenifer R	student	t	t	f	\N	2026-04-06 10:10:56.258139+00	2026-04-06 10:10:56.258139+00
199	Rogerpeabs	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Rogerpeabs	jenna@gieroilco.com	\N	2026-02-10 00:34:28+00	\N	\N	RogerpeabsAQ RogerpeabsAQ	student	t	t	f	\N	2026-04-06 10:10:56.382136+00	2026-04-06 10:10:56.382136+00
462	Keithphype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Keithphype	jessica.a.natalini@gmail.com	\N	2026-04-04 21:06:50+00	\N	\N	KeithphypeKW KeithphypeKW	student	t	t	f	\N	2026-04-06 10:10:56.503924+00	2026-04-06 10:10:56.503924+00
554	Michaelmeatt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelmeatt	jessicasoukup@yahoo.com	\N	2026-04-05 15:55:06+00	\N	\N	MichaelmeattLP MichaelmeattLP	student	t	t	f	\N	2026-04-06 10:10:56.56085+00	2026-04-06 10:10:56.56085+00
316	Reubensaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Reubensaf	jessicavaliquette@yahoo.com	\N	2026-04-04 01:21:54+00	\N	\N	ReubensafEK ReubensafEK	student	t	t	f	\N	2026-04-06 10:10:56.432571+00	2026-04-06 10:10:56.432571+00
314	JimmieFet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JimmieFet	jessicavaliquette98@yahoo.com	\N	2026-04-04 01:15:46+00	\N	\N	JimmieFetPH JimmieFetPH	student	t	t	f	\N	2026-04-06 10:10:56.431805+00	2026-04-06 10:10:56.431805+00
268	Mauricesof	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Mauricesof	achillespb@hotmail.com	\N	2026-02-10 09:06:17+00	\N	\N	MauricesofMB MauricesofMB	student	t	t	f	\N	2026-04-06 10:10:56.413051+00	2026-04-06 10:10:56.413051+00
144	EdwardCer	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdwardCer	jessjglenn@gmail.com	\N	2026-02-09 20:13:53+00	\N	\N	EdwardCerUW EdwardCerUW	student	t	t	f	\N	2026-04-06 10:10:56.351009+00	2026-04-06 10:10:56.351009+00
490	GeorgeAdubs	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeAdubs	jgfarkas@mac.com	\N	2026-04-05 04:51:42+00	\N	\N	GeorgeAdubsFT GeorgeAdubsFT	student	t	t	f	\N	2026-04-06 10:10:56.522987+00	2026-04-06 10:10:56.522987+00
339	ThomasKashy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ThomasKashy	jgomez925@gmail.com	\N	2026-04-04 04:13:55+00	\N	\N	ThomasKashyXH ThomasKashyXH	student	t	t	f	\N	2026-04-06 10:10:56.443478+00	2026-04-06 10:10:56.443478+00
258	Josephnon	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Josephnon	jlbercial@yahoo.es	\N	2026-02-10 07:53:42+00	\N	\N	JosephnonRD JosephnonRD	student	t	t	f	\N	2026-04-06 10:10:56.408922+00	2026-04-06 10:10:56.408922+00
153	JorgeVow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JorgeVow	jltucker12345@gmail.com	\N	2026-02-09 20:46:48+00	\N	\N	JorgeVowJD JorgeVowJD	student	t	t	f	\N	2026-04-06 10:10:56.356722+00	2026-04-06 10:10:56.356722+00
275	Haroldcep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Haroldcep	jmagolnick@aol.com	\N	2026-02-10 09:36:32+00	\N	\N	HaroldcepMT HaroldcepMT	student	t	t	f	\N	2026-04-06 10:10:56.41577+00	2026-04-06 10:10:56.41577+00
118	Jeffreylox	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeffreylox	joeltwo32@gmail.com	\N	2026-02-09 06:09:27+00	\N	\N	JeffreyloxYB JeffreyloxYB	student	t	t	f	\N	2026-04-06 10:10:56.336099+00	2026-04-06 10:10:56.336099+00
217	KennethKit	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KennethKit	joeysallamander@yahoo.com	\N	2026-02-10 02:25:04+00	\N	\N	KennethKitTD KennethKitTD	student	t	t	f	\N	2026-04-06 10:10:56.390325+00	2026-04-06 10:10:56.390325+00
167	RichardFen	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardFen	johna@ansteyhodge.com	\N	2026-02-09 21:59:30+00	\N	\N	RichardFenOZ RichardFenOZ	student	t	t	f	\N	2026-04-06 10:10:56.367023+00	2026-04-06 10:10:56.367023+00
493	Donaldtab	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Donaldtab	johnbosco72@gmail.com	\N	2026-04-05 05:50:44+00	\N	\N	DonaldtabIE DonaldtabIE	student	t	t	f	\N	2026-04-06 10:10:56.525402+00	2026-04-06 10:10:56.525402+00
214	WilliamDiask	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamDiask	johndunn@webtv.net	\N	2026-02-10 01:50:38+00	\N	\N	WilliamDiaskBS WilliamDiaskBS	student	t	t	f	\N	2026-04-06 10:10:56.389012+00	2026-04-06 10:10:56.389012+00
491	Robertmor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertmor	johnny-culleton@hotmail.com	\N	2026-04-05 05:36:22+00	\N	\N	RobertmorHB RobertmorHB	student	t	t	f	\N	2026-04-06 10:10:56.524068+00	2026-04-06 10:10:56.524068+00
335	Danielbiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Danielbiz	johnsongaragedoorco@outlook.com	\N	2026-04-04 03:37:17+00	\N	\N	DanielbizEU DanielbizEU	student	t	t	f	\N	2026-04-06 10:10:56.441785+00	2026-04-06 10:10:56.441785+00
467	Lucascah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lucascah	js.lipscomb@yahoo.com	\N	2026-04-04 21:39:39+00	\N	\N	LucascahOK LucascahOK	student	t	t	f	\N	2026-04-06 10:10:56.507443+00	2026-04-06 10:10:56.507443+00
342	BrianUnope	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BrianUnope	jslees6@comcast.net	\N	2026-04-04 04:25:32+00	\N	\N	BrianUnopeRE BrianUnopeRE	student	t	t	f	\N	2026-04-06 10:10:56.444757+00	2026-04-06 10:10:56.444757+00
97	Justingaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Justingaf	jswygant@hotmail.com	\N	2026-02-09 02:22:13+00	\N	\N	JustingafFC JustingafFC	student	t	t	f	\N	2026-04-06 10:10:56.321035+00	2026-04-06 10:10:56.321035+00
394	Douglassuh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Douglassuh	jthrone@comcast.net	\N	2026-04-04 11:33:19+00	\N	\N	DouglassuhOX DouglassuhOX	student	t	t	f	\N	2026-04-06 10:10:56.469052+00	2026-04-06 10:10:56.469052+00
483	DonaldWhish	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldWhish	judahdavid@me.com	\N	2026-04-05 03:17:15+00	\N	\N	DonaldWhishZN DonaldWhishZN	student	t	t	f	\N	2026-04-06 10:10:56.518706+00	2026-04-06 10:10:56.518706+00
363	Walterapods	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Walterapods	julieg0321@msn.com	\N	2026-04-04 07:12:28+00	\N	\N	WalterapodsHJ WalterapodsHJ	student	t	t	f	\N	2026-04-06 10:10:56.454247+00	2026-04-06 10:10:56.454247+00
355	Anthonycycle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Anthonycycle	juliemcintire@charter.net	\N	2026-04-04 06:09:34+00	\N	\N	AnthonycycleRP AnthonycycleRP	student	t	t	f	\N	2026-04-06 10:10:56.450583+00	2026-04-06 10:10:56.450583+00
241	Samuelmum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Samuelmum	junko@polidesign.us	\N	2026-02-10 04:54:59+00	\N	\N	SamuelmumIT SamuelmumIT	student	t	t	f	\N	2026-04-06 10:10:56.400786+00	2026-04-06 10:10:56.400786+00
547	HowardDioft	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HowardDioft	justin.lean@hotmail.com	\N	2026-04-05 15:09:11+00	\N	\N	HowardDioftQH HowardDioftQH	student	t	t	f	\N	2026-04-06 10:10:56.557438+00	2026-04-06 10:10:56.557438+00
272	RichardMaG	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardMaG	kahodgson@hotmail.com	\N	2026-02-10 09:20:48+00	\N	\N	RichardMaGDE RichardMaGDE	student	t	t	f	\N	2026-04-06 10:10:56.414534+00	2026-04-06 10:10:56.414534+00
69	kalaiyarasan_kd	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	kalaiyarasan_kd	kalaiyarasanartificialintellig@gmail.com	\N	2026-01-20 12:08:13+00	\N	\N	Kalaiyarasan Dhandapani	student	t	t	f	\N	2026-04-06 10:10:56.290364+00	2026-04-06 10:10:56.290364+00
277	EdgarWal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdgarWal	kallyhenry@yahoo.com	\N	2026-02-10 10:00:47+00	\N	\N	EdgarWalTE EdgarWalTE	student	t	t	f	\N	2026-04-06 10:10:56.416599+00	2026-04-06 10:10:56.416599+00
239	CarlosWem	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CarlosWem	kandi_turner05@yahoo.com	\N	2026-02-10 04:38:42+00	\N	\N	CarlosWemTS CarlosWemTS	student	t	t	f	\N	2026-04-06 10:10:56.399952+00	2026-04-06 10:10:56.399952+00
161	Marvinpyday	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Marvinpyday	kaprion@gmail.com	\N	2026-02-09 21:23:15+00	\N	\N	MarvinpydayBM MarvinpydayBM	student	t	t	f	\N	2026-04-06 10:10:56.363453+00	2026-04-06 10:10:56.363453+00
526	RonnieEcone	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RonnieEcone	kathybonneville@yahoo.com	\N	2026-04-05 12:18:49+00	\N	\N	RonnieEconeBP RonnieEconeBP	student	t	t	f	\N	2026-04-06 10:10:56.545303+00	2026-04-06 10:10:56.545303+00
74	Arnoldpaw	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Arnoldpaw	katierose.alarcon@gmail.com	\N	2026-02-08 23:13:10+00	\N	\N	ArnoldpawWV ArnoldpawWV	student	t	t	f	\N	2026-04-06 10:10:56.294945+00	2026-04-06 10:10:56.294945+00
484	Philipboind	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Philipboind	katyaszabados@yahoo.com	\N	2026-04-05 03:37:20+00	\N	\N	PhilipboindBN PhilipboindBN	student	t	t	f	\N	2026-04-06 10:10:56.519499+00	2026-04-06 10:10:56.519499+00
395	DonaldFal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldFal	kelseylolen@gmail.com	\N	2026-04-04 11:40:48+00	\N	\N	DonaldFalBZ DonaldFalBZ	student	t	t	f	\N	2026-04-06 10:10:56.46959+00	2026-04-06 10:10:56.46959+00
368	MichaelBuics	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelBuics	kenitzd@hotmail.com	\N	2026-04-04 07:45:10+00	\N	\N	MichaelBuicsHP MichaelBuicsHP	student	t	t	f	\N	2026-04-06 10:10:56.456436+00	2026-04-06 10:10:56.456436+00
369	AaronNek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AaronNek	keribgray@yahoo.com	\N	2026-04-04 07:46:04+00	\N	\N	AaronNekWB AaronNekWB	student	t	t	f	\N	2026-04-06 10:10:56.457043+00	2026-04-06 10:10:56.457043+00
518	IsidrokAk	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	IsidrokAk	kevincogley@bigpond.com	\N	2026-04-05 11:21:46+00	\N	\N	IsidrokAkVW IsidrokAkVW	student	t	t	f	\N	2026-04-06 10:10:56.541263+00	2026-04-06 10:10:56.541263+00
289	HenryIncug	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HenryIncug	kevinkizer52@yahoo.com	\N	2026-02-10 11:24:07+00	\N	\N	HenryIncugHN HenryIncugHN	student	t	t	f	\N	2026-04-06 10:10:56.421213+00	2026-04-06 10:10:56.421213+00
332	SheldonMum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	SheldonMum	ahhorvath@hotmail.com	\N	2026-04-04 03:19:55+00	\N	\N	SheldonMumZU SheldonMumZU	student	t	t	f	\N	2026-04-06 10:10:56.440516+00	2026-04-06 10:10:56.440516+00
391	AndrewHof	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AndrewHof	kfz@rehle.com	\N	2026-04-04 11:07:09+00	\N	\N	AndrewHofUG AndrewHofUG	student	t	t	f	\N	2026-04-06 10:10:56.46733+00	2026-04-06 10:10:56.46733+00
234	Alonzotuh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Alonzotuh	kgray01@aol.com	\N	2026-02-10 04:14:26+00	\N	\N	AlonzotuhCN AlonzotuhCN	student	t	t	f	\N	2026-04-06 10:10:56.397926+00	2026-04-06 10:10:56.397926+00
450	Curtishit	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Curtishit	kimberlym2040@gmail.com	\N	2026-04-04 19:21:07+00	\N	\N	CurtishitXG CurtishitXG	student	t	t	f	\N	2026-04-06 10:10:56.497878+00	2026-04-06 10:10:56.497878+00
347	WilliamSeist	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamSeist	king_kgand@yahoo.com	\N	2026-04-04 05:07:06+00	\N	\N	WilliamSeistSD WilliamSeistSD	student	t	t	f	\N	2026-04-06 10:10:56.44707+00	2026-04-06 10:10:56.44707+00
112	JosephiCods	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JosephiCods	kllorente1@gmail.com	\N	2026-02-09 05:05:13+00	\N	\N	JosephiCodsVL JosephiCodsVL	student	t	t	f	\N	2026-04-06 10:10:56.331576+00	2026-04-06 10:10:56.331576+00
327	KirbyTibig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KirbyTibig	knajarro308@gmail.com	\N	2026-04-04 01:55:32+00	\N	\N	KirbyTibigSU KirbyTibigSU	student	t	t	f	\N	2026-04-06 10:10:56.438319+00	2026-04-06 10:10:56.438319+00
297	HaroldCet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HaroldCet	koao_2008@hotmail.com	\N	2026-02-10 11:52:54+00	\N	\N	HaroldCetMP HaroldCetMP	student	t	t	f	\N	2026-04-06 10:10:56.424632+00	2026-04-06 10:10:56.424632+00
135	BillyIncup	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BillyIncup	Kquintanar9668@sdsu.edu	\N	2026-02-09 19:39:11+00	\N	\N	BillyIncupBA BillyIncupBA	student	t	t	f	\N	2026-04-06 10:10:56.346373+00	2026-04-06 10:10:56.346373+00
506	WilliamSib	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamSib	krisensicher21@gmail.com	\N	2026-04-05 08:19:14+00	\N	\N	WilliamSibBQ WilliamSibBQ	student	t	t	f	\N	2026-04-06 10:10:56.533243+00	2026-04-06 10:10:56.533243+00
172	Aaronheake	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Aaronheake	kristroygo24@aol.com	\N	2026-02-09 22:14:38+00	\N	\N	AaronheakeDI AaronheakeDI	student	t	t	f	\N	2026-04-06 10:10:56.369628+00	2026-04-06 10:10:56.369628+00
329	JamesNaing	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JamesNaing	lam.thaidan@gmail.com	\N	2026-04-04 02:06:37+00	\N	\N	JamesNaingFG JamesNaingFG	student	t	t	f	\N	2026-04-06 10:10:56.439182+00	2026-04-06 10:10:56.439182+00
387	FrancisImips	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FrancisImips	lanker60@t-online.de	\N	2026-04-04 10:07:16+00	\N	\N	FrancisImipsQJ FrancisImipsQJ	student	t	t	f	\N	2026-04-06 10:10:56.465461+00	2026-04-06 10:10:56.465461+00
122	BlairEnvip	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BlairEnvip	lannyng@shaw.ca	\N	2026-02-09 06:47:43+00	\N	\N	BlairEnvipOJ BlairEnvipOJ	student	t	t	f	\N	2026-04-06 10:10:56.338244+00	2026-04-06 10:10:56.338244+00
303	Donaldcig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Donaldcig	laravelmailKag@laravelmail.com	\N	2026-03-03 17:18:19+00	\N	\N	LMailcigCW LaravelMailcigCW	student	t	t	f	\N	2026-04-06 10:10:56.427265+00	2026-04-06 10:10:56.427265+00
431	DavidSleta	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidSleta	larissagaarcia@outlook.com	\N	2026-04-04 16:36:23+00	\N	\N	DavidSletaEW DavidSletaEW	student	t	t	f	\N	2026-04-06 10:10:56.488628+00	2026-04-06 10:10:56.488628+00
40	bharathm2004	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	bharathm2004	lastlifeline03@gmail.com	\N	2025-07-01 04:37:16+00	\N	\N	Bharath M	student	t	t	f	\N	2026-04-06 10:10:56.271128+00	2026-04-06 10:10:56.271128+00
418	Scotttrink	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Scotttrink	laurengraham2121@gmail.com	\N	2026-04-04 14:51:56+00	\N	\N	ScotttrinkFS ScotttrinkFS	student	t	t	f	\N	2026-04-06 10:10:56.482315+00	2026-04-06 10:10:56.482315+00
386	Timothyerard	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Timothyerard	laurenp816@gmail.com	\N	2026-04-04 09:40:57+00	\N	\N	TimothyerardPF TimothyerardPF	student	t	t	f	\N	2026-04-06 10:10:56.465008+00	2026-04-06 10:10:56.465008+00
513	RobertoNaw	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertoNaw	laurieschang@gmail.com	\N	2026-04-05 10:32:53+00	\N	\N	RobertoNawMM RobertoNawMM	student	t	t	f	\N	2026-04-06 10:10:56.538284+00	2026-04-06 10:10:56.538284+00
190	Edwinpow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Edwinpow	ldrape1@gmail.com	\N	2026-02-09 23:57:18+00	\N	\N	EdwinpowDF EdwinpowDF	student	t	t	f	\N	2026-04-06 10:10:56.377821+00	2026-04-06 10:10:56.377821+00
143	Charlesgew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlesgew	leanna@beyondcustomdesign.com	\N	2026-02-09 20:13:02+00	\N	\N	CharlesgewIZ CharlesgewIZ	student	t	t	f	\N	2026-04-06 10:10:56.350473+00	2026-04-06 10:10:56.350473+00
344	ShawnRip	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ShawnRip	ledwards19@gmail.com	\N	2026-04-04 04:37:12+00	\N	\N	ShawnRipFU ShawnRipFU	student	t	t	f	\N	2026-04-06 10:10:56.44566+00	2026-04-06 10:10:56.44566+00
444	KennethSaike	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KennethSaike	leealisha@att.net	\N	2026-04-04 18:14:39+00	\N	\N	KennethSaikeBK KennethSaikeBK	student	t	t	f	\N	2026-04-06 10:10:56.494959+00	2026-04-06 10:10:56.494959+00
32	shanmugavel	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	shanmugavel	leoshanmuga007@gmail.com	\N	2025-06-10 07:20:04+00	\N	\N	Shanmugavel S	student	t	t	f	\N	2026-04-06 10:10:56.26414+00	2026-04-06 10:10:56.26414+00
436	Ronaldwix	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Ronaldwix	liamwash16@gmail.com	\N	2026-04-04 17:00:37+00	\N	\N	RonaldwixXN RonaldwixXN	student	t	t	f	\N	2026-04-06 10:10:56.491005+00	2026-04-06 10:10:56.491005+00
358	DonaldRoaky	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DonaldRoaky	liangmei92@gmail.com	\N	2026-04-04 06:33:46+00	\N	\N	DonaldRoakyRC DonaldRoakyRC	student	t	t	f	\N	2026-04-06 10:10:56.451994+00	2026-04-06 10:10:56.451994+00
541	Williamgob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamgob	lisa_ann329@hotmail.com	\N	2026-04-05 14:19:13+00	\N	\N	WilliamgobZO WilliamgobZO	student	t	t	f	\N	2026-04-06 10:10:56.554563+00	2026-04-06 10:10:56.554563+00
107	MichealFem	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichealFem	lisa.noll53@gmail.com	\N	2026-02-09 04:09:51+00	\N	\N	MichealFemOB MichealFemOB	student	t	t	f	\N	2026-04-06 10:10:56.32768+00	2026-04-06 10:10:56.32768+00
226	Duanebrisa	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Duanebrisa	listarmenia@internet.ru	\N	2026-02-10 03:28:41+00	\N	\N	DuanebrisaFX DuanebrisaFX	student	t	t	f	\N	2026-04-06 10:10:56.394321+00	2026-04-06 10:10:56.394321+00
401	Michealdab	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michealdab	livingstonekayla3@gmail.com	\N	2026-04-04 12:23:39+00	\N	\N	MichealdabGL MichealdabGL	student	t	t	f	\N	2026-04-06 10:10:56.472763+00	2026-04-06 10:10:56.472763+00
39	logadheenanwd003sashainfinitycom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	logadheenanwd003sashainfinitycom	logadheenan.wd003@sashainfinity.com	\N	2025-07-01 04:32:50+00	\N	\N	logan f	student	t	t	f	\N	2026-04-06 10:10:56.270227+00	2026-04-06 10:10:56.270227+00
52	logadheenan	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	logadheenan	logadheenan2005@gmail.com	\N	2025-09-22 11:43:07+00	\N	\N	LOGADHEENAN V M	student	t	t	f	\N	2026-04-06 10:10:56.279374+00	2026-04-06 10:10:56.279374+00
53	logan2005	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	logan2005	loganvm2k5@gmail.com	\N	2025-09-22 11:44:14+00	\N	\N	LOGADHEENAN V M	student	t	t	f	\N	2026-04-06 10:10:56.280152+00	2026-04-06 10:10:56.280152+00
25	loki	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	loki	lokithkumarlokith@gmail.com	\N	2025-02-27 06:27:38+00	\N	\N	loki l	student	t	t	f	\N	2026-04-06 10:10:56.259614+00	2026-04-06 10:10:56.259614+00
72	Jessebuh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jessebuh	LOVESMARIESSA@MAC.COM	\N	2026-02-08 22:57:21+00	\N	\N	JessebuhBC JessebuhBC	student	t	t	f	\N	2026-04-06 10:10:56.292944+00	2026-04-06 10:10:56.292944+00
352	EdwardGaP	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EdwardGaP	alagas20@itu.edu.tr	\N	2026-04-04 05:56:50+00	\N	\N	EdwardGaPKK EdwardGaPKK	student	t	t	f	\N	2026-04-06 10:10:56.449147+00	2026-04-06 10:10:56.449147+00
552	FreddietoF	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FreddietoF	lpsusemihl@yahoo.com	\N	2026-04-05 15:47:15+00	\N	\N	FreddietoFNP FreddietoFNP	student	t	t	f	\N	2026-04-06 10:10:56.559953+00	2026-04-06 10:10:56.559953+00
521	DanielCredy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielCredy	lrca8171@gmail.com	\N	2026-04-05 11:44:12+00	\N	\N	DanielCredyIA DanielCredyIA	student	t	t	f	\N	2026-04-06 10:10:56.542681+00	2026-04-06 10:10:56.542681+00
223	MichaelBrera	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelBrera	ltkliman@gmail.com	\N	2026-02-10 03:09:22+00	\N	\N	MichaelBreraIB MichaelBreraIB	student	t	t	f	\N	2026-04-06 10:10:56.393093+00	2026-04-06 10:10:56.393093+00
213	AaronNob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AaronNob	luv2bmom3@aol.com	\N	2026-02-10 01:44:58+00	\N	\N	AaronNobSB AaronNobSB	student	t	t	f	\N	2026-04-06 10:10:56.388611+00	2026-04-06 10:10:56.388611+00
121	DouglasDit	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DouglasDit	lyndsaywilkinson@gmail.com	\N	2026-02-09 06:45:07+00	\N	\N	DouglasDitUJ DouglasDitUJ	student	t	t	f	\N	2026-04-06 10:10:56.337638+00	2026-04-06 10:10:56.337638+00
8	m.rifath1711	$2b$12$1jWmy2lcwnBE5z5xilmC8eI3NgKfF0wtJIStwUBZqBWI3CQxjkA6m	m.rifath1711	m.rifath1711@gmail.com		2026-03-10 11:02:21.334206+00		1	Rifath M	instructor	t	t	f	\N	2026-03-10 11:02:21.334206+00	2026-03-10 11:07:45.063425+00
343	CharlesPip	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesPip	m5bernal@gmail.com	\N	2026-04-04 04:31:22+00	\N	\N	CharlesPipFY CharlesPipFY	student	t	t	f	\N	2026-04-06 10:10:56.44518+00	2026-04-06 10:10:56.44518+00
49	maaran	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	maaran	maaran1884@gmail.com	\N	2025-07-09 15:04:56+00	\N	\N	K. P. Senthamiz maaran	student	t	t	t	\N	2026-04-06 10:10:56.277354+00	2026-04-06 10:10:56.277354+00
96	BrandonBeign	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BrandonBeign	maddiehmilner@gmail.com	\N	2026-02-09 02:12:36+00	\N	\N	BrandonBeignIW BrandonBeignIW	student	t	t	f	\N	2026-04-06 10:10:56.319701+00	2026-04-06 10:10:56.319701+00
286	RobertSnurn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertSnurn	makahou5@yahoo.com	\N	2026-02-10 11:10:23+00	\N	\N	RobertSnurnPO RobertSnurnPO	student	t	t	f	\N	2026-04-06 10:10:56.419999+00	2026-04-06 10:10:56.419999+00
437	Cecilrow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Cecilrow	malika214@yahoo.com	\N	2026-04-04 17:33:56+00	\N	\N	CecilrowOJ CecilrowOJ	student	t	t	f	\N	2026-04-06 10:10:56.491454+00	2026-04-06 10:10:56.491454+00
538	Michaelvot	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelvot	mandiechiasson@yahoo.com	\N	2026-04-05 13:45:13+00	\N	\N	MichaelvotQA MichaelvotQA	student	t	t	f	\N	2026-04-06 10:10:56.552812+00	2026-04-06 10:10:56.552812+00
487	MatthewElulk	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MatthewElulk	maple.ryan@gmail.com	\N	2026-04-05 04:11:35+00	\N	\N	MatthewElulkEX MatthewElulkEX	student	t	t	f	\N	2026-04-06 10:10:56.521444+00	2026-04-06 10:10:56.521444+00
374	WilliamSmure	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamSmure	marcusne2000@gmail.com	\N	2026-04-04 08:28:07+00	\N	\N	WilliamSmureAS WilliamSmureAS	student	t	t	f	\N	2026-04-06 10:10:56.459205+00	2026-04-06 10:10:56.459205+00
361	Carrollcounc	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Carrollcounc	markniles19@gmail.com	\N	2026-04-04 06:49:12+00	\N	\N	CarrollcouncBN CarrollcouncBN	student	t	t	f	\N	2026-04-06 10:10:56.453364+00	2026-04-06 10:10:56.453364+00
216	MorrisFub	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MorrisFub	marolliveira83@gmail.com	\N	2026-02-10 02:15:47+00	\N	\N	MorrisFubFN MorrisFubFN	student	t	t	f	\N	2026-04-06 10:10:56.389824+00	2026-04-06 10:10:56.389824+00
242	TrevorMyday	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	TrevorMyday	martyowens@aol.com	\N	2026-02-10 04:59:00+00	\N	\N	TrevorMydayHF TrevorMydayHF	student	t	t	f	\N	2026-04-06 10:10:56.401302+00	2026-04-06 10:10:56.401302+00
336	AnthonyCeX	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AnthonyCeX	maryann206@hotmail.com	\N	2026-04-04 03:43:53+00	\N	\N	AnthonyCeXBR AnthonyCeXBR	student	t	t	f	\N	2026-04-06 10:10:56.442212+00	2026-04-06 10:10:56.442212+00
442	BryanFed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BryanFed	mateusz.mania@gmail.com	\N	2026-04-04 18:03:51+00	\N	\N	BryanFedHY BryanFedHY	student	t	t	f	\N	2026-04-06 10:10:56.493979+00	2026-04-06 10:10:56.493979+00
460	Richardadasy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Richardadasy	matorsch@bellsouth.net	\N	2026-04-04 20:57:39+00	\N	\N	RichardadasyPL RichardadasyPL	student	t	t	f	\N	2026-04-06 10:10:56.502739+00	2026-04-06 10:10:56.502739+00
420	CraigHix	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CraigHix	mbgregory20@gmail.com	\N	2026-04-04 15:08:23+00	\N	\N	CraigHixYO CraigHixYO	student	t	t	f	\N	2026-04-06 10:10:56.483213+00	2026-04-06 10:10:56.483213+00
531	Peterhew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Peterhew	mbrewer1748@gmail.com	\N	2026-04-05 12:35:26+00	\N	\N	PeterhewKP PeterhewKP	student	t	t	f	\N	2026-04-06 10:10:56.548592+00	2026-04-06 10:10:56.548592+00
151	StevePew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StevePew	medinacristopherabraham@gmail.com	\N	2026-02-09 20:39:56+00	\N	\N	StevePewTQ StevePewTQ	student	t	t	f	\N	2026-04-06 10:10:56.354374+00	2026-04-06 10:10:56.354374+00
296	RichardDut	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardDut	melissa.felizola@icloud.com	\N	2026-02-10 11:50:46+00	\N	\N	RichardDutZO RichardDutZO	student	t	t	f	\N	2026-04-06 10:10:56.424137+00	2026-04-06 10:10:56.424137+00
253	JeffreyHex	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JeffreyHex	melissas200434@gmail.com	\N	2026-02-10 07:13:22+00	\N	\N	JeffreyHexYA JeffreyHexYA	student	t	t	f	\N	2026-04-06 10:10:56.406851+00	2026-04-06 10:10:56.406851+00
79	Chesterutish	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Chesterutish	mentzer.michaela@gmail.com	\N	2026-02-08 23:32:13+00	\N	\N	ChesterutishOR ChesterutishOR	student	t	t	f	\N	2026-04-06 10:10:56.298882+00	2026-04-06 10:10:56.298882+00
87	StevenEngew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StevenEngew	mhamachek@outlook.com	\N	2026-02-09 00:11:28+00	\N	\N	StevenEngewSD StevenEngewSD	student	t	t	f	\N	2026-04-06 10:10:56.30755+00	2026-04-06 10:10:56.30755+00
351	JimmyPloft	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JimmyPloft	michecheng@gmail.com	\N	2026-04-04 05:49:14+00	\N	\N	JimmyPloftQK JimmyPloftQK	student	t	t	f	\N	2026-04-06 10:10:56.448725+00	2026-04-06 10:10:56.448725+00
474	RobertApalk	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertApalk	michele_83@msn.com	\N	2026-04-04 23:28:52+00	\N	\N	RobertApalkMU RobertApalkMU	student	t	t	f	\N	2026-04-06 10:10:56.512342+00	2026-04-06 10:10:56.512342+00
443	Billysoova	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Billysoova	mike@aventra.io	\N	2026-04-04 18:06:37+00	\N	\N	BillysoovaAM BillysoovaAM	student	t	t	f	\N	2026-04-06 10:10:56.494406+00	2026-04-06 10:10:56.494406+00
472	Edwardcax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Edwardcax	mikroach@aol.com	\N	2026-04-04 22:45:17+00	\N	\N	EdwardcaxDZ EdwardcaxDZ	student	t	t	f	\N	2026-04-06 10:10:56.510113+00	2026-04-06 10:10:56.510113+00
529	CharlesMum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesMum	millerderek425@yahoo.com	\N	2026-04-05 12:34:13+00	\N	\N	CharlesMumHI CharlesMumHI	student	t	t	f	\N	2026-04-06 10:10:56.547313+00	2026-04-06 10:10:56.547313+00
124	Joshuagargo	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Joshuagargo	milojevicilija22@gmail.com	\N	2026-02-09 07:04:35+00	\N	\N	JoshuagargoBA JoshuagargoBA	student	t	t	f	\N	2026-04-06 10:10:56.339406+00	2026-04-06 10:10:56.339406+00
186	Juniorselve	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Juniorselve	mistertransmissionsk@gmail.com	\N	2026-02-09 23:34:13+00	\N	\N	JuniorselveGK JuniorselveGK	student	t	t	f	\N	2026-04-06 10:10:56.375988+00	2026-04-06 10:10:56.375988+00
280	CharlesPailt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesPailt	misti.j.norton@gmail.com	\N	2026-02-10 10:10:25+00	\N	\N	CharlesPailtKT CharlesPailtKT	student	t	t	f	\N	2026-04-06 10:10:56.417751+00	2026-04-06 10:10:56.417751+00
393	GeorgeGaumb	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeGaumb	amyberman@hotmail.com	\N	2026-04-04 11:23:12+00	\N	\N	GeorgeGaumbGA GeorgeGaumbGA	student	t	t	f	\N	2026-04-06 10:10:56.468442+00	2026-04-06 10:10:56.468442+00
366	Peterbap	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Peterbap	mitroffcr@yahoo.com	\N	2026-04-04 07:32:09+00	\N	\N	PeterbapUG PeterbapUG	student	t	t	f	\N	2026-04-06 10:10:56.455521+00	2026-04-06 10:10:56.455521+00
388	ScottJoisa	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ScottJoisa	mj44136969@yahoo.com	\N	2026-04-04 10:41:57+00	\N	\N	ScottJoisaUE ScottJoisaUE	student	t	t	f	\N	2026-04-06 10:10:56.465899+00	2026-04-06 10:10:56.465899+00
454	Norbertzek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Norbertzek	mjbilly@att.net	\N	2026-04-04 19:45:11+00	\N	\N	NorbertzekHA NorbertzekHA	student	t	t	f	\N	2026-04-06 10:10:56.499589+00	2026-04-06 10:10:56.499589+00
527	DerrickGef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DerrickGef	mkdmld@aol.com	\N	2026-04-05 12:27:17+00	\N	\N	DerrickGefFV DerrickGefFV	student	t	t	f	\N	2026-04-06 10:10:56.545886+00	2026-04-06 10:10:56.545886+00
77	JamesFiz	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JamesFiz	mleoni@nmgovlaw.com	\N	2026-02-08 23:24:11+00	\N	\N	JamesFizBG JamesFizBG	student	t	t	f	\N	2026-04-06 10:10:56.297508+00	2026-04-06 10:10:56.297508+00
98	Williamabisp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamabisp	mlpcamper@gmail.com	\N	2026-02-09 02:25:39+00	\N	\N	WilliamabispTZ WilliamabispTZ	student	t	t	f	\N	2026-04-06 10:10:56.321843+00	2026-04-06 10:10:56.321843+00
67	mm3277952gmailcom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	mm3277952gmailcom	mm3277952@gmail.com	\N	2025-12-28 04:17:35+00	\N	\N	Viveganandan S	student	t	t	f	\N	2026-04-06 10:10:56.288809+00	2026-04-06 10:10:56.288809+00
322	RoyceWaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RoyceWaf	mmh.mehedi98@gmail.com	\N	2026-04-04 01:30:55+00	\N	\N	RoyceWafVG RoyceWafVG	student	t	t	f	\N	2026-04-06 10:10:56.435421+00	2026-04-06 10:10:56.435421+00
244	Cedricgealo	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Cedricgealo	mndebelemandla@yahoo.com	\N	2026-02-10 05:17:34+00	\N	\N	CedricgealoEW CedricgealoEW	student	t	t	f	\N	2026-04-06 10:10:56.402631+00	2026-04-06 10:10:56.402631+00
422	Cecilirold	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Cecilirold	Mnussbaum@comcast.net	\N	2026-04-04 15:21:49+00	\N	\N	CeciliroldMO CeciliroldMO	student	t	t	f	\N	2026-04-06 10:10:56.484323+00	2026-04-06 10:10:56.484323+00
233	Jamessob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamessob	monicasanhueza66@gmail.com	\N	2026-02-10 04:13:50+00	\N	\N	JamessobVN JamessobVN	student	t	t	f	\N	2026-04-06 10:10:56.397519+00	2026-04-06 10:10:56.397519+00
426	AlvinLarse	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AlvinLarse	morec@merrimack.edu	\N	2026-04-04 15:52:56+00	\N	\N	AlvinLarseHV AlvinLarseHV	student	t	t	f	\N	2026-04-06 10:10:56.486146+00	2026-04-06 10:10:56.486146+00
249	Antoniofluog	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Antoniofluog	morgaangg@gmail.com	\N	2026-02-10 06:04:25+00	\N	\N	AntoniofluogON AntoniofluogON	student	t	t	f	\N	2026-04-06 10:10:56.405137+00	2026-04-06 10:10:56.405137+00
320	ThomasSnire	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ThomasSnire	motap4@aol.com	\N	2026-04-04 01:27:25+00	\N	\N	ThomasSnireKA ThomasSnireKA	student	t	t	f	\N	2026-04-06 10:10:56.43441+00	2026-04-06 10:10:56.43441+00
26	mp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	mp	mp.sashainfinity@gmail.com	\N	2025-05-26 11:38:37+00	\N	\N	MP test	student	t	t	t	\N	2026-04-06 10:10:56.260374+00	2026-04-06 10:10:56.260374+00
59	usernamelogan	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	usernamelogan	mpsashainfinity@gmail.com	\N	2025-11-17 07:40:14+00	\N	\N	Logadheenan Vv	student	t	t	f	\N	2026-04-06 10:10:56.283959+00	2026-04-06 10:10:56.283959+00
428	DanielJaf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielJaf	mrs.leblue@yahoo.com	\N	2026-04-04 16:17:11+00	\N	\N	DanielJafPK DanielJafPK	student	t	t	f	\N	2026-04-06 10:10:56.487157+00	2026-04-06 10:10:56.487157+00
266	MarcosCox	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MarcosCox	mrveto@yahoo.com	\N	2026-02-10 08:51:01+00	\N	\N	MarcosCoxZT MarcosCoxZT	student	t	t	f	\N	2026-04-06 10:10:56.412232+00	2026-04-06 10:10:56.412232+00
408	JulianZen	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JulianZen	muriel.deuss@sfr.fr	\N	2026-04-04 13:19:04+00	\N	\N	JulianZenXP JulianZenXP	student	t	t	f	\N	2026-04-06 10:10:56.476215+00	2026-04-06 10:10:56.476215+00
528	ThomasVok	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ThomasVok	murrishmo@gmail.com	\N	2026-04-05 12:32:34+00	\N	\N	ThomasVokKR ThomasVokKR	student	t	t	f	\N	2026-04-06 10:10:56.546731+00	2026-04-06 10:10:56.546731+00
157	Charlesimmor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlesimmor	myredeemerlives@rcn.com	\N	2026-02-09 21:07:11+00	\N	\N	CharlesimmorBM CharlesimmorBM	student	t	t	f	\N	2026-04-06 10:10:56.35862+00	2026-04-06 10:10:56.35862+00
183	FloydMic	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FloydMic	nancydunning@att.net	\N	2026-02-09 23:18:55+00	\N	\N	FloydMicBX FloydMicBX	student	t	t	f	\N	2026-04-06 10:10:56.374692+00	2026-04-06 10:10:56.374692+00
300	Danielgaini	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Danielgaini	nel.tiaan@yahoo.com.au	\N	2026-02-10 12:13:45+00	\N	\N	DanielgainiIX DanielgainiIX	student	t	t	f	\N	2026-04-06 10:10:56.42585+00	2026-04-06 10:10:56.42585+00
338	BruceGob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BruceGob	nelsoncharlettep@yahoo.com	\N	2026-04-04 03:58:52+00	\N	\N	BruceGobAO BruceGobAO	student	t	t	f	\N	2026-04-06 10:10:56.443057+00	2026-04-06 10:10:56.443057+00
328	Brooksvusly	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Brooksvusly	nena1108nena@gmail.com	\N	2026-04-04 01:58:51+00	\N	\N	BrooksvuslyUR BrooksvuslyUR	student	t	t	f	\N	2026-04-06 10:10:56.438729+00	2026-04-06 10:10:56.438729+00
480	MichaelKeype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelKeype	nickcantor@icloud.com	\N	2026-04-05 01:04:32+00	\N	\N	MichaelKeypeCC MichaelKeypeCC	student	t	t	f	\N	2026-04-06 10:10:56.517047+00	2026-04-06 10:10:56.517047+00
93	MatthewDebra	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MatthewDebra	nickrisner@aol.com	\N	2026-02-09 01:33:12+00	\N	\N	MatthewDebraPC MatthewDebraPC	student	t	t	f	\N	2026-04-06 10:10:56.315747+00	2026-04-06 10:10:56.315747+00
137	Alonzomon	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Alonzomon	nicolo.canazza@libero.it	\N	2026-02-09 19:44:40+00	\N	\N	AlonzomonWQ AlonzomonWQ	student	t	t	f	\N	2026-04-06 10:10:56.347541+00	2026-04-06 10:10:56.347541+00
125	AnthonyGRera	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AnthonyGRera	nikki.mcneil@yahoo.com	\N	2026-02-09 18:44:17+00	\N	\N	AnthonyGReraCG AnthonyGReraCG	student	t	t	f	\N	2026-04-06 10:10:56.340195+00	2026-04-06 10:10:56.340195+00
185	SteveVah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	SteveVah	nkaren36@yahoo.com	\N	2026-02-09 23:25:05+00	\N	\N	SteveVahCE SteveVahCE	student	t	t	f	\N	2026-04-06 10:10:56.375575+00	2026-04-06 10:10:56.375575+00
435	Angeldox	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Angeldox	nomisha121@yahoo.com	\N	2026-04-04 16:56:25+00	\N	\N	AngeldoxYR AngeldoxYR	student	t	t	f	\N	2026-04-06 10:10:56.490483+00	2026-04-06 10:10:56.490483+00
229	MartinLib	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MartinLib	oberlanderstephen@yahoo.com	\N	2026-02-10 03:57:50+00	\N	\N	MartinLibJM MartinLibJM	student	t	t	f	\N	2026-04-06 10:10:56.395392+00	2026-04-06 10:10:56.395392+00
311	DavidDaurl	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidDaurl	odosawehawi88@gmail.com	\N	2026-04-04 00:01:13+00	\N	\N	DavidDaurlOD DavidDaurlOD	student	t	t	f	\N	2026-04-06 10:10:56.43056+00	2026-04-06 10:10:56.43056+00
341	MichaelHusly	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelHusly	OGURTSOV@NCBI.NLM.NIH.GOV	\N	2026-04-04 04:23:48+00	\N	\N	MichaelHuslyBK MichaelHuslyBK	student	t	t	f	\N	2026-04-06 10:10:56.444313+00	2026-04-06 10:10:56.444313+00
309	Jamesdus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesdus	olgzoro@yandex.com	\N	2026-03-30 01:23:19+00	\N	\N	JamesdusOO JamesdusOO	student	t	t	f	\N	2026-04-06 10:10:56.429746+00	2026-04-06 10:10:56.429746+00
446	Harrywek	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Harrywek	Allenhall0330@gmail.com	\N	2026-04-04 19:02:15+00	\N	\N	HarrywekWO HarrywekWO	student	t	t	f	\N	2026-04-06 10:10:56.496012+00	2026-04-06 10:10:56.496012+00
380	Jaredvow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jaredvow	osakpa@gmail.com	\N	2026-04-04 09:01:39+00	\N	\N	JaredvowWE JaredvowWE	student	t	t	f	\N	2026-04-06 10:10:56.461766+00	2026-04-06 10:10:56.461766+00
90	HermanBut	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HermanBut	p_batkins@yahoo.com	\N	2026-02-09 00:33:56+00	\N	\N	HermanButVE HermanButVE	student	t	t	f	\N	2026-04-06 10:10:56.31079+00	2026-04-06 10:10:56.31079+00
371	Mohamedbem	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Mohamedbem	pabloeg86@gmail.com	\N	2026-04-04 08:04:44+00	\N	\N	MohamedbemEY MohamedbemEY	student	t	t	f	\N	2026-04-06 10:10:56.45782+00	2026-04-06 10:10:56.45782+00
427	GerardoMus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GerardoMus	paigelinder@yahoo.com	\N	2026-04-04 16:04:49+00	\N	\N	GerardoMusDH GerardoMusDH	student	t	t	f	\N	2026-04-06 10:10:56.486598+00	2026-04-06 10:10:56.486598+00
84	Charlesicect	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlesicect	pat@mulberrystreetmortgage.com	\N	2026-02-08 23:52:22+00	\N	\N	CharlesicectQX CharlesicectQX	student	t	t	f	\N	2026-04-06 10:10:56.304018+00	2026-04-06 10:10:56.304018+00
551	RobertInica	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertInica	paulawatson96@yahoo.com	\N	2026-04-05 15:43:19+00	\N	\N	RobertInicaNV RobertInicaNV	student	t	t	f	\N	2026-04-06 10:10:56.559474+00	2026-04-06 10:10:56.559474+00
169	KennethTwimi	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KennethTwimi	pauls@stcroixrods.com	\N	2026-02-09 22:09:12+00	\N	\N	KennethTwimiKX KennethTwimiKX	student	t	t	f	\N	2026-04-06 10:10:56.368129+00	2026-04-06 10:10:56.368129+00
130	GeorgeKem	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeKem	pawelkostyra@yahoo.com	\N	2026-02-09 19:16:56+00	\N	\N	GeorgeKemUR GeorgeKemUR	student	t	t	f	\N	2026-04-06 10:10:56.342817+00	2026-04-06 10:10:56.342817+00
91	CharlesFus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesFus	pbatkins@msn.com	\N	2026-02-09 00:41:55+00	\N	\N	CharlesFusRO CharlesFusRO	student	t	t	f	\N	2026-04-06 10:10:56.312962+00	2026-04-06 10:10:56.312962+00
200	AndrewSpedo	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AndrewSpedo	PBURNS@gilbaneco.com	\N	2026-02-10 00:34:36+00	\N	\N	AndrewSpedoHJ AndrewSpedoHJ	student	t	t	f	\N	2026-04-06 10:10:56.382537+00	2026-04-06 10:10:56.382537+00
421	Jeffreymuh	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeffreymuh	peapod_1316@hotmail.com	\N	2026-04-04 15:17:42+00	\N	\N	JeffreymuhNL JeffreymuhNL	student	t	t	f	\N	2026-04-06 10:10:56.483697+00	2026-04-06 10:10:56.483697+00
464	Howarddup	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Howarddup	perlar1987@yahoo.com	\N	2026-04-04 21:10:40+00	\N	\N	HowarddupTF HowarddupTF	student	t	t	f	\N	2026-04-06 10:10:56.505464+00	2026-04-06 10:10:56.505464+00
456	JamesCrali	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JamesCrali	pggysls@yahoo.com	\N	2026-04-04 20:21:21+00	\N	\N	JamesCraliCB JamesCraliCB	student	t	t	f	\N	2026-04-06 10:10:56.500531+00	2026-04-06 10:10:56.500531+00
158	DerrickOride	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DerrickOride	pinakin@bellsouth.net	\N	2026-02-09 21:13:12+00	\N	\N	DerrickOrideYE DerrickOrideYE	student	t	t	f	\N	2026-04-06 10:10:56.359092+00	2026-04-06 10:10:56.359092+00
176	Sandybluse	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Sandybluse	piojorevilla.lr@gmail.com	\N	2026-02-09 22:32:18+00	\N	\N	SandybluseAW SandybluseAW	student	t	t	f	\N	2026-04-06 10:10:56.371472+00	2026-04-06 10:10:56.371472+00
206	RogerPlobe	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RogerPlobe	pnnguyen17@gmail.com	\N	2026-02-10 00:59:11+00	\N	\N	RogerPlobeZY RogerPlobeZY	student	t	t	f	\N	2026-04-06 10:10:56.384881+00	2026-04-06 10:10:56.384881+00
41	gurudevg	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	gurudevg	pofovi7209@boxmach.com	\N	2025-07-01 06:03:44+00	\N	\N	Gurudev G	student	t	t	f	\N	2026-04-06 10:10:56.271746+00	2026-04-06 10:10:56.271746+00
317	Jamesacify	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesacify	powell.spinks@yahoo.com	\N	2026-04-04 01:23:07+00	\N	\N	JamesacifyQM JamesacifyQM	student	t	t	f	\N	2026-04-06 10:10:56.432993+00	2026-04-06 10:10:56.432993+00
375	Rubenmeece	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Rubenmeece	prattgeo@bellsouth.net	\N	2026-04-04 08:28:59+00	\N	\N	RubenmeeceMG RubenmeeceMG	student	t	t	f	\N	2026-04-06 10:10:56.459627+00	2026-04-06 10:10:56.459627+00
287	DavidAbicy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidAbicy	prettypigksd@hotmail.com	\N	2026-02-10 11:14:43+00	\N	\N	DavidAbicyWM DavidAbicyWM	student	t	t	f	\N	2026-04-06 10:10:56.42039+00	2026-04-06 10:10:56.42039+00
334	RandyNak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RandyNak	prfrog@embarqmail.com	\N	2026-04-04 03:28:51+00	\N	\N	RandyNakLK RandyNakLK	student	t	t	f	\N	2026-04-06 10:10:56.441317+00	2026-04-06 10:10:56.441317+00
476	Stephenpat	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stephenpat	primenyc718@gmail.com	\N	2026-04-04 23:53:57+00	\N	\N	StephenpatIK StephenpatIK	student	t	t	f	\N	2026-04-06 10:10:56.51396+00	2026-04-06 10:10:56.51396+00
34	sowmiya	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sowmiya	prsowmiya02@gmail.com	\N	2025-04-09 16:16:42+00	\N	\N	SOWMIYA PR	student	t	t	f	\N	2026-04-06 10:10:56.26569+00	2026-04-06 10:10:56.26569+00
405	Scottdam	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Scottdam	pschaeffer.ps@gmail.com	\N	2026-04-04 12:56:34+00	\N	\N	ScottdamJC ScottdamJC	student	t	t	f	\N	2026-04-06 10:10:56.47495+00	2026-04-06 10:10:56.47495+00
171	Arturoshags	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Arturoshags	pushofnewtown@gmail.com	\N	2026-02-09 22:11:09+00	\N	\N	ArturoshagsFF ArturoshagsFF	student	t	t	f	\N	2026-04-06 10:10:56.369236+00	2026-04-06 10:10:56.369236+00
27	pushpa	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	pushpa	pushpaavm2010@gmail.com	\N	2025-05-27 05:28:39+00	\N	\N	Pushpa K	student	t	t	f	\N	2026-04-06 10:10:56.260959+00	2026-04-06 10:10:56.260959+00
92	AaronSPOPE	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AaronSPOPE	r.coledata@gmail.com	\N	2026-02-09 01:12:40+00	\N	\N	AaronSPOPEMO AaronSPOPEMO	student	t	t	f	\N	2026-04-06 10:10:56.314945+00	2026-04-06 10:10:56.314945+00
30	sashar	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sashar	rajkumar18999@gmail.com	\N	2025-03-12 15:22:25+00	\N	\N	sharveshwar R	student	t	t	f	\N	2026-04-06 10:10:56.262763+00	2026-04-06 10:10:56.262763+00
377	Williamgrozy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamgrozy	Rakanalqreen11@gmail.com	\N	2026-04-04 08:41:33+00	\N	\N	WilliamgrozySG WilliamgrozySG	student	t	t	f	\N	2026-04-06 10:10:56.460479+00	2026-04-06 10:10:56.460479+00
94	Scottclick	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Scottclick	rameyjohn30@yahoo.com	\N	2026-02-09 01:35:30+00	\N	\N	ScottclickHX ScottclickHX	student	t	t	f	\N	2026-04-06 10:10:56.316749+00	2026-04-06 10:10:56.316749+00
245	MichaeltOf	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaeltOf	Raphaelfigueroa99@outlook.com	\N	2026-02-10 05:40:01+00	\N	\N	MichaeltOfYW MichaeltOfYW	student	t	t	f	\N	2026-04-06 10:10:56.403052+00	2026-04-06 10:10:56.403052+00
114	KevinCup	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KevinCup	reagle63@gmail.com	\N	2026-02-09 05:33:06+00	\N	\N	KevinCupXX KevinCupXX	student	t	t	f	\N	2026-04-06 10:10:56.333764+00	2026-04-06 10:10:56.333764+00
116	AlbertDaype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AlbertDaype	rebeccaxkim@hotmail.com	\N	2026-02-09 05:56:04+00	\N	\N	AlbertDaypeZH AlbertDaypeZH	student	t	t	f	\N	2026-04-06 10:10:56.335152+00	2026-04-06 10:10:56.335152+00
142	Jamesbal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesbal	rejackson55@charter.net	\N	2026-02-09 20:08:02+00	\N	\N	JamesbalRA JamesbalRA	student	t	t	f	\N	2026-04-06 10:10:56.349996+00	2026-04-06 10:10:56.349996+00
259	HenryNew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HenryNew	riverrat873@gmail.com	\N	2026-02-10 08:14:47+00	\N	\N	HenryNewFE HenryNewFE	student	t	t	f	\N	2026-04-06 10:10:56.409326+00	2026-04-06 10:10:56.409326+00
489	Lioneldourn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lioneldourn	aliwilson86@comcast.net	\N	2026-04-05 04:41:38+00	\N	\N	LioneldournYR LioneldournYR	student	t	t	f	\N	2026-04-06 10:10:56.522481+00	2026-04-06 10:10:56.522481+00
346	CaseyBoulp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CaseyBoulp	rjgonzales72@gmail.com	\N	2026-04-04 05:02:33+00	\N	\N	CaseyBoulpLJ CaseyBoulpLJ	student	t	t	f	\N	2026-04-06 10:10:56.446586+00	2026-04-06 10:10:56.446586+00
517	Williamhak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williamhak	robertchao2@hotmail.com	\N	2026-04-05 10:57:55+00	\N	\N	WilliamhakFJ WilliamhakFJ	student	t	t	f	\N	2026-04-06 10:10:56.540768+00	2026-04-06 10:10:56.540768+00
177	Donaldeling	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Donaldeling	rodneyramosjr@yahoo.com	\N	2026-02-09 22:58:28+00	\N	\N	DonaldelingXS DonaldelingXS	student	t	t	f	\N	2026-04-06 10:10:56.371994+00	2026-04-06 10:10:56.371994+00
178	StephenRed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StephenRed	romando999@mail.com	\N	2026-02-09 23:06:17+00	\N	\N	StephenRedHN StephenRedHN	student	t	t	f	\N	2026-04-06 10:10:56.372453+00	2026-04-06 10:10:56.372453+00
430	Charlievobre	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlievobre	roser.chelsea@utexas.edu	\N	2026-04-04 16:29:52+00	\N	\N	CharlievobrePQ CharlievobrePQ	student	t	t	f	\N	2026-04-06 10:10:56.488163+00	2026-04-06 10:10:56.488163+00
31	sera	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sera	rseralathan6725@gmail.com	\N	2025-05-26 17:24:36+00	\N	\N	Seralathan Rajendran	student	t	t	f	\N	2026-04-06 10:10:56.263427+00	2026-04-06 10:10:56.263427+00
423	Stephenbow	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Stephenbow	rtoupal@gmail.com	\N	2026-04-04 15:47:18+00	\N	\N	StephenbowSW StephenbowSW	student	t	t	f	\N	2026-04-06 10:10:56.484799+00	2026-04-06 10:10:56.484799+00
218	WilliamKix	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamKix	ruoyan8762@gmail.com	\N	2026-02-10 02:41:44+00	\N	\N	WilliamKixGJ WilliamKixGJ	student	t	t	f	\N	2026-04-06 10:10:56.390802+00	2026-04-06 10:10:56.390802+00
373	WilliamSpeni	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamSpeni	s_maria_roberson@yahoo.com	\N	2026-04-04 08:25:11+00	\N	\N	WilliamSpeniDW WilliamSpeniDW	student	t	t	f	\N	2026-04-06 10:10:56.458801+00	2026-04-06 10:10:56.458801+00
532	Phillipmed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Phillipmed	sadeq.ahmed@stellantis.com	\N	2026-04-05 12:41:58+00	\N	\N	PhillipmedNC PhillipmedNC	student	t	t	f	\N	2026-04-06 10:10:56.549086+00	2026-04-06 10:10:56.549086+00
523	WilliamVussy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamVussy	sadeqahmed90@gmail.com	\N	2026-04-05 12:07:46+00	\N	\N	WilliamVussyLU WilliamVussyLU	student	t	t	f	\N	2026-04-06 10:10:56.543788+00	2026-04-06 10:10:56.543788+00
35	subhasri	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	subhasri	sairasubha07@gmail.com	\N	2025-05-27 01:53:15+00	\N	\N	Subhasri M	student	t	t	f	\N	2026-04-06 10:10:56.266174+00	2026-04-06 10:10:56.266174+00
499	Brucedroxy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Brucedroxy	salsolis18@gmail.com	\N	2026-04-05 06:16:39+00	\N	\N	BrucedroxyNR BrucedroxyNR	student	t	t	f	\N	2026-04-06 10:10:56.528601+00	2026-04-06 10:10:56.528601+00
299	MiguelEdina	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MiguelEdina	Sam@superiorbath.ca	\N	2026-02-10 12:13:43+00	\N	\N	MiguelEdinaVW MiguelEdinaVW	student	t	t	f	\N	2026-04-06 10:10:56.425411+00	2026-04-06 10:10:56.425411+00
285	Byronkax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Byronkax	Samantha.Chico@yahoo.com	\N	2026-02-10 10:57:03+00	\N	\N	ByronkaxZC ByronkaxZC	student	t	t	f	\N	2026-04-06 10:10:56.419656+00	2026-04-06 10:10:56.419656+00
228	GeorgeExers	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeExers	samuelarriaga11@gmail.com	\N	2026-02-10 03:46:37+00	\N	\N	GeorgeExersWL GeorgeExersWL	student	t	t	f	\N	2026-04-06 10:10:56.395048+00	2026-04-06 10:10:56.395048+00
61	saranthiyagu	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	saranthiyagu	sanasara2201@gmail.com	\N	2025-11-23 17:12:50+00	\N	\N	Saran T	student	t	t	f	\N	2026-04-06 10:10:56.285071+00	2026-04-06 10:10:56.285071+00
28	sanjaykumaran	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sanjaykumaran	sanjaykumaran1849@gmail.com	\N	2025-03-19 15:17:02+00	\N	\N	sanjaykumaran v	student	t	t	f	\N	2026-04-06 10:10:56.261488+00	2026-04-06 10:10:56.261488+00
29	sanjaylakshmanan	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sanjaylakshmanan	sanjaylakshmanan22@gmail.com	\N	2025-05-27 04:23:33+00	\N	\N	Sanjay L	student	t	t	f	\N	2026-04-06 10:10:56.262096+00	2026-04-06 10:10:56.262096+00
511	PatrickBiG	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	PatrickBiG	sara.giardini79@gmail.com	\N	2026-04-05 10:02:25+00	\N	\N	PatrickBiGPI PatrickBiGPI	student	t	t	f	\N	2026-04-06 10:10:56.536596+00	2026-04-06 10:10:56.536596+00
524	KennethSmaft	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KennethSmaft	sara@healthhiveforyou.com	\N	2026-04-05 12:08:19+00	\N	\N	KennethSmaftEY KennethSmaftEY	student	t	t	f	\N	2026-04-06 10:10:56.544254+00	2026-04-06 10:10:56.544254+00
345	DwayneLon	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DwayneLon	sarabwoods1@gmail.com	\N	2026-04-04 04:43:15+00	\N	\N	DwayneLonTR DwayneLonTR	student	t	t	f	\N	2026-04-06 10:10:56.446148+00	2026-04-06 10:10:56.446148+00
525	HenryWal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HenryWal	sarahfrenzel@live.com	\N	2026-04-05 12:14:39+00	\N	\N	HenryWalHY HenryWalHY	student	t	t	f	\N	2026-04-06 10:10:56.544782+00	2026-04-06 10:10:56.544782+00
57	saranthiyuagu	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	saranthiyuagu	saranthiyagu22@gmail.com	\N	2025-11-09 06:18:32+00	\N	\N	Saran T	student	t	t	f	\N	2026-04-06 10:10:56.282685+00	2026-04-06 10:10:56.282685+00
62	sarant	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sarant	sarantrajan2002@gmail.com	\N	2025-11-23 17:17:54+00	\N	\N	Saran t	student	t	t	f	\N	2026-04-06 10:10:56.285588+00	2026-04-06 10:10:56.285588+00
37	utporul	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	utporul	sashainfinityutporul@gmail.com	\N	2025-03-27 12:10:06+00	\N	\N	Utporul Sasha	student	t	t	t	\N	2026-04-06 10:10:56.267844+00	2026-04-06 10:10:56.267844+00
492	ThomasSEK	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ThomasSEK	sathrughna71@yahoo.ca	\N	2026-04-05 05:49:37+00	\N	\N	ThomasSEKVU ThomasSEKVU	student	t	t	f	\N	2026-04-06 10:10:56.524849+00	2026-04-06 10:10:56.524849+00
501	Matthewsuich	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Matthewsuich	saufbursche@yahoo.de	\N	2026-04-05 07:01:36+00	\N	\N	MatthewsuichCQ MatthewsuichCQ	student	t	t	f	\N	2026-04-06 10:10:56.529512+00	2026-04-06 10:10:56.529512+00
353	RichardEmada	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RichardEmada	saytay106@gmail.com	\N	2026-04-04 05:59:27+00	\N	\N	RichardEmadaSK RichardEmadaSK	student	t	t	f	\N	2026-04-06 10:10:56.449747+00	2026-04-06 10:10:56.449747+00
424	Kelvingycle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Kelvingycle	scavottod@gmail.com	\N	2026-04-04 15:47:35+00	\N	\N	KelvingycleQD KelvingycleQD	student	t	t	f	\N	2026-04-06 10:10:56.485288+00	2026-04-06 10:10:56.485288+00
323	Robertsom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertsom	scott@rrcmllc.com	\N	2026-04-04 01:32:59+00	\N	\N	RobertsomIZ RobertsomIZ	student	t	t	f	\N	2026-04-06 10:10:56.435851+00	2026-04-06 10:10:56.435851+00
256	RonaldBed	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RonaldBed	Scotthoag74@gmail.com	\N	2026-02-10 07:26:23+00	\N	\N	RonaldBedUR RonaldBedUR	student	t	t	f	\N	2026-04-06 10:10:56.408117+00	2026-04-06 10:10:56.408117+00
208	Jamesdub	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesdub	ScottZarzycki@gmail.com	\N	2026-02-10 01:11:20+00	\N	\N	JamesdubLI JamesdubLI	student	t	t	f	\N	2026-04-06 10:10:56.385623+00	2026-04-06 10:10:56.385623+00
103	Jamesbuift	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesbuift	sean@loescherhvac.com	\N	2026-02-09 03:21:03+00	\N	\N	JamesbuiftJL JamesbuiftJL	student	t	t	f	\N	2026-04-06 10:10:56.325233+00	2026-04-06 10:10:56.325233+00
362	StephenAmame	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	StephenAmame	seanccannady@gmail.com	\N	2026-04-04 07:03:42+00	\N	\N	StephenAmameUY StephenAmameUY	student	t	t	f	\N	2026-04-06 10:10:56.453844+00	2026-04-06 10:10:56.453844+00
514	WilliamRarma	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamRarma	ambarella@gmail.com	\N	2026-04-05 10:36:03+00	\N	\N	WilliamRarmaEU WilliamRarmaEU	student	t	t	f	\N	2026-04-06 10:10:56.538786+00	2026-04-06 10:10:56.538786+00
407	Raymondfes	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Raymondfes	seany916@yahoo.com	\N	2026-04-04 13:15:20+00	\N	\N	RaymondfesMY RaymondfesMY	student	t	t	f	\N	2026-04-06 10:10:56.475767+00	2026-04-06 10:10:56.475767+00
301	JacobSah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JacobSah	seearebee2@gmail.com	\N	2026-02-10 13:00:37+00	\N	\N	JacobSahXF JacobSahXF	student	t	t	f	\N	2026-04-06 10:10:56.426299+00	2026-04-06 10:10:56.426299+00
262	PierreNew	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	PierreNew	serranoredo@msn.com	\N	2026-02-10 08:22:47+00	\N	\N	PierreNewYY PierreNewYY	student	t	t	f	\N	2026-04-06 10:10:56.41061+00	2026-04-06 10:10:56.41061+00
397	VincentLiasp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	VincentLiasp	sethjwilliams@yahoo.com	\N	2026-04-04 11:54:57+00	\N	\N	VincentLiaspSS VincentLiaspSS	student	t	t	f	\N	2026-04-06 10:10:56.470822+00	2026-04-06 10:10:56.470822+00
129	Richardsnist	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Richardsnist	sewell.nikki06@gmail.com	\N	2026-02-09 18:58:26+00	\N	\N	RichardsnistQX RichardsnistQX	student	t	t	f	\N	2026-04-06 10:10:56.342075+00	2026-04-06 10:10:56.342075+00
494	FrankOccaw	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	FrankOccaw	sfreeman@tjbc.com	\N	2026-04-05 05:56:49+00	\N	\N	FrankOccawNW FrankOccawNW	student	t	t	f	\N	2026-04-06 10:10:56.52603+00	2026-04-06 10:10:56.52603+00
149	TerryNAt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	TerryNAt	Shane060105@gmail.com	\N	2026-02-09 20:39:29+00	\N	\N	TerryNAtRL TerryNAtRL	student	t	t	f	\N	2026-04-06 10:10:56.353455+00	2026-04-06 10:10:56.353455+00
80	RobertOveta	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertOveta	shannongaulton@gmail.com	\N	2026-02-08 23:34:39+00	\N	\N	RobertOvetaTC RobertOvetaTC	student	t	t	f	\N	2026-04-06 10:10:56.299957+00	2026-04-06 10:10:56.299957+00
16	bmbvb5	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	bmbvb5	sharveshwar12345@gmail.com	\N	2025-06-18 07:34:27+00	\N	\N	Sharveshwar Rajkumar	student	t	t	f	\N	2026-04-06 10:10:56.252845+00	2026-04-06 10:10:56.252845+00
147	Lancelag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lancelag	sherwin782002@gmail.com	\N	2026-02-09 20:27:26+00	\N	\N	LancelagAV LancelagAV	student	t	t	f	\N	2026-04-06 10:10:56.352508+00	2026-04-06 10:10:56.352508+00
66	shreelekha	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	shreelekha	shreelekhasv@gmail.com	\N	2025-12-26 09:43:20+00	\N	\N	shreelekha S V	student	t	t	t	\N	2026-04-06 10:10:56.288141+00	2026-04-06 10:10:56.288141+00
150	PhillipsAtte	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	PhillipsAtte	singhamritpal100@yahoo.com	\N	2026-02-09 20:39:49+00	\N	\N	PhillipsAtteBF PhillipsAtteBF	student	t	t	f	\N	2026-04-06 10:10:56.353943+00	2026-04-06 10:10:56.353943+00
33	siximi1325	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	siximi1325	siximi1325@dlbazi.com	\N	2025-05-27 08:19:02+00	\N	\N	siximi si	student	t	t	f	\N	2026-04-06 10:10:56.264989+00	2026-04-06 10:10:56.264989+00
350	PeterFug	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	PeterFug	sjbaits@hotmail.com	\N	2026-04-04 05:36:33+00	\N	\N	PeterFugRF PeterFugRF	student	t	t	f	\N	2026-04-06 10:10:56.448294+00	2026-04-06 10:10:56.448294+00
232	Timothywah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Timothywah	sjones@merlincontracting.com	\N	2026-02-10 04:08:51+00	\N	\N	TimothywahWU TimothywahWU	student	t	t	f	\N	2026-04-06 10:10:56.396979+00	2026-04-06 10:10:56.396979+00
1	slokeshwaran2195	$2b$12$F.YjBlxzw5lOnOyWL.a3V.GWoKdbBa0Gy66jNxUCQyBS3shmVrhCC	slokeshwaran2195	slokeshwaran2195@gmail.com		2026-03-07 10:53:36.042302+00		1	LOKESHWARAN S	student	t	t	f	\N	2026-03-07 10:53:36.042302+00	2026-03-07 10:55:07.472398+00
269	MichaelWeima	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelWeima	smaddox@mbe.com	\N	2026-02-10 09:13:32+00	\N	\N	MichaelWeimaJH MichaelWeimaJH	student	t	t	f	\N	2026-04-06 10:10:56.413434+00	2026-04-06 10:10:56.413434+00
264	OscarDep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	OscarDep	smerco@aol.com	\N	2026-02-10 08:35:05+00	\N	\N	OscarDepAE OscarDepAE	student	t	t	f	\N	2026-04-06 10:10:56.4114+00	2026-04-06 10:10:56.4114+00
100	Justinbum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Justinbum	sophiabaroni2015@gmail.com	\N	2026-02-09 02:54:53+00	\N	\N	JustinbumGI JustinbumGI	student	t	t	f	\N	2026-04-06 10:10:56.323288+00	2026-04-06 10:10:56.323288+00
17	Sowmiya_R	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Sowmiya_R	sowmiya.sii001@sashainfinity.com	\N	2025-06-18 07:35:49+00	\N	\N	Sowmiya R	student	t	t	f	\N	2026-04-06 10:10:56.253673+00	2026-04-06 10:10:56.253673+00
400	ClaudePeado	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ClaudePeado	squeezer007@aol.com	\N	2026-04-04 12:10:21+00	\N	\N	ClaudePeadoLS ClaudePeadoLS	student	t	t	f	\N	2026-04-06 10:10:56.472255+00	2026-04-06 10:10:56.472255+00
138	Robertfrect	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertfrect	sr2js@aol.com	\N	2026-02-09 19:44:40+00	\N	\N	RobertfrectOV RobertfrectOV	student	t	t	f	\N	2026-04-06 10:10:56.348018+00	2026-04-06 10:10:56.348018+00
55	srina.s	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	srina.s	srinasp18@gmail.com	\N	2025-10-20 17:39:39+00	\N	\N	Srina S	student	t	t	t	\N	2026-04-06 10:10:56.281338+00	2026-04-06 10:10:56.281338+00
119	Jamesspemn	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesspemn	sstratto@gmail.com	\N	2026-02-09 06:17:18+00	\N	\N	JamesspemnHR JamesspemnHR	student	t	t	f	\N	2026-04-06 10:10:56.336651+00	2026-04-06 10:10:56.336651+00
132	VinceCoula	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	VinceCoula	stashia@cccrockwall.org	\N	2026-02-09 19:25:43+00	\N	\N	VinceCoulaST VinceCoulaST	student	t	t	f	\N	2026-04-06 10:10:56.344307+00	2026-04-06 10:10:56.344307+00
201	Ronaldtrots	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Ronaldtrots	state48plumber@gmail.com	\N	2026-02-10 00:34:37+00	\N	\N	RonaldtrotsDX RonaldtrotsDX	student	t	t	f	\N	2026-04-06 10:10:56.382919+00	2026-04-06 10:10:56.382919+00
160	Nathanthisp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Nathanthisp	sujos100@yahoo.com	\N	2026-02-09 21:23:07+00	\N	\N	NathanthispXP NathanthispXP	student	t	t	f	\N	2026-04-06 10:10:56.362533+00	2026-04-06 10:10:56.362533+00
58	sashagmailcom	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	sashagmailcom	support@sashainfinity.com	\N	2025-11-17 07:12:34+00	\N	\N	learn-with-sasha ss	student	t	t	f	\N	2026-04-06 10:10:56.283251+00	2026-04-06 10:10:56.283251+00
318	Larrykar	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Larrykar	susan@rodecker.com	\N	2026-04-04 01:25:27+00	\N	\N	LarrykarJH LarrykarJH	student	t	t	f	\N	2026-04-06 10:10:56.433397+00	2026-04-06 10:10:56.433397+00
544	Russellpedak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Russellpedak	susannekp@gmail.com	\N	2026-04-05 14:48:01+00	\N	\N	RussellpedakRQ RussellpedakRQ	student	t	t	f	\N	2026-04-06 10:10:56.556061+00	2026-04-06 10:10:56.556061+00
295	Georgefrimi	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Georgefrimi	sw33t-t@hotmail.com	\N	2026-02-10 11:43:27+00	\N	\N	GeorgefrimiCP GeorgefrimiCP	student	t	t	f	\N	2026-04-06 10:10:56.423597+00	2026-04-06 10:10:56.423597+00
402	LarryMor	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	LarryMor	syvie_beauty@hotmail.com	\N	2026-04-04 12:41:14+00	\N	\N	LarryMorPX LarryMorPX	student	t	t	f	\N	2026-04-06 10:10:56.473268+00	2026-04-06 10:10:56.473268+00
139	Patricklob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Patricklob	taffy969@comcast.net	\N	2026-02-09 19:45:43+00	\N	\N	PatricklobUO PatricklobUO	student	t	t	f	\N	2026-04-06 10:10:56.348496+00	2026-04-06 10:10:56.348496+00
283	Billyfeeli	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Billyfeeli	tanjoy4@netzero.net	\N	2026-02-10 10:41:42+00	\N	\N	BillyfeeliML BillyfeeliML	student	t	t	f	\N	2026-04-06 10:10:56.418844+00	2026-04-06 10:10:56.418844+00
164	Jeffreybus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeffreybus	tbertagnolli@gmail.com	\N	2026-02-09 21:35:51+00	\N	\N	JeffreybusQB JeffreybusQB	student	t	t	f	\N	2026-04-06 10:10:56.364969+00	2026-04-06 10:10:56.364969+00
56	srinasp	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	srinasp	2k24it104@kiot.ac.in	\N	2025-10-22 15:47:54+00	\N	\N	SRINA S	student	t	t	f	\N	2026-04-06 10:10:56.281961+00	2026-04-06 10:10:56.281961+00
105	Henrysef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Henrysef	82batallon@gmail.com	\N	2026-02-09 03:26:16+00	\N	\N	HenrysefKX HenrysefKX	student	t	t	f	\N	2026-04-06 10:10:56.32643+00	2026-04-06 10:10:56.32643+00
181	GeorgeDum	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GeorgeDum	tbirds91@gmail.com	\N	2026-02-09 23:13:43+00	\N	\N	GeorgeDumXC GeorgeDumXC	student	t	t	f	\N	2026-04-06 10:10:56.373788+00	2026-04-06 10:10:56.373788+00
553	DavidMef	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DavidMef	tbthorn@gmail.com	\N	2026-04-05 15:54:50+00	\N	\N	DavidMefZQ DavidMefZQ	student	t	t	f	\N	2026-04-06 10:10:56.560406+00	2026-04-06 10:10:56.560406+00
416	DevinLah	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DevinLah	ted.tracy@yahoo.com	\N	2026-04-04 14:41:16+00	\N	\N	DevinLahDQ DevinLahDQ	student	t	t	f	\N	2026-04-06 10:10:56.481217+00	2026-04-06 10:10:56.481217+00
381	Geraldhub	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Geraldhub	terri.a.carr@gmail.com	\N	2026-04-04 09:16:58+00	\N	\N	GeraldhubBO GeraldhubBO	student	t	t	f	\N	2026-04-06 10:10:56.46225+00	2026-04-06 10:10:56.46225+00
365	ErnestCipsy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ErnestCipsy	terrij2008@yahoo.com	\N	2026-04-04 07:23:23+00	\N	\N	ErnestCipsyWD ErnestCipsyWD	student	t	t	f	\N	2026-04-06 10:10:56.455109+00	2026-04-06 10:10:56.455109+00
127	DorseyFap	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DorseyFap	thecherrys1@zoomtown.com	\N	2026-02-09 18:47:00+00	\N	\N	DorseyFapLR DorseyFapLR	student	t	t	f	\N	2026-04-06 10:10:56.341134+00	2026-04-06 10:10:56.341134+00
281	DevinKit	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DevinKit	thesprucetree@rogers.com	\N	2026-02-10 10:24:00+00	\N	\N	DevinKitRS DevinKitRS	student	t	t	f	\N	2026-04-06 10:10:56.41811+00	2026-04-06 10:10:56.41811+00
441	WilliamSefly	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamSefly	thirdballgirl@gmail.com	\N	2026-04-04 18:01:44+00	\N	\N	WilliamSeflyVW WilliamSeflyVW	student	t	t	f	\N	2026-04-06 10:10:56.493497+00	2026-04-06 10:10:56.493497+00
485	ScottJED	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ScottJED	thirdeyepinecones@gmail.com	\N	2026-04-05 03:43:35+00	\N	\N	ScottJEDDS ScottJEDDS	student	t	t	f	\N	2026-04-06 10:10:56.520438+00	2026-04-06 10:10:56.520438+00
179	MichealCycle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichealCycle	thistiff97@gmail.com	\N	2026-02-09 23:08:22+00	\N	\N	MichealCycleOI MichealCycleOI	student	t	t	f	\N	2026-04-06 10:10:56.3729+00	2026-04-06 10:10:56.3729+00
354	KennethReunc	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	KennethReunc	thrawls@comcast.net	\N	2026-04-04 06:00:49+00	\N	\N	KennethReuncVT KennethReuncVT	student	t	t	f	\N	2026-04-06 10:10:56.450163+00	2026-04-06 10:10:56.450163+00
46	gdev12	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	gdev12	tienartemis9@gmail.com	\N	2025-07-01 09:23:24+00	\N	\N	Gurudev F	student	t	t	f	\N	2026-04-06 10:10:56.275161+00	2026-04-06 10:10:56.275161+00
95	Russelavaft	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Russelavaft	timvanderlinde2011@gmail.com	\N	2026-02-09 02:04:15+00	\N	\N	RusselavaftRY RusselavaftRY	student	t	t	f	\N	2026-04-06 10:10:56.31766+00	2026-04-06 10:10:56.31766+00
463	ClaudeEtell	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ClaudeEtell	tingyip@yahoo.com	\N	2026-04-04 21:08:04+00	\N	\N	ClaudeEtellGR ClaudeEtellGR	student	t	t	f	\N	2026-04-06 10:10:56.504783+00	2026-04-06 10:10:56.504783+00
545	RobertBlarm	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertBlarm	tjaymz321@gmail.com	\N	2026-04-05 14:55:38+00	\N	\N	RobertBlarmKI RobertBlarmKI	student	t	t	f	\N	2026-04-06 10:10:56.556488+00	2026-04-06 10:10:56.556488+00
104	DwayneMycle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DwayneMycle	tjbrownwvu@gmail.com	\N	2026-02-09 03:22:16+00	\N	\N	DwayneMycleBW DwayneMycleBW	student	t	t	f	\N	2026-04-06 10:10:56.325845+00	2026-04-06 10:10:56.325845+00
461	Jerrysit	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jerrysit	tkd854@gmail.com	\N	2026-04-04 21:05:06+00	\N	\N	JerrysitGT JerrysitGT	student	t	t	f	\N	2026-04-06 10:10:56.503229+00	2026-04-06 10:10:56.503229+00
120	CharlesHaply	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	CharlesHaply	tmccollum2@gmail.com	\N	2026-02-09 06:18:38+00	\N	\N	CharlesHaplyMX CharlesHaplyMX	student	t	t	f	\N	2026-04-06 10:10:56.337159+00	2026-04-06 10:10:56.337159+00
166	JavierErods	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JavierErods	toddhubley@yahoo.com	\N	2026-02-09 21:45:50+00	\N	\N	JavierErodsQH JavierErodsQH	student	t	t	f	\N	2026-04-06 10:10:56.365859+00	2026-04-06 10:10:56.365859+00
152	DanielHieni	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	DanielHieni	tomcat96@aol.com	\N	2026-02-09 20:45:42+00	\N	\N	DanielHieniOG DanielHieniOG	student	t	t	f	\N	2026-04-06 10:10:56.354796+00	2026-04-06 10:10:56.354796+00
415	NelsonTelay	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	NelsonTelay	tomtomasik@yahoo.com	\N	2026-04-04 14:32:52+00	\N	\N	NelsonTelayAJ NelsonTelayAJ	student	t	t	f	\N	2026-04-06 10:10:56.480703+00	2026-04-06 10:10:56.480703+00
184	RonaldmaH	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RonaldmaH	toofxmous@gmail.com	\N	2026-02-09 23:24:12+00	\N	\N	RonaldmaHLZ RonaldmaHLZ	student	t	t	f	\N	2026-04-06 10:10:56.375111+00	2026-04-06 10:10:56.375111+00
270	Davidces	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidces	trevor@busybeasmarketgarden.com	\N	2026-02-10 09:17:08+00	\N	\N	DavidcesUF DavidcesUF	student	t	t	f	\N	2026-04-06 10:10:56.413758+00	2026-04-06 10:10:56.413758+00
134	Charlessal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Charlessal	tyler.r.geronzin@boeing.com	\N	2026-02-09 19:38:20+00	\N	\N	CharlessalIW CharlessalIW	student	t	t	f	\N	2026-04-06 10:10:56.345644+00	2026-04-06 10:10:56.345644+00
207	Robertzeste	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Robertzeste	tzeising@taxauditdefensepllc.com	\N	2026-02-10 01:02:30+00	\N	\N	RobertzesteRG RobertzesteRG	student	t	t	f	\N	2026-04-06 10:10:56.385262+00	2026-04-06 10:10:56.385262+00
510	MathewJoida	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MathewJoida	under.lined@hotmail.com	\N	2026-04-05 09:21:23+00	\N	\N	MathewJoidaWB MathewJoidaWB	student	t	t	f	\N	2026-04-06 10:10:56.536091+00	2026-04-06 10:10:56.536091+00
188	RobertFaple	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertFaple	urby@lszcpa.com	\N	2026-02-09 23:48:37+00	\N	\N	RobertFapleNS RobertFapleNS	student	t	t	f	\N	2026-04-06 10:10:56.37692+00	2026-04-06 10:10:56.37692+00
189	AlbertKen	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AlbertKen	v_valladares@hotmail.com	\N	2026-02-09 23:48:37+00	\N	\N	AlbertKenIV AlbertKenIV	student	t	t	f	\N	2026-04-06 10:10:56.377393+00	2026-04-06 10:10:56.377393+00
38	vairam1224	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	vairam1224	vairam.dliindia@gmail.com	\N	2025-04-04 06:11:39+00	\N	\N	Vairamanivel Murugesan	student	t	t	f	\N	2026-04-06 10:10:56.268931+00	2026-04-06 10:10:56.268931+00
379	BradleyPaype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	BradleyPaype	vandawgbonz@yahoo.com	\N	2026-04-04 09:01:27+00	\N	\N	BradleyPaypeUH BradleyPaypeUH	student	t	t	f	\N	2026-04-06 10:10:56.461321+00	2026-04-06 10:10:56.461321+00
155	Michaeltig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaeltig	vanessakuran@gmail.com	\N	2026-02-09 20:52:57+00	\N	\N	MichaeltigKT MichaeltigKT	student	t	t	f	\N	2026-04-06 10:10:56.357702+00	2026-04-06 10:10:56.357702+00
126	Peterhob	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Peterhob	vargas.richard364@gmail.com	\N	2026-02-09 18:45:22+00	\N	\N	PeterhobNG PeterhobNG	student	t	t	f	\N	2026-04-06 10:10:56.340661+00	2026-04-06 10:10:56.340661+00
168	HaroldRox	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HaroldRox	vasilyinusa@gmail.com	\N	2026-02-09 21:59:32+00	\N	\N	HaroldRoxIR HaroldRoxIR	student	t	t	f	\N	2026-04-06 10:10:56.367672+00	2026-04-06 10:10:56.367672+00
202	JoshuaTug	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JoshuaTug	vegas161@gmai.com	\N	2026-02-10 00:43:19+00	\N	\N	JoshuaTugYG JoshuaTugYG	student	t	t	f	\N	2026-04-06 10:10:56.383301+00	2026-04-06 10:10:56.383301+00
429	Rogerskart	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Rogerskart	607jrenda1@stny.rr.com	\N	2026-04-04 16:19:07+00	\N	\N	RogerskartQN RogerskartQN	student	t	t	f	\N	2026-04-06 10:10:56.487694+00	2026-04-06 10:10:56.487694+00
302	AaronPrevy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	AaronPrevy	86gmcstepside@gmail.com	\N	2026-02-10 13:00:49+00	\N	\N	AaronPrevyUQ AaronPrevyUQ	student	t	t	f	\N	2026-04-06 10:10:56.426806+00	2026-04-06 10:10:56.426806+00
196	Jeromeboype	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jeromeboype	aaron.l.favors@gmail.com	\N	2026-02-10 00:14:03+00	\N	\N	JeromeboypeUF JeromeboypeUF	student	t	t	f	\N	2026-04-06 10:10:56.380889+00	2026-04-06 10:10:56.380889+00
349	Matthewvaw	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Matthewvaw	aaron@earhartcampground.com	\N	2026-04-04 05:31:12+00	\N	\N	MatthewvawWU MatthewvawWU	student	t	t	f	\N	2026-04-06 10:10:56.447843+00	2026-04-06 10:10:56.447843+00
539	Jesusweick	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jesusweick	accelip@yahoo.com.hk	\N	2026-04-05 14:14:29+00	\N	\N	JesusweickQT JesusweickQT	student	t	t	f	\N	2026-04-06 10:10:56.55335+00	2026-04-06 10:10:56.55335+00
307	admin_1	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	admin_1	admin@example.com	\N	2026-03-20 09:48:00+00	\N	\N	admin_1	student	t	t	f	\N	2026-04-06 10:10:56.429003+00	2026-04-06 10:10:56.429003+00
140	Buddycic	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Buddycic	al1208@gmail.com	\N	2026-02-09 19:54:19+00	\N	\N	BuddycicWC BuddycicWC	student	t	t	f	\N	2026-04-06 10:10:56.348945+00	2026-04-06 10:10:56.348945+00
479	MatthewLunty	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MatthewLunty	albecuba1987@gmail.com	\N	2026-04-05 01:04:29+00	\N	\N	MatthewLuntyFT MatthewLuntyFT	student	t	t	f	\N	2026-04-06 10:10:56.516539+00	2026-04-06 10:10:56.516539+00
337	Davidtus	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Davidtus	alemanerica@gmail.com	\N	2026-04-04 03:51:45+00	\N	\N	DavidtusTF DavidtusTF	student	t	t	f	\N	2026-04-06 10:10:56.442602+00	2026-04-06 10:10:56.442602+00
498	EddieLes	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	EddieLes	alex_preshyon@hotmail.com	\N	2026-04-05 06:10:16+00	\N	\N	EddieLesKL EddieLesKL	student	t	t	f	\N	2026-04-06 10:10:56.528089+00	2026-04-06 10:10:56.528089+00
154	Jerrellmib	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jerrellmib	alex.vega.uscg@gmail.com	\N	2026-02-09 20:48:18+00	\N	\N	JerrellmibPX JerrellmibPX	student	t	t	f	\N	2026-04-06 10:10:56.357265+00	2026-04-06 10:10:56.357265+00
455	MichaelFoedy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelFoedy	allisontrent@hotmail.com	\N	2026-04-04 19:58:36+00	\N	\N	MichaelFoedySD MichaelFoedySD	student	t	t	f	\N	2026-04-06 10:10:56.500008+00	2026-04-06 10:10:56.500008+00
44	bilal	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	bilal	althafbilal1968@gmail.com	\N	2025-07-01 08:52:43+00	\N	\N	Mohammed Bilal A	student	t	t	f	\N	2026-04-06 10:10:56.273891+00	2026-04-06 10:10:56.273891+00
451	ShaneWaiff	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	ShaneWaiff	alyssajaker@yahoo.com	\N	2026-04-04 19:24:48+00	\N	\N	ShaneWaiffJD ShaneWaiffJD	student	t	t	f	\N	2026-04-06 10:10:56.498317+00	2026-04-06 10:10:56.498317+00
348	HowardGicle	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	HowardGicle	kcouchon@gmail.com	\N	2026-04-04 05:16:22+00	\N	\N	HowardGicleHD HowardGicleHD	student	t	t	f	\N	2026-04-06 10:10:56.447433+00	2026-04-06 10:10:56.447433+00
203	Jamesnag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesnag	vegas161@gmail.com	\N	2026-02-10 00:43:21+00	\N	\N	JamesnagFR JamesnagFR	student	t	t	f	\N	2026-04-06 10:10:56.383688+00	2026-04-06 10:10:56.383688+00
210	MiltonSleds	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MiltonSleds	vijunn1977@gmail.com	\N	2026-02-10 01:22:32+00	\N	\N	MiltonSledsVH MiltonSledsVH	student	t	t	f	\N	2026-04-06 10:10:56.386565+00	2026-04-06 10:10:56.386565+00
70	Michaelnag	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Michaelnag	viktory@poshta.site	\N	2026-02-03 02:30:44+00	\N	\N	MichaelnagQE MichaelnagQE	student	t	t	f	\N	2026-04-06 10:10:56.29093+00	2026-04-06 10:10:56.29093+00
65	vinoth	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	vinoth	vinothvinothmt117@gamil.com	\N	2025-12-18 15:43:58+00	\N	\N	Vinoth M T	student	t	t	f	\N	2026-04-06 10:10:56.287531+00	2026-04-06 10:10:56.287531+00
64	vinoth.m t	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	vinoth.m t	vinothvinothmt117@gmail.com	\N	2025-12-18 15:36:53+00	\N	\N	Vinoth M T	student	t	t	t	\N	2026-04-06 10:10:56.286697+00	2026-04-06 10:10:56.286697+00
313	WilliamTaito	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	WilliamTaito	wallace@rodecker.com	\N	2026-04-04 01:15:16+00	\N	\N	WilliamTaitoQJ WilliamTaitoQJ	student	t	t	f	\N	2026-04-06 10:10:56.431428+00	2026-04-06 10:10:56.431428+00
372	JeromeSab	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	JeromeSab	wbradmorgan@gmail.com	\N	2026-04-04 08:20:28+00	\N	\N	JeromeSabDB JeromeSabDB	student	t	t	f	\N	2026-04-06 10:10:56.458339+00	2026-04-06 10:10:56.458339+00
519	LewisLip	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	LewisLip	whitedovewaters@gmail.com	\N	2026-04-05 11:21:56+00	\N	\N	LewisLipKI LewisLipKI	student	t	t	f	\N	2026-04-06 10:10:56.541735+00	2026-04-06 10:10:56.541735+00
383	Aaroneduff	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Aaroneduff	wierzbowski@t-online.de	\N	2026-04-04 09:24:25+00	\N	\N	AaroneduffOD AaroneduffOD	student	t	t	f	\N	2026-04-06 10:10:56.463626+00	2026-04-06 10:10:56.463626+00
291	Perryliedy	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Perryliedy	william.bluhm76@gmail.com	\N	2026-02-10 11:36:46+00	\N	\N	PerryliedyEE PerryliedyEE	student	t	t	f	\N	2026-04-06 10:10:56.422001+00	2026-04-06 10:10:56.422001+00
219	Jamesthipt	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesthipt	williamkordab@gmail.com	\N	2026-02-10 02:45:19+00	\N	\N	JamesthiptFI JamesthiptFI	student	t	t	f	\N	2026-04-06 10:10:56.391319+00	2026-04-06 10:10:56.391319+00
367	MichaelFainc	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	MichaelFainc	williamyerke@yahoo.com	\N	2026-04-04 07:35:41+00	\N	\N	MichaelFaincFR MichaelFaincFR	student	t	t	f	\N	2026-04-06 10:10:56.456007+00	2026-04-06 10:10:56.456007+00
495	RobertPep	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	RobertPep	wilsonnomes@gmail.com	\N	2026-04-05 05:57:25+00	\N	\N	RobertPepQA RobertPepQA	student	t	t	f	\N	2026-04-06 10:10:56.52658+00	2026-04-06 10:10:56.52658+00
453	Donaldnig	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Donaldnig	woocaro@hotmail.com	\N	2026-04-04 19:31:58+00	\N	\N	DonaldnigWV DonaldnigWV	student	t	t	f	\N	2026-04-06 10:10:56.499158+00	2026-04-06 10:10:56.499158+00
419	Jamesger	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Jamesger	wrenewagner@hotmail.com	\N	2026-04-04 14:55:56+00	\N	\N	JamesgerWB JamesgerWB	student	t	t	f	\N	2026-04-06 10:10:56.482756+00	2026-04-06 10:10:56.482756+00
376	Lewisprusa	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Lewisprusa	wuyulunbidp0923@gmail.com	\N	2026-04-04 08:34:14+00	\N	\N	LewisprusaPG LewisprusaPG	student	t	t	f	\N	2026-04-06 10:10:56.460062+00	2026-04-06 10:10:56.460062+00
508	GradyHax	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	GradyHax	wwaybrant@yahoo.com	\N	2026-04-05 08:46:30+00	\N	\N	GradyHaxQE GradyHaxQE	student	t	t	f	\N	2026-04-06 10:10:56.534449+00	2026-04-06 10:10:56.534449+00
290	Nathanjak	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Nathanjak	xmarchewkabiznes@gmail.com	\N	2026-02-10 11:27:38+00	\N	\N	NathanjakLQ NathanjakLQ	student	t	t	f	\N	2026-04-06 10:10:56.421627+00	2026-04-06 10:10:56.421627+00
488	Bookeraffok	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Bookeraffok	Yankee_B@msn.com	\N	2026-04-05 04:26:46+00	\N	\N	BookeraffokMH BookeraffokMH	student	t	t	f	\N	2026-04-06 10:10:56.521933+00	2026-04-06 10:10:56.521933+00
215	SidneySet	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	SidneySet	yesep314@yahoo.com	\N	2026-02-10 02:07:21+00	\N	\N	SidneySetPY SidneySetPY	student	t	t	f	\N	2026-04-06 10:10:56.389411+00	2026-04-06 10:10:56.389411+00
267	Williepowly	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Williepowly	yunielsoler@yahoo.com	\N	2026-02-10 09:04:24+00	\N	\N	WilliepowlyPT WilliepowlyPT	student	t	t	f	\N	2026-04-06 10:10:56.412633+00	2026-04-06 10:10:56.412633+00
382	Danielunemi	$2b$12$OnYd3PM1A4yoR6yVQzjWOO9fABwGQsZ2nXqCHBLYSjeZW.YLOgcpW	Danielunemi	zdshapiro@gmail.com	\N	2026-04-04 09:19:38+00	\N	\N	DanielunemiYB DanielunemiYB	student	t	t	f	\N	2026-04-06 10:10:56.462707+00	2026-04-06 10:10:56.462707+00
\.


--
-- Data for Name: video_progress; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.video_progress (id, user_id, course_id, lesson_id, watched_seconds, total_seconds, is_completed, last_watched_at, created_at) FROM stdin;
\.


--
-- Data for Name: wishlist_items; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.wishlist_items (id, user_id, course_id, created_at) FROM stdin;
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: lms_user
--

COPY public.withdrawals (withdraw_id, user_id, amount, method_data, status, reject_detail, created_at, updated_at) FROM stdin;
\.


--
-- Name: assignment_submissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.assignment_submissions_id_seq', 1, false);


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.assignments_id_seq', 17, true);


--
-- Name: blog_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.blog_comments_id_seq', 1, false);


--
-- Name: blog_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.blog_posts_id_seq', 29, true);


--
-- Name: certificate_element_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.certificate_element_templates_id_seq', 1, false);


--
-- Name: certificate_verifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.certificate_verifications_id_seq', 1, false);


--
-- Name: certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.certificates_id_seq', 10, true);


--
-- Name: coupon_course_restrictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.coupon_course_restrictions_id_seq', 1, true);


--
-- Name: coupon_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.coupon_usage_id_seq', 1, false);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.coupons_id_seq', 2, true);


--
-- Name: course_announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.course_announcements_id_seq', 1, false);


--
-- Name: course_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.course_categories_id_seq', 1, false);


--
-- Name: course_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.course_certificates_id_seq', 1, false);


--
-- Name: course_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.course_reviews_id_seq', 1, false);


--
-- Name: course_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.course_tags_id_seq', 1, false);


--
-- Name: courses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.courses_id_seq', 13, true);


--
-- Name: earnings_earning_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.earnings_earning_id_seq', 1, false);


--
-- Name: enrollments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.enrollments_id_seq', 38, true);


--
-- Name: instructor_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.instructor_profiles_id_seq', 5, true);


--
-- Name: instructor_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.instructor_reviews_id_seq', 1, false);


--
-- Name: issued_certificates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.issued_certificates_id_seq', 6, true);


--
-- Name: lesson_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.lesson_progress_id_seq', 9, true);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.lessons_id_seq', 191, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.order_items_id_seq', 1, false);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.orders_id_seq', 1, false);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: quiz_attempt_answers_attempt_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.quiz_attempt_answers_attempt_answer_id_seq', 1, false);


--
-- Name: quiz_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.quiz_attempts_attempt_id_seq', 6, true);


--
-- Name: quiz_question_answers_answer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.quiz_question_answers_answer_id_seq', 492, true);


--
-- Name: quiz_questions_question_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.quiz_questions_question_id_seq', 237, true);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 22, true);


--
-- Name: student_course_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.student_course_activities_id_seq', 1, false);


--
-- Name: user_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.user_profiles_id_seq', 557, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.users_id_seq', 559, true);


--
-- Name: video_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.video_progress_id_seq', 1, false);


--
-- Name: wishlist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.wishlist_items_id_seq', 1, false);


--
-- Name: withdrawals_withdraw_id_seq; Type: SEQUENCE SET; Schema: public; Owner: lms_user
--

SELECT pg_catalog.setval('public.withdrawals_withdraw_id_seq', 1, false);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: blog_comments blog_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: certificate_element_templates certificate_element_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_element_templates
    ADD CONSTRAINT certificate_element_templates_pkey PRIMARY KEY (id);


--
-- Name: certificate_verifications certificate_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_verifications
    ADD CONSTRAINT certificate_verifications_pkey PRIMARY KEY (id);


--
-- Name: certificates certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_pkey PRIMARY KEY (id);


--
-- Name: coupon_course_restrictions coupon_course_restrictions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_course_restrictions
    ADD CONSTRAINT coupon_course_restrictions_pkey PRIMARY KEY (id);


--
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: course_announcements course_announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_announcements
    ADD CONSTRAINT course_announcements_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_name_key UNIQUE (name);


--
-- Name: course_categories course_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_pkey PRIMARY KEY (id);


--
-- Name: course_categories course_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_slug_key UNIQUE (slug);


--
-- Name: course_category_relations course_category_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_category_relations
    ADD CONSTRAINT course_category_relations_pkey PRIMARY KEY (course_id, category_id);


--
-- Name: course_certificates course_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_certificates
    ADD CONSTRAINT course_certificates_pkey PRIMARY KEY (id);


--
-- Name: course_reviews course_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_pkey PRIMARY KEY (id);


--
-- Name: course_tag_relations course_tag_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tag_relations
    ADD CONSTRAINT course_tag_relations_pkey PRIMARY KEY (course_id, tag_id);


--
-- Name: course_tags course_tags_name_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tags
    ADD CONSTRAINT course_tags_name_key UNIQUE (name);


--
-- Name: course_tags course_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tags
    ADD CONSTRAINT course_tags_pkey PRIMARY KEY (id);


--
-- Name: course_tags course_tags_slug_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tags
    ADD CONSTRAINT course_tags_slug_key UNIQUE (slug);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: earnings earnings_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_pkey PRIMARY KEY (earning_id);


--
-- Name: enrollments enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_pkey PRIMARY KEY (id);


--
-- Name: instructor_profiles instructor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_pkey PRIMARY KEY (id);


--
-- Name: instructor_reviews instructor_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_reviews
    ADD CONSTRAINT instructor_reviews_pkey PRIMARY KEY (id);


--
-- Name: issued_certificates issued_certificates_certificate_hash_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_certificate_hash_key UNIQUE (certificate_hash);


--
-- Name: issued_certificates issued_certificates_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_pkey PRIMARY KEY (id);


--
-- Name: issued_certificates issued_certificates_secure_certificate_id_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_secure_certificate_id_key UNIQUE (secure_certificate_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_key_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_key_key UNIQUE (order_key);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (attempt_answer_id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: quiz_question_answers quiz_question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_question_answers
    ADD CONSTRAINT quiz_question_answers_pkey PRIMARY KEY (answer_id);


--
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (question_id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: student_course_activities student_course_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities
    ADD CONSTRAINT student_course_activities_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_progress video_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_pkey PRIMARY KEY (id);


--
-- Name: video_progress video_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- Name: wishlist_items wishlist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (withdraw_id);


--
-- Name: idx_progress_user_course; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_progress_user_course ON public.video_progress USING btree (user_id, course_id);


--
-- Name: idx_progress_user_lesson; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX idx_progress_user_lesson ON public.video_progress USING btree (user_id, lesson_id);


--
-- Name: ix_assignment_submissions_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_assignment_submissions_id ON public.assignment_submissions USING btree (id);


--
-- Name: ix_assignments_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_assignments_id ON public.assignments USING btree (id);


--
-- Name: ix_blog_comments_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_blog_comments_id ON public.blog_comments USING btree (id);


--
-- Name: ix_blog_posts_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_blog_posts_id ON public.blog_posts USING btree (id);


--
-- Name: ix_blog_posts_slug; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX ix_blog_posts_slug ON public.blog_posts USING btree (slug);


--
-- Name: ix_certificate_element_templates_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_certificate_element_templates_id ON public.certificate_element_templates USING btree (id);


--
-- Name: ix_certificate_verifications_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_certificate_verifications_id ON public.certificate_verifications USING btree (id);


--
-- Name: ix_certificates_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_certificates_id ON public.certificates USING btree (id);


--
-- Name: ix_certificates_post_name; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_certificates_post_name ON public.certificates USING btree (post_name);


--
-- Name: ix_coupon_course_restrictions_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_coupon_course_restrictions_id ON public.coupon_course_restrictions USING btree (id);


--
-- Name: ix_coupon_usage_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_coupon_usage_id ON public.coupon_usage USING btree (id);


--
-- Name: ix_coupons_code; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX ix_coupons_code ON public.coupons USING btree (code);


--
-- Name: ix_coupons_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_coupons_id ON public.coupons USING btree (id);


--
-- Name: ix_course_announcements_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_course_announcements_id ON public.course_announcements USING btree (id);


--
-- Name: ix_course_categories_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_course_categories_id ON public.course_categories USING btree (id);


--
-- Name: ix_course_certificates_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_course_certificates_id ON public.course_certificates USING btree (id);


--
-- Name: ix_course_reviews_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_course_reviews_id ON public.course_reviews USING btree (id);


--
-- Name: ix_course_tags_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_course_tags_id ON public.course_tags USING btree (id);


--
-- Name: ix_courses_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_courses_id ON public.courses USING btree (id);


--
-- Name: ix_courses_post_name; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_courses_post_name ON public.courses USING btree (post_name);


--
-- Name: ix_earnings_earning_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_earnings_earning_id ON public.earnings USING btree (earning_id);


--
-- Name: ix_enrollments_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_enrollments_id ON public.enrollments USING btree (id);


--
-- Name: ix_instructor_profiles_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_instructor_profiles_id ON public.instructor_profiles USING btree (id);


--
-- Name: ix_instructor_reviews_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_instructor_reviews_id ON public.instructor_reviews USING btree (id);


--
-- Name: ix_issued_certificates_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_issued_certificates_id ON public.issued_certificates USING btree (id);


--
-- Name: ix_lesson_progress_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_lesson_progress_id ON public.lesson_progress USING btree (id);


--
-- Name: ix_lessons_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_lessons_id ON public.lessons USING btree (id);


--
-- Name: ix_lessons_post_name; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_lessons_post_name ON public.lessons USING btree (post_name);


--
-- Name: ix_order_items_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_order_items_id ON public.order_items USING btree (id);


--
-- Name: ix_orders_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_orders_id ON public.orders USING btree (id);


--
-- Name: ix_payments_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_payments_id ON public.payments USING btree (id);


--
-- Name: ix_quiz_attempt_answers_attempt_answer_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quiz_attempt_answers_attempt_answer_id ON public.quiz_attempt_answers USING btree (attempt_answer_id);


--
-- Name: ix_quiz_attempts_attempt_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quiz_attempts_attempt_id ON public.quiz_attempts USING btree (attempt_id);


--
-- Name: ix_quiz_question_answers_answer_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quiz_question_answers_answer_id ON public.quiz_question_answers USING btree (answer_id);


--
-- Name: ix_quiz_questions_question_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quiz_questions_question_id ON public.quiz_questions USING btree (question_id);


--
-- Name: ix_quizzes_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quizzes_id ON public.quizzes USING btree (id);


--
-- Name: ix_quizzes_post_name; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_quizzes_post_name ON public.quizzes USING btree (post_name);


--
-- Name: ix_student_course_activities_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_student_course_activities_id ON public.student_course_activities USING btree (id);


--
-- Name: ix_user_profiles_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_user_profiles_id ON public.user_profiles USING btree (id);


--
-- Name: ix_user_roles_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_user_roles_id ON public.user_roles USING btree (id);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_user_email; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX ix_users_user_email ON public.users USING btree (user_email);


--
-- Name: ix_users_user_login; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE UNIQUE INDEX ix_users_user_login ON public.users USING btree (user_login);


--
-- Name: ix_users_user_nicename; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_users_user_nicename ON public.users USING btree (user_nicename);


--
-- Name: ix_wishlist_items_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_wishlist_items_id ON public.wishlist_items USING btree (id);


--
-- Name: ix_withdrawals_withdraw_id; Type: INDEX; Schema: public; Owner: lms_user
--

CREATE INDEX ix_withdrawals_withdraw_id ON public.withdrawals USING btree (withdraw_id);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id);


--
-- Name: assignment_submissions assignment_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: assignments assignments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: assignments assignments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: blog_comments blog_comments_blog_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_blog_post_id_fkey FOREIGN KEY (blog_post_id) REFERENCES public.blog_posts(id);


--
-- Name: blog_comments blog_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_comments
    ADD CONSTRAINT blog_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: certificate_element_templates certificate_element_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_element_templates
    ADD CONSTRAINT certificate_element_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: certificate_verifications certificate_verifications_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificate_verifications
    ADD CONSTRAINT certificate_verifications_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.issued_certificates(id);


--
-- Name: certificates certificates_post_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.certificates
    ADD CONSTRAINT certificates_post_author_fkey FOREIGN KEY (post_author) REFERENCES public.users(id);


--
-- Name: coupon_course_restrictions coupon_course_restrictions_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_course_restrictions
    ADD CONSTRAINT coupon_course_restrictions_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_course_restrictions coupon_course_restrictions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_course_restrictions
    ADD CONSTRAINT coupon_course_restrictions_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: coupon_usage coupon_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id);


--
-- Name: coupon_usage coupon_usage_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: coupon_usage coupon_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: coupons coupons_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: course_announcements course_announcements_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_announcements
    ADD CONSTRAINT course_announcements_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_announcements course_announcements_post_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_announcements
    ADD CONSTRAINT course_announcements_post_author_fkey FOREIGN KEY (post_author) REFERENCES public.users(id);


--
-- Name: course_categories course_categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_categories
    ADD CONSTRAINT course_categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.course_categories(id);


--
-- Name: course_category_relations course_category_relations_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_category_relations
    ADD CONSTRAINT course_category_relations_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.course_categories(id);


--
-- Name: course_category_relations course_category_relations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_category_relations
    ADD CONSTRAINT course_category_relations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_certificates course_certificates_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_certificates
    ADD CONSTRAINT course_certificates_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.certificates(id);


--
-- Name: course_certificates course_certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_certificates
    ADD CONSTRAINT course_certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_reviews course_reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_reviews course_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_reviews
    ADD CONSTRAINT course_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: course_tag_relations course_tag_relations_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tag_relations
    ADD CONSTRAINT course_tag_relations_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: course_tag_relations course_tag_relations_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.course_tag_relations
    ADD CONSTRAINT course_tag_relations_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.course_tags(id);


--
-- Name: courses courses_post_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_post_author_fkey FOREIGN KEY (post_author) REFERENCES public.users(id);


--
-- Name: earnings earnings_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: earnings earnings_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: earnings earnings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.earnings
    ADD CONSTRAINT earnings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: enrollments enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: enrollments enrollments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: enrollments enrollments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.enrollments
    ADD CONSTRAINT enrollments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: instructor_profiles instructor_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_profiles
    ADD CONSTRAINT instructor_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: instructor_reviews instructor_reviews_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_reviews
    ADD CONSTRAINT instructor_reviews_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: instructor_reviews instructor_reviews_instructor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_reviews
    ADD CONSTRAINT instructor_reviews_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.users(id);


--
-- Name: instructor_reviews instructor_reviews_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.instructor_reviews
    ADD CONSTRAINT instructor_reviews_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id);


--
-- Name: issued_certificates issued_certificates_certificate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_certificate_id_fkey FOREIGN KEY (certificate_id) REFERENCES public.certificates(id);


--
-- Name: issued_certificates issued_certificates_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: issued_certificates issued_certificates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.issued_certificates
    ADD CONSTRAINT issued_certificates_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: lesson_progress lesson_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: lesson_progress lesson_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id);


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: lesson_progress lesson_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: lessons lessons_post_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_post_author_fkey FOREIGN KEY (post_author) REFERENCES public.users(id);


--
-- Name: lessons lessons_post_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_post_parent_fkey FOREIGN KEY (post_parent) REFERENCES public.courses(id);


--
-- Name: order_items order_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: payments payments_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: payments payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.quiz_questions(question_id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_quiz_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_quiz_attempt_id_fkey FOREIGN KEY (quiz_attempt_id) REFERENCES public.quiz_attempts(attempt_id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quiz_attempt_answers quiz_attempt_answers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempt_answers
    ADD CONSTRAINT quiz_attempt_answers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quiz_attempts quiz_attempts_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: quiz_attempts quiz_attempts_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: quiz_question_answers quiz_question_answers_belongs_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_question_answers
    ADD CONSTRAINT quiz_question_answers_belongs_question_id_fkey FOREIGN KEY (belongs_question_id) REFERENCES public.quiz_questions(question_id);


--
-- Name: quiz_questions quiz_questions_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: quizzes quizzes_post_author_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_post_author_fkey FOREIGN KEY (post_author) REFERENCES public.users(id);


--
-- Name: quizzes quizzes_post_parent_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_post_parent_fkey FOREIGN KEY (post_parent) REFERENCES public.courses(id);


--
-- Name: student_course_activities student_course_activities_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities
    ADD CONSTRAINT student_course_activities_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: student_course_activities student_course_activities_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities
    ADD CONSTRAINT student_course_activities_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id);


--
-- Name: student_course_activities student_course_activities_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities
    ADD CONSTRAINT student_course_activities_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id);


--
-- Name: student_course_activities student_course_activities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.student_course_activities
    ADD CONSTRAINT student_course_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_profiles user_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: video_progress video_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: video_progress video_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: video_progress video_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: wishlist_items wishlist_items_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id);


--
-- Name: wishlist_items wishlist_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.wishlist_items
    ADD CONSTRAINT wishlist_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: lms_user
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO lms_user;


--
-- PostgreSQL database dump complete
--

\unrestrict pnTT1OBfA9ZQ8s0AWA3BHcH45GyLd3Fe9gaqb9s6iPPjfyQTiA86dWMTJVERHbE

