export type ThemeName = 'horizon' | 'authority' | 'local';

export interface ThemeMeta {
  name: ThemeName;
  label: string;
  description: string;
  bodyClass: string;
  wrapperClass: string;
  css: string;
}

// ─── HORIZON ─────────────────────────────────────────────────────────────────
// Clean / Modern / Tech-Forward  ·  Linear / Vercel aesthetic
// Slate-black nav, sky-blue accents, white body, full-bleed hero

const HORIZON_CSS = `
/* ── Content wrapper (works standalone in app preview) ── */
.hz-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;color:#0f172a;line-height:1.7;background:#fff}
.hz-theme *{box-sizing:border-box;margin:0;padding:0}

/* ── Hero ── */
.hz-theme section:first-of-type{background:linear-gradient(150deg,#0f172a 0%,#0c1e3a 55%,#0a2952 100%);min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden}
.hz-theme section:first-of-type::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(56,189,248,.12) 0%,transparent 70%);pointer-events:none}
.hz-theme section:first-of-type h1{font-size:clamp(2.5rem,5.5vw,4.5rem);font-weight:800;color:#fff;line-height:1.12;letter-spacing:-.03em;margin-bottom:1.5rem;max-width:860px;position:relative;z-index:1}
.hz-theme section:first-of-type p{font-size:1.2rem;color:#94a3b8;max-width:580px;margin:0 auto 2.5rem;position:relative;z-index:1}
.hz-theme section:first-of-type a.cta-button{position:relative;z-index:1}

/* ── Sections ── */
.hz-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.hz-theme section:nth-of-type(even):not(:first-of-type){background:#f8fafc}
.hz-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}

/* ── Headings ── */
.hz-theme h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:700;color:#0f172a;letter-spacing:-.015em;margin-bottom:.5rem}
.hz-theme h2::after{content:'';display:block;width:44px;height:3px;background:#0ea5e9;border-radius:2px;margin-top:.75rem;margin-bottom:1.5rem}
.hz-theme h3{font-size:1.15rem;font-weight:600;color:#1e293b;margin-top:2rem;margin-bottom:.5rem}

/* ── Body ── */
.hz-theme p{color:#475569;font-size:1rem;margin-bottom:1rem}
.hz-theme ul,.hz-theme ol{color:#475569;padding-left:1.5rem;margin-bottom:1.5rem}
.hz-theme li{margin-bottom:.5rem}
.hz-theme li::marker{color:#0ea5e9}

/* ── CTA ── */
.hz-theme .cta-button{display:inline-block;background:#0ea5e9;color:#fff!important;padding:16px 40px;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none!important;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(14,165,233,.35)}
.hz-theme .cta-button:hover{background:#0284c7;transform:translateY(-2px);box-shadow:0 8px 32px rgba(14,165,233,.45)}

/* ── FAQ ── */
.hz-theme dl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden}
.hz-theme dt{background:#f1f5f9;padding:16px 24px;font-weight:600;color:#0f172a;border-top:1px solid #e2e8f0}
.hz-theme dt:first-of-type{border-top:none}
.hz-theme dd{padding:16px 24px;color:#475569;margin:0;border-top:1px solid #e2e8f0}

/* ── WordPress Site-Wide (requires body.irents-theme-horizon) ── */
body.irents-theme-horizon{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;margin:0;-webkit-font-smoothing:antialiased}

/* Header */
body.irents-theme-horizon header.site-header,body.irents-theme-horizon #masthead,body.irents-theme-horizon .site-header,body.irents-theme-horizon #site-header,body.irents-theme-horizon .ast-main-header-wrap{background:#0f172a!important;border-bottom:1px solid #1e293b!important;box-shadow:none!important}
body.irents-theme-horizon .site-title a,body.irents-theme-horizon .site-branding a,body.irents-theme-horizon .ast-site-title-wrap a{color:#fff!important;font-weight:700!important;text-decoration:none!important}
body.irents-theme-horizon .site-description{color:#64748b!important}

/* Nav */
body.irents-theme-horizon .main-navigation,body.irents-theme-horizon #site-navigation,body.irents-theme-horizon .ast-main-navigation{background:#0f172a!important}
body.irents-theme-horizon .main-navigation a,body.irents-theme-horizon #site-navigation a,body.irents-theme-horizon nav.main-navigation ul li a,body.irents-theme-horizon .ast-menu-toggle{color:#94a3b8!important;font-weight:500;transition:color .2s;text-decoration:none}
body.irents-theme-horizon .main-navigation a:hover,body.irents-theme-horizon #site-navigation a:hover,body.irents-theme-horizon nav a:hover{color:#38bdf8!important}

/* Remove WP content constraints */
body.irents-theme-horizon #page{max-width:100%!important}
body.irents-theme-horizon .site-content,body.irents-theme-horizon #content,body.irents-theme-horizon .content-area,body.irents-theme-horizon #primary{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-horizon .entry-content,body.irents-theme-horizon article.page,body.irents-theme-horizon article.post,body.irents-theme-horizon .post-content,body.irents-theme-horizon .entry,body.irents-theme-horizon .ast-article-single{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important}
body.irents-theme-horizon .page-header,.irents-theme-horizon .entry-header{display:none!important}

/* Footer */
body.irents-theme-horizon footer.site-footer,body.irents-theme-horizon .site-footer,body.irents-theme-horizon #colophon,body.irents-theme-horizon #footer{background:#0f172a!important;color:#64748b!important;border-top:1px solid #1e293b!important;padding:60px 5vw!important}
body.irents-theme-horizon footer a,body.irents-theme-horizon .site-footer a,body.irents-theme-horizon #colophon a{color:#38bdf8!important;text-decoration:none}
body.irents-theme-horizon .site-info,.irents-theme-horizon footer p{color:#475569;font-size:.875rem}

@media(max-width:768px){.hz-theme section:not(:first-of-type){padding:64px 24px}.hz-theme section:first-of-type{min-height:75vh;padding:80px 24px}}

/* ── ISM Component Classes (Horizon) ── */
.ism-hero{background:linear-gradient(150deg,#0f172a 0%,#0c1e3a 55%,#0a2952 100%);min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;position:relative;overflow:hidden;width:100%}
.ism-hero .ism-figure--hero{position:absolute;inset:0;z-index:1;margin:0;padding:0}
.ism-hero .ism-figure--hero img{width:100%;height:100%;object-fit:cover;opacity:.15;display:block}
.ism-hero__inner{position:relative;z-index:2;max-width:900px;margin:0 auto}
.ism-eyebrow{display:inline-block;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#38bdf8;margin-bottom:1rem;opacity:.9}
.ism-hero__title{font-size:clamp(2.5rem,5.5vw,4.5rem);font-weight:800;color:#fff;line-height:1.12;letter-spacing:-.03em;margin-bottom:1.5rem}
.ism-hero__lead{font-size:1.2rem;color:#94a3b8;max-width:580px;margin:0 auto 2.5rem}
.ism-hero__actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.ism-btn{display:inline-block;padding:14px 36px;border-radius:8px;font-weight:700;font-size:1rem;text-decoration:none!important;transition:all .2s;cursor:pointer}
.ism-btn--primary{background:#0ea5e9;color:#fff!important;box-shadow:0 4px 20px rgba(14,165,233,.35)}
.ism-btn--primary:hover{background:#0284c7;transform:translateY(-2px);box-shadow:0 8px 32px rgba(14,165,233,.45)}
.ism-btn--secondary{background:transparent;color:#94a3b8!important;border:2px solid rgba(148,163,184,.4)}
.ism-btn--secondary:hover{border-color:#0ea5e9;color:#38bdf8!important}
.ism-section{padding:96px 5vw;width:100%}
.ism-section:nth-of-type(even){background:#f8fafc}
.ism-container{max-width:960px;margin:0 auto}
.ism-container h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:700;color:#0f172a;letter-spacing:-.015em;margin-bottom:.5rem}
.ism-container h2::after{content:'';display:block;width:44px;height:3px;background:#0ea5e9;border-radius:2px;margin-top:.75rem;margin-bottom:1.5rem}
.ism-container p{color:#475569;font-size:1rem;margin-bottom:1rem}
.ism-process-list{counter-reset:steps;list-style:none;padding:0;margin:2rem 0 0;display:grid;gap:1.5rem}
.ism-process-list li{counter-increment:steps;padding-left:3.5rem;position:relative;color:#475569}
.ism-process-list li::before{content:counter(steps);position:absolute;left:0;top:.1em;width:2.25rem;height:2.25rem;border-radius:50%;background:#0ea5e9;color:#fff;font-weight:700;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.ism-reviews__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:2rem}
.ism-review-card{background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.75rem;display:flex;flex-direction:column;gap:.75rem;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.ism-review-card__stars{color:#0ea5e9;font-size:1.1rem;letter-spacing:.05em}
.ism-review-card__quote{color:#475569;font-size:.95rem;font-style:italic;line-height:1.65;margin:0}
.ism-review-card__name{font-weight:700;color:#0f172a}
.ism-review-card__location{color:#94a3b8;font-size:.875rem;margin-left:.5rem}
.ism-faq__list dl{border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:0}
.ism-faq__list dt{background:#f1f5f9;padding:16px 24px;font-weight:600;color:#0f172a;border-top:1px solid #e2e8f0}
.ism-faq__list dt:first-of-type{border-top:none}
.ism-faq__list dd{padding:16px 24px;color:#475569;margin:0;border-top:1px solid #e2e8f0}
.ism-cta-banner{background:linear-gradient(150deg,#0f172a 0%,#0c1e3a 55%,#0a2952 100%);padding:96px 5vw;width:100%;text-align:center}
.ism-cta-banner__inner{max-width:720px;margin:0 auto}
.ism-cta-banner__inner h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;color:#fff;margin-bottom:1rem}
.ism-cta-banner__inner h2::after{display:none}
.ism-cta-banner__inner p{color:#94a3b8;margin-bottom:2rem}
.ism-figure--content{margin:2rem 0;border-radius:12px;overflow:hidden}
.ism-figure--content img{max-width:100%;display:block;border-radius:12px}
@media(max-width:768px){.ism-hero{padding:80px 24px;min-height:75vh}.ism-section{padding:64px 24px}.ism-cta-banner{padding:64px 24px}.ism-hero__actions{flex-direction:column;align-items:center}}
`.trim();

// ─── AUTHORITY ────────────────────────────────────────────────────────────────
// Bold / Corporate / Trust-Forward  ·  McKinsey / Legal / Enterprise
// Charcoal header, gold accents, warm-cream body, serif headings

const AUTHORITY_CSS = `
/* ── Content wrapper ── */
.au-theme{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;line-height:1.75;background:#fdfbf7}
.au-theme *{box-sizing:border-box;margin:0;padding:0}

/* ── Hero ── */
.au-theme section:first-of-type{background:#1a1a2e;min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden;border-bottom:4px solid #c8a951}
.au-theme section:first-of-type h1{font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.25rem,5vw,4rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-.01em;margin-bottom:1.5rem;max-width:820px;position:relative;z-index:1}
.au-theme section:first-of-type h1::after{content:'';display:block;width:72px;height:3px;background:#c8a951;margin:.75rem auto 0}
.au-theme section:first-of-type p{font-size:1.15rem;color:#a5accc;max-width:580px;margin:1.5rem auto 2.5rem;position:relative;z-index:1}
.au-theme section:first-of-type a.cta-button{position:relative;z-index:1}

/* ── Sections ── */
.au-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.au-theme section:nth-of-type(even):not(:first-of-type){background:#f5f0e8}
.au-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}

/* ── Headings ── */
.au-theme h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.6rem,2.8vw,2.2rem);font-weight:700;color:#1a1a2e;letter-spacing:-.01em;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:2px solid #e5ddc8}
.au-theme h3{font-size:1.1rem;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:.06em;margin-top:2rem;margin-bottom:.5rem}

/* ── Body ── */
.au-theme p{color:#3d3a50;font-size:1.05rem;margin-bottom:1rem}
.au-theme ul,.au-theme ol{color:#3d3a50;padding-left:1.5rem;margin-bottom:1.5rem}
.au-theme li{margin-bottom:.5rem}
.au-theme li::marker{color:#c8a951}

/* ── CTA ── */
.au-theme .cta-button{display:inline-block;background:#c8a951;color:#1a1a2e!important;padding:16px 44px;border-radius:4px;font-weight:700;font-size:1rem;text-decoration:none!important;text-transform:uppercase;letter-spacing:.08em;transition:background .2s,box-shadow .2s;box-shadow:0 4px 16px rgba(200,169,81,.3)}
.au-theme .cta-button:hover{background:#b8953f;box-shadow:0 6px 24px rgba(200,169,81,.45)}

/* ── FAQ ── */
.au-theme dl{margin-top:1rem}
.au-theme dt{padding:16px 0;font-family:Georgia,serif;font-weight:700;color:#1a1a2e;border-bottom:1px solid #e5ddc8;font-size:1.05rem}
.au-theme dd{padding:12px 0 20px 1.25rem;color:#4a4768;margin:0;border-left:3px solid #c8a951}

/* ── WordPress Site-Wide ── */
body.irents-theme-authority{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#fdfbf7;-webkit-font-smoothing:antialiased}

body.irents-theme-authority header.site-header,body.irents-theme-authority #masthead,body.irents-theme-authority .site-header,body.irents-theme-authority #site-header,body.irents-theme-authority .ast-main-header-wrap{background:#1a1a2e!important;border-bottom:3px solid #c8a951!important;box-shadow:none!important}
body.irents-theme-authority .site-title a,body.irents-theme-authority .site-branding a,body.irents-theme-authority .ast-site-title-wrap a{color:#fff!important;font-family:Georgia,serif!important;font-weight:700!important;text-decoration:none!important}
body.irents-theme-authority .site-description{color:#a5accc!important}

body.irents-theme-authority .main-navigation,body.irents-theme-authority #site-navigation{background:#1a1a2e!important}
body.irents-theme-authority .main-navigation a,body.irents-theme-authority #site-navigation a,body.irents-theme-authority nav.main-navigation ul li a{color:#a5accc!important;font-weight:500;text-decoration:none;letter-spacing:.04em;font-size:.875rem;text-transform:uppercase}
body.irents-theme-authority .main-navigation a:hover,body.irents-theme-authority #site-navigation a:hover{color:#c8a951!important}

body.irents-theme-authority #page{max-width:100%!important}
body.irents-theme-authority .site-content,body.irents-theme-authority #content,body.irents-theme-authority .content-area,body.irents-theme-authority #primary{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-authority .entry-content,body.irents-theme-authority article.page,body.irents-theme-authority article.post,body.irents-theme-authority .ast-article-single{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important}
body.irents-theme-authority .page-header,body.irents-theme-authority .entry-header{display:none!important}

body.irents-theme-authority footer.site-footer,body.irents-theme-authority .site-footer,body.irents-theme-authority #colophon,body.irents-theme-authority #footer{background:#13121e!important;color:#a5accc!important;border-top:3px solid #c8a951!important;padding:60px 5vw!important}
body.irents-theme-authority footer a,body.irents-theme-authority .site-footer a{color:#c8a951!important;text-decoration:none}
body.irents-theme-authority .site-info,body.irents-theme-authority footer p{color:#6b6885;font-size:.875rem}

@media(max-width:768px){.au-theme section:not(:first-of-type){padding:64px 24px}.au-theme section:first-of-type{min-height:75vh;padding:80px 24px}}

/* ── ISM Component Classes (Authority) ── */
.ism-hero{background:#1a1a2e;min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;position:relative;overflow:hidden;width:100%;border-bottom:4px solid #c8a951}
.ism-hero .ism-figure--hero{position:absolute;inset:0;z-index:1;margin:0;padding:0}
.ism-hero .ism-figure--hero img{width:100%;height:100%;object-fit:cover;opacity:.15;display:block}
.ism-hero__inner{position:relative;z-index:2;max-width:900px;margin:0 auto}
.ism-eyebrow{display:inline-block;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#c8a951;margin-bottom:1rem;opacity:.9}
.ism-hero__title{font-family:Georgia,'Times New Roman',serif;font-size:clamp(2.25rem,5vw,4rem);font-weight:700;color:#fff;line-height:1.15;letter-spacing:-.01em;margin-bottom:1.5rem}
.ism-hero__lead{font-size:1.15rem;color:#a5accc;max-width:580px;margin:0 auto 2.5rem}
.ism-hero__actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.ism-btn{display:inline-block;padding:14px 36px;border-radius:4px;font-weight:700;font-size:1rem;text-decoration:none!important;transition:all .2s;cursor:pointer;text-transform:uppercase;letter-spacing:.06em}
.ism-btn--primary{background:#c8a951;color:#1a1a2e!important;box-shadow:0 4px 16px rgba(200,169,81,.3)}
.ism-btn--primary:hover{background:#b8953f;box-shadow:0 6px 24px rgba(200,169,81,.45)}
.ism-btn--secondary{background:transparent;color:#a5accc!important;border:2px solid rgba(200,169,81,.35)}
.ism-btn--secondary:hover{border-color:#c8a951;color:#c8a951!important}
.ism-section{padding:96px 5vw;width:100%}
.ism-section:nth-of-type(even){background:#f5f0e8}
.ism-container{max-width:960px;margin:0 auto}
.ism-container h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.6rem,2.8vw,2.2rem);font-weight:700;color:#1a1a2e;letter-spacing:-.01em;margin-bottom:1rem;padding-bottom:.75rem;border-bottom:2px solid #e5ddc8}
.ism-container p{color:#3d3a50;font-size:1.05rem;margin-bottom:1rem}
.ism-process-list{counter-reset:steps;list-style:none;padding:0;margin:2rem 0 0;display:grid;gap:1.5rem}
.ism-process-list li{counter-increment:steps;padding-left:3.5rem;position:relative;color:#3d3a50}
.ism-process-list li::before{content:counter(steps);position:absolute;left:0;top:.1em;width:2.25rem;height:2.25rem;border-radius:50%;background:#c8a951;color:#1a1a2e;font-weight:700;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.ism-reviews__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:2rem}
.ism-review-card{background:#fff;border:1px solid #e5ddc8;border-radius:6px;padding:1.75rem;display:flex;flex-direction:column;gap:.75rem;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.ism-review-card__stars{color:#c8a951;font-size:1.1rem;letter-spacing:.05em}
.ism-review-card__quote{color:#3d3a50;font-size:.95rem;font-style:italic;line-height:1.65;margin:0}
.ism-review-card__name{font-weight:700;color:#1a1a2e}
.ism-review-card__location{color:#a5accc;font-size:.875rem;margin-left:.5rem}
.ism-faq__list dt{padding:16px 0;font-family:Georgia,serif;font-weight:700;color:#1a1a2e;border-bottom:1px solid #e5ddc8;font-size:1.05rem}
.ism-faq__list dd{padding:12px 0 20px 1.25rem;color:#4a4768;margin:0;border-left:3px solid #c8a951}
.ism-cta-banner{background:#13121e;padding:96px 5vw;width:100%;text-align:center}
.ism-cta-banner__inner{max-width:720px;margin:0 auto}
.ism-cta-banner__inner h2{font-family:Georgia,'Times New Roman',serif;font-size:clamp(1.75rem,3vw,2.25rem);font-weight:700;color:#fff;margin-bottom:1rem;border-bottom:none;padding-bottom:0}
.ism-cta-banner__inner p{color:#a5accc;margin-bottom:2rem}
.ism-figure--content{margin:2rem 0;border-radius:6px;overflow:hidden}
.ism-figure--content img{max-width:100%;display:block;border-radius:6px}
@media(max-width:768px){.ism-hero{padding:80px 24px;min-height:75vh}.ism-section{padding:64px 24px}.ism-cta-banner{padding:64px 24px}.ism-hero__actions{flex-direction:column;align-items:center}}
`.trim();

// ─── LOCAL ────────────────────────────────────────────────────────────────────
// Warm / Community / Service Business  ·  Neighborhood-first feel
// Forest-green nav, amber CTAs, warm-white body, rounded & friendly

const LOCAL_CSS = `
/* ── Content wrapper ── */
.lc-theme{font-family:'Helvetica Neue',Arial,sans-serif;color:#1c1917;line-height:1.75;background:#fffef7}
.lc-theme *{box-sizing:border-box;margin:0;padding:0}

/* ── Hero ── */
.lc-theme section:first-of-type{background:linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%);min-height:88vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;width:100%;position:relative;overflow:hidden;border-radius:0 0 48px 48px}
.lc-theme section:first-of-type h1{font-size:clamp(2.5rem,5.5vw,4.25rem);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.02em;margin-bottom:1.5rem;max-width:820px;text-shadow:0 2px 12px rgba(0,0,0,.15)}
.lc-theme section:first-of-type p{font-size:1.2rem;color:#bbf7d0;max-width:560px;margin:0 auto 2.5rem}
.lc-theme section:first-of-type a.cta-button{position:relative;z-index:1}

/* ── Sections ── */
.lc-theme section:not(:first-of-type){padding:96px 5vw;width:100%}
.lc-theme section:nth-of-type(even):not(:first-of-type){background:#fef9e7}
.lc-theme section:not(:first-of-type)>*{max-width:960px;margin-left:auto;margin-right:auto;display:block}

/* ── Headings ── */
.lc-theme h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;color:#14532d;letter-spacing:-.015em;margin-bottom:1.25rem;display:flex;align-items:center;gap:.75rem}
.lc-theme h2::before{content:'';flex-shrink:0;width:6px;height:28px;background:#f59e0b;border-radius:3px}
.lc-theme h3{font-size:1.15rem;font-weight:700;color:#15803d;margin-top:2rem;margin-bottom:.5rem}

/* ── Body ── */
.lc-theme p{color:#44403c;font-size:1.05rem;margin-bottom:1rem}
.lc-theme ul,.lc-theme ol{color:#44403c;padding-left:1.5rem;margin-bottom:1.5rem}
.lc-theme li{margin-bottom:.5rem;padding-left:.25rem}
.lc-theme li::marker{color:#16a34a}

/* ── CTA ── */
.lc-theme .cta-button{display:inline-block;background:#f59e0b;color:#1c1917!important;padding:16px 44px;border-radius:9999px;font-weight:800;font-size:1rem;text-decoration:none!important;transition:background .2s,transform .15s,box-shadow .2s;box-shadow:0 4px 20px rgba(245,158,11,.35)}
.lc-theme .cta-button:hover{background:#d97706;transform:translateY(-2px);box-shadow:0 8px 32px rgba(245,158,11,.45)}

/* ── FAQ ── */
.lc-theme dl{display:grid;gap:1rem}
.lc-theme dt{font-weight:700;color:#14532d;font-size:1.05rem;padding-bottom:6px;border-bottom:2px solid #bbf7d0}
.lc-theme dd{color:#44403c;margin:0;padding-left:1.25rem;border-left:4px solid #f59e0b}

/* ── WordPress Site-Wide ── */
body.irents-theme-local{font-family:'Helvetica Neue',Arial,sans-serif;margin:0;background:#fffef7;-webkit-font-smoothing:antialiased}

body.irents-theme-local header.site-header,body.irents-theme-local #masthead,body.irents-theme-local .site-header,body.irents-theme-local #site-header,body.irents-theme-local .ast-main-header-wrap{background:#15803d!important;border-bottom:none!important;box-shadow:0 2px 8px rgba(0,0,0,.12)!important}
body.irents-theme-local .site-title a,body.irents-theme-local .site-branding a,body.irents-theme-local .ast-site-title-wrap a{color:#fff!important;font-weight:800!important;text-decoration:none!important}
body.irents-theme-local .site-description{color:#bbf7d0!important}

body.irents-theme-local .main-navigation,body.irents-theme-local #site-navigation{background:#15803d!important}
body.irents-theme-local .main-navigation a,body.irents-theme-local #site-navigation a,body.irents-theme-local nav.main-navigation ul li a{color:#dcfce7!important;font-weight:600;text-decoration:none;transition:color .2s}
body.irents-theme-local .main-navigation a:hover,body.irents-theme-local #site-navigation a:hover{color:#fef08a!important}

body.irents-theme-local #page{max-width:100%!important}
body.irents-theme-local .site-content,body.irents-theme-local #content,body.irents-theme-local .content-area,body.irents-theme-local #primary{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important;float:none!important}
body.irents-theme-local .entry-content,body.irents-theme-local article.page,body.irents-theme-local article.post,body.irents-theme-local .ast-article-single{max-width:100%!important;padding:0!important;margin:0!important;width:100%!important}
body.irents-theme-local .page-header,body.irents-theme-local .entry-header{display:none!important}

body.irents-theme-local footer.site-footer,body.irents-theme-local .site-footer,body.irents-theme-local #colophon,body.irents-theme-local #footer{background:#14532d!important;color:#bbf7d0!important;border-top:none!important;padding:60px 5vw!important}
body.irents-theme-local footer a,body.irents-theme-local .site-footer a{color:#fde68a!important;text-decoration:none}
body.irents-theme-local .site-info,body.irents-theme-local footer p{color:#86efac;font-size:.875rem}

@media(max-width:768px){.lc-theme section:not(:first-of-type){padding:64px 24px}.lc-theme section:first-of-type{min-height:75vh;padding:80px 24px;border-radius:0 0 32px 32px}}

/* ── ISM Component Classes (Local) ── */
.ism-hero{background:linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%);min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 5vw;position:relative;overflow:hidden;width:100%;border-radius:0 0 48px 48px}
.ism-hero .ism-figure--hero{position:absolute;inset:0;z-index:1;margin:0;padding:0}
.ism-hero .ism-figure--hero img{width:100%;height:100%;object-fit:cover;opacity:.16;display:block}
.ism-hero__inner{position:relative;z-index:2;max-width:900px;margin:0 auto}
.ism-eyebrow{display:inline-block;font-size:.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#bbf7d0;margin-bottom:1rem;opacity:.9}
.ism-hero__title{font-size:clamp(2.5rem,5.5vw,4.25rem);font-weight:800;color:#fff;line-height:1.15;letter-spacing:-.02em;margin-bottom:1.5rem;text-shadow:0 2px 12px rgba(0,0,0,.15)}
.ism-hero__lead{font-size:1.2rem;color:#bbf7d0;max-width:560px;margin:0 auto 2.5rem}
.ism-hero__actions{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
.ism-btn{display:inline-block;padding:14px 36px;border-radius:9999px;font-weight:800;font-size:1rem;text-decoration:none!important;transition:all .2s;cursor:pointer}
.ism-btn--primary{background:#f59e0b;color:#1c1917!important;box-shadow:0 4px 20px rgba(245,158,11,.35)}
.ism-btn--primary:hover{background:#d97706;transform:translateY(-2px);box-shadow:0 8px 32px rgba(245,158,11,.45)}
.ism-btn--secondary{background:transparent;color:#dcfce7!important;border:2px solid rgba(255,255,255,.3)}
.ism-btn--secondary:hover{border-color:#f59e0b;color:#fef08a!important}
.ism-section{padding:96px 5vw;width:100%}
.ism-section:nth-of-type(even){background:#fef9e7}
.ism-container{max-width:960px;margin:0 auto}
.ism-container h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;color:#14532d;letter-spacing:-.015em;margin-bottom:1.25rem;display:flex;align-items:center;gap:.75rem}
.ism-container h2::before{content:'';flex-shrink:0;width:6px;height:28px;background:#f59e0b;border-radius:3px}
.ism-container p{color:#44403c;font-size:1.05rem;margin-bottom:1rem}
.ism-process-list{counter-reset:steps;list-style:none;padding:0;margin:2rem 0 0;display:grid;gap:1.5rem}
.ism-process-list li{counter-increment:steps;padding-left:3.5rem;position:relative;color:#44403c}
.ism-process-list li::before{content:counter(steps);position:absolute;left:0;top:.1em;width:2.25rem;height:2.25rem;border-radius:50%;background:#16a34a;color:#fff;font-weight:700;font-size:.9rem;display:flex;align-items:center;justify-content:center}
.ism-reviews__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-top:2rem}
.ism-review-card{background:#fff;border:1px solid #bbf7d0;border-radius:16px;padding:1.75rem;display:flex;flex-direction:column;gap:.75rem;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.ism-review-card__stars{color:#f59e0b;font-size:1.1rem;letter-spacing:.05em}
.ism-review-card__quote{color:#44403c;font-size:.95rem;font-style:italic;line-height:1.65;margin:0}
.ism-review-card__name{font-weight:700;color:#14532d}
.ism-review-card__location{color:#6b7280;font-size:.875rem;margin-left:.5rem}
.ism-faq__list dt{font-weight:700;color:#14532d;font-size:1.05rem;padding-bottom:6px;border-bottom:2px solid #bbf7d0;margin-bottom:.5rem}
.ism-faq__list dd{color:#44403c;margin:0 0 1.5rem 0;padding-left:1.25rem;border-left:4px solid #f59e0b}
.ism-cta-banner{background:linear-gradient(160deg,#14532d 0%,#166534 50%,#15803d 100%);padding:96px 5vw;width:100%;text-align:center;border-radius:48px 48px 0 0}
.ism-cta-banner__inner{max-width:720px;margin:0 auto}
.ism-cta-banner__inner h2{font-size:clamp(1.75rem,3vw,2.25rem);font-weight:800;color:#fff;margin-bottom:1rem;display:block}
.ism-cta-banner__inner h2::before{display:none}
.ism-cta-banner__inner p{color:#bbf7d0;margin-bottom:2rem}
.ism-figure--content{margin:2rem 0;border-radius:16px;overflow:hidden}
.ism-figure--content img{max-width:100%;display:block;border-radius:16px}
@media(max-width:768px){.ism-hero{padding:80px 24px;min-height:75vh;border-radius:0 0 32px 32px}.ism-section{padding:64px 24px}.ism-cta-banner{padding:64px 24px;border-radius:32px 32px 0 0}.ism-hero__actions{flex-direction:column;align-items:center}}
`.trim();

// ─── Registry ──────────────────────────────────────────────────────────────────

export const THEMES: Record<ThemeName, ThemeMeta> = {
  horizon: {
    name: 'horizon',
    label: 'Horizon',
    description: 'Clean and modern. Slate-black header, sky-blue accents, full-bleed hero.',
    bodyClass: 'irents-theme-horizon',
    wrapperClass: 'hz-theme',
    css: HORIZON_CSS,
  },
  authority: {
    name: 'authority',
    label: 'Authority',
    description: 'Bold and corporate. Charcoal header, gold accents, serif headings, trust-first.',
    bodyClass: 'irents-theme-authority',
    wrapperClass: 'au-theme',
    css: AUTHORITY_CSS,
  },
  local: {
    name: 'local',
    label: 'Local',
    description: 'Warm and community-driven. Forest-green header, amber CTAs, friendly and approachable.',
    bodyClass: 'irents-theme-local',
    wrapperClass: 'lc-theme',
    css: LOCAL_CSS,
  },
};

export function wrapWithTheme(html: string, _theme: ThemeName): string {
  // On WordPress the ISM theme handles all styling via its own CSS.
  // No wrapper div or inline CSS needed — just return the raw content.
  return html;
}

export function getThemePromptGuidelines(): string {
  return `━━━ HTML STRUCTURE RULES (ISM Theme) ━━━
Wrap every page in sections using these exact class names — the ISM WordPress theme
CSS is built around them. Do NOT deviate from this structure.

HERO SECTION (first section always):
<section class="ism-hero">
  <div class="ism-hero__inner">
    <span class="ism-eyebrow">Keyword or City phrase</span>
    <h1 class="ism-hero__title">Primary keyword headline</h1>
    <p class="ism-hero__lead">2–3 sentence compelling intro. Use primary keyword.</p>
    <div class="ism-hero__actions">
      <a class="ism-btn ism-btn--primary" href="/contact">Get a Free Quote →</a>
      <a class="ism-btn ism-btn--secondary" href="#services">Our Services</a>
    </div>
  </div>
</section>

STANDARD CONTENT SECTION:
<section class="ism-section">
  <div class="ism-container">
    <span class="ism-eyebrow">Section Label</span>
    <h2>Section Heading</h2>
    <p>Content...</p>
  </div>
</section>

BENEFITS SECTION (ul list):
<section class="ism-section ism-benefits">
  <div class="ism-container">
    <h2>Benefits heading</h2>
    <ul>
      <li><strong>Benefit title.</strong> 2-sentence explanation of this benefit.</li>
    </ul>
  </div>
</section>

PROCESS STEPS (ol list):
<section class="ism-section ism-process">
  <div class="ism-container">
    <h2>How It Works</h2>
    <ol class="ism-process-list">
      <li><strong>Step Name.</strong> 3 sentences: what happens, how long it takes, what the customer experiences.</li>
    </ol>
  </div>
</section>

REVIEWS SECTION:
<section class="ism-section ism-reviews">
  <div class="ism-container">
    <h2>What Clients Say</h2>
    <div class="ism-reviews__grid">
      <div class="ism-review-card">
        <div class="ism-review-card__stars">★★★★★</div>
        <blockquote class="ism-review-card__quote">"Customer quote here."</blockquote>
        <div><span class="ism-review-card__name">First Name</span> <span class="ism-review-card__location">City</span></div>
      </div>
    </div>
  </div>
</section>

FAQ SECTION:
<section class="ism-section ism-faq">
  <div class="ism-container">
    <h2>Frequently Asked Questions</h2>
    <div class="ism-faq__list">
      <dl>
        <dt>Question here?</dt>
        <dd>3–4 sentence answer.</dd>
      </dl>
    </div>
  </div>
</section>

CTA BANNER (last section always):
<section class="ism-cta-banner">
  <div class="ism-cta-banner__inner">
    <h2>Compelling closing headline</h2>
    <p>Restate core value prop. Primary keyword. Urgency or guarantee.</p>
    <a class="ism-btn ism-btn--primary" href="/contact">Get a Free Quote →</a>
  </div>
</section>

RULES:
- Use ONLY the class names shown above. No other classes or inline styles.
- Every section needs ism-eyebrow + h2 (except hero and cta-banner)
- <p> tags inside ism-container are automatically styled — no extra classes needed
- Images: do NOT add img tags — images are injected automatically`;
}
