require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Interaction = require('./models/Interaction');

async function checkDb() {
    await mongoose.connect(process.env.MONGODB_URI);
    const users = await User.find({}).select('email likesSent likesReceived matches');
    console.log("USERS:", JSON.stringify(users, null, 2));

    const interactions = await Interaction.find({});
    console.log("INTERACTIONS:", JSON.stringify(interactions, null, 2));

    mongoose.disconnect();
}

checkDb().catch(console.error);
