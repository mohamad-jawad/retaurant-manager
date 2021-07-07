require("dotenv").config();
const express = require("express");
const userRouter = require("./routers/user");
const categoryRouter = require("./routers/category");
const orderRouter = require("./routers/order");
const restaurantRouter = require("./routers/restuarant");
const addressRouter = require("./routers/address");

const app = express();

app.use(express.json());
app.use(userRouter);
app.use(categoryRouter);
app.use(orderRouter);
app.use(restaurantRouter);
app.use(addressRouter);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is up on port: ", port);
});
