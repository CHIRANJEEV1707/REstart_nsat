import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    // Base
                    "flex h-11 w-full rounded-xl border bg-white px-4 py-2 text-sm transition-all duration-200",
                    // Border & Focus
                    "border-gray-200 hover:border-gray-300",
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
                    // Placeholder
                    "placeholder:text-gray-400",
                    // File input
                    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    // Disabled
                    "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200",
                    // Custom overrides
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
