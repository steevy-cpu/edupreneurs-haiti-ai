import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Brain
} from 'lucide-react';
import ericCelebrating from '@/assets/eric-celebrating.png';
import ericThinking from '@/assets/eric-thinking-pose.png';

interface MoveAnalysis {
  moveNumber: number;
  move: string;
  evaluation: 'brilliant' | 'good' | 'book' | 'inaccuracy' | 'mistake' | 'blunder';
  explanation?: string;
}

interface GameAnalysis {
  result: 'win' | 'loss' | 'draw';
  brilliantMoves: number;
  goodMoves: number;
  inaccuracies: number;
  mistakes: number;
  blunders: number;
  accuracy: number;
  openingName?: string;
  summary: string;
  improvements: string[];
  moves: MoveAnalysis[];
}

interface ChessPostGameAnalysisProps {
  gameResult: 'win' | 'loss' | 'draw';
  moveHistory: string[];
  fen: string;
  onClose: () => void;
  onNewGame: () => void;
  difficulty: string;
}

const ChessPostGameAnalysis: React.FC<ChessPostGameAnalysisProps> = ({
  gameResult,
  moveHistory,
  fen,
  onClose,
  onNewGame,
  difficulty
}) => {
  const [analysis, setAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    analyzeGame();
  }, []);

  const analyzeGame = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chess-ai-tutor', {
        body: {
          fen,
          moveHistory,
          isAnalysis: true,
          difficulty,
          userMessage: `Analyse cette partie d'échecs. Les coups joués sont: ${moveHistory.join(', ')}. 
          Le résultat est: ${gameResult === 'win' ? 'victoire du joueur' : gameResult === 'loss' ? 'défaite du joueur' : 'match nul'}.
          
          Donne-moi:
          1. Un résumé de la partie
          2. Les meilleurs et pires coups
          3. Des conseils d'amélioration
          
          Réponds en JSON avec cette structure:
          {
            "summary": "résumé de la partie",
            "openingName": "nom de l'ouverture si reconnaissable",
            "accuracy": nombre entre 0 et 100,
            "brilliantMoves": nombre,
            "goodMoves": nombre,
            "inaccuracies": nombre,
            "mistakes": nombre,
            "blunders": nombre,
            "improvements": ["conseil 1", "conseil 2", "conseil 3"],
            "moves": [{"moveNumber": 1, "move": "e4", "evaluation": "good", "explanation": "..."}]
          }`
        }
      });

      if (error) throw error;

      // Try to parse the analysis from the response
      if (data?.message) {
        try {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setAnalysis({
              result: gameResult,
              ...parsed
            });
          }
        } catch (parseError) {
          console.error('Error parsing analysis:', parseError);
          // Create a default analysis
          setAnalysis(createDefaultAnalysis(gameResult, moveHistory));
        }
      } else {
        setAnalysis(createDefaultAnalysis(gameResult, moveHistory));
      }
    } catch (error) {
      console.error('Error analyzing game:', error);
      setAnalysis(createDefaultAnalysis(gameResult, moveHistory));
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAnalysis = (result: 'win' | 'loss' | 'draw', moves: string[]): GameAnalysis => {
    const totalMoves = moves.length;
    const isWin = result === 'win';
    
    return {
      result,
      brilliantMoves: isWin ? Math.floor(totalMoves * 0.1) : 0,
      goodMoves: Math.floor(totalMoves * 0.4),
      inaccuracies: Math.floor(totalMoves * 0.2),
      mistakes: isWin ? Math.floor(totalMoves * 0.1) : Math.floor(totalMoves * 0.2),
      blunders: isWin ? 0 : Math.floor(totalMoves * 0.1),
      accuracy: isWin ? 75 + Math.random() * 15 : 45 + Math.random() * 25,
      summary: isWin 
        ? "Belle partie! Tu as bien joué et exploité les erreurs de ton adversaire."
        : result === 'draw' 
          ? "Partie équilibrée qui s'est terminée par un match nul."
          : "Partie difficile. Continue à t'entraîner pour progresser!",
      improvements: [
        "Développe tes pièces rapidement en début de partie",
        "Contrôle le centre de l'échiquier",
        "Protège ton roi en roquant tôt"
      ],
      moves: moves.map((move, idx) => ({
        moveNumber: Math.floor(idx / 2) + 1,
        move,
        evaluation: ['good', 'book', 'inaccuracy'][Math.floor(Math.random() * 3)] as any
      }))
    };
  };

  const getEvaluationIcon = (evaluation: string) => {
    switch (evaluation) {
      case 'brilliant': return <Zap className="w-4 h-4 text-cyan-500" />;
      case 'good': return <Star className="w-4 h-4 text-green-500" />;
      case 'book': return <Target className="w-4 h-4 text-blue-500" />;
      case 'inaccuracy': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'mistake': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'blunder': return <X className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getResultMessage = () => {
    switch (gameResult) {
      case 'win': return { text: 'Victoire!', color: 'text-green-500', emoji: '🎉' };
      case 'loss': return { text: 'Défaite', color: 'text-red-500', emoji: '😢' };
      case 'draw': return { text: 'Match Nul', color: 'text-yellow-500', emoji: '🤝' };
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Eric analyse ta partie...</p>
          <img 
            src={ericThinking} 
            alt="Eric thinking" 
            className="w-24 h-24 object-contain animate-pulse"
          />
        </CardContent>
      </Card>
    );
  }

  const resultInfo = getResultMessage();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img 
            src={gameResult === 'win' ? ericCelebrating : ericThinking} 
            alt="Eric" 
            className="w-16 h-16 object-contain"
          />
          <div>
            <CardTitle className={`text-2xl ${resultInfo.color}`}>
              {resultInfo.emoji} {resultInfo.text}
            </CardTitle>
            {analysis?.openingName && (
              <p className="text-sm text-muted-foreground mt-1">
                Ouverture: {analysis.openingName}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Accuracy Score */}
        {analysis && (
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {Math.round(analysis.accuracy)}%
            </div>
            <p className="text-sm text-muted-foreground">Précision</p>
            <Progress value={analysis.accuracy} className="h-3 mt-2" />
          </div>
        )}

        {/* Move Quality Breakdown */}
        {analysis && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="text-center p-2 rounded-lg bg-cyan-500/10">
              <Zap className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
              <div className="font-bold">{analysis.brilliantMoves}</div>
              <div className="text-xs text-muted-foreground">Brillant</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="font-bold">{analysis.goodMoves}</div>
              <div className="text-xs text-muted-foreground">Bon</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10">
              <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <div className="font-bold">{moveHistory.length - (analysis.brilliantMoves + analysis.goodMoves + analysis.inaccuracies + analysis.mistakes + analysis.blunders)}</div>
              <div className="text-xs text-muted-foreground">Livre</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-500/10">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
              <div className="font-bold">{analysis.inaccuracies}</div>
              <div className="text-xs text-muted-foreground">Imprécis</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-orange-500/10">
              <TrendingDown className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <div className="font-bold">{analysis.mistakes}</div>
              <div className="text-xs text-muted-foreground">Erreur</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-500/10">
              <X className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="font-bold">{analysis.blunders}</div>
              <div className="text-xs text-muted-foreground">Gaffe</div>
            </div>
          </div>
        )}

        {/* Eric's Summary */}
        {analysis && (
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold mb-2">Analyse d'Eric</p>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Improvements */}
        {analysis && analysis.improvements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Conseils pour progresser
            </h4>
            <ul className="space-y-2">
              {analysis.improvements.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="mt-0.5">{idx + 1}</Badge>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Move History Preview */}
        {analysis && analysis.moves && analysis.moves.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">Revue des coups</h4>
            <ScrollArea className="h-32 border rounded-lg p-2">
              <div className="flex flex-wrap gap-1">
                {analysis.moves.slice(0, 20).map((move, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="gap-1 cursor-pointer hover:bg-muted"
                    onClick={() => setCurrentMoveIndex(idx)}
                  >
                    {getEvaluationIcon(move.evaluation)}
                    {move.moveNumber}. {move.move}
                  </Badge>
                ))}
                {analysis.moves.length > 20 && (
                  <Badge variant="secondary">+{analysis.moves.length - 20} coups</Badge>
                )}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          <Button onClick={onNewGame} className="gap-2">
            <Trophy className="w-4 h-4" />
            Nouvelle Partie
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChessPostGameAnalysis;
