var express     = require('express');
var api         = express.Router();
const controller = require('../controller/apicontroller');
const Auth = require('../methods/auth');

// Route for getting all users. Token authentication.
api.get('/user',Auth.tokenAuth,Auth.checkLogin,controller.getUsers);
api.get('/user/:id',Auth.tokenAuth,Auth.checkLogin,controller.getUser);
api.put('/user/:id',Auth.tokenAuth,Auth.checkLogin,controller.updateUser);
api.post('/user',controller.addUser);
api.delete('/user/:id',Auth.tokenAuth,Auth.checkLogin,controller.deleteUser);
api.post('/login',controller.login);
api.get('/events',controller.getEvents);
api.get('/logout',Auth.tokenAuth,Auth.checkLogin,controller.logout);

module.exports = api;
