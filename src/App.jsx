import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './db/db';
import { hashPin } from './utils/crypto';
import SetupScreen from './pages/SetupScreen';
import LockScreen from './pages/LockScreen';
import MemberList from './pages/MemberList';
import MemberForm from './pages/MemberForm';
import MemberDetails from './pages/MemberDetails';
import DepartmentsList from './pages/DepartmentsList';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [hasPinSetup, setHasPinSetup] = useState(false);
  const [activePin, setActivePin] = useState(null); // The plaintext PIN used for encryption session

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const storedHash = await db.getSettings('pin_hash');
      if (storedHash && storedHash.value) {
        setHasPinSetup(true);
      }
    } catch (e) {
      console.error("Error reading db settings", e);
    }
    setIsReady(true);
  };

  const handleSetupComplete = async (pin) => {
    const hash = hashPin(pin);
    await db.saveSettings('pin_hash', hash);
    setHasPinSetup(true);
    setActivePin(pin); // automatically log in upon setup
  };

  const handleUnlock = (pin) => {
    setActivePin(pin);
  };

  if (!isReady) return <div className="app-container">Loading...</div>;

  // 1. App needs initial setup
  if (!hasPinSetup) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  // 2. App is locked
  if (hasPinSetup && !activePin) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  // 3. App is unlocked - Main Router
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<MemberList pin={activePin} />} />
          <Route path="/add" element={<MemberForm pin={activePin} />} />
          <Route path="/edit/:id" element={<MemberForm pin={activePin} />} />
          <Route path="/member/:id" element={<MemberDetails pin={activePin} />} />
          <Route path="/departments" element={<DepartmentsList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
