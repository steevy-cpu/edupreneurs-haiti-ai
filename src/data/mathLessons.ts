export interface StaticLessonContent {
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
}

// 7th Grade Math Lessons (AF7)
export const mathLessons7AF: Record<string, StaticLessonContent> = {
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
  }
};

// Export for backward compatibility and easy access
export const mathLessons = mathLessons7AF;
