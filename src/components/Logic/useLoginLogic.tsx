import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../../lib/Firebase'; // aggiorna il path se necessario
import type { RegistrationFormProps } from '../../script/types';

export function useLoginLogic(formData: RegistrationFormProps) {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null); // Stato per gestire gli errori di login

  // Funzione per gestire il submit del form di login
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const userDocRef = doc(db, 'Utenti', formData.usernameOrMail);
      const docSnap = await getDoc(userDocRef);

      // Verifica se il documento esiste
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const passwordMatch = await bcrypt.compare(formData.password, userData.password);
        

        if (passwordMatch) {
          // Salvataggio delle informazioni di login nella sessione
          // Questi dati restano disponibili finché la sessione del browser è attiva
          sessionStorage.setItem('isLoggedIn', 'true');
          sessionStorage.setItem('username', formData.usernameOrMail);
          sessionStorage.setItem('tipoUtente', userData.tipo_utente);

          // Routing in base al tipo utente
          let route = '';
          switch (userData.tipo_utente) {
            case 'Admin':
              route = '/CalendarPage/admin';
              break;
            case 'medico':
              route = '/CalendarPage/doctor';
              break;
            case 'paziente':
              route = '/CalendarPage/patient';
              break;
            default:
              route = '/'; // fallback
          }
          
          // Aggiunta dei parametri di query alla navigazione
          navigate(`${route}?username=${formData.usernameOrMail}&tipoUtente=${userData.tipo_utente}`);
          setLoginError(null);
        } else {
          setLoginError('Username o password non corretti');
        }
      } else {
        setLoginError('Username o password non corretti');
      }
    } catch (error) {
      console.error('Errore durante l\'autenticazione:', error);
      setLoginError('Errore durante l\'autenticazione');
    }
  };

  return { onSubmit, loginError }; // Ritorna la funzione onSubmit e lo stato loginError
}
