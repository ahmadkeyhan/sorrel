"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IPriceListItem } from "@/models/MenuItem"
import { formatCurrency } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from "react"

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
  // categoryName: string;
  ingredients: string;
  image: string;
  order: number;
}

interface MenuItemModalProps {
  item: any
  // categoryName: string
  isOpen: boolean
  onClose: () => void
}

export default function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  if (!item) return null

  const IconComponent = item.iconName ? (LucideIcons as any)[item.iconName] : null

  // Get category names - handle both old and new formats
  const getCategoryNames = () => {
    if (item.categoryNames && Array.isArray(item.categoryNames)) {
      return item.categoryNames
    }
    if (item.categoryName && item.categoryName !== "آیتم منو") {
      return [item.categoryName]
    }
    return ["آیتم منو"]
  }

  const categoryNames = getCategoryNames()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white rounded-lg">
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
                    className="absolute top-1 right-1 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/90 text-qqorange"
                  >
                  </Button>
                </DialogClose>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex w-full justify-between">
                      <DialogTitle className="flex items-center gap-1 text-qqdarkbrown">
                        {IconComponent && <IconComponent className="w-5 h-5" />}
                        {item.iconName === "both" && 
                          <>
                            <LucideIcons.Hand className="w-4 h-4" />
                            <LucideIcons.Snowflake className="w-4 h-4" />
                          </>
                        }
                        <h1 className="font-bold">{item.name}</h1>
                      </DialogTitle>        
                      {item.priceList.length === 1 && <h3 className="font-semibold text-qqdarkbrown">{formatCurrency(item.priceList[0].price)}</h3>}
                    </div>
                  </div>

                  <motion.p
                    className="text-qqbrown px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.description}
                  </motion.p>
                </div>

                {/* Price List Section */}
                  {item.priceList.length > 1 && <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="space-y-2 pr-2 text-qqdarkbrown">
                      {item.priceList.map((priceItem: IPriceListItem, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-1"
                        >
                          <span className="text-lg">{priceItem.subItem}</span>
                          <h3 className="font-semibold">{formatCurrency(priceItem.price)}</h3>
                        </div>
                      ))}
                    </div>
                  </motion.div>}

                {item.ingredients && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-base text-qqbrown px-2.5">({item.ingredients})</p>
                  </motion.div>
                )}

                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex flex-wrap gap-2">
                    {categoryNames.map((categoryName: string , index: Key | null | undefined) => (
                      <Badge key={index} variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        {categoryName}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

