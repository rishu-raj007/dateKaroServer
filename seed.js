const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const Profile = require('./models/Profile');
const User = require('./models/User');

const femalePhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=1000&auto=format&fit=crop'
];

const malePhotos = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop'
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const dummyData = [
            // Original 4
            { email: 'sarah@example.com', name: 'Sarah', gender: 'Woman', looking: 'Men', photo: femalePhotos[0], age: 25, interests: ['Music', 'Travel', 'Dogs'] },
            { email: 'jessica@example.com', name: 'Jessica', gender: 'Woman', looking: 'Everyone', photo: femalePhotos[1], age: 28, interests: ['Dance', 'Food', 'Movies'] },
            { email: 'mike@example.com', name: 'Mike', gender: 'Man', looking: 'Women', photo: malePhotos[0], age: 30, interests: ['Tech', 'Fitness', 'Coffee'] },
            { email: 'alex@example.com', name: 'Alex', gender: 'Non-binary', looking: 'Everyone', photo: malePhotos[1], age: 24, interests: ['Art', 'Nature', 'Gaming'] },

            // 10 New ones
            { email: 'emily@example.com', name: 'Emily', gender: 'Woman', looking: 'Men', photo: femalePhotos[2], age: 22, interests: ['Yoga', 'Reading', 'Wine'] },
            { email: 'david@example.com', name: 'David', gender: 'Man', looking: 'Women', photo: malePhotos[2], age: 35, interests: ['Cooking', 'Hiking', 'Cars'] },
            { email: 'sophia@example.com', name: 'Sophia', gender: 'Woman', looking: 'Women', photo: femalePhotos[3], age: 26, interests: ['Fashion', 'Photography', 'Cats'] },
            { email: 'james@example.com', name: 'James', gender: 'Man', looking: 'Men', photo: malePhotos[3], age: 29, interests: ['Sports', 'Beer', 'Travel'] },
            { email: 'chloe@example.com', name: 'Chloe', gender: 'Woman', looking: 'Everyone', photo: femalePhotos[4], age: 23, interests: ['Baking', 'Netflix', 'Singing'] },
            { email: 'ryan@example.com', name: 'Ryan', gender: 'Man', looking: 'Women', photo: malePhotos[4], age: 27, interests: ['Gaming', 'Pizza', 'Coding'] },
            { email: 'lily@example.com', name: 'Lily', gender: 'Woman', looking: 'Men', photo: femalePhotos[5], age: 31, interests: ['Gardening', 'History', 'Nature'] },
            { email: 'ethan@example.com', name: 'Ethan', gender: 'Man', looking: 'Everyone', photo: malePhotos[5], age: 24, interests: ['Swimming', 'Movies', 'AI'] },
            { email: 'mia@example.com', name: 'Mia', gender: 'Woman', looking: 'Men', photo: femalePhotos[6], age: 29, interests: ['Gym', 'Music', 'Travel'] },
            { email: 'noah@example.com', name: 'Noah', gender: 'Man', looking: 'Women', photo: malePhotos[6], age: 33, interests: ['Sailing', 'Philosophy', 'Jazz'] }
        ];

        for (const data of dummyData) {
            let user = await User.findOne({ email: data.email });
            if (!user) {
                user = await User.create({ email: data.email, password: 'password123' });
            }

            await Profile.findOneAndUpdate(
                { userId: user._id },
                {
                    firstName: data.name,
                    lastName: 'Dummy',
                    dateOfBirth: new Date(Date.now() - data.age * 365 * 24 * 60 * 60 * 1000),
                    genderIdentity: data.gender,
                    sexualOrientation: 'Straight',
                    lookingFor: data.looking,
                    interests: data.interests,
                    photoUrl: data.photo,
                    isProfileComplete: true,
                    bio: `Hey! I'm ${data.name}. I'm really into ${data.interests.join(' and ')}. Looking for someone to explore the city with!`
                },
                { upsert: true, new: true }
            );
        }

        console.log(`Seeding complete! Added/Updated ${dummyData.length} profiles.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error('Seed Error:', err);
    }
}

seed();
