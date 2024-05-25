import Shipping from "../models/shipping.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// * add shipping
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

    customer.delivery += 1;
    await customer.save();

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

// * update status
export const updateShippingStatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  try {
    const shipping = await Shipping.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!shipping) {
      return res.status(404).json({ error: "Shipping not found" });
    }

    res.status(200).json(shipping);
  } catch (error) {
    console.error("Error updating shipping status", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * view admin shipments
export const adminViewUserShipping = async (req, res) => {
  try {
    const user = await User.find().populate({
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

    // if (!user || user.length === 0) {
    let shippings = [];

    // Iterate over each user in allCustomers
    user.forEach((user) => {
      // Check if the user has any customers
      if (user.shippings && user.shippings.length > 0) {
        // Push each customer into the shippings array
        user.shippings.forEach(async (customer) => {
          shippings.push(customer);
        });
      }
    });

    if (shippings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Shipments not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Shipments Found",
      data: shippings,
    });
  } catch (error) {
    console.error("Error in viewUserProducts controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * view user shipments
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

// * shipping status
export const shippingStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const shipping = await Shipping.findById(id);
    if (!shipping) {
      return res.status(404).json({
        success: false,
        message: "Shipping not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Shipping Found",
      data: shipping,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error ",
    });
  }
};

// * search shippings by name
export const searchShippingByName = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name } = req.body;
    if (!name || name === "") {
      return res.status(400).json({
        success: false,
        message: "Please Enter Some Value",
      });
    }

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
      return res.status(404).json({
        success: false,
        message: "Please Login First",
      });
    }

    const shippings = user.shippings;

    // Filter shippings based on the name parameter
    const filteredShippings = shippings.filter((shipping) =>
      shipping.customer.name.toLowerCase().includes(name.toLowerCase())
    );

    if (filteredShippings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shipments found with the given name",
      });
    }

    return res.status(200).json({
      success: true,
      shippings: filteredShippings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
