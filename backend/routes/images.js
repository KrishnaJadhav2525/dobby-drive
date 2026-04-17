const express = require('express');
const { uploadImage, getImagesByFolder, deleteImage, getImage } = require('../controllers/imageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All image routes require authentication
router.use(protect);

router.post('/', upload.single('image'), uploadImage);
router.get('/folder/:folderId', getImagesByFolder);
router.get('/:id', getImage);
router.delete('/:id', deleteImage);

module.exports = router;
