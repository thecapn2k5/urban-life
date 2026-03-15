import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { FiPlus, FiSearch, FiMoreVertical, FiList, FiUpload } from 'react-icons/fi';

export default function MemberList({ pin }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const allMembers = await db.getAllMembers(pin);
      setMembers(allMembers.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleImport = () => {
    document.getElementById('import-file-input').click();
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        const dataArray = Array.isArray(importedData) ? importedData : [importedData];
        
        let importedCount = 0;
        for (const item of dataArray) {
          if (item.name && item.surname) {
            // Remove ID to ensure it's a new entry
            const { id, ...memberData } = item;
            await db.saveMember(memberData, pin);
            importedCount++;
          }
        }
        
        if (importedCount > 0) {
          await loadMembers();
          setShowMenu(false);
          alert(`Successfully imported ${importedCount} member${importedCount === 1 ? '' : 's'}.`);
        } else {
          alert("Invalid file format. No valid member records found (name and surname are required).");
        }
      } catch (err) {
        console.error("Import failed", err);
        alert("Failed to import file. Make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const filteredMembers = members.filter(m => {
    const term = search.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.surname?.toLowerCase().includes(term) ||
      m.ministryDepartment?.toLowerCase().includes(term)
    );
  });

  return (
    <>
      <input 
        type="file" 
        id="import-file-input" 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={onFileChange} 
      />
      <div className="header">
        <h1>Members</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/add')}>
            <FiPlus /> New
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}>
              <FiMoreVertical size={24} />
            </button>
            
            {showMenu && (
              <div style={{
                position: 'absolute', right: 0, top: '40px',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                borderRadius: 'var(--border-radius-sm)', padding: 'var(--spacing-xs)',
                boxShadow: 'var(--box-shadow)', zIndex: 100, minWidth: '170px'
              }}>
                <button 
                  className="btn btn-icon" 
                  style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 4 }}
                  onClick={() => { navigate('/departments'); setShowMenu(false); }}
                >
                  <FiList style={{ marginRight: 8 }} /> Departments
                </button>
                <button 
                  className="btn btn-icon" 
                  style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 4 }}
                  onClick={handleImport}
                >
                  <FiUpload style={{ marginRight: 8 }} /> Import Member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 'var(--spacing-md)' }}>
        <FiSearch style={{ position: 'absolute', top: 16, left: 16, color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search by name, surname, or department..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      <div>
        {filteredMembers.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: 'var(--spacing-xl)' }}>
            No members found.
          </p>
        ) : (
          filteredMembers.map(member => (
            <div 
              key={member.id} 
              className="list-item" 
              onClick={() => navigate(`/member/${member.id}`)}
            >
              <div>
                <h3>{member.name} {member.surname}</h3>
                <p>{member.ministryDepartment || 'No department'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
