-- 2026-07-18_fix_posts_columns.sql — run in phpPgAdmin (as `senaycre`)
-- on database senaycre_senaypage. Idempotent; safe to re-run.
--
-- WHY: the live /blog 500s while /admin/blog works. The prod `posts` table was
-- created from an older script, so the newer columns are missing; the public
-- pages select them (title_am/excerpt_am for the Amharic toggle, cover for
-- cards) and die with undefined_column. The app user can't ALTER (not owner),
-- hence this manual paste. 2026-07-11_blog_tables.sql only had
-- CREATE TABLE IF NOT EXISTS, which no-ops when the table already exists.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "excerpt" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "title_am" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "excerpt_am" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "content_am" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "cover" text;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now() NOT NULL;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "published_at" timestamptz;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS "author_id" uuid;
DO $$ BEGIN ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_users_id_fk
  FOREIGN KEY ("author_id") REFERENCES public.users("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- App user must be able to use it (no-op if fix-grants-shared-hosting.sql ran)
GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON public.posts TO senaycre_maina;

-- Verify: should list all of the above
SELECT column_name FROM information_schema.columns
  WHERE table_name = 'posts' ORDER BY ordinal_position;
