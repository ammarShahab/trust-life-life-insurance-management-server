const Policy = require("../models/policy.js");

// @desc    Create a new policy
// @route   POST /policies
// @access  Admin only (protected by verifyFBToken)
const createPolicy = async (req, res) => {
  try {
    const newPolicy = new Policy(req.body);
    const savedPolicy = await newPolicy.save();
    res.status(201).json(savedPolicy);
  } catch (error) {
    console.error("Error creating policy:", error);

    // Mongoose validation error (e.g., invalid category, missing field)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    // Duplicate key error (if you add unique constraints later)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Duplicate field value entered" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all policies (admin route — protected)
// @route   GET /policies
// @access  Admin only
const getAllPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ createdAt: -1 });
    res.status(200).json(policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all policies with pagination, filtering, search (index-driven)
// @route   GET /all-policies
// @access  Public
const getAllPoliciesPublic = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const { category, search, sortBy, sortOrder } = req.query;

    const filter = {};

    if (category && category !== "all") {
      filter.category = category; // uses { category: 1 } index
    }

    if (search && search.trim() !== "") {
      // Use MongoDB full-text search — leverages { title: "text", description: "text" } index
      filter.$text = { $search: search.trim() };
    }

    // Server-side sorting — each field has a supporting index
    const validSortFields = {
      createdAt: "createdAt",     // auto-index from timestamps:true
      premium: "premiumNumeric",  // { premiumNumeric: 1 } index
      popular: "purchasedCount",  // { purchasedCount: -1 } index
    };

    const sortField = validSortFields[sortBy] || validSortFields.createdAt;
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortConfig = { [sortField]: sortDirection };

    const total = await Policy.countDocuments(filter);
    const policies = await Policy.find(filter)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    res.status(200).json({ policies, total });
  } catch (error) {
    console.error("Error fetching public policies:", error);
    res.status(500).json({ error: "Failed to fetch policies" });
  }
};

// @desc    Get popular policies (top purchased)
// @route   GET /popular-policies
// @access  Public
const getPopularPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ purchasedCount: -1 }).limit(8);
    res.status(200).json(policies);
  } catch (error) {
    console.error("Error fetching popular policies:", error);
    res.status(500).json({ error: "Failed to fetch popular policies" });
  }
};

// @desc    Get single policy by ID
// @route   GET /policies/:id
// @access  Public
const getPolicyById = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findById(id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy);
  } catch (error) {
    console.error("Error fetching policy by ID:", error);

    // Handle invalid ObjectId format (CastError)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid policy ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Update a policy
// @route   PATCH /policies/:id
// @access  Admin only
const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = { ...req.body };

    // Prevent MongoDB _id mutation error
    delete updatedData._id;

    const policy = await Policy.findByIdAndUpdate(id, updatedData, {
      new: true, // Return the updated document
      runValidators: true, // Run schema validators on update too
    });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy);
  } catch (error) {
    console.error("Error updating policy:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid policy ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Delete a policy
// @route   DELETE /policies/:id
// @access  Admin only
const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await Policy.findByIdAndDelete(id);

    if (!policy) {
      return res
        .status(404)
        .json({ message: "Policy not found or already deleted" });
    }

    res
      .status(200)
      .json({ message: "Policy deleted successfully", deletedPolicy: policy });
  } catch (error) {
    console.error("Error deleting policy:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid policy ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createPolicy,
  getAllPolicies,
  getAllPoliciesPublic,
  getPopularPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
