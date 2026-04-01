
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { serverURL } from '@/constants';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotificationBellProps {
    onNotificationsChange?: (notifications: any[]) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onNotificationsChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const userId = sessionStorage.getItem('uid');
            if (!userId) return;

            const response = await axios.post(`${serverURL}/api/notifications/get`, { userId });
            const notificationsData = Array.isArray(response.data) ? response.data : [];
            setNotifications(notificationsData);
            setUnreadCount(notificationsData.filter(n => !n.isRead).length);
            onNotificationsChange?.(notificationsData);
        } catch (error) {
            console.error("Failed to fetch notifications");
            onNotificationsChange?.([]);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`${serverURL}/api/notifications/read`, { id });
            setNotifications(prev => {
                const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
                onNotificationsChange?.(updated);
                return updated;
            });
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const clearAllNotifications = async () => {
        try {
            const userId = sessionStorage.getItem('uid');
            if (!userId) return;

            await axios.post(`${serverURL}/api/notifications/clear`, { userId });

            setNotifications([]);
            setUnreadCount(0);
            onNotificationsChange?.([]);
        } catch (error) {
            console.error("Failed to clear notifications");
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[80vh] overflow-y-auto">
             <div className="flex items-center justify-between px-3 py-2">
    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>

    {notifications.length > 0 && (
        <button
            onClick={clearAllNotifications}
            className="text-xs text-red-500 hover:underline"
        >
            Clear All
        </button>
    )}
</div>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification._id}
                            className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${!notification.isRead ? 'bg-muted/50' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex justify-between w-full">
                                <span className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                                    {notification.message}
                                </span>
                                {!notification.isRead && (
                                    <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                            </span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
