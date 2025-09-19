"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadImage, deleteImage } from "@/lib/imageUtils"
import { useToast } from "@/components/ui/toastContext"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  className?: string
}

export default function ImageUploader({ value, onChange, className = "" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "نوع فایل اشتباه است!",
        description: "لطفاً فایل تصویری بارگزاری کنید.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم فایل زیاد است",
        description: "فایل باید کوچکتر از 5 مگابایت باشد.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Create local preview
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Upload to Cloudinary
      const imageUrl = await uploadImage(file)

      // If there was a previous image, delete it
      if (value) {
        try {
          await deleteImage(value)
        } catch (error) {
          console.error("Failed to delete previous image:", error)
        }
      }

      onChange(imageUrl)

      toast({
        title: "تصویر بارگزاری شد!",
        description: "تصویر با موفقیت بارگزاری شد!",
      })
    } catch (error: any) {
      toast({
        title: "بارگزاری ناموفق!",
        description: error.message || "",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemoveImage = async () => {
    if (!value) return

    try {
      setIsUploading(true)
      await deleteImage(value)
      onChange("")
      setPreviewUrl(null)

      toast({
        title: "تصویر حذف شد!",
        description: "تصویر با موفقیت حذف شد!",
      })
    } catch (error: any) {
      toast({
        title: "خطا در حذف تصویر",
        description: error.message || "",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Display either the current value or the preview
  const displayUrl = previewUrl || value

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="flex flex-row-reverse gap-2"
          onClick={triggerFileInput} 
          disabled={isUploading}>
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          آپلود تصویر
        </Button>

        {displayUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="flex gap-2 text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
            حذف
          </Button>
        )}

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      </div>

      {displayUrl && (
        <div className="relative h-40 w-40 rounded-md overflow-hidden border border-gray-200">
          <Image src={displayUrl || "/placeholder.svg"} alt="Item preview" fill className="object-cover" />
        </div>
      )}
    </div>
  )
}

