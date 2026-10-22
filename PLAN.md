# Plan: AI Media Office

Media dijalankan "virtual office" berisi agen AI; manusia hanya review, cek fakta, approve.
Prinsip utama: **tidak ada konten tayang tanpa approval manusia.**

## Arsitektur
- **Agen** (`lib/agents.ts`), masing-masing punya peran + system prompt:
  - **Lucy – CEO Office:** strategi, tema mingguan, target, evaluasi performa
  - **Nico – CMO Office:** riset topik, tulis draft (carousel/teks) per platform
  - **Ardi – COO Office:** isi kalender, cek antrean review, jadwal, publish, laporan ops
- **Status post:** `draft → review → approved → scheduled → published` (atau `rejected`)
  - Agen hanya boleh membuat `review`. Hanya manusia yang memindah ke `approved`/`scheduled`.
- **Dashboard:** kalender mingguan, tab Semua/Review/Terjadwal, filter Instagram/Threads, tombol approve/reject, catatan cek fakta.
- **Worker 24 jam:** endpoint cron `/api/cron/publish` memublikasikan post `scheduled` yang sudah jatuh tempo.

## Fase
1. **MVP (kode awal ini):** store JSON, agen Nico bikin draft via Claude API, dashboard review + approval, scheduler + publisher stub.
2. **Integrasi platform:** Threads API & Instagram Graph API sungguhan (token di env), upload media carousel.
3. **Office hidup:** loop agen terjadwal (Lucy set tema → Nico draft → Ardi atur kalender), tool pencarian web untuk cek fakta awal + sitasi sumber, log aktivitas agen.
4. **Produksi:** DB (Postgres/Supabase), auth tim sosmed, multi-akun/brand, analytics feedback ke Lucy, deploy server 24 jam (Fly/Railway + cron).
5. **Visual:** tampilan isometric office (seperti di screenshot) sebagai status live agen.

## Risiko
- Halusinasi/fakta salah → wajib review manusia + sumber di tiap draft
- Aturan API Meta (rate limit, review app) → mulai dari scheduling manual jika perlu
