const express = require('express');
const multer = require('multer');
const { createProfile, getProfile, updateProfile, uploadPhoto } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);

/**
 * @swagger
 * /api/profile/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details
 *       404:
 *         description: Profile not found
 */
router.get('/me', getProfile);

/**
 * @swagger
 * /api/profile/create:
 *   post:
 *     summary: Create a user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               genderIdentity:
 *                 type: string
 *               sexualOrientation:
 *                 type: string
 *               lookingFor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Profile created
 */
router.post('/create', createProfile);

/**
 * @swagger
 * /api/profile/update:
 *   put:
 *     summary: Update existing profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/update', updateProfile);

/**
 * @swagger
 * /api/profile/upload-photo:
 *   post:
 *     summary: Upload profile photo
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 */
router.post('/upload-photo', upload.single('photo'), uploadPhoto);

module.exports = router;
