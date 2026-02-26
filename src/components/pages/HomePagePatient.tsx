import React, { useEffect, useRef, useState } from 'react';
import CalendarPage from './CalendarPage'; 
import '../style/CalendarPage.css';
import LogoutButton from "./LogOutButton";
import PatientMessageWindow from '../Logic/usePatientLogic';
import { formatDate } from '../utils/utils';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useSecureRoute } from "../hooks/useSecureRoute";
import NotificationService from '../services/notification/NotificationService';
import { NotificationHelpers } from '../services/notification/NotificationHelpers';
import { usePatientAppLogic } from '../Logic/usePatientAppLogic';

const HomePagePatient: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');

  useEffect(() => {
    if (!username) return;
    (async () => {
      await NotificationService.sendWelcomeNotificationToPatient(username);
    })();

    if (!username) return;
    (async () => {
      await NotificationService.scheduleMedicineReminders(username);
    })();

    NotificationHelpers.startSomministrazionePollingTimer(username);

  }, [username]);

  if (!username) {
    return <p>Errore: manca il parametro "username" nella barra indirizzi.</p>;
  }

  const usernameFromURL = searchParams.get("username");
  const usernameFromStorage = sessionStorage.getItem("username");
  
  console.log("URL:", usernameFromURL, "Storage:", usernameFromStorage);

  if (usernameFromURL !== usernameFromStorage) {
    return <p>Accesso non autorizzato: URL manipolato.</p>;
  }

  const { isValid } = useSecureRoute();

  if (!isValid) {
    return <Navigate to="/" replace />; // rimanda al login
  }

  const {appointments, handleDelete} = usePatientAppLogic(username , formatDate(selectedDate));

  const tableRef = useRef<HTMLDivElement>(null);

  // Autoscroll in base all’orario
  useEffect(() => {
    if (appointments.length === 0 || !tableRef.current) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Trova appuntamento più vicino all’orario attuale
    let closestIndex = 0;
    let minDiff = Infinity;

    appointments.forEach((a, i) => {
      const [h, m] = a.ora.split(':').map(Number);
      const appMinutes = h * 60 + m;
      const diff = Math.abs(appMinutes - currentMinutes);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    // Scrolla fino al tr corrispondente
    const rows = tableRef.current.querySelectorAll('tbody tr');
    if (rows[closestIndex]) {
      const row = rows[closestIndex] as HTMLElement;
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [appointments]);

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>
          Benvenuto {username} nella pagina dedicata al calendario.
        </h1>
        <LogoutButton />
      </header>

      <div className="calendar-content">
        <CalendarPage onDateSelect={setSelectedDate} username={username} tipoUtente={'paziente'} />

        <div className="daily-program">
          <h3>Programma Giornaliero</h3>

            {appointments.length === 0 ? (
                <p>Non sono presenti appuntamenti per oggi.</p>
              ) : (
                <div className="table-wrapper" ref={tableRef}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Nome dottore</th>
                        <th>Orario</th>
                        <th>Descrizione</th>
                        <th>Elimina</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a, i) => (
                        <tr key={`${a.ora}-${i}`}>
                          <td>{a.dottore}</td>
                          <td>{a.ora}</td>
                          <td>{a.descrizione}</td>
                          <td>
                            <button
                              className="delete-button"
                              onClick={() => handleDelete(a)}
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            <PatientMessageWindow  giorno={formatDate(selectedDate)}  />
            
          
          <p className="reminder">Ricordati di contattare il tuo medico in caso di problemi.</p>
        </div>
      </div>
    </div>
  );

};


export default HomePagePatient;
