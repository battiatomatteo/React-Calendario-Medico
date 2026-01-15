import React, { useState } from 'react';
import '../style/CalendarPage.css'; // riutilizziamo lo stile esistente
import PatientFolder from './PatientFolder';

export const SearchPatient: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);

  const handleSearch = () => {
    if (patientName.trim()) {
      setSearchTriggered(true);
      // qui potrai aggiungere la logica per mostrare i dati
    }
  };

  const handleClose = () => {
    setPatientName('');
    setSearchTriggered(false);
  };

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>Visiona il tuo paziente</h1>
      </header>

      <div className="calendar-content">
        <div className="daily-program">
          {!searchTriggered ? (
            <>
              <p>Inserire il nome del paziente che si desidera osservare :</p>
              <input
                type="text"
                className="search-input"
                placeholder="nome paziente"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="close-button" onClick={handleSearch}>Cerca</button>
              </div>
            </>
          ) : (
            <div>
              {searchTriggered && (
                <div>
                  <PatientFolder patientName={patientName} />
                  <button className="close-button" onClick={handleClose}>Chiudi</button>
                </div>
              )}
            </div>
          )}
          
        </div>

        
      </div>
    </div>
  );
};

export default SearchPatient;