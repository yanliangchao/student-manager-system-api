const express = require('express');
const router = express.Router();

const authHandler = require('../router_handler/auth.js')

router.post('/login', authHandler.login)
router.post('/files', authHandler.files)

module.exports = router