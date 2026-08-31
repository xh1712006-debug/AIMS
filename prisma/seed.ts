import { PrismaClient, Role, Track } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('170106', 10)

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@aims.local' },
    update: {},
    create: {
      name: 'Mentor Admin',
      email: 'mentor@aims.local',
      password: passwordHash,
      role: Role.MENTOR,
    },
  })

  const intern = await prisma.user.upsert({
    where: { email: 'intern@aims.local' },
    update: {},
    create: {
      name: 'Nguyen Van A',
      email: 'intern@aims.local',
      password: passwordHash,
      role: Role.INTERN,
      projects: {
        create: {
          track: Track.SOFTWARE_DEVELOPMENT,
          title: 'Web-based Internship Portal',
          startDate: new Date('2026-08-17'),
          endDate: new Date('2026-10-26'),
        }
      }
    },
  })

  console.log('Seed dữ liệu thành công:', { mentor, intern })
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
