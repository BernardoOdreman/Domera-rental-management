"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  onClose?: () => void
}

export function ColorPicker({ color, onChange, onClose }: ColorPickerProps) {
  // Parse initial color
  const parseColor = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const [rgb, setRgb] = useState(parseColor(color))
  const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 })
  const [hex, setHex] = useState(color)
  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingHue, setIsDraggingHue] = useState(false)

  const colorAreaRef = useRef<HTMLDivElement>(null)
  const hueSliderRef = useRef<HTMLDivElement>(null)

  // Convert RGB to HSV
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min

    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    h /= 360
    s /= 100
    v /= 100

    let r = 0,
      g = 0,
      b = 0

    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
      case 0:
        r = v
        g = t
        b = p
        break
      case 1:
        r = q
        g = v
        b = p
        break
      case 2:
        r = p
        g = v
        b = t
        break
      case 3:
        r = p
        g = q
        b = v
        break
      case 4:
        r = t
        g = p
        b = v
        break
      case 5:
        r = v
        g = p
        b = q
        break
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  // Convert RGB to HEX
  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    )
  }

  // Initialize HSV from RGB
  useEffect(() => {
    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b))
  }, [])

  // Handle color area mouse events
  const handleColorAreaMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleColorAreaMouseMove(e)
  }

  const handleColorAreaMouseMove = (e: React.MouseEvent) => {
    if ((!isDragging && e.type !== "mousedown") || !colorAreaRef.current) return

    const rect = colorAreaRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))

    const s = x * 100
    const v = (1 - y) * 100

    const newHsv = { ...hsv, s, v }
    setHsv(newHsv)

    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v)
    setRgb(newRgb)

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(newHex)
    onChange(newHex)
  }

  // Handle hue slider mouse events
  const handleHueSliderMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true)
    handleHueSliderMouseMove(e)
  }

  const handleHueSliderMouseMove = (e: React.MouseEvent) => {
    if ((!isDraggingHue && e.type !== "mousedown") || !hueSliderRef.current) return

    const rect = hueSliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))

    const h = Math.round(x * 360)
    const newHsv = { ...hsv, h }
    setHsv(newHsv)

    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v)
    setRgb(newRgb)

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(newHex)
    onChange(newHex)
  }

  // Handle mouse up event
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsDraggingHue(false)
    }

    window.addEventListener("mouseup", handleMouseUp)
    return () => window.removeEventListener("mouseup", handleMouseUp)
  }, [])

  // Handle mouse move event
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleColorAreaMouseMove(e as unknown as React.MouseEvent)
      }
      if (isDraggingHue) {
        handleHueSliderMouseMove(e as unknown as React.MouseEvent)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isDragging, isDraggingHue, hsv])

  // Handle RGB input changes
  const handleRgbChange = (component: "r" | "g" | "b", value: string) => {
    const numValue = Math.max(0, Math.min(255, Number.parseInt(value) || 0))
    const newRgb = { ...rgb, [component]: numValue }
    setRgb(newRgb)

    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
    setHsv(newHsv)

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(newHex)
    onChange(newHex)
  }

  // Handle HSV input changes
  const handleHsvChange = (component: "h" | "s" | "v", value: string) => {
    const max = component === "h" ? 360 : 100
    const numValue = Math.max(0, Math.min(max, Number.parseInt(value) || 0))
    const newHsv = { ...hsv, [component]: numValue }
    setHsv(newHsv)

    const newRgb = hsvToRgb(newHsv.h, newHsv.s, newHsv.v)
    setRgb(newRgb)

    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(newHex)
    onChange(newHex)
  }

  // Handle HEX input change
  const handleHexChange = (value: string) => {
    if (/^#?[0-9A-F]{6}$/i.test(value.replace("#", ""))) {
      const cleanValue = value.startsWith("#") ? value : `#${value}`
      setHex(cleanValue)

      const newRgb = parseColor(cleanValue)
      setRgb(newRgb)

      const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b)
      setHsv(newHsv)

      onChange(cleanValue)
    }
  }

  return (
    <div className="relative w-full" aria-label="Color picker" role="application">
      <div className="w-full space-y-4">
        <div className="flex space-x-4">
          {/* Color selection area */}
          <div className="flex-1 space-y-2">
            {/* Color area with saturation and value */}
            <div
              ref={colorAreaRef}
              className="relative h-48 rounded-md cursor-crosshair"
              style={{
                backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
                backgroundImage:
                  "linear-gradient(to right, #fff, transparent), linear-gradient(to top, #000, transparent)",
              }}
              onMouseDown={handleColorAreaMouseDown}
            >
              {/* Color picker indicator */}
              <div
                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full pointer-events-none"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: hex,
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              ref={hueSliderRef}
              className="relative h-6 rounded-md cursor-pointer"
              style={{
                backgroundImage: "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
              }}
              onMouseDown={handleHueSliderMouseDown}
            >
              {/* Hue slider indicator */}
              <div
                className="absolute w-2 h-full -translate-x-1/2 border-2 border-white pointer-events-none"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Color preview */}
          <div className="flex flex-col items-center justify-center w-24 space-y-2">
            <div className="w-20 h-20 border rounded-md shadow-inner" style={{ backgroundColor: hex }} />
            <div className="text-xs text-center text-muted-foreground">Current Color</div>
          </div>
        </div>

        {/* Color inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">RGB</h4>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="r" className="text-right text-red-500 font-medium">
                R
              </Label>
              <Input
                id="r"
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) => handleRgbChange("r", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="g" className="text-right text-green-500 font-medium">
                G
              </Label>
              <Input
                id="g"
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) => handleRgbChange("g", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="b" className="text-right text-blue-500 font-medium">
                B
              </Label>
              <Input
                id="b"
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) => handleRgbChange("b", e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">HSV</h4>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="h" className="text-right font-medium">
                H
              </Label>
              <Input
                id="h"
                type="number"
                min={0}
                max={360}
                value={hsv.h}
                onChange={(e) => handleHsvChange("h", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="s" className="text-right font-medium">
                S
              </Label>
              <Input
                id="s"
                type="number"
                min={0}
                max={100}
                value={hsv.s}
                onChange={(e) => handleHsvChange("s", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid grid-cols-[30px_1fr] items-center gap-2">
              <Label htmlFor="v" className="text-right font-medium">
                V
              </Label>
              <Input
                id="v"
                type="number"
                min={0}
                max={100}
                value={hsv.v}
                onChange={(e) => handleHsvChange("v", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Hex input */}
        <div className="space-y-2">
          <Label htmlFor="hex" className="text-sm font-medium">
            Hex
          </Label>
          <div className="flex items-center space-x-2">
            <Input id="hex" value={hex} onChange={(e) => handleHexChange(e.target.value)} className="h-8 font-mono" />
            {onClose && <Button onClick={onClose}>Apply</Button>}
          </div>
        </div>
      </div>
      {/* Add color descriptions for screen readers */}
      <span id="color-description" className="sr-only">
        Currently selected color: {color}. Use the color picker to select a different color.
      </span>

      {/* Update color slider for better accessibility */}
      <div className="mt-4">
        <label htmlFor="hue-slider" className="block text-sm font-medium mb-1">
          Hue
        </label>
        <input
          type="range"
          id="hue-slider"
          min="0"
          max="360"
          aria-describedby="color-description"
          className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-md cursor-pointer"
        />
      </div>

      {/* Add hex code input field with validation */}
      <div className="mt-4">
        <label htmlFor="hex-color" className="block text-sm font-medium mb-1">
          Hex Color
        </label>
        <input
          id="hex-color"
          type="text"
          value={color}
          pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
          aria-describedby="hex-help"
          className="w-full p-2 border border-border rounded-md"
          onChange={(e) => {
            const value = e.target.value
            if (/^#([A-Fa-f0-9]{0,6})$/.test(value)) {
              onChange(value)
            }
          }}
        />
        <p id="hex-help" className="text-xs text-muted-foreground mt-1">
          Enter a valid hex color (e.g. #FF5500)
        </p>
      </div>
    </div>
  )
}
