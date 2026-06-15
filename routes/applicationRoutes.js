// routes/applicationRoutes.js
const express = require("express");
const router = express.Router();

const verifyFBToken = require("../middleware/verifyFBToken");
const {
  createApplication,
  getMyApplications,
  getClaimableApplications,
  submitClaim,
  getPaidApplications,
  assignAgent,
  rejectApplication,
  getAssignedApplications,
  updateAgentStatus,
  getAgentClaims,
  getApplicationById,
} = require("../controllers/applicationController");

// ========== CUSTOMER ROUTES ==========
// POST /policy-applications — submit new application
router.post("/policy-applications", verifyFBToken, createApplication);

// GET /my-applications?email=... — get my applications
router.get("/my-applications", verifyFBToken, getMyApplications);

// GET /claim-requests/claim?email=... — get claimable applications
router.get("/claim-requests/claim", verifyFBToken, getClaimableApplications);

// PATCH /claim-request/:applicationId — submit claim
router.patch("/claim-request/:applicationId", verifyFBToken, submitClaim);

// ========== ADMIN ROUTES ==========
// GET /applications/paid — get all paid applications
router.get("/applications/paid", verifyFBToken, getPaidApplications);

// PATCH /policy-applications/:id/assign-agent — assign agent & approve
router.patch(
  "/policy-applications/:id/assign-agent",
  verifyFBToken,
  assignAgent,
);

// PATCH /policy-applications/:id/reject — reject application
router.patch(
  "/policy-applications/:id/reject",
  verifyFBToken,
  rejectApplication,
);

// ========== AGENT ROUTES ==========
// GET /assigned-applications?email=... — get agent's assigned applications
router.get("/assigned-applications", verifyFBToken, getAssignedApplications);

// PATCH /assigned-applications/:id/update-status — approve/reject by agent
router.patch(
  "/assigned-applications/:id/update-status",
  verifyFBToken,
  updateAgentStatus,
);

// GET /claim-requests — get claimed applications for agent
router.get("/claim-requests", verifyFBToken, getAgentClaims);

// ========== SHARED ROUTES ==========
// GET /policy-applications/:applicationId — get single application
router.get(
  "/policy-applications/:applicationId",
  verifyFBToken,
  getApplicationById,
);

module.exports = router;
