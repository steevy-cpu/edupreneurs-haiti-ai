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

