import { getCellValue, getStudentItemTotal } from "@/lib/courseGrade"

const CATEGORY_BADGE_STYLES = {
  Assignment: "bg-blue-100 text-blue-700",
  Activity: "bg-purple-100 text-purple-700",
  Quiz: "bg-amber-100 text-amber-700",
  Project: "bg-emerald-100 text-emerald-700",
  Exam: "bg-red-100 text-red-700",
  "Attendance & Recitation": "bg-teal-100 text-teal-700",
}

const DEFAULT_BADGE_STYLE = "bg-gray-100 text-gray-600"

function GradeSheet({ columns, students, grades, onCellChange, onCellBlur, onDeleteItem }) {
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="sticky left-0 z-10 min-w-[200px] border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">
              Student
            </th>

            {columns.map((column) => (
              <th
                key={column.id}
                className="min-w-[140px] px-4 py-3 text-left font-semibold text-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      CATEGORY_BADGE_STYLES[column.type] || DEFAULT_BADGE_STYLE
                    }`}
                  >
                    {column.type}
                  </span>

                  {column.source === "manual" && (
                    <button
                      type="button"
                      onClick={() => onDeleteItem(column.id)}
                      className="text-gray-300 hover:text-red-600"
                      title="Remove manual item"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="mt-1 truncate font-medium text-gray-900">
                  {column.title}
                </p>

                <p className="text-xs font-normal text-gray-400">
                  {column.points} pts
                </p>
              </th>
            ))}

            <th className="min-w-[110px] px-4 py-3 text-right font-semibold text-gray-700">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => {
            const total = getStudentItemTotal(columns, student.id, grades)

            return (
              <tr
                key={student.id}
                className="border-b border-gray-100 last:border-0"
              >
                <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-2.5">
                  <p className="font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-400">{student.id}</p>
                </td>

                {columns.map((column) => {
                  const { value, isAuto } = getCellValue(
                    column,
                    student.id,
                    grades
                  )

                  return (
                    <td key={column.id} className="px-4 py-2.5">
                      <input
                        type="number"
                        min="0"
                        value={value}
                        onChange={(e) =>
                          onCellChange(column, student.id, e.target.value)
                        }
                        onBlur={() => onCellBlur(column, student.id)}
                        placeholder="—"
                        title={
                          isAuto
                            ? "Auto-filled from the student's quiz submission"
                            : undefined
                        }
                        className={`w-20 rounded-md border px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${
                          isAuto
                            ? "border-amber-200 bg-amber-50/60 text-amber-800"
                            : "border-gray-200"
                        }`}
                      />
                    </td>
                  )
                })}

                <td className="px-4 py-2.5 text-right font-semibold text-gray-900">
                  {total === null ? "—" : `${total}%`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default GradeSheet
