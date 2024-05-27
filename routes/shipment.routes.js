import express from "express";
import protectRoute from "../middleware/protectedRoute.js";

const router = express.Router();
import {
  adminSearchShippingByName,
  adminViewUserShipping,
  cancelShipment,
  createShipping,
  searchShippingByName,
  shippingStatus,
  updateShippingStatus,
  viewUserShipping,
} from "../controllers/shipping.controllers.js";

router.post("/create-shippment", createShipping);
router.get("/view-shippings/:userId", viewUserShipping);
router.get("/view-adminShippings", adminViewUserShipping);
router.post("/updateStatus/:id/:status", updateShippingStatus);
router.get("/shippingStatus/:id", shippingStatus);
router.post("/searchShippings/:userId", searchShippingByName);
router.post("/adminSearchShippings", adminSearchShippingByName);
router.delete("/cancelShipment/:shippingId", cancelShipment);

export default router;
