const STORAGE_KEY = "qcu_lms_account_change_requests"

function readAll() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to load account change requests:", error)
    return []
  }
}

function writeAll(requests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests))
}

export function getChangeRequests() {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getChangeRequestsForAccount(accountId) {
  return readAll()
    .filter((request) => request.accountId === accountId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getPendingChangeRequests() {
  return getChangeRequests().filter(
    (request) => request.status === "Pending"
  )
}

export function getPendingRequestForField(accountId, field) {
  return (
    readAll().find(
      (request) =>
        request.accountId === accountId &&
        request.field === field &&
        request.status === "Pending"
    ) || null
  )
}

export function saveChangeRequest({
  accountId,
  accountName,
  role,
  field,
  fieldLabel,
  currentValue,
  requestedValue,
  reason,
}) {
  const requests = readAll()

  const newRequest = {
    id: `REQ-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    accountId,
    accountName,
    role,
    field,
    fieldLabel,
    currentValue,
    requestedValue,
    reason,
    status: "Pending",
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolutionNote: "",
    seenByAccount: true,
  }

  writeAll([newRequest, ...requests])

  return newRequest
}

export function resolveChangeRequest(id, { status, resolutionNote = "" }) {
  const requests = readAll()

  const updated = requests.map((request) =>
    request.id === id
      ? {
          ...request,
          status,
          resolutionNote,
          resolvedAt: new Date().toISOString(),
          seenByAccount: false,
        }
      : request
  )

  writeAll(updated)

  return updated.find((request) => request.id === id)
}

export function markRequestSeen(id) {
  const requests = readAll()

  const updated = requests.map((request) =>
    request.id === id ? { ...request, seenByAccount: true } : request
  )

  writeAll(updated)
}
