function formatDate(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

const STATUS_STYLES = {
  Pending: "bg-amber-100 text-amber-800",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
}

function ChangeRequestHistory({ requests }) {
  if (requests.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-red-600" />

          <div>
            <h2 className="text-sm font-semibold text-gray-950">
              My Change Requests
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Requests you've sent to the admin for your email or other account details.
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {requests.map((request) => (
          <div key={request.id} className="px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[request.status]}`}
              >
                {request.status}
              </span>

              <p className="text-sm font-semibold text-gray-900">
                {request.fieldLabel} change
              </p>

              <span className="text-xs text-gray-400">
                {formatDate(request.createdAt)}
              </span>
            </div>

            <p className="mt-1.5 text-sm text-gray-600">
              {request.currentValue || "Not set"} → {request.requestedValue}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Reason: {request.reason}
            </p>

            {request.status !== "Pending" && (
              <p className="mt-1.5 text-xs font-medium text-gray-600">
                {request.status === "Approved"
                  ? "Your change was applied."
                  : "This request was not approved."}
                {request.resolutionNote && ` — ${request.resolutionNote}`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChangeRequestHistory
