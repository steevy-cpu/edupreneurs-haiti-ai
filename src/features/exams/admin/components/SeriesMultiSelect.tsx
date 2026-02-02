/**
 * SeriesMultiSelect - Multi-select for NS4 series
 */
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const SERIES = [
  { value: "SMP", label: "Sciences-Maths-Physique (SMP)" },
  { value: "SES", label: "Sciences Économiques et Sociales (SES)" },
  { value: "SVT", label: "Sciences de la Vie et de la Terre (SVT)" },
  { value: "LLA", label: "Lettres, Langues et Arts (LLA)" },
];

interface SeriesMultiSelectProps {
  value: string[];
  onChange: (series: string[]) => void;
}

export function SeriesMultiSelect({ value, onChange }: SeriesMultiSelectProps) {
  const toggleSeries = (seriesValue: string) => {
    if (value.includes(seriesValue)) {
      onChange(value.filter(s => s !== seriesValue));
    } else {
      onChange([...value, seriesValue]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {value.length === 0 ? (
            "Sélectionner une ou plusieurs séries"
          ) : (
            <div className="flex flex-wrap gap-1">
              {value.map(s => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          {SERIES.map((series) => (
            <div
              key={series.value}
              className="flex items-center space-x-2 p-2 hover:bg-muted rounded cursor-pointer"
              onClick={() => toggleSeries(series.value)}
            >
              <Checkbox 
                checked={value.includes(series.value)}
                onCheckedChange={() => toggleSeries(series.value)}
              />
              <span className="text-sm">{series.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { SERIES };
