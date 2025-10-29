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
  youtube_url?: string;
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
    youtube_url: "https://www.youtube.com/watch?v=0bQ7m3ZyHyc",
    introduction: `
      <div class="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950 p-6 rounded-lg border-l-4 border-indigo-500">
        <h3 class="text-xl font-bold text-indigo-700 dark:text-indigo-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Lè w ap li yon tèks, kijan w konnen kote yon fraz kòmanse, kote li fini? Ki siy ki ede w? 
          Èske tout liy se fraz?
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          Nan leson sa a, n ap fè yon rapèl sou sa ki rele <strong>fraz</strong> nan kreyòl ayisyen, 
          epi nou pral pratike kijan pou idantifye chak fraz nan yon tèks. Konnen fraz yo byen ap ede w 
          li pi klè, ekri pi pwòp, epi konprann pi byen sa w ap li.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🤔 Reflechi</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Èske gen diferans ant yon <em>liy</em> ak yon <em>fraz</em>?</li>
            <li>Ki siy ponktiyasyon ou konn wè souvan nan fen fraz?</li>
            <li>Ki sa ki fè yon fraz gen sans konplè?</li>
          </ul>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-5 rounded-lg border border-green-300 dark:border-green-700">
          <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 Objektif Aprantisaj</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Rekonèt definisyon ak eleman esansyèl yon fraz</li>
            <li>Distingue fen fraz yo nan yon tèks (., ?, !)</li>
            <li>Idantifye gwoup sijè ak gwoup predika senp</li>
            <li>Separe fraz yo nan yon paragraf san erè</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📖 Konprann Fraz yo</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">1. Kisa ki yon fraz?</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Yon <strong>fraz</strong> se yon inite sans konplè: li bay yon mesaj ki fini, li gen yon <em>lide prensipal</em>. 
            Anjeneral, li kòmanse ak yon lèt majiskil epi li fini ak yon siy ponktiyasyon (pwen, pwen entèwogasyon, pwen esklamasyon).
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="text-blue-600 dark:text-blue-400 font-semibold mb-2">Egzanp</h4>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1">
              <li>• « <strong>Jodi a, lapli tonbe fò.</strong> »</li>
              <li>• « <strong>Èske ou byen?</strong> »</li>
              <li>• « <strong>Gade kijan solèy la bèl!</strong> »</li>
            </ul>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">2. Siy Ponktiyasyon ki Make Fen Fraz</h3>
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">• Pwen (.)</p>
              <p class="text-gray-700 dark:text-gray-300">Bay enfòmasyon/deklare: « Timoun yo antre lakay yo. »</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">• Pwen Entèwogasyon (?)</p>
              <p class="text-gray-700 dark:text-gray-300">Poze kesyon: « Kisa w ap li? »</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-purple-600 dark:text-purple-400 mb-2">• Pwen Esklamasyon (!)</p>
              <p class="text-gray-700 dark:text-gray-300">Eksprime emosyon/òd: « Pa kouri! » « Ala bèl! »</p>
            </div>
          </div>

          <div class="mt-4 bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <h4 class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">⚠️ Remak</h4>
            <p class="text-gray-700 dark:text-gray-300">
              Nan kreyòl, nou pa mete espas anvan siy yo; nou mete yo dirèkteman apre dènye mo fraz la.
            </p>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">3. Estrikti Debaz: Gwoup Sijè (GS) ak Gwoup Predika (GP)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Pifò fraz gen de gwo pati: <strong>Gwoup Sijè</strong> (moun/bagay nou pale sou li) ak 
            <strong>Gwoup Predika</strong> (sa n ap di sou sijè a: aksyon, eta, enfòmasyon).
          </p>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <h4 class="text-green-600 dark:text-green-400 font-semibold mb-3">Egzanp ak Koulis</h4>
            <div class="space-y-2 text-gray-700 dark:text-gray-300">
              <p><strong class="text-green-600 dark:text-green-400">GS:</strong> « <em>Manmi</em> » — 
                 <strong class="text-blue-600 dark:text-blue-400">GP:</strong> « <em>ap kwit diri a.</em> » 
                 → <span class="font-semibold">Manmi ap kwit diri a.</span></p>
              <p><strong class="text-green-600 dark:text-green-400">GS:</strong> « <em>Ti gason an</em> » — 
                 <strong class="text-blue-600 dark:text-blue-400">GP:</strong> « <em>te malad yè.</em> »</p>
            </div>
          </div>

          <p class="text-gray-700 dark:text-gray-300 text-sm">
            <strong>Nòt:</strong> Gen fraz enpèsònèl tou (san sijè klè), egzanp: « Lapli tonbe. »
          </p>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">4. Kalite Fraz Selon Estrikti</h3>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">Fraz Senp</p>
              <p class="text-gray-700 dark:text-gray-300">Yon sèl lide prensipal: « Mwen li liv la. »</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">Fraz Konpoze</p>
              <p class="text-gray-700 dark:text-gray-300">De lide mare: « Mwen li liv la <em>epi</em> mwen fè devwa mwen. »</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-orange-600 dark:text-orange-400 mb-2">Fraz ak Subòdone</p>
              <p class="text-gray-700 dark:text-gray-300">Yon lide depann de yon lòt: « Mwen kontan <em>paske</em> mwen reyisi tès la. »</p>
            </div>
          </div>

          <div class="mt-4 bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg border border-indigo-300 dark:border-indigo-700">
            <h4 class="text-indigo-800 dark:text-indigo-200 font-semibold mb-2">💡 Konsèy</h4>
            <p class="text-gray-700 dark:text-gray-300">
              Pou idantifye fraz yo pi vit, chèche konjonksyon kle yo (epi, men, paske, lè, si, poutèt sa…) 
              ki souvan separe ide yo.
            </p>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">5. Idantifye Fraz yo nan yon Tèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Lè w ap li yon paragraf, suiv etap sa yo pou separe fraz yo san konfonn:
          </p>
          
          <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
            <li>Chèche majiskil ki kòmanse apre yon pwen, yon kesyon oswa yon esklamasyon.</li>
            <li>Make kote siy fen fraz yo ye (., ?, !).</li>
            <li>Verifye si pati ant kòmansman ak siy la bay yon lide konplè.</li>
            <li>Si w nan dout, li anwo vwa: èske li sonnen tankou yon mesaj fini?</li>
            <li>Fè tès GS/GP rapid: èske gen <em>ki sa/oswa kiyès</em> + <em>kisa nou di sou li</em>?</li>
          </ol>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Paragraf pou Pratike:</p>
            <p class="text-gray-600 dark:text-gray-400 italic mb-3">
              « Yè swa, kouran te koupe nan katye a. Manman limen bouji a pou nou ka li devwa nou. 
              Ti frè m nan te santi l pè, men nou te rete trankil. Apre yon ti tan, kouran tounen. 
              Nou te kontan anpil! »
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              <strong>Tâch:</strong> Separe paragraf la an fraz, konte yo, epi make siy fen yo.
            </p>
          </div>
        </div>

        <div class="bg-pink-50 dark:bg-pink-950 p-6 rounded-lg border-l-4 border-pink-500">
          <h3 class="text-xl font-semibold text-pink-700 dark:text-pink-300 mb-3">6. Erè ki Souvan Fèt lè n ap Separe Fraz</h3>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-red-600 dark:text-red-400 mb-1">❌ Erè 1: Konfonn liy ak fraz</p>
              <p class="text-gray-700 dark:text-gray-300 text-sm">Yon liy ka gen plizyè fraz; yon fraz ka pran plizyè liy.</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-red-600 dark:text-red-400 mb-1">❌ Erè 2: Bliye siy fen fraz</p>
              <p class="text-gray-700 dark:text-gray-300 text-sm">Fraz san pwen ap fè lektè a pèdi souf.</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p class="font-semibold text-red-600 dark:text-red-400 mb-1">❌ Erè 3: Mete twòp pwen</p>
              <p class="text-gray-700 dark:text-gray-300 text-sm">Koupe yon lide an moso ki pa konplè.</p>
            </div>
          </div>

          <div class="mt-4 bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-300 dark:border-green-700">
            <h4 class="text-green-800 dark:text-green-200 font-semibold mb-2">✅ Kijan pou Ranje Yo</h4>
            <ul class="text-gray-700 dark:text-gray-300 text-sm space-y-1">
              <li>• Li dousman epi chèche lide prensipal la</li>
              <li>• Tcheke si chak pati gen sans konplè avan ou mete pwen</li>
              <li>• Sèvi ak kesyon: kiyès/kisa + kisa nou di sou li?</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border-l-4 border-indigo-500">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">📺 Videyo pou Ale Pi Lwen</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Gade videyo sa a ki eksplike kijan pou separe fraz yo nan yon tèks an kreyòl. 
          Note 3 règ ki pi enpòtan yo pou ede w.
        </p>
      </div>

      <div class="mt-8 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 p-6 rounded-lg">
        <h3 class="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-2">🌟 Sonje!</h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
          Lè w konprann estrikti fraz yo byen, ou ka li pi vit, ekri pi klè, epi eksprime tèt ou pi byen. 
          Pratike chak jou pou fè pwogre!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-300 dark:border-blue-700">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1 — Separe Fraz yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Kopi paragraf sa a, mete pwen kote sa nesesè, epi konte konbyen fraz li genyen.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-gray-700 dark:text-gray-300 italic">
              « Nan mache a gen anpil moun moun yo ap achte legim ak fwi ti machann yo rele kliyan yo 
              yo di yo gen bon pri tan farin kòmanse tonbe »
            </p>
          </div>

          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 min-h-[120px]" 
                    placeholder="Ekri tèks la ak ponktiyasyon kòrèk isit..."></textarea>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            <strong>Konte:</strong> Konbyen fraz? _____
          </p>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-300 dark:border-green-700">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2 — Idantifye GS ak GP</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Souliye <strong>Gwoup Sijè</strong> a epi antoure <strong>Gwoup Predika</strong> a nan chak fraz.
          </p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-gray-700 dark:text-gray-300">1. Timoun yo ap chante nan lakou a.</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="GS: ________ | GP: ________" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-gray-700 dark:text-gray-300">2. Lapli te tonbe tout lannuit.</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="GS: ________ | GP: ________" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded">
              <p class="text-gray-700 dark:text-gray-300">3. Manje a santi bon anpil.</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="GS: ________ | GP: ________" />
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border border-purple-300 dark:border-purple-700">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3 — Chwazi Siy ki Kòrèk la</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Ranpli ak pwen (.), pwen entèwogasyon (?) oswa pwen esklamasyon (!).
          </p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">Ki lè klas la ap fini</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     placeholder="?" maxlength="1" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">Pa jete fatra atè</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     placeholder="?" maxlength="1" />
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded flex items-center justify-between">
              <span class="text-gray-700 dark:text-gray-300">Nou pral fè revizyon demen</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     placeholder="?" maxlength="1" />
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border border-orange-300 dark:border-orange-700">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4 — Detekte Erè yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Tèks sa a gen erè ponktiyasyon. Kòrije li:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-red-600 dark:text-red-400 italic">
              « mari ale nan mache li achte pen ak lèt li tounen lakay li manje yon bon dejene 
              èske ou vle ale avè l demen »
            </p>
          </div>

          <label class="font-semibold text-gray-700 dark:text-gray-300">Vèsyon Kòrije:</label>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[100px]" 
                    placeholder="Ekri vèsyon kòrèk la isit..."></textarea>
        </div>

        <div class="bg-teal-50 dark:bg-teal-950 p-6 rounded-lg border border-teal-300 dark:border-teal-700">
          <h3 class="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-3">Egzèsis 5 — Kreye Pwòp Fraz ou</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Ekri 5 fraz sou sijè « Yon bèl jounen nan lavi m ». Itilize diferan tip fraz:
          </p>
          
          <div class="space-y-3">
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">1. Fraz deklaratif (.)</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">2. Fraz entèwogatif (?)</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">3. Fraz ekslamatif (!)</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">4. Fraz konpoze (ak "epi")</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">5. Fraz ak subòdone (ak "paske")</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" />
            </div>
          </div>
        </div>

        <div class="bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border-l-4 border-indigo-500">
          <h3 class="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3">📺 Videyo pou Ale Pi Lwen</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Gade videyo a, note 3 règ ki ede w separe fraz yo nan nenpòt tèks.
          </p>
          <div class="bg-gray-700 p-2 rounded-lg text-center">
            <p class="text-gray-400 text-sm">[Videyo YouTube sou fraz yo]</p>
            <p class="text-gray-500 text-xs mt-1">URL: https://www.youtube.com/embed/0bQ7m3ZyHyc</p>
          </div>
        </div>

        <div class="text-center mt-6 p-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg">
          <p class="text-xl text-gray-800 dark:text-gray-200 font-semibold">
            🌟 Kontinye pratike chak jou: li, separe fraz yo, epi ekri pwòp fraz pa w!
          </p>
        </div>
      </div>
    `,
    duration: "60 minit",
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
    youtube_url: "https://www.youtube.com/watch?v=0bQ7m3ZyHyc",
    introduction: `
      <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-6 rounded-lg border-l-4 border-cyan-500">
        <h3 class="text-xl font-bold text-cyan-700 dark:text-cyan-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Lè yon mèt ba w plizyè konsiy nan menm tan, ki jan w fè pou w pa bliye okenn? Lè yon granmoun di w: 
          "Al fè sa, epi apre fè sa, men anvan sa fè lòt bagay," kijan w òganize tèt ou?
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          Nan vi chak jou, nou souvan resevwa <strong>konsiy konplèks</strong> — konsiy ki gen plizyè etap, konsiy ki gen kondisyon, 
          oswa konsiy ki mare ansanm. Nan leson sa a, n ap aprann kijan pou koute byen, òganize konsiy yo nan tèt nou, 
          epi egzekite yo nan bon lòd. Se yon kapasite enpòtan pou reyisi nan klas, nan travay, epi nan relasyon ak moun.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🤔 Reflechi</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Ki konsiy konplèks ou te resevwa nan dènye jou yo?</li>
            <li>Ki fason ou itilize pou pa bliye etap yo?</li>
            <li>Èske ou te janm mal konprann yon konsiy? Sa ki te rive?</li>
          </ul>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-5 rounded-lg border border-green-300 dark:border-green-700">
          <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 Objektif Aprantisaj</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Koute ak atansyon konsiy ki gen plizyè etap</li>
            <li>Idantifye etap ki prensipal yo ak etap ki segondè yo</li>
            <li>Kenbe konsiy yo nan memwa pou egzekite yo kòrèkteman</li>
            <li>Rekonèt kondisyon ak tan nan konsiy konplèks</li>
            <li>Poze kesyon pou klèsi lè konsiy la pa klè</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📚 Konprann Konsiy Konplèks</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">1. Sa ki Konsiy Konplèks?</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">Yon <strong>konsiy konplèks</strong> se yon konsiy ki:</p>
          <ul class="text-gray-700 dark:text-gray-300 space-y-2 ml-4 list-disc list-inside">
            <li>Gen <strong>plizyè etap</strong> ki dwe fèt nan yon lòd espesifik</li>
            <li>Gen <strong>kondisyon</strong> (si, lè, depi, jiskaske…)</li>
            <li>Gen <strong>chwa</strong> (oswa, swa… swa…)</li>
            <li>Gen <strong>limit tan</strong> (anvan, apre, pandan, jiskaske…)</li>
            <li>Gen <strong>plizyè objektif</strong> ki mare ansanm</li>
          </ul>

          <div class="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h4 class="text-blue-600 dark:text-blue-400 font-semibold mb-2">Egzanp konsiy senp vs konplèks</h4>
            <p class="text-gray-700 dark:text-gray-300 mb-2"><strong>Konsiy senp:</strong> « Al achte wòch nan boutik la. »</p>
            <p class="text-gray-700 dark:text-gray-300"><strong>Konsiy konplèks:</strong> « Anvan w al achte wòch, konte lajan ki nan bous ou. Si w gen ase lajan, al achte wòch ak kreyon. Men si ou pa gen ase, tounen lakay epi mande manman w pou lajan. »</p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">2. Estrateji pou Koute ak Kenbe Konsiy yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">Pou kapab swiv konsiy konplèks, ou bezwen:</p>
          
          <div class="space-y-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-600 dark:text-purple-400 mb-2">a) Koute ak tout kò ou</h4>
              <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm list-disc list-inside">
                <li>Retire distraksyon (telefòn, bri)</li>
                <li>Gade moun ki ap pale (li bouch, jes li)</li>
                <li>Poze tèt ou an plas: konsantre sou sa ou tande</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">b) Chèche mo kle yo</h4>
              <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">Mo sa yo endike lòd, kondisyon, tan:</p>
              <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4">
                <li><strong>Lòd:</strong> premye, dezyèm, apre, nan fen, an dènye, anvan</li>
                <li><strong>Kondisyon:</strong> si, lè, depi, jiskaske, jis nan tan</li>
                <li><strong>Tan:</strong> kounye a, imedyatman, pita, demen, avèk vitès</li>
                <li><strong>Chwa:</strong> oswa, swa... swa..., ni... ni...</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-teal-600 dark:text-teal-400 mb-2">c) Kreye yon ti lis mental</h4>
              <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">Nan tèt ou, ranje etap yo nan yon sekans:</p>
              <p class="text-gray-600 dark:text-gray-400 text-sm italic">
                « 1) Konte lajan<br/>
                2) Si gen ase → achte wòch ak kreyon<br/>
                3) Si pa gen ase → tounen lakay → mande lajan »
              </p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-600 dark:text-orange-400 mb-2">d) Poze kesyon pou klèsi</h4>
              <p class="text-gray-700 dark:text-gray-300 text-sm mb-2">Si ou pa konprann, pa pè mande:</p>
              <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm ml-4 list-disc list-inside">
                <li>« Èske mwen dwe fè sa premye? »</li>
                <li>« Ki lè mwen dwe fè sa? »</li>
                <li>« Si sa rive, kisa mwen dwe fè? »</li>
                <li>« Èske mwen ka chwazi ant de bagay? »</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">3. Kijan Idantifye Etap yo nan yon Konsiy Konplèks?</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Chak konsiy konplèks gen <strong>etap prensipal</strong> ak <strong>etap segondè</strong>. 
            Etap segondè yo se konsiy ki vini anba kondisyon oswa chwa.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Egzanp analiz konsiy:</p>
            <p class="text-gray-600 dark:text-gray-400 mb-3">
              « <strong>Al nan boutik la</strong> [etap 1], <strong>achete diri ak pwa</strong> [etap 2]. 
              <strong>Si boutik la pa gen diri</strong> [kondisyon], <strong>al chèche nan lòt boutik</strong> [etap segondè]. 
              <strong>Apre sa</strong> [tan], <strong>tounen lakay ou</strong> [etap 3]. »
            </p>
            <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>✅ Etap prensipal: 1) Al nan boutik, 2) Achete, 3) Tounen lakay</p>
              <p>⚠️ Etap segondè (sou kondisyon): Si pa gen diri → chèche lòt boutik</p>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">4. Rekonèt Kondisyon nan Konsiy</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Gen konsiy ki depann de yon kondisyon: si kondisyon an rive, ou fè yon bagay; 
            si li pa rive, ou fè yon lòt bagay.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-green-600 dark:text-green-400 mb-2">Kondisyon "Si..."</h4>
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                « <em>Si</em> lapli tonbe, <em>pa</em> soti nan lakou a. Men <em>si</em> solèy klere, ou ka al jwe. »
              </p>
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <h4 class="font-semibold text-red-600 dark:text-red-400 mb-2">Kondisyon "Lè..."</h4>
              <p class="text-gray-700 dark:text-gray-300 text-sm">
                « <em>Lè</em> w fini devwa ou, <em>al</em> ede manman w nan kay la. »
              </p>
            </div>
          </div>
        </div>

        <div class="bg-red-50 dark:bg-red-950 p-6 rounded-lg border-l-4 border-red-500">
          <h3 class="text-xl font-semibold text-red-700 dark:text-red-300 mb-3">5. Estrateji Egzekisyon Etap pa Etap</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">Lè w ap egzekite yon konsiy konplèks:</p>
          <ol class="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li><strong>Revize konsiy la</strong> — di li nan tèt ou nan lòd kòrèk</li>
            <li><strong>Kòmanse ak premye etap</strong> — pa kouri, fè tout etap nan bon lòd</li>
            <li><strong>Tcheke kondisyon yo</strong> — gade si kondisyon yo rive avan ou kontinye</li>
            <li><strong>Swiv lòd ki bay</strong> — respekte sekans la</li>
            <li><strong>Verifye w ap fè tout etap</strong> — pa bliye okenn etap</li>
            <li><strong>Si w pa ka fè yon etap</strong> — poze kesyon, mande èd</li>
          </ol>
          
          <div class="mt-4 bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg border border-yellow-300 dark:border-yellow-700">
            <h4 class="text-yellow-800 dark:text-yellow-200 font-semibold mb-2">💡 Konsèy</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              Si konsiy la long, ou ka ekri etap yo sou papye pou pa bliye. Menm nan klas, ou ka fè yon ti nòt rapid.
            </p>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border-l-4 border-indigo-500">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">📺 Videyo pou Ale Pi Lwen</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Gade videyo a, note 3 estrateji ki ede w kenbe konsiy yo nan tèt ou.
        </p>
      </div>

      <div class="mt-6 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 p-6 rounded-lg">
        <h3 class="text-xl font-semibold text-cyan-800 dark:text-cyan-200 mb-2">🌟 Sonje!</h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
          Pratike chak jou: koute byen nan klas, nan lakay, nan kominote a. Chak konsiy ou koute, 
          se yon chans pou w amelyore kapasite ou!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-300 dark:border-blue-700">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1 — Idantifye Etap yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Koute konsiy sa a, ekri etap prensipal yo ak etap segondè yo:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-gray-700 dark:text-gray-300 italic">
              « Anvan w al nan mache, pran yon sak epi mete lajan ou ladan li. Lè w rive nan mache, 
              al nan boutik pòm nan. Si yo gen diri, achte 2 kilo. Men si yo pa gen, al chèche nan boutik machann an. 
              Apre w fin achte, tounen lakay ou epi mete diri a nan depo. »
            </p>
          </div>
          
          <label class="font-semibold text-gray-700 dark:text-gray-300">Etap prensipal:</label>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[100px]" 
                    placeholder="Ekri etap yo..."></textarea>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-300 dark:border-green-700">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2 — Jwe Wòl</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Nan gwoup de: yon elèv ba lòt la yon konsiy konplèks (5 etap), epi elèv la dwe egzekite li kòrèkteman. 
            Chanje wòl yo.
          </p>
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              <strong>Idea pou konsiy:</strong> koman pou prepare yon sandwich, koman pou òganize liv yo, 
              koman pou fè yon eksperyans senp.
            </p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border border-purple-300 dark:border-purple-700">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3 — Chèche Kondisyon ak Chwa</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Nan konsiy yo, souliye mo ki endike kondisyon ak chwa:
          </p>
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="text-gray-700 dark:text-gray-300">a) « Si ou fini devwa ou, ou ka al jwe. Men si ou pa fini, ou dwe rete nan kay. »</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="Mo kondisyon..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="text-gray-700 dark:text-gray-300">b) « Swa ou vini jodi a, swa ou vini demen. »</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="Mo chwa..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded">
              <p class="text-gray-700 dark:text-gray-300">c) « Lè w fini manje, lave asyèt yo. Apre sa, si w gen tan, al ede papa w. »</p>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-2" 
                     placeholder="Mo kondisyon ak tan..." />
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border border-orange-300 dark:border-orange-700">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4 — Kreye Konsiy Konplèks</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Ekri yon konsiy konplèks (3-5 etap) pou youn nan sitiyasyon sa yo:
          </p>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 mb-3 space-y-1">
            <li>Kijan pou prepare yon ti dejene</li>
            <li>Kijan pou ranje yon chanm</li>
            <li>Kijan pou al nan yon kote ki lwen</li>
          </ul>
          <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 min-h-[120px]" 
                    placeholder="Ekri konsiy konplèks ou isit..."></textarea>
        </div>
      </div>
    `,
    duration: "60 minit",
    difficulty: "Intermediaire",
    category: "Kominikasyon Oral"
  },
  {
    id: 8,
    mois: "Desanm",
    title: "Tip fraz yo",
    description: "Idantifye tip fraz: deklaratif, entèwogatif, ekslamatif, enpératif",
    objectif: "Konnen epi itilize diferan tip fraz",
    youtube_url: "https://www.youtube.com/watch?v=0bQ7m3ZyHyc",
    introduction: `
      <div class="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950 p-6 rounded-lg border-l-4 border-slate-500">
        <h3 class="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">🎯 Objektif Leson an</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Kijan w ka di kèl tip fraz se yon fraz? Ki sa ki fè yon fraz se yon kesyon, yon lòt se yon lòd, 
          yon lòt ankò se yon deklarasyon?
        </p>
        <p class="text-gray-700 dark:text-gray-300">
          Nan lang kreyòl, gen <strong>kat tip fraz prensipal</strong> selon <em>objektif</em> ou <em>fonksyon</em> yo: 
          fraz ki <strong>deklare</strong> yon bagay, fraz ki <strong>poze kesyon</strong>, fraz ki <strong>eksprime emosyon</strong>, 
          ak fraz ki <strong>bay lòd oswa konsiy</strong>. Konnen tip fraz yo ap ede w li pi byen, ekri pi klè, 
          epi kominike pi efikas.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="bg-yellow-50 dark:bg-yellow-950 p-5 rounded-lg border border-yellow-300 dark:border-yellow-700">
          <h4 class="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">🤔 Reflechi</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Ki tip fraz ou itilize pi souvan nan chak jou?</li>
            <li>Ki siy ponktiyasyon ki endike yon kesyon? Yon lòd?</li>
            <li>Poukisa li enpòtan konnen tip fraz yo?</li>
          </ul>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-5 rounded-lg border border-green-300 dark:border-green-700">
          <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">🎯 Objektif Aprantisaj</h4>
          <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Rekonèt kat tip fraz prensipal yo</li>
            <li>Idantifye siy ponktiyasyon ki asosye ak chak tip</li>
            <li>Konprann itilizasyon chak tip fraz</li>
            <li>Kreye fraz nan chak kategori</li>
            <li>Itilize tip fraz yo kòrèkteman nan ekriti</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <h2 class="text-2xl font-bold text-primary mb-4">📝 Kat Tip Fraz Prensipal yo</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">1. Fraz Deklaratif (Fraz ki deklare)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Yon <strong>fraz deklaratif</strong> se yon fraz ki <em>bay enfòmasyon</em>, ki <em>deklare</em> yon bagay, 
            ki <em>di</em> yon reyalite, yon reyèl, oswa yon opinyon. Li fini ak yon <strong>pwen (.)</strong>.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <h4 class="text-blue-600 dark:text-blue-400 font-semibold mb-2">Karakteristik</h4>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm list-disc list-inside">
              <li>Li bay enfòmasyon san poze kesyon</li>
              <li>Li deklare yon fè, yon eta, yon aksyon</li>
              <li>Li fini ak <strong>pwen (.)</strong></li>
              <li>Li ka afirmatif: « Mwen li liv la. »</li>
              <li>Li ka negatif: « Mwen pa li liv la. »</li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Egzanp fraz deklaratif:</p>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 ml-4 list-disc list-inside">
              <li>« Ayiti gen anpil bèl plaj. »</li>
              <li>« Timoun yo ap jwe nan lakou a. »</li>
              <li>« Mwen renmen mizik konpa. »</li>
              <li>« Manman ap kwit manje a. »</li>
              <li>« Lekòl la ap gen vakans demen. »</li>
            </ul>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border-l-4 border-purple-500">
          <h3 class="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-3">2. Fraz Entèwogatif (Fraz ki poze kesyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Yon <strong>fraz entèwogatif</strong> se yon fraz ki <em>poze kesyon</em>, ki <em>mande enfòmasyon</em>. 
            Li fini ak yon <strong>pwen entèwogasyon (?)</strong>.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <h4 class="text-purple-600 dark:text-purple-400 font-semibold mb-2">Karakteristik</h4>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm list-disc list-inside">
              <li>Li mande enfòmasyon, sekirite, konfimasyon</li>
              <li>Li kòmanse ak <strong>ki, kisa, ki lè, ki kote, poukisa, kijan, kiyès</strong></li>
              <li>Li ka kòmanse ak <strong>Èske</strong> (pou kesyon repons wi/non)</li>
              <li>Li fini ak <strong>pwen entèwogasyon (?)</strong></li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Egzanp fraz entèwogatif:</p>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 ml-4 list-disc list-inside">
              <li>« Ki jan ou ye? »</li>
              <li>« Kisa w ap fè? »</li>
              <li>« Kiyès ki nan kay la? »</li>
              <li>« Ki lè klas la ap fini? »</li>
              <li>« Èske ou gen lajan? »</li>
              <li>« Poukisa w pa vini? »</li>
            </ul>
          </div>

          <div class="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg border border-indigo-300 dark:border-indigo-700">
            <h4 class="text-indigo-800 dark:text-indigo-200 font-semibold mb-2">⚠️ Remak</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              Nan kreyòl, kesyon "Èske..." gen de tip repons posib: <strong>Wi</strong> (afirmatif) oswa <strong>Non</strong> (negatif).
            </p>
          </div>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-950 p-6 rounded-lg border-l-4 border-yellow-500">
          <h3 class="text-xl font-semibold text-yellow-700 dark:text-yellow-300 mb-3">3. Fraz Ekslamatif (Fraz ki eksprime emosyon)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Yon <strong>fraz ekslamatif</strong> se yon fraz ki <em>eksprime emosyon</em> (kontantman, fache, soupris, admirasyon...). 
            Li fini ak yon <strong>pwen esklamasyon (!)</strong>.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <h4 class="text-yellow-600 dark:text-yellow-400 font-semibold mb-2">Karakteristik</h4>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm list-disc list-inside">
              <li>Li eksprime emosyon fò (jwa, fache, soupris, admirasyon)</li>
              <li>Li ka kòmanse ak <strong>Ala, Mèt Bondye, O, A</strong></li>
              <li>Li fini ak <strong>pwen esklamasyon (!)</strong></li>
              <li>Li ka gen ton anfle nan pwononsiyasyon</li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Egzanp fraz ekslamatif:</p>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 ml-4 list-disc list-inside">
              <li>« Ala bèl kay sa! » (admirasyon)</li>
              <li>« Mèt Bondye, lapli tonbe fò! » (soupris, laperèz)</li>
              <li>« Mwen kontan anpil! » (jwa)</li>
              <li>« Pa fè sa! » (òd/fache)</li>
              <li>« O, ki bèl! » (admirasyon)</li>
              <li>« A, mwen wè ou! » (rekonèt)</li>
            </ul>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border-l-4 border-green-500">
          <h3 class="text-xl font-semibold text-green-700 dark:text-green-300 mb-3">4. Fraz Enpératif (Fraz ki bay lòd/konsiy)</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-3">
            Yon <strong>fraz enpératif</strong> se yon fraz ki <em>bay lòd</em>, ki <em>mande</em> yon moun fè yon bagay, 
            ki <em>bay konsiy</em> oswa <em>priye</em>. Li ka fini ak yon <strong>pwen (.)</strong> oswa <strong>pwen esklamasyon (!)</strong>.
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <h4 class="text-green-600 dark:text-green-400 font-semibold mb-2">Karakteristik</h4>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 text-sm list-disc list-inside">
              <li>Li bay lòd, konsiy, priyè</li>
              <li>Gen de fòm: <strong>lòd dirèk</strong> ak <strong>priyè</strong></li>
              <li>Lòd dirèk: kòmanse dirèkteman ak vèb (san "ou", "w", "nou")</li>
              <li>Priyè: gen "tanpri", "souple", oswa ton ki dou</li>
              <li>Li ka fini ak (.) pou priyè oswa (!) pou lòd fò</li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
            <p class="text-gray-700 dark:text-gray-300 font-semibold mb-2">Egzanp fraz enpératif:</p>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-1"><strong>Lòd dirèk (fò):</strong></p>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 ml-4 list-disc list-inside mb-3">
              <li>« Fèmen pòt la! »</li>
              <li>« Chita la! »</li>
              <li>« Pa kouri! »</li>
            </ul>
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-1"><strong>Priyè/konsiy (dou):</strong></p>
            <ul class="text-gray-700 dark:text-gray-300 space-y-1 ml-4 list-disc list-inside">
              <li>« Tanpri, ede m souple. »</li>
              <li>« Se pou ou li byen. »</li>
              <li>« Vini isit. »</li>
            </ul>
          </div>

          <div class="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-300 dark:border-red-700">
            <h4 class="text-red-800 dark:text-red-200 font-semibold mb-2">⚠️ Remak</h4>
            <p class="text-gray-700 dark:text-gray-300 text-sm">
              Nan kreyòl, fraz enpératif souvan kòmanse dirèkteman ak vèb la san pwonon sijè. 
              Egzanp: « <em>Chita</em> la! » (oubyen « <em>W chita</em> la! » men se mwens komen).
            </p>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border-l-4 border-orange-500">
          <h3 class="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-3">5. Tablo Rezime: Tip Fraz, Siy, Fonksyon</h3>
          <div class="overflow-x-auto">
            <table class="w-full bg-white dark:bg-gray-800 rounded-lg">
              <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th class="p-3 text-left text-gray-700 dark:text-gray-300">Tip fraz</th>
                  <th class="p-3 text-left text-gray-700 dark:text-gray-300">Siy fen</th>
                  <th class="p-3 text-left text-gray-700 dark:text-gray-300">Fonksyon</th>
                </tr>
              </thead>
              <tbody class="text-gray-700 dark:text-gray-300">
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">Deklaratif</td>
                  <td class="p-3">Pwen (.)</td>
                  <td class="p-3">Bay enfòmasyon, deklare</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">Entèwogatif</td>
                  <td class="p-3">Pwen entèwogasyon (?)</td>
                  <td class="p-3">Poze kesyon, mande enfòmasyon</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">Ekslamatif</td>
                  <td class="p-3">Pwen esklamasyon (!)</td>
                  <td class="p-3">Eksprime emosyon (jwa, fache...)</td>
                </tr>
                <tr class="border-t border-gray-200 dark:border-gray-700">
                  <td class="p-3">Enpératif</td>
                  <td class="p-3">Pwen (.) oswa (!)</td>
                  <td class="p-3">Bay lòd, konsiy, priye</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-8 bg-indigo-50 dark:bg-indigo-950 p-6 rounded-lg border-l-4 border-indigo-500">
        <h3 class="text-xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">📺 Videyo pou Ale Pi Lwen</h3>
        <p class="text-gray-700 dark:text-gray-300 mb-3">
          Gade videyo a, note 4 tip fraz yo ak siy ponktiyasyon yo.
        </p>
      </div>

      <div class="mt-6 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900 dark:to-gray-900 p-6 rounded-lg">
        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">🌟 Sonje!</h3>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
          Pratike chak jou: ekri fraz nan diferan tip yo. Chak tip gen yon fonksyon espesyal nan kominikasyon!
        </p>
      </div>
    `,
    exemplesExercices: `
      <h2 class="text-2xl font-bold text-primary mb-4">✏️ Pratik ak Egzèsis</h2>
      
      <div class="space-y-6">
        <div class="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg border border-blue-300 dark:border-blue-700">
          <h3 class="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-3">Egzèsis 1 — Idantifye Tip Fraz yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Ekri tip fraz la (deklaratif, entèwogatif, ekslamatif, enpératif) pou chak fraz:
          </p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">a) « Ki jan ou ye? »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" 
                     placeholder="Tip fraz..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">b) « Mwen kontan wè ou. »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" 
                     placeholder="Tip fraz..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">c) « Ala bèl sa! »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" 
                     placeholder="Tip fraz..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">d) « Chita la souple. »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" 
                     placeholder="Tip fraz..." />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">e) « Ayiti gen anpil kilti. »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-48" 
                     placeholder="Tip fraz..." />
            </div>
          </div>
        </div>

        <div class="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-300 dark:border-green-700">
          <h3 class="text-lg font-semibold text-green-700 dark:text-green-300 mb-3">Egzèsis 2 — Ranpli Siy Ponktiyasyon</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Mete siy kòrèk la: (.), (?), oswa (!)
          </p>
          
          <div class="space-y-3">
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">a) « Ki lè w pral vini »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     maxlength="1" placeholder="?" />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">b) « Mwen fini devwa mwen »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     maxlength="1" placeholder="?" />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">c) « Pa kouri nan klas la »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     maxlength="1" placeholder="?" />
            </div>
            <div class="bg-white dark:bg-gray-800 p-4 rounded flex justify-between items-center">
              <span class="text-gray-700 dark:text-gray-300">d) « Ala bèl solèy »</span>
              <input type="text" class="border border-gray-300 dark:border-gray-600 rounded p-2 w-16 text-center" 
                     maxlength="1" placeholder="?" />
            </div>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950 p-6 rounded-lg border border-purple-300 dark:border-purple-700">
          <h3 class="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Egzèsis 3 — Kreye Fraz</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Ekri yon fraz nan chak kategori (4 fraz an total):
          </p>
          
          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">• Deklaratif:</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[60px]" 
                        placeholder="Ekri isit..."></textarea>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">• Entèwogatif:</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[60px]" 
                        placeholder="Ekri isit..."></textarea>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">• Ekslamatif:</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[60px]" 
                        placeholder="Ekri isit..."></textarea>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">• Enpératif:</label>
              <textarea class="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mt-2 min-h-[60px]" 
                        placeholder="Ekri isit..."></textarea>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg border border-orange-300 dark:border-orange-700">
          <h3 class="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Egzèsis 4 — Transfòme Fraz yo</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-4">
            Pran fraz deklaratif sa a epi transfòme l nan lòt tip yo:
          </p>
          
          <div class="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4">
            <p class="text-gray-700 dark:text-gray-300 font-semibold">Fraz orijinal (deklaratif):</p>
            <p class="text-gray-600 dark:text-gray-400 italic">« Timoun yo ap jwe nan lakou a. »</p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Transfòme an entèwogatif:</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" 
                     placeholder="Ki kote...?" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Transfòme an ekslamatif:</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" 
                     placeholder="Ala...!" />
            </div>
            <div>
              <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">Transfòme an enpératif:</label>
              <input type="text" class="w-full border border-gray-300 dark:border-gray-600 rounded p-2 mt-1" 
                     placeholder="Al jwe...!" />
            </div>
          </div>
        </div>
      </div>
    `,
    duration: "60 minit",
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
