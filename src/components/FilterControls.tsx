import { Filter, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface FilterControlsProps {
  regions: string[];
  crimeTypes: string[];
  selectedRegion: string;
  selectedCrimeType: string;
  onRegionChange: (value: string) => void;
  onCrimeTypeChange: (value: string) => void;
}

const FilterControls = ({
  regions,
  crimeTypes,
  selectedRegion,
  selectedCrimeType,
  onRegionChange,
  onCrimeTypeChange,
}: FilterControlsProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filter Data</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="region-select" className="text-sm text-muted-foreground">
              Region
            </Label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger id="region-select">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crime-type-select" className="text-sm text-muted-foreground">
              Crime Type
            </Label>
            <Select value={selectedCrimeType} onValueChange={onCrimeTypeChange}>
              <SelectTrigger id="crime-type-select">
                <SelectValue placeholder="Select crime type" />
              </SelectTrigger>
              <SelectContent>
                {crimeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range" className="text-sm text-muted-foreground">
              Date Range
            </Label>
            <Select defaultValue="2024">
              <SelectTrigger id="date-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">Year 2024</SelectItem>
                <SelectItem value="q4-2024">Q4 2024</SelectItem>
                <SelectItem value="q3-2024">Q3 2024</SelectItem>
                <SelectItem value="q2-2024">Q2 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterControls;
