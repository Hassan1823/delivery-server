import express from "express";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();
import {
  createShipping,
  viewUserShipping,
} from "../controllers/shipping.controllers.js";

router.post("/create-shippment", createShipping);
router.get("/view-shippings/:userId", viewUserShipping);

export default router;
