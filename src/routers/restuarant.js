const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const Role = require("../helper/role");

//add branch
router.post("/branch", auth(Role.Admin), async (req, res) => {
  const branch = new db.Branch(req.body);
  try {
    await branch.save();
    res.send({ branch });
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete branch
router.delete("/branch", auth(Role.Admin), async (req, res) => {
  const _id = req.body.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const branch = await db.Branch.findById(_id);
  if (!branch) {
    return res.status(404).send({ error: "branch doesn't exist" });
  }

  try {
    await branch.remove();
    res.send({ success: "branch has been deleted successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

//update branch
router.patch("/branch/:id", auth(Role.Admin), async (req, res) => {
  const _id = req.params.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "phone_number", "coodiantes"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  const branch = await db.Branch.findById(_id);
  if (!branch) {
    return res.status(404).send({ error: "branch doesn't exist" });
  }

  try {
    updates.forEach((update) => (branch[update] = req.body[update]));
    await branch.save();
    res.send(branch);
  } catch (e) {
    res.status(400).send(e);
  }
});

//lsit all branches
router.get("/branch", auth(Role.Admin), async (req, res) => {
  try {
    const branches = await db.Branch.find();
    res.send(branches);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
