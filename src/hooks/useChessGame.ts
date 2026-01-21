import { useState, useCallback, useEffect } from 'react';
import { Chess, Move } from 'chess.js';
import { supabase } from '@/integrations/supabase/client';
import { useChessSounds } from './useChessSounds';
import { useToast } from './use-toast';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classic' | 'untimed';
export type GameMode = 'ai' | 'training' | 'puzzle';
export type GameResult = 'win' | 'loss' | 'draw' | 'ongoing';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MoveEvaluation {
  move: string;
  evaluation: 'brilliant' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'normal';
  explanation?: string;
}

interface GameState {
  game: Chess;
  messages: ChatMessage[];
  isThinking: boolean;
  gameStatus: string;
  lastMove: { from: string; to: string } | null;
  capturedByWhite: string[];
  capturedByBlack: string[];
  moveHistory: string[];
  gameHistory: string[];
  moveEvaluations: MoveEvaluation[];
  gameStartTime: Date | null;
  whiteTime: number;
  blackTime: number;
  isGameOver: boolean;
  gameResult: GameResult;
}

const getTimeForControl = (control: TimeControl): number => {
  switch (control) {
    case 'bullet': return 60; // 1 minute
    case 'blitz': return 180; // 3 minutes
    case 'rapid': return 600; // 10 minutes
    case 'classic': return 1800; // 30 minutes
    case 'untimed': return Infinity;
  }
};

export const useChessGame = (
  difficulty: DifficultyLevel = 'intermediate',
  timeControl: TimeControl = 'untimed',
  gameMode: GameMode = 'ai'
) => {
  const { toast } = useToast();
  const { playSound } = useChessSounds();
  
  const [state, setState] = useState<GameState>({
    game: new Chess(),
    messages: [],
    isThinking: false,
    gameStatus: "C'est ton tour!",
    lastMove: null,
    capturedByWhite: [],
    capturedByBlack: [],
    moveHistory: [],
    gameHistory: [],
    moveEvaluations: [],
    gameStartTime: null,
    whiteTime: getTimeForControl(timeControl),
    blackTime: getTimeForControl(timeControl),
    isGameOver: false,
    gameResult: 'ongoing',
  });

  const [userNickname, setUserNickname] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState(difficulty);
  const [currentTimeControl, setCurrentTimeControl] = useState(timeControl);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setUserNickname(profile.nickname);
        }
      }
    };
    fetchProfile();
  }, []);

  // Update game status
  useEffect(() => {
    const { game } = state;
    
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Eric' : 'Toi';
      setState(prev => ({
        ...prev,
        gameStatus: `🏆 Échec et mat! ${winner} a gagné!`,
        isGameOver: true,
        gameResult: game.turn() === 'w' ? 'loss' : 'win'
      }));
      playSound('checkmate');
    } else if (game.isDraw()) {
      setState(prev => ({
        ...prev,
        gameStatus: '🤝 Match nul!',
        isGameOver: true,
        gameResult: 'draw'
      }));
      playSound('gameEnd');
    } else if (game.isStalemate()) {
      setState(prev => ({
        ...prev,
        gameStatus: '🤝 Pat - Match nul!',
        isGameOver: true,
        gameResult: 'draw'
      }));
      playSound('gameEnd');
    } else if (game.isCheck()) {
      setState(prev => ({
        ...prev,
        gameStatus: '⚠️ Échec!'
      }));
      playSound('check');
    } else if (game.turn() === 'w') {
      setState(prev => ({
        ...prev,
        gameStatus: "C'est ton tour!"
      }));
    } else {
      setState(prev => ({
        ...prev,
        gameStatus: "Tour d'Eric..."
      }));
    }
  }, [state.game.fen(), playSound]);

  // Timer effect
  useEffect(() => {
    if (currentTimeControl === 'untimed' || state.isGameOver || !state.gameStartTime) {
      return;
    }

    const interval = setInterval(() => {
      setState(prev => {
        const isWhiteTurn = prev.game.turn() === 'w';
        const newWhiteTime = isWhiteTurn ? Math.max(0, prev.whiteTime - 1) : prev.whiteTime;
        const newBlackTime = !isWhiteTurn ? Math.max(0, prev.blackTime - 1) : prev.blackTime;

        // Check for time out
        if (newWhiteTime === 0 || newBlackTime === 0) {
          playSound('gameEnd');
          return {
            ...prev,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime,
            isGameOver: true,
            gameResult: newWhiteTime === 0 ? 'loss' : 'win',
            gameStatus: newWhiteTime === 0 ? "⏱️ Temps écoulé! Eric gagne!" : "⏱️ Temps écoulé! Tu gagnes!"
          };
        }

        return {
          ...prev,
          whiteTime: newWhiteTime,
          blackTime: newBlackTime
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentTimeControl, state.isGameOver, state.gameStartTime, playSound]);

  const callChessAI = async (isEricTurn: boolean, userMessage?: string, fen?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('chess-ai-tutor', {
        body: {
          fen: fen || state.game.fen(),
          chatHistory: state.messages.slice(-10),
          userMessage,
          userNickname,
          isEricTurn,
          difficulty: currentDifficulty
        }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Trop de requêtes",
            description: "Attends quelques secondes avant de réessayer.",
            variant: "destructive"
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "Service indisponible",
            description: "Le service est temporairement indisponible.",
            variant: "destructive"
          });
        }
        throw error;
      }
      
      if (data?.error === 'rate_limit' || data?.error === 'payment_required') {
        toast({
          title: data.error === 'rate_limit' ? "Trop de requêtes" : "Service indisponible",
          description: data.message,
          variant: "destructive"
        });
        throw new Error(data.message);
      }
      
      return data;
    } catch (error) {
      console.error('Error calling chess AI:', error);
      throw error;
    }
  };

  const generateFallbackExplanation = (move: Move): string => {
    if (move.captured) {
      return `Je capture ta pièce avec ${move.san}! 🎯`;
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
      return `Je fais le roque pour mettre mon roi en sécurité! 🏰`;
    } else if (move.san.startsWith('N')) {
      return `Je développe mon cavalier! 🐴`;
    } else if (move.san.startsWith('B')) {
      return `Je place mon fou sur une belle diagonale! 📐`;
    } else if (move.san.startsWith('Q')) {
      return `Je bouge ma dame pour contrôler plus de cases! 👑`;
    } else if (move.san.startsWith('R')) {
      return `Je positionne ma tour! 🏰`;
    }
    return `Je joue ${move.san}! 🎯`;
  };

  const makeEricMove = useCallback(async () => {
    if (state.game.turn() !== 'b' || state.game.isGameOver() || state.isGameOver) {
      return;
    }

    setState(prev => ({ ...prev, isThinking: true }));

    try {
      const currentFen = state.game.fen();
      const response = await callChessAI(true, undefined, currentFen);
      const gameCopy = new Chess(currentFen);

      if (response.type === 'move' && response.move) {
        const from = response.move.substring(0, 2);
        const to = response.move.substring(2, 4);
        const promotion = response.move.length > 4 ? response.move[4] : undefined;

        try {
          const moveResult = gameCopy.move({ from, to, promotion });
          
          if (moveResult) {
            if (moveResult.captured) {
              playSound('capture');
            } else {
              playSound('move');
            }
            
            const explanation = response.explanation || generateFallbackExplanation(moveResult);
            
            setState(prev => ({
              ...prev,
              game: gameCopy,
              lastMove: { from: moveResult.from, to: moveResult.to },
              moveHistory: [...prev.moveHistory, moveResult.san],
              capturedByBlack: moveResult.captured 
                ? [...prev.capturedByBlack, moveResult.captured]
                : prev.capturedByBlack,
              messages: [...prev.messages, {
                role: 'assistant',
                content: explanation,
                timestamp: new Date()
              }],
              isThinking: false
            }));
            return;
          }
        } catch (e) {
          console.log('Move failed, trying fallback');
        }
      }

      // Fallback: make random move
      const validMoves = gameCopy.moves({ verbose: true });
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        gameCopy.move(randomMove);
        
        if (randomMove.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
        
        setState(prev => ({
          ...prev,
          game: gameCopy,
          lastMove: { from: randomMove.from, to: randomMove.to },
          moveHistory: [...prev.moveHistory, randomMove.san],
          capturedByBlack: randomMove.captured 
            ? [...prev.capturedByBlack, randomMove.captured!]
            : prev.capturedByBlack,
          messages: [...prev.messages, {
            role: 'assistant',
            content: generateFallbackExplanation(randomMove),
            timestamp: new Date()
          }],
          isThinking: false
        }));
      }
    } catch (error) {
      console.error('Error making Eric move:', error);
      
      // Error fallback
      const gameCopy = new Chess(state.game.fen());
      const validMoves = gameCopy.moves({ verbose: true });
      
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        gameCopy.move(randomMove);
        
        playSound('move');
        
        setState(prev => ({
          ...prev,
          game: gameCopy,
          lastMove: { from: randomMove.from, to: randomMove.to },
          moveHistory: [...prev.moveHistory, randomMove.san],
          messages: [...prev.messages, {
            role: 'assistant',
            content: `Je joue ${randomMove.san}! 😅`,
            timestamp: new Date()
          }],
          isThinking: false
        }));
      }
    }
  }, [state.game, state.messages, userNickname, currentDifficulty, playSound, toast]);

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (state.isGameOver) return false;
    
    const currentFen = state.game.fen();
    const gameCopy = new Chess(currentFen);
    
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' });
      
      if (move) {
        // Start game timer on first move
        const shouldStartTimer = !state.gameStartTime;
        
        if (move.captured) {
          playSound('capture');
        } else {
          playSound('move');
        }
        
        setState(prev => ({
          ...prev,
          game: gameCopy,
          gameHistory: [...prev.gameHistory, currentFen],
          lastMove: { from, to },
          moveHistory: [...prev.moveHistory, move.san],
          capturedByWhite: move.captured 
            ? [...prev.capturedByWhite, move.captured]
            : prev.capturedByWhite,
          messages: [...prev.messages, {
            role: 'user',
            content: `J'ai joué ${move.san}`,
            timestamp: new Date()
          }],
          gameStartTime: shouldStartTimer ? new Date() : prev.gameStartTime
        }));

        // Trigger Eric's turn
        if (!gameCopy.isGameOver()) {
          setTimeout(() => {
            makeEricMove();
          }, 500);
        }
        
        return true;
      }
    } catch (e) {
      console.error('Invalid move:', e);
    }
    
    return false;
  }, [state.game, state.gameStartTime, state.isGameOver, makeEricMove, playSound]);

  const handleNewGame = useCallback(() => {
    playSound('gameStart');
    
    const initialTime = getTimeForControl(currentTimeControl);
    
    setState({
      game: new Chess(),
      messages: [{
        role: 'assistant',
        content: `🎮 Nouvelle partie! Tu joues les blancs. Niveau: ${currentDifficulty}. ${currentTimeControl !== 'untimed' ? `Temps: ${Math.floor(initialTime / 60)} minutes.` : ''} Bonne chance ${userNickname || 'mon ami'}! ♟️`,
        timestamp: new Date()
      }],
      isThinking: false,
      gameStatus: "C'est ton tour!",
      lastMove: null,
      capturedByWhite: [],
      capturedByBlack: [],
      moveHistory: [],
      gameHistory: [],
      moveEvaluations: [],
      gameStartTime: null,
      whiteTime: initialTime,
      blackTime: initialTime,
      isGameOver: false,
      gameResult: 'ongoing'
    });
  }, [userNickname, currentDifficulty, currentTimeControl, playSound]);

  const handleUndo = useCallback(() => {
    if (state.gameHistory.length === 0 || state.isThinking || state.isGameOver) return;
    
    const newHistory = [...state.gameHistory];
    const previousFen = newHistory.pop();
    
    if (previousFen) {
      const newGame = new Chess(previousFen);
      playSound('move');
      
      setState(prev => ({
        ...prev,
        game: newGame,
        gameHistory: newHistory,
        moveHistory: prev.moveHistory.slice(0, -2),
        lastMove: null,
        messages: [...prev.messages, {
          role: 'assistant',
          content: "D'accord, j'annule le dernier coup! 🔄",
          timestamp: new Date()
        }]
      }));
    }
  }, [state.gameHistory, state.isThinking, state.isGameOver, playSound]);

  const handleSendMessage = useCallback(async (message: string) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        role: 'user',
        content: message,
        timestamp: new Date()
      }],
      isThinking: true
    }));

    try {
      const response = await callChessAI(false, message);
      
      if (response.message) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            role: 'assistant',
            content: response.message,
            timestamp: new Date()
          }],
          isThinking: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          role: 'assistant',
          content: "Désolé, je n'ai pas pu répondre. 😅",
          timestamp: new Date()
        }],
        isThinking: false
      }));
    }
  }, [state.messages, userNickname]);

  const setDifficulty = useCallback((newDifficulty: DifficultyLevel) => {
    setCurrentDifficulty(newDifficulty);
    
    const difficultyNames = {
      beginner: 'débutant 🌱',
      intermediate: 'intermédiaire 🎯',
      advanced: 'avancé 💪',
      expert: 'expert 🏆'
    };
    
    toast({
      title: "Niveau changé",
      description: `Mode ${difficultyNames[newDifficulty]}`
    });
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, {
        role: 'assistant',
        content: `Je joue maintenant en mode ${difficultyNames[newDifficulty]}! ${
          newDifficulty === 'beginner' 
            ? "Je ferai des erreurs pour t'aider! 😊" 
            : newDifficulty === 'expert'
            ? "Attention, je joue mes meilleurs coups! 💪"
            : "Je joue de manière équilibrée. 🎯"
        }`,
        timestamp: new Date()
      }]
    }));
  }, [toast]);

  const setTimeControl = useCallback((newTimeControl: TimeControl) => {
    setCurrentTimeControl(newTimeControl);
    const newTime = getTimeForControl(newTimeControl);
    
    setState(prev => ({
      ...prev,
      whiteTime: newTime,
      blackTime: newTime
    }));
  }, []);

  // Save game result to database
  const saveGameResult = useCallback(async () => {
    if (!userId || state.gameResult === 'ongoing') return;

    try {
      const gameData = {
        user_id: userId,
        opponent_type: 'ai',
        difficulty: currentDifficulty,
        time_control: currentTimeControl,
        result: state.gameResult,
        moves_count: state.moveHistory.length,
        final_fen: state.game.fen(),
        move_history: state.moveHistory,
        started_at: state.gameStartTime?.toISOString(),
        ended_at: new Date().toISOString()
      };

      await supabase.from('chess_games').insert(gameData);

      // Update stats
      const { data: existingStats } = await supabase
        .from('chess_player_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingStats) {
        const updates: Record<string, number> = {
          games_played: existingStats.games_played + 1,
          total_moves: existingStats.total_moves + state.moveHistory.length
        };

        if (state.gameResult === 'win') {
          updates.games_won = existingStats.games_won + 1;
          updates.current_winning_streak = existingStats.current_winning_streak + 1;
          if (updates.current_winning_streak > existingStats.longest_winning_streak) {
            updates.longest_winning_streak = updates.current_winning_streak;
          }
          updates.elo_rating = existingStats.elo_rating + 25;
        } else if (state.gameResult === 'loss') {
          updates.games_lost = existingStats.games_lost + 1;
          updates.current_winning_streak = 0;
          updates.elo_rating = Math.max(400, existingStats.elo_rating - 15);
        } else {
          updates.games_drawn = existingStats.games_drawn + 1;
          updates.current_winning_streak = 0;
        }

        await supabase
          .from('chess_player_stats')
          .update(updates)
          .eq('user_id', userId);
      } else {
        const newStats = {
          user_id: userId,
          elo_rating: state.gameResult === 'win' ? 825 : state.gameResult === 'loss' ? 785 : 800,
          games_played: 1,
          games_won: state.gameResult === 'win' ? 1 : 0,
          games_lost: state.gameResult === 'loss' ? 1 : 0,
          games_drawn: state.gameResult === 'draw' ? 1 : 0,
          total_moves: state.moveHistory.length,
          current_winning_streak: state.gameResult === 'win' ? 1 : 0,
          longest_winning_streak: state.gameResult === 'win' ? 1 : 0
        };

        await supabase.from('chess_player_stats').insert(newStats);
      }
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  }, [userId, state.gameResult, state.moveHistory, state.game, state.gameStartTime, currentDifficulty, currentTimeControl]);

  // Save game when it ends
  useEffect(() => {
    if (state.isGameOver && state.gameResult !== 'ongoing') {
      saveGameResult();
    }
  }, [state.isGameOver, state.gameResult, saveGameResult]);

  return {
    ...state,
    difficulty: currentDifficulty,
    timeControl: currentTimeControl,
    userNickname,
    canUndo: state.gameHistory.length > 0 && !state.isThinking && !state.isGameOver,
    handlePlayerMove,
    handleNewGame,
    handleUndo,
    handleSendMessage,
    setDifficulty,
    setTimeControl
  };
};
