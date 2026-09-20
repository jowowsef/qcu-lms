import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

import {
  getAnnouncements,
  deleteAnnouncement,
} from "@/lib/announcementStorage"

import { addAuditLog } from "@/lib/auditLogStorage"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useConfirm } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { openFile, downloadFile } from "@/lib/filePreview"

function Announcements() {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const toast = useToast()

  const [announcements, setAnnouncements] =
    useState([])

  const [searchTerm, setSearchTerm] =
    useState("")

  const [audienceFilter, setAudienceFilter] =
    useState("All")

  function loadAnnouncements() {
    const savedAnnouncements =
      getAnnouncements()

    setAnnouncements(
      savedAnnouncements
    )
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  async function handleDelete(id) {
    const confirmed = await confirm({
      title: "Delete this announcement?",
      description: "This announcement will be permanently removed for all audiences.",
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteAnnouncement(id)

    addAuditLog({
      action: "Delete Announcement",
      details: `Deleted announcement ${id}`,
    })

    loadAnnouncements()
    toast.success("Announcement deleted.")
  }

  function handleEdit(id) {
    navigate(
      `/admin/announcements/edit/${id}`
    )
  }

  function handleOpenFile(file) {
    if (!file?.data) {
      toast.error(
        "This attachment cannot be previewed."
      )

      return
    }

    const opened = openFile(file)

    if (!opened) {
      toast.error(
        "Your browser blocked the new tab. Please allow pop-ups for this site."
      )
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    )
  }

  function formatFileSize(size) {
    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(
        size / 1024
      ).toFixed(1)} KB`
    }

    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`
  }

  function getAudienceLabel(audience) {
    if (audience === "Teacher") {
      return "Teachers only"
    }

    if (audience === "Student") {
      return "Students only"
    }

    return "Everyone"
  }

  const filteredAnnouncements =
    announcements.filter(
      (announcement) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim()

        const matchesSearch =
          !search ||
          announcement.title
            ?.toLowerCase()
            .includes(search) ||
          announcement.content
            ?.toLowerCase()
            .includes(search) ||
          announcement.id
            ?.toLowerCase()
            .includes(search)

        const matchesAudience =
          audienceFilter === "All" ||
          announcement.audience ===
            audienceFilter

        return (
          matchesSearch &&
          matchesAudience
        )
      }
    )

  const isFiltering =
    searchTerm.trim() !== "" ||
    audienceFilter !== "All"

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <AdminPageHeader
          title="Announcements"
          description="Create and manage announcements for the LMS."
          action={
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={() => navigate("/admin/announcements/create")}
            >
              Create announcement
            </Button>
          }
        />

        <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8">

          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              All announcements
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage announcements that will be posted in the LMS.
            </p>
          </div>

          {announcements.length > 0 && (
            <div className="mt-6">

              <div className="flex flex-col gap-3 md:flex-row">

                {/* Search */}

                <div className="relative flex-1">

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                    placeholder="Search announcements..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white px-4 pr-16 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  />

                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchTerm("")
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 transition hover:text-gray-700"
                    >
                      Clear
                    </button>
                  )}

                </div>

                {/* Audience Filter */}

                <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                  <SelectTrigger className="h-10 w-full md:w-52">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="All">All audiences</SelectItem>
                    <SelectItem value="Everyone">Everyone</SelectItem>
                    <SelectItem value="Student">Students only</SelectItem>
                    <SelectItem value="Teacher">Teachers only</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              {isFiltering && (
                <div className="mt-3 flex items-center justify-between">

                  <p className="text-xs text-gray-400">
                    Showing{" "}
                    {filteredAnnouncements.length}{" "}
                    {filteredAnnouncements.length === 1
                      ? "announcement"
                      : "announcements"}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("")
                      setAudienceFilter("All")
                    }}
                    className="text-xs font-medium text-blue-700 hover:text-blue-900"
                  >
                    Clear filters
                  </button>

                </div>
              )}

            </div>
          )}

          {announcements.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed bg-gray-50 px-6 py-12 text-center">

              <h3 className="text-base font-semibold text-gray-900">
                No announcements yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create an announcement to share important information with users.
              </p>

            </div>
          )}

          {announcements.length > 0 &&
            filteredAnnouncements.length === 0 && (
              <div className="mt-8 rounded-xl border border-dashed bg-gray-50 px-6 py-12 text-center">

                <h3 className="text-base font-semibold text-gray-900">
                  No matching announcements found
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or audience filter.
                </p>

              </div>
            )}

          {filteredAnnouncements.length > 0 && (
            <div className="mt-8 space-y-5">

              {filteredAnnouncements.map(
                (announcement) => (
                  <article
                    key={announcement.id}
                    className="overflow-hidden rounded-xl border bg-white"
                  >

                    <div className="border-b bg-gray-50 px-6 py-5">

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        <div className="min-w-0">

                          <div className="mb-2 flex flex-wrap items-center gap-2">

                            <Badge className="bg-blue-100 text-blue-800">
                              {getAudienceLabel(
                                announcement.audience
                              )}
                            </Badge>

                            <span className="text-xs text-gray-400">
                              {announcement.id}
                            </span>

                          </div>

                          <h3 className="text-lg font-bold text-gray-950">
                            {announcement.title}
                          </h3>

                          <p className="mt-1 text-xs text-gray-400">
                            Posted{" "}
                            {formatDate(
                              announcement.createdAt
                            )}
                          </p>

                          {announcement.updatedAt && (
                            <p className="mt-1 text-xs text-gray-400">
                              Last updated{" "}
                              {formatDate(
                                announcement.updatedAt
                              )}
                            </p>
                          )}

                        </div>

                        <div className="flex shrink-0 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                announcement.id
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                announcement.id
                              )
                            }
                            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </div>

                      </div>

                    </div>

                    <div className="px-6 py-6">

                      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                        {announcement.content}
                      </p>

                      {announcement.attachments?.length > 0 && (
                        <div className="mt-6 border-t pt-5">

                          <p className="mb-3 text-sm font-semibold text-gray-900">
                            Attachments
                          </p>

                          <div className="space-y-3">

                            {announcement.attachments.map(
                              (file, index) => (
                                <div
                                  key={`${file.name}-${index}`}
                                  className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-3"
                                >

                                  <div className="flex min-w-0 items-center gap-4">

                                    {file.type?.startsWith(
                                      "image/"
                                    ) ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleOpenFile(
                                            file
                                          )
                                        }
                                        className="shrink-0 cursor-pointer"
                                      >
                                        <img
                                          src={file.data}
                                          alt={file.name}
                                          className="h-16 w-16 rounded-md object-cover transition hover:opacity-80"
                                        />
                                      </button>
                                    ) : (
                                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs font-semibold text-gray-500">
                                        FILE
                                      </div>
                                    )}

                                    <div className="min-w-0">

                                      <p className="truncate text-sm font-medium text-gray-900">
                                        {file.name}
                                      </p>

                                      <p className="mt-1 text-xs text-gray-400">
                                        {formatFileSize(
                                          file.size
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                  <div className="flex shrink-0 gap-2">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenFile(
                                          file
                                        )
                                      }
                                      className="rounded-md px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
                                    >
                                      Open
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        downloadFile(
                                          file
                                        )
                                      }
                                      className="rounded-md px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200"
                                    >
                                      Download
                                    </button>

                                  </div>

                                </div>
                              )
                            )}

                          </div>

                        </div>
                      )}

                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  )
}

export default Announcements

