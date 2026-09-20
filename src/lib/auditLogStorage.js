const STORAGE_KEY = "qcu_lms_audit_logs"

export function getAuditLogs() {
  const savedLogs =
    localStorage.getItem(STORAGE_KEY)

  if (!savedLogs) {
    return []
  }

  try {
    const logs = JSON.parse(savedLogs)

    if (!Array.isArray(logs)) {
      return []
    }

    return logs
  } catch (error) {
    console.error(
      "Failed to load audit logs:",
      error
    )

    return []
  }
}

export function addAuditLog({
  action,
  details,
}) {
  const currentAccount =
    getCurrentAccountForAudit()

  const logs = getAuditLogs()

  const newLog = {
    id: `LOG-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`,

    adminId:
      currentAccount?.id || "Unknown",

    adminName:
      currentAccount?.name || "Unknown Admin",

    action,

    details,

    timestamp:
      new Date().toISOString(),
  }

  const updatedLogs = [
    newLog,
    ...logs,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedLogs)
  )

  return newLog
}

export function deleteAuditLog(id) {
  const logs = getAuditLogs()

  const updatedLogs = logs.filter(
    (log) => log.id !== id
  )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedLogs)
  )
}

function getCurrentAccountForAudit() {
  const savedAccount =
    localStorage.getItem(
      "qcu_lms_current_account"
    )

  if (!savedAccount) {
    return null
  }

  try {
    return JSON.parse(savedAccount)
  } catch {
    return null
  }
}
