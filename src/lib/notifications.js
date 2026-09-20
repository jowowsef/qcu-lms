import { getClassesForStudent } from "@/lib/classStorage"
import { getClassworkForClasses } from "@/lib/classWorkStorage"
import { getGrades } from "@/lib/gradesStorage"
import { getGradeItems } from "@/lib/gradeItemsStorage"
import { getClassComments, getPrivateComments } from "@/lib/commentStorage"
import { getSubmissionForStudent as getWorkSubmissionForStudent } from "@/lib/submissionStorage"
import { getSubmissionForStudent as getQuizSubmissionForStudent } from "@/lib/quizSubmissionStorage"
import { formatDueDate } from "@/lib/classworkHelpers"

const DUE_SOON_WINDOW_MS = 48 * 60 * 60 * 1000

export function getNotificationsForStudent(student) {
  if (!student) {
    return []
  }

  const classes = getClassesForStudent(student.id)
  const classIds = classes.map((classItem) => classItem.id)
  const classById = Object.fromEntries(
    classes.map((classItem) => [classItem.id, classItem])
  )

  const classwork = getClassworkForClasses(classIds)
  const classworkById = Object.fromEntries(
    classwork.map((item) => [item.id, item])
  )

  const gradeItemById = Object.fromEntries(
    getGradeItems()
      .filter((item) => classIds.includes(item.classId))
      .map((item) => [item.id, item])
  )

  const notifications = []

  getGrades()
    .filter(
      (grade) =>
        grade.studentId === student.id &&
        classIds.includes(grade.classId) &&
        grade.score !== "" &&
        grade.score !== null &&
        grade.score !== undefined
    )
    .forEach((grade) => {
      const item = classworkById[grade.itemId] || gradeItemById[grade.itemId]

      if (!item) {
        return
      }

      notifications.push({
        id: `grade-${grade.id}`,
        type: "grade",
        classId: grade.classId,
        classworkId: classworkById[grade.itemId] ? grade.itemId : null,
        title: `Grade posted: ${item.title}`,
        message: `You got ${grade.score} on ${item.title} in ${
          classById[grade.classId]?.className || "your class"
        }.`,
        timestamp: grade.updatedAt || new Date(0).toISOString(),
      })
    })

  classwork.forEach((item) => {
    getClassComments(item.id).forEach((comment) => {
      if (comment.authorId === student.id) {
        return
      }

      notifications.push({
        id: `comment-${comment.id}`,
        type: "comment",
        classId: item.classId,
        classworkId: item.id,
        title: `New class comment on ${item.title}`,
        message: `${comment.authorName}: ${comment.text}`,
        timestamp: comment.createdAt,
      })
    })

    getPrivateComments(item.id, student.id).forEach((comment) => {
      if (comment.authorId === student.id) {
        return
      }

      notifications.push({
        id: `private-${comment.id}`,
        type: "comment",
        classId: item.classId,
        classworkId: item.id,
        title: `New private comment on ${item.title}`,
        message: `${comment.authorName}: ${comment.text}`,
        timestamp: comment.createdAt,
      })
    })
  })

  const now = Date.now()

  classwork.forEach((item) => {
    if (item.type === "Material" || !item.dueDate) {
      return
    }

    const due = new Date(`${item.dueDate}T${item.dueTime || "23:59"}`)
    const diffMs = due.getTime() - now

    if (diffMs < 0 || diffMs > DUE_SOON_WINDOW_MS) {
      return
    }

    const isQuiz = item.type === "Quiz"

    const submission = isQuiz
      ? getQuizSubmissionForStudent(item.id, student.id)
      : getWorkSubmissionForStudent(item.id, student.id)

    if (submission) {
      return
    }

    notifications.push({
      id: `duesoon-${item.id}`,
      type: "due-soon",
      classId: item.classId,
      classworkId: item.id,
      title: `Due soon: ${item.title}`,
      message: `Due ${formatDueDate(item)} in ${
        classById[item.classId]?.className || "your class"
      }.`,
      timestamp: new Date(due.getTime() - DUE_SOON_WINDOW_MS).toISOString(),
    })
  })

  return notifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}
