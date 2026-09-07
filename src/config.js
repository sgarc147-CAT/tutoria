// ---------------------------------------------------------------------------
// CONFIGURACIÓ — edita aquests valors abans de desplegar
// ---------------------------------------------------------------------------

// ID de client OAuth 2.0 de Google Cloud Console (tipus "Aplicació web").
// Pots reutilitzar el mateix que ja tens per a l'eina d'avaluació (afegint-hi
// aquest nou origen a "Orígens JavaScript autoritzats") o crear-ne un de nou.
export const GOOGLE_CLIENT_ID = "527387300866-qd9nmdojnd86ocloo4ienvudi6fb26gp.apps.googleusercontent.com";

// Llista de correus concrets que tenen permís per entrar-hi.
// Deixa-la buida ([]) si només vols controlar l'accés pel domini (veure sota).
export const ALLOWED_EMAILS = [
  "cherrer7@iesesteveterradas.cat",
  "cherrer7@xtec.cat",
  "sgarc147@iesesteveterradas.cat",
  "sgarc147@xtec.cat",
];

// Si el vols obrir a tothom d'un domini concret (p. ex. tot el professorat de
// l'institut amb compte @xtec.cat), posa'l aquí. Deixa-ho en "" per desactivar
// aquest criteri i dependre només de ALLOWED_EMAILS.
export const ALLOWED_DOMAIN = "";

// Nom del fitxer que es crearà/actualitzarà al Drive de la persona que iniciï
// sessió, amb totes les dades de l'aplicació en format JSON.
export const DRIVE_FILE_NAME = "gestio-adm2-lomloe-dades.json";

// Si vols que DIVERSES persones (per exemple, dos tutors) treballin sobre la
// MATEIXA base de dades, crea manualment un fitxer buit al Drive d'una de les
// dues persones (contingut: {}), comparteix-lo amb l'altra adreça amb permís
// d'"Editor", i enganxa aquí l'identificador del fitxer (la part de la URL de
// Drive entre "/d/" i "/view"). Si ho deixes buit (""), cada compte tindrà el
// seu propi fitxer independent (comportament per defecte).
export const DRIVE_FILE_ID = "1tNZmyGssL4jImBaRLMqmp5XSmJNeznqx";

// Àmbit (scope) que se sol·licita per accedir al Drive.
// - "drive.file": només fitxers que la pròpia app ha creat en aquell compte.
//   Suficient si cada persona té les seves pròpies dades.
// - "drive": accés a qualsevol fitxer que el compte pugui obrir (inclosos els
//   compartits per una altra persona). Cal fer servir aquest si utilitzes
//   DRIVE_FILE_ID per compartir un mateix fitxer entre diverses persones.
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";
