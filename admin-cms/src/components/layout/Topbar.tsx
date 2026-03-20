"use client";

import { useAuth } from "@/hooks/useAuth";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const { logout } = useAuth();

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <h1 className="text-base font-semibold text-slate-800">
        {title ?? "Admin CMS"}
      </h1>
      <button
        onClick={logout}
        className="text-sm text-slate-500 hover:text-slate-800 transition"
      >
        Sign out
      </button>
    </header>
  );
}
