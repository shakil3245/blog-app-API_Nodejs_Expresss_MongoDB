const Post = require('../models/post');
// all the Controller functions for CRUD
exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  const posts = await Post.find({ status: 'published' }).populate('author', 'name avatar');
  res.json(posts);
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name avatar');
  if(!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
};

exports.updatePost = async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if(!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
};

exports.deletePost = async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if(!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ message: 'Post deleted' });
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
