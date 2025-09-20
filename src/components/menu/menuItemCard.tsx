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

export default function MenuItemCard({
  item,
  onClick,
}: {
  item: item;
  onClick: (item: item) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`flex items-center gap-4 p-2 rounded-lg  bg-white text-qqdarkbrown hover:shadow-md transition-shadow cursor-pointer`}
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
            <h2 className="font-bold text-base">{item.name}</h2>
          </div>
          {item.price!.length === 1 && <h3 className="font-semibold">{formatCurrency(item.price![0])}</h3>}
        </div>
        {/* Show price list items */}
        
        {item.ingredients && (
          <p className="text-sm">
            {`(${item.ingredients})`}
          </p>
        )}
      </div>
    </motion.div>
  );
}
