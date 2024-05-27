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
  searchCustomerByName,
  searchAllCustomerByName,
} from "../controllers/customer.controllers.js";

const router = express.Router();

router.get("/allCustomers", getAllCustomers);
router.get("/getcustomers/:userId", viewUserCustomers);
router.post("/createcustomer", createCustomer);
router.delete("/deletecustomer/:id/:userID", deleteCustomer);
router.delete("/adminDeletecustomer/:id", adminDeleteCustomer);
router.put("/updatecustomer/:id", updateCustomer);
router.put("/adminUpdateCustomer/:id", adminUpdateCustomer);
router.post("/searchCustomers/:userId", searchCustomerByName);
router.post("/searchAllCustomers", searchAllCustomerByName);

export default router;
