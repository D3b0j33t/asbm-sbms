
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBehavioralIncidentsTable, getStudentsTable } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, startOfMonth, subMonths } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface BehavioralIncident {
  id: string;
  date: string;
  incident_date: string;
  type: string;
  description: string;
  action: string;
  severity: string;
  teacher: string;
  student_name?: string;
}

interface BehavioralIncidentsProps {
  selectedStudent: string;
  selectedPeriod: string;
  customDate?: Date;
}

const BehavioralIncidents: React.FC<BehavioralIncidentsProps> = ({
  selectedStudent,
  selectedPeriod,
  customDate
}) => {
  const [incidents, setIncidents] = useState<BehavioralIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      
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
      
      // Fetch incidents with filters
      let query = getBehavioralIncidentsTable()
        .select('*')
        .gte('incident_date', formattedStartDate)
        .order('incident_date', { ascending: false })
        .limit(10);
      
      // Apply student filter if specific student selected
      if (selectedStudent !== 'all') {
        query = query.eq('student_id', selectedStudent);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Collect unique student IDs to fetch their names
        const studentIds = [...new Set(data.map(incident => incident.student_id))];
        
        if (studentIds.length > 0) {
          const { data: studentsData, error: studentsError } = await getStudentsTable()
            .select('id, name')
            .in('id', studentIds);
          
          if (studentsError) {
            console.error('Error fetching student names:', studentsError);
          } else if (studentsData) {
            const namesMap: Record<string, string> = {};
            studentsData.forEach(student => {
              namesMap[student.id] = student.name;
            });
            setStudentNames(namesMap);
          }
        }
        
        // Format the incidents data
        const formattedIncidents = data.map(incident => ({
          id: incident.id,
          date: format(new Date(incident.incident_date), 'yyyy-MM-dd'),
          incident_date: incident.incident_date,
          type: incident.type || 'Minor',
          description: incident.description || 'No description provided',
          action: incident.severity === 'Major' ? 'Counselor referral' : 'Verbal warning',
          severity: incident.severity || 'Minor',
          teacher: 'Staff Member',
          student_name: studentNames[incident.student_id] || 'Unknown Student'
        }));
        
        setIncidents(formattedIncidents);
      }
    } catch (error) {
      console.error('Error fetching behavioral incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchIncidents();
    
    // Set up real-time listener for changes to the incidents table
    const channel = supabase
      .channel('public:behavioral_incidents')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'behavioral_incidents' }, 
        () => {
          fetchIncidents();
        }
      )
      .subscribe();
    
    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStudent, selectedPeriod, customDate]);

  return (
    <Card className="shadow-md border-none">
      <CardHeader className="bg-gray-50 border-b pb-3">
        <CardTitle className="text-xl">Recent Behavioral Incidents</CardTitle>
        <CardDescription>
          {selectedStudent !== 'all' 
            ? 'Behavioral incidents for selected student' 
            : 'List of recent behavioral notes and actions'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : incidents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                {selectedStudent === 'all' && <TableHead>Student</TableHead>}
                <TableHead>Description</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id} className="hover:bg-gray-50">
                  <TableCell>{format(new Date(incident.incident_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.severity === 'Minor' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {incident.severity}
                    </span>
                  </TableCell>
                  {selectedStudent === 'all' && (
                    <TableCell>{incident.student_name}</TableCell>
                  )}
                  <TableCell>{incident.description}</TableCell>
                  <TableCell>{incident.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No behavioral incidents found for the selected filters.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BehavioralIncidents;
