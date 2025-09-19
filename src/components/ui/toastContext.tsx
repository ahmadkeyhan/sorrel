"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "default" | "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const toast = useCallback(
    ({
      title,
      description,
      variant = "default",
    }: { title: string; description?: string; variant?: "default" | "destructive" }) => {
      const type: ToastType = variant === "destructive" ? "error" : "default"
      context.addToast({ title, description, type })
    },
    [context],
  )

  return { toast }
}

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!

  return (
    <div className={`fixed top-0 right-0 z-50 p-4 ${toasts.length === 0 ? "py-0" : ""} space-y-4 w-full max-w-sm`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = {
    default: "bg-white",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  }

  const textColor = {
    default: "text-qqdarkbrown",
    success: "text-qqteal",
    error: "text-qqorange",
    warning: "text-amber-800",
    info: "text-blue-800",
  }

  return (
    <div
      className={cn(
        "rounded-lg shadow-md border p-4 transform transition-all duration-300 ease-in-out",
        bgColor[toast.type],
        "animate-in slide-in-from-right",
      )}
    >
      <div className="flex justify-between items-start">
        <h3 className={cn("font-medium", textColor[toast.type])}>{toast.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
      {toast.description && <p className={cn("text-base mt-1", textColor[toast.type])}>{toast.description}</p>}
    </div>
  )
}

