import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import '../style/CalendarPage.css';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import NotificationService from '../services/notification/NotificationService';
import {getDoc} from 'firebase/firestore';

type CalendarPageProps = {
  onDateSelect: (date: Date) => void;
  username: string; // nome utente
  tipoUtente: 'medico' | 'paziente'; // tipo utente
};

const salvaIdOneSignal = async (
  username: string,
  externalId: string | null,
  subscriptionId: string | null
) => {
  console.log("Salvataggio ID OneSignal:", {
    username,
    externalId,
    subscriptionId
  });
  if (!username || !subscriptionId || !externalId) return false;

  const db = getFirestore();
  const userRef = doc(db, 'Utenti', username);

  // 🔹 Leggi i dati attuali dell'utente
  const snapshot = await getDoc(userRef);
  const datiAttuali = snapshot.exists() ? snapshot.data() : {};

  const idSalvato = datiAttuali?.oneSignalId;
  const subscriptionSalvata = datiAttuali?.onesignalIdSubscription;

  console.log("Dati attuali OneSignal:", {
    idSalvato,
    subscriptionSalvata,
    externalId,
    subscriptionId
  });

  // 🔹 Controllo se i campi esistono o se sono aggiornati
  const unoMancante = !idSalvato || !subscriptionSalvata;
  const idCambiato = idSalvato !== externalId || subscriptionSalvata !== subscriptionId;

  if (!unoMancante && !idCambiato) {
    console.log("ID OneSignal già aggiornati ✅");
    return false; // niente da fare
  }

  // 🔹 Aggiorna Firestore
  await setDoc(
    userRef,
    {
      oneSignalId: externalId,
      onesignalIdSubscription: subscriptionId,
      ultimoAggiornamentoPush: new Date()
    },
    { merge: true }
  );

  if (unoMancante) console.log("ID OneSignal salvati per la prima volta 🆕");
  else console.log("ID OneSignal aggiornati 🔄");

  return true; // aggiornato
};

const CalendarPage: React.FC<CalendarPageProps> = ({ onDateSelect, username, tipoUtente }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    const offset = (firstDay + 6) % 7; // sposta domenica alla fine
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const daysOfWeek = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];
  const days = getDaysInMonth(currentMonth);

  const handleSelect = (date: Date) => {
    setSelectedDate(date);
    onDateSelect(date); // passa la data selezionata
  };

  const monthLabel = currentMonth.toLocaleDateString('it-IT', {
    month: 'long',
    year: 'numeric',
  });

  // 🔹 Inizializzazione OneSignal
  useEffect(() => {
    console.log("📅 CalendarPage montata, inizializzazione OneSignal per:", username);
    if (!window.OneSignal ) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function (OneSignal: any) {
      try {
        console.log("🔔 Inizializzazione OneSignal...");

        // 🔹 1. Effettua login utente (IMPOSTA externalId)
        await OneSignal.login(username);
        console.log("✅ OneSignal login effettuato:", username);

        // 🔹 2. Permessi notifiche
        const permission = await OneSignal.Notifications.permission;
        if (permission !== "granted") {
          await OneSignal.Notifications.requestPermission();
        }

        // 🔹 3. Verifica sottoscrizione
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        if (!optedIn) {
          console.log("❌ Utente non iscritto alle push");
          return;
        }

        // 🔹 4. Recupera subscriptionId
        const subscriptionId = OneSignal.User.PushSubscription.id;

        // 🔹 5. ExternalId ora è lo username
        const externalId = username;

        console.log("📌 ID OneSignal correnti:", {
          externalId,
          subscriptionId
        });

        // 🔹 6. Salva su Firestore solo se necessario
        const aggiornato = await salvaIdOneSignal(
          username,
          externalId,
          subscriptionId
        );

        // 🔹 7. Invia welcome solo se nuovo device / primo salvataggio
        if (aggiornato) {
          setTimeout(async () => {
            if (tipoUtente === 'medico') {
              await NotificationService.sendWelcomeNotificationToDoctor(username);
            } else {
              await NotificationService.sendWelcomeNotificationToPatient(username);
              await NotificationService.scheduleMedicineReminders(username);
            }
          }, 2000);
        }

      } catch (err) {
        console.error("❌ Errore inizializzazione OneSignal:", err);
      }
    });

  }, [username, tipoUtente]);

  return (
    <div className="calendar-card">
      <div className="calendar-title">
        <button
          className="nav-arrow"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
          }
        >
          ‹
        </button>
        <h2 className="monthLabel">{monthLabel}</h2>
        <button
          className="nav-arrow"
          onClick={() =>
            setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
          }
        >
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}
        {days.map((date, i) => {
          const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);
          const isSelected =
            date && selectedDate && date.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={i}
              className={`date-cell ${isWeekend ? 'weekend' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => date && handleSelect(date)}
            >
              {date ? date.getDate() : ''}
            </button>
          );
        })}
      </div>

      {/* Outlet per nested routes (DoctorPage / HomePagePatient) */}
      <Outlet />
    </div>
  );
};

export default CalendarPage;
