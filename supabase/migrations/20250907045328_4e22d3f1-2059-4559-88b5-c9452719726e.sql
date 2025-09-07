-- Temporarily allow anyone to insert program applications for development
-- This should be restricted once authentication is properly implemented
DROP POLICY IF EXISTS "Users can create their own applications" ON program_applications;
DROP POLICY IF EXISTS "Users can insert own program applications" ON program_applications;

-- Create temporary policy that allows inserts with placeholder user ID for development
CREATE POLICY "Temporary development access for applications" 
ON program_applications 
FOR INSERT 
WITH CHECK (true);

-- Also allow temporary development access for program requests
DROP POLICY IF EXISTS "Users can create their own requests" ON program_requests;

CREATE POLICY "Temporary development access for requests" 
ON program_requests 
FOR INSERT 
WITH CHECK (true);