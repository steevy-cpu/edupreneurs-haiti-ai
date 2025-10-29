export interface CreoleLesson {
  id: number;
  mois: string;
  title: string;
  description: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
  duration: string;
  difficulty: string;
  category: string;
}

export const creoleLessons7AF: CreoleLesson[] = [
  {
    id: 1,
    mois: "Septanm",
    title: "Konpreyansyon tèks li",
    description: "Dekouvri epi konprann diferan tèks yo",
    objectif: "Konprann epi analyze diferan kalite tèks nan kreyòl",
    introduction: `
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-lg border-l-4 border-blue-500">
        <h3 class="text-xl font-bold text-blue-700 dark:text-blue-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Nan leson sa a, n ap aprann kijan pou nou konprann epi analyse diferan kalite tèks nan lang kreyòl ayisyen. 
          Se yon konpetans ki esansyèl pou ka li ak konprann dokiman yo, istwa yo, atik jou epi tout tip tèks nou rankontre nan vi chak jou.
        </p>
      </div>
      
      <div class="mt-6 bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Poukisa sa enpòtan?</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Konpreyansyon tèks se yon zouti ki pèmèt nou:
        </p>
        <ul class="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
          <li>Jwenn enfòmasyon nou bezwen</li>
          <li>Aprann bagay nouvo</li>
          <li>Devlope panse kritik nou</li>
          <li>Patisipe nan sosyete a</li>
        </ul>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📚 Diferan Kalite Tèks</h2>
      
      <div class="space-y-6">
        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">1. Tèks Naratif (Ti Istwa)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            <strong>Sa ki yon tèks naratif?</strong> Se yon istwa kote yo rakonte sa ki pase. Li gen pèsonaj, aksyon, ak yon sekans evènman.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="italic text-gray-600 dark:text-gray-400">
              "Yon jou, Ti Jak t ap mache nan mòn. Li te wè yon gwo pye mango ki te plen bèl fwi. Li monte sou pye bwa a pou li keyi kèk mango..."
            </p>
          </div>
          <p class="mt-3 text-gray-700 dark:text-gray-300">
            <strong>Eleman yo:</strong> Pèsonaj (Ti Jak), Kote (nan mòn), Aksyon (monte sou pye bwa), Tan (yon jou)
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">2. Tèks Deskriptif (Bay Deskripsyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            <strong>Sa ki yon tèks deskriptif?</strong> Se yon tèks ki dekri yon bagay, yon moun, oswa yon kote. Li bay detay pou w ka imajine bagay la.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="italic text-gray-600 dark:text-gray-400">
              "Mòn yo te vet, yo te gen anpil pye bwa. Syèl la te ble ak nwaj blan. Rivyè a t ap koule dousman, dlo li klè kou glas..."
            </p>
          </div>
          <p class="mt-3 text-gray-700 dark:text-gray-300">
            <strong>Eleman yo:</strong> Koulè, Fòm, Gwosè, Santiman
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">3. Tèks Enfòmatif (Bay Enfòmasyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            <strong>Sa ki yon tèks enfòmatif?</strong> Se yon tèks ki eksplike, ki bay konesans oswa enfòmasyon sou yon sijè.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="italic text-gray-600 dark:text-gray-400">
              "Ayiti se premye peyi nan mond lan kote esklav yo te libere tèt yo. Endepandans la te fèt 1 janvye 1804..."
            </p>
          </div>
          <p class="mt-3 text-gray-700 dark:text-gray-300">
            <strong>Eleman yo:</strong> Fè, Enfòmasyon, Dat, Enpòtans
          </p>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">4. Tèks Argimantatif (Defann Opinyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            <strong>Sa ki yon tèks argimantatif?</strong> Se yon tèks kote w ap eseye konvenk lòt moun yon bagay, bay rezon pou sa w di a.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="italic text-gray-600 dark:text-gray-400">
              "Nou dwe pwoteje anviwònman an paske se pa nou sèl ki viv sou tè a. Si nou pa pwoteje li, jenerasyon k ap vini yo p ap jwenn yon bèl peyi..."
            </p>
          </div>
          <p class="mt-3 text-gray-700 dark:text-gray-300">
            <strong>Eleman yo:</strong> Tèz (opinyon), Agiman (rezon), Egzanp
          </p>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border border-indigo-300 dark:border-indigo-700">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">🔑 Estrateji pou Konprann Tèks</h3>
        <ol class="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
          <li><strong>Li tit la epi gade imaj yo:</strong> Sa bay nou yon lide sou sa tèks la ap pale</li>
          <li><strong>Li premye ak dènye paragraf yo:</strong> Souvan se la enfòmasyon prensipal yo ye</li>
          <li><strong>Chèche mo kle yo:</strong> Mo sa yo ede w konprann sijè a</li>
          <li><strong>Poze kesyon:</strong> Ki moun? Ki sa? Ki kote? Ki lè? Poukisa? Kijan?</li>
          <li><strong>Rezime nan tèt ou:</strong> Eseye di sa w konprann an nan mo pa w</li>
        </ol>
      </div>

      <div class="mt-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 p-5 rounded-lg">
        <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">💭 Reflechi</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Chak fwa w ap li yon tèks, mande tèt ou: "Ki kalite tèks sa ye? Ki enfòmasyon enpòtan ki genyen ladan l? 
          Èske mwen dakò ak sa otè a di a?" Sa ap ede w vin yon bon lektè!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1: Idantifye Kalite Tèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Li tèks sa yo epi di ki kalite yo ye:</p>
          
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="font-semibold mb-2">Tèks A:</p>
              <p class="italic">"Mango se yon fwi ki gen anpil vitamin. Li bon pou sante. Ou ka manje l mi oswa ou ka fè ji avèk li."</p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Repons: _______________</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="font-semibold mb-2">Tèks B:</p>
              <p class="italic">"Mari te rive lakay li. Li te fatige. Li chita epi li pran yon dlo glase."</p>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Repons: _______________</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2: Repond Kesyon sou Tèks</h3>
          <div class="bg-white dark:bg-gray-800 p-4 rounded mb-4">
            <p class="mb-3">
              "Ayisyen yo renmen jwenn ansanm pou yo danse konpa. Konpa se mizik tradisyonèl Ayiti. 
              Li gen ritm ki fè tout moun vle danse. Anpil mizisyen ayisyen fè bon konpa ki fè tout mond kontan."
            </p>
          </div>
          
          <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Ki sa tèks la pale? ______________</li>
            <li>Ki sa ki konpa? ______________</li>
            <li>Poukisa moun renmen konpa? ______________</li>
          </ol>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3: Ekri yon Ti Rezime</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Li tèks sa a epi ekri yon rezime nan 2-3 fraz:
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded mb-4">
            <p>
              "Nan peyi Dayiti, nou gen anpil bèl plaj. Plaj Labadi, Plaj Kokoye, Plaj Raymond Les Bains se kèk nan yo. 
              Moun vini sou plaj yo pou yo benyen, pou yo jwe epi pou yo relaxe. Dlo lanmè a klè e sab la blan."
            </p>
          </div>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 min-h-[100px]" placeholder="Ekri rezime ou la isit..."></textarea>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">📖 Konsèy pou Reyisi</h3>
          <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Li tèks la twa fwa: premye fwa pou konprann, dezyèm fwa pou analize, twazyèm fwa pou revize</li>
            <li>Souliye mo ou pa konprann epi chèche siyifikasyon yo</li>
            <li>Make pati enpòtan yo</li>
            <li>Diskite tèks la ak yon zanmi oswa yon manm fanmi</li>
          </ul>
        </div>
      </div>
    `,
    duration: "60 minit",
    difficulty: "Debutant",
    category: "Lekti"
  },
  {
    id: 2,
    mois: "Septanm",
    title: "Egzekisyon konsiy senp",
    description: "Swiv epi egzekite konsiy senp ou tande",
    objectif: "Aprann swiv enstriksyon senp yo pou devlope kapasite kouté ak konprann",
    introduction: `<p>Nan leson sa a, n ap aprann kijan pou nou koute ak swiv konsiy.</p>`,
    contenu: `<h2>Enpòtans kouté</h2><p>Kouté byen enpòtan pou reyisi.</p>
Pratik kouté epi rezime mesaj oral.`,
    exemplesExercices: `<p>Egzèsis pratik</p>`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Kominikasyon Oral"
  },
  {
    id: 3,
    mois: "Oktòb",
    title: "Fraz la (rapèl)",
    description: "Idantifye fraz yo nan yon tèks",
    objectif: "Rekonèt epi konprann estrikti fraz yo nan kreyòl",
    introduction: `<p>Fraz la se inite debaz kominikasyon nan tout lang.</p>`,
    contenu: `<h2>Sa ki yon fraz?</h2><p>Yon fraz se yon antite ki gen sans konplè.</p>`,
    exemplesExercices: `<p>Pratik: Idantifye fraz nan tèks.</p>`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Gramè"
  },
  {
    id: 4,
    mois: "Oktòb",
    title: "Akizisyon mo nouvo",
    description: "Aprann mo nouvo apati sitiyasyon done oswa lòt disiplin",
    objectif: "Elaji vokabilè ou avèk mo nouvo",
    introduction: `
      <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 p-6 rounded-lg border-l-4 border-green-500">
        <h3 class="text-xl font-bold text-green-700 dark:text-green-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Nan leson sa a, n ap aprann kijan pou nou vin jwenn mo nouvo epi konprann yo nan diferan sitiyasyon. 
          Chak jou nou rankontre mo nou pa konnen, men se pa yon baryè - se yon opòtinite pou n elaji vokabilè nou!
        </p>
      </div>
      
      <div class="mt-6 bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Poukisa Vokabilè Enpòtan?</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Yon vokabilè rich ede w:
        </p>
        <ul class="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
          <li>Eksprime tèt ou pi byen</li>
          <li>Konprann lòt moun fasil</li>
          <li>Reyisi nan etid ou yo</li>
          <li>Patisipe nan diskisyon enteresan</li>
        </ul>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📖 Kijan pou Aprann Mo Nouvo</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">1. Itilize Kontèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Kontèks se tout sa ki antoure yon mo nan yon fraz oswa yon sitiyasyon. Li ede nou devine sa mo a vle di.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-600 dark:text-gray-400 mb-2">Egzanp:</p>
            <p class="italic">"Solèy la ap <strong>ponnen</strong>. Tout moun ap chèche lonbray pou yo pa cho twòp."</p>
            <p class="mt-3 text-gray-700 dark:text-gray-300">
              <strong>Kontèks:</strong> Moun ap chèche lonbray paske yo cho → "Ponnen" dwe vle di solèy ap fè cho anpil!
            </p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">2. Chèche Indis nan Fraz la</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Souvan, lòt mo nan fraz la bay kle pou konprann mo nou pa konnen an.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div>
              <p class="text-gray-600 dark:text-gray-400 mb-1">Egzanp 1:</p>
              <p class="italic">"Mari se yon <strong>jèn moun vayan</strong>. Li pa janm pè anyen, li toujou pare pou l defann lòt yo."</p>
              <p class="mt-2 text-sm text-green-600 dark:text-green-400">→ Vayan = yon moun ki gen kouraj</p>
            </div>
            <div>
              <p class="text-gray-600 dark:text-gray-400 mb-1">Egzanp 2:</p>
              <p class="italic">"Bagay sa a <strong>fragil</strong>, fò ou pran l ak prekosyon pou l pa kase."</p>
              <p class="mt-2 text-sm text-green-600 dark:text-green-400">→ Fragil = sa ki ka kase fasil</p>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">3. Gade Rasin Mo a</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Anpil mo gen yon rasin (pati prensipal) ki ka ede w konprann siyifikasyon yo.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="font-semibold mb-2">Egzanp ak mo ki gen rasin "travay":</p>
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• <strong>Travay</strong> = aktivite w fè</li>
              <li>• <strong>Travayè</strong> = moun ki travay</li>
              <li>• <strong>Travay-la</strong> = travay espesifik la</li>
              <li>• <strong>Antravay</strong> = kote w ap travay</li>
            </ul>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">4. Poze Kesyon</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Pa gen moved kesyon! Si w pa konprann yon mo, mande:
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ "Ki sa mo sa a vle di?"</li>
              <li>✓ "Èske w ka ban m yon egzanp?"</li>
              <li>✓ "Èske w ka eksplike l yon lòt jan?"</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border border-indigo-300 dark:border-indigo-700">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">🎒 Mo nan Lòt Disiplin</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Chak sijè etid gen mo espesyal yo. Men kèk egzanp:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <p class="font-semibold text-blue-600 dark:text-blue-400">Matematik:</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">adisyon, sistraksyon, miltiplikasyon, divizyon</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <p class="font-semibold text-green-600 dark:text-green-400">Syans:</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">selil, òganis, anviwònman, ekosistèm</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <p class="font-semibold text-purple-600 dark:text-purple-400">Istwa:</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">endepandans, koloni, revolisyon, eritaj</p>
          </div>
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <p class="font-semibold text-orange-600 dark:text-orange-400">Jeyografi:</p>
            <p class="text-sm text-gray-600 dark:text-gray-400">montan, rivyè, klima, popilasyon</p>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 p-5 rounded-lg">
        <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">💭 Konsèy</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Chak fwa w aprann yon mo nouvo, eseye itilize l nan 3 fraz diferan menm jou a. 
          Sa ap ede w sonje l pi byen!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1: Devine Mo a Gras ak Kontèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Li fraz sa yo epi eseye devine sa mo ki souliye yo vle di:</p>
          
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2">"Timoun nan te <strong>refize</strong> manje legim. Li pa t vle l menm gade l."</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Sa 'refize' vle di?" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2">"Machin nan te <strong>ralanti</strong> lè l rive toupre lekòl la paske t ap gen anpil timoun."</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Sa 'ralanti' vle di?" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2">"Yo te dwe <strong>evakye</strong> tout moun ki te nan kay la akòz dife a."</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Sa 'evakye' vle di?" />
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2: Kreye Fraz ak Mo Nouvo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Men kèk mo nouvo. Ekri yon fraz ak chak mo:</p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="font-semibold">1. Abitan (moun ki rete nan yon kote)</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Ekri fraz ou isit..."></textarea>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="font-semibold">2. Pwodiktif (ki pwodwi anpil, ki bay bon rezilta)</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Ekri fraz ou isit..."></textarea>
            </div>

            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="font-semibold">3. Kolaborasyon (travay ansanm)</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Ekri fraz ou isit..."></textarea>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3: Idantifye Rasin Mo yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Jwenn rasin ki menm nan gwoup mo sa yo:</p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded mb-3">
            <p class="font-semibold mb-2">Gwoup 1: Aprann, Aprantisaj, Aprantif</p>
            <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Rasin: ___________" />
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded mb-3">
            <p class="font-semibold mb-2">Gwoup 2: Jaden, Jadin, Jadinye</p>
            <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Rasin: ___________" />
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4: Kaye Mo Pèsonèl</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Kreye yon ti kaye pou mo nouvo ou aprann. Pou chak mo, ekri:
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Mo a</li>
              <li>Siyifikasyon an</li>
              <li>Yon fraz ak mo a</li>
              <li>Yon desen si sa posib (pou mo w ka vizalize)</li>
            </ul>
          </div>
        </div>

        <div class="bg-teal-50 dark:bg-teal-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3">🎯 Defi Chak Jou</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Pran angajman pou aprann 3 mo nouvo chak jou pandan yon semèn. Sa fè 21 mo nan fen semèn nan!
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Kote pou jwenn mo nouvo:</strong> Liv, jou, radyo, televizyon, pale ak lòt moun
            </p>
          </div>
        </div>
      </div>
    `,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Vokabilè"
  },
  {
    id: 5,
    mois: "Novanm",
    title: "Règ ekri kreyòl: 1 son = 1 siy",
    description: "Aplike prensip reprezantasyon son pa yon siy inik",
    objectif: "Konprann prensip 1 son = 1 siy nan kreyòl",
    introduction: `
      <div class="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 p-6 rounded-lg border-l-4 border-pink-500">
        <h3 class="text-xl font-bold text-pink-700 dark:text-pink-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Nan leson sa a, n ap aprann pi gwo règ òtograf kreyòl la: <strong>1 son = 1 siy</strong>. 
          Sa vle di, chak son ou tande gen yon sèl lèt oswa yon sèl konbinezon lèt pou ekri l. 
          Sistèm sa a fè kreyòl pi fasil pou ekri pase anpil lòt lang!
        </p>
      </div>
      
      <div class="mt-6 bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Poukisa Règ sa a Enpòtan?</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Avèk règ "1 son = 1 siy", ou ekri egzakteman sa ou tande. Pa gen lèt mistè oswa lèt an plis. 
          Sa fè kreyòl ayisyen youn nan lang ki pi lojik pou ekri!
        </p>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">🔤 Prensip "1 Son = 1 Siy"</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Sa Prensip la Vle Di</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Nan kreyòl ayisyen, chak son ou tande gen yon sèl fason pou ekri l. Ou pa bezwen devine kijan pou ekri yon mo - 
            ou jis ekri sa ou tande!
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="font-semibold mb-3">Egzanp:</p>
            <div class="space-y-2 text-gray-700 dark:text-gray-300">
              <p>• Ou tande: <span class="text-blue-600 dark:text-blue-400">[tab]</span> → Ou ekri: <strong>tab</strong></p>
              <p>• Ou tande: <span class="text-blue-600 dark:text-blue-400">[kay]</span> → Ou ekri: <strong>kay</strong></p>
              <p>• Ou tande: <span class="text-blue-600 dark:text-blue-400">[mango]</span> → Ou ekri: <strong>mango</strong></p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">Lèt Espesyal Kreyòl yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kreyòl gen kèk lèt oswa konbinezon lèt ki diferan ak fransè oswa angle:
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">1. ON se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>pon</strong> (pont), <strong>mon</strong> (mont)</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">2. AN se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>man</strong> (mwen), <strong>pan</strong> (pan)</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">3. EN se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>pen</strong> (pen), <strong>chen</strong> (chyen)</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">4. OU se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>ou</strong> (ou/w), <strong>nou</strong> (nou)</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">5. CH se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>chat</strong> (chat), <strong>chwa</strong> (chwa)</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">6. UI se yon sèl son</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">Egzanp: <strong>uit</strong> (uit), <strong>nui</strong> (nwi)</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Konparezon ak Fransè</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Ann gade kijan règ kreyòl la fè ekriti pi senp pase nan fransè:
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead class="bg-green-100 dark:bg-green-900">
                <tr>
                  <th class="p-3 text-left">Mo Kreyòl</th>
                  <th class="p-3 text-left">Mo Fransè</th>
                  <th class="p-3 text-left">Eksplikasyon</th>
                </tr>
              </thead>
              <tbody class="text-gray-700 dark:text-gray-300">
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3"><strong>tab</strong></td>
                  <td class="p-3">table</td>
                  <td class="p-3 text-sm">Kreyòl pa ekri "le" - jis son [tab]</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3"><strong>liv</strong></td>
                  <td class="p-3">livre</td>
                  <td class="p-3 text-sm">Pa gen "re" - jis [liv]</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3"><strong>kay</strong></td>
                  <td class="p-3">maison</td>
                  <td class="p-3 text-sm">Ekri sa w tande, pa kopi fransè</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3"><strong>dlo</strong></td>
                  <td class="p-3">eau</td>
                  <td class="p-3 text-sm">Kreyòl: egzakteman 3 son [d-l-o]</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">⚠️ Erè Komen yo</h3>
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-red-600 dark:text-red-400 font-semibold">❌ Erè: "maison"</p>
              <p class="text-green-600 dark:text-green-400 font-semibold">✅ Kòrèk: "kay"</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Ekri kreyòl, pa kopi fransè!</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-red-600 dark:text-red-400 font-semibold">❌ Erè: "fraire"</p>
              <p class="text-green-600 dark:text-green-400 font-semibold">✅ Kòrèk: "frè"</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Ou tande [frè], ekri [frè]</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-red-600 dark:text-red-400 font-semibold">❌ Erè: "mandjé"</p>
              <p class="text-green-600 dark:text-green-400 font-semibold">✅ Kòrèk: "manje"</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Pa mete aksantegi inutilman</p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">🎵 Teknik pou Ekri Byen</h3>
          <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Koute byen:</strong> Pran tan w pou tande chak son nan mo a</li>
            <li><strong>Di mo a an silabik:</strong> Egzanp: "ma-go" → "man-go"</li>
            <li><strong>Ekri son pa son:</strong> Pa eseye devine, ekri sa w tande</li>
            <li><strong>Pa melanje ak lòt lang:</strong> Oubliye règ fransè ak angle, itilize règ kreyòl</li>
          </ol>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border border-indigo-300 dark:border-indigo-700">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">💡 Sonje!</h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
          Kreyòl se yon lang ak pwòp règ li. Li pa bezwen kopi ni fransè ni angle. 
          Lè w respekte prensip "1 son = 1 siy", w ap ekri kreyòl kòrèkteman chak fwa!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1: Kòrije Mo sa yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Mo sa yo ekri mal. Ekri yo kòrèkteman swivan règ kreyòl:</p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-red-600 dark:text-red-400">❌ "maison"</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" placeholder="Ekri mo kòrèk la" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-red-600 dark:text-red-400">❌ "beaucoup"</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" placeholder="Ekri mo kòrèk la" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-red-600 dark:text-red-400">❌ "enfant"</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" placeholder="Ekri mo kòrèk la" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-red-600 dark:text-red-400">❌ "école"</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" placeholder="Ekri mo kòrèk la" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-red-600 dark:text-red-400">❌ "oeuf"</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" placeholder="Ekri mo kòrèk la" />
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2: Ekri Sa W Tande</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Mande yon zanmi oswa yon pwofesè pou li mo sa yo byen klè. Ekoute epi ekri sa w tande:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded space-y-3">
            <div>
              <p class="font-semibold mb-2">1. [Pwofesè ap li: "timoun"]</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" placeholder="Ekri mo a isit..." />
            </div>

            <div>
              <p class="font-semibold mb-2">2. [Pwofesè ap li: "lakou"]</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" placeholder="Ekri mo a isit..." />
            </div>

            <div>
              <p class="font-semibold mb-2">3. [Pwofesè ap li: "machin"]</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" placeholder="Ekri mo a isit..." />
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3: Tradui epi Ekri an Kreyòl</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Tradui fraz sa yo an kreyòl, respekte règ "1 son = 1 siy":</p>
          
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2"><strong>Fransè:</strong> "Je vais à l'école."</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" rows="2" placeholder="Kreyòl:"></textarea>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2"><strong>Fransè:</strong> "Les enfants jouent dans la cour."</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" rows="2" placeholder="Kreyòl:"></textarea>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2"><strong>Fransè:</strong> "Ma mère prépare le repas."</p>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2" rows="2" placeholder="Kreyòl:"></textarea>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4: Detekte Erè yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Nan chak fraz sa yo, gen mo ki mal ekri. Jwenn yo epi kòrije yo:
          </p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2">"Mari ale nan marché pou achte legume."</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Mo ki mal ekri ak kòreksyon..." />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="mb-2">"Timoun yo ap jouer nan lakou."</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" placeholder="Mo ki mal ekri ak kòreksyon..." />
            </div>
          </div>
        </div>

        <div class="bg-teal-50 dark:bg-teal-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3">🎯 Defi Final</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Ekri yon ti istwa kout (5-7 fraz) an kreyòl sou yon bagay ki te pase w jodi a. 
            Asire w ke chak mo respekte règ "1 son = 1 siy"!
          </p>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 min-h-[150px]" placeholder="Ekri istwa w isit..."></textarea>
        </div>
      </div>
    `,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Òtograf"
  },
  {
    id: 6,
    mois: "Novanm",
    title: "Òganizasyon pwodiksyon ekri",
    description: "Elabore plan pou òganize pwodiksyon ekri",
    objectif: "Aprann òganize ide pou ekri byen",
    introduction: `
      <div class="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 p-6 rounded-lg border-l-4 border-violet-500">
        <h3 class="text-xl font-bold text-violet-700 dark:text-violet-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300">
          Nan leson sa a, n ap aprann kijan pou òganize ide nou anvan nou ekri. Yon bon plan se kle pou yon bon tèks! 
          Se tankou lè w ap bati yon kay - fò w gen yon plan anvan w kòmanse konstruksyon an.
        </p>
      </div>
      
      <div class="mt-6 bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
        <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">💡 Poukisa Organizasyon Enpòtan?</h4>
        <p class="text-gray-700 dark:text-gray-300">
          Yon tèks ki byen òganize:
        </p>
        <ul class="list-disc list-inside mt-2 text-gray-700 dark:text-gray-300 space-y-1">
          <li>Pi fasil pou konprann</li>
          <li>Gen yon bon flow (kouran) lide</li>
          <li>Gade entèrè moun k ap li a</li>
          <li>Montre w se yon bon ekriven</li>
        </ul>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📝 Etap yo nan Pwodiksyon Ekri</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Etap 1: Preparasyon (Reflechi)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Anvan w kòmanse ekri, pran tan pou reflechi sou sa w ap ekri a.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="font-semibold text-blue-600 dark:text-blue-400 mb-2">Kesyon pou poze tèt ou:</p>
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ Ki sijè m ap pale?</li>
              <li>✓ Pou ki moun m ap ekri? (Zanmi, pwofesè, piblik jeneral?)</li>
              <li>✓ Ki objektif m? (Enfòme, konvenk, rakonte?)</li>
              <li>✓ Ki sa m konnen sou sijè a?</li>
              <li>✓ Èske m bezwen chèche plis enfòmasyon?</li>
            </ul>
          </div>

          <div class="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 p-4 rounded-lg">
            <p class="font-semibold mb-2">🧠 Teknik: Brainstorming (Lage lide)</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Ekri tout ide ki vini nan tèt ou sou sijè a. Pa eseye òganize yo toujou - jis ekri yo tout!
            </p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">Etap 2: Planifikasyon (Fè Plan)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kounye a, òganize lide ou yo. Fè yon plan ki klè!
          </p>

          <div class="bg-white dark:bg-gray-800 p-5 rounded-lg mb-4">
            <p class="font-semibold text-purple-600 dark:text-purple-400 mb-3">📋 Estrikti Debaz yon Tèks:</p>
            
            <div class="space-y-4">
              <div class="border-l-4 border-green-500 pl-4">
                <p class="font-semibold text-green-700 dark:text-green-300">1. Entwodiksyon</p>
                <ul class="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                  <li>• Prezante sijè a</li>
                  <li>• Atire atansyon lektè a</li>
                  <li>• Anonse sa w ap pale</li>
                </ul>
              </div>

              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold text-blue-700 dark:text-blue-300">2. Kò Tèks la (Devlopman)</p>
                <ul class="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                  <li>• Prezante chak lide prensipal</li>
                  <li>• Bay detay ak egzanp</li>
                  <li>• Itilize paragraf diferan pou chak ide</li>
                </ul>
              </div>

              <div class="border-l-4 border-orange-500 pl-4">
                <p class="font-semibold text-orange-700 dark:text-orange-300">3. Konklizyon</p>
                <ul class="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                  <li>• Rezime pwen prensipal yo</li>
                  <li>• Bay yon dènye refleksyon</li>
                  <li>• Kite yon bon enpresyon</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-4 rounded-lg">
            <p class="font-semibold mb-2">🗺️ Egzanp Plan:</p>
            <div class="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p><strong>Sijè:</strong> Enpòtans edikasyon</p>
              <p><strong>I.</strong> Entwodiksyon - Edikasyon se kle siksè</p>
              <p><strong>II.</strong> Avantaj edikasyon (3 pwen)</p>
              <p class="pl-4">A. Jwenn bon travay</p>
              <p class="pl-4">B. Konprann mond lan pi byen</p>
              <p class="pl-4">C. Ede kominote a</p>
              <p><strong>III.</strong> Konklizyon - Envesti nan edikasyon ou</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">Etap 3: Redaksyon (Ekri Brouyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kounye a, ekri tèks ou a swivan plan ou an. Pa enkyete w twòp pou erè - sa se brouyon!
          </p>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="font-semibold text-green-600 dark:text-green-400 mb-3">Konsèy pou Redaksyon:</p>
            <ul class="space-y-2 text-gray-700 dark:text-gray-300">
              <li>✓ <strong>Swiv plan ou:</strong> Pa kite l derape</li>
              <li>✓ <strong>Ekri fraz klè:</strong> Pa fè l twò konplike</li>
              <li>✓ <strong>Itilize mo lyen:</strong> "Premyèman", "Dèzyèmman", "Finalman", "Donk", "Paske"</li>
              <li>✓ <strong>Yon ide pa paragraf:</strong> Pa melanje tout bagay</li>
              <li>✓ <strong>Bay egzanp:</strong> Sa ede w eksplike pi byen</li>
            </ul>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">Etap 4: Revizyon (Amelyore Tèks la)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kounye a, li tèks ou a epi amelyore l. Se etap sa a ki fè diferans ant yon bon ekriven ak yon move ekriven!
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">📖 Revizyon Kontni:</p>
              <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Èske lide yo klè?</li>
                <li>• Èske tout bagay nan bon lòd?</li>
                <li>• Èske gen anpil detay?</li>
                <li>• Èske li enteresan?</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">✍️ Revizyon Fòm:</p>
              <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Kòrije fot òtograf</li>
                <li>• Verifye ponktuasyon</li>
                <li>• Chanje mo ki repete</li>
                <li>• Amelyore estrikti fraz</li>
              </ul>
            </div>
          </div>

          <div class="mt-4 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 p-4 rounded-lg">
            <p class="font-semibold mb-2">💡 Konsèy:</p>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Kite tèks ou a poze yon ti tan (yon èdtan, yon jou) anvan w revize l. 
              Lè w retounen sou li, w ap wè l ak je fre epi w ap jwenn plis bagay pou amelyore!
            </p>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">Etap 5: Finalizasyon (Vèsyon Final)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Fè dènye retouche yo epi prepare vèsyon final ou!
          </p>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="font-semibold text-red-600 dark:text-red-400 mb-3">Checklist Final:</p>
            <div class="space-y-2">
              <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="rounded" />
                <span>Tèks la byen prezante (marj, espas, etc.)?</span>
              </label>
              <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="rounded" />
                <span>Tout fot òtograf kòrije?</span>
              </label>
              <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="rounded" />
                <span>Ponktuasyon kòrèk?</span>
              </label>
              <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="rounded" />
                <span>Tèks la responde objektif mwen?</span>
              </label>
              <label class="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <input type="checkbox" class="rounded" />
                <span>Mwen fyè ak travay mwen?</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border border-indigo-300 dark:border-indigo-700">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">🎯 Rezime Etap yo</h3>
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-3 rounded text-center">
            <div class="text-2xl mb-1">🧠</div>
            <p class="font-semibold text-sm">Preparasyon</p>
          </div>
          <div class="text-2xl">→</div>
          <div class="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-3 rounded text-center">
            <div class="text-2xl mb-1">📋</div>
            <p class="font-semibold text-sm">Planifikasyon</p>
          </div>
          <div class="text-2xl">→</div>
          <div class="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-3 rounded text-center">
            <div class="text-2xl mb-1">✍️</div>
            <p class="font-semibold text-sm">Redaksyon</p>
          </div>
          <div class="text-2xl">→</div>
          <div class="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-3 rounded text-center">
            <div class="text-2xl mb-1">🔍</div>
            <p class="font-semibold text-sm">Revizyon</p>
          </div>
          <div class="text-2xl">→</div>
          <div class="flex-1 min-w-[150px] bg-white dark:bg-gray-800 p-3 rounded text-center">
            <div class="text-2xl mb-1">✅</div>
            <p class="font-semibold text-sm">Finalizasyon</p>
          </div>
        </div>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1: Preparasyon pou yon Tèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Chwazi youn nan sijè sa yo epi repond kesyon preparasyon yo:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="font-semibold mb-2">Sijè yo:</p>
            <ul class="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Vakans dete mwen prefere</li>
              <li>Sport ki pi bon pou sante</li>
              <li>Yon moun mwen admire</li>
            </ul>
          </div>

          <div class="space-y-3">
            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">Sijè mwen chwazi:</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>
            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">Pou ki moun m ap ekri?</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>
            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">Ki objektif mwen? (Enfòme, rakonte, konvenk?)</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2: Kreye yon Plan</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Itilize sijè ou te chwazi nan Egzèsis 1 pou kreye yon plan detaye:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-4">
            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">I. Entwodiksyon</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Sa w ap di nan entwodiksyon an?"></textarea>
            </div>

            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">II. Kò Tèks la - Pwen Prensipal 1</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Premye lide prensipal ou"></textarea>
            </div>

            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">III. Kò Tèks la - Pwen Prensipal 2</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Dezyèm lide prensipal ou"></textarea>
            </div>

            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">IV. Kò Tèks la - Pwen Prensipal 3</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Twazyèm lide prensipal ou"></textarea>
            </div>

            <div>
              <label class="font-semibold text-gray-700 dark:text-gray-300">V. Konklizyon</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" rows="2" placeholder="Kijan w ap konkli?"></textarea>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3: Ekri Brouyon an</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kounye a, itilize plan ou pou ekri yon premye vèsyon tèks ou a (10-15 fraz):
          </p>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 min-h-[300px]" placeholder="Ekri brouyon ou isit. Pa enkyete w pou erè - w ap kòrije yo pita!"></textarea>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4: Pratik Revizyon</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Men yon paragraf ki gen kèk pwoblèm. Revize l pou amelyore l:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-red-600 dark:text-red-400 italic">
              "Mwen renmen li liv. Li liv se yon bon bagay. Liv yo bay enfòmasyon. Mwen li liv chak jou. 
              Li liv ede ou aprann bagay. Se poutèt sa mwen renmen li liv anpil anpil."
            </p>
          </div>

          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            <strong>Pwoblèm:</strong> Repete "li liv" twòp, fraz twò senp, pa gen varyete
          </p>

          <label class="font-semibold text-gray-700 dark:text-gray-300">Vèsyon Amelyore:</label>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[150px]" placeholder="Ekri vèsyon amelyore a isit..."></textarea>
        </div>

        <div class="bg-teal-50 dark:bg-teal-950 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3">🎯 Pwojè Final</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Swiv tout 5 etap yo pou ekri yon tèks konplè sou youn nan sijè sa yo:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <ul class="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Opsyon 1:</strong> Lèt bay yon zanmi pou rakonte l yon bèl eksperyans</li>
              <li><strong>Opsyon 2:</strong> Atik pou jou lekòl sou enpòtans pwòpte</li>
              <li><strong>Opsyon 3:</strong> Tèks pou konvenk moun yo pwoteje anviwònman</li>
            </ul>
          </div>

          <div class="bg-gradient-to-r from-teal-100 to-green-100 dark:from-teal-900 dark:to-green-900 p-4 rounded-lg">
            <p class="font-semibold mb-2">📝 Kritè Siksè:</p>
            <ul class="text-sm space-y-1 text-gray-700 dark:text-gray-300">
              <li>✓ Gen yon plan klè anvan ekri</li>
              <li>✓ Estrikti: Entwodiksyon, Devlopman, Konklizyon</li>
              <li>✓ Lide yo byen òganize</li>
              <li>✓ Tèks la revize plizyè fwa</li>
              <li>✓ Pa gen twòp fot òtograf</li>
              <li>✓ Tèks la enteresan pou li!</li>
            </ul>
          </div>
        </div>
      </div>
    `,
    duration: "60 minit",
    difficulty: "Intermediaire",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 7,
    mois: "Desanm",
    title: "Egzekisyon konsiy konplèks",
    description: "Swiv epi egzekite konsiy konplèks ou tande",
    objectif: "Devlope kapasite pou swiv enstriksyon konplèks",
    introduction: `<p>Konsiy konplèks mande plis atansyon.</p>`,
    contenu: `<h2>Koute Byen</h2><p>Poze kesyon si ou pa konprann.</p>`,
    exemplesExercices: `<p>Pratik: Swiv enstriksyon etap pa etap.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Kominikasyon Oral"
  },
  {
    id: 8,
    mois: "Desanm",
    title: "Tip fraz yo",
    description: "Idantifye tip fraz: deklaratif, entèwogatif, ekslamatif, enpératif",
    objectif: "Konnen epi itilize diferan tip fraz",
    introduction: `<p>Gen kat tip fraz prensipal.</p>`,
    contenu: `<h2>Deklaratif, Entèwogatif, Ekslamatif, Enpératif</h2><p>Chak tip gen yon itilizasyon.</p>`,
    exemplesExercices: `<p>Pratik: Kreye fraz nan chak tip.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 9,
    mois: "Janvye",
    title: "Mo ki gen plizyè sans",
    description: "Idantifye mo ki gen plizyè sans nan diferan kontèks",
    objectif: "Konprann mo polisemik",
    introduction: `<p>Kèk mo gen diferan siyifikasyon.</p>`,
    contenu: `<h2>Mo Polisemik</h2><p>Kontèks ede nou konprann bon sans la.</p>`,
    exemplesExercices: `<p>Pratik: Itilize mo nan diferan kontèks.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Vokabilè"
  },
  {
    id: 10,
    mois: "Janvye",
    title: "Konstitivan fraz la",
    description: "Dekoupe fraz an gwoup sijè ak gwoup predikat",
    objectif: "Konnen estrikti debaz yon fraz",
    introduction: `<p>Fraz gen de pati prensipal.</p>`,
    contenu: `<h2>Gwoup Sijè ak Gwoup Predikat</h2><p>Yo travay ansanm.</p>`,
    exemplesExercices: `<p>Pratik: Separe GS ak GP nan fraz.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 11,
    mois: "Fevriye",
    title: "Mo otou yon tèm",
    description: "Regwoupe mo ki rapòte a yon tèm chwazi",
    objectif: "Devlope vokabilè tematik",
    introduction: `<p>Mo yo ka gwoup pa tèm.</p>`,
    contenu: `<h2>Rezo Mo</h2><p>Kreye rezo mo pou tèm ou chwazi a.</p>`,
    exemplesExercices: `<p>Pratik: Fè lis mo otou yon tèm.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Vokabilè"
  },
  {
    id: 12,
    mois: "Fevriye",
    title: "Konbinezon son ak Y ak W",
    description: "Repwodui konbinezon son ou tande ak Y ak W",
    objectif: "Metrize son Y ak W",
    introduction: `<p>Y ak W fè anpil son diferan.</p>`,
    contenu: `<h2>Son ak Y ak W</h2><p>Pratik pou byen ekri yo.</p>`,
    exemplesExercices: `<p>Pratik: Ekri mo ki gen Y ak W.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Òtograf"
  },
  {
    id: 13,
    mois: "Mas",
    title: "Gwoup Nominal Sijè (GNS)",
    description: "Distenge Gwoup Nominal Sijè nan fraz",
    objectif: "Idantifye GNS",
    introduction: `<p>GNS se pati fraz ki di kiyès oswa kisa k ap fè aksyon an.</p>`,
    contenu: `<h2>Gwoup Nominal Sijè</h2><p>Li ka gen detèminan, adjektif ak non.</p>`,
    exemplesExercices: `<p>Pratik: Jwenn GNS nan fraz.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 14,
    mois: "Mas",
    title: "Pwovèb kreyòl",
    description: "Eksplike pwovèb epi ilistre yo ak egzanp",
    objectif: "Konprann sajès tradisyonèl kreyòl",
    introduction: `<p>Pwovèb se richès kilti nou.</p>`,
    contenu: `<h2>Pwovèb Ayisyen</h2><p>Chak pwovèb gen yon leson.</p>`,
    exemplesExercices: `<p>Pratik: Eksplike pwovèb yo.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Kominikasyon Oral"
  },
  {
    id: 15,
    mois: "Avril",
    title: "Advèb yo",
    description: "Idantifye diferan tip advèb epi anplwaye yo nan fraz",
    objectif: "Konnen epi itilize advèb",
    introduction: `<p>Advèb modifye vèb, adjektif oswa lòt advèb.</p>`,
    contenu: `<h2>Tip Advèb</h2><p>Tan, kote, manyè, kantite.</p>`,
    exemplesExercices: `<p>Pratik: Itilize advèb nan fraz.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 16,
    mois: "Avril",
    title: "Tèks korespondans",
    description: "Ekri diferan tip tèks korespondans: lèt, biyè, memo",
    objectif: "Metrize ekriti fòmèl ak enfòmèl",
    introduction: `<p>Korespondan se yon zouti kominikasyon.</p>`,
    contenu: `<h2>Lèt, Biyè, Memo</h2><p>Chak gen yon estrikti.</p>`,
    exemplesExercices: `<p>Pratik: Ekri yon lèt.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 17,
    mois: "Me",
    title: "Detèminan yo",
    description: "Idantifye detèminan nan gwoup nominal",
    objectif: "Konnen detèminan yo",
    introduction: `<p>Detèminan prezante non an.</p>`,
    contenu: `<h2>Detèminan Defini, Endefini, Posesif, Demonstratif</h2><p>Chak tip gen yon itilizasyon.</p>`,
    exemplesExercices: `<p>Pratik: Itilize detèminan yo.</p>`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 18,
    mois: "Me",
    title: "Lekti ekspresif",
    description: "Li tèks avèk ritm ak entonasyon ki bon",
    objectif: "Amelyore lekti espresif",
    introduction: `<p>Lekti espresif rann tèks la pi enteresan.</p>`,
    contenu: `<h2>Ritm, Entonasyon, Ekspresyon</h2><p>Pratik pou amelyore.</p>`,
    exemplesExercices: `<p>Pratik: Li ak ekspresyon.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Lekti"
  },
  {
    id: 19,
    mois: "Jen",
    title: "Kontraksiyon nan kreyòl",
    description: "Ekri kòrèkteman fòm kontrakte, mo konpoze ak non pwòp",
    objectif: "Metrize kontraksiyon ak òtograf patikilye",
    introduction: `<p>Kontraksiyon senpliye ekriti.</p>`,
    contenu: `<h2>Fòm Kontrakte</h2><p>Respekte règ yo.</p>`,
    exemplesExercices: `<p>Pratik: Ekri fòm kontrakte yo.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Òtograf"
  },
  {
    id: 20,
    mois: "Jen",
    title: "Sinonim, Omonim, Antonim",
    description: "Idantifye epi itilize sinonim, omonim ak antonim",
    objectif: "Anrichi vokabilè avèk relasyon ant mo",
    introduction: `<p>Mo yo gen diferan relasyon.</p>`,
    contenu: `<h2>Sinonim, Omonim, Antonim</h2><p>Konprann diferans yo.</p>`,
    exemplesExercices: `<p>Pratik: Jwenn sinonim ak antonim.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Vokabilè"
  },
  {
    id: 21,
    mois: "Jen",
    title: "Adjektif kalifikatif",
    description: "Itilize adjektif ki plase devan non ak sa ki plase apre non",
    objectif: "Metrize pozisyon adjektif",
    introduction: `<p>Adjektif ka anvan oswa apre non.</p>`,
    contenu: `<h2>Pozisyon Adjektif</h2><p>Kèk ale anvan, lòt ale apre.</p>`,
    exemplesExercices: `<p>Pratik: Itilize adjektif kòrèkteman.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 22,
    mois: "Jen",
    title: "Detèminan posesif",
    description: "Idantifye detèminan ki make posedan",
    objectif: "Itilize detèminan posesif",
    introduction: `<p>Detèminan posesif endike posedan.</p>`,
    contenu: `<h2>Mwen, Ou, Li, Nou, Yo</h2><p>Chak moun gen pa li.</p>`,
    exemplesExercices: `<p>Pratik: Itilize detèminan posesif.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 23,
    mois: "Jen",
    title: "Fòmasyon mo",
    description: "Fòme lòt mo apati yon mo done",
    objectif: "Konprann fòmasyon mo",
    introduction: `<p>Nou ka kreye mo nouvo.</p>`,
    contenu: `<h2>Derivasyon, Konpozisyon, Redoubleman</h2><p>Twa metòd prensipal.</p>`,
    exemplesExercices: `<p>Pratik: Fòme mo nouvo.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Vokabilè"
  },
  {
    id: 24,
    mois: "Jen",
    title: "Detèminan endefini",
    description: "Itilize detèminan endefini: chak, tout, plizyè, nenpòt",
    objectif: "Itilize detèminan endefini",
    introduction: `<p>Detèminan endefini pa presiz kantite.</p>`,
    contenu: `<h2>Chak, Tout, Plizyè, Nenpòt</h2><p>Itilizasyon yo.</p>`,
    exemplesExercices: `<p>Pratik: Itilize detèminan endefini.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 25,
    mois: "Jen",
    title: "Pwopozisyon sibòdone relatif",
    description: "Pwodui fraz ki gen pwopozisyon sibòdone relatif",
    objectif: "Itilize pwopozisyon sibòdone relatif",
    introduction: `<p>Pwopozisyon sibòdone relatif bay plis detay.</p>`,
    contenu: `<h2>Ki, Kote, Lè</h2><p>Pwonon relatif yo.</p>`,
    exemplesExercices: `<p>Pratik: Kreye fraz avèk pwopozisyon sibòdone relatif.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 26,
    mois: "Jen",
    title: "Pwopozisyon sibòdone sirkonstansyèl",
    description: "Pwodui fraz ak pwopozisyon sibòdone sirkonstansyèl",
    objectif: "Itilize pwopozisyon sibòdone sirkonstansyèl",
    introduction: `<p>Pwopozisyon sirkonstansyèl bay sikonstan.</p>`,
    contenu: `<h2>Tan, Koz, Kondisyon, Opozisyon</h2><p>Diferan tip yo.</p>`,
    exemplesExercices: `<p>Pratik: Kreye fraz avèk pwopozisyon sirkonstansyèl.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 27,
    mois: "Jen",
    title: "Vèb eta ak vèb aktivite",
    description: "Distenge ant vèb ki eksprime eta ak sa ki eksprime aktivite",
    objectif: "Konnen diferans ant vèb eta ak vèb aktivite",
    introduction: `<p>Vèb gen de kategori prensipal.</p>`,
    contenu: `<h2>Vèb Aktivite ak Vèb Eta</h2><p>Chak kategori gen karakteristik pa li.</p>`,
    exemplesExercices: `<p>Pratik: Idantifye vèb eta ak vèb aktivite.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 28,
    mois: "Jen",
    title: "Konstitivan gwoup vèbal",
    description: "Idantifye eleman prensipal gwoup vèbal la",
    objectif: "Konprann estrikti gwoup vèbal",
    introduction: `<p>Gwoup vèbal gen plizyè eleman.</p>`,
    contenu: `<h2>Vèb Prensipal, Konpleman, Modifikatè</h2><p>Eleman yo travay ansanm.</p>`,
    exemplesExercices: `<p>Pratik: Idantifye eleman gwoup vèbal.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 29,
    mois: "Jen",
    title: "Ekspresyon bezwen, gou, santiman",
    description: "Eksprime bezwen, gou, opinyon ak santiman alekri",
    objectif: "Eksprime tèt ou nan ekriti",
    introduction: `<p>Ekri se yon mwayen pou eksprime tèt ou.</p>`,
    contenu: `<h2>Bezwen, Gou, Opinyon, Santiman</h2><p>Eksprime yo klèman.</p>`,
    exemplesExercices: `<p>Pratik: Ekri tèks pèsonèl.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 30,
    mois: "Jen",
    title: "Patisipasyon nan deba",
    description: "Patisipe nan deba ak kamarad, mèt oswa lòt moun",
    objectif: "Aprann patisipe nan deba",
    introduction: `<p>Deba se yon echanj ide.</p>`,
    contenu: `<h2>Règ Deba</h2><p>Koute, respekte, prezante lide klèman.</p>`,
    exemplesExercices: `<p>Pratik: Patisipe nan yon deba.</p>`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Kominikasyon Oral"
  }
];
