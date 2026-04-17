import '../styles/FolderList.css';

function FolderList({ folders, onNavigate, onDelete }) {
  return (
    <div className="folder-list">
      {folders.map((folder) => (
        <div key={folder._id} className="folder-item">
          <div
            className="folder-content"
            onClick={() => onNavigate(folder._id)}
          >
            <div className="folder-icon">📁</div>
            <div className="folder-name">{folder.name}</div>
          </div>
          <button
            onClick={() => onDelete(folder._id)}
            className="delete-btn"
            title="Delete folder"
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}

export default FolderList;
