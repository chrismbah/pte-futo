-- Create site_settings table for storing dynamic config values like the Google Drive URL
CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Google Drive appointees link
INSERT INTO site_settings (key, value)
VALUES (
  'appointees_drive_url',
  'https://drive.google.com/file/d/1Vv_k_nvjAZ1Wi8QnpFa5wlsWCsns7918/view?usp=drivesdk'
)
ON CONFLICT (key) DO NOTHING;
