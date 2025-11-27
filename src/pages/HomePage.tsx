import React, { useMemo, useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { RequestFilters, Filters } from '@/components/dashboard/RequestFilters';
import { RequestDataTable } from '@/components/dashboard/RequestDataTable';
import { FileText, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ModificationRequest } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { formatISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
const fetchRequests = async (filters: Filters): Promise<{ items: ModificationRequest[] }> => {
  const params = new URLSearchParams();
  if (filters.search) params.append('q', filters.search);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.dateRange?.from) params.append('from', formatISO(filters.dateRange.from));
  if (filters.dateRange?.to) params.append('to', formatISO(filters.dateRange.to));
  return api(`/api/requests?${params.toString()}`);
};
export function HomePage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: 'Dashboard' }]);
  }, [setBreadcrumbs]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    type: 'all',
    dateRange: undefined,
  });
  const { data, isLoading, error } = useQuery({
    queryKey: ['requests', filters],
    queryFn: () => fetchRequests(filters),
  });
  const requests = data?.items || [];
  const stats = useMemo(() => {
    const items = data?.items || [];
    return {
      total: items.length,
      pending: items.filter(r => r.status === 'Pending').length,
      inProgress: items.filter(r => r.status === 'In Progress').length,
      completed: items.filter(r => r.status === 'Completed').length,
    };
  }, [data?.items]);
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        actions={
          <Button asChild>
            <Link to="/requests/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit New Request
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[108px] w-full" />)
        ) : (
          <>
            <StatCard title="Total Requests" value={stats.total} icon={<FileText />} />
            <StatCard title="Pending" value={stats.pending} icon={<Clock />} colorClass="text-yellow-500" />
            <StatCard title="In Progress" value={stats.inProgress} icon={<Clock />} colorClass="text-blue-500" />
            <StatCard title="Completed" value={stats.completed} icon={<CheckCircle />} colorClass="text-green-500" />
          </>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <RequestFilters filters={filters} onFilterChange={handleFilterChange} />
          {error ? (
            <div className="text-center py-10 text-red-500">Failed to load requests. Please try again later.</div>
          ) : (
            <RequestDataTable data={requests} isLoading={isLoading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}