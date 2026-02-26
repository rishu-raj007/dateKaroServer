const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { likeUser, getLikedProfiles, getMatches } = require('../controllers/interactionController');

const router = express.Router();

router.post('/like/:userId', protect, likeUser);
router.get('/liked-profiles', protect, getLikedProfiles);
router.get('/matches', protect, getMatches);

module.exports = router;
