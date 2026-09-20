const STORAGE_KEY_PREFIX = "qcu_lms_notifications_seen_"

export function getLastSeenAt(studentId) {
  return localStorage.getItem(`${STORAGE_KEY_PREFIX}${studentId}`) || null
}

export function markAllSeen(studentId) {
  const now = new Date().toISOString()

  localStorage.setItem(`${STORAGE_KEY_PREFIX}${studentId}`, now)

  return now
}
