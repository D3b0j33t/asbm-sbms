
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Phone, Save, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { userRole, userName, userAvatar, userEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userForm, setUserForm] = useState({
    fullName: userName || '',
    email: userEmail || '',
    phone: '',
    address: 'Campus Residence, ASBM University, Bhubaneswar',
    avatarUrl: userAvatar || ''
  });
  
  // Check authentication status
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      // Fetch user profile data
      const fetchUserProfile = async () => {
        try {
          let tableName: 'users' | 'faculty' | 'admin_users' = 'users';
          
          if (userRole === 'student') {
            tableName = 'users';
          } else if (userRole === 'teacher') {
            tableName = 'faculty';
          } else if (userRole === 'admin') {
            tableName = 'admin_users';
          }
          
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('email', userEmail)
            .single();
          
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          
          if (data) {
            let phoneNumber = '';
            
            // Handle different table schemas
            if ('phone_number' in data) {
              phoneNumber = data.phone_number || '';
            }
            
            setUserForm(prev => ({
              ...prev,
              fullName: data.username || userName || '',
              email: data.email || userEmail || '',
              phone: phoneNumber
            }));
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
        }
      };
      
      fetchUserProfile();
    }
  }, [isAuthenticated, navigate, userEmail, userName, userRole]);
  
  const handleFormChange = (field: string, value: string) => {
    setUserForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${userRole}/${fileName}`;
      
      // Upload the file to the newly created avatars bucket
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update the form with the new avatar URL
      setUserForm(prev => ({
        ...prev,
        avatarUrl: publicUrl
      }));
      
      // Also update the profile record if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_email: userEmail,
          avatar_url: publicUrl
        }, { 
          onConflict: 'user_email' 
        });
      
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      toast({
        title: "Avatar uploaded",
        description: "Your profile picture has been updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your avatar.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      let tableName: 'users' | 'faculty' | 'admin_users' = 'users';
      
      if (userRole === 'student') {
        tableName = 'users';
      } else if (userRole === 'teacher') {
        tableName = 'faculty';
      } else if (userRole === 'admin') {
        tableName = 'admin_users';
      }
      
      // Prepare the update object based on table structure
      const updateData: any = { username: userForm.fullName };
      
      // Add phone_number field if updating faculty or admin_users
      if (tableName !== 'users') {
        updateData.phone_number = userForm.phone;
      }
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('email', userEmail);
      
      if (error) {
        throw error;
      }
      
      // Also update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_email: userEmail,
          bio: 'Student at ASBM University'
        }, {
          onConflict: 'user_email'
        });
        
      if (profileError) {
        console.error('Error updating profile:', profileError);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 pt-16">
      <main className="flex-1 py-6 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-6">User Profile</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="md:col-span-1">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={userForm.avatarUrl} alt={userForm.fullName} />
                  <AvatarFallback>{userForm.fullName ? userForm.fullName.substring(0, 2).toUpperCase() : 'UN'}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{userForm.fullName || 'User'}</h2>
                <p className="text-muted-foreground mb-4">{userRole}</p>
                
                {/* Upload avatar button */}
                <div className="mt-4">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center p-2 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors">
                      <Upload className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Change Profile Picture</span>
                    </div>
                    <Input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                    />
                  </Label>
                  {uploading && <p className="text-xs mt-2 text-muted-foreground">Uploading...</p>}
                </div>
                
                <div className="w-full mt-6">
                  <div className="px-4 py-2 bg-muted rounded-md mb-2 text-sm">
                    <span className="font-medium">Role:</span> {userRole}
                  </div>
                  <div className="px-4 py-2 bg-muted rounded-md mb-2 text-sm">
                    <span className="font-medium">Email:</span> {userForm.email}
                  </div>
                </div>
                
                <div className="flex mt-6 gap-2">
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit Profile
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
                                className="pl-10"
                                disabled={true} // Email should not be editable
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
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
