# Contoh carousel: 3 kejadian sejarah yang terdengar seperti karangan

Contoh post pilar **Trivia sejarah** (maks 5 slide), dirender dengan renderer yang sama dengan app (`lib/slide.ts`).

- `slide-1.png` … `slide-5.png`: gambar 1080×1350 (rasio 4:5), urut sesuai carousel
- `caption.txt`: caption siap tempel
- `post.json`: data post lengkap, termasuk `sources` dan `claims` seperti yang dilihat reviewer di dashboard

Struktur yang dikenali renderer:
- slide 1: cover (hook), latar kobalt
- slide tengah: poin dengan format `N. Judul. Penjelasan`, latar merah muda dengan angka besar
- slide terakhir: ajakan, latar kobalt dengan ikon simpan

Semua fakta sudah dicocokkan ke sumber di `post.json`. Durasi Perang Anglo-Zanzibar berbeda
antar sumber, jadi ditulis sebagai rentang (38–45 menit), bukan angka paling dramatis.

Render ulang setelah mengubah `post.json`:

```bash
node --experimental-strip-types scripts/render-example.ts examples/trivia-sejarah "Nama Brand"
```
