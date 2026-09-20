import { useState } from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button"

function sum(items) {
  return items.reduce((total, item) => total + (Number(item.weight) || 0), 0)
}

function WeightInput({ value, onChange, className = "" }) {
  return (
    <input
      type="number"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-16 rounded-md border bg-white px-2 py-1.5 text-right text-sm font-semibold outline-none focus:ring-2 ${className}`}
    />
  )
}

function ValidationLine({ total, label }) {
  const isValid = total === 100

  return (
    <p
      className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
        isValid ? "text-emerald-700" : "text-amber-700"
      }`}
    >
      {isValid ? (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 9v4M12 17h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      )}
      {isValid
        ? `${label} adds up to 100%`
        : `${label} adds up to ${total}% — should be 100%`}
    </p>
  )
}

function GradingScheme({ weights, onSave, onCancel }) {
  const [draft, setDraft] = useState(weights)

  const categoryTotal =
    (Number(draft.classStandingWeight) || 0) +
    (Number(draft.examinationWeight) || 0)

  const classStandingTotal = sum(draft.classStandingBreakdown)
  const isExaminationFlat = draft.examinationBreakdown.length === 1

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(weights)

  function updateCategoryWeight(key, value) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updateBreakdownItem(key, itemId, value) {
    setDraft((current) => ({
      ...current,
      [key]: current[key].map((item) =>
        item.id === itemId ? { ...item, weight: value } : item
      ),
    }))
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        Set how much each part of the course counts toward the final grade.
      </p>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Component</TableHead>
              <TableHead className="text-right">Weight</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Class Standing */}
            <TableRow className="bg-blue-50/50 hover:bg-blue-50/50">
              <TableCell
                rowSpan={draft.classStandingBreakdown.length + 1}
                className="align-top border-r border-blue-100 font-bold text-blue-900"
              >
                Class Standing
              </TableCell>

              <TableCell className="text-xs font-medium uppercase tracking-wide text-blue-700/70">
                Overall weight
              </TableCell>

              <TableCell className="text-right">
                <WeightInput
                  value={draft.classStandingWeight}
                  onChange={(value) =>
                    updateCategoryWeight("classStandingWeight", value)
                  }
                  className="border-blue-200 focus:ring-blue-200"
                />
              </TableCell>
            </TableRow>

            {draft.classStandingBreakdown.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-gray-700">{item.label}</TableCell>
                <TableCell className="text-right">
                  <WeightInput
                    value={item.weight}
                    onChange={(value) =>
                      updateBreakdownItem(
                        "classStandingBreakdown",
                        item.id,
                        value
                      )
                    }
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Examination */}
            <TableRow className="bg-red-50/50 hover:bg-red-50/50">
              <TableCell className="border-r border-red-100 font-bold text-red-800">
                Examination
              </TableCell>

              <TableCell className="text-gray-700">
                {isExaminationFlat
                  ? draft.examinationBreakdown[0].label
                  : "Overall weight"}
              </TableCell>

              <TableCell className="text-right">
                <WeightInput
                  value={draft.examinationWeight}
                  onChange={(value) =>
                    updateCategoryWeight("examinationWeight", value)
                  }
                  className="border-red-200 focus:ring-red-200"
                />
              </TableCell>
            </TableRow>

            {!isExaminationFlat &&
              draft.examinationBreakdown.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-gray-700">{item.label}</TableCell>
                  <TableCell className="text-right">
                    <WeightInput
                      value={item.weight}
                      onChange={(value) =>
                        updateBreakdownItem(
                          "examinationBreakdown",
                          item.id,
                          value
                        )
                      }
                      className="border-gray-200 focus:border-red-500 focus:ring-red-100"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ValidationLine total={classStandingTotal} label="Class Standing breakdown" />
      <ValidationLine total={categoryTotal} label="Class Standing + Examination" />

      <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
        <Button
          type="button"
          variant="outline"
          className="h-10 px-5"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="button"
          disabled={!hasChanges}
          className="h-10 bg-blue-900 px-6 hover:bg-blue-800"
          onClick={() => onSave(draft)}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default GradingScheme
