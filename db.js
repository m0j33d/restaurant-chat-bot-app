const mongoose = require('mongoose');
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);


const config = require("./config/config")


async function connectToDatabase() {
    mongoose.connect(config.mongoUrl)

    mongoose.connection.on("connected", () => {
        console.log("Connected to MongoDB Successfully");
    });

    mongoose.connection.on("error", (err) => {
        console.log("An error occurred while connecting to MongoDB");
        console.log(err);
    });
}

async function sessionMW(){
    const store = new MongoStore({
        uri: config.mongoUrl,
        collection: "sessions",
      });
      
    store.on("error", (error) => {
        console.log(error);
      });
      
    session({
        secret: config.session_secret,
        resave: true,
        saveUninitialized: true,
        store: store,
        cookie: { secure: false, maxAge: +config.session_expiration_time },
      });
}

module.exports = {
    connectToDatabase,
    sessionMW
}
