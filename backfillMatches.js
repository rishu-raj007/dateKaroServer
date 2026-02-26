require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Interaction = require('./models/Interaction');

async function backfillMatches() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Syncing database matches...");

    const likes = await Interaction.find({ type: { $in: ['like', 'superlike'] } });

    // Group by fromUserId
    for (let like of likes) {
        const reverseLike = await Interaction.findOne({
            fromUserId: like.toUserId,
            toUserId: like.fromUserId,
            type: { $in: ['like', 'superlike'] }
        });

        if (reverseLike) {
            const user1 = await User.findById(like.fromUserId);
            const user2 = await User.findById(like.toUserId);

            if (user1 && user2) {
                if (!user1.matches.some(id => id.toString() === user2._id.toString())) {
                    user1.matches.push(user2._id);
                    await user1.save();
                    console.log(`Synced match for User ${user1._id} with ${user2._id}`);
                }
                if (!user2.matches.some(id => id.toString() === user1._id.toString())) {
                    user2.matches.push(user1._id);
                    await user2.save();
                }
            }
        }
    }

    console.log("Database sync complete.");
    mongoose.disconnect();
}

backfillMatches().catch(console.error);
