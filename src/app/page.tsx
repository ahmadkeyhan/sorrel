
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
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50 to-white">
      <div className="container px-0 py-6 mx-auto max-w-3xl">
        <AnimatedSection delay={0.1} className="grid sm:grid-cols-2 items-center space-y-4 px-4"> 
          <div className="flex justify-center">
            <div className="relative w-1/3 mb-2">
              <Image
                  src={"/qoshaqaf.png"}
                  alt="لوگوی کافه قوشاقاف"
                  width={774}
                  height={869}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-qqteal text-amber-100 rounded-lg text-center py-4 px-8 w-full">
              <h1 className="font-semibold text-base/8">قوشاقاف؛ اهتمامی است برای به رسمیت شناختن دیگری، در فضایی فارغ از خانه و کار، برای زندگی و تولید.</h1>
            </div>
            <div className="flex justify-center items-center gap-2 w-full">
              <Link href="/menu">
                <Button variant="default" size="lg" className="px-4 bg-qqorange text-white">
                  <h2 className="">مشاهده‌ی منوی کافه</h2>
                  <BookOpenText className="w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </AnimatedSection>
        {latestProducts.length > 0 ? (<AnimatedSection delay={0.3} className="mt-12 space-y-2 bg-qqteal p-4 md:mx-4 md:p-8 md:rounded-3xl">
          <div className="flex justify-center items-center gap-2 px-2 text-white">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-xl font-bold">فروشگاه قوشاقاف</h2>
          </div>
          <p className="text-amber-100 text-center text-lg px-12">برای خرید محصولات به صندوق کافه مراجعه کنید.</p>
          <Slideshow className="h-96 bg-amber-50 shadow-md shadow-teal-950/20">
            {latestProducts.map((product) => (
              <ProductSlide key={product.id} product={product} />
            ))}
          </Slideshow>
        </AnimatedSection>) : null}
      </div>
    </main>
  );
}

