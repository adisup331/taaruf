import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function uploadToSupabase(file: File, path: string) {
  const { data, error } = await supabase.storage
    .from('pnkb')
    .upload(path, file, {
      upsert: true,
      contentType: file.type
    })

  if (error) throw error

  const { data: publicData } = supabase.storage
    .from('pnkb')
    .getPublicUrl(data.path)

  return publicData.publicUrl
}