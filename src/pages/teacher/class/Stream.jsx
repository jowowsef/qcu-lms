import { useEffect, useState } from "react"

import { getCurrentAccount, getAccountById } from "@/lib/accountStorage"
import UserAvatar from "@/components/UserAvatar"
import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"

import {
  getTeacherAnnouncementsForClass,
  saveTeacherAnnouncement,
  deleteTeacherAnnouncement,
} from "@/lib/announcementStorageTeacher"

import { getClassworkForClass } from "@/lib/classWorkStorage"
import { TYPE_LABELS, formatDueDate } from "@/lib/classworkHelpers"

import { useConfirm } from "@/components/ui/confirm-dialog"


function Stream({ classData, role = "teacher", onOpenClasswork }) {
  const canPost = role === "teacher"

  const confirm = useConfirm()

  const teacherAccount = getAccountById(classData.teacherId)

  const [announcements, setAnnouncements] =
    useState([])

  const [classwork, setClasswork] =
    useState([])

  const [showAnnouncementForm, setShowAnnouncementForm] =
    useState(false)

  const [announcementText, setAnnouncementText] =
    useState("")


  useEffect(() => {
    const classAnnouncements =
      getTeacherAnnouncementsForClass(
        classData.id
      )

    setAnnouncements(
      classAnnouncements
    )

    setClasswork(
      getClassworkForClass(classData.id)
    )

  }, [classData.id])

  const feedItems = [
    ...announcements.map((announcement) => ({
      kind: "announcement",
      timestamp: announcement.createdAt,
      data: announcement,
    })),
    ...classwork.map((item) => ({
      kind: "classwork",
      timestamp: item.createdAt,
      data: item,
    })),
  ].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  )


  function handlePostAnnouncement(event) {
    event.preventDefault()


    if (!announcementText.trim()) {
      return
    }


    const currentAccount =
      getCurrentAccount()


    const newAnnouncement =
      saveTeacherAnnouncement({
        classId:
          classData.id,

        teacherId:
          currentAccount?.id,

        teacherName:
          classData.teacherName,

        text:
          announcementText.trim(),
      })


    setAnnouncements(
      (currentAnnouncements) => [
        newAnnouncement,
        ...currentAnnouncements,
      ]
    )


    setAnnouncementText("")

    setShowAnnouncementForm(false)
  }


  async function handleDeleteAnnouncement(
    announcementId
  ) {
    const confirmed = await confirm({
      title: "Delete this announcement?",
      description: "This will be permanently removed from the class stream.",
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteTeacherAnnouncement(
      announcementId
    )


    setAnnouncements(
      (currentAnnouncements) =>
        currentAnnouncements.filter(
          (announcement) =>
            announcement.id !==
            announcementId
        )
    )
  }


  return (
    <div className="mt-6 space-y-5">

      {/* Announcement Box */}

      {canPost && (
      <div className="rounded-xl border bg-white p-6 shadow-sm">

        {!showAnnouncementForm ? (

          <div className="flex items-center gap-3">

            <UserAvatar
              src={teacherAccount?.avatar}
              name={classData.teacherName}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900"
            />


            <button
              type="button"
              onClick={() =>
                setShowAnnouncementForm(true)
              }
              className="flex-1 rounded-full border bg-gray-50 px-5 py-3 text-left text-sm text-gray-400 transition hover:bg-gray-100"
            >
              Announce something to your class...
            </button>

          </div>

        ) : (

          <form
            onSubmit={
              handlePostAnnouncement
            }
            className="space-y-4"
          >

            <div className="flex items-center gap-3">

              <UserAvatar
                src={teacherAccount?.avatar}
                name={classData.teacherName}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900"
              />

              <div>

                <p className="text-sm font-semibold text-gray-900">
                  {classData.teacherName}
                </p>

                <p className="text-xs text-gray-500">
                  Teacher
                </p>

              </div>

            </div>


            <textarea
              value={announcementText}
              onChange={(event) =>
                setAnnouncementText(
                  event.target.value
                )
              }
              placeholder="Write an announcement for your class..."
              rows={4}
              autoFocus
              className="w-full resize-none rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />


            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setAnnouncementText("")
                  setShowAnnouncementForm(false)
                }}
                className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  !announcementText.trim()
                }
                className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Post
              </button>

            </div>

          </form>

        )}

      </div>
      )}


      {/* Feed: announcements + posted classwork */}

      {feedItems.length === 0 ? (

        <div className="rounded-xl border bg-white px-6 py-14 text-center shadow-sm">

          <p className="text-sm font-medium text-gray-700">
            No posts yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Class announcements and posted classwork will appear here.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {feedItems.map((feedItem) => {
            if (feedItem.kind === "classwork") {
              const item = feedItem.data
              const itemTeacher = getAccountById(item.teacherId)

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpenClasswork?.(item)}
                  className="flex w-full items-center gap-4 rounded-xl border bg-white p-6 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <UserAvatar
                    src={itemTeacher?.avatar}
                    name={item.teacherName}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500">
                      {item.teacherName} posted a new {TYPE_LABELS[item.type] || item.type.toLowerCase()}
                    </p>

                    <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                      {item.title}
                    </p>

                    {item.type !== "Material" && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        Due {formatDueDate(item)}
                      </p>
                    )}
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <ClassworkTypeIcon type={item.type} className="h-5 w-5" />
                  </div>
                </button>
              )
            }

            const announcement = feedItem.data
            const announcementTeacher = getAccountById(announcement.teacherId)

            return (

              <div
                key={announcement.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <UserAvatar
                      src={announcementTeacher?.avatar}
                      name={announcement.teacherName}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900"
                    />


                    <div>

                      <p className="text-sm font-semibold text-gray-900">
                        {announcement.teacherName}
                      </p>

                      <p className="text-xs text-gray-500">
                        Teacher
                      </p>

                    </div>

                  </div>


                  {canPost && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAnnouncement(
                          announcement.id
                        )
                      }
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  )}

                </div>


                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {announcement.text}
                </p>

              </div>

            )
          })}

        </div>

      )}

    </div>
  )
}

export default Stream