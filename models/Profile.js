const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    photoUrl: {
        type: String,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
    },
    bio: {
        type: String,
        maxLength: 500,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    genderIdentity: {
        type: String,
        required: true,
    },
    sexualOrientation: {
        type: String,
        required: true,
    },
    interests: {
        type: [String],
        default: [],
    },
    location: {
        city: String,
        country: String,
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere',
        },
    },
    lookingFor: {
        type: String,
        required: true,
    },
    isProfileComplete: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
