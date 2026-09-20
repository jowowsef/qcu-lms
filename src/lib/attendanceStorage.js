const STORAGE_KEY = "qcu_lms_attendance"

export const ATTENDANCE_STATUSES = ["Present", "Absent", "Late", "Excused"]

function readAll() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const parsed = JSON.parse(saved)

    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error("Failed to load attendance:", error)

    return []
  }
}

function writeAll(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getAttendanceForClass(classId) {
  return readAll().filter((record) => record.classId === classId)
}

export function getAttendanceForDate(classId, date) {
  return readAll().filter(
    (record) => record.classId === classId && record.date === date
  )
}

export function getAttendanceForStudent(classId, studentId) {
  return readAll()
    .filter(
      (record) => record.classId === classId && record.studentId === studentId
    )
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getAttendanceDatesForClass(classId) {
  const dates = new Set(
    getAttendanceForClass(classId).map((record) => record.date)
  )

  return [...dates].sort((a, b) => b.localeCompare(a))
}

export function saveAttendance({ classId, date, studentId, status }) {
  const records = readAll()

  const existingIndex = records.findIndex(
    (record) =>
      record.classId === classId &&
      record.date === date &&
      record.studentId === studentId
  )

  const entry = {
    id:
      existingIndex >= 0
        ? records[existingIndex].id
        : `ATTENDANCE-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
    classId,
    date,
    studentId,
    status,
    markedAt: new Date().toISOString(),
  }

  if (existingIndex >= 0) {
    records[existingIndex] = entry
  } else {
    records.push(entry)
  }

  writeAll(records)

  return entry
}
