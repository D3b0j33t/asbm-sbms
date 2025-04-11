
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, Clock, Filter, Plus, SortAsc } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Mock data for todo items
const initialTodoItems = [
  {
    id: 't1',
    title: 'Complete Python Basics Assignment',
    dueDate: '2023-09-22',
    course: 'Introduction to Computer Science',
    color: '#4285F4',
    completed: false,
  },
  {
    id: 't2',
    title: 'Read Chapter 3: Business Ethics',
    dueDate: '2023-09-20',
    course: 'Business Administration',
    color: '#0F9D58',
    completed: false,
  },
  {
    id: 't3',
    title: 'Prepare Financial Report Analysis',
    dueDate: '2023-09-28',
    course: 'Financial Accounting',
    color: '#DB4437',
    completed: false,
  },
  {
    id: 't4',
    title: 'Review Data Structures Notes',
    dueDate: '2023-10-01',
    course: 'Data Structures & Algorithms',
    color: '#4285F4',
    completed: false,
  },
  {
    id: 't5',
    title: 'Submit Marketing Case Study',
    dueDate: '2023-09-19',
    course: 'Marketing Fundamentals',
    color: '#F4B400',
    completed: true,
  },
];

const courses = [
  { id: 'cs', name: 'Introduction to Computer Science', color: '#4285F4' },
  { id: 'ba', name: 'Business Administration', color: '#0F9D58' },
  { id: 'fa', name: 'Financial Accounting', color: '#DB4437' },
  { id: 'ds', name: 'Data Structures & Algorithms', color: '#4285F4' },
  { id: 'mf', name: 'Marketing Fundamentals', color: '#F4B400' },
];

const Todo = () => {
  const [todos, setTodos] = useState(initialTodoItems);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    course: '',
  });
  const { userRole } = useAuth();
  const canAddTasks = true; // Allow all users to add tasks
  
  const toggleTodoStatus = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate || !newTask.course) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const selectedCourse = courses.find(c => c.id === newTask.course);

    const newTaskItem = {
      id: `t${Date.now()}`,
      title: newTask.title,
      dueDate: newTask.dueDate,
      course: selectedCourse?.name || "",
      color: selectedCourse?.color || "#000000",
      completed: false
    };

    setTodos([...todos, newTaskItem]);
    setNewTask({ title: '', dueDate: '', course: '' });
    setIsAddTaskOpen(false);
    
    toast({
      title: "Task Added",
      description: "The task has been added to your list"
    });
  };
  
  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);
  
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">To-Do List</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
              {canAddTasks && (
                <Button size="sm" onClick={() => setIsAddTaskOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
          
          <Tabs defaultValue="pending" className="mb-8">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingTodos.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedTodos.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Tasks to Complete</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingTodos.length > 0 ? (
                      pendingTodos.map(todo => (
                        <div 
                          key={todo.id} 
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox 
                            id={todo.id} 
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodoStatus(todo.id)}
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={todo.id} 
                              className="font-medium cursor-pointer"
                            >
                              {todo.title}
                            </label>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Badge style={{ backgroundColor: todo.color, color: 'white' }}>
                                {todo.course}
                              </Badge>
                              <div className="flex items-center">
                                <CalendarDays className="h-3 w-3 mr-1" />
                                Due {new Date(todo.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">All Done!</h3>
                        <p className="text-muted-foreground">
                          You've completed all your tasks. Time to relax!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="completed">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completed Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedTodos.length > 0 ? (
                      completedTodos.map(todo => (
                        <div 
                          key={todo.id} 
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50"
                        >
                          <Checkbox 
                            id={`completed-${todo.id}`} 
                            checked={todo.completed}
                            onCheckedChange={() => toggleTodoStatus(todo.id)}
                          />
                          <div className="flex-1">
                            <label 
                              htmlFor={`completed-${todo.id}`} 
                              className="font-medium cursor-pointer line-through text-muted-foreground"
                            >
                              {todo.title}
                            </label>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Badge style={{ backgroundColor: `${todo.color}80`, color: 'white' }}>
                                {todo.course}
                              </Badge>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Completed on {new Date().toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-muted-foreground">
                          You haven't completed any tasks yet.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="course">Course</Label>
                <Select 
                  value={newTask.course}
                  onValueChange={(value) => setNewTask({...newTask, course: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Todo;
