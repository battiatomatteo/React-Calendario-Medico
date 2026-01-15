import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import '../style/CalendarPage.css';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import NotificationService from '../services/notification/NotificationService';

type CalendarPageProps = {
  onDateSelect: (date: Date) => void;
  username: string; // 👈 nome utente
  tipoUtente: 'medico' | 'paziente'; // tipo utente
};

const salvaIdOneSignal = async (
  oneSignalId: string | null,
  username: string,
  subscriptionId: string
) => {
  if (!username) return;
  const db = getFirestore();
  const userRef = doc(db, 'Utenti', username);

  await setDoc(
    userRef,
    {
      oneSignalId,
      onesignalIdSubscription: subscriptionId,
    },
    { merge: true }
  );
};

declare global {
  interface Window {
    OneSignal: any;
    OneSignalDeferred: any[];
  }
}


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
    if (!window.OneSignal || !username) return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal: any) {
      await OneSignal.Notifications.requestPermission();

      let oneSignalId = null;
      let subscriptionId = null;

      if (OneSignal.User && typeof OneSignal.User.getId === 'function') {
        oneSignalId = await OneSignal.User.getId();
      } else {
        oneSignalId = await OneSignal.getUserId();
      }

      if (OneSignal.User && typeof OneSignal.User.getSubscriptionId === 'function') {
        subscriptionId = await OneSignal.User.getSubscriptionId();
      } else {
        subscriptionId = OneSignal.User.PushSubscription.id;
      }

      if (oneSignalId && subscriptionId) {
        await salvaIdOneSignal(oneSignalId, username, subscriptionId);

        setTimeout(async () => {
          if (tipoUtente === 'medico') {
            await NotificationService.sendWelcomeNotificationToDoctor(username);
          } else {
            await NotificationService.sendWelcomeNotificationToPatient(username);
            await NotificationService.scheduleMedicineReminders(username);
          }
        }, 3000);
      }

      OneSignal.User.setExternalId(window.navigator.userAgent);
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
