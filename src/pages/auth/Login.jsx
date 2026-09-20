import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { MailIcon, PhoneIcon, IdCardIcon, LifeBuoyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  getAccounts,
  setCurrentAccount,
} from "@/lib/accountStorage"
import qcuLogo from "@/assets/qcu-logo.png"

function Login() {
  const [idNumber, setIdNumber] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const navigate = useNavigate()

  function handleLogin(e) {
    e.preventDefault()

    const accounts = getAccounts()

    const account = accounts.find(
      (item) =>
        item.id === idNumber &&
        item.password === password
    )

    if (!account) {
      setFormError("Invalid ID number or password.")
      return
    }

    if (account.status === "Inactive") {
      setFormError("Your account is inactive.")
      return
    }

    setFormError("")
    setCurrentAccount(account)

    if (account.role === "Admin") {
      navigate("/admin")
    } else if (account.role === "Teacher") {
      navigate("/teacher")
    } else if (account.role === "Student") {
      navigate("/student")
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB]">

      {/* Navbar */}
      <header className="sticky top-0 z-50 h-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Logo and Name */}
          <a
            href="#home"
            className="flex items-center gap-3"
          >
            <img
              src={qcuLogo}
              alt="QCU Logo"
              className="h-12 w-12 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-blue-900">
                QCU LMS
              </h1>

              <p className="text-xs text-gray-500">
                Learning Management System
              </p>
            </div>
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#about"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-900"
            >
              About Us
            </a>

            <a
              href="#vision"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-900"
            >
              Vision
            </a>

            <a
              href="#mission"
              className="text-sm font-medium text-gray-600 transition hover:text-blue-900"
            >
              Mission
            </a>
          </nav>
        </div>
      </header>

      {/* Home / Login Section */}
      <main id="home">

        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden">

          {/* Decorative Background */}
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-red-100/60 blur-3xl" />

          <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-6 py-12 lg:px-10">

            <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

              {/* Left Side */}
              <div className="relative">
                <div className="max-w-xl">

                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-1 w-12 rounded-full bg-red-600" />

                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">
                      Quezon City University
                    </p>
                  </div>

                  <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-blue-950 sm:text-6xl lg:text-7xl">
                    QCU
                    <span className="block text-red-600">
                      #1 LOCAL
                    </span>
                    <span className="block">
                      UNIVERSITY
                    </span>
                  </h2>

                  <p className="mt-7 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
                    Empowering students through accessible,
                    quality, and innovative education.
                  </p>

                  <div className="mt-10 flex items-center gap-3">
                    <div className="h-2 w-20 rounded-full bg-blue-900" />
                    <div className="h-2 w-10 rounded-full bg-red-600" />
                    <div className="h-2 w-5 rounded-full bg-blue-300" />
                  </div>

                </div>
              </div>

              {/* Right Side Login */}
              <div className="flex justify-center lg:justify-end">

                <Card className="w-full max-w-md border-0 bg-white shadow-xl shadow-blue-950/10">

                  <CardContent className="p-8 sm:p-10">

                    <div className="mb-8">
                      <p className="text-sm font-semibold uppercase tracking-wider text-red-600">
                        Welcome
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-blue-950">
                        Sign in to QCU LMS
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        Enter your account credentials to
                        access the Learning Management System.
                      </p>
                    </div>

                    <form
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >

                      {/* ID Number */}
                      <div className="space-y-2">
                        <Label htmlFor="idNumber">
                          ID Number
                        </Label>

                        <Input
                          id="idNumber"
                          type="text"
                          value={idNumber}
                          onChange={(e) => {
                            setIdNumber(e.target.value)
                            setFormError("")
                          }}
                          placeholder="Enter your ID number"
                          className="h-11"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">
                            Password
                          </Label>

                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs font-medium text-blue-700 hover:text-blue-900"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value)
                            setFormError("")
                          }}
                          placeholder="Enter your password"
                          className="h-11"
                          required
                        />
                      </div>

                      {formError && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          <svg
                            viewBox="0 0 24 24"
                            className="mt-0.5 h-4 w-4 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 8v5M12 16h.01" />
                          </svg>

                          <span>{formError}</span>
                        </div>
                      )}

                      {/* Login Button */}
                      <Button
                        type="submit"
                        className="h-11 w-full bg-blue-900 text-white hover:bg-blue-800"
                      >
                        Login
                      </Button>

                    </form>

                    <p className="mt-6 text-center text-xs text-gray-400">
                      Quezon City University • QCU LMS
                    </p>

                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        </section>

        {/* Forgot Password */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <LifeBuoyIcon className="h-5 w-5" />
            </div>

            <DialogHeader className="mt-3">
              <DialogTitle>Forgot your password?</DialogTitle>
              <DialogDescription>
                Password resets go through IT Support to keep every account secure. Reach them using either option below, and have your ID number ready so they can verify your identity.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:itsupport@qcu.edu.ph"
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <MailIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Email IT Support</p>
                  <p className="truncate text-sm font-semibold text-blue-900">
                    itsupport@qcu.edu.ph
                  </p>
                </div>
              </a>

              <a
                href="tel:0212345678"
                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <PhoneIcon className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Help desk</p>
                  <p className="text-sm font-semibold text-blue-900">
                    (02) 1234-5678
                  </p>
                </div>
              </a>
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
              <IdCardIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Have your ID number ready. IT Support will ask for it to verify your identity before resetting your password.
              </span>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* About Us */}
        <section
          id="about"
          className="scroll-mt-20 bg-white px-6 py-24 lg:px-10"
        >
          <div className="mx-auto max-w-5xl">

            <div className="mb-12 text-center">
              <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-red-600" />

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">
                About Us
              </p>

              <h2 className="mt-3 text-4xl font-bold text-blue-950">
                About Quezon City University
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">

              <div className="rounded-2xl border bg-[#F4F7FB] p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-lg font-bold text-white">
                  Q
                </div>

                <h3 className="text-xl font-bold text-blue-950">
                  Quezon City University
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  Quezon City University is a local university
                  committed to providing accessible and quality
                  education to its students. The university
                  supports students in developing the knowledge,
                  skills, and values needed for their future
                  careers and communities.
                </p>
              </div>

              <div className="rounded-2xl border bg-[#F4F7FB] p-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white">
                  L
                </div>

                <h3 className="text-xl font-bold text-blue-950">
                  QCU Learning Management System
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  QCU LMS provides a centralized platform where
                  students, teachers, and administrators can
                  access and manage academic information,
                  learning materials, activities, and other
                  university-related services.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Vision */}
        <section
          id="vision"
          className="scroll-mt-20 bg-[#F4F7FB] px-6 py-24 lg:px-10"
        >
          <div className="mx-auto max-w-5xl">

            <div className="rounded-2xl border bg-white p-10 shadow-sm lg:p-14">

              <div className="flex flex-col items-center text-center">

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-900 text-2xl font-bold text-white">
                  V
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
                  Our Vision
                </p>

                <h2 className="mt-3 text-4xl font-bold text-blue-950">
                  Vision
                </h2>

                <div className="mt-8 h-1 w-16 rounded-full bg-red-600" />

                <p className="mt-8 max-w-3xl text-xl font-medium leading-9 text-gray-700">
                  To be an internationally recognized local
                  university committed to innovation and
                  sustainability to achieve positive social
                  impact.
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section
          id="mission"
          className="scroll-mt-20 bg-white px-6 py-24 lg:px-10"
        >
          <div className="mx-auto max-w-5xl">

            <div className="rounded-2xl border bg-[#F4F7FB] p-10 shadow-sm lg:p-14">

              <div className="flex flex-col items-center text-center">

                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-2xl font-bold text-white">
                  M
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-900">
                  Our Mission
                </p>

                <h2 className="mt-3 text-4xl font-bold text-blue-950">
                  Mission
                </h2>

                <div className="mt-8 h-1 w-16 rounded-full bg-blue-900" />

                <p className="mt-8 max-w-3xl text-xl font-medium leading-9 text-gray-700">
                  To provide a comprehensive education that
                  enhances the lives of QCU students for
                  nation-building and as world citizens.
                </p>

              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-blue-950 px-6 py-8 text-center text-sm text-white">
          <p>
            © 2026 Quezon City University • QCU LMS
          </p>
        </footer>

      </main>
    </div>
  )
}

export default Login