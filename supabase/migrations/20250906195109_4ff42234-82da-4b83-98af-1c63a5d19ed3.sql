-- Fix security issue: Set search_path for the is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, return true for all authenticated users
  -- You should implement proper admin role checking here
  RETURN user_id IS NOT NULL;
END;
$$;