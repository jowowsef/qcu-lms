import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import StudentLayout from "@/components/StudentLayout"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForStudent } from "@/lib/classStorage"
import { getClassworkForClass } from "@/lib/classWorkStorage"
import { getGradeItemsForClass } from "@/lib/gradeItemsStorage"
import { getGradesForClass } from "@/lib/gradesStorage"
import { getGradeWeights } from "@/lib/gradeWeightsStorage"
import { buildGradeColumns, getCourseGrade } from "@/lib/courseGrade"

function formatPercent(value) {
  return value === null ? "—" : `${Math.round(value)}%`
}

function Grades() {
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [hasClasses, setHasClasses] = useState(true)

  useEffect(() => {
    const account = getCurrentAccount()

    if (!account) {
      return
    }

    const classes = getClassesForStudent(account.id)

    setHasClasses(classes.length > 0)

    const computed = classes.map((classItem) => {
      const classworkItems = getClassworkForClass(classItem.id).filter(
        (item) => item.type !== "Material"
      )

      const manualItems = getGradeItemsForClass(classItem.id)
      const grades = getGradesForClass(classItem.id)
      const weights = getGradeWeights(classItem.id)
      const columns = buildGradeColumns(classworkItems, manualItems)

      return {
        classItem,
        ...getCourseGrade(account.id, columns, grades, weights),
      }
    })

    setRows(computed)
  }, [])

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-7 flex items-start gap-3">
          <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
              Grades
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Your course grade in each class, updated as work is graded.
            </p>
          </div>
        </div>

        {!hasClasses ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-semibold text-gray-800">
              You haven't joined any classes yet
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Join a class with its code to see your grades here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/student/classes")}
              className="mt-5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
            >
              Go to My Classes
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-blue-900">Class Standing</TableHead>
                  <TableHead className="text-red-800">Examination</TableHead>
                  <TableHead className="text-right">Course Grade</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.classItem.id}
                    onClick={() =>
                      navigate(`/student/classes/${row.classItem.id}`, {
                        state: { tab: "Classwork" },
                      })
                    }
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {row.classItem.className}
                      </p>
                      <p className="text-xs text-gray-400">
                        {row.classItem.subject} &bull; {row.classItem.section}
                      </p>
                    </TableCell>

                    <TableCell className="text-blue-900">
                      {formatPercent(row.classStanding)}
                    </TableCell>

                    <TableCell className="text-red-800">
                      {formatPercent(row.examination)}
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={`rounded-full px-2.5 py-1 text-sm font-bold ${
                          row.courseGrade === null
                            ? "text-gray-400"
                            : "bg-blue-50 text-blue-900"
                        }`}
                      >
                        {formatPercent(row.courseGrade)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}

export default Grades
