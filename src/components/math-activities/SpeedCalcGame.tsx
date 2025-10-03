import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Zap, Trophy } from "lucide-react";

interface SpeedCalcGameProps {
  onComplete: (score: number, goldEarned: number) => void;
}

export const SpeedCalcGame = ({ onComplete }: SpeedCalcGameProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState({ a: 0, b: 0, op: "+" });
  const [answer, setAnswer] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const generateProblem = () => {
    const operations = ["+", "-", "×"];
    const op = operations[Math.floor(Math.random() * operations.length)];
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    setCurrentProblem({ a, b, op });
  };

  const calculateAnswer = () => {
    const { a, b, op } = currentProblem;
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      default: return 0;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correct = calculateAnswer();
    if (parseInt(answer) === correct) {
      setScore(score + 1);
      generateProblem();
      setAnswer("");
    }
  };

  const startGame = () => {
    setIsActive(true);
    setScore(0);
    setTimeLeft(60);
    generateProblem();
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setIsComplete(true);
      const goldEarned = score * 2;
      onComplete(score, goldEarned);
    }
  }, [timeLeft, isActive]);

  if (isComplete) {
    return (
      <Card className="p-8 text-center space-y-6 animate-scale-in">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-2">Temps écoulé!</h2>
          <p className="text-muted-foreground">Tu as résolu {score} calculs</p>
        </div>
        <div className="p-6 bg-accent/10 rounded-xl">
          <p className="text-2xl font-bold gold-text">
            +{score * 2} gold gagnés! 🏆
          </p>
        </div>
        <Button onClick={() => {
          setIsComplete(false);
          startGame();
        }}>
          Rejouer
        </Button>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card className="p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Calcul Rapide</h2>
          <p className="text-muted-foreground">
            Résous un maximum d'opérations en 60 secondes!
          </p>
        </div>
        <Button onClick={startGame} size="lg" className="gap-2">
          <Zap className="w-5 h-5" />
          Commencer
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold">⏱️ {timeLeft}s</div>
        <div className="text-2xl font-bold gold-text">Score: {score}</div>
      </div>

      <Progress value={(timeLeft / 60) * 100} className="h-2" />

      <Card className="p-8 space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold mb-6">
            {currentProblem.a} {currentProblem.op} {currentProblem.b} = ?
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Ta réponse"
              className="text-center text-2xl h-16"
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full">
              Valider
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};
