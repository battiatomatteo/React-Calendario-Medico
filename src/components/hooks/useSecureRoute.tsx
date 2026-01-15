import { useLocation, useSearchParams } from "react-router-dom";

export const useSecureRoute = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const pathname = location.pathname; // es: /CalendarPage/admin
  const usernameFromQuery = searchParams.get("username");
  const tipoUtenteFromQuery = searchParams.get("tipoUtente");

  const usernameFromStorage = sessionStorage.getItem("username");
  const tipoUtenteFromStorage = sessionStorage.getItem("tipoUtente");

  // Mappa percorsi validi
  const validRoutes: Record<string, string> = {
    Admin: "/CalendarPage/admin",
    medico: "/CalendarPage/doctor",
    paziente: "/CalendarPage/patient",
  };

  const expectedPath = validRoutes[tipoUtenteFromStorage || ""];

  const isValid =
    usernameFromQuery === usernameFromStorage &&
    tipoUtenteFromQuery === tipoUtenteFromStorage &&
    pathname === expectedPath;

  return { isValid };
};
