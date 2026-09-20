const STORAGE_KEY = "qcu_lms_submissions"

export function getSubmissions() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const submissions = JSON.parse(saved)

    return Array.isArray(submissions) ? submissions : []
  } catch (error) {
    console.error("Failed to load submissions:", error)

    return []
  }
}

export function getSubmissionsForClasswork(classworkId) {
  return getSubmissions().filter(
    (submission) => submission.classworkId === classworkId
  )
}

export function getSubmissionForStudent(classworkId, studentId) {
  return (
    getSubmissions().find(
      (submission) =>
        submission.classworkId === classworkId &&
        submission.studentId === studentId
    ) || null
  )
}

export function saveSubmission({
  classworkId,
  classId,
  studentId,
  studentName,
  files,
  note,
}) {
  const submissions = getSubmissions()

  const existing = submissions.find(
    (submission) =>
      submission.classworkId === classworkId &&
      submission.studentId === studentId
  )

  const submissionData = {
    classworkId,
    classId,
    studentId,
    studentName,
    files,
    note,
    submittedAt: new Date().toISOString(),
  }

  let updatedSubmissions

  if (existing) {
    updatedSubmissions = submissions.map((submission) =>
      submission.id === existing.id
        ? { ...submission, ...submissionData }
        : submission
    )
  } else {
    updatedSubmissions = [
      ...submissions,
      {
        id: `SUBMISSION-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        ...submissionData,
      },
    ]
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubmissions))

  return existing
    ? updatedSubmissions.find((s) => s.id === existing.id)
    : updatedSubmissions[updatedSubmissions.length - 1]
}

export function deleteSubmission(id) {
  const submissions = getSubmissions()

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(submissions.filter((submission) => submission.id !== id))
  )
}
