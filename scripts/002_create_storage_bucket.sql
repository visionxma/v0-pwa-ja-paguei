-- JaPaguei - Storage Bucket for Bill Attachments
-- 002_create_storage_bucket.sql
-- Run this in your Supabase SQL Editor

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bill-attachments',
  'bill-attachments',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: authenticated users can upload files to their own folder
CREATE POLICY "Users can upload their own attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bill-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: anyone can view (public bucket)
CREATE POLICY "Public read access for bill attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'bill-attachments');

-- Policy: users can delete their own files
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'bill-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS for bill_attachments table
ALTER TABLE public.bill_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments of their bills"
ON public.bill_attachments FOR SELECT
TO authenticated
USING (
  uploaded_by = auth.uid()
  OR bill_id IN (
    SELECT id FROM public.bills WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own attachments"
ON public.bill_attachments FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete their own attachments"
ON public.bill_attachments FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());
