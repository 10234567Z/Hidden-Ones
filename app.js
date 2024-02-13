const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
require('dotenv').config()

const mongoose = require("mongoose");

const indexRouter = require("./routes/index")

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));


const app = express();
app.set("views", path.join(__dirname , 'views'));
app.set("view engine", "pug");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);


app.listen(3000, () => console.log("app listening on port 3000!"));