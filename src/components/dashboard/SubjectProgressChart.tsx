import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface SubjectProgressChartProps {
  data: { subject: string; progress: number; lessonsCompleted: number; totalLessons: number }[];
}

export const SubjectProgressChart = ({ data }: SubjectProgressChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progression par Matière</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Commence des leçons pour voir ta progression!
          </p>
        ) : (
          data.map((subject) => (
            <div key={subject.subject} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{subject.subject}</span>
                <span className="text-xs text-muted-foreground">
                  {subject.lessonsCompleted}/{subject.totalLessons} leçons
                </span>
              </div>
              <Progress value={subject.progress} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
