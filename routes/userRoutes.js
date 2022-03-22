const express = require('express');
const Router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

Router.post('/signup', authController.signUp);
Router.post('/login', authController.logIn);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

Router.use(authController.verifyAccess);

Router.patch('/updateMyPassword', authController.updatePassword);
Router.patch('/updateMe', userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);
Router.route('/me').get(userController.getMe, userController.getuser);

Router.use(authController.restrictTo('admin'));

Router.route('/')
  .get(userController.getAllusers)
  .post(userController.createuser);
Router.route('/:id')
  .get(userController.getuser)
  .patch(userController.updateuser)
  .delete(userController.deleteuser);

module.exports = Router;
