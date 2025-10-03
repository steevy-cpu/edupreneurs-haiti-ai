import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MatchPair {
  id: string;
  question: string;
  answer: string;
}

interface MatchingGameProps {
  pairs: MatchPair[];
  onComplete: (goldEarned: number) => void;
}

export const MatchingGame = ({ pairs, onComplete }: MatchingGameProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleQuestionClick = (id: string) => {
    if (matched.includes(id)) return;
    setSelectedQuestion(id);
  };

  const handleAnswerClick = (id: string) => {
    if (matched.includes(id) || !selectedQuestion) return;
    
    if (selectedQuestion === id) {
      setMatched([...matched, id]);
      setSelectedQuestion(null);
      
      if (matched.length + 1 === pairs.length) {
        setIsComplete(true);
        onComplete(25);
        toast({
          title: "Parfait! 🎉",
          description: "Tu as trouvé toutes les paires!",
        });
      }
    } else {
      toast({
        title: "Essaie encore",
        description: "Ce n'est pas la bonne paire!",
        variant: "destructive",
      });
      setSelectedQuestion(null);
    }
  };

  const reset = () => {
    setSelectedQuestion(null);
    setMatched([]);
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Card className="p-8 text-center space-y-4 animate-scale-in">
        <CheckCircle className="w-16 h-16 text-success mx-auto" />
        <h3 className="text-2xl font-bold">Bravo!</h3>
        <p className="text-muted-foreground">Tu as trouvé toutes les paires!</p>
        <p className="text-xl font-bold gold-text">+25 gold 🏆</p>
        <Button onClick={reset} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Rejouer
        </Button>
      </Card>
    );
  }

  const shuffledAnswers = [...pairs].sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Associe les paires</h3>
          <p className="text-sm text-muted-foreground">
            Clique sur une question puis sur sa réponse
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Questions Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center mb-2">Questions</h4>
            {pairs.map((pair) => (
              <button
                key={`q-${pair.id}`}
                onClick={() => handleQuestionClick(pair.id)}
                disabled={matched.includes(pair.id)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  matched.includes(pair.id)
                    ? "bg-success/10 border-success opacity-50"
                    : selectedQuestion === pair.id
                    ? "bg-primary/10 border-primary shadow-lg scale-105"
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                }`}
              >
                {pair.question}
              </button>
            ))}
          </div>

          {/* Answers Column */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center mb-2">Réponses</h4>
            {shuffledAnswers.map((pair) => (
              <button
                key={`a-${pair.id}`}
                onClick={() => handleAnswerClick(pair.id)}
                disabled={matched.includes(pair.id)}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  matched.includes(pair.id)
                    ? "bg-success/10 border-success opacity-50"
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                }`}
              >
                {pair.answer}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          {matched.length} / {pairs.length} paires trouvées
        </div>

        <Button onClick={reset} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Recommencer
        </Button>
      </Card>
    </div>
  );
};
