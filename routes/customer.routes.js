import express from "express";
import protectRoute from "../middleware/protectedRoute.js";

import {
  createCustomer,
  viewUserCustomers,
  deleteCustomer,
  updateCustomer,
  getAllCustomers,
  adminDeleteCustomer,
  adminUpdateCustomer,
} from "../controllers/customer.controllers.js";

const router = express.Router();

router.get("/allCustomers", getAllCustomers);
router.get("/getcustomers/:userId", viewUserCustomers);
router.post("/createcustomer", createCustomer);
router.delete("/deletecustomer/:id/:userID", deleteCustomer);
router.delete("/adminDeletecustomer/:id", adminDeleteCustomer);
router.put("/updatecustomer/:id", updateCustomer);
router.put("/adminUpdateCustomer/:id", adminUpdateCustomer);

export default router;
