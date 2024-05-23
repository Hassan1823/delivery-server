import express from "express";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();
import {
  adminViewUserShipping,
  createShipping,
  shippingStatus,
  updateShippingStatus,
  viewUserShipping,
} from "../controllers/shipping.controllers.js";

router.post("/create-shippment", createShipping);
router.get("/view-shippings/:userId", viewUserShipping);
router.get("/view-adminShippings", adminViewUserShipping);
router.post("/updateStatus/:id", updateShippingStatus);
router.get("/shippingStatus/:id", shippingStatus);

export default router;
