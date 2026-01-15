import type { Request, Response } from 'express';
import { notifyOneSignal } from '../services/OneSignalServices';

// Definisci il tipo del body per chiarezza
interface NotificationBody {
  oneSignalId: string;
  subscriptionId?: string;
  onesignalIdSubscription?: string;
  titolo: string;
  messaggio: string;
}

export async function sendNotification(
  req: Request<{}, {}, NotificationBody>,
  res: Response
): Promise<void> {
  console.log("Richiesta ricevuta:", req.body);
  const { oneSignalId, subscriptionId, onesignalIdSubscription, titolo, messaggio } = req.body;

  const subId = subscriptionId || onesignalIdSubscription;
  if (!subId) {
    res.status(400).send("Missing subscriptionId");
    return;
  }
  if (!oneSignalId) {
    res.status(400).send("Missing oneSignalId");
    return;
  }

  try {
    const result = await notifyOneSignal(subId, titolo, messaggio);
    res.status(200).send(result);
  } catch (error) {
    console.error("Errore durante la chiamata a OneSignal:", error);
    res.status(500).send("Errore interno");
  }
}