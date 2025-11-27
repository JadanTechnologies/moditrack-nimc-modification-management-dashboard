import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '../ui/button';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ModificationRequest } from '@shared/types';
import { useNavigate } from 'react-router-dom';
const fetchAllRequests = async (): Promise<{ items: ModificationRequest[] }> => {
  return api('/api/requests');
};
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['all-requests-search'],
    queryFn: fetchAllRequests,
    enabled: open, // Only fetch when the dialog is open
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  const handleSelect = (requestId: string) => {
    setOpen(false);
    navigate(`/requests/${requestId}`);
  };
  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-[0.5rem] text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="hidden lg:inline-flex">Search requests...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a NIN, name, or request ID..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Modification Requests">
            {data?.items.map((request) => (
              <CommandItem
                key={request.id}
                value={`${request.id} ${request.fullName} ${request.nin}`}
                onSelect={() => handleSelect(request.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>{request.id} - {request.fullName} ({request.requestType})</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}