const { PrismaClient } = require('../generated/prisma')
const { computeStatus } = require('../lib/computeStatus')

const prisma = new PrismaClient()

function withStatus(field) {
  return { ...field, status: computeStatus(field) }
}

async function getAllFields(req, res) {
  try {
    const fields = await prisma.field.findMany({
      include: {
        assignments: {
          include: { agent: { select: { id: true, name: true, email: true } } },
        },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(fields.map(withStatus))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function getMyFields(req, res) {
  try {
    const fields = await prisma.field.findMany({
      where: {
        assignments: { some: { agentId: req.user.id } },
      },
      include: {
        assignments: {
          include: { agent: { select: { id: true, name: true, email: true } } },
        },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(fields.map(withStatus))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function createField(req, res) {
  try {
    const { name, cropType, plantingDate, agentId } = req.body
    if (!name || !cropType || !plantingDate) {
      return res.status(400).json({ error: 'name, cropType and plantingDate are required' })
    }

    const field = await prisma.field.create({
      data: {
        name,
        cropType,
        plantingDate: new Date(plantingDate),
        ...(agentId && {
          assignments: { create: { agentId: parseInt(agentId) } },
        }),
      },
      include: {
        assignments: {
          include: { agent: { select: { id: true, name: true, email: true } } },
        },
      },
    })
    res.status(201).json(withStatus(field))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function updateField(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { name, cropType, plantingDate, agentId } = req.body

    const field = await prisma.field.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(cropType && { cropType }),
        ...(plantingDate && { plantingDate: new Date(plantingDate) }),
      },
    })

    if (agentId !== undefined) {
      await prisma.fieldAssignment.deleteMany({ where: { fieldId: id } })
      if (agentId !== null) {
        await prisma.fieldAssignment.create({
          data: { fieldId: id, agentId: parseInt(agentId) },
        })
      }
    }

    const updated = await prisma.field.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { agent: { select: { id: true, name: true, email: true } } },
        },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    res.json(withStatus(updated))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function deleteField(req, res) {
  try {
    const id = parseInt(req.params.id)
    await prisma.field.delete({ where: { id } })
    res.json({ message: 'Field deleted' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function getAgents(req, res) {
  try {
    const agents = await prisma.user.findMany({
      where: { role: 'AGENT' },
      select: { id: true, name: true, email: true },
    })
    res.json(agents)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getAllFields, getMyFields, createField, updateField, deleteField, getAgents }