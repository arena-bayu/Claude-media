# AI Media Office

Kantor virtual berisi agen AI yang menjalankan media sosial (Instagram & Threads) 24 jam,
dengan satu aturan keras: **tidak ada konten yang tayang tanpa approval manusia.**

| Agen | Peran | Yang dikerjakan |
|---|---|---|
| **Lucy** — CEO Office | Strategi | Merencanakan topik dari brief brand, menghindari topik yang baru dibahas |
| **Nico** — CMO Office | Konten | Meriset di web, menulis draft + daftar klaim untuk dicek, merevisi sesuai catatan reviewer |
| **Ardi** — COO Office | Operasional | Menjadwalkan post yang sudah di-approve ke slot kosong, mempublikasikan saat jatuh tempo |

Tim manusia membuka dashboard, mencentang setiap klaim di daftar cek fakta, lalu memilih
**Approve**, **Minta revisi**, **Edit**, atau **Reject**.

## Menjalankan lokal

Butuh Node.js 22.5+ (memakai SQLite bawaan Node).

```bash
npm install
cp .env.example .env.local   # isi ANTHROPIC_API_KEY; sisanya opsional untuk mencoba
npm run dev                  # http://localhost:3000
```

- Tanpa `ADMIN_PASSWORD`, login dimatikan saat development.
- Tanpa `ANTHROPIC_API_KEY`, app berjalan dalam **mode demo**: konten placeholder, tetapi
  seluruh alur (review → jadwal → publikasi) tetap bisa dicoba.
- Tanpa token Threads/Instagram, publikasi berjalan **dry-run**: tercatat di log, tidak dikirim.

```bash
npm test          # unit test: zona waktu, aturan approval, validasi sumber, sesi, slide
npm run typecheck
```

## Alur sebuah post

```
Lucy merencanakan → Nico meriset & menulis → [review manusia] → approved → Ardi menjadwalkan → terbit
                                               │   ▲
                                 minta revisi ─┘   └─ Nico merevisi (memakai catatan riset yang sama)
```

- Aturan transisi ada di `lib/workflow.ts` dan diuji di `tests/workflow.test.ts`.
- Sumber yang ditulis Nico dicocokkan dengan URL yang benar-benar ditemukan saat riset.
  URL yang tidak ditemukan saat riset dibuang.
- Draft yang melanggar batas platform ditolak sebelum masuk review: Threads maks 500 karakter,
  carousel Instagram 2–10 slide.
- Scheduler (`lib/scheduler.ts`) jalan di dalam proses server. Tiap menit ia menjadwalkan dan
  mempublikasikan. Tiap `OFFICE_INTERVAL_HOURS` ia memulai putaran kantor baru, kecuali antrean
  review sudah menumpuk.

## Claude

Default memakai `claude-opus-5-5` lewat SDK resmi `@anthropic-ai/sdk`:
- **Lucy**: output terstruktur (zod), effort `high`.
- **Nico, riset**: tool `web_search`, effort `medium`.
- **Nico, menulis**: output terstruktur, effort `high`.
- **Fallback saat ditolak** (`fallbacks: "default"`) aktif: jika classifier keamanan menolak
  permintaan, API mencoba ulang di model cadangan.

Ganti model lewat `CLAUDE_MODEL`.

## Deploy (server 24 jam)

Scheduler butuh proses yang selalu hidup, jadi platform serverless (mis. Vercel) tidak cocok.
Contoh dengan Fly.io (region Singapura):

```bash
fly launch --no-deploy                 # pakai fly.toml yang ada
fly volumes create media_data --size 1 --region sin
fly secrets set ADMIN_PASSWORD=... AUTH_SECRET=$(openssl rand -hex 32) ANTHROPIC_API_KEY=... \
  PUBLIC_BASE_URL=https://<app>.fly.dev
fly deploy
```

Platform lain yang menjalankan Docker juga bisa, misalnya Railway atau VPS. Syaratnya:
- `/data` disimpan di volume persisten.
- App hanya berjalan sebagai **satu instance**.

## Menghubungkan Instagram & Threads

1. Ubah akun Instagram menjadi akun **Professional** (Creator/Business), lalu hubungkan ke Facebook Page.
2. Buat app di developers.facebook.com:
   - Instagram: tambahkan produk Instagram Graph API dengan izin `instagram_basic` dan `instagram_content_publish`.
   - Threads: tambahkan produk Threads API.
3. Isi `INSTAGRAM_ACCESS_TOKEN`, `INSTAGRAM_USER_ID`, `THREADS_ACCESS_TOKEN`, dan `THREADS_USER_ID`.
4. Isi `PUBLIC_BASE_URL`. Instagram mengunduh gambar slide dari `/api/slides/...`. Rute itu
   hanya melayani post yang sudah di-approve, jadi draft tidak bocor.
