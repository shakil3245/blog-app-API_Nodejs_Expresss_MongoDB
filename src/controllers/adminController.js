const Post = require('../models/post');

exports.reviewByAdmin = async (req, res) => {
  const { status } = req.body;
  const posts = await Post.findById(req.params.id);
  if (!posts) return res.status(404).json({ message: 'Posts not found' });
  posts.status = status;
  await posts.save();
  res.json(posts);
};