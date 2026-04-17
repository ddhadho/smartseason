const { PrismaClient } = require('../generated/prisma')
const { computeStatus } = require('../lib/computeStatus')

const prisma = new PrismaClient()

async function getDashboard(req, res) {
  try {
    const isAdmin = req.user.role === 'ADMIN'

    const fields = await prisma.field.findMany({
      where: isAdmin ? {} : { assignments: { some: { agentId: req.user.id } } },
      include: {
        assignments: {
          include: { agent: { select: { id: true, name: true } } },
        },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    const withStatuses = fields.map((f) => ({ ...f, status: computeStatus(f) }))

    const summary = {
      total: fields.length,
      active: withStatuses.filter((f) => f.status === 'Active').length,
      atRisk: withStatuses.filter((f) => f.status === 'At Risk').length,
      completed: withStatuses.filter((f) => f.status === 'Completed').length,
      byStage: {
        PLANTED: fields.filter((f) => f.stage === 'PLANTED').length,
        GROWING: fields.filter((f) => f.stage === 'GROWING').length,
        READY: fields.filter((f) => f.stage === 'READY').length,
        HARVESTED: fields.filter((f) => f.stage === 'HARVESTED').length,
      },
    }

    if (isAdmin) {
      const agents = await prisma.user.findMany({
        where: { role: 'AGENT' },
        select: { id: true, name: true, _count: { select: { assignments: true } } },
      })
      return res.json({ summary, agents })
    }

    res.json({ summary })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

module.exports = { getDashboard }