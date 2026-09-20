import { useRef, useState } from "react"

import { useToast } from "@/components/ui/toast"

const MAX_SIZE_BYTES = 2 * 1024 * 1024

function ProfilePictureUpload({ name, avatar, onChange }) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [isUploading, setIsUploading] = useState(false)

  function handlePickFile() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]

    e.target.value = ""

    if (!file) {
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Please choose an image smaller than 2 MB.")
      return
    }

    setIsUploading(true)

    const reader = new FileReader()

    reader.onload = () => {
      setIsUploading(false)
      onChange(reader.result)
      toast.success("Profile picture updated!")
    }

    reader.onerror = () => {
      setIsUploading(false)
      toast.error("Couldn't read that image. Please try again.")
    }

    reader.readAsDataURL(file)
  }

  function handleRemove() {
    onChange(null)
    toast.success("Profile picture removed.")
  }

  return (
    <div className="flex items-center gap-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-2xl font-bold text-blue-900">
        {avatar ? (
          <img
            src={avatar}
            alt={name || "Profile picture"}
            className="h-full w-full object-cover"
          />
        ) : (
          name?.charAt(0)?.toUpperCase() || "?"
        )}
      </div>

      <div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePickFile}
            disabled={isUploading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "Uploading..." : "Change photo"}
          </button>

          {avatar && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Remove
            </button>
          )}
        </div>

        <p className="mt-1.5 text-xs text-gray-400">
          JPG, PNG, or GIF. Max 2 MB.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}

export default ProfilePictureUpload
