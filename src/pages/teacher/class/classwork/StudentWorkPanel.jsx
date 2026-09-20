import { useState } from "react"

import CommentThread from "@/components/classwork/CommentThread"

import { formatFileSize, isPastDue } from "@/lib/classworkHelpers"
import { getSubmissionForStudent } from "@/lib/submissionStorage"
import { getPrivateComments, savePrivateComment } from "@/lib/commentStorage"
import { getAccountById } from "@/lib/accountStorage"
import UserAvatar from "@/components/UserAvatar"

function StudentWorkPanel({ item, classData, teacher }) {
  const students = classData.students || []
  const [expandedStudentId, setExpandedStudentId] = useState(null)
  const [commentsByStudent, setCommentsByStudent] = useState({})
  const pastDue = isPastDue(item)

  if (students.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No students have joined this class yet.
      </p>
    )
  }

  function toggleComments(studentId) {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null)
      return
    }

    setExpandedStudentId(studentId)

    if (!commentsByStudent[studentId]) {
      setCommentsByStudent((current) => ({
        ...current,
        [studentId]: getPrivateComments(item.id, studentId),
      }))
    }
  }

  function handlePostComment(studentId, text) {
    savePrivateComment({
      classworkId: item.id,
      studentId,
      authorId: teacher?.id,
      authorName: item.teacherName,
      authorRole: "Teacher",
      text,
    })

    setCommentsByStudent((current) => ({
      ...current,
      [studentId]: getPrivateComments(item.id, studentId),
    }))
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const submission = getSubmissionForStudent(item.id, student.id)
        const isExpanded = expandedStudentId === student.id
        const studentAccount = getAccountById(student.id)

        return (
          <div
            key={student.id}
            className="rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={studentAccount?.avatar}
                  name={student.name}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-400">{student.id}</p>
                </div>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  submission
                    ? "bg-emerald-50 text-emerald-700"
                    : pastDue
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {submission ? "Turned in" : pastDue ? "Missing" : "Assigned"}
              </span>
            </div>

            {submission && (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400">
                  Submitted{" "}
                  {new Date(submission.submittedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>

                {submission.note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {submission.note}
                  </p>
                )}

                <div className="mt-2 space-y-1.5">
                  {submission.files.map((file, index) => (
                    <a
                      key={`${file.name}-${index}`}
                      href={file.data}
                      download={file.name}
                      className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 hover:bg-blue-50"
                    >
                      <span className="min-w-0 truncate text-sm font-medium text-blue-800">
                        {file.name}
                      </span>

                      <span className="shrink-0 text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => toggleComments(student.id)}
                className="text-xs font-medium text-blue-700 hover:text-blue-900"
              >
                {isExpanded ? "Hide private comments" : "Private comments"}
              </button>

              {isExpanded && (
                <div className="mt-3">
                  <CommentThread
                    comments={commentsByStudent[student.id] || []}
                    onPost={(text) => handlePostComment(student.id, text)}
                    placeholder={`Private note to ${student.name}...`}
                  />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StudentWorkPanel
