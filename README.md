# 2n GA · LOMLOE — Gestió i tutoria FCT

Aplicació de gestió acadèmica i de pràctiques (FCT) per als grups ADM2 i ADM4,
amb accés restringit per Google i dades desades al Drive de qui hi entra.

Aquest document explica pas a pas tot el que has de fer TU (fora d'aquest
projecte) perquè funcioni: no hi ha res que jo pugui fer des d'aquí perquè
requereix el teu compte de Google i el teu compte de GitHub.

## Com funciona (resum)

- **Codi**: viu en un repositori de GitHub i es publica automàticament amb
  GitHub Pages cada vegada que hi puges canvis (GitHub Actions ho fa sol).
- **Login**: la pantalla inicial demana iniciar sessió amb Google. Un cop fet
  login, l'aplicació comprova el correu contra una llista que tu controles
  (fitxer `src/config.js`) — només hi entren els correus que hi afegeixis.
- **Dades**: després del login, l'aplicació demana permís per crear un fitxer
  al TEU Drive (`gestio-adm2-lomloe-dades.json`) i hi desa tota la informació
  (alumnat, empreses, notes, horaris...). Cada persona que hi entri amb el seu
  compte tindrà el seu propi fitxer al seu propi Drive — si vols que tot un
  equip docent comparteixi les mateixes dades, cal que tots entrin amb el
  MATEIX compte de Google, o adaptar-ho a un fitxer compartit (veure
  "Limitacions" més avall).

## Pas 1 — Crear el projecte a Google Cloud (per al login i el Drive)

Ja vas fer aquest procés per a la teva altra eina (avaluació ADM2/ADM4), amb
el Client ID `597176464074-vvd6tqinubvdi8lrvrc37grj5tko5s2d.apps.googleusercontent.com`.
Tens dues opcions:

**Opció A — Reutilitzar el mateix Client ID (més ràpid)**
1. Vés a [Google Cloud Console → Credencials](https://console.cloud.google.com/apis/credentials)
   del projecte que vas fer servir aleshores.
2. Edita l'ID de client OAuth existent.
3. A "Orígens JavaScript autoritzats", afegeix la URL on desplegaràs aquesta
   app nova (p. ex. `https://sgarc147-cat.github.io`).
4. Comprova que l'API de Google Drive estigui habilitada al projecte (APIs i
   serveis → Biblioteca → cerca "Google Drive API" → Habilita, si no ho està ja).

**Opció B — Crear un projecte/Client ID nou (dades més separades entre apps)**
1. [console.cloud.google.com](https://console.cloud.google.com) → crea un
   projecte nou.
2. "APIs i serveis" → "Biblioteca" → cerca **Google Drive API** → Habilita-la.
3. "APIs i serveis" → "Pantalla de consentiment OAuth":
   - Tipus d'usuari: *Extern* (si el teu compte no és d'una organització
     Google Workspace amb accés a "Intern") o *Intern* si vols restringir-ho
     automàticament a tots els comptes @xtec.cat del teu centre.
   - Omple el nom de l'app i el teu correu de contacte.
   - Si et demana "Usuaris de prova" (mode extern sense verificar), afegeix-hi
     els correus concrets que vulguis que hi tinguin accés.
4. "APIs i serveis" → "Credencials" → "Crear credencials" → "ID de client
   OAuth" → tipus **Aplicació web**.
   - A "Orígens JavaScript autoritzats" afegeix la URL final de GitHub Pages
     (p. ex. `https://sgarc147-cat.github.io`).
5. Copia el Client ID que et genera (acaba en `.apps.googleusercontent.com`).

## Pas 2 — Configurar qui hi pot entrar

Obre `src/config.js` en aquest projecte i edita:

```js
export const GOOGLE_CLIENT_ID = "EL_TEU_CLIENT_ID.apps.googleusercontent.com";

export const ALLOWED_EMAILS = [
  "el.teu.usuari@xtec.cat",
  "algun.company@gmail.com",
];

export const ALLOWED_DOMAIN = ""; // o "xtec.cat" si vols obrir-ho a tot el domini
```

Amb això, només qui iniciï sessió amb un d'aquests correus (o del domini, si
l'has activat) podrà entrar-hi. Qualsevol altre compte veurà un missatge
d'accés denegat.

## Pas 3 — Pujar-ho al repositori "tutoria" que ja has creat

Ja tens el repositori buit a `github.com/sgarc147-CAT/tutoria`. La manera més
segura de pujar-hi aquest projecte és clonar-lo primer i copiar-hi els
fitxers a dins (així evites conflictes si GitHub hi ha posat algun fitxer
inicial, com un README).

1. Clona el teu repositori buit en una carpeta:
   ```bash
   git clone https://github.com/sgarc147-CAT/tutoria.git
   ```
2. Copia-hi TOT el contingut d'aquest projecte (el que hi ha dins d'aquest
   zip) a dins de la carpeta `tutoria/` que acabes de clonar — inclosos els
   fitxers i carpetes que comencen per punt, com `.gitignore` i
   `.github/`. No copiïs les carpetes `node_modules` ni `dist` si n'hi ha
   (no cal que existeixin encara).
3. Entra a la carpeta i puja-ho tot:
   ```bash
   cd tutoria
   git add .
   git commit -m "Primera versió"
   git push
   ```

`vite.config.js` d'aquest projecte ja porta `base: "/tutoria/"` configurat,
així que no cal que toquis res més en aquest pas.

## Pas 4 — Activar GitHub Pages

1. Al repositori `tutoria` de GitHub: **Settings → Pages**.
2. A "Source" tria **GitHub Actions** (no "Deploy from a branch").
3. Vés a la pestanya **Actions** del repositori: hauries de veure el flux
   "Desplega a GitHub Pages" executant-se automàticament (es dispara sol amb
   cada `git push` a `main`, gràcies al fitxer
   `.github/workflows/deploy.yml` que ja inclou aquest projecte). Tarda
   1-2 minuts; un cercle groc vol dir "en procés", una marca verda vol dir
   "acabat correctament".
4. Quan acabi, l'aplicació serà disponible a:
   `https://sgarc147-cat.github.io/tutoria/`

## Provar-ho en local abans de publicar (opcional)

```bash
npm install
npm run dev
```

Nota: el login de Google només funciona des d'un origen (URL) que hagis
afegit als "Orígens JavaScript autoritzats" del pas 1. Si vols provar-ho en
local, afegeix-hi també `http://localhost:5173`.

## Limitacions a tenir en compte

- **Comprovació d'accés feta al navegador**: com que és una aplicació 100%
  estàtica (sense servidor propi), la llista de correus autoritzats es
  comprova al navegador de qui hi entra. És una barrera suficient per a un ús
  normal amb l'alumnat i companys de feina, però una persona amb prou
  coneixements tècnics podria arribar a saltar-se la comprovació de pantalla
  (encara que MAI podrà accedir al teu Drive real, perquè per això Google
  sempre demana el seu propi login i el seu propi permís explícit). Si en
  algun moment necessites seguretat de nivell més alt (dades molt sensibles),
  caldria un servidor darrere que validés el token — és un pas addicional que
  es pot afegir més endavant si cal.
- **Un fitxer de dades per compte de Google**: cada persona que iniciï sessió
  veu i desa el SEU propi fitxer al SEU Drive. Si dos professors heu d'editar
  les mateixes dades, de moment cal que entreu amb el mateix compte de Google
  (per exemple, un compte compartit del departament), ja que aquesta primera
  versió no sincronitza entre comptes diferents.
- **Tailwind via CDN**: per simplicitat, els estils es carreguen des d'un CDN
  de Tailwind. Funciona perfectament, però per a un projecte de llarg
  recorregut es podria canviar per una instal·lació local de Tailwind (build
  més ràpid i sense dependre d'una xarxa externa).

## Estructura del projecte

```
src/
  App.jsx              L'aplicació (dashboard, alumnat, empreses, horaris...)
  AuthGate.jsx          Login → autorització de Drive → càrrega de dades → mostra App
  config.js             Client ID i llista de correus autoritzats (EDITA'M)
  auth/
    googleAuth.js        Utilitats de login i autorització amb Google
    LoginScreen.jsx       Pantalla d'inici de sessió
  drive/
    driveSync.js          Llegeix/desa el fitxer JSON de dades al Drive
.github/workflows/
  deploy.yml             Publica automàticament a GitHub Pages amb cada push
```
"test" 
