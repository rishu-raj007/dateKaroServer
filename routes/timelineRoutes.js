const express = require('express');
const { getTimeline, handleInteraction } = require('../controllers/timelineController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/timeline:
 *   get:
 *     summary: Get potential matches for the timeline
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of potential matches
 */
router.get('/', getTimeline);

/**
 * @swagger
 * /api/timeline/interaction:
 *   post:
 *     summary: Record a like, dislike, or superlike
 *     tags: [Timeline]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toUserId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [like, dislike, superlike]
 *     responses:
 *       200:
 *         description: Interaction recorded
 */
router.post('/interaction', handleInteraction);

module.exports = router;
