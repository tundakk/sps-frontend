// src/app/layout.tsx
import './globals.css';
import { cookies } from "next/headers";
import { Providers } from './providers';
import { Navbar } from './_components/ui/navbar';
import { AuthCheck } from './_components/auth-check';
import { SESSION_COOKIE } from "@/config";
import { Toaster } from "./_components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  const isAuthenticated = !!sessionId;
  
  return (
    <html lang="en">
      <body>
        <Providers>
          <AuthCheck isAuthenticated={isAuthenticated}>
            <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
              <Navbar />
              <main className="container flex-1 py-8">
                <div className="mx-auto flex w-full flex-1 items-center justify-center px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
            <Toaster />
          </AuthCheck>
        </Providers>
      </body>
    </html>
  );
}
