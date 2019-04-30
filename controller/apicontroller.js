var path = require('path');
var User = require('../models/model');
var bodyParser   = require('body-parser')
const auth = require("jsonwebtoken");
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

// Logs the user in if the credentials are correct.
exports.login = function(req,res){
  console.log(req.body);
  res.status(200);
  res.json(req.body);
}


// Registers an user.
exports.addUser = function(req,res){
  console.log("Registering " + req.body.email + "!")
  res.status(200)
  res.json(req.body);
}

exports.getEvents = function (req,res){
  var events = [{name: "Party night", location: "Clubhouse", date: "13.05.2019", price: 15,key: 1},
  {name: "Movie day", location: "Cottage", date: "17.06.2019", price: 0,key: 2}];
  res.status(200);
  res.json(events);
}


exports.guestlogin = function(req,res){

}

exports.logout = function(req,res){

}



// Deletes the selected user.
exports.deleteUser = function(req,res){

}
