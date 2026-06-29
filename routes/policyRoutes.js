const express = require("express");
const router = express.Router();
const {
  createPolicy,
  getAllPolicies,
  getAllPoliciesPublic,
  getPopularPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController.js");
const verifyFBToken = require("../middleware/verifyFBToken.js");

// ========== PUBLIC ROUTES (no auth needed) ==========

// GET /all-policies — paginated, filterable, searchable
router.get("/all-policies", getAllPoliciesPublic);

// GET /popular-policies — top 8 most purchased
router.get("/popular-policies", getPopularPolicies);

// GET /policies/:id — single policy details
router.get("/policies/:id", getPolicyById);

// ========== PROTECTED ROUTES (Firebase auth required) ==========

// POST /policies — create new policy
router.post("/policies", verifyFBToken, createPolicy);

// GET /policies — get all policies (admin view)
router.get("/policies", verifyFBToken, getAllPolicies);

// PATCH /policies/:id — update policy
router.patch("/policies/:id", verifyFBToken, updatePolicy);

// DELETE /policies/:id — delete policy
router.delete("/policies/:id", verifyFBToken, deletePolicy);

module.exports = router;
