import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthPage from './components/pages/AuthPage';
import DoctorPage from './components/pages/DoctorPage';
import HomePagePatient from './components/pages/HomePagePatient';
import ProtectedRoute from './components/hooks/ProtectedRoute';
import AdminPage from './components/pages/AdminPage';

import OneSignal from 'react-onesignal';

OneSignal.init({
  appId: "2982dd98-6671-4445-9316-252d4b356462",
  allowLocalhostAsSecureOrigin: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        
        {/* Entry point: login/registrazione */}
        <Route path="/" element={<AuthPage />} />

        {/* CalendarPage come layout */}
        <Route path="/CalendarPage/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/CalendarPage/doctor" element={<ProtectedRoute><DoctorPage /></ProtectedRoute>} />
        <Route path="/CalendarPage/patient" element={<ProtectedRoute><HomePagePatient /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
