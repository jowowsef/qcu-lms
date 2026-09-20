import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { getAccounts, getCurrentAccount } from "@/lib/accountStorage"
import { getRoleBadgeClass, getStatusBadgeClass } from "@/lib/adminBadges"

function AdminDashboard() {
  const navigate = useNavigate()

  const [accounts, setAccounts] = useState([])
  const [currentAccount, setCurrentAccount] = useState(null)

  useEffect(() => {
    setAccounts(getAccounts())
    setCurrentAccount(getCurrentAccount())
  }, [])

  const studentCount = accounts.filter(
    (account) => account.role === "Student"
  ).length

  const teacherCount = accounts.filter(
    (account) => account.role === "Teacher"
  ).length

  const adminCount = accounts.filter(
    (account) => account.role === "Admin"
  ).length

  const activeCount = accounts.filter(
    (account) => account.status === "Active"
  ).length

  const recentAccounts = [...accounts].slice(-5).reverse()

  const stats = [
    { label: "Students", value: studentCount, hint: "Student accounts" },
    { label: "Teachers", value: teacherCount, hint: "Teacher accounts" },
    { label: "Administrators", value: adminCount, hint: "Admin accounts" },
    {
      label: "Total accounts",
      value: accounts.length,
      hint: `${activeCount} active`,
    },
  ]

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <AdminPageHeader
          title={
            currentAccount?.name
              ? `Welcome back, ${currentAccount.name}`
              : "Welcome back"
          }
          description="Here's an overview of QCU LMS accounts and recent activity."
          action={
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={() => navigate("/admin/accounts/create")}
            >
              Create account
            </Button>
          }
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="ring-1 ring-gray-200">
              <CardContent className="px-5 py-5">
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-950">
                  {stat.value}
                </p>

                <p className="mt-1.5 text-xs text-gray-400">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Accounts */}
        <Card className="mt-6 ring-1 ring-gray-200">
          <CardContent className="px-0 py-0">
            <div className="flex flex-col gap-3 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-950">
                  Recent accounts
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  The latest accounts created in the system.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => navigate("/admin/accounts")}
              >
                View all accounts
              </Button>
            </div>

            {recentAccounts.length === 0 ? (
              <div className="px-6 py-14 text-center text-sm text-gray-500">
                No accounts found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500">
                      ID number
                    </TableHead>

                    <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500">
                      Name
                    </TableHead>

                    <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500">
                      Role
                    </TableHead>

                    <TableHead className="px-6 py-3 text-xs font-semibold text-gray-500">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-3.5 text-sm font-semibold text-gray-900">
                        {account.id}
                      </TableCell>

                      <TableCell className="px-6 py-3.5 text-sm text-gray-700">
                        {account.name}
                      </TableCell>

                      <TableCell className="px-6 py-3.5">
                        <Badge className={getRoleBadgeClass(account.role)}>
                          {account.role}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-3.5">
                        <Badge className={getStatusBadgeClass(account.status)}>
                          {account.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
