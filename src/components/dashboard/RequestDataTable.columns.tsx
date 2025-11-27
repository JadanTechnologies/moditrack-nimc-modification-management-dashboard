"use client"
import React, { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { ModificationRequest } from "@shared/types"
import { MOCK_USERS } from "@shared/mock-data"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/common/StatusBadge"
import { useAuthStore } from "@/lib/auth"
import { AssignStaffDialog } from "./AssignStaffDialog"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { toast } from "sonner"
const usersById = new Map(MOCK_USERS.map(u => [u.id, u]));
// eslint-disable-next-line react-refresh/only-export-components
const ActionsCell = ({ row }: { row: any }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const request = row.original as ModificationRequest;
  const user = useAuthStore(state => state.user);
  const [isAssignDialogOpen, setAssignDialogOpen] = useState(false);
  const assignMutation = useMutation({
    mutationFn: (staffId: string) => {
      return api(`/api/requests/${request.id}`, {
        method: 'PUT',
        body: JSON.stringify({ assignedToId: staffId }),
      });
    },
    onSuccess: () => {
      toast.success('Request assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      setAssignDialogOpen(false);
    },
    onError: () => {
      toast.error('Failed to assign request.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ModificationRequest['status']) => {
      return api(`/api/requests/${request.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: (_, status) => {
      toast.success(`Request status updated to ${status}!`);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
    onError: (_, status) => {
      toast.error(`Failed to update status to ${status}.`);
    },
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
          <DropdownMenuItem onClick={() => navigate(`/requests/${request.id}`)}>
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user?.role === 'Admin' && (
            <DropdownMenuItem onClick={() => setAssignDialogOpen(true)}>
              Assign Staff
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => updateStatusMutation.mutate('Completed')}>
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive-foreground focus:bg-destructive"
            onClick={() => updateStatusMutation.mutate('Rejected')}
          >
            Reject
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AssignStaffDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        request={request}
        onAssign={(staffId) => assignMutation.mutate(staffId)}
        isAssigning={assignMutation.isPending}
      />
    </>
  );
};
export const columns: ColumnDef<ModificationRequest>[] = [
  {
    accessorKey: "id",
    header: "Request ID",
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "nin",
    header: "NIN",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "requestType",
    header: "Request Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "assignedToId",
    header: "Assigned Staff",
    cell: ({ row }) => {
      const assignedToId = row.getValue("assignedToId") as string | null;
      return assignedToId ? usersById.get(assignedToId)?.name || "Unknown" : <span className="text-muted-foreground">Unassigned</span>;
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Date Submitted",
    cell: ({ row }) => format(new Date(row.getValue("submittedAt")), "MMM d, yyyy"),
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
]