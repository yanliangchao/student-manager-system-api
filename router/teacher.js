const express = require('express');
const router = express.Router();

const teacherHandler = require('../router_handler/teacher.js')

router.get('/page', teacherHandler.page)
router.get('/list', teacherHandler.list)
router.post('/add', teacherHandler.add)
router.put('/mod', teacherHandler.mod)
router.delete('/del/:id', teacherHandler.del)
// router.post('/searchByName', teacherHandler.searchByName)

module.exports = router