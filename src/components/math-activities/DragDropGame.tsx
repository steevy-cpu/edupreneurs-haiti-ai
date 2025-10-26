import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DragDropGameProps {
  numbers: number[];
  onComplete: (goldEarned: number) => void;
}

export const DragDropGame = ({ numbers, onComplete }: DragDropGameProps) => {
  const [items, setItems] = useState(numbers.sort(() => Math.random() - 0.5));
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"));
    
    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    setItems(newItems);
  };

  const checkOrder = () => {
    const isCorrect = items.every((num, idx) => 
      idx === 0 || num > items[idx - 1]
    );

    if (isCorrect) {
      setIsComplete(true);
      onComplete(30);
      toast({
        title: "Bravo! 🎉",
        description: "Tu as correctement ordonné tous les nombres!",
      });
    } else {
      toast({
        title: "Pas tout à fait...",
        description: "Vérifie l'ordre des nombres. Du plus petit au plus grand!",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setItems(numbers.sort(() => Math.random() - 0.5));
    setIsComplete(false);
  };

  if (isComplete) {
    return (
      <Card className="p-8 text-center space-y-4 animate-scale-in">
        <CheckCircle className="w-16 h-16 text-success mx-auto" />
        <h3 className="text-2xl font-bold">Excellent travail!</h3>
        <p className="text-muted-foreground">Tu as gagné 30 gold! 🏆</p>
        <Button onClick={reset} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Rejouer
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold">Ordonne les nombres</h3>
          <p className="text-sm text-muted-foreground">
            Glisse et dépose les nombres du plus petit au plus grand
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center p-6 bg-muted/30 rounded-xl min-h-[120px]">
          {items.map((number, index) => (
            <div
              key={`${number}-${index}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-primary-foreground rounded-xl flex items-center justify-center text-2xl font-bold cursor-move shadow-lg hover:scale-110 transition-transform"
            >
              {number}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={checkOrder} size="lg">
            Vérifier
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recommencer
          </Button>
        </div>
      </Card>
    </div>
  );
};
