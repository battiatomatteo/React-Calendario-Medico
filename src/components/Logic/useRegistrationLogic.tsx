import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../../lib/Firebase';
import type { RegistrationFormProps } from '../../script/types';

// Hook personalizzato per la logica di registrazione
export function useRegistrationLogic(
  formData: RegistrationFormProps,
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormProps>>,
  setIsVisible: (v: boolean) => void
) { // Hook personalizzato per la logica di registrazione
  const [regError, setRegError] = useState<string | null>(null);  // Stato per gli errori di registrazione
  const [userError, setUserError] = useState<string | null>(null); // Stato per gli errori relativi all'utente
  
  // Funzione per controllare la validità della password
  const checkPassword = (password: string) => {
    const haSimboli = /[!@#$%^&*(),.?":{}|<>_-]/.test(password);
    const haNumeri = /[0-9]/.test(password);
    const haMaiuscole = /[A-Z]/.test(password);
    const haMinuscole = /[a-z]/.test(password);
    return password.length >= 8 && haSimboli && haNumeri && haMaiuscole && haMinuscole;
  };

  // Funzione per gestire la sottomissione del modulo di registrazione
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene il comportamento predefinito del form

    const checkUserDocRef = doc(db, 'Utenti', formData.usernameOrMail); // Riferimento al documento dell'utente da controllare
    const docSnap = await getDoc(checkUserDocRef); // Ottiene il documento dell'utente

    // Controlla se il documento esiste già
    if (docSnap.exists()) {
      setUserError('Username già in uso, si prega di cambiarlo.');
      alert('Id utente già in uso! Si prega di cambiare Username.');
    } else {
      if (checkPassword(formData.password)) { // Controlla la validità della password
        try {
          const hashedPassword = await bcrypt.hash(formData.password, 10); // Hash della password
          const userDocRef = doc(db, 'Utenti', formData.usernameOrMail); // Riferimento al documento dell'utente da creare

          // Crea il documento dell'utente nel database
          await setDoc(userDocRef, {
            password: hashedPassword,
            codice_fiscale: formData.codiceFiscale,
            numero_di_telefono: formData.numeroTelefono,
            città: formData.città,
            data_di_nascita: formData.dataDiNascita,
            tipo_utente: 'paziente',
            nome: formData.nome,
            cognome: formData.cognome,
            mail: formData.mail,
            username: formData.usernameOrMail,
          });

          alert('Utente registrato con successo!');
          console.log('Utente registrato con successo!');

          setIsVisible(false);
          // Resetta i dati del modulo
          setFormData({
            nome: '',
            cognome: '',
            password: '',
            usernameOrMail: '',
            mail: '',
            codiceFiscale: '',
            numeroTelefono: '',
            città: '',
            dataDiNascita: '',
          });
        } catch (error) {
          console.error('Errore durante la registrazione:', error);
        }
      } else {
        setRegError('Password non valida. Inserire almeno 8 caratteri con maiuscole, numeri e simboli!');
      }
    }
  };

  return { handleSubmit, regError, userError };  // Ritorna le funzioni e gli stati necessari
}
