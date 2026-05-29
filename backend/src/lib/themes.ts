export type ThemeName = 'horizon' | 'authority' | 'local';

export interface ThemeMeta {
  name: string;
  label: string;
  description: string;
  colors: { primary: string; accent: string; bg: string; text: string };
  className: string;
  css: string;
}

// ─── Horizon ─────────────────────────────────────────────────────────────────
// Clean, modern, tech-forward. Sky blue primary, white/slate palette.

const HORIZON_CSS = `
.hz-theme *{box-sizing:border-box;margin:0;padding:0}
.hz-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;line-height:1.7;background:#ffffff}

/* Hero */
.hz-theme section:first-of-type{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:#fff;padding:72px 40px;text-align:center}
.hz-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.hz-theme section:first-of-type p{font-size:1.15rem;color:#94a3b8;max-width:620px;margin:0 auto 2rem}

/* Sections */
.hz-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.hz-theme section:nth-of-type(even):not(:first-of-type){background:#f8fafc;max-width:100%;padding:64px 40px}
.hz-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}

/* Headings */
.hz-theme h2{font-size:1.875rem;font-weight:700;color:#0f172a;margin-bottom:1.25rem;padding-bottom:.75rem;position:relative}
.hz-theme h2::after{content:'';position:absolute;left:0;bottom:0;width:44px;height:3px;background:#0ea5e9;border-radius:2px}
.hz-theme h3{font-size:1.2rem;font-weight:600;color:#1e293b;margin-bottom:.5rem;margin-top:1.5rem}

/* Body */
.hz-theme p{color:#475569;margin-bottom:1rem;font-size:1rem}
.hz-theme ul,.hz-theme ol{color:#475569;padding-left:1.5rem;margin-bottom:1.5rem}
.hz-theme li{margin-bottom:.5rem}
.hz-theme li::marker{color:#0ea5e9}

/* CTA */
.hz-theme .cta-button{display:inline-block;background:#0ea5e9;color:#fff!important;padding:14px 32px;border-radius:8px;font-weight:600;font-size:1rem;text-decoration:none;margin-top:1.25rem;transition:background .2s}
.hz-theme .cta-button:hover{background:#0284c7}

/* FAQ */
.hz-theme dl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-top:1rem}
.hz-theme dt{background:#f1f5f9;padding:14px 20px;font-weight:600;color:#0f172a;border-top:1px solid #e2e8f0}
.hz-theme dt:first-of-type{border-top:none}
.hz-theme dd{padding:14px 20px;color:#475569;margin:0;border-top:1px solid #e2e8f0}

@media(max-width:640px){
  .hz-theme section,.hz-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}
  .hz-theme section:first-of-type{padding:56px 20px}
}
`.trim();

// ─── Authority ────────────────────────────────────────────────────────────────
// Bold, corporate, trust-heavy. Deep indigo + orange CTAs.

const AUTHORITY_CSS = `
.au-theme *{box-sizing:border-box;margin:0;padding:0}
.au-theme{font-family:'Georgia','Times New Roman',serif;color:#1e1b4b;line-height:1.7;background:#ffffff}

/* Hero */
.au-theme section:first-of-type{background:#1e1b4b;color:#fff;padding:80px 40px;text-align:center;border-bottom:5px solid #f97316}
.au-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:700;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.au-theme section:first-of-type p{font-size:1.1rem;color:#c7d2fe;max-width:620px;margin:0 auto 2rem}

/* Sections */
.au-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.au-theme section:nth-of-type(even):not(:first-of-type){background:#f8f7ff;max-width:100%;padding:64px 40px;border-left:5px solid #f97316}
.au-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}

/* Headings */
.au-theme h2{font-size:1.6rem;font-weight:700;color:#1e1b4b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:1.25rem;border-bottom:2px solid #e5e7eb;padding-bottom:.75rem}
.au-theme h3{font-size:1.15rem;font-weight:700;color:#1e1b4b;margin-bottom:.5rem;margin-top:1.5rem}

/* Body */
.au-theme p{color:#374151;margin-bottom:1rem;font-size:1.05rem}
.au-theme ul,.au-theme ol{color:#374151;padding-left:1.5rem;margin-bottom:1.5rem}
.au-theme li{margin-bottom:.5rem}
.au-theme li::marker{color:#f97316}

/* CTA */
.au-theme .cta-button{display:inline-block;background:#f97316;color:#fff!important;padding:14px 36px;border-radius:4px;font-weight:700;font-size:1rem;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;margin-top:1.25rem;transition:background .2s;font-family:-apple-system,sans-serif}
.au-theme .cta-button:hover{background:#ea580c}

/* FAQ */
.au-theme dl{margin-top:1rem}
.au-theme dt{padding:14px 0;font-weight:700;color:#1e1b4b;border-bottom:1px solid #e5e7eb;font-size:1.05rem}
.au-theme dd{padding:10px 0 20px;color:#4b5563;margin:0;padding-left:1rem;border-left:3px solid #f97316}

@media(max-width:640px){
  .au-theme section,.au-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}
  .au-theme section:first-of-type{padding:56px 20px}
}
`.trim();

// ─── Local ────────────────────────────────────────────────────────────────────
// Warm, community-focused, approachable. Forest green + amber.

const LOCAL_CSS = `
.lc-theme *{box-sizing:border-box;margin:0;padding:0}
.lc-theme{font-family:'Helvetica Neue',Arial,sans-serif;color:#1c1917;line-height:1.75;background:#ffffff}

/* Hero */
.lc-theme section:first-of-type{background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);color:#fff;padding:72px 40px;text-align:center;border-radius:0 0 32px 32px}
.lc-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:800;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.lc-theme section:first-of-type p{font-size:1.15rem;color:#d1fae5;max-width:600px;margin:0 auto 2rem}

/* Sections */
.lc-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.lc-theme section:nth-of-type(even):not(:first-of-type){background:#fefce8;max-width:100%;padding:64px 40px}
.lc-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}

/* Headings */
.lc-theme h2{font-size:1.875rem;font-weight:700;color:#14532d;margin-bottom:1.25rem}
.lc-theme h2::before{content:'';display:inline-block;width:6px;height:24px;background:#f59e0b;border-radius:3px;margin-right:12px;vertical-align:middle}
.lc-theme h3{font-size:1.2rem;font-weight:600;color:#15803d;margin-bottom:.5rem;margin-top:1.5rem}

/* Body */
.lc-theme p{color:#57534e;margin-bottom:1rem}
.lc-theme ul,.lc-theme ol{color:#57534e;padding-left:1.5rem;margin-bottom:1.5rem}
.lc-theme li{margin-bottom:.5rem;padding-left:.25rem}
.lc-theme li::marker{color:#16a34a}

/* CTA */
.lc-theme .cta-button{display:inline-block;background:#f59e0b;color:#1c1917!important;padding:14px 36px;border-radius:9999px;font-weight:700;font-size:1rem;text-decoration:none;margin-top:1.25rem;transition:background .2s,transform .1s;box-shadow:0 4px 14px rgba(245,158,11,.35)}
.lc-theme .cta-button:hover{background:#d97706;transform:translateY(-2px)}

/* FAQ */
.lc-theme dl{margin-top:1rem;display:grid;gap:1rem}
.lc-theme dt{font-weight:700;color:#14532d;font-size:1.05rem;padding-bottom:4px;border-bottom:2px solid #bbf7d0}
.lc-theme dd{color:#57534e;margin:0;padding-left:1rem;border-left:4px solid #f59e0b}

@media(max-width:640px){
  .lc-theme section,.lc-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}
  .lc-theme section:first-of-type{padding:56px 20px}
}
`.trim();

// ─── Theme Registry ───────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeMeta> = {
  horizon: {
    name: 'horizon',
    label: 'Horizon',
    description: 'Clean and modern. Sky-blue accents, white background, sharp card layouts.',
    colors: { primary: '#0ea5e9', accent: '#0f172a', bg: '#f8fafc', text: '#475569' },
    className: 'hz-theme',
    css: HORIZON_CSS,
  },
  authority: {
    name: 'authority',
    label: 'Authority',
    description: 'Bold and corporate. Deep indigo header, orange CTAs, trust-focused layout.',
    colors: { primary: '#1e1b4b', accent: '#f97316', bg: '#f8f7ff', text: '#374151' },
    className: 'au-theme',
    css: AUTHORITY_CSS,
  },
  local: {
    name: 'local',
    label: 'Local',
    description: 'Warm and community-driven. Forest green, amber CTAs, friendly rounded feel.',
    colors: { primary: '#15803d', accent: '#f59e0b', bg: '#fefce8', text: '#57534e' },
    className: 'lc-theme',
    css: LOCAL_CSS,
  },
};

export function wrapWithTheme(html: string, theme: ThemeName): string {
  const t = THEMES[theme];
  return `<div class="${t.className}"><style>${t.css}</style>\n${html}\n</div>`;
}

export function getThemePromptGuidelines(): string {
  return `HTML STRUCTURE RULES (required):
- Wrap each content block in a <section> element
- First <section> is the hero — put H1, intro paragraph, and CTA button here
- Subsequent <section> elements are content sections with H2 headings
- Use <h2> for section titles, <h3> for sub-points
- Use <p> for paragraphs, <ul><li> for lists
- CTA links MUST use: <a href="/contact" class="cta-button">CTA TEXT</a>
- FAQ section MUST use: <dl><dt>Question?</dt><dd>Answer.</dd></dl>
- Do NOT add inline styles, class names (except cta-button), or IDs
- Keep HTML semantic and clean — the theme CSS handles all visual styling`;
}
