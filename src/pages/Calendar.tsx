
import React, { useState, useRef } from 'react';
import { format, addMonths, subMonths, isSameDay, addDays, parse, isPast } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const CalendarPage = () => {
  const { toast } = useToast();
  const { userRole, userName } = useAuth(); // Remove user
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [jumpToDateOpen, setJumpToDateOpen] = useState(false);
  const [jumpDateValue, setJumpDateValue] = useState('');
  
  // Event form fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCourse, setEventCourse] = useState('');
  const [eventColor, setEventColor] = useState('#4285F4');
  
  // Reference to store events, we would integrate with Supabase in a full implementation
  const [events, setEvents] = useState([
    {
      id: 'e1',
      title: 'Python Basics Assignment Due',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
      course: 'Introduction to Computer Science',
      color: '#4285F4',
      description: 'Complete all exercises from chapter 3'
    },
    {
      id: 'e2',
      title: 'Business Case Study Presentation',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
      course: 'Business Administration',
      color: '#0F9D58',
      description: 'Prepare slides and practice your presentation'
    },
    {
      id: 'e3',
      title: 'Data Structures Implementation Due',
      date: addDays(new Date(currentDate.getFullYear(), currentDate.getMonth(), 25), 5),
      course: 'Introduction to Computer Science',
      color: '#4285F4',
      description: 'Implement a linked list and binary search tree'
    },
    {
      id: 'e4',
      title: 'Financial Report Analysis',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
      course: 'Financial Accounting',
      color: '#DB4437',
      description: 'Analyze the quarterly financial reports'
    },
  ]);
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  // Handle jump to date
  const handleJumpToDate = () => {
    try {
      const newDate = parse(jumpDateValue, 'yyyy-MM-dd', new Date());
      if (isNaN(newDate.getTime())) {
        throw new Error('Invalid date format');
      }
      setCurrentDate(newDate);
      setSelectedDate(newDate);
      setJumpToDateOpen(false);
    } catch (error) {
      toast({
        title: 'Invalid Date',
        description: 'Please enter a valid date in YYYY-MM-DD format',
        variant: 'destructive'
      });
    }
  };
  
  // Filter events for the selected date
  const selectedDateEvents = events.filter(event => {
    return selectedDate && isSameDay(event.date, selectedDate);
  });
  
  // Filter upcoming events (all events from today onwards)
  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Handle opening the add event dialog
  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventDescription('');
    setEventCourse('');
    setEventColor('#4285F4');
    setEventDialogOpen(true);
  };
  
  // Handle editing an existing event
  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventCourse(event.course || '');
    setEventColor(event.color || '#4285F4');
    setEventDialogOpen(true);
  };
  
  // Handle saving the event (add or update)
  const handleSaveEvent = () => {
    if (!eventTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please provide a title for the event',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedDate) {
      toast({
        title: 'Date Required',
        description: 'Please select a date for the event',
        variant: 'destructive'
      });
      return;
    }
    
    const newEvent = {
      id: editingEvent ? editingEvent.id : `e${Date.now()}`,
      title: eventTitle,
      description: eventDescription,
      date: selectedDate,
      course: eventCourse,
      color: eventColor
    };
    
    if (editingEvent) {
      // Update existing event
      setEvents(prevEvents => 
        prevEvents.map(ev => ev.id === editingEvent.id ? newEvent : ev)
      );
      toast({
        title: 'Event Updated',
        description: 'Your event has been updated successfully'
      });
    } else {
      // Add new event
      setEvents(prevEvents => [...prevEvents, newEvent]);
      toast({
        title: 'Event Added',
        description: 'Your event has been added to the calendar'
      });
    }
    
    setEventDialogOpen(false);
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
    if (editingEvent && editingEvent.id === eventId) {
      setEventDialogOpen(false);
    }
    toast({
      title: 'Event Deleted',
      description: 'The event has been removed from your calendar'
    });
  };
  
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-4 md:p-6 mt-0 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Calendar</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Month</span>
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Month</span>
              </Button>
              <Popover open={jumpToDateOpen} onOpenChange={setJumpToDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Jump to Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Jump to specific date</h4>
                      <p className="text-sm text-muted-foreground">
                        Enter date in YYYY-MM-DD format
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        id="jumpDate"
                        placeholder="YYYY-MM-DD"
                        value={jumpDateValue}
                        onChange={(e) => setJumpDateValue(e.target.value)}
                      />
                      <Button onClick={handleJumpToDate}>Jump</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                  <Button onClick={handleAddEvent} size="sm" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    className="rounded-md border shadow-sm bg-white"
                    showOutsideDays
                  />
                </div>
                
                {selectedDate && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        Events on {format(selectedDate, 'MMMM d, yyyy')}
                      </h3>
                      {selectedDateEvents.length === 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            handleAddEvent();
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> 
                          Add Event
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {selectedDateEvents.length > 0 ? (
                        selectedDateEvents.map((event) => (
                          <div 
                            key={event.id} 
                            className="p-3 rounded-md transition-all hover:shadow-md cursor-pointer" 
                            style={{ backgroundColor: `${event.color}15`, borderLeft: `3px solid ${event.color}` }}
                            onClick={() => handleEditEvent(event)}
                          >
                            <p className="font-medium">{event.title}</p>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                            <div className="flex items-center mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: event.color, color: event.color }}
                              >
                                {event.course}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No events scheduled</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {(!isMobile || (isMobile && !selectedDate)) && (
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDate(event.date);
                          handleEditEvent(event);
                        }}
                      >
                        <div className="w-10 h-10 flex flex-col items-center justify-center bg-primary/10 rounded-md">
                          <div className="text-xs text-muted-foreground">
                            {format(event.date, 'MMM')}
                          </div>
                          <div className="text-lg font-bold">
                            {format(event.date, 'd')}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: event.color, color: event.color }}
                            >
                              {event.course}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No upcoming events</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button onClick={handleAddEvent} className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add New Event
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Add/Edit Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="eventTitle">Title</Label>
              <Input
                id="eventTitle"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventDescription">Description</Label>
              <Textarea
                id="eventDescription"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventCourse">Course</Label>
              <Input
                id="eventCourse"
                value={eventCourse}
                onChange={(e) => setEventCourse(e.target.value)}
                placeholder="Related course (optional)"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="eventColor">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="eventColor"
                  type="color"
                  value={eventColor}
                  onChange={(e) => setEventColor(e.target.value)}
                  className="w-16 h-8"
                />
                <span className="text-sm text-muted-foreground">
                  Select event color
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            {editingEvent && (
              <Button 
                variant="destructive"
                onClick={() => handleDeleteEvent(editingEvent.id)}
              >
                Delete Event
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setEventDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEvent}
              >
                <Save className="h-4 w-4 mr-1" />
                {editingEvent ? 'Update' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
