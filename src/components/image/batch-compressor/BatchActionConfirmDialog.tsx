"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type BatchConfirmAction = "reset" | "clear";

type BatchActionConfirmDialogProps = {
  action: BatchConfirmAction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageCount: number;
  onConfirm: (action: BatchConfirmAction) => void;
};

export function BatchActionConfirmDialog({
  action,
  open,
  onOpenChange,
  imageCount,
  onConfirm,
}: BatchActionConfirmDialogProps) {
  const isReset = action === "reset";

  const title = isReset ? "Reset compression?" : "Clear all images?";

  const description = isReset
    ? `All ${imageCount} image(s) will return to pending. Files stay on your device — you can compress again or download a new ZIP.`
    : `Remove all ${imageCount} image(s) from the queue? You can add files again later; this only clears the current batch.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              variant={isReset ? "outline" : "destructive"}
              onClick={() => {
                if (action) onConfirm(action);
              }}
            >
              {isReset ? "Reset" : "Clear all"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
