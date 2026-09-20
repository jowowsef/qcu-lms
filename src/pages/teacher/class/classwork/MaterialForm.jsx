import { useState } from "react"

import { formatFileSize, readFileAsDataUrl } from "@/lib/classworkHelpers"
import { useToast } from "@/components/ui/toast"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function MaterialForm({ initialData, onSubmit, onCancel, topics = [] }) {
  const toast = useToast()
  const isEditing = Boolean(initialData)

  const [title, setTitle] = useState(initialData?.title || "")
  const [topicId, setTopicId] = useState(initialData?.topicId || "none")
  const [description, setDescription] = useState(initialData?.instructions || "")
  const [existingAttachments, setExistingAttachments] = useState(
    initialData?.attachments || []
  )
  const [newFiles, setNewFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(event) {
    const files = Array.from(event.target.files)

    setIsUploading(true)

    try {
      const uploaded = await Promise.all(files.map(readFileAsDataUrl))

      setNewFiles((current) => [...current, ...uploaded])
    } catch (error) {
      toast.error("Some files could not be uploaded.")
    } finally {
      setIsUploading(false)
    }

    event.target.value = ""
  }

  function handleRemoveExistingAttachment(index) {
    setExistingAttachments((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    )
  }

  function handleRemoveNewFile(index) {
    setNewFiles((currentFiles) =>
      currentFiles.filter(
        (_, fileIndex) => fileIndex !== index
      )
    )
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      return
    }

    onSubmit({
      type: "Material",
      title: title.trim(),
      topicId: topicId === "none" ? null : topicId,
      instructions: description.trim(),
      attachments: [...existingAttachments, ...newFiles],
    })
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Week 3 Reading List"
            autoFocus
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Topic
          </label>

          <Select value={topicId} onValueChange={setTopicId}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">No topic</SelectItem>

              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Add a short description for this material..."
            rows={5}
            className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Attachments
          </label>

          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed bg-gray-50 px-5 py-6 text-center hover:border-blue-300 hover:bg-blue-50">
            <div>
              <p className="text-sm font-medium text-blue-700">
                {isUploading ? "Uploading..." : "Add files"}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Select files from your computer
              </p>
            </div>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          {existingAttachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {existingAttachments.map((file, index) => (
                <div
                  key={`existing-${file.name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveExistingAttachment(index)}
                    className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {newFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              {newFiles.map((file, index) => (
                <div
                  key={`new-${file.name}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-lg border bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveNewFile(index)}
                    className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!title.trim()}
            className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? "Save changes" : "Post Material"}
          </button>
        </div>
      </form>
  )
}

export default MaterialForm
