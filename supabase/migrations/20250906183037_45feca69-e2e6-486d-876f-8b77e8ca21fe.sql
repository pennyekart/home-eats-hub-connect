-- Add admin policies for employment categories management
CREATE POLICY "Admins can manage employment categories" 
ON public.employment_categories 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add admin policies for sub projects management
CREATE POLICY "Admins can manage sub projects" 
ON public.sub_projects 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create admin function to check if user is admin (placeholder - you'll need to implement admin role logic)
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- For now, return true for all authenticated users
  -- You should implement proper admin role checking here
  RETURN user_id IS NOT NULL;
END;
$$;