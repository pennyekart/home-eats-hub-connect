-- Create employment categories table
CREATE TABLE public.employment_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sub projects table
CREATE TABLE public.sub_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.employment_categories(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create programs table to store user programs
CREATE TABLE public.programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  qualifications TEXT,
  category_id UUID NOT NULL REFERENCES public.employment_categories(id),
  sub_project_id UUID REFERENCES public.sub_projects(id),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Create policies for employment categories (public read)
CREATE POLICY "Anyone can view employment categories" 
ON public.employment_categories 
FOR SELECT 
USING (true);

-- Create policies for sub projects (public read)
CREATE POLICY "Anyone can view sub projects" 
ON public.sub_projects 
FOR SELECT 
USING (true);

-- Create policies for programs (users can manage their own)
CREATE POLICY "Users can view their own programs" 
ON public.programs 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own programs" 
ON public.programs 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own programs" 
ON public.programs 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own programs" 
ON public.programs 
FOR DELETE 
USING (auth.uid()::text = user_id::text);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employment_categories_updated_at
BEFORE UPDATE ON public.employment_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sub_projects_updated_at
BEFORE UPDATE ON public.sub_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample employment categories
INSERT INTO public.employment_categories (name, display_name, description) VALUES
('farmelife', 'ഫാം ലൈഫ്', 'Agriculture and farming related opportunities'),
('entrelife', 'എന്ട്രി ലൈഫ്', 'Entrepreneurship and business opportunities'),
('organelife', 'ഓർഗാനിക് ലൈഫ്', 'Organic and eco-friendly business opportunities'),
('foodelife', 'ഫുഡ് ലൈഫ്', 'Food and catering related opportunities');

-- Insert sample sub projects
INSERT INTO public.sub_projects (category_id, name, display_name, description) VALUES
-- Farmelife sub projects
((SELECT id FROM public.employment_categories WHERE name = 'farmelife'), 'organic_farming', 'ജൈവ കൃഷി', 'Organic farming methods and practices'),
((SELECT id FROM public.employment_categories WHERE name = 'farmelife'), 'dairy_farming', 'പാല് ഉത്പാദനം', 'Dairy farming and milk production'),
((SELECT id FROM public.employment_categories WHERE name = 'farmelife'), 'poultry_farming', 'കോഴി വളർത്തൽ', 'Poultry farming and egg production'),
((SELECT id FROM public.employment_categories WHERE name = 'farmelife'), 'fish_farming', 'മീൻ വളർത്തൽ', 'Aquaculture and fish farming'),

-- Entrelife sub projects
((SELECT id FROM public.employment_categories WHERE name = 'entrelife'), 'small_business', 'ചെറുകിട ബിസിനസ്', 'Small scale business opportunities'),
((SELECT id FROM public.employment_categories WHERE name = 'entrelife'), 'online_store', 'ഓൺലൈൻ സ്റ്റോർ', 'E-commerce and online business'),
((SELECT id FROM public.employment_categories WHERE name = 'entrelife'), 'service_business', 'സേവന ബിസിനസ്', 'Service based business opportunities'),
((SELECT id FROM public.employment_categories WHERE name = 'entrelife'), 'consulting', 'കൺസൾട്ടിംഗ്', 'Consulting and advisory services'),

-- Organelife sub projects
((SELECT id FROM public.employment_categories WHERE name = 'organelife'), 'organic_products', 'ജൈവ ഉത്പാദനങ്ങൾ', 'Organic product manufacturing'),
((SELECT id FROM public.employment_categories WHERE name = 'organelife'), 'natural_medicine', 'പ്രകൃതി വൈദ്യം', 'Natural and herbal medicine'),
((SELECT id FROM public.employment_categories WHERE name = 'organelife'), 'eco_farming', 'പരിസ്ഥിതി കൃഷി', 'Environment friendly farming'),
((SELECT id FROM public.employment_categories WHERE name = 'organelife'), 'green_energy', 'ഹരിത ഊർജം', 'Renewable energy solutions'),

-- Foodelife sub projects
((SELECT id FROM public.employment_categories WHERE name = 'foodelife'), 'restaurant', 'റെസ്റ്റോറന്റ്', 'Restaurant and dining services'),
((SELECT id FROM public.employment_categories WHERE name = 'foodelife'), 'catering', 'കാറ്ററിംഗ്', 'Catering and event services'),
((SELECT id FROM public.employment_categories WHERE name = 'foodelife'), 'food_processing', 'ഭക്ഷ്യ സംസ്കരണം', 'Food processing and packaging'),
((SELECT id FROM public.employment_categories WHERE name = 'foodelife'), 'bakery', 'ബേക്കറി', 'Bakery and confectionery');