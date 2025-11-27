import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { User } from '@shared/types';
import { UserDataTable } from '@/components/users/UserDataTable';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { toast } from 'sonner';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';
const fetchUsers = async (): Promise<{ items: User[] }> => {
  return api('/api/users');
};
export function UserManagementPage() {
  const { setBreadcrumbs } = useBreadcrumbs();
  useEffect(() => {
    setBreadcrumbs([{ label: 'User Management' }]);
  }, [setBreadcrumbs]);
  const queryClient = useQueryClient();
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
  const users = data?.items || [];
  const userMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const url = userData.id ? `/api/users/${userData.id}` : '/api/users';
      const method = userData.id ? 'PUT' : 'POST';
      return api(url, { method, body: JSON.stringify(userData) });
    },
    onSuccess: () => {
      toast.success(`User ${selectedUser ? 'updated' : 'created'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormOpen(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Failed to save user. Please try again.');
    },
  });
  const handleAddUser = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <PageHeader
            title="User Management"
            actions={
              <Button onClick={handleAddUser}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Button>
            }
          />
          <Card>
            <CardContent className="pt-6">
              {error ? (
                <div className="text-center py-10 text-red-500">Failed to load users. Please try again later.</div>
              ) : (
                <UserDataTable data={users} isLoading={isLoading} onEditUser={handleEditUser} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <UserFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={(data) => userMutation.mutate(data)}
        user={selectedUser}
        isSaving={userMutation.isPending}
      />
    </>
  );
}