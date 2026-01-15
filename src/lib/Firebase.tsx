import { getFirestore } from "firebase/firestore"; // Importa getFirestore
import { getMessaging , getToken, onMessage } from 'firebase/messaging'; // per importare il servizio di messaggistica : notifiche push
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBhlp3y3QOwRizD5gQ64f4sGlClir__XQ",
  authDomain: "calendario-2af53.firebaseapp.com",
  projectId: "calendario-2af53",
  storageBucket: "calendario-2af53.firebasestorage.app",
  messagingSenderId: "571257356818",
  appId: "1:571257356818:web:4f8cf1ebb293c22f6fcecb",
  measurementId: "G-42348Q5PBN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inizializza Firestore
const messaging = getMessaging(app); // Inizializza il servizio di messaggistica

export { db, messaging, getToken, onMessage  };



/*
Come funziona
OneSignal gestisce solo le notifiche push (registrazione, permessi, invio e ricezione).
Firebase/Firestore gestisce i dati della tua app (utenti, appuntamenti, ecc.).
I due servizi sono indipendenti:

Puoi salvare i dati degli utenti e degli appuntamenti su Firestore.
Puoi usare OneSignal per inviare notifiche push agli utenti (ad esempio quando un nuovo appuntamento viene creato).

Come integrarli
Configura OneSignal nella tua app React seguendo la guida ufficiale.
Continua a usare Firestore come database come già fai.
Quando vuoi inviare una notifica:
Puoi chiamare le API di OneSignal dal tuo backend (o anche dal frontend, se necessario).
Puoi salvare l’ID utente OneSignal su Firestore se vuoi collegare notifiche e dati utente.

Esempio di flusso
Un utente si registra/logga → Salvi i dati su Firestore.
L’utente abilita le notifiche OneSignal → OneSignal gestisce il token.
Quando succede qualcosa (es. nuovo appuntamento), dal backend chiami l’API OneSignal per inviare la notifica.

*/