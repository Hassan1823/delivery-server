import Customer from "../models/customer.model.js";
import User from "../models/user.model.js";

//* create new customers
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
    const customer = {
      name,
      email,
      phone,
      address,
      salesChannel,
      socialUsername,
    };

    const newCustomer = await Customer.create(customer);
    user.customers.push(newCustomer._id);
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

// * get all customers starts here
export const getAllCustomers = async (req, res) => {
  try {
    const allCustomers = await User.find().populate("customers");
    let customers = [];

    // Iterate over each user in allCustomers
    allCustomers.forEach((user) => {
      // Check if the user has any customers
      if (user.customers && user.customers.length > 0) {
        // Push each customer into the customers array
        user.customers.forEach((customer) => {
          customers.push(customer);
        });
      }
    });

    // Check if any customers were found
    if (customers.length === 0) {
      return res.status(201).json({
        success: false,
        message: "No customers found",
        data: customers,
      });
    }

    res.status(200).json({
      success: true,
      message: "Customers Found",
      data: customers,
    });
  } catch (error) {
    console.log("Error in getting all customers ::", error);
    res.status(500).json({
      success: false,
      message: "Error in getting all customers",
    });
  }
};

// * view user customers
export const viewUserCustomers = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("customers");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.customers || user.customers.length === 0) {
      return res.status(201).json({
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

// * delete customers
export const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const userID = req.params.userID;
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

// * admin delete customers
export const adminDeleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    // const userID = req.params.userID;
    const deleteCustomer = await Customer.findByIdAndDelete(id);

    if (!deleteCustomer) {
      res.status(404).json({ message: "Customer Not Found" });
    }
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCustomer controller", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

// * update customer
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params.id;
    const {
      name,
      email,
      phone,
      address,
      salesChannel,
      socialUsername,
      userID,
    } = req.body;

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

// * admin update customer
export const adminUpdateCustomer = async (req, res) => {
  try {
    const { id } = req.params.id;
    const { name, email, phone, address, salesChannel, socialUsername } =
      req.body;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer Not Found",
      });
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

// * search customers by name
export const searchCustomerByName = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name } = req.body;
    if (!name || name === "") {
      return res.status(400).json({
        success: false,
        message: "Please Enter Some Value",
      });
    }

    const user = await User.findById(userId).populate("customers");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please Login First",
      });
    }

    const customers = user.customers;
    if (!customers || customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No customers Available",
      });
    }

    const matchingCustomers = customers.filter((customer) =>
      customer.name.toLowerCase().includes(name.toLowerCase())
    );

    if (matchingCustomers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with the given name",
      });
    }

    return res.status(200).json({
      success: true,
      customers: matchingCustomers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
