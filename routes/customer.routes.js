import express from 'express';
import protectRoute from '../middleware/protectedRoute.js';

import {
	createCustomer,
	viewUserCustomers,
	deleteCustomer,
	updateCustomer,
} from '../controllers/customer.controllers.js';

const router = express.Router();

router.get('/getcustomers', protectRoute, viewUserCustomers);
router.post('/createcustomer', protectRoute, createCustomer);
router.delete('/deletecustomer/:id', protectRoute, deleteCustomer);
router.put('/updatecustomer/:id', protectRoute, updateCustomer);

export default router;
