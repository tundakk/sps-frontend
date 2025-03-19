"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthCheckProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/sign-in"];

export function AuthCheck({ isAuthenticated, children }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // If not authenticated and trying to access a protected route, redirect to sign-in
    if (!isAuthenticated && !isPublicRoute) {
      router.push("/sign-in");
    }
  }, [isAuthenticated, isPublicRoute, router]);

  // If we're still on a protected page without authentication, don't render children
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}
