-- Add customer profile extension
CREATE TABLE IF NOT EXISTS customer_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phone_verified BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  preferred_contact_method VARCHAR(20) DEFAULT 'email',
  dietary_restrictions TEXT,
  special_requests TEXT,
  vip_status BOOLEAN DEFAULT false,
  tags TEXT[],
  notes TEXT,
  marketing_opt_in BOOLEAN DEFAULT true,
  birthday DATE,
  anniversary DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Add indexes for customer profiles
CREATE INDEX idx_customer_profiles_user_id ON customer_profiles(user_id);
CREATE INDEX idx_customer_profiles_vip_status ON customer_profiles(vip_status);

-- Add email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Add password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Add refresh tokens for remember me functionality
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Enhance reservations table for better tracking
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS table_ids INTEGER[],
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'website',
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS actual_arrival_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_departure_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS guest_notes TEXT;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for customer_profiles
CREATE TRIGGER update_customer_profiles_updated_at
BEFORE UPDATE ON customer_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add audit log for reservations
CREATE TABLE IF NOT EXISTS reservation_logs (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservation_logs_reservation_id ON reservation_logs(reservation_id);
CREATE INDEX idx_reservation_logs_user_id ON reservation_logs(user_id);
CREATE INDEX idx_reservation_logs_action ON reservation_logs(action);

-- Add guest checkout reservations tracking
CREATE TABLE IF NOT EXISTS guest_reservations (
  id SERIAL PRIMARY KEY,
  reservation_id INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  conversion_token VARCHAR(255) UNIQUE,
  converted_to_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guest_reservations_email ON guest_reservations(guest_email);
CREATE INDEX idx_guest_reservations_token ON guest_reservations(conversion_token); 