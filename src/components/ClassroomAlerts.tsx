
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Bell, Check, Clock, ExternalLink, X } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ClassroomAlert {
  id: string;
  title: string;
  description: string;
  course: string;
  deadline?: Date;
  type: 'assignment' | 'announcement' | 'reminder' | 'warning';
  createdAt: Date;
}

const mockAlerts: ClassroomAlert[] = [
  {
    id: '1',
    title: 'New Assignment: Case Study Analysis',
    description: 'Complete the case study analysis for next week\'s class.',
    course: 'Business Ethics',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    type: 'assignment',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Reminder: Group Project Meeting',
    description: 'Group meeting at 3 PM in Room 204 for project discussion.',
    course: 'Marketing Management',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    type: 'reminder',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Low Attendance Warning',
    description: 'Your attendance in this course has fallen below 75%. Please ensure regular attendance.',
    course: 'Financial Accounting',
    type: 'warning',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Class Canceled Tomorrow',
    description: 'Tomorrow\'s class is canceled due to faculty meeting. Will be rescheduled.',
    course: 'Business Law',
    type: 'announcement',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
];

const alertIcons = {
  assignment: Clock,
  announcement: Bell,
  reminder: Bell,
  warning: AlertTriangle,
};

const alertColors = {
  assignment: 'bg-blue-100 text-blue-800 border-blue-200',
  announcement: 'bg-purple-100 text-purple-800 border-purple-200',
  reminder: 'bg-amber-100 text-amber-800 border-amber-200',
  warning: 'bg-red-100 text-red-800 border-red-200',
};

const alertBadgeVariants = {
  assignment: 'bg-blue-500',
  announcement: 'bg-purple-500',
  reminder: 'bg-amber-500',
  warning: 'bg-red-500',
};

const ClassroomAlerts = () => {
  const [alerts, setAlerts] = useState<ClassroomAlert[]>(mockAlerts);
  const { addNotification } = useNotifications();
  
  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'Yesterday';
      } else {
        return `${diffInDays} days ago`;
      }
    }
  };
  
  const acknowledgeAlert = (alert: ClassroomAlert) => {
    dismissAlert(alert.id);
    
    // Add a notification
    addNotification({
      title: `Acknowledged: ${alert.title}`,
      message: `You've acknowledged the alert from ${alert.course}`,
      type: 'success',
    });
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Classroom Alerts</CardTitle>
        {alerts.length > 0 && (
          <Badge variant="outline" className="bg-primary text-primary-foreground px-2 py-1 animate-pulse">
            {alerts.length} New
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto opacity-20 mb-2" />
            <p>No active alerts</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const AlertIcon = alertIcons[alert.type];
            
            return (
              <div 
                key={alert.id}
                className={cn(
                  "p-4 border rounded-md relative transition-all duration-300 hover:shadow-md",
                  alertColors[alert.type],
                  "staggered-item"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-full", alertBadgeVariants[alert.type], "text-white")}>
                    <AlertIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-sm mt-1">{alert.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full -mt-1 -mr-1 text-muted-foreground"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <Badge variant="outline" className="font-normal">
                        {alert.course}
                      </Badge>
                      
                      <span className="text-muted-foreground">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                      
                      {alert.deadline && (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {format(alert.deadline, 'MMM d')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 text-xs transition-all duration-300 hover:bg-white/50"
                        onClick={() => acknowledgeAlert(alert)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                      
                      {alert.type === 'assignment' && (
                        <Button 
                          size="sm" 
                          className="h-7 text-xs transition-all duration-300 hover:bg-primary/90"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default ClassroomAlerts;
