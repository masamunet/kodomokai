import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const headingVariants = cva("font-bold tracking-tight", {
  variants: {
    size: {
      h1: "text-4xl lg:text-5xl",
      h2: "text-3xl first:mt-0",
      h3: "text-2xl",
      h4: "text-xl",
      h5: "text-lg",
      h6: "text-base",
    },
  },
  defaultVariants: {
    size: "h2",
  },
})

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
  VariantProps<typeof headingVariants> {
  asChild?: boolean
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, asChild = false, as, ...props }, ref) => {
    // If 'as' is not provided, default to the tag matching the size (e.g. h1 for size h1)
    // or default to h2 if size is explicit but tag isn't? 
    // Let's simplify: default Comp to 'h2' if not specified, 
    // essentially we usually want `as` to match `size`, but flexibility is good.
    const defaultTag = (size && ["h1", "h2", "h3", "h4", "h5", "h6"].includes(size)) ? size : "h2"
    const Comp = asChild ? Slot : (as || defaultTag)

    return (
      <Comp
        className={cn(headingVariants({ size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Heading.displayName = "Heading"

export { Heading, headingVariants }
