import { ReactNode } from "react";
import { MONTH_COLORS } from "@/utils/courseHelpers";

interface MonthSectionProps {
  month: string;
  children: ReactNode;
}

export const MonthSection = ({ month, children }: MonthSectionProps) => {
  const colorGradient = MONTH_COLORS[month] || MONTH_COLORS["Sans mois"];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${colorGradient}`} />
        <h2 className="text-2xl font-bold text-foreground">{month}</h2>
        <div className={`h-1 flex-1 rounded-full bg-gradient-to-r ${colorGradient} opacity-30`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
};
