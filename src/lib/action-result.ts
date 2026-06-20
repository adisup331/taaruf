
export type ActionResult = {
  ok: boolean
  message: string
  profileId?: string
  userId?: string
} | null

export const initialActionState: ActionResult = null