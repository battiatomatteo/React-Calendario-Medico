// src/services/notification/NotificationSender.ts
import type { NotificationData } from './types';
import { NotificationHelpers } from './NotificationHelpers';
import Logger from '../logger/LoggerService';

// Servizio per l'invio delle notifiche
// Utilizza un server esterno per l'invio delle notifiche push
// tramite OneSignal
export class NotificationSender {
  //private static readonly SERVER_URL = 'https://notifiche-server.onrender.com/notifica'; // URL del server di notifiche
  //private static readonly SERVER_URL = 'http://localhost:3001/notifica';
  
  private static readonly SERVER_URL = import.meta.env.VITE_SERVER_URL;

  //private static prova = "https://notifiche-server.onrender.com";

  static async sendNotification(notificationData: NotificationData): Promise<boolean> { // Invia una notifica tramite il server esterno
    try {
      if (!notificationData.oneSignalId || !notificationData.title || !notificationData.message) { // Controlla che i dati essenziali siano presenti
        Logger.warn('Dati notifica incompleti', notificationData, 'NotificationSender'); // Log di avviso se i dati sono incompleti
        return false;
      }

      const payload = { // Costruisce il payload della notifica
        oneSignalId: notificationData.oneSignalId,
        subscriptionId: notificationData.subscriptionId,
        titolo: notificationData.title,
        messaggio: notificationData.message,
        data: notificationData.data || {}
      };

      Logger.info('Invio notifica', payload, 'NotificationSender'); // Log informativo sull'invio della notifica

      const response = await fetch(this.SERVER_URL, { // Effettua la richiesta al server di notifiche
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) { // Controlla se la risposta è positiva
        Logger.info('Notifica inviata con successo', null, 'NotificationSender');
        return true;
      } else {
        Logger.error('Errore server', response.status, 'NotificationSender');
        return false;
      }
    } catch (error) {
      Logger.error('Errore invio notifica', error, 'NotificationSender');
      return false;
    }
  }

  static async scheduleNotificationAt(username: string, medicineName: string, time: string): Promise<void> {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return;

      const now = new Date();
      const scheduled = new Date();
      scheduled.setHours(hours, minutes, 0, 0);

      // 🔥 Caso 1: l’orario è già passato → invia SUBITO
      if (scheduled <= now) {
        console.log(`Orario ${time} già passato. Invio immediato per ${medicineName}`);

        const userData = await NotificationHelpers.getUserData(username);
        if (userData?.oneSignalId) {
          await this.sendNotification({
            oneSignalId: userData.oneSignalId,
            subscriptionId: userData.onesignalIdSubscription,
            title: 'Promemoria medicina',
            message: `Devi prendere ${medicineName} delle ${time}`,
            data: { type: 'medicine_reminder', medicineName, time }
          });
        }

        return;
      }

      // 🔥 Caso 2: orario futuro → programma SOLO per oggi
      const delay = scheduled.getTime() - now.getTime();
      const minutesLeft = Math.round(delay / 60000);
      console.log(`⏱️ Prossima notifica tra ${minutesLeft} minuti (${medicineName} alle ${time})`);


      setTimeout(async () => {
        const userData = await NotificationHelpers.getUserData(username);
        if (userData?.oneSignalId) {
          await this.sendNotification({
            oneSignalId: userData.oneSignalId,
            subscriptionId: userData.onesignalIdSubscription,
            title: 'È ora di prendere la medicina!',
            message: `È ora di prendere ${medicineName} alle ${time}`,
            data: { type: 'medicine_reminder', medicineName, time }
          });

          Logger.info(`Promemoria inviato per ${medicineName} alle ${time}`, null, 'NotificationSender');
        }
      }, delay);

    } catch (error) {
      Logger.error('Errore programmazione notifica', error, 'NotificationSender');
    }
  }
}

export default NotificationSender;

//os_v2_app_fgbn3gdgofceleyweuwuwnlemkzjuwas5bkuvlfeituwzahli2ggj42cyrnkofj4hjnfh4xand5mcm4ziqkcqrstbfjntagyqmnzlva