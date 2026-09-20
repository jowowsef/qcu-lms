import { useEffect, useState } from "react"

import AdminLayout from "@/components/AdminLayout"
import AdminPageHeader from "@/components/admin/AdminPageHeader"

import { getAuditLogs } from "@/lib/auditLogStorage"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("All")

  useEffect(() => {
    setLogs(getAuditLogs())
  }, [])

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const actionTypes = ["All", ...new Set(logs.map((log) => log.action))]

  const filteredLogs = logs.filter((log) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      log.adminName.toLowerCase().includes(query) ||
      log.adminId.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query)

    const matchesAction =
      actionFilter === "All" || log.action === actionFilter

    return matchesSearch && matchesAction
  })

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <AdminPageHeader
          title="Audit Logs"
          description="Every action an administrator takes on QCU LMS is recorded here. Entries can't be edited or removed, so the history stays reliable."
        />

        <Card className="ring-1 ring-gray-200">
          <CardContent className="px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-gray-500">
                {logs.length} total log{logs.length !== 1 ? "s" : ""}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by admin, action, or details..."
                  className="h-9 sm:w-64"
                />

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {actionTypes.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border">
              {filteredLogs.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <h3 className="text-sm font-semibold text-gray-900">
                    No audit logs found
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {logs.length === 0
                      ? "Administrator activity will appear here."
                      : "Try changing your search or action filter."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                      <TableHead className="px-5 py-3 text-xs font-semibold text-gray-500">
                        Date &amp; time
                      </TableHead>

                      <TableHead className="px-5 py-3 text-xs font-semibold text-gray-500">
                        Administrator
                      </TableHead>

                      <TableHead className="px-5 py-3 text-xs font-semibold text-gray-500">
                        Action
                      </TableHead>

                      <TableHead className="px-5 py-3 text-xs font-semibold text-gray-500">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-gray-50">
                        <TableCell className="px-5 py-3.5 text-sm whitespace-nowrap text-gray-500">
                          {formatDate(log.timestamp)}
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">
                            {log.adminName}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {log.adminId}
                          </p>
                        </TableCell>

                        <TableCell className="px-5 py-3.5">
                          <Badge className="bg-blue-50 text-blue-800 hover:bg-blue-50">
                            {log.action}
                          </Badge>
                        </TableCell>

                        <TableCell className="min-w-[280px] px-5 py-3.5 text-sm leading-6 whitespace-normal text-gray-600">
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export default AuditLogs
