// controllers/blogController.js
const Blog = require("../models/blog.js");

// @desc    Create a new blog
// @route   POST /blogs
// @access  Private (admin/agent)
const createBlog = async (req, res) => {
  try {
    const blogData = req.body;

    const newBlog = new Blog({
      ...blogData,
      publishDate: new Date(),
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error("Error creating blog:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Get blogs (admin sees all, others see only their own)
// @route   GET /blogs?email=...
// @access  Private
const getBlogs = async (req, res) => {
  try {
    const { email } = req.query;

    // Get user's role from customers collection or decoded token
    // For simplicity, we'll check if email matches authorEmail
    // Admin logic: if req.decoded.email is admin, return all
    // This is simplified — you can enhance with role check

    const query =
      req.decoded.email === email && req.decoded.role === "admin"
        ? {}
        : { authorEmail: email };

    const blogs = await Blog.find(query).sort({ publishDate: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// @desc    Get all blogs (public)
// @route   GET /all-blogs
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishDate: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// @desc    Get latest 8 blogs
// @route   GET /blog-latest
// @access  Public
const getLatestBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishDate: -1 }).limit(8);
    res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    res.status(500).json({ error: "Failed to fetch latest blogs" });
  }
};

// @desc    Get single blog by ID
// @route   GET /blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    res
      .status(500)
      .json({ message: "Failed to fetch blog", error: error.message });
  }
};

// @desc    Increment blog visit count
// @route   PATCH /blogs/visit/:id
// @access  Public
const incrementVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { totalVisit: 1 } },
      { new: true },
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("Error updating visit count:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    res.status(500).json({ error: "Failed to update visit count" });
  }
};

// @desc    Update blog by ID
// @route   PUT /blogs/:id
// @access  Private (author or admin)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        content,
        imageUrl,
        publishDate: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found or already up to date" });
    }

    res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res
        .status(400)
        .json({ message: "Validation Error", errors: messages });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc    Delete blog by ID
// @route   DELETE /blogs/:id
// @access  Private (author or admin)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json({ message: "Blog deleted successfully", blog });
  } catch (error) {
    console.error("Error deleting blog:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getAllBlogs,
  getLatestBlogs,
  getBlogById,
  incrementVisit,
  updateBlog,
  deleteBlog,
};
