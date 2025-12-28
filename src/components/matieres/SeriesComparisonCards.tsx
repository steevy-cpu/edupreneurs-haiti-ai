import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  BookOpen, 
  Calculator, 
  Users, 
  FlaskConical,
  Briefcase,
  GraduationCap,
  ChevronRight,
  Info,
  Target,
  CheckCircle2
} from "lucide-react";

type Series = "LLA" | "SES" | "SMP" | "SVT";

interface SeriesOption {
  id: Series;
  name: string;
  fullName: string;
  description: string;
  icon: any;
  color: string;
  careers: string[];
  coreSubjects: string[];
  skills: string[];
}

const seriesData: SeriesOption[] = [
  {
    id: "LLA",
    name: "LLA",
    fullName: "Lettres, Langues et Arts",
    description: "Pour les passionnés de littérature, langues et expression artistique",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    careers: ["Journalisme", "Enseignement", "Traduction", "Communication", "Arts", "Droit"],
    coreSubjects: ["Français", "Littérature", "Philosophie", "Langues étrangères", "Histoire"],
    skills: ["Expression écrite", "Analyse littéraire", "Créativité", "Communication"]
  },
  {
    id: "SES",
    name: "SES",
    fullName: "Sciences Économiques et Sociales",
    description: "Pour comprendre l'économie, la société et les enjeux mondiaux",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    careers: ["Économiste", "Banque/Finance", "Gestion d'entreprise", "Ressources humaines", "Marketing"],
    coreSubjects: ["Économie", "Sciences sociales", "Mathématiques", "Droit", "Gestion"],
    skills: ["Analyse économique", "Pensée critique", "Gestion", "Compréhension sociale"]
  },
  {
    id: "SMP",
    name: "SMP",
    fullName: "Sciences Mathématiques et Physiques",
    description: "Pour les esprits analytiques et scientifiques",
    icon: Calculator,
    color: "from-emerald-500 to-emerald-600",
    careers: ["Ingénierie", "Informatique", "Recherche", "Architecture", "Aéronautique"],
    coreSubjects: ["Mathématiques", "Physique", "Chimie", "Informatique", "Technologie"],
    skills: ["Raisonnement logique", "Résolution de problèmes", "Analyse quantitative", "Programmation"]
  },
  {
    id: "SVT",
    name: "SVT",
    fullName: "Sciences de la Vie et de la Terre",
    description: "Pour explorer le vivant et notre planète",
    icon: FlaskConical,
    color: "from-amber-500 to-amber-600",
    careers: ["Médecine", "Pharmacie", "Biologie", "Environnement", "Agriculture", "Vétérinaire"],
    coreSubjects: ["Biologie", "Chimie", "Géologie", "Physique", "Mathématiques"],
    skills: ["Observation scientifique", "Expérimentation", "Analyse de données", "Recherche"]
  }
];

interface SeriesComparisonCardsProps {
  onSelectSeries: (series: Series) => void;
}

export function SeriesComparisonCards({ onSelectSeries }: SeriesComparisonCardsProps) {
  const [selectedForComparison, setSelectedForComparison] = useState<Series | null>(null);

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-semibold mb-2">Choisissez votre série</h3>
        <p className="text-muted-foreground text-sm max-w-xl mx-auto">
          Sélectionnez la série qui correspond à vos intérêts et objectifs de carrière
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seriesData.map((series) => {
          const IconComponent = series.icon;
          return (
            <Card
              key={series.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden relative"
              onClick={() => onSelectSeries(series.id)}
            >
              <div className={`h-2 bg-gradient-to-r ${series.color}`} />
              
              {/* Info button */}
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-foreground transition-colors z-10"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${series.color} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <DialogTitle className="text-xl">{series.fullName}</DialogTitle>
                    <DialogDescription>{series.description}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-primary" />
                        Matières principales
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {series.coreSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        Débouchés professionnels
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {series.careers.map((career) => (
                          <Badge key={career} variant="outline" className="text-xs">
                            {career}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        Compétences développées
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {series.skills.map((skill) => (
                          <li key={skill} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4"
                    onClick={() => onSelectSeries(series.id)}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Choisir cette série
                  </Button>
                </DialogContent>
              </Dialog>

              <CardContent className="p-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${series.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-center mb-2 group-hover:text-primary transition-colors">
                  {series.name}
                </h4>
                <p className="text-sm font-semibold text-center mb-3 text-muted-foreground">
                  {series.fullName}
                </p>
                <p className="text-sm text-center text-muted-foreground mb-4 line-clamp-2">
                  {series.description}
                </p>

                {/* Career preview */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {series.careers.slice(0, 3).map((career) => (
                    <Badge key={career} variant="outline" className="text-[10px]">
                      {career}
                    </Badge>
                  ))}
                  {series.careers.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{series.careers.length - 3}
                    </Badge>
                  )}
                </div>

                <Button 
                  variant="default" 
                  className="w-full group-hover:bg-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSeries(series.id);
                  }}
                >
                  Explorer
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
