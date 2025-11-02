// components/image-upload.tsx
"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { ImagePlus, Trash } from "lucide-react"

export function ImageUpload({
  initialImage,
  onImageChange,
  isLoading
}: {
  initialImage?: string
  onImageChange: (file: File | null) => void
  isLoading?: boolean
}) {
  const [preview, setPreview] = useState(initialImage || "")
  
  const handleFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
    onImageChange(file)
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="rounded-lg w-full h-48 object-cover" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
            onClick={() => {
              setPreview("")
              onImageChange(null)
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-48 w-full rounded-lg border-2 border-dashed cursor-pointer hover:border-primary">
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            disabled={isLoading}
          />
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Uploading..." : "Click to upload"}
            </p>
          </div>
        </label>
      )}
    </div>
  )
}