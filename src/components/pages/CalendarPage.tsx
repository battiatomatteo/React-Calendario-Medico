import React, { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
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
  externalId: string | null | undefined,
  subscriptionId: string | null | undefined
) => {
  const externalIdFinal = externalId ?? "undefined";
  const subscriptionIdFinal = subscriptionId ?? "undefined";

  console.log("💾 Salvataggio OneSignal:", {
    username,
    externalId: externalIdFinal,
    subscriptionId: subscriptionIdFinal
  });

  const db = getFirestore();
  const userRef = doc(db, 'Utenti', username);

  const snapshot = await getDoc(userRef);
  const datiAttuali = snapshot.exists() ? snapshot.data() : {};

  const cambiato =
    datiAttuali?.oneSignalExternalId !== externalIdFinal ||
    datiAttuali?.oneSignalSubscriptionId !== subscriptionIdFinal;

  if (!cambiato) {
    console.log("✅ OneSignal già aggiornati");
    return false;
  }

  await setDoc(
    userRef,
    {
      oneSignalExternalId: externalIdFinal,
      oneSignalSubscriptionId: subscriptionIdFinal,
      ultimoAggiornamentoPush: new Date()
    },
    { merge: true }
  );

  console.log("🔄 OneSignal aggiornati");
  return true;
};

const CalendarPage: React.FC<CalendarPageProps> = ({ onDateSelect, username, tipoUtente }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchParams] = useSearchParams();
  const username_ = searchParams.get('username');

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

    if (!window.OneSignal || !username) return;

    console.log("🔔 OneSignal disponibile, inizializzo...", username);

    window.OneSignalDeferred = window.OneSignalDeferred || [];

    window.OneSignalDeferred.push(async function (OneSignal: any) {
      try {

        console.log("🔔 Init OneSignal...");

        // 1️⃣ Permesso notifiche
        const permission = await OneSignal.Notifications.permission;
        if (permission !== "granted") {
          await OneSignal.Notifications.requestPermission();
        }

        // 2️⃣ Aspetta che la subscription sia pronta
        const optedIn = OneSignal.User.PushSubscription.optedIn;
        if (!optedIn) {
          console.log("❌ Non subscribed");
          return;
        }

        const subscriptionId = OneSignal.User.PushSubscription.id;
        console.log("✅ Subscription attiva:", subscriptionId);

        // 3️⃣ ORA fai login (collega externalId al device)
        await OneSignal.login(username);
        console.log("✅ Login fatto:", username);

        const externalId = OneSignal.User.externalId;

        // 4️⃣ Salva su Firestore
        await salvaIdOneSignal(
          username,
          externalId,
          subscriptionId
        );

      } catch (err) {
        console.error("❌ Errore OneSignal:", err);
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
