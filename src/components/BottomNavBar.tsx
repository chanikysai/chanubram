"use client";

import Link from "next/link";
import React from "react";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/memories", label: "Memories" },
  { href: "/goals", label: "Goals" },
  { href: "/settings", label: "Settings" },
];

export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-md flex justify-around py-2 px-3 z-50 border-t border-gray-200 dark:border-gray-700 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-md"
        >
          {/* Placeholder for icons */}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
