
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getStudentsTable } from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';
import { StudentType } from '@/types/supabase';

const Leaderboard = () => {
  const [students, setStudents] = useState<StudentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = async () => {
    try {
      const { data, error } = await getStudentsTable()
        .select('*')
        .order('leaderboard_points', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching students for leaderboard:', error);
        return;
      }
      
      if (data) {
        setStudents(data as StudentType[]);
      }
    } catch (error) {
      console.error('Exception fetching students for leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();

    // Set up real-time listener for changes to the students table
    const channel = supabase
      .channel('public:students')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'students' }, 
        () => {
          // When any changes occur, refresh the leaderboard data
          fetchLeaderboardData();
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper to get the appropriate badge for each rank
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="font-semibold text-muted-foreground">{index + 1}</span>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">Student Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {students.length > 0 ? (
              students.map((student, index) => (
                <div key={student.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center justify-center w-6">
                    {getRankBadge(index)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatar_url || ''} alt={student.name} />
                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.course}, Sem {student.semester}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    {student.leaderboard_points || 0} points
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No student data available</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
