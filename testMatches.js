require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Message = require('./models/Message');

async function testGetMatches() {
    await mongoose.connect(process.env.MONGODB_URI);

    const currentUserId = '699fe8693a454f1fd4548e9a'; // The user we tested matching with
    const user = await User.findById(currentUserId);

    console.log("User matches array:", user.matches);

    // Fetch profiles of matches
    const matchedProfiles = await Profile.find({ userId: { $in: user.matches } }).lean();
    console.log("Matched Profiles found:", matchedProfiles.length);

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

    console.log("Final matches payload:", JSON.stringify(matchesWithData, null, 2));

    mongoose.disconnect();
}

testGetMatches().catch(console.error);
