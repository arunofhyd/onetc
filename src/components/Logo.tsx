import React from "react";

import { cn } from "@/lib/utils";

interface LogoProps {
  showText?: boolean;
  size?: number; // pixel size for the icon
  className?: string;
}

export function Logo({ showText = true, size = 48, className }: LogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-label="OneTC Chat logo - chat bubble icon"
        role="img"
        className="shrink-0 text-primary"
      >
        <title>OneTC Chat logo</title>
        <path
          d="M12 14c-4.418 0-8 3.582-8 8v12c0 4.418 3.582 8 8 8h15l11 8-3-8h7c4.418 0 8-3.582 8-8V22c0-4.418-3.582-8-8-8H12z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx="22" cy="30" r="2.5" fill="currentColor" />
        <circle cx="32" cy="30" r="2.5" fill="currentColor" />
        <circle cx="42" cy="30" r="2.5" fill="currentColor" />
      </svg>
      {showText && (
        <div className="leading-tight">
          <div className="text-3xl font-bold tracking-tight">OneTC</div>
          <div className="text-sm text-muted-foreground">One-Time Chat</div>
        </div>
      )}
    </div>
  );
}

export default Logo;
