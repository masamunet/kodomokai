import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textVariants = cva("text-base", {
  variants: {
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    size: "base",
    weight: "normal",
    color: "default",
    align: "left",
  },
})

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
  VariantProps<typeof textVariants> {
  asChild?: boolean
  as?: "span" | "p" | "div" // Valid HTML elements
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, size, weight, color, align, asChild = false, as = "span", ...props }, ref) => {
    // If asChild is true, we use Slot. If not, we use the `as` prop (defaulting to span).
    const Comp = asChild ? Slot : as
    return (
      <Comp
        className={cn(textVariants({ size, weight, color, align, className }))}
        // @ts-ignore - Polymorphic ref complexity
        ref={ref}
        {...props}
      />
    )
  }
)
Text.displayName = "Text"

export { Text, textVariants }
