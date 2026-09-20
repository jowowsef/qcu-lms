import { createContext, useCallback, useContext, useRef, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const ConfirmContext = createContext(null)

const DEFAULT_OPTIONS = {
  title: "Are you sure?",
  description: "",
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  destructive: false,
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const resolveRef = useRef(null)

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setState({ ...DEFAULT_OPTIONS, ...options })
    })
  }, [])

  function settle(result) {
    resolveRef.current?.(result)
    resolveRef.current = null
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog
        open={Boolean(state)}
        onOpenChange={(open) => {
          if (!open) {
            settle(false)
          }
        }}
      >
        {state && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>

              {state.description && (
                <AlertDialogDescription>
                  {state.description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => settle(false)}>
                {state.cancelLabel}
              </AlertDialogCancel>

              <AlertDialogAction
                variant={state.destructive ? "destructive" : "default"}
                onClick={() => settle(true)}
              >
                {state.confirmLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider")
  }

  return context
}
