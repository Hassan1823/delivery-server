import express from "express";
import protectRoute from "../middleware/protectedRoute.js";
import upload from "../middleware/imageUpload.js";

import {
  createProduct,
  deleteProduct,
  viewUserProducts,
  updateProduct,
  getAllProducts,
} from "../controllers/product.controllers.js";

const router = express.Router();

router.get("/allProducts", getAllProducts);
// router.get("/getproducts", protectRoute, viewUserProducts);
router.get("/getproducts/:userId", viewUserProducts);
router.post("/createproduct", createProduct);
router.delete("/deleteproduct/:id/:userId", deleteProduct);
router.put("/updateproduct/:id", updateProduct);

export default router;
