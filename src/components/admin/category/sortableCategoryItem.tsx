"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, GripVertical } from "lucide-react"

interface category {
  _id: string;
  name: string;
  group: string
  order: number;
}

interface SortableCategoryItemProps {
  category: category
  sortDisabled: boolean
}

export default function SortableCategoryItem({ category, sortDisabled }: SortableCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category._id,
    // Add these properties to improve touch handling
    data: {
      type: "category",
      category,
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
          <div className="p-3 flex flex-row-reverse justify-between items-center bg-white text-qqdarkbrown">
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
                <GripVertical className="w-5 h-5" />
                <span className="sr-only">Drag to reorder</span>
              </Button>
              <div className="flex flex-col gap-1">
                <div className="flex flex-row-reverse gap-2">
                  {/* {IconComponent && <IconComponent className="w-5 h-5" />} */}
                  <h3 className="font-medium">{category.name}</h3>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}