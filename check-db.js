const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Profile = require('./models/Profile');
const User = require('./models/User');

async function checkDB() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const totalUsers = await User.countDocuments();
        console.log('Total Users:', totalUsers);

        const totalProfiles = await Profile.countDocuments();
        console.log('Total Profiles:', totalProfiles);

        const profiles = await Profile.find({});
        console.log('All Profiles:', profiles.map(p => ({
            name: p.firstName,
            complete: p.isProfileComplete,
            gender: p.genderIdentity,
            lookingFor: p.lookingFor
        })));

        await mongoose.connection.close();
    } catch (err) {
        console.error('DB Check Error:', err);
    }
}

checkDB();
