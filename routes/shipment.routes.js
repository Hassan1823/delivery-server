import express from 'express';
import protectRoute from '../middleware/protectedRoute.js';

const router = express.Router();
import {
	createShipping,
	viewUserShipping,
} from '../controllers/shipping.controllers.js';

router.post('/create-shippment', protectRoute, createShipping);
router.get('/view-shippings', protectRoute, viewUserShipping);

export default router;
