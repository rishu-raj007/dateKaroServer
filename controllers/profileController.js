const Profile = require('../models/Profile');

exports.createProfile = async (req, res) => {
    try {
        const profileData = { ...req.body, userId: req.user._id };
        const profile = await Profile.create(profileData);
        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });
        if (profile) {
            res.json(profile);
        } else {
            res.status(404).json({ message: 'Profile not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const profile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { ...req.body, updatedAt: Date.now() },
            { new: true, upsert: true }
        );
        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Convert buffer directly to a Base64 Data URI for storage in MongoDB
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Return the Data URI to the frontend to be saved along with the profile
        res.json({ url: dataURI });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
