import Shipping from "../models/shipping.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createShipping = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, productId, quantity, shippingCost, brandName, userId } =
      req.body;
    // const userId = req.user._id;

    console.log("Logged in user id:", userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const product = await Product.findById(productId);
    if (!product || product.quantity < quantity) {
      return res.status(404).json({
        message: "Product not found or insufficient quantity",
        quantity: product.quantity,
      });
    }

    const totalPrice = quantity * product.price;

    const totalWeight = quantity * product.weight;

    const shipping = new Shipping({
      customer: customerId,
      product: productId,
      quantity,
      totalPrice,
      totalWeight,
      shippingCost,
      brand: brandName,
    });

    await shipping.save();

    user.shippings.push(shipping._id);
    await user.save();

    product.quantity -= quantity;
    if (product.quantity < 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }
    await product.save();

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(shipping);
  } catch (error) {
    console.error("Error in createShipping controller", error.message);
    await session.abortTransaction();
    session.endSession();
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

export const viewUserShipping = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate({
      path: "shippings",
      populate: [
        {
          path: "product",
          model: "Product",
        },
        {
          path: "customer",
          model: "Customer",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.shippings);
  } catch (error) {
    console.error("Error in viewUserProducts controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
