const authMiddleware = require('../middleware/authMiddleware')
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller')

router.get('/me',authMiddleware, userController.getMe);
router.get('/all',authMiddleware, userController.getAllUsers);
router.put('/socket',authMiddleware, userController.updateSocketId);
router.post('/logout',authMiddleware, userController.logoutUser);
router.get('/:id',authMiddleware, userController.getUserById);
router.put('/:id',authMiddleware, userController.updateUser);
router.delete('/:id',authMiddleware, userController.deleteUser);

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
