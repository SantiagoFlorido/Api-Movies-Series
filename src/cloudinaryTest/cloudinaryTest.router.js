const express = require('express');
const router = express.Router();
const { testCloudinaryConnection } = require('./cloudinaryTest.controller');
const upload = require('../utils/multer'); // Reutiliza tu configuración de multer
const responseHandlers = require('../utils/handleResponses');

/**
 * @swagger
 * /api/v1/test/cloudinary:
 *   post:
 *     summary: Test Cloudinary connection
 *     description: Endpoint to test Cloudinary image upload functionality
 *     tags: [Tests]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               testImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cloudinary test successful
 *       500:
 *         description: Cloudinary test failed
 */
router.post('/', upload.single('testImage'), async (req, res) => {
    try {
        const result = await testCloudinaryConnection(req.file);
        responseHandlers.success({
            res,
            status: 200,
            message: 'Cloudinary test successful',
            data: result
        });
    } catch (error) {
        console.error('Cloudinary test error:', error);
        responseHandlers.error({
            res,
            status: 500,
            message: 'Cloudinary test failed',
            error: error.message
        });
    }
});

module.exports = router;