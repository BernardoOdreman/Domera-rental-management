"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
}

const ChartContext = React.createContext<ChartConfig | undefined>(undefined)

function ChartContainer({ children, config, className, ...props }: ChartContainerProps) {
  // Set CSS variables for chart colors
  const style = React.useMemo(() => {
    if (!config) return {}

    return Object.entries(config).reduce(
      (acc, [key, { color }]) => {
        acc[`--color-${key}`] = color
        return acc
      },
      {} as Record<string, string>,
    )
  }, [config])

  return (
    <ChartContext.Provider value={config}>
      <div className={cn("w-full", className)} style={style} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipProps extends React.HTMLAttributes<HTMLDivElement> {}

function ChartTooltip({ className, ...props }: ChartTooltipProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload: Record<string, any>
  }>
  label?: string
}

function ChartTooltipContent({ active, payload, label, className, ...props }: ChartTooltipContentProps) {
  const config = React.useContext(ChartContext)

  if (!active || !payload?.length || !config) {
    return null
  }

  return (
    <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props}>
      <div className="grid gap-0.5">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {payload.map((item) => {
          const dataKey = item.name
          const dataValue = item.value
          const dataConfig = config[dataKey]

          if (!dataConfig) {
            return null
          }

          return (
            <div key={dataKey} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: dataConfig.color }} />
                <p className="text-xs text-muted-foreground">{dataConfig.label}</p>
              </div>
              <p className="text-xs font-medium text-foreground">
                {typeof dataValue === "number" ? dataValue.toLocaleString() : dataValue}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
