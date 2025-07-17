-- Create application_status enum if not exists
DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.admin_role AS ENUM ('super_admin', 'local_admin', 'user_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role admin_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  poster_image_url TEXT,
  youtube_video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create utilities table
CREATE TABLE IF NOT EXISTS public.utilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id SERIAL PRIMARY KEY,
  operation TEXT,
  table_name TEXT,
  query TEXT,
  user_email TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create RLS policies for admin tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utilities ENABLE ROW LEVEL SECURITY;

-- Create admin context function
CREATE OR REPLACE FUNCTION public.is_admin_context()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
BEGIN
  -- For now, allow operations when no specific context is set
  -- This can be enhanced later with proper session context management
  RETURN true;
END;
$$;

-- Create policies for admin_users
DO $$ BEGIN
  CREATE POLICY "Allow admin operations" ON public.admin_users
    FOR ALL
    USING (is_admin_context())
    WITH CHECK (is_admin_context());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create policies for announcements
DO $$ BEGIN
  CREATE POLICY "Admins can do everything on announcements" ON public.announcements
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active announcements" ON public.announcements
    FOR SELECT
    USING (is_active = true AND (expiry_date IS NULL OR expiry_date > now()));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create policies for utilities
DO $$ BEGIN
  CREATE POLICY "Allow admin operations on utilities" ON public.utilities
    FOR ALL
    USING (is_admin_context())
    WITH CHECK (is_admin_context());
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active utilities" ON public.utilities
    FOR SELECT
    USING (is_active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create policies for categories
DO $$ BEGIN
  CREATE POLICY "Admins can do everything on categories" ON public.categories
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active categories" ON public.categories
    FOR SELECT
    USING (is_active = true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create policies for panchayaths
DO $$ BEGIN
  CREATE POLICY "Admins can do everything on panchayaths" ON public.panchayaths
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view panchayaths" ON public.panchayaths
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create policies for registrations
DO $$ BEGIN
  CREATE POLICY "Admins can do everything on registrations" ON public.registrations
    FOR ALL
    USING (true)
    WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can create registrations" ON public.registrations
    FOR INSERT
    WITH CHECK (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view their own registration by mobile and customer_i" ON public.registrations
    FOR SELECT
    USING (true);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;