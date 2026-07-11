-- Manual hotfix: create the blog objects on the production DB.
--
-- Why this exists: the blog was added in migrations 0002 + 0003, but the host DB
-- is firewalled to dev machines, so migrations are applied by hand in phpPgAdmin
-- (see MAINTENANCE.md §4). If launch only applied 0000/0001, the `posts` table and
-- `post_status` enum are missing, so `/blog` 500s with "relation posts does not
-- exist". This script creates them.
--
-- Safe to run more than once: every statement is guarded (idempotent). It only
-- creates the blog objects — it does NOT touch any existing table or data.
--
-- HOW TO RUN: cPanel -> phpPgAdmin -> select the `senaycre_senaypage` database ->
-- SQL tab -> paste this whole file -> Execute. Then reload https://senaycreatives.com/blog.

-- 1) post_status enum (draft | published)
DO $$ BEGIN
  CREATE TYPE public.post_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2) posts table (matches db/schema.ts after migrations 0002 + 0003)
CREATE TABLE IF NOT EXISTS public.posts (
  "id"           uuid PRIMARY KEY NOT NULL,
  "created_at"   timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at"   timestamp with time zone DEFAULT now() NOT NULL,
  "slug"         text NOT NULL,
  "title"        text NOT NULL,
  "excerpt"      text,
  "content"      text NOT NULL,
  "title_am"     text,
  "excerpt_am"   text,
  "content_am"   text,
  "cover"        text,
  "status"       public.post_status DEFAULT 'draft' NOT NULL,
  "published_at" timestamp with time zone,
  "author_id"    uuid,
  CONSTRAINT "posts_slug_unique" UNIQUE ("slug")
);

-- 3) Amharic columns — in case `posts` already existed from 0002 but 0003 (the
--    Amharic columns) was never applied.
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "title_am"   text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "excerpt_am" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "content_am" text;

-- 4) author_id -> users(id) foreign key (only if `users` exists and the FK is not
--    already present).
DO $$ BEGIN
  IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
     )
     AND NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_schema = 'public' AND constraint_name = 'posts_author_id_users_id_fk'
     )
  THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT "posts_author_id_users_id_fk"
      FOREIGN KEY ("author_id") REFERENCES public.users("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
