import React from "react";
import { Link } from "@inertiajs/react";
import StudentLayout from "@/Layouts/StudentLayout";
import {
    ArrowLeft2,
    Book1,
    Teacher,
    DocumentText,
    ClipboardText,
    Information,
    Chart,
    StatusUp,
    TrendUp,
    TrendDown,
    ClipboardTick,
    Calendar,
    MessageEdit,
    EmptyWallet,
} from "iconsax-reactjs";

const StudentSubjectGrades = ({ subject, assignments, grade_statistics }) => {
    // Function to get grade level color
    const getGradeLevelColor = (grade) => {
        if (grade === null) return 'bg-gray-100 text-gray-800';
        
        if (grade >= 90) return 'bg-green-100 text-green-800';
        if (grade >= 80) return 'bg-blue-100 text-blue-800';
        if (grade >= 70) return 'bg-yellow-100 text-yellow-800';
        if (grade >= 60) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };
    
    // Function to get grade trend icon
    const getGradeTrendIcon = (grade) => {
        if (grade === null) return null;
        
        if (grade >= 80) return <TrendUp size="16" className="text-green-600" />;
        if (grade >= 70) return <StatusUp size="16" className="text-blue-600" />;
        return <TrendDown size="16" className="text-red-600" />;
    };
    
    // Function to get assignment status
    const getAssignmentStatus = (assignment) => {
        if (assignment.grade !== null) {
            return <span className={`px-2 py-1 text-xs rounded-full ${getGradeLevelColor(assignment.grade)}`}>
                {assignment.grade}
            </span>;
        }
        
        if (assignment.has_submission) {
            return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                Submitted
            </span>;
        }
        
        if (new Date(assignment.deadline) < new Date()) {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                Missing
            </span>;
        }
        
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Pending
        </span>;
    };
    
    return (
        <StudentLayout title={`Grades: ${subject.name}`}>
            <div className="py-6 w-full">
                <div className="w-full bg-white rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 border-b">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route("student.grades.index")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft2
                                    size="24"
                                    className="text-gray-600"
                                />
                            </Link>
                            <h1 className="font-bold text-xl text-gray-800">
                                Subject Grades
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="md:col-span-2 space-y-6">
                                {/* Subject Info Card */}
                                <div className="bg-blue-50 p-5 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Book1 size="24" className="text-blue-600" />
                                            <h2 className="text-xl font-bold text-gray-800">{subject.name}</h2>
                                        </div>
                                        <div className="flex items-center mt-2 text-gray-600">
                                            <Teacher size="18" className="mr-2" />
                                            <span>Teacher: {subject.teacher_name}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <span className="text-sm text-gray-600">Average Grade</span>
                                        <div className="flex items-center justify-center mt-1">
                                            {getGradeTrendIcon(grade_statistics.average_grade)}
                                            <span className={`ml-1 px-3 py-1.5 text-lg font-bold rounded-lg ${getGradeLevelColor(grade_statistics.average_grade)}`}>
                                                {grade_statistics.average_grade || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Grade Statistics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Assignments</span>
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <ClipboardText size="16" className="text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xl font-bold text-gray-800">
                                                {grade_statistics.total_assignments}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {grade_statistics.graded_assignments} graded
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Highest Grade</span>
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <TrendUp size="16" className="text-green-600" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xl font-bold text-gray-800">
                                                {grade_statistics.highest_grade || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Best performance
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Lowest Grade</span>
                                            <div className="p-2 bg-red-100 rounded-full">
                                                <TrendDown size="16" className="text-red-600" />
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-xl font-bold text-gray-800">
                                                {grade_statistics.lowest_grade || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Area for improvement
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Assignments Table */}
                                <div className="bg-white border rounded-lg">
                                    <div className="px-6 py-4 border-b">
                                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            <ClipboardTick
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <span>Assignment Grades</span>
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        {assignments && assignments.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Assignment
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Due Date
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Grade
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                            </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {assignments.map((assignment) => (
                                                            <tr key={assignment.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <ClipboardText size="16" className="text-amber-600 mr-2" />
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {assignment.title}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <Calendar size="16" className="text-gray-500 mr-2" />
                                                                        <div className="text-sm text-gray-500">
                                                                            {assignment.deadline}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {getAssignmentStatus(assignment)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {assignment.grade !== null ? (
                                                                        <div className="flex items-center">
                                                                            {getGradeTrendIcon(assignment.grade)}
                                                                            <span className={`ml-1 font-medium ${
                                                                                assignment.grade >= 80 ? "text-green-600" :
                                                                                assignment.grade >= 70 ? "text-blue-600" :
                                                                                assignment.grade >= 60 ? "text-yellow-600" :
                                                                                "text-red-600"
                                                                            }`}>
                                                                                {assignment.grade}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">Not graded</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    {assignment.has_submission ? (
                                                                        <Link
                                                                            href={route("student.submissions.show", assignment.submission_id)}
                                                                            className="text-blue-600 hover:text-blue-900"
                                                                        >
                                                                            View Submission
                                                                        </Link>
                                                                    ) : new Date(assignment.deadline) > new Date() ? (
                                                                        <Link
                                                                            href={route("student.assignments.submit", assignment.id)}
                                                                            className="text-blue-600 hover:text-blue-900"
                                                                        >
                                                                            Submit
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-gray-400 italic">Deadline passed</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <ClipboardText
                                                    size="48"
                                                    className="mx-auto text-gray-300 mb-3"
                                                />
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Assignments Found</h3>
                                                <p className="text-gray-500">
                                                    There are no assignments for this subject yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Grade Overview Card */}
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <div className="px-6 py-4 border-b">
                                        <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                            <Chart
                                                size="20"
                                                className="text-blue-600"
                                            />
                                            <span>Grade Overview</span>
                                        </h3>
                                    </div>
                                    <div className="px-6 py-4">
                                        {grade_statistics.graded_assignments > 0 ? (
                                            <div>
                                                <div className="flex flex-col items-center justify-center mb-6">
                                                    <div className="relative w-32 h-32">
                                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                                            <path
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke="#eee"
                                                                strokeWidth="3"
                                                            />
                                                            <path
                                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                fill="none"
                                                                stroke={
                                                                    grade_statistics.average_grade >= 80 ? "#22c55e" :
                                                                    grade_statistics.average_grade >= 70 ? "#3b82f6" :
                                                                    grade_statistics.average_grade >= 60 ? "#eab308" :
                                                                    "#ef4444"
                                                                }
                                                                strokeWidth="3"
                                                                strokeDasharray={`${grade_statistics.average_grade !== null ? 
                                                                    (grade_statistics.average_grade / 100) * 100 : 0}, 100`}
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <span className="text-2xl font-bold text-gray-800">
                                                                {grade_statistics.average_grade || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-medium text-gray-700 mt-3">
                                                        Average Grade
                                                    </p>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-gray-700">Completed</span>
                                                            <span className="text-sm text-gray-500">
                                                                {grade_statistics.graded_assignments}/{grade_statistics.total_assignments}
                                                            </span>
                                                        </div>
                                                        <div className="bg-gray-200 h-2 rounded-full">
                                                            <div 
                                                                className="bg-blue-500 h-full rounded-full" 
                                                                style={{ 
                                                                    width: `${grade_statistics.total_assignments > 0 ? 
                                                                        (grade_statistics.graded_assignments / grade_statistics.total_assignments) * 100 : 0}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="pt-3 border-t">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-xs text-gray-500">Highest</p>
                                                                <p className="text-lg font-bold text-green-600">
                                                                    {grade_statistics.highest_grade || 'N/A'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-xs text-gray-500">Lowest</p>
                                                                <p className="text-lg font-bold text-red-600">
                                                                    {grade_statistics.lowest_grade || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <p>No grade data available yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Grade Scale Info Card */}
                                <div className="bg-blue-50 rounded-xl shadow-sm p-5 border border-blue-100">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                        <Information
                                            size="20"
                                            className="text-blue-600"
                                        />
                                        <span>Grade Scale</span>
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                            <span className="text-sm font-medium text-blue-700">90-100 - Excellent</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                            <span className="text-sm font-medium text-blue-700">80-89 - Good</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                            <span className="text-sm font-medium text-blue-700">70-79 - Satisfactory</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                                            <span className="text-sm font-medium text-blue-700">60-69 - Needs Improvement</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                            <span className="text-sm font-medium text-blue-700">Below 60 - Below Standard</span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t border-blue-200">
                                        <p className="text-sm text-blue-700">
                                            If you have questions about your grades or need help improving, please contact your teacher.
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Quick Links */}
                                <div className="bg-white rounded-xl shadow-sm border">
                                    <div className="px-6 py-4 border-b">
                                        <h3 className="font-bold text-lg text-gray-800">Quick Links</h3>
                                    </div>
                                    <div className="px-6 py-4 space-y-2">
                                        <Link
                                            href={route("student.subjects.show", subject.id)}
                                            className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                                        >
                                            <Book1
                                                size="20"
                                                className="text-blue-600"
                                            />
                                            <span>View Subject Page</span>
                                        </Link>
                                        <Link
                                            href={route("student.materials.index", { subject_id: subject.id })}
                                            className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                                        >
                                            <DocumentText
                                                size="20"
                                                className="text-green-600"
                                            />
                                            <span>View Materials</span>
                                        </Link>
                                        <Link
                                            href={route("student.assignments.index", { subject_id: subject.id })}
                                            className="block w-full px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-2"
                                        >
                                            <ClipboardText
                                                size="20"
                                                className="text-amber-600"
                                            />
                                            <span>View Assignments</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex justify-between">
                        <Link
                            href={route("student.grades.index")}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft2 size="18" />
                            <span>Back to All Grades</span>
                        </Link>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentSubjectGrades;