# Calendario Medico

Web application sviluppata con **React e TypeScript** per la gestione di pazienti, appuntamenti medici e terapie farmacologiche.

Il progetto integra **Firebase Firestore** per la gestione dei dati e **OneSignal** per le notifiche push.

## Funzionalità

L'applicazione prevede tre tipologie di utenza:

### Paziente
- Calendario interattivo con visualizzazione delle medicine da assumere e dei relativi orari.
- Promemoria tramite notifiche push.
- Visualizzazione delle informazioni personali.
- Accesso alla propria area riservata.

### Medico
- Visualizzazione degli appuntamenti giornalieri.
- Creazione di nuovi appuntamenti.
- Ricerca dei pazienti.
- Consultazione delle cartelle dei pazienti.

### Amministratore
- Dashboard dedicata alla gestione del sistema.
- Consultazione dell'elenco dei pazienti e dei relativi dati anagrafici.
- Gestione degli utenti con possibilità di creare account medico e amministratore.
- Consultazione dei dettagli delle medicine associate ai pazienti.
- Visualizzazione del catalogo dei farmaci.

## Tecnologie utilizzate

| Tecnologia | Utilizzo |
|---|---|
| React | Sviluppo dell'interfaccia |
| TypeScript | Tipizzazione del codice |
| Vite | Ambiente di sviluppo e build |
| React Router | Navigazione tra le pagine |
| Firebase Firestore | Database e gestione dei dati |
| OneSignal | Notifiche push |
| Node.js | Ambiente di esecuzione backend |
| Express | Realizzazione delle API REST |
| bcryptjs | Gestione delle password |

## Architettura del progetto

Il progetto è organizzato in due aree principali:

**Frontend (`src/`)**
- `components/pages/` – Pagine e interfacce delle diverse tipologie di utenza.
- `components/Logic/` – Logica applicativa e gestione dei dati.
- `components/hooks/` – Hook per la gestione delle rotte e degli accessi.
- `components/services/` – Servizi dedicati a notifiche e logging.
- `components/style/` – Fogli di stile.
- `components/utils/` – Componenti e funzioni riutilizzabili.
- `lib/` – Configurazione e collegamento a Firebase.

**Backend (`server/`)**
- `index.ts` – Avvio e configurazione del server Express.
- `routers/` – Definizione delle rotte API.
- `controllers/` – Gestione delle richieste.
- `services/` – Comunicazione con OneSignal.
- `utils/` – Funzioni di supporto e logging.

## Installazione e avvio

### Requisiti
- Node.js
- npm

### 1. Clonazione del repository

```bash
git clone <URL_DEL_REPOSITORY>
cd React-Calendario-Medico
```

### 2. Installazione delle dipendenze

```bash
npm install
```

### 3. Configurazione delle variabili d'ambiente

Creare un file `.env` nella directory principale del progetto.

Esempio:

```env
PORT=3001
VITE_SERVER_URL=http://localhost:3001/notifica
ONESIGNAL_API_KEY=INSERISCI_LA_TUA_CHIAVE
```

La chiave OneSignal deve essere configurata localmente e non condivisa nel repository.

La configurazione Firebase e l'App ID OneSignal frontend sono gestiti nei rispettivi file di configurazione del progetto.

### 4. Avvio dell'applicazione

Aprire due terminali nella directory principale.

**Terminale 1 – Frontend**

```bash
npm run dev
```

**Terminale 2 – Backend**

```bash
npm run server
```

Il frontend e il server backend vengono avviati separatamente. Il server utilizza la porta 3001, salvo diversa configurazione.

> In caso di problemi con le librerie con package.json , consultare il file package_json.txt .

## Limitazioni e sviluppi futuri

Il progetto è stato realizzato con finalità didattiche e rappresenta un'esperienza di sviluppo e integrazione tra tecnologie frontend, backend e servizi esterni.

Alcuni aspetti possono essere ulteriormente migliorati:

- Rafforzamento del sistema di autenticazione e autorizzazione.
- Miglioramento della gestione delle sessioni e dei permessi degli utenti.
- Ottimizzazione della gestione e programmazione delle notifiche.
- Maggiore validazione delle richieste e gestione degli errori.
- Introduzione di test automatici.
- Miglioramento della sicurezza e delle regole di accesso al database.

Questi aspetti rappresentano possibili evoluzioni del progetto e non costituiscono funzionalità attualmente garantite.

---

**Progetto realizzato a scopo didattico.**
