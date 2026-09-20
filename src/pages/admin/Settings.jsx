import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import AdminLayout from "@/components/AdminLayout"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import {
  getAccounts,
  getCurrentAccount,
  updateAccount,
  setCurrentAccount,
} from "@/lib/accountStorage"

import { addAuditLog } from "@/lib/auditLogStorage"
import { useToast } from "@/components/ui/toast"
import ProfilePictureUpload from "@/components/settings/ProfilePictureUpload"

const adminDepartments = [
  "Registrar",
  "Admission",
  "Accounting",
  "SPARD",
  "SASD",
]

function Settings() {
  const navigate = useNavigate()
  const toast = useToast()

  const [account, setAccount] = useState(null)

  const [firstName, setFirstName] = useState("")
  const [middleName, setMiddleName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")

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
      freshAccount.role !== "Admin"
    ) {
      navigate("/")
      return
    }

    setAccount(freshAccount)

    const nameParts = freshAccount.name
      ? freshAccount.name.trim().split(/\s+/)
      : []

    if (nameParts.length === 1) {
      setFirstName(nameParts[0] || "")
    }

    if (nameParts.length === 2) {
      setFirstName(nameParts[0] || "")
      setLastName(nameParts[1] || "")
    }

    if (nameParts.length >= 3) {
      setFirstName(nameParts[0] || "")

      setMiddleName(
        nameParts.slice(1, -1).join(" ")
      )

      setLastName(
        nameParts[nameParts.length - 1] || ""
      )
    }

    setEmail(freshAccount.email || "")
    setDepartment(freshAccount.department || "")
  }, [navigate])

  function handleProfileSubmit(e) {
    e.preventDefault()

    if (!account) {
      return
    }

    if (!firstName.trim()) {
      toast.error("First name is required.")
      return
    }

    if (!lastName.trim()) {
      toast.error("Last name is required.")
      return
    }

    if (!email.trim()) {
      toast.error("Email is required.")
      return
    }

    if (!department) {
      toast.error("Department is required.")
      return
    }

    const updatedName =
      `${firstName} ${middleName} ${lastName}`
        .replace(/\s+/g, " ")
        .trim()

    const updatedData = {
      name: updatedName,
      email: email.trim(),
      department,
    }

    updateAccount(account.id, updatedData)

    const updatedAccount = {
      ...account,
      ...updatedData,
    }

    setAccount(updatedAccount)
    setCurrentAccount(updatedAccount)

    addAuditLog({
      action: "Update Profile",
      details: `Updated admin profile ${account.id}`,
    })

    toast.success("Profile updated successfully!")
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

    addAuditLog({
      action: "Change Password",
      details: `Changed password for admin account ${account.id}`,
    })

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    toast.success("Password changed successfully!")
  }

  if (!account) {
    return null
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-7">

        {/* Page Header */}
        <div className="mb-7 flex items-start gap-3">
          <div className="mt-1 h-12 w-1 shrink-0 rounded-full bg-red-600" />

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950">
              Settings
            </h1>

            <p className="mt-1.5 text-sm text-gray-500">
              Manage your administrator account and security settings.
            </p>
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
                    Update your administrator profile information.
                  </p>
                </div>

              </div>

            </div>

            <form
              onSubmit={handleProfileSubmit}
              className="p-6"
            >

              <div className="mb-6 border-b border-gray-100 pb-6">
                <ProfilePictureUpload
                  name={account.name}
                  avatar={account.avatar}
                  onChange={handleAvatarChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Last Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">
                    Last Name
                  </Label>

                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    className="h-10"
                    required
                  />
                </div>

                {/* First Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">
                    First Name
                  </Label>

                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="h-10"
                    required
                  />
                </div>

                {/* Middle Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="middleName">
                    Middle Name
                  </Label>

                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) =>
                      setMiddleName(e.target.value)
                    }
                    className="h-10"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label htmlFor="department">
                    Department
                  </Label>

                  <select
                    id="department"
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value)
                    }
                    required
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
                  >
                    <option value="">
                      Select department
                    </option>

                    {adminDepartments.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Email */}
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="email">
                    Email
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter email address"
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
                  Save Profile
                </Button>

              </div>

            </form>
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
                    Basic information about your administrator account.
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
                navigate("/admin")
              }
            >
              Back to Dashboard
            </Button>

          </div>

        </div>
      </div>
    </AdminLayout>
  )
}

export default Settings