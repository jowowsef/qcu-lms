import { useEffect, useMemo, useState } from "react"

import {
  ATTENDANCE_STATUSES,
  getAttendanceForDate,
  saveAttendance,
} from "@/lib/attendanceStorage"

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_STYLES = {
  Present: "bg-emerald-600 text-white border-emerald-600",
  Absent: "bg-red-600 text-white border-red-600",
  Late: "bg-amber-500 text-white border-amber-500",
  Excused: "bg-blue-600 text-white border-blue-600",
}

function Attendance({ classData }) {
  const students = classData.students || []

  const [date, setDate] = useState(todayIso)
  const [records, setRecords] = useState([])

  useEffect(() => {
    setRecords(getAttendanceForDate(classData.id, date))
  }, [classData.id, date])

  function statusFor(studentId) {
    return records.find((record) => record.studentId === studentId)?.status || null
  }

  function handleMark(studentId, status) {
    saveAttendance({ classId: classData.id, date, studentId, status })

    setRecords(getAttendanceForDate(classData.id, date))
  }

  const summary = useMemo(() => {
    const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 }

    records.forEach((record) => {
      if (counts[record.status] !== undefined) {
        counts[record.status] += 1
      }
    })

    return counts
  }, [records])

  if (students.length === 0) {
    return (
      <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-semibold text-gray-800">
          No students enrolled in this class yet
        </p>

        <p className="mt-1 text-sm text-gray-400">
          Share the class code so students can join, then come back here.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-blue-950">Attendance</h2>

          <p className="mt-1 text-sm text-gray-500">
            Mark attendance for each session.
          </p>
        </div>

        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
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

        <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-500">
          Unmarked {students.length - records.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Student
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((student) => {
              const status = statusFor(student.id)

              return (
                <tr
                  key={student.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.id}</p>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {ATTENDANCE_STATUSES.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleMark(student.id, option)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            status === option
                              ? STATUS_STYLES[option]
                              : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Attendance
