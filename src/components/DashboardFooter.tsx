import { GraduationCap, Users, Calendar } from "lucide-react";

const DashboardFooter = () => {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Department of IT</p>
              <p className="text-xs text-muted-foreground">Batch 4IT21</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Research Project</p>
              <p className="text-xs text-muted-foreground">Academic Year 2025–2026</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Contributors</p>
              <p className="text-xs text-muted-foreground">Final Year Project Team</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Spatio-Temporal Forecasting of Urban Cybercrime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
