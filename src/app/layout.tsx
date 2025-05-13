import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sponti - Share Your Spontaneous Trips",
  description: "Connect with friends and share your spontaneous adventures",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className={`${inter.className} min-h-full bg-black text-gray-100`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-black">
            <div className="sticky top-0 z-50 shadow-lg bg-black">
              <Navbar />
            </div>
            <main className="flex-grow flex justify-center bg-black">
              <div className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-2xl xl:max-w-2xl px-2 sm:px-4 md:px-6 lg:px-0 py-8 bg-black">
                {children}
              </div>
            </main>
            <footer className="bg-black border-t border-gray-800 mt-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-gray-400 text-sm">
                  © {new Date().getFullYear()} Sponti. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
