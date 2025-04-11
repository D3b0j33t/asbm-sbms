
import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import FilesList from '@/components/FilesList';
import { useAuth } from '@/context/AuthContext';
import { getStudentsTable, getStudentAccessibleMaterials } from '@/lib/supabase';
import { StudentType, TeachingMaterialType } from '@/types/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const StudentFiles = () => {
  const { userRole, userEmail } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [studentInfo, setStudentInfo] = useState<StudentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<TeachingMaterialType[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  
  // Fetch student information to get their course
  useEffect(() => {
    const fetchStudentInfo = async () => {
      if (userEmail) {
        try {
          setLoading(true);
          const { data, error } = await getStudentsTable()
            .select('*')
            .eq('email', userEmail)
            .single();
            
          if (error) {
            console.error('Error fetching student info:', error);
            toast({
              title: 'Error',
              description: 'Failed to load your student information.',
              variant: 'destructive'
            });
          } else if (data) {
            console.log('Student info loaded:', data);
            setStudentInfo(data as StudentType);
            
            // Now fetch materials for this student
            fetchMaterials(data as StudentType);
          } else {
            console.log('No student data found for email:', userEmail);
            toast({
              title: 'No student record found',
              description: 'Could not find your student record. Please contact an administrator.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Exception fetching student info:', error);
          toast({
            title: 'Error',
            description: 'An unexpected error occurred while loading your information.',
            variant: 'destructive'
          });
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchStudentInfo();
  }, [userEmail, refreshTrigger]);
  
  const fetchMaterials = async (student: StudentType) => {
    setLoadingMaterials(true);
    try {
      const materials = await getStudentAccessibleMaterials(student.id, student.course);
      setMaterials(materials);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your course materials.',
        variant: 'destructive'
      });
    } finally {
      setLoadingMaterials(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleDownload = (material: TeachingMaterialType) => {
    window.open(material.file_url, '_blank');
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation sidebar */}
      <Navigation />
      
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Course Materials</h1>
              <p className="text-muted-foreground">
                Access your course materials and resources
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || loadingMaterials}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            ) : studentInfo ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Course Materials for {studentInfo.course}</CardTitle>
                    <CardDescription>
                      Materials available for your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingMaterials ? (
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
                    ) : materials.length > 0 ? (
                      <div className="space-y-4">
                        {materials.map((material) => (
                          <div key={material.id} className="flex items-start gap-4 p-4 border rounded-md hover:bg-accent/20 transition-colors">
                            <div className="bg-primary/10 p-2 rounded">
                              <BookOpen className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{material.name}</h3>
                              {material.description && (
                                <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(material.created_at || '').toLocaleDateString()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {(material.file_size / 1024).toFixed(2)} KB
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(material)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No materials available</h3>
                        <p className="text-muted-foreground">
                          There are currently no materials available for your course.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="hidden">
                  <FilesList 
                    refreshTrigger={refreshTrigger} 
                    studentCourse={studentInfo.course}
                    studentId={studentInfo.id}
                    isStudentView={true}
                  />
                </div>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Course Materials</CardTitle>
                  <CardDescription>
                    No course information found. Please contact an administrator.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    We couldn't find your course information. Please make sure your account is properly set up.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFiles;
