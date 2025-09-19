"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
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
}

export default function MenuItemCard({
  bgColor,
  item,
  onClick,
}: {
  bgColor: string
  item: item;
  onClick: (item: item) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = item.iconName ? (LucideIcons as any)[item.iconName] : null

  return (
    <motion.div
      className={`flex items-center gap-4 p-2 rounded-lg  bg-${bgColor.length > 0 ? bgColor : "white"} text-${bgColor.length > 0? "white" : "qqdarkbrown"} hover:shadow-md transition-shadow cursor-pointer`}
      whileHover={{ y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(item)}
    >
      <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={item.image || "/placeholder.svg?height=80&width=80"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="112px"
        />
        <motion.div
          className="absolute inset-0 bg-amber-500 mix-blend-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.2 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="space-y-1 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1">
            {IconComponent && <IconComponent className="w-4 h-4" />}
            {item.iconName === "both" && 
              <>
                <LucideIcons.Hand className="w-4 h-4" />
                <LucideIcons.Snowflake className="w-4 h-4" />
              </>
            }
            <h2 className="font-bold text-base">{item.name}</h2>
          </div>
          {item.priceList.length === 1 && <h3 className="font-semibold">{formatCurrency(item.priceList[0].price)}</h3>}
        </div>
        <p className="text-sm line-clamp-2 indent-2">
          {item.description}
        </p>
        {/* Show price list items */}
        {item.priceList.length > 1 && <div className="mt-1 flex flex-col gap-1">
          {item.priceList.map((subItem, index) => (
            <div
              key={index}
              className="text-base py-0.5 flex justify-between"
            >
              <p>{subItem.subItem}</p>
              <h3 className="font-semibold">{formatCurrency(subItem.price)}</h3>
            </div>
          ))}
        </div>}
        {item.ingredients && (
          <p className="text-sm">
            {`(${item.ingredients})`}
          </p>
        )}
      </div>
    </motion.div>
  );
}
