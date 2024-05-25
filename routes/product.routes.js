import express from "express";
import protectRoute from "../middleware/protectedRoute.js";
// import upload from "../middleware/imageUpload.js";

import {
  createProduct,
  deleteProduct,
  viewUserProducts,
  updateProduct,
  getAllProducts,
  uploadCSVProducts,
  searchProductByName,
} from "../controllers/product.controllers.js";

const router = express.Router();

// * uploading CSV starts here
import bodyParser from "body-parser";
import multer from "multer";
import path from "path";
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(path.dirname(import.meta.url), "public")));

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
    // cb(null, path.join(path.dirname(import.meta.url), "public", "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

router.post("/uploadCSV/:userId", upload.single("file"), uploadCSVProducts);

router.get("/allProducts", getAllProducts);
// router.get("/getproducts", protectRoute, viewUserProducts);
router.get("/getproducts/:userId", viewUserProducts);
router.post("/createproduct", createProduct);
router.delete("/deleteproduct/:id/:userId", deleteProduct);
router.put("/updateproduct/:id", updateProduct);
router.post("/searchProducts/:userId", searchProductByName);

export default router;
