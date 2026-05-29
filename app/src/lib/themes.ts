export type ThemeName = 'horizon' | 'authority' | 'local';

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  tagline: string;
  description: string;
  colors: string[];
  bodyClass: string;
  wrapperClass: string;
  css: string;
}

// ─── CSS strings (kept in sync with backend/src/lib/themes.ts) ───────────────

const HORIZON_CSS = `
.hz-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;color:#0f172a;line-height:1.7;background:#fff}
.hz-theme *{box-sizing:border-box;margin:0;padding:0}
.hz-theme section:first-of-type{background:linear-gradient(150deg,#0f172a 0%,#0c1e3a 55%,#0a2952 100%);min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden}
.hz-theme section:first-of-type::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(56,189,248,.12) 0%,transparent 70%);pointer-events:none}
.hz-theme section:first-of-type h1{font-size:clamp(2.5rem,5.5vw,4.5rem);font-weight:800;color:#fff;line-height:1.12;letter-spacing:-.03em;margin-bottom:1.5rem;max-width:860px;position:relative;z-index:1}
.hz-theme section:first-of-type p{font-size:1.2rem;color:#94a3b8;max-width:580px;margin:0 auto 2.5rem;position:relative;z-index:1}
.hz-theme section:first-of-type a.cta-button{position:relative;z-index:1}
.hz-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.hz-theme section:nth-of-type(even):not(:first-of-type){background:#f8fafc}
.hz-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}
.hz-theme h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:700;color:#0f172a;letter-spacing:-.015em;margin-bottom:.5rem}
.hz-theme h2::after{content:'';display:block;width:44px;height:3px;background:#0ea5e9;border-radius:2px;margin-top:.75rem;margin-bottom:1.5rem}
.hz-theme h3{font-size:1.15rem;font-weight:600;color:#1e293b;margin-top:2rem;margin-bottom:.5rem}
.hz-theme p{color:#475569;font-size:1rem;margin-bottom:1rem}
.hz-theme ul,.hz-theme ol{color:#475569;padding-left:1.5rem;margin-bottom:1.5rem}
.hz-theme li{margin-bottom:.5rem}
.hz-theme li::marker{color:#0ea5e9}
.hz-theme .cta-button{display:inline-block;background:#0ea5e9;color:#fff!important;padding:16px 40px;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none!important;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(14,165,233,.35)}
.hz-theme .cta-button:hover{background:#0284c7;transform:translateY(-2px);box-shadow:0 8px 32px rgba(14,165,233,.45)}
.hz-theme dl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.hz-theme dt{background:#f1f5f9;padding:16px 24px;font-weight:600;color:#0f172a;border-top:1px solid #e2e8f0}
.hz-theme dt:first-of-type{border-top:none}
.hz-theme dd{padding:16px 24px;color:#475569;margin:0;border-top:1px solid #e2e8f0}
body.irents-theme-horizon{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;margin:0;-webkit-font-smoothing:antialiased}
body.irents-theme-horizon header.site-header,body.irents-theme-horizon #masthead,body.irents-theme-horizon .site-header{background:#0f172a!important;border-bottom:1px solid #1e293b!important;box-shadow:none!important}
body.irents-theme-horizon .site-title a,body.irents-theme-horizon .site-branding a{color:#fff!important;font-weight:700!important;text-decoration:none!important}
body.irents-theme-horizon .main-navigation a,body.irents-theme-horizon #site-navigation a{color:#94a3b8!important;text-decoration:none}
body.irents-theme-horizon .main-navigation a:hover,body.irents-theme-horizon #site-navigation a:hover{color:#38bdf8!important}
body.irents-theme-horizon #page{max-width:100%!important}
body.irents-theme-horizon .site-content,body.irents-theme-horizon #content,body.irents-theme-horizon .content-area,body.irents-theme-horizon #primary,body.irents-theme-horizon .entry-content,body.irents-theme-horizon article.page{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-horizon .page-header,body.irents-theme-horizon .entry-header{display:none!important}
body.irents-theme-horizon footer.site-footer,body.irents-theme-horizon .site-footer,body.irents-theme-horizon #colophon{background:#0f172a!important;color:#64748b!important;border-top:1px solid #1e293b!important;padding:60px 5vw!important}
body.irents-theme-horizon footer a,body.irents-theme-horizon .site-footer a{color:#38bdf8!important;text-decoration:none}
@media(max-width:768px){.hz-theme section:not(:first-of-type){padding:64px 24px}.hz-theme section:first-of-type{min-height:75vh;padding:80px 24px}}
`.trim();

const AUTHORITY_CSS = `
.au-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.75;background:#fdfbf7}
.au-theme *{box-sizing:border-box;margin:0;padding:0}
.au-theme section:first-of-type{background:#1a1a2e;min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden;border-bottom:4px solid #c8a951}
.au-theme section:first-of-type h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.25rem,5vw,4rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-.01em;margin-bottom:1.5rem;max-width:820px;position:relative;z-index:1}
.au-theme section:first-of-type h1::after{content:'';display:block;width:72px;height:3px;background:#c8a951;margin:.75rem auto 0}
.au-theme section:first-of-type p{font-size:1.15rem;color:#a5accc;max-width:580px;margin:1.5rem auto 2.5rem;position:relative;z-index:1}
.au-theme section:first-of-type a.cta-button{position:relative;z-index:1}
.au-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.au-theme section:nth-of-type(even):not(:first-of-type){background:#f5f0e8}
.au-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}
.au-theme h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.6rem,2.8vw,2.2rem);font-weight:700;color:#1a1a2e;letter-spacing:-.01em;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:2px solid #e5ddc8}
.au-theme h3{font-size:1.1rem;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:.06em;margin-top:2rem;margin-bottom:.5rem}
.au-theme p{color:#3d3a50;font-size:1.05rem;margin-bottom:1rem}
.au-theme ul,.au-theme ol{color:#3d3a50;padding-left:1.5rem;margin-bottom:1.5rem}
.au-theme li{margin-bottom:.5rem}
.au-theme li::marker{color:#c8a951}
.au-theme .cta-button{display:inline-block;background:#c8a951;color:#1a1a2e!important;padding:16px 44px;border-radius:4px;font-weight:700;font-size:1rem;text-decoration:none!important;text-transform:uppercase;letter-spacing:.08em;transition:background .2s,box-shadow .2s;box-shadow:0 4px 16px rgba(200,169,81,.3)}
.au-theme .cta-button:hover{background:#b8953f;box-shadow:0 6px 24px rgba(200,169,81,.45)}
.au-theme dl{margin-top:1rem}
.au-theme dt{padding:16px 0;font-family:Georgia,serif;font-weight:700;color:#1a1a2e;border-bottom:1px solid #e5ddc8;font-size:1.05rem}
.au-theme dd{padding:12px 0 20px 1.25rem;color:#4a4768;margin:0;border-left:3px solid #c8a951}
body.irents-theme-authority{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#fdfbf7;-webkit-font-smoothing:antialiased}
body.irents-theme-authority header.site-header,body.irents-theme-authority #masthead,body.irents-theme-authority .site-header{background:#1a1a2e!important;border-bottom:3px solid #c8a951!important;box-shadow:none!important}
body.irents-theme-authority .site-title a,body.irents-theme-authority .site-branding a{color:#fff!important;font-family:Georgia,serif!important;font-weight:700!important;text-decoration:none!important}
body.irents-theme-authority .main-navigation a,body.irents-theme-authority #site-navigation a{color:#a5accc!important;text-decoration:none;text-transform:uppercase;letter-spacing:.04em;font-size:.875rem}
body.irents-theme-authority .main-navigation a:hover,body.irents-theme-authority #site-navigation a:hover{color:#c8a951!important}
body.irents-theme-authority #page{max-width:100%!important}
body.irents-theme-authority .site-content,body.irents-theme-authority #content,body.irents-theme-authority .content-area,body.irents-theme-authority #primary,body.irents-theme-authority .entry-content,body.irents-theme-authority article.page{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-authority .page-header,body.irents-theme-authority .entry-header{display:none!important}
body.irents-theme-authority footer.site-footer,body.irents-theme-authority .site-footer,body.irents-theme-authority #colophon{background:#13121e!important;color:#a5accc!important;border-top:3px solid #c8a951!important;padding:60px 5vw!important}
body.irents-theme-authority footer a,body.irents-theme-authority .site-footer a{color:#c8a951!important;text-decoration:none}
@media(max-width:768px){.au-theme section:not(:first-of-type){padding:64px 24px}.au-theme section:first-of-type{min-height:75vh;padding:80px 24px}}
`.trim();

const LOCAL_CSS = `
.lc-theme{font-family:'Helvetica Neue',Arial,sans-serif;color:#1c1917;line-height:1.75;background:#fffef7}
.lc-theme *{box-sizing:border-box;margin:0;padding:0}
.lc-theme section:first-of-type{background:linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%);min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden;border-radius:0 0 48px 48px}
.lc-theme section:first-of-type::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:48px;background:#fffef7;border-radius:48px 48px 0 0;pointer-events:none}
.lc-theme section:first-of-type h1{font-size:clamp(2.5rem,5.5vw,4.25rem);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.02em;margin-bottom:1.5rem;max-width:820px;text-shadow:0 2px 12px rgba(0,0,0,.15)}
.lc-theme section:first-of-type p{font-size:1.2rem;color:#bbf7d0;max-width:560px;margin:0 auto 2.5rem}
.lc-theme section:first-of-type a.cta-button{position:relative;z-index:1}
.lc-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.lc-theme section:nth-of-type(even):not(:first-of-type){background:#fef9e7}
.lc-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}
.lc-theme h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;color:#14532d;letter-spacing:-.015em;margin-bottom:1.25rem;display:flex;align-items:center;gap:.75rem}
.lc-theme h2::before{content:'';flex-shrink:0;width:6px;height:28px;background:#f59e0b;border-radius:3px}
.lc-theme h3{font-size:1.15rem;font-weight:700;color:#15803d;margin-top:2rem;margin-bottom:.5rem}
.lc-theme p{color:#44403c;font-size:1.05rem;margin-bottom:1rem}
.lc-theme ul,.lc-theme ol{color:#44403c;padding-left:1.5rem;margin-bottom:1.5rem}
.lc-theme li{margin-bottom:.5rem;padding-left:.25rem}
.lc-theme li::marker{color:#16a34a}
.lc-theme .cta-button{display:inline-block;background:#f59e0b;color:#1c1917!important;padding:16px 44px;border-radius:9999px;font-weight:800;font-size:1rem;text-decoration:none!important;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(245,158,11,.35)}
.lc-theme .cta-button:hover{background:#d97706;transform:translateY(-2px);box-shadow:0 8px 32px rgba(245,158,11,.45)}
.lc-theme dl{display:grid;gap:1rem}
.lc-theme dt{font-weight:700;color:#14532d;font-size:1.05rem;padding-bottom:6px;border-bottom:2px solid #bbf7d0}
.lc-theme dd{color:#44403c;margin:0;padding-left:1.25rem;border-left:4px solid #f59e0b}
body.irents-theme-local{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;background:#fffef7;-webkit-font-smoothing:antialiased}
body.irents-theme-local header.site-header,body.irents-theme-local #masthead,body.irents-theme-local .site-header{background:#15803d!important;border-bottom:none!important;box-shadow:0 2px 8px rgba(0,0,0,.12)!important}
body.irents-theme-local .site-title a,body.irents-theme-local .site-branding a{color:#fff!important;font-weight:800!important;text-decoration:none!important}
body.irents-theme-local .main-navigation a,body.irents-theme-local #site-navigation a{color:#dcfce7!important;font-weight:600;text-decoration:none}
body.irents-theme-local .main-navigation a:hover,body.irents-theme-local #site-navigation a:hover{color:#fef08a!important}
body.irents-theme-local #page{max-width:100%!important}
body.irents-theme-local .site-content,body.irents-theme-local #content,body.irents-theme-local .content-area,body.irents-theme-local #primary,body.irents-theme-local .entry-content,body.irents-theme-local article.page{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-local .page-header,body.irents-theme-local .entry-header{display:none!important}
body.irents-theme-local footer.site-footer,body.irents-theme-local .site-footer,body.irents-theme-local #colophon{background:#14532d!important;color:#bbf7d0!important;border-top:none!important;padding:60px 5vw!important}
body.irents-theme-local footer a,body.irents-theme-local .site-footer a{color:#fde68a!important;text-decoration:none}
@media(max-width:768px){.lc-theme section:not(:first-of-type){padding:64px 24px}.lc-theme section:first-of-type{min-height:75vh;padding:80px 24px;border-radius:0 0 32px 32px}}
`.trim();

// ─── Registry ──────────────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeMeta> = {
  horizon: {
    name: 'horizon',
    label: 'Horizon',
    tagline: 'Clean & Modern',
    description: 'Slate-black nav, sky-blue accents, full-bleed hero. Great for modern service companies.',
    colors: ['#0f172a', '#0ea5e9', '#f8fafc', '#475569'],
    bodyClass: 'irents-theme-horizon',
    wrapperClass: 'hz-theme',
    css: HORIZON_CSS,
  },
  authority: {
    name: 'authority',
    label: 'Authority',
    tagline: 'Bold & Corporate',
    description: 'Charcoal header, gold accents, serif headings. Signals trust and premium quality.',
    colors: ['#1a1a2e', '#c8a951', '#fdfbf7', '#3d3a50'],
    bodyClass: 'irents-theme-authority',
    wrapperClass: 'au-theme',
    css: AUTHORITY_CSS,
  },
  local: {
    name: 'local',
    label: 'Local',
    tagline: 'Warm & Community',
    description: 'Forest-green header, amber CTAs, rounded and friendly. Built for neighborhood businesses.',
    colors: ['#15803d', '#f59e0b', '#fffef7', '#44403c'],
    bodyClass: 'irents-theme-local',
    wrapperClass: 'lc-theme',
    css: LOCAL_CSS,
  },
};

// ─── Preview HTML ──────────────────────────────────────────────────────────────

const SAMPLE_CONTENT = `
<div class="{wrapperClass}">
<section>
  <h1>Professional Party Rentals in Austin, TX</h1>
  <p>From bounce houses to full event setups, we bring the celebration to you. Serving Austin and surrounding areas for over 10 years.</p>
  <a href="#" class="cta-button">Get a Free Quote</a>
</section>
<section>
  <h2>Our Most Popular Rentals</h2>
  <p>We carry the widest selection of party rental equipment in central Texas. Whether you need a single bounce house or a complete event package, we have you covered.</p>
  <ul>
    <li>Bounce houses &amp; obstacle courses</li>
    <li>Water slides and splash pads</li>
    <li>Tables, chairs, and linens</li>
    <li>Tent and canopy rentals</li>
    <li>Concession machines</li>
  </ul>
  <a href="#" class="cta-button">Browse All Rentals</a>
</section>
<section>
  <h2>Why Austin Families Choose Us</h2>
  <h3>10+ Years of Experience</h3>
  <p>Serving Austin families since 2013. Our experience means smoother events and happier customers every time.</p>
  <h3>Safety First, Always</h3>
  <p>All equipment is cleaned, inspected, and certified before every rental. Your guests safety is our top priority.</p>
  <h3>Same-Day Delivery Available</h3>
  <p>Need it fast? We offer same-day delivery and setup across Austin, Round Rock, and Cedar Park.</p>
</section>
<section>
  <h2>Frequently Asked Questions</h2>
  <dl>
    <dt>How far in advance should I book?</dt>
    <dd>We recommend booking at least 2 weeks in advance for weekends, especially during summer. Same-week bookings are possible based on availability.</dd>
    <dt>Do you deliver and set up the equipment?</dt>
    <dd>Yes — delivery, setup, and pickup are included in every rental. Our team handles everything so you can focus on your event.</dd>
    <dt>What happens if it rains?</dt>
    <dd>We monitor weather closely. If severe weather is forecast, we can reschedule at no extra charge.</dd>
  </dl>
</section>
</div>`.trim();

export function buildPreviewHtml(theme: ThemeName): string {
  const t = THEMES[theme];
  const content = SAMPLE_CONTENT.replace('{wrapperClass}', t.wrapperClass);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}
body{margin:0;padding:0}
/* Simulated WP nav */
.preview-header{display:flex;align-items:center;justify-content:space-between;padding:0 5vw;height:64px}
.preview-nav{display:flex;gap:2rem}
.preview-nav a{font-size:.875rem;font-weight:500;text-decoration:none}
.preview-footer-inner{max-width:960px;margin:0 auto;text-align:center}
${t.css}
</style>
</head>
<body class="${t.bodyClass}">
<header class="site-header preview-header">
  <a href="#" class="site-title" style="font-size:1.2rem;font-weight:700;">YourBusiness</a>
  <nav class="main-navigation preview-nav">
    <a href="#">Home</a>
    <a href="#">Services</a>
    <a href="#">Locations</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</header>
<main id="main" class="site-content">
  <article class="page">
    <div class="entry-content">
      ${content}
    </div>
  </article>
</main>
<footer class="site-footer">
  <div class="preview-footer-inner">
    <p>YourBusiness &mdash; Austin, TX &mdash; (512) 555-0100</p>
    <p style="margin-top:.5rem">Serving Austin, Round Rock, Cedar Park &amp; surrounding areas</p>
    <p style="margin-top:1.5rem;opacity:.6;font-size:.8rem">&copy; 2025 YourBusiness. All rights reserved.</p>
  </div>
</footer>
</body>
</html>`;
}
