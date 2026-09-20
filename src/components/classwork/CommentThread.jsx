import { useState } from "react"

import { getAccountById } from "@/lib/accountStorage"
import UserAvatar from "@/components/UserAvatar"

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function CommentThread({ comments, onPost, placeholder = "Write a comment..." }) {
  const [text, setText] = useState("")

  function handleSubmit(event) {
    event.preventDefault()

    if (!text.trim()) {
      return
    }

    onPost(text.trim())
    setText("")
  }

  return (
    <div>
      {comments.length > 0 && (
        <div className="mb-4 space-y-3">
          {comments.map((comment) => {
            const authorAccount = getAccountById(comment.authorId)

            return (
            <div key={comment.id} className="flex items-start gap-3">
              <UserAvatar
                src={authorAccount?.avatar}
                name={comment.authorName}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-900"
              />

              <div className="min-w-0 flex-1 rounded-lg bg-gray-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-900">
                    {comment.authorName}
                  </p>

                  <span className="text-[11px] text-gray-400">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-0.5 whitespace-pre-wrap text-sm text-gray-700">
                  {comment.text}
                </p>
              </div>
            </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </div>
  )
}

export default CommentThread
