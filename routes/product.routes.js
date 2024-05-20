import express from "express";
import protectRoute from "../middleware/protectedRoute.js";
import upload from "../middleware/imageUpload.js";

import {
  createProduct,
  deleteProduct,
  viewUserProducts,
  updateProduct,
} from "../controllers/product.controllers.js";

const router = express.Router();
// router.get("/getproducts", protectRoute, viewUserProducts);
router.get("/getproducts", viewUserProducts);
router.post("/createproduct", protectRoute, createProduct);
router.delete("/deleteproduct/:id", protectRoute, deleteProduct);
router.put("/updateproduct/:id", protectRoute, updateProduct);

export default router;
