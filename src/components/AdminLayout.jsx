import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout