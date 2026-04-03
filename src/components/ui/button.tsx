import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-[#0c0b10] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#1856FF] text-white shadow-[0_10px_28px_-6px_rgba(24,86,255,0.55)] ring-1 ring-white/15 hover:bg-[#0E4ADB] active:bg-[#0A3DB0]",
        secondary:
          "border border-[#3A344E]/20 bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] text-[#3A344E] backdrop-blur-sm hover:bg-[#3A344E]/10 dark:border-white/15 dark:text-white/90 dark:hover:bg-white/10",
        outline:
          "border border-[#1856FF]/35 bg-transparent text-[#1856FF] hover:bg-[#1856FF]/10 dark:text-[#7ab0ff] dark:hover:bg-[#1856FF]/15",
        ghost:
          "text-[#141414]/80 hover:bg-black/[0.04] dark:text-white/75 dark:hover:bg-white/[0.06]",
        destructive:
          "bg-[#EA2143] text-white shadow-lg shadow-[#EA2143]/25 ring-1 ring-white/15 hover:opacity-95 active:opacity-90",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
