-- Manual hotfix: create the blog objects on the production DB.
--
-- Why this exists: the blog was added in migrations 0002 + 0003, but the host DB
-- is firewalled to dev machines, so migrations are applied by hand (see
-- MAINTENANCE.md §4). If launch only applied 0000/0001, the `posts` table and
-- `post_status` enum are missing, so `/blog` 500s with "relation posts does not
-- exist". This creates them.
--
-- NOTE: no dollar-quoted DO blocks here — some web SQL runners mis-parse them.
-- Run the two statements below. If step 1 says the type "already exists", that is
-- fine — just skip it and run step 2.
--
-- HOW TO RUN: open your DB's SQL query box for the `senaycre_senaypage` database,
-- paste this, run it. Then reload https://senaycreatives.com/blog.

-- 1) The post_status enum (draft | published).
CREATE TYPE public.post_status AS ENUM ('draft', 'published');

-- 2) The posts table (matches db/schema.ts, including the Amharic columns and the
--    author_id -> users foreign key).
CREATE TABLE IF NOT EXISTS public.posts (
  "id"           uuid PRIMARY KEY NOT NULL,
  "created_at"   timestamptz DEFAULT now() NOT NULL,
  "updated_at"   timestamptz DEFAULT now() NOT NULL,
  "slug"         text NOT NULL,
  "title"        text NOT NULL,
  "excerpt"      text,
  "content"      text NOT NULL,
  "title_am"     text,
  "excerpt_am"   text,
  "content_am"   text,
  "cover"        text,
  "status"       public.post_status DEFAULT 'draft' NOT NULL,
  "published_at" timestamptz,
  "author_id"    uuid REFERENCES public.users("id") ON DELETE SET NULL,
  CONSTRAINT "posts_slug_unique" UNIQUE ("slug")
);
