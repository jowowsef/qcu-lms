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

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Card } from "@/components/ui/card"

import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForTeacher } from "@/lib/classStorage"
import { getClassworkForClasses } from "@/lib/classWorkStorage"

import {
  formatDueDate,
  getUrgency,
} from "@/lib/classworkHelpers"

const TYPE_FILTERS = [
  { type: "All", label: "All types" },
  { type: "Assignment", label: "Assignments" },
  { type: "Activity", label: "Activities" },
]

function Assignments() {
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [items, setItems] = useState([])
  const [sectionFilter, setSectionFilter] = useState("All")
  const [typeFilter, setTypeFilter] = useState("All")
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
      (item) => item.type === "Assignment" || item.type === "Activity"
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
      .filter(
        (item) => typeFilter === "All" || item.type === typeFilter
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [items, sectionFilter, typeFilter])

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
                Assignments
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Every assignment and activity across your classes.
              </p>
            </div>
          </div>

          {classes.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
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

              <Tabs value={typeFilter} onValueChange={setTypeFilter}>
                <TabsList className="h-10 gap-1 rounded-lg border bg-gray-50 p-1">
                  {TYPE_FILTERS.map((filter) => (
                    <TabsTrigger
                      key={filter.type}
                      value={filter.type}
                      className="h-8 px-3 text-xs font-semibold text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                    >
                      {filter.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              You don't have any classes yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Create a class first, then post an assignment from its Classwork tab.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              {items.length === 0
                ? "No assignments posted yet"
                : "Nothing matches this filter"}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              {items.length === 0
                ? "Post an assignment or activity from a class's Classwork tab."
                : "Try a different section or type."}
            </p>
          </div>
        ) : (
          <Card className="overflow-hidden py-0 ring-1 ring-gray-200">
            <Table className="text-base">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Title</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Class</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Points</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-sm">Due</TableHead>
                  <TableHead className="h-[3.25rem] px-6 text-right text-sm">Posted</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredItems.map((item) => {
                  const urgency = getUrgency(item, now)
                  const classItem = classById[item.classId]

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
                              type={item.type}
                              className="h-5 w-5"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                              {item.type}
                            </p>
                            <p className="truncate text-base font-semibold text-gray-900">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm text-gray-600">
                        {classItem
                          ? `${classItem.className} • ${classItem.section}`
                          : "—"}
                      </TableCell>

                      <TableCell className="px-6 py-[1.125rem] text-sm font-medium text-gray-700">
                        {item.points || 0}
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

                      <TableCell className="px-6 py-[1.125rem] text-right text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
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

export default Assignments
