<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TeachersFromCsvSeeder extends Seeder
{
    public function run(): void
    {
        // CSV guru diletakkan di storage/app/teachers.csv
        $path = storage_path('app/teachers.csv');

        if (!file_exists($path)) {
            $this->command?->error("CSV guru tidak ditemukan di: {$path}");
            return;
        }

        $file = fopen($path, 'r');
        if ($file === false) {
            $this->command?->error("Gagal membuka CSV: {$path}");
            return;
        }

        $header = fgetcsv($file);
        if (!$header) {
            fclose($file);
            $this->command?->error("CSV kosong / header tidak terbaca.");
            return;
        }

        $header = array_map(fn($h) => trim((string)$h), $header);

        // ✅ Header persis dari kamu
        $H_NAME  = 'NAMA LENGKAP GURU / STAFF SEKOLAH';
        $H_MAPEL = 'MATA PELAJARAN (GURU)';
        $H_WA    = 'No WHATSAPP';
        $H_EMAIL = 'ALAMAT EMAIL';

        $inserted = 0;
        $updated  = 0;
        $skipped  = 0;

        $skippedNoMapel = [];
        $skippedBadEmail = [];
        $skippedBadWa = [];

        $line = 1; // header line

        while (($row = fgetcsv($file)) !== false) {
            $line++;

            // Skip row kosong
            $allEmpty = true;
            foreach ($row as $cell) {
                if (trim((string)$cell) !== '') {
                    $allEmpty = false;
                    break;
                }
            }
            if ($allEmpty) {
                $skipped++;
                continue;
            }

            // Pastikan jumlah kolom sama
            if (count($row) !== count($header)) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: jumlah kolom beda (header=" . count($header) . ", row=" . count($row) . ")");
                continue;
            }

            $data = array_combine($header, $row);
            if ($data === false) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: array_combine gagal");
                continue;
            }

            $name  = trim((string)($data[$H_NAME] ?? ''));
            $mapel = trim((string)($data[$H_MAPEL] ?? ''));
            $email = trim((string)($data[$H_EMAIL] ?? ''));
            $waRaw = (string)($data[$H_WA] ?? '');
            $wa    = preg_replace('/[^0-9]/', '', $waRaw);

            // ✅ aturan kamu: kalau mapel kosong -> jangan dimasukkan, log siapa saja
            if ($mapel === '') {
                $skipped++;
                $skippedNoMapel[] = [
                    'line' => $line,
                    'name' => $name ?: '(tanpa nama)',
                    'email' => $email ?: '(tanpa email)',
                ];
                continue;
            }

            // Validasi email
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                $skippedBadEmail[] = [
                    'line' => $line,
                    'name' => $name ?: '(tanpa nama)',
                    'email' => $email ?: '(kosong)',
                ];
                continue;
            }

            // WA wajib untuk password (kalau kosong, skip biar aman)
            if (!$wa) {
                $skipped++;
                $skippedBadWa[] = [
                    'line' => $line,
                    'name' => $name ?: '(tanpa nama)',
                    'wa'   => $waRaw ?: '(kosong)',
                    'email' => $email,
                ];
                continue;
            }

            // === USERS ===
            // role enum kamu: ('admin','guru','siswa','staff')
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'password' => Hash::make($wa),
                    'role'     => 'guru',
                ]
            );

            // Kalau user sudah ada, pastikan role guru dan password sesuai WA
            $userDirty = false;
            if ($user->role !== 'guru') {
                $user->role = 'guru';
                $userDirty = true;
            }
            // Optional: selalu set password ke WA (kalau kamu mau reset)
            $user->password = Hash::make($wa);
            $userDirty = true;

            if ($userDirty) $user->save();

            // === TEACHERS ===
            $exists = Teacher::where('user_id', $user->id)->exists();

            Teacher::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name'            => $name,
                    'nip'             => (string) $user->id,           // karena CSV kamu tidak punya NIP
                    'phone'           => $waRaw,         // simpan yang asli (bisa +62, spasi)
                    'address'         => '-',            // CSV kamu tidak punya alamat
                    'profile_picture' => '/assets/images/default-avatar.png',
                ]
            );

            if ($exists) $updated++;
            else $inserted++;
        }

        fclose($file);

        // ===== SUMMARY =====
        $this->command?->info("Selesai import GURU. Insert: {$inserted}, Update: {$updated}, Skipped: {$skipped}");

        if (count($skippedNoMapel)) {
            $this->command?->warn("❌ Tidak diinsert karena MAPEL kosong:");
            foreach ($skippedNoMapel as $x) {
                $this->command?->line("- line {$x['line']}: {$x['name']} | {$x['email']}");
            }
        }

        if (count($skippedBadEmail)) {
            $this->command?->warn("❌ Tidak diinsert karena EMAIL invalid/kosong:");
            foreach ($skippedBadEmail as $x) {
                $this->command?->line("- line {$x['line']}: {$x['name']} | {$x['email']}");
            }
        }

        if (count($skippedBadWa)) {
            $this->command?->warn("❌ Tidak diinsert karena WA kosong/invalid:");
            foreach ($skippedBadWa as $x) {
                $this->command?->line("- line {$x['line']}: {$x['name']} | WA: {$x['wa']} | {$x['email']}");
            }
        }
    }
}
