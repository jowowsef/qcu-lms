import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import StudentLayout from "@/components/StudentLayout"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForStudent } from "@/lib/classStorage"
import { getClassworkForClass } from "@/lib/classWorkStorage"


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

          <div className="border-b bg-gray-50 px-6 py-4">

            <h2 className="text-sm font-semibold text-gray-950">
              My Classes
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Classes you've joined.
            </p>

          </div>


          {classes.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-gray-700">
                No classes yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Join a class using its code from My Classes.
              </p>

            </div>

          ) : (

            <div className="divide-y">

              {classes.map((classItem) => (

                <button
                  key={classItem.id}
                  type="button"
                  onClick={() =>
                    navigate(`/student/classes/${classItem.id}`)
                  }
                  className="flex w-full items-center justify-between px-6 py-5 text-left transition hover:bg-blue-50/50"
                >

                  <div>

                    <h3 className="text-sm font-semibold text-gray-900">
                      {classItem.className}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {classItem.subject} • {classItem.section}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs font-medium text-gray-500">
                      Teacher
                    </p>

                    <p className="mt-1 text-sm font-semibold text-blue-900">
                      {classItem.teacherName}
                    </p>

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
