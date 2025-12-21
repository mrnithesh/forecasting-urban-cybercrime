import { Shield, LayoutDashboard, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const DashboardHeader = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                Spatio-Temporal Forecasting of Urban Cybercrime in India
              </h1>
              <p className="text-sm text-muted-foreground">
                Real-time Monitoring and Predictive Analysis of Cybercrime Across Major Indian Cities
              </p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2">
            <Button 
              variant={isActive("/") ? "default" : "ghost"} 
              asChild
              size="sm"
            >
              <Link to="/" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button 
              variant={isActive("/blogs") || location.pathname.startsWith("/blogs/") ? "default" : "ghost"} 
              asChild
              size="sm"
            >
              <Link to="/blogs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Blogs & Insights
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
