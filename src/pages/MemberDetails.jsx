import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import { FiArrowLeft, FiEdit2, FiShare, FiTrash2, FiMoreVertical } from 'react-icons/fi';

export default function MemberDetails({ pin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      const data = await db.getMember(id, pin);
      if (data) setMember(data);
      else navigate('/');
    } catch (e) {
      navigate('/');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handleShare = async () => {
    if (!member) return;
    try {
      const payload = {
        name: member.name,
        surname: member.surname,
        phoneNumber: member.phoneNumber,
        email: member.email,
        birthday: member.birthday,
        ministryDepartment: member.ministryDepartment,
        notes: member.notes
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      const fileName = `${member.name.replace(/\s+/g, '')}_${member.surname}.json`;
      
      // 1. Try sharing as a file (best for mobile apps)
      if (navigator.canShare) {
        try {
          const file = new File([jsonStr], fileName, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Member: ${member.name} ${member.surname}`,
              text: `Data for ${member.name} ${member.surname}`
            });
            setShowMenu(false);
            return;
          }
        } catch (fileErr) {
          console.warn('File sharing failed, trying text...', fileErr);
        }

        // 2. Try sharing as text (high compatibility)
        try {
          await navigator.share({
            title: `Member: ${member.name} ${member.surname}`,
            text: jsonStr
          });
          setShowMenu(false);
          return;
        } catch (textErr) {
          console.warn('Text sharing failed...', textErr);
        }
      }

      // 3. Final Fallback: Download file (best for desktop/unsupported browsers)
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      alert("Note exported as a download. You can now attach the file to an email.");
    } catch (error) {
      console.error('Share operation failed:', error);
      alert("Could not complete the sharing action.");
    }
    setShowMenu(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      await db.deleteMember(id);
      navigate('/');
    }
    setShowMenu(false);
  };

  if (!member) return <div className="app-container">Loading...</div>;

  return (
    <>
      <div className="header">
        <button className="btn-icon" onClick={() => navigate('/')}>
          <FiArrowLeft size={24} />
        </button>
        <h2>Details</h2>
        
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical size={24} />
          </button>
          
          {showMenu && (
            <div style={{
              position: 'absolute', right: 0, top: '40px',
              background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              borderRadius: 'var(--border-radius-sm)', padding: 'var(--spacing-xs)',
              boxShadow: 'var(--box-shadow)', zIndex: 100, minWidth: '150px'
            }}>
              <button 
                className="btn btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 4 }}
                onClick={() => { navigate(`/edit/${id}`); setShowMenu(false); }}
              >
                <FiEdit2 style={{ marginRight: 8 }} /> Edit
              </button>
              <button 
                className="btn btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 4 }}
                onClick={handleShare}
              >
                <FiShare style={{ marginRight: 8 }} /> Share
              </button>
              <button 
                className="btn btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', borderRadius: 4, color: 'var(--danger-color)' }}
                onClick={handleDelete}
              >
                <FiTrash2 style={{ marginRight: 8 }} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h1 style={{ marginBottom: 4 }}>{member.name} {member.surname}</h1>
        <p style={{ color: 'var(--accent-color)', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
          {member.ministryDepartment || 'No Department'}
        </p>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label>Phone Number</label>
          <div style={{ fontSize: '1.125rem' }}>{member.phoneNumber || '-'}</div>
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label>Email</label>
          <div style={{ fontSize: '1.125rem' }}>{member.email || '-'}</div>
        </div>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label>Birthday</label>
          <div style={{ fontSize: '1.125rem' }}>{formatDate(member.birthday)}</div>
        </div>

        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <label>Notes</label>
          <div style={{ 
            background: 'var(--bg-dark)', 
            padding: 'var(--spacing-md)', 
            borderRadius: 'var(--border-radius-sm)',
            minHeight: '100px',
            whiteSpace: 'pre-wrap'
          }}>
            {member.notes || 'No notes left for this member.'}
          </div>
        </div>
      </div>
    </>
  );
}
