-- Portal-scoped activation/deactivation for shared Supabase databases.
-- Run this once in the Supabase SQL Editor for an existing database.

CREATE TABLE IF NOT EXISTS public.portal_user_access (
  portal_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (portal_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_portal_user_access_portal ON public.portal_user_access(portal_id);
CREATE INDEX IF NOT EXISTS idx_portal_user_access_user ON public.portal_user_access(user_id);

ALTER TABLE public.portal_user_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own portal access" ON public.portal_user_access;
DROP POLICY IF EXISTS "Users can join a portal as active" ON public.portal_user_access;
DROP POLICY IF EXISTS "Admins can update portal access" ON public.portal_user_access;

CREATE POLICY "Users can view own portal access" ON public.portal_user_access FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can join a portal as active" ON public.portal_user_access FOR INSERT WITH CHECK (
  auth.uid() = user_id AND is_active = TRUE
);

CREATE POLICY "Admins can update portal access" ON public.portal_user_access FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_portal_user_access_updated_at ON public.portal_user_access;
CREATE TRIGGER update_portal_user_access_updated_at
  BEFORE UPDATE ON public.portal_user_access
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Optional: enroll selected existing users into this portal.
-- Replace the portal id and WHERE clause before running.
-- INSERT INTO public.portal_user_access (portal_id, user_id, is_active)
-- SELECT 'cybersphere-blog', id, TRUE
-- FROM public.users
-- WHERE email IN ('admin@example.com')
-- ON CONFLICT (portal_id, user_id) DO NOTHING;
