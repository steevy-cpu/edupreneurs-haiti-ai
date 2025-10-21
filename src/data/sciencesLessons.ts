export interface StaticLessonContent {
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
  musicUrl?: string;
}

// 7th Grade Sciences Lessons (AF7) - Based on MENFP Program
export const sciencesLessons7AF: Record<string, StaticLessonContent> = {
  
  // PHYSIQUE - Propriété physique de la matière
  "utilisation-balance": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Utiliser la balance pour effectuer des pesées entre 0 et 5 kg
• Comprendre le principe de la balance basé sur la comparaison avec une masse étalonnée
• Différencier les notions de masse et de volume`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    La balance est un instrument fondamental en sciences pour mesurer la masse des objets.
    Comprendre comment l'utiliser correctement est essentiel pour toutes les expériences scientifiques !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">⚖️ Le saviez-vous ?</p>
    <p>La balance existe depuis l'Antiquité ! Les Égyptiens l'utilisaient déjà il y a plus de 5000 ans
    pour peser l'or et les marchandises.</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Utiliser la balance pour effectuer des pesées entre 0 et 5 kg</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Comprendre le principe de la balance basé sur la comparaison avec une masse étalonnée</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Différencier les notions de masse et de volume</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚖️ Qu'est-ce que la Masse ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        La <strong>masse</strong> est la quantité de matière contenue dans un objet. Elle se mesure avec une balance
        et s'exprime en kilogrammes (kg), grammes (g) ou milligrammes (mg).
      </p>
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
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
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Types de Balances</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">Balance à Fléaux ⚖️</h3>
        <p class="text-sm mb-3">Type classique utilisé en laboratoire</p>
        <ul class="space-y-2 text-sm">
          <li>✓ Deux plateaux suspendus</li>
          <li>✓ Principe de l'équilibre</li>
          <li>✓ Compare l'objet avec des masses étalonnées</li>
          <li>✓ Très précise</li>
        </ul>
      </div>
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">Balance Électronique 📱</h3>
        <p class="text-sm mb-3">Type moderne avec affichage numérique</p>
        <ul class="space-y-2 text-sm">
          <li>✓ Un seul plateau</li>
          <li>✓ Affichage digital</li>
          <li>✓ Lecture directe de la masse</li>
          <li>✓ Rapide et facile à utiliser</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📖 Comment Utiliser une Balance à Fléaux ?</h2>
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-5 rounded-lg border-l-4 border-orange-500">
        <h4 class="font-bold text-orange-700 dark:text-orange-300 mb-2">Étape 1 : Préparation</h4>
        <p class="text-sm">Vérifie que la balance est sur une surface plane et stable. Les deux plateaux doivent être à la même hauteur (équilibre).</p>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">Étape 2 : Placement</h4>
        <p class="text-sm">Place l'objet à peser sur le plateau de gauche avec précaution.</p>
      </div>
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">Étape 3 : Ajout des Masses</h4>
        <p class="text-sm">Ajoute des masses étalonnées sur le plateau de droite jusqu'à ce que les deux plateaux soient au même niveau.</p>
      </div>
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">Étape 4 : Lecture</h4>
        <p class="text-sm">Additionne les masses utilisées pour obtenir la masse de l'objet.</p>
      </div>
    </div>
  </section>

  <section class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
    <h2 class="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">⚠️ Masse vs Volume</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">Masse 📏</h4>
        <ul class="space-y-1 text-sm">
          <li>• Quantité de matière</li>
          <li>• Se mesure avec une balance</li>
          <li>• Unités : kg, g, mg</li>
          <li>• Ne change pas selon le lieu</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-2">Volume 📦</h4>
        <ul class="space-y-1 text-sm">
          <li>• Espace occupé</li>
          <li>• Se mesure avec éprouvette/règle</li>
          <li>• Unités : L, mL, cm³, m³</li>
          <li>• Dépend de la forme</li>
        </ul>
      </div>
    </div>
    <div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded">
      <p class="font-semibold text-sm">💡 Exemple :</p>
      <p class="text-sm">1 kg de plumes et 1 kg de fer ont la même masse, mais les plumes occupent beaucoup plus de volume !</p>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Conversion d'Unités</h3>
    <p class="mb-4">Convertis les masses suivantes :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>2,5 kg = __________ g</li>
      <li>350 g = __________ mg</li>
      <li>4500 g = __________ kg</li>
      <li>0,75 kg = __________ g</li>
      <li>1200 mg = __________ g</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Lecture de Balance</h3>
    <p class="mb-4">Une balance à fléaux est en équilibre. Sur le plateau de droite, on trouve :</p>
    <ul class="list-disc list-inside mb-4 space-y-1">
      <li>Une masse de 2 kg</li>
      <li>Une masse de 500 g</li>
      <li>Une masse de 200 g</li>
      <li>Une masse de 50 g</li>
    </ul>
    <p class="font-semibold">Quelle est la masse de l'objet sur le plateau de gauche ?</p>
    <div class="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded">
      <p class="text-sm">Réponse : __________</p>
    </div>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Masse ou Volume ?</h3>
    <p class="mb-4">Indique si chaque affirmation concerne la masse (M) ou le volume (V) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Se mesure avec une balance <span class="ml-4">_____</span></li>
      <li>S'exprime en litres <span class="ml-4">_____</span></li>
      <li>Quantité de matière <span class="ml-4">_____</span></li>
      <li>Espace occupé par un objet <span class="ml-4">_____</span></li>
      <li>S'exprime en kilogrammes <span class="ml-4">_____</span></li>
      <li>Peut être mesuré avec une éprouvette graduée <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Problème Pratique</h3>
    <p class="mb-4">Tu dois mesurer la masse d'un livre qui pèse environ 800 g. Tu disposes des masses étalonnées suivantes :</p>
    <p class="mb-3 ml-4">500 g, 200 g, 100 g, 50 g, 20 g, 10 g, 5 g, 2 g, 1 g</p>
    <p class="font-semibold mb-2">Questions :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Quelles masses vas-tu utiliser pour équilibrer la balance ?</li>
      <li>Comment sauras-tu que la balance est en équilibre ?</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/balance-lesson-music.mp3"
  },

  "dimensions-solides": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Mesurer les dimensions linéaires d'un solide de forme géométrique
• Calculer la surface et le volume d'un solide
• Mesurer un volume de forme non géométrique par la méthode de l'immersion
• Vérifier l'identité des résultats de deux méthodes différentes de mesure d'un volume`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Mesurer et calculer les dimensions des solides est une compétence fondamentale en sciences et en mathématiques.
    Ces techniques sont utilisées dans de nombreux domaines : construction, design, médecine, et bien plus !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">📐 Le saviez-vous ?</p>
    <p>Les pyramides d'Égypte ont été construites avec une précision extraordinaire grâce à des techniques
    de mesure très avancées pour l'époque !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Mesurer les dimensions linéaires d'un solide de forme géométrique</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Calculer la surface et le volume d'un solide</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Mesurer un volume de forme non géométrique par la méthode de l'immersion</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Vérifier l'identité des résultats de deux méthodes différentes</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📏 Les Dimensions Linéaires</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        Les <strong>dimensions linéaires</strong> sont les mesures de longueur, largeur et hauteur d'un objet.
        On les mesure avec une règle, un mètre ruban ou un pied à coulisse.
      </p>
      <div class="grid md:grid-cols-3 gap-4 mt-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">Longueur (L)</h4>
          <p class="text-sm">La plus grande dimension horizontale</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">Largeur (l)</h4>
          <p class="text-sm">La dimension horizontale perpendiculaire à la longueur</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">Hauteur (h)</h4>
          <p class="text-sm">La dimension verticale</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📦 Calcul de Surface et Volume</h2>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Parallélépipède Rectangle (Boîte) 📦</h3>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-1">Surface totale :</p>
            <p class="text-lg font-mono bg-purple-100 dark:bg-purple-900/50 p-2 rounded">S = 2(L×l + L×h + l×h)</p>
          </div>
          <div>
            <p class="font-semibold mb-1">Volume :</p>
            <p class="text-lg font-mono bg-purple-100 dark:bg-purple-900/50 p-2 rounded">V = L × l × h</p>
          </div>
          <p class="text-sm text-muted-foreground">Unités : Surface en cm² ou m², Volume en cm³ ou m³</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-4">Cube 🎲</h3>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-1">Surface totale :</p>
            <p class="text-lg font-mono bg-green-100 dark:bg-green-900/50 p-2 rounded">S = 6 × côté²</p>
          </div>
          <div>
            <p class="font-semibold mb-1">Volume :</p>
            <p class="text-lg font-mono bg-green-100 dark:bg-green-900/50 p-2 rounded">V = côté³</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">Cylindre 🥫</h3>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-1">Surface latérale :</p>
            <p class="text-lg font-mono bg-orange-100 dark:bg-orange-900/50 p-2 rounded">S = 2πrh</p>
          </div>
          <div>
            <p class="font-semibold mb-1">Volume :</p>
            <p class="text-lg font-mono bg-orange-100 dark:bg-orange-900/50 p-2 rounded">V = πr²h</p>
            <p class="text-sm mt-1">où r = rayon de la base, h = hauteur, π ≈ 3,14</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
    <h2 class="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-4">💧 Méthode de l'Immersion</h2>
    <p class="mb-4">Pour mesurer le volume d'un objet de forme irrégulière (pierre, fruit, etc.), on utilise la <strong>méthode de l'immersion</strong> :</p>
    
    <div class="space-y-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border-l-4 border-cyan-500">
        <h4 class="font-bold mb-2">Étape 1 : Mesure initiale</h4>
        <p class="text-sm">Remplis une éprouvette graduée d'eau. Note le volume V₁</p>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold mb-2">Étape 2 : Immersion</h4>
        <p class="text-sm">Plonge doucement l'objet dans l'eau. L'eau monte.</p>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold mb-2">Étape 3 : Mesure finale</h4>
        <p class="text-sm">Note le nouveau volume V₂</p>
      </div>
      <div class="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Étape 4 : Calcul</h4>
        <p class="text-lg font-mono">Volume de l'objet = V₂ - V₁</p>
      </div>
    </div>
    
    <div class="mt-4 p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded">
      <p class="font-semibold text-sm mb-1">💡 Principe :</p>
      <p class="text-sm">L'objet déplace un volume d'eau égal à son propre volume. Cette découverte est attribuée à Archimède !</p>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">✅ Vérification des Résultats</h2>
    <div class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
      <p class="mb-4">Pour vérifier tes mesures, tu peux :</p>
      <ol class="space-y-3 list-decimal list-inside">
        <li><strong>Comparer deux méthodes :</strong> Si tu mesures le volume d'un cube, calcule-le avec la formule ET mesure-le par immersion. Les résultats doivent être similaires.</li>
        <li><strong>Répéter la mesure :</strong> Fais plusieurs mesures et calcule la moyenne.</li>
        <li><strong>Vérifier la précision :</strong> Utilise des instruments bien calibrés.</li>
        <li><strong>Respecter les unités :</strong> Assure-toi d'utiliser les mêmes unités partout.</li>
      </ol>
      <div class="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded">
        <p class="font-semibold text-sm">⚠️ Tolérance :</p>
        <p class="text-sm">Une petite différence (< 5%) entre les deux méthodes est normale à cause des erreurs de mesure.</p>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Calcul de Volume</h3>
    <p class="mb-4">Une boîte a les dimensions suivantes : L = 15 cm, l = 10 cm, h = 8 cm</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Calcule le volume de la boîte</li>
      <li>Si cette boîte est plongée dans l'eau, de combien d'eau sera-t-elle déplacée ?</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Méthode de l'Immersion</h3>
    <p class="mb-4">On verse 200 mL d'eau dans une éprouvette graduée. On y plonge une pierre. Le niveau monte à 275 mL.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Quel est le volume de la pierre ?</li>
      <li>Si on retire la pierre, quel sera le niveau d'eau ?</li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Cube</h3>
    <p class="mb-4">Un cube a un côté de 5 cm.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Calcule son volume avec la formule</li>
      <li>Si on le plonge dans 300 mL d'eau, quel sera le nouveau niveau ?</li>
      <li>Est-ce que les deux méthodes donnent le même résultat ?</li>
    </ol>
    <p class="text-sm text-muted-foreground mt-3">Rappel : 1 cm³ = 1 mL</p>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Application</h3>
    <p class="mb-4">Tu veux mesurer le volume d'une petite figurine en plastique de forme irrégulière.</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Quelle méthode vas-tu utiliser et pourquoi ?</li>
      <li>Décris les étapes de ta mesure</li>
      <li>Quelles précautions dois-tu prendre ?</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/dimensions-lesson-music.mp3"
  },

  "masse-volumique": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Définir et calculer la masse volumique d'un solide comme le rapport entre la masse et le volume
• Déterminer expérimentalement la masse volumique d'un liquide
• Différencier les liquides selon leur masse volumique`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Pourquoi un glaçon flotte-t-il sur l'eau ? Pourquoi le fer coule-t-il ? La réponse est la <strong>masse volumique</strong> !
    C'est une propriété fondamentale qui caractérise chaque matériau.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔬 Le saviez-vous ?</p>
    <p>L'or a une masse volumique très élevée (19,3 g/cm³). C'est pourquoi un petit cube d'or de 1 cm de côté
    pèse presque 20 grammes !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Définir et calculer la masse volumique d'un solide</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Déterminer expérimentalement la masse volumique d'un liquide</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Différencier les liquides selon leur masse volumique</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📖 Définition de la Masse Volumique</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        La <strong>masse volumique</strong> (symbole : ρ "rho") est la masse contenue dans une unité de volume.
        Elle indique à quel point un matériau est "compact" ou "dense".
      </p>
      <div class="bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 p-4 rounded-lg mb-4">
        <p class="font-bold text-lg mb-2">Formule :</p>
        <p class="text-2xl font-mono text-center p-3 bg-white/70 dark:bg-black/30 rounded">ρ = m / V</p>
        <p class="text-sm mt-2">où m = masse (g ou kg) et V = volume (cm³ ou m³)</p>
      </div>
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Unités courantes :</h4>
        <ul class="space-y-1">
          <li>• g/cm³ (grammes par centimètre cube)</li>
          <li>• kg/m³ (kilogrammes par mètre cube)</li>
          <li>• g/L (grammes par litre) pour les liquides</li>
        </ul>
        <p class="text-sm mt-2 text-muted-foreground">Conversion : 1 g/cm³ = 1000 kg/m³</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🧪 Calcul de la Masse Volumique d'un Solide</h2>
    
    <div class="space-y-4">
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-purple-700 dark:text-purple-300 mb-2">Étape 1 : Mesurer la masse</h4>
        <p class="text-sm">Utilise une balance pour mesurer la masse (m) du solide en grammes</p>
      </div>
      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">Étape 2 : Mesurer le volume</h4>
        <p class="text-sm">Mesure le volume (V) soit par calcul (forme géométrique) soit par immersion en cm³</p>
      </div>
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">Étape 3 : Calculer</h4>
        <p class="text-sm">Applique la formule : ρ = m / V</p>
      </div>
    </div>

    <div class="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
      <h4 class="font-bold text-yellow-800 dark:text-yellow-200 mb-3">💡 Exemple :</h4>
      <p class="mb-2">Un cube de fer a :</p>
      <ul class="list-disc list-inside space-y-1 mb-3">
        <li>Masse = 78,7 g</li>
        <li>Côté = 2 cm, donc Volume = 2³ = 8 cm³</li>
      </ul>
      <p class="font-mono bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded">ρ = 78,7 g / 8 cm³ = 9,84 g/cm³</p>
      <p class="text-sm mt-2">Le fer a donc une masse volumique d'environ 9,84 g/cm³</p>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💧 Masse Volumique des Liquides</h2>
    <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
      <h4 class="font-bold mb-4">Méthode expérimentale :</h4>
      <ol class="space-y-3 list-decimal list-inside mb-4">
        <li>Pèse un bécher vide (m₁)</li>
        <li>Verse un volume précis de liquide, par exemple 100 mL (V)</li>
        <li>Pèse le bécher + liquide (m₂)</li>
        <li>Calcule la masse du liquide : m = m₂ - m₁</li>
        <li>Calcule la masse volumique : ρ = m / V</li>
      </ol>
      
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
        <h4 class="font-bold mb-3">Masse volumique de liquides courants :</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-cyan-100 dark:bg-cyan-900/50">
              <tr>
                <th class="p-2 text-left">Liquide</th>
                <th class="p-2 text-right">Masse volumique (g/cm³)</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-2">Eau pure</td>
                <td class="p-2 text-right font-mono">1,00</td>
              </tr>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-2">Eau salée</td>
                <td class="p-2 text-right font-mono">1,03</td>
              </tr>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-2">Huile</td>
                <td class="p-2 text-right font-mono">0,92</td>
              </tr>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-2">Lait</td>
                <td class="p-2 text-right font-mono">1,03</td>
              </tr>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="p-2">Alcool (éthanol)</td>
                <td class="p-2 text-right font-mono">0,79</td>
              </tr>
              <tr>
                <td class="p-2">Mercure</td>
                <td class="p-2 text-right font-mono">13,6</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
    <h2 class="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-4">⚓ Flottaison et Masse Volumique</h2>
    <div class="space-y-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">💡 Règle de flottaison :</h4>
        <ul class="space-y-2">
          <li>• Si ρ_objet < ρ_liquide → l'objet <strong>flotte</strong></li>
          <li>• Si ρ_objet = ρ_liquide → l'objet reste en <strong>suspension</strong></li>
          <li>• Si ρ_objet > ρ_liquide → l'objet <strong>coule</strong></li>
        </ul>
      </div>
      
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples :</h4>
        <ul class="space-y-2 text-sm">
          <li>✓ L'huile flotte sur l'eau car ρ_huile (0,92) < ρ_eau (1,00)</li>
          <li>✓ Un glaçon flotte car ρ_glace (0,92) < ρ_eau (1,00)</li>
          <li>✓ Le fer coule car ρ_fer (7,87) > ρ_eau (1,00)</li>
          <li>✓ Le bois flotte généralement car ρ_bois (0,6-0,8) < ρ_eau (1,00)</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🎯 Applications Pratiques</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">🚢</div>
        <h4 class="font-bold mb-2">Navigation</h4>
        <p class="text-sm">Les bateaux flottent grâce à leur forme qui diminue leur masse volumique moyenne</p>
      </div>
      <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">🏗️</div>
        <h4 class="font-bold mb-2">Construction</h4>
        <p class="text-sm">Choix des matériaux selon leur masse volumique et résistance</p>
      </div>
      <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">💎</div>
        <h4 class="font-bold mb-2">Identification</h4>
        <p class="text-sm">Distinguer les matériaux (or vrai/faux) par leur masse volumique</p>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Calcul Direct</h3>
    <p class="mb-4">Un morceau d'aluminium a une masse de 54 g et un volume de 20 cm³.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Calcule la masse volumique de l'aluminium</li>
      <li>Exprime le résultat en g/cm³</li>
      <li>L'aluminium flottera-t-il sur l'eau ? Justifie ta réponse</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Mesure de Liquide</h3>
    <p class="mb-4">Tu veux déterminer la masse volumique d'une huile. Voici tes mesures :</p>
    <ul class="list-disc list-inside mb-4 space-y-1">
      <li>Masse du bécher vide : 120 g</li>
      <li>Masse du bécher + 100 mL d'huile : 212 g</li>
    </ul>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Calcule la masse de l'huile</li>
      <li>Calcule la masse volumique de l'huile</li>
      <li>Cette huile flottera-t-elle sur l'eau ?</li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Comparaison</h3>
    <p class="mb-4">On te donne les masses volumiques suivantes :</p>
    <ul class="list-disc list-inside mb-4">
      <li>Bois de pin : 0,55 g/cm³</li>
      <li>Glace : 0,92 g/cm³</li>
      <li>Eau : 1,00 g/cm³</li>
      <li>Fer : 7,87 g/cm³</li>
      <li>Mercure : 13,6 g/cm³</li>
    </ul>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Classe ces matériaux du moins dense au plus dense</li>
      <li>Lesquels flotteront sur l'eau ?</li>
      <li>Lesquels couleront dans le mercure ?</li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Problème Complexe</h3>
    <p class="mb-4">Un cube de métal de 3 cm de côté a une masse de 243 g.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Calcule le volume du cube</li>
      <li>Calcule la masse volumique du métal</li>
      <li>En comparant avec les valeurs connues, de quel métal s'agit-il probablement ?
        <ul class="ml-6 mt-2 text-sm">
          <li>- Aluminium : 2,7 g/cm³</li>
          <li>- Fer : 7,87 g/cm³</li>
          <li>- Cuivre : 8,96 g/cm³</li>
          <li>- Plomb : 11,3 g/cm³</li>
        </ul>
      </li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/masse-volumique-lesson-music.mp3"
  },

  "proprietes-gaz": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Spécifier deux propriétés de l'état gazeux : élasticité et compressibilité`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Les gaz sont partout autour de nous ! L'air que nous respirons est un mélange de gaz.
    Comprendre les propriétés des gaz nous aide à expliquer de nombreux phénomènes quotidiens.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">💨 Le saviez-vous ?</p>
    <p>Un ballon de baudruche gonflé contient des milliards de milliards de molécules de gaz qui 
    rebondissent constamment contre les parois !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier deux propriétés de l'état gazeux : élasticité et compressibilité</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌬️ Les États de la Matière</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        La matière existe sous trois états principaux : <strong>solide</strong>, <strong>liquide</strong> et <strong>gazeux</strong>.
        Chaque état a des propriétés différentes.
      </p>
      <div class="grid md:grid-cols-3 gap-4 mt-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">🧊 Solide</h4>
          <ul class="text-sm space-y-1">
            <li>• Forme fixe</li>
            <li>• Volume fixe</li>
            <li>• Incompressible</li>
          </ul>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">💧 Liquide</h4>
          <ul class="text-sm space-y-1">
            <li>• Forme variable</li>
            <li>• Volume fixe</li>
            <li>• Peu compressible</li>
          </ul>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">💨 Gaz</h4>
          <ul class="text-sm space-y-1">
            <li>• Forme variable</li>
            <li>• Volume variable</li>
            <li>• Compressible</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🎈 Propriété 1 : L'Élasticité</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">Définition</h3>
        <p class="leading-relaxed">
          <strong>L'élasticité</strong> est la capacité d'un gaz à reprendre son volume initial après avoir été comprimé ou étiré.
          Quand on relâche la pression, le gaz revient à son état d'origine.
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-purple-600 dark:text-purple-400">🎯 Expérience : Le Ballon</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p class="text-sm">Gonfle un ballon de baudruche et ferme-le</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p class="text-sm">Appuie doucement sur le ballon avec tes mains</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p class="text-sm">Le ballon se déforme sous la pression</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p class="text-sm">Relâche la pression : le ballon reprend sa forme initiale !</p>
          </div>
        </div>
        <div class="mt-4 p-3 bg-purple-100 dark:bg-purple-900/40 rounded">
          <p class="text-sm font-semibold">💡 Conclusion :</p>
          <p class="text-sm">Le gaz à l'intérieur du ballon est élastique. Il peut être déformé mais revient toujours à son état initial.</p>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples d'élasticité des gaz :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">🎈</span>
            <span>Ballon qui reprend sa forme</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">🏀</span>
            <span>Ballon de basket qui rebondit</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">🚗</span>
            <span>Pneus de voiture qui absorbent les chocs</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">💺</span>
            <span>Coussins pneumatiques</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🗜️ Propriété 2 : La Compressibilité</h2>
    <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-3">Définition</h3>
        <p class="leading-relaxed">
          <strong>La compressibilité</strong> est la capacité d'un gaz à diminuer de volume lorsqu'on lui applique une pression.
          Les molécules de gaz peuvent se rapprocher les unes des autres.
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-orange-600 dark:text-orange-400">🎯 Expérience : La Seringue</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p class="text-sm">Prends une seringue sans aiguille, remplie d'air</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p class="text-sm">Bouche l'ouverture avec ton doigt</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p class="text-sm">Pousse le piston : l'air se comprime et occupe moins de volume</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p class="text-sm">Tu sens une résistance qui augmente : c'est la pression du gaz !</p>
          </div>
        </div>
        <div class="mt-4 p-3 bg-orange-100 dark:bg-orange-900/40 rounded">
          <p class="text-sm font-semibold">💡 Conclusion :</p>
          <p class="text-sm">Le gaz peut être comprimé dans un volume plus petit. Cette propriété est unique aux gaz !</p>
        </div>
      </div>

      <div class="mt-6 grid md:grid-cols-2 gap-4">
        <div class="bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-900/50 p-4 rounded-lg">
          <h4 class="font-bold mb-2 text-orange-700 dark:text-orange-300">✅ Les gaz sont compressibles</h4>
          <p class="text-sm">On peut réduire leur volume en appliquant une pression</p>
        </div>
        <div class="bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 p-4 rounded-lg">
          <h4 class="font-bold mb-2 text-red-700 dark:text-red-300">❌ Les solides et liquides ne sont pas compressibles</h4>
          <p class="text-sm">Leur volume reste pratiquement constant</p>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Applications de la compressibilité :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🔧</span>
            <span>Compresseurs d'air pour outils pneumatiques</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🚴</span>
            <span>Pompes à vélo pour gonfler les pneus</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🏭</span>
            <span>Bouteilles de gaz comprimé (cuisine, soudure)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🧯</span>
            <span>Extincteurs sous pression</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🎿</span>
            <span>Amortisseurs pneumatiques</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
    <h2 class="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-4">🔬 Comparaison : Élasticité vs Compressibilité</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300 dark:border-gray-600">
        <thead class="bg-cyan-100 dark:bg-cyan-900/50">
          <tr>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Propriété</th>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Élasticité</th>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Compressibilité</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Définition</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Capacité à reprendre son volume initial</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Capacité à réduire son volume sous pression</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Quand ?</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Après relâchement de la pression</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Pendant l'application de la pression</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Exemple</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Ballon qui reprend sa forme</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Air dans une seringue</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded">
      <p class="font-semibold text-sm">🔑 Point Important :</p>
      <p class="text-sm">Ces deux propriétés sont liées ! La compressibilité permet de comprimer le gaz, 
      et l'élasticité lui permet de revenir à son volume initial quand on relâche la pression.</p>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Vrai ou Faux</h3>
    <p class="mb-4">Indique si les affirmations suivantes sont vraies ou fausses :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Les gaz sont compressibles. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les liquides ont la même compressibilité que les gaz. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>L'élasticité permet au gaz de reprendre son volume initial. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Un ballon gonflé démontre la compressibilité et l'élasticité des gaz. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les solides sont élastiques comme les gaz. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Situations Pratiques</h3>
    <p class="mb-4">Pour chaque situation, indique quelle propriété du gaz est illustrée (Élasticité E ou Compressibilité C) :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Tu gonfles un pneu de vélo avec une pompe. <span class="ml-4">_____</span></li>
      <li>Un ballon de basket rebondit sur le sol. <span class="ml-4">_____</span></li>
      <li>On remplit une bouteille de gaz de cuisine. <span class="ml-4">_____</span></li>
      <li>Un coussin d'air reprend sa forme après avoir été assis dessus. <span class="ml-4">_____</span></li>
      <li>Un compresseur stocke de l'air dans un réservoir. <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Expérience</h3>
    <p class="mb-4">Décris une expérience simple pour démontrer :</p>
    <div class="space-y-4">
      <div class="p-4 bg-white/50 dark:bg-black/20 rounded">
        <p class="font-semibold mb-2">a) La compressibilité des gaz</p>
        <p class="text-sm text-muted-foreground">Matériel nécessaire : _______________</p>
        <p class="text-sm text-muted-foreground mt-2">Étapes : _______________</p>
      </div>
      <div class="p-4 bg-white/50 dark:bg-black/20 rounded">
        <p class="font-semibold mb-2">b) L'élasticité des gaz</p>
        <p class="text-sm text-muted-foreground">Matériel nécessaire : _______________</p>
        <p class="text-sm text-muted-foreground mt-2">Étapes : _______________</p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Réflexion</h3>
    <p class="mb-4 font-semibold">Pourquoi les pneus de voiture sont-ils remplis d'air et non d'eau ou de sable ?</p>
    <p class="text-sm text-muted-foreground mb-3">Dans ta réponse, explique :</p>
    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
      <li>Le rôle de la compressibilité des gaz</li>
      <li>Le rôle de l'élasticité des gaz</li>
      <li>Pourquoi l'eau ou le sable ne conviendraient pas</li>
    </ul>
    <div class="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[100px]">
      <p class="text-xs text-muted-foreground italic">Espace pour ta réponse...</p>
    </div>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/proprietes-gaz-lesson-music.mp3"
  },

  // LA CHALEUR
  "propagation-chaleur": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Spécifier que la chaleur peut se propager par conduction
• Spécifier que la chaleur peut se propager par convection
• Spécifier que la chaleur peut se propager par rayonnement`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Quand tu te rapproches d'un feu, tu sens la chaleur. Quand tu touches une casserole chaude, tu te brûles.
    La chaleur voyage ! Mais comment se déplace-t-elle d'un endroit à un autre ?
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔥 Le saviez-vous ?</p>
    <p>Le Soleil nous réchauffe à travers 150 millions de kilomètres d'espace vide ! La chaleur peut voyager
    même sans matière.</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier que la chaleur peut se propager par conduction</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier que la chaleur peut se propager par convection</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier que la chaleur peut se propager par rayonnement</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌡️ Qu'est-ce que la Chaleur ?</h2>
    <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
      <p class="leading-relaxed mb-4">
        La <strong>chaleur</strong> est une forme d'énergie qui se déplace toujours du corps le plus chaud vers
        le corps le plus froid. Cette énergie peut se propager de trois manières différentes.
      </p>
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
        <p class="font-semibold mb-2">🔑 Règle importante :</p>
        <p>La chaleur se déplace TOUJOURS du chaud vers le froid, jamais l'inverse !</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔥 Mode 1 : La Conduction</h2>
    <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-3">Définition</h3>
        <p class="leading-relaxed">
          La <strong>conduction</strong> est la propagation de la chaleur de proche en proche à travers un matériau,
          sans déplacement de la matière. La chaleur passe par contact direct.
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-orange-600 dark:text-orange-400">🎯 Expérience : La Cuillère Métallique</h4>
        <div class="space-y-3">
          <p class="text-sm">Place une cuillère métallique dans une tasse d'eau chaude</p>
          <p class="text-sm">Au bout de quelques secondes, le manche de la cuillère devient chaud</p>
          <p class="text-sm font-semibold text-orange-700 dark:text-orange-300">
            → La chaleur s'est propagée du bas vers le haut de la cuillère par conduction !
          </p>
        </div>
        
        <div class="mt-4 grid md:grid-cols-2 gap-4">
          <div class="p-3 bg-green-50 dark:bg-green-900/30 rounded">
            <h5 class="font-bold text-green-700 dark:text-green-300 mb-2">✓ Bons conducteurs</h5>
            <ul class="text-sm space-y-1">
              <li>• Métaux (cuivre, fer, aluminium)</li>
              <li>• Utilisés pour casseroles</li>
              <li>• Transmettent vite la chaleur</li>
            </ul>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded">
            <h5 class="font-bold text-blue-700 dark:text-blue-300 mb-2">✗ Mauvais conducteurs (Isolants)</h5>
            <ul class="text-sm space-y-1">
              <li>• Bois, plastique, air</li>
              <li>• Utilisés pour manches de casseroles</li>
              <li>• Transmettent lentement la chaleur</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/50 dark:to-red-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples quotidiens de conduction :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🍳</span>
            <span>Une casserole sur le feu chauffe par conduction</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🔧</span>
            <span>Un fer à repasser transmet la chaleur aux vêtements</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">❄️</span>
            <span>Une barre de glace dans ta main se réchauffe</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🏠</span>
            <span>Les radiateurs chauffent les murs par contact</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💨 Mode 2 : La Convection</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-3">Définition</h3>
        <p class="leading-relaxed">
          La <strong>convection</strong> est la propagation de la chaleur par déplacement de matière (liquide ou gaz).
          Les parties chaudes montent, les parties froides descendent, créant des courants.
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-blue-600 dark:text-blue-400">🎯 Expérience : L'Eau qui Bout</h4>
        <div class="space-y-3">
          <p class="text-sm">Chauffe de l'eau dans une casserole transparente</p>
          <p class="text-sm">Observe : l'eau chaude au fond monte vers le haut</p>
          <p class="text-sm">L'eau froide en surface descend vers le fond</p>
          <p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
            → Des courants de convection se forment ! C'est comme une boucle continue.
          </p>
        </div>
        
        <div class="mt-4 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/50 dark:to-cyan-900/50 rounded-lg">
          <h5 class="font-bold mb-2">💡 Pourquoi ça monte et ça descend ?</h5>
          <ul class="text-sm space-y-2">
            <li>✓ L'eau (ou l'air) chaude est moins dense → plus légère → monte</li>
            <li>✓ L'eau (ou l'air) froide est plus dense → plus lourde → descend</li>
          </ul>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples quotidiens de convection :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">🏠</span>
            <span>L'air chaud dans une pièce monte au plafond</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">🍲</span>
            <span>L'eau bout dans une marmite avec des mouvements circulaires</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">🌬️</span>
            <span>Les vents : l'air chaud monte, l'air froid descend</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">🌊</span>
            <span>Les courants marins dans les océans</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">🎈</span>
            <span>Les montgolfières : l'air chaud les fait monter</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">☀️ Mode 3 : Le Rayonnement</h2>
    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-3">Définition</h3>
        <p class="leading-relaxed">
          Le <strong>rayonnement</strong> est la propagation de la chaleur par ondes (comme la lumière),
          sans nécessiter de matière. La chaleur peut voyager dans le vide !
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-yellow-600 dark:text-yellow-400">🎯 Expérience : Le Soleil</h4>
        <div class="space-y-3">
          <p class="text-sm">Mets-toi au soleil et tu sens sa chaleur sur ta peau</p>
          <p class="text-sm">Pourtant, entre le Soleil et toi, il y a le vide de l'espace !</p>
          <p class="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
            → Le Soleil nous réchauffe par rayonnement, sans avoir besoin d'air entre nous !
          </p>
        </div>
        
        <div class="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/50 dark:to-orange-900/50 rounded-lg">
          <h5 class="font-bold mb-2">💡 Caractéristiques du rayonnement :</h5>
          <ul class="text-sm space-y-2">
            <li>✓ Voyage à la vitesse de la lumière</li>
            <li>✓ Ne nécessite pas de matière (peut traverser le vide)</li>
            <li>✓ Peut être réfléchi par des surfaces brillantes</li>
            <li>✓ Absorbé par les surfaces sombres</li>
          </ul>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/50 dark:to-yellow-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples quotidiens de rayonnement :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 dark:text-yellow-400">☀️</span>
            <span>Le Soleil réchauffe la Terre</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 dark:text-yellow-400">🔥</span>
            <span>Tu sens la chaleur d'un feu même sans le toucher</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 dark:text-yellow-400">💡</span>
            <span>Une ampoule chauffe par rayonnement</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 dark:text-yellow-400">🍞</span>
            <span>Un grille-pain chauffe le pain par rayonnement</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-600 dark:text-yellow-400">📡</span>
            <span>Les micro-ondes chauffent les aliments</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
    <h2 class="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">📊 Comparaison des Trois Modes</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300 dark:border-gray-600">
        <thead class="bg-purple-100 dark:bg-purple-900/50">
          <tr>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Mode</th>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Besoin de matière ?</th>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Déplacement de matière ?</th>
            <th class="border border-gray-300 dark:border-gray-600 p-3 text-left">Exemple</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Conduction</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Oui</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Non</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Cuillère dans l'eau chaude</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Convection</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Oui (fluide)</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Oui</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Eau qui bout</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-3 font-semibold">Rayonnement</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Non</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Non</td>
            <td class="border border-gray-300 dark:border-gray-600 p-3">Chaleur du Soleil</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="mt-4 p-3 bg-purple-100 dark:bg-purple-900/40 rounded">
      <p class="font-semibold text-sm">🔑 À retenir :</p>
      <p class="text-sm">Ces trois modes peuvent coexister ! Par exemple, quand tu fais cuire quelque chose au four :
      conduction (plaque → casserole), convection (air chaud dans le four) et rayonnement (chaleur des parois).</p>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Identification</h3>
    <p class="mb-4">Pour chaque situation, identifie le mode de propagation de la chaleur (Conduction / Convection / Rayonnement) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Tu touches une casserole chaude et tu te brûles. <span class="ml-4">__________</span></li>
      <li>Tu sens la chaleur du feu de camp sans le toucher. <span class="ml-4">__________</span></li>
      <li>L'air chaud d'un radiateur monte vers le plafond. <span class="ml-4">__________</span></li>
      <li>Une cuillère en métal devient chaude dans une soupe. <span class="ml-4">__________</span></li>
      <li>Le Soleil réchauffe ton visage. <span class="ml-4">__________</span></li>
      <li>L'eau bout dans une marmite avec des bulles qui montent. <span class="ml-4">__________</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Vrai ou Faux</h3>
    <p class="mb-4">Indique si les affirmations suivantes sont vraies ou fausses :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>La conduction nécessite un contact direct. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>La convection se produit dans les solides. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Le rayonnement peut voyager dans le vide. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les métaux sont de bons conducteurs de chaleur. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>La chaleur va toujours du froid vers le chaud. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>L'air chaud est plus lourd que l'air froid. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Matériaux</h3>
    <p class="mb-4">Classe les matériaux suivants en bons conducteurs ou isolants :</p>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h4 class="font-semibold mb-3">Bons conducteurs :</h4>
        <ul class="space-y-2 ml-4">
          <li>_______________</li>
          <li>_______________</li>
          <li>_______________</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-3">Isolants :</h4>
        <ul class="space-y-2 ml-4">
          <li>_______________</li>
          <li>_______________</li>
          <li>_______________</li>
        </ul>
      </div>
    </div>
    <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
      <p class="text-sm font-semibold mb-2">Matériaux à classer :</p>
      <p class="text-sm">Cuivre • Bois • Fer • Plastique • Aluminium • Laine • Air • Acier</p>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Application Pratique</h3>
    <p class="mb-4 font-semibold">Explique pourquoi les manches des casseroles sont en bois ou en plastique et non en métal.</p>
    <p class="text-sm text-muted-foreground mb-3">Dans ta réponse, mentionne :</p>
    <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
      <li>Le mode de propagation de la chaleur impliqué</li>
      <li>La différence entre conducteurs et isolants</li>
      <li>Les avantages pour l'utilisateur</li>
    </ul>
    <div class="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[100px]">
      <p class="text-xs text-muted-foreground italic">Espace pour ta réponse...</p>
    </div>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/propagation-chaleur-lesson-music.mp3"
  },

  "effets-chaleur": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Spécifier que la chaleur provoque la dilatation des solides
• Constater que la chaleur provoque une dilatation des liquides et le changement d'état de certains corps
• Spécifier que la chaleur provoque la décomposition de certaines substances`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    La chaleur transforme la matière de façons surprenantes ! Elle peut faire grandir, fondre, bouillir ou même décomposer les substances.
    Découvrons ensemble ces effets fascinants de la chaleur sur notre monde.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔥 Le saviez-vous ?</p>
    <p>Les rails de chemin de fer ont des espaces entre eux pour permettre leur dilatation lors des journées chaudes. 
    Sans ces espaces, les rails se tordraient !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier que la chaleur provoque la dilatation des solides</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Constater la dilatation des liquides et le changement d'état</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier que la chaleur provoque la décomposition de certaines substances</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📏 Effet 1 : Dilatation des Solides</h2>
    <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-3">Qu'est-ce que la dilatation ?</h3>
        <p class="leading-relaxed">
          La <strong>dilatation</strong> est l'augmentation de volume d'un corps lorsqu'il est chauffé.
          Les molécules bougent plus vite et s'écartent les unes des autres → le solide devient plus grand !
        </p>
      </div>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-orange-600 dark:text-orange-400">🎯 Expérience : La Balle de Métal</h4>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</span>
            <p class="text-sm">Une balle de métal passe juste à travers un anneau</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</span>
            <p class="text-sm">Chauffe la balle dans la flamme</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</span>
            <p class="text-sm">La balle chaude ne passe plus ! Elle a grossi (dilaté)</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</span>
            <p class="text-sm">Laisse refroidir : la balle repasse à travers (elle s'est contractée)</p>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Exemples quotidiens :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🚂</span>
            <span>Espaces entre les rails de train (dilatation en été)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🌉</span>
            <span>Joints de dilatation sur les ponts</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🔩</span>
            <span>Couvercle de bocal bloqué → on le passe sous l'eau chaude</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400">🪟</span>
            <span>Fissures dans les murs par changements de température</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💧 Effet 2 : Dilatation des Liquides</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        Les liquides se dilatent aussi quand on les chauffe ! C'est même plus visible que pour les solides.
      </p>

      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-blue-600 dark:text-blue-400">🎯 Expérience : La Bouteille</h4>
        <div class="space-y-3">
          <p class="text-sm">Remplis une bouteille d'eau colorée jusqu'au bord</p>
          <p class="text-sm">Mets la bouteille au soleil ou dans l'eau chaude</p>
          <p class="text-sm font-semibold text-blue-700 dark:text-blue-300">
            → L'eau déborde ! Elle a augmenté de volume en chauffant
          </p>
        </div>
        
        <div class="mt-4 p-3 bg-blue-100 dark:bg-blue-900/40 rounded">
          <p class="text-sm font-semibold">💡 Principe :</p>
          <p class="text-sm">Les thermomètres fonctionnent grâce à la dilatation des liquides (mercure ou alcool coloré) !</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔄 Effet 3 : Changements d'État</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <p class="leading-relaxed mb-4">
        La chaleur peut transformer complètement l'état de la matière !
      </p>

      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">🧊 → 💧 Fusion</h4>
          <p class="text-sm mb-2">Solide → Liquide</p>
          <p class="text-xs">Glace qui fond, beurre qui fond, chocolat qui fond</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">💧 → 💨 Vaporisation</h4>
          <p class="text-sm mb-2">Liquide → Gaz</p>
          <p class="text-xs">Eau qui bout et devient vapeur, essence qui s'évapore</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">🧊 → 💨 Sublimation</h4>
          <p class="text-sm mb-2">Solide → Gaz direct</p>
          <p class="text-xs">Glace sèche (CO₂), naphtaline, iode</p>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="w-full border-2 border-purple-300 dark:border-purple-700">
          <thead class="bg-purple-100 dark:bg-purple-900/50">
            <tr>
              <th class="border border-purple-300 dark:border-purple-700 p-3 text-left">Substance</th>
              <th class="border border-purple-300 dark:border-purple-700 p-3 text-left">Point de fusion</th>
              <th class="border border-purple-300 dark:border-purple-700 p-3 text-left">Point d'ébullition</th>
            </tr>
          </thead>
          <tbody class="bg-white/70 dark:bg-gray-800/70">
            <tr>
              <td class="border border-purple-300 dark:border-purple-700 p-3">Eau</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">0°C</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">100°C</td>
            </tr>
            <tr>
              <td class="border border-purple-300 dark:border-purple-700 p-3">Fer</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">1538°C</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">2862°C</td>
            </tr>
            <tr>
              <td class="border border-purple-300 dark:border-purple-700 p-3">Alcool</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">-114°C</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">78°C</td>
            </tr>
            <tr>
              <td class="border border-purple-300 dark:border-purple-700 p-3">Or</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">1064°C</td>
              <td class="border border-purple-300 dark:border-purple-700 p-3">2856°C</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💥 Effet 4 : Décomposition</h2>
    <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
      <p class="leading-relaxed mb-4">
        Certaines substances se <strong>décomposent</strong> (se cassent en morceaux plus petits) sous l'effet de la chaleur.
      </p>

      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-red-500">
          <h4 class="font-bold mb-2">🧪 Exemple 1 : Le Sucre</h4>
          <p class="text-sm">Chauffe du sucre → il fond → devient brun (caramel) → devient noir (carbone) + vapeur d'eau</p>
          <p class="text-xs mt-2 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded">
            C₁₂H₂₂O₁₁ (sucre) + chaleur → C (carbone) + H₂O (vapeur)
          </p>
        </div>

        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-orange-500">
          <h4 class="font-bold mb-2">🪨 Exemple 2 : Le Calcaire</h4>
          <p class="text-sm">Chauffe fortement du calcaire (CaCO₃) → il se décompose en chaux vive (CaO) + gaz carbonique (CO₂)</p>
          <p class="text-xs mt-2 font-mono bg-orange-100 dark:bg-orange-900/40 p-2 rounded">
            CaCO₃ + chaleur → CaO + CO₂
          </p>
        </div>

        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-yellow-500">
          <h4 class="font-bold mb-2">🍞 Exemple 3 : Le Pain Grillé</h4>
          <p class="text-sm">Le pain devient brun puis noir (carbonisation) si on le chauffe trop longtemps</p>
        </div>
      </div>

      <div class="mt-6 p-4 bg-red-100 dark:bg-red-900/40 rounded-lg border-2 border-red-500">
        <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">⚠️ Attention - Danger !</h4>
        <ul class="text-sm space-y-1">
          <li>• Ne jamais chauffer des substances sans supervision</li>
          <li>• La décomposition peut libérer des gaz dangereux</li>
          <li>• Toujours travailler dans un endroit bien ventilé</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
    <h2 class="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">🎯 Résumé des Effets de la Chaleur</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">Effets Réversibles</h4>
        <ul class="text-sm space-y-1">
          <li>✓ Dilatation (refroidir → contraction)</li>
          <li>✓ Fusion (refroidir → solidification)</li>
          <li>✓ Vaporisation (refroidir → condensation)</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">Effets Irréversibles</h4>
        <ul class="text-sm space-y-1">
          <li>✓ Décomposition chimique</li>
          <li>✓ Combustion</li>
          <li>✓ Carbonisation</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Identification</h3>
    <p class="mb-4">Identifie l'effet de la chaleur dans chaque situation :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Un glaçon fond dans ta main. <span class="ml-4">__________</span></li>
      <li>Les rails de train ont des espaces entre eux. <span class="ml-4">__________</span></li>
      <li>L'eau bout et devient vapeur. <span class="ml-4">__________</span></li>
      <li>Le sucre devient noir et brûle. <span class="ml-4">__________</span></li>
      <li>Le mercure monte dans un thermomètre. <span class="ml-4">__________</span></li>
      <li>Le beurre devient liquide dans la poêle. <span class="ml-4">__________</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Changements d'État</h3>
    <p class="mb-4">Complète le tableau :</p>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300">
        <thead class="bg-accent/20">
          <tr>
            <th class="border p-2">Substance</th>
            <th class="border p-2">État initial</th>
            <th class="border p-2">Effet de la chaleur</th>
            <th class="border p-2">État final</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2">Glace</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
          </tr>
          <tr>
            <td class="border p-2">Eau</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
          </tr>
          <tr>
            <td class="border p-2">Chocolat</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Vrai ou Faux</h3>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Tous les solides se dilatent quand on les chauffe. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les liquides se dilatent plus que les solides. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>La décomposition est toujours réversible. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>L'eau bout à 100°C au niveau de la mer. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les ponts ont des joints de dilatation. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Application</h3>
    <p class="mb-4">Explique pourquoi :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>On peut ouvrir un couvercle de bocal bloqué en le passant sous l'eau chaude</li>
      <li>Les lignes électriques pendent plus en été qu'en hiver</li>
      <li>On ne remplit jamais complètement un réservoir d'essence</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/effets-chaleur-lesson-music.mp3"
  },

  "thermometre": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier le principe du thermomètre (dilatation des liquides)
• Spécifier les températures repérées des échelles thermométriques : degré Celsius et degré Fahrenheit
• Utiliser un thermomètre pour mesurer des températures`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Le thermomètre est un instrument essentiel pour mesurer la température. De la météo à la médecine,
    il nous aide à comprendre le monde chaud et froid qui nous entoure !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🌡️ Le saviez-vous ?</p>
    <p>Le premier thermomètre a été inventé par Galilée en 1592 ! Aujourd'hui, on utilise même des
    thermomètres infrarouge qui mesurent sans contact.</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Identifier le principe du thermomètre (dilatation des liquides)</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier les températures repérées des échelles Celsius et Fahrenheit</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Utiliser un thermomètre pour mesurer des températures</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌡️ Qu'est-ce qu'un Thermomètre ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        Un <strong>thermomètre</strong> est un instrument qui mesure la <strong>température</strong>.
        Il indique si un corps est chaud ou froid en utilisant un chiffre précis.
      </p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
        <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">🔬 Principe de Fonctionnement</h4>
        <p class="mb-3">Le thermomètre utilise la <strong>dilatation des liquides</strong> :</p>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">1.</span>
            <span>Quand il fait <strong>chaud</strong> → le liquide se dilate → monte dans le tube</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">2.</span>
            <span>Quand il fait <strong>froid</strong> → le liquide se contracte → descend dans le tube</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400">3.</span>
            <span>On lit la température sur l'échelle graduée</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Structure d'un Thermomètre</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <div class="grid md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">📍 Le Réservoir</h4>
            <p class="text-sm">Petite boule en bas contenant le liquide (mercure ou alcool coloré)</p>
          </div>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">📏 Le Tube Capillaire</h4>
            <p class="text-sm">Tube très fin où le liquide monte ou descend</p>
          </div>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">📊 L'Échelle Graduée</h4>
            <p class="text-sm">Marques avec des chiffres pour lire la température</p>
          </div>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-3">🎨 Types de Liquides</h4>
          <div class="space-y-3">
            <div class="p-3 bg-purple-100 dark:bg-purple-900/50 rounded">
              <p class="font-semibold text-sm">Mercure (argent) 💧</p>
              <ul class="text-xs mt-1 space-y-1">
                <li>• Très précis</li>
                <li>• Mesure de -39°C à 357°C</li>
                <li>⚠️ Toxique ! Dangereux si cassé</li>
              </ul>
            </div>
            <div class="p-3 bg-pink-100 dark:bg-pink-900/50 rounded">
              <p class="font-semibold text-sm">Alcool coloré (rouge) 🔴</p>
              <ul class="text-xs mt-1 space-y-1">
                <li>• Plus sûr que le mercure</li>
                <li>• Mesure de -115°C à 78°C</li>
                <li>✓ Non toxique</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📐 Les Échelles de Température</h2>
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-4">Échelle Celsius (°C)</h3>
        <div class="space-y-3">
          <p class="text-sm">L'échelle la plus utilisée dans le monde, inventée par Anders Celsius en 1742.</p>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-3">Points de référence :</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                <span>🧊 Glace fondante</span>
                <span class="font-bold">0°C</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-orange-100 dark:bg-orange-900/50 rounded">
                <span>💨 Eau bouillante</span>
                <span class="font-bold">100°C</span>
              </div>
            </div>
            <p class="text-xs mt-3 text-muted-foreground">→ L'échelle est divisée en 100 degrés entre ces deux points</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">Échelle Fahrenheit (°F)</h3>
        <div class="space-y-3">
          <p class="text-sm">Utilisée principalement aux États-Unis, inventée par Daniel Fahrenheit en 1724.</p>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-3">Points de référence :</h4>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/50 rounded">
                <span>🧊 Glace fondante</span>
                <span class="font-bold">32°F</span>
              </div>
              <div class="flex justify-between items-center p-2 bg-orange-100 dark:bg-orange-900/50 rounded">
                <span>💨 Eau bouillante</span>
                <span class="font-bold">212°F</span>
              </div>
            </div>
            <p class="text-xs mt-3 text-muted-foreground">→ L'échelle est divisée en 180 degrés entre ces deux points</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">🔄 Conversion entre Celsius et Fahrenheit</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
            <p class="font-semibold mb-2">De °C vers °F :</p>
            <p class="text-lg font-mono bg-purple-100 dark:bg-purple-900/50 p-3 rounded">
              °F = (°C × 9/5) + 32
            </p>
            <p class="text-xs mt-2 text-muted-foreground">Exemple : 25°C = (25 × 9/5) + 32 = 77°F</p>
          </div>
          <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
            <p class="font-semibold mb-2">De °F vers °C :</p>
            <p class="text-lg font-mono bg-purple-100 dark:bg-purple-900/50 p-3 rounded">
              °C = (°F - 32) × 5/9
            </p>
            <p class="text-xs mt-2 text-muted-foreground">Exemple : 77°F = (77 - 32) × 5/9 = 25°C</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📖 Comment Utiliser un Thermomètre ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 class="font-bold text-blue-700 dark:text-blue-300 mb-2">Étape 1 : Vérification</h4>
          <p class="text-sm">Assure-toi que le thermomètre est propre et en bon état</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-cyan-500">
          <h4 class="font-bold text-cyan-700 dark:text-cyan-300 mb-2">Étape 2 : Immersion</h4>
          <p class="text-sm">Place le réservoir dans le liquide ou en contact avec l'objet à mesurer</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-green-500">
          <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">Étape 3 : Attente</h4>
          <p class="text-sm">Attends que le liquide arrête de monter/descendre (environ 1-2 minutes)</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-orange-500">
          <h4 class="font-bold text-orange-700 dark:text-orange-300 mb-2">Étape 4 : Lecture</h4>
          <p class="text-sm">Lis la température au niveau du haut du liquide, les yeux à la même hauteur</p>
        </div>
      </div>

      <div class="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg border-2 border-yellow-500">
        <h4 class="font-bold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Précautions d'Utilisation</h4>
        <ul class="text-sm space-y-1">
          <li>• Ne pas secouer violemment le thermomètre</li>
          <li>• Ne pas l'exposer à des températures extrêmes</li>
          <li>• Si le thermomètre au mercure se casse, appelle un adulte immédiatement</li>
          <li>• Toujours tenir le thermomètre par le haut, jamais par le réservoir</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 p-6 rounded-xl border-2 border-pink-200 dark:border-pink-800">
    <h2 class="text-2xl font-bold text-pink-800 dark:text-pink-200 mb-4">🌡️ Températures de Référence</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300 dark:border-gray-600">
        <thead class="bg-pink-100 dark:bg-pink-900/50">
          <tr>
            <th class="border p-3 text-left">Situation</th>
            <th class="border p-3 text-center">°C</th>
            <th class="border p-3 text-center">°F</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border p-2">Température du corps humain</td>
            <td class="border p-2 text-center font-mono">37°C</td>
            <td class="border p-2 text-center font-mono">98,6°F</td>
          </tr>
          <tr>
            <td class="border p-2">Chambre confortable</td>
            <td class="border p-2 text-center font-mono">20-22°C</td>
            <td class="border p-2 text-center font-mono">68-72°F</td>
          </tr>
          <tr>
            <td class="border p-2">Journée chaude</td>
            <td class="border p-2 text-center font-mono">30-35°C</td>
            <td class="border p-2 text-center font-mono">86-95°F</td>
          </tr>
          <tr>
            <td class="border p-2">Eau de la mer (tropiques)</td>
            <td class="border p-2 text-center font-mono">25-28°C</td>
            <td class="border p-2 text-center font-mono">77-82°F</td>
          </tr>
          <tr>
            <td class="border p-2">Congélateur</td>
            <td class="border p-2 text-center font-mono">-18°C</td>
            <td class="border p-2 text-center font-mono">0°F</td>
          </tr>
          <tr>
            <td class="border p-2">Four de cuisson</td>
            <td class="border p-2 text-center font-mono">180-200°C</td>
            <td class="border p-2 text-center font-mono">356-392°F</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Lecture de Température</h3>
    <p class="mb-4">Lis les températures suivantes et exprime-les dans les deux échelles :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Un thermomètre indique 20°C. Combien cela fait-il en °F ? <span class="ml-4">________</span></li>
      <li>Il fait 86°F dehors. Combien cela fait-il en °C ? <span class="ml-4">________</span></li>
      <li>L'eau est à 50°C. Combien cela fait-il en °F ? <span class="ml-4">________</span></li>
      <li>Le four est à 392°F. Combien cela fait-il en °C ? <span class="ml-4">________</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Principe du Thermomètre</h3>
    <p class="mb-4">Réponds aux questions suivantes :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Quelle propriété des liquides permet au thermomètre de fonctionner ?</li>
      <li>Que se passe-t-il quand la température augmente ?</li>
      <li>Quels sont les deux liquides utilisés dans les thermomètres ?</li>
      <li>Pourquoi préfère-t-on l'alcool coloré au mercure aujourd'hui ?</li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Situations Pratiques</h3>
    <p class="mb-4">Classe les températures suivantes de la plus froide à la plus chaude :</p>
    <ul class="list-disc list-inside mb-4 space-y-1">
      <li>A) Eau bouillante : 100°C</li>
      <li>B) Glace : 0°C</li>
      <li>C) Corps humain : 37°C</li>
      <li>D) Chambre : 22°C</li>
      <li>E) Congélateur : -18°C</li>
      <li>F) Journée chaude : 35°C</li>
    </ul>
    <p class="font-semibold">Ordre : _____ → _____ → _____ → _____ → _____ → _____</p>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Utilisation Pratique</h3>
    <p class="mb-4 font-semibold">Tu dois mesurer la température de l'eau dans un bécher.</p>
    <p class="mb-3">Décris les étapes à suivre (au moins 4 étapes) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>_________________________________</li>
      <li>_________________________________</li>
      <li>_________________________________</li>
      <li>_________________________________</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/thermometre-lesson-music.mp3"
  },

  // ÉLECTRICITÉ
  "circuit-electrique-simple": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Réaliser un circuit électrique simple à partir d'une pile et d'une ampoule
• Identifier les matériaux conduisant l'électricité (les conducteurs) ou non (les isolants)
• Spécifier la condition indispensable à la réalisation d'un circuit`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    L'électricité est partout dans notre vie quotidienne ! Des ampoules aux ordinateurs, tout fonctionne grâce aux circuits électriques.
    Apprenons à créer et comprendre les circuits électriques de base.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">⚡ Le saviez-vous ?</p>
    <p>L'électricité voyage à environ 300 000 km/s dans un fil ! C'est presque la vitesse de la lumière.</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Réaliser un circuit électrique simple</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Identifier conducteurs et isolants</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier les conditions nécessaires à un circuit</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚡ Qu'est-ce qu'un Circuit Électrique ?</h2>
    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
      <p class="leading-relaxed mb-4">
        Un <strong>circuit électrique</strong> est un chemin fermé qui permet à l'électricité de circuler
        depuis une source d'énergie (pile) vers un appareil (ampoule) et de revenir à la source.
      </p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
        <h4 class="font-bold text-yellow-700 dark:text-yellow-300 mb-3">🔋 Composants de Base</h4>
        <div class="grid md:grid-cols-3 gap-4">
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded">
            <p class="font-semibold mb-1">🔋 La Pile</p>
            <p class="text-sm">Source d'énergie électrique</p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded">
            <p class="font-semibold mb-1">💡 L'Ampoule</p>
            <p class="text-sm">Récepteur qui transforme l'électricité en lumière</p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded">
            <p class="font-semibold mb-1">➖ Les Fils</p>
            <p class="text-sm">Conducteurs qui transportent l'électricité</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔌 Réaliser un Circuit Simple</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">Matériel Nécessaire</h3>
      <ul class="space-y-2 mb-6">
        <li class="flex items-center gap-2">
          <span class="text-blue-600 dark:text-blue-400">•</span>
          <span>1 pile plate de 4,5 V (ou pile ronde de 1,5 V)</span>
        </li>
        <li class="flex items-center gap-2">
          <span class="text-blue-600 dark:text-blue-400">•</span>
          <span>1 ampoule avec douille</span>
        </li>
        <li class="flex items-center gap-2">
          <span class="text-blue-600 dark:text-blue-400">•</span>
          <span>2 fils électriques avec pinces crocodiles</span>
        </li>
      </ul>

      <div class="space-y-4">
        <h4 class="font-bold">Étapes de Montage :</h4>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-blue-500">
          <p class="font-semibold mb-2">Étape 1 : Borne Positive</p>
          <p class="text-sm">Connecte un fil à la borne positive (+) de la pile</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-cyan-500">
          <p class="font-semibold mb-2">Étape 2 : Première Connexion</p>
          <p class="text-sm">Relie l'autre extrémité du fil à une borne de l'ampoule</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-green-500">
          <p class="font-semibold mb-2">Étape 3 : Deuxième Fil</p>
          <p class="text-sm">Connecte le deuxième fil à l'autre borne de l'ampoule</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg border-l-4 border-orange-500">
          <p class="font-semibold mb-2">Étape 4 : Fermeture du Circuit</p>
          <p class="text-sm">Relie ce fil à la borne négative (-) de la pile</p>
        </div>
        <div class="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg border-2 border-green-500">
          <p class="font-semibold">✨ Résultat :</p>
          <p class="text-sm">L'ampoule s'allume ! L'électricité circule dans un circuit fermé.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔑 Condition Indispensable</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <div class="p-5 bg-white/70 dark:bg-black/30 rounded-lg">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Le Circuit Doit Être FERMÉ</h3>
        <p class="mb-4">Pour que l'électricité circule et que l'ampoule s'allume, il faut un <strong>chemin continu</strong> sans interruption.</p>
        
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div class="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg border-2 border-green-500">
            <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">✅ Circuit Fermé</h4>
            <ul class="text-sm space-y-1">
              <li>• Chemin complet</li>
              <li>• Aucune coupure</li>
              <li>• L'ampoule s'allume ✨</li>
              <li>• L'électricité circule</li>
            </ul>
          </div>
          <div class="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg border-2 border-red-500">
            <h4 class="font-bold text-red-700 dark:text-red-300 mb-2">❌ Circuit Ouvert</h4>
            <ul class="text-sm space-y-1">
              <li>• Chemin interrompu</li>
              <li>• Fil déconnecté</li>
              <li>• L'ampoule ne s'allume pas</li>
              <li>• L'électricité ne circule pas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Conducteurs et Isolants</h2>
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
      <div class="space-y-6">
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">⚡ Les Conducteurs</h3>
          <p class="mb-3">Matériaux qui <strong>laissent passer</strong> l'électricité facilement.</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">🔩 Cuivre</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">⚙️ Fer</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">✨ Aluminium</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">🥇 Or</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">🥈 Argent</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">💧 Eau salée</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">✏️ Graphite</p>
            </div>
            <div class="p-2 bg-green-100 dark:bg-green-900/50 rounded text-center">
              <p class="font-semibold">👨 Corps humain</p>
            </div>
          </div>
        </div>

        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-3">🚫 Les Isolants</h3>
          <p class="mb-3">Matériaux qui <strong>ne laissent pas passer</strong> l'électricité.</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🪵 Bois</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🧱 Plastique</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🪨 Verre</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🧶 Caoutchouc</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">📄 Papier</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🧵 Tissu</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">🖍️ Porcelaine</p>
            </div>
            <div class="p-2 bg-red-100 dark:bg-red-900/50 rounded text-center">
              <p class="font-semibold">💨 Air</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
          <h4 class="font-bold mb-2">🔬 Expérience : Tester les Matériaux</h4>
          <p class="text-sm mb-2">Monte un circuit avec un espace vide entre deux fils. Place différents objets dans cet espace :</p>
          <ul class="text-sm space-y-1">
            <li>• Si l'ampoule s'allume → le matériau est <strong>conducteur</strong></li>
            <li>• Si l'ampoule reste éteinte → le matériau est <strong>isolant</strong></li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
    <h2 class="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-4">⚠️ Sécurité Électrique</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">✅ À Faire</h4>
        <ul class="text-sm space-y-1">
          <li>• Utiliser des piles (basse tension)</li>
          <li>• Manipuler avec précaution</li>
          <li>• Débrancher avant de modifier</li>
          <li>• Demander l'aide d'un adulte</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-red-600 dark:text-red-400 mb-2">❌ À Ne Pas Faire</h4>
        <ul class="text-sm space-y-1">
          <li>• JAMAIS toucher aux prises murales</li>
          <li>• Ne pas court-circuiter la pile</li>
          <li>• Éviter l'eau près des circuits</li>
          <li>• Ne pas laisser chauffer les fils</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Conducteur ou Isolant ?</h3>
    <p class="mb-4">Classe les matériaux suivants en conducteurs (C) ou isolants (I) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Fil de cuivre <span class="ml-4">_____</span></li>
      <li>Règle en plastique <span class="ml-4">_____</span></li>
      <li>Clou en fer <span class="ml-4">_____</span></li>
      <li>Morceau de bois <span class="ml-4">_____</span></li>
      <li>Feuille d'aluminium <span class="ml-4">_____</span></li>
      <li>Gomme en caoutchouc <span class="ml-4">_____</span></li>
      <li>Mine de crayon (graphite) <span class="ml-4">_____</span></li>
      <li>Papier <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Circuit Ouvert ou Fermé ?</h3>
    <p class="mb-4">Pour chaque situation, indique si le circuit est ouvert (O) ou fermé (F) et si l'ampoule s'allume :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Tous les fils sont bien connectés. <span class="ml-4">Circuit : _____ Ampoule : _____</span></li>
      <li>Un fil est déconnecté de la pile. <span class="ml-4">Circuit : _____ Ampoule : _____</span></li>
      <li>Un morceau de plastique coupe le circuit. <span class="ml-4">Circuit : _____ Ampoule : _____</span></li>
      <li>Un interrupteur fermé complète le circuit. <span class="ml-4">Circuit : _____ Ampoule : _____</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Dessine un Circuit</h3>
    <p class="mb-4">Dessine un circuit électrique simple comprenant :</p>
    <ul class="list-disc list-inside mb-4 space-y-1">
      <li>Une pile</li>
      <li>Une ampoule</li>
      <li>Deux fils conducteurs</li>
    </ul>
    <p class="text-sm text-muted-foreground">Indique les bornes + et - de la pile et le sens de circulation de l'électricité.</p>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Questions de Réflexion</h3>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Pourquoi les fils électriques sont-ils recouverts de plastique ?</li>
      <li>Qu'arrive-t-il si on enlève l'ampoule du circuit ?</li>
      <li>Peut-on allumer l'ampoule avec une seule pile et un seul fil ? Explique.</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/circuit-electrique-lesson-music.mp3"
  },

  "courts-circuits": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier la cause et constater les effets d'un court-circuit
• Identifier un moyen de prévenir un court-circuit : l'interrupteur thermique (ou fusible)`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Les courts-circuits peuvent être dangereux ! Comprendre ce qu'ils sont et comment les prévenir est essentiel pour la sécurité électrique.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">⚠️ Le saviez-vous ?</p>
    <p>Un court-circuit peut générer une chaleur intense pouvant atteindre plusieurs centaines de degrés en quelques secondes !</p>
  </div>
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Identifier la cause d'un court-circuit</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Comprendre les effets dangereux</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Connaître les moyens de protection</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚡ Qu'est-ce qu'un Court-Circuit ?</h2>
    <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
      <p class="leading-relaxed mb-4">
        Un <strong>court-circuit</strong> se produit quand l'électricité trouve un chemin plus court que prévu,
        contournant les appareils du circuit. Le courant devient très fort et peut causer des accidents.
      </p>
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
        <h4 class="font-bold text-red-700 dark:text-red-300 mb-3">🔍 Définition Simple</h4>
        <p class="mb-3">Un court-circuit = contact direct entre les deux bornes de la pile (+ et -) sans passer par un récepteur (ampoule, moteur, etc.)</p>
        <div class="p-3 bg-red-100 dark:bg-red-900/40 rounded">
          <p class="text-sm font-semibold">⚠️ Résultat : Courant très intense → Danger !</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔥 Causes d'un Court-Circuit</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">Fil Nu en Contact</h3>
        <p class="text-sm mb-3">Deux fils électriques sans isolation qui se touchent</p>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <p class="text-xs">→ Les bornes + et - se touchent directement</p>
        </div>
      </div>
      
      <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-4">Objet Métallique</h3>
        <p class="text-sm mb-3">Un objet conducteur (clé, fourchette) touche les deux bornes</p>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <p class="text-xs">→ Crée un chemin direct pour l'électricité</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">Isolation Abîmée</h3>
        <p class="text-sm mb-3">Le plastique protecteur des fils est usé ou cassé</p>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <p class="text-xs">→ Les fils nus peuvent se toucher</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
        <h3 class="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">Surtension</h3>
        <p class="text-sm mb-3">Trop de tension peut endommager les isolants</p>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <p class="text-xs">→ L'isolation fond et expose les fils</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💥 Effets d'un Court-Circuit</h2>
    <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
      <div class="grid md:grid-cols-3 gap-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <div class="text-3xl mb-2">🔥</div>
          <h4 class="font-bold mb-2">Chaleur Intense</h4>
          <p class="text-sm">Les fils chauffent très rapidement et peuvent fondre ou brûler</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <div class="text-3xl mb-2">⚡</div>
          <h4 class="font-bold mb-2">Étincelles</h4>
          <p class="text-sm">Des étincelles peuvent apparaître au point de contact</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <div class="text-3xl mb-2">🔋</div>
          <h4 class="font-bold mb-2">Pile Épuisée</h4>
          <p class="text-sm">La pile se vide très vite et peut être endommagée</p>
        </div>
      </div>
      
      <div class="mt-6 p-4 bg-red-100 dark:bg-red-900/40 rounded-lg border-2 border-red-500">
        <h4 class="font-bold text-red-800 dark:text-red-200 mb-2">⚠️ DANGERS :</h4>
        <ul class="text-sm space-y-1">
          <li>• Risque d'incendie</li>
          <li>• Brûlures graves</li>
          <li>• Dommages aux appareils électriques</li>
          <li>• Électrocution possible</li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🛡️ Protection : Le Fusible</h2>
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
      <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-4">Qu'est-ce qu'un fusible ?</h3>
      <p class="mb-4">Un <strong>fusible</strong> (ou interrupteur thermique) est un dispositif de sécurité qui coupe automatiquement le courant en cas de court-circuit.</p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-green-600 dark:text-green-400">🔬 Comment ça marche ?</h4>
        <div class="space-y-3">
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded border-l-4 border-green-500">
            <p class="font-semibold mb-1">1. Fil Fusible Fin</p>
            <p class="text-sm">Le fusible contient un fil très fin qui conduit l'électricité</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded border-l-4 border-green-500">
            <p class="font-semibold mb-1">2. Détection de Surchauffe</p>
            <p class="text-sm">Si le courant devient trop fort, le fil chauffe rapidement</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded border-l-4 border-green-500">
            <p class="font-semibold mb-1">3. Rupture Automatique</p>
            <p class="text-sm">Le fil fond et casse → le circuit s'ouvre → danger écarté</p>
          </div>
        </div>
      </div>

      <div class="mt-6 grid md:grid-cols-2 gap-4">
        <div class="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">✅ Types de fusibles</h4>
          <ul class="text-sm space-y-1">
            <li>• Fusible à fil (classique)</li>
            <li>• Disjoncteur (réarmable)</li>
            <li>• Fusible cartouche</li>
            <li>• Coupe-circuit automatique</li>
          </ul>
        </div>
        <div class="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
          <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">🔑 Rôle du fusible</h4>
          <ul class="text-sm space-y-1">
            <li>• Protège les personnes</li>
            <li>• Évite les incendies</li>
            <li>• Protège les appareils</li>
            <li>• Coupe instantanément</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
    <h2 class="text-2xl font-bold text-blue-800 dark:text-blue-200 mb-4">⚠️ Règles de Sécurité</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">✅ À Faire</h4>
        <ul class="text-sm space-y-1">
          <li>• Vérifier l'état des fils</li>
          <li>• Utiliser des fusibles adaptés</li>
          <li>• Débrancher avant réparation</li>
          <li>• Faire vérifier par un adulte</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-red-600 dark:text-red-400 mb-2">❌ À Éviter</h4>
        <ul class="text-sm space-y-1">
          <li>• Toucher des fils dénudés</li>
          <li>• Court-circuiter volontairement</li>
          <li>• Remplacer par un fil normal</li>
          <li>• Ignorer un fusible grillé</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Identifier les Causes</h3>
    <p class="mb-4">Pour chaque situation, indique si elle peut causer un court-circuit (OUI / NON) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Deux fils avec isolation intacte qui se croisent <span class="ml-4">_____</span></li>
      <li>Une fourchette touchant les deux bornes d'une prise <span class="ml-4">_____</span></li>
      <li>Un fil avec plastique abîmé <span class="ml-4">_____</span></li>
      <li>Un fusible dans le circuit <span class="ml-4">_____</span></li>
      <li>Deux fils nus qui se touchent <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Vrai ou Faux</h3>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Un court-circuit fait chauffer les fils. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Le fusible protège contre les courts-circuits. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Un court-circuit ne présente aucun danger. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>On peut remplacer un fusible par un fil normal. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Le fusible fond quand le courant est trop fort. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Le Fusible</h3>
    <p class="mb-4">Complète les phrases suivantes :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Le fusible contient un fil très __________ qui fond facilement.</li>
      <li>Quand le courant est trop fort, le fusible __________ et coupe le circuit.</li>
      <li>Le fusible protège contre les __________.</li>
      <li>Après utilisation, un fusible doit être __________ car il ne fonctionne plus.</li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Situation Pratique</h3>
    <p class="mb-4">Dans ton circuit avec une pile et une ampoule, le fusible grille soudainement.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Quelle pourrait être la cause ?</li>
      <li>Que dois-tu faire en premier ?</li>
      <li>Pourquoi est-ce dangereux de remplacer le fusible par un fil normal ?</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/courts-circuits-lesson-music.mp3"
  },

  "pile-electrique": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les éléments constitutifs de la pile électrique`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    La pile électrique est une source d'énergie portable qui nous permet de faire fonctionner nos appareils partout !
    Découvrons comment elle est construite et comment elle fonctionne.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔋 Le saviez-vous ?</p>
    <p>La première pile a été inventée par Alessandro Volta en 1800. C'est de son nom que vient le mot "volt" !</p>
  </div>
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectif de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Identifier les éléments constitutifs de la pile électrique</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔋 Structure d'une Pile</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        Une pile électrique transforme l'<strong>énergie chimique</strong> en <strong>énergie électrique</strong>.
        Elle est composée de plusieurs éléments essentiels.
      </p>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">⊕ Borne Positive (+)</h4>
          <ul class="text-sm space-y-2">
            <li>• Appelée aussi "pôle +"</li>
            <li>• Généralement marquée en rouge</li>
            <li>• Point de départ du courant électrique (convention)</li>
            <li>• Souvent une tige de carbone (graphite)</li>
          </ul>
        </div>
        
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">⊖ Borne Négative (-)</h4>
          <ul class="text-sm space-y-2">
            <li>• Appelée aussi "pôle -"</li>
            <li>• Généralement marquée en noir ou bleu</li>
            <li>• Point d'arrivée du courant (convention)</li>
            <li>• Souvent en zinc</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">💧 Électrolyte</h4>
          <ul class="text-sm space-y-2">
            <li>• Substance chimique (pâte ou liquide)</li>
            <li>• Permet les réactions chimiques</li>
            <li>• Produit l'électricité</li>
            <li>• Ne doit jamais fuir !</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">🛡️ Enveloppe</h4>
          <ul class="text-sm space-y-2">
            <li>• Protège l'intérieur</li>
            <li>• Contient l'électrolyte</li>
            <li>• En métal ou plastique</li>
            <li>• Porte les informations (voltage)</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚡ Types de Piles</h2>
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-4">Pile Ronde (Cylindrique)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2">Caractéristiques :</h4>
            <ul class="text-sm space-y-1">
              <li>• Voltage : 1,5 V</li>
              <li>• Forme : cylindre</li>
              <li>• Tailles : AAA, AA, C, D</li>
              <li>• Usage : lampes, jouets, radios</li>
            </ul>
          </div>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2">Identification :</h4>
            <ul class="text-sm space-y-1">
              <li>• Borne + : en haut (bouton)</li>
              <li>• Borne - : en bas (plate)</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">Pile Plate (Rectangulaire)</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2">Caractéristiques :</h4>
            <ul class="text-sm space-y-1">
              <li>• Voltage : 4,5 V ou 9 V</li>
              <li>• Forme : rectangle</li>
              <li>• Plus puissante qu'une pile ronde</li>
              <li>• Usage : radios, détecteurs de fumée</li>
            </ul>
          </div>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2">Identification :</h4>
            <ul class="text-sm space-y-1">
              <li>• Deux bornes sur le dessus</li>
              <li>• Marquées + et -</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
    <h2 class="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-4">🔋 Durée de Vie des Piles</h2>
    <div class="space-y-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold mb-2">Facteurs qui épuisent la pile :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">⏱️</span>
            <span>Utilisation prolongée</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">🔥</span>
            <span>Températures extrêmes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">⚡</span>
            <span>Court-circuit</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-purple-600 dark:text-purple-400">📅</span>
            <span>Vieillissement naturel</span>
          </li>
        </ul>
      </div>
      
      <div class="p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
        <h4 class="font-bold text-green-700 dark:text-green-300 mb-2">♻️ Recyclage Important</h4>
        <p class="text-sm">Les piles contiennent des produits chimiques polluants. Ne les jette jamais à la poubelle ! Apporte-les dans un point de collecte.</p>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Structure de la Pile</h3>
    <p class="mb-4">Nomme les 4 éléments constitutifs d'une pile :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>_____________________________</li>
      <li>_____________________________</li>
      <li>_____________________________</li>
      <li>_____________________________</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Types de Piles</h3>
    <p class="mb-4">Complète le tableau :</p>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300">
        <thead class="bg-accent/20">
          <tr>
            <th class="border p-2">Type de pile</th>
            <th class="border p-2">Voltage</th>
            <th class="border p-2">Exemple d'utilisation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border p-2">Pile ronde AA</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
          </tr>
          <tr>
            <td class="border p-2">Pile plate</td>
            <td class="border p-2">_______</td>
            <td class="border p-2">_______</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Questions de Compréhension</h3>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Quelle forme d'énergie la pile transforme-t-elle en électricité ?</li>
      <li>Quelle est la différence entre la borne + et la borne - ?</li>
      <li>Quel est le rôle de l'électrolyte dans une pile ?</li>
      <li>Pourquoi doit-on recycler les piles usagées ?</li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Dessine une Pile</h3>
    <p class="mb-4">Dessine une pile et indique sur ton schéma :</p>
    <ul class="list-disc list-inside space-y-1">
      <li>La borne positive (+)</li>
      <li>La borne négative (-)</li>
      <li>L'enveloppe protectrice</li>
      <li>Le voltage</li>
    </ul>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/pile-electrique-lesson-music.mp3"
  },

  "montage-serie": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Réaliser un montage de piles en série et en faire les schémas`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Quand une seule pile ne suffit pas, on peut en assembler plusieurs ! Le montage en série augmente la tension pour obtenir plus de puissance.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔋 Le saviez-vous ?</p>
    <p>Les télécommandes et lampes torches utilisent souvent 2 ou 4 piles en série pour obtenir la tension nécessaire !</p>
  </div>
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectif de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Réaliser un montage de piles en série et en faire les schémas</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔗 Montage en Série : Principe</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <p class="leading-relaxed mb-4">
        Dans un <strong>montage en série</strong>, les piles sont connectées bout à bout :
        la borne + d'une pile est reliée à la borne - de la suivante.
      </p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-purple-600 dark:text-purple-400">📍 Comment Brancher ?</h4>
        <div class="space-y-3">
          <div class="p-3 bg-purple-100 dark:bg-purple-900/50 rounded">
            <p class="font-semibold mb-1">Pile 1 :</p>
            <p class="text-sm">Borne + libre → Borne - connectée à...</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/50 rounded">
            <p class="font-semibold mb-1">Pile 2 :</p>
            <p class="text-sm">Borne + (reliée à pile 1) → Borne - connectée à...</p>
          </div>
          <div class="p-3 bg-purple-100 dark:bg-purple-900/50 rounded">
            <p class="font-semibold mb-1">Pile 3 :</p>
            <p class="text-sm">Borne + (reliée à pile 2) → Borne - libre</p>
          </div>
        </div>
        <div class="mt-4 p-3 bg-purple-100 dark:bg-purple-900/40 rounded">
          <p class="font-semibold text-sm">💡 Schéma :</p>
          <p class="text-sm font-mono">(-) [Pile 1] (+)➜(-)  [Pile 2] (+)➜(-) [Pile 3] (+)</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚡ Tension Totale</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">Addition des Tensions</h3>
      <p class="mb-4">En série, les tensions s'<strong>additionnent</strong> !</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
          <p class="font-mono text-lg text-center bg-blue-100 dark:bg-blue-900/50 p-3 rounded">
            V_totale = V₁ + V₂ + V₃ + ...
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-4">
          <div class="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
            <p class="font-bold mb-2">Exemple 1 :</p>
            <p class="text-sm">2 piles de 1,5 V</p>
            <p class="text-sm font-mono">= 1,5 + 1,5</p>
            <p class="text-sm font-bold">= 3 V</p>
          </div>
          
          <div class="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
            <p class="font-bold mb-2">Exemple 2 :</p>
            <p class="text-sm">3 piles de 1,5 V</p>
            <p class="text-sm font-mono">= 1,5 + 1,5 + 1,5</p>
            <p class="text-sm font-bold">= 4,5 V</p>
          </div>
          
          <div class="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
            <p class="font-bold mb-2">Exemple 3 :</p>
            <p class="text-sm">4 piles de 1,5 V</p>
            <p class="text-sm font-mono">= 6 V</p>
          </div>
        </div>
      </div>
      
      <div class="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg">
        <p class="font-semibold mb-2">💡 Conséquence :</p>
        <p class="text-sm">Plus il y a de piles en série → Plus la tension est grande → Plus l'ampoule brille fort !</p>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
    <h2 class="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">✅ Avantages et Précautions</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-2">Avantages :</h4>
        <ul class="text-sm space-y-1">
          <li>✓ Augmente la tension</li>
          <li>✓ Plus de puissance</li>
          <li>✓ Ampoule plus brillante</li>
          <li>✓ Moteurs plus rapides</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold text-orange-600 dark:text-orange-400 mb-2">Précautions :</h4>
        <ul class="text-sm space-y-1">
          <li>⚠️ Respecter les polarités</li>
          <li>⚠️ Piles même type/voltage</li>
          <li>⚠️ Ne pas dépasser tension recommandée</li>
          <li>⚠️ Surveiller la chaleur</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Calcul de Tension</h3>
    <p class="mb-4">Calcule la tension totale pour chaque montage en série :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>3 piles de 1,5 V = __________</li>
      <li>2 piles de 4,5 V = __________</li>
      <li>5 piles de 1,5 V = __________</li>
      <li>1 pile de 9 V + 2 piles de 1,5 V = __________</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Schéma</h3>
    <p class="mb-4">Dessine le schéma d'un montage en série avec :</p>
    <ul class="list-disc list-inside space-y-1">
      <li>3 piles de 1,5 V</li>
      <li>1 ampoule</li>
    </ul>
    <p class="text-sm text-muted-foreground mt-3">N'oublie pas d'indiquer les polarités (+) et (-) !</p>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Vrai ou Faux</h3>
    <ol class="space-y-2 list-decimal list-inside">
      <li>En série, on connecte + avec +. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Les tensions s'additionnent en série. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>Plus de piles = plus de puissance. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
      <li>On peut mélanger piles neuves et usées. <span class="ml-4 text-muted-foreground">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Problème</h3>
    <p class="mb-4">Tu as des piles de 1,5 V et tu as besoin de 6 V pour faire fonctionner un appareil.</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Combien de piles dois-tu utiliser ?</li>
      <li>Comment vas-tu les brancher ?</li>
      <li>Dessine le schéma du montage.</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/montage-serie-lesson-music.mp3"
  },

  "montage-parallele": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Réaliser un montage de piles en parallèle
• Comprendre la technique du montage en parallèle`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Le montage en parallèle est différent du montage en série ! Au lieu d'augmenter la tension, il prolonge la durée de vie du circuit.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🔋 Le saviez-vous ?</p>
    <p>Les grands systèmes électriques utilisent souvent des montages mixtes (série + parallèle) pour optimiser puissance et durée !</p>
  </div>
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Réaliser un montage de piles en parallèle</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Comprendre les différences avec le montage en série</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔗 Montage en Parallèle : Principe</h2>
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
      <p class="leading-relaxed mb-4">
        Dans un <strong>montage en parallèle</strong>, toutes les bornes positives (+) sont connectées ensemble,
        et toutes les bornes négatives (-) sont connectées ensemble.
      </p>
      
      <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg space-y-4">
        <h4 class="font-bold text-green-600 dark:text-green-400">📍 Comment Brancher ?</h4>
        <div class="space-y-3">
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded">
            <p class="font-semibold mb-1">Toutes les bornes + ensemble :</p>
            <p class="text-sm">Pile 1 (+) ━━ Pile 2 (+) ━━ Pile 3 (+)</p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded">
            <p class="font-semibold mb-1">Toutes les bornes - ensemble :</p>
            <p class="text-sm">Pile 1 (-) ━━ Pile 2 (-) ━━ Pile 3 (-)</p>
          </div>
        </div>
        <div class="mt-4 p-3 bg-green-100 dark:bg-green-900/40 rounded">
          <p class="font-semibold text-sm">💡 Résultat :</p>
          <p class="text-sm">Les piles travaillent ensemble comme une seule grande pile !</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">📊 Série vs Parallèle</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300 dark:border-gray-600">
        <thead class="bg-primary/20">
          <tr>
            <th class="border p-3 text-left">Caractéristique</th>
            <th class="border p-3 text-left">Montage en Série</th>
            <th class="border p-3 text-left">Montage en Parallèle</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border p-3 font-semibold">Connexion</td>
            <td class="border p-3">+ avec - (bout à bout)</td>
            <td class="border p-3">+ avec +, - avec -</td>
          </tr>
          <tr>
            <td class="border p-3 font-semibold">Tension totale</td>
            <td class="border p-3">V₁ + V₂ + V₃...</td>
            <td class="border p-3">Reste V (identique)</td>
          </tr>
          <tr>
            <td class="border p-3 font-semibold">Effet sur ampoule</td>
            <td class="border p-3">Brille plus fort</td>
            <td class="border p-3">Brille normalement</td>
          </tr>
          <tr>
            <td class="border p-3 font-semibold">Durée de vie</td>
            <td class="border p-3">Normale</td>
            <td class="border p-3">Plus longue</td>
          </tr>
          <tr>
            <td class="border p-3 font-semibold">Usage</td>
            <td class="border p-3">Besoin de plus de puissance</td>
            <td class="border p-3">Besoin de plus d'autonomie</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
    <h2 class="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-4">🎯 Applications Pratiques</h2>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold mb-2">📱 Montage Série :</h4>
        <ul class="text-sm space-y-1">
          <li>• Lampes torches puissantes</li>
          <li>• Jouets électroniques</li>
          <li>• Appareils photo</li>
        </ul>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <h4 class="font-bold mb-2">🔋 Montage Parallèle :</h4>
        <ul class="text-sm space-y-1">
          <li>• Systèmes de secours</li>
          <li>• Appareils longue durée</li>
          <li>• Alimentation de sauvegarde</li>
        </ul>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Tension</h3>
    <p class="mb-4">Calcule la tension pour chaque montage :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>3 piles de 1,5 V en parallèle : __________</li>
      <li>3 piles de 1,5 V en série : __________</li>
      <li>2 piles de 4,5 V en parallèle : __________</li>
      <li>2 piles de 4,5 V en série : __________</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Identification</h3>
    <p class="mb-4">Pour chaque description, indique s'il s'agit d'un montage en série (S) ou en parallèle (P) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Les tensions s'additionnent <span class="ml-4">_____</span></li>
      <li>Toutes les bornes + sont reliées ensemble <span class="ml-4">_____</span></li>
      <li>Les piles sont bout à bout <span class="ml-4">_____</span></li>
      <li>La tension reste identique <span class="ml-4">_____</span></li>
      <li>Augmente la durée de vie <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Choix du Montage</h3>
    <p class="mb-4">Pour chaque besoin, choisis le montage approprié (Série / Parallèle) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Tu veux une lampe très brillante. <span class="ml-4">__________</span></li>
      <li>Tu veux que ton appareil fonctionne plus longtemps. <span class="ml-4">__________</span></li>
      <li>Tu as besoin de 9 V avec des piles de 1,5 V. <span class="ml-4">__________</span></li>
      <li>Tu veux économiser tes piles. <span class="ml-4">__________</span></li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Application</h3>
    <p class="mb-4">Tu as 4 piles de 1,5 V.</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Quelle tension obtiendras-tu en les montant toutes en série ?</li>
      <li>Quelle tension obtiendras-tu en les montant toutes en parallèle ?</li>
      <li>Quel montage choisir pour une lampe très puissante ? Pourquoi ?</li>
    </ol>
  </div>
</div>`,
    musicUrl: "/lovable-uploads/montage-parallele-lesson-music.mp3"
  },

  // BIOLOGIE - Les vertébrés
  "classification-vertebres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Distinguer les vertébrés des invertébrés
• Classer en cinq (5) grands groupes les vertébrés, tenant compte de leur morphologie
• Spécifier les caractéristiques des mammifères, oiseaux, reptiles, batraciens et poissons`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  "deplacements-vertebres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Distinguer les diverses façons de se mouvoir sur le sol, dans l'eau et dans l'air
• Expliquer le rôle des os et des muscles pour l'exécution des mouvements
• Spécifier les caractéristiques de la marche, de la course, du saut et de la reptation
• Reconnaître les modes de déplacement dans l'eau et dans l'air`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Les vertébrés ont développé une incroyable variété de moyens pour se déplacer : marcher, courir, sauter, nager, voler... 
    Chaque mode de déplacement est adapté à leur milieu de vie et à leurs besoins !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🦅 Le saviez-vous ?</p>
    <p>Le guépard est l'animal terrestre le plus rapide au monde : il peut atteindre 120 km/h en quelques secondes !
    Le faucon pèlerin en piqué peut dépasser 380 km/h, ce qui en fait l'animal le plus rapide de la planète !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Distinguer les diverses façons de se mouvoir sur le sol, dans l'eau et dans l'air</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Expliquer le rôle des os et des muscles pour l'exécution des mouvements</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier les caractéristiques de la marche, de la course, du saut et de la reptation</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Reconnaître les modes de déplacement dans l'eau et dans l'air</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🦴 Le Squelette et les Muscles</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        Pour se déplacer, les vertébrés utilisent un système composé de <strong>deux éléments essentiels</strong> :
      </p>
      <div class="grid md:grid-cols-2 gap-6 mt-4">
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">🦴 Le Squelette (Os)</h4>
          <ul class="space-y-2 text-sm">
            <li>• Structure rigide du corps</li>
            <li>• Soutient le corps</li>
            <li>• Protège les organes internes</li>
            <li>• Points d'attache pour les muscles</li>
            <li>• Permet les mouvements grâce aux articulations</li>
          </ul>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">💪 Les Muscles</h4>
          <ul class="space-y-2 text-sm">
            <li>• Tissus capables de se contracter</li>
            <li>• Attachés aux os par des tendons</li>
            <li>• Se contractent (raccourcissent) et se relâchent</li>
            <li>• Tirent sur les os pour créer le mouvement</li>
            <li>• Travaillent par paires (un muscle tire, l'autre relâche)</li>
          </ul>
        </div>
      </div>
      <div class="mt-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
        <p class="font-semibold mb-2">💡 Comment ça marche ?</p>
        <p class="text-sm">Quand tu plies ton bras, le muscle biceps se contracte (devient plus court et plus gros) tandis que le muscle triceps 
        se relâche. Pour tendre le bras, c'est l'inverse : le triceps se contracte et le biceps se relâche.</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🚶 Déplacements sur le Sol</h2>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">🚶‍♂️ La Marche</h3>
        <p class="mb-3">Mode de déplacement lent et stable où au moins un pied touche toujours le sol.</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <p class="font-semibold mb-2">Caractéristiques :</p>
          <ul class="space-y-1 text-sm">
            <li>• Mouvement alterné des membres</li>
            <li>• Contact permanent avec le sol</li>
            <li>• Économe en énergie</li>
            <li>• Exemples : humain qui marche, éléphant, tortue</li>
          </ul>
        </div>
      </div>

      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-3">🏃 La Course</h3>
        <p class="mb-3">Mode de déplacement rapide avec des phases où le corps ne touche pas le sol.</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <p class="font-semibold mb-2">Caractéristiques :</p>
          <ul class="space-y-1 text-sm">
            <li>• Mouvements rapides et puissants</li>
            <li>• Phases de suspension (aucun contact avec le sol)</li>
            <li>• Consomme beaucoup d'énergie</li>
            <li>• Exemples : guépard, cheval au galop, humain qui court</li>
          </ul>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">🦘 Le Saut</h3>
        <p class="mb-3">Déplacement par bonds, le corps quitte complètement le sol.</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <p class="font-semibold mb-2">Caractéristiques :</p>
          <ul class="space-y-1 text-sm">
            <li>• Propulsion puissante des pattes arrière</li>
            <li>• Corps entièrement en l'air</li>
            <li>• Permet de franchir des obstacles</li>
            <li>• Exemples : kangourou, lapin, grenouille, sauterelle</li>
          </ul>
        </div>
      </div>

      <div class="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30 p-6 rounded-lg border-2 border-gray-200 dark:border-gray-800">
        <h3 class="text-xl font-bold text-gray-700 dark:text-gray-300 mb-3">🐍 La Reptation</h3>
        <p class="mb-3">Déplacement en rampant, le ventre touche le sol.</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <p class="font-semibold mb-2">Caractéristiques :</p>
          <ul class="space-y-1 text-sm">
            <li>• Corps en contact avec le sol</li>
            <li>• Ondulations latérales du corps</li>
            <li>• Pas de membres ou membres très courts</li>
            <li>• Exemples : serpent, ver de terre, certains lézards</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌊 Déplacements dans l'Eau</h2>
    <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
      <h3 class="text-xl font-bold text-cyan-700 dark:text-cyan-300 mb-4">🏊 La Nage</h3>
      <p class="mb-4">Les vertébrés aquatiques utilisent différentes techniques pour se déplacer dans l'eau :</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🐟 Poissons</h4>
          <ul class="text-sm space-y-1">
            <li>• Ondulations latérales du corps</li>
            <li>• Nageoires pour la direction et l'équilibre</li>
            <li>• Queue puissante pour la propulsion</li>
          </ul>
        </div>
        
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🐸 Amphibiens (grenouilles)</h4>
          <ul class="text-sm space-y-1">
            <li>• Pattes arrière palmées</li>
            <li>• Mouvements de brasse</li>
            <li>• Corps hydrodynamique</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🐢 Reptiles aquatiques (tortues marines)</h4>
          <ul class="text-sm space-y-1">
            <li>• Pattes transformées en palettes natatoires</li>
            <li>• Mouvements de rame</li>
            <li>• Carapace hydrodynamique</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🐋 Mammifères marins (dauphins, baleines)</h4>
          <ul class="text-sm space-y-1">
            <li>• Nageoire caudale horizontale (battements verticaux)</li>
            <li>• Corps très profilé</li>
            <li>• Nageoires pectorales pour la direction</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🦅 Déplacements dans l'Air</h2>
    <div class="bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/30 dark:to-indigo-950/30 p-6 rounded-lg border-2 border-sky-200 dark:border-sky-800">
      <h3 class="text-xl font-bold text-sky-700 dark:text-sky-300 mb-4">✈️ Le Vol</h3>
      <p class="mb-4">Seuls les oiseaux (et les chauves-souris parmi les mammifères) peuvent vraiment voler :</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">Adaptations pour le vol :</h4>
          <ul class="space-y-2 text-sm">
            <li>• <strong>Ailes</strong> : Membres transformés en surfaces portantes</li>
            <li>• <strong>Plumes</strong> : Légères et résistantes, créent une surface aérodynamique</li>
            <li>• <strong>Os creux</strong> : Squelette léger mais solide</li>
            <li>• <strong>Muscles puissants</strong> : Muscles pectoraux très développés</li>
            <li>• <strong>Corps profilé</strong> : Forme aérodynamique pour réduire la résistance de l'air</li>
            <li>• <strong>Métabolisme rapide</strong> : Grande production d'énergie</li>
          </ul>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
            <h4 class="font-bold mb-2">🦅 Vol battu</h4>
            <p class="text-sm">L'oiseau bat des ailes de haut en bas pour se propulser et se maintenir en l'air.</p>
            <p class="text-sm mt-2"><strong>Exemples :</strong> moineau, pigeon, colibri</p>
          </div>
          
          <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
            <h4 class="font-bold mb-2">🦅 Vol plané</h4>
            <p class="text-sm">L'oiseau étend ses ailes et utilise les courants d'air sans battre des ailes.</p>
            <p class="text-sm mt-2"><strong>Exemples :</strong> aigle, albatros, vautour</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border-2 border-yellow-300 dark:border-yellow-700">
    <h2 class="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">📊 Tableau Comparatif des Déplacements</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-yellow-200 dark:bg-yellow-800">
          <tr>
            <th class="border border-yellow-400 dark:border-yellow-600 p-2">Mode</th>
            <th class="border border-yellow-400 dark:border-yellow-600 p-2">Milieu</th>
            <th class="border border-yellow-400 dark:border-yellow-600 p-2">Caractéristiques</th>
            <th class="border border-yellow-400 dark:border-yellow-600 p-2">Exemples</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Marche</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Sol</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Lent, contact permanent</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Humain, éléphant</td>
          </tr>
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Course</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Sol</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Rapide, phases aériennes</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Guépard, cheval</td>
          </tr>
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Saut</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Sol</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Bonds, propulsion</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Kangourou, grenouille</td>
          </tr>
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Reptation</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Sol</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Rampant, ondulations</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Serpent, ver</td>
          </tr>
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Nage</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Eau</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Ondulations, nageoires</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Poisson, dauphin</td>
          </tr>
          <tr>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2 font-semibold">Vol</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Air</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Ailes, plumes</td>
            <td class="border border-yellow-400 dark:border-yellow-600 p-2">Aigle, pigeon</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Classification des Déplacements</h3>
    <p class="mb-4">Indique le mode de déplacement principal de chaque animal :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Serpent : __________</li>
      <li>Aigle : __________</li>
      <li>Dauphin : __________</li>
      <li>Kangourou : __________</li>
      <li>Guépard : __________</li>
      <li>Grenouille (dans l'eau) : __________</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Vrai ou Faux</h3>
    <p class="mb-4">Indique si chaque affirmation est vraie (V) ou fausse (F) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Les muscles se contractent pour créer le mouvement <span class="ml-4">_____</span></li>
      <li>Pendant la marche, il y a toujours au moins un pied au sol <span class="ml-4">_____</span></li>
      <li>Les serpents ont des pattes pour ramper <span class="ml-4">_____</span></li>
      <li>Tous les oiseaux peuvent voler <span class="ml-4">_____</span></li>
      <li>Les poissons nagent grâce aux ondulations de leur corps <span class="ml-4">_____</span></li>
      <li>Le squelette protège les organes internes <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Rôle des Os et Muscles</h3>
    <p class="mb-4">Complète le texte avec les mots suivants : <em>os, muscles, articulations, tendons, se contractent</em></p>
    <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg space-y-2 text-sm">
      <p>Pour bouger, nous utilisons nos __________ et nos __________. Les muscles sont attachés aux os par des __________. 
      Quand les muscles __________, ils tirent sur les os. Les __________ permettent aux os de bouger les uns par rapport aux autres.</p>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Adaptations au Milieu</h3>
    <p class="mb-4">Associe chaque adaptation à son milieu de vie :</p>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <p class="font-semibold mb-2">Adaptations :</p>
        <ol class="space-y-1 text-sm list-decimal list-inside">
          <li>Nageoires</li>
          <li>Ailes et plumes</li>
          <li>Pattes puissantes</li>
          <li>Corps allongé sans pattes</li>
        </ol>
      </div>
      <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
        <p class="font-semibold mb-2">Milieux :</p>
        <ul class="space-y-1 text-sm">
          <li>A) Course rapide sur le sol</li>
          <li>B) Vol dans les airs</li>
          <li>C) Nage dans l'eau</li>
          <li>D) Reptation sur le sol</li>
        </ul>
      </div>
    </div>
  </div>
</div>`
  },

  "nutrition-vertebres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître la nécessité pour les vertébrés de se nourrir et les diverses façons d'y parvenir
• Reconnaître que l'alimentation est indispensable à la vie
• Distinguer les diverses façons de se nourrir des végétariens
• Préciser le mode de consommation et de digestion d'un oiseau et d'un ruminant`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Tous les vertébrés ont besoin de se nourrir pour vivre, grandir et avoir de l'énergie. 
    Mais selon ce qu'ils mangent, ils ont développé des techniques et des organes très différents !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🦒 Le saviez-vous ?</p>
    <p>Une girafe peut manger jusqu'à 30 kg de feuilles par jour ! Les vaches ont 4 estomacs pour mieux digérer l'herbe.
    Le colibri mange plus que son propre poids chaque jour en nectar pour avoir l'énergie de battre des ailes 80 fois par seconde !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Reconnaître la nécessité pour les vertébrés de se nourrir</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Distinguer les diverses façons de se nourrir</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Préciser le mode de consommation et de digestion</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🍽️ Pourquoi Manger ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        <strong>L'alimentation est indispensable à la vie</strong> de tous les vertébrés pour trois raisons principales :
      </p>
      <div class="grid md:grid-cols-3 gap-4 mt-4">
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">⚡ Énergie</h4>
          <p class="text-sm">Fournir l'énergie nécessaire pour bouger, respirer, maintenir la température du corps</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">📈 Croissance</h4>
          <p class="text-sm">Permettre la croissance et le développement du corps</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-2">🔧 Réparation</h4>
          <p class="text-sm">Réparer et renouveler les cellules du corps</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🥗 Les Différents Régimes Alimentaires</h2>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">🌱 Les Herbivores</h3>
        <p class="mb-3">Animaux qui mangent <strong>uniquement des végétaux</strong> : herbe, feuilles, fruits, graines...</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-2">Adaptations :</p>
            <ul class="space-y-1 text-sm">
              <li>• Dents plates (molaires) pour broyer les végétaux</li>
              <li>• Intestin très long pour digérer la cellulose</li>
              <li>• Certains ont plusieurs estomacs (ruminants)</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold mb-1">Exemples :</p>
            <p class="text-sm">Vache, mouton, chèvre, cheval, éléphant, lapin, girafe, koala</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-3">🦁 Les Carnivores</h3>
        <p class="mb-3">Animaux qui mangent <strong>uniquement de la viande</strong> (d'autres animaux).</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-2">Adaptations :</p>
            <ul class="space-y-1 text-sm">
              <li>• Dents pointues (canines) pour déchirer la viande</li>
              <li>• Griffes ou serres pour attraper les proies</li>
              <li>• Intestin plus court que les herbivores</li>
              <li>• Souvent chasseurs rapides et puissants</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold mb-1">Exemples :</p>
            <p class="text-sm">Lion, tigre, loup, aigle, requin, serpent, crocodile</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-3">🐻 Les Omnivores</h3>
        <p class="mb-3">Animaux qui mangent <strong>à la fois des végétaux ET de la viande</strong>.</p>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg space-y-3">
          <div>
            <p class="font-semibold mb-2">Adaptations :</p>
            <ul class="space-y-1 text-sm">
              <li>• Dentition mixte : molaires ET canines</li>
              <li>• Système digestif polyvalent</li>
              <li>• Grande capacité d'adaptation alimentaire</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold mb-1">Exemples :</p>
            <p class="text-sm">Humain, ours, cochon, rat, poule, corbeau</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🦜 Cas Particulier : Les Oiseaux</h2>
    <div class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
      <p class="mb-4">Les oiseaux n'ont <strong>pas de dents</strong> ! Ils ont développé des adaptations spéciales :</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🦜 Le Bec</h4>
          <p class="text-sm mb-2">Forme adaptée au type de nourriture :</p>
          <ul class="space-y-1 text-sm">
            <li>• <strong>Bec pointu et fin</strong> : pour attraper les insectes (moineau)</li>
            <li>• <strong>Bec court et fort</strong> : pour casser les graines (perroquet)</li>
            <li>• <strong>Bec crochu</strong> : pour déchirer la viande (aigle)</li>
            <li>• <strong>Bec long et fin</strong> : pour aspirer le nectar (colibri)</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">📦 Le Jabot et le Gésier</h4>
          <ul class="space-y-2 text-sm">
            <li>• <strong>Jabot</strong> : Poche pour stocker temporairement la nourriture</li>
            <li>• <strong>Gésier</strong> : Estomac musculeux qui broie la nourriture (remplace les dents !)
            <br/>Les oiseaux avalent souvent de petits cailloux qui aident à broyer dans le gésier</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🐄 Cas Particulier : Les Ruminants</h2>
    <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
      <p class="mb-4">Les ruminants (vache, mouton, chèvre...) ont un système digestif très spécial avec <strong>4 estomacs</strong> !</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">Les 4 Estomacs :</h4>
          <ol class="space-y-2 text-sm">
            <li><strong>1. La Panse</strong> : Premier estomac, le plus grand. L'herbe y est stockée et ramollie</li>
            <li><strong>2. Le Bonnet</strong> : Forme des petites boulettes qui remontent dans la bouche</li>
            <li><strong>3. Le Feuillet</strong> : Absorbe l'eau et filtre la nourriture</li>
            <li><strong>4. La Caillette</strong> : Vrai estomac qui digère avec des sucs gastriques</li>
          </ol>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🔄 Le Processus de Rumination :</h4>
          <ol class="space-y-2 text-sm list-decimal list-inside">
            <li>La vache avale rapidement l'herbe sans bien la mâcher</li>
            <li>L'herbe va dans la panse où elle est ramollie</li>
            <li>Des boulettes d'herbe remontent dans la bouche (régurgitation)</li>
            <li>La vache mâche longuement ces boulettes (rumination)</li>
            <li>Elle avale à nouveau, et la nourriture passe dans les autres estomacs</li>
          </ol>
        </div>

        <div class="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
          <p class="font-semibold mb-2">💡 Pourquoi 4 estomacs ?</p>
          <p class="text-sm">L'herbe contient de la cellulose, très difficile à digérer. Les 4 estomacs et la rumination 
          permettent de bien décomposer cette cellulose avec l'aide de bactéries spéciales dans la panse.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 p-6 rounded-xl border-2 border-cyan-200 dark:border-cyan-800">
    <h2 class="text-2xl font-bold text-cyan-800 dark:text-cyan-200 mb-4">📊 Tableau Comparatif</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-cyan-200 dark:bg-cyan-800">
          <tr>
            <th class="border border-cyan-400 dark:border-cyan-600 p-2">Régime</th>
            <th class="border border-cyan-400 dark:border-cyan-600 p-2">Alimentation</th>
            <th class="border border-cyan-400 dark:border-cyan-600 p-2">Dentition</th>
            <th class="border border-cyan-400 dark:border-cyan-600 p-2">Exemples</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2 font-semibold">Herbivore</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Végétaux uniquement</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Molaires plates</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Vache, lapin</td>
          </tr>
          <tr>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2 font-semibold">Carnivore</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Viande uniquement</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Canines pointues</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Lion, aigle</td>
          </tr>
          <tr>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2 font-semibold">Omnivore</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Végétaux + viande</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Mixte</td>
            <td class="border border-cyan-400 dark:border-cyan-600 p-2">Humain, ours</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Classification des Animaux</h3>
    <p class="mb-4">Classe ces animaux selon leur régime alimentaire (Herbivore / Carnivore / Omnivore) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Vache : __________</li>
      <li>Lion : __________</li>
      <li>Humain : __________</li>
      <li>Lapin : __________</li>
      <li>Aigle : __________</li>
      <li>Ours : __________</li>
      <li>Mouton : __________</li>
      <li>Requin : __________</li>
    </ol>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Les Ruminants</h3>
    <p class="mb-4">Réponds aux questions sur les ruminants :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Combien d'estomacs possède une vache ? __________</li>
      <li>Comment s'appelle l'action de remâcher la nourriture ? __________</li>
      <li>Quel est le nom du premier estomac (le plus grand) ? __________</li>
      <li>Pourquoi les ruminants ont-ils besoin de 4 estomacs ?
        <div class="ml-6 mt-2 text-sm">__________________________________________________</div>
      </li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Les Oiseaux</h3>
    <p class="mb-4">Associe chaque type de bec à son alimentation :</p>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
        <p class="font-semibold mb-2">Types de bec :</p>
        <ol class="space-y-1 text-sm list-decimal list-inside">
          <li>Bec pointu et fin</li>
          <li>Bec court et fort</li>
          <li>Bec crochu</li>
          <li>Bec long et fin</li>
        </ol>
      </div>
      <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
        <p class="font-semibold mb-2">Alimentations :</p>
        <ul class="space-y-1 text-sm">
          <li>A) Déchirer la viande</li>
          <li>B) Aspirer le nectar</li>
          <li>C) Casser les graines</li>
          <li>D) Attraper les insectes</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Adaptations</h3>
    <p class="mb-4">Explique pourquoi chaque adaptation est utile :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Les carnivores ont des canines pointues car :
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
      <li>Les herbivores ont un intestin très long car :
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
      <li>Les oiseaux ont un gésier car :
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
    </ol>
  </div>
</div>`
  },

  "respiration-vertebres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître que la respiration est une fonction indispensable à la vie
• Décrire le rôle des poumons dans la respiration comme échange de gaz entre l'air et le sang
• Spécifier que les rythmes respiratoires sont variés
• Spécifier le rôle de la peau dans la respiration des batraciens
• Préciser le mode de respiration dans l'eau (branchies des poissons)`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    La respiration est une fonction vitale ! Tous les vertébrés respirent pour obtenir l'oxygène nécessaire à leur survie,
    mais ils utilisent différents organes selon leur milieu de vie : poumons, branchies ou même la peau !
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">💨 Le saviez-vous ?</p>
    <p>Un humain respire environ 20 000 fois par jour ! Les baleines peuvent retenir leur souffle pendant plus d'une heure.
    Les grenouilles peuvent respirer par la peau sous l'eau !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Comprendre pourquoi la respiration est indispensable</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Décrire le rôle des poumons et des branchies</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Connaître les différents modes de respiration</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">💨 Pourquoi Respirer ?</h2>
    <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <p class="leading-relaxed mb-4">
        <strong>La respiration est indispensable à la vie</strong> de tous les vertébrés pour deux raisons essentielles :
      </p>
      <div class="grid md:grid-cols-2 gap-6 mt-4">
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">➕ Apporter l'oxygène (O₂)</h4>
          <p class="text-sm">L'oxygène de l'air ou de l'eau est capturé et transporté vers toutes les cellules du corps. 
          Les cellules en ont besoin pour produire de l'énergie à partir de la nourriture.</p>
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-5 rounded-lg">
          <h4 class="font-bold text-blue-600 dark:text-blue-400 mb-3">➖ Éliminer le CO₂</h4>
          <p class="text-sm">Le dioxyde de carbone (CO₂) est un déchet produit par les cellules. Il doit être éliminé 
          car il est toxique en grande quantité. Il est rejeté dans l'air ou l'eau.</p>
        </div>
      </div>
      <div class="mt-4 p-4 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
        <p class="font-semibold mb-2">⚡ L'équation de la respiration :</p>
        <p class="text-sm font-mono">Oxygène (O₂) + Nourriture → Énergie + Dioxyde de carbone (CO₂) + Eau</p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🫁 La Respiration Pulmonaire</h2>
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
      <p class="mb-4">La plupart des vertébrés terrestres respirent avec des <strong>poumons</strong>.</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🫁 Comment fonctionnent les poumons ?</h4>
          <ol class="space-y-2 text-sm list-decimal list-inside">
            <li><strong>Inspiration</strong> : L'air entre par le nez ou la bouche → passe par la trachée → 
            arrive aux poumons par les bronches</li>
            <li><strong>Échange gazeux</strong> : Dans les poumons, l'oxygène passe dans le sang à travers de minuscules 
            sacs appelés alvéoles. En même temps, le CO₂ passe du sang vers l'air</li>
            <li><strong>Expiration</strong> : L'air chargé de CO₂ est expulsé des poumons vers l'extérieur</li>
          </ol>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🐾 Animaux à respiration pulmonaire :</h4>
          <ul class="space-y-2 text-sm">
            <li>• <strong>Mammifères</strong> : humains, chats, chiens, baleines, dauphins (même dans l'eau !)</li>
            <li>• <strong>Oiseaux</strong> : aigles, pigeons, perroquets</li>
            <li>• <strong>Reptiles</strong> : serpents, lézards, tortues, crocodiles</li>
            <li>• <strong>Amphibiens adultes</strong> : grenouilles, crapauds (+ respiration cutanée)</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🐟 La Respiration Branchiale</h2>
    <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
      <p class="mb-4">Les animaux aquatiques utilisent des <strong>branchies</strong> pour respirer l'oxygène dissous dans l'eau.</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🌊 Comment fonctionnent les branchies ?</h4>
          <ol class="space-y-2 text-sm list-decimal list-inside">
            <li>Le poisson ouvre sa bouche et avale de l'eau</li>
            <li>L'eau passe sur les branchies (filaments rouges très fins et riches en vaisseaux sanguins)</li>
            <li>L'oxygène dissous dans l'eau passe dans le sang à travers les branchies</li>
            <li>Le CO₂ passe du sang dans l'eau</li>
            <li>L'eau ressort par les ouïes (ouvertures sur les côtés)</li>
          </ol>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🐠 Animaux à respiration branchiale :</h4>
          <ul class="space-y-1 text-sm">
            <li>• <strong>Poissons</strong> : tous les poissons (sardine, requin, truite...)</li>
            <li>• <strong>Têtards</strong> : larves des amphibiens avant la métamorphose</li>
            <li>• <strong>Certains crustacés</strong> : crabes, crevettes, homards</li>
          </ul>
        </div>

        <div class="mt-4 p-4 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
          <p class="font-semibold mb-2">💡 Important :</p>
          <p class="text-sm">Les branchies ne peuvent fonctionner que dans l'eau. C'est pourquoi un poisson meurt 
          rapidement hors de l'eau : ses branchies collent et ne peuvent plus capter l'oxygène de l'air.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🐸 La Respiration Cutanée</h2>
    <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
      <p class="mb-4">Les <strong>amphibiens</strong> (grenouilles, crapauds, salamandres) ont une capacité spéciale : 
      ils peuvent respirer <strong>à travers leur peau</strong> !</p>
      
      <div class="space-y-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">Comment ça marche ?</h4>
          <ul class="space-y-2 text-sm">
            <li>• La peau des amphibiens est <strong>fine, humide et perméable</strong></li>
            <li>• L'oxygène peut passer directement à travers la peau dans le sang</li>
            <li>• Le CO₂ sort également par la peau</li>
            <li>• Cette respiration est possible dans l'eau ou sur terre (si la peau reste humide)</li>
          </ul>
        </div>

        <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
          <h4 class="font-bold mb-3">🔄 Double respiration des amphibiens adultes :</h4>
          <p class="text-sm mb-2">Les grenouilles adultes utilisent <strong>deux systèmes en même temps</strong> :</p>
          <ul class="space-y-1 text-sm">
            <li>• <strong>Poumons</strong> : pour respirer l'air (principal mode hors de l'eau)</li>
            <li>• <strong>Peau</strong> : complément, surtout utile dans l'eau ou en hibernation</li>
          </ul>
        </div>

        <div class="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
          <p class="font-semibold mb-2">💧 Pourquoi la peau doit rester humide ?</p>
          <p class="text-sm">L'oxygène doit d'abord se dissoudre dans l'humidité de la peau avant de passer dans le sang. 
          Si la peau sèche, l'amphibien ne peut plus respirer par la peau et risque de mourir.</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⏱️ Les Rythmes Respiratoires</h2>
    <div class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-6 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
      <p class="mb-4">Tous les vertébrés ne respirent pas au même rythme. La <strong>fréquence respiratoire</strong> varie selon :</p>
      
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">📏 La taille de l'animal</h4>
          <p class="text-sm">Plus l'animal est petit, plus il respire vite car son métabolisme est rapide.</p>
        </div>
        <div class="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg">
          <h4 class="font-bold mb-2">🏃 L'activité physique</h4>
          <p class="text-sm">Pendant l'effort, les muscles ont besoin de plus d'oxygène, donc on respire plus vite.</p>
        </div>
      </div>

      <div class="bg-white/70 dark:bg-gray-800/70 p-5 rounded-lg">
        <h4 class="font-bold mb-3">📊 Exemples de fréquences respiratoires (au repos) :</h4>
        <ul class="space-y-2 text-sm">
          <li>• <strong>Souris</strong> : 100 à 150 respirations par minute</li>
          <li>• <strong>Chat</strong> : 20 à 30 respirations par minute</li>
          <li>• <strong>Humain adulte</strong> : 12 à 20 respirations par minute</li>
          <li>• <strong>Chien</strong> : 10 à 30 respirations par minute</li>
          <li>• <strong>Éléphant</strong> : 4 à 5 respirations par minute</li>
          <li>• <strong>Baleine</strong> : 1 à 2 respirations par minute (mais de grands volumes d'air !)</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
    <h2 class="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-4">📊 Tableau Comparatif</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm border-collapse">
        <thead class="bg-orange-200 dark:bg-orange-800">
          <tr>
            <th class="border border-orange-400 dark:border-orange-600 p-2">Groupe</th>
            <th class="border border-orange-400 dark:border-orange-600 p-2">Organe respiratoire</th>
            <th class="border border-orange-400 dark:border-orange-600 p-2">Milieu</th>
            <th class="border border-orange-400 dark:border-orange-600 p-2">Exemples</th>
          </tr>
        </thead>
        <tbody class="bg-white/70 dark:bg-gray-800/70">
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Poissons</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Branchies</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Eau uniquement</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Requin, truite</td>
          </tr>
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Amphibiens (larves)</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Branchies</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Eau uniquement</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Têtards</td>
          </tr>
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Amphibiens (adultes)</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Poumons + Peau</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Eau et terre</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Grenouille, crapaud</td>
          </tr>
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Reptiles</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Poumons</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Terre (certains dans l'eau)</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Serpent, tortue</td>
          </tr>
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Oiseaux</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Poumons</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Air</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Aigle, pigeon</td>
          </tr>
          <tr>
            <td class="border border-orange-400 dark:border-orange-600 p-2 font-semibold">Mammifères</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Poumons</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Terre/Air/Eau</td>
            <td class="border border-orange-400 dark:border-orange-600 p-2">Humain, baleine</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Organes Respiratoires</h3>
    <p class="mb-4">Associe chaque animal à son organe respiratoire principal :</p>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
        <p class="font-semibold mb-2">Animaux :</p>
        <ol class="space-y-1 text-sm list-decimal list-inside">
          <li>Poisson</li>
          <li>Grenouille adulte</li>
          <li>Serpent</li>
          <li>Têtard</li>
          <li>Humain</li>
        </ol>
      </div>
      <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
        <p class="font-semibold mb-2">Organes :</p>
        <ul class="space-y-1 text-sm">
          <li>A) Poumons</li>
          <li>B) Branchies</li>
          <li>C) Poumons + Peau</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Vrai ou Faux</h3>
    <p class="mb-4">Indique si chaque affirmation est vraie (V) ou fausse (F) :</p>
    <ol class="space-y-2 list-decimal list-inside">
      <li>Les poissons peuvent respirer l'air directement <span class="ml-4">_____</span></li>
      <li>Les grenouilles adultes respirent par les poumons ET la peau <span class="ml-4">_____</span></li>
      <li>Tous les vertébrés respirent au même rythme <span class="ml-4">_____</span></li>
      <li>La respiration sert à apporter de l'oxygène et éliminer le CO₂ <span class="ml-4">_____</span></li>
      <li>Les baleines respirent par des branchies <span class="ml-4">_____</span></li>
      <li>Les reptiles peuvent respirer sous l'eau sans remonter <span class="ml-4">_____</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Complète le texte</h3>
    <p class="mb-4">Complète avec : <em>poumons, branchies, oxygène, CO₂, peau, humide</em></p>
    <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg space-y-2 text-sm">
      <p>La respiration permet de capter l'__________ et d'éliminer le __________. Les poissons utilisent leurs __________ 
      pour respirer dans l'eau. Les mammifères et les oiseaux respirent avec leurs __________. Les grenouilles adultes 
      peuvent aussi respirer par la __________, mais celle-ci doit rester __________ pour que cela fonctionne.</p>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Questions de Réflexion</h3>
    <ol class="space-y-3 list-decimal list-inside">
      <li>Pourquoi un poisson meurt rapidement hors de l'eau ?
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
      <li>Pourquoi respire-t-on plus vite quand on court ?
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
      <li>Quel est l'avantage pour une grenouille de pouvoir respirer par la peau ?
        <div class="ml-6 mt-2 text-sm bg-white/50 dark:bg-black/20 p-2 rounded">__________________________________________________</div>
      </li>
    </ol>
  </div>
</div>`
  },

  "reproduction-vertebres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître les différents modes de reproduction et développement des vertébrés
• Expliquer que les partenaires dans la reproduction sont différenciés en mâle et femelle
• Spécifier les différences externes et internes entre mâle et femelle
• Expliquer le principe de la fécondation externe et interne
• Identifier les vertébrés ovipares et vivipares
• Préciser un mode de croissance de quelques batraciens : la métamorphose`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  // Les plantes à fleurs
  "organes-plantes": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les racines, les tubercules, les bulbes et les rhizomes
• Différencier les racines, les tubercules, les bulbes et les rhizomes
• Identifier quatre (4) formes de racines
• Décrire les différentes parties d'une tige et d'une branche
• Identifier les différentes parties d'une feuille
• Distinguer les feuilles simples des feuilles composées`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  "fleurs-fruits": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les différentes parties d'une fleur : pédoncule, calice, corolle, étamines, pistil
• Identifier les fruits secs et les fruits charnus
• Distinguer parmi les fruits charnus : les baies (à pépins) et les drupes (à noyaux)
• Réaliser un herbier`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  // Interaction entre les composants du milieu
  "ecologie-relations": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les trois (3) domaines d'études de l'écologie
• Spécifier les relations pouvant exister entre individus de même espèce et d'espèces différentes
• Diviser les êtres vivants en deux groupes : autotrophes et hétérotrophes`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  "chaines-alimentaires": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les trois (3) éléments constitutifs de tout cycle nourricier
• Identifier une chaîne alimentaire comme une suite d'êtres vivants
• Établir quelques chaînes alimentaires dans différents milieux
• Identifier le parasitisme, la symbiose et l'association`,
    introduction: `[Contenu à ajouter]`,
    contenu: `[Contenu à ajouter]`,
    exemplesExercices: `[Contenu à ajouter]`
  },

  // Manifestation des activités internes du globe terrestre
  "structure-terre": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier les quatre (4) principales couches constituant la structure du globe terrestre
• Reconnaître les manifestations d'origine externe et d'origine interne du globe terrestre
• Reconnaître que les éruptions volcaniques et les tremblements de terre sont deux phénomènes d'origine interne`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Notre planète Terre est fascinante ! Sous nos pieds se cache un monde complexe organisé en plusieurs couches.
    Comprendre la structure interne de la Terre nous aide à expliquer de nombreux phénomènes naturels comme les
    tremblements de terre et les volcans.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🌍 Le saviez-vous ?</p>
    <p>La Terre existe depuis environ 4,5 milliards d'années et sa structure interne est le résultat de processus
    géologiques complexes qui continuent encore aujourd'hui !</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Identifier les quatre (4) principales couches constituant la structure du globe terrestre</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Reconnaître les manifestations d'origine externe et d'origine interne du globe terrestre</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Reconnaître que les éruptions volcaniques et les tremblements de terre sont deux phénomènes d'origine interne</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌐 Les Quatre Couches de la Terre</h2>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-3">1. L'Atmosphère 🌫️</h3>
        <ul class="space-y-2 ml-4">
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span><strong>Définition :</strong> La couche gazeuse qui entoure la Terre</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span><strong>Composition :</strong> Azote (78%), Oxygène (21%), autres gaz (1%)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span><strong>Épaisseur :</strong> Environ 1000 km</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span><strong>Rôle :</strong> Protège la vie sur Terre, permet la respiration</span>
          </li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950/30 dark:to-cyan-900/30 p-6 rounded-lg border-2 border-cyan-200 dark:border-cyan-800">
        <h3 class="text-xl font-bold text-cyan-700 dark:text-cyan-300 mb-3">2. L'Hydrosphère 💧</h3>
        <ul class="space-y-2 ml-4">
          <li class="flex items-start gap-2">
            <span class="text-cyan-600 dark:text-cyan-400 mt-1">•</span>
            <span><strong>Définition :</strong> Toute l'eau présente sur Terre</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-cyan-600 dark:text-cyan-400 mt-1">•</span>
            <span><strong>Comprend :</strong> Océans, mers, lacs, rivières, glaciers, nappes souterraines</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-cyan-600 dark:text-cyan-400 mt-1">•</span>
            <span><strong>Proportion :</strong> Couvre environ 71% de la surface terrestre</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-cyan-600 dark:text-cyan-400 mt-1">•</span>
            <span><strong>Importance :</strong> Essentielle pour la vie, régule le climat</span>
          </li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-800">
        <h3 class="text-xl font-bold text-amber-700 dark:text-amber-300 mb-3">3. La Lithosphère 🪨</h3>
        <ul class="space-y-2 ml-4">
          <li class="flex items-start gap-2">
            <span class="text-amber-600 dark:text-amber-400 mt-1">•</span>
            <span><strong>Définition :</strong> La couche rocheuse externe et rigide de la Terre</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-600 dark:text-amber-400 mt-1">•</span>
            <span><strong>Comprend :</strong> La croûte terrestre et la partie supérieure du manteau</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-600 dark:text-amber-400 mt-1">•</span>
            <span><strong>Types de croûte :</strong>
              <ul class="ml-4 mt-1 space-y-1">
                <li>- Croûte continentale (30-70 km d'épaisseur)</li>
                <li>- Croûte océanique (5-10 km d'épaisseur)</li>
              </ul>
            </span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-600 dark:text-amber-400 mt-1">•</span>
            <span><strong>Caractéristique :</strong> Divisée en plaques tectoniques en mouvement constant</span>
          </li>
        </ul>
      </div>

      <div class="bg-gradient-to-r from-red-50 to-orange-100 dark:from-red-950/30 dark:to-orange-900/30 p-6 rounded-lg border-2 border-red-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-3">4. L'Endosphère 🔥</h3>
        <ul class="space-y-2 ml-4">
          <li class="flex items-start gap-2">
            <span class="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Définition :</strong> La partie interne de la Terre sous la lithosphère</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-red-600 dark:text-red-400 mt-1">•</span>
            <span><strong>Comprend trois parties :</strong>
              <ul class="ml-4 mt-2 space-y-2">
                <li class="bg-white/50 dark:bg-black/20 p-2 rounded">
                  <strong>Le Manteau :</strong> Couche épaisse de roches semi-solides (2900 km d'épaisseur)
                </li>
                <li class="bg-white/50 dark:bg-black/20 p-2 rounded">
                  <strong>Le Noyau externe :</strong> Liquide, composé de fer et nickel fondus (2200 km d'épaisseur)
                </li>
                <li class="bg-white/50 dark:bg-black/20 p-2 rounded">
                  <strong>Le Noyau interne :</strong> Solide malgré la chaleur extrême (1200 km de rayon, température de 5000°C)
                </li>
              </ul>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
    <h2 class="text-2xl font-bold text-primary mb-4">🌋 Manifestations d'Origine Interne et Externe</h2>
    
    <div class="grid md:grid-cols-2 gap-6 mt-4">
      <div class="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-orange-600 dark:text-orange-400 mb-3">Manifestations Internes</h3>
        <p class="mb-3 text-sm text-muted-foreground">Phénomènes causés par les forces à l'intérieur de la Terre :</p>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full shrink-0"></span>
            <span><strong>Tremblements de terre (séismes)</strong> - Secousses du sol causées par le mouvement des plaques tectoniques</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full shrink-0"></span>
            <span><strong>Éruptions volcaniques</strong> - Remontée du magma à la surface</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full shrink-0"></span>
            <span><strong>Formation des montagnes</strong> - Collision des plaques tectoniques</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-orange-500 rounded-full shrink-0"></span>
            <span><strong>Déplacement des continents</strong> - Mouvement lent des plaques</span>
          </li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-800/80 p-5 rounded-lg shadow-md">
        <h3 class="text-xl font-bold text-green-600 dark:text-green-400 mb-3">Manifestations Externes</h3>
        <p class="mb-3 text-sm text-muted-foreground">Phénomènes causés par des forces extérieures :</p>
        <ul class="space-y-2">
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
            <span><strong>Érosion</strong> - Usure des roches par le vent, l'eau, la glace</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
            <span><strong>Précipitations</strong> - Pluie, neige formées dans l'atmosphère</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
            <span><strong>Action des vagues</strong> - Modification des côtes</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full shrink-0"></span>
            <span><strong>Glissements de terrain</strong> - Causés par la gravité et l'eau</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg">
      <p class="font-semibold text-yellow-800 dark:text-yellow-200">⚠️ Point Important :</p>
      <p class="text-yellow-700 dark:text-yellow-300 mt-2">
        Les éruptions volcaniques et les tremblements de terre sont des phénomènes d'origine <strong>INTERNE</strong>. 
        Ils sont causés par l'énergie thermique et les mouvements à l'intérieur de la Terre, particulièrement dans 
        le manteau et à la jonction des plaques tectoniques.
      </p>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔬 Pourquoi Étudier la Structure de la Terre ?</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">🏗️</div>
        <h4 class="font-bold mb-2">Prévention</h4>
        <p class="text-sm">Comprendre les séismes et volcans pour mieux protéger les populations</p>
      </div>
      <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">⛏️</div>
        <h4 class="font-bold mb-2">Ressources</h4>
        <p class="text-sm">Localiser les ressources minérales et énergétiques</p>
      </div>
      <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
        <div class="text-3xl mb-2">🌍</div>
        <h4 class="font-bold mb-2">Connaissance</h4>
        <p class="text-sm">Comprendre l'évolution de notre planète</p>
      </div>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Les Quatre Couches</h3>
    <p class="mb-4">Complète le tableau suivant :</p>
    <div class="overflow-x-auto">
      <table class="w-full border-2 border-gray-300 dark:border-gray-600">
        <thead class="bg-primary/10">
          <tr>
            <th class="border border-gray-300 dark:border-gray-600 p-2">Couche</th>
            <th class="border border-gray-300 dark:border-gray-600 p-2">Composition principale</th>
            <th class="border border-gray-300 dark:border-gray-600 p-2">Caractéristique</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-2 font-semibold">Atmosphère</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-2 font-semibold">Hydrosphère</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-2 font-semibold">Lithosphère</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
          </tr>
          <tr>
            <td class="border border-gray-300 dark:border-gray-600 p-2 font-semibold">Endosphère</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
            <td class="border border-gray-300 dark:border-gray-600 p-2">_____________</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Vrai ou Faux</h3>
    <p class="mb-4">Indique si les affirmations suivantes sont vraies ou fausses :</p>
    <ol class="space-y-3 list-decimal list-inside">
      <li>L'atmosphère est composée uniquement d'oxygène. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>L'hydrosphère couvre environ 71% de la surface terrestre. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>La lithosphère comprend la croûte terrestre. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>Le noyau interne de la Terre est liquide. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>Les tremblements de terre sont des manifestations externes. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>Les éruptions volcaniques sont causées par des forces internes. <span class="text-muted-foreground ml-2">(V / F)</span></li>
      <li>L'érosion est une manifestation interne du globe. <span class="text-muted-foreground ml-2">(V / F)</span></li>
    </ol>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Classification</h3>
    <p class="mb-4">Classe les phénomènes suivants selon qu'ils sont d'origine interne ou externe :</p>
    <div class="grid md:grid-cols-2 gap-6 mt-4">
      <div>
        <h4 class="font-semibold mb-3 text-orange-600 dark:text-orange-400">Origine Interne :</h4>
        <ul class="space-y-2 ml-4">
          <li>1. _________________</li>
          <li>2. _________________</li>
          <li>3. _________________</li>
          <li>4. _________________</li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold mb-3 text-green-600 dark:text-green-400">Origine Externe :</h4>
        <ul class="space-y-2 ml-4">
          <li>1. _________________</li>
          <li>2. _________________</li>
          <li>3. _________________</li>
          <li>4. _________________</li>
        </ul>
      </div>
    </div>
    <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
      <p class="text-sm font-semibold mb-2">Phénomènes à classer :</p>
      <p class="text-sm">Éruption volcanique • Érosion par le vent • Tremblement de terre • Pluie • 
      Formation de montagnes • Glissement de terrain • Déplacement des plaques • Action des vagues</p>
    </div>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 4 : Question de Réflexion</h3>
    <p class="mb-4 font-semibold">Pourquoi est-il important d'étudier la structure interne de la Terre ?</p>
    <div class="space-y-2 text-sm text-muted-foreground">
      <p>Dans ta réponse, mentionne :</p>
      <ul class="list-disc list-inside ml-4 space-y-1">
        <li>Les phénomènes naturels que cela nous aide à comprendre</li>
        <li>Comment cette connaissance peut protéger les populations</li>
        <li>Les applications pratiques de ces connaissances</li>
      </ul>
    </div>
    <div class="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[100px]">
      <p class="text-xs text-muted-foreground italic">Espace pour ta réponse...</p>
    </div>
  </div>
</div>`
  },

  "volcans": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Spécifier le mécanisme de la formation d'un volcan comme rejet du magma
• Spécifier les conséquences favorables et défavorables des éruptions volcaniques`,
    introduction: `<div class="space-y-6">
  <p class="text-lg leading-relaxed">
    Les volcans sont parmi les phénomènes naturels les plus spectaculaires de notre planète. Ces montagnes de feu
    fascinent et terrifient à la fois. Comprendre leur fonctionnement est essentiel pour protéger les populations
    qui vivent à proximité.
  </p>
  <div class="bg-primary/5 border-l-4 border-primary p-4 rounded-r">
    <p class="font-semibold text-primary mb-2">🌋 Le saviez-vous ?</p>
    <p>Il existe environ 1 500 volcans actifs dans le monde, et environ 50 à 70 d'entre eux entrent en éruption
    chaque année ! Haïti se trouve dans une zone sismique, bien qu'elle n'ait pas de volcans actifs actuellement.</p>
  </div>
  
  <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl">
    <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
      <span class="text-2xl">🎯</span>
      Objectifs de la leçon
    </h3>
    <ul class="space-y-2">
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier le mécanisme de la formation d'un volcan comme rejet du magma</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-primary shrink-0 mt-1">✓</span>
        <span>Spécifier les conséquences favorables et défavorables des éruptions volcaniques</span>
      </li>
    </ul>
  </div>
</div>`,
    contenu: `<div class="space-y-8">
  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🌋 Qu'est-ce qu'un Volcan ?</h2>
    <div class="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
      <p class="mb-4 leading-relaxed">
        Un <strong>volcan</strong> est une ouverture dans la croûte terrestre par laquelle le magma (roche en fusion), 
        les gaz et les cendres s'échappent de l'intérieur de la Terre vers la surface.
      </p>
      <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
        <h4 class="font-bold mb-3 text-orange-700 dark:text-orange-300">Les parties d'un volcan :</h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400 font-bold shrink-0">•</span>
            <span><strong>Le cratère :</strong> Ouverture au sommet du volcan</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400 font-bold shrink-0">•</span>
            <span><strong>La cheminée volcanique :</strong> Conduit par lequel remonte le magma</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400 font-bold shrink-0">•</span>
            <span><strong>Le cône volcanique :</strong> Montagne formée par l'accumulation de lave et de cendres</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400 font-bold shrink-0">•</span>
            <span><strong>La chambre magmatique :</strong> Réservoir de magma sous le volcan</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-600 dark:text-orange-400 font-bold shrink-0">•</span>
            <span><strong>Les coulées de lave :</strong> Rivières de roche en fusion qui descendent les flancs</span>
          </li>
        </ul>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">🔥 Formation et Mécanisme d'un Volcan</h2>
    
    <div class="space-y-6">
      <div class="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-red-200 dark:border-red-800">
        <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-4">Étape 1 : Formation du Magma 🌡️</h3>
        <p class="leading-relaxed">
          Dans le <strong>manteau terrestre</strong>, à des profondeurs de 30 à 200 km, les roches sont soumises à 
          des températures extrêmement élevées (700°C à 1300°C) et à une pression énorme. Dans certaines conditions, 
          ces roches fondent partiellement pour former le <strong>magma</strong>.
        </p>
        <div class="mt-3 p-3 bg-white/50 dark:bg-black/20 rounded">
          <p class="text-sm"><strong>💡 Le magma =</strong> Roche en fusion + Gaz dissous (vapeur d'eau, CO₂, etc.)</p>
        </div>
      </div>

      <div class="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
        <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">Étape 2 : Remontée du Magma ⬆️</h3>
        <p class="leading-relaxed mb-3">
          Le magma est <strong>moins dense</strong> que les roches environnantes. Comme une bulle d'air dans l'eau, 
          il a tendance à remonter vers la surface. Il s'accumule d'abord dans une <strong>chambre magmatique</strong>.
        </p>
        <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
          <p class="font-semibold mb-2">Pourquoi le magma remonte-t-il ?</p>
          <ul class="space-y-1 text-sm ml-4">
            <li>✓ Différence de densité (le magma est plus léger)</li>
            <li>✓ Pression des gaz qui poussent vers le haut</li>
            <li>✓ Fissures dans la croûte terrestre</li>
          </ul>
        </div>
      </div>

      <div class="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-red-950/20 p-6 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
        <h3 class="text-xl font-bold text-yellow-700 dark:text-yellow-300 mb-4">Étape 3 : L'Éruption Volcanique 💥</h3>
        <p class="leading-relaxed mb-3">
          Lorsque la pression dans la chambre magmatique devient trop forte, le magma trouve un chemin vers la surface 
          à travers des <strong>fissures dans la croûte terrestre</strong>. C'est l'<strong>éruption volcanique</strong>.
        </p>
        <div class="grid md:grid-cols-2 gap-4 mt-4">
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2 text-red-600 dark:text-red-400">🌋 Éruption Explosive</h4>
            <ul class="text-sm space-y-1">
              <li>• Magma visqueux (épais)</li>
              <li>• Beaucoup de gaz</li>
              <li>• Explosions violentes</li>
              <li>• Projections de cendres et roches</li>
              <li>• Nuées ardentes</li>
            </ul>
          </div>
          <div class="bg-white/70 dark:bg-black/30 p-4 rounded-lg">
            <h4 class="font-bold mb-2 text-orange-600 dark:text-orange-400">🌊 Éruption Effusive</h4>
            <ul class="text-sm space-y-1">
              <li>• Magma fluide (liquide)</li>
              <li>• Peu de gaz</li>
              <li>• Coulées de lave tranquilles</li>
              <li>• Fontaines de lave</li>
              <li>• Moins dangereuse</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border-2 border-red-300 dark:border-red-700">
        <p class="font-semibold text-red-800 dark:text-red-200 mb-2">🔑 Point Clé à Retenir :</p>
        <p class="text-red-700 dark:text-red-300">
          Le mécanisme d'un volcan est le <strong>rejet du magma</strong> depuis l'intérieur de la Terre vers la surface, 
          causé par la différence de densité et la pression des gaz. Quand le magma atteint la surface, on l'appelle 
          <strong>lave</strong>.
        </p>
      </div>
    </div>
  </section>

  <section>
    <h2 class="text-2xl font-bold text-primary mb-4">⚖️ Conséquences des Éruptions Volcaniques</h2>
    
    <div class="grid lg:grid-cols-2 gap-6">
      <div class="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 p-6 rounded-xl border-2 border-red-300 dark:border-red-700 shadow-lg">
        <h3 class="text-xl font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
          <span>⚠️</span> Conséquences Défavorables (Dangers)
        </h3>
        <ul class="space-y-3">
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">💀 Pertes humaines</strong>
            <p class="text-sm mt-1">Personnes tuées par les coulées de lave, les gaz toxiques, les nuées ardentes ou l'effondrement de bâtiments</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">🏚️ Destruction des habitations</strong>
            <p class="text-sm mt-1">Villages et villes ensevelis sous la lave ou les cendres</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">🌾 Destruction des cultures</strong>
            <p class="text-sm mt-1">Champs brûlés, recouverts de cendres, empoisonnés par les gaz</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">🌫️ Pollution de l'air</strong>
            <p class="text-sm mt-1">Émission de gaz toxiques (SO₂, CO₂, H₂S) et de cendres qui affectent la respiration et le climat</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">💧 Contamination de l'eau</strong>
            <p class="text-sm mt-1">Rivières et nappes souterraines polluées par les produits volcaniques</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">🌊 Tsunamis</strong>
            <p class="text-sm mt-1">Éruptions sous-marines ou effondrements de flancs peuvent créer des vagues géantes</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-red-600 dark:text-red-400">❄️ Refroidissement climatique</strong>
            <p class="text-sm mt-1">Les cendres dans l'atmosphère bloquent le soleil (ex: éruption du Tambora en 1815 a causé "l'année sans été")</p>
          </li>
        </ul>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
          <span>✅</span> Conséquences Favorables (Bienfaits)
        </h3>
        <ul class="space-y-3">
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">🌱 Enrichissement des sols</strong>
            <p class="text-sm mt-1">Les cendres volcaniques sont riches en minéraux (potassium, phosphore, magnésium) qui fertilisent les terres agricoles</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">⛰️ Formation de nouvelles terres</strong>
            <p class="text-sm mt-1">Les îles volcaniques se forment (Hawaï, Islande), agrandissent les territoires</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">⚡ Énergie géothermique</strong>
            <p class="text-sm mt-1">Chaleur du volcan utilisée pour produire de l'électricité et chauffer les maisons (Islande, Nouvelle-Zélande)</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">⛏️ Ressources minérales</strong>
            <p class="text-sm mt-1">Formation de gisements de métaux précieux (or, argent, cuivre) et de pierres précieuses</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">🏞️ Tourisme</strong>
            <p class="text-sm mt-1">Les volcans attirent des millions de visiteurs (source de revenus) et créent des paysages magnifiques</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">💎 Matériaux de construction</strong>
            <p class="text-sm mt-1">La pierre volcanique (basalte, pierre ponce) est utilisée en construction</p>
          </li>
          <li class="bg-white/70 dark:bg-black/30 p-3 rounded-lg">
            <strong class="text-green-600 dark:text-green-400">🧪 Recherche scientifique</strong>
            <p class="text-sm mt-1">Étude de l'intérieur de la Terre et compréhension de la formation de notre planète</p>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-6 bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-2 border-blue-200 dark:border-blue-800">
      <h4 class="font-bold text-blue-800 dark:text-blue-200 mb-3">🔍 Exemples de Volcans Célèbres :</h4>
      <div class="grid md:grid-cols-2 gap-4 text-sm">
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <strong>Le Vésuve (Italie)</strong> - A détruit Pompéi en l'an 79
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <strong>Le Mont Fuji (Japon)</strong> - Symbole du Japon, dernière éruption en 1707
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <strong>Le Kilauea (Hawaï)</strong> - L'un des plus actifs au monde
        </div>
        <div class="bg-white/70 dark:bg-black/30 p-3 rounded">
          <strong>Le Piton de la Fournaise (Réunion)</strong> - Éruptions effusives spectaculaires
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border-2 border-purple-200 dark:border-purple-800">
    <h2 class="text-2xl font-bold text-primary mb-4">🛡️ Vivre avec les Volcans</h2>
    <p class="mb-4">Malgré les dangers, des millions de personnes vivent près des volcans. Pourquoi ?</p>
    <ul class="space-y-2 mb-4">
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 font-bold shrink-0">•</span>
        <span>Les sols volcaniques sont extrêmement fertiles (excellentes récoltes)</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 font-bold shrink-0">•</span>
        <span>Les éruptions peuvent être surveillées et prévues</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 font-bold shrink-0">•</span>
        <span>Les avantages économiques (agriculture, tourisme, énergie) dépassent souvent les risques</span>
      </li>
    </ul>
    <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg">
      <p class="font-semibold">🚨 Mesures de prévention :</p>
      <p class="text-sm mt-2">Surveillance sismique, plans d'évacuation, systèmes d'alerte, construction antisismique, éducation des populations</p>
    </div>
  </section>
</div>`,
    exemplesExercices: `<div class="space-y-6">
  <div class="bg-primary/5 p-6 rounded-lg border-2 border-primary/20">
    <h3 class="text-xl font-bold text-primary mb-4">📝 Exercice 1 : Schéma d'un Volcan</h3>
    <p class="mb-4">Complète le schéma d'un volcan en nommant les parties suivantes :</p>
    <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
      <p class="mb-3 font-semibold">Parties à placer :</p>
      <div class="grid md:grid-cols-3 gap-2 text-sm">
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Cratère</div>
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Cheminée volcanique</div>
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Cône volcanique</div>
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Chambre magmatique</div>
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Coulées de lave</div>
        <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded">Nuage de cendres</div>
      </div>
    </div>
    <p class="mt-4 text-sm text-muted-foreground italic">Dessine un volcan dans ton cahier et place correctement chaque partie.</p>
  </div>

  <div class="bg-accent/5 p-6 rounded-lg border-2 border-accent/20">
    <h3 class="text-xl font-bold text-accent mb-4">📝 Exercice 2 : Le Mécanisme du Volcan</h3>
    <p class="mb-4">Remets dans l'ordre les étapes de formation d'une éruption volcanique :</p>
    <div class="space-y-2">
      <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
        <span class="font-bold mr-2">[ ]</span> Le magma s'accumule dans une chambre magmatique
      </div>
      <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
        <span class="font-bold mr-2">[ ]</span> Les roches du manteau fondent à cause de la chaleur et de la pression
      </div>
      <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
        <span class="font-bold mr-2">[ ]</span> Le magma remonte vers la surface car il est moins dense
      </div>
      <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
        <span class="font-bold mr-2">[ ]</span> La pression augmente et le magma trouve une fissure dans la croûte
      </div>
      <div class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
        <span class="font-bold mr-2">[ ]</span> Éruption volcanique : le magma devient de la lave en surface
      </div>
    </div>
  </div>

  <div class="bg-secondary/5 p-6 rounded-lg border-2 border-secondary/20">
    <h3 class="text-xl font-bold text-secondary mb-4">📝 Exercice 3 : Avantages et Inconvénients</h3>
    <p class="mb-4">Classe les conséquences suivantes en deux catégories :</p>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
        <h4 class="font-bold text-red-600 dark:text-red-400 mb-3">Conséquences Défavorables :</h4>
        <ol class="space-y-2 list-decimal list-inside text-sm">
          <li>_____________________</li>
          <li>_____________________</li>
          <li>_____________________</li>
          <li>_____________________</li>
        </ol>
      </div>
      <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
        <h4 class="font-bold text-green-600 dark:text-green-400 mb-3">Conséquences Favorables :</h4>
        <ol class="space-y-2 list-decimal list-inside text-sm">
          <li>_____________________</li>
          <li>_____________________</li>
          <li>_____________________</li>
          <li>_____________________</li>
        </ol>
      </div>
    </div>
    <div class="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
      <p class="text-sm font-semibold mb-2">Conséquences à classer :</p>
      <p class="text-sm">A. Enrichissement des sols • B. Destruction des habitations • C. Énergie géothermique • 
      D. Pertes humaines • E. Formation de nouvelles terres • F. Pollution de l'air • 
      G. Tourisme • H. Contamination de l'eau</p>
    </div>
  </div>

  <div class="bg-orange-50 dark:bg-orange-950/30 p-6 rounded-lg border-2 border-orange-200 dark:border-orange-800">
    <h3 class="text-xl font-bold text-orange-700 dark:text-orange-300 mb-4">📝 Exercice 4 : Questions de Compréhension</h3>
    <ol class="space-y-4 list-decimal list-inside">
      <li class="pl-2">
        <span class="font-semibold">Qu'est-ce que le magma ?</span>
        <div class="ml-6 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[60px]"></div>
      </li>
      <li class="pl-2">
        <span class="font-semibold">Pourquoi le magma remonte-t-il vers la surface ?</span>
        <div class="ml-6 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[60px]"></div>
      </li>
      <li class="pl-2">
        <span class="font-semibold">Quelle est la différence entre une éruption explosive et une éruption effusive ?</span>
        <div class="ml-6 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[60px]"></div>
      </li>
      <li class="pl-2">
        <span class="font-semibold">Cite trois bienfaits des éruptions volcaniques.</span>
        <div class="ml-6 mt-2 p-3 bg-white/50 dark:bg-black/20 rounded min-h-[60px]"></div>
      </li>
    </ol>
  </div>

  <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
    <h3 class="text-xl font-bold text-purple-700 dark:text-purple-300 mb-4">📝 Exercice 5 : Projet de Recherche</h3>
    <p class="mb-4 font-semibold">Choisis un volcan célèbre et prépare un petit exposé sur :</p>
    <ul class="space-y-2 ml-6 mb-4">
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 shrink-0">✓</span>
        <span>Son nom et sa localisation</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 shrink-0">✓</span>
        <span>Son type (actif, endormi ou éteint)</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 shrink-0">✓</span>
        <span>Une éruption historique importante</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-purple-600 dark:text-purple-400 shrink-0">✓</span>
        <span>Les conséquences de cette éruption</span>
      </li>
    </ul>
    <p class="text-sm text-muted-foreground">Exemples : Vésuve, Mont Fuji, Krakatoa, Eyjafjallajökull, Mauna Loa, Piton de la Fournaise</p>
  </div>
</div>`
  }
};

// Topic metadata for navigation and display
export const sciencesTopics = [
  {
    id: "utilisation-balance",
    title: "Utilisation de la Balance",
    category: "Propriété physique de la matière",
    duration: "2 semaines",
    difficulty: "Débutant"
  },
  {
    id: "dimensions-solides",
    title: "Dimensions d'un Solide",
    category: "Propriété physique de la matière",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "masse-volumique",
    title: "Masse Volumique",
    category: "Propriété physique de la matière",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "proprietes-gaz",
    title: "Propriétés des Gaz",
    category: "Propriété physique de la matière",
    duration: "1 semaine",
    difficulty: "Débutant"
  },
  {
    id: "propagation-chaleur",
    title: "Propagation de la Chaleur",
    category: "La chaleur",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "effets-chaleur",
    title: "Effets de la Chaleur",
    category: "La chaleur",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "thermometre",
    title: "Utilisation du Thermomètre",
    category: "La chaleur",
    duration: "1 semaine",
    difficulty: "Débutant"
  },
  {
    id: "circuit-electrique-simple",
    title: "Circuit Électrique Simple",
    category: "Électricité",
    duration: "2 semaines",
    difficulty: "Débutant"
  },
  {
    id: "courts-circuits",
    title: "Les Courts-Circuits",
    category: "Électricité",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "pile-electrique",
    title: "Description d'une Pile Électrique",
    category: "Électricité",
    duration: "1 semaine",
    difficulty: "Débutant"
  },
  {
    id: "montage-serie",
    title: "Montage de Piles en Série",
    category: "Électricité",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "montage-parallele",
    title: "Montage en Parallèle",
    category: "Électricité",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "classification-vertebres",
    title: "Classification des Vertébrés",
    category: "Les vertébrés",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "deplacements-vertebres",
    title: "Déplacements des Vertébrés",
    category: "Les vertébrés",
    duration: "4 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "nutrition-vertebres",
    title: "Nutrition des Vertébrés",
    category: "Les vertébrés",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "respiration-vertebres",
    title: "Respiration des Vertébrés",
    category: "Les vertébrés",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "reproduction-vertebres",
    title: "Reproduction des Vertébrés",
    category: "Les vertébrés",
    duration: "3 semaines",
    difficulty: "Avancé"
  },
  {
    id: "organes-plantes",
    title: "Organes des Plantes",
    category: "Les plantes à fleurs",
    duration: "3 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "fleurs-fruits",
    title: "Fleurs et Fruits",
    category: "Les plantes à fleurs",
    duration: "2 semaines",
    difficulty: "Intermédiaire"
  },
  {
    id: "ecologie-relations",
    title: "Écologie et Relations",
    category: "Interaction dans le milieu",
    duration: "1 semaine",
    difficulty: "Intermédiaire"
  },
  {
    id: "chaines-alimentaires",
    title: "Chaînes Alimentaires",
    category: "Interaction dans le milieu",
    duration: "1 semaine",
    difficulty: "Intermédiaire"
  },
  {
    id: "structure-terre",
    title: "Structure de la Terre",
    category: "Activités internes du globe",
    duration: "1 semaine",
    difficulty: "Intermédiaire"
  },
  {
    id: "volcans",
    title: "Les Volcans",
    category: "Activités internes du globe",
    duration: "1 semaine",
    difficulty: "Intermédiaire"
  }
];

export default sciencesLessons7AF;