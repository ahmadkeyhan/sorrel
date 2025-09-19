"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/toastContext"
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/data/userData"

type User = {
  id: string
  name: string
  // email: string
  password: string,
  role: "admin" | "employee"
}

type FormUser = {
  name: string
  // email: string
  password: string
  role: "admin" | "employee"
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<FormUser>({
    name: "",
    // email: "",
    password: "",
    role: "employee",
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormUser>({
    name: "",
    // email: "",
    password: "",
    role: "employee",
  })

  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (error: any) {
      toast({
        title: "خطا در بارگیری کاربران!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser(newUser)
      setNewUser({
        name: "",
        // email: "",
        password: "",
        role: "employee",
      })
      loadUsers()
      toast({
        title: "کاربر ایجاد شد!",
        description: `${newUser.name} به عنوان کارمند اضافه شد.`,
      })
    } catch (error: any) {
      toast({
        title: "خطا در ایجاد کاربر!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (user: User) => {
    setEditingId(user.id)
    setEditForm({
      name: user.name,
      // email: user.email,
      password: "", // Don't show password
      role: user.role,
    })
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        const updateData = {
          name: editForm.name,
          // email: editForm.email,
          role: editForm.role,
          // password: editForm.password
        }
        // Only include password if it was changed
        if (editForm.password) {
          Object.assign(updateData, { password: editForm.password })
        }
        await updateUser(editingId, updateData)
        setEditingId(null)
        loadUsers()
        toast({
          title: "کاربر به‌روزرسانی شد!",
          description: `${editForm.name} به‌روزرسانی شد.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "خطا در به‌روزرسانی کاربر",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`از حذف "${name}" مطمئنید؟`)) {
      try {
        await deleteUser(id)
        loadUsers()
        toast({
          title: "کاربر حذف شد!",
          description: `${name} حذف شد.`,
        })
      } catch (error: any) {
        toast({
          title: "خطا در حذف کاربر!",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white">
        <h3 className="font-medium">
          افزودن کارمند جدید
        </h3>
        <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              placeholder="نام کاربری(ترجیحاً لاتین)"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              placeholder="کلمه‌ی عبور"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="flex">
          <Button type="submit" className="bg-qqteal hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            افزودن کارمند
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="font-medium text-slate-700">لیست کارمندان</h3>
        {users.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>کارمندی ثبت نشده‌است.</p>
          </div>
        ) : (
          users.filter((user) => user.role === "employee").map((user) =>
            editingId === user.id ? (
              <Card key={user.id} className="overflow-hidden mb-3">
                <CardContent className="p-0">
                  <form onSubmit={handleUpdateSubmit} className="p-4 space-y-4">
                    <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Input
                          placeholder="نام کاربری"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="کلمه‌ی عبور جدید"
                          type="password"
                          value={editForm.password}
                          onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
                        <Save className="w-4 h-4 mr-2" />
                        ذخیره
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4 mr-2" />
                        لغو
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card key={user.id} className="overflow-hidden mb-3">
                <CardContent className="p-0">
                  <div className="p-4 flex flex-row-reverse justify-between items-center">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                    </div>
                    <div className="flex flex-row-reverse gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(user.id, user.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )
        )}
      </div>
    </div>
  )
}

