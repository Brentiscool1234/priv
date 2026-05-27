export type ProjectStatus = 'draft' | 'generating' | 'deployed' | 'qa_complete';

export type PageType =
  | 'homepage'
  | 'service'
  | 'location'
  | 'service_location'
  | 'about'
  | 'faq'
  | 'contact';

export type PageStatus = 'pending' | 'generating' | 'generated' | 'approved';

export type QAStatus = 'pass' | 'warning' | 'fail';

export type Formality = 'formal' | 'neutral' | 'casual';

export type LocaleCode =
  | 'en-US'
  | 'en-GB'
  | 'nl-BE'
  | 'nl-NL'
  | 'fr-BE'
  | 'fr-FR'
  | 'de-DE'
  | 'de-BE';

export type Industry =
  | 'party_rentals'
  | 'dumpster_rentals'
  | 'tree_service'
  | 'pool_installation'
  | 'event_rentals'
  | 'roofing'
  | 'hvac'
  | 'plumbing'
  | 'landscaping'
  | 'cleaning_services'
  | 'pest_control';

export interface Project {
  id: string;
  business_name: string;
  industry: Industry;
  primary_locale: LocaleCode;
  secondary_locales: LocaleCode[];
  country: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  page_count: number;
}

export interface BusinessProfile {
  business_name: string;
  industry: Industry;
  website_url: string;
  phone: string;
  email: string;
  booking_url: string;
  years_in_business: number;
  description: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price_range?: string;
}

export interface Location {
  id: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface LocaleConfig {
  code: LocaleCode;
  name: string;
  language: string;
  country: string;
  currency: string;
  flag_emoji: string;
  cta_style: string;
  formality: Formality;
}

export interface LanguageSettings {
  primary_locale: LocaleCode;
  secondary_locales: LocaleCode[];
  tone: Formality;
  formality: Formality;
}

export interface PagePlan {
  id: string;
  project_id: string;
  page_type: PageType;
  locale: LocaleCode;
  slug: string;
  h1: string;
  status: PageStatus;
}

export interface PageBrief {
  id: string;
  project_id: string;
  page_type: PageType;
  locale: LocaleCode;
  slug: string;
  h1: string;
  meta_title: string;
  meta_description: string;
  primary_keyword: string;
  secondary_keywords: string[];
  schema_types: string[];
  tone: Formality;
  word_count_target: number;
  status: PageStatus;
}

export interface GeneratedPage {
  id: string;
  project_id: string;
  brief_id: string;
  slug: string;
  h1: string;
  locale: LocaleCode;
  page_type: PageType;
  html_content: string;
  status: PageStatus;
  generated_at?: string;
  approved_at?: string;
}

export interface QAIssue {
  page_slug: string;
  check_name: string;
  status: QAStatus;
  message: string;
}

export interface QAReport {
  project_id: string;
  run_at: string;
  pass_count: number;
  warning_count: number;
  fail_count: number;
  issues: QAIssue[];
}

export interface WordPressConnection {
  wp_url: string;
  wp_api_key: string;
  plugin_key: string;
  status: 'connected' | 'disconnected' | 'error' | 'untested';
  last_tested?: string;
}

export interface DeploymentLog {
  id: string;
  project_id: string;
  action: string;
  status: 'success' | 'error' | 'running';
  message: string;
  timestamp: string;
}
