const jwt = require("jsonwebtoken");
// Middleware to verify jwt tokens
exports.tokenAuth = (req, res, next) => {
  try {
    // Get the token from headers.
    const token = req.headers.authorization.split(" ")[1];
    // Verify the token
    const decoded = jwt.verify(token, "supermegasecret");
    // Add it to request
    req.data = decoded;
    next();
  } catch (err) {
    // Show error
    return res.status(401).json({
      message: "Authorization failed"
    });
  }
};

// Middleware to check that the user has logged in when accessing protected routes.
exports.checkLogin = (req, res, next) => {
    // Check that the user has logged in.
  if (typeof req.session.user !== "undefined" || req.session.user !== undefined) {
      next();
  } else {
    res.status(401).json({ message: "Authorization failed" });
  }
};
