"use client"
import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Trash2, UserX, UserCheck } from "lucide-react"
import { User } from "@shared/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
export const columns = ({ onEditUser }: { onEditUser: (user: User) => void }): ColumnDef<User>[] => {
  const ActionsCell = ({ row }: { row: any }) => {
    const user = row.original as User;
    const queryClient = useQueryClient();
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isSuspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const deleteMutation = useMutation({
      mutationFn: () => api(`/api/users/${user.id}`, { method: 'DELETE' }),
      onSuccess: () => {
        toast.success('User deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
      onError: () => toast.error('Failed to delete user.'),
    });
    const suspendMutation = useMutation({
      mutationFn: (status: 'Active' | 'Suspended') => api(`/api/users/${user.id}`, { method: 'PUT', body: JSON.stringify({ ...user, status }) }),
      onSuccess: (_, status) => {
        toast.success(`User has been ${status === 'Active' ? 'activated' : 'suspended'}.`);
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
      onError: () => toast.error('Failed to update user status.'),
    });
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEditUser(user)}>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSuspendDialogOpen(true)}>
              {user.status === 'Active' ? <><UserX className="mr-2 h-4 w-4" /> Suspend User</> : <><UserCheck className="mr-2 h-4 w-4" /> Activate User</>}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {/* Suspend/Activate Dialog */}
        <AlertDialog open={isSuspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will {user.status === 'Active' ? 'suspend' : 'activate'} the user account for {user.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => suspendMutation.mutate(user.status === 'Active' ? 'Suspended' : 'Active')}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user account for {user.name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => deleteMutation.mutate()}>
                Yes, delete user
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  };
  return [
    {
      accessorKey: "id",
      header: "User ID",
      cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <Badge variant={role === 'Admin' ? 'default' : 'secondary'}>{role}</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={status === 'Active' ? 'outline' : 'destructive'}>{status}</Badge>;
      },
    },
    {
      id: "actions",
      cell: (props) => <ActionsCell {...props} />,
    },
  ]
}