const Customer = require("../models/customer.js");

// @desc    Register or find a customer (called after Firebase auth)
// @route   POST /customers
// @access  Public
const saveCustomer = async (req, res) => {
  try {
    const {
      email,
      customerName,
      photoURL,
      role,
      firebaseUid,
      lastSignInTime,
      registrationDate,
    } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(200).json({
        message: "Customer already exists",
        inserted: false,
        existingCustomer,
      });
    }

    // Create new customer with all provided fields
    const newCustomer = new Customer({
      email,
      customerName: customerName || "",
      photoURL: photoURL || "",
      role: "customer",
      lastSignInTime: lastSignInTime || "",
      registrationDate: registrationDate || "",
      firebaseUid: firebaseUid || undefined,
    });

    const savedCustomer = await newCustomer.save();

    res.status(201).json({
      message: "Customer created successfully",
      inserted: true,
      customer: savedCustomer,
    });
  } catch (error) {
    console.error("Error saving customer:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update last sign-in time
// @route   PUT /customers/update-last-login
// @access  Private (Firebase token required)
const updateLastLogin = async (req, res) => {
  try {
    const { email, lastSignInTime } = req.body;

    if (!email || !lastSignInTime) {
      return res
        .status(400)
        .json({ message: "Email and lastSignInTime are required" });
    }

    // Security check: user can only update their own last login
    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const customer = await Customer.findOneAndUpdate(
      { email },
      { lastSignInTime },
      { returnDocument: "after", runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      success: true,
      message: "Last login updated",
      customer,
    });
  } catch (error) {
    console.error("Error updating last login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get customer by email
// @route   GET /customers/:email
// @access  Private
const getCustomerByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update customer profile
// @route   PUT /customers/:email
// @access  Private
const updateCustomer = async (req, res) => {
  try {
    const { email } = req.params;
    const { customerName, photoURL } = req.body;

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const customer = await Customer.findOneAndUpdate(
      { email },
      { customerName, photoURL },
      { returnDocument: "after", runValidators: true },
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get customer role
// @route   GET /customers/role/:email
// @access  Private
const getCustomerRole = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const customer = await Customer.findOne({ email }).select("role");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ role: customer.role });
  } catch (error) {
    console.error("Error fetching customer role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all customers (admin only)
// @route   GET /customers
// @access  Private (admin only)
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get limited agents (public — for homepage/agent section)
// @route   GET /limited-agents
// @access  Public
const getLimitedAgents = async (req, res) => {
  try {
    const agents = await Customer.find({ role: "agent" })
      .select("customerName email photoURL")
      .limit(3);

    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching limited agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get all agents (for admin/agent assignment)
// @route   GET /agents
// @access  Private
const getAgents = async (req, res) => {
  try {
    const agents = await Customer.find({ role: "agent" }).select(
      "customerName email -_id",
    );

    res.status(200).json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Promote customer to agent
// @route   PATCH /customers/:id/promote
// @access  Private (admin only)
const promoteToAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { role: "agent" },
      { returnDocument: "after" },
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer promoted to agent",
      customer,
    });
  } catch (error) {
    console.error("Error promoting customer:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Demote agent to customer
// @route   PATCH /customers/:id/demote
// @access  Private (admin only)
const demoteToCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { role: "customer" },
      { returnDocument: "after" },
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Agent demoted to customer",
      customer,
    });
  } catch (error) {
    console.error("Error demoting customer:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Delete a customer
// @route   DELETE /customers/:id
// @access  Private (admin only)
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
      deletedCustomer: customer,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid customer ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  saveCustomer,
  updateLastLogin,
  getCustomerByEmail,
  updateCustomer,
  getCustomerRole,
  getAllCustomers,
  getLimitedAgents,
  getAgents,
  promoteToAgent,
  demoteToCustomer,
  deleteCustomer,
};
