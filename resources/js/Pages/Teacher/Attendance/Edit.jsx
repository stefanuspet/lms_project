import { useState } from "react";
import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import TextArea from "@/Components/TextArea";
import { ArrowLeft } from "iconsax-reactjs";
import { Link } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";

export default function Edit({ session }) {
    const { data, setData, put, processing, errors } = useForm({
        title: session.title || "",
        description: session.description || "",
        date: session.date || "",
        start_time: session.start_time || "",
        duration_minutes: session.duration_minutes || 60,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("teacher.attendance.update", session.id));
    };

    return (
        <TeacherLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route("teacher.attendance.show", session.id)}
                        className="hover:opacity-70"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Edit Attendance Session
                    </h2>
                </div>
            }
        >
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <InputLabel htmlFor="title" value="Title" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData("title", e.target.value)
                                    }
                                    placeholder="Enter session title"
                                />
                                <InputError
                                    message={errors.title}
                                    className="mt-2"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <InputLabel
                                    htmlFor="description"
                                    value="Description"
                                />
                                <TextArea
                                    id="description"
                                    className="mt-1 block w-full"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Enter session description (optional)"
                                    rows={4}
                                />
                                <InputError
                                    message={errors.description}
                                    className="mt-2"
                                />
                            </div>

                            {/* Date */}
                            <div>
                                <InputLabel htmlFor="date" value="Date" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.date}
                                    onChange={(e) =>
                                        setData("date", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.date}
                                    className="mt-2"
                                />
                            </div>

                            {/* Start Time */}
                            <div>
                                <InputLabel
                                    htmlFor="start_time"
                                    value="Start Time"
                                />
                                <TextInput
                                    id="start_time"
                                    type="time"
                                    className="mt-1 block w-full"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.start_time}
                                    className="mt-2"
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <InputLabel
                                    htmlFor="duration_minutes"
                                    value="Duration (minutes)"
                                />
                                <TextInput
                                    id="duration_minutes"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.duration_minutes}
                                    onChange={(e) =>
                                        setData(
                                            "duration_minutes",
                                            e.target.value,
                                        )
                                    }
                                    min="1"
                                    max="480"
                                />
                                <InputError
                                    message={errors.duration_minutes}
                                    className="mt-2"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-6 border-t">
                                <Link
                                    href={route(
                                        "teacher.attendance.show",
                                        session.id,
                                    )}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {processing ? "Saving..." : "Save Changes"}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
}
