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

interface priceListItem {
  subItem: string;
  price: number;
}

interface item {
  id: string;
  name: string;
  description: string;
  iconName: string;
  priceList: priceListItem[];
  categoryIds: string[];
  ingredients: string;
  image: string;
  order: number;
  available: boolean;
}

interface category {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface groupedItems {
  [categoryId: string]: item[];
}

type FormMenuItem = {
  name: string;
  description: string;
  iconName: string;
  priceList: priceListItem[];
  categoryIds: string[];
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
    description: "",
    iconName: "",
    priceList: [{ subItem: "", price: 0 }],
    categoryIds: [],
    ingredients: "",
    image: "",
    available: true,
  });
  const [editingId, setEditingId] = useState<string>("");
  const [editForm, setEditForm] = useState<FormMenuItem>({
    name: "",
    description: "",
    iconName: "",
    priceList: [{ subItem: "", price: 0 }],
    categoryIds: [],
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
      // Handle both old single categoryId and new multiple categoryIds
      let categoryIds: string[] = []

      if (Array.isArray(item.categoryIds)) {
        categoryIds = item.categoryIds.map((id : any) => (typeof id === "string" ? id : id.toString()))
      } else if (item.categoryIds) {
        categoryIds = [item.categoryIds]
      }

      categoryIds.forEach((categoryId: string) => {
        if (!grouped[categoryId]) {
          grouped[categoryId] = [];
        }
        // Only add if not already in this category group
        if (
          !grouped[categoryId].find(
            (existingItem) => existingItem.id === item.id
          )
        ) {
          grouped[categoryId].push(item);
        }
      });
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

  // Handle category selection for new item
  const handleNewItemCategoryChange = (
    categoryId: string,
    checked: boolean
  ) => {
    const updatedCategoryIds = checked
      ? [...newItem.categoryIds, categoryId]
      : newItem.categoryIds.filter((id) => id !== categoryId);

    setNewItem({ ...newItem, categoryIds: updatedCategoryIds });
  };

  // Handle category selection for edit form
  const handleEditFormCategoryChange = (
    categoryId: string,
    checked: boolean
  ) => {
    const updatedCategoryIds = checked
      ? [...editForm.categoryIds, categoryId]
      : editForm.categoryIds.filter((id) => id !== categoryId);

    setEditForm({ ...editForm, categoryIds: updatedCategoryIds });
  };

  // Add a price list item to the new item form
  const addPriceListItem = () => {
    setNewItem({
      ...newItem,
      priceList: [...newItem.priceList, { subItem: "", price: 0 }],
    });
  };

  // Remove a price list item from the new item form
  const removePriceListItem = (index: number) => {
    if (newItem.priceList.length <= 1) return;

    const updatedPriceList = [...newItem.priceList];
    updatedPriceList.splice(index, 1);

    setNewItem({
      ...newItem,
      priceList: updatedPriceList,
    });
  };

  // Update a price list item in the new item form
  const updatePriceListItem = (
    index: number,
    field: "subItem" | "price",
    value: string | number
  ) => {
    const updatedPriceList = [...newItem.priceList];
    updatedPriceList[index] = {
      ...updatedPriceList[index],
      [field]: field === "price" ? Number(value) : value,
    };

    setNewItem({
      ...newItem,
      priceList: updatedPriceList,
    });
  };

  // Add a price list item to the edit form
  const addEditPriceListItem = () => {
    setEditForm({
      ...editForm,
      priceList: [...editForm.priceList, { subItem: "", price: 0 }],
    });
  };

  // Remove a price list item from the edit form
  const removeEditPriceListItem = (index: number) => {
    if (editForm.priceList.length <= 1) return;

    const updatedPriceList = [...editForm.priceList];
    updatedPriceList.splice(index, 1);

    setEditForm({
      ...editForm,
      priceList: updatedPriceList,
    });
  };

  // Update a price list item in the edit form
  const updateEditPriceListItem = (
    index: number,
    field: "subItem" | "price",
    value: string | number
  ) => {
    const updatedPriceList = [...editForm.priceList];
    updatedPriceList[index] = {
      ...updatedPriceList[index],
      [field]: field === "price" ? Number(value) : value,
    };

    setEditForm({
      ...editForm,
      priceList: updatedPriceList,
    });
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Validate that at least one category is selected
      if (newItem.categoryIds.length === 0) {
        toast({
          title: "دسته‌بندی‌ای انتخاب نشده!",
          description:
            "حداقل یک دسته‌بندی انتخاب کنید.",
          variant: "destructive",
        });
        return;
      }

      // Validate price list if using it
      const invalidItems = newItem.priceList.filter(
        (item) => !item.subItem || item.price <= 0
      );
      if (invalidItems.length > 0) {
        toast({
          title: "لیست قیمت نامعتبر:",
          description:
            "همه اقلام لیست قیمت باید دارای نام و قیمتی بزرگتر از صفر باشند.",
          variant: "destructive",
        });
        return;
      }

      const formattedItem = {
        ...newItem,
        // price: Number.parseFloat(newItem.price)
      };

      await createMenuItem(formattedItem);
      setNewItem({
        name: "",
        description: "",
        iconName: "",
        priceList: [{ subItem: "", price: 0 }],
        categoryIds: [],
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
      description: item.description,
      iconName: item.iconName,
      priceList:
        item.priceList && item.priceList.length > 0
          ? item.priceList
          : [{ subItem: "", price: 0 }],
      categoryIds: item.categoryIds,
      ingredients: item.ingredients || "",
      image: item.image || "",
      available: item.available,
    });
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Validate that at least one category is selected
      if (editForm.categoryIds.length === 0) {
        toast({
          title: "دسته‌بندی‌ای انتخاب نشده!",
          description:
            "حداقل یک دسته‌بندی انتخاب کنید.",
          variant: "destructive",
        });
        return;
      }

      const invalidItems = editForm.priceList.filter(
        (item) => !item.subItem || item.price <= 0
      );
      if (invalidItems.length > 0) {
        toast({
          title: "لیست قیمت نامعتبر:",
          description:
            "همه اقلام لیست قیمت باید دارای نام و قیمتی بزرگتر از صفر باشند.",
          variant: "destructive",
        });
        return;
      }

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
    const { active, over } = event;

    if (over && active.id !== over.id && isReordering) {
      try {
        // Find the category items
        const categoryItems = groupedItems[isReordering] || [];

        // Calculate the new order of items
        const oldIndex = categoryItems.findIndex(
          (item) => item.id === active.id
        );
        const newIndex = categoryItems.findIndex((item) => item.id === over.id);

        // Create the new array with the updated order
        const updatedItems = arrayMove([...categoryItems], oldIndex, newIndex);

        // Update the local state for immediate feedback
        const newGroupedItems = { ...groupedItems };
        newGroupedItems[isReordering] = updatedItems;
        setGroupedItems(newGroupedItems);

        // Update the items array to reflect the new order
        const newItems = [...items];
        const itemsToUpdate = newItems.filter((item) => {
          const categoryIds = Array.isArray(item.categoryIds)
            ? item.categoryIds
            : [item.categoryIds];
          return categoryIds.includes(isReordering);
        });

        // Remove the items from this category
        const otherItems = newItems.filter((item) => {
          const categoryIds = Array.isArray(item.categoryIds)
            ? item.categoryIds
            : [item.categoryIds];
          return !categoryIds.includes(isReordering);
        });

        // Create a mapping of id to new order
        const orderMap = new Map();
        updatedItems.forEach((item, index) => {
          if (item.id) {
            orderMap.set(item.id, index);
          }
        });

        // Update the order of the items
        itemsToUpdate.forEach((item) => {
          if (item.id && orderMap.has(item.id)) {
            item.order = orderMap.get(item.id);
          }
        });

        // Combine the updated items with the other items
        setItems([...otherItems, ...itemsToUpdate]);

        // Get the ordered IDs from the updated array
        const orderedIds = updatedItems.map((item) => item.id as string);

        // Save the new order to the database directly
        await reorderMenuItems(isReordering, orderedIds);

        toast({
          title: "ترتیب آیتم‌ها تغییر یافت!",
          description: "",
        });
      } catch (error: any) {
        // If there's an error, reload the original order
        loadData();

        toast({
          title: "خطا در تغییر ترتیب آیتم‌ها!",
          description: error.message || "",
          variant: "destructive",
        });
      } finally {
        setIsReordering(null);
      }
    }
  };

  // Helper function to get category names for an item
  const getCategoryNames = (item: item) => {
    const categoryIds = Array.isArray(item.categoryIds)
      ? item.categoryIds
      : [item.categoryIds];
    return categoryIds
      .map((categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Unknown Category";
      })
      .join(", ");
  };

  // Get the price range if there's a price list
  const getPriceRange = (item: item) => {
    if (item.priceList.length === 1) {
      return item.priceList[0].price;
    }

    if (item.priceList.length > 1) {
      const prices = item.priceList.map((p: priceListItem) => p.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      if (minPrice === maxPrice) return minPrice;
      return `${minPrice} - ${maxPrice}`;
    }
  };

  return (
    <div className="space-y-6">
      {isAdmin && (
        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4 p-4 border border-slate-200 rounded-lg bg-white"
        >
          <h3 className="font-semibold text-qqteal">افزودن آیتم‌ جدید</h3>
          <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                placeholder="عنوان آیتم"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Textarea
                placeholder="توضیحات (اختیاری)"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-medium text-qqteal">
                  لیست زیرآیتم‌ها
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPriceListItem}
                  className="h-8 text-base"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  ایجاد زیرآیتم‌
                </Button>
              </div>
              {newItem.priceList.map((priceItem, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="نام زیرآیتم"
                    value={priceItem.subItem}
                    onChange={(e) =>
                      updatePriceListItem(index, "subItem", e.target.value)
                    }
                    required
                    className="flex-1"
                  />
                  <Input
                    placeholder="قیمت"
                    type="number"
                    step="0.01"
                    min="0"
                    value={priceItem.price || ""}
                    onChange={(e) =>
                      updatePriceListItem(index, "price", e.target.value)
                    }
                    required
                    className="w-24"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePriceListItem(index)}
                    disabled={newItem.priceList.length <= 1}
                    className="h-8 w-8 text-red-500"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div>
              <Textarea
                placeholder="مواد تشکیل دهنده (اختیاری)"
                value={newItem.ingredients}
                onChange={(e) =>
                  setNewItem({ ...newItem, ingredients: e.target.value })
                }
              />
            </div>

            {/* Categories Selection */}
            <div className="sm:col-span-2">
              <Label className="text-sm font-medium mb-2 block">
                دسته‌بندی‌ها
              </Label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2 gap-1"
                  >
                    <Checkbox
                      id={`new-category-${category.id}`}
                      checked={newItem.categoryIds.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleNewItemCategoryChange(
                          category.id,
                          checked as boolean
                        )
                      }
                    />
                    <Label
                      htmlFor={`new-category-${category.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              {newItem.categoryIds.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  حداقل یک دسته‌بندی انتخاب کنید.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <ImageUploader
                key={`new-item-uploader-${newItem.image}`}
                value={newItem.image}
                onChange={(url) => setNewItem({ ...newItem, image: url })}
              />
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
            const categoryItems = groupedItems[category.id] || [];
            const isExpanded = expandedCategories.has(category.id);

            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader
                  className="py-3 px-4 cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex flex-row-reverse justify-between items-center text-qqdarkbrown">
                    <CardTitle className="text-lg flex items-center">
                      <h2>{category.name}</h2>
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
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
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={categoryItems.map(
                                (item) => item.id as string
                              )}
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
                              const IconComponent = item.iconName
                                ? (LucideIcons as any)[item.iconName]
                                : null;

                              if (editingId === item.id && isAdmin)
                                return (
                                  <Card
                                    key={item.id}
                                    className="overflow-hidden"
                                  >
                                    <CardContent className="p-0">
                                      <form
                                        onSubmit={handleUpdateSubmit}
                                        className="p-4 space-y-4"
                                      >
                                        <div
                                          dir="rtl"
                                          className="grid gap-4 sm:grid-cols-2"
                                        >
                                          <div>
                                            <Input
                                              placeholder="عنوان آیتم"
                                              value={editForm.name}
                                              onChange={(e) =>
                                                setEditForm({
                                                  ...editForm,
                                                  name: e.target.value,
                                                })
                                              }
                                              required
                                            />
                                          </div>
                                          <div className="sm:col-span-2">
                                            <Textarea
                                              placeholder="توضیحات (اختیاری)"
                                              value={editForm.description}
                                              onChange={(e) =>
                                                setEditForm({
                                                  ...editForm,
                                                  description: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          <div className="sm:col-span-2 space-y-3">
                                            <div className="flex justify-between items-center">
                                              <h3 className="text-base font-medium text-qqteal">
                                                لیست زیرآیتم‌ها
                                              </h3>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addEditPriceListItem}
                                                className="h-8 text-base"
                                              >
                                                <PlusCircle className="h-4 w-4 mr-1" />
                                                ایجاد زیرآیتم
                                              </Button>
                                            </div>

                                            {editForm.priceList.map(
                                              (priceItem, index) => (
                                                <div
                                                  key={index}
                                                  className="flex items-center gap-2"
                                                >
                                                  <Input
                                                    placeholder="Variation Name (e.g. Small, Medium, Large)"
                                                    value={priceItem.subItem}
                                                    onChange={(e) =>
                                                      updateEditPriceListItem(
                                                        index,
                                                        "subItem",
                                                        e.target.value
                                                      )
                                                    }
                                                    required
                                                    className="flex-1"
                                                  />
                                                  <Input
                                                    placeholder="Price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={
                                                      priceItem.price || ""
                                                    }
                                                    onChange={(e) =>
                                                      updateEditPriceListItem(
                                                        index,
                                                        "price",
                                                        e.target.value
                                                      )
                                                    }
                                                    required
                                                    className="w-24"
                                                  />
                                                  <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                      removeEditPriceListItem(
                                                        index
                                                      )
                                                    }
                                                    disabled={
                                                      editForm.priceList
                                                        .length <= 1
                                                    }
                                                    className="h-8 w-8 text-red-500"
                                                  >
                                                    <MinusCircle className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              )
                                            )}
                                          </div>
                                          <div>
                                            <Textarea
                                              placeholder="مواد تشکیل دهنده (اختیاری)"
                                              value={editForm.ingredients}
                                              onChange={(e) =>
                                                setEditForm({
                                                  ...editForm,
                                                  ingredients: e.target.value,
                                                })
                                              }
                                            />
                                          </div>
                                          {/* Categories Selection for Edit */}
                                          <div className="sm:col-span-2">
                                            <Label className="text-sm font-medium mb-2 block">
                                              دسته‌بندی‌ها
                                            </Label>
                                            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md">
                                              {categories.map((category) => (
                                                <div
                                                  key={category.id}
                                                  className="flex items-center gap-1 space-x-2"
                                                >
                                                  <Checkbox
                                                    id={`edit-category-${category.id}`}
                                                    checked={editForm.categoryIds.includes(
                                                      category.id
                                                    )}
                                                    onCheckedChange={(
                                                      checked
                                                    ) =>
                                                      handleEditFormCategoryChange(
                                                        category.id,
                                                        checked as boolean
                                                      )
                                                    }
                                                  />
                                                  <Label
                                                    htmlFor={`edit-category-${category.id}`}
                                                    className="text-sm font-normal cursor-pointer"
                                                  >
                                                    {category.name}
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                            {editForm.categoryIds.length ===
                                              0 && (
                                              <p className="text-sm text-red-500 mt-1">
                                                حداقل یک دسته‌بندی انتخاب کنید.
                                              </p>
                                            )}
                                          </div>
                                          <div>
                                            <ImageUploader
                                              value={editForm.image}
                                              onChange={(url) =>
                                                setEditForm({
                                                  ...editForm,
                                                  image: url,
                                                })
                                              }
                                            />
                                          </div>
                                          {/* <div className="sm:col-span-2">
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id="available-edit"
                                              checked={editForm.available}
                                              onCheckedChange={(checked) =>
                                                setEditForm({ ...editForm, available: checked })
                                              }
                                            />
                                            <Label htmlFor="available-edit">
                                              {editForm.available ? "موجود" : "ناموجود"}
                                            </Label>
                                          </div>
                                        </div> */}
                                        </div>
                                        <div className="flex flex-row-reverse justify-end gap-2">
                                          <Button
                                            type="submit"
                                            size="sm"
                                            className="bg-green-500 hover:bg-green-600"
                                          >
                                            <Save className="w-4 h-4" />
                                            ذخیره
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditingId("")}
                                          >
                                            <X className="w-4 h-4" />
                                            لغو
                                          </Button>
                                        </div>
                                      </form>
                                    </CardContent>
                                  </Card>
                                );
                              else
                                return (
                                  <Card
                                    key={item.id}
                                    className="overflow-hidden"
                                  >
                                    <CardContent className="p-0">
                                      <div className="p-4 flex flex-row-reverse gap-4 items-center">
                                        <div className="flex flex-col justify-between items-center gap-2">
                                          {item.image ? (
                                            <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                                              <Image
                                                src={
                                                  item.image ||
                                                  "/placeholder.svg"
                                                }
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="80"
                                              />
                                            </div>
                                          ) : (
                                            <div className="h-20 w-20 rounded-md bg-qqcream/20 text-qqbrown flex items-center justify-center flex-shrink-0">
                                              <span className="text-sm">
                                                بدون عکس
                                              </span>
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
                                              {IconComponent && (
                                                <IconComponent className="w-4 h-4" />
                                              )}
                                              {item.iconName === "both" && (
                                                <>
                                                  <LucideIcons.Hand className="w-4 h-4" />
                                                  <LucideIcons.Snowflake className="w-4 h-4" />
                                                </>
                                              )}
                                              <h3 className="font-medium">
                                                {item.name}
                                              </h3>
                                            </div>
                                            {item.priceList.length === 1 && (
                                              <h3 className="text-base font-semibold text-qqdarkbrown">
                                                {formatCurrency(
                                                  item.priceList[0].price
                                                )}
                                              </h3>
                                            )}
                                          </div>
                                          <p className="text-base text-qqbrown text-right">
                                            {item.description}
                                          </p>
                                          {item.priceList.length > 1 && (
                                            <div className="mt-1 flex flex-col gap-1">
                                              {item.priceList.map(
                                                (subItem, index) => (
                                                  <div
                                                    key={index}
                                                    className="text-base px-2 -ml-2 py-0.5 flex flex-row-reverse justify-between text-qqdarkbrown border-b border-amber-100 last:border-0"
                                                  >
                                                    <p>{subItem.subItem}</p>
                                                    <h3 className="font-semibold">
                                                      {formatCurrency(
                                                        subItem.price
                                                      )}
                                                    </h3>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          )}
                                          {item.ingredients && (
                                            <span className="text-sm text-brown">
                                              {item.ingredients}
                                            </span>
                                          )}

                                          {/* Show categories this item belongs to */}
                                          <div className="mt-1 flex flex-wrap gap-1">
                                            <span className="text-xs px-2 py-0.5 bg-amber-50 rounded-full text-amber-700">
                                              دسته‌بندی‌ها:{" "}
                                              {getCategoryNames(item)}
                                            </span>
                                          </div>

                                          <div className="flex flex-row-reverse justify-end gap-2">
                                            {isAdmin && (
                                              <>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="bg-background hover:bg-white"
                                                  onClick={() =>
                                                    handleEditClick(item)
                                                  }
                                                >
                                                  <Edit className="w-4 h-4" />
                                                  <span className="sr-only">
                                                    ویرایش
                                                  </span>
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="group bg-background hover:bg-red-500"
                                                  onClick={() =>
                                                    handleDeleteClick(
                                                      item.id,
                                                      item.name
                                                    )
                                                  }
                                                >
                                                  <Trash2 className="w-4 h-4 text-red-500 group-hover:text-red-50" />
                                                  <span className="sr-only">
                                                    حذف
                                                  </span>
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
