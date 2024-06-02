const express = require('express');
const router = express.Router();

const studentHandler = require('../router_handler/student.js')

router.get('/page', studentHandler.page)
router.get('/page/cid/:id', studentHandler.pageByCid)
router.get('/list', studentHandler.list)
router.get('/list/:gender', studentHandler.listByDormitory)
router.post('/add', studentHandler.add)
router.post('/addAll', studentHandler.addAll)
router.put('/mod', studentHandler.mod)
router.delete('/del/:id', studentHandler.del)
// router.post('/searchByName', studentHandler.searchByName)

module.exports = router