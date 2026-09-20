import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CircleAlertIcon, CheckIcon, XIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { getNotificationsForAdmin } from "@/lib/adminNotifications"
import { getLastSeenAt, markAllSeen } from "@/lib/notificationSeenStorage"

const STATUS_ICON_STYLES = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-emerald-50 text-emerald-700",
  Rejected: "bg-red-50 text-red-700",
}

const STATUS_ICONS = {
  Pending: CircleAlertIcon,
  Approved: CheckIcon,
  Rejected: XIcon,
}

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const diffMinutes = Math.round(diffMs / (1000 * 60))

  if (diffMinutes < 1) {
    return "Just now"
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  const diffDays = Math.round(diffHours / 24)

  return `${diffDays}d ago`
}

function AdminNotificationBell({ admin }) {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([])
  const [lastSeenAt, setLastSeenAt] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!admin) {
      return
    }

    setNotifications(getNotificationsForAdmin())
    setLastSeenAt(getLastSeenAt(admin.id))
  }, [admin])

  const unseenCount = notifications.filter(
    (notification) => !lastSeenAt || notification.timestamp > lastSeenAt
  ).length

  function handleOpenChange(nextOpen) {
    setOpen(nextOpen)

    if (nextOpen && admin) {
      setLastSeenAt(markAllSeen(admin.id))
    }
  }

  function handleSelect() {
    setOpen(false)

    navigate("/admin/accounts", {
      state: { tab: "requests" },
    })
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 outline-none hover:bg-gray-100"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {unseenCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unseenCount > 9 ? "9+" : unseenCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-80 p-0">
        <div className="border-b border-gray-100 px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">Notifications</p>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-400">
              No account requests yet.
            </p>
          ) : (
            notifications.slice(0, 20).map((notification) => {
              const StatusIcon = STATUS_ICONS[notification.status] || CircleAlertIcon

              return (
              <button
                key={notification.id}
                type="button"
                onClick={handleSelect}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    STATUS_ICON_STYLES[notification.status] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  <StatusIcon className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>

                  <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
                    {notification.message}
                  </p>

                  <p className="mt-1 text-[11px] text-gray-400">
                    {formatRelativeTime(notification.timestamp)}
                  </p>
                </div>
              </button>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default AdminNotificationBell
