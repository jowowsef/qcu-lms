import { useState } from "react"

import { formatFileSize } from "@/lib/classworkHelpers"
import { useToast } from "@/components/ui/toast"
import { useConfirm } from "@/components/ui/confirm-dialog"

import {
  getSubmissionForStudent,
  saveSubmission,
  deleteSubmission,
} from "@/lib/submissionStorage"

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
      })

    reader.onerror = () => reject(new Error(`Unable to read ${file.name}`))

    reader.readAsDataURL(file)
  })
}

function TurnIn({ item, classId, student }) {
  const toast = useToast()
  const confirm = useConfirm()

  const [submission, setSubmission] = useState(() =>
    getSubmissionForStudent(item.id, student.id)
  )

  const [pendingFiles, setPendingFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(event) {
    const files = Array.from(event.target.files)

    setIsUploading(true)

    try {
      const uploaded = await Promise.all(files.map(readFileAsDataUrl))

      setPendingFiles((current) => [...current, ...uploaded])
    } catch (error) {
      toast.error("Some files could not be uploaded.")
    } finally {
      setIsUploading(false)
    }

    event.target.value = ""
  }

  function handleRemovePendingFile(index) {
    setPendingFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    )
  }

  function handleTurnIn() {
    const newSubmission = saveSubmission({
      classworkId: item.id,
      classId,
      studentId: student.id,
      studentName: student.name,
      files: pendingFiles,
    })

    setSubmission(newSubmission)
    setPendingFiles([])
  }

  async function handleUnsubmit() {
    if (!submission) {
      return
    }

    const confirmed = await confirm({
      title: "Unsubmit your work?",
      description: "Your teacher will no longer see this as turned in until you submit again.",
      confirmLabel: "Unsubmit",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteSubmission(submission.id)
    setSubmission(null)
    toast.success("Submission removed.")
  }

  if (submission) {
    return (
      <div>
        <div className="flex items-center justify-between border-b border-gray-300 pb-4">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-emerald-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>

            <span className="text-sm font-semibold text-emerald-800">
              Turned in
            </span>
          </div>

          <button
            type="button"
            onClick={handleUnsubmit}
            className="text-xs font-medium text-gray-600 hover:text-red-600"
          >
            Unsubmit
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-600">
          Submitted{" "}
          {new Date(submission.submittedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>

        {submission.note && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
            {submission.note}
          </p>
        )}

        <div className="mt-3 space-y-2">
          {submission.files.map((file, index) => (
            <a
              key={`${file.name}-${index}`}
              href={file.data}
              download={file.name}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 hover:bg-white/70"
            >
              <span className="min-w-0 truncate text-sm font-medium text-gray-800">
                {file.name}
              </span>

              <span className="shrink-0 text-xs text-gray-400">
                {formatFileSize(file.size)}
              </span>
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-400 bg-white px-4 py-6 text-center hover:border-blue-400 hover:bg-blue-50">
        <div>
          <p className="text-sm font-medium text-blue-700">
            {isUploading ? "Uploading..." : "+ Add files"}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Attach your work (optional)
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

      {pendingFiles.length > 0 && (
        <div className="mt-3 space-y-2">
          {pendingFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5"
            >
              <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                {file.name}
              </p>

              <button
                type="button"
                onClick={() => handleRemovePendingFile(index)}
                className="shrink-0 text-xs font-medium text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleTurnIn}
        disabled={isUploading}
        className="mt-4 w-full rounded-full border border-gray-500 bg-transparent px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-white/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      >
        {pendingFiles.length === 0 ? "Mark as done" : "Turn in"}
      </button>
    </div>
  )
}

export default TurnIn
