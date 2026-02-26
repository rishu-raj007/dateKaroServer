const User = require('../models/User');
const Profile = require('../models/Profile');
const Message = require('../models/Message');

// POST /api/interactions/like/:userId
const likeUser = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const targetUserId = req.params.userId;

        if (currentUserId.toString() === targetUserId) {
            return res.status(400).json({ message: 'You cannot like yourself' });
        }

        const currentUser = await User.findById(currentUserId);
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent duplicate likes
        if (currentUser.likesSent.includes(targetUserId)) {
            return res.status(400).json({ message: 'You already liked this user' });
        }

        currentUser.likesSent.push(targetUserId);
        targetUser.likesReceived.push(currentUserId);

        let isMatch = false;

        // Check if mutual like (match)
        if (currentUser.likesReceived.includes(targetUserId)) {
            isMatch = true;
            if (!currentUser.matches.includes(targetUserId)) {
                currentUser.matches.push(targetUserId);
            }
            if (!targetUser.matches.includes(currentUserId)) {
                targetUser.matches.push(currentUserId);
            }
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            message: isMatch ? 'It is a match!' : 'Like sent successfully',
            isMatch,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error liking user' });
    }
};

// GET /api/interactions/liked-profiles
const getLikedProfiles = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('likesSent', 'email firstName lastName profilePhoto location age');
        res.status(200).json(user.likesSent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching liked profiles' });
    }
};

// GET /api/interactions/matches
const getMatches = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const user = await User.findById(currentUserId);

        // Fetch profiles of matches
        const matchedProfiles = await Profile.find({ userId: { $in: user.matches } }).lean();

        // For each match, get last message and unread count
        const matchesWithData = await Promise.all(matchedProfiles.map(async (profile) => {
            const matchId = profile.userId;

            const messages = await Message.find({
                $or: [
                    { senderId: currentUserId, receiverId: matchId },
                    { senderId: matchId, receiverId: currentUserId }
                ]
            }).sort({ createdAt: -1 }).limit(1);

            let lastMessage = null;
            if (messages.length > 0) {
                lastMessage = messages[0].message;
            }

            const unreadCount = await Message.countDocuments({
                senderId: matchId,
                receiverId: currentUserId,
                read: false
            });

            return {
                ...profile,
                _id: matchId,
                profilePhoto: profile.photoUrl,
                lastMessage,
                unreadCount
            };
        }));

        res.status(200).json(matchesWithData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching matches' });
    }
};

module.exports = {
    likeUser,
    getLikedProfiles,
    getMatches,
};
