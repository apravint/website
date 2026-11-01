"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";

export const NAV = [
  { href: "/iram-os/", label: "IRAM OS" },
  { href: "/projects/", label: "Projects" },
  { href: "/thirukkural/", label: "Thirukkural" },
  { href: "/kavithai/", label: "Kavithai" },
  { href: "/calendar/", label: "Calendar" },
  { href: "/markets/", label: "Markets" },
  { href: "/arcade/", label: "Arcade" },
  { href: "/tv/", label: "TV" },
  { href: "/ai/", label: "AI" },
];

function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const isDark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button onClick={toggle} className="icon-btn" aria-label="Switch colour theme">
      <Sun className="w-4 h-4 hidden dark:block" />
      <Moon className="w-4 h-4 dark:hidden" />
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const linkClass = (href: string) =>
    pathname.startsWith(href) ? "text-ink" : "text-muted hover:text-ink";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl tracking-tight whitespace-nowrap">
          Pravin Tamilan
        </Link>
        <div className="flex items-center gap-1">
          <nav className="hidden lg:flex items-center gap-5 mr-3 text-sm" aria-label="Main">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`transition-colors ${linkClass(item.href)}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="icon-btn lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="lg:hidden border-t border-line px-4 py-2 grid grid-cols-2 gap-x-4" aria-label="Main">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`py-2.5 text-sm ${linkClass(item.href)}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
