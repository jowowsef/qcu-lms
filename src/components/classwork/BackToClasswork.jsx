import { ChevronLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function BackToClasswork({ onBack, label = "Classwork" }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onBack}
      className="mb-6 -ml-2.5 gap-1 text-gray-600 hover:text-gray-900"
    >
      <ChevronLeftIcon className="size-4" />
      {label}
    </Button>
  )
}

export default BackToClasswork
