import { useEffect, useMemo, useState } from "react"
import { UploadIcon } from "lucide-react"

import TeacherLayout from "@/components/TeacherLayout"
import ClassworkPanel from "@/components/classwork/ClassworkPanel"
import GradeSheet from "@/pages/teacher/grades/GradeSheet"
import GradingScheme from "@/pages/teacher/grades/GradingScheme"

import { Button } from "@/components/ui/button"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForTeacher, updateClass } from "@/lib/classStorage"
import { getClassworkForClass } from "@/lib/classWorkStorage"

import {
  getGradeItemsForClass,
  saveGradeItem,
  deleteGradeItem,
} from "@/lib/gradeItemsStorage"

import {
  getGradesForClass,
  findGrade,
  saveGrade,
} from "@/lib/gradesStorage"

import {
  DEFAULT_WEIGHTS,
  getGradeWeights,
  saveGradeWeights,
  getAllBreakdownLabels,
} from "@/lib/gradeWeightsStorage"

import { buildGradeColumns, getCellValue, getCourseGrade, getStudentItemTotal } from "@/lib/courseGrade"
import { downloadCsv } from "@/lib/csvExport"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/confirm-dialog"

function AddGradeItemForm({ onCreate, onCancel, categoryOptions, initialCategory }) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState(
    initialCategory || categoryOptions[0] || ""
  )
  const [points, setPoints] = useState("100")

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim() || !category.trim()) {
      return
    }

    onCreate({
      title: title.trim(),
      category: category.trim(),
      points: Number(points) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Item Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Seatwork 3"
          autoFocus
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Category
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <p className="mt-1.5 text-xs text-gray-400">
          For work done face-to-face that wasn't posted in Classwork. Counts toward this category in the grading scheme.
        </p>
      </div>

      <div className="max-w-xs">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Points
        </label>

        <input
          type="number"
          min="0"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex justify-end gap-3 border-t pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!title.trim() || !category.trim()}
          className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Item
        </button>
      </div>
    </form>
  )
}

function Grades() {
  const toast = useToast()
  const confirm = useConfirm()

  const [classes, setClasses] = useState([])
  const [selectedClassId, setSelectedClassId] = useState(null)
  const [classworkItems, setClassworkItems] = useState([])
  const [manualItems, setManualItems] = useState([])
  const [grades, setGrades] = useState([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [showGradingScheme, setShowGradingScheme] = useState(false)
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS)

  useEffect(() => {
    const account = getCurrentAccount()

    if (!account) {
      return
    }

    const teacherClasses = getClassesForTeacher(account.id)

    setClasses(teacherClasses)

    if (teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id)
    }
  }, [])

  useEffect(() => {
    if (!selectedClassId) {
      return
    }

    const gradable = getClassworkForClass(selectedClassId).filter(
      (item) => item.type !== "Material"
    )

    setClassworkItems(gradable)
    setManualItems(getGradeItemsForClass(selectedClassId))
    setGrades(getGradesForClass(selectedClassId))
    setWeights(getGradeWeights(selectedClassId))
  }, [selectedClassId])

  function handleSaveWeights(nextWeights) {
    setWeights(nextWeights)
    saveGradeWeights(selectedClassId, nextWeights)
    setShowGradingScheme(false)
    toast.success("Grading scheme saved!")
  }

  function applyPublishState(nextValue) {
    updateClass(selectedClassId, { gradesPublished: nextValue })

    setClasses((current) =>
      current.map((classItem) =>
        classItem.id === selectedClassId
          ? { ...classItem, gradesPublished: nextValue }
          : classItem
      )
    )
  }

  async function handlePublish() {
    const confirmed = await confirm({
      title: "Publish grades to students?",
      description: `Everyone in ${selectedClass?.className} will be able to see their Class Standing, Examination, and Course Grade right away.`,
      confirmLabel: "Publish",
    })

    if (!confirmed) {
      return
    }

    applyPublishState(true)
    toast.success("Grades published. Students can now see them.")
  }

  async function handleUnpublish() {
    const confirmed = await confirm({
      title: "Unpublish these grades?",
      description: "Students won't be able to see their grades for this class until you publish again.",
      confirmLabel: "Unpublish",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    applyPublishState(false)
    toast.success("Grades are hidden from students again.")
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId)
  const students = selectedClass?.students || []
  const gradesPublished = Boolean(selectedClass?.gradesPublished)

  const columns = useMemo(
    () => buildGradeColumns(classworkItems, manualItems),
    [classworkItems, manualItems]
  )

  function handleCellChange(column, studentId, value) {
    setGrades((current) => {
      const existingIndex = current.findIndex(
        (g) => g.itemId === column.id && g.studentId === studentId
      )

      if (existingIndex >= 0) {
        const updated = [...current]
        updated[existingIndex] = { ...updated[existingIndex], score: value }
        return updated
      }

      return [
        ...current,
        {
          id: `LOCAL-${column.id}-${studentId}`,
          classId: selectedClassId,
          itemId: column.id,
          studentId,
          score: value,
        },
      ]
    })
  }

  function handleCellBlur(column, studentId) {
    const entry = findGrade(grades, column.id, studentId)

    saveGrade({
      classId: selectedClassId,
      itemId: column.id,
      studentId,
      score: entry ? entry.score : "",
    })
  }

  function handleCreateItem(itemData) {
    saveGradeItem({ classId: selectedClassId, ...itemData })

    setManualItems(getGradeItemsForClass(selectedClassId))

    setShowAddItem(false)
  }

  async function handleDeleteItem(itemId) {
    const item = manualItems.find((entry) => entry.id === itemId)

    const confirmed = await confirm({
      title: "Delete this grade item?",
      description: `"${item?.title || "This item"}" and any scores recorded for it will be permanently removed.`,
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteGradeItem(itemId)

    setManualItems(getGradeItemsForClass(selectedClassId))

    toast.success("Grade item deleted.")
  }

  function handleExportCsv() {
    const header = [
      "Student",
      "Student ID",
      ...columns.map((column) => `${column.title} (${column.points} pts)`),
      "Total (%)",
      "Course Grade (%)",
    ]

    const rows = students.map((student) => {
      const itemScores = columns.map(
        (column) => getCellValue(column, student.id, grades).value
      )

      const total = getStudentItemTotal(columns, student.id, grades)
      const { courseGrade } = getCourseGrade(student.id, columns, grades, weights)

      return [
        student.name,
        student.id,
        ...itemScores,
        total === null ? "" : total,
        courseGrade === null ? "" : Math.round(courseGrade),
      ]
    })

    downloadCsv(
      `${selectedClass.className}-grades.csv`,
      [header, ...rows]
    )
  }

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-6 flex items-start gap-3">
          <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
              Teacher Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
              Grades
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Assignments, activities, and quizzes grade automatically here. Add face-to-face work manually.
            </p>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              You don't have any classes yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create a class first to start a gradebook.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
              {classes.map((classItem) => (
                <button
                  key={classItem.id}
                  type="button"
                  onClick={() => setSelectedClassId(classItem.id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    selectedClassId === classItem.id
                      ? "bg-blue-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {classItem.className}
                  <span className="ml-1.5 font-normal opacity-70">
                    {classItem.section}
                  </span>
                </button>
              ))}
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {students.length} {students.length === 1 ? "student" : "students"} &bull; {columns.length}{" "}
                {columns.length === 1 ? "item" : "items"}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowGradingScheme(true)}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 6h16M4 12h10M4 18h6" />
                  </svg>
                  Grading Scheme
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                    <span className="text-blue-800">{weights.classStandingWeight}%</span>
                    {" / "}
                    <span className="text-red-700">{weights.examinationWeight}%</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddItem(true)}
                  className="whitespace-nowrap rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800 transition hover:bg-blue-100"
                >
                  + Add manual item
                </button>

                {gradesPublished ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUnpublish}
                    className="whitespace-nowrap"
                  >
                    Unpublish grades
                  </Button>
                ) : (
                  <span
                    title={
                      students.length === 0
                        ? "Add students to this class before publishing grades."
                        : undefined
                    }
                  >
                    <Button
                      type="button"
                      onClick={handlePublish}
                      disabled={students.length === 0}
                      className="whitespace-nowrap bg-blue-900 hover:bg-blue-800"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Publish grades
                    </Button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={students.length === 0}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                <p className="text-sm font-semibold text-gray-800">
                  No students enrolled in this class yet
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Share the class code so students can join, then come back here.
                </p>
              </div>
            ) : (
              <GradeSheet
                columns={columns}
                students={students}
                grades={grades}
                onCellChange={handleCellChange}
                onCellBlur={handleCellBlur}
                onDeleteItem={handleDeleteItem}
              />
            )}
          </>
        )}
      </div>

      {showAddItem && (
        <ClassworkPanel
          eyebrow="Grades"
          title="Add manual item"
          description="Grade face-to-face work without posting it to Classwork."
          onClose={() => setShowAddItem(false)}
        >
          <AddGradeItemForm
            onCreate={handleCreateItem}
            onCancel={() => setShowAddItem(false)}
            categoryOptions={getAllBreakdownLabels(weights)}
          />
        </ClassworkPanel>
      )}

      {showGradingScheme && (
        <ClassworkPanel
          eyebrow="Grades"
          title="Grading Scheme"
          description="Adjust the weights, then save to apply them to this class."
          onClose={() => setShowGradingScheme(false)}
          wide
        >
          <GradingScheme
            weights={weights}
            onSave={handleSaveWeights}
            onCancel={() => setShowGradingScheme(false)}
          />
        </ClassworkPanel>
      )}
    </TeacherLayout>
  )
}

export default Grades
