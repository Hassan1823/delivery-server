import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import OTP from "../models/otp.model.js";
import otpGenerator from "otp-generator";
import sendEmail from "../utils/mailSender.js";
import Token from "../models/token.model.js";
import crypto from "crypto";
import { Frontend_URL } from "../lib/data.js";
import { config } from "dotenv";

import jwt from "jsonwebtoken";

import nodemailer from "nodemailer";
import ErrorHandler from "../utils/ErrorHandler.js";

config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "hassan.zaib223@gmail.com",
    pass: "hrgh zvie esyv kuya",
  },
});

// const transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   auth: {
//     user: "samantha90@ethereal.email",
//     pass: "EhYgjc9PvkttMsvqvq",
//   },
// });

export const signup = async (req, res, next) => {
  try {
    const { fullName, username, email, password, confirmPassword, gender } =
      req.body;

    // ~ is email already exist
    const isEmailExist = await User.findOne({ email });

    if (isEmailExist) {
      return next(new ErrorHandler("Email Already Exist"));
    }

    const user = await User.create({
      fullName,
      username,
      email,
      password,
      gender,
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Error in Creating user",
      });
    }

    const activationToken = createActivationToken(user);
    const activationCode = activationToken.activationCode;

    const data = { user: { name: user.fullName }, activationCode };
    const otpPayload = { email, otp: activationCode, user: user._id };
    const otpBody = await OTP.create(otpPayload);

    // * sending otp to user email
    try {
      const mailOptions = {
        from: "deliveryhero@gmail.com",
        to: email,
        subject: "OPT Verification from Delivery Hero",
        html: ` <p>Hey ${username}!</p>
            <p>This is your 6-digit Otp code ${activationCode}
            `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: `OTP sent to ${email}`,
      });
    } catch (error) {
      console.log("Error In Sending Email");
      console.log(error);
      res.status(400).json({
        success: false,
        message: "Error In Sending Email",
        otp: activationCode,
      });
    }

    res.status(201).json({
      success: true,
      message: `Please check your ${user.email}`,
      activationToken: activationToken.token,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ~ create activation token
export const createActivationToken = (user) => {
  const activationCode = Math.floor(100000 + Math.random() * 9000).toString();

  console.log("Activation Code :", activationCode);

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: "30m",
    }
  );

  return { token, activationCode };
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { activation_code } = req.body;

    // console.log(activation_token ? activation_token : "no activation_token");
    console.log(activation_code ? activation_code : "no activation_code");

    if (activation_code) {
      const otp = await OTP.findOne({ otp: activation_code });
      console.log(otp);

      if (otp || otp !== "" || otp !== null) {
        const user = await User.findById(otp.user);
        if (user) {
          user.status = "verified";
          await user.save();
          await OTP.deleteMany({ user: user._id });
          return res
            .status(200)
            .json({ message: "User verified successfully" });
        } else {
          return res.status(404).json({ error: "User not found" });
        }
      }
    }
  } catch (error) {
    console.log("Failed To verify OTP", error);
    res.status(400).json({
      success: false,
      message: "Failed To verify OTP",
    });
  }
  // const uOTP = req.body.otp;
  // console.log(uOTP);

  // if (uOTP) {
  //   const otp = await OTP.findOne({ otp: uOTP });
  //   console.log(otp);
  //   if (otp) {
  //     const user = await User.findById(otp.user);
  //     if (user) {
  //       user.status = "verified";
  //       await user.save();
  //       await OTP.deleteMany({ user: user._id });
  //       return res.status(200).json({ message: "User verified successfully" });
  //     } else {
  //       return res.status(404).json({ error: "User not found" });
  //     }
  //   } else {
  //     return res.status(400).json({ error: "Invalid OTP" });
  //   }
  // } else {
  //   return res.status(400).json({ error: "Invalid OTP" });
  // }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = generateTokenAndSetCookie(user._id, res);
    // console.log('token', token);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      status: user.status,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// * logout
export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//* change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, userID } = req.body;
    // const userID = req.user._id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid old password" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// * forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    //Delete token if it exists against that user id
    if (user) {
      let token = await Token.findOne({ userId: user._id });
      if (token) {
        await token.deleteOne();
      }
      const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
      console.log(resetToken);
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      await Token.create({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000), // 30 mins
      });
      const resetUrl = `${Frontend_URL}/resetPassword/${resetToken}`;
      const message = `
		<h2>Hello ${user.fullName}</h2>
		<p>You requested for a password reset</p>
		<p>Please use the url below to reset passsword</p>
		<p>This link is valid for only 30 minutes</p>
		<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		<p>Regards</p>
		<p>Pinvent team</p>`;
      const subject = "Password reset request";
      const sent_to = user.email;
      const sent_from = process.env.MAIL_USER;
      await sendEmail(subject, message, sent_to, sent_from);
      res.json({ success: true, message: "Reset Email sent" });
    } else {
      res.json("user not found");
    }
  } catch (error) {
    res.json({ err: error.message });
  }
};

// * reset password
export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  console.log(resetToken);
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });
  if (!userToken) {
    res.status(404).send("Invalid or expired token");
  }
  const user = await User.findOne({ _id: userToken.userId });
  if (user) {
    user.password = password;
    await user.save();
    res.status(200).json("Password reset successfully");
  }
};
