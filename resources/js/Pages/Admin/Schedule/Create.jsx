import React, { useMemo } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import InputError from "@/Components/InputError";
import { ArrowLeft2 } from "iconsax-reactjs";

const ScheduleCreate = ({ options }) => {
    const { data, setData, post, processing, errors } = useForm({
        class_id: "",
        subject_id: "",
        teacher_id: "",
        semester_id: "",
        day_of_week: "monday",
        start_time: "07:00",
        end_time: "08:40",
        room: "",
        meeting_link: "",
        notes: "",
    });

    const filteredSubjects = useMemo(() => {
        if (!data.class_id) return options.subjects;
        return options.subjects.filter(
            (subject) => String(subject.class_id) === String(data.class_id)
        );
    }, [data.class_id, options.subjects]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.schedules.store"));
    };

    return (
        <AuthenticatedLayout title="Tambah Jadwal Pelajaran">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.schedules.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2 size="24" className="text-gray-600" />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Tambah Jadwal Pelajaran
                            </h1>
                        </div>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="class_id" value="Kelas" />
                                <SelectInput
                                    id="class_id"
                                    name="class_id"
                                    value={data.class_id}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Kelas</option>
                                    {options.classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.class_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="subject_id" value="Mata Pelajaran" />
                                <SelectInput
                                    id="subject_id"
                                    name="subject_id"
                                    value={data.subject_id}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Mata Pelajaran</option>
                                    {filteredSubjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.subject_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="teacher_id" value="Guru Pengampu" />
                                <SelectInput
                                    id="teacher_id"
                                    name="teacher_id"
                                    value={data.teacher_id}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Guru</option>
                                    {options.teachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.teacher_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="semester_id" value="Semester" />
                                <SelectInput
                                    id="semester_id"
                                    name="semester_id"
                                    value={data.semester_id}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                >
                                    <option value="">Pilih Semester (opsional)</option>
                                    {options.semesters.map((semester) => (
                                        <option key={semester.id} value={semester.id}>
                                            {semester.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.semester_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="day_of_week" value="Hari" />
                                <SelectInput
                                    id="day_of_week"
                                    name="day_of_week"
                                    value={data.day_of_week}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                >
                                    {Object.entries(options.days).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.day_of_week} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="start_time" value="Mulai" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="end_time" value="Selesai" />
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
                            </div>

                            <div>
                                <InputLabel htmlFor="room" value="Ruang/ Lab (opsional)" />
                                <TextInput
                                    id="room"
                                    type="text"
                                    name="room"
                                    value={data.room}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                    placeholder="Contoh: RPL-1 / Lab Komputer"
                                />
                                <InputError message={errors.room} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="meeting_link" value="Tautan Meeting (opsional)" />
                                <TextInput
                                    id="meeting_link"
                                    type="text"
                                    name="meeting_link"
                                    value={data.meeting_link}
                                    className="mt-1 block w-full"
                                    onChange={handleChange}
                                    placeholder="Masukkan link jika ada sesi daring"
                                />
                                <InputError message={errors.meeting_link} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="notes" value="Catatan (opsional)" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder="Tuliskan fokus kompetensi (mis. Praktik jaringan dasar, simulasi PLC, dsb.)"
                                ></textarea>
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3">
                                <Link
                                    href={route("admin.schedules.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ScheduleCreate;
