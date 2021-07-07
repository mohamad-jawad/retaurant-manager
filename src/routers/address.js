const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const Role = require("../helper/role");

//add address
router.post("/address", auth([Role.User, Role.Admin]), async (req, res) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  const address = new db.Address(req.body);
  try {
    await address.save();
    res.send({ address });
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete address
router.delete("/address", auth([Role.User, Role.Admin]), async (req, res) => {
  const _id = req.body.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const address = await db.Address.findById(_id);
  if (!address) {
    return res.status(404).send({ error: "address doesn't exist" });
  }
  if (address.user != req.user.id && req.user.userRole !== Role.Admin) {
    return res.status(404).send({ error: "Only delete your own addresses" });
  }

  try {
    await address.remove();
    res.send({ success: "address has been deleted successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

//update address
router.patch(
  "/address/:id",
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    const _id = req.params.id;
    if (!db.isValidId(_id)) {
      return res.status(400).send({ error: "_id is not valid" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["label", "completeAddress", "coodiantes", "user"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    const address = await db.Address.findById(_id);
    if (!address) {
      return res.status(404).send({ error: "address doesn't exist" });
    }

    if (address.user != req.user.id && req.user.userRole !== Role.Admin) {
      return res.status(404).send({ error: "Only update your own addresses" });
    }

    try {
      updates.forEach((update) => (address[update] = req.body[update]));
      await address.save();
      res.send(address);
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

//list all addresses
router.get("/address", auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const address = await db.Address.find({ user: req.user.id });
    res.send(address);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
