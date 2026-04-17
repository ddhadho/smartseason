const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const agentPassword = await bcrypt.hash('agent123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartseason.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@smartseason.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })

  const agent1 = await prisma.user.upsert({
    where: { email: 'jane@smartseason.com' },
    update: {},
    create: {
      name: 'Jane Wanjiku',
      email: 'jane@smartseason.com',
      passwordHash: agentPassword,
      role: 'AGENT',
    },
  })

  const agent2 = await prisma.user.upsert({
    where: { email: 'peter@smartseason.com' },
    update: {},
    create: {
      name: 'Peter Otieno',
      email: 'peter@smartseason.com',
      passwordHash: agentPassword,
      role: 'AGENT',
    },
  })

  const now = new Date()
  const daysAgo = (n) => new Date(now - n * 24 * 60 * 60 * 1000)

  const fields = await Promise.all([
    prisma.field.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Kiambu North Plot',
        cropType: 'Maize',
        plantingDate: daysAgo(130),
        stage: 'PLANTED',
      },
    }),
    prisma.field.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Nakuru East Farm',
        cropType: 'Wheat',
        plantingDate: daysAgo(60),
        stage: 'GROWING',
      },
    }),
    prisma.field.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Eldoret Block A',
        cropType: 'Barley',
        plantingDate: daysAgo(90),
        stage: 'READY',
        updatedAt: daysAgo(10),
      },
    }),
    prisma.field.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        name: 'Meru Valley Plot',
        cropType: 'Beans',
        plantingDate: daysAgo(45),
        stage: 'GROWING',
      },
    }),
    prisma.field.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        name: 'Kisumu Riverside',
        cropType: 'Rice',
        plantingDate: daysAgo(20),
        stage: 'PLANTED',
      },
    }),
    prisma.field.upsert({
      where: { id: 6 },
      update: {},
      create: {
        id: 6,
        name: 'Thika Road Farm',
        cropType: 'Maize',
        plantingDate: daysAgo(110),
        stage: 'HARVESTED',
      },
    }),
  ])

  await Promise.all([
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 1, agentId: agent1.id } },
      update: {},
      create: { fieldId: 1, agentId: agent1.id },
    }),
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 2, agentId: agent1.id } },
      update: {},
      create: { fieldId: 2, agentId: agent1.id },
    }),
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 3, agentId: agent1.id } },
      update: {},
      create: { fieldId: 3, agentId: agent1.id },
    }),
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 4, agentId: agent2.id } },
      update: {},
      create: { fieldId: 4, agentId: agent2.id },
    }),
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 5, agentId: agent2.id } },
      update: {},
      create: { fieldId: 5, agentId: agent2.id },
    }),
    prisma.fieldAssignment.upsert({
      where: { fieldId_agentId: { fieldId: 6, agentId: agent2.id } },
      update: {},
      create: { fieldId: 6, agentId: agent2.id },
    }),
  ])

  console.log('Seeded users:', admin.email, agent1.email, agent2.email)
  console.log('Seeded', fields.length, 'fields with assignments')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())