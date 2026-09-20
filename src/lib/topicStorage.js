const STORAGE_KEY = "qcu_lms_topics"

export function getTopics() {
  const savedTopics = localStorage.getItem(STORAGE_KEY)

  if (!savedTopics) {
    return []
  }

  try {
    const topics = JSON.parse(savedTopics)

    return Array.isArray(topics) ? topics : []
  } catch (error) {
    console.error("Failed to load topics:", error)
    return []
  }
}

export function getTopicsForClass(classId) {
  return getTopics().filter((topic) => topic.classId === classId)
}

export function saveTopic({ classId, name }) {
  const topics = getTopics()

  const newTopic = {
    id: `TOPIC-${Date.now()}`,
    classId,
    name,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([...topics, newTopic]))

  return newTopic
}

export function deleteTopic(id) {
  const topics = getTopics()

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(topics.filter((topic) => topic.id !== id))
  )
}
