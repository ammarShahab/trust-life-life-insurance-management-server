// controllers/paymentController.js
const Payment = require("../models/payment.js");
const Application = require("../models/application.js");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe Payment Intent (before confirming payment)
// @route   POST /create-payment-intent
// @access  Public (called from frontend before payment)
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, paymentDuration } = req.body;
    console.log("Received body:", req.body);

    const paymentIntent = await req.app.locals.stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        paymentDuration: paymentDuration || "monthly",
      },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Save payment after successful Stripe confirmation
// @route   POST /payments
// @access  Private (Firebase token required)
const savePayment = async (req, res) => {
  try {
    const {
      policyTitle,
      policyId,
      applicationId,
      email,
      amount,
      transactionId,
      paymentMethod,
      paymentDuration,
      status,
    } = req.body;

    // Security check: ensure user can only save their own payment
    if (req.decoded.email !== email) {
      return res.status(403).json({ message: "Forbidden access" });
    }

    // Update application status to "paid" and save payment duration
    const applicationUpdate = await Application.findByIdAndUpdate(
      applicationId,
      { 
        status: "paid",
        paymentDuration: paymentDuration || "monthly"
      },
      { returnDocument: "after" },
    );

    if (!applicationUpdate) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Create payment record
    const paymentData = {
      policyTitle,
      policyId,
      applicationId,
      email,
      amount,
      paymentMethod: paymentMethod || ["card"],
      status: applicationUpdate?.status || "paid",
      transactionId,
      paymentDuration: paymentDuration || "monthly",
    };

    const newPayment = new Payment(paymentData);
    const savedPayment = await newPayment.save();

    // Return insertedId to match frontend expectation
    res.status(201).json({
      insertedId: savedPayment._id,
      ...savedPayment.toObject(), // Spread all other fields too
    });
  } catch (error) {
    console.error("Payment processing error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ error: "Payment failed" });
  }
};

// @desc    Get all transactions (admin view)
// @route   GET /transactions
// @access  Private (admin only)
const getAllTransactions = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentTime: -1 });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

module.exports = {
  createPaymentIntent,
  savePayment,
  getAllTransactions,
};
