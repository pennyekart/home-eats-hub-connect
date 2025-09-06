-- Clear existing employment categories and sub-projects
DELETE FROM sub_projects;
DELETE FROM employment_categories;

-- Insert categories from external database with exact same IDs (excluding job card)
INSERT INTO employment_categories (id, name, display_name, description) VALUES
('d12081e7-845b-4248-9cbf-6cdfbc899feb', 'entrelife', 'Entrelife', 'തയ്യൽ പോലുള്ള കൈത്തൊഴിലുകളിൽ ഈ - ലൈഫ് സൊസൈറ്റി നടപ്പാക്കുന്ന പദ്ധതികളുടെ ഭാഗമാകാൻ എൻട്രി ലൈഫിൽ രജിസ്റ്റർ ചെയ്താൽ മതി'),
('2f1042b6-f017-439f-8035-5da9a8c931f8', 'foodelife', 'Foodelife', 'ഭക്ഷ്യ സംസ്കരണം ഭക്ഷ്യ ഉല്പന്നങ്ങൾ എന്നീ മേഖലയുമായി ബന്ധപ്പെട്ട് E-life സൊസൈറ്റി നടപ്പാക്കുന്ന പദ്ധതികളിൽ ഭാഗമാകാൻ ഫുഡ് ലൈഫിൽ രജിസ്റ്റർ ചെയ്താൽ മതി'),
('a25901a6-ec25-4b15-a0d6-a1e6daf6740d', 'organelife', 'Organelife', 'വീട്ടിലെ കൃഷി ടെറസിലെ കൃഷി എന്നീ മേഖലകളിൽ E-life സൊസൈറ്റി നടപ്പാക്കുന്ന പദ്ധതികളിൽ ഭാഗമാകാൻ ഓർഗാനി ലൈഫിൽ രജിസ്റ്റർ ചെയ്താൽ മതി'),
('f6c1eb48-523f-4e9b-a1d3-ad8111c7501a', 'farmelife', 'Farmelife', 'കന്നുകാലി വളർത്തൽ കോഴിവളർത്തൽ പോലുള്ള മേഖലകളിൽ E-life സൊസൈറ്റി മുന്നോട്ട് വെയ്ക്കുന്ന പദ്ധതികളിൽ ഭാഗമാകാൻ ഫാമി ലൈഫിൽ രജിസ്റ്റർ ചെയ്യാവുന്നതാണ്');

-- Insert relevant sub-projects for these categories
INSERT INTO sub_projects (category_id, name, display_name, description) VALUES
-- Entrelife sub-projects
('d12081e7-845b-4248-9cbf-6cdfbc899feb', 'tailoring', 'തയ്യൽ', 'Tailoring and garment making'),
('d12081e7-845b-4248-9cbf-6cdfbc899feb', 'handicrafts', 'കരകൗശല', 'Handicrafts and artisan work'),
('d12081e7-845b-4248-9cbf-6cdfbc899feb', 'small_business', 'ചെറുകിട ബിസിനസ്', 'Small scale business opportunities'),

-- Foodelife sub-projects  
('2f1042b6-f017-439f-8035-5da9a8c931f8', 'food_processing', 'ഭക്ഷ്യ സംസ്കരണം', 'Food processing and packaging'),
('2f1042b6-f017-439f-8035-5da9a8c931f8', 'bakery', 'ബേക്കറി', 'Bakery and confectionery'),
('2f1042b6-f017-439f-8035-5da9a8c931f8', 'catering', 'കാറ്ററിംഗ്', 'Catering and event services'),

-- Organelife sub-projects
('a25901a6-ec25-4b15-a0d6-a1e6daf6740d', 'home_gardening', 'വീട്ടുകൃഷി', 'Home gardening and kitchen gardens'),
('a25901a6-ec25-4b15-a0d6-a1e6daf6740d', 'terrace_farming', 'ടെറസ് കൃഷി', 'Terrace and rooftop farming'),
('a25901a6-ec25-4b15-a0d6-a1e6daf6740d', 'organic_products', 'ജൈവ ഉത്പാദനങ്ങൾ', 'Organic product manufacturing'),

-- Farmelife sub-projects
('f6c1eb48-523f-4e9b-a1d3-ad8111c7501a', 'dairy_farming', 'പാൽ ഉത്പാദനം', 'Dairy farming and milk production'),
('f6c1eb48-523f-4e9b-a1d3-ad8111c7501a', 'poultry_farming', 'കോഴി വളർത്തൽ', 'Poultry farming and egg production'),
('f6c1eb48-523f-4e9b-a1d3-ad8111c7501a', 'goat_farming', 'ആട് വളർത്തൽ', 'Goat farming and meat production');