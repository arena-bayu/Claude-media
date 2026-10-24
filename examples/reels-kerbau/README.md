# Reels: Kerbau yang Tak Boleh Pintar

Video naratif vertikal (1080×1920, 30 fps, ±85 detik) tentang kemiskinan struktural lewat analogi
kerbau yang hanya disuruh bekerja dan dibuat merasa cukup. Dibuat dengan [Remotion](https://www.remotion.dev)
mengikuti skill resmi Remotion (`.claude/skills/`).

- Hasil render: `kerbau.mp4`. Contoh frame ada di `stills/`.
- Gaya: gambar tangan hitam-putih dengan garis tipis. Tiap garis "digambar" saat kata kuncinya diucapkan,
  dan garisnya sedikit bergetar seperti animasi tangan.
- Voice over: `id-ID-ArdiNeural` (Microsoft Neural TTS lewat `edge-tts`).

## Struktur

| File | Isi |
|---|---|
| `src/script.json` | Naskah per adegan. Satu sumber untuk voice over dan subtitle |
| `scripts/tts.py` | Membuat `public/vo/<id>.mp3` dan `src/vo-words.json` (waktu tiap kata) |
| `src/lib/words.ts`, `src/lib/timing.ts` | `T("jerami")` = frame saat kata "jerami" diucapkan |
| `src/lib/sketch.tsx` | `<Sketch>`: path SVG dibuat kasar dengan roughjs lalu digambar bertahap |
| `src/drawings/` | Path kerbau, pemilik, bajak, jerami, kalender, dll. |
| `src/scenes/S1…S8` | Satu komponen per adegan |
| `src/Video.tsx` | `TransitionSeries` + `calculateMetadata` (durasi mengikuti voice over, maks. 90 detik) |

## Menjalankan

```bash
npm i
npm run dev                                   # Remotion Studio
npx remotion render Kerbau out/kerbau.mp4     # render MP4
```

Mengubah naskah: edit `src/script.json`, lalu buat ulang voice over. Kata kunci di adegan
(`T("...")`) harus tetap ada di naskah.

```bash
pip install edge-tts
python3 scripts/tts.py      # di balik proxy TLS: SSL_CERT_FILE=/path/ke/ca.crt python3 scripts/tts.py
```
