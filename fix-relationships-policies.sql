-- Fix RLS policies for relationships table
-- Run this in your Supabase SQL editor

-- First, drop any existing policies
DROP POLICY IF EXISTS "Users can view own relationships" ON relationships;
DROP POLICY IF EXISTS "Users can insert own relationships" ON relationships;
DROP POLICY IF EXISTS "Users can update own relationships" ON relationships;
DROP POLICY IF EXISTS "Users can delete own relationships" ON relationships;

-- Enable RLS on relationships table
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "Users can view own relationships" ON relationships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own relationships" ON relationships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relationships" ON relationships
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own relationships" ON relationships
    FOR DELETE USING (auth.uid() = user_id);

-- Verify the table structure (optional - just for checking)
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'relationships' 
ORDER BY ordinal_position; 