import React from "react";
import logo from "@/assets/logo-onetc.png";
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
        src={logo}
        width={size}
        height={size}
        loading="lazy"
        alt="OneTC Chat logo - black and white chat bubble"
        className="shrink-0"
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
