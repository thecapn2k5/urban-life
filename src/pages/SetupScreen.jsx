import { useState } from 'react';

export default function SetupScreen({ onComplete }) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1 = enter pin, 2 = confirm pin
  const [error, setError] = useState('');

  const handleKeyPress = (num) => {
    if (error) setError('');
    if (step === 1) {
      if (pin.length < 4) setPin(pin + num);
    } else {
      if (confirmPin.length < 4) setConfirmPin(confirmPin + num);
    }
  };

  const handleBackspace = () => {
    if (step === 1) setPin(pin.slice(0, -1));
    else setConfirmPin(confirmPin.slice(0, -1));
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (pin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      setStep(2);
    } else {
      if (pin === confirmPin) {
        onComplete(pin);
      } else {
        setError('PINs do not match. Try again.');
        setConfirmPin('');
        setStep(1);
        setPin('');
      }
    }
  };

  const currentPin = step === 1 ? pin : confirmPin;

  return (
    <div className="app-container" style={{ justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2>{step === 1 ? 'Create App PIN' : 'Confirm App PIN'}</h2>
        <p>This PIN encrypts your notes on your device.</p>
        
        {error && <p style={{ color: 'var(--danger-color)', marginTop: '8px' }}>{error}</p>}
        
        <div className="pin-display">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`pin-dot ${i < currentPin.length ? 'filled' : ''}`} />
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
          <button className="pin-btn" onClick={handleSubmit} style={{ background: 'var(--accent-color)', color: 'white' }}>✓</button>
        </div>
      </div>
    </div>
  );
}
