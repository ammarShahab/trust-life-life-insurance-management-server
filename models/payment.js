const { default: mongoose } = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    policyTitle: {
      type: String,
      required: [true, "Policy title is required"],
      trim: true,
    },
    policyId: {
      type: String,
      required: [true, "Policy ID is required"],
      trim: true,
    },
    applicationId: {
      type: String,
      required: [true, "Application ID is required"],
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: [String],
      default: ["card"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one payment method is required",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "Status '{VALUE}' is not valid",
      },
      default: "pending",
    },
    paymentTime: {
      type: Date,
      default: Date.now,
    },
    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      trim: true,
    },
    paymentDuration: {
      type: String,
      enum: {
        values: ["monthly", "yearly"],
        message: "Payment duration '{VALUE}' is not supported",
      },
      default: "monthly",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// Indexes for performance
paymentSchema.index({ email: 1 });
paymentSchema.index({ applicationId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
