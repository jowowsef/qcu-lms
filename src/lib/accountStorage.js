const STORAGE_KEY = "qcu_lms_accounts"
const SESSION_KEY = "qcu_lms_current_account"

const defaultAccounts = [
  {
    id: "24-1234",
    name: "Juan Dela Cruz",
    role: "Student",
    status: "Active",
    password: "student123",
  },
  {
    id: "T-001",
    name: "Maria Santos",
    role: "Teacher",
    status: "Active",
    password: "teacher123",
  },
  {
    id: "A-001",
    name: "John Reyes",
    role: "Admin",
    status: "Active",
    password: "admin123",
  },
]

export function getAccounts() {
  const savedAccounts = localStorage.getItem(STORAGE_KEY)

  if (!savedAccounts) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultAccounts)
    )

    return defaultAccounts
  }

  const accounts = JSON.parse(savedAccounts)

  const normalizedAccounts = accounts.map((account) => {
    const seedMatch = defaultAccounts.find(
      (seedAccount) => seedAccount.id === account.id
    )

    return {
      ...account,
      status: account.status || "Active",
      password: account.password || seedMatch?.password,
    }
  })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalizedAccounts)
  )

  return normalizedAccounts
}

export function getAccountById(id) {
  return getAccounts().find((account) => account.id === id) || null
}

export function saveAccount(account) {
  const accounts = getAccounts()

  const newAccount = {
    ...account,
    status: "Active",
  }

  const updatedAccounts = [
    ...accounts,
    newAccount,
  ]

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAccounts)
  )
}

export function updateAccount(id, updatedData) {
  const accounts = getAccounts()

  const updatedAccounts = accounts.map((account) => {
    if (account.id !== id) {
      return account
    }

    return {
      ...account,
      ...updatedData,
    }
  })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAccounts)
  )
}

export function toggleAccountStatus(id) {
  const accounts = getAccounts()

  const updatedAccounts = accounts.map((account) => {
    if (account.id !== id) {
      return account
    }

    return {
      ...account,
      status:
        account.status === "Active"
          ? "Inactive"
          : "Active",
    }
  })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedAccounts)
  )
}

export function setCurrentAccount(account) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(account)
  )
}

export function getCurrentAccount() {
  const savedAccount =
    localStorage.getItem(SESSION_KEY)

  if (!savedAccount) {
    return null
  }

  return JSON.parse(savedAccount)
}

export function clearCurrentAccount() {
  localStorage.removeItem(SESSION_KEY)
}