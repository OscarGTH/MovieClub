var path = require('path');
var User = require('../models/model');
var bodyParser   = require('body-parser')
const saltRounds = 5;
var bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');







// Gets all users.
exports.getUsers= function(req,res){
  User.find(function(err,user) {
    if(err){
      res.sendStatus(404);
      return console.error(err);
    }else{
      res.status(200);
      res.json(user);
    }
  });
}

// Gets specific user
exports.getUser= function(req,res){
  User.findOne({userId: req.params.id},function(err,user){
    if(err){
      res.status(404);
      res.json({error: err});
    }else{
      res.status(200);
      res.json(user);
    }
  });
}
// Deletes specific user
exports.deleteUser = function(req,res){
  res.status(200);
  res.json({name: "Delete an user", method: "DELETE"});
}
// Adds an user
exports.addUser= function(req,res){
  res.status(200);
  res.json({name: "Create a new user method", method: "POST"});
}

exports.updateUser = function(req,res){
  res.status(200);
  res.json({name: "Updates existing user method", method: "PUT"});
}

exports.login = function(req,res){
  console.log("Logging in");
}


// Registers an user.
exports.register = function(req,res){

}

// Login method. Validates the given username and password and logs in if they are valid.
exports.login = function(req,res){
}

exports.login = function(req,res){

}

exports.guestlogin = function(req,res){

}

exports.logout = function(req,res){

}



// Deletes the selected user.
exports.deleteUser = function(req,res){

}
