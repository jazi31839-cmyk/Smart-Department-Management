import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function FileManager() {
  const { user, token } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic');
  const [visibility, setVisibility] = useState('Staff & HOD');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState(null);

  const isUploadAllowed = user && (user.role === 'HOD' || user.role === 'Staff');

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Fetch files error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchFiles();
  }, [token]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('visibility', visibility);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setUploadMsg({ type: 'success', text: 'Document uploaded and secured in file management storage!' });
        setTitle('');
        setSelectedFile(null);
        setTimeout(() => {
          setShowUploadModal(false);
          setUploadMsg(null);
          fetchFiles();
        }, 1200);
      } else {
        setUploadMsg({ type: 'error', text: data.error || 'Failed to upload document' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Server error during file upload' });
    }
  };

  const getVisibilityBadge = (vis) => {
    switch (vis) {
      case 'HOD Only':
        return <span className="badge badge-private">🔒 HOD ONLY</span>;
      case 'Staff & HOD':
        return <span className="badge badge-staff">🛡️ STAFF & HOD</span>;
      case 'Student Public':
        return <span className="badge badge-student">🌐 PUBLIC STUDENT</span>;
      default:
        return <span className="badge badge-staff">{vis}</span>;
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
            📁 Secure File Management Vault
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            {user.role === 'Student'
              ? 'Showing shared course documents & public department files'
              : 'Encrypted department documents & role-restricted file storage'}
          </p>
        </div>

        {isUploadAllowed && (
          <button
            onClick={() => setShowUploadModal(true)}
            className={`btn ${user.role === 'HOD' ? 'btn-primary' : 'btn-staff'}`}
          >
            📤 Upload Secured File
          </button>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '28px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '16px' }}>
              Upload Department File
            </h3>

            {uploadMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '0.85rem',
                background: uploadMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: uploadMsg.type === 'success' ? '#6ee7b7' : '#fca5a5',
                border: `1px solid ${uploadMsg.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              }}>
                {uploadMsg.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mid-Semester Exam Rubric"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Academic">Academic</option>
                    <option value="Departmental">Departmental</option>
                    <option value="Examination">Examination</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Private Staff Doc">Private Staff Doc</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Access Visibility</label>
                  <select className="form-control" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                    <option value="Student Public">Student Public (All Roles)</option>
                    <option value="Staff & HOD">Staff & HOD Only</option>
                    {user.role === 'HOD' && <option value="HOD Only">HOD Only (Restricted)</option>}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Select File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className={`btn ${user.role === 'HOD' ? 'btn-primary' : 'btn-staff'}`}>
                  Confirm & Secure Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Files Table */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
          Loading document inventory...
        </div>
      ) : files.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
          No documents accessible for your user role.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Category</th>
                <th>Access Visibility</th>
                <th>Uploaded By</th>
                <th>Size</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id || file._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{file.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{file.originalName}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                      {file.category}
                    </span>
                  </td>
                  <td>{getVisibilityBadge(file.visibility)}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{file.uploadedBy}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Role: {file.uploaderRole}</div>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{formatBytes(file.fileSize)}</td>
                  <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <a
                      href={`/uploads/${file.filename}`}
                      download={file.originalName}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', textDecoration: 'none' }}
                      onClick={(e) => {
                        // Demo notification
                        alert(`Downloading secured document: ${file.title}`);
                      }}
                    >
                      ⬇️ Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
