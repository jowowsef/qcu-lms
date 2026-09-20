import { formatFileSize } from "@/lib/classworkHelpers"
import { openFile, downloadFile } from "@/lib/filePreview"
import { useToast } from "@/components/ui/toast"

function AttachmentList({ attachments }) {
  const toast = useToast()

  if (!attachments?.length) {
    return <p className="text-sm text-gray-500">No attachments.</p>
  }

  function handleOpenFile(file) {
    if (!file?.data) {
      toast.error("This attachment cannot be previewed.")
      return
    }

    const opened = openFile(file)

    if (!opened) {
      toast.error("Your browser blocked the new tab. Please allow pop-ups for this site.")
    }
  }

  return (
    <div className="space-y-4">
      {attachments.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex min-w-0 items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-blue-50">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-blue-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {formatFileSize(file.size)}
            </p>
          </div>

          {file.data ? (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => handleOpenFile(file)}
                className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
              >
                Open
              </button>

              <button
                type="button"
                onClick={() => downloadFile(file)}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Download
              </button>
            </div>
          ) : (
            <span
              className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-300"
              title="This file was uploaded before file previews were supported"
            >
              Unavailable
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export default AttachmentList
