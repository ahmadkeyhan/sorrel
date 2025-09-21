"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, GripVertical } from "lucide-react"
import { IProduct } from "@/models/Product"

type Product = {
  _id: string
  name: string
  description?: string
  price: number
  image: string
  order: number
}

interface SortableProductProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string, name: string) => void
  sortDisabled: boolean
}

export default function SortableProduct({ product, onEdit, onDelete, sortDisabled }: SortableProductProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product._id,
    // Add these properties to improve touch handling
    data: {
      type: "product",
      product,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3 touch-manipulation">
      <Card className={`overflow-hidden ${isDragging ? "shadow-lg" : ""}`}>
        <CardContent className="p-0">
          <div className="p-3 flex flex-row-reverse justify-between items-center">
            <div className="flex flex-row-reverse items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="cursor-grab active:cursor-grabbing p-1 h-auto touch-none select-none"
                {...attributes}
                {...listeners}
                // Add this to prevent default touch behavior on Android
                onTouchStart={(e) => {
                  // Don't prevent default here to allow the touch to be captured
                  // but stop propagation to prevent parent elements from handling it
                  e.stopPropagation()
                }}
                disabled={sortDisabled}
              >
                <GripVertical className="w-5 h-5 text-amber-500" />
                <span className="sr-only">Drag to reorder</span>
              </Button>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row-reverse gap-2">
                  {/* {IconComponent && <IconComponent className="w-5 h-5" />} */}
                  <h3 className="font-extrabold text-teal-700">{product.name}</h3>
                </div>
                {product.description && <p className="text-base text-teal-600 line-clamp-1">{product.description}</p>}
              </div>
            </div>
            <div className="flex flex-row-reverse gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(product)}
                className="text-teal-700 hover:bg-teal-700 hover:text-amber-50"
              >
                <Edit className="w-4 h-4" />
                <span className="sr-only">ویرایش</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="group border-amber-500 hover:bg-amber-500 hover:border-amber-500"
                onClick={() => onDelete(product._id, product.name)}
              >
                <Trash2 className="w-4 h-4 text-amber-500 group-hover:text-amber-50" />
                <span className="sr-only">حذف</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}