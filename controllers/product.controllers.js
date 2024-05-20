import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// * create product
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, quantity, weight, userId } = req.body;
    // const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if a product with the same name already exists for the current user
    const existingProduct = await Product.findOne({ name, userId });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists ",
      });
    }
    const product = new Product({
      name,
      price,
      category,
      quantity,
      weight,
    });
    const newProduct = await product.save();
    user.products.push(product._id);
    await user.save();
    res.status(200).json({
      success: true,
      message: "Product Created Successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in createProduct controller", error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

// * get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0) {
      res.status(404).json({
        success: false,
        message: "No products found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Products Found",
      data: products,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error in getting products",
    });
  }
};

// * get user products

export const viewUserProducts = async (req, res) => {
  try {
    let userId = req.params.userId;

    // console.log(userId ? userId : "no user id ");

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "Please Provide the User ID",
      });
    }

    const user = await User.findById(userId).populate("products");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user not found",
      });
    }

    if (!user?.products || user?.products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Products not found",
        data: user?.products,
      });
    }

    res.status(200).json({
      success: true,
      data: user?.products,
    });
  } catch (error) {
    console.error("Error in viewUserProducts controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * delete product
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.products.includes(productId)) {
      return res.status(404).json({ error: "Product not found for this user" });
    }
    user.products.pull(productId);
    await Product.findByIdAndDelete(productId);
    await user.save();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * update product
export const updateProduct = async (req, res) => {
  try {
    const { name, price, category, quantity, weight, userId } = req.body;
    const productId = req.params.id;
    // const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.products.includes(productId)) {
      return res.status(404).json({ error: "Product not found for this user" });
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
    console.error("Error in updateProduct controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
