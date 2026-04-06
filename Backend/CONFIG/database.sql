CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  fullname VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  avatar VARCHAR(255),
  bio TEXT,
  skills TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  challenge TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  impact TEXT NOT NULL DEFAULT '',
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  live_demo TEXT NOT NULL DEFAULT '',
  github_link TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL,
  budget TEXT NOT NULL DEFAULT '',
  timeline TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS document_name TEXT NOT NULL DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS document_data TEXT NOT NULL DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS document_size INTEGER NOT NULL DEFAULT 0;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS progress_note TEXT NOT NULL DEFAULT '';

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE service_requests
DROP CONSTRAINT IF EXISTS service_requests_status_check;

UPDATE service_requests
SET status = 'received'
WHERE status = 'pending';

UPDATE service_requests
SET status = 'completed'
WHERE status = 'approved';

ALTER TABLE service_requests
ALTER COLUMN status SET DEFAULT 'received';

ALTER TABLE service_requests
ADD CONSTRAINT service_requests_status_check
CHECK (status IN ('received', 'in_progress', 'completed', 'rejected'));

UPDATE service_requests
SET due_date = COALESCE(due_date, created_at + INTERVAL '7 days'),
    updated_at = COALESCE(updated_at, created_at);

INSERT INTO projects (
  slug,
  title,
  category,
  featured,
  image_url,
  short_description,
  description,
  challenge,
  solution,
  impact,
  tech_stack,
  live_demo,
  github_link
)
VALUES
  (
    'school-management-platform',
    'School Management Platform',
    'web app',
    TRUE,
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    'A full-featured school operations platform for managing students, attendance, and reporting.',
    'Built an admin-focused web application that centralizes student records, attendance workflows, reporting, and staff coordination in one place.',
    'The client needed to replace spreadsheet-heavy operations with a dependable system the team could actually use every day.',
    'I designed a clear dashboard structure, organized workflows around daily staff tasks, and built reusable interfaces for managing records and reports.',
    'The platform reduced manual work, improved visibility across the school, and gave staff a faster way to manage recurring tasks.',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'REST API'],
    '',
    ''
  ),
  (
    'service-booking-website',
    'Service Booking Website',
    'website',
    TRUE,
    'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80',
    'A conversion-focused business website with a booking flow and strong mobile usability.',
    'Created a branded website for a service business with lead capture, booking requests, and trust-building content sections.',
    'The business needed a modern online presence that looked professional and made it easier for customers to take action.',
    'I built a fast responsive experience, structured the content around customer questions, and added a simple request flow for new leads.',
    'The new site presented the business more confidently and made service inquiries easier to capture.',
    ARRAY['React', 'Responsive Design', 'API Integration'],
    '',
    ''
  ),
  (
    'inventory-and-sales-dashboard',
    'Inventory and Sales Dashboard',
    'dashboard',
    TRUE,
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80',
    'A custom dashboard for tracking stock levels, sales activity, and operational decisions.',
    'Designed and implemented a management dashboard that gives teams a clear view of inventory movement and business performance.',
    'Key information was scattered across separate tools, making it hard to act quickly and confidently.',
    'I combined reporting, status views, and structured navigation into a single interface designed for daily operational use.',
    'Teams gained a clearer view of business activity and a better foundation for future workflow automation.',
    ARRAY['React', 'Node.js', 'PostgreSQL', 'Chart-ready data'],
    '',
    ''
  ),
  (
    'field-service-mobile-app',
    'Field Service Mobile App',
    'mobile app',
    FALSE,
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    'A mobile workflow app concept for teams that need to manage tasks, updates, and communication on the go.',
    'Structured a mobile-first product experience for field teams to track jobs, communicate status, and access essential information quickly.',
    'The product needed to support fast decisions in mobile contexts where time and clarity matter.',
    'I focused on streamlined task flows, clear hierarchy, and backend-friendly data structures for future expansion.',
    'The concept established a strong direction for turning manual field workflows into a scalable app experience.',
    ARRAY['Mobile UX', 'API planning', 'Cross-platform workflow'],
    '',
    ''
  )
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_service_requests_created_at ON service_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_due_date ON service_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
