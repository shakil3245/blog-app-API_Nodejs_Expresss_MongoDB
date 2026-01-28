const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { createPost, getPosts,getAllPosts, getPost, updatePost, deletePost,searchPosts } = require('../controllers/postController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/roles');
// searching route always first.
router.get('/search', searchPosts);

router.route('/')
  .get(getPosts).get(getAllPosts)
  .post(protect, authorize('author', 'admin'),upload.single('image'),createPost);

router.route('/:id')
  .get(getPost)
  .put(protect, authorize('author', 'admin'), updatePost)
  .delete(protect, authorize('author', 'admin'), deletePost);


module.exports = router;
