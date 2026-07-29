<?php

namespace Database\Seeders;

use App\Models\Material;
use App\Models\Semester;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class MaterialsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentSemester = Semester::latest('start_date')->first();

        // Hanya kelas X — XI dan XII tidak di-seed
        $subjects = Subject::whereHas('classroom', function ($q) {
            $q->where('name', 'like', 'X %')
              ->where('name', 'not like', 'XI%')
              ->where('name', 'not like', 'XII%');
        })->get();

        // Define material titles and content types
        $materialTypes = [
            'Pengantar' => [
                'title' => 'Pengantar %s',
                'content' => 'Materi pengantar untuk mata pelajaran %s. Disini akan dijelaskan dasar-dasar dari pelajaran ini.',
                'file_type' => null,
            ],
            'Bab 1' => [
                'title' => 'Bab 1: Dasar-dasar %s',
                'content' => 'Materi Bab 1 membahas tentang dasar-dasar %s yang wajib dipahami oleh setiap siswa.',
                'file_type' => 'pdf',
            ],
            'Bab 2' => [
                'title' => 'Bab 2: Aplikasi %s dalam Kehidupan',
                'content' => 'Materi Bab 2 membahas bagaimana %s diaplikasikan dalam kehidupan sehari-hari.',
                'file_type' => 'docx',
            ],
            'Video Pembelajaran' => [
                'title' => 'Video Pembelajaran %s',
                'content' => 'Video pembelajaran untuk mata pelajaran %s yang memudahkan siswa memahami materi.',
                'file_type' => 'mp4',
            ],
            'Latihan Soal' => [
                'title' => 'Latihan Soal %s',
                'content' => 'Kumpulan soal latihan untuk mata pelajaran %s untuk meningkatkan pemahaman siswa.',
                'file_type' => 'pdf',
            ],
        ];

        // Create materials for each subject
        foreach ($subjects as $subject) {
            foreach ($materialTypes as $type => $data) {
                // Generate dummy file path if there's a file type
                $filePath = null;
                if ($data['file_type']) {
                    $filePath = 'storage/materials/' . strtolower(str_replace(' ', '_', $subject->name)) . '_' . strtolower(str_replace(' ', '_', $type)) . '.' . $data['file_type'];
                }

                Material::create([
                    'subject_id'  => $subject->id,
                    'semester_id' => $currentSemester->id,
                    'title'       => sprintf($data['title'], $subject->name),
                    'content'     => sprintf($data['content'], $subject->name),
                    'file_path'   => $filePath,
                    'file_type'   => $data['file_type'],
                ]);
            }
        }
    }
}
