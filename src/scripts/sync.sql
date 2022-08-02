-- Table: public.sync

-- DROP TABLE IF EXISTS public.sync;

-- CREATE

CREATE TABLE IF NOT EXISTS public.sync
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    guild_id character varying(255) COLLATE pg_catalog."default",
    channel_id character varying(255) COLLATE pg_catalog."default",
    project_id character varying(255) COLLATE pg_catalog."default",
    repo_owner character varying(255) COLLATE pg_catalog."default",
    repo_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT sync_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.sync
    OWNER to sync;

-- DELETE

DELETE FROM public.sync
	WHERE <condition>;

-- INSERT

INSERT INTO public.sync(
	id, guild_id, channel_id, project_id, repo_owner, repo_name)
	VALUES (?, ?, ?, ?, ?, ?);


-- SELECT

SELECT id, guild_id, channel_id, project_id, repo_owner, repo_name
	FROM public.sync;

-- UPDATE

UPDATE public.sync
	SET id=?, guild_id=?, channel_id=?, project_id=?, repo_owner=?, repo_name=?
	WHERE <condition>;