import React, { useState } from 'react';
import { Bell, Check, X, Trash2, UserPlus, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { useFriends } from '@/hooks/use-friends';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

function NotificationItem({ notification, onMarkAsRead, onDelete }: {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [location, setLocation] = useLocation();
  const { acceptFriendRequest, rejectFriendRequest } = useFriends();

  const getNotificationIcon = (type: string, data?: any) => {
    switch (type) {
      case 'friend_request':
        return '👋';
      case 'friend_request_accepted':
        return '🤝';
      case 'friend_request_rejected':
        return '❌';
      case 'admin_post':
        return '📢';
      case 'admin_announcement':
        return '📣';
      case 'friend_post':
        return '📝';
      case 'mention':
        return '🏷️';
      case 'comment':
        return '💬';
      case 'reaction':
        return '👍';
      case 'system':
        // For bug report notifications, use status-based icons
        if (data?.bugReportId) {
          switch (data.status) {
            case 'open':
              return '🟢';
            case 'in_progress':
              return '🟡';
            case 'resolved':
              return '✅';
            case 'closed':
              return '❌';
            default:
              return '📝';
          }
        }
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const handleNotificationClick = () => {
    // Mark as read when clicked
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'friend_request':
        // Stay in dropdown for friend request actions
        break;
      case 'friend_post':
      case 'mention':
      case 'comment':
      case 'reaction':
        setLocation('/posts');
        break;
      case 'admin_post':
      case 'admin_announcement':
        setLocation('/posts');
        break;
      default:
        // For other types, could navigate to relevant sections
        break;
    }
  };

  const handleAcceptFriendRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.data?.senderId) {
      await acceptFriendRequest(notification.data.senderId);
      onDelete(notification.id); // Remove notification after action
    }
  };

  const handleRejectFriendRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.data?.senderId) {
      await rejectFriendRequest(notification.data.senderId);
      onDelete(notification.id); // Remove notification after action
    }
  };

  return (
    <div 
      className={`p-3 border-b last:border-b-0 hover:bg-slate-100/70 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-blue-50/80 border-blue-100' : 'bg-white/60'
      }`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg">{getNotificationIcon(notification.type, notification.data)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="font-medium text-sm text-slate-800">{notification.title}</p>
              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
              
              {/* Status badge for bug report notifications */}
              {notification.data?.bugReportId && notification.data?.status && (
                <div className="mt-2">
                  <Badge
                    variant={
                      notification.data.status === 'open' ? 'default' :
                      notification.data.status === 'in_progress' ? 'secondary' :
                      notification.data.status === 'resolved' ? 'outline' :
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {notification.data.status === 'open' && '🟢 '}
                    {notification.data.status === 'in_progress' && '🟡 '}
                    {notification.data.status === 'resolved' && '✅ '}
                    {notification.data.status === 'closed' && '❌ '}
                    {notification.data.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              )}
              
              <p className="text-xs text-slate-500 mt-1">
                {formatDistanceToNow(notification.created_at, { addSuffix: true })}
              </p>
              
              {/* Friend request actions - only show when NOT on friends page */}
              {notification.type === 'friend_request' && notification.data?.senderId && location !== '/friends' && (
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={handleAcceptFriendRequest}
                    className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRejectFriendRequest}
                    className="h-7 px-3 text-xs border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <UserX className="h-3 w-3 mr-1" />
                    Decline
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!notification.is_read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="h-6 w-6 p-0 hover:bg-slate-200"
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications.slice(0, 10);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="default" 
          className="relative h-11 w-11 rounded-full hover:bg-slate-100 hover:shadow-md transition-all duration-200 border border-transparent hover:border-slate-200"
        >
          <Bell className="h-8 w-8" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0 bg-slate-50/95 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <div className="p-3 border-b border-slate-200/50 bg-white/80">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7 hover:bg-slate-100"
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-600 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {recentNotifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-white/60">
              <Bell className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 10 && (
          <div className="p-3 border-t border-slate-200/50 bg-white/80">
            <Button variant="ghost" className="w-full text-sm hover:bg-slate-100 text-slate-700">
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}