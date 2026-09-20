import { getCurrentAccount } from "@/lib/accountStorage"
import { getAttendanceForStudent } from "@/lib/attendanceStorage"

const STATUS_STYLES = {
  Present: "bg-emerald-50 text-emerald-700",
  Absent: "bg-red-50 text-red-700",
  Late: "bg-amber-50 text-amber-700",
  Excused: "bg-blue-50 text-blue-700",
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function Attendance({ classData }) {
  const student = getCurrentAccount()
  const records = getAttendanceForStudent(classData.id, student?.id)

  const summary = records.reduce(
    (counts, record) => {
      if (counts[record.status] !== undefined) {
        counts[record.status] += 1
      }
      return counts
    },
    { Present: 0, Absent: 0, Late: 0, Excused: 0 }
  )

  if (records.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-gray-800">
          No attendance recorded yet
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Your teacher hasn't marked attendance for this class yet.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-blue-950">Attendance</h2>

        <p className="mt-1 text-sm text-gray-500">
          Your attendance record for this class.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-600">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
          Present {summary.Present}
        </span>

        <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">
          Absent {summary.Absent}
        </span>

        <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
          Late {summary.Late}
        </span>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
          Excused {summary.Excused}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[360px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Date
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {[...records].reverse().map((record) => (
              <tr
                key={record.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="px-4 py-3 text-gray-800">
                  {formatDate(record.date)}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[record.status]}`}
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance
