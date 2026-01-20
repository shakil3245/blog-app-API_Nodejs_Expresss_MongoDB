const Post = require('../models/post');
const cloudinary = require('../config/cloudinary');
const fs = require('fs-extra');

//post blogs

exports.createPost = async (req, res) => {
  try {

    //upload image to Cloudinary
    let imageData = {};

    // Upload image to Cloudinary if exists
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'blog-posts',
      });
      // 🧹 Remove temp file
      await fs.unlink(req.file.path);

      imageData = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    const post = await Post.create({
      title: req.body.title,
      body: req.body.body,
      categories: req.body.categories,
      tags: req.body.tags,
      status: req.body.status,
      author: req.user._id,
      image: imageData
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.getPosts = async (req, res) => {
  const posts = await Post.find({ status: 'published' }).populate('author', 'name avatar');
  res.json(posts);
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name avatar');
  if(!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
};
//need to work
exports.updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if(!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
};



exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Allow only admin or post author
    if (
      req.user.role !== 'admin' &&
      post.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete image from Cloudinary if exists
    if (post.image?.public_id) {
      await cloudinary.uploader.destroy(post.image.public_id);
    }

    await post.deleteOne();

    res.json({ message: 'Post and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//pagination
exports.getPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({ status: 'published' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name avatar');

  const total = await Post.countDocuments({ status: 'published' });
  res.json({ total, page, pages: Math.ceil(total / limit), posts });
};

//search as real world way
exports.searchPosts = async (req, res) => {
  const {
    keyword,
    category,
    tag,
    author,
    fromDate,
    toDate,
    sortBy,
    page = 1,
    limit = 10
  } = req.query;

  let query = { status: 'published' };

  //  Keyword search
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { body: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.categories = category;
  }

  // Tag filter
  if (tag) {
    query.tags = tag;
  }

  // Author filter
  if (author) {
    query.author = author;
  }

  // Date filter
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = new Date(fromDate);
    if (toDate) query.createdAt.$lte = new Date(toDate);
  }

  // Sorting
  let sort = { createdAt: -1 }; // default latest
  if (sortBy === 'oldest') sort = { createdAt: 1 };
  if (sortBy === 'popular') sort = { likes: -1 };

  // Pagination
  const skip = (page - 1) * limit;

  const posts = await Post.find(query)
    .populate('author', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Post.countDocuments(query);

  res.json({
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    posts
  });
};
