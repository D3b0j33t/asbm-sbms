
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUp, Upload } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { 
  processFileData, 
  uploadUsersData, 
  uploadStudentsData,
  UserData,
  StudentData
} from '@/utils/fileProcessing';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from "lucide-react";

const RegisterStudent = () => {
  const [usersFile, setUsersFile] = useState<File | null>(null);
  const [studentsFile, setStudentsFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    users: { success: boolean; message: string } | null;
    students: { success: boolean; message: string } | null;
  }>({ users: null, students: null });
  const navigate = useNavigate();

  const handleUsersFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if the file is a CSV or XLSX file
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.name.endsWith('.csv') || 
          file.name.endsWith('.xlsx')) {
        setUsersFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or XLSX file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStudentsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Check if the file is a CSV or XLSX file
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.name.endsWith('.csv') || 
          file.name.endsWith('.xlsx')) {
        setStudentsFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or XLSX file.",
          variant: "destructive"
        });
      }
    }
  };

  const validateUsersData = (data: any[]): UserData[] => {
    return data.filter(item => {
      const hasRequiredFields = item.username && item.password && item.email;
      if (!hasRequiredFields) {
        console.warn('Skipping row with missing required fields:', item);
      }
      return hasRequiredFields;
    }) as UserData[];
  };

  const validateStudentsData = (data: any[]): StudentData[] => {
    return data.filter(item => {
      // Convert property names to lowercase for case-insensitive matching
      const normalizedItem: Record<string, any> = {};
      Object.keys(item).forEach(key => {
        normalizedItem[key.toLowerCase()] = item[key];
      });

      // Check for required fields
      const hasRequiredFields = 
        normalizedItem.name && 
        normalizedItem.email && 
        normalizedItem.roll_number && 
        normalizedItem.course && 
        normalizedItem.semester && 
        normalizedItem.attendance && 
        normalizedItem.behavior_score;
      
      if (!hasRequiredFields) {
        console.warn('Skipping row with missing required fields:', normalizedItem);
      }

      // Convert to proper StudentData format
      return hasRequiredFields ? {
        name: normalizedItem.name,
        email: normalizedItem.email,
        roll_number: normalizedItem.roll_number,
        course: normalizedItem.course,
        semester: Number(normalizedItem.semester),
        attendance: Number(normalizedItem.attendance),
        behavior_score: Number(normalizedItem.behavior_score),
        academic_score: Number(normalizedItem.academic_score || 80),
        participation_score: Number(normalizedItem.participation_score || 75),
        avatar_url: normalizedItem.avatar_url,
        leaderboard_points: normalizedItem.leaderboard_points ? Number(normalizedItem.leaderboard_points) : 0,
        cgpa: normalizedItem.cgpa ? Number(normalizedItem.cgpa) : 3.0
      } : null;
    }).filter(Boolean) as StudentData[];
  };

  const handleUpload = async () => {
    if (!usersFile && !studentsFile) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ users: null, students: null });
    
    try {
      // Process users file if selected
      if (usersFile) {
        const rawUsersData = await processFileData(usersFile);
        const validUsersData = validateUsersData(rawUsersData);
        
        console.log('Valid users data:', validUsersData);
        
        if (validUsersData.length === 0) {
          setUploadStatus(prev => ({ 
            ...prev, 
            users: { 
              success: false, 
              message: 'No valid user records found in the file' 
            } 
          }));
        } else {
          const result = await uploadUsersData(validUsersData);
          setUploadStatus(prev => ({ ...prev, users: result }));
          
          if (result.success) {
            toast({
              title: "Users upload successful",
              description: result.message,
            });
          } else {
            toast({
              title: "Users upload failed",
              description: result.message,
              variant: "destructive"
            });
          }
        }
      }
      
      // Process students file if selected
      if (studentsFile) {
        const rawStudentsData = await processFileData(studentsFile);
        const validStudentsData = validateStudentsData(rawStudentsData);
        
        console.log('Valid students data:', validStudentsData);
        
        if (validStudentsData.length === 0) {
          setUploadStatus(prev => ({ 
            ...prev, 
            students: { 
              success: false, 
              message: 'No valid student records found in the file' 
            } 
          }));
        } else {
          const result = await uploadStudentsData(validStudentsData);
          setUploadStatus(prev => ({ ...prev, students: result }));
          
          if (result.success) {
            toast({
              title: "Students upload successful",
              description: result.message,
            });
          } else {
            toast({
              title: "Students upload failed",
              description: result.message,
              variant: "destructive"
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while processing the files.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Register Students</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users File Upload Section */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Upload Users Data</CardTitle>
              <CardDescription>
                Upload a CSV/XLSX file containing user credentials (username, password, email)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="usersFile"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleUsersFileChange}
                  />
                  <Label htmlFor="usersFile" className="cursor-pointer">
                    <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to {usersFile ? 'change' : 'upload'} file
                    </p>
                    {usersFile && (
                      <p className="mt-2 text-xs font-medium text-primary">
                        Selected: {usersFile.name}
                      </p>
                    )}
                  </Label>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Required columns:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>username</li>
                    <li>password</li>
                    <li>email</li>
                  </ul>
                </div>
                
                {uploadStatus.users && (
                  <Alert variant={uploadStatus.users.success ? "default" : "destructive"}>
                    <AlertTitle>{uploadStatus.users.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {uploadStatus.users.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Students File Upload Section */}
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Upload Students Data</CardTitle>
              <CardDescription>
                Upload a CSV/XLSX file containing student details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    id="studentsFile"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleStudentsFileChange}
                  />
                  <Label htmlFor="studentsFile" className="cursor-pointer">
                    <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to {studentsFile ? 'change' : 'upload'} file
                    </p>
                    {studentsFile && (
                      <p className="mt-2 text-xs font-medium text-primary">
                        Selected: {studentsFile.name}
                      </p>
                    )}
                  </Label>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p className="font-medium mb-1">Required columns:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>name</li>
                    <li>email</li>
                    <li>roll_number</li>
                    <li>course</li>
                    <li>semester</li>
                    <li>attendance</li>
                    <li>behavior_score</li>
                  </ul>
                  <p className="font-medium mt-2 mb-1">Optional columns:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>academic_score (default: 80)</li>
                    <li>participation_score (default: 75)</li>
                    <li>avatar_url</li>
                    <li>leaderboard_points (default: 0)</li>
                    <li>cgpa (default: 3.0)</li>
                  </ul>
                </div>
                
                {uploadStatus.students && (
                  <Alert variant={uploadStatus.students.success ? "default" : "destructive"}>
                    <AlertTitle>{uploadStatus.students.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>
                      {uploadStatus.students.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button 
            size="lg" 
            className="px-8 transition-all duration-300 hover:scale-105"
            onClick={handleUpload}
            disabled={isUploading || (!usersFile && !studentsFile)}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Files...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload and Process Files
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Note: The email field will be used to link records between users and students tables.</p>
          <p className="mt-2">Files must be in CSV or XLSX format with the required column headers.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
