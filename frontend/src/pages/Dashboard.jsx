import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderAPI, imageAPI } from '../services/api';
import FolderList from '../components/FolderList';
import ImageList from '../components/ImageList';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadImageModal from '../components/UploadImageModal';
import '../styles/Dashboard.css';

function Dashboard({ onLogout }) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [folderSize, setFolderSize] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadFolderContents(null);
  }, []);

  const loadFolderContents = async (folderId) => {
    setLoading(true);
    setError('');
    try {
      if (folderId === null) {
        const response = await folderAPI.getRootFolders();
        setFolders(response.data.folders);
        setImages([]);
        setBreadcrumb([]);
        setFolderSize(null);
        setCurrentFolderId(null);
      } else {
        const [contentsRes, sizeRes, breadcrumbRes] = await Promise.all([
          folderAPI.getFolderContents(folderId),
          folderAPI.getFolderSize(folderId),
          folderAPI.getBreadcrumb(folderId),
        ]);
        setFolders(contentsRes.data.childFolders);
        setImages(contentsRes.data.images);
        setFolderSize(sizeRes.data.totalSize);
        setBreadcrumb(breadcrumbRes.data.breadcrumb);
        setCurrentFolderId(folderId);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load folder');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      await folderAPI.createFolder(folderName, currentFolderId);
      setShowCreateFolder(false);
      loadFolderContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create folder');
    }
  };

  const handleUploadImage = async (imageName, file) => {
    try {
      const formData = new FormData();
      formData.append('name', imageName);
      formData.append('folderId', currentFolderId);
      formData.append('image', file);

      await imageAPI.uploadImage(formData);
      setShowUploadImage(false);
      loadFolderContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload image');
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder and all its contents?')) return;

    try {
      await folderAPI.deleteFolder(folderId);
      loadFolderContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete folder');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await imageAPI.deleteImage(imageId);
      loadFolderContents(currentFolderId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete image');
    }
  };

  const handleNavigateFolder = (folderId) => {
    loadFolderContents(folderId);
  };

  const handleBreadcrumbClick = (folderId) => {
    if (folderId === 'root') {
      loadFolderContents(null);
    } else {
      loadFolderContents(folderId);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dobby Drive</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="breadcrumb">
          <button
            onClick={() => handleBreadcrumbClick('root')}
            className={currentFolderId === null ? 'active' : ''}
          >
            Home
          </button>
          {breadcrumb.map((item, index) => (
            <div key={item._id}>
              <span> / </span>
              <button
                onClick={() => handleBreadcrumbClick(item._id)}
                className={currentFolderId === item._id ? 'active' : ''}
              >
                {item.name}
              </button>
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {folderSize !== null && (
          <div className="folder-info">
            <p>Folder Size: <strong>{formatBytes(folderSize)}</strong></p>
          </div>
        )}

        <div className="action-buttons">
          <button
            onClick={() => setShowCreateFolder(true)}
            className="btn btn-primary"
            disabled={loading}
          >
            + New Folder
          </button>
          {currentFolderId !== null && (
            <button
              onClick={() => setShowUploadImage(true)}
              className="btn btn-primary"
              disabled={loading}
            >
              + Upload Image
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {folders.length > 0 && (
              <section className="folders-section">
                <h2>Folders</h2>
                <FolderList
                  folders={folders}
                  onNavigate={handleNavigateFolder}
                  onDelete={handleDeleteFolder}
                />
              </section>
            )}

            {images.length > 0 && (
              <section className="images-section">
                <h2>Images</h2>
                <ImageList
                  images={images}
                  onDelete={handleDeleteImage}
                />
              </section>
            )}

            {folders.length === 0 && images.length === 0 && (
              <div className="empty-state">
                <p>This folder is empty</p>
                {currentFolderId === null ? (
                  <p>Create a new folder to get started!</p>
                ) : (
                  <p>Create a new folder or upload an image</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={handleCreateFolder}
        />
      )}

      {showUploadImage && currentFolderId !== null && (
        <UploadImageModal
          onClose={() => setShowUploadImage(false)}
          onUpload={handleUploadImage}
        />
      )}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default Dashboard;
