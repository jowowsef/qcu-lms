import { useEffect, useState } from "react"

import { useNavigate, useLocation } from "react-router-dom"

import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

import { addAuditLog } from "@/lib/auditLogStorage"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Input } from "@/components/ui/input"

import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/components/ui/pagination"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  getAccounts,
  toggleAccountStatus,
} from "@/lib/accountStorage"

import { getRoleBadgeClass, getStatusBadgeClass } from "@/lib/adminBadges"

import { useConfirm } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

import AccountRequestsPanel from "@/components/admin/AccountRequestsPanel"
import { getPendingChangeRequests } from "@/lib/accountChangeRequestStorage"


const ACCOUNTS_PAGE_SIZE = 10

function AccountTable({
  data,
  onView,
  onEdit,
  onToggleStatus,
}) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [data.length])

  const totalPages = Math.max(
    1,
    Math.ceil(data.length / ACCOUNTS_PAGE_SIZE)
  )

  const safePage = Math.min(page, totalPages)

  const pagedData = data.slice(
    (safePage - 1) * ACCOUNTS_PAGE_SIZE,
    safePage * ACCOUNTS_PAGE_SIZE
  )

  const rangeStart = data.length === 0 ? 0 : (safePage - 1) * ACCOUNTS_PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * ACCOUNTS_PAGE_SIZE, data.length)

  return (
    <div className="overflow-hidden rounded-xl border">

      <Table>

        <TableHeader>

          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">

            <TableHead className="h-12 px-6 text-xs font-semibold text-gray-500">
              ID number
            </TableHead>

            <TableHead className="h-12 px-6 text-xs font-semibold text-gray-500">
              Name
            </TableHead>

            <TableHead className="h-12 px-6 text-xs font-semibold text-gray-500">
              Role
            </TableHead>

            <TableHead className="h-12 px-6 text-xs font-semibold text-gray-500">
              Status
            </TableHead>

            <TableHead className="h-12 px-6 text-xs font-semibold text-gray-500">
              Actions
            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {pagedData.map((account) => (

            <TableRow
              key={account.id}
              className="border-b transition hover:bg-blue-50/30"
            >

              <TableCell className="px-6 py-5 font-semibold text-gray-900">
                {account.id}
              </TableCell>

              <TableCell className="px-6 py-5">

                <div>

                  <p className="font-medium text-gray-900">
                    {account.name}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-400">
                    QCU LMS Account
                  </p>

                </div>

              </TableCell>

              <TableCell className="px-6 py-5">
                <Badge className={getRoleBadgeClass(account.role)}>
                  {account.role}
                </Badge>
              </TableCell>

              <TableCell className="px-6 py-5">
                <Badge className={getStatusBadgeClass(account.status)}>
                  {account.status}
                </Badge>
              </TableCell>

              <TableCell className="px-6 py-5">

                <div className="flex flex-wrap gap-2">

                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs font-medium"
                    onClick={() =>
                      onView(account)
                    }
                  >
                    View
                  </Button>

                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs font-medium"
                    onClick={() =>
                      onEdit(account)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    variant={
                      account.status === "Active"
                        ? "destructive"
                        : "default"
                    }
                    className="h-9 px-3 text-xs font-medium"
                    onClick={() =>
                      onToggleStatus(account)
                    }
                  >
                    {account.status === "Active"
                      ? "Deactivate"
                      : "Activate"}
                  </Button>

                </div>

              </TableCell>

            </TableRow>

          ))}

          {data.length === 0 && (

            <TableRow>

              <TableCell
                colSpan={5}
                className="h-36 px-6 text-center"
              >

                <div className="flex flex-col items-center justify-center">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    #
                  </div>

                  <p className="mt-3 font-medium text-gray-700">
                    No accounts found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Try changing your search or selected tab.
                  </p>

                </div>

              </TableCell>

            </TableRow>

          )}

        </TableBody>

      </Table>

      {data.length > 0 && (
        <div className="flex flex-col gap-3 border-t bg-gray-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Showing {rangeStart}–{rangeEnd} of {data.length} account
            {data.length !== 1 ? "s" : ""}
          </p>

          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

    </div>
  )
}


function Accounts() {

  const confirm = useConfirm()
  const toast = useToast()

  const [accounts, setAccounts] =
    useState([])

  const [searchTerm, setSearchTerm] =
    useState("")

  const [selectedAccount, setSelectedAccount] =
    useState(null)

  const [showPassword, setShowPassword] =
    useState(false)

  const [pendingRequestCount, setPendingRequestCount] =
    useState(0)

  const navigate = useNavigate()
  const location = useLocation()


  useEffect(() => {

    const savedAccounts =
      getAccounts()

    setAccounts(savedAccounts)

    setPendingRequestCount(
      getPendingChangeRequests().length
    )

  }, [])


  function handleView(account) {

    setSelectedAccount(account)

    setShowPassword(false)

    addAuditLog({
      action: "View Account",
      details: `Viewed account ${account.id} (${account.name})`,
    })
  }


  function closeAccountDetails() {

    setSelectedAccount(null)

    setShowPassword(false)

  }


  function handleEdit(account) {

    addAuditLog({
      action: "Edit Account",
      details: `Opened edit page for account ${account.id} (${account.name})`,
    })

    navigate(
      `/admin/accounts/edit/${account.id}`
    )

  }


  async function handleToggleStatus(account) {

    const action =
      account.status === "Active"
        ? "deactivate"
        : "activate"

    const confirmed = await confirm({
      title: `${action === "deactivate" ? "Deactivate" : "Activate"} this account?`,
      description: `${account.name} will ${action === "deactivate" ? "lose access to" : "regain access to"} the LMS.`,
      confirmLabel: action === "deactivate" ? "Deactivate" : "Activate",
      destructive: action === "deactivate",
    })

    if (!confirmed) {
      return
    }


    toggleAccountStatus(account.id)


    const updatedAccounts =
      getAccounts()

    setAccounts(updatedAccounts)


    if (
      selectedAccount?.id ===
      account.id
    ) {

      const updatedAccount =
        updatedAccounts.find(
          (item) =>
            item.id === account.id
        )

      setSelectedAccount(
        updatedAccount
      )

    }


    const actionName =
      account.status === "Active"
        ? "Deactivate Account"
        : "Activate Account"

    const actionDescription =
      account.status === "Active"
        ? `Deactivated account ${account.id} (${account.name})`
        : `Activated account ${account.id} (${account.name})`


    addAuditLog({
      action: actionName,
      details: actionDescription,
    })

    toast.success(`${account.name} was ${action}d.`)

  }


  function handleSearchChange(e) {

    setSearchTerm(e.target.value)

  }


  function handleSearchBlur() {

    const search =
      searchTerm.trim()

    if (!search) {
      return
    }

    addAuditLog({
      action: "Search Account",
      details: `Searched accounts for "${search}"`,
    })

  }


  const filteredAccounts =
    accounts.filter((account) => {

      const search =
        searchTerm.toLowerCase()

      return (
        account.id
          .toLowerCase()
          .includes(search) ||

        account.name
          .toLowerCase()
          .includes(search) ||

        account.role
          .toLowerCase()
          .includes(search)
      )

    })


  const students =
    filteredAccounts.filter(
      (account) =>
        account.role === "Student"
    )


  const teachers =
    filteredAccounts.filter(
      (account) =>
        account.role === "Teacher"
    )


  const admins =
    filteredAccounts.filter(
      (account) =>
        account.role === "Admin"
    )


  const activeAccounts =
    accounts.filter(
      (account) =>
        account.status === "Active"
    ).length


  return (

    <AdminLayout>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">

        <AdminPageHeader
          title="Accounts"
          description="Manage student, teacher, and administrator accounts."
          action={
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={() => navigate("/admin/accounts/create")}
            >
              Create account
            </Button>
          }
        />

        {/* Overview Cards */}

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card className="ring-1 ring-gray-200">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-medium text-gray-500">Total</p>

              <p className="mt-1.5 text-2xl font-bold text-gray-950">
                {accounts.length}
              </p>

              <p className="mt-1 text-xs text-gray-400">All accounts</p>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-gray-200">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-medium text-gray-500">Students</p>

              <p className="mt-1.5 text-2xl font-bold text-gray-950">
                {
                  accounts.filter(
                    (account) => account.role === "Student"
                  ).length
                }
              </p>

              <p className="mt-1 text-xs text-gray-400">Student accounts</p>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-gray-200">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-medium text-gray-500">Teachers</p>

              <p className="mt-1.5 text-2xl font-bold text-gray-950">
                {
                  accounts.filter(
                    (account) => account.role === "Teacher"
                  ).length
                }
              </p>

              <p className="mt-1 text-xs text-gray-400">Teacher accounts</p>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-gray-200">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-medium text-gray-500">Active</p>

              <p className="mt-1.5 text-2xl font-bold text-gray-950">
                {activeAccounts}
              </p>

              <p className="mt-1 text-xs text-gray-400">Currently active</p>
            </CardContent>
          </Card>
        </div>


        {/* Account Management */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          {/* Toolbar */}

          <div className="border-b px-6 py-6 lg:px-8">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-gray-950">
                Account Management
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View, edit, activate, or deactivate accounts.
              </p>

            </div>


            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              <Input
                placeholder="Search by ID number, name, or role..."
                className="h-11 w-full lg:max-w-md"
                value={searchTerm}
                onChange={
                  handleSearchChange
                }
                onBlur={
                  handleSearchBlur
                }
              />

              <p className="text-xs text-gray-400">
                {filteredAccounts.length} account
                {filteredAccounts.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

          </div>


          {/* Tabs and Tables */}

          <div className="p-4 sm:p-6 lg:p-8">

            <Tabs
              defaultValue={location.state?.tab || "all"}
              className="w-full"
            >

              <div className="-mx-1 overflow-x-auto px-1 pb-1">

                <TabsList className="h-11 w-max gap-1 rounded-lg border bg-gray-50 p-1">

                  <TabsTrigger
                    value="all"
                    className="h-9 flex-none px-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                  >
                    All
                  </TabsTrigger>

                  <TabsTrigger
                    value="students"
                    className="h-9 flex-none px-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                  >
                    Students
                  </TabsTrigger>

                  <TabsTrigger
                    value="teachers"
                    className="h-9 flex-none px-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                  >
                    Teachers
                  </TabsTrigger>

                  <TabsTrigger
                    value="admins"
                    className="h-9 flex-none px-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                  >
                    Admins
                  </TabsTrigger>

                  <TabsTrigger
                    value="requests"
                    className="h-9 flex-none px-4 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm"
                  >
                    Requests
                    {pendingRequestCount > 0 && (
                      <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {pendingRequestCount}
                      </span>
                    )}
                  </TabsTrigger>

                </TabsList>

              </div>


              <TabsContent
                value="all"
                className="mt-6"
              >

                <AccountTable
                  data={filteredAccounts}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={
                    handleToggleStatus
                  }
                />

              </TabsContent>


              <TabsContent
                value="students"
                className="mt-6"
              >

                <AccountTable
                  data={students}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={
                    handleToggleStatus
                  }
                />

              </TabsContent>


              <TabsContent
                value="teachers"
                className="mt-6"
              >

                <AccountTable
                  data={teachers}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={
                    handleToggleStatus
                  }
                />

              </TabsContent>


              <TabsContent
                value="admins"
                className="mt-6"
              >

                <AccountTable
                  data={admins}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggleStatus={
                    handleToggleStatus
                  }
                />

              </TabsContent>


              <TabsContent
                value="requests"
                className="mt-6"
              >

                <AccountRequestsPanel
                  onChange={() =>
                    setPendingRequestCount(
                      getPendingChangeRequests().length
                    )
                  }
                />

              </TabsContent>

            </Tabs>

          </div>

        </div>

      </div>


      {/* Account Details Modal */}

      {selectedAccount && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="bg-blue-950 px-7 py-7 text-white">

              <div className="flex items-start justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-lg font-bold">

                    {selectedAccount.avatar ? (
                      <img
                        src={selectedAccount.avatar}
                        alt={selectedAccount.name}
                        className="h-full w-full object-cover"
                      />
                    ) : selectedAccount.role ===
                    "Student"
                      ? "S"
                      : selectedAccount.role ===
                          "Teacher"
                        ? "T"
                        : "A"}

                  </div>

                  <div>

                    <h2 className="text-xl font-bold">
                      {selectedAccount.name}
                    </h2>

                    <p className="mt-1 text-sm text-blue-200">
                      {selectedAccount.role}, ID {selectedAccount.id}
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    closeAccountDetails
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-blue-200 transition hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>

              </div>

            </div>


            {/* Modal Content */}

            <div className="space-y-5 p-7">

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-xl border bg-gray-50 p-4">

                  <p className="text-xs font-medium text-gray-500">
                    ID number
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    {selectedAccount.id}
                  </p>

                </div>


                <div className="rounded-xl border bg-gray-50 p-4">

                  <p className="text-xs font-medium text-gray-500">
                    Status
                  </p>

                  <Badge className={`mt-2 ${getStatusBadgeClass(selectedAccount.status)}`}>
                    {selectedAccount.status}
                  </Badge>

                </div>

              </div>


              {selectedAccount.role ===
                "Student" && (

                <div className="rounded-xl border p-4">

                  <p className="text-xs font-medium text-gray-500">
                    Course
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {selectedAccount.course ||
                      "Not available"}
                  </p>

                </div>

              )}


              {(selectedAccount.role ===
                "Teacher" ||
                selectedAccount.role ===
                  "Admin") && (

                <div className="rounded-xl border p-4">

                  <p className="text-xs font-medium text-gray-500">
                    Department
                  </p>

                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {selectedAccount.department ||
                      "Not available"}
                  </p>

                </div>

              )}


              <div className="rounded-xl border p-4">

                <p className="text-xs font-medium text-gray-500">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-medium text-gray-900">
                  {selectedAccount.email ||
                    "Not available"}
                </p>

              </div>


              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                <p className="text-xs font-medium text-blue-900">
                  Password
                </p>

                <div className="mt-2 flex gap-3">

                  <Input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      selectedAccount.password ||
                      ""
                    }
                    readOnly
                    className="bg-white"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </Button>

                </div>

              </div>

            </div>


            {/* Modal Footer */}

            <div className="flex items-center justify-between border-t bg-gray-50 px-7 py-5">

              <Button
                variant={
                  selectedAccount.status ===
                  "Active"
                    ? "destructive"
                    : "default"
                }
                onClick={() =>
                  handleToggleStatus(
                    selectedAccount
                  )
                }
              >
                {selectedAccount.status ===
                "Active"
                  ? "Deactivate"
                  : "Activate"}
              </Button>

              <Button
                variant="outline"
                onClick={
                  closeAccountDetails
                }
              >
                Close
              </Button>

            </div>

          </div>

        </div>

      )}

    </AdminLayout>
  )
}

export default Accounts
