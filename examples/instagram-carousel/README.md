# Contoh carousel Instagram: 3 kebiasaan supaya hasil AI lebih akurat

Contoh hasil akhir sebuah post carousel (maks 5 slide). Gambar dirender dengan renderer yang sama dengan app (`lib/slide.ts`).

Struktur yang dikenali renderer:
- slide 1: cover (hook), latar kobalt
- slide tengah: poin dengan format `N. Judul. Penjelasan`, latar merah muda dengan angka besar
- slide terakhir: ajakan, latar kobalt dengan ikon simpan

- `slide-1.png` … `slide-5.png`: gambar 1080×1350 (rasio 4:5), urut sesuai carousel
- `caption.txt`: caption siap tempel
- `post.json`: data post (format sama dengan yang ditulis Nico)

Render ulang setelah mengubah `post.json`:

```bash
node --experimental-strip-types scripts/render-example.ts examples/instagram-carousel "Nama Brand"
```

Isinya ditulis manual, bukan oleh Nico, sebagai contoh gaya. Topiknya sengaja dipilih yang
tidak bergantung pada angka atau berita, jadi tidak ada klaim yang perlu dicek fakta.
