const express = require('express');
const router = express.Router();

const dormitoryHandler = require('../router_handler/dormitory.js')

router.get('/page', dormitoryHandler.page)
router.get('/list', dormitoryHandler.list)
router.get('/list/:sid', dormitoryHandler.listBySid)
router.get('/list/stu/:id', dormitoryHandler.getStuByid)
router.post('/add', dormitoryHandler.add)
router.post('/add/stu', dormitoryHandler.addStu)
router.put('/mod', dormitoryHandler.mod)
router.put('/mod/stu', dormitoryHandler.modStu)
router.delete('/del/:id', dormitoryHandler.del)
router.delete('/del/stu/:id', dormitoryHandler.delStu)
// router.post('/searchByName', dormitoryHandler.searchByName)

module.exports = router