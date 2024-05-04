const express = require('express');
const router = express.Router();

const classHandler = require('../router_handler/class.js')

router.get('/page', classHandler.page)
router.get('/list', classHandler.list)
router.post('/add', classHandler.add)
router.put('/mod', classHandler.mod)
router.delete('/del/:id', classHandler.del)
// router.post('/searchByName', classHandler.searchByName)

module.exports = router