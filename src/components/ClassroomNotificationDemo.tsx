
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from '@/hooks/use-toast';

// Demo component to showcase notifications functionality
const ClassroomNotificationDemo = () => {
  const { addNotification } = useNotifications();
  const [demoStarted, setDemoStarted] = useState(false);
  
  // Sample notifications for demo
  const demoNotifications = [
    { 
      title: 'New Assignment', 
      message: 'Marketing Management: Case Study Analysis due in 7 days',
      type: 'info' as const,
      delay: 5000 
    },
    { 
      title: 'Attendance Alert', 
      message: 'Your attendance in Financial Accounting is below 75%',
      type: 'warning' as const,
      delay: 15000 
    },
    { 
      title: 'Feedback Available', 
      message: 'Your Business Ethics assignment has been graded',
      type: 'success' as const,
      delay: 30000 
    },
    { 
      title: 'Group Discussion', 
      message: 'New message in Project Management group discussion',
      type: 'info' as const,
      delay: 45000 
    },
  ];
  
  // Start demo notification sequence
  const startDemo = () => {
    if (demoStarted) return;
    
    setDemoStarted(true);
    toast({
      title: "Notification Demo Started",
      description: "You'll receive classroom notifications over the next minute.",
    });
    
    // Schedule notifications with delays
    demoNotifications.forEach((notification, index) => {
      setTimeout(() => {
        addNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
        });
      }, notification.delay);
    });
    
    // Reset demo state after all notifications
    setTimeout(() => {
      setDemoStarted(false);
    }, demoNotifications[demoNotifications.length - 1].delay + 10000);
  };
  
  return (
    <div className="flex justify-center my-4">
      <Button 
        onClick={startDemo} 
        disabled={demoStarted}
        className="transition-all duration-300 hover:scale-105"
      >
        {demoStarted ? "Demo Running..." : "Start Notification Demo"}
      </Button>
    </div>
  );
};

export default ClassroomNotificationDemo;
