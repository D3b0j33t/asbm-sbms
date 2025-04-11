
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Bell } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  date: Date;
  recipient_id?: string | null;
  recipient_role?: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'date'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
  canCreateNotifications: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotifications: async () => {},
  canCreateNotifications: false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { userRole, userEmail } = useAuth();
  // Only teachers and admins can create notifications
  const canCreateNotifications = userRole === 'admin' || userRole === 'teacher';
  
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!userEmail) return;
    
    const fetchNotifications = async () => {
      try {
        // Fetch notifications for this user by role or specific to them
        // Include 'all' in the query to get notifications meant for all users
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`recipient_role.eq.${userRole},recipient_role.eq.all,recipient_id.eq.${userEmail}`)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedNotifications: Notification[] = data.map(note => ({
            id: note.id,
            title: note.title,
            message: note.message,
            type: note.type as NotificationType,
            read: note.read,
            date: new Date(note.created_at),
            recipient_id: note.recipient_id,
            recipient_role: note.recipient_role
          }));
          
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    // Subscribe to notification changes
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
      }, (payload) => {
        // Check if notification is for this user
        const newNotification = payload.new;
        if (newNotification.recipient_role === userRole || 
            newNotification.recipient_role === 'all' ||
            newNotification.recipient_id === userEmail) {
          
          const formattedNotification: Notification = {
            id: newNotification.id,
            title: newNotification.title,
            message: newNotification.message,
            type: newNotification.type as NotificationType,
            read: newNotification.read,
            date: new Date(newNotification.created_at),
            recipient_id: newNotification.recipient_id,
            recipient_role: newNotification.recipient_role
          };
          
          setNotifications(prev => [formattedNotification, ...prev]);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [userEmail, userRole]);

  const addNotification = async (notification: Omit<Notification, 'id' | 'read' | 'date'>) => {
    if (!canCreateNotifications) {
      toast({
        title: "Permission Denied",
        description: "Only teachers and administrators can create notifications",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newNotification = {
        id: uuidv4(),
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: false,
        recipient_id: notification.recipient_id || null,
        recipient_role: notification.recipient_role || null,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('notifications')
        .insert(newNotification);
      
      if (error) throw error;
      
      // We don't need to update local state as the subscription will handle it
      toast({
        title: "Notification Created",
        description: "Your notification has been sent",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update notifications in database
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = async () => {
    // For safety, we'll only clear read notifications
    try {
      const readIds = notifications.filter(n => n.read).map(n => n.id);
      
      if (readIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', readIds);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(n => !n.read));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        addNotification, 
        markAsRead, 
        markAllAsRead,
        clearNotifications,
        canCreateNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
