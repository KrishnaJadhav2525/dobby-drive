import { useState } from 'react';
import '../styles/Modal.css';

function UploadImageModal({ onClose, onUpload }) {
  const [imageName, setImageName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setImageFile(file);
      if (!imageName) {
        setImageName(file.name);
      }
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageName.trim()) {
      setError('Image name is required');
      return;
    }
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }
    onUpload(imageName, imageFile);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Upload Image</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="imageName">Image Name</label>
            <input
              type="text"
              id="imageName"
              value={imageName}
              onChange={(e) => {
                setImageName(e.target.value);
                setError('');
              }}
              placeholder="Enter image name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="imageFile">Select Image</label>
            <input
              type="file"
              id="imageFile"
              onChange={handleFileChange}
              accept="image/*"
            />
            {imageFile && (
              <p className="file-selected">{imageFile.name}</p>
            )}
          </div>
          <div className="modal-buttons">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Upload Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadImageModal;
