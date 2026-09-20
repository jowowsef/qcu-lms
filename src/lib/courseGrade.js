import { findGrade } from "@/lib/gradesStorage"
import { getSubmissionForStudent } from "@/lib/quizSubmissionStorage"

export function buildGradeColumns(classworkItems, manualItems) {
  const fromClasswork = classworkItems.map((item) => ({
    id: item.id,
    source: "classwork",
    title: item.title,
    type: item.type,
    points: item.points || 0,
    createdAt: item.createdAt,
  }))

  const fromManual = manualItems.map((item) => ({
    id: item.id,
    source: "manual",
    title: item.title,
    type: item.category,
    points: item.points || 0,
    createdAt: item.createdAt,
  }))

  return [...fromClasswork, ...fromManual].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  )
}

export function getCellValue(column, studentId, grades) {
  const entry = findGrade(grades, column.id, studentId)

  if (entry) {
    return { value: entry.score, isAuto: false }
  }

  if (column.source === "classwork" && column.type === "Quiz") {
    const submission = getSubmissionForStudent(column.id, studentId)

    if (submission) {
      return { value: String(submission.earnedPoints), isAuto: true }
    }
  }

  return { value: "", isAuto: false }
}

export function getCategoryAverage(breakdownItem, studentId, columns, grades) {
  let earned = 0
  let possible = 0

  columns
    .filter((column) => column.type === breakdownItem.label)
    .forEach((column) => {
      const { value } = getCellValue(column, studentId, grades)

      if (value !== "" && value !== null && value !== undefined) {
        earned += Number(value) || 0
        possible += Number(column.points) || 0
      }
    })

  return possible > 0 ? (earned / possible) * 100 : null
}

export function getCategoryContribution(breakdownItem, studentId, columns, grades) {
  const average = getCategoryAverage(breakdownItem, studentId, columns, grades)

  if (average === null) {
    return null
  }

  return average * ((Number(breakdownItem.weight) || 0) / 100)
}

export function getWeightedAverage(breakdown, studentId, columns, grades) {
  let weightedSum = 0
  let weightTotal = 0

  breakdown.forEach((item) => {
    const average = getCategoryAverage(item, studentId, columns, grades)

    if (average !== null) {
      weightedSum += average * (Number(item.weight) || 0)
      weightTotal += Number(item.weight) || 0
    }
  })

  return weightTotal > 0 ? weightedSum / weightTotal : null
}

export function getCourseGrade(studentId, columns, grades, weights) {
  const classStanding = getWeightedAverage(
    weights.classStandingBreakdown,
    studentId,
    columns,
    grades
  )

  const examination = getWeightedAverage(
    weights.examinationBreakdown,
    studentId,
    columns,
    grades
  )

  let weightedSum = 0
  let weightTotal = 0

  if (classStanding !== null) {
    weightedSum += classStanding * (Number(weights.classStandingWeight) || 0)
    weightTotal += Number(weights.classStandingWeight) || 0
  }

  if (examination !== null) {
    weightedSum += examination * (Number(weights.examinationWeight) || 0)
    weightTotal += Number(weights.examinationWeight) || 0
  }

  return {
    classStanding,
    examination,
    courseGrade: weightTotal > 0 ? weightedSum / weightTotal : null,
  }
}

export function getStudentItemTotal(columns, studentId, grades) {
  let earned = 0
  let possible = 0

  columns.forEach((column) => {
    const { value } = getCellValue(column, studentId, grades)

    if (value !== "" && value !== null && value !== undefined) {
      earned += Number(value) || 0
      possible += Number(column.points) || 0
    }
  })

  return possible > 0 ? Math.round((earned / possible) * 100) : null
}
