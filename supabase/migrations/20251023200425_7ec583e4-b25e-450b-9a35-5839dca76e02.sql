-- Update the "Utilisation de la balance" lesson with more detailed content
UPDATE lessons 
SET contenu = '<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚖️ Qu''est-ce que la Masse ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        La <strong>masse</strong> est une propriété fondamentale de la matière qui représente la quantité de matière contenue dans un objet. Contrairement au poids qui varie selon la gravité, la masse reste constante peu importe où se trouve l''objet. Elle se mesure avec une balance et s''exprime principalement en kilogrammes (kg), grammes (g) ou milligrammes (mg).
      </p>
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg mb-4">
        <h4 class="font-bold mb-3">📊 Unités de masse :</h4>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span>1 kilogramme (kg) = 1000 grammes (g)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span>1 gramme (g) = 1000 milligrammes (mg)</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-blue-600 dark:text-blue-400 font-bold">•</span>
            <span>1 tonne (t) = 1000 kilogrammes (kg)</span>
          </li>
        </ul>
      </div>
      <div class="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg">
        <h4 class="font-bold mb-2 flex items-center gap-2">
          <span>💡</span> Distinction importante : Masse vs Poids
        </h4>
        <p class="text-sm mb-2">
          Beaucoup confondent masse et poids, mais ce sont deux concepts différents :
        </p>
        <ul class="space-y-2 text-sm">
          <li><strong>Masse :</strong> Quantité de matière, constante partout (se mesure en kg)</li>
          <li><strong>Poids :</strong> Force exercée par la gravité, varie selon le lieu (se mesure en Newton)</li>
          <li>Exemple : Un astronaute a la même masse sur Terre et sur la Lune, mais son poids est différent !</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Types de Balances</h2>
    <p class="mb-4 text-muted-foreground">Il existe plusieurs types de balances, chacune adaptée à des usages spécifiques. Comprendre leurs différences est essentiel pour choisir le bon instrument de mesure.</p>
    
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">Balance à Fléaux ⚖️</h3>
        <p class="text-sm mb-3">Type classique utilisé principalement en laboratoire scientifique</p>
        <ul class="space-y-2 text-sm mb-4">
          <li>✓ Deux plateaux suspendus à un fléau horizontal</li>
          <li>✓ Fonctionne selon le principe de l''équilibre</li>
          <li>✓ Compare l''objet avec des masses étalonnées</li>
          <li>✓ Très précise pour les mesures scientifiques</li>
          <li>✓ Ne nécessite pas d''électricité</li>
        </ul>
        <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded text-xs">
          <strong>Usage typique :</strong> Laboratoires de chimie, pesées précises en pharmacie
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">Balance Électronique 📱</h3>
        <p class="text-sm mb-3">Type moderne avec affichage numérique</p>
        <ul class="space-y-2 text-sm mb-4">
          <li>✓ Un seul plateau de pesée</li>
          <li>✓ Affichage digital précis</li>
          <li>✓ Lecture directe et instantanée de la masse</li>
          <li>✓ Rapide et facile à utiliser</li>
          <li>✓ Fonction tare pour peser des contenants</li>
        </ul>
        <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded text-xs">
          <strong>Usage typique :</strong> Cuisine, commerce, pesées rapides quotidiennes
        </div>
      </div>
    </div>

    <div class="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-indigo-200 dark:border-indigo-800">
      <h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">Balance Romaine 🎣</h3>
      <p class="text-sm mb-3">Balance traditionnelle avec un bras gradué et un contrepoids mobile</p>
      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-semibold mb-2">Caractéristiques :</h4>
          <ul class="space-y-1">
            <li>✓ Un seul bras gradué</li>
            <li>✓ Contrepoids déplaçable</li>
            <li>✓ Principe du levier</li>
            <li>✓ Robuste et durable</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold mb-2">Utilisations :</h4>
          <ul class="space-y-1">
            <li>• Marchés traditionnels</li>
            <li>• Agriculture</li>
            <li>• Pêche</li>
            <li>• Usage domestique</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📖 Comment Utiliser une Balance à Fléaux ?</h2>
    <p class="mb-6 text-muted-foreground">L''utilisation correcte d''une balance à fléaux nécessite de la précision et de la méthode. Voici un guide détaillé étape par étape :</p>
    
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-5 rounded-lg border-l-4 border-orange-500">
        <h4 class="font-bold text-orange-700 dark:text-orange-300 mb-2">Étape 1 : Préparation ⚙️</h4>
        <p class="text-sm mb-3">La préparation est cruciale pour obtenir des mesures précises :</p>
        <ul class="text-sm space-y-2 ml-4">
          <li>• Vérifie que la balance est posée sur une surface plane, horizontale et stable</li>
          <li>• Assure-toi que les deux plateaux sont vides et propres</li>
          <li>• Vérifie que le fléau est à l''équilibre (les deux plateaux à la même hauteur)</li>
          <li>• Si ce n''est pas le cas, ajuste la vis d''équilibrage située au centre du fléau</li>
          <li>• Attends que le fléau cesse d''osciller avant de commencer</li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">Étape 2 : Placement de l''Objet 📦</h4>
        <p class="text-sm mb-3">Le placement correct de l''objet influence la précision :</p>
        <ul class="text-sm space-y-2 ml-4">
          <li>• Place délicatement l''objet à peser au centre du plateau de gauche</li>
          <li>• Évite les chocs qui pourraient endommager le mécanisme</li>
          <li>• Pour les objets en poudre ou liquides, utilise un récipient propre et sec</li>
          <li>• Note que le plateau va descendre du côté où tu as placé l''objet</li>
          <li>• Attends que les oscillations se stabilisent avant de continuer</li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">Étape 3 : Ajout des Masses Étalonnées ⚖️</h4>
        <p class="text-sm mb-3">C''est l''étape qui demande le plus de patience et de précision :</p>
        <ul class="text-sm space-y-2 ml-4">
          <li>• Commence par ajouter des masses plus grandes (100g, 200g, 500g)</li>
          <li>• Place les masses étalonnées sur le plateau de droite avec précaution</li>
          <li>• Continue à ajouter des masses jusqu''à ce que le plateau de droite descende</li>
          <li>• Si le plateau descend trop, retire la dernière masse et utilise des masses plus petites</li>
          <li>• Affine progressivement avec des masses de plus en plus petites (50g, 20g, 10g, etc.)</li>
          <li>• L''équilibre est atteint quand les deux plateaux sont exactement au même niveau</li>
          <li>• Le fléau doit être horizontal et immobile</li>
        </ul>
        <div class="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded text-xs">
          <strong>💡 Astuce :</strong> Pour vérifier l''équilibre, souffle légèrement sur le fléau. S''il revient toujours à l''horizontale, l''équilibre est parfait !
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">Étape 4 : Lecture et Enregistrement 📝</h4>
        <p class="text-sm mb-3">La dernière étape consiste à déterminer la masse exacte :</p>
        <ul class="text-sm space-y-2 ml-4">
          <li>• Additionne toutes les masses étalonnées utilisées sur le plateau de droite</li>
          <li>• Note chaque masse individuellement pour éviter les erreurs</li>
          <li>• Vérifie ton calcul en additionnant une seconde fois</li>
          <li>• Note le résultat avec l''unité appropriée (g ou kg)</li>
          <li>• Pour plus de précision, répète la mesure 2-3 fois et fais la moyenne</li>
        </ul>
        <div class="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
          <strong>Exemple :</strong> Si tu as utilisé 200g + 50g + 20g + 3g, la masse de l''objet est 273g
        </div>
      </div>
    </div>

    <div class="mt-6 bg-red-50 dark:bg-red-950/30 p-5 rounded-lg border-2 border-red-200 dark:border-red-800">
      <h4 class="font-bold text-red-700 dark:text-red-300 mb-3">⚠️ Précautions Importantes</h4>
      <ul class="text-sm space-y-2">
        <li>• Ne jamais dépasser la capacité maximale de la balance (souvent 2kg ou 5kg)</li>
        <li>• Manipuler les masses étalonnées avec une pince pour éviter de les salir</li>
        <li>• Ne pas poser la balance près d''une source de chaleur ou de vibrations</li>
        <li>• Ranger les masses dans leur boîte après usage</li>
        <li>• Nettoyer les plateaux après chaque utilisation</li>
        <li>• Vérifier régulièrement la précision avec des masses connues</li>
      </ul>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🎯 Applications Pratiques</h2>
    <p class="mb-4 text-muted-foreground">La balance est un outil indispensable dans de nombreux domaines :</p>
    
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">🧪 Sciences</h4>
        <ul class="text-sm space-y-1">
          <li>• Expériences chimiques</li>
          <li>• Dosages précis</li>
          <li>• Préparation de solutions</li>
          <li>• Mesures de densité</li>
        </ul>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">🍰 Cuisine</h4>
        <ul class="text-sm space-y-1">
          <li>• Recettes précises</li>
          <li>• Pâtisserie</li>
          <li>• Portions alimentaires</li>
          <li>• Régimes diététiques</li>
        </ul>
      </div>
      
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">💊 Pharmacie</h4>
        <ul class="text-sm space-y-1">
          <li>• Dosage médicaments</li>
          <li>• Préparations magistrales</li>
          <li>• Contrôle qualité</li>
          <li>• Pesées précises</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">✅ Points Clés à Retenir</h2>
    <div class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-800">
      <ul class="space-y-3">
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>La masse est la quantité de matière, elle est constante partout</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>Les unités principales sont : kg, g, mg, t</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>Une balance à fléaux compare l''objet avec des masses étalonnées</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>L''équilibre est atteint quand les deux plateaux sont au même niveau</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>La précision nécessite une surface stable et des manipulations délicates</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-amber-600 font-bold text-xl">✓</span>
          <span>Toujours noter les résultats avec l''unité appropriée</span>
        </li>
      </ul>
    </div>
  </section>
</div>',
updated_at = now()
WHERE slug = 'utilisation-balance';