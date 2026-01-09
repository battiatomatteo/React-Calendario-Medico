import { useState, useEffect } from 'react';
import { formatDate } from '../utils/utils';
import { db } from '../../lib/Firebase';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';

export type Appointment = {
  ora: string; // formato "HH:mm"
  paziente: string;
  descrizione: string;
};

interface Paziente {
  id: string;
  nome?: string;
  cognome?: string;
  codice_fiscale?: string;
  // aggiungi altri campi se servono
}

export const useDoctorPanelLogic = (selectedDate: Date, doctorName: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({ paziente: '', descrizione: '', hour: '', minute: '' });

  const giornoKey = formatDate(selectedDate); // es. "08-08-2025"

  // 🔹 Carica appuntamenti da Firestore
  useEffect(() => {
    const loadAppointments = async () => {
      if (!doctorName) return;

      try {
        const basePath = `Appuntamenti/${giornoKey}/${doctorName}`;
        const slotCollection = collection(db, basePath);
        const snapshot = await getDocs(slotCollection);

        const list: Appointment[] = snapshot.docs.map(doc => ({
          ora: doc.id,
          ...doc.data(),
        })) as Appointment[];

        // ordina subito per orario
        list.sort((a, b) => {
          const [ah, am] = a.ora.split(":").map(Number);
          const [bh, bm] = b.ora.split(":").map(Number);
          return ah * 60 + am - (bh * 60 + bm);
        });

        setAppointments(list);
      } catch (error) {
        console.error("Errore nel caricamento appuntamenti:", error);
      }
    };

    loadAppointments();
  }, [giornoKey, doctorName]);

  // 🔹 Funzione di controllo paziente
  const checkPatientExists = async (patientName: string): Promise<boolean> => {
    try {
      const snapshot = await getDocs(collection(db, "Pazienti"));
      const patients: Paziente[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Paziente[];


      // controlla se esiste un paziente con quel nome (campo "nome" o id documento)
      return patients.some(p => p.nome === patientName || p.id === patientName);
    } catch (err) {
      console.error("Errore nel controllo paziente:", err);
      return false;
    }
  };

  // 🔹 Salva appuntamento in Appuntamenti/giorno/nomeMedico/ora:minuti
  const handleSave = async () => {
    if (!doctorName) return;

    // controllo paziente
    if (!form.paziente) {
      alert("Inserisci il nome del paziente.");
      return;
    }

    const exists = await checkPatientExists(form.paziente);
    if (!exists) {
      alert("Il paziente non esiste nel database.");
      return;
    }

    const oraSlot = `${form.hour.padStart(2, '0')}:${form.minute.padStart(2, '0')}`;
    const docPath = `Appuntamenti/${giornoKey}/${doctorName}/${oraSlot}`;

    const newAppointment: Appointment = {
      ora: oraSlot,
      paziente: form.paziente,
      descrizione: form.descrizione,
    };

    try {
      await setDoc(doc(db, docPath), {
        paziente: newAppointment.paziente,
        descrizione: newAppointment.descrizione,
      });

      // aggiorna lo stato locale ordinato
      const updatedAppointments = [...appointments, newAppointment].sort((a, b) => {
        const [ah, am] = a.ora.split(":").map(Number);
        const [bh, bm] = b.ora.split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });

      setAppointments(updatedAppointments);

      // reset form
      setForm({ paziente: '', descrizione: '', hour: '', minute: '' });
    } catch (error) {
      console.error("Errore nel salvataggio appuntamento:", error);
    }
  };

  return {
    form,
    setForm,
    appointments,
    handleSave,
    giornoKey,
  };
};
