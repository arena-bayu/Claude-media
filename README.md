# AI Media Office

Media yang dijalankan agen AI (Lucy/CEO, Nico/CMO, Ardi/COO); manusia review & approve. Lihat `PLAN.md`.

## Jalankan
```bash
npm install
cp .env.example .env.local   # isi ANTHROPIC_API_KEY (opsional, tanpa ini draft = placeholder)
npm run dev                   # dashboard di http://localhost:3000
npm run worker                # (terminal lain) publish tiap menit + putaran kantor tiap 6 jam
```
Alur: **Jalankan kantor** → draft masuk tab *review* → **Approve** → **Ardi: jadwalkan** → worker publish.
Publish Threads sungguhan butuh `THREADS_ACCESS_TOKEN` + `THREADS_USER_ID`; tanpa itu dry-run (dicatat di log).
