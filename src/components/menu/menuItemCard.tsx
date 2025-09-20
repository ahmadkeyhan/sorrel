"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
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

interface Group {
    title: string
    name: string
    bgColor: string
    textColor: string
    subtextColor: string
    imageSrc: string
}

export default function MenuItemCard({
  item,
  group,
  onClick,
}: {
  item: item;
  group: Group
  onClick: (item: item) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`flex items-start gap-2 rounded-[0.125rem]`}
      whileHover={{ y: -3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onClick(item)}
    >
      <div className="relative h-20 w-20 rounded-[0.125rem] overflow-hidden flex-shrink-0">
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
        <div className="flex justify-between items-start font-bold text-base">
          <div className="flex items-center gap-1">
            <p>{item.name}</p>
          </div>
          {item.price && item.price!.length === 1 ? 
            <p>{formatCurrency(item.price![0])}</p> :
            <p>{formatCurrency(item.price![0])} / {formatCurrency(item.price![1])}</p>
          }
        </div>
        {/* Show price list items */}
        
        {item.ingredients && (
          <p className={`text-sm line-clamp-2 text-${group.subtextColor}`}>
            {`(${item.ingredients})`}
          </p>
        )}
      </div>
    </motion.div>
  );
}
