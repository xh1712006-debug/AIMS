const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'admin@test.com' } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  
  console.log("User found:", user.email, user.role);
  
  const isValid = await bcrypt.compare('password123', user.password);
  console.log("Password valid for password123:", isValid);
}

main().finally(() => prisma.$disconnect());
