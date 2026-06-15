const { default: mongoose } = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // Applicant Info
    name: {
      type: String,
      required: [true, "Applicant name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
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
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    nid: {
      type: String,
      required: [true, "NID is required"],
      trim: true,
    },

    // Nominee Info
    nomineeName: {
      type: String,
      required: [true, "Nominee name is required"],
      trim: true,
    },
    nomineeRelationship: {
      type: String,
      required: [true, "Nominee relationship is required"],
      trim: true,
    },

    // Health Info
    healthConditions: {
      type: [String],
      default: ["None"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one health condition must be specified",
      },
    },

    // Policy Info (denormalized for quick access, but linked by policyId)
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
    policyCategory: {
      type: String,
      required: [true, "Policy category is required"],
      trim: true,
    },

    // Premium & Coverage
    estimatedPremiumMonthly: {
      type: Number,
      required: [true, "Monthly premium is required"],
      min: [0, "Premium cannot be negative"],
    },
    estimatedPremiumYearly: {
      type: String,
      required: [true, "Yearly premium is required"],
      trim: true,
    },
    coverage: {
      type: Number,
      required: [true, "Coverage amount is required"],
      min: [0, "Coverage cannot be negative"],
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 year"],
    },

    // Application Status
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "paid"],
        message: "Status '{VALUE}' is not valid",
      },
      default: "pending",
    },

    // Agent Assignment (set when admin approves)
    agentEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },
    agentName: {
      type: String,
      trim: true,
      default: null,
    },
    agent_status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Agent status '{VALUE}' is not valid",
      },
      default: "pending",
    },

    // Claim Fields (for claim requests)
    claim_document: {
      type: String,
      trim: true,
      default: null,
    },
    claim_reason: {
      type: String,
      trim: true,
      default: null,
    },
    claim_status: {
      type: String,
      enum: {
        values: ["pending", "claimed", "approved", "rejected"],
        message: "Claim status '{VALUE}' is not valid",
      },
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Indexes for performance
applicationSchema.index({ email: 1 });
applicationSchema.index({ policyId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ agentEmail: 1 });
applicationSchema.index({ claim_status: 1 });
applicationSchema.index({ email: 1, policyId: 1 }); // Prevent duplicate applications

const Application = mongoose.model("Application", applicationSchema);
module.exports = Application;
