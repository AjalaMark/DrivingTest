import express from "express";
import bodyParser from "body-parser";
import router from "./routes/routes.js";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import { uri } from "./models/userModel.js";

const app = express();

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
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
