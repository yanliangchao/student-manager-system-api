const express = require('express');
const router = express.Router();

const schoolHandler = require('../router_handler/school.js')

router.get('/page', schoolHandler.page)
router.get('/list', schoolHandler.list)
router.post('/add', schoolHandler.add)
router.put('/mod', schoolHandler.mod)
router.delete('/del/:id', schoolHandler.del)
// router.post('/searchByName', schoolHandler.searchByName)

module.exports = router