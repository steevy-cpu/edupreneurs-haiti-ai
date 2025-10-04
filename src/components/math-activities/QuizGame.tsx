import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizGameProps {
  topic: string;
  questions: QuizQuestion[];
  onComplete: (score: number, goldEarned: number) => void;
}

export const QuizGame = ({ topic, questions, onComplete }: QuizGameProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const awardGold = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current gold
      const { data: profile } = await supabase
        .from('profiles')
        .select('gold_earned')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ gold_earned: (profile.gold_earned || 0) + 1 })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error awarding gold:', error);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      await awardGold();
      toast({
        title: "🎉 +1 Gold!",
        description: "Bonne réponse!",
        duration: 2000,
      });
    }
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore = score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0);
      const goldEarned = Math.round((finalScore / questions.length) * 100);
      setIsComplete(true);
      onComplete(finalScore, goldEarned);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isComplete) {
    const percentage = (score / questions.length) * 100;
    return (
      <Card className="p-8 text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">{percentage >= 70 ? "Excellent !" : percentage >= 50 ? "Bien !" : "Continue!"}</h2>
          <p className="text-muted-foreground">
            Tu as obtenu {score}/{questions.length} bonnes réponses
          </p>
        </div>
        <div className="p-6 bg-accent/10 rounded-xl">
          <p className="text-2xl font-bold gold-text">
            +{Math.round(percentage)} gold gagnés! 🏆
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Question {currentQuestion + 1}/{questions.length}</span>
          <span className="text-muted-foreground">Score: {score}/{currentQuestion}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="p-6 space-y-6">
        <h3 className="text-xl font-bold">{currentQ.question}</h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQ.correctAnswer;
            const showCorrect = showResult && isCorrect;
            const showWrong = showResult && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                  showCorrect
                    ? "bg-success/10 border-success"
                    : showWrong
                    ? "bg-destructive/10 border-destructive"
                    : isSelected
                    ? "bg-primary/10 border-primary"
                    : "border-border hover:border-primary/50 hover:bg-accent/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                  {showWrong && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className="p-4 bg-muted/50 rounded-lg animate-fade-in">
            <p className="text-sm font-medium mb-1">Explication:</p>
            <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          {!showResult ? (
            <Button 
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              size="lg"
            >
              Valider
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              {currentQuestion < questions.length - 1 ? "Question suivante" : "Voir les résultats"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
