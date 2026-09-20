import ClassworkTypeIcon from "@/components/classwork/ClassworkTypeIcon"

import {
  formatDueDate,
  formatDisplayDate,
  getUrgency,
  TYPE_LABELS,
} from "@/lib/classworkHelpers"

function ClassworkCard({ item, now, onOpen }) {
  const urgency = getUrgency(item, now)

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex w-full items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div
        className={`w-1 shrink-0 opacity-80 transition group-hover:opacity-100 ${urgency.bar}`}
      />

      <div className="min-w-0 flex-1 px-6 py-4">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition ${urgency.icon}`}
          >
            <ClassworkTypeIcon type={item.type} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {TYPE_LABELS[item.type] || item.type}
              </span>

              {urgency.label && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${urgency.badge}`}
                >
                  {urgency.label}
                </span>
              )}
            </div>

            <h3 className="break-words text-base font-semibold text-gray-900 transition group-hover:text-blue-900">
              {item.title}
            </h3>

            {item.instructions && (
              <p className="mt-1.5 line-clamp-2 max-w-3xl text-sm leading-6 text-gray-500">
                {item.instructions}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
              {item.type === "Material" ? (
                <span>
                  Posted {formatDisplayDate(item.createdAt?.slice(0, 10))}
                </span>
              ) : (
                <>
                  {item.type === "Quiz" && (
                    <>
                      <span className="font-medium text-gray-700">
                        {item.questions?.length || 0}{" "}
                        {item.questions?.length === 1 ? "question" : "questions"}
                      </span>

                      <span className="text-gray-300">&bull;</span>
                    </>
                  )}

                  <span className="font-medium text-gray-700">
                    {item.points || 0} pts
                  </span>

                  <span className="text-gray-300">&bull;</span>

                  <span>Due {formatDueDate(item)}</span>
                </>
              )}

              <span className="text-gray-300">&bull;</span>

              <span>{item.teacherName}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

export default ClassworkCard
