import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "search" | "date";
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onFiltersChange: (filters: Record<string, any>) => void;
  className?: string;
}

export function FilterBar({
  filters,
  onFiltersChange,
  className = "",
}: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value && value !== "") {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    handleFilterChange("search", value);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm("");
    onFiltersChange({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).length;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Пошук та фільтри */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Пошук */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Пошук..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Фільтри */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              {filter.type === "select" && (
                <Select
                  value={activeFilters[filter.key] || ""}
                  onValueChange={(value) =>
                    handleFilterChange(filter.key, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Всі {filter.label}</SelectItem>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}

          {/* Кнопка очищення */}
          {getActiveFiltersCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Очистити
            </Button>
          )}
        </div>
      </div>

      {/* Активні фільтри */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key);
            if (!filter) return null;

            let displayValue = value;
            if (filter.type === "select" && filter.options) {
              const option = filter.options.find((opt) => opt.value === value);
              displayValue = option?.label || value;
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-600"
                onClick={() => removeFilter(key)}
              >
                {filter.label}: {displayValue}
                <X className="w-3 h-3" />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
