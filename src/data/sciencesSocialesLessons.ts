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
      <div class="space-y-4">
        <p>Haïti occupe la partie occidentale de l'île d'Hispaniola, la deuxième plus grande île des Grandes Antilles. Avec une superficie de 27 750 km², notre pays présente une diversité géographique remarquable qui influence profondément la vie de ses habitants.</p>
        <p>Des montagnes majestueuses aux plaines fertiles, des côtes paradisiaques aux vallées verdoyantes, l'espace géographique haïtien est d'une richesse extraordinaire. Cette géographie particulière a façonné notre histoire, notre économie et notre culture.</p>
        <p>Découvrir notre espace géographique, c'est mieux comprendre notre pays et les défis auxquels nous faisons face.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. Situation géographique</h3>
          <p>Haïti est situé dans la mer des Caraïbes, entre Cuba au nord-ouest et la Jamaïque au sud-ouest. Notre pays partage l'île d'Hispaniola avec la République Dominicaine à l'est.</p>
          <p><strong>Coordonnées géographiques :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Latitude : Entre 18° et 20° Nord</li>
            <li>Longitude : Entre 71° et 74° Ouest</li>
            <li>Superficie : 27 750 km²</li>
            <li>Frontière terrestre avec la République Dominicaine : 376 km</li>
            <li>Côtes maritimes : Environ 1 771 km</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. Le relief haïtien</h3>
          <p>Haïti est un pays essentiellement montagneux. Environ 75% du territoire est constitué de montagnes et de collines. Cette topographie accidentée influence grandement l'agriculture, les communications et l'habitat.</p>
          <p><strong>Principales chaînes de montagnes :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Massif du Nord :</strong> Culmine au Pic la Selle (2 680 m), le point le plus haut d'Haïti</li>
            <li><strong>Chaîne des Matheux :</strong> S'étend dans le département de l'Artibonite</li>
            <li><strong>Massif de la Hotte :</strong> Dans le Sud, comprend le Pic Macaya (2 347 m)</li>
            <li><strong>Montagnes Noires :</strong> Dans l'Artibonite</li>
          </ul>
          <p><strong>Principales plaines :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Plaine du Nord :</strong> Région agricole fertile (canne à sucre, bananes)</li>
            <li><strong>Plaine de l'Artibonite :</strong> Le grenier d'Haïti (riz, maïs)</li>
            <li><strong>Plaine du Cul-de-Sac :</strong> Où se trouve Port-au-Prince</li>
            <li><strong>Plaine des Cayes :</strong> Dans le Sud, fertile et agricole</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. L'hydrographie</h3>
          <p>Haïti possède plusieurs cours d'eau, bien que la plupart soient de faible débit pendant la saison sèche.</p>
          <p><strong>Principaux fleuves et rivières :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>L'Artibonite :</strong> Le plus long fleuve (320 km), prend sa source en République Dominicaine</li>
            <li><strong>Les Trois Rivières :</strong> Important dans le Nord</li>
            <li><strong>La Grande Rivière du Nord</strong></li>
            <li><strong>La Rivière Grise :</strong> Alimente Port-au-Prince</li>
          </ul>
          <p><strong>Lacs importants :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Étang Saumâtre :</strong> Le plus grand lac naturel d'Haïti</li>
            <li><strong>Lac de Péligre :</strong> Lac artificiel créé par un barrage sur l'Artibonite</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. Les côtes et les îles</h3>
          <p>Haïti possède un littoral varié avec de nombreuses baies, presqu'îles et îles adjacentes.</p>
          <p><strong>Principales baies :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Baie de Port-au-Prince</li>
            <li>Golfe de la Gonâve</li>
            <li>Baie des Gonaïves</li>
            <li>Baie d'Acul</li>
            <li>Baie de Fort-Liberté</li>
          </ul>
          <p><strong>Îles principales :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>La Gonâve :</strong> La plus grande île (689 km²)</li>
            <li><strong>Île de la Tortue :</strong> Célèbre dans l'histoire de la piraterie</li>
            <li><strong>Île à Vache :</strong> Destination touristique au sud</li>
            <li><strong>Cayemittes :</strong> Groupe d'îlots au sud</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Les divisions administratives</h3>
          <p>Haïti est divisé en <strong>10 départements</strong> géographiques :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Ouest</strong> - Capitale : Port-au-Prince</li>
            <li><strong>Sud-Est</strong> - Capitale : Jacmel</li>
            <li><strong>Nord</strong> - Capitale : Cap-Haïtien</li>
            <li><strong>Nord-Est</strong> - Capitale : Fort-Liberté</li>
            <li><strong>Artibonite</strong> - Capitale : Gonaïves</li>
            <li><strong>Centre</strong> - Capitale : Hinche</li>
            <li><strong>Sud</strong> - Capitale : Les Cayes</li>
            <li><strong>Grande Anse</strong> - Capitale : Jérémie</li>
            <li><strong>Nord-Ouest</strong> - Capitale : Port-de-Paix</li>
            <li><strong>Nippes</strong> - Capitale : Miragoâne</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. Défis géographiques</h3>
          <p>La géographie d'Haïti présente certains défis :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Déforestation :</strong> Moins de 2% de couverture forestière originelle reste</li>
            <li><strong>Érosion des sols :</strong> Causée par le relief montagneux et la déforestation</li>
            <li><strong>Risques sismiques :</strong> Haïti se trouve sur une faille tectonique active</li>
            <li><strong>Vulnérabilité aux ouragans :</strong> Position dans la trajectoire des cyclones caribéens</li>
            <li><strong>Accès difficile :</strong> Le relief complique les communications et le transport</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> La plaine de l'Artibonite, grâce à son irrigation, produit plus de 80% du riz consommé en Haïti. C'est une illustration de l'importance des plaines dans l'économie agricole.</p>
            <p><strong>Exemple 2 :</strong> Le Pic la Selle, point culminant d'Haïti à 2 680 m, abrite une biodiversité unique avec des espèces endémiques d'oiseaux et de plantes.</p>
            <p><strong>Exemple 3 :</strong> L'île de la Gonâve, bien que proche de Port-au-Prince, reste difficile d'accès et moins développée en raison de son isolement géographique.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Questions à choix multiples</p>
              <p>a) Le point culminant d'Haïti est :</p>
              <ul class="ml-6 list-disc">
                <li>Le Morne-à-Cabrit</li>
                <li>Le Pic la Selle ✓</li>
                <li>Le Pic Macaya</li>
              </ul>
              <p>b) Le plus long fleuve d'Haïti est :</p>
              <ul class="ml-6 list-disc">
                <li>La Rivière Grise</li>
                <li>L'Artibonite ✓</li>
                <li>Les Trois Rivières</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Vrai ou Faux</p>
              <ul class="ml-6 space-y-2">
                <li>Haïti est un pays essentiellement plat. (Faux)</li>
                <li>La Gonâve est la plus grande île haïtienne. (Vrai)</li>
                <li>Haïti possède 10 départements géographiques. (Vrai)</li>
                <li>Plus de 50% du territoire est couvert de forêts. (Faux)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">3. Questions de réflexion</p>
              <ul class="ml-6 space-y-2">
                <li>Comment le relief montagneux d'Haïti influence-t-il l'agriculture et les communications ?</li>
                <li>Pourquoi la plaine de l'Artibonite est-elle surnommée "le grenier d'Haïti" ?</li>
                <li>Quels sont les avantages et les inconvénients de notre position géographique dans la Caraïbe ?</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">4. Activité pratique</p>
              <p>Dessinez une carte simplifiée d'Haïti en y plaçant :</p>
              <ul class="ml-6 list-disc">
                <li>Les 10 départements et leurs capitales</li>
                <li>Le Pic la Selle</li>
                <li>L'Artibonite (fleuve)</li>
                <li>La Gonâve</li>
                <li>Les pays voisins (République Dominicaine, Cuba, Jamaïque)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">5. Recherche</p>
              <p>Interrogez vos parents ou grands-parents sur le département d'où vient votre famille. Quelles sont les particularités géographiques de cette région ?</p>
            </div>
          </div>
        </section>
      </div>
    `
  },
  {
    id: "terre-humanisation",
    title: "La terre et les problèmes de son humanisation",
    mois: "Décembre",
    objectif: "Étudier la place et le fonctionnement de la planète terre dans l'univers.",
    introduction: `
      <div class="space-y-4">
        <p>La Terre est notre maison dans l'immensité de l'univers. Cette planète bleue, la troisième à partir du Soleil, est le seul endroit connu où la vie existe. Mais comment fonctionne notre planète ? Quelle est sa place dans l'univers ? Et comment les humains l'ont-ils transformée ?</p>
        <p>L'humanisation de la Terre désigne le processus par lequel les êtres humains ont modifié l'environnement naturel pour répondre à leurs besoins : construction de villes, agriculture, industries, routes... Ces transformations ont permis le développement de nos sociétés, mais elles posent aussi des défis environnementaux importants.</p>
        <p>Comprendre notre planète et notre impact sur elle est essentiel pour construire un avenir durable.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. La Terre dans l'univers</h3>
          <p>La Terre fait partie du système solaire, qui lui-même appartient à la galaxie de la Voie lactée, une galaxie parmi des milliards dans l'univers.</p>
          <p><strong>Caractéristiques de la Terre :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Forme :</strong> Sphéroïde (légèrement aplatie aux pôles)</li>
            <li><strong>Diamètre :</strong> Environ 12 742 km à l'équateur</li>
            <li><strong>Circonférence :</strong> Environ 40 075 km à l'équateur</li>
            <li><strong>Distance du Soleil :</strong> Environ 150 millions de km</li>
            <li><strong>Âge :</strong> Environ 4,5 milliards d'années</li>
            <li><strong>Satellite naturel :</strong> La Lune</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. La structure de la Terre</h3>
          <p>La Terre est composée de plusieurs couches concentriques :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Le noyau interne :</strong> Solide, composé principalement de fer et de nickel, température extrême (plus de 5 000°C)</li>
            <li><strong>Le noyau externe :</strong> Liquide, également composé de fer et de nickel</li>
            <li><strong>Le manteau :</strong> Couche épaisse de roches en fusion (magma)</li>
            <li><strong>La croûte terrestre :</strong> Couche externe solide sur laquelle nous vivons (5 à 70 km d'épaisseur)</li>
          </ul>
          <p>La croûte terrestre est divisée en <strong>plaques tectoniques</strong> qui flottent sur le manteau et se déplacent lentement, causant des tremblements de terre et des éruptions volcaniques.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. Les enveloppes de la Terre</h3>
          <p>Notre planète est entourée de plusieurs "enveloppes" qui rendent la vie possible :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>L'atmosphère :</strong> Couche de gaz qui entoure la Terre, nous protège des rayons solaires nocifs et maintient une température vivable</li>
            <li><strong>L'hydrosphère :</strong> Ensemble des eaux de la planète (océans, mers, lacs, rivières, glaces) - couvre 71% de la surface</li>
            <li><strong>La lithosphère :</strong> Partie solide de la Terre (croûte et partie supérieure du manteau)</li>
            <li><strong>La biosphère :</strong> Zone où se trouve la vie (plantes, animaux, micro-organismes)</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. L'humanisation de la Terre</h3>
          <p>L'humanisation désigne l'ensemble des transformations que les humains ont apportées à la surface terrestre. Ce processus a commencé il y a des milliers d'années et s'est intensifié avec le temps.</p>
          <p><strong>Principales formes d'humanisation :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>L'agriculture :</strong> Transformation des forêts et prairies en terres cultivées</li>
            <li><strong>L'urbanisation :</strong> Construction de villes et d'infrastructures</li>
            <li><strong>L'industrialisation :</strong> Développement d'usines, de mines, d'extraction de ressources</li>
            <li><strong>Les voies de communication :</strong> Routes, ponts, tunnels, aéroports</li>
            <li><strong>Les barrages et canaux :</strong> Contrôle et détournement des cours d'eau</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Les problèmes liés à l'humanisation</h3>
          <p>L'humanisation de la Terre, bien que nécessaire au développement humain, crée plusieurs problèmes environnementaux majeurs :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>La déforestation :</strong> Disparition des forêts, perte de biodiversité, érosion des sols
              <p class="text-sm mt-1"><em>En Haïti, la couverture forestière est passée de 60% à moins de 2% en deux siècles.</em></p>
            </li>
            <li><strong>La pollution :</strong> Contamination de l'air, de l'eau et des sols par les activités humaines</li>
            <li><strong>Le changement climatique :</strong> Réchauffement global causé par les émissions de gaz à effet de serre</li>
            <li><strong>L'épuisement des ressources :</strong> Surexploitation des ressources naturelles non renouvelables</li>
            <li><strong>La perte de biodiversité :</strong> Extinction d'espèces animales et végétales</li>
            <li><strong>L'érosion :</strong> Dégradation des sols, particulièrement grave en Haïti</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. Vers un développement durable</h3>
          <p>Face à ces défis, l'humanité doit trouver un équilibre entre développement et préservation de l'environnement. C'est le principe du <strong>développement durable</strong> : répondre aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs.</p>
          <p><strong>Actions nécessaires :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Reboisement et protection des forêts</li>
            <li>Utilisation d'énergies renouvelables (solaire, éolienne)</li>
            <li>Réduction de la pollution et du gaspillage</li>
            <li>Agriculture durable respectant les sols</li>
            <li>Éducation environnementale</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> Haïti se trouve sur la frontière de deux plaques tectoniques, ce qui explique les tremblements de terre comme celui de 2010. Comprendre la structure de la Terre nous aide à mieux nous préparer.</p>
            <p><strong>Exemple 2 :</strong> La déforestation en Haïti a causé une érosion massive. Lors de fortes pluies, les sols dénudés glissent, provoquant des inondations et des coulées de boue meurtrières.</p>
            <p><strong>Exemple 3 :</strong> Le parc national de La Visite représente un effort de préservation d'un écosystème de pins endémiques, montrant qu'il est possible de protéger notre environnement.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Questions à choix multiples</p>
              <p>a) Quelle est la couche la plus externe de la Terre ?</p>
              <ul class="ml-6 list-disc">
                <li>Le noyau</li>
                <li>Le manteau</li>
                <li>La croûte terrestre ✓</li>
              </ul>
              <p>b) Quel pourcentage de la surface terrestre est couvert d'eau ?</p>
              <ul class="ml-6 list-disc">
                <li>50%</li>
                <li>71% ✓</li>
                <li>90%</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Vrai ou Faux</p>
              <ul class="ml-6 space-y-2">
                <li>La Terre est parfaitement sphérique. (Faux - elle est légèrement aplatie aux pôles)</li>
                <li>L'atmosphère protège la Terre des rayons solaires nocifs. (Vrai)</li>
                <li>L'humanisation n'a aucun impact négatif sur l'environnement. (Faux)</li>
                <li>Haïti a perdu la majeure partie de sa couverture forestière. (Vrai)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">3. Questions de réflexion</p>
              <ul class="ml-6 space-y-2">
                <li>Pourquoi la Terre est-elle la seule planète connue où la vie existe ?</li>
                <li>Quels sont les avantages et les inconvénients de l'urbanisation ?</li>
                <li>Comment peut-on concilier développement économique et protection de l'environnement en Haïti ?</li>
                <li>Que signifie "développement durable" pour toi ?</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">4. Activité pratique</p>
              <p><strong>Projet :</strong> Identifiez dans votre quartier ou votre ville trois exemples d'humanisation (routes, bâtiments, cultures) et trois problèmes environnementaux (déchets, érosion, pollution). Proposez une solution pour chaque problème identifié.</p>
            </div>

            <div>
              <p class="font-semibold">5. Défi environnemental</p>
              <p>Pendant une semaine, notez toutes les façons dont vous impactez l'environnement (utilisation d'eau, électricité, production de déchets). Puis proposez trois actions concrètes que vous pourriez adopter pour réduire votre empreinte écologique.</p>
            </div>
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
      <div class="space-y-4">
        <p>La culture et la société haïtiennes sont uniques au monde. Elles sont le résultat d'un mélange extraordinaire entre les traditions des peuples autochtones Taïnos, la culture des colonisateurs européens, et les riches héritages des Africains amenés en esclavage. De cette rencontre tragique mais créative est née une identité culturelle originale et vibrante.</p>
        <p>Comprendre comment notre culture s'est formée, c'est comprendre qui nous sommes en tant que peuple haïtien. C'est aussi saisir la force et la résilience qui nous caractérisent depuis la première révolution d'esclaves victorieuse de l'histoire.</p>
        <p>Notre langue créole, notre musique, notre art, notre cuisine, nos croyances religieuses... tout cela raconte l'histoire fascinante de la formation de notre société.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. Les origines multiples de la société haïtienne</h3>
          <p>La société haïtienne contemporaine est le fruit de trois apports culturels principaux :</p>
          
          <h4 class="font-semibold mt-4 mb-2">A. L'héritage des Taïnos</h4>
          <p>Les Taïnos étaient les habitants originels d'Haïti (qu'ils appelaient Ayiti, "terre des hautes montagnes"). Bien que décimés par la colonisation, ils ont laissé des traces importantes :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Vocabulaire :</strong> Mots comme "hamac", "canoe", "barbecue", "ouragan", "tabac"</li>
            <li><strong>Agriculture :</strong> Culture du manioc, de la patate douce, du maïs</li>
            <li><strong>Techniques :</strong> Fabrication de la cassave, pêche traditionnelle</li>
            <li><strong>Toponymes :</strong> Noms de lieux comme "Xaragua", "Marmelade"</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">B. L'apport européen</h4>
          <p>La colonisation française (1659-1804) a laissé une empreinte profonde :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Langue :</strong> Le français comme langue officielle, base du créole</li>
            <li><strong>Religion :</strong> Le catholicisme</li>
            <li><strong>Administration :</strong> Système juridique, organisation territoriale</li>
            <li><strong>Architecture :</strong> Styles coloniaux dans certains édifices</li>
            <li><strong>Gastronomie :</strong> Certaines techniques culinaires</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">C. L'héritage africain (le plus important)</h4>
          <p>Les Africains, amenés de force comme esclaves, ont apporté la contribution la plus fondamentale à la culture haïtienne :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Religion :</strong> Le Vodou, synthèse de croyances africaines et catholiques</li>
            <li><strong>Musique :</strong> Rythmes africains à la base du konpa, rara, mizik rasin</li>
            <li><strong>Langue :</strong> Structure grammaticale et vocabulaire du créole</li>
            <li><strong>Art :</strong> Peinture naïve, sculptures, artisanat</li>
            <li><strong>Organisation sociale :</strong> Solidarité communautaire (konbit, eskwad)</li>
            <li><strong>Agriculture :</strong> Techniques de culture, plantes médicinales</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. La formation de la langue créole</h3>
          <p>Le créole haïtien est une langue à part entière, pas un dialecte ou un français déformé. Elle s'est formée dans les plantations coloniales comme outil de communication entre esclaves de différentes origines africaines.</p>
          <p><strong>Caractéristiques du créole :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Vocabulaire :</strong> Principalement d'origine française (90%), mais aussi africaine, espagnole, taïno</li>
            <li><strong>Grammaire :</strong> Structure africaine (notamment des langues Fon, Yoruba, Kikongo)</li>
            <li><strong>Prononciation :</strong> Simplification phonétique</li>
            <li><strong>Créativité :</strong> Capacité à créer de nouveaux mots et expressions</li>
          </ul>
          <p class="mt-3">Le créole est parlé par 100% de la population haïtienne, contre environ 40-50% qui maîtrisent le français. C'est donc la vraie langue nationale d'Haïti.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. Le Vodou : religion et philosophie</h3>
          <p>Le Vodou (orthographié aussi Vaudou) est une religion haïtienne née de la fusion des croyances africaines et du catholicisme. Reconnu comme religion officielle en 2003, il joue un rôle central dans la culture haïtienne.</p>
          <p><strong>Principes de base :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Bondye (Bon Dieu) :</strong> Créateur suprême, inaccessible</li>
            <li><strong>Les Lwa (loas) :</strong> Esprits intermédiaires entre Dieu et les humains</li>
            <li><strong>Les ancêtres :</strong> Vénération des morts de la famille</li>
            <li><strong>Le ougan/manbo :</strong> Prêtre/prêtresse vodou</li>
          </ul>
          <p><strong>Le Vodou dans la société :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Rôle dans la Révolution haïtienne (cérémonie du Bois-Caïman, 1791)</li>
            <li>Cohésion sociale et identitaire</li>
            <li>Médecine traditionnelle</li>
            <li>Art et musique</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. Les arts haïtiens</h3>
          <p>Haïti est réputé mondialement pour sa production artistique exceptionnelle.</p>
          
          <h4 class="font-semibold mt-4 mb-2">A. La peinture</h4>
          <p>L'art naïf haïtien est célèbre depuis les années 1940. Caractérisé par des couleurs vives, des scènes de la vie quotidienne, et une perspective particulière.</p>
          <p><strong>Peintres célèbres :</strong> Hector Hyppolite, Philomé Obin, Préfète Duffaut, Castera Bazile</p>

          <h4 class="font-semibold mt-4 mb-2">B. La sculpture</h4>
          <p>Sculptures en métal découpé (notamment à Croix-des-Bouquets), en bois, objets vodou</p>

          <h4 class="font-semibold mt-4 mb-2">C. La musique</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Konpa :</strong> Genre musical haïtien le plus populaire (Nemours Jean-Baptiste)</li>
            <li><strong>Rara :</strong> Musique de rue pendant le carnaval</li>
            <li><strong>Mizik Rasin :</strong> Musique des racines, fusion vodou et moderne</li>
            <li><strong>Twoubadou :</strong> Musique troubadour avec guitares</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2">D. La littérature</h4>
          <p>Haïti a produit de grands écrivains reconnus internationalement : Jacques Roumain (Gouverneurs de la rosée), Marie Chauvet, René Depestre, Dany Laferrière (Académie française).</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Les valeurs et pratiques sociales</h3>
          <p>La société haïtienne se distingue par certaines valeurs et pratiques héritées de son histoire :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Le konbit :</strong> Travail collectif et solidaire dans les champs</li>
            <li><strong>L'eskwad :</strong> Système d'entraide communautaire</li>
            <li><strong>Le respect des aînés :</strong> Importance accordée aux anciens</li>
            <li><strong>L'importance de la famille élargie</strong></li>
            <li><strong>L'hospitalité :</strong> Accueil chaleureux des visiteurs</li>
            <li><strong>La débrouillardise :</strong> Capacité d'adaptation et créativité</li>
            <li><strong>La fierté de l'indépendance :</strong> Première république noire libre</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. La gastronomie haïtienne</h3>
          <p>La cuisine haïtienne reflète elle aussi le métissage culturel :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Riz et pois :</strong> Plat national, base de l'alimentation</li>
            <li><strong>Griot :</strong> Porc frit mariné</li>
            <li><strong>Tasso :</strong> Viande de bœuf ou de chèvre fumée</li>
            <li><strong>Soup joumou :</strong> Soupe au giraumon, symbole de l'indépendance (1er janvier)</li>
            <li><strong>Pikliz :</strong> Condiment épicé aux légumes marinés</li>
            <li><strong>Akasan, labouyi :</strong> Boissons à base de maïs</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">7. Les défis contemporains</h3>
          <p>La culture et la société haïtiennes font face à plusieurs défis :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Préservation de l'identité :</strong> Face à la mondialisation et l'émigration</li>
            <li><strong>Valorisation du créole :</strong> Reconnaissance dans l'éducation et l'administration</li>
            <li><strong>Égalité linguistique :</strong> Fin de la domination du français</li>
            <li><strong>Lutte contre les stéréotypes :</strong> Image négative du Vodou, de la culture populaire</li>
            <li><strong>Préservation du patrimoine :</strong> Sites historiques, traditions orales</li>
            <li><strong>Développement culturel :</strong> Soutien aux artistes, infrastructures culturelles</li>
          </ul>
        </section>
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
      <div class="space-y-4">
        <p>Depuis toujours, les humains ont besoin de s'organiser pour vivre ensemble. L'organisation sociale désigne la manière dont une société structure ses relations, ses institutions et ses règles de fonctionnement. Ces formes d'organisation varient selon les cultures, les époques et les besoins des communautés.</p>
        <p>Dans cette leçon, nous allons découvrir les principales institutions sociales qui structurent nos sociétés : la famille, l'école, l'État, les communautés, et bien d'autres. Chacune joue un rôle essentiel dans le bon fonctionnement de la vie collective.</p>
        <p>Comprendre ces formes d'organisation nous aide à mieux saisir notre place dans la société et nos responsabilités envers les autres.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. La famille : cellule de base</h3>
          <p>La famille est la plus ancienne et la plus fondamentale des institutions sociales. C'est le premier lieu de socialisation de l'enfant.</p>
          <h4 class="font-semibold mt-4 mb-2">Types de familles</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Famille nucléaire :</strong> Parents et enfants vivant ensemble</li>
            <li><strong>Famille élargie :</strong> Inclut grands-parents, oncles, tantes, cousins</li>
            <li><strong>Famille monoparentale :</strong> Un seul parent avec enfants</li>
            <li><strong>Famille recomposée :</strong> Nouveaux couples avec enfants de précédentes unions</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Fonctions de la famille</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Reproduction :</strong> Assurer la continuité de la société</li>
            <li><strong>Socialisation :</strong> Enseigner les valeurs, normes, langue</li>
            <li><strong>Protection :</strong> Sécurité physique et affective</li>
            <li><strong>Transmission :</strong> Héritage culturel et matériel</li>
            <li><strong>Économique :</strong> Partage des ressources</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. L'école comme institution</h3>
          <p>L'école est l'institution chargée de l'éducation formelle des jeunes.</p>
          <h4 class="font-semibold mt-4 mb-2">Rôles de l'école</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Transmission des connaissances :</strong> Lecture, écriture, calcul, sciences</li>
            <li><strong>Socialisation secondaire :</strong> Apprentissage de la vie en collectivité</li>
            <li><strong>Formation citoyenne :</strong> Valeurs démocratiques, droits et devoirs</li>
            <li><strong>Intégration sociale :</strong> Réduction des inégalités, promotion sociale</li>
            <li><strong>Préparation professionnelle :</strong> Compétences pour le monde du travail</li>
          </ul>
          <p class="mt-3">En Haïti, l'éducation de base est gratuite et obligatoire selon la Constitution de 1987.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. L'État et l'organisation politique</h3>
          <p>L'État est l'organisation politique suprême d'une société. Il exerce le pouvoir sur un territoire défini.</p>
          <h4 class="font-semibold mt-4 mb-2">Fonctions de l'État</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Sécurité :</strong> Police, armée, justice</li>
            <li><strong>Services publics :</strong> Éducation, santé, infrastructures</li>
            <li><strong>Législation :</strong> Création et application des lois</li>
            <li><strong>Régulation économique :</strong> Monnaie, impôts, commerce</li>
            <li><strong>Représentation :</strong> Relations internationales</li>
          </ul>
          <p class="mt-3">En Haïti, l'État est organisé selon un système démocratique avec trois pouvoirs : exécutif (Président), législatif (Parlement), judiciaire (Tribunaux).</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. Les communautés</h3>
          <p>Une communauté est un groupe de personnes partageant des intérêts, valeurs ou un territoire communs.</p>
          <h4 class="font-semibold mt-4 mb-2">Types de communautés</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Communauté locale :</strong> Quartier, village (lakou en Haïti)</li>
            <li><strong>Communauté religieuse :</strong> Églises, temples, houmforts</li>
            <li><strong>Communauté professionnelle :</strong> Syndicats, associations</li>
            <li><strong>Communauté virtuelle :</strong> Réseaux sociaux, forums en ligne</li>
          </ul>
          <p class="mt-3">En Haïti, les pratiques comme le <strong>konbit</strong> (travail collectif agricole) et l'<strong>eskwad</strong> (entraide communautaire) illustrent l'importance des communautés.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Les organisations de la société civile</h3>
          <p>Ce sont des groupements non gouvernementaux qui agissent pour l'intérêt général.</p>
          <h4 class="font-semibold mt-4 mb-2">Exemples</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>ONG :</strong> Organisations non gouvernementales (aide humanitaire, développement)</li>
            <li><strong>Associations :</strong> Sportives, culturelles, caritatives</li>
            <li><strong>Syndicats :</strong> Défense des droits des travailleurs</li>
            <li><strong>Coopératives :</strong> Regroupement économique solidaire</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. Les institutions économiques</h3>
          <p>Elles organisent la production, distribution et consommation des biens et services.</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Entreprises :</strong> Production de biens et services</li>
            <li><strong>Banques :</strong> Gestion de l'argent, crédits</li>
            <li><strong>Marchés :</strong> Lieux d'échange commercial</li>
            <li><strong>Chambres de commerce :</strong> Représentation des commerçants</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">7. Les médias</h3>
          <p>Les médias (presse, radio, TV, internet) jouent un rôle croissant dans l'organisation sociale.</p>
          <h4 class="font-semibold mt-4 mb-2">Fonctions des médias</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Information :</strong> Diffusion de nouvelles</li>
            <li><strong>Éducation :</strong> Programmes éducatifs</li>
            <li><strong>Divertissement :</strong> Films, musique, séries</li>
            <li><strong>Contrôle social :</strong> Surveillance des pouvoirs publics</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> Dans un village haïtien, le lakou est une forme d'organisation où plusieurs familles partagent un espace commun, avec des règles établies par le chef de lakou.</p>
            <p><strong>Exemple 2 :</strong> Le konbit illustre la solidarité : tous les membres de la communauté se réunissent pour aider un paysan à labourer son champ, puis passent au champ suivant.</p>
            <p><strong>Exemple 3 :</strong> Une école primaire est une organisation formelle avec directeur, enseignants, règlement intérieur, horaires précis.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices pratiques</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Identifiez l'institution</p>
              <p>Pour chaque situation, identifiez quelle institution est concernée :</p>
              <ul class="ml-6 list-disc space-y-2">
                <li>Votre maman vous apprend à parler créole → (Famille)</li>
                <li>Vous apprenez à lire et écrire → (École)</li>
                <li>La police arrête un voleur → (État)</li>
                <li>Les voisins s'entraident pour reconstruire une maison → (Communauté)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Dessinez votre famille</p>
              <p>Créez un arbre généalogique simple de votre famille montrant au moins 3 générations (grands-parents, parents, vous et vos frères/sœurs).</p>
            </div>

            <div>
              <p class="font-semibold">3. Enquête sur votre école</p>
              <p>Listez toutes les règles de votre école et expliquez pourquoi chacune est importante pour l'organisation.</p>
            </div>

            <div>
              <p class="font-semibold">4. Le konbit moderne</p>
              <p>Réfléchissez : Comment pourrait-on organiser un konbit moderne dans votre quartier pour améliorer l'environnement ? (nettoyage, plantation d'arbres, etc.)</p>
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
      <div class="space-y-4">
        <p>La Caraïbe (ou les Caraïbes) est une région du monde située entre l'Amérique du Nord et l'Amérique du Sud, comprenant la mer des Caraïbes et les îles qui la bordent. Haïti fait partie de cette région fascinante qui partage une histoire commune et des défis similaires.</p>
        <p>Cette région compte plus de 7000 îles, îlots et récifs, dont seulement une trentaine sont habitées. Ensemble, elles forment un arc insulaire unique au monde, caractérisé par un climat tropical, une biodiversité exceptionnelle et une diversité culturelle remarquable.</p>
        <p>Comprendre l'espace caribéen, c'est mieux comprendre notre place dans le monde et nos liens avec nos voisins insulaires.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. Situation géographique</h3>
          <p>La région caribéenne est située entre :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Nord :</strong> États-Unis (Floride)</li>
            <li><strong>Sud :</strong> Amérique du Sud (Venezuela, Colombie)</li>
            <li><strong>Ouest :</strong> Amérique centrale (Mexique, Belize, Honduras)</li>
            <li><strong>Est :</strong> Océan Atlantique</li>
          </ul>
          <p class="mt-3"><strong>Coordonnées approximatives :</strong> Entre 10° et 26° de latitude Nord, et 59° et 85° de longitude Ouest</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. Les Grandes Antilles</h3>
          <p>Ce sont les quatre plus grandes îles de la Caraïbe :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Cuba :</strong> La plus grande île (110 860 km²), capitale La Havane</li>
            <li><strong>Hispaniola :</strong> Partagée entre Haïti et République Dominicaine (76 480 km²)</li>
            <li><strong>Jamaïque :</strong> (10 991 km²), capitale Kingston</li>
            <li><strong>Porto Rico :</strong> (8 870 km²), territoire américain, capitale San Juan</li>
          </ul>
          <p class="mt-3">Haïti occupe le tiers occidental d'Hispaniola (27 750 km²), partageant une frontière de 376 km avec la République Dominicaine.</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. Les Petites Antilles</h3>
          <p>Elles forment un arc d'îles plus petites divisé en deux groupes :</p>
          <h4 class="font-semibold mt-4 mb-2">A. Les Îles du Vent (au sud-est)</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Martinique, Dominique, Sainte-Lucie, Saint-Vincent</li>
            <li>Grenade, Barbade, Trinité-et-Tobago</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">B. Les Îles Sous-le-Vent (au nord)</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Guadeloupe, Antigua-et-Barbuda, Saint-Kitts-et-Nevis</li>
            <li>Îles Vierges, Anguilla, Saint-Martin</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. La mer des Caraïbes</h3>
          <p>C'est une mer tropicale de l'océan Atlantique.</p>
          <h4 class="font-semibold mt-4 mb-2">Caractéristiques</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Superficie :</strong> 2 754 000 km²</li>
            <li><strong>Profondeur moyenne :</strong> 2 200 mètres</li>
            <li><strong>Point le plus profond :</strong> Fosse de Caïmans (-7 686 m)</li>
            <li><strong>Température :</strong> 24-29°C toute l'année</li>
            <li><strong>Salinité :</strong> Plus élevée que l'océan Atlantique</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Importance économique</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Tourisme balnéaire (plages paradisiaques)</li>
            <li>Pêche commerciale</li>
            <li>Transport maritime (Canal de Panama)</li>
            <li>Ressources pétrolières et gazières</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. Climat et phénomènes naturels</h3>
          <h4 class="font-semibold mt-4 mb-2">Climat tropical maritime</h4>
          <p>Caractérisé par :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Températures élevées :</strong> 25-30°C toute l'année</li>
            <li><strong>Deux saisons :</strong> Sèche (décembre-mai) et humide (juin-novembre)</li>
            <li><strong>Forte humidité :</strong> Près des côtes</li>
            <li><strong>Alizés :</strong> Vents réguliers de l'est</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Les ouragans</h4>
          <p>La Caraïbe est située dans la "ceinture des ouragans". Ces cyclones tropicaux se forment entre juin et novembre, avec un pic en août-septembre.</p>
          <p><strong>Ouragans marquants :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Matthew (2016) : Dévasta Haïti</li>
            <li>Irma et Maria (2017) : Ravagèrent les Petites Antilles</li>
            <li>Dorian (2019) : Détruisit les Bahamas</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Séismes</h4>
          <p>La région est sismiquement active en raison de la rencontre de plusieurs plaques tectoniques.</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Séisme de Port-au-Prince (2010) : 7.0 magnitude</li>
            <li>Séisme du Sud (2021) : 7.2 magnitude</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">6. Biodiversité</h3>
          <p>La Caraïbe est un hotspot de biodiversité mondiale.</p>
          <h4 class="font-semibold mt-4 mb-2">Écosystèmes marins</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Récifs coralliens :</strong> Parmi les plus beaux du monde</li>
            <li><strong>Mangroves :</strong> Forêts côtières protectrices</li>
            <li><strong>Herbiers marins :</strong> Nurseries pour poissons</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Faune et flore terrestres</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Nombreuses espèces endémiques (uniques à la région)</li>
            <li>Forêts tropicales humides en altitude</li>
            <li>Oiseaux migrateurs</li>
            <li>Reptiles (iguanes, boas)</li>
          </ul>
          <p class="mt-3"><strong>Menaces :</strong> Déforestation, pollution, changement climatique, surpêche</p>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">7. Population et culture</h3>
          <h4 class="font-semibold mt-4 mb-2">Population</h4>
          <p>Environ 44 millions d'habitants dans toute la Caraïbe, très inégalement répartis :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Cuba : 11 millions</li>
            <li>Haïti : 11,5 millions</li>
            <li>République Dominicaine : 10,8 millions</li>
            <li>Jamaïque : 2,9 millions</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Diversité culturelle</h4>
          <p>La Caraïbe est caractérisée par un métissage culturel unique :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Langues :</strong> Espagnol, français, anglais, néerlandais, créoles</li>
            <li><strong>Religions :</strong> Catholicisme, protestantisme, vodou, santería</li>
            <li><strong>Musiques :</strong> Reggae (Jamaïque), salsa (Cuba), konpa (Haïti), calypso (Trinité)</li>
            <li><strong>Cuisines :</strong> Mélange d'influences africaines, européennes, indiennes</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">8. Économie caribéenne</h3>
          <h4 class="font-semibold mt-4 mb-2">Principales activités</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Tourisme :</strong> Secteur dominant (plages, croisières)</li>
            <li><strong>Agriculture :</strong> Canne à sucre, bananes, café, cacao</li>
            <li><strong>Pêche :</strong> Ressource importante pour l'alimentation</li>
            <li><strong>Services financiers :</strong> Centres offshore dans certaines îles</li>
            <li><strong>Industrie :</strong> Limitée, principalement transformation agricole</li>
          </ul>
          <h4 class="font-semibold mt-4 mb-2">Défis économiques</h4>
          <ul class="list-disc ml-6 space-y-2">
            <li>Dépendance au tourisme (vulnérable aux crises)</li>
            <li>Coût élevé du transport (insularité)</li>
            <li>Vulnérabilité aux catastrophes naturelles</li>
            <li>Migrations importantes vers l'Amérique du Nord</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">9. Organisations régionales</h3>
          <p>Les pays caribéens coopèrent à travers plusieurs organisations :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>CARICOM</strong> (Communauté caribéenne) : Union économique et politique</li>
            <li><strong>AEC</strong> (Association des États de la Caraïbe) : Coopération régionale</li>
            <li><strong>OECO</strong> (Organisation des États de la Caraïbe orientale) : Petites Antilles</li>
            <li><strong>Université des Indes occidentales</strong> : Coopération éducative</li>
          </ul>
        </section>
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
      <div class="space-y-4">
        <p>Haïti est un pays très montagneux. En fait, son nom taïno "Ayiti" signifie précisément "terre de hautes montagnes". Environ 75% du territoire haïtien est constitué de montagnes et de collines, ce qui fait d'Haïti l'un des pays les plus montagneux des Caraïbes.</p>
        <p>Cette configuration montagneuse influence profondément la vie du pays : le climat local, l'agriculture, les communications, et même la répartition de la population. Comprendre le relief haïtien, c'est comprendre un élément fondamental de notre géographie nationale.</p>
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
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples pratiques</h3>
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> Le Pic la Selle à 2 680m a un climat frais (10-15°C) alors qu'à Port-au-Prince à 30 km, il fait 30°C - effet de l'altitude.</p>
            <p><strong>Exemple 2 :</strong> L'Artibonite, grâce à sa grande plaine fertile, produit 80% du riz consommé en Haïti.</p>
            <p><strong>Exemple 3 :</strong> Les Gonaïves, située dans une plaine entre montagnes, subit des inondations catastrophiques quand il pleut dans les montagnes environnantes.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Carte du relief</p>
              <p>Dessinez une carte simple d'Haïti et placez-y :</p>
              <ul class="ml-6 list-disc">
                <li>Les 5 massifs montagneux</li>
                <li>Les 4 principales plaines</li>
                <li>Le Pic la Selle</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Comparaison</p>
              <p>Remplissez ce tableau comparatif :</p>
              <table class="ml-6 border">
                <tr><th>Zone</th><th>Altitude</th><th>Cultures</th></tr>
                <tr><td>Plaines</td><td>0-200m</td><td>?</td></tr>
                <tr><td>Collines</td><td>200-800m</td><td>?</td></tr>
                <tr><td>Montagnes</td><td>>800m</td><td>?</td></tr>
              </table>
            </div>

            <div>
              <p class="font-semibold">3. Enquête locale</p>
              <p>Renseignez-vous : Dans quel type de relief se trouve votre ville/village ? (plaine, colline, montagne). Quelles sont les conséquences sur l'agriculture locale ?</p>
            </div>
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
      <div class="space-y-4">
        <p>La Terre n'est pas seule dans l'univers. Elle fait partie d'un système planétaire appelé le système solaire, composé du Soleil et de tous les objets qui gravitent autour de lui. Ce système comprend 8 planètes, dont la Terre est la troisième à partir du Soleil.</p>
        <p>Comprendre notre système solaire nous aide à apprécier la position unique de notre planète, la seule connue à abriter la vie. Cette connaissance est essentielle pour saisir les phénomènes naturels qui affectent notre quotidien.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Le Soleil : étoile de notre système</h3>
          <p class="text-foreground">Le Soleil est une étoile de taille moyenne située au centre de notre système solaire.</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Composition :</strong> 73% d'hydrogène, 25% d'hélium</li>
            <li><strong>Température de surface :</strong> 5 500°C</li>
            <li><strong>Âge :</strong> 4,6 milliards d'années</li>
            <li><strong>Rôle :</strong> Source de lumière et de chaleur pour toutes les planètes</li>
          </ul>
          <div class="bg-primary/5 p-4 rounded-lg mt-3">
            <p class="text-sm text-foreground italic">
              🌟 [Image suggérée : Le Soleil avec ses éruptions solaires]
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Les huit planètes</h3>
          <p class="text-foreground mb-3">Voici les planètes du système solaire, de la plus proche à la plus éloignée du Soleil :</p>
          
          <h4 class="font-semibold mt-4 mb-2 text-foreground">Planètes rocheuses (telluriques)</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Mercure :</strong> La plus petite et la plus proche du Soleil</li>
            <li><strong>Vénus :</strong> Surnommée "l'étoile du berger", très chaude (465°C)</li>
            <li><strong>Terre :</strong> Notre planète bleue, seule à avoir de la vie</li>
            <li><strong>Mars :</strong> La planète rouge, avec ses déserts et canyons</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2 text-foreground">Planètes géantes gazeuses</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Jupiter :</strong> La plus grande planète, avec sa Grande Tache Rouge</li>
            <li><strong>Saturne :</strong> Célèbre pour ses anneaux spectaculaires</li>
            <li><strong>Uranus :</strong> Inclinée sur le côté, de couleur bleu-vert</li>
            <li><strong>Neptune :</strong> La planète la plus éloignée, bleu profond</li>
          </ul>
          <div class="bg-primary/5 p-4 rounded-lg mt-3">
            <p class="text-sm text-foreground italic">
              🎥 [Vidéo suggérée : Animation montrant les orbites des planètes]
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. La Terre : une planète unique</h3>
          <p class="text-foreground mb-3">La Terre possède des caractéristiques qui la rendent unique dans le système solaire :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Atmosphère respirable :</strong> 78% d'azote, 21% d'oxygène</li>
            <li><strong>Eau liquide :</strong> Couvre 71% de la surface</li>
            <li><strong>Température modérée :</strong> Moyenne de 15°C</li>
            <li><strong>Champ magnétique :</strong> Protège des radiations solaires</li>
            <li><strong>Distance idéale du Soleil :</strong> Ni trop chaud, ni trop froid (zone habitable)</li>
            <li><strong>La Lune :</strong> Satellite naturel qui stabilise l'axe de rotation</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. Autres corps célestes</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Planètes naines :</strong> Pluton, Cérès, Éris</li>
            <li><strong>Astéroïdes :</strong> Rochers rocheux entre Mars et Jupiter</li>
            <li><strong>Comètes :</strong> Boules de glace et de poussière</li>
            <li><strong>Satellites naturels :</strong> Lunes qui orbitent autour des planètes</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">5. La révolution et la rotation terrestres</h3>
          <p class="text-foreground mb-3"><strong>Révolution :</strong> Mouvement de la Terre autour du Soleil</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Durée : 365 jours et 1/4 (une année)</li>
            <li>Cause les saisons</li>
            <li>Orbite elliptique de 150 millions de km</li>
          </ul>

          <p class="text-foreground mt-4 mb-3"><strong>Rotation :</strong> Mouvement de la Terre sur elle-même</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Durée : 24 heures (un jour)</li>
            <li>Cause l'alternance jour/nuit</li>
            <li>Rotation d'ouest en est</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">Exemples concrets</h3>
          <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
            <p class="text-foreground"><strong>Exemple 1 :</strong> Le Soleil est si grand qu'on pourrait y placer 1,3 million de Terres !</p>
            <p class="text-foreground mt-2"><strong>Exemple 2 :</strong> Si le Soleil était gros comme un ballon de football, la Terre serait de la taille d'une tête d'épingle.</p>
            <p class="text-foreground mt-2"><strong>Exemple 3 :</strong> La lumière du Soleil met 8 minutes pour atteindre la Terre.</p>
          </div>
        </section>
        
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">Exercices pratiques</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold text-foreground">1. Maquette du système solaire</p>
              <p class="text-foreground">Créez une maquette avec des balles de différentes tailles représentant les planètes. Respectez l'ordre des planètes.</p>
            </div>
            <div>
              <p class="font-semibold text-foreground">2. Journal d'observation</p>
              <p class="text-foreground">Pendant une semaine, dessinez la position du Soleil dans le ciel le matin, à midi et le soir. Que remarques-tu ?</p>
            </div>
          </div>
        </section>
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
        <p>Bien avant notre époque moderne, de grandes civilisations se sont développées partout dans le monde. Ces sociétés ont construit des villes impressionnantes, développé l'écriture, créé des systèmes politiques complexes et produit des œuvres d'art remarquables.</p>
        <p>Étudier ces civilisations nous aide à comprendre comment les sociétés humaines se sont organisées et évoluées, et comment leurs innovations continuent d'influencer notre monde aujourd'hui.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. La Mésopotamie : berceau de la civilisation</h3>
          <p class="text-foreground mb-3">Située entre les fleuves Tigre et Euphrate (Irak actuel), c'est l'une des premières civilisations (3500 av. J.-C.).</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Invention de l'écriture cunéiforme :</strong> Première forme d'écriture</li>
            <li><strong>Code d'Hammourabi :</strong> Premier code de lois écrit</li>
            <li><strong>Cités-États :</strong> Babylone, Our, Ninive</li>
            <li><strong>Innovations :</strong> Roue, irrigation, astronomie, mathématiques</li>
          </ul>
          <div class="bg-primary/5 p-4 rounded-lg mt-3">
            <p class="text-sm text-foreground italic">
              📸 [Image suggérée : Tablette d'argile avec écriture cunéiforme]
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. L'Égypte ancienne</h3>
          <p class="text-foreground mb-3">Civilisation développée le long du Nil (3100 av. J.-C. - 30 av. J.-C.).</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Les pharaons :</strong> Rois considérés comme des dieux</li>
            <li><strong>Pyramides :</strong> Tombeaux monumentaux (Khéops, Khéphren, Mykérinos)</li>
            <li><strong>Écriture hiéroglyphique :</strong> Système d'écriture sacrée</li>
            <li><strong>Momification :</strong> Préservation des corps</li>
            <li><strong>Sciences :</strong> Médecine avancée, calendrier de 365 jours</li>
            <li><strong>Agriculture :</strong> Maîtrise de l'irrigation grâce aux crues du Nil</li>
          </ul>
          <div class="bg-secondary/10 p-4 rounded-lg mt-3">
            <h4 class="font-semibold mb-2 text-foreground">💡 Le savais-tu ?</h4>
            <p class="text-foreground">
              La Grande Pyramide de Khéops est restée le plus haut bâtiment du monde pendant 3 800 ans !
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. La Grèce antique</h3>
          <p class="text-foreground mb-3">Civilisation développée dans la péninsule balkanique et les îles de la mer Égée (800-146 av. J.-C.).</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Démocratie :</strong> Invention à Athènes (gouvernement par le peuple)</li>
            <li><strong>Philosophie :</strong> Socrate, Platon, Aristote</li>
            <li><strong>Jeux Olympiques :</strong> Créés en 776 av. J.-C.</li>
            <li><strong>Théâtre :</strong> Tragédies et comédies</li>
            <li><strong>Sciences :</strong> Mathématiques (Pythagore), géométrie (Euclide)</li>
            <li><strong>Art :</strong> Sculptures, architecture (Parthénon)</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">4. L'Empire romain</h3>
          <p class="text-foreground mb-3">Civilisation qui a dominé le bassin méditerranéen (753 av. J.-C. - 476 ap. J.-C.).</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Organisation :</strong> République puis Empire</li>
            <li><strong>Droit romain :</strong> Base du droit moderne</li>
            <li><strong>Armée puissante :</strong> Légions disciplinées</li>
            <li><strong>Infrastructure :</strong> Routes, aqueducs, ponts</li>
            <li><strong>Latin :</strong> Langue qui a donné le français, l'espagnol, l'italien</li>
            <li><strong>Architecture :</strong> Colisée, Forum, Panthéon</li>
          </ul>
          <div class="bg-primary/5 p-4 rounded-lg mt-3">
            <p class="text-sm text-foreground italic">
              🎥 [Vidéo suggérée : Animation 3D de la Rome antique]
            </p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">5. Les civilisations asiatiques</h3>
          
          <h4 class="font-semibold mt-4 mb-2 text-foreground">A. La Chine ancienne</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Grande Muraille :</strong> Plus de 6 000 km de fortifications</li>
            <li><strong>Inventions :</strong> Papier, boussole, poudre à canon, imprimerie</li>
            <li><strong>Philosophie :</strong> Confucius, Lao Tseu</li>
            <li><strong>Dynasties impériales :</strong> Qin, Han, Tang, Ming</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2 text-foreground">B. L'Inde ancienne</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Civilisation de l'Indus :</strong> Villes planifiées (Mohenjo-Daro)</li>
            <li><strong>Religions :</strong> Hindouisme, bouddhisme, jaïnisme</li>
            <li><strong>Mathématiques :</strong> Invention du zéro, système décimal</li>
            <li><strong>Littérature :</strong> Védas, Mahabharata</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">6. Les civilisations précolombiennes</h3>
          
          <h4 class="font-semibold mt-4 mb-2 text-foreground">A. Les Mayas</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Localisation :</strong> Amérique centrale (Mexique, Guatemala)</li>
            <li><strong>Calendrier complexe :</strong> Astronomie avancée</li>
            <li><strong>Écriture glyphique :</strong> Système d'écriture élaboré</li>
            <li><strong>Architecture :</strong> Pyramides, temples (Chichén Itzá)</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2 text-foreground">B. Les Aztèques</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Capitale :</strong> Tenochtitlan (Mexico actuel)</li>
            <li><strong>Agriculture :</strong> Chinampas (jardins flottants)</li>
            <li><strong>Empire puissant :</strong> Domination militaire</li>
          </ul>

          <h4 class="font-semibold mt-4 mb-2 text-foreground">C. Les Incas</h4>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Localisation :</strong> Cordillère des Andes (Pérou, Bolivie, Équateur)</li>
            <li><strong>Machu Picchu :</strong> Cité perchée dans les montagnes</li>
            <li><strong>Routes :</strong> Réseau routier de 40 000 km</li>
            <li><strong>Architecture en pierre :</strong> Sans mortier, très résistante</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">7. L'héritage des civilisations anciennes</h3>
          <p class="text-foreground mb-3">Ces civilisations nous ont légué :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>L'écriture :</strong> Base de toute notre connaissance</li>
            <li><strong>Les mathématiques et sciences :</strong> Fondements de la science moderne</li>
            <li><strong>Le droit et la politique :</strong> Systèmes juridiques et démocratiques</li>
            <li><strong>L'architecture :</strong> Techniques de construction</li>
            <li><strong>L'agriculture :</strong> Domestication des plantes et animaux</li>
            <li><strong>L'art et la culture :</strong> Inspiration pour les créateurs d'aujourd'hui</li>
          </ul>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">Exemples concrets</h3>
          <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
            <p class="text-foreground"><strong>Exemple 1 :</strong> Le mot "alphabet" vient du grec "alpha" et "bêta", les deux premières lettres de leur alphabet.</p>
            <p class="text-foreground mt-2"><strong>Exemple 2 :</strong> Les Romains ont construit des aqueducs pour transporter l'eau sur des dizaines de kilomètres - certains fonctionnent encore aujourd'hui !</p>
            <p class="text-foreground mt-2"><strong>Exemple 3 :</strong> Le calendrier que nous utilisons vient de l'Égypte ancienne et a été perfectionné par les Romains.</p>
          </div>
        </section>
        
        <section>
          <h3 class="text-xl font-semibold mb-3 text-foreground">Exercices pratiques</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold text-foreground">1. Projet de recherche</p>
              <p class="text-foreground">Choisis une civilisation ancienne et crée une affiche présentant :</p>
              <ul class="ml-6 list-disc text-foreground">
                <li>Sa localisation géographique</li>
                <li>Ses principales réalisations</li>
                <li>Un monument célèbre</li>
                <li>Son héritage aujourd'hui</li>
              </ul>
            </div>
            <div>
              <p class="font-semibold text-foreground">2. Ligne du temps</p>
              <p class="text-foreground">Crée une frise chronologique situant les grandes civilisations anciennes de 4000 av. J.-C. à 500 ap. J.-C.</p>
            </div>
            <div>
              <p class="font-semibold text-foreground">3. Comparaison</p>
              <p class="text-foreground">Compare deux civilisations anciennes : quels points communs ? Quelles différences ? Utilise un tableau comparatif.</p>
            </div>
          </div>
        </section>
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
      <p class="text-foreground leading-relaxed">
        La famille est la plus ancienne et la plus universelle des institutions sociales. C'est le premier groupe auquel nous appartenons et où nous apprenons les valeurs, les normes et les comportements de notre société. En Haïti, la famille joue un rôle particulièrement important dans l'éducation, le soutien économique et la transmission culturelle.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Types de familles</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Famille nucléaire :</strong> Parents et enfants</li>
            <li><strong>Famille élargie :</strong> Inclut grands-parents, oncles, tantes (très courante en Haïti)</li>
            <li><strong>Famille monoparentale :</strong> Un seul parent</li>
            <li><strong>Famille recomposée :</strong> Nouveaux couples avec enfants d'unions précédentes</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Fonctions de la famille</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Socialisation :</strong> Apprendre la langue, valeurs, normes</li>
            <li><strong>Soutien affectif :</strong> Amour, protection, sécurité</li>
            <li><strong>Fonction économique :</strong> Partage des ressources</li>
            <li><strong>Transmission culturelle :</strong> Héritage des traditions</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. La famille haïtienne</h3>
          <p class="text-foreground mb-3">Caractéristiques particulières :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Importance de la famille élargie</li>
            <li>Rôle central de la mère</li>
            <li>Respect des aînés</li>
            <li>Solidarité familiale forte</li>
            <li>Impact de la migration</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Exemple</h4>
          <p class="text-foreground">
            En Haïti, il est courant que les grands-parents élèvent leurs petits-enfants pendant que les parents travaillent à l'étranger.
          </p>
        </div>
        
        <div class="bg-accent/5 border-l-4 border-accent p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">📝 Exercice</h4>
          <p class="text-foreground">
            Dessine ton arbre généalogique sur 3 générations. Identifie le type de famille auquel tu appartiens.
          </p>
        </div>
      </section>
    `
  },

  // Leçon 11: Les fosses marines
  {
    id: "fosses-marines",
    title: "Les fosses marines",
    mois: "Avril",
    objectif: "Découvrir les fosses océaniques et leur importance géologique.",
    introduction: `
      <p class="text-foreground leading-relaxed">
        Les fosses marines sont les endroits les plus profonds des océans. Ces dépressions gigantesques se trouvent principalement dans l'océan Pacifique et peuvent atteindre des profondeurs de plus de 11 000 mètres ! Haïti, situé près de plusieurs fosses, est directement concerné par ces formations géologiques.
      </p>
    `,
    contenu: `
      <section class="space-y-6">
        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">1. Qu'est-ce qu'une fosse marine ?</h3>
          <p class="text-foreground mb-3">Une fosse marine (ou fosse océanique) est une dépression longue et étroite du fond océanique.</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Profondeur :</strong> Entre 6 000 et 11 000 mètres</li>
            <li><strong>Formation :</strong> Par subduction (une plaque tectonique plonge sous une autre)</li>
            <li><strong>Localisation :</strong> Principalement dans l'océan Pacifique</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">2. Principales fosses marines</h3>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li><strong>Fosse des Mariannes :</strong> La plus profonde (10 994 m), Pacifique</li>
            <li><strong>Fosse de Porto Rico :</strong> 8 605 m, près des Caraïbes</li>
            <li><strong>Fosse de Caïmans :</strong> 7 686 m, mer des Caraïbes</li>
            <li><strong>Fosse des Tonga :</strong> 10 882 m, Pacifique Sud</li>
          </ul>
        </div>

        <div>
          <h3 class="text-xl font-semibold mb-3 text-foreground">3. Importance pour Haïti</h3>
          <p class="text-foreground mb-3">Les fosses proches d'Haïti expliquent l'activité sismique :</p>
          <ul class="list-disc ml-6 space-y-2 text-foreground">
            <li>Rencontre de plaques tectoniques</li>
            <li>Séismes fréquents</li>
            <li>Tsunamis possibles</li>
          </ul>
        </div>
      </section>
    `,
    exemplesExercices: `
      <section class="space-y-4">
        <div class="bg-primary/5 border-l-4 border-primary p-4 rounded">
          <h4 class="font-semibold mb-2 text-foreground">💡 Le savais-tu ?</h4>
          <p class="text-foreground">
            Si on plaçait le Mont Everest (8 848 m) dans la fosse des Mariannes, il serait entièrement submergé avec plus de 2 km d'eau au-dessus !
          </p>
        </div>
      </section>
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

