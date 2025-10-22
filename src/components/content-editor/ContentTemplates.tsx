import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Copy } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
}

const templates: Template[] = [
  {
    id: "math-theorem",
    name: "Théorème Mathématique",
    category: "Mathématiques",
    description: "Structure pour présenter un théorème avec preuve et exemples",
    content: `<div class="theorem-lesson">
  <section class="theorem-statement">
    <h2>Énoncé du Théorème</h2>
    <div class="theorem-box">
      <strong>[Nom du théorème]</strong>
      <p>[Énoncé formel]</p>
    </div>
  </section>
  
  <section class="theorem-proof">
    <h2>Démonstration</h2>
    <ol>
      <li><strong>Hypothèse:</strong> [Hypothèses]</li>
      <li><strong>Étape 1:</strong> [Première étape]</li>
      <li><strong>Étape 2:</strong> [Deuxième étape]</li>
      <li><strong>Conclusion:</strong> [Conclusion]</li>
    </ol>
  </section>
  
  <section class="applications">
    <h2>Applications</h2>
    <div class="example">
      <h3>Exemple 1</h3>
      <p>[Application pratique]</p>
    </div>
  </section>
</div>`,
  },
  {
    id: "science-experiment",
    name: "Expérience Scientifique",
    category: "Sciences",
    description: "Guide pour documenter une expérience scientifique",
    content: `<div class="experiment-lesson">
  <section class="objective">
    <h2>🎯 Objectif de l'Expérience</h2>
    <p>[But de l'expérience]</p>
  </section>
  
  <section class="materials">
    <h2>🔬 Matériel Nécessaire</h2>
    <ul>
      <li>[Matériel 1]</li>
      <li>[Matériel 2]</li>
      <li>[Matériel 3]</li>
    </ul>
  </section>
  
  <section class="procedure">
    <h2>📋 Protocole</h2>
    <ol>
      <li>[Étape 1]</li>
      <li>[Étape 2]</li>
      <li>[Étape 3]</li>
    </ol>
  </section>
  
  <section class="observations">
    <h2>👁️ Observations</h2>
    <p>[Ce qu'on observe]</p>
  </section>
  
  <section class="conclusion">
    <h2>💡 Conclusion</h2>
    <p>[Que peut-on conclure?]</p>
  </section>
</div>`,
  },
  {
    id: "history-event",
    name: "Événement Historique",
    category: "Histoire",
    description: "Structure pour présenter un événement historique important",
    content: `<div class="history-lesson">
  <section class="context">
    <h2>📅 Contexte Historique</h2>
    <p><strong>Date:</strong> [Date]</p>
    <p><strong>Lieu:</strong> [Lieu]</p>
    <p>[Contexte général]</p>
  </section>
  
  <section class="causes">
    <h2>🔍 Causes</h2>
    <ul>
      <li><strong>Cause 1:</strong> [Description]</li>
      <li><strong>Cause 2:</strong> [Description]</li>
    </ul>
  </section>
  
  <section class="events">
    <h2>⚡ Déroulement</h2>
    <ol>
      <li>[Événement 1]</li>
      <li>[Événement 2]</li>
      <li>[Événement 3]</li>
    </ol>
  </section>
  
  <section class="consequences">
    <h2>📊 Conséquences</h2>
    <ul>
      <li>[Conséquence 1]</li>
      <li>[Conséquence 2]</li>
    </ul>
  </section>
  
  <section class="significance">
    <h2>💭 Importance Historique</h2>
    <p>[Pourquoi cet événement est important]</p>
  </section>
</div>`,
  },
  {
    id: "language-grammar",
    name: "Règle de Grammaire",
    category: "Français",
    description: "Template pour enseigner une règle de grammaire",
    content: `<div class="grammar-lesson">
  <section class="rule">
    <h2>📝 La Règle</h2>
    <div class="rule-box">
      <strong>[Nom de la règle]</strong>
      <p>[Explication simple]</p>
    </div>
  </section>
  
  <section class="examples">
    <h2>✅ Exemples Corrects</h2>
    <ul>
      <li>[Exemple 1]</li>
      <li>[Exemple 2]</li>
      <li>[Exemple 3]</li>
    </ul>
  </section>
  
  <section class="counterexamples">
    <h2>❌ Erreurs Courantes</h2>
    <ul>
      <li><del>[Erreur]</del> → [Correction]</li>
      <li><del>[Erreur]</del> → [Correction]</li>
    </ul>
  </section>
  
  <section class="practice">
    <h2>💪 Exercices</h2>
    <div class="exercise">
      <p>[Phrase à corriger]</p>
      <details>
        <summary>Correction</summary>
        <p>[Correction avec explication]</p>
      </details>
    </div>
  </section>
</div>`,
  },
  {
    id: "quiz-template",
    name: "Quiz Interactif",
    category: "Évaluation",
    description: "Template pour créer un quiz de révision",
    content: `<div class="quiz-lesson">
  <section class="quiz-header">
    <h2>🎯 Quiz de Révision</h2>
    <p><strong>Sujet:</strong> [Sujet]</p>
    <p><strong>Nombre de questions:</strong> 10</p>
    <p><strong>Durée estimée:</strong> 15 minutes</p>
  </section>
  
  <section class="quiz-questions">
    <div class="question">
      <h3>Question 1</h3>
      <p>[Question]</p>
      <ul class="options">
        <li>A) [Option A]</li>
        <li>B) [Option B]</li>
        <li>C) [Option C]</li>
        <li>D) [Option D]</li>
      </ul>
      <details>
        <summary>Réponse</summary>
        <p><strong>Réponse correcte:</strong> [Lettre]</p>
        <p><strong>Explication:</strong> [Pourquoi cette réponse]</p>
      </details>
    </div>
  </section>
</div>`,
  },
];

interface ContentTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

export const ContentTemplates = ({ onSelectTemplate }: ContentTemplatesProps) => {
  const categories = Array.from(new Set(templates.map(t => t.category)));

  const copyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Template copié dans le presse-papier");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Templates de Contenu
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Templates prêts à l'emploi pour accélérer la création de contenu
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">
                    {templates.filter(t => t.category === category).length}
                  </Badge>
                </h3>
                <div className="space-y-2">
                  {templates
                    .filter(t => t.category === category)
                    .map((template) => (
                      <Card key={template.id} className="border-l-4 border-l-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{template.name}</h4>
                              <p className="text-sm text-muted-foreground mb-3">
                                {template.description}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => onSelectTemplate(template.content)}
                                >
                                  Utiliser
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyTemplate(template.content)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
