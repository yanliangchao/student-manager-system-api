const express = require('express');
const router = express.Router();

const detailsHandler = require('../router_handler/details.js')

router.get('/page', detailsHandler.page)
router.get('/list/:sid', detailsHandler.list)
router.post('/add', detailsHandler.add)
router.put('/mod', detailsHandler.mod)
router.delete('/del/:id', detailsHandler.del)
// router.post('/searchByName', schoolHandler.searchByName)

module.exports = router