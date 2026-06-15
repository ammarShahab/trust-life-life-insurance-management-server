// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const {
  createPaymentIntent,
  savePayment,
  getAllTransactions,
} = require("../controllers/paymentController");
const verifyFBToken = require("../middleware/verifyFBToken");

// ========== PUBLIC ROUTE ==========
// POST /create-payment-intent — create Stripe payment intent
router.post("/create-payment-intent", createPaymentIntent);

// ========== PROTECTED ROUTES ==========
// POST /payments — save payment after Stripe confirmation
router.post("/payments", verifyFBToken, savePayment);

// GET /transactions — get all payments (admin)
router.get("/transactions", verifyFBToken, getAllTransactions);

module.exports = router;
