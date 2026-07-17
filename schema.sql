-- ============================================================
-- كُتُبي (Kutubi) - Egyptian Student Book Marketplace
-- Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT,
  phone         TEXT,
  whatsapp      TEXT,
  governorate   TEXT,
  city          TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_governorate ON public.profiles(governorate);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- ============================================================
-- BOOKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.books (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  subject       TEXT NOT NULL,          -- e.g., Arabic, English, Physics
  grade         TEXT NOT NULL,          -- 1st, 2nd, 3rd Secondary
  track         TEXT NOT NULL,          -- 'عام عربي' or 'لغات وتجريبي'
  publisher     TEXT NOT NULL,          -- El-Moasser, El-Kayan, etc.
  condition     TEXT NOT NULL,          -- جديد, مستعمل بشكل خفيف, مستعمل, قديم
  price         NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0 AND price <= 100),
  is_free       BOOLEAN DEFAULT FALSE NOT NULL,
  image_url     TEXT,
  description   TEXT,
  governorate   TEXT NOT NULL,          -- القليوبية, القاهرة, الجيزة, etc.
  city          TEXT NOT NULL,          -- بنها, طوخ, etc.
  delivery      TEXT NOT NULL DEFAULT 'pickup', -- 'pickup' or 'shipping'
  is_sold       BOOLEAN DEFAULT FALSE NOT NULL,
  views_count   INTEGER DEFAULT 0 NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for fast search/filtering
CREATE INDEX IF NOT EXISTS idx_books_seller_id    ON public.books(seller_id);
CREATE INDEX IF NOT EXISTS idx_books_subject      ON public.books(subject);
CREATE INDEX IF NOT EXISTS idx_books_grade        ON public.books(grade);
CREATE INDEX IF NOT EXISTS idx_books_track        ON public.books(track);
CREATE INDEX IF NOT EXISTS idx_books_publisher    ON public.books(publisher);
CREATE INDEX IF NOT EXISTS idx_books_governorate  ON public.books(governorate);
CREATE INDEX IF NOT EXISTS idx_books_city         ON public.books(city);
CREATE INDEX IF NOT EXISTS idx_books_price        ON public.books(price);
CREATE INDEX IF NOT EXISTS idx_books_is_free      ON public.books(is_free);
CREATE INDEX IF NOT EXISTS idx_books_is_sold      ON public.books(is_sold);
CREATE INDEX IF NOT EXISTS idx_books_created_at   ON public.books(created_at DESC);

-- Full-text search index (Arabic-aware)
CREATE INDEX IF NOT EXISTS idx_books_fts ON public.books
  USING gin(to_tsvector('arabic', coalesce(title,'') || ' ' || coalesce(subject,'') || ' ' || coalesce(publisher,'')));

-- ============================================================
-- CONVERSATIONS (chat rooms between buyer and seller per book)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id       UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  buyer_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(book_id, buyer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_book_id   ON public.conversations(book_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id  ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON public.conversations(seller_id);

-- ============================================================
-- MESSAGES (real-time chat messages)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content         TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT FALSE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id       ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at      ON public.messages(created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages     ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- BOOKS policies
CREATE POLICY "Books are viewable by everyone"
  ON public.books FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create books"
  ON public.books FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own books"
  ON public.books FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own books"
  ON public.books FOR DELETE USING (auth.uid() = seller_id);

-- CONVERSATIONS policies
CREATE POLICY "Participants can view their conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- MESSAGES policies
CREATE POLICY "Conversation participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON public.messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- TRIGGER: update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- REALTIME: enable for messages and conversations
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- ============================================================
-- STORAGE: bucket for book images
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-images', 'book-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can view book images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-images');

CREATE POLICY "Authenticated users can upload book images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'book-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own book images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'book-images' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own book images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'book-images' AND auth.uid() = owner);
