import { Shield } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Spatio-Temporal Forecasting of Urban Cybercrime
            </h1>
            <p className="text-sm text-muted-foreground">
              Forecasting and Visualizing Cybercrime Trends in Urban Regions
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
