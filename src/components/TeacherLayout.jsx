import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import TeacherSidebar from "@/components/TeacherSidebar"
import TeacherNavbar from "@/components/TeacherNavbar"
import AnnouncementPopup from "@/components/AnnouncementPopup"


function TeacherLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (

    <div className="flex h-dvh overflow-hidden bg-[#F4F7FB]">

      <AnnouncementPopup />

      <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      <div className="flex min-w-0 flex-1 flex-col">

        <div className="shrink-0">
          <TeacherNavbar onMenuClick={() => setSidebarOpen(true)} />
        </div>


        <main className="min-h-0 flex-1 overflow-y-scroll">

          {children}

        </main>

      </div>

    </div>

  )
}


export default TeacherLayout