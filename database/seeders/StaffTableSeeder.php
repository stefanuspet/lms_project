<?php

namespace Database\Seeders;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Database\Seeder;

class StaffTableSeeder extends Seeder
{
    public function run(): void
    {
        $staffData = [
            [
                'email'     => 'tu.01@smkn1.sch.id',
                'name'      => 'Endang Susilawati, S.E.',
                'nip'       => '198701152010012001',
                'phone'     => '082134567820',
                'address'   => 'Jl. Mawar No. 7, Banjar',
                'position'  => 'Kepala Tata Usaha',
                'category'  => 'staff',
                'join_date' => '2010-01-15',
            ],
            [
                'email'     => 'tu.02@smkn1.sch.id',
                'name'      => 'Bambang Irawan',
                'nip'       => '199203202015011001',
                'phone'     => '082134567821',
                'address'   => 'Jl. Melati No. 12, Banjar',
                'position'  => 'Staf Tata Usaha',
                'category'  => 'staff',
                'join_date' => '2015-03-20',
            ],
            [
                'email'     => 'tu.03@smkn1.sch.id',
                'name'      => 'Nining Ratnasari',
                'nip'       => '199508172017012001',
                'phone'     => '082134567822',
                'address'   => 'Jl. Anggrek No. 3, Banjar',
                'position'  => 'Staf Administrasi',
                'category'  => 'staff',
                'join_date' => '2017-08-17',
            ],
            [
                'email'     => 'satpam.01@smkn1.sch.id',
                'name'      => 'Asep Mulyadi',
                'nip'       => null,
                'phone'     => '082134567823',
                'address'   => 'Jl. Dahlia No. 9, Banjar',
                'position'  => 'Petugas Keamanan',
                'category'  => 'security',
                'join_date' => '2018-01-08',
            ],
            [
                'email'     => 'satpam.02@smkn1.sch.id',
                'name'      => 'Dadang Kosasih',
                'nip'       => null,
                'phone'     => '082134567824',
                'address'   => 'Jl. Bougenville No. 5, Banjar',
                'position'  => 'Petugas Keamanan',
                'category'  => 'security',
                'join_date' => '2019-06-01',
            ],
        ];

        foreach ($staffData as $data) {
            $user = User::where('email', $data['email'])->first();

            Staff::create([
                'user_id'   => $user?->id,
                'name'      => $data['name'],
                'nip'       => $data['nip'],
                'phone'     => $data['phone'],
                'address'   => $data['address'],
                'position'  => $data['position'],
                'category'  => $data['category'],
                'join_date' => $data['join_date'],
                'is_active' => true,
            ]);
        }
    }
}
