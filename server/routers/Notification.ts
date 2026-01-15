import { Router } from 'express';
import { sendNotification } from '../controllers/NotificationController';

// Inizializza il router di Express
const router = Router();

// Definisci la rotta POST /notifica
router.post('/', sendNotification);

export default router;
