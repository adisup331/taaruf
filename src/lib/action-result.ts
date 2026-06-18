
export type ActionResult = {
  ok: boolean
  message: string
  profileId?: string
} | null

export const initialActionState: ActionResult = null