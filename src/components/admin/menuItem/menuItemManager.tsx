"use client";

import type React from "react";
import { useState, useEffect, FormEvent } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  LucideListStart,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from "@/lib/data/itemData";
import { getCategories } from "@/lib/data/categoryData";
import { useToast } from "@/components/ui/toastContext";

import ImageUploader from "../imageUploader";
import Image from "next/image";
import SortableMenuItem from "./sortableMenuItem";
import { deleteImage } from "@/lib/imageUtils";
import AvailabilityToggle from "./availabilityToggle";
import * as LucideIcons from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface item {
  id: string;
  name: string;
  price?: number
  categoryId: string;
  ingredients: string;
  image: string;
  order: number;
  available: boolean;
}

interface category {
  id: string;
  name: string;
  group: "صبحانه" | "قلیان" | "بار گرم" | "بار سرد" | "کیک و دسر" | "غذاها"
  order: number;
}

interface groupedItems {
  [categoryId: string]: item[];
}

type FormMenuItem = {
  name: string;
  price?: number;
  categoryId: string;
  ingredients: string;
  image: string;
  available: boolean;
};

export default function MenuItemManager({ isAdmin = true }) {
  const [items, setItems] = useState<item[]>([]);
  const [groupedItems, setGroupedItems] = useState<groupedItems>({});
  const [categories, setCategories] = useState<category[]>([]);
  const [newItem, setNewItem] = useState<FormMenuItem>({
    name: "",
    price: 0,
    categoryId: "",
    ingredients: "",
    image: "",
    available: true,
  });
  const [editingId, setEditingId] = useState<string>("");
  const [editForm, setEditForm] = useState<FormMenuItem>({
    name: "",
    price: 0,
    categoryId: "",
    ingredients: "",
    image: "",
    available: true,
  });
  const [isReordering, setIsReordering] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Make sure we're destructuring the toast function from useToast
  const { toast } = useToast();

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
    })
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Group items by category
    const grouped: groupedItems = {};

    items.forEach((item) => {
            
        if (!grouped[item.categoryId]) {
          grouped[item.categoryId] = [];
        }
        // Only add if not already in this category group
        if (
          !grouped[item.categoryId].find(
            (existingItem) => existingItem.id === item.id
          )
        ) {
          grouped[item.categoryId].push(item);
        }
    });

    // Sort items within each category by order
    Object.keys(grouped).forEach((categoryId) => {
      grouped[categoryId].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    setGroupedItems(grouped);

    // Expand all categories by default
    if (categories.length > 0) {
      const newExpanded = new Set<string>();
      categories.forEach((category) => newExpanded.add(category.id));
      setExpandedCategories(newExpanded);
    }
  }, [items, categories]);

  const loadData = async () => {
    const [itemsData, categoriesData] = await Promise.all([
      getMenuItems(),
      getCategories(),
    ]);
    setItems(itemsData);
    setCategories(categoriesData);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {

      await createMenuItem(newItem);
      setNewItem({
        name: "",
        price: 0,
        categoryId: "",
        ingredients: "",
        image: "",
        available: true,
      });
      await loadData();
      toast({
        title: "آیتم ایجاد شد!",
        description: `${newItem.name} به منو اضافه شد.`,
      });
    } catch (error: any) {
      toast({
        title: "خطا در ایجاد آیتم!",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (item: item) => {
    setEditingId(item.id);

    // Handle both old single categoryId and new multiple categoryIds
    // const categoryIds = Array.isArray(item.categoryIds)
    //   ? item.categoryIds.map((id) => (typeof id === "string" ? id : id.toString()))
    //   : item.categoryIds
    //     ? [typeof item.categoryIds === "string" ? item.categoryIds : item.categoryIds.toString()]
    //     : []

    setEditForm({
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      ingredients: item.ingredients || "",
      image: item.image || "",
      available: item.available,
    });
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      
      const formattedItem = {
        ...editForm,
        _id: editingId,
      };

      await updateMenuItem(editingId, formattedItem);
      setEditingId("");
      loadData();
      toast({
        title: "آیتم به‌روزرسانی شد!",
        description: `${editForm.name} به‌روزرسانی شد.`,
      });
    } catch (error: any) {
      toast({
        title: "خطا در به‌روزرسانی آیتم!",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`از حذف "${name}" مطمئنید؟`)) {
      try {
        const itemToDelete = items.find((item) => item.id === id);
        await deleteMenuItem(id);
        if (itemToDelete?.image) {
          try {
            await deleteImage(itemToDelete.image);
          } catch (error) {
            console.error("Failed to delete image:", error);
          }
        }
        loadData();
        toast({
          title: "آیتم حذف شد!",
          description: `${name} از منو حذف شد.`,
        });
      } catch (error: any) {
        toast({
          title: "خطا در حذف آیتم!",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && isReordering) {
      try {
        // Find the category items
        const categoryItems = groupedItems[isReordering] || []

        // Calculate the new order of items
        const oldIndex = categoryItems.findIndex((item) => item.id === active.id)
        const newIndex = categoryItems.findIndex((item) => item.id === over.id)

        // Create the new array with the updated order
        const updatedItems = arrayMove([...categoryItems], oldIndex, newIndex)

        // Update the local state for immediate feedback
        const newGroupedItems = { ...groupedItems }
        newGroupedItems[isReordering] = updatedItems
        setGroupedItems(newGroupedItems)

        // Update the items array to reflect the new order
        const newItems = [...items]
        const itemsToUpdate = newItems.filter((item) => item.categoryId === isReordering)

        // Remove the items from this category
        const otherItems = newItems.filter((item) => item.categoryId !== isReordering)

        // Create a mapping of id to new order
        const orderMap = new Map()
        updatedItems.forEach((item, index) => {
          if (item.id) {
            orderMap.set(item.id, index)
          }
        })

        // Update the order of the items
        itemsToUpdate.forEach((item) => {
          if (item.id && orderMap.has(item.id)) {
            item.order = orderMap.get(item.id)
          }
        })

        // Combine the updated items with the other items
        setItems([...otherItems, ...itemsToUpdate])

        // Get the ordered IDs from the updated array
        const orderedIds = updatedItems.map((item) => item.id as string)

        // Save the new order to the database directly
        await reorderMenuItems(isReordering, orderedIds)

        toast({
          title: "ترتیب آیتم‌ها تغییر یافت!",
          description: "",
        })
      } catch (error: any) {
        // If there's an error, reload the original order
        loadData()

        toast({
          title: "خطا در تغییر ترتیب آیتم‌ها!",
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
      {isAdmin && (
        <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white">
          <h3 className="font-semibold text-qqteal">افزودن آیتم‌ جدید</h3>
          <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                placeholder="عنوان آیتم"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                placeholder="قیمت"
                type="number"
                step="1"
                min="0"
                value={newItem.price || ""}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Textarea
                placeholder="مواد تشکیل دهنده (اختیاری)"
                value={newItem.ingredients}
                onChange={(e) => setNewItem({ ...newItem, ingredients: e.target.value })}
              />
            </div>
            <div>
              <Select
                value={newItem.categoryId}
                onValueChange={(value) => setNewItem({ ...newItem, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته‌بندی" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <ImageUploader key={`new-item-uploader-${newItem.image}`} value={newItem.image} onChange={(url) => setNewItem({ ...newItem, image: url })} />
            </div>
          </div>
          <div className="flex">
            <Button type="submit" className="bg-qqteal hover:bg-amber-600 ">
              <Plus className="w-4 h-4" />
              افزودن آیتم به منو
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {/* {items.map((item) => ( */}
        {categories.length === 0 ? (
          <div className="text-center py-8 text-qqbrown">
            <h3>دسته‌بندی‌ای موجود نیست! ابتدا یک دسته‌بندی ایجاد کنید.</h3>
          </div>
        ) : (
          categories.map((category) => {
            const categoryItems = groupedItems[category.id] || []
            const isExpanded = expandedCategories.has(category.id)

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4 cursor-pointer" onClick={() => toggleCategory(category.id)}>
                  <div className="flex flex-row-reverse justify-between items-center text-qqdarkbrown">
                    <CardTitle className="text-lg flex items-center">
                      <h2>{category.name}</h2>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 pb-3 px-3">
                    {categoryItems.length === 0 ? (
                      <div className="text-center py-4 text-qqbrown">
                        <h3>آیتمی در این دسته‌بندی موجود نیست.</h3>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isAdmin && (
                          <div className="flex flex-row-reverse justify-between items-center mb-2 text-base text-qqbrown">
                            {isReordering === category.id ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsReordering(null)}
                              >
                                <X className="w-4 h-4" />
                                انصراف
                              </Button>
                            ) : categoryItems.length > 1 ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsReordering(category.id)}
                                disabled={isReordering !== null}
                              >
                                <LucideListStart className="h-5 w-5" />
                                <p>تغییر ترتیب لیست</p>
                              </Button>
                            ) : null}
                          </div>
                        )}

                        {isReordering === category.id && isAdmin ? (
                          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext
                              items={categoryItems.map((item) => item.id as string)}
                              strategy={verticalListSortingStrategy}
                            >
                              {categoryItems.map((item) => (
                                <SortableMenuItem
                                  key={item.id}
                                  item={item}
                                  category={category}
                                  onEdit={handleEditClick}
                                  onDelete={handleDeleteClick}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <div className="space-y-3">
                            {categoryItems.map((item) => {
                              if (editingId === item.id && isAdmin) return (
                                <Card key={item.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <form onSubmit={handleUpdateSubmit} className="p-4 space-y-4">
                                      <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                          <Input
                                            placeholder="عنوان آیتم"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            required
                                          />
                                        </div>
                                        <div>
                                          <Input
                                            placeholder="قیمت"
                                            type="number"
                                            step="1"
                                            min="0"
                                            value={editForm.price || ""}
                                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                          />
                                        </div>
                                        <div>
                                          <Textarea
                                            placeholder="مواد تشکیل دهنده (اختیاری)"
                                            value={editForm.ingredients}
                                            onChange={(e) => setEditForm({ ...editForm, ingredients: e.target.value })}
                                          />
                                        </div>
                                        <div>
                                          <Select
                                            value={editForm.categoryId}
                                            onValueChange={(value) => setEditForm({ ...editForm, categoryId: value })}
                                            required
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="انتخاب دسته‌بندی" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                  {category.name}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <ImageUploader
                                            value={editForm.image}
                                            onChange={(url) => setEditForm({ ...editForm, image: url })}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex flex-row-reverse justify-end gap-2">
                                        <Button type="submit" size="sm" className="bg-green-500 hover:bg-green-600">
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
                                <Card key={item.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="p-4 flex flex-row-reverse gap-4 items-center">
                                      <div className="flex flex-col justify-between items-center gap-2">
                                        {item.image ? (
                                          <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" sizes="80" />
                                          </div>
                                        ) : (
                                          <div className="h-20 w-20 rounded-md bg-qqcream/20 text-qqbrown flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm">بدون عکس</span>
                                          </div>
                                        )}
                                        <AvailabilityToggle 
                                              itemId={item.id || ""}
                                              itemName={item.name}
                                              item={item}
                                              initialAvailable={item.available}
                                            />
                                      </div>
                                      <div className="flex flex-col w-full gap-2">
                                        <div className="flex flex-row-reverse justify-between">
                                          <div className="flex flex-row-reverse gap-1 items-center text-qqdarkbrown">
                                            <h3 className="font-medium">{item.name}</h3>
                                          </div>
                                          {item.price && <h3 className="text-base font-semibold text-qqdarkbrown">{formatCurrency(item.price)}</h3>}
                                        </div>
                                        {item.ingredients && (
                                          <span className="text-sm text-brown">{item.ingredients}</span>
                                        )}
                                          <div className="flex flex-row-reverse justify-end gap-2">
                                            {isAdmin && (
                                              <>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  className="bg-background hover:bg-white"
                                                  onClick={() => handleEditClick(item)}>
                                                  <Edit className="w-4 h-4" />
                                                  <span className="sr-only">ویرایش</span>
                                                </Button>
                                                <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  className="group bg-background hover:bg-red-500" onClick={() => handleDeleteClick(item.id, item.name)}>
                                                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-50" />
                                                  <span className="sr-only">حذف</span>
                                                </Button>
                                              </>
                                            )}
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
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
