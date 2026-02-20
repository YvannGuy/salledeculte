"use client";

import { Bell, ChevronDown, Settings, User } from "lucide-react";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
};

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 pl-16 lg:pl-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title ?? "Dashboard Admin"}</h1>
        <p className="text-sm text-slate-600">
          {subtitle ?? "Vue d'ensemble de votre plateforme"}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Paramètres"
        >
          <Settings className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200">
            <User className="h-5 w-5 text-slate-600" />
          </div>
          <span className="text-sm font-medium text-slate-900">Admin</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
