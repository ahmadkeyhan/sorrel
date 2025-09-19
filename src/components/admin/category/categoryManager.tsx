"use client"

import React from "react"
import { useState, useEffect, FormEvent } from "react"
import { Plus, Save, X } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textArea"
import { Card, CardContent } from "@/components/ui/card"
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  reorderCategories 
} from "@/lib/data/categoryData"
import { useToast } from "@/components/ui/toastContext"
import SortableCategoryItem from "./sortableCategoryItem"

interface category {
    id: string, 
    name: string,
    description: string,
    bgColor: string,
    textColor: string,
    order: number
}

type FormCategory = {
  name: string
  description: string
  bgColor: string
  textColor: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<category[]>([])
  const [newCategory, setNewCategory] = useState<FormCategory>({ name: "", description: "", bgColor: "", textColor: ""})
  const [editingId, setEditingId] = useState<string>("")
  const [editForm, setEditForm] = useState<FormCategory>({ name: "", description: "", bgColor: "", textColor: ""})
  const [isReordering, setIsReordering] = useState(false)

  // Set up sensors for drag and drop with improved mobile support
  const sensors = useSensors(
    // PointerSensor works for both mouse and touch on modern browsers
    useSensor(PointerSensor, {
      activationConstraint: {
        // distance: 8, // 8px movement required before drag starts
        delay: 100, // Shorter delay for better responsiveness
        tolerance: 10, // Higher tolerance for Android touch jitter
      },
    }),
    // Add TouchSensor as a fallback for older mobile browsers
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0, // No delay for Android
        tolerance: 15, // Higher tolerance for Android touch events
      },
    }),
    // Keep keyboard support for accessibility
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    setNewCategory({ name: "", description: "", bgColor: "", textColor: ""})
  }, [categories])

  const loadCategories = async () => {
    const data = await getCategories()
    data.sort((a: category, b: category) => (a.order || 0) - (b.order || 0))
    setCategories(data)
    
  }

  const { toast } = useToast()

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
       // Set order to be the last item
       const formattedCategory = {...newCategory}
      await createCategory(formattedCategory)
      setNewCategory({ name: "", description: "", bgColor: "", textColor: ""})
      await loadCategories()
      toast({
        title: "دسته‌بندی‌ ایجاد شد!",
        description: `${newCategory.name} به منو اضافه شد.`,
      })
    } catch (error: any) {
      toast({
        title: "خطا در ایجاد دسته‌بندی‌!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (category: category) => {
    setEditingId(category.id)
    setEditForm({ name: category.name, description: category.description, bgColor: category.bgColor, textColor: category.textColor})
  }

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await updateCategory(editingId, {...editForm, _id: editingId})
      setEditingId("")
      loadCategories()
      toast({
        title: "دسته‌بندی‌ به‌روزرسانی شد!",
        description: `${editForm.name} به‌روزرسانی شد.`,
      })
    } catch (error: any) {
      toast({
        title: "خطا در به‌روزرسانی دسته‌بندی‌!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`از حذف "${name}" مطمئنید؟`)) {
      try {
        await deleteCategory(id)
        loadCategories()
        toast({
          title: "دسته‌بندی‌ حذف شد!",
          description: `${name} از منو حذف شد.`,
        })
      } catch (error: any) {
        toast({
          title: "خطا در حذف دسته‌بندی‌!",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setIsReordering(true)

      try {
        // Calculate the new order of categories
        const oldIndex = categories.findIndex((item) => item.id === active.id)
        const newIndex = categories.findIndex((item) => item.id === over.id)

        // Create the new array with the updated order
        const updatedCategories = arrayMove([...categories], oldIndex, newIndex)

        // Update the local state for immediate feedback
        setCategories(updatedCategories)

        // Get the ordered IDs from the updated array
        const orderedIds = updatedCategories.map((category) => category.id)

        // Save the new order to the database
        await reorderCategories(orderedIds)

        toast({
          title: "ترتیب دسته‌بندی‌ها تغییر یافت!",
          description: "",
        })
      } catch (error: any) {
        // If there's an error, reload the original order
        loadCategories()

        toast({
          title: "خطا در تغییر ترتیب دسته‌بندی‌ها!",
          description: error.message || "",
          variant: "destructive",
        })
      } finally {
        setIsReordering(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white">
        <h3 className="font-medium">افزودن دسته‌بندی جدید</h3>
        <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              placeholder="عنوان دسته‌بندی"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="توضیحات (اختیاری)"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="h-10"
            />
          </div>
        </div>
        <div className="flex">
          <Button type="submit" className="bg-qqteal hover:bg-amber-600">
            <Plus className="w-4 h-4" />
            افزودن دسته‌بندی
          </Button>
        </div>
      </form>
      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map((cat) => cat.id)} strategy={verticalListSortingStrategy}>
            {categories.map((category) =>
              editingId === category.id ? (
                <Card key={category.id} className="overflow-hidden mb-3">
                  <CardContent className="p-0">
                    <form onSubmit={handleUpdateSubmit} className="p-4 space-y-4">
                      <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Input
                            placeholder="عنوان دسته‌بندی"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Textarea
                            placeholder="توضیحات (اختیاری)"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
                          <Save className="w-4 h-4 mr-2" />
                          ذخیره
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingId("")}>
                          <X className="w-4 h-4 mr-2" />
                          لغو
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <SortableCategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  sortDisabled={editingId !== ""}
                />
              ),
            )}
          </SortableContext>
        </DndContext>
        {isReordering && (
          <div className="flex justify-center py-2">
            <p className="text-sm text-amber-600">ذخیره ترتیب جدید...</p>
          </div>
        )}
      </div>
    </div>
  )
}

