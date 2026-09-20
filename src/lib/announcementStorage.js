const STORAGE_KEY = "qcu_lms_announcements"

export function getAnnouncements() {
  const savedAnnouncements =
    localStorage.getItem(STORAGE_KEY)

  if (!savedAnnouncements) {
    return []
  }

  try {
    const announcements = JSON.parse(
      savedAnnouncements
    )

    if (!Array.isArray(announcements)) {
      return []
    }

    return announcements
  } catch (error) {
    console.error(
      "Failed to load announcements:",
      error
    )

    return []
  }
}

export function saveAnnouncement(announcement) {
  const announcements = getAnnouncements()

  const newAnnouncement = {
    id: `ANN-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...announcement,
  }

  const updatedAnnouncements = [
    newAnnouncement,
    ...announcements,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAnnouncements)
  )

  return newAnnouncement
}

export function updateAnnouncement(
  id,
  updatedData
) {
  const announcements = getAnnouncements()

  const updatedAnnouncements =
    announcements.map((announcement) => {
      if (announcement.id !== id) {
        return announcement
      }

      return {
        ...announcement,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      }
    })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAnnouncements)
  )
}

export function deleteAnnouncement(id) {
  const announcements = getAnnouncements()

  const updatedAnnouncements =
    announcements.filter(
      (announcement) =>
        announcement.id !== id
    )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAnnouncements)
  )
}

export function getAnnouncementsForRole(role) {
  const announcements = getAnnouncements()

  return announcements.filter(
    (announcement) =>
      announcement.audience === "Everyone" ||
      announcement.audience === role
  )
}