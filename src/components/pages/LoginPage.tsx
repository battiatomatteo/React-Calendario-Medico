import React, { useState } from 'react';
import { useLoginLogic } from '../Logic/useLoginLogic';
import type { RegistrationFormProps } from '../../script/types';
import '../style/LogIn.css';
import Logger from '../services/logger/LoggerService';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormProps>({
    nome: '',
    cognome: '',
    password: '',
    usernameOrMail: '',
    mail: '',
    codiceFiscale: '',
    numeroTelefono: '',
    città: '',
    dataDiNascita: '',
  });

  Logger.configure({
    enabled: true,
    level: import.meta.env.MODE === "production" ? "info" : "debug",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Username: accetta lettere e numeri, niente spazi
  const handleChangeAsciiNoBlankSpace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const last = value.slice(-1);
    if (!value.localeCompare('') || /^[a-zA-Z0-9]$/.test(last)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const { onSubmit, loginError } = useLoginLogic(formData);

  return (
    <div className="conteiner">
      <div className="conteiner2">
        <h3>Pagina di LogIn</h3>
        <form onSubmit={onSubmit} className="form">
          <label className="LogInLabel">Username o mail</label>
          <input
            type="text"
            name="usernameOrMail"
            placeholder="username"
            required
            value={formData.usernameOrMail}
            onChange={handleChangeAsciiNoBlankSpace}
          />

          <label className="LogInLabel">Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? '🙈 Nascondi' : '👁 Mostra'}
            </button>
          </div>

          {loginError && <div className="error-message">{loginError}</div>}
          <input type="submit" value="LogIn" />
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
