<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class TeachersTableSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'email'   => 'budi.santoso@smkn1.sch.id',
                'name'    => 'Budi Santoso, S.Pd.',
                'nip'     => '197808152005011002',
                'phone'   => '082134567801',
                'address' => 'Jl. Merdeka No. 12, Banjar',
            ],
            [
                'email'   => 'siti.rahayu@smkn1.sch.id',
                'name'    => 'Siti Rahayu, S.Pd.',
                'nip'     => '198203202006022001',
                'phone'   => '082134567802',
                'address' => 'Jl. Pahlawan No. 5, Banjar',
            ],
            [
                'email'   => 'ahmad.fauzi@smkn1.sch.id',
                'name'    => 'Ahmad Fauzi, S.S.',
                'nip'     => '197511102003011003',
                'phone'   => '082134567803',
                'address' => 'Jl. Veteran No. 8, Banjar',
            ],
            [
                'email'   => 'dewi.kurniawati@smkn1.sch.id',
                'name'    => 'Dewi Kurniawati, S.Ag.',
                'nip'     => '198507182009022002',
                'phone'   => '082134567804',
                'address' => 'Jl. Sudirman No. 15, Banjar',
            ],
            [
                'email'   => 'hendra.wijaya@smkn1.sch.id',
                'name'    => 'Hendra Wijaya, S.Pd.',
                'nip'     => '197912252004011001',
                'phone'   => '082134567805',
                'address' => 'Jl. Pemuda No. 3, Banjar',
            ],
            [
                'email'   => 'rina.susanti@smkn1.sch.id',
                'name'    => 'Rina Susanti, S.Pd.',
                'nip'     => '198004162006022003',
                'phone'   => '082134567806',
                'address' => 'Jl. Diponegoro No. 22, Banjar',
            ],
            [
                'email'   => 'dian.pratama@smkn1.sch.id',
                'name'    => 'Dian Pratama, S.Pd.',
                'nip'     => '198309082007011004',
                'phone'   => '082134567807',
                'address' => 'Jl. Ahmad Yani No. 7, Banjar',
            ],
            [
                'email'   => 'arief.nugroho@smkn1.sch.id',
                'name'    => 'Arief Nugroho, S.Kom.',
                'nip'     => '198611302010011002',
                'phone'   => '082134567808',
                'address' => 'Jl. Gatot Subroto No. 11, Banjar',
            ],
            [
                'email'   => 'yuliana.safitri@smkn1.sch.id',
                'name'    => 'Yuliana Safitri, S.Kom.',
                'nip'     => '198901152012022001',
                'phone'   => '082134567809',
                'address' => 'Jl. Siliwangi No. 9, Banjar',
            ],
            [
                'email'   => 'bambang.suryadi@smkn1.sch.id',
                'name'    => 'Bambang Suryadi, S.T.',
                'nip'     => '197706142002011003',
                'phone'   => '082134567810',
                'address' => 'Jl. Tentara Pelajar No. 6, Banjar',
            ],
            [
                'email'   => 'eko.prasetyo@smkn1.sch.id',
                'name'    => 'Eko Prasetyo, S.T.',
                'nip'     => '198407052008011001',
                'phone'   => '082134567811',
                'address' => 'Jl. Imam Bonjol No. 18, Banjar',
            ],
            [
                'email'   => 'sri.wahyuni@smkn1.sch.id',
                'name'    => 'Sri Wahyuni, S.E.',
                'nip'     => '198204232007022002',
                'phone'   => '082134567812',
                'address' => 'Jl. Kartini No. 4, Banjar',
            ],
            [
                'email'   => 'muhammad.ridwan@smkn1.sch.id',
                'name'    => 'Muhammad Ridwan, S.E.',
                'nip'     => '197803192003011004',
                'phone'   => '082134567813',
                'address' => 'Jl. Gajah Mada No. 25, Banjar',
            ],
            [
                'email'   => 'fitria.handayani@smkn1.sch.id',
                'name'    => 'Fitria Handayani, S.Pd.',
                'nip'     => '199001082014022001',
                'phone'   => '082134567814',
                'address' => 'Jl. Hasanuddin No. 10, Banjar',
            ],
            [
                'email'   => 'agus.hermawan@smkn1.sch.id',
                'name'    => 'Agus Hermawan, S.Pd.',
                'nip'     => '198502172009011003',
                'phone'   => '082134567815',
                'address' => 'Jl. Pangeran Diponegoro No. 33, Banjar',
            ],
        ];

        foreach ($teachers as $data) {
            $user = User::where('email', $data['email'])->first();
            if (!$user) continue;

            Teacher::create([
                'user_id' => $user->id,
                'name'    => $data['name'],
                'nip'     => $data['nip'],
                'phone'   => $data['phone'],
                'address' => $data['address'],
            ]);
        }
    }
}
