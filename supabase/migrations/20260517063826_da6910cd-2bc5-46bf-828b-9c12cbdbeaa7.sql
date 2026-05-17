
-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_user_created ON public.documents (user_id, created_at DESC);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select_own" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "documents_insert_own" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "documents_update_own" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "documents_delete_own" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Company profiles (one per user)
CREATE TABLE public.company_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hr_manager_name TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profile_select_own" ON public.company_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profile_insert_own" ON public.company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_update_own" ON public.company_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "profile_delete_own" ON public.company_profiles FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_company_profiles_updated_at
BEFORE UPDATE ON public.company_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for company logos
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-logos');

CREATE POLICY "logos_owner_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "logos_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "logos_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'company-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
