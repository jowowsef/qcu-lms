import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"
import AdminSectionHeading from "@/components/admin/AdminSectionHeading"
import { addAuditLog } from "@/lib/auditLogStorage"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { saveAccount } from "@/lib/accountStorage"
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

function generatePassword(lastName, idNumber) {
  const cleanLastName = lastName
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 4)

  const cleanIdNumber = idNumber
    .replace(/[^0-9]/g, "")
    .slice(0, 2)

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

  let randomPart = ""

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(
      Math.random() * characters.length
    )

    randomPart += characters[randomIndex]
  }

  if (!cleanLastName && !cleanIdNumber) {
    return ""
  }

  return `${cleanLastName || "User"}${cleanIdNumber || "00"}!${randomPart}`
}

function CreateAccount() {
  const navigate = useNavigate()
  const toast = useToast()

  // STUDENT
  const [studentLastName, setStudentLastName] = useState("")
  const [studentFirstName, setStudentFirstName] = useState("")
  const [studentMiddleName, setStudentMiddleName] = useState("")
  const [studentCourse, setStudentCourse] = useState("")
  const [studentNumber, setStudentNumber] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [showStudentPassword, setShowStudentPassword] = useState(false)

  // TEACHER
  const [teacherLastName, setTeacherLastName] = useState("")
  const [teacherFirstName, setTeacherFirstName] = useState("")
  const [teacherMiddleName, setTeacherMiddleName] = useState("")
  const [teacherDepartment, setTeacherDepartment] = useState("")
  const [teacherNumber, setTeacherNumber] = useState("")
  const [teacherEmail, setTeacherEmail] = useState("")
  const [teacherPassword, setTeacherPassword] = useState("")
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)

  // ADMIN
  const [adminLastName, setAdminLastName] = useState("")
  const [adminFirstName, setAdminFirstName] = useState("")
  const [adminMiddleName, setAdminMiddleName] = useState("")
  const [adminDepartment, setAdminDepartment] = useState("")
  const [adminNumber, setAdminNumber] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  // Generate Student Password
  useEffect(() => {
    if (!studentLastName && !studentNumber) {
      setStudentPassword("")
      return
    }

    const newPassword = generatePassword(
      studentLastName,
      studentNumber
    )

    setStudentPassword(newPassword)
  }, [studentLastName, studentNumber])

  // Generate Teacher Password
  useEffect(() => {
    if (!teacherLastName && !teacherNumber) {
      setTeacherPassword("")
      return
    }

    const newPassword = generatePassword(
      teacherLastName,
      teacherNumber
    )

    setTeacherPassword(newPassword)
  }, [teacherLastName, teacherNumber])

  // Generate Admin Password
  useEffect(() => {
    if (!adminLastName && !adminNumber) {
      setAdminPassword("")
      return
    }

    const newPassword = generatePassword(
      adminLastName,
      adminNumber
    )

    setAdminPassword(newPassword)
  }, [adminLastName, adminNumber])

  function handleStudentSubmit(e) {
    e.preventDefault()

    const newAccount = {
      id: studentNumber,
      name: `${studentFirstName} ${studentMiddleName} ${studentLastName}`
        .replace(/\s+/g, " ")
        .trim(),
      role: "Student",
      course: studentCourse,
      email: studentEmail,
      password: studentPassword,
    }

    saveAccount(newAccount)

    addAuditLog({
      action: "Create Account",
      details: `Created Student account ${studentNumber}`,
    })

    toast.success("Student account created successfully!")

    navigate("/admin/accounts")
  }

  function handleTeacherSubmit(e) {
    e.preventDefault()

    const newAccount = {
      id: teacherNumber,
      name: `${teacherFirstName} ${teacherMiddleName} ${teacherLastName}`
        .replace(/\s+/g, " ")
        .trim(),
      role: "Teacher",
      department: teacherDepartment,
      email: teacherEmail,
      password: teacherPassword,
    }

    saveAccount(newAccount)

    addAuditLog({
      action: "Create Account",
      details: `Created Teacher account ${teacherNumber}`,
    })

    toast.success("Teacher account created successfully!")

    navigate("/admin/accounts")
  }

  function handleAdminSubmit(e) {
    e.preventDefault()

    const newAccount = {
      id: adminNumber,
      name: `${adminFirstName} ${adminMiddleName} ${adminLastName}`
        .replace(/\s+/g, " ")
        .trim(),
      role: "Admin",
      department: adminDepartment,
      email: adminEmail,
      password: adminPassword,
    }

    saveAccount(newAccount)

    addAuditLog({
      action: "Create Account",
      details: `Created Admin account ${adminNumber}`,
    })

    toast.success("Admin account created successfully!")

    navigate("/admin/accounts")
  }

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <AdminPageHeader
          title="Create account"
          description="Create a new QCU LMS account for a student, teacher, or administrator."
        />

        {/* Main Content */}
        <div className="w-full">

          <Tabs
            defaultValue="student"
            className="w-full"
          >

            {/* Role Tabs */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Account Type
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Select the type of account you want to create.
                </p>
              </div>

              <TabsList className="h-11 w-full rounded-lg border bg-gray-50 p-1 sm:w-fit">

                <TabsTrigger
                  value="student"
                  className="h-9 px-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm sm:px-6"
                >
                  Student
                </TabsTrigger>

                <TabsTrigger
                  value="teacher"
                  className="h-9 px-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm sm:px-6"
                >
                  Teacher
                </TabsTrigger>

                <TabsTrigger
                  value="admin"
                  className="h-9 px-3 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm sm:px-6"
                >
                  Admin
                </TabsTrigger>

              </TabsList>

            </div>

            {/* STUDENT */}
            <TabsContent value="student">

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                {/* Form Header */}
                <div className="flex items-center gap-4 border-b bg-blue-950 px-5 py-6 text-white sm:px-8 sm:py-7">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-base font-bold">
                    S
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Student account
                    </h2>

                    <p className="mt-0.5 text-sm text-blue-200">
                      Enter the student's personal and academic information.
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleStudentSubmit}
                  className="p-5 sm:p-8 lg:p-10"
                >

                  {/* Personal Information */}
                  <div className="mb-8">

                    <AdminSectionHeading
                      title="Personal information"
                      description="Enter the student's name."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                      <div className="space-y-2">
                        <Label htmlFor="student-last-name">
                          Last Name
                        </Label>

                        <Input
                          id="student-last-name"
                          name="studentLastName"
                          placeholder="Enter last name"
                          value={studentLastName}
                          onChange={(e) =>
                            setStudentLastName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-first-name">
                          First Name
                        </Label>

                        <Input
                          id="student-first-name"
                          name="studentFirstName"
                          placeholder="Enter first name"
                          value={studentFirstName}
                          onChange={(e) =>
                            setStudentFirstName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-middle-name">
                          Middle Name
                        </Label>

                        <Input
                          id="student-middle-name"
                          name="studentMiddleName"
                          placeholder="Enter middle name"
                          value={studentMiddleName}
                          onChange={(e) =>
                            setStudentMiddleName(e.target.value)
                          }
                          className="h-11"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="mb-8 border-t pt-8">

                    <AdminSectionHeading
                      title="Academic information"
                      description="Enter the student's course and ID number."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                      <div className="space-y-2">
                        <Label htmlFor="student-course">
                          Course
                        </Label>

                        <Select
                          value={studentCourse}
                          onValueChange={setStudentCourse}
                        >
                          <SelectTrigger id="student-course" className="h-11 w-full">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>

                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem key={course} value={course}>
                                {course}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="student-number">
                          Student Number
                        </Label>

                        <Input
                          id="student-number"
                          name="studentNumber"
                          placeholder="Enter student number"
                          value={studentNumber}
                          onChange={(e) =>
                            setStudentNumber(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="student-email">
                          Email
                        </Label>

                        <Input
                          id="student-email"
                          name="studentEmail"
                          type="email"
                          placeholder="Enter email address"
                          value={studentEmail}
                          onChange={(e) =>
                            setStudentEmail(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* Password */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6">

                    <div className="mb-4">
                      <h3 className="font-semibold text-blue-950">
                        Generated Password
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        This password is automatically generated from the student's information.
                      </p>
                    </div>

                    <div className="flex gap-3">

                      <Input
                        id="student-password"
                        type={
                          showStudentPassword
                            ? "text"
                            : "password"
                        }
                        value={studentPassword}
                        readOnly
                        tabIndex={-1}
                        className="pointer-events-none h-11 cursor-not-allowed bg-white"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 min-w-20 bg-white"
                        onClick={() =>
                          setShowStudentPassword(
                            !showStudentPassword
                          )
                        }
                      >
                        {showStudentPassword
                          ? "Hide"
                          : "Show"}
                      </Button>

                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                      The generated password will be securely
                      hashed before being stored when the backend
                      is implemented.
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end gap-3 border-t pt-6">

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigate("/admin/accounts")
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="bg-blue-900 px-7 hover:bg-blue-800"
                    >
                      Create Student Account
                    </Button>

                  </div>

                </form>

              </div>

            </TabsContent>

            {/* TEACHER */}
            <TabsContent value="teacher">

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                <div className="flex items-center gap-4 border-b bg-blue-950 px-5 py-6 text-white sm:px-8 sm:py-7">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-base font-bold">
                    T
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Teacher account
                    </h2>

                    <p className="mt-0.5 text-sm text-blue-200">
                      Enter the teacher's personal and professional information.
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleTeacherSubmit}
                  className="p-5 sm:p-8 lg:p-10"
                >

                  {/* Personal Information */}
                  <div className="mb-8">

                    <AdminSectionHeading
                      title="Personal information"
                      description="Enter the teacher's name."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                      <div className="space-y-2">
                        <Label htmlFor="teacher-last-name">
                          Last Name
                        </Label>

                        <Input
                          id="teacher-last-name"
                          name="teacherLastName"
                          placeholder="Enter last name"
                          value={teacherLastName}
                          onChange={(e) =>
                            setTeacherLastName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-first-name">
                          First Name
                        </Label>

                        <Input
                          id="teacher-first-name"
                          name="teacherFirstName"
                          placeholder="Enter first name"
                          value={teacherFirstName}
                          onChange={(e) =>
                            setTeacherFirstName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-middle-name">
                          Middle Name
                        </Label>

                        <Input
                          id="teacher-middle-name"
                          name="teacherMiddleName"
                          placeholder="Enter middle name"
                          value={teacherMiddleName}
                          onChange={(e) =>
                            setTeacherMiddleName(e.target.value)
                          }
                          className="h-11"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Professional Information */}
                  <div className="mb-8 border-t pt-8">

                    <AdminSectionHeading
                      title="Professional information"
                      description="Enter the teacher's department and ID number."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                      <div className="space-y-2">
                        <Label htmlFor="teacher-department">
                          Department
                        </Label>

                        <Select
                          value={teacherDepartment}
                          onValueChange={setTeacherDepartment}
                        >
                          <SelectTrigger id="teacher-department" className="h-11 w-full">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>

                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="teacher-number">
                          Teacher Number
                        </Label>

                        <Input
                          id="teacher-number"
                          name="teacherNumber"
                          placeholder="Enter teacher number"
                          value={teacherNumber}
                          onChange={(e) =>
                            setTeacherNumber(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="teacher-email">
                          Email
                        </Label>

                        <Input
                          id="teacher-email"
                          name="teacherEmail"
                          type="email"
                          placeholder="Enter email address"
                          value={teacherEmail}
                          onChange={(e) =>
                            setTeacherEmail(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* Password */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6">

                    <div className="mb-4">
                      <h3 className="font-semibold text-blue-950">
                        Generated Password
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        This password is automatically generated from the teacher's information.
                      </p>
                    </div>

                    <div className="flex gap-3">

                      <Input
                        id="teacher-password"
                        type={
                          showTeacherPassword
                            ? "text"
                            : "password"
                        }
                        value={teacherPassword}
                        readOnly
                        tabIndex={-1}
                        className="pointer-events-none h-11 cursor-not-allowed bg-white"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 min-w-20 bg-white"
                        onClick={() =>
                          setShowTeacherPassword(
                            !showTeacherPassword
                          )
                        }
                      >
                        {showTeacherPassword
                          ? "Hide"
                          : "Show"}
                      </Button>

                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                      The generated password will be securely
                      hashed before being stored when the backend
                      is implemented.
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end gap-3 border-t pt-6">

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigate("/admin/accounts")
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="bg-blue-900 px-7 hover:bg-blue-800"
                    >
                      Create Teacher Account
                    </Button>

                  </div>

                </form>

              </div>

            </TabsContent>

            {/* ADMIN */}
            <TabsContent value="admin">

              <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                <div className="flex items-center gap-4 border-b bg-blue-950 px-5 py-6 text-white sm:px-8 sm:py-7">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-base font-bold">
                    A
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Admin account
                    </h2>

                    <p className="mt-0.5 text-sm text-blue-200">
                      Enter the administrator's personal and department information.
                    </p>
                  </div>

                </div>

                <form
                  onSubmit={handleAdminSubmit}
                  className="p-5 sm:p-8 lg:p-10"
                >

                  {/* Personal Information */}
                  <div className="mb-8">

                    <AdminSectionHeading
                      title="Personal information"
                      description="Enter the administrator's name."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

                      <div className="space-y-2">
                        <Label htmlFor="admin-last-name">
                          Last Name
                        </Label>

                        <Input
                          id="admin-last-name"
                          name="adminLastName"
                          placeholder="Enter last name"
                          value={adminLastName}
                          onChange={(e) =>
                            setAdminLastName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-first-name">
                          First Name
                        </Label>

                        <Input
                          id="admin-first-name"
                          name="adminFirstName"
                          placeholder="Enter first name"
                          value={adminFirstName}
                          onChange={(e) =>
                            setAdminFirstName(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-middle-name">
                          Middle Name
                        </Label>

                        <Input
                          id="admin-middle-name"
                          name="adminMiddleName"
                          placeholder="Enter middle name"
                          value={adminMiddleName}
                          onChange={(e) =>
                            setAdminMiddleName(e.target.value)
                          }
                          className="h-11"
                        />
                      </div>

                    </div>
                  </div>

                  {/* Administrative Information */}
                  <div className="mb-8 border-t pt-8">

                    <AdminSectionHeading
                      title="Administrative information"
                      description="Enter the administrator's department and ID number."
                    />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                      <div className="space-y-2">
                        <Label htmlFor="admin-department">
                          Department
                        </Label>

                        <Select
                          value={adminDepartment}
                          onValueChange={setAdminDepartment}
                        >
                          <SelectTrigger id="admin-department" className="h-11 w-full">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>

                          <SelectContent>
                            {adminDepartments.map((department) => (
                              <SelectItem key={department} value={department}>
                                {department}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin-number">
                          Admin Number
                        </Label>

                        <Input
                          id="admin-number"
                          name="adminNumber"
                          placeholder="Enter admin number"
                          value={adminNumber}
                          onChange={(e) =>
                            setAdminNumber(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin-email">
                          Email
                        </Label>

                        <Input
                          id="admin-email"
                          name="adminEmail"
                          type="email"
                          placeholder="Enter email address"
                          value={adminEmail}
                          onChange={(e) =>
                            setAdminEmail(e.target.value)
                          }
                          className="h-11"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* Password */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-6">

                    <div className="mb-4">
                      <h3 className="font-semibold text-blue-950">
                        Generated Password
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        This password is automatically generated from the administrator's information.
                      </p>
                    </div>

                    <div className="flex gap-3">

                      <Input
                        id="admin-password"
                        type={
                          showAdminPassword
                            ? "text"
                            : "password"
                        }
                        value={adminPassword}
                        readOnly
                        tabIndex={-1}
                        className="pointer-events-none h-11 cursor-not-allowed bg-white"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 min-w-20 bg-white"
                        onClick={() =>
                          setShowAdminPassword(
                            !showAdminPassword
                          )
                        }
                      >
                        {showAdminPassword
                          ? "Hide"
                          : "Show"}
                      </Button>

                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-gray-500">
                      The generated password will be securely
                      hashed before being stored when the backend
                      is implemented.
                    </p>

                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end gap-3 border-t pt-6">

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        navigate("/admin/accounts")
                      }
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      className="bg-blue-900 px-7 hover:bg-blue-800"
                    >
                      Create Admin Account
                    </Button>

                  </div>

                </form>

              </div>

            </TabsContent>

          </Tabs>

        </div>

      </div>
    </AdminLayout>
  )
}

export default CreateAccount

