const express = require('express')
const { authenticate, requireRole } = require('../middleware/auth')
const {
  getAllFields, getMyFields, createField, updateField, deleteField, getAgents,
} = require('../controllers/fieldController')
const { getFieldUpdates, addFieldUpdate } = require('../controllers/updateController')

const router = express.Router()

router.use(authenticate)

router.get('/agents', requireRole('ADMIN'), getAgents)
router.get('/', requireRole('ADMIN'), getAllFields)
router.get('/my', requireRole('AGENT'), getMyFields)
router.post('/', requireRole('ADMIN'), createField)
router.put('/:id', requireRole('ADMIN'), updateField)
router.delete('/:id', requireRole('ADMIN'), deleteField)

router.get('/:id/updates', getFieldUpdates)
router.post('/:id/updates', requireRole('AGENT'), addFieldUpdate)

module.exports = router