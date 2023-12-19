import express from "express";
import Controller from "../controllers/controller.js";
import { setUserType } from "../middleware/Middleware.js";
const router = express.Router();

router
  .use(setUserType)
  .get("/login", Controller.get_login)
  .post("/login", Controller.post_login)
  .post("/signup", Controller.post_signup)
  .get("/dashboard", Controller.get_dashboard)
  .get("/g2page", Controller.get_g2page)
  .post("/g2page", Controller.post_g2page)
  .post("/g2page/book-appointment", Controller.post_bookAppointment)
  .get("/gpage", Controller.get_gpage)
  .post("/gpage", Controller.post_gpage)
  .post("/logout", Controller.logout_post)
  .get("/appointment", Controller.get_appointment)
  .post("/appointment", Controller.post_appointment)
  .get("/examiner", Controller.get_examiner)
  .post("/examiner/update-user/:userId", Controller.post_updateUser);
  
export default router;
