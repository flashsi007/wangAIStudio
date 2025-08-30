import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-gray-900 placeholder:text-gray-500 selection:bg-gray-900 selection:text-white border-gray-300 flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-sm transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-gray-400 focus-visible:ring-gray-400 focus-visible:ring-2",
        "aria-invalid:ring-red-200 aria-invalid:border-red-600",
        className
      )}
      {...props}
    />
  )
}

export { Input }
