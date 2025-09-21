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
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    reorderProducts
} from "@/lib/data/productData"
import { useToast } from "@/components/ui/toastContext"
import SortableProduct from "./sortableProduct"
import { IProduct } from "@/models/Product"
import ImageUploader from "../imageUploader"
import { deleteImage } from "@/lib/imageUtils"

type Product = {
  _id: string
  name: string
  description?: string
  price: number
  image: string
  order: number
}

// type FormProduct = Omit<IProduct, "createdAt" | "updatedAt">

type FormProduct = {
    name: string
    description: string
    price: string
    image: string
  }


export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<FormProduct>({ 
    name: "", 
    description: "",
    image: "",
    price: ""
    })
  const [editingId, setEditingId] = useState<string>("")
  const [editForm, setEditForm] = useState<FormProduct>({ 
    name: "", 
    description: "",
    image: "",
    price: ""
    })
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
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const data = await getAllProducts()
    data.sort((a: Product, b: Product) => (a.order || 0) - (b.order || 0))
    setProducts(data)
  }

  const { toast } = useToast()

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
       // Set order to be the last item
      await createProduct({...newProduct, price: Number.parseFloat(newProduct.price)})
      setNewProduct({ 
        name: "", 
        description: "",
        image: "",
        price: ""
        })
      loadProducts()
      toast({
        title: "محصول ایجاد شد!",
        description: `${newProduct.name} به منو اضافه شد.`,
      })
    } catch (error: any) {
      toast({
        title: "خطا در ایجاد محصول!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleEditClick = (product: Product) => {
    setEditingId(product._id)
    setEditForm({ 
        name: product.name, 
        description: product.description ? product.description : "",
        image: product.image ? product.image : "",
        price: product.price ? product.price.toString() : ""
        })
  }

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await updateProduct(editingId, {...editForm, _id: editingId, price: Number.parseFloat(editForm.price)})
      setEditingId("")
      loadProducts()
      toast({
        title: "محصول به‌روزرسانی شد!",
        description: `${editForm.name} به‌روزرسانی شد.`,
      })
    } catch (error: any) {
      toast({
        title: "خطا در به‌روزرسانی محصول!",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = async (id: string, name: string) => {
    if (window.confirm(`از حذف "${name}" مطمئنید؟`)) {
      try {
        const productToDelete = products.find((product) => product._id === id)
        await deleteProduct(id)
        if (productToDelete?.image) {
          try {
            await deleteImage(productToDelete.image)
          } catch (error) {
            console.error("Failed to delete image:", error)
          }
        }
        loadProducts()
        toast({
          title: "محصول حذف شد!",
          description: `${name} از منو حذف شد.`,
        })
      } catch (error: any) {
        toast({
          title: "خطا در حذف محصول!",
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
        // Calculate the new order of products
        const oldIndex = products.findIndex((product) => product._id === active.id)
        const newIndex = products.findIndex((product) => product._id === over.id)

        // Create the new array with the updated order
        const updatedProducts = arrayMove([...products], oldIndex, newIndex)

        // Update the local state for immediate feedback
        setProducts(updatedProducts)

        // Get the ordered IDs from the updated array
        const orderedIds = updatedProducts.map((product) => product._id)

        // Save the new order to the database
        await reorderProducts(orderedIds)

        toast({
          title: "ترتیب محصولات به‌روزرسانی شد.",
        })
      } catch (error: any) {
        // If there's an error, reload the original order
        loadProducts()

        toast({
          title: "خطا در به‌روزرسانی ترتیب محصولات",
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
      <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 border-2 border-teal-700 rounded-[0.125rem]">
        <h3 className="font-extrabold text-teal-700">افزودن محصول جدید</h3>
        <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              placeholder="عنوان محصول"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-start items-center gap-2">
            <Input
              placeholder="قیمت"
              type="number"
              step="0.01"
              min="0"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              className="w-1/3"
            />
            <p className="w-1/3 text-base text-teal-700 font-semibold">هزار تومان</p>
          </div>
          <div className="sm:col-span-2">
            <Textarea
              placeholder="توضیحات (اختیاری)"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className="h-10"
            />
          </div>
          <div>
            <ImageUploader key={`new-product-uploader-${newProduct.image}`} value={newProduct.image || ""} onChange={(url) => setNewProduct({ ...newProduct, image: url })} />
          </div>
        </div>
        <div className="flex">
          <Button type="submit">
            <Plus className="w-4 h-4" />
            افزودن محصول
          </Button>
        </div>
      </form>
      <div className="space-y-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map((product) => product._id)} strategy={verticalListSortingStrategy}>
            {products.map((product) =>
              editingId === product._id ? (
                <Card key={product._id} className="overflow-hidden mb-3">
                  <CardContent className="p-0">
                    <form onSubmit={handleUpdateSubmit} className="p-4 space-y-4">
                      <div dir="rtl" className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Input
                            placeholder="عنوان محصول"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex justify-start items-center gap-2">
                          <Input
                            placeholder="قیمت"
                            type="number"
                            step="0.01"
                            min="0"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                            required
                            className="w-1/3"
                          />
                          <p className="w-1/3 text-base font-semibold text-teal-700">هزار تومان</p>
                        </div>
                        <div className="sm:col-span-2">
                          <Textarea
                            placeholder="توضیحات (اختیاری)"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="h-10"
                          />
                        </div>
                        <div>
                            <ImageUploader key={`product-editer-${editForm.image}`} value={editForm.image} onChange={(url) => setEditForm({ ...editForm, image: url })} />
                        </div>
                      </div>
                      <div className="flex flex-row-reverse justify-end gap-2">
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
              ) : (
                <SortableProduct
                  key={product._id}
                  product={product}
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
            <p className="text-base text-teal-600">ذخیره ترتیب جدید ...</p>
          </div>
        )}
      </div>
    </div>
  )
}

