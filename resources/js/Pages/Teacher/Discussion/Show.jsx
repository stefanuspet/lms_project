import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";

const DiscussionShow = ({
    subject,
    thread,
    replies,
    flash,
    current_user_id,
}) => {
    const [body, setBody] = useState("");
    const [processing, setProcessing] = useState(false);
    const [replyParent, setReplyParent] = useState(null);

    // Auto refresh ringan setiap 5 detik untuk mengambil balasan baru
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["replies"],
                preserveScroll: true,
                preserveState: true,
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!body.trim()) return;

        setProcessing(true);
        router.post(
            route("teacher.discussions.reply", [subject.id, thread.id]),
            { body, parent_reply_id: replyParent?.id ?? null },
            {
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    setBody("");
                    setReplyParent(null);
                },
            }
        );
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
                    {/* Header topik */}
                    <div className="px-6 py-5 border-b">
                        <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg pl-4 pr-3 py-3">
                            <h1 className="font-bold text-xl text-gray-800">
                                {thread.title}
                            </h1>
                            <p className="text-xs text-gray-600 mt-1">
                                Oleh {thread.creator.name} •{" "}
                                {thread.created_at}
                            </p>
                            {thread.body && (
                                <p className="mt-3 text-sm text-gray-800 whitespace-pre-line">
                                    {thread.body}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Area balasan, gaya chat */}
                    <div className="px-6 py-5 space-y-3 bg-gray-50">
                        {replies.length > 0 ? (
                            replies.map((reply) => {
                                const isMine =
                                    reply.user.id === current_user_id;
                                return (
                                    <div
                                        key={reply.id}
                                        className={`flex ${
                                            isMine
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm text-sm whitespace-pre-line ${
                                                isMine
                                                    ? "bg-blue-100 border border-blue-200 text-gray-900"
                                                    : "bg-white border border-gray-200 text-gray-900"
                                            }`}
                                        >
                                            <p className="text-xs font-semibold text-gray-700 mb-1">
                                                {reply.user.name}
                                                <span className="ml-2 text-[11px] text-gray-500">
                                                    {reply.created_at}
                                                </span>
                                            </p>
                                            {reply.parent && (
                                                <div className="mb-2 rounded-lg bg-white/70 border border-blue-100 px-3 py-1.5 text-[11px] text-gray-600">
                                                    <p className="font-semibold">
                                                        Membalas{" "}
                                                        {
                                                            reply.parent
                                                                .user_name
                                                        }
                                                    </p>
                                                    <p className="italic mt-0.5">
                                                        {
                                                            reply.parent
                                                                .body_excerpt
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                            <p>{reply.body}</p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setReplyParent(
                                                        reply.parent
                                                            ? {
                                                                  id: reply.id,
                                                                  user_name:
                                                                      reply
                                                                          .user
                                                                          .name,
                                                                  body_excerpt:
                                                                      reply.body.length >
                                                                      80
                                                                          ? `${reply.body.slice(
                                                                                0,
                                                                                80
                                                                            )}...`
                                                                          : reply.body,
                                                              }
                                                            : {
                                                                  id: reply.id,
                                                                  user_name:
                                                                      reply
                                                                          .user
                                                                          .name,
                                                                  body_excerpt:
                                                                      reply.body.length >
                                                                      80
                                                                          ? `${reply.body.slice(
                                                                                0,
                                                                                80
                                                                            )}...`
                                                                          : reply.body,
                                                              }
                                                    )
                                                }
                                                className="mt-1 text-[11px] text-blue-600 hover:underline"
                                            >
                                                Balas
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">
                                Belum ada balasan. Mulai diskusi dengan menulis
                                komentar pertama.
                            </p>
                        )}
                    </div>

                    {/* Form balasan */}
                    <div className="px-6 py-5 border-t bg-white">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            {replyParent && (
                                <div className="flex items-start justify-between rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-gray-700">
                                    <div>
                                        <p className="font-semibold">
                                            Membalas {replyParent.user_name}
                                        </p>
                                        <p className="mt-1 italic">
                                            {replyParent.body_excerpt}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setReplyParent(null)}
                                        className="ml-3 text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <textarea
                                className="w-full rounded-2xl border-gray-300 text-sm shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                rows="3"
                                placeholder="Tulis balasan untuk diskusi ini..."
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || thread.is_closed}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-70"
                                >
                                    Kirim Balasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default DiscussionShow;
