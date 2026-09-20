import { useEffect, useState } from "react"

import { updateAccount } from "@/lib/accountStorage"
import { addAuditLog } from "@/lib/auditLogStorage"

import {
  getChangeRequests,
  resolveChangeRequest,
} from "@/lib/accountChangeRequestStorage"

import { useConfirm } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

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

function AccountRequestsPanel({ onChange }) {
  const confirm = useConfirm()
  const toast = useToast()

  const [requests, setRequests] = useState([])

  useEffect(() => {
    setRequests(getChangeRequests())
  }, [])

  function refresh() {
    setRequests(getChangeRequests())
    onChange?.()
  }

  async function handleApprove(request) {
    const confirmed = await confirm({
      title: "Approve this change?",
      description: `${request.accountName}'s ${request.fieldLabel.toLowerCase()} will be updated to "${request.requestedValue}".`,
      confirmLabel: "Approve",
    })

    if (!confirmed) {
      return
    }

    updateAccount(request.accountId, {
      [request.field]: request.requestedValue,
    })

    resolveChangeRequest(request.id, { status: "Approved" })

    addAuditLog({
      action: "Approve Account Change",
      details: `Approved ${request.fieldLabel} change for ${request.accountId} (${request.accountName}): "${request.currentValue}" → "${request.requestedValue}"`,
    })

    refresh()
    toast.success(`${request.fieldLabel} change approved.`)
  }

  async function handleReject(request) {
    const confirmed = await confirm({
      title: "Reject this request?",
      description: `${request.accountName} will be notified that their ${request.fieldLabel.toLowerCase()} change was not approved.`,
      confirmLabel: "Reject",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    resolveChangeRequest(request.id, { status: "Rejected" })

    addAuditLog({
      action: "Reject Account Change",
      details: `Rejected ${request.fieldLabel} change request from ${request.accountId} (${request.accountName})`,
    })

    refresh()
    toast.success("Request rejected.")
  }

  const pendingRequests = requests.filter((r) => r.status === "Pending")
  const resolvedRequests = requests.filter((r) => r.status !== "Pending")

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-white px-6 py-14 text-center">
        <p className="text-sm font-medium text-gray-700">
          No change requests yet
        </p>

        <p className="mt-1 text-xs text-gray-400">
          When a teacher or student requests an email or department/course change, it'll show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Pending ({pendingRequests.length})
          </h3>

          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-amber-200 bg-amber-50/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES.Pending}`}>
                      Pending
                    </span>

                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                      {request.role}
                    </span>

                    <span className="text-xs text-gray-400">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {request.accountName}{" "}
                    <span className="font-normal text-gray-400">({request.accountId})</span>
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {request.fieldLabel}:{" "}
                    <span className="text-gray-500">{request.currentValue || "Not set"}</span>
                    {" → "}
                    <span className="font-semibold text-gray-900">{request.requestedValue}</span>
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Reason: {request.reason}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleReject(request)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprove(request)}
                    className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            History
          </h3>

          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="divide-y">
              {resolvedRequests.map((request) => (
                <div key={request.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[request.status]}`}>
                      {request.status}
                    </span>

                    <p className="text-sm font-semibold text-gray-900">
                      {request.accountName}
                      <span className="font-normal text-gray-400"> ({request.accountId})</span>
                    </p>

                    <span className="text-xs text-gray-400">
                      {formatDate(request.resolvedAt || request.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gray-600">
                    {request.fieldLabel}: {request.currentValue || "Not set"} → {request.requestedValue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AccountRequestsPanel
