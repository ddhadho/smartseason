const { PrismaClient } = require('../generated/prisma')

const prisma = new PrismaClient()

async function getFieldUpdates(req, res) {
  try {
    const fieldId = parseInt(req.params.id)
    const updates = await prisma.fieldUpdate.findMany({
      where: { fieldId },
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(updates)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

async function addFieldUpdate(req, res) {
  try {
    const fieldId = parseInt(req.params.id)
    const { stage, notes } = req.body

    if (!stage) return res.status(400).json({ error: 'stage is required' })

    const validStages = ['PLANTED', 'GROWING', 'READY', 'HARVESTED']
    if (!validStages.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' })
    }

    const update = await prisma.fieldUpdate.create({
      data: { fieldId, agentId: req.user.id, stage, notes },
      include: { agent: { select: { id: true, name: true } } },
    })

    await prisma.field.update({
      where: { id: fieldId },
      data: { stage },
    })

    res.status(201).json(update)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getFieldUpdates, addFieldUpdate }