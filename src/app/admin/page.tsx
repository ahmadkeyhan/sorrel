"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryManager from "@/components/admin/category/categoryManager";
import MenuItemManager from "@/components/admin/menuItem/menuItemManager";
import PasswordManager from "@/components/admin/user/passwordManager";
import UserManager from "@/components/admin/user/userManager";
import MenuSettingsManager from "@/components/admin/menu/menuSettingsManager";
import ProductManager from "@/components/admin/product/productManager";
import QRCodeGenerator from "@/components/admin/qrCode/qrCodeGenerator";
import BulletinManager from "@/components/admin/bulletin/bulletinManager";
import NotificationManager from "@/components/admin/notificationManager";
import DialogManager from "@/components/admin/dialogManager";
import CoopManager from "@/components/admin/coop/coopManager";
import CommentManager from "@/components/admin/comments/commentManager";
import ImageManager from "@/components/admin/gallery/imageManager";
import AlbumManager from "@/components/admin/gallery/albumManager";
import {BlogManager} from "@/components/admin/blog/blogManager";
import TokenManager from "@/components/admin/tokens/tokenManager";
import SummonManager from "@/components/admin/summon/summonManager";
import OrderManager from "@/components/admin/order/orderManager";
import InventoryManager from "@/components/admin/inventory/inventoryManager";
import MaterialManager from "@/components/admin/inventory/materialManager";
import RecipeBuilder from "@/components/admin/menuItem/recipeBuilder";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Don't render anything until we check authentication
  if (!isClient || status === "loading") {
    return <AdminSkeleton />;
  }

  const isAdmin = session?.user?.role === "admin";
  const isEmployee = session?.user?.role === "employee";

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="container px-4 py-6 mx-auto max-w-6xl">
        <Tabs
          defaultValue={isEmployee? "summons" : "items"}
          className="w-full flex flex-col lg:flex-row-reverse gap-6"
        >
          <TabsList className="flex flex-wrap lg:flex-col lg:justify-start h-auto w-full lg:w-48 bg-amber-100 text-qqdarkbrown p-1 lg:p-2 lg:shrink-0 rounded-lg">
            {isEmployee && (
              <TabsTrigger
                value="summons"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                فراخوانی‌ها
              </TabsTrigger>
            )}
            {isEmployee && (
              <TabsTrigger
                value="tokens"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                ژتون‌ها
              </TabsTrigger>
            )}
            {isEmployee && (
              <TabsTrigger
                value="orders"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                سفارش‌ها
              </TabsTrigger>
            )}
            <TabsTrigger
              value="items"
              className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
            >
              آیتم‌ها
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="materials"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                مواد اولیه
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="inventory"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                انبارها
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="menu"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                منو
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="products"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                محصولات
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="gallery"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                گالری
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="blog"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                وبلاگ
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="events"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                بولتن
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="users"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                اکانت‌ها
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="notifications"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                اعلان‌ها
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="cooperations"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                همکاری
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="qr"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                کیوآر
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="comments"
                className="flex-grow px-2 lg:flex-grow-0 lg:justify-end lg:w-full lg:mb-1"
              >
                نظرات
              </TabsTrigger>
            )}
          </TabsList>
          <div className="flex-1">
            {isEmployee && (
              <TabsContent
                value="summons"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت فراخوانی‌ها
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <SummonManager />
                </Suspense>
              </TabsContent>
            )}

            {isEmployee && (
              <TabsContent
                value="tokens"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  توزیع ژتون‌ها
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <TokenManager />
                </Suspense>
              </TabsContent>
            )}
            
            {isEmployee && (
              <TabsContent
                value="orders"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت سفارش‌ها
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <OrderManager />
                </Suspense>
              </TabsContent>
            )}

            {isEmployee && <TabsContent
              value="items"
              className="space-y-6 data-[state=active]:block"
            >
              <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                مدیریت آیتم‌ها
              </h1>
              <Suspense fallback={<ItemsSkeleton />}>
                <MenuItemManager isAdmin={isAdmin} />
              </Suspense>
            </TabsContent>}

            {isAdmin && <TabsContent
              value="items"
              className="space-y-6 data-[state=active]:block"
            >
              <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                مدیریت آیتم‌ها
              </h1>
              <Suspense fallback={<ItemsSkeleton />}>
                <Tabs defaultValue="category" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="category" className="flex-grow">
                      دسته‌بندی‌ها
                    </TabsTrigger>
                    <TabsTrigger value="item" className="flex-grow">
                      آیتم‌ها
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="category" className="space-y-4">
                    <CategoryManager />
                  </TabsContent>
                  <TabsContent value="item" className="space-y-4">
                    <MenuItemManager isAdmin={isAdmin} />
                  </TabsContent>
                </Tabs>
              </Suspense>
            </TabsContent>}

            {isAdmin && (
              <TabsContent
                value="materials"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت مواد اولیه
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <Tabs defaultValue="material" className="w-full">
                    <TabsList className="mb-4 flex flex-wrap">
                      <TabsTrigger value="material" className="flex-grow">
                        مواد اولیه
                      </TabsTrigger>
                      <TabsTrigger value="recipes" className="flex-grow">
                        رسپی‌ها
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="material" className="space-y-4">
                      <MaterialManager />
                    </TabsContent>
                    <TabsContent value="recipes" className="space-y-4">
                      <RecipeBuilder />
                    </TabsContent>
                  </Tabs>
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="inventory"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  انبارداری
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <InventoryManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="menu"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  تنظیمات منو
                </h1>
                <Suspense fallback={<SettingsSkeleton />}>
                  <MenuSettingsManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="products"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت محصولات
                </h1>
                <Suspense fallback={<ProductSkeleton />}>
                  <ProductManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="gallery"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  گالری تصاویر
                </h1>
                <Suspense fallback={<GallerySkeleton />}>
                  <Tabs defaultValue="album" className="w-full">
                    <TabsList className="mb-4 flex flex-wrap">
                      <TabsTrigger value="album" className="flex-grow">
                        آلبوم‌ها
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex-grow">
                        عکس‌ها
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="album" className="space-y-4">
                      <AlbumManager />
                    </TabsContent>
                    <TabsContent value="image" className="space-y-4">
                      <ImageManager />
                    </TabsContent>
                  </Tabs>
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="blog"
                className="space-y-6 data-[state=active]:block"
              >

                <Suspense fallback={<EventsSkeleton />}>
                  <BlogManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="events"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت بولتن
                </h1>
                <Suspense fallback={<EventsSkeleton />}>
                  <BulletinManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="users"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  مدیریت اکانت‌ها
                </h1>
                <Suspense fallback={<UsersSkeleton />}>
                  <PasswordManager />
                  <UserManager />
                </Suspense>
              </TabsContent>
            )}
            {isAdmin && (
              <TabsContent
                value="notifications"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  ایجاد اعلان‌
                </h1>
                <Suspense fallback={<NotificationsSkeleton />}>
                  <NotificationManager />
                  <DialogManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="cooperations"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  فرمهای همکاری
                </h1>
                <Suspense fallback={<CoopSkeleton />}>
                  <CoopManager />
                </Suspense>
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent
                value="qr"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  ایجاد کد کیوآر
                </h1>
                <Suspense fallback={<QRCodeSkeleton />}>
                  <QRCodeGenerator />
                </Suspense>
              </TabsContent>
            )}
            {isAdmin && (
              <TabsContent
                value="comments"
                className="space-y-6 data-[state=active]:block"
              >
                <h1 className="text-xl font-bold text-qqdarkbrown text-center lg:text-end ">
                  نظرات
                </h1>
                <Suspense fallback={<CommentSkeleton />}>
                  <CommentManager />
                </Suspense>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </main>
  );
}

function AdminSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md mx-auto mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  );
}

function ItemsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="grid gap-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
      </div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

function CoopSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[400px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

function QRCodeSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[400px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[400px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Skeleton className="h-[400px] rounded-lg" />
      <Skeleton className="h-[400px] rounded-lg" />
    </div>
  );
}
