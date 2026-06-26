-- rls_auto_enable() is an event trigger helper that auto-enables RLS on new tables.
-- It should only be invoked by the event trigger (running as owner), never by API clients.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;