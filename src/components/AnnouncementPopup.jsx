import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getCurrentAccount } from "@/lib/accountStorage"
import { getAnnouncementsForRole } from "@/lib/announcementStorage"

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
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function AnnouncementPopup() {
  const navigate = useNavigate()

  const [account, setAccount] = useState(null)
  const [unseen, setUnseen] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const currentAccount = getCurrentAccount()

    if (!currentAccount) {
      return
    }

    const roleAnnouncements = getAnnouncementsForRole(
      currentAccount.role
    )

    const lastSeen = getLastSeenTimestamp(currentAccount.id)

    const newOnes = roleAnnouncements
      .filter(
        (announcement) =>
          !lastSeen || announcement.createdAt > lastSeen
      )
      .sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
      .slice(0, 5)

    if (newOnes.length > 0) {
      setAccount(currentAccount)
      setUnseen(newOnes)
    }
  }, [])

  useEffect(() => {
    if (unseen.length === 0) {
      return
    }

    const frame = requestAnimationFrame(() => setMounted(true))

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
    }
  }, [unseen.length])

  function handleDismiss() {
    if (account && unseen.length > 0) {
      setLastSeenTimestamp(account.id, unseen[0].createdAt)
    }

    setUnseen([])
  }

  function handleViewAll() {
    handleDismiss()

    navigate(
      account?.role === "Student"
        ? "/student/announcements"
        : "/teacher/announcements"
    )
  }

  if (unseen.length === 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={handleDismiss}
        className={`absolute inset-0 bg-gray-900/50 transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-start gap-4 border-b border-gray-100 px-6 py-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 11l18-5v12L3 14v-3z" />
              <path d="M11 13v5a2 2 0 0 0 4 0v-3.5" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-blue-950">
                {unseen.length === 1
                  ? "New announcement"
                  : "New announcements"}
              </h2>

              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                {unseen.length} new
              </span>
            </div>

            <p className="mt-0.5 text-xs text-gray-500">
              Posted by the QCU LMS administrator.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          {unseen.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                  {getAudienceLabel(announcement.audience)}
                </span>

                <span className="text-xs text-gray-400">
                  {formatDate(announcement.createdAt)}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-gray-900">
                {announcement.title}
              </h3>

              <p className="mt-1 line-clamp-3 text-sm leading-6 text-gray-600">
                {announcement.content}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={handleViewAll}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            View all
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg bg-blue-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementPopup
