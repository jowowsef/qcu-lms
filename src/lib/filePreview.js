function dataUrlToBlob(dataUrl) {
  try {
    const commaIndex = dataUrl.indexOf(",")

    if (commaIndex === -1) {
      return null
    }

    const metadata = dataUrl.slice(0, commaIndex)
    const base64Data = dataUrl.slice(commaIndex + 1)

    const mimeMatch = metadata.match(/^data:([^;,]+)(?:;[^;,]*)*;base64$/i)

    if (!mimeMatch) {
      return null
    }

    const mimeType = mimeMatch[1]
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)

    for (let index = 0; index < binaryString.length; index++) {
      bytes[index] = binaryString.charCodeAt(index)
    }

    return new Blob([bytes], { type: mimeType })
  } catch (error) {
    console.error("Failed to prepare attachment:", error)
    return null
  }
}

// Opens the file in a new tab using a blob: URL. Unlike building a blank
// window and injecting DOM content, navigating directly to a blob URL is
// natively handled by the browser (including mobile Safari/Chrome), so
// images, PDFs, etc. render without any extra markup.
export function openFile(file) {
  if (!file?.data) {
    return false
  }

  const blob = dataUrlToBlob(file.data)
  const url = blob ? URL.createObjectURL(blob) : file.data

  const opened = window.open(url, "_blank", "noopener")

  if (blob) {
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  return Boolean(opened)
}

// Triggers a download via a blob: URL rather than a data: URL. Mobile
// Safari (iOS/iPadOS) does not honor the `download` attribute on data:
// URIs, so downloads silently fail there; blob: URLs work reliably.
export function downloadFile(file) {
  if (!file?.data) {
    return false
  }

  const blob = dataUrlToBlob(file.data)
  const url = blob ? URL.createObjectURL(blob) : file.data

  const link = document.createElement("a")
  link.href = url
  link.download = file.name || "attachment"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  if (blob) {
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  return true
}
