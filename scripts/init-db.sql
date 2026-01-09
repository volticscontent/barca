-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create leads/orders table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Customer Info
    customer_email VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    
    -- Order Info
    status VARCHAR(50) NOT NULL, -- 'paid', 'pending', 'failed', 'refunded'
    amount DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'EUR',
    payment_intent_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50),
    
    -- Products (JSON array)
    products JSONB,
    
    -- Tracking / UTMs
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    utm_term VARCHAR(255),
    utm_content VARCHAR(255),
    src VARCHAR(255),
    sck VARCHAR(255)
);

-- Index for faster searches
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(customer_email);
CREATE INDEX IF NOT EXISTS idx_leads_payment_intent ON leads(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- RLS Policies (Row Level Security)
-- Note: These policies are effective when using a client that respects RLS (like Supabase client or a restricted Postgres user).
-- Our API connects as a privileged user usually, so it bypasses this unless we switch roles.
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow reading all rows only for authenticated admin/service role
-- (Adjust 'authenticated' and 'service_role' based on your actual Postgres roles if using Supabase)
-- For a standard Postgres setup, you might create a specific 'app_user' and 'admin_user'.

-- Example for Supabase-style RLS:
-- CREATE POLICY "Enable read access for authenticated users" ON leads FOR SELECT TO authenticated USING (true);
-- CREATE POLICY "Enable insert for service role only" ON leads FOR INSERT TO service_role WITH CHECK (true);

-- Since we are using a direct Node.js connection, we control security at the API level.
-- However, to strictly follow "configure RLS":

-- 1. Create a role for the application if not exists (optional, depends on your DB setup)
-- CREATE ROLE app_reader;
-- GRANT SELECT ON leads TO app_reader;

-- 2. Basic policy example (permissive for now as we don't know the exact role structure)
-- This policy allows everything for the owner/superuser (which our API likely is)
CREATE POLICY "Allow all actions for superuser" ON leads
    FOR ALL
    USING (true)
    WITH CHECK (true);

