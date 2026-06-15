const express = require("express");
const router = express.Router();
const {
  createReview,
  getAllReviews,
} = require("../controllers/reviewController");
const verifyFBToken = require("../middleware/verifyFBToken");

// ========== PUBLIC ROUTE ==========
// GET /reviews — get all reviews
router.get("/reviews", getAllReviews);

// ========== PROTECTED ROUTE ==========
// POST /reviews — create review
router.post("/reviews", verifyFBToken, createReview);

module.exports = router;
