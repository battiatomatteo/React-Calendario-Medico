import {useEffect, useState } from "react";
import type { SetStateAction } from "react";
import { db } from "../../lib/Firebase";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import bcrypt from "bcryptjs";
import { formatDate } from "../utils/utils";
import { deleteDoc, getDoc  } from "firebase/firestore";

interface ListUtenti {
  id: string;
  nome: string;
  cognome: string;
  usernameOrMail: string;
  mail: string;
  codice_fiscale: string;
  numero_di_telefono: string;
  città: string;
  data_di_nascita: string;
  tipo_utente: string;
  [key: string]: any;
}

interface ListMedicine {
  id: string;
  dosaggio: string;
  durata: string;
  note: string;
  tipo_farmaco: string;
  [key: string]: any;
}

interface listaPazienti {
  id: string;
  dataAggiunta: string;
  data_fine: string;
  countVolte: string;
  numMedicinaInizio: string;
  [key: string]: any;
}

interface ListaSomministrazioni {
  id: string;
  data_somministrazione: string;
  stato: string;
  ore: string;
  [key: string]: any;
}

export const useAdminPageLogic = () => {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [id_medicina, setId_medicina] = useState("");
  const [dosaggio_medicina, setDosaggio_medicina] = useState("");
  const [note_medicina, setNote_medicina] = useState("");
  const [tipo_medicina, setTipo_medicina] = useState("");
  const [tempo_ongi_dosaggio, setTempoOngiDosaggio] = useState("");
  const [nomePazienteControllo, setNomePazienteControllo] = useState("");
  const [openSection, setOpenSection] = useState<number | null>(null);
  const [utenti, setUtenti] = useState<ListUtenti[]>([]);
  const [medicine, setListMedicin] = useState<ListMedicine[]>([]);
  const [paziente, setListPaziente] = useState<listaPazienti[]>([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [listaSomministrazioni, setLlistaSomministrazioni] = useState<ListaSomministrazioni[]>([]);

  // Stati per nuovo utente
  const [isVisibleUser, setIsVisibleUser] = useState(false);
  const [id_user, setIdUser] = useState("");
  const [nome_user, setNomeUser] = useState("");
  const [cognome_user, setCognomeUser] = useState("");
  const [username_user, setUsernameUser] = useState("");
  const [codiceFiscale_user, setCodiceFiscaleUser] = useState("");
  const [mail_user, setMailUser] = useState("");
  const [telefono_user, setTelefonoUser] = useState("");
  const [citta_user, setCittaUser] = useState("");
  const [dataNascita_user, setDataNascitaUser] = useState("");
  const [tipo_user, setTipoUser] = useState("");

  // Handlers
  const handleIdUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setIdUser(e.target.value);
  const handleNomeUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setNomeUser(e.target.value);
  const handleCognomeUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setCognomeUser(e.target.value);
  const handleUsernameUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setUsernameUser(e.target.value);
  const handleCodiceFiscaleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setCodiceFiscaleUser(e.target.value);
  const handleMailUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setMailUser(e.target.value);
  const handleTelefonoUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setTelefonoUser(e.target.value);
  const handleCittaUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setCittaUser(e.target.value);
  const handleDataNascitaUserChange = (e: React.ChangeEvent<HTMLInputElement>) => setDataNascitaUser(e.target.value);
  const handleTipoUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => setTipoUser(e.target.value);

  const [password_user, setPasswordUser] = useState("");

  const handlePasswordUserChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordUser(e.target.value);

  const [errorUser, setErrorUser] = useState<string | null>(null);

  const validateUserForm = () => {
    if (!nome_user.trim()) return "Il nome è obbligatorio";
    if (!cognome_user.trim()) return "Il cognome è obbligatorio";
    if (!username_user.trim()) return "Username/Mail è obbligatorio";
    if (!mail_user.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail_user)) return "Inserisci una mail valida";
    if (!codiceFiscale_user.trim() || codiceFiscale_user.length !== 16) return "Codice fiscale deve avere 16 caratteri";
    if (!telefono_user.trim() || !/^\d{9,15}$/.test(telefono_user)) return "Numero di telefono non valido";
    if (!dataNascita_user.trim()) return "Data di nascita obbligatoria";
    if (!tipo_user.trim()) return "Tipo utente obbligatorio";
    if (!password_user.trim() || password_user.length < 8) return "Password deve avere almeno 8 caratteri";
    return null;
  };

  useEffect(() => {
    // quando la sezione utenti NON è aperta, resetta i campi
    if (openSection !== 1) {
      setIdUser("");
      setNomeUser("");
      setCognomeUser("");
      setUsernameUser("");
      setCodiceFiscaleUser("");
      setMailUser("");
      setTelefonoUser("");
      setCittaUser("");
      setDataNascitaUser("");
      setTipoUser("");
      setIsVisibleUser(false); // chiude la riga di input
    }
  }, [openSection]);



  // Salvataggio nuovo utente
  // Salvataggio nuovo utente
  const salvaUser = async () => {
    try {
      // 🔹 Validazione campi
      if (!nome_user.trim()) {
        alert("Il nome è obbligatorio");
        return;
      }
      if (!cognome_user.trim()) {
        alert("Il cognome è obbligatorio");
        return;
      }
      if (!username_user.trim()) {
        alert("Username/Mail è obbligatorio");
        return;
      }
      if (!mail_user.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail_user)) {
        alert("Inserisci una mail valida");
        return;
      }
      if (!codiceFiscale_user.trim() || codiceFiscale_user.length !== 16) {
        alert("Codice fiscale deve avere 16 caratteri");
        return;
      }
      if (!telefono_user.trim() || !/^\d{9,15}$/.test(telefono_user)) {
        alert("Numero di telefono non valido");
        return;
      }
      if (!dataNascita_user.trim()) {
        alert("Data di nascita obbligatoria");
        return;
      }
      if (!tipo_user.trim()) {
        alert("Tipo utente obbligatorio");
        return;
      }
      if (!password_user.trim() || password_user.length < 8) {
        alert("La password deve avere almeno 8 caratteri");
        return;
      }

      const formattedDate = formatDate(new Date(dataNascita_user));
      const hashedPassword = await bcrypt.hash(password_user, 10);

      const newUser = {
        id: id_user,
        nome: nome_user,
        cognome: cognome_user,
        usernameOrMail: username_user,
        codice_fiscale: codiceFiscale_user,
        mail: mail_user,
        numero_di_telefono: telefono_user,
        città: citta_user,
        data_di_nascita: formattedDate,
        tipo_utente: tipo_user,
        password: hashedPassword, // 👈 salva solo l’hash
      };

      await setDoc(doc(db, "Utenti", id_user), newUser);

      setUtenti([...utenti, newUser]);
      setIsVisibleUser(false);

      // 🔹 reset campi
      setIdUser("");
      setNomeUser("");
      setCognomeUser("");
      setUsernameUser("");
      setCodiceFiscaleUser("");
      setMailUser("");
      setTelefonoUser("");
      setCittaUser("");
      setDataNascitaUser("");
      setTipoUser("");
      setPasswordUser("");

      alert("Nuovo utente salvato con successo!");
    } catch (error) {
      console.error("Errore nel salvataggio utente:", error);
      alert("Errore nel salvataggio utente.");
    }
  };

  // Funzione per cambiare la sezione aperta
  const toggleSection = (id: number) => {
    setOpenSection(openSection === id ? null : id);
  };

  // Reset paziente se chiudi la sezione
  useEffect(() => {
    if (openSection !== 2) {
      setNomePazienteControllo("");
      setListPaziente([]);
    }
  }, [openSection]);

  // Carica utenti e medicine
  useEffect(() => {
    const mostraListaUtenti = async () => {
      try {
        const utentiCollection = collection(db, "Utenti");
        const utentiSnapshot = await getDocs(utentiCollection);
        const appointmentsList: ListUtenti[] = utentiSnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() } as ListUtenti;
        });
        setUtenti(appointmentsList);
      } catch (error) {
        console.error("Errore nel caricamento degli utenti: ", error);
      }
    };

    const mostraListaMedicine = async () => {
      try {
        const medicineCollection = collection(db, "Farmaci");
        const farmaciSnapshot = await getDocs(medicineCollection);
        const medicineList: ListMedicine[] = farmaciSnapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() } as ListMedicine;
        });
        setListMedicin(medicineList);
      } catch (error) {
        console.error("Errore nel caricamento delle medicine : ", error);
      }
    };

    mostraListaUtenti();
    mostraListaMedicine();
  }, []);

  const cercaSomministrazioni = async () => {
    try {
      const sommCollection = collection(
        db,
        "Pazienti",
        nomePazienteControllo,
        "Medicine_paziente",
        selectedValue,
        "somministrazioni"
      );

      const sommSnapshot = await getDocs(sommCollection);
      const sommmedicineList: ListaSomministrazioni[] = sommSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as ListaSomministrazioni;
      });

      setLlistaSomministrazioni(sommmedicineList);
    } catch (error) {
      console.error("Errore nel caricamento delle somministrazioni : ", error);
    }
  };

  const salva = async () => {
    try {
      const nmedicinaDocRef = doc(db, "Farmaci", id_medicina);

      await setDoc(nmedicinaDocRef, {
        dosaggio: dosaggio_medicina,
        note: note_medicina,
        tipo_farmaco: tipo_medicina,
        tempo_dosaggio: tempo_ongi_dosaggio,
      });

      alert("Nuova medicina salvata con successo!");
      setDosaggio_medicina("");
      setId_medicina("");
      setNote_medicina("");
      setTipo_medicina("");
      setTempoOngiDosaggio("");
      setIsVisible(false);
    } catch (error) {
      console.error("Errore nel salvataggio della nuova medicina: ", error);
      alert("Errore nel salvataggio della nuova medicina.");
    }
  };

  const cerca = async () => {
    try {
      const mostraPazientiCollection = collection(db, "Pazienti", nomePazienteControllo, "Medicine_paziente");
      const pazienteSnapshot = await getDocs(mostraPazientiCollection);
      const pazienteList: listaPazienti[] = pazienteSnapshot.docs.map((doc) => {
        return { id: doc.id, ...doc.data() } as listaPazienti;
      });
      setListPaziente(pazienteList);
    } catch (error) {
      alert("Errore nel caricamento del paziente ");
      console.error("Errore nel caricamento del paziente : ", error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // 1. Controlla se esiste un paziente con lo stesso ID
      const pazienteRef = doc(db, "Pazienti", id);
      const pazienteSnap = await getDoc(pazienteRef);

      if (pazienteSnap.exists()) {
        // 2. Se esiste, eliminalo
        await deleteDoc(pazienteRef);
        console.log(`Paziente con ID ${id} eliminato dalla raccolta Pazienti`);
      }

      // 3. Elimina l'utente dalla raccolta Utenti
      await deleteDoc(doc(db, "Utenti", id));

      // 4. Aggiorna lo stato locale
      setUtenti((prev) => prev.filter((u) => u.id !== id));

      alert("Utente eliminato con successo!");
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'utente:", error);
      alert("Errore durante l'eliminazione dell'utente.");
    }
  };


  const deleteMedicine = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Farmaci", id));

      // aggiorna lo stato locale
      setListMedicin((prev) => prev.filter((m) => m.id !== id));

      alert("Medicina eliminata con successo!");
    } catch (error) {
      console.error("Errore durante l'eliminazione della medicina:", error);
      alert("Errore durante l'eliminazione della medicina.");
    }
  };



  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setSelectedValue(event.target.value);
  };

  const handleNomeFarmacoChange = (e: React.ChangeEvent<HTMLInputElement>) => setId_medicina(e.target.value);
  const handleNoteFarmacoChange = (e: React.ChangeEvent<HTMLInputElement>) => setNote_medicina(e.target.value);
  const handleDosaggioFarmacoChange = (e: React.ChangeEvent<HTMLInputElement>) => setDosaggio_medicina(e.target.value);
  const handleTipoFarmacoChange = (event: { target: { value: SetStateAction<string> } }) => setTipo_medicina(event.target.value);
  const handleTempoDosChange = (e: React.ChangeEvent<HTMLInputElement>) => setTempoOngiDosaggio(e.target.value);
  const handleNomePazienteControlloChange = (e: React.ChangeEvent<HTMLInputElement>) => setNomePazienteControllo(e.target.value);

  const handleLogout = () => {
    navigate("/");
  };

  return {
    isVisible,
    setIsVisible,
    id_medicina,
    dosaggio_medicina,
    note_medicina,
    tipo_medicina,
    tempo_ongi_dosaggio,
    nomePazienteControllo,
    openSection,
    utenti,
    medicine,
    paziente,
    selectedValue,
    listaSomministrazioni,
    toggleSection,
    cercaSomministrazioni,
    salva,
    cerca,
    handleChange,
    handleNomeFarmacoChange,
    handleNoteFarmacoChange,
    handleDosaggioFarmacoChange,
    handleTipoFarmacoChange,
    handleTempoDosChange,
    handleNomePazienteControlloChange,
    handleLogout,
    isVisibleUser,
    setIsVisibleUser,
    id_user,
    nome_user,
    cognome_user,
    username_user,
    codiceFiscale_user,
    mail_user,
    telefono_user,
    citta_user,
    dataNascita_user,
    tipo_user,
    password_user,
    handleIdUserChange,
    handleNomeUserChange,
    handleCognomeUserChange,
    handleUsernameUserChange,
    handleCodiceFiscaleUserChange,
    handleMailUserChange,
    handleTelefonoUserChange,
    handleCittaUserChange,
    handleDataNascitaUserChange,
    handleTipoUserChange,
    handlePasswordUserChange,
    salvaUser,
    errorUser,
    setErrorUser,
    deleteUser,
    deleteMedicine,
  };


};


export default useAdminPageLogic;