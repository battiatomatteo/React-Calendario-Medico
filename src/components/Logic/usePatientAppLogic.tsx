import { 
  collection, 
  deleteDoc, 
  doc, 
  getDocs, 
  query,
  where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/Firebase";

export type Appointment = {
  ora: string;
  paziente: string;
  descrizione: string;
  dottore: string;
};

export function usePatientAppLogic(username: string, selectedDate: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const getDoctorsUsernames = async (): Promise<string[]> => {
    try {
      const utentiRef = collection(db, "Utenti");

      const q = query(
        utentiRef,
        where("tipo_utente", "==", "medico")
      );

      const snapshot = await getDocs(q);

      const doctors: string[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return data.usernameOrMail;
      });

      console.log("🩺 Medici trovati:", doctors);

      return doctors;

    } catch (error) {
      console.error("Errore nel recupero dei medici:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        console.log("📅 Data selezionata:", selectedDate);
        console.log("👤 Username:", username);

        const doctors = await getDoctorsUsernames();

        if (doctors.length === 0) {
          console.log("❌ Nessun medico trovato");
          setAppointments([]);
          return;
        }

        const allAppointments: Appointment[] = [];

        await Promise.all(
          doctors.map(async (dottore) => {

            const colRef = collection(
              db,
              `Appuntamenti/${selectedDate}/${dottore}`
            );

            const snapshot = await getDocs(colRef);

            if (snapshot.empty) {
              console.log(`⚠️ Nessun appuntamento per ${dottore} in ${selectedDate}`);
              return;
            }

            console.log(
              `📂 Slot trovati per ${dottore}:`,
              snapshot.docs.map(doc => doc.id)
            );

            snapshot.forEach((slotDoc) => {
              const data = slotDoc.data() as {
                paziente: string;
                descrizione: string;
              };

              if (data.paziente === username) {
                console.log("✅ MATCH TROVATO:", slotDoc.id, "Dottore:", dottore);

                allAppointments.push({
                  ora: slotDoc.id,
                  paziente: data.paziente,
                  descrizione: data.descrizione,
                  dottore,
                });
              }
            });
          })
        );

        allAppointments.sort((a, b) => {
          const [ah, am] = a.ora.split(":").map(Number);
          const [bh, bm] = b.ora.split(":").map(Number);
          return ah * 60 + am - (bh * 60 + bm);
        });

        console.log("📋 Appuntamenti finali:", allAppointments);

        setAppointments(allAppointments);

      } catch (error) {
        console.error("🔥 Errore nel caricamento appuntamenti:", error);
      }
    };

    if (selectedDate && username) {
      loadAppointments();
    }

  }, [selectedDate, username]);

  const handleDelete = async (appointment: Appointment) => {
    try {
      const docRef = doc(
        db,
        `Appuntamenti/${selectedDate}/${appointment.dottore}/${appointment.ora}`
      );

      await deleteDoc(docRef);

      console.log("🗑️ Appuntamento eliminato:", appointment);

      // aggiorna stato locale
      setAppointments(prev =>
        prev.filter(
          a =>
            !(
              a.ora === appointment.ora &&
              a.dottore === appointment.dottore
            )
        )
      );

    } catch (error) {
      console.error("🔥 Errore nella cancellazione:", error);
    }
  };

  return { 
    appointments,
    handleDelete
  };
}
