import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import { cn } from "cn"
import { Button } from "@/components/ui/button"

function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, page - 1, page, page + 1])

  return [...pages]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((a, b) => a - b)
}

function Pagination({ page, totalPages, onPageChange, className }) {
  if (totalPages <= 1) {
    return null
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </Button>

      {pageNumbers.map((pageNumber, index) => {
        const previousNumber = pageNumbers[index - 1]
        const showEllipsis =
          previousNumber !== undefined && pageNumber - previousNumber > 1

        return (
          <span key={pageNumber} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="flex size-7 items-center justify-center text-gray-400">
                <MoreHorizontalIcon className="size-4" />
              </span>
            )}

            <Button
              type="button"
              variant={pageNumber === page ? "default" : "outline"}
              size="icon-sm"
              className={
                pageNumber === page ? "bg-blue-900 hover:bg-blue-800" : ""
              }
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </Button>
          </span>
        )
      })}

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  )
}

export { Pagination }
