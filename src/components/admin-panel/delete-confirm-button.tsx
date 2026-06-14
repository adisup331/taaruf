"use client"

import * as React from "react"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { type ActionResult } from "@/lib/action-result"

interface DeleteConfirmButtonProps {
  title: string
  description: string
  action: () => Promise<ActionResult>
  size?: "sm" | "default" | "icon"
  className?: string
}

export function DeleteConfirmButton({
  title,
  description,
  action,
  size = "sm",
  className,
}: DeleteConfirmButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [pending, startTransition] = React.useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await action()
      if (result?.ok) {
        toast.success(result.message)
        setOpen(false)
      } else {
        toast.error(result?.message || "Gagal menghapus data.")
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="ghost" size={size} className={className}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? "Menghapus..." : "Ya, Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
