"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends ButtonProps {
  pendingText?: string
}

export function SubmitButton({
  children,
  pendingText,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn(className)}
      {...props}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? pendingText || "Memproses..." : children}
    </Button>
  )
}
