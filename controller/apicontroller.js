var User = require("../models/model");
const saltRounds = 5;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const events = require("../client/events/events.json");
const { check, validationResult } = require("express-validator/check");

// Gets all users.
exports.getUsers = function(req, res) {
  // Check that the user has logged in.
  if (req.session.user.role == 1) {
    User.find()
      .exec()
      .then(user => {
        if (!user) {
          res.sendStatus(404).json({ message: "Cannot find users." });
        } else {
          res.status(200).json({
            message: user
          });
        }
      });
  } else {
    User.find({ role: 0 })
      .exec()
      .then(user => {
        if (!user) {
          res.sendStatus(404).json({ message: "Cannot find users." });
        } else {
          res.status(200).json({
            message: user
          });
        }
      });
  }
};

// Gets specific user
exports.getUser = function(req, res) {
  if (req.session.user.role == 1) {
    User.findOne({ userId: req.params.id }, function(err, user) {
      if (err) {
        res.status(404).json({ error: err });
      } else {
        res.status(200).json(user);
      }
    });
    // If the user is basic user, give only users with basic role.
  } else {
    User.findOne({ userId: req.params.id }, function(err, user) {
      if (err) {
        res.status(404);
        res.json({ error: err });
      } else {
        if (user.role != 1 && user._id == req.body.user._id) {
          res.status(200).json(user);
        } else {
          console.log(
            "Requested user was admin or the basic user asked someone else's info"
          );
          res.status(401).json({ message: "Authorization failed" });
        }
      }
    });
  }
};

exports.updateUser = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  check("paid").isBoolean(),
  check("role").isIn([0, 1]),
  (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      console.log("No errors and we are on update!");
      // Check that the user is either basic and updating himself or that the user is admin.
      // Find the editable user
      User.findOne({ _id: req.body._id })
        .exec()
        .then(result => {
          var passwordEdited = false;
          // If the password has remained the same, don't change it.
          if (req.body.password !== result.password) {
            passwordEdited = true;
          }
          // Hashing password.
          bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if (err) {
              res.status(400).json({ message: "Error when editing user" });
            } else {
              //Set email into an object
              var user = { email: req.body.email };
              // If the password has been edited, set the new hashed one to replace the old one.
              if (passwordEdited) {
                user.password = hash;
              }
              // If the editing user is an admin, allow role and payment status to be set also.
              if (req.session.user.role) {
                user.role = req.body.role;
                user.paid = req.body.paid;
              }
            }

            // Updating the user and returning the updated user.
            User.findOneAndUpdate(
              { _id: req.body._id },
              { $set: user },
              { new: true },
              function(err, user) {
                if (err) {
                  return res
                    .status(400)
                    .json({ message: "Error when editing user." });
                }
                // If the user edited themselves, set session as the new user.
                else if (req.body._id === req.session.user._id) {
                  req.session.user = user;
                }
                // Return the new user
                return res.status(200).json({
                  user: req.session.user
                });
              }
            );
          });
        });
    } else {
      res.status(401).json({ message: "Invalid format" });
    }
  }
];

// Logs the user in if the credentials are correct.
exports.login = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  (req, res) => {
    // Checking for validation errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      User.find({ email: req.body.email })
        .exec()
        .then(user => {
          if (typeof user[0] === "undefined") {
            return res.status(401).json({
              message: "Authorization failed"
            });
          } else {
            bcrypt.compare(
              req.body.password,
              user[0].password,
              (err, result) => {
                if (err) {
                  return res
                    .status(401)
                    .json({ message: "Authorization failed" });
                }
                if (result) {
                  req.session.user = user[0];
                  // Sign a jsonwebtoken
                  const token = jwt.sign(
                    {
                      email: user[0].email,
                      userId: user[0]._id
                    },
                    "supermegasecret",
                    {
                      expiresIn: "1h"
                    }
                  );
                  return res
                    .status(200)
                    .json({ message: req.session.user, token: token });
                }
                return res
                  .status(401)
                  .json({ message: "Authorization failed" });
              }
            );
          }
        });
    } else {
      res.status(400).json({ message: "Invalid format" });
    }
  }
];

// Registers an user.
exports.addUser = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  (req, res) => {
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      console.log(req.body.email + " ja " + req.body.password);
      // First off, make sure the email is not duplicate.
      User.find({ email: req.body.email })
        .exec()
        .then(result => {
          if (result[0]) {
            res.status(400).json({ message: "Email already in use" });
          } else {
            var userId = 1;
            // Find the highest user id from all users.
            User.find({})
              .sort({ userId: -1 })
              .limit(1)
              .exec()
              .then(result => {
                // If array is not undefined or empty, go on.
                if (typeof result !== "undefined" && result.length > 0) {
                  console.log(result[0].userId);
                  // Add one to the result user id and save it to a variable.
                  userId = result[0].userId + 1;
                }

                // Create a new user.
                var user = new User();

                // Hashing password.
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                  // Setting the user data.
                  (user.email = req.body.email),
                    (user.password = hash),
                    (user.role = 0),
                    (user.paid = false);
                  user.userId = userId;
                  user.save(function(err) {
                    if (err) {
                      res.status(401).json({ message: "Authorization failed" });
                    } else {
                      res.status(200).json({
                        email: user.email,
                        message: "Account created"
                      });
                    }
                  });
                });
              });
          }
        });
    } else {
      // Validation failed.
      res.status(400).json({ message: "Check given information" });
    }
  }
];

exports.getEvents = function(req, res) {
  res.status(200);
  res.json(events);
};

exports.guestlogin = function(req, res) {};

exports.logout = function(req, res) {
  req.session.user = null;
  res.status(200).json();
};

// Deletes the selected user.
exports.deleteUser = function(req, res) {
  console.log("Deleting user " + req.params.id);
  if (req.session.user.role == 1 || req.session.user.userId == req.params.id) {
    User.deleteOne({ userId: req.params.id })
      .exec()
      .then(result => {
        // Check if there are deleted users.
        if (result.deletedCount < 1) {
          res.status(401).json({ message: "Deletion failed" });
        } else if (result.deletedCount > 0) {
          res.status(200).json({ message: "Deletion successful" });
        }
      });
  } else {
    res.status(401).json({ message: "Authorization failed" });
  }
};
