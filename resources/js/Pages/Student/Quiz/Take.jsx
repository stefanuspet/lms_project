import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";

const StudentQuizTake = ({ quiz, questions }) => {
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(quiz.duration_minutes * 60);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleChoice = (qId, optionId) => {
        setAnswers({ ...answers, [qId]: { option_id: optionId } });
    };

    const handleEssay = (qId, value) => {
        setAnswers({ ...answers, [qId]: { essay_answer: value } });
    };

    const handleSubmit = () => {
        router.post(route("student.quizzes.submit", quiz.id), {
            answers: Object.entries(answers).map(([question_id, payload]) => ({
                question_id,
                option_id: payload.option_id,
                essay_answer: payload.essay_answer,
            })),
        });
    };

    return (
        <StudentLayout title={`Quiz: ${quiz.title}`}>
            <div className="py-6 w-full">
                <div className="bg-white rounded-xl shadow-sm p-6 mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">
                            {quiz.title}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Durasi: {quiz.duration_minutes} menit
                        </p>
                    </div>
                    <div className="text-2xl font-mono text-red-600">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <div
                            key={q.id}
                            className="bg-white rounded-xl shadow-sm p-5"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-gray-800">
                                    {idx + 1}. {q.question_text}
                                </p>
                                <span className="text-xs text-gray-500">
                                    {q.type === "multiple_choice"
                                        ? "PG (nilai 1)"
                                        : `Uraian (${q.points} poin)`}
                                </span>
                            </div>
                            {q.type === "multiple_choice" ? (
                                <div className="space-y-2">
                                    {q.options.map((opt) => (
                                        <label
                                            key={opt.id}
                                            className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                checked={
                                                    answers[q.id]?.option_id ===
                                                    opt.id
                                                }
                                                onChange={() =>
                                                    handleChoice(q.id, opt.id)
                                                }
                                            />
                                            <span>{opt.option_text}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="4"
                                    value={answers[q.id]?.essay_answer || ""}
                                    onChange={(e) =>
                                        handleEssay(q.id, e.target.value)
                                    }
                                    placeholder="Tuliskan jawaban uraian Anda"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Kirim Jawaban
                    </button>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentQuizTake;
