import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Lock, Bell, Eye, EyeOff, Edit2, 
  MessageSquare, LogOut, ShieldCheck, Save
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { mockStudents } from '@/utils/mockData';
import { toast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { userRole, userName, userAvatar, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: userName || 'Student Name',
    email: `${userRole}@asbm.ac.in`,
    phone: '+91 98765 43210',
    address: 'Campus Residence, ASBM University, Bhubaneswar',
    password: '••••••••',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    assignmentReminders: true,
    behavioralUpdates: true,
    attendanceAlerts: true,
    newsAndAnnouncements: false,
  });
  
  const studentData = userRole === 'student' ? mockStudents[0] : null;
  
  const handleFormChange = (field, value) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleNotificationChange = (field, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
    setIsEditing(false);
  };
  
  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated.",
    });
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-6">User Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback>{userName ? userName.substring(0, 2).toUpperCase() : 'UN'}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{userName || 'User'}</h2>
                <p className="text-muted-foreground mb-4">{userRole}</p>
                {studentData && (
                  <div className="w-full">
                    <div className="px-4 py-2 bg-muted rounded-md mb-2 text-sm">
                      <span className="font-medium">Roll Number:</span> {studentData.rollNumber}
                    </div>
                    <div className="px-4 py-2 bg-muted rounded-md mb-2 text-sm">
                      <span className="font-medium">Course:</span> {studentData.course}
                    </div>
                    <div className="px-4 py-2 bg-muted rounded-md text-sm">
                      <span className="font-medium">Semester:</span> {studentData.semester}
                    </div>
                  </div>
                )}
                <div className="flex mt-6 gap-2">
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <Tabs defaultValue="profile">
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="profile" className="flex-1">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex-1">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex-1">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="flex">
                              <User className="h-4 w-4 text-muted-foreground absolute mt-3 ml-3" />
                              <Input 
                                id="fullName" 
                                value={userForm.fullName}
                                onChange={(e) => handleFormChange('fullName', e.target.value)}
                                className="pl-10"
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="flex">
                              <Mail className="h-4 w-4 text-muted-foreground absolute mt-3 ml-3" />
                              <Input 
                                id="email" 
                                type="email"
                                value={userForm.email}
                                onChange={(e) => handleFormChange('email', e.target.value)}
                                className="pl-10"
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex">
                              <Phone className="h-4 w-4 text-muted-foreground absolute mt-3 ml-3" />
                              <Input 
                                id="phone" 
                                value={userForm.phone}
                                onChange={(e) => handleFormChange('phone', e.target.value)}
                                className="pl-10"
                                disabled={!isEditing}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="language">Preferred Language</Label>
                            <Select defaultValue="english" disabled={!isEditing}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="odia">Odia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Input 
                              id="address" 
                              value={userForm.address}
                              onChange={(e) => handleFormChange('address', e.target.value)}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                        
                        {isEditing && (
                          <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveProfile}>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Settings</CardTitle>
                      <CardDescription>Manage your password and security preferences</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">Change Password</h3>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword">Current Password</Label>
                              <div className="flex relative">
                                <Lock className="h-4 w-4 text-muted-foreground absolute mt-3 ml-3" />
                                <Input 
                                  id="currentPassword" 
                                  type={showPassword ? "text" : "password"}
                                  value={userForm.password}
                                  onChange={(e) => handleFormChange('password', e.target.value)}
                                  className="pl-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-10 w-10"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="newPassword">New Password</Label>
                              <Input 
                                id="newPassword" 
                                type="password"
                                value={userForm.newPassword}
                                onChange={(e) => handleFormChange('newPassword', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm New Password</Label>
                              <Input 
                                id="confirmPassword" 
                                type="password"
                                value={userForm.confirmPassword}
                                onChange={(e) => handleFormChange('confirmPassword', e.target.value)}
                              />
                            </div>
                            <Button className="mt-2">Update Password</Button>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Enable Two-Factor Authentication</p>
                              <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch id="2fa" />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="text-lg font-medium mb-4">Login Sessions</h3>
                          <div className="rounded-md border p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-medium">Current Session</p>
                              <Badge variant="secondary">Active</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Chrome Browser on Windows • IP: 192.168.1.1
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last active: Just now
                            </p>
                          </div>
                          <Button variant="outline" className="w-full justify-center">
                            Sign Out of All Devices
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Manage how you receive notifications and alerts</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Notification Channels</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive updates via email
                              </p>
                            </div>
                            <Switch 
                              id="emailNotifications" 
                              checked={notificationSettings.emailNotifications}
                              onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">SMS Notifications</p>
                              <p className="text-sm text-muted-foreground">
                                Receive important alerts via SMS
                              </p>
                            </div>
                            <Switch 
                              id="smsNotifications" 
                              checked={notificationSettings.smsNotifications}
                              onCheckedChange={(checked) => handleNotificationChange('smsNotifications', checked)}
                            />
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Notification Types</h3>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Assignment Reminders</p>
                              <p className="text-sm text-muted-foreground">
                                Get reminders for upcoming assignments
                              </p>
                            </div>
                            <Switch 
                              id="assignmentReminders" 
                              checked={notificationSettings.assignmentReminders}
                              onCheckedChange={(checked) => handleNotificationChange('assignmentReminders', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Behavioral Updates</p>
                              <p className="text-sm text-muted-foreground">
                                Notifications about behavioral assessments
                              </p>
                            </div>
                            <Switch 
                              id="behavioralUpdates" 
                              checked={notificationSettings.behavioralUpdates}
                              onCheckedChange={(checked) => handleNotificationChange('behavioralUpdates', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Attendance Alerts</p>
                              <p className="text-sm text-muted-foreground">
                                Get notified about attendance issues
                              </p>
                            </div>
                            <Switch 
                              id="attendanceAlerts" 
                              checked={notificationSettings.attendanceAlerts}
                              onCheckedChange={(checked) => handleNotificationChange('attendanceAlerts', checked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">News & Announcements</p>
                              <p className="text-sm text-muted-foreground">
                                University news and announcements
                              </p>
                            </div>
                            <Switch 
                              id="newsAndAnnouncements" 
                              checked={notificationSettings.newsAndAnnouncements}
                              onCheckedChange={(checked) => handleNotificationChange('newsAndAnnouncements', checked)}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <Button onClick={handleSaveNotifications}>
                            Save Preferences
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
