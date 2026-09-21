import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpenIcon, ChevronRightIcon } from "lucide-react"

import StudentLayout from "@/components/StudentLayout"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForStudent } from "@/lib/classStorage"
import { getClassworkForClass } from "@/lib/classWorkStorage"
import { Button } from "@/components/ui/button"
import { DEFAULT_CLASS_COLOR } from "@/lib/classColors"

const VISIBLE_CLASS_COUNT = 6

function StudentDashboard() {
  const navigate = useNavigate()

  const [student, setStudent] = useState(null)
  const [classes, setClasses] = useState([])
  const [dueSoonCount, setDueSoonCount] = useState(0)

  useEffect(() => {
    const currentAccount = getCurrentAccount()

    if (!currentAccount) {
      return
    }

    setStudent(currentAccount)

    const studentClasses = getClassesForStudent(
      currentAccount.id
    )

    setClasses(studentClasses)

    const now = Date.now()

    const dueSoon = studentClasses
      .flatMap((classItem) =>
        getClassworkForClass(classItem.id)
      )
      .filter((item) => {
        if (!item.dueDate) {
          return false
        }

        const due = new Date(
          `${item.dueDate}T${item.dueTime || "23:59"}`
        ).getTime()

        return due >= now && due - now <= 7 * 24 * 60 * 60 * 1000
      })

    setDueSoonCount(dueSoon.length)
  }, [])

  return (
    <StudentLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">

        {/* Page Header */}

        <div className="mb-7">

          <div className="flex items-start gap-3">

            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Student Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Welcome back{student?.name ? `, ${student.name}` : ""}.
              </p>

            </div>

          </div>

        </div>


        {/* Statistics */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              My Classes
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              {classes.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Classes you're currently enrolled in
            </p>

          </div>


          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Due This Week
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              {dueSoonCount}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Classwork due in the next 7 days
            </p>

          </div>

        </div>


        {/* Classes */}

        <div className="mt-7 overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="flex items-center justify-between gap-3 border-b bg-gray-50 px-6 py-4">

            <div>
              <h2 className="text-sm font-semibold text-gray-950">
                My Classes
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Classes you've joined.
              </p>
            </div>

            {classes.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigate("/student/classes")}
                className="shrink-0 text-blue-900 hover:bg-blue-100/60 hover:text-blue-900"
              >
                View all
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            )}

          </div>


          {classes.length === 0 ? (

            <div className="flex flex-col items-center px-6 py-14 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <BookOpenIcon className="h-7 w-7" />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-800">
                No classes yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Join a class using its code from My Classes.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">

              {classes.slice(0, VISIBLE_CLASS_COUNT).map((classItem) => (

                <button
                  key={classItem.id}
                  type="button"
                  onClick={() =>
                    navigate(`/student/classes/${classItem.id}`)
                  }
                  className="group flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/60 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
                >

                  <span
                    className="mt-0.5 h-9 w-1 shrink-0 rounded-full"
                    style={{
                      backgroundColor: classItem.color || DEFAULT_CLASS_COLOR,
                    }}
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="truncate text-sm font-semibold text-gray-900">
                      {classItem.className}
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {classItem.subject} • {classItem.section}
                    </p>

                    <div className="mt-3">
                      <p className="text-[11px] text-gray-400">
                        Teacher
                      </p>

                      <p className="mt-0.5 truncate text-xs font-semibold text-blue-900">
                        {classItem.teacherName}
                      </p>
                    </div>

                  </div>

                </button>

              ))}

            </div>

          )}

        </div>

      </div>

    </StudentLayout>
  )
}

export default StudentDashboard
