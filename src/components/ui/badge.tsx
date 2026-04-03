import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-[#1856FF]/40 focus:ring-offset-2 dark:focus:ring-offset-[#0c0b10]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1856FF]/12 text-[#1856FF] dark:bg-[#1856FF]/20 dark:text-[#a5c4ff]",
        secondary:
          "border-[#3A344E]/20 bg-[#3A344E]/8 text-[#3A344E] dark:border-white/10 dark:bg-white/5 dark:text-white/80",
        success:
          "border-[#07CA6B]/25 bg-[#07CA6B]/12 text-[#05914d] dark:text-[#8ef0c0]",
        warning:
          "border-[#E89558]/30 bg-[#E89558]/12 text-[#b45309] dark:text-[#fcd9a6]",
        outline: "border-black/10 text-[#141414]/80 dark:border-white/15 dark:text-white/75",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
