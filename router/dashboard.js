const express = require('express');
const router = express.Router();

const authHandler = require('../router_handler/dashboard.js')

router.get('/count', authHandler.count)
router.get('/school/count', authHandler.schoolCount)
router.get('/teacher/count/:id', authHandler.teacherCount)
router.get('/dormitory/count/:id', authHandler.dormitoryCount)
router.get('/class/count/:id', authHandler.classCount)

module.exports = router