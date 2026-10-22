# Mockup arah desain carousel

Empat arah desain untuk dipilih. Masing-masing berisi cover dan satu slide isi, dengan konten
trivia yang sama (Perang Anglo-Zanzibar). Ringkasan perbandingan ada di `perbandingan.png`.

| Arah | Ide | Cocok untuk |
|---|---|---|
| **A. Arsip** | Kliping koran di kertas cokelat, label Dymo, kartu katalog perpustakaan dengan stempel "DICEK, 2 SUMBER" | Sejarah; menonjolkan bahwa fakta sudah diverifikasi |
| **B. Kuis** | Cover berupa pertanyaan pilihan ganda, jawaban terungkap setelah swipe | Semua pilar; paling memancing komentar ("aku jawab A!") |
| **C. Poster film** | Tiap kejadian jadi poster film lawas: tagline, "Berdasarkan kisah nyata", blok kredit berisi sumber | Film dan kejadian unik |
| **E. Kolase kuis** (pilihan terbaru) | Gaya kolase vintage seperti referensi: latar kuning hangat, potongan stiker bertepi putih kasar (jam saku menunjuk 09.40, prangko Zanzibar), label pil gelap, judul serif, panah kuas, ditambah mekanik kuis dari B | Semua pilar; menggabungkan estetika referensi dengan interaksi tebak-jawab |
| **D. Buku tulis** | Catatan PR di buku bergaris: tulisan tangan, stabilo, sticky note, koreksi pulpen merah | Audiens muda; nuansa nostalgia sekolah |

`src/` berisi HTML sumbernya. Untuk me-render ulang, pasang font dan Playwright di folder itu:

```bash
npm i playwright-core @fontsource/dm-serif-display @fontsource/courier-prime @fontsource/archivo-black \
  @fontsource/archivo @fontsource/bebas-neue @fontsource/caveat @fontsource/fraunces @fontsource/patrick-hand
mkdir -p out && node shot.cjs a-arsip b-kuis c-poster d-bukutulis e-kolase
```
