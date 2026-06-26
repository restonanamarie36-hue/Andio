-- Add CHECK constraints for data integrity
ALTER TABLE projects ADD CONSTRAINT projects_bpm_check CHECK (bpm >= 40 AND bpm <= 240);
ALTER TABLE projects ADD CONSTRAINT projects_name_check CHECK (length(name) > 0 AND length(name) <= 200);

-- Add NOT NULL to user_id
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE TRIGGER projects_set_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Revoke execute on the trigger function from API roles
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;