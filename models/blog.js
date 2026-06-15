// models/Blog.js

const { default: mongoose } = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please provide a valid image URL"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [50, "Content should be at least 50 characters"],
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    authorEmail: {
      type: String,
      required: [true, "Author email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    authorImage: {
      type: String,
      trim: true,
      default: "",
      match: [
        /^$|^https?:\/\/.+/,
        "Please provide a valid author image URL or leave empty",
      ],
    },
    totalVisit: {
      type: Number,
      default: 0,
      min: [0, "Visit count cannot be negative"],
    },
    authorRole: {
      type: String,
      enum: {
        values: ["admin", "agent", "customer"],
        message: "Role '{VALUE}' is not supported",
      },
      default: "admin",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
blogSchema.index({ publishDate: -1 });
blogSchema.index({ authorEmail: 1 });
blogSchema.index({ title: "text", content: "text" });

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
