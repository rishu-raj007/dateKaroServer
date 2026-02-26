const Profile = require('../models/Profile');
const Interaction = require('../models/Interaction');
const User = require('../models/User');

// Simple compatibility calculation based on shared interests
const calculateCompatibility = (userInterests, potentialInterests) => {
    if (!userInterests || !potentialInterests) return 0;
    const shared = userInterests.filter(i => potentialInterests.includes(i));
    const score = Math.min(Math.round((shared.length / Math.max(userInterests.length, 1)) * 100), 100);
    return score || 20; // Default base compatibility
};

exports.getTimeline = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get current user's profile to know their location/interests/preferences
        const userProfile = await Profile.findOne({ userId });
        if (!userProfile) return res.status(404).json({ message: 'Profile not found' });

        // 2. Get IDs of users already interacted with (like, dislike, superlike, save)
        const interactions = await Interaction.find({ fromUserId: userId }).select('toUserId type');
        const interactedUserIds = interactions
            .filter(i => i.type !== 'save') // Allow 'saved' users to show up again? Usually tinder-like feed hides them. 
            // Let's hide them for now unless filtered.
            .map(i => i.toUserId);

        interactedUserIds.push(userId); // Exclude self

        // 3. Find potential matches
        let query = {
            userId: { $nin: interactedUserIds },
            isProfileComplete: true
        };

        // Basic preference matching (gender identity vs looking for)
        // If user is looking for 'Men', show 'Man'. In a real app this would be more complex.
        if (userProfile.lookingFor && userProfile.lookingFor !== 'Everyone') {
            query.genderIdentity = userProfile.lookingFor === 'Men' ? 'Man' :
                userProfile.lookingFor === 'Women' ? 'Woman' : { $exists: true };
        }

        const profiles = await Profile.find(query).limit(40).lean();

        // 4. Calculate compatibility and add fun metadata
        const timeline = profiles.map(p => {
            const compatibility = calculateCompatibility(userProfile.interests, p.interests);

            // Creative Pros & Cons based on interests or random fun ones
            const funPros = ["Amazing cook", "Dog lover", "Good listener", "Always on time", "Pro gamer", "Coffee addict"];
            const funCons = ["Steals fries", "Sings loudly in car", "Late texter", "Uses 'your' instead of 'you're'", "Always cold", "Morning person"];

            const pros = p.interests.length > 0 ? p.interests.slice(0, 2) : [funPros[Math.floor(Math.random() * funPros.length)]];
            if (pros.length < 2) pros.push(funPros[Math.floor(Math.random() * funPros.length)]);

            const cons = [funCons[Math.floor(Math.random() * funCons.length)]];

            // Mood Tags
            const moods = ['Party Vibes', 'Chill Energy', 'Adventure Mode', 'Romantic Soul'];
            const mood = moods[Math.floor(Math.random() * moods.length)];

            return {
                ...p,
                compatibility,
                pros,
                cons,
                mood
            };
        });

        // Sort by compatibility
        timeline.sort((a, b) => b.compatibility - a.compatibility);

        res.json(timeline);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handleInteraction = async (req, res) => {
    const { toUserId, type } = req.body;
    const fromUserId = req.user._id;

    if (!['like', 'dislike', 'superlike', 'save'].includes(type)) {
        return res.status(400).json({ message: 'Invalid interaction type' });
    }

    try {
        const interaction = await Interaction.findOneAndUpdate(
            { fromUserId, toUserId },
            { type },
            { upsert: true, new: true }
        );

        // Check for a match (if it's a like or superlike)
        let isMatch = false;

        const currentUser = await User.findById(fromUserId);
        const targetUser = await User.findById(toUserId);

        if (currentUser && targetUser) {
            if (type === 'like' || type === 'superlike') {
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

                if (reverseInteraction) {
                    isMatch = true;
                    if (!currentUser.matches.some(id => id.toString() === toUserId.toString())) currentUser.matches.push(toUserId);
                    if (!targetUser.matches.some(id => id.toString() === fromUserId.toString())) targetUser.matches.push(fromUserId);
                }

                await currentUser.save();
                await targetUser.save();
            }
        }

        res.json({ interaction, isMatch });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
