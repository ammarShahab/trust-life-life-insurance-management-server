// models/newsletter.js

const { default: mongoose } = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Prevents duplicate subscriptions
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for fast email lookups
// newsletterSchema.index({ email: 1 });

const newsletter = mongoose.model("newsletter", newsletterSchema);
module.exports = newsletter;
