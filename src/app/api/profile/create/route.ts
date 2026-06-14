import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return new NextResponse("Unauthorized", { status: 401 })

    const body = await request.json()
    const {
      namaLengkap,
      tanggalLahir,
      jenisKelamin,
      asalDaerah,
      asalKelompok,
      asalDesa,
      nomorHp,
      instagram,
      fotoProfil
    } = body

    // 1. Get or Create User via Supabase Client
    const { data: dbUser, error: dbError } = await supabase
      .from('User')
      .select('id')
      .eq('email', user.email)
      .single()

    let userId = dbUser?.id;

    if (!dbUser) {
       const { data: newUser } = await supabase
        .from('User')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || '',
          role: 'MEMBER'
        })
        .select()
        .single()
       userId = newUser.id;
    }

    // 2. Create or Update Profile
    const { data: existingProfile } = await supabase
      .from('Profile')
      .select('id, userId')
      .eq('userId', userId)
      .maybeSingle()

    let profileData;

    if (existingProfile) {
       // Cek apakah ini profil placeholder yang diklaim (email @offline.local atau @member.local tanpa biodata)
       // Update saja data yang dikirim member
       const { data: updatedProfile, error: upErr } = await supabase
         .from('Profile')
         .update({
            namaLengkap,
            tanggalLahir: new Date(tanggalLahir).toISOString(),
            jenisKelamin,
            asalDaerah,
            asalKelompok,
            asalDesa,
            nomorHp,
            instagram,
            ...(fotoProfil && { fotoProfil })
         })
         .eq('userId', userId)
         .select()
         .single()

       if (upErr) throw upErr;
       profileData = updatedProfile;
    } else {
       const { data: newProfile, error: insErr } = await supabase
         .from('Profile')
         .insert({
            userId,
            namaLengkap,
            tanggalLahir: new Date(tanggalLahir).toISOString(),
            jenisKelamin,
            asalDaerah,
            asalKelompok,
            asalDesa,
            nomorHp,
            instagram,
            fotoProfil
         })
         .select()
         .single()
       profileData = newProfile;
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
