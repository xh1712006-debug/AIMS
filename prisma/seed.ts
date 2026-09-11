import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Create System Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password,
      role: Role.ADMIN,
    },
    create: {
      email: 'admin@test.com',
      name: 'System Admin',
      password,
      role: Role.ADMIN,
    },
  });

  // 2. Create ProjectManager
  const projectManager = await prisma.user.upsert({
    where: { email: 'projectManager@test.com' },
    update: {
      password,
      role: Role.PROJECT_MANAGER,
    },
    create: {
      email: 'projectManager@test.com',
      name: 'Test ProjectManager',
      password,
      role: Role.PROJECT_MANAGER,
    },
  });

  // 3. Create Intern
  const intern = await prisma.user.upsert({
    where: { email: 'intern@test.com' },
    update: {
      password,
      role: Role.INTERN,
    },
    create: {
      email: 'intern@test.com',
      name: 'Test Intern',
      password,
      role: Role.INTERN,
    },
  });

  // 4. Create Member Manager
  const memberManager = await prisma.user.upsert({
    where: { email: 'memberManager@test.com' },
    update: { password, role: Role.MEMBER_MANAGER },
    create: { email: 'memberManager@test.com', name: 'Test MemberManager', password, role: Role.MEMBER_MANAGER },
  });

  // 5. Create Partner
  const partner = await prisma.user.upsert({
    where: { email: 'partner@test.com' },
    update: { password, role: Role.PARTNER },
    create: { email: 'partner@test.com', name: 'Test Partner', password, role: Role.PARTNER },
  });

  console.log({ admin, projectManager, intern, memberManager, partner });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
