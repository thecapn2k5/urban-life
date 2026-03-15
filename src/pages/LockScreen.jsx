import { useState } from 'react';
import { db } from '../db/db';
import { hashPin } from '../utils/crypto';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleKeyPress = (num) => {
    if (error) setError('');
    if (pin.length < 4) setPin(pin + num);
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleUnlock = async () => {
    if (!pin) return;
    try {
      const storedHash = await db.getSettings('pin_hash');
      if (storedHash && storedHash.value === hashPin(pin)) {
        onUnlock(pin);
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
    } catch (e) {
      setError('Error verifying PIN');
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>Enter PIN</h2>
        <p>Unlock your secure notes</p>
        
        {error && <p style={{ color: 'var(--danger-color)', marginTop: '8px' }}>{error}</p>}
        
        <div className="pin-display">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="pin-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} className="pin-btn" onClick={() => handleKeyPress(num)}>
              {num}
            </button>
          ))}
          <button className="pin-btn" onClick={handleBackspace}>⌫</button>
          <button className="pin-btn" onClick={() => handleKeyPress(0)}>0</button>
          <button className="pin-btn" onClick={handleUnlock} style={{ background: 'var(--accent-color)', color: 'white' }}>✓</button>
        </div>
      </div>
    </div>
  );
}
