const express = require("express");
const http = require("http");
const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongodb-session")(session);
const { v4: uuidv4 } = require("uuid");
const config = require('./config/config')

const { Server } = require("socket.io");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

const Menu = require("./models/menu.model");
const Chat = require("./models/chat.model");
const User = require("./models/user.model");
const Order = require("./models/order.model");


//mongoose connection
mongoose
  .connect(config.mongoUrl)
  .then(() => {
    console.log("Connection to MongoDB Successfully!");
    httpServer.listen(config.port, () => {
      console.log("Server running on port", config.port);
    });
  })
  .catch((error) => {
    console.log(error, "Connection to MongoDB failed!");
  });

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

const store = new MongoStore({
  uri: config.mongoUrl,
  collection: "sessions",
});

store.on("error", (error) => {
  console.log(error);
});

const sessionMW = session({
  secret: config.session_secret,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, maxAge: +config.session_expiration_time },
});

app.use(sessionMW);
app.use(cookieParser());

io.use((socket, next) => {
  sessionMW(socket.request, {}, next);
});

io.on("connection", async (socket) => {
  const menu = await Menu.find({}).sort({ mealNo: 1 });
  const option = await fs.readFile(
    path.join(__dirname, "public", "option.json")
  );
  const options = JSON.parse(option);
  const session = socket.request.session;
  let userID = session.userId;
  let user;
  if (!userID) {
    userID = uuidv4();
    session.userId = userID;
    session.save((err) => {
      if (err) {
        console.error("Error occured while saving session:", err);
      } else {
        console.log("Saved user ID to session:", userID);
      }
    });
    user = await User.create({ userId: userID });
  } else {
    user = await User.findOne({ userId: userID });
  }
  
  //   Initial Message
  socket.emit("botInitialMsg", Object.values(options[0]));

  // Save Chat
  socket.on("saveMsg", async (chat, isBotMsg) => {
   await Chat.create({
      userId: user._id,
      chatMsg: chat,
      isBotMsg,
    });
  });

  socket.on("msgInput", async (chatInput) => {
    const selectedItems = chatInput.split(",");
    let orders = menu.filter((item) => selectedItems.includes(item.dishNo));
    session.orders = orders;

    const selectionPattern = /^[3-9](,[3-9])*$/;
    switch (true) {
      case chatInput === "1":
        socket.emit("botMessage", { type: "menu", data: menu });
        break;
      case chatInput === "99":
        // Checkout  and save to database
        if (session.currentOrder) {
          const orders_Id = session.currentOrder.map((order) => order._id);
          await Order.create({ orders: orders_Id, userId: user._id });
          socket.emit("botMessage", {
            type: null,
            data: { message: Object.values(options[1]) },
          });
          session.currentOrder = undefined;
          session.save((err) => {
            if (err) {
              console.log(err);
            }
          });
        } else {
          socket.emit("botMessage", {
            type: "invalidInput",
            data: { message: "You didn't select any order." },
          });
        }

        break;
      case chatInput === "98":
        // orderhistory
        const orderHistory = await Order.find({ userId: user._id }).populate(
          "orders"
        );
        if (orderHistory.length) {
          socket.emit("botMessage", {
            type: "orderHistory",
            data: orderHistory,
          });
        } else {
          socket.emit("botMessage", {
            type: null,
            data: {
              message: "You don't have an order, Kindly place an order.",
            },
          });
        }

        break;
      case chatInput === "97":
        //current order

        if (session.currentOrder) {
          socket.emit("botMessage", {
            type: "currentOrder",
            data: session.currentOrder,
          });
        } else {
          socket.emit("botMessage", {
            type: null,
            data: { message: "You don't have a current order." },
          });
        }
        break;
      case chatInput === "0":
        // Checkout logic

        if (session.currentOrder) {
          socket.emit("botMessage", {
            type: null,
            data: { message: "Order cancelled" },
          });
          session.currentOrder = undefined;
          session.save((err) => {
            console.log(err);
          });
        } else {
          socket.emit("botMessage", {
            type: null,
            data: { message: "No order to cancel." },
          });
        }
        break;
      case selectionPattern.test(chatInput):
        const itemdSeleted = chatInput.split(",");
        let orders = menu.filter((item) =>
          itemdSeleted.includes(item.mealNo.toString())
        );
        if (orders.length) {
          socket.emit("botMessage", { type: "currentOrder", data: orders });
          session.currentOrder = orders;
          session.save((err) => {
            if (err) {
              console.log(err);
            }
          });
        }
        break;
      default:
        socket.emit("botMessage", {
          type: "invalidInput",
          data: { message: "This input is invalid. Try again" },
        });
        break;
    }
  });
});
