# Calendario React

Web app sviluppata in React, con l’obiettivo di offrire un calendario medico intelligente con funzionalità personalizzate a seconda del tipo di utente: **Paziente, Medico e Admin** .

Vengono utilizzati **oneSignal**, come sistema di notifiche push per tenere informati i pazienti sugli orari dei farmaci , invece per la gestione del salvataggio dei dati viene utilizzato **Firebase** . 

---

##  Tipologie di utenza

- Paziente :
    - Calendario interattivo → cliccando su un giorno: riquadro con medicine da assumere e orari
    - Notifiche push all’ora programmata
    - Messaggio di benvenuto con nome
    - Logout in alto a destra

- Medico :
    - Tabella appuntamenti giornalieri
    - Creazione nuovi appuntamenti
    - Ricerca paziente , per la visione della sua cartella
    - Messaggio di benvenuto e logout

- Admin , L’Admin ha accesso a una dashboard di controllo composta da 3 tabelle a scomparsa, con le seguenti funzionalità :
    - Tabella 1 – Elenco pazienti . Una riga per paziente, con tutti i dati anagrafici, con la possibilità di creare un nuovo medico/admin
    - Tabella 2 – Dettagli medicine per paziente
    - Tabella 3 – Catalogo medicine


---

## 📁 Struttura e funzionamento della cartella `src/`

La cartella `src/` contiene il frontend dell'applicazione , sviluppata in **TypeScript** .
L’architettura è modulare e separa chiaramente responsabilità e livelli logici, rendendo il codice più leggibile, manutenibile e facile da estendere.

```
src/
│
├── assets
│   └── react.svg                 
│
├── components/
│   │
│   ├── hooks/
│   │   └── ProtectedRoute.tsx       # file che si occupano della **gestione/controllo dell'URL**
│   │
│   ├── Logic/
│   │   └── useLoginLogic.tsx        # file che si occupano della **logica** dei componenti e del **recupero** dei dati dal databse
│   │
│   ├── pages/
│   │   └── LoginPage.tsx            # file che contengono i componenti e le pagine del progetto 
│   │
│   ├── services/
│   │   │
│   │   ├── logger/
│   │   │    └── LoggerService.tsx   #  servizio di logging avanzato
│   │   │
│   │   └── notification/
│   │        │
│   │        ├── NotificationHelpers.tsx # contiene metodi statici per recuperare dati e contare appuntamenti e medicine
│   │        │
│   │        ├── NotificationSender.tsx  # per l'invio delle notifiche
│   │        │
│   │        ├── NotificationService.tsx # invia notifiche di benvenuto e promemoria per medici e pazienti
│   │        │
│   │        └── typse.tsx 
│   │
│   ├── style/
│   │   └── Login.css                # file di stile delle pagine e dei componenti del profetto 
│   │
│   └── utils/
│       └── utils.tsx                # file che contengono parti di codice riutilizzato
│
├── lib/
│   └── Firtebase.tsx   # Collegamento a Firebase , dove è situato il nostro database
│
└── scripts/
│   └── typse.ts
│ 
└── main.tsx  
```

---

## 📁 Struttura e funzionamento della cartella `server/`

La cartella `server/` contiene il backend dell’applicazione, sviluppato in **Node.js + Express** con **TypeScript**.  
L’architettura è modulare e separa chiaramente responsabilità e livelli logici, rendendo il codice più leggibile, manutenibile e facile da estendere.

```
server/
│
├── index.ts                     # Entry point del server Express
│
├── routers/
│   └── Notification.ts          # Definizione delle rotte REST per l’invio delle notifiche
│
├── controllers/
│   └── NotificationController.ts # Logica applicativa: valida input e chiama i servizi
│
└── services/
    └── OneSignalService.ts      # Funzione che comunica con l’API OneSignal tramite fetch
```

### 🔧 Come funziona il flusso

1. **index.ts** avvia il server, configura CORS, parsing JSON e registra le rotte.
2. Le richieste verso `/notifica` vengono gestite dal router `Notification.ts`.
3. Il router delega la logica al **controller**, che:
   - valida i parametri ricevuti
   - gestisce eventuali errori
   - chiama il servizio dedicato
4. Il **servizio OneSignal** (`OneSignalService.ts`) effettua la chiamata HTTP all’API OneSignal, costruisce il payload e restituisce la risposta.

Questa struttura segue un pattern chiaro (Router → Controller → Service) che permette di mantenere il backend pulito, scalabile e facilmente testabile.

---

## Utilizzo 

Eseguire i sucessivi comandi per l'avvio : 

*Comando per entrare nella cartella del progetto :*
```

cd ./object-project-calendar/

```

*Comando per avviare il progetto :*
```

npm run dev  # comando per l'app

npm run server  # comando per il server 

```

Sul proprio terminale una volta che il server è stato avviato si potranno visionare le notifiche che vengono inviate da **oneSignal** , eccone un esempio di notifica di accesso di un dottore , con un piccolo riassunto della giornata :

```

Richiesta ricevuta: {
  oneSignalId: 'YOUR_ONESIGNAL_ID',
  subscriptionId: 'YOUR_SUBSCRIPTION_ID',
  titolo: 'Promemoria Giornaliero - Medico',
  messaggio: 'Benvenuto Dr.ReplitMedico! Tutto sotto controllo oggi!',
  data: { type: 'doctor_welcome', appointmentsCount: 0, missedMedsCount: 0 }
}

```

I dati di ogni utente , in questo caso **oneSignalId** e **subscriptionId**, vengono presi al primo accesso , dando il consenso alle notifiche .

All'interno del file **.env** sono state inserite le varibili di ambiente , come ad esempio le key di **oneSignal** .

Sono state apportate delle modifiche all'interno dei file **.josn** ( tsconfig e packege ) , per rendere possibile l'utilizzo di un server creato da noi si è creato **tsconfig.server.json** . 