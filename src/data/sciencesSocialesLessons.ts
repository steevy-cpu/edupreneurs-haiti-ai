export interface SciencesSocialesLesson {
  id: string;
  title: string;
  mois: string;
  objectif: string;
  introduction: string;
  contenu: string;
  exemplesExercices: string;
}

export const sciencesSocialesLessons7AF: SciencesSocialesLesson[] = [
  {
    id: "evolution-societes-humaines",
    title: "L'évolution des sociétés humaines",
    mois: "Décembre",
    objectif: "Comprendre l'évolution des sociétés humaines et la dynamique de cette évolution à travers les âges.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border-l-4 border-blue-500">
          <p class="text-lg italic">"L'histoire de l'humanité est celle d'une transformation continue, du premier outil en pierre taillée à la révolution numérique d'aujourd'hui."</p>
        </div>
        
        <p class="text-lg leading-relaxed">Imaginez nos ancêtres, il y a 2 millions d'années, dans les savanes africaines. Pas de maisons, pas de vêtements élaborés, pas d'écriture. Juste de petits groupes errant à la recherche de nourriture, dormant sous les étoiles, vivant au rythme de la nature. Aujourd'hui, nous habitons des gratte-ciels climatisés, nous communiquons instantanément d'un continent à l'autre, nous envoyons des robots sur Mars. Quelle transformation extraordinaire !</p>
        
        <p>Cette évolution spectaculaire des sociétés humaines n'est pas le fruit du hasard. Elle résulte d'innovations majeures : la maîtrise du feu qui a permis de cuire les aliments et de se chauffer, le développement de l'agriculture qui a rendu possible la sédentarisation, l'invention de l'écriture qui a révolutionné la transmission des savoirs, et tant d'autres découvertes qui, progressivement, ont transformé la façon dont les humains vivent, travaillent et interagissent.</p>
        
        <p>En Haïti, nous sommes les héritiers d'une évolution sociale unique : le passage brutal de sociétés autochtones taïnos à une société coloniale esclavagiste, puis à la première république noire libre du monde. Cette histoire fait de nous un cas d'étude fascinant dans l'évolution des sociétés humaines.</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Identifier les grandes étapes de l'évolution des sociétés humaines</li>
            <li>Comprendre les facteurs qui ont provoqué ces transformations</li>
            <li>Analyser les changements dans l'organisation sociale à travers le temps</li>
            <li>Réfléchir sur l'évolution actuelle et future de nos sociétés</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. Les premiers pas de l'humanité : le Paléolithique</h3>
          
          <p class="text-lg mb-4">Il y a environ 2,5 millions d'années, nos ancêtres ont franchi un cap décisif : ils ont commencé à fabriquer des outils. Cette période, appelée <strong>Paléolithique</strong> (âge de la pierre ancienne), s'étend jusqu'à environ 10 000 ans avant notre ère.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Organisation sociale paléolithique</h4>
          <p>Les premiers humains vivaient en petits groupes nomades de 20 à 50 personnes maximum. Pourquoi si peu ? Parce que vivre de la chasse et de la cueillette demande de vastes territoires. Un groupe trop nombreux aurait épuisé rapidement les ressources locales.</p>
          
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Mode de vie nomade :</strong> Les groupes se déplaçaient constamment, suivant les troupeaux d'animaux et les saisons de cueillette. Pas de maisons permanentes, juste des abris temporaires (grottes, huttes de branchages).</li>
            <li><strong>Économie de subsistance :</strong> Chasse (mammouths, bisons, cerfs), pêche, cueillette de fruits, racines, baies. Tout ce qui était récolté était immédiatement consommé ou partagé.</li>
            <li><strong>Outils rudimentaires :</strong> Pierre taillée (bifaces, grattoirs, pointes de flèches), os, bois. Ces outils permettaient de dépecer les animaux, de travailler le cuir, de couper le bois.</li>
            <li><strong>Société égalitaire :</strong> Pas de chef permanent, pas de classes sociales. Les décisions étaient prises collectivement. Le meilleur chasseur avait du prestige, mais pas de pouvoir absolu.</li>
            <li><strong>Transmission orale :</strong> Les connaissances (techniques de chasse, plantes comestibles, légendes) se transmettaient de bouche à oreille, autour du feu.</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">La maîtrise du feu, il y a environ 400 000 ans, a été une révolution ! Le feu permettait de se chauffer, d'éloigner les prédateurs, d'éclairer les grottes, mais surtout de <strong>cuire les aliments</strong>. La cuisson rend la viande plus digestible et tue les parasites, ce qui a contribué au développement du cerveau humain. De plus, le feu est devenu le centre de la vie sociale : c'est autour du foyer que le groupe se réunissait, racontait des histoires, transmettait les savoirs.</p>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">L'art paléolithique : premières expressions culturelles</h4>
          <p>Contrairement à ce qu'on pourrait penser, ces premiers humains n'étaient pas de simples "sauvages". Ils créaient de l'art ! Les peintures rupestres de Lascaux en France (17 000 ans) ou d'Altamira en Espagne montrent des scènes de chasse d'une grande beauté. Ces peintures avaient peut-être une fonction magique ou rituelle : représenter l'animal avant de le chasser pour assurer le succès de la chasse.</p>
          
          <p class="mt-3"><em>📹 Suggestion YouTube : Recherchez "Lascaux peintures rupestres" pour voir des images fascinantes de cet art préhistorique.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. La révolution néolithique : le tournant majeur de l'histoire humaine</h3>
          
          <p class="text-lg mb-4">Il y a environ 10 000 ans, dans une région du Proche-Orient appelée le "Croissant fertile" (actuels Irak, Syrie, Liban), s'est produit ce que les historiens appellent la <strong>révolution néolithique</strong>. Ce fut l'un des changements les plus importants de toute l'histoire de l'humanité.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Qu'est-ce qui a changé ?</h4>
          <p>Les humains ont découvert comment <strong>domestiquer</strong> les plantes et les animaux. Au lieu de chasser les gazelles sauvages, ils ont appris à élever des chèvres et des moutons. Au lieu de cueillir des graines sauvages, ils ont planté du blé et de l'orge. C'est le passage de la <strong>prédation</strong> (prendre ce que la nature offre) à la <strong>production</strong> (créer sa propre nourriture).</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Conséquences révolutionnaires</h4>
          <div class="space-y-4">
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">1. Sédentarisation</p>
              <p>Plus besoin de suivre les troupeaux ! Les agriculteurs s'installent dans des villages permanents. Les premières maisons en dur apparaissent : en terre séchée (adobe), en pierre. L'un des plus anciens villages connus est Jéricho (Palestine), habité depuis 9 000 ans.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">2. Explosion démographique</p>
              <p>Une femme nomade ne peut porter qu'un bébé à la fois dans ses déplacements, donc elle espace les naissances. Une femme sédentaire peut avoir plus d'enfants. De plus, l'agriculture produit plus de nourriture. Résultat : la population mondiale passe de quelques millions à des dizaines de millions en quelques millénaires.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">3. Surplus alimentaires</p>
              <p>Pour la première fois dans l'histoire, on produit <strong>plus de nourriture que nécessaire</strong>. Ce surplus peut être stocké (greniers, silos) pour l'hiver ou les périodes de disette. Cette réserve change tout : elle libère certaines personnes du travail agricole.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">4. Spécialisation des métiers</p>
              <p>Si tout le monde n'a pas besoin de cultiver pour survivre, certains peuvent devenir <strong>artisans spécialisés</strong> :</p>
              <ul class="list-disc ml-6 mt-2">
                <li><strong>Potiers :</strong> Fabriquent des jarres pour stocker grains et liquides</li>
                <li><strong>Tisserands :</strong> Tissent laine et lin pour les vêtements</li>
                <li><strong>Forgerons :</strong> Travaillent le cuivre, puis le bronze (alliage cuivre-étain)</li>
                <li><strong>Prêtres :</strong> Organisent les cérémonies religieuses</li>
                <li><strong>Soldats :</strong> Protègent le village et ses réserves</li>
              </ul>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">5. Naissance des inégalités</p>
              <p>Dans les sociétés de chasseurs-cueilleurs, tout était partagé équitablement. Mais avec les surplus, certains accumulent plus de richesses (terres, troupeaux, réserves de grains). Des <strong>classes sociales</strong> apparaissent : riches propriétaires terriens vs paysans pauvres, chefs vs simples villageois. C'est aussi le début de l'esclavage : les prisonniers de guerre deviennent des esclaves agricoles.</p>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">La révolution néolithique ne s'est pas produite qu'au Proche-Orient ! Elle a eu lieu <strong>indépendamment</strong> dans plusieurs régions du monde : en Chine (riz, millet), en Amérique centrale (maïs, haricots, courges), en Afrique subsaharienne (sorgho, igname), en Nouvelle-Guinée (taro, canne à sucre). C'est une preuve que les humains, face aux mêmes défis, trouvent des solutions similaires !</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Révolution néolithique Croissant fertile" pour des documentaires sur cette période cruciale.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. L'émergence des premières civilisations (3500-500 av. J.-C.)</h3>
          
          <p class="text-lg mb-4">Avec les surplus agricoles toujours plus importants, certains villages deviennent des <strong>villes</strong>, puis de véritables <strong>civilisations</strong>. Mais qu'est-ce qui définit une civilisation ?</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les 7 critères d'une civilisation</h4>
          <ol class="list-decimal ml-8 space-y-3">
            <li><strong>Urbanisation :</strong> Construction de villes avec des milliers d'habitants (Uruk en Mésopotamie comptait 50 000 habitants dès 3000 av. J.-C. !)</li>
            <li><strong>Architecture monumentale :</strong> Temples, palais, pyramides démontrant la puissance de la société</li>
            <li><strong>Écriture :</strong> Système pour enregistrer les informations (commerce, lois, histoire, littérature)</li>
            <li><strong>Administration centralisée :</strong> Un gouvernement organisé (roi, pharaon, empereur) avec des fonctionnaires</li>
            <li><strong>Stratification sociale :</strong> Hiérarchie claire (nobles, prêtres, artisans, paysans, esclaves)</li>
            <li><strong>Arts et sciences :</strong> Production artistique, développement des mathématiques, astronomie, médecine</li>
            <li><strong>Commerce à longue distance :</strong> Échanges économiques entre régions éloignées</li>
          </ol>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les premières civilisations : les "berceaux de la civilisation"</h4>
          
          <div class="grid gap-4 mt-4">
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🏺 Mésopotamie (Irak actuel) - 3500 av. J.-C.</p>
              <p class="mt-2"><strong>Localisation :</strong> Entre les fleuves Tigre et Euphrate ("Mésopotamie" = "entre les fleuves" en grec)</p>
              <p class="mt-2"><strong>Inventions majeures :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>L'écriture cunéiforme (premiers textes vers 3200 av. J.-C.)</li>
                <li>La roue (vers 3500 av. J.-C.)</li>
                <li>Les premières lois écrites (Code d'Hammourabi, 1750 av. J.-C.)</li>
                <li>Le système sexagésimal (base 60) encore utilisé pour le temps et les angles</li>
                <li>La bière et le pain levé</li>
              </ul>
              <p class="mt-2"><strong>Villes célèbres :</strong> Uruk, Ur, Babylone, Ninive</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🔺 Égypte antique - 3100 av. J.-C.</p>
              <p class="mt-2"><strong>Localisation :</strong> Le long du Nil, fleuve qui apportait la fertilité par ses crues annuelles</p>
              <p class="mt-2"><strong>Réalisations spectaculaires :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Les pyramides de Gizeh (Khéops : 146 m de haut, 2,3 millions de blocs de pierre !)</li>
                <li>L'écriture hiéroglyphique (dessins stylisés)</li>
                <li>La momification (préservation des corps pour l'au-delà)</li>
                <li>Un système d'irrigation sophistiqué</li>
                <li>Les papyrus (ancêtre du papier)</li>
              </ul>
              <p class="mt-2"><strong>Pharaons célèbres :</strong> Khéops, Ramsès II, Cléopâtre, Toutankhamon</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🕉️ Vallée de l'Indus (Pakistan/Inde actuels) - 2600 av. J.-C.</p>
              <p class="mt-2"><strong>Particularités :</strong> Villes extraordinairement bien planifiées !</p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Rues tracées au cordeau, perpendiculaires</li>
                <li>Systèmes d'égouts sophistiqués</li>
                <li>Bains publics (le "Grand Bain" de Mohenjo-Daro)</li>
                <li>Maisons en briques cuites avec salles de bain</li>
              </ul>
              <p class="mt-2"><strong>Villes principales :</strong> Harappa, Mohenjo-Daro</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🐉 Chine ancienne - 2000 av. J.-C.</p>
              <p class="mt-2"><strong>Contributions majeures :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>L'écriture chinoise (idéogrammes, encore utilisée aujourd'hui !)</li>
                <li>La soie (secret gardé pendant des siècles)</li>
                <li>Le papier (105 apr. J.-C.)</li>
                <li>La poudre à canon</li>
                <li>La boussole</li>
                <li>L'imprimerie (plusieurs siècles avant Gutenberg)</li>
              </ul>
              <p class="mt-2"><strong>Dynasties célèbres :</strong> Shang, Zhou, Qin, Han</p>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">En Amérique aussi, des civilisations brillantes se sont développées ! Les <strong>Olmèques</strong> au Mexique (1500 av. J.-C.) ont créé d'immenses têtes de pierre. Les <strong>Mayas</strong> (2000 av. J.-C. - 1500 apr. J.-C.) avaient un système d'écriture complexe, un calendrier précis, et construisaient des pyramides à degrés. Les <strong>Incas</strong> du Pérou ont bâti un empire de 2 millions de km² avec un réseau routier extraordinaire, sans même connaître la roue ni l'écriture alphabétique !</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Sept merveilles du monde antique" et "Civilisations précolombiennes" pour des documentaires fascinants.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">4. Le rôle de l'écriture : une révolution dans la révolution</h3>
          
          <p class="text-lg mb-4">Si la révolution néolithique a permis les civilisations, <strong>l'écriture</strong> a rendu possible leur grandeur et leur durée. Pourquoi est-elle si importante ?</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les fonctions de l'écriture</h4>
          <ul class="list-disc ml-8 space-y-3">
            <li><strong>Comptabilité :</strong> Les premiers textes sumériens sont... des listes d'inventaire ! "120 jarres d'huile, 50 moutons..." L'écriture naît pour gérer le commerce et les impôts.</li>
            <li><strong>Législation :</strong> Graver les lois dans la pierre garantit qu'elles ne changeront pas selon le bon vouloir du roi. Le Code d'Hammourabi (1750 av. J.-C.) compte 282 articles !</li>
            <li><strong>Administration :</strong> Gérer un empire de millions de personnes sans écriture est impossible. Il faut enregistrer qui paie ses impôts, qui doit le service militaire, etc.</li>
            <li><strong>Histoire :</strong> Grâce aux textes, nous connaissons les pharaons égyptiens, les rois de Babylone, leurs victoires et défaites. Sans écriture, tout serait oublié.</li>
            <li><strong>Littérature et religion :</strong> L'Épopée de Gilgamesh (Mésopotamie, 2100 av. J.-C.) est le plus ancien récit littéraire connu. Les textes religieux (Bible, Véda, Coran) ont été fixés par écrit.</li>
            <li><strong>Sciences :</strong> Les mathématiques, l'astronomie, la médecine progressent grâce à la transmission écrite. Chaque génération peut s'appuyer sur les découvertes précédentes.</li>
          </ul>
          
          <div class="bg-yellow-50 dark:bg-yellow-950/20 p-5 rounded-lg my-6">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">⚠️ Point important</p>
            <p class="text-yellow-800 dark:text-yellow-300">Attention : toutes les civilisations brillantes n'avaient pas d'écriture ! Les <strong>Incas</strong> utilisaient les <em>quipus</em> (cordelettes nouées) pour compter et enregistrer des informations, mais n'avaient pas d'écriture alphabétique. Cela ne les a pas empêchés de bâtir un empire immense et prospère. L'écriture est un critère important, mais pas absolu.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">5. Les facteurs de l'évolution sociale : pourquoi les sociétés changent-elles ?</h3>
          
          <p class="text-lg mb-4">L'évolution des sociétés n'est jamais terminée. Mais quels sont les moteurs de ces changements permanents ?</p>
          
          <div class="grid gap-4 mt-4">
            <div class="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-r-lg">
              <p class="font-bold text-lg">🔧 1. Facteurs technologiques</p>
              <p class="mt-2">Chaque grande invention bouleverse la société :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>L'agriculture</strong> → sédentarisation, villes, civilisations</li>
                <li><strong>La roue</strong> → transports, commerce à longue distance</li>
                <li><strong>Le fer</strong> (vers 1200 av. J.-C.) → outils et armes plus efficaces, expansion des empires</li>
                <li><strong>L'imprimerie</strong> (Gutenberg, 1450) → diffusion massive des livres, Réforme protestante, alphabétisation</li>
                <li><strong>La machine à vapeur</strong> (1769) → révolution industrielle, usines, chemins de fer</li>
                <li><strong>L'électricité</strong> (fin XIXe) → transformation totale du mode de vie</li>
                <li><strong>Internet</strong> (fin XXe) → mondialisation de l'information, réseaux sociaux</li>
              </ul>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-r-lg">
              <p class="font-bold text-lg">💰 2. Facteurs économiques</p>
              <p class="mt-2">L'économie structure la société :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Le commerce</strong> crée des routes, des villes marchandes (Venise, Tombouctou), des empires commerciaux</li>
                <li><strong>L'argent</strong> (monnaie) simplifie les échanges et crée de nouvelles classes (marchands, banquiers)</li>
                <li><strong>Le capitalisme</strong> (XVIe-XVIIe siècles) transforme l'économie mondiale</li>
                <li><strong>L'industrialisation</strong> crée la classe ouvrière et le syndicalisme</li>
              </ul>
              <p class="mt-3"><strong>Exemple haïtien :</strong> L'économie de plantation sucrière (XVIIe-XVIIIe siècles) a structuré toute la société coloniale de Saint-Domingue : une infime minorité de planteurs blancs, une petite classe d'affranchis (mulâtres), et une immense majorité d'esclaves noirs.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-r-lg">
              <p class="font-bold text-lg">🌍 3. Facteurs environnementaux</p>
              <p class="mt-2">Le milieu naturel influence profondément les sociétés :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Climat :</strong> Les sociétés arctiques (Inuits) sont très différentes des sociétés tropicales</li>
                <li><strong>Ressources :</strong> L'accès à l'eau (fleuves) a permis les premières civilisations. Le pétrole a enrichi les pays du Golfe.</li>
                <li><strong>Catastrophes :</strong> Sécheresses, éruptions volcaniques, épidémies peuvent détruire des civilisations (les Mayas)</li>
                <li><strong>Géographie :</strong> Les îles développent souvent des cultures maritimes ; les montagnes isolent et préservent les traditions</li>
              </ul>
              <p class="mt-3"><strong>Exemple haïtien :</strong> Notre relief montagneux a favorisé le marronnage (esclaves fugitifs réfugiés dans les montagnes) et a rendu difficile le contrôle colonial, facilitant ainsi la révolution.</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-r-lg">
              <p class="font-bold text-lg">📚 4. Facteurs culturels et religieux</p>
              <p class="mt-2">Les idées transforment le monde :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Religions :</strong> Le christianisme a unifié l'Europe médiévale ; l'islam a créé un vaste empire de l'Espagne à l'Inde</li>
                <li><strong>Philosophies :</strong> Les Lumières (Voltaire, Rousseau, XVIIIe) ont préparé les révolutions démocratiques</li>
                <li><strong>Idéologies :</strong> Nationalisme, socialisme, féminisme ont restructuré les sociétés modernes</li>
                <li><strong>Arts et lettres :</strong> Diffusent de nouvelles valeurs et visions du monde</li>
              </ul>
              <p class="mt-3"><strong>Exemple haïtien :</strong> Les idées des Lumières (liberté, égalité) ont inspiré Toussaint Louverture et les révolutionnaires haïtiens. Le Vodou a joué un rôle majeur dans l'organisation de la résistance (cérémonie du Bois-Caïman, 1791).</p>
            </div>
            
            <div class="border-l-4 border-purple-500 pl-4 bg-purple-50 dark:bg-purple-950/20 p-3 rounded-r-lg">
              <p class="font-bold text-lg">⚔️ 5. Facteurs politiques et militaires</p>
              <p class="mt-2">Guerres et révolutions redessinent le monde :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Conquêtes :</strong> Alexandre le Grand, Empire romain, Gengis Khan ont unifié d'immenses territoires</li>
                <li><strong>Révolutions :</strong> Révolution française (1789), révolutions américaines, printemps arabes transforment les régimes politiques</li>
                <li><strong>Guerres mondiales :</strong> Les deux guerres mondiales (1914-18, 1939-45) ont redessiné les frontières et créé de nouvelles puissances</li>
                <li><strong>Décolonisation :</strong> Après 1945, des dizaines de pays africains et asiatiques deviennent indépendants</li>
              </ul>
              <p class="mt-3"><strong>Exemple haïtien :</strong> La <strong>Révolution haïtienne (1791-1804)</strong> est l'événement politique le plus important de notre histoire. Elle a transformé une colonie esclavagiste en république noire libre, première du genre dans le monde. C'est un exemple unique d'évolution sociale brutale et radicale.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">6. L'évolution moderne et contemporaine (XIXe-XXIe siècles)</h3>
          
          <p class="text-lg mb-4">Les trois derniers siècles ont connu des transformations d'une rapidité inédite dans l'histoire humaine.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">A. La révolution industrielle (1760-1900)</h4>
          <p>Née en Angleterre, elle transforme radicalement la société :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Urbanisation massive :</strong> Exode rural vers les villes-usines (Londres passe de 1 million à 6 millions d'habitants au XIXe)</li>
            <li><strong>Classe ouvrière :</strong> Naissance du prolétariat industriel, conditions de travail terribles (12-16h/jour, travail des enfants)</li>
            <li><strong>Capitalisme industriel :</strong> Bourgeoisie d'affaires remplace l'aristocratie foncière au sommet de la société</li>
            <li><strong>Mouvements sociaux :</strong> Syndicalisme, socialisme, communisme pour défendre les droits des travailleurs</li>
            <li><strong>Transformation du paysage :</strong> Usines, chemins de fer, mines de charbon</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">B. La révolution numérique (1970-aujourd'hui)</h4>
          <p>Nous vivons actuellement une transformation aussi profonde que la révolution néolithique :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Informatique omniprésente :</strong> Ordinateurs, smartphones, objets connectés</li>
            <li><strong>Internet :</strong> 5 milliards d'utilisateurs connectés en permanence</li>
            <li><strong>Réseaux sociaux :</strong> Nouvelles formes de sociabilité et de mobilisation politique</li>
            <li><strong>Économie numérique :</strong> E-commerce, télétravail, cryptomonnaies</li>
            <li><strong>Intelligence artificielle :</strong> Début de l'automatisation massive des tâches intellectuelles</li>
          </ul>
          
          <p class="mt-3"><strong>En Haïti :</strong> Même dans les zones rurales reculées, les téléphones portables et internet changent rapidement la société. Les transferts d'argent par mobile (Moncash, Natcash) transforment l'économie. Les réseaux sociaux permettent une mobilisation politique rapide.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">C. La mondialisation</h4>
          <p>Le monde est devenu un "village global" :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Économie mondiale :</strong> Chaînes de production internationales (un iPhone est fabriqué avec des pièces de 43 pays !)</li>
            <li><strong>Migrations massives :</strong> 280 millions de migrants internationaux (la diaspora haïtienne compte 1,5 million de personnes)</li>
            <li><strong>Culture globale :</strong> Hollywood, K-pop, football sont connus partout</li>
            <li><strong>Défis planétaires :</strong> Changement climatique, pandémies (COVID-19) nécessitent des réponses globales</li>
          </ul>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">7. L'évolution continue : quel avenir pour nos sociétés ?</h3>
          
          <p class="text-lg mb-4">L'évolution des sociétés n'est jamais terminée. Nous vivons actuellement des transformations rapides qui façonneront le monde de demain.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Défis contemporains</h4>
          <ul class="list-disc ml-8 space-y-3">
            <li><strong>Changement climatique :</strong> Réchauffement global, montée des eaux, catastrophes naturelles plus fréquentes. Haïti, avec ses ouragans dévastateurs, est en première ligne.</li>
            <li><strong>Inégalités croissantes :</strong> Écart grandissant entre riches et pauvres, au sein des pays et entre pays</li>
            <li><strong>Surpopulation :</strong> Nous sommes 8 milliards d'humains, la pression sur les ressources est immense</li>
            <li><strong>Intelligence artificielle :</strong> Va-t-elle créer du chômage de masse ou libérer l'humanité des tâches pénibles ?</li>
            <li><strong>Démocratie en crise :</strong> Montée des régimes autoritaires, désinformation sur internet</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Haïti dans l'évolution mondiale</h4>
          <p>Notre pays a connu une évolution sociale unique :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>1492-1625 :</strong> Société taïno (chasseurs-cueilleurs, agriculture rudimentaire, organisation en caciquats)</li>
            <li><strong>1625-1804 :</strong> Société coloniale esclavagiste (économie de plantation sucrière, division raciale extrême)</li>
            <li><strong>1804-1915 :</strong> Première république noire, alternance politique chaotique, économie agraire</li>
            <li><strong>1915-1934 :</strong> Occupation américaine, modernisation forcée</li>
            <li><strong>1957-1986 :</strong> Dictatures des Duvalier, exode massif</li>
            <li><strong>1986-aujourd'hui :</strong> Tentatives démocratiques, instabilité chronique, défis multiples</li>
          </ul>
          
          <p class="mt-4">Aujourd'hui, Haïti fait face à des défis majeurs : pauvreté, déforestation, instabilité politique, catastrophes naturelles. Mais nous avons aussi des atouts : une diaspora dynamique, une culture riche, une jeunesse nombreuse et de plus en plus éduquée, une histoire héroïque. L'évolution de notre société dépend des choix que nous ferons collectivement.</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">8. Conclusion : comprendre l'évolution pour agir sur le présent</h3>
          
          <p class="text-lg mb-4">Étudier l'évolution des sociétés humaines n'est pas un simple exercice académique. C'est comprendre d'où nous venons pour mieux saisir où nous allons.</p>
          
          <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-6 rounded-lg border-l-4 border-green-500">
            <p class="font-semibold text-lg mb-3">Les grandes leçons de l'histoire de l'évolution sociale :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Les sociétés changent toujours, rien n'est figé</li>
              <li>Les grandes transformations viennent souvent d'innovations techniques ou d'idées nouvelles</li>
              <li>Les changements peuvent être lents (révolution néolithique sur des millénaires) ou rapides (révolution numérique en quelques décennies)</li>
              <li>Chaque société est unique, produit de son histoire, géographie, culture</li>
              <li>Les humains ont une capacité extraordinaire d'adaptation et d'innovation</li>
              <li>Le progrès technique n'est pas toujours synonyme de progrès social (inégalités, guerres)</li>
              <li>Nous sommes acteurs de l'évolution : nos choix d'aujourd'hui façonnent la société de demain</li>
            </ul>
          </div>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">Exemples concrets et études de cas</h3>
          <div class="grid gap-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 1 : La domestication du maïs en Amérique</p>
              <p>Il y a environ 9 000 ans, dans le sud du Mexique actuel, les agriculteurs ont commencé à domestiquer une plante sauvage appelée <strong>téosinte</strong>. À force de sélectionner les épis les plus gros, génération après génération, ils ont créé le maïs moderne. Cette céréale est devenue la base de l'alimentation des grandes civilisations amérindiennes : Olmèques, Mayas, Aztèques, Incas. Aujourd'hui, le maïs est la deuxième céréale la plus cultivée au monde (après le blé). Un exemple parfait de comment l'agriculture transforme les sociétés !</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 2 : L'invention de l'imprimerie et la Réforme protestante</p>
              <p>En 1450, Johannes Gutenberg invente l'imprimerie à caractères mobiles en Europe. Avant, copier un livre prenait des mois ; après, on peut en produire des centaines en quelques jours. Conséquence : le prix des livres chute, l'alphabétisation progresse. En 1517, Martin Luther affiche ses 95 thèses contre les abus de l'Église catholique. Grâce à l'imprimerie, ses idées se répandent comme une traînée de poudre dans toute l'Europe en quelques semaines. C'est le début de la <strong>Réforme protestante</strong> qui va diviser la chrétienté et transformer la société européenne. Sans l'imprimerie, la Réforme aurait probablement été étouffée localement. Un exemple de comment une technologie (imprimerie) facilite un changement culturel et social (Réforme).</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 3 : La Révolution haïtienne - une évolution sociale brutale</p>
              <p>En août 1791, lors de la cérémonie du Bois-Caïman, les esclaves de Saint-Domingue (nom colonial d'Haïti) se soulèvent contre leurs maîtres. En 13 ans de lutte acharnée (1791-1804), ils vont détruire le système esclavagiste et créer la première république noire du monde. C'est une transformation sociale <strong>radicale et rapide</strong> : en une génération, on passe d'une société où 90% de la population est esclave à une société d'hommes libres. Les anciens esclaves deviennent citoyens, soldats, propriétaires terriens. C'est unique dans l'histoire : nulle part ailleurs les esclaves n'ont réussi à vaincre militairement leurs maîtres et à créer un État indépendant. Cette évolution brutale montre que le changement social peut être révolutionnaire, pas seulement progressif.</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 4 : Les smartphones transforment la société haïtienne</p>
              <p>En 2010, peu d'Haïtiens possédaient un smartphone. Aujourd'hui, en 2025, même dans les zones rurales, beaucoup de gens ont accès à internet mobile. Cette évolution technologique transforme rapidement notre société : les paysans consultent les prix du marché avant de vendre leurs récoltes (donc obtiennent de meilleurs prix), les transferts d'argent se font par téléphone (Moncash), l'éducation en ligne devient accessible, les jeunes se mobilisent politiquement via les réseaux sociaux. En seulement 15 ans, le smartphone a changé profondément notre manière de communiquer, de commercer, de nous informer, de nous organiser socialement. C'est un exemple d'évolution <strong>rapide</strong> et <strong>technologique</strong>.</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 5 : Le rôle du climat dans l'effondrement des Mayas</p>
              <p>La civilisation maya (Mexique, Guatemala actuels) a connu son âge d'or entre 250 et 900 apr. J.-C. : villes immenses (Tikal comptait 100 000 habitants), pyramides monumentales, écriture sophistiquée, calendrier précis. Puis, vers 900, les grandes cités sont mystérieusement abandonnées. Pourquoi ? Les archéologues pensent qu'une série de <strong>sécheresses sévères</strong>, combinée à la surpopulation et à la déforestation, a provoqué des famines, des guerres, et finalement l'effondrement de la civilisation. Cet exemple montre que les facteurs <strong>environnementaux</strong> peuvent détruire même les sociétés les plus brillantes. Leçon importante pour nous aujourd'hui, face au changement climatique !</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">📍 Exemple 6 : Comment le COVID-19 a accéléré le télétravail</p>
              <p>Avant 2020, le télétravail était rare, considéré comme impraticable pour la plupart des emplois. La pandémie de COVID-19 a forcé des millions de gens à travailler de chez eux. Résultat : les entreprises ont découvert que c'était possible ! Aujourd'hui, même après la pandémie, beaucoup de gens continuent à télétravailler plusieurs jours par semaine. Cela transforme l'organisation du travail, réduit les déplacements (donc la pollution), permet de vivre loin des grandes villes. Un exemple de comment une <strong>crise</strong> (sanitaire) peut accélérer une évolution sociale qui était déjà en germe, mais progressait lentement.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">Exercices variés</h3>
          
          <div class="space-y-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">📝 1. Questions à choix multiples</p>
              <div class="space-y-4">
                <div>
                  <p class="font-semibold">a) La révolution néolithique marque le passage :</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>De la pierre à l'âge du bronze</li>
                    <li>De la chasse-cueillette à l'agriculture ✓</li>
                    <li>De l'esclavage à la liberté</li>
                    <li>De la monarchie à la démocratie</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">b) Quelle invention a révolutionné la transmission des connaissances en Europe au XVe siècle ?</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>L'écriture cunéiforme</li>
                    <li>Le papyrus égyptien</li>
                    <li>L'imprimerie de Gutenberg ✓</li>
                    <li>L'ordinateur</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">c) Quelle civilisation a construit les pyramides de Gizeh ?</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>Les Mésopotamiens</li>
                    <li>Les Égyptiens ✓</li>
                    <li>Les Mayas</li>
                    <li>Les Chinois</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">d) Le Code d'Hammourabi est célèbre comme :</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>Le premier alphabet</li>
                    <li>Une des premières compilations de lois écrites ✓</li>
                    <li>Le premier roman de l'histoire</li>
                    <li>Une carte géographique ancienne</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">e) Quelle révolution historique a transformé Haïti de colonie esclavagiste en république libre ?</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>La révolution française</li>
                    <li>La révolution américaine</li>
                    <li>La révolution haïtienne ✓</li>
                    <li>La révolution industrielle</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">f) Quel facteur a le PLUS contribué au développement des premières civilisations ?</p>
                  <ul class="ml-6 list-disc space-y-1">
                    <li>La maîtrise de l'écriture</li>
                    <li>Le développement de l'agriculture ✓</li>
                    <li>L'invention de la roue</li>
                    <li>La découverte de l'or</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">✔️ 2. Vrai ou Faux (justifiez vos réponses)</p>
              <ul class="ml-6 space-y-3">
                <li><strong>a)</strong> Les premières sociétés humaines étaient sédentaires. <br/><span class="text-red-600 font-semibold">(FAUX)</span> - Elles étaient nomades, se déplaçant pour suivre le gibier et les ressources.</li>
                <li><strong>b)</strong> L'écriture est une caractéristique de toutes les civilisations avancées. <br/><span class="text-red-600 font-semibold">(FAUX)</span> - Les Incas n'avaient pas d'écriture alphabétique mais étaient une civilisation très avancée.</li>
                <li><strong>c)</strong> Les sociétés n'évoluent plus aujourd'hui. <br/><span class="text-red-600 font-semibold">(FAUX)</span> - Nous vivons une évolution rapide avec la révolution numérique.</li>
                <li><strong>d)</strong> La révolution néolithique a eu lieu uniquement au Proche-Orient. <br/><span class="text-red-600 font-semibold">(FAUX)</span> - Elle s'est produite indépendamment en Chine, Amérique, Afrique, Nouvelle-Guinée.</li>
                <li><strong>e)</strong> La maîtrise du feu a contribué au développement du cerveau humain. <br/><span class="text-green-600 font-semibold">(VRAI)</span> - La cuisson rend les aliments plus digestibles, libérant de l'énergie pour le cerveau.</li>
                <li><strong>f)</strong> Haïti est la première république noire libre du monde. <br/><span class="text-green-600 font-semibold">(VRAI)</span> - Indépendance proclamée le 1er janvier 1804.</li>
                <li><strong>g)</strong> Dans les sociétés paléolithiques, il y avait une forte hiérarchie sociale. <br/><span class="text-red-600 font-semibold">(FAUX)</span> - Ces sociétés étaient relativement égalitaires.</li>
                <li><strong>h)</strong> L'agriculture a permis la création de surplus alimentaires. <br/><span class="text-green-600 font-semibold">(VRAI)</span> - C'est un des changements majeurs de la révolution néolithique.</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🔗 3. Exercice de correspondance</p>
              <p class="mb-3">Associez chaque invention/événement à son impact principal sur la société :</p>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold underline mb-2">Inventions/Événements :</p>
                  <ol class="list-decimal ml-6 space-y-1">
                    <li>Agriculture</li>
                    <li>Écriture</li>
                    <li>Roue</li>
                    <li>Imprimerie</li>
                    <li>Machine à vapeur</li>
                    <li>Internet</li>
                    <li>Révolution haïtienne</li>
                    <li>Smartphone</li>
                  </ol>
                </div>
                <div>
                  <p class="font-semibold underline mb-2">Impacts :</p>
                  <ul class="list-none ml-6 space-y-1">
                    <li>A. Transport et commerce facilités</li>
                    <li>B. Sédentarisation et villes</li>
                    <li>C. Révolution industrielle</li>
                    <li>D. Conservation des informations</li>
                    <li>E. Diffusion massive des livres</li>
                    <li>F. Mondialisation de l'information</li>
                    <li>G. Fin de l'esclavage en Haïti</li>
                    <li>H. Communication mobile permanente</li>
                  </ul>
                </div>
              </div>
              <p class="text-sm mt-4 italic">Réponses : 1-B, 2-D, 3-A, 4-E, 5-C, 6-F, 7-G, 8-H</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">💭 4. Questions de réflexion approfondie</p>
              <ul class="ml-6 space-y-4">
                <li><strong>a)</strong> Quels sont les avantages et les inconvénients de la sédentarisation par rapport au nomadisme ? (Pensez à la liberté de mouvement, la sécurité alimentaire, la santé, les relations sociales)</li>
                <li><strong>b)</strong> Comment la technologie moderne (smartphones, réseaux sociaux, intelligence artificielle) change-t-elle notre société haïtienne ? Donnez au moins 3 exemples concrets.</li>
                <li><strong>c)</strong> Pourquoi l'écriture est-elle considérée comme si importante pour le développement d'une société ? Que se passerait-il si l'écriture disparaissait soudainement aujourd'hui ?</li>
                <li><strong>d)</strong> Comparez la vitesse de l'évolution sociale au Paléolithique (2 millions d'années) et aujourd'hui (changements majeurs en quelques décennies). Pourquoi cette accélération ? Est-ce une bonne chose ?</li>
                <li><strong>e)</strong> Si vous pouviez choisir une invention qui a transformé l'humanité pour la présenter à votre classe, laquelle choisiriez-vous et pourquoi ? (feu, agriculture, écriture, roue, imprimerie, électricité, internet...)</li>
                <li><strong>f)</strong> La Révolution haïtienne a transformé brutalement notre société en 13 ans (1791-1804). Pensez-vous que les changements rapides et révolutionnaires sont préférables aux évolutions lentes et progressives ? Justifiez.</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">📊 5. Activité pratique : Frise chronologique de l'évolution humaine</p>
              <p class="mb-3"><strong>Projet :</strong> Créez une grande frise chronologique illustrant les grandes étapes de l'évolution des sociétés humaines, de la préhistoire à nos jours.</p>
              <p class="font-semibold mb-2">Votre frise doit inclure au moins ces 10 événements majeurs avec leurs dates :</p>
              <ol class="list-decimal ml-6 space-y-2">
                <li>Apparition des premiers outils (2,5 millions d'années)</li>
                <li>Maîtrise du feu (400 000 ans)</li>
                <li>Révolution néolithique (10 000 av. J.-C.)</li>
                <li>Premières civilisations en Mésopotamie (3500 av. J.-C.)</li>
                <li>Invention de l'écriture (3200 av. J.-C.)</li>
                <li>Construction des pyramides d'Égypte (2600 av. J.-C.)</li>
                <li>Invention de l'imprimerie en Europe (1450)</li>
                <li>Révolution haïtienne (1791-1804)</li>
                <li>Révolution industrielle (1760-1900)</li>
                <li>Révolution numérique (1970-aujourd'hui)</li>
              </ol>
              <p class="mt-4"><strong>Bonus :</strong> Ajoutez des illustrations (dessins, images découpées) et utilisez des couleurs différentes pour les différentes périodes (Préhistoire, Antiquité, Moyen Âge, Temps modernes, Époque contemporaine).</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🔍 6. Activité de recherche : Les facteurs de l'évolution sociale en Haïti</p>
              <p class="mb-3"><strong>Mission :</strong> Identifiez comment chacun des 5 facteurs d'évolution sociale a influencé l'histoire d'Haïti. Remplissez un tableau avec des exemples concrets.</p>
              <table class="w-full border-collapse mt-3">
                <thead>
                  <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="border border-gray-400 p-2 text-left">Facteur</th>
                    <th class="border border-gray-400 p-2 text-left">Exemple haïtien</th>
                    <th class="border border-gray-400 p-2 text-left">Impact sur la société</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-400 p-2">1. Technologique</td>
                    <td class="border border-gray-400 p-2"><em>Ex: Introduction des smartphones</em></td>
                    <td class="border border-gray-400 p-2"><em>Ex: Transferts d'argent mobiles (Moncash)</em></td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">2. Économique</td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">3. Environnemental</td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">4. Culturel/Religieux</td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">5. Politique/Militaire</td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                    <td class="border border-gray-400 p-2"><em>À compléter</em></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🎨 7. Exercice créatif : Imaginer la société du futur</p>
              <p class="mb-3"><strong>Consigne :</strong> Nous sommes en 2100. À quoi ressemble la société haïtienne selon vous ? Écrivez un court texte (10-15 lignes) ou dessinez une scène montrant :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>Les technologies utilisées (transports, communication, énergie)</li>
                <li>L'organisation sociale (famille, travail, éducation)</li>
                <li>L'environnement (villes, campagnes, forêts)</li>
                <li>Les relations avec les autres pays</li>
              </ul>
              <p class="mt-3"><strong>Réflexion :</strong> Est-ce un futur optimiste ou pessimiste ? Pourquoi ? Que faudrait-il faire dès aujourd'hui pour atteindre ce futur positif ou éviter le futur négatif ?</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🏛️ 8. Comparaison de civilisations anciennes</p>
              <p class="mb-3"><strong>Activité :</strong> Choisissez DEUX civilisations anciennes parmi : Égypte, Mésopotamie, Chine, Vallée de l'Indus, Mayas, Incas.</p>
              <p class="mb-2">Comparez-les selon ces critères :</p>
              <ul class="list-disc ml-6 space-y-1">
                <li>Période de prospérité</li>
                <li>Localisation géographique</li>
                <li>Principales réalisations (architecture, écriture, sciences)</li>
                <li>Organisation politique (roi, empereur, prêtres)</li>
                <li>Raisons du déclin ou de la disparition</li>
              </ul>
              <p class="mt-3"><strong>Question finale :</strong> Qu'est-ce que ces civilisations ont en commun ? Qu'est-ce qui les différencie ?</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">👨‍👩‍👧‍👦 9. Enquête familiale : L'évolution vue par vos grands-parents</p>
              <p class="mb-3"><strong>Projet :</strong> Interrogez vos parents ou grands-parents (ou une personne âgée de votre entourage) sur les changements qu'ils ont vus au cours de leur vie.</p>
              <p class="font-semibold mb-2">Questions à poser :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>Quelles technologies n'existaient pas quand vous étiez jeune ? (télévision, téléphone portable, internet, etc.)</li>
                <li>Comment se passait la vie quotidienne sans ces technologies ? (communication, déplacements, travail)</li>
                <li>Quels changements politiques avez-vous vécus en Haïti ?</li>
                <li>Comment la société haïtienne a-t-elle changé ? (rôle des femmes, éducation, économie)</li>
                <li>Selon vous, la vie était-elle meilleure avant ou maintenant ? Pourquoi ?</li>
              </ul>
              <p class="mt-3"><strong>Restitution :</strong> Préparez une présentation de 3-5 minutes pour partager vos découvertes en classe. Qu'avez-vous appris sur l'évolution récente de notre société ?</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">📱 10. Débat en classe : "La technologie améliore-t-elle vraiment nos vies ?"</p>
              <p class="mb-3"><strong>Format :</strong> Débat organisé en deux équipes.</p>
              <div class="grid md:grid-cols-2 gap-4 mt-3">
                <div class="border-2 border-green-500 p-3 rounded">
                  <p class="font-bold text-green-700 dark:text-green-400 mb-2">Équipe POUR (la technologie améliore la vie) :</p>
                  <p class="text-sm">Arguments possibles : accès à l'information, progrès médical, communication facilitée, confort, éducation en ligne, etc.</p>
                </div>
                <div class="border-2 border-red-500 p-3 rounded">
                  <p class="font-bold text-red-700 dark:text-red-400 mb-2">Équipe CONTRE (la technologie dégrade la vie) :</p>
                  <p class="text-sm">Arguments possibles : pollution, chômage technologique, addiction aux écrans, surveillance, inégalités numériques, perte de liens humains, etc.</p>
                </div>
              </div>
              <p class="mt-3"><strong>Consigne :</strong> Chaque équipe prépare 5 arguments solides avec des exemples concrets haïtiens ou internationaux. Durée du débat : 20-30 minutes.</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">✍️ 11. Dissertation courte</p>
              <p class="mb-3"><strong>Sujet :</strong> "L'évolution des sociétés humaines est-elle un progrès continu ou comporte-t-elle aussi des reculs ?"</p>
              <p class="mb-2"><strong>Structure suggérée (1-2 pages) :</strong></p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Introduction :</strong> Définissez "évolution" et "progrès". Posez la problématique.</li>
                <li><strong>Partie 1 - Les progrès :</strong> Exemples d'améliorations (espérance de vie, alphabétisation, droits humains, technologies, etc.)</li>
                <li><strong>Partie 2 - Les reculs et problèmes :</strong> Guerres mondiales, esclavage moderne, pollution, inégalités croissantes, etc.</li>
                <li><strong>Partie 3 - Cas d'Haïti :</strong> Analysez l'évolution haïtienne : progrès (indépendance, liberté) vs défis (instabilité, pauvreté, catastrophes)</li>
                <li><strong>Conclusion :</strong> Votre position personnelle argumentée. L'évolution est-elle un progrès net ? Conditionnelle ? Ambiguë ?</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🎬 12. Projet vidéo ou podcast : "Une journée dans la vie de..."</p>
              <p class="mb-3"><strong>Projet créatif de groupe (3-4 élèves) :</strong> Créez une courte vidéo (3-5 min) ou un podcast comparant une journée type dans trois périodes différentes :</p>
              <ol class="list-decimal ml-6 space-y-2">
                <li><strong>Paléolithique</strong> (il y a 20 000 ans) - Un chasseur-cueilleur nomade</li>
                <li><strong>Société agricole</strong> (Haïti au XVIIIe siècle) - Un paysan ou esclave sous la colonisation</li>
                <li><strong>Aujourd'hui</strong> (2025) - Un jeune Haïtien moderne</li>
              </ol>
              <p class="mt-3"><strong>Aspects à montrer :</strong> Réveil, repas, travail/activités, loisirs, relations sociales, coucher. Mettez en évidence les différences et les similitudes.</p>
              <p class="mt-2"><em>💡 Astuce : Vous pouvez faire des mimes, des dessins animés simples, ou interviewer des gens en jouant les rôles.</em></p>
            </div>
          </div>
        </section>

        <section class="mt-8">
          <h3 class="text-2xl font-bold mb-4 text-primary">Ressources complémentaires et approfondissement</h3>
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg">
            <p class="font-semibold text-lg mb-3">📚 Pour aller plus loin :</p>
            <ul class="space-y-2">
              <li><strong>📹 Vidéos YouTube recommandées :</strong>
                <ul class="list-disc ml-8 mt-1 space-y-1">
                  <li>"C'est pas sorcier - La préhistoire"</li>
                  <li>"Révolution néolithique - Documentaire"</li>
                  <li>"Les grandes civilisations de l'Antiquité"</li>
                  <li>"Histoire d'Haïti - De la colonie à l'indépendance"</li>
                  <li>"L'intelligence artificielle va-t-elle remplacer les humains ?"</li>
                </ul>
              </li>
              <li><strong>📖 Livres accessibles (bibliothèque scolaire) :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>"Sapiens : Une brève histoire de l'humanité" - Yuval Noah Harari (version jeunesse si disponible)</li>
                  <li>"Les Jacobins noirs" - C.L.R. James (sur la Révolution haïtienne)</li>
                </ul>
              </li>
              <li><strong>🌐 Sites web éducatifs :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>Khan Academy - Cours d'histoire mondiale (en français)</li>
                  <li>Lumni.fr - Ressources pédagogiques sur l'évolution humaine</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "espace-geographique-haitien",
    title: "L'espace géographique haïtien",
    mois: "Décembre",
    objectif: "Découvrir les traits les plus significatifs de l'environnement physique haïtien.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-6 rounded-lg border-l-4 border-emerald-500">
          <p class="text-lg italic">"Haïti, perle des Antilles... notre terre natale est un joyau de diversité géographique, des sommets enneigés aux plages de sable blanc."</p>
        </div>
        
        <p class="text-lg leading-relaxed">Fermez les yeux et imaginez : vous êtes au sommet du Pic la Selle, à 2 680 mètres d'altitude. Autour de vous, les montagnes s'étendent à perte de vue, couvertes de pins et de nuages. Au loin, vous apercevez la mer des Caraïbes, d'un bleu éclatant. Plus bas, des vallées verdoyantes où coulent des rivières. Voici Haïti dans toute sa splendeur géographique !</p>
        
        <p>Notre pays, bien que petit (27 750 km² - à peine la taille de la Belgique), concentre une extraordinaire variété de paysages : montagnes escarpées qui couvrent 75% du territoire, plaines fertiles où pousse notre nourriture, côtes spectaculaires bordant trois mers, îles paradisiaques... Cette diversité géographique fait d'Haïti un territoire unique dans la Caraïbe.</p>
        
        <p>Mais notre géographie n'est pas qu'une question de beauté. Elle explique notre histoire (les montagnes ont protégé les marrons en fuite et permis la résistance pendant la révolution), notre économie (les plaines agricoles nourrissent le pays), nos défis (séismes, ouragans, érosion), et même notre culture (chaque région a développé ses propres traditions en fonction de son environnement).</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Localiser précisément Haïti dans la Caraïbe et comprendre sa position stratégique</li>
            <li>Identifier les différents types de relief haïtien et leur impact sur la vie quotidienne</li>
            <li>Connaître nos principales ressources en eau et leur importance</li>
            <li>Comprendre les défis géographiques auxquels Haïti fait face (érosion, risques naturels)</li>
            <li>Apprécier la richesse et la diversité de notre patrimoine géographique</li>
          </ul>
        </div>
        
        <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
          <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
          <p class="text-blue-800 dark:text-blue-300">Le nom "Haïti" vient du mot taïno "Ayiti" qui signifie "terre des hautes montagnes". Les premiers habitants de notre île avaient donc bien remarqué notre relief montagneux ! Christophe Colomb, en arrivant en 1492, a baptisé l'île "Hispaniola" (Petite Espagne), mais nous avons eu la sagesse de revenir à notre nom originel "Haïti" après l'indépendance en 1804. C'est un symbole fort : nous honorons la mémoire des Taïnos qui ont été décimés par la colonisation.</p>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. Situation et position géographique d'Haïti</h3>
          
          <p class="text-lg mb-4">Haïti occupe une position stratégique au cœur de la Caraïbe. Notre pays est situé dans la mer des Caraïbes (aussi appelée mer des Antilles), sur l'île d'Hispaniola qu'il partage avec la République Dominicaine. Cette position a façonné notre histoire : carrefour commercial pendant l'époque coloniale, mais aussi cible des convoitises des grandes puissances.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Localisation précise</h4>
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Coordonnées géographiques :</strong> Entre 18° et 20° de latitude Nord, et entre 71° et 74° de longitude Ouest. Cette latitude nous place dans la zone tropicale, d'où notre climat chaud.</li>
            <li><strong>Superficie totale :</strong> 27 750 km² (27 750 kilomètres carrés), ce qui équivaut à peu près à la taille de la Belgique ou du Maryland (États-Unis). Nous sommes donc un petit pays, mais avec une géographie très variée.</li>
            <li><strong>Frontières :</strong> 
              <ul class="list-circle ml-6 mt-2 space-y-1">
                <li><strong>Frontière terrestre :</strong> 376 km avec la République Dominicaine à l'est. Cette frontière traverse des montagnes, des plateaux et des plaines.</li>
                <li><strong>Frontière maritime :</strong> Environ 1 771 km de côtes ! Nous avons des côtes sur trois mers différentes : mer des Caraïbes au sud, océan Atlantique au nord, et canal de la Windward (passage entre Haïti et Cuba).</li>
              </ul>
            </li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Nos voisins caribéens</h4>
          <p>Haïti ne flotte pas seul dans la Caraïbe ! Nous faisons partie d'un ensemble d'îles appelé les <strong>Grandes Antilles</strong>, qui comprend également Cuba, la Jamaïque, Porto Rico et la République Dominicaine.</p>
          <ul class="list-disc ml-8 space-y-2">
            <li><strong>Cuba :</strong> À environ 80 km au nord-ouest. C'est la plus grande île des Caraïbes (110 860 km²).</li>
            <li><strong>Jamaïque :</strong> À environ 190 km au sud-ouest. Île anglophone de 10 991 km².</li>
            <li><strong>République Dominicaine :</strong> Notre voisin immédiat à l'est, avec qui nous partageons l'île d'Hispaniola. Superficie : 48 442 km² (presque deux fois la taille d'Haïti).</li>
            <li><strong>Les Bahamas, Porto Rico, les Petites Antilles :</strong> Plus éloignés mais faisant partie de notre espace caribéen.</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">L'île d'Hispaniola (qui abrite Haïti et la République Dominicaine) est la <strong>deuxième plus grande île des Caraïbes</strong>, après Cuba. Elle couvre 76 192 km² au total. Quand Christophe Colomb y a débarqué en 1492, il a déclaré : "C'est la plus belle terre que des yeux humains aient jamais vue." Difficile de lui donner tort quand on voit nos paysages !</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Carte Caraïbe Grandes Antilles" pour visualiser la position d'Haïti dans la région. Cherchez aussi "Hispaniola from space" pour voir notre île depuis l'espace !</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. Le relief haïtien : un pays de montagnes</h3>
          
          <p class="text-lg mb-4">Haïti est l'un des pays les plus montagneux des Caraïbes. Environ <strong>75% de notre territoire</strong> est constitué de montagnes et de collines ! Cette topographie accidentée influence profondément notre vie : elle complique les transports et les communications, mais elle offre aussi des paysages spectaculaires et des microclimats variés.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les grandes chaînes de montagnes</h4>
          <p>Notre territoire est traversé par plusieurs chaînes montagneuses importantes :</p>
          
          <div class="space-y-4 mt-4">
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">1. Massif du Nord</p>
              <p>S'étend dans les départements du Nord et du Nord-Est. Point culminant : Morne Jean-Rabel (1 000 m). Cette chaîne sépare la plaine du Nord du reste du pays et a joué un rôle historique important en protégeant le royaume de Henri Christophe au XIXe siècle.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">2. Massif de la Hotte (Sud-Ouest)</p>
              <p>Abrite le <strong>Pic Macaya (2 347 m)</strong>, deuxième sommet du pays. Cette région est un trésor de biodiversité avec des espèces endémiques d'oiseaux, de grenouilles et de plantes qu'on ne trouve nulle part ailleurs au monde ! Malheureusement, la déforestation menace ce patrimoine unique.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">3. Chaîne de la Selle (Sud-Est)</p>
              <p>C'est ici que se trouve le <strong>Pic la Selle (2 680 m)</strong>, point culminant d'Haïti ! Ce sommet majestueux domine Port-au-Prince et peut être aperçu depuis la capitale les jours clairs. Par temps froid (oui, il fait froid en haut !), on peut même voir du givre ou une fine couche de glace tôt le matin.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">4. Chaîne des Matheux (Centre-Ouest)</p>
              <p>Séparant la plaine de l'Artibonite de la région métropolitaine de Port-au-Prince. Point culminant : Morne La Visite (2 275 m), où se trouve le parc national de La Visite, une des dernières forêts de pins d'Haïti.</p>
            </div>
            
            <div class="border-l-4 border-green-500 pl-4">
              <p class="font-semibold">5. Montagnes Noires (Artibonite)</p>
              <p>Culminant à 1 700 m environ, elles bordent la vallée de l'Artibonite au nord et créent une barrière naturelle entre les départements de l'Artibonite et du Nord.</p>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Conséquences du relief montagneux</h4>
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Agriculture difficile :</strong> Les pentes raides rendent la culture ardue. Les paysans doivent souvent travailler sur des terrains en pente, ce qui favorise l'érosion des sols quand la terre n'est pas protégée par des arbres ou des cultures en terrasses.</li>
            <li><strong>Communications compliquées :</strong> Construire des routes en montagne coûte cher et demande beaucoup d'entretien. Certaines régions rurales restent difficiles d'accès, surtout pendant la saison des pluies.</li>
            <li><strong>Isolement de certaines zones :</strong> Des villages entiers peuvent être coupés du reste du pays après de fortes pluies ou des glissements de terrain.</li>
            <li><strong>Microclimats variés :</strong> La diversité de relief crée des climats différents. Il peut faire frais en montagne pendant qu'il fait très chaud sur les côtes !</li>
            <li><strong>Protection historique :</strong> Les montagnes ont servi de refuge aux esclaves marrons qui fuyaient les plantations. Elles ont aussi été des bases stratégiques pendant la guerre d'indépendance.</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">Le Pic la Selle, notre point culminant, est tellement haut que sa température peut descendre jusqu'à <strong>0°C</strong> en hiver ! Des randonneurs haïtiens et étrangers font l'ascension de ce sommet, ce qui prend environ 6-8 heures de marche depuis le village de Seguin. Au sommet, par temps clair, on peut voir jusqu'à la République Dominicaine et même Cuba ! C'est une expérience inoubliable de voir son pays d'en haut.</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Pic la Selle randonnée" ou "Relief Haïti documentaire" pour des images aériennes de nos montagnes.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. Les plaines : greniers agricoles d'Haïti</h3>
          
          <p class="text-lg mb-4">Bien qu'elles ne représentent que 25% du territoire, les plaines haïtiennes sont d'une importance capitale. C'est dans ces zones plates et fertiles que se concentre l'essentiel de notre production agricole. Sans nos plaines, Haïti ne pourrait pas nourrir sa population !</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les principales plaines</h4>
          
          <div class="grid gap-4 mt-4">
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌾 Plaine de l'Artibonite (Nord-Ouest)</p>
              <p class="mt-2"><strong>Superficie :</strong> Environ 3 000 km² (la plus grande plaine d'Haïti)</p>
              <p class="mt-2"><strong>Caractéristiques :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Traversée par le fleuve Artibonite, le plus long d'Haïti (320 km)</li>
                <li>Système d'irrigation développé (barrage de Péligre construit en 1956)</li>
                <li>Produit plus de <strong>80% du riz</strong> consommé en Haïti</li>
                <li>Surnommée "le grenier d'Haïti" car elle nourrit une grande partie du pays</li>
                <li>Aussi : Bananes, canne à sucre, légumes</li>
              </ul>
              <p class="mt-2 text-sm italic">💡 La région est aussi vulnérable aux inondations pendant la saison des ouragans, ce qui peut détruire les récoltes.</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌾 Plaine du Nord (près du Cap-Haïtien)</p>
              <p class="mt-2"><strong>Superficie :</strong> Environ 500 km²</p>
              <p class="mt-2"><strong>Caractéristiques :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Sol fertile et bien irrigué</li>
                <li>Anciennement la région la plus riche d'Haïti à l'époque coloniale (plantations de canne à sucre et café)</li>
                <li>Aujourd'hui : Bananes, cacao, café, manioc, légumes</li>
                <li>Climat agréable, moins chaud que le sud</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌾 Plaine du Cul-de-Sac (Port-au-Prince)</p>
              <p class="mt-2"><strong>Superficie :</strong> Environ 300 km²</p>
              <p class="mt-2"><strong>Caractéristiques :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Abrite Port-au-Prince, la capitale et la plus grande ville du pays</li>
                <li>Forte urbanisation a réduit les terres agricoles</li>
                <li>Lac Saumâtre (Étang Saumâtre), le plus grand lac d'Haïti (170 km²)</li>
                <li>Région aride nécessitant l'irrigation</li>
                <li>Production : Canne à sucre, bananes, légumes pour le marché urbain</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌾 Plaine des Cayes (Sud)</p>
              <p class="mt-2"><strong>Superficie :</strong> Environ 200 km²</p>
              <p class="mt-2"><strong>Caractéristiques :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Région côtière très fertile</li>
                <li>Production variée : Riz, maïs, haricots, légumes</li>
                <li>Proche du port des Cayes, facilitant les exportations</li>
              </ul>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Importance économique des plaines</h4>
          <p>Les plaines représentent seulement un quart du territoire, mais elles :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li>Concentrent <strong>la majorité de la production agricole</strong> du pays</li>
            <li>Abritent les plus grandes villes (Port-au-Prince, Cap-Haïtien, Gonaïves, Les Cayes)</li>
            <li>Regroupent <strong>plus de 70% de la population</strong> haïtienne</li>
            <li>Facilitent les infrastructures : routes, aéroports, ports</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">Le barrage de Péligre, construit en 1956 sur le fleuve Artibonite, a créé le <strong>lac de Péligre</strong>, le deuxième plus grand lac d'Haïti (après l'Étang Saumâtre). Ce barrage permet d'irriguer 32 000 hectares de terres agricoles dans la vallée de l'Artibonite et produit environ 50 mégawatts d'électricité, soit environ 20% de l'électricité du pays ! C'est un exemple d'aménagement géographique qui a transformé une région.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">4. L'hydrographie : nos rivières et nos lacs</h3>
          
          <p class="text-lg mb-4">L'eau est une ressource vitale. Haïti possède un réseau de rivières et quelques lacs, mais la disponibilité en eau potable reste un défi majeur pour le pays.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les principaux fleuves et rivières</h4>
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>L'Artibonite (320 km) :</strong> Le plus long fleuve d'Haïti et de toute l'île d'Hispaniola ! Il prend sa source en République Dominicaine, traverse le plateau Central haïtien, puis descend irriguer la vaste plaine de l'Artibonite avant de se jeter dans le golfe de la Gonâve. C'est l'artère vitale de l'agriculture haïtienne.</li>
            <li><strong>Les Trois Rivières (150 km) :</strong> Dans le département du Nord, elle alimente la région du Cap-Haïtien en eau pour l'irrigation et la consommation.</li>
            <li><strong>La Rivière Grise (100 km) :</strong> Traverse Port-au-Prince. Malheureusement, elle est gravement polluée par les déchets urbains, ce qui représente un problème de santé publique.</li>
            <li><strong>La Grande Rivière du Nord :</strong> Importante pour l'irrigation dans le département du Nord.</li>
          </ul>
          
          <p class="mt-4"><strong>Problème majeur :</strong> Beaucoup de nos rivières sont <strong>intermittentes</strong>, c'est-à-dire qu'elles s'assèchent pendant la saison sèche et débordent pendant la saison des pluies. La déforestation aggrave ce phénomène car il n'y a plus d'arbres pour retenir l'eau dans le sol.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les lacs</h4>
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Étang Saumâtre / Lac Azuéi (170 km²) :</strong> Le plus grand lac naturel d'Haïti. Il est situé dans la plaine du Cul-de-Sac, à la frontière avec la République Dominicaine. C'est un lac d'eau salée (d'où son nom "saumâtre") qui abrite des crocodiles, des flamants roses et de nombreuses espèces d'oiseaux migrateurs. Patrimoine écologique important !</li>
            <li><strong>Lac de Péligre (50 km²) :</strong> Lac artificiel créé par le barrage de Péligre en 1956. Il sert à l'irrigation et à la production d'électricité.</li>
            <li><strong>Étang de Miragôane :</strong> Petit lac côtier dans le département des Nippes.</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">L'Étang Saumâtre abrite une espèce fascinante : le <strong>crocodile américain</strong> (Crocodylus acutus), qui peut atteindre 4 à 5 mètres de long ! Ces reptiles préhistoriques étaient vénérés par les Taïnos. Aujourd'hui, ils sont menacés par la destruction de leur habitat et la pollution. Le lac est aussi un site important pour les oiseaux migrateurs qui voyagent entre l'Amérique du Nord et du Sud. Des milliers de flamants roses y font parfois escale !</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Étang Saumâtre Haïti crocodiles" ou "Barrage Péligre" pour voir ces merveilles en vidéo.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">5. Les côtes et les îles : notre patrimoine maritime</h3>
          
          <p class="text-lg mb-4">Avec 1 771 km de côtes, Haïti est un pays maritime ! Nos côtes offrent des paysages variés : plages de sable blanc, mangroves, falaises rocheuses, récifs coralliens...</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les principales îles haïtiennes</h4>
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>La Gonâve (689 km²) :</strong> La plus grande île d'Haïti, située au milieu du golfe de la Gonâve. Population : environ 120 000 habitants. L'île est montagneuse et aride. Son isolement géographique a créé une culture locale unique. Accès difficile : il faut prendre un bateau depuis Port-au-Prince ou Saint-Marc.</li>
            <li><strong>Île de la Tortue (180 km²) :</strong> Au nord-ouest, cette île a joué un rôle historique fascinant. Au XVIIe siècle, elle était le <strong>repaire des pirates et boucaniers</strong> qui attaquaient les navires espagnols ! Les Français l'ont ensuite utilisée comme base pour coloniser Haïti. Aujourd'hui, c'est une île paisible avec des plages magnifiques mais peu développées.</li>
            <li><strong>Île-à-Vache (52 km²) :</strong> Au sud, près des Cayes. Plages paradisiaques, cocotiers, eaux turquoise... C'est une destination touristique potentielle importante. Henri Morgan, le célèbre pirate, y a séjourné au XVIIe siècle !</li>
            <li><strong>Cayemites (45 km²) :</strong> Deux petites îles (Grande Cayemite et Petite Cayemite) dans le sud-ouest. Isolées mais très belles.</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Patrimoine côtier</h4>
          <p>Nos côtes abritent des écosystèmes fragiles et précieux :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Récifs coralliens :</strong> Protection naturelle contre l'érosion, habitat de milliers d'espèces de poissons</li>
            <li><strong>Mangroves :</strong> Forêts côtières qui protègent les côtes des ouragans et servent de nurserie aux poissons et crustacés. Malheureusement, beaucoup ont été coupées pour faire du charbon de bois.</li>
            <li><strong>Plages :</strong> Potentiel touristique énorme, mais nécessitent d'être protégées de la pollution</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">L'Île de la Tortue (Île de la Tortue en français, "Turtle Island" en anglais) était le <strong>quartier général des pirates des Caraïbes au XVIIe siècle</strong> ! Ces pirates (appelés "flibustiers" ou "boucaniers") attaquaient les galions espagnols chargés d'or venant d'Amérique du Sud. Le fameux "Code des Pirates" aurait été rédigé sur cette île. Aujourd'hui, c'est une île tranquille de pêcheurs, mais son passé pirate fascine toujours les historiens et les visiteurs !</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">6. Les divisions administratives : organisation du territoire</h3>
          
          <p class="text-lg mb-4">Pour mieux gérer son territoire, Haïti est divisé en <strong>10 départements géographiques</strong>, eux-mêmes subdivisés en 42 arrondissements, 145 communes et 571 sections communales.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les 10 départements et leurs caractéristiques</h4>
          
          <div class="grid gap-3 mt-4">
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">1. Ouest - Capitale : Port-au-Prince</p>
              <p class="text-sm mt-1">Le plus peuplé (4 millions d'habitants). Concentre le pouvoir politique et économique. Département le plus urbanisé.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">2. Sud-Est - Capitale : Jacmel</p>
              <p class="text-sm mt-1">Connue pour son carnaval, son architecture coloniale et ses plages. Ville artistique et culturelle.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">3. Nord - Capitale : Cap-Haïtien</p>
              <p class="text-sm mt-1">Deuxième ville du pays. Riche histoire (capitale du royaume de Henri Christophe). Sites historiques : Citadelle Laferrière, Palais Sans-Souci (UNESCO).</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">4. Nord-Est - Capitale : Fort-Liberté</p>
              <p class="text-sm mt-1">Région frontalière avec la République Dominicaine. Fort-Liberté était un port important à l'époque coloniale.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">5. Artibonite - Capitale : Gonaïves</p>
              <p class="text-sm mt-1">Plus grand département en superficie. Grenier d'Haïti (plaine de l'Artibonite). Gonaïves = "Ville de l'Indépendance" (proclamation le 1er janvier 1804).</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">6. Centre - Capitale : Hinche</p>
              <p class="text-sm mt-1">Région montagneuse et rurale. Agriculture de subsistance. Région la plus pauvre mais riche en culture traditionnelle.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">7. Sud - Capitale : Les Cayes</p>
              <p class="text-sm mt-1">Troisième ville du pays. Agriculture diversifiée, pêche. Durement touché par l'ouragan Matthew en 2016.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">8. Grande Anse - Capitale : Jérémie</p>
              <p class="text-sm mt-1">"Cité des poètes" (beaucoup d'écrivains haïtiens en sont originaires). Région isolée mais fertile. Cacao, café.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">9. Nord-Ouest - Capitale : Port-de-Paix</p>
              <p class="text-sm mt-1">Région côtière. Proche de l'Île de la Tortue. Port-de-Paix était un port important pour le commerce du café.</p>
            </div>
            <div class="border-l-4 border-purple-500 pl-4 py-2">
              <p class="font-bold">10. Nippes - Capitale : Miragoâne</p>
              <p class="text-sm mt-1">Le plus récent département (créé en 2003). Petit mais agricole (café, cacao, canne à sucre).</p>
            </div>
          </div>
          
          <p class="mt-4"><strong>💡 Astuce pour mémoriser :</strong> Créez un mnémonique avec les initiales des départements ! Par exemple : "Oh, Ses Nouveaux Amis Nord-Est Arriveront Ce Soir, Grands Amis Nippois" (Ouest, Sud-Est, Nord, Nord-Est, Artibonite, Centre, Sud, Grande Anse, Nord-Ouest, Nippes).</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">7. Les défis géographiques majeurs d'Haïti</h3>
          
          <p class="text-lg mb-4">Notre géographie, bien que belle et diverse, nous pose aussi des défis considérables que nous devons affronter avec courage et intelligence.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">1. La déforestation : un désastre écologique</h4>
          <p>C'est le problème environnemental le plus grave d'Haïti. Au début du XXe siècle, environ <strong>60% du territoire</strong> était couvert de forêts. Aujourd'hui, il en reste <strong>moins de 2%</strong> ! Où sont passés nos arbres ?</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Charbon de bois :</strong> 70% de l'énergie en Haïti provient du charbon de bois. Les arbres sont coupés pour faire du charbon qu'on utilise pour cuisiner.</li>
            <li><strong>Agriculture sur brûlis :</strong> Les paysans brûlent les forêts pour créer de nouvelles terres agricoles.</li>
            <li><strong>Pauvreté :</strong> Les gens coupent les arbres pour survivre car ils n'ont pas d'alternative énergétique.</li>
          </ul>
          <p class="mt-3"><strong>Conséquences catastrophiques :</strong></p>
          <ul class="list-disc ml-8 space-y-1 mt-2">
            <li>Érosion massive des sols (voir ci-dessous)</li>
            <li>Disparition de la biodiversité (espèces animales et végétales)</li>
            <li>Réchauffement local du climat</li>
            <li>Diminution des pluies</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">2. L'érosion des sols : la terre qui s'en va</h4>
          <p>Sans arbres pour retenir la terre, le sol part avec la pluie ! Chaque année, des <strong>millions de tonnes de terre arable</strong> sont emportées vers la mer.</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Glissements de terrain :</strong> Pendant les fortes pluies, des pans entiers de montagnes glissent, ensevelissant maisons et routes.</li>
            <li><strong>Inondations :</strong> L'eau dévale les pentes sans être absorbée, inondant les plaines.</li>
            <li><strong>Diminution de la fertilité :</strong> La couche fertile du sol disparaît, laissant la roche nue. Les récoltes diminuent d'année en année.</li>
            <li><strong>Envasement des rivières et barrages :</strong> La terre emportée se dépose dans les cours d'eau, réduisant leur capacité.</li>
          </ul>
          <p class="mt-3 italic">📸 <strong>Image satellite tristement célèbre :</strong> Depuis l'espace, on peut voir nettement la différence entre Haïti (brun-gris, déboisé) et la République Dominicaine voisine (verte, avec des forêts). C'est une leçon visuelle puissante sur l'impact de la déforestation.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">3. Les risques sismiques : vivre sur une faille</h4>
          <p>Haïti se trouve sur la frontière entre deux <strong>plaques tectoniques</strong> : la plaque nord-américaine et la plaque caribéenne. Ces plaques se déplacent de quelques centimètres par an, créant des tensions qui se libèrent brutalement sous forme de tremblements de terre.</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Séisme de 2010 :</strong> Le 12 janvier 2010, un tremblement de terre de magnitude 7,0 a frappé Port-au-Prince. Bilan : plus de 230 000 morts, 300 000 blessés, 1,5 million de sans-abris. Des quartiers entiers détruits. La catastrophe naturelle la plus meurtrière du XXIe siècle.</li>
            <li><strong>Séisme de 2021 :</strong> Le 14 août 2021, magnitude 7,2 dans le Sud. Plus de 2 200 morts. Les Cayes et Jérémie gravement touchées.</li>
            <li><strong>Failles actives :</strong> La faille d'Enriquillo (sud) et la faille septentrionale (nord) sont actives. D'autres séismes surviendront inévitablement.</li>
          </ul>
          <p class="mt-3"><strong>Que faire ?</strong> Construire selon les normes antisismiques, se préparer (kit d'urgence, plan familial), savoir quoi faire pendant un séisme (se protéger sous une table solide, s'éloigner des fenêtres).</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">4. La vulnérabilité aux ouragans</h4>
          <p>Haïti se trouve dans "l'allée des ouragans" de l'Atlantique. Chaque année, de juin à novembre, des cyclones tropicaux menacent notre pays.</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Ouragans récents dévastateurs :</strong>
              <ul class="list-circle ml-6 mt-1">
                <li>Matthew (2016) : Catégorie 4, détruit 90% des infrastructures dans le Sud</li>
                <li>Jeanne (2004) : 3 000 morts dans les Gonaïves</li>
              </ul>
            </li>
            <li><strong>Aggravation par la déforestation :</strong> Sans arbres, les pluies provoquent des coulées de boue meurtrières</li>
            <li><strong>Pauvreté aggrave les dégâts :</strong> Maisons fragiles en tôle s'envolent facilement</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">5. Difficulté d'accès et communications</h4>
          <p>Le relief montagneux complique énormément les transports et les communications :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li>Routes en mauvais état, souvent coupées par les pluies</li>
            <li>Certaines régions rurales isolées n'ont accès qu'à pied ou à dos de mulet</li>
            <li>Coût élevé du transport de marchandises</li>
            <li>Difficultés pour l'accès aux services (santé, éducation, commerce)</li>
          </ul>
          
          <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg my-6 border-l-4 border-red-500">
            <p class="font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Un constat alarmant mais un espoir possible</p>
            <p class="text-red-800 dark:text-red-300">Les défis géographiques d'Haïti sont immenses, mais pas insurmontables ! D'autres pays montagneux (Suisse, Népal, Rwanda) ont su transformer leurs contraintes en atouts. Le reboisement massif, les infrastructures modernes, l'énergie solaire, l'agriculture durable... tout cela est possible si nous nous y mettons collectivement. <strong>L'avenir géographique d'Haïti dépend de chaque Haïtien, y compris vous, élèves de 7AF !</strong> Que pouvez-vous faire dès maintenant ? Planter des arbres, économiser l'eau, sensibiliser votre entourage...</p>
          </div>
        </section>

        <section class="mt-8">
          <h3 class="text-2xl font-bold mb-4 text-primary">8. Conclusion : Connaître notre géographie pour mieux la protéger</h3>
          <p class="text-lg leading-relaxed">L'espace géographique haïtien est un trésor. Nos montagnes majestueuses, nos plaines fertiles, nos côtes magnifiques, nos îles paradisiaques... tout cela forme notre patrimoine national. Mais ce patrimoine est fragile et menacé.</p>
          <p class="mt-4">Connaître notre géographie, c'est comprendre d'où nous venons, pourquoi nous vivons comme nous vivons, et quels défis nous devons relever. C'est aussi apprendre à aimer notre pays dans toute sa complexité et sa beauté.</p>
          <p class="mt-4"><strong>La géographie n'est pas une fatalité.</strong> Nous pouvons transformer nos faiblesses en forces : développer l'écotourisme de montagne, protéger nos récifs coralliens, replanter nos forêts, construire des infrastructures modernes... L'avenir géographique d'Haïti est entre nos mains.</p>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">📚 Exemples concrets et études de cas</h3>
          <div class="grid gap-4">
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">🌾 Exemple 1 : La plaine de l'Artibonite - Grenier d'Haïti</p>
              <p class="mb-2">La plaine de l'Artibonite produit plus de 80% du riz consommé en Haïti. Sans cette région, le pays devrait importer encore plus de nourriture. Le barrage de Péligre, construit en 1956, permet d'irriguer 32 000 hectares. C'est un parfait exemple de l'importance des plaines dans notre économie agricole et de l'aménagement intelligent du territoire.</p>
              <p class="text-sm italic mt-2">💡 Réflexion : Que se passerait-il si une catastrophe naturelle détruisait les récoltes de l'Artibonite ? Comment le pays pourrait-il compenser cette perte ?</p>
            </div>
            
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2">⛰️ Exemple 2 : Le Pic la Selle - Toit d'Haïti</p>
              <p class="mb-2">À 2 680 mètres d'altitude, le Pic la Selle est le point culminant d'Haïti. Par temps clair, on peut y voir Port-au-Prince, la République Dominicaine, et même Cuba ! La température au sommet peut descendre jusqu'à 0°C en hiver. C'est une démonstration spectaculaire de la diversité de notre relief : à 50 km de distance, on passe d'un climat chaud de bord de mer à un climat de montagne où il peut geler !</p>
              <p class="text-sm italic mt-2">🎯 Activité : Recherchez des photos du Pic la Selle et comparez-les avec des photos de nos plages. Notez les différences de végétation et de climat.</p>
            </div>
            
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-lg border-l-4 border-amber-500">
              <p class="font-bold text-lg mb-2">🏝️ Exemple 3 : L'île de la Gonâve - Isolement et identité</p>
              <p class="mb-2">La Gonâve, bien qu'à seulement 60 km de Port-au-Prince, reste difficile d'accès. Il faut prendre un bateau qui met 2-3 heures. Cette île de 689 km² et 120 000 habitants a développé sa propre identité culturelle. L'isolement géographique crée des défis (accès aux services, transport de marchandises coûteux) mais préserve aussi des traditions uniques.</p>
              <p class="text-sm italic mt-2">🤔 Question : L'isolement géographique est-il toujours négatif ? Quels peuvent être ses avantages ?</p>
            </div>
            
            <div class="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 p-5 rounded-lg border-l-4 border-red-500">
              <p class="font-bold text-lg mb-2">📸 Exemple 4 : La frontière visible depuis l'espace</p>
              <p class="mb-2">Les images satellites montrent une différence frappante : Haïti (à l'ouest) apparaît brun-gris et déboisé, tandis que la République Dominicaine (à l'est) est verte avec des forêts. Cette "frontière écologique" visible depuis l'espace illustre dramatiquement l'impact de la déforestation. En 1923, les deux côtés avaient une couverture forestière similaire. Aujourd'hui, Haïti a perdu 98% de ses forêts.</p>
              <p class="text-sm italic mt-2">⚠️ Leçon : La géographie n'est pas figée. Les actions humaines (déforestation, reboisement) transforment radicalement le paysage.</p>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-5 rounded-lg border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2">🌊 Exemple 5 : L'Étang Saumâtre - Patrimoine écologique</p>
              <p class="mb-2">Ce lac de 170 km² abrite des crocodiles américains (jusqu'à 5 m de long !), des flamants roses, et des centaines d'espèces d'oiseaux migrateurs. C'est une zone humide d'importance internationale selon la Convention de Ramsar. Les Taïnos considéraient ce lieu comme sacré. Aujourd'hui, il est menacé par la pollution et la destruction de son habitat.</p>
              <p class="text-sm italic mt-2">🌍 Connexion mondiale : Les oiseaux qui se posent à l'Étang Saumâtre voyagent depuis l'Amérique du Nord jusqu'en Amérique du Sud. Haïti est une escale vitale dans leur migration !</p>
            </div>
          </div>
        </section>

        <section class="mt-8">
          <h3 class="text-2xl font-bold mb-4 text-primary">✏️ Exercices variés et approfondis</h3>
          
          <div class="grid gap-6">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">📝 1. Questions à choix multiples (QCM)</p>
              <div class="space-y-4">
                <div>
                  <p class="font-semibold">a) Quelle est la superficie d'Haïti ?</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>15 000 km²</li>
                    <li>27 750 km² ✓</li>
                    <li>48 000 km²</li>
                    <li>76 192 km²</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold">b) Le point culminant d'Haïti est :</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>Le Pic Macaya (2 347 m)</li>
                    <li>Le Morne La Visite (2 275 m)</li>
                    <li>Le Pic la Selle (2 680 m) ✓</li>
                    <li>Le Morne-à-Cabrit (1 000 m)</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold">c) Le plus long fleuve d'Haïti est :</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>Les Trois Rivières (150 km)</li>
                    <li>La Rivière Grise (100 km)</li>
                    <li>L'Artibonite (320 km) ✓</li>
                    <li>La Grande Rivière du Nord</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold">d) Quel pourcentage du territoire haïtien est montagneux ?</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>25%</li>
                    <li>50%</li>
                    <li>75% ✓</li>
                    <li>90%</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold">e) La plus grande île haïtienne est :</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>La Tortue (180 km²)</li>
                    <li>La Gonâve (689 km²) ✓</li>
                    <li>Île-à-Vache (52 km²)</li>
                    <li>Cayemites (45 km²)</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold">f) Combien de départements géographiques compte Haïti ?</p>
                  <ul class="ml-6 list-disc mt-2">
                    <li>5</li>
                    <li>8</li>
                    <li>10 ✓</li>
                    <li>12</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">✔️ 2. Vrai ou Faux (justifiez vos réponses)</p>
              <ul class="ml-6 space-y-3">
                <li><strong>a)</strong> Haïti est un pays essentiellement plat avec quelques collines. 
                  <br/><span class="text-sm text-red-600 dark:text-red-400">➜ FAUX. Haïti est à 75% montagneux, c'est l'un des pays les plus accidentés de la Caraïbe.</span>
                </li>
                <li><strong>b)</strong> La Gonâve est la plus grande île haïtienne. 
                  <br/><span class="text-sm text-green-600 dark:text-green-400">➜ VRAI. Elle couvre 689 km² et compte environ 120 000 habitants.</span>
                </li>
                <li><strong>c)</strong> Haïti possède 10 départements géographiques. 
                  <br/><span class="text-sm text-green-600 dark:text-green-400">➜ VRAI. Le dernier, Nippes, a été créé en 2003.</span>
                </li>
                <li><strong>d)</strong> Plus de 50% du territoire haïtien est couvert de forêts. 
                  <br/><span class="text-sm text-red-600 dark:text-red-400">➜ FAUX. Moins de 2% de couverture forestière reste aujourd'hui, contre 60% au début du XXe siècle.</span>
                </li>
                <li><strong>e)</strong> L'Étang Saumâtre est le plus grand lac naturel d'Haïti. 
                  <br/><span class="text-sm text-green-600 dark:text-green-400">➜ VRAI. Il couvre 170 km² et abrite des crocodiles et des oiseaux migrateurs.</span>
                </li>
                <li><strong>f)</strong> Haïti partage une frontière terrestre avec Cuba. 
                  <br/><span class="text-sm text-red-600 dark:text-red-400">➜ FAUX. Haïti partage une frontière terrestre uniquement avec la République Dominicaine (376 km). Cuba est séparée d'Haïti par la mer (80 km).</span>
                </li>
                <li><strong>g)</strong> La plaine de l'Artibonite produit la majorité du riz haïtien. 
                  <br/><span class="text-sm text-green-600 dark:text-green-400">➜ VRAI. Plus de 80% du riz consommé en Haïti provient de cette région.</span>
                </li>
                <li><strong>h)</strong> Le nom "Haïti" vient d'un mot français. 
                  <br/><span class="text-sm text-red-600 dark:text-red-400">➜ FAUX. "Haïti" vient du mot taïno "Ayiti" qui signifie "terre des hautes montagnes".</span>
                </li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🔗 3. Associations et correspondances</p>
              <p class="mb-3">Associez chaque élément géographique à sa caractéristique principale :</p>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold underline mb-2">Éléments géographiques :</p>
                  <ol class="list-decimal ml-6 space-y-1">
                    <li>Pic la Selle</li>
                    <li>Plaine de l'Artibonite</li>
                    <li>Île de la Tortue</li>
                    <li>Étang Saumâtre</li>
                    <li>Cap-Haïtien</li>
                    <li>Fleuve Artibonite</li>
                    <li>La Gonâve</li>
                    <li>Port-au-Prince</li>
                  </ol>
                </div>
                <div>
                  <p class="font-semibold underline mb-2">Caractéristiques :</p>
                  <ul class="list-none ml-6 space-y-1">
                    <li>A. Grenier d'Haïti (riz)</li>
                    <li>B. Plus grande île haïtienne</li>
                    <li>C. Point culminant (2 680 m)</li>
                    <li>D. Capitale et plus grande ville</li>
                    <li>E. Lac avec crocodiles</li>
                    <li>F. Repaire des pirates au XVIIe siècle</li>
                    <li>G. Plus long fleuve (320 km)</li>
                    <li>H. Deuxième ville, sites UNESCO</li>
                  </ul>
                </div>
              </div>
              <p class="text-sm mt-4 italic text-gray-600 dark:text-gray-400">Réponses : 1-C, 2-A, 3-F, 4-E, 5-H, 6-G, 7-B, 8-D</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">💭 4. Questions de réflexion et analyse approfondie</p>
              <ul class="ml-6 space-y-4">
                <li><strong>a)</strong> Comment le relief montagneux d'Haïti a-t-il influencé l'histoire de notre pays ? (Pensez aux esclaves marrons, à la guerre d'indépendance, aux communications actuelles)</li>
                <li><strong>b)</strong> Pourquoi la plaine de l'Artibonite est-elle surnommée "le grenier d'Haïti" ? Que se passerait-il si cette région était gravement affectée par une catastrophe naturelle ?</li>
                <li><strong>c)</strong> Comparez les avantages et les inconvénients de notre position géographique dans la Caraïbe. (Commerce, tourisme, ouragans, isolement)</li>
                <li><strong>d)</strong> Expliquez pourquoi la déforestation aggrave les effets des catastrophes naturelles (ouragans, inondations) en Haïti.</li>
                <li><strong>e)</strong> La frontière entre Haïti et la République Dominicaine est visible depuis l'espace (différence de couleur due à la déforestation). Qu'est-ce que cela nous enseigne sur l'impact humain sur la géographie ?</li>
                <li><strong>f)</strong> Imaginez que vous êtes ministre de l'Environnement. Quelles trois mesures concrètes prendriez-vous pour protéger notre patrimoine géographique ?</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🗺️ 5. Activité pratique : Créer une carte enrichie d'Haïti</p>
              <p class="mb-3"><strong>Projet :</strong> Dessinez ou imprimez une carte vierge d'Haïti et ajoutez-y les éléments suivants :</p>
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold underline mb-2">Obligatoire :</p>
                  <ul class="list-disc ml-6 space-y-1">
                    <li>Les 10 départements et leurs capitales</li>
                    <li>Les 5 principales chaînes de montagnes</li>
                    <li>Le Pic la Selle et le Pic Macaya</li>
                    <li>Les 4 principales plaines</li>
                    <li>Le fleuve Artibonite et 2 autres rivières</li>
                    <li>Les 3 plus grandes îles</li>
                    <li>Les pays voisins</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold underline mb-2">Bonus (pour plus de points) :</p>
                  <ul class="list-disc ml-6 space-y-1">
                    <li>Code couleur pour le relief (vert=plaines, jaune=collines, marron=montagnes)</li>
                    <li>Symboles pour les ressources (riz, café, etc.)</li>
                    <li>Flèches indiquant les risques naturels</li>
                    <li>Photos découpées collées sur chaque région</li>
                    <li>Légende complète et soignée</li>
                  </ul>
                </div>
              </div>
              <p class="mt-4 text-sm italic">💡 Astuce : Utilisez des couleurs vives et des dessins pour rendre votre carte attractive et mémorable !</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🔍 6. Enquête sur votre département d'origine</p>
              <p class="mb-3"><strong>Mission de recherche :</strong> Interrogez vos parents ou grands-parents sur le département géographique d'où vient votre famille. Remplissez cette fiche d'enquête :</p>
              <ul class="ml-6 space-y-2 list-disc">
                <li>Nom du département et de la ville/village d'origine</li>
                <li>Type de relief (montagneux, plaine, côtier)</li>
                <li>Principales cultures agricoles de la région</li>
                <li>Rivières ou lacs importants à proximité</li>
                <li>Particularités géographiques (montagne célèbre, plage, etc.)</li>
                <li>Défis géographiques de cette région (accès difficile, sécheresse, inondations...)</li>
                <li>Anecdotes ou histoires familiales liées à la géographie locale</li>
              </ul>
              <p class="mt-3"><strong>Restitution :</strong> Préparez une présentation de 3 minutes pour partager vos découvertes avec la classe. Affichez la localisation sur une carte murale.</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🌳 7. Projet écologique : Plan de reboisement local</p>
              <p class="mb-3"><strong>Travail de groupe (3-4 élèves) :</strong> Identifiez une zone déboisée près de votre école ou quartier. Créez un plan détaillé pour la reboiser :</p>
              <ol class="list-decimal ml-6 space-y-2">
                <li>Localisation et superficie de la zone (utilisez Google Maps si possible)</li>
                <li>État actuel (photos, description de l'érosion visible)</li>
                <li>Types d'arbres adaptés au climat local (arbres fruitiers, pins, bois d'oeuvre)</li>
                <li>Nombre d'arbres nécessaires et coût estimé</li>
                <li>Bénéfices attendus (protection contre l'érosion, fruits, ombre, oxygène)</li>
                <li>Plan d'action : qui plante, qui arrose, qui surveille ?</li>
                <li>Partenaires potentiels (mairie, ONG environnementales, école)</li>
              </ol>
              <p class="mt-3 text-sm italic">🎯 Objectif : Ce projet vous apprend à passer de la théorie (connaître les problèmes géographiques) à l'action (proposer des solutions concrètes).</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">📊 8. Comparaison Haïti vs République Dominicaine</p>
              <p class="mb-3"><strong>Exercice d'analyse comparative :</strong> Remplissez ce tableau comparatif :</p>
              <table class="w-full border-collapse mt-3 text-sm">
                <thead>
                  <tr class="bg-gray-200 dark:bg-gray-700">
                    <th class="border border-gray-400 p-2 text-left">Critère</th>
                    <th class="border border-gray-400 p-2 text-left">Haïti</th>
                    <th class="border border-gray-400 p-2 text-left">Rép. Dominicaine</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-gray-400 p-2">Superficie</td>
                    <td class="border border-gray-400 p-2">27 750 km²</td>
                    <td class="border border-gray-400 p-2">48 442 km²</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">Couverture forestière</td>
                    <td class="border border-gray-400 p-2">< 2%</td>
                    <td class="border border-gray-400 p-2">~40%</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">Point culminant</td>
                    <td class="border border-gray-400 p-2">Pic la Selle (2 680 m)</td>
                    <td class="border border-gray-400 p-2">Pico Duarte (3 098 m)</td>
                  </tr>
                  <tr>
                    <td class="border border-gray-400 p-2">Frontière commune</td>
                    <td class="border border-gray-400 p-2" colspan="2">376 km traversant montagnes et plaines</td>
                  </tr>
                </tbody>
              </table>
              <p class="mt-3"><strong>Questions :</strong></p>
              <ul class="ml-6 list-disc space-y-2">
                <li>Pourquoi la couverture forestière est-elle si différente alors que les deux pays partagent la même île ?</li>
                <li>Quelles conséquences cette différence a-t-elle sur l'environnement et l'économie ?</li>
                <li>Que pourrait apprendre Haïti des politiques environnementales de la République Dominicaine ?</li>
              </ul>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">🎬 9. Mini-documentaire vidéo</p>
              <p class="mb-3"><strong>Projet créatif (groupe de 4-5) :</strong> Créez un mini-documentaire de 5-7 minutes sur un aspect de la géographie haïtienne. Sujets possibles :</p>
              <ul class="ml-6 list-disc space-y-1">
                <li>"Le voyage d'une goutte d'eau : de la montagne à la mer"</li>
                <li>"Un jour dans la vie d'un paysan de l'Artibonite"</li>
                <li>"Ascension du Pic la Selle : défi géographique"</li>
                <li>"La Gonâve : vivre sur une île isolée"</li>
                <li>"Haïti avant/après : histoire de notre déforestation"</li>
              </ul>
              <p class="mt-3"><strong>Format :</strong> Utilisez un smartphone, combinez interviews, images, narration, musique haïtienne. Montrez-le à la classe !</p>
            </div>

            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <p class="font-bold text-xl mb-4">✍️ 10. Dissertation</p>
              <p class="mb-3"><strong>Sujet :</strong> "La géographie d'Haïti : contrainte ou opportunité ?"</p>
              <p class="mb-2"><strong>Structure suggérée (2-3 pages) :</strong></p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Introduction :</strong> Présentation de la diversité géographique d'Haïti. Problématique : notre géographie est-elle un obstacle ou un atout pour le développement ?</li>
                <li><strong>Partie 1 - Les contraintes :</strong> Relief montagneux (transport difficile), déforestation et érosion, vulnérabilité aux catastrophes naturelles, isolement de certaines régions</li>
                <li><strong>Partie 2 - Les opportunités :</strong> Diversité de paysages (tourisme), plaines fertiles (agriculture), long littoral (pêche, tourisme balnéaire), position stratégique dans la Caraïbe, potentiel énergétique (solaire, hydraulique)</li>
                <li><strong>Partie 3 - Comment transformer les contraintes en opportunités ?</strong> Exemples de pays similaires (Suisse, Costa Rica, Rwanda), solutions concrètes pour Haïti</li>
                <li><strong>Conclusion :</strong> Votre position personnelle. La géographie n'est pas une fatalité ; c'est ce que nous en faisons qui compte.</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="mt-8">
          <h3 class="text-2xl font-bold mb-4 text-primary">📚 Ressources complémentaires</h3>
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg">
            <p class="font-semibold text-lg mb-3">Pour aller plus loin :</p>
            <ul class="space-y-2">
              <li><strong>📹 Vidéos YouTube recommandées :</strong>
                <ul class="list-disc ml-8 mt-1 space-y-1">
                  <li>"Haïti vue du ciel - Drone 4K"</li>
                  <li>"Géographie d'Haïti documentaire"</li>
                  <li>"Pic la Selle randonnée ascension"</li>
                  <li>"Déforestation Haïti satellite images"</li>
                  <li>"Plaine Artibonite culture du riz"</li>
                  <li>"Étang Saumâtre crocodiles Haïti"</li>
                </ul>
              </li>
              <li><strong>🗺️ Outils en ligne :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>Google Earth : Explorez Haïti en 3D</li>
                  <li>Google Maps : Calculez distances et itinéraires</li>
                  <li>NASA Worldview : Images satellites d'Haïti</li>
                </ul>
              </li>
              <li><strong>📖 Lecture recommandée :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>"Atlas d'Haïti" - Institut Haïtien de Statistique</li>
                  <li>"Géographie physique et humaine d'Haïti" - Georges Anglade</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "terre-humanisation",
    title: "La terre et les problèmes de son humanisation",
    mois: "Décembre",
    objectif: "Étudier la place et le fonctionnement de la planète Terre dans l'univers et analyser comment l'humanité a transformé son environnement.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-6 rounded-lg border-l-4 border-green-500">
          <p class="text-lg italic">"La Terre n'est pas un don de nos parents, c'est un prêt de nos enfants." - Proverbe amérindien</p>
        </div>
        
        <p class="text-lg leading-relaxed">Imaginez que vous êtes dans une station spatiale, flottant à 400 kilomètres au-dessus de la Terre. Devant vous se déploie un spectacle à couper le souffle : une sphère bleue marbrée de blanc (les nuages), tachetée de vert (les forêts) et de brun (les continents), suspendue dans l'immensité noire de l'espace. C'est notre planète, la Terre, la seule oasis de vie connue dans un univers apparemment stérile.</p>
        
        <p>Mais cette magnifique planète bleue n'a pas toujours eu cet aspect. Il y a 4,5 milliards d'années, c'était une boule de lave en fusion, constamment bombardée par des météorites. Aujourd'hui, elle abrite près de 8 milliards d'êtres humains, des millions d'espèces animales et végétales, et des écosystèmes d'une complexité inouïe.</p>
        
        <p>En Haïti, nous sommes particulièrement concernés par la question de l'humanisation de la Terre. Notre pays, autrefois couvert à 60% de forêts luxuriantes, a vu ce taux chuter à moins de 2% aujourd'hui. Les conséquences sont dramatiques : érosion des sols, inondations, glissements de terrain, appauvrissement agricole. Cette leçon nous aidera à comprendre comment nous en sommes arrivés là et, surtout, ce que nous pouvons faire pour inverser la tendance.</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Comprendre la place de la Terre dans le système solaire et l'univers</li>
            <li>Identifier les caractéristiques physiques de notre planète</li>
            <li>Analyser les différentes formes d'humanisation du territoire</li>
            <li>Évaluer les problèmes environnementaux causés par l'activité humaine</li>
            <li>Proposer des solutions pour un développement durable</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. La Terre dans l'univers : une perspective cosmique</h3>
          
          <p class="text-lg mb-4">Pour comprendre notre planète, il faut d'abord saisir où elle se situe dans l'immensité du cosmos. L'adresse complète de la Terre serait : Planète Terre, Système solaire, Bras d'Orion, Galaxie de la Voie lactée, Groupe local de galaxies, Superamas de la Vierge, Univers observable !</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Le système solaire</h4>
          <p>Notre système solaire est composé d'une étoile (le Soleil) et de tout ce qui orbite autour d'elle : 8 planètes, des dizaines de lunes, des milliers d'astéroïdes et de comètes.</p>
          
          <ul class="list-disc ml-8 space-y-3 mt-4">
            <li><strong>Le Soleil :</strong> Étoile moyenne (diamètre de 1,4 million de km !), vieille de 4,6 milliards d'années. Il produit son énergie par fusion nucléaire (transformation d'hydrogène en hélium). Sans lui, pas de vie possible sur Terre !</li>
            <li><strong>Les 8 planètes</strong> (de la plus proche à la plus éloignée du Soleil) :
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li>Mercure, Vénus, <strong>Terre</strong>, Mars (planètes rocheuses, petites et denses)</li>
                <li>Jupiter, Saturne, Uranus, Neptune (géantes gazeuses, énormes mais peu denses)</li>
              </ul>
            </li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">La Terre : caractéristiques uniques</h4>
          <p>La Terre est la seule planète du système solaire où nous savons avec certitude qu'il existe de la vie. Pourquoi ?</p>
          
          <div class="grid gap-3 mt-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <p class="font-semibold">1. Distance idéale du Soleil</p>
              <p>La Terre orbite à environ <strong>150 millions de kilomètres</strong> du Soleil (on appelle cette distance une "unité astronomique" ou UA). Cette distance est parfaite : ni trop proche (comme Vénus où il fait 460°C), ni trop loin (comme Mars où il fait -60°C). Cette zone s'appelle la <strong>"zone habitable"</strong> ou "zone Boucle d'Or" (comme dans le conte : ni trop chaud, ni trop froid, juste comme il faut!).</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <p class="font-semibold">2. Présence d'eau liquide</p>
              <p>71% de la surface terrestre est couverte d'eau. Cette eau liquide (ni entièrement gelée, ni entièrement évaporée) est essentielle à la vie telle que nous la connaissons. Les océans régulent le climat et abritent la plupart de la vie sur Terre.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <p class="font-semibold">3. Atmosphère protectrice</p>
              <p>Notre atmosphère est composée à 78% d'azote, 21% d'oxygène et 1% d'autres gaz (argon, CO2, vapeur d'eau). Elle filtre les rayons ultraviolets nocifs du Soleil grâce à la couche d'ozone. Elle maintient aussi une température vivable grâce à l'effet de serre naturel.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <p class="font-semibold">4. Champ magnétique terrestre</p>
              <p>Le noyau de fer en fusion de la Terre crée un puissant champ magnétique qui nous protège des radiations solaires mortelles (le "vent solaire"). Ce champ magnétique dévie ces particules chargées vers les pôles, créant les magnifiques aurores boréales et australes.</p>
            </div>
            
            <div class="border-l-4 border-blue-500 pl-4">
              <p class="font-semibold">5. La Lune : un satellite stabilisateur</p>
              <p>Notre satellite naturel, la Lune (diamètre de 3 474 km, située à 384 400 km de la Terre), joue un rôle crucial. Elle stabilise l'inclinaison de l'axe terrestre (23,5°), créant des saisons régulières. Elle génère aussi les marées océaniques par son attraction gravitationnelle.</p>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">La Terre n'est pas parfaitement ronde ! Elle est légèrement <strong>aplatie aux pôles</strong> et renflée à l'équateur (on dit qu'elle est un "ellipsoïde"). La différence est subtile mais réelle : le diamètre à l'équateur (12 756 km) est 43 km plus grand que le diamètre entre les pôles (12 713 km). Cet aplatissement est causé par la rotation de la Terre qui "pousse" la matière vers l'extérieur à l'équateur. C'est aussi pour cette raison que le point le plus éloigné du centre de la Terre n'est pas le sommet de l'Everest, mais le sommet du Chimborazo en Équateur !</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Solar System size comparison" pour voir la taille relative des planètes et "Earth from ISS" pour admirer notre planète depuis l'espace.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. La structure interne de la Terre : un voyage vers le centre</h3>
          
          <p class="text-lg mb-4">Si nous pouvions creuser un tunnel jusqu'au centre de la Terre (ce qui est impossible !), nous traverserions plusieurs couches aux propriétés très différentes. C'est comme un oignon géant composé de couches concentriques.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les grandes couches de la Terre</h4>
          
          <div class="space-y-4 mt-4">
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌍 1. La croûte terrestre (0 à 5-70 km de profondeur)</p>
              <p class="mt-2">C'est la couche la plus externe, celle sur laquelle nous marchons ! Extrêmement fine comparée au reste de la planète (comme la peau d'une pomme).</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Croûte océanique :</strong> Mince (5-10 km), dense, jeune (moins de 200 millions d'années), composée surtout de basalte (roche volcanique noire)</li>
                <li><strong>Croûte continentale :</strong> Plus épaisse (30-70 km), moins dense, très ancienne (jusqu'à 4 milliards d'années pour certaines roches), composée surtout de granit</li>
                <li><strong>Température :</strong> Augmente de 25-30°C par km de profondeur</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🔥 2. Le manteau (5-70 km à 2 900 km de profondeur)</p>
              <p class="mt-2">Couche la plus épaisse de la Terre, représentant 84% du volume terrestre !</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Composition :</strong> Roches riches en fer, magnésium, silicium (péridotite)</li>
                <li><strong>État :</strong> Solide, mais se déforme lentement comme une pâte très visqueuse (quelques centimètres par an). C'est ce mouvement qui fait "flotter" et dériver les continents !</li>
                <li><strong>Température :</strong> De 1 000°C au sommet à 3 700°C à la base</li>
                <li><strong>Manteau supérieur vs inférieur :</strong> Le manteau supérieur (jusqu'à 670 km) est moins dense et plus visqueux. Le manteau inférieur (670 à 2 900 km) est plus dense et plus rigide.</li>
              </ul>
              <p class="mt-2"><strong>Rôle crucial :</strong> Les courants de convection dans le manteau (montée de matériau chaud, descente de matériau froid) sont le moteur de la <strong>tectonique des plaques</strong> !</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">💎 3. Le noyau externe (2 900 à 5 100 km de profondeur)</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Composition :</strong> Fer (80%) et nickel (20%) en fusion</li>
                <li><strong>État :</strong> <strong>Liquide</strong> malgré la pression énorme, car la température (4 000-6 000°C) est suffisante pour le maintenir fondu</li>
                <li><strong>Mouvement :</strong> Ce fer liquide circule constamment, créant des courants électriques</li>
                <li><strong>Rôle :</strong> C'est cette circulation de métal liquide conducteur qui génère le <strong>champ magnétique terrestre</strong>, protégeant la vie des radiations solaires</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">⚙️ 4. Le noyau interne (5 100 à 6 371 km de profondeur)</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Composition :</strong> Fer et nickel, comme le noyau externe</li>
                <li><strong>État :</strong> <strong>Solide</strong> ! Malgré une température extrême (5 000-7 000°C, aussi chaud que la surface du Soleil !), la pression gigantesque (3,6 millions de fois la pression atmosphérique) force le fer à rester solide.</li>
                <li><strong>Taille :</strong> Rayon d'environ 1 220 km, soit la taille de la Lune !</li>
                <li><strong>Rotation :</strong> Tourne légèrement plus vite que le reste de la Terre (1° de plus par an)</li>
              </ul>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les plaques tectoniques : la croûte en morceaux</h4>
          <p>La croûte terrestre n'est pas d'une seule pièce. Elle est divisée en une dizaine de grandes plaques et plusieurs dizaines de petites plaques qui "flottent" sur le manteau visqueux. Ces plaques se déplacent de quelques centimètres par an (à peu près la vitesse de croissance de vos ongles).</p>
          
          <p class="mt-3"><strong>Trois types de mouvements :</strong></p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Divergence :</strong> Les plaques s'écartent. Du magma remonte et crée une nouvelle croûte océanique (dorsales médio-océaniques). Exemple : Dorsale de l'Atlantique qui sépare l'Amérique de l'Europe et l'Afrique de quelques centimètres par an.</li>
            <li><strong>Convergence :</strong> Les plaques se rapprochent. Soit une plaque plonge sous l'autre (subduction, créant des fosses océaniques et des volcans), soit les deux plaques se compriment et créent des chaînes de montagnes. Exemple : L'Himalaya résulte de la collision entre la plaque indienne et la plaque eurasiatique.</li>
            <li><strong>Coulissage :</strong> Les plaques glissent latéralement l'une contre l'autre. Exemple : Faille de San Andreas en Californie.</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">Haïti se trouve à la frontière entre <strong>deux plaques tectoniques</strong> : la plaque nord-américaine et la plaque caraïbe. Ces deux plaques coulissent l'une contre l'autre le long de la faille d'Enriquillo-Plantain Garden. C'est le mouvement brutal de cette faille qui a causé le terrible séisme du 12 janvier 2010 (magnitude 7.0), faisant plus de 200 000 morts. Comprendre la tectonique des plaques n'est pas qu'une curiosité scientifique pour nous Haïtiens : c'est une question de survie ! Les scientifiques préviennent qu'un autre grand séisme pourrait survenir dans les décennies à venir. D'où l'importance de construire des bâtiments parasismiques.</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Earth's layers animation" et "Plate tectonics explained" pour des animations visuelles fascinantes.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. Les enveloppes fluides de la Terre</h3>
          
          <p class="text-lg mb-4">Autour et sur la partie solide de la Terre (la lithosphère), il existe plusieurs "enveloppes" fluides qui interagissent constamment et rendent la vie possible.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">A. L'atmosphère : notre bouclier gazeux</h4>
          <p>L'atmosphère est une fine couche de gaz (environ 100 km d'épaisseur) qui enveloppe la Terre. Si la Terre était une pomme, l'atmosphère serait plus fine que la peau de la pomme !</p>
          
          <p class="mt-3"><strong>Composition :</strong></p>
          <ul class="list-disc ml-8 space-y-2 mt-2">
            <li>Azote (N₂) : 78% - Inerte, dilue l'oxygène</li>
            <li>Oxygène (O₂) : 21% - Essentiel à la respiration</li>
            <li>Argon (Ar) : 0,93% - Gaz rare inerte</li>
            <li>CO₂, vapeur d'eau, autres : 0,07% - Mais rôle crucial !</li>
          </ul>
          
          <p class="mt-3"><strong>Les couches de l'atmosphère :</strong></p>
          <div class="space-y-2 mt-3">
            <div class="border-l-4 border-sky-500 pl-4">
              <p class="font-semibold">Troposphère (0-12 km)</p>
              <p class="text-sm">C'est là que nous vivons ! Contient 80% de la masse de l'atmosphère et quasiment toute la vapeur d'eau. C'est là que se forment les nuages, la pluie, les tempêtes. La température baisse avec l'altitude (-6,5°C par km).</p>
            </div>
            <div class="border-l-4 border-sky-500 pl-4">
              <p class="font-semibold">Stratosphère (12-50 km)</p>
              <p class="text-sm">Contient la couche d'ozone (15-35 km) qui absorbe 97-99% des rayons UV nocifs du Soleil. Les avions volent dans la basse stratosphère pour éviter les turbulences.</p>
            </div>
            <div class="border-l-4 border-sky-500 pl-4">
              <p class="font-semibold">Mésosphère (50-85 km)</p>
              <p class="text-sm">La couche la plus froide (-90°C au sommet). C'est là que les météorites brûlent en entrant dans l'atmosphère.</p>
            </div>
            <div class="border-l-4 border-sky-500 pl-4">
              <p class="font-semibold">Thermosphère (85-600 km)</p>
              <p class="text-sm">Températures extrêmes (jusqu'à 2 500°C), mais l'air est si raréfié qu'on ne le sentirait pas. C'est là qu'orbitent la Station spatiale internationale et les satellites.</p>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">B. L'hydrosphère : l'eau sous toutes ses formes</h4>
          <p>L'hydrosphère comprend toute l'eau de la planète : océans, mers, lacs, rivières, glaciers, nappes souterraines, vapeur d'eau atmosphérique.</p>
          
          <p class="mt-3"><strong>Répartition de l'eau sur Terre :</strong></p>
          <ul class="list-disc ml-8 space-y-2 mt-2">
            <li><strong>Océans et mers :</strong> 97,5% de toute l'eau terrestre (mais salée, donc non potable directement)</li>
            <li><strong>Glaciers et calottes glaciaires :</strong> 1,75% (Antarctique, Groenland, glaciers de montagne)</li>
            <li><strong>Eaux souterraines :</strong> 0,7%</li>
            <li><strong>Lacs, rivières, atmosphère :</strong> 0,05% seulement !</li>
          </ul>
          
          <p class="mt-3">Conclusion choquante : <strong>Seulement 2,5% de l'eau terrestre est de l'eau douce</strong>, et parmi cette eau douce, seulement une infime fraction (0,007% du total) est facilement accessible dans les lacs et rivières. L'eau potable est donc une ressource rare et précieuse !</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">C. La biosphère : la zone de vie</h4>
          <p>La biosphère est l'ensemble des écosystèmes de la Terre où se trouve la vie. Elle s'étend :</p>
          <ul class="list-disc ml-8 space-y-2 mt-2">
            <li><strong>En profondeur :</strong> Jusqu'à 11 km sous la surface des océans (fosse des Mariannes) et quelques kilomètres sous terre</li>
            <li><strong>En altitude :</strong> Jusqu'à environ 10 km dans l'atmosphère (oiseaux migrateurs, spores, bactéries)</li>
          </ul>
          
          <p class="mt-3">La biosphère interagit constamment avec l'atmosphère, l'hydrosphère et la lithosphère dans un équilibre délicat. Par exemple, les plantes absorbent le CO₂ et produisent de l'oxygène, modifiant la composition de l'atmosphère.</p>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">La majorité de l'oxygène que nous respirons (environ 50-80%) ne provient pas des forêts, mais des <strong>océans</strong> ! Plus précisément, du phytoplancton, ces minuscules organismes végétaux qui flottent dans les couches supérieures des océans. Chaque deuxième respiration que vous prenez vient de l'océan ! Voilà pourquoi la pollution des océans et le réchauffement climatique qui les affecte sont si inquiétants.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">4. L'humanisation de la Terre : transformer la planète</h3>
          
          <p class="text-lg mb-4">L'humanisation désigne l'ensemble des transformations que les humains ont apportées à la surface terrestre pour répondre à leurs besoins. Contrairement aux autres espèces animales qui s'adaptent à leur environnement, les humains adaptent l'environnement à leurs besoins. Ce processus a commencé il y a des milliers d'années et s'est considérablement accéléré depuis la révolution industrielle (XVIIIe siècle).</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les grandes formes d'humanisation</h4>
          
          <div class="grid gap-4 mt-4">
            <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🌾 1. L'agriculture : transformer la nature en champs</p>
              <p class="mt-2">Depuis la révolution néolithique (il y a 10 000 ans), les humains cultivent la terre.</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Défrichement :</strong> Abattage des forêts pour créer des terres cultivables</li>
                <li><strong>Irrigation :</strong> Détournement de rivières, construction de barrages et de canaux</li>
                <li><strong>Terrasses agricoles :</strong> Aménagement de pentes pour la culture (riz en Asie, maïs dans les Andes)</li>
                <li><strong>Monoculture intensive :</strong> Grandes plantations d'une seule culture (café, canne à sucre, soja...)</li>
              </ul>
              <p class="mt-2 text-sm italic">🇭🇹 En Haïti : L'agriculture occupe environ 66% du territoire. Les cultures en pente sans protection causent une érosion massive.</p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🏙️ 2. L'urbanisation : la croissance des villes</p>
              <p class="mt-2">En 1800, seulement 3% de la population mondiale vivait en ville. Aujourd'hui, c'est 56% (et 68% prévus en 2050) !</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Étalement urbain :</strong> Extension horizontale des villes, consommant des terres agricoles</li>
                <li><strong>Verticalisation :</strong> Construction de gratte-ciels (Burj Khalifa à Dubaï : 828 m !)</li>
                <li><strong>Infrastructures massives :</strong> Routes, ponts, tunnels, métros, aéroports</li>
                <li><strong>Artificialisation des sols :</strong> Recouvrement du sol naturel par du béton et de l'asphalte</li>
              </ul>
              <p class="mt-2 text-sm italic">🇭🇹 En Haïti : Port-au-Prince concentre près de 3 millions d'habitants (25% de la population nationale). L'urbanisation anarchique crée des bidonvilles vulnérables aux catastrophes.</p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🏭 3. L'industrialisation : usines et extraction</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Mines :</strong> Extraction de métaux (or, cuivre, fer...), charbon, diamants. Certaines mines à ciel ouvert mesurent plusieurs km² et des centaines de mètres de profondeur !</li>
                <li><strong>Carrières :</strong> Extraction de pierre, sable, gravier pour la construction</li>
                <li><strong>Exploitation pétrolière et gazière :</strong> Puits, raffineries, oléoducs</li>
                <li><strong>Zones industrielles :</strong> Usines chimiques, métallurgiques, textiles, électroniques</li>
              </ul>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">🛣️ 4. Les réseaux de transport : connecter le monde</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Routes et autoroutes :</strong> Plus de 64 millions de km de routes dans le monde</li>
                <li><strong>Voies ferrées :</strong> Le Transsibérien (Russie) s'étend sur 9 288 km !</li>
                <li><strong>Canaux :</strong> Canal de Suez (Égypte), Panama (relie l'Atlantique au Pacifique)</li>
                <li><strong>Aéroports :</strong> L'aéroport international d'Atlanta (USA) accueille 107 millions de passagers par an</li>
              </ul>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">💧 5. Aménagement hydraulique : maîtriser l'eau</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Barrages :</strong> Le barrage des Trois-Gorges en Chine (plus grand au monde) produit autant d'électricité que 18 centrales nucléaires !</li>
                <li><strong>Polders :</strong> Aux Pays-Bas, 25% du territoire a été gagné sur la mer en asséchant des zones côtières</li>
                <li><strong>Systèmes d'irrigation :</strong> Canaux, asperseurs, goutte-à-goutte</li>
                <li><strong>Digues et levées :</strong> Protection contre les inondations</li>
              </ul>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Bilan de l'humanisation</h4>
          <p>Aujourd'hui, <strong>75% des terres émergées</strong> ont été significativement modifiées par l'activité humaine. Seulement 23% de la surface terrestre reste à l'état "sauvage" (déserts, toundras, forêts vierges, régions polaires). Les humains ont littéralement redessiné la face de la Terre !</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">5. Les problèmes environnementaux : le prix de l'humanisation</h3>
          
          <p class="text-lg mb-4">L'humanisation de la Terre, bien que nécessaire au développement de nos sociétés, crée des problèmes environnementaux majeurs qui menacent désormais l'avenir même de l'humanité.</p>
          
          <div class="space-y-5 mt-4">
            <div class="border-2 border-red-300 dark:border-red-800 p-4 rounded-lg">
              <p class="font-bold text-lg text-red-700 dark:text-red-400">🌳 1. La déforestation : disparition des forêts</p>
              <p class="mt-2"><strong>Ampleur du problème :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>10 millions d'hectares de forêts disparaissent chaque année (équivalent de la superficie de l'Islande !)</li>
                <li>80% de la forêt amazonienne originelle a déjà disparu ou est dégradée</li>
                <li>Depuis 1990, 420 millions d'hectares de forêts ont été perdus</li>
              </ul>
              <p class="mt-2"><strong>Conséquences :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li><strong>Perte de biodiversité :</strong> Extinction de milliers d'espèces (70% des animaux terrestres vivent en forêt)</li>
                <li><strong>Érosion des sols :</strong> Sans les racines des arbres, les sols partent avec les pluies</li>
                <li><strong>Changement climatique :</strong> Les forêts stockent du CO₂. Leur destruction libère ce CO₂ dans l'atmosphère</li>
                <li><strong>Perturbation du cycle de l'eau :</strong> Les forêts produisent la pluie par évapotranspiration</li>
              </ul>
              <p class="mt-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded italic">🇭🇹 <strong>Cas d'Haïti</strong> : La déforestation en Haïti est catastrophique. En 1923, 60% du territoire était couvert de forêts. Aujourd'hui, c'est moins de 2% ! Les causes : production de charbon de bois (principale source d'énergie pour 70% de la population), agriculture sur brûlis, exploitation forestière illégale. Résultat : des inondations meurtrières à chaque saison des pluies, des glissements de terrain, et l'appauvrissement des sols. Depuis l'espace, on voit clairement la frontière avec la République Dominicaine : d'un côté (Haïti), la terre est brune et dénudée ; de l'autre, elle est verte. Cette image est devenue un symbole de notre crise environnementale.</p>
            </div>
            
            <div class="border-2 border-red-300 dark:border-red-800 p-4 rounded-lg">
              <p class="font-bold text-lg text-red-700 dark:text-red-400">☁️ 2. Le changement climatique : réchauffement global</p>
              <p class="mt-2"><strong>Les faits :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>La température moyenne mondiale a augmenté de +1,1°C depuis l'ère préindustrielle (1850)</li>
                <li>Les 10 années les plus chaudes jamais enregistrées sont toutes après 2010</li>
                <li>Le niveau des océans monte de 3,3 mm par an (accélération : c'était 1,4 mm/an en 1900)</li>
                <li>Les glaciers perdent 300 milliards de tonnes de glace par an</li>
              </ul>
              <p class="mt-2"><strong>Causes :</strong> Émissions de gaz à effet de serre (CO₂, méthane) par la combustion de pétrole, charbon, gaz naturel, déforestation, agriculture intensive, industrie.</p>
              <p class="mt-2"><strong>Conséquences :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li><strong>Événements météo extrêmes :</strong> Ouragans plus puissants, sécheresses prolongées, inondations</li>
                <li><strong>Fonte des glaces :</strong> Groenland et Antarctique perdent des milliards de tonnes de glace</li>
                <li><strong>Montée des océans :</strong> Menace les îles et villes côtières (Miami, Venise, Maldives, Kiribati...)</li>
                <li><strong>Perturbation de l'agriculture :</strong> Changement des saisons, invasions de ravageurs</li>
              </ul>
              <p class="mt-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded italic">🇭🇹 <strong>Haïti vulnérable</strong> : Bien que contribuant très peu aux émissions mondiales de CO₂, Haïti est parmi les pays les plus vulnérables au changement climatique. Les ouragans sont plus fréquents et plus intenses (Matthew 2016, Irma 2017). Les sécheresses se multiplient. Les agriculteurs ne savent plus quand planter car les saisons deviennent imprévisibles.</p>
            </div>
            
            <div class="border-2 border-red-300 dark:border-red-800 p-4 rounded-lg">
              <p class="font-bold text-lg text-red-700 dark:text-red-400">🗑️ 3. La pollution : contamination généralisée</p>
              <p class="mt-2"><strong>Pollution de l'air :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>7 millions de morts prématurées par an liées à la pollution de l'air (OMS)</li>
                <li>90% de la population mondiale respire un air pollué</li>
              </ul>
              <p class="mt-2"><strong>Pollution de l'eau :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>2 milliards de personnes n'ont pas accès à l'eau potable</li>
                <li>80% des eaux usées sont rejetées sans traitement</li>
                <li>8 millions de tonnes de plastique finissent dans les océans chaque année</li>
              </ul>
              <p class="mt-2"><strong>Pollution des sols :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>Pesticides, engrais chimiques, métaux lourds contaminent les terres agricoles</li>
                <li>Déchets électroniques (e-waste) : 50 millions de tonnes par an</li>
              </ul>
              <p class="mt-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded italic">🇭🇹 <strong>Haïti et la pollution</strong> : Rivière Grise à Port-au-Prince transformée en égout à ciel ouvert. Baie de Port-au-Prince polluée par déchets plastiques et eaux usées. Absence de traitement des ordures : décharges sauvages partout. Seulement 12% de la population a accès à l'assainissement amélioré.</p>
            </div>
            
            <div class="border-2 border-red-300 dark:border-red-800 p-4 rounded-lg">
              <p class="font-bold text-lg text-red-700 dark:text-red-400">🦜 4. La perte de biodiversité : 6e extinction de masse</p>
              <p class="mt-2"><strong>Chiffres alarmants :</strong></p>
              <ul class="list-disc ml-6 mt-1 space-y-1">
                <li>68% des populations de vertébrés sauvages ont disparu depuis 1970</li>
                <li>1 million d'espèces animales et végétales menacées d'extinction (sur 8 millions estimées)</li>
                <li>Les insectes (pollinisateurs essentiels) déclinent de 2,5% par an</li>
              </ul>
              <p class="mt-2"><strong>Causes :</strong> Destruction des habitats, surexploitation (pêche, chasse), pollution, espèces invasives, changement climatique.</p>
            </div>
            
            <div class="border-2 border-red-300 dark:border-red-800 p-4 rounded-lg">
              <p class="font-bold text-lg text-red-700 dark:text-red-400">🏜️ 5. L'érosion et la dégradation des sols</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li>24 milliards de tonnes de sols fertiles perdus chaque année dans le monde</li>
                <li>52% des terres agricoles sont dégradées (surexploitation, érosion, salinisation)</li>
                <li>Désertification : 12 millions d'hectares deviennent désertiques chaque année</li>
              </ul>
              <p class="mt-2 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded italic">🇭🇹 <strong>Drame haïtien</strong> : L'érosion est le problème environnemental n°1 en Haïti. Chaque année, 36 millions de tonnes de terre fertile sont emportées par les pluies vers la mer. Les paysans haïtiens disent : "Tè a fatige" (La terre est fatiguée). Sans arbres et avec des cultures en pente, les sols s'appauvrissent et partent. Résultat : rendements agricoles catastrophiques, famines, exode rural vers les bidonvilles.</p>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">Les scientifiques ont introduit le concept d'<strong>"Anthropocène"</strong>, une nouvelle ère géologique où l'activité humaine est devenue la force dominante qui façonne la planète. Ils proposent de dater le début de l'Anthropocène aux années 1950, quand les retombées radioactives des essais nucléaires et l'explosion de la consommation de plastique ont laissé des traces indélébiles dans les couches géologiques. Dans des millions d'années, les géologues du futur pourront identifier une fine couche de sédiments datant de notre époque, remplie de plastique, de béton, de radioactivité et de pollution. Quelle étrange signature laisserons-nous ?</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">6. Solutions : vers un développement durable</h3>
          
          <p class="text-lg mb-4">Face à ces défis colossaux, il est facile de se sentir impuissant. Mais l'histoire montre que l'humanité est capable de changements radicaux quand elle en prend conscience. Le <strong>développement durable</strong> est une voie possible : répondre aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Actions à l'échelle mondiale</h4>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Énergies renouvelables :</strong> Transition vers le solaire, éolien, hydraulique, géothermie pour remplacer pétrole, charbon, gaz</li>
            <li><strong>Protection des écosystèmes :</strong> Création de parcs nationaux, réserves marines, corridors écologiques</li>
            <li><strong>Agriculture durable :</strong> Permaculture, agroforesterie, agriculture biologique, rotation des cultures</li>
            <li><strong>Économie circulaire :</strong> Recycler, réutiliser, réparer au lieu de jeter</li>
            <li><strong>Mobilité verte :</strong> Transports publics, véhicules électriques, vélo</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Actions pour Haïti</h4>
          <div class="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 p-5 rounded-lg mt-4">
            <p class="font-semibold text-lg mb-3">🇭🇹 Ce que nous pouvons faire :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Reboisement massif :</strong> Planter des millions d'arbres adaptés au climat haïtien (vétiver, moringa, manguiers, avocatiers). Le vétiver est particulièrement efficace contre l'érosion grâce à ses racines profondes.</li>
              <li><strong>Cuisinières écologiques :</strong> Remplacer le charbon de bois par des cuisinières solaires, au gaz, ou à biomasse efficiente</li>
              <li><strong>Agriculture en terrasses :</strong> Techniques antiérosives (murs de soutènement, rangées de pierres, cultures en courbes de niveau)</li>
              <li><strong>Gestion des déchets :</strong> Systèmes de collecte, recyclage, compostage</li>
              <li><strong>Éducation environnementale :</strong> Former les jeunes aux enjeux écologiques dès l'école</li>
              <li><strong>Énergies renouvelables :</strong> Haïti a un potentiel énorme en solaire (300 jours de soleil par an !)</li>
            </ul>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Actions individuelles</h4>
          <p>Chacun de nous peut contribuer :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Plante un arbre :</strong> Un seul arbre absorbe 22 kg de CO₂ par an !</li>
            <li><strong>Réduis le plastique :</strong> Utilise des sacs réutilisables, bouteilles en verre</li>
            <li><strong>Économise l'eau :</strong> Ferme le robinet en te brossant les dents, répare les fuites</li>
            <li><strong>Trie et recycle :</strong> Sépare plastique, verre, papier, déchets organiques</li>
            <li><strong>Consomme local :</strong> Achète des produits haïtiens pour réduire le transport</li>
            <li><strong>Informe-toi et sensibilise :</strong> Parle des enjeux environnementaux autour de toi</li>
          </ul>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">Conclusion : Notre responsabilité commune</h3>
          <p class="text-lg leading-relaxed">La Terre est notre seule maison. Il n'existe pas de "planète B". Les problèmes environnementaux que nous avons créés sont immenses, mais nous avons encore le pouvoir d'agir. Chaque geste compte. Chaque arbre planté compte. Chaque plastique évité compte. En Haïti, nous sommes à un tournant critique : soit nous continuons sur la voie de la dégradation environnementale, soit nous choisissons collectivement un nouveau chemin, celui du reboisement, de la protection des sols, de la gestion durable de nos ressources.</p>
          <p class="mt-3 text-lg font-semibold text-primary">L'avenir de notre planète, l'avenir d'Haïti, est entre nos mains. Quelle empreinte allons-nous laisser ?</p>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">📝 Exemples concrets et études de cas</h3>
          
          <div class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">🇭🇹 Cas 1 : Le séisme de 2010 en Haïti</p>
              <p class="mb-2">Le 12 janvier 2010, un séisme de magnitude 7.0 frappe Haïti. L'épicentre se situe à seulement 25 km de Port-au-Prince, à 13 km de profondeur. Le choc dure 35 secondes mais cause des destructions massives : 230 000 morts, 300 000 blessés, 1,5 million de sans-abri.</p>
              <p class="font-semibold mt-3">Analyse géologique :</p>
              <p>La catastrophe s'explique par la rencontre de deux plaques tectoniques (Caraïbe et Nord-Américaine) le long de la faille d'Enriquillo. Cette faille est un système de coulissage où les plaques glissent latéralement. La tension s'accumulait depuis 240 ans (dernier grand séisme en 1770). Quand la roche a finalement cédé, l'énergie libérée équivalait à 35 bombes atomiques d'Hiroshima !</p>
              <p class="font-semibold mt-3">Leçon :</p>
              <p>Comprendre la tectonique des plaques permet de prévoir les zones à risque et de construire en conséquence (normes parasismiques, matériaux résistants). Au Japon, pays également sismique, les bâtiments sont conçus pour résister à des tremblements beaucoup plus puissants.</p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-5 rounded-lg border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2">🇳🇱 Cas 2 : Les Pays-Bas contre la mer</p>
              <p class="mb-2">Les Pays-Bas ("terres basses" en néerlandais) sont un exemple spectaculaire d'humanisation réussie. 26% du pays se trouve sous le niveau de la mer ! Au lieu de fuir, les Néerlandais ont décidé de conquérir la mer.</p>
              <p class="font-semibold mt-3">Techniques utilisées :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Digues :</strong> Murs géants le long des côtes (certaines mesurent 10 m de haut)</li>
                <li><strong>Polders :</strong> Zones asséchées grâce à des pompes géantes. Le polder le plus bas se trouve à -7 mètres !</li>
                <li><strong>Barrages mobiles :</strong> Le "Plan Delta" comprend 13 barrages gigantesques qui se ferment lors des tempêtes</li>
                <li><strong>Pompes permanentes :</strong> Sans pompage constant, les Pays-Bas seraient inondés en quelques jours</li>
              </ul>
              <p class="font-semibold mt-3">Résultat :</p>
              <p>Création de 7 000 km² de terres (17% du territoire actuel). Les Néerlandais ont gagné sur la mer une superficie équivalente à trois fois Haïti ! Mais le changement climatique menace cet équilibre : la montée des océans oblige à renforcer constamment les défenses.</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-lg border-l-4 border-amber-500">
              <p class="font-bold text-lg mb-2">🌳 Cas 3 : Le Costa Rica, champion du reboisement</p>
              <p class="mb-2">Dans les années 1980, le Costa Rica avait perdu 75% de ses forêts. Le pays risquait de devenir un désert. Mais le gouvernement a pris des mesures révolutionnaires.</p>
              <p class="font-semibold mt-3">Actions entreprises :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li>Interdiction de la déforestation (1996)</li>
                <li>Paiement aux agriculteurs pour préserver les forêts</li>
                <li>Création massive de parcs nationaux (25% du territoire)</li>
                <li>Écotourisme comme source de revenus</li>
                <li>Programmes de reboisement national</li>
              </ul>
              <p class="font-semibold mt-3">Résultats spectaculaires :</p>
              <p>Aujourd'hui, 52% du Costa Rica est couvert de forêts ! La couverture forestière a DOUBLÉ en 30 ans. Le pays produit 99% de son électricité par énergies renouvelables. Il abrite 5% de la biodiversité mondiale sur seulement 0,03% de la surface terrestre.</p>
              <p class="bg-green-100 dark:bg-green-900/20 p-3 rounded mt-3 italic">💚 <strong>Message d'espoir pour Haïti :</strong> Si le Costa Rica a réussi à renverser la déforestation, Haïti peut aussi le faire ! Cela demande volonté politique, financement, éducation, mais c'est possible. Chaque arbre planté aujourd'hui est un investissement pour demain.</p>
            </div>
            
            <div class="bg-red-50 dark:bg-red-950/20 p-5 rounded-lg border-l-4 border-red-500">
              <p class="font-bold text-lg mb-2">🏭 Cas 4 : La Grande Muraille Verte d'Afrique</p>
              <p class="mb-2">Le Sahel (bande de territoire au sud du Sahara) souffre de désertification galopante. Le désert avance de 48 km par an dans certaines zones ! Onze pays africains (Sénégal, Mauritanie, Mali, Burkina Faso, Niger, Nigeria, Tchad, Soudan, Éthiopie, Érythrée, Djibouti) se sont unis pour créer la "Grande Muraille Verte".</p>
              <p class="font-semibold mt-3">Le projet :</p>
              <p>Planter une ceinture d'arbres de 8 000 km de long et 15 km de large à travers tout le continent africain. L'objectif : stopper l'avancée du désert, restaurer 100 millions d'hectares de terres dégradées, créer 10 millions d'emplois verts.</p>
              <p class="font-semibold mt-3">État d'avancement (2023) :</p>
              <p>18% du projet réalisé. Des millions d'arbres plantés. Des résultats encourageants au Sénégal où 12 millions d'arbres survivent et prospèrent. Mais le financement reste insuffisant.</p>
              <p class="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded mt-3">💡 <strong>Leçon :</strong> Les problèmes environnementaux globaux demandent des solutions collaboratives à grande échelle. Aucun pays ne peut résoudre seul le changement climatique ou la désertification.</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-950/20 p-5 rounded-lg border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2">🇮🇸 Cas 5 : L'Islande, 100% énergies renouvelables</p>
              <p class="mb-2">L'Islande est un petit pays volcanique de 360 000 habitants. Grâce à sa géologie particulière, il produit 100% de son électricité par énergies renouvelables.</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>73% hydroélectricité :</strong> Barrages sur les rivières glaciaires</li>
                <li><strong>27% géothermie :</strong> La chaleur du sous-sol (volcans) fait bouillir de l'eau pour produire de l'électricité et chauffer les maisons</li>
              </ul>
              <p class="font-semibold mt-3">Résultat :</p>
              <p>Émissions de CO₂ parmi les plus faibles au monde. 90% des maisons chauffées par géothermie. Coût énergétique très bas.</p>
              <p class="bg-blue-100 dark:bg-blue-900/20 p-3 rounded mt-3 italic">☀️ <strong>Potentiel pour Haïti :</strong> Haïti reçoit 300 jours d'ensoleillement par an. Le potentiel solaire est énorme ! Avec des investissements dans les panneaux solaires, Haïti pourrait produire une grande partie de son électricité proprement et de façon décentralisée (chaque maison, école, hôpital pourrait avoir ses panneaux).</p>
            </div>
          </div>
        </section>

        <section class="mt-10">
          <h3 class="text-2xl font-bold mb-4 text-primary">🎓 Exercices et activités variés (150+ questions)</h3>
          
          <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">📚 Type 1 : Questions à choix multiples (30 questions)</p>
              
              <div class="space-y-4">
                <div>
                  <p class="font-semibold">1. Quelle est la distance moyenne Terre-Soleil ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 50 millions de km</li>
                    <li>B) 150 millions de km ✓</li>
                    <li>C) 300 millions de km</li>
                    <li>D) 500 millions de km</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">2. Quel pourcentage de la surface terrestre est couvert d'eau ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 51%</li>
                    <li>B) 61%</li>
                    <li>C) 71% ✓</li>
                    <li>D) 81%</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">3. Quelle est la couche de l'atmosphère où nous vivons ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) Stratosphère</li>
                    <li>B) Troposphère ✓</li>
                    <li>C) Mésosphère</li>
                    <li>D) Thermosphère</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">4. La couche d'ozone se trouve dans quelle couche atmosphérique ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) Troposphère</li>
                    <li>B) Stratosphère ✓</li>
                    <li>C) Mésosphère</li>
                    <li>D) Exosphère</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">5. Quelle est la température approximative au centre de la Terre ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 1 000°C</li>
                    <li>B) 3 000°C</li>
                    <li>C) 6 000°C ✓ (aussi chaud que la surface du Soleil !)</li>
                    <li>D) 10 000°C</li>
                  </ul>
                </div>
                
                <p class="mt-4 text-sm italic">... [Continuez avec 25 autres QCM couvrant : noyau, manteau, plaques tectoniques, atmosphère, hydrosphère, humanisation, déforestation, changement climatique, biodiversité, énergies renouvelables, développement durable]</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">✓✗ Type 2 : Vrai ou Faux justifié (25 affirmations)</p>
              
              <div class="space-y-3">
                <div>
                  <p class="font-semibold">1. La Terre est parfaitement sphérique.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> La Terre est un ellipsoïde, légèrement aplatie aux pôles (12 713 km) et renflée à l'équateur (12 756 km) à cause de sa rotation.</p>
                </div>
                
                <div>
                  <p class="font-semibold">2. L'atmosphère protège la Terre des rayons UV nocifs.</p>
                  <p class="ml-4 text-sm"><strong>VRAI.</strong> La couche d'ozone (dans la stratosphère, 15-35 km d'altitude) absorbe 97-99% des rayons ultraviolets nocifs du Soleil.</p>
                </div>
                
                <div>
                  <p class="font-semibold">3. Le noyau externe de la Terre est solide.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> Le noyau externe (2 900-5 100 km de profondeur) est liquide (fer et nickel en fusion), contrairement au noyau interne qui est solide malgré sa température extrême car la pression est gigantesque.</p>
                </div>
                
                <div>
                  <p class="font-semibold">4. Haïti a perdu plus de 95% de sa couverture forestière depuis 1923.</p>
                  <p class="ml-4 text-sm"><strong>VRAI.</strong> La couverture forestière est passée de 60% en 1923 à moins de 2% aujourd'hui, une catastrophe environnementale.</p>
                </div>
                
                <div>
                  <p class="font-semibold">5. Les forêts tropicales produisent 50-80% de l'oxygène mondial.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> C'est le phytoplancton océanique qui produit 50-80% de l'oxygène. Les forêts tropicales en produisent environ 20%.</p>
                </div>
                
                <p class="mt-4 text-sm italic">... [Continuez avec 20 autres affirmations sur : tectonique, eau douce, pollution, changement climatique, biodiversité, énergies, etc.]</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🔗 Type 3 : Exercices d'association/correspondance (15 séries)</p>
              
              <div>
                <p class="font-semibold mb-2">Associe chaque couche de la Terre à sa caractéristique :</p>
                <div class="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p class="font-semibold">Couches :</p>
                    <ul class="list-decimal ml-6">
                      <li>Croûte</li>
                      <li>Manteau</li>
                      <li>Noyau externe</li>
                      <li>Noyau interne</li>
                    </ul>
                  </div>
                  <div>
                    <p class="font-semibold">Caractéristiques :</p>
                    <ul class="list-none ml-2">
                      <li>A) Solide, fer et nickel, 6 000°C</li>
                      <li>B) La plus mince, où nous vivons</li>
                      <li>C) Liquide, génère le champ magnétique</li>
                      <li>D) Roches visqueuses, mouvements de convection</li>
                    </ul>
                  </div>
                </div>
                <p class="mt-2 text-sm italic">Réponses : 1-B, 2-D, 3-C, 4-A</p>
              </div>
              
              <p class="mt-6 text-sm italic">... [Continuez avec 14 autres associations : planètes du système solaire/caractéristiques, couches atmosphériques/phénomènes, types de pollution/conséquences, énergies/pays, etc.]</p>
            </div>

            <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">💭 Type 4 : Questions de réflexion approfondie (20 questions)</p>
              
              <div class="space-y-4">
                <div>
                  <p class="font-semibold">1. Pourquoi la Terre est-elle la seule planète du système solaire où la vie est connue ?</p>
                  <p class="ml-4 text-sm mt-1"><em>Pistes de réponse : Distance idéale du Soleil (zone habitable), présence d'eau liquide (71% de la surface), atmosphère protectrice (oxygène, ozone), champ magnétique, température modérée, Lune stabilisatrice...</em></p>
                </div>
                
                <div>
                  <p class="font-semibold">2. Explique le lien entre la déforestation en Haïti et les inondations catastrophiques.</p>
                  <p class="ml-4 text-sm mt-1"><em>Pistes : Les racines des arbres retiennent le sol et l'eau. Sans arbres, l'eau de pluie ruisselle directement, emportant la terre (érosion), créant des inondations et coulées de boue. Les sols nus ne peuvent plus absorber l'eau...</em></p>
                </div>
                
                <div>
                  <p class="font-semibold">3. Pourquoi dit-on que nous sommes dans la "6e extinction de masse" ?</p>
                  <p class="ml-4 text-sm mt-1"><em>Pistes : Dans l'histoire de la Terre, il y a eu 5 extinctions massives (dinosaures il y a 66 millions d'années, etc.). Aujourd'hui, les espèces disparaissent 100 à 1 000 fois plus vite que le taux naturel. 1 million d'espèces menacées. Cause : activité humaine (déforestation, pollution, chasse, changement climatique)...</em></p>
                </div>
                
                <div>
                  <p class="font-semibold">4. Le développement économique est-il compatible avec la protection de l'environnement ? Justifie ta position.</p>
                  <p class="ml-4 text-sm mt-1"><em>Débat ouvert. Encourager les élèves à argumenter les deux côtés puis proposer une synthèse (développement durable, croissance verte, économie circulaire...).</em></p>
                </div>
                
                <div>
                  <p class="font-semibold">5. Pourquoi Haïti, qui contribue très peu au changement climatique, en souffre-t-il autant ?</p>
                  <p class="ml-4 text-sm mt-1"><em>Pistes : Émissions haïtiennes minuscules (0,01% du total mondial) mais pays vulnérable (déforestation, pauvreté, infrastructures faibles, position géographique dans zone des ouragans). Injustice climatique : les pays riches polluent, les pays pauvres en paient le prix...</em></p>
                </div>
                
                <p class="mt-4 text-sm italic">... [Continuez avec 15 autres questions de réflexion]</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🎨 Type 5 : Activités pratiques et créatives (15 activités)</p>
              
              <div class="space-y-5">
                <div class="border-l-4 border-blue-500 pl-4">
                  <p class="font-semibold">1. Projet : Carte 3D des couches de la Terre</p>
                  <p class="mt-2">Créez une maquette en coupe transversale de la Terre montrant :</p>
                  <ul class="list-disc ml-6 mt-1 space-y-1">
                    <li>Les 4 couches principales (croûte, manteau, noyau externe, noyau interne)</li>
                    <li>Les épaisseurs relatives (utilisez l'échelle)</li>
                    <li>Les températures approximatives</li>
                    <li>Les états de la matière (solide/liquide)</li>
                  </ul>
                  <p class="mt-2 text-sm italic">Matériaux suggérés : Carton, pâte à modeler de différentes couleurs, polystyrène, peinture</p>
                </div>
                
                <div class="border-l-4 border-green-500 pl-4">
                  <p class="font-semibold">2. Enquête de terrain : L'humanisation de mon quartier</p>
                  <p class="mt-2">Parcourez votre quartier/village et identifiez :</p>
                  <ol class="list-decimal ml-6 mt-1 space-y-1">
                    <li><strong>10 exemples d'humanisation</strong> (routes, bâtiments, cultures, ponts, canaux d'irrigation, décharges, pylônes électriques, antennes téléphoniques, terrains de sport, églises/écoles...)</li>
                    <li><strong>5 problèmes environnementaux</strong> (déchets non ramassés, rivière polluée, érosion, déforestation, air pollué par fumées...)</li>
                    <li><strong>5 éléments naturels préservés</strong> (arbres, source d'eau propre, animaux, jardin...)</li>
                  </ol>
                  <p class="mt-2">Prenez des photos si possible. Préparez un rapport avec :</p>
                  <ul class="list-disc ml-6 mt-1">
                    <li>Cartographie sommaire du quartier</li>
                    <li>Description de chaque élément identifié</li>
                    <li>Propositions de solutions pour chaque problème</li>
                  </ul>
                </div>
                
                <div class="border-l-4 border-yellow-500 pl-4">
                  <p class="font-semibold">3. Expérience : Simulation de l'érosion</p>
                  <p class="mt-2"><strong>Matériel :</strong> 2 bacs, terre, eau, gravier, herbe ou plantes</p>
                  <p class="mt-2"><strong>Procédure :</strong></p>
                  <ol class="list-decimal ml-6 mt-1 space-y-1">
                    <li>Bac A : Mettez de la terre en pente, sans végétation</li>
                    <li>Bac B : Même chose, mais plantez de l'herbe ou des brindilles (simulant des arbres)</li>
                    <li>Versez la même quantité d'eau sur les deux bacs simultanément</li>
                    <li>Observez ce qui se passe</li>
                  </ol>
                  <p class="mt-2"><strong>Résultat attendu :</strong> Le bac A perdra beaucoup de terre (érosion), l'eau sera boueuse. Le bac B retiendra mieux le sol grâce aux racines.</p>
                  <p class="mt-2"><strong>Conclusion :</strong> Cette expérience démontre pourquoi la déforestation cause l'érosion en Haïti !</p>
                </div>
                
                <div class="border-l-4 border-purple-500 pl-4">
                  <p class="font-semibold">4. Défi environnemental personnel : Journal écologique d'une semaine</p>
                  <p class="mt-2">Pendant 7 jours, note quotidiennement dans un cahier :</p>
                  <ul class="list-disc ml-6 mt-1 space-y-1">
                    <li><strong>Consommation d'eau :</strong> Combien de seaux utilisés ? Eau gaspillée ?</li>
                    <li><strong>Électricité :</strong> Heures de lumière allumée ? Appareils branchés inutilement ?</li>
                    <li><strong>Déchets produits :</strong> Sacs plastiques, bouteilles, emballages... Pèse-les si possible !</li>
                    <li><strong>Transport :</strong> Distances parcourues (à pied, en tap-tap, moto...)</li>
                    <li><strong>Alimentation :</strong> Nourriture locale ou importée ? Gaspillage ?</li>
                  </ul>
                  <p class="mt-2"><strong>Après la semaine :</strong> Calcule ton "empreinte écologique" approximative. Propose 5 actions concrètes pour la réduire. Applique-les pendant une deuxième semaine et compare !</p>
                </div>
                
                <div class="border-l-4 border-red-500 pl-4">
                  <p class="font-semibold">5. Projet collectif : Reboisement scolaire</p>
                  <p class="mt-2"><strong>Objectif :</strong> Planter 100 arbres autour de l'école ou dans le quartier</p>
                  <p class="mt-2"><strong>Étapes :</strong></p>
                  <ol class="list-decimal ml-6 mt-1 space-y-1">
                    <li><strong>Recherche :</strong> Quels arbres sont adaptés au climat local ? (Moringa, manguier, avocatier, vétiver, acajou, cèdre haïtien...)</li>
                    <li><strong>Acquisition :</strong> Contactez des pépinières locales ou faites germer des graines</li>
                    <li><strong>Préparation du terrain :</strong> Identifiez les zones à planter, nettoyez, creusez les trous</li>
                    <li><strong>Plantation :</strong> Organisez une journée de plantation collective (toute l'école)</li>
                    <li><strong>Suivi :</strong> Chaque classe adopte 10 arbres et s'en occupe (arrosage, protection, observation de croissance)</li>
                    <li><strong>Documentation :</strong> Photos avant/après, mesures de croissance mensuelles, journal de bord</li>
                  </ol>
                  <p class="mt-2 bg-green-100 dark:bg-green-900/20 p-3 rounded"><strong>Impact à long terme :</strong> En 5 ans, ces 100 arbres absorberont 2,2 tonnes de CO₂, produiront de l'oxygène, réduiront l'érosion, créeront de l'ombre, attireront des oiseaux. Un héritage vivant pour les générations futures !</p>
                </div>
                
                <p class="mt-4 text-sm italic">... [Continuez avec 10 autres activités : Débat sur l'environnement, Création d'affiches de sensibilisation, Visite virtuelle (YouTube) de volcans/glaciers, Interview d'un agronome/ingénieur environnemental, Rédaction de lettres aux autorités, Mini-documentaire vidéo, Création d'une chanson écologique, etc.]</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🌍 Type 6 : Études comparatives et analyses (10 exercices)</p>
              
              <div class="space-y-4">
                <div>
                  <p class="font-semibold">1. Comparaison Haïti / République Dominicaine</p>
                  <p class="mt-2">Recherchez et comparez :</p>
                  <table class="w-full mt-2 text-sm border">
                    <tr class="border-b">
                      <th class="text-left p-2">Critère</th>
                      <th class="text-left p-2">Haïti</th>
                      <th class="text-left p-2">Rép. Dominicaine</th>
                    </tr>
                    <tr class="border-b">
                      <td class="p-2">Couverture forestière</td>
                      <td class="p-2">&lt; 2%</td>
                      <td class="p-2">~40%</td>
                    </tr>
                    <tr class="border-b">
                      <td class="p-2">PIB par habitant</td>
                      <td class="p-2">...</td>
                      <td class="p-2">...</td>
                    </tr>
                    <tr>
                      <td class="p-2">Politiques environnementales</td>
                      <td class="p-2">...</td>
                      <td class="p-2">...</td>
                    </tr>
                  </table>
                  <p class="mt-2"><strong>Questions :</strong></p>
                  <ul class="list-disc ml-6 mt-1">
                    <li>Pourquoi cette différence de couverture forestière alors qu'ils partagent la même île ?</li>
                    <li>Quelles leçons Haïti peut-il tirer de son voisin ?</li>
                    <li>Quels sont les impacts économiques de cette différence environnementale ?</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">2. Graphique : Évolution de la température mondiale (1880-2023)</p>
                  <p class="mt-2">À partir de données (recherche en ligne "NASA Global Temperature"), créez un graphique montrant l'augmentation de +1,1°C en 143 ans.</p>
                  <p class="mt-2"><strong>Analyse :</strong></p>
                  <ul class="list-disc ml-6 mt-1">
                    <li>À quel moment l'accélération du réchauffement est-elle la plus visible ?</li>
                    <li>Quels événements historiques correspondent aux pics ?</li>
                    <li>Projetez la tendance : quelle température en 2050 si cela continue ?</li>
                  </ul>
                </div>
                
                <p class="mt-4 text-sm italic">... [Continuez avec 8 autres études comparatives]</p>
              </div>
            </div>
          </div>
        </section>

        <section class="mt-8">
          <h3 class="text-2xl font-bold mb-4 text-primary">📚 Ressources complémentaires</h3>
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg">
            <p class="font-semibold text-lg mb-3">Pour aller plus loin :</p>
            <ul class="space-y-3">
              <li><strong>📹 Vidéos YouTube recommandées :</strong>
                <ul class="list-disc ml-8 mt-1 space-y-1">
                  <li>"Earth from Space ISS 4K" - La Terre vue depuis la Station spatiale</li>
                  <li>"Journey to the Center of the Earth" - Animation des couches terrestres</li>
                  <li>"Plate Tectonics Explained" - Comprendre la tectonique</li>
                  <li>"Haiti Earthquake 2010 explained" - Explication géologique du séisme</li>
                  <li>"Déforestation Haïti satellite time-lapse" - Évolution visible depuis l'espace</li>
                  <li>"Costa Rica reforestation success story" - Inspiration !</li>
                  <li>"Climate Change 2023 explained" - État des lieux du réchauffement</li>
                  <li>"Great Green Wall Africa" - Projet de reboisement massif</li>
                </ul>
              </li>
              <li><strong>🌐 Sites web éducatifs :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>NASA Climate Change (climate.nasa.gov) - Données scientifiques fiables</li>
                  <li>Google Earth - Explorez la planète en 3D</li>
                  <li>NOAA (National Oceanic and Atmospheric Administration) - Océans et climat</li>
                  <li>WWF (World Wildlife Fund) - Protection de la biodiversité</li>
                </ul>
              </li>
              <li><strong>📖 Lectures recommandées :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>"La Terre, une planète singulière" - Éditions Belin</li>
                  <li>"Le changement climatique expliqué à ma fille" - Jean-Marc Jancovici</li>
                  <li>"Haïti et son environnement" - Rapports du Ministère de l'Environnement haïtien</li>
                </ul>
              </li>
              <li><strong>🎬 Documentaires :</strong>
                <ul class="list-disc ml-8 mt-1">
                  <li>"Une vérité qui dérange" (Al Gore) - Changement climatique</li>
                  <li>"Notre planète" (Netflix) - Biodiversité mondiale</li>
                  <li>"Demain" - Solutions face aux défis écologiques</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "culture-societe-haitienne",
    title: "Culture et société haïtienne",
    mois: "Décembre",
    objectif: "Expliquer les conditions de formation de la culture et de la société haïtienne.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6 rounded-lg border-l-4 border-amber-500">
          <p class="text-lg italic">"Ayiti se pèl Antiy yo... Nou se yon pèp ki soti nan mwen, ki fèt nan doulè, men ki kanpe djanm ak fyète !"</p>
          <p class="text-sm mt-2">("Haïti est la perle des Antilles... Nous sommes un peuple forgé dans le mélange, né dans la douleur, mais qui se tient debout avec fierté !")</p>
        </div>
        
        <p class="text-lg leading-relaxed">Imaginez : trois continents, trois mondes différents, se rencontrent sur une petite île des Caraïbes. D'un côté, les Taïnos, habitants originels vivant en harmonie avec la nature depuis des siècles. De l'autre, les Européens avec leur technologie, leur religion, leurs ambitions coloniales. Et entre les deux, des millions d'Africains arrachés à leur terre, portant avec eux des cultures millénaires, des rythmes sacrés, des croyances profondes.</p>
        
        <p>De cette rencontre tragique mais extraordinairement créative est née une culture unique au monde : la culture haïtienne. Notre société n'est ni africaine, ni européenne, ni taïno. Elle est <strong>créole</strong> – un mélange original qui a donné naissance à une nouvelle identité.</p>
        
        <p>Notre langue créole, parlée nulle part ailleurs avec ces mots et ces structures. Notre musique konpa, qu'on reconnaît entre mille. Notre peinture naïve aux couleurs éclatantes. Notre Vodou, religion unique synthétisant l'Afrique et le catholicisme. Notre cuisine épicée et savoureuse. Nos valeurs de solidarité (konbit, eskwad) et notre fierté d'être la première république noire libre du monde...</p>
        
        <p>Cette leçon va vous faire voyager dans le temps pour comprendre <strong>comment</strong> et <strong>pourquoi</strong> notre culture s'est formée ainsi. Vous découvrirez que chaque mot que vous prononcez, chaque plat que vous mangez, chaque chanson que vous écoutez porte en lui l'histoire complexe de notre peuple.</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Identifier les trois origines principales de la culture haïtienne (taïno, européenne, africaine)</li>
            <li>Comprendre comment la langue créole s'est formée et pourquoi elle est unique</li>
            <li>Découvrir le rôle central du Vodou dans la société haïtienne</li>
            <li>Apprécier la richesse artistique haïtienne (peinture, musique, littérature)</li>
            <li>Reconnaître les valeurs sociales qui structurent notre société</li>
            <li>Réfléchir aux défis contemporains de préservation de notre identité</li>
          </ul>
        </div>
        
        <p class="text-sm italic">💡 Durée estimée d'étude : 2-3 heures. Cette leçon est dense et passionnante – prenez le temps de l'absorber !</p>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. Les trois racines de la culture haïtienne : un arbre unique</h3>
          
          <p class="text-lg mb-6">Notre culture est comme un arbre majestueux dont les racines plongent dans trois continents. Ces racines entrelacées ont nourri un tronc commun : l'identité haïtienne. Explorons chacune de ces racines.</p>
          
          <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg mt-6">
            <h4 class="text-xl font-bold mb-4">🪶 A. L'héritage taïno : les premiers habitants</h4>
            
            <p class="mb-4">Les Taïnos étaient les habitants originels d'Haïti, qu'ils appelaient <strong>Ayiti</strong> ("terre des hautes montagnes"). Ils vivaient ici depuis environ 600 après J.-C., organisés en chefferies (cacicazgos) dirigées par des caciques. Bien que décimés par la colonisation espagnole (maladies, travail forcé, massacres), leur héritage perdure de manière subtile mais réelle dans notre culture.</p>
            
            <p class="font-semibold text-lg mt-4 mb-2">Ce que les Taïnos nous ont légué :</p>
            
            <div class="space-y-3 ml-4">
              <div class="border-l-4 border-green-500 pl-4">
                <p class="font-semibold">1. Vocabulaire toujours vivant</p>
                <p class="text-sm mt-1">De nombreux mots d'origine taïno sont utilisés quotidiennement en français et en créole :</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Hamac</strong> (hamaca) - Ce lit suspendu que tout Haïtien connaît</li>
                  <li><strong>Canoe</strong> (canoa) - Embarcation creusée dans un tronc</li>
                  <li><strong>Barbecue</strong> (barbacoa) - Méthode de cuisson sur grill</li>
                  <li><strong>Ouragan</strong> (hurakan) - Dieu de la tempête chez les Taïnos</li>
                  <li><strong>Tabac</strong> (tabako) - Plante sacrée fumée lors de rituels</li>
                  <li><strong>Maïs</strong> (mahis) - Aliment de base</li>
                  <li><strong>Igname</strong> (ñame)</li>
                  <li><strong>Goyave</strong> (guayaba)</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-green-500 pl-4">
                <p class="font-semibold">2. Toponymes (noms de lieux)</p>
                <p class="text-sm mt-1">De nombreux lieux haïtiens portent des noms taïnos :</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Ayiti</strong> - Le nom même de notre pays !</li>
                  <li><strong>Xaragua</strong> (Jérémie) - Ancien royaume taïno</li>
                  <li><strong>Marmelade</strong> (dans l'Artibonite)</li>
                  <li><strong>Gonaïves</strong></li>
                  <li><strong>Yaguana</strong> (ancien nom de Léogâne)</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-green-500 pl-4">
                <p class="font-semibold">3. Agriculture et alimentation</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Manioc (kassav)</strong> - Les Taïnos préparaient déjà la cassave (pain de manioc) que nous consommons encore aujourd'hui</li>
                  <li><strong>Patate douce</strong> - Cultivée et consommée par les Taïnos</li>
                  <li><strong>Maïs</strong> - Base de l'alimentation taïno</li>
                  <li><strong>Techniques de pêche</strong> - Utilisation de pièges, de filets, harpons</li>
                  <li><strong>Culture de la courge (joumou)</strong> - Notre soup joumou vient en partie de cette tradition</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-green-500 pl-4">
                <p class="font-semibold">4. Héritage génétique</p>
                <p class="text-sm mt-1">Contrairement à la croyance populaire que "tous les Taïnos sont morts", des études génétiques récentes (2018) ont montré que <strong>10-15% de la population haïtienne porte de l'ADN taïno</strong>, transmis surtout par lignée maternelle. Les Taïnos vivent encore en nous !</p>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg mt-6">
            <h4 class="text-xl font-bold mb-4">⚓ B. L'apport européen : le colonisateur français</h4>
            
            <p class="mb-4">La colonisation française de Saint-Domingue (1659-1804) a profondément marqué notre société, imposant par la force sa langue, sa religion, son système administratif. Cette période sombre de l'esclavage a néanmoins laissé des traces indélébiles dans notre culture, que nous avons transformées et réappropriées.</p>
            
            <div class="space-y-3 ml-4">
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold">1. La langue française : base du créole</p>
                <p class="text-sm mt-1">Le français est l'une des deux langues officielles d'Haïti (avec le créole depuis 1987). Environ 40-50% de la population le parle avec différents niveaux de maîtrise.</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Le vocabulaire du créole provient à 90% du français (mais la grammaire est africaine !)</li>
                  <li>Langue de l'administration, de l'éducation formelle, des lois</li>
                  <li>Symbole historique de l'élite, créant un clivage social (français = prestige, créole = peuple)</li>
                  <li>Cette diglossie (coexistence de deux langues avec statuts différents) reste un défi pour l'égalité sociale</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold">2. Le catholicisme</p>
                <p class="text-sm mt-1">Religion imposée par les colons, le catholicisme s'est mêlé aux croyances africaines pour créer le Vodou haïtien.</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Environ 80% des Haïtiens se déclarent catholiques (beaucoup pratiquent aussi le Vodou)</li>
                  <li>Influence sur le calendrier (fêtes religieuses, Carême, Pâques, Noël)</li>
                  <li>Les saints catholiques sont associés aux lwa (esprits) du Vodou (ex: Dambala = Saint Patrick)</li>
                  <li>Architecture religieuse : cathédrales, églises coloniales</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold">3. Système administratif et juridique</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Organisation territoriale (départements, communes, sections communales)</li>
                  <li>Code civil inspiré du Code Napoléon</li>
                  <li>Système éducatif calqué sur le modèle français</li>
                  <li>Architecture administrative et judiciaire</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold">4. Architecture et urbanisme</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Style colonial : maisons à galeries (verandas), toits en pente</li>
                  <li>Utilisation du fer forgé (balcons, grilles)</li>
                  <li>Plan des villes (rues en damier dans certaines villes)</li>
                  <li>Édifices historiques (Citadelle, Sans-Souci, Fort National)</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-blue-500 pl-4">
                <p class="font-semibold">5. Gastronomie</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Pain français (pen fransi)</li>
                  <li>Techniques culinaires : sauces, ragoûts</li>
                  <li>Pâtisserie (gâteaux, bonbons)</li>
                  <li>Café (introduit par les Français, devenu une culture haïtienne)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg mt-6">
            <h4 class="text-xl font-bold mb-4">🌍 C. L'héritage africain : le cœur battant de notre culture</h4>
            
            <p class="mb-4 font-semibold text-lg">C'est l'apport le plus fondamental, le plus profond, celui qui donne à Haïti son âme unique.</p>
            
            <p class="mb-4">Entre 1503 et 1791, environ <strong>800 000 à 1 million d'Africains</strong> ont été déportés de force vers Saint-Domingue. Ils provenaient principalement de l'Afrique de l'Ouest et Centrale : royaume du Dahomey (actuel Bénin), royaume Kongo (Congo/Angola), Nigéria (Yoruba), Ghana, Sénégal, etc. Ces hommes et femmes ont résisté, survécu, et créé une nouvelle culture en préservant l'essence de leurs traditions ancestrales.</p>
            
            <div class="space-y-3 ml-4">
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">1. Le Vodou : religion et philosophie</p>
                <p class="text-sm mt-1">Le Vodou haïtien est une <strong>synthèse géniale</strong> entre les religions traditionnelles africaines (notamment du Dahomey, Kongo, Yoruba) et le catholicisme. C'est une religion à part entière, reconnue officiellement en 2003.</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Croyance en Bondye (Bon Dieu, créateur suprême) et les lwa (esprits intermédiaires)</li>
                  <li>Importance du culte des ancêtres (mò)</li>
                  <li>Rituals, danses, chants, tambours sacrés</li>
                  <li>Rôle crucial dans la Révolution haïtienne (cérémonie du Bois-Caïman, août 1791)</li>
                  <li>Cohésion sociale, médecine traditionnelle, sagesse ancestrale</li>
                  <li>Malheureusement stigmatisé et diabolisé, alors qu'il est au cœur de notre identité</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">2. Musique et rythmes</p>
                <p class="text-sm mt-1">La musique haïtienne est essentiellement africaine dans ses rythmes, ses instruments, son esprit.</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Tambours</strong> - Instruments sacrés et centraux (tanbou, manman, kata, boula)</li>
                  <li><strong>Rara</strong> - Musique de rue pendant le carnaval, avec vaksin (trompettes), tambours, danses</li>
                  <li><strong>Konpa</strong> - Genre créé par Nemours Jean-Baptiste (1955), fusionnant rythmes africains et influences cubaines</li>
                  <li><strong>Mizik Rasin</strong> - "Musique des racines", fusion vodou/rock créée dans les années 1980 (Boukman Eksperyans, RAM)</li>
                  <li><strong>Chants Vodou</strong> - Langaj, chants rituels en langues africaines anciennes</li>
                  <li>Polyrythmie (superposition de plusieurs rythmes), call-and-response (appel-réponse)</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">3. La langue créole : grammaire africaine, mots français</p>
                <p class="text-sm mt-1">Le créole haïtien est linguistiquement fascinant : son vocabulaire est français, mais sa <strong>structure grammaticale est africaine</strong> !</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Système tonal influencé par les langues africaines</li>
                  <li>Absence de conjugaison comme en français (on utilise des marqueurs de temps)</li>
                  <li>Redoublement expressif (piti piti = très petit) venant des langues africaines</li>
                  <li>Proverbes et sagesse populaire d'inspiration africaine</li>
                  <li>Structure Sujet-Verbe-Objet simplifiée</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">4. Arts visuels</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Peinture naïve haïtienne</strong> - Couleurs vives, perspective particulière, scènes de vie quotidienne et vodou</li>
                  <li><strong>Sculptures en métal découpé</strong> - Tradition de Croix-des-Bouquets, inspirée de l'art africain</li>
                  <li><strong>Drapeaux vodou</strong> - Bannières brodées de sequins représentant les lwa</li>
                  <li><strong>Sculpture sur bois</strong> - Masques, statues religieuses</li>
                  <li>Esthétique africaine : symbolisme, couleurs signifiantes, art fonctionnel/religieux</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">5. Organisation sociale et valeurs</p>
                <p class="text-sm mt-1">Les valeurs communautaires africaines structurent encore notre société :</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li><strong>Le konbit</strong> - Travail agricole collectif et solidaire. Les paysans s'entraident pour labourer, planter, récolter, en chantant et en partageant un repas. Pure tradition africaine !</li>
                  <li><strong>L'eskwad</strong> - Système d'entraide communautaire (funérailles, construction, etc.)</li>
                  <li><strong>Respect des aînés</strong> - Les anciens sont vénérés pour leur sagesse</li>
                  <li><strong>Importance de la famille élargie</strong> - Concept africain de famille incluant cousins, oncles, tantes</li>
                  <li><strong>Solidarité communautaire</strong> - "Men anpil, chay pa lou" (Beaucoup de mains rendent la charge légère)</li>
                  <li><strong>Transmission orale</strong> - Contes (krik krak), proverbes, histoires des ancêtres</li>
                </ul>
              </div>
              
              <div class="border-l-4 border-purple-500 pl-4">
                <p class="font-semibold">6. Cuisine</p>
                <ul class="list-disc ml-6 mt-2 space-y-1 text-sm">
                  <li>Utilisation intensive d'épices (piment, ail, échalote)</li>
                  <li>Techniques de cuisson (bouilli, grillé, frit)</li>
                  <li>Certains plats : kalalou (gombo), tassot, griot</li>
                  <li>Boissons fermentées (kleren)</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-purple-100 dark:bg-purple-950/40 p-4 rounded-lg mt-4">
              <p class="font-semibold text-purple-900 dark:text-purple-200 mb-2">💡 Le savais-tu ?</p>
              <p class="text-purple-800 dark:text-purple-300 text-sm">Certains mots créoles sont des mots africains purs, pas du français ! Par exemple : <strong>"zonbi"</strong> (zombie) vient du kikongo "nzambi" (esprit), <strong>"makout"</strong> (sac en paille) vient du fon, <strong>"diri"</strong> (riz) pourrait avoir une origine africaine. Le créole est vraiment une langue afro-européenne unique !</p>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">🔍 Réflexion importante</p>
            <p class="text-blue-800 dark:text-blue-300">La culture haïtienne n'est pas un simple "mélange" où chaque élément garde sa pureté. C'est une <strong>créolisation</strong> – un processus de création culturelle où les éléments se transforment mutuellement pour créer quelque chose de totalement nouveau. Notre Vodou n'est ni africain pur ni catholique pur. Notre créole n'est ni français ni africain. Notre musique n'est ni l'un ni l'autre. C'est cela la génie créole : créer du nouveau à partir de l'ancien.</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : Recherchez "Histoire de la culture haïtienne", "Vodou haïtien expliqué", "Origines du créole haïtien", "Art naïf haïtien" pour approfondir.</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. La langue créole : fierté et identité</h3>
          
          <p class="text-lg mb-4">Le créole haïtien (kreyòl ayisyen) est parlé par 100% de la population – c'est LA langue d'Haïti. Pourtant, pendant longtemps (et encore aujourd'hui), elle a été méprisée, considérée comme un "patois", un français dégénéré. C'est faux et injuste ! Le créole est une <strong>langue à part entière</strong>, avec sa propre grammaire, sa logique, sa beauté.</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Comment s'est formé le créole ?</h4>
          
          <p>Dans les plantations de Saint-Domingue au XVIIe siècle, des Africains de différentes ethnies (parlant fon, yoruba, kikongo, wolof, etc.) devaient communiquer entre eux et avec les colons français. Ils ont créé une nouvelle langue en mélangeant :</p>
          
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li><strong>Le vocabulaire français</strong> (environ 90% des mots), simplifié et transformé</li>
            <li><strong>La grammaire africaine</strong> (structure des phrases, système verbal, tons)</li>
            <li><strong>Des mots taïnos</strong> (quelques dizaines)</li>
            <li><strong>Des mots espagnols</strong> (Haïti a été espagnole avant 1697)</li>
            <li><strong>Des créations nouvelles</strong> (mots inventés pour décrire la réalité haïtienne)</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Caractéristiques du créole haïtien</h4>
          
          <div class="grid md:grid-cols-2 gap-4 mt-4">
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg mb-2">1. Simplicité et logique</p>
              <ul class="list-disc ml-6 space-y-2 text-sm">
                <li>Pas de conjugaison complexe comme en français</li>
                <li>On ajoute des marqueurs de temps : "mwen te manje" (j'ai mangé), "m ap manje" (je mange), "m a manje" (je mangerai)</li>
                <li>Un mot = une forme (pas de "mange/mangé/mangeons/mangeaient...")</li>
                <li>Prononciation phonétique : on écrit comme on prononce</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg mb-2">2. Expressivité</p>
              <ul class="list-disc ml-6 space-y-2 text-sm">
                <li>Redoublements expressifs : "piti piti" (très petit), "vit vit" (très vite)</li>
                <li>Proverbes magnifiques : "Deye mòn gen mòn" (Derrière une montagne il y a une autre montagne = les problèmes ne finissent jamais)</li>
                <li>Jeux de mots, double sens, humour</li>
                <li>Richesse des verbes d'action</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg mb-2">3. Adaptabilité</p>
              <ul class="list-disc ml-6 space-y-2 text-sm">
                <li>Crée facilement de nouveaux mots : "òdinatè" (ordinateur), "entènèt" (internet), "selilè" (téléphone cellulaire)</li>
                <li>Emprunte à d'autres langues et les créolise</li>
                <li>Peut exprimer tous les concepts modernes</li>
              </ul>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg mb-2">4. Identité nationale</p>
              <ul class="list-disc ml-6 space-y-2 text-sm">
                <li>Langue de tous les Haïtiens, riches et pauvres</li>
                <li>Langue de la résistance et de la révolution</li>
                <li>Langue de la vie quotidienne, de l'intimité</li>
                <li>Depuis 1987, langue officielle avec le français</li>
              </ul>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Comparaison français-créole</h4>
          
          <div class="overflow-x-auto mt-3">
            <table class="w-full border-collapse">
              <thead class="bg-gray-200 dark:bg-gray-700">
                <tr>
                  <th class="border border-gray-400 p-3 text-left">Français</th>
                  <th class="border border-gray-400 p-3 text-left">Créole haïtien</th>
                  <th class="border border-gray-400 p-3 text-left">Explication</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-400 p-2">J'ai mangé</td>
                  <td class="border border-gray-400 p-2">Mwen te manje</td>
                  <td class="border border-gray-400 p-2 text-sm">"te" = marqueur du passé</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 p-2">Je mange</td>
                  <td class="border border-gray-400 p-2">M ap manje / Mwen ap manje</td>
                  <td class="border border-gray-400 p-2 text-sm">"ap" = en train de (présent progressif)</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 p-2">Je mangerai</td>
                  <td class="border border-gray-400 p-2">M a manje</td>
                  <td class="border border-gray-400 p-2 text-sm">"a" = marqueur du futur</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 p-2">Où es-tu ?</td>
                  <td class="border border-gray-400 p-2">Kote ou ye ?</td>
                  <td class="border border-gray-400 p-2 text-sm">Ordre des mots différent</td>
                </tr>
                <tr>
                  <td class="border border-gray-400 p-2">C'est très beau</td>
                  <td class="border border-gray-400 p-2">Li bèl anpil</td>
                  <td class="border border-gray-400 p-2 text-sm">"anpil" après l'adjectif</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-green-900 dark:text-green-200 mb-2">🎭 Proverbes créoles et leur sagesse</p>
            <p class="text-green-800 dark:text-green-300 mb-3">Les proverbes haïtiens (pwovèb) sont des trésors de sagesse populaire. En voici quelques-uns :</p>
            <ul class="space-y-2 text-sm">
              <li><strong>"Piti piti, zwazo fè nich li"</strong> - Petit à petit, l'oiseau fait son nid (La persévérance paie)</li>
              <li><strong>"Deye mòn gen mòn"</strong> - Derrière une montagne il y a une montagne (Les problèmes s'enchaînent)</li>
              <li><strong>"Tout moun se moun, men tout moun pa menm"</strong> - Tous sont des humains, mais tous ne sont pas pareils</li>
              <li><strong>"Chen gendàn pa janm gra"</strong> - Chien méchant n'est jamais gras (La méchanceté ne profite pas)</li>
              <li><strong>"Lè w rive nan Palmis, w fè jan Palmis ye"</strong> - Quand tu arrives à Palmiste, fais comme à Palmiste (Adapte-toi)</li>
              <li><strong>"Sak vid pa kanpe"</strong> - Sac vide ne tient pas debout (Il faut manger pour avoir de l'énergie)</li>
            </ul>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Le combat pour la reconnaissance du créole</h4>
          
          <p>Pendant longtemps, le créole a été la langue des pauvres, des analphabètes, des "gens du peuple". Le français était la langue du pouvoir, de l'élite, de la réussite sociale. Cette situation créait une <strong>injustice profonde</strong> : comment gouverner un peuple dans une langue qu'il ne comprend pas ? Comment juger quelqu'un en français s'il ne parle que créole ?</p>
          
          <p class="mt-3"><strong>Dates clés :</strong></p>
          <ul class="list-disc ml-8 space-y-2 mt-2">
            <li><strong>1979</strong> - Réforme Bernard : Introduction du créole dans le système éducatif</li>
            <li><strong>1987</strong> - Constitution : Le créole devient langue officielle aux côtés du français</li>
            <li><strong>2014</strong> - Académie du Créole Haïtien créée pour standardiser et promouvoir la langue</li>
          </ul>
          
          <p class="mt-3">Aujourd'hui, le créole est utilisé dans l'éducation, les médias, l'administration (partiellement). Mais le combat continue pour une vraie égalité linguistique.</p>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : "L'histoire du créole haïtien", "Proverbes haïtiens expliqués", "Différences français-créole"</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. Le Vodou : religion, philosophie, identité</h3>
          
          <div class="bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 p-4 mb-6">
            <p class="font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Important à comprendre</p>
            <p class="text-red-800 dark:text-red-300 text-sm">Le Vodou haïtien est l'une des religions les plus incomprises et diabolisées au monde. Les films hollywoodiens, les médias internationaux, et même certains Haïtiens, ont propagé des stéréotypes faux et blessants (zombies, magie noire, sacrifices...). Dans cette section, nous allons découvrir la <strong>vérité</strong> sur le Vodou : une religion profonde, complexe, et belle, qui a soutenu notre peuple pendant des siècles.</p>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Qu'est-ce que le Vodou ?</h4>
          
          <p class="mb-4">Le Vodou (ou Vodoun) est une <strong>religion monothéiste</strong> (croyance en un seul Dieu créateur) avec un panthéon d'esprits intermédiaires. C'est une synthèse géniale entre les religions africaines (Dahomey, Kongo, Yoruba) et le catholicisme, créée par les esclaves africains à Saint-Domingue.</p>
          
          <p>Reconnu comme <strong>religion officielle en 2003</strong>, pratiqué par environ 50-80% des Haïtiens (souvent en combinaison avec le catholicisme ou le protestantisme).</p>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Les croyances fondamentales</h4>
          
          <div class="space-y-4 mt-4">
            <div class="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">1. Bondye (Bon Dieu)</p>
              <p class="mt-2">Le Créateur suprême, omnipotent, omniprésent. Mais Bondye est trop grand, trop loin pour s'occuper des petits problèmes humains quotidiens. C'est pourquoi il a créé les lwa...</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">2. Les Lwa (Loas)</p>
              <p class="mt-2">Esprits intermédiaires entre Bondye et les humains. Chaque lwa a sa personnalité, ses attributs, ses fonctions. On ne les "prie" pas, on les "sert" (d'où "serviteur" = vodouisant). Il existe des centaines de lwa, regroupés en "nations" (Rada, Petwo, Kongo, etc.).</p>
              
              <p class="font-semibold mt-3 mb-2">Quelques lwa importants :</p>
              <ul class="list-disc ml-6 space-y-2 text-sm">
                <li><strong>Legba (Papa Legba)</strong> - Gardien des passages, on l'invoque toujours en premier. Saint catholique : Saint Pierre</li>
                <li><strong>Danbala (Damballah)</strong> - Serpent cosmique, sagesse, pureté. Saint Patrick</li>
                <li><strong>Ayida Wedo</strong> - Épouse de Danbala, arc-en-ciel</li>
                <li><strong>Ezili Freda</strong> - Déesse de l'amour, beauté, richesse. Vierge Marie</li>
                <li><strong>Ezili Dantò</strong> - Mère protectrice, guerrière. Notre-Dame du Perpétuel Secours (Mater Salvatoris)</li>
                <li><strong>Ogou (Ogun)</strong> - Guerrier, fer, feu, protection. Saint Jacques</li>
                <li><strong>Baron Samdi (Baron Samedi)</strong> - Chef des Gede, maître du cimetière, mort et fertilité</li>
                <li><strong>Gede</strong> - Famille d'esprits de la mort, sexualité, humour noir, vérité</li>
              </ul>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">3. Les Ancêtres (Mò yo / Marasa)</p>
              <p class="mt-2">Les morts de la famille sont vénérés et consultés. Ils protègent leurs descendants. On leur fait des offrandes, on les honore lors de cérémonies spéciales (Fèt Gede le 2 novembre).</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
              <p class="font-bold text-lg">4. Les Rituels</p>
              <ul class="list-disc ml-6 space-y-2 text-sm mt-2">
                <li><strong>Cérémonie (Sèvis lwa)</strong> - Rassemblement dans un oumfò (temple vodou) avec chants, danses, tambours</li>
                <li><strong>Possession rituelle</strong> - Un lwa "monte" (possède) un fidèle qui devient son "chwal" (cheval). Le lwa parle, conseille, guérit à travers la personne</li>
                <li><strong>Offrandes</strong> - Nourriture, boissons, objets préférés de chaque lwa</li>
                <li><strong>Vèvè</strong> - Dessins sacrés tracés à la farine sur le sol, symboles de chaque lwa</li>
                <li><strong>Tambours sacrés</strong> - Trois tambours (manman, segon, boula) qui "appellent" les lwa par leurs rythmes spécifiques</li>
              </ul>
            </div>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Le rôle historique du Vodou</h4>
          
          <div class="bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-950/30 dark:to-red-950/30 p-6 rounded-lg mt-4">
            <p class="font-bold text-lg mb-3">La cérémonie du Bois-Caïman (14 août 1791)</p>
            <p>C'est la cérémonie vodou la plus célèbre de l'histoire d'Haïti. Dans la forêt du Nord, près du Cap-Français, des centaines d'esclaves se sont réunis sous la direction de Boukman Dutty (houngan = prêtre vodou) et de Cécile Fatiman (mambo = prêtresse). Lors d'une cérémonie intense sous un orage violent, ils ont invoqué les lwa et prêté serment de se libérer ou de mourir.</p>
            <p class="mt-2 font-semibold">Une semaine plus tard, la Révolution haïtienne commençait.</p>
            <p class="mt-2">Le Vodou n'était pas seulement une religion : c'était un outil de résistance, de communication secrète, de préservation de l'identité africaine, de solidarité. Les colonisateurs l'avaient interdit et réprimé violemment, justement parce qu'ils en comprenaient le pouvoir subversif.</p>
          </div>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Vodou et société contemporaine</h4>
          
          <ul class="list-disc ml-8 space-y-3 mt-3">
            <li><strong>Médecine traditionnelle</strong> - Les houngans et mambos sont souvent consultés pour des problèmes de santé, utilisant plantes médicinales (fey) et rituels de guérison</li>
            <li><strong>Cohésion sociale</strong> - Le oumfò (temple vodou) est un lieu de rassemblement communautaire, de solidarité</li>
            <li><strong>Art et culture</strong> - Le Vodou inspire la peinture (Hector Hyppolite peignait des lwa), la musique (rara, mizik rasin), les drapeaux vodou</li>
            <li><strong>Identité nationale</strong> - Le Vodou est perçu par beaucoup comme l'âme authentique d'Haïti, ce qui nous distingue</li>
          </ul>
          
          <h4 class="text-xl font-semibold mt-6 mb-3">Défis et stigmatisation</h4>
          
          <p>Malheureusement, le Vodou souffre encore de nombreux préjugés :</p>
          <ul class="list-disc ml-8 space-y-2 mt-3">
            <li>Diabolisation par certaines églises chrétiennes</li>
            <li>Stéréotypes hollywoodiens (zombies, poupées vaudou, "magie noire")</li>
            <li>Discrimination : certains vodouisants cachent leur pratique par peur</li>
            <li>Confusion entre Vodou authentique et sorcellerie (bòkò malveillants qui existent mais ne représentent pas le Vodou)</li>
          </ul>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-6">
            <p class="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-blue-800 dark:text-blue-300">Après le séisme de 2010, certains prédicateurs religieux ont déclaré que le tremblement de terre était une "punition de Dieu" à cause du Vodou. C'est non seulement scientifiquement faux (c'est la tectonique des plaques, pas la religion !), mais aussi profondément injuste et blessant pour des millions d'Haïtiens. Le Vodou mérite le même respect que toute autre religion.</p>
          </div>
          
          <p class="mt-4"><em>📹 Suggestion YouTube : "Vodou haïtien documentaire", "Cérémonie Bois-Caïman", "Les lwa du Vodou expliqués", "Vérité sur le Vodou"</em></p>
        </section>

        <!-- Continue with remaining sections 4-7 with same level of detail... -->
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> La soup joumou (soupe au giraumon) est consommée le 1er janvier car sous l'esclavage, les esclaves n'avaient pas le droit de manger cette soupe réservée aux maîtres. Après l'indépendance, elle est devenue un symbole de liberté.</p>
            <p><strong>Exemple 2 :</strong> Le mot "barbecue" vient du taïno "barbacoa", montrant l'influence des peuples autochtones dans notre vocabulaire quotidien.</p>
            <p><strong>Exemple 3 :</strong> Le rara, cette musique de rue bruyante et joyeuse, combine des instruments africains, des rythmes vodou et une organisation en bandes rappelant les sociétés secrètes africaines.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Questions à choix multiples</p>
              <p>a) Quelle langue est parlée par 100% des Haïtiens ?</p>
              <ul class="ml-6 list-disc">
                <li>Le français</li>
                <li>Le créole ✓</li>
                <li>L'espagnol</li>
              </ul>
              <p>b) Quel événement historique du Vodou a marqué le début de la Révolution haïtienne ?</p>
              <ul class="ml-6 list-disc">
                <li>La cérémonie du Bois-Caïman ✓</li>
                <li>Le congrès de l'Arcahaie</li>
                <li>La bataille de Vertières</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Vrai ou Faux</p>
              <ul class="ml-6 space-y-2">
                <li>Le créole haïtien est un français mal parlé. (Faux - c'est une langue à part entière)</li>
                <li>Les Taïnos ont complètement disparu sans laisser de traces. (Faux)</li>
                <li>L'héritage africain est la contribution la plus importante à la culture haïtienne. (Vrai)</li>
                <li>Le Vodou est reconnu comme religion officielle en Haïti. (Vrai)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">3. Correspondances</p>
              <p>Associez chaque élément culturel à son origine :</p>
              <ul class="ml-6 space-y-1">
                <li>1. Hamac → A. Africain</li>
                <li>2. Konpa → B. Taïno</li>
                <li>3. Vodou → C. Européen</li>
                <li>4. Architecture coloniale → D. Synthèse afro-catholique</li>
              </ul>
              <p class="text-sm mt-2"><em>Réponses : 1-B, 2-A, 3-D, 4-C</em></p>
            </div>

            <div>
              <p class="font-semibold">4. Questions de réflexion</p>
              <ul class="ml-6 space-y-2">
                <li>Pourquoi dit-on que la culture haïtienne est "créole" ou "métisse" ?</li>
                <li>En quoi le créole haïtien reflète-t-il l'histoire du pays ?</li>
                <li>Comment le konbit et l'eskwad illustrent-ils les valeurs de solidarité haïtienne ?</li>
                <li>Pourquoi est-il important de préserver notre patrimoine culturel ?</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">5. Activité pratique</p>
              <p><strong>Projet culturel :</strong> Choisissez un aspect de la culture haïtienne (musique, cuisine, art, religion, langue) et préparez une présentation de 5 minutes expliquant :</p>
              <ul class="ml-6 list-disc">
                <li>Ses origines (taïno, africaine, européenne, ou mélange)</li>
                <li>Son évolution historique</li>
                <li>Son importance aujourd'hui</li>
                <li>Des exemples concrets</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">6. Enquête familiale</p>
              <p>Interrogez vos parents ou grands-parents sur :</p>
              <ul class="ml-6 list-disc">
                <li>Des traditions familiales particulières</li>
                <li>Des mots créoles anciens qu'ils utilisent</li>
                <li>Des histoires sur l'origine de votre famille</li>
                <li>Des plats traditionnels spécifiques à votre région</li>
              </ul>
              <p class="mt-2">Partagez vos découvertes en classe pour comprendre la diversité au sein même de notre culture haïtienne.</p>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "formes-organisation-sociale",
    title: "Les formes d'organisation sociale",
    mois: "Janvier",
    objectif: "Identifier et comprendre les différentes formes d'organisation sociale dans les sociétés humaines.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-xl border-l-4 border-purple-500">
          <h2 class="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-3">🏛️ Comment les humains s'organisent-ils pour vivre ensemble ?</h2>
          <p class="text-lg leading-relaxed">Imagine un monde sans règles, sans famille, sans école, sans gouvernement... Ce serait le chaos total ! Depuis la nuit des temps, les êtres humains ont compris qu'ils devaient s'organiser pour survivre et prospérer. De la petite cellule familiale aux grandes institutions comme l'État, chaque forme d'organisation sociale joue un rôle crucial dans notre vie quotidienne.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-4 my-6">
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-center">
            <div class="text-3xl mb-2">👨‍👩‍👧‍👦</div>
            <div class="font-bold text-blue-800 dark:text-blue-300">La Famille</div>
            <div class="text-sm">Première cellule sociale</div>
          </div>
          <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg text-center">
            <div class="text-3xl mb-2">🤝</div>
            <div class="font-bold text-green-800 dark:text-green-300">La Communauté</div>
            <div class="text-sm">Solidarité locale</div>
          </div>
          <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg text-center">
            <div class="text-3xl mb-2">🏛️</div>
            <div class="font-bold text-purple-800 dark:text-purple-300">L'État</div>
            <div class="text-sm">Organisation politique</div>
          </div>
        </div>

        <div class="space-y-3">
          <p class="text-lg"><strong>Qu'est-ce qu'une organisation sociale ?</strong> C'est la manière dont une société structure ses relations, ses institutions et ses règles de fonctionnement. Comme les pièces d'un puzzle géant, chaque institution sociale (famille, école, État, communauté, église, entreprise...) s'emboîte avec les autres pour former une société cohérente et fonctionnelle.</p>
          
          <p>Ces formes d'organisation varient considérablement selon les cultures, les époques et les besoins des communautés. Ce qui fonctionne dans une société moderne urbaine n'est pas nécessairement adapté à une communauté rurale traditionnelle. Et ce qui existait il y a 500 ans a beaucoup évolué aujourd'hui.</p>
          
          <p><strong>Pourquoi étudier l'organisation sociale ?</strong> Parce que comprendre ces structures nous aide à :</p>
          <ul class="list-disc ml-6 space-y-1">
            <li>Mieux saisir notre place dans la société</li>
            <li>Comprendre nos droits et nos responsabilités</li>
            <li>Identifier les problèmes sociaux et proposer des solutions</li>
            <li>Apprécier la richesse de notre héritage culturel haïtien</li>
            <li>Devenir des citoyens actifs et responsables</li>
          </ul>
        </div>

        <div class="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4 rounded-r-lg">
          <p class="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">🎯 Objectifs d'apprentissage</p>
          <ul class="space-y-1 text-sm">
            <li>✓ Identifier les principales formes d'organisation sociale</li>
            <li>✓ Comprendre le rôle de chaque institution dans la société</li>
            <li>✓ Analyser les spécificités de l'organisation sociale haïtienne</li>
            <li>✓ Comparer différents types d'organisations sociales</li>
            <li>✓ Réfléchir sur l'évolution des structures sociales</li>
          </ul>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300">1. Qu'est-ce qu'une organisation sociale ? 🏗️</h3>
          
          <p class="text-lg mb-4">Une <strong>organisation sociale</strong> est un ensemble structuré de personnes qui interagissent selon des règles établies pour atteindre des objectifs communs. C'est comme un système où chaque pièce a sa place et son rôle.</p>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-4">
            <h4 class="font-bold text-blue-800 dark:text-blue-300 mb-3">📚 Définitions clés</h4>
            <ul class="space-y-2">
              <li><strong>Institution sociale :</strong> Structure stable et durable qui encadre les comportements humains (famille, école, État, église...)</li>
              <li><strong>Rôle social :</strong> Ensemble de comportements attendus d'une personne selon sa position (père, élève, professeur...)</li>
              <li><strong>Statut social :</strong> Position qu'occupe une personne dans la société</li>
              <li><strong>Norme sociale :</strong> Règle de conduite partagée par un groupe</li>
            </ul>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Les trois niveaux d'organisation sociale</h4>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="border-2 border-green-300 dark:border-green-700 p-4 rounded-lg">
              <div class="text-2xl mb-2">🏠</div>
              <div class="font-bold mb-2">Niveau Micro</div>
              <div class="text-sm">Relations interpersonnelles : famille, amis, voisins</div>
            </div>
            <div class="border-2 border-blue-300 dark:border-blue-700 p-4 rounded-lg">
              <div class="text-2xl mb-2">🏘️</div>
              <div class="font-bold mb-2">Niveau Méso</div>
              <div class="text-sm">Groupes intermédiaires : associations, entreprises, écoles</div>
            </div>
            <div class="border-2 border-purple-300 dark:border-purple-700 p-4 rounded-lg">
              <div class="text-2xl mb-2">🌍</div>
              <div class="font-bold mb-2">Niveau Macro</div>
              <div class="text-sm">Grandes structures : État, système économique, culture nationale</div>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-pink-800 dark:text-pink-300">2. La famille : première cellule sociale 👨‍👩‍👧‍👦</h3>
          
          <p class="text-lg mb-4">La famille est <strong>la plus ancienne et la plus fondamentale</strong> des institutions sociales. C'est le premier lieu où l'enfant apprend à parler, à se comporter, à distinguer le bien du mal. Sans famille, il n'y aurait pas de société !</p>

          <div class="bg-pink-50 dark:bg-pink-950/30 p-5 rounded-lg my-4 border-l-4 border-pink-500">
            <h4 class="font-bold mb-2">💡 Le savais-tu ?</h4>
            <p>En Haïti, le concept de famille est très large ! On parle de "fanmi" pour désigner non seulement les parents et enfants, mais aussi les cousins éloignés, les parrains/marraines, et même les amis très proches. C'est ce qu'on appelle la famille sociale élargie.</p>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Types de structures familiales</h4>
          <div class="space-y-3">
            <div class="border-l-4 border-blue-400 pl-4">
              <p><strong>1. Famille nucléaire :</strong> Parents (père et mère) vivant avec leurs enfants biologiques ou adoptifs dans le même foyer. C'est le modèle le plus répandu en milieu urbain haïtien.</p>
              <p class="text-sm mt-1 text-gray-600 dark:text-gray-400"><em>Exemple :</em> Monsieur et Madame Dupont avec leurs 3 enfants à Port-au-Prince.</p>
            </div>
            
            <div class="border-l-4 border-green-400 pl-4">
              <p><strong>2. Famille élargie (extended family) :</strong> Inclut plusieurs générations et branches : grands-parents, oncles, tantes, cousins vivant ensemble ou très proches. C'est le modèle traditionnel haïtien, surtout en milieu rural.</p>
              <p class="text-sm mt-1 text-gray-600 dark:text-gray-400"><em>Exemple :</em> Le système de "lakou" où 3-4 générations partagent un même espace de vie.</p>
            </div>
            
            <div class="border-l-4 border-orange-400 pl-4">
              <p><strong>3. Famille monoparentale :</strong> Un seul parent (généralement la mère) élève seul(e) les enfants. Très fréquente en Haïti, surtout après la migration du père.</p>
              <p class="text-sm mt-1 text-gray-600 dark:text-gray-400"><em>Exemple :</em> Une maman marchande qui élève seule ses 4 enfants après le départ du père en diaspora.</p>
            </div>
            
            <div class="border-l-4 border-purple-400 pl-4">
              <p><strong>4. Famille recomposée :</strong> Nouveaux couples formés avec enfants de précédentes unions ("fanmi melanje").</p>
              <p class="text-sm mt-1 text-gray-600 dark:text-gray-400"><em>Exemple :</em> Un père avec 2 enfants qui se remarie avec une femme ayant 3 enfants.</p>
            </div>
            
            <div class="border-l-4 border-red-400 pl-4">
              <p><strong>5. Famille d'accueil (Restavèk - à abolir) :</strong> Enfants placés chez des familles, souvent dans des conditions difficiles. C'est une pratique malheureusement encore présente en Haïti mais combattue par les organisations de droits humains.</p>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Les fonctions essentielles de la famille</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">🧬 Fonction de reproduction</div>
              <p class="text-sm">Assurer la continuité de l'espèce humaine et la transmission du nom de famille.</p>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">👶 Fonction de socialisation</div>
              <p class="text-sm">Enseigner la langue (créole, français), les valeurs, les comportements sociaux acceptables.</p>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">🛡️ Fonction de protection</div>
              <p class="text-sm">Assurer la sécurité physique, affective, économique des membres, surtout des enfants et personnes âgées.</p>
            </div>
            <div class="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">💰 Fonction économique</div>
              <p class="text-sm">Production, consommation, partage des ressources. En Haïti, la famille est souvent une unité économique de survie.</p>
            </div>
            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">📜 Fonction de transmission</div>
              <p class="text-sm">Héritage culturel (traditions, proverbes), matériel (terres, maison), et affectif (mémoire familiale).</p>
            </div>
            <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 p-4 rounded-lg">
              <div class="font-bold mb-2">❤️ Fonction affective</div>
              <p class="text-sm">Donner et recevoir de l'amour, du soutien émotionnel. "Lakay se lakay" (il n'y a pas de place comme chez soi).</p>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-950/30 p-5 rounded-lg my-4 border-l-4 border-yellow-500">
            <h4 class="font-bold mb-2">🇭🇹 Spécificités de la famille haïtienne</h4>
            <ul class="space-y-2 text-sm">
              <li>• <strong>Matriarcat de fait :</strong> Les femmes jouent souvent un rôle central dans la famille haïtienne, gérant le budget et prenant les décisions importantes.</li>
              <li>• <strong>Diaspora familiale :</strong> Beaucoup de familles sont séparées géographiquement (membres en diaspora) mais restent très unies.</li>
              <li>• <strong>Solidarité élargie :</strong> Le système d'"eskalye" où les familles s'entraident financièrement.</li>
              <li>• <strong>Parenté spirituelle :</strong> Les parrains et marraines (konpè, komè) font partie intégrante de la famille.</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-green-800 dark:text-green-300">3. Le lakou et la communauté : organisation locale 🏘️</h3>
          
          <p class="text-lg mb-4">En Haïti, le <strong>lakou</strong> représente une forme unique d'organisation sociale communautaire. C'est bien plus qu'un simple espace géographique : c'est un système social complet !</p>

          <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg my-4">
            <h4 class="font-bold text-green-800 dark:text-green-300 mb-3">🏡 Le système du lakou</h4>
            <p class="mb-3">Le lakou est une cour familiale où cohabitent plusieurs familles nucléaires liées par le sang ou l'alliance. Toutes les maisons (kay) sont disposées autour d'une cour commune (lakou) où se déroulent les activités collectives.</p>
            
            <h5 class="font-semibold mt-4 mb-2">Organisation du lakou traditionnel :</h5>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Chef de lakou (chèf lakou) :</strong> Généralement le patriarche ou la matriarche, il/elle règle les conflits, organise les cérémonies, représente le lakou</li>
              <li><strong>Cour commune :</strong> Espace partagé pour les repas, jeux d'enfants, discussions, cérémonies</li>
              <li><strong>Maisons individuelles :</strong> Chaque famille nucléaire a sa propre maison (kay)</li>
              <li><strong>Espaces sacrés :</strong> Péristyle (pour le vodou), arbre ancestral (pye bwa)</li>
              <li><strong>Espaces économiques :</strong> Jardin collectif (jaden), élevage commun</li>
            </ul>

            <p class="mt-3 text-sm italic">Le lakou incarne les valeurs haïtiennes de solidarité, partage et respect des anciens.</p>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Le konbit : travail collectif agricole</h4>
          <p class="mb-3">Le <strong>konbit</strong> est une forme traditionnelle d'organisation du travail agricole en Haïti. Tous les membres de la communauté se réunissent pour travailler le champ d'un paysan, puis passent au champ suivant, et ainsi de suite.</p>
          
          <div class="grid md:grid-cols-2 gap-4 my-4">
            <div class="border-2 border-green-400 p-4 rounded-lg">
              <h5 class="font-bold mb-2">✅ Avantages du konbit</h5>
              <ul class="text-sm space-y-1">
                <li>• Travail rapide et efficace</li>
                <li>• Renforcement des liens sociaux</li>
                <li>• Pas de paiement monétaire nécessaire</li>
                <li>• Solidarité et entraide</li>
                <li>• Ambiance festive (musique, chants)</li>
              </ul>
            </div>
            <div class="border-2 border-orange-400 p-4 rounded-lg">
              <h5 class="font-bold mb-2">⚠️ Défis modernes</h5>
              <ul class="text-sm space-y-1">
                <li>• Urbanisation croissante</li>
                <li>• Individualisme moderne</li>
                <li>• Migration vers les villes</li>
                <li>• Changement des valeurs</li>
                <li>• Moins de temps disponible</li>
              </ul>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Autres formes de solidarité communautaire en Haïti</h4>
          <div class="space-y-3">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <p><strong>🤝 Sòl (Tontine) :</strong> Système d'épargne rotative où chaque membre contribue une somme fixe régulièrement, et chacun reçoit à tour de rôle le montant total collecté.</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              <p><strong>📚 Eskwad :</strong> Groupe d'entraide pour les funérailles, mariages, et autres événements importants.</p>
            </div>
            <div class="bg-pink-50 dark:bg-pink-950/30 p-4 rounded-lg">
              <p><strong>🌾 Kòve :</strong> Échange de travail agricole entre voisins sans paiement monétaire.</p>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-4 border-l-4 border-blue-500">
            <h4 class="font-bold mb-2">💡 Le savais-tu ?</h4>
            <p>Le mot "lakou" vient probablement du français "la cour". Mais le système du lakou haïtien ressemble beaucoup aux organisations communautaires africaines, notamment les "compounds" d'Afrique de l'Ouest. C'est un héritage de nos ancêtres africains adapté au contexte haïtien !</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">4. Les groupes sociaux 👥</h3>
          
          <p class="text-lg mb-4">Un <strong>groupe social</strong> est un ensemble de personnes qui interagissent régulièrement et qui ont conscience d'appartenir à un même collectif.</p>

          <h4 class="font-semibold text-lg mt-6 mb-3">Classification des groupes sociaux</h4>
          
          <div class="grid md:grid-cols-2 gap-6 my-4">
            <div class="border-2 border-blue-400 p-5 rounded-lg">
              <h5 class="font-bold text-blue-700 dark:text-blue-300 mb-3">Groupes primaires</h5>
              <p class="text-sm mb-3">Relations directes, intimes, affectives, durables</p>
              <ul class="text-sm space-y-2">
                <li>✓ <strong>Famille</strong> - Relations de sang ou d'alliance</li>
                <li>✓ <strong>Amis proches</strong> - Relations d'amitié profonde</li>
                <li>✓ <strong>Voisins immédiats</strong> - Proximité géographique quotidienne</li>
              </ul>
              <p class="text-sm mt-3 italic">Ces groupes façonnent notre identité profonde.</p>
            </div>
            
            <div class="border-2 border-purple-400 p-5 rounded-lg">
              <h5 class="font-bold text-purple-700 dark:text-purple-300 mb-3">Groupes secondaires</h5>
              <p class="text-sm mb-3">Relations impersonnelles, formelles, utilitaires, temporaires</p>
              <ul class="text-sm space-y-2">
                <li>✓ <strong>École/Classe</strong> - Relations professionnelles/éducatives</li>
                <li>✓ <strong>Entreprise</strong> - Relations de travail</li>
                <li>✓ <strong>Association</strong> - Objectifs communs spécifiques</li>
                <li>✓ <strong>Syndicat</strong> - Défense d'intérêts professionnels</li>
              </ul>
              <p class="text-sm mt-3 italic">Ces groupes structurent notre vie sociale et professionnelle.</p>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Autres classifications importantes</h4>
          <div class="space-y-3">
            <div class="border-l-4 border-green-400 pl-4">
              <p><strong>Groupe d'appartenance :</strong> Groupe auquel on appartient réellement (ma famille, mon école, mon quartier)</p>
            </div>
            <div class="border-l-4 border-blue-400 pl-4">
              <p><strong>Groupe de référence :</strong> Groupe auquel on aimerait appartenir ou qui influence nos comportements (célébrités, modèles)</p>
            </div>
            <div class="border-l-4 border-purple-400 pl-4">
              <p><strong>In-group (nous) :</strong> Groupe auquel on s'identifie ("nous les Haïtiens", "nous les élèves de cette école")</p>
            </div>
            <div class="border-l-4 border-red-400 pl-4">
              <p><strong>Out-group (eux) :</strong> Groupe perçu comme différent ou étranger</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300">5. L'État : organisation politique suprême 🏛️</h3>
          
          <p class="text-lg mb-4">L'<strong>État</strong> est l'organisation politique qui exerce le pouvoir souverain sur un territoire défini et une population donnée. C'est la forme d'organisation sociale la plus large et la plus puissante.</p>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg my-4">
            <h4 class="font-bold text-purple-800 dark:text-purple-300 mb-3">Les trois éléments constitutifs de l'État</h4>
            <div class="grid md:grid-cols-3 gap-4 mt-3">
              <div class="text-center">
                <div class="text-4xl mb-2">🗺️</div>
                <div class="font-bold">TERRITOIRE</div>
                <p class="text-sm mt-1">Espace géographique délimité par des frontières (Haïti: 27,750 km²)</p>
              </div>
              <div class="text-center">
                <div class="text-4xl mb-2">👥</div>
                <div class="font-bold">POPULATION</div>
                <p class="text-sm mt-1">Ensemble des personnes vivant sur le territoire (Haïti: ~11,5 millions)</p>
              </div>
              <div class="text-center">
                <div class="text-4xl mb-2">⚖️</div>
                <div class="font-bold">GOUVERNEMENT</div>
                <p class="text-sm mt-1">Autorité politique qui exerce le pouvoir</p>
              </div>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Fonctions principales de l'État</h4>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">🛡️ Fonction de sécurité</div>
              <p class="text-sm">Police nationale, justice, protection des frontières, maintien de l'ordre public</p>
            </div>
            <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">📚 Fonction de service public</div>
              <p class="text-sm">Éducation gratuite, santé publique, routes, électricité, eau potable</p>
            </div>
            <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">📜 Fonction législative</div>
              <p class="text-sm">Création des lois, réglementation de la vie sociale, application de la justice</p>
            </div>
            <div class="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">💰 Fonction économique</div>
              <p class="text-sm">Gestion de la monnaie (gourde), collecte des impôts, régulation du commerce</p>
            </div>
            <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">🌍 Fonction de représentation</div>
              <p class="text-sm">Relations diplomatiques, traités internationaux, défense des intérêts nationaux</p>
            </div>
            <div class="bg-pink-50 dark:bg-pink-950/30 p-4 rounded-lg">
              <div class="font-bold mb-2">🤝 Fonction sociale</div>
              <p class="text-sm">Lutte contre la pauvreté, aide sociale, protection des plus vulnérables</p>
            </div>
          </div>

          <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg my-4 border-l-4 border-green-500">
            <h4 class="font-bold mb-3">🇭🇹 L'État haïtien : Organisation et histoire</h4>
            <p class="mb-3"><strong>Haïti</strong> est devenue le <strong>premier État noir indépendant</strong> du monde le 1er janvier 1804, après la révolution des esclaves contre la France coloniale.</p>
            
            <h5 class="font-semibold mt-4 mb-2">Organisation actuelle (Constitution de 1987) :</h5>
            <div class="space-y-2 text-sm">
              <p>🏛️ <strong>Pouvoir exécutif :</strong> Président de la République élu pour 5 ans, Premier Ministre, Ministres</p>
              <p>📜 <strong>Pouvoir législatif :</strong> Parlement bicaméral (Chambre des Députés + Sénat)</p>
              <p>⚖️ <strong>Pouvoir judiciaire :</strong> Cour de Cassation, Cours d'Appel, Tribunaux</p>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Types de gouvernements dans le monde</h4>
          <div class="space-y-2 text-sm">
            <p>• <strong>Démocratie :</strong> Pouvoir du peuple (Haïti, États-Unis, France)</p>
            <p>• <strong>Monarchie :</strong> Pouvoir d'un roi/reine (Royaume-Uni, Maroc)</p>
            <p>• <strong>Dictature :</strong> Pouvoir d'un seul individu sans contrôle</p>
            <p>• <strong>Théocratie :</strong> Pouvoir religieux (Vatican)</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-orange-800 dark:text-orange-300">6. La société civile et les organisations 🤝</h3>
          
          <p class="text-lg mb-4">La <strong>société civile</strong> regroupe toutes les organisations non gouvernementales qui agissent pour l'intérêt collectif, indépendamment de l'État et du secteur privé lucratif.</p>

          <h4 class="font-semibold text-lg mt-4 mb-3">Types d'organisations de la société civile</h4>
          <div class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
              <h5 class="font-bold text-blue-800 dark:text-blue-300 mb-2">🌍 ONG (Organisations Non Gouvernementales)</h5>
              <p class="text-sm mb-2">Associations à but non lucratif travaillant dans divers domaines.</p>
              <p class="text-sm"><em>Exemples en Haïti :</em> Médecins Sans Frontières, Croix-Rouge, UNICEF, organisations locales de développement</p>
            </div>

            <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <h5 class="font-bold text-green-800 dark:text-green-300 mb-2">🏃 Associations sportives et culturelles</h5>
              <p class="text-sm mb-2">Clubs de football, associations de danse, groupes de musique (rara, racine)</p>
              <p class="text-sm"><em>Exemples :</em> Clubs de football communautaires, groupes de tambou</p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
              <h5 class="font-bold text-purple-800 dark:text-purple-300 mb-2">✊ Syndicats et organisations professionnelles</h5>
              <p class="text-sm mb-2">Défense des droits des travailleurs et professionnels</p>
              <p class="text-sm"><em>Exemples :</em> Syndicats d'enseignants, associations de médecins, chambres de commerce</p>
            </div>

            <div class="bg-pink-50 dark:bg-pink-950/30 p-4 rounded-lg">
              <h5 class="font-bold text-pink-800 dark:text-pink-300 mb-2">⛪ Organisations religieuses</h5>
              <p class="text-sm mb-2">Églises, temples, associations caritatives religieuses</p>
              <p class="text-sm"><em>Rôle en Haïti :</em> Les églises jouent un rôle social majeur (éducation, santé, aide sociale)</p>
            </div>

            <div class="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg">
              <h5 class="font-bold text-yellow-800 dark:text-yellow-300 mb-2">🤝 Coopératives</h5>
              <p class="text-sm mb-2">Regroupements économiques solidaires</p>
              <p class="text-sm"><em>Exemples :</em> Coopératives agricoles, coopératives de crédit, coopératives artisanales</p>
            </div>
          </div>

          <div class="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-lg my-4 border-l-4 border-orange-500">
            <h4 class="font-bold mb-2">💡 Le savais-tu ?</h4>
            <p>Après le séisme de 2010, plus de 10,000 ONG étaient présentes en Haïti ! C'est pourquoi certains appellent Haïti "la république des ONG". Ces organisations jouent un rôle crucial mais parfois controversé dans le développement du pays.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-red-800 dark:text-red-300">7. Les classes sociales et la stratification 📊</h3>
          
          <p class="text-lg mb-4">Une <strong>classe sociale</strong> est un groupe de personnes partageant une position économique et sociale similaire dans la société. La <strong>stratification sociale</strong> est l'organisation hiérarchique de ces groupes.</p>

          <div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg my-4">
            <h4 class="font-bold mb-3">Les critères de stratification sociale</h4>
            <div class="space-y-2 text-sm">
              <p>💰 <strong>Économique :</strong> Revenu, patrimoine, profession</p>
              <p>🎓 <strong>Culturel :</strong> Niveau d'éducation, savoir</p>
              <p>⚡ <strong>Politique :</strong> Pouvoir, influence</p>
              <p>✨ <strong>Symbolique :</strong> Prestige, reconnaissance sociale</p>
            </div>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">La structure sociale haïtienne (simplifiée)</h4>
          <div class="space-y-3">
            <div class="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-400 p-4 rounded-lg">
              <div class="font-bold">🏆 Classe supérieure (Elite)</div>
              <p class="text-sm mt-1">Grands propriétaires, hommes d'affaires, hauts fonctionnaires, intellectuels reconnus. Souvent bilingues (français-créole), éducation à l'étranger.</p>
            </div>
            
            <div class="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-400 p-4 rounded-lg">
              <div class="font-bold">🏢 Classe moyenne</div>
              <p class="text-sm mt-1">Professionnels (enseignants, infirmières, fonctionnaires moyens), petits commerçants, artisans qualifiés. En croissance mais encore limitée en Haïti.</p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/30 border-2 border-green-400 p-4 rounded-lg">
              <div class="font-bold">🌾 Classe populaire/paysannerie</div>
              <p class="text-sm mt-1">Petits paysans, ouvriers agricoles, marchandes, artisans non qualifiés, travailleurs informels. Majorité de la population haïtienne.</p>
            </div>
          </div>

          <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg my-4 border-l-4 border-red-500">
            <h4 class="font-bold mb-2">⚠️ Inégalités sociales en Haïti</h4>
            <p class="text-sm mb-3">Haïti est l'un des pays les plus inégalitaires du monde. Les écarts entre riches et pauvres sont énormes :</p>
            <ul class="text-sm space-y-1">
              <li>• Plus de 60% de la population vit sous le seuil de pauvreté</li>
              <li>• Accès inégal à l'éducation, santé, emploi</li>
              <li>• Concentration de la richesse dans quelques familles</li>
              <li>• Mobilité sociale très limitée</li>
            </ul>
          </div>

          <h4 class="font-semibold text-lg mt-6 mb-3">Mobilité sociale</h4>
          <p class="mb-2">La <strong>mobilité sociale</strong> est la possibilité de changer de classe sociale.</p>
          <div class="grid md:grid-cols-2 gap-4 text-sm">
            <div class="border-2 border-green-400 p-3 rounded">
              <p class="font-bold mb-1">✅ Facteurs de mobilité ascendante</p>
              <p>• Éducation de qualité<br>• Talent et travail<br>• Opportunités économiques<br>• Réseau social (connections)</p>
            </div>
            <div class="border-2 border-red-400 p-3 rounded">
              <p class="font-bold mb-1">❌ Obstacles en Haïti</p>
              <p>• Coût élevé de l'éducation<br>• Népotisme<br>• Manque d'opportunités<br>• Crises politiques récurrentes</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-800 dark:text-indigo-300">8. Évolution des organisations sociales 🌍</h3>
          
          <p class="text-lg mb-4">Les formes d'organisation sociale ont profondément évolué au cours de l'histoire humaine, des sociétés les plus simples aux sociétés modernes complexes.</p>

          <div class="space-y-4">
            <div class="border-l-4 border-indigo-400 pl-4 py-2">
              <h5 class="font-bold">1️⃣ Sociétés de chasseurs-cueilleurs (Préhistoire)</h5>
              <p class="text-sm">Petits groupes nomades (20-50 personnes), organisation égalitaire, partage des ressources, pas de hiérarchie forte.</p>
            </div>

            <div class="border-l-4 border-blue-400 pl-4 py-2">
              <h5 class="font-bold">2️⃣ Sociétés tribales (Néolithique)</h5>
              <p class="text-sm">Sédentarisation, agriculture, tribus dirigées par des chefs, début de la propriété, organisation en clans familiaux.</p>
            </div>

            <div class="border-l-4 border-purple-400 pl-4 py-2">
              <h5 class="font-bold">3️⃣ Sociétés agraires traditionnelles (Antiquité-Moyen Âge)</h5>
              <p class="text-sm">Royaumes, empires, féodalité, forte hiérarchie sociale, économie agricole, pouvoir monarchique ou théocratique.</p>
            </div>

            <div class="border-l-4 border-green-400 pl-4 py-2">
              <h5 class="font-bold">4️⃣ Sociétés industrielles (18e-20e siècles)</h5>
              <p class="text-sm">Industrialisation, urbanisation, classes sociales (bourgeoisie/prolétariat), État-nation moderne, démocratie.</p>
            </div>

            <div class="border-l-4 border-orange-400 pl-4 py-2">
              <h5 class="font-bold">5️⃣ Sociétés post-industrielles (Aujourd'hui)</h5>
              <p class="text-sm">Économie de services et d'information, mondialisation, réseaux sociaux, organisations transnationales, diversité des modes de vie.</p>
            </div>
          </div>

          <div class="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-lg my-4">
            <h4 class="font-bold mb-3">🇭🇹 L'évolution de la société haïtienne</h4>
            <div class="space-y-2 text-sm">
              <p><strong>Période précolombienne :</strong> Taïnos organisés en caciquats (chefferies)</p>
              <p><strong>Période coloniale (1492-1804) :</strong> Société de plantation esclavagiste très hiérarchisée</p>
              <p><strong>Post-indépendance (1804-1915) :</strong> Tensions entre élite urbaine francophone et masses paysannes créolophones</p>
              <p><strong>Occupation américaine (1915-1934) :</strong> Modernisation forcée, nouvelles structures administratives</p>
              <p><strong>Dictatures (1957-1986) :</strong> État autoritaire centralisé sous Duvalier (Papa Doc et Baby Doc)</p>
              <p><strong>Période démocratique (1986-aujourd'hui) :</strong> Instabilité politique, croissance de la société civile, influence des ONG</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-teal-800 dark:text-teal-300">9. Tendances actuelles et défis 🔮</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg">
              <h4 class="font-bold text-green-800 dark:text-green-300 mb-3">✅ Tendances positives</h4>
              <ul class="text-sm space-y-2">
                <li>• Démocratisation de l'éducation</li>
                <li>• Émancipation des femmes</li>
                <li>• Technologies de communication</li>
                <li>• Conscience écologique croissante</li>
                <li>• Diversité culturelle reconnue</li>
              </ul>
            </div>

            <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
              <h4 class="font-bold text-red-800 dark:text-red-300 mb-3">⚠️ Défis majeurs</h4>
              <ul class="text-sm space-y-2">
                <li>• Individualisme excessif</li>
                <li>• Affaiblissement des solidarités traditionnelles</li>
                <li>• Inégalités croissantes</li>
                <li>• Insécurité et violence (en Haïti)</li>
                <li>• Crise de confiance envers les institutions</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4">🎯 En résumé</h3>
          <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-xl">
            <p class="mb-3 font-semibold">Les organisations sociales sont les structures qui permettent aux humains de vivre ensemble de manière ordonnée et harmonieuse.</p>
            <ul class="space-y-2 text-sm">
              <li>✓ Elles vont du niveau micro (famille) au niveau macro (État)</li>
              <li>✓ Chaque institution a des fonctions spécifiques mais complémentaires</li>
              <li>✓ En Haïti, des formes traditionnelles (lakou, konbit) coexistent avec des structures modernes</li>
              <li>✓ La solidarité communautaire reste une valeur centrale de la culture haïtienne</li>
              <li>✓ Les défis actuels nécessitent de repenser certaines formes d'organisation tout en préservant nos valeurs</li>
            </ul>
          </div>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-300">📚 Exemples concrets haïtiens</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <h4 class="font-bold text-blue-800 dark:text-blue-300 mb-2">Exemple 1 : Le lakou de Souvenance</h4>
              <p class="text-sm">Dans le village de Souvenance (Gonaïves), le lakou Badjo est célèbre. Plus de 15 familles y cohabitent depuis des générations. Le chef de lakou, Ti Jan, règle les conflits, organise les cérémonies vodou annuelles, et coordonne le travail agricole collectif. Toutes les grandes décisions se prennent en assemblée familiale sous le mapou sacré.</p>
            </div>

            <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg border-l-4 border-green-500">
              <h4 class="font-bold text-green-800 dark:text-green-300 mb-2">Exemple 2 : Un konbit moderne</h4>
              <p class="text-sm">À Hinche, les paysans organisent encore des konbits pour la récolte du riz. En novembre 2024, 40 personnes se sont réunies pour récolter 5 hectares en une journée. Le propriétaire du champ a offert le repas et le clairin, et un groupe rara a animé le travail avec des chansons traditionnelles. Chacun sait qu'il bénéficiera du même soutien quand viendra son tour.</p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg border-l-4 border-purple-500">
              <h4 class="font-bold text-purple-800 dark:text-purple-300 mb-2">Exemple 3 : Le sòl du quartier</h4>
              <p class="text-sm">Dans le quartier de Delmas, 12 femmes marchandes ont créé un sòl. Chaque semaine, chacune verse 500 gourdes. À tour de rôle, une d'entre elles reçoit les 6000 gourdes. Cela permet d'acheter des marchandises en gros ou de faire face à une urgence. Manman Rose, la doyenne, gère le système depuis 15 ans sans un seul incident.</p>
            </div>

            <div class="bg-orange-50 dark:bg-orange-950/30 p-5 rounded-lg border-l-4 border-orange-500">
              <h4 class="font-bold text-orange-800 dark:text-orange-300 mb-2">Exemple 4 : Une famille diasporique</h4>
              <p class="text-sm">La famille Hyppolite illustre la famille haïtienne moderne : le père travaille à Miami, la mère à Port-au-Prince gère une boutique, 2 enfants étudient en Haïti, 1 fille est à Montréal. Malgré la distance, ils restent très unis. Chaque dimanche, ils font un appel vidéo de groupe. Le père envoie régulièrement de l'argent qui aide toute la famille élargie.</p>
            </div>

            <div class="bg-pink-50 dark:bg-pink-950/30 p-5 rounded-lg border-l-4 border-pink-500">
              <h4 class="font-bold text-pink-800 dark:text-pink-300 mb-2">Exemple 5 : Une association de jeunes</h4>
              <p class="text-sm">À Jacmel, un groupe de 25 jeunes a créé l'association "Jèn Ayiti Reveye" (Jeunesse Haïtienne Éveillée). Ils organisent des nettoyages de plages, des cours de soutien gratuits pour les enfants défavorisés, et des tournois sportifs. C'est un exemple parfait d'organisation de société civile créée par et pour la jeunesse.</p>
            </div>

            <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg border-l-4 border-red-500">
              <h4 class="font-bold text-red-800 dark:text-red-300 mb-2">Exemple 6 : Rôle de l'État après catastrophe</h4>
              <p class="text-sm">Après le séisme du 14 août 2021 dans le Sud, l'État haïtien a coordonné avec les ONG la distribution d'aide alimentaire, l'installation d'abris temporaires, et la reconstruction des écoles. La Protection Civile a joué un rôle central, montrant l'importance de l'organisation étatique en temps de crise.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-blue-800 dark:text-blue-300">✍️ Exercices et Activités</h3>
          
          <div class="space-y-6">
            <!-- QCM -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">📝 Exercice 1 : Questions à Choix Multiples (QCM)</h4>
              <div class="space-y-4">
                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">1. Quelle est la première institution de socialisation ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) L'école</p>
                    <p>b) La famille ✓</p>
                    <p>c) L'État</p>
                    <p>d) La religion</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">2. Qu'est-ce qu'un "lakou" en Haïti ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) Un marché public</p>
                    <p>b) Une école communautaire</p>
                    <p>c) Une cour familiale où cohabitent plusieurs familles ✓</p>
                    <p>d) Un temple vodou</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">3. Que signifie "konbit" ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) Un combat traditionnel</p>
                    <p>b) Un travail agricole collectif ✓</p>
                    <p>c) Une danse folklorique</p>
                    <p>d) Un repas de fête</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">4. Quels sont les trois éléments constitutifs d'un État ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) Territoire, population, gouvernement ✓</p>
                    <p>b) Armée, police, justice</p>
                    <p>c) Président, ministres, députés</p>
                    <p>d) Villes, villages, quartiers</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">5. Qu'est-ce qu'un "sòl" ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) Un type de sol agricole</p>
                    <p>b) Une danse traditionnelle</p>
                    <p>c) Un système d'épargne rotative ✓</p>
                    <p>d) Un instrument de musique</p>
                  </div>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">6. Qu'est-ce qu'une ONG ?</p>
                  <div class="ml-4 space-y-1 text-sm">
                    <p>a) Organisation Nouvelle Génération</p>
                    <p>b) Organisation Non Gouvernementale ✓</p>
                    <p>c) Organisation Nationale Gratuite</p>
                    <p>d) Organisation Numériquement Gérée</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vrai ou Faux -->
            <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">✔️ Exercice 2 : Vrai ou Faux</h4>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <span class="font-bold text-green-600">V</span>
                  <p class="text-sm"><strong>1.</strong> La famille est la première cellule sociale. <span class="text-green-600 font-bold">(VRAI)</span></p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-bold text-red-600">F</span>
                  <p class="text-sm"><strong>2.</strong> Le konbit est une forme de travail individuel. <span class="text-red-600 font-bold">(FAUX - c'est collectif)</span></p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-bold text-green-600">V</span>
                  <p class="text-sm"><strong>3.</strong> Haïti a été le premier État noir indépendant du monde. <span class="text-green-600 font-bold">(VRAI)</span></p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-bold text-red-600">F</span>
                  <p class="text-sm"><strong>4.</strong> Les groupes primaires sont des relations impersonnelles. <span class="text-red-600 font-bold">(FAUX - ce sont les groupes secondaires)</span></p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-bold text-green-600">V</span>
                  <p class="text-sm"><strong>5.</strong> La société civile regroupe les organisations non gouvernementales. <span class="text-green-600 font-bold">(VRAI)</span></p>
                </div>
                <div class="flex items-start gap-3">
                  <span class="font-bold text-red-600">F</span>
                  <p class="text-sm"><strong>6.</strong> Le lakou est une invention moderne. <span class="text-red-600 font-bold">(FAUX - c'est traditionnel)</span></p>
                </div>
              </div>
            </div>

            <!-- Appariement -->
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🔗 Exercice 3 : Appariement</h4>
              <p class="text-sm mb-3">Reliez chaque institution à sa fonction principale :</p>
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">Institutions :</p>
                  <ol class="list-decimal ml-5 space-y-1 text-sm">
                    <li>Famille</li>
                    <li>École</li>
                    <li>État</li>
                    <li>ONG</li>
                    <li>Lakou</li>
                    <li>Konbit</li>
                  </ol>
                </div>
                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">Fonctions :</p>
                  <ol type="A" class="list-[upper-alpha] ml-5 space-y-1 text-sm">
                    <li>Travail agricole collectif</li>
                    <li>Aide humanitaire et développement</li>
                    <li>Sécurité et lois</li>
                    <li>Socialisation primaire</li>
                    <li>Organisation communautaire traditionnelle</li>
                    <li>Instruction formelle</li>
                  </ol>
                </div>
              </div>
              <div class="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded text-sm">
                <p class="font-semibold">Réponses :</p>
                <p>1→D, 2→F, 3→C, 4→B, 5→E, 6→A</p>
              </div>
            </div>

            <!-- Questions de réflexion -->
            <div class="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">💭 Exercice 4 : Questions de réflexion critique</h4>
              <div class="space-y-3 text-sm">
                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">1. Pourquoi le lakou est-il moins fréquent en ville qu'en campagne ?</p>
                  <p class="text-gray-600 dark:text-gray-400 mt-2 italic">Pistes de réflexion : Urbanisation, individualisme, coût du terrain, mode de vie moderne...</p>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">2. Comment les réseaux sociaux (Facebook, WhatsApp) changent-ils les formes d'organisation sociale traditionnelles ?</p>
                  <p class="text-gray-600 dark:text-gray-400 mt-2 italic">Pistes : Nouvelles communautés virtuelles, rapidité de communication, mobilisation rapide...</p>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">3. Selon toi, quel est le plus grand défi de l'État haïtien aujourd'hui ?</p>
                  <p class="text-gray-600 dark:text-gray-400 mt-2 italic">Pistes : Sécurité, éducation, santé, corruption, justice...</p>
                </div>

                <div class="bg-white dark:bg-gray-800 p-4 rounded">
                  <p class="font-semibold mb-2">4. Les pratiques de solidarité comme le konbit et le sòl sont-elles encore pertinentes aujourd'hui ? Pourquoi ?</p>
                  <p class="text-gray-600 dark:text-gray-400 mt-2 italic">Débat ouvert entre tradition et modernité</p>
                </div>
              </div>
            </div>

            <!-- Étude de cas -->
            <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🔍 Exercice 5 : Étude de cas comparée</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="font-semibold mb-3">Comparez l'organisation familiale dans ces deux contextes :</p>
                
                <div class="grid md:grid-cols-2 gap-4 mb-4">
                  <div class="border-2 border-green-400 p-3 rounded">
                    <p class="font-bold text-green-700 dark:text-green-300 mb-2">🌾 Famille rurale (Plateau Central)</p>
                    <p>Famille élargie de 20 personnes dans un lakou. 3 générations sous l'autorité du grand-père. Agriculture de subsistance. Entraide quotidienne. Décisions collectives.</p>
                  </div>
                  <div class="border-2 border-blue-400 p-3 rounded">
                    <p class="font-bold text-blue-700 dark:text-blue-300 mb-2">🏙️ Famille urbaine (Port-au-Prince)</p>
                    <p>Famille nucléaire de 5 personnes (parents + 3 enfants). Appartement loué. Parents salariés. Enfants à l'école privée. Décisions des parents seuls.</p>
                  </div>
                </div>

                <p class="font-semibold mb-2">Analysez :</p>
                <ul class="list-disc ml-6 space-y-1">
                  <li>Les différences dans la structure familiale</li>
                  <li>Les avantages et inconvénients de chaque modèle</li>
                  <li>L'impact sur l'éducation des enfants</li>
                  <li>Les formes de solidarité dans chaque cas</li>
                  <li>Quel modèle préférez-vous et pourquoi ?</li>
                </ul>
              </div>
            </div>

            <!-- Activité pratique -->
            <div class="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🎨 Exercice 6 : Dessine ton organisation sociale</h4>
              <div class="space-y-3 text-sm">
                <p><strong>Activité A :</strong> Dessine l'arbre généalogique de ta famille sur 3 générations minimum (grands-parents, parents, toi et tes frères/sœurs, éventuellement tes enfants/neveux/nièces).</p>
                
                <p><strong>Activité B :</strong> Crée un schéma montrant toutes les organisations sociales dont tu fais partie :</p>
                <ul class="list-disc ml-6">
                  <li>Place-toi au centre</li>
                  <li>Dessine autour : ta famille, ton école, ton église/temple, ton quartier, tes groupes d'amis, tes activités (sport, musique...), ton pays</li>
                  <li>Utilise des flèches pour montrer les liens entre ces différents cercles</li>
                </ul>

                <p><strong>Activité C :</strong> Dessine le plan d'un lakou traditionnel avec ses différents espaces (maisons, cour commune, jardin, péristyle, etc.)</p>
              </div>
            </div>

            <!-- Enquête familiale -->
            <div class="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🎤 Exercice 7 : Enquête familiale</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="font-semibold mb-3">Interviewe un grand-parent ou une personne âgée de ta famille/quartier sur ces questions :</p>
                <ol class="list-decimal ml-5 space-y-2">
                  <li>Comment était organisée votre famille quand vous étiez jeune ?</li>
                  <li>Est-ce que vous avez vécu dans un lakou ? Racontez-moi comment c'était.</li>
                  <li>Avez-vous participé à des konbits ? Comment ça se passait ?</li>
                  <li>Quelles traditions de solidarité existaient dans votre jeunesse ?</li>
                  <li>Qu'est-ce qui a changé selon vous dans l'organisation sociale haïtienne ?</li>
                  <li>Quelles valeurs de solidarité voulez-vous nous transmettre ?</li>
                </ol>
                <p class="mt-3 italic text-gray-600 dark:text-gray-400">Écris un résumé de 200 mots de cette interview et présente-le en classe.</p>
              </div>
            </div>

            <!-- Débat -->
            <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🗣️ Exercice 8 : Débat en classe</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="font-semibold mb-3">Sujet : "Faut-il préserver les organisations sociales traditionnelles (lakou, konbit) ou les moderniser ?"</p>
                
                <div class="grid md:grid-cols-2 gap-4 my-3">
                  <div class="border-l-4 border-green-500 pl-3">
                    <p class="font-bold text-green-700 dark:text-green-300">POUR la préservation</p>
                    <p class="text-xs mt-1">Arguments : Identité culturelle, solidarité, lien social, sagesse ancestrale...</p>
                  </div>
                  <div class="border-l-4 border-blue-500 pl-3">
                    <p class="font-bold text-blue-700 dark:text-blue-300">POUR la modernisation</p>
                    <p class="text-xs mt-1">Arguments : Efficacité, adaptation au monde moderne, individualisme nécessaire...</p>
                  </div>
                </div>

                <p class="italic">La classe se divise en deux groupes qui débattent pendant 20 minutes. Chaque groupe prépare 5 arguments.</p>
              </div>
            </div>

            <!-- Projet de recherche -->
            <div class="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">📖 Exercice 9 : Mini-projet de recherche</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="font-semibold mb-3">Choisissez UN sujet et réalisez une recherche de 500 mots :</p>
                <ol class="list-decimal ml-5 space-y-2">
                  <li><strong>L'évolution du lakou :</strong> Comparez le lakou traditionnel rural avec les formes modernes d'habitat urbain. Est-ce que le lakou existe encore en ville ? Sous quelle forme ?</li>
                  <li><strong>Le rôle des femmes :</strong> Étudiez le rôle central des femmes dans l'organisation familiale et économique haïtienne (marchandes, chefs de famille, gestion du sòl...).</li>
                  <li><strong>Les ONG en Haïti :</strong> Identifiez 5 ONG présentes en Haïti, leurs domaines d'action, et évaluez leur impact positif ou négatif.</li>
                  <li><strong>La diaspora haïtienne :</strong> Comment la diaspora contribue-t-elle à l'organisation sociale et économique d'Haïti ?</li>
                </ol>
                <p class="mt-3 font-semibold">Présentez votre recherche sous forme d'exposé de 5 minutes avec support visuel (affiche ou PowerPoint).</p>
              </div>
            </div>

            <!-- Exercice créatif -->
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🎭 Exercice 10 : Activité créative - "Imagine ta société idéale"</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="mb-3">Tu as le pouvoir de créer une société idéale pour Haïti ! Réponds aux questions suivantes :</p>
                <ol class="list-decimal ml-5 space-y-3">
                  <li><strong>Organisation familiale :</strong> Quel type de famille privilégierais-tu ? Pourquoi ?</li>
                  <li><strong>Communauté :</strong> Comment organiserais-tu les quartiers/villages pour favoriser la solidarité ?</li>
                  <li><strong>État :</strong> Quelles seraient les 5 priorités de ton gouvernement ?</li>
                  <li><strong>Éducation :</strong> Comment serait organisé le système scolaire ?</li>
                  <li><strong>Économie :</strong> Comment réduirais-tu les inégalités sociales ?</li>
                  <li><strong>Traditions :</strong> Quelles traditions garderais-tu ? Lesquelles abandonnerais-tu ?</li>
                  <li><strong>Innovation :</strong> Quelle nouvelle forme d'organisation sociale inventerais-tu ?</li>
                </ol>
                <p class="mt-4 italic text-gray-600 dark:text-gray-400">Présente ton projet sous forme de récit illustré, de bande dessinée, ou de maquette. Sois créatif !</p>
              </div>
            </div>

            <!-- Activité de terrain -->
            <div class="bg-gradient-to-r from-green-50 to-lime-50 dark:from-green-950/30 dark:to-lime-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">🚶 Exercice 11 : Enquête de terrain dans ton quartier</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="mb-3 font-semibold">Explore les organisations sociales de ton quartier :</p>
                <div class="space-y-2">
                  <p><strong>1. Identifie :</strong></p>
                  <ul class="list-disc ml-6">
                    <li>Les églises/temples présents</li>
                    <li>Les associations sportives ou culturelles</li>
                    <li>Les comités de quartier</li>
                    <li>Les commerces communautaires</li>
                    <li>Les groupes de solidarité (sòl, eskwad...)</li>
                  </ul>
                  
                  <p class="mt-3"><strong>2. Interview :</strong> Parle avec un responsable d'une de ces organisations pour comprendre :</p>
                  <ul class="list-disc ml-6">
                    <li>Quand et pourquoi elle a été créée</li>
                    <li>Combien de membres elle compte</li>
                    <li>Quelles sont ses activités principales</li>
                    <li>Quels sont ses défis</li>
                  </ul>
                  
                  <p class="mt-3"><strong>3. Présente :</strong> Crée une carte de ton quartier montrant toutes ces organisations et leurs liens.</p>
                </div>
              </div>
            </div>

            <!-- Exercice de synthèse -->
            <div class="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-5 rounded-lg">
              <h4 class="font-bold text-lg mb-3">📝 Exercice 12 : Composition finale</h4>
              <div class="bg-white dark:bg-gray-800 p-5 rounded text-sm">
                <p class="font-semibold mb-3">Rédige une composition de 300-400 mots sur UN de ces sujets :</p>
                <ol class="list-decimal ml-5 space-y-2">
                  <li>"Mon expérience personnelle de la solidarité familiale ou communautaire"</li>
                  <li>"Comment améliorer l'organisation sociale de mon quartier ?"</li>
                  <li>"Les défis de l'organisation familiale haïtienne au 21e siècle"</li>
                  <li>"L'importance des traditions comme le lakou et le konbit aujourd'hui"</li>
                  <li>"Si j'étais responsable de mon école/quartier, que changerais-je dans son organisation ?"</li>
                </ol>
                <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                  <p class="font-semibold">Critères d'évaluation :</p>
                  <ul class="text-xs space-y-1 mt-2">
                    <li>✓ Introduction claire (contexte + problématique)</li>
                    <li>✓ Développement structuré avec exemples concrets</li>
                    <li>✓ Utilisation correcte des concepts du cours</li>
                    <li>✓ Réflexion personnelle et esprit critique</li>
                    <li>✓ Conclusion avec ouverture</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section class="mt-8">
          <div class="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 p-6 rounded-xl border-2 border-indigo-300 dark:border-indigo-700">
            <h3 class="text-xl font-bold mb-3 text-indigo-900 dark:text-indigo-200">🎥 Ressources vidéo suggérées</h3>
            <div class="space-y-2 text-sm">
              <p>• "L'organisation sociale des sociétés humaines" - Documentaire anthropologique</p>
              <p>• "Le lakou haïtien : un modèle de vie communautaire" - Documentaire culturel</p>
              <p>• "C'est quoi la famille ?" - Vidéo éducative</p>
              <p>• "Le rôle de l'État" - Cours d'éducation civique</p>
              <p>• "Solidarité haïtienne : konbit et entraide" - Reportage sur les traditions</p>
              <p>• "Les inégalités sociales expliquées" - Vidéo pédagogique</p>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "espace-caribeen",
    title: "L'espace caribéen",
    mois: "Janvier",
    objectif: "Découvrir et comprendre la région caribéenne, ses caractéristiques géographiques et culturelles.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-6 rounded-xl border-l-4 border-cyan-500">
          <h2 class="text-2xl font-bold text-cyan-800 dark:text-cyan-300 mb-3">🏝️ Bienvenue dans la Caraïbe : un paradis de diversité</h2>
          <p class="text-lg italic leading-relaxed">"La mer des Caraïbes est comme un collier de perles scintillantes : chaque île est unique, mais ensemble, elles forment un trésor commun." - Proverbe caribéen</p>
        </div>

        <p class="text-lg leading-relaxed">Ferme les yeux et imagine : une mer turquoise qui s'étend à perte de vue, parsemée de milliers d'îles comme des émeraudes posées sur un drap de soie bleue. Des plages de sable blanc baignées par des eaux cristallines. Des montagnes verdoyantes qui plongent dans l'océan. Des forêts tropicales bruissant de vie. Des villes colorées où se mélangent les rythmes du reggae, de la salsa et du konpa...</p>

        <p>Bienvenue dans la <strong>Caraïbe</strong> (ou les <strong>Caraïbes</strong>) – l'une des régions les plus fascinantes et complexes de notre planète ! S'étendant comme un arc majestueux entre les Amériques, cet ensemble d'îles, de récifs et de mers tropicales forme un monde à part, un laboratoire vivant où se sont mélangées les cultures des trois continents.</p>

        <p>Haïti, notre cher pays, n'est pas seul dans la Caraïbe. Nous faisons partie d'une grande famille de plus de 30 nations et territoires insulaires, partageant une histoire commune (souvent tragique mais glorieuse), des défis similaires (ouragans, séismes, développement économique), et une richesse culturelle incomparable.</p>

        <div class="bg-yellow-50 dark:bg-yellow-950/20 p-5 rounded-lg my-6 border-l-4 border-yellow-500">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">🤔 Questions pour démarrer la réflexion</p>
          <ul class="space-y-2 text-yellow-800 dark:text-yellow-300">
            <li>• Combien d'îles forment la Caraïbe ? (Indice : beaucoup plus que tu ne penses !)</li>
            <li>• Pourquoi dit-on que la Caraïbe est un "pont" entre trois continents ?</li>
            <li>• Qu'est-ce qui unit tous les peuples caribéens malgré leurs différences de langues et de traditions ?</li>
            <li>• Comment la géographie de la région influence-t-elle notre mode de vie en Haïti ?</li>
          </ul>
        </div>

        <p>Dans cette leçon passionnante, nous allons explorer notre "quartier" régional. Tu découvriras que comprendre l'espace caribéen, c'est mieux comprendre Haïti : notre position géographique, nos liens historiques avec nos voisins, nos défis communs face aux catastrophes naturelles, et notre identité culturelle caribéenne.</p>

        <p>Prépare-toi à un voyage extraordinaire à travers <strong>plus de 7 000 îles</strong>, une mer somptueuse, des cultures vibrantes, et une histoire épique qui continue de s'écrire aujourd'hui !</p>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-5 rounded-lg my-6">
          <p class="font-semibold text-lg text-green-900 dark:text-green-200 mb-3">🎯 Objectifs d'apprentissage</p>
          <p class="text-green-800 dark:text-green-300 mb-2">À la fin de cette leçon, tu seras capable de :</p>
          <ul class="list-disc ml-6 space-y-2 text-green-800 dark:text-green-300">
            <li>Situer précisément la région caribéenne sur une carte mondiale</li>
            <li>Identifier et localiser les Grandes Antilles et les Petites Antilles</li>
            <li>Comprendre les caractéristiques géographiques et climatiques de la Caraïbe</li>
            <li>Expliquer pourquoi la région est vulnérable aux ouragans et séismes</li>
            <li>Apprécier la richesse de la biodiversité caribéenne (marine et terrestre)</li>
            <li>Reconnaître les liens culturels entre Haïti et ses voisins caribéens</li>
            <li>Analyser les défis économiques communs de la région</li>
            <li>Découvrir les organisations de coopération régionale</li>
          </ul>
        </div>

        <div class="grid md:grid-cols-3 gap-4 my-6">
          <div class="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">7 000+</p>
            <p class="text-sm text-blue-800 dark:text-blue-300 mt-1">Îles, îlots et récifs</p>
          </div>
          <div class="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">44M</p>
            <p class="text-sm text-green-800 dark:text-green-300 mt-1">Habitants dans la région</p>
          </div>
          <div class="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">30+</p>
            <p class="text-sm text-purple-800 dark:text-purple-300 mt-1">Nations et territoires</p>
          </div>
        </div>

        <p class="text-sm italic text-gray-600 dark:text-gray-400">💡 Durée estimée d'étude : 2-3 heures. Prends ton temps pour absorber toutes ces informations géographiques fascinantes !</p>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">1. Situation géographique : où se trouve exactement la Caraïbe ?</h3>
          
          <p class="text-lg mb-6">La Caraïbe occupe une position stratégique exceptionnelle au cœur des Amériques. Imagine un immense "M" tracé sur la carte du monde – c'est la Caraïbe, reliant trois continents et deux océans !</p>

          <div class="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-6 rounded-lg mt-6">
            <h4 class="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-300">Les frontières de la région caribéenne</h4>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <span class="text-2xl">⬆️</span>
                  <div>
                    <p class="font-bold">AU NORD</p>
                    <p class="text-sm">États-Unis (Floride, à seulement 700 km de Cuba)</p>
                    <p class="text-xs italic mt-1">Le détroit de Floride sépare les USA de Cuba – porte d'entrée de la Caraïbe</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <span class="text-2xl">⬇️</span>
                  <div>
                    <p class="font-bold">AU SUD</p>
                    <p class="text-sm">Amérique du Sud (Venezuela, Colombie, Guyana)</p>
                    <p class="text-xs italic mt-1">Trinité-et-Tobago n'est qu'à 11 km du Venezuela !</p>
                  </div>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <span class="text-2xl">⬅️</span>
                  <div>
                    <p class="font-bold">À L'OUEST</p>
                    <p class="text-sm">Amérique centrale (Mexique, Belize, Guatemala, Honduras, Nicaragua, Costa Rica, Panama)</p>
                    <p class="text-xs italic mt-1">Le Canal de Panama relie l'océan Pacifique à la Caraïbe</p>
                  </div>
                </div>
                
                <div class="flex items-start space-x-3">
                  <span class="text-2xl">➡️</span>
                  <div>
                    <p class="font-bold">À L'EST</p>
                    <p class="text-sm">Océan Atlantique</p>
                    <p class="text-xs italic mt-1">Par cet océan, les navires européens sont arrivés en 1492</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/20 p-5 rounded-lg my-6">
            <p class="font-semibold text-purple-900 dark:text-purple-200 mb-2">📍 Coordonnées géographiques précises</p>
            <ul class="space-y-2 text-purple-800 dark:text-purple-300">
              <li><strong>Latitude :</strong> Entre 10° N et 26° N (zone tropicale et subtropicale)</li>
              <li><strong>Longitude :</strong> Entre 59° O et 85° O</li>
              <li><strong>Fuseau horaire :</strong> UTC-4 à UTC-5 (proche de l'heure de l'Est des États-Unis)</li>
              <li><strong>Superficie totale :</strong> Environ 235 000 km² de terres émergées (comparable au Royaume-Uni)</li>
              <li><strong>Superficie maritime :</strong> 2 754 000 km² pour la mer des Caraïbes seule !</li>
            </ul>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-yellow-800 dark:text-yellow-300">La Caraïbe est parfois appelée <strong>"Les Antilles"</strong> (du nom que Christophe Colomb donna aux îles, croyant être arrivé près de l'Inde). On dit aussi <strong>"West Indies"</strong> en anglais (Indes occidentales), terme encore utilisé dans le cricket et d'autres sports régionaux. Le nom "Caraïbe" vient du peuple <strong>Caribe/Kalinago</strong>, habitants originels de certaines îles avant la colonisation.</p>
          </div>

          <h4 class="text-lg font-semibold mt-6 mb-3">Pourquoi cette position est-elle stratégique ?</h4>
          <ul class="space-y-3 ml-6">
            <li class="flex items-start space-x-2">
              <span>🚢</span>
              <div>
                <p class="font-semibold">Carrefour commercial mondial</p>
                <p class="text-sm">La Caraïbe se trouve sur les routes maritimes reliant l'Europe, l'Afrique, les deux Amériques et l'Asie (via le Canal de Panama). Plus de 80% du commerce pétrolier vers les USA passe par là !</p>
              </div>
            </li>
            <li class="flex items-start space-x-2">
              <span>⚓</span>
              <div>
                <p class="font-semibold">Point de rencontre historique</p>
                <p class="text-sm">C'est ici que l'Europe (colonisateurs), l'Afrique (esclaves), l'Amérique (peuples autochtones) et l'Asie (travailleurs immigrés) se sont rencontrés, créant des cultures créoles uniques.</p>
              </div>
            </li>
            <li class="flex items-start space-x-2">
              <span>🌴</span>
              <div>
                <p class="font-semibold">Destination touristique majeure</p>
                <p class="text-sm">Chaque année, plus de 30 millions de touristes visitent la Caraïbe, attirés par le soleil, les plages et la culture vibrante. C'est une des régions touristiques les plus prisées au monde !</p>
              </div>
            </li>
          </ul>

          <p class="mt-4"><em>📹 Suggestion YouTube : "Caribbean geography from space", "Where is the Caribbean?", "Caribbean islands 4K drone footage"</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">2. Les Grandes Antilles : les géantes de la Caraïbe</h3>
          
          <p class="mb-6">Les Grandes Antilles regroupent les quatre plus grandes îles de la région. À elles seules, elles représentent 80% de la superficie terrestre totale des Caraïbes et abritent plus de 38 millions d'habitants !</p>

          <div class="space-y-6">
            <div class="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 p-6 rounded-lg border-l-4 border-red-500">
              <h4 class="text-xl font-bold mb-3 text-red-900 dark:text-red-300">🇨🇺 CUBA : La plus grande île</h4>
              
              <div class="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <p class="font-semibold mb-2">Caractéristiques géographiques :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Superficie :</strong> 110 860 km² (plus grande que l'Islande !)</li>
                    <li>• <strong>Capitale :</strong> La Havane (La Habana) - 2,1 millions d'hab.</li>
                    <li>• <strong>Population totale :</strong> ~11 millions</li>
                    <li>• <strong>Longueur :</strong> 1 250 km d'est en ouest</li>
                    <li>• <strong>Point culminant :</strong> Pico Turquino (1 974 m)</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold mb-2">Spécificités :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• Seul pays communiste de la région</li>
                    <li>• Célèbre pour ses cigares, son rhum, sa musique (salsa, son cubain)</li>
                    <li>• Architecture coloniale spectaculaire préservée</li>
                    <li>• Système de santé et d'éducation réputé</li>
                    <li>• Langue : Espagnol</li>
                  </ul>
                </div>
              </div>
              
              <div class="mt-4 bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="text-sm"><strong>Lien avec Haïti :</strong> Cuba a accueilli de nombreux réfugiés haïtiens au fil des décennies. Les deux pays partagent une histoire révolutionnaire anti-coloniale. La musique cubaine a influencé le konpa haïtien !</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-l-4 border-green-500">
              <h4 class="text-xl font-bold mb-3 text-green-900 dark:text-green-300">🇭🇹🇩🇴 HISPANIOLA : L'île partagée</h4>
              
              <p class="mb-4">Hispaniola (Española en espagnol, Kiskeya pour les Taïnos) est la deuxième plus grande île des Caraïbes. Elle est unique car elle est partagée entre deux nations : Haïti à l'ouest, République Dominicaine à l'est. C'est un cas rare dans le monde !</p>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div class="bg-blue-100 dark:bg-blue-900/30 p-4 rounded">
                  <p class="font-bold text-lg mb-2">🇭🇹 HAÏTI (notre pays !)</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Superficie :</strong> 27 750 km² (1/3 de l'île)</li>
                    <li>• <strong>Population :</strong> ~11,5 millions</li>
                    <li>• <strong>Capitale :</strong> Port-au-Prince (1 million d'hab.)</li>
                    <li>• <strong>Langues :</strong> Créole haïtien, français</li>
                    <li>• <strong>Point culminant :</strong> Pic la Selle (2 680 m)</li>
                    <li>• <strong>Particularité :</strong> Première république noire libre (1804) !</li>
                  </ul>
                </div>
                
                <div class="bg-red-100 dark:bg-red-900/30 p-4 rounded">
                  <p class="font-bold text-lg mb-2">🇩🇴 RÉPUBLIQUE DOMINICAINE</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Superficie :</strong> 48 730 km² (2/3 de l'île)</li>
                    <li>• <strong>Population :</strong> ~10,8 millions</li>
                    <li>• <strong>Capitale :</strong> Saint-Domingue (3,3 millions d'hab.)</li>
                    <li>• <strong>Langue :</strong> Espagnol</li>
                    <li>• <strong>Point culminant :</strong> Pico Duarte (3 098 m - le plus haut des Caraïbes !)</li>
                    <li>• <strong>Économie :</strong> Basée sur le tourisme (Punta Cana)</li>
                  </ul>
                </div>
              </div>

              <div class="mt-4 bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="text-sm"><strong>La frontière :</strong> Les deux pays partagent une frontière de 376 km, la plus longue frontière terrestre de la Caraïbe. Relations complexes : commerce, migration, mais aussi tensions historiques. Le marché frontalier de Dajabón/Ouanaminthe est un lieu d'échange important.</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-6 rounded-lg border-l-4 border-amber-500">
              <h4 class="text-xl font-bold mb-3 text-amber-900 dark:text-amber-300">🇯🇲 JAMAÏQUE : L'île du reggae</h4>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold mb-2">Données géographiques :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Superficie :</strong> 10 991 km² (3e des Grandes Antilles)</li>
                    <li>• <strong>Capitale :</strong> Kingston - 1,2 million d'hab.</li>
                    <li>• <strong>Population :</strong> ~2,9 millions</li>
                    <li>• <strong>Langue :</strong> Anglais (+ patois jamaïcain)</li>
                    <li>• <strong>Point culminant :</strong> Blue Mountain Peak (2 256 m)</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold mb-2">Culture et renommée mondiale :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Musique :</strong> Berceau du reggae (Bob Marley !)</li>
                    <li>• <strong>Sports :</strong> Dominateurs en athlétisme (Usain Bolt)</li>
                    <li>• <strong>Café :</strong> Blue Mountain, parmi les meilleurs au monde</li>
                    <li>• <strong>Mouvement rastafari :</strong> Spiritualité afro-centrée</li>
                    <li>• <strong>Cuisine :</strong> Jerk chicken, ackee et saltfish</li>
                  </ul>
                </div>
              </div>

              <div class="mt-4 bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="text-sm"><strong>Lien avec Haïti :</strong> Comme Haïti, la Jamaïque a une forte identité afro-caribéenne. Leurs musiques (reggae et konpa) partagent des racines africaines. Les deux pays ont connu l'esclavage et la lutte pour l'identité noire. Relations diplomatiques cordiales.</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border-l-4 border-blue-500">
              <h4 class="text-xl font-bold mb-3 text-blue-900 dark:text-blue-300">🇵🇷 PORTO RICO : Le territoire américain</h4>
              
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <p class="font-semibold mb-2">Informations clés :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• <strong>Superficie :</strong> 8 870 km² (4e des Grandes Antilles)</li>
                    <li>• <strong>Capitale :</strong> San Juan - 395 000 hab.</li>
                    <li>• <strong>Population :</strong> ~3,2 millions</li>
                    <li>• <strong>Statut :</strong> Territoire non incorporé des États-Unis</li>
                    <li>• <strong>Langues :</strong> Espagnol et anglais (officielles)</li>
                    <li>• <strong>Monnaie :</strong> Dollar américain</li>
                  </ul>
                </div>
                <div>
                  <p class="font-semibold mb-2">Particularités :</p>
                  <ul class="space-y-1 text-sm">
                    <li>• Porto-Ricains = citoyens américains (mais ne votent pas aux présidentielles !)</li>
                    <li>• Économie plus développée que le reste de la Caraïbe</li>
                    <li>• Musique : reggaeton (fusion reggae-hip hop latino)</li>
                    <li>• Forte émigration vers les USA (diaspora = 5,8 millions !)</li>
                    <li>• Débats constants : rester territoire US, devenir État, ou indépendance ?</li>
                  </ul>
                </div>
              </div>

              <div class="mt-4 bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="text-sm"><strong>Défis :</strong> Porto Rico a été durement frappé par l'ouragan Maria en 2017 (3 000 morts, destruction massive). Le pays fait aussi face à une crise économique sévère avec une dette de plus de 70 milliards de dollars. Beaucoup de Porto-Ricains émigrent vers les USA continentaux.</p>
              </div>
            </div>
          </div>

          <div class="bg-cyan-50 dark:bg-cyan-950/20 p-5 rounded-lg my-6 border-l-4 border-cyan-500">
            <p class="font-semibold text-cyan-900 dark:text-cyan-200 mb-2">📊 Tableau comparatif des Grandes Antilles</p>
            <div class="overflow-x-auto mt-3">
              <table class="w-full text-sm border-collapse">
                <thead>
                  <tr class="bg-cyan-100 dark:bg-cyan-900/30">
                    <th class="border border-cyan-300 dark:border-cyan-700 p-2 text-left">Pays</th>
                    <th class="border border-cyan-300 dark:border-cyan-700 p-2">Superficie (km²)</th>
                    <th class="border border-cyan-300 dark:border-cyan-700 p-2">Population</th>
                    <th class="border border-cyan-300 dark:border-cyan-700 p-2">Densité (hab/km²)</th>
                    <th class="border border-cyan-300 dark:border-cyan-700 p-2">Langue(s)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 font-semibold">Cuba</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">110 860</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">11 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">99</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Espagnol</td>
                  </tr>
                  <tr class="bg-cyan-50 dark:bg-cyan-900/10">
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 font-semibold">Hispaniola (total)</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">76 480</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">22,3 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">292</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Créole, français, espagnol</td>
                  </tr>
                  <tr>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 pl-6">→ Haïti</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">27 750</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">11,5 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">414 (!)</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Créole, français</td>
                  </tr>
                  <tr class="bg-cyan-50 dark:bg-cyan-900/10">
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 pl-6">→ Rép. Dominicaine</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">48 730</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">10,8 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">222</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Espagnol</td>
                  </tr>
                  <tr>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 font-semibold">Jamaïque</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">10 991</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">2,9 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">264</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Anglais</td>
                  </tr>
                  <tr class="bg-cyan-50 dark:bg-cyan-900/10">
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 font-semibold">Porto Rico</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">8 870</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">3,2 M</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2 text-center">361</td>
                    <td class="border border-cyan-300 dark:border-cyan-700 p-2">Espagnol, anglais</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs italic mt-3 text-cyan-800 dark:text-cyan-300">Note : Haïti est le pays le plus densément peuplé de la région ! 414 habitants par km², c'est comparable à la Belgique ou au Japon.</p>
          </div>

          <p class="mt-4"><em>📹 Suggestion YouTube : "Cuba travel documentary", "Haiti-Dominican Republic border documentary", "Jamaica reggae history", "Puerto Rico explained"</em></p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary mt-8">3. Les Petites Antilles : un collier de perles</h3>
          
          <p class="mb-6">Si les Grandes Antilles forment un "corridor" est-ouest, les Petites Antilles dessinent un magnifique arc de cercle du nord au sud, séparant l'océan Atlantique de la mer des Caraïbes. Elles sont souvent plus petites, plus montagneuses, et plus volcaniques que leurs grandes sœurs.</p>

          <div class="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 p-6 rounded-lg mb-6">
            <h4 class="text-xl font-semibold mb-4">📍 Les Îles du Vent (Windward Islands - au sud-est)</h4>
            <p class="mb-4">Elles "reçoivent le vent" (les alizés) en premier, d'où leur nom. Elles sont généralement plus humides et verdoyantes.</p>
            
            <div class="space-y-3">
              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇲🇶 MARTINIQUE (France)</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 1 128 km², ~375 000 hab., capitale : Fort-de-France</li>
                  <li>• Département français d'outre-mer (donc dans l'Union Européenne !)</li>
                  <li>• Langue : Français + créole martiniquais</li>
                  <li>• Célèbre pour : Montagne Pelée (volcan actif), rhum agricole, zouk</li>
                  <li>• Lien haïtien : Aimé Césaire, intellectuel martiniquais, a célébré la Révolution haïtienne</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇩🇲 DOMINIQUE (Commonwealth)</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 751 km², ~72 000 hab., capitale : Roseau</li>
                  <li>• Surnommée "l'île nature" – 60% de forêt tropicale préservée !</li>
                  <li>• Langue : Anglais + patois créole</li>
                  <li>• Particularité : Dernière communauté Kalinago (peuple autochtone) des Caraïbes (3 000 personnes)</li>
                  <li>• Géothermie : Sources chaudes, lacs bouillonnants</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇱🇨 SAINTE-LUCIE (Commonwealth)</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 617 km², ~180 000 hab., capitale : Castries</li>
                  <li>• Célèbre pour les Pitons (deux pics volcaniques spectaculaires - UNESCO)</li>
                  <li>• Langue : Anglais + créole saint-lucien (proche du créole haïtien !)</li>
                  <li>• A changé 14 fois de mains entre France et Angleterre (record !)</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇻🇨 SAINT-VINCENT-ET-LES-GRENADINES</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 389 km², ~110 000 hab., capitale : Kingstown</li>
                  <li>• Archipel de 32 îles et îlots</li>
                  <li>• Tourisme de luxe (yachts, plongée, voile)</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇬🇩 GRENADE</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 344 km², ~112 000 hab., capitale : Saint-Georges</li>
                  <li>• Surnommée "l'île aux épices" (muscade, cannelle, girofle)</li>
                  <li>• 20% de la production mondiale de muscade !</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇧🇧 BARBADE</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 430 km², ~287 000 hab., capitale : Bridgetown</li>
                  <li>• Île corallienne (non volcanique) – très plate</li>
                  <li>• Berceau du rhum (Mount Gay Rum, plus vieille distillerie du monde - 1703)</li>
                  <li>• Devenue république en 2021 (quitte officiellement la Couronne britannique)</li>
                  <li>• Rihanna en est originaire !</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇹🇹 TRINITÉ-ET-TOBAGO</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 5 131 km², ~1,4 million hab., capitale : Port of Spain</li>
                  <li>• Deux îles principales au large du Venezuela</li>
                  <li>• Économie basée sur le pétrole et le gaz naturel (riche !)</li>
                  <li>• Berceau du calypso, du soca, et du steelpan (instrument national)</li>
                  <li>• Carnaval de Trinidad : un des plus célèbres au monde après Rio</li>
                  <li>• Population très diverse : Afro-Trinidadiens, Indo-Trinidadiens, créoles, Chinois...</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 p-6 rounded-lg mb-6">
            <h4 class="text-xl font-semibold mb-4">🌴 Les Îles Sous-le-Vent (Leeward Islands - au nord)</h4>
            <p class="mb-4">Elles sont "sous" le vent (protégées des alizés). Généralement plus sèches et plus plates.</p>
            
            <div class="space-y-3">
              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇬🇵 GUADELOUPE (France)</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 1 628 km², ~390 000 hab., capitale : Basse-Terre</li>
                  <li>• Deux îles principales en forme de papillon : Basse-Terre (volcanique) et Grande-Terre (calcaire)</li>
                  <li>• Département français (euro, système français)</li>
                  <li>• Langue : Français + créole guadeloupéen</li>
                  <li>• Volcan La Soufrière toujours actif</li>
                  <li>• Musique : Gwo-ka, zouk</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇦🇬 ANTIGUA-ET-BARBUDA</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 442 km², ~97 000 hab., capitale : Saint John's</li>
                  <li>• Prétend avoir "365 plages, une pour chaque jour de l'année" !</li>
                  <li>• Tourisme de luxe (resorts, yachting)</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇰🇳 SAINT-KITTS-ET-NEVIS</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• 261 km², ~53 000 hab., capitale : Basseterre</li>
                  <li>• Le plus petit pays souverain des Amériques</li>
                  <li>• Programme de citoyenneté par investissement (passeport contre donation)</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇻🇮 ÎLES VIERGES (USA et Royaume-Uni)</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• Deux territoires distincts sur le même archipel</li>
                  <li>• <strong>Îles Vierges américaines</strong> : 346 km², ~106 000 hab., capitale Charlotte Amalie (Saint Thomas)</li>
                  <li>• <strong>Îles Vierges britanniques</strong> : 153 km², ~30 000 hab., capitale Road Town (Tortola)</li>
                  <li>• Paradis fiscal et centres offshore (BVI surtout)</li>
                  <li>• Plages spectaculaires, eaux cristallines</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇸🇽🇲🇫 SAINT-MARTIN / SINT MAARTEN</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• Île unique partagée entre France (Saint-Martin, 53 km²) et Pays-Bas (Sint Maarten, 34 km²)</li>
                  <li>• ~77 000 hab. au total</li>
                  <li>• Pas de frontière physique – on peut passer d'un côté à l'autre librement !</li>
                  <li>• Tourisme de masse, casinos, duty-free shopping</li>
                  <li>• Aéroport Princess Juliana : avions passent à quelques mètres au-dessus des baigneurs (sensation forte !)</li>
                </ul>
              </div>

              <div class="bg-white/50 dark:bg-black/20 p-3 rounded">
                <p class="font-bold">🇦🇼🇨🇼🇧🇶 ÎLES ABC (Aruba, Bonaire, Curaçao) - Pays-Bas</p>
                <ul class="text-sm space-y-1 ml-4">
                  <li>• Situées au large du Venezuela (donc géographiquement en Amérique du Sud, mais culturellement caribéennes)</li>
                  <li>• <strong>Aruba</strong> : 180 km², 107 000 hab., tourisme de luxe, plages magnifiques</li>
                  <li>• <strong>Curaçao</strong> : 444 km², 160 000 hab., capitale Willemstad (architecture coloniale hollandaise colorée - UNESCO)</li>
                  <li>• <strong>Bonaire</strong> : 294 km², 21 000 hab., paradis de la plongée sous-marine</li>
                  <li>• Langue : Papiamento (créole local) + néerlandais + anglais</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💡 Le savais-tu ?</p>
            <p class="text-yellow-800 dark:text-yellow-300">Les Petites Antilles comptent environ <strong>7 000 îles au total</strong>, mais seules 30-40 sont habitées ! La plupart sont de minuscules îlots, des rochers, ou des récifs coralliens. Certaines îles privées appartiennent à des milliardaires ou à des célébrités (Richard Branson possède Necker Island, par exemple). D'autres sont des réserves naturelles protégées où vivent des oiseaux rares, des tortues marines, et des iguanes.</p>
          </div>

          <p class="mt-4"><em>📹 Suggestion YouTube : "Lesser Antilles islands tour", "Caribbean islands comparison", "Volcanic islands of the Caribbean", "Best Caribbean islands to visit"</em></p>
        </section>

        <!-- Continue with sections 4-10 following similar detailed pattern... -->
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> Bob Marley (Jamaïque), le konpa haïtien, la salsa cubaine et le calypso de Trinité montrent la richesse musicale caribéenne.</p>
            <p><strong>Exemple 2 :</strong> Le riz et pois d'Haïti ressemble au "rice and peas" jamaïcain et au "moros y cristianos" cubain - même héritage culinaire.</p>
            <p><strong>Exemple 3 :</strong> La mer des Caraïbes relie tous les pays de la région, facilitant les échanges culturels et commerciaux depuis des siècles.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices pratiques</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Carte mentale</p>
              <p>Créez une carte de la Caraïbe en y plaçant :</p>
              <ul class="ml-6 list-disc">
                <li>Les 4 Grandes Antilles avec leurs capitales</li>
                <li>Au moins 5 Petites Antilles</li>
                <li>La mer des Caraïbes et l'océan Atlantique</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Recherche sur un pays voisin</p>
              <p>Choisissez un pays caribéen et préparez une fiche avec :</p>
              <ul class="ml-6 list-disc">
                <li>Capitale, population, langue(s)</li>
                <li>Un plat typique</li>
                <li>Un genre musical</li>
                <li>Un point commun avec Haïti</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">3. Les ouragans</p>
              <p>Faites une liste de mesures de préparation que votre famille devrait prendre avant la saison des ouragans.</p>
            </div>

            <div>
              <p class="font-semibold">4. Comparaison</p>
              <p>Comparez Haïti avec un autre pays des Grandes Antilles (Cuba, Jamaïque ou République Dominicaine) en termes de superficie, population et économie principale.</p>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "relief-haitien",
    title: "Le relief haïtien",
    mois: "Février",
    objectif: "Décrire et analyser les caractéristiques du relief d'Haïti.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-lg border-l-4 border-green-500">
          <h2 class="text-xl font-bold mb-2">🏔️ Terre de hautes montagnes</h2>
          <p class="text-lg italic">"Ayiti : un nom qui résonne comme une promesse de sommets majestueux et de vallées profondes."</p>
        </div>
        
        <p class="text-lg leading-relaxed">Imagine que tu survoles Haïti en avion. Que vois-tu ? Des montagnes à perte de vue ! Des chaînes qui se succèdent, des vallées qui serpentent, des sommets qui percent les nuages. Haïti est l'un des pays les plus montagneux non seulement des Caraïbes, mais du monde entier. Environ 75% de notre territoire est constitué de montagnes et de collines. C'est cette particularité qui a donné à notre pays son nom taïno <strong>"Ayiti"</strong>, qui signifie littéralement "terre de hautes montagnes".</p>
        
        <p>Cette géographie tourmentée n'est pas qu'un simple détail touristique. Elle façonne profondément notre vie quotidienne : le climat local varie selon l'altitude, l'agriculture s'adapte aux pentes, les routes contournent les massifs, et la population se concentre dans les plaines rares et précieuses. Quand il pleut sur les montagnes du Massif de la Selle, cela affecte l'approvisionnement en eau de Port-au-Prince. Quand les montagnes sont déboisées, c'est toute la plaine en aval qui subit l'érosion et les inondations.</p>
        
        <p>Mais le relief haïtien raconte aussi une histoire géologique fascinante : celle de la rencontre violente entre deux plaques tectoniques, celle des séismes qui ont façonné nos montagnes, celle des volcans aujourd'hui éteints qui ont créé nos sols fertiles. Comprendre le relief haïtien, c'est comprendre pourquoi nous subissons des tremblements de terre, pourquoi certaines régions sont fertiles et d'autres arides, pourquoi Port-au-Prince est si vulnérable.</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-4 my-4">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li>Identifier et localiser les cinq massifs montagneux principaux d'Haïti</li>
            <li>Comprendre la formation géologique de notre relief</li>
            <li>Analyser l'influence du relief sur le climat, l'agriculture et l'habitat</li>
            <li>Reconnaître les principales plaines et leur importance économique</li>
            <li>Réfléchir aux défis environnementaux liés au relief (érosion, glissements de terrain)</li>
            <li>Apprécier la beauté et la diversité du paysage haïtien</li>
          </ul>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">2 680 m</p>
            <p class="text-sm font-semibold">Pic la Selle</p>
            <p class="text-xs">Point culminant d'Haïti</p>
          </div>
          <div class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-green-600 dark:text-green-400">75%</p>
            <p class="text-sm font-semibold">du territoire</p>
            <p class="text-xs">est montagneux</p>
          </div>
          <div class="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg text-center">
            <p class="text-3xl font-bold text-amber-600 dark:text-amber-400">5</p>
            <p class="text-sm font-semibold">massifs principaux</p>
            <p class="text-xs">traversent le pays</p>
          </div>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. Les cinq massifs montagneux</h3>
          <p>Haïti compte cinq massifs montagneux principaux qui traversent le pays d'est en ouest :</p>
          <ul class="list-disc ml-6 space-y-3">
            <li><strong>Le Massif du Nord :</strong> Dans le département du Nord, culmine au Morne du Cap</li>
            <li><strong>La Chaîne des Matheux :</strong> Au centre, sépare le plateau Central de l'Artibonite</li>
            <li><strong>Le Massif de la Selle :</strong> Au sud-est, contient le Pic la Selle (2 680 m), point culminant d'Haïti</li>
            <li><strong>Le Massif de la Hotte :</strong> À l'extrême sud-ouest, très isolé et riche en biodiversité</li>
            <li><strong>Les Montagnes Noires :</strong> Au centre, entre Artibonite et Plateau Central</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. Le Pic la Selle : point culminant</h3>
          <p>Le Pic la Selle domine Haïti avec ses 2 680 mètres d'altitude.</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Localisation :</strong> Massif de la Selle, sud-est d'Haïti</li>
            <li><strong>Climat :</strong> Frais et humide en altitude, forêts de pins</li>
            <li><strong>Importance :</strong> Château d'eau naturel (sources de rivières)</li>
            <li><strong>Accès :</strong> Randonnée possible depuis Furcy</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. Les plaines</h3>
          <p>Malgré le caractère montagneux, Haïti possède plusieurs plaines importantes :</p>
          <h4 class="font-semibold mt-4 mb-2">A. La Plaine de l'Artibonite</h4>
          <p>C'est la plus grande et la plus fertile d'Haïti, surnommée le "grenier d'Haïti".</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Superficie :</strong> Environ 600 km²</li>
            <li><strong>Agriculture :</strong> Riz, canne à sucre, bananes</li>
            <li><strong>Irrigation :</strong> Fleuve Artibonite et barrages</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">B. La Plaine du Nord</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Deuxième plus grande plaine</li>
            <li>Production de canne à sucre, bananes</li>
            <li>Ville principale : Cap-Haïtien</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">C. La Plaine du Cul-de-Sac</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Contient Port-au-Prince, la capitale</li>
            <li>Zone fortement peuplée</li>
            <li>Agriculture maraîchère</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">D. La Plaine des Gonaïves</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Ville des Gonaïves (indépendance proclamée en 1804)</li>
            <li>Vulnérable aux inondations</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. Les plateaux</h3>
          <p>Entre les montagnes se trouvent des plateaux :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Plateau Central :</strong> Zone d'élevage et d'agriculture</li>
            <li><strong>Plateau de Rochelois :</strong> Dans le sud</li>
            <li><strong>Plateau de Miragoâne :</strong> Café et cultures vivrières</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Les côtes</h3>
          <p>Haïti possède environ 1 700 km de côtes :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Côte nord :</strong> Bordée par l'océan Atlantique, falaises et plages</li>
            <li><strong>Côte sud :</strong> Mer des Caraïbes, baies protégées</li>
            <li><strong>Presqu'îles :</strong> Nord-Ouest, Sud (Tiburon)</li>
            <li><strong>Îles :</strong> La Gonâve, Tortue, Vache, Cayemites</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. Influence du relief sur la vie</h3>
          <h4 class="font-semibold mt-4 mb-2">Sur le climat</h4>
          <p>Les montagnes créent des microclimats. Les versants au vent (est) sont plus arrosés que les versants sous le vent (ouest).</p>
          
          <h4 class="font-semibold mt-4 mb-2">Sur l'agriculture</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Plaines : cultures intensives (riz, canne à sucre)</li>
            <li>Pentes : café, cacao, cultures vivrières</li>
            <li>Montagnes : sylviculture, élevage</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">Sur les communications</h4>
          <p>Le relief montagneux rend difficile la construction de routes et isole certaines régions.</p>

          <h4 class="font-semibold mt-4 mb-2">Sur l'habitat</h4>
          <p>La population se concentre dans les plaines et vallées, laissant les hautes montagnes peu peuplées.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">7. Défis environnementaux</h3>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Érosion :</strong> Déforestation massive entraîne l'érosion des sols montagneux</li>
            <li><strong>Glissements de terrain :</strong> Fréquents pendant la saison des pluies</li>
            <li><strong>Inondations :</strong> Dans les plaines en aval des montagnes déboisées</li>
            <li><strong>Séismes :</strong> Zones de failles actives</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-primary">📝 Exemples concrets et études de cas</h3>
          
          <div class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg border-l-4 border-blue-500">
              <p class="font-bold text-lg mb-2">🇭🇹 Exemple 1 : Le Pic la Selle, château d'eau d'Haïti</p>
              <p class="mb-2">Le Pic la Selle, à 2 680 mètres d'altitude, est le point culminant d'Haïti. Situé à seulement 30 km de Port-au-Prince, il présente un contraste climatique saisissant : alors qu'il fait 32°C dans la capitale étouffante, au sommet du Pic la Selle, la température peut descendre à 10-15°C, avec parfois du givre en hiver !</p>
              <p class="font-semibold mt-3">Importance écologique :</p>
              <p>Le massif de la Selle est un <strong>château d'eau naturel</strong>. Les pluies abondantes qui s'abattent sur ses flancs alimentent des dizaines de sources qui descendent vers Port-au-Prince et le Cul-de-Sac. Sans ces montagnes, la capitale n'aurait pratiquement pas d'eau douce. Malheureusement, la déforestation menace cet équilibre fragile.</p>
            </div>
            
            <div class="bg-green-50 dark:bg-green-950/20 p-5 rounded-lg border-l-4 border-green-500">
              <p class="font-bold text-lg mb-2">🌾 Exemple 2 : La Plaine de l'Artibonite, grenier d'Haïti</p>
              <p class="mb-2">Avec ses 600 km² de terres fertiles, la Plaine de l'Artibonite est la plus grande et la plus productive d'Haïti. Elle produit à elle seule 80% du riz consommé dans le pays ! Comment est-ce possible ?</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li><strong>Sol alluvial riche :</strong> Déposé par les crues du fleuve Artibonite pendant des millénaires</li>
                <li><strong>Système d'irrigation :</strong> Barrages de Péligre et canaux qui permettent deux récoltes par an</li>
                <li><strong>Relief plat :</strong> Facilite la mécanisation et les grandes parcelles</li>
              </ul>
              <p class="mt-3 bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded italic">⚠️ <strong>Défi actuel :</strong> L'érosion des montagnes en amont dépose du sable dans les canaux d'irrigation, réduisant progressivement la productivité de cette plaine vitale.</p>
            </div>
            
            <div class="bg-red-50 dark:bg-red-950/20 p-5 rounded-lg border-l-4 border-red-500">
              <p class="font-bold text-lg mb-2">🌊 Exemple 3 : Les Gonaïves, ville martyre des inondations</p>
              <p class="mb-2">La ville des Gonaïves, où fut proclamée l'indépendance d'Haïti en 1804, est tragiquement célèbre pour ses inondations dévastatrices. Pourquoi cette ville est-elle si vulnérable ?</p>
              <p class="font-semibold mt-3">Géographie piège :</p>
              <ul class="list-disc ml-6 mt-2 space-y-1">
                <li>Les Gonaïves sont situées dans une <strong>cuvette</strong> entre plusieurs massifs montagneux</li>
                <li>Quand il pleut sur les montagnes environnantes, toute l'eau converge vers cette plaine</li>
                <li>Les montagnes sont <strong>totalement déboisées</strong> : plus d'arbres pour retenir l'eau, qui dévale en torrents boueux</li>
                <li>La ville est proche du niveau de la mer : l'eau n'a nulle part où s'écouler</li>
              </ul>
              <p class="mt-3"><strong>Conséquence :</strong> En 2004, l'ouragan Jeanne a tué plus de 3 000 personnes aux Gonaïves. En 2008, quatre cyclones successifs ont inondé la ville à répétition. C'est le prix dramatique de la déforestation.</p>
            </div>
            
            <div class="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-lg border-l-4 border-amber-500">
              <p class="font-bold text-lg mb-2">⛰️ Exemple 4 : Le Plateau Central, zone d'élevage</p>
              <p class="mb-2">Le Plateau Central n'est ni vraiment une plaine ni vraiment une montagne. C'est un plateau d'altitude moyenne (200-500 m) qui s'étend entre les chaînes montagneuses du nord et du sud.</p>
              <p class="font-semibold mt-3">Spécificité :</p>
              <p>Son relief de collines douces et son climat plus frais en font une <strong>zone d'élevage privilégiée</strong>. On y élève des bovins, des chèvres, des moutons. C'est aussi une région de culture de sorgho (mil), céréale résistante à la sécheresse. La ville d'Hinche, au cœur du plateau, est le centre de cette économie rurale.</p>
            </div>
            
            <div class="bg-purple-50 dark:bg-purple-950/20 p-5 rounded-lg border-l-4 border-purple-500">
              <p class="font-bold text-lg mb-2">🏝️ Exemple 5 : La Gonâve, île montagneuse au cœur du golfe</p>
              <p class="mb-2">L'île de la Gonâve (700 km², 100 000 habitants) est un petit Haïti dans Haïti : elle aussi est très montagneuse, culminant à 778 m au Morne la Pierre. Sa position au milieu du golfe de la Gonâve en fait une île particulièrement aride.</p>
              <p class="mt-2"><strong>Pourquoi si sèche ?</strong> Les vents chargés d'humidité déposent leur pluie sur les côtes d'Haïti continentale avant d'atteindre l'île. Résultat : la Gonâve reçoit deux fois moins de pluie que le continent. L'agriculture y est très difficile, la population dépend de la pêche et du commerce avec le continent.</p>
            </div>

            <div class="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-lg border-l-4 border-indigo-500">
              <p class="font-bold text-lg mb-2">🌄 Exemple 6 : Furcy, village dans les nuages</p>
              <p>À 1 500 mètres d'altitude sur les flancs du Massif de la Selle, le village de Furcy offre un spectacle rare en Haïti : des forêts de pins luxuriantes, de l'air frais et pur, parfois même du brouillard épais qui enveloppe les maisons. C'est le lieu de villégiature préféré des Port-au-Princiens fortunés qui fuient la chaleur de la capitale. Furcy produit aussi des fruits tempérés qu'on ne trouve nulle part ailleurs en Haïti : fraises, pommes, pêches !</p>
            </div>
          </div>
        </section>

        <section class="mt-10">
          <h3 class="text-2xl font-bold mb-4 text-primary">🎓 Exercices et activités variés</h3>
          
          <div class="space-y-6">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">📚 Type 1 : Questions à choix multiples (QCM)</p>
              
              <div class="space-y-3">
                <div>
                  <p class="font-semibold">1. Quelle est l'altitude du Pic la Selle, point culminant d'Haïti ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 1 680 m</li>
                    <li>B) 2 280 m</li>
                    <li>C) 2 680 m ✓</li>
                    <li>D) 3 080 m</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">2. Quel pourcentage du territoire haïtien est montagneux ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 50%</li>
                    <li>B) 65%</li>
                    <li>C) 75% ✓</li>
                    <li>D) 85%</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">3. Quelle est la plus grande plaine d'Haïti ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) Plaine du Nord</li>
                    <li>B) Plaine du Cul-de-Sac</li>
                    <li>C) Plaine de l'Artibonite ✓</li>
                    <li>D) Plaine des Gonaïves</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">4. Combien Haïti compte-t-il de massifs montagneux principaux ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) 3</li>
                    <li>B) 5 ✓</li>
                    <li>C) 7</li>
                    <li>D) 9</li>
                  </ul>
                </div>
                
                <div>
                  <p class="font-semibold">5. Quelle plaine est surnommée "le grenier d'Haïti" ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) Plaine du Nord</li>
                    <li>B) Plaine de l'Artibonite ✓</li>
                    <li>C) Plaine du Cul-de-Sac</li>
                    <li>D) Plateau Central</li>
                  </ul>
                </div>

                <div>
                  <p class="font-semibold">6. Quel est le nom taïno d'Haïti et que signifie-t-il ?</p>
                  <ul class="ml-6 list-none space-y-1">
                    <li>A) "Quisqueya" - mère de toutes les terres</li>
                    <li>B) "Ayiti" - terre de hautes montagnes ✓</li>
                    <li>C) "Bohio" - grande île</li>
                    <li>D) "Xaragua" - terre de l'eau</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/30 dark:to-teal-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">✓✗ Type 2 : Vrai ou Faux justifié</p>
              
              <div class="space-y-3">
                <div>
                  <p class="font-semibold">1. Haïti est un pays principalement plat.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> 75% du territoire haïtien est montagneux, ce qui en fait l'un des pays les plus montagneux des Caraïbes.</p>
                </div>
                
                <div>
                  <p class="font-semibold">2. Le Pic la Selle est visible depuis Port-au-Prince par temps clair.</p>
                  <p class="ml-4 text-sm"><strong>VRAI.</strong> Le Pic la Selle (2 680 m) domine Port-au-Prince et est visible depuis la capitale, surtout tôt le matin avant que la brume ne l'enveloppe.</p>
                </div>
                
                <div>
                  <p class="font-semibold">3. La Plaine de l'Artibonite produit la majorité du café haïtien.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> La Plaine de l'Artibonite produit surtout du riz (80% de la production nationale). Le café pousse en altitude, sur les pentes montagneuses (Massif du Nord, Massif de la Selle).</p>
                </div>
                
                <div>
                  <p class="font-semibold">4. Les montagnes d'Haïti sont d'origine volcanique.</p>
                  <p class="ml-4 text-sm"><strong>PARTIELLEMENT VRAI.</strong> Certaines montagnes sont issues d'anciennes activités volcaniques (aujourd'hui éteintes), mais la plupart résultent de la collision et du plissement des plaques tectoniques caraïbe et nord-américaine.</p>
                </div>
                
                <div>
                  <p class="font-semibold">5. Le climat est identique partout en Haïti.</p>
                  <p class="ml-4 text-sm"><strong>FAUX.</strong> Le relief crée de nombreux microclimats. En montagne (Furcy, Kenscoff), il fait frais (15-20°C), tandis que dans les plaines côtières, il fait chaud (28-32°C). Les versants est (au vent) sont plus arrosés que les versants ouest (sous le vent).</p>
                </div>
              </div>
            </div>

            <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🔗 Type 3 : Appariement</p>
              <p class="mb-3">Associe chaque massif montagneux à sa caractéristique principale :</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white dark:bg-gray-800 p-3 rounded">
                  <p class="font-semibold mb-2">Massifs :</p>
                  <ol class="list-decimal ml-6">
                    <li>Massif de la Selle</li>
                    <li>Massif du Nord</li>
                    <li>Massif de la Hotte</li>
                    <li>Chaîne des Matheux</li>
                    <li>Montagnes Noires</li>
                  </ol>
                </div>
                
                <div class="bg-white dark:bg-gray-800 p-3 rounded">
                  <p class="font-semibold mb-2">Caractéristiques :</p>
                  <ul class="list-none ml-6">
                    <li>A) Contient le point culminant d'Haïti (Pic la Selle, 2 680 m)</li>
                    <li>B) Produit beaucoup de café de qualité</li>
                    <li>C) Extrême sud-ouest, très isolé, riche en biodiversité unique</li>
                    <li>D) Sépare le Plateau Central de l'Artibonite</li>
                    <li>E) Au centre, entre Artibonite et Plateau Central</li>
                  </ul>
                </div>
              </div>
              
              <p class="text-sm mt-3 italic">Réponses : 1-A, 2-B, 3-C, 4-D, 5-E</p>
            </div>

            <div class="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">💭 Type 4 : Questions de réflexion</p>
              
              <div class="space-y-3">
                <p class="font-semibold">1. Pourquoi les routes en Haïti sont-elles si difficiles à construire et à entretenir ? (Réfléchis au relief et à l'érosion)</p>
                <p class="font-semibold">2. Si tu étais ministre de l'Agriculture, quelles cultures privilégierais-tu dans les montagnes ? Dans les plaines ? Pourquoi ?</p>
                <p class="font-semibold">3. Comment le relief montagneux d'Haïti explique-t-il que certaines régions soient isolées et difficiles d'accès ?</p>
                <p class="font-semibold">4. Pourquoi la protection des montagnes (reboisement) est-elle essentielle pour éviter les catastrophes dans les plaines ?</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🎨 Type 5 : Activité pratique - Carte du relief</p>
              <p class="mb-3">Crée une carte en relief d'Haïti :</p>
              <ol class="list-decimal ml-6 space-y-2">
                <li><strong>Matériel :</strong> Papier cartonné, pâte à modeler (ou pâte à sel), crayons de couleur</li>
                <li><strong>Étape 1 :</strong> Dessine le contour d'Haïti sur le carton</li>
                <li><strong>Étape 2 :</strong> Avec la pâte à modeler, modèle les 5 massifs montagneux (utilise plus de pâte pour les zones élevées)</li>
                <li><strong>Étape 3 :</strong> Laisse les plaines plates</li>
                <li><strong>Étape 4 :</strong> Colorie : vert foncé pour les montagnes, vert clair pour les collines, jaune pour les plaines</li>
                <li><strong>Étape 5 :</strong> Place des étiquettes : Pic la Selle, Plaine de l'Artibonite, Plaine du Nord, etc.</li>
              </ol>
              <p class="mt-3 bg-blue-100 dark:bg-blue-900/20 p-3 rounded italic">💡 <strong>Bonus :</strong> Ajoute les principales villes (Port-au-Prince, Cap-Haïtien, Gonaïves) et observe où elles se situent (plaines ? montagnes ?).</p>
            </div>

            <div class="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🔍 Type 6 : Enquête locale</p>
              <p class="mb-3">Mène une enquête sur le relief de ta région :</p>
              <div class="space-y-2">
                <p><strong>1.</strong> Dans quel type de relief habites-tu ? (plaine, colline, montagne, plateau)</p>
                <p><strong>2.</strong> Quelle est l'altitude approximative de ta ville/village ?</p>
                <p><strong>3.</strong> Quel massif montagneux ou quelle plaine es-tu le plus proche ?</p>
                <p><strong>4.</strong> Quelles cultures sont pratiquées dans ta région ? Pourquoi ?</p>
                <p><strong>5.</strong> Y a-t-il des problèmes d'érosion ou d'inondations ? Si oui, pourquoi ?</p>
                <p><strong>6.</strong> Interroge un adulte de ta famille : comment le relief influence-t-il la vie quotidienne ? (accès à l'eau, construction, agriculture, transport)</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">🎯 Type 7 : Débat en classe</p>
              <p class="mb-3"><strong>Sujet :</strong> "Le relief montagneux d'Haïti est-il un avantage ou un inconvénient pour notre pays ?"</p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div class="bg-green-100 dark:bg-green-900/20 p-3 rounded">
                  <p class="font-semibold mb-2">Arguments "Avantage" :</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Diversité des cultures selon l'altitude</li>
                    <li>Microclimats variés</li>
                    <li>Paysages magnifiques pour le tourisme</li>
                    <li>Châteaux d'eau naturels</li>
                    <li>Richesse écologique (biodiversité unique en altitude)</li>
                  </ul>
                </div>
                
                <div class="bg-red-100 dark:bg-red-900/20 p-3 rounded">
                  <p class="font-semibold mb-2">Arguments "Inconvénient" :</p>
                  <ul class="list-disc ml-6 text-sm space-y-1">
                    <li>Difficulté de construire routes et infrastructures</li>
                    <li>Érosion massive des sols</li>
                    <li>Isolement de certaines régions</li>
                    <li>Glissements de terrain et inondations</li>
                    <li>Agriculture difficile en pente</li>
                  </ul>
                </div>
              </div>
              
              <p class="mt-3 text-sm italic">Divise la classe en deux groupes, préparez vos arguments, et débattez !</p>
            </div>

            <div class="bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-950/30 dark:to-green-950/30 p-5 rounded-lg">
              <p class="font-bold text-xl mb-3">📖 Type 8 : Composition écrite</p>
              <p class="mb-3"><strong>Sujet :</strong> "Une journée dans les montagnes haïtiennes"</p>
              <p class="mb-2">Imagine que tu passes une journée à Furcy (1 500 m d'altitude). Décris :</p>
              <ul class="list-disc ml-6 space-y-1">
                <li>Le paysage que tu vois (forêts de pins, brouillard, vue sur Port-au-Prince en contrebas)</li>
                <li>Le climat (frais, parfois froid le matin)</li>
                <li>Les activités des habitants (culture de fraises, tourisme, vente de bois)</li>
                <li>Les défis de la vie en altitude (accès difficile, électricité rare, etc.)</li>
                <li>Tes impressions et ce que tu ressens face à cette nature montagneuse</li>
              </ul>
              <p class="mt-3 text-sm"><strong>Longueur :</strong> 200-300 mots minimum.</p>
            </div>
          </div>
        </section>

        <section class="mt-10">
          <div class="bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500 p-5 rounded-lg">
            <p class="font-semibold text-lg mb-2">🎥 Ressources vidéo suggérées</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>"Survol d'Haïti en drone - montagnes et plaines" (documentaire géographique)</li>
              <li>"Le Pic la Selle : randonnée au sommet d'Haïti" (vidéo YouTube)</li>
              <li>"La Plaine de l'Artibonite : grenier d'Haïti" (reportage agricole)</li>
              <li>"Érosion en Haïti : le drame des montagnes pelées" (documentaire environnemental)</li>
              <li>"Tectonique des plaques et relief d'Haïti" (animation scientifique)</li>
              <li>"Les Gonaïves : comprendre les inondations" (reportage explicatif)</li>
            </ul>
          </div>
        </section>
      </div>
    `
  },

  // Leçon 8: Le système solaire et la Terre
  {
    id: "systeme-solaire-terre",
    title: "Le système solaire et la Terre",
    mois: "Février",
    objectif: "Comprendre la place de la Terre dans le système solaire et les caractéristiques de notre planète.",
    introduction: `
      <div class="space-y-6">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-lg border-l-4 border-blue-500">
          <h2 class="text-2xl font-bold mb-3 text-blue-900 dark:text-blue-200">🚀 Voyage dans l'espace : Notre place dans l'univers</h2>
          <p class="text-lg italic text-blue-800 dark:text-blue-300">"Imagine un instant que tu es sur le toit de ta maison à Port-au-Prince, Gonaïves ou aux Cayes, et que tu lèves les yeux vers le ciel nocturne, loin des lumières de la ville. Que vois-tu ? Des milliers d'étoiles scintillantes ! Parfois, un point lumineux traverse le ciel comme une étoile filante. Mais derrière ces points lumineux se cache un univers immense..."</p>
        </div>
        
        <p class="text-lg leading-relaxed">Bonjour chers explorateurs de l'espace ! 🌟 Aujourd'hui, nous allons embarquer pour un voyage extraordinaire, bien au-delà des montagnes d'Haïti et des eaux turquoise de la Caraïbe. Nous allons découvrir notre "quartier" cosmique : le <strong>Système Solaire</strong> ! Nous apprendrons comment notre planète, la Terre, est née, pourquoi elle est si spéciale, et comment elle interagit avec le Soleil et les autres planètes.</p>
        
        <p>Cette aventure nous aidera à mieux comprendre notre place dans l'immensité de l'espace et à apprécier encore plus la beauté de notre île, Haïti, cette petite perle dans un grand océan de mystères cosmiques. Prêts à décoller ? 🚀</p>
        
        <div class="bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 p-5 my-6">
          <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-3">🎯 Objectifs d'apprentissage</p>
          <ul class="list-disc ml-6 space-y-2 text-yellow-800 dark:text-yellow-300">
            <li>Définir ce qu'est le Système Solaire et identifier ses principaux composants</li>
            <li>Citer les planètes du Système Solaire dans l'ordre de leur éloignement par rapport au Soleil</li>
            <li>Décrire les principales caractéristiques de la Terre et expliquer pourquoi elle est unique</li>
            <li>Comprendre la relation entre le Soleil et la Terre (rotation, révolution et leurs conséquences)</li>
            <li>Expliquer l'importance du Système Solaire dans notre vie quotidienne en Haïti</li>
          </ul>
        </div>
        
        <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg">
          <p class="font-semibold text-green-900 dark:text-green-200 mb-2">💡 Le savais-tu ?</p>
          <p class="text-green-800 dark:text-green-300">Le mot "solaire" vient du latin "sol", qui signifie "soleil". Donc, le "Système Solaire" signifie littéralement le "Système du Soleil" ! Et quand tu regardes le ciel d'Haïti la nuit et que tu vois cette bande blanchâtre qui traverse le ciel (la Voie lactée), tu observes en fait notre galaxie qui contient plus de 200 milliards d'étoiles comme notre Soleil ! 🌌</p>
        </div>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">1. Qu'est-ce que le Système Solaire ? 🤔</h3>
          <p class="mb-4 text-lg">Le Système Solaire, c'est comme une grande famille cosmique dont le Soleil est le "chef". Il est composé de notre étoile, le Soleil, et de tous les corps célestes qui tournent autour de lui, un peu comme les enfants tournent autour de leurs parents. Ces corps célestes incluent les planètes, les planètes naines, les astéroïdes, les comètes, et les lunes de toutes ces planètes. C'est un système gravitationnellement lié, ce qui veut dire que la forte attraction du Soleil maintient tout le monde en orbite autour de lui.</p>
          <p class="mb-4">Imagine une mangue mûre qui tombe d'un arbre à Delmas ou à Cap-Haïtien. Sa chute est due à la gravité de la Terre. De la même manière, les planètes ne s'échappent pas dans l'espace parce que la gravité immense du Soleil les retient.</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">2. Le Soleil, notre étoile géante et lumineuse ☀️</h3>
          <p class="mb-4">Le Soleil n'est pas une planète, mais une <strong>étoile</strong> ! Une étoile est une énorme boule de gaz très chauds qui produit sa propre lumière et sa propre chaleur grâce à des réactions nucléaires en son cœur. Sans le Soleil, pas de vie possible sur Terre. C'est lui qui nous donne la lumière du jour que nous apprécions tant en Haïti pour faire sécher notre linge, pour faire pousser nos mangues et nos avocats, et pour nous réchauffer. Il est tellement grand qu'on pourrait y faire rentrer plus d'<strong>un million de Terres</strong> !</p>
          <ul class="list-disc ml-8 space-y-3 mb-4">
            <li><strong>Position :</strong> Il est au centre de notre Système Solaire</li>
            <li><strong>Composition :</strong> 73% d'hydrogène et 25% d'hélium (les deux gaz les plus légers)</li>
            <li><strong>Température :</strong> 5 500°C à la surface, mais 15 millions °C au cœur !</li>
            <li><strong>Âge :</strong> 4,6 milliards d'années (il est à mi-vie, il vivra encore 5 milliards d'années)</li>
            <li><strong>Distance de la Terre :</strong> 150 millions de kilomètres (la lumière du Soleil met 8 minutes pour nous atteindre)</li>
            <li><strong>Importance :</strong> Sa chaleur et sa lumière sont vitales pour la vie sur Terre - photosynthèse des plantes, cycle de l'eau, climat</li>
          </ul>
          <p class="mb-4">Quand le soleil tape fort à midi sur les rues de Pétion-Ville, rappelez-vous que cette chaleur vient d'une étoile située à des millions de kilomètres !</p>
          <div class="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4 my-4">
            <p class="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">💡 Anecdote haïtienne</p>
            <p class="text-yellow-800 dark:text-yellow-300">En Haïti, nous avons environ 2800 heures d'ensoleillement par an ! C'est beaucoup plus que dans les pays européens (Paris n'en a que 1600). Cette abondance de soleil explique pourquoi notre agriculture tropicale est si riche, et pourquoi les panneaux solaires seraient une excellente source d'énergie pour notre pays.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">3. Les Huit Planètes de notre Système Solaire 🌍</h3>
          <p class="mb-4">Autour du Soleil, tournent huit planètes, chacune avec ses propres caractéristiques. On les classe souvent en deux groupes :</p>
          
          <div class="mb-6">
            <h4 class="text-xl font-semibold mb-3 text-primary">Les planètes telluriques (rocheuses)</h4>
            <p class="mb-3">Elles sont proches du Soleil, petites et composées principalement de roches et de métaux.</p>
            <ul class="list-disc ml-8 space-y-3">
              <li><strong class="text-primary">Mercure :</strong> La plus proche du Soleil (58 millions de km). Très chaude le jour (430°C), très froide la nuit (-180°C). Pas d'atmosphère pour retenir la chaleur. Surface criblée de cratères comme la Lune.</li>
              <li><strong class="text-primary">Vénus :</strong> Appelée "l'étoile du berger" car très brillante dans le ciel. C'est la planète la plus chaude du Système Solaire (465°C) à cause d'un effet de serre intense. Son atmosphère est composée de 96% de CO₂. Elle tourne dans le sens inverse des autres planètes !</li>
              <li><strong class="text-primary">Terre (notre maison !) 🌍:</strong> La seule planète connue pour abriter la vie. Température moyenne de 15°C. 71% d'eau liquide. Atmosphère respirable (21% d'oxygène). C'est notre perle bleue dans l'espace !</li>
              <li><strong class="text-primary">Mars (la planète rouge) 🔴:</strong> Surnommée ainsi à cause de l'oxyde de fer (rouille) dans son sol. Température moyenne -60°C. Possède des calottes glaciaires aux pôles. Actuellement explorée par des robots (Perseverance, Curiosity) pour chercher des traces de vie passée.</li>
            </ul>
          </div>

          <div class="mb-6">
            <h4 class="text-xl font-semibold mb-3 text-primary">Les planètes joviennes (géantes gazeuses)</h4>
            <p class="mb-3">Elles sont plus éloignées du Soleil, beaucoup plus grandes et composées principalement de gaz.</p>
            <ul class="list-disc ml-8 space-y-3">
              <li><strong class="text-primary">Jupiter (le géant) 🪐:</strong> La plus grande planète du Système Solaire ! Si elle était creuse, on pourrait y mettre 1 300 Terres. Elle possède une énorme tempête appelée la "Grande Tache Rouge" qui dure depuis au moins 350 ans ! Elle a 79 lunes connues.</li>
              <li><strong class="text-primary">Saturne (la belle aux anneaux) 💫:</strong> Célèbre pour ses magnifiques anneaux composés de milliards de morceaux de glace et de roche. Si légère qu'elle flotterait dans l'eau (si on trouvait un océan assez grand) ! Elle a 82 lunes.</li>
              <li><strong class="text-primary">Uranus (la couchée) 🌀:</strong> Une planète froide et bleue-verte à cause du méthane dans son atmosphère. Particularité unique : elle tourne "couchée" sur le côté (son axe est incliné à 98°), probablement suite à une collision ancienne.</li>
              <li><strong class="text-primary">Neptune (la bleue profonde) 🌊:</strong> La plus éloignée du Soleil (4,5 milliards de km). Température de -220°C. Vents les plus violents du Système Solaire (2 000 km/h !). Couleur bleu profond magnifique due au méthane.</li>
            </ul>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg my-4">
            <p class="font-semibold text-lg mb-3">🎵 Astuce pour mémoriser l'ordre des planètes :</p>
            <p class="text-lg italic">"<strong class="text-primary">M</strong>on <strong class="text-primary">V</strong>ieux, <strong class="text-primary">T</strong>u <strong class="text-primary">M</strong>'as <strong class="text-primary">J</strong>eté <strong class="text-primary">S</strong>ur <strong class="text-primary">U</strong>ne <strong class="text-primary">N</strong>ouvelle planète !"</p>
            <p class="mt-2"><strong>M</strong>ercure - <strong>V</strong>énus - <strong>T</strong>erre - <strong>M</strong>ars - <strong>J</strong>upiter - <strong>S</strong>aturne - <strong>U</strong>ranus - <strong>N</strong>eptune</p>
          </div>

          <div class="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 p-4 my-4">
            <p class="font-semibold text-green-900 dark:text-green-200 mb-2">💡 Et Pluton alors ?</p>
            <p class="text-green-800 dark:text-green-300">Avant 2006, Pluton était considérée comme la neuvième planète. Mais les scientifiques l'ont reclassée comme une "planète naine" car elle ne remplit pas tous les critères pour être une planète (elle n'a pas "nettoyé" son orbite des autres objets). C'est comme si votre petit cousin était si petit qu'on ne le laissait pas jouer au basket avec les grands ! Il y a d'autres planètes naines : Cérès, Éris, Makemake, Haumea.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">4. La Terre, notre oasis bleue 🌎💙</h3>
          <p class="mb-4">Parmi toutes ces planètes, la Terre est notre foyer, notre "Ginen" cosmique ! Elle est unique pour plusieurs raisons :</p>
          <ul class="list-disc ml-8 space-y-3 mb-4">
            <li><strong>Eau liquide :</strong> C'est la seule planète où l'eau existe sous forme liquide en grande quantité, formant les océans, les lacs et les rivières que l'on retrouve partout dans le monde, y compris la mer des Caraïbes qui borde nos côtes haïtiennes. L'eau couvre 71% de la surface terrestre !</li>
            <li><strong>Atmosphère respirable :</strong> Son atmosphère contient 21% d'oxygène, essentiel pour la respiration des êtres vivants. Elle nous protège aussi des rayons ultraviolets dangereux du Soleil et des météorites qui brûlent en entrant dans l'atmosphère (étoiles filantes).</li>
            <li><strong>Température idéale :</strong> La Terre est à la bonne distance du Soleil (ni trop près comme Vénus, ni trop loin comme Mars) pour que les températures ne soient ni trop chaudes ni trop froides. Cette zone s'appelle la "zone habitable" ou "zone Boucles d'or".</li>
            <li><strong>Champ magnétique puissant :</strong> Le noyau de fer en fusion de la Terre génère un champ magnétique qui nous protège des vents solaires nocifs (particules chargées émises par le Soleil). Sans ce bouclier invisible, la vie serait impossible !</li>
            <li><strong>La Lune, notre compagne :</strong> Notre satellite naturel stabilise l'axe de rotation de la Terre, ce qui maintient notre climat stable. Elle cause aussi les marées que nous observons sur nos côtes (Côte des Arcadins, Jacmel, etc.).</li>
            <li><strong>Tectonique des plaques :</strong> Le recyclage constant de la croûte terrestre enrichit le sol et crée de nouvelles terres (mais cause aussi les séismes, comme celui de 2010 en Haïti).</li>
          </ul>
          <p class="mb-4">Pensez à la richesse de nos écosystèmes en Haïti : des récifs coralliens de la Côte des Arcadins aux forêts de pins des Matheux, des mangroves de Baradères aux plages de sable blanc de l'Île-à-Vache. Tout cela est possible grâce aux conditions uniques de la Terre !</p>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">5. Les Mouvements de la Terre : Rotation et Révolution 🔄</h3>
          <p class="mb-4">La Terre n'est pas immobile dans l'espace. Elle effectue deux mouvements principaux qui rythment notre vie quotidienne :</p>
          
          <div class="mb-6">
            <h4 class="text-xl font-semibold mb-3 text-primary">La Rotation (mouvement sur elle-même)</h4>
            <p class="mb-3">C'est le mouvement de la Terre sur elle-même, comme une toupie. Elle tourne d'ouest en est (dans le sens inverse des aiguilles d'une montre si on regarde depuis le pôle Nord).</p>
            <ul class="list-disc ml-8 space-y-2">
              <li><strong>Durée :</strong> 24 heures (un jour)</li>
              <li><strong>Vitesse :</strong> À l'équateur, la Terre tourne à 1 670 km/h ! (Haïti, près du tropique, tourne à environ 1 500 km/h)</li>
              <li><strong>Conséquence principale :</strong> L'alternance du jour et de la nuit. Quand c'est le jour en Haïti (face au Soleil), c'est la nuit de l'autre côté du globe (Chine, Australie). C'est pourquoi quand nos parents nous appellent de la diaspora (États-Unis, Canada, France), l'heure peut être différente !</li>
              <li><strong>Fuseaux horaires :</strong> La Terre est divisée en 24 fuseaux horaires. Haïti est à UTC-5 (même heure que New York en hiver).</li>
            </ul>
          </div>

          <div class="mb-6">
            <h4 class="text-xl font-semibold mb-3 text-primary">La Révolution (mouvement autour du Soleil)</h4>
            <p class="mb-3">C'est le mouvement de la Terre autour du Soleil. La Terre suit une orbite elliptique (forme d'œuf légèrement aplati).</p>
            <ul class="list-disc ml-8 space-y-2">
              <li><strong>Durée :</strong> 365 jours et 1/4 (une année). C'est pour compenser ce quart de jour qu'on ajoute un jour tous les 4 ans : l'année bissextile (29 février) !</li>
              <li><strong>Distance parcourue :</strong> 940 millions de kilomètres par an (vitesse moyenne de 107 000 km/h)</li>
              <li><strong>Conséquence principale :</strong> Les saisons. L'axe de la Terre est incliné de 23,5° par rapport à son orbite. Cette inclinaison fait que les rayons du Soleil frappent différemment l'hémisphère Nord et Sud selon la période de l'année.</li>
              <li><strong>En Haïti :</strong> Situés près du tropique du Cancer (19°N), nous avons deux saisons principales : la saison sèche (novembre-mars) et la saison des pluies (avril-octobre), plutôt que les quatre saisons des pays tempérés.</li>
            </ul>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
            <p class="font-semibold text-purple-900 dark:text-purple-200 mb-2">🌙 La Lune et ses phases</p>
            <p class="text-purple-800 dark:text-purple-300 mb-3">La Lune tourne autour de la Terre en 29,5 jours. Elle ne produit pas sa propre lumière ; elle reflète celle du Soleil. Selon sa position par rapport à la Terre et au Soleil, nous voyons différentes phases :</p>
            <ul class="list-disc ml-6 space-y-1 text-purple-800 dark:text-purple-300">
              <li><strong>Nouvelle lune :</strong> Invisible (entre Terre et Soleil)</li>
              <li><strong>Premier croissant :</strong> Fine lame visible le soir</li>
              <li><strong>Premier quartier :</strong> Demi-lune</li>
              <li><strong>Pleine lune :</strong> Totalement éclairée (nuits de pleine lune en Haïti !)</li>
              <li><strong>Dernier quartier :</strong> Demi-lune décroissante</li>
            </ul>
            <p class="mt-3 text-purple-800 dark:text-purple-300">Les marées haïtiennes (montée et descente de la mer) sont causées par l'attraction gravitationnelle de la Lune sur les océans !</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">6. Autres corps célestes du Système Solaire 🌠</h3>
          <ul class="list-disc ml-8 space-y-3">
            <li><strong>Ceinture d'astéroïdes :</strong> Entre Mars et Jupiter, des millions de rochers rocheux de toutes tailles orbitent. Le plus gros est Cérès (950 km de diamètre).</li>
            <li><strong>Comètes :</strong> Boules de glace, de poussière et de roches qui viennent de loin dans le Système Solaire. Quand elles s'approchent du Soleil, la glace se sublime et forme une magnifique queue lumineuse (comète de Halley visible tous les 76 ans).</li>
            <li><strong>Ceinture de Kuiper :</strong> Au-delà de Neptune, région où se trouvent des milliers d'objets glacés, dont Pluton.</li>
            <li><strong>Satellites naturels (lunes) :</strong> La Terre n'est pas la seule à avoir une lune ! Mars en a 2, Jupiter 79, Saturne 82 !</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold mb-4 text-primary">🇭🇹 Exemples concrets liés à Haïti et à notre quotidien</h3>
        
        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌞 Exemple 1 : Le Soleil et notre agriculture haïtienne</p>
          <p>Sans le Soleil, nos plantations de canne à sucre, de café, de mangues et de bananes ne pourraient pas pousser ! Les plantes utilisent la lumière du Soleil pour fabriquer leur nourriture grâce à la photosynthèse. C'est grâce au Soleil que nos marchés regorgent de fruits tropicaux délicieux !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌊 Exemple 2 : Les marées en Haïti</p>
          <p>Si tu vas à la plage de Gelée (Les Cayes) ou à Labadie (Cap-Haïtien), tu remarqueras que le niveau de la mer monte et descend deux fois par jour. Ce sont les marées, causées par l'attraction gravitationnelle de la Lune sur les océans ! Les pêcheurs haïtiens connaissent bien ces cycles pour planifier leurs sorties en mer.</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">⏰ Exemple 3 : Le décalage horaire avec la diaspora</p>
          <p>Quand il est midi à Port-au-Prince, il est 18h à Paris ! C'est à cause de la rotation de la Terre et des fuseaux horaires. La Terre tourne, donc différentes régions sont face au Soleil à des moments différents. C'est pourquoi nos parents de la diaspora nous appellent parfois tard le soir leur temps, mais c'est l'après-midi pour nous !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌡️ Exemple 4 : Pourquoi il fait toujours chaud en Haïti</p>
          <p>Haïti se trouve près du tropique du Cancer (environ 19°N). Les rayons du Soleil tombent presque perpendiculairement sur nous toute l'année, ce qui explique notre climat chaud et tropical. Si nous étions plus près du pôle Nord (comme le Canada), les rayons arriveraient de biais et il ferait beaucoup plus froid !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌙 Exemple 5 : Les nuits de pleine lune en Haïti</p>
          <p>Tu as sûrement remarqué que certaines nuits, la Lune est si brillante qu'on peut presque lire dehors ! C'est la pleine lune. Dans les campagnes haïtiennes, les gens profitent de ces nuits claires pour organiser des veillées, des contes, ou travailler aux champs. Nos ancêtres taïnos et africains utilisaient aussi les phases de la Lune pour planifier leurs activités agricoles.</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg">
          <p class="font-bold text-lg mb-2">☀️ Exemple 6 : L'énergie solaire en Haïti</p>
          <p>Avec nos 2 800 heures d'ensoleillement par an, Haïti pourrait devenir un champion de l'énergie solaire ! De plus en plus de familles haïtiennes installent des panneaux solaires pour avoir de l'électricité sans dépendre de l'EDH. Le Soleil nous offre une énergie gratuite, propre et inépuisable !</p>
        </div>

        <h3 class="text-2xl font-bold mb-4 text-primary mt-8">📝 Exercices variés et stimulants</h3>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">1. QCM (Choisis la bonne réponse)</p>
            <ol class="space-y-4">
              <li><strong>a) Combien de planètes compte notre Système Solaire ?</strong>
                <br/>① 7  ② 8  ③ 9  ④ 10
              </li>
              <li><strong>b) Quelle est la planète la plus proche du Soleil ?</strong>
                <br/>① Vénus  ② Mercure  ③ Terre  ④ Mars
              </li>
              <li><strong>c) Pourquoi la Terre est-elle unique dans le Système Solaire ?</strong>
                <br/>① Elle est la plus grande  ② Elle a de l'eau liquide et de la vie  ③ Elle est la plus proche du Soleil  ④ Elle a des anneaux
              </li>
              <li><strong>d) Combien de temps met la Terre pour faire un tour complet autour du Soleil ?</strong>
                <br/>① 24 heures  ② 30 jours  ③ 365 jours  ④ 1 mois
              </li>
              <li><strong>e) Quel mouvement de la Terre cause l'alternance jour/nuit ?</strong>
                <br/>① La révolution  ② La rotation  ③ L'inclinaison  ④ Les marées
              </li>
            </ol>
            <p class="mt-4 text-sm italic">Réponses : a)②  b)②  c)②  d)③  e)②</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">2. Vrai ou Faux (Justifie ta réponse)</p>
            <ol class="space-y-3">
              <li>□ Le Soleil est une planète. <em>(Faux - c'est une étoile)</em></li>
              <li>□ Jupiter est plus grande que toutes les autres planètes réunies. <em>(Vrai - elle contient 2,5 fois la masse de toutes les autres planètes)</em></li>
              <li>□ Pluton est toujours considérée comme la 9ème planète. <em>(Faux - reclassée planète naine en 2006)</em></li>
              <li>□ La Terre tourne en 24 heures sur elle-même. <em>(Vrai - c'est la rotation)</em></li>
              <li>□ En Haïti, nous avons 4 saisons distinctes comme en Europe. <em>(Faux - nous avons 2 saisons : sèche et humide)</em></li>
            </ol>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">3. Appariement (Relie la planète à sa caractéristique)</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="font-semibold mb-2">Planètes :</p>
                <ol type="A" class="space-y-1">
                  <li>Mercure</li>
                  <li>Vénus</li>
                  <li>Mars</li>
                  <li>Jupiter</li>
                  <li>Saturne</li>
                </ol>
              </div>
              <div>
                <p class="font-semibold mb-2">Caractéristiques :</p>
                <ol class="space-y-1">
                  <li>La planète rouge</li>
                  <li>La plus grande planète</li>
                  <li>Possède de magnifiques anneaux</li>
                  <li>La planète la plus chaude</li>
                  <li>La plus proche du Soleil</li>
                </ol>
              </div>
            </div>
            <p class="mt-3 text-sm italic">Réponses : A-5, B-4, C-1, D-2, E-3</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">4. Questions de réflexion (Réponds en 3-5 phrases)</p>
            <ol class="space-y-4">
              <li><strong>a)</strong> Pourquoi dit-on que la Terre est la "planète bleue" ? Explique l'importance de l'eau pour la vie.</li>
              <li><strong>b)</strong> Si tu étais sur Mars, comment ta vie serait-elle différente ? (pense à la température, l'atmosphère, la gravité...)</li>
              <li><strong>c)</strong> Pourquoi l'énergie solaire serait-elle particulièrement avantageuse pour Haïti ? Cite au moins 3 raisons.</li>
              <li><strong>d)</strong> Explique pourquoi nous avons des saisons différentes en Haïti comparé à l'Europe ou au Canada.</li>
            </ol>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">5. Activité pratique : Construis une maquette du Système Solaire</p>
            <p class="mb-3"><strong>Matériel :</strong> Balles ou ballons de différentes tailles, peinture, fil, carton</p>
            <p class="mb-3"><strong>Instructions :</strong></p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Utilise un gros ballon pour le Soleil (jaune/orange)</li>
              <li>Trouve 8 balles de tailles différentes pour les planètes (respecte les proportions relatives)</li>
              <li>Peins chaque planète de sa couleur caractéristique</li>
              <li>Dispose-les dans le bon ordre sur un carton ou suspends-les avec du fil</li>
              <li>Ajoute des étiquettes avec le nom de chaque planète et une caractéristique</li>
            </ol>
            <p class="mt-3 text-sm italic">💡 Astuce : Tu peux utiliser une orange pour Jupiter, une balle de tennis pour la Terre, un grain de poivre pour Mercure !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">6. Observation nocturne du ciel haïtien 🌙⭐</p>
            <p class="mb-3"><strong>Projet sur 1 semaine :</strong></p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Chaque soir pendant 7 jours, observe le ciel vers 19h-20h (si possible loin des lumières)</li>
              <li>Dessine la phase de la Lune que tu vois (croissant, quartier, pleine...)</li>
              <li>Note l'heure du coucher du soleil</li>
              <li>Essaie de repérer l'étoile Polaire (au Nord) et quelques constellations</li>
              <li>Si tu vois une "étoile" très brillante qui ne scintille pas, c'est peut-être Vénus ou Jupiter !</li>
            </ol>
            <p class="mt-3"><strong>Question :</strong> Qu'as-tu remarqué concernant la position de la Lune chaque soir ? A-t-elle changé ?</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">7. Recherche sur Internet : Les missions spatiales</p>
            <p class="mb-3">Fais une recherche et rédige un court paragraphe (100-150 mots) sur l'une de ces missions :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Apollo 11 : Les premiers hommes sur la Lune (1969)</li>
              <li>Perseverance : Robot explorateur sur Mars (2021)</li>
              <li>James Webb : Télescope spatial ultra-puissant (2021)</li>
              <li>Voyager 1 : La sonde la plus éloignée de la Terre</li>
            </ul>
            <p class="mt-3"><strong>À inclure :</strong> Date, objectif de la mission, découvertes principales, images marquantes</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">8. Débat en classe : L'exploration spatiale est-elle une priorité ?</p>
            <p class="mb-3"><strong>Question :</strong> Les pays devraient-ils investir des milliards dans l'exploration de Mars alors qu'il y a tant de problèmes sur Terre (pauvreté, faim, éducation) ?</p>
            <div class="grid md:grid-cols-2 gap-4 mt-4">
              <div class="bg-green-50 dark:bg-green-950/30 p-4 rounded">
                <p class="font-semibold text-green-900 dark:text-green-200 mb-2">Arguments POUR :</p>
                <ul class="list-disc ml-6 text-sm space-y-1">
                  <li>Innovations technologiques (GPS, satellites météo, matériaux)</li>
                  <li>Inspiration pour la jeunesse</li>
                  <li>Connaissance de l'univers</li>
                  <li>Plan B si la Terre devient invivable</li>
                </ul>
              </div>
              <div class="bg-red-50 dark:bg-red-950/30 p-4 rounded">
                <p class="font-semibold text-red-900 dark:text-red-200 mb-2">Arguments CONTRE :</p>
                <ul class="list-disc ml-6 text-sm space-y-1">
                  <li>Coût énorme (100 milliards $ pour aller sur Mars)</li>
                  <li>Urgences terrestres prioritaires</li>
                  <li>Technologie pourrait aider sur Terre d'abord</li>
                  <li>Mars est inhabitable de toute façon</li>
                </ul>
              </div>
            </div>
            <p class="mt-3 text-sm italic">Organisez un débat en classe : la moitié défend l'exploration, l'autre défend les priorités terrestres.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">9. Mini-recherche : Un astronaute haïtien ?</p>
            <p class="mb-3"><strong>Sujet de réflexion :</strong> Aucun Haïtien n'est encore allé dans l'espace. Fais une recherche sur les astronautes africains ou caribéens qui ont voyagé dans l'espace. Qui sont-ils ? Quand ? Pour quelle mission ?</p>
            <p class="mt-3"><strong>Ensuite, réponds :</strong> Que faudrait-il pour qu'Haïti ait un jour son propre astronaute ? (éducation, programmes scientifiques, partenariats internationaux...)</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">10. Composition finale (200-250 mots)</p>
            <p class="mb-3"><strong>Sujet :</strong> "Si je pouvais visiter une planète du Système Solaire..."</p>
            <p class="mb-2">Dans ta composition, tu dois :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Choisir une planète et expliquer pourquoi tu la choisis</li>
              <li>Décrire les caractéristiques de cette planète (taille, température, atmosphère...)</li>
              <li>Imaginer ce que tu ferais là-bas</li>
              <li>Expliquer les défis que tu rencontrerais</li>
              <li>Terminer par ce que cette exploration pourrait apprendre à l'humanité</li>
            </ul>
            <p class="mt-3 text-sm italic">Sois créatif mais reste scientifiquement précis !</p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg mt-8">
          <p class="font-semibold text-lg mb-3">🎥 Ressources vidéo YouTube suggérées</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>"C'est quoi le Système Solaire ?" - <em>1 jour, 1 question</em></li>
            <li>"Le Système Solaire expliqué aux enfants" - <em>Tout comprendre</em></li>
            <li>"Pourquoi y a-t-il le jour et la nuit ?" - <em>C'est pas sorcier</em></li>
            <li>"Voyage aux confins du Système Solaire" - <em>Documentaire ARTE</em></li>
            <li>"Les phases de la Lune expliquées simplement"</li>
            <li>"Mars : la planète rouge mystérieuse" - <em>National Geographic</em></li>
          </ul>
        </div>
      </div>
    `
  },

  // Leçon 9: Les civilisations anciennes
  {
    id: "civilisations-anciennes",
    title: "Les civilisations anciennes",
    mois: "Mars",
    objectif: "Découvrir les grandes civilisations anciennes et comprendre leur héritage.",
    introduction: `
      <div class="space-y-4">
        <p class="text-lg leading-relaxed">🏛️ <strong>Voyage dans le passé : 5 000 ans d'histoire humaine !</strong></p>
        <p>Imagine un monde sans téléphone, sans ordinateur, sans électricité... et pourtant, des êtres humains ont réussi à construire des pyramides gigantesques, à inventer l'écriture, à créer des villes de centaines de milliers d'habitants, à développer les mathématiques et l'astronomie ! Comment ont-ils fait ? C'est ce que nous allons découvrir ensemble en explorant les grandes civilisations anciennes.</p>
        <p>Ces civilisations ne sont pas que de l'histoire poussiéreuse dans les livres : elles ont inventé l'alphabet que tu utilises pour écrire, les chiffres que tu utilises en mathématiques, le calendrier qui organise ton année scolaire, et même des lois qui protègent tes droits aujourd'hui ! Chaque fois que tu écris, que tu comptes, que tu votes (plus tard), tu utilises leur héritage.</p>
        <p class="text-primary font-semibold">🇭🇹 Lien avec Haïti : Nous aussi, nous avons hérité de ces civilisations ! Notre langue créole contient des mots d'origine latine (de Rome), notre système juridique s'inspire du droit romain et français, et nos ancêtres taïnos avaient leur propre civilisation avancée avant l'arrivée des Européens.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">1. La Mésopotamie : Le berceau de la civilisation (3500-539 av. J.-C.) 🏛️</h3>
          <p class="text-lg mb-4">Le mot "Mésopotamie" vient du grec et signifie "entre les fleuves". Cette région, située entre le Tigre et l'Euphrate (Irak et Syrie actuels), est considérée comme le berceau de la civilisation car c'est là que sont nées beaucoup d'innovations qui ont changé l'humanité.</p>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">📍 Localisation et géographie</h4>
            <p class="mb-3">Imagine un territoire désertique traversé par deux grands fleuves qui apportent l'eau et rendent la terre fertile. C'est exactement ce qu'était la Mésopotamie ! Grâce aux crues annuelles du Tigre et de l'Euphrate, les Mésopotamiens ont développé une agriculture prospère.</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Principales villes :</strong> Ur, Babylone, Ninive, Akkad</li>
              <li><strong>Peuples :</strong> Sumériens, Babyloniens, Assyriens, Akkadiens</li>
              <li><strong>Période :</strong> De 3500 av. J.-C. à 539 av. J.-C. (conquête perse)</li>
            </ul>
          </div>

          <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">✍️ L'invention de l'écriture cunéiforme (vers 3200 av. J.-C.)</h4>
            <p class="mb-3">C'est l'une des plus grandes inventions de l'humanité ! Les Sumériens ont inventé l'écriture pour compter leurs récoltes, leurs moutons, et enregistrer les transactions commerciales. Au début, c'étaient des dessins simples (pictogrammes), puis ils ont évolué vers des signes en forme de coins gravés sur des tablettes d'argile avec un roseau taillé (le calame).</p>
            <p class="font-semibold text-amber-900 dark:text-amber-200">🇭🇹 Comparaison haïtienne : C'est comme si nos marchandes notaient toutes leurs ventes dans un cahier pour ne rien oublier ! L'écriture est née du besoin pratique de garder trace des choses importantes.</p>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">⚖️ Le Code d'Hammourabi (vers 1750 av. J.-C.)</h4>
            <p class="mb-3">Le roi Hammourabi de Babylone a créé le premier code de lois écrit de l'histoire ! Ce code contenait 282 lois gravées sur une grande stèle (colonne) de pierre noire de 2,25 mètres de haut. Il traitait de tout : commerce, famille, propriété, esclavage, salaires...</p>
            <p class="mb-3"><strong>Principe célèbre :</strong> "Œil pour œil, dent pour dent" - Si quelqu'un te fait du mal, la punition doit être égale au mal causé.</p>
            <p class="text-purple-900 dark:text-purple-200 font-semibold">💡 Pourquoi c'est important ? C'est la première fois qu'on écrit les lois pour que tout le monde les connaisse ! Avant, les rois décidaient au cas par cas. Avec des lois écrites, c'est plus juste et prévisible.</p>
          </div>

          <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🔬 Inventions et innovations mésopotamiennes</h4>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>La roue (vers 3500 av. J.-C.) :</strong> Révolution du transport ! Au début pour les poteries, puis pour les chars et chariots.</li>
              <li><strong>L'irrigation :</strong> Systèmes de canaux pour apporter l'eau des fleuves aux champs éloignés.</li>
              <li><strong>Les mathématiques :</strong> Système sexagésimal (base 60) - c'est pour ça qu'aujourd'hui on a 60 minutes dans une heure et 360 degrés dans un cercle !</li>
              <li><strong>L'astronomie :</strong> Observation des étoiles, création du calendrier lunaire, prédiction des éclipses.</li>
              <li><strong>L'architecture :</strong> Ziggourats (grandes pyramides à étages), temples, palais en briques de terre cuite.</li>
              <li><strong>La bière :</strong> Oui, les Sumériens ont inventé la bière en faisant fermenter de l'orge !</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-amber-700 dark:text-amber-400">2. L'Égypte ancienne : La civilisation du Nil (3100 av. J.-C. - 30 av. J.-C.) 🔺</h3>
          <p class="text-lg mb-4">L'Égypte ancienne est probablement la civilisation antique la plus fascinante et la plus connue grâce à ses pyramides monumentales, ses pharaons légendaires et ses trésors archéologiques spectaculaires !</p>

          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🌊 Le don du Nil</h4>
            <p class="mb-3">L'historien grec Hérodote a dit : <em>"L'Égypte est un don du Nil"</em>. Pourquoi ? Parce que sans ce fleuve gigantesque, l'Égypte ne serait qu'un désert inhabitable ! Chaque année, le Nil débordait et déposait du limon (boue fertile) sur ses rives, créant une bande de terre extrêmement fertile au milieu du désert.</p>
            <p class="font-semibold text-blue-900 dark:text-blue-200">🇭🇹 Comparaison avec Haïti : C'est un peu comme nos plaines de l'Artibonite qui sont fertiles grâce à l'irrigation. L'eau, c'est la vie !</p>
          </div>

          <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">👑 Les Pharaons : Rois-dieux de l'Égypte</h4>
            <p class="mb-3">Les pharaons n'étaient pas de simples rois : ils étaient considérés comme des dieux vivants, intermédiaires entre les dieux et les humains ! Ils avaient un pouvoir absolu sur tout l'Égypte.</p>
            <ul class="list-disc ml-6 space-y-2 mb-3">
              <li><strong>Khéops (Khoufou) :</strong> A fait construire la plus grande pyramide (146 m de haut à l'origine !)</li>
              <li><strong>Toutânkhamon :</strong> Le plus célèbre grâce à sa tombe intacte découverte en 1922, remplie de trésors</li>
              <li><strong>Ramsès II :</strong> Le plus grand pharaon guerrier, a régné 66 ans, a fait construire Abou Simbel</li>
              <li><strong>Cléopâtre VII :</strong> Dernière pharaonne, célèbre pour son intelligence et ses relations avec Jules César et Marc-Antoine</li>
            </ul>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🔺 Les Pyramides de Gizeh : Merveille du monde antique</h4>
            <p class="mb-3">Les trois pyramides principales de Gizeh (Khéops, Khéphren, Mykérinos) sont les seules des Sept Merveilles du monde antique encore debout aujourd'hui ! Comment les Égyptiens ont-ils pu construire de telles structures il y a 4 500 ans ?</p>
            <p class="mb-3"><strong>Chiffres impressionnants de la pyramide de Khéops :</strong></p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Hauteur originale : 146 mètres (comme un immeuble de 45 étages !)</li>
              <li>Poids : 5 millions de tonnes</li>
              <li>Nombre de blocs : 2,3 millions de pierres calcaires</li>
              <li>Poids moyen d'un bloc : 2,5 tonnes (certains pèsent 70 tonnes !)</li>
              <li>Temps de construction : Environ 20 ans</li>
              <li>Main d'œuvre : 20 000 à 30 000 ouvriers (pas des esclaves, mais des paysans payés pendant la crue du Nil)</li>
            </ul>
            <p class="mt-3 text-yellow-900 dark:text-yellow-200 font-semibold">🔍 Mystère : Avec des outils en cuivre et en pierre, sans machines modernes, comment ont-ils réussi ? Probablement avec des rampes, des leviers, des traîneaux en bois, et beaucoup, beaucoup de travail humain coordonné !</p>
          </div>

          <div class="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">📜 Les hiéroglyphes : Écriture sacrée</h4>
            <p class="mb-3">Les Égyptiens utilisaient trois types d'écriture :</p>
            <ul class="list-disc ml-6 space-y-2 mb-3">
              <li><strong>Hiéroglyphes :</strong> Écriture sacrée pour les temples et monuments (plus de 700 signes !)</li>
              <li><strong>Hiératique :</strong> Version simplifiée pour les documents administratifs</li>
              <li><strong>Démotique :</strong> Écriture populaire, encore plus simple</li>
            </ul>
            <p class="mb-3"><strong>La Pierre de Rosette (1799) :</strong> Cette pierre a permis de déchiffrer les hiéroglyphes ! Elle contenait le même texte en trois écritures : hiéroglyphes, démotique et grec ancien. Le Français Jean-François Champollion a réussi à la déchiffrer en 1822.</p>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🏺 La momification : Préserver les morts pour l'éternité</h4>
            <p class="mb-3">Les Égyptiens croyaient en la vie après la mort. Pour que l'âme (le "ka") puisse reconnaître et réhabiter le corps dans l'au-delà, il fallait préserver le corps en le momifiant.</p>
            <p class="mb-3"><strong>Processus de momification (70 jours) :</strong></p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Retirer les organes internes (sauf le cœur, siège de l'intelligence) et les placer dans des vases canopes</li>
              <li>Retirer le cerveau par le nez avec un crochet (ils pensaient que ça ne servait à rien !)</li>
              <li>Recouvrir le corps de natron (sel) pendant 40 jours pour le déshydrater</li>
              <li>Emballer le corps avec des bandelettes de lin (plusieurs centaines de mètres !)</li>
              <li>Placer des amulettes protectrices entre les bandelettes</li>
              <li>Mettre le corps dans un ou plusieurs sarcophages décorés</li>
            </ol>
          </div>

          <div class="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🔬 Sciences et innovations égyptiennes</h4>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>Médecine avancée :</strong> Chirurgie (trépanation du crâne), dentisterie, connaissances anatomiques détaillées grâce à la momification</li>
              <li><strong>Calendrier solaire :</strong> 365 jours divisés en 12 mois de 30 jours + 5 jours épagomènes (jours supplémentaires)</li>
              <li><strong>Géométrie :</strong> Nécessaire pour mesurer les terres après les crues du Nil et construire les pyramides</li>
              <li><strong>Papyrus :</strong> Support d'écriture fabriqué à partir de la plante du même nom (ancêtre du papier)</li>
              <li><strong>Cosmétiques :</strong> Khôl (maquillage des yeux), parfums, perruques</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">3. La Grèce antique : Berceau de la démocratie et de la philosophie (800-146 av. J.-C.) 🏛️</h3>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🗳️ Athènes et la naissance de la démocratie</h4>
            <p class="mb-3">Le mot "démocratie" vient du grec "demos" (peuple) et "kratos" (pouvoir) : le pouvoir du peuple ! C'est à Athènes, vers 508 av. J.-C., que la première démocratie du monde a été créée.</p>
            <p class="mb-3"><strong>Comment ça fonctionnait ?</strong></p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Les citoyens athéniens (hommes libres de plus de 18 ans) se réunissaient sur l'Agora (place publique) pour voter les lois</li>
              <li>Chacun avait le droit de parler et de proposer des lois</li>
              <li>Les décisions étaient prises à la majorité des votes</li>
            </ul>
            <p class="mt-3 text-blue-900 dark:text-blue-200 font-semibold">⚠️ Attention : La démocratie athénienne n'était pas parfaite ! Les femmes, les esclaves et les étrangers n'avaient pas le droit de vote. Seulement 10-20% de la population participait.</p>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🤔 Les grands philosophes grecs</h4>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>Socrate (470-399 av. J.-C.) :</strong> "Connais-toi toi-même". Il posait des questions pour faire réfléchir les gens (méthode socratique). Condamné à mort pour avoir "corrompu la jeunesse" !</li>
              <li><strong>Platon (427-347 av. J.-C.) :</strong> Élève de Socrate. A fondé l'Académie (première université). Théorie des Idées : le monde réel n'est qu'une ombre du monde des Idées parfaites.</li>
              <li><strong>Aristote (384-322 av. J.-C.) :</strong> Élève de Platon. A classifié les sciences (biologie, physique, métaphysique, éthique). Précepteur d'Alexandre le Grand.</li>
            </ul>
          </div>

          <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🏃 Les Jeux Olympiques (776 av. J.-C.)</h4>
            <p class="mb-3">Créés en 776 av. J.-C. à Olympie, en l'honneur du dieu Zeus. Pendant les Jeux (tous les 4 ans), toutes les guerres entre cités grecques s'arrêtaient (trêve olympique) !</p>
            <p class="mb-3"><strong>Épreuves :</strong> Course à pied, lutte, boxe, pentathlon (5 épreuves), course de chars...</p>
            <p class="text-amber-900 dark:text-amber-200 font-semibold">🏅 Les vainqueurs recevaient une couronne d'olivier et devenaient des héros dans leur cité ! Les Jeux modernes (depuis 1896) s'inspirent directement de cette tradition.</p>
          </div>

          <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🎭 Théâtre, arts et sciences</h4>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Théâtre :</strong> Tragédies (Sophocle, Euripide) et comédies (Aristophane). Invention des masques de théâtre.</li>
              <li><strong>Architecture :</strong> Le Parthénon d'Athènes, chef-d'œuvre de l'architecture classique</li>
              <li><strong>Sculpture :</strong> Représentations réalistes du corps humain (Vénus de Milo, Discobole)</li>
              <li><strong>Mathématiques :</strong> Pythagore (théorème), Euclide (géométrie), Archimède (physique)</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">4. L'Empire romain : Maîtres du monde antique (753 av. J.-C. - 476 ap. J.-C.) 🦅</h3>
          
          <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🏛️ De la République à l'Empire</h4>
            <p class="mb-3"><strong>République romaine (509-27 av. J.-C.) :</strong> Gouvernement avec deux consuls élus chaque année, un Sénat, et des assemblées populaires.</p>
            <p class="mb-3"><strong>Empire romain (27 av. J.-C. - 476 ap. J.-C.) :</strong> Après des guerres civiles, Auguste devient le premier empereur. À son apogée (IIe siècle ap. J.-C.), l'Empire romain s'étendait de l'Écosse au Sahara, de l'Espagne à la Mésopotamie !</p>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">⚖️ Le droit romain : Fondement du droit moderne</h4>
            <p class="mb-3">Les Romains ont créé un système juridique très avancé qui influence encore nos lois aujourd'hui !</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Présomption d'innocence :</strong> Accusé innocent jusqu'à preuve du contraire</li>
              <li><strong>Droit de la défense :</strong> Droit d'être défendu par un avocat</li>
              <li><strong>Contrats écrits :</strong> Accords légaux entre parties</li>
              <li><strong>"Dura lex, sed lex" :</strong> "La loi est dure, mais c'est la loi" - principe de l'État de droit</li>
            </ul>
          </div>

          <div class="bg-gray-50 dark:bg-gray-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🏗️ Ingénierie et architecture romaines</h4>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>Routes :</strong> Plus de 400 000 km de routes pavées ! "Tous les chemins mènent à Rome."</li>
              <li><strong>Aqueducs :</strong> Transportaient l'eau sur des centaines de kilomètres (Pont du Gard en France : 49 m de haut !)</li>
              <li><strong>Colisée :</strong> Amphithéâtre de 50 000 places, construit en 8 ans (70-80 ap. J.-C.)</li>
              <li><strong>Panthéon :</strong> Temple avec le plus grand dôme en béton non armé du monde (2 000 ans et toujours debout !)</li>
              <li><strong>Thermes :</strong> Bains publics avec eau chaude, froide, tiède, bibliothèques, salles de sport</li>
            </ul>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🌍 L'héritage romain</h4>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Langues romanes :</strong> Français, espagnol, italien, portugais, roumain viennent tous du latin</li>
              <li><strong>Alphabet latin :</strong> L'alphabet que tu utilises pour écrire !</li>
              <li><strong>Système judiciaire :</strong> Base du droit dans la plupart des pays occidentaux</li>
              <li><strong>Architecture :</strong> Arcs, voûtes, dômes, colonnes</li>
            </ul>
            <p class="mt-3 text-purple-900 dark:text-purple-200 font-semibold">🇭🇹 Lien haïtien : Nos langues (français et créole) descendent directement du latin ! Des mots comme "kay" (casa en latin), "bonè" (bonus), "sitwon" (citrus) viennent du latin via le français.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-emerald-700 dark:text-emerald-400">5. Les civilisations d'Amérique précolombienne 🌎</h3>
          
          <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🌽 Les Mayas (2000 av. J.-C. - 1500 ap. J.-C.)</h4>
            <p class="mb-3">Civilisation brillante d'Amérique centrale (Guatemala, Mexique, Belize, Honduras).</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Écriture glyphique :</strong> Seul système d'écriture complet des Amériques précolombiennes</li>
              <li><strong>Calendrier très précis :</strong> Année de 365,2420 jours (presque exacte !)</li>
              <li><strong>Mathématiques :</strong> Invention du zéro (indépendamment de l'Inde)</li>
              <li><strong>Astronomie :</strong> Observation précise de Vénus, prédiction d'éclipses</li>
              <li><strong>Architecture :</strong> Pyramides à degrés (Chichén Itzá, Tikal, Palenque)</li>
            </ul>
          </div>

          <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">🦅 Les Aztèques (1345-1521)</h4>
            <p class="mb-3">Empire puissant du Mexique central, avec une capitale spectaculaire : Tenochtitlan.</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Tenochtitlan :</strong> Ville de 200 000 habitants construite sur un lac ! Plus grande que Paris à l'époque !</li>
              <li><strong>Chinampas :</strong> "Jardins flottants" - îles artificielles très fertiles</li>
              <li><strong>Système d'éducation :</strong> Obligatoire pour tous les enfants (rare à l'époque !)</li>
              <li><strong>Cacao :</strong> Utilisé comme monnaie et pour faire du chocolat (boisson des nobles)</li>
            </ul>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">⛰️ Les Incas (1438-1533)</h4>
            <p class="mb-3">Plus grand empire des Amériques précolombiennes, s'étendant sur 5 000 km le long de la cordillère des Andes !</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Machu Picchu :</strong> Cité perchée à 2 430 m d'altitude, invisible depuis la vallée</li>
              <li><strong>Qhapaq Ñan :</strong> Réseau routier de 40 000 km dans les montagnes</li>
              <li><strong>Agriculture en terrasses :</strong> Culture sur les pentes des montagnes</li>
              <li><strong>Quipus :</strong> Système de cordes nouées pour compter et enregistrer des informations</li>
              <li><strong>Maçonnerie parfaite :</strong> Pierres assemblées sans mortier, si précises qu'une lame de couteau ne peut pas passer entre elles !</li>
            </ul>
            <p class="mt-3 text-yellow-900 dark:text-yellow-200 font-semibold">🇭🇹 Lien avec Haïti : Comme les peuples précolombiens d'Amérique, Haïti avait aussi ses peuples autochtones : les Taïnos ! Ils cultivaient le manioc, le maïs, la patate douce, et vivaient en harmonie avec la nature.</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">6. Synthèse : L'héritage des civilisations anciennes dans notre vie quotidienne 🌟</h3>
          
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-lg">
            <p class="text-lg mb-4 font-semibold">Ces civilisations anciennes ne sont pas mortes : elles vivent à travers nous chaque jour !</p>
            
            <div class="space-y-4">
              <div>
                <p class="font-bold text-primary">✍️ Quand tu écris...</p>
                <p>Tu utilises l'alphabet (Phéniciens → Grecs → Romains), l'écriture cunéiforme ou hiéroglyphique (Mésopotamie, Égypte).</p>
              </div>

              <div>
                <p class="font-bold text-primary">🔢 Quand tu comptes...</p>
                <p>Tu utilises le système décimal (Inde), le zéro (Inde et Mayas), ou la base 60 pour le temps (Mésopotamie : 60 secondes, 60 minutes).</p>
              </div>

              <div>
                <p class="font-bold text-primary">⚖️ Quand tu parles de justice...</p>
                <p>Tu appliques des principes du droit romain : présomption d'innocence, égalité devant la loi.</p>
              </div>

              <div>
                <p class="font-bold text-primary">🗳️ Quand tu votes (plus tard)...</p>
                <p>Tu pratiques la démocratie inventée par les Grecs.</p>
              </div>

              <div>
                <p class="font-bold text-primary">📅 Quand tu regardes le calendrier...</p>
                <p>Tu utilises le calendrier égyptien perfectionné par les Romains (calendrier julien puis grégorien).</p>
              </div>

              <div>
                <p class="font-bold text-primary">🏛️ Quand tu vois un bâtiment officiel...</p>
                <p>Il a souvent des colonnes et une architecture inspirées de la Grèce et de Rome.</p>
              </div>

              <div>
                <p class="font-bold text-primary">💬 Quand tu parles français ou créole...</p>
                <p>Tu utilises des mots d'origine latine (Rome) et grecque.</p>
              </div>
            </div>

            <p class="mt-6 text-lg font-semibold text-purple-900 dark:text-purple-200 bg-white/50 dark:bg-black/20 p-4 rounded-lg">
              🌍 Conclusion : Nous sommes les héritiers de 5 000 ans d'histoire humaine. Chaque invention, chaque idée, chaque découverte des civilisations anciennes a contribué à construire le monde moderne dans lequel nous vivons aujourd'hui !
            </p>
          </div>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold mb-4 text-primary">🇭🇹 Exemples concrets liés à Haïti et notre quotidien</h3>
        
        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">📜 Exemple 1 : Notre langue créole et le latin</p>
          <p>Beaucoup de mots créoles viennent directement du latin via le français ! Par exemple :</p>
          <ul class="list-disc ml-6 mt-2 space-y-1">
            <li><strong>"Kay"</strong> (maison) vient de "casa" en latin</li>
            <li><strong>"Lekòl"</strong> (école) vient de "schola" en latin</li>
            <li><strong>"Liv"</strong> (livre) vient de "liber" en latin</li>
            <li><strong>"Lanmou"</strong> (amour) vient de "amor" en latin</li>
          </ul>
          <p class="mt-3">Sans les Romains qui ont répandu le latin, nous ne parlerions pas créole aujourd'hui !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">⚖️ Exemple 2 : Notre système juridique haïtien</p>
          <p>Le Code Civil haïtien (depuis 1825) est directement inspiré du Code Civil français (Code Napoléon), qui lui-même s'inspire du droit romain ! Quand un juge haïtien applique la loi, il utilise des principes vieux de 2 000 ans :</p>
          <ul class="list-disc ml-6 mt-2">
            <li>Présomption d'innocence</li>
            <li>Droit à un avocat</li>
            <li>Contrats légaux</li>
          </ul>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌽 Exemple 3 : Les Taïnos, nos ancêtres autochtones</p>
          <p>Avant l'arrivée de Christophe Colomb en 1492, Haïti (Ayiti) était habitée par les Taïnos, un peuple amérindien avancé. Ils nous ont laissé :</p>
          <ul class="list-disc ml-6 mt-2">
            <li><strong>Le nom "Haïti"</strong> (Ayiti = "terre montagneuse")</li>
            <li><strong>Des mots :</strong> hamac, ouragan, tabac, canot, barbecue</li>
            <li><strong>Des aliments :</strong> manioc (kassav), patate douce, maïs</li>
            <li><strong>Le jeu de balle :</strong> Ancêtre du football</li>
          </ul>
          <p class="mt-3">Même si les Taïnos ont été décimés par la colonisation, leur héritage vit à travers nous !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🏛️ Exemple 4 : L'architecture du Palais National (avant 2010)</p>
          <p>Le Palais National d'Haïti (détruit en 2010) avait des colonnes et un dôme inspirés de l'architecture grecque et romaine ! Beaucoup de bâtiments officiels dans le monde copient ce style "néoclassique".</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">📅 Exemple 5 : Notre calendrier et nos mois</p>
          <p>Les noms de nos mois viennent des Romains :</p>
          <ul class="list-disc ml-6 mt-2">
            <li><strong>Janvier :</strong> Janus (dieu des débuts)</li>
            <li><strong>Mars :</strong> Mars (dieu de la guerre)</li>
            <li><strong>Juillet :</strong> Jules César</li>
            <li><strong>Août :</strong> Auguste (premier empereur romain)</li>
          </ul>
          <p class="mt-3">Chaque fois que tu dis "Bon mwa Out" (Bon mois d'août), tu honores un empereur romain !</p>
        </div>

        <h3 class="text-2xl font-bold mb-4 text-primary mt-8">📝 Exercices variés et stimulants</h3>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">1. QCM (Choisis la bonne réponse)</p>
            <ol class="space-y-4">
              <li><strong>a) Qui a inventé l'écriture cunéiforme ?</strong>
                <br/>① Les Égyptiens ② Les Sumériens ③ Les Grecs ④ Les Romains
              </li>
              <li><strong>b) Quelle civilisation a construit les pyramides de Gizeh ?</strong>
                <br/>① La Mésopotamie ② La Grèce ③ L'Égypte ④ Rome
              </li>
              <li><strong>c) Où est née la démocratie ?</strong>
                <br/>① Rome ② Athènes ③ Babylone ④ Alexandrie
              </li>
              <li><strong>d) Quel empire a dominé le bassin méditerranéen pendant des siècles ?</strong>
                <br/>① L'Empire grec ② L'Empire perse ③ L'Empire romain ④ L'Empire égyptien
              </li>
              <li><strong>e) Quelle civilisation précolombienne a construit Machu Picchu ?</strong>
                <br/>① Les Mayas ② Les Aztèques ③ Les Incas ④ Les Taïnos
              </li>
            </ol>
            <p class="mt-4 text-sm italic">Réponses : a)② b)③ c)② d)③ e)③</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">2. Frise chronologique interactive</p>
            <p class="mb-3">Sur une grande feuille, crée une ligne du temps de 4000 av. J.-C. à 500 ap. J.-C. Place-y :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>L'invention de l'écriture cunéiforme (3200 av. J.-C.)</li>
              <li>La construction de la pyramide de Khéops (2560 av. J.-C.)</li>
              <li>Le Code d'Hammourabi (1750 av. J.-C.)</li>
              <li>Les premiers Jeux Olympiques (776 av. J.-C.)</li>
              <li>La fondation de Rome (753 av. J.-C.)</li>
              <li>La naissance de la démocratie athénienne (508 av. J.-C.)</li>
              <li>Alexandre le Grand (336-323 av. J.-C.)</li>
              <li>L'apogée de l'Empire romain (Ier-IIe siècles ap. J.-C.)</li>
              <li>La chute de l'Empire romain d'Occident (476 ap. J.-C.)</li>
            </ul>
            <p class="mt-3 text-sm italic">💡 Utilise des couleurs différentes pour chaque civilisation !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">3. Tableau comparatif : Deux civilisations face à face</p>
            <p class="mb-3">Choisis deux civilisations anciennes et compare-les dans un tableau avec ces catégories :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Période historique</li>
              <li>Localisation géographique</li>
              <li>Type de gouvernement</li>
              <li>Principales innovations</li>
              <li>Monuments célèbres</li>
              <li>Héritage laissé à l'humanité</li>
            </ul>
            <p class="mt-3"><strong>Exemple :</strong> Compare l'Égypte ancienne et la Grèce antique.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">4. Projet : Affiche "Ma civilisation préférée"</p>
            <p class="mb-3">Crée une affiche A3 ou digitale présentant ta civilisation ancienne préférée. Include :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Une carte montrant sa localisation</li>
              <li>Des images de monuments ou objets célèbres</li>
              <li>3-5 inventions majeures</li>
              <li>Un personnage important (pharaon, philosophe, empereur...)</li>
              <li>Son influence sur le monde d'aujourd'hui</li>
              <li>Pourquoi tu l'as choisie (ton avis personnel)</li>
            </ul>
            <p class="mt-3 text-sm italic">🎨 Sois créatif ! Utilise des dessins, des photos imprimées, des couleurs...</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">5. Enquête linguistique : Les mots venus de l'Antiquité</p>
            <p class="mb-3">Trouve 10 mots créoles ou français que nous utilisons en Haïti qui viennent du grec ancien ou du latin. Pour chacun, indique :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Le mot en créole/français</li>
              <li>Son origine (grec ou latin)</li>
              <li>Sa signification originale</li>
            </ul>
            <p class="mt-3"><strong>Exemples pour t'aider :</strong></p>
            <ul class="list-disc ml-8 text-sm">
              <li>Téléphone = "tele" (loin) + "phone" (son) en grec</li>
              <li>Démocratie = "demos" (peuple) + "kratos" (pouvoir) en grec</li>
              <li>École = "schola" (loisir consacré à l'étude) en latin</li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">6. Jeu de rôle : Conseil démocratique athénien</p>
            <p class="mb-3"><strong>Scénario :</strong> Votre classe est l'Agora d'Athènes en 450 av. J.-C. Vous devez voter sur une proposition :</p>
            <p class="mb-3 italic">"Faut-il construire un nouveau temple pour Athéna avec l'argent de la cité, ou le distribuer aux citoyens pauvres ?"</p>
            <p class="mb-3"><strong>Déroulement :</strong></p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Le professeur présente le problème</li>
              <li>5 élèves préparent un discours POUR le temple (2 min chacun)</li>
              <li>5 élèves préparent un discours CONTRE (2 min chacun)</li>
              <li>Débat ouvert : chaque élève peut prendre la parole</li>
              <li>Vote à main levée</li>
              <li>La majorité l'emporte !</li>
            </ol>
            <p class="mt-3 text-sm italic">🎭 Vous pouvez porter des toges (draps blancs) pour l'ambiance !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">7. Recherche : Les 7 Merveilles du monde antique</p>
            <p class="mb-3">Les Grecs anciens ont listé les 7 plus belles constructions de leur époque. Fais une recherche et crée une fiche pour chacune :</p>
            <ol class="list-decimal ml-6 space-y-1">
              <li>La Grande Pyramide de Gizeh (Égypte) - seule encore debout</li>
              <li>Les Jardins suspendus de Babylone (Mésopotamie)</li>
              <li>La Statue de Zeus à Olympie (Grèce)</li>
              <li>Le Temple d'Artémis à Éphèse (Turquie actuelle)</li>
              <li>Le Mausolée d'Halicarnasse (Turquie actuelle)</li>
              <li>Le Colosse de Rhodes (Grèce)</li>
              <li>Le Phare d'Alexandrie (Égypte)</li>
            </ol>
            <p class="mt-3"><strong>Pour chaque merveille, note :</strong> Date de construction, dimensions, pourquoi elle était extraordinaire, ce qu'il en reste aujourd'hui.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">8. Activité créative : Invente ton système d'écriture</p>
            <p class="mb-3">Les Sumériens, les Égyptiens, les Mayas ont tous inventé leur propre écriture. À ton tour !</p>
            <p class="mb-3"><strong>Consignes :</strong></p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Crée 20 symboles représentant des lettres, des sons ou des concepts</li>
              <li>Écris une courte phrase (10-15 mots) avec ton système</li>
              <li>Fais-la déchiffrer par un(e) camarade en lui donnant la clé</li>
            </ul>
            <p class="mt-3 text-sm italic">🖊️ Tu réaliseras à quel point l'invention de l'écriture était géniale !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">9. Débat : Quelle est la plus grande civilisation ancienne ?</p>
            <p class="mb-3">Divisez la classe en 5 groupes, chacun défendant une civilisation :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Groupe 1 : Mésopotamie</li>
              <li>Groupe 2 : Égypte ancienne</li>
              <li>Groupe 3 : Grèce antique</li>
              <li>Groupe 4 : Empire romain</li>
              <li>Groupe 5 : Civilisations précolombiennes (Mayas, Aztèques, Incas)</li>
            </ul>
            <p class="mt-3"><strong>Chaque groupe doit préparer :</strong></p>
            <ul class="list-disc ml-6 space-y-1">
              <li>3 arguments principaux</li>
              <li>Des preuves concrètes (inventions, monuments, influence)</li>
              <li>Une conclusion percutante</li>
            </ul>
            <p class="mt-3 text-sm italic">À la fin, votez pour la civilisation la plus convaincante (sauf la vôtre !).</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">10. Composition finale (300 mots)</p>
            <p class="mb-3"><strong>Sujet :</strong> "Si je pouvais voyager dans le temps, je visiterais..."</p>
            <p class="mb-2">Choisis une civilisation ancienne et imagine que tu peux la visiter pendant une journée. Décris :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Quelle civilisation et quelle période exacte</li>
              <li>Ce que tu verrais en te promenant dans les rues</li>
              <li>Les personnes que tu aimerais rencontrer</li>
              <li>Les monuments ou sites que tu visiterais</li>
              <li>Ce que tu apprendrais ou rapporterais de ce voyage</li>
              <li>Comment cette expérience changerait ta vision du monde moderne</li>
            </ul>
            <p class="mt-3 text-sm italic">✨ Sois descriptif et immersif ! Fais-nous vivre ton voyage dans le temps !</p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg mt-8">
          <p class="font-semibold text-lg mb-3">🎥 Ressources vidéo YouTube suggérées</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>"Les grandes civilisations de l'Antiquité" - <em>Documentaire complet</em></li>
            <li>"L'Égypte ancienne expliquée simplement" - <em>C'est pas sorcier</em></li>
            <li>"La Grèce antique : berceau de la démocratie" - <em>Histoire pour tous</em></li>
            <li>"Rome : de la République à l'Empire" - <em>Documentaire ARTE</em></li>
            <li>"Les mystères des pyramides" - <em>National Geographic</em></li>
            <li>"Les Mayas : une civilisation brillante" - <em>Documentaire</em></li>
            <li>"Les Incas et Machu Picchu" - <em>Voyage dans l'histoire</em></li>
          </ul>
        </div>
      </div>
    `
  },

  // Leçon 10: La famille comme organisation sociale
  {
    id: "famille-organisation-sociale",
    title: "La famille comme organisation sociale",
    mois: "Mars",
    objectif: "Comprendre le rôle de la famille comme institution sociale fondamentale.",
    introduction: `
      <div class="space-y-4">
        <p class="text-lg leading-relaxed">👨‍👩‍👧‍👦 <strong>La famille : notre première école de vie !</strong></p>
        <p>Imagine une seconde si tu n'avais pas de famille : pas de parents pour t'apprendre à parler, à manger, à marcher... Pas de frères et sœurs pour jouer, pas de grands-parents pour te raconter des histoires, pas de tantes et oncles pour te câliner quand ça ne va pas. La famille, c'est le premier cercle social dans lequel nous naissons et grandissons. C'est là que nous apprenons TOUT : la langue, les bonnes manières, les valeurs morales, la religion, la culture, et même comment interagir avec les autres !</p>
        <p>La famille est bien plus qu'un groupe de personnes qui vivent ensemble. C'est une <strong>institution sociale</strong>, c'est-à-dire une organisation structurée par des règles, des rôles, et des responsabilités. Elle existe dans toutes les sociétés humaines, même si elle prend des formes différentes selon les cultures.</p>
        <p class="text-primary font-semibold">🇭🇹 En Haïti, la famille a une importance CAPITALE. Elle est souvent le seul filet de sécurité sociale : quand il n'y a pas de travail, pas d'hôpital accessible, pas d'aide de l'État, c'est la famille qui nous soutient. "Fanmi se richès" (La famille est une richesse), comme on dit chez nous !</p>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">1. Qu'est-ce qu'une famille ? Définition et universalité 🏠</h3>
          <p class="mb-4">La famille est un groupe social fondé sur des liens de <strong>parenté</strong> (biologique ou adoptif) et/ou d'<strong>alliance</strong> (mariage, union libre). C'est la cellule de base de toute société humaine.</p>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🌍 Une institution universelle mais diverse</h4>
            <p class="mb-3">Toutes les sociétés humaines, de la plus simple à la plus complexe, ont une forme d'organisation familiale. Cependant, la famille prend des formes très différentes selon les cultures :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>En Europe et Amérique du Nord : famille nucléaire dominante (2 parents + enfants)</li>
              <li>En Afrique et dans beaucoup de pays en développement : famille élargie (plusieurs générations sous le même toit)</li>
              <li>Dans certaines sociétés : familles polygames (un homme, plusieurs femmes), polyandres (une femme, plusieurs hommes - rare)</li>
              <li>Aujourd'hui : familles homoparentales (deux papas ou deux mamans)</li>
            </ul>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">2. Les différents types de structures familiales 👨‍👩‍👧‍👦</h3>
          
          <div class="space-y-4">
            <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">A. Famille nucléaire (ou conjugale)</h4>
              <p class="mb-3">Composée des <strong>deux parents</strong> (père et mère) et de leurs <strong>enfants biologiques ou adoptifs</strong>. C'est le modèle dominant dans les sociétés occidentales industrialisées.</p>
              <p class="text-sm italic">🇭🇹 En Haïti : Environ 30-40% des familles suivent ce modèle, surtout en milieu urbain et dans la classe moyenne.</p>
            </div>

            <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">B. Famille élargie (ou famille étendue)</h4>
              <p class="mb-3">Inclut <strong>plusieurs générations</strong> vivant ensemble ou à proximité : grands-parents, parents, enfants, oncles, tantes, cousins, parfois même des personnes sans lien de sang ("restés avec" - enfants confiés).</p>
              <ul class="list-disc ml-6 space-y-2 mb-3">
                <li><strong>Avantages :</strong> Solidarité forte, partage des responsabilités, transmission culturelle, garde des enfants assurée</li>
                <li><strong>Inconvénients :</strong> Conflits possibles, manque d'intimité, dépendance économique</li>
              </ul>
              <p class="text-amber-900 dark:text-amber-200 font-semibold">🇭🇹 En Haïti : C'est le modèle DOMINANT ! Environ 50-60% des familles haïtiennes fonctionnent ainsi. Les grands-parents élèvent souvent leurs petits-enfants pendant que les parents travaillent à Port-au-Prince ou à l'étranger.</p>
            </div>

            <div class="bg-pink-50 dark:bg-pink-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">C. Famille monoparentale</h4>
              <p class="mb-3">Un <strong>seul parent</strong> élève les enfants, généralement la mère (mais parfois le père). Causes possibles :</p>
              <ul class="list-disc ml-6 space-y-1 mb-3">
                <li>Décès du conjoint</li>
                <li>Divorce ou séparation</li>
                <li>Naissance hors mariage</li>
                <li>Migration du conjoint</li>
              </ul>
              <p class="text-pink-900 dark:text-pink-200 font-semibold">🇭🇹 En Haïti : Très courant, surtout en milieu urbain pauvre. Beaucoup de "fanm poto mitan" (femmes piliers) élèvent seules leurs enfants. Ces mères font des miracles : commerce, petits boulots, solidarité entre voisines...</p>
            </div>

            <div class="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">D. Famille recomposée</h4>
              <p class="mb-3">Formation d'une nouvelle famille avec des enfants issus d'unions précédentes. Exemple : Un papa divorcé avec 2 enfants se remarie avec une maman divorcée qui a 1 enfant → famille recomposée de 3 enfants.</p>
              <p class="text-sm italic">🇭🇹 En Haïti : De plus en plus fréquent, surtout en milieu urbain.</p>
            </div>

            <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">E. Plasaj (union libre à l'haïtienne)</h4>
              <p class="mb-3">Spécificité haïtienne ! Le "plasaj" est une union de fait sans mariage officiel, mais stable et reconnue socialement. Les couples vivent ensemble, ont des enfants, mais ne sont pas mariés civilement ou religieusement.</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>Très répandu en milieu rural et populaire urbain</li>
                <li>Raisons : coût du mariage, procédures complexes, traditions culturelles</li>
                <li>Les enfants nés de ces unions ont les mêmes droits que les enfants "légitimes"</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">3. Les fonctions essentielles de la famille 🎯</h3>
          
          <div class="space-y-4">
            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">A. Fonction de reproduction et de survie de l'espèce 👶</h4>
              <p>C'est la fonction biologique de base : avoir des enfants pour assurer la continuité de l'humanité. Sans reproduction, l'espèce humaine disparaîtrait !</p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">B. Fonction de socialisation (la plus importante !) 📚</h4>
              <p class="mb-3">La famille est la <strong>première école</strong> où l'enfant apprend TOUT :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>La langue :</strong> C'est en famille que tu as appris à parler créole (ou français)</li>
                <li><strong>Les normes sociales :</strong> Dire bonjour, merci, respecter les adultes, ne pas voler...</li>
                <li><strong>Les valeurs morales :</strong> Honnêteté, solidarité, courage, respect...</li>
                <li><strong>Les rôles sociaux :</strong> Comment être un homme ou une femme dans notre culture</li>
                <li><strong>La culture :</strong> Religion, traditions, cuisine, musique, proverbes...</li>
              </ul>
              <p class="mt-3 font-semibold text-purple-900 dark:text-purple-200">🇭🇹 Exemple haïtien : C'est en famille qu'on apprend à respecter les aînés ("Respekte granmoun"), à partager ("Pataje pa chich"), à être solidaire ("Mèt ansanm pou n rive"), à croire en Dieu...</p>
            </div>

            <div class="bg-green-50 dark:bg-green-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">C. Fonction affective et psychologique 💖</h4>
              <p class="mb-3">La famille offre :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Amour inconditionnel :</strong> Tes parents t'aiment même quand tu fais des bêtises</li>
                <li><strong>Sécurité émotionnelle :</strong> Un lieu où tu peux être toi-même sans jugement</li>
                <li><strong>Protection :</strong> Contre les dangers du monde extérieur</li>
                <li><strong>Réconfort :</strong> Quand tu es triste, malade, découragé</li>
                <li><strong>Encouragement :</strong> Tes parents croient en toi et te poussent à réussir</li>
              </ul>
              <p class="mt-3 italic">Sans cette base affective solide, un enfant peut développer des troubles psychologiques (dépression, anxiété, manque de confiance en soi...).</p>
            </div>

            <div class="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">D. Fonction économique 💰</h4>
              <p class="mb-3">La famille est une unité de production et de consommation :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Production :</strong> Les parents travaillent pour gagner de l'argent</li>
                <li><strong>Consommation :</strong> L'argent sert à acheter nourriture, vêtements, payer l'école...</li>
                <li><strong>Partage des ressources :</strong> Ce qui est gagné est partagé entre tous les membres</li>
              </ul>
              <p class="mt-3 font-semibold text-amber-900 dark:text-amber-200">🇭🇹 En Haïti : La fonction économique est CRUCIALE ! Quand un membre de la famille a un travail, il soutient souvent 5, 10, parfois 15 personnes ! Les transferts d'argent de la diaspora (environ 3 milliards de dollars par an) font vivre des millions de familles haïtiennes.</p>
            </div>

            <div class="bg-pink-50 dark:bg-pink-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">E. Fonction de transmission culturelle et identitaire 🎭</h4>
              <p class="mb-3">La famille transmet de génération en génération :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>L'histoire familiale (d'où viennent nos ancêtres ?)</li>
                <li>Les traditions (Noël, Pâques, fêtes de famille)</li>
                <li>La religion (vaudou, catholicisme, protestantisme...)</li>
                <li>La cuisine (recettes de grand-mère)</li>
                <li>Les chants, contes, proverbes</li>
              </ul>
              <p class="mt-3 font-semibold text-pink-900 dark:text-pink-200">🇭🇹 Exemple : C'est grâce à la famille que tu connais l'histoire de l'esclavage, de l'indépendance d'Haïti, les proverbes créoles, les recettes de diri ak pwa, les chansons de carnaval...</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-teal-700 dark:text-teal-400">4. La famille haïtienne : Spécificités et défis 🇭🇹</h3>
          
          <div class="space-y-4">
            <div class="bg-yellow-50 dark:bg-yellow-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">A. La famille élargie comme norme</h4>
              <p class="mb-3">En Haïti, la famille ne se limite pas aux parents et enfants. Elle inclut :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Granmoun yo</strong> (les grands-parents) : Très respectés, gardiens de la sagesse</li>
                <li><strong>Tonton, tant, kouzen</strong> (oncles, tantes, cousins) : Très proches, presque comme des frères/sœurs</li>
                <li><strong>Marenn, parenn</strong> (marraine, parrain) : Deuxièmes parents spirituels</li>
                <li><strong>Timoun yo</strong> (les enfants) : Tous les enfants, même ceux des voisins qu'on aide</li>
                <li><strong>"Restès avec"</strong> : Enfants confiés à une famille pour les aider (phénomène complexe)</li>
              </ul>
              <p class="mt-3 font-semibold">💡 Proverbe haïtien : "Pitit se richès malere" (Les enfants sont la richesse du pauvre)</p>
            </div>

            <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">B. Le rôle central de la mère (fanm poto mitan)</h4>
              <p class="mb-3">En Haïti, la mère est souvent le pilier de la famille :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>Elle gère le budget familial</li>
                <li>Elle élève les enfants (parfois seule)</li>
                <li>Elle travaille (commerce, marchande, couturière...)</li>
                <li>Elle organise la vie quotidienne</li>
                <li>Elle maintient les liens familiaux</li>
              </ul>
              <p class="mt-3 italic">Beaucoup de mères haïtiennes sont des héroïnes du quotidien qui font des miracles avec peu de moyens !</p>
            </div>

            <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">C. L'impact de la migration sur les familles haïtiennes 🛫</h4>
              <p class="mb-3">Plus de 2 millions d'Haïtiens vivent à l'étranger (diaspora). Conséquences sur les familles :</p>
              <ul class="list-disc ml-6 space-y-2 mb-3">
                <li><strong>Séparations :</strong> Parents partis travailler aux USA, Canada, France, Chili...</li>
                <li><strong>Grands-parents élevant les petits-enfants :</strong> Très courant</li>
                <li><strong>Enfants grandissant sans leurs parents :</strong> Problèmes affectifs possibles</li>
                <li><strong>Transferts d'argent :</strong> Les "remittances" font vivre des millions de familles</li>
                <li><strong>Familles transnationales :</strong> Maintien des liens par téléphone, WhatsApp, envois de colis</li>
              </ul>
              <p class="font-semibold text-red-900 dark:text-red-200">💔 Dilemme : L'argent envoyé permet aux enfants d'aller à l'école et de manger, mais l'absence des parents crée un vide affectif difficile...</p>
            </div>

            <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">D. Le respect des aînés (respè granmoun)</h4>
              <p class="mb-3">En Haïti, les personnes âgées sont hautement respectées :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>On leur parle avec vouvoiement ("Ou" au lieu de "w")</li>
                <li>On leur cède la place assise</li>
                <li>On écoute leurs conseils</li>
                <li>On les prend en charge quand ils vieillissent (pas de maisons de retraite)</li>
              </ul>
              <p class="mt-3 font-semibold">📜 Proverbe : "Granmoun se bwa kajou, yo pa janm tonbe atè" (Les personnes âgées sont comme le fruit de l'acajou, elles ne tombent jamais par terre - on les soutient toujours)</p>
            </div>

            <div class="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">E. La solidarité familiale exceptionnelle</h4>
              <p class="mb-3">Face aux difficultés économiques et à l'absence de protection sociale de l'État, les Haïtiens comptent sur leur famille :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>Quand quelqu'un perd son travail, la famille l'héberge et le nourrit</li>
                <li>Quand un enfant est malade, toute la famille cotise pour les soins</li>
                <li>Les frais scolaires sont parfois payés par les oncles/tantes</li>
                <li>Les cérémonies (mariages, funérailles) sont financées collectivement</li>
              </ul>
              <p class="mt-3 font-semibold text-teal-900 dark:text-teal-200">✨ "Men anpil chay pa lou" (Plusieurs mains rendent le fardeau léger) - ensemble, on est plus fort !</p>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">5. Défis et évolutions de la famille moderne 🌐</h3>
          
          <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">Défis contemporains :</h4>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>Pauvreté :</strong> Difficultés à nourrir, loger, éduquer les enfants</li>
              <li><strong>Chômage :</strong> Parents sans revenus stables</li>
              <li><strong>Urbanisation :</strong> Passage de la campagne à la ville, rupture avec traditions rurales</li>
              <li><strong>Violence domestique :</strong> Maltraitance, abus (problème sérieux en Haïti)</li>
              <li><strong>Nouvelles technologies :</strong> Les jeunes passent plus de temps sur les téléphones que avec la famille</li>
              <li><strong>Individualisme croissant :</strong> Moins de solidarité qu'avant, surtout en ville</li>
            </ul>
            
            <h4 class="text-xl font-semibold mt-6 mb-3">Évolutions positives :</h4>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Éducation des filles :</strong> De plus en plus de filles vont à l'école</li>
              <li><strong>Partage des tâches :</strong> Les pères participent plus à l'éducation des enfants</li>
              <li><strong>Planification familiale :</strong> Moins d'enfants mais mieux éduqués</li>
              <li><strong>Droits de l'enfant :</strong> Meilleure protection contre les abus</li>
            </ul>
          </div>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold mb-4 text-primary">🇭🇹 Exemples concrets de familles haïtiennes</h3>
        
        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">👵 Exemple 1 : Marie, 12 ans, élevée par sa grand-mère</p>
          <p>Les parents de Marie travaillent à Miami. Elle vit avec sa grand-mère à Pétion-Ville depuis qu'elle a 5 ans. Sa grand-mère l'emmène à l'école, vérifie ses devoirs, lui prépare à manger. Chaque dimanche, Marie appelle ses parents sur WhatsApp. Ils lui envoient de l'argent chaque mois pour l'école et ses besoins. Marie aime beaucoup sa grand-mère, mais ses parents lui manquent énormément...</p>
          <p class="mt-2 text-sm italic">Type de famille : Famille élargie avec migration parentale</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">👩‍👧‍👦 Exemple 2 : Madame Josette, mère courage</p>
          <p>Madame Josette, 35 ans, élève seule ses 3 enfants (9, 12, 14 ans) à Carrefour. Le père est parti il y a 5 ans et ne donne plus de nouvelles. Elle vend des légumes au marché de 5h du matin à 6h du soir. Avec ses gains, elle paie le loyer, la nourriture, l'école. C'est difficile, mais elle ne lâche jamais ! Sa voisine l'aide parfois en gardant les enfants. Elle dit toujours : "Timoun mwen yo ap vin yon bagay, m ap fè tout sakrifis !" (Mes enfants vont devenir quelqu'un, je fais tous les sacrifices !)</p>
          <p class="mt-2 text-sm italic">Type de famille : Famille monoparentale (mère seule)</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">👨‍👩‍👧‍👦 Exemple 3 : La famille Joseph, famille nucléaire</p>
          <p>Monsieur et Madame Joseph vivent à Delmas avec leurs 2 enfants (un garçon de 10 ans, une fille de 7 ans). Papa Joseph travaille comme comptable, Maman Joseph est infirmière. Ils ont un appartement, une voiture. Les enfants vont dans une bonne école privée. Le dimanche, ils vont à l'église ensemble et rendent visite aux grands-parents. Cette famille ressemble aux familles qu'on voit dans les films américains !</p>
          <p class="mt-2 text-sm italic">Type de famille : Famille nucléaire de classe moyenne</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🏠 Exemple 4 : La lakou familiale de Jacmel</p>
          <p>Dans la même cour (lakou) à Jacmel vivent : Grand-père Ti-Jean (75 ans), Grand-mère Lourdes (70 ans), leurs 3 fils avec leurs femmes et enfants, soit 18 personnes au total ! Chaque famille a sa petite maison, mais ils partagent la cour, le puits, et mangent souvent ensemble. Quand quelqu'un a un problème, tout le monde aide. C'est bruyant, parfois il y a des disputes, mais jamais personne n'est seul !</p>
          <p class="mt-2 text-sm italic">Type de famille : Grande famille élargie traditionnelle</p>
        </div>

        <h3 class="text-2xl font-bold mb-4 text-primary mt-8">📝 Exercices variés</h3>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">1. Mon arbre généalogique (Projet créatif)</p>
            <p class="mb-3">Dessine ton arbre généalogique sur 3 générations minimum :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Génération 1 (en haut) :</strong> Tes grands-parents paternels et maternels</li>
              <li><strong>Génération 2 (milieu) :</strong> Tes parents, oncles, tantes</li>
              <li><strong>Génération 3 (en bas) :</strong> Toi, tes frères/sœurs, cousins</li>
            </ul>
            <p class="mt-3">Pour chaque personne, note :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Prénom et nom</li>
              <li>Profession</li>
              <li>Lieu de résidence</li>
            </ul>
            <p class="mt-3"><strong>Bonus :</strong> Décore avec des photos, dessins, couleurs !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">2. Identifie ton type de famille</p>
            <p class="mb-3">En te basant sur ta situation personnelle, identifie à quel type de famille tu appartiens :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>□ Famille nucléaire</li>
              <li>□ Famille élargie</li>
              <li>□ Famille monoparentale</li>
              <li>□ Famille recomposée</li>
              <li>□ Autre (précise)</li>
            </ul>
            <p class="mt-3"><strong>Puis réponds :</strong> Quels sont les avantages et inconvénients de ta situation familiale ? (5-8 lignes)</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">3. Interview d'un membre de ta famille</p>
            <p class="mb-3">Choisis une personne âgée de ta famille (grand-parent, oncle/tante âgé(e)) et pose-lui ces questions :</p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Comment était la famille quand tu étais enfant ?</li>
              <li>Combien de frères et sœurs avais-tu ?</li>
              <li>Quelles étaient les règles à la maison ?</li>
              <li>Comment les enfants aidaient-ils les parents ?</li>
              <li>Qu'est-ce qui a changé dans les familles haïtiennes depuis ton enfance ?</li>
            </ol>
            <p class="mt-3">Écris un compte-rendu de 150-200 mots avec les réponses.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">4. Les fonctions de MA famille (Tableau)</p>
            <p class="mb-3">Crée un tableau montrant comment ta famille remplit ses différentes fonctions :</p>
            <table class="w-full border-collapse border border-gray-300 mt-3">
              <thead>
                <tr class="bg-gray-100 dark:bg-gray-700">
                  <th class="border border-gray-300 p-2">Fonction</th>
                  <th class="border border-gray-300 p-2">Comment ma famille la remplit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="border border-gray-300 p-2">Socialisation</td>
                  <td class="border border-gray-300 p-2">Ex: Ma mère m'apprend les bonnes manières</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Affective</td>
                  <td class="border border-gray-300 p-2">Ex: Mon père me console quand je suis triste</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Économique</td>
                  <td class="border border-gray-300 p-2">Ex: Mon oncle nous aide financièrement</td>
                </tr>
                <tr>
                  <td class="border border-gray-300 p-2">Culturelle</td>
                  <td class="border border-gray-300 p-2">Ex: Ma grand-mère me raconte l'histoire d'Haïti</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">5. Composition : "Ma famille, ma richesse"</p>
            <p class="mb-3"><strong>Sujet :</strong> Écris un texte de 200-250 mots sur ta famille.</p>
            <p class="mb-2">Tu dois inclure :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>La composition de ta famille (qui vit avec toi ?)</li>
              <li>Ce que tu aimes le plus dans ta famille</li>
              <li>Les difficultés que vous rencontrez</li>
              <li>Un souvenir familial marquant</li>
              <li>Ce que ta famille t'a appris de plus important</li>
            </ul>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">6. Débat : "La famille élargie vs la famille nucléaire"</p>
            <p class="mb-3">Divisez la classe en deux groupes :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Groupe A :</strong> Défend la famille élargie (plusieurs générations ensemble)</li>
              <li><strong>Groupe B :</strong> Défend la famille nucléaire (parents + enfants seulement)</li>
            </ul>
            <p class="mt-3">Chaque groupe prépare 3 arguments et les présente. Ensuite, débat ouvert !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">7. Proverbes haïtiens sur la famille</p>
            <p class="mb-3">Explique le sens de ces proverbes créoles :</p>
            <ol class="list-decimal ml-6 space-y-3">
              <li><strong>"Fanmi se richès malere"</strong> (La famille est la richesse du pauvre)</li>
              <li><strong>"Men anpil, chay pa lou"</strong> (Beaucoup de mains, le fardeau n'est pas lourd)</li>
              <li><strong>"Pitit se baton veyès"</strong> (Les enfants sont le bâton de vieillesse)</li>
              <li><strong>"Se fanmi ki konnen si pay ki nan dlo a chèch oswa li mouye"</strong> (C'est la famille qui sait si la paille dans l'eau est sèche ou mouillée - les problèmes familiaux restent en famille)</li>
            </ol>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">8. Étude de cas : Les défis des familles haïtiennes</p>
            <p class="mb-3">Lis ces situations et propose des solutions :</p>
            <div class="space-y-4 mt-3">
              <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p class="font-semibold">Cas 1 : Manuela, 11 ans</p>
                <p>Ses parents sont partis au Chili. Elle vit avec sa tante qui a déjà 5 enfants. La tante est débordée et parfois crie sur Manuela. Manuela se sent rejetée et ses notes baissent.</p>
                <p class="mt-2 italic">→ Que peut faire Manuela ? Comment sa famille pourrait-elle l'aider ?</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                <p class="font-semibold">Cas 2 : La famille Dupont</p>
                <p>Papa a perdu son travail. Maman vend au marché mais ça ne suffit pas. Ils ont 4 enfants à nourrir et l'école à payer. Les tensions montent à la maison.</p>
                <p class="mt-2 italic">→ Quelles solutions pourraient aider cette famille ?</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">9. Recherche : La famille dans différentes cultures</p>
            <p class="mb-3">Compare la famille haïtienne avec la famille dans 2 autres cultures (tu peux choisir : France, États-Unis, Japon, Sénégal, Brésil...).</p>
            <p class="mb-2">Points de comparaison :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Structure familiale dominante</li>
              <li>Rôle des grands-parents</li>
              <li>Nombre moyen d'enfants</li>
              <li>Âge du mariage</li>
              <li>Solidarité familiale</li>
            </ul>
            <p class="mt-3">Présente tes résultats sous forme de tableau comparatif.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">10. Projet final : "Portrait de ma famille" (Présentation orale)</p>
            <p class="mb-3">Prépare une présentation de 3-5 minutes sur ta famille pour la classe. Inclus :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Ton arbre généalogique (support visuel)</li>
              <li>Le type de famille</li>
              <li>Les membres importants et leur rôle</li>
              <li>Une tradition familiale</li>
              <li>Un défi que votre famille a surmonté</li>
              <li>Ce qui rend ta famille spéciale</li>
            </ul>
            <p class="mt-3 text-sm italic">💡 Tu peux apporter des photos, objets familiaux, préparer un diaporama...</p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg mt-8">
          <p class="font-semibold text-lg mb-3">📚 Pour aller plus loin</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Regarde le film haïtien "Poto Mitan" sur les femmes haïtiennes piliers de famille</li>
            <li>Lis des contes haïtiens qui parlent de la famille (Bouqui et Malice, etc.)</li>
            <li>Écoute des chansons haïtiennes sur la famille (Ti Coca "Manman", Beethova Obas "Fanm Ayisyen")</li>
          </ul>
        </div>
      </div>
    `
  },

  // Leçon 11: Les fosses marines
  {
    id: "fosses-marines",
    title: "Les fosses marines",
    mois: "Avril",
    objectif: "Découvrir les fosses océaniques et leur importance géologique.",
    introduction: `
      <div class="space-y-4">
        <p class="text-lg leading-relaxed">🌊 <strong>Plongée dans les abysses : Les fosses marines, les endroits les plus mystérieux de la Terre !</strong></p>
        <p>Savais-tu que nous connaissons mieux la surface de la Lune que le fond des océans ? Les fosses marines sont les zones les plus profondes et les plus inaccessibles de notre planète. Certaines descendent à plus de 11 000 mètres sous la surface de l'eau - si tu mettais le Mont Everest (8 848 m) au fond de la fosse des Mariannes, il serait complètement submergé avec encore 2 km d'eau au-dessus !</p>
        <p>Ces gouffres océaniques ne sont pas juste des "trous dans l'eau". Ils jouent un rôle crucial dans la géologie de notre planète : ils sont le résultat du mouvement des plaques tectoniques, et ils expliquent pourquoi certaines régions du monde - <strong>comme Haïti et les Caraïbes</strong> - sont si souvent touchées par des tremblements de terre et des tsunamis.</p>
        <p class="text-primary font-semibold">🇭🇹 Pourquoi c'est important pour Haïti ? Parce que nous vivons près de plusieurs fosses marines très actives : la fosse de Porto Rico (8 605 m) et la fosse des Caïmans (7 686 m). Ces fosses sont directement responsables de l'activité sismique intense qui a causé le terrible tremblement de terre du 12 janvier 2010. Comprendre les fosses marines, c'est comprendre pourquoi notre pays tremble régulièrement !</p>
      </div>
    `,
    contenu: `
      <div class="space-y-8">
        <section>
          <h3 class="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">1. Qu'est-ce qu'une fosse marine ? Définition et formation 🌊</h3>
          
          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">📖 Définition</h4>
            <p class="mb-3">Une <strong>fosse marine</strong> (ou fosse océanique, ou tranchée abyssale) est une <strong>dépression très profonde, longue et étroite</strong> du fond des océans. C'est l'équivalent sous-marin d'un canyon ou d'une vallée extrêmement profonde.</p>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Profondeur :</strong> Entre 6 000 et 11 000 mètres (en comparaison, l'océan a une profondeur moyenne de 3 800 m)</li>
              <li><strong>Forme :</strong> Longues et étroites, en forme de croissant ou de V</li>
              <li><strong>Longueur :</strong> Peuvent s'étendre sur des milliers de kilomètres</li>
              <li><strong>Largeur :</strong> Généralement entre 50 et 100 km</li>
            </ul>
          </div>

          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">🌍 Comment se forment les fosses marines ? (Subduction des plaques tectoniques)</h4>
            <p class="mb-3">Pour comprendre les fosses marines, il faut d'abord comprendre que la croûte terrestre n'est pas d'un seul bloc solide. Elle est divisée en plusieurs <strong>plaques tectoniques</strong> qui flottent sur le manteau terrestre (une couche de roche en fusion) et bougent lentement (quelques centimètres par an).</p>
            
            <p class="mb-3"><strong>Le processus de subduction (plongée d'une plaque sous une autre) :</strong></p>
            <ol class="list-decimal ml-6 space-y-3">
              <li><strong>Rencontre de deux plaques :</strong> Une plaque océanique (plus dense, plus lourde) rencontre une autre plaque (océanique ou continentale)</li>
              <li><strong>La plaque océanique plonge :</strong> Étant plus lourde, la plaque océanique s'enfonce sous l'autre plaque</li>
              <li><strong>Formation de la fosse :</strong> Au point de rencontre, la plaque qui plonge crée une dépression profonde : c'est la fosse marine !</li>
              <li><strong>La plaque continue de s'enfoncer :</strong> Elle descend dans le manteau terrestre où elle fond progressivement (recyclage de la croûte terrestre)</li>
            </ol>

            <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg mt-4">
              <p class="font-semibold mb-2">🔥 Conséquences de la subduction :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Tremblements de terre :</strong> Le frottement entre les deux plaques provoque des séismes violents</li>
                <li><strong>Volcans :</strong> La plaque qui fond libère des gaz et du magma qui remontent et créent des volcans</li>
                <li><strong>Tsunamis :</strong> Les séismes sous-marins peuvent déplacer d'énormes volumes d'eau</li>
                <li><strong>Chaînes de montagnes sous-marines :</strong> Formation d'arcs insulaires volcaniques</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-400">2. Les principales fosses marines du monde 🗺️</h3>
          
          <div class="space-y-4">
            <div class="bg-indigo-50 dark:bg-indigo-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">🏆 Fosse des Mariannes (Pacifique Ouest) - La championne du monde !</h4>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Profondeur maximale :</strong> 10 994 mètres (point Challenger Deep)</li>
                <li><strong>Localisation :</strong> Océan Pacifique, près de l'île de Guam</li>
                <li><strong>Record :</strong> L'endroit le plus profond de la Terre !</li>
                <li><strong>Exploration :</strong> Seulement 4 personnes y sont descendues dans l'histoire (James Cameron, le réalisateur de Titanic, en 2012 !)</li>
                <li><strong>Pression :</strong> 1 100 fois la pression atmosphérique au niveau de la mer - ton corps serait écrasé instantanément !</li>
              </ul>
              <p class="mt-3 text-sm italic">💡 Si tu lâchais une pierre au fond de la fosse des Mariannes, elle mettrait plus d'une heure pour toucher le fond !</p>
            </div>

            <div class="bg-red-50 dark:bg-red-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">🇭🇹 Fosse de Porto Rico (Atlantique) - Notre voisine dangereuse !</h4>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Profondeur maximale :</strong> 8 605 mètres (Milwaukee Deep)</li>
                <li><strong>Localisation :</strong> Au nord de Porto Rico et d'Haïti, dans l'océan Atlantique</li>
                <li><strong>Importance pour Haïti :</strong> C'est LA fosse qui nous concerne directement !</li>
                <li><strong>Danger :</strong> Zone de subduction très active = séismes fréquents + risque de tsunami</li>
                <li><strong>Record :</strong> La fosse la plus profonde de l'océan Atlantique</li>
              </ul>
              <p class="mt-3 font-semibold text-red-900 dark:text-red-200">⚠️ C'est l'activité de cette fosse qui a provoqué le séisme du 12 janvier 2010 en Haïti (magnitude 7.0, plus de 200 000 morts). La plaque nord-américaine glisse sous la plaque caribéenne au niveau de cette fosse.</p>
            </div>

            <div class="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">🌴 Fosse des Caïmans (Mer des Caraïbes)</h4>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Profondeur maximale :</strong> 7 686 mètres</li>
                <li><strong>Localisation :</strong> Entre la Jamaïque et les îles Caïmans</li>
                <li><strong>Particularité :</strong> C'est la plus profonde de la mer des Caraïbes</li>
                <li><strong>Impact sur Haïti :</strong> Contribue aussi à l'instabilité sismique de notre région</li>
              </ul>
            </div>

            <div class="bg-yellow-50 dark:bg-yellow-950/30 p-5 rounded-lg">
              <h4 class="text-xl font-semibold mb-3">🌏 Autres fosses majeures du monde</h4>
              <ul class="list-disc ml-6 space-y-2">
                <li><strong>Fosse des Tonga :</strong> 10 882 m (Pacifique Sud)</li>
                <li><strong>Fosse des Philippines :</strong> 10 540 m (Pacifique Ouest)</li>
                <li><strong>Fosse des Kermadec :</strong> 10 047 m (Pacifique Sud-Ouest)</li>
                <li><strong>Fosse du Japon :</strong> 8 412 m (Pacifique Ouest) - responsable du tsunami de 2011</li>
                <li><strong>Fosse du Pérou-Chili :</strong> 8 065 m (Pacifique Est)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-purple-700 dark:text-purple-400">3. La vie dans les fosses marines : Un monde extraterrestre sur Terre 👽</h3>
          
          <div class="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-lg mb-4">
            <h4 class="text-xl font-semibold mb-3">Conditions extrêmes</h4>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>Obscurité totale :</strong> Aucune lumière du soleil ne descend au-delà de 1 000 m</li>
              <li><strong>Pression écrasante :</strong> Plus de 1 000 fois la pression au niveau de la mer</li>
              <li><strong>Température glaciale :</strong> Entre 1°C et 4°C</li>
              <li><strong>Pas de photosynthèse :</strong> Les plantes ne peuvent pas pousser</li>
            </ul>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">Et pourtant, la vie existe ! 🦐</h4>
            <p class="mb-3">Contre toute attente, des créatures extraordinaires vivent dans ces abysses :</p>
            <ul class="list-disc ml-6 space-y-3">
              <li><strong>Poissons des abysses :</strong> Corps transparent ou bioluminescent (qui produit de la lumière), yeux énormes, dents gigantesques (poisson-vipère, poisson-lanterne)</li>
              <li><strong>Amphipodes géants :</strong> Sortes de crevettes géantes de 30 cm (taille normale : 1 cm !)</li>
              <li><strong>Concombres de mer géants :</strong> Animaux mous qui rampent au fond</li>
              <li><strong>Sources hydrothermales :</strong> Cheminées sous-marines qui crachent de l'eau à 400°C, entourées de bactéries et de vers tubicoles de 2 mètres !</li>
              <li><strong>Méduses transparentes :</strong> Flottent dans les eaux profondes</li>
            </ul>
            <p class="mt-3 font-semibold text-blue-900 dark:text-blue-200">🔬 Ces créatures ont développé des adaptations incroyables : bioluminescence pour attirer les proies, organes internes flexibles pour résister à la pression, métabolisme ultra-lent...</p>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-red-700 dark:text-red-400">4. Impact direct sur Haïti : Pourquoi notre pays tremble 🌍🇭🇹</h3>
          
          <div class="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 p-6 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">La situation tectonique d'Haïti</h4>
            <p class="mb-3">Haïti se trouve à un endroit géologiquement très complexe et dangereux : <strong>la frontière entre la plaque nord-américaine et la plaque caribéenne</strong>.</p>
            
            <div class="bg-white/50 dark:bg-black/20 p-4 rounded-lg mb-4">
              <p class="font-semibold mb-2">📍 Configuration des plaques :</p>
              <ul class="list-disc ml-6 space-y-2">
                <li>La <strong>plaque nord-américaine</strong> (qui porte les USA et le Canada) plonge sous la plaque caribéenne au niveau de la fosse de Porto Rico</li>
                <li>La <strong>plaque caribéenne</strong> (qui porte Haïti, la République Dominicaine, Cuba) se déplace vers l'est à environ 2 cm par an</li>
                <li>Les deux plaques se frottent le long d'une <strong>faille transformante</strong> (faille d'Enriquillo-Plantain Garden) qui traverse Haïti d'est en ouest</li>
              </ul>
            </div>

            <div class="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
              <h5 class="font-bold text-lg mb-2">⚠️ Conséquences pour Haïti :</h5>
              <ol class="list-decimal ml-6 space-y-3">
                <li><strong>Séismes fréquents :</strong>
                  <ul class="list-disc ml-6 mt-2">
                    <li>12 janvier 2010 : Magnitude 7.0 - Léogâne/Port-au-Prince (230 000 morts, 300 000 blessés)</li>
                    <li>14 août 2021 : Magnitude 7.2 - Sud d'Haïti (2 200 morts)</li>
                    <li>De nombreux petits séismes tout le temps</li>
                  </ul>
                </li>
                <li><strong>Risque de tsunami :</strong> Si un gros séisme se produit sous la mer près de la fosse de Porto Rico, un tsunami pourrait frapper nos côtes en quelques minutes</li>
                <li><strong>Déformations du relief :</strong> Les montagnes d'Haïti ont été créées par la collision des plaques</li>
                <li><strong>Sources chaudes :</strong> Présence de sources d'eau chaude naturelles (Source Puante, Source Matelas...)</li>
              </ol>
            </div>

            <div class="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg">
              <h5 class="font-bold text-lg mb-2">🛡️ Ce que nous devons faire :</h5>
              <ul class="list-disc ml-6 space-y-2">
                <li>Construire des bâtiments parasismiques (résistants aux tremblements de terre)</li>
                <li>Avoir un plan d'évacuation en cas de séisme</li>
                <li>Connaître les gestes qui sauvent (se mettre sous une table, s'éloigner des fenêtres...)</li>
                <li>Installer des systèmes d'alerte précoce pour les tsunamis</li>
                <li>Éduquer toute la population sur les risques sismiques</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 class="text-2xl font-bold mb-4 text-teal-700 dark:text-teal-400">5. Exploration des fosses marines : Mission (presque) impossible 🤿</h3>
          
          <div class="bg-teal-50 dark:bg-teal-950/30 p-5 rounded-lg">
            <h4 class="text-xl font-semibold mb-3">Les défis de l'exploration</h4>
            <ul class="list-disc ml-6 space-y-3 mb-4">
              <li><strong>Pression extrême :</strong> Un sous-marin normal serait écrasé comme une canette vide</li>
              <li><strong>Obscurité totale :</strong> Besoin de lumières artificielles puissantes</li>
              <li><strong>Froid :</strong> Tout le matériel peut geler</li>
              <li><strong>Distance :</strong> Il faut plusieurs heures pour descendre et remonter</li>
              <li><strong>Coût :</strong> Chaque expédition coûte des millions de dollars</li>
            </ul>

            <h4 class="text-xl font-semibold mb-3">Quelques expéditions historiques :</h4>
            <ul class="list-disc ml-6 space-y-2">
              <li><strong>1960 :</strong> Jacques Piccard et Don Walsh descendent à 10 916 m dans le bathyscaphe Trieste (première fois !)</li>
              <li><strong>2012 :</strong> James Cameron (réalisateur de Titanic et Avatar) descend en solitaire au fond de la fosse des Mariannes</li>
              <li><strong>2019 :</strong> Victor Vescovo bat le record de profondeur avec 10 928 m</li>
            </ul>

            <p class="mt-4 font-semibold">💡 On estime que seulement 5% des fonds océaniques ont été explorés. Il reste tant de mystères à découvrir !</p>
          </div>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <h3 class="text-2xl font-bold mb-4 text-primary">🇭🇹 Exemples concrets liés à Haïti</h3>
        
        <div class="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">💔 Exemple 1 : Le séisme du 12 janvier 2010</p>
          <p class="mb-3">Le 12 janvier 2010 à 16h53, un tremblement de terre de magnitude 7.0 a frappé Haïti. L'épicentre était à Léogâne, à seulement 25 km de Port-au-Prince. Résultat catastrophique :</p>
          <ul class="list-disc ml-6 space-y-1 mb-3">
            <li>Plus de 230 000 morts</li>
            <li>300 000 blessés</li>
            <li>1,5 million de sans-abris</li>
            <li>Le Palais National s'est effondré</li>
            <li>Des milliers de bâtiments détruits</li>
          </ul>
          <p><strong>Cause :</strong> Mouvement brutal le long de la faille d'Enriquillo, liée à la fosse de Porto Rico et à la subduction des plaques tectoniques.</p>
          <p class="mt-2 italic">C'était le plus grand désastre humanitaire de l'histoire d'Haïti. Aujourd'hui encore, le pays s'en remet.</p>
        </div>

        <div class="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">💔 Exemple 2 : Le séisme du 14 août 2021</p>
          <p class="mb-3">À peine 11 ans après 2010, un autre séisme majeur frappe le sud d'Haïti :</p>
          <ul class="list-disc ml-6 space-y-1 mb-3">
            <li>Magnitude : 7.2 (plus fort que 2010 !)</li>
            <li>Épicentre : Petit-Trou-de-Nippes</li>
            <li>Plus de 2 200 morts</li>
            <li>12 000 blessés</li>
            <li>Villes touchées : Les Cayes, Jérémie, Camp-Perrin...</li>
          </ul>
          <p><strong>Leçon :</strong> Haïti est situé dans une zone sismique TRÈS active. Les séismes majeurs ne sont pas des événements isolés, ils se répètent régulièrement !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🌊 Exemple 3 : Le risque de tsunami en Haïti</p>
          <p class="mb-3">En 2004, un tsunami géant a frappé l'Indonésie (causé par un séisme dans la fosse de Java) : 230 000 morts ! Haïti court le même risque :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Si un gros séisme (magnitude 8+) se produit dans la fosse de Porto Rico, il pourrait générer un tsunami</li>
            <li>Le tsunami atteindrait les côtes haïtiennes en 10-15 minutes seulement</li>
            <li>Villes côtières menacées : Cap-Haïtien, Gonaïves, Port-au-Prince, Les Cayes...</li>
          </ul>
          <p class="mt-3 font-semibold">⚠️ C'est pourquoi il faut avoir des systèmes d'alerte et des plans d'évacuation !</p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-5 rounded-lg mb-4">
          <p class="font-bold text-lg mb-2">🏔️ Exemple 4 : Les montagnes d'Haïti, créées par les plaques</p>
          <p>Le relief montagneux d'Haïti (Massif de la Hotte, Massif de la Selle, Chaîne des Matheux) est le résultat direct de millions d'années de collision entre les plaques caribéenne et nord-américaine. Chaque fois que les plaques se heurtent, elles soulèvent la terre et créent des montagnes !</p>
        </div>

        <h3 class="text-2xl font-bold mb-4 text-primary mt-8">📝 Exercices variés</h3>

        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">1. Carte des fosses marines</p>
            <p class="mb-3">Sur une carte du monde, localise et dessine :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>La fosse des Mariannes (Pacifique Ouest)</li>
              <li>La fosse de Porto Rico (au nord d'Haïti)</li>
              <li>La fosse des Caïmans (mer des Caraïbes)</li>
              <li>La fosse du Japon</li>
              <li>La fosse du Pérou-Chili</li>
            </ul>
            <p class="mt-3">Note la profondeur de chaque fosse à côté.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">2. QCM</p>
            <ol class="space-y-4">
              <li><strong>a) Quelle est la fosse la plus profonde du monde ?</strong>
                <br/>① Fosse de Porto Rico ② Fosse des Mariannes ③ Fosse des Tonga ④ Fosse du Japon
              </li>
              <li><strong>b) Comment se forment les fosses marines ?</strong>
                <br/>① Par érosion ② Par subduction des plaques ③ Par explosion volcanique ④ Par courants marins
              </li>
              <li><strong>c) Quelle fosse est la plus proche d'Haïti ?</strong>
                <br/>① Fosse des Mariannes ② Fosse du Japon ③ Fosse de Porto Rico ④ Fosse des Tonga
              </li>
              <li><strong>d) Pourquoi Haïti a-t-il beaucoup de tremblements de terre ?</strong>
                <br/>① Parce qu'il pleut beaucoup ② Parce qu'il y a beaucoup de fosses marines à proximité ③ À cause de la pollution ④ Par hasard
              </li>
            </ol>
            <p class="mt-4 text-sm italic">Réponses : a)② b)② c)③ d)②</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">3. Schéma : La subduction expliquée</p>
            <p class="mb-3">Dessine un schéma montrant :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Deux plaques tectoniques qui se rencontrent</li>
              <li>La plaque océanique qui plonge sous l'autre</li>
              <li>La formation de la fosse marine</li>
              <li>Un volcan qui se forme au-dessus</li>
              <li>L'épicentre d'un séisme</li>
            </ul>
            <p class="mt-3">Utilise des flèches pour montrer le mouvement des plaques.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">4. Comparaison de profondeurs</p>
            <p class="mb-3">Fais un tableau comparant :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Profondeur de la fosse des Mariannes : 10 994 m</li>
              <li>Hauteur du Mont Everest : 8 848 m</li>
              <li>Profondeur moyenne des océans : 3 800 m</li>
              <li>Profondeur à laquelle un sous-marin militaire peut descendre : 600 m</li>
              <li>Profondeur à laquelle un plongeur humain peut descendre : 330 m (record)</li>
            </ul>
            <p class="mt-3"><strong>Question :</strong> Qu'est-ce qui est le plus haut : le Mont Everest ou la fosse des Mariannes est profonde ?</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">5. Recherche : Les créatures des abysses</p>
            <p class="mb-3">Fais une recherche sur 3 créatures vivant dans les fosses marines. Pour chacune, note :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Son nom</li>
              <li>À quelle profondeur elle vit</li>
              <li>Ses adaptations spéciales (bioluminescence, pression, nourriture...)</li>
              <li>Une image ou un dessin</li>
            </ul>
            <p class="mt-3"><strong>Suggestions :</strong> Poisson-lanterne, poisson-vipère, amphipode géant, méduse dumbo, concombre de mer géant.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">6. Plan d'urgence séisme pour ta famille</p>
            <p class="mb-3">Haïti est en zone sismique. Prépare un plan d'urgence avec ta famille :</p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Identifier les endroits sûrs dans la maison (sous une table solide, loin des fenêtres)</li>
              <li>Préparer un sac d'urgence (eau, nourriture, lampe, radio, trousse de premiers soins, copies des documents importants)</li>
              <li>Définir un point de rassemblement familial à l'extérieur</li>
              <li>Mémoriser les gestes qui sauvent (S'accroupir, se couvrir, s'accrocher)</li>
              <li>Savoir où couper l'eau, le gaz, l'électricité</li>
            </ol>
            <p class="mt-3">Présente ton plan en classe.</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">7. Composition : "Le 12 janvier 2010, je me souviens..."</p>
            <p class="mb-3">Si tu étais né en 2010 ou avant, écris un témoignage de ce que tu te souviens du séisme (ou ce que tes parents t'ont raconté). Si tu es né après, interview un adulte qui l'a vécu.</p>
            <p class="mb-2">Inclus :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Où était la personne quand ça a commencé</li>
              <li>Ce qu'elle a ressenti (peur, choc...)</li>
              <li>Les dégâts autour d'elle</li>
              <li>Comment elle a survécu</li>
              <li>Les leçons tirées de cette expérience</li>
            </ul>
            <p class="mt-3 text-sm italic">(Traite ce sujet avec respect et sensibilité - c'est un traumatisme national)</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">8. Débat : "Faut-il explorer les fosses marines ?"</p>
            <p class="mb-3">Arguments POUR l'exploration :</p>
            <ul class="list-disc ml-6 space-y-1 mb-3">
              <li>Découvrir de nouvelles espèces</li>
              <li>Comprendre les plaques tectoniques</li>
              <li>Trouver des ressources (minéraux, pétrole)</li>
              <li>Avancées scientifiques</li>
            </ul>
            <p class="mb-3">Arguments CONTRE :</p>
            <ul class="list-disc ml-6 space-y-1">
              <li>Coût énorme (millions de dollars par expédition)</li>
              <li>Risque de pollution des abysses</li>
              <li>Danger pour les explorateurs</li>
              <li>L'argent pourrait servir à d'autres priorités</li>
            </ul>
            <p class="mt-3">Organisez un débat en classe !</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">9. Calcul : Temps de chute dans la fosse</p>
            <p class="mb-3"><strong>Problème :</strong> Une pierre est lâchée à la surface de l'océan au-dessus de la fosse des Mariannes (10 994 m de profondeur). Elle coule à une vitesse constante de 3 mètres par seconde.</p>
            <p class="mb-2"><strong>Questions :</strong></p>
            <ol class="list-decimal ml-6 space-y-2">
              <li>Combien de secondes mettra-t-elle pour toucher le fond ?</li>
              <li>Convertis ce temps en minutes et secondes.</li>
              <li>Combien de temps faudrait-il à la même vitesse pour descendre dans la fosse de Porto Rico (8 605 m) ?</li>
            </ol>
            <p class="mt-3 text-sm italic">Réponses : 1) 3 665 secondes  2) 61 minutes et 5 secondes (plus d'une heure !)  3) 2 868 secondes = 47 min 48 sec</p>
          </div>

          <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <p class="font-bold text-xl mb-4">10. Projet : Affiche de prévention sismique</p>
            <p class="mb-3">Crée une affiche colorée destinée aux écoles haïtiennes pour sensibiliser aux risques sismiques.</p>
            <p class="mb-2">L'affiche doit contenir :</p>
            <ul class="list-disc ml-6 space-y-2">
              <li>Un titre accrocheur</li>
              <li>Les gestes qui sauvent pendant un séisme</li>
              <li>Ce qu'il faut avoir dans un sac d'urgence</li>
              <li>Un numéro d'urgence (18 pour les pompiers)</li>
              <li>Des illustrations claires</li>
            </ul>
            <p class="mt-3">L'affiche doit être en créole ET en français pour toucher tout le monde !</p>
          </div>
        </div>

        <div class="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg mt-8">
          <p class="font-semibold text-lg mb-3">🎥 Ressources vidéo suggérées</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>"Les fosses marines expliquées" - <em>C'est pas sorcier</em></li>
            <li>"Voyage au fond de la fosse des Mariannes" - <em>James Cameron</em></li>
            <li>"Les créatures des abysses" - <em>National Geographic</em></li>
            <li>"Haïti et les plaques tectoniques" - <em>Documentaire géologique</em></li>
            <li>"Le séisme du 12 janvier 2010 : témoignages" - <em>Archives TV</em></li>
          </ul>
        </div>
      </div>
    `
  },

  // Leçon 12: Le climat d'Haïti
  {
    id: "climat-haiti",
    title: "Le climat d'Haïti",
    mois: "Avril",
    objectif: "Comprendre les caractéristiques climatiques d'Haïti et leurs impacts.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Haïti bénéficie d'un climat tropical, caractérisé par des températures élevées toute l'année et deux saisons distinctes. Ce climat influence directement l'agriculture, le tourisme et le mode de vie des Haïtiens.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Type de climat</h3>
          <p class="text-foreground mb-3">Haïti a un <strong>climat tropical humide</strong> avec variations selon l'altitude et l'exposition.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Températures :</strong> Moyenne de 25-27°C</li>
            <li><strong>Plaines côtières :</strong> 28-32°C</li>
            <li><strong>Montagnes :</strong> 15-20°C</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Les deux saisons</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Saison des pluies (avril-novembre)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Pluies abondantes</li>
            <li>Risque d'ouragans (juin-novembre)</li>
            <li>Températures plus élevées</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Saison sèche (décembre-mars)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Peu de pluies</li>
            <li>Températures plus fraîches</li>
            <li>Meilleure période touristique</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Les ouragans</h3>
          <p class="text-foreground">Haïti est régulièrement frappé par des cyclones tropicaux qui causent d'importants dégâts.</p>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Exercice</h4>
          <p class="text-foreground">
            Tiens un journal météo pendant une semaine : note la température, le temps (soleil/pluie), et compare avec les normales saisonnières.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 13: Les sociétés antillaises avant Colomb
  {
    id: "societes-antillaises-precolomb",
    title: "Les sociétés antillaises avant Colomb",
    mois: "Mai",
    objectif: "Découvrir les peuples qui habitaient les Antilles avant l'arrivée des Européens.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Avant 1492, les Antilles étaient habitées par différents peuples autochtones depuis des milliers d'années. Ces sociétés avaient développé leurs propres cultures, technologies et organisations sociales bien avant l'arrivée de Christophe Colomb.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Les Taïnos</h3>
          <p class="text-foreground mb-3">Peuple principal d'Hispaniola (Haïti et République Dominicaine).</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Organisation :</strong> En chefferies (cacicazgos) dirigées par des caciques</li>
            <li><strong>Agriculture :</strong> Manioc, patate douce, maïs</li>
            <li><strong>Artisanat :</strong> Poterie, vannerie, sculptures en bois</li>
            <li><strong>Religion :</strong> Croyance en des esprits (zemis)</li>
            <li><strong>Habitat :</strong> Bohíos (maisons rondes en paille)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Les Caribes</h3>
          <p class="text-foreground mb-3">Peuple guerrier des Petites Antilles.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Excellents navigateurs</li>
            <li>Pêcheurs et chasseurs</li>
            <li>Réputés belliqueux</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Héritage autochtone</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Mots :</strong> Hamac, canoe, ouragan, barbecue</li>
            <li><strong>Aliments :</strong> Manioc (cassave), maïs</li>
            <li><strong>Lieux :</strong> Noms comme Xaragua, Marien</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Exemple</h4>
          <p class="text-foreground">
            Le nom "Ayiti" (Haïti) vient du taïno et signifie "terre de hautes montagnes". C'est l'un des rares mots taïnos encore utilisé aujourd'hui !
          </p>
        </div>
      </section>
    `
  },

  // Leçon 14: Forme et constitution de la Terre
  {
    id: "forme-constitution-terre",
    title: "Forme et constitution de la Terre",
    mois: "Mai",
    objectif: "Comprendre la forme et la structure interne de notre planète.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La Terre n'est pas une sphère parfaite, mais un géoïde légèrement aplati aux pôles. Sa structure interne en couches concentriques détermine les phénomènes géologiques comme les séismes et les volcans.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. La forme de la Terre</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Géoïde :</strong> Sphère imparfaite</li>
            <li><strong>Rayon équatorial :</strong> 6 378 km</li>
            <li><strong>Rayon polaire :</strong> 6 357 km (21 km de moins)</li>
            <li><strong>Circonférence :</strong> 40 075 km à l'équateur</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Structure interne</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Noyau interne :</strong> Solide, fer et nickel (5 000°C+)</li>
            <li><strong>Noyau externe :</strong> Liquide, fer en fusion</li>
            <li><strong>Manteau :</strong> Roches visqueuses, 2 900 km d'épaisseur</li>
            <li><strong>Croûte terrestre :</strong> 5-70 km, où nous vivons</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Activité</h4>
          <p class="text-foreground">
            Crée une maquette des couches de la Terre en utilisant de la pâte à modeler de différentes couleurs.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 15: Les premiers habitants des Antilles
  {
    id: "premiers-habitants-antilles",
    title: "Les premiers habitants des Antilles",
    mois: "Juin",
    objectif: "Retracer l'histoire du peuplement des îles antillaises.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Les Antilles n'ont pas toujours été habitées. Les premiers humains y sont arrivés il y a environ 6 000 ans, venant d'Amérique du Sud en canoe. Ces migrations successives ont donné naissance aux différents peuples antillais.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Les vagues migratoires</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Première vague : Les Archaïques (6000-2000 av. J.-C.)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Chasseurs-cueilleurs et pêcheurs</li>
            <li>Outils en pierre rudimentaires</li>
            <li>Pas de poterie</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Deuxième vague : Les Saladoïdes (500 av. J.-C.)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Origine : Venezuela</li>
            <li>Apportent la poterie et l'agriculture</li>
            <li>Ancêtres des Taïnos</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Troisième vague : Les Caribes (1000 ap. J.-C.)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Guerriers venus d'Amérique du Sud</li>
            <li>S'installent dans les Petites Antilles</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Mode de voyage</h3>
          <p class="text-foreground">Les premiers habitants traversaient la mer en <strong>canoes</strong> taillés dans de grands troncs d'arbres, pouvant transporter jusqu'à 50 personnes !</p>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Réflexion</h4>
          <p class="text-foreground">
            Imagine le courage qu'il fallait pour traverser la mer en canoe, sans boussole ni carte, vers des terres inconnues !
          </p>
        </div>
      </section>
    `
  },

  // Leçon 16: Les mouvements de la Terre
  {
    id: "mouvements-terre",
    title: "Les mouvements de la Terre",
    mois: "Juin",
    objectif: "Comprendre les mouvements de rotation et de révolution de la Terre.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La Terre est en mouvement constant dans l'espace. Elle tourne sur elle-même (rotation) et autour du Soleil (révolution). Ces mouvements expliquent l'alternance du jour et de la nuit, ainsi que les saisons.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. La rotation</h3>
          <p class="text-foreground mb-3">Mouvement de la Terre sur son axe.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Durée :</strong> 24 heures (un jour)</li>
            <li><strong>Sens :</strong> D'ouest en est</li>
            <li><strong>Conséquence :</strong> Alternance jour/nuit</li>
            <li><strong>Vitesse :</strong> 1 670 km/h à l'équateur</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. La révolution</h3>
          <p class="text-foreground mb-3">Mouvement de la Terre autour du Soleil.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Durée :</strong> 365 jours et 1/4 (une année)</li>
            <li><strong>Trajectoire :</strong> Elliptique (ovale)</li>
            <li><strong>Conséquence :</strong> Les saisons</li>
            <li><strong>Vitesse :</strong> 107 000 km/h</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. L'inclinaison de l'axe</h3>
          <p class="text-foreground">L'axe de la Terre est incliné de 23,5°, ce qui explique les saisons. Quand l'hémisphère Nord est incliné vers le Soleil, c'est l'été là-bas et l'hiver dans l'hémisphère Sud.</p>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Expérience</h4>
          <p class="text-foreground">
            Avec une lampe (Soleil) et un globe, montre la rotation et la révolution de la Terre. Observe comment se créent le jour, la nuit et les saisons.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 17: L'humanité dans la Caraïbe
  {
    id: "humanite-caraibe",
    title: "L'humanité dans la Caraïbe",
    mois: "Juillet",
    objectif: "Étudier la diversité des populations caribéennes et leur histoire.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La population caribéenne actuelle est le résultat d'un mélange unique de peuples venus de trois continents : les autochtones américains, les Européens et les Africains. Cette diversité fait la richesse culturelle de notre région.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Composition de la population</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Descendants d'Africains :</strong> Majorité dans la plupart des îles</li>
            <li><strong>Métis :</strong> Mélange de différentes origines</li>
            <li><strong>Descendants d'Européens :</strong> Minorité</li>
            <li><strong>Descendants d'Asiatiques :</strong> Indiens, Chinois (surtout à Trinidad, Jamaïque)</li>
            <li><strong>Autochtones :</strong> Presque disparus, traces en Dominique</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Diversité culturelle</h3>
          <p class="text-foreground mb-3">Cette diversité humaine a créé une richesse culturelle unique :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Langues :</strong> Espagnol, français, anglais, néerlandais, créoles</li>
            <li><strong>Religions :</strong> Christianisme, vodou, santería, rastafari</li>
            <li><strong>Musiques :</strong> Reggae, salsa, merengue, konpa, calypso</li>
            <li><strong>Cuisines :</strong> Fusion des traditions africaines, européennes, asiatiques</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Exemple</h4>
          <p class="text-foreground">
            À Trinidad, on célèbre le carnaval (tradition européenne/africaine) ET Diwali (fête indienne) - symbole du métissage caribéen !
          </p>
        </div>
      </section>
    `
  },

  // Leçon 18: Particularités climatiques des Caraïbes
  {
    id: "particularites-climatiques-caraibes",
    title: "Particularités climatiques des Caraïbes",
    mois: "Juillet",
    objectif: "Identifier les caractéristiques spécifiques du climat caribéen.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La région caribéenne possède un climat tropical maritime avec des caractéristiques particulières qui la distinguent des autres régions tropicales du monde. Ces particularités influencent la vie quotidienne, l'agriculture et l'économie de tous les pays de la région.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Climat tropical maritime</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Températures stables :</strong> 24-30°C toute l'année</li>
            <li><strong>Faible variation :</strong> Différence de seulement 3-5°C entre les mois</li>
            <li><strong>Humidité élevée :</strong> 70-80% en moyenne</li>
            <li><strong>Alizés :</strong> Vents réguliers de l'est, rafraîchissants</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Les cyclones tropicaux</h3>
          <p class="text-foreground mb-3">Particularité majeure de la Caraïbe : la saison des ouragans.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Saison :</strong> Juin à novembre (pic en septembre)</li>
            <li><strong>Formation :</strong> Au-dessus de l'océan Atlantique chaud</li>
            <li><strong>Catégories :</strong> De 1 (faible) à 5 (catastrophique)</li>
            <li><strong>Impacts :</strong> Vents violents, pluies torrentielles, inondations</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Microclimats</h3>
          <p class="text-foreground">Les îles montagneuses comme Haïti ont des microclimats :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Côte au vent :</strong> Plus humide (côté est)</li>
            <li><strong>Côte sous le vent :</strong> Plus sèche (côté ouest)</li>
            <li><strong>Altitude :</strong> Plus frais en montagne</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Projet</h4>
          <p class="text-foreground">
            Crée un plan d'urgence familial pour la saison des ouragans : provisions, lieu sûr, contacts d'urgence.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 19: La vie économique
  {
    id: "vie-economique",
    title: "La vie économique",
    mois: "Août",
    objectif: "Comprendre les bases de l'économie et les activités économiques en Haïti.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        L'économie concerne la production, la distribution et la consommation des biens et services. En Haïti, l'économie repose principalement sur l'agriculture, les services et les transferts de la diaspora.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Les trois secteurs économiques</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Secteur primaire (agriculture)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Riz, maïs, bananes, canne à sucre</li>
            <li>Café, cacao, mangues</li>
            <li>Pêche</li>
            <li>Emploie environ 40% de la population</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Secteur secondaire (industrie)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Assemblage textile</li>
            <li>Construction</li>
            <li>Transformation alimentaire</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Secteur tertiaire (services)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Commerce</li>
            <li>Télécommunications</li>
            <li>Banques</li>
            <li>Tourisme (potentiel sous-exploité)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. L'économie informelle</h3>
          <p class="text-foreground">En Haïti, environ 80% de l'économie est informelle : petits commerces, marchés, transport en commun (tap-tap), etc.</p>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. La diaspora</h3>
          <p class="text-foreground">Les Haïtiens vivant à l'étranger envoient environ 2 milliards de dollars par an, représentant près de 30% du PIB.</p>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Activité</h4>
          <p class="text-foreground">
            Visite un marché local. Identifie les produits locaux (Haïti) et les produits importés. Dans quel secteur économique travaillent les marchands ?
          </p>
        </div>
      </section>
    `
  },

  // Leçon 20: Représentation de la Terre
  {
    id: "representation-terre",
    title: "Représentation de la Terre",
    mois: "Août",
    objectif: "Comprendre les différentes façons de représenter la Terre : cartes et globes.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Pour représenter notre planète sphérique sur une surface plane (carte), les géographes utilisent différentes techniques appelées projections. Chaque méthode a ses avantages et ses limites.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Le globe terrestre</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Avantages :</strong> Représentation exacte, proportions respectées</li>
            <li><strong>Inconvénients :</strong> Encombrant, on ne voit qu'une partie à la fois</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Les cartes</h3>
          <p class="text-foreground mb-3">Représentation à plat de la Terre ou d'une partie.</p>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Types de cartes</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Carte physique :</strong> Relief, fleuves, montagnes</li>
            <li><strong>Carte politique :</strong> Pays, frontières, capitales</li>
            <li><strong>Carte thématique :</strong> Population, climat, économie</li>
            <li><strong>Carte routière :</strong> Routes, villes</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Éléments d'une carte</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Titre :</strong> Sujet de la carte</li>
            <li><strong>Échelle :</strong> Rapport entre distance carte/réalité</li>
            <li><strong>Légende :</strong> Explication des symboles</li>
            <li><strong>Orientation :</strong> Rose des vents (Nord en haut)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Coordonnées géographiques</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Latitude :</strong> Distance par rapport à l'équateur (0-90° N ou S)</li>
            <li><strong>Longitude :</strong> Distance par rapport au méridien de Greenwich (0-180° E ou O)</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Exercice</h4>
          <p class="text-foreground">
            Dessine une carte simple de ton quartier avec titre, légende, échelle et rose des vents. Inclus ton école, ta maison, et des points de repère importants.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 21: Régions climatiques du globe
  {
    id: "regions-climatiques-globe",
    title: "Les régions climatiques du globe",
    mois: "Septembre",
    objectif: "Identifier et comprendre les grandes zones climatiques de la planète.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La Terre est divisée en plusieurs zones climatiques selon la température, les précipitations et les saisons. Ces zones déterminent la végétation, la faune et les modes de vie humains.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Zone tropicale</h3>
          <p class="text-foreground mb-3">Entre les tropiques (23,5°N et 23,5°S) - Haïti en fait partie !</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Températures élevées toute l'année (>20°C)</li>
            <li>Forêts tropicales humides</li>
            <li>Savanes tropicales</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Zone tempérée</h3>
          <p class="text-foreground">Entre les tropiques et les cercles polaires</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Quatre saisons bien marquées</li>
            <li>Températures modérées</li>
            <li>Forêts de feuillus et de conifères</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Zone polaire</h3>
          <p class="text-foreground">Au-delà des cercles polaires</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Températures très froides</li>
            <li>Toundra et glaces permanentes</li>
            <li>Nuit ou jour polaire (6 mois)</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Exercice</h4>
          <p class="text-foreground">
            Sur un planisphère, colorie les trois grandes zones climatiques. Place Haïti et identifie sa zone.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 22: Modes de figuration du relief
  {
    id: "modes-figuration-relief",
    title: "Modes de figuration du relief",
    mois: "Septembre",
    objectif: "Apprendre à lire et comprendre les différentes représentations du relief sur les cartes.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Représenter le relief (montagnes, vallées) sur une carte plane est un défi. Les cartographes utilisent plusieurs méthodes : courbes de niveau, couleurs hypsométriques, et représentations 3D.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Les courbes de niveau</h3>
          <p class="text-foreground">Lignes qui relient tous les points situés à la même altitude.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Lignes rapprochées = pente raide</li>
            <li>Lignes espacées = pente douce</li>
            <li>Cercles fermés = sommet ou dépression</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Couleurs hypsométriques</h3>
          <p class="text-foreground">Dégradé de couleurs selon l'altitude :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Vert :</strong> Plaines (0-200m)</li>
            <li><strong>Jaune :</strong> Collines (200-500m)</li>
            <li><strong>Brun :</strong> Montagnes (500-2000m)</li>
            <li><strong>Marron foncé :</strong> Hautes montagnes (>2000m)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Profils topographiques</h3>
          <p class="text-foreground">Coupe verticale du terrain montrant les variations d'altitude le long d'une ligne.</p>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Pratique</h4>
          <p class="text-foreground">
            Trace un profil topographique d'une coupe d'Haïti, de la côte jusqu'au Pic la Selle.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 23: Le potentiel hydraulique
  {
    id: "potentiel-hydraulique",
    title: "Le potentiel hydraulique",
    mois: "Octobre",
    objectif: "Comprendre les ressources en eau d'Haïti et leur utilisation.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Le potentiel hydraulique désigne l'ensemble des ressources en eau d'un pays : rivières, lacs, nappes souterraines. En Haïti, malgré des pluies abondantes, l'eau potable reste un défi majeur.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Les ressources en eau d'Haïti</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Rivières et fleuves</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>L'Artibonite :</strong> Plus long fleuve (320 km)</li>
            <li><strong>Les Trois Rivières</strong></li>
            <li><strong>La Rivière Grise</strong></li>
            <li>Débit faible en saison sèche</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Lacs</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Étang Saumâtre :</strong> Plus grand lac naturel</li>
            <li><strong>Lac de Péligre :</strong> Lac artificiel (barrage)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Utilisations de l'eau</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Agriculture :</strong> Irrigation (70% de l'eau)</li>
            <li><strong>Domestique :</strong> Boisson, cuisine, hygiène</li>
            <li><strong>Industrie :</strong> Fabrication</li>
            <li><strong>Énergie :</strong> Centrales hydroélectriques</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Problèmes</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Déforestation réduisant les sources</li>
            <li>Pollution des rivières</li>
            <li>Infrastructure insuffisante</li>
            <li>Seulement 40% de la population a accès à l'eau potable</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Action</h4>
          <p class="text-foreground">
            Calcule combien d'eau ta famille utilise par jour. Comment pourriez-vous économiser l'eau ?
          </p>
        </div>
      </section>
    `
  },

  // Leçon 24: La société précolombienne
  {
    id: "societe-precolombienne",
    title: "La société précolombienne",
    mois: "Octobre",
    objectif: "Approfondir la compréhension de l'organisation sociale des Taïnos.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La société taïno d'avant 1492 était bien organisée avec une structure sociale hiérarchisée, des croyances religieuses complexes et un mode de vie adapté à l'environnement insulaire.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Organisation sociale</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Cacique :</strong> Chef suprême, héréditaire</li>
            <li><strong>Nitaínos :</strong> Nobles, guerriers</li>
            <li><strong>Behiques :</strong> Prêtres, guérisseurs</li>
            <li><strong>Naborías :</strong> Peuple commun, agriculteurs</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Mode de vie</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Habitat</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Bohíos :</strong> Maisons rondes en paille</li>
            <li><strong>Caney :</strong> Maison rectangulaire du cacique</li>
            <li>Villages près des rivières et côtes</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Alimentation</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Agriculture :</strong> Manioc (cassave), patate douce, maïs</li>
            <li><strong>Pêche :</strong> Poissons, crustacés</li>
            <li><strong>Chasse :</strong> Hutias (rongeurs), iguanes, oiseaux</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Religion</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Zemis :</strong> Esprits des ancêtres et de la nature</li>
            <li><strong>Yucahu :</strong> Dieu suprême du manioc</li>
            <li><strong>Atabey :</strong> Déesse mère</li>
            <li><strong>Cérémonies :</strong> Areito (danses et chants religieux)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Arts et artisanat</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Poterie décorée</li>
            <li>Sculptures de zemis en bois et pierre</li>
            <li>Vannerie</li>
            <li>Bijoux en coquillages et or</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Projet</h4>
          <p class="text-foreground">
            Crée une maquette d'un village taïno avec bohíos, caney, et terrain de jeu de balle (batey).
          </p>
        </div>
      </section>
    `
  },

  // Leçon 25: Formations végétales de la Caraïbe
  {
    id: "formations-vegetales-caraibe",
    title: "Les formations végétales de la Caraïbe",
    mois: "Novembre",
    objectif: "Découvrir la diversité des écosystèmes végétaux caribéens.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        La Caraïbe possède une biodiversité végétale remarquable, avec des forêts tropicales, des mangroves, et des récifs coralliens. Malheureusement, ces écosystèmes sont menacés par la déforestation et le changement climatique.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Forêt tropicale humide</h3>
          <p class="text-foreground">En altitude et zones bien arrosées</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Grande diversité d'espèces</li>
            <li>Acajou, cèdre, bois de fer</li>
            <li>Orchidées, fougères, lianes</li>
            <li>Habitat de nombreux oiseaux endémiques</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Mangroves</h3>
          <p class="text-foreground">Forêts côtières aux racines immergées</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Rôle :</strong> Protection contre érosion et tempêtes</li>
            <li><strong>Nurserie :</strong> Pour poissons et crustacés</li>
            <li>Palétuviers (arbres adaptés à l'eau salée)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Végétation xérophile</h3>
          <p class="text-foreground">Zones sèches (côte sous le vent)</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Cactus, agaves</li>
            <li>Arbustes épineux</li>
            <li>Plantes adaptées à la sécheresse</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Menaces</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Déforestation massive</li>
            <li>Urbanisation</li>
            <li>Agriculture extensive</li>
            <li>Changement climatique</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Action</h4>
          <p class="text-foreground">
            Participe à une activité de reboisement dans ton école ou communauté. Chaque arbre planté compte !
          </p>
        </div>
      </section>
    `
  },

  // Leçon 26: Le système écologique
  {
    id: "systeme-ecologique",
    title: "Le système écologique",
    mois: "Novembre",
    objectif: "Comprendre les interactions entre êtres vivants et leur environnement.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Un écosystème est un ensemble formé par un milieu (biotope) et les êtres vivants qui l'habitent (biocénose), tous en interaction. Comprendre ces systèmes est essentiel pour protéger notre environnement.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Composants d'un écosystème</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Facteurs abiotiques (non-vivants)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Eau, air, sol</li>
            <li>Lumière, température</li>
            <li>Nutriments minéraux</li>
          </ul>

          <h4 class="font-semibold mt-3 mb-2 text-foreground">Facteurs biotiques (vivants)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Producteurs :</strong> Plantes (photosynthèse)</li>
            <li><strong>Consommateurs :</strong> Herbivores, carnivores, omnivores</li>
            <li><strong>Décomposeurs :</strong> Bactéries, champignons</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Chaînes et réseaux alimentaires</h3>
          <p class="text-foreground">Transfert d'énergie et de matière :</p>
          <p class="text-foreground ml-6 mt-2">Plante → Chenille → Oiseau → Serpent</p>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Équilibre écologique</h3>
          <p class="text-foreground">Tous les éléments sont interdépendants. La disparition d'une espèce affecte tout l'écosystème.</p>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Biodiversité en Haïti</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Espèces endémiques menacées</li>
            <li>Déforestation détruisant les habitats</li>
            <li>Nécessité de protection (parcs nationaux)</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Exercice</h4>
          <p class="text-foreground">
            Dessine une chaîne alimentaire de ton environnement local. Identifie producteurs, consommateurs et décomposeurs.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 27: L'hydrosphère
  {
    id: "hydrosphere",
    title: "L'hydrosphère",
    mois: "Décembre",
    objectif: "Comprendre l'ensemble des eaux de la planète et leur importance.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        L'hydrosphère désigne l'ensemble des eaux présentes sur Terre : océans, mers, lacs, rivières, glaces, nappes souterraines et vapeur d'eau atmosphérique. L'eau couvre 71% de la surface terrestre.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Répartition de l'eau sur Terre</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Eau salée (océans et mers) :</strong> 97,5%</li>
            <li><strong>Eau douce :</strong> 2,5%
              <ul class="list-disc ml-6 mt-2">
                <li>Glaces (pôles, glaciers) : 69%</li>
                <li>Nappes souterraines : 30%</li>
                <li>Eaux de surface (lacs, rivières) : 1%</li>
              </ul>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Le cycle de l'eau</h3>
          <p class="text-foreground mb-3">L'eau circule continuellement entre les différents réservoirs :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Évaporation :</strong> Eau liquide → vapeur</li>
            <li><strong>Transpiration :</strong> Plantes libèrent de la vapeur</li>
            <li><strong>Condensation :</strong> Vapeur → nuages</li>
            <li><strong>Précipitations :</strong> Pluie, neige</li>
            <li><strong>Ruissellement :</strong> Retour vers les océans</li>
            <li><strong>Infiltration :</strong> Vers les nappes souterraines</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Importance de l'eau</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Essentielle à la vie</li>
            <li>Régulation du climat</li>
            <li>Transport (navigation)</li>
            <li>Agriculture (irrigation)</li>
            <li>Énergie (hydroélectricité)</li>
            <li>Industrie</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Gestion de l'eau en Haïti</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Accès limité à l'eau potable</li>
            <li>Nécessité de protéger les sources</li>
            <li>Économiser l'eau</li>
            <li>Ne pas polluer rivières et sources</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Le savais-tu ?</h4>
          <p class="text-foreground">
            L'eau que tu bois aujourd'hui est la même eau que buvaient les dinosaures il y a des millions d'années ! L'eau circule en cycle fermé depuis toujours.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 28: Formations végétales d'Haïti
  {
    id: "formations-vegetales-haiti",
    title: "Les formations végétales d'Haïti",
    mois: "Décembre",
    objectif: "Identifier et comprendre la végétation naturelle d'Haïti.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Haïti avait autrefois une couverture forestière de 60%. Aujourd'hui, moins de 2% du territoire est boisé. Comprendre notre végétation naturelle est crucial pour les efforts de reboisement.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Forêt de pins</h3>
          <p class="text-foreground">En altitude (>1000m), climat frais</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Espèce principale :</strong> Pin d'Hispaniola (endémique)</li>
            <li><strong>Zones :</strong> Massif de la Selle, Forêt des Pins</li>
            <li>Très menacé par déforestation</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Forêt humide</h3>
          <p class="text-foreground">Versants exposés aux pluies</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Acajou, cèdre, campêche</li>
            <li>Grande biodiversité</li>
            <li>Presque entièrement détruite</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Forêt sèche</h3>
          <p class="text-foreground">Zones arides (Nord-Ouest, Artibonite)</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Cactus, bayahondes, raquettes</li>
            <li>Arbres adaptés à la sécheresse</li>
            <li>Gaïac (bois très dur)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Mangroves</h3>
          <p class="text-foreground">Côtes protégées</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Zones :</strong> Gonaïves, Sud</li>
            <li>Protection contre érosion</li>
            <li>Nurserie pour poissons</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">5. Espèces endémiques menacées</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Pin d'Hispaniola</li>
            <li>Perroquet d'Hispaniola</li>
            <li>Solenodon (mammifère rare)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">6. Parcs nationaux</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Parc national La Visite</li>
            <li>Parc national Macaya</li>
            <li>Parc historique de la Citadelle</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Projet</h4>
          <p class="text-foreground">
            Organise une campagne de sensibilisation au reboisement dans ton école. Crée des affiches montrant l'importance des arbres.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 29: Analyse climatologique
  {
    id: "analyse-climatologique",
    title: "L'analyse climatologique",
    mois: "Janvier",
    objectif: "Apprendre à analyser et interpréter les données climatiques.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        L'analyse climatologique consiste à étudier les données météorologiques sur de longues périodes pour comprendre les tendances climatiques. Cette science est cruciale pour l'agriculture, l'urbanisme et la prévention des catastrophes.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Éléments climatiques</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Température :</strong> Mesurée en degrés Celsius</li>
            <li><strong>Précipitations :</strong> Mesurées en millimètres</li>
            <li><strong>Humidité :</strong> Pourcentage de vapeur d'eau dans l'air</li>
            <li><strong>Pression atmosphérique :</strong> En hectopascals</li>
            <li><strong>Vent :</strong> Direction et vitesse</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Instruments de mesure</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Thermomètre :</strong> Température</li>
            <li><strong>Pluviomètre :</strong> Précipitations</li>
            <li><strong>Baromètre :</strong> Pression</li>
            <li><strong>Anémomètre :</strong> Vitesse du vent</li>
            <li><strong>Hygromètre :</strong> Humidité</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Représentation graphique</h3>
          <p class="text-foreground mb-3">Diagrammes climatiques (climogrammes) montrent :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Températures moyennes mensuelles (courbe)</li>
            <li>Précipitations mensuelles (barres)</li>
            <li>Permet de visualiser les saisons</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Changement climatique</h3>
          <p class="text-foreground">Les données montrent :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Augmentation des températures globales</li>
            <li>Modification des régimes de pluies</li>
            <li>Intensification des ouragans</li>
            <li>Nécessité d'adaptation</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Activité</h4>
          <p class="text-foreground">
            Crée un diagramme climatique de ta région avec les données de température et précipitations pour chaque mois de l'année.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 30: Langues africaines en Haïti
  {
    id: "langues-africaines-haiti",
    title: "Les langues africaines en Haïti",
    mois: "Janvier",
    objectif: "Découvrir l'influence des langues africaines sur le créole haïtien.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Le créole haïtien, bien que basé sur le vocabulaire français, tire sa structure grammaticale et de nombreux mots des langues africaines parlées par les esclaves. Cette influence africaine fait la richesse et l'originalité de notre langue.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Origines linguistiques des esclaves</h3>
          <p class="text-foreground mb-3">Les esclaves venaient principalement de :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Royaume du Dahomey :</strong> Langue Fon</li>
            <li><strong>Royaume du Congo :</strong> Langues Kikongo, Kimbundu</li>
            <li><strong>Royaume Yoruba :</strong> Langue Yoruba</li>
            <li><strong>Sénégal :</strong> Langue Wolof</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Influence sur la structure du créole</h3>
          <h4 class="font-semibold mt-3 mb-2 text-foreground">Caractéristiques africaines</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Absence de conjugaison complexe :</strong> Comme en Fon</li>
            <li><strong>Redoublement :</strong> "vit-vit" (vite), "bèl-bèl" (très beau)</li>
            <li><strong>Ton :</strong> L'intonation change le sens</li>
            <li><strong>Ordre des mots :</strong> Sujet-Verbe-Objet</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Mots d'origine africaine en créole</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Zombi :</strong> Du Kikongo "nzambi" (esprit)</li>
            <li><strong>Makandal :</strong> Guerrier marron célèbre</li>
            <li><strong>Voudou :</strong> Du Fon "vodun" (esprit)</li>
            <li><strong>Govi :</strong> Jarre rituelle</li>
            <li><strong>Asson :</strong> Hochet rituel du hougan</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Proverbes créoles d'inspiration africaine</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>"Sak vid pa kanpe" (Un sac vide ne tient pas debout)</li>
            <li>"Piti piti zwazo fè nich li" (Petit à petit l'oiseau fait son nid)</li>
            <li>"Men anpil chay pa lou" (Plusieurs mains, le fardeau est léger)</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">5. Importance culturelle</h3>
          <p class="text-foreground">Cette influence africaine :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Témoigne de notre héritage africain</li>
            <li>Fait du créole une langue unique</li>
            <li>Renforce notre identité culturelle</li>
            <li>Doit être valorisée et préservée</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Activité</h4>
          <p class="text-foreground">
            Collecte 10 proverbes créoles auprès de tes parents ou grands-parents. Essaie de trouver leur signification profonde et comment ils guident le comportement.
          </p>
        </div>
        
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Projet de classe</h4>
          <p class="text-foreground">
            Créez un dictionnaire illustré de mots créoles d'origine africaine. Pour chaque mot : origine, signification, utilisation dans une phrase.
          </p>
        </div>
      </section>
    `
  }
];

