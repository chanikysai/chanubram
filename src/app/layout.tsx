import "./globals.css"; // Assuming global styles are imported here
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Example font import
import Navbar from "@/components/Navbar";
import BottomNavBar from "@/components/BottomNavBar";

// Assuming Inter font is set up for basic styling
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Tripster App",
  description: "A travel planning and memory keeping application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-4 md:py-8">
          {children}
        </main>
        <BottomNavBar />
      </body>
    </html>
  );
}
