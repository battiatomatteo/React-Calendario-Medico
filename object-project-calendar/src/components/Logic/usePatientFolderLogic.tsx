// PatientFolderLogic.tsx
import { useEffect, useState } from "react";
import { db } from "../../lib/Firebase";
import { doc, getDoc, collection, getDocs, setDoc } from "firebase/firestore";

// Tipi di dati
// Definizione delle interfacce per i dati del paziente, medicine e somministrazioni
export interface PatientData {
  id: string;
  nome?: string;
  cognome?: string;
  codice_fiscale?: string;
  mail?: string;
  numero_di_telefono?: string;
  città?: string;
  data_di_nascita?: string;
  [key: string]: any;
}

// Definizione dell'interfaccia per le medicine del paziente
export interface MedicinePaziente {
  id: string;
  nome_medicina?: string;
  dosaggio_medicina?: string;
  note_medicina?: string;
  tipo_medicina?: string;
  tempo_ogni_dosaggio?: string;
  [key: string]: any;
}

// Definizione dell'interfaccia per i farmaci
export interface Farmaco {
  id: string;
  nome?: string;
  note?: string;
  tipo_farmaco?: string;
  dosaggio?: string;
  tempo_dosaggio?: string;
  [key: string]: any; // 👈 fallback per altri campi
}

// Definizione dell'interfaccia per le terapie
export interface Therapy {
  nome_medicina: string;
  dosaggio_medicina: string;
  note_medicina: string;
  tipo_medicina: string;
  tempo_ogni_dosaggio: string;
  dataAggiunta: string;
  data_fine: string;
}

// Definizione dell'interfaccia per le somministrazioni
export interface Somministrazione {
  id: string;
  data_somministrazione: string;
  ore: string;
  stato: boolean;
  medicinaId?: string;
  nome_medicina?: string;
}

export const usePatientFolderLogic = (patientName: string, giorno?: string) => {
  const [patientData, setPatientData] = useState<PatientData | null>(null);  // Dati anagrafici del paziente
  const [medicineList, setMedicineList] = useState<MedicinePaziente[]>([]);  // Medicine prescritte
  const [somministrazioni, setSomministrazioni] = useState<Somministrazione[]>([]); // Somministrazioni
  const [allFarmaci, setAllFarmaci] = useState<Farmaco[]>([]);  // Lista completa farmaci
  const [loading, setLoading] = useState<boolean>(true);              // Stato di caricamento
  const [error, setError] = useState<string | null>(null);           // Stato di errore

  // Trigger per forzare il refresh automatico 
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  // Funzione pubblica per forzare il refresh 
  const refresh = () => setRefreshTrigger(prev => prev + 1);


  // Funzione per salvare una nuova terapia
  const saveTherapyOldStyle = async (params: {
    selectedValue: string;       // ID del farmaco scelto (Farmaci/{id})
    dos: string;                  // numero somministrazioni totali
    giornof: string;              // fine gg
    mesef: string;                // fine mm
    annof: string;                // fine aaaa
  }) => {
    const { selectedValue, dos, giornof, mesef, annof } = params;  // Estrazione parametri funzione 

    // Validazione campi obbligatori 
    if (!selectedValue || !dos || !giornof || !mesef || !annof) {
      throw new Error("Campi obbligatori mancanti (selectedValue, dos, giorno/mese/anno fine)."); // Validazione campi obbligatori
    }

    // Data di oggi in formato dd-MM-yyyy
    const now = new Date();
    const g = String(now.getDate()).padStart(2, "0");
    const m = String(now.getMonth() + 1).padStart(2, "0"); // +1 perché getMonth() è 0-based
    const a = now.getFullYear();
    const dataAggiunta = `${g}-${m}-${a}`; // Data di inizio = oggi

    // Data di fine come da input
    const dataFine = `${giornof}-${mesef}-${annof}`;

    try {
      // Documento della medicina del paziente con ID = selectedValue (vecchio stile)
      const medicineDocRef = doc(db, "Pazienti", patientName, "Medicine_paziente", selectedValue);

      // --- Salvataggio dati terapia (documento principale) ---
      await setDoc(medicineDocRef, {
        dataAggiunta: dataAggiunta,
        countVolte: dos,
        data_fine: dataFine,
        numMedicinaInizio: dos,
      });

      // --- Generazione somministrazioni (sottocollezione) ---
      let tempo_prescrizione = 0;

      // Recupero Farmaci per leggere tempo_dosaggio del farmaco selezionato
      const farmaciSnap = await getDocs(collection(db, "Farmaci"));
      const farmaci = farmaciSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const farmaco = farmaci.find(f => f.id === selectedValue);

      if (!farmaco || typeof farmaco.tempo_dosaggio === "undefined" || farmaco.tempo_dosaggio === null) {
        throw new Error("tempo_dosaggio mancante o farmaco non trovato.");
      }

      // Parsing del tempo_dosaggio
      const parsedTempo = parseFloat(farmaco.tempo_dosaggio as any);
      if (isNaN(parsedTempo)) throw new Error("tempo_dosaggio non numerico.");
      tempo_prescrizione = parsedTempo;

      // Base temporale: ora corrente; le ore saranno incrementate di tempo_prescrizione
      const dataCorrente = new Date(a, Number(m) - 1, Number(g), 0, 0, 0);

      // Ciclo per creare le somministrazioni
      for (let index = 0; index !== parseFloat(dos); index++) {
        const oreCorrenti = dataCorrente.getHours();
        const nuoveOre = oreCorrenti + tempo_prescrizione;
        dataCorrente.setHours(nuoveOre);

        const gg = String(dataCorrente.getDate()).padStart(2, "0");
        const mm = String(dataCorrente.getMonth() + 1).padStart(2, "0"); // correggo 0-based
        const aa = dataCorrente.getFullYear();
        const dataSomministrazione = `${gg}-${mm}-${aa}`;

        // Riferimento al documento somministrazione
        const sommRef = doc(
          db,
          "Pazienti",
          patientName,
          "Medicine_paziente",
          selectedValue,         // parent = ID farmaco (vecchio stile)
          "somministrazioni",
          `${index}`             // ID somministrazione = indice
        );

        const oreFormattate = `${String(dataCorrente.getHours()).padStart(2, "0")}:00`;
        
        // Salvataggio somministrazione
        await setDoc(sommRef, { 
          stato: false, 
          data_somministrazione: dataSomministrazione, 
          ore: oreFormattate, 
        });
      }

      // Aggiornamento della lista locale :
      // setMedicineList(prev => [...prev, { id: selectedValue, dataAggiunta, countVolte: dos, data_fine: dataFine }]);

      return { ok: true };
    } catch (err: any) {
      console.error("Errore nel salvataggio terapia (vecchio stile):", err);
      throw err;
    }
  };

  // Funzione per caricare tutti i farmaci
  const fetchFarmaci = async () => {
    try {
      const farmaciCollection = collection(db, "Farmaci"); // Riferimento alla collezione Farmaci
      const snapshot = await getDocs(farmaciCollection);
      const lista: Farmaco[] = snapshot.docs.map((doc) => ({  // Mappatura documenti in oggetti Farmaco
        id: doc.id,
        ...doc.data(),
      }));
      setAllFarmaci(lista);
    } catch (err) {
      console.error("Errore nel caricamento farmaci:", err);
    }
  };

  // Caricamento lista completa farmaci all'inizializzazione del componente
  useEffect(() => { 
    const fetchFarmaci = async () => { 
      try { 
        const farmaciCollection = collection(db, "Farmaci"); 
        const snapshot = await getDocs(farmaciCollection); 
        const lista = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data(),
        })); 
        setAllFarmaci(lista); 
      } 
      catch (err) { 
          console.error("Errore nel caricamento farmaci:", err); 
        } 
      }; fetchFarmaci(); 
    }, []);

  // Caricamento cartella paziente quando cambia patientName o giorno
  useEffect(() => {
    const getFarmacoData = async (idFarmaco: string) => {
      try {
        const farmacoDocRef = doc(db, "Farmaci", idFarmaco);
        const farmacoSnap = await getDoc(farmacoDocRef);

        if (farmacoSnap.exists()) { // Farmaco trovato
          const farmacoData = farmacoSnap.data();
          console.log("💊 Dati farmaco:", idFarmaco, farmacoData);

          // Restituisco i campi aggiuntivi richiesti
          return {
            note_medicina: farmacoData.note || "-",
            tipo_medicina: farmacoData.tipo_farmaco || "-",
            dosaggio_medicina: farmacoData.dosaggio || "-",
            tempo_ogni_dosaggio: farmacoData.tempo_dosaggio || "-",
          };
        } else {
          console.warn("Farmaco non trovato:", idFarmaco);
          return {};
        }
      } catch (err) {
        console.error("Errore nel caricamento farmaco:", err);
        return {};
      }
    };

    // Funzione principale per caricare la cartella del paziente
    const fetchPatientFolder = async () => {
      setLoading(true);
      setError(null);

      try {
        // Dati anagrafici del paziente
        const pazienteDocRef = doc(db, "Utenti", patientName);
        const docSnap = await getDoc(pazienteDocRef);

        if (!docSnap.exists()) {
          setError("Paziente non trovato nel database.");
          setLoading(false);
          return;
        }
        console.log("Dati anagrafici paziente:", docSnap.id, docSnap.data());

        setPatientData({ id: docSnap.id, ...docSnap.data() } as PatientData); // Imposto i dati del paziente

        // Medicine prescritte
        const prescriptionsCollectionRef = collection(db, "Pazienti", patientName, "Medicine_paziente");
        const prescriptionsSnapshot = await getDocs(prescriptionsCollectionRef);
        const prescriptionsData: MedicinePaziente[] = prescriptionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const enrichedPrescriptions: MedicinePaziente[] = [];
        for (const med of prescriptionsData) { // Arricchisco ogni prescrizione con i dati del farmaco
          const farmacoExtra = await getFarmacoData(med.id);
          enrichedPrescriptions.push({
            ...med,
            ...farmacoExtra,
          });
        }
        setMedicineList(enrichedPrescriptions);

        // Somministrazioni
        const allSomministrazioni: Somministrazione[] = [];
        for (const med of prescriptionsData) { // Ciclo su ogni medicina per recuperare le somministrazioni
          const listaSomministrazioniRef = collection(
            db,
            "Pazienti",
            patientName,
            "Medicine_paziente",
            med.id,
            "somministrazioni"
          );
          const somministrazioniSnap = await getDocs(listaSomministrazioniRef);

          // Ciclo su ogni somministrazione
          somministrazioniSnap.forEach((sDoc) => {
            const data = sDoc.data() as Somministrazione;
            const oreConv = data.ore === "24" ? "0" : data.ore;

            // Costruisco il record di somministrazione
            const record: Somministrazione = {
              id: sDoc.id,
              data_somministrazione: data.data_somministrazione,
              ore: oreConv ?? data.ore,
              stato: !!data.stato,
              medicinaId: med.id,
              nome_medicina: med.nome_medicina ?? med.id,
            };

            if (!giorno || record.data_somministrazione === giorno) {
              allSomministrazioni.push(record);
            }
          });
        }

        setSomministrazioni(allSomministrazioni);
      } catch (err: any) {
        console.error("Errore nel caricamento cartella paziente:", err);
        setError("Errore nel caricamento della cartella.");
      } finally {
        setLoading(false);
      }
    };
    
    // Avvio il caricamento solo se patientName è valido
    if (patientName && patientName.trim().length > 0) {
      fetchPatientFolder();
    } else {
      setPatientData(null);
      setMedicineList([]);
      setSomministrazioni([]);
      setLoading(false);
      setError("Nome paziente non valido.");
    }
  }, [patientName, giorno, refreshTrigger]);

  // Ritorno i dati e le funzioni utili
  return {
    patientData,
    medicineList,
    somministrazioni,
    allFarmaci,
    loading,
    error,
    saveTherapyOldStyle,
    refresh
  };
};

export default usePatientFolderLogic;
