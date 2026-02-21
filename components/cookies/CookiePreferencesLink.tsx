"use client";

import Link from "next/link";
import { openCookiePreferences } from "./CookieProvider";

export function CookiePreferencesLink({
  children = "Gérer mes cookies",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => openCookiePreferences()}
      className={className}
    >
      {children}
    </button>
  );
}
