import MenuCategories from "@/components/menu/menuCategories";
import { BookOpenText } from "lucide-react";

export default async function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
            <div className="container px-4 py-6 mx-auto max-w-3xl">
                <section className="space-y-4">
                    <div className="flex justify-center items-center text-qqteal gap-2 mb-2">
                        <BookOpenText className="w-8 h-8" />
                        <h1 className="text-3xl font-bold text-qqteal">
                            منوی کافه
                        </h1>
                    </div>
                    <p className="text-qqbrown w-[36ch] md:w-full mx-auto max-w-2xl text-center">
                        توضیحات
                    </p>
                    <MenuCategories />
                </section>
            </div>
        </main>
    );
}
