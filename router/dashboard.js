const express = require('express');
const router = express.Router();

const dashboardHandler = require('../router_handler/dashboard.js')

router.get('/count', dashboardHandler.count)
router.get('/school/count', dashboardHandler.schoolCount)
router.get('/school/leave', dashboardHandler.getLeave)
router.get('/teacher/count/:id', dashboardHandler.teacherCount)
router.get('/dormitory/count/:id', dashboardHandler.dormitoryCount)
router.get('/class/count/:id', dashboardHandler.classCount)
router.get('/teacher/pinfen', dashboardHandler.getPinfenCount)

module.exports = router