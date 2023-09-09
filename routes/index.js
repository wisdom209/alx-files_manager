const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FileController = require('../controllers/FilesController');

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

router.post('/files', FileController.postUpload);

router.get('/files/:id', FileController.getShow);
router.get('/files', FileController.getIndex);
router.put('/files/:id/publish', FileController.putPublish);
router.put('/files/:id/unpublish', FileController.putUnpublish);
router.get('/files/:id/data', FileController.getFile);

module.exports = router;
