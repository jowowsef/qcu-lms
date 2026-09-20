const STORAGE_KEY = "qcu_lms_calendar_events"

export function getCalendarEvents() {
  const savedEvents =
    localStorage.getItem(STORAGE_KEY)

  if (!savedEvents) {
    return []
  }

  try {
    const events =
      JSON.parse(savedEvents)

    if (!Array.isArray(events)) {
      return []
    }

    return events
  } catch (error) {
    console.error(
      "Failed to load calendar events:",
      error
    )

    return []
  }
}

export function getEventsForClass(classId) {
  const events =
    getCalendarEvents()

  return events.filter(
    (event) =>
      event.classId === classId
  )
}

export function saveCalendarEvent(eventData) {
  const events =
    getCalendarEvents()

  const newEvent = {
    id: `EVENT-${Date.now()}`,
    createdAt:
      new Date().toISOString(),
    ...eventData,
  }

  const updatedEvents = [
    ...events,
    newEvent,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedEvents)
  )

  return newEvent
}

export function deleteCalendarEvent(id) {
  const events =
    getCalendarEvents()

  const updatedEvents =
    events.filter(
      (event) =>
        event.id !== id
    )

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedEvents)
  )
}