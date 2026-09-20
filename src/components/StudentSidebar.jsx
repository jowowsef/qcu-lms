import { NavLink } from "react-router-dom"

import qcuLogo from "@/assets/qcu-logo.png"

function StudentSidebar({ open = false, onClose = () => {} }) {
  const navItems = [
    {
      label: "Dashboard",
      path: "/student",
    },
    {
      label: "My Classes",
      path: "/student/classes",
    },
    {
      label: "Announcements",
      path: "/student/announcements",
    },
    {
      label: "Grades",
      path: "/student/grades",
    },
  ]

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 transform flex-col border-r bg-white transition-transform duration-200 ease-out md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="flex h-20 shrink-0 items-center gap-3 border-b px-6">

          <img
            src={qcuLogo}
            alt="QCU Logo"
            className="h-12 w-12 object-contain"
          />

          <div className="min-w-0 flex-1">

            <h2 className="text-lg font-bold text-blue-900">
              QCU LMS
            </h2>

            <p className="text-xs text-gray-500">
              Learning Management System
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">

          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <div className="space-y-2">

            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-[#3B82F6] text-white shadow-sm"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

          </div>

        </nav>

      </aside>
    </>
  )
}

export default StudentSidebar
