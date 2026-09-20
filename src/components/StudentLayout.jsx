import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import StudentSidebar from "@/components/StudentSidebar"
import StudentNavbar from "@/components/StudentNavbar"
import AnnouncementPopup from "@/components/AnnouncementPopup"


function StudentLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (

    <div className="flex h-screen overflow-hidden bg-[#F4F7FB]">

      <AnnouncementPopup />

      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />


      <div className="flex min-w-0 flex-1 flex-col">

        <div className="shrink-0">
          <StudentNavbar onMenuClick={() => setSidebarOpen(true)} />
        </div>


        <main className="min-h-0 flex-1 overflow-y-scroll">

          {children}

        </main>

      </div>

    </div>

  )
}


export default StudentLayout
