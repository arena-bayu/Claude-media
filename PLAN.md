# Plan: AI Media Office

Tujuan: media sosial yang diproduksi agen AI 24 jam, tetapi setiap konten yang tayang sudah
dicek fakta dan disetujui manusia.

## Sudah jadi (v1)
- Tiga agen dengan peran jelas: Lucy (rencana), Nico (riset web + tulis + revisi), dan Ardi (jadwal + publikasi).
- Alur status yang diuji. Agen tidak bisa menghasilkan `approved`, dan publisher hanya menyentuh `scheduled`.
- Cek fakta di dashboard: approve terkunci sampai semua klaim dicentang. Sumber divalidasi terhadap hasil riset.
- Revisi dengan catatan reviewer, edit manual, tarik dari jadwal, dan coba ulang saat gagal.
- Kalender mingguan dengan zona waktu media (Asia/Jakarta) dan slot tayang per platform.
- Publikasi Threads (teks) dan Instagram (carousel dengan gambar slide yang di-render server).
- Login tim review dengan sesi bertanda tangan. Siapa yang approve tercatat.
- SQLite, scheduler di dalam proses, dan Dockerfile + fly.toml.

## Berikutnya
1. **Uji dengan akun sungguhan.** Hubungkan token Threads/Instagram dan kalibrasi prompt Nico
   dengan 20–30 draft nyata. Catat alasan reject untuk perbaikan prompt.
2. **Gambar slide lebih kaya.** Template per brand (warna, logo, font), foto/ilustrasi, dan variasi layout.
3. **Umpan balik performa.** Tarik insight (reach, saves, replies) dari API platform. Lucy memakai
   data ini untuk memilih topik.
4. **Multi-reviewer & peran.** Akun per orang, peran editor vs approver, dan notifikasi
   (email/Telegram) saat ada draft baru.
5. **Multi-brand.** Satu kantor untuk beberapa akun/brand dengan brief masing-masing.
6. **Evaluasi kualitas.** Set eval draft (akurasi klaim, kepatuhan gaya) supaya perubahan prompt atau model bisa diukur.

## Risiko & mitigasi
- **Fakta salah.** Riset web wajib, sumber divalidasi, daftar klaim dicentang manusia sebelum approve.
- **Kebijakan Meta.** Pakai API resmi (bukan otomasi browser), hormati rate limit, dan simpan token sebagai secret.
- **Kehilangan data.** SQLite di volume persisten; backup volume berkala.
- **Server restart di tengah kerja.** Post yang terputus dipulihkan saat start: draft gagal ditandai `failed`,
  revisi kembali ke `review`, publikasi ditandai untuk dicek manual.
