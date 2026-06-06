// OSTÉO RA — V10 stable mobile — patch anatomique
// Fichier app.js uniquement.
// index.html et styles.css restent inchangés.
//
// Objectif :
// 1) Conserver la logique actuelle de l’application.
// 2) Ajouter une vraie entrée anatomique : Rachis / Bassin / Membres supérieurs / Membres inférieurs.
// 3) Rachis => Cervicales / Dorsales / Lombaires.
// 4) Membres supérieurs et inférieurs => sous-zones, puis techniques.
// 5) Bassin => Ilium / Sacrum / Symphyse pubienne, puis techniques.
// 6) Ne pas casser les écrans existants : home, zones, rachis, techniques, player, revision, quiz, progress.

const techniques = [
  // =========================================================
  // RACHIS — CERVICALES / OAA
  // =========================================================
  {
    id: 1,
    title: "Dysfonction facettaire cervico-dorsale C7–D2, position assise, à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "▷"
  },
  {
    id: 2,
    title: "Dysfonction facettaire cervico-dorsale C7–D2, en procubitus à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "▧"
  },
  {
    id: 3,
    title: "Dysfonction de la région cervico-dorsale C7–D2, composantes multiples à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "▥"
  },
  {
    id: 4,
    title: "Dysfonction de l’occiput, en postériorité à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 5,
    title: "Dysfonction de l’occiput, en translation à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↔"
  },
  {
    id: 6,
    title: "Dysfonction articulaire globale occiput-atlas-axis",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "◎"
  },
  {
    id: 7,
    title: "Dysfonction de l’atlas, en postériorité à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "C1"
  },
  {
    id: 8,
    title: "Dysfonction de l’atlas, en translation droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "C1"
  },
  {
    id: 9,
    title: "Dysfonction facettaire des cervicales C2–C6, en postériorité à droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "en cours",
    percent: 60,
    icon: "C"
  },
  {
    id: 10,
    title: "Dysfonction facettaire des cervicales C2–C6, en translation droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↔"
  },
  {
    id: 11,
    title: "Dysfonction des cervicales C2–C7, en ERdSd",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "vue",
    percent: 100,
    icon: "↻"
  },
  {
    id: 12,
    title: "Dysfonction des cervicales C2–C7, en FRdSd",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau intermédiaire",
    status: "à revoir",
    percent: 0,
    icon: "↓"
  },
  {
    id: 13,
    title: "Dysfonction occipito-atloïdienne, en rotation droite",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "⟳"
  },
  {
    id: 14,
    title: "Dysfonction occipito-atloïdienne, en ESgRd",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "O"
  },
  {
    id: 15,
    title: "Dysfonction occipito-atloïdienne, en FSgRd",
    zone: "Rachis",
    sub: "Cervicales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "O"
  },

  // =========================================================
  // RACHIS — DORSALES
  // =========================================================
  {
    id: 101,
    title: "Dysfonction facettaire des dorsales, en flexion, technique en double appui",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "vue",
    percent: 80,
    icon: "▷"
  },
  {
    id: 102,
    title: "Dysfonction facettaire des dorsales, en extension, technique en double appui",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↥"
  },
  {
    id: 103,
    title: "Dysfonction facettaire des dorsales, technique en simple appui",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "▣"
  },
  {
    id: 104,
    title: "Dysfonction facettaire des dorsales avec les pisiformes croisés",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "✕"
  },
  {
    id: 105,
    title: "Dysfonction facettaire des dorsales en technique pisiforme simple",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◈"
  },
  {
    id: 106,
    title: "Dysfonction facettaire des dorsales D9 à D12, assis",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 107,
    title: "Dysfonction facettaire des dorsales, technique en double Nelson",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "N"
  },
  {
    id: 108,
    title: "Dysfonction d’une vertèbre dorsale D8–D12, en NSgRd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 109,
    title: "Dysfonction d’une vertèbre dorsale D8–D12, en ERdSd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 110,
    title: "Dysfonction d’une vertèbre dorsale D8–D12, en FRdSd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 111,
    title: "Dysfonction d’une vertèbre dorsale D4–D8, en NSgRd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 112,
    title: "Dysfonction d’une vertèbre dorsale D4–D8, en FRdSd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 113,
    title: "Dysfonction d’une vertèbre dorsale D1–D4, en NSgRd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },
  {
    id: 114,
    title: "Dysfonction d’une vertèbre dorsale D1–D3, en FRdSd",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "D"
  },

  // =========================================================
  // RACHIS — CÔTES / DORSALES ASSOCIÉES
  // On les laisse dans Dorsales pour conserver l’entrée simple.
  // =========================================================
  {
    id: 151,
    title: "Dysfonction costo-transversaire de la 1re côte, en élévation",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "1"
  },
  {
    id: 152,
    title: "Dysfonction costo-transversaire antéro-médiane",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↘"
  },
  {
    id: 153,
    title: "Dysfonction costo-transversaire postéro-latérale",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↖"
  },
  {
    id: 154,
    title: "Dysfonction respiratoire de la 1re côte, en élévation dans le plan sagittal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↥"
  },
  {
    id: 155,
    title: "Dysfonction respiratoire de la 1re côte, en élévation dans le plan frontal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↥"
  },
  {
    id: 156,
    title: "Dysfonction respiratoire des 1re–6e côtes, en élévation dans le plan sagittal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "6"
  },
  {
    id: 157,
    title: "Dysfonction respiratoire des 1re–6e côtes, en élévation dans le plan frontal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "6"
  },
  {
    id: 158,
    title: "Dysfonction respiratoire des 7e–10e côtes, en élévation dans le plan sagittal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "10"
  },
  {
    id: 159,
    title: "Dysfonction respiratoire des 7e–10e côtes, en élévation dans le plan frontal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "10"
  },
  {
    id: 160,
    title: "Dysfonction des 1re–2e côtes, en abaissement dans le plan sagittal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "2"
  },
  {
    id: 161,
    title: "Dysfonction des 1re–2e côtes, en abaissement dans le plan frontal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "2"
  },
  {
    id: 162,
    title: "Dysfonction des 3e–10e côtes, en abaissement dans le plan frontal",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "10"
  },
  {
    id: 163,
    title: "Dysfonction des 11e–12e côtes, en élévation",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "12"
  },
  {
    id: 164,
    title: "Dysfonction des 11e–12e côtes, en abaissement",
    zone: "Rachis",
    sub: "Dorsales",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "12"
  },

  // =========================================================
  // RACHIS — LOMBAIRES
  // =========================================================
  {
    id: 201,
    title: "Dysfonction facettaire des lombaires, en NSR à droite",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "à revoir",
    percent: 45,
    icon: "L"
  },
  {
    id: 202,
    title: "Dysfonction facettaire des lombaires, en ERS à droite",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 203,
    title: "Dysfonction facettaire des lombaires, en FRS à droite",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 204,
    title: "Dysfonction facettaire des lombaires, assis, à gauche",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 205,
    title: "Dysfonction des lombaires, en NSR à gauche",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 206,
    title: "Dysfonction des lombaires, en ERS à gauche",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 207,
    title: "Dysfonction des lombaires, en FRS à droite",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "L"
  },
  {
    id: 208,
    title: "Dysfonction de la charnière D12/L1, technique en double appui",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "D/L"
  },
  {
    id: 209,
    title: "Dysfonction de la charnière D12/L1, technique indirecte à droite en Lumbar Roll",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "↻"
  },
  {
    id: 210,
    title: "Dysfonction de L3, technique semi-directe à gauche en Lumbar Roll",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "↻"
  },
  {
    id: 211,
    title: "Charnière D12/L1, technique en Lift, postériorité à gauche",
    zone: "Rachis",
    sub: "Lombaires",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "↟"
  },

  // =========================================================
  // BASSIN — ILIUM
  // =========================================================
  {
    id: 301,
    title: "Dysfonction de l’ilium, en antériorité à gauche",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 302,
    title: "Dysfonction de l’ilium, en antériorité à gauche, variante sujet laxe",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 303,
    title: "Dysfonction de l’ilium, en postériorité à droite",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◝"
  },
  {
    id: 304,
    title: "Dysfonction de l’ilium, en postériorité à droite, variante sujet laxe",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◝"
  },
  {
    id: 305,
    title: "Dysfonction de l’ilium, en supériorité à droite",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↥"
  },
  {
    id: 306,
    title: "Dysfonction de l’ilium, en antériorité à gauche, énergie musculaire",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 307,
    title: "Dysfonction de l’ilium, en postériorité à droite, énergie musculaire",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 308,
    title: "Dysfonction de l’ilium, en postériorité à droite en procubitus, énergie musculaire",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 309,
    title: "Dysfonction de l’ilium, en fermeture à droite, énergie musculaire",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 310,
    title: "Dysfonction de l’ilium, en ouverture à droite, énergie musculaire",
    zone: "Bassin",
    sub: "Ilium",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },

  // =========================================================
  // BASSIN — SACRUM
  // =========================================================
  {
    id: 351,
    title: "Dysfonction du sacrum, en torsion postérieure avec le pisiforme direct, à gauche",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "S"
  },
  {
    id: 352,
    title: "Dysfonction du sacrum, en flexion unilatérale sur axe horizontal, à gauche",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "S"
  },
  {
    id: 353,
    title: "Dysfonction du sacrum, en torsion postérieure gauche sur axe oblique droit",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "S"
  },
  {
    id: 354,
    title: "Dysfonction du sacrum, en torsion antérieure droite sur axe droit, énergie musculaire",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 355,
    title: "Dysfonction du sacrum, en torsion postérieure droite sur un axe droit, énergie musculaire",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 356,
    title: "Dysfonction du sacrum, en antériorité unilatérale, manœuvre avec le pisiforme",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "S"
  },
  {
    id: 357,
    title: "Dysfonction du sacrum, en extension unilatérale sur axe horizontal, à droite",
    zone: "Bassin",
    sub: "Sacrum",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "S"
  },

  // =========================================================
  // BASSIN — SYMPHYSE PUBIENNE
  // =========================================================
  {
    id: 381,
    title: "Dysfonction de la symphyse pubienne, en supériorité à droite, énergie musculaire",
    zone: "Bassin",
    sub: "Symphyse pubienne",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "SP"
  },
  {
    id: 382,
    title: "Dysfonction de la symphyse pubienne, en infériorité à gauche, énergie musculaire",
    zone: "Bassin",
    sub: "Symphyse pubienne",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "SP"
  },
  {
    id: 383,
    title: "Dysfonction combinée de la symphyse pubienne, en supériorité et infériorité",
    zone: "Bassin",
    sub: "Symphyse pubienne",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "SP"
  },

  // =========================================================
  // MEMBRES SUPÉRIEURS — CLAVICULE / ÉPAULE
  // =========================================================
  {
    id: 401,
    title: "Dysfonction pré-sternale de la clavicule, à droite",
    zone: "Membres supérieurs",
    sub: "Clavicule",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 402,
    title: "Dysfonction sus-sternale de la clavicule, à droite",
    zone: "Membres supérieurs",
    sub: "Clavicule",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 403,
    title: "Dysfonction sus-sternale de la clavicule, énergie musculaire, à droite",
    zone: "Membres supérieurs",
    sub: "Clavicule",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "EM"
  },
  {
    id: 404,
    title: "Dysfonction acromio-claviculaire, en rotation antérieure, à gauche",
    zone: "Membres supérieurs",
    sub: "Épaule",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 405,
    title: "Dysfonction acromio-claviculaire, en rotation postérieure, à gauche",
    zone: "Membres supérieurs",
    sub: "Épaule",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◜"
  },
  {
    id: 406,
    title: "Dysfonction gléno-humérale, en antériorité, à gauche",
    zone: "Membres supérieurs",
    sub: "Épaule",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "↻"
  },
  {
    id: 407,
    title: "Dysfonction huméro-ulnaire, en abduction, à gauche",
    zone: "Membres supérieurs",
    sub: "Coude",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 408,
    title: "Dysfonction huméro-ulnaire en adduction, à droite",
    zone: "Membres supérieurs",
    sub: "Coude",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 409,
    title: "Dysfonction huméro-radiale, en antériorité, à droite",
    zone: "Membres supérieurs",
    sub: "Coude",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 410,
    title: "Dysfonction huméro-radiale, en postériorité, à droite",
    zone: "Membres supérieurs",
    sub: "Coude",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 411,
    title: "Dysfonction radio-carpienne du scaphoïde ou du lunatum, en postériorité, à gauche",
    zone: "Membres supérieurs",
    sub: "Poignet",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "▧"
  },
  {
    id: 412,
    title: "Dysfonction radio-carpienne, en abduction, à gauche",
    zone: "Membres supérieurs",
    sub: "Poignet",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "▧"
  },
  {
    id: 413,
    title: "Dysfonction articulaire globale des médio-carpiennes, à droite",
    zone: "Membres supérieurs",
    sub: "Main",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "✋"
  },
  {
    id: 414,
    title: "Dysfonction articulaire globale des inter-carpiennes, à gauche",
    zone: "Membres supérieurs",
    sub: "Main",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "✋"
  },
  {
    id: 415,
    title: "Dysfonction articulaire globale de la trapézo-métacarpienne, à droite",
    zone: "Membres supérieurs",
    sub: "Main",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "✋"
  },

  // =========================================================
  // MEMBRES INFÉRIEURS — HANCHE / GENOU
  // =========================================================
  {
    id: 501,
    title: "Dysfonction de la coxo-fémorale, en rotation interne, à gauche",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 502,
    title: "Dysfonction de la coxo-fémorale, en rotation externe, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 503,
    title: "Dysfonction de la coxo-fémorale, en abduction, à gauche",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 504,
    title: "Dysfonction de la coxo-fémorale, en adduction, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 505,
    title: "Dysfonction de la coxo-fémorale, en flexion, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 506,
    title: "Dysfonction de la coxo-fémorale, en antériorité classique, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 507,
    title: "Dysfonction de la coxo-fémorale, en postériorité, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 508,
    title: "Dysfonction de la coxo-fémorale articulaire globale dans un axe transversal, à droite",
    zone: "Membres inférieurs",
    sub: "Hanche",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "◎"
  },
  {
    id: 509,
    title: "Dysfonction de la fémoro-tibiale, en abduction, à gauche",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 510,
    title: "Dysfonction de la fémoro-tibiale, en adduction, à gauche",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 511,
    title: "Dysfonction de la fémoro-tibiale, en antériorité, à gauche",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 512,
    title: "Dysfonction de la fémoro-tibiale, en postériorité, à gauche",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◉"
  },
  {
    id: 513,
    title: "Dysfonction de la fémoro-tibiale, en rotation interne, à droite",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "⟳"
  },
  {
    id: 514,
    title: "Dysfonction de la fémoro-tibiale, en rotation externe, à droite",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "⟳"
  },
  {
    id: 515,
    title: "Dysfonction du ménisque médial, en postériorité et en extension, à droite",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "M"
  },
  {
    id: 516,
    title: "Dysfonction du ménisque médial en postériorité, en flexion, à droite",
    zone: "Membres inférieurs",
    sub: "Genou",
    level: "Niveau avancé",
    status: "non vue",
    percent: 0,
    icon: "M"
  },

  // =========================================================
  // MEMBRES INFÉRIEURS — TIBIA / FIBULA / CHEVILLE / PIED
  // =========================================================
  {
    id: 551,
    title: "Dysfonction de la fibulo-tibiale supérieure, en postériorité, à gauche",
    zone: "Membres inférieurs",
    sub: "Tibia-fibula",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "TF"
  },
  {
    id: 552,
    title: "Dysfonction de la fibulo-tibiale inférieure, en antériorité, à gauche",
    zone: "Membres inférieurs",
    sub: "Tibia-fibula",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "TF"
  },
  {
    id: 553,
    title: "Dysfonction de la fibulo-tibiale inférieure, en postériorité, à droite",
    zone: "Membres inférieurs",
    sub: "Tibia-fibula",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "TF"
  },
  {
    id: 554,
    title: "Dysfonction de la tibio-tarsienne articulaire globale, en décubitus ventral, à gauche",
    zone: "Membres inférieurs",
    sub: "Cheville",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 555,
    title: "Entorse tibio-tarsienne externe, à droite",
    zone: "Membres inférieurs",
    sub: "Cheville",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "!"
  },
  {
    id: 556,
    title: "Décoaptation de la tibio-tarsienne globale, à gauche",
    zone: "Membres inférieurs",
    sub: "Cheville",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "↧"
  },
  {
    id: 557,
    title: "Dysfonction de la tibio-tarsienne, en antériorité, à droite",
    zone: "Membres inférieurs",
    sub: "Cheville",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◌"
  },
  {
    id: 558,
    title: "Dysfonction de la sous-astragalienne antéro-interne, à gauche",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 559,
    title: "Dysfonction de la sous-astragalienne postéro-externe, à droite",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 560,
    title: "Dysfonction de la sous-talienne, calcanéus en valgus, à gauche",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 561,
    title: "Dysfonction de la sous-talienne, calcanéus en varus, à droite",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 562,
    title: "Dysfonction de la calcanéo-cuboïdienne, en rotation interne, à gauche",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 563,
    title: "Dysfonction talo-naviculaire, en rotation externe, à droite",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 564,
    title: "Dysfonction de la naviculo-cuboïdienne articulaire globale, à droite",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau intermédiaire",
    status: "non vue",
    percent: 0,
    icon: "◟"
  },
  {
    id: 565,
    title: "Dysfonction de la métatarso-phalangienne de la 1re phalange, en flexion dorsale, à droite",
    zone: "Membres inférieurs",
    sub: "Pied",
    level: "Niveau débutant",
    status: "non vue",
    percent: 0,
    icon: "◟"
  }
];

const zoneSubzones = {
  "Membres supérieurs": [
    { label: "Clavicule", icon: "◜", detail: "Sterno-claviculaire et acromio-claviculaire" },
    { label: "Épaule", icon: "◜", detail: "Acromio-claviculaire et gléno-humérale" },
    { label: "Coude", icon: "◌", detail: "Huméro-ulnaire et huméro-radiale" },
    { label: "Poignet", icon: "▧", detail: "Radio-carpienne et médio-carpienne" },
    { label: "Main", icon: "✋", detail: "Inter-carpiennes et trapézo-métacarpienne" }
  ],
  "Membres inférieurs": [
    { label: "Hanche", icon: "◉", detail: "Coxo-fémorale" },
    { label: "Genou", icon: "◉", detail: "Fémoro-tibiale et ménisques" },
    { label: "Tibia-fibula", icon: "TF", detail: "Fibulo-tibiale supérieure et inférieure" },
    { label: "Cheville", icon: "◌", detail: "Tibio-tarsienne" },
    { label: "Pied", icon: "◟", detail: "Sous-talienne, calcanéus, tarse et avant-pied" }
  ],
  "Bassin": [
    { label: "Ilium", icon: "◜", detail: "Antériorité, postériorité, ouverture, fermeture" },
    { label: "Sacrum", icon: "S", detail: "Torsions, flexions, extensions unilatérales" },
    { label: "Symphyse pubienne", icon: "SP", detail: "Supériorité, infériorité et dysfonctions combinées" }
  ]
};

let currentZone = "Rachis";
let currentSubzone = "Cervicales";
let currentBack = "rachis";
let currentTechniqueId = 1;

function go(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.toggle("active", screen.id === id);
    if (screen.id === id) screen.scrollTop = 0;
  });

  document.querySelectorAll(".bottom button").forEach(button => {
    const target = button.dataset.target;
    const active =
      target === id ||
      (target === "zones" && ["zones", "rachis", "techniques", "player"].includes(id)) ||
      (target === "revision" && ["revision", "revisionCard"].includes(id)) ||
      (target === "home" && ["quiz", "progress"].includes(id));

    button.classList.toggle("active", active);
  });
}

function toast(message) {
  const element = document.getElementById("toast");
  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 1500);
}

function openSubzone(subzone) {
  currentZone = "Rachis";
  currentSubzone = subzone;
  currentBack = "rachis";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = subzone;

  clearSearch();
  renderTechniques();
  go("techniques");
}

function openZone(zone) {
  currentZone = zone;
  currentSubzone = zone;
  currentBack = "zones";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = zone;

  clearSearch();
  renderTechniques();
  go("techniques");
}

function openMemberSubzone(zone, subzone) {
  currentZone = zone;
  currentSubzone = subzone;
  currentBack = "techniques";

  const title = document.getElementById("techTitle");
  if (title) title.textContent = subzone;

  clearSearch();
  renderTechniques();
}

function clearSearch() {
  const input = document.getElementById("searchInput");
  if (input) input.value = "";
}

function renderTechniques() {
  const list = document.getElementById("techList");
  if (!list) return;

  const query = (document.getElementById("searchInput")?.value || "").toLowerCase();

  // Si on est sur une zone qui possède des sous-zones, on affiche d’abord les sous-zones.
  if (zoneSubzones[currentSubzone]) {
    list.innerHTML = zoneSubzones[currentSubzone].map(item => `
      <button class="row tech featured" onclick="openMemberSubzone('${currentSubzone}', '${item.label}')">
        <div class="tech-icon">${item.icon}</div>
        <div>
          <h3>${item.label}</h3>
          <small>${item.detail}</small>
        </div>
        <div class="state"><span>ouvrir ›</span></div>
      </button>
    `).join("");
    return;
  }

  const items = techniques.filter(technique => {
    return technique.sub === currentSubzone &&
      technique.title.toLowerCase().includes(query);
  });

  if (items.length === 0) {
    list.innerHTML = `
      <article class="empty">
        <h3>Aucune technique pour l’instant</h3>
        <p>Les vidéos seront ajoutées progressivement dans cette sous-zone.</p>
      </article>
    `;
    return;
  }

  list.innerHTML = items.map((technique, index) => `
    <button class="row tech ${index === 0 ? "featured" : ""}" onclick="openTechnique(${technique.id})">
      <div class="tech-icon">${technique.icon}</div>
      <div>
        <h3>${technique.title}</h3>
        <small>${technique.level}</small>
      </div>
      <div class="state">${stateLabel(technique)}</div>
    </button>
  `).join("");
}

function stateLabel(technique) {
  if (technique.status === "vue") return `<span class="seen">vue ✓</span>`;
  if (technique.status === "à revoir") return `<span class="review">à revoir !</span>`;
  if (technique.percent) return `<b>${technique.percent}%</b>`;

  return `<span>non vue ○</span>`;
}

function openTechnique(id) {
  const technique = techniques.find(item => item.id === id) || techniques[0];
  currentTechniqueId = technique.id;

  const title = document.getElementById("playerTitle");
  if (title) title.textContent = technique.title;

  updatePlayerChips(technique);
  updateVideoSource(technique);

  go("player");
}

function updatePlayerChips(technique) {
  const chips = document.querySelector("#player .chips");
  if (!chips) return;

  chips.innerHTML = `
    <span>${technique.zone}</span>
    <span>${technique.sub}</span>
    <span>${technique.level}</span>
  `;
}

function updateVideoSource(technique) {
  const video = document.getElementById("video");
  if (!video) return;

  const source = video.querySelector("source");
  if (!source) return;

  // Nommage automatique conseillé pour GitHub :
  // assets/videos/001-dysfonction-facettaire-cervico-dorsale-c7-d2-position-assise-a-droite.mp4
  const filename = `${String(technique.id).padStart(3, "0")}-${slugify(technique.title)}.mp4`;

  source.src = `assets/videos/${filename}`;
  video.poster = `assets/images/${String(technique.id).padStart(3, "0")}-${slugify(technique.title)}.webp`;
  video.load();
}

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "-")
    .replace(/–/g, "-")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function toggleVideo() {
  const video = document.getElementById("video");
  if (!video) return;

  if (video.paused) {
    video.play().catch(() => toast("Ajoutez la vidéo dans assets/videos"));
  } else {
    video.pause();
  }
}

function jump(seconds) {
  const video = document.getElementById("video");
  if (video && video.duration) {
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  }
}

// Patch DOM léger : on ajoute Bassin dans l’écran zones si le bouton n’existe pas déjà.
// index.html et styles.css restent inchangés.
function patchAnatomyMenu() {
  const zonesList = document.querySelector("#zones .list");
  if (!zonesList) return;

  const alreadyHasBassin = Array.from(zonesList.querySelectorAll("strong"))
    .some(element => element.textContent.trim().toLowerCase() === "bassin");

  if (alreadyHasBassin) return;

  const button = document.createElement("button");
  button.className = "row orange";
  button.onclick = () => openZone("Bassin");
  button.innerHTML = `
    <div class="pill-icon">◡</div>
    <div>
      <strong>Bassin</strong>
      <p>Ilium, sacrum, symphyse pubienne</p>
    </div>
    <em>›</em>
  `;

  // On place Bassin juste après Rachis.
  const rows = zonesList.querySelectorAll(".row");
  if (rows.length > 0) {
    rows[0].insertAdjacentElement("afterend", button);
  } else {
    zonesList.appendChild(button);
  }
}

// Patch léger : si le visuel rachis existe, on laisse l’image prévue.
// Si elle manque, l’application continue sans casser.
function patchMissingImages() {
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  patchAnatomyMenu();
  patchMissingImages();
  renderTechniques();
});

// Sécurité si le script est chargé en fin de body, comme dans ton prototype actuel.
patchAnatomyMenu();
patchMissingImages();
renderTechniques();
