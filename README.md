# Sistem E-Learning Laravel

Sistem E-Learning berbasis Laravel yang menyediakan platform lengkap untuk manajemen pembelajaran online. Aplikasi ini mendukung berbagai fitur untuk siswa, guru, dan administrator untuk memfasilitasi proses belajar mengajar secara efektif.

## Fitur Utama

### 1. Manajemen Pengguna

-   Registrasi dan login untuk administrator, guru, dan siswa
-   Profil pengguna dengan informasi lengkap
-   Manajemen peran dan izin

### 2. Manajemen Kelas

-   Pembuatan dan pengelolaan kelas
-   Pendaftaran siswa ke kelas
-   Penugasan guru ke kelas

### 3. Manajemen Mata Pelajaran

-   Pembuatan dan pengelolaan mata pelajaran
-   Penugasan mata pelajaran ke kelas
-   Pengelolaan materi pembelajaran

### 4. Sistem Presensi

-   Pembuatan sesi presensi dengan kode PIN
-   Monitoring kehadiran siswa
-   Laporan kehadiran komprehensif

### 5. Manajemen Tugas

-   Pembuatan dan pengelolaan tugas
-   Pengumpulan tugas oleh siswa
-   Penilaian dan umpan balik

### 6. Aktivitas dan Monitoring

-   Log aktivitas pengguna
-   Statistik dan laporan
-   Dasbor untuk semua jenis pengguna

## Teknologi

-   **Backend**: Laravel 12
-   **Frontend**: React.js (Inertia.js)
-   **Database**: MySQL
-   **Styling**: Tailwind CSS
-   **Icons**: Iconsax

## Persyaratan Sistem

-   PHP >= 8.1
-   Composer
-   Node.js & NPM
-   MySQL
-   Ekstensi PHP yang diperlukan: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML

## Instalasi

1. **Clone repositori**

    ```bash
    https://github.com/stefanuspet/lms_project.git
    cd lms_project
    ```

2. **Instal dependensi PHP**

    ```bash
    composer install
    ```

3. **Instal dependensi JavaScript**

    ```bash
    npm install
    ```

4. **Salin file .env**

    ```bash
    cp .env.example .env
    ```

5. **Generate application key**

    ```bash
    php artisan key:generate
    ```

6. **Konfigurasi database di file .env**

    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=elearning
    DB_USERNAME=root
    DB_PASSWORD=
    ```

7. **Migrasi dan seed database**

    ```bash
    php artisan migrate --seed
    ```

8. **Jalankan server**

    ```bash
    composer run dev
    ```

9. **Akses aplikasi**
   Buka browser dan akses `http://localhost:8000`

## Akun Default

Setelah menjalankan seeder, beberapa akun default akan tersedia:

-   **Admin**

    -   Email: admin@example.com
    -   Password: password

-   **Guru**

    -   Email: teacher@example.com
    -   Password: password

-   **Siswa**
    -   Email: student@example.com
    -   Password: password
