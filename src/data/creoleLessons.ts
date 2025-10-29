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
    introduction: `<p>Mo nouvo ede nou eksprime tèt nou pi byen.</p>`,
    contenu: `<h2>Aprann Mo Nouvo</h2><p>Chak jou nou aprann mo nouvo.</p>`,
    exemplesExercices: `<p>Egzèsis: Ekri fraz avèk mo nouvo yo.</p>`,
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
    introduction: `<p>Kreyòl gen yon sistèm ekriti senp.</p>`,
    contenu: `<h2>Prensip Debaz</h2><p>Chak son gen yon sèl siy.</p>`,
    exemplesExercices: `<p>Pratik: Ekri mo swivan règ la.</p>`,
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
    introduction: `<p>Yon bon plan ede ou ekri pi byen.</p>`,
    contenu: `<h2>Etap yo</h2><p>Plan, brouyon, revizyon.</p>`,
    exemplesExercices: `<p>Pratik: Fè yon plan pou yon tèks.</p>`,
    duration: "45 minit",
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
