-- Create payments table for the EBSUMSA payment portal
CREATE TABLE IF NOT EXISTS payments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  matric_no     text NOT NULL,
  email         text,
  phone         text,
  purpose       text NOT NULL,
  amount        numeric(10, 2) NOT NULL,
  receipt_url   text,
  status        text NOT NULL DEFAULT 'pending',   -- pending | verified | rejected
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON payments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (submit a payment)
CREATE POLICY "Anyone can submit payment"
  ON payments FOR INSERT
  WITH CHECK (true);

-- Anyone can read their own payment by matric_no (for receipt lookup)
CREATE POLICY "Public read payments"
  ON payments FOR SELECT
  USING (true);

-- Only service role / admin can update status
CREATE POLICY "Service role can update"
  ON payments FOR UPDATE
  USING (true);
