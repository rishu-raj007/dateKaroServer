const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'dislike', 'superlike', 'save'],
        required: true,
    },
}, { timestamps: true });

// Ensure unique interaction per pair of users
interactionSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

module.exports = mongoose.model('Interaction', interactionSchema);
