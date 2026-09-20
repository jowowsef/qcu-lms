import { useState } from "react"

import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"
import ClassworkPanel from "@/components/classwork/ClassworkPanel"
import CommentThread from "@/components/classwork/CommentThread"
import BackToClasswork from "@/components/classwork/BackToClasswork"
import AttachmentList from "@/components/classwork/AttachmentList"
import StudentWorkPanel from "@/pages/teacher/class/classwork/StudentWorkPanel"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  formatDueDate,
  getUrgency,
  isPastDue,
} from "@/lib/classworkHelpers"

import { getSubmissionsForClasswork as getQuizSubmissionsForClasswork } from "@/lib/quizSubmissionStorage"
import { getSubmissionsForClasswork as getWorkSubmissionsForClasswork } from "@/lib/submissionStorage"
import { getClassComments, saveClassComment } from "@/lib/commentStorage"

function ClassworkDetail({ item, classData, teacher, onBack, onDelete, onEdit }) {
  const [showStudentWork, setShowStudentWork] = useState(false)
  const [comments, setComments] = useState(() => getClassComments(item.id))

  const urgency = getUrgency(item, Date.now())

  const isQuiz = item.type === "Quiz"
  const isMaterial = item.type === "Material"
  const canTurnIn = item.type === "Assignment" || item.type === "Activity"

  const submissions = isQuiz
    ? getQuizSubmissionsForClasswork(item.id)
    : canTurnIn
    ? getWorkSubmissionsForClasswork(item.id)
    : []

  const assigned = classData.studentCount || 0

  const turnedIn = submissions.length

  const missing = isPastDue(item)
    ? Math.max(assigned - turnedIn, 0)
    : 0

  const averageScore =
    submissions.length > 0
      ? Math.round(
          (submissions.reduce(
            (sum, submission) =>
              sum +
              submission.earnedPoints / (submission.totalPoints || 1),
            0
          ) /
            submissions.length) *
            100
        )
      : null

  function handlePostComment(text) {
    saveClassComment({
      classworkId: item.id,
      authorId: teacher?.id,
      authorName: item.teacherName,
      authorRole: "Teacher",
      text,
    })

    setComments(getClassComments(item.id))
  }

  return (
    <div className="mt-6">
      <BackToClasswork onBack={onBack} />

      <div
        className={`grid w-full items-start gap-8 ${
          isMaterial ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px]"
        }`}
      >
        <section className="min-w-0">
          <div className="border-b border-gray-200 pb-7">
            <div className="flex items-start gap-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${urgency.icon}`}
              >
                <ClassworkTypeIcon type={item.type} className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    {urgency.label && (
                      <span
                        className={`mb-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${urgency.badge}`}
                      >
                        {urgency.label}
                      </span>
                    )}

                    <h1 className="break-words text-3xl font-normal tracking-tight text-gray-900">
                      {item.title}
                    </h1>

                    <p className="mt-3 text-sm text-gray-600">
                      {item.teacherName}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100"
                      >
                        ⋮
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => onDelete(item.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {!isMaterial && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                    <span>{item.points || 0} points</span>

                    <span className="text-gray-300">&bull;</span>

                    <span>Due {formatDueDate(item)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 py-7">
            <h2 className="mb-4 text-sm font-medium text-gray-900">
              {isMaterial ? "Description" : "Instructions"}
            </h2>

            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
              {item.instructions ||
                (isMaterial
                  ? "No description provided."
                  : "No instructions provided.")}
            </p>
          </div>

          {isQuiz && (
            <div className="border-b border-gray-200 py-7">
              <h2 className="mb-5 text-sm font-medium text-gray-900">
                Questions
              </h2>

              <div className="space-y-4">
                {item.questions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="rounded-lg border border-gray-200 bg-gray-50/60 p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {questionIndex + 1}. {question.text}
                      <span className="ml-2 font-normal text-gray-400">
                        ({question.points} {question.points === 1 ? "pt" : "pts"})
                      </span>
                    </p>

                    <div className="mt-3 space-y-1.5">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                            optionIndex === question.correctIndex
                              ? "bg-emerald-50 font-medium text-emerald-700"
                              : "text-gray-600"
                          }`}
                        >
                          {optionIndex === question.correctIndex ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="h-4 w-4 shrink-0" />
                          )}

                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-b border-gray-200 py-7">
            <h2 className="mb-5 text-sm font-medium text-gray-900">
              Attachments
            </h2>

            <AttachmentList attachments={item.attachments} />
          </div>

          <div className="pt-7">
            <div className="mb-5 flex items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.7 8.7 0 0 1-4-.9L3 21l1.9-4.2A8.4 8.4 0 0 1 3 11.5a8.5 8.5 0 0 1 18 0z" />
              </svg>

              <h2 className="text-sm font-medium text-gray-900">
                Class comments
              </h2>
            </div>

            <CommentThread
              comments={comments}
              onPost={handlePostComment}
              placeholder="Comment for the whole class..."
            />
          </div>
        </section>

        {!isMaterial && (
          <aside className="min-w-0">
            <div className="w-full rounded-xl bg-[#E8EEF7] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {isQuiz ? "Responses" : "Student work"}
                </h2>
              </div>

              <div className="mt-6 border-b border-gray-300 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Assigned</span>

                  <span className="text-sm text-gray-900">{assigned}</span>
                </div>
              </div>

              <div className="border-b border-gray-300 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {isQuiz ? "Submitted" : "Turned in"}
                  </span>

                  <span className="text-sm text-gray-900">{turnedIn}</span>
                </div>
              </div>

              {isQuiz ? (
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      Average score
                    </span>

                    <span className="text-sm text-gray-900">
                      {averageScore === null ? "—" : `${averageScore}%`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Missing</span>

                    <span className="text-sm text-red-600">{missing}</span>
                  </div>
                </div>
              )}

              {canTurnIn && (
                <button
                  type="button"
                  onClick={() => setShowStudentWork(true)}
                  className="w-full rounded-full border border-gray-500 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-white/60"
                >
                  View student work
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {showStudentWork && (
        <ClassworkPanel
          eyebrow={item.type}
          title="Student work"
          description={item.title}
          onClose={() => setShowStudentWork(false)}
        >
          <StudentWorkPanel item={item} classData={classData} teacher={teacher} />
        </ClassworkPanel>
      )}
    </div>
  )
}

export default ClassworkDetail
