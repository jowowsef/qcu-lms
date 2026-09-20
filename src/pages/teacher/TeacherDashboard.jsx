import { useEffect, useState } from "react"

import TeacherLayout from "@/components/TeacherLayout"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getClassesForTeacher } from "@/lib/classStorage"
import { copyToClipboard } from "@/lib/clipboard"
import { useToast } from "@/components/ui/toast"


function TeacherDashboard() {
  const toast = useToast()

  const [teacher, setTeacher] = useState(null)
  const [classes, setClasses] = useState([])

  async function handleCopyCode(code) {
    const success = await copyToClipboard(code)

    if (success) {
      toast.success("Class code copied!")
    } else {
      toast.error("Couldn't copy the class code.")
    }
  }

  useEffect(() => {
    const currentAccount =
      getCurrentAccount()

    if (!currentAccount) {
      return
    }

    setTeacher(currentAccount)

    const teacherClasses =
      getClassesForTeacher(
        currentAccount.id
      )

    setClasses(teacherClasses)
  }, [])

  return (
    <TeacherLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">

        {/* Page Header */}

        <div className="mb-7">

          <div className="flex items-start gap-3">

            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Welcome back{teacher?.name ? `, ${teacher.name}` : ""}.
              </p>

            </div>

          </div>

        </div>


        {/* Statistics */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Classes */}

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              My Classes
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              {classes.length}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Classes you currently manage
            </p>

          </div>


          {/* Assignments */}

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              0
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Assignments across your classes
            </p>

          </div>


          {/* Quizzes */}

          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Quizzes
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-950">
              0
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Quizzes across your classes
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
              Your recently created classes.
            </p>

          </div>


          {classes.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <p className="text-sm font-medium text-gray-700">
                No classes yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Create your first class from My Classes.
              </p>

            </div>

          ) : (

            <div className="divide-y">

              {classes.map((classItem) => (

                <div
                  key={classItem.id}
                  className="flex items-center justify-between px-6 py-5"
                >

                  <div>

                    <h3 className="text-sm font-semibold text-gray-900">
                      {classItem.className}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {classItem.subject} • {classItem.section}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyCode(classItem.classCode)}
                    title="Tap to copy"
                    className="rounded-md px-2 py-1 text-right transition hover:bg-blue-50"
                  >

                    <p className="text-xs font-medium text-gray-500">
                      Class Code
                    </p>

                    <p className="mt-1 text-sm font-bold tracking-wider text-blue-900">
                      {classItem.classCode}
                    </p>

                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </TeacherLayout>
  )
}

export default TeacherDashboard