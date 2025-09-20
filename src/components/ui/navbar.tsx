"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import * as LucideIcons from 'lucide-react';

const navItems = [
  { name: "خانه", href: "/", icon: 'House' },
  { name: "منو", href: "/menu", icon: 'BookOpenText' },
  { name: "فروشگاه", href: "/shop", icon: 'ShoppingBag' },
];

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism background with futuristic border */}
      <div className="absolute inset-0 backdrop-blur-md bg-amber-50/50"></div>

      {/* Decorative gradient line */}
      <nav className="relative mx-auto flex max-w-7xl h-16 sm:h-[4.5rem] items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center text-amber-500">
          <Link href="/">
            <div className="w-16">
                <Image
                src={"/logo.png"}
                alt="لوگوی سورل"
                width={913}
                height={789}
                />
            </div>
          </Link>
        </div>
        <div className="w-16">
            <Image
            src={"/typo.png"}
            alt="تایپولوگوی سورل"
            width={904}
            height={280}
            />
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-4">
          {navItems.map((item, index) => {
            const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null
            if (index > 0) return (
              <Link
              key={item.name}
              href={item.href}
              className="relative px-3 py-2 text-sm font-medium text-teal-700 hover:text-amber-500 transition-colors duration-300 group"
            >
              <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                <h3 className="font-medium text-sm">{item.name}</h3>
              </div>
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left"></span>
            </Link>
          )})}
          <Link href={'/admin'}>
                <Button variant="outline" size="sm" className="text-amber-500 hover:bg-amber-500 hover:text-amber-50 border-amber-500">
                    {session?.user ? session.user.name : "پنل ادمین"}
                    <User className="w-4 h-4" />
                </Button>
              </Link>
              {session?.user && (
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-amber-500 hover:bg-amber-500 hover:text-amber-50 border-amber-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
              )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-1">
          {/* Mobile menu button */}
          <div className="w-6"></div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative h-9 w-9 overflow-hidden text-teal-700 hover:bg-teal-700 hover:text-white backdrop-blur-sm transition-colors duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu
              className="h-5 w-5"
              aria-hidden="true"
            />
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        style={{
          transitionProperty: "opacity, visibility",
          transitionDuration: "300ms",
          visibility: mobileMenuOpen ? "visible" : "hidden",
        }}
      >
        <div
          className="fixed inset-0 bg-amber-50/80 backdrop-blur-md transition-opacity duration-300"
          style={{
            opacity: mobileMenuOpen ? 1 : 0,
            transitionProperty: "opacity",
            transitionDuration: "300ms",
          }}
          onClick={() => setMobileMenuOpen(false)}
        ></div>
        <div
          className="fixed inset-y-0 left-0 w-full max-w-xs bg-amber-50 backdrop-blur-md p-4 shadow-lg"
          style={{
            transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
            transitionProperty: "transform",
            transitionDuration: "300ms",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-16">
                <Image
                src={"/logo.png"}
                alt="لوگوی سورل"
                width={913}
                height={789}
                />
            </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 overflow-hidden group text-teal-700 hover:bg-teal-700 hover:text-amber-50 backdrop-blur-sm transition-colors duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon ? (LucideIcons as any)[item.icon] : null
              return (
              <Link
                key={item.name}
                href={item.href}
                className="block p-4 text-base text-teal-700 border-2 border-teal-700 hover:bg-teal-700 hover:text-amber-50 rounded-[0.125rem] transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex justify-start items-center gap-2">
                  {IconComponent && <IconComponent className="h-4 w-4 text-amber-500" />}
                  <h3 className="font-extrabold text-sm">{item.name}</h3>
                </div>
              </Link>
            )})}
            <div className="flex items-center gap-2">
            </div>
            <div className="flex gap-2">
              <Link 
                href={'/admin'}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button variant="outline" size="sm" className="text-amber-500 border-amber-500">
                    {session?.user ? session.user.name : "پنل ادمین"}
                    <User className="w-4 h-4" />
                </Button>
              </Link>
              {session?.user && (
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-amber-500 border-amber-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
