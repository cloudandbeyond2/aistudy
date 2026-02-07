
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

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Assuming user ID is handled via auth token or session in backend
            // But based on controller, it expects userId in body. 
            // Let's assume we send userId from session storage for now or auth middleware handles it.
            // Checking admin service, getNotifications expects body { userId }.
            // Let's rely on sessionStorage 'uid' which seems to be used elsewhere.
            const userId = sessionStorage.getItem('uid');
            if (!userId) return;

            const response = await axios.post(`${serverURL}/api/notifications/get`, { userId });
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id) => {
        try {
            await axios.post(`${serverURL}/api/notifications/read`, { id });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
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
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
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
