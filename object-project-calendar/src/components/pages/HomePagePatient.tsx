import React, { useEffect, useState } from 'react';
import CalendarPage from './CalendarPage'; 
import '../style/CalendarPage.css';
import LogoutButton from "./LogOutButton";
import PatientMessageWindow from '../Logic/usePatientLogic';
import { formatDate } from '../utils/utils';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useSecureRoute } from "../hooks/useSecureRoute";
import NotificationService from '../services/notification/NotificationService';
import { NotificationHelpers } from '../services/notification/NotificationHelpers';

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
      await NotificationService.sendWelcomeNotificationToPatient(username);
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

            <PatientMessageWindow  giorno={formatDate(selectedDate)}  />
            
          
          <p className="reminder">Ricordati di contattare il tuo medico in caso di problemi.</p>
        </div>
      </div>
    </div>
  );
};


export default HomePagePatient;