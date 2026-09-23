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
    const err = new Error(`Error de Drive (${res.status}): ${text}`);
    err.status = res.status; // permet detectar sessió caducada (401) i renovar-la sense molestar l'usuari
    throw err;
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

// Fusiona dues llistes (alumnat o empreses) pel seu "id": si un element només existeix en
// una banda, es conserva; si existeix a totes dues, guanya el que tingui un "lastModified"
// més recent. deletedMap és un mapa {id: dataHoraEnQuèEsVaEsborrar} — qualsevol id que hi
// aparegui amb una marca més recent que l'última modificació coneguda de l'element
// s'exclou del resultat, encara que l'altra banda encara el tingui (així una eliminació
// real mai la ressuscita una fusió posterior).
export function mergeListById(remoteList, localList, deletedMap = {}) {
  const remote = Array.isArray(remoteList) ? remoteList : [];
  const local = Array.isArray(localList) ? localList : [];
  const map = new Map();
  remote.forEach((r) => map.set(r.id, r));
  local.forEach((l) => {
    const r = map.get(l.id);
    if (!r) { map.set(l.id, l); return; }
    const rTime = r.lastModified || "";
    const lTime = l.lastModified || "";
    map.set(l.id, lTime >= rTime ? l : r);
  });
  Object.entries(deletedMap || {}).forEach(([id, deletedAt]) => {
    const item = map.get(id);
    if (item && deletedAt >= (item.lastModified || "")) map.delete(id);
  });
  return Array.from(map.values());
}

// Fusiona dos mapes d'eliminacions {id: dataHora}: per a cada id, es queda amb la marca
// més recent de les dues bandes. Les eliminacions mai s'obliden (no hi ha "recreació"
// automàtica d'un registre esborrat).
export function mergeDeletedMap(remote = {}, local = {}) {
  const out = { ...(remote || {}) };
  Object.entries(local || {}).forEach(([id, t]) => {
    if (!out[id] || t > out[id]) out[id] = t;
  });
  return out;
}

const ACTIVITY_LOG_CAP = 300;

// Fusiona dos historials d'activitat per id (unió): cap entrada es perd encara que dues
// persones en registrin a la vegada. Es queden només les últimes ACTIVITY_LOG_CAP un cop
// fusionades i ordenades per data.
export function mergeActivityLog(remote = [], local = []) {
  const map = new Map();
  (remote || []).forEach((e) => map.set(e.id, e));
  (local || []).forEach((e) => map.set(e.id, e));
  return Array.from(map.values())
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-ACTIVITY_LOG_CAP);
}

// Fusiona el document sencer: alumnat i empreses es combinen registre a registre (veure
// mergeListById), respectant sempre les eliminacions fetes a qualsevol banda; l'historial
// d'activitat es combina per unió (mergeActivityLog); la resta de camps (configuració,
// calendari...) es queden amb el valor local, ja que canvien molt menys sovint i el risc
// de xoc és molt més baix.
export function mergeSharedData(remote, local) {
  if (!remote) return local;
  const deletedStudentIds = mergeDeletedMap(remote.deletedStudentIds, local.deletedStudentIds);
  const deletedCompanyIds = mergeDeletedMap(remote.deletedCompanyIds, local.deletedCompanyIds);
  return {
    ...local,
    students: mergeListById(remote.students, local.students, deletedStudentIds),
    companies: mergeListById(remote.companies, local.companies, deletedCompanyIds),
    deletedStudentIds,
    deletedCompanyIds,
    activityLog: mergeActivityLog(remote.activityLog, local.activityLog),
  };
}

// Llegeix el fitxer compartit i hi fusiona les dades locals abans de desar-lo, per no
// perdre mai canvis fets per una altra persona mentre tu també hi treballaves.
// IMPORTANT: si la lectura prèvia falla per qualsevol motiu, NO es continua desant a
// cegues (això podria sobreescriure el fitxer només amb les dades locals i esborrar
// canvis d'una altra persona) — es deixa que l'error pugi cap amunt perquè aquest cicle
// de desat simplement no faci res i es torni a intentar més tard.
export async function saveDataMerged(token, localData) {
  const remote = await loadData(token);
  const merged = mergeSharedData(remote, localData);
  await saveData(token, merged);
  return merged;
}

// Cerca fitxers accessibles pel compte connectat: el seu propi Drive, fitxers compartits
// per altres persones, i unitats compartides (Shared Drives) — així no importa on visqui
// realment el fitxer, només que el compte hi tingui accés. Retorna els més recents primer.
export async function searchFilesByName(token, name) {
  const escaped = name.replace(/'/g, "\\'");
  const params = new URLSearchParams({
    q: `name contains '${escaped}' and trashed = false`,
    spaces: "drive",
    fields: "files(id,name,modifiedTime,driveId,mimeType)",
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

// Format d'exportació a fer servir per a cada tipus de document natiu de Google (Sheets,
// Docs...). Els fitxers .xlsx/.xls pujats de veritat NO passen per aquí — es baixen tal
// qual amb alt=media, ja que ja són binaris.
const GOOGLE_EXPORT_MIME = {
  "application/vnd.google-apps.spreadsheet": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

// Baixa el contingut d'un fitxer del Drive com a ArrayBuffer. Si és un Google Sheets natiu
// (no un .xlsx pujat), el converteix ("exporta") a Excel abans de baixar-lo.
export async function downloadFileArrayBuffer(token, file) {
  const isGoogleNative = file.mimeType && file.mimeType.startsWith("application/vnd.google-apps.");
  if (isGoogleNative) {
    const exportMime = GOOGLE_EXPORT_MIME[file.mimeType];
    if (!exportMime) {
      throw new Error(`Aquest tipus de document de Google (${file.mimeType}) no es pot exportar a Excel.`);
    }
    const res = await driveFetch(`${FILES_URL}/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}`, token);
    return await res.arrayBuffer();
  }
  const res = await driveFetch(`${FILES_URL}/${file.id}?alt=media&supportsAllDrives=true`, token);
  return await res.arrayBuffer();
}

// Carpeta on es pengen tots els documents adjunts (justificants d'exempció, documentació
// FCT...). Es crea la primera vegada que cal, i després es reutilitza sempre la mateixa.
const DOCS_FOLDER_NAME = "gestio-adm2-lomloe-documents";
let cachedDocsFolderId = null;

async function findOrCreateDocsFolder(token) {
  if (cachedDocsFolderId) return cachedDocsFolderId;
  const q = encodeURIComponent(`name = '${DOCS_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await driveFetch(`${FILES_URL}?q=${q}&spaces=drive&fields=files(id)`, token);
  const data = await res.json();
  if (data.files && data.files.length) {
    cachedDocsFolderId = data.files[0].id;
    return cachedDocsFolderId;
  }
  const createRes = await driveFetch(FILES_URL, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: DOCS_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  });
  const created = await createRes.json();
  cachedDocsFolderId = created.id;
  return cachedDocsFolderId;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// Puja un document (justificant, certificat, foto d'un paper signat...) a una carpeta
// dedicada del Drive de l'usuari, i retorna les dades mínimes per desar-lo referenciat
// dins la fitxa de l'alumne/empresa (mai el contingut sencer, només el nom i l'enllaç).
export async function uploadDocument(token, file) {
  const folderId = await findOrCreateDocsFolder(token);
  const arrayBuffer = await file.arrayBuffer();
  const base64Data = arrayBufferToBase64(arrayBuffer);
  const metadata = { name: `${Date.now()}-${file.name}`, parents: [folderId] };
  const boundary = "-------gestioadm2docboundary";
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${file.type || "application/octet-stream"}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${base64Data}\r\n` +
    `--${boundary}--`;
  const res = await driveFetch(`${UPLOAD_URL}?uploadType=multipart`, token, {
    method: "POST",
    headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
    body,
  });
  const created = await res.json();
  return { id: created.id, name: file.name, link: `https://drive.google.com/file/d/${created.id}/view` };
}
