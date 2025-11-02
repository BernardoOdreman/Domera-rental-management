import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement> & {
  clickable?: boolean
  interactive?: boolean
  hoverEffect?: boolean
}
>(({ className, clickable, interactive, hoverEffect = false, ...props }, ref) => (
  <div
  ref={ref}
  className={cn(
    "rounded-xl bg-card text-card-foreground dashboard-card",
    "border-0",
    "shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
                hoverEffect && "hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:border hover:border-primary transition-all duration-300 ease-in-out hover:scale-[1.01]",
                interactive && "transition-all duration-200",
                clickable && "cursor-pointer",
                className,
  )}
  {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
  ref={ref}
  className={cn("flex flex-col space-y-1.5 p-6", className)}
  {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
HTMLParagraphElement,
React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
  ref={ref}
  className={cn(
    "text-2xl font-semibold leading-none tracking-tight",
    className
  )}
  {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
HTMLParagraphElement,
React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
  ref={ref}
  className={cn("text-sm text-muted-foreground", className)}
  {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
  ref={ref}
  className={cn("p-6 pt-0", className)}
  {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
  ref={ref}
  className={cn("flex items-center p-6 pt-0", className)}
  {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
