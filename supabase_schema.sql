-- BodyCount Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    lang CHAR(2) DEFAULT 'en',
    subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'standard', 'premium')),
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships table
DROP TABLE IF EXISTS relationships CASCADE;
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Romantique', 'Sexuelle', 'Amitié', 'Friendzone', 'Autre')),
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    location TEXT,
    feelings TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    private_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('partner', 'place', 'advice')),
    content JSONB NOT NULL,
    generated_by_ai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_price_id TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Self reflection table (Le Miroir)
CREATE TABLE IF NOT EXISTS self_reflection (
    id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('self', 'others', 'growth')),
    title TEXT NOT NULL,
    items TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_reflection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for relationships table
DROP POLICY IF EXISTS "Users can view own relationships" ON relationships;
CREATE POLICY "Users can view own relationships" ON relationships
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own relationships" ON relationships;
CREATE POLICY "Users can insert own relationships" ON relationships
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own relationships" ON relationships;
CREATE POLICY "Users can update own relationships" ON relationships
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own relationships" ON relationships;
CREATE POLICY "Users can delete own relationships" ON relationships
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for recommendations table
DROP POLICY IF EXISTS "Users can view own recommendations" ON recommendations;
CREATE POLICY "Users can view own recommendations" ON recommendations
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own recommendations" ON recommendations;
CREATE POLICY "Users can insert own recommendations" ON recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own recommendations" ON recommendations;
CREATE POLICY "Users can update own recommendations" ON recommendations
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own recommendations" ON recommendations;
CREATE POLICY "Users can delete own recommendations" ON recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subscriptions table
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for self_reflection table
DROP POLICY IF EXISTS "Users can view own reflections" ON self_reflection;
CREATE POLICY "Users can view own reflections" ON self_reflection
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own reflections" ON self_reflection;
CREATE POLICY "Users can insert own reflections" ON self_reflection
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reflections" ON self_reflection;
CREATE POLICY "Users can update own reflections" ON self_reflection
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own reflections" ON self_reflection;
CREATE POLICY "Users can delete own reflections" ON self_reflection
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_self_reflection_user_id ON self_reflection(user_id);
CREATE INDEX IF NOT EXISTS idx_self_reflection_type ON self_reflection(type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS '
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
' LANGUAGE 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_self_reflection_updated_at
    BEFORE UPDATE ON self_reflection
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Wishlist types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wishlist_cat') THEN
        CREATE TYPE wishlist_cat AS ENUM ('experience', 'person', 'place', 'goal');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level') THEN
        CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
    END IF;
END
$$;

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category wishlist_cat NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority priority_level DEFAULT 'medium',
    target_date DATE,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    image_url TEXT
);

-- Wishlist shares table
CREATE TABLE IF NOT EXISTS wishlist_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on wishlist tables
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist table
DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own wishlist" ON wishlist;
CREATE POLICY "Users can insert own wishlist" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own wishlist" ON wishlist;
CREATE POLICY "Users can update own wishlist" ON wishlist
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own wishlist" ON wishlist;
CREATE POLICY "Users can delete own wishlist" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wishlist_shares table
DROP POLICY IF EXISTS "Users can view own shares" ON wishlist_shares;
CREATE POLICY "Users can view own shares" ON wishlist_shares
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own shares" ON wishlist_shares;
CREATE POLICY "Users can insert own shares" ON wishlist_shares
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own shares" ON wishlist_shares;
CREATE POLICY "Users can update own shares" ON wishlist_shares
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own shares" ON wishlist_shares;
CREATE POLICY "Users can delete own shares" ON wishlist_shares
    FOR DELETE USING (auth.uid() = user_id);

-- Public access for shared wishlists
DROP POLICY IF EXISTS "Public can view shared wishlists" ON wishlist_shares;
CREATE POLICY "Public can view shared wishlists" ON wishlist_shares
    FOR SELECT USING (expires_at IS NULL OR expires_at > NOW());

-- Indexes for wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_category ON wishlist(category);
CREATE INDEX IF NOT EXISTS idx_wishlist_completed ON wishlist(is_completed);
CREATE INDEX IF NOT EXISTS idx_wishlist_priority ON wishlist(priority);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_slug ON wishlist_shares(slug);
CREATE INDEX IF NOT EXISTS idx_wishlist_shares_expires ON wishlist_shares(expires_at);

-- Memory types
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'memory_kind') THEN
        CREATE TYPE memory_kind AS ENUM ('photo', 'video', 'note');
    END IF;
END
$$;

-- Relation memories table
CREATE TABLE IF NOT EXISTS relation_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relation_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind memory_kind NOT NULL,
    title TEXT,
    description TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Memory shares table
CREATE TABLE IF NOT EXISTS memory_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    memory_id UUID NOT NULL REFERENCES relation_memories(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on memory tables
ALTER TABLE relation_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for relation_memories table
DROP POLICY IF EXISTS "Users can view own memories" ON relation_memories;
CREATE POLICY "Users can view own memories" ON relation_memories
    FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own memories" ON relation_memories;
CREATE POLICY "Users can insert own memories" ON relation_memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own memories" ON relation_memories;
CREATE POLICY "Users can update own memories" ON relation_memories
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own memories" ON relation_memories;
CREATE POLICY "Users can delete own memories" ON relation_memories
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for memory_shares table
DROP POLICY IF EXISTS "Users can view own memory shares" ON memory_shares;
CREATE POLICY "Users can view own memory shares" ON memory_shares
    FOR SELECT USING (EXISTS (
        SELECT 1
        FROM relation_memories rm
        WHERE rm.id = memory_shares.memory_id AND rm.user_id = auth.uid()
    ));
DROP POLICY IF EXISTS "Users can manage own memory shares" ON memory_shares;
CREATE POLICY "Users can manage own memory shares" ON memory_shares
    FOR ALL USING (EXISTS (
        SELECT 1
        FROM relation_memories rm
        WHERE rm.id = memory_shares.memory_id AND rm.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1
        FROM relation_memories rm
        WHERE rm.id = memory_shares.memory_id AND rm.user_id = auth.uid()
    ));

-- Public access to shared memories
DROP POLICY IF EXISTS "Public can view shared memories" ON relation_memories;
CREATE POLICY "Public can view shared memories" ON relation_memories
    FOR SELECT USING (EXISTS (
        SELECT 1
        FROM memory_shares ms
        WHERE ms.memory_id = relation_memories.id AND (ms.expires_at IS NULL OR ms.expires_at > NOW())
    ));

-- Create indexes for memory tables
CREATE INDEX IF NOT EXISTS idx_relation_memories_relation_id ON relation_memories(relation_id);
CREATE INDEX IF NOT EXISTS idx_relation_memories_user_id ON relation_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_relation_memories_kind ON relation_memories(kind);
CREATE INDEX IF NOT EXISTS idx_relation_memories_created_at ON relation_memories(created_at);
CREATE INDEX IF NOT EXISTS idx_memory_shares_slug ON memory_shares(slug);
CREATE INDEX IF NOT EXISTS idx_memory_shares_expires ON memory_shares(expires_at);
