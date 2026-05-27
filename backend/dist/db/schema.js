"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEMA_SQL = void 0;
exports.SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website_url TEXT,
  wordpress_url TEXT,
  primary_locale TEXT NOT NULL DEFAULT 'en-US',
  secondary_locales TEXT DEFAULT '[]',
  country TEXT,
  status TEXT DEFAULT 'draft',
  page_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS business_profiles (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  business_name TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  booking_url TEXT,
  years_in_business INTEGER,
  trust_points TEXT DEFAULT '[]',
  brand_colors TEXT DEFAULT '{}',
  logo_url TEXT,
  tone TEXT,
  target_customer TEXT,
  data TEXT DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  locale TEXT NOT NULL,
  primary_keyword TEXT,
  secondary_keywords TEXT DEFAULT '[]',
  slug TEXT,
  description TEXT,
  parent_category TEXT,
  priority INTEGER DEFAULT 1,
  template_type TEXT DEFAULT 'service',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  city TEXT NOT NULL,
  state_province TEXT,
  country TEXT,
  region TEXT,
  language_name TEXT,
  population INTEGER,
  priority INTEGER DEFAULT 1,
  included INTEGER DEFAULT 1,
  locale TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_plans (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  page_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  service_id TEXT,
  location_id TEXT,
  slug TEXT NOT NULL,
  status TEXT DEFAULT 'proposed',
  priority INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS page_briefs (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL REFERENCES page_plans(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  page_type TEXT NOT NULL,
  locale TEXT NOT NULL,
  slug TEXT NOT NULL,
  primary_keyword TEXT,
  secondary_keywords TEXT DEFAULT '[]',
  h1 TEXT,
  meta_title TEXT,
  meta_description TEXT,
  section_structure TEXT DEFAULT '[]',
  cta_angle TEXT,
  faq_questions TEXT DEFAULT '[]',
  internal_links TEXT DEFAULT '[]',
  schema_types TEXT DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS generated_pages (
  id TEXT PRIMARY KEY,
  brief_id TEXT NOT NULL REFERENCES page_briefs(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  locale TEXT NOT NULL,
  slug TEXT NOT NULL,
  page_type TEXT NOT NULL,
  h1 TEXT,
  meta_title TEXT,
  meta_description TEXT,
  content_html TEXT,
  schema_json TEXT,
  internal_links TEXT DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  wp_page_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wordpress_connections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  wp_url TEXT NOT NULL,
  plugin_key TEXT NOT NULL,
  status TEXT DEFAULT 'unverified',
  last_checked TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  status TEXT DEFAULT 'pending',
  pages_total INTEGER DEFAULT 0,
  pages_created INTEGER DEFAULT 0,
  pages_failed INTEGER DEFAULT 0,
  log TEXT DEFAULT '[]',
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS qa_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  deployment_id TEXT,
  pass_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  total_pages INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS qa_issues (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES qa_reports(id),
  project_id TEXT NOT NULL REFERENCES projects(id),
  page_slug TEXT,
  check_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`;
//# sourceMappingURL=schema.js.map