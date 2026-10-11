# Can-Am Physical Therapy & Rehab: Site Audit

Audit date: 2026-10-11. Scope: every file in the repo (tracked + untracked), plus a read-only check of the live site at https://www.canamrehab.com. No files were changed except this one.

Tooling used (installed in a temp folder, nothing added to the repo): `html-validate` (recommended preset), `linkinator`, a cheerio-based extraction script, and a Node JSON-LD parse and FAQ comparison script.

> **Correction to the brief:** header and footer are **not** inlined on every page. `index.html`, `mva-physiotherapy.html` and `pelvic-floor-physiotherapy.html` load `components/header.html` and `components/footer.html` with `fetch()` at runtime. Only `canam_concussion_physiotherapy.html`, `physiotherapy-carstairs.html` and (new) `vestibular-physiotherapy.html` have their own inline header and footer. That means there are **four header variants** on a six-page site.

## Re-audit (pass 2, 2026-10-11)

**What changed since pass 1:** one new page, `vestibular-physiotherapy.html`, and its image `assets/images/vestibular-hero.webp`. Both are untracked, so they aren't deployed (live URL → 404). **No other file changed**, so none of the pass-1 findings are fixed yet. The full tool pass was re-run on all six pages, and the pass-1 results for the other five pages are unchanged.

**New page, vestibular-physiotherapy.html:** this is the strongest page on the site. Title is 60 chars, description is 139 chars, there's one H1 including Crossfield, the canonical is absolute and `.html`, it has `en-CA`, GA loads once, JSON-LD is valid, the breadcrumb matches its schema, and it reuses the person ID `#ankit-patel`. The hero is a 21 KB WebP, correctly preloaded with `fetchpriority="high"`, and below-fold images use lazy loading. It has a working skip link, and the mobile menu toggles `aria-expanded`. Its inline header is the only one that lists every service page (Pelvic, Concussion, Vestibular, MVA, Carstairs). Its issues are listed under **Vestibular page (new)** below.

**New site-wide issues found on this pass:**
- The concussion link is now broken on **two** pages. `vestibular-physiotherapy.html` links `concussion-physiotherapy.html` at :2442, :2611, :3617 and :3802 (linkinator: 404). Renaming the concussion file (Critical #1) fixes both pages.
- Vestibular isn't linked from `components/header.html`, `components/footer.html`, index, MVA, pelvic, Carstairs or concussion. Its only inbound internal link is from its own nav, so it's an **orphan page**.
- The index service card "Vestibular Rehab" (index.html:558-589) is the natural place to link the new page, but it has no link.

---

## 1. Summary

The three newer service pages (MVA, pelvic, concussion) are well built: they have unique titles, `en-CA`, canonicals, valid JSON-LD and good copy. They are held back by site-level problems. The **homepage has no meta description, canonical, Open Graph tags or schema**. It also has no crawlable HTML links to any service page, because its nav is injected by JavaScript, and linkinator's crawl stopped at index.html. The **concussion page is broken before launch**: the file is `canam_concussion_physiotherapy.html` while every canonical, nav link and schema URL points to `concussion-physiotherapy.html`, which returns 404 live. There is **no robots.txt or sitemap.xml**. Every page also returns 200 at both `/page` and `/page.html`, and the canonicals disagree on which form to use. Two leftover files are **publicly live**: a text file holding a form API key and a personal email address, and a full copy of another clinic's website (Bones & Balance).

**Top 5 fixes by SEO impact**
1. Give `index.html` a full `<head>`: description, canonical, OG/Twitter tags, `lang="en-CA"`, MedicalClinic JSON-LD, and a title and H1 that name the service and Crossfield.
2. Rename `canam_concussion_physiotherapy.html` → `concussion-physiotherapy.html` and add it to the shared header and footer.
3. Put header and footer links in static HTML on every page, or at least add static service links to the homepage body. Then add `sitemap.xml` and `robots.txt`.
4. Pick one URL form (recommended: `.html`, which 4 of 5 canonicals already use). Add `staticwebapp.config.json` with 301s from the other form, apex → www, and a 404 page.
5. Remove `assets/images/access.txt` and `assets/sample.html` from the deploy, then fix FAQPage schema drift on the MVA, pelvic, Carstairs and vestibular pages.

**Pass 2 addition:** commit `vestibular-physiotherapy.html` + `vestibular-hero.webp` together with the renamed concussion page. Link both from the shared header and footer and from the index services grid, then add both to the sitemap.

---

## 2. Findings

### Critical

| Severity | Page/File:line | Issue | Suggested fix |
|---|---|---|---|
| Critical | canam_concussion_physiotherapy.html (filename); :27, :65, :129 JSON-LD, :3106, :3196, :4674 | The file name doesn't match its own canonical, og:url, schema `@id`s and nav links (`concussion-physiotherapy.html`). The live URL returns 404 and linkinator reports 3 broken links. The file and both new images are also untracked in git, so they aren't deployed. | `git mv` to `concussion-physiotherapy.html` and commit it with `concussion-hero.png` / `concussion-rehab.webp`. |
| Critical | index.html:4-28 | No meta description, canonical, robots, OG or Twitter tags, and no JSON-LD at all on the most important page. | Add the full head block, matching the service pages. Add MedicalClinic + WebSite JSON-LD with `@id` `https://www.canamrehab.com/#clinic`. |
| Critical | index.html:277, :1061; mva-physiotherapy.html:3163, :4415; pelvic-floor-physiotherapy.html:3245, :4518 | Nav and footer are injected with `fetch()`, so the raw HTML of index.html has **zero links** to MVA, pelvic, Carstairs or concussion. Linkinator `--recurse` found only images. Discovery and internal PageRank depend entirely on JS rendering. | Inline the header and footer markup in each page, using the static pattern already on the concussion and Carstairs pages. Also add an in-body "Services" link list on index. |
| Critical | assets/images/access.txt (live: /assets/images/access.txt → 200) | Public text file containing a Web3Forms access key and a personal Gmail address. | Delete it from the repo and rotate that key in Web3Forms. Keep credentials out of the deploy folder. |
| Critical | assets/sample.html (live: /assets/sample.html → 200) | A full site for a different business ("Bones & Balance", admin@bonesandbalancept.com, @bonesandbalance.pt) is publicly served and indexable on canamrehab.com. | Delete it. If it must be kept, move it out of the deploy root. |

### High

| Severity | Page/File:line | Issue | Suggested fix |
|---|---|---|---|
| High | site root | No `robots.txt` or `sitemap.xml` (both 404 live). | Add both. The sitemap should list 5 canonical URLs with `lastmod`. robots.txt should reference the sitemap and `Disallow: /components/`. |
| High | live site; physiotherapy-carstairs.html:21, :29 vs other pages :27 | Every page is 200 at both `/x` and `/x.html`. Carstairs uses an extensionless canonical while the others use `.html`. The Carstairs schema `@id`s and breadcrumb (:45 block) also use extensionless URLs. | Standardise on `.html`, update the Carstairs canonical, og:url and JSON-LD, and add 301s in `staticwebapp.config.json`. |
| High | live | `https://canamrehab.com/` (apex) did not respond from this machine. `http://www` correctly 301s to https. | Check that the apex custom domain is bound in Azure SWA and redirects to www. |
| High | index.html:17; physiotherapy-carstairs.html:37 | Favicon points to `assets/images/favicon-transparent.png`, which doesn't exist (404, confirmed by linkinator). The concussion, MVA and pelvic pages have no favicon at all. `/favicon.ico` also returns 404. | Generate a favicon set (ico, 32px png, apple-touch-icon 180, manifest 192/512) and add identical `<link>`s to every page. |
| High | mva-physiotherapy.html:132 JSON-LD vs <details> :4073+ | FAQPage has 9 Qs and the page shows 10. Q3 to Q10 differ: answers are reworded, Q6 and Q8 wording changed, the visible "Can I still book if my accident happened weeks ago?" (:4289) is missing from schema, and the order is shifted. | Regenerate FAQPage from the visible `<details>` text, word for word. |
| High | pelvic-floor-physiotherapy.html:124 JSON-LD vs <details> :4201+ | FAQPage has 7 Qs and the page shows 10. Answers 2 and 5 are trimmed. Missing from schema: "How much does pelvic floor physiotherapy cost?" (:4330), "Do I need to know exactly what is wrong before booking?" (:4376) and "How do I book?" (:4424). Q7 wording also differs ("Where is Can-Am Physical Therapy located?" vs "Where is Can-Am located?"). | Regenerate from the visible text. |
| High | physiotherapy-carstairs.html:45 JSON-LD vs <details> :1521+ | FAQPage has 5 Qs and the page shows 6. All 5 answers differ in wording, Q2 is worded differently, and "Is direct billing available?" (:1562) is missing. | Regenerate from the visible text. |
| High | canam_concussion_physiotherapy.html:129; mva-physiotherapy.html:132; pelvic-floor-physiotherapy.html:124 | MedicalClinic is missing `geo`, `openingHoursSpecification`, `sameAs`, `hasMap`, `image` and `logo`. Carstairs (:45) has hours, sameAs and image but is missing `geo` and `hasMap`. | Use one identical clinic block everywhere: add geo lat/long for 818 Railway St, hasMap (the maps URL), sameAs (FB/IG), hours (Mon–Fri 08–19, Sat 09–14) and image/logo. |
| High | index.html:896-898 | NAP conflict: a second phone number, `+1 (587) 897-0676`, appears only on the homepage. Every other page uses 587-899-1653. | Remove it, or confirm it's intentional and add it everywhere. NAP should be one number. |
| High | pelvic-floor-physiotherapy.html:3338, :3561 | The hero is a 1,849 KB PNG and the detail image a 1,894 KB PNG. A 255 KB `pelvic-care-hero.jpg` already exists unused. | Convert both to WebP/AVIF at about 1200w (target under 150 KB). |
| High | canam_concussion_physiotherapy.html:30 preload, :3349 | The preloaded LCP hero `concussion-hero.png` is 2,039 KB. | Convert to WebP (about 150 KB) and update both the preload and the img. |
| High | index.html:284, :397, :430, :463, :496, :529, :562, :631, :752 | 9 images, all PNG at 600–806 KB each (about 6 MB in total). None has width/height, none uses lazy loading, and the hero has no `fetchpriority`. `home_care_physio…png` loads twice (:463, :631). | WebP at display size. Add width/height, `fetchpriority="high"` on :284 and `loading="lazy"` on everything else. |
| High | mva-physiotherapy.html:3246 | The hero `mva-hero.png` is 507 KB, while an unused `mva-hero.jpg` (111 KB) exists. There's no width/height and no `fetchpriority`. | Swap in a WebP, then add dimensions and `fetchpriority="high"`. |
| High | index.html:20; mva-physiotherapy.html:95; pelvic-floor-physiotherapy.html:93 | Tailwind Play CDN (`cdn.tailwindcss.com`) is render-blocking and not meant for production. On MVA and pelvic **no Tailwind utility classes are used** (the header defines its own `.hidden`, header.html:479). | Remove it from MVA and pelvic. On index, compile Tailwind to a static CSS file. |
| High | og/twitter tags: index (none), mva-physiotherapy.html:33-60, pelvic-floor-physiotherapy.html:33-60 | Missing `og:image` and `twitter:image` on index, MVA and pelvic. Concussion `og:image` (:70) is a 1122×1402 portrait PNG and is 404 live. Carstairs `og:image` (:30) is a 1024×1024 square. No page has `twitter:image`. | Make one 1200×630 JPG per page. Add `og:image`, `og:image:width/height`, `og:image:alt` and `twitter:image`. |

### Medium

| Severity | Page/File:line | Issue | Suggested fix |
|---|---|---|---|
| Medium | index.html:18 | Title "Can-Am Physical Therapy & Rehab \| Elevating Health" has no service or location. | e.g. "Physiotherapy in Crossfield, AB \| Can-Am Physical Therapy" (54 chars). |
| Medium | index.html:291 | H1 "Elevating Health. Restoring Motion." has no service or location. | e.g. "Physiotherapy & Rehab in Crossfield, Alberta" with the slogan as a sub-line. |
| Medium | index.html:2 | `lang="en"` (all other pages use `en-CA`). | `lang="en-CA"`. |
| Medium | mva-physiotherapy.html:3183; pelvic-floor-physiotherapy.html:3265 | The H1 doesn't include the location ("MVA Physiotherapy After a Car Accident" / "Pelvic Floor Physiotherapy"). Pelvic og:title (:43) also drops Crossfield. | "MVA Physiotherapy in Crossfield After a Car Accident" / "Pelvic Floor Physiotherapy in Crossfield". |
| Medium | mva-physiotherapy.html:17 (172 chars); pelvic-floor-physiotherapy.html:17 (202 chars) | Meta description is over 155 characters and will truncate. | Trim to under 155 by dropping the town list from the end. |
| Medium | canam_concussion_physiotherapy.html:13 (64); pelvic-floor-physiotherapy.html:13 (66) | Title is slightly over 60 characters. | Change "\| Can-Am Physical Therapy" to "\| Can-Am Rehab", or drop "Physiotherapy in" → "Physio". |
| Medium | canam_concussion_physiotherapy.html:4209 | H2 "Concussion Physiotherapy in Crossfield" exactly duplicates the H1 (:3287). | Rename it, e.g. "Visiting our Crossfield clinic". The same pattern appears at mva :3911 and pelvic :4058 (H2 = "X Physiotherapy in Crossfield"). That's fine there because those H1s differ, but it becomes a duplicate once the H1s get the location added. |
| Medium | index.html:344 | Heading skip: H1 → H3 ("Our Mission") with no H2. | Make Mission/Vision H2s, or add a visually hidden H2. |
| Medium | components/header.html:756-804, :1015-1040; components/footer.html Quick Links | Shared header has no Concussion link. The shared footer has no service links at all (only "Services" → index#services). | Add Pelvic, MVA, Concussion and Carstairs to both. |
| Medium | physiotherapy-carstairs.html:1185-1209, :1592-1620 | Carstairs nav has only on-page anchors: no Home, Services, or any other service page. Its footer has no service links. This page is an internal-link dead end. | Use the same header and footer as the rest of the site. |
| Medium | canam_concussion_physiotherapy.html:3097-3140 vs components/header.html | Three header variants with different labels: "Meet the Team" → index#therapist (component), "Your Physiotherapist" → #therapist / "Location" / "FAQs" (concussion), "Orthopedic Care / Home Visits" (Carstairs). Service labels also differ: "MVA / Car Accident Physiotherapy" vs "MVA Physiotherapy". | Use one header with identical labels and order. |
| Medium | components/header.html (no aria-current anywhere); canam_concussion_physiotherapy.html:3106 vs :3200 | The fetched header never sets `aria-current` (only the orphaned component.js would, and nothing loads it). On concussion, current is set on the desktop link but not on the mobile copy. Carstairs has none. | Hard-code `aria-current="page"` per page once the header is inlined. |
| Medium | assets/js/component.js (whole file) | Orphaned: no page loads it. It also targets IDs `cam-menu-button` / `cam-mobile-nav`, which don't exist (the header uses `mobile-menu-button` / `mobile-menu`, header.html:949, :985). | Delete it, or fix the IDs and use it in place of the three inline loaders. |
| Medium | index.html:1092-1094 | Mobile menu toggle never updates `aria-expanded` (MVA and pelvic do). | Mirror the mva-physiotherapy.html loader logic. |
| Medium | index.html:1101-1118 | Leftover scroll handler references `#navbar` / `#nav-inner`, which no longer exist, so the handler is dead. | Remove it. |
| Medium | index.html:22 (no defer); mva :101; pelvic :95; carstairs :43 | `lucide@latest` is unpinned (it can break without warning) and render-blocking on index. MVA and pelvic load the whole library for 2 icons (:3967, :4016 / :4095, :4144). | Pin a version and defer, or inline the 2 SVGs and drop Lucide on MVA and pelvic. |
| Medium | index.html:321, :621, :952 | Booking links use `http://canamrehab.janeapp.com/` with `target="_blank"` and no `rel="noopener"`. :854 (Maps) also has no rel. | `https://` + `rel="noopener"`. |
| Medium | index.html:990-1041 | 5 form fields have visual `<label>`s that aren't associated (no `for`/`id`). | Add `id` to each field and `for` to each label. |
| Medium | index.html:985 | Web3Forms key is hard-coded in the page (normal for Web3Forms) but differs from the key in access.txt. | Confirm which key is live and delete the other. |
| Medium | canam_concussion_physiotherapy.html:3630, :3982 | Declared dimensions don't match the files: `concussion-rehab.webp` is 704×395 but declared 1200×900 (wrong ratio, and upscaled so it renders soft). `ankit_patel_professional.png` is 640×640 but declared 900×1125. | Re-export the images at the declared size, or correct the attributes. |
| Medium | mva-physiotherapy.html:3408, :3677, :4040; pelvic-floor-physiotherapy.html:3561, :3636, :4168 | Below-fold images have no `loading="lazy"`, `width` or `height`. | Add all three. |
| Medium | logo `<img>`: components/header.html:745, components/footer.html:199, canam_concussion_physiotherapy.html:3074, :4639, physiotherapy-carstairs.html:1182, :1596 | `logo-short.png` is 198 KB at 623×519 for a roughly 50px logo and has no width/height. | Export a 2× WebP (under 15 KB) and add dimensions. |
| Medium | components/header.html:390-404 (`.cam-book-button`); index.html:234-236 (`.btn-gold`) | White text on gold `#C8960C` has a contrast ratio of 2.68:1. The index gradient to `#E8B84B` is 1.84:1. Both fail WCAG AA. Carstairs already uses the darker `#9f7405` (4.22:1, passes for large or bold text). | Use navy text on gold, or the `#9f7405` background. |
| Medium | canam_concussion_physiotherapy.html (WebPage :129 block); mva and pelvic (no WebPage node) | Medical content pages have no `MedicalWebPage`, `reviewedBy` or `lastReviewed`. | On concussion, pelvic and MVA, use `MedicalWebPage` with `reviewedBy` → Person `@id` and `lastReviewed`. |
| Medium | mva-physiotherapy.html:211 (Person); pelvic-floor-physiotherapy.html:176 (Person) | Person nodes have no `@id`. Concussion uses `https://www.canamrehab.com/#ankit-patel`. Carstairs has no Person node despite a therapist section (:1494). | Ankit `#ankit-patel` everywhere, Gursharanjit `#gursharanjit-bhambra`. |
| Medium | mva-physiotherapy.html, pelvic-floor-physiotherapy.html | No visible breadcrumb and no BreadcrumbList (concussion and Carstairs have both). | Add the same breadcrumb component and schema. |
| Medium | physiotherapy-carstairs.html:1218 vs JSON-LD | Visible breadcrumb says "Physiotherapy for Carstairs", schema says "…Carstairs Residents". | Make them identical. |
| Medium | site root | No 404 page. Live 404s return the Azure default page. | Add `404.html` + `responseOverrides` in `staticwebapp.config.json`. |
| Medium | components/header.html, components/footer.html (live: /components/header.html → 200) | Fragments are publicly crawlable as pages. Their relative links break at that path (linkinator: 8 × 404 when the fragments are loaded on their own). | `Disallow: /components/` and an `X-Robots-Tag: noindex` header via SWA config. This goes away if the header is inlined. |

### Low

| Severity | Page/File:line | Issue | Suggested fix |
|---|---|---|---|
| Low | canam_concussion_physiotherapy.html:4722 (footer); physiotherapy-carstairs.html:1605 (footer) | Footer address is shortened to "818 Railway St, Crossfield" (no AB T0M 0S0). The component footer has the full address. | Use the full NAP string. |
| Low | FAQ copy on all service pages vs JSON-LD | Visible copy says "818 Railway Street", schema/footer say "818 Railway St". | Minor. Pick one. |
| Low | pelvic-floor-physiotherapy.html:116 | Google Font "Great Vibes" is loaded but never used. | Remove it from the font URL. |
| Low | all pages | Design tokens drift: navy is `#1B3A6B` (index, Carstairs) vs `#183963` (MVA, pelvic, concussion). Breakpoints are 1000/700/420 (service pages), 960/700 (Carstairs), 1080/860/430 (header), 820/560 (footer). Fonts: DM Serif on 3 pages only, index loads weights 300/800. | Consolidate into one shared stylesheet. |
| Low | index.html:851, :980 | `</br>` is invalid (html-validate `void-content`). | `<br>`. |
| Low | canam_concussion_physiotherapy.html:4775; physiotherapy-carstairs.html:1244, :1505, :1623 | `aria-label` on a plain `<div>` is ignored (html-validate `aria-label-misuse`). | Add `role="group"`/`region` or drop the label. |
| Low | all pages (html-validate) | `tel-non-breaking` (37×) and `no-raw-characters` (raw `&`, 44×). | Cosmetic. Use `&amp;` and `&nbsp;` in phone text. |
| Low | .github/workflows/azure-static-web-apps-purple-beach-053a38e0f.yml:32 | `api_location: "api"` points to a folder that doesn't exist. | Set it to `""`. |
| Low | GA | ✅ `G-MNQC6XSFZ4` loads exactly once on all 5 pages. No duplicates. | None. |
| Low | Skip link | ✅ Concussion, Carstairs and header component all target `#main-content`, which exists. ❌ index.html has no `<main id="main-content">` (:279 is `<main>`), so the component skip link has no target there. | Add `id="main-content"` to index :279. |
| Low | focus | ✅ No `outline:none` without a replacement. The header has `:focus-visible` styles (header.html:635). | None. |

### Vestibular page (new in pass 2)

| Severity | Page/File:line | Issue | Suggested fix |
|---|---|---|---|
| Critical | vestibular-physiotherapy.html (untracked); live URL → 404 | The page and `vestibular-hero.webp` aren't committed, so they aren't deployed. The og:image URL (:70) is also 404 live. | Commit both files with the concussion rename. |
| High | all other pages + components/header.html, components/footer.html | Orphan page: nothing else links to vestibular. | Add it to the shared header and footer, the concussion and Carstairs inline navs, and the index "Vestibular Rehab" card (index.html:558-589). |
| High | vestibular-physiotherapy.html:2442, :2611, :3617, :3802 | 4 links to `concussion-physiotherapy.html`, which doesn't exist (the file is `canam_concussion_physiotherapy.html`). | Fixed by the concussion rename (Critical #1). |
| High | vestibular-physiotherapy.html:124 JSON-LD vs <details> :3450+ | FAQPage: 8/8 questions, but 4 differ. A4 (:3531) and A5 (:3553) are reworded, Q7 (:3598) "Can it help with dizziness after concussion?" vs schema "Can vestibular physiotherapy help…", A7's visible text adds a link sentence, and A8 (:3629) is reworded. | Copy the visible text into the schema exactly. Keep the "read our concussion page" sentence out of both or in both. |
| High | vestibular-physiotherapy.html:124 | MedicalClinic is missing geo, openingHoursSpecification, sameAs, hasMap and image (same as the other service pages). | Use the shared complete clinic block. |
| Medium | vestibular-physiotherapy.html:3333 | H2 "Vestibular Physiotherapy in Crossfield" exactly duplicates the H1 (:2742). | e.g. "Visiting our Crossfield clinic". |
| Medium | vestibular-physiotherapy.html:70 | og:image is the 844×603 WebP hero. Facebook/LinkedIn want at least 1200×630, and WebP support in OG scrapers is uneven. No `twitter:image`. | 1200×630 JPG + `twitter:image`. |
| Medium | vestibular-physiotherapy.html:55 vs :13 | og:title ("…\| Can-Am Physical Therapy") doesn't match the `<title>` ("…\| Vertigo & Dizziness"). | Fine to differ, but keep the keyword ("Vertigo") in both. |
| Medium | vestibular-physiotherapy.html (WebPage node, :124 block) | `WebPage` with no `reviewedBy`/`lastReviewed`. | Use `MedicalWebPage` with `reviewedBy` `#ankit-patel` and `lastReviewed`. |
| Medium | vestibular-physiotherapy.html:2457-2458 | The nav marks the current page with `class="current"` only, with no `aria-current="page"`. The mobile copy (:2618) has neither. | Add `aria-current="page"` to both links. |
| Medium | vestibular-physiotherapy.html:738-750 (`.cam-book-button`) | White on `#C8960C` has a contrast ratio of 2.68:1 (fails AA), same as the shared header. | Navy text, or `#9f7405` background. |
| Medium | vestibular-physiotherapy.html:2370, :2803, :3199, :3418, :3767 | No `<img>` has width/height (hero 844×603, Ankit 640×640, clinic 1200×912, logo 623×519), which risks layout shift. | Add intrinsic width/height. |
| Medium | vestibular-physiotherapy.html (no `<link rel="icon">`) | No favicon. | Add the shared favicon set. |
| Low | vestibular-physiotherapy.html:3850 (footer) | Footer address is shortened to "818 Railway St, Crossfield". | Full NAP: "818 Railway St, Crossfield, AB T0M 0S0". |
| Low | vestibular-physiotherapy.html:3903 | `aria-label` on a `<div>` (mobile actions). html-validate `aria-label-misuse`. | `role="group"` or remove the label. |
| Low | vestibular-physiotherapy.html (html-validate) | 18 errors in total: 11 `tel-non-breaking`, 6 `no-raw-characters`, 1 `aria-label-misuse`. Nothing structural. | Cosmetic. |
| Low | vestibular-physiotherapy.html:2965-2972 | Em dash + "not" contrast: "…symptoms and findings — not every person with dizziness needs the same…". | "Treatment is based on your symptoms and findings, so your plan fits your type of dizziness." |
| Low | vestibular-physiotherapy.html:3041-3044 (and schema :263) | "rather than repeatedly performing the same maneuver". | "…may need a more complete assessment to find the affected ear and canal." |
| Low | vestibular-physiotherapy.html:3565 | "The goal is not to overwhelm you." | "Exercises start at a level you can tolerate and progress gradually." |
| Low | vestibular-physiotherapy.html:3635 | Vague FAQ answer: "It varies. Treatment length depends on…". | Give a typical range (e.g. BPPV often settles in 1–3 visits; other vestibular cases are usually reviewed after 4–6 weeks). Clinic to confirm the numbers. |
| Low | vestibular-physiotherapy.html:259, :3038, :3044, :3511 | "maneuver" is the US spelling. The Canadian form is "manoeuvre". | "Epley manoeuvre". |
| ✅ | vestibular-physiotherapy.html:3675 | "Centre" is already the Canadian spelling. External links all have `rel="noopener"`. | None. |

### Copy rules (Step 7)

| Severity | File:line | Issue | Suggested fix |
|---|---|---|---|
| Low | canam_concussion_physiotherapy.html:4134, :4155, :4174; mva-physiotherapy.html:3834, :3855, :3876; pelvic-floor-physiotherapy.html:3878, :3899 | Em dash in review attribution: "Name — Google Review". | "Name, Google Review" or "Name · Google Review". |
| Low | pelvic-floor-physiotherapy.html:3659 | Em dash: "Physiotherapist — Pelvic Health". | "Pelvic Health Physiotherapist". |
| Low | pelvic-floor-physiotherapy.html:3667 | Em dash: "starts with listening — understanding…". | Use a colon, or split into two sentences. |
| Low | physiotherapy-carstairs.html:1301 | Em dash + "not X" contrast: "functional goals—not a generic routine." | "…and functional goals, so your plan fits you." |
| Low | canam_concussion_physiotherapy.html:3877 (H2), :3888 | Contrast constructions: "Recovery is not always about complete rest", "…rather than prolonged complete inactivity". | "Recovery includes gradual activity"; "…followed by a gradual return to light activity as tolerated." |
| Low | mva-physiotherapy.html:3514 | "Recovery is not only about a pain score." | "We track movement, strength and daily tasks along with pain." |
| Low | physiotherapy-carstairs.html:1460 | "Can-Am does not claim a clinic inside Carstairs." This reads defensively. | "All clinic appointments are at our Crossfield location, about 15–20 minutes from Carstairs." |
| Low | canam_concussion_physiotherapy.html:4146; mva-physiotherapy.html:3846 | "Instead of just dealing with symptoms…" | These are customer review quotes. Leave verbatim. |
| Medium | index.html:767; canam_concussion_physiotherapy.html:4016; mva-physiotherapy.html:3708 | Vague claim: "for many years". | State the actual years and registration (e.g. "since 20XX, registered with Physiotherapy Alberta College + Association"). |
| Medium | pelvic-floor-physiotherapy.html:4338 | Cost FAQ: "Pricing may vary depending on the appointment type." | List actual fees and durations from JaneApp (initial X min $Y, follow-up X min $Y). |
| Medium | physiotherapy-carstairs.html:1564; pelvic-floor-physiotherapy.html:4314 | "Coverage… vary by plan." | Name the insurers Can-Am direct-bills (e.g. Alberta Blue Cross, Sun Life, Canada Life…). |
| Medium | mva-physiotherapy.html:4143, :4169, :4297 | Insurance answers are "depends on your insurer/claim". | State the Alberta specifics: the Diagnostic and Treatment Protocols Regulation covers the first 10 physio visits for WAD I/II without pre-approval, so no referral is needed. Have the clinic verify before publishing. |
| Low | canam_concussion_physiotherapy.html:4459 | Return to work/school: "depends on your symptoms…". | Reference the stepwise return-to-learn / return-to-work stages from the Canadian guideline already linked on the page. |
| Low | all pages | Spelling: no US forms (behavior/center/color) found. "Orthopedic" (index :667, Carstairs :1186 etc.) is acceptable in Canada but "orthopaedic" is the Physiotherapy Alberta form. "travelling" (Carstairs :1355) is already Canadian. | Optional: switch to "orthopaedic" consistently. |
| ✅ | all pages | No lorem ipsum, TODOs or placeholder text found in visible copy. Form placeholders ("John Doe") are normal input hints. | None. |

### Repo hygiene (orphans, duplicates, leftovers)

| Severity | File | Issue | Suggested fix |
|---|---|---|---|
| Medium | assets/images: `hero_section_revamp_1763801427822.png` (4.8 MB), `Bones and Blance.bmp` (3.1 MB, other brand), `.png` (1.1 MB, file with no name), `balance.png` (1.1 MB, untracked) | Large unused files, deployed publicly. | Delete. |
| Low | Exact duplicates (same MD5): `vestibular.png` = `vestibular_rehab_…png`, `hero-bg.png` = `hero_physio_premium_…png`, `neuro-rehab.png` = `neuro_rehab_…png`, `home-care.png` = `home_care_physio_…png`, `workplace.png` = `workplace_ergonomics_…png`, `manual-therapy.png` = `manual_therapy_dry_needling_…png`, `cardiac-rehab.png` = `cardiac_rehab_…png`, `favicon-transparent-1.png` = `logo-12.png` | 8 duplicate pairs. | Keep one short-named copy of each, as WebP. |
| Low | Unused (no page references them): `ankit_patel_extracted.png`, `favicon.png`, `favicon-transparent-1.png`, `foreground*.jpeg/jpg` (5 files, incl. `foreground-mobile-old.jpg`), `hero-bg.png`, `hero_people_right.png`, `hero_physio_premium_…png`, `logo-11/12/13.png`, `logo-bg-final.png`, `logo-horizontal*.png`, `logo.jpeg`, `logo.png`, `mens-pelvic-health.png`, `mva-hero.jpg`, `pelvic-care-hero.jpg`, `physio_session.png`, `services_section_final_…png`, `WhatsApp Image 2026-02-17…jpeg`, `cardiac*.png`, `neuro-rehab*.png`, `vestibular.png`, `workplace.png`, `home-care.png`, `manual*.png`; `assets/Can Am business Card.pdf - Blue.pdf`, `assets/Know your Therapist.pdf` | About 20 MB of unreferenced assets. | Move them to an archive folder outside the deploy, or delete. Use `mva-hero.jpg` and `pelvic-care-hero.jpg` as sources for the WebP fixes above. |
| Low | `.DS_Store`, `assets/.DS_Store` | macOS metadata files committed to the repo. | Delete and add them to `.gitignore` (there is none). |
| ✅ | Missing assets | Only `favicon-transparent.png` is referenced but missing (see High). All other `src`/`href` resolve. | None. |

---

## 3. Per-page scorecard

| Page | Title | Description | H1 | Canonical | Schema | Images | Notes |
|---|---|---|---|---|---|---|---|
| index.html | ❌ no service or location | ❌ missing | ❌ no location; H1→H3 skip | ❌ missing | ❌ none | ❌ 9 heavy PNGs, no dims or lazy loading | lang="en"; no OG; second phone number; JS-only nav; broken favicon; no `#main-content` |
| mva-physiotherapy.html | ✅ 57 chars | ⚠️ 172 chars | ⚠️ no location | ✅ `.html` | ⚠️ FAQ 9 vs 10 and mismatched; clinic incomplete; Person no @id | ⚠️ 507 KB PNG hero, no dims or lazy loading | no og:image; unused Tailwind CDN; no breadcrumb |
| pelvic-floor-physiotherapy.html | ⚠️ 66 chars | ❌ 202 chars | ⚠️ no location | ✅ `.html` | ❌ FAQ 7 vs 10; clinic incomplete; Person no @id | ❌ two 1.8–1.9 MB PNGs | no og:image; og:title drops Crossfield; unused Tailwind and Great Vibes |
| canam_concussion_physiotherapy.html | ⚠️ 64 chars | ✅ 124 chars | ✅ | ❌ points to a non-existent filename | ✅ FAQ 10/10 exact; breadcrumb matches; ⚠️ clinic incomplete, no MedicalWebPage | ⚠️ 2 MB PNG hero (correctly preloaded + fetchpriority); wrong declared dims | not committed or deployed; H2 duplicates H1; em dashes in reviews |
| vestibular-physiotherapy.html (new) | ✅ 60 chars | ✅ 139 chars | ✅ | ✅ `.html` | ⚠️ FAQ 8/8 but 4 reworded; clinic incomplete; ✅ breadcrumb, Person @id | ✅ 21 KB WebP hero, preloaded + fetchpriority, lazy below fold; ⚠️ no dims | not deployed; orphan; links to the 404 concussion URL; H2 duplicates H1 |
| physiotherapy-carstairs.html | ✅ 58 chars | ✅ 149 chars | ✅ | ⚠️ extensionless (inconsistent) | ⚠️ FAQ 5 vs 6, all reworded; missing geo/hasMap | ✅ lazy loading below fold; ⚠️ no dims, 806 KB PNG | broken favicon; nav has no links to other pages; square og:image |

---

## 4. Missing site-level files

| File | Status | Notes |
|---|---|---|
| `robots.txt` | ❌ missing (404 live) | Allow all, `Disallow: /components/`, `Sitemap: https://www.canamrehab.com/sitemap.xml`. |
| `sitemap.xml` | ❌ missing (404 live) | 5 canonical URLs. |
| Favicon set | ❌ missing | No `favicon.ico`, no apple-touch-icon, no manifest. The referenced `favicon-transparent.png` doesn't exist. |
| `404.html` | ❌ missing | The Azure default 404 is served. |
| `staticwebapp.config.json` | ❌ missing | This is Azure Static Web Apps (per `.github/workflows`), so this file replaces `.htaccess`, `_redirects`, `vercel.json` and `netlify.toml`, none of which apply. Use it for: 301 of the non-canonical URL form, apex → www, `responseOverrides` 404, `X-Robots-Tag: noindex` on `/components/*`, and cache headers for `/assets/*`. |
| `CNAME` | n/a | Custom domains are configured in the Azure portal. Verify the apex binding (see High). |
| `.gitignore` | ❌ missing | Needed to keep `.DS_Store`, `node_modules` etc. out of the repo. |
