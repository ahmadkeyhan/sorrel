"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"

interface item {
  _id: string;
  name: string;
  price?: number[]
  categoryId: string;
  ingredients: string;
  image: string;
  order: number;
  available: boolean;
}

interface category {
  _id: string;
  name: string;
  group: string
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
    id: item._id || "",
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
          <div className="px-2 py-3 flex flex-row-reverse gap-2">
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
              <GripVertical className="w-5 h-5 text-amber-500" />
              <span className="sr-only">Drag to reorder</span>
            </Button>


            <div className="flex-1">
              <div className="flex flex-row-reverse gap-1 items-center text-teal-700">
                <p className="font-semibold">{item.name}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

