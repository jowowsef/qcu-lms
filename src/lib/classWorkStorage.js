const STORAGE_KEY = "qcu_lms_classwork"


export function getClasswork() {
  const savedClasswork =
    localStorage.getItem(STORAGE_KEY)

  if (!savedClasswork) {
    return []
  }

  try {
    const classwork =
      JSON.parse(savedClasswork)

    if (!Array.isArray(classwork)) {
      return []
    }

    return classwork

  } catch (error) {

    console.error(
      "Failed to load classwork:",
      error
    )

    return []
  }
}


export function getClassworkForClass(
  classId
) {
  const classwork =
    getClasswork()

  return classwork.filter(
    (item) =>
      item.classId === classId
  )
}


export function getClassworkForClasses(
  classIds
) {
  const classwork =
    getClasswork()

  return classwork.filter(
    (item) =>
      classIds.includes(item.classId)
  )
}


export function getClassworkById(id) {
  const classwork =
    getClasswork()

  return (
    classwork.find(
      (item) => item.id === id
    ) || null
  )
}


export function saveClasswork(
  classworkData
) {
  const classwork =
    getClasswork()

  const newClasswork = {

    id:
      `CLASSWORK-${Date.now()}`,

    createdAt:
      new Date().toISOString(),

    type:
      "Assignment",

    ...classworkData,
  }

  const updatedClasswork = [
    newClasswork,
    ...classwork,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedClasswork)
  )

  return newClasswork
}


export function updateClasswork(id, updatedData) {
  const classwork = getClasswork()

  const updatedClasswork = classwork.map((item) =>
    item.id === id
      ? {
          ...item,
          ...updatedData,
          updatedAt: new Date().toISOString(),
        }
      : item
  )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedClasswork)
  )

  return updatedClasswork.find((item) => item.id === id)
}


export function deleteClasswork(
  id
) {
  const classwork =
    getClasswork()

  const updatedClasswork =
    classwork.filter(
      (item) =>
        item.id !== id
    )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedClasswork)
  )
}