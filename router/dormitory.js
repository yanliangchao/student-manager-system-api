const express = require('express');
const router = express.Router();

const dormitoryHandler = require('../router_handler/dormitory.js')

router.get('/page', dormitoryHandler.page)
router.get('/list', dormitoryHandler.list)
router.post('/add', dormitoryHandler.add)
router.put('/mod', dormitoryHandler.mod)
router.delete('/del/:id', dormitoryHandler.del)
// router.post('/searchByName', dormitoryHandler.searchByName)

module.exports = router