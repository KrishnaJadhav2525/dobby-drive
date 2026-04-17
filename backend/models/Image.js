const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Image name is required'],
      trim: true,
    },
    filename: {
      type: String,
      required: true, // stored filename on disk (multer generated)
    },
    originalname: {
      type: String,
    },
    mimetype: {
      type: String,
    },
    size: {
      type: Number, // size in bytes
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
