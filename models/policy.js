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
      type: String,
      required: [true, "Premium is required"],
      trim: true,
    },
    premiumNumeric: {
      type: Number,
      default: 0,
      min: [0, "Premium numeric cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [
        /^https?:\/\/.+/,
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
  },
);

// Auto-parse premium string to numeric value
function parsePremiumToNumber(premiumStr) {
  if (!premiumStr) return 0;
  const num = parseFloat(premiumStr.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

policySchema.pre("save", function (next) {
  if (this.isModified("premium")) {
    this.premiumNumeric = parsePremiumToNumber(this.premium);
  }
  next();
});

policySchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (update.premium) {
    update.premiumNumeric = parsePremiumToNumber(update.premium);
  } else if (update.$set && update.$set.premium) {
    update.$set.premiumNumeric = parsePremiumToNumber(update.$set.premium);
  }
});

// Indexes for fast queries
policySchema.index({ category: 1 });
policySchema.index({ purchasedCount: -1 });
policySchema.index({ title: "text", description: "text" });
policySchema.index({ premiumNumeric: 1 });

const Policy = mongoose.model("Policy", policySchema);
module.exports = Policy;
