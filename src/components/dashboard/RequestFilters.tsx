import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Search, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { RequestStatus, RequestType } from '@shared/types';
export interface Filters {
  search: string;
  status: RequestStatus | 'all';
  type: RequestType | 'all';
  dateRange?: DateRange;
}
interface RequestFiltersProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
}
export function RequestFilters({ filters, onFilterChange }: RequestFiltersProps) {
  const handleReset = () => {
    onFilterChange({
      search: '',
      status: 'all',
      type: 'all',
      dateRange: undefined,
    });
  };
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
      <div className="relative w-full md:flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by NIN or Name..."
          className="pl-10 w-full"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full md:w-auto">
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange({ status: value as Filters['status'] })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange({ type: value as Filters['type'] })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Name">Name</SelectItem>
            <SelectItem value="DOB">DOB</SelectItem>
            <SelectItem value="Address">Address</SelectItem>
            <SelectItem value="Phone">Phone</SelectItem>
            <SelectItem value="Photo">Photo</SelectItem>
          </SelectContent>
        </Select>
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(date) => onFilterChange({ dateRange: date })}
        />
        <Button variant="ghost" className="hidden sm:inline-flex" onClick={handleReset}>
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
}