const Message = require('../models/Message');
const User = require('../models/User');

// GET /api/messages/:matchId
const getMessages = async (req, res) => {
    try {
        const { matchId } = req.params;
        const currentUserId = req.user._id;

        // Check if the users are actually matched
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.matches.some(id => id.toString() === matchId.toString())) {
            return res.status(403).json({ message: 'You are not matched with this user' });
        }

        // Mark messages from the match as read
        await Message.updateMany(
            { senderId: matchId, receiverId: currentUserId, read: false },
            { $set: { read: true } }
        );

        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: matchId },
                { senderId: matchId, receiverId: currentUserId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// POST /api/messages
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !message) {
            return res.status(400).json({ message: 'Please provide receiver and message' });
        }

        const currentUser = await User.findById(senderId);
        if (!currentUser.matches.some(id => id.toString() === receiverId.toString())) {
            return res.status(403).json({ message: 'You can only message your matches' });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};

module.exports = {
    getMessages,
    sendMessage,
};
