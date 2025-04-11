
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';

// Mock data for demonstration
const attendanceData = [
  { month: 'Jan', attendance: 92, average: 85 },
  { month: 'Feb', attendance: 88, average: 84 },
  { month: 'Mar', attendance: 95, average: 86 },
  { month: 'Apr', attendance: 90, average: 83 },
  { month: 'May', attendance: 87, average: 82 },
  { month: 'Jun', attendance: 93, average: 85 },
];

interface AttendanceChartProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl">Attendance Trend</CardTitle>
        <CardDescription>Monthly attendance percentage compared to class average</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          <ChartContainer 
            config={{
              attendance: { color: "#4285F4", label: "Student Attendance" },
              average: { color: "#9AA0A6", label: "Class Average" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 100]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#4285F4" 
                  strokeWidth={3} 
                  name="Attendance %" 
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#9AA0A6" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  name="Class Average %"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
