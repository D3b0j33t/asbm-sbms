
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  subject: string;
  color: string;
  pendingAssignments?: number;
  studentCount?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  subject,
  color,
  pendingAssignments = 0,
  studentCount = 25,
}) => {
  return (
    <Card className="course-card overflow-hidden border-t-4 h-full flex flex-col shadow-md hover:shadow-lg transition-shadow duration-300" style={{ borderTopColor: color }}>
      <CardHeader className="bg-secondary/30 pb-2">
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{subject}</p>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <p className="text-sm">
          <span className="font-semibold">Instructor:</span> {instructor}
        </p>
        
        <div className="mt-4 flex items-center text-sm">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{studentCount} students</span>
        </div>
        
        {pendingAssignments > 0 && (
          <div className="mt-2 flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-amber-500" />
            <span className="text-amber-500">{pendingAssignments} pending</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-secondary/10 flex justify-between pt-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <FileText className="mr-1 h-4 w-4" />
          {pendingAssignments > 0 ? (
            <span className="text-red-500 font-medium">{pendingAssignments} pending</span>
          ) : (
            <span>No pending work</span>
          )}
        </div>
        <Link to={`/course/${id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
