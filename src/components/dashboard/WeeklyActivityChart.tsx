import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyActivityChartProps {
  data: { day: string; lessons: number }[];
}

export const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité Hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="day" 
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar 
              dataKey="lessons" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              name="Leçons"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
