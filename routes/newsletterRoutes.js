// routes/newsletterRoutes.js
const express = require("express");
const router = express.Router();
const {
  subscribeNewsletter,
  getAllSubscribers,
} = require("../controllers/newsletterController");
const verifyFBToken = require("../middleware/verifyFBToken");

// ========== PUBLIC ROUTE ==========
// POST /newsletter-subscription — subscribe to newsletter
router.post("/newsletter-subscription", subscribeNewsletter);

// ========== PROTECTED ROUTE ==========
// GET /newsletters — get all subscribers (admin)
router.get("/newsletters", verifyFBToken, getAllSubscribers);

module.exports = router;
