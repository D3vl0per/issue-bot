-- Table: public.guilds

-- DROP TABLE IF EXISTS public.guilds;

CREATE TABLE IF NOT EXISTS public.guilds
(
    guild_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    channel_id character varying(255) COLLATE pg_catalog."default",
    project_id character varying(255) COLLATE pg_catalog."default",
    repo_owner character varying(255) COLLATE pg_catalog."default",
    repo_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT guilds_pkey PRIMARY KEY (guild_id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.guilds
    OWNER to sync;