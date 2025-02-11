var User = require("../models/usermodel");
const saltRounds = 5;
var bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");

// Renders the main view if session exists.
exports.main = function(req, res) {
  if (req.session.user) {
    res.render("main", {
      registered: true,
      user: req.session.user,
      csrfToken: req.csrfToken()
    });
  } else {
    res.render("login", { csrfToken: req.csrfToken() });
  }
};
// Handles the payment post request.
exports.pay = function(req, res) {
  /* Check that some basic information is present.
   If legit card authorization would be implemented, check would be much more robust.*/
  if (req.body.cardname != "" || req.body.cvv != "") {
    // Find the user who needs to be updated.
    User.findOneAndUpdate(
      { _id: req.session.user._id },
      { $set: { paid: true } },
      { new: true },
      function(err, user) {
        if (err) {
          res.status(400);
          res.render("error", {
            message: "Error when trying to pay!",
            titleMessage: "Payment error."
          });
        } else {
          // If payment was succesful,
          req.session.user = user;
          res.status(200).render("main", {
            message: "Membership fee successfully paid!",
            user: user,
            csrfToken: req.csrfToken()
          });
        }
      }
    );
  } else {
    res.status(400).render("error", {
      message: "Card could not be validated",
      titleMessage: "Validation error"
    });
  }
};
exports.showPayForm = function(req, res) {
  res.render("pay_view", { csrfToken: req.csrfToken() });
};

// Renders a list of the users. Shows all users for admin and only registered for registered users.
exports.users = function(req, res) {
  // If the requester has not logged in, block them and send error message.
  if (req.session != null) {
    // If the user is admin, find all users.
    if (req.session.user.role == 1) {
      User.find(function(err, user) {
        if (err) {
          return res.status(404).render("error", {
            message: "Users not found.",
            titleMessage: "Database error"
          });
        }
        res.render("users", {
          users: user,
          admin: true,
          csrfToken: req.csrfToken()
        });
      });
    } else {
      // Find users only with basic role.
      User.find({ role: 0 }, function(err, user) {
        if (err) {
          return res.status(404).render("error", {
            message: "Users not found.",
            titleMessage: "Database error"
          });
        }
        res.render("users", {
          users: user,
          admin: false,
          csrfToken: req.csrfToken()
        });
      });
    }
  } else {
    // Send error code.
    res.status(403);
    res.render("error", {
      message:
        "Unauthorized access! Please, register and login as registered user.",
      titleMessage: "Authorization error"
    });
  }
};

// Registers an user.
exports.register = function(req, res) {
  res.render("register", { csrfToken: req.csrfToken() });
};

// Login method. Validates the given username and password and logs in if they are valid.
exports.login = function(req, res) {
  // Check that email and password are supplied.
  if (req.body.email && req.body.password) {
    // Find user with the email.
    User.findOne(
      {
        email: req.body.email
      },
      function(err, user) {
        if (err) {
          res.status(404);
          return console.error(err);
        }
        // If user is not found, send error code.
        if (!user) {
          res.status(401);
          res.render("error", {
            message: "Error when authorizing.",
            titleMessage: "Authorization error"
          });
          return;
        }
        // If user was found, compare the passwords with the given.
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if (result) {
            req.session.user = user;
            res.render("main", {
              user: req.session.user,
              csrfToken: req.csrfToken()
            });
          } else {
            res.status(401);
            res.render("error", {
              message: "Error when authorizing.",
              titleMessage: "Authorization error"
            });
          }
        });
      }
    );
  } else {
    res.status(401);
    res.render("error", {
      message: "Error when authorizing.",
      titleMessage: "Authorization error"
    });
  }
};

exports.showLogin = function(req, res) {
  res.status(200);
  res.render("login", { csrfToken: req.csrfToken() });
};

exports.guestlogin = function(req, res) {
  res.render("main", { user: req.session.user, csrfToken: req.csrfToken() });
};

exports.logout = function(req, res) {
  req.session.user = null;
  res.render("login", { csrfToken: req.csrfToken() });
};

// Edits the selected user.
exports.editUser = [
  check("email")
    .isEmail()
    .withMessage("Email has to be in correct form!"),
  (req, res, next) => {
    // Hashing password.
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      if (err) {
        res.status(400);
        res.render("error", {
          message: "There was an error.",
          titleMessage: "Server error"
        });
      }
      // If the editor is admin, then take care of additional parameters as "paid" and "role" changes.
      var user = { email: req.body.email };
      if (req.body.password !== null && req.body.password !== "") {
        user.password = hash;
      }
      if (req.session.user.role) {
        user.role = req.body.role;
        user.paid = req.body.paid;
      }
      // Updating user information and setting the just created modified user into the update info.
      User.findOneAndUpdate(
        { _id: req.body.id },
        { $set: user },
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
          res.status(200);
          res.render("main", {
            message: "User data updated successfully!",
            user: req.session.user,
            csrfToken: req.csrfToken()
          });
        }
      );
    });
  }
];

// Shows the current user.
exports.showUser = function(req, res) {
  // Check in case there is a session
  if (req.session.user != null) {
    // Find the requested user
    User.findOne({ _id: req.body.id }, function(err, user) {
      if (err) {
        res.status(404).render("error", {
          message: "Error when looking for user.",
          titleMessage: "Database error"
        });
      } else {
        res.status(200);
        res.render("edit_view", {
          user: user,
          admin: req.session.user.role,
          csrfToken: req.csrfToken()
        });
      }
    });
  } else {
    res.status(401);
    res.render("error", {
      message: "Authorization failed",
      titleMessage: "Authorization error"
    });
  }
};
exports.events = function(req, res) {
  res.status(200);
  if (req.session.user != null) {
    res.render("events", { registered: true });
  } else {
    res.render("events", { registered: false });
  }
};

// Adds an user to the database.
exports.addUser = [
  check("email").isEmail(),
  check("password").isLength({ min: 5 }),
  check("role")
    .isIn([0, 1])
    .withMessage("Role has to be 0 (user) or 1 (admin)"),
  (req, res, next) => {
    var pass = req.body.password;
    // Validating the errors.
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      // Check to see if the email is already in use.
      User.find({ email: req.body.email }, function(err, result) {
        if (err) {
          res.status(400);
          res.render("error", { message: err, titleMessage: "Database error" });
        } else {
          if (typeof result !== "undefined" && result.length > 0) {
            res.status(400);
            res.render("error", {
              message:
                "Email is already in use. Please, select a different one.",
              titleMessage: "Validation error"
            });
          } else {
            // Default user id is 1.
            var userId = 1;
            // Find the highest user id from all users.
            User.find({})
              .sort({ userId: -1 })
              .limit(1)
              .exec()
              .then(result => {
                // If array is not undefined or empty, go on.
                if (typeof result !== "undefined" && result.length > 0) {
                  // Add one to the result user id and save it to a variable.
                  userId = result[0].userId + 1;
                }

                // Create a new user.
                var user = new User();

                // Hashing password.
                bcrypt.hash(pass, saltRounds, function(err, hash) {
                  // Setting the user data.
                  (user.email = req.body.email),
                    (user.password = hash),
                    (user.role = req.body.role),
                    (user.paid = false);
                  user.userId = userId;
                  user.save(function(err) {
                    if (err) return next(err);
                    res.status(200);
                    res.render("login", {
                      csrfToken: req.csrfToken(),
                      message: "Account created!"
                    });
                  });
                });
              });
          }
        }
      });
    } else {
      // Rendering an error view if there are validating errors.
      res.status(400);
      res.render("error", {
        message: "Check given information.",
        titleMessage: "Validation errors"
      });
    }
  }
];

// Deletes the selected user.
exports.deleteUser = function(req, res) {
  // Finds the user by its id and deletes it.
  User.findByIdAndDelete(req.body.id, function(err, result) {
    if (err) {
      res.status(400);
      // Check if the user deleted someone else or themselves.
    } else if (req.session.user._id != req.body.id) {
      res.status(200);
      res.redirect("/users");
    } else {
      // Redirect to login if they deleted themselves.
      req.session = null;
      res.status(200).render("login", {
        message: "Your account has been successfully deleted.",
        csrfToken: req.csrfToken()
      });
    }
  });
};
