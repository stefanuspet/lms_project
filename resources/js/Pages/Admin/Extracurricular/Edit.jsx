import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const ExtracurricularEdit = ({ extracurricular, teachers, semesters }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: extracurricular.name || "",
        description: extracurricular.description || "",
        teacher_id: extracurricular.teacher_id || "",
        semester_id: extracurricular.semester_id || "",
        day_of_week: extracurricular.day_of_week || "",
        start_time: extracurricular.start_time || "",
        end_time: extracurricular.end_time || "",
        room: extracurricular.room || "",
        is_active: extracurricular.is_active,
    });

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setData(name, type === "checkbox" ? checked : value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("admin.extracurriculars.update", extracurricular.id));
    };

    return (
        <AuthenticatedLayout title="Edit Ekstrakurikuler">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.extracurriculars.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2 size="24" className="text-gray-600" />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Edit Ekstrakurikuler
                            </h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="name" value="Nama Ekstrakurikuler" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_id" value="Guru Pembina" />
                                    <SelectInput
                                        id="teacher_id"
                                        name="teacher_id"
                                        value={data.teacher_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Pilih Guru</option>
                                        {teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.teacher_id}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="semester_id" value="Semester" />
                                    <SelectInput
                                        id="semester_id"
                                        name="semester_id"
                                        value={data.semester_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Pilih Semester</option>
                                        {semesters.map((semester) => (
                                            <option key={semester.id} value={semester.id}>
                                                {semester.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.semester_id}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="day_of_week" value="Hari Kegiatan" />
                                    <SelectInput
                                        id="day_of_week"
                                        name="day_of_week"
                                        value={data.day_of_week}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    >
                                        <option value="">Pilih Hari (opsional)</option>
                                        <option value="monday">Senin</option>
                                        <option value="tuesday">Selasa</option>
                                        <option value="wednesday">Rabu</option>
                                        <option value="thursday">Kamis</option>
                                        <option value="friday">Jumat</option>
                                        <option value="saturday">Sabtu</option>
                                        <option value="sunday">Minggu</option>
                                    </SelectInput>
                                    <InputError
                                        message={errors.day_of_week}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="start_time" value="Jam Mulai" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError
                                        message={errors.start_time}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="end_time" value="Jam Selesai" />
                                    <TextInput
                                        id="end_time"
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="room" value="Ruang (opsional)" />
                                    <TextInput
                                        id="room"
                                        type="text"
                                        name="room"
                                        value={data.room || ""}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        placeholder="Contoh: Lapangan, Aula, Lab"
                                    />
                                    <InputError message={errors.room} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="description" value="Deskripsi" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description || ""}
                                        onChange={handleChange}
                                        rows="3"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                                    ></textarea>
                                    <InputError
                                        message={errors.description}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="md:col-span-2 flex items-center gap-2 mt-2">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-amber-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor="is_active"
                                        className="text-sm text-gray-700"
                                    >
                                        Ekstrakurikuler aktif
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.extracurriculars.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ExtracurricularEdit;
