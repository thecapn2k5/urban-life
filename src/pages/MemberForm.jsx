import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { loadDepartments } from './DepartmentsList';

export default function MemberForm({ pin }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phoneNumber: '',
    email: '',
    birthday: '',
    ministryDepartment: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
    if (isEditing) {
      loadMember();
    }
  }, [id]);

  const fetchDepartments = async () => {
    const deps = await loadDepartments();
    setDepartments(deps);
  };

  const loadMember = async () => {
    try {
      const member = await db.getMember(id, pin);
      if (member) {
        setFormData(member);
      } else {
        navigate('/');
      }
    } catch (e) {
      console.error(e);
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // optional
    // South Africa format: 0xx xxx xxxx or +27xx xxx xxxx
    const stripped = phone.replace(/\s+/g, '');
    const isLocal = /^0\d{9}$/.test(stripped);
    const isIntl = /^\+27\d{9}$/.test(stripped);
    return isLocal || isIntl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Must be a valid SA number (e.g. 082 123 4567 or +27 82 123 4567)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const savedId = await db.saveMember(formData, pin);
      navigate(`/member/${isEditing ? id : savedId}`, { replace: true });
    } catch (e) {
      console.error('Save failed', e);
      setErrors({ form: 'Failed to save member securely.' });
    }
  };

  return (
    <>
      <div className="header">
        <button className="btn-icon" onClick={() => navigate(-1)}>
          <FiArrowLeft size={24} />
        </button>
        <h2>{isEditing ? 'Edit Member' : 'New Member'}</h2>
        <div style={{ width: 40 }} /> {/* Spacer */}
      </div>

      <form className="card" onSubmit={handleSubmit}>
        {errors.form && <p style={{ color: 'var(--danger-color)', marginBottom: '16px' }}>{errors.form}</p>}

        <label>Name *</label>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="John" />
        {errors.name && <p style={{ color: 'var(--danger-color)', marginTop: '-8px', marginBottom: '8px', fontSize: '0.8rem' }}>{errors.name}</p>}

        <label>Surname *</label>
        <input name="surname" value={formData.surname} onChange={handleChange} placeholder="Doe" />
        {errors.surname && <p style={{ color: 'var(--danger-color)', marginTop: '-8px', marginBottom: '8px', fontSize: '0.8rem' }}>{errors.surname}</p>}

        <label>Phone Number (SA)</label>
        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="082 123 4567" />
        {errors.phoneNumber && <p style={{ color: 'var(--danger-color)', marginTop: '-8px', marginBottom: '8px', fontSize: '0.8rem' }}>{errors.phoneNumber}</p>}

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />

        <label>Birthday (Display: dd/mm/yyyy)</label>
        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />

        <label>Ministry Department</label>
        <select name="ministryDepartment" value={formData.ministryDepartment} onChange={handleChange}>
          <option value="">-- Select Department --</option>
          {departments.map((dept, idx) => (
            <option key={idx} value={dept}>{dept}</option>
          ))}
        </select>

        <label>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Enter any specific notes here..." />

        <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
          <FiSave /> Save Member
        </button>
      </form>
    </>
  );
}
