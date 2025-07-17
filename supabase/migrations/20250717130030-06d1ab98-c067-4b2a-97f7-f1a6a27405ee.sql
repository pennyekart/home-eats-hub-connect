-- Create cash_summary table
CREATE TABLE public.cash_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cash_in_hand NUMERIC NOT NULL DEFAULT 0,
  cash_at_bank NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cash_transactions table
CREATE TABLE public.cash_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  transaction_type VARCHAR NOT NULL,
  from_date DATE,
  to_date DATE,
  remarks TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  address TEXT NOT NULL,
  ward TEXT NOT NULL,
  category_id UUID NOT NULL,
  panchayath_id UUID,
  fee_paid NUMERIC,
  status application_status DEFAULT 'pending',
  preference TEXT,
  agent_pro TEXT,
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  actual_fee NUMERIC NOT NULL DEFAULT 0,
  offer_fee NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_highlighted BOOLEAN DEFAULT false,
  preference TEXT,
  qr_image_url TEXT,
  popup_image_url TEXT,
  warning_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create panchayaths table
CREATE TABLE public.panchayaths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create application_status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Add foreign key constraints
ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.registrations 
ADD CONSTRAINT registrations_panchayath_id_fkey 
FOREIGN KEY (panchayath_id) REFERENCES public.panchayaths(id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_cash_summary_updated_at
  BEFORE UPDATE ON public.cash_summary
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_transactions_updated_at
  BEFORE UPDATE ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_panchayaths_updated_at
  BEFORE UPDATE ON public.panchayaths
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial cash summary record
INSERT INTO public.cash_summary (cash_in_hand, cash_at_bank) VALUES (0, 0);

-- Create customer_id generation trigger
CREATE OR REPLACE FUNCTION public.generate_customer_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.customer_id := 'ESEP' || NEW.mobile_number || UPPER(LEFT(NEW.name, 1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_customer_id_trigger
  BEFORE INSERT ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_customer_id();

-- Create cash update trigger for managing cash summary
CREATE OR REPLACE FUNCTION public.update_cash_summary()
RETURNS TRIGGER AS $$
BEGIN
  -- Update cash summary based on transaction type
  IF TG_TABLE_NAME = 'cash_transactions' THEN
    IF NEW.transaction_type = 'cash_transfer' THEN
      -- Deduct from cash in hand, add to cash at bank
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        cash_at_bank = cash_at_bank + NEW.amount,
        updated_at = now();
    ELSIF NEW.transaction_type = 'expense_cash' THEN
      -- Deduct from cash in hand for cash expenses
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        updated_at = now();
    END IF;

  ELSIF TG_TABLE_NAME = 'expenses' THEN
    IF NEW.payment_method = 'cash' THEN
      -- Deduct from cash in hand
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand - NEW.amount,
        updated_at = now();
    ELSIF NEW.payment_method = 'bank' THEN
      -- Deduct from cash at bank
      UPDATE public.cash_summary 
      SET 
        cash_at_bank = cash_at_bank - NEW.amount,
        updated_at = now();
    END IF;

  ELSIF TG_TABLE_NAME = 'registrations' AND NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    -- Add to cash in hand when registration is approved and fee is paid
    IF NEW.fee_paid > 0 THEN
      UPDATE public.cash_summary 
      SET 
        cash_in_hand = cash_in_hand + NEW.fee_paid,
        updated_at = now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for cash summary updates
CREATE TRIGGER update_cash_summary_from_transactions
  AFTER INSERT ON public.cash_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_summary();

CREATE TRIGGER update_cash_summary_from_expenses
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_summary();

CREATE TRIGGER update_cash_summary_from_registrations
  AFTER UPDATE ON public.registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cash_summary();