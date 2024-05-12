import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		gender: {
			type: String,
			required: true,
			enum: ['male', 'female'],
		},
		products: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Product',
			},
		],
		customers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Customer',
			},
		],
		shippings: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Shipping',
			},
		],
		isVerified: {
			type: Boolean,
			default: false,
		},
		status:{
			type: String,
			enum: ['verified', 'unverified'],
			default: 'unverified',
			required: true,
		},
	},
	{ timestamps: true }
);
userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
	  return next;
	}
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(this.password, salt);
	this.password = hashedPassword;
	next();
  });
const User = mongoose.model('User', userSchema);

export default User;
