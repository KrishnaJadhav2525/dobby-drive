const Image = require('../models/Image');
const Folder = require('../models/Folder');
const fs = require('fs');
const path = require('path');

// @desc   Upload image to a folder
// @route  POST /api/images
// @access Private
const uploadImage = async (req, res) => {
  const { name, folderId } = req.body;

  if (!name || !folderId) {
    // Clean up uploaded file if validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: 'Name and folderId are required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  // Verify folder exists and belongs to user
  const folder = await Folder.findOne({ _id: folderId, owner: req.user.id });
  if (!folder) {
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Folder not found' });
  }

  const image = await Image.create({
    name,
    filename: req.file.filename,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    folder: folderId,
    owner: req.user.id,
  });

  res.status(201).json({ image });
};

// @desc   Get images in a folder
// @route  GET /api/images/folder/:folderId
// @access Private
const getImagesByFolder = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.folderId, owner: req.user.id });
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const images = await Image.find({
    folder: req.params.folderId,
    owner: req.user.id,
  }).sort({ createdAt: -1 });

  res.json({ images });
};

// @desc   Delete image
// @route  DELETE /api/images/:id
// @access Private
const deleteImage = async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, owner: req.user.id });
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  // Delete file from disk
  const filePath = path.join(__dirname, '..', 'uploads', image.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await Image.deleteOne({ _id: req.params.id });

  res.json({ message: 'Image deleted successfully' });
};

// @desc   Get image download/view URL
// @route  GET /api/images/:id
// @access Private
const getImage = async (req, res) => {
  const image = await Image.findOne({ _id: req.params.id, owner: req.user.id });
  if (!image) {
    return res.status(404).json({ error: 'Image not found' });
  }

  res.json({ image });
};

module.exports = {
  uploadImage,
  getImagesByFolder,
  deleteImage,
  getImage,
};
