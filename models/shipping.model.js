import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema(
	{
		customer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Customer',
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Product',
			required: true,
		},
		totalPrice: {
			type: Number,
			required: true,
		},
		shippingCost: {
			type: Number,
			required: true,
		},
		totalWeight: {
			type: Number,
			required: true,
		},
		quantity: {
			type: Number,
			required: true,
		},
		brand: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Shipping = mongoose.model('Shipping', shippingSchema);

export default Shipping;
