import { DRIVE_FILE_NAME, DRIVE_FILE_ID } from "../config";

const FILES_URL = "https://www.googleapis.com/drive/v3/files";
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

async function driveFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error de Drive (${res.status}): ${text}`);
  }
  return res;
}

// Busca el fitxer de dades de l'aplicació al Drive de l'usuari. Si s'ha
// configurat DRIVE_FILE_ID (per compartir un mateix fitxer entre diverses
// persones), es fa servir directament aquest identificador sense buscar res.
async function findFileId(token) {
  if (DRIVE_FILE_ID) return DRIVE_FILE_ID;
  const q = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const res = await driveFetch(`${FILES_URL}?q=${q}&spaces=drive&fields=files(id,name)`, token);
  const data = await res.json();
  return data.files && data.files.length ? data.files[0].id : null;
}

// Carrega les dades desades. Retorna null si encara no existeix cap fitxer
// (primer cop que s'utilitza l'aplicació amb aquest compte).
export async function loadData(token) {
  const fileId = await findFileId(token);
  if (!fileId) return null;
  const res = await driveFetch(`${FILES_URL}/${fileId}?alt=media`, token);
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Crea o actualitza el fitxer de dades amb el contingut donat.
export async function saveData(token, dataObj) {
  const fileId = await findFileId(token);
  const json = JSON.stringify(dataObj);
  const metadata = { name: DRIVE_FILE_NAME, mimeType: "application/json" };

  const boundary = "-------gestioadm2boundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(fileId ? {} : metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json\r\n\r\n` +
    `${json}\r\n` +
    `--${boundary}--`;

  const url = fileId
    ? `${UPLOAD_URL}/${fileId}?uploadType=multipart`
    : `${UPLOAD_URL}?uploadType=multipart`;

  await driveFetch(url, token, {
    method: fileId ? "PATCH" : "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
}

// Cerca fitxers accessibles pel compte connectat: el seu propi Drive, fitxers compartits
// per altres persones, i unitats compartides (Shared Drives) — així no importa on visqui
// realment el fitxer, només que el compte hi tingui accés. Retorna els més recents primer.
export async function searchFilesByName(token, name) {
  const escaped = name.replace(/'/g, "\\'");
  const params = new URLSearchParams({
    q: `name contains '${escaped}' and trashed = false`,
    spaces: "drive",
    fields: "files(id,name,modifiedTime,driveId)",
    orderBy: "modifiedTime desc",
    pageSize: "15",
    corpora: "allDrives",
    includeItemsFromAllDrives: "true",
    supportsAllDrives: "true",
  });
  const res = await driveFetch(`${FILES_URL}?${params.toString()}`, token);
  const data = await res.json();
  return data.files || [];
}

// Baixa el contingut binari d'un fitxer del Drive (per exemple, un .xlsx) com a ArrayBuffer.
export async function downloadFileArrayBuffer(token, fileId) {
  const res = await driveFetch(`${FILES_URL}/${fileId}?alt=media&supportsAllDrives=true`, token);
  return await res.arrayBuffer();
}
