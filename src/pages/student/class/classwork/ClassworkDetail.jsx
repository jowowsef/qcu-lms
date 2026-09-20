import { useState } from "react"

import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"
import CommentThread from "@/components/classwork/CommentThread"
import BackToClasswork from "@/components/classwork/BackToClasswork"
import AttachmentList from "@/components/classwork/AttachmentList"

import {
  formatDueDate,
  getUrgency,
} from "@/lib/classworkHelpers"

import {
  getClassComments,
  saveClassComment,
  getPrivateComments,
  savePrivateComment,
} from "@/lib/commentStorage"

import QuizTaker from "@/pages/student/class/classwork/QuizTaker"
import TurnIn from "@/pages/student/class/classwork/TurnIn"

function ClassworkDetail({ item, student, onBack }) {
  const [comments, setComments] = useState(() => getClassComments(item.id))
  const [privateComments, setPrivateComments] = useState(() =>
    getPrivateComments(item.id, student?.id)
  )
  const [showPrivateComments, setShowPrivateComments] = useState(false)

  const urgency = getUrgency(item, Date.now())

  const isQuiz = item.type === "Quiz"
  const isMaterial = item.type === "Material"
  const canTurnIn = item.type === "Assignment" || item.type === "Activity"

  function handlePostClassComment(text) {
    saveClassComment({
      classworkId: item.id,
      authorId: student?.id,
      authorName: student?.name,
      authorRole: "Student",
      text,
    })

    setComments(getClassComments(item.id))
  }

  function handlePostPrivateComment(text) {
    savePrivateComment({
      classworkId: item.id,
      studentId: student?.id,
      authorId: student?.id,
      authorName: student?.name,
      authorRole: "Student",
      text,
    })

    setPrivateComments(getPrivateComments(item.id, student?.id))
  }

  if (isQuiz) {
    return (
      <div className="mt-6 max-w-3xl">
        <BackToClasswork onBack={onBack} />

        <div className="border-b border-gray-200 pb-7">
          <div className="flex items-start gap-5">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${urgency.icon}`}
            >
              <ClassworkTypeIcon type={item.type} className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
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

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                <span>{item.points || 0} points</span>

                <span className="text-gray-300">&bull;</span>

                <span>Due {formatDueDate(item)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 py-7">
          <QuizTaker item={item} student={student} />
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
            onPost={handlePostClassComment}
            placeholder="Comment for the whole class..."
          />
        </div>
      </div>
    )
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
              onPost={handlePostClassComment}
              placeholder="Comment for the whole class..."
            />
          </div>
        </section>

        {!isMaterial && (
          <aside className="min-w-0">
            {canTurnIn && (
              <div className="w-full rounded-xl bg-[#E8EEF7] p-6">
                <h2 className="mb-5 text-lg font-medium text-gray-900">
                  Turn in
                </h2>

                <TurnIn
                  item={item}
                  classId={item.classId}
                  student={student}
                />
              </div>
            )}

            <div
              className={`w-full rounded-xl bg-[#E8EEF7] p-6 ${
                canTurnIn ? "mt-5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>

                <h2 className="text-sm font-medium text-gray-900">
                  Private comments
                </h2>
              </div>

              {showPrivateComments ? (
                <div className="mt-5">
                  <CommentThread
                    comments={privateComments}
                    onPost={handlePostPrivateComment}
                    placeholder="Message your teacher privately..."
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPrivateComments(true)}
                  className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-700 hover:text-blue-900"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                  </svg>

                  {privateComments.length > 0
                    ? "View private comments"
                    : "Add private comment"}
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default ClassworkDetail
