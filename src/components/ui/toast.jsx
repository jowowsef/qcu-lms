import { createContext, useCallback, useContext, useRef, useState } from "react"

const ToastContext = createContext(null)

const VARIANTS = {
  success: {
    accent: "border-l-emerald-500",
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: <path d="M20 6 9 17l-5-5" />,
  },
  error: {
    accent: "border-l-red-500",
    iconWrap: "bg-red-50 text-red-600",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
  },
  info: {
    accent: "border-l-blue-600",
    iconWrap: "bg-blue-50 text-blue-700",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
  },
}

function ToastIcon({ variant }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {VARIANTS[variant].icon}
    </svg>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const show = useCallback(
    (message, variant, options = {}) => {
      const id = ++idRef.current
      const duration = options.duration ?? 4000

      setToasts((current) => [
        ...current,
        { id, message, variant, title: options.title },
      ])

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }

      return id
    },
    [dismiss]
  )

  const apiRef = useRef(null)

  if (!apiRef.current) {
    apiRef.current = {
      success: (message, options) => show(message, "success", options),
      error: (message, options) => show(message, "error", options),
      info: (message, options) => show(message, "info", options),
      dismiss,
    }
  }

  return (
    <ToastContext.Provider value={apiRef.current}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-20 z-[100] flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:right-4 sm:items-end sm:top-24">
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`animate-in slide-in-from-top-2 fade-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border-l-4 bg-white p-4 shadow-lg ring-1 ring-black/5 ${VARIANTS[item.variant].accent}`}
          >
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${VARIANTS[item.variant].iconWrap}`}
            >
              <ToastIcon variant={item.variant} />
            </span>

            <div className="min-w-0 flex-1">
              {item.title && (
                <p className="text-sm font-semibold text-gray-900">
                  {item.title}
                </p>
              )}

              <p className="text-sm leading-5 text-gray-600">{item.message}</p>
            </div>

            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="-mr-1 -mt-0.5 shrink-0 rounded-md p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
