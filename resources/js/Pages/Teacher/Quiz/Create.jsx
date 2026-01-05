import React, { useState } from "react";
import { Link, useForm } from "@inertiajs/react";
import TeacherLayout from "@/Layouts/TeacherLayout";
import { ArrowLeft2, Add, CloseCircle } from "iconsax-reactjs";

const emptyQuestion = {
    type: "multiple_choice",
    question_text: "",
    points: 1,
    options: [
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
    ],
};

const TeacherQuizCreate = ({ classes, subjects }) => {
    const { data, setData, post, processing, errors } = useForm({
        title: "",
        description: "",
        class_id: classes[0]?.id || "",
        subject_id: subjects[0]?.id || "",
        duration_minutes: 30,
        shuffle_questions: true,
        show_answers_after_submission: false,
        start_at: "",
        end_at: "",
        questions: [structuredClone(emptyQuestion)],
    });

    const addQuestion = () => {
        setData("questions", [...data.questions, structuredClone(emptyQuestion)]);
    };

    const removeQuestion = (index) => {
        const updated = data.questions.filter((_, i) => i !== index);
        setData("questions", updated.length ? updated : [structuredClone(emptyQuestion)]);
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...data.questions];
        updated[index][field] = value;
        if (field === "type" && value === "essay") {
            updated[index].options = [];
            updated[index].points = 1;
        }
        setData("questions", updated);
    };

    const updateOption = (qIndex, oIndex, field, value) => {
        const updated = [...data.questions];
        updated[qIndex].options[oIndex][field] = value;
        setData("questions", updated);
    };

    const addOption = (qIndex) => {
        const updated = [...data.questions];
        updated[qIndex].options.push({ option_text: "", is_correct: false });
        setData("questions", updated);
    };

    const removeOption = (qIndex, oIndex) => {
        const updated = [...data.questions];
        updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== oIndex);
        setData("questions", updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("teacher.quizzes.store"));
    };

    return (
        <TeacherLayout title="Buat Quiz">
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("teacher.quizzes.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2 size="24" className="text-gray-600" />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">Buat Quiz</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData("title", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                    required
                                />
                                <p className="text-red-500 text-sm">{errors.title}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kelas
                                </label>
                                <select
                                    value={data.class_id}
                                    onChange={(e) => setData("class_id", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {classes.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-red-500 text-sm">{errors.class_id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mapel
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData("subject_id", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    {subjects.map((subj) => (
                                        <option key={subj.id} value={subj.id}>
                                            {subj.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-red-500 text-sm">{errors.subject_id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Durasi (menit)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="300"
                                    value={data.duration_minutes}
                                    onChange={(e) => setData("duration_minutes", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                                <p className="text-red-500 text-sm">{errors.duration_minutes}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mulai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.start_at}
                                    onChange={(e) => setData("start_at", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                                <p className="text-red-500 text-sm">{errors.start_at}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Selesai
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.end_at}
                                    onChange={(e) => setData("end_at", e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                                <p className="text-red-500 text-sm">{errors.end_at}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="shuffle_questions"
                                    type="checkbox"
                                    checked={data.shuffle_questions}
                                    onChange={(e) => setData("shuffle_questions", e.target.checked)}
                                />
                                <label htmlFor="shuffle_questions" className="text-sm text-gray-700">
                                    Acak urutan soal
                                </label>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    id="show_answers_after_submission"
                                    type="checkbox"
                                    checked={data.show_answers_after_submission}
                                    onChange={(e) =>
                                        setData("show_answers_after_submission", e.target.checked)
                                    }
                                />
                                <label
                                    htmlFor="show_answers_after_submission"
                                    className="text-sm text-gray-700"
                                >
                                    Tampilkan kunci setelah submit (PG)
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">Daftar Soal</h3>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
                                >
                                    <Add size="18" />
                                    <span>Tambah Soal</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {data.questions.map((q, qIdx) => (
                                    <div key={qIdx} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                                        <div className="flex justify-between items-center">
                                            <p className="font-medium text-gray-800">
                                                Soal #{qIdx + 1}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIdx)}
                                                className="text-red-600 flex items-center gap-1"
                                            >
                                                <CloseCircle size="18" />
                                                Hapus
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm text-gray-700">Tipe</label>
                                                <select
                                                    value={q.type}
                                                    onChange={(e) =>
                                                        updateQuestion(qIdx, "type", e.target.value)
                                                    }
                                                    className="w-full border rounded-lg px-3 py-2"
                                                >
                                                    <option value="multiple_choice">Pilihan Ganda</option>
                                                    <option value="essay">Uraian</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-700">Poin</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={q.points}
                                                    onChange={(e) =>
                                                        updateQuestion(qIdx, "points", e.target.value)
                                                    }
                                                    className="w-full border rounded-lg px-3 py-2"
                                                    disabled={q.type === "multiple_choice"}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-700">Pertanyaan</label>
                                            <textarea
                                                value={q.question_text}
                                                onChange={(e) =>
                                                    updateQuestion(qIdx, "question_text", e.target.value)
                                                }
                                                className="w-full border rounded-lg px-3 py-2"
                                                rows="3"
                                            />
                                        </div>

                                        {q.type === "multiple_choice" && (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-700">Pilihan Jawaban</p>
                                                {q.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name={`correct-${qIdx}`}
                                                            checked={opt.is_correct}
                                                            onChange={() =>
                                                                updateOption(qIdx, oIdx, "is_correct", true)
                                                            }
                                                        />
                                                        <input
                                                            type="text"
                                                            value={opt.option_text}
                                                            onChange={(e) =>
                                                                updateOption(
                                                                    qIdx,
                                                                    oIdx,
                                                                    "option_text",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="flex-1 border rounded-lg px-3 py-2"
                                                            placeholder={`Pilihan ${oIdx + 1}`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOption(qIdx, oIdx)}
                                                            className="text-red-500"
                                                        >
                                                            <CloseCircle size="18" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(qIdx)}
                                                    className="text-blue-600 text-sm"
                                                >
                                                    + Tambah pilihan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link
                                href={route("teacher.quizzes.index")}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-75"
                            >
                                Simpan Quiz
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </TeacherLayout>
    );
};

export default TeacherQuizCreate;
