const express = require('express')
const AppController = require('../controllers/AppController')
const UsersController = require('../controllers/UsersController')
const UsersController = require('../controllers/AuthController')

const router = express.Router()

router.get('/status', AppController.getStatus)
router.get('/stats', AppController.getStats)

router.post('/users', UsersController.createUser)
router.get('/users/me', UsersController.getMe)

router.get('/connect', AuthController.getConnect)
router.get('/disconnect', AuthController.getDisconnect)


module.exports = router
