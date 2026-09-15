import React, { useEffect, useState, useCallback, useRef } from "react";
import App from "./App";
import LoginScreen from "./auth/LoginScreen";
import { decodeIdToken, isEmailAllowed, loadGoogleScript, requestDriveToken } from "./auth/googleAuth";
import { loadData, saveDataMerged, searchFilesByName, downloadFileArrayBuffer } from "./drive/driveSync";

export default function AuthGate() {
  const [status, setStatus] = useState("loading-script"); // loading-script | signed-out | denied | authorizing | loading-data | ready | error
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [driveWarning, setDriveWarning] = useState("");
  const tokenRef = useRef(null);

  useEffect(() => {
    loadGoogleScript()
      .then(() => setStatus("signed-out"))
      .catch((e) => { setError(e.message); setStatus("error"); });
  }, []);

  // Executa una operació de Drive amb el testimoni actual; si la sessió ha caducat (401),
  // en demana un de nou en silenci (sense finestra emergent) i ho torna a provar una
  // vegada. Només si això també falla es mostra un avís perquè la persona torni a fer login.
  async function withDriveRetry(fn) {
    try {
      return await fn(tokenRef.current);
    } catch (e) {
      if (e && e.status === 401) {
        try {
          const fresh = await requestDriveToken(true);
          tokenRef.current = fresh;
          setDriveWarning("");
          return await fn(fresh);
        } catch (e2) {
          setDriveWarning("La sessió amb el Drive ha caducat i no s'ha pogut renovar sola. Torna a carregar la pàgina i inicia sessió de nou per no perdre cap canvi.");
          throw e2;
        }
      }
      throw e;
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
            setDriveWarning("No s'han pogut desar els últims canvis al Drive (problema de connexió o de permisos). Comprova la connexió; els canvis es reintentaran automàticament.");
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
          <div className="fixed top-12 right-3 z-50 max-w-sm text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md shadow-sm">
            {driveWarning}
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
