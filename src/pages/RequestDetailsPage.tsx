import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { MOCK_USERS } from '@shared/mock-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ArrowLeft, Download, MessageSquare, User, FileText, Calendar, Edit, Loader2, UserPlus, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ModificationRequest, RequestStatus } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateStatusDialog } from '@/components/dashboard/UpdateStatusDialog';
import { AssignStaffDialog } from '@/components/dashboard/AssignStaffDialog';
import { useAuthStore } from '@/lib/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
const usersById = new Map(MOCK_USERS.map(u => [u.id, u]));
function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-md font-semibold">{value}</div>
    </div>
  );
}
export function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setBreadcrumbs } = useBreadcrumbs();
  const currentUser = useAuthStore(state => state.user);
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setAddNoteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isConfirmingAction, setConfirmingAction] = useState<'Approve' | 'Reject' | null>(null);
  const { data: request, isLoading, error } = useQuery({
    queryKey: ['request', id],
    queryFn: () => api<ModificationRequest>(`/api/requests/${id}`),
    enabled: !!id,
  });
  useEffect(() => {
    if (request) {
      setBreadcrumbs([
        { label: 'Dashboard', href: '/' },
        { label: `Request ${request.id}` },
      ]);
    } else {
      setBreadcrumbs([
        { label: 'Dashboard', href: '/' },
        { label: 'Request Details' },
      ]);
    }
  }, [request, setBreadcrumbs]);
  const updateRequestMutation = useMutation({
    mutationFn: (updateData: { status?: RequestStatus; notes?: string; assignedToId?: string }) => {
      const body: any = { ...updateData };
      if (updateData.status || updateData.notes) {
        body.updatedBy = currentUser?.name || 'Unknown';
      }
      return api(`/api/requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    onSuccess: (_, variables) => {
      let message = 'Request updated successfully!';
      if (variables.assignedToId) message = 'Request assigned successfully!';
      if (variables.status) message = `Request status updated to ${variables.status}!`;
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (_, variables) => {
      let message = 'Failed to update request.';
      if (variables.assignedToId) message = 'Failed to assign request.';
      if (variables.status) message = 'Failed to update status.';
      toast.error(message);
    },
  });
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-10 w-1/2 mb-8" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error || !request) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl font-bold">Request not found</h1>
        <p className="text-muted-foreground">The request you are looking for does not exist or could not be loaded.</p>
        <Button asChild variant="link" className="mt-4" onClick={() => navigate('/')}>
          <span><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</span>
        </Button>
      </div>
    );
  }
  const handleConfirmAction = () => {
    if (isConfirmingAction) {
      const newStatus = isConfirmingAction === 'Approve' ? 'Completed' : 'Rejected';
      updateRequestMutation.mutate({ status: newStatus });
      setConfirmingAction(null);
    }
  };
  const assignedUser = request.assignedToId ? usersById.get(request.assignedToId) : null;
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <PageHeader
            title={`Request ${request.id}`}
            actions={
              <Button asChild variant="outline">
                <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
              </Button>
            }
          />
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Modification Details</CardTitle>
                  <CardDescription>Review the requested changes and supporting documents.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailItem label="Old Value" value={<span className="line-through text-muted-foreground">{request.details.oldValue}</span>} />
                    <DetailItem label="New Value" value={<span className="text-primary">{request.details.newValue}</span>} />
                  </div>
                  <Separator />
                  <DetailItem label="Reason for Change" value={request.details.reason} />
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded Documents</p>
                    <div className="space-y-2">
                      {request.details.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded-md bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.name}</span>
                          </div>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} download><Download className="h-4 w-4" /></a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {request.history.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          {index < request.history.length - 1 && <div className="w-px h-full bg-border" />}
                        </div>
                        <div>
                          <p className="font-semibold">{item.status}</p>
                          <p className="text-sm text-muted-foreground">
                            by {item.updatedBy} on {format(new Date(item.updatedAt), 'MMM d, yyyy, h:mm a')}
                          </p>
                          {item.notes && <p className="text-sm mt-1 p-2 bg-muted rounded-md">{item.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Request Info</CardTitle>
                  <StatusBadge status={request.status} />
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem label="Applicant Name" value={request.fullName} />
                  <DetailItem label="NIN" value={request.nin} />
                  <DetailItem label="Request Type" value={request.requestType} />
                  <DetailItem label="Submitted On" value={format(new Date(request.submittedAt), 'MMM d, yyyy')} />
                  <DetailItem label="Assigned To" value={assignedUser ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{assignedUser.name}</span>
                    </div>
                  ) : <span className="text-muted-foreground">Unassigned</span>} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentUser?.role === 'Admin' && (
                    <Button className="w-full" onClick={() => setAssignDialogOpen(true)} disabled={updateRequestMutation.isPending}>
                      <UserPlus className="mr-2 h-4 w-4" /> Assign Staff
                    </Button>
                  )}
                  <Button variant="secondary" className="w-full" onClick={() => setStatusDialogOpen(true)} disabled={updateRequestMutation.isPending}>
                    {updateRequestMutation.isPending && updateRequestMutation.variables?.status ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />}
                    Update Status
                  </Button>
                  <Button variant="outline" className="w-full" disabled={updateRequestMutation.isPending} onClick={() => setAddNoteDialogOpen(true)}><MessageSquare className="mr-2 h-4 w-4" />Add Note</Button>
                  {(request.status === 'Pending' || request.status === 'In Progress') && (
                    <>
                      <Separator />
                      <Button className="w-full" disabled={updateRequestMutation.isPending} onClick={() => setConfirmingAction('Approve')}><Check className="mr-2 h-4 w-4" />Approve</Button>
                      <Button variant="destructive" className="w-full" disabled={updateRequestMutation.isPending} onClick={() => setConfirmingAction('Reject')}><X className="mr-2 h-4 w-4" />Reject</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <UpdateStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        request={request}
        onUpdate={(status, notes) => updateRequestMutation.mutate({ status, notes })}
      />
      <UpdateStatusDialog
        isOpen={isAddNoteDialogOpen}
        onClose={() => setAddNoteDialogOpen(false)}
        request={request}
        onUpdate={(_, notes) => updateRequestMutation.mutate({ notes })}
        isNoteOnly={true}
      />
      <AssignStaffDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        request={request}
        onAssign={(staffId) => updateRequestMutation.mutate({ assignedToId: staffId })}
        isAssigning={updateRequestMutation.isPending && !!updateRequestMutation.variables?.assignedToId}
      />
      <AlertDialog open={!!isConfirmingAction} onOpenChange={() => setConfirmingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {isConfirmingAction?.toLowerCase()} this request? This action will update the status accordingly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}