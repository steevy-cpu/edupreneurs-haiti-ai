export interface CreoleLesson {
  id: number;
  title: string;
  description: string;
  content: string;
  duration: string;
  difficulty: 'Debutant' | 'Intermediaire' | 'Avance';
  category: 'Lekti' | 'Kominikasyon Oral' | 'Gramè' | 'Vokabilè' | 'Òtograf' | 'Pwodiksyon Ekri';
}

export const creoleLessons7AF: CreoleLesson[] = [
  {
    id: 1,
    title: "Konpreyansyon tèks li",
    description: "Fòmile ide prensipal nan yon tèks epi poze kesyon sou yo",
    content: `# Konpreyansyon tèks li

## Objektif
Aprann fòmile ide prensipal nan yon tèks ou li epi poze kesyon sou yo.

## Aktivite
- Li tèks la ak atansyon
- Idantifye ide prensipal yo
- Fòmile kesyon sou sa ou li a
- Diskite avèk kamarad klas ou yo

## Egzèsis
Pratik li diferan kalite tèks epi rezime yo.`,
    duration: "45 minit",
    difficulty: "Debutant",
    category: "Lekti"
  },
  {
    id: 2,
    title: "Prezevasyon kominikasyon",
    description: "Prezante avèk koyerans ide esansyèl yo nan yon kominikasyon ou tande",
    content: `# Prezevasyon kominikasyon

## Objektif
Konprann epi prezante ide esansyèl yo nan yon kominikasyon oral.

## Aktivite
- Koute yon kominikasyon ak atansyon
- Idantifye pwen enpòtan yo
- Rezime mesaj la
- Pataje konpreyansyon ou

## Egzèsis
Pratik kouté epi rezime mesaj oral.`,
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
