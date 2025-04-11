
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  FileText, Calendar, Users, Book, MessageSquare, Upload,
  Download, Paperclip, Clock, CalendarCheck, Plus, Edit, Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const initialCourseData = {
  '1': {
    id: '1',
    title: 'Introduction to Computer Science',
    instructor: 'Dr. Ramesh Kumar',
    subject: 'Computer Science',
    color: '#4285F4',
    description: 'This course provides an introduction to computer science concepts and programming using Python.',
    announcements: [
      {
        id: 'a1',
        date: '2023-09-15',
        title: 'Welcome to the course',
        content: 'Welcome to Introduction to Computer Science! Please review the syllabus and introduce yourself in the discussion forum.'
      },
      {
        id: 'a2',
        date: '2023-09-18',
        title: 'Assignment 1 Posted',
        content: 'The first assignment has been posted and is due next Friday. Please check the assignments tab for more details.'
      }
    ],
    assignments: [
      {
        id: 'assign1',
        title: 'Python Basics',
        dueDate: '2023-09-22',
        status: 'pending',
        points: 100,
        description: 'Complete the exercises on basic Python syntax, variables, and control structures.',
      },
      {
        id: 'assign2',
        title: 'Data Structures Implementation',
        dueDate: '2023-10-05',
        status: 'pending',
        points: 150,
        description: 'Implement various data structures in Python including lists, dictionaries, and custom classes.',
      },
    ],
    materials: [
      {
        id: 'm1',
        title: 'Introduction to Python.pdf',
        type: 'pdf',
        date: '2023-09-10',
      },
      {
        id: 'm2',
        title: 'Week 1 - Lecture Slides',
        type: 'ppt',
        date: '2023-09-12',
      },
      {
        id: 'm3',
        title: 'Python Coding Examples',
        type: 'zip',
        date: '2023-09-14',
      },
    ]
  },
  '2': {
    id: '2',
    title: 'Business Administration',
    instructor: 'Prof. Sanjay Patel',
    subject: 'Management',
    color: '#0F9D58',
    description: 'A comprehensive course covering the principles of business management and administration.',
    announcements: [
      {
        id: 'a1',
        date: '2023-09-12',
        title: 'Course Introduction',
        content: 'Welcome to Business Administration! We will have our first class on Monday at 10 AM.'
      }
    ],
    assignments: [],
    materials: [
      {
        id: 'm1',
        title: 'Syllabus.pdf',
        type: 'pdf',
        date: '2023-09-10',
      },
    ]
  },
};

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [activeTab, setActiveTab] = useState('stream');
  const [courseData, setCourseData] = useState(initialCourseData);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState({
    id: '',
    title: '',
    instructor: '',
    subject: '',
    color: '#4285F4',
    description: '',
  });
  
  const { userRole } = useAuth();
  
  const course = courseData[courseId as keyof typeof courseData] || courseData['1'];

  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.instructor || !newCourse.subject) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const courseId = `${Object.keys(courseData).length + 1}`;
    
    setCourseData({
      ...courseData,
      [courseId]: {
        ...newCourse,
        id: courseId,
        announcements: [],
        assignments: [],
        materials: []
      }
    });
    
    setNewCourse({
      id: '',
      title: '',
      instructor: '',
      subject: '',
      color: '#4285F4',
      description: '',
    });
    
    setIsAddCourseOpen(false);
    
    toast({
      title: "Course Added",
      description: "The course has been added to your list"
    });
  };

  const handleSaveCourseEdit = () => {
    if (isEditingCourse && courseId) {
      setCourseData({
        ...courseData,
        [courseId]: {
          ...course,
          title: newCourse.title || course.title,
          instructor: newCourse.instructor || course.instructor,
          subject: newCourse.subject || course.subject,
          description: newCourse.description || course.description,
        }
      });
      
      setIsEditingCourse(false);
      
      toast({
        title: "Course Updated",
        description: "The course has been updated successfully"
      });
    }
  };

  const startEditingCourse = () => {
    setNewCourse({
      id: course.id,
      title: course.title,
      instructor: course.instructor,
      subject: course.subject,
      color: course.color,
      description: course.description,
    });
    setIsEditingCourse(true);
  };

  return (
    <div className="flex min-h-screen">
      <Navigation />
      
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-secondary/20" style={{ borderTopColor: course.color }}>
          <div className="container px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {isEditingCourse ? (
                  <Input 
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    className="text-2xl font-bold mb-2"
                    placeholder="Course Title"
                  />
                ) : (
                  <h1 className="text-2xl font-bold">{course.title}</h1>
                )}
                
                {isEditingCourse ? (
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={newCourse.subject}
                      onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                      placeholder="Subject"
                      className="w-1/2"
                    />
                    <Input 
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                      placeholder="Instructor"
                      className="w-1/2"
                    />
                  </div>
                ) : (
                  <p className="text-muted-foreground">{course.subject} • {course.instructor}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt={course.instructor} />
                  <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                
                {isEditingCourse ? (
                  <Button variant="default" size="sm" onClick={handleSaveCourseEdit}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={startEditingCourse}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      People
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="container px-4 md:px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="mb-4">
              <TabsTrigger value="stream">
                <MessageSquare className="mr-2 h-4 w-4" />
                Stream
              </TabsTrigger>
              <TabsTrigger value="assignments">
                <FileText className="mr-2 h-4 w-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="materials">
                <Book className="mr-2 h-4 w-4" />
                Materials
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stream">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {course.announcements.map((announcement) => (
                    <Card key={announcement.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{course.instructor.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{announcement.title}</CardTitle>
                            <CardDescription>
                              {course.instructor} • {new Date(announcement.date).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{announcement.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="space-y-6">
                  {isEditingCourse ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Course Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <textarea 
                          value={newCourse.description}
                          onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                          placeholder="Course description"
                          className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Upcoming</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {course.assignments.length > 0 ? (
                            course.assignments.map(assignment => (
                              <div key={assignment.id} className="flex items-start gap-3">
                                <CalendarCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="font-medium text-sm">{assignment.title}</p>
                                  <p className="text-xs text-muted-foreground">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No upcoming assignments</p>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Course Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium text-sm">Instructor</h4>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Subject</h4>
                            <p className="text-sm text-muted-foreground">{course.subject}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">About</h4>
                            <p className="text-sm text-muted-foreground">{course.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assignments">
              <div className="space-y-6">
                {course.assignments.length > 0 ? (
                  course.assignments.map(assignment => (
                    <Card key={assignment.id} className="assignment-item">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              Due: {new Date(assignment.dueDate).toLocaleDateString()} • {assignment.points} points
                            </CardDescription>
                          </div>
                          <Button>View Assignment</Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{assignment.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Add or Create
                          </Button>
                          <Button variant="outline" size="sm">
                            <Paperclip className="mr-2 h-4 w-4" />
                            Add Attachment
                          </Button>
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Mark as Done
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-lg shadow">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Assignments Yet</h3>
                    <p className="text-muted-foreground">
                      Assignments will appear here when your instructor posts them.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="materials">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Course Materials</h2>
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Add Material
                  </Button>
                </div>
                
                <Card>
                  <div className="divide-y">
                    {course.materials.map(material => (
                      <div key={material.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{material.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(material.date).toLocaleDateString()} • {material.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                      </div>
                    ))}
                    
                    {course.materials.length === 0 && (
                      <div className="p-8 text-center">
                        <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Materials Yet</h3>
                        <p className="text-muted-foreground">
                          Course materials will appear here when added by your instructor.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="fixed bottom-6 right-6">
            <Button size="lg" className="rounded-full w-14 h-14 shadow-lg p-0" onClick={() => setIsAddCourseOpen(true)}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </main>
      
      <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="title">Course Title</Label>
              <Input 
                id="title" 
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                placeholder="Enter course title"
              />
            </div>
            
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input 
                id="instructor" 
                value={newCourse.instructor}
                onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                placeholder="Enter instructor name"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={newCourse.subject}
                onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})}
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Enter course description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCourse}>Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Course;
