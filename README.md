# Calendario-Nuova-Versione

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
