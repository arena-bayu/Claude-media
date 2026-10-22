# Plan: Claude Media

Asumsi: portal media/konten ringan (artikel pendek, kategori, kurasi), konten ditulis sebagai Markdown di repo.

## Fase 1 – MVP (initial code ini)
- Next.js (App Router) + TypeScript, konten Markdown di `content/posts/*.md` (frontmatter: title, date, category, summary)
- Halaman: beranda (daftar post), detail post, halaman kategori
- Deploy statis ke Vercel/Cloudflare Pages

## Fase 2 – Distribusi & SEO
- RSS feed, sitemap, Open Graph image per post
- Tombol share + auto-post ke Threads (Threads API, token disimpan di env)
- Analytics ringan (Plausible/Umami)

## Fase 3 – Workflow produksi
- Admin/CMS (Decap CMS atau Supabase + auth) agar tidak edit file manual
- Pipeline kurasi: ambil sumber (RSS), draft ringkasan dengan Claude API, editor review sebelum publish
- Jadwal publish (cron / GitHub Actions)

## Fase 4 – Pertumbuhan
- Newsletter (Resend/Buttondown), pencarian, komentar/reaksi, monetisasi

## Pertanyaan terbuka
- Niche/topik media? Bahasa? Gaya (berita, edukasi, meme, kurasi)?
- Perlu auto-post ke Threads/IG sejak awal?
