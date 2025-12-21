import * as React from "react"
import { cn } from "@/lib/utils"
import { Box, BoxProps } from "./Box"

export interface StackProps extends BoxProps {
  // Convenient props for common flex layouts could go here, 
  // but keeping it simple for now to be a semantic wrapper.
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn("flex flex-col", className)}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

const HStack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        className={cn("flex flex-row items-center", className)}
        {...props}
      />
    )
  }
)
HStack.displayName = "HStack"

export { Stack, HStack }
