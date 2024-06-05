const express = require('express');
const router = express.Router();

const dormitoryHandler = require('../router_handler/dormitory.js')

router.get('/page', dormitoryHandler.page)
router.get('/list', dormitoryHandler.list)
router.get('/list/:sid', dormitoryHandler.listBySid)
router.get('/list/stu/:id', dormitoryHandler.getStuByid)
router.get('/storey', dormitoryHandler.getStorey)
router.get('/list/print/pingfen', dormitoryHandler.pingfenPrint)
router.post('/add', dormitoryHandler.add)
router.post('/add/pingfen', dormitoryHandler.pingfen)
router.post('/add/dianming', dormitoryHandler.dianming)
router.post('/add/print/dianming', dormitoryHandler.dianmingPrint)
router.post('/add/stu', dormitoryHandler.addStu)
router.put('/mod', dormitoryHandler.mod)
router.put('/mod/stu', dormitoryHandler.modStu)
router.delete('/del/:id', dormitoryHandler.del)
router.delete('/del/stu/:id', dormitoryHandler.delStu)
// router.post('/searchByName', dormitoryHandler.searchByName)

module.exports = router