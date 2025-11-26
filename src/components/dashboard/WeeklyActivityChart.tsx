import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyActivityChartProps {
  data: { day: string; lessons: number }[];
}

export const WeeklyActivityChart = ({ data }: WeeklyActivityChartProps) => {
  return (
    <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Activité Hebdomadaire</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-700" />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              tick={{ fill: "#9ca3af" }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: "#9ca3af" }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff"
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar 
              dataKey="lessons" 
              fill="#8b5cf6" 
              radius={[8, 8, 0, 0]}
              name="Leçons"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
