"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { updateMenuItem } from "@/lib/data/itemData"
import { useToast } from "@/components/ui/toastContext"
import { IMenuItem } from "@/models/MenuItem"

interface AvailabilityToggleProps {
  itemId: string
  itemName: string
  item: IMenuItem
  initialAvailable: boolean
  onToggle?: (available: boolean) => void
}

export default function AvailabilityToggle({ itemId, itemName, item, initialAvailable, onToggle }: AvailabilityToggleProps) {
  const [available, setAvailable] = useState(initialAvailable)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true)
    try {
        
      await updateMenuItem(itemId, {...item ,available: checked })
      setAvailable(checked)
      if (onToggle) {
        onToggle(checked)
      }
      toast({
        title: `${itemName} ${checked ? "موجود شد!" : "ناموجود شد!"}`,
        description: checked ? "این آیتم اکنون قابل سفارش است." : "این آیتم اکنون غیرقابل سفارش است.",
      })
    } catch (error: any) {
      toast({
        title: "خطا در به‌روز رسانی!",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div dir="rtl" className="flex flex-col items-center gap-2">
      <Switch id={`available-${itemId}`} checked={available} onCheckedChange={handleToggle} disabled={isUpdating} />
      <Label htmlFor={`available-${itemId}`} className={isUpdating ? "opacity-50 text-teal-700 font-semibold" : " text-teal-700 font-semibold"}>
        {available ? "موجود" : "ناموجود"}
      </Label>
    </div>
  )
}

