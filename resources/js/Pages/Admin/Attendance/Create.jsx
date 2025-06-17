import React, { useState, useEffect } from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import SelectInput from "@/Components/SelectInput";
import { ArrowLeft2 } from "iconsax-reactjs";

const AttendanceCreate = ({ semesters, classes, subjects }) => {
    const { data, setData, post, processing, errors } = useForm({
        date: new Date().toISOString().substr(0, 10), // Today's date
        semester_id: semesters.length > 0 ? semesters[0].id : "",
        class_id: classes.length > 0 ? classes[0].id : "",
        subject_id: subjects.length > 0 ? subjects[0].id : "",
        duration: "60", // Default 60 minutes
    });

    const [availableSubjects, setAvailableSubjects] = useState(subjects);

    useEffect(() => {
        // When class_id changes, fetch subjects for that class
        if (data.class_id) {
            fetch(
                route("admin.attendance.get-subjects-for-class", data.class_id)
            )
                .then((response) => response.json())
                .then((subjectsData) => {
                    setAvailableSubjects(subjectsData);

                    // If current subject_id is not in the new list, reset it
                    if (subjectsData.length > 0) {
                        const subjectExists = subjectsData.some(
                            (subject) => subject.id == data.subject_id
                        );
                        if (!subjectExists) {
                            setData("subject_id", subjectsData[0].id);
                        }
                    } else {
                        setData("subject_id", "");
                    }
                })
                .catch((error) => {
                    console.error("Error fetching subjects:", error);
                });
        }
    }, [data.class_id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.attendance.store"));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    return (
        <AuthenticatedLayout title="Create Attendance Session">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("admin.attendance.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Create Attendance Session
                            </h1>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Session Details Section */}
                                <div className="md:col-span-2">
                                    <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                        Attendance Session Details
                                    </h2>
                                </div>

                                {/* Date */}
                                <div>
                                    <InputLabel htmlFor="date" value="Date" />
                                    <TextInput
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={data.date}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    />
                                    <InputError
                                        message={errors.date}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Semester */}
                                <div>
                                    <InputLabel
                                        htmlFor="semester_id"
                                        value="Semester"
                                    />
                                    <SelectInput
                                        id="semester_id"
                                        name="semester_id"
                                        value={data.semester_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">
                                            Select Semester
                                        </option>
                                        {semesters.map((semester) => (
                                            <option
                                                key={semester.id}
                                                value={semester.id}
                                            >
                                                {semester.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.semester_id}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Class */}
                                <div>
                                    <InputLabel
                                        htmlFor="class_id"
                                        value="Class"
                                    />
                                    <SelectInput
                                        id="class_id"
                                        name="class_id"
                                        value={data.class_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((classItem) => (
                                            <option
                                                key={classItem.id}
                                                value={classItem.id}
                                            >
                                                {classItem.name}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.class_id}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Subject */}
                                <div>
                                    <InputLabel
                                        htmlFor="subject_id"
                                        value="Subject"
                                    />
                                    <SelectInput
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                        disabled={
                                            availableSubjects.length === 0
                                        }
                                    >
                                        <option value="">Select Subject</option>
                                        {availableSubjects.map((subject) => (
                                            <option
                                                key={subject.id}
                                                value={subject.id}
                                            >
                                                {subject.name}{" "}
                                                {subject.teacher
                                                    ? `(${subject.teacher})`
                                                    : ""}
                                            </option>
                                        ))}
                                    </SelectInput>
                                    <InputError
                                        message={errors.subject_id}
                                        className="mt-2"
                                    />
                                    {availableSubjects.length === 0 && (
                                        <p className="mt-1 text-xs text-red-500">
                                            No subjects available for this
                                            class. Please add subjects first.
                                        </p>
                                    )}
                                </div>

                                {/* Duration */}
                                <div>
                                    <InputLabel
                                        htmlFor="duration"
                                        value="Duration (minutes)"
                                    />
                                    <SelectInput
                                        id="duration"
                                        name="duration"
                                        value={data.duration}
                                        className="mt-1 block w-full"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                        <option value="240">4 hours</option>
                                        <option value="480">8 hours</option>
                                        <option value="720">12 hours</option>
                                        <option value="1440">24 hours</option>
                                    </SelectInput>
                                    <InputError
                                        message={errors.duration}
                                        className="mt-2"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        The PIN code will be valid for this
                                        duration.
                                    </p>
                                </div>

                                {/* Note about PIN */}
                                <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg mt-2">
                                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                                        How it works
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        When you create an attendance session,
                                        the system will generate a unique
                                        6-digit PIN code. Students can use this
                                        PIN to mark their attendance. The PIN
                                        will be valid for the specified
                                        duration. You can share the PIN with
                                        students through the class or manually
                                        mark attendance for them.
                                    </p>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end mt-6 space-x-3">
                                <Link
                                    href={route("admin.attendance.index")}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        availableSubjects.length === 0
                                    }
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                                >
                                    Create Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AttendanceCreate;
