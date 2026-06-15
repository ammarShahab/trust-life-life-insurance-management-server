const { default: mongoose } = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: String,
      required: [true, "Rating is required"],
      trim: true,
      enum: {
        values: ["1", "2", "3", "4", "5"],
        message: "Rating must be between 1 and 5",
      },
    },
    feedback: {
      type: String,
      required: [true, "Feedback is required"],
      trim: true,
      minlength: [10, "Feedback should be at least 10 characters"],
      maxlength: [2000, "Feedback cannot exceed 2000 characters"],
    },
    policyId: {
      type: String,
      required: [true, "Policy ID is required"],
      trim: true,
    },
    policyTitle: {
      type: String,
      required: [true, "Policy title is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userImage: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^https?:\/\/.+/,
        "Please provide a valid image URL or leave empty",
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
reviewSchema.index({ policyId: 1 });
reviewSchema.index({ email: 1 });
reviewSchema.index({ date: -1 });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
