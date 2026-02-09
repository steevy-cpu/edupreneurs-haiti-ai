import { useNavigate } from "react-router-dom";
import { BookOpen, MessageSquare, Trophy, Palette } from "lucide-react";

interface QuickAction {
  icon: typeof BookOpen;
  label: string;
  path: string;
  gradient: string;
}

const defaultActions: QuickAction[] = [
  {
    icon: BookOpen,
    label: "Matières",
    path: "/matieres",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/community",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: Trophy,
    label: "Classement",
    path: "/leaderboard",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Palette,
    label: "Passions",
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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {actions.map((action) => {
        const Icon = action.icon;
        const showBadge = action.path === "/community" && unreadMessages > 0;
        
        return (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-muted/60 hover:bg-muted active:scale-[0.97] transition-colors duration-150 flex-shrink-0 tap-highlight-none touch-target"
          >
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center`}>
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{action.label}</span>
            
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-semibold">
                {unreadMessages > 99 ? "99+" : unreadMessages}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionsCard;
