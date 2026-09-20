import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import TeacherLayout from "@/components/TeacherLayout"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Card } from "@/components/ui/card"

import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForTeacher } from "@/lib/classStorage"
import { getClassworkForClasses } from "@/lib/classWorkStorage"
import { getSubmissionsForClasswork } from "@/lib/quizSubmissionStorage"

import {
  formatDueDate,
  getUrgency,
} from "@/lib/classworkHelpers"

function Quizzes() {
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [items, setItems] = useState([])
  const [sectionFilter, setSectionFilter] = useState("All")
  const [now] = useState(() => Date.now())

  useEffect(() => {
    const account = getCurrentAccount()

    if (!account) {
      return
    }

    const teacherClasses = getClassesForTeacher(account.id)

    setClasses(teacherClasses)

    const classIds = teacherClasses.map((c) => c.id)

    const classwork = getClassworkForClasses(classIds).filter(
      (item) => item.type === "Quiz"
    )

    setItems(classwork)
  }, [])

  const classById = useMemo(() => {
    const map = {}

    classes.forEach((classItem) => {
      map[classItem.id] = classItem
    })

    return map
  }, [classes])

  const filteredItems = useMemo(() => {
    return items
      .filter(
        (item) =>
          sectionFilter === "All" || item.classId === sectionFilter
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [items, sectionFilter])

  function handleOpenItem(item) {
    navigate(`/teacher/classes/${item.classId}`, {
      state: { tab: "Classwork", classworkId: item.id },
    })
  }

  return (
    <TeacherLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                Quizzes
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Every quiz across your classes, with live response stats.
              </p>
            </div>
          </div>

          {classes.length > 0 && (
            <Select value={sectionFilter} onValueChange={setSectionFilter}>
              <SelectTrigger className="h-10 w-56">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="All">All sections</SelectItem>

                {classes.map((classItem) => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.className} &bull; {classItem.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              You don't have any classes yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create a class first, then build a quiz from its Classwork tab.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              {items.length === 0
                ? "No quizzes posted yet"
                : "No quizzes in this section"}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {items.length === 0
                ? "Build a quiz from a class's Classwork tab."
                : "Try a different section."}
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden py-0 ring-1 ring-gray-200">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Title</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Class</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Questions</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Responses</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Avg. score</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Due</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredItems.map((item) => {
                  const urgency = getUrgency(item, now)
                  const classItem = classById[item.classId]
                  const submissions = getSubmissionsForClasswork(item.id)

                  const assigned = classItem?.studentCount || 0

                  const avgScore =
                    submissions.length > 0
                      ? Math.round(
                          (submissions.reduce(
                            (sum, s) =>
                              sum + s.earnedPoints / (s.totalPoints || 1),
                            0
                          ) /
                            submissions.length) *
                            100
                        )
                      : null

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => handleOpenItem(item)}
                      className="cursor-pointer"
                    >
                      <TableCell className="whitespace-normal px-6 py-[1.125rem]">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${urgency.icon}`}
                          >
                            <ClassworkTypeIcon
                              type="Quiz"
                              className="h-5 w-5"
                            />
                          </div>

                          <p className="truncate text-base font-semibold text-gray-900">
                            {item.title}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm text-gray-600">
                        {classItem
                          ? `${classItem.className} • ${classItem.section}`
                          : "—"}
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm text-gray-600">
                        {item.questions?.length || 0}
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm text-gray-600">
                        {submissions.length}
                        {assigned > 0 && (
                          <span className="text-gray-400">
                            {" "}
                            / {assigned}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm font-medium text-gray-700">
                        {avgScore === null ? "—" : `${avgScore}%`}
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem]">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {formatDueDate(item)}
                          </span>

                          {urgency.label && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${urgency.badge}`}
                            >
                              {urgency.label}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </TeacherLayout>
  )
}

export default Quizzes
