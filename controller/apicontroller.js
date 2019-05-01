var path = require("path");
var User = require("../models/model");
var bodyParser = require("body-parser");
const auth = require("jsonwebtoken");
const saltRounds = 5;
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
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
        res.status(404);
        res.json({ error: err });
      } else {
        res.status(200);
        res.json(user);
      }
    });
  } else {
    User.findOne({ userId: req.params.id }, function(err, user) {
      if (err) {
        res.status(404);
        res.json({ error: err });
      } else {
        if (user.role != 1) {
          res.status(200);
          res.json(user);
        } else {
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
      if (
        (req.session.user.role == 0 && req.body.user.role == 0) ||
        req.session.user.role == 1
      ) {
        // Find the editable user
        User.findOne({ _id: req.body._id })
          .exec()
          .then(user => {
            if (req.body.password === user.password) {
            } else {
              // Create a new user.
              var user = new User();

              // Hashing password.
              bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                // Setting the user data.
                user.email = req.body.email;
                user.password = hash;
                user.role = req.body.role;
                user.paid = req.body.paid;
                // Updating the user and returning the new user.
                User.findOneAndUpdate(
                  { _id: req.body._id },
                  {
                    $set: {
                      email: user.email,
                      password: user.password,
                      role: user.role,
                      paid: user.paid
                    }
                  },
                  { new: true },
                  function(err, user) {
                    if (err) {
                      res.status(400);
                      res.render("error", {
                        message: "Error when updating user data",
                        titleMessage: "Database error"
                      });
                    } else if (req.body.id === req.session.user._id) {
                      req.session.user = user;
                    }
                    console.log(user);
                    if (err) {
                      res.status(401).json({ message: "Authorization failed" });
                    } else {
                      res.status(200).json({ message: "User updated" });
                    }
                  }
                );
              });
            }
          });
      } else {
        res.status(401).json({ message: "Authorization failed" });
      }
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
                res.status(401).json({ message: "Authorization failed" });
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
  check("role")
    .isIn([0, 1])
    .withMessage("Role has to be 0 (user) or 1 (admin)"),
  (req, res) => {
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
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
                    (user.role = req.body.role),
                    (user.paid = false);
                  user.userId = userId;
                  user.save(function(err) {
                    if (err) {
                      res.status(401).json({ message: "Authorization failed" });
                    } else {
                      res.status(200).json({ message: "Account created" });
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
  var events = [
    {
      name: "Party night",
      location: "Clubhouse",
      date: "13.05.2019",
      price: 15,
      key: 1
    },
    {
      name: "Movie day",
      location: "Cottage",
      date: "17.06.2019",
      price: 0,
      key: 2
    }
  ];
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
  if (req.session.user.role == 1) {
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
