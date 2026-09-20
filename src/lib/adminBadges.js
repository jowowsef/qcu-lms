export const ROLE_BADGE_STYLES = {
  Admin: "bg-blue-50 text-blue-900",
  Teacher: "bg-red-50 text-red-600",
  Student: "bg-gray-100 text-gray-700",
}

export const STATUS_BADGE_STYLES = {
  Active: "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
}

export function getRoleBadgeClass(role) {
  return ROLE_BADGE_STYLES[role] || "bg-gray-100 text-gray-700"
}

export function getStatusBadgeClass(status) {
  return STATUS_BADGE_STYLES[status] || "bg-red-50 text-red-600"
}
