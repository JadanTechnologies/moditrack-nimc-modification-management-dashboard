import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ModificationRequest, RequestStatus } from '@shared/types';
interface UpdateStatusDialogProps {
  request: ModificationRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newStatus: RequestStatus | undefined, notes: string) => void;
  isNoteOnly?: boolean;
}
const availableStatuses: RequestStatus[] = ['Pending', 'In Progress', 'Completed', 'Rejected'];
export function UpdateStatusDialog({ request, isOpen, onClose, onUpdate, isNoteOnly = false }: UpdateStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<RequestStatus | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewStatus('');
      setNotes('');
    }
  }, [isOpen]);

  if (!request) return null;

  const handleUpdate = () => {
    if (isNoteOnly) {
      if (notes) {
        onUpdate(undefined, notes);
        onClose();
      }
    } else {
      if (newStatus) {
        onUpdate(newStatus, notes);
        onClose();
      }
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isNoteOnly ? 'Add Note' : 'Update Status'} for {request.id}</DialogTitle>
          <DialogDescription>
            {isNoteOnly
              ? 'Add an internal note for this request.'
              : 'Select a new status and add optional notes for this request.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!isNoteOnly && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                New Status
              </Label>
              <Select onValueChange={(value) => setNewStatus(value as RequestStatus)} value={newStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="col-span-3"
              placeholder="Add any relevant notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={isNoteOnly ? !notes : !newStatus}>
            {isNoteOnly ? 'Add Note' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}