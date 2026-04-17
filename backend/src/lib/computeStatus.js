function computeStatus(field) {
  const now = new Date()
  const daysSincePlanting = (now - new Date(field.plantingDate)) / (1000 * 60 * 60 * 24)
  const daysSinceUpdate = (now - new Date(field.updatedAt)) / (1000 * 60 * 60 * 24)

  if (field.stage === 'HARVESTED') return 'Completed'

  if (field.stage === 'READY' && daysSinceUpdate >= 7) return 'At Risk'

  if (daysSincePlanting >= 120 && (field.stage === 'PLANTED' || field.stage === 'GROWING')) {
    return 'At Risk'
  }

  return 'Active'
}

module.exports = { computeStatus }