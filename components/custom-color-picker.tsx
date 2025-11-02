"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

export function CustomColorPicker({ color, onChange }: ColorPickerProps) {
  const [hexValue, setHexValue] = useState(color || "#7c3aed")

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const [rgb, setRgb] = useState(hexToRgb(hexValue))

  // Update RGB when hex changes
  useEffect(() => {
    setRgb(hexToRgb(hexValue))
  }, [hexValue])

  // Update hex when RGB changes
  useEffect(() => {
    const newHex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexValue(newHex)
    onChange(newHex)
  }, [rgb, onChange])

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setHexValue(value)
      onChange(value)
    } else if (value.startsWith("#") && value.length <= 7) {
      setHexValue(value)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full border border-border" style={{ backgroundColor: hexValue }} />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              Customize Color
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Pick a custom accent color</h4>
                <div className="flex h-24 items-center justify-center rounded-md border border-border overflow-hidden">
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`,
                    }}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const ratio = x / rect.width

                      // Calculate color based on position
                      let r = 0,
                        g = 0,
                        b = 0

                      if (ratio < 1 / 6) {
                        r = 255
                        g = Math.round(255 * ratio * 6)
                        b = 0
                      } else if (ratio < 2 / 6) {
                        r = Math.round(255 * (2 - ratio * 6))
                        g = 255
                        b = 0
                      } else if (ratio < 3 / 6) {
                        r = 0
                        g = 255
                        b = Math.round(255 * (ratio * 6 - 2))
                      } else if (ratio < 4 / 6) {
                        r = 0
                        g = Math.round(255 * (4 - ratio * 6))
                        b = 255
                      } else if (ratio < 5 / 6) {
                        r = Math.round(255 * (ratio * 6 - 4))
                        g = 0
                        b = 255
                      } else {
                        r = 255
                        g = 0
                        b = Math.round(255 * (6 - ratio * 6))
                      }

                      setRgb({ r, g, b })
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="r">Red</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="r"
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.r]}
                    onValueChange={(value) => setRgb({ ...rgb, r: value[0] })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    className="w-16"
                    value={rgb.r}
                    onChange={(e) => setRgb({ ...rgb, r: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="g">Green</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="g"
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.g]}
                    onValueChange={(value) => setRgb({ ...rgb, g: value[0] })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    className="w-16"
                    value={rgb.g}
                    onChange={(e) => setRgb({ ...rgb, g: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="b">Blue</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="b"
                    min={0}
                    max={255}
                    step={1}
                    value={[rgb.b]}
                    onValueChange={(value) => setRgb({ ...rgb, b: value[0] })}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={255}
                    className="w-16"
                    value={rgb.b}
                    onChange={(e) => setRgb({ ...rgb, b: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hex">Hex Color</Label>
                <Input id="hex" value={hexValue} onChange={handleHexChange} placeholder="#000000" />
              </div>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: hexValue }} />
                <div className="text-sm">Preview</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
