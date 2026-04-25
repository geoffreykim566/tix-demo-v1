"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { store, shortAddr, type Wallet } from "@/lib/store";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    setWallet(store.getWallet());
    const u = store.getUser();
    if (u) setUsername(u.username);
  }, [pathname]);

  const logout = () => {
    store.reset();
    router.push("/login");
  };

  const navItem = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors ${
          active
            ? "text-accent bg-accent/10"
            : "text-fg-dim hover:text-fg hover:bg-bg-hover"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/home" className="flex items-center gap-2 group">
          <div className="w-6 h-6 border border-accent rounded-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-accent rounded-sm group-hover:animate-pulse" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            Ti<span className="text-accent">X</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navItem("/home", "Discover")}
          {navItem("/inventory", "Wallet")}
        </div>

        <div className="flex items-center gap-3">
          {wallet && (
            <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-bg-card border border-border rounded-md px-3 py-1.5">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-fg-dim">{shortAddr(wallet.address)}</span>
            </div>
          )}
          {username && (
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center text-xs font-mono text-accent hover:border-accent transition-colors">
                {username.charAt(0).toUpperCase()}
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-3 py-2 border-b border-border">
                  <div className="text-xs font-mono text-fg-dim">USER</div>
                  <div className="text-sm text-fg">{username}</div>
                </div>
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 text-xs font-mono text-fg-dim hover:text-red-400 hover:bg-bg-hover transition-colors"
                >
                  Sign out / reset demo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
