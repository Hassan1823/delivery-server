import mongoose from 'mongoose';
import mailSender from '../utils/mailSender.js';
import User from './user.model.js';

const otpSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: User,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
	},
});

async function sendVerificationEmail(email, otp) {
	// try {
	// 	const mailResponse = await mailSender(
	// 		email,
	// 		'Verification Email',
	// 		`<h1>Please confirm your OTP</h1>
    //      <p>Here is your OTP code: ${otp}</p>`
	// 	);
	// 	console.log('Email sent successfully: ', mailResponse);
	// } catch (error) {
	// 	console.log('Error occurred while sending email: ', error);
	// 	throw error;
	// }
	const message = `<h2>Please confirm your OTP</h2>
	<p>Here is your OTP code: ${otp}</p>`
	const subject='OTP';
	const sentFrom=process.env.MAIL_USER;
	const sentTo= email;
	await mailSender(subject, message, sentTo, sentFrom);


}
otpSchema.pre('save', async function (next) {
	console.log('New document saved to the database');
	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});
const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
