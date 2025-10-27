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
    objectif: "Comprendre l'évolution des sociétés humaines et la dynamique de cette évolution.",
    introduction: `
      <div class="space-y-4">
        <p>Depuis l'apparition de l'humanité il y a des millions d'années, les sociétés humaines n'ont cessé d'évoluer. De petits groupes de chasseurs-cueilleurs nomades, nous sommes passés à de grandes civilisations organisées avec des villes, des technologies avancées et des systèmes politiques complexes.</p>
        <p>Cette évolution n'est pas le fruit du hasard, mais résulte de nombreux facteurs : le développement de l'agriculture, la maîtrise du feu, l'invention de l'écriture, et bien d'autres découvertes qui ont transformé la façon dont les humains vivent et interagissent.</p>
        <p>Comprendre cette évolution nous aide à mieux saisir notre présent et à réfléchir sur l'avenir de nos sociétés.</p>
      </div>
    `,
    contenu: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">1. Les premières sociétés humaines</h3>
          <p>Les premiers humains vivaient en petits groupes nomades de 20 à 50 personnes. Ils se déplaçaient constamment à la recherche de nourriture : chasse, pêche et cueillette. Ces sociétés étaient égalitaires, sans hiérarchie stricte.</p>
          <p><strong>Caractéristiques principales :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Vie nomade suivant les ressources naturelles</li>
            <li>Outils simples en pierre (Paléolithique)</li>
            <li>Organisation sociale basée sur la famille élargie</li>
            <li>Transmission orale des connaissances</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">2. La révolution néolithique</h3>
          <p>Il y a environ 10 000 ans, une transformation majeure s'est produite : la <strong>révolution néolithique</strong>. Les humains ont commencé à domestiquer les plantes et les animaux, passant de la chasse-cueillette à l'agriculture et à l'élevage.</p>
          <p><strong>Conséquences de cette révolution :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Sédentarisation : création de villages permanents</li>
            <li>Augmentation de la population</li>
            <li>Apparition de surplus alimentaires</li>
            <li>Développement de la spécialisation des métiers (potiers, tisserands, forgerons)</li>
            <li>Naissance des premières inégalités sociales</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">3. L'émergence des civilisations</h3>
          <p>Les surplus agricoles ont permis à certaines personnes de se consacrer à d'autres activités que l'agriculture. Cela a conduit à l'apparition des premières <strong>civilisations</strong> en Mésopotamie, en Égypte, en Inde et en Chine.</p>
          <p><strong>Éléments caractéristiques d'une civilisation :</strong></p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Urbanisation : construction de villes</li>
            <li>Écriture pour conserver les informations</li>
            <li>Organisation politique centralisée (roi, pharaon, empereur)</li>
            <li>Stratification sociale (nobles, prêtres, artisans, paysans, esclaves)</li>
            <li>Développement des arts, des sciences et de la religion</li>
            <li>Commerce à longue distance</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">4. Les facteurs de l'évolution sociale</h3>
          <p>Plusieurs facteurs expliquent pourquoi les sociétés évoluent :</p>
          <ul class="list-disc ml-6 space-y-2">
            <li><strong>Facteurs technologiques :</strong> L'invention de nouveaux outils et techniques transforme les modes de vie</li>
            <li><strong>Facteurs économiques :</strong> Le développement du commerce et de l'agriculture modifie l'organisation sociale</li>
            <li><strong>Facteurs environnementaux :</strong> Le climat et les ressources naturelles influencent le mode de vie</li>
            <li><strong>Facteurs culturels :</strong> Les idées, religions et valeurs façonnent les sociétés</li>
            <li><strong>Facteurs politiques :</strong> Les guerres, conquêtes et alliances redessinent les frontières et les pouvoirs</li>
          </ul>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">5. L'évolution continue</h3>
          <p>L'évolution des sociétés n'est jamais terminée. Au cours des derniers siècles, la révolution industrielle, la révolution numérique et la mondialisation ont profondément transformé nos modes de vie. Aujourd'hui, nous vivons dans des sociétés complexes, interconnectées, où les changements sont de plus en plus rapides.</p>
          <p>En Haïti, notre société est le résultat d'une histoire riche : les peuples autochtones Taïnos, la colonisation européenne, la traite esclavagiste africaine, et la première révolution d'esclaves victorieuse. Cette diversité fait notre richesse culturelle unique.</p>
        </section>
      </div>
    `,
    exemplesExercices: `
      <div class="space-y-6">
        <section>
          <h3 class="text-xl font-semibold mb-3">Exemples concrets</h3>
          <div class="bg-blue-50 p-4 rounded-lg space-y-3">
            <p><strong>Exemple 1 :</strong> La domestication du maïs en Amérique centrale a permis le développement de grandes civilisations comme les Mayas et les Aztèques.</p>
            <p><strong>Exemple 2 :</strong> L'invention de l'écriture en Mésopotamie (vers 3500 av. J.-C.) a révolutionné la conservation et la transmission des connaissances.</p>
            <p><strong>Exemple 3 :</strong> En Haïti, la société coloniale esclavagiste a été complètement transformée par la Révolution de 1804, créant une nouvelle organisation sociale basée sur la liberté.</p>
          </div>
        </section>

        <section>
          <h3 class="text-xl font-semibold mb-3">Exercices</h3>
          <div class="space-y-4">
            <div>
              <p class="font-semibold">1. Questions à choix multiples</p>
              <p>a) La révolution néolithique marque le passage :</p>
              <ul class="ml-6 list-disc">
                <li>De la pierre à l'âge du bronze</li>
                <li>De la chasse-cueillette à l'agriculture ✓</li>
                <li>De l'esclavage à la liberté</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">2. Vrai ou Faux</p>
              <ul class="ml-6 space-y-2">
                <li>Les premières sociétés humaines étaient sédentaires. (Faux)</li>
                <li>L'écriture est une caractéristique des civilisations avancées. (Vrai)</li>
                <li>Les sociétés n'évoluent plus aujourd'hui. (Faux)</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">3. Questions de réflexion</p>
              <ul class="ml-6 space-y-2">
                <li>Quels sont les avantages et les inconvénients de la sédentarisation ?</li>
                <li>Comment la technologie moderne change-t-elle notre société haïtienne ?</li>
                <li>Pourquoi l'écriture est-elle si importante pour le développement d'une société ?</li>
              </ul>
            </div>

            <div>
              <p class="font-semibold">4. Activité pratique</p>
              <p>Créez une frise chronologique illustrant les grandes étapes de l'évolution des sociétés humaines, de la préhistoire à nos jours. Incluez au moins 5 événements majeurs avec leurs dates approximatives.</p>
            </div>
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
  }
];
