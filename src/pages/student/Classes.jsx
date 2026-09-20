import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import StudentLayout from "@/components/StudentLayout"

import { getCurrentAccount } from "@/lib/accountStorage"

import {
  getClassesForStudent,
  joinClassByCode,
} from "@/lib/classStorage"

import { DEFAULT_CLASS_COLOR } from "@/lib/classColors"
import { useToast } from "@/components/ui/toast"


function Classes() {
  const navigate = useNavigate()
  const toast = useToast()

  const [student, setStudent] = useState(null)
  const [classes, setClasses] = useState([])

  const [showJoinModal, setShowJoinModal] = useState(false)
  const [classCode, setClassCode] = useState("")
  const [joinError, setJoinError] = useState("")


  useEffect(() => {
    const currentAccount = getCurrentAccount()

    if (!currentAccount) {
      navigate("/")
      return
    }

    setStudent(currentAccount)

    setClasses(
      getClassesForStudent(currentAccount.id)
    )
  }, [navigate])


  useEffect(() => {
    if (!showJoinModal) {
      return
    }

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        handleCloseJoinModal()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showJoinModal])


  function handleJoinClass(e) {
    e.preventDefault()

    setJoinError("")

    if (!classCode.trim()) {
      setJoinError("Enter a class code.")
      return
    }

    if (!student) {
      return
    }

    const result = joinClassByCode(classCode, student)

    if (result.error) {
      setJoinError(result.error)
      return
    }

    setClasses((previousClasses) => [
      result.classItem,
      ...previousClasses,
    ])

    setClassCode("")
    setShowJoinModal(false)

    toast.success(`Joined ${result.classItem.className}!`)
  }


  function handleOpenJoinModal() {
    setClassCode("")
    setJoinError("")
    setShowJoinModal(true)
  }


  function handleCloseJoinModal() {
    setShowJoinModal(false)
    setClassCode("")
    setJoinError("")
  }


  function handleOpenClass(classItem) {
    navigate(`/student/classes/${classItem.id}`)
  }


  return (
    <StudentLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">

        {/* Page Header */}

        <div className="mb-7 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">

          <div className="flex items-start gap-3">

            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Student Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                My Classes
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Join a class with the code your teacher gave you.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={handleOpenJoinModal}
            className="h-10 shrink-0 rounded-lg bg-blue-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Join Class
          </button>

        </div>


        {/* Class List */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {classes.length === 0 ? (

            <div className="col-span-full rounded-xl border border-dashed bg-white px-6 py-14 text-center">

              <p className="text-sm font-medium text-gray-700">
                You haven't joined any classes yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Tap Join Class above to join your first class.
              </p>

            </div>

          ) : (

            classes.map(
              (classItem) => (

                <button
                  key={classItem.id}
                  type="button"
                  onClick={() =>
                    handleOpenClass(classItem)
                  }
                  className="group overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >

                  <div
                    className="h-2"
                    style={{
                      backgroundColor: classItem.color || DEFAULT_CLASS_COLOR,
                    }}
                  />

                  <div className="p-6">

                    <h2 className="text-lg font-bold text-blue-950">
                      {classItem.className}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {classItem.subject} • {classItem.section}
                    </p>

                    <p className="mt-4 text-xs text-gray-400">
                      Teacher
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      {classItem.teacherName}
                    </p>

                  </div>

                </button>

              )
            )

          )}

        </div>

      </div>


      {/* Join Class Modal */}

      {showJoinModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleCloseJoinModal}
        >

          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="border-b bg-gray-50 px-6 py-4">

              <h2 className="text-sm font-semibold text-gray-950">
                Join a Class
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                Enter the class code your teacher gave you.
              </p>

            </div>

            <form onSubmit={handleJoinClass} className="p-6">

              <label
                htmlFor="joinClassCode"
                className="text-sm font-medium text-gray-700"
              >
                Class Code
              </label>

              <input
                id="joinClassCode"
                value={classCode}
                onChange={(e) =>
                  setClassCode(e.target.value)
                }
                autoFocus
                className="mt-1.5 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-center text-lg font-semibold uppercase tracking-[0.2em] outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
              />

              {joinError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {joinError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={handleCloseJoinModal}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Join Class
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </StudentLayout>
  )
}

export default Classes
