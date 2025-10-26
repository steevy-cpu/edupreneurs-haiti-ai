import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface LessonSchemasProps {
  topicId: string;
  topicTitle: string;
}

export const LessonSchemas = ({ topicId, topicTitle }: LessonSchemasProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSchemaForTopic = (id: string) => {
    const schemas: Record<string, { title: string; mermaid: string; description?: string }[]> = {
      "ensembles": [
        {
          title: "Hiérarchie des Ensembles de Nombres",
          description: "Les ensembles de nombres sont organisés du plus simple au plus complexe",
          mermaid: `graph TD
    A[Nombres Naturels ℕ<br/>0, 1, 2, 3...] --> B[Nombres Entiers ℤ<br/>...-2, -1, 0, 1, 2...]
    B --> C[Nombres Décimaux 𝔻<br/>0.5, 1.25, -3.75...]
    C --> D[Nombres Rationnels ℚ<br/>1/2, 3/4, -2/3...]
    D --> E[Nombres Réels ℝ<br/>π, √2, e...]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    style C fill:#e8f5e9,stroke:#388e3c,stroke-width:3px
    style D fill:#fff3e0,stroke:#f57c00,stroke-width:3px
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:3px`
        },
        {
          title: "Opérations sur les Ensembles",
          description: "Les opérations principales entre ensembles",
          mermaid: `graph LR
    A[Ensemble A] --> U[Union A ∪ B<br/>Tous les éléments]
    B[Ensemble B] --> U
    A --> I[Intersection A ∩ B<br/>Éléments communs]
    B --> I
    A --> D[Différence A - B<br/>Dans A mais pas dans B]
    B --> D
    
    style A fill:#bbdefb,stroke:#1976d2,stroke-width:2px
    style B fill:#c5cae9,stroke:#303f9f,stroke-width:2px
    style U fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style I fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
    style D fill:#f8bbd0,stroke:#c2185b,stroke-width:2px`
        }
      ],
      "plans-droites": [
        {
          title: "Classification des Droites",
          mermaid: `graph TD
    A[Droites dans l'Espace] --> B[Droites Parallèles<br/>Jamais d'intersection]
    A --> C[Droites Sécantes<br/>Un point commun]
    A --> D[Droites Perpendiculaires<br/>Angle droit 90°]
    A --> E[Droites Gauches<br/>Non coplanaires]
    
    style A fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    style B fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style E fill:#fce4ec,stroke:#c2185b,stroke-width:2px`
        }
      ],
      "nombres-naturels": [
        {
          title: "Propriétés des Nombres Naturels",
          mermaid: `graph TD
    A[Nombres Naturels ℕ] --> B[Nombres Pairs<br/>0, 2, 4, 6...]
    A --> C[Nombres Impairs<br/>1, 3, 5, 7...]
    B --> D[Divisibles par 2]
    C --> E[Non divisibles par 2]
    A --> F[Nombres Premiers<br/>2, 3, 5, 7, 11...]
    F --> G[Divisibles uniquement<br/>par 1 et eux-mêmes]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style C fill:#ffe0b2,stroke:#f57c00,stroke-width:2px
    style F fill:#f8bbd0,stroke:#c2185b,stroke-width:2px`
        }
      ],
      "numeration-binaire": [
        {
          title: "Conversion Décimal ↔ Binaire",
          mermaid: `graph LR
    A[Nombre Décimal<br/>13] --> B[Division par 2<br/>13 ÷ 2 = 6 reste 1]
    B --> C[6 ÷ 2 = 3 reste 0]
    C --> D[3 ÷ 2 = 1 reste 1]
    D --> E[1 ÷ 2 = 0 reste 1]
    E --> F[Binaire: 1101]
    
    F --> G[Puissances de 2<br/>1×2³ + 1×2² + 0×2¹ + 1×2⁰]
    G --> A
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style F fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
    style G fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
        }
      ],
      "fractions": [
        {
          title: "Opérations sur les Fractions",
          mermaid: `graph TD
    A[Fractions] --> B[Addition/Soustraction<br/>Même dénominateur]
    A --> C[Multiplication<br/>Numérateur × Numérateur<br/>Dénominateur × Dénominateur]
    A --> D[Division<br/>Multiplier par l'inverse]
    A --> E[Simplification<br/>Diviser par PGCD]
    
    B --> F[1/4 + 2/4 = 3/4]
    C --> G[2/3 × 3/4 = 6/12 = 1/2]
    D --> H[1/2 ÷ 3/4 = 1/2 × 4/3 = 2/3]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style C fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style D fill:#f8bbd0,stroke:#c2185b,stroke-width:2px
    style E fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px`
        }
      ],
      "proportionnalite": [
        {
          title: "Reconnaître une Situation de Proportionnalité",
          mermaid: `graph TD
    A[Proportionnalité] --> B[Tableau de proportionnalité]
    B --> C[Coefficient constant<br/>k = y/x]
    C --> D[Vérification:<br/>Tous les rapports égaux]
    D --> E[Graphique:<br/>Droite passant par origine]
    
    A --> F[Applications]
    F --> G[Pourcentages]
    F --> H[Échelles]
    F --> I[Vitesse = Distance/Temps]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style C fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style E fill:#fff3e0,stroke:#f57c00,stroke-width:2px`
        }
      ],
      "statistiques": [
        {
          title: "Indicateurs Statistiques",
          mermaid: `graph TD
    A[Données Statistiques] --> B[Tendance Centrale]
    A --> C[Dispersion]
    
    B --> D[Moyenne<br/>Somme / Effectif total]
    B --> E[Médiane<br/>Valeur centrale]
    B --> F[Mode<br/>Valeur la plus fréquente]
    
    C --> G[Étendue<br/>Max - Min]
    C --> H[Écart-type<br/>Mesure de dispersion]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
    style E fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px
    style F fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px`
        }
      ],
      "divisibilite": [
        {
          title: "Critères de Divisibilité",
          mermaid: `graph TD
    A[Nombre] --> B[Divisible par 2?<br/>Chiffre des unités pair]
    A --> C[Divisible par 3?<br/>Somme des chiffres divisible par 3]
    A --> D[Divisible par 5?<br/>Termine par 0 ou 5]
    A --> E[Divisible par 9?<br/>Somme des chiffres divisible par 9]
    A --> F[Divisible par 10?<br/>Termine par 0]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#f8bbd0,stroke:#c2185b,stroke-width:2px
    style E fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style F fill:#e1bee7,stroke:#8e24aa,stroke-width:2px`
        }
      ],
      "polygones": [
        {
          title: "Classification des Polygones",
          mermaid: `graph TD
    A[Polygones] --> B[Triangle<br/>3 côtés]
    A --> C[Quadrilatère<br/>4 côtés]
    A --> D[Pentagone<br/>5 côtés]
    A --> E[Hexagone<br/>6 côtés]
    
    B --> F[Équilatéral<br/>Isocèle<br/>Scalène]
    C --> G[Carré<br/>Rectangle<br/>Losange<br/>Parallélogramme]
    
    style A fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style B fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    style C fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style D fill:#f8bbd0,stroke:#c2185b,stroke-width:2px
    style E fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px`
        }
      ]
    };

    return schemas[id] || [];
  };

  const schemas = getSchemaForTopic(topicId);

  if (schemas.length === 0 || !mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      {schemas.map((schema, index) => (
        <Card 
          key={index} 
          className="lesson-card border-none rounded-2xl sm:rounded-[20px] shadow-xl overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5"
        >
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg md:text-xl">
              <Network className="text-primary shrink-0" size={20} />
              <span className="text-lg sm:text-xl">📊</span> {schema.title}
            </CardTitle>
            {schema.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">{schema.description}</p>
            )}
          </CardHeader>
          <CardContent className="p-4 sm:p-6 bg-background/50">
            <div className="mermaid-container bg-card dark:bg-slate-900 p-4 sm:p-6 rounded-xl border-2 border-primary/10 overflow-x-auto">
              <pre className="mermaid text-center">
                {schema.mermaid}
              </pre>
            </div>
            <div className="mt-4 p-3 sm:p-4 bg-info/10 rounded-lg border border-info/30">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-info shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Ce diagramme te montre visuellement les concepts clés de <strong>{topicTitle}</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
