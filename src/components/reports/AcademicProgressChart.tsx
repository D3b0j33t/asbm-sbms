
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { getStudentsTable } from '@/lib/supabase';
import { StudentType } from '@/types/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface AcademicProgressChartProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const AcademicProgressChart: React.FC<AcademicProgressChartProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  const [studentData, setStudentData] = useState<StudentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        if (selectedStudent !== 'all') {
          const { data, error } = await getStudentsTable()
            .select('*')
            .eq('id', selectedStudent)
            .single();
          
          if (error) {
            console.error('Error fetching student data:', error);
            return;
          }
          
          if (data) {
            setStudentData(data as StudentType);
          }
        } else {
          setStudentData(null);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [selectedStudent]);
  
  // Generate mock data for academic progress
  const generateProgressData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      name: month,
      score: Math.floor(Math.random() * (100 - 60 + 1)) + 60, // Random score between 60 and 100
      average: 80 - index * 2, // Class average with a slight decline
      target: 75 // Target score
    }));
  };

  // Generate mock data for subject performance
  const generateSubjectData = () => {
    const subjects = ['Math', 'Science', 'English', 'History', 'Art'];
    return subjects.map(subject => ({
      name: subject,
      score: Math.floor(Math.random() * (100 - 70 + 1)) + 70, // Random score between 70 and 100
      average: 75
    }));
  };

  // Function to format the date
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl">Academic Performance</CardTitle>
        <CardDescription>
          {selectedStudent === 'all' 
            ? 'Average academic performance metrics for all students'
            : 'Detailed academic performance metrics'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
            <TabsTrigger value="subjects">Subject Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer 
                  config={{
                    score: { color: "#4285F4", label: "Academic Score" },
                    average: { color: "#9AA0A6", label: "Class Average" },
                    target: { color: "#0F9D58", label: "Target Score" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateProgressData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#4285F4" 
                        strokeWidth={3}
                        dot={{ r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="average" 
                        stroke="#9AA0A6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="target" 
                        stroke="#0F9D58" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ChartContainer 
                  config={{
                    score: { color: "#4285F4", label: "Score" },
                    average: { color: "#9AA0A6", label: "Average" }
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateSubjectData()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="score" 
                        name="Score" 
                        fill="#4285F4"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="average" 
                        name="Class Average" 
                        fill="#9AA0A6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AcademicProgressChart;
