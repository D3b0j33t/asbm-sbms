
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CourseCard from '@/components/CourseCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Bell, Calendar, CheckCircle2, AlertTriangle, TrendingUp, 
  Users, FilePieChart, FileText, Edit, Plus, Trash2, Save
} from 'lucide-react';
import { mockCourses, mockStudents } from '@/utils/mockData';
import { useAuth } from '@/context/AuthContext';
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

// Define user course type
interface UserCourse {
  id: string;
  name: string;
  instructor: string;
  progress: number;
  pendingAssignments: number;
  image?: string;
  description: string;
  color: string;
}

// Define task type
interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  course: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// Define activity type
interface Activity {
  id: string;
  type: string;
  title: string;
  timestamp: Date;
  details?: string;
  course?: string;
}

const Dashboard = () => {
  const { userRole, userName } = useAuth();
  
  // State for user courses, tasks, and activities
  const [userCourses, setUserCourses] = useState<UserCourse[]>(mockCourses);
  
  // State for user courses, tasks, and activities
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Python Assignment',
      description: 'Finish all exercises from Chapter 5',
      dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      course: 'Introduction to Computer Science',
      completed: false,
      priority: 'high'
    },
    {
      id: '2',
      title: 'Prepare Business Case Study',
      description: 'Create presentation slides and analyze the case',
      dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      course: 'Business Administration',
      completed: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Review Financial Statements',
      dueDate: new Date(Date.now() + 86400000 * 1), // 1 day from now
      course: 'Financial Accounting',
      completed: true,
      priority: 'low'
    }
  ]);
  
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'announcement',
      title: 'New announcement in Business Administration',
      timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      course: 'Business Administration'
    },
    {
      id: '2',
      type: 'assignment',
      title: 'Assignment submitted: Data Structures',
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      course: 'Introduction to Computer Science'
    },
    {
      id: '3',
      type: 'exam',
      title: 'Uploaded exam: Financial Accounting',
      timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
      course: 'Financial Accounting'
    }
  ]);
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  
  // Edit states
  const [editingCourse, setEditingCourse] = useState<UserCourse | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  
  // Form fields for course
  const [courseName, setCourseName] = useState('');
  const [courseInstructor, setCourseInstructor] = useState('');
  const [courseProgress, setCourseProgress] = useState(0);
  const [coursePending, setCoursePending] = useState(0);
  const [courseDescription, setCourseDescription] = useState('');
  const [courseColor, setCourseColor] = useState('#4285F4');
  
  // Form fields for task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskCourse, setTaskCourse] = useState('');
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Form fields for activity
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState('announcement');
  const [activityCourse, setActivityCourse] = useState('');
  const [activityDetails, setActivityDetails] = useState('');
  
  // Helper function to get pending assignments count
  const getPendingAssignmentsCount = () => {
    return tasks.filter(task => !task.completed).length;
  };
  
  // Calculate average student metrics for teacher/admin dashboards
  const calculateStudentMetrics = () => {
    const avgAttendance = mockStudents.reduce((sum, student) => sum + student.attendance, 0) / mockStudents.length;
    const avgBehaviorScore = mockStudents.reduce((sum, student) => sum + student.behaviorScore, 0) / mockStudents.length;
    const avgAcademicScore = mockStudents.reduce((sum, student) => sum + student.academicScore, 0) / mockStudents.length;
    
    // Count incidents by type
    const incidentsByType = mockStudents.reduce((acc, student) => {
      if (student.behavioralIncidents) {
        student.behavioralIncidents.forEach(incident => {
          acc[incident.type] = (acc[incident.type] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);
    
    return { avgAttendance, avgBehaviorScore, avgAcademicScore, incidentsByType };
  };
  
  const { avgAttendance, avgBehaviorScore, avgAcademicScore, incidentsByType } = calculateStudentMetrics();
  
  // Find at-risk students (low attendance or behavior scores)
  const atRiskStudents = mockStudents
    .filter(student => student.attendance < 75 || student.behaviorScore < 70)
    .slice(0, 5);
  
  // Handle opening the course dialog for adding
  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseName('');
    setCourseInstructor('');
    setCourseProgress(0);
    setCoursePending(0);
    setCourseDescription('');
    setCourseColor('#4285F4');
    setCourseDialogOpen(true);
  };
  
  // Handle opening the course dialog for editing
  const handleEditCourse = (course: UserCourse) => {
    setEditingCourse(course);
    setCourseName(course.name);
    setCourseInstructor(course.instructor);
    setCourseProgress(course.progress);
    setCoursePending(course.pendingAssignments);
    setCourseDescription(course.description);
    setCourseColor(course.color || '#4285F4');
    setCourseDialogOpen(true);
  };
  
  // Handle saving a course
  const handleSaveCourse = () => {
    if (!courseName.trim()) {
      toast({
        title: 'Course Name Required',
        description: 'Please provide a name for the course',
        variant: 'destructive'
      });
      return;
    }
    
    const newCourse = {
      id: editingCourse ? editingCourse.id : `course-${Date.now()}`,
      name: courseName,
      instructor: courseInstructor,
      progress: courseProgress,
      pendingAssignments: coursePending,
      description: courseDescription,
      color: courseColor
    };
    
    if (editingCourse) {
      // Update existing course
      setUserCourses(prevCourses => 
        prevCourses.map(course => course.id === editingCourse.id ? newCourse : course)
      );
      toast({
        title: 'Course Updated',
        description: 'Your course has been updated successfully'
      });
    } else {
      // Add new course
      setUserCourses(prevCourses => [...prevCourses, newCourse]);
      toast({
        title: 'Course Added',
        description: 'Your course has been added successfully'
      });
    }
    
    setCourseDialogOpen(false);
  };
  
  // Handle deleting a course
  const handleDeleteCourse = (courseId: string) => {
    setUserCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
    if (editingCourse && editingCourse.id === courseId) {
      setCourseDialogOpen(false);
    }
    toast({
      title: 'Course Deleted',
      description: 'The course has been removed from your list'
    });
  };
  
  // Handle opening the task dialog for adding
  const handleAddTask = () => {
    setEditingTask(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskDueDate('');
    setTaskCourse('');
    setTaskCompleted(false);
    setTaskPriority('medium');
    setTaskDialogOpen(true);
  };
  
  // Handle opening the task dialog for editing
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskDueDate(task.dueDate.toISOString().split('T')[0]);
    setTaskCourse(task.course);
    setTaskCompleted(task.completed);
    setTaskPriority(task.priority);
    setTaskDialogOpen(true);
  };
  
  // Handle saving a task
  const handleSaveTask = () => {
    if (!taskTitle.trim()) {
      toast({
        title: 'Task Title Required',
        description: 'Please provide a title for the task',
        variant: 'destructive'
      });
      return;
    }
    
    if (!taskDueDate) {
      toast({
        title: 'Due Date Required',
        description: 'Please provide a due date for the task',
        variant: 'destructive'
      });
      return;
    }
    
    const newTask = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: taskTitle,
      description: taskDescription,
      dueDate: new Date(taskDueDate),
      course: taskCourse,
      completed: taskCompleted,
      priority: taskPriority
    };
    
    if (editingTask) {
      // Update existing task
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === editingTask.id ? newTask : task)
      );
      toast({
        title: 'Task Updated',
        description: 'Your task has been updated successfully'
      });
    } else {
      // Add new task
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast({
        title: 'Task Added',
        description: 'Your task has been added successfully'
      });
    }
    
    setTaskDialogOpen(false);
  };
  
  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (editingTask && editingTask.id === taskId) {
      setTaskDialogOpen(false);
    }
    toast({
      title: 'Task Deleted',
      description: 'The task has been removed from your list'
    });
  };
  
  // Handle toggling task completion
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    const task = tasks.find(task => task.id === taskId);
    if (task) {
      toast({
        title: task.completed ? 'Task Marked Incomplete' : 'Task Completed',
        description: task.completed ? 'Task has been marked as incomplete' : 'Task has been marked as complete'
      });
    }
  };
  
  // Handle opening the activity dialog for adding
  const handleAddActivity = () => {
    setEditingActivity(null);
    setActivityTitle('');
    setActivityType('announcement');
    setActivityCourse('');
    setActivityDetails('');
    setActivityDialogOpen(true);
  };
  
  // Handle opening the activity dialog for editing
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setActivityTitle(activity.title);
    setActivityType(activity.type);
    setActivityCourse(activity.course || '');
    setActivityDetails(activity.details || '');
    setActivityDialogOpen(true);
  };
  
  // Handle saving an activity
  const handleSaveActivity = () => {
    if (!activityTitle.trim()) {
      toast({
        title: 'Activity Title Required',
        description: 'Please provide a title for the activity',
        variant: 'destructive'
      });
      return;
    }
    
    const newActivity = {
      id: editingActivity ? editingActivity.id : `activity-${Date.now()}`,
      title: activityTitle,
      type: activityType,
      course: activityCourse,
      details: activityDetails,
      timestamp: editingActivity ? editingActivity.timestamp : new Date()
    };
    
    if (editingActivity) {
      // Update existing activity
      setActivities(prevActivities => 
        prevActivities.map(activity => activity.id === editingActivity.id ? newActivity : activity)
      );
      toast({
        title: 'Activity Updated',
        description: 'The activity has been updated successfully'
      });
    } else {
      // Add new activity
      setActivities(prevActivities => [newActivity, ...prevActivities]);
      toast({
        title: 'Activity Added',
        description: 'The activity has been added successfully'
      });
    }
    
    setActivityDialogOpen(false);
  };
  
  // Handle deleting an activity
  const handleDeleteActivity = (activityId: string) => {
    setActivities(prevActivities => prevActivities.filter(activity => activity.id !== activityId));
    if (editingActivity && editingActivity.id === activityId) {
      setActivityDialogOpen(false);
    }
    toast({
      title: 'Activity Deleted',
      description: 'The activity has been removed from your list'
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation sidebar */}
      <Navigation />
      
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        {/* Background image with overlay */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <img 
            src="/lovable-uploads/7afce98d-f21c-40c0-a054-0b0431ca10c9.png" 
            alt="ASBM University Campus" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm"></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Hello, {userName || (userRole === 'admin' ? 'Administrator' : userRole === 'teacher' ? 'Professor' : 'Student')}
              </h1>
              <p className="text-muted-foreground">
                Welcome to your ASBM University {userRole === 'admin' ? 'administration panel' : userRole === 'teacher' ? 'teaching portal' : 'classroom'}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button className="hidden sm:flex">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button variant="outline" asChild>
                <Link to="/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Link>
              </Button>
            </div>
          </div>

          {/* Dashboard Stats - Different for each role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {userRole === 'student' && (
              <>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{getPendingAssignmentsCount()}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getPendingAssignmentsCount() === 0 ? "All caught up!" : `${getPendingAssignmentsCount()} tasks need attention`}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Your Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudents[0].attendance}%</div>
                    <Progress value={mockStudents[0].attendance} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {mockStudents[0].attendance >= 80 ? "Excellent attendance" : "Room for improvement"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Academic Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudents[0].academicScore}/100</div>
                    <Progress value={mockStudents[0].academicScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {mockStudents[0].academicScore >= 80 ? "Excellent academic performance" : "Room for improvement"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Behavior Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudents[0].behaviorScore}/100</div>
                    <Progress value={mockStudents[0].behaviorScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {mockStudents[0].behaviorScore >= 80 ? "Excellent behavior" : "Room for improvement"}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
            
            {(userRole === 'teacher' || userRole === 'admin') && (
              <>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{mockStudents.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Link to="/admin" className="flex items-center text-primary hover:underline">
                        <Users className="h-3 w-3 mr-1" /> 
                        View all students
                      </Link>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgAttendance.toFixed(1)}%</div>
                    <Progress value={avgAttendance} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {avgAttendance >= 80 ? "Good class attendance" : "Needs improvement"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Behavior Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(incidentsByType['Minor'] || 0) + (incidentsByType['Major'] || 0)}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">Minor: {incidentsByType['Minor'] || 0}</span>
                      <span className="text-destructive">Major: {incidentsByType['Major'] || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Link to="/reports" className="flex items-center text-primary hover:underline">
                        <FilePieChart className="h-3 w-3 mr-1" />
                        View detailed report
                      </Link>
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Academic Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{avgAcademicScore.toFixed(1)}/100</div>
                    <Progress value={avgAcademicScore} className="h-2 mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {avgAcademicScore >= 80 ? "Good overall performance" : "Needs improvement"}
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Tasks Section for Students */}
          {userRole === 'student' && (
            <Card className="bg-white/90 backdrop-blur-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Tasks</CardTitle>
                  <CardDescription>Track your assignments and deadlines</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-md border hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTaskComplete(task.id)}
                            className="h-5 w-5 rounded border-gray-300 text-primary"
                          />
                          <div className={task.completed ? "line-through text-muted-foreground" : ""}>
                            <p className="font-medium">{task.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{task.course}</span>
                              <span>•</span>
                              <span className={
                                task.priority === 'high' ? "text-red-500" : 
                                task.priority === 'medium' ? "text-amber-500" : 
                                "text-green-500"
                              }>
                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-2">No tasks added yet</p>
                      <Button variant="outline" onClick={handleAddTask}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Your First Task
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enrolled Courses Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Enrolled Courses</h2>
              {userRole === 'student' && (
                <Button variant="outline" size="sm" onClick={handleAddCourse}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Course
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCourses.slice(0, 6).map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <div style={{ backgroundColor: course.color || '#4285F4' }} className="h-1.5" />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold line-clamp-2">{course.name}</CardTitle>
                      {userRole === 'student' && (
                        <Button variant="ghost" size="icon" onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      {course.instructor ? `Instructor: ${course.instructor}` : 'No instructor assigned'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      
                      <div className="text-sm">
                        <div className="line-clamp-2 text-muted-foreground">
                          {course.description || 'No description available'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Pending: </span>
                      <span className="font-medium">{course.pendingAssignments}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/course/${course.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in your account</CardDescription>
              </div>
              {userRole === 'student' && (
                <Button variant="outline" size="sm" onClick={handleAddActivity}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Activity
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start group">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {activity.type === 'announcement' ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : activity.type === 'assignment' ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{activity.title}</p>
                        {userRole === 'student' && (
                          <div className="hidden group-hover:flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditActivity(activity)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteActivity(activity.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp
                          ? new Date().getTime() - activity.timestamp.getTime() < 86400000
                            ? `${Math.floor((new Date().getTime() - activity.timestamp.getTime()) / 3600000)} hours ago`
                            : new Date().getTime() - activity.timestamp.getTime() < 86400000 * 2
                            ? 'Yesterday'
                            : `${Math.floor((new Date().getTime() - activity.timestamp.getTime()) / 86400000)} days ago`
                          : 'Just now'}
                      </p>
                      {activity.details && (
                        <p className="text-sm mt-1">{activity.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Conditional content for teachers/admins */}
          {(userRole === 'teacher' || userRole === 'admin') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>At-Risk Students</CardTitle>
                  <CardDescription>Students with low attendance or behavior scores</CardDescription>
                </CardHeader>
                <CardContent>
                  {atRiskStudents.length > 0 ? (
                    <div className="divide-y">
                      {atRiskStudents.map(student => (
                        <div key={student.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium text-sm">{student.name}</h4>
                              <p className="text-xs text-muted-foreground">{student.course}, Sem {student.semester}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {student.attendance < 75 && (
                              <div className="flex items-center text-amber-500">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">{student.attendance}% Attendance</span>
                              </div>
                            )}
                            {student.behaviorScore < 70 && (
                              <div className="flex items-center text-destructive">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">{student.behaviorScore}/100 Behavior</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No at-risk students found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Course Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                placeholder="Enter course name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseInstructor">Instructor</Label>
              <Input
                id="courseInstructor"
                value={courseInstructor}
                onChange={e => setCourseInstructor(e.target.value)}
                placeholder="Enter instructor name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseProgress">Progress (%)</Label>
              <Input
                id="courseProgress"
                type="number"
                min="0"
                max="100"
                value={courseProgress}
                onChange={e => setCourseProgress(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coursePending">Pending Assignments</Label>
              <Input
                id="coursePending"
                type="number"
                min="0"
                value={coursePending}
                onChange={e => setCoursePending(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDescription">Description</Label>
              <Textarea
                id="courseDescription"
                value={courseDescription}
                onChange={e => setCourseDescription(e.target.value)}
                placeholder="Enter course description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseColor">Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="courseColor"
                  type="color"
                  value={courseColor}
                  onChange={e => setCourseColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  value={courseColor}
                  onChange={e => setCourseColor(e.target.value)}
                  placeholder="#RRGGBB"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {editingCourse && (
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteCourse(editingCourse.id)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description (Optional)</Label>
              <Textarea
                id="taskDescription"
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                placeholder="Enter task description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskDueDate">Due Date</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={taskDueDate}
                onChange={e => setTaskDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskCourse">Related Course</Label>
              <Select value={taskCourse} onValueChange={setTaskCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {userCourses.map(course => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskPriority">Priority</Label>
              <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as 'low' | 'medium' | 'high')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="taskCompleted"
                checked={taskCompleted}
                onChange={e => setTaskCompleted(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="taskCompleted">Mark as completed</Label>
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {editingTask && (
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteTask(editingTask.id)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Activity Dialog */}
      <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="activityTitle">Activity Title</Label>
              <Input
                id="activityTitle"
                value={activityTitle}
                onChange={e => setActivityTitle(e.target.value)}
                placeholder="Enter activity title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityType">Activity Type</Label>
              <Select value={activityType} onValueChange={setActivityType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityCourse">Related Course (Optional)</Label>
              <Select value={activityCourse} onValueChange={setActivityCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {userCourses.map(course => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activityDetails">Details (Optional)</Label>
              <Textarea
                id="activityDetails"
                value={activityDetails}
                onChange={e => setActivityDetails(e.target.value)}
                placeholder="Enter additional details"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            {editingActivity && (
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteActivity(editingActivity.id)}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActivityDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveActivity}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
