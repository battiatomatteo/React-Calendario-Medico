// ———————————————————————————————————————
// Types per le notifiche e i pazienti
// ———————————————————————————————————————
export interface NotificationData {
  oneSignalId: string;
  subscriptionId?: string;
  title: string;
  message: string;
  data?: any;
}

// Tipi per la gestione dei pazienti e delle medicine
export interface Somministrazione {
  data_somministrazione: string;
  ora: string;
  stato: string;
}

// Tipo per le medicine associate ai pazienti
export interface Medicine {
  id: string;
  nome: string;
  somministrazioni?: Somministrazione[];
}

// Tipo per i pazienti
export interface Patient {
  id: string;
  nome: string;
  medicine?: Medicine[];
}
