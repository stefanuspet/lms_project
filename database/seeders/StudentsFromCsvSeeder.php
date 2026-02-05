<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Student;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentsFromCsvSeeder extends Seeder
{
    public function run(): void
    {
        $path = storage_path('app/students.csv');

        if (!file_exists($path)) {
            $this->command?->error("CSV tidak ditemukan di: {$path}");
            return;
        }

        $file = fopen($path, 'r');
        if ($file === false) {
            $this->command?->error("Gagal membuka file CSV: {$path}");
            return;
        }

        // Header CSV
        $header = fgetcsv($file);
        if (!$header) {
            fclose($file);
            $this->command?->error("CSV kosong atau header tidak terbaca.");
            return;
        }

        // Rapikan header
        $header = array_map(fn($h) => trim((string) $h), $header);

        $inserted = 0;
        $skipped  = 0;

        $line = 1; // header dianggap line 1

        while (($row = fgetcsv($file)) !== false) {
            $line++;

            // Skip baris kosong total
            $allEmpty = true;
            foreach ($row as $cell) {
                if (trim((string)$cell) !== '') {
                    $allEmpty = false;
                    break;
                }
            }
            if ($allEmpty) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: baris kosong");
                continue;
            }

            // Jumlah kolom harus sama
            if (count($row) !== count($header)) {
                $skipped++;
                $this->command?->warn(
                    "SKIP line {$line}: jumlah kolom beda (header=" . count($header) . ", row=" . count($row) . ")"
                );
                continue;
            }

            $data = array_combine($header, $row);
            if ($data === false) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: array_combine gagal");
                continue;
            }

            // Ambil data
            $email = trim((string)($data['ALAMAT EMAIL'] ?? ''));
            $waRaw = (string)($data['NO WHATSAPP ORANG TUA'] ?? '');
            $wa    = preg_replace('/[^0-9]/', '', $waRaw);

            $name  = trim((string)($data['NAMA LENGKAP'] ?? ''));
            $nisn  = trim((string)($data['NISN'] ?? ''));
            $jkRaw = strtolower(trim((string)($data['JENIS KELAMIN'] ?? '')));

            // Validasi minimal
            if (!$email) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: email kosong");
                continue;
            }
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: email tidak valid => {$email}");
                continue;
            }
            if (!$wa) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: WA ortu kosong/invalid => {$waRaw}");
                continue;
            }

            // Normalisasi gender sesuai enum students: ('male','female')
            $gender = match ($jkRaw) {
                'laki-laki', 'laki laki', 'pria', 'male', 'm' => 'male',
                'perempuan', 'wanita', 'female', 'f' => 'female',
                default => null,
            };

            try {
                // === USERS ===
                // role harus sesuai enum: ('admin','guru','siswa','staff')
                $user = User::firstOrCreate(
                    ['email' => $email],
                    [
                        'password' => Hash::make($wa),
                        'role'     => 'siswa',
                    ]
                );

                // === STUDENTS ===
                Student::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name'            => $name,
                        'nisn'            => $nisn,
                        'gender'          => $gender,
                        'birth_date'      => null,
                        'birth_place'     => null,
                        'profile_picture' => '/assets/images/default-avatar.png',
                    ]
                );

                $inserted++;
            } catch (\Throwable $e) {
                $skipped++;
                $this->command?->warn("SKIP line {$line}: exception => " . $e->getMessage());
                continue;
            }
        }

        fclose($file);

        $this->command?->info("Selesai import. Insert/Update: {$inserted}, Skipped: {$skipped}");
        $this->command?->info("Catatan: lihat baris 'SKIP line ...' di atas untuk alasan detail.");
    }
}
