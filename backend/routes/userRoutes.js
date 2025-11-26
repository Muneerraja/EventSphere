const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/register', userController.register);
router.get('/verify/:token', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);
router.delete('/profile', authenticate, userController.deleteUser);
router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;
