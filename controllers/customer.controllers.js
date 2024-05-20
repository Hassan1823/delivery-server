import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";

export const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      salesChannel,
      socialUsername,
      userID,
    } = req.body;

    //     const userID = req.user._id;

    //     console.log("user ID ::", userID ? userID : "no userID");

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const customer = new Customer({
      name,
      email,
      phone,
      address,
      salesChannel,
      socialUsername,
    });

    const newCustomer = await customer.save();
    user.customers.push(customer._id);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Customer Created Successfully",
      data: newCustomer,
    });
  } catch (error) {
    console.error("Error in createCustomer controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * get all customers starts here JWT_SECRET
export const getAllCustomers = async (req, res) => {
  try {
    const allCustomers = await User.find();
    if (!allCustomers || allCustomers.length === 0) {
      return res.status(201).json({
        success: false,
        message: "No customers found",
        data: allCustomers,
      });
    }

    res.status(200).json({
      success: true,
      message: "Customers Found",
      data: allCustomers,
    });
  } catch (error) {
    console.log("Error in getting all customers ::", error);
    res.status(500).json({
      success: false,
      message: "Error in getting all customers",
    });
  }
};

export const viewUserCustomers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("customers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.customers || user.customers.length === 0) {
      res.status(201).json({
        success: false,
        message: "No Customers Found",
        data: user.customers,
      });
    }
    res.status(200).json({
      success: true,
      message: "Customer Found",
      data: user.customers,
    });
  } catch (error) {
    console.error("Error in viewUserCustomer controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
export const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const userID = req.user._id;
    const user = await User.findById(userID);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.customers.includes(id)) {
      console.log("Customer not found for the users");
      return res
        .status(404)
        .json({ message: "Customer not found for the users" });
    }

    user.customers.pull(id);
    await Customer.findByIdAndDelete(id);
    await user.save();
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCustomer controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
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
      return res.status(404).json({ message: "User not found" });
    }
    if (!user.customers.includes(id)) {
      return res.status(404).json({ message: "Customer not found" });
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
    console.error("Error in updateCustomer controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};
