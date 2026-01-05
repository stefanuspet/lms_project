import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import { Add, Message, ArrowRight2, ArrowLeft2 } from "iconsax-reactjs";

const DiscussionIndex = ({ subject, threads, flash }) => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setProcessing(true);
        router.post(
            route("student.discussions.store", subject.id),
            { title, body },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setTitle("");
                    setBody("");
                },
            }
        );
    };

    const openThread = (threadId) => {
        router.get(route("student.discussions.show", [subject.id, threadId]));
    };

    return (
        <StudentLayout title={`Diskusi: ${subject.name}`}>
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{flash.success}</p>
                </div>
            )}

            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-3">
                            <Link
                                href={route("student.subjects.show", subject.id)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <div>
                                <h1 className="font-bold text-xl text-gray-800">
                                    Diskusi Mata Pelajaran
                                </h1>
                                <p className="text-xs text-gray-500 mt-1">
                                    Tanyakan hal yang belum jelas dan baca
                                    penjelasan dari guru.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form topik baru */}
                    <div className="px-6 py-5 border-b bg-gray-50">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-3 max-w-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <Add size="18" className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Buat pertanyaan baru
                                </span>
                            </div>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Judul pertanyaan (misal: Saya bingung di rumus nomor 3)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                rows="3"
                                placeholder="Jelaskan pertanyaanmu (bisa tulis nomor soal, langkah yang sudah kamu coba, dll.)"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                                >
                                    Kirim Pertanyaan
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* List thread */}
                    <div className="px-6 py-5">
                        {threads.length > 0 ? (
                            <div className="space-y-3">
                                {threads.map((thread) => (
                                    <div
                                        key={thread.id}
                                        onClick={() => openThread(thread.id)}
                                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <Message
                                                    size="20"
                                                    className="text-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900">
                                                    {thread.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {thread.creator} •{" "}
                                                    {thread.created_at}
                                                </p>
                                                {thread.excerpt && (
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {thread.excerpt}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-gray-500">
                                                {thread.replies_count} balasan
                                            </span>
                                            <ArrowRight2
                                                size="18"
                                                className="text-gray-400"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">
                                Belum ada diskusi untuk mata pelajaran ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default DiscussionIndex;

