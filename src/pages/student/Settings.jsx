import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import StudentLayout from "@/components/StudentLayout"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import {
  getAccounts,
  getCurrentAccount,
  updateAccount,
  setCurrentAccount,
} from "@/lib/accountStorage"

import {
  getChangeRequestsForAccount,
  getPendingRequestForField,
  markRequestSeen,
} from "@/lib/accountChangeRequestStorage"

import FieldChangeRequest from "@/components/settings/FieldChangeRequest"
import ChangeRequestHistory from "@/components/settings/ChangeRequestHistory"
import ProfilePictureUpload from "@/components/settings/ProfilePictureUpload"

import { useToast } from "@/components/ui/toast"

const studentCourses = [
  "BSA",
  "BSECE",
  "BECEd",
  "BSEntrep",
  "BSMA",
  "BSIE",
  "BSCpE",
  "BSIT",
  "BSCS",
  "BSIS",
]

function Settings() {
  const navigate = useNavigate()
  const toast = useToast()

  const [account, setAccount] = useState(null)
  const [requests, setRequests] = useState([])

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const currentAccount = getCurrentAccount()

    if (!currentAccount) {
      navigate("/")
      return
    }

    const accounts = getAccounts()

    const freshAccount = accounts.find(
      (item) => item.id === currentAccount.id
    )

    if (
      !freshAccount ||
      freshAccount.role !== "Student"
    ) {
      navigate("/")
      return
    }

    setAccount(freshAccount)

    const accountRequests = getChangeRequestsForAccount(freshAccount.id)

    setRequests(accountRequests)

    const unseenResolved = accountRequests.filter(
      (request) => request.status !== "Pending" && !request.seenByAccount
    )

    unseenResolved.forEach((request) => {
      if (request.status === "Approved") {
        toast.success(
          `Your ${request.fieldLabel.toLowerCase()} change was approved and applied.`
        )
      } else {
        toast.error(
          `Your ${request.fieldLabel.toLowerCase()} change request was not approved.`
        )
      }

      markRequestSeen(request.id)
    })
  }, [navigate])

  function refreshRequests() {
    if (!account) {
      return
    }

    setRequests(getChangeRequestsForAccount(account.id))
  }

  function handleAvatarChange(avatar) {
    if (!account) {
      return
    }

    updateAccount(account.id, { avatar })

    const updatedAccount = { ...account, avatar }

    setAccount(updatedAccount)
    setCurrentAccount(updatedAccount)
  }

  function handlePasswordSubmit(e) {
    e.preventDefault()

    if (!account) {
      return
    }

    if (!currentPassword) {
      toast.error("Please enter your current password.")
      return
    }

    if (currentPassword !== account.password) {
      toast.error("Current password is incorrect.")
      return
    }

    if (!newPassword) {
      toast.error("Please enter a new password.")
      return
    }

    if (newPassword.length < 6) {
      toast.error(
        "New password must be at least 6 characters."
      )
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.")
      return
    }

    if (newPassword === currentPassword) {
      toast.error(
        "New password must be different from your current password."
      )
      return
    }

    updateAccount(account.id, {
      password: newPassword,
    })

    const updatedAccount = {
      ...account,
      password: newPassword,
    }

    setAccount(updatedAccount)
    setCurrentAccount(updatedAccount)

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    toast.success("Password changed successfully!")
  }

  if (!account) {
    return null
  }

  const pendingEmailRequest = getPendingRequestForField(account.id, "email")
  const pendingCourseRequest = getPendingRequestForField(account.id, "course")

  return (
    <StudentLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-7">

        {/* Page Header */}
        <div className="mb-7">
          <div className="flex items-start gap-3">

            <div className="mt-1 h-12 w-1 rounded-full bg-red-600" />

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-900">
                Student Portal
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-blue-950">
                Settings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your student account and security settings.
              </p>
            </div>

          </div>
        </div>

        <div className="space-y-5">

          {/* Profile Information */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-gray-50 px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="h-7 w-1 rounded-full bg-blue-900" />

                <div>
                  <h2 className="text-sm font-semibold text-gray-950">
                    Profile Information
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Your name is set by the admin. To change your email or course, submit a request below.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="mb-6 border-b border-gray-100 pb-6">
                <ProfilePictureUpload
                  name={account.name}
                  avatar={account.avatar}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Full Name (locked) */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Full Name</Label>

                  <Input
                    value={account.name}
                    disabled
                    className="h-10 bg-gray-100 font-medium text-gray-500"
                  />

                  <p className="text-xs text-gray-400">
                    Contact the admin directly if your name needs to be corrected.
                  </p>
                </div>

                {/* Email (request-based) */}
                <FieldChangeRequest
                  account={account}
                  field="email"
                  fieldLabel="Email"
                  type="email"
                  currentValue={account.email}
                  pendingRequest={pendingEmailRequest}
                  onRequested={refreshRequests}
                />

                {/* Course (request-based) */}
                <FieldChangeRequest
                  account={account}
                  field="course"
                  fieldLabel="Course"
                  type="select"
                  options={studentCourses}
                  currentValue={account.course}
                  pendingRequest={pendingCourseRequest}
                  onRequested={refreshRequests}
                />

              </div>

            </div>
          </div>

          {/* Account Information */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-gray-50 px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="h-7 w-1 rounded-full bg-red-600" />

                <div>
                  <h2 className="text-sm font-semibold text-gray-950">
                    Account Information
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Basic information about your student account.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* ID Number */}
                <div className="space-y-1.5">

                  <Label>
                    ID Number
                  </Label>

                  <Input
                    value={account.id}
                    disabled
                    className="h-10 bg-gray-100 font-medium text-gray-500"
                  />

                  <p className="text-xs text-gray-400">
                    ID numbers cannot be changed.
                  </p>

                </div>

                {/* Role */}
                <div className="space-y-1.5">

                  <Label>
                    Role
                  </Label>

                  <Input
                    value={account.role}
                    disabled
                    className="h-10 bg-gray-100 font-medium text-gray-500"
                  />

                </div>

                {/* Status */}
                <div className="space-y-1.5">

                  <Label>
                    Status
                  </Label>

                  <div className="flex h-10 items-center">

                    <span
                      className={
                        account.status === "Active"
                          ? "inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700"
                          : "inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700"
                      }
                    >
                      {account.status}
                    </span>

                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* My Change Requests */}
          <ChangeRequestHistory requests={requests} />

          {/* Change Password */}
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

            <div className="border-b bg-gray-50 px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="h-7 w-1 rounded-full bg-blue-900" />

                <div>
                  <h2 className="text-sm font-semibold text-gray-950">
                    Change Password
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                </div>

              </div>

            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="p-6"
            >

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* Current Password */}
                <div className="space-y-1.5">

                  <Label htmlFor="currentPassword">
                    Current Password
                  </Label>

                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(e.target.value)
                    }
                    placeholder="Enter current password"
                    className="h-10"
                    required
                  />

                </div>

                {/* New Password */}
                <div className="space-y-1.5">

                  <Label htmlFor="newPassword">
                    New Password
                  </Label>

                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    className="h-10"
                    required
                  />

                  <p className="text-xs text-gray-400">
                    Minimum of 6 characters.
                  </p>

                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">

                  <Label htmlFor="confirmPassword">
                    Confirm New Password
                  </Label>

                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    className="h-10"
                    required
                  />

                </div>

              </div>

              <div className="mt-6 flex justify-end border-t pt-5">

                <Button
                  type="submit"
                  className="h-10 bg-blue-900 px-6 hover:bg-blue-800"
                >
                  Change Password
                </Button>

              </div>

            </form>
          </div>

          {/* Back Button */}
          <div className="flex justify-start">

            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() =>
                navigate("/student")
              }
            >
              Back to Dashboard
            </Button>

          </div>

        </div>
      </div>
    </StudentLayout>
  )
}

export default Settings
