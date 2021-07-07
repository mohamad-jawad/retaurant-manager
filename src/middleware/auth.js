const jwt = require("jsonwebtoken");
const db = require("../db/db");

function auth(roles = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const token = req.header("Authorization").replace("Bearer ", "");
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.User.findOne({
        _id: decoded._id,
      });

      if (!user || (roles.length && !roles.includes(user.userRole))) {
        // user no longer exists or role not authorized
        return res.status(401).json({ message: "Unauthorized" });
      }
      if (user.blocked) {
        return res.status(401).json({ message: "You are blocked" });
      }
      req.token = token;
      req.user = user; // to save time not fetching the user again in the route handler
      next();
    } catch (e) {
      res.status(401).send({ error: "Please authenticate." });
    }
  };
}

module.exports = auth;
