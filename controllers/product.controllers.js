import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import XLSX from "xlsx";
import csv from "csvtojson";

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

// export const viewUserProducts = async (req, res) => {
//   try {
//     let userId = req.params.userId;

//     // console.log(userId ? userId : "no user id ");

//     if (!userId) {
//       res.status(400).json({
//         success: false,
//         message: "Please Provide the User ID",
//       });
//     }

//     const user = await User.findById(userId).populate("products");

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No user not found",
//       });
//     }

//     if (!user?.products || user?.products.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "No Products not found",
//         data: user?.products,
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user?.products,
//     });
//   } catch (error) {
//     console.error("Error in viewUserProducts controller", error.message);
//     res
//       .status(500)
//       .json({ error: "Internal Server Error", message: error.message });
//   }
// };

export const viewUserProducts = async (req, res) => {
  try {
    let userId = req.params.userId;

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
        message: "No user found",
      });
    }

    // Create a Set to store unique product names
    const uniqueProductNames = new Set();

    // Filter out duplicate products based on their names
    const uniqueProducts = user.products.filter((product) => {
      if (uniqueProductNames.has(product.name)) {
        // Delete the duplicate product from the database
        Product.findByIdAndDelete(product._id);
        return false;
      } else {
        uniqueProductNames.add(product.name);
        return true;
      }
    });

    if (uniqueProducts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Products found",
      data: uniqueProducts,
    });
  } catch (error) {
    console.error("Error in viewUserProducts controller", error.message);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
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

// * uploading products to the database

export const uploadCSVProducts = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("products");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No User Found",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let parsedCsvData;

    if (
      file.mimetype.startsWith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ) {
      const workbook = XLSX.readFile(file.path);
      const sheet_name_list = workbook.SheetNames;
      const worksheet = workbook.Sheets[sheet_name_list[0]];
      const csvData = XLSX.utils.sheet_to_csv(worksheet);
      parsedCsvData = await csv({ noheader: false }).fromString(csvData);
    } else if (file.mimetype.startsWith("text/csv")) {
      parsedCsvData = await csv({ noheader: false }).fromFile(file.path);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    let insertedProducts = [];
    for (var x = 0; x < parsedCsvData.length; x++) {
      try {
        const product = new Product({
          name: parsedCsvData[x].Name,
          price: parsedCsvData[x]["Selling Price (PKR)"]
            ? parseFloat(parsedCsvData[x]["Selling Price (PKR)"])
            : 0,
          category: parsedCsvData[x].Category ? parsedCsvData[x].Category : "",
          quantity: parsedCsvData[x].Quantity
            ? parseInt(parsedCsvData[x].Quantity)
            : 0,
          weight: parsedCsvData[x]["Weight (kg)"]
            ? parseFloat(parsedCsvData[x]["Weight (kg)"])
            : 0,
          userId: userId,
        });
        await product.save();
        insertedProducts.push(product);
      } catch (error) {
        if (error.code !== 11000) {
          console.error("Error inserting product:", error);
        }
      }
    }

    if (insertedProducts.length > 0) {
      user.products.push(...insertedProducts.map((product) => product._id));
      await user.save();

      return res.status(200).json({
        success: true,
        message: "New Products Uploaded Successfully",
        data: insertedProducts,
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "No new products uploaded",
      });
    }
  } catch (error) {
    console.error("Error in uploadCSVProducts:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

//* search products by name
export const searchProductByName = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name } = req.body;

    if (!name || name === "") {
      return res.status(400).json({
        success: false,
        message: "Please Enter Some Value",
      });
    }

    const user = await User.findById(userId).populate("products");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please Login First",
      });
    }

    const products = user.products;
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products Available",
      });
    }

    const matchingProducts = products.filter((product) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );

    if (matchingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with the given name",
      });
    }

    return res.status(200).json({
      success: true,
      products: matchingProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//* search products by name
export const searchAllProductByName = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name === "") {
      return res.status(400).json({
        success: false,
        message: "Please Enter Some Value",
      });
    }

    const products = await Product.find();
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products Available",
      });
    }

    const matchingProducts = products.filter((product) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );

    if (matchingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with the given name",
      });
    }

    return res.status(200).json({
      success: true,
      products: matchingProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
