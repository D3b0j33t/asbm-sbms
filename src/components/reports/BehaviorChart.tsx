
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';

// Mock behavioral incidents data for demonstration
const behavioralIncidentsData = [
  { month: 'Jan', minor: 5, major: 1 },
  { month: 'Feb', minor: 3, major: 0 },
  { month: 'Mar', minor: 4, major: 2 },
  { month: 'Apr', minor: 2, major: 0 },
  { month: 'May', minor: 1, major: 0 },
  { month: 'Jun', minor: 0, major: 0 },
];

interface BehaviorChartProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const BehaviorChart: React.FC<BehaviorChartProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl">Behavioral Incidents</CardTitle>
        <CardDescription>Monthly record of behavioral incidents</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          <ChartContainer 
            config={{
              minor: { color: "#F4B400", label: "Minor Incidents" },
              major: { color: "#DB4437", label: "Major Incidents" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behavioralIncidentsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar 
                  dataKey="minor" 
                  name="Minor Incidents" 
                  fill="#F4B400"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="major" 
                  name="Major Incidents" 
                  fill="#DB4437"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BehaviorChart;
