
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DownloadCloud, File, FileText, Film, Image, Music, Package, Trash2, UserPlus, Filter, Users, BookOpen, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TeachingMaterialType, StudentType } from '@/types/supabase';
import { getTeachingMaterialsTable, getStudentsTable, checkStudentAccessToMaterial, getStudentMaterialsTable } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilesListProps {
  refreshTrigger?: number;
  studentCourse?: string;
  studentId?: string;
  isStudentView?: boolean; // Add this prop to the interface
}

const FilesList: React.FC<FilesListProps> = ({ refreshTrigger = 0, studentCourse, studentId }) => {
  const [materials, setMaterials] = useState<TeachingMaterialType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareId, setShareId] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [students, setStudents] = useState<StudentType[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [sharingMode, setSharingMode] = useState<'all' | 'course' | 'specific'>('all');
  const [shareWithCourse, setShareWithCourse] = useState('');
  const [currentStudentInfo, setCurrentStudentInfo] = useState<StudentType | null>(null);
  const { userRole, userEmail } = useAuth();
  const [visibleToAll, setVisibleToAll] = useState(false);

  // Fetch available courses for filtering
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await getStudentsTable()
          .select('course')
          .order('course')
          .not('course', 'is', null);

        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }

        if (data) {
          // Extract unique courses
          const courses = [...new Set(data.map(student => student.course))];
          setAvailableCourses(courses.filter(Boolean) as string[]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch current student info if user is a student
  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (userRole === 'student' && userEmail) {
        try {
          const { data, error } = await getStudentsTable()
            .select('*')
            .eq('email', userEmail)
            .single();

          if (error) {
            console.error('Error fetching student info:', error);
            return;
          }

          if (data) {
            setCurrentStudentInfo(data as StudentType);
          }
        } catch (error) {
          console.error('Error fetching student info:', error);
        }
      }
    };

    fetchStudentInfo();
  }, [userRole, userEmail]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        let query = getTeachingMaterialsTable().select('*');
        
        // Different query based on user role
        if (userRole === 'teacher' && userEmail) {
          // Teachers see their own files and files shared with all teachers
          query = query.or(`uploaded_by.eq.${userEmail},shared_with_all.eq.true`);
        } else if (userRole === 'student' && studentCourse) {
          // Students see files shared with all, with their course, or specifically with them
          // We'll filter the results after fetching
        }
        
        // Apply course filter if set and not 'all'
        if (courseFilter && courseFilter !== 'all' && userRole !== 'student') {
          query = query.eq('course', courseFilter);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching teaching materials:', error);
          return;
        }
        
        if (data) {
          let filteredMaterials = data as unknown as TeachingMaterialType[];
          
          // If student, filter materials they have access to
          if (userRole === 'student' && studentCourse) {
            // Get materials specifically shared with this student
            let studentMaterialIds: string[] = [];
            
            if (studentId) {
              const { data: studentMaterials, error: studentMaterialsError } = await getStudentMaterialsTable()
                .select('material_id')
                .eq('student_id', studentId);
              
              if (studentMaterialsError) {
                console.error('Error fetching student materials:', studentMaterialsError);
              } else if (studentMaterials) {
                studentMaterialIds = studentMaterials.map(sm => sm.material_id || '');
              }
            }
            
            // Filter materials based on access
            filteredMaterials = filteredMaterials.filter(material => 
              // Shared with all
              material.shared_with_all === true || 
              // Shared with student's course
              (material.shared_with_course && material.shared_with_course === studentCourse) ||
              // Specifically shared with student
              studentMaterialIds.includes(material.id)
            );
            
            // Apply course filter if set (for students, only filters their accessible materials)
            if (courseFilter && courseFilter !== 'all') {
              filteredMaterials = filteredMaterials.filter(material => 
                material.course === courseFilter
              );
            }
          }
          
          setMaterials(filteredMaterials);
        }
      } catch (error) {
        console.error('Exception fetching teaching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [refreshTrigger, userRole, userEmail, courseFilter, studentCourse, studentId]);

  useEffect(() => {
    if (!isShareDialogOpen || sharingMode !== 'specific') return;

    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        let query = getStudentsTable().select('*');
        
        // If a course is selected, filter by that course
        if (shareWithCourse) {
          query = query.eq('course', shareWithCourse as string);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setStudents(data as StudentType[]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to load students.',
          variant: 'destructive'
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [isShareDialogOpen, sharingMode, shareWithCourse]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await getTeachingMaterialsTable()
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setMaterials(materials.filter(material => material.id !== id));
      
      toast({
        title: 'File deleted',
        description: 'The file has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Delete failed',
        description: 'There was an error deleting the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleSharingModeChange = (mode: 'all' | 'course' | 'specific') => {
    setSharingMode(mode);
    // Reset sharing selections when mode changes
    if (mode === 'all') {
      setVisibleToAll(true);
      setShareWithCourse('all');
      setSelectedStudentIds([]);
    } else if (mode === 'course') {
      setVisibleToAll(false);
      setSelectedStudentIds([]);
    } else {
      setVisibleToAll(false);
      setShareWithCourse('all');
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleShare = async () => {
    if (!shareId) {
      toast({
        title: 'Invalid selection',
        description: 'No file selected for sharing.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (sharingMode === 'all') {
        // Share with all
        const { error } = await getTeachingMaterialsTable()
          .update({ 
            shared_with_all: true,
            shared_with_course: null
          })
          .eq('id', shareId);

        if (error) throw error;
      } 
      else if (sharingMode === 'course') {
        if (!shareWithCourse) {
          toast({
            title: 'Course required',
            description: 'Please select a course to share with.',
            variant: 'destructive'
          });
          return;
        }

        // Share with course
        const { error } = await getTeachingMaterialsTable()
          .update({ 
            shared_with_all: false,
            shared_with_course: shareWithCourse
          })
          .eq('id', shareId);

        if (error) throw error;
      }
      else if (sharingMode === 'specific') {
        if (selectedStudentIds.length === 0) {
          toast({
            title: 'No students selected',
            description: 'Please select at least one student to share with.',
            variant: 'destructive'
          });
          return;
        }

        // First, update the material to not be shared with all or any course
        const { error } = await getTeachingMaterialsTable()
          .update({ 
            shared_with_all: false,
            shared_with_course: null
          })
          .eq('id', shareId);

        if (error) throw error;
        
        // Then, delete any existing student material records for this material
        await getStudentMaterialsTable()
          .delete()
          .eq('material_id', shareId);

        // Finally, create new student material records
        const studentMaterialRecords = selectedStudentIds.map(studentId => ({
          material_id: shareId,
          student_id: studentId
        }));

        const { error: studentMaterialError } = await getStudentMaterialsTable()
          .insert(studentMaterialRecords);

        if (studentMaterialError) throw studentMaterialError;
      }

      toast({
        title: 'File sharing updated',
        description: getSharingDescription(),
      });

      // Refresh the materials list
      const { data, error } = await getTeachingMaterialsTable()
        .select('*')
        .eq('id', shareId)
        .single();
        
      if (!error && data) {
        setMaterials(materials.map(material => 
          material.id === shareId ? { ...material, ...data } : material
        ));
      }

      resetShareForm();
    } catch (error) {
      console.error('Error sharing file:', error);
      toast({
        title: 'Share failed',
        description: 'There was an error updating the file sharing settings.',
        variant: 'destructive'
      });
    }
  };

  const getSharingDescription = () => {
    if (sharingMode === 'all') {
      return 'The file is now visible to all.';
    } else if (sharingMode === 'course') {
      return `The file is now visible to students in the ${shareWithCourse} course.`;
    } else {
      return `The file is now visible to ${selectedStudentIds.length} selected student(s).`;
    }
  };

  const resetShareForm = () => {
    setShareEmail('');
    setShareId(null);
    setSharingMode('all');
    setShareWithCourse('');
    setSelectedStudentIds([]);
    setIsShareDialogOpen(false);
  };

  const openShareDialog = (id: string) => {
    // Find the material to share
    const material = materials.find(m => m.id === id);
    if (!material) return;
    
    // Set initial sharing mode based on current material settings
    if (material.shared_with_all) {
      setSharingMode('all');
    } else if (material.shared_with_course) {
      setSharingMode('course');
      setShareWithCourse(material.shared_with_course);
    } else {
      setSharingMode('specific');
      // We'll load selected students in the useEffect
    }
    
    setShareId(id);
    setIsShareDialogOpen(true);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
      return <Image className="h-6 w-6 text-primary" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-primary" />;
    } else if (fileType.includes('video')) {
      return <Film className="h-6 w-6 text-primary" />;
    } else if (fileType.includes('audio')) {
      return <Music className="h-6 w-6 text-primary" />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <Package className="h-6 w-6 text-primary" />;
    } else {
      return <File className="h-6 w-6 text-primary" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSharingBadge = (material: TeachingMaterialType) => {
    if (material.shared_with_all) {
      return <Badge variant="outline" className="ml-1 text-xs">Shared with all</Badge>;
    } else if (material.shared_with_course) {
      return <Badge variant="outline" className="ml-1 text-xs">Course: {material.shared_with_course}</Badge>;
    } else {
      return <Badge variant="outline" className="ml-1 text-xs">Specific students</Badge>;
    }
  };

  const renderFileActions = (material: TeachingMaterialType) => {
    return (
      <div className="flex gap-2 mt-3 sm:mt-0 ml-auto">
        <Button variant="outline" size="sm" asChild>
          <a href={material.file_url} target="_blank" rel="noopener noreferrer" download>
            <DownloadCloud className="h-4 w-4 mr-1" />
            Download
          </a>
        </Button>
        
        {(userRole === 'admin' || (userRole === 'teacher' && material.uploaded_by === userEmail)) && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openShareDialog(material.id)}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteId(material.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle>Teaching Materials</CardTitle>
          
          {userRole !== 'student' && (
            <div className="flex items-center gap-2">
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {availableCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-3 border rounded-md">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {materials.length > 0 ? (
                materials.map(material => (
                  <div key={material.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.file_type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{material.name}</h4>
                        {material.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{material.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          <span>{formatFileSize(material.file_size)}</span>
                          <span>•</span>
                          <span>Uploaded: {formatDate(material.created_at)}</span>
                          {material.course && (
                            <>
                              <span>•</span>
                              <span>Course: {material.course}</span>
                            </>
                          )}
                          {getSharingBadge(material)}
                        </div>
                      </div>
                    </div>
                    {renderFileActions(material)}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No teaching materials available</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this file. Students will no longer be able to access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Teaching Material</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Tabs 
              value={sharingMode} 
              onValueChange={(value) => handleSharingModeChange(value as 'all' | 'course' | 'specific')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>All Users</span>
                </TabsTrigger>
                <TabsTrigger value="course" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>By Course</span>
                </TabsTrigger>
                <TabsTrigger value="specific" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Specific Students</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <p className="text-sm text-muted-foreground mb-2">
                  This file will be visible to all users.
                </p>
              </TabsContent>
              
              <TabsContent value="course">
                <div className="space-y-2">
                  <Label htmlFor="shareWithCourse">Share with Course</Label>
                  <Select value={shareWithCourse} onValueChange={setShareWithCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="specific">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="filterCourse">Filter by Course (Optional)</Label>
                    <Select value={shareWithCourse} onValueChange={setShareWithCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course to filter students" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {availableCourses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                
                  <div className="space-y-2">
                    <Label>Select Students</Label>
                    <div className="border rounded-md">
                      <ScrollArea className="h-[200px] p-2">
                        {isLoadingStudents ? (
                          <p className="text-center py-4 text-muted-foreground">Loading students...</p>
                        ) : students.length > 0 ? (
                          <div className="space-y-2">
                            {students.map((student) => (
                              <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                                <Checkbox 
                                  id={`student-${student.id}`} 
                                  checked={selectedStudentIds.includes(student.id)}
                                  onCheckedChange={(checked) => handleStudentSelection(student.id, checked === true)}
                                />
                                <Label htmlFor={`student-${student.id}`} className="flex-1 cursor-pointer">
                                  <div>{student.name}</div>
                                  <div className="text-xs text-muted-foreground">{student.roll_number} - {student.course}</div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-4 text-muted-foreground">No students found</p>
                        )}
                      </ScrollArea>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedStudentIds.length} student(s) selected
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleShare}>Update Sharing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FilesList;
