// controllers/newsletterController.js
const newsletter = require("../models/newsletter.js");

// @desc    Subscribe to newsletter
// @route   POST /newsletter-subscription
// @access  Public
const subscribeNewsletter = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    const newSubscription = new newsletter({
      name,
      email,
      subscribedAt: new Date(),
    });

    const savedSubscription = await newSubscription.save();

    res.status(201).json({
      success: true,
      insertedId: savedSubscription._id,
      subscription: savedSubscription,
    });
  } catch (error) {
    console.error("Newsletter subscription failed:", error);

    // Handle duplicate email (already subscribed)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to the newsletter.",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all newsletter subscribers (admin)
// @route   GET /newsletters
// @access  Private (admin only)
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await newsletter.find().sort({ subscribedAt: -1 });
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
};

module.exports = {
  subscribeNewsletter,
  getAllSubscribers,
};
