require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Interaction = require('./models/Interaction');

async function testMatch() {
    await mongoose.connect(process.env.MONGODB_URI);

    const fromUserId = '699fe8693a454f1fd4548e9a';
    const toUserId = '699fdb9e3a454f1fd4548cc3';
    const type = 'like';

    const currentUser = await User.findById(fromUserId);
    const targetUser = await User.findById(toUserId);

    console.log("Found users?", !!currentUser, !!targetUser);

    if (currentUser && targetUser) {
        if (!currentUser.likesSent.some(id => id.toString() === toUserId.toString())) {
            currentUser.likesSent.push(toUserId);
        }
        if (!targetUser.likesReceived.some(id => id.toString() === fromUserId.toString())) {
            targetUser.likesReceived.push(fromUserId);
        }

        const reverseInteraction = await Interaction.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId,
            type: { $in: ['like', 'superlike'] }
        });

        console.log("Reverse Interaction found?", !!reverseInteraction);

        if (reverseInteraction) {
            console.log("MATCH!");
            if (!currentUser.matches.some(id => id.toString() === toUserId.toString())) currentUser.matches.push(toUserId);
            if (!targetUser.matches.some(id => id.toString() === fromUserId.toString())) targetUser.matches.push(fromUserId);
        }

        await currentUser.save();
        await targetUser.save();
        console.log("Saved.");
    }

    mongoose.disconnect();
}

testMatch().catch(console.error);
