import { copyToClipboard } from "@/lib/clipboard"
import { useToast } from "@/components/ui/toast"
import { getAccountById } from "@/lib/accountStorage"
import UserAvatar from "@/components/UserAvatar"

function People({ classData }) {
  const toast = useToast()

  const students = classData.students || []
  const pendingEmails = classData.invitedEmails || []
  const teacherAccount = getAccountById(classData.teacherId)

  async function handleCopyCode() {
    const success = await copyToClipboard(classData.classCode)

    if (success) {
      toast.success("Class code copied!")
    } else {
      toast.error("Couldn't copy the class code.")
    }
  }

  return (
    <div className="mt-6 space-y-5">

      <div>

        <h2 className="text-lg font-bold text-blue-950">
          People
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View the students enrolled in this class.
        </p>

      </div>


      {/* Teacher */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="border-b bg-gray-50 px-6 py-4">

          <h3 className="text-sm font-semibold text-gray-950">
            Teacher
          </h3>

        </div>


        <div className="flex items-center gap-4 px-6 py-5">

          <UserAvatar
            src={teacherAccount?.avatar}
            name={classData.teacherName}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900"
          />


          <div>

            <p className="text-sm font-semibold text-gray-900">
              {classData.teacherName}
            </p>

            <p className="text-xs text-gray-500">
              Teacher
            </p>

          </div>

        </div>

      </div>


      {/* Students */}

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">

          <div>

            <h3 className="text-sm font-semibold text-gray-950">
              Students
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              {students.length} {students.length === 1 ? "student" : "students"} enrolled
            </p>

          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            title="Tap to copy"
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-left transition hover:border-blue-300 hover:bg-blue-50"
          >
            <p className="text-[11px] text-gray-400">Class Code</p>
            <p className="text-sm font-bold tracking-wider text-blue-900">
              {classData.classCode}
            </p>
          </button>

        </div>


        {students.length === 0 ? (

          <div className="px-6 py-12 text-center">

            <p className="text-sm font-medium text-gray-700">
              No students enrolled yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Students can join using the class code above.
            </p>

          </div>

        ) : (

          <div className="divide-y">
            {students.map((student) => {
              const studentAccount = getAccountById(student.id)

              return (
              <div
                key={student.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <UserAvatar
                  src={studentAccount?.avatar}
                  name={student.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {student.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {student.id}
                  </p>
                </div>
              </div>
              )
            })}
          </div>

        )}

      </div>


      {/* Pending Invitations */}

      {pendingEmails.length > 0 && (

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="border-b bg-gray-50 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-950">
              Pending Invitations
            </h3>

            <p className="mt-0.5 text-xs text-gray-500">
              Invited by email, not yet joined with the class code.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 px-6 py-5">
            {pendingEmails.map((email) => (
              <span
                key={email}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
              >
                {email}
              </span>
            ))}
          </div>

        </div>

      )}

    </div>
  )
}

export default People
