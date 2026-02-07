import { useState } from "react";
import { ChevronDown, AlertTriangle, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  categorizeValidationIssue,
  ISSUE_CATEGORIES,
  type IssueCategoryKey,
} from "@/utils/validationCategories";

interface OffContentQuestion {
  index: number;
  question: string;
  reason: string;
}

interface ValidationDetailsPanelProps {
  lessonTitle: string;
  validationType: "quiz" | "activities";
  offContentQuestions: OffContentQuestion[];
  aligned: boolean;
  confidence: number;
  onRegenerate?: () => Promise<void>;
  isRegenerating?: boolean;
}

export const ValidationDetailsPanel = ({
  lessonTitle,
  validationType,
  offContentQuestions,
  aligned,
  confidence,
  onRegenerate,
  isRegenerating = false,
}: ValidationDetailsPanelProps) => {
  const [expanded, setExpanded] = useState(false);

  if (aligned && offContentQuestions.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-900">Aligné avec le contenu</p>
          <p className="text-xs text-emerald-700 mt-1">Confiance: {Math.round(confidence * 100)}%</p>
        </div>
      </div>
    );
  }

  // Group issues by category
  const issuesByCategory: Record<IssueCategoryKey, OffContentQuestion[]> = {
    concept_not_in_content: [],
    specific_data_missing: [],
    cultural_knowledge: [],
    formula_missing: [],
    other: [],
  };

  for (const issue of offContentQuestions) {
    const category = categorizeValidationIssue(issue.reason);
    issuesByCategory[category].push(issue);
  }

  const categoriesWithIssues = Object.entries(issuesByCategory).filter(
    ([, issues]) => issues.length > 0
  );

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded} className="w-full">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <CardTitle className="text-sm">Problèmes d'alignement détectés</CardTitle>
              </div>
              <CardDescription className="mt-1 text-xs">
                {offContentQuestions.length} question{offContentQuestions.length !== 1 ? 's' : ''} hors-contenu
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label={expanded ? "Réduire" : "Développer"}
              >
                <ChevronDown
                  className="h-4 w-4 transition-transform"
                  style={{
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {categoriesWithIssues.map(([categoryKey, issues]) => {
              const category = ISSUE_CATEGORIES[categoryKey as IssueCategoryKey];
              return (
                <div key={categoryKey} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
                    <span className="text-lg">{category.icon}</span>
                    <span>
                      {category.label} ({issues.length})
                    </span>
                  </div>
                  <div className="space-y-1 ml-6 border-l-2 border-amber-200 pl-3">
                    {issues.map((issue, idx) => (
                      <div key={idx} className="text-xs space-y-1">
                        <p className="font-medium text-amber-900">
                          Q{issue.index + 1}: {issue.question?.substring(0, 60) || 'Question non disponible'}
                          {issue.question && issue.question.length > 60 ? "..." : ""}
                        </p>
                        <p className="text-amber-700 italic">{issue.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 pt-3 border-t border-amber-200">
              <p className="text-xs text-amber-700 mb-2">
                <span className="font-medium">Recommandation:</span> Régénérez le{" "}
                {validationType === "quiz" ? "quiz" : "les activités"} pour résoudre ces problèmes.
              </p>
              {onRegenerate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRegenerate}
                  disabled={isRegenerating}
                  className="w-full gap-2"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Régénération en cours...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Régénérer {validationType === "quiz" ? "le quiz" : "les activités"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
