// ─── Core Domain Types ───────────────────────────────────────────────────────

export type ProjectStatus = 'draft' | 'active' | 'paused' | 'completed';
export type PageStatus = 'proposed' | 'approved' | 'rejected';
export type BriefStatus = 'pending' | 'ready' | 'approved';
export type GeneratedPageStatus = 'pending' | 'generating' | 'done' | 'failed';
export type DeploymentStatus = 'pending' | 'running' | 'done' | 'failed';
export type QAStatus = 'pending' | 'running' | 'done' | 'failed';
export type WPConnectionStatus = 'unverified' | 'ok' | 'error';
export type PageType =
  | 'homepage'
  | 'about'
  | 'contact'
  | 'faq'
  | 'service'
  | 'location'
  | 'service_location';

export interface Project {
  id: string;
  business_name: string;
  industry: string;
  website_url?: string;
  wordpress_url?: string;
  primary_locale: string;
  secondary_locales: string[];
  country?: string;
  status: ProjectStatus;
  page_count: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  project_id: string;
  business_name?: string;
  description?: string;
  phone?: string;
  email?: string;
  booking_url?: string;
  years_in_business?: number;
  trust_points: string[];
  brand_colors: Record<string, string>;
  logo_url?: string;
  tone?: string;
  target_customer?: string;
  data: Record<string, unknown>;
}

export interface Service {
  id: string;
  project_id: string;
  name: string;
  locale: string;
  primary_keyword?: string;
  secondary_keywords: string[];
  slug?: string;
  description?: string;
  parent_category?: string;
  priority: number;
  template_type: string;
  created_at: string;
}

export interface Location {
  id: string;
  project_id: string;
  city: string;
  state_province?: string;
  country?: string;
  region?: string;
  language_name?: string;
  population?: number;
  priority: number;
  included: boolean;
  locale?: string;
  created_at: string;
}

export interface PagePlan {
  id: string;
  project_id: string;
  page_type: PageType;
  locale: string;
  service_id?: string;
  location_id?: string;
  slug: string;
  status: PageStatus;
  priority: number;
  created_at: string;
}

export interface PageBrief {
  id: string;
  plan_id: string;
  project_id: string;
  page_type: PageType;
  locale: string;
  slug: string;
  primary_keyword?: string;
  secondary_keywords: string[];
  h1?: string;
  meta_title?: string;
  meta_description?: string;
  section_structure: string[];
  cta_angle?: string;
  faq_questions: string[];
  internal_links: InternalLink[];
  schema_types: string[];
  status: BriefStatus;
  created_at: string;
}

export interface GeneratedPage {
  id: string;
  brief_id: string;
  project_id: string;
  locale: string;
  slug: string;
  page_type: PageType;
  h1?: string;
  meta_title?: string;
  meta_description?: string;
  content_html?: string;
  schema_json?: object[];
  internal_links: InternalLink[];
  status: GeneratedPageStatus;
  wp_page_id?: number;
  created_at: string;
  updated_at: string;
}

export interface WordPressConnection {
  id: string;
  project_id: string;
  wp_url: string;
  plugin_key: string;
  status: WPConnectionStatus;
  last_checked?: string;
  created_at: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  status: DeploymentStatus;
  pages_total: number;
  pages_created: number;
  pages_failed: number;
  log: DeployLogEntry[];
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface DeployLogEntry {
  ts: string;
  slug: string;
  status: 'ok' | 'failed';
  message?: string;
  wp_page_id?: number;
}

export interface QAReport {
  id: string;
  project_id: string;
  deployment_id?: string;
  pass_count: number;
  warning_count: number;
  fail_count: number;
  total_pages: number;
  status: QAStatus;
  created_at: string;
}

export interface QAIssue {
  id: string;
  report_id: string;
  project_id: string;
  page_slug?: string;
  check_name: string;
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  created_at: string;
}

export interface InternalLink {
  slug: string;
  anchor_text: string;
  page_type: PageType;
}

// ─── WordPress API Types ──────────────────────────────────────────────────────

export interface WPPageData {
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  schema_json?: object[];
  status?: 'publish' | 'draft';
  parent_id?: number;
}

export interface BulkResult {
  created: Array<{ slug: string; id: number; link: string }>;
  failed: Array<{ slug: string; error: string }>;
}

export interface MenuItem {
  title: string;
  url: string;
  parent?: number;
}

export interface StatusResponse {
  connected: boolean;
  site_url: string;
  plugin_version?: string;
  page_count?: number;
}

// ─── Locale Types ─────────────────────────────────────────────────────────────

export interface LocaleConfig {
  code: string;
  name: string;
  language: string;
  country: string;
  currency: string;
  formality: string;
  cta_style: string;
  date_format: string;
  phone_format: string;
}

// ─── Request/Response Shapes ─────────────────────────────────────────────────

export interface CreateProjectBody {
  business_name: string;
  industry: string;
  website_url?: string;
  wordpress_url?: string;
  primary_locale?: string;
  secondary_locales?: string[];
  country?: string;
  profile?: Partial<Omit<BusinessProfile, 'id' | 'project_id'>>;
}

export interface CreateServiceBody {
  name: string;
  locale: string;
  primary_keyword?: string;
  secondary_keywords?: string[];
  slug?: string;
  description?: string;
  parent_category?: string;
  priority?: number;
  template_type?: string;
}

export interface CreateLocationBody {
  city: string;
  state_province?: string;
  country?: string;
  region?: string;
  language_name?: string;
  population?: number;
  priority?: number;
  locale?: string;
}

export interface GenerateSitemapBody {
  max_pages?: number;
  include_locales?: string[];
}

export interface GenerateBriefsBody {
  plan_ids?: string[];
}

export interface GenerateContentBody {
  brief_ids?: string[];
  concurrency?: number;
}

export interface ConnectWordPressBody {
  wp_url: string;
  plugin_key: string;
}

export interface DeployBody {
  page_ids?: string[];
  force?: boolean;
}
