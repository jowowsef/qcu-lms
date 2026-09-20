import { useEffect, useState } from "react"

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"

import TeacherLayout from "@/components/TeacherLayout"

import { getCurrentAccount } from "@/lib/accountStorage"

import { getClassesForTeacher } from "@/lib/classStorage"

import { DEFAULT_CLASS_COLOR } from "@/lib/classColors"
import { copyToClipboard } from "@/lib/clipboard"
import { useToast } from "@/components/ui/toast"

import Stream from "@/pages/teacher/class/Stream"

import Classwork from "@/pages/teacher/class/Classwork"

import CalendarTab from "@/pages/teacher/class/CalendarTab"

import People from "@/pages/teacher/class/People"

import Attendance from "@/pages/teacher/class/Attendance"


function ClassPage() {
  const navigate = useNavigate()
  const toast = useToast()

  const location = useLocation()

  const { id } = useParams()

  const [classData, setClassData] =
    useState(null)

  const [activeTab, setActiveTab] =
    useState(location.state?.tab || "Stream")

  const initialClassworkId = location.state?.classworkId || null

  const [pendingClassworkItem, setPendingClassworkItem] = useState(null)

  function handleOpenClassworkFromStream(item) {
    setPendingClassworkItem(item)
    setActiveTab("Classwork")
  }


  useEffect(() => {
    const currentAccount =
      getCurrentAccount()

    if (!currentAccount) {
      navigate("/")
      return
    }


    const teacherClasses =
      getClassesForTeacher(
        currentAccount.id
      )


    const selectedClass =
      teacherClasses.find(
        (classItem) =>
          classItem.id === id
      )


    if (!selectedClass) {
      navigate("/teacher/classes")
      return
    }


    setClassData(selectedClass)

  }, [id, navigate])


  if (!classData) {
    return null
  }


  const tabs = [
    "Stream",
    "Classwork",
    "Attendance",
    "Calendar",
    "People",
  ]


  async function handleCopyCode() {
    const success = await copyToClipboard(classData.classCode)

    if (success) {
      toast.success("Class code copied!")
    } else {
      toast.error("Couldn't copy the class code.")
    }
  }


  function renderActiveTab() {

    if (activeTab === "Stream") {
      return (
        <Stream
          classData={classData}
          onOpenClasswork={handleOpenClassworkFromStream}
        />
      )
    }


    if (activeTab === "Classwork") {
      return (
        <Classwork
          classData={classData}
          initialItemId={initialClassworkId}
          openItem={pendingClassworkItem}
          onOpenItemHandled={() => setPendingClassworkItem(null)}
        />
      )
    }


    if (activeTab === "Attendance") {
      return (
        <Attendance
          classData={classData}
        />
      )
    }


    if (activeTab === "Calendar") {
      return (
        <CalendarTab
          classData={classData}
        />
      )
    }


    if (activeTab === "People") {
      return (
        <People
          classData={classData}
        />
      )
    }


    return null
  }


  return (
    <TeacherLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-7">

        {/* Class Header */}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div
            className="px-7 py-8"
            style={{ backgroundColor: classData.color || DEFAULT_CLASS_COLOR }}
          >

            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

              <div>

                <p className="text-sm font-medium text-white/70">
                  {classData.subject} • {classData.section}
                </p>

                <h1 className="mt-1 text-3xl font-bold text-white">
                  {classData.className}
                </h1>

                <p className="mt-2 text-sm text-white/70">
                  Teacher: {classData.teacherName}
                </p>

              </div>


              <button
                type="button"
                onClick={handleCopyCode}
                title="Tap to copy"
                className="rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-left transition hover:bg-white/20"
              >

                <p className="text-xs font-medium text-white/70">
                  Class Code <span className="text-white/50">(tap to copy)</span>
                </p>

                <p className="mt-1 text-xl font-bold tracking-[0.2em] text-white">
                  {classData.classCode}
                </p>

              </button>

            </div>

          </div>


          {/* Tabs */}

          <div className="flex overflow-x-auto border-t bg-white px-5">

            {tabs.map((tab) => (

              <button
                key={tab}
                type="button"
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`relative whitespace-nowrap px-5 py-4 text-sm font-semibold transition ${
                  activeTab === tab
                    ? "text-blue-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >

                {tab}

                {activeTab === tab && (

                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />

                )}

              </button>

            ))}

          </div>

        </div>


        {/* Active Tab */}

        {renderActiveTab()}

      </div>

    </TeacherLayout>
  )
}

export default ClassPage