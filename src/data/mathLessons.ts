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
  }
};

// Export for backward compatibility and easy access
export const mathLessons = mathLessons7AF;
