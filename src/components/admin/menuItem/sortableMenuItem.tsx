"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"

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

interface SortableMenuItemProps {
  item: item
  category?: category
  onEdit: (item: item) => void
  onDelete: (id: string, name: string) => void
}

export default function SortableMenuItem({ item }: SortableMenuItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id || "",
    // Add these properties to improve touch handling
    data: {
      type: "menuItem",
      item,
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
          <div className="p-3 flex flex-row-reverse gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab active:cursor-grabbing p-1 h-auto self-center touch-none select-none"
              {...attributes}
              {...listeners}
              onTouchStart={(e) => {
                // Don't prevent default here to allow the touch to be captured
                // but stop propagation to prevent parent elements from handling it
                e.stopPropagation()
              }}
            >
              <GripVertical className="w-5 h-5 text-qqcream" />
              <span className="sr-only">Drag to reorder</span>
            </Button>


            <div className="flex-1">
              <div className="flex flex-row-reverse gap-1 items-center text-qqdarkbrown">
                <h3 className="font-medium">{item.name}</h3>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

