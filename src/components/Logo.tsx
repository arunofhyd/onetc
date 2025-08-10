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
      <>
        <img
          src="/lovable-uploads/fd2e3279-a064-454b-853b-7672da7ba1a3.png"
          alt="OneTC logo (light mode)"
          className="block dark:hidden shrink-0"
          style={{ height: size }}
          loading="lazy"
        />
        <img
          src="/lovable-uploads/cb82cf15-c9ed-4a39-aa9e-618826af0cc0.png"
          alt="OneTC logo (dark mode)"
          className="hidden dark:block shrink-0"
          style={{ height: size }}
          loading="lazy"
        />
      </>
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
