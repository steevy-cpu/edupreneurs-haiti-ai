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
  }
];
