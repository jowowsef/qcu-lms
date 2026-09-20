import { useEffect, useMemo, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  getEventsForClass,
  saveCalendarEvent,
  deleteCalendarEvent,
} from "@/lib/calendarStorage"

import { useConfirm } from "@/components/ui/confirm-dialog"

const UPCOMING_WINDOW_DAYS = 30

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

const EVENT_TYPES = [
  { value: "exam", label: "Exam", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
  { value: "deadline", label: "Deadline", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  { value: "activity", label: "Activity", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  { value: "other", label: "Other", dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100" },
]

function getEventType(value) {
  return EVENT_TYPES.find((type) => type.value === value) || EVENT_TYPES[EVENT_TYPES.length - 1]
}

function EventTypeTag({ type }) {
  const meta = getEventType(type)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.bg,
        meta.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  )
}

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function EventDayButton({ day, modifiers, eventsByDate, ...props }) {
  const dayEvents = eventsByDate.get(formatDateKey(day.date)) || []
  const visibleEvents = dayEvents.slice(0, 2)
  const overflowCount = dayEvents.length - visibleEvents.length

  return (
    <CalendarDayButton
      {...props}
      day={day}
      modifiers={modifiers}
      className={cn(
        "aspect-auto h-full min-h-24 w-full flex-col items-stretch justify-start gap-1 rounded-none border-0 p-1.5 text-left align-top hover:bg-blue-50/60",
        "data-[selected-single=true]:bg-blue-50 data-[selected-single=true]:ring-1 data-[selected-single=true]:ring-inset data-[selected-single=true]:ring-blue-400 data-[selected-single=true]:hover:bg-blue-50"
      )}
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-gray-700",
          modifiers.today && "bg-blue-600 font-semibold text-white",
          modifiers.outside && "text-gray-300"
        )}
      >
        {day.date.getDate()}
      </span>

      {visibleEvents.length > 0 && (
        <div className="flex w-full min-w-0 flex-col gap-0.5">
          {visibleEvents.map((event) => (
            <span
              key={event.id}
              className={cn(
                "truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight font-medium",
                getEventType(event.type).bg,
                getEventType(event.type).text
              )}
            >
              {event.title}
            </span>
          ))}

          {overflowCount > 0 && (
            <span className="px-1 text-[10px] font-medium text-gray-400">
              +{overflowCount} more
            </span>
          )}
        </div>
      )}
    </CalendarDayButton>
  )
}

function CalendarTab({ classData, role = "teacher" }) {
  const canManage = role === "teacher"

  const confirm = useConfirm()

  const [selectedDate, setSelectedDate] = useState(undefined)
  const [displayedMonth, setDisplayedMonth] = useState(() => new Date())
  const [events, setEvents] = useState([])
  const [eventTitle, setEventTitle] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [eventType, setEventType] = useState("activity")
  const [eventDescription, setEventDescription] = useState("")
  const [todayString] = useState(() => formatDateKey(new Date()))
  const [tomorrowString] = useState(() =>
    formatDateKey(new Date(Date.now() + 86400000))
  )
  const [upcomingWindowEnd] = useState(() =>
    formatDateKey(new Date(Date.now() + UPCOMING_WINDOW_DAYS * 86400000))
  )

  useEffect(() => {
    setEvents(getEventsForClass(classData.id))
  }, [classData.id])

  function formatDisplayDate(dateString) {
    if (!dateString) {
      return ""
    }

    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day)

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const selectedDateString = selectedDate ? formatDateKey(selectedDate) : null

  const selectedDateEvents = selectedDate
    ? events.filter((event) => event.date === selectedDateString)
    : []

  const upcomingEvents = [...events]
    .filter((event) => event.date >= todayString && event.date <= upcomingWindowEnd)
    .sort((a, b) =>
      `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`)
    )

  const eventsByDate = useMemo(() => {
    const map = new Map()

    for (const event of [...events].sort((a, b) =>
      `${a.time || ""}`.localeCompare(`${b.time || ""}`)
    )) {
      const dayEvents = map.get(event.date) || []
      dayEvents.push(event)
      map.set(event.date, dayEvents)
    }

    return map
  }, [events])

  function goToPreviousMonth() {
    setDisplayedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    )
  }

  function goToNextMonth() {
    setDisplayedMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    )
  }

  function handleJumpToEvent(dateString) {
    const [year, month, day] = dateString.split("-").map(Number)
    const date = new Date(year, month - 1, day)

    setSelectedDate(date)
    setDisplayedMonth(date)

    document
      .getElementById("calendar-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleAddEvent(event) {
    event.preventDefault()

    if (!selectedDate || !eventTitle.trim()) {
      return
    }

    const newEvent = saveCalendarEvent({
      classId: classData.id,
      teacherId: classData.teacherId,
      title: eventTitle.trim(),
      date: selectedDateString,
      time: eventTime,
      type: eventType,
      description: eventDescription.trim(),
    })

    setEvents((currentEvents) => [...currentEvents, newEvent])

    setEventTitle("")
    setEventTime("")
    setEventType("activity")
    setEventDescription("")
  }

  async function handleDeleteEvent(eventId) {
    const event = events.find((item) => item.id === eventId)

    const confirmed = await confirm({
      title: "Delete this event?",
      description: `"${event?.title || "This event"}" will be removed from the calendar.`,
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteCalendarEvent(eventId)

    setEvents((currentEvents) =>
      currentEvents.filter((item) => item.id !== eventId)
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-blue-950">Calendar</h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage events and important dates for this class.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Calendar */}
        <Card id="calendar-panel" className="min-w-0 scroll-mt-6 ring-1 ring-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-950">
              Class calendar
            </CardTitle>

            <CardDescription>
              {canManage
                ? "Select a date to view or add events."
                : "Select a date to view events."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Previous month"
                onClick={goToPreviousMonth}
                className="rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <Select
                  value={String(displayedMonth.getMonth())}
                  onValueChange={(value) =>
                    setDisplayedMonth(
                      (current) => new Date(current.getFullYear(), Number(value), 1)
                    )
                  }
                >
                  <SelectTrigger
                    aria-label="Select month"
                    className="h-9 w-auto min-w-36 justify-center border-none bg-transparent px-2 text-base font-semibold text-gray-900 shadow-none hover:bg-gray-100 focus-visible:ring-1 focus-visible:ring-blue-300"
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {MONTH_NAMES.map((name, index) => (
                      <SelectItem key={name} value={String(index)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-base font-semibold text-gray-900">
                  {displayedMonth.getFullYear()}
                </span>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Next month"
                onClick={goToNextMonth}
                className="rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-700"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                }
              }}
              month={displayedMonth}
              onMonthChange={setDisplayedMonth}
              className="w-full"
              classNames={{
                months: "w-full",
                month: "w-full",
                nav: "hidden",
                month_caption: "hidden",
                weekday:
                  "flex-1 border-b border-gray-100 pb-2 text-center text-[11px] font-medium text-gray-400",
                week: "border-b border-gray-50 last:border-b-0",
                day: "aspect-auto min-h-24 border-r border-gray-50 p-0 align-top last:border-r-0",
              }}
              components={{
                DayButton: (props) => (
                  <EventDayButton {...props} eventsByDate={eventsByDate} />
                ),
              }}
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
              {EVENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", type.dot)} />
                  {type.label}
                </div>
              ))}
            </div>

            {/* Selected Date */}
            <div className="mt-6 border-t pt-5">
              {selectedDate && (
                <h3 className="text-base font-semibold text-gray-900">
                  {formatDisplayDate(selectedDateString)}
                </h3>
              )}

              <div className={selectedDate ? "mt-4" : ""}>
                {!selectedDate ? (
                  <div className="rounded-lg border border-dashed bg-gray-50 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      No date selected
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {canManage
                        ? "Pick a date above to view or add an event."
                        : "Pick a date above to view its events."}
                    </p>
                  </div>
                ) : selectedDateEvents.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-gray-50 px-5 py-8 text-center">
                    <p className="text-sm font-medium text-gray-600">
                      No events
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      There are no events scheduled for this date.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-start justify-between gap-4 rounded-lg border bg-gray-50 p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {event.title}
                          </p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <EventTypeTag type={event.type} />

                            {event.time && (
                              <span className="text-xs font-medium text-blue-700">
                                {event.time}
                              </span>
                            )}
                          </div>

                          {event.description && (
                            <p className="mt-2 text-xs leading-5 text-gray-500">
                              {event.description}
                            </p>
                          )}
                        </div>

                        {canManage && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Delete ${event.title}`}
                            onClick={() => handleDeleteEvent(event.id)}
                            className="shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side */}
        <div className="space-y-6">
          {/* Add Event */}
          {canManage && (
            <Card className="ring-1 ring-gray-200">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-950">
                  Add event
                </CardTitle>

                <CardDescription>
                  {selectedDate
                    ? `Adding to ${formatDisplayDate(selectedDateString)}`
                    : "Pick a date on the calendar to get started."}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="event-title">Event title</Label>

                    <Input
                      id="event-title"
                      value={eventTitle}
                      onChange={(event) => setEventTitle(event.target.value)}
                      placeholder="e.g. Class Discussion"
                      disabled={!selectedDate}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="event-time">Time</Label>

                    <Input
                      id="event-time"
                      type="time"
                      value={eventTime}
                      onChange={(event) => setEventTime(event.target.value)}
                      disabled={!selectedDate}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="event-type">Type</Label>

                    <Select
                      value={eventType}
                      onValueChange={setEventType}
                      disabled={!selectedDate}
                    >
                      <SelectTrigger id="event-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span className={cn("h-2 w-2 rounded-full", type.dot)} />
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="event-description">Description</Label>

                    <Textarea
                      id="event-description"
                      value={eventDescription}
                      onChange={(event) =>
                        setEventDescription(event.target.value)
                      }
                      placeholder="Optional description"
                      rows={4}
                      className="resize-none"
                      disabled={!selectedDate}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedDate}
                  >
                    Add event
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card className="ring-1 ring-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-950">
                Upcoming events
              </CardTitle>

              <CardDescription>
                Events in the next {UPCOMING_WINDOW_DAYS} days.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed bg-gray-50 px-5 py-8 text-center">
                  <p className="text-sm font-medium text-gray-600">
                    No upcoming events
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Your upcoming class events will appear here.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  {upcomingEvents.map((event) => {
                    const isToday = event.date === todayString
                    const isTomorrow = event.date === tomorrowString

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => handleJumpToEvent(event.date)}
                        className="w-full rounded-lg border bg-gray-50 p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-900">
                            {event.title}
                          </p>

                          {(isToday || isTomorrow) && (
                            <Badge className="shrink-0 bg-blue-50 text-blue-700">
                              {isToday ? "Today" : "Tomorrow"}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <EventTypeTag type={event.type} />

                          <span className="text-xs font-medium text-blue-700">
                            {formatDisplayDate(event.date)}
                            {event.time && ` • ${event.time}`}
                          </span>
                        </div>

                        {event.description && (
                          <p className="mt-2 text-xs leading-5 text-gray-500">
                            {event.description}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CalendarTab
