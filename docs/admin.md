# Dokumentasi Admin

Dokumen ini memberikan panduan lengkap untuk modul Admin pada Sistem E-Learning. Administrator memiliki kontrol penuh atas sistem, termasuk manajemen pengguna, kelas, mata pelajaran, presensi, dan monitoring aktivitas.

## Daftar Isi

1. [Dashboard Admin](#dashboard-admin)
2. [Manajemen Pengguna](#manajemen-pengguna)
    - [Manajemen Guru](#manajemen-guru)
    - [Manajemen Siswa](#manajemen-siswa)
3. [Manajemen Kelas](#manajemen-kelas)
4. [Manajemen Mata Pelajaran](#manajemen-mata-pelajaran)
5. [Manajemen Presensi](#manajemen-presensi)
6. [Manajemen Semester](#manajemen-semester)
7. [Log Aktivitas](#log-aktivitas)

## Dashboard Admin

Dashboard admin menyediakan gambaran umum tentang sistem, termasuk:

-   Jumlah total siswa, guru, kelas, dan mata pelajaran
-   Statistik kehadiran
-   Aktivitas terbaru dalam sistem
-   Grafik distribusi siswa per kelas

**Fitur:**

-   Cards statistik untuk metrik utama
-   Grafik dan visualisasi data
-   Daftar aktivitas terbaru
-   Navigasi cepat ke fungsi utama

## Manajemen Pengguna

### Manajemen Guru

**Fitur:**

-   Daftar semua guru dengan informasi lengkap
-   Pencarian dan filter guru berdasarkan berbagai kriteria
-   Tambah, edit, dan hapus data guru
-   Lihat detail guru termasuk mata pelajaran yang diajar
-   Ekspor data guru ke format CSV

**Alur Kerja:**

1. Akses menu "Teachers" di sidebar
2. Gunakan tombol "Add" untuk menambahkan guru baru
3. Isi formulir dengan data guru dan informasi akun
4. Gunakan tombol aksi untuk melihat detail, mengedit, atau menghapus guru

### Manajemen Siswa

**Fitur:**

-   Daftar semua siswa dengan informasi lengkap
-   Pencarian dan filter siswa berdasarkan nama, NISN, kelas, dll
-   Tambah, edit, dan hapus data siswa
-   Lihat detail siswa termasuk kelas yang diikuti
-   Ekspor data siswa ke format CSV
-   Operasi massal untuk menghapus beberapa siswa sekaligus

**Alur Kerja:**

1. Akses menu "Students" di sidebar
2. Gunakan tombol "Add" untuk menambahkan siswa baru
3. Isi formulir dengan data siswa dan informasi akun
4. Gunakan tombol aksi untuk melihat detail, mengedit, atau menghapus siswa
5. Gunakan checkbox dan tombol "Delete Selected" untuk operasi massal

## Manajemen Kelas

**Fitur:**

-   Daftar semua kelas dengan informasi terkait
-   Pencarian dan filter kelas berdasarkan nama atau deskripsi
-   Tambah, edit, dan hapus kelas
-   Lihat detail kelas termasuk siswa dan mata pelajaran
-   Tambah/hapus siswa dari kelas
-   Operasi massal untuk menghapus beberapa kelas sekaligus

**Alur Kerja:**

1. Akses menu "Classes" di sidebar
2. Gunakan tombol "Add" untuk menambahkan kelas baru
3. Isi formulir dengan data kelas dan pilih semester aktif
4. Gunakan tombol aksi untuk melihat detail, mengedit, atau menghapus kelas
5. Di halaman detail, gunakan tab untuk melihat dan mengelola siswa atau mata pelajaran

## Manajemen Mata Pelajaran

**Fitur:**

-   Daftar semua mata pelajaran dengan informasi terkait
-   Pencarian dan filter mata pelajaran
-   Tambah, edit, dan hapus mata pelajaran
-   Lihat detail mata pelajaran termasuk materi dan tugas
-   Operasi massal untuk menghapus beberapa mata pelajaran sekaligus

**Alur Kerja:**

1. Akses menu "Subjects" di sidebar
2. Gunakan tombol "Add" untuk menambahkan mata pelajaran baru
3. Isi formulir dengan data mata pelajaran, pilih kelas dan guru
4. Gunakan tombol aksi untuk melihat detail, mengedit, atau menghapus mata pelajaran

## Manajemen Presensi

**Fitur:**

-   Daftar semua sesi presensi
-   Pencarian dan filter sesi presensi
-   Buat sesi presensi baru dengan kode PIN
-   Lihat detail presensi termasuk siswa yang hadir/tidak hadir
-   Laporan kehadiran per kelas atau per siswa
-   Ekspor laporan presensi ke format CSV

**Alur Kerja:**

1. Akses menu "Attendance" di sidebar
2. Gunakan tombol "Add" untuk membuat sesi presensi baru
3. Isi formulir dengan data sesi (kelas, mata pelajaran, durasi)
4. Sistem akan menghasilkan kode PIN unik
5. Pantau kehadiran siswa dan tandai manual jika diperlukan
6. Gunakan menu "Reports" untuk melihat statistik kehadiran

**Membuat Sesi Presensi:**

1. Pilih kelas dan mata pelajaran
2. Tentukan durasi kode PIN aktif
3. Klik "Create Session" untuk menghasilkan kode PIN
4. Bagikan kode PIN dengan siswa

**Memantau Kehadiran:**

1. Lihat daftar siswa yang sudah/belum presensi
2. Gunakan tombol aksi untuk mengubah status kehadiran siswa
3. Gunakan tab untuk memfilter berdasarkan status kehadiran

## Manajemen Semester

**Fitur:**

-   Daftar semua semester dengan tanggal mulai dan berakhir
-   Tambah, edit, dan hapus semester
-   Tetapkan semester aktif
-   Lihat kelas dan siswa terdaftar di semester tertentu

**Alur Kerja:**

1. Akses menu "Semesters" di sidebar
2. Gunakan tombol "Add" untuk menambahkan semester baru
3. Isi formulir dengan nama semester dan tanggal
4. Gunakan tombol "Set Active" untuk menjadikan semester aktif
5. Gunakan tombol aksi untuk mengedit atau menghapus semester

## Log Aktivitas

**Fitur:**

-   Daftar semua aktivitas pengguna dalam sistem
-   Pencarian dan filter aktivitas berdasarkan pengguna, aksi, atau tanggal
-   Lihat detail aktivitas termasuk IP address dan waktu
-   Ekspor log aktivitas ke format CSV
-   Bersihkan log aktivitas lama

**Alur Kerja:**

1. Akses menu "Activity Logs" di sidebar
2. Gunakan filter dan pencarian untuk menemukan aktivitas tertentu
3. Gunakan tombol "Export" untuk mengekspor data
4. Gunakan tombol "Clear" untuk membersihkan log lama

**Membersihkan Log:**

1. Klik tombol "Clear" di halaman Activity Logs
2. Pilih periode log yang akan dihapus (seminggu, sebulan, setahun, atau semua)
3. Konfirmasi penghapusan

## Tips untuk Administrator

1. **Keamanan Akun**: Selalu gunakan password yang kuat dan ubah secara berkala.
2. **Backup Data**: Lakukan backup database secara rutin untuk mencegah kehilangan data.
3. **Monitoring Aktivitas**: Periksa log aktivitas secara berkala untuk memantau aktivitas mencurigakan.
4. **Pengelolaan Pengguna**: Pastikan untuk menonaktifkan akun pengguna yang tidak aktif.
5. **Pengujian Fitur**: Uji fitur baru di lingkungan pengujian sebelum menerapkannya di sistem produksi.
6. **Periksa Kapasitas Server**: Pantau penggunaan sumber daya server untuk memastikan kinerja optimal.

## Penyelesaian Masalah Umum

### Login Gagal

-   Pastikan email dan password benar
-   Periksa apakah akun telah dinonaktifkan
-   Hapus cache browser dan coba lagi

### Pengguna Tidak Dapat Dikelola

-   Pastikan Anda memiliki izin administrator
-   Periksa apakah ada konflik data (misalnya email duplikat)
-   Periksa log sistem untuk detail error

### Presensi Tidak Berfungsi

-   Pastikan semester dan kelas aktif telah ditetapkan
-   Verifikasi bahwa siswa terdaftar di kelas yang sesuai
-   Periksa apakah sesi presensi masih aktif (belum kedaluwarsa)

### Ekspor Data Gagal

-   Pastikan direktori tempat file disimpan dapat ditulis
-   Periksa apakah ada batasan ukuran file di server
-   Coba ekspor dengan filter untuk mengurangi jumlah data
