import { useEffect, useState } from "react"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getAnnouncementsForRole } from "@/lib/announcementStorage"
import { openFile, downloadFile } from "@/lib/filePreview"

import {
  getLastSeenTimestamp,
  setLastSeenTimestamp,
} from "@/lib/announcementSeenStorage"

function getAudienceLabel(audience) {
  if (audience === "Teacher") {
    return "Teachers only"
  }

  if (audience === "Student") {
    return "Students only"
  }

  return "Everyone"
}

function formatDate(date) {
  return new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatFileSize(size) {
  if (!size) {
    return ""
  }

  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function AnnouncementsBoard({ eyebrow }) {
  const [announcements, setAnnouncements] = useState([])
  const [lastSeen, setLastSeen] = useState(null)

  useEffect(() => {
    const account = getCurrentAccount()

    if (!account) {
      return
    }

    const roleAnnouncements = getAnnouncementsForRole(account.role)

    // Freeze the "seen as of" cutoff for this visit before marking as
    // read, so New badges don't disappear out from under the user.
    setLastSeen(getLastSeenTimestamp(account.id))
    setAnnouncements(roleAnnouncements)

    if (roleAnnouncements.length > 0) {
      const newest = [...roleAnnouncements].sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )[0]

      setLastSeenTimestamp(account.id, newest.createdAt)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-4xl px-8 py-7">
      <div className="mb-7 flex items-start gap-3">
        <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
            {eyebrow}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
            Announcements
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Updates posted by the QCU LMS administrator.
          </p>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm font-semibold text-gray-800">
            No announcements yet
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Announcements from the administrator will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isNew =
              !lastSeen || announcement.createdAt > lastSeen

            return (
              <article
                key={announcement.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                      {getAudienceLabel(announcement.audience)}
                    </span>

                    {isNew && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                        New
                      </span>
                    )}

                    <span className="text-xs text-gray-400">
                      Posted {formatDate(announcement.createdAt)}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-bold text-gray-950">
                    {announcement.title}
                  </h2>
                </div>

                <div className="px-6 py-5">
                  <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                    {announcement.content}
                  </p>

                  {announcement.attachments?.length > 0 && (
                    <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4">
                      {announcement.attachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {file.type?.startsWith("image/") && file.data ? (
                              <button
                                type="button"
                                onClick={() => openFile(file)}
                                className="shrink-0 cursor-pointer"
                              >
                                <img
                                  src={file.data}
                                  alt={file.name}
                                  className="h-12 w-12 rounded-md object-cover transition hover:opacity-80"
                                />
                              </button>
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-200 text-[10px] font-semibold text-gray-500">
                                FILE
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-800">
                                {file.name}
                              </p>

                              <p className="text-xs text-gray-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>

                          {file.data && (
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => openFile(file)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                              >
                                Open
                              </button>

                              <button
                                type="button"
                                onClick={() => downloadFile(file)}
                                className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200"
                              >
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AnnouncementsBoard
