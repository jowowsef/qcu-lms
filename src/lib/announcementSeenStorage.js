const STORAGE_KEY = "qcu_lms_announcement_seen"

function getSeenMap() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {}
  }

  try {
    const parsed = JSON.parse(saved)

    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch (error) {
    console.error("Failed to load announcement seen state:", error)

    return {}
  }
}

export function getLastSeenTimestamp(accountId) {
  return getSeenMap()[accountId] || null
}

export function setLastSeenTimestamp(accountId, timestamp) {
  const map = getSeenMap()

  map[accountId] = timestamp

  localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}
