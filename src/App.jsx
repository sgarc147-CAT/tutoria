import React, { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LayoutDashboard, FileSpreadsheet, Settings, Users, Building2,
  UploadCloud, CheckCircle2, XCircle, AlertTriangle, Clock, ChevronRight, ChevronDown,
  ChevronLeft, X, Plus, Trash2, Save, Search, GraduationCap, BriefcaseBusiness,
  CalendarDays, CalendarOff, Percent, ClipboardList, ArrowLeft
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* 1. CURRÍCULUM OFICIAL — 2n GA (LOMLOE, 2000h: 1485h centre + 515h emp.) */
/* ---------------------------------------------------------------------- */

const DUAL_MODULES = [
  { code: "0437", name: "Comunicació empresarial i atenció al client", centreH: 99, empresaH: 66, raCount: 8, dual: true,
    raLabels: [
      "Selecciona tècniques de comunicació, relacionant-les amb l'estructura i la imatge de l'empresa i els fluxos d'informació existents en aquesta.",
      "Transmet informació de forma oral, vinculant-la als usos i costums socioprofessionals habituals a l'empresa.",
      "Transmet informació escrita, aplicant les tècniques d'estil a diferents tipus de documents propis de l'empresa i de l'Administració Pública.",
      "Arxiva informació en suport paper i informàtic, reconeixent els criteris d'eficiència i estalvi en els tràmits administratius.",
      "Reconeix necessitats de possibles clients aplicant tècniques de comunicació.",
      "Atén consultes, queixes i reclamacions de possibles clients aplicant la normativa vigent en matèria de consum.",
      "Potencia la imatge d'empresa reconeixent i aplicant els elements i les eines del màrqueting.",
      "Aplica procediments de qualitat a l'atenció al client identificant els estàndards establerts.",
    ] },
  { code: "0438", name: "Operacions administratives de compravenda", centreH: 99, empresaH: 66, raCount: 5, dual: true,
    raLabels: [
      "Calcula preus de venda i compra i descomptes aplicant les normes i els usos mercantils i la legislació fiscal vigent.",
      "Confecciona documents administratius de les operacions de compravenda i els relaciona amb les transaccions comercials de l'empresa.",
      "Liquida obligacions fiscals lligades a les operacions de compravenda aplicant la normativa fiscal vigent.",
      "Controla existències reconeixent i aplicant sistemes de gestió de magatzem.",
      "Tramita pagaments i cobraments reconeixent la documentació associada i el flux dins de l'empresa.",
    ] },
  { code: "0440", name: "Tractament informàtic de la informació", centreH: 165, empresaH: 132, raCount: 8, dual: true,
    raLabels: [
      "Processa textos alfanumèrics en un teclat extens aplicant les tècniques mecanogràfiques.",
      "Instal·la i actualitza aplicacions informàtiques relacionades amb la tasca administrativa raonant els passos a seguir en el procés.",
      "Elabora documents i plantilles manejant opcions del full de càlcul tipus.",
      "Elabora documents de text utilitzant les opcions d'un processador de text tipus.",
      "Realitza operacions de manipulació de dades en bases de dades ofimàtiques tipus.",
      "Integra imatges digitals i seqüències de vídeo, utilitzant aplicacions tipus i perifèrics en documents de l'empresa.",
      "Elabora presentacions multimèdia utilitzant aplicacions específiques.",
      "Gestiona el correu i l'agenda electrònica fent servir aplicacions específiques.",
    ] },
  { code: "0441", name: "Tècnica comptable", centreH: 99, empresaH: 53, raCount: 5, dual: true,
    raLabels: [
      "Reconeix els elements que integren el patrimoni d'una organització econòmica classificant-los en masses patrimonials.",
      "Reconeix la metodologia comptable analitzant la terminologia i els instruments comptables utilitzats a l'empresa.",
      "Identifica el contingut bàsic del Pla General de Comptabilitat PIME (PGC-PIME) interpretant-ne l'estructura.",
      "Classifica comptablement fets econòmics bàsics, aplicant la metodologia comptable i els criteris del Pla General de Comptabilitat PIME.",
      "Realitza operacions de comptabilització mitjançant aplicacions informàtiques específiques valorant l'eficiència en la gestió del pla de comptes.",
    ] },
  { code: "0442", name: "Operacions administratives de recursos humans", centreH: 99, empresaH: 66, raCount: 6, dual: true,
    raLabels: [
      "Realitza la tramitació administrativa dels processos de captació i selecció del personal descrivint la documentació associada.",
      "Realitza la tramitació administrativa dels processos de formació, desenvolupament, compensació i beneficis dels treballadors reconeixent la documentació que s'hi genera.",
      "Confecciona la documentació relativa al procés de contractació, variacions de la situació laboral i finalització de contracte, identificant i aplicant la normativa laboral en vigor.",
      "Elabora la documentació corresponent al pagament de retribucions del personal, de cotització a la Seguretat Social i impostos inherents, reconeixent i aplicant la normativa vigent.",
      "Elabora la documentació relativa a les incidències derivades de l'activitat laboral dels treballadors, descrivint i aplicant les normes establertes.",
      "Aplica procediments de qualitat, prevenció de riscos laborals i protecció ambiental a les operacions administratives de recursos humans reconeixent-ne la incidència en un sistema integrat de gestió administrativa.",
    ] },
  { code: "0443", name: "Tractament de la documentació comptable", centreH: 99, empresaH: 66, raCount: 4, dual: true,
    raLabels: [
      "Prepara la documentació suport dels fets comptables interpretant la informació que conté.",
      "Registra comptablement fets econòmics habituals reconeixent i aplicant la metodologia comptable i els criteris del Pla General de Comptabilitat PIME.",
      "Comptabilitza operacions econòmiques habituals corresponents a un exercici econòmic complet, reconeixent i aplicant la metodologia comptable i els criteris del Pla de Comptabilitat.",
      "Comprova els comptes relacionant cada registre comptable amb les dades dels documents suport.",
    ] },
  { code: "0448", name: "Operacions auxiliars de gestió de tresoreria", centreH: 99, empresaH: 66, raCount: 4, dual: true,
    raLabels: [
      "Aplica mètodes de control de tresoreria descrivint-ne les fases.",
      "Realitza els tràmits de contractació, renovació i cancel·lació corresponents a instruments financers bàsics de finançament, inversió i serveis d'aquesta índole que s'utilitzen a l'empresa, descrivint-ne la finalitat.",
      "Efectua càlculs financers bàsics identificant i aplicant les lleis financeres corresponents.",
      "Efectua les operacions bancàries bàsiques interpretant la documentació associada.",
    ] },
];

const CENTRE_MODULES = [
  { code: "0439", name: "Empresa i administració", centreH: 99, raCount: 7, dual: false,
    raLabels: [
      "Descriu les característiques inherents a la innovació empresarial relacionant-les amb l'activitat de creació d'empreses.",
      "Identifica el concepte d'empresa i empresari analitzant-ne la forma jurídica i la normativa a què està subjecte.",
      "Analitza el sistema tributari espanyol reconeixent-ne les finalitats bàsiques així com les dels principals tributs.",
      "Identifica les obligacions fiscals de l'empresa diferenciant els tributs a què està subjecta.",
      "Identifica l'estructura funcional i jurídica de l'Administració pública, i reconeix els diferents organismes i persones que la integren.",
      "Descriu els diferents tipus de relacions entre els administrats i l'Administració i les seves característiques completant documentació que en sorgeix.",
      "Realitza gestions d'obtenció d'informació i presentació de documents davant de les administracions públiques identificant els diferents tipus de registres públics.",
    ] },
  { code: "0446", name: "Empresa a l'aula", centreH: 99, raCount: 7, dual: false, gateDependsOn1r: true,
    raLabels: [
      "Identifica les característiques del projecte d'empresa creada a l'aula i pren part a l'activitat que aquesta desenvolupa.",
      "Transmet informació entre les diferents àrees i clients interns i externs de l'empresa creada a l'aula reconeixent i aplicant tècniques de comunicació.",
      "Organitza informació explicant els diferents mètodes manuals i els sistemes informàtics previstos.",
      "Elabora documentació administrativa, distingint i aplicant les tasques administratives de cadascun dels departaments de l'empresa.",
      "Realitza les activitats derivades de la política comercial, identificant les funcions del departament de vendes i compres.",
      "Atén incidències identificant criteris i procediments de resolució de problemes i de reclamacions.",
      "Treballa en equip reconeixent i valorant les diferents aportacions de cadascun dels membres del grup.",
    ] },
  { code: "C056", name: "Català / Aranès professional", centreH: 66, raCount: 4, dual: false,
    raLabels: [
      "Reconeix informació professional i quotidiana continguda en discursos orals emesos en llengua estàndard, analitzant el contingut global del missatge i relacionant-lo amb els recursos lingüístics corresponents.",
      "Interpreta informació professional continguda en textos escrits senzills, analitzant-ne de manera comprensiva els continguts.",
      "Emet missatges orals clars i ben estructurats habituals en el sector professional, participant com a agent actiu en converses professionals.",
      "Elabora textos senzills en llengua estàndard habituals en el sector professional utilitzant els registres adequats a cada situació.",
    ] },
  { code: "0156", name: "Anglès professional", centreH: 66, raCount: 5, dual: false,
    raLabels: [
      "Comprèn informació, d'índole professional i quotidiana, continguda en discursos orals senzills, emesos en llengua estàndard, desxifrant el contingut global del missatge, i relacionant-lo amb els recursos lingüístics corresponents.",
      "Comprèn informació professional continguda en textos escrits senzills, analitzant de manera comprensiva el seu contingut.",
      "Emet missatges orals senzills, clars i estructurats, participant com a agent actiu en converses professionals.",
      "Redacta textos senzills en llengua estàndard, relacionant les regles gramaticals amb la seva finalitat.",
      "Aplica actituds i comportaments professionals en situacions de comunicació, descrivint les relacions típiques característiques del país de la llengua estrangera.",
    ] },
  { code: "1664", name: "Digitalització aplicada als sectors productius", centreH: 33, raCount: 5, dual: false,
    raLabels: [
      "Estableix les diferències entre l'Economia Lineal (EL) i l'Economia Circular (EC), identificant els avantatges de l'EC en relació amb el medi ambient i el desenvolupament sostenible.",
      "Caracteritza els principals aspectes de la 4a Revolució Industrial indicant els canvis i els avantatges que es produeixen tant des del punt de vista dels clients com de les empreses.",
      "Identifica l'estructura dels sistemes basats en cloud / núvol descrivint la seva tipologia i camp d'aplicació.",
      "Compara els sistemes de producció/prestació de serveis digitalitzats amb els sistemes clàssics identificant les millores introduïdes.",
      "Elabora un pla de transformació d'una empresa clàssica del sector en el qual s'emmarca el títol, basada en una EL, al concepte 4.0, determinant els canvis a introduir en les principals fases del sistema i indicant com afecta als recursos humans.",
    ] },
  { code: "1708", name: "Sostenibilitat aplicada al sistema productiu", centreH: 33, raCount: 6, dual: false,
    raLabels: [
      "Identifica els aspectes ambientals, socials i de governança (ASG) relatius a la sostenibilitat tenint en compte el concepte de desenvolupament sostenible i els marcs internacionals que contribueixen a la seva consecució.",
      "Caracteritza els reptes ambientals i socials als quals s'enfronta la societat, descrivint els impactes sobre les persones i els sectors productius i proposant accions per a minimitzar-los.",
      "Estableix l'aplicació de criteris de sostenibilitat en l'acompliment professional i personal, identificant els elements necessaris.",
      "Proposa productes i serveis responsables tenint en compte els principis de l'economia circular.",
      "Realitza activitats sostenibles minimitzant l'impacte de les mateixes en el medi ambient.",
      "Analitza un pla de sostenibilitat d'una empresa del sector, identificant els seus grups d'interès, els aspectes ASG materials i justificant accions per a la seva gestió i mesurament.",
    ] },
  { code: "1709", name: "Itinerari personal per a l'ocupabilitat I", centreH: 99, raCount: 5, dual: false,
    raLabels: [
      "Distingeix les característiques del sector productiu i defineix els llocs de treball, relacionant-los amb les competències professionals expressades en el títol.",
      "Assoleix les competències necessàries per a l'obtenció del títol de Tècnic Bàsic en Prevenció de Riscos Laborals.",
      "Analitza les seves condicions laborals com a persona treballadora per compte d'altri, identificant-les en els principals tipus de canvis i vicissituds rellevants que es poden presentar en la relació laboral, en la normativa laboral i, especialment, en el conveni col·lectiu del sector.",
      "Analitza i avalua el seu potencial professional i els seus interessos per a guiar-se en el procés d'autoorientació i elabora un full de ruta per a la inserció professional partint de l'anàlisi de les competències, interessos i destreses personals.",
      "Aplica les estratègies per a l'aprenentatge autònom reconeixent el seu valor professionalitzador, dissenyant i optimitzant el seu propi entorn d'aprenentatge fent ús de les tecnologies digitals com a eines d'aprenentatge autònom, sent coherent amb la seva identitat digital i els seus objectius professionals plantejats en el seu pla de desenvolupament individual.",
    ] },
  { code: "1710", name: "Itinerari personal per a l'ocupabilitat II", centreH: 66, raCount: 5, dual: false,
    raLabels: [
      "Planifica i posa en marxa estratègies en els diferents processos selectius d'ocupació que li permeten millorar les seves possibilitats d'inserció laboral.",
      "Aplica estratègies relacionades amb les competències personals, socials i emocionals per al desenvolupament de la seva iniciativa emprenedora i la millora de la seva ocupabilitat.",
      "Posa en pràctica les habilitats emprenedores necessàries per al desenvolupament de processos d'innovació i recerca aplicades que promouen la modernització del sector productiu cap a un model sostenible.",
      "Identifica, defineix i valida idees d'emprenedoria generadores de noves oportunitats a partir d'estratègies d'anàlisi de l'entorn socioproductiu utilitzant metodologies àgils per l'emprenedoria.",
      "Desenvolupa un projecte emprenedor d'innovació social i/o tecnològica aplicada en col·laboració amb l'entorn.",
    ] },
  { code: "1713", name: "Projecte intermodular", centreH: 99, raCount: 5, dual: false, gateDependsOn1r: true,
    raLabels: [
      "Caracteritza les empreses del sector atenent la seva organització i el tipus de producte o servei que ofereixen.",
      "Planteja solucions a les necessitats del sector tenint en compte la seva viabilitat, els costos associats i elaborant un petit projecte.",
      "Planifica l'execució de les activitats proposades a la solució plantejada, determinant el pla d'intervenció i elaborant la documentació corresponent.",
      "Realitza el seguiment de l'execució de les activitats plantejades, verificant que es compleix amb la planificació.",
      "Transmet informació amb claredat, de manera ordenada i estructurada.",
    ] },
  { code: "OPT", name: "Mòdul professional optatiu · Noves eines digitals", centreH: 66, raCount: 4, dual: false,
    raLabels: [
      "Enregistra, tracta i edita elements multimèdia: imatge, so, vídeo.",
      "Dissenya, confecciona i programa pàgines web.",
      "Utilitza nous canals de comunicació digital per al món empresarial: xarxes socials.",
      "Aplica eines d'intel·ligència artificial per al món empresarial.",
    ] },
];

const ALL_MODULES = [...DUAL_MODULES, ...CENTRE_MODULES];
const TOTAL_FCT_HOURS = 515;

// Curs per defecte de cada mòdul — editable des de "Configuració RA".
const DEFAULT_MODULE_COURSE = {
  "0437": "1r", "0438": "1r", "0439": "1r", "0440": "1r", "0441": "1r",
  "C056": "1r", "0156": "1r", "1664": "1r", "1708": "1r", "1709": "1r",
  "0442": "2n", "0443": "2n", "0446": "2n", "0448": "2n", "1710": "2n", "1713": "2n", "OPT": "2n",
};

function defaultWeights(raCount) {
  const base = Math.floor(100 / raCount);
  const arr = Array(raCount).fill(base);
  arr[arr.length - 1] += 100 - base * raCount;
  return arr;
}

/* ---------------------------------------------------------------------- */
/* 2. DADES SIMULADES                                                     */
/* ---------------------------------------------------------------------- */

const GROUPS = ["ADM2", "ADM4"];

const MOCK_STUDENTS = [
  {
    id: "s1", grup: "ADM2", nom: "Laia", cognoms: "Ferrer Puig", tipusDoc: "DNI", dni: "47812345A",
    idalu: "IDALU-00219", telefon: "612345678",
    emailPersonal: "laia.ferrer@example.cat", emailInstitut: "laia.ferrer@insitut.cat",
    nass: "081234567801", inss: "CATSALUT-9981", adreca: "C/ Major, 12", cp: "08201",
    municipi: "Sabadell", pais: "Espanya", genere: "Dona", dataNaixement: "2009-03-14",
    estranger: "No", estudi: "Gestió Administrativa", estudiCodi: "CFGM-GA",
    anyMatricula: "2024",
    pareNom: "Josep", pareCognoms: "Ferrer Solé", pareDni: "38112233X", pareTelefon: "600112233", pareEmail: "josep.ferrer@example.cat",
    autoritzaInfoPares: false,
    notes: makeEmptyNotes({ "0437": [8, 7, 9, 8, 7, 8, 9, 8], "0438": [7, 6, 8, 7, 7], "0441": [6, 5, 7, 6, 6] }),
    notaEmpresa: 8.5,
  },
  {
    id: "s2", grup: "ADM2", nom: "Marc", cognoms: "Solà Vidal", tipusDoc: "DNI", dni: "39876543B",
    idalu: "IDALU-00220", telefon: "623456789",
    emailPersonal: "marc.sola@example.cat", emailInstitut: "marc.sola@insitut.cat",
    nass: "081234567802", inss: "CATSALUT-9982", adreca: "Av. Catalunya, 45", cp: "08202",
    municipi: "Terrassa", pais: "Espanya", genere: "Home", dataNaixement: "2006-11-02",
    estranger: "No", estudi: "Gestió Administrativa", estudiCodi: "CFGM-GA",
    anyMatricula: "2024",
    pareNom: "", pareCognoms: "", pareDni: "", pareTelefon: "", pareEmail: "",
    autoritzaInfoPares: true,
    notes: makeEmptyNotes({ "0441": [4, 5, 4, 5, 4], "0440": [6, 6, 7, 6, 6, 7, 6, 6] }),
    notaEmpresa: null,
  },
  {
    id: "s3", grup: "ADM4", nom: "Nour", cognoms: "El Amrani", tipusDoc: "NIE", dni: "Y1234567C",
    idalu: "IDALU-00221", telefon: "634567890",
    emailPersonal: "nour.elamrani@example.cat", emailInstitut: "nour.elamrani@insitut.cat",
    nass: "081234567803", inss: "CATSALUT-9983", adreca: "C/ Sant Jordi, 3", cp: "08203",
    municipi: "Sabadell", pais: "Marroc", genere: "Dona", dataNaixement: "2009-07-22",
    estranger: "Sí", estudi: "Gestió Administrativa", estudiCodi: "CFGM-GA",
    anyMatricula: "2024",
    pareNom: "Karim", pareCognoms: "El Amrani", pareDni: "Y7654321Z", pareTelefon: "600445566", pareEmail: "karim.elamrani@example.cat",
    autoritzaInfoPares: false,
    notes: makeEmptyNotes({ "0437": [9, 9, 8, 9, 8, 9, 9, 9], "0442": [8, 8, 7, 8, 8, 8], "0441": [7, 7, 6, 7, 7] }),
    notaEmpresa: 9,
  },
  {
    id: "s4", grup: "ADM4", nom: "Pol", cognoms: "Ribas Coma", tipusDoc: "DNI", dni: "41987654D",
    idalu: "IDALU-00222", telefon: "645678901",
    emailPersonal: "pol.ribas@example.cat", emailInstitut: "pol.ribas@insitut.cat",
    nass: "081234567804", inss: "CATSALUT-9984", adreca: "C/ Nova, 8", cp: "08204",
    municipi: "Barberà del Vallès", pais: "Espanya", genere: "Home", dataNaixement: "2006-05-30",
    estranger: "No", estudi: "Gestió Administrativa", estudiCodi: "CFGM-GA",
    anyMatricula: "2024",
    pareNom: "", pareCognoms: "", pareDni: "", pareTelefon: "", pareEmail: "",
    autoritzaInfoPares: false,
    notes: makeEmptyNotes({ "0438": [5, 6, 5, 6, 5], "0448": [6, 5, 6, 5] }),
    notaEmpresa: null,
  },
];

function makeEmptyNotes(prefill) {
  const notes = {};
  ALL_MODULES.forEach((m) => {
    notes[m.code] = prefill[m.code] ? [...prefill[m.code]] : Array(m.raCount).fill(null);
  });
  return notes;
}

const MOCK_COMPANIES = [
  {
    id: "c1", nom: "Gestoria Terradas SL",
    adreca: "C/ Indústria, 22, Sabadell", telefon: "937001122", email: "info@terradas.example",
    responsableNom: "Marta Puig", responsableCarrec: "Gerent",
    tutorNom: "Elena Terradas", tutorTelefon: "937001123", tutorEmail: "elena@terradas.example",
    regim: "Presencial", places: 2, assignats: ["s1"],
    activitats: ["1.1", "1.4", "6.1", "6.2"],
  },
  {
    id: "c2", nom: "Vallès Consultors",
    adreca: "Rambla d'Egara, 10, Terrassa", telefon: "937112233", email: "info@vallesconsultors.example",
    responsableNom: "Jordi Camps", responsableCarrec: "Soci director",
    tutorNom: "Jordi Camps", tutorTelefon: "937112233", tutorEmail: "jcamps@vallesconsultors.example",
    regim: "Híbrid", places: 1, assignats: ["s3"],
    activitats: ["1.2", "2.1", "2.3"],
  },
  {
    id: "c3", nom: "Ferreteria Industrial Bosch",
    adreca: "Polígon Can Parellada, s/n, Barberà del Vallès", telefon: "937223344", email: "info@ferreteriabosch.example",
    responsableNom: "Anna Bosch", responsableCarrec: "Propietària",
    tutorNom: "Anna Bosch", tutorTelefon: "937223344", tutorEmail: "abosch@ferreteriabosch.example",
    regim: "Presencial", places: 3, assignats: [],
    activitats: [],
  },
];

// Pla d'activitats formatives oficial per a la formació en centres de treball (FCT).
const ACTIVITY_PLAN = [
  { id: 1, title: "Recepció, organització i transmissió de la informació i la comunicació a l'empresa, i sistemes d'arxiu", items: [
    { id: "1.1", text: "Selecció i recerca d'informació segons instruccions rebudes." },
    { id: "1.2", text: "Tasques administratives de recepció i/o expedició de documentació i/o paqueteria." },
    { id: "1.3", text: "Classificació de documentació i informació, i/o derivació a les àrees corresponents." },
    { id: "1.4", text: "Enregistrament i/o tramitació de documentació i informació." },
    { id: "1.5", text: "Emplenament i/o elaboració de documents informatius i comunicacions." },
    { id: "1.6", text: "Operacions de manteniment i actualització d'arxius, en diferents tipus de suports." },
    { id: "1.7", text: "Operacions de registre." },
  ] },
  { id: 2, title: "Atenció als clients/usuaris", items: [
    { id: "2.1", text: "Atenció a clients/usuaris en diferents canals de comunicació." },
    { id: "2.2", text: "Seguiment postvenda o del servei prestat." },
    { id: "2.3", text: "Atenció d'incidències i de reclamacions de clients/usuaris, i tramitació." },
    { id: "2.4", text: "Participació en campanyes d'informació o promoció de productes o serveis." },
    { id: "2.5", text: "Participació en processos de seguiment de satisfacció del client/usuari." },
    { id: "2.6", text: "Realització de comunicacions, orals i escrites, amb clients interns en diferents canals de comunicació." },
  ] },
  { id: 3, title: "Aprovisionament i emmagatzematge", items: [
    { id: "3.1", text: "Emplenament i/o elaboració de documents dels circuits de compra." },
    { id: "3.2", text: "Tramitació i/o derivació de documents dels circuits de compra." },
    { id: "3.3", text: "Emplenament i tramitació de documents d'emmagatzematge." },
    { id: "3.4", text: "Control d'estocs i valoració d'existències." },
    { id: "3.5", text: "Tramitació de comandes." },
  ] },
  { id: 4, title: "Suport a l'àrea de recursos humans", items: [
    { id: "4.1", text: "Col·laboració en tasques administratives de processos de selecció de personal." },
    { id: "4.2", text: "Col·laboració en tasques administratives de processos relacionats amb la formació del personal." },
    { id: "4.3", text: "Tramitació i/o preparació de la informació de les tasques administratives de control de presència dels empleats i/o visitants, i de calendari laboral." },
    { id: "4.4", text: "Emplenament, preparació de dades i/o tramitació de documentació administrativa de contractació i/o retribució." },
    { id: "4.5", text: "Tasques administratives de manteniment i actualització de la informació laboral." },
  ] },
  { id: 5, title: "Àrea comercial", items: [
    { id: "5.1", text: "Elaboració d'ofertes i realització d'activitats de venda segons els canals establerts." },
    { id: "5.2", text: "Realització d'activitats de prestació de serveis segons els canals establerts." },
    { id: "5.3", text: "Emplenament i/o elaboració de documentació comercial." },
    { id: "5.4", text: "Tramitació i/o derivació de documents dels circuits de venda i distribució." },
    { id: "5.5", text: "Tasques administratives d'expedició i lliurament de productes i serveis." },
  ] },
  { id: 6, title: "Àrea comptable i fiscal", items: [
    { id: "6.1", text: "Preparació, classificació i/o registre de la documentació suport a l'operativa comptable." },
    { id: "6.2", text: "Comptabilització d'operacions econòmiques i financeres." },
    { id: "6.3", text: "Obtenció de dades i preparació d'informació per les obligacions tributàries." },
    { id: "6.4", text: "Emplenament i/o presentació de declaracions fiscals." },
    { id: "6.5", text: "Obtenció de balanços i comptes de resultats." },
    { id: "6.6", text: "Col·laboració en la preparació i/o redacció de comptes anuals." },
    { id: "6.7", text: "Participació en procediments de comprovació de registres, conciliació, control intern i/o auditoria." },
  ] },
  { id: 7, title: "Suport a l'àrea financera i/o d'assegurances", items: [
    { id: "7.1", text: "Col·laboració en tasques de control de tresoreria." },
    { id: "7.2", text: "Seguiment i control pressupostari." },
    { id: "7.3", text: "Tramitació de documentació administrativa de serveis i/o productes bancaris." },
    { id: "7.4", text: "Tramitació de documentació administrativa d'assegurances." },
    { id: "7.5", text: "Col·laboració en tasques de preparació de documentació i/o arxius telemàtics de pagaments i/o cobraments." },
  ] },
  { id: 8, title: "Suport administratiu a equips de treball", items: [
    { id: "8.1", text: "Recepció de visites, trucades telefòniques i altres comunicacions." },
    { id: "8.2", text: "Realització de tasques administratives de suport a directius o equips de treball." },
    { id: "8.3", text: "Gestió i coordinació d'agendes de directius o membres d'equips de treball." },
    { id: "8.4", text: "Col·laboració en tasques administratives de convocatòria, organització i protocol·lització de reunions i altres esdeveniments d'empresa." },
    { id: "8.5", text: "Elaboració, emplenament o adequació de presentacions multimèdia o de documentació administrativa de tot tipus." },
    { id: "8.6", text: "Emplenament i/o presentació de documentació i/o altres tràmits a administracions públiques." },
  ] },
  { id: 9, title: "Serveis prestats per entitats o organismes públics", items: [
    { id: "9.1", text: "Recepció i/o derivació la documentació rebuda per l'organisme o servei." },
    { id: "9.2", text: "Tramitació i/o gestió de la documentació rebuda." },
    { id: "9.3", text: "Tramitació de la documentació de resposta i/o resolució als interessats." },
    { id: "9.4", text: "Informació, orientació i/o assessorament als usuaris d'un servei públic." },
  ] },
];

const DAYS = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres"];
const HOURS = ["8-9", "9-10", "10-11", "11-12", "12-13", "14-15", "15-16"];

// Files = hores, columnes = dies (així coincideix amb l'ordre de renderització de la taula).
function makeEmptyGrid() {
  return HOURS.map(() => Array(DAYS.length).fill(false));
}
function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}
function makeEmptyTemplate() {
  return HOURS.map(() => Array(DAYS.length).fill(null));
}
// Plantilla de mostra de l'horari de classes de 1r (codi de mòdul o null per franja lliure) —
// n'hi ha una independent per grup, editable des de la pestanya "Horari 1r (plantilla)".
function buildTemplateSeed(cells) {
  const t = makeEmptyTemplate();
  cells.forEach(([r, c, code]) => { t[r][c] = code; });
  return t;
}
const CLASS_TEMPLATE_SEED = {
  ADM2: buildTemplateSeed([
    [0, 0, "0437"], [0, 1, "0437"], [1, 0, "0438"], [1, 1, "0438"],
    [2, 2, "0440"], [2, 3, "0440"], [3, 2, "0441"], [3, 3, "0441"],
    [4, 0, "C056"], [4, 4, "0156"],
  ]),
  ADM4: buildTemplateSeed([
    [0, 2, "0439"], [0, 3, "0439"], [1, 3, "1664"],
    [2, 0, "0437"], [2, 1, "0437"], [3, 0, "0441"], [3, 1, "0441"],
    [4, 2, "0156"],
  ]),
};

/* ---------------------------------------------------------------------- */
/* 3. IMPORTACIÓ — MAPEIG DE CAPÇALERES                                   */
/* ---------------------------------------------------------------------- */

const HEADER_MAP = [
  { field: "nom", labels: ["nom"] },
  { field: "cognoms", labels: ["cognoms"] },
  { field: "tipusDoc", labels: ["tipus document identificatiu", "tipus document"] },
  { field: "dni", labels: ["dni / nie o passaport", "dni", "nie", "passaport"] },
  { field: "idalu", labels: ["idalu o ralc", "idalu", "ralc"] },
  { field: "telefon", labels: ["telefon", "telèfon"] },
  { field: "emailPersonal", labels: ["correu electronic / adreca electronica", "correu electronic", "adreca electronica", "email"] },
  { field: "nass", labels: ["nass"] },
  { field: "inss", labels: ["inss (numero tarjeta sanitaria)/mutua", "inss", "mutua"] },
  { field: "adreca", labels: ["adreca", "adreça"] },
  { field: "cp", labels: ["codi postal", "cp"] },
  { field: "municipi", labels: ["nom del municipi on vius", "municipi"] },
  { field: "pais", labels: ["pais", "país"] },
  { field: "genere", labels: ["genere", "gènere"] },
  { field: "dataNaixement", labels: ["data naixement", "data de naixement"] },
  { field: "estranger", labels: ["ets estranger"] },
  { field: "estudi", labels: ["estudi"] },
  { field: "estudiCodi", labels: ["estudi (codi)"] },
  { field: "anyMatricula", labels: ["any de la primera matricula al cicle formatiu", "any matricula"] },
  { field: "marcaTemps", labels: ["marca de temps"] },
];

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[.…]/g, "")
    .trim();
}

function mapRow(rawRow) {
  const out = { emailInstitut: "", notes: makeEmptyNotes({}), notaEmpresa: null, autoritzaInfoPares: false };
  const keys = Object.keys(rawRow);
  HEADER_MAP.forEach(({ field, labels }) => {
    const key = keys.find((k) => labels.some((l) => normalize(k).includes(l)));
    out[field] = key ? rawRow[key] : "";
  });
  return out;
}

// Camps que realment provenen del fitxer d'importació (no els que l'aplicació hi afegeix
// per defecte, com les notes o el correu de l'institut, que mai s'han de sobreescriure).
const IMPORTABLE_FIELDS = HEADER_MAP.map((h) => h.field);

// Noms curts en català per mostrar els camps a la selecció de "quines dades importar".
const IMPORT_FIELD_LABELS = {
  nom: "Nom", cognoms: "Cognoms", tipusDoc: "Tipus de document", dni: "DNI / NIE / Passaport",
  idalu: "IDALU / RALC", telefon: "Telèfon", emailPersonal: "Correu personal",
  nass: "NASS", inss: "INSS / Mútua", adreca: "Adreça", cp: "Codi postal",
  municipi: "Municipi", pais: "País", genere: "Gènere", dataNaixement: "Data naixement",
  estranger: "Estranger", estudi: "Estudi", estudiCodi: "Estudi (codi)",
  anyMatricula: "Any 1a matrícula", marcaTemps: "Marca de temps",
};

// Retorna l'índex de l'alumne ja existent que coincideix amb la fila importada, si n'hi ha.
// Prova primer per IDALU (identificador més fiable), després per DNI/NIE, i finalment per
// nom+cognoms — així una fila que només porti algunes dades (p. ex. només el DNI, en un
// fitxer d'un altre dia) igualment es pot relacionar amb l'alumne ja existent.
function findExistingStudentIndex(list, incoming) {
  const idalu = normalize(incoming.idalu || "");
  if (idalu) {
    const idx = list.findIndex((s) => normalize(s.idalu || "") === idalu);
    if (idx !== -1) return idx;
  }
  const dni = normalize(incoming.dni || "");
  if (dni) {
    const idx = list.findIndex((s) => normalize(s.dni || "") === dni);
    if (idx !== -1) return idx;
  }
  const nom = normalize(incoming.nom || "");
  const cognoms = normalize(incoming.cognoms || "");
  if (nom && cognoms) {
    const idx = list.findIndex((s) => normalize(s.nom || "") === nom && normalize(s.cognoms || "") === cognoms);
    if (idx !== -1) return idx;
  }
  return -1;
}

// Construeix el "pedaç" a aplicar sobre un alumne ja existent: només els camps que la fila
// importada porta realment omplerts (mai esborra ni buida un camp que ja hi havia).
function buildImportPatch(incoming) {
  const patch = {};
  IMPORTABLE_FIELDS.forEach((f) => {
    const v = incoming[f];
    if (v !== undefined && v !== null && String(v).trim() !== "") patch[f] = v;
  });
  return patch;
}

// Capçaleres exactes de la plantilla d'alumnat — coincideixen amb els patrons de HEADER_MAP
// perquè el fitxer, un cop emplenat, es reconegui perfectament en tornar-lo a importar.
const STUDENT_TEMPLATE_HEADERS = [
  "Nom", "Cognoms", "TIPUS DOCUMENT IDENTIFICATIU", "DNI / NIE o Passaport",
  "IDALU o RALC", "Telèfon", "Correu electrònic / Adreça electrònica",
  "NASS", "INSS (NÚMERO TARJETA SANITARIA)/MÚTUA",
  "Adreça", "Codi postal", "Nom del municipi on vius", "País", "Gènere",
  "Data Naixement", "Ets estranger", "Estudi", "Estudi (Codi)",
  "Any de la primera matricula al cicle formatiu", "Marca de temps",
];

function downloadStudentTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([STUDENT_TEMPLATE_HEADERS]);
  ws["!cols"] = STUDENT_TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alumnat");
  XLSX.writeFile(wb, "plantilla-alumnat.xlsx");
}

// Plantilla de notes en format "llarg" (una fila per alumne + mòdul + RA) perquè sigui
// fàcil d'emplenar i d'importar, sense necessitat de crear una columna per cada RA.
function downloadNotesTemplate(students) {
  const rows = [["DNI / NIE", "Nom", "Cognoms", "Codi mòdul", "Mòdul", "RA", "Nota (0-10)"]];
  students.forEach((s) => {
    ALL_MODULES.forEach((m) => {
      for (let i = 1; i <= m.raCount; i++) {
        rows.push([s.dni || "", s.nom || "", s.cognoms || "", m.code, m.name, `RA${i}`, ""]);
      }
    });
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 10 }, { wch: 45 }, { wch: 6 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Notes RA");
  XLSX.writeFile(wb, "plantilla-notes-ra.xlsx");
}

// Llegeix una fila del fitxer de notes, identificant les columnes encara que l'usuari
// n'hagi canviat lleugerament els noms.
function mapNotesRow(rawRow) {
  const keys = Object.keys(rawRow);
  const dniKey = keys.find((k) => { const n = normalize(k); return n.includes("dni") || n.includes("nie"); });
  const moduleCodeKey =
    keys.find((k) => { const n = normalize(k); return n.includes("codi") && n.includes("modul"); }) ||
    keys.find((k) => normalize(k).includes("modul"));
  const raKey = keys.find((k) => normalize(k).includes("ra"));
  const notaKey = keys.find((k) => normalize(k).includes("nota"));
  return {
    dni: dniKey ? String(rawRow[dniKey]).trim() : "",
    moduleCode: moduleCodeKey ? String(rawRow[moduleCodeKey]).trim() : "",
    raNumber: raKey ? parseInt(String(rawRow[raKey]).replace(/[^0-9]/g, ""), 10) : NaN,
    nota: notaKey ? rawRow[notaKey] : "",
  };
}

/* ---------------------------------------------------------------------- */
/* 4. COMPONENTS AUXILIARS                                                */
/* ---------------------------------------------------------------------- */

function Badge({ tone, children, icon: Icon }) {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    slate: "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${tones[tone]}`}>
      {Icon && <Icon size={13} />}
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <div className={`bg-white shadow-sm border border-slate-200 rounded-xl ${className}`}>{children}</div>;
}

function StatTile({ label, value, tone, icon: Icon }) {
  const tones = {
    green: "text-green-600", red: "text-red-600", orange: "text-orange-500", sky: "text-sky-600", slate: "text-slate-500",
  };
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-slate-50 ${tones[tone]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-800 leading-none">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{label}</p>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------- */
/* 5. LÒGICA ACADÈMICA                                                    */
/* ---------------------------------------------------------------------- */

function weightedGrade(raGrades, weights) {
  const known = raGrades.map((g, i) => (g == null ? null : { g, w: weights[i] }));
  const usedWeight = known.reduce((s, k) => s + (k ? k.w : 0), 0);
  if (usedWeight === 0) return null;
  const sum = known.reduce((s, k) => s + (k ? k.g * k.w : 0), 0);
  return sum / usedWeight;
}

function moduleFinalGrade(student, mod, weights) {
  const centreGrade = weightedGrade(student.notes[mod.code], weights);
  if (centreGrade == null) return { grade: null, pending: true };
  if (mod.dual) {
    const empresaGrade = student.notaEmpresa;
    if (empresaGrade == null) return { grade: centreGrade, pending: true, centreOnly: true };
    return { grade: centreGrade * 0.9 + empresaGrade * 0.1, pending: false };
  }
  return { grade: centreGrade, pending: false };
}

function distributePercentages(parts, total) {
  // Repartició per "largest remainder" perquè els percentatges sempre sumin exactament 100.
  if (!total) return parts.map(() => 0);
  const raw = parts.map((p) => (p / total) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw.map((v, i) => ({ i, frac: v - floors[i] })).sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < remainder; k++) result[order[k].i]++;
  return result;
}

function studentAcademicStatus(student, raWeights, moduleCourse) {
  const grades = {};
  ALL_MODULES.forEach((m) => { grades[m.code] = moduleFinalGrade(student, m, raWeights[m.code]); });

  // Superació de 1r calculada automàticament a partir de l'assoliment dels mòduls marcats com "1r".
  // Només compten les hores de CENTRE de cada mòdul (no les d'empresa) — així el total (858h amb
  // la configuració per defecte) coincideix amb la columna "Hores de primer" del currículum oficial.
  // Per determinar si un mòdul està superat només es té en compte la nota de centre (RA ponderats),
  // ja que la nota d'empresa encara no s'ha generat quan es fa aquesta comprovació.
  const mods1r = ALL_MODULES.filter((m) => (moduleCourse[m.code] || "1r") === "1r");
  let totalH1r = 0, superatH = 0, suspesH = 0, pendentH = 0;
  mods1r.forEach((m) => {
    const totH = m.centreH;
    totalH1r += totH;
    const centreGrade = weightedGrade(student.notes[m.code], raWeights[m.code]);
    if (centreGrade == null) pendentH += totH;
    else if (centreGrade >= 5) superatH += totH;
    else suspesH += totH;
  });
  const [pctSuperat, pctSuspes, pctPendent] = distributePercentages([superatH, suspesH, pendentH], totalH1r);
  const pctHores1r = pctSuperat;

  const aptePractiques = pctHores1r >= 80;
  const suspes441 = grades["0441"].grade != null && !grades["0441"].pending && grades["0441"].grade < 5;

  const blocks = [];
  if (!aptePractiques) {
    blocks.push({ target: "Accés a Pràctiques (FCT)", reason: `Només ${pctHores1r}% d'hores de 1r superades (cal ≥80%)` });
    blocks.push({ target: "0446. Empresa a l'aula", reason: "Requereix ≥80% d'hores de 1r superades" });
    blocks.push({ target: "1713. Projecte intermodular", reason: "Requereix ≥80% d'hores de 1r superades" });
  }
  if (suspes441) {
    blocks.push({ target: "0443. Tractament de la documentació comptable", reason: "0441. Tècnica comptable suspesa" });
  }
  return {
    grades, aptePractiques, pctHores1r, blocks,
    hores1r: { totalH1r, superatH, suspesH, pendentH, pctSuperat, pctSuspes, pctPendent },
  };
}

function calcAge(dataNaixement) {
  if (!dataNaixement) return null;
  const birth = new Date(dataNaixement);
  if (isNaN(birth)) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

// A partir de la plantilla d'horari de 1r, calcula automàticament quines franges són "classe
// pendent" per a un alumne concret: només compten les franges amb un mòdul assignat que l'alumne
// encara no tingui superat (suspès o sense nota) amb la nota de centre. Si ja l'ha superat, la
// franja deixa d'aparèixer com a pendent i, per tant, deixa de generar conflicte amb les pràctiques.
function derivedClassGrid(template, student, raWeights) {
  const grid = makeEmptyGrid();
  template.forEach((row, r) => row.forEach((code, c) => {
    if (!code) return;
    const mod = ALL_MODULES.find((m) => m.code === code);
    if (!mod) return;
    const centreGrade = weightedGrade(student.notes[mod.code], raWeights[mod.code]);
    const passed = centreGrade != null && centreGrade >= 5;
    grid[r][c] = !passed;
  }));
  return grid;
}

function toIsoDate(d) {
  return d.toISOString().slice(0, 10);
}

// Compta les hores de pràctiques dia a dia dins d'un període (en lloc de fer una
// mitjana per setmanes), excloent sempre els caps de setmana i qualsevol data marcada
// com a festiu/vacances al calendari. Retorna també els conflictes amb l'horari de 1r.
function countPeriodHours(period, classGrid, holidaySet) {
  let hours = 0, conflicts = 0, days = 0;
  if (!period.dataInici || !period.dataFinal) return { hours, conflicts, days };
  const start = new Date(period.dataInici);
  const end = new Date(period.dataFinal);
  if (!(end >= start)) return { hours, conflicts, days };
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay(); // 0 = diumenge ... 6 = dissabte
    if (dow === 0 || dow === 6) continue; // cap de setmana: mai compta
    if (holidaySet.has(toIsoDate(d))) continue; // festiu / vacances marcat al calendari
    const c = dow - 1; // 0 = Dilluns ... 4 = Divendres
    let dayHours = 0, dayConflicts = 0;
    period.ticks.forEach((row, r) => {
      if (row[c]) {
        dayHours += 1;
        if (classGrid[r][c]) dayConflicts += 1;
      }
    });
    if (dayHours > 0) days += 1;
    hours += dayHours;
    conflicts += dayConflicts;
  }
  return { hours, conflicts, days };
}

function scheduleStatus(student, schedule, classGrid = makeEmptyGrid(), holidaySet = new Set()) {
  let totalHours = 0, conflicts = 0, totalDays = 0;
  const perPeriod = (schedule.periods || []).map((p) => {
    const { hours, conflicts: periodConflicts, days } = countPeriodHours(p, classGrid, holidaySet);
    totalHours += hours;
    conflicts += periodConflicts;
    totalDays += days;
    return { id: p.id, dataInici: p.dataInici, dataFinal: p.dataFinal, hours, days, conflicts: periodConflicts };
  });
  const target = TOTAL_FCT_HOURS * (1 - (schedule.reduccio || 0) / 100);
  return { perPeriod, totalHours, totalDays, target, complete: totalHours >= target && target > 0, conflicts };
}

/* ---------------------------------------------------------------------- */
/* 6. APP                                                                 */
/* ---------------------------------------------------------------------- */

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "import", label: "Importació", icon: FileSpreadsheet },
  { id: "ra", label: "Configuració RA", icon: Settings },
  { id: "horariTemplate", label: "Horari 1r (plantilla)", icon: CalendarDays },
  { id: "calendari", label: "Calendari de festius", icon: CalendarOff },
  { id: "students", label: "Alumnat", icon: Users },
  { id: "companies", label: "Empreses", icon: Building2 },
  { id: "trash", label: "Paperera", icon: Trash2 },
];

export default function App() {
  // Dades carregades des del Google Drive de l'usuari (injectades per AuthGate abans de
  // muntar aquest component). Si no hi ha res desat encara, es parteix de les dades de mostra.
  const initial = (typeof window !== "undefined" && window.__INITIAL_DATA__) || {};

  const [tab, setTab] = useState("dashboard");
  const [activeGroup, setActiveGroup] = useState(initial.activeGroup || "ADM2");
  const [students, setStudents] = useState(initial.students || MOCK_STUDENTS);
  const [companies, setCompanies] = useState(initial.companies || MOCK_COMPANIES);
  const [raWeights, setRaWeights] = useState(() => {
    if (initial.raWeights) return initial.raWeights;
    const w = {};
    ALL_MODULES.forEach((m) => { w[m.code] = defaultWeights(m.raCount); });
    return w;
  });
  const [moduleCourse, setModuleCourse] = useState(initial.moduleCourse || DEFAULT_MODULE_COURSE);
  const [classTemplate, setClassTemplate] = useState(initial.classTemplate || CLASS_TEMPLATE_SEED);
  const [schedules, setSchedules] = useState(() => {
    if (initial.schedules) return initial.schedules;
    const s = {};
    students.forEach((st) => {
      s[st.id] = { reduccio: 0, periods: [{ id: "p1", dataInici: "2026-04-01", dataFinal: "2026-06-19", ticks: makeEmptyGrid() }] };
    });
    return s;
  });
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [holidays, setHolidays] = useState(initial.holidays || []); // dates "AAAA-MM-DD" marcades com a festiu/vacances

  // Desa automàticament al Drive (amb un petit debounce) cada vegada que canvien les dades
  // persistents. onDataChange l'injecta AuthGate; si no existeix (p. ex. en desenvolupament
  // local sense login), aquest efecte simplement no fa res.
  useEffect(() => {
    if (typeof window === "undefined" || !window.__SAVE_DATA__) return;
    const payload = { activeGroup, students, companies, raWeights, moduleCourse, classTemplate, schedules, holidays };
    const t = setTimeout(() => window.__SAVE_DATA__(payload), 800);
    return () => clearTimeout(t);
  }, [activeGroup, students, companies, raWeights, moduleCourse, classTemplate, schedules, holidays]);

  function changeGroup(g) {
    setActiveGroup(g);
    setSelectedStudentId(null);
  }

  function toggleHoliday(dateIso) {
    setHolidays((prev) => (prev.includes(dateIso) ? prev.filter((d) => d !== dateIso) : [...prev, dateIso]));
  }

  const holidaySet = useMemo(() => new Set(holidays), [holidays]);

  const groupStudents = useMemo(() => students.filter((s) => (s.grup || "ADM2") === activeGroup && !s.trashedAt), [students, activeGroup]);
  const activeStudents = useMemo(() => students.filter((s) => !s.trashedAt), [students]);
  const activeCompanies = useMemo(() => companies.filter((c) => !c.trashedAt), [companies]);

  const statuses = useMemo(() => {
    const m = {};
    students.forEach((s) => { m[s.id] = studentAcademicStatus(s, raWeights, moduleCourse); });
    return m;
  }, [students, raWeights, moduleCourse]);

  const classGrids = useMemo(() => {
    const m = {};
    students.forEach((s) => { m[s.id] = derivedClassGrid(classTemplate[s.grup || "ADM2"] || makeEmptyTemplate(), s, raWeights); });
    return m;
  }, [students, classTemplate, raWeights]);

  const scheduleStatuses = useMemo(() => {
    const m = {};
    students.forEach((s) => { m[s.id] = scheduleStatus(s, schedules[s.id] || { periods: [], reduccio: 0 }, classGrids[s.id], holidaySet); });
    return m;
  }, [students, schedules, classGrids, holidaySet]);

  function updateStudent(id, patch) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function updateStudentNotes(id, moduleCode, raIndex, value) {
    setStudents((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const notes = { ...s.notes, [moduleCode]: [...s.notes[moduleCode]] };
      notes[moduleCode][raIndex] = value === "" ? null : Math.round(Number(value) * 100) / 100;
      return { ...s, notes };
    }));
  }
  function updateNotaEmpresa(id, value) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, notaEmpresa: value === "" ? null : Math.round(Number(value) * 100) / 100 } : s)));
  }
  function updateSchedule(id, patch) {
    setSchedules((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }
  function addPeriod(id) {
    setSchedules((prev) => {
      const periods = prev[id].periods;
      if (periods.length >= 5) return prev;
      const newPeriod = { id: "p" + Math.random().toString(36).slice(2, 7), dataInici: "", dataFinal: "", ticks: makeEmptyGrid() };
      return { ...prev, [id]: { ...prev[id], periods: [...periods, newPeriod] } };
    });
  }
  function removePeriod(id, periodId) {
    setSchedules((prev) => {
      const periods = prev[id].periods;
      if (periods.length <= 1) return prev;
      return { ...prev, [id]: { ...prev[id], periods: periods.filter((p) => p.id !== periodId) } };
    });
  }
  function updatePeriod(id, periodId, patch) {
    setSchedules((prev) => ({
      ...prev,
      [id]: { ...prev[id], periods: prev[id].periods.map((p) => (p.id === periodId ? { ...p, ...patch } : p)) },
    }));
  }
  function toggleTick(id, periodId, r, c) {
    setSchedules((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        periods: prev[id].periods.map((p) => {
          if (p.id !== periodId) return p;
          const grid = p.ticks.map((row) => [...row]);
          grid[r][c] = !grid[r][c];
          return { ...p, ticks: grid };
        }),
      },
    }));
  }
  function setTemplateCell(group, r, c, moduleCode) {
    setClassTemplate((prev) => {
      const grid = cloneGrid(prev[group] || makeEmptyTemplate());
      grid[r][c] = moduleCode || null;
      return { ...prev, [group]: grid };
    });
  }
  function assignCompanyToStudent(studentId, companyId) {
    setCompanies((prev) => prev.map((c) => {
      const withoutStudent = c.assignats.filter((id) => id !== studentId);
      if (c.id === companyId) return { ...c, assignats: [...withoutStudent, studentId] };
      return { ...c, assignats: withoutStudent };
    }));
  }
  function addImportedStudents(newOnes) {
    const working = students.map((s) => ({ ...s }));
    const newIds = [];
    let addedCount = 0, updatedCount = 0;

    newOnes.forEach((n) => {
      const idx = findExistingStudentIndex(working, n);
      if (idx !== -1) {
        const patch = buildImportPatch(n);
        if (Object.keys(patch).length) {
          working[idx] = { ...working[idx], ...patch };
          updatedCount++;
        }
        return;
      }
      const id = "s" + Math.random().toString(36).slice(2, 9);
      working.push({ id, grup: activeGroup, ...n });
      newIds.push(id);
      addedCount++;
    });

    setStudents(working);
    if (newIds.length) {
      setSchedules((prev) => {
        const next = { ...prev };
        newIds.forEach((id) => {
          next[id] = { reduccio: 0, periods: [{ id: "p1", dataInici: "", dataFinal: "", ticks: makeEmptyGrid() }] };
        });
        return next;
      });
    }
    return { added: addedCount, updated: updatedCount, skipped: newOnes.length - addedCount - updatedCount };
  }

  // Aplica un fitxer de notes en format llarg (DNI, codi de mòdul, RA, nota) als alumnes
  // corresponents. Retorna un resum comptat de manera determinista (no depèn de quan
  // React apliqui l'actualització d'estat).
  function importNotesGrid(rows) {
    let updated = 0, studentNotFound = 0, moduleOrRaInvalid = 0;
    const byDni = {};
    students.forEach((s) => { const k = normalize(s.dni); if (k) byDni[k] = true; });
    rows.forEach((r) => {
      const key = normalize(r.dni);
      if (!key || !byDni[key]) { studentNotFound++; return; }
      if (r.nota === "" || r.nota == null || isNaN(Number(r.nota))) return; // buida: es deixa tal com estava
      const mod = ALL_MODULES.find((m) => m.code === r.moduleCode) || ALL_MODULES.find((m) => normalize(m.name) === normalize(r.moduleCode));
      if (!mod || !r.raNumber || r.raNumber < 1 || r.raNumber > mod.raCount) { moduleOrRaInvalid++; return; }
      updated++;
    });
    setStudents((prev) => prev.map((s) => {
      const key = normalize(s.dni);
      if (!key) return s;
      const relevant = rows.filter((r) => normalize(r.dni) === key);
      if (!relevant.length) return s;
      let notes = s.notes;
      let changed = false;
      relevant.forEach((r) => {
        if (r.nota === "" || r.nota == null || isNaN(Number(r.nota))) return;
        const mod = ALL_MODULES.find((m) => m.code === r.moduleCode) || ALL_MODULES.find((m) => normalize(m.name) === normalize(r.moduleCode));
        if (!mod || !r.raNumber || r.raNumber < 1 || r.raNumber > mod.raCount) return;
        if (!changed) { notes = { ...s.notes }; changed = true; }
        notes[mod.code] = [...notes[mod.code]];
        notes[mod.code][r.raNumber - 1] = Math.round(Number(r.nota) * 100) / 100;
      });
      return changed ? { ...s, notes } : s;
    }));
    return { updated, studentNotFound, moduleOrRaInvalid };
  }
  function trashStudent(id) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, trashedAt: new Date().toISOString() } : s)));
    setCompanies((prev) => prev.map((c) => ({ ...c, assignats: c.assignats.filter((sid) => sid !== id) })));
    if (selectedStudentId === id) setSelectedStudentId(null);
  }
  function restoreStudent(id) {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, trashedAt: null } : s)));
  }
  function deleteStudentForever(id) {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSchedules((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setCompanies((prev) => prev.map((c) => ({ ...c, assignats: c.assignats.filter((sid) => sid !== id) })));
  }
  function trashCompany(id) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, trashedAt: new Date().toISOString(), assignats: [] } : c)));
  }
  function restoreCompany(id) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, trashedAt: null } : c)));
  }
  function deleteCompanyForever(id) {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedCompany = selectedStudent ? companies.find((c) => c.assignats.includes(selectedStudent.id)) : null;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-56 w-full bg-white border-b md:border-b-0 md:border-r border-slate-200 flex md:flex-col shrink-0">
        <div className="px-5 py-4 border-b border-slate-100 hidden md:block">
          <p className="font-semibold text-slate-800 leading-tight">2n GA · LOMLOE</p>
          <p className="text-xs text-slate-400 mt-0.5">Gestió i tutoria FCT</p>
        </div>
        <div className="px-5 py-3 border-b border-slate-100">
          <span className="text-xs text-slate-400">Grup actiu</span>
          <select
            value={activeGroup} onChange={(e) => changeGroup(e.target.value)}
            className="w-full mt-1 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedStudentId(null); }}
              className={`flex items-center gap-2.5 px-5 py-3 text-sm font-medium whitespace-nowrap border-l-2 md:border-l-2 border-b-2 md:border-b-0 transition-colors ${
                tab === t.id
                  ? "border-sky-500 text-sky-600 bg-sky-50/60"
                  : "border-transparent text-slate-500 hover:bg-slate-50"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl">
        {tab === "dashboard" && <Dashboard activeGroup={activeGroup} students={groupStudents} statuses={statuses} scheduleStatuses={scheduleStatuses} companies={activeCompanies} />}
        {tab === "import" && <ImportTab activeGroup={activeGroup} students={groupStudents} onImport={addImportedStudents} onImportNotes={importNotesGrid} />}
        {tab === "ra" && <RaConfigTab raWeights={raWeights} setRaWeights={setRaWeights} moduleCourse={moduleCourse} setModuleCourse={setModuleCourse} />}
        {tab === "horariTemplate" && (
          <ClassTemplateTab
            activeGroup={activeGroup}
            template={classTemplate[activeGroup] || makeEmptyTemplate()}
            onSetCell={(r, c, code) => setTemplateCell(activeGroup, r, c, code)}
            moduleCourse={moduleCourse}
          />
        )}
        {tab === "calendari" && <HolidayCalendarTab holidays={holidays} onToggle={toggleHoliday} />}
        {tab === "students" && !selectedStudent && (
          <StudentsList activeGroup={activeGroup} students={groupStudents} statuses={statuses} scheduleStatuses={scheduleStatuses} onSelect={setSelectedStudentId} onTrash={trashStudent} />
        )}
        {tab === "students" && selectedStudent && (
          <StudentDetail
            student={selectedStudent}
            status={statuses[selectedStudent.id]}
            raWeights={raWeights}
            moduleCourse={moduleCourse}
            schedule={schedules[selectedStudent.id]}
            scheduleStatus={scheduleStatuses[selectedStudent.id]}
            classGrid={classGrids[selectedStudent.id] || makeEmptyGrid()}
            classTemplate={classTemplate[selectedStudent.grup || "ADM2"] || makeEmptyTemplate()}
            companies={activeCompanies}
            assignedCompanyId={selectedCompany ? selectedCompany.id : ""}
            onAssignCompany={(companyId) => assignCompanyToStudent(selectedStudent.id, companyId)}
            onBack={() => setSelectedStudentId(null)}
            onTrash={() => trashStudent(selectedStudent.id)}
            onUpdateStudent={(patch) => updateStudent(selectedStudent.id, patch)}
            onUpdateNote={(mod, i, v) => updateStudentNotes(selectedStudent.id, mod, i, v)}
            onUpdateNotaEmpresa={(v) => updateNotaEmpresa(selectedStudent.id, v)}
            onUpdateSchedule={(patch) => updateSchedule(selectedStudent.id, patch)}
            onAddPeriod={() => addPeriod(selectedStudent.id)}
            onRemovePeriod={(periodId) => removePeriod(selectedStudent.id, periodId)}
            onUpdatePeriod={(periodId, patch) => updatePeriod(selectedStudent.id, periodId, patch)}
            onToggleTick={(periodId, r, c) => toggleTick(selectedStudent.id, periodId, r, c)}
          />
        )}
        {tab === "companies" && (
          <CompaniesTab companies={activeCompanies} setCompanies={setCompanies} students={activeStudents} onAssignCompany={assignCompanyToStudent} onTrashCompany={trashCompany} />
        )}
        {tab === "trash" && (
          <TrashTab
            students={students.filter((s) => s.trashedAt)}
            companies={companies.filter((c) => c.trashedAt)}
            onRestoreStudent={restoreStudent}
            onDeleteStudentForever={deleteStudentForever}
            onRestoreCompany={restoreCompany}
            onDeleteCompanyForever={deleteCompanyForever}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 7. DASHBOARD                                                           */
/* ---------------------------------------------------------------------- */

function Dashboard({ activeGroup, students, statuses, scheduleStatuses, companies }) {
  const total = students.length;
  const menors = students.filter((s) => { const age = calcAge(s.dataNaixement); return age != null && age < 18; }).length;
  const majors = students.filter((s) => { const age = calcAge(s.dataNaixement); return age != null && age >= 18; }).length;
  const apte = students.filter((s) => statuses[s.id].aptePractiques).length;
  const noPotCursar = students.filter((s) => statuses[s.id].blocks.some((b) => b.target !== "Accés a Pràctiques (FCT)")).length;
  const assignedIds = new Set(companies.flatMap((c) => c.assignats));
  const fentPractiques = students.filter((s) => assignedIds.has(s.id)).length;
  const senseAssignar = total - fentPractiques;
  const placesTotal = companies.reduce((sum, c) => sum + c.places, 0);
  const placesAdjudicades = companies.reduce((sum, c) => sum + c.assignats.length, 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Dashboard del grup {activeGroup}</h1>
      <p className="text-sm text-slate-500 mb-6">Visió general de {students.length} alumnes — curs 2n GA (LOMLOE)</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile label="Alumnes totals" value={total} tone="slate" icon={Users} />
        <StatTile label="Menors / Majors d'edat" value={`${menors} / ${majors}`} tone="slate" icon={ClipboardList} />
        <StatTile label="Poden fer pràctiques" value={`${apte}/${total}`} tone="green" icon={CheckCircle2} />
        <StatTile label="No poden cursar alguna assignatura" value={noPotCursar} tone="red" icon={XCircle} />
        <StatTile label="Fent pràctiques" value={fentPractiques} tone="sky" icon={BriefcaseBusiness} />
        <StatTile label="Sense assignar a pràctiques" value={senseAssignar} tone="orange" icon={AlertTriangle} />
        <StatTile label="Places de pràctiques" value={placesTotal} tone="slate" icon={Building2} />
        <StatTile label="Places adjudicades" value={`${placesAdjudicades}/${placesTotal}`} tone="green" icon={CheckCircle2} />
      </div>
      <p className="text-xs text-slate-400 -mt-5 mb-8">Les places de pràctiques i adjudicades compten totes les empreses col·laboradores (compartides entre grups).</p>

      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-4">Estat individual</p>
        <div className="divide-y divide-slate-100">
          {students.map((s) => {
            const st = statuses[s.id];
            const sc = scheduleStatuses[s.id];
            return (
              <div key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.nom} {s.cognoms}</p>
                  <p className="text-xs text-slate-400">{st.pctHores1r}% hores de 1r · {sc.totalHours}h / {sc.target}h FCT</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {st.aptePractiques ? <Badge tone="green" icon={CheckCircle2}>Apte pràctiques</Badge> : <Badge tone="red" icon={XCircle}>No apte 1r</Badge>}
                  {st.blocks.length > 0 && <Badge tone="red" icon={XCircle}>{st.blocks.length} bloqueig(s)</Badge>}
                  {sc.complete ? <Badge tone="green" icon={CheckCircle2}>Hores FCT completes</Badge> : <Badge tone="orange" icon={Clock}>Falten {Math.max(0, Math.round(sc.target - sc.totalHours))}h</Badge>}
                  {sc.conflicts > 0 && <Badge tone="orange" icon={AlertTriangle}>{sc.conflicts} conflicte(s)</Badge>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 8. IMPORTACIÓ                                                          */
/* ---------------------------------------------------------------------- */

function ImportTab({ activeGroup, students, onImport, onImportNotes }) {
  const [preview, setPreview] = useState(null);
  const [selectedFields, setSelectedFields] = useState(new Set());
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const [notesPreview, setNotesPreview] = useState(null);
  const [notesFileName, setNotesFileName] = useState("");
  const [notesError, setNotesError] = useState("");
  const [notesResult, setNotesResult] = useState(null);
  const notesInputRef = useRef(null);

  const fieldsWithData = useMemo(() => {
    if (!preview) return [];
    return IMPORTABLE_FIELDS.filter((f) => preview.some((r) => r[f] && String(r[f]).trim() !== ""));
  }, [preview]);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (!rows.length) { setError("El fitxer no conté files de dades."); return; }
        const mapped = rows.map(mapRow);
        setPreview(mapped);
        const withData = IMPORTABLE_FIELDS.filter((f) => mapped.some((r) => r[f] && String(r[f]).trim() !== ""));
        setSelectedFields(new Set(withData)); // per defecte, tot el que s'ha detectat queda marcat
      } catch (err) {
        setError("No s'ha pogut llegir el fitxer. Comprova que sigui un .xlsx, .xls o .csv vàlid.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function toggleField(f) {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  }

  function confirmImport() {
    const filtered = preview.map((r) => {
      const out = { ...r };
      IMPORTABLE_FIELDS.forEach((f) => { if (!selectedFields.has(f)) delete out[f]; });
      return out;
    });
    const { added, updated, skipped } = onImport(filtered);
    setResult({ added, updated, skipped, total: preview.length });
    setPreview(null);
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleNotesFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setNotesFileName(file.name);
    setNotesError("");
    setNotesResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (!rows.length) { setNotesError("El fitxer no conté files de dades."); return; }
        const mapped = rows.map(mapNotesRow).filter((r) => r.dni && r.moduleCode && r.nota !== "");
        if (!mapped.length) { setNotesError("No s'ha trobat cap fila amb DNI, mòdul i nota omplerts."); return; }
        setNotesPreview(mapped);
      } catch (err) {
        setNotesError("No s'ha pogut llegir el fitxer. Comprova que sigui un .xlsx, .xls o .csv vàlid.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function confirmNotesImport() {
    const res = onImportNotes(notesPreview);
    setNotesResult(res);
    setNotesPreview(null);
    setNotesFileName("");
    if (notesInputRef.current) notesInputRef.current.value = "";
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-800 mb-1">Importació d'alumnat</h1>
        <p className="text-sm text-slate-500 mb-4">Carrega un Excel (.xlsx/.xls) o CSV amb les dades de matriculació. Els camps es reconeixen automàticament. Els alumnes importats s'afegiran al grup actiu: <span className="font-medium text-sky-600">{activeGroup}</span>.</p>

        <button onClick={downloadStudentTemplate} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-sky-300 mb-4">
          <FileSpreadsheet size={15} /> Descarrega la plantilla d'alumnat (Excel en blanc)
        </button>

        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed">
          <UploadCloud className="text-sky-500 mb-3" size={32} />
          <p className="text-sm text-slate-600 mb-1">Arrossega un fitxer o fes clic per seleccionar-lo</p>
          <p className="text-xs text-slate-400 mb-4">.xlsx, .xls, .csv</p>
          <label className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium cursor-pointer hover:bg-sky-600 transition-colors">
            Selecciona fitxer
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />
          </label>
          {fileName && <p className="text-xs text-slate-500 mt-3">Fitxer: {fileName}</p>}
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </Card>

        {preview && (
          <Card className="p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-700">Vista prèvia — {preview.length} alumne(s) detectats</p>
              <button
                onClick={confirmImport} disabled={selectedFields.size === 0}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={15} /> Incorporar a l'expedient de classe
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">Quines dades vols importar d'aquest fitxer?</p>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedFields(new Set(fieldsWithData))} className="text-xs text-sky-600 hover:underline">Selecciona-ho tot</button>
                  <button onClick={() => setSelectedFields(new Set())} className="text-xs text-slate-400 hover:underline">Cap</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {fieldsWithData.map((f) => (
                  <label key={f} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <input
                      type="checkbox" checked={selectedFields.has(f)} onChange={() => toggleField(f)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-300"
                    />
                    {IMPORT_FIELD_LABELS[f] || f}
                  </label>
                ))}
              </div>
              {fieldsWithData.length === 0 && <p className="text-xs text-slate-400">No s'ha detectat cap columna amb dades reconegudes.</p>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-4">Nom</th>
                    <th className="py-2 pr-4">Cognoms</th>
                    <th className="py-2 pr-4">DNI/NIE</th>
                    <th className="py-2 pr-4">IDALU</th>
                    <th className="py-2 pr-4">Correu personal</th>
                    <th className="py-2 pr-4">Municipi</th>
                    <th className="py-2 pr-4">Estudi</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 text-slate-600">
                      <td className="py-2 pr-4">{selectedFields.has("nom") ? r.nom : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("cognoms") ? r.cognoms : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("dni") ? r.dni : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("idalu") ? r.idalu : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("emailPersonal") ? r.emailPersonal : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("municipi") ? r.municipi : <span className="text-slate-300">—</span>}</td>
                      <td className="py-2 pr-4">{selectedFields.has("estudi") ? r.estudi : <span className="text-slate-300">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">Si un alumne ja existeix a la classe (mateix IDALU, DNI/NIE, o mateix nom+cognoms), no es duplicarà: en lloc d'afegir-lo de nou, les dades noves que aporti aquesta fila (i només les que aportin contingut i tinguis marcades a dalt) s'incorporaran al seu expedient, sense esborrar res del que ja hi havia.</p>
          </Card>
        )}

        {result && (
          <Card className="p-5 mt-6">
            <p className="text-sm font-medium text-slate-700 mb-1">Resultat de la importació</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge tone="green" icon={CheckCircle2}>{result.added} alumne(s) nou(s) afegit(s)</Badge>
              {result.updated > 0 && <Badge tone="sky" icon={CheckCircle2}>{result.updated} alumne(s) actualitzat(s) amb dades noves</Badge>}
              {result.skipped > 0 && <Badge tone="slate">{result.skipped} fila(es) sense canvis</Badge>}
            </div>
            {result.added === 0 && result.updated === 0 && result.total > 0 && (
              <p className="text-xs text-orange-500 mt-3">
                No s'ha afegit ni actualitzat cap alumne: les files no aportaven cap dada nova respecte al que ja hi havia. Si esperaves que sí, revisa que el fitxer tingui columnes de nom, cognoms, IDALU o DNI/NIE ben identificables.
              </p>
            )}
          </Card>
        )}
      </div>

      <div className="border-t border-slate-200 pt-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Importació de notes per RA</h2>
        <p className="text-sm text-slate-500 mb-4">
          Descarrega la plantilla (ja porta una fila per cada alumne del grup {activeGroup}, mòdul i RA), emplena la columna "Nota" i torna-la a pujar aquí. Les files buides o amb un DNI que no coincideixi amb cap alumne del grup es descarten sense afectar la resta.
        </p>

        <button
          onClick={() => downloadNotesTemplate(students)} disabled={students.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:border-sky-300 mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet size={15} /> Descarrega la plantilla de notes ({students.length} alumne(s) del grup {activeGroup})
        </button>

        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed">
          <UploadCloud className="text-sky-500 mb-3" size={32} />
          <p className="text-sm text-slate-600 mb-1">Arrossega el fitxer de notes emplenat o fes clic per seleccionar-lo</p>
          <p className="text-xs text-slate-400 mb-4">.xlsx, .xls, .csv</p>
          <label className="px-4 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium cursor-pointer hover:bg-sky-600 transition-colors">
            Selecciona fitxer
            <input ref={notesInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleNotesFile} />
          </label>
          {notesFileName && <p className="text-xs text-slate-500 mt-3">Fitxer: {notesFileName}</p>}
          {notesError && <p className="text-xs text-red-600 mt-3">{notesError}</p>}
        </Card>

        {notesPreview && (
          <Card className="p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-700">Vista prèvia — {notesPreview.length} nota(es) omplertes detectades</p>
              <button onClick={confirmNotesImport} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center gap-1.5">
                <CheckCircle2 size={15} /> Aplica les notes
              </button>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="py-2 pr-4">DNI/NIE</th>
                    <th className="py-2 pr-4">Mòdul</th>
                    <th className="py-2 pr-4">RA</th>
                    <th className="py-2 pr-4">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {notesPreview.map((r, i) => (
                    <tr key={i} className="border-b border-slate-50 text-slate-600">
                      <td className="py-2 pr-4">{r.dni}</td>
                      <td className="py-2 pr-4">{r.moduleCode}</td>
                      <td className="py-2 pr-4">RA{r.raNumber}</td>
                      <td className="py-2 pr-4">{r.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {notesResult && (
          <Card className="p-5 mt-6">
            <p className="text-sm font-medium text-slate-700 mb-1">Resultat de la importació de notes</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge tone="green" icon={CheckCircle2}>{notesResult.updated} nota(es) aplicada(es)</Badge>
              {notesResult.studentNotFound > 0 && <Badge tone="orange" icon={AlertTriangle}>{notesResult.studentNotFound} fila(es) amb DNI no trobat</Badge>}
              {notesResult.moduleOrRaInvalid > 0 && <Badge tone="orange" icon={AlertTriangle}>{notesResult.moduleOrRaInvalid} fila(es) amb mòdul/RA no vàlid</Badge>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 9. CONFIGURACIÓ RA                                                     */
/* ---------------------------------------------------------------------- */

function RaConfigTab({ raWeights, setRaWeights, moduleCourse, setModuleCourse }) {
  function setWeight(code, idx, value) {
    setRaWeights((prev) => {
      const arr = [...prev[code]];
      arr[idx] = Number(value);
      return { ...prev, [code]: arr };
    });
  }
  function setCourse(code, value) {
    setModuleCourse((prev) => ({ ...prev, [code]: value }));
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Configuració de ponderacions per RA</h1>
      <p className="text-sm text-slate-500 mb-6">Edita el pes (%) de cada Resultat d'Aprenentatge i el curs (1r/2n) de cada mòdul. La suma de pesos ha de ser 100% per mòdul; el curs determina el càlcul automàtic de la regla de superació de 1r.</p>

      <div className="space-y-4">
        {ALL_MODULES.map((m) => {
          const weights = raWeights[m.code];
          const sum = weights.reduce((a, b) => a + b, 0);
          const ok = sum === 100;
          return (
            <Card key={m.code} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{m.code}. {m.name}</p>
                  <p className="text-xs text-slate-400">
                    {m.dual ? `${m.centreH}h centre / ${m.empresaH}h empresa (avaluable 90/10)` : `${m.centreH}h centre (100%)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={moduleCourse[m.code]} onChange={(e) => setCourse(m.code, e.target.value)}
                    className="border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  >
                    <option value="1r">1r curs</option>
                    <option value="2n">2n curs</option>
                  </select>
                  {ok ? <Badge tone="green" icon={CheckCircle2}>Suma {sum}%</Badge> : <Badge tone="red" icon={AlertTriangle}>Suma {sum}% (ha de ser 100%)</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {weights.map((w, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-xs text-slate-500" title={m.raLabels ? m.raLabels[i] : ""}>
                    RA{i + 1}
                    <input
                      type="number" min="0" max="100" value={w}
                      onChange={(e) => setWeight(m.code, i, e.target.value)}
                      className="w-16 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                    />%
                  </label>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 10. LLISTAT D'ALUMNES                                                  */
/* ---------------------------------------------------------------------- */

function StudentsList({ activeGroup, students, statuses, scheduleStatuses, onSelect, onTrash }) {
  const [query, setQuery] = useState("");
  const filtered = students.filter((s) => normalize(`${s.nom} ${s.cognoms}`).includes(normalize(query)));

  function handleTrash(e, s) {
    e.stopPropagation();
    if (window.confirm(`Enviar ${s.nom} ${s.cognoms} a la paperera? El podràs restaurar des de la pestanya "Paperera".`)) {
      onTrash(s.id);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Alumnat — {activeGroup}</h1>
      <p className="text-sm text-slate-500 mb-6">Expedient individual, ponderacions, bloquejos i graella de pràctiques.</p>

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca alumne..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {filtered.map((s) => {
          const st = statuses[s.id];
          const sc = scheduleStatuses[s.id];
          return (
            <div key={s.id} onClick={() => onSelect(s.id)} className="text-left cursor-pointer">
              <Card className="p-4 hover:border-sky-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.nom} {s.cognoms}</p>
                    <p className="text-xs text-slate-400">{s.idalu} · {s.municipi}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => handleTrash(e, s)} className="p-1 text-slate-300 hover:text-red-500" title="Envia a la paperera">
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {st.aptePractiques ? <Badge tone="green">Apte 1r</Badge> : <Badge tone="red">No apte 1r</Badge>}
                  {st.blocks.length > 0 && <Badge tone="red">{st.blocks.length} bloqueig</Badge>}
                  {sc.complete ? <Badge tone="green">FCT completes</Badge> : <Badge tone="orange">FCT incompletes</Badge>}
                  {sc.conflicts > 0 && <Badge tone="orange">Conflicte</Badge>}
                </div>
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-slate-400 col-span-2">Cap alumne coincideix amb la cerca.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 11. FITXA INDIVIDUAL                                                   */
/* ---------------------------------------------------------------------- */

function StudentDetail({ student, status, raWeights, moduleCourse, schedule, scheduleStatus, classGrid, classTemplate, companies, assignedCompanyId, onAssignCompany, onBack, onTrash, onUpdateStudent, onUpdateNote, onUpdateNotaEmpresa, onUpdateSchedule, onAddPeriod, onRemovePeriod, onUpdatePeriod, onToggleTick }) {
  const [section, setSection] = useState("dades");
  const age = calcAge(student.dataNaixement);
  const isMinor = age != null && age < 18;
  const bgClass = age == null ? "" : isMinor ? "bg-pink-50" : "bg-teal-50";

  const sections = [
    { id: "dades", label: "Dades personals", icon: ClipboardList },
    { id: "academic", label: "Acadèmic i notes", icon: GraduationCap },
    { id: "horari1r", label: "Classes pendents (automàtic)", icon: Clock },
    { id: "practiques", label: "Pràctiques i horari", icon: CalendarDays },
  ];

  function handleTrash() {
    if (window.confirm(`Enviar ${student.nom} ${student.cognoms} a la paperera? El podràs restaurar des de la pestanya "Paperera".`)) {
      onTrash();
    }
  }

  return (
    <div className={`-m-4 md:-m-8 p-4 md:p-8 min-h-[calc(100vh-2rem)] ${bgClass}`}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-sky-600">
          <ArrowLeft size={15} /> Tornar al llistat
        </button>
        <button onClick={handleTrash} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
          <Trash2 size={15} /> Envia a la paperera
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">{student.nom} {student.cognoms}</h1>
          <p className="text-sm text-slate-500">{student.grup || "ADM2"} · {student.idalu} · {student.dni}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {age != null && (isMinor ? <Badge tone="slate">Menor d'edat ({age} anys)</Badge> : <Badge tone="slate">Major d'edat ({age} anys)</Badge>)}
          {status.aptePractiques ? <Badge tone="green" icon={CheckCircle2}>Apte per a pràctiques</Badge> : <Badge tone="red" icon={XCircle}>No apte (1r &lt; 80%)</Badge>}
          {scheduleStatus.complete ? <Badge tone="green" icon={CheckCircle2}>Hores FCT completes</Badge> : <Badge tone="orange" icon={Clock}>Mancança d'hores FCT</Badge>}
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200 overflow-x-auto">
        {sections.map((sec) => (
          <button
            key={sec.id} onClick={() => setSection(sec.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              section === sec.id ? "border-sky-500 text-sky-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <sec.icon size={15} /> {sec.label}
          </button>
        ))}
      </div>

      {section === "dades" && <PersonalDataSection student={student} isMinor={isMinor} onUpdateStudent={onUpdateStudent} />}
      {section === "academic" && (
        <AcademicSection student={student} status={status} raWeights={raWeights} moduleCourse={moduleCourse} onUpdateNote={onUpdateNote} onUpdateStudent={onUpdateStudent} />
      )}
      {section === "horari1r" && <ClassScheduleSection classGrid={classGrid} template={classTemplate} />}
      {section === "practiques" && (
        <PracticumSection
          student={student} schedule={schedule} scheduleStatus={scheduleStatus} classGrid={classGrid}
          companies={companies} assignedCompanyId={assignedCompanyId} onAssignCompany={onAssignCompany}
          onUpdateSchedule={onUpdateSchedule} onAddPeriod={onAddPeriod} onRemovePeriod={onRemovePeriod}
          onUpdatePeriod={onUpdatePeriod} onToggleTick={onToggleTick} onUpdateNotaEmpresa={onUpdateNotaEmpresa}
        />
      )}
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input
        value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <select
        value={value || ""} onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function PersonalDataSection({ student, isMinor, onUpdateStudent }) {
  const groups = [
    { title: "Identificació i contacte", fields: ["nom", "cognoms", "dni", "idalu", "telefon", "emailPersonal", "emailInstitut"] },
    { title: "Seguretat social i dades mèdiques", fields: ["nass", "inss"] },
    { title: "Ubicació i demografia", fields: ["adreca", "cp", "municipi", "pais", "genere", "dataNaixement", "estranger"] },
    { title: "Dades acadèmiques", fields: ["estudi", "estudiCodi", "anyMatricula", "marcaTemps"] },
  ];
  const labels = {
    nom: "Nom", cognoms: "Cognoms", dni: "DNI / NIE / Passaport", idalu: "IDALU / RALC",
    telefon: "Telèfon", emailPersonal: "Correu personal", emailInstitut: "Correu de l'institut",
    nass: "NASS", inss: "INSS / Mútua", adreca: "Adreça", cp: "Codi postal",
    municipi: "Municipi", pais: "País", genere: "Gènere", dataNaixement: "Data naixement", estranger: "Estranger",
    estudi: "Estudi", estudiCodi: "Estudi (codi)", anyMatricula: "Any 1a matrícula", marcaTemps: "Marca de temps",
  };
  return (
    <div className="space-y-5">
      {groups.map((g) => (
        <Card key={g.title} className="p-5">
          <p className="text-sm font-medium text-slate-700 mb-3">{g.title}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {g.title === "Identificació i contacte" && (
              <SelectField label="Tipus de document" value={student.tipusDoc} onChange={(v) => onUpdateStudent({ tipusDoc: v })} options={["DNI", "NIE", "Passaport"]} />
            )}
            {g.fields.map((f) => (
              <Field key={f} label={labels[f]} value={student[f]} onChange={(v) => onUpdateStudent({ [f]: v })} />
            ))}
          </div>
        </Card>
      ))}

      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Dades dels pares / tutors legals</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Nom" value={student.pareNom} onChange={(v) => onUpdateStudent({ pareNom: v })} />
          <Field label="Cognoms" value={student.pareCognoms} onChange={(v) => onUpdateStudent({ pareCognoms: v })} />
          <Field label="DNI" value={student.pareDni} onChange={(v) => onUpdateStudent({ pareDni: v })} />
          <Field label="Telèfon" value={student.pareTelefon} onChange={(v) => onUpdateStudent({ pareTelefon: v })} />
          <Field label="Correu electrònic" value={student.pareEmail} onChange={(v) => onUpdateStudent({ pareEmail: v })} />
        </div>
      </Card>

      {!isMinor && (
        <Card className="p-5">
          <label className="flex items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox" checked={!!student.autoritzaInfoPares}
              onChange={(e) => onUpdateStudent({ autoritzaInfoPares: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-300"
            />
            L'alumne (major d'edat) autoritza donar informació acadèmica als pares/tutors
          </label>
        </Card>
      )}

      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-2">Regla de superació de 1r</p>
        <p className="text-xs text-slate-400">Es calcula automàticament a partir de l'assoliment dels mòduls marcats com "1r curs" a la pestanya "Acadèmic i notes" — consulta'l allà.</p>
      </Card>
    </div>
  );
}

function ModuleCard({ m, student, status, raWeights, onUpdateNote }) {
  const g = status.grades[m.code];
  const blocked = status.blocks.find((b) => b.target.startsWith(m.code));
  return (
    <Card className={`p-5 ${blocked ? "border-red-200" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{m.code}. {m.name}</p>
          <p className="text-xs text-slate-400">{m.dual ? "Mòdul dual · 90% centre / 10% empresa (nota única, veure pestanya Pràctiques)" : "100% centre"}</p>
        </div>
        <div className="flex items-center gap-2">
          {blocked ? (
            <Badge tone="red" icon={XCircle}>Bloquejat — {blocked.reason}</Badge>
          ) : g.grade == null ? (
            <Badge tone="slate">Sense notes</Badge>
          ) : g.pending ? (
            <Badge tone="orange">Nota centre {g.grade.toFixed(2)} (pendent nota d'empresa)</Badge>
          ) : g.grade >= 5 ? (
            <Badge tone="green" icon={CheckCircle2}>Nota final {g.grade.toFixed(2)}</Badge>
          ) : (
            <Badge tone="red" icon={XCircle}>Nota final {g.grade.toFixed(2)}</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {student.notes[m.code].map((val, i) => (
          <label key={i} className="flex flex-col items-center text-xs text-slate-400 gap-1" title={m.raLabels ? m.raLabels[i] : ""}>
            RA{i + 1} <span className="text-[10px] text-slate-300">({raWeights[m.code][i]}%)</span>
            <input
              type="number" min="0" max="10" step="0.01" value={val ?? ""}
              onChange={(e) => onUpdateNote(m.code, i, e.target.value)}
              className="w-16 border border-slate-200 rounded-md px-2 py-1 text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            />
          </label>
        ))}
      </div>
    </Card>
  );
}

function AcademicSection({ student, status, raWeights, moduleCourse, onUpdateNote }) {
  const mods1r = ALL_MODULES.filter((m) => (moduleCourse[m.code] || "1r") === "1r");
  const mods2n = ALL_MODULES.filter((m) => (moduleCourse[m.code] || "1r") === "2n");
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-slate-700">Superació de 1r (calculat automàticament)</p>
            <p className="text-xs text-slate-400 mt-0.5">{status.hores1r.totalH1r}h totals als mòduls marcats com "1r curs" — només compta la nota de centre (no la d'empresa)</p>
          </div>
          {status.aptePractiques
            ? <Badge tone="green" icon={CheckCircle2}>{status.pctHores1r}% — Apte per a pràctiques</Badge>
            : <Badge tone="red" icon={XCircle}>{status.pctHores1r}% — Calen ≥80%</Badge>}
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge tone="green">Superat: {status.hores1r.pctSuperat}% ({status.hores1r.superatH}h)</Badge>
          <Badge tone="red">Suspès: {status.hores1r.pctSuspes}% ({status.hores1r.suspesH}h)</Badge>
          <Badge tone="slate">Pendent de notes: {status.hores1r.pctPendent}% ({status.hores1r.pendentH}h)</Badge>
        </div>
      </Card>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Mòduls de 1r curs</p>
        <div className="space-y-4">
          {mods1r.map((m) => (
            <ModuleCard key={m.code} m={m} student={student} status={status} raWeights={raWeights} onUpdateNote={onUpdateNote} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Mòduls de 2n curs</p>
        <div className="space-y-4">
          {mods2n.map((m) => (
            <ModuleCard key={m.code} m={m} student={student} status={status} raWeights={raWeights} onUpdateNote={onUpdateNote} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassScheduleSection({ classGrid, template }) {
  const totalHours = classGrid.reduce((sum, row) => sum + row.filter(Boolean).length, 0);
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-1">Classes de 1r encara pendents</p>
        <p className="text-xs text-slate-400 mb-4">
          Es genera automàticament a partir de la plantilla d'horari de 1r (pestanya "Horari 1r (plantilla)"): una franja apareix aquí si l'alumne encara no té la nota de centre del mòdul assignat ≥5. En superar el mòdul, la franja deixa d'aparèixer i deixa de generar conflicte amb les pràctiques.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2"></th>
                {DAYS.map((d) => <th key={d} className="p-2 text-slate-500 font-medium">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h, r) => (
                <tr key={h}>
                  <td className="p-2 text-slate-400 text-right pr-3">{h}</td>
                  {DAYS.map((_, c) => {
                    const code = template[r][c];
                    const pending = classGrid[r][c];
                    let cls = "bg-slate-50 border-slate-100";
                    if (pending) cls = "bg-sky-500 border-sky-600";
                    else if (code) cls = "bg-green-100 border-green-300";
                    return (
                      <td key={c} className="p-1">
                        <div
                          className={`w-full h-9 rounded-md border flex items-center justify-center text-[10px] font-medium ${
                            pending ? "text-white" : code ? "text-green-700" : "text-transparent"
                          } ${cls}`}
                          title={code ? (pending ? `${code} — encara pendent` : `${code} — ja superat`) : ""}
                        >
                          {code || ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-500 inline-block" /> Pendent (bloqueja hores de pràctiques)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" /> Ja superat</span>
          </div>
          <Badge tone="sky">{totalHours}h/setmana encara pendents</Badge>
        </div>
      </Card>
    </div>
  );
}

function ClassTemplateTab({ activeGroup, template, onSetCell, moduleCourse }) {
  const mods1r = ALL_MODULES.filter((m) => (moduleCourse[m.code] || "1r") === "1r");
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Horari 1r (plantilla) — {activeGroup}</h1>
      <p className="text-sm text-slate-500 mb-6">
        Configura una sola vegada l'horari de classes de 1r d'enguany per a aquest grup. Per a cada franja, tria quin mòdul de 1r s'hi imparteix. Aquesta plantilla es combina amb la nota de cada alumne per generar automàticament, a la seva fitxa, quines classes encara té pendents — i per tant els possibles conflictes amb l'horari de pràctiques. Cada grup (ADM2/ADM4) té la seva pròpia plantilla independent.
      </p>
      <Card className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-2"></th>
                {DAYS.map((d) => <th key={d} className="p-2 text-slate-500 font-medium">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((h, r) => (
                <tr key={h}>
                  <td className="p-2 text-slate-400 text-right pr-3">{h}</td>
                  {DAYS.map((_, c) => (
                    <td key={c} className="p-1">
                      <select
                        value={template[r][c] || ""}
                        onChange={(e) => onSetCell(r, c, e.target.value || null)}
                        className={`w-full h-9 rounded-md border text-[11px] px-1 focus:outline-none focus:ring-2 focus:ring-sky-300 ${
                          template[r][c] ? "bg-sky-50 border-sky-300 text-sky-700 font-medium" : "bg-slate-50 border-slate-100 text-slate-400"
                        }`}
                      >
                        <option value="">—</option>
                        {mods1r.map((m) => <option key={m.code} value={m.code}>{m.code}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">Només es llisten els mòduls marcats com "1r curs" a la pestanya "Configuració RA".</p>
      </Card>
    </div>
  );
}

const MONTH_NAMES = [
  "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
  "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre",
];
const WEEKDAY_LABELS = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

function monthGridDates(year, month) {
  // Retorna un array de setmanes; cada setmana és un array de 7 dates (Date) que
  // comencen en dilluns, incloent dies del mes anterior/següent per completar files.
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0 = dilluns
  const start = new Date(year, month, 1 - startOffset);
  const weeks = [];
  let cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month && w >= 3) break; // no afegir files buides de més
  }
  return weeks;
}

function HolidayCalendarTab({ holidays, onToggle }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const holidaySet = useMemo(() => new Set(holidays), [holidays]);
  const weeks = useMemo(() => monthGridDates(year, month), [year, month]);

  function changeMonth(delta) {
    let m = month + delta, y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  }

  const sortedHolidays = [...holidays].sort();

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Calendari de festius i vacances</h1>
      <p className="text-sm text-slate-500 mb-6">
        Marca aquí els dies no lectius (festius, vacances escolars...). Els caps de setmana ja queden exclosos automàticament del càlcul d'hores de pràctiques — no cal marcar-los. Aquest calendari és comú per a tots els alumnes i grups.
      </p>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><ChevronLeft size={18} /></button>
          <p className="text-sm font-medium text-slate-700">{MONTH_NAMES[month]} {year}</p>
          <button onClick={() => changeMonth(1)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((w) => <div key={w} className="text-xs text-slate-400 font-medium py-1">{w}</div>)}
          {weeks.flat().map((d, i) => {
            const inMonth = d.getMonth() === month;
            const iso = toIsoDate(d);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isHoliday = holidaySet.has(iso);
            const isToday = toIsoDate(today) === iso;
            let cls = "bg-white border-slate-100 text-slate-600 hover:border-sky-300 cursor-pointer";
            if (!inMonth) cls = "bg-transparent border-transparent text-slate-300";
            else if (isWeekend) cls = "bg-slate-50 border-slate-100 text-slate-300 cursor-default";
            else if (isHoliday) cls = "bg-red-100 border-red-300 text-red-700 cursor-pointer";
            return (
              <button
                key={i}
                disabled={!inMonth || isWeekend}
                onClick={() => onToggle(iso)}
                className={`h-11 rounded-md border text-sm flex items-center justify-center transition-colors ${cls} ${isToday ? "ring-2 ring-sky-300" : ""}`}
                title={isWeekend ? "Cap de setmana (ja exclòs)" : isHoliday ? "Festiu — fes clic per treure'l" : inMonth ? "Fes clic per marcar-lo festiu" : ""}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Festiu / vacances</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-50 border border-slate-100 inline-block" /> Cap de setmana (automàtic)</span>
        </div>
      </Card>

      <Card className="p-5 mt-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Dies marcats ({sortedHolidays.length})</p>
        {sortedHolidays.length === 0 ? (
          <p className="text-xs text-slate-400">Encara no has marcat cap dia festiu.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sortedHolidays.map((d) => (
              <button
                key={d} onClick={() => onToggle(d)}
                className="px-2.5 py-1 rounded-full text-xs border bg-red-50 text-red-700 border-red-200 hover:bg-red-100 flex items-center gap-1.5"
                title="Fes clic per treure'l"
              >
                {d} <X size={11} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function WeeklyGrid({ ticks, classGrid, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {DAYS.map((d) => <th key={d} className="p-2 text-slate-500 font-medium">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {HOURS.map((h, r) => (
            <tr key={h}>
              <td className="p-2 text-slate-400 text-right pr-3">{h}</td>
              {DAYS.map((_, c) => {
                const hasClass = classGrid[r][c];
                const hasTick = ticks[r][c];
                const conflict = hasClass && hasTick;
                let cls = "bg-slate-50 border-slate-100 hover:bg-slate-100";
                if (conflict) cls = "bg-orange-100 border-orange-300";
                else if (hasTick) cls = "bg-green-500 border-green-600";
                else if (hasClass) cls = "bg-slate-200 border-slate-300 opacity-50";
                return (
                  <td key={c} className="p-1">
                    <button
                      onClick={() => onToggle(r, c)}
                      className={`w-full h-9 rounded-md border transition-colors ${cls}`}
                      title={conflict ? "Conflicte: coincideix amb classe de 1r" : hasClass ? "Classe pendent de 1r" : "Fes clic per marcar hora de pràctiques"}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 opacity-50 inline-block" /> Classe pendent 1r</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Hora de pràctiques</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-100 border border-orange-300 inline-block" /> Conflicte horari</span>
      </div>
    </div>
  );
}

function PracticumSection({ student, schedule, scheduleStatus, classGrid, companies, assignedCompanyId, onAssignCompany, onUpdateSchedule, onAddPeriod, onRemovePeriod, onUpdatePeriod, onToggleTick, onUpdateNotaEmpresa }) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Empresa assignada</p>
        <select
          value={assignedCompanyId || ""} onChange={(e) => onAssignCompany(e.target.value || null)}
          className="w-full sm:w-80 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <option value="">Sense assignar</option>
          {companies.map((c) => {
            const placesLeft = c.places - c.assignats.filter((id) => id !== student.id).length;
            const full = placesLeft <= 0 && c.id !== assignedCompanyId;
            return (
              <option key={c.id} value={c.id} disabled={full}>
                {c.nom} {full ? "(sense places)" : `(${placesLeft} places lliures)`}
              </option>
            );
          })}
        </select>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-1">Nota d'estada a l'empresa</p>
        <p className="text-xs text-slate-400 mb-3">Una única nota (0-10) del tutor d'empresa, comuna a tots els mòduls duals — recalcula automàticament la nota final de cadascun (90% centre / 10% empresa).</p>
        <input
          type="number" min="0" max="10" step="0.01" value={student.notaEmpresa ?? ""}
          onChange={(e) => onUpdateNotaEmpresa(e.target.value)}
          className="w-24 border border-sky-200 rounded-lg px-3 py-1.5 text-sm text-center text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium text-slate-700 mb-3">Reducció d'hores</p>
        <select value={schedule.reduccio} onChange={(e) => onUpdateSchedule({ reduccio: Number(e.target.value) })}
          className="w-full sm:w-48 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-300">
          <option value={0}>0%</option>
          <option value={50}>50%</option>
          <option value={100}>100%</option>
        </select>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Períodes de pràctiques ({schedule.periods.length}/5)</p>
        <button
          onClick={onAddPeriod} disabled={schedule.periods.length >= 5}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} /> Afegir període
        </button>
      </div>

      {schedule.periods.map((p, idx) => {
        const ps = scheduleStatus.perPeriod.find((x) => x.id === p.id);
        return (
          <Card key={p.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <p className="text-sm font-medium text-slate-700">Període {idx + 1}</p>
              <div className="flex items-center gap-2">
                {ps && <Badge tone="sky">{ps.hours}h en {ps.days} dies lectius</Badge>}
                {ps && ps.conflicts > 0 && <Badge tone="orange" icon={AlertTriangle}>{ps.conflicts} conflicte(s)</Badge>}
                {schedule.periods.length > 1 && (
                  <button onClick={() => onRemovePeriod(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <label className="block">
                <span className="text-xs text-slate-400">Data d'inici</span>
                <input type="date" value={p.dataInici} onChange={(e) => onUpdatePeriod(p.id, { dataInici: e.target.value })}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Data final</span>
                <input type="date" value={p.dataFinal} onChange={(e) => onUpdatePeriod(p.id, { dataFinal: e.target.value })}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </label>
            </div>
            <p className="text-xs text-slate-400 mb-2">Graella setmanal d'aquest període — classes pendents (atenuat) i pràctiques (clic per marcar)</p>
            <WeeklyGrid ticks={p.ticks} classGrid={classGrid} onToggle={(r, c) => onToggleTick(p.id, r, c)} />
          </Card>
        );
      })}

      <Card className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600">
          <p>Total: <strong>{scheduleStatus.totalHours}h</strong> en {scheduleStatus.totalDays} dies lectius amb pràctiques, repartits en {schedule.periods.length} període(s) (objectiu {scheduleStatus.target}h)</p>
          {scheduleStatus.conflicts > 0 && <p className="text-orange-500 mt-1 flex items-center gap-1"><AlertTriangle size={13} /> {scheduleStatus.conflicts} conflicte(s) horari(s) detectat(s) en total</p>}
        </div>
        <div className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 ${scheduleStatus.complete ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {scheduleStatus.complete ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {scheduleStatus.complete
            ? `Hores completes: ${scheduleStatus.totalHours} / ${scheduleStatus.target} h`
            : `Mancança d'hores: falten ${Math.max(0, scheduleStatus.target - scheduleStatus.totalHours)} h per cobrir`}
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* 12. EMPRESES                                                           */
/* ---------------------------------------------------------------------- */

function CompanyCard({ company: c, students, companies, expanded, onToggleExpand, onUpdate, onRemove, onToggleAssign, onToggleActivity }) {
  const totalActivitats = ACTIVITY_PLAN.reduce((n, cat) => n + cat.items.length, 0);
  const selectedCount = (c.activitats || []).length;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <button onClick={onToggleExpand} className="flex items-center gap-2 text-left">
          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
          <div>
            <p className="text-sm font-medium text-slate-800 flex items-center gap-2"><BriefcaseBusiness size={15} className="text-sky-500" /> {c.nom}</p>
            <p className="text-xs text-slate-400 mt-0.5">Tutor: {c.tutorNom || "—"} · {c.adreca || "Sense adreça"}</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <Badge tone="sky">{c.regim}</Badge>
          <Badge tone={c.assignats.length >= c.places ? "orange" : "slate"}>{c.assignats.length}/{c.places} places</Badge>
          <Badge tone="slate">{selectedCount}/{totalActivitats} activitats</Badge>
          <button
            onClick={() => { if (window.confirm(`Enviar "${c.nom}" a la paperera? La podràs restaurar des de la pestanya "Paperera".`)) onRemove(); }}
            className="text-slate-300 hover:text-red-500" title="Envia a la paperera"
          ><Trash2 size={15} /></button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-5 mt-4 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Dades de l'empresa</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Adreça" value={c.adreca} onChange={(v) => onUpdate({ adreca: v })} />
              <Field label="Telèfon" value={c.telefon} onChange={(v) => onUpdate({ telefon: v })} />
              <Field label="Correu electrònic" value={c.email} onChange={(v) => onUpdate({ email: v })} />
              <label className="block">
                <span className="text-xs text-slate-400">Règim</span>
                <select value={c.regim} onChange={(e) => onUpdate({ regim: e.target.value })}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-300">
                  <option>Presencial</option><option>Híbrid</option><option>Remot</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-slate-400">Places</span>
                <input type="number" min="1" value={c.places} onChange={(e) => onUpdate({ places: Number(e.target.value) })}
                  className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Persona responsable</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nom i cognoms" value={c.responsableNom} onChange={(v) => onUpdate({ responsableNom: v })} />
              <Field label="Càrrec" value={c.responsableCarrec} onChange={(v) => onUpdate({ responsableCarrec: v })} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Tutor/a de pràctiques</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Nom i cognoms" value={c.tutorNom} onChange={(v) => onUpdate({ tutorNom: v })} />
              <Field label="Telèfon" value={c.tutorTelefon} onChange={(v) => onUpdate({ tutorTelefon: v })} />
              <Field label="Correu electrònic" value={c.tutorEmail} onChange={(v) => onUpdate({ tutorEmail: v })} />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Alumnat assignat</p>
            <div className="flex flex-wrap gap-2">
              {students.map((s) => {
                const on = c.assignats.includes(s.id);
                const elsewhere = !on && companies.some((oc) => oc.id !== c.id && oc.assignats.includes(s.id));
                const full = !on && c.assignats.length >= c.places;
                return (
                  <button
                    key={s.id} onClick={() => onToggleAssign(s.id)}
                    disabled={full}
                    title={elsewhere ? "Assignat a una altra empresa — es reassignarà aquí" : full ? "Sense places lliures" : ""}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      on ? "bg-sky-500 text-white border-sky-500"
                        : full ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                        : "bg-white text-slate-500 border-slate-200 hover:border-sky-300"
                    }`}
                  >
                    {s.nom} {s.cognoms} <span className="opacity-60">({s.grup || "ADM2"})</span>{elsewhere ? " ↺" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Pla d'activitats</p>
            <div className="space-y-3">
              {ACTIVITY_PLAN.map((cat) => (
                <div key={cat.id} className="border border-slate-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-600 mb-2">{cat.id}. {cat.title}</p>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => (
                      <label key={item.id} className="flex items-start gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox" checked={(c.activitats || []).includes(item.id)}
                          onChange={() => onToggleActivity(item.id)}
                          className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-sky-500 focus:ring-sky-300 shrink-0"
                        />
                        <span><span className="text-slate-400">{item.id}</span> {item.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function CompaniesTab({ companies, setCompanies, students, onAssignCompany, onTrashCompany }) {
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [draft, setDraft] = useState({ nom: "", regim: "Presencial", places: 1 });

  function addCompany() {
    if (!draft.nom) return;
    const id = "c" + Math.random().toString(36).slice(2, 9);
    setCompanies((prev) => [...prev, {
      id, nom: draft.nom, regim: draft.regim, places: Number(draft.places), assignats: [],
      adreca: "", telefon: "", email: "",
      responsableNom: "", responsableCarrec: "",
      tutorNom: "", tutorTelefon: "", tutorEmail: "",
      activitats: [],
    }]);
    setDraft({ nom: "", regim: "Presencial", places: 1 });
    setAdding(false);
    setExpandedId(id);
  }

  function updateCompany(id, patch) {
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function toggleActivity(id, itemId) {
    setCompanies((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const activitats = (c.activitats || []).includes(itemId)
        ? c.activitats.filter((a) => a !== itemId)
        : [...(c.activitats || []), itemId];
      return { ...c, activitats };
    }));
  }

  function toggleAssign(companyId, studentId) {
    const company = companies.find((c) => c.id === companyId);
    const alreadyOn = company.assignats.includes(studentId);
    if (alreadyOn) {
      onAssignCompany(studentId, null);
      return;
    }
    const placesLeft = company.places - company.assignats.length;
    if (placesLeft <= 0) return;
    onAssignCompany(studentId, companyId);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-semibold text-slate-800">Empreses i assignació</h1>
        <button onClick={() => setAdding((v) => !v)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600">
          <Plus size={15} /> Nova empresa
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-6">Dades de contacte, responsable, tutor de pràctiques, alumnat assignat i pla d'activitats de cada empresa col·laboradora.</p>

      {adding && (
        <Card className="p-5 mb-5">
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <Field label="Nom de l'empresa" value={draft.nom} onChange={(v) => setDraft({ ...draft, nom: v })} />
            <label className="block">
              <span className="text-xs text-slate-400">Règim</span>
              <select value={draft.regim} onChange={(e) => setDraft({ ...draft, regim: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-300">
                <option>Presencial</option><option>Híbrid</option><option>Remot</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-slate-400">Places</span>
              <input type="number" min="1" value={draft.places} onChange={(e) => setDraft({ ...draft, places: e.target.value })}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </label>
          </div>
          <p className="text-xs text-slate-400 mb-3">La resta de dades (adreça, contacte, responsable, tutor i pla d'activitats) es completen desplegant la fitxa un cop creada.</p>
          <button onClick={addCompany} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            <Save size={14} /> Desa empresa
          </button>
        </Card>
      )}

      <div className="grid gap-4">
        {companies.map((c) => (
          <CompanyCard
            key={c.id} company={c} students={students} companies={companies}
            expanded={expandedId === c.id}
            onToggleExpand={() => setExpandedId(expandedId === c.id ? null : c.id)}
            onUpdate={(patch) => updateCompany(c.id, patch)}
            onRemove={() => onTrashCompany(c.id)}
            onToggleAssign={(studentId) => toggleAssign(c.id, studentId)}
            onToggleActivity={(itemId) => toggleActivity(c.id, itemId)}
          />
        ))}
      </div>
    </div>
  );
}

function TrashTab({ students, companies, onRestoreStudent, onDeleteStudentForever, onRestoreCompany, onDeleteCompanyForever }) {
  function confirmForeverStudent(s) {
    if (window.confirm(`Eliminar definitivament ${s.nom} ${s.cognoms}? Aquesta acció NO es pot desfer.`)) {
      onDeleteStudentForever(s.id);
    }
  }
  function confirmForeverCompany(c) {
    if (window.confirm(`Eliminar definitivament "${c.nom}"? Aquesta acció NO es pot desfer.`)) {
      onDeleteCompanyForever(c.id);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Paperera</h1>
      <p className="text-sm text-slate-500 mb-6">
        Alumnat i empreses enviats a la paperera. Es poden restaurar o eliminar definitivament (acció irreversible).
      </p>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-700 mb-3">Alumnat ({students.length})</p>
        {students.length === 0 ? (
          <p className="text-xs text-slate-400">No hi ha cap alumne a la paperera.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {students.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{s.nom} {s.cognoms}</p>
                    <p className="text-xs text-slate-400">{s.grup || "ADM2"} · {s.idalu}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onRestoreStudent(s.id)} className="px-2.5 py-1 rounded-full text-xs border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100">
                      Restaura
                    </button>
                    <button onClick={() => confirmForeverStudent(s)} className="text-slate-300 hover:text-red-500" title="Elimina definitivament">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-3">Empreses ({companies.length})</p>
        {companies.length === 0 ? (
          <p className="text-xs text-slate-400">No hi ha cap empresa a la paperera.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {companies.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.nom}</p>
                    <p className="text-xs text-slate-400">{c.adreca || "Sense adreça"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onRestoreCompany(c.id)} className="px-2.5 py-1 rounded-full text-xs border bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100">
                      Restaura
                    </button>
                    <button onClick={() => confirmForeverCompany(c)} className="text-slate-300 hover:text-red-500" title="Elimina definitivament">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
