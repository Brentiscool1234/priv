# iRents Site Machine

Private internal tool for generating and deploying full WordPress authority websites.

## What It Does

Takes a business profile, services, target cities, language settings, and brand details, then generates and deploys a complete WordPress site with:

- 100–200 unique pages per project
- SEO-optimized content (H1, meta, body) in the project's native language
- Schema markup (LocalBusiness, Service, FAQPage, BreadcrumbList, etc.)
- Internal linking between all pages
- Localized slugs, CTAs, and anchor text
- XML sitemap
- QA crawl report
- WordPress deployment via private plugin

## Project Structure

```
irents-site-machine/
├── app/                        # Next.js 14 frontend dashboard
├── backend/                    # Node.js/Express API + engines
├── wp-plugin/
│   └── irents-site-machine/    # Private WordPress plugin
├── shared/
│   ├── locales.json            # Locale configs
│   └── page-templates.json     # Page type/template definitions
├── .env.example
└── docker-compose.yml
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript, SQLite |
| AI | OpenAI API (GPT-4) |
| WordPress | Custom REST plugin (irents-site-machine) |
| QA | Playwright (Phase 6) |

## Supported Locales

| Code | Language | Region |
|---|---|---|
| en-US | English | United States |
| en-GB | English | United Kingdom |
| nl-BE | Dutch/Flemish | Belgium |
| nl-NL | Dutch | Netherlands |
| fr-BE | French | Belgium |
| fr-FR | French | France |
| de-DE | German | Germany |
| de-BE | German | Belgium (East Belgium) |

Belgium-specific: Antwerpen/Anvers/Antwerp, Brussel/Bruxelles/Brussels, etc. City names adapt to the page language.

## Workflow (15-Step Process)

```
1.  Create project
2.  Add business profile
3.  Add services (manual or CSV)
4.  Add locations (manual or CSV)
5.  Select language/locales
6.  Generate sitemap (proposed page plan)
7.  User approves/edits sitemap
8.  Generate page briefs
9.  User approves/edits briefs
10. Generate content (AI, per locale)
11. Generate schema (JSON-LD)
12. Generate internal links
13. Preview pages
14. Deploy to WordPress
15. Run QA + export report
```

## Getting Started

### 1. Install dependencies

```bash
# Frontend
cd app && npm install

# Backend
cd backend && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in: APP_API_KEY, OPENAI_API_KEY
```

### 3. Run locally

```bash
# Backend
cd backend && npm run dev

# Frontend (new terminal)
cd app && npm run dev
```

Frontend: http://localhost:3000  
Backend API: http://localhost:4000

### 4. WordPress Plugin

1. Zip `wp-plugin/irents-site-machine/`
2. Upload to WordPress → Plugins → Add New → Upload
3. Activate plugin
4. Go to Settings → iRents Site Machine
5. Copy the plugin key
6. Paste into the project's WordPress connection settings in the dashboard

## Modules

### Planning Engine (Phase 1)
- Business intake form
- Service + location management (+ CSV import)
- Language/locale selector
- Sitemap generator
- Page brief generator

### Content Engine (Phase 2)
- AI content generation per page type
- Localized output (native language, not translated)
- Schema JSON-LD per page
- Internal link computation

### WordPress Plugin (Phase 3)
- Custom REST endpoints (`/wp-json/irents/v1/`)
- Bearer token authentication
- Bulk page create/update
- Schema injection
- Menu creation
- Hreflang meta tags

### Template System (Phase 4)
- 7 page templates (homepage, service, location, service+location, about, faq, contact)
- Brand color injection via CSS custom properties
- Mobile-responsive layouts

### Multilingual System (Phase 5)
- Per-locale sitemap
- Localized slugs (e.g., `/springkastelen-huren-antwerpen/`)
- WPML/Polylang integration
- Hreflang relationships

### QA and Reporting (Phase 6)
- Playwright crawler
- 17 automated checks per page
- Pass / Warning / Fail report
- CSV/JSON export

## Page Types

| Type | Example slug | Template |
|---|---|---|
| Homepage | `/` | page-homepage.php |
| Service | `/bounce-house-rentals/` | page-service.php |
| Location | `/austin-tx/` | page-location.php |
| Service + Location | `/bounce-house-rentals-austin-tx/` | page-service-location.php |
| About | `/about/` | page-about.php |
| FAQ | `/faq/` | page-faq.php |
| Contact | `/contact/` | page-contact.php |

## WordPress Plugin Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/wp-json/irents/v1/connect` | Test connection |
| GET | `/wp-json/irents/v1/status` | Plugin status |
| POST | `/wp-json/irents/v1/project` | Set project metadata |
| POST | `/wp-json/irents/v1/pages/bulk-create` | Create pages |
| POST | `/wp-json/irents/v1/pages/bulk-update` | Update pages |
| POST | `/wp-json/irents/v1/menus` | Create nav menus |
| POST | `/wp-json/irents/v1/settings` | Update site settings |
| GET | `/wp-json/irents/v1/sitemap` | List all pages |

## QA Checks

Every deployed page is checked for:

- Page loads (HTTP 200)
- Has H1, only one H1
- Meta title and meta description present
- Canonical tag present
- Schema JSON-LD present and valid
- Internal links not broken
- Page included in sitemap
- No noindex tag
- CTA section present
- Images have alt text
- Content above 400 words
- No duplicate titles, H1s, or meta descriptions across the project
- Language matches page locale
- Hreflang correct (multilingual projects)

## What This Is Not

- Not a public SaaS
- No billing or public signups
- No client portal
- No marketplace

This is a private agency tool. One operator, many client projects.
