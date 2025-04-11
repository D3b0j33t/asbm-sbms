import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Search, UserPlus, FileText, Filter, Download, ArrowUp, ArrowDown, 
  AlertTriangle, CheckCircle, User, UserCheck, Mail, Calendar, School,
  Brain, Bell, Edit, Pen, MessageSquare
} from 'lucide-react';
import { mockStudents, mockTeachers, Student, BehavioralIncident } from '@/utils/mockData';
import { useAuth } from '@/context/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { getStudentsTable, getPersonalityTraitsTable, getNotificationsTable, getBehavioralIncidentsTable } from '@/lib/supabase';
import type { StudentType, PersonalityTraitsType, BehavioralIncidentType } from '@/types/supabase';
import EditStudentDialog from '@/components/student/EditStudentDialog';
import CreateNotificationDialog from '@/components/notifications/CreateNotificationDialog';

const StatsCard = ({ icon: Icon, title, value, description, className = "" }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface NewStudent {
  name: string;
  email: string;
  rollNumber: string;
  course: string;
  semester: string;
  attendance: string;
  behaviorScore: string;
  phone: string;
}

const AdminPanel = () => {
  const { userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [courseFilter, setCourseFilter] = useState('All');
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    email: '',
    rollNumber: '',
    course: '',
    semester: '1',
    attendance: '85',
    behaviorScore: '80',
    phone: ''
  });
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [isCreateNotificationOpen, setIsCreateNotificationOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data: dbStudents, error } = await getStudentsTable()
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (dbStudents && dbStudents.length > 0) {
        const transformedStudents: Student[] = await Promise.all(dbStudents.map(async (student) => {
          const { data: traits, error: traitsError } = await getPersonalityTraitsTable()
            .select('*')
            .eq('student_id', student.id)
            .single();
            
          const { data: incidents, error: incidentsError } = await getBehavioralIncidentsTable()
            .select('*')
            .eq('student_id', student.id);
          
          const transformedIncidents: BehavioralIncident[] = incidents ? incidents.map(incident => ({
            id: incident.id,
            type: incident.type as 'Minor' | 'Major',
            description: incident.description,
            severity: incident.severity,
            date: incident.incident_date ? new Date(incident.incident_date) : undefined,
            incident_date: incident.incident_date,
            student_id: incident.student_id,
            created_at: incident.created_at
          })) : [];
          
          return {
            id: student.id,
            name: student.name,
            email: student.email,
            phone: "Not Available",
            rollNumber: student.roll_number,
            course: student.course,
            semester: student.semester,
            attendance: student.attendance,
            behaviorScore: student.behavior_score,
            avatar: student.avatar_url || '',
            academicScore: student.academic_score,
            participationScore: student.participation_score,
            behavioralIncidents: transformedIncidents,
            personalityTraits: traits ? {
              openness: traits.openness,
              conscientiousness: traits.conscientiousness,
              extraversion: traits.extraversion,
              agreeableness: traits.agreeableness,
              neuroticism: traits.neuroticism
            } : {
              openness: 70,
              conscientiousness: 70,
              extraversion: 70,
              agreeableness: 70,
              neuroticism: 50
            },
            strengths: ['Communication', 'Problem Solving'],
            areasOfImprovement: ['Time Management', 'Focus'],
            counselorNotes: ''
          };
        }));
        
        setStudents(transformedStudents);
      } else {
        setStudents(mockStudents);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error fetching students",
        description: "Could not load student data. Using mock data instead.",
        variant: "destructive"
      });
      setStudents(mockStudents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students
    .filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = courseFilter === 'All' || student.course === courseFilter;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => {
      let fieldA = a[sortField];
      let fieldB = b[sortField];
      
      if (typeof fieldA === 'string') {
        fieldA = fieldA.toLowerCase();
        fieldB = fieldB.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });

  const courses = ['All', ...new Set(students.map(student => student.course))];
  
  const atRiskCount = students.filter(student => 
    student.attendance < 75 || student.behaviorScore < 70
  ).length;
  
  const behaviorIncidentsCount = students.reduce(
    (count, student) => count + student.behavioralIncidents.length, 0
  );
  
  const avgAttendance = students.length > 0 ? Math.round(
    students.reduce((sum, student) => sum + student.attendance, 0) / students.length
  ) : 0;
  
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const SortIndicator = ({ field }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  const handleGenerateReport = (reportType) => {
    toast({
      title: `${reportType} Report Generated`,
      description: "The report has been generated and is ready for download.",
    });
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.rollNumber.trim() || !newStudent.course.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: studentData, error: studentError } = await getStudentsTable()
        .insert({
          name: newStudent.name,
          email: newStudent.email,
          roll_number: newStudent.rollNumber,
          course: newStudent.course,
          semester: parseInt(newStudent.semester),
          attendance: parseInt(newStudent.attendance),
          behavior_score: parseInt(newStudent.behaviorScore),
          academic_score: 80,
          participation_score: 75
        })
        .select()
        .single();
      
      if (studentError) throw studentError;
      
      const { error: traitsError } = await getPersonalityTraitsTable()
        .insert({
          student_id: studentData.id,
          openness: 70,
          conscientiousness: 70,
          extraversion: 70,
          agreeableness: 70,
          neuroticism: 50
        });
        
      if (traitsError) throw traitsError;
      
      const newStudentObj: Student = {
        id: studentData.id,
        name: newStudent.name,
        email: newStudent.email,
        phone: newStudent.phone || 'Not Available',
        rollNumber: newStudent.rollNumber,
        course: newStudent.course,
        semester: parseInt(newStudent.semester),
        attendance: parseInt(newStudent.attendance),
        behaviorScore: parseInt(newStudent.behaviorScore),
        avatar: '',
        behavioralIncidents: [],
        personalityTraits: {
          openness: 70,
          conscientiousness: 70,
          extraversion: 70,
          agreeableness: 70,
          neuroticism: 50
        },
        academicScore: 80,
        participationScore: 75,
        strengths: ['Communication'],
        areasOfImprovement: ['Time Management'],
        counselorNotes: ''
      };
      
      setStudents([...students, newStudentObj]);
      
      const { error: notifError } = await getNotificationsTable()
        .insert({
          id: crypto.randomUUID(),
          title: "New Student Added",
          message: `${newStudent.name} has been added to the student directory.`,
          type: "info",
          recipient_role: "all",
          student_id: studentData.id
        });
      
      if (notifError) console.error("Error creating notification:", notifError);
      
      setNewStudent({
        name: '',
        email: '',
        rollNumber: '',
        course: '',
        semester: '1',
        attendance: '85',
        behaviorScore: '80',
        phone: ''
      });
      
      setIsAddStudentOpen(false);
      
      toast({
        title: "Student Added",
        description: `${newStudent.name} has been added to the student directory.`
      });
      
      await fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Could not add student. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsEditStudentOpen(true);
  };

  const handleCreateNotificationClick = () => {
    setIsCreateNotificationOpen(true);
  };

  const updateStudentField = async (studentId: string, field: string, value: string | number) => {
    try {
      let updateData = {};
      
      if (['attendance', 'behaviorScore', 'academicScore', 'participationScore', 'leaderboardPoints', 'semester'].includes(field)) {
        updateData = { [field]: parseInt(value as string) };
      } else {
        updateData = { [field]: value };
      }
      
      const fieldMapping = {
        'behaviorScore': 'behavior_score',
        'academicScore': 'academic_score',
        'participationScore': 'participation_score',
        'leaderboardPoints': 'leaderboard_points',
        'rollNumber': 'roll_number'
      };
      
      const dbField = fieldMapping[field] || field;
      
      const { error } = await getStudentsTable()
        .update({ [dbField]: updateData[field] })
        .eq('id', studentId);
      
      if (error) throw error;
      
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, [field]: updateData[field] } 
          : student
      ));
      
      toast({
        title: "Student Updated",
        description: `Successfully updated student ${field}.`,
      });
      
      setEditingStudent(null);
      setEditingField(null);
      
      await fetchStudents();
      
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Update Failed",
        description: "Could not update student data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCellClick = (studentId: string, field: string, currentValue: string | number) => {
    if (field === 'status') return;
    
    setEditingStudent(studentId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: string, field: string) => {
    if (e.key === 'Enter') {
      updateStudentField(studentId, field, editValue);
    } else if (e.key === 'Escape') {
      setEditingStudent(null);
      setEditingField(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img 
          src="/lovable-uploads/7afce98d-f21c-40c0-a054-0b0431ca10c9.png" 
          alt="ASBM University Campus" 
          className="w-full h-full object-cover opacity-20" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/5"></div>
      </div>
      
      <main className="flex-1 py-0 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-muted-foreground">Manage student records and monitor behavior</p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button 
                className="transition-all duration-300 hover:scale-105"
                onClick={() => setIsAddStudentOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
              <Button 
                variant="outline" 
                className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                onClick={handleCreateNotificationClick}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
              <Button variant="outline" className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard 
              icon={User} 
              title="Total Students" 
              value={students.length} 
              description="Active students in the system"
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            />
            <StatsCard 
              icon={AlertTriangle} 
              title="At-Risk Students" 
              value={atRiskCount} 
              description={`${students.length > 0 ? Math.round((atRiskCount / students.length) * 100) : 0}% of total students`}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            />
            <StatsCard 
              icon={Brain} 
              title="Behavior Incidents" 
              value={behaviorIncidentsCount} 
              description="Total incidents reported"
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            />
            <StatsCard 
              icon={UserCheck} 
              title="Average Attendance" 
              value={`${avgAttendance}%`} 
              description={avgAttendance >= 80 ? "Good overall attendance" : "Needs improvement"}
              className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            />
          </div>
          
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="students" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Students</TabsTrigger>
              <TabsTrigger value="teachers" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Faculty</TabsTrigger>
              <TabsTrigger value="reports" className="transition-all duration-300 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Student Directory</CardTitle>
                  <CardDescription>View and manage all students</CardDescription>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or roll number..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            {courseFilter}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {courses.map((course) => (
                            <DropdownMenuItem 
                              key={course} 
                              onClick={() => setCourseFilter(course)}
                            >
                              {course}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <p>Loading students...</p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[300px]">
                              <Button 
                                variant="ghost" 
                                className="flex items-center gap-1 p-0 font-semibold"
                                onClick={() => handleSort('name')}
                              >
                                Student <SortIndicator field="name" />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button 
                                variant="ghost" 
                                className="flex items-center gap-1 p-0 font-semibold"
                                onClick={() => handleSort('course')}
                              >
                                Course <SortIndicator field="course" />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button 
                                variant="ghost" 
                                className="flex items-center gap-1 p-0 font-semibold"
                                onClick={() => handleSort('attendance')}
                              >
                                Attendance <SortIndicator field="attendance" />
                              </Button>
                            </TableHead>
                            <TableHead>
                              <Button 
                                variant="ghost" 
                                className="flex items-center gap-1 p-0 font-semibold"
                                onClick={() => handleSort('behaviorScore')}
                              >
                                Behavior <SortIndicator field="behaviorScore" />
                              </Button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id} className="transition-colors hover:bg-muted/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.avatar} alt={student.name} />
                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    {editingStudent === student.id && editingField === 'name' ? (
                                      <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => handleEditKeyDown(e, student.id, 'name')}
                                        onBlur={() => updateStudentField(student.id, 'name', editValue)}
                                        autoFocus
                                        className="h-7 w-36"
                                      />
                                    ) : (
                                      <div 
                                        className="font-medium cursor-pointer hover:underline" 
                                        onClick={() => handleCellClick(student.id, 'name', student.name)}
                                      >
                                        {student.name}
                                      </div>
                                    )}
                                    {editingStudent === student.id && editingField === 'rollNumber' ? (
                                      <Input
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onKeyDown={(e) => handleEditKeyDown(e, student.id, 'rollNumber')}
                                        onBlur={() => updateStudentField(student.id, 'rollNumber', editValue)}
                                        autoFocus
                                        className="h-6 w-36 text-xs"
                                      />
                                    ) : (
                                      <div 
                                        className="text-xs text-muted-foreground cursor-pointer hover:underline" 
                                        onClick={() => handleCellClick(student.id, 'rollNumber', student.rollNumber)}
                                      >
                                        {student.rollNumber}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  {editingStudent === student.id && editingField === 'course' ? (
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleEditKeyDown(e, student.id, 'course')}
                                      onBlur={() => updateStudentField(student.id, 'course', editValue)}
                                      autoFocus
                                      className="h-7 w-36"
                                    />
                                  ) : (
                                    <span 
                                      className="cursor-pointer hover:underline" 
                                      onClick={() => handleCellClick(student.id, 'course', student.course)}
                                    >
                                      {student.course}
                                    </span>
                                  )}
                                  {editingStudent === student.id && editingField === 'semester' ? (
                                    <Input
                                      type="number"
                                      min="1"
                                      max="8"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onKeyDown={(e) => handleEditKeyDown(e, student.id, 'semester')}
                                      onBlur={() => updateStudentField(student.id, 'semester', editValue)}
                                      autoFocus
                                      className="h-6 w-16 text-xs"
                                    />
                                  ) : (
                                    <span 
                                      className="text-xs text-muted-foreground cursor-pointer hover:underline" 
                                      onClick={() => handleCellClick(student.id, 'semester', student.semester)}
                                    >
                                      Semester {student.semester}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {editingStudent === student.id && editingField === 'attendance' ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => handleEditKeyDown(e, student.id, 'attendance')}
                                    onBlur={() => updateStudentField(student.id, 'attendance', editValue)}
                                    autoFocus
                                    className="h-7 w-16"
                                  />
                                ) : (
                                  <div 
                                    className="flex items-center cursor-pointer hover:underline" 
                                    onClick={() => handleCellClick(student.id, 'attendance', student.attendance)}
                                  >
                                    {student.attendance < 75 ? (
                                      <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    )}
                                    {student.attendance}%
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {editingStudent === student.id && editingField === 'behaviorScore' ? (
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => handleEditKeyDown(e, student.id, 'behaviorScore')}
                                    onBlur={() => updateStudentField(student.id, 'behaviorScore', editValue)}
                                    autoFocus
                                    className="h-7 w-16"
                                  />
                                ) : (
                                  <div 
                                    className="flex items-center cursor-pointer hover:underline" 
                                    onClick={() => handleCellClick(student.id, 'behaviorScore', student.behaviorScore)}
                                  >
                                    {student.behaviorScore < 70 ? (
                                      <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                    )}
                                    {student.behaviorScore}/100
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {student.attendance < 75 || student.behaviorScore < 70 ? (
                                  <Badge variant="destructive">At Risk</Badge>
                                ) : (
                                  <Badge variant="outline">Good Standing</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleEditStudentClick(student)}
                                    className="h-8 w-8"
                                  >
                                    <Pen className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild className="transition-colors hover:bg-primary/20">
                                    <Link to={`/admin/student/${student.id}`}>View</Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          
                          {filteredStudents.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8">
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <Search className="h-8 w-8 mb-4" />
                                  <p className="mb-2 font-medium">No students found</p>
                                  <p className="text-sm">Try adjusting your search or filters</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="teachers" className="animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle>Faculty Directory</CardTitle>
                  <CardDescription>View all faculty members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Teacher</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mockTeachers.slice(0, 8).map((teacher) => (
                          <TableRow key={teacher.id} className="transition-colors hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={teacher.avatar} alt={teacher.name} />
                                  <AvatarFallback>{teacher.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{teacher.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>{teacher.department}</TableCell>
                            <TableCell>{teacher.subject}</TableCell>
                            <TableCell>
                              <div className="flex items-center text-sm">
                                <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                {teacher.email}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="transition-colors hover:bg-primary/20">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Reports</CardTitle>
                    <CardDescription>Generate and download reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-primary">
                        <div>
                          <h3 className="font-medium">Student Behavior Report</h3>
                          <p className="text-sm text-muted-foreground">Comprehensive behavior analysis</p>
                        </div>
                        <Button onClick={() => handleGenerateReport('Student Behavior')} className="transition-transform hover:scale-105">
                          <FileText className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-primary">
                        <div>
                          <h3 className="font-medium">Attendance Report</h3>
                          <p className="text-sm text-muted-foreground">Student attendance trends</p>
                        </div>
                        <Button onClick={() => handleGenerateReport('Attendance')} className="transition-transform hover:scale-105">
                          <Calendar className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-primary">
                        <div>
                          <h3 className="font-medium">Course Performance</h3>
                          <p className="text-sm text-muted-foreground">Academic performance by course</p>
                        </div>
                        <Button onClick={() => handleGenerateReport('Course Performance')} className="transition-transform hover:scale-105">
                          <School className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md hover:border-primary">
                        <div>
                          <h3 className="font-medium">Behavioral Incident Log</h3>
                          <p className="text-sm text-muted-foreground">Complete incident history</p>
                        </div>
                        <Button onClick={() => handleGenerateReport('Behavioral Incident Log')} className="transition-transform hover:scale-105">
                          <Brain className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                    <CardDescription>Previously generated reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md">
                        <div>
                          <h3 className="font-medium">Monthly Behavior Summary</h3>
                          <p className="text-xs text-muted-foreground">Generated on 15 Oct 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md">
                        <div>
                          <h3 className="font-medium">Semester Attendance Report</h3>
                          <p className="text-xs text-muted-foreground">Generated on 30 Sep 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="p-4 border rounded-md flex justify-between items-center transition-all duration-300 hover:shadow-md">
                        <div>
                          <h3 className="font-medium">Academic Performance Trends</h3>
                          <p className="text-xs text-muted-foreground">Generated on 15 Sep 2023</p>
                        </div>
                        <Button variant="outline" size="sm" className="transition-transform hover:scale-105">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Link to="/reports" className="text-primary text-sm hover:underline flex items-center justify-center transition-transform hover:scale-105">
                        <BarChart className="h-4 w-4 mr-2" />
                        View Analytics Dashboard
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Enter student details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  placeholder="john.doe@example.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input 
                  id="rollNumber" 
                  value={newStudent.rollNumber}
                  onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})}
                  placeholder="ASBM2023001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                  placeholder="555-123-4567"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course">Course *</Label>
              <Input 
                id="course" 
                value={newStudent.course}
                onChange={(e) => setNewStudent({...newStudent, course: e.target.value})}
                placeholder="Business Administration"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={newStudent.semester}
                  onValueChange={(value) => setNewStudent({...newStudent, semester: value})}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attendance">Attendance %</Label>
                <Input 
                  id="attendance" 
                  type="number"
                  min="0"
                  max="100"
                  value={newStudent.attendance}
                  onChange={(e) => setNewStudent({...newStudent, attendance: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="behaviorScore">Behavior Score</Label>
                <Input 
                  id="behaviorScore" 
                  type="number"
                  min="0"
                  max="100"
                  value={newStudent.behaviorScore}
                  onChange={(e) => setNewStudent({...newStudent, behaviorScore: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedStudent && (
        <EditStudentDialog 
          isOpen={isEditStudentOpen}
          onClose={() => setIsEditStudentOpen(false)}
          student={selectedStudent}
          onStudentUpdated={fetchStudents}
        />
      )}
      
      <CreateNotificationDialog 
        isOpen={isCreateNotificationOpen}
        onClose={() => setIsCreateNotificationOpen(false)}
        students={students}
      />
    </div>
  );
};

export default AdminPanel;
