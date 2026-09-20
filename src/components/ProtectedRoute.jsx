import { Navigate } from "react-router-dom"
import {
  getCurrentAccount,
  getAccounts,
  clearCurrentAccount,
} from "@/lib/accountStorage"

function ProtectedRoute({ children, allowedRole }) {
  const currentAccount = getCurrentAccount()

  if (!currentAccount) {
    return <Navigate to="/" replace />
  }

  const accounts = getAccounts()

  const freshAccount = accounts.find(
    (account) => account.id === currentAccount.id
  )

  if (!freshAccount) {
    clearCurrentAccount()
    return <Navigate to="/" replace />
  }

  if (freshAccount.status === "Inactive") {
    clearCurrentAccount()
    return <Navigate to="/" replace />
  }

  if (
    allowedRole &&
    freshAccount.role !== allowedRole
  ) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute