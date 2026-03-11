import Link from "next/link";
import React from "react";

export default function Navbar() {
  const desktopNavItems = [
    { href: "/chat", label: "Chat" },
    { href: "/memories", label: "Memories" },
    { href: "/goals", label: "Goals" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white">
          App Logo
        </Link>
        <nav className="hidden md:flex items-center space-x-4">
          {desktopNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {/* Potential for user profile, search, etc. on desktop */}
      </div>
    </header>
  );
}
