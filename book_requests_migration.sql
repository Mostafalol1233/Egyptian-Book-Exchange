-- ============================================================
-- كُتُبي — Book Requests table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

CREATE TABLE IF NOT EXISTS book_requests (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id  uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         text        NOT NULL,
  subject       text,
  grade         text,
  governorate   text,
  whatsapp      text        NOT NULL,
  notes         text,
  max_price     integer,
  is_fulfilled  boolean     DEFAULT false NOT NULL,
  created_at    timestamptz DEFAULT now() NOT NULL
);

-- Join profiles so we can show requester name / avatar
-- (profiles table is already referenced by books; no extra setup needed)

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE book_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can read open requests
CREATE POLICY "Public can view book requests"
  ON book_requests FOR SELECT
  USING (true);

-- Authenticated users can insert their own requests
CREATE POLICY "Authenticated users can create book requests"
  ON book_requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Users can update only their own requests (e.g. mark as fulfilled)
CREATE POLICY "Users can update own book requests"
  ON book_requests FOR UPDATE
  USING (auth.uid() = requester_id);

-- Users can delete only their own requests
CREATE POLICY "Users can delete own book requests"
  ON book_requests FOR DELETE
  USING (auth.uid() = requester_id);

-- ── Optional: index for common filter queries ─────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_book_requests_subject     ON book_requests(subject)     WHERE is_fulfilled = false;
CREATE INDEX IF NOT EXISTS idx_book_requests_grade       ON book_requests(grade)       WHERE is_fulfilled = false;
CREATE INDEX IF NOT EXISTS idx_book_requests_governorate ON book_requests(governorate) WHERE is_fulfilled = false;
CREATE INDEX IF NOT EXISTS idx_book_requests_created_at  ON book_requests(created_at DESC);
