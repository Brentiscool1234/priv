export type ThemeName = 'horizon' | 'authority' | 'local';

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  tagline: string;
  description: string;
  colors: string[];
  className: string;
  css: string;
}

const HORIZON_CSS = `.hz-theme *{box-sizing:border-box;margin:0;padding:0}
.hz-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;line-height:1.7;background:#ffffff}
.hz-theme section:first-of-type{background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);color:#fff;padding:72px 40px;text-align:center}
.hz-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:800;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.hz-theme section:first-of-type p{font-size:1.15rem;color:#94a3b8;max-width:620px;margin:0 auto 2rem}
.hz-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.hz-theme section:nth-of-type(even):not(:first-of-type){background:#f8fafc;max-width:100%;padding:64px 40px}
.hz-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}
.hz-theme h2{font-size:1.875rem;font-weight:700;color:#0f172a;margin-bottom:1.25rem;padding-bottom:.75rem;position:relative}
.hz-theme h2::after{content:'';position:absolute;left:0;bottom:0;width:44px;height:3px;background:#0ea5e9;border-radius:2px}
.hz-theme h3{font-size:1.2rem;font-weight:600;color:#1e293b;margin-bottom:.5rem;margin-top:1.5rem}
.hz-theme p{color:#475569;margin-bottom:1rem;font-size:1rem}
.hz-theme ul,.hz-theme ol{color:#475569;padding-left:1.5rem;margin-bottom:1.5rem}
.hz-theme li{margin-bottom:.5rem}
.hz-theme li::marker{color:#0ea5e9}
.hz-theme .cta-button{display:inline-block;background:#0ea5e9;color:#fff!important;padding:14px 32px;border-radius:8px;font-weight:600;font-size:1rem;text-decoration:none;margin-top:1.25rem;transition:background .2s}
.hz-theme .cta-button:hover{background:#0284c7}
.hz-theme dl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-top:1rem}
.hz-theme dt{background:#f1f5f9;padding:14px 20px;font-weight:600;color:#0f172a;border-top:1px solid #e2e8f0}
.hz-theme dt:first-of-type{border-top:none}
.hz-theme dd{padding:14px 20px;color:#475569;margin:0;border-top:1px solid #e2e8f0}
@media(max-width:640px){.hz-theme section,.hz-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}.hz-theme section:first-of-type{padding:56px 20px}}`;

const AUTHORITY_CSS = `.au-theme *{box-sizing:border-box;margin:0;padding:0}
.au-theme{font-family:'Georgia','Times New Roman',serif;color:#1e1b4b;line-height:1.7;background:#ffffff}
.au-theme section:first-of-type{background:#1e1b4b;color:#fff;padding:80px 40px;text-align:center;border-bottom:5px solid #f97316}
.au-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.5rem);font-weight:700;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.au-theme section:first-of-type p{font-size:1.1rem;color:#c7d2fe;max-width:620px;margin:0 auto 2rem}
.au-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.au-theme section:nth-of-type(even):not(:first-of-type){background:#f8f7ff;max-width:100%;padding:64px 40px;border-left:5px solid #f97316}
.au-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}
.au-theme h2{font-size:1.6rem;font-weight:700;color:#1e1b4b;text-transform:uppercase;letter-spacing:.04em;margin-bottom:1.25rem;border-bottom:2px solid #e5e7eb;padding-bottom:.75rem}
.au-theme h3{font-size:1.15rem;font-weight:700;color:#1e1b4b;margin-bottom:.5rem;margin-top:1.5rem}
.au-theme p{color:#374151;margin-bottom:1rem;font-size:1.05rem}
.au-theme ul,.au-theme ol{color:#374151;padding-left:1.5rem;margin-bottom:1.5rem}
.au-theme li{margin-bottom:.5rem}
.au-theme li::marker{color:#f97316}
.au-theme .cta-button{display:inline-block;background:#f97316;color:#fff!important;padding:14px 36px;border-radius:4px;font-weight:700;font-size:1rem;text-decoration:none;text-transform:uppercase;letter-spacing:.05em;margin-top:1.25rem;transition:background .2s;font-family:-apple-system,sans-serif}
.au-theme .cta-button:hover{background:#ea580c}
.au-theme dl{margin-top:1rem}
.au-theme dt{padding:14px 0;font-weight:700;color:#1e1b4b;border-bottom:1px solid #e5e7eb;font-size:1.05rem}
.au-theme dd{padding:10px 0 20px;color:#4b5563;margin:0;padding-left:1rem;border-left:3px solid #f97316}
@media(max-width:640px){.au-theme section,.au-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}.au-theme section:first-of-type{padding:56px 20px}}`;

const LOCAL_CSS = `.lc-theme *{box-sizing:border-box;margin:0;padding:0}
.lc-theme{font-family:'Helvetica Neue',Arial,sans-serif;color:#1c1917;line-height:1.75;background:#ffffff}
.lc-theme section:first-of-type{background:linear-gradient(135deg,#14532d 0%,#16a34a 100%);color:#fff;padding:72px 40px;text-align:center;border-radius:0 0 32px 32px}
.lc-theme section:first-of-type h1{font-size:clamp(2rem,5vw,3.25rem);font-weight:800;color:#fff;line-height:1.2;margin-bottom:1.25rem}
.lc-theme section:first-of-type p{font-size:1.15rem;color:#d1fae5;max-width:600px;margin:0 auto 2rem}
.lc-theme section{padding:64px 40px;max-width:960px;margin:0 auto}
.lc-theme section:nth-of-type(even):not(:first-of-type){background:#fefce8;max-width:100%;padding:64px 40px}
.lc-theme section:nth-of-type(even):not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto}
.lc-theme h2{font-size:1.875rem;font-weight:700;color:#14532d;margin-bottom:1.25rem}
.lc-theme h2::before{content:'';display:inline-block;width:6px;height:24px;background:#f59e0b;border-radius:3px;margin-right:12px;vertical-align:middle}
.lc-theme h3{font-size:1.2rem;font-weight:600;color:#15803d;margin-bottom:.5rem;margin-top:1.5rem}
.lc-theme p{color:#57534e;margin-bottom:1rem}
.lc-theme ul,.lc-theme ol{color:#57534e;padding-left:1.5rem;margin-bottom:1.5rem}
.lc-theme li{margin-bottom:.5rem;padding-left:.25rem}
.lc-theme li::marker{color:#16a34a}
.lc-theme .cta-button{display:inline-block;background:#f59e0b;color:#1c1917!important;padding:14px 36px;border-radius:9999px;font-weight:700;font-size:1rem;text-decoration:none;margin-top:1.25rem;transition:background .2s,transform .1s;box-shadow:0 4px 14px rgba(245,158,11,.35)}
.lc-theme .cta-button:hover{background:#d97706;transform:translateY(-2px)}
.lc-theme dl{margin-top:1rem;display:grid;gap:1rem}
.lc-theme dt{font-weight:700;color:#14532d;font-size:1.05rem;padding-bottom:4px;border-bottom:2px solid #bbf7d0}
.lc-theme dd{color:#57534e;margin:0;padding-left:1rem;border-left:4px solid #f59e0b}
@media(max-width:640px){.lc-theme section,.lc-theme section:nth-of-type(even):not(:first-of-type){padding:48px 20px}.lc-theme section:first-of-type{padding:56px 20px}}`;

export const THEMES: Record<ThemeName, ThemeMeta> = {
  horizon: {
    name: 'horizon',
    label: 'Horizon',
    tagline: 'Clean & Modern',
    description: 'Sharp layouts, sky-blue accents, white backgrounds. Great for tech-forward service companies.',
    colors: ['#0ea5e9', '#0f172a', '#f8fafc', '#475569'],
    className: 'hz-theme',
    css: HORIZON_CSS,
  },
  authority: {
    name: 'authority',
    label: 'Authority',
    tagline: 'Bold & Corporate',
    description: 'Deep indigo header, orange CTAs, uppercase headings. Signals trust and expertise.',
    colors: ['#1e1b4b', '#f97316', '#f8f7ff', '#374151'],
    className: 'au-theme',
    css: AUTHORITY_CSS,
  },
  local: {
    name: 'local',
    label: 'Local',
    tagline: 'Warm & Community',
    description: 'Forest green, amber CTAs, rounded and friendly. Perfect for neighborhood service businesses.',
    colors: ['#15803d', '#f59e0b', '#fefce8', '#57534e'],
    className: 'lc-theme',
    css: LOCAL_CSS,
  },
};

const SAMPLE_CONTENT = `
<section>
  <h1>Professional Party Rentals in Austin, TX</h1>
  <p>From bounce houses to full event setups, we bring the celebration to you. Serving Austin and surrounding areas for over 10 years.</p>
  <a href="/contact" class="cta-button">Get a Free Quote</a>
</section>
<section>
  <h2>Our Most Popular Rentals</h2>
  <p>We carry the widest selection of party rental equipment in central Texas. Whether you need a single bounce house or a complete event package, we have you covered.</p>
  <ul>
    <li>Bounce houses and obstacle courses</li>
    <li>Water slides and splash pads</li>
    <li>Tables, chairs, and linens</li>
    <li>Tent and canopy rentals</li>
    <li>Concession machines</li>
  </ul>
</section>
<section>
  <h2>Why Choose Us?</h2>
  <h3>10+ Years of Experience</h3>
  <p>We have been serving Austin families and businesses since 2013. Our experience means smoother events and happier customers.</p>
  <h3>Safety First</h3>
  <p>All our equipment is cleaned, inspected, and certified before every rental. Your guests' safety is our top priority.</p>
  <h3>Same-Day Delivery</h3>
  <p>Need it fast? We offer same-day delivery and setup across Austin, Round Rock, and Cedar Park.</p>
  <a href="/contact" class="cta-button">Book Your Rental Today</a>
</section>
<section>
  <h2>Frequently Asked Questions</h2>
  <dl>
    <dt>How far in advance should I book?</dt>
    <dd>We recommend booking at least 2 weeks in advance for weekends, especially during summer. Same-week bookings are possible based on availability.</dd>
    <dt>Do you deliver and set up the equipment?</dt>
    <dd>Yes! Delivery, setup, and pickup are included in every rental. Our team handles everything so you can focus on your event.</dd>
    <dt>What happens if it rains?</dt>
    <dd>We monitor weather closely. If severe weather is forecast, we can reschedule your rental at no extra charge.</dd>
  </dl>
</section>
`.trim();

export function buildPreviewHtml(theme: ThemeName): string {
  const t = THEMES[theme];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0}${t.css}</style></head><body><div class="${t.className}">${SAMPLE_CONTENT}</div></body></html>`;
}
