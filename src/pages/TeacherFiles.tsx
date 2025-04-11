
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import FileUploader from '@/components/FileUploader';
import FilesList from '@/components/FilesList';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TeacherFiles = () => {
  const { userRole } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleFileUploaded = () => {
    // Trigger a refresh of the files list
    setRefreshTrigger(prev => prev + 1);
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
              <h1 className="text-2xl font-bold tracking-tight">Teaching Materials</h1>
              <p className="text-muted-foreground">
                Upload and manage teaching materials for your students
              </p>
            </div>
          </div>

          <Tabs defaultValue="browse" className="space-y-6">
            <TabsList>
              <TabsTrigger value="browse">Browse Materials</TabsTrigger>
              {(userRole === 'teacher' || userRole === 'admin') && (
                <TabsTrigger value="upload">Upload New Material</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="browse" className="space-y-6">
              <FilesList refreshTrigger={refreshTrigger} />
            </TabsContent>
            
            {(userRole === 'teacher' || userRole === 'admin') && (
              <TabsContent value="upload" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <FileUploader onFileUploaded={handleFileUploaded} />
                  </div>
                  <div className="md:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upload Guidelines</CardTitle>
                        <CardDescription>Tips for uploading effective teaching materials</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm">Use clear, descriptive file names that indicate the content and purpose</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm">Provide detailed descriptions to help students understand what the material covers</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm">Select the appropriate course to ensure materials are easy to find</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-primary mt-0.5" />
                          <p className="text-sm">Supported file types include: PDF, DOCX, PPTX, JPG, PNG, MP3, MP4, ZIP</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TeacherFiles;
