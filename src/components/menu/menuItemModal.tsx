"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react"

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

interface Group {
    title: string
    name: string
    bgColor: string
    textColor: string
    subtextColor: string
    imageSrc: string
}

interface MenuItemModalProps {
  item: any
  group: Group
  categoryName: string
  isOpen: boolean
  onClose: () => void
}

export default function MenuItemModal({ item, group, categoryName, isOpen, onClose }: MenuItemModalProps) {
  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`sm:max-w-[500px] p-0 overflow-hidden bg-${group.bgColor} border-2 border-${group.textColor} rounded-[0.125rem]`}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="relative w-full h-[200px] sm:h-[250px]">
                <Image
                  src={item.image || "/placeholder.svg?height=250&width=500"}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 rounded-[0.125rem] border-2 border-amber-600/50 bg-white/50 backdrop-blur-sm hover:bg-white/90 text-qqorange"
                  >
                  </Button>
                </DialogClose>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className={`flex w-full justify-between text-${group.textColor}`}>
                      <DialogTitle className={`flex items-center gap-1 text-${group.textColor}`}>
                        <span className="font-extrabold">{item.name}</span>
                      </DialogTitle>        
                      {item.price && item.price!.length === 1 ? 
                        <p className="font-bold">{formatCurrency(item.price![0])}</p> :
                        <p className="font-bold">{formatCurrency(item.price![0])} / {formatCurrency(item.price![1])}</p>
                      }
                    </div>
                  </div>
                </div>
                {item.ingredients && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-2 border-2 border-${group.subtextColor} rounded-[0.125rem]`}
                  >
                    <p className={`text-${group.subtextColor} text-base`}>({item.ingredients})</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge  variant="outline" className={`bg-${group.bgColor} text-${group.textColor} border-2 border-${group.textColor} rounded-[0.125rem]`}>
                    {categoryName}
                  </Badge>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

