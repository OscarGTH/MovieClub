var express     = require('express');
var api         = express.Router();
const controller = require('../controller/apicontroller');


api.get('/user',controller.getUsers);
api.get('/user/:id',controller.getUser);
api.put('/user/:id',controller.updateUser);
api.post('/user',controller.addUser);
api.delete('/user/:id',controller.deleteUser);
api.post('/login',controller.login);

module.exports = api;
