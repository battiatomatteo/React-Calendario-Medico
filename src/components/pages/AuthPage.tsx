import React, { useState } from 'react';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import '../style/Registration.css';

const AuthPage: React.FC = () => {
  // false = login, true = registrazione
  const [isRegistrationVisible, setIsRegistrationVisible] = useState(false);

  return (
    <div className="auth-container">
      {/* Mostra Login o Registrazione */}
      {isRegistrationVisible ? <RegistrationPage /> : <LoginPage />}

      {/* Bottone per alternare */}
      <div className="calendar-container" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          className="close-button"
          onClick={() => setIsRegistrationVisible(!isRegistrationVisible)}
        >
          {isRegistrationVisible ? 'Torna al LogIn' : 'Crea un nuovo account'}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
