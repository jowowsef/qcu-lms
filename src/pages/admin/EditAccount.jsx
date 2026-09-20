import { useEffect, useState } from "react"

import { useNavigate, useParams } from "react-router-dom"

import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"
import AdminSectionHeading from "@/components/admin/AdminSectionHeading"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { addAuditLog } from "@/lib/auditLogStorage"

import {
  getAccounts,
  updateAccount,
} from "@/lib/accountStorage"

import { useToast } from "@/components/ui/toast"

const courses = [
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

const departments = [
  "College of Computer Studies",
  "College of Education",
  "College of Engineering",
  "College of Business Administration",
]

const adminDepartments = [
  "Registrar",
  "Admission",
  "Accounting",
  "SPARD",
  "SASD",
]

function EditAccount() {
  const { id } = useParams()

  const navigate = useNavigate()
  const toast = useToast()

  const [account, setAccount] = useState(null)

  const [lastName, setLastName] = useState("")

  const [firstName, setFirstName] = useState("")

  const [middleName, setMiddleName] = useState("")

  const [course, setCourse] = useState("")

  const [department, setDepartment] = useState("")

  const [email, setEmail] = useState("")

  useEffect(() => {
    const accounts = getAccounts()

    const foundAccount = accounts.find(
      (item) => item.id === id
    )

    if (!foundAccount) {
      navigate("/admin/accounts")
      return
    }

    setAccount(foundAccount)

    const nameParts = foundAccount.name
      .trim()
      .split(" ")

    setFirstName(nameParts[0] || "")

    if (nameParts.length >= 3) {
      setMiddleName(
        nameParts.slice(1, -1).join(" ")
      )

      setLastName(
        nameParts[nameParts.length - 1]
      )
    } else if (nameParts.length === 2) {
      setLastName(nameParts[1])
    }

    setCourse(foundAccount.course || "")

    setDepartment(foundAccount.department || "")

    setEmail(foundAccount.email || "")
  }, [id, navigate])

  function handleSubmit(e) {
    e.preventDefault()

    const updatedData = {
      name: `${firstName} ${middleName} ${lastName}`
        .replace(/\s+/g, " ")
        .trim(),

      email,
    }

    if (account.role === "Student") {
      updatedData.course = course
    }

    if (
      account.role === "Teacher" ||
      account.role === "Admin"
    ) {
      updatedData.department = department
    }

    updateAccount(account.id, updatedData)
    addAuditLog({
  action: "Edit Account",
  details: `Edited account ${id}`,
})
    toast.success("Account updated successfully!")

    navigate("/admin/accounts")
  }

  if (!account) {
    return null
  }

  const roleInitial =
    account.role === "Student"
      ? "S"
      : account.role === "Teacher"
        ? "T"
        : "A"

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <AdminPageHeader
          title="Edit account"
          description="Update the information associated with this account."
        />

        {/* Account Card */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {/* Account Header */}

          <div className="bg-blue-950 px-5 py-6 text-white sm:px-8 sm:py-7 lg:px-10">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-lg font-bold">
                  {roleInitial}
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    {account.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-blue-200">
                    {account.role}, ID {account.id}
                  </p>
                </div>

              </div>

              <Badge
                className={`w-fit ${
                  account.status === "Active"
                    ? "bg-green-400/15 text-green-200"
                    : "bg-red-400/15 text-red-200"
                }`}
              >
                {account.status}
              </Badge>

            </div>

          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 lg:p-10"
          >

            {/* Personal Information */}

            <section className="mb-10">

              <AdminSectionHeading
                title="Personal information"
                description="Update the account holder's name."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                <div className="space-y-2">

                  <Label htmlFor="lastName">
                    Last Name
                  </Label>

                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    className="h-11"
                    required
                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="firstName">
                    First Name
                  </Label>

                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    className="h-11"
                    required
                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="middleName">
                    Middle Name
                  </Label>

                  <Input
                    id="middleName"
                    value={middleName}
                    onChange={(e) =>
                      setMiddleName(e.target.value)
                    }
                    className="h-11"
                  />

                </div>

              </div>

            </section>

            {/* Account Information */}

            <section className="mb-10 border-t pt-10">

              <AdminSectionHeading
                title="Account information"
                description="Update the academic or administrative information."
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                {/* Student Course */}

                {account.role === "Student" && (
                  <div className="space-y-2">

                    <Label htmlFor="course">
                      Course
                    </Label>

                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger id="course" className="h-11 w-full">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>

                      <SelectContent>
                        {courses.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                )}

                {/* Teacher Department */}

                {account.role === "Teacher" && (
                  <div className="space-y-2">

                    <Label htmlFor="teacher-department">
                      Department
                    </Label>

                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="teacher-department" className="h-11 w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        {departments.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                )}

                {/* Admin Department */}

                {account.role === "Admin" && (
                  <div className="space-y-2">

                    <Label htmlFor="admin-department">
                      Department
                    </Label>

                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger id="admin-department" className="h-11 w-full">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        {adminDepartments.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                )}

                {/* ID */}

                <div className="space-y-2">

                  <Label htmlFor="idNumber">
                    ID Number
                  </Label>

                  <Input
                    id="idNumber"
                    value={account.id}
                    disabled
                    className="h-11 bg-gray-100 font-medium text-gray-500"
                  />

                  <p className="text-xs text-gray-400">
                    ID numbers cannot be changed.
                  </p>

                </div>

                {/* Email */}

                <div className="space-y-2 md:col-span-2">

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
                    className="h-11"
                    required
                  />

                </div>

              </div>

            </section>

            {/* Actions */}

            <div className="flex flex-col-reverse gap-3 border-t pt-7 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() =>
                  navigate("/admin/accounts")
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="h-11 bg-blue-900 px-7 hover:bg-blue-800"
              >
                Save Changes
              </Button>

            </div>

          </form>

        </div>

      </div>
    </AdminLayout>
  )
}

export default EditAccount