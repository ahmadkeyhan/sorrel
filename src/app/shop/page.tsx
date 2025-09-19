
import { Suspense } from "react";
import Products from "@/components/shop/products";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShoppingBag } from "lucide-react";

export default function Roastery() {
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container px-4 py-6 mx-auto max-w-5xl">
        <section className="space-y-2 mb-8">
          <div className="flex justify-center items-center text-qqteal gap-2 mb-2">
            <ShoppingBag className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-qqteal">فروشگاه قوشاقاف</h1>
          </div>
          <p className="text-qqbrown w-[30ch] md:w-full mx-auto max-w-2xl text-center">
            برای خرید محصولات به صندوق کافه مراجعه کنید.
          </p>
        </section>
        <Suspense fallback={<MenuSkeleton />}>
          <Products />
        </Suspense>
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
        // variants={spinnerVariants}
        initial="initial"
        animate="animate"
        className="w-3 h-3 rounded-full"
      >
        <Loader2 />
      </motion.div>
    </AnimatePresence>
  )
}
