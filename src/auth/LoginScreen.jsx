import React, { useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "../config";

export default function LoginScreen({ onCredential, error, denied }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!window.google || !buttonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => onCredential(resp.credential),
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "pill",
    });
  }, [onCredential]);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 max-w-sm w-full text-center">
        <p className="font-semibold text-slate-800 mb-1">2n GA · LOMLOE</p>
        <p className="text-sm text-slate-500 mb-6">Gestió i tutoria FCT</p>
        <p className="text-sm text-slate-600 mb-5">Inicia sessió amb el teu compte de Google per accedir-hi.</p>
        <div ref={buttonRef} className="flex justify-center" />
        {denied && (
          <p className="text-xs text-red-600 mt-4">
            Aquest compte no té accés a l'aplicació. Si creus que hauria de tenir-lo, demana que afegeixin el teu correu a la llista d'accés.
          </p>
        )}
        {error && <p className="text-xs text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
