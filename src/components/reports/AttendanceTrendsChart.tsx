
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

interface AttendanceTrendsChartProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const AttendanceTrendsChart: React.FC<AttendanceTrendsChartProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  // Generate mock data for attendance trends
  const generateAttendanceData = () => {
    // For demonstration, we'll create mock data based on the time period
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Number of data points to generate based on selected period
    let dataPoints = 6; // Default for semester
    if (selectedPeriod === 'week') dataPoints = 7;
    else if (selectedPeriod === 'month') dataPoints = 4;
    else if (selectedPeriod === 'year') dataPoints = 12;
    
    return Array.from({ length: dataPoints }).map((_, index) => {
      // Generate attendance data with a slight downward trend for realism
      const baseAttendance = 95 - (index * 1.2);
      // Add some randomness around the trend
      const variance = Math.floor(Math.random() * 10) - 5;
      const attendance = Math.max(0, Math.min(100, baseAttendance + variance));
      
      return {
        name: selectedPeriod === 'week' 
          ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]
          : months[(currentMonth - dataPoints + index + 1 + 12) % 12],
        attendance: attendance,
        classAverage: Math.max(0, Math.min(100, 85 - (index * 0.5) + (Math.random() * 8 - 4))),
        threshold: 75 // Attendance threshold line
      };
    });
  };
  
  const attendanceData = generateAttendanceData();
  
  const chartConfig = {
    attendance: { label: 'Student Attendance', color: '#3b82f6' },
    classAverage: { label: 'Class Average', color: '#6b7280' },
    threshold: { label: 'Required Attendance', color: '#ef4444' }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Trends</CardTitle>
        <CardDescription>
          {selectedStudent === 'all' 
            ? 'Average attendance trends across all students' 
            : 'Detailed attendance pattern'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <ReferenceLine 
                y={75} 
                stroke={chartConfig.threshold.color} 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Minimum Required (75%)', 
                  position: 'insideBottomRight',
                  fill: chartConfig.threshold.color,
                  fontSize: 12
                }} 
              />
              <defs>
                <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="attendance" 
                stroke={chartConfig.attendance.color} 
                fill="url(#attendanceGradient)" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="classAverage" 
                stroke={chartConfig.classAverage.color}
                strokeDasharray="5 5" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold">{Math.round(attendanceData[attendanceData.length-1]?.attendance || 0)}%</div>
            <div className="text-xs text-muted-foreground">Current Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {Math.round(attendanceData.reduce((sum, item) => sum + item.attendance, 0) / attendanceData.length)}%
            </div>
            <div className="text-xs text-muted-foreground">Average Attendance</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {Math.round(attendanceData.reduce((sum, item) => sum + item.classAverage, 0) / attendanceData.length)}%
            </div>
            <div className="text-xs text-muted-foreground">Class Average</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTrendsChart;
