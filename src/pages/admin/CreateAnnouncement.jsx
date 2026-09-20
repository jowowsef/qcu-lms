import { useState } from "react"

import { useNavigate } from "react-router-dom"

import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"
import AdminSectionHeading from "@/components/admin/AdminSectionHeading"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { saveAnnouncement } from "@/lib/announcementStorage"
import { useToast } from "@/components/ui/toast"

function CreateAnnouncement() {
  const navigate = useNavigate()
  const toast = useToast()

  const [title, setTitle] = useState("")

  const [content, setContent] = useState("")

  const [audience, setAudience] = useState("Everyone")

  const [attachments, setAttachments] = useState([])

  const [isSaving, setIsSaving] = useState(false)

  function handleFileChange(e) {
    const files = Array.from(e.target.files)

    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
          })
        }

        reader.onerror = () => {
          reject(
            new Error(
              `Unable to read ${file.name}`
            )
          )
        }

        reader.readAsDataURL(file)
      })
    })

    Promise.all(filePromises)
      .then((uploadedFiles) => {
        setAttachments((previousFiles) => [
          ...previousFiles,
          ...uploadedFiles,
        ])
      })
      .catch(() => {
        toast.error("Some files could not be uploaded.")
      })

    e.target.value = ""
  }

  function removeAttachment(index) {
    setAttachments((previousFiles) =>
      previousFiles.filter(
        (_, fileIndex) => fileIndex !== index
      )
    )
  }

  function formatFileSize(size) {
    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      return
    }

    setIsSaving(true)

    saveAnnouncement({
      title: title.trim(),
      content: content.trim(),
      audience,
      attachments,
    })

    toast.success("Announcement posted successfully!")

    navigate("/admin/announcements")
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <AdminPageHeader
          title="Create announcement"
          description="Share important information with teachers and students."
        />

        {/* Form Card */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="bg-blue-950 px-5 py-6 text-white sm:px-8 sm:py-7 lg:px-10">

            <h2 className="text-lg font-bold">
              New announcement
            </h2>

            <p className="mt-0.5 text-sm text-blue-200">
              Create a message that will appear on the LMS.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 lg:p-10"
          >

            {/* Announcement Information */}

            <section className="mb-10">

              <AdminSectionHeading
                title="Announcement information"
                description="Enter the details of the announcement."
              />

              <div className="space-y-6">

                {/* Title */}

                <div className="space-y-2">

                  <Label htmlFor="title">
                    Title
                  </Label>

                  <Input
                    id="title"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Enter announcement title"
                    className="h-11"
                    required
                  />

                </div>

                {/* Content */}

                <div className="space-y-2">

                  <Label htmlFor="content">
                    Content
                  </Label>

                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    placeholder="Write your announcement here..."
                    rows={8}
                    required
                    className="min-h-48 resize-y text-sm"
                  />

                </div>

                {/* Audience */}

                <div className="space-y-2">

                  <Label htmlFor="audience">
                    Audience
                  </Label>

                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger id="audience" className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Everyone">Everyone</SelectItem>
                      <SelectItem value="Teacher">Teachers only</SelectItem>
                      <SelectItem value="Student">Students only</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-gray-400">
                    Everyone will make the announcement visible to both teachers and students.
                  </p>

                </div>

              </div>

            </section>

            {/* Attachments */}

            <section className="mb-10 border-t pt-10">

              <AdminSectionHeading
                title="Attachments"
                description="Attach files or pictures to the announcement."
              />

              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">

                <label
                  htmlFor="attachments"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
                >

                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    +
                  </div>

                  <p className="text-sm font-semibold text-gray-900">
                    Upload files or pictures
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Click here to choose files from your computer.
                  </p>

                  <input
                    id="attachments"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                </label>

                {/* Selected Files */}

                {attachments.length > 0 && (
                  <div className="mt-5 space-y-3">

                    <p className="text-sm font-semibold text-gray-900">
                      Selected Files
                    </p>

                    {attachments.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          {file.type.startsWith("image/") ? (
                            <img
                              src={file.data}
                              alt={file.name}
                              className="h-12 w-12 shrink-0 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-500">
                              FILE
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {file.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeAttachment(index)
                          }
                          className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </section>

            {/* Actions */}

            <div className="flex flex-col-reverse gap-3 border-t pt-7 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() =>
                  navigate("/admin/announcements")
                }
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-11 bg-blue-900 px-7 hover:bg-blue-800"
                disabled={isSaving}
              >
                {isSaving
                  ? "Posting..."
                  : "Post Announcement"}
              </Button>

            </div>

          </form>

        </div>

      </div>
    </AdminLayout>
  )
}

export default CreateAnnouncement