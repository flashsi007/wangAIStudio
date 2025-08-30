import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gray-900 text-white shadow hover:bg-gray-800",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900",
        secondary:
          "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-gray-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 rounded-md px-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  disabled?: boolean
  active?: boolean
  'active-classname'?: string
  'button-size'?: 'default' | 'xs' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, active, 'active-classname': activeClassname, 'button-size': buttonSize, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    const finalSize = buttonSize || size
    const finalClassName = cn(
      buttonVariants({ variant, size: finalSize, className }),
      active && (activeClassname || 'bg-gray-200')
    )
    return (
      <Comp
        disabled={props.disabled}
        className={finalClassName}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
