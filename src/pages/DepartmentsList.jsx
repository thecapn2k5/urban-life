import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const DEFAULT_DEPARTMENTS = ['Worship', 'Kids', 'Youth', 'Greeting', 'Tech/Media', 'Other'];

export const loadDepartments = async () => {
  const setting = await db.getSettings('departments');
  if (setting && setting.value) {
    return setting.value.sort((a, b) => a.localeCompare(b));
  }
  // Store defaults if not found
  await db.saveSettings('departments', DEFAULT_DEPARTMENTS);
  return [...DEFAULT_DEPARTMENTS].sort((a, b) => a.localeCompare(b));
};

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const deps = await loadDepartments();
    setDepartments(deps);
  };

  const handleSaveAll = async (newDeps) => {
    await db.saveSettings('departments', newDeps);
    setDepartments([...newDeps].sort((a, b) => a.localeCompare(b)));
  };

  const handleAdd = () => {
    if (!editValue.trim()) return;
    const newDeps = [...departments, editValue.trim()];
    handleSaveAll(newDeps);
    setEditValue('');
    setIsAdding(false);
  };

  const handleUpdate = (oldName) => {
    if (!editValue.trim()) return;
    const newDeps = departments.map(d => d === oldName ? editValue.trim() : d);
    handleSaveAll(newDeps);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleDelete = (name) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      const newDeps = departments.filter(d => d !== name);
      handleSaveAll(newDeps);
    }
  };

  return (
    <>
      <div className="header">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </button>
        <h2>Departments</h2>
        <button className="btn-icon" onClick={() => { setIsAdding(true); setEditValue(''); setEditingIndex(null); }}>
          <FiPlus size={24} />
        </button>
      </div>

      <div className="card">
        {isAdding && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              autoFocus
              value={editValue} 
              onChange={e => setEditValue(e.target.value)} 
              placeholder="New department name..."
              style={{ marginBottom: 0 }}
            />
            <button className="btn-icon" style={{ color: 'var(--success-color)' }} onClick={handleAdd}>
              <FiSave size={20} />
            </button>
            <button className="btn-icon" onClick={() => setIsAdding(false)}>
              <FiX size={20} />
            </button>
          </div>
        )}

        {departments.length === 0 && !isAdding && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No departments found.</p>
        )}

        {departments.map((dept, index) => (
          <div key={index} style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '12px 0', borderBottom: index < departments.length - 1 ? '1px solid var(--border-light)' : 'none' 
          }}>
            {editingIndex === index ? (
              <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                <input 
                  autoFocus
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)} 
                  style={{ marginBottom: 0 }}
                />
                <button className="btn-icon" style={{ color: 'var(--success-color)' }} onClick={() => handleUpdate(dept)}>
                  <FiSave size={20} />
                </button>
                <button className="btn-icon" onClick={() => setEditingIndex(null)}>
                  <FiX size={20} />
                </button>
              </div>
            ) : (
              <>
                <span style={{ fontSize: '1.125rem' }}>{dept}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" onClick={() => { setEditingIndex(index); setEditValue(dept); setIsAdding(false); }}>
                    <FiEdit2 size={18} />
                  </button>
                  <button className="btn-icon" style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(dept)}>
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
