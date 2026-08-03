import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeeklyActivityChartInnerProps {
  data: { day: string; lessons: number }[];
}

/**
 * Recharts rendering isolated in its own module so the ~100KB recharts bundle
 * is code-split out of the dashboard's critical chunk (3G optimization).
 * Only loaded via React.lazy from WeeklyActivityChart.
 */
const WeeklyActivityChartInner = ({ data }: WeeklyActivityChartInnerProps) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="day"
          className="text-xs"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          className="text-xs"
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
  );
};

export default WeeklyActivityChartInner;
