import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, MessageSquare, Trophy, Palette } from "lucide-react";

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

  return (
    <Card className="border-none rounded-xl shadow-md mb-4">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const showBadge = action.path === "/community" && unreadMessages > 0;
            
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="relative flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-md group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">{action.label}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{action.description}</span>
                
                {showBadge && (
                  <span className="absolute top-2 right-2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold">
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
