import * as React from "react"
import { cn } from "@/lib/auth/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "px-4 py-2": size === "default",
            "px-3 py-1 text-sm": size === "sm",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }