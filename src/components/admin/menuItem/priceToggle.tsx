"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { IMenuItem } from "@/models/MenuItem"

interface PriceToggleProps {
  initialPrice: boolean
  onToggle?: (singlePrice: boolean) => void
}

export default function PriceToggle({ initialPrice, onToggle }: PriceToggleProps) {
  const [singlePrice, setSinglePrice] = useState(initialPrice)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true)
    try {
      setSinglePrice(checked)
      if (onToggle) {
        onToggle(checked)
      }
    } catch (error: any) {
        console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div dir="rtl" className="flex flex-col items-center gap-2">
      <Switch id="singlePrice" checked={singlePrice} onCheckedChange={handleToggle} disabled={isUpdating} />
      <Label htmlFor="singlePrice" className={isUpdating ? "opacity-50 text-teal-700 font-semibold" : "text-teal-700 font-semibold"}>
        {singlePrice ? "تک قیمت" : "چند قیمت"}
      </Label>
    </div>
  )
}

