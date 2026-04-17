import '../styles/ImageList.css';

function ImageList({ images, onDelete }) {
  return (
    <div className="image-list">
      {images.map((image) => (
        <div key={image._id} className="image-item">
          <div className="image-preview">
            <img
              src={`http://localhost:5000/uploads/${image.filename}`}
              alt={image.name}
            />
          </div>
          <div className="image-info">
            <p className="image-name">{image.name}</p>
            <p className="image-size">{formatBytes(image.size)}</p>
          </div>
          <button
            onClick={() => onDelete(image._id)}
            className="delete-btn"
            title="Delete image"
          >
            🗑️
          </button>
        </div>
      ))}
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

export default ImageList;
