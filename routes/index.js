const express = require('express')
const router = express.Router()

router.use('/', require('./routes'))
router.use('/api', require('./apis'))

module.exports = router
