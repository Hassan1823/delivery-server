import express from "express";
import protectRoute from "../middleware/protectedRoute.js";

import {
  createCustomer,
  viewUserCustomers,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
} from "../controllers/customer.controllers.js";

const router = express.Router();

router.get("/allCustomers", getAllCustomers);
router.get("/getcustomers/:userId", viewUserCustomers);
router.post("/createcustomer", createCustomer);
router.delete("/deletecustomer/:id", protectRoute, deleteCustomer);
router.put("/updatecustomer/:id", protectRoute, updateCustomer);

export default router;
