import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageSquare, Trophy, Palette } from "lucide-react";
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";

interface QuickAction {
  icon: typeof BookOpen;
  label: string;
  description: string;
  path: string;
  gradient: string;
}

const defaultActions: QuickAction[] = [
  {
    icon: BookOpen,
    label: "Continuer",
    description: "Reprendre l'apprentissage",
    path: "/matieres",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    description: "Voir les conversations",
    path: "/community",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Trophy,
    label: "Classement",
    description: "Voir ton rang",
    path: "/leaderboard",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Palette,
    label: "Passions",
    description: "Découvrir mes passions",
    path: "/passion-discovery",
    gradient: "from-purple-500 to-pink-500",
  },
];

interface QuickActionsCardProps {
  actions?: QuickAction[];
  unreadMessages?: number;
}

export const QuickActionsCard = ({ 
  actions = defaultActions,
  unreadMessages = 0,
}: QuickActionsCardProps) => {
  const navigate = useNavigate();
  const { shouldAnimate } = useNetworkAwareAnimations();

  return (
    <Card className="border-none rounded-xl shadow-md mb-4">
      <CardContent className="p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const showBadge = action.path === "/community" && unreadMessages > 0;
            
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 touch-target tap-highlight-none active:scale-[0.97] active:bg-muted ${
                  shouldAnimate 
                    ? 'hover:from-muted hover:to-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md' 
                    : 'transition-colors duration-150'
                } group`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-1.5 sm:mb-2 ${
                  shouldAnimate ? 'group-hover:scale-110 transition-transform' : ''
                }`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground">{action.label}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{action.description}</span>
                
                {showBadge && (
                  <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] sm:text-[10px] font-semibold">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
