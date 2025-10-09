import { Activity, AlertTriangle, MapPin, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardsProps {
  totalIncidents: number;
  mostCommonType: string;
  topRegion: string;
  riskLevel: string;
}

const StatsCards = ({
  totalIncidents,
  mostCommonType,
  topRegion,
  riskLevel,
}: StatsCardsProps) => {
  const stats = [
    {
      title: "Total Incidents",
      value: totalIncidents.toLocaleString(),
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Most Common Attack",
      value: mostCommonType,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Top Region",
      value: topRegion,
      icon: MapPin,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Forecasted Risk",
      value: riskLevel,
      icon: TrendingUp,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
