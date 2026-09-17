import { GOOGLE_CLIENT_ID, ALLOWED_EMAILS, ALLOWED_DOMAIN, DRIVE_SCOPE, GMAIL_SCOPE, FORMS_BODY_SCOPE, FORMS_RESPONSES_SCOPE } from "../config";

// Decodifica el payload d'un ID token JWT de Google (no en verifica la signatura —
// això és suficient per decidir què mostrar a la pantalla en una aplicació 100%
// estàtica, però no és una verificació criptogràfica de servidor. Vegeu el README
// per als límits de seguretat d'aquest enfocament).
export function decodeIdToken(idToken) {
  const payload = idToken.split(".")[1];
  const json = decodeURIComponent(
    atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
  return JSON.parse(json);
}

export function isEmailAllowed(email) {
  if (!email) return false;
  const normalized = email.toLowerCase();
  if (ALLOWED_EMAILS.map((e) => e.toLowerCase()).includes(normalized)) return true;
  if (ALLOWED_DOMAIN && normalized.endsWith("@" + ALLOWED_DOMAIN.toLowerCase())) return true;
  return false;
}

// Carrega l'script de Google Identity Services (una sola vegada).
export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) return resolve();
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No s'ha pogut carregar Google Identity Services"));
    document.head.appendChild(script);
  });
}

// Demana un access token amb permís sobre Drive i Gmail (només lectura) de cop, en una
// sola autorització. Cal cridar-ho després del login, ja que és un pas d'autorització
// separat del d'identitat. Amb silent=true, intenta renovar-lo sense mostrar cap finestra
// emergent (funciona si la persona ja ha donat consentiment abans en aquesta mateixa
// sessió del navegador) — és el que fem servir per renovar la sessió quan caduca, sense
// interrompre la feina de l'usuari.
export function requestDriveToken(silent = false) {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: `${DRIVE_SCOPE} ${GMAIL_SCOPE} ${FORMS_BODY_SCOPE} ${FORMS_RESPONSES_SCOPE}`,
      prompt: silent ? "" : "consent",
      callback: (resp) => {
        if (resp.error) reject(new Error(resp.error));
        else resolve(resp.access_token);
      },
    });
    client.requestAccessToken();
  });
}
