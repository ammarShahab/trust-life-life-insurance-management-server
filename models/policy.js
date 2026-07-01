const { default: mongoose } = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Policy title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      enum: {
        values: [
          "all",
          "Term Life",
          "Senior Plan",
          "Family Plan",
          "Child Plan",
        ],
        message: "Category '{VALUE}' is not supported",
      },
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [20, "Description should be at least 20 characters"],
    },
    minAge: {
      type: Number,
      required: [true, "Minimum age is required"],
      min: [0, "Minimum age cannot be negative"],
      max: [100, "Minimum age seems too high"],
    },
    maxAge: {
      type: Number,
      required: [true, "Maximum age is required"],
      validate: {
        validator: function (value) {
          return value >= this.minAge;
        },
        message: "Maximum age must be greater than or equal to minimum age",
      },
    },
    coverage: {
      type: String,
      required: [true, "Coverage is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },
    premium: {
      type: Number,
      required: [true, "Premium is required"],
      min: [0, "Premium cannot be negative"],
    },
    premiumDisplay: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [
        /^https?:\/.+/,
        "Please provide a valid image URL starting with http:// or https://",
      ],
    },
    purchasedCount: {
      type: Number,
      default: 0,
      min: [0, "Purchased count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
policySchema.index({ category: 1 });
policySchema.index({ purchasedCount: -1 });
policySchema.index({ title: "text", description: "text" });
policySchema.index({ premium: 1 });

const Policy = mongoose.model("Policy", policySchema);
module.exports = Policy;
