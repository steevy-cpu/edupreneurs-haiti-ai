-- Update the "Utilisation de la balance" lesson with MUCH more detailed and comprehensive content
UPDATE lessons 
SET contenu = '<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚖️ Introduction : Qu''est-ce que la Masse ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        La <strong>masse</strong> est une propriété fondamentale de la matière qui représente la quantité de matière contenue dans un objet. C''est une grandeur physique qui caractérise la quantité de substance qu''un corps contient. Contrairement au poids qui varie selon la gravité, la masse reste constante peu importe où se trouve l''objet - que ce soit sur Terre, sur la Lune, ou même dans l''espace !
      </p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg mb-4">
        <h4 class="font-bold mb-3 text-lg">📊 Les Unités de Mesure de la Masse</h4>
        <p class="mb-3 text-sm">Le système international utilise plusieurs unités pour mesurer la masse, adaptées à différentes échelles :</p>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h5 class="font-semibold mb-2">Unités principales :</h5>
            <ul class="space-y-2">
              <li class="flex items-center gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Kilogramme (kg)</strong> - Unité de base du SI</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Gramme (g)</strong> - Pour les objets légers</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Milligramme (mg)</strong> - Pour les très petites masses</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span><strong>Tonne (t)</strong> - Pour les grandes masses</span>
              </li>
            </ul>
          </div>
          <div>
            <h5 class="font-semibold mb-2">Conversions essentielles :</h5>
            <ul class="space-y-2 text-sm">
              <li>• 1 tonne (t) = 1 000 kg</li>
              <li>• 1 kilogramme (kg) = 1 000 g</li>
              <li>• 1 gramme (g) = 1 000 mg</li>
              <li>• 1 milligramme (mg) = 0,001 g</li>
              <li>• 1 quintal (q) = 100 kg</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg border-l-4 border-amber-500">
        <h4 class="font-bold mb-3 flex items-center gap-2">
          <span>💡</span> Distinction Fondamentale : Masse vs Poids
        </h4>
        <p class="text-sm mb-3">
          Beaucoup de personnes confondent masse et poids, mais ce sont deux concepts physiques complètement différents. Comprendre cette différence est crucial en sciences !
        </p>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded">
            <h5 class="font-bold mb-2">🔵 La Masse</h5>
            <ul class="space-y-1">
              <li>✓ Quantité de matière dans un objet</li>
              <li>✓ Ne change JAMAIS, peu importe le lieu</li>
              <li>✓ Se mesure en kilogrammes (kg)</li>
              <li>✓ Propriété intrinsèque de l''objet</li>
              <li>✓ Mesurée avec une balance</li>
            </ul>
          </div>
          <div class="bg-orange-50 dark:bg-orange-950/30 p-4 rounded">
            <h5 class="font-bold mb-2">🔶 Le Poids</h5>
            <ul class="space-y-1">
              <li>✓ Force gravitationnelle sur l''objet</li>
              <li>✓ VARIE selon la gravité du lieu</li>
              <li>✓ Se mesure en Newtons (N)</li>
              <li>✓ Dépend de l''environnement</li>
              <li>✓ Mesuré avec un dynamomètre</li>
            </ul>
          </div>
        </div>
        <div class="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="text-sm">
            <strong>📝 Exemple concret :</strong> Un astronaute de 70 kg a toujours une masse de 70 kg, que ce soit sur Terre, sur la Lune ou dans l''espace. Par contre, son poids sur Terre est d''environ 700 N, mais seulement 117 N sur la Lune (car la gravité lunaire est 6 fois plus faible) et 0 N dans l''espace (apesanteur) !
          </p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Les Différents Types de Balances</h2>
    <p class="mb-6 text-muted-foreground leading-relaxed">
      Il existe plusieurs types de balances, chacune conçue pour des usages spécifiques et offrant différents niveaux de précision. Le choix d''une balance dépend de la précision requise, de la masse à mesurer, et du contexte d''utilisation. Comprendre ces différences est essentiel pour utiliser l''instrument approprié.
    </p>
    
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">⚖️ Balance à Fléaux (Balance de Roberval)</h3>
        <p class="text-sm mb-4 italic">Type classique utilisé principalement dans les laboratoires scientifiques et éducatifs</p>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2">🔧 Caractéristiques techniques :</h4>
          <ul class="space-y-2 text-sm">
            <li>✓ Deux plateaux suspendus à un fléau horizontal mobile</li>
            <li>✓ Fonctionne selon le principe de l''équilibre des moments</li>
            <li>✓ Compare l''objet inconnu avec des masses étalonnées certifiées</li>
            <li>✓ Précision : généralement ±0,1 g à ±1 g selon le modèle</li>
            <li>✓ Capacité typique : 0 à 2000 g (2 kg)</li>
            <li>✓ Ne nécessite aucune source d''énergie électrique</li>
            <li>✓ Très fiable et durable si bien entretenue</li>
          </ul>
        </div>

        <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded mb-3">
          <h4 class="font-semibold mb-2">📍 Avantages :</h4>
          <ul class="text-xs space-y-1">
            <li>• Très précise pour les mesures scientifiques</li>
            <li>• Pas besoin d''électricité</li>
            <li>• Enseigne le principe d''équilibre</li>
            <li>• Peu d''entretien requis</li>
            <li>• Longue durée de vie</li>
          </ul>
        </div>

        <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded">
          <h4 class="font-semibold mb-2">📍 Inconvénients :</h4>
          <ul class="text-xs space-y-1">
            <li>• Mesure plus lente qu''une balance électronique</li>
            <li>• Nécessite des masses étalonnées</li>
            <li>• Sensible aux vibrations et courants d''air</li>
            <li>• Requiert une surface parfaitement plane</li>
          </ul>
        </div>

        <div class="mt-4 p-3 bg-white/70 dark:bg-black/30 rounded text-xs">
          <strong>💼 Usage typique :</strong> Laboratoires de chimie, physique, pharmacie (préparations magistrales), enseignement scientifique, pesées de précision en joaillerie
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">📱 Balance Électronique Numérique</h3>
        <p class="text-sm mb-4 italic">Type moderne avec affichage numérique pour des mesures rapides</p>
        
        <div class="mb-4">
          <h4 class="font-semibold mb-2">🔧 Caractéristiques techniques :</h4>
          <ul class="space-y-2 text-sm">
            <li>✓ Un seul plateau de pesée avec capteur électronique</li>
            <li>✓ Affichage digital LCD ou LED haute visibilité</li>
            <li>✓ Lecture directe et instantanée (< 3 secondes)</li>
            <li>✓ Précision : ±0,01 g à ±5 g selon les modèles</li>
            <li>✓ Fonction TARE pour peser des contenants</li>
            <li>✓ Souvent avec conversion d''unités automatique</li>
            <li>✓ Mémoire des dernières pesées sur certains modèles</li>
          </ul>
        </div>

        <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded mb-3">
          <h4 class="font-semibold mb-2">📍 Avantages :</h4>
          <ul class="text-xs space-y-1">
            <li>• Mesure très rapide (secondes)</li>
            <li>• Facile à utiliser, même pour débutants</li>
            <li>• Lecture claire et sans ambiguïté</li>
            <li>• Fonction tare très pratique</li>
            <li>• Conversion automatique entre unités</li>
            <li>• Compacte et portable</li>
          </ul>
        </div>

        <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded">
          <h4 class="font-semibold mb-2">📍 Inconvénients :</h4>
          <ul class="text-xs space-y-1">
            <li>• Nécessite des piles ou électricité</li>
            <li>• Peut dériver avec le temps (nécessite calibration)</li>
            <li>• Sensible aux interférences électromagnétiques</li>
            <li>• Moins pédagogique pour comprendre la pesée</li>
          </ul>
        </div>

        <div class="mt-4 p-3 bg-white/70 dark:bg-black/30 rounded text-xs">
          <strong>💼 Usage typique :</strong> Cuisine professionnelle et domestique, commerce (épicerie, boulangerie), industries agroalimentaires, pesées rapides quotidiennes, sport (nutrition)
        </div>
      </div>
    </div>

    <div class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-indigo-200 dark:border-indigo-800 mb-6">
      <h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">🎣 Balance Romaine (Peson)</h3>
      <p class="text-sm mb-4">Balance traditionnelle avec un bras gradué et un contrepoids mobile, basée sur le principe du levier</p>
      
      <div class="grid md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 class="font-semibold mb-3">Caractéristiques principales :</h4>
          <ul class="space-y-2">
            <li>✓ Un seul bras gradué avec échelle de mesure</li>
            <li>✓ Contrepoids (curseur) déplaçable le long du bras</li>
            <li>✓ Basée sur le principe du levier et des moments</li>
            <li>✓ Robuste et durable, conçue pour un usage intensif</li>
            <li>✓ Capacité variable : de 5 kg à 200 kg selon les modèles</li>
            <li>✓ Précision modérée : ±10 g à ±100 g</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-3">Applications pratiques :</h4>
          <ul class="space-y-2">
            <li>• <strong>Marchés traditionnels</strong> : fruits, légumes, viandes</li>
            <li>• <strong>Agriculture</strong> : récoltes, produits agricoles</li>
            <li>• <strong>Pêche</strong> : pesée des prises</li>
            <li>• <strong>Artisanat</strong> : matières premières</li>
            <li>• <strong>Usage domestique</strong> : charges diverses</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded">
        <p class="text-sm">
          <strong>💡 Le saviez-vous ?</strong> La balance romaine tire son nom de son invention par les Romains antiques. Elle a été utilisée pendant des siècles et reste populaire dans certaines régions pour sa simplicité et sa robustesse !
        </p>
      </div>
    </div>

    <div class="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-6 rounded-lg border-2 border-rose-200 dark:border-rose-800">
      <h3 class="text-xl font-bold text-rose-700 dark:text-rose-300 mb-3">🔬 Balance de Précision (Analytique)</h3>
      <p class="text-sm mb-4">Balance de très haute précision utilisée en laboratoire pour des mesures extrêmement fines</p>
      
      <div class="space-y-3 text-sm">
        <div>
          <strong>Précision exceptionnelle :</strong> ±0,0001 g (0,1 mg) à ±0,00001 g (0,01 mg)
        </div>
        <div>
          <strong>Protection :</strong> Enceinte vitrée pour protéger des courants d''air et vibrations
        </div>
        <div>
          <strong>Calibration :</strong> Calibration automatique intégrée avec masses internes certifiées
        </div>
        <div>
          <strong>Utilisations :</strong>
          <ul class="ml-4 mt-2 space-y-1">
            <li>• Recherche scientifique de pointe</li>
            <li>• Pharmacie (dosages médicamenteux ultra-précis)</li>
            <li>• Chimie analytique</li>
            <li>• Joaillerie de luxe</li>
            <li>• Contrôle qualité industriel</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📖 Guide Complet : Utilisation d''une Balance à Fléaux</h2>
    <p class="mb-6 text-muted-foreground leading-relaxed">
      L''utilisation correcte d''une balance à fléaux nécessite de la précision, de la patience et une méthode rigoureuse. Ce guide détaillé vous accompagnera à travers chaque étape pour garantir des mesures précises et reproductibles. La maîtrise de cette technique est fondamentale en sciences expérimentales.
    </p>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-l-4 border-orange-500">
        <h4 class="font-bold text-orange-700 dark:text-orange-300 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Étape 1 : Préparation et Vérification Initiale
        </h4>
        <p class="text-sm mb-4 italic">La préparation est l''étape la plus cruciale pour obtenir des mesures précises et fiables. Ne jamais la négliger !</p>
        
        <div class="space-y-4">
          <div>
            <h5 class="font-semibold mb-2">🔍 1.1 Vérification de l''environnement :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Surface</strong> : La balance doit être posée sur une table parfaitement plane, horizontale, stable et rigide</li>
              <li>• <strong>Vibrations</strong> : Éloigner de toute source de vibrations (machines, passages fréquents, ventilateurs)</li>
              <li>• <strong>Courants d''air</strong> : Fermer les fenêtres et portes, éteindre la climatisation pendant la pesée</li>
              <li>• <strong>Lumière</strong> : Assurer un bon éclairage pour lire correctement les résultats</li>
              <li>• <strong>Température</strong> : La pièce doit être à température stable (éviter les variations)</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">🔍 1.2 Inspection visuelle de la balance :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• Vérifier que les deux plateaux sont vides, propres et secs</li>
              <li>• S''assurer qu''il n''y a pas de poussière ou de résidus sur les plateaux</li>
              <li>• Inspecter le fléau : il doit pouvoir osciller librement sans frottement</li>
              <li>• Vérifier que les couteaux (points d''appui) sont propres et intacts</li>
              <li>• S''assurer que l''aiguille indicatrice (si présente) est bien visible</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">🔍 1.3 Vérification de l''équilibre à vide (ZÉRO) :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• Les deux plateaux doivent être à la même hauteur exactement</li>
              <li>• Le fléau doit être parfaitement horizontal</li>
              <li>• L''aiguille doit pointer vers le zéro de l''échelle</li>
              <li>• Si ce n''est pas le cas, ajuster avec la vis d''équilibrage centrale</li>
              <li>• Tourner délicatement la vis jusqu''à obtenir l''équilibre parfait</li>
              <li>• Attendre que le fléau cesse complètement d''osciller (cela peut prendre 10-20 secondes)</li>
            </ul>
          </div>

          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded">
            <p class="text-sm">
              <strong>⚠️ ATTENTION :</strong> Ne JAMAIS commencer une pesée si la balance n''est pas parfaitement équilibrée à vide. Un déséquilibre initial entraînera des erreurs systématiques dans toutes vos mesures !
            </p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">📦</span> Étape 2 : Placement Correct de l''Objet
        </h4>
        <p class="text-sm mb-4 italic">Le placement de l''objet influence directement la précision de la mesure</p>
        
        <div class="space-y-4">
          <div>
            <h5 class="font-semibold mb-2">📍 2.1 Manipulation de l''objet :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Propret</strong> : L''objet doit être propre et sec (l''humidité ajoute de la masse)</li>
              <li>• <strong>Température</strong> : Attendre que l''objet soit à température ambiante</li>
              <li>• <strong>Éviter le contact direct</strong> : Pour les objets propres, utiliser une spatule ou une pince</li>
              <li>• <strong>Objets chauds</strong> : JAMAIS peser un objet chaud (cela crée des courants d''air)</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📍 2.2 Positionnement sur le plateau :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Centre du plateau</strong> : Placer l''objet exactement au centre du plateau de GAUCHE</li>
              <li>• <strong>Geste délicat</strong> : Poser délicatement pour éviter les chocs qui endommagent le mécanisme</li>
              <li>• <strong>Stabilité</strong> : S''assurer que l''objet est stable et ne risque pas de tomber</li>
              <li>• <strong>Observation</strong> : Le plateau gauche va descendre, le plateau droit va monter</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📍 2.3 Cas particuliers :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Poudres / granulés</strong> : Utiliser un papier de pesée ou une coupelle propre et sèche (noter sa masse !)</li>
              <li>• <strong>Liquides</strong> : Toujours utiliser un récipient fermé pour éviter l''évaporation</li>
              <li>• <strong>Objets irréguliers</strong> : Positionner pour maximiser la stabilité</li>
              <li>• <strong>Objets longs</strong> : Centrer le point d''équilibre sur le plateau</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📍 2.4 Attendre la stabilisation :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• Après avoir placé l''objet, le fléau va osciller</li>
              <li>• Attendre patiemment que les oscillations diminuent</li>
              <li>• Ne PAS toucher la balance pendant ce temps</li>
              <li>• La stabilisation complète peut prendre 20-40 secondes</li>
            </ul>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded">
            <p class="text-sm">
              <strong>💡 ASTUCE PROFESSIONNELLE :</strong> Pour des objets très légers (< 1g), on peut utiliser du papier aluminium propre comme support. Pour des mesures de haute précision, peser d''abord le support vide, noter sa masse, puis peser l''ensemble. La masse de l''objet = masse totale - masse du support.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">⚖️</span> Étape 3 : Ajout des Masses Étalonnées (Technique d''Approximations Successives)
        </h4>
        <p class="text-sm mb-4 italic">Cette étape demande patience, méthode et précision. C''est le cœur de la technique de pesée !</p>
        
        <div class="space-y-4">
          <div>
            <h5 class="font-semibold mb-2">🎯 3.1 Principe de la méthode par dichotomie :</h5>
            <p class="text-sm mb-2">On procède par approximations successives, des masses les plus grandes vers les plus petites :</p>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Phase 1</strong> : Encadrement grossier avec les grandes masses (500g, 200g, 100g)</li>
              <li>• <strong>Phase 2</strong> : Affinement avec les masses moyennes (50g, 20g, 10g)</li>
              <li>• <strong>Phase 3</strong> : Précision finale avec les petites masses (5g, 2g, 1g)</li>
              <li>• <strong>Phase 4</strong> : Ajustement ultime avec les milligrammes si nécessaire</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">🎯 3.2 Technique d''ajout des masses (DÉTAILLÉE) :</h5>
            <div class="space-y-3">
              <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
                <strong>Étape 3.2.1 - Estimation initiale :</strong>
                <ul class="text-sm mt-2 space-y-1 ml-4">
                  <li>• Observer la descente du plateau gauche pour estimer approximativement la masse</li>
                  <li>• Choisir une grande masse pour commencer (ex : 500g si l''objet semble lourd)</li>
                </ul>
              </div>

              <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
                <strong>Étape 3.2.2 - Premier essai :</strong>
                <ul class="text-sm mt-2 space-y-1 ml-4">
                  <li>• Prendre la masse choisie avec une pince (NE JAMAIS toucher avec les doigts !)</li>
                  <li>• La placer délicatement au centre du plateau de DROITE</li>
                  <li>• Observer le comportement du fléau :</li>
                  <li class="ml-4">→ Si le plateau droit descend : la masse ajoutée est TROP GRANDE</li>
                  <li class="ml-4">→ Si le plateau gauche reste en bas : la masse ajoutée est TROP PETITE</li>
                  <li class="ml-4">→ Si les plateaux s''équilibrent : PARFAIT (rare au premier essai !)</li>
                </ul>
              </div>

              <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
                <strong>Étape 3.2.3 - Ajustements successifs :</strong>
                <ul class="text-sm mt-2 space-y-1 ml-4">
                  <li>• <strong>Si trop grande</strong> : Retirer cette masse, essayer la masse immédiatement inférieure</li>
                  <li>• <strong>Si trop petite</strong> : Garder cette masse et ajouter la masse suivante dans la série</li>
                  <li>• <strong>Série de masses courante</strong> : 500g → 200g → 100g → 50g → 20g → 10g → 5g → 2g → 1g</li>
                  <li>• Continuer à ajouter/retirer des masses jusqu''à l''équilibre parfait</li>
                </ul>
              </div>

              <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
                <strong>Étape 3.2.4 - Vérification de l''équilibre :</strong>
                <ul class="text-sm mt-2 space-y-1 ml-4">
                  <li>• L''équilibre est atteint quand :</li>
                  <li class="ml-4">→ Les deux plateaux sont exactement à la même hauteur</li>
                  <li class="ml-4">→ Le fléau est parfaitement horizontal</li>
                  <li class="ml-4">→ L''aiguille pointe vers le zéro</li>
                  <li>• Test du souffle : Souffler légèrement sur le fléau</li>
                  <li class="ml-4">→ Si l''équilibre est parfait, il revient toujours à l''horizontale</li>
                  <li class="ml-4">→ S''il ne revient pas, affiner avec des masses plus petites</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h5 class="font-semibold mb-2">🎯 3.3 Exemple concret de pesée (pas à pas) :</h5>
            <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded space-y-2 text-sm">
              <p><strong>Objectif</strong> : Peser un échantillon de sel</p>
              <ol class="space-y-2 ml-4">
                <li><strong>1.</strong> Placer le sel (dans une coupelle) sur le plateau gauche → il descend</li>
                <li><strong>2.</strong> Essayer 500g sur plateau droit → plateau droit descend (trop lourd)</li>
                <li><strong>3.</strong> Retirer 500g, essayer 200g → plateau gauche encore en bas (trop léger)</li>
                <li><strong>4.</strong> Garder 200g, ajouter 100g → plateau gauche encore en bas</li>
                <li><strong>5.</strong> Garder 200g + 100g, ajouter 50g → plateau droit descend (trop lourd maintenant)</li>
                <li><strong>6.</strong> Retirer 50g, garder 200g + 100g, ajouter 20g → presque équilibré</li>
                <li><strong>7.</strong> Garder 200g + 100g + 20g, ajouter 5g → proche de l''équilibre</li>
                <li><strong>8.</strong> Garder tout, ajouter 2g → équilibre parfait !</li>
                <li><strong>Résultat</strong> : 200 + 100 + 20 + 5 + 2 = <strong>327 grammes</strong></li>
              </ol>
            </div>
          </div>

          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded">
            <p class="text-sm">
              <strong>💡 ASTUCE D''EXPERT :</strong> Pour vérifier la précision de votre mesure, vous pouvez : 1) Retirer la dernière petite masse ajoutée - le plateau gauche doit descendre. 2) Remettre cette masse - l''équilibre doit revenir. Si ce n''est pas le cas, votre équilibre n''était pas parfait !
            </p>
          </div>

          <div>
            <h5 class="font-semibold mb-2">🎯 3.4 Manipulation des masses étalonnées (IMPORTANT) :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>TOUJOURS</strong> utiliser une pince pour manipuler les masses</li>
              <li>• <strong>JAMAIS</strong> toucher les masses avec les doigts (la transpiration les corrode)</li>
              <li>• Prendre les masses par les bords ou par l''anneau de préhension</li>
              <li>• Les poser délicatement sans les faire tomber</li>
              <li>• Ne pas mélanger les masses de différentes boîtes (risque d''erreur)</li>
              <li>• Remettre chaque masse à sa place après usage</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-3 text-lg flex items-center gap-2">
          <span className="text-2xl">📝</span> Étape 4 : Lecture, Calcul et Enregistrement du Résultat
        </h4>
        <p class="text-sm mb-4 italic">La dernière étape consiste à déterminer et documenter la masse exacte avec précision</p>
        
        <div class="space-y-4">
          <div>
            <h5 class="font-semibold mb-2">📊 4.1 Addition des masses utilisées :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Méthode organisée</strong> : Noter toutes les masses du plateau droit sur une feuille</li>
              <li>• Commencer par les plus grandes et descendre vers les plus petites</li>
              <li>• Exemple de notation : 200g + 100g + 20g + 5g + 2g</li>
              <li>• Faire la somme soigneusement : 200 + 100 + 20 + 5 + 2 = 327g</li>
              <li>• <strong>Vérification obligatoire</strong> : Refaire le calcul une seconde fois pour éviter les erreurs</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📊 4.2 Expression du résultat :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• <strong>Toujours indiquer l''unité</strong> : 327 g (pas juste "327" !)</li>
              <li>• Choisir l''unité appropriée au contexte :</li>
              <li class="ml-4">→ Masses légères (< 1000g) : exprimer en grammes (g)</li>
              <li class="ml-4">→ Masses lourdes (> 1000g) : convertir en kilogrammes (kg)</li>
              <li>• Exemple : 1500g = 1,5 kg ou 1 kg 500 g</li>
              <li>• <strong>Précision</strong> : Indiquer uniquement les chiffres significatifs selon la balance</li>
              <li>• Si la plus petite masse utilisée est 1g, le résultat sera au gramme près</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📊 4.3 Enregistrement dans le cahier de laboratoire :</h5>
            <div class="bg-white/70 dark:bg-black/30 p-4 rounded">
              <p class="text-sm mb-2"><strong>Format professionnel recommandé :</strong></p>
              <div class="font-mono text-xs bg-purple-50 dark:bg-purple-950/50 p-3 rounded border">
                <div>Date : 23 octobre 2025</div>
                <div>Heure : 14:35</div>
                <div>Expérimentateur : [Nom]</div>
                <div>Objet pesé : Échantillon de sel de cuisine</div>
                <div>Balance utilisée : Balance Roberval n°7</div>
                <div>Masses utilisées : 200g + 100g + 20g + 5g + 2g</div>
                <div>Masse mesurée : 327 g</div>
                <div>Incertitude : ±1 g</div>
                <div>Observations : RAS, pesée effectuée en conditions normales</div>
              </div>
            </div>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📊 4.4 Évaluation de l''incertitude :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• L''incertitude correspond à la plus petite masse utilisable</li>
              <li>• Si plus petite masse = 1g, alors incertitude = ±1g</li>
              <li>• Si plus petite masse = 0,1g, alors incertitude = ±0,1g</li>
              <li>• Résultat complet : masse = 327 ± 1 g</li>
              <li>• Cela signifie : la vraie valeur est entre 326g et 328g</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-2">📊 4.5 Reproductibilité (pour mesures importantes) :</h5>
            <ul class="text-sm space-y-2 ml-4">
              <li>• Pour garantir la précision, répéter la mesure 2-3 fois</li>
              <li>• Retirer l''objet et les masses, recommencer à zéro</li>
              <li>• Si les 3 mesures sont identiques → excellente reproductibilité</li>
              <li>• Si légères différences → calculer la moyenne</li>
              <li>• Exemple : 327g, 328g, 327g → moyenne = 327,3g ≈ 327g</li>
            </ul>
          </div>

          <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded">
            <p class="text-sm">
              <strong>✅ EXEMPLE DE RÉSULTAT COMPLET :</strong><br/>
              "La masse de l''échantillon de sel de cuisine a été mesurée à l''aide d''une balance Roberval. Après trois pesées successives (327g, 328g, 327g), la masse moyenne obtenue est de <strong>327 ± 1 g</strong>. Cette valeur a été obtenue en utilisant les masses étalonnées suivantes : 200g, 100g, 20g, 5g et 2g."
            </p>
          </div>
        </div>
      </div>

      <div class="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h4 class="font-bold text-red-700 dark:text-red-300 mb-4 text-lg flex items-center gap-2">
          <span className="text-2xl">⚠️</span> Précautions et Règles de Sécurité ESSENTIELLES
        </h4>
        
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h5 class="font-semibold mb-3">🚫 À NE JAMAIS FAIRE :</h5>
            <ul class="text-sm space-y-2">
              <li>❌ Dépasser la capacité maximale de la balance (risque de casse !)</li>
              <li>❌ Toucher les masses étalonnées avec les doigts</li>
              <li>❌ Poser violemment les masses (choc = dommage au mécanisme)</li>
              <li>❌ Peser un objet chaud ou froid</li>
              <li>❌ Laisser des produits chimiques sur les plateaux</li>
              <li>❌ Déplacer la balance pendant la pesée</li>
              <li>❌ Forcer sur la vis d''équilibrage</li>
              <li>❌ Mélanger les masses de différentes boîtes</li>
            </ul>
          </div>

          <div>
            <h5 class="font-semibold mb-3">✅ TOUJOURS Faire :</h5>
            <ul class="text-sm space-y-2">
              <li>✓ Vérifier le zéro avant chaque pesée</li>
              <li>✓ Utiliser une pince pour les masses</li>
              <li>✓ Manipuler délicatement tous les éléments</li>
              <li>✓ Attendre la stabilisation complète</li>
              <li>✓ Nettoyer les plateaux après usage</li>
              <li>✓ Ranger les masses dans leur boîte</li>
              <li>✓ Noter immédiatement les résultats</li>
              <li>✓ Signaler tout dysfonctionnement</li>
            </ul>
          </div>
        </div>

        <div class="mt-4 p-4 bg-red-100 dark:bg-red-900/30 rounded">
          <h5 class="font-semibold mb-2">🔧 Entretien et maintenance :</h5>
          <ul class="text-sm space-y-1">
            <li>• Nettoyer régulièrement avec un chiffon doux et sec</li>
            <li>• Vérifier l''équilibrage à vide périodiquement</li>
            <li>• Protéger de la poussière avec une housse quand non utilisée</li>
            <li>• Faire vérifier/calibrer par un professionnel annuellement</li>
            <li>• Conserver les masses étalonnées dans leur boîte d''origine</li>
            <li>• Ne jamais exposer à l''humidité excessive</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🎯 Applications Pratiques et Professionnelles</h2>
    <p class="mb-6 text-muted-foreground leading-relaxed">
      La balance est un instrument fondamental utilisé quotidiennement dans de nombreux domaines professionnels et personnels. Sa maîtrise est essentielle dans diverses carrières scientifiques, médicales et techniques.
    </p>
    
    <div class="grid md:grid-cols-3 gap-6 mb-6">
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
          <span className="text-xl">🧪</span> Sciences et Recherche
        </h4>
        <ul class="text-sm space-y-2">
          <li><strong>• Chimie :</strong> Dosages précis de réactifs, préparation de solutions</li>
          <li><strong>• Physique :</strong> Mesure de densité, expériences sur la matière</li>
          <li><strong>• Biologie :</strong> Pesée d''échantillons, préparation de milieux de culture</li>
          <li><strong>• Géologie :</strong> Classification de minéraux, analyse de roches</li>
          <li><strong>• Recherche :</strong> Expérimentations nécessitant précision extrême</li>
        </ul>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
          <span className="text-xl">🍰</span> Alimentation et Cuisine
        </h4>
        <ul class="text-sm space-y-2">
          <li><strong>• Pâtisserie :</strong> Recettes nécessitant des proportions exactes</li>
          <li><strong>• Cuisine pro :</strong> Portions standardisées en restaurant</li>
          <li><strong>• Boulangerie :</strong> Dosage précis de levure et ingrédients</li>
          <li><strong>• Nutrition :</strong> Calcul de portions et régimes alimentaires</li>
          <li><strong>• Chocolaterie :</strong> Tempérage et dosages fins</li>
        </ul>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
          <span className="text-xl">💊</span> Santé et Pharmacie
        </h4>
        <ul class="text-sm space-y-2">
          <li><strong>• Pharmacie :</strong> Préparations magistrales sur ordonnance</li>
          <li><strong>• Médecine :</strong> Dosage de médicaments en milieu hospitalier</li>
          <li><strong>• Herboristerie :</strong> Mélanges de plantes médicinales</li>
          <li><strong>• Laboratoires :</strong> Analyses médicales et biologiques</li>
          <li><strong>• Contrôle qualité :</strong> Vérification des dosages</li>
        </ul>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-lg border-2 border-amber-200 dark:border-amber-800">
        <h4 class="font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
          <span className="text-xl">💎</span> Artisanat et Commerce
        </h4>
        <ul class="text-sm space-y-2">
          <li>• <strong>Joaillerie :</strong> Pesée de pierres précieuses et métaux nobles</li>
          <li>• <strong>Orfèvrerie :</strong> Dosage de l''or et de l''argent</li>
          <li>• <strong>Commerce :</strong> Vente au poids (épicerie, marché)</li>
          <li>• <strong>Industrie :</strong> Contrôle qualité des produits</li>
          <li>• <strong>Cosmétique :</strong> Formulation de produits de beauté</li>
        </ul>
      </div>

      <div class="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-5 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
        <h4 class="font-bold text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
          <span className="text-xl">📚</span> Éducation
        </h4>
        <ul class="text-sm space-y-2">
          <li>• <strong>Enseignement :</strong> Démonstrations et TP en classe</li>
          <li>• <strong>Formation :</strong> Apprentissage des techniques de pesée</li>
          <li>• <strong>Projets :</strong> Expériences scientifiques d''élèves</li>
          <li>• <strong>Compétitions :</strong> Olympiades de sciences</li>
          <li>• <strong>Clubs :</strong> Activités scientifiques parascolaires</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🎓 Exercices Pratiques et Situations Réelles</h2>
    
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-l-4 border-teal-500">
        <h4 class="font-bold text-teal-700 dark:text-teal-300 mb-2">Exercice 1 : Pesée d''un caillou</h4>
        <p class="text-sm mb-2"><strong>Contexte :</strong> Tu dois peser un caillou ramassé lors d''une sortie géologique.</p>
        <p class="text-sm mb-2"><strong>Masses utilisées :</strong> 100g + 50g + 10g + 5g</p>
        <p class="text-sm"><strong>Question :</strong> Quelle est la masse du caillou ?</p>
        <details class="mt-2">
          <summary class="cursor-pointer text-sm font-semibold">👉 Voir la solution</summary>
          <div class="mt-2 p-3 bg-teal-100 dark:bg-teal-900/30 rounded text-sm">
            <p><strong>Réponse :</strong> 100 + 50 + 10 + 5 = 165 grammes</p>
            <p class="mt-1">Le caillou a une masse de <strong>165 g</strong> ou <strong>0,165 kg</strong></p>
          </div>
        </details>
      </div>

      <div class="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-5 rounded-lg border-l-4 border-violet-500">
        <h4 class="font-bold text-violet-700 dark:text-violet-300 mb-2">Exercice 2 : Déterminer une masse manquante</h4>
        <p class="text-sm mb-2"><strong>Situation :</strong> Sur le plateau droit, tu vois : 200g + 20g + 5g + 1g. La balance est équilibrée.</p>
        <p class="text-sm mb-2">Mais tu remarques qu''il manque une masse de la boîte : la masse de 50g.</p>
        <p class="text-sm"><strong>Question :</strong> Quelle est la masse de l''objet sur le plateau gauche ?</p>
        <details class="mt-2">
          <summary class="cursor-pointer text-sm font-semibold">👉 Voir la solution</summary>
          <div class="mt-2 p-3 bg-violet-100 dark:bg-violet-900/30 rounded text-sm">
            <p><strong>Réponse :</strong> 200 + 20 + 5 + 1 = 226 grammes</p>
            <p class="mt-1">La masse de l''objet est de <strong>226 g</strong>. La masse de 50g manquante ne change rien au calcul puisqu''elle n''est pas sur le plateau !</p>
          </div>
        </details>
      </div>

      <div class="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-5 rounded-lg border-l-4 border-rose-500">
        <h4 class="font-bold text-rose-700 dark:text-rose-300 mb-2">Exercice 3 : Conversion d''unités</h4>
        <p class="text-sm mb-2"><strong>Situation :</strong> Tu as mesuré la masse d''un échantillon : 1523 grammes.</p>
        <p class="text-sm"><strong>Questions :</strong></p>
        <ul class="text-sm ml-4 mb-2">
          <li>a) Convertis cette masse en kilogrammes</li>
          <li>b) Convertis-la en milligrammes</li>
        </ul>
        <details class="mt-2">
          <summary class="cursor-pointer text-sm font-semibold">👉 Voir les solutions</summary>
          <div class="mt-2 p-3 bg-rose-100 dark:bg-rose-900/30 rounded text-sm space-y-2">
            <p><strong>a) En kilogrammes :</strong> 1523 g = 1523 ÷ 1000 = <strong>1,523 kg</strong></p>
            <p><strong>b) En milligrammes :</strong> 1523 g = 1523 × 1000 = <strong>1 523 000 mg</strong></p>
          </div>
        </details>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">✅ Synthèse : Points Clés à Retenir</h2>
    <div class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-800">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-semibold mb-3">📌 Concepts fondamentaux :</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>La <strong>masse</strong> est la quantité de matière, elle reste constante partout</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Le <strong>poids</strong> est la force de gravité, il varie selon le lieu</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Unités principales : <strong>tonne (t), kilogramme (kg), gramme (g), milligramme (mg)</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Une balance à fléaux <strong>compare</strong> l''objet avec des masses étalonnées</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-3">📌 Technique de pesée :</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Toujours vérifier le <strong>zéro</strong> avant de commencer</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Placer l''objet au <strong>centre du plateau gauche</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Ajouter les masses du <strong>plus grand au plus petit</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>L''équilibre est atteint quand les <strong>deux plateaux sont au même niveau</strong></span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-amber-600 font-bold text-lg">✓</span>
              <span>Toujours <strong>noter le résultat avec l''unité</strong> (g ou kg)</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-6 p-4 bg-amber-100 dark:bg-amber-900/30 rounded">
        <h4 class="font-semibold mb-2">🎯 Pour réussir une pesée parfaite :</h4>
        <p class="text-sm">
          PRÉPARATION (surface stable + zéro vérifié) → PLACEMENT délicat de l''objet → AJOUT progressif des masses (grandes puis petites) → ÉQUILIBRAGE parfait → CALCUL de la somme → NOTATION du résultat avec unité → RANGEMENT du matériel
        </p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Pour Aller Plus Loin</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">📖 Sujets connexes à explorer :</h4>
        <ul class="text-sm space-y-1">
          <li>• La densité et la masse volumique</li>
          <li>• Le principe d''Archimède et la poussée</li>
          <li>• Les leviers et moments de force</li>
          <li>• L''histoire des balances dans les civilisations</li>
          <li>• Les balances modernes (capteurs piézoélectriques)</li>
        </ul>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">🎓 Projets scientifiques possibles :</h4>
        <ul class="text-sm space-y-1">
          <li>• Construire une balance romaine artisanale</li>
          <li>• Étudier la précision de différentes balances</li>
          <li>• Comparer masse et poids sur différentes planètes</li>
          <li>• Créer un guide d''utilisation illustré</li>
          <li>• Mesurer la densité d''objets du quotidien</li>
        </ul>
      </div>
    </div>
  </section>
</div>',
updated_at = now()
WHERE slug = 'utilisation-balance';