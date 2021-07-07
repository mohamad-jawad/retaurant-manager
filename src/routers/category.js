const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const db = require("../db/db");
const Role = require("../helper/role");
var multer = require("multer");
const sharp = require("sharp");

//add category
router.post("/categories", auth(Role.Admin), async (req, res) => {
  const category = new db.Category(req.body);
  try {
    await category.save();
    res.send({ category });
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete category
router.delete("/categories", auth(Role.Admin), async (req, res) => {
  const _id = req.body.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const category = await db.Category.findById(_id);
  if (!category) {
    return res.status(404).send({ error: "category doesn't exist" });
  }

  try {
    await category.remove();
    res.send({ success: "category has been deleted successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

//update category
router.patch("/categories/:id", auth(Role.Admin), async (req, res) => {
  const _id = req.params.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["section"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  const category = await db.Category.findById(_id);
  if (!category) {
    return res.status(404).send({ error: "category doesn't exist" });
  }

  try {
    updates.forEach((update) => (category[update] = req.body[update]));
    await category.save();
    res.send(category);
  } catch (e) {
    res.status(400).send(e);
  }
});

//add item
router.post("/items", auth(Role.Admin), async (req, res) => {
  const item = new db.Item(req.body);
  try {
    await item.save();
    res.send({ item });
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete item
router.delete("/items", auth(Role.Admin), async (req, res) => {
  const _id = req.body.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const item = await db.Item.findById(_id);
  if (!item) {
    return res.status(404).send({ error: "item doesn't exist" });
  }

  try {
    await item.remove();
    res.send({ success: "item has been deleted successfully" });
  } catch (e) {
    res.status(500).send();
  }
});

//update item
router.patch("/items/:id", auth(Role.Admin), async (req, res) => {
  const _id = req.params.id;
  if (!db.isValidId(_id)) {
    return res.status(400).send({ error: "_id is not valid" });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ["price", "stock", "category"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  const item = await db.Item.findById(_id);
  if (!item) {
    return res.status(404).send({ error: "item doesn't exist" });
  }

  try {
    updates.forEach((update) => (item[update] = req.body[update]));
    await item.save();
    res.send(item);
  } catch (e) {
    res.status(400).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file || !file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      //regular expression
      return cb(new Error("please upload an Image"));
    }
    cb(undefined, true);
  },
});

//upload category image
router.patch(
  "/categories/image/:id",
  auth(Role.Admin),
  upload.single("image"),
  async (req, res) => {
    const _id = req.params.id;
    if (!db.isValidId(_id)) {
      return res.status(400).send({ error: "_id is not valid" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["image"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    const category = await db.Category.findById(_id);
    if (!category) {
      return res.status(404).send({ error: "category doesn't exist" });
    }

    try {
      if (req.file) {
        const minimizedBuffer = await sharp(req.file.buffer)
          .resize({ width: 250, height: 250 })
          .png()
          .toBuffer();
        category.image = minimizedBuffer;
      }

      await category.save();
      res.send(category);
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

//upload item image
router.patch(
  "/items/image/:id",
  auth(Role.Admin),
  upload.single("image"),
  async (req, res) => {
    const _id = req.params.id;
    if (!db.isValidId(_id)) {
      return res.status(400).send({ error: "_id is not valid" });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ["image"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Invalid updates!" });
    }

    const item = await db.Item.findById(_id);
    if (!item) {
      return res.status(404).send({ error: "item doesn't exist" });
    }

    try {
      if (req.file) {
        const minimizedBuffer = await sharp(req.file.buffer)
          .resize({ width: 250, height: 250 })
          .png()
          .toBuffer();
        item.image = minimizedBuffer;
      }

      await item.save();
      res.send(item);
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

//list categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.Category.find();
    categories.forEach((cat) => (cat.image = ""));
    res.send(categories);
  } catch (e) {
    res.status(500).send();
  }
});

//list of available menu items and categories
//Get /tasks?limit=10&skip=20        --> Pagination
router.get("/categories-menues", async (req, res) => {
  let result = {};
  let categories = req.body.categories;
  const searchString = req.body.searchString;
  try {
    if (!categories || categories.length === 0) {
      categories = await db.Category.find();
      categories = categories.map((categoryModel) => categoryModel.name);
    }
    for (const category of categories) {
      const categoryModel = await db.Category.findOne({ name: category });
      await categoryModel
        .populate({
          path: "items",
          match: { name: { $regex: searchString } },
          options: {
            //Paginationand sorting object
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
          },
        })
        .execPopulate();
      categoryModel.items.forEach((item) => (item.image = ""));
      result[category] = categoryModel.items;
    }

    res.send(result);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
