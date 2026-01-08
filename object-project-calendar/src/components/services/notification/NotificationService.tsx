// src/services/notification/NotificationService.ts
import { NotificationSender } from './NotificationSender';
import { NotificationHelpers } from './NotificationHelpers';
import Logger from '../logger/LoggerService';

// Servizio per la gestione delle notifiche
// Invia notifiche di benvenuto e promemoria per medici e pazienti
// Utilizza NotificationSender per l'invio effettivo delle notifiche
// e NotificationHelpers per recuperare i dati necessari
// per costruire i messaggi delle notifiche
export class NotificationService {
  static async sendWelcomeNotificationToDoctor(username: string): Promise<void> { // Invia una notifica di benvenuto al medico
    try {
      const userData = await NotificationHelpers.getUserData(username); // Recupera i dati dell'utente
      if (!userData?.oneSignalId) { // Controlla se l'utente ha un OneSignal ID
        Logger.warn('OneSignal ID non trovato per medico', username, 'NotificationService');
        return;
      }

      const today = NotificationHelpers.getTodayString(); // Data odierna in formato stringa
      const appointmentsCount = await NotificationHelpers.getAppointmentsCount(username, today); // Conta gli appuntamenti di oggi
      const missedMedsCount = await NotificationHelpers.getMissedMedicationsCount(username); // Conta le medicine non somministrate

      let message = `Benvenuto Dr.${username}! `;
      if (appointmentsCount > 0) message += `Hai ${appointmentsCount} appuntamento/i oggi. `; // Spazio intenzionale
      if (missedMedsCount > 0) message += `${missedMedsCount} pazienti hanno saltato delle medicine.`; // Spazio intenzionale
      if (appointmentsCount === 0 && missedMedsCount === 0) message += 'Tutto sotto controllo oggi!'; // Messaggio positivo se non ci sono impegni

      Logger.info('Messaggio finale medico', message, 'NotificationService');

      await NotificationSender.sendNotification({ // Invia la notifica
        oneSignalId: userData.oneSignalId,
        subscriptionId: userData.onesignalIdSubscription,
        title: 'Promemoria Giornaliero - Medico',
        message,
        data: { type: 'doctor_welcome', appointmentsCount, missedMedsCount },
      });
    } catch (error) {
      Logger.error('Errore notifica medico', error, 'NotificationService');
    }
  }

  static async sendWelcomeNotificationToPatient(username: string): Promise<void> { // Invia una notifica di benvenuto al paziente
    try {
      const userData = await NotificationHelpers.getUserData(username); // Recupera i dati dell'utente
      if (!userData?.oneSignalId) { // Controlla se l'utente ha un OneSignal ID
        Logger.warn('OneSignal ID non trovato per paziente', username, 'NotificationService'); 
        return;
      }

      const patientData = await NotificationHelpers.getPatientData(username); // Recupera i dati del paziente
      if (!patientData) { // Controlla se i dati del paziente esistono
        Logger.warn('Dati paziente non trovati', username, 'NotificationService');
        return;
      }

      const today = NotificationHelpers.getTodayString(); // Data odierna in formato stringa
      const todayMedicines = await NotificationHelpers.getTodayMedicinesCount(username, today); // Conta le medicine da prendere oggi

      console.log(`Preparazione messaggio per paziente ${username}: ${todayMedicines} medicine da prendere oggi ${today}.`);

      let message = `Benvenuto ${username}! `; // Spazio intenzionale
      if (todayMedicines > 0) { // Controlla se ci sono medicine da prendere oggi
        message += `Hai ${todayMedicines} medicina/e da prendere oggi.`; 
      } else {
        message += 'Nessuna medicina programmata per oggi.'; // Messaggio positivo se non ci sono medicine
      }

      Logger.info('Messaggio finale paziente', message, 'NotificationService');

      await NotificationSender.sendNotification({ // Invia la notifica  
        oneSignalId: userData.oneSignalId,
        subscriptionId: userData.onesignalIdSubscription,
        title: 'Promemoria Medicine',
        message,
        data: { type: 'patient_welcome', todayMedicines },
      });
    } catch (error) {
      Logger.error('Errore notifica paziente', error, 'NotificationService');
    }
  }

  static async scheduleMedicineReminders(username: string): Promise<void> { // Pianifica i promemoria per le medicine di un paziente
    try {
      const patientData = await NotificationHelpers.getPatientData(username); // Recupera i dati del paziente
      if (!patientData) {
        Logger.warn('Dati paziente non trovati per promemoria', username, 'NotificationService');
        return;
      }

      const today = NotificationHelpers.getTodayString(); // Data odierna in formato stringa
      const medicines = patientData.medicine || []; // Lista delle medicine del paziente
      let scheduledCount = 0; // Contatore dei promemoria programmati

      console.log(`Programmazione promemoria per ${username} per il giorno ${today}`);

      medicines.forEach((medicine: any) => { // Itera su ogni medicina
        if (medicine.somministrazioni) { // Controlla se ci sono somministrazioni definite
          medicine.somministrazioni.forEach((somm: any) => { // Itera su ogni somministrazione
            const isToday =
              somm.data_somministrazione === today || somm.data === today; // compatibilità
            const notTaken = 
              somm.stato === 'Non Presa' || somm.stato === false || somm.stato === 'Da prendere'; // compatibilità

            if (isToday && notTaken && somm.ora) { // Controlla se la somministrazione è prevista per oggi e non è stata presa
              NotificationSender.scheduleNotificationAt(username, medicine.nome ?? medicine.id, somm.ora); // Pianifica la notifica
              scheduledCount++; // Incrementa il contatore
            }
          });
        }
      });

      Logger.info(`Programmati ${scheduledCount} promemoria per ${username}`, null, 'NotificationService');
    } catch (error) {
      Logger.error('Errore programmazione promemoria', error, 'NotificationService');
    }
  }
}

export default NotificationService;
