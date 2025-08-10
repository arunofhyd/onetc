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
      <img
        src="/lovable-uploads/292a9b47-3a06-4164-a0bd-47aebeffe37b.png"
        alt="Chat bubble icon"
        className="shrink-0 invert-0 dark:invert"
        style={{ height: size }}
        loading="lazy"
      />
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
