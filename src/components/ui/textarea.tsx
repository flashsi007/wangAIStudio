import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-gray-300 placeholder:text-gray-500 focus-visible:border-gray-400 focus-visible:ring-gray-400 aria-invalid:ring-red-200 aria-invalid:border-red-600 flex min-h-16 w-full rounded-md border bg-white px-3 py-2 text-base shadow-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
