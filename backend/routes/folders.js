const express = require('express');
const {
  createFolder,
  getRootFolders,
  getFolderContents,
  getFolderSize,
  deleteFolder,
  getBreadcrumb,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All folder routes require authentication
router.use(protect);

router.post('/', createFolder);
router.get('/', getRootFolders);
router.get('/:id', getFolderContents);
router.get('/:id/size', getFolderSize);
router.get('/:id/breadcrumb', getBreadcrumb);
router.delete('/:id', deleteFolder);

module.exports = router;
