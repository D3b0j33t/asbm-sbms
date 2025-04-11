
import React from 'react';
import Navigation from '@/components/Navigation';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { LineChart, BarChart3, TrendingUp, Users, Medal, Trophy, Award } from 'lucide-react';

const LeaderboardPage = () => {
  const { userRole } = useAuth();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Navigation sidebar */}
      <Navigation />
      
      {/* Main content area */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Leaderboard</h1>
              <p className="text-muted-foreground">
                Track student performance and participation scores
              </p>
            </div>
          </div>

          <Tabs defaultValue="overall" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overall">
                <Trophy className="h-4 w-4 mr-2" />
                Overall Rankings
              </TabsTrigger>
              <TabsTrigger value="academic">
                <TrendingUp className="h-4 w-4 mr-2" />
                Academic Performance
              </TabsTrigger>
              <TabsTrigger value="participation">
                <Medal className="h-4 w-4 mr-2" />
                Participation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overall" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">238</div>
                    <p className="text-xs text-muted-foreground">From across all departments</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Course</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Computer Science</div>
                    <p className="text-xs text-muted-foreground">Highest average points</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Points Awarded</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">13,587</div>
                    <p className="text-xs text-muted-foreground">Total points this semester</p>
                  </CardContent>
                </Card>
              </div>
              
              <Leaderboard />
            </TabsContent>
            
            <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance Leaderboard</CardTitle>
                  <CardDescription>Students ranked by academic scores and CGPA</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground py-8 text-center">
                    Academic performance leaderboard will be available soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="participation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Participation Leaderboard</CardTitle>
                  <CardDescription>Students ranked by participation in co-curricular activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground py-8 text-center">
                    Participation leaderboard will be available soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
