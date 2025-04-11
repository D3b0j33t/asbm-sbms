
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer, ReferenceLine } from 'recharts';

// Mock participation data for demonstration
const participationData = [
  { month: 'Jan', participation: 75, target: 70 },
  { month: 'Feb', participation: 80, target: 70 },
  { month: 'Mar', participation: 85, target: 70 },
  { month: 'Apr', participation: 70, target: 70 },
  { month: 'May', participation: 90, target: 70 },
  { month: 'Jun', participation: 88, target: 70 },
];

interface ParticipationChartProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const ParticipationChart: React.FC<ParticipationChartProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl">Class Participation</CardTitle>
        <CardDescription>Monthly class participation scores with target threshold</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[400px] w-full">
          <ChartContainer 
            config={{
              participation: { color: "#0F9D58", label: "Participation Score" },
              target: { color: "#DB4437", label: "Target Score" },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <ReferenceLine y={70} stroke="#DB4437" strokeDasharray="3 3" />
                <Bar 
                  dataKey="participation" 
                  name="Participation Score" 
                  fill="#0F9D58" 
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

export default ParticipationChart;
