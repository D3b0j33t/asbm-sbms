
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { getStudentsTable } from '@/lib/supabase';
import { StudentType } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportFiltersProps {
  selectedStudent: string;
  setSelectedStudent: (value: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
  onDateRangeChange?: (date: Date | undefined) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  selectedStudent,
  setSelectedStudent,
  selectedPeriod,
  setSelectedPeriod,
  onDateRangeChange
}) => {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch courses for filtering
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await getStudentsTable()
          .select('course')
          .order('course')
          .not('course', 'is', null);

        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }

        if (data) {
          // Extract unique courses
          const courses = [...new Set(data.map(student => student.course))];
          setAvailableCourses(courses.filter(Boolean) as string[]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  // Fetch students based on filters
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        let query = getStudentsTable().select('*');
        
        // Apply course filter if selected and not 'all'
        if (courseFilter && courseFilter !== 'all') {
          query = query.eq('course', courseFilter);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) {
          console.error('Error fetching students:', error);
          return;
        }
        
        if (data) {
          setStudents(data as StudentType[]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [courseFilter]);

  // Filter students by search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (onDateRangeChange) {
      onDateRangeChange(selectedDate);
    }
    setIsCalendarOpen(false);
  };

  // Helper to get student name from ID
  const getStudentNameById = () => {
    if (selectedStudent === 'all') return 'All Students';
    const student = students.find(s => s.id === selectedStudent);
    return student ? student.name : 'Select student';
  };

  return (
    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 items-start">
      {/* Course filter */}
      <Select value={courseFilter} onValueChange={setCourseFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by course" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Courses</SelectItem>
          {availableCourses.map(course => (
            <SelectItem key={course} value={course}>{course}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Student selector */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {isLoading ? (
              <Skeleton className="h-4 w-full" />
            ) : (
              getStudentNameById()
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="p-2">
            <Input 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              <div 
                className="px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer"
                onClick={() => {
                  setSelectedStudent('all');
                  setSearchQuery('');
                }}
              >
                All Students
              </div>
              {isLoading ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  Loading students...
                </div>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <div 
                    key={student.id} 
                    className="px-2 py-1.5 text-sm rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedStudent(student.id);
                      setSearchQuery('');
                    }}
                  >
                    <div>{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.roll_number} - {student.course}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No students found
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {/* Time period selector */}
      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">Current Week</SelectItem>
          <SelectItem value="month">Current Month</SelectItem>
          <SelectItem value="semester">Current Semester</SelectItem>
          <SelectItem value="year">Academic Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Calendar date picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setIsCalendarOpen(true)}>
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReportFilters;
