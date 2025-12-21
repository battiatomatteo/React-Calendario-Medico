# Calendario React

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
