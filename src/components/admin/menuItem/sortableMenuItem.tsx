"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import Image from "next/image"
import { GripVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"

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
  available: boolean
}

interface category {
    id: string, 
    name: string, 
    description: string,
    order: number
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

  const IconComponent = item.iconName ? (LucideIcons as any)[item.iconName] : null

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

            {/* {item.image ? (
              <div className="relative h-20 w-20 hidden sm:flex rounded-md overflow-hidden flex-shrink-0">
                <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-20 w-20 hidden sm:flex rounded-md bg-slate-100 items-center justify-center flex-shrink-0">
                <span className="text-slate-400 text-sm">No image</span>
              </div>
            )} */}


            <div className="flex-1">
              <div className="flex flex-row-reverse gap-1 items-center text-qqdarkbrown">
                 {IconComponent && <IconComponent className="w-4 h-4" />}
                 {item.iconName === "both" && 
                    <>
                      <LucideIcons.Hand className="w-4 h-4" />
                      <LucideIcons.Snowflake className="w-4 h-4" />
                    </>
                  }
                <h3 className="font-medium">{item.name}</h3>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

