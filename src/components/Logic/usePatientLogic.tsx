import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../style/Patient.css';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

// Definizione dei tipi
// per le props e i dati delle somministrazioni
type Props = {
  giorno: string;
  patientName?: string;
};

// Tipo per le medicine del paziente
type Medicine_paziente = {
  id: string;
  [key: string]: any;
};

// Tipo per le somministrazioni del paziente
type ListaSomministrazioniPaziente = {
  id: string;
  data_somministrazione: string;
  ore: string;
  stato: boolean;
};

// Tipo per la lista delle somministrazioni giornaliere
type listaSomministrazioniGiornaliere = {
  id: string;
  stato: boolean;
  data: string;
  ore: string;
  nomeMedicina: string;
  medicinaId: string;
};

// Funzione per normalizzare la data in formato GG-MM-AAAA
const normalizeDate = (dateStr: string) => {
  if (!dateStr) return dateStr;
  const [g, m, a] = dateStr.split("-");
  const gg = g.padStart(2, "0");
  const mm = m.padStart(2, "0");
  return `${gg}-${mm}-${a}`;
};

const PatientMessageWindow: React.FC<Props> = ({ giorno, patientName }) => {
  const [searchParams] = useSearchParams();
  const usernamePatient = patientName ?? searchParams.get('username'); // Recupera da props o URL params 

  const [existsStatus, setExistsStatus] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [giornoListaSomministrazioni, setGiornoListaSomministrazioni] = useState<
    listaSomministrazioniGiornaliere[]
  >([]); // Somministrazioni del giorno

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({}); // Stato checkbox

  // Gestione cambio stato checkbox
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckedItems(prev => ({ ...prev, [name]: checked }));
  };

  // Effetto per caricare i dati del paziente e le somministrazioni del giorno
  useEffect(() => {
    console.log('Uso giorno:', giorno);

    // Funzione asincrona per caricare i dati
    const loadPatientData = async () => {
      setLoading(true);
      setError(null);
      setExistsStatus(null);

      //console.log('Username paziente:', usernamePatient);

      // Verifica che l'username del paziente sia disponibile
      if (!usernamePatient) {
        setLoading(false);
        setError('Username paziente non trovato negli URL parameters.');
        setExistsStatus(false);
        return;
      }

      // --- Verifica esistenza cartella paziente ---
      try {
        const db = getFirestore();
        const pazienteDocRef = doc(db, 'Pazienti', usernamePatient); // Riferimento al documento paziente
        const docSnap = await getDoc(pazienteDocRef); // Recupera il documento

        if (docSnap.exists()) { // Cartella paziente esistente
          setExistsStatus(true);
        } else {
          try {
            // Cartella paziente non esistente, creala
            await setDoc(
              pazienteDocRef,
              { creatoIl: new Date() },
              { merge: true }
            );
            setExistsStatus(true);
          } catch (createError) {
            setError(`Errore durante la creazione della cartella: ${createError}`);
            setExistsStatus(false);
            setLoading(false);
            return;
          }
        }

        // --- Carica prescrizioni ---
        const prescriptionsCollectionRef = collection(
          db,
          'Pazienti',
          usernamePatient + '/Medicine_paziente'
        );
        // Recupera i documenti delle prescrizioni
        const prescriptionsSnapshot = await getDocs(prescriptionsCollectionRef);
        // Mappa i documenti delle prescrizioni
        const prescriptionsData: Medicine_paziente[] = prescriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // --- Carica somministrazioni giornaliere ---
        const dailySomministrazioni: listaSomministrazioniGiornaliere[] = [];
        // Itera su ogni medicina per recuperare le somministrazioni
        for (const medicina of prescriptionsData) {
          if (!medicina || !medicina.id) continue; // Salta se medicina non valida

          // Riferimento alla collezione delle somministrazioni per la medicina
          const listaSomministrazioniRef = collection(
            db,
            'Pazienti',
            usernamePatient + '/Medicine_paziente/' + medicina.id + '/somministrazioni'
          );

          const somministrazioniDocSnap = await getDocs(listaSomministrazioniRef); // Recupera i documenti delle somministrazioni
          const somministrazioniListForMedicina: ListaSomministrazioniPaziente[] = // Mappa i documenti delle somministrazioni
            somministrazioniDocSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as ListaSomministrazioniPaziente[];

          somministrazioniListForMedicina.forEach(somministrazione => { // Itera su ogni somministrazione
            if (normalizeDate(somministrazione.data_somministrazione) === normalizeDate(giorno)) { // Controlla se la data corrisponde al giorno selezionato
              const oreconv = somministrazione.ore === '24' ? '0' : somministrazione.ore;
              dailySomministrazioni.push({
                id: `${medicina.id}-${somministrazione.id}`,
                stato: somministrazione.stato,
                data: somministrazione.data_somministrazione,
                ore: oreconv,
                nomeMedicina: medicina.id,
                medicinaId: medicina.id,
              });
            }
          });
          // console.log('Somministrazioni giornaliere caricate:', dailySomministrazioni);
        }
        
        setGiornoListaSomministrazioni(dailySomministrazioni);
      } catch (err: any) {
        setError(err.message || 'Errore sconosciuto durante il caricamento dati.');
        setExistsStatus(false);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [giorno, usernamePatient]); // Ricarica se cambia il giorno o l'username del paziente
  
  // Effetto per inizializzare lo stato delle checkbox
  useEffect(() => {
    const initialCheckedState: { [key: string]: boolean } = {}; // Stato iniziale delle checkbox
    giornoListaSomministrazioni.forEach(somministrazione => { // Itera sulle somministrazioni del giorno
      initialCheckedState[somministrazione.id] = somministrazione.stato;
    });
    
    setCheckedItems(initialCheckedState);
  }, [giornoListaSomministrazioni]); // Ricarica se cambia la lista delle somministrazioni del giorno

  // Funzione per salvare lo stato delle somministrazioni
  const handleSave = async () => {
    try {
      // Verifica che l'username del paziente sia disponibile
      if (!usernamePatient) {
        alert('Username paziente non trovato!');
        return;
      }
      const db = getFirestore();
      for (const somministrazione of giornoListaSomministrazioni) { // Itera su ogni somministrazione del giorno
        const checked = checkedItems[somministrazione.id] || false; // Recupera lo stato della checkbox
        const [medicinaId, somministrazioneId] = somministrazione.id.split('-');
        const ref = doc( // Riferimento al documento della somministrazione
          db,
          'Pazienti',
          usernamePatient,
          'Medicine_paziente',
          medicinaId,
          'somministrazioni',
          somministrazioneId
        );
        await updateDoc(ref, { stato: checked });
      }
      alert('Stato delle somministrazioni salvato!');
    } catch (error) {
      setError('Errore durante il salvataggio delle somministrazioni.');
    }
  };

  if (loading) return <div>Caricamento dati paziente...</div>; // Stato di caricamento
  if (error) return <div>Errore: {error}</div>; // Stato di errore
  if (existsStatus === false) return <div>Impossibile caricare i dati del paziente.</div>; // Stato di cartella non esistente

  
  // Renderizza la finestra delle somministrazioni del paziente
  return (
    <div>
      <h3>Somministrazioni del giorno: {normalizeDate(giorno)} :</h3>
      
      {giornoListaSomministrazioni.length > 0 ? (
          <div className="somministrazioni-grid">
            <div className="colonna-somm">
              {giornoListaSomministrazioni.slice(0, 3).map(somministrazione => (
                <div key={somministrazione.id}>
                  <label>
                    <input
                      className="checkbox-somministrazione"
                      type="checkbox"
                      name={somministrazione.id}
                      checked={checkedItems[somministrazione.id] || false}
                      onChange={handleCheckboxChange}
                    />
                    {somministrazione.nomeMedicina} - ore {somministrazione.ore}
                  </label>
                </div>
              ))}
            </div>

            {giornoListaSomministrazioni.length > 3 && (
              <div className="colonna-somm">
                {giornoListaSomministrazioni.slice(3).map(somministrazione => (
                  <div key={somministrazione.id}>
                    <label>
                      <input
                        className="checkbox-somministrazione"
                        type="checkbox"
                        name={somministrazione.id}
                        checked={checkedItems[somministrazione.id] || false}
                        onChange={handleCheckboxChange}
                      />
                      {somministrazione.nomeMedicina} - ore {somministrazione.ore}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <p>Nessuna somministrazione programmata per oggi.</p>
          </div>
        )}



      {giornoListaSomministrazioni.length > 0 ? (
        <div>
          <p>Seleziona quali medicinali hai già assunto.</p>
          <button onClick={handleSave} className='bottone-salva-somm'>Salva</button>
          </div>
      ) : (
        null
      )}
      
    </div>
  );

};

export default PatientMessageWindow;
