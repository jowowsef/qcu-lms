import { useEffect, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import { getCurrentAccount } from "@/lib/accountStorage"

import { getClassworkForClass } from "@/lib/classWorkStorage"
import { getTopicsForClass } from "@/lib/topicStorage"

import ClassworkCard from "@/pages/teacher/class/classwork/ClassworkCard"
import ClassworkDetail from "@/pages/student/class/classwork/ClassworkDetail"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

function Classwork({
  classData,
  initialItemId = null,
  openItem = null,
  onOpenItemHandled,
}) {
  const [classwork, setClasswork] = useState([])
  const [topics, setTopics] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [now] = useState(() => Date.now())
  const [topicFilter, setTopicFilter] = useState("all")
  const [collapsedTopics, setCollapsedTopics] = useState({})

  const student = getCurrentAccount()

  useEffect(() => {
    const classClasswork = getClassworkForClass(classData.id)

    setClasswork(classClasswork)
    setTopics(getTopicsForClass(classData.id))

    if (initialItemId) {
      const match = classClasswork.find((item) => item.id === initialItemId)

      if (match) {
        setSelectedItem(match)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData.id])

  useEffect(() => {
    if (openItem) {
      setSelectedItem(openItem)
      onOpenItemHandled?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openItem])

  function toggleTopic(topicId) {
    setCollapsedTopics((current) => ({
      ...current,
      [topicId]: !current[topicId],
    }))
  }

  if (selectedItem) {
    return (
      <ClassworkDetail
        item={selectedItem}
        student={student}
        onBack={() => setSelectedItem(null)}
      />
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-blue-950">
            Classwork
          </h2>

          {classwork.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {classwork.length}
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Assignments, activities, quizzes, and materials from your teacher.
        </p>
      </div>

      {topics.length > 0 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">
            Filter by topic
          </label>

          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              <SelectItem value="none">No topic</SelectItem>

              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {classwork.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="5" y="3" width="14" height="18" rx="2" />
              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />
            </svg>
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-800">
            Nothing posted yet
          </p>

          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Your teacher hasn't posted any classwork for this class yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {(topicFilter === "all" || topicFilter === "none") &&
            classwork.filter((item) => !item.topicId).length > 0 && (
              <div className="space-y-3">
                {classwork
                  .filter((item) => !item.topicId)
                  .map((item) => (
                    <ClassworkCard
                      key={item.id}
                      item={item}
                      now={now}
                      onOpen={setSelectedItem}
                    />
                  ))}
              </div>
            )}

          {topics
            .filter(
              (topic) => topicFilter === "all" || topicFilter === topic.id
            )
            .map((topic) => {
            const topicItems = classwork.filter(
              (item) => item.topicId === topic.id
            )

            if (topicItems.length === 0) {
              return null
            }

            const collapsed = Boolean(collapsedTopics[topic.id])

            return (
              <div key={topic.id} className="space-y-3">
                <button
                  type="button"
                  onClick={() => toggleTopic(topic.id)}
                  className="flex w-full items-center gap-2 border-b pb-2 text-left text-base font-bold text-gray-900 hover:text-blue-900"
                >
                  <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      collapsed ? "-rotate-90" : ""
                    }`}
                  />
                  {topic.name}
                  <span className="text-xs font-normal text-gray-400">
                    {topicItems.length}
                  </span>
                </button>

                {!collapsed &&
                  topicItems.map((item) => (
                    <ClassworkCard
                      key={item.id}
                      item={item}
                      now={now}
                      onOpen={setSelectedItem}
                    />
                  ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Classwork
