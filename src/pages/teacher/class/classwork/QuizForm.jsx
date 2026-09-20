import { useState } from "react"

import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getQuizTotalPoints } from "@/lib/classworkHelpers"

function makeId() {
  return `Q-${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

function makeQuestion() {
  return {
    id: makeId(),
    text: "",
    points: 1,
    correctIndex: 0,
    options: [
      { id: makeId(), text: "" },
      { id: makeId(), text: "" },
    ],
  }
}

function questionsFromInitialData(initialQuestions) {
  return initialQuestions.map((question) => ({
    id: question.id,
    text: question.text,
    points: question.points,
    correctIndex: question.correctIndex,
    options: question.options.map((optionText) => ({
      id: makeId(),
      text: optionText,
    })),
  }))
}

function QuizForm({ initialData, onSubmit, onCancel, topics = [] }) {
  const isEditing = Boolean(initialData)

  const [title, setTitle] = useState(initialData?.title || "")
  const [topicId, setTopicId] = useState(initialData?.topicId || "none")
  const [description, setDescription] = useState(initialData?.instructions || "")
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "")
  const [dueTime, setDueTime] = useState(initialData?.dueTime || "")
  const [questions, setQuestions] = useState(
    initialData?.questions
      ? questionsFromInitialData(initialData.questions)
      : [makeQuestion()]
  )

  const totalPoints = getQuizTotalPoints(questions)

  const isValid =
    title.trim().length > 0 &&
    questions.every(
      (question) =>
        question.text.trim().length > 0 &&
        question.options.every(
          (option) => option.text.trim().length > 0
        )
    )

  function updateQuestion(questionId, updates) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? { ...question, ...updates }
          : question
      )
    )
  }

  function updateOption(questionId, optionId, text) {
    setQuestions((current) =>
      current.map((question) => {
        if (question.id !== questionId) {
          return question
        }

        return {
          ...question,
          options: question.options.map((option) =>
            option.id === optionId
              ? { ...option, text }
              : option
          ),
        }
      })
    )
  }

  function handleAddQuestion() {
    setQuestions((current) => [...current, makeQuestion()])
  }

  function handleRemoveQuestion(questionId) {
    setQuestions((current) =>
      current.length === 1
        ? current
        : current.filter(
            (question) => question.id !== questionId
          )
    )
  }

  function handleAddOption(questionId) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options:
                question.options.length >= 6
                  ? question.options
                  : [
                      ...question.options,
                      { id: makeId(), text: "" },
                    ],
            }
          : question
      )
    )
  }

  function handleRemoveOption(questionId, optionIndex) {
    setQuestions((current) =>
      current.map((question) => {
        if (
          question.id !== questionId ||
          question.options.length <= 2
        ) {
          return question
        }

        const options = question.options.filter(
          (_, index) => index !== optionIndex
        )

        let correctIndex = question.correctIndex

        if (optionIndex === correctIndex) {
          correctIndex = 0
        } else if (optionIndex < correctIndex) {
          correctIndex -= 1
        }

        return { ...question, options, correctIndex }
      })
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!isValid) {
      return
    }

    onSubmit({
      type: "Quiz",
      title: title.trim(),
      topicId: topicId === "none" ? null : topicId,
      instructions: description.trim(),
      dueDate,
      dueTime,
      points: totalPoints,
      questions: questions.map((question) => ({
        id: question.id,
        text: question.text.trim(),
        points: Number(question.points) || 1,
        correctIndex: question.correctIndex,
        options: question.options.map((option) =>
          option.text.trim()
        ),
      })),
    })
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quiz Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Chapter 3 Quiz"
              autoFocus
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Topic
            </label>

            <Select value={topicId} onValueChange={setTopicId}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="none">No topic</SelectItem>

                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>

            <Textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Optional instructions students see before they start..."
              rows={3}
              className="focus-visible:border-blue-500 focus-visible:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Due Date{" "}
                <span className="font-normal text-gray-400">
                  (optional)
                </span>
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Due Time
              </label>

              <input
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Questions */}

        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <div
              key={question.id}
              className="rounded-lg border border-gray-200 bg-gray-50/60 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Question {questionIndex + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(question.id)}
                  disabled={questions.length === 1}
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove question
                </button>
              </div>

              <input
                type="text"
                value={question.text}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    text: event.target.value,
                  })
                }
                placeholder="Type your question"
                className="mt-3 w-full rounded-lg border bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Mark the correct answer
                </p>

                <RadioGroup
                  value={String(question.correctIndex)}
                  onValueChange={(value) =>
                    updateQuestion(question.id, {
                      correctIndex: Number(value),
                    })
                  }
                  className="gap-2.5"
                >
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-3"
                    >
                      <RadioGroupItem
                        value={String(optionIndex)}
                        className="border-gray-400 data-checked:border-blue-600 data-checked:bg-blue-600"
                      />

                      <input
                        type="text"
                        value={option.text}
                        onChange={(event) =>
                          updateOption(
                            question.id,
                            option.id,
                            event.target.value
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveOption(
                            question.id,
                            optionIndex
                          )
                        }
                        disabled={question.options.length <= 2}
                        className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </RadioGroup>

                <button
                  type="button"
                  onClick={() => handleAddOption(question.id)}
                  disabled={question.options.length >= 6}
                  className="mt-3 text-xs font-medium text-blue-700 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  + Add option
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500">
                  Points
                </label>

                <input
                  type="number"
                  min="1"
                  value={question.points}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      points: event.target.value,
                    })
                  }
                  className="w-20 rounded-md border bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          + Add question
        </button>

        <div className="flex items-center justify-between border-t pt-5">
          <Badge className="bg-blue-50 text-blue-700 px-3 py-1 text-xs">
            Total: {totalPoints} {totalPoints === 1 ? "point" : "points"} across {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"}
          </Badge>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid}
              className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? "Save changes" : "Create Quiz"}
            </button>
          </div>
        </div>
      </form>
  )
}

export default QuizForm
