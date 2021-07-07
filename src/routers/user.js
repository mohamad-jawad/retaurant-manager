const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const Role = require("../helper/role");

//create a new user
router.post("/users", async (req, res) => {
  const user = new db.User(req.body);
  try {
    await user.save();
    const authToken = user.generateAuthToken();
    const refreshToken = await db.RefreshToken.generateRefreshToken(
      user,
      req.ip
    );
    await refreshToken.save();
    res.send({ user, authToken, refreshToken });
  } catch (e) {
    console.log("error: " + e);
    res.status(400).send(e);
  }
});

//refresh auth token
router.post("/refresh-token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  try {
    const { user, authToken } = await db.RefreshToken.refreshToken(
      refreshToken
    );
    res.send({ user, authToken });
  } catch (e) {
    console.log("error: " + e);
    res.status(400).send(e);
  }
});

//revoke refresh token
router.post(
  "/revoke-token",
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
      return res.status(400).json({ message: "Token is required" });

    try {
      //get all refresh token of this user
      const refreshTokens = await db.RefreshToken.find({ user: req.user.id });
      //find if the provided token belong to user or not
      const tokenBelongToUser = !!refreshTokens.find(
        (x) => x.token === refreshToken
      );
      console.log("tokenBelongToUser: " + tokenBelongToUser);
      // users can revoke their own tokens and admins can revoke tokens of any user
      if (!tokenBelongToUser && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      //revoke token now
      const refreshTokenModel = await db.RefreshToken.findOne({
        token: refreshToken,
      });
      if (!refreshTokenModel || !refreshTokenModel.isActive)
        throw "Invalid token";
      refreshTokenModel.revoked = Date.now();
      refreshTokenModel.revokedByIp = req.ip;
      await refreshTokenModel.save();

      res.send({ message: "Token revoked" });
    } catch (e) {
      console.log("error: " + e);
      res.status(400).send(e);
    }
  }
);

router.post("/users/sign-in", async (req, res) => {
  try {
    const user = await db.User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const authToken = user.generateAuthToken();
    const refreshToken = await db.RefreshToken.generateRefreshToken(
      user,
      req.ip
    );
    await refreshToken.save();
    res.send({ user, authToken, refreshToken });
  } catch (e) {
    res.status(400).send(e);
  }
});

//view profile
router.get("/users/me", auth([Role.User, Role.Admin]), async (req, res) => {
  res.send(req.user);
});

//update profile
router.patch("/users/me", auth([Role.User, Role.Admin]), async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["fullName", "password"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await req.user.save(); //here the middleware will be executed

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Enable/Disable user
router.patch("/users/enable-disable", auth(Role.Admin), async (req, res) => {
  try {
    const user = await db.User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send("User doesn't exist");
    }
    user.blocked = req.body.blocked;
    await user.save();
    res.send(
      user.blocked ? "user blocked successfully" : "user unblocked successfully"
    );
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
