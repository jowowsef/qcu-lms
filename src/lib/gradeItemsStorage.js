const STORAGE_KEY = "qcu_lms_grade_items"

export function getGradeItems() {
  const saved = localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return []
  }

  try {
    const items = JSON.parse(saved)

    return Array.isArray(items) ? items : []
  } catch (error) {
    console.error("Failed to load grade items:", error)

    return []
  }
}

export function getGradeItemsForClass(classId) {
  return getGradeItems().filter(
    (item) => item.classId === classId
  )
}

export function saveGradeItem(itemData) {
  const items = getGradeItems()

  const newItem = {
    id: `GRADEITEM-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...itemData,
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([newItem, ...items])
  )

  return newItem
}

export function deleteGradeItem(id) {
  const items = getGradeItems()

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items.filter((item) => item.id !== id))
  )
}
