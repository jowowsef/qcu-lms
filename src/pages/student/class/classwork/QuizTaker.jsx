import { useState } from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { useConfirm } from "@/components/ui/confirm-dialog"

import {
  gradeQuiz,
  getSubmissionForStudent,
  saveQuizSubmission,
} from "@/lib/quizSubmissionStorage"

function QuizTaker({ item, student }) {
  const confirm = useConfirm()

  const [submission, setSubmission] = useState(() =>
    getSubmissionForStudent(item.id, student.id)
  )

  const [answers, setAnswers] = useState({})

  const allAnswered = item.questions.every(
    (question) => answers[question.id] !== undefined
  )

  function handleSelect(questionId, optionIndex) {
    setAnswers((current) => ({
      ...current,
      [questionId]: optionIndex,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!allAnswered) {
      return
    }

    const confirmed = await confirm({
      title: "Submit this quiz?",
      description: "You won't be able to change your answers after submitting.",
      confirmLabel: "Submit",
    })

    if (!confirmed) {
      return
    }

    const { results, earnedPoints, totalPoints } = gradeQuiz(
      item.questions,
      answers
    )

    const newSubmission = saveQuizSubmission({
      classworkId: item.id,
      classId: item.classId,
      studentId: student.id,
      studentName: student.name,
      results,
      earnedPoints,
      totalPoints,
    })

    setSubmission(newSubmission)
  }

  if (submission) {
    const percent = Math.round(
      (submission.earnedPoints /
        (submission.totalPoints || 1)) *
        100
    )

    return (
      <div>
        <div className="mb-6 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Your score
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-950">
              {submission.earnedPoints} / {submission.totalPoints}{" "}
              <span className="text-base font-medium text-blue-700">
                ({percent}%)
              </span>
            </p>
          </div>

          <Badge className="bg-blue-900 px-3 py-1 text-xs text-white">
            Submitted
          </Badge>
        </div>

        <div className="space-y-4">
          {item.questions.map((question, questionIndex) => {
            const result = submission.results.find(
              (item) => item.questionId === question.id
            )

            return (
              <div
                key={question.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="text-sm font-semibold text-gray-900">
                  {questionIndex + 1}. {question.text}{" "}
                  <span className="font-normal text-gray-400">
                    ({question.points} {question.points === 1 ? "pt" : "pts"})
                  </span>
                </p>

                <div className="mt-3 space-y-1.5">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = optionIndex === question.correctIndex
                    const isSelected = optionIndex === result?.selectedIndex

                    let rowClass = "text-gray-600"

                    if (isCorrect) {
                      rowClass = "bg-emerald-50 font-medium text-emerald-700"
                    } else if (isSelected && !isCorrect) {
                      rowClass = "bg-red-50 font-medium text-red-700"
                    }

                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${rowClass}`}
                      >
                        {isCorrect && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}

                        {isSelected && !isCorrect && (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        )}

                        {!isCorrect && !isSelected && (
                          <span className="h-4 w-4 shrink-0" />
                        )}

                        {option}

                        {isSelected && (
                          <span className="ml-auto text-xs font-normal text-gray-400">
                            Your answer
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {item.instructions && (
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
          {item.instructions}
        </p>
      )}

      {item.questions.map((question, questionIndex) => (
        <div
          key={question.id}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <p className="text-sm font-semibold text-gray-900">
            {questionIndex + 1}. {question.text}{" "}
            <span className="font-normal text-gray-400">
              ({question.points} {question.points === 1 ? "pt" : "pts"})
            </span>
          </p>

          <RadioGroup
            value={
              answers[question.id] === undefined
                ? undefined
                : String(answers[question.id])
            }
            onValueChange={(value) =>
              handleSelect(question.id, Number(value))
            }
            className="mt-3 gap-2"
          >
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <RadioGroupItem
                  value={String(optionIndex)}
                  className="border-gray-400 data-checked:border-blue-600 data-checked:bg-blue-600"
                />

                {option}
              </label>
            ))}
          </RadioGroup>
        </div>
      ))}

      <div className="flex items-center justify-between border-t pt-5">
        <p className="text-xs text-gray-400">
          {allAnswered
            ? "All questions answered."
            : `${
                item.questions.length -
                Object.keys(answers).length
              } question(s) left to answer.`}
        </p>

        <button
          type="submit"
          disabled={!allAnswered}
          className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Quiz
        </button>
      </div>
    </form>
  )
}

export default QuizTaker
