import { lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// recharts is heavy (~100KB gz); keep it out of the dashboard critical chunk
const WeeklyActivityChartInner = lazy(() => import("./WeeklyActivityChartInner"));

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
        {/* Fallback matches the chart height exactly to avoid layout shift */}
        <Suspense fallback={<Skeleton className="w-full rounded-lg" style={{ height: 250 }} />}>
          <WeeklyActivityChartInner data={data} />
        </Suspense>
      </CardContent>
    </Card>
  );
};
