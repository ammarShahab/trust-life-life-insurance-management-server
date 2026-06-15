// controllers/applicationController.js
const Application = require("../models/application.js");
const Policy = require("../models/policy.js");

// @desc    Submit a new policy application
// @route   POST /policy-applications
// @access  Private (Firebase token required)
const createApplication = async (req, res) => {
  try {
    const applicationData = req.body;
    const { email, policyId } = applicationData;

    // Check for duplicate application
    const alreadyExists = await Application.findOne({ email, policyId });

    if (alreadyExists) {
      return res
        .status(409)
        .json({ message: "You already applied for this policy." });
    }

    const newApplication = new Application(applicationData);
    const savedApplication = await newApplication.save();

    res.status(201).json(savedApplication);
  } catch (error) {
    console.error("Error saving application:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get my applications (customer view)
// @route   GET /my-applications?email=...
// @access  Private
const getMyApplications = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email query is required" });
    }

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const applications = await Application.find({ email }).sort({
      appliedDate: -1,
    });
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get single application by ID
// @route   GET /policy-applications/:applicationId
// @access  Private
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID format" });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all PAID applications (for admin ManageApplications table)
// @route   GET /applications/paid
// @access  Private (admin only)
const getPaidApplications = async (req, res) => {
  try {
    const paidApplications = await Application.find({ status: "paid" }).sort({
      appliedDate: -1,
    });
    res.status(200).json(paidApplications);
  } catch (error) {
    console.error("Error fetching paid applications:", error);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// @desc    Assign agent to application & approve
// @route   PATCH /policy-applications/:id/assign-agent
// @access  Private (admin only)
const assignAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { agentName, agentEmail } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status: "approved",
        agentName,
        agentEmail,
        agent_status: "pending",
      },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Agent assigned successfully",
      application,
    });
  } catch (error) {
    console.error("Error assigning agent:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID format" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reject application
// @route   PATCH /policy-applications/:id/reject
// @access  Private (admin only)
const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({
      success: true,
      message: "Application rejected",
      application,
    });
  } catch (error) {
    console.error("Error rejecting application:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID format" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get applications assigned to an agent
// @route   GET /assigned-applications?email=...
// @access  Private (agent only)
const getAssignedApplications = async (req, res) => {
  try {
    const { email } = req.query;

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const assigned = await Application.find({ agentEmail: email }).sort({
      appliedDate: -1,
    });
    res.status(200).json(assigned);
  } catch (error) {
    console.error("Error fetching assigned applications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Update agent status & increment policy purchase count
// @route   PATCH /assigned-applications/:id/update-status
// @access  Private (agent only)
const updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_status, policyId } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      { agent_status },
      { new: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // If approved, increment purchasedCount in policies collection
    if (agent_status === "approved") {
      await Policy.findByIdAndUpdate(policyId, { $inc: { purchasedCount: 1 } });
    }

    res.status(200).json({
      success: true,
      updated: !!application,
      application,
    });
  } catch (error) {
    console.error("Error updating agent status:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};

// @desc    Get claimable applications (agent_status = approved)
// @route   GET /claim-requests/claim?email=...
// @access  Private (customer)
const getClaimableApplications = async (req, res) => {
  try {
    const { email } = req.query;

    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    const result = await Application.find({
      email,
      agent_status: "approved",
    }).sort({ appliedDate: -1 });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching claimable applications:", error);
    res.status(500).json({ error: "Failed to fetch claimable applications" });
  }
};

// @desc    Submit a claim
// @route   PATCH /claim-request/:applicationId
// @access  Private (customer)
const submitClaim = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { claim_reason, claim_document, claim_status } = req.body;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { claim_reason, claim_document, claim_status },
      { new: true, runValidators: true },
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error submitting claim:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid application ID format" });
    }

    res.status(500).json({ error: "Failed to submit claim" });
  }
};

// @desc    Get claimed applications for agent (with payment & policy info)
// @route   GET /claim-requests
// @access  Private (agent)
const getAgentClaims = async (req, res) => {
  try {
    const agentEmail = req.decoded.email;

    // Use aggregation to join with payments and policies
    const result = await Application.aggregate([
      {
        $match: {
          agentEmail,
          claim_status: "claimed",
        },
      },
      // Convert string policyId to ObjectId for joining with Policy collection
      {
        $addFields: {
          policyIdObj: { $toObjectId: "$policyId" },
        },
      },
      // Lookup policy info
      {
        $lookup: {
          from: "policies",
          localField: "policyIdObj",
          foreignField: "_id",
          as: "policyInfo",
        },
      },
      {
        $unwind: {
          path: "$policyInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project final shape
      {
        $project: {
          name: 1,
          email: 1,
          policyTitle: 1,
          policyId: 1,
          claim_status: 1,
          claim_reason: 1,
          claim_document: 1,
          policyInfo: {
            title: "$policyInfo.title",
            description: "$policyInfo.description",
            coverage: "$policyInfo.coverage",
            duration: "$policyInfo.duration",
          },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching agent claims:", error);
    res.status(500).json({ error: "Failed to fetch claim requests" });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  getPaidApplications,
  assignAgent,
  rejectApplication,
  getAssignedApplications,
  updateAgentStatus,
  getClaimableApplications,
  submitClaim,
  getAgentClaims,
};
