const Folder = require('../models/Folder');
const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

// @desc   Create a folder
// @route  POST /api/folders
// @access Private
const createFolder = async (req, res) => {
  const { name, parentId } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  // If parentId provided, verify the parent belongs to this user
  if (parentId) {
    const parent = await Folder.findOne({ _id: parentId, owner: req.user.id });
    if (!parent) {
      return res.status(404).json({ error: 'Parent folder not found' });
    }
  }

  const folder = await Folder.create({
    name,
    parent: parentId || null,
    owner: req.user.id,
  });

  res.status(201).json({ folder });
};

// @desc   Get root folders for current user
// @route  GET /api/folders
// @access Private
const getRootFolders = async (req, res) => {
  const folders = await Folder.find({ owner: req.user.id, parent: null }).sort({ createdAt: -1 });
  res.json({ folders });
};

// @desc   Get a folder's contents (child folders + images)
// @route  GET /api/folders/:id
// @access Private
const getFolderContents = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, owner: req.user.id });
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const [childFolders, images] = await Promise.all([
    Folder.find({ parent: folder._id, owner: req.user.id }).sort({ createdAt: -1 }),
    Image.find({ folder: folder._id, owner: req.user.id }).sort({ createdAt: -1 }),
  ]);

  res.json({ folder, childFolders, images });
};

// Helper: recursively get all folder IDs under a given folder
const getAllDescendantFolderIds = async (folderId, ownerId) => {
  const children = await Folder.find({ parent: folderId, owner: ownerId }).select('_id');
  const childIds = children.map((f) => f._id);

  let allIds = [...childIds];
  for (const childId of childIds) {
    const descendants = await getAllDescendantFolderIds(childId, ownerId);
    allIds = allIds.concat(descendants);
  }
  return allIds;
};

// @desc   Get total size of a folder (recursive)
// @route  GET /api/folders/:id/size
// @access Private
const getFolderSize = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, owner: req.user.id });
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Get all descendant folder IDs (including self)
  const descendantIds = await getAllDescendantFolderIds(folder._id, req.user.id);
  const allFolderIds = [folder._id, ...descendantIds];

  // Sum all image sizes in those folders
  const result = await Image.aggregate([
    { $match: { folder: { $in: allFolderIds }, owner: folder.owner } },
    { $group: { _id: null, totalSize: { $sum: '$size' } } },
  ]);

  const totalSize = result.length > 0 ? result[0].totalSize : 0;

  res.json({ folderId: folder._id, totalSize });
};

// @desc   Delete a folder and all nested contents
// @route  DELETE /api/folders/:id
// @access Private
const deleteFolder = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, owner: req.user.id });
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Get all descendant folder IDs
  const descendantIds = await getAllDescendantFolderIds(folder._id, req.user.id);
  const allFolderIds = [folder._id, ...descendantIds];

  // Delete all images inside these folders (and their files from disk)
  const imagesToDelete = await Image.find({ folder: { $in: allFolderIds } });
  for (const img of imagesToDelete) {
    const filePath = path.join(__dirname, '..', 'uploads', img.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  await Image.deleteMany({ folder: { $in: allFolderIds } });

  // Delete all folders
  await Folder.deleteMany({ _id: { $in: allFolderIds } });

  res.json({ message: 'Folder and all its contents deleted successfully' });
};

// @desc   Get breadcrumb path for a folder
// @route  GET /api/folders/:id/breadcrumb
// @access Private
const getBreadcrumb = async (req, res) => {
  const folder = await Folder.findOne({ _id: req.params.id, owner: req.user.id });
  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const breadcrumb = [{ _id: folder._id, name: folder.name }];
  let current = folder;

  while (current.parent) {
    current = await Folder.findById(current.parent);
    if (!current) break;
    breadcrumb.unshift({ _id: current._id, name: current.name });
  }

  res.json({ breadcrumb });
};

module.exports = {
  createFolder,
  getRootFolders,
  getFolderContents,
  getFolderSize,
  deleteFolder,
  getBreadcrumb,
};
