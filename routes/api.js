var express = require("express");
var api = express.Router();
const controller = require("../controller/apicontroller");
const Auth = require("../methods/auth");

// Route for getting all users.
api.get("/user", Auth.tokenAuth, Auth.checkLogin, controller.getUsers);
// Route for getting specific user
api.get("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.getUser);
// Route for updating existing user
api.patch("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.updateUser);
// Route for adding user
api.post("/user", controller.addUser);
// Route for deleting an user
api.delete("/user/:id", Auth.tokenAuth, Auth.checkLogin, controller.deleteUser);
// Route for logging in
api.post("/login", controller.login);
// Route to get events
api.get("/events", controller.getEvents);
// Route to create an event
api.post("/events",Auth.tokenAuth, Auth.checkLogin ,controller.addEvent);
// Route to delete an event.
api.delete("/events/:id",Auth.tokenAuth,Auth.checkLogin, controller.deleteEvent);
// Route to log out.
api.get("/logout", Auth.tokenAuth, Auth.checkLogin, controller.logout);

module.exports = api;
