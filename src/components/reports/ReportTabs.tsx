
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerformanceMetrics from './PerformanceMetrics';
import BehavioralIncidents from './BehavioralIncidents';
import AttendanceChart from './AttendanceChart';
import BehaviorChart from './BehaviorChart';
import ParticipationChart from './ParticipationChart';
import AcademicProgressChart from './AcademicProgressChart';
import AttendanceTrendsChart from './AttendanceTrendsChart';

interface ReportTabsProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const ReportTabs: React.FC<ReportTabsProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  return (
    <Tabs defaultValue="overview" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
        <TabsTrigger value="behavior">Behavior</TabsTrigger>
        <TabsTrigger value="academic">Academic</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceMetrics 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
          <BehavioralIncidents 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
        </div>
      </TabsContent>

      <TabsContent value="attendance">
        <div className="grid grid-cols-1 gap-6">
          <AttendanceTrendsChart 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
          <AttendanceChart 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
        </div>
      </TabsContent>

      <TabsContent value="behavior">
        <BehaviorChart 
          selectedStudent={selectedStudent}
          selectedPeriod={selectedPeriod}
          customDate={customDate}
        />
      </TabsContent>

      <TabsContent value="academic">
        <div className="grid grid-cols-1 gap-6">
          <AcademicProgressChart 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
          <ParticipationChart 
            selectedStudent={selectedStudent}
            selectedPeriod={selectedPeriod}
            customDate={customDate}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ReportTabs;
