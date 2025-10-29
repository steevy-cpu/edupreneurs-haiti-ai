export interface CreoleLesson {
  id: number;
  title: string;
  description: string;
  mois: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
  duration: string;
  difficulty: 'Debutant' | 'Intermediaire' | 'Avance';
  category: 'Lekti' | 'Kominikasyon Oral' | 'Gramè' | 'Vokabilè' | 'Òtograf' | 'Pwodiksyon Ekri';
}

export const creoleLessons7AF: CreoleLesson[] = [
  {
    id: 1,
    title: "Konpreyansyon tèks li",
    description: "Fòmile ide prensipal nan yon tèks epi poze kesyon sou yo",
    mois: "Fevriye",
    objectif: "Aprann fòmile ide prensipal nan yon tèks ou li epi poze kesyon sou yo pou amelyore konpreyansyon an lekti.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border-l-4 border-purple-500">
          <p class="text-lg italic">"Li se kle pou konn. Moun ki pa li se moun ki nan fènwa." - Pwovèb kreyòl</p>
        </div>
        
        <p class="text-lg leading-relaxed">Lè w ap li yon tèks, èske w jis gade mo yo youn apre lòt, oswa èske w reyèlman konprann mesaj la? Konprann yon tèks pa vle di sèlman konnen mo yo individuèlman, men se konprann <strong>ide jeneral la</strong>, sa otè a vle di nou.</p>
        
        <p>Panse sou sa: lè yon zanmi rakonte w yon istwa, ou pa sonje chak mo li di. Men ou sonje <strong>lesansyèl</strong>: kisa ki te pase, poukisa, kimoun ki te enplike, epi ki konsekans sa te genyen. Se menm bagay la pou yon tèks ekri!</p>
        
        <p>Nan leson sa a, n ap aprann <strong>kijan pou li yon tèks epi byen konprann li</strong>. N ap travay sou kòman pou nou ka identifye sa ki pi enpòtan, fòmile sa nan mo pa nou, epi poze bon kesyon ki ka ede nou konprann pi byen.</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objektif leson an / Objectifs de la leçon</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Aprann kijan pou li yon tèks ak atansyon (Comment lire attentivement un texte)</li>
            <li>Idantifye ide prensipal yo nan yon tèks (Identifier les idées principales)</li>
            <li>Fòmile kesyon sou sa w li a (Formuler des questions sur ce que tu as lu)</li>
            <li>Devlope refleksyon kritik (Développer une réflexion critique)</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. Kisa "konprann yon tèks" vle di? / Qu'est-ce que comprendre un texte?</h3>
          
          <p class="text-lg mb-4">Konprann yon tèks se plis pase jis konnen mo yo. Se konnen:</p>
          
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Kisa tèks la ap pale de?</strong> (De quoi parle le texte?) - Sijè jeneral la</li>
            <li><strong>Ki pi gwo ide otè a vle pataje?</strong> (Quelle est l'idée principale?) - Mesaj prensipal la</li>
            <li><strong>Ki enfòmasyon enpòtan yo?</strong> (Quelles sont les informations importantes?) - Detay esansyèl yo</li>
            <li><strong>Kisa sa vle di pou mwen?</strong> (Qu'est-ce que cela signifie pour moi?) - Aplikasyon pèsonèl</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Egzanp / Exemple</p>
            <p class="text-blue-800 dark:text-blue-300">Imajine w li sa a: <em>"Ti Jan te leve granmaten. Li te pran yon beny, li manje pen ak bannann, epi li ale lekòl."</em></p>
            <p class="text-blue-800 dark:text-blue-300 mt-2"><strong>Ide prensipal:</strong> Ti Jan te prepare l pou ale lekòl nan maten an. Pa nesesè sonje chak detay, men konprann sa ki te pase jeneral.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. Etap pou konprann yon tèks / Étapes pour comprendre un texte</h3>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Etap 1: Premye lekti rapid / Première lecture rapide</h4>
          <p>Anvan w plonje nan detay yo, fè yon <strong>premye lekti rapid</strong>. Objektif la se pou w gen yon lide jeneral sou sa tèks la ap pale de. Pa rete sou chak mo, li tèks la nòmalman.</p>
          
          <div class="border-l-4 border-green-500 pl-4 my-4">
            <p class="font-semibold">Kesyon pou poze tèt ou:</p>
            <ul class="list-disc ml-6 mt-2">
              <li>Ki sijè tèks la? (Quel est le sujet?)</li>
              <li>Ki kalite tèks sa ye? (istwa, enfòmasyon, lèt...) (Quel type de texte?)</li>
              <li>Ki moun k ap pale? (Qui parle?)</li>
            </ul>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Etap 2: Dezyèm lekti pwofon / Deuxième lecture approfondie</h4>
          <p>Kounye a, li tèks la <strong>pi dousman</strong>, avèk plis atansyon. Eseye idantifye mo kle yo ak enfòmasyon enpòtan yo.</p>
          
          <div class="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg my-4">
            <p class="font-semibold text-purple-900 dark:text-purple-200">✏️ Konsèy / Conseil</p>
            <p class="text-purple-800 dark:text-purple-300">Souliye oswa make pati enpòtan yo. Ekri ti nòt nan maj tèks la pou ede w sonje sa w konprann. (Souligne les parties importantes et prends des notes dans les marges.)</p>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Etap 3: Idantifye ide prensipal la / Identifier l'idée principale</h4>
          <p>Ide prensipal la se <strong>mesaj pi enpòtan nan tèks la</strong>. Souvan, li parèt nan premye oswa dènye fraz yon paragraf. Men tou, li ka kache anndan tèks la.</p>
          
          <p class="mt-3"><strong>Kijan pou jwenn li?</strong> Poze tèt ou kesyon sa a: <em>"Si m te dwe eksplike tèks sa a nan yon sèl fraz, ki sa m ta di?"</em></p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Etap 4: Poze kesyon / Poser des questions</h4>
          <p>Bon lektè toujou poze kesyon! Sa montre ou ap reflechi sou sa w li a.</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div class="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
              <p class="font-semibold text-orange-900 dark:text-orange-200">❓ Kesyon sou kontni an</p>
              <ul class="text-sm mt-2 space-y-1 text-orange-800 dark:text-orange-300">
                <li>• Kisa ki pase? (Que s'est-il passé?)</li>
                <li>• Poukisa sa rive? (Pourquoi?)</li>
                <li>• Ki kote sa pase? (Où?)</li>
                <li>• Ki lè sa rive? (Quand?)</li>
              </ul>
            </div>
            <div class="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg">
              <p class="font-semibold text-teal-900 dark:text-teal-200">🤔 Kesyon pou reflechi</p>
              <ul class="text-sm mt-2 space-y-1 text-teal-800 dark:text-teal-300">
                <li>• Èske m dakò ak otè a? (Suis-je d'accord?)</li>
                <li>• Sa rapòte ak lavi m? (Lien avec ma vie?)</li>
                <li>• Kisa m aprann? (Qu'ai-je appris?)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. Estrateji pou amelyore konpreyansyon / Stratégies pour améliorer la compréhension</h3>
          
          <div class="space-y-4">
            <div class="border-l-4 border-indigo-500 pl-4">
              <p class="font-semibold">1. Fè koneksyon (Faire des connexions)</p>
              <p>Konekte sa w ap li a ak sa w deja konnen. Èske w deja viv yon bagay konsa? Èske ou sonje yon lòt istwa ki sanble? (Relie le texte à tes expériences et connaissances.)</p>
            </div>
            
            <div class="border-l-4 border-indigo-500 pl-4">
              <p class="font-semibold">2. Vizualize (Visualiser)</p>
              <p>Eseye imajine nan tèt ou sa w ap li a. Kreye yon imaj mental. Si tèks la pale de yon moun k ap mache nan yon jaden, wè l nan tèt ou! (Crée des images mentales de ce que tu lis.)</p>
            </div>
            
            <div class="border-l-4 border-indigo-500 pl-4">
              <p class="font-semibold">3. Rezime (Résumer)</p>
              <p>Apre chak seksyon, poze epi di nan mo pa w sa ou fenk li a. Rezime nan 2-3 fraz. (Résume chaque section avec tes propres mots.)</p>
            </div>
            
            <div class="border-l-4 border-indigo-500 pl-4">
              <p class="font-semibold">4. Kestyone (Questionner)</p>
              <p>Pa aksepte tout bagay san w pa reflechi. Poze kesyon: "Poukisa otè a di sa? Kisa ki fè li enpòtan? Èske gen prèv?" (Ne lis pas passivement, pose des questions critiques.)</p>
            </div>
          </div>
          
          <p class="mt-6 italic">📹 Sijesyon YouTube: Chèche "Comment améliorer sa compréhension en lecture" oswa "Konpreyansyon lekti kreyòl" pou wè teknik adisyonèl.</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">4. Pratik avèk yon tèks egzanp / Pratique avec un texte exemple</h3>
          
          <div class="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg my-6">
            <p class="font-semibold mb-3">📖 Tèks egzanp / Texte exemple:</p>
            <p class="italic">"Ayiti se yon peyi ki rich nan kilti. Nou gen mizik nou (konpa, rasin), manje nou (diri ak pwa, griyó), ak lang pa nou (kreyòl). Chak jou, Ayisyen yo montre kouraj yo. Malere difikilte yo, yo pa janm bay legen. Se sa ki fè nou fò."</p>
          </div>
          
          <p class="font-semibold mt-4">Kesyon pou analize tèks sa a:</p>
          <ul class="list-disc ml-8 space-y-2 mt-2">
            <li><strong>Ki sijè tèks la?</strong> → Richès kiltirèl Ayiti (La richesse culturelle d'Haïti)</li>
            <li><strong>Ki ide prensipal la?</strong> → Ayiti gen yon kilti nik ak moun ki gen kouraj (Haïti a une culture unique et des gens courageux)</li>
            <li><strong>Ki egzanp ki bay?</strong> → Mizik, manje, lang (Musique, nourriture, langue)</li>
            <li><strong>Ki mesaj final la?</strong> → Reziyans Ayisyen yo (La résilience des Haïtiens)</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg">
          <h4 class="text-xl font-bold mb-4 text-green-800 dark:text-green-200">📝 Egzèsis Pratik / Exercices Pratiques</h4>
          
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p class="font-semibold text-lg mb-3">Egzèsis 1: Li epi rezime / Lire et résumer</p>
              <p class="mb-3">Li tèks sa a epi rezime l nan 2-3 fraz:</p>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded italic my-3">
                "Granmoun mwen yo te konn rakonte m istwa yo lè m te piti. Yo te pale de lavi nan mòn yo, de travay nan jaden, de fèt tradisyonèl yo. Kounye a se mwen ki responsab pou m kontinye tradisyon sa yo, pou m bay pitit mwen yo menm konesans sa a."
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2"><strong>Répons atann:</strong> Tèks la pale de enpòtans transmisyon tradisyon yo de yon jenerasyon a lòt.</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p class="font-semibold text-lg mb-3">Egzèsis 2: Idantifye ide prensipal / Identifier l'idée principale</p>
              <p class="mb-3">Nan tèks anba a, ki ide prensipal la?</p>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded italic my-3">
                "Lekòl enpòtan anpil. Li pèmèt timoun yo aprann li, ekri, konte. Men lekòl pa sèlman pou aprann liv yo. Se la timoun yo aprann viv ansanm, pataje, respekte lòt moun. Se la yo devlope kapasite yo pou yo ka bati avni yo."
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2"><strong>Répons:</strong> Lekòl enpòtan pa jis pou konesans akademik, men tou pou devlopman sosyal ak preparasyon pou lavi.</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p class="font-semibold text-lg mb-3">Egzèsis 3: Poze kesyon / Poser des questions</p>
              <p class="mb-3">Apre w li tèks sa a, poze 3 kesyon sou li:</p>
              <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded italic my-3">
                "Lanmè Karayib la bèl anpil. Dlo li klè kou kristal. Gen anpil pwason ak korèy. Men lanmè a an danje. Moun jete fatra ladan l, yo detwi korèy yo. Nou dwe pwoteje lanmè nou an pou jenerasyon k ap vini yo."
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-2"><strong>Egzanp kesyon:</strong></p>
              <ul class="list-disc ml-6 text-sm text-gray-600 dark:text-gray-400">
                <li>Poukisa lanmè a an danje? (Pourquoi la mer est en danger?)</li>
                <li>Kisa moun ap fè ki mal? (Que font les gens de mal?)</li>
                <li>Kòman nou ka pwoteje lanmè a? (Comment protéger la mer?)</li>
              </ul>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mt-6">
              <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💪 Defi / Défi</p>
              <p class="text-blue-800 dark:text-blue-300">Pran yon jounal oswa yon liv, li yon atik oswa yon chapit, epi eseye aplike tout teknik nou aprann yo. Ekri yon rezime kout epi pataje l ak yon kamarad. (Prends un journal ou un livre, applique toutes les techniques et partage ton résumé avec un camarade.)</p>
            </div>
          </div>
        </div>
      </div>
    `,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Lekti"
  },
  {
    id: 2,
    title: "Prezevasyon kominikasyon",
    description: "Prezante avèk koyerans ide esansyèl yo nan yon kominikasyon ou tande",
    mois: "Fevriye",
    objectif: "Konprann epi prezante ide esansyèl yo nan yon kominikasyon oral.",
    introduction: `<p>Leson sou kominikasyon oral</p>`,
    contenu: `# Prezevasyon kominikasyon

## Objektif
Konprann epi prezante ide esansyèl yo nan yon kominikasyon oral.

## Aktivite
- Koute yon kominikasyon ak atansyon
- Idantifye pwen enpòtan yo
- Rezime mesaj la
- Pataje konpreyansyon ou

## Egzèsis
Pratik kouté epi rezime mesaj oral.`,
    exemplesExercices: `<p>Egzèsis pratik</p>`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Kominikasyon Oral"
  },
  {
    id: 3,
    title: "Fraz la (rapèl)",
    description: "Idantifye fraz yo nan yon tèks",
    content: `# Fraz la

## Objektif
Rekonèt epi konprann estrikti fraz yo nan kreyòl.

## Kontni
- Sa ki yon fraz?
- Diferan tip fraz yo
- Eleman yon fraz

## Egzèsis
- Idantifye fraz nan tèks
- Kreye fraz ou menm
- Analize estrikti fraz`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Gramè"
  },
  {
    id: 4,
    title: "Akizisyon mo nouvo",
    description: "Aprann mo nouvo apati sitiyasyon done oswa lòt disiplin",
    content: `# Akizisyon mo nouvo

## Objektif
Elaji vokabilè ou avèk mo nouvo.

## Metòd
- Aprann mo nan kontèks
- Itilize mo nan fraz
- Konekte mo ak lòt disiplin

## Pratik
- Kreye lis mo
- Ekri fraz avèk mo nouvo
- Jwe jwèt vokabilè`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Vokabilè"
  },
  {
    id: 5,
    title: "Règ ekri kreyòl: 1 son = 1 siy",
    description: "Aplike prensip reprezantasyon son pa yon siy inik",
    content: `# Règ ekri kreyòl

## Prensip debaz
Nan kreyòl, chak son gen yon sèl siy pou reprezante li.

## Egzanp
- "k" toujou ekri "k" (pa "c" oswa "qu")
- "w" toujou ekri "w"
- "y" toujou ekri "y"

## Pratik
Ekri mo swivan règ sa yo pou evite konfizyon ak fransè.`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Òtograf"
  },
  {
    id: 6,
    title: "Òganizasyon pwodiksyon ekri",
    description: "Elabore plan pou òganize pwodiksyon ekri",
    content: `# Òganizasyon pwodiksyon ekri

## Etap yo
1. Chwazi sijè a
2. Fè yon plan
3. Òganize ide yo
4. Ekri brouyon
5. Revize

## Teknik
- Kreye plan detaye
- Itilize paragraf
- Asire koyerans`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 7,
    title: "Egzekisyon konsiy konplèks",
    description: "Swiv epi egzekite konsiy konplèks ou tande",
    content: `# Egzekisyon konsiy konplèks

## Objektif
Devlope kapasite pou konprann epi swiv enstriksyon detaye.

## Pratik
- Koute konsiy konplèks
- Poze kesyon si ou pa konprann
- Egzekite pa etap
- Verifye rezilta`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Kominikasyon Oral"
  },
  {
    id: 8,
    title: "Tip fraz yo",
    description: "Idantifye tip fraz: deklaratif, entèwogatif, ekslamatif, enpératif",
    content: `# Diferan tip fraz

## 1. Fraz deklaratif
Bay enfòmasyon: "Timoun nan ap li liv la."

## 2. Fraz entèwogatif
Poze kesyon: "Èske w ap vini?"

## 3. Fraz ekslamatif
Eksprime emosyon: "Ala bèl!"

## 4. Fraz enpératif
Bay lòd: "Fè devwa ou!"`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 9,
    title: "Mo ki gen plizyè sans",
    description: "Idantifye mo ki gen plizyè sans nan diferan kontèks",
    content: `# Mo polisemik

## Objektif
Konprann mo ki ka gen diferan siyifikasyon selon kontèks.

## Egzanp
- "Tab" = mèb oswa lis
- "Pye" = pati kò oswa mezi
- "Chapo" = rad oswa onè

## Pratik
Itilize mo sa yo nan diferan fraz.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Vokabilè"
  },
  {
    id: 10,
    title: "Konstitivan fraz la",
    description: "Dekoupe fraz an gwoup sijè ak gwoup predikat",
    content: `# Konstitivan fraz la

## Estrikti debaz
Fraz = Gwoup Sijè (GS) + Gwoup Predikat (GP)

## Egzanp
"Timoun nan (GS) ap jwe boul (GP)."

## Pratik
- Idantifye GS ak GP
- Kreye fraz ekilibre
- Konprann relasyon ant yo`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 11,
    title: "Mo otou yon tèm",
    description: "Regwoupe mo ki rapòte a yon tèm chwazi",
    content: `# Mo otou yon tèm

## Objektif
Devlope vokabilè tematik.

## Aktivite
- Chwazi yon tèm (egzanp: lekòl, lanmè)
- Fè lis tout mo ki gen rapò
- Kreye rezo mo
- Ekri tèks avèk mo sa yo

## Avantaj
Amelyore richès vokabilè ou.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Vokabilè"
  },
  {
    id: 12,
    title: "Konbinezon son ak Y ak W",
    description: "Repwodui konbinezon son ou tande ak Y ak W",
    content: `# Konbinezon son: Y ak W

## Son ak Y
- ya, ye, yi, yo, you
- ay, ey, oy, uy

## Son ak W
- wa, we, wi, wo, wou
- aw, ew, ow, ouw

## Pratik
Ekri mo ki gen son sa yo kòrèkteman.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Òtograf"
  },
  {
    id: 13,
    title: "Gwoup Nominal Sijè (GNS)",
    description: "Distenge Gwoup Nominal Sijè nan fraz",
    content: `# Gwoup Nominal Sijè

## Definisyon
GNS se pati fraz ki di ki moun oswa ki bagay k ap fè aksyon an.

## Konpozisyon
- Detèminan + Non
- Detèminan + Adjektif + Non
- Non sèl

## Egzanp
"Ti pitit la" nan "Ti pitit la ap dòmi."`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 14,
    title: "Pwovèb kreyòl",
    description: "Eksplike pwovèb epi ilistre yo ak egzanp",
    content: `# Pwovèb kreyòl

## Objektif
Konprann ak eksplike sajès tradisyonèl kreyòl.

## Egzanp pwovèb
- "Piti piti zwazo fè nich li"
- "Dèyè mòn gen mòn"
- "Chat echode pè dlo frèt"

## Aktivite
Eksplike siyifikasyon ak bay egzanp nan lavi.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Kominikasyon Oral"
  },
  {
    id: 15,
    title: "Advèb yo",
    description: "Idantifye diferan tip advèb epi anplwaye yo nan fraz",
    content: `# Advèb yo

## Tip advèb
1. Advèb tan: kounye a, demen, ayè
2. Advèb kote: la, isit, lwen
3. Advèb manyè: byen, mal, vit
4. Advèb kantite: anpil, twomp, ase

## Itilizasyon
Advèb modifye vèb, adjektif oswa lòt advèb.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 16,
    title: "Tèks korespondans",
    description: "Ekri diferan tip tèks korespondans: lèt, biyè, memo",
    content: `# Tèks korespondans

## Tip dokiman
1. **Lèt**: kominikasyon fòmèl oswa enfòmèl
2. **Biyè**: mesaj kout
3. **Memo**: nòt biwo

## Estrikti lèt
- Dat
- Salitasyon
- Kò lèt la
- Fòmil politès
- Siyati`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 17,
    title: "Detèminan yo",
    description: "Idantifye detèminan nan gwoup nominal",
    content: `# Detèminan yo

## Tip detèminan
- **Defini**: la, lan, a, an, nan, yo
- **Endefini**: yon, youn
- **Posesif**: mwen, ou, li, nou, yo
- **Demonstratif**: sa a, sa yo

## Fonksyon
Detèminan prezante non an nan fraz la.`,
    duration: "45 minit",
    difficulty: "Intermediaire",
    category: "Gramè"
  },
  {
    id: 18,
    title: "Lekti ekspresif",
    description: "Li tèks avèk ritm ak entonasyon ki bon",
    content: `# Lekti ekspresif

## Eleman enpòtan
- Ritm ak vitès
- Entonasyon
- Pwosonsiasyon klè
- Ekspresyon emosyon

## Pratik
- Li powèzi
- Li dyalòg
- Li tèks ak santiman`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Lekti"
  },
  {
    id: 19,
    title: "Kontraksiyon nan kreyòl",
    description: "Ekri kòrèkteman fòm kontrakte, mo konpoze ak non pwòp",
    content: `# Kontraksiyon ak òtograf patikilye

## Kontraksiyon kouran
- m + a = m'a → "m'ap"
- ou + a = w'a → "w'ap"
- li + a = l'a → "l'ap"

## Mo konpoze
Respekte règ kreyòl pou mo konpoze.

## Non pwòp
Ekri yo avèk lèt majiskil.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Òtograf"
  },
  {
    id: 20,
    title: "Sinonim, Omonim, Antonim",
    description: "Idantifye epi itilize sinonim, omonim ak antonim",
    content: `# Sinonim, Omonim, Antonim

## Sinonim
Mo ki gen menm sans: bèl / joli

## Omonim
Mo ki sone menm men ki gen sans diferan: ver (bèt) / vè (direksyon)

## Antonim
Mo ki gen sans opoze: gran / piti

## Pratik
Itilize yo pou anrichi vokabilè.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Vokabilè"
  },
  {
    id: 21,
    title: "Adjektif kalifikatif",
    description: "Itilize adjektif ki plase devan non ak sa ki plase apre non",
    content: `# Adjektif kalifikatif

## Pozisyon
1. **Anvan non**: bèl, bon, move, gran, piti
   Egzanp: "yon bèl papiyon"

2. **Apre non**: wouj, ble, long, kout
   Egzanp: "yon papiyon wouj"

## Akò
Adjektif la dakò ak non an.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 22,
    title: "Detèminan posesif",
    description: "Idantifye detèminan ki make posedan",
    content: `# Detèminan posesif

## Fòm yo
- mwen: "liv mwen" (mon livre)
- ou/w: "liv ou" (ton livre)
- li/l: "liv li" (son livre)
- nou/n: "liv nou" (notre livre)
- yo: "liv yo" (leur livre)

## Itilizasyon
Endike posedan yon bagay.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 23,
    title: "Fòmasyon mo",
    description: "Fòme lòt mo apati yon mo done",
    content: `# Fòmasyon mo

## Metòd
1. **Derivasyon**: ajoute prefiks oswa sifiks
2. **Konpozisyon**: konbine de mo
3. **Redoubleman**: repete mo oswa silàb

## Egzanp
- manje → manje (vèb) / manje (non)
- rouge → wouj → rouji (vin wouj)`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Vokabilè"
  },
  {
    id: 24,
    title: "Detèminan endefini",
    description: "Itilize detèminan endefini: chak, tout, plizyè, nenpòt",
    content: `# Detèminan endefini

## Lis prensipal
- chak: "chak timoun"
- tout: "tout moun"
- plizyè: "plizyè jou"
- nenpòt: "nenpòt ki kote"
- anpil: "anpil moun"
- kèk: "kèk moun"

## Itilizasyon
Endike kantite oswa jeneral.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 25,
    title: "Pwopozisyon sibòdone relatif",
    description: "Pwodui fraz ki gen pwopozisyon sibòdone relatif",
    content: `# Pwopozisyon sibòdone relatif

## Pwonon relatif
- ki: "Timoun ki ap jwe a"
- kote: "Kay kote m rete a"
- lè: "Lè m te piti"

## Estrikti
Fraz prensipal + Pwonon relatif + Pwopozisyon sibòdone

## Egzanp
"Se liv la ki sou tab la m vle."`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 26,
    title: "Pwopozisyon sibòdone sirkonstansyèl",
    description: "Pwodui fraz ak pwopozisyon sibòdone sirkonstansyèl",
    content: `# Pwopozisyon sibòdone sirkonstansyèl

## Konjòksyon
- **Tan**: pandan, lè, avan, apre, depi
- **Koz**: paske, akòz, kòm
- **Kondisyon**: si, sof si
- **Opozisyon**: byenke, malgre

## Egzanp
"M ap etidye pandan ou ap jwe."`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 27,
    title: "Vèb eta ak vèb aktivite",
    description: "Distenge ant vèb ki eksprime eta ak sa ki eksprime aktivite",
    content: `# Vèb eta ak vèb aktivite

## Vèb aktivite
Eksprime aksyon: kouri, manje, ekri, jwe

## Vèb eta
Eksprime kondisyon: ye, rete, sanble, genyen

## Diferans
- Aktivite: dinamik, ka wè aksyon an
- Eta: estatik, deskri sitiyasyon`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 28,
    title: "Konstitivan gwoup vèbal",
    description: "Idantifye eleman prensipal gwoup vèbal la",
    content: `# Gwoup vèbal

## Konpozisyon
1. **Vèb prensipal**: eleman santral
2. **Konpleman**: objè, atribi
3. **Modifikatè**: advèb

## Egzanp
"ap manje pen an vit"
- ap manje: vèb
- pen an: konpleman objè
- vit: advèb`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Gramè"
  },
  {
    id: 29,
    title: "Ekspresyon bezwen, gou, santiman",
    description: "Eksprime bezwen, gou, opinyon ak santiman alekri",
    content: `# Ekspresyon pèsonèl

## Domèn
1. **Bezwen**: Mwen bezwen..., Mwen ta renmen...
2. **Gou**: Mwen renmen..., Mwen pa renmen...
3. **Opinyon**: Mwen panse ke..., Nan lide mwen...
4. **Santiman**: Mwen kontan, Mwen tris

## Pratik
Ekri tèks pèsonèl ki eksprime sa ou santi.`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Pwodiksyon Ekri"
  },
  {
    id: 30,
    title: "Patisipasyon nan deba",
    description: "Patisipe nan deba ak kamarad, mèt oswa lòt moun",
    content: `# Patisipasyon nan deba

## Règ debaz
1. Koute lòt moun
2. Respekte opinyon diferan
3. Prezante lide klèman
4. Itilize agiman solid
5. Rete poli

## Estrikti entèvansyon
- Prezante pozisyon ou
- Bay agiman
- Repond objeksyon
- Konklizyon`,
    duration: "45 minit",
    difficulty: "Avance",
    category: "Kominikasyon Oral"
  }
];
