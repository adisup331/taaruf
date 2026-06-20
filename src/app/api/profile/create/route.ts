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
      fotoProfil,
      statusMubaligh,
      pendidikanTerakhir,
      statusPernikahan,
      pekerjaan,
      anakKe,
      jumlahSaudara,
      dapukanKelompok,
      dapukanDesa,
      dapukanDaerah,
      kondisiIbu,
      kondisiAyah,
      statusJamaahIbu,
      statusJamaahAyah,
      eventId
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

    const payload = {
      namaLengkap,
      tanggalLahir: new Date(tanggalLahir).toISOString(),
      jenisKelamin,
      asalDaerah,
      asalKelompok,
      asalDesa,
      nomorHp,
      instagram,
      statusMubaligh,
      pendidikanTerakhir,
      statusPernikahan,
      pekerjaan,
      anakKe: anakKe ? parseInt(anakKe) : null,
      jumlahSaudara: jumlahSaudara ? parseInt(jumlahSaudara) : null,
      dapukanKelompok,
      dapukanDesa,
      dapukanDaerah,
      kondisiIbu,
      kondisiAyah,
      statusJamaahIbu,
      statusJamaahAyah,
      ...(fotoProfil && { fotoProfil })
    }

    if (existingProfile) {
       const { data: updatedProfile, error: upErr } = await supabase
         .from('Profile')
         .update(payload)
         .eq('userId', userId)
         .select()
         .single()

       if (upErr) throw upErr;
       profileData = updatedProfile;
    } else {
       const { data: newProfile, error: insErr } = await supabase
         .from('Profile')
         .insert({ userId, ...payload })
         .select()
         .single()

       if (insErr) throw insErr;
       profileData = newProfile;
    }

    // 3. Register to event if eventId provided
    if (eventId && eventId.trim()) {
      // Check if already registered
      const { data: existing } = await supabase
        .from('EventAttendee')
        .select('id')
        .eq('eventId', eventId)
        .eq('userId', userId)
        .maybeSingle()

      if (!existing) {
        const { error: attendeeErr } = await supabase
          .from('EventAttendee')
          .insert({
            eventId,
            userId,
            isVerified: false,
            isCheckedIn: false
          })

        if (attendeeErr) {
          console.error("Failed to register event attendee:", attendeeErr)
          // Don't fail profile creation if event registration fails
        }
      }
    }

    return NextResponse.json(profileData)
  } catch (error) {
    console.error(error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
