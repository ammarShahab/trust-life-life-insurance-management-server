// routes/blogRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getAllBlogs,
  getLatestBlogs,
  getBlogById,
  incrementVisit,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");
const verifyFBToken = require("../middleware/verifyFBToken");

// ========== PUBLIC ROUTES ==========
// GET /all-blogs — all blogs
router.get("/all-blogs", getAllBlogs);

// GET /blog-latest — latest 8 blogs
router.get("/blog-latest", getLatestBlogs);

// GET /blogs/:id — single blog
router.get("/blogs/:id", getBlogById);

// PATCH /blogs/visit/:id — increment visit count
router.patch("/blogs/visit/:id", incrementVisit);

// ========== PROTECTED ROUTES ==========
// POST /blogs — create blog
router.post("/blogs", verifyFBToken, createBlog);

// GET /blogs?email=... — get blogs (admin sees all, user sees own)
router.get("/blogs", verifyFBToken, getBlogs);

// PUT /blogs/:id — update blog
router.put("/blogs/:id", verifyFBToken, updateBlog);

// DELETE /blogs/:id — delete blog
router.delete("/blogs/:id", verifyFBToken, deleteBlog);

module.exports = router;
