const express = require('express');
const router = express.Router();

const subjectHandler = require('../router_handler/subject.js')

router.get('/page', subjectHandler.page)
router.get('/list', subjectHandler.list)
router.post('/add', subjectHandler.add)
router.put('/mod', subjectHandler.mod)
router.delete('/del/:id', subjectHandler.del)
// router.post('/searchByName', subjectHandler.searchByName)

module.exports = router