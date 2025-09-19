
import { Suspense } from "react";
import MenuCategories from "@/components/menu/menuCategories";
import { getMenuSettings } from "@/lib/data/menuData";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Snowflake, Hand,BookOpenText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Terms from "@/components/menu/terms";
import SummonWaiter from "@/components/menu/summonWaiter";

export default async function Home() {
  // Fetch menu settings
  const menuSettings = await getMenuSettings();

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container px-4 py-6 mx-auto max-w-3xl">
        <section className="space-y-4"> 
          <Suspense fallback={<MenuSkeleton />}>
          <div className="flex justify-center items-center text-qqteal gap-2 mb-2">
            <BookOpenText className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-qqteal">منوی کافه</h1>
          </div>
          <p className="text-qqbrown w-[36ch] md:w-full mx-auto max-w-2xl text-center">
            {menuSettings.description}
          </p>
          </Suspense>
          <div className="flex justify-center items-center gap-2 text-qqdarkbrown">
            <Button variant="outline" size="lg" className="px-4 border-2 border-qqteal">
              <p className="text-sm font-[doran]">با امکان سرو سرد</p>
              <Snowflake className="w-5 h-5 text-qqorange" />
            </Button>
            {/* <Button variant="outline" size="lg" className="px-4 border-2 border-qqteal">
              <p className="text-sm font-[doran]">از ویتر بپرس</p>
              <Hand className="w-5 h-5 text-qqorange" />
            </Button> */}
            <SummonWaiter />
          </div>
          <MenuCategories />
          
        </section>
      </div>
    </main>
  );
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

function MenuSkeleton() {
  return (
    <AnimatePresence>
      <motion.div
        variants={spinnerVariants}
        initial="initial"
        animate="animate"
        className="w-3 h-3 rounded-full"
      >
        <Loader2 />
      </motion.div>
    </AnimatePresence>
  )
}
