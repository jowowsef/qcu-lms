import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Login from "./pages/auth/Login"

import AdminDashboard from "./pages/admin/AdminDashboard"
import Accounts from "./pages/admin/Accounts"
import CreateAccount from "./pages/admin/CreateAccount"
import EditAccount from "./pages/admin/EditAccount"

import Announcements from "./pages/admin/Announcements"
import CreateAnnouncement from "./pages/admin/CreateAnnouncement"
import EditAnnouncement from "./pages/admin/EditAnnouncement"

import AuditLogs from "./pages/admin/AuditLogs"

import Settings from "./pages/admin/Settings"

import TeacherDashboard from "./pages/teacher/TeacherDashboard"
import Classes from "./pages/teacher/Classes"
import ClassPage from "./pages/teacher/ClassPage"
import TeacherAssignments from "./pages/teacher/Assignments"
import TeacherQuizzes from "./pages/teacher/Quizzes"
import TeacherGrades from "./pages/teacher/Grades"
import TeacherAnnouncements from "./pages/teacher/Announcements"
import TeacherSettings from "./pages/teacher/Settings"

import StudentDashboard from "./pages/student/StudentDashboard"
import StudentClasses from "./pages/student/Classes"
import StudentClassPage from "./pages/student/ClassPage"
import StudentAnnouncements from "./pages/student/Announcements"
import StudentGrades from "./pages/student/Grades"
import StudentSettings from "./pages/student/Settings"

import ProtectedRoute from "./components/ProtectedRoute"

import { ToastProvider } from "./components/ui/toast"
import { ConfirmProvider } from "./components/ui/confirm-dialog"


function App() {
  return (
    <ToastProvider>
    <ConfirmProvider>
    <BrowserRouter>

      <Routes>

        {/* Login */}

        <Route
          path="/"
          element={<Login />}
        />


        {/* ==================== */}
        {/* ADMIN ROUTES */}
        {/* ==================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Accounts />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts/create"
          element={
            <ProtectedRoute allowedRole="Admin">
              <CreateAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/accounts/edit/:id"
          element={
            <ProtectedRoute allowedRole="Admin">
              <EditAccount />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Announcements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcements/create"
          element={
            <ProtectedRoute allowedRole="Admin">
              <CreateAnnouncement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/announcements/edit/:id"
          element={
            <ProtectedRoute allowedRole="Admin">
              <EditAnnouncement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRole="Admin">
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRole="Admin">
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* ==================== */}
        {/* TEACHER ROUTES */}
        {/* ==================== */}

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <Classes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/classes/:id"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <ClassPage />
            </ProtectedRoute>
          }
        />

        {/* ==================== */}
        {/* STUDENT ROUTES */}
        {/* ==================== */}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentClasses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/classes/:id"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentClassPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/announcements"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/grades"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/settings"
          element={
            <ProtectedRoute allowedRole="Student">
              <StudentSettings />
            </ProtectedRoute>
          }
        />


        <Route
          path="/teacher/assignments"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherAssignments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/quizzes"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherQuizzes />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/grades"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherGrades />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/announcements"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherAnnouncements />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher/settings"
          element={
            <ProtectedRoute allowedRole="Teacher">
              <TeacherSettings />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
    </ConfirmProvider>
    </ToastProvider>
  )
}

export default App