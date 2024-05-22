const express = require('express');
const router = express.Router();

const userHandler = require('../router_handler/user.js')

router.get('/page', userHandler.page)
router.get('/list', userHandler.list)
router.get('/:username', userHandler.findByUsername)
router.post('/add', userHandler.add)
router.put('/mod', userHandler.mod)
router.put('/modRole', userHandler.modRole)
router.delete('/del/:id', userHandler.del)

module.exports = router
