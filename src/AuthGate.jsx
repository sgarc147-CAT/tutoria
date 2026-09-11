import React, { useEffect, useState, useCallback } from "react";
import App from "./App";
import LoginScreen from "./auth/LoginScreen";
import { decodeIdToken, isEmailAllowed, loadGoogleScript, requestDriveToken } from "./auth/googleAuth";
import { loadData, saveData, searchFilesByName, downloadFileArrayBuffer } from "./drive/driveSync";

export default function AuthGate() {
  const [status, setStatus] = useState("loading-script"); // loading-script | signed-out | denied | authorizing | loading-data | ready | error
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadGoogleScript()
      .then(() => setStatus("signed-out"))
      .catch((e) => { setError(e.message); setStatus("error"); });
  }, []);

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
      setStatus("loading-data");

      const saved = await loadData(accessToken);
      window.__INITIAL_DATA__ = saved || {};
      window.__SAVE_DATA__ = (data) => {
        saveData(accessToken, data).catch((e) => console.error("No s'ha pogut desar al Drive:", e));
      };
      // Permet a l'App cercar i llegir altres fitxers del Drive (p. ex. l'acta
      // d'avaluació) per sincronitzar-hi notes, sense sortir de l'aplicació.
      window.__DRIVE_SEARCH__ = (name) => searchFilesByName(accessToken, name);
      window.__DRIVE_DOWNLOAD__ = (fileId) => downloadFileArrayBuffer(accessToken, fileId);

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

