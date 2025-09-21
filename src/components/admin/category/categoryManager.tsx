"use client"

import React from "react"
import { useState, useEffect, FormEvent } from "react"
import { Edit, LucideListStart, Plus, Save, Trash2, X } from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  _id: string;
  name: string;
  group: string
  order: number;
}

interface groupedCategories {
  [group: string]: category[];
}

type FormCategory = {
  name: string
  group: string
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<category[]>([])
  const [groupedCategories, setGroupedCategories] = useState<groupedCategories>({});
  const [newCategory, setNewCategory] = useState<FormCategory>({ name: "", group: ""})
  const [editingId, setEditingId] = useState<string>("")
  const [editForm, setEditForm] = useState<FormCategory>({ name: "", group: ""})
  const [isReordering, setIsReordering] = useState<string | null>(null);

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
    // Group items by category
    const grouped: groupedCategories = {};

    categories.forEach((category) => {
      
            
        if (!grouped[category.group]) {
          grouped[category.group] = [];
        }
        // Only add if not already in this category group
        // if (
        //   !grouped[category.group].find(
        //     (existingCategory) => existingCategory.id === category.id
        //   )
        // ) {
          grouped[category.group].push(category);
        // }
    });

    // Sort items within each category by order
    Object.keys(grouped).forEach((group) => {
      grouped[group].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    setGroupedCategories(grouped);
    console.log(categories,groupedCategories)
  }, [categories]);

  useEffect(() => {
    setNewCategory({ name: "", group: ""})
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
      setNewCategory({ name: "", group: ""})
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
    setEditingId(category._id)
    console.log(category)
    setEditForm({ name: category.name, group: category.group})
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

    if (over && active.id !== over.id && isReordering) {
      try {
        // Find the category items
        const groupCategories = groupedCategories[isReordering] || []

        // Calculate the new order of items
        const oldIndex = groupCategories.findIndex((category) => category._id === active.id)
        const newIndex = groupCategories.findIndex((category) => category._id === over.id)

        // Create the new array with the updated order
        const updatedCategories = arrayMove([...groupCategories], oldIndex, newIndex)

        // Update the local state for immediate feedback
        const newGroupedCategories = { ...groupedCategories }
        newGroupedCategories[isReordering] = updatedCategories
        setGroupedCategories(newGroupedCategories)

        // Update the items array to reflect the new order
        const newCategories = [...categories]
        const categoriesToUpdate = newCategories.filter((category) => category.group === isReordering)

        // Remove the items from this category
        const otherCategories = newCategories.filter((category) => category.group !== isReordering)

        // Create a mapping of id to new order
        const orderMap = new Map()
        updatedCategories.forEach((category, index) => {
          if (category._id) {
            orderMap.set(category._id, index)
          }
        })

        // Update the order of the items
        categoriesToUpdate.forEach((category) => {
          if (category._id && orderMap.has(category._id)) {
            category.order = orderMap.get(category._id)
          }
        })

        // Combine the updated items with the other items
        setCategories([...otherCategories, ...categoriesToUpdate])

        // Get the ordered IDs from the updated array
        const orderedIds = updatedCategories.map((category) => category._id as string)

        // Save the new order to the database directly
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
        setIsReordering(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 border-2 border-teal-700 rounded-[0.125rem]">
        <h3 className="font-extrabold text-teal-700">افزودن دسته‌بندی جدید</h3>
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
            <Select
              value={newCategory.group}
              onValueChange={(value) => setNewCategory({ ...newCategory, group: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="انتخاب گروه" />
              </SelectTrigger>
              <SelectContent>
                {["صبحانه", "قلیان", "بار گرم", "بار سرد", "کیک و دسر", "غذاها"].map((group: string) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex">
          <Button type="submit">
            <Plus className="w-4 h-4" />
            افزودن دسته‌بندی
          </Button>
        </div>
      </form>
      <div className="space-y-4">
        {["صبحانه", "قلیان", "بار گرم", "بار سرد", "کیک و دسر", "غذاها"].map((group) => {
          const groupCategories = groupedCategories[group] || []
          return (
            <Card key={group} className="overflow-hidden">
              <CardHeader className="py-3 px-4 cursor-pointer">
                <div className="flex flex-row-reverse justify-between items-center text-teal-700">
                  <CardTitle className="text-lg font-extrabold flex items-center">
                    <h2>{group}</h2>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-3">
                {groupCategories.length === 0 ? (
                  <div className="text-center py-4 text-teal-600">
                    <p>دسته‌بندی‌ای در این گروه موجود نیست.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-row-reverse justify-between items-center mb-2 text-base text-amber-500">
                      {isReordering === group ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsReordering(null)}
                          className="border-amber-500"
                        >
                          <X className="w-4 h-4" />
                          انصراف
                        </Button>
                      ) : groupCategories.length > 1 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsReordering(group)}
                          disabled={isReordering !== null}
                          className="border-amber-500"
                        >
                          <LucideListStart className="h-5 w-5" />
                          <p>تغییر ترتیب گروه</p>
                        </Button>
                      ) : null}
                    </div>

                    {isReordering === group ? (
                      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                          items={groupCategories.map((category) => category._id as string)}
                          strategy={verticalListSortingStrategy}
                        >
                          {groupCategories.map((category) => (
                            <SortableCategoryItem
                              key={category._id}
                              category={category}
                              sortDisabled={editingId !== ""}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    ) : (
                      <div className="space-y-3">
                        {groupCategories.map((category) => {
                          if (editingId === category._id) return (
                            <Card key={category._id} className="overflow-hidden mb-3">
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
                                      <Select
                                        value={editForm.group}
                                        onValueChange={(value) => setEditForm({ ...editForm, group: value })}
                                        required
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="انتخاب گروه" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {["صبحانه", "قلیان", "بار گرم", "بار سرد", "کیک و دسر", "غذاها"].map((group: string) => (
                                            <SelectItem key={group} value={group}>
                                              {group}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button type="submit" size="sm">
                                      <Save className="w-4 h-4" />
                                      ذخیره
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingId("")}>
                                      <X className="w-4 h-4" />
                                      لغو
                                    </Button>
                                  </div>
                                </form>
                              </CardContent>
                            </Card>
                          ); else return (
                            <Card key={category._id} className="overflow-hidden">
                              <CardContent className="p-0">
                                <div className="p-3 flex flex-row-reverse gap-4 items-center">
                                  <div className="flex flex-row-reverse w-full justify-between items-center">
                                    <h3 className="font-extrabold text-teal-700">{category.name}</h3>
                                    <div className="flex flex-row-reverse justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="text-teal-700 hover:bg-teal-700 hover:text-amber-50"
                                          onClick={() => handleEditClick(category)}>
                                          <Edit className="w-4 h-4" />
                                          <span className="sr-only">ویرایش</span>
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className="group  hover:bg-amber-500 hover:border-amber-500" onClick={() => handleDeleteClick(category._id, category.name)}>
                                          <Trash2 className="w-4 h-4 text-amber-500 group-hover:text-amber-50" />
                                          <span className="sr-only">حذف</span>
                                        </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        {isReordering && (
          <div className="flex justify-center py-2">
            <p className="text-sm text-amber-600">ذخیره ترتیب جدید...</p>
          </div>
        )}
      </div>
    </div>
  )
}

