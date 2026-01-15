import React, { useEffect, useRef } from 'react';
import '../style/DoctorPanel.css';
import { useDoctorPanelLogic } from '../Logic/useDoctorPanelLogic';
import { useSearchParams } from 'react-router-dom';
import NotificationService from '../services/notification/NotificationService';


export const DoctorPanel: React.FC<{ selectedDate: Date }> = ({ selectedDate }) => {
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get('username');

  useEffect(() => {
    if (!doctorName) return;
    (async () => {
      await NotificationService.sendWelcomeNotificationToDoctor(doctorName);
    })();
  }, [doctorName]);


  if (!doctorName) {
    return <p>Errore: manca il parametro "username" nella barra indirizzi.</p>;
  }

  const {
    form,
    setForm,
    appointments,
    handleSave,
    giornoKey,
  } = useDoctorPanelLogic(selectedDate, doctorName);

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
    <div className="daily-program scroll-pane">
      <strong>I tuoi appuntamenti del giorno, {giornoKey}:</strong>

      {appointments.length === 0 ? (
        <p>Non sono presenti appuntamenti per oggi.</p>
      ) : (
        <div className="table-wrapper" ref={tableRef}>
          <table className="table">
            <thead>
              <tr>
                <th>Nome paziente</th>
                <th>Orario</th>
                <th>Descrizione</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, i) => (
                <tr key={`${a.ora}-${i}`}>
                  <td>{a.paziente}</td>
                  <td>{a.ora}</td>
                  <td>{a.descrizione}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* form nuovo appuntamento */}
      <h4>Crea un nuovo appuntamento:</h4>
      <label>Paziente : </label>
      <input
        className="input-paziente"
        type="text"
        value={form.paziente}
        onChange={(e) => setForm({ ...form, paziente: e.target.value })}
      />
      <br />
      <label>Descrizione : </label>
      <textarea
        value={form.descrizione}
        onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
      />

      <label>Orario : </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder="Ore (0-23)"
          value={form.hour}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, ""); // 👈 solo numeri
            if (val.length <= 2) {
              setForm({ ...form, hour: val });
            }
          }}
          maxLength={2}
        />

        <input
          type="text"
          placeholder="Minuti (0-59)"
          value={form.minute}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 2) {
              setForm({ ...form, minute: val });
            }
          }}
          maxLength={2}
        />
      </div>

      <p className="reminder">
        La nota verrà salvata come documento <strong>{form.hour.padStart(2, '0')}:{form.minute.padStart(2, '0')}</strong> sotto il medico <strong>{doctorName}</strong> per il giorno <strong>{giornoKey}</strong>.
      </p>

      <button className="close-button" onClick={handleSave}>Salva</button>
    </div>
  );
};

export default DoctorPanel;
