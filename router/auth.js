const express = require('express');
const router = express.Router();

const authHandler = require('../router_handler/auth.js')

router.post('/login', authHandler.login)

module.exports = router