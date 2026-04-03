// routes/blogRoutes.js - Add admin routes
const express = require('express');
const router = express.Router();
const {
    // Public routes
    getBlogs,
    getBlogBySlug,
    getBlogCategories,
    getBlogTags,
    addComment,
    toggleLike,
    getFeaturedBlogs,
    getRecentBlogs,
    // Admin routes
    getAdminBlogs,
    getBlogStats,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    approveBlogComment,
    deleteBlogComment
} = require('../controllers/blogController.cjs');

const { protectAdmin, restrictTo } = require('../middleware/authAdmin.cjs');

// Public routes (no authentication required)
router.get('/', getBlogs);  // List all published blogs
router.get('/featured', getFeaturedBlogs);
router.get('/recent', getRecentBlogs);
router.get('/categories', getBlogCategories);
router.get('/tags', getBlogTags);
router.get('/:slug', getBlogBySlug);  // Get single blog by slug
router.post('/:slug/comments', addComment);
router.post('/:slug/like', toggleLike);

module.exports = router;