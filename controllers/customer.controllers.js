import Customer from '../models/customer.model.js';
import User from '../models/user.model.js';

export const createCustomer = async (req, res) => {
	try {
		const { name, email, phone, address, salesChannel, socialUsername } =
			req.body;

		const userID = req.user._id;

		const user = await User.findById(userID);

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		const customer = new Customer({
			name,
			email,
			phone,
			address,
			salesChannel,
			socialUsername,
		});

		await customer.save();
		user.customers.push(customer._id);
		await user.save();

		res.status(201).json(customer);
	} catch (error) {
		console.error('Error in createCustomer controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};

export const viewUserCustomers = async (req, res) => {
	try {
		const userID = req.user._id;
		const user = await User.findById(userID).populate('customers');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.status(200).json(user.customers);
	} catch (error) {
		console.error('Error in viewUserCustomer controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};
export const deleteCustomer = async (req, res) => {
	try {
		const id = req.params.id;
		const userID = req.user._id;
		const user = await User.findById(userID);
		if (!user) {
			console.log('User not found');
			return res.status(404).json({ message: 'User not found' });
		}

		if (!user.customers.includes(id)) {
			console.log('Customer not found for the users');
			return res
				.status(404)
				.json({ message: 'Customer not found for the users' });
		}

		user.customers.pull(id);
		await Customer.findByIdAndDelete(id);
		await user.save();
		res.status(200).json({ message: 'Customer deleted successfully' });
	} catch (error) {
		console.error('Error in deleteCustomer controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};

export const updateCustomer = async (req, res) => {
	try {
		const { id } = req.params.id;
		const { name, email, phone, address, salesChannel, socialUsername } =
			req.body;
		const userID = req.user._id;
		const user = await User.findById(userID);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		if (!user.customers.includes(id)) {
			return res.status(404).json({ message: 'Customer not found' });
		}
		const updateCustomer = await Customer.findByIdAndUpdate(
			id,
			{
				name,
				email,
				phone,
				address,
				salesChannel,
				socialUsername,
			},
			{ new: true }
		);
		res.status(200).json(updateCustomer);
	} catch (error) {
		console.error('Error in updateCustomer controller', error.message);
		res
			.status(500)
			.json({ error: 'Internal Server Error', message: error.message });
	}
};
