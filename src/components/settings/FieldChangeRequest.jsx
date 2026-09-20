import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"

import { saveChangeRequest } from "@/lib/accountChangeRequestStorage"

function FieldChangeRequest({
  account,
  field,
  fieldLabel,
  currentValue,
  type = "text",
  options = [],
  pendingRequest,
  onRequested,
}) {
  const toast = useToast()

  const [showModal, setShowModal] = useState(false)
  const [requestedValue, setRequestedValue] = useState("")
  const [reason, setReason] = useState("")

  function handleOpen() {
    setRequestedValue("")
    setReason("")
    setShowModal(true)
  }

  function handleCancel() {
    setShowModal(false)
    setRequestedValue("")
    setReason("")
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!requestedValue.trim()) {
      toast.error(`Enter the ${fieldLabel.toLowerCase()} you'd like to use.`)
      return
    }

    if (requestedValue.trim() === currentValue) {
      toast.error(`That's already your current ${fieldLabel.toLowerCase()}.`)
      return
    }

    if (!reason.trim()) {
      toast.error("Please give the admin a reason for this change.")
      return
    }

    saveChangeRequest({
      accountId: account.id,
      accountName: account.name,
      role: account.role,
      field,
      fieldLabel,
      currentValue,
      requestedValue: requestedValue.trim(),
      reason: reason.trim(),
    })

    toast.success(`${fieldLabel} change request submitted.`)

    handleCancel()
    onRequested?.()
  }

  return (
    <div className="space-y-1.5">
      <Label>{fieldLabel}</Label>

      <Input
        value={currentValue || "Not set"}
        disabled
        className="h-10 bg-gray-100 font-medium text-gray-500"
      />

      {pendingRequest ? (
        <p className="mt-1 text-xs font-medium text-gray-400">
          Request pending — see "My Change Requests" below.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="mt-1 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          Request a change
        </button>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b bg-gray-50 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-950">
                Request {fieldLabel} Change
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                An admin will review this before it's applied.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  New {fieldLabel.toLowerCase()}
                </Label>

                {type === "select" ? (
                  <select
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    autoFocus
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  >
                    <option value="">Select {fieldLabel.toLowerCase()}</option>

                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={type}
                    value={requestedValue}
                    onChange={(e) => setRequestedValue(e.target.value)}
                    className="h-10"
                    autoFocus
                  />
                )}
              </div>

              <div className="mt-4 space-y-1.5">
                <Label className="text-xs">
                  Reason for the admin
                </Label>

                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why do you need this changed?"
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                >
                  Submit request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldChangeRequest
