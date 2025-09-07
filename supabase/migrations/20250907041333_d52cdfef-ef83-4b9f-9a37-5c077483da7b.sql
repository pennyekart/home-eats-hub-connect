-- Create program applications table
CREATE TABLE public.program_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  status character varying NOT NULL DEFAULT 'pending',
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.program_applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own applications" 
ON public.program_applications 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own applications" 
ON public.program_applications 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own applications" 
ON public.program_applications 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create requests table for cancel/multi-program requests
CREATE TABLE public.program_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  request_type character varying NOT NULL, -- 'cancel' or 'multi-program'
  status character varying NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.program_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for requests table
CREATE POLICY "Users can view their own requests" 
ON public.program_requests 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own requests" 
ON public.program_requests 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- Add trigger for automatic timestamp updates on applications
CREATE TRIGGER update_program_applications_updated_at
BEFORE UPDATE ON public.program_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for automatic timestamp updates on requests
CREATE TRIGGER update_program_requests_updated_at
BEFORE UPDATE ON public.program_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();