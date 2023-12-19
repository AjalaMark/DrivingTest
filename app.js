import express from "express";
import bodyParser from "body-parser";
import router from "./routes/routes.js";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.URI;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

const sessionStore = new MongoStore({
  mongoUrl: uri,
  dbName: "userCollection",
  collectionName: "userSessions",
  client: mongoose.connection.getClient(),
});

app.use(
  session({
    secret: "A secret key to sign the cookies",
    resave: false,
    saveUninitialized: false,
    sessionStore,
    cookie: { secure: false },
    user_UserType: null,
  })
);

app.use("/", router);
