import { db } from '../../../lib/Firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';

// Classe helper per le notifiche
// Contiene metodi statici per recuperare dati e contare appuntamenti e medicine
// necessari per le notifiche
export class NotificationHelpers {
  // Recupera i dati di un utente dal Firestore
  static async getUserData(username: string) { // Recupera i dati di un utente dal Firestore
    const userRef = doc(db, 'Utenti', username); // Riferimento al documento dell'utente
    const userSnap = await getDoc(userRef);  // Recupera il documento
    return userSnap.exists() ? userSnap.data() : null; // Restituisce i dati se esistono, altrimenti null
  }

  static async getPatientData(username: string) { // Recupera i dati di un paziente dal Firestore
    const patientRef = doc(db, 'Pazienti', username, 'Medicine_paziente'); // Riferimento al documento del paziente
    console.log(`Recupero dati paziente per ${username}, riferimento:`, patientRef);
    const patientSnap = await getDoc(patientRef); // Recupera il documento
    return patientSnap.exists() ? patientSnap.data() : null; // Restituisce i dati se esistono, altrimenti null
  }

  static async getTodayPendingSomministrazioni(
    username: string,
    today: string
  ): Promise<{ stato: boolean; ore: string; medicineName: string }[]> {
    try {
      const result: { stato: boolean; ore: string; medicineName: string }[] = [];

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const medicineRef = collection(db, 'Pazienti', username, 'Medicine_paziente');
      const medicineSnap = await getDocs(medicineRef);

      for (const medicineDoc of medicineSnap.docs) {
        const medicineName = medicineDoc.id;

        const somministrazioniRef = collection(
          db,
          'Pazienti',
          username,
          'Medicine_paziente',
          medicineName,
          'somministrazioni'
        );

        const somministrazioniSnap = await getDocs(somministrazioniRef);

        somministrazioniSnap.forEach((sommDoc) => {
          const sommData = sommDoc.data();

          // 1️⃣ Deve essere prevista per oggi
          if (sommData.data_somministrazione !== today) return;

          // 2️⃣ Stato deve essere false
          if (sommData.stato !== false) return;

          // 3️⃣ L'ora non deve superare quella attuale
          const [h, m] = sommData.ore.split(":").map(Number);
          const sommMinutes = h * 60 + m;

          if (sommMinutes <= currentMinutes) {
            result.push({
              stato: sommData.stato,
              ore: sommData.ore,
              medicineName
            });
          }
        });
      }

      return result;

    } catch (error) {
      console.error("Errore getTodayPendingSomministrazioni:", error);
      return [];
    }
  }



  static getTodayString(): string {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");      // 1 -> "01"
    const month = String(today.getMonth() + 1).padStart(2, "0"); // 3 -> "03"
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
  }


  static async getAppointmentsCount(username: string, date: string): Promise<number> { // Conta gli appuntamenti per un utente in una data specifica
    try {
      const appointmentsRef = collection(db, 'Appuntamenti', date, username); // Riferimento alla collezione degli appuntamenti
      const appointmentsSnap = await getDocs(appointmentsRef); // Recupera i documenti degli appuntamenti
      return appointmentsSnap.size; // Restituisce il numero di appuntamenti
    } catch (error) {
      console.error('Errore conteggio appuntamenti:', error);
      return 0;
    }
  }

  static async getTodayMedicinesCount(username: string, today: string): Promise<number> { // Conta le medicine da somministrare oggi per un paziente
    try {
      const medicineRef = collection(db, 'Pazienti', username, 'Medicine_paziente'); // Riferimento alla collezione delle medicine del paziente
      const medicineSnap = await getDocs(medicineRef); // Recupera i documenti delle medicine

      let totalMedicinesCount = 0; // Inizializza il contatore delle medicine
      for (const medicineDoc of medicineSnap.docs) { // Itera su ogni medicina
        const medicineName = medicineDoc.id; // Nome della medicina
        const somministrazioniRef = collection(db, 'Pazienti', username, 'Medicine_paziente', medicineName, 'somministrazioni'); // Riferimento alla collezione delle somministrazioni
        const somministrazioniSnap = await getDocs(somministrazioniRef); // Recupera i documenti delle somministrazioni

        somministrazioniSnap.forEach((sommDoc) => { // Itera su ogni somministrazione
          const sommData = sommDoc.data(); // Dati della somministrazione
          if (sommData.data_somministrazione === today) { // Controlla se la somministrazione è prevista per oggi
            totalMedicinesCount++;
          }
        });
      }
      return totalMedicinesCount; // Restituisce il numero totale di medicine da somministrare oggi
    } catch (error) {
      console.error('Errore conteggio medicine oggi:', error);
      return 0;
    }
  }

  static async getMissedMedicationsCount(doctorUsername: string): Promise<number> { // Conta le medicine non somministrate ai pazienti di un medico
    try {
      const patientsRef = collection(db, 'Pazienti'); // Riferimento alla collezione dei pazienti
      const patientsQuery = query(patientsRef, where('medico', '==', doctorUsername)); // Query per recuperare i pazienti associati al medico
      const patientsSnap = await getDocs(patientsQuery); // Recupera i pazienti associati al medico

      let missedCount = 0;
      const today = new Date();
      const todayString = this.getTodayString(); // Data odierna in formato "giorno-mese-anno"
      const currentTime = today.getHours() * 60 + today.getMinutes(); // Tempo attuale in minuti

      for (const patientDoc of patientsSnap.docs) { // Itera su ogni paziente
        const patientUsername = patientDoc.id; // Username del paziente
        const medicineRef = collection(db, 'Pazienti', patientUsername, 'Medicine_paziente'); // Riferimento alla collezione delle medicine del paziente
        const medicineSnap = await getDocs(medicineRef);  // Recupera i documenti delle medicine

        for (const medicineDoc of medicineSnap.docs) {  // Itera su ogni medicina
          const medicineName = medicineDoc.id; // Nome della medicina
          const somministrazioniRef = collection(db, 'Pazienti', patientUsername, 'Medicine_paziente', medicineName, 'somministrazioni'); // Riferimento alla collezione delle somministrazioni
          const somministrazioniSnap = await getDocs(somministrazioniRef); // Recupera i documenti delle somministrazioni

          somministrazioniSnap.forEach((sommDoc) => { // Itera su ogni somministrazione
            const sommData = sommDoc.data(); // Dati della somministrazione
            if (sommData.data_somministrazione === todayString && sommData.stato === 'Non Presa') { // Controlla se la somministrazione è prevista per oggi e non è stata presa
              const [schedHours, schedMinutes] = sommData.ora.split(':').map(Number); // Estrae l'ora programmata
              const scheduledTime = schedHours * 60 + schedMinutes; // Tempo programmato in minuti
              if (currentTime - scheduledTime > 60) { // Controlla se è passata più di un'ora dall'ora programmata
                missedCount++;
              }
            }
          });
        }
      }
      return missedCount; // Restituisce il numero totale di medicine non somministrate
    } catch (error) {
      console.error('Errore controllo medicine saltate:', error);
      return 0;
    }
  }
}
