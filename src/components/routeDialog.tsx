"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export default function RouteDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [dialogData, setDialogData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const checkForDialog = async () => {
      // Reset state when route changes
      setIsLoading(true)
      setDialogData(null)
      setIsOpen(false)

      try {
        // Fetch dialog for current route
        const response = await fetch(`/api/dialogs?route=${encodeURIComponent(pathname)}`)

        if (!response.ok) {
          setIsLoading(false)
          return
        }

        const data = await response.json()

        if (data.success && data.dialog) {
            // Check if user has already seen this dialog by ID
          const seenDialogs = JSON.parse(localStorage.getItem("seenDialogs") || "[]")

          // If user has seen this dialog ID, don't show it again
          if (seenDialogs.includes(data.dialog.id)) {
            setIsLoading(false)
            return
          }

          setDialogData(data.dialog)
          setIsOpen(true)
        }
      } catch (error) {
        console.error("Error fetching dialog:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (pathname) {
      checkForDialog()
    }
  }, [pathname])

  const handleClose = () => {
    // Mark this dialog as seen by ID
    if (dialogData && dialogData.id) {
      const seenDialogs = JSON.parse(localStorage.getItem("seenDialogs") || "[]")

      // Add this dialog ID to the list of seen dialogs if it's not already there
      if (!seenDialogs.includes(dialogData.id)) {
        seenDialogs.push(dialogData.id)
        localStorage.setItem("seenDialogs", JSON.stringify(seenDialogs))
      }
    }

    setIsOpen(false)
  }

  if (isLoading || !dialogData) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] rounded-lg overflow-hidden p-0">

        {dialogData.image ? (
          <div className="relative w-full h-[200px] rounded-t-md overflow-hidden">
            <Image src={dialogData.image || "/placeholder.svg"} alt={dialogData.title} fill className="object-cover" />
          </div>
        ) : <div className="mb-10"></div>}

        <div className="p-4 pt-0 space-y-2">
            <DialogTitle>{dialogData.title}</DialogTitle>
            <DialogDescription>{dialogData.description}</DialogDescription>
            <div className="flex justify-end">
            <Button onClick={handleClose}>متوجه شدم!</Button>
            </div>
        </div>

        <DialogClose asChild>
            <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/90 text-qqorange"
            onClick={handleClose}
            >
            </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

