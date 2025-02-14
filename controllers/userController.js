const User = require('../models/userModel');

exports.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};