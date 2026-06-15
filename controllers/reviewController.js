// controllers/reviewController.js
const Review = require("../models/review.js");

// @desc    Create a new review
// @route   POST /reviews
// @access  Private (Firebase token required)
const createReview = async (req, res) => {
  try {
    const reviewData = req.body;

    const newReview = new Review({
      ...reviewData,
      date: new Date(),
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error("Error creating review:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get all reviews
// @route   GET /reviews
// @access  Public
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createReview,
  getAllReviews,
};
