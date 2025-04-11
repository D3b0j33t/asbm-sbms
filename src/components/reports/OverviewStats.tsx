
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BarChart2, Users, TrendingUp } from 'lucide-react';
import { getStudentsTable, getBehavioralIncidentsTable } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { startOfWeek, startOfMonth, subMonths, format } from 'date-fns';

interface OverviewStatsProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({ 
  selectedStudent, 
  selectedPeriod,
  customDate 
}) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageAttendance: 0,
    averageBehavior: 0,
    totalIncidents: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      // Set date range based on selected period
      let startDate;
      const currentDate = new Date();
      
      switch (selectedPeriod) {
        case 'week':
          startDate = startOfWeek(currentDate);
          break;
        case 'month':
          startDate = startOfMonth(currentDate);
          break;
        case 'semester':
          // Assuming a semester is roughly 6 months
          startDate = subMonths(currentDate, 6);
          break;
        case 'year':
          startDate = subMonths(currentDate, 12);
          break;
        case 'custom':
          startDate = customDate || currentDate;
          break;
        default:
          startDate = subMonths(currentDate, 6); // Default to semester
      }
      
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      
      // Fetch students data with filters
      let studentsQuery = getStudentsTable().select('attendance, behavior_score');
      
      // Apply student filter if specific student selected
      if (selectedStudent !== 'all') {
        studentsQuery = studentsQuery.eq('id', selectedStudent);
      }
      
      const { data: students, error: studentsError } = await studentsQuery;
      
      if (studentsError) throw studentsError;
      
      // Fetch behavioral incidents count with filters
      let incidentsQuery = getBehavioralIncidentsTable().select('id', { count: 'exact', head: true });
      
      // Apply date filter
      incidentsQuery = incidentsQuery.gte('incident_date', formattedStartDate);
      
      // Apply student filter if specific student selected
      if (selectedStudent !== 'all') {
        incidentsQuery = incidentsQuery.eq('student_id', selectedStudent);
      }
      
      const { count: incidentsCount, error: incidentsError } = await incidentsQuery;
      
      if (incidentsError) throw incidentsError;
      
      if (students) {
        const totalStudents = students.length;
        const totalAttendance = students.reduce((sum, student) => sum + (student.attendance || 0), 0);
        const totalBehavior = students.reduce((sum, student) => sum + (student.behavior_score || 0), 0);
        
        setStats({
          totalStudents,
          averageAttendance: totalStudents > 0 ? Math.round(totalAttendance / totalStudents) : 0,
          averageBehavior: totalStudents > 0 ? Math.round(totalBehavior / totalStudents) : 0,
          totalIncidents: incidentsCount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
    
    // Set up real-time listeners for changes to relevant tables
    const studentsChannel = supabase
      .channel('public:students:stats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => { fetchStats(); }
      )
      .subscribe();
      
    const incidentsChannel = supabase
      .channel('public:incidents:stats')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavioral_incidents' }, 
        () => { fetchStats(); }
      )
      .subscribe();
    
    // Clean up subscriptions when component unmounts
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(incidentsChannel);
    };
  }, [selectedStudent, selectedPeriod, customDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {selectedStudent !== 'all' ? 'Selected student' : 'Enrolled in all courses'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageAttendance}%</div>
          <p className="text-xs text-muted-foreground">
            {selectedStudent !== 'all' ? 'For selected student' : 'Across all students'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Behavior Score</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageBehavior}/100</div>
          <p className="text-xs text-muted-foreground">Based on behavior metrics</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Incidents Reported</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalIncidents}</div>
          <p className="text-xs text-muted-foreground">
            {selectedPeriod === 'custom' ? 'Since selected date' : 
              selectedPeriod === 'week' ? 'This week' :
              selectedPeriod === 'month' ? 'This month' :
              selectedPeriod === 'year' ? 'This year' : 'This semester'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewStats;
