
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, UserIcon, LockIcon, LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type UserRole = 'student' | 'teacher' | 'admin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password, role);
      
      toast({
        title: 'Login Successful',
        description: `Welcome back!`,
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!signupPassword) {
        throw new Error('Password is required');
      }
      
      let tableName: 'users' | 'faculty' | 'admin_users' = 'users';
      
      if (role === 'student') {
        tableName = 'users';
      } else if (role === 'teacher') {
        tableName = 'faculty';
      } else if (role === 'admin') {
        tableName = 'admin_users';
      }
      
      console.log(`Creating ${role} account in ${tableName} table with password`);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert([
          { 
            username: username,
            email: signupEmail,
            password: signupPassword,
            phone_number: phoneNumber 
          }
        ]);
      
      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message || `Error creating ${role} account`);
      }
      
      toast({
        title: 'Account Created Successfully',
        description: 'You can now login with your new account',
      });
      
      setUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setPhoneNumber('');
      setIsSignupOpen(false);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'An error occurred during signup.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <img 
          src="/lovable-uploads/7afce98d-f21c-40c0-a054-0b0431ca10c9.png" 
          alt="ASBM University Campus" 
          className="w-full h-full object-cover opacity-20" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/5"></div>
      </div>
      
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-xl border-t-4 border-t-primary animate-fade-in glass-card">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="mb-3">
              <img src="/lovable-uploads/e837c76a-f20c-4215-b385-a87dd3a9f7ee.png" alt="ASBM University" className="h-16" />
            </div>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="student" className="w-full" onValueChange={(value) => setRole(value as UserRole)}>
            <TabsList className="grid grid-cols-3 mb-4 mx-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <span className="mr-2">Signing in</span>
                      <span className="animate-pulse">...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  )}
                </Button>
                
                {role !== 'student' && (
                  <p className="text-sm text-center text-muted-foreground">
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      className="text-primary hover:underline" 
                      onClick={() => setIsSignupOpen(true)}
                    >
                      Create one
                    </button>
                  </p>
                )}
                
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Trouble logging in? Contact your administrator
                </p>
              </CardFooter>
            </form>
          </Tabs>
        </Card>
      </div>
      
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create {role.charAt(0).toUpperCase() + role.slice(1)} Account</DialogTitle>
            <DialogDescription>
              Enter your information to create a new account
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSignup} className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2">Creating account</span>
                    <span className="animate-pulse">...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
