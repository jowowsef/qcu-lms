const STORAGE_KEY = "qcu_lms_quiz_submissions"

export function getQuizSubmissions() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const submissions = JSON.parse(saved)

    if (!Array.isArray(submissions)) {
      return []
    }

    return submissions
  } catch (error) {
    console.error(
      "Failed to load quiz submissions:",
      error
    )

    return []
  }
}

export function getSubmissionsForClasswork(classworkId) {
  return getQuizSubmissions().filter(
    (submission) =>
      submission.classworkId === classworkId
  )
}

export function getSubmissionForStudent(classworkId, studentId) {
  return (
    getQuizSubmissions().find(
      (submission) =>
        submission.classworkId === classworkId &&
        submission.studentId === studentId
    ) || null
  )
}

export function gradeQuiz(questions, answers) {
  let totalPoints = 0
  let earnedPoints = 0

  const results = questions.map((question) => {
    const points = Number(question.points) || 1

    totalPoints += points

    const selectedIndex = answers[question.id]

    const isCorrect =
      selectedIndex === question.correctIndex

    if (isCorrect) {
      earnedPoints += points
    }

    return {
      questionId: question.id,
      selectedIndex:
        selectedIndex === undefined
          ? null
          : selectedIndex,
      isCorrect,
    }
  })

  return { results, earnedPoints, totalPoints }
}

export function saveQuizSubmission(submissionData) {
  const submissions = getQuizSubmissions()

  const newSubmission = {
    id: `SUBMISSION-${Date.now()}`,
    submittedAt: new Date().toISOString(),
    ...submissionData,
  }

  const updatedSubmissions = [
    ...submissions,
    newSubmission,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedSubmissions)
  )

  return newSubmission
}
