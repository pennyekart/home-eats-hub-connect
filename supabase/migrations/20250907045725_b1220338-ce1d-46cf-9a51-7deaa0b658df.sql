-- Drop all existing policies and create temporary development policies
DROP POLICY IF EXISTS "Temporary development access for applications" ON program_applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON program_applications;
DROP POLICY IF EXISTS "Users can view their own applications" ON program_applications;

DROP POLICY IF EXISTS "Temporary development access for requests" ON program_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON program_requests;

-- Create temporary policies for development (should be replaced with proper auth later)
CREATE POLICY "Development access for program applications" 
ON program_applications 
FOR ALL
WITH CHECK (true)
USING (true);

CREATE POLICY "Development access for program requests" 
ON program_requests 
FOR ALL
WITH CHECK (true)
USING (true);