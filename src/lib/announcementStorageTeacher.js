const STORAGE_KEY = "qcu_lms_teacher_announcements"

export function getTeacherAnnouncements() {
  const savedAnnouncements =
    localStorage.getItem(STORAGE_KEY)

  if (!savedAnnouncements) {
    return []
  }

  try {
    const announcements =
      JSON.parse(savedAnnouncements)

    if (!Array.isArray(announcements)) {
      return []
    }

    return announcements
  } catch (error) {
    console.error(
      "Failed to load teacher announcements:",
      error
    )

    return []
  }
}


export function getTeacherAnnouncementsForClass(
  classId
) {
  const announcements =
    getTeacherAnnouncements()

  return announcements.filter(
    (announcement) =>
      announcement.classId === classId
  )
}


export function saveTeacherAnnouncement(
  announcementData
) {
  const announcements =
    getTeacherAnnouncements()

  const newAnnouncement = {
    id: `TEACHER-ANNOUNCEMENT-${Date.now()}`,

    createdAt:
      new Date().toISOString(),

    ...announcementData,
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


export function deleteTeacherAnnouncement(
  id
) {
  const announcements =
    getTeacherAnnouncements()

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