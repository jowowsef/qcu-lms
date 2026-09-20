const STORAGE_KEY = "qcu_lms_classes"

export function getClasses() {
  const savedClasses = localStorage.getItem(STORAGE_KEY)

  if (!savedClasses) {
    return []
  }

  try {
    const classes = JSON.parse(savedClasses)

    if (!Array.isArray(classes)) {
      return []
    }

    return classes.map((classItem) => ({
      ...classItem,
      students: classItem.students || [],
      invitedEmails: classItem.invitedEmails || [],
    }))
  } catch (error) {
    console.error(
      "Failed to load classes:",
      error
    )

    return []
  }
}

export function getClassesForTeacher(teacherId) {
  const classes = getClasses()

  return classes.filter(
    (classItem) =>
      classItem.teacherId === teacherId
  )
}

export function getClassesForStudent(studentId) {
  const classes = getClasses()

  return classes.filter((classItem) =>
    classItem.students.some(
      (student) => student.id === studentId
    )
  )
}

export function getClassById(id) {
  const classes = getClasses()

  return (
    classes.find(
      (classItem) => classItem.id === id
    ) || null
  )
}

export function saveClass(classData) {
  const classes = getClasses()

  const newClass = {
    id: `CLASS-${Date.now()}`,

    classCode:
      generateClassCode(),

    createdAt:
      new Date().toISOString(),

    invitedEmails: [],

    students: [],

    studentCount: 0,

    ...classData,
  }

  const updatedClasses = [
    newClass,
    ...classes,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedClasses)
  )

  return newClass
}

export function joinClassByCode(code, student) {
  const classes = getClasses()

  const normalizedCode = code.trim().toUpperCase()

  const targetClass = classes.find(
    (classItem) =>
      classItem.classCode === normalizedCode
  )

  if (!targetClass) {
    return { error: "No class found with that code." }
  }

  const alreadyJoined = targetClass.students.some(
    (existingStudent) =>
      existingStudent.id === student.id
  )

  if (alreadyJoined) {
    return { error: "You're already in this class." }
  }

  const updatedStudents = [
    ...targetClass.students,
    { id: student.id, name: student.name },
  ]

  updateClass(targetClass.id, {
    students: updatedStudents,
    studentCount: updatedStudents.length,
  })

  return {
    classItem: {
      ...targetClass,
      students: updatedStudents,
      studentCount: updatedStudents.length,
    },
  }
}

export function updateClass(
  id,
  updatedData
) {
  const classes = getClasses()

  const updatedClasses =
    classes.map((classItem) => {
      if (classItem.id !== id) {
        return classItem
      }

      return {
        ...classItem,
        ...updatedData,
      }
    })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedClasses)
  )
}

export function generateClassCode() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

  let code = ""

  for (let i = 0; i < 6; i++) {
    const randomIndex =
      Math.floor(
        Math.random() *
          characters.length
      )

    code += characters[randomIndex]
  }

  return code
}