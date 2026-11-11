"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Droplets,
  LayoutDashboard,
  Users,
  Wrench,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/musteri", label: "Müşteriler", icon: Users },
  { href: "/servis", label: "Servisler", icon: Wrench },
  { href: "/randevu", label: "Randevular", icon: CalendarDays },
  { href: "/odeme", label: "Ödemeler", icon: Wallet },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-5">
        <Droplets className="size-5 text-primary" />
        <span className="font-semibold">Kale Su Arıtma</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex items-center justify-between border-t p-3">
        <span className="text-xs text-muted-foreground">v0.1</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="flex h-14 items-center gap-1 overflow-x-auto border-b px-3 md:hidden">
      <Droplets className="size-5 shrink-0 text-primary" />
      {navItems.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <div className="ml-auto shrink-0 pr-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
