import React, { useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { RequestForm, RequestFormValues } from '@/components/requests/RequestForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { format } from 'date-fns';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
type RequestPayload = Omit<RequestFormValues, 'oldValue' | 'newValue' | 'reason' | 'documents'> & {
  details: {
    oldValue: string;
    newValue: string;
    reason: string;
  };
};
export function NewRequestPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: 'New Request' }]);
  }, [setBreadcrumbs]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);
  const createRequestMutation = useMutation({
    mutationFn: (newRequest: RequestPayload) => {
      return api('/api/requests', {
        method: 'POST',
        body: JSON.stringify({ ...newRequest, createdBy: currentUser?.name }),
      });
    },
    onSuccess: () => {
      toast.success('New modification request submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      navigate('/');
    },
    onError: (error) => {
      console.log('Mutation error:', error);
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });
  const handleSubmit = (data: RequestFormValues) => {
    const { oldValue, newValue, reason, documents, ...rest } = data;
    const formattedOldValue = oldValue instanceof Date ? format(oldValue, 'yyyy-MM-dd') : String(oldValue || '');
    const formattedNewValue = newValue instanceof Date ? format(newValue, 'yyyy-MM-dd') : String(newValue || '');
    const payload: RequestPayload = {
      ...rest,
      details: {
        oldValue: formattedOldValue,
        newValue: formattedNewValue,
        reason,
      },
    };
    // Note: 'documents' are not sent to the backend in this phase.
    // The FileUpload component is for UI demonstration purposes.
    createRequestMutation.mutate(payload);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Modification Request"
      />
      <div className="max-w-4xl mx-auto">
        <RequestForm
          onSubmit={handleSubmit}
          isSubmitting={createRequestMutation.isPending}
        />
      </div>
    </div>
  );
}