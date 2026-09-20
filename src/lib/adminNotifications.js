import { getChangeRequests } from "@/lib/accountChangeRequestStorage"

export function getNotificationsForAdmin() {
  return getChangeRequests().map((request) => ({
    id: `request-${request.id}`,
    type: "request",
    status: request.status,
    title:
      request.status === "Pending"
        ? `${request.fieldLabel} change requested`
        : `${request.fieldLabel} change ${request.status.toLowerCase()}`,
    message: `${request.accountName} (${request.role}) wants to change ${request.fieldLabel.toLowerCase()} to "${request.requestedValue}".`,
    timestamp: request.createdAt,
  }))
}
