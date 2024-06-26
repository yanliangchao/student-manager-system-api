const express = require('express');
const router = express.Router();

const detailsHandler = require('../router_handler/details.js')

router.get('/page/leave', detailsHandler.getLeave)
router.get('/page/:id', detailsHandler.page)
router.get('/list/:id/:sid', detailsHandler.list)
router.post('/add', detailsHandler.add)
router.post('/add/leave', detailsHandler.addLeave)
router.put('/mod', detailsHandler.mod)
router.delete('/del/:id', detailsHandler.del)
// router.post('/searchByName', schoolHandler.searchByName)

module.exports = router