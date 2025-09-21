
import { Suspense } from "react";
import Products from "@/components/market/products";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShoppingBag } from "lucide-react";

export default function Roastery() {
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container px-4 py-6 mx-auto max-w-5xl">
        <section className="space-y-2 mb-8">
          <div className="flex justify-center items-center text-teal-700 gap-2 mb-2">
            <ShoppingBag className="w-8 h-8" />
            <h1 className="text-3xl font-black">سورل مارکت</h1>
          </div>
          <p className="text-amber-500 text-base font-semibold md:w-full mx-auto max-w-2xl text-center">
            برای خرید محصولات حضوری مراجعه کنید.
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
    },
  },
}

function MenuSkeleton() {
  return (
      <div className="animate-spin w-6 h-6">
        <Loader2 />
      </div>
  )
}
