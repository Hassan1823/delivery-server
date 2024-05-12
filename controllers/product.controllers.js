import User from '../models/user.model.js';
import Product from '../models/product.model.js';

export const createProduct = async (req, res) => {
	try {
		const { name, price, category, quantity, weight } = req.body;
		const loggedinid = req.user._id;
		const user = await User.findById(loggedinid);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		const product = new Product({
			name,
			price,
			category,
			quantity,
			weight,
		});
		await product.save();
		user.products.push(product._id);
		await user.save();
		res.status(201).json(product);
	} catch (error) {
		console.error('Error in createProduct controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};

export const viewUserProducts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId).populate('products');

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		res.status(200).json(user.products);
	} catch (error) {
		console.error('Error in viewUserProducts controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const productId = req.params.id;
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (!user.products.includes(productId)) {
			return res.status(404).json({ error: 'Product not found for this user' });
		}
		user.products.pull(productId);
		await Product.findByIdAndDelete(productId);
		await user.save();

		res.status(200).json({ message: 'Product deleted successfully' });
	} catch (error) {
		console.error('Error in deleteProduct controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};
export const updateProduct = async (req, res) => {
	try {
		const { name, price, category, quantity, weight } = req.body;
		const productId = req.params.id;
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		if (!user.products.includes(productId)) {
			return res.status(404).json({ error: 'Product not found for this user' });
		}
		const updatedProduct = await Product.findByIdAndUpdate(
			productId,
			{
				name,
				price,
				category,
				quantity,
				weight,
			},
			{ new: true }
		);

		res.status(200).json(updatedProduct);
	} catch (error) {
		console.error('Error in updateProduct controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};
