
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Loader2, Users, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { uploadTeachingMaterial, getTeachingMaterialsTable, getStudentsTable, getStudentMaterialsTable } from '@/lib/supabase';
import { TeachingMaterialType, StudentType } from '@/types/supabase';
import { TabsList, TabsTrigger, Tabs } from '@/components/ui/tabs';

interface FileUploaderProps {
  onFileUploaded?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [sharingMode, setSharingMode] = useState<'all' | 'course'>('course');
  const [uploading, setUploading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userEmail } = useAuth();

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
          const courses = [...new Set(data.map(student => student.course))];
          setAvailableCourses(courses.filter(Boolean) as string[]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name.split('.')[0]);
    }
  };

  const handleSharingModeChange = (mode: 'all' | 'course') => {
    setSharingMode(mode);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    if (!fileName.trim()) {
      toast({
        title: 'File name required',
        description: 'Please provide a name for the file.',
        variant: 'destructive',
      });
      return;
    }

    if (sharingMode === 'course' && !course) {
      toast({
        title: 'Course selection required',
        description: 'Please select a course to share this file with.',
        variant: 'destructive',
      });
      return;
    }

    if (!userEmail) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to upload files.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);

      const fileData = await uploadTeachingMaterial(
        file,
        fileName,
        description,
        course,
        userEmail,
        sharingMode === 'all'
      );

      if (!fileData) {
        throw new Error('Failed to upload file');
      }

      // Create the material object with proper typing and handling of the shared_with_course field
      const materialData = {
        name: fileName,
        description: description || undefined,
        file_url: fileData.url,
        file_type: fileData.type,
        file_size: fileData.size,
        course: course || undefined,
        uploaded_by: userEmail,
        shared_with_all: sharingMode === 'all',
        shared_with_course: sharingMode === 'course' ? course : null
      };

      console.log('Uploading material with data:', materialData);

      const { data: uploadedMaterial, error } = await getTeachingMaterialsTable()
        .insert(materialData)
        .select()
        .single();

      if (error || !uploadedMaterial) {
        console.error('Error creating material record:', error);
        throw error || new Error('Failed to create material record');
      }

      // If sharing with course, find all students in that course and add them to student_materials
      if (sharingMode === 'course' && course) {
        const { data: studentsInCourse, error: studentsError } = await getStudentsTable()
          .select('id')
          .eq('course', course);

        if (studentsError) {
          console.error('Error fetching students in course:', studentsError);
        } else if (studentsInCourse && studentsInCourse.length > 0) {
          // Create student material records for each student in the course
          const studentMaterialRecords = studentsInCourse.map(student => ({
            material_id: uploadedMaterial.id,
            student_id: student.id
          }));

          console.log(`Adding material to ${studentMaterialRecords.length} students in course ${course}`);

          const { error: studentMaterialError } = await getStudentMaterialsTable()
            .insert(studentMaterialRecords);

          if (studentMaterialError) {
            console.error('Error creating student material records:', studentMaterialError);
          }
        }
      }

      toast({
        title: 'File uploaded successfully',
        description: getSharingDescription(),
      });

      resetForm();

      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getSharingDescription = () => {
    if (sharingMode === 'all') {
      return 'Your file has been uploaded and is visible to all.';
    } else {
      return `Your file has been uploaded and is visible to students in the ${course} course.`;
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileName('');
    setDescription('');
    setCourse('');
    setSharingMode('course');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Teaching Material</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* File selection */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName">File Name</Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter a name for this file"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a description of this file"
              rows={3}
            />
          </div>

          {/* Sharing Options */}
          <div className="space-y-3 pt-2">
            <Label>Sharing Options</Label>
            <Tabs 
              value={sharingMode} 
              onValueChange={(value) => handleSharingModeChange(value as 'all' | 'course')}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>All Users</span>
                </TabsTrigger>
                <TabsTrigger value="course" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>By Course</span>
                </TabsTrigger>
              </TabsList>

              {/* All Users Tab */}
              <div className="mt-4">
                {sharingMode === 'all' && (
                  <p className="text-sm text-muted-foreground mb-2">
                    This file will be visible to all users.
                  </p>
                )}
                
                {/* Course Selection - Only show if sharingMode is 'course' */}
                {sharingMode === 'course' && (
                  <div className="space-y-2">
                    <Label htmlFor="course">Share with Course</Label>
                    <Select value={course} onValueChange={setCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      This file will be shared with all students enrolled in the selected course.
                    </p>
                  </div>
                )}
              </div>
            </Tabs>
          </div>

          {/* Course Selection for file association (regardless of sharing) */}
          {sharingMode !== 'course' && (
            <div className="space-y-2">
              <Label htmlFor="relatedCourse">Related Course (Optional)</Label>
              <Select value={course} onValueChange={setCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploader;
