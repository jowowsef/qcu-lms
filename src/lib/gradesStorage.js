const STORAGE_KEY = "qcu_lms_grades"

export function getGrades() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const grades = JSON.parse(saved)

    return Array.isArray(grades) ? grades : []
  } catch (error) {
    console.error("Failed to load grades:", error)

    return []
  }
}

export function getGradesForClass(classId) {
  return getGrades().filter((grade) => grade.classId === classId)
}

export function findGrade(grades, itemId, studentId) {
  return (
    grades.find(
      (grade) =>
        grade.itemId === itemId && grade.studentId === studentId
    ) || null
  )
}

export function saveGrade({ classId, itemId, studentId, score }) {
  const grades = getGrades()

  const existing = grades.find(
    (grade) =>
      grade.itemId === itemId && grade.studentId === studentId
  )

  let updatedGrades

  if (existing) {
    updatedGrades = grades.map((grade) =>
      grade.id === existing.id
        ? { ...grade, score, updatedAt: new Date().toISOString() }
        : grade
    )
  } else {
    updatedGrades = [
      ...grades,
      {
        id: `GRADE-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        classId,
        itemId,
        studentId,
        score,
        updatedAt: new Date().toISOString(),
      },
    ]
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGrades))
}
