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
  selectedYear: string;
  onRegionChange: (value: string) => void;
  onCrimeTypeChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

const FilterControls = ({
  regions,
  crimeTypes,
  selectedRegion,
  selectedCrimeType,
  selectedYear,
  onRegionChange,
  onCrimeTypeChange,
  onYearChange,
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
              Year
            </Label>
            <Select value={selectedYear} onValueChange={onYearChange}>
              <SelectTrigger id="date-range">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2025">2025 (Partial)</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
                <SelectItem value="2019">2019</SelectItem>
                <SelectItem value="2018">2018</SelectItem>
                <SelectItem value="2017">2017</SelectItem>
                <SelectItem value="2016">2016</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterControls;
