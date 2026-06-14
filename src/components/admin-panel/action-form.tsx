"use client"

import * as React from "react"
import { useFormState } from "react-dom"
import { toast } from "sonner"
import { type ActionResult, initialActionState } from "@/lib/action-result"

type ServerAction = (
  prevState: ActionResult,
  formData: FormData
) => Promise<ActionResult>

interface ActionFormProps extends Omit<React.ComponentProps<"form">, "action"> {
  action: ServerAction
  /** reset form fields on success */
  resetOnSuccess?: boolean
  /** callback on success */
  onSuccess?: (state: ActionResult) => void
}

/**
 * Form wrapper that runs a server action via useFormState and shows a toast
 * based on the returned { ok, message } result.
 */
export function ActionForm({
  action,
  resetOnSuccess,
  onSuccess,
  children,
  ...props
}: ActionFormProps) {
  const [state, formAction] = useFormState(action, initialActionState)
  const formRef = React.useRef<HTMLFormElement>(null)
  const lastHandled = React.useRef<ActionResult>(null)

  React.useEffect(() => {
    if (!state || state === lastHandled.current) return
    lastHandled.current = state
    if (state.ok) {
      toast.success(state.message)
      if (resetOnSuccess) formRef.current?.reset()
      if (onSuccess) onSuccess(state)
    } else {
      toast.error(state.message)
    }
  }, [state, resetOnSuccess, onSuccess])

  return (
    <form ref={formRef} action={formAction} {...props}>
      {children}
    </form>
  )
}
