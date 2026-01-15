import React, { useState } from 'react';
import CalendarPage from "./CalendarPage";
import { DoctorPanel } from './DoctorPanel';
import '../style/CalendarPage.css';
import LogoutButton from "./LogOutButton";
import { Navigate, useSearchParams } from 'react-router-dom';
import SearchPatient from './SearchPatient';
import { useSecureRoute } from "../hooks/useSecureRoute";


const DoctorPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchParams] = useSearchParams();
  const usernameFromURL = searchParams.get("username");
  const usernameFromStorage = sessionStorage.getItem("username");

  console.log("URL:", usernameFromURL, "Storage:", usernameFromStorage);
  
  // Validazione: impedisce accesso se l'URL è stato manipolato
  if (usernameFromURL !== usernameFromStorage) {
    return <p>Accesso non autorizzato: URL manipolato.</p>;
  }

  const { isValid } = useSecureRoute();

  if (!isValid) {
    return <Navigate to="/" replace />; // 👈 rimanda al login
  }

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>Benvenuto Dottore, gestisci i tuoi appuntamenti.</h1>
        <LogoutButton />
      </header>

      <div className="calendar-content">
        <CalendarPage onDateSelect={setSelectedDate} username={''} tipoUtente={'medico'}/>
        <DoctorPanel selectedDate={selectedDate} />
      </div>
      <div>
        <SearchPatient />
      </div>
      
    </div>
  );
};

export default DoctorPage;
