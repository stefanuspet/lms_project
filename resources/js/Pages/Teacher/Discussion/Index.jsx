import React, { useState } from "react";
import { router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { Add, Message, ArrowRight2 } from "iconsax-reactjs";

const DiscussionIndex = ({ subject, threads, flash }) => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setProcessing(true);
        router.post(
            route("teacher.discussions.store", subject.id),
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
        router.get(route("teacher.discussions.show", [subject.id, threadId]));
    };

    return (
        <TeacherLayout title={`Diskusi - ${subject.name}`}>
            {flash?.success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                    <p>{flash.success}</p>
                </div>
            )}

            <div className="py-8 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div>
                            <h1 className="font-bold text-xl text-gray-800">
                                Diskusi Mata Pelajaran
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Buat topik diskusi untuk kelas dan jawab
                                pertanyaan siswa.
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-5 border-b bg-gray-50">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-3 max-w-2xl"
                        >
                            <div className="flex items-center gap-2">
                                <Add size="18" className="text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">
                                    Topik baru
                                </span>
                            </div>
                            <input
                                type="text"
                                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                placeholder="Judul diskusi (misal: Tanya jawab Ulangan Harian Bab 2)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                rows="3"
                                placeholder="Penjelasan singkat (opsional)"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                                >
                                    <span>Buat Topik</span>
                                </button>
                            </div>
                        </form>
                    </div>

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
                                Belum ada topik diskusi untuk mata pelajaran
                                ini.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default DiscussionIndex;

