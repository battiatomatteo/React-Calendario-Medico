import React, { useState } from 'react';
import { useRegistrationLogic } from '../Logic/useRegistrationLogic';
import type { RegistrationFormProps } from '../../script/types';
import '../style/Registration.css';

const RegistrationPage: React.FC = () => {
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

  const [isVisible, setIsVisible] = useState(true);

  const { handleSubmit, regError, userError } =
    useRegistrationLogic(formData, setFormData, setIsVisible);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangeAscii = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const last = value.slice(-1);
    if (!value.localeCompare('') || /^[a-zA-Z\s]$/.test(last)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeAsciiNoBlankSpace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const last = value.slice(-1);
    if (!value.localeCompare('') || /^[a-zA-Z]$/.test(last)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeCod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const last = value.slice(-1);
    if (!value.localeCompare('') || /^[a-zA-Z0-9]$/.test(last)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeTel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="conteiner">
      <div className="conteiner3">
        <h3>Pagina di Registrazione</h3>
        <form onSubmit={handleSubmit}>
          <div className="box">
            <label className="LogInLabel">Username</label>
            <input
              type="text"
              name="usernameOrMail"
              placeholder="username"
              required
              value={formData.usernameOrMail}
              onChange={handleChangeAsciiNoBlankSpace}
            />
            {userError && <div className="error-message">{userError}</div>}

            <label className="LogInLabel">Password</label>
            <input
              type="password"
              name="password"
              placeholder="password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <label className="LogInLabel">Nome</label>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              required
              value={formData.nome}
              onChange={handleChangeAscii}
            />

            <label className="LogInLabel">Cognome</label>
            <input
              type="text"
              name="cognome"
              placeholder="Cognome"
              required
              value={formData.cognome}
              onChange={handleChangeAscii}
            />

            <label className="LogInLabel">Mail</label>
            <input
              type="email"
              name="mail"
              placeholder="mail"
              required
              value={formData.mail}
              onChange={handleChange}
            />

            <label className="LogInLabel">Codice Fiscale</label>
            <input
              type="text"
              name="codiceFiscale"
              placeholder="Codice Fiscale"
              required
              value={formData.codiceFiscale}
              onChange={handleChangeCod}
            />

            <label className="LogInLabel">Numero di Telefono</label>
            <input
              type="number"
              name="numeroTelefono"
              placeholder="Numero di Telefono"
              required
              value={formData.numeroTelefono}
              onChange={handleChangeTel}
            />

            <label className="LogInLabel">Città di nascita</label>
            <input
              type="text"
              name="città"
              placeholder="Città"
              required
              value={formData.città}
              onChange={handleChangeAscii}
            />

            <label className="LogInLabel">Data di nascita</label>
            <input
              type="date"
              name="dataDiNascita"
              required
              value={formData.dataDiNascita}
              onChange={handleChange}
            />

            
          </div>

          {regError && <div className="error-message">{regError}</div>}
          <br />
          <input type="submit" className='reg' value="Registrati" />
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;