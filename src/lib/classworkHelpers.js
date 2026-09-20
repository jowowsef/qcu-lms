export const TYPE_LABELS = {
  Assignment: "Assignment",
  Activity: "Activity",
  Quiz: "Quiz",
  Material: "Material",
}

export function formatDisplayDate(dateString) {
  if (!dateString) {
    return ""
  }

  const [year, month, day] = dateString
    .split("-")
    .map(Number)

  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDueDate(item) {
  if (!item.dueDate) {
    return "No due date"
  }

  const date = formatDisplayDate(item.dueDate)

  if (item.dueTime) {
    return `${date}, ${item.dueTime}`
  }

  return date
}

export function formatFileSize(bytes) {
  if (!bytes) {
    return ""
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isPastDue(item, now = Date.now()) {
  if (!item.dueDate) {
    return false
  }

  const due = new Date(`${item.dueDate}T${item.dueTime || "23:59"}`)

  return now > due.getTime()
}

export function getUrgency(item, now) {
  if (item.type === "Material" || !item.dueDate) {
    return {
      label: null,
      bar: "bg-blue-600",
      icon: "bg-blue-50 text-blue-700",
      badge: "",
    }
  }

  const due = new Date(
    `${item.dueDate}T${item.dueTime || "23:59"}`
  )

  const diffHours = (due.getTime() - now) / (1000 * 60 * 60)

  if (diffHours < 0) {
    return {
      label: "Overdue",
      bar: "bg-red-600",
      icon: "bg-red-50 text-red-600",
      badge: "bg-red-50 text-red-700",
    }
  }

  if (diffHours <= 48) {
    return {
      label: "Due soon",
      bar: "bg-amber-500",
      icon: "bg-amber-50 text-amber-600",
      badge: "bg-amber-50 text-amber-700",
    }
  }

  return {
    label: null,
    bar: "bg-blue-600",
    icon: "bg-blue-50 text-blue-700",
    badge: "",
  }
}

export function readFileAsDataUrl(file) {
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

export function getQuizTotalPoints(questions) {
  return (questions || []).reduce(
    (total, question) =>
      total + (Number(question.points) || 1),
    0
  )
}
