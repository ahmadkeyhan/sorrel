"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCategoryItems } from "@/lib/data/itemData";
import MenuItemCard from "./menuItemCard";
import MenuItemModal from "./menuItemModal";
import * as LucideIcons from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

interface categoryItems {
  [key : string] : item[]
}

interface Group {
    title: string
    name: string
    bgColor: string
    textColor: string
    subtextColor: string
    imageSrc: string
}


// Animation variants for menu items
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

// Loading spinner animation variants
const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Number.POSITIVE_INFINITY,
      duration: 1,
      ease: "linear",
    },
  },
}

export default function MenuCategories({categories, group} : {categories: category[], group: Group}) {

  const [categoryItems, setCategoryItems] = useState<categoryItems>({})
  const [selectedItem, setSelectedItem] = useState<item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(new Set())
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [modalCategoryName,setModalCategoryName] = useState<string>('')


  useEffect(() => {
    const loadItemsForCategories = async () => {
      // Find categories that are open but don't have items loaded yet
      const categoriesToLoad = openCategories.filter(
        (categoryId) => !categoryItems[categoryId] && !loadingCategories.has(categoryId),
      )

      if (categoriesToLoad.length === 0) return

      // Update loading state for these categories
      const newLoadingCategories = new Set(loadingCategories)
      categoriesToLoad.forEach((categoryId) => newLoadingCategories.add(categoryId))
      setLoadingCategories(newLoadingCategories)

      // Load items for each category in parallel
      const loadPromises = categoriesToLoad.map(async (categoryId) => {
        try {
          const items = await getCategoryItems(categoryId)

          // Add category name to each item
          const currentCategory = categories.find((cat: category) => cat._id === categoryId)
          const itemsWithCategory = items.map((item: item) => ({
            ...item,
            categoryName: currentCategory ? currentCategory.name : "",
          }))

          return { categoryId, items: itemsWithCategory }
        } catch (error) {
          console.error(`Error loading items for category ${categoryId}:`, error)
          return { categoryId, items: [] }
        }
      })

      // Wait for all loading to complete
      const results = await Promise.all(loadPromises)

      // Update state with all loaded items
      const newCategoryItems = { ...categoryItems }
      results.forEach(({ categoryId, items }) => {
        newCategoryItems[categoryId] = items
      })

      setCategoryItems(newCategoryItems)

      // Update loading state
      const finalLoadingCategories = new Set(loadingCategories)
      categoriesToLoad.forEach((categoryId) => finalLoadingCategories.delete(categoryId))
      setLoadingCategories(finalLoadingCategories)
    }

    loadItemsForCategories()
  }, [openCategories, categoryItems, loadingCategories, categories])

  const handleAccordionValueChange = (value : string[]) => {
    setOpenCategories(value)
  }

  const handleItemClick = (item: item) => {
    setSelectedItem(item);
    categories.map((category) => {
      if (category._id === item.categoryId) setModalCategoryName(category.name)
    })
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Optional: delay clearing the selected item to allow for exit animations
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" className="w-full" onValueChange={handleAccordionValueChange}>
        {categories.map((category) => {
          // Dynamically get the icon component if iconName exists
          // const IconComponent = category.iconName ? (LucideIcons as any)[category.iconName] : null
          
          const items = categoryItems[category._id] || []
          const isLoading = loadingCategories.has(category._id)

          return (
            <AccordionItem
              key={category._id}
              value={category._id}
              className={`rounded-[0.125rem] mb-2 border-2 border-${group.textColor} overflow-hidden`}
            >
              <AccordionTrigger className={`px-4 py-3 text-${group.textColor} hover:no-underline`}>
                <div className="flex items-center gap-2">
                  {/* {IconComponent && <IconComponent className="w-5 h-5 text-amber-600" />} */}
                  <h3 className="font-extrabold">{category.name}</h3>
                </div>
              </AccordionTrigger>
              <AccordionContent className={`p-4 text-${group.textColor}`}>
                {isLoading ? (
                  <div className="py-8 flex justify-center items-center">
                  <div className="flex space-x-3">
                      <div className={`w-5 h-5 text-${group.textColor} animate-spin flex justify-center items-center`}
                      >
                        <LucideIcons.Loader2 />
                      </div>
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center">
                    <p>آیتمی در این دسته‌بندی وجود ندارد.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <AnimatePresence>
                      {category.name === "نیمرو" && <p className="font-bold text-left">تک‌نفره / دو نفره</p>}
                      {items.map((item, index) => (
                        <motion.div
                          key={item._id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ delay: index * 0.05 }}
                          // className={`border-b-2 border-${group.textColor}`}
                        >
                          <MenuItemCard  item={item} onClick={handleItemClick} group={group} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>

      {categories.length === 0 && (
        <div className="py-12 flex justify-center items-center">
          <div className="flex space-x-3">
            <motion.div
              // variants={spinnerVariants}
              initial="initial"
              animate="animate"
              className={`w-5 h-5 text-${group.textColor} flex justify-center items-center`}
            >
              <LucideIcons.Loader2 />
            </motion.div>
          </div>
        </div>
      )}

      <MenuItemModal item={selectedItem} group={group} categoryName={modalCategoryName} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}