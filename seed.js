const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// Helpers for random generation
const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const midNames = ["Văn", "Thị", "Hữu", "Minh", "Thanh", "Hoàng", "Đức", "Ngọc", "Tuấn", "Phương"];
const lastNames = ["Hải", "Linh", "Anh", "Hùng", "Cường", "Trang", "Lan", "Sơn", "Tuấn", "Bình", "Thảo", "Hương", "Huy", "Long", "Nam", "Nga"];

function genName() {
  return `${randItem(firstNames)} ${randItem(midNames)} ${randItem(lastNames)}`;
}

const tracks = ['SOFTWARE_DEVELOPMENT', 'DATA_ANALYTICS', 'AI_ML_RESEARCH', 'SOFTWARE_TESTING'];
const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];

async function main() {
  console.log("Cleaning up old data...");
  await prisma.comment.deleteMany();
  await prisma.sprintReview.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.workItem.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.priorityLevel.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding started...");
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Core test accounts for quick login
  const coreAccounts = [
    { email: 'admin@test.com', role: 'ADMIN', name: 'Test Admin' },
    { email: 'projectManager@test.com', role: 'PROJECT_MANAGER', name: 'Test PM' },
    { email: 'memberManager@test.com', role: 'MEMBER_MANAGER', name: 'Test Scrum Master' },
    { email: 'intern@test.com', role: 'INTERN', name: 'Test Intern' },
    { email: 'partner@test.com', role: 'PARTNER', name: 'Test Partner' }
  ];

  console.log("Generating Users...");
  const createdUsers = [];
  
  // Create core accounts
  for (const acc of coreAccounts) {
    const user = await prisma.user.create({
      data: { email: acc.email, role: acc.role, name: acc.name, password: hashedPassword }
    });
    createdUsers.push(user);
  }

  // Generate remaining 45 random users (plenty of interns to assign 1 project each)
  for (let i = 0; i < 45; i++) {
    // Let's make sure we have enough interns for 20 projects. We need 20 interns minimum.
    const role = i < 10 ? 'PROJECT_MANAGER' : 
                 i < 15 ? 'MEMBER_MANAGER' : 
                 i < 20 ? 'PARTNER' : 'INTERN'; // 25 INTERNS
    
    const name = genName();
    const slug = name.toLowerCase().replace(/ /g, '') + i + 'x';
    const user = await prisma.user.create({
      data: {
        name,
        email: `${slug}@example.com`,
        password: hashedPassword,
        role
      }
    });
    createdUsers.push(user);
  }
  
  const interns = createdUsers.filter(u => u.role === 'INTERN');
  const pms = createdUsers.filter(u => u.role === 'PROJECT_MANAGER');
  const mms = createdUsers.filter(u => u.role === 'MEMBER_MANAGER');
  const partners = createdUsers.filter(u => u.role === 'PARTNER');

  // The core intern account must be at the very front to get the first project
  const testInternIndex = interns.findIndex(i => i.email === 'intern@test.com');
  if (testInternIndex > -1) {
    const [testIntern] = interns.splice(testInternIndex, 1);
    interns.unshift(testIntern);
  }

  const testPM = pms.find(p => p.email === 'projectManager@test.com');
  const testMM = mms.find(m => m.email === 'memberManager@test.com');
  const testPartner = partners.find(p => p.email === 'partner@test.com');

  // Generate 20 projects
  console.log("Generating Projects...");
  for (let i = 0; i < 20; i++) {
    // EXACTLY ONE PROJECT PER INTERN. We pop an intern from the array.
    const intern = interns.shift();
    if (!intern) break; // Out of interns!

    // We can assign the same PM/MM/Partner to multiple projects, but we heavily use test accounts for the first few.
    const pm = i < 3 ? testPM : randItem(pms);
    const mm = i < 3 ? testMM : randItem(mms);
    const partner = i < 3 ? testPartner : randItem(partners);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - randInt(10, 60)); // started 10 to 60 days ago
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);

    const project = await prisma.project.create({
      data: {
        title: i === 0 ? `Dự án trọng điểm (Core Test)` : `Dự án thực tập ${i + 1} - ${intern.name}`,
        internId: intern.id,
        projectManagerId: pm.id,
        memberManagerId: mm.id,
        partnerId: partner.id,
        track: randItem(tracks),
        startDate,
        endDate,
        githubRepo: `intern${intern.id.substring(0,4)}/project-${i+1}`,
        status: 'ACTIVE'
      }
    });

    // Create priorities
    await prisma.priorityLevel.createMany({
      data: [
        { projectId: project.id, name: 'Must Have', level: 1, color: '#ef4444' },
        { projectId: project.id, name: 'Should Have', level: 2, color: '#f59e0b' },
        { projectId: project.id, name: 'Could Have', level: 3, color: '#3b82f6' },
      ]
    });
    
    const priorities = await prisma.priorityLevel.findMany({ where: { projectId: project.id } });

    // Create 6 Stages per project (Rolling 10-week model chuẩn Excel)
    const sprints = [];
    const stageNames = ['Onboarding', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Final Review'];
    const stageDurations = [1, 2, 2, 2, 2, 1]; // weeks
    let stageStart = new Date(startDate);
    for (let s = 0; s < stageNames.length; s++) {
      const spStart = new Date(stageStart);
      const spEnd = new Date(spStart);
      spEnd.setDate(spEnd.getDate() + stageDurations[s] * 7);

      const sprint = await prisma.sprint.create({
        data: {
          projectId: project.id,
          name: stageNames[s],
          startDate: spStart,
          endDate: spEnd
        }
      });
      sprints.push(sprint);
      stageStart = new Date(spEnd);
    }

    // Create top-level items (Feature/Research/Analysis theo Track)
    const topLevelTypes = project.track === 'AI_ML_RESEARCH' ? ['RESEARCH', 'EXPERIMENT'] :
                          project.track === 'DATA_ANALYTICS'  ? ['ANALYSIS', 'RESEARCH'] :
                          project.track === 'SOFTWARE_TESTING'? ['TEST', 'FEATURE'] :
                          ['FEATURE', 'RESEARCH']; // SOFTWARE_DEVELOPMENT
    const epics = [];
    for (let e = 0; e < 3; e++) {
      const itemType = topLevelTypes[e % topLevelTypes.length];
      const epic = await prisma.workItem.create({
        data: {
          projectId: project.id,
          title: `[${itemType}] Mục tiêu chính ${e + 1}`,
          description: `Mô tả cho mục tiêu ${itemType.toLowerCase()} số ${e + 1}`,
          type: itemType,
          status: randItem(['TODO', 'IN_PROGRESS', 'DONE'])
        }
      });
      epics.push(epic);
    }

    // Create child work items (Bug/Spike/Test/Documentation)
    const childTypes = ['BUG', 'SPIKE', 'TEST', 'DOCUMENTATION'];
    for (let t = 1; t <= 15; t++) {
      const type = randItem(childTypes);
      const epic = randItem(epics);
      const sprint = randItem([...sprints.slice(1, 5), null]); // Sprint 1-4 only (skip Onboarding/Final)
      const status = randItem(statuses);
      const priority = randItem(priorities);

      await prisma.workItem.create({
        data: {
          projectId: project.id,
          sprintId: sprint ? sprint.id : null,
          parentId: epic.id,
          title: `[${type}] Công việc số ${t}`,
          description: `Chi tiết công việc ${t}`,
          type,
          status,
          priorityId: priority.id,
          order: t,
          requiresFix: type === 'BUG' && Math.random() > 0.6
        }
      });
    }

    // Create some check-ins
    for (let c = 0; c < 5; c++) {
      await prisma.checkIn.create({
        data: {
          projectId: project.id,
          doneTasks: `- Hoàn thành task ${c}`,
          nextTasks: `- Bắt đầu task ${c+1}`,
          blockers: c % 2 === 0 ? '- Không có cản trở' : '- Chờ feedback từ PM',
          riskStatus: c % 2 === 0 ? 'GREEN' : 'YELLOW',
          createdAt: new Date(Date.now() - c * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  console.log("Seeding complete! Old data cleared. 1 Project = 1 Intern rule enforced.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
