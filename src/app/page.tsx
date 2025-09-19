
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { BookOpenText, ShoppingBag, CalendarRange, ListMusic, Smartphone } from "lucide-react";
import Slideshow from "@/components/slideshow"
import EventSlide from "@/components/eventSlide";
import ProductSlide from "@/components/productSlide";
import { getLatestEvents, getLatestProducts } from "@/lib/data/homePageData"
import PwaInstallButton from "@/components/pwaInstallationButton";
import PushNotificationToggle from "@/components/pushNotificationToggle";
import AnimatedSection from "@/components/animatedSection";
import CommentForm from "@/components/commentForm";
import { getComments } from "@/lib/data/commentData";
import CommentSlide from "@/components/admin/comments/commentSlide";
import { IComment } from "@/models/Comment";
import { comment } from "postcss";

export const dynamic = "force-dynamic"

export default async function Home() {

  const [latestEvents, latestProducts, comments] = await Promise.all([getLatestEvents(3), getLatestProducts(3), getComments()])
  
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
        <AnimatedSection delay={0.1} className="grid sm:grid-cols-2 items-center gap-4 px-4">
          <Slideshow autoplayInterval={6000} className="min-h-64 bg-amber-100 mt-4 pb-16">
            {comments.filter((comment : IComment) => comment.verified).map((comment: IComment & { id: string }) => (
              <CommentSlide key={comment.id} comment={comment} />
            ))}
          </Slideshow>
          <CommentForm />
        </AnimatedSection>
        {latestEvents.length > 0 ? (<AnimatedSection delay={0.4} className="mt-8 space-y-2 px-4">
          <div className="flex justify-center items-center gap-2 px-2 text-qqteal">
            <CalendarRange className="w-6 h-6" />
            <h2 className="text-xl font-bold">رویدادهای پیش رو</h2>
          </div>
          <p className="text-qqbrown text-center text-lg px-12">برای رویدادها و گردهمایی‌های ویژه در کافه به ما بپیوندید!</p>
          <Slideshow className="h-96 bg-amber-50 shadow-md">
            {latestEvents.map((event) => (
              <EventSlide key={event.id} event={event} />
            ))}
          </Slideshow>
        </AnimatedSection>) : null}
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
        <AnimatedSection delay={0.4} className="mt-12 flex flex-col gap-2 items-center px-4">
          <div className="flex justify-center items-center gap-2 px-2 text-qqteal font-bold text-xl">
            <Smartphone className="w-6 h-6" />
            <h2>اپلیکیشن قوشاقاف</h2>
          </div>
          <p className="text-lg text-qqdarkbrown text-center w-[34ch]">برای اطلاع از رویدادها، تخفیف‌ها و اخبار کافه، اپلیکیشن ما را نصب و اعلان‌ها را فعال کنید!</p>
          <div className="flex items-center gap-4">
            <PwaInstallButton />
            <PushNotificationToggle />
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.5} className="mt-8 px-4">
          <div className="relative w-full rounded-3xl overflow-hidden shadow-md">
              <Image
                  src={"/soundcloud.jpg"}
                  alt="موزیک کافه قوشاقاف"
                  width={1080}
                  height={1528}
              />
              <h3 className="absolute top-6 font-bold text-amber-50 w-full text-center sm:text-3xl sm:top-16">لیست و ساعات پخش موزیک در کافه</h3>
              <Link href='https://soundcloud.com/amirhossein-sz2017' target="_blank" rel="noopener noreferrer" className="absolute bottom-12 left-8 sm:bottom-36 sm:left-16">
                <Button variant="default" size="default" className="flex items-center gap-2 sm:text-xl bg-qqorange hover:bg-white hover:text-amber-500">
                  <ListMusic className="w-4 h-4 sm:w-8 sm:h-8" />
                  پلی‌لیست کافه
                </Button>
              </Link>
            </div>
        </AnimatedSection>
      </div>
    </main>
  );
}

