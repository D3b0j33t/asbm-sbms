
import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { getNotificationsTable } from '@/lib/supabase';

interface CreateNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  students: any[]; // Replace with actual student type in final implementation
}

const CreateNotificationDialog: React.FC<CreateNotificationDialogProps> = ({ 
  isOpen, 
  onClose, 
  students 
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [recipientType, setRecipientType] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const handleCreateNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const notification = {
        id: crypto.randomUUID(),
        title,
        message,
        type,
        read: false,
        created_at: new Date().toISOString()
      };
      
      // Add recipient information based on selection
      if (recipientType === 'student' && selectedStudentId) {
        Object.assign(notification, { 
          student_id: selectedStudentId,
          recipient_id: null,
          recipient_role: null
        });
      } else {
        Object.assign(notification, { 
          student_id: null,
          recipient_id: null,
          recipient_role: recipientType
        });
      }
      
      const { error } = await getNotificationsTable().insert(notification);
      
      if (error) throw error;
      
      toast({
        title: "Notification Created",
        description: "Your notification has been sent to the selected recipients.",
      });
      
      // Reset form
      setTitle('');
      setMessage('');
      setType('info');
      setRecipientType('all');
      setSelectedStudentId('');
      
      onClose();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: "Error",
        description: "Could not create notification. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Notification</DialogTitle>
          <DialogDescription>
            Create a new notification to send to users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea 
              id="message" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter notification message"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select 
              value={type}
              onValueChange={setType}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Information</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Recipients</Label>
            <RadioGroup 
              value={recipientType}
              onValueChange={setRecipientType}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all" className="cursor-pointer">Everyone (Students, Teachers, Admins)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="cursor-pointer">Administrators Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="teacher" id="teacher" />
                <Label htmlFor="teacher" className="cursor-pointer">Teachers Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="cursor-pointer">Specific Student</Label>
              </div>
            </RadioGroup>
          </div>
          
          {recipientType === 'student' && (
            <div className="space-y-2">
              <Label htmlFor="studentId">Select Student</Label>
              <Select 
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger id="studentId">
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreateNotification}>Send Notification</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotificationDialog;
