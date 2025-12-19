import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationRoutes from './routers/Notification'; 

dotenv.config();

const app = express();

// Abilita CORS
app.use(cors());

// Parsing JSON
app.use(express.json());

// Rotte
app.use('/notifica', notificationRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server notifiche avviato sulla porta ${PORT}`);
});
