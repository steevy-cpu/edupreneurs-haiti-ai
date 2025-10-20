export interface StaticLessonContent {
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
}

// 7th Grade Math Lessons (AF7)
export const mathLessons7AF: Record<string, StaticLessonContent> = {
  // December Week 1 - ENSEMBLES (New - Missing from MENFP)
  "ensembles": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Comprendre la notion d'ensemble et d'élément
• Utiliser le vocabulaire des ensembles (appartient ∈, n'appartient pas ∉)
• Identifier des sous-ensembles et utiliser l'inclusion (⊂)
• Effectuer des opérations: réunion (∪), intersection (∩), complément (Ā)
• Utiliser les liens logiques (et, ou, non, si...alors)`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Les ensembles sont partout autour de nous !</span> 
    L'ensemble des élèves de ta classe, l'ensemble des fruits au marché de Croix-des-Bouquets, 
    l'ensemble des nombres pairs... <span class="italic">Ce sont tous des ensembles !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Un <span class="font-semibold text-accent">ensemble</span> est simplement une collection d'objets bien définis 
    qu'on appelle des <span class="font-semibold text-accent">éléments</span>. 
    Cette notion est fondamentale en mathématiques et te permettra de mieux organiser et manipuler l'information.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Astuce :</span> Pense à un ensemble comme à un panier qui contient 
    des objets précis. Tu peux facilement dire si quelque chose est dans le panier ou non !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Vocabulaire des ensembles -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      📚 Vocabulaire des ensembles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Ensemble</h4>
        <p class="leading-relaxed">
          Une collection d'objets bien définis. On note généralement avec des lettres majuscules : 
          <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">A, B, C, E</span>
        </p>
        <p class="mt-2 text-sm italic">Exemple : A = {1, 2, 3, 4, 5}</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔹 Élément</h4>
        <p class="leading-relaxed">
          Un objet qui fait partie d'un ensemble.
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✅ Appartenance (∈)</h4>
        <p class="leading-relaxed">
          Le symbole <span class="font-mono text-xl px-2 py-1 bg-green-100 dark:bg-green-900 rounded">∈</span> signifie "appartient à"
        </p>
        <p class="mt-2"><span class="font-mono">3 ∈ {1, 2, 3, 4}</span> se lit "3 appartient à l'ensemble {1, 2, 3, 4}"</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">❌ Non-appartenance (∉)</h4>
        <p class="leading-relaxed">
          Le symbole <span class="font-mono text-xl px-2 py-1 bg-red-100 dark:bg-red-900 rounded">∉</span> signifie "n'appartient pas à"
        </p>
        <p class="mt-2"><span class="font-mono">5 ∉ {1, 2, 3, 4}</span> se lit "5 n'appartient pas à l'ensemble"</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">⭕ Ensemble vide (∅ ou { })</h4>
        <p class="leading-relaxed">
          Un ensemble qui ne contient aucun élément. Comme un panier vide !
        </p>
      </div>
    </div>

    <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">🏫 Exemple haïtien - Marché de Pétion-Ville</h4>
      <p>F = {mangues, avocats, papayes, corossols} (ensemble des fruits)</p>
      <p class="mt-1">mangue ∈ F (la mangue appartient à l'ensemble des fruits)</p>
      <p>poulet ∉ F (le poulet n'appartient pas à l'ensemble des fruits)</p>
    </div>
  </section>

  <!-- Section 2: Description des ensembles -->
  <section class="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✍️ Description des ensembles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">1️⃣ En extension (énumération)</h4>
        <p class="leading-relaxed mb-2">On liste tous les éléments entre accolades :</p>
        <div class="bg-accent/10 p-3 rounded font-mono">
          A = {a, e, i, o, u, y}
        </div>
        <p class="mt-2 text-sm">C'est l'ensemble des voyelles</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">2️⃣ En compréhension (propriété)</h4>
        <p class="leading-relaxed mb-2">On donne une propriété caractéristique :</p>
        <div class="bg-accent/10 p-3 rounded font-mono">
          B = {x | x est un nombre pair entre 1 et 10}
        </div>
        <p class="mt-2 text-sm">Se lit : "B est l'ensemble des x tels que x est un nombre pair entre 1 et 10"</p>
        <p class="mt-1 text-sm">Donc B = {2, 4, 6, 8, 10}</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">3️⃣ Par diagramme (dessin)</h4>
        <p class="leading-relaxed">On peut aussi représenter un ensemble visuellement avec un cercle ou ovale contenant les éléments</p>
      </div>
    </div>
  </section>

  <!-- Section 3: Sous-ensembles et inclusion -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      🎯 Sous-ensembles et inclusion
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">
          Un ensemble A est un <strong>sous-ensemble</strong> de B si <strong>tous</strong> les éléments de A 
          appartiennent aussi à B.
        </p>
        <p class="mt-3 font-mono text-lg">Notation : <span class="px-3 py-1 bg-accent/20 rounded">A ⊂ B</span></p>
        <p class="mt-2 text-sm">Se lit : "A est inclus dans B" ou "A est une partie de B"</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🍎 Exemple pratique</h4>
        <p>A = {mangues, avocats, papayes}</p>
        <p>B = {mangues, avocats, papayes, bananes, oranges, ananas}</p>
        <p class="mt-2">Alors <strong class="text-accent">A ⊂ B</strong> car tous les fruits de A sont aussi dans B</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés importantes</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>L'ensemble vide ∅ est sous-ensemble de tout ensemble</li>
          <li>Tout ensemble est sous-ensemble de lui-même : A ⊂ A</li>
          <li>Si A ⊂ B et B ⊂ A, alors A = B (ensembles égaux)</li>
          <li>Si A ⊂ B et B ⊂ C, alors A ⊂ C (transitivité)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 4: Opérations sur les ensembles -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      🔄 Opérations sur les ensembles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">1️⃣ Réunion (Union) : A ∪ B</h4>
        <p class="leading-relaxed">
          L'ensemble de tous les éléments qui appartiennent à A <strong>ou</strong> à B (ou aux deux)
        </p>
        <div class="mt-3 p-3 bg-accent/10 rounded">
          <p class="font-mono">A = {1, 2, 3} et B = {3, 4, 5}</p>
          <p class="font-mono mt-1 text-accent font-bold">A ∪ B = {1, 2, 3, 4, 5}</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">2️⃣ Intersection : A ∩ B</h4>
        <p class="leading-relaxed">
          L'ensemble des éléments qui appartiennent à A <strong>et</strong> à B (en même temps)
        </p>
        <div class="mt-3 p-3 bg-accent/10 rounded">
          <p class="font-mono">A = {1, 2, 3, 4} et B = {3, 4, 5, 6}</p>
          <p class="font-mono mt-1 text-accent font-bold">A ∩ B = {3, 4}</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">3️⃣ Complément : Ā (ou A̅)</h4>
        <p class="leading-relaxed">
          L'ensemble de tous les éléments qui <strong>n'appartiennent pas</strong> à A
        </p>
        <div class="mt-3 p-3 bg-accent/10 rounded">
          <p class="font-mono">E = {1, 2, 3, 4, 5, 6} et A = {2, 4, 6}</p>
          <p class="font-mono mt-1 text-accent font-bold">Ā = {1, 3, 5}</p>
        </div>
      </div>
    </div>

    <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">🏫 Exemple avec des élèves</h4>
      <p>F = {élèves qui aiment le foot} = {Jean, Marie, Paul, Sophie}</p>
      <p>M = {élèves qui aiment la musique} = {Marie, Sophie, André, Luc}</p>
      <p class="mt-2">F ∪ M = {Jean, Marie, Paul, Sophie, André, Luc} (aiment foot OU musique)</p>
      <p>F ∩ M = {Marie, Sophie} (aiment foot ET musique)</p>
    </div>
  </section>

  <!-- Section 5: Diagrammes de Venn -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      📊 Diagrammes de Venn
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🎨 Représentation visuelle</h4>
        <p class="leading-relaxed">
          Les <strong>diagrammes de Venn</strong> permettent de visualiser les ensembles et leurs relations 
          avec des cercles ou des ovales.
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📝 Comment dessiner un diagramme de Venn</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li>Trace un rectangle qui représente l'ensemble universel E</li>
          <li>Dessine des cercles pour chaque ensemble à l'intérieur</li>
          <li>Les cercles se chevauchent s'il y a des éléments communs (intersection)</li>
          <li>Place les éléments dans les bonnes régions</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🎯 Exemple pratique</h4>
        <p class="mb-2">Dans une classe de 30 élèves à Port-au-Prince :</p>
        <ul class="space-y-1 list-disc list-inside ml-4">
          <li>18 élèves étudient l'anglais (A)</li>
          <li>15 élèves étudient l'espagnol (E)</li>
          <li>8 élèves étudient les deux langues</li>
        </ul>
        <p class="mt-3 font-semibold">Dans le diagramme de Venn :</p>
        <ul class="space-y-1 list-disc list-inside ml-4 mt-2">
          <li>A ∩ E = 8 (zone de chevauchement)</li>
          <li>Seulement anglais = 18 - 8 = 10</li>
          <li>Seulement espagnol = 15 - 8 = 7</li>
          <li>Ni anglais ni espagnol = 30 - (10 + 8 + 7) = 5</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 6: Liens logiques -->
  <section class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
      🔗 Liens logiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔸 "ET" → Intersection (∩)</h4>
        <p class="leading-relaxed">
          "x appartient à A <strong>et</strong> à B" signifie x ∈ A ∩ B
        </p>
        <p class="text-sm mt-1 italic">Les deux conditions doivent être vraies en même temps</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔸 "OU" → Réunion (∪)</h4>
        <p class="leading-relaxed">
          "x appartient à A <strong>ou</strong> à B" signifie x ∈ A ∪ B
        </p>
        <p class="text-sm mt-1 italic">Au moins une des deux conditions doit être vraie</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔸 "NON" → Complément (Ā)</h4>
        <p class="leading-relaxed">
          "x <strong>n'appartient pas</strong> à A" signifie x ∈ Ā
        </p>
        <p class="text-sm mt-1 italic">La négation de la condition</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔸 "SI...ALORS" → Inclusion (⊂)</h4>
        <p class="leading-relaxed">
          "<strong>Si</strong> x ∈ A, <strong>alors</strong> x ∈ B" signifie A ⊂ B
        </p>
        <p class="text-sm mt-1 italic">Tout élément de A est aussi dans B</p>
      </div>
    </div>

    <div class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">💡 Exemple combiné</h4>
      <p>Énoncé : "Les élèves qui réussissent sont ceux qui travaillent <strong>et</strong> qui sont réguliers"</p>
      <p class="mt-2">Si R = {élèves qui réussissent}, T = {élèves qui travaillent}, G = {élèves réguliers}</p>
      <p class="mt-1 font-semibold text-accent">Alors : R = T ∩ G</p>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 1 - Appartenance
    </h4>
    <p class="mb-3">Soit A = {2, 4, 6, 8, 10}. Vrai ou Faux :</p>
    <p class="ml-4">a) 4 ∈ A</p>
    <p class="ml-4">b) 5 ∈ A</p>
    <p class="ml-4">c) 10 ∈ A</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
        <p><strong>a) Vrai</strong> - 4 est dans l'ensemble A</p>
        <p><strong>b) Faux</strong> - 5 n'est pas dans l'ensemble A</p>
        <p><strong>c) Vrai</strong> - 10 est dans l'ensemble A</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-secondary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 2 - Réunion et Intersection
    </h4>
    <p class="mb-3">Soit A = {2, 4, 6, 8} et B = {1, 2, 3, 4}.</p>
    <p>Déterminer :</p>
    <p class="ml-4">a) A ∪ B</p>
    <p class="ml-4">b) A ∩ B</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-3">
        <div>
          <p class="font-semibold">a) A ∪ B (réunion)</p>
          <p>Ensemble de tous les éléments dans A ou dans B :</p>
          <p class="font-mono text-accent mt-1">A ∪ B = {1, 2, 3, 4, 6, 8}</p>
        </div>
        <div>
          <p class="font-semibold">b) A ∩ B (intersection)</p>
          <p>Ensemble des éléments dans A et dans B :</p>
          <p class="font-mono text-accent mt-1">A ∩ B = {2, 4}</p>
          <p class="text-sm mt-1">Les éléments 2 et 4 sont les seuls qui apparaissent dans les deux ensembles</p>
        </div>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-secondary/5 to-primary/5 p-6 rounded-xl border-l-4 border-secondary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 3 - Diagramme de Venn
    </h4>
    <p class="mb-3">
      Dans une classe de 40 élèves, 25 étudient l'anglais, 18 étudient l'espagnol et 10 étudient les deux langues. 
      Combien d'élèves n'étudient aucune de ces deux langues ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p>Soit A = {élèves qui étudient anglais} et E = {élèves qui étudient espagnol}</p>
        <p class="mt-2"><strong>Étape 1 :</strong> A ∩ E = 10 (les deux langues)</p>
        <p><strong>Étape 2 :</strong> Seulement anglais = 25 - 10 = 15</p>
        <p><strong>Étape 3 :</strong> Seulement espagnol = 18 - 10 = 8</p>
        <p><strong>Étape 4 :</strong> Total avec au moins une langue = 15 + 10 + 8 = 33</p>
        <p><strong>Étape 5 :</strong> Aucune langue = 40 - 33 = 7</p>
        <p class="mt-3 font-semibold text-accent">Réponse : 7 élèves n'étudient aucune de ces deux langues</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 4 - Complément
    </h4>
    <p class="mb-3">
      Soit E = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10} et A = {2, 4, 6, 8, 10}. 
      Déterminer Ā (le complément de A).
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p>Le complément de A (noté Ā) contient tous les éléments de E qui ne sont pas dans A</p>
        <p class="mt-2">E = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}</p>
        <p>A = {2, 4, 6, 8, 10} (nombres pairs)</p>
        <p class="mt-2">Les éléments de E qui ne sont pas dans A sont : 1, 3, 5, 7, 9</p>
        <p class="mt-3 font-semibold text-accent font-mono">Ā = {1, 3, 5, 7, 9} (les nombres impairs)</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-primary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 5 - Application au marché
    </h4>
    <p class="mb-3">
      Au marché, 30 vendeurs vendent des mangues (M), 20 vendent des avocats (A) et 12 vendent les deux fruits. 
      Combien de vendeurs au total vendent au moins un de ces deux fruits ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p>On cherche |M ∪ A| (le nombre d'éléments dans la réunion)</p>
        <p class="mt-2 font-semibold">Formule : |M ∪ A| = |M| + |A| - |M ∩ A|</p>
        <p class="mt-3">|M| = 30 (vendeurs de mangues)</p>
        <p>|A| = 20 (vendeurs d'avocats)</p>
        <p>|M ∩ A| = 12 (vendeurs des deux)</p>
        <p class="mt-3">|M ∪ A| = 30 + 20 - 12 = 38</p>
        <p class="mt-3 font-semibold text-accent">Réponse : 38 vendeurs vendent au moins un de ces deux fruits</p>
        <p class="text-sm mt-2 italic">Note : On soustrait |M ∩ A| car ces vendeurs ont été comptés deux fois</p>
      </div>
    </details>
  </div>

</div>`
  },

  // December Weeks 1-3 - PLANS ET DROITES (New - Missing from MENFP)
  "plans-droites": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier et définir les plans, points, droites, demi-droites et segments
• Reconnaître des droites parallèles et perpendiculaires
• Construire une droite parallèle ou perpendiculaire
• Définir et construire le milieu et la médiatrice d'un segment
• Mesurer la distance entre deux points`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">La géométrie commence ici !</span> 
    Les plans, les droites et les points sont les éléments de base de toute la géométrie. 
    <span class="italic">C'est comme l'alphabet de la géométrie !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Comprendre ces notions fondamentales te permettra de construire des figures géométriques, 
    de mesurer des distances et de <span class="font-semibold text-accent">résoudre des problèmes de construction</span> 
    dans la vie réelle - comme tracer des routes parallèles ou construire des murs perpendiculaires !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le saviez-vous ?</span> Les arpenteurs en Haïti 
    utilisent ces principes pour mesurer et diviser les terres avec précision !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Plans, Points et Droites -->
  <section class="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      📍 Plans, Points et Droites
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">1️⃣ Le Plan</h4>
        <p class="leading-relaxed">
          Un <strong>plan</strong> est une surface plane qui s'étend à l'infini dans toutes les directions. 
          Imagine une feuille de papier qui continue sans fin !
        </p>
        <p class="mt-2 text-sm italic">Exemple : La surface d'un tableau noir, le dessus d'une table</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">2️⃣ Le Point</h4>
        <p class="leading-relaxed">
          Un <strong>point</strong> est un emplacement précis dans l'espace, sans dimension. 
          On le note avec une lettre majuscule : A, B, C...
        </p>
        <p class="mt-2 text-sm">Notation : • A (le point A)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">3️⃣ La Droite</h4>
        <p class="leading-relaxed">
          Une <strong>droite</strong> est une ligne droite qui s'étend à l'infini dans les deux directions. 
          Elle passe par au moins deux points.
        </p>
        <p class="mt-2 text-sm">Notation : (AB) - la droite passant par A et B</p>
        <p class="mt-1 text-sm">Propriété : Par deux points distincts, il passe une seule droite</p>
      </div>
    </div>
  </section>

  <!-- Section 2: Segments et Demi-droites -->
  <section class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✂️ Segments et Demi-droites
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📏 Le Segment [AB]</h4>
        <p class="leading-relaxed mb-2">
          Un <strong>segment</strong> est une portion de droite limitée par deux points appelés extrémités.
        </p>
        <div class="bg-accent/10 p-3 rounded">
          <p class="font-mono">Notation : [AB]</p>
          <p class="text-sm mt-1">Se lit : "le segment AB" ou "segment d'extrémités A et B"</p>
        </div>
        <p class="mt-3 text-sm"><strong>Longueur :</strong> La distance entre A et B est notée AB (sans crochets)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">➡️ La Demi-droite [AB)</h4>
        <p class="leading-relaxed mb-2">
          Une <strong>demi-droite</strong> commence en un point (origine) et s'étend à l'infini dans une direction.
        </p>
        <div class="bg-accent/10 p-3 rounded">
          <p class="font-mono">Notation : [AB)</p>
          <p class="text-sm mt-1">A est l'origine, la demi-droite passe par B et continue à l'infini</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📐 Demi-plan</h4>
        <p class="leading-relaxed">
          Un <strong>demi-plan</strong> est une portion de plan limitée par une droite. 
          La droite divise le plan en deux demi-plans.
        </p>
      </div>
    </div>

    <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">🏫 Exemple pratique</h4>
      <p>La route nationale divise le terrain en deux demi-plans : un côté montagne, un côté mer</p>
    </div>
  </section>

  <!-- Section 3: Position relative de deux droites -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ↔️ Position relative de deux droites
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">1️⃣ Droites Parallèles (∥)</h4>
        <p class="leading-relaxed">
          Deux droites sont <strong>parallèles</strong> si elles ne se rencontrent jamais, 
          même si on les prolonge à l'infini.
        </p>
        <p class="mt-2 font-mono">Notation : (d₁) ∥ (d₂)</p>
        <p class="mt-2 text-sm italic">Exemple : Les rails de chemin de fer, les lignes d'un cahier</p>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
          <p class="font-semibold text-sm">Construction :</p>
          <p class="text-sm">Pour tracer une parallèle à une droite passant par un point, 
          utilise une équerre et une règle</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">2️⃣ Droites Perpendiculaires (⊥)</h4>
        <p class="leading-relaxed">
          Deux droites sont <strong>perpendiculaires</strong> si elles se coupent en formant un angle droit (90°).
        </p>
        <p class="mt-2 font-mono">Notation : (d₁) ⊥ (d₂)</p>
        <p class="mt-2 text-sm italic">Exemple : Le coin d'une table, les murs d'une maison</p>
        <div class="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded">
          <p class="font-semibold text-sm">Construction :</p>
          <p class="text-sm">Utilise une équerre : place un côté sur la droite, 
          l'autre côté donne la perpendiculaire</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">3️⃣ Droites Sécantes</h4>
        <p class="leading-relaxed">
          Deux droites sont <strong>sécantes</strong> si elles se coupent en un point (mais pas à 90°).
        </p>
        <p class="mt-2 text-sm italic">Exemple : Deux routes qui se croisent</p>
      </div>
    </div>
  </section>

  <!-- Section 4: Points alignés et distance -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      🎯 Points alignés et distance
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📍 Points alignés</h4>
        <p class="leading-relaxed">
          Des points sont <strong>alignés</strong> s'ils appartiennent à une même droite.
        </p>
        <p class="mt-2 text-sm">Pour vérifier : trace une règle, si tous les points touchent la règle, ils sont alignés</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📏 Distance entre deux points</h4>
        <p class="leading-relaxed mb-2">
          La <strong>distance</strong> entre deux points A et B est la longueur du segment [AB].
        </p>
        <div class="bg-accent/10 p-3 rounded">
          <p>Notation : AB (ou BA, c'est la même distance)</p>
          <p class="text-sm mt-1">Se mesure avec une règle graduée en cm, m, km...</p>
        </div>
        <p class="mt-3 text-sm font-semibold">Propriété importante : AB = BA (la distance est la même dans les deux sens)</p>
      </div>
    </div>

    <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">🏫 Exemple haïtien</h4>
      <p>Port-au-Prince, Carrefour et Gressier sont alignés sur la route nationale #2. 
      La distance entre Port-au-Prince et Carrefour est environ 11 km.</p>
    </div>
  </section>

  <!-- Section 5: Milieu d'un segment -->
  <section class="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
      ⚡ Milieu d'un segment
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">
          Le <strong>milieu</strong> d'un segment [AB] est le point M qui partage le segment en deux parties égales.
        </p>
        <div class="mt-3 bg-accent/10 p-3 rounded">
          <p class="font-mono">AM = MB = AB/2</p>
          <p class="text-sm mt-1">M est à égale distance de A et de B</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔨 Construction du milieu</h4>
        <ol class="space-y-2 list-decimal list-inside ml-4">
          <li>Trace le segment [AB]</li>
          <li>Avec le compas centré en A, trace un arc de cercle</li>
          <li>Avec le même écartement, centré en B, trace un autre arc</li>
          <li>Les deux arcs se coupent en deux points</li>
          <li>Trace la droite passant par ces deux points : elle coupe [AB] en son milieu M</li>
        </ol>
      </div>
    </div>
  </section>

  <!-- Section 6: Médiatrice d'un segment -->
  <section class="bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-rose-700 dark:text-rose-300">
      ⚖️ Médiatrice d'un segment
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">
          La <strong>médiatrice</strong> d'un segment [AB] est la droite perpendiculaire au segment 
          qui passe par son milieu.
        </p>
        <p class="mt-2 text-sm font-mono">Médiatrice ⊥ [AB] et passe par le milieu M</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriété fondamentale</h4>
        <p class="leading-relaxed">
          Tout point de la médiatrice est à <strong>égale distance</strong> des extrémités du segment.
        </p>
        <div class="mt-3 bg-green-50 dark:bg-green-900/20 p-3 rounded">
          <p>Si M est sur la médiatrice de [AB], alors :</p>
          <p class="font-mono mt-1">MA = MB</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔨 Construction de la médiatrice</h4>
        <p class="mb-2">La construction est la même que pour trouver le milieu :</p>
        <ol class="space-y-2 list-decimal list-inside ml-4 text-sm">
          <li>Trace le segment [AB]</li>
          <li>Centre le compas en A, trace un arc (grand rayon)</li>
          <li>Même écartement en B, trace un autre arc</li>
          <li>Les arcs se coupent en 2 points</li>
          <li>La droite passant par ces 2 points est la médiatrice</li>
        </ol>
      </div>
    </div>

    <div class="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
      <h4 class="font-semibold mb-2">🏗️ Application pratique</h4>
      <p>Pour installer un puits qui soit à égale distance de deux maisons A et B, 
      on le place sur la médiatrice du segment [AB] !</p>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 1 - Notation
    </h4>
    <p class="mb-3">Quelle est la différence entre :</p>
    <p class="ml-4">a) (AB)</p>
    <p class="ml-4">b) [AB]</p>
    <p class="ml-4">c) [AB)</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>a) (AB)</strong> - La droite infinie passant par A et B</p>
        <p><strong>b) [AB]</strong> - Le segment limité entre A et B (avec les extrémités)</p>
        <p><strong>c) [AB)</strong> - La demi-droite qui commence en A, passe par B et continue à l'infini</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-secondary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 2 - Points alignés
    </h4>
    <p class="mb-3">
      On donne trois points A, B et C. AB = 5 cm, BC = 3 cm et AC = 8 cm. 
      Les points A, B et C sont-ils alignés ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>Oui, les points sont alignés !</strong></p>
        <p class="mt-2">Vérification : AB + BC = 5 + 3 = 8 cm = AC</p>
        <p>Quand la somme de deux distances égale la troisième, les points sont alignés dans cet ordre : A, B, C</p>
        <p class="mt-2 text-sm italic">B est entre A et C sur la droite</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-secondary/5 to-primary/5 p-6 rounded-xl border-l-4 border-secondary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 3 - Milieu d'un segment
    </h4>
    <p class="mb-3">
      M est le milieu du segment [AB] avec AB = 12 cm. Calculer AM et MB.
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p>Le milieu partage le segment en deux parties égales</p>
        <p class="mt-2"><strong>AM = MB = AB/2</strong></p>
        <p class="mt-2">AM = 12/2 = 6 cm</p>
        <p>MB = 12/2 = 6 cm</p>
        <p class="mt-3 font-semibold text-accent">Réponse : AM = MB = 6 cm</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 4 - Droites parallèles
    </h4>
    <p class="mb-3">
      Deux routes parallèles (d₁) et (d₂) sont distantes de 50 mètres. 
      Si on marche perpendiculairement de (d₁) vers (d₂), quelle distance parcourt-on ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p>La distance entre deux droites parallèles est toujours la même</p>
        <p class="mt-2">La distance perpendiculaire est la plus courte distance entre les deux droites</p>
        <p class="mt-3 font-semibold text-accent">Réponse : On parcourt 50 mètres</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-primary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 5 - Médiatrice
    </h4>
    <p class="mb-3">
      Un point P est sur la médiatrice du segment [AB]. On sait que PA = 7 cm. 
      Que vaut PB ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>Propriété de la médiatrice :</strong></p>
        <p>Tout point sur la médiatrice est à égale distance des extrémités du segment</p>
        <p class="mt-3">Donc si P est sur la médiatrice de [AB] :</p>
        <p class="font-mono">PA = PB</p>
        <p class="mt-3 font-semibold text-accent">Réponse : PB = 7 cm</p>
      </div>
    </details>
  </div>

</div>`
  },

  // December Week 3 - NOMBRES NATURELS (New - Missing from MENFP)
  "nombres-naturels": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Calculer mentalement et par écrit des sommes, produits, différences et quotients
• Connaître et utiliser les règles de priorité opératoire (PEMDAS)
• Déplacer correctement les termes d'une chaîne d'opérations
• Définir et calculer les puissances entières positives
• Calculer le produit de puissances d'un même nombre`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Les nombres naturels sont la base de toutes les mathématiques !</span> 
    Ce sont les nombres que tu utilises pour compter : 0, 1, 2, 3, 4, 5...
    <span class="italic">Ils sont partout dans notre vie quotidienne !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Maîtriser les opérations sur les nombres naturels et comprendre l'ordre des opérations 
    te permettra de <span class="font-semibold text-accent">résoudre n'importe quel calcul</span> avec confiance, 
    que ce soit pour compter l'argent au marché ou calculer des quantités !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Astuce :</span> PEMDAS est la clé ! 
    Parenthèses, Exposants, Multiplication/Division, Addition/Soustraction - dans cet ordre !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Les quatre opérations -->
  <section class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ➕➖✖️➗ Les quatre opérations de base
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">1️⃣ Addition (+)</h4>
        <p class="leading-relaxed">Additionner c'est <strong>ajouter</strong>, combiner des quantités</p>
        <p class="mt-2 font-mono">Exemple : 15 + 23 = 38</p>
        <p class="text-sm mt-1 italic">Au marché : 15 gourdes + 23 gourdes = 38 gourdes</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">2️⃣ Soustraction (-)</h4>
        <p class="leading-relaxed">Soustraire c'est <strong>retirer</strong>, enlever une quantité</p>
        <p class="mt-2 font-mono">Exemple : 50 - 18 = 32</p>
        <p class="text-sm mt-1 italic">J'avais 50 gourdes, j'ai dépensé 18, il reste 32</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">3️⃣ Multiplication (×)</h4>
        <p class="leading-relaxed">Multiplier c'est faire une <strong>addition répétée</strong></p>
        <p class="mt-2 font-mono">Exemple : 6 × 4 = 24</p>
        <p class="text-sm mt-1">C'est comme 6 + 6 + 6 + 6 = 24</p>
        <p class="text-sm mt-1 italic">6 paquets de 4 mangues = 24 mangues</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">4️⃣ Division (÷ ou /)</h4>
        <p class="leading-relaxed">Diviser c'est <strong>partager</strong> en parts égales</p>
        <p class="mt-2 font-mono">Exemple : 24 ÷ 6 = 4</p>
        <p class="text-sm mt-1 italic">24 mangues partagées entre 6 personnes = 4 mangues chacun</p>
      </div>
    </div>
  </section>

  <!-- Section 2: Ordre des opérations (PEMDAS) -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      🎯 Ordre des opérations - PEMDAS
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 La règle d'or : PEMDAS</h4>
        <p class="leading-relaxed mb-3">Pour calculer correctement, suis cet ordre :</p>
        <ol class="space-y-2 list-decimal list-inside ml-4">
          <li><strong class="text-primary">P</strong>arenthèses : ( )</li>
          <li><strong class="text-primary">E</strong>xposants (Puissances) : ²,  ³</li>
          <li><strong class="text-primary">M</strong>ultiplication et <strong class="text-primary">D</strong>ivision : × et ÷ (de gauche à droite)</li>
          <li><strong class="text-primary">A</strong>ddition et <strong class="text-primary">S</strong>oustraction : + et - (de gauche à droite)</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple détaillé</h4>
        <p class="mb-2">Calcule : 15 + 3 × 4</p>
        <div class="bg-accent/10 p-3 rounded space-y-1">
          <p class="text-sm">❌ <strong>Faux :</strong> 15 + 3 = 18, puis 18 × 4 = 72</p>
          <p class="text-sm text-green-600 font-semibold">✅ <strong>Correct :</strong> 3 × 4 = 12, puis 15 + 12 = 27</p>
        </div>
        <p class="mt-2 text-sm italic">On fait la multiplication avant l'addition !</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Avec parenthèses</h4>
        <p class="mb-2">Calcule : (15 + 3) × 4</p>
        <div class="bg-accent/10 p-3 rounded">
          <p class="text-sm"><strong>Étape 1 :</strong> Parenthèses : 15 + 3 = 18</p>
          <p class="text-sm"><strong>Étape 2 :</strong> Multiplication : 18 × 4 = 72</p>
          <p class="mt-2 font-mono text-accent">Réponse : 72</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Chaînes d'opérations -->
  <section class="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      🔗 Chaînes d'opérations
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📝 Simplifier les calculs</h4>
        <p class="leading-relaxed">On peut déplacer les termes pour faciliter le calcul :</p>
        <div class="mt-3 space-y-2">
          <p class="font-mono">25 + 37 + 75</p>
          <p class="text-sm">On peut regrouper : (25 + 75) + 37 = 100 + 37 = 137</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés utiles</h4>
        <ul class="space-y-2 list-disc list-inside ml-4">
          <li><strong>Commutativité :</strong> a + b = b + a et a × b = b × a</li>
          <li><strong>Associativité :</strong> (a + b) + c = a + (b + c)</li>
          <li><strong>Distributivité :</strong> a × (b + c) = a × b + a × c</li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple pratique</h4>
        <p class="mb-2">Calcule : 5 × 23 + 5 × 7</p>
        <div class="bg-accent/10 p-3 rounded">
          <p class="text-sm">On peut factoriser par 5 :</p>
          <p class="text-sm mt-1">5 × (23 + 7) = 5 × 30 = 150</p>
          <p class="text-sm mt-2 italic">C'est plus rapide que 115 + 35 !</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Puissances entières positives -->
  <section class="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ⚡ Puissances entières positives
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">Une <strong>puissance</strong> est une multiplication répétée :</p>
        <div class="mt-3 bg-accent/10 p-3 rounded">
          <p class="font-mono text-lg">aⁿ = a × a × a × ... × a (n fois)</p>
          <p class="text-sm mt-2">a est la <strong>base</strong>, n est l'<strong>exposant</strong></p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Exemples</h4>
        <div class="space-y-2">
          <p class="font-mono">2³ = 2 × 2 × 2 = 8</p>
          <p class="font-mono">5² = 5 × 5 = 25</p>
          <p class="font-mono">10⁴ = 10 × 10 × 10 × 10 = 10 000</p>
          <p class="font-mono">3¹ = 3 (n'importe quel nombre à la puissance 1 est lui-même)</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Cas particuliers</h4>
        <ul class="space-y-2 list-disc list-inside ml-4">
          <li>a⁰ = 1 (tout nombre à la puissance 0 égale 1)</li>
          <li>a¹ = a (tout nombre à la puissance 1 est lui-même)</li>
          <li>1ⁿ = 1 (1 élevé à n'importe quelle puissance égale 1)</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 5: Produit de puissances -->
  <section class="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-rose-200 dark:border-rose-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-rose-700 dark:text-rose-300">
      🎯 Produit de puissances
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Règle fondamentale</h4>
        <p class="leading-relaxed">Pour multiplier des puissances de même base :</p>
        <div class="mt-3 bg-accent/10 p-3 rounded">
          <p class="font-mono text-lg">aᵐ × aⁿ = aᵐ⁺ⁿ</p>
          <p class="text-sm mt-2">On <strong>additionne les exposants</strong> !</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemples</h4>
        <div class="space-y-3">
          <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded">
            <p class="font-mono">2³ × 2² = 2³⁺² = 2⁵ = 32</p>
            <p class="text-sm mt-1">Vérification : (2×2×2) × (2×2) = 8 × 4 = 32 ✓</p>
          </div>
          <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
            <p class="font-mono">5² × 5⁴ = 5²⁺⁴ = 5⁶ = 15 625</p>
          </div>
          <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
            <p class="font-mono">10³ × 10² = 10⁵ = 100 000</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">⚠️ Attention !</h4>
        <p class="leading-relaxed">Cette règle marche seulement avec la <strong>même base</strong> :</p>
        <div class="mt-3 space-y-2">
          <p class="text-sm">✅ 3² × 3⁴ = 3⁶ (même base : 3)</p>
          <p class="text-sm">❌ 2³ × 3² ≠ 6⁵ (bases différentes !)</p>
          <p class="text-sm mt-2 italic">Avec bases différentes, il faut d'abord calculer : 2³ × 3² = 8 × 9 = 72</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Applications pratiques -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🏫 Applications pratiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🛒 Au marché</h4>
        <p>5 sacs de riz à 250 gourdes chacun + 3 sacs de haricots à 150 gourdes</p>
        <p class="mt-2 font-mono">5 × 250 + 3 × 150 = 1250 + 450 = 1700 gourdes</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📦 Empaquetage</h4>
        <p>Une caisse contient 10 boîtes, chaque boîte contient 10 paquets, chaque paquet a 10 bonbons</p>
        <p class="mt-2 font-mono">Total = 10³ = 10 × 10 × 10 = 1000 bonbons</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🏗️ Construction</h4>
        <p>Un terrain carré de 2⁴ mètres de côté. Quelle est l'aire ?</p>
        <p class="mt-2 font-mono">Aire = côté² = (2⁴)² = 2⁸ = 256 m²</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-r from-primary/5 to-accent/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 1 - Ordre des opérations
    </h4>
    <p class="mb-3">Calcule en respectant l'ordre des opérations :</p>
    <p class="ml-4">a) 12 + 8 × 2</p>
    <p class="ml-4">b) (12 + 8) × 2</p>
    <p class="ml-4">c) 30 ÷ 6 + 4</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-3">
        <div>
          <p><strong>a) 12 + 8 × 2</strong></p>
          <p class="text-sm">Multiplication d'abord : 8 × 2 = 16</p>
          <p class="text-sm">Puis addition : 12 + 16 = 28</p>
          <p class="font-semibold text-accent">Réponse : 28</p>
        </div>
        <div>
          <p><strong>b) (12 + 8) × 2</strong></p>
          <p class="text-sm">Parenthèses d'abord : 12 + 8 = 20</p>
          <p class="text-sm">Puis multiplication : 20 × 2 = 40</p>
          <p class="font-semibold text-accent">Réponse : 40</p>
        </div>
        <div>
          <p><strong>c) 30 ÷ 6 + 4</strong></p>
          <p class="text-sm">Division d'abord : 30 ÷ 6 = 5</p>
          <p class="text-sm">Puis addition : 5 + 4 = 9</p>
          <p class="font-semibold text-accent">Réponse : 9</p>
        </div>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-secondary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 2 - Puissances
    </h4>
    <p class="mb-3">Calcule les puissances suivantes :</p>
    <p class="ml-4">a) 2⁴</p>
    <p class="ml-4">b) 5³</p>
    <p class="ml-4">c) 10²</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>a) 2⁴ = 2 × 2 × 2 × 2 = 16</strong></p>
        <p><strong>b) 5³ = 5 × 5 × 5 = 125</strong></p>
        <p><strong>c) 10² = 10 × 10 = 100</strong></p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-secondary/5 to-primary/5 p-6 rounded-xl border-l-4 border-secondary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 3 - Produit de puissances
    </h4>
    <p class="mb-3">Simplifie en utilisant la règle aᵐ × aⁿ = aᵐ⁺ⁿ :</p>
    <p class="ml-4">a) 3² × 3³</p>
    <p class="ml-4">b) 2⁴ × 2¹</p>
    <p class="ml-4">c) 10² × 10³</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-3">
        <div>
          <p><strong>a) 3² × 3³ = 3²⁺³ = 3⁵ = 243</strong></p>
          <p class="text-sm">On additionne les exposants : 2 + 3 = 5</p>
        </div>
        <div>
          <p><strong>b) 2⁴ × 2¹ = 2⁴⁺¹ = 2⁵ = 32</strong></p>
          <p class="text-sm">On additionne les exposants : 4 + 1 = 5</p>
        </div>
        <div>
          <p><strong>c) 10² × 10³ = 10²⁺³ = 10⁵ = 100 000</strong></p>
          <p class="text-sm">On additionne les exposants : 2 + 3 = 5</p>
        </div>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl border-l-4 border-primary">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 4 - Problème au marché
    </h4>
    <p class="mb-3">
      Marie achète 3 paquets de cahiers à 75 gourdes chacun et 5 stylos à 15 gourdes chacun. 
      Combien dépense-t-elle au total ?
    </p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>Calcul :</strong></p>
        <p class="mt-2">Coût des cahiers : 3 × 75 = 225 gourdes</p>
        <p>Coût des stylos : 5 × 15 = 75 gourdes</p>
        <p class="mt-2">Total : 225 + 75 = 300 gourdes</p>
        <p class="mt-3 font-semibold text-accent">Réponse : Marie dépense 300 gourdes</p>
      </div>
    </details>
  </div>

  <div class="bg-gradient-to-r from-accent/5 to-primary/5 p-6 rounded-xl border-l-4 border-accent">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
      <span class="text-2xl">📝</span> Exercice 5 - Chaîne complexe
    </h4>
    <p class="mb-3">Calcule : 5 × (3 + 2)² - 10</p>
    
    <details class="mt-4">
      <summary class="cursor-pointer font-semibold text-primary hover:text-accent">
        ✅ Voir la solution
      </summary>
      <div class="mt-3 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-2">
        <p><strong>Suivons PEMDAS :</strong></p>
        <p class="mt-2"><strong>P</strong> - Parenthèses : 3 + 2 = 5</p>
        <p><strong>E</strong> - Exposant : 5² = 25</p>
        <p><strong>M</strong> - Multiplication : 5 × 25 = 125</p>
        <p><strong>S</strong> - Soustraction : 125 - 10 = 115</p>
        <p class="mt-3 font-semibold text-accent">Réponse : 115</p>
      </div>
    </details>
  </div>

</div>`
  },

  "decimaux": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Lire et écrire des nombres décimaux sous différentes formes
• Comparer et ordonner des nombres décimaux
• Effectuer les quatre opérations sur les nombres décimaux
• Résoudre des problèmes de la vie courante utilisant les décimaux`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment diviser un gâteau en plusieurs parts égales ?</span> 
    Ou comment savoir si 25,50 gourdes est plus que 25,05 gourdes ? 
    <span class="italic">C'est là que les nombres décimaux entrent en jeu !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les nombres décimaux que nous utilisons chaque jour - dans l'argent, les mesures, les calculs. 
    Ils nous permettent de représenter des <span class="font-semibold text-accent">fractions avec précision</span>, 
    comme lorsque nous achetons 2,5 livres de riz ou mesurons 1,75 mètres de tissu.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Un nombre décimal est comme une phrase - 
    la partie avant la virgule est le "mot entier", et la partie après la virgule est le "détail" !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions clés -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Définitions clés
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Nombre décimal</h4>
        <p class="leading-relaxed">
          Un nombre décimal est comme une phrase avec deux parties : 
          <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">25,75</span> a 
          <span class="font-semibold text-primary">25</span> (partie entière) et 
          <span class="font-semibold text-accent">75</span> (partie décimale).
        </p>
        <p class="mt-2 text-sm text-muted-foreground italic">
          Exemple : 3,14 • 0,5 • 12,008 • 100,25
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Fraction décimale</h4>
        <p class="leading-relaxed">
          C'est une fraction qui a 10, 100, 1000, ... comme dénominateur.
        </p>
        <p class="mt-2 font-mono text-lg">
          7/10 = 0,7  •  25/100 = 0,25  •  8/1000 = 0,008
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Écriture décimale et fractionnaire</h4>
        <p class="leading-relaxed">
          Chaque nombre décimal peut s'écrire comme une fraction, et chaque fraction décimale peut s'écrire comme un nombre décimal.
        </p>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-lg">
            3,25 = 3 + 2/10 + 5/100 = 325/100 = 13/4
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Comparaison et ordre -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📊 Comparaison et ordre
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Méthode de comparaison</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li class="leading-relaxed"><span class="font-semibold">Comparer la partie entière</span> - Si elles sont différentes, la plus grande partie entière a la plus grande valeur</li>
          <li class="leading-relaxed"><span class="font-semibold">Si les parties entières sont égales</span> - Comparer le premier chiffre après la virgule</li>
          <li class="leading-relaxed"><span class="font-semibold">Si elles sont toujours égales</span> - Continuer à comparer chiffre par chiffre</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple pratique</h4>
        <p class="leading-relaxed mb-3">Comparer 25,75 et 25,8</p>
        <div class="space-y-2 text-sm">
          <p>✓ Partie entière : 25 = 25 (elles sont égales)</p>
          <p>✓ Premier décimal : 7 &lt; 8</p>
          <p class="font-bold text-accent mt-3">Résultat : 25,75 &lt; 25,8</p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Attention :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">0,8 &gt; 0,75 parce que 8 dixièmes (80/100) est plus grand que 75 centièmes !</p>
      </div>
    </div>
  </section>

  <!-- Section 3: Opérations -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ➕➖✖️➗ Opérations sur les décimaux
    </h3>
    
    <div class="space-y-5">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ➕ Addition et soustraction
        </h4>
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règle :</span> Aligner les virgules les unes sous les autres, puis faire l'addition ou la soustraction normalement.</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded font-mono text-sm">
          <pre>   12,75
+   3,8  
---------
   16,55</pre>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ✖️ Multiplication
        </h4>
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règle :</span> Faire la multiplication sans tenir compte de la virgule, puis compter le total de décimales.</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono mb-2">2,5 × 3,2</p>
          <p class="text-sm">→ 25 × 32 = 800</p>
          <p class="text-sm">→ 2 décimales (1+1) → <span class="font-bold text-accent">8,00 = 8</span></p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ➗ Division
        </h4>
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règle :</span> Déplacer la virgule dans le dividende, continuer à diviser.</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono">12,6 ÷ 3 = 4,2</p>
          <p class="text-sm mt-2">Parce que 12,6 = 126/10, et 126 ÷ 3 = 42, donc 12,6 ÷ 3 = 42/10 = 4,2</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Propriétés importantes -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✨ Propriétés importantes
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Égalité avec zéros</h4>
        <p class="leading-relaxed mb-2">On peut ajouter ou retirer des zéros à la fin de la partie décimale sans changer la valeur :</p>
        <p class="font-mono text-lg">3,5 = 3,50 = 3,500 = 3,5000</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔄 Multiplication par 10, 100, 1000</h4>
        <p class="leading-relaxed mb-2">Déplacer la virgule à droite pour chaque zéro :</p>
        <div class="space-y-1 font-mono text-sm">
          <p>3,45 × 10 = 34,5</p>
          <p>3,45 × 100 = 345</p>
          <p>3,45 × 1000 = 3450</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">↩️ Division par 10, 100, 1000</h4>
        <p class="leading-relaxed mb-2">Déplacer la virgule à gauche pour chaque zéro :</p>
        <div class="space-y-1 font-mono text-sm">
          <p>345 ÷ 10 = 34,5</p>
          <p>345 ÷ 100 = 3,45</p>
          <p>345 ÷ 1000 = 0,345</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Exemples de la vie courante -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      🌟 Exemples de la vie courante
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🛒 Au marché</h4>
        <p class="mb-2">Marie achète 2,5 kg de bananes à 45 gourdes/kg. Combien paie-t-elle ?</p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-mono">2,5 × 45 = 112,5 gourdes</p>
          <p class="text-sm mt-1 text-muted-foreground">Marie paie 112 gourdes 50 centimes</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📏 Mesure de tissu</h4>
        <p class="mb-2">Un tailleur a 15,75m de tissu. Il vend 8,5m. Combien reste-t-il ?</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-mono">15,75 - 8,5 = 7,25 m</p>
          <p class="text-sm mt-1 text-muted-foreground">Il reste 7,25 mètres</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-lg mb-2 text-primary">💰 Partage d'argent</h4>
        <p class="mb-2">3 amis partagent 250,50 gourdes également. Chacun reçoit combien ?</p>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
          <p class="font-mono">250,50 ÷ 3 = 83,50 gourdes</p>
          <p class="text-sm mt-1 text-muted-foreground">Chaque ami reçoit 83 gourdes 50 centimes</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Toujours aligner les virgules</span> lorsque tu fais une addition ou une soustraction</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Compter les décimales correctement</span> après une multiplication ou une division</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifier tes résultats</span> en utilisant une estimation (arrondi)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pratiquer chaque jour</span> avec des exemples de la vie réelle pour bien comprendre</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Comparer des décimaux -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Comparaison (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Compare deux à deux chaque paire et mets le signe correct (&lt;, &gt;, ou =) :</p>
    <div class="space-y-2 font-mono text-base ml-4">
      <p>a) 12,5 ___ 12,50</p>
      <p>b) 8,75 ___ 8,8</p>
      <p>c) 0,6 ___ 0,58</p>
      <p>d) 25,03 ___ 25,3</p>
    </div>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solutions :</p>
      <div class="space-y-1 text-sm">
        <p>a) 12,5 <span class="font-bold text-green-600">=</span> 12,50 (même valeur, les zéros ne changent rien)</p>
        <p>b) 8,75 <span class="font-bold text-green-600">&lt;</span> 8,8 (75/100 &lt; 80/100)</p>
        <p>c) 0,6 <span class="font-bold text-green-600">&gt;</span> 0,58 (60/100 &gt; 58/100)</p>
        <p>d) 25,03 <span class="font-bold text-green-600">&lt;</span> 25,3 (3/100 &lt; 30/100)</p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Addition et soustraction -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Addition et Soustraction (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule ces opérations :</p>
    <div class="space-y-3">
      <div>
        <p class="font-mono mb-2">a) 15,75 + 8,3 = ?</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <p class="text-sm mb-1">Aligne les virgules :</p>
          <pre class="font-mono text-xs">  15,75
+  8,30
-------
  24,05</pre>
          <p class="mt-2 font-semibold text-green-600">Réponse : 24,05</p>
        </div>
      </div>
      <div>
        <p class="font-mono mb-2">b) 50,00 - 17,85 = ?</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <pre class="font-mono text-xs">  50,00
- 17,85
-------
  32,15</pre>
          <p class="mt-2 font-semibold text-green-600">Réponse : 32,15</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Multiplication -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Multiplication (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Marie achète 3,5 kg de légumes à 40 gourdes/kg. Combien paie-t-elle au total ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Calcul :</span> 3,5 × 40</p>
        <p>→ 35 × 40 = 1400</p>
        <p>→ 1 décimale → <span class="font-bold text-orange-600">140,0 gourdes</span></p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse finale :</span> Marie paie 140 gourdes
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Division -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Division (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">4 amis partagent 87,60 gourdes également. Chacun reçoit combien ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Calcul :</span> 87,60 ÷ 4</p>
        <p>→ 876 ÷ 4 = 219</p>
        <p>→ 2 décimales → <span class="font-bold text-purple-600">21,90 gourdes</span></p>
        <div class="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600 mb-1">✅ Réponse finale :</p>
          <p>Chaque ami reçoit 21 gourdes 90 centimes (21,90 gourdes)</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: Problème complexe -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Complexe (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un tailleur a 25,75m de tissu. Il vend 8,5m à 120 gourdes/m, puis 12,25m à 150 gourdes/m. Combien de tissu reste-t-il ? Combien d'argent gagne-t-il au total ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Étape 1 : Tissu restant</p>
          <p>Total tissu vendu = 8,5 + 12,25 = 20,75m</p>
          <p>Tissu restant = 25,75 - 20,75 = <span class="font-bold text-blue-600">5m</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 2 : Argent première vente</p>
          <p>8,5 × 120 = <span class="font-bold text-green-600">1020 gourdes</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 3 : Argent deuxième vente</p>
          <p>12,25 × 150 = <span class="font-bold text-green-600">1837,50 gourdes</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>• Tissu restant : <span class="font-bold">5 mètres</span></p>
          <p>• Argent total : 1020 + 1837,50 = <span class="font-bold">2857,50 gourdes</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "numeration-binaire": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Comprendre le système de numération binaire (base 2)
• Convertir des nombres décimaux en binaire et vice-versa
• Effectuer des additions et soustractions en binaire
• Comprendre l'utilité du binaire en informatique`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment les ordinateurs comptent-ils ?</span> 
    Contrairement à nous qui utilisons 10 chiffres (0-9), les ordinateurs n'utilisent que 
    <span class="italic font-semibold text-accent">deux chiffres: 0 et 1</span>. C'est le système binaire !
  </p>
  
  <p class="text-lg leading-relaxed">
    Le système binaire est la base de toute l'informatique moderne. Chaque 0 ou 1 est appelé un 
    <span class="font-semibold text-primary">"bit"</span>, et c'est avec ces simples 0 et 1 que 
    fonctionnent tous nos téléphones, ordinateurs et technologies numériques !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le saviez-vous ?</span> 
    Dans un ordinateur, chaque 0 ou 1 représente l'état d'un interrupteur électronique : 
    éteint (0) ou allumé (1) !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Comprendre le système binaire -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      💻 Qu'est-ce que le système binaire ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Système décimal (notre système habituel)</h4>
        <p class="leading-relaxed mb-2">
          Nous utilisons 10 chiffres : <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">0, 1, 2, 3, 4, 5, 6, 7, 8, 9</span>
        </p>
        <p class="leading-relaxed">
          Chaque position représente une puissance de 10 : unités, dizaines, centaines, etc.
        </p>
        <p class="mt-2 font-mono text-lg">
          Exemple : 245 = 2×100 + 4×10 + 5×1 = 2×10² + 4×10¹ + 5×10⁰
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Système binaire (base 2)</h4>
        <p class="leading-relaxed mb-2">
          On utilise seulement 2 chiffres : <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">0 et 1</span>
        </p>
        <p class="leading-relaxed">
          Chaque position représente une puissance de 2 : 1, 2, 4, 8, 16, 32, 64, 128...
        </p>
        <p class="mt-2 font-mono text-lg">
          Exemple : 101 en binaire = 1×4 + 0×2 + 1×1 = 5 en décimal
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📊 Tableau des puissances de 2</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10">
                <th class="border border-primary/20 p-2">Position</th>
                <th class="border border-primary/20 p-2">7</th>
                <th class="border border-primary/20 p-2">6</th>
                <th class="border border-primary/20 p-2">5</th>
                <th class="border border-primary/20 p-2">4</th>
                <th class="border border-primary/20 p-2">3</th>
                <th class="border border-primary/20 p-2">2</th>
                <th class="border border-primary/20 p-2">1</th>
                <th class="border border-primary/20 p-2">0</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-primary/20 p-2 font-semibold">Puissance</td>
                <td class="border border-primary/20 p-2">2⁷</td>
                <td class="border border-primary/20 p-2">2⁶</td>
                <td class="border border-primary/20 p-2">2⁵</td>
                <td class="border border-primary/20 p-2">2⁴</td>
                <td class="border border-primary/20 p-2">2³</td>
                <td class="border border-primary/20 p-2">2²</td>
                <td class="border border-primary/20 p-2">2¹</td>
                <td class="border border-primary/20 p-2">2⁰</td>
              </tr>
              <tr class="bg-accent/10">
                <td class="border border-primary/20 p-2 font-semibold">Valeur</td>
                <td class="border border-primary/20 p-2 font-bold">128</td>
                <td class="border border-primary/20 p-2 font-bold">64</td>
                <td class="border border-primary/20 p-2 font-bold">32</td>
                <td class="border border-primary/20 p-2 font-bold">16</td>
                <td class="border border-primary/20 p-2 font-bold">8</td>
                <td class="border border-primary/20 p-2 font-bold">4</td>
                <td class="border border-primary/20 p-2 font-bold">2</td>
                <td class="border border-primary/20 p-2 font-bold">1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Conversion Décimal → Binaire -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ➡️ Convertir du décimal au binaire
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔢 Méthode des divisions successives</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li class="leading-relaxed">Diviser le nombre décimal par 2</li>
          <li class="leading-relaxed">Noter le reste (0 ou 1)</li>
          <li class="leading-relaxed">Recommencer avec le quotient obtenu</li>
          <li class="leading-relaxed">S'arrêter quand le quotient est 0</li>
          <li class="leading-relaxed">Lire les restes de bas en haut</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple : Convertir 13 en binaire</h4>
        <div class="space-y-2 font-mono text-sm bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded">
          <p>13 ÷ 2 = 6 reste <span class="font-bold text-accent">1</span></p>
          <p>6 ÷ 2 = 3 reste <span class="font-bold text-accent">0</span></p>
          <p>3 ÷ 2 = 1 reste <span class="font-bold text-accent">1</span></p>
          <p>1 ÷ 2 = 0 reste <span class="font-bold text-accent">1</span></p>
          <p class="mt-4 text-lg font-bold text-center">
            ⬆️ Lecture de bas en haut : 13₁₀ = <span class="text-accent">1101₂</span>
          </p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">💡 Astuce rapide :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">Tu peux aussi utiliser le tableau des puissances de 2 : 
        13 = 8 + 4 + 1 = 2³ + 2² + 2⁰ = 1101₂</p>
      </div>
    </div>
  </section>

  <!-- Section 3: Conversion Binaire → Décimal -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ⬅️ Convertir du binaire au décimal
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🎯 Méthode simple</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li class="leading-relaxed">Numéroter les positions de droite à gauche (en commençant par 0)</li>
          <li class="leading-relaxed">Multiplier chaque chiffre binaire par 2 élevé à la puissance de sa position</li>
          <li class="leading-relaxed">Additionner tous les résultats</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple : Convertir 1011 en décimal</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <div class="font-mono mb-3">
            <p>Position :  3    2    1    0</p>
            <p>Binaire  :  <span class="font-bold">1    0    1    1</span></p>
          </div>
          <div class="space-y-1 text-sm">
            <p>Position 0 : 1 × 2⁰ = 1 × 1 = 1</p>
            <p>Position 1 : 1 × 2¹ = 1 × 2 = 2</p>
            <p>Position 2 : 0 × 2² = 0 × 4 = 0</p>
            <p>Position 3 : 1 × 2³ = 1 × 8 = 8</p>
            <p class="mt-3 font-bold text-accent text-lg">Total : 8 + 0 + 2 + 1 = 11₁₀</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Opérations en binaire -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ➕➖ Opérations en binaire
    </h3>
    
    <div class="space-y-5">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ➕ Addition binaire
        </h4>
        <p class="mb-3 leading-relaxed">Règles de l'addition binaire :</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded font-mono">
          <p>0 + 0 = 0</p>
          <p>0 + 1 = 1</p>
          <p>1 + 0 = 1</p>
          <p>1 + 1 = 10 (0 et on retient 1)</p>
          <p>1 + 1 + 1 (avec retenue) = 11 (1 et on retient 1)</p>
        </div>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold mb-2">Exemple : 101 + 11</p>
          <pre class="font-mono text-sm">
  ¹  (retenue)
   101  (5 en décimal)
+  011  (3 en décimal)
------
  1000  (8 en décimal)
          </pre>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ➖ Soustraction binaire
        </h4>
        <p class="mb-3 leading-relaxed">Règles de la soustraction binaire :</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded font-mono">
          <p>0 - 0 = 0</p>
          <p>1 - 0 = 1</p>
          <p>1 - 1 = 0</p>
          <p>0 - 1 = 1 (avec un emprunt de 1)</p>
        </div>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold mb-2">Exemple : 110 - 11</p>
          <pre class="font-mono text-sm">
   110  (6 en décimal)
-  011  (3 en décimal)
------
   011  (3 en décimal)
          </pre>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Applications du binaire -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      🌟 Applications dans la vie réelle
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">💻 Informatique</h4>
        <p class="mb-2">Les ordinateurs stockent toutes les informations en binaire :</p>
        <ul class="list-disc list-inside space-y-1 text-sm">
          <li>Textes (chaque lettre est codée en binaire)</li>
          <li>Images (chaque pixel est un nombre binaire)</li>
          <li>Sons (convertis en nombres binaires)</li>
          <li>Vidéos (séquences d'images en binaire)</li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📱 Mémoire des appareils</h4>
        <div class="space-y-2 text-sm">
          <p><span class="font-semibold">1 bit</span> = 1 chiffre binaire (0 ou 1)</p>
          <p><span class="font-semibold">1 octet (byte)</span> = 8 bits</p>
          <p><span class="font-semibold">1 kilo-octet (KB)</span> = 1024 octets</p>
          <p><span class="font-semibold">1 méga-octet (MB)</span> = 1024 KB</p>
          <p><span class="font-semibold">1 giga-octet (GB)</span> = 1024 MB</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🔐 Codes et cryptographie</h4>
        <p class="text-sm">Le binaire est utilisé pour coder et protéger les informations sur internet, 
        dans les cartes bancaires, et pour la sécurité des communications.</p>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Mémorise les premières puissances de 2</span> : 
        1, 2, 4, 8, 16, 32, 64, 128, 256... Cela accélère les conversions !</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour vérifier ton résultat</span>, convertis dans l'autre sens pour retrouver le nombre de départ</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pratique avec de petits nombres</span> d'abord (0-15) avant de passer à des nombres plus grands</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">En binaire, le dernier chiffre</span> (à droite) indique si le nombre est pair (0) ou impair (1)</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Conversion Binaire → Décimal -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Conversion Binaire → Décimal (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Convertir les nombres binaires suivants en décimal :</p>
    <div class="space-y-2 font-mono text-base ml-4">
      <p>a) 101₂ = ?</p>
      <p>b) 1000₂ = ?</p>
      <p>c) 1111₂ = ?</p>
      <p>d) 110₂ = ?</p>
    </div>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solutions :</p>
      <div class="space-y-2 text-sm">
        <p>a) 101₂ = 1×4 + 0×2 + 1×1 = <span class="font-bold text-green-600">5</span></p>
        <p>b) 1000₂ = 1×8 + 0×4 + 0×2 + 0×1 = <span class="font-bold text-green-600">8</span></p>
        <p>c) 1111₂ = 1×8 + 1×4 + 1×2 + 1×1 = <span class="font-bold text-green-600">15</span></p>
        <p>d) 110₂ = 1×4 + 1×2 + 0×1 = <span class="font-bold text-green-600">6</span></p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Conversion Décimal → Binaire -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Conversion Décimal → Binaire (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Convertir les nombres décimaux suivants en binaire :</p>
    <div class="space-y-3">
      <div>
        <p class="font-mono mb-2">a) 7₁₀ = ?₂</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <p class="text-sm mb-1">Méthode des divisions :</p>
          <pre class="font-mono text-xs">7 ÷ 2 = 3 reste 1
3 ÷ 2 = 1 reste 1
1 ÷ 2 = 0 reste 1</pre>
          <p class="mt-2 font-semibold text-green-600">Réponse : 7₁₀ = 111₂</p>
        </div>
      </div>
      <div>
        <p class="font-mono mb-2">b) 10₁₀ = ?₂</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <pre class="font-mono text-xs">10 ÷ 2 = 5 reste 0
5 ÷ 2 = 2 reste 1
2 ÷ 2 = 1 reste 0
1 ÷ 2 = 0 reste 1</pre>
          <p class="mt-2 font-semibold text-green-600">Réponse : 10₁₀ = 1010₂</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Addition binaire -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Addition en binaire (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Effectuer l'addition suivante en binaire : 110₂ + 101₂</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <pre class="font-mono bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded">
  ¹  (retenues)
   110
+  101
------
  1011
        </pre>
        <p class="mt-3">Vérification en décimal :</p>
        <p>110₂ = 6₁₀</p>
        <p>101₂ = 5₁₀</p>
        <p>6 + 5 = 11₁₀</p>
        <p>1011₂ = 11₁₀ ✓</p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse : 110₂ + 101₂ = 1011₂</span>
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Soustraction binaire -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Soustraction en binaire (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Effectuer la soustraction suivante en binaire : 1010₂ - 11₂</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <pre class="font-mono bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded">
  1010
-  011
------
  0111
        </pre>
        <p class="mt-3">Vérification en décimal :</p>
        <p>1010₂ = 10₁₀</p>
        <p>11₂ = 3₁₀</p>
        <p>10 - 3 = 7₁₀</p>
        <p>0111₂ = 7₁₀ ✓</p>
        <div class="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600 mb-1">✅ Réponse :</p>
          <p>1010₂ - 11₂ = 0111₂ = 111₂ (ou 7 en décimal)</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: Problème appliqué -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Appliqué (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un ordinateur stocke un mot de 8 bits. Quel est le plus grand nombre décimal qu'il peut représenter ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Étape 1 : Le plus grand nombre sur 8 bits</p>
          <p>Avec 8 bits, on peut avoir tous les bits à 1 : 11111111₂</p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 2 : Conversion en décimal</p>
          <p>11111111₂ = 1×128 + 1×64 + 1×32 + 1×16 + 1×8 + 1×4 + 1×2 + 1×1</p>
          <p>= 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1</p>
          <p>= <span class="font-bold text-green-600">255₁₀</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>Le plus grand nombre décimal sur 8 bits est <span class="font-bold">255</span></p>
          <p class="mt-2 text-xs text-muted-foreground">💡 Formule générale : sur n bits, le plus grand nombre est 2ⁿ - 1</p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "unites-mesures": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Connaître les différentes unités de mesure (longueur, masse, capacité, temps)
• Convertir entre les différentes unités d'un même type
• Résoudre des problèmes pratiques avec les unités de mesure
• Utiliser correctement les préfixes du système métrique`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Combien de mètres dans un kilomètre ?</span> 
    Ou combien de grammes dans un kilogramme ? 
    <span class="italic">Les unités de mesure nous aident à quantifier le monde autour de nous !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Que ce soit pour mesurer la distance entre deux villes, peser des ingrédients pour une recette, 
    ou mesurer le temps d'un trajet, <span class="font-semibold text-accent">les unités de mesure sont essentielles</span> 
    dans notre vie quotidienne.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le saviez-vous ?</span> 
    Le système métrique utilisé en Haïti est le même que dans la plupart des pays du monde !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Unités de longueur -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      📏 Unités de longueur
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Échelle des unités de longueur</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10">
                <th class="border border-primary/20 p-2">km</th>
                <th class="border border-primary/20 p-2">hm</th>
                <th class="border border-primary/20 p-2">dam</th>
                <th class="border border-primary/20 p-2 bg-accent/20">m</th>
                <th class="border border-primary/20 p-2">dm</th>
                <th class="border border-primary/20 p-2">cm</th>
                <th class="border border-primary/20 p-2">mm</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-primary/20 p-2">kilomètre</td>
                <td class="border border-primary/20 p-2">hectomètre</td>
                <td class="border border-primary/20 p-2">décamètre</td>
                <td class="border border-primary/20 p-2 font-bold bg-accent/10">mètre</td>
                <td class="border border-primary/20 p-2">décimètre</td>
                <td class="border border-primary/20 p-2">centimètre</td>
                <td class="border border-primary/20 p-2">millimètre</td>
              </tr>
              <tr class="bg-blue-50 dark:bg-blue-950/30">
                <td class="border border-primary/20 p-2 font-mono">1000 m</td>
                <td class="border border-primary/20 p-2 font-mono">100 m</td>
                <td class="border border-primary/20 p-2 font-mono">10 m</td>
                <td class="border border-primary/20 p-2 font-mono font-bold">1 m</td>
                <td class="border border-primary/20 p-2 font-mono">0,1 m</td>
                <td class="border border-primary/20 p-2 font-mono">0,01 m</td>
                <td class="border border-primary/20 p-2 font-mono">0,001 m</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔄 Règles de conversion</h4>
        <p class="leading-relaxed mb-2">
          Pour convertir d'une unité à une autre :
        </p>
        <ul class="space-y-2 list-disc list-inside">
          <li><span class="font-semibold">Vers une unité plus petite</span> : multiplier (ou déplacer la virgule à droite)</li>
          <li><span class="font-semibold">Vers une unité plus grande</span> : diviser (ou déplacer la virgule à gauche)</li>
        </ul>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono">1 km = 1000 m  •  1 m = 100 cm  •  1 cm = 10 mm</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Unités de masse -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ⚖️ Unités de masse
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Échelle des unités de masse</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10">
                <th class="border border-primary/20 p-2">t</th>
                <th class="border border-primary/20 p-2">q</th>
                <th class="border border-primary/20 p-2">kg</th>
                <th class="border border-primary/20 p-2">hg</th>
                <th class="border border-primary/20 p-2 bg-accent/20">g</th>
                <th class="border border-primary/20 p-2">dg</th>
                <th class="border border-primary/20 p-2">cg</th>
                <th class="border border-primary/20 p-2">mg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-primary/20 p-2">tonne</td>
                <td class="border border-primary/20 p-2">quintal</td>
                <td class="border border-primary/20 p-2">kilogramme</td>
                <td class="border border-primary/20 p-2">hectogramme</td>
                <td class="border border-primary/20 p-2 font-bold bg-accent/10">gramme</td>
                <td class="border border-primary/20 p-2">décigramme</td>
                <td class="border border-primary/20 p-2">centigramme</td>
                <td class="border border-primary/20 p-2">milligramme</td>
              </tr>
              <tr class="bg-green-50 dark:bg-green-950/30">
                <td class="border border-primary/20 p-2 font-mono">1000 kg</td>
                <td class="border border-primary/20 p-2 font-mono">100 kg</td>
                <td class="border border-primary/20 p-2 font-mono">1000 g</td>
                <td class="border border-primary/20 p-2 font-mono">100 g</td>
                <td class="border border-primary/20 p-2 font-mono font-bold">1 g</td>
                <td class="border border-primary/20 p-2 font-mono">0,1 g</td>
                <td class="border border-primary/20 p-2 font-mono">0,01 g</td>
                <td class="border border-primary/20 p-2 font-mono">0,001 g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Conversions courantes</h4>
        <div class="space-y-1 font-mono text-sm">
          <p>1 t = 1000 kg</p>
          <p>1 kg = 1000 g</p>
          <p>1 g = 1000 mg</p>
          <p>1 livre (lb) ≈ 453,6 g (unité anglaise)</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Unités de capacité -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      🥤 Unités de capacité (volume)
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Échelle des unités de capacité</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm border-collapse">
            <thead>
              <tr class="bg-primary/10">
                <th class="border border-primary/20 p-2">kL</th>
                <th class="border border-primary/20 p-2">hL</th>
                <th class="border border-primary/20 p-2">daL</th>
                <th class="border border-primary/20 p-2 bg-accent/20">L</th>
                <th class="border border-primary/20 p-2">dL</th>
                <th class="border border-primary/20 p-2">cL</th>
                <th class="border border-primary/20 p-2">mL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-primary/20 p-2">kilolitre</td>
                <td class="border border-primary/20 p-2">hectolitre</td>
                <td class="border border-primary/20 p-2">décalitre</td>
                <td class="border border-primary/20 p-2 font-bold bg-accent/10">litre</td>
                <td class="border border-primary/20 p-2">décilitre</td>
                <td class="border border-primary/20 p-2">centilitre</td>
                <td class="border border-primary/20 p-2">millilitre</td>
              </tr>
              <tr class="bg-orange-50 dark:bg-orange-950/30">
                <td class="border border-primary/20 p-2 font-mono">1000 L</td>
                <td class="border border-primary/20 p-2 font-mono">100 L</td>
                <td class="border border-primary/20 p-2 font-mono">10 L</td>
                <td class="border border-primary/20 p-2 font-mono font-bold">1 L</td>
                <td class="border border-primary/20 p-2 font-mono">0,1 L</td>
                <td class="border border-primary/20 p-2 font-mono">0,01 L</td>
                <td class="border border-primary/20 p-2 font-mono">0,001 L</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔗 Relation avec le volume</h4>
        <p class="leading-relaxed mb-2">Important : 1 L = 1 dm³ (1 litre = 1 décimètre cube)</p>
        <div class="space-y-1 font-mono text-sm bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded">
          <p>1 L = 1000 mL = 1000 cm³</p>
          <p>1 mL = 1 cm³</p>
          <p>1 m³ = 1000 L</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Unités de temps -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ⏰ Unités de temps
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📅 Conversions du temps</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Unités de base</p>
            <div class="space-y-1 text-sm font-mono">
              <p>1 min = 60 s</p>
              <p>1 h = 60 min = 3600 s</p>
              <p>1 jour = 24 h</p>
            </div>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold mb-1">Unités longues</p>
            <div class="space-y-1 text-sm font-mono">
              <p>1 semaine = 7 jours</p>
              <p>1 mois ≈ 30 jours</p>
              <p>1 an = 365 jours</p>
              <p>1 an = 12 mois</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Attention :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">
          Le temps ne suit pas le système décimal ! 1 heure = 60 minutes (pas 100)
        </p>
      </div>
    </div>
  </section>

  <!-- Section 5: Méthode de conversion -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      🔄 Méthode pratique de conversion
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📝 Technique du tableau</h4>
        <p class="mb-3">Exemple : Convertir 2,5 km en mètres</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <ol class="space-y-2 list-decimal list-inside">
            <li>Dessiner le tableau des unités</li>
            <li>Placer le nombre dans la colonne de départ (km)</li>
            <li>Ajouter des zéros jusqu'à l'unité d'arrivée (m)</li>
            <li>Lire le résultat : 2,5 km = 2500 m</li>
          </ol>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">⚡ Méthode rapide</h4>
        <p class="leading-relaxed mb-2">
          <span class="font-semibold">Multiplier ou diviser par 10, 100, 1000...</span> selon le nombre de rangs parcourus
        </p>
        <div class="space-y-2 font-mono text-sm">
          <p>3 km → m : ×1000 → 3000 m</p>
          <p>500 cm → m : ÷100 → 5 m</p>
          <p>2,5 kg → g : ×1000 → 2500 g</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Mémoriser les préfixes</span> : kilo (×1000), hecto (×100), déca (×10), déci (÷10), centi (÷100), milli (÷1000)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifier le sens</span> : vers une unité plus petite = nombre plus grand</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Utiliser le tableau</span> pour les conversions complexes</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Attention au temps</span> : il ne suit pas le système décimal !</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Conversions de longueur -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Conversions de longueur (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Convertir les mesures suivantes :</p>
    <div class="space-y-2 font-mono text-base ml-4">
      <p>a) 3 km = ? m</p>
      <p>b) 250 cm = ? m</p>
      <p>c) 5,5 m = ? cm</p>
      <p>d) 1500 mm = ? m</p>
    </div>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solutions :</p>
      <div class="space-y-1 text-sm">
        <p>a) 3 km = 3 × 1000 = <span class="font-bold text-green-600">3000 m</span></p>
        <p>b) 250 cm = 250 ÷ 100 = <span class="font-bold text-green-600">2,5 m</span></p>
        <p>c) 5,5 m = 5,5 × 100 = <span class="font-bold text-green-600">550 cm</span></p>
        <p>d) 1500 mm = 1500 ÷ 1000 = <span class="font-bold text-green-600">1,5 m</span></p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Conversions de masse -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Conversions de masse (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Convertir ces masses :</p>
    <div class="space-y-3">
      <div>
        <p class="font-mono mb-2">a) 2,5 kg = ? g</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <p class="text-sm">2,5 kg = 2,5 × 1000 = <span class="font-bold text-green-600">2500 g</span></p>
        </div>
      </div>
      <div>
        <p class="font-mono mb-2">b) 750 g = ? kg</p>
        <div class="bg-white/70 dark:bg-gray-900/50 p-3 rounded">
          <p class="text-sm">750 g = 750 ÷ 1000 = <span class="font-bold text-green-600">0,75 kg</span></p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Conversions de capacité -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Conversions de capacité (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Marie achète 3 bouteilles d'eau de 1,5 L chacune. Combien de millilitres d'eau a-t-elle en tout ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Étape 1 :</span> Volume total = 3 × 1,5 L = 4,5 L</p>
        <p><span class="font-semibold">Étape 2 :</span> Conversion : 4,5 L = 4,5 × 1000 = 4500 mL</p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse :</span> Marie a 4500 mL d'eau
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Conversions de temps -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Conversions de temps (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un film dure 2 heures et 45 minutes. Combien de minutes dure-t-il ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Étape 1 :</span> Convertir les heures : 2 h = 2 × 60 = 120 min</p>
        <p><span class="font-semibold">Étape 2 :</span> Ajouter les minutes : 120 + 45 = 165 min</p>
        <div class="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600">✅ Réponse :</p>
          <p>Le film dure 165 minutes</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: Problème complexe -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Complexe (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un camion transporte 3 caisses de 250 kg chacune et 15 sacs de 2500 g chacun. Quelle est la masse totale en kg ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Étape 1 : Masse des caisses</p>
          <p>3 × 250 kg = <span class="font-bold">750 kg</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 2 : Masse des sacs</p>
          <p>15 × 2500 g = 37 500 g</p>
          <p>Conversion : 37 500 g = 37 500 ÷ 1000 = <span class="font-bold">37,5 kg</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>Masse totale = 750 + 37,5 = <span class="font-bold">787,5 kg</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "polygones": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier et nommer différents types de polygones
• Calculer le périmètre et l'aire de polygones réguliers
• Reconnaître les propriétés des triangles et quadrilatères
• Résoudre des problèmes géométriques pratiques`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Qu'ont en commun un panneau stop, une fenêtre rectangulaire et une pizza triangulaire ?</span> 
    <span class="italic">Ce sont tous des polygones !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les polygones sont des <span class="font-semibold text-accent">formes géométriques fermées</span> formées par des segments de droite. 
    Ils sont partout autour de nous : dans l'architecture, l'art, la nature et les objets quotidiens.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le mot "polygone"</span> vient du grec : 
    "poly" (plusieurs) + "gonia" (angles) = plusieurs angles !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions et types -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🔷 Qu'est-ce qu'un polygone ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">
          Un <span class="font-semibold text-accent">polygone</span> est une figure géométrique plane fermée, 
          formée par une suite de segments de droite (les côtés) reliés bout à bout.
        </p>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="text-sm">Propriétés :</p>
          <ul class="list-disc list-inside space-y-1 text-sm ml-2">
            <li>Fermé (le dernier point rejoint le premier)</li>
            <li>Composé de segments de droite (pas de courbes)</li>
            <li>Les côtés ne se croisent pas</li>
          </ul>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Classification selon le nombre de côtés</h4>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
          <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-center">
            <p class="font-bold">3 côtés</p>
            <p class="text-sm">Triangle</p>
          </div>
          <div class="p-2 bg-green-50 dark:bg-green-950/30 rounded text-center">
            <p class="font-bold">4 côtés</p>
            <p class="text-sm">Quadrilatère</p>
          </div>
          <div class="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-center">
            <p class="font-bold">5 côtés</p>
            <p class="text-sm">Pentagone</p>
          </div>
          <div class="p-2 bg-orange-50 dark:bg-orange-950/30 rounded text-center">
            <p class="font-bold">6 côtés</p>
            <p class="text-sm">Hexagone</p>
          </div>
          <div class="p-2 bg-purple-50 dark:bg-purple-950/30 rounded text-center">
            <p class="font-bold">7 côtés</p>
            <p class="text-sm">Heptagone</p>
          </div>
          <div class="p-2 bg-pink-50 dark:bg-pink-950/30 rounded text-center">
            <p class="font-bold">8 côtés</p>
            <p class="text-sm">Octogone</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Les triangles -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      🔺 Les triangles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Types de triangles selon les côtés</h4>
        <div class="space-y-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold">▲ Triangle équilatéral</p>
            <p class="text-sm">Trois côtés égaux, trois angles de 60°</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold">▲ Triangle isocèle</p>
            <p class="text-sm">Deux côtés égaux, deux angles égaux</p>
          </div>
          <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
            <p class="font-semibold">▲ Triangle scalène</p>
            <p class="text-sm">Trois côtés de longueurs différentes</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📐 Formules importantes</h4>
        <div class="space-y-2 bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded">
          <p class="font-mono"><span class="font-semibold">Périmètre :</span> P = côté1 + côté2 + côté3</p>
          <p class="font-mono"><span class="font-semibold">Aire :</span> A = (base × hauteur) ÷ 2</p>
          <p class="text-sm mt-2">💡 La somme des angles d'un triangle = 180°</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Les quadrilatères -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ◼️ Les quadrilatères
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔲 Types de quadrilatères</h4>
        <div class="space-y-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold">■ Carré</p>
            <p class="text-sm">4 côtés égaux, 4 angles droits (90°)</p>
            <p class="text-xs font-mono mt-1">P = 4 × côté  •  A = côté²</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold">▬ Rectangle</p>
            <p class="text-sm">Côtés opposés égaux, 4 angles droits</p>
            <p class="text-xs font-mono mt-1">P = 2(L + l)  •  A = L × l</p>
          </div>
          <div class="p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded">
            <p class="font-semibold">◊ Losange</p>
            <p class="text-sm">4 côtés égaux, angles opposés égaux</p>
            <p class="text-xs font-mono mt-1">P = 4 × côté  •  A = (d₁ × d₂) ÷ 2</p>
          </div>
          <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
            <p class="font-semibold">▱ Parallélogramme</p>
            <p class="text-sm">Côtés opposés parallèles et égaux</p>
            <p class="text-xs font-mono mt-1">A = base × hauteur</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold">⎔ Trapèze</p>
            <p class="text-sm">Deux côtés parallèles (bases)</p>
            <p class="text-xs font-mono mt-1">A = [(B + b) × h] ÷ 2</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Périmètre et aire -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      📏 Périmètre et Aire
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔄 Périmètre</h4>
        <p class="leading-relaxed mb-2">
          Le <span class="font-semibold">périmètre</span> est la longueur totale du contour d'un polygone.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="text-sm">Méthode : Additionner la longueur de tous les côtés</p>
          <p class="font-mono mt-2">Exemple : Triangle avec côtés 3 cm, 4 cm, 5 cm</p>
          <p class="font-mono">P = 3 + 4 + 5 = 12 cm</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📐 Aire</h4>
        <p class="leading-relaxed mb-2">
          L'<span class="font-semibold">aire</span> est la mesure de la surface intérieure d'un polygone.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="text-sm mb-2">Unités courantes : cm², m², km²</p>
          <p class="text-xs">💡 1 m² = 10 000 cm²  •  1 km² = 1 000 000 m²</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Polygones réguliers -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      ⭐ Polygones réguliers
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-3">
          Un <span class="font-semibold text-accent">polygone régulier</span> a :
        </p>
        <ul class="list-disc list-inside space-y-1 ml-2">
          <li>Tous ses côtés de même longueur</li>
          <li>Tous ses angles égaux</li>
        </ul>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="text-sm">Exemples : triangle équilatéral, carré, pentagone régulier, hexagone régulier</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🐝 L'hexagone dans la nature</h4>
        <p class="text-sm">Les abeilles construisent leurs alvéoles en forme d'hexagones réguliers car cette forme permet 
        d'économiser de la cire tout en maximisant l'espace de stockage !</p>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Dessiner un schéma</span> avec les mesures données aide à visualiser le problème</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Identifier le type de polygone</span> avant de chercher la formule appropriée</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifier les unités</span> : périmètre en unités linéaires (cm, m), aire en unités carrées (cm², m²)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour les polygones complexes</span>, les diviser en formes plus simples</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Périmètre de triangle -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Périmètre de triangle (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle a des côtés de 5 cm, 7 cm et 8 cm. Quel est son périmètre ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solution :</p>
      <div class="space-y-1 text-sm">
        <p>Périmètre = somme de tous les côtés</p>
        <p>P = 5 + 7 + 8 = <span class="font-bold text-green-600">20 cm</span></p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Aire de rectangle -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Aire de rectangle (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un rectangle a une longueur de 8 m et une largeur de 5 m. Calculer son aire et son périmètre.</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-green-700 dark:text-green-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p><span class="font-semibold">Aire :</span> A = L × l = 8 × 5 = <span class="font-bold text-green-600">40 m²</span></p>
        </div>
        <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p><span class="font-semibold">Périmètre :</span> P = 2(L + l) = 2(8 + 5) = 2 × 13 = <span class="font-bold text-green-600">26 m</span></p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Aire de triangle -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Aire de triangle (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle a une base de 12 cm et une hauteur de 8 cm. Quelle est son aire ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Formule :</span> A = (base × hauteur) ÷ 2</p>
        <p>A = (12 × 8) ÷ 2</p>
        <p>A = 96 ÷ 2</p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse :</span> L'aire du triangle est 48 cm²
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Aire de carré -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Périmètre et aire du carré (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un carré a un côté de 6 cm. Calculer son périmètre et son aire.</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Périmètre</p>
          <p>P = 4 × côté = 4 × 6 = <span class="font-bold">24 cm</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Aire</p>
          <p>A = côté² = 6² = 6 × 6 = <span class="font-bold">36 cm²</span></p>
        </div>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600">✅ Réponse :</p>
          <p>Périmètre = 24 cm • Aire = 36 cm²</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: Problème complexe -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Complexe (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un terrain rectangulaire de 25 m sur 15 m est entouré d'une clôture. Quel est le coût total de la clôture si 1 mètre coûte 120 gourdes ? Quelle est l'aire du terrain ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Étape 1 : Périmètre</p>
          <p>P = 2(L + l) = 2(25 + 15) = 2 × 40 = <span class="font-bold">80 m</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 2 : Coût de la clôture</p>
          <p>Coût = 80 × 120 = <span class="font-bold">9600 gourdes</span></p>
        </div>
        <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
          <p class="font-semibold text-orange-700 dark:text-orange-300 mb-1">Étape 3 : Aire du terrain</p>
          <p>A = L × l = 25 × 15 = <span class="font-bold">375 m²</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>• Coût de la clôture : <span class="font-bold">9600 gourdes</span></p>
          <p>• Aire du terrain : <span class="font-bold">375 m²</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "divisibilite": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Comprendre les concepts de diviseur et multiple
• Identifier les nombres premiers et composés
• Appliquer les critères de divisibilité
• Décomposer un nombre en facteurs premiers`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment savoir si 156 est divisible par 3 sans faire la division ?</span> 
    <span class="italic">Les critères de divisibilité nous donnent la réponse rapidement !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    La divisibilité est un concept fondamental en arithmétique. Elle nous aide à 
    <span class="font-semibold text-accent">simplifier les calculs</span> et à mieux comprendre 
    les propriétés des nombres entiers.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le saviez-vous ?</span> 
    Les nombres premiers sont les "briques de base" de tous les nombres, comme les atomes pour la matière !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions de base -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      📚 Définitions de base
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Divisibilité</h4>
        <p class="leading-relaxed mb-2">
          Un nombre entier <span class="font-mono font-semibold">a</span> est divisible par un nombre entier 
          <span class="font-mono font-semibold">b</span> si la division de <span class="font-mono">a</span> 
          par <span class="font-mono">b</span> donne un quotient entier et un reste de 0.
        </p>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono">Exemple : 15 ÷ 3 = 5 (reste 0)</p>
          <p class="text-sm">Donc 15 est divisible par 3, ou "3 divise 15"</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Diviseur et Multiple</h4>
        <div class="space-y-2">
          <p class="leading-relaxed">
            • <span class="font-semibold">Diviseur :</span> Si a est divisible par b, alors b est un diviseur de a
          </p>
          <p class="leading-relaxed">
            • <span class="font-semibold">Multiple :</span> Si a est divisible par b, alors a est un multiple de b
          </p>
          <div class="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
            <p>Exemple : 12 est divisible par 3</p>
            <p>→ 3 est un diviseur de 12</p>
            <p>→ 12 est un multiple de 3</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Critères de divisibilité -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✅ Critères de divisibilité
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 2</p>
        <p class="text-sm">Le chiffre des unités est 0, 2, 4, 6 ou 8 (nombre pair)</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 24, 156, 1008</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 3</p>
        <p class="text-sm">La somme de ses chiffres est divisible par 3</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 123 → 1+2+3=6, divisible par 3</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 4</p>
        <p class="text-sm">Le nombre formé par ses deux derniers chiffres est divisible par 4</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 316 → 16 divisible par 4</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 5</p>
        <p class="text-sm">Le chiffre des unités est 0 ou 5</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 25, 120, 345</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 6</p>
        <p class="text-sm">Divisible à la fois par 2 ET par 3</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 42 (pair et 4+2=6)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 9</p>
        <p class="text-sm">La somme de ses chiffres est divisible par 9</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 171 → 1+7+1=9</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg">
        <p class="font-semibold mb-1">📌 Divisible par 10</p>
        <p class="text-sm">Le chiffre des unités est 0</p>
        <p class="text-xs font-mono mt-1 text-muted-foreground">Ex: 30, 150, 1000</p>
      </div>
    </div>
  </section>

  <!-- Section 3: Nombres premiers -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ⭐ Nombres premiers
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-2">
          Un <span class="font-semibold text-accent">nombre premier</span> est un nombre entier supérieur à 1 
          qui n'a que deux diviseurs : 1 et lui-même.
        </p>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="text-sm mb-2">Les premiers nombres premiers :</p>
          <p class="font-mono">2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47...</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Nombres composés</h4>
        <p class="leading-relaxed mb-2">
          Un <span class="font-semibold">nombre composé</span> est un nombre qui a plus de deux diviseurs 
          (il n'est pas premier).
        </p>
        <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
          <p>Exemple : 12 a pour diviseurs 1, 2, 3, 4, 6, 12 → c'est un nombre composé</p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">💡 Cas particuliers :</p>
        <ul class="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li>• 1 n'est ni premier ni composé</li>
          <li>• 2 est le seul nombre premier pair</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 4: Décomposition en facteurs premiers -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      🌳 Décomposition en facteurs premiers
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Méthode</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li class="leading-relaxed">Diviser le nombre par le plus petit nombre premier possible (2, 3, 5, 7...)</li>
          <li class="leading-relaxed">Continuer avec le quotient obtenu</li>
          <li class="leading-relaxed">S'arrêter quand on obtient 1</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple : Décomposer 60</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
            <pre class="font-mono text-sm">
60 | 2
30 | 2
15 | 3
 5 | 5
 1 |
            </pre>
          </div>
          <div class="flex items-center">
            <p class="font-mono text-lg">60 = 2² × 3 × 5</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: PGCD et PPCM -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      🔗 PGCD et PPCM
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 PGCD (Plus Grand Commun Diviseur)</h4>
        <p class="leading-relaxed mb-2">
          Le plus grand nombre qui divise à la fois deux nombres donnés.
        </p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
          <p>Exemple : PGCD(12, 18)</p>
          <p>Diviseurs de 12 : 1, 2, 3, 4, 6, 12</p>
          <p>Diviseurs de 18 : 1, 2, 3, 6, 9, 18</p>
          <p class="font-bold mt-1">PGCD(12, 18) = 6</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 PPCM (Plus Petit Commun Multiple)</h4>
        <p class="leading-relaxed mb-2">
          Le plus petit nombre (non nul) qui est multiple de deux nombres donnés.
        </p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded text-sm">
          <p>Exemple : PPCM(4, 6)</p>
          <p>Multiples de 4 : 4, 8, 12, 16, 20, 24...</p>
          <p>Multiples de 6 : 6, 12, 18, 24, 30...</p>
          <p class="font-bold mt-1">PPCM(4, 6) = 12</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Mémoriser les critères</span> de divisibilité par 2, 3, 5, 9 et 10</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour la décomposition</span>, commencer toujours par les plus petits nombres premiers</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Un nombre premier</span> ne peut pas être divisé que par 1 et lui-même</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifier les résultats</span> en multipliant les facteurs premiers</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Critères de divisibilité -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Critères de divisibilité (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Le nombre 456 est-il divisible par 2, 3, 4, 5, 9 ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solutions :</p>
      <div class="space-y-1 text-sm">
        <p>• Par 2 : <span class="font-bold text-green-600">OUI</span> (chiffre des unités = 6, pair)</p>
        <p>• Par 3 : <span class="font-bold text-green-600">OUI</span> (4+5+6=15, divisible par 3)</p>
        <p>• Par 4 : <span class="font-bold text-green-600">OUI</span> (56 divisible par 4)</p>
        <p>• Par 5 : <span class="font-bold text-red-600">NON</span> (ne se termine pas par 0 ou 5)</p>
        <p>• Par 9 : <span class="font-bold text-red-600">NON</span> (4+5+6=15, non divisible par 9)</p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Trouver les diviseurs -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Trouver les diviseurs (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Trouver tous les diviseurs de 24.</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-green-700 dark:text-green-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p>On teste les nombres de 1 jusqu'à 24 :</p>
        <p>24 ÷ 1 = 24 ✓</p>
        <p>24 ÷ 2 = 12 ✓</p>
        <p>24 ÷ 3 = 8 ✓</p>
        <p>24 ÷ 4 = 6 ✓</p>
        <p>24 ÷ 6 = 4 ✓</p>
        <p>24 ÷ 8 = 3 ✓</p>
        <p>24 ÷ 12 = 2 ✓</p>
        <p>24 ÷ 24 = 1 ✓</p>
        <p class="mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-300 dark:border-green-700">
          <span class="font-bold text-green-600">✅ Réponse :</span> 1, 2, 3, 4, 6, 8, 12, 24
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Nombres premiers -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Identifier les nombres premiers (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Parmi les nombres suivants, lesquels sont premiers ? 11, 15, 17, 21, 23</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p>• 11 : divisible uniquement par 1 et 11 → <span class="font-bold text-green-600">PREMIER</span></p>
        <p>• 15 : divisible par 1, 3, 5, 15 → <span class="font-bold text-red-600">COMPOSÉ</span></p>
        <p>• 17 : divisible uniquement par 1 et 17 → <span class="font-bold text-green-600">PREMIER</span></p>
        <p>• 21 : divisible par 1, 3, 7, 21 → <span class="font-bold text-red-600">COMPOSÉ</span></p>
        <p>• 23 : divisible uniquement par 1 et 23 → <span class="font-bold text-green-600">PREMIER</span></p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse :</span> 11, 17 et 23 sont premiers
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Décomposition -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Décomposition en facteurs premiers (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Décomposer 72 en facteurs premiers.</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-3 text-sm">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
            <pre class="font-mono text-sm">
72 | 2
36 | 2
18 | 2
 9 | 3
 3 | 3
 1 |
            </pre>
          </div>
          <div class="flex items-center">
            <div>
              <p class="mb-2">On divise par 2 trois fois</p>
              <p class="mb-2">Puis par 3 deux fois</p>
              <p class="font-mono font-bold text-purple-600">72 = 2³ × 3²</p>
            </div>
          </div>
        </div>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600">✅ Réponse :</p>
          <p>72 = 2³ × 3² = 8 × 9</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: PGCD -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Trouver le PGCD (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Trouver le PGCD de 36 et 48.</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Méthode 1 : Liste des diviseurs</p>
          <p>Diviseurs de 36 : 1, 2, 3, 4, 6, 9, 12, 18, 36</p>
          <p>Diviseurs de 48 : 1, 2, 3, 4, 6, 8, 12, 16, 24, 48</p>
          <p>Diviseurs communs : 1, 2, 3, 4, 6, 12</p>
          <p class="font-bold mt-1">Le plus grand : 12</p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Méthode 2 : Décomposition</p>
          <p>36 = 2² × 3²</p>
          <p>48 = 2⁴ × 3</p>
          <p>PGCD = 2² × 3 = 4 × 3 = 12</p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>PGCD(36, 48) = <span class="font-bold">12</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "fractions": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Comprendre ce qu'est une fraction et ses composantes
• Simplifier et comparer des fractions
• Additionner, soustraire, multiplier et diviser des fractions
• Résoudre des problèmes pratiques avec des fractions`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment partager équitablement une pizza entre 4 amis ?</span> 
    Chacun reçoit <span class="italic font-semibold text-accent">1/4 (un quart)</span> de la pizza. 
    C'est ça, une fraction !
  </p>
  
  <p class="text-lg leading-relaxed">
    Les fractions nous permettent de représenter des <span class="font-semibold text-accent">parties d'un tout</span>. 
    Elles sont indispensables pour mesurer, partager, calculer des proportions et bien plus encore.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Le saviez-vous ?</span> 
    Le mot "fraction" vient du latin "fractio" qui signifie "briser, casser" !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Comprendre les fractions -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🧮 Qu'est-ce qu'une fraction ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition et notation</h4>
        <p class="leading-relaxed mb-3">
          Une fraction représente une partie d'un tout divisé en parts égales.
        </p>
        <div class="flex items-center justify-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <div class="text-center">
            <p class="text-4xl font-mono font-bold mb-2">3/4</p>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="text-right">
                <p class="font-semibold">3 ← Numérateur</p>
                <p class="text-xs">(parties prises)</p>
              </div>
              <div class="text-left">
                <p class="font-semibold">4 ← Dénominateur</p>
                <p class="text-xs">(parties totales)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔢 Types de fractions</h4>
        <div class="space-y-2">
          <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold">Fraction propre : numérateur &lt; dénominateur</p>
            <p class="text-sm font-mono">Exemple : 2/5, 3/7, 5/8</p>
          </div>
          <div class="p-2 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold">Fraction impropre : numérateur ≥ dénominateur</p>
            <p class="text-sm font-mono">Exemple : 7/5, 9/4, 8/3</p>
          </div>
          <div class="p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded">
            <p class="font-semibold">Nombre mixte : partie entière + fraction</p>
            <p class="text-sm font-mono">Exemple : 2 1/3 = 7/3</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Simplification de fractions -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✂️ Simplification de fractions
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🎯 Principe</h4>
        <p class="leading-relaxed mb-3">
          Simplifier une fraction, c'est diviser le numérateur et le dénominateur par leur PGCD 
          pour obtenir une <span class="font-semibold">fraction irréductible</span>.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-semibold mb-2">Exemple : Simplifier 12/18</p>
          <p class="text-sm">PGCD(12, 18) = 6</p>
          <p class="text-sm">12 ÷ 6 = 2</p>
          <p class="text-sm">18 ÷ 6 = 3</p>
          <p class="font-mono font-bold mt-2 text-accent">12/18 = 2/3</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">⚡ Méthode rapide</h4>
        <p class="text-sm leading-relaxed">
          Si tu reconnais un diviseur commun évident, divise directement par ce nombre, 
          puis vérifie si on peut encore simplifier.
        </p>
        <p class="text-xs font-mono mt-2 text-muted-foreground">
          20/30 → ÷10 → 2/3 (irréductible)
        </p>
      </div>
    </div>
  </section>

  <!-- Section 3: Comparaison de fractions -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ⚖️ Comparaison de fractions
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Cas 1 : Même dénominateur</h4>
        <p class="leading-relaxed mb-2">
          Si deux fractions ont le même dénominateur, la plus grande est celle qui a le plus grand numérateur.
        </p>
        <div class="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm font-mono">
          3/7 &lt; 5/7  (car 3 &lt; 5)
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Cas 2 : Même numérateur</h4>
        <p class="leading-relaxed mb-2">
          Si deux fractions ont le même numérateur, la plus grande est celle qui a le plus petit dénominateur.
        </p>
        <div class="p-2 bg-green-50 dark:bg-green-950/30 rounded text-sm font-mono">
          3/4 &gt; 3/5  (car 4 &lt; 5)
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Cas 3 : Dénominateurs différents</h4>
        <p class="leading-relaxed mb-2">
          Réduire au même dénominateur (trouver le PPCM) puis comparer les numérateurs.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded text-sm">
          <p>Comparer 2/3 et 3/4</p>
          <p>PPCM(3,4) = 12</p>
          <p>2/3 = 8/12  •  3/4 = 9/12</p>
          <p class="font-bold mt-1">Donc 2/3 &lt; 3/4</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Addition et soustraction -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ➕➖ Addition et soustraction
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📝 Règle générale</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li>Réduire au même dénominateur (si nécessaire)</li>
          <li>Additionner ou soustraire les numérateurs</li>
          <li>Garder le dénominateur commun</li>
          <li>Simplifier le résultat</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemples</h4>
        <div class="space-y-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Même dénominateur :</p>
            <p class="font-mono">2/5 + 1/5 = (2+1)/5 = 3/5</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold mb-1">Dénominateurs différents :</p>
            <p class="font-mono text-sm">1/3 + 1/4 = 4/12 + 3/12 = 7/12</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Multiplication et division -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      ✖️➗ Multiplication et division
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">✖️ Multiplication</h4>
        <p class="leading-relaxed mb-2">
          Multiplier les numérateurs entre eux et les dénominateurs entre eux.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-lg">2/3 × 4/5 = (2×4)/(3×5) = 8/15</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">➗ Division</h4>
        <p class="leading-relaxed mb-2">
          Diviser par une fraction = multiplier par son inverse.
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-lg">2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6</p>
          <p class="text-sm mt-2">💡 L'inverse de 4/5 est 5/4</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces et conseils -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      💡 Astuces et conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Toujours simplifier</span> le résultat final si possible</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour additionner/soustraire</span>, il faut le même dénominateur</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour multiplier</span>, pas besoin de même dénominateur</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Diviser par une fraction</span> = multiplier par son inverse</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <!-- Exercice 1: Simplification -->
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Simplification (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Simplifier les fractions suivantes : a) 8/12  b) 15/25  c) 18/24</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">✅ Solutions :</p>
      <div class="space-y-1 text-sm">
        <p>a) 8/12 = (8÷4)/(12÷4) = <span class="font-bold text-green-600">2/3</span></p>
        <p>b) 15/25 = (15÷5)/(25÷5) = <span class="font-bold text-green-600">3/5</span></p>
        <p>c) 18/24 = (18÷6)/(24÷6) = <span class="font-bold text-green-600">3/4</span></p>
      </div>
    </div>
  </div>

  <!-- Exercice 2: Comparaison -->
  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Comparaison (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Comparer : 3/4 et 5/6</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-green-700 dark:text-green-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Trouver le dénominateur commun :</span> PPCM(4,6) = 12</p>
        <p>3/4 = (3×3)/(4×3) = 9/12</p>
        <p>5/6 = (5×2)/(6×2) = 10/12</p>
        <p class="mt-3 p-2 bg-green-50 dark:bg-green-950/30 rounded border border-green-300 dark:border-green-700">
          <span class="font-bold text-green-600">✅ Réponse :</span> 3/4 &lt; 5/6 (car 9/12 &lt; 10/12)
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 3: Addition -->
  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Addition (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Calculer : 2/5 + 1/3</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-orange-700 dark:text-orange-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Dénominateur commun :</span> PPCM(5,3) = 15</p>
        <p>2/5 = (2×3)/(5×3) = 6/15</p>
        <p>1/3 = (1×5)/(3×5) = 5/15</p>
        <p>6/15 + 5/15 = 11/15</p>
        <p class="mt-3 p-2 bg-orange-50 dark:bg-orange-950/30 rounded border border-orange-300 dark:border-orange-700">
          <span class="font-bold text-orange-600">✅ Réponse :</span> 2/5 + 1/3 = 11/15
        </p>
      </div>
    </div>
  </div>

  <!-- Exercice 4: Multiplication -->
  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Multiplication (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Calculer : 3/4 × 2/5</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-2 text-purple-700 dark:text-purple-300">📝 Résolution :</p>
      <div class="space-y-2 text-sm">
        <p>3/4 × 2/5 = (3×2)/(4×5)</p>
        <p>= 6/20</p>
        <p>Simplification : 6/20 = (6÷2)/(20÷2) = 3/10</p>
        <div class="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded border border-purple-300 dark:border-purple-700">
          <p class="font-bold text-purple-600">✅ Réponse :</p>
          <p>3/4 × 2/5 = 3/10</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Exercice 5: Problème complexe -->
  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Pratique (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Marie a mangé 2/5 d'un gâteau et Jean a mangé 1/4 du même gâteau. Quelle fraction du gâteau ont-ils mangée ensemble ? Quelle fraction reste-t-il ?</p>
    <div class="bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold mb-3 text-pink-700 dark:text-pink-300">📝 Résolution étape par étape :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Étape 1 : Fraction mangée</p>
          <p>PPCM(5,4) = 20</p>
          <p>2/5 = 8/20  •  1/4 = 5/20</p>
          <p>Total mangé = 8/20 + 5/20 = <span class="font-bold">13/20</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Étape 2 : Fraction restante</p>
          <p>Gâteau entier = 20/20</p>
          <p>Reste = 20/20 - 13/20 = <span class="font-bold">7/20</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-2">✅ Réponse Finale :</p>
          <p>• Fraction mangée : <span class="font-bold">13/20</span></p>
          <p>• Fraction restante : <span class="font-bold">7/20</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "cercle-disque": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Différencier le cercle du disque
• Calculer le périmètre (circonférence) d'un cercle
• Calculer l'aire d'un disque
• Résoudre des problèmes pratiques impliquant cercles et disques`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Quelle est la différence entre une roue de vélo et un bracelet ?</span> 
    La roue est un <span class="italic font-semibold text-accent">disque</span> (surface pleine), 
    tandis que le bracelet est un <span class="italic font-semibold text-primary">cercle</span> (ligne courbe fermée) !
  </p>
  
  <p class="text-lg leading-relaxed">
    Les cercles et disques sont partout dans notre vie : roues de voiture, assiettes, pièces de monnaie, 
    horloges... Apprendre à calculer leurs dimensions est essentiel !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">À retenir :</span> 
    Le cercle est une ligne, le disque est une surface !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Cercle et Disque : Définitions
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Le Cercle</h4>
        <p class="leading-relaxed">
          Un cercle est l'ensemble de tous les points situés à la <span class="font-semibold text-accent">même distance</span> 
          d'un point fixe appelé <span class="font-semibold text-primary">centre</span>.
        </p>
        <p class="mt-2 text-sm text-muted-foreground italic">
          • Centre : point O au milieu<br>
          • Rayon (r) : distance du centre à un point du cercle<br>
          • Diamètre (d) : segment passant par le centre = 2×rayon
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Le Disque</h4>
        <p class="leading-relaxed">
          Un disque est la <span class="font-semibold text-accent">surface fermée</span> délimitée par un cercle. 
          Il contient tous les points à l'intérieur du cercle, y compris le cercle lui-même.
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Le nombre π (Pi)</h4>
        <p class="leading-relaxed">
          π est un nombre très spécial ≈ <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">3,14159...</span>
        </p>
        <p class="mt-2 text-sm">
          Pour les calculs pratiques, on utilise : <span class="font-mono font-bold">π ≈ 3,14</span> ou <span class="font-mono font-bold">π ≈ 22/7</span>
        </p>
      </div>
    </div>
  </section>

  <!-- Section 2: Périmètre du cercle -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📏 Périmètre du Cercle (Circonférence)
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Formules</h4>
        <div class="space-y-3">
          <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
            <p class="font-bold mb-1">Avec le rayon :</p>
            <p class="font-mono text-xl">P = 2 × π × r</p>
          </div>
          <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded border-l-4 border-accent">
            <p class="font-bold mb-1">Avec le diamètre :</p>
            <p class="font-mono text-xl">P = π × d</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="leading-relaxed mb-3">Calculer le périmètre d'un cercle de rayon 5 cm</p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-mono">P = 2 × π × r</p>
          <p class="font-mono">P = 2 × 3,14 × 5</p>
          <p class="font-mono">P = <span class="font-bold text-green-600">31,4 cm</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Aire du disque -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📐 Aire du Disque
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Formule</h4>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-2xl text-center">A = π × r²</p>
          <p class="text-sm text-center mt-2 text-muted-foreground">
            (Le rayon multiplié par lui-même, puis par π)
          </p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="leading-relaxed mb-3">Calculer l'aire d'un disque de rayon 4 cm</p>
        <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
          <p class="font-mono">A = π × r²</p>
          <p class="font-mono">A = 3,14 × 4²</p>
          <p class="font-mono">A = 3,14 × 16</p>
          <p class="font-mono">A = <span class="font-bold text-orange-600">50,24 cm²</span></p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Attention :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">N'oublie pas de calculer r² (r×r) avant de multiplier par π !</p>
      </div>
    </div>
  </section>

  <!-- Section 4: Parties du cercle -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      🎨 Parties du Cercle
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔵 Arc de cercle</h4>
        <p class="leading-relaxed">Une portion de la ligne du cercle entre deux points</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔺 Corde</h4>
        <p class="leading-relaxed">Segment reliant deux points du cercle (le diamètre est la plus grande corde)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🍕 Secteur circulaire</h4>
        <p class="leading-relaxed">Portion de disque délimitée par deux rayons (comme une part de pizza !)</p>
      </div>
    </div>
  </section>

  <!-- Section 5: Applications pratiques -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🌟 Applications Pratiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🚲 Roue de vélo</h4>
        <p class="mb-2">Une roue de vélo a un diamètre de 70 cm. Quelle distance parcourt-elle en un tour complet ?</p>
        <div class="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded">
          <p class="font-mono text-sm">P = π × d = 3,14 × 70 = <span class="font-bold">219,8 cm</span></p>
          <p class="text-xs mt-1 text-muted-foreground">≈ 2,2 mètres par tour</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🍕 Pizza circulaire</h4>
        <p class="mb-2">Une pizza a un rayon de 15 cm. Quelle est sa surface ?</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-mono text-sm">A = π × r² = 3,14 × 15² = 3,14 × 225 = <span class="font-bold">706,5 cm²</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Retiens :</span> d = 2r (le diamètre est le double du rayon)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour le périmètre :</span> Utilise 2πr ou πd (c'est la même chose !)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour l'aire :</span> N'oublie jamais le carré sur le rayon (r²)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifie tes unités :</span> cm pour périmètre, cm² pour aire</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Calcul du périmètre (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Calculer le périmètre d'un cercle de rayon 7 cm</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>P = 2 × π × r</p>
        <p>P = 2 × 3,14 × 7</p>
        <p>P = <span class="font-bold text-blue-600">43,96 cm</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Calcul de l'aire (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Calculer l'aire d'un disque de rayon 6 cm</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = π × r²</p>
        <p>A = 3,14 × 6²</p>
        <p>A = 3,14 × 36</p>
        <p>A = <span class="font-bold text-green-600">113,04 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Avec le diamètre (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un cercle a un diamètre de 20 cm. Calculer son périmètre et l'aire du disque correspondant</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-3 text-sm">
        <div>
          <p class="font-semibold">Périmètre :</p>
          <p>P = π × d = 3,14 × 20 = <span class="font-bold text-orange-600">62,8 cm</span></p>
        </div>
        <div>
          <p class="font-semibold">Aire :</p>
          <p>d = 20 cm donc r = 10 cm</p>
          <p>A = π × r² = 3,14 × 10² = 3,14 × 100 = <span class="font-bold text-orange-600">314 cm²</span></p>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Problème de roue (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Une roue de voiture a un rayon de 30 cm. Combien de tours complets fait-elle pour parcourir 94,2 mètres ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Étape 1 :</span> Périmètre d'un tour</p>
        <p>P = 2 × π × r = 2 × 3,14 × 30 = 188,4 cm = 1,884 m</p>
        <p><span class="font-semibold">Étape 2 :</span> Nombre de tours</p>
        <p>Nombre = 94,2 ÷ 1,884 = <span class="font-bold text-purple-600">50 tours</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Comparaison d'aires (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un jardin circulaire a un rayon de 5 m. On veut l'agrandir pour doubler sa surface. Quel sera le nouveau rayon ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Aire initiale :</span> A₁ = π × 5² = 25π m²</p>
        <p><span class="font-semibold">Aire finale :</span> A₂ = 2 × 25π = 50π m²</p>
        <p><span class="font-semibold">Nouveau rayon :</span> A₂ = π × r² donc 50π = π × r²</p>
        <p>r² = 50 donc r = √50 ≈ <span class="font-bold text-pink-600">7,07 m</span></p>
        <p class="mt-2 p-2 bg-pink-50 dark:bg-pink-950/30 rounded border border-pink-300 dark:border-pink-700 italic">
          💡 Pour doubler l'aire, il faut multiplier le rayon par √2 ≈ 1,41
        </p>
      </div>
    </div>
  </div>

</div>`
  },

  "triangles": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Identifier et classifier les différents types de triangles
• Connaître les propriétés fondamentales des triangles
• Calculer le périmètre et l'aire des triangles
• Utiliser le théorème de Pythagore`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Pourquoi les toits des maisons ont-ils souvent une forme triangulaire ?</span> 
    Parce que le triangle est une figure <span class="italic font-semibold text-accent">très stable et solide</span> !
  </p>
  
  <p class="text-lg leading-relaxed">
    Le triangle est la plus simple des figures géométriques, mais aussi l'une des plus importantes. 
    On le retrouve dans l'architecture, les ponts, les panneaux de signalisation, et même dans la nature !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Fun Fact :</span> 
    La somme des angles d'un triangle est toujours 180° !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Types de triangles -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🔺 Classification des Triangles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Selon les côtés</h4>
        <div class="space-y-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold text-blue-700 dark:text-blue-300">Triangle équilatéral</p>
            <p class="text-sm">3 côtés égaux • 3 angles égaux (60° chacun)</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold text-green-700 dark:text-green-300">Triangle isocèle</p>
            <p class="text-sm">2 côtés égaux • 2 angles égaux</p>
          </div>
          <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
            <p class="font-semibold text-orange-700 dark:text-orange-300">Triangle scalène</p>
            <p class="text-sm">3 côtés différents • 3 angles différents</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📏 Selon les angles</h4>
        <div class="space-y-3">
          <div class="p-3 bg-red-50 dark:bg-red-950/30 rounded">
            <p class="font-semibold text-red-700 dark:text-red-300">Triangle rectangle</p>
            <p class="text-sm">1 angle droit (90°)</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold text-purple-700 dark:text-purple-300">Triangle obtusangle</p>
            <p class="text-sm">1 angle obtus (&gt; 90°)</p>
          </div>
          <div class="p-3 bg-teal-50 dark:bg-teal-950/30 rounded">
            <p class="font-semibold text-teal-700 dark:text-teal-300">Triangle acutangle</p>
            <p class="text-sm">3 angles aigus (&lt; 90°)</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Propriétés -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✨ Propriétés Fondamentales
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Somme des angles</h4>
        <p class="leading-relaxed mb-2">
          Dans tout triangle, la somme des trois angles est toujours égale à 180°
        </p>
        <p class="font-mono text-lg p-2 bg-green-50 dark:bg-green-950/30 rounded">
          A + B + C = 180°
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Inégalité triangulaire</h4>
        <p class="leading-relaxed mb-2">
          La longueur de chaque côté est toujours inférieure à la somme des deux autres
        </p>
        <p class="font-mono text-sm p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
          AB &lt; AC + BC  •  AC &lt; AB + BC  •  BC &lt; AB + AC
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Hauteur et médiane</h4>
        <p class="leading-relaxed"><span class="font-semibold">Hauteur :</span> droite perpendiculaire à un côté passant par le sommet opposé</p>
        <p class="leading-relaxed mt-2"><span class="font-semibold">Médiane :</span> segment reliant un sommet au milieu du côté opposé</p>
      </div>
    </div>
  </section>

  <!-- Section 3: Périmètre -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📏 Périmètre du Triangle
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Formule générale</h4>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-xl text-center mb-2">P = a + b + c</p>
          <p class="text-sm text-center text-muted-foreground">
            (Somme des trois côtés)
          </p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Triangle avec côtés : 5 cm, 7 cm, 8 cm</p>
        <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
          <p class="font-mono">P = 5 + 7 + 8 = <span class="font-bold text-orange-600">20 cm</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Aire -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      📐 Aire du Triangle
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Formule principale</h4>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-2xl text-center mb-2">A = (base × hauteur) ÷ 2</p>
          <p class="text-sm text-center text-muted-foreground">ou A = (b × h) / 2</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Base = 8 cm, Hauteur = 5 cm</p>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
          <p class="font-mono">A = (8 × 5) ÷ 2</p>
          <p class="font-mono">A = 40 ÷ 2</p>
          <p class="font-mono">A = <span class="font-bold text-purple-600">20 cm²</span></p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Triangle rectangle</h4>
        <p class="mb-2">Les deux côtés de l'angle droit sont base et hauteur :</p>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded">
          <p class="font-mono">A = (côté₁ × côté₂) ÷ 2</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Pythagore -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🎓 Théorème de Pythagore
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Le théorème</h4>
        <p class="mb-3 leading-relaxed">
          Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés
        </p>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-2xl text-center">a² = b² + c²</p>
          <p class="text-sm text-center mt-2 text-muted-foreground">
            (a = hypoténuse, b et c = autres côtés)
          </p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Triangle rectangle avec côtés 3 cm et 4 cm. Trouver l'hypoténuse :</p>
        <div class="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded">
          <p class="font-mono text-sm">a² = 3² + 4²</p>
          <p class="font-mono text-sm">a² = 9 + 16 = 25</p>
          <p class="font-mono text-sm">a = √25 = <span class="font-bold text-cyan-600">5 cm</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Conseils -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifie toujours</span> que la somme des angles = 180°</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour l'aire :</span> identifie bien la base et la hauteur (perpendiculaire !)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pythagore :</span> ne fonctionne QUE pour les triangles rectangles</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Dessine toujours</span> une figure pour mieux visualiser</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Somme des angles (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Dans un triangle, deux angles mesurent 45° et 65°. Quel est le troisième angle ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A + B + C = 180°</p>
        <p>45° + 65° + C = 180°</p>
        <p>110° + C = 180°</p>
        <p>C = 180° - 110° = <span class="font-bold text-blue-600">70°</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Périmètre (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle équilatéral a un côté de 8 cm. Quel est son périmètre ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Triangle équilatéral : 3 côtés égaux</p>
        <p>P = 8 + 8 + 8 = 3 × 8</p>
        <p>P = <span class="font-bold text-green-600">24 cm</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Aire (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle a une base de 12 cm et une hauteur de 7 cm. Calculer son aire</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = (base × hauteur) ÷ 2</p>
        <p>A = (12 × 7) ÷ 2</p>
        <p>A = 84 ÷ 2</p>
        <p>A = <span class="font-bold text-orange-600">42 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Pythagore (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle rectangle a des côtés de 5 cm et 12 cm. Trouver l'hypoténuse</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>a² = b² + c²</p>
        <p>a² = 5² + 12²</p>
        <p>a² = 25 + 144 = 169</p>
        <p>a = √169 = <span class="font-bold text-purple-600">13 cm</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème complexe (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un terrain triangulaire a des côtés de 30 m, 40 m et 50 m. Est-ce un triangle rectangle ? Calculer son aire</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-3">📝 Solution :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Vérification Pythagore :</p>
          <p>50² = 30² + 40² ?</p>
          <p>2500 = 900 + 1600 = 2500 ✓</p>
          <p class="font-bold text-blue-600 mt-1">Oui, c'est un triangle rectangle !</p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-semibold text-pink-700 dark:text-pink-300 mb-1">Aire :</p>
          <p>A = (30 × 40) ÷ 2 = 1200 ÷ 2 = <span class="font-bold text-pink-600">600 m²</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "aires-perimetres": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Distinguer périmètre et aire
• Calculer le périmètre de figures variées
• Calculer l'aire de figures géométriques courantes
• Résoudre des problèmes pratiques de mesure`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Quelle est la différence entre mesurer le tour d'un champ et sa surface ?</span> 
    Le tour, c'est le <span class="italic font-semibold text-accent">périmètre</span>, 
    la surface, c'est l'<span class="italic font-semibold text-primary">aire</span> !
  </p>
  
  <p class="text-lg leading-relaxed">
    Ces deux mesures sont essentielles dans la vie quotidienne : 
    calculer combien de clôture il faut pour entourer un terrain (périmètre), 
    ou combien de peinture pour couvrir un mur (aire).
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Astuce :</span> 
    Périmètre = TOUR (en mètres), Aire = SURFACE (en mètres carrés)</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Différences -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Périmètre vs Aire
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📏 Périmètre</h4>
        <p class="leading-relaxed mb-2">
          Le périmètre est la <span class="font-semibold text-accent">longueur du contour</span> d'une figure
        </p>
        <p class="text-sm">• Unités : m, cm, km...</p>
        <p class="text-sm">• On additionne les longueurs des côtés</p>
        <p class="text-sm italic mt-2">Exemple : Une clôture autour d'un jardin</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📐 Aire</h4>
        <p class="leading-relaxed mb-2">
          L'aire est la <span class="font-semibold text-accent">mesure de la surface</span> à l'intérieur d'une figure
        </p>
        <p class="text-sm">• Unités : m², cm², km²...</p>
        <p class="text-sm">• On multiplie généralement deux dimensions</p>
        <p class="text-sm italic mt-2">Exemple : La quantité de peinture pour un mur</p>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Important :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">
          Deux figures peuvent avoir le même périmètre mais des aires différentes, et vice versa !
        </p>
      </div>
    </div>
  </section>

  <!-- Section 2: Périmètres -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📏 Formules des Périmètres
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">▭ Rectangle</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-lg">P = 2 × (Longueur + largeur)</p>
          <p class="font-mono text-lg">P = 2 × (L + l)</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">▢ Carré</h4>
        <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded">
          <p class="font-mono text-lg">P = 4 × côté</p>
          <p class="font-mono text-lg">P = 4c</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">△ Triangle</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-lg">P = côté₁ + côté₂ + côté₃</p>
          <p class="font-mono text-lg">P = a + b + c</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">○ Cercle</h4>
        <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded">
          <p class="font-mono text-lg">P = 2 × π × rayon</p>
          <p class="font-mono text-lg">P = 2πr ou P = πd</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Aires -->
  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📐 Formules des Aires
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">▭ Rectangle</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-xl">A = Longueur × largeur</p>
          <p class="font-mono text-xl">A = L × l</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">▢ Carré</h4>
        <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded">
          <p class="font-mono text-xl">A = côté × côté</p>
          <p class="font-mono text-xl">A = c²</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">△ Triangle</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-xl">A = (base × hauteur) ÷ 2</p>
          <p class="font-mono text-xl">A = (b × h) / 2</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">○ Disque (Cercle plein)</h4>
        <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded">
          <p class="font-mono text-xl">A = π × rayon²</p>
          <p class="font-mono text-xl">A = πr²</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">▱ Parallélogramme</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-xl">A = base × hauteur</p>
          <p class="font-mono text-xl">A = b × h</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">◇ Losange</h4>
        <div class="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded">
          <p class="font-mono text-xl">A = (diagonale₁ × diagonale₂) ÷ 2</p>
          <p class="font-mono text-xl">A = (D × d) / 2</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">⬠ Trapèze</h4>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-xl">A = [(petite base + grande base) × hauteur] ÷ 2</p>
          <p class="font-mono text-xl">A = [(b + B) × h] / 2</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Unités -->
  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      🔢 Conversions d'Unités
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📏 Longueurs (pour périmètres)</h4>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded font-mono text-sm">
          <p>1 km = 1000 m</p>
          <p>1 m = 100 cm = 1000 mm</p>
          <p>1 cm = 10 mm</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Aires (surfaces)</h4>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded font-mono text-sm">
          <p>1 km² = 1 000 000 m² (10⁶ m²)</p>
          <p>1 m² = 10 000 cm²</p>
          <p>1 cm² = 100 mm²</p>
          <p class="mt-2 text-muted-foreground">1 hectare (ha) = 10 000 m²</p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Attention :</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">
          Pour les aires, on multiplie par le carré : 1 m = 100 cm, donc 1 m² = 100 × 100 = 10 000 cm²
        </p>
      </div>
    </div>
  </section>

  <!-- Section 5: Applications -->
  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🌟 Applications Pratiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-green-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🏡 Terrain rectangulaire</h4>
        <p class="mb-2">Terrain 25m × 15m. Calculer clôture nécessaire et surface</p>
        <div class="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded text-sm">
          <p><span class="font-semibold">Périmètre :</span> 2×(25+15) = 2×40 = <span class="font-bold">80 m</span> de clôture</p>
          <p><span class="font-semibold">Aire :</span> 25×15 = <span class="font-bold">375 m²</span> de surface</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">🎨 Peinture murale</h4>
        <p class="mb-2">Mur 4m × 3m. 1L de peinture couvre 10m². Combien de litres ?</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded text-sm">
          <p><span class="font-semibold">Aire :</span> 4×3 = 12 m²</p>
          <p><span class="font-semibold">Peinture :</span> 12÷10 = <span class="font-bold">1,2 L</span> (arrondir à 2L)</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Conseils -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Dessine toujours</span> la figure pour mieux visualiser</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifie tes unités :</span> m pour périmètre, m² pour aire</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pour les figures complexes :</span> décompose-les en figures simples</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Retiens :</span> Périmètre = tour, Aire = surface intérieure</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Rectangle (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un rectangle mesure 8 cm de long et 5 cm de large. Calculer son périmètre et son aire</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Périmètre :</span> P = 2×(L+l) = 2×(8+5) = 2×13 = <span class="font-bold text-blue-600">26 cm</span></p>
        <p><span class="font-semibold">Aire :</span> A = L×l = 8×5 = <span class="font-bold text-blue-600">40 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Carré (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un carré a un côté de 12 m. Calculer son périmètre et son aire</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Périmètre :</span> P = 4c = 4×12 = <span class="font-bold text-green-600">48 m</span></p>
        <p><span class="font-semibold">Aire :</span> A = c² = 12² = <span class="font-bold text-green-600">144 m²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Cercle (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un cercle a un rayon de 10 cm. Calculer son périmètre et l'aire du disque</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p><span class="font-semibold">Périmètre :</span> P = 2πr = 2×3,14×10 = <span class="font-bold text-orange-600">62,8 cm</span></p>
        <p><span class="font-semibold">Aire :</span> A = πr² = 3,14×10² = 3,14×100 = <span class="font-bold text-orange-600">314 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Trapèze (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un trapèze a des bases de 6 cm et 10 cm, et une hauteur de 4 cm. Calculer son aire</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = [(b+B)×h]/2</p>
        <p>A = [(6+10)×4]/2</p>
        <p>A = [16×4]/2</p>
        <p>A = 64/2 = <span class="font-bold text-purple-600">32 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème Pratique (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un jardin rectangulaire de 20m × 15m est entouré d'une allée de 2m de large. Calculer l'aire de l'allée</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-3">📝 Solution :</p>
      <div class="space-y-3 text-sm">
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold text-blue-700 dark:text-blue-300 mb-1">Aire totale (avec allée) :</p>
          <p>Dimensions : (20+2+2) × (15+2+2) = 24×19</p>
          <p>A_totale = <span class="font-bold">456 m²</span></p>
        </div>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold text-green-700 dark:text-green-300 mb-1">Aire du jardin :</p>
          <p>A_jardin = 20×15 = <span class="font-bold">300 m²</span></p>
        </div>
        <div class="p-3 bg-pink-50 dark:bg-pink-950/30 rounded border-2 border-pink-300 dark:border-pink-700">
          <p class="font-bold text-pink-600 mb-1">✅ Aire de l'allée :</p>
          <p>A_allée = A_totale - A_jardin</p>
          <p>A_allée = 456 - 300 = <span class="font-bold text-pink-600">156 m²</span></p>
        </div>
      </div>
    </div>
  </div>

</div>`
  },

  "proportionnalite": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître des situations de proportionnalité
• Calculer une quatrième proportionnelle
• Utiliser les tableaux de proportionnalité
• Résoudre des problèmes de pourcentages et d'échelles`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Si 2 cahiers coûtent 50 gourdes, combien coûtent 5 cahiers ?</span> 
    C'est un problème de <span class="italic font-semibold text-accent">proportionnalité</span> !
  </p>
  
  <p class="text-lg leading-relaxed">
    La proportionnalité est partout : recettes de cuisine, conversion de monnaies, 
    vitesse des véhicules, réduction d'images... C'est un outil mathématique essentiel !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Clé :</span> 
    Deux grandeurs sont proportionnelles si on multiplie/divise l'une, l'autre aussi !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Qu'est-ce que la Proportionnalité ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed">
          Deux grandeurs sont proportionnelles si on peut passer de l'une à l'autre en multipliant 
          toujours par <span class="font-semibold text-accent">le même nombre</span> (coefficient de proportionnalité)
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Prix des cahiers :</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono text-sm">
          <p>1 cahier → 25 gourdes</p>
          <p>2 cahiers → 50 gourdes (×2)</p>
          <p>3 cahiers → 75 gourdes (×3)</p>
          <p class="mt-2 text-primary font-bold">Coefficient : 25 gourdes/cahier</p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📊 Tableaux de Proportionnalité
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Méthode du produit en croix</h4>
        <p class="mb-3">Si a/b = c/d, alors : <span class="font-mono font-bold">a × d = b × c</span></p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-center text-lg">a × d = b × c</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">3 kg de riz coûtent 120 gourdes. Combien coûtent 7 kg ?</p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded text-sm">
          <p>3 kg → 120 gourdes</p>
          <p>7 kg → ? gourdes</p>
          <p class="mt-2 font-semibold">3 × ? = 7 × 120</p>
          <p>? = (7 × 120) ÷ 3 = 840 ÷ 3 = <span class="font-bold text-green-600">280 gourdes</span></p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      💰 Pourcentages
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Calcul de pourcentage</h4>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-xl text-center">x% de N = (x × N) ÷ 100</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Calculer 15% de 200 gourdes</p>
        <div class="p-3 bg-orange-50 dark:bg-orange-950/30 rounded">
          <p class="font-mono">(15 × 200) ÷ 100 = 3000 ÷ 100 = <span class="font-bold text-orange-600">30 gourdes</span></p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      📏 Échelles
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-2">
          L'échelle est le rapport entre une distance sur le plan et la distance réelle
        </p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono text-center">Échelle = Distance sur plan / Distance réelle</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple</h4>
        <p class="mb-2">Sur une carte à l'échelle 1/50000, 5 cm représentent quelle distance réelle ?</p>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded text-sm">
          <p>1 cm sur carte = 50 000 cm réels</p>
          <p>5 cm sur carte = 5 × 50 000 = 250 000 cm</p>
          <p>= <span class="font-bold text-purple-600">2500 m = 2,5 km</span></p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      ⚡ Vitesse, Distance, Temps
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Formules</h4>
        <div class="space-y-2">
          <div class="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded font-mono">
            <p>Vitesse = Distance ÷ Temps</p>
          </div>
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
            <p>Distance = Vitesse × Temps</p>
          </div>
          <div class="p-3 bg-teal-50 dark:bg-teal-950/30 rounded font-mono">
            <p>Temps = Distance ÷ Vitesse</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Vérifie la proportionnalité :</span> le coefficient doit être constant</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Produit en croix :</span> très utile pour trouver une valeur manquante</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pourcentage :</span> pense toujours "sur 100"</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Proportionnalité simple (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">5 livres coûtent 200 gourdes. Combien coûtent 8 livres ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>5 × ? = 8 × 200</p>
        <p>? = (8 × 200) ÷ 5 = 1600 ÷ 5</p>
        <p>? = <span class="font-bold text-blue-600">320 gourdes</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Pourcentage (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un article de 500 gourdes a une réduction de 20%. Quel est le nouveau prix ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Réduction = 20% de 500 = (20×500)÷100 = 100 gourdes</p>
        <p>Nouveau prix = 500 - 100 = <span class="font-bold text-green-600">400 gourdes</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Échelle (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Sur une carte à l'échelle 1/25000, deux villes sont distantes de 8 cm. Quelle est la distance réelle ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>1 cm sur carte = 25 000 cm réels</p>
        <p>8 cm sur carte = 8 × 25 000 = 200 000 cm</p>
        <p>= 2000 m = <span class="font-bold text-orange-600">2 km</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Vitesse (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Une voiture roule à 60 km/h. Quelle distance parcourt-elle en 2h30 ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>2h30 = 2,5 heures</p>
        <p>Distance = Vitesse × Temps</p>
        <p>Distance = 60 × 2,5 = <span class="font-bold text-purple-600">150 km</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Recette (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Une recette pour 4 personnes nécessite 300g de farine. Combien faut-il pour 7 personnes ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>4 × ? = 7 × 300</p>
        <p>? = (7 × 300) ÷ 4 = 2100 ÷ 4</p>
        <p>? = <span class="font-bold text-pink-600">525 g de farine</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "nombres-relatifs": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Comprendre la notion de nombres relatifs positifs et négatifs
• Repérer et comparer des nombres relatifs sur une droite graduée
• Effectuer des additions et soustractions de nombres relatifs
• Résoudre des problèmes concrets avec les nombres relatifs`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Connais-tu la température en hiver au Canada ?</span> 
    Elle peut descendre à -30°C ! 
    <span class="italic">Comment représenter ces températures inférieures à zéro ?</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les nombres relatifs nous permettent de représenter des <span class="font-semibold text-accent">quantités négatives</span> : 
    des températures sous zéro, des dettes en argent, des altitudes sous le niveau de la mer, 
    ou encore des mouvements vers la gauche ou vers le bas.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Un nombre relatif est comme une direction - 
    le signe + indique "dans un sens" et le signe - indique "dans le sens opposé" !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions clés -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Définitions clés
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Nombre relatif</h4>
        <p class="leading-relaxed">
          Un nombre relatif est un nombre précédé d'un signe + (positif) ou - (négatif).
        </p>
        <p class="mt-2 text-sm text-muted-foreground italic">
          Exemples : +5, -3, +12, -0,5, 0
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Nombres opposés</h4>
        <p class="leading-relaxed">
          Deux nombres sont opposés s'ils ont la même distance à zéro mais des signes différents.
        </p>
        <p class="mt-2 font-mono text-lg">
          +7 et -7 sont opposés  •  +3,5 et -3,5 sont opposés
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Distance à zéro (Valeur absolue)</h4>
        <p class="leading-relaxed">
          C'est la distance entre le nombre et zéro sur la droite graduée, toujours positive.
        </p>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-mono text-lg">
            |-5| = 5  •  |+3| = 3  •  |-12,7| = 12,7
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: La droite graduée -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📏 La droite graduée
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🔍 Repérage sur la droite</h4>
        <div class="my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div class="flex items-center justify-center gap-8 text-lg font-mono">
            <span>-5</span>
            <span>-4</span>
            <span>-3</span>
            <span>-2</span>
            <span>-1</span>
            <span class="font-bold text-primary text-2xl">0</span>
            <span>+1</span>
            <span>+2</span>
            <span>+3</span>
            <span>+4</span>
            <span>+5</span>
          </div>
          <div class="h-1 bg-gradient-to-r from-red-500 via-gray-500 to-blue-500 mt-2 rounded"></div>
        </div>
        <p class="text-sm text-muted-foreground">Les nombres négatifs sont à gauche de zéro, les positifs à droite.</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Comparaison</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>Tout nombre positif est <span class="font-semibold">plus grand</span> que tout nombre négatif</li>
          <li>Entre deux nombres négatifs, le plus grand est celui qui est <span class="font-semibold">le plus proche de zéro</span></li>
          <li>Sur la droite graduée, le plus grand est toujours <span class="font-semibold">à droite</span></li>
        </ul>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-mono">-8 &lt; -3 &lt; 0 &lt; +2 &lt; +7</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Addition de nombres relatifs -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ➕ Addition de nombres relatifs
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">Règle 1 : Même signe</h4>
        <p class="mb-2">On additionne les distances à zéro et on garde le signe commun.</p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded font-mono">
          <p>(+5) + (+3) = +(5+3) = +8</p>
          <p class="mt-1">(-7) + (-2) = -(7+2) = -9</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">Règle 2 : Signes différents</h4>
        <p class="mb-2">On soustrait les distances à zéro et on garde le signe du nombre le plus éloigné de zéro.</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>(+8) + (-3) = +(8-3) = +5</p>
          <p class="mt-1">(-10) + (+4) = -(10-4) = -6</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Soustraction -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ➖ Soustraction de nombres relatifs
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Règle d'or</h4>
        <p class="leading-relaxed mb-3">
          <span class="font-semibold">Soustraire un nombre, c'est ajouter son opposé.</span>
        </p>
        <div class="space-y-2">
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded font-mono">
            <p>(+7) - (+3) = (+7) + (-3) = +4</p>
          </div>
          <div class="p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded font-mono">
            <p>(+5) - (-2) = (+5) + (+2) = +7</p>
          </div>
          <div class="p-3 bg-amber-50 dark:bg-amber-950/30 rounded font-mono">
            <p>(-4) - (+6) = (-4) + (-6) = -10</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Applications pratiques -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🌍 Applications pratiques
    </h3>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">🌡️ Températures</h4>
        <p class="text-sm">-5°C (5 degrés sous zéro)</p>
        <p class="text-sm">+20°C (20 degrés au-dessus de zéro)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">🏔️ Altitudes</h4>
        <p class="text-sm">-400m (sous le niveau de la mer)</p>
        <p class="text-sm">+2000m (au-dessus du niveau de la mer)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">💰 Compte bancaire</h4>
        <p class="text-sm">-500 HTG (dette de 500 gourdes)</p>
        <p class="text-sm">+1000 HTG (avoir de 1000 gourdes)</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">📅 Chronologie</h4>
        <p class="text-sm">-100 (100 ans avant J.-C.)</p>
        <p class="text-sm">+2025 (année 2025 après J.-C.)</p>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Utilise la droite graduée :</span> elle t'aide à visualiser</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Soustraire = ajouter l'opposé :</span> transforme toujours en addition</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Parenthèses :</span> utilise-les pour éviter les erreurs de signe</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Comparaison (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Range dans l'ordre croissant : -5, +2, -1, 0, +4, -3</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Les négatifs d'abord (du plus petit au plus grand) puis les positifs</p>
        <p class="font-bold text-blue-600">-5 &lt; -3 &lt; -1 &lt; 0 &lt; +2 &lt; +4</p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Addition même signe (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule : (-7) + (-3)</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Même signe : on additionne et on garde le signe -</p>
        <p>(-7) + (-3) = -(7+3) = <span class="font-bold text-green-600">-10</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Addition signes différents (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule : (+8) + (-5)</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Signes différents : on soustrait et on garde le signe du plus grand</p>
        <p>(+8) + (-5) = +(8-5) = <span class="font-bold text-orange-600">+3</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Soustraction (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule : (-6) - (-4)</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Soustraire = ajouter l'opposé</p>
        <p>(-6) - (-4) = (-6) + (+4)</p>
        <p>= -(6-4) = <span class="font-bold text-purple-600">-2</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème température (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">La température ce matin était -3°C. Elle a augmenté de 8°C. Quelle est la température maintenant ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>(-3) + (+8) = +(8-3)</p>
        <p>= <span class="font-bold text-pink-600">+5°C</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "volumes-solides": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître et nommer les principaux solides géométriques
• Calculer le volume de cubes, pavés droits, cylindres et prismes
• Convertir des unités de volume
• Résoudre des problèmes pratiques de volumes`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Combien d'eau peut contenir une bouteille ?</span> 
    Quel est le volume d'une boîte de conserve ? 
    <span class="italic">Comment mesurer l'espace occupé par un objet ?</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Le volume mesure <span class="font-semibold text-accent">l'espace qu'occupe un objet en 3 dimensions</span>. 
    Que ce soit pour remplir un réservoir d'eau, construire une maison, ou emballer des colis, 
    savoir calculer des volumes est essentiel dans la vie quotidienne.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Le volume se mesure en unités cubes - 
    imagine combien de petits cubes peuvent rentrer dans ton objet !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définitions et unités -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Définitions et unités
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Le volume</h4>
        <p class="leading-relaxed">
          Le volume d'un solide mesure l'espace qu'il occupe dans l'espace à trois dimensions.
        </p>
        <p class="mt-2 text-sm text-muted-foreground italic">
          Unité principale : le mètre cube (m³)
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Unités de volume</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm mt-2">
            <thead class="bg-primary/10">
              <tr>
                <th class="p-2 text-left">Unité</th>
                <th class="p-2 text-left">Symbole</th>
                <th class="p-2 text-left">Équivalence</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr><td class="p-2">Kilomètre cube</td><td class="p-2 font-mono">km³</td><td class="p-2">1 000 000 000 m³</td></tr>
              <tr><td class="p-2">Mètre cube</td><td class="p-2 font-mono">m³</td><td class="p-2">1 m³</td></tr>
              <tr><td class="p-2">Décimètre cube</td><td class="p-2 font-mono">dm³</td><td class="p-2">0,001 m³ = 1 litre</td></tr>
              <tr><td class="p-2">Centimètre cube</td><td class="p-2 font-mono">cm³</td><td class="p-2">0,000001 m³ = 1 ml</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💧 Capacité (liquides)</h4>
        <p class="leading-relaxed mb-2">Pour les liquides, on utilise le litre (L).</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono text-sm">
          <p>1 L = 1 dm³</p>
          <p>1 mL = 1 cm³</p>
          <p>1 m³ = 1000 L</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Le cube -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      🧊 Le cube
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Formule</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2">Un cube a 6 faces carrées identiques.</p>
            <p class="mb-2">Si <span class="font-mono">c</span> = côté du cube :</p>
            <div class="p-4 bg-green-100 dark:bg-green-950/40 rounded-lg text-center">
              <p class="text-2xl font-bold text-green-700 dark:text-green-300 font-mono">V = c³</p>
              <p class="text-sm mt-2">V = c × c × c</p>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <div class="w-32 h-32 bg-gradient-to-br from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 rounded-lg shadow-xl transform rotate-12 border-4 border-green-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Cube de côté 5 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>V = 5³ = 5 × 5 × 5 = <span class="font-bold text-green-600">125 cm³</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Le pavé droit -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📦 Le pavé droit (parallélépipède rectangle)
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Formule</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2">Un pavé droit a 6 faces rectangulaires.</p>
            <p class="mb-2">Si L = longueur, l = largeur, h = hauteur :</p>
            <div class="p-4 bg-orange-100 dark:bg-orange-950/40 rounded-lg text-center">
              <p class="text-2xl font-bold text-orange-700 dark:text-orange-300 font-mono">V = L × l × h</p>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <div class="w-40 h-24 bg-gradient-to-br from-orange-200 to-amber-200 dark:from-orange-800 dark:to-amber-800 rounded-lg shadow-xl transform rotate-6 border-4 border-orange-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Boîte : L = 8 cm, l = 5 cm, h = 3 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>V = 8 × 5 × 3 = <span class="font-bold text-orange-600">120 cm³</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Le cylindre -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      🥫 Le cylindre
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Formule</h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2">Un cylindre a deux bases circulaires identiques.</p>
            <p class="mb-2">Si r = rayon de la base, h = hauteur :</p>
            <div class="p-4 bg-pink-100 dark:bg-pink-950/40 rounded-lg text-center">
              <p class="text-2xl font-bold text-pink-700 dark:text-pink-300 font-mono">V = π × r² × h</p>
              <p class="text-sm mt-2">π ≈ 3,14</p>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <div class="w-24 h-32 bg-gradient-to-b from-pink-200 to-rose-200 dark:from-pink-800 dark:to-rose-800 rounded-full shadow-xl border-4 border-pink-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Bouteille : r = 3 cm, h = 15 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono text-sm">
          <p>V = 3,14 × 3² × 15</p>
          <p>V = 3,14 × 9 × 15</p>
          <p>V = <span class="font-bold text-pink-600">423,9 cm³ ≈ 424 mL</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Le prisme -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🏛️ Le prisme droit
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📐 Formule générale</h4>
        <p class="mb-3">Un prisme a deux bases identiques (triangles, pentagones, etc.) et des faces latérales rectangulaires.</p>
        <div class="p-4 bg-cyan-100 dark:bg-cyan-950/40 rounded-lg text-center">
          <p class="text-2xl font-bold text-cyan-700 dark:text-cyan-300 font-mono">V = Aire de la base × hauteur</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Prisme triangulaire</h4>
        <p class="mb-2">Base triangulaire : b = 6 cm, hauteur du triangle = 4 cm, hauteur du prisme = 10 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono text-sm">
          <p>Aire de la base = (6 × 4) ÷ 2 = 12 cm²</p>
          <p>V = 12 × 10 = <span class="font-bold text-cyan-600">120 cm³</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Unités cohérentes :</span> toutes les dimensions dans la même unité</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">1 L = 1 dm³ :</span> conversion facile entre volume et capacité</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Conversions :</span> ×1000 pour passer d'une unité à la suivante</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Volume d'un cube (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule le volume d'un cube de côté 4 cm.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>V = c³ = 4³</p>
        <p>V = 4 × 4 × 4</p>
        <p>V = <span class="font-bold text-blue-600">64 cm³</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Volume d'un pavé (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Une boîte mesure 10 cm × 6 cm × 5 cm. Quel est son volume ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>V = L × l × h</p>
        <p>V = 10 × 6 × 5</p>
        <p>V = <span class="font-bold text-green-600">300 cm³</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Volume d'un cylindre (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Une bouteille cylindrique a un rayon de 4 cm et une hauteur de 20 cm. Quelle est sa capacité en mL ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>V = π × r² × h</p>
        <p>V = 3,14 × 4² × 20</p>
        <p>V = 3,14 × 16 × 20 = 1004,8 cm³</p>
        <p>1 cm³ = 1 mL donc V = <span class="font-bold text-orange-600">≈ 1005 mL ≈ 1 L</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Conversion (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un réservoir de 2,5 m³ est rempli d'eau. Combien de litres contient-il ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>1 m³ = 1000 L</p>
        <p>2,5 m³ = 2,5 × 1000</p>
        <p>= <span class="font-bold text-purple-600">2500 L</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème pratique (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Une piscine rectangulaire mesure 8 m × 4 m × 1,5 m. Combien de litres d'eau faut-il pour la remplir ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>V = 8 × 4 × 1,5 = 48 m³</p>
        <p>1 m³ = 1000 L</p>
        <p>48 m³ = <span class="font-bold text-pink-600">48 000 L</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "parallelogrammes": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître et identifier les différents types de parallélogrammes
• Calculer le périmètre et l'aire d'un parallélogramme
• Connaître les propriétés des parallélogrammes particuliers
• Résoudre des problèmes géométriques avec les parallélogrammes`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">As-tu remarqué la forme d'un terrain de football ?</span> 
    Ou celle d'un cahier ouvert ? 
    <span class="italic">Ces formes sont des parallélogrammes !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les parallélogrammes sont des <span class="font-semibold text-accent">quadrilatères particuliers</span> 
    qui ont des propriétés intéressantes. On les retrouve partout : dans l'architecture, 
    les objets du quotidien, et même dans la nature.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> "Parallèle" signifie que les côtés 
    opposés sont parallèles - ils ne se rencontrent jamais, comme des rails de chemin de fer !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Définition -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Définition du parallélogramme
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Qu'est-ce qu'un parallélogramme ?</h4>
        <p class="leading-relaxed mb-3">
          Un parallélogramme est un <span class="font-semibold">quadrilatère dont les côtés opposés sont parallèles</span>.
        </p>
        <div class="flex justify-center my-4">
          <div class="relative w-48 h-32">
            <div class="absolute w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 transform skew-x-12 rounded border-2 border-blue-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés principales</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>Les <span class="font-semibold">côtés opposés sont parallèles et de même longueur</span></li>
          <li>Les <span class="font-semibold">angles opposés sont égaux</span></li>
          <li>Les <span class="font-semibold">diagonales se coupent en leur milieu</span></li>
          <li>La somme des angles = 360°</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 2: Types de parallélogrammes -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      🏛️ Les parallélogrammes particuliers
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          📐 Le rectangle
        </h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2"><span class="font-semibold">Définition :</span> Parallélogramme avec 4 angles droits</p>
            <p class="text-sm text-muted-foreground">Propriété : Les diagonales sont égales</p>
          </div>
          <div class="flex justify-center">
            <div class="w-32 h-20 bg-gradient-to-br from-green-200 to-teal-200 dark:from-green-800 dark:to-teal-800 rounded border-2 border-green-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          🔷 Le losange
        </h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2"><span class="font-semibold">Définition :</span> Parallélogramme avec 4 côtés égaux</p>
            <p class="text-sm text-muted-foreground">Propriété : Les diagonales sont perpendiculaires</p>
          </div>
          <div class="flex justify-center">
            <div class="w-20 h-20 bg-gradient-to-br from-teal-200 to-cyan-200 dark:from-teal-800 dark:to-cyan-800 transform rotate-45 rounded border-2 border-teal-400"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ⬜ Le carré
        </h4>
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="mb-2"><span class="font-semibold">Définition :</span> Rectangle ET losange à la fois</p>
            <p class="text-sm text-muted-foreground">C'est le plus "parfait" des parallélogrammes !</p>
          </div>
          <div class="flex justify-center">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded border-2 border-blue-400"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Périmètre -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📏 Périmètre
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Formule générale</h4>
        <p class="mb-3">Le périmètre est la longueur du tour complet.</p>
        <div class="p-4 bg-orange-100 dark:bg-orange-950/40 rounded-lg text-center">
          <p class="text-2xl font-bold text-orange-700 dark:text-orange-300 font-mono">P = 2(a + b)</p>
          <p class="text-sm mt-2">où a et b sont les longueurs des côtés adjacents</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">Cas particuliers</h4>
        <div class="grid md:grid-cols-2 gap-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Carré (côté c)</p>
            <p class="font-mono">P = 4c</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold mb-1">Losange (côté c)</p>
            <p class="font-mono">P = 4c</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Rectangle : L = 8 cm, l = 5 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>P = 2(8 + 5) = 2 × 13 = <span class="font-bold text-orange-600">26 cm</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Aire -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      📐 Aire (surface)
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Formule générale du parallélogramme</h4>
        <p class="mb-3">L'aire se calcule avec la base et la hauteur perpendiculaire.</p>
        <div class="p-4 bg-pink-100 dark:bg-pink-950/40 rounded-lg text-center">
          <p class="text-2xl font-bold text-pink-700 dark:text-pink-300 font-mono">A = base × hauteur</p>
          <p class="text-sm mt-2">A = b × h</p>
        </div>
        <p class="mt-3 text-sm text-muted-foreground italic">⚠️ La hauteur est perpendiculaire à la base, pas le côté incliné !</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">Formules particulières</h4>
        <div class="space-y-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Rectangle (L × l)</p>
            <p class="font-mono">A = L × l</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold mb-1">Carré (côté c)</p>
            <p class="font-mono">A = c²</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold mb-1">Losange (diagonales d₁ et d₂)</p>
            <p class="font-mono">A = (d₁ × d₂) ÷ 2</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Parallélogramme : base = 10 cm, hauteur = 6 cm</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>A = 10 × 6 = <span class="font-bold text-pink-600">60 cm²</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 5: Construction -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🔨 Comment construire un parallélogramme ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Méthode avec règle et équerre</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li>Trace un côté AB</li>
          <li>À partir de A, trace un autre côté AD</li>
          <li>À partir de B, trace une droite parallèle à AD</li>
          <li>À partir de D, trace une droite parallèle à AB</li>
          <li>Les deux droites se croisent en C</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Astuce</h4>
        <p class="leading-relaxed">
          Pour tracer des parallèles, utilise ton équerre ! Place-la contre une règle et fais-la glisser.
        </p>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Hauteur ≠ côté :</span> la hauteur est toujours perpendiculaire</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Le carré :</span> c'est le seul qui est à la fois rectangle et losange</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Aire du losange :</span> pense aux diagonales qui se coupent en croix</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Périmètre d'un rectangle (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un rectangle a pour dimensions 12 cm et 7 cm. Calcule son périmètre.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>P = 2(L + l)</p>
        <p>P = 2(12 + 7) = 2 × 19</p>
        <p>P = <span class="font-bold text-blue-600">38 cm</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Aire d'un carré (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Un carré a un côté de 9 cm. Calcule son aire.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = c²</p>
        <p>A = 9² = 9 × 9</p>
        <p>A = <span class="font-bold text-green-600">81 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Aire d'un parallélogramme (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un parallélogramme a une base de 15 cm et une hauteur de 8 cm. Calcule son aire.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = base × hauteur</p>
        <p>A = 15 × 8</p>
        <p>A = <span class="font-bold text-orange-600">120 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Aire d'un losange (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un losange a des diagonales de 10 cm et 16 cm. Calcule son aire.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>A = (d₁ × d₂) ÷ 2</p>
        <p>A = (10 × 16) ÷ 2</p>
        <p>A = 160 ÷ 2</p>
        <p>A = <span class="font-bold text-purple-600">80 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Problème terrain (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un terrain rectangulaire de 25 m sur 18 m coûte 450 gourdes le m². Quel est le prix total du terrain ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Aire = 25 × 18 = 450 m²</p>
        <p>Prix total = 450 m² × 450 gourdes/m²</p>
        <p>= <span class="font-bold text-pink-600">202 500 gourdes</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "reperage-quadrillage": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Repérer un point dans un quadrillage avec des coordonnées
• Placer un point connaissant ses coordonnées
• Lire et interpréter un plan ou une carte quadrillée
• Résoudre des problèmes de repérage spatial`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment indiquer ta position sur une carte ?</span> 
    Ou comment décrire l'emplacement d'un trésor caché ? 
    <span class="italic">Le repérage sur quadrillage est la solution !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Le repérage permet de <span class="font-semibold text-accent">localiser précisément un point dans l'espace</span> 
    en utilisant des coordonnées. C'est le principe des GPS, des cartes géographiques, 
    et même des jeux vidéo !
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Pense au jeu de bataille navale - 
    on utilise toujours deux informations pour localiser une case : la colonne et la ligne !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Le quadrillage de base -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Le quadrillage et les coordonnées
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📌 Qu'est-ce qu'un repère ?</h4>
        <p class="leading-relaxed mb-4">
          Un repère est formé de deux axes perpendiculaires qui se coupent en un point appelé <span class="font-semibold">origine</span>.
        </p>
        
        <div class="my-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div class="relative" style="height: 280px;">
            <!-- Grid -->
            <svg viewBox="0 0 400 280" class="w-full h-full">
              <!-- Grid lines -->
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="400" height="280" fill="url(#grid)" />
              
              <!-- Axes -->
              <line x1="40" y1="240" x2="360" y2="240" stroke="currentColor" stroke-width="2" class="text-primary"/>
              <line x1="40" y1="240" x2="40" y2="20" stroke="currentColor" stroke-width="2" class="text-accent"/>
              
              <!-- Arrows -->
              <polygon points="360,240 350,235 350,245" fill="currentColor" class="text-primary"/>
              <polygon points="40,20 35,30 45,30" fill="currentColor" class="text-accent"/>
              
              <!-- Origin -->
              <circle cx="40" cy="240" r="4" fill="currentColor" class="text-red-500"/>
              <text x="25" y="255" font-size="14" font-weight="bold" fill="currentColor" class="text-red-500">O</text>
              
              <!-- Axis labels -->
              <text x="370" y="245" font-size="14" font-weight="bold" fill="currentColor" class="text-primary">x</text>
              <text x="45" y="15" font-size="14" font-weight="bold" fill="currentColor" class="text-accent">y</text>
              
              <!-- Grid numbers -->
              <text x="75" y="255" font-size="12" fill="currentColor" opacity="0.6">1</text>
              <text x="115" y="255" font-size="12" fill="currentColor" opacity="0.6">2</text>
              <text x="155" y="255" font-size="12" fill="currentColor" opacity="0.6">3</text>
              <text x="195" y="255" font-size="12" fill="currentColor" opacity="0.6">4</text>
              <text x="235" y="255" font-size="12" fill="currentColor" opacity="0.6">5</text>
              <text x="275" y="255" font-size="12" fill="currentColor" opacity="0.6">6</text>
              <text x="315" y="255" font-size="12" fill="currentColor" opacity="0.6">7</text>
              
              <text x="25" y="205" font-size="12" fill="currentColor" opacity="0.6">1</text>
              <text x="25" y="165" font-size="12" fill="currentColor" opacity="0.6">2</text>
              <text x="25" y="125" font-size="12" fill="currentColor" opacity="0.6">3</text>
              <text x="25" y="85" font-size="12" fill="currentColor" opacity="0.6">4</text>
              <text x="25" y="45" font-size="12" fill="currentColor" opacity="0.6">5</text>
              
              <!-- Example points -->
              <circle cx="120" cy="200" r="5" fill="currentColor" class="text-green-500"/>
              <text x="130" y="200" font-size="14" font-weight="bold" fill="currentColor" class="text-green-600">A(2;1)</text>
              
              <circle cx="240" cy="120" r="5" fill="currentColor" class="text-blue-500"/>
              <text x="250" y="120" font-size="14" font-weight="bold" fill="currentColor" class="text-blue-600">B(5;3)</text>
              
              <circle cx="160" cy="80" r="5" fill="currentColor" class="text-purple-500"/>
              <text x="170" y="80" font-size="14" font-weight="bold" fill="currentColor" class="text-purple-600">C(3;4)</text>
            </svg>
          </div>
        </div>
        
        <ul class="space-y-2 mt-4">
          <li class="flex items-start gap-2">
            <span class="text-primary font-bold shrink-0">→</span>
            <span><span class="font-semibold">Axe horizontal (x)</span> : axe des abscisses</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-accent font-bold shrink-0">↑</span>
            <span><span class="font-semibold">Axe vertical (y)</span> : axe des ordonnées</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-red-500 font-bold shrink-0">o</span>
            <span><span class="font-semibold">Origine</span> : point de coordonnées (0,0)</span>
          </li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Les coordonnées d'un point</h4>
        <p class="leading-relaxed mb-3">
          Les coordonnées d'un point sont notées <span class="font-mono text-lg">(x ; y)</span>
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold text-primary mb-1">Abscisse (x)</p>
            <p class="text-sm">Position horizontale (gauche-droite)</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold text-accent mb-1">Ordonnée (y)</p>
            <p class="text-sm">Position verticale (bas-haut)</p>
          </div>
        </div>
        <div class="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded border-l-4 border-primary">
          <p class="font-semibold">📍 Ordre important : toujours (x ; y) !</p>
          <p class="text-sm mt-1">D'abord l'horizontal, puis le vertical</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 2: Comment placer un point -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📍 Comment placer un point ?
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Méthode en 3 étapes</h4>
        <ol class="space-y-3 list-decimal list-inside">
          <li class="leading-relaxed">
            <span class="font-semibold">Partir de l'origine O</span>
          </li>
          <li class="leading-relaxed">
            <span class="font-semibold">Se déplacer horizontalement</span> de x unités (à droite si x positif)
          </li>
          <li class="leading-relaxed">
            <span class="font-semibold">Se déplacer verticalement</span> de y unités (vers le haut si y positif)
          </li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple : Placer le point D(4;3)</h4>
        <div class="p-4 bg-green-50 dark:bg-green-950/30 rounded">
          <p>1️⃣ Partir de O (origine)</p>
          <p>2️⃣ Aller 4 carreaux à droite ➡️</p>
          <p>3️⃣ Monter de 3 carreaux ⬆️</p>
          <p class="mt-2 font-semibold text-green-600">✅ Placer le point D</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Distance entre deux points -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      📏 Distance entre deux points
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Sur une ligne horizontale ou verticale</h4>
        <p class="mb-3">Si deux points sont sur la même ligne :</p>
        <div class="space-y-2">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Même ordonnée (ligne horizontale)</p>
            <p class="font-mono text-sm">Distance = |x₂ - x₁|</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold mb-1">Même abscisse (ligne verticale)</p>
            <p class="font-mono text-sm">Distance = |y₂ - y₁|</p>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">💡 Exemple</h4>
        <p class="mb-2">Points A(2;3) et B(6;3) - même ordonnée</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded font-mono">
          <p>Distance = |6 - 2| = <span class="font-bold text-orange-600">4 unités</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Applications pratiques -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      🌍 Applications pratiques
    </h3>
    
    <div class="grid md:grid-cols-2 gap-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">🗺️ Cartes et plans</h4>
        <p class="text-sm">Localiser des villes, des bâtiments sur un plan</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">🎮 Jeux vidéo</h4>
        <p class="text-sm">Position des personnages dans l'espace</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">🛰️ GPS</h4>
        <p class="text-sm">Latitude et longitude pour se repérer</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-primary mb-2">⚓ Bataille navale</h4>
        <p class="text-sm">Coordonnées pour viser les bateaux</p>
      </div>
    </div>
  </section>

  <!-- Section 5: Symétries et repères -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      🔄 Points symétriques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Symétrie par rapport à un axe</h4>
        <div class="space-y-2">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Par rapport à l'axe x (horizontal)</p>
            <p class="font-mono text-sm">A(x;y) → A'(x;-y)</p>
          </div>
          <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
            <p class="font-semibold mb-1">Par rapport à l'axe y (vertical)</p>
            <p class="font-mono text-sm">A(x;y) → A'(-x;y)</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Ordre (x;y) :</span> toujours horizontal d'abord, vertical ensuite</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Repère tes axes :</span> marque bien x et y sur ton quadrillage</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Compte bien :</span> vérifie tes déplacements case par case</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Lire des coordonnées (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Le point A est à 3 carreaux à droite et 2 carreaux en haut de l'origine. Quelles sont ses coordonnées ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>x = 3 (horizontal)</p>
        <p>y = 2 (vertical)</p>
        <p>Coordonnées : <span class="font-bold text-blue-600">A(3;2)</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Placer un point (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Place le point B(5;3) sur le quadrillage.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>1. Partir de l'origine O</p>
        <p>2. Aller 5 carreaux à droite</p>
        <p>3. Monter de 3 carreaux</p>
        <p class="font-bold text-green-600">✅ Marquer le point B</p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Distance (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Points C(2;4) et D(2;7). Quelle est la distance CD ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Même abscisse (x=2) donc ligne verticale</p>
        <p>Distance = |7 - 4|</p>
        <p>= <span class="font-bold text-orange-600">3 unités</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Rectangle (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Trois sommets d'un rectangle sont A(1;2), B(5;2) et C(5;5). Trouve les coordonnées de D.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>D doit avoir x de A et y de C</p>
        <p>x = 1 (comme A)</p>
        <p>y = 5 (comme C)</p>
        <p><span class="font-bold text-purple-600">D(1;5)</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Symétrie (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Le point E(4;3) est symétrique au point F par rapport à l'axe y. Trouve les coordonnées de F.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Symétrie par rapport à axe y : x change de signe</p>
        <p>E(4;3) → F(-4;3)</p>
        <p><span class="font-bold text-pink-600">F(-4;3)</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "transformations": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Reconnaître et identifier les transformations géométriques
• Effectuer des symétries, translations et rotations
• Comprendre les propriétés conservées par chaque transformation
• Résoudre des problèmes de transformations`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Comment créer un motif répétitif sur un tissu ?</span> 
    Ou produire l'effet miroir d'une image ? 
    <span class="italic">Les transformations géométriques sont la réponse !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les transformations permettent de <span class="font-semibold text-accent">déplacer, retourner ou faire pivoter</span> 
    des figures dans l'espace. Elles sont utilisées en architecture, en art, en design, 
    et même dans les animations informatiques.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Une transformation change la position 
    d'une figure mais garde sa forme et sa taille !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: La symétrie axiale -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🪞 La symétrie axiale
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-3">
          La symétrie axiale est une <span class="font-semibold">transformation qui crée une image miroir</span> 
          par rapport à une droite appelée <span class="font-semibold">axe de symétrie</span>.
        </p>
        <div class="flex justify-center my-4">
          <div class="relative w-64 h-32 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 flex items-center justify-center">
            <div class="absolute left-8 w-16 h-16 bg-blue-400 rounded-lg"></div>
            <div class="absolute w-0.5 h-full bg-red-500 left-1/2"></div>
            <div class="absolute right-8 w-16 h-16 bg-blue-400 rounded-lg"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>La figure et son image sont <span class="font-semibold">symétriques par rapport à l'axe</span></li>
          <li>Chaque point et son image sont <span class="font-semibold">équidistants de l'axe</span></li>
          <li>L'axe est la <span class="font-semibold">médiatrice</span> du segment joignant un point à son image</li>
          <li>Les <span class="font-semibold">longueurs et angles sont conservés</span></li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔨 Construction</h4>
        <ol class="space-y-2 list-decimal list-inside">
          <li>Trace des perpendiculaires à l'axe depuis chaque sommet</li>
          <li>Prolonge de l'autre côté à la même distance</li>
          <li>Relie les nouveaux points</li>
        </ol>
      </div>
    </div>
  </section>

  <!-- Section 2: La translation -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      ➡️ La translation
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-3">
          La translation est un <span class="font-semibold">glissement</span> de la figure 
          dans une direction et une distance données, sans rotation.
        </p>
        <div class="flex justify-center my-4 gap-8">
          <div class="w-16 h-16 bg-green-400 rounded-lg"></div>
          <div class="flex items-center">
            <span class="text-2xl">→</span>
          </div>
          <div class="w-16 h-16 bg-green-400 rounded-lg opacity-70"></div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>Tous les points se déplacent de <span class="font-semibold">la même distance dans la même direction</span></li>
          <li>La figure et son image sont <span class="font-semibold">parallèles</span></li>
          <li>Les longueurs, angles et parallélisme sont <span class="font-semibold">conservés</span></li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔨 Construction</h4>
        <p class="mb-2">On utilise un vecteur de translation :</p>
        <ol class="space-y-2 list-decimal list-inside">
          <li>Choisis la direction et la distance (le vecteur)</li>
          <li>Déplace chaque sommet selon ce vecteur</li>
          <li>Relie les nouveaux points</li>
        </ol>
      </div>
    </div>
  </section>

  <!-- Section 3: La rotation -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      🔄 La rotation
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-3">
          La rotation est une <span class="font-semibold">transformation qui fait tourner</span> la figure 
          autour d'un point fixe (le centre) d'un certain angle.
        </p>
        <div class="flex justify-center my-4">
          <div class="relative w-48 h-48">
            <div class="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 z-10"></div>
            <div class="absolute top-8 left-1/2 w-12 h-12 bg-orange-400 rounded -translate-x-1/2"></div>
            <div class="absolute top-1/2 right-8 w-12 h-12 bg-orange-400 rounded opacity-70 -translate-y-1/2"></div>
          </div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>Tous les points tournent du <span class="font-semibold">même angle</span> autour du centre</li>
          <li>Les <span class="font-semibold">distances au centre sont conservées</span></li>
          <li>Les longueurs et angles sont <span class="font-semibold">conservés</span></li>
          <li>Rotations courantes : 90°, 180°, 270°</li>
        </ul>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔨 Rotation de 90° (quart de tour)</h4>
        <div class="grid md:grid-cols-2 gap-3">
          <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
            <p class="font-semibold mb-1">Sens horaire ↻</p>
            <p class="text-sm">Comme les aiguilles d'une montre</p>
          </div>
          <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
            <p class="font-semibold mb-1">Sens anti-horaire ↺</p>
            <p class="text-sm">Inverse des aiguilles</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: L'agrandissement/réduction -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      🔍 Agrandissement et réduction
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Définition</h4>
        <p class="leading-relaxed mb-3">
          Transformation qui multiplie toutes les longueurs par un <span class="font-semibold">coefficient k</span>.
        </p>
        <div class="flex justify-center my-4 gap-8 items-center">
          <div class="w-12 h-12 bg-pink-400 rounded"></div>
          <span class="text-2xl">→</span>
          <div class="w-24 h-24 bg-pink-400 rounded opacity-70"></div>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">✨ Propriétés</h4>
        <ul class="space-y-2 list-disc list-inside">
          <li>Si k &gt; 1 : <span class="font-semibold">agrandissement</span></li>
          <li>Si k &lt; 1 : <span class="font-semibold">réduction</span></li>
          <li>Les <span class="font-semibold">angles sont conservés</span></li>
          <li>Les <span class="font-semibold">longueurs sont multipliées par k</span></li>
          <li>L'<span class="font-semibold">aire est multipliée par k²</span></li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Section 5: Comparaison -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      📊 Tableau récapitulatif
    </h3>
    
    <div class="overflow-x-auto">
      <table class="w-full text-sm bg-white/80 dark:bg-gray-900/50 rounded-lg">
        <thead class="bg-cyan-100 dark:bg-cyan-950/40">
          <tr>
            <th class="p-3 text-left">Transformation</th>
            <th class="p-3 text-left">Conserve longueurs</th>
            <th class="p-3 text-left">Conserve angles</th>
            <th class="p-3 text-left">Conserve aire</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr><td class="p-3 font-semibold">Symétrie</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td></tr>
          <tr><td class="p-3 font-semibold">Translation</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td></tr>
          <tr><td class="p-3 font-semibold">Rotation</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td><td class="p-3">✅ Oui</td></tr>
          <tr><td class="p-3 font-semibold">Agrandissement</td><td class="p-3">❌ Non</td><td class="p-3">✅ Oui</td><td class="p-3">❌ Non</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Symétrie :</span> utilise du papier calque pour vérifier</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Translation :</span> tous les points font le même déplacement</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Rotation :</span> le centre ne bouge jamais</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Symétrie simple (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Le point A(3;2) a pour symétrique A' par rapport à l'axe y. Trouve les coordonnées de A'.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Symétrie/axe y : x change de signe, y reste</p>
        <p>A(3;2) → <span class="font-bold text-blue-600">A'(-3;2)</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Translation (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Translate le point B(2;3) de 4 unités à droite et 2 unités vers le haut.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>x : 2 + 4 = 6</p>
        <p>y : 3 + 2 = 5</p>
        <p><span class="font-bold text-green-600">B'(6;5)</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Rotation 90° (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Un carré ABCD de côté 4 cm subit une rotation de 90° sens horaire autour de A. Où se trouve B' ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>B était à droite de A (4 cm)</p>
        <p>Après rotation 90° horaire : B' est en bas de A</p>
        <p><span class="font-bold text-orange-600">Distance AB' = 4 cm (conservée)</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Agrandissement (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Un triangle a une aire de 12 cm². On l'agrandit avec k=3. Quelle est la nouvelle aire ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>L'aire est multipliée par k²</p>
        <p>Nouvelle aire = 12 × 3²</p>
        <p>= 12 × 9 = <span class="font-bold text-purple-600">108 cm²</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Composition (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Le point M(4;1) subit une symétrie/axe x puis une translation de (-2;3). Coordonnées finales ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>1. Symétrie/axe x : M(4;1) → M'(4;-1)</p>
        <p>2. Translation (-2;3) : (4-2 ; -1+3)</p>
        <p>= <span class="font-bold text-pink-600">M''(2;2)</span></p>
      </div>
    </div>
  </div>

</div>`
  },

  "statistiques": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Collecter et organiser des données statistiques
• Calculer la moyenne, la médiane et le mode
• Interpréter et créer des graphiques (diagrammes en bâtons, circulaires)
• Résoudre des problèmes statistiques simples`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Combien d'élèves préfèrent le football au basketball ?</span> 
    Quelle est la taille moyenne des élèves de ta classe ? 
    <span class="italic">Les statistiques nous aident à répondre à ces questions !</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les statistiques permettent de <span class="font-semibold text-accent">collecter, organiser et analyser des données</span> 
    pour en tirer des informations utiles. Elles sont partout : dans les sondages, 
    les études scientifiques, le sport, et même dans les réseaux sociaux.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Conseil :</span> Les statistiques transforment 
    des listes de nombres en informations compréhensibles et utiles !</p>
  </div>
</div>`,

    contenu: `<div class="space-y-8">
  
  <!-- Section 1: Vocabulaire de base -->
  <section class="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      🎯 Vocabulaire statistique
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Population et échantillon</h4>
        <p class="leading-relaxed mb-2">
          <span class="font-semibold">Population :</span> l'ensemble de tous les individus étudiés
        </p>
        <p class="leading-relaxed">
          <span class="font-semibold">Échantillon :</span> une partie de la population
        </p>
        <p class="text-sm text-muted-foreground italic mt-2">
          Ex : Tous les élèves d'Haïti (population) vs les élèves de ta classe (échantillon)
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Caractère et modalités</h4>
        <p class="leading-relaxed mb-2">
          <span class="font-semibold">Caractère :</span> ce qu'on étudie (âge, taille, sport préféré...)
        </p>
        <p class="leading-relaxed mb-2">
          <span class="font-semibold">Modalités :</span> les différentes valeurs possibles
        </p>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold">Exemple :</p>
          <p class="text-sm">Caractère : Sport préféré</p>
          <p class="text-sm">Modalités : Football, Basketball, Volleyball, Tennis</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Effectif et fréquence</h4>
        <p class="leading-relaxed mb-2">
          <span class="font-semibold">Effectif :</span> nombre de fois qu'une modalité apparaît
        </p>
        <p class="leading-relaxed">
          <span class="font-semibold">Fréquence :</span> effectif ÷ effectif total (en %)
        </p>
      </div>
    </div>
  </section>

  <!-- Section 2: Tableau statistique -->
  <section class="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-green-700 dark:text-green-300">
      📊 Tableau statistique
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">Exemple : Sports préférés dans une classe</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-sm mt-2 border-collapse">
            <thead class="bg-green-100 dark:bg-green-950/40">
              <tr>
                <th class="p-2 border border-green-300 dark:border-green-700">Sport</th>
                <th class="p-2 border border-green-300 dark:border-green-700">Effectif</th>
                <th class="p-2 border border-green-300 dark:border-green-700">Fréquence (%)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="p-2 border">Football</td><td class="p-2 border text-center">12</td><td class="p-2 border text-center">40%</td></tr>
              <tr><td class="p-2 border">Basketball</td><td class="p-2 border text-center">8</td><td class="p-2 border text-center">27%</td></tr>
              <tr><td class="p-2 border">Volleyball</td><td class="p-2 border text-center">7</td><td class="p-2 border text-center">23%</td></tr>
              <tr><td class="p-2 border">Tennis</td><td class="p-2 border text-center">3</td><td class="p-2 border text-center">10%</td></tr>
              <tr class="font-bold bg-green-50 dark:bg-green-950/20"><td class="p-2 border">Total</td><td class="p-2 border text-center">30</td><td class="p-2 border text-center">100%</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 3: Moyenne, médiane, mode -->
  <section class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      🔢 Indicateurs statistiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 La moyenne</h4>
        <p class="mb-2">Somme de toutes les valeurs ÷ nombre de valeurs</p>
        <div class="p-4 bg-orange-100 dark:bg-orange-950/40 rounded-lg text-center">
          <p class="text-xl font-bold text-orange-700 dark:text-orange-300 font-mono">Moyenne = Σ valeurs ÷ n</p>
        </div>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold mb-1">Exemple :</p>
          <p class="text-sm">Notes : 12, 15, 10, 14, 9</p>
          <p class="text-sm">Moyenne = (12+15+10+14+9) ÷ 5 = 60 ÷ 5 = <span class="font-bold">12</span></p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 La médiane</h4>
        <p class="mb-2">Valeur du milieu quand les données sont rangées dans l'ordre</p>
        <div class="mt-3 p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-semibold mb-1">Exemple :</p>
          <p class="text-sm">Tailles : 150, 155, 160, 165, 170 cm</p>
          <p class="text-sm">Médiane = <span class="font-bold">160 cm</span> (valeur du milieu)</p>
        </div>
        <p class="text-sm text-muted-foreground italic mt-2">
          Si nombre pair de valeurs : moyenne des deux du milieu
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Le mode</h4>
        <p class="mb-2">Valeur la plus fréquente (qui apparaît le plus souvent)</p>
        <div class="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
          <p class="font-semibold mb-1">Exemple :</p>
          <p class="text-sm">Notes : 12, 15, 12, 10, 12, 14</p>
          <p class="text-sm">Mode = <span class="font-bold">12</span> (apparaît 3 fois)</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 4: Graphiques -->
  <section class="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-xl border border-pink-200 dark:border-pink-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      📈 Représentations graphiques
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Diagramme en bâtons</h4>
        <p class="mb-3">Chaque bâton représente un effectif</p>
        <div class="h-32 bg-gradient-to-t from-pink-100 to-transparent dark:from-pink-900/20 rounded flex items-end justify-around gap-2 p-4">
          <div class="w-12 bg-blue-400 rounded-t" style="height: 80%"></div>
          <div class="w-12 bg-green-400 rounded-t" style="height: 60%"></div>
          <div class="w-12 bg-orange-400 rounded-t" style="height: 50%"></div>
          <div class="w-12 bg-purple-400 rounded-t" style="height: 30%"></div>
        </div>
        <p class="text-sm text-muted-foreground mt-2">Idéal pour comparer des catégories</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">🥧 Diagramme circulaire (camembert)</h4>
        <p class="mb-3">Chaque part représente une proportion du total</p>
        <div class="flex justify-center my-4">
          <div class="w-32 h-32 rounded-full" style="background: conic-gradient(#60a5fa 0% 40%, #34d399 40% 67%, #fb923c 67% 90%, #c084fc 90% 100%)"></div>
        </div>
        <p class="text-sm text-muted-foreground">Idéal pour montrer des pourcentages</p>
      </div>
    </div>
  </section>

  <!-- Section 5: Étendue -->
  <section class="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-6 rounded-xl border border-cyan-200 dark:border-cyan-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
      📏 L'étendue
    </h3>
    
    <div class="space-y-4">
      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">📊 Définition</h4>
        <p class="mb-3">Différence entre la plus grande et la plus petite valeur</p>
        <div class="p-4 bg-cyan-100 dark:bg-cyan-950/40 rounded-lg text-center">
          <p class="text-xl font-bold text-cyan-700 dark:text-cyan-300 font-mono">Étendue = Max - Min</p>
        </div>
        <div class="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-semibold mb-1">Exemple :</p>
          <p class="text-sm">Températures : 18°C, 22°C, 25°C, 20°C, 15°C</p>
          <p class="text-sm">Étendue = 25 - 15 = <span class="font-bold">10°C</span></p>
        </div>
      </div>
    </div>
  </section>

  <!-- Section 6: Astuces -->
  <section class="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 p-6 rounded-xl border border-yellow-200 dark:border-yellow-800">
    <h3 class="text-2xl font-bold mb-4 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
      💡 Astuces et Conseils
    </h3>
    
    <div class="space-y-3">
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Tableau d'abord :</span> organise toujours les données dans un tableau</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Médiane :</span> n'oublie pas de ranger les valeurs dans l'ordre</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Graphique :</span> choisis celui qui représente le mieux tes données</p>
      </div>
    </div>
  </section>

</div>`,

    exemplesExercices: `<div class="space-y-6">
  
  <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 p-5 rounded-xl border-l-4 border-blue-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
      ✏️ Exercice 1 — Moyenne (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Calcule la moyenne des notes : 14, 12, 16, 10, 13</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-blue-700 dark:text-blue-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Somme = 14 + 12 + 16 + 10 + 13 = 65</p>
        <p>Moyenne = 65 ÷ 5</p>
        <p>= <span class="font-bold text-blue-600">13</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/30 p-5 rounded-xl border-l-4 border-green-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-green-700 dark:text-green-300">
      ✏️ Exercice 2 — Médiane (Facile)
    </h4>
    <p class="mb-3 leading-relaxed">Trouve la médiane de : 8, 12, 5, 15, 10</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-green-700 dark:text-green-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>1. Ranger : 5, 8, 10, 12, 15</p>
        <p>2. Valeur du milieu</p>
        <p>Médiane = <span class="font-bold text-green-600">10</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 p-5 rounded-xl border-l-4 border-orange-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-300">
      ✏️ Exercice 3 — Mode (Moyen)
    </h4>
    <p class="mb-3 leading-relaxed">Trouve le mode de : 7, 9, 7, 8, 10, 7, 9</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-orange-700 dark:text-orange-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>7 apparaît 3 fois</p>
        <p>9 apparaît 2 fois</p>
        <p>8 et 10 apparaissent 1 fois</p>
        <p>Mode = <span class="font-bold text-orange-600">7</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 p-5 rounded-xl border-l-4 border-purple-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
      ✏️ Exercice 4 — Étendue (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Les températures de la semaine sont : 18°, 22°, 25°, 20°, 19°, 23°, 21°. Calcule l'étendue.</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-purple-700 dark:text-purple-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Max = 25°C</p>
        <p>Min = 18°C</p>
        <p>Étendue = 25 - 18 = <span class="font-bold text-purple-600">7°C</span></p>
      </div>
    </div>
  </div>

  <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/30 p-5 rounded-xl border-l-4 border-pink-500">
    <h4 class="font-bold text-lg mb-3 flex items-center gap-2 text-pink-700 dark:text-pink-300">
      ✏️ Exercice 5 — Fréquence (Difficile)
    </h4>
    <p class="mb-3 leading-relaxed">Dans une classe de 30 élèves, 12 aiment le football. Quelle est la fréquence en % ?</p>
    <div class="mt-4 bg-white/70 dark:bg-gray-900/50 p-4 rounded-lg">
      <p class="font-semibold text-pink-700 dark:text-pink-300 mb-2">📝 Solution :</p>
      <div class="space-y-2 text-sm">
        <p>Fréquence = (effectif ÷ total) × 100</p>
        <p>= (12 ÷ 30) × 100</p>
        <p>= 0,4 × 100 = <span class="font-bold text-pink-600">40%</span></p>
      </div>
    </div>
  </div>

</div>`
  }
};

// Export for backward compatibility and easy access
export const mathLessons = mathLessons7AF;
