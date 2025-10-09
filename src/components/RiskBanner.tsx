import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RiskBannerProps {
  riskLevel: "Low" | "Moderate" | "High";
}

const RiskBanner = ({ riskLevel }: RiskBannerProps) => {
  const riskConfig = {
    Low: {
      icon: "🟢",
      variant: "default" as const,
      title: "Low Risk",
      description: "Current cybercrime activity is below normal levels",
      className: "border-success/50 bg-success/5",
    },
    Moderate: {
      icon: "🟠",
      variant: "default" as const,
      title: "Moderate Risk",
      description: "Increased cybercrime activity detected. Stay vigilant",
      className: "border-warning/50 bg-warning/5",
    },
    High: {
      icon: "🔴",
      variant: "destructive" as const,
      title: "High Risk",
      description: "Elevated threat level. Enhanced security measures recommended",
      className: "border-destructive bg-destructive/10",
    },
  };

  const config = riskConfig[riskLevel];

  return (
    <Alert variant={config.variant} className={config.className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <span>{config.icon}</span>
        <span>{config.title}</span>
      </AlertTitle>
      <AlertDescription>{config.description}</AlertDescription>
    </Alert>
  );
};

export default RiskBanner;
