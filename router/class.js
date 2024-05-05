const express = require('express');
const router = express.Router();

const classHandler = require('../router_handler/class.js')

router.get('/page', classHandler.page)
router.get('/list', classHandler.list)
router.get('/list/sub/tec/:id', classHandler.getSubTecById)
router.post('/add', classHandler.add)
router.post('/add/sub/tec', classHandler.addSubTec)
router.put('/mod', classHandler.mod)
router.delete('/del/:id', classHandler.del)
router.delete('/del/sub/tec', classHandler.delSubTec)
// router.post('/searchByName', classHandler.searchByName)

module.exports = router