export interface StaticLessonContent {
  objectif: string;
  introduction: string;
  contenu: string;
}

export const mathLessons: Record<string, StaticLessonContent> = {
  "decimaux": {
    objectif: `À la fin de cette leçon, tu vas pouvoir:
• Lire et écrire des nombres décimaux sous différentes formes
• Comparer et ordonner des nombres décimaux
• Effectuer les quatre opérations sur les nombres décimaux
• Résoudre des problèmes de la vie courante utilisant les décimaux`,

    introduction: `<div class="space-y-4">
  <p class="text-lg leading-relaxed">
    <span class="font-semibold text-primary">Kouman ou fè pou divize yon gateau an plizyè moso egal?</span> 
    Oswa kouman ou konnen si 25.50 goud se plis pase 25.05 goud? 
    <span class="italic">C'est là que les nombres décimaux entrent en jeu!</span>
  </p>
  
  <p class="text-lg leading-relaxed">
    Les nombres décimaux nou itilize chak jou - nan lajan, nan mezi, nan kalkilasyon. 
    Yo pèmèt nou reprezante <span class="font-semibold text-accent">fraksyon ak presizyon</span>, 
    tankou lè nou achte 2.5 liv diri oswa lè nou mezire 1.75 mèt twal.
  </p>

  <div class="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border-l-4 border-primary">
    <p class="font-medium">💡 <span class="text-primary">Konsèy:</span> Yon nonm desimal se tankou yon fraz - 
    pati avan vigil la se "mo antye", epi pati apre vigil la se "detay"!</p>
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
          Un nombre décimal se tankou yon fraz ak de pati: 
          <span class="font-mono text-lg px-2 py-1 bg-accent/20 rounded">25,75</span> gen 
          <span class="font-semibold text-primary">25</span> (pati antye) ak 
          <span class="font-semibold text-accent">75</span> (pati desimal).
        </p>
        <p class="mt-2 text-sm text-muted-foreground italic">
          Exemple: 3,14 • 0,5 • 12,008 • 100,25
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Fraction décimale</h4>
        <p class="leading-relaxed">
          Se yon fraksyon ki gen 10, 100, 1000, ... kòm denominatè.
        </p>
        <p class="mt-2 font-mono text-lg">
          7/10 = 0,7  •  25/100 = 0,25  •  8/1000 = 0,008
        </p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">📌 Écriture décimale et fractionnaire</h4>
        <p class="leading-relaxed">
          Chak nonm desimal ka ekri kòm fraksyon, e chak fraksyon desimal ka ekri kòm nonm desimal.
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
          <li class="leading-relaxed"><span class="font-semibold">Konpare pati antye a</span> - Si yo diferan, pi gwo pati antye a gen pi gwo valè</li>
          <li class="leading-relaxed"><span class="font-semibold">Si pati antye yo egal</span> - Konpare premye chif apre vigil la</li>
          <li class="leading-relaxed"><span class="font-semibold">Si yo toujou egal</span> - Kontinye konpare chif apre chif</li>
        </ol>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary">💡 Exemple pratique</h4>
        <p class="leading-relaxed mb-3">Konpare 25,75 ak 25,8</p>
        <div class="space-y-2 text-sm">
          <p>✓ Pati antye: 25 = 25 (yo egal)</p>
          <p>✓ Premye desimal: 7 &lt; 8</p>
          <p class="font-bold text-accent mt-3">Rezilta: 25,75 &lt; 25,8</p>
        </div>
      </div>

      <div class="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-300 dark:border-amber-700">
        <p class="font-semibold text-amber-800 dark:text-amber-200">⚠️ Atansyon:</p>
        <p class="mt-1 text-amber-700 dark:text-amber-300">0,8 &gt; 0,75 paske 8 dizyèm (80/100) pi gran pase 75 santyèm!</p>
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
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règ:</span> Aliyen vigil yo youn sou lòt, epi fè adisyon oswa soustraksyon nòmalman.</p>
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
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règ:</span> Fè miltiplikasyon san okipe vigil, epi konte total desimal yo.</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono mb-2">2,5 × 3,2</p>
          <p class="text-sm">→ 25 × 32 = 800</p>
          <p class="text-sm">→ 2 desimal (1+1) → <span class="font-bold text-accent">8,00 = 8</span></p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-3 text-primary flex items-center gap-2">
          ➗ Division
        </h4>
        <p class="mb-3 leading-relaxed"><span class="font-semibold">Règ:</span> Dekalke vigil la nan dividand la, kontinye divize.</p>
        <div class="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded">
          <p class="font-mono">12,6 ÷ 3 = 4,2</p>
          <p class="text-sm mt-2">Paske 12,6 = 126/10, ak 126 ÷ 3 = 42, kidonk 12,6 ÷ 3 = 42/10 = 4,2</p>
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
        <p class="leading-relaxed mb-2">Ou ka ajoute oswa retire zewo nan fen pati desimal la san chanje valè a:</p>
        <p class="font-mono text-lg">3,5 = 3,50 = 3,500 = 3,5000</p>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">🔄 Multiplication par 10, 100, 1000</h4>
        <p class="leading-relaxed mb-2">Dekalke vigil la dwat pou chak zewo:</p>
        <div class="space-y-1 font-mono text-sm">
          <p>3,45 × 10 = 34,5</p>
          <p>3,45 × 100 = 345</p>
          <p>3,45 × 1000 = 3450</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg">
        <h4 class="font-bold text-lg mb-2 text-primary">↩️ Division par 10, 100, 1000</h4>
        <p class="leading-relaxed mb-2">Dekalke vigil la goch pou chak zewo:</p>
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
        <p class="mb-2">Mari achte 2,5 kg bannann a 45 goud/kg. Konbyen li peye?</p>
        <div class="p-3 bg-green-50 dark:bg-green-950/30 rounded">
          <p class="font-mono">2,5 × 45 = 112,5 goud</p>
          <p class="text-sm mt-1 text-muted-foreground">Mari peye 112 goud 50 kòb</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-blue-500">
        <h4 class="font-bold text-lg mb-2 text-primary">📏 Mesure de tissu</h4>
        <p class="mb-2">Yon twalyè gen 15,75m twal. Li vann 8,5m. Konbyen ki reste?</p>
        <div class="p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
          <p class="font-mono">15,75 - 8,5 = 7,25 m</p>
          <p class="text-sm mt-1 text-muted-foreground">Li gen 7,25 mèt ki rete</p>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
        <h4 class="font-bold text-lg mb-2 text-primary">💰 Partage d'argent</h4>
        <p class="mb-2">3 zanmi pataje 250,50 goud egalman. Chak moun jwenn konbyen?</p>
        <div class="p-3 bg-purple-50 dark:bg-purple-950/30 rounded">
          <p class="font-mono">250,50 ÷ 3 = 83,50 goud</p>
          <p class="text-sm mt-1 text-muted-foreground">Chak zanmi jwenn 83 goud 50 kòb</p>
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
        <p><span class="font-semibold">Toujou aliyen vigil yo</span> lè w ap fè adisyon oswa soustraksyon</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Konte desimal yo byen</span> apre miltiplikasyon oswa divizyon</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Verifye rezilta w</span> lè w itilize yon estimasyon (arounding)</p>
      </div>
      
      <div class="bg-white/80 dark:bg-gray-900/50 p-3 rounded-lg flex gap-3">
        <span class="text-2xl">✅</span>
        <p><span class="font-semibold">Pratike chak jou</span> ak egzanp nan lavi reyèl pou w byen konprann</p>
      </div>
    </div>
  </section>

</div>`
  }
};
