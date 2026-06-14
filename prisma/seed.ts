import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'superadmin@admin.com'

  // Create Superadmin in Prisma User table
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      name: 'Super Admin'
    },
    create: {
      id: 'superadmin-uuid', // This should ideally match the Supabase Auth ID if created manually
      email: adminEmail,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  })

  console.log({ admin })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
