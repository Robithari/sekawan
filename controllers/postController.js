const Post = require('../models/postModel');

exports.getPosts = async (req, res) => {
    const posts = await Post.find().populate('author');
    res.json(posts);
};