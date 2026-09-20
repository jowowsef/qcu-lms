import { useNavigate } from "react-router-dom"

import { clearCurrentAccount, getCurrentAccount } from "@/lib/accountStorage"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import NotificationBell from "@/components/NotificationBell"

function StudentNavbar({ onMenuClick = () => {} }) {
  const navigate = useNavigate()
  const student = getCurrentAccount()

  function handleLogout() {
    clearCurrentAccount()
    navigate("/")
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-8">

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-gray-700">
          Student
        </span>
      </div>

      <div className="flex items-center gap-2">

        <NotificationBell student={student} />

        <DropdownMenu>

        <DropdownMenuTrigger asChild>

          <button
            type="button"
            className="cursor-pointer rounded-full outline-none"
          >
            <Avatar className="h-9 w-9">

              <AvatarImage src={student?.avatar} alt={student?.name} />

              <AvatarFallback className="bg-[#3B82F6] text-white">
                {student?.name?.charAt(0)?.toUpperCase() || "S"}
              </AvatarFallback>

            </Avatar>
          </button>

        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48"
        >

          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() =>
              navigate("/student/settings")
            }
          >
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleLogout}
          >
            Logout
          </DropdownMenuItem>

        </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </header>
  )
}

export default StudentNavbar
