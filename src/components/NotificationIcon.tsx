
import React from 'react';
import { Bell, Check, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNotifications, NotificationType } from '@/context/NotificationContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const NotificationIcon = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, addNotification, canCreateNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as NotificationType,
    recipient_role: 'all'
  });
  const { userRole } = useAuth();
  const [dbNotifications, setDbNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      // Fetch notifications from Supabase based on recipient_role that matches userRole
      // or notifications for 'all' recipients
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipient_role.eq.all,recipient_role.eq.${userRole || 'student'}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the data to match our notification format
        const transformedData = data.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message, 
          type: notification.type as NotificationType,
          read: notification.read || false,
          date: new Date(notification.created_at),
          recipient_role: notification.recipient_role
        }));
        
        setDbNotifications(transformedData);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    try {
      // Update notification in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      markAsRead(id);
      setDbNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all notifications as read in Supabase
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`recipient_role.eq.all,recipient_role.eq.${userRole || 'student'}`);
      
      if (error) throw error;
      
      // Update local state
      markAllAsRead();
      setDbNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      });
    }
  };

  const handleClearNotifications = async () => {
    try {
      // We don't actually delete notifications from DB, just mark them as read
      await handleMarkAllAsRead();
      
      // But clear them from the UI
      clearNotifications();
      
      toast({
        title: "Success",
        description: "Notifications cleared"
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleSubmitNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both title and message fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Generate a UUID for the notification
      const notificationId = crypto.randomUUID();
      
      // Add notification to Supabase
      const { error } = await supabase
        .from('notifications')
        .insert({
          id: notificationId,
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          recipient_role: newNotification.recipient_role,
          read: false,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Add to local state
      const newNotif = {
        id: notificationId,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        read: false,
        date: new Date(),
        recipient_role: newNotification.recipient_role
      };
      
      addNotification(newNotif);
      setDbNotifications(prev => [newNotif, ...prev]);
      
      // Reset form and close dialog
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        recipient_role: 'all'
      });
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Notification Created",
        description: `Notification sent to ${newNotification.recipient_role === 'all' ? 'all users' : newNotification.recipient_role + 's'}`
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive"
      });
    }
  };

  const notificationTypeColors = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
  };

  // Calculate unread notifications count
  const unreadDbCount = dbNotifications.filter(n => !n.read).length;

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadDbCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                {unreadDbCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 pb-2">
            <h4 className="font-medium text-sm">Notifications</h4>
            {canCreateNotifications && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {loadingNotifications ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : dbNotifications.length > 0 ? (
            <>
              <ScrollArea className="h-[300px]">
                <div className="space-y-1">
                  {dbNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-3 hover:bg-muted/50 relative",
                        !notification.read && "bg-muted/30"
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <span className={cn(
                          "text-xs px-1.5 py-0.5 rounded-sm",
                          notificationTypeColors[notification.type]
                        )}>
                          {notification.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(notification.date, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <h5 className="font-medium mt-1">{notification.title}</h5>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      
                      {notification.recipient_role && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          For: {notification.recipient_role === 'all' ? 'All users' : notification.recipient_role}
                        </div>
                      )}
                      
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <Separator />
              
              <div className="p-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  Mark all read
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearNotifications}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear read
                </Button>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>
              Add a new notification for users.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitNotification}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={newNotification.type}
                    onValueChange={(value) => setNewNotification({...newNotification, type: value as NotificationType})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="recipient">For</Label>
                  <Select 
                    value={newNotification.recipient_role}
                    onValueChange={(value) => setNewNotification({...newNotification, recipient_role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All users</SelectItem>
                      <SelectItem value="student">Students only</SelectItem>
                      <SelectItem value="teacher">Teachers only</SelectItem>
                      <SelectItem value="admin">Admins only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Notification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationIcon;
