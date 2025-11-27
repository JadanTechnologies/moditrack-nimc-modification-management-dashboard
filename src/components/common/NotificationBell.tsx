import React from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Notification } from '@shared/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { useNavigate } from 'react-router-dom';
const fetchNotifications = async (): Promise<{ items: Notification[] }> => {
  return api('/api/notifications');
};
export function NotificationBell() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  const notifications = data?.items || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => {
      return api(`/api/notifications/${notificationId}`, { method: 'PUT', body: JSON.stringify({ isRead: true }) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.requestId) {
      navigate(`/requests/${notification.requestId}`);
    }
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have {unreadCount} unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className="mb-2 flex items-start space-x-4 rounded-md p-2 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.isRead && <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                No new notifications.
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}