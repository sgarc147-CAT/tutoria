import React, { useEffect, useState, useCallback, useRef } from "react";
import App from "./App";
import LoginScreen from "./auth/LoginScreen";
import { decodeIdToken, isEmailAllowed, loadGoogleScript, requestDriveToken } from "./auth/googleAuth";
import { loadData, saveDataMerged, searchFilesByName, downloadFileArrayBuffer, uploadDocument } from "./drive/driveSync";
import { searchEmailsByDomain } from "./gmail/gmailSync";
import { createActivityForm, fetchFormResponses } from "./forms/formsSync";

// Evita que una operació es quedi esperant per sempre (per exemple, una finestra de Google
// que ha quedat oberta darrere d'una altra i ningú ha clicat "Continua").
function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message || "Temps d'espera exhaurit.")), ms)),
  ]);
}

export default function AuthGate() {
  const [status, setStatus] = useState("loading-script"); // loading-script | signed-out | denied | authorizing | loading-data | ready | error
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [driveWarning, setDriveWarning] = useState("");
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const tokenRef = useRef(null);

  useEffect(() => {
    loadGoogleScript()
      .then(() => setStatus("signed-out"))
      .catch((e) => { setError(e.message); setStatus("error"); });
  }, []);

  // Executa una operació de Drive amb el testimoni actual; si la sessió ha caducat (401),
  // en demana un de nou en silenci (sense finestra emergent) i ho torna a provar una
  // vegada. Si la renovació triga massa (per exemple, una finestra de Google penjada
  // esperant un clic) o falla, s'atura al cap de 15 segons i es mostra un botó explícit
  // de "Reconnecta" en lloc de quedar-se esperant en silenci per sempre.
  async function withDriveRetry(fn) {
    try {
      return await fn(tokenRef.current);
    } catch (e) {
      if (e && e.status === 401) {
        try {
          const fresh = await withTimeout(requestDriveToken(true), 15000, "La renovació silenciosa de la sessió ha trigat massa.");
          tokenRef.current = fresh;
          setDriveWarning("");
          setNeedsReconnect(false);
          return await fn(fresh);
        } catch (e2) {
          setDriveWarning("La sessió amb el Drive ha caducat. Clica \"Reconnecta\" per continuar sense perdre cap canvi.");
          setNeedsReconnect(true);
          throw e2;
        }
      }
      throw e;
    }
  }

  // Acció explícita per si la renovació automàtica no ha funcionat: demana un testimoni
  // nou (amb el diàleg complet de Google si cal) i el fa servir a partir d'ara.
  async function reconnect() {
    setReconnecting(true);
    try {
      const fresh = await requestDriveToken(false);
      tokenRef.current = fresh;
      setDriveWarning("");
      setNeedsReconnect(false);
    } catch (e) {
      setDriveWarning("No s'ha pogut reconnectar amb el Drive: " + (e.message || "error desconegut") + ". Prova de refrescar la pàgina (Ctrl+Shift+R).");
    } finally {
      setReconnecting(false);
    }
  }

  const handleCredential = useCallback(async (idToken) => {
    try {
      const payload = decodeIdToken(idToken);
      if (!isEmailAllowed(payload.email)) {
        setStatus("denied");
        return;
      }
      setUser({ email: payload.email, name: payload.name, picture: payload.picture });
      setStatus("authorizing");

      const accessToken = await requestDriveToken();
      tokenRef.current = accessToken;
      setStatus("loading-data");

      const saved = await withDriveRetry((token) => loadData(token));
      window.__INITIAL_DATA__ = saved || {};
      // Desa fusionant sempre amb el que hi hagi al Drive en aquell moment (mai
      // sobreescriu de cop) i retorna el resultat fusionat perquè l'App actualitzi
      // la seva pròpia còpia local amb qualsevol novetat de l'altra persona.
      window.__SAVE_DATA__ = (data) =>
        withDriveRetry((token) => saveDataMerged(token, data))
          .then((merged) => { setDriveWarning(""); return merged; })
          .catch((e) => {
            console.error("No s'ha pogut desar al Drive:", e);
            if (!(e && e.status === 401)) {
              setDriveWarning("No s'han pogut desar els últims canvis al Drive (problema de connexió o de permisos). Comprova la connexió; els canvis es reintentaran automàticament.");
            }
            return null;
          });
      // Permet a l'App refrescar-se periòdicament amb el que hi hagi al Drive, sense
      // haver de fer cap canvi local primer (útil si l'altra persona ha treballat i tu
      // encara no havies tocat res des que vas obrir l'aplicació).
      window.__DRIVE_PULL__ = () => withDriveRetry((token) => loadData(token)).catch(() => null);
      // Permet a l'App cercar i llegir altres fitxers del Drive (p. ex. l'acta
      // d'avaluació) per sincronitzar-hi notes, sense sortir de l'aplicació.
      window.__DRIVE_SEARCH__ = (name) => withDriveRetry((token) => searchFilesByName(token, name));
      window.__DRIVE_DOWNLOAD__ = (file) => withDriveRetry((token) => downloadFileArrayBuffer(token, file));
      // Permet a l'App cercar, a la safata de Gmail (només lectura), els correus dels
      // últims mesos relacionats amb el domini d'una empresa.
      window.__GMAIL_SEARCH__ = (domain, monthsBack) => withDriveRetry((token) => searchEmailsByDomain(token, domain, monthsBack));
      // Permet a l'App pujar documents (justificants d'exempció, documentació FCT...) al
      // Drive de l'usuari i desar-ne només la referència (nom + enllaç) a la fitxa.
      window.__DRIVE_UPLOAD_DOC__ = (file) => withDriveRetry((token) => uploadDocument(token, file));
      // Permet a l'App crear el formulari de preferències d'activitats i llegir-ne les
      // respostes (només lectura de respostes; l'app només pot crear/editar formularis
      // que ella mateixa hagi creat).
      window.__FORMS_CREATE__ = (activityPlan, groupLabel) => withDriveRetry((token) => createActivityForm(token, activityPlan, groupLabel));
      window.__FORMS_FETCH_RESPONSES__ = (formId, nameQuestionId, categoryQuestionIds) =>
        withDriveRetry((token) => fetchFormResponses(token, formId, nameQuestionId, categoryQuestionIds));

      setStatus("ready");
    } catch (e) {
      setError(e.message || "Error inesperat en iniciar sessió.");
      setStatus("error");
    }
  }, []);

  if (status === "ready") {
    return (
      <div>
        <div className="fixed top-2 right-3 z-50 text-xs text-slate-400 bg-white/80 backdrop-blur px-2 py-1 rounded-md border border-slate-200">
          {user?.email} · dades desades al teu Drive
        </div>
        {driveWarning && (
          <div className="fixed top-12 right-3 z-50 max-w-sm text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md shadow-sm space-y-2">
            <p>{driveWarning}</p>
            {needsReconnect && (
              <button
                onClick={reconnect} disabled={reconnecting}
                className="w-full px-2 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {reconnecting ? "Reconnectant..." : "Reconnecta amb el Drive"}
              </button>
            )}
          </div>
        )}
        <App />
      </div>
    );
  }

  if (status === "loading-script" || status === "authorizing" || status === "loading-data") {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center">
        <p className="text-sm text-slate-500">
          {status === "loading-script" && "Carregant..."}
          {status === "authorizing" && "Sol·licitant accés al teu Google Drive..."}
          {status === "loading-data" && "Carregant les teves dades..."}
        </p>
      </div>
    );
  }

  return <LoginScreen onCredential={handleCredential} error={status === "error" ? error : ""} denied={status === "denied"} />;
}
