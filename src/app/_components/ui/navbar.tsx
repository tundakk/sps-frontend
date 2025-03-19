"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/app/_components/utils";
import { UserMenu } from "./user-menu";

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold">SPS Web</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-4">
            <NavItem href="/">Home</NavItem>
            <NavItem href="/sps-ansoegninger">SPS-ansøgninger</NavItem>
            <NavItem href="/students">Studerende</NavItem>
          </nav>
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
