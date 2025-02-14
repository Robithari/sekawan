import Post from '../models/postModel.js';

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error });
    }
};

export default { getPosts };
