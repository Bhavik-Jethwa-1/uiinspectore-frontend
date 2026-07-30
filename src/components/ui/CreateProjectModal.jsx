import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, FolderOpen, Sparkles } from 'lucide-react';

export default function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [device, setDevice] = useState('web');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        device,
        screens: [],
      });
    } catch (err) {
      setSubmitting(false);
      alert(err.message || 'Failed to create project');
    }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-icon">
            <FolderOpen size={18} />
          </div>
          <div className="modal-head-text">
            <h2>Create new project</h2>
            <p>Start with a blank canvas.</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={submit} className="modal-body">
          <div className="field">
            <label className="label">Project name</label>
            <input
              type="text"
              className="input"
              placeholder="My awesome app"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label">Description (optional)</label>
            <textarea
              className="input"
              placeholder="What's this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field">
            <label className="label">Default device</label>
            <div className="device-pills">
              {[
                { id: 'web', label: 'Web', size: '1440×900' },
                { id: 'tablet', label: 'Tablet', size: '768×1024' },
                { id: 'mobile', label: 'Mobile', size: '375×812' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`device-pill ${device === d.id ? 'active' : ''}`}
                  onClick={() => setDevice(d.id)}
                >
                  <div className="device-pill-label">{d.label}</div>
                  <div className="device-pill-size">{d.size}</div>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={!name.trim() || submitting}>
            {submitting ? (
              <span className="dots"><span></span><span></span><span></span></span>
            ) : (
              <><Sparkles size={14} /> Create project</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
