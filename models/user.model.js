import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
      enum: ["male", "female"],
    },
    role: {
      type: String,
      required: false,
      default: "user",
      enum: ["user", "admin"],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    customers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],
    shippings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipping",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["verified", "unverified", "admin unverified"],
      default: "unverified",
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

// ! sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "30m",
  });
};

// ! sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

// ! compare password with the hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
