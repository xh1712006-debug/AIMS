import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  console.log("PROJECTS:");
  projects.forEach(p => console.log(p.id, p.title, "PM_ID:", p.projectManagerId));

  const users = await prisma.user.findMany({ where: { role: 'PROJECT_MANAGER' }});
  console.log("PROJECT MANAGERS:");
  users.forEach(u => console.log(u.id, u.email));
}

main().catch(console.error).finally(() => prisma.$disconnect());
