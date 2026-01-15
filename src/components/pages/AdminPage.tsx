import React from "react";
import Section from "../utils/Section"; // importa il tuo componente Section
import { useAdminPageLogic } from "../Logic/useAdminPageLogic";
import "../style/AdminPage.css";
import { useSearchParams, Navigate } from "react-router-dom";
import { useSecureRoute } from "../hooks/useSecureRoute";

const AdminPage: React.FC = () => {
  const {
    handleLogout,
    utenti,
    openSection,
    toggleSection,
    nomePazienteControllo,
    handleNomePazienteControlloChange,
    cerca,
    paziente,
    selectedValue,
    handleChange,
    cercaSomministrazioni,
    listaSomministrazioni,
    medicine,
    isVisible,
    setIsVisible,
    id_medicina,
    handleNomeFarmacoChange,
    dosaggio_medicina,
    handleDosaggioFarmacoChange,
    note_medicina,
    handleNoteFarmacoChange,
    tipo_medicina,
    handleTipoFarmacoChange,
    tempo_ongi_dosaggio,
    handleTempoDosChange,
    salva,

    // per gestione utenti
    isVisibleUser,
    setIsVisibleUser,
    id_user,
    nome_user,
    cognome_user,
    username_user,
    codiceFiscale_user,
    mail_user,
    telefono_user,
    citta_user,
    dataNascita_user,
    tipo_user,
    password_user,
    handleIdUserChange,
    handleNomeUserChange,
    handleCognomeUserChange,
    handleUsernameUserChange,
    handleCodiceFiscaleUserChange,
    handleMailUserChange,
    handleTelefonoUserChange,
    handleCittaUserChange,
    handleDataNascitaUserChange,
    handleTipoUserChange,
    handlePasswordUserChange,
    salvaUser,
    errorUser,
    setErrorUser,
  } = useAdminPageLogic();


  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  const usernameFromURL = searchParams.get("username");
  const usernameFromStorage = sessionStorage.getItem("username");
  
  console.log("URL:", usernameFromURL, "Storage:", usernameFromStorage);

  if (usernameFromURL !== usernameFromStorage) {
    return <p>Accesso non autorizzato: URL manipolato.</p>;
  }

  const { isValid } = useSecureRoute();

  if (!isValid) {
    return <Navigate to="/" replace />; // 👈 rimanda al login
  }

  return (
    <div className="container">
        <div className="admin-header">
            <span className="admin-welcome">Benvenuto Admin</span>
            <button className="LogOutButton" onClick={handleLogout}>Logout</button>
        </div>


      {/* --- Tabella Utenti --- */}
       <Section title="Tabella Utenti" isOpen={openSection === 1} onToggle={() => toggleSection(1)}>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>nome</th>
                <th>cognome</th>
                <th>usernameOrMail</th>
                <th>codiceFiscale</th>
                <th>mail</th>
                <th>numeroTelefono</th>
                <th>città</th>
                <th>dataDiNascita</th>
                <th>tipoUtente</th>
              </tr>
            </thead>
            <tbody>
              {utenti.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.nome}</td>
                  <td>{row.cognome}</td>
                  <td>{row.usernameOrMail}</td>
                  <td>{row.codice_fiscale}</td>
                  <td>{row.mail}</td>
                  <td>{row.numero_di_telefono}</td>
                  <td>{row.città}</td>
                  <td>{row.data_di_nascita}</td>
                  <td>{row.tipo_utente}</td>
                </tr>
              ))}
              {isVisibleUser && (
                <tr>
                  <td><input type="text" className="inputTableMedicine" placeholder="ID" value={id_user} onChange={handleIdUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Nome" value={nome_user} onChange={handleNomeUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Cognome" value={cognome_user} onChange={handleCognomeUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Username/Mail" value={username_user} onChange={handleUsernameUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Codice Fiscale" value={codiceFiscale_user} onChange={handleCodiceFiscaleUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Mail" value={mail_user} onChange={handleMailUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Telefono" value={telefono_user} onChange={handleTelefonoUserChange}/></td>
                  <td><input type="text" className="inputTableMedicine" placeholder="Città" value={citta_user} onChange={handleCittaUserChange}/></td>
                  <td><input type="date" className="inputTableMedicine" value={dataNascita_user} onChange={handleDataNascitaUserChange}/></td>
                  <td>
                    <select className="inputTableMedicine" value={tipo_user} onChange={handleTipoUserChange}>
                      <option></option>
                      <option>medico</option>
                      <option>admin</option>
                    </select>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isVisibleUser && (
          <div className="password-row">
            <label>Password: </label>
            <input
              type="password"
              className="inputTableMedicine"
              placeholder="Inserisci password"
              value={password_user}
              onChange={handlePasswordUserChange}
            />
          </div>
        )}

        {errorUser && <p className="error-message">{errorUser}</p>}

        {isVisibleUser ? (
          <button type="submit" className="buttonApp" onClick={salvaUser}>Salva</button>
        ) : (
          <button className="buttonApp" onClick={() => setIsVisibleUser(true)}>Aggiungi Medico/Admin</button>
        )}
      </Section>



      {/* --- Dati Pazienti --- */}
      <Section title="Dati Pazienti" isOpen={openSection === 2} onToggle={() => toggleSection(2)}>
        <div>
          <label>Inserire il nome del Paziente che si desidera osservare : </label>
          <input
            type="text"
            placeholder="Nome Paziente"
            className="inputTableMedicine"
            value={nomePazienteControllo}
            onChange={handleNomePazienteControlloChange}
          />
          <br />
          <button type="submit" name="cerca" className="buttonApp" onClick={cerca}>Cerca</button>

          {paziente.length === 0 ? (
            <p>Questo paziente al momento non prende medicine o non è registrato. </p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome del farmaco</th>
                  <th>dataAggiunta</th>
                  <th>data_fine</th>
                  <th>countVolte</th>
                  <th>Numero Medicine Inizio</th>
                </tr>
              </thead>
              <tbody>
                {paziente.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.dataAggiunta}</td>
                    <td>{row.data_fine}</td>
                    <td>{row.countVolte}</td>
                    <td>{row.numMedicinaInizio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {paziente.length === 0 ? null : (
            <div>
              <p><b>Tabella con tutte le medicine di questo paziente. </b></p>
              <select
                name="menuMedicine"
                className="inputApp"
                value={selectedValue}
                onChange={handleChange}
              >
                <option value="">Seleziona un farmaco</option>
                {paziente.map((med) => (
                  <option key={med.id}>{med.id}</option>
                ))}
              </select>
              <br />
              <button type="submit" name="cerca" className="buttonApp" onClick={cercaSomministrazioni}>Cerca</button>

              {listaSomministrazioni.length === 0 ? null : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID_somministrazione</th>
                      <th>Data_somministrazione</th>
                      <th>Ore</th>
                      <th>Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaSomministrazioni.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.data_somministrazione}</td>
                        <td>{row.ore}</td>
                        <td>{row.stato ? "true" : "false"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </Section>

      {/* --- Tabella Medicine --- */}
      <Section title="Tabella Medicine" isOpen={openSection === 3} onToggle={() => toggleSection(3)}>
        <table className="table">
          <thead>
            <tr>
              <th>Nome del farmaco</th>
              <th>Dosaggio</th>
              <th>note</th>
              <th>tipo_farmaco</th>
              <th>Tempo tra ogni dosaggio</th>
            </tr>
          </thead>
          <tbody>
            {medicine.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.dosaggio}</td>
                <td>{row.note}</td>
                <td>{row.tipo_farmaco}</td>
                <td>{row.tempo_dosaggio}</td>
              </tr>
            ))}
            {isVisible && (
              <tr>
                <td><input type="text" className="inputTableMedicine" placeholder="nome farmaco" value={id_medicina} onChange={handleNomeFarmacoChange}/></td>
                <td><input type="number" className="inputTableMedicine" placeholder="dosaggio" value={dosaggio_medicina} onChange={handleDosaggioFarmacoChange}/></td>
                <td><input type="text" className="inputTableMedicine" placeholder="note" value={note_medicina} onChange={handleNoteFarmacoChange}/></td>
                <td>
                  <select className="inputTableMedicine" value={tipo_medicina} onChange={handleTipoFarmacoChange}>
                    <option></option>
                    <option>Pastiglia</option>
                    <option>Spruzzo</option>
                    <option>Liquido</option>
                  </select>
                </td>
                <td><input type="text" className="inputTableMedicine" placeholder="tempo tra ogni dosaggio" value={tempo_ongi_dosaggio} onChange={handleTempoDosChange}/></td>
              </tr>
            )}
          </tbody>
        </table>
        {isVisible ? (
          <button type="submit" name="salva" className="buttonApp" onClick={salva}>Salva</button>
        ) : (
          <button className="buttonApp" onClick={() => setIsVisible(!isVisible)}>Aggiungi una nuova medicina</button>
        )}
      </Section>
    </div>
  );
};

export default AdminPage;
