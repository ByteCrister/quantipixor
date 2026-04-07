"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { plusJakarta } from "@/fonts/google-fonts";

interface OutOfMemoryDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function OutOfMemoryDialog({ open, onClose }: OutOfMemoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent
                className={cn(
                    plusJakarta.className,
                    "sm:max-w-[420px] p-0 overflow-hidden rounded-[20px] border-0",
                    "bg-linear-to-br from-white/72 to-blue-50/62 backdrop-blur-2xl",
                    "shadow-[0_4px_32px_rgba(24,86,255,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]",
                    "border border-white/85",
                    "dark:from-[#1c182c]/82 dark:to-[#12162a]/78",
                    "dark:border-white/10",
                    "dark:shadow-[0_8px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.07)]"
                )}
            >
                <div className="h-1 w-full bg-linear-to-r from-[#EA2143] via-[#ff6b6b] to-[#EA2143] opacity-90" />

                <div className="px-7 pt-7 pb-7">
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-[14px] mb-[18px]",
                            "bg-linear-to-br from-[#EA2143]/12 to-[#EA2143]/6 border border-[#EA2143]/18",
                            "dark:from-[#EA2143]/20 dark:to-[#EA2143]/8 dark:border-[#EA2143]/28"
                        )}
                        style={{ width: 52, height: 52 }}
                    >
                        <AlertTriangle size={24} className="text-[#EA2143] dark:text-[#ff4d6d]" strokeWidth={2} />
                    </div>

                    <DialogTitle className="text-[17px] font-bold tracking-[-0.3px] text-[#141414] dark:text-[#f0ecff] mb-2.5">
                        Server out of memory
                    </DialogTitle>

                    <DialogDescription className="text-sm leading-[1.65] text-[#4a4a5a] dark:text-[#9e9ab8]">
                        The background removal server has run out of available memory and
                        cannot process your request right now.
                    </DialogDescription>
                </div>

                <DialogFooter className="px-7 pb-6">
                    <Button
                        onClick={onClose}
                        className={cn(
                            "rounded-[10px] text-sm font-semibold h-9 px-[22px]",
                            "bg-linear-to-br from-[#1856FF] to-[#3a6fff] text-white border-0",
                            "shadow-[0_2px_12px_rgba(24,86,255,0.28),inset_0_1px_0_rgba(255,255,255,0.2)]",
                            "hover:shadow-[0_4px_16px_rgba(24,86,255,0.36)] hover:-translate-y-px transition-all duration-150",
                            "dark:border dark:border-white/12 dark:shadow-[0_2px_14px_rgba(24,86,255,0.35)]",
                            "dark:text-white" // ensures white text on dark theme
                        )}
                    >
                        Got it
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}