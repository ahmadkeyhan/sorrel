
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BookOpenText, ShoppingBag, CalendarRange, ListMusic, Smartphone } from "lucide-react";
import Slideshow from "@/components/slideshow"
import ProductSlide from "@/components/productSlide";
import AnimatedSection from "@/components/animatedSection";
import { getLatestProducts } from "@/lib/data/homePageData"

export const dynamic = "force-dynamic"

export default async function Home() {

  const latestProducts = await getLatestProducts(3)
  
  return (
    <main className="min-h-screen bg-amber-50">
      <div className="container px-0 py-6 mx-auto max-w-3xl">
        <AnimatedSection delay={0.1} className="grid sm:grid-cols-2 items-center space-y-4 px-4"> 
          <div className="flex justify-center">
            <div className="relative w-1/3 mb-2">
              <Image
                  src={"/tealLogo.png"}
                  alt="لوگوی کافه سورل"
                  width={1044}
                  height={1352}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-teal-700 border-2 border-teal-700 rounded-[0.125rem] text-center py-4 px-8 w-full">
              <h2 className="font-black text-3xl/10">به کافه رستوران</h2>
              <h2 className="font-black text-3xl/10">ســــــــــورل</h2>
              <h2 className="font-black text-3xl/10">خــوش آمــدید!</h2>
            </div>
            <div className="flex justify-center items-center gap-2 w-full">
              <Link href="/menu">
                <Button variant="default" size="lg">
                  <h2 className="font-extrabold text-xl">منوی کافه</h2>
                  <BookOpenText className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
        {latestProducts.length > 0 ? (<AnimatedSection delay={0.3} className="mt-12 space-y-2 p-4 md:mx-4 md:p-8 md:rounded-3xl">
          <div className="flex justify-center items-center gap-2 px-2 text-teal-700">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-2xl font-black">سورل مارکت</h2>
          </div>
          <p className="text-amber-500 text-center text-lg">برای خرید محصولات حضوری مراجعه کنید.</p>
          <Slideshow className="h-96 bg-amber-50">
            {latestProducts.map((product) => (
              <ProductSlide key={product.id} product={product} />
            ))}
          </Slideshow>
        </AnimatedSection>) : null}
      </div>
    </main>
  );
}

