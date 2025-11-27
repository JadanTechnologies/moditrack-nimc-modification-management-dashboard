import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ModificationRequest, User } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Skeleton } from '../ui/skeleton';
import { Loader2 } from 'lucide-react';
interface AssignStaffDialogProps {
  request: ModificationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: string) => void;
  isAssigning: boolean;
}
const fetchStaff = async (): Promise<{ items: User[] }> => {
  const data = await api<{ items: User[] }>('/api/users');
  return { items: data.items.filter(u => u.role === 'Staff') };
};
export function AssignStaffDialog({ request, isOpen, onClose, onAssign, isAssigning }: AssignStaffDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>('');
  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
    enabled: isOpen,
  });
  if (!request) return null;
  const handleAssign = () => {
    if (selectedStaffId) {
      onAssign(selectedStaffId);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Staff to Request {request.id}</DialogTitle>
          <DialogDescription>
            Select a staff member to handle this modification request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="staff" className="text-right">
              Staff Member
            </Label>
            {isLoading ? (
              <Skeleton className="h-10 col-span-3" />
            ) : (
              <Select onValueChange={setSelectedStaffId} value={selectedStaffId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffData?.items.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>Cancel</Button>
          <Button onClick={handleAssign} disabled={!selectedStaffId || isAssigning}>
            {isAssigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Staff
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}