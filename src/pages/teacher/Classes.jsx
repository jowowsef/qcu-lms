import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { PencilIcon } from "lucide-react"

import TeacherLayout from "@/components/TeacherLayout"

import {
  getCurrentAccount,
} from "@/lib/accountStorage"

import {
  getClassesForTeacher,
  saveClass,
  updateClass,
} from "@/lib/classStorage"

import { useToast } from "@/components/ui/toast"
import { copyToClipboard } from "@/lib/clipboard"
import ClassworkPanel from "@/components/classwork/ClassworkPanel"
import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  CLASS_BANNER_COLORS,
  DEFAULT_CLASS_COLOR,
} from "@/lib/classColors"


function Classes() {
  const navigate = useNavigate()
  const toast = useToast()

  const [teacher, setTeacher] = useState(null)
  const [classes, setClasses] = useState([])

  const [showCreateForm, setShowCreateForm] =
    useState(false)

  const [editingClass, setEditingClass] =
    useState(null)

  const [className, setClassName] =
    useState("")

  const [subject, setSubject] =
    useState("")

  const [section, setSection] =
    useState("")

  const [classColor, setClassColor] =
    useState(DEFAULT_CLASS_COLOR)

  const isCustomColor = !CLASS_BANNER_COLORS.some(
    (option) => option.value.toLowerCase() === classColor.toLowerCase()
  )

  const [createdClass, setCreatedClass] =
    useState(null)


  useEffect(() => {
    const currentAccount =
      getCurrentAccount()

    if (!currentAccount) {
      navigate("/")
      return
    }

    setTeacher(currentAccount)

    const teacherClasses =
      getClassesForTeacher(
        currentAccount.id
      )

    setClasses(teacherClasses)
  }, [navigate])


  function handleCreateClass(e) {
    e.preventDefault()

    if (!className.trim()) {
      toast.error("Class name is required.")
      return
    }

    if (!subject.trim()) {
      toast.error("Subject is required.")
      return
    }

    if (!section.trim()) {
      toast.error("Section is required.")
      return
    }

    if (!teacher) {
      return
    }

    const newClass = saveClass({
      teacherId: teacher.id,
      teacherName: teacher.name,

      className:
        className.trim(),

      subject:
        subject.trim(),

      section:
        section.trim(),

      color:
        classColor,
    })

    setClasses((previousClasses) => [
      newClass,
      ...previousClasses,
    ])

    setCreatedClass(newClass)

    setClassName("")
    setSubject("")
    setSection("")
    setClassColor(DEFAULT_CLASS_COLOR)

    setShowCreateForm(false)

    toast.success(
      "Class created successfully!"
    )
  }


  function handleStartEdit(classItem) {
    setEditingClass(classItem)
    setClassName(classItem.className)
    setSubject(classItem.subject)
    setSection(classItem.section)
    setClassColor(classItem.color || DEFAULT_CLASS_COLOR)
    setShowCreateForm(true)
  }


  function handleCancelForm() {
    setShowCreateForm(false)
    setEditingClass(null)
    setClassName("")
    setSubject("")
    setSection("")
    setClassColor(DEFAULT_CLASS_COLOR)
  }


  function handleUpdateClass(e) {
    e.preventDefault()

    if (!className.trim()) {
      toast.error("Class name is required.")
      return
    }

    if (!subject.trim()) {
      toast.error("Subject is required.")
      return
    }

    if (!section.trim()) {
      toast.error("Section is required.")
      return
    }

    if (!editingClass) {
      return
    }

    const updatedData = {
      className: className.trim(),
      subject: subject.trim(),
      section: section.trim(),
      color: classColor,
    }

    updateClass(editingClass.id, updatedData)

    setClasses((previousClasses) =>
      previousClasses.map((classItem) =>
        classItem.id === editingClass.id
          ? { ...classItem, ...updatedData }
          : classItem
      )
    )

    handleCancelForm()

    toast.success("Class updated successfully!")
  }


  async function handleCopyCode(code) {
    const success = await copyToClipboard(code)

    if (success) {
      toast.success("Class code copied!")
    } else {
      toast.error("Couldn't copy the class code.")
    }
  }


  function handleOpenClass(classItem) {
    navigate(
      `/teacher/classes/${classItem.id}`
    )
  }


  function handleGoToPeopleTab() {
    if (!createdClass) {
      return
    }

    navigate(
      `/teacher/classes/${createdClass.id}`,
      { state: { tab: "People" } }
    )
  }


  return (
    <TeacherLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">

        {/* Page Header */}

        <div className="mb-7 flex items-start justify-between gap-6">

          <div className="flex items-start gap-3">

            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Teacher Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                My Classes
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create and manage your classes.
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Create Class
          </button>

        </div>


        {/* Create / Edit Class */}

        {showCreateForm && (

          <ClassworkPanel
            eyebrow={editingClass ? "Edit Class" : "Create Class"}
            title={editingClass ? editingClass.className : "New Class"}
            description={
              editingClass
                ? "Update this class's details."
                : "Create a class for your students."
            }
            onClose={handleCancelForm}
          >

            <form
              onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
              className="space-y-5"
            >

              <div className="grid grid-cols-1 gap-5">

                {/* Class Name */}

                <div className="space-y-1.5">

                  <label
                    htmlFor="className"
                    className="text-sm font-medium text-gray-700"
                  >
                    Class Name
                  </label>

                  <input
                    id="className"
                    value={className}
                    onChange={(e) =>
                      setClassName(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Web Development"
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  />

                </div>


                {/* Subject Code */}

                <div className="space-y-1.5">

                  <label
                    htmlFor="subject"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subject Code
                  </label>

                  <input
                    id="subject"
                    value={subject}
                    onChange={(e) =>
                      setSubject(
                        e.target.value
                      )
                    }
                    placeholder="e.g. IT 201"
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  />

                </div>


                {/* Section */}

                <div className="space-y-1.5">

                  <label
                    htmlFor="section"
                    className="text-sm font-medium text-gray-700"
                  >
                    Section
                  </label>

                  <input
                    id="section"
                    value={section}
                    onChange={(e) =>
                      setSection(
                        e.target.value
                      )
                    }
                    placeholder="e.g. BSIT 2A"
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  />

                </div>

              </div>


              {/* Banner Color */}

              <div className="mt-5 space-y-1.5">

                <label className="text-sm font-medium text-gray-700">
                  Banner Color
                </label>

                <p className="text-xs text-gray-400">
                  Shown on the class card and at the top of the class page. Students see the same color.
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">

                  {CLASS_BANNER_COLORS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setClassColor(option.value)}
                      title={option.name}
                      aria-label={option.name}
                      aria-pressed={classColor === option.value}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ring-offset-2 transition ${
                        classColor === option.value
                          ? "ring-2 ring-gray-900"
                          : "hover:opacity-80"
                      }`}
                      style={{ backgroundColor: option.value }}
                    >
                      {classColor === option.value && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  ))}

                  <div className="mx-1 h-8 w-px bg-gray-200" />

                  <label
                    title="Custom color"
                    className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-offset-2 transition ${
                      isCustomColor
                        ? "ring-2 ring-gray-900"
                        : "hover:opacity-80"
                    }`}
                    style={{
                      background: isCustomColor
                        ? classColor
                        : "conic-gradient(from 90deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
                    }}
                  >
                    {isCustomColor ? (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-white drop-shadow"
                        fill="currentColor"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}

                    <input
                      type="color"
                      value={classColor}
                      onChange={(e) => setClassColor(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                  </label>

                  {isCustomColor && (
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {classColor}
                    </span>
                  )}

                </div>

              </div>


              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                  {editingClass ? "Save Changes" : "Create Class"}
                </button>

              </div>

            </form>

          </ClassworkPanel>

        )}


        {/* Class Created */}

        <Dialog
          open={Boolean(createdClass)}
          onOpenChange={(open) => {
            if (!open) {
              setCreatedClass(null)
            }
          }}
        >
          <DialogContent>

            <DialogHeader>
              <DialogTitle>Class created</DialogTitle>

              <DialogDescription>
                {createdClass?.className} is ready. Share the class code
                below, or invite students by email from the People tab.
              </DialogDescription>
            </DialogHeader>

            {createdClass && (

              <button
                type="button"
                onClick={() => handleCopyCode(createdClass.classCode)}
                title="Tap to copy"
                className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >

                <p className="text-xs font-medium text-gray-500">
                  Class code <span className="text-gray-400">(tap to copy)</span>
                </p>

                <p className="mt-1 text-2xl font-bold tracking-[0.2em] text-blue-900">
                  {createdClass.classCode}
                </p>

              </button>

            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatedClass(null)}
              >
                Done
              </Button>

              <Button
                type="button"
                onClick={handleGoToPeopleTab}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Open People tab
              </Button>
            </DialogFooter>

          </DialogContent>
        </Dialog>


        {/* Class List */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {classes.length === 0 ? (

            <div className="col-span-full rounded-xl border border-dashed bg-white px-6 py-14 text-center">

              <p className="text-sm font-medium text-gray-700">
                No classes created yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Click Create Class to create your first class.
              </p>

            </div>

          ) : (

            classes.map(
              (classItem) => (

                <div
                  key={classItem.id}
                  className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                >

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() =>
                      handleStartEdit(
                        classItem
                      )
                    }
                    title="Edit class"
                    aria-label="Edit class"
                    className="absolute right-3 top-3 z-10 bg-white/90 text-gray-400 shadow-sm hover:bg-white hover:text-blue-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenClass(
                        classItem
                      )
                    }
                    className="w-full text-left"
                  >

                    <div
                      className="h-2"
                      style={{
                        backgroundColor:
                          classItem.color || DEFAULT_CLASS_COLOR,
                      }}
                    />

                    <div className="p-6">

                      <h2 className="truncate pr-9 text-lg font-bold text-blue-950">
                        {classItem.className}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {classItem.subject} • {classItem.section}
                      </p>


                      <div className="mt-6 flex items-end justify-between">

                        <div>

                          <p className="text-xs text-gray-400">
                            Students
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {classItem.studentCount}
                          </p>

                        </div>


                        <span
                          role="button"
                          tabIndex={0}
                          title="Tap to copy"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyCode(classItem.classCode)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              e.stopPropagation()
                              handleCopyCode(classItem.classCode)
                            }
                          }}
                          className="-m-1.5 rounded-md p-1.5 text-right transition hover:bg-blue-50"
                        >

                          <p className="text-xs text-gray-400">
                            Class Code
                          </p>

                          <p className="mt-1 text-sm font-bold tracking-wider text-blue-900">
                            {classItem.classCode}
                          </p>

                        </span>

                      </div>

                    </div>

                  </button>

                </div>

              )
            )

          )}

        </div>

      </div>

    </TeacherLayout>
  )
}

export default Classes