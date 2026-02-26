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
        oneSignalExternalId: userData.oneSignalExternalId,
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
        oneSignalExternalId: userData.oneSignalExternalId,
        subscriptionId: userData.onesignalIdSubscription,
        title: 'Promemoria Medicine',
        message,
        data: { type: 'patient_welcome', todayMedicines },
      });
    } catch (error) {
      Logger.error('Errore notifica paziente', error, 'NotificationService');
    }
  }

  static async scheduleMedicineReminders(username: string): Promise<void> {
    try {
      const today = NotificationHelpers.getTodayString();

      // Recupera SOLO le somministrazioni di oggi, non assunte e con orario ≤ ora attuale
      const pendingSomministrazioni = await NotificationHelpers.getTodayPendingSomministrazioni(username, today,);

      if (pendingSomministrazioni.length === 0) {
        Logger.info(`Nessun promemoria da programmare per ${username} oggi`, null, 'NotificationService');
        return;
      }

      let scheduledCount = 0;

      console.log(`Somministrazioni da programmare per ${username}:`, pendingSomministrazioni);

      // Programma una notifica per ogni somministrazione valida
      for (const somm of pendingSomministrazioni) {
        // Qui manca il nome della medicina → lo recuperiamo
        const medicineName = somm.medicineName  ?? "Medicina";

        await NotificationSender.scheduleNotificationAt(
          username,
          medicineName,
          somm.ore,
          somm.medinaID, // Passa l'ID della somministrazione
          somm.count
        );
   
        scheduledCount++;
      }

      Logger.info(`Programmati ${scheduledCount} promemoria per ${username}`, null, 'NotificationService');

    } catch (error) {
      Logger.error('Errore programmazione promemoria', error, 'NotificationService');
    }
  }

}

export default NotificationService;
