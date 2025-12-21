import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RegionalHeatmapProps {
  data: { region: string; incidents: number; risk: string }[];
}

const RegionalHeatmap = ({ data }: RegionalHeatmapProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-destructive/20 border-destructive text-destructive";
      case "Moderate":
        return "bg-warning/20 border-warning text-warning";
      case "Low":
        return "bg-success/20 border-success text-success";
      default:
        return "bg-muted";
    }
  };

  const maxIncidents = Math.max(...data.map((d) => d.incidents));

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle>State-wise Distribution</CardTitle>
        <CardDescription>Incident count and risk level by state</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const intensity = (item.incidents / maxIncidents) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {item.region}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {item.incidents} incidents
                    </span>
                    <Badge variant="outline" className={getRiskColor(item.risk)}>
                      {item.risk}
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${intensity}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionalHeatmap;
