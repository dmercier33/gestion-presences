--
-- PostgreSQL database dump
--

\restrict htkjqPynRylEVQUa9seT6MgEhKsnBR5V3TNWj9T5LOpmKvYPWARZWotgBnuzgk0

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: apprenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apprenants (
    id text NOT NULL,
    nom text,
    prenom text,
    groupe text,
    actif boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    qr_code text,
    groupe_id text
);


ALTER TABLE public.apprenants OWNER TO postgres;

--
-- Name: groupes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.groupes (
    id text NOT NULL,
    code text NOT NULL,
    libelle text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.groupes OWNER TO postgres;

--
-- Name: presences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presences (
    id bigint NOT NULL,
    session_id text,
    apprenant_id text,
    scan_time timestamp without time zone DEFAULT now(),
    type_scan text DEFAULT 'QR'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.presences OWNER TO postgres;

--
-- Name: presences_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.presences_id_seq OWNER TO postgres;

--
-- Name: presences_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presences_id_seq OWNED BY public.presences.id;


--
-- Name: session_apprenants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session_apprenants (
    id text NOT NULL,
    session_id text NOT NULL,
    apprenant_id text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.session_apprenants OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    token text NOT NULL,
    formation_libelle text,
    created_at timestamp without time zone DEFAULT now(),
    ended_at timestamp with time zone,
    active boolean DEFAULT true,
    created_by text,
    duration_minutes integer DEFAULT 120,
    expires_at timestamp with time zone,
    groupe_id text,
    started_at timestamp with time zone
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: presences id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presences ALTER COLUMN id SET DEFAULT nextval('public.presences_id_seq'::regclass);


--
-- Name: apprenants apprenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apprenants
    ADD CONSTRAINT apprenants_pkey PRIMARY KEY (id);


--
-- Name: groupes groupes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_code_key UNIQUE (code);


--
-- Name: groupes groupes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.groupes
    ADD CONSTRAINT groupes_pkey PRIMARY KEY (id);


--
-- Name: presences presences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_pkey PRIMARY KEY (id);


--
-- Name: presences presences_session_id_apprenant_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_session_id_apprenant_id_key UNIQUE (session_id, apprenant_id);


--
-- Name: session_apprenants session_apprenants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_apprenants
    ADD CONSTRAINT session_apprenants_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: unique_session_apprenant; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_session_apprenant ON public.session_apprenants USING btree (session_id, apprenant_id);


--
-- Name: session_apprenants fk_apprenant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_apprenants
    ADD CONSTRAINT fk_apprenant FOREIGN KEY (apprenant_id) REFERENCES public.apprenants(id) ON DELETE CASCADE;


--
-- Name: apprenants fk_apprenants_groupe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apprenants
    ADD CONSTRAINT fk_apprenants_groupe FOREIGN KEY (groupe_id) REFERENCES public.groupes(id) ON DELETE SET NULL;


--
-- Name: session_apprenants fk_session; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session_apprenants
    ADD CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: presences presences_apprenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_apprenant_id_fkey FOREIGN KEY (apprenant_id) REFERENCES public.apprenants(id);


--
-- Name: presences presences_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presences
    ADD CONSTRAINT presences_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: sessions sessions_groupe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_groupe_id_fkey FOREIGN KEY (groupe_id) REFERENCES public.groupes(id);


--
-- Name: session_apprenants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.session_apprenants ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE apprenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.apprenants TO anon;
GRANT ALL ON TABLE public.apprenants TO authenticated;
GRANT ALL ON TABLE public.apprenants TO service_role;


--
-- Name: TABLE groupes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.groupes TO anon;
GRANT ALL ON TABLE public.groupes TO authenticated;
GRANT ALL ON TABLE public.groupes TO service_role;


--
-- Name: TABLE presences; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.presences TO anon;
GRANT ALL ON TABLE public.presences TO authenticated;
GRANT ALL ON TABLE public.presences TO service_role;


--
-- Name: SEQUENCE presences_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.presences_id_seq TO anon;
GRANT ALL ON SEQUENCE public.presences_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.presences_id_seq TO service_role;


--
-- Name: TABLE session_apprenants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.session_apprenants TO anon;
GRANT ALL ON TABLE public.session_apprenants TO authenticated;
GRANT ALL ON TABLE public.session_apprenants TO service_role;


--
-- Name: TABLE sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.sessions TO anon;
GRANT ALL ON TABLE public.sessions TO authenticated;
GRANT ALL ON TABLE public.sessions TO service_role;


--
-- PostgreSQL database dump complete
--

\unrestrict htkjqPynRylEVQUa9seT6MgEhKsnBR5V3TNWj9T5LOpmKvYPWARZWotgBnuzgk0

