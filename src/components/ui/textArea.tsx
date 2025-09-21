import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      dir="rtl"
      className={cn(
        "flex min-h-[100px] w-full rounded-[0.125rem] border-2 border-amber-300 bg-amber-50 px-3 py-2 text-right text-base font-semibold text-teal-700 ring-offset-background placeholder:text-teal-700/50 focus-visible:outline-none focus-visible:border-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
