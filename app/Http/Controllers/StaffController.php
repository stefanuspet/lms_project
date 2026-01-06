<?php

namespace App\Http\Controllers;

use App\Models\Staff;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'search' => 'nullable|string|max:50',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'category' => 'nullable|in:staff,security',
        ]);

        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 10);
        $category = $request->input('category');

        $query = Staff::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('nip', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($category)) {
            $query->where('category', $category);
        }

        $query->orderBy('name', 'asc');

        $staff = $query->paginate($perPage)->withQueryString();

        $formattedStaff = $staff->map(function (Staff $item) {
            return [
                'id' => $item->id,
                'name' => $item->name,
                'nip' => $item->nip,
                'phone' => $item->phone,
                'address' => $item->address,
                'position' => $item->position,
                'category' => $item->category,
                'join_date' => $item->join_date,
                'is_active' => (bool) $item->is_active,
                'profile_picture' => $item->profile_picture ?: '/assets/images/default-avatar.png',
                'updated_at' => $item->updated_at ? $item->updated_at->timestamp : null,
            ];
        });

        return Inertia::render('Admin/Staff/Index', [
            'staff' => $formattedStaff,
            'pagination' => [
                'total' => $staff->total(),
                'per_page' => $staff->perPage(),
                'current_page' => $staff->currentPage(),
                'last_page' => $staff->lastPage(),
                'from' => $staff->firstItem(),
                'to' => $staff->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'category' => $category,
            ],
        ]);
    }

    /**
     * Export staff data as CSV (bisa dibuka di Excel).
     */
    public function export(Request $request)
    {
        $staff = Staff::with('user')->get();

        $filename = 'data_staf_' . now()->format('Ymd_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($staff) {
            $output = fopen('php://output', 'w');

            // Tambah BOM supaya Excel membaca UTF-8 dengan benar
            fprintf($output, chr(0xEF) . chr(0xBB) . chr(0xBF));

            $delimiter = ';';

            // Header kolom
            fputcsv($output, ['Nama', 'Kategori', 'NIP', 'Email', 'Jabatan', 'Telepon', 'Alamat', 'Status'], $delimiter);

            foreach ($staff as $item) {
                $kategori = $item->category === 'security' ? 'Security' : 'Staf';
                $status = $item->is_active ? 'Aktif' : 'Nonaktif';

                fputcsv($output, [
                    $item->name,
                    $kategori,
                    $item->nip,
                    optional($item->user)->email,
                    $item->position,
                    $item->phone,
                    $item->address,
                    $status,
                ], $delimiter);
            }

            fclose($output);
        };

        return response()->streamDownload($callback, $filename, $headers);
    }

    public function create()
    {
        return Inertia::render('Admin/Staff/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'nip' => 'nullable|string|max:20|unique:staff,nip',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'category' => 'required|in:staff,security',
                'join_date' => 'nullable|date',
                'is_active' => 'nullable|boolean',
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ],
            [
                'name.required' => 'Nama wajib diisi.',
                'name.max' => 'Nama maksimal :max karakter.',

                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Format email tidak valid.',
                'email.max' => 'Email maksimal :max karakter.',
                'email.unique' => 'Email sudah digunakan oleh pengguna lain.',

                'password.required' => 'Password wajib diisi.',
                'password.min' => 'Password minimal :min karakter.',
                'password.confirmed' => 'Konfirmasi password tidak sama.',

                'nip.max' => 'NIP maksimal :max karakter.',
                'nip.unique' => 'NIP sudah digunakan oleh staf lain.',

                'phone.max' => 'Nomor telepon maksimal :max karakter.',

                'address.max' => 'Alamat maksimal :max karakter.',

                'position.max' => 'Jabatan maksimal :max karakter.',

                'category.required' => 'Kategori wajib dipilih.',
                'category.in' => 'Kategori tidak valid.',

                'join_date.date' => 'Tanggal bergabung tidak valid.',

                'profile_picture.image' => 'Foto profil harus berupa gambar.',
                'profile_picture.mimes' => 'Foto profil harus berformat jpg, jpeg, png, atau gif.',
                'profile_picture.max' => 'Ukuran foto profil maksimal :max kilobyte.',
            ]
        );

        try {
            DB::beginTransaction();

            // Buat akun user untuk staf (role: staff)
            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff',
            ]);

            // Tentukan path foto profil (default atau upload)
            $profilePicturePath = '/assets/images/default-avatar.png';
            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('avatars/staff', 'public');
                $profilePicturePath = '/storage/' . $path;
            }

            // Buat data staf terkait user tersebut
            $staff = Staff::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'nip' => $request->nip,
                'phone' => $request->phone,
                'address' => $request->address,
                'position' => $request->position,
                'category' => $request->category,
                'join_date' => $request->join_date,
                'is_active' => $request->boolean('is_active', true),
                'profile_picture' => $profilePicturePath,
            ]);

            DB::commit();

            return redirect()
                ->route('admin.staff.index')
                ->with('success', 'Data staf berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating staff: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menambahkan staf: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Staff $staff)
    {
        $staff->load('user');

        return Inertia::render('Admin/Staff/Show', [
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'nip' => $staff->nip,
                'phone' => $staff->phone,
                'address' => $staff->address,
                'position' => $staff->position,
                'category' => $staff->category,
                'join_date' => $staff->join_date,
                'is_active' => (bool) $staff->is_active,
                'email' => optional($staff->user)->email,
                'profile_picture' => $staff->profile_picture ?: '/assets/images/default-avatar.png',
            ],
        ]);
    }

    public function edit(Staff $staff)
    {
        $staff->load('user');

        return Inertia::render('Admin/Staff/Edit', [
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'nip' => $staff->nip,
                'phone' => $staff->phone,
                'address' => $staff->address,
                'position' => $staff->position,
                'category' => $staff->category,
                'join_date' => $staff->join_date,
                'is_active' => (bool) $staff->is_active,
                'email' => optional($staff->user)->email,
                'profile_picture' => $staff->profile_picture ?: '/assets/images/default-avatar.png',
            ],
        ]);
    }

    public function update(Request $request, Staff $staff)
    {
        $validated = $request->validate(
            [
                // Untuk update, field boleh tidak dikirim (akan mempertahankan nilai lama)
                'name' => 'sometimes|string|max:255',
                'email' => 'sometimes|string|email|max:255|unique:users,email,' . $staff->user_id,
                'password' => 'nullable|string|min:8|confirmed',
                'nip' => 'nullable|string|max:20|unique:staff,nip,' . $staff->id,
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'category' => 'sometimes|in:staff,security',
                'join_date' => 'nullable|date',
                'is_active' => 'nullable|boolean',
                'profile_picture' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
            ],
            [
                'name.max' => 'Nama maksimal :max karakter.',

                'email.email' => 'Format email tidak valid.',
                'email.max' => 'Email maksimal :max karakter.',
                'email.unique' => 'Email sudah digunakan oleh pengguna lain.',

                'password.min' => 'Password minimal :min karakter.',
                'password.confirmed' => 'Konfirmasi password tidak sama.',

                'nip.max' => 'NIP maksimal :max karakter.',
                'nip.unique' => 'NIP sudah digunakan oleh staf lain.',

                'phone.max' => 'Nomor telepon maksimal :max karakter.',

                'address.max' => 'Alamat maksimal :max karakter.',

                'position.max' => 'Jabatan maksimal :max karakter.',

                'category.in' => 'Kategori tidak valid.',

                'join_date.date' => 'Tanggal bergabung tidak valid.',

                'profile_picture.image' => 'Foto profil harus berupa gambar.',
                'profile_picture.mimes' => 'Foto profil harus berformat jpg, jpeg, png, atau gif.',
                'profile_picture.max' => 'Ukuran foto profil maksimal :max kilobyte.',
            ]
        );

        try {
            DB::beginTransaction();

            // Update data user (email/password)
            if ($staff->user) {
                $userData = [];

                // Hanya update email jika dikirim dari form
                if ($request->has('email')) {
                    $userData['email'] = $request->email;
                }

                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                if (!empty($userData)) {
                    $staff->user->update($userData);
                }
            }

            // Tentukan path foto profil (tetap, atau upload baru jika ada)
            $profilePicturePath = $staff->profile_picture ?? '/assets/images/default-avatar.png';
            if ($request->hasFile('profile_picture')) {
                $path = $request->file('profile_picture')->store('avatars/staff', 'public');
                $profilePicturePath = '/storage/' . $path;
            }

            $staff->update([
                'name' => $request->input('name', $staff->name),
                'nip' => $request->input('nip', $staff->nip),
                'phone' => $request->input('phone', $staff->phone),
                'address' => $request->input('address', $staff->address),
                'position' => $request->input('position', $staff->position),
                'category' => $request->input('category', $staff->category),
                'join_date' => $request->input('join_date', $staff->join_date),
                'is_active' => $request->boolean('is_active', $staff->is_active),
                'profile_picture' => $profilePicturePath,
            ]);

            DB::commit();

            return redirect()
                ->route('admin.staff.index')
                ->with('success', 'Data staf berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating staff: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal memperbarui staf: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Staff $staff)
    {
        try {
            $userId = $staff->user_id;
            $staff->delete();

            if ($userId) {
                User::where('id', $userId)->delete();
            }

            return redirect()
                ->route('admin.staff.index')
                ->with('success', 'Data staf berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting staff: ' . $e->getMessage());

            return redirect()
                ->back()
                ->withErrors(['error' => 'Gagal menghapus staf: ' . $e->getMessage()]);
        }
    }
}
