const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const Role = require("../helper/role");

//add order
router.post("/order", auth([Role.User, Role.Admin]), async (req, res) => {
  const order = new db.Order({
    ...req.body,
    user: req.user.id,
    order_date: new Date(),
  });
  try {
    const address = await db.Address.findById(req.body.address);
    if (!address) {
      return res.status(404).send({ error: "address doesn't exist" });
    }

    const nearestBranch = await db.Branch.findNearestBranch(
      address.coodiantes.latitude,
      address.coodiantes.longitude
    );
    const distance = nearestBranch.distance;
    if (distance > 5) {
      return res.status(404).send({
        error: "you should be within 5KM radius from our closest branch.",
      });
    }
    order.branch = nearestBranch.branch.id;
    await order.save();
    res.send({ order, distance });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//cancel order
router.patch(
  "/order/cancel",
  auth([Role.User, Role.Admin]),
  async (req, res) => {
    const _id = req.body.id;
    if (!db.isValidId(_id)) {
      return res.status(400).send({ error: "_id is not valid" });
    }

    const order = await db.Order.findById(_id);
    if (!order) {
      return res.status(404).send({ error: "order doesn't exist" });
    }
    if (order.user != req.user.id) {
      return res
        .status(404)
        .send({ error: "Only allowed to cancel your orders" });
    }

    if (order.status !== "pending") {
      return res
        .status(404)
        .send({ error: "Only allowed to cancel Pending orders" });
    }
    try {
      order.status = "canceled";
      await order.save();
      res.send({ success: "your order has been cancelled" });
    } catch (e) {
      res.status(500).send();
    }
  }
);

//accept or reject order : admin only
router.patch("/order/accept-reject", auth([Role.Admin]), async (req, res) => {
  const _id = req.body.id;
  const isAccept = req.body.isAccept;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const order = await db.Order.findById(_id);
  if (!order) {
    return res.status(404).send({ error: "order doesn't exist" });
  }

  if (order.status === "canceled") {
    return res.status(404).send({ error: "order already cancelled" });
  }
  try {
    if (isAccept) {
      order.status = "accepted";
    } else {
      order.status = "rejected";
    }

    await order.save();
    res.send({ order });
  } catch (e) {
    res.status(500).send();
  }
});

//list all orders
router.get("/order", auth([Role.User, Role.Admin]), async (req, res) => {
  try {
    const orders = await db.Order.find({ user: req.user.id });
    res.send(orders);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
