const STORAGE_KEY = "qcu_lms_grade_weights"

export const DEFAULT_WEIGHTS = {
  classStandingWeight: 60,
  examinationWeight: 40,
  classStandingBreakdown: [
    { id: "cs-activity", label: "Activity", weight: 20 },
    { id: "cs-assignment", label: "Assignment", weight: 10 },
    { id: "cs-quiz", label: "Quiz", weight: 10 },
    { id: "cs-project", label: "Project", weight: 30 },
    { id: "cs-attendance", label: "Attendance & Recitation", weight: 10 },
  ],
  examinationBreakdown: [
    { id: "ex-exam", label: "Exam", weight: 100 },
  ],
}

function getAllWeights() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {}
  }

  try {
    const parsed = JSON.parse(saved)

    return typeof parsed === "object" && parsed !== null ? parsed : {}
  } catch (error) {
    console.error("Failed to load grade weights:", error)

    return {}
  }
}

export function getGradeWeights(classId) {
  const all = getAllWeights()

  return all[classId] || DEFAULT_WEIGHTS
}

export function saveGradeWeights(classId, weights) {
  const all = getAllWeights()

  all[classId] = weights

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getAllBreakdownLabels(weights) {
  return [
    ...weights.classStandingBreakdown.map((item) => item.label),
    ...weights.examinationBreakdown.map((item) => item.label),
  ]
}
