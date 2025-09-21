"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toastContext"
import { updatePassword } from "@/app/actions/updatePassword"

export default function PasswordManager() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (newPassword.length < 6) {
      toast({
        title: "رمز عبور کوتاه است!",
        description: "رمز عبور جدید باید بیش از 6 کاراکتر باشد.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "رمزهای عبور مطابقت ندارند",
        description: "کلمه‌ی عبور جدید و تأیید آن باید یکسان باشند.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await updatePassword(currentPassword, newPassword)

      if (result.success) {
        toast({
          title: "کلمه‌ی عبور تغییر یافت!",
          description: result.message
        })

        // Reset form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast({
          title: "خطا در تغییر کلمه‌ی عبور",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "خطا در تغییر کلمه‌ی عبور",
        description: error.message || "یک خطای غیرمنتظره رخ داد!",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border-2 border-teal-700">
          <h3 className="font-extrabold text-teal-700">تغییر کلمه‌ی عبور</h3>
          <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex flex-col gap-4">
              <Label htmlFor="current-password">کلمه‌ی عبور فعلی</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-4">
              <Label htmlFor="new-password">کلمه‌ی عبور جدید</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-4">
              <Label htmlFor="confirm-password">تأیید کلمه‌ی عبور جدید</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "در حال به‌روزرسانی" : "به‌روزرسانی کلمه‌ی عبور"}
            </Button>
          </div>
        </form>
    </div>
  )
}

