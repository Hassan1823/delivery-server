// import nodemailer from 'nodemailer';

// const mailSender = async (email, title, body) => {
// 	try {
// 		//to send email ->  firstly create a Transporter
// 		let transporter = nodemailer.createTransport({
// 			host: process.env.MAIL_HOST, //-> Host SMTP detail
// 			port: process.env.MAIL_PORT, //-> Port SMTP detail
// 			auth: {
// 				user: process.env.MAIL_USER, //-> User's mail for authentication
// 				pass: process.env.MAIL_PASS, //-> User's password for authentication
// 			},
// 		});

// 		//now Send e-mails to users
// 		let info = await transporter.sendMail({
// 			from: process.env.MAIL_USER,
// 			to: `${email}`,
// 			subject: `${title}`,
// 			html: `${body}`,
// 		});

// 		console.log('Info is here: ', info);
// 		return info;
// 	} catch (error) {
// 		console.log(error.message);
// 	}
// };

// export default mailSender;
import nodemailer from 'nodemailer';
const mailSender = async (subject, message, send_to, sent_from, reply_to) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const options = {
    from: sent_from,
    reply: reply_to,
    to: send_to,
    subject: subject,
    html: message,
  };
  transporter.sendMail(options, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
 export default mailSender;
