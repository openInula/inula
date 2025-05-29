import * as React from "react"

import { cn } from '@/utils/classnames'

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number
    max?: number
    getDashValue?: (value: number) => unknown
  }
>(({ className, value, max = 100, getDashValue, ...props }, ref) => {
  const percentage = value != null ? Math.min(Math.max(value, 0), max) : null

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      {percentage != null && (
        <div
          className="h-full w-full flex-1 bg-primary transition-all"
          style={{
            transform: `translateX(-${100 - (percentage / max) * 100}%)`,
          }}
        />
      )}
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
