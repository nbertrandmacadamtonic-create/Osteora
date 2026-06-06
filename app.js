// OSTÉO RA — V10 stable mobile — app.js complet
// Fichier app.js uniquement.
// index.html et styles.css restent inchangés.
// Patch demandé : bonhomme anatomique avec flèches + bassin + listes complètes par zones.

const techniques = [
  // =====================================================
  // RACHIS — CERVICALES / OAA / CERVICO-DORSALE
  // =====================================================
  { id: 1, title: "Dysfonction facettaire de la région cervico-dorsale C7–D2, position assise, à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "C7" },
  { id: 2, title: "Dysfonction facettaire de la région cervico-dorsale C7–D2, en procubitus à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "C7" },
  { id: 3, title: "Dysfonction de la région cervico-dorsale C7–D2, composantes multiples à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "C/D" },
  { id: 4, title: "Dysfonction de l’occiput, en postériorité à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "O" },
  { id: 5, title: "Dysfonction de l’occiput, en translation à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "O" },
  { id: 6, title: "Dysfonction articulaire globale occiput-atlas-axis", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "OAA" },
  { id: 7, title: "Dysfonction de l’atlas, en postériorité à droite", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "C1" },
  { id: 8, title: "Dysfonction de l’atlas, en translation droite", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "C1" },
  { id: 9, title: "Dysfonction facettaire des cervicales C2–C6, en postériorité à droite, variante", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "en cours", percent: 60, icon: "C" },
  { id: 10, title: "Dysfonction facettaire des cervicales C2–C6, en postériorité à droite, prise mentonnière", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "C" },
  { id: 11, title: "Dysfonction facettaire des cervicales C2–C6, en translation droite", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "↔" },
  { id: 12, title: "Dysfonction facettaire des cervicales C2–C6, en postériorité à gauche, sujet assis", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "C" },
  { id: 13, title: "Dysfonction des cervicales C2–C7, en ERdSd, énergie musculaire", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "vue", percent: 100, icon: "EM" },
  { id: 14, title: "Dysfonction des cervicales C2–C7, en FRdSd, énergie musculaire", zone: "Rachis", sub: "Cervicales", level: "Niveau intermédiaire", status: "à revoir", percent: 0, icon: "EM" },
  { id: 15, title: "Dysfonction atloïdo-axoïdienne, en rotation droite, énergie musculaire", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "C1" },
  { id: 16, title: "Dysfonction occipito-atloïdienne, en ESgRd, énergie musculaire", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "O" },
  { id: 17, title: "Dysfonction occipito-atloïdienne, en FSgRd, énergie musculaire", zone: "Rachis", sub: "Cervicales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "O" },

  // =====================================================
  // RACHIS — DORSALES
  // =====================================================
  { id: 101, title: "Dysfonction facettaire des dorsales, en flexion, technique en double appui", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "vue", percent: 80, icon: "D" },
  { id: 102, title: "Dysfonction facettaire des dorsales, en extension, technique en double appui", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "D" },
  { id: 103, title: "Dysfonction facettaire des dorsales, technique en simple appui", zone: "Rachis", sub: "Dorsales", level: "Niveau débutant", status: "non vue", percent: 0, icon: "D" },
  { id: 104, title: "Dysfonction facettaire des dorsales, avec les pisiformes croisés, postériorité à droite", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "✕" },
  { id: 105, title: "Dysfonction facettaire des dorsales, technique en pisiforme simple, postériorité à droite", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◈" },
  { id: 106, title: "Dysfonction facettaire des dorsales D9 à D12, assis, technique en pisiforme simple, postériorité à gauche", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "D12" },
  { id: 107, title: "Dysfonction facettaire des dorsales, technique en double Nelson", zone: "Rachis", sub: "Dorsales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "N" },
  { id: 108, title: "Dysfonction des vertèbres dorsales, technique en lift, composantes multiples, assis", zone: "Rachis", sub: "Dorsales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "↟" },
  { id: 109, title: "Dysfonction d’une vertèbre dorsale D8–D12, en NSgRd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 110, title: "Dysfonction d’une vertèbre dorsale D8–D12, en ERdSd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 111, title: "Dysfonction d’une vertèbre dorsale D8–D12, en FRdSd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 112, title: "Dysfonction d’une vertèbre dorsale D4–D8, en NSgRd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 113, title: "Dysfonction d’une vertèbre dorsale D4–D8, en FRdSd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 114, title: "Dysfonction d’une vertèbre dorsale D1–D4, en NSgRd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 115, title: "Dysfonction d’une vertèbre dorsale D1–D3, en FRdSd, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },

  // Côtes rattachées aux dorsales
  { id: 151, title: "Dysfonction costo-transversaire de la 1re côte, en élévation, technique structurelle", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "1" },
  { id: 152, title: "Dysfonction costo-transversaire antéro-médiane, technique structurelle", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "↘" },
  { id: 153, title: "Dysfonction costo-transversaire postéro-latérale, technique structurelle", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "↖" },
  { id: 154, title: "Dysfonction costo-transversaire, composantes multiples, technique structurelle, assis", zone: "Rachis", sub: "Dorsales", level: "Niveau avancé", status: "non vue", percent: 0, icon: "C" },
  { id: 155, title: "Dysfonction costo-transversaire antéro-médiane, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 156, title: "Dysfonction costo-transversaire postéro-latérale, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 157, title: "Dysfonction respiratoire de la 1re côte, en élévation dans le plan sagittal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "1" },
  { id: 158, title: "Dysfonction respiratoire de la 1re côte, en élévation dans le plan frontal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "1" },
  { id: 159, title: "Dysfonction respiratoire des 1re–6e côtes, en élévation dans le plan sagittal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "6" },
  { id: 160, title: "Dysfonction respiratoire des 1re–6e côtes, en élévation dans le plan frontal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "6" },
  { id: 161, title: "Dysfonction respiratoire des 7e–10e côtes, en élévation dans le plan sagittal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "10" },
  { id: 162, title: "Dysfonction respiratoire des 7e–10e côtes, en élévation dans le plan frontal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "10" },
  { id: 163, title: "Dysfonction des 1re–2e côtes, en abaissement dans le plan sagittal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "2" },
  { id: 164, title: "Dysfonction des 1re–2e côtes, en abaissement dans le plan frontal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "2" },
  { id: 165, title: "Dysfonction des 3e–10e côtes, en abaissement dans le plan frontal, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "10" },
  { id: 166, title: "Dysfonction des 11e–12e côtes, en élévation, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "12" },
  { id: 167, title: "Dysfonction des 11e–12e côtes, en abaissement, énergie musculaire", zone: "Rachis", sub: "Dorsales", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "12" },

  // =====================================================
  // RACHIS — LOMBAIRES / CHARNIÈRES
  // =====================================================
  { id: 201, title: "Dysfonction facettaire des lombaires, en NSR à droite", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "à revoir", percent: 45, icon: "L" },
  { id: 202, title: "Dysfonction facettaire des lombaires, en ERS à droite", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "L" },
  { id: 203, title: "Dysfonction facettaire des lombaires, en FRS à droite, énergie musculaire", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 204, title: "Dysfonction facettaire des lombaires, assis, à gauche", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "L" },
  { id: 205, title: "Dysfonction des lombaires, en NSR à gauche, énergie musculaire", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 206, title: "Dysfonction des lombaires, en ERS à gauche, énergie musculaire", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 207, title: "Dysfonction des lombaires, en FRS à droite", zone: "Rachis", sub: "Lombaires", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "L" },
  { id: 208, title: "Dysfonction de la charnière D12/L1, technique en double appui", zone: "Rachis", sub: "Lombaires", level: "Niveau avancé", status: "non vue", percent: 0, icon: "D/L" },
  { id: 209, title: "Dysfonction de la charnière D12/L1, technique indirecte à droite en Lumbar Roll", zone: "Rachis", sub: "Lombaires", level: "Niveau avancé", status: "non vue", percent: 0, icon: "↻" },
  { id: 210, title: "Dysfonction de L3, technique semi-directe à gauche en Lumbar Roll", zone: "Rachis", sub: "Lombaires", level: "Niveau avancé", status: "non vue", percent: 0, icon: "↻" },
  { id: 211, title: "Charnière D12/L1, technique en Lift, postériorité à gauche", zone: "Rachis", sub: "Lombaires", level: "Niveau avancé", status: "non vue", percent: 0, icon: "↟" },

  // =====================================================
  // BASSIN — ILIUM
  // =====================================================
  { id: 301, title: "Dysfonction de l’ilium, en antériorité à gauche", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◜" },
  { id: 302, title: "Dysfonction de l’ilium, en antériorité à gauche, variante sujet laxe", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◜" },
  { id: 303, title: "Dysfonction de l’ilium, en postériorité à droite", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◝" },
  { id: 304, title: "Dysfonction de l’ilium, en postériorité à droite, variante sujet laxe", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◝" },
  { id: 305, title: "Dysfonction de l’ilium, en supériorité à droite", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "↥" },
  { id: 306, title: "Dysfonction de l’ilium, en antériorité à gauche, énergie musculaire", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 307, title: "Dysfonction de l’ilium, en postériorité à droite, énergie musculaire", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 308, title: "Dysfonction de l’ilium, en postériorité à droite en procubitus, énergie musculaire", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 309, title: "Dysfonction de l’ilium, en fermeture à droite, énergie musculaire", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 310, title: "Dysfonction de l’ilium, en ouverture à droite, énergie musculaire", zone: "Bassin", sub: "Ilium", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },

  // =====================================================
  // BASSIN — SACRUM / SYMPHYSE
  // =====================================================
  { id: 351, title: "Dysfonction du sacrum, en torsion postérieure avec le pisiforme direct, à gauche", zone: "Bassin", sub: "Sacrum", level: "Niveau avancé", status: "non vue", percent: 0, icon: "S" },
  { id: 352, title: "Dysfonction du sacrum, en flexion unilatérale sur axe horizontal, à gauche", zone: "Bassin", sub: "Sacrum", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "S" },
  { id: 353, title: "Dysfonction du sacrum, en torsion postérieure gauche sur axe oblique droit", zone: "Bassin", sub: "Sacrum", level: "Niveau avancé", status: "non vue", percent: 0, icon: "S" },
  { id: 354, title: "Dysfonction du sacrum, en torsion antérieure droite sur axe droit, énergie musculaire", zone: "Bassin", sub: "Sacrum", level: "Niveau avancé", status: "non vue", percent: 0, icon: "EM" },
  { id: 355, title: "Dysfonction du sacrum, en torsion postérieure droite sur un axe droit, énergie musculaire", zone: "Bassin", sub: "Sacrum", level: "Niveau avancé", status: "non vue", percent: 0, icon: "EM" },
  { id: 356, title: "Dysfonction du sacrum, en antériorité unilatérale, manœuvre avec le pisiforme direct", zone: "Bassin", sub: "Sacrum", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "S" },
  { id: 357, title: "Dysfonction du sacrum, en extension unilatérale sur axe horizontal, à droite", zone: "Bassin", sub: "Sacrum", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "S" },
  { id: 381, title: "Dysfonction de la symphyse pubienne, en supériorité à droite, énergie musculaire", zone: "Bassin", sub: "Symphyse pubienne", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "SP" },
  { id: 382, title: "Dysfonction de la symphyse pubienne, en infériorité à gauche, énergie musculaire", zone: "Bassin", sub: "Symphyse pubienne", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "SP" },
  { id: 383, title: "Dysfonction combinée de la symphyse pubienne, en supériorité et infériorité", zone: "Bassin", sub: "Symphyse pubienne", level: "Niveau avancé", status: "non vue", percent: 0, icon: "SP" },

  // =====================================================
  // MEMBRES SUPÉRIEURS
  // =====================================================
  { id: 401, title: "Dysfonction pré-sternale de la clavicule, à droite", zone: "Membres supérieurs", sub: "Clavicule", level: "Niveau débutant", status: "non vue", percent: 0, icon: "◜" },
  { id: 402, title: "Dysfonction sus-sternale de la clavicule, à droite", zone: "Membres supérieurs", sub: "Clavicule", level: "Niveau débutant", status: "non vue", percent: 0, icon: "◜" },
  { id: 403, title: "Dysfonction sus-sternale de la clavicule, énergie musculaire, à droite", zone: "Membres supérieurs", sub: "Clavicule", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 404, title: "Dysfonction sus-sternale de la clavicule, énergie musculaire, à gauche", zone: "Membres supérieurs", sub: "Clavicule", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "EM" },
  { id: 405, title: "Dysfonction acromio-claviculaire, en rotation antérieure, à gauche", zone: "Membres supérieurs", sub: "Épaule", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◜" },
  { id: 406, title: "Dysfonction acromio-claviculaire, en rotation postérieure, à gauche", zone: "Membres supérieurs", sub: "Épaule", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◜" },
  { id: 407, title: "Dysfonction gléno-humérale, en antériorité, à gauche", zone: "Membres supérieurs", sub: "Épaule", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "↻" },
  { id: 408, title: "Dysfonction huméro-ulnaire, en abduction, à gauche", zone: "Membres supérieurs", sub: "Coude", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 409, title: "Dysfonction huméro-ulnaire, en adduction, à droite", zone: "Membres supérieurs", sub: "Coude", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 410, title: "Dysfonction huméro-radiale, en antériorité, à droite", zone: "Membres supérieurs", sub: "Coude", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 411, title: "Dysfonction huméro-radiale, en postériorité, à droite", zone: "Membres supérieurs", sub: "Coude", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 412, title: "Dysfonction huméro-radiale, en postériorité, variante", zone: "Membres supérieurs", sub: "Coude", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 413, title: "Dysfonction radio-carpienne du scaphoïde ou du lunatum, en postériorité, à gauche", zone: "Membres supérieurs", sub: "Poignet", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "▧" },
  { id: 414, title: "Dysfonction radio-carpienne, en abduction, à gauche", zone: "Membres supérieurs", sub: "Poignet", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "▧" },
  { id: 415, title: "Dysfonction articulaire globale des médio-carpiennes, à droite", zone: "Membres supérieurs", sub: "Main", level: "Niveau débutant", status: "non vue", percent: 0, icon: "✋" },
  { id: 416, title: "Dysfonction articulaire globale des inter-carpiennes, à gauche", zone: "Membres supérieurs", sub: "Main", level: "Niveau débutant", status: "non vue", percent: 0, icon: "✋" },
  { id: 417, title: "Dysfonction articulaire globale de la trapézo-métacarpienne, à droite", zone: "Membres supérieurs", sub: "Main", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "✋" },

  // =====================================================
  // MEMBRES INFÉRIEURS
  // =====================================================
  { id: 501, title: "Dysfonction de la coxo-fémorale, en rotation interne, à gauche", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 502, title: "Dysfonction de la coxo-fémorale, en rotation externe, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 503, title: "Dysfonction de la coxo-fémorale, en abduction, à gauche", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 504, title: "Dysfonction de la coxo-fémorale, en adduction, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 505, title: "Dysfonction de la coxo-fémorale, en flexion, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 506, title: "Dysfonction de la coxo-fémorale, en antériorité classique, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau avancé", status: "non vue", percent: 0, icon: "◉" },
  { id: 507, title: "Dysfonction de la coxo-fémorale, en postériorité, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau avancé", status: "non vue", percent: 0, icon: "◉" },
  { id: 508, title: "Dysfonction de la coxo-fémorale articulaire globale dans un axe transversal, à droite", zone: "Membres inférieurs", sub: "Hanche", level: "Niveau avancé", status: "non vue", percent: 0, icon: "◎" },
  { id: 509, title: "Dysfonction de la fémoro-tibiale, en abduction, à gauche", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 510, title: "Dysfonction de la fémoro-tibiale, en adduction, à gauche", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 511, title: "Dysfonction de la fémoro-tibiale, en antériorité, à gauche", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 512, title: "Dysfonction de la fémoro-tibiale, en postériorité, à gauche", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◉" },
  { id: 513, title: "Dysfonction de la fémoro-tibiale, en rotation interne, à droite", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "⟳" },
  { id: 514, title: "Dysfonction de la fémoro-tibiale, en rotation externe, à droite", zone: "Membres inférieurs", sub: "Genou", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "⟳" },
  { id: 515, title: "Dysfonction du ménisque médial, en postériorité et en extension, à droite", zone: "Membres inférieurs", sub: "Genou", level: "Niveau avancé", status: "non vue", percent: 0, icon: "M" },
  { id: 516, title: "Dysfonction du ménisque médial en postériorité, en flexion, à droite", zone: "Membres inférieurs", sub: "Genou", level: "Niveau avancé", status: "non vue", percent: 0, icon: "M" },
  { id: 551, title: "Dysfonction de la fibulo-tibiale supérieure, en postériorité, à gauche", zone: "Membres inférieurs", sub: "Tibia-fibula", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "TF" },
  { id: 552, title: "Dysfonction de la fibulo-tibiale inférieure, en antériorité, à gauche", zone: "Membres inférieurs", sub: "Tibia-fibula", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "TF" },
  { id: 553, title: "Dysfonction de la fibulo-tibiale inférieure, en postériorité, à droite", zone: "Membres inférieurs", sub: "Tibia-fibula", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "TF" },
  { id: 554, title: "Dysfonction de la tibio-tarsienne articulaire globale, en décubitus ventral, à gauche", zone: "Membres inférieurs", sub: "Cheville", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 555, title: "Entorse tibio-tarsienne externe, à droite", zone: "Membres inférieurs", sub: "Cheville", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "!" },
  { id: 556, title: "Décoaptation de la tibio-tarsienne globale, à gauche", zone: "Membres inférieurs", sub: "Cheville", level: "Niveau débutant", status: "non vue", percent: 0, icon: "↧" },
  { id: 557, title: "Dysfonction de la tibio-tarsienne, en antériorité, à droite", zone: "Membres inférieurs", sub: "Cheville", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◌" },
  { id: 558, title: "Dysfonction de la sous-astragalienne antéro-interne, à gauche", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 559, title: "Dysfonction de la sous-astragalienne postéro-externe, à droite", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 560, title: "Dysfonction de la sous-talienne, calcanéus en valgus, à gauche", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 561, title: "Dysfonction de la sous-talienne, calcanéus en varus, à droite", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 562, title: "Dysfonction de la calcanéo-cuboïdienne, en rotation interne, à gauche", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 563, title: "Dysfonction talo-naviculaire, en rotation externe, à droite", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 564, title: "Dysfonction de la naviculo-cuboïdienne articulaire globale, à droite", zone: "Membres inférieurs", sub: "Pied", level: "Niveau intermédiaire", status: "non vue", percent: 0, icon: "◟" },
  { id: 565, title: "Dysfonction de la métatarso-phalangienne de la 1re phalange, en flexion dorsale, à droite", zone: "Membres inférieurs", sub: "Pied", level: "Niveau débutant", status: "non vue", percent: 0, icon: "◟" }
];

const zoneSubzones = {
  "Bassin": [
    { label: "Ilium", icon: "◜", detail: "Antériorité, postériorité, ouverture, fermeture" },
    { label: "Sacrum", icon: "S", detail: "Torsions, flexions et extensions unilatérales" },
    { label: "Symphyse pubienne", icon: "SP", detail: "Supériorité, infériorité et dysfonctions combinées" }
  ],
  "Membres supérieurs": [
    { label: "Clavicule", icon: "◜", detail: "Sterno-claviculaire et clavicule" },
    { label: "Épaule", icon: "◜", detail: "Acromio-claviculaire et gléno-humérale" },
    { label: "Coude", icon: "◌", detail: "Huméro-ulnaire et huméro-radiale" },
    { label: "Poignet", icon: "▧", detail: "Radio-carpienne" },
    { label: "Main", icon: "✋", detail: "Carpe, inter-carpiennes et trapézo-métacarpienne" }
  ],
  "Membres inférieurs": [
    { label: "Hanche", icon: "◉", detail: "Coxo-fémorale" },
    { label: "Genou", icon: "◉", detail: "Fémoro-tibiale et ménisques" },
    { label: "Tibia-fibula", icon: "TF", detail: "Fibulo-tibiale supérieure et inférieure" },
    { label: "Cheville", icon: "◌", detail: "Tibio-tarsienne" },
    { label: "Pied", icon: "◟", detail: "Sous-talienne, calcanéus, tarse et avant-pied" }
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

// =====================================================
// PATCH VISUEL : BONHOMME ANATOMIQUE AVEC FLÈCHES
// Ne modifie pas index.html : le DOM est remplacé au chargement.
// =====================================================

function injectAnatomyStyles() {
  if (document.getElementById("anatomyPatchStyles")) return;

  const style = document.createElement("style");
  style.id = "anatomyPatchStyles";
  style.textContent = `
    .anatomy-map {
      position: relative;
      min-height: 455px;
      margin: 6px 0 18px;
      border-radius: 30px;
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 18%, rgba(0,229,255,.18), transparent 34%),
        radial-gradient(circle at 50% 78%, rgba(168,85,255,.14), transparent 34%),
        linear-gradient(145deg, rgba(10,29,55,.82), rgba(5,15,31,.88));
      border: 1px solid var(--line);
      box-shadow: 0 18px 55px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.05);
    }

    .anatomy-body {
      position: absolute;
      left: 50%;
      top: 26px;
      transform: translateX(-50%);
      width: 185px;
      height: 390px;
      pointer-events: none;
    }

    .anatomy-body img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: .76;
      mix-blend-mode: screen;
      filter: drop-shadow(0 0 28px rgba(0,229,255,.42));
    }

    .fallback-body {
      position: absolute;
      left: 50%;
      top: 28px;
      transform: translateX(-50%);
      width: 156px;
      height: 378px;
      opacity: .9;
      filter: drop-shadow(0 0 24px rgba(0,229,255,.36));
    }

    .fallback-body .head,
    .fallback-body .torso,
    .fallback-body .pelvis,
    .fallback-body .arm,
    .fallback-body .leg {
      position: absolute;
      border: 1px solid rgba(0,229,255,.55);
      background: rgba(0,229,255,.055);
    }

    .fallback-body .head {
      left: 50%;
      top: 0;
      width: 54px;
      height: 62px;
      border-radius: 50%;
      transform: translateX(-50%);
    }

    .fallback-body .torso {
      left: 50%;
      top: 62px;
      width: 88px;
      height: 145px;
      border-radius: 45px 45px 24px 24px;
      transform: translateX(-50%);
    }

    .fallback-body .pelvis {
      left: 50%;
      top: 198px;
      width: 96px;
      height: 62px;
      border-radius: 24px 24px 45px 45px;
      transform: translateX(-50%);
    }

    .fallback-body .spine-line {
      position: absolute;
      left: 50%;
      top: 43px;
      width: 10px;
      height: 180px;
      transform: translateX(-50%);
      border-radius: 999px;
      background: linear-gradient(var(--violet), var(--cyan), var(--orange));
      box-shadow: 0 0 24px rgba(0,229,255,.7);
    }

    .fallback-body .arm {
      top: 82px;
      width: 28px;
      height: 156px;
      border-radius: 999px;
    }

    .fallback-body .arm.left { left: 8px; transform: rotate(8deg); }
    .fallback-body .arm.right { right: 8px; transform: rotate(-8deg); }

    .fallback-body .leg {
      top: 252px;
      width: 34px;
      height: 112px;
      border-radius: 999px;
    }

    .fallback-body .leg.left { left: 45px; }
    .fallback-body .leg.right { right: 45px; }

    .anatomy-arrow {
      position: absolute;
      z-index: 4;
      min-width: 132px;
      display: grid;
      grid-template-columns: 38px minmax(0,1fr) 20px;
      gap: 8px;
      align-items: center;
      padding: 10px;
      border-radius: 20px;
      color: var(--cyan);
      border: 1px solid currentColor;
      background: rgba(5,15,31,.82);
      box-shadow: 0 0 22px color-mix(in srgb,currentColor 25%,transparent);
      text-align: left;
    }

    .anatomy-arrow .tech-icon {
      width: 38px;
      height: 38px;
      font-size: 18px;
    }

    .anatomy-arrow strong {
      display: block;
      color: white;
      font-size: 14px;
      line-height: 1.1;
    }

    .anatomy-arrow small {
      display: block;
      margin-top: 3px;
      color: #c5d2e4;
      font-size: 10.5px;
      line-height: 1.15;
    }

    .anatomy-arrow em {
      font-style: normal;
      font-size: 24px;
      color: currentColor;
    }

    .anatomy-arrow.rachis {
      left: 12px;
      top: 64px;
      color: var(--cyan);
    }

    .anatomy-arrow.msup {
      right: 12px;
      top: 132px;
      color: var(--violet);
    }

    .anatomy-arrow.bassin {
      left: 12px;
      top: 255px;
      color: var(--orange);
    }

    .anatomy-arrow.minf {
      right: 12px;
      top: 316px;
      color: var(--green);
    }

    .anatomy-line {
      position: absolute;
      z-index: 3;
      height: 2px;
      background: currentColor;
      opacity: .65;
      transform-origin: left center;
      box-shadow: 0 0 12px currentColor;
    }

    .line-rachis { left: 140px; top: 112px; width: 75px; color: var(--cyan); transform: rotate(7deg); }
    .line-msup { right: 135px; top: 178px; width: 64px; color: var(--violet); transform: rotate(170deg); }
    .line-bassin { left: 140px; top: 304px; width: 76px; color: var(--orange); transform: rotate(-5deg); }
    .line-minf { right: 135px; top: 365px; width: 60px; color: var(--green); transform: rotate(170deg); }

    .zone-summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }

    .zone-summary div {
      border-radius: 16px;
      padding: 9px 6px;
      text-align: center;
      border: 1px solid var(--line);
      background: rgba(255,255,255,.035);
    }

    .zone-summary b {
      display: block;
      color: white;
      font-size: 16px;
    }

    .zone-summary span {
      color: #aeb8cc;
      font-size: 10px;
    }

    @media(max-width:380px) {
      .anatomy-map { min-height: 435px; }
      .anatomy-arrow { min-width: 122px; padding: 9px; }
      .anatomy-arrow strong { font-size: 13px; }
      .anatomy-arrow small { font-size: 10px; }
      .anatomy-body, .fallback-body { transform: translateX(-50%) scale(.94); transform-origin: top center; }
      .anatomy-arrow.rachis { left: 6px; }
      .anatomy-arrow.msup { right: 6px; }
      .anatomy-arrow.bassin { left: 6px; }
      .anatomy-arrow.minf { right: 6px; }
    }
  `;

  document.head.appendChild(style);
}

function techniqueCountForZone(zone) {
  return techniques.filter(item => item.zone === zone).length;
}

function patchAnatomyMenu() {
  const zonesScreen = document.getElementById("zones");
  if (!zonesScreen) return;

  const title = zonesScreen.querySelector(".page-title");
  const bodyImg = zonesScreen.querySelector(".body-img");
  const list = zonesScreen.querySelector(".list");

  if (title) {
    title.innerHTML = `
      <h1>Choisissez une zone</h1>
      <p>Touchez une flèche anatomique pour ouvrir le sous-menu correspondant.</p>
    `;
  }

  if (bodyImg) bodyImg.remove();
  if (list) list.remove();

  if (zonesScreen.querySelector(".anatomy-map")) return;

  const map = document.createElement("section");
  map.className = "anatomy-map";
  map.innerHTML = `
    <div class="anatomy-body">
      <img src="assets/images/human-body-back.webp" alt="" onerror="this.style.display='none'; this.parentElement.querySelector('.fallback-body').style.display='block';">
      <div class="fallback-body" style="display:none">
        <div class="head"></div>
        <div class="torso"></div>
        <div class="pelvis"></div>
        <div class="spine-line"></div>
        <div class="arm left"></div>
        <div class="arm right"></div>
        <div class="leg left"></div>
        <div class="leg right"></div>
      </div>
    </div>

    <div class="anatomy-line line-rachis"></div>
    <div class="anatomy-line line-msup"></div>
    <div class="anatomy-line line-bassin"></div>
    <div class="anatomy-line line-minf"></div>

    <button class="anatomy-arrow rachis" onclick="go('rachis')">
      <div class="tech-icon">⌇</div>
      <div>
        <strong>Rachis</strong>
        <small>Cervicales · Dorsales · Lombaires</small>
      </div>
      <em>›</em>
    </button>

    <button class="anatomy-arrow msup" onclick="openZone('Membres supérieurs')">
      <div class="tech-icon">◜</div>
      <div>
        <strong>Membre sup.</strong>
        <small>Épaule · Coude · Main</small>
      </div>
      <em>›</em>
    </button>

    <button class="anatomy-arrow bassin" onclick="openZone('Bassin')">
      <div class="tech-icon">◡</div>
      <div>
        <strong>Bassin</strong>
        <small>Ilium · Sacrum · Symphyse</small>
      </div>
      <em>›</em>
    </button>

    <button class="anatomy-arrow minf" onclick="openZone('Membres inférieurs')">
      <div class="tech-icon">◟</div>
      <div>
        <strong>Membre inf.</strong>
        <small>Hanche · Genou · Pied</small>
      </div>
      <em>›</em>
    </button>
  `;

  const summary = document.createElement("section");
  summary.className = "zone-summary";
  summary.innerHTML = `
    <div><b>${techniqueCountForZone("Rachis")}</b><span>Rachis</span></div>
    <div><b>${techniqueCountForZone("Bassin")}</b><span>Bassin</span></div>
    <div><b>${techniqueCountForZone("Membres supérieurs")}</b><span>M. sup.</span></div>
    <div><b>${techniqueCountForZone("Membres inférieurs")}</b><span>M. inf.</span></div>
  `;

  zonesScreen.appendChild(map);
  zonesScreen.appendChild(summary);
}

function patchRachisScreen() {
  const rachisScreen = document.getElementById("rachis");
  if (!rachisScreen) return;

  const buttons = rachisScreen.querySelectorAll(".list button");
  if (!buttons.length) return;

  // On garde les 3 entrées simples : Cervicales / Dorsales / Lombaires.
  // Les côtes restent intégrées dans Dorsales pour éviter de surcharger le premier niveau.
}

function patchMissingImages() {
  document.querySelectorAll("img").forEach(img => {
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
  });
}

function initOsteoRA() {
  injectAnatomyStyles();
  patchAnatomyMenu();
  patchRachisScreen();
  patchMissingImages();
  renderTechniques();
}

document.addEventListener("DOMContentLoaded", initOsteoRA);
initOsteoRA();
