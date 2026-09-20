import { useEffect, useState } from "react"
import { ChevronDownIcon, Trash2Icon } from "lucide-react"

import { getCurrentAccount } from "@/lib/accountStorage"

import {
  getClassworkForClass,
  saveClasswork,
  updateClasswork,
  deleteClasswork,
} from "@/lib/classWorkStorage"

import {
  getTopicsForClass,
  saveTopic,
  deleteTopic,
} from "@/lib/topicStorage"

import AssignmentActivityForm from "@/pages/teacher/class/classwork/AssignmentActivityForm"
import QuizForm from "@/pages/teacher/class/classwork/QuizForm"
import MaterialForm from "@/pages/teacher/class/classwork/MaterialForm"
import ClassworkCard from "@/pages/teacher/class/classwork/ClassworkCard"
import ClassworkDetail from "@/pages/teacher/class/classwork/ClassworkDetail"
import ClassworkPanel from "@/components/classwork/ClassworkPanel"
import { Button } from "@/components/ui/button"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useConfirm } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

const PANEL_DESCRIPTIONS = {
  Assignment: "Create an assignment for this class.",
  Activity: "Create an in-class or take-home activity for this class.",
  Quiz: "Build a multiple-choice quiz for this class.",
  Material: "Share a resource with your students.",
}

const CREATE_OPTIONS = [
  {
    type: "Assignment",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6" />
        <path d="M9 11h6" />
      </>
    ),
  },
  {
    type: "Activity",
    icon: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  },
  {
    type: "Quiz",
    icon: (
      <>
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </>
    ),
  },
  {
    type: "Material",
    icon: (
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />
    ),
  },
]

function Classwork({
  classData,
  initialItemId = null,
  openItem = null,
  onOpenItemHandled,
}) {
  const [classwork, setClasswork] = useState([])
  const [topics, setTopics] = useState([])
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showAddTopic, setShowAddTopic] = useState(false)
  const [newTopicName, setNewTopicName] = useState("")
  const [topicFilter, setTopicFilter] = useState("all")
  const [collapsedTopics, setCollapsedTopics] = useState({})
  const [activeForm, setActiveForm] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [now] = useState(() => Date.now())
  const teacher = getCurrentAccount()
  const confirm = useConfirm()
  const toast = useToast()

  useEffect(() => {
    const classClasswork = getClassworkForClass(classData.id)

    setClasswork(classClasswork)
    setTopics(getTopicsForClass(classData.id))

    if (initialItemId) {
      const match = classClasswork.find(
        (item) => item.id === initialItemId
      )

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

  function handleOpenForm(type) {
    setShowCreateMenu(false)
    setEditingItem(null)
    setActiveForm(type)
  }

  function handleEdit(item) {
    setEditingItem(item)
    setActiveForm(item.type)
  }

  function handleCancelForm() {
    setActiveForm(null)
    setEditingItem(null)
  }

  function handleSubmit(classworkData) {
    if (editingItem) {
      const updatedItem = updateClasswork(editingItem.id, classworkData)

      setClasswork((current) =>
        current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      )

      if (selectedItem?.id === updatedItem.id) {
        setSelectedItem(updatedItem)
      }
    } else {
      const newItem = saveClasswork({
        classId: classData.id,
        teacherId: teacher?.id,
        teacherName: classData.teacherName,
        ...classworkData,
      })

      setClasswork((current) => [newItem, ...current])
    }

    setActiveForm(null)
    setEditingItem(null)
  }

  async function handleDelete(classworkId) {
    const item = classwork.find((entry) => entry.id === classworkId)

    const confirmed = await confirm({
      title: `Delete this ${(item?.type || "item").toLowerCase()}?`,
      description: `"${item?.title || "This item"}" will be permanently removed for you and your students.`,
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteClasswork(classworkId)

    setClasswork((current) =>
      current.filter((entry) => entry.id !== classworkId)
    )

    if (selectedItem?.id === classworkId) {
      setSelectedItem(null)
    }

    toast.success(`${item?.type || "Item"} deleted.`)
  }

  function handleAddTopic(event) {
    event.preventDefault()

    if (!newTopicName.trim()) {
      return
    }

    const newTopic = saveTopic({
      classId: classData.id,
      name: newTopicName.trim(),
    })

    setTopics((current) => [...current, newTopic])
    setNewTopicName("")
    setShowAddTopic(false)
  }

  async function handleDeleteTopic(topic) {
    const confirmed = await confirm({
      title: "Delete this topic?",
      description: `"${topic.name}" will be removed. Classwork posted under it will move back to no topic.`,
      confirmLabel: "Delete",
      destructive: true,
    })

    if (!confirmed) {
      return
    }

    deleteTopic(topic.id)

    classwork
      .filter((item) => item.topicId === topic.id)
      .forEach((item) => updateClasswork(item.id, { topicId: null }))

    setClasswork((current) =>
      current.map((item) =>
        item.topicId === topic.id ? { ...item, topicId: null } : item
      )
    )

    setTopics((current) => current.filter((entry) => entry.id !== topic.id))

    toast.success("Topic deleted.")
  }

  function toggleTopic(topicId) {
    setCollapsedTopics((current) => ({
      ...current,
      [topicId]: !current[topicId],
    }))
  }

  const editPanel = activeForm && (
    <ClassworkPanel
      eyebrow={editingItem ? `Edit ${activeForm}` : `Create ${activeForm}`}
      title={editingItem ? editingItem.title : `New ${activeForm}`}
      description={PANEL_DESCRIPTIONS[activeForm]}
      onClose={handleCancelForm}
      wide={activeForm === "Quiz"}
    >
      {(activeForm === "Assignment" || activeForm === "Activity") && (
        <AssignmentActivityForm
          type={activeForm}
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          topics={topics}
        />
      )}

      {activeForm === "Quiz" && (
        <QuizForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          topics={topics}
        />
      )}

      {activeForm === "Material" && (
        <MaterialForm
          initialData={editingItem}
          onSubmit={handleSubmit}
          onCancel={handleCancelForm}
          topics={topics}
        />
      )}
    </ClassworkPanel>
  )

  if (selectedItem) {
    return (
      <>
        <ClassworkDetail
          item={selectedItem}
          classData={classData}
          teacher={teacher}
          onBack={() => setSelectedItem(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />

        {editPanel}
      </>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Classwork Header */}

      <div className="flex items-start justify-between">
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
            Manage assignments, activities, quizzes, and materials.
          </p>
        </div>

        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setShowAddTopic((current) => !current)}
            className="rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            + Add topic
          </button>

          <div className="relative">
          <button
            type="button"
            onClick={() => setShowCreateMenu((current) => !current)}
            className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Create
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white py-1.5 shadow-lg">
              {CREATE_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleOpenForm(option.type)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-900"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    {option.icon}
                  </svg>
                  {option.type}
                </button>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {showAddTopic && (
        <form
          onSubmit={handleAddTopic}
          className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            value={newTopicName}
            onChange={(event) => setNewTopicName(event.target.value)}
            placeholder="e.g. Week 1"
            autoFocus
            className="flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddTopic(false)
                setNewTopicName("")
              }}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!newTopicName.trim()}
              className="rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </form>
      )}

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

      {editPanel}

      {/* Classwork List */}

      {classwork.length === 0 && topics.length === 0 ? (
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
            No classwork yet
          </p>

          <p className="mt-1 max-w-sm text-sm text-gray-400">
            Assignments, activities, quizzes, and materials you create will show up here.
          </p>

          <button
            type="button"
            onClick={() => handleOpenForm("Assignment")}
            className="mt-5 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Create assignment
          </button>
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

            const collapsed = Boolean(collapsedTopics[topic.id])

            return (
              <div key={topic.id} className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <button
                    type="button"
                    onClick={() => toggleTopic(topic.id)}
                    className="flex items-center gap-2 text-base font-bold text-gray-900 hover:text-blue-900"
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

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    title="Delete topic"
                    aria-label={`Delete ${topic.name}`}
                    onClick={() => handleDeleteTopic(topic)}
                    className="text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>

                {!collapsed && (
                  topicItems.length === 0 ? (
                    <p className="text-sm text-gray-400">Nothing posted here yet.</p>
                  ) : (
                    topicItems.map((item) => (
                      <ClassworkCard
                        key={item.id}
                        item={item}
                        now={now}
                        onOpen={setSelectedItem}
                      />
                    ))
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Classwork
