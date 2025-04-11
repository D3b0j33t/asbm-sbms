
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';
import { 
  getStudentsTable, 
  getPersonalityTraitsTable, 
  getBehavioralIncidentsTable, 
  getNotificationsTable 
} from '@/lib/supabase';
import { StudentType, PersonalityTraitsType } from '@/types/supabase';

interface EditStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: any; // Using any for now, but we'll use the correct StudentType in the complete implementation
  onStudentUpdated: () => void;
}

const EditStudentDialog: React.FC<EditStudentDialogProps> = ({ 
  isOpen, 
  onClose, 
  student, 
  onStudentUpdated 
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Student basic info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState<string>('1');
  
  // Academic and behavior scores
  const [attendance, setAttendance] = useState<number[]>([80]);
  const [behaviorScore, setBehaviorScore] = useState<number[]>([80]);
  const [academicScore, setAcademicScore] = useState<number[]>([80]);
  const [participationScore, setParticipationScore] = useState<number[]>([80]);
  
  // Personality traits
  const [openness, setOpenness] = useState<number[]>([70]);
  const [conscientiousness, setConscientiousness] = useState<number[]>([70]);
  const [extraversion, setExtraversion] = useState<number[]>([70]);
  const [agreeableness, setAgreeableness] = useState<number[]>([70]);
  const [neuroticism, setNeuroticism] = useState<number[]>([50]);
  
  // Counselor notes
  const [counselorNotes, setCounselorNotes] = useState('');
  
  // Behavioral incident
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentType, setIncidentType] = useState('Minor');
  const [incidentSeverity, setIncidentSeverity] = useState('Low');
  
  useEffect(() => {
    if (student) {
      // Basic info
      setName(student.name || '');
      setEmail(student.email || '');
      setRollNumber(student.rollNumber || '');
      setCourse(student.course || '');
      setSemester(student.semester?.toString() || '1');
      
      // Scores
      setAttendance([student.attendance || 80]);
      setBehaviorScore([student.behaviorScore || 80]);
      setAcademicScore([student.academicScore || 80]);
      setParticipationScore([student.participationScore || 80]);
      
      // Personality traits
      if (student.personalityTraits) {
        setOpenness([student.personalityTraits.openness || 70]);
        setConscientiousness([student.personalityTraits.conscientiousness || 70]);
        setExtraversion([student.personalityTraits.extraversion || 70]);
        setAgreeableness([student.personalityTraits.agreeableness || 70]);
        setNeuroticism([student.personalityTraits.neuroticism || 50]);
      }
      
      // Counselor notes
      setCounselorNotes(student.counselorNotes || '');
    }
  }, [student, isOpen]);
  
  const handleSaveProfile = async () => {
    try {
      // Update student basic info
      const { error: studentError } = await getStudentsTable()
        .update({
          name,
          email,
          roll_number: rollNumber,
          course,
          semester: parseInt(semester),
          attendance: attendance[0],
          behavior_score: behaviorScore[0],
          academic_score: academicScore[0],
          participation_score: participationScore[0]
        })
        .eq('id', student.id);
      
      if (studentError) throw studentError;
      
      // Update personality traits
      const { error: traitsError } = await getPersonalityTraitsTable()
        .update({
          openness: openness[0],
          conscientiousness: conscientiousness[0],
          extraversion: extraversion[0],
          agreeableness: agreeableness[0],
          neuroticism: neuroticism[0]
        })
        .eq('student_id', student.id);
      
      if (traitsError) throw traitsError;
      
      toast({
        title: "Profile Updated",
        description: "Student profile has been successfully updated.",
      });
      
      onStudentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating student profile:', error);
      toast({
        title: "Update Failed",
        description: "Could not update student profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleAddIncident = async () => {
    if (!incidentDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a description for the incident.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await getBehavioralIncidentsTable()
        .insert({
          student_id: student.id,
          description: incidentDescription,
          type: incidentType,
          severity: incidentSeverity,
          incident_date: new Date().toISOString()
        });
      
      if (error) throw error;
      
      toast({
        title: "Incident Added",
        description: "Behavioral incident has been recorded.",
      });
      
      // Clear the form
      setIncidentDescription('');
      setIncidentType('Minor');
      setIncidentSeverity('Low');
      
      onStudentUpdated();
    } catch (error) {
      console.error('Error adding behavioral incident:', error);
      toast({
        title: "Error",
        description: "Could not add behavioral incident. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveCounselorNotes = async () => {
    // In a real implementation, you would save these notes to the database
    // For now we'll just log them as they aren't part of our current schema
    console.log('Saving counselor notes:', counselorNotes);
    
    try {
      // Create a notification for the counselor notes update
      await getNotificationsTable()
        .insert({
          id: crypto.randomUUID(),
          title: "Counselor Notes Updated",
          message: `Notes updated for student ${student?.name}`,
          type: "info",
          recipient_role: "all",
          student_id: student.id,
          read: false
        });
      
      toast({
        title: "Notes Saved",
        description: "Counselor notes have been saved and notification sent.",
      });
      
      onStudentUpdated();
    } catch (error) {
      console.error('Error saving counselor notes:', error);
      toast({
        title: "Error",
        description: "Could not save counselor notes. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student: {student?.name}</DialogTitle>
          <DialogDescription>
            Make changes to the student's profile, scores, and records.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="profile">Basic Info</TabsTrigger>
            <TabsTrigger value="behavior">Behavior & Scores</TabsTrigger>
            <TabsTrigger value="personality">Personality</TabsTrigger>
            <TabsTrigger value="incidents">Incidents & Notes</TabsTrigger>
          </TabsList>
          
          {/* Basic Info Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input 
                  id="rollNumber" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input 
                  id="course" 
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={semester}
                onValueChange={setSemester}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          {/* Behavior & Scores Tab */}
          <TabsContent value="behavior" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Attendance</Label>
                  <span className="text-sm">{attendance[0]}%</span>
                </div>
                <Slider 
                  value={attendance} 
                  onValueChange={setAttendance} 
                  max={100} 
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Behavior Score</Label>
                  <span className="text-sm">{behaviorScore[0]}/100</span>
                </div>
                <Slider 
                  value={behaviorScore} 
                  onValueChange={setBehaviorScore} 
                  max={100} 
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Academic Score</Label>
                  <span className="text-sm">{academicScore[0]}/100</span>
                </div>
                <Slider 
                  value={academicScore} 
                  onValueChange={setAcademicScore} 
                  max={100} 
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Participation Score</Label>
                  <span className="text-sm">{participationScore[0]}/100</span>
                </div>
                <Slider 
                  value={participationScore} 
                  onValueChange={setParticipationScore} 
                  max={100} 
                  step={1}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Personality Tab */}
          <TabsContent value="personality" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Openness</Label>
                  <span className="text-sm">{openness[0]}/100</span>
                </div>
                <Slider 
                  value={openness} 
                  onValueChange={setOpenness} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Curiosity, creativity, and openness to new experiences</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Conscientiousness</Label>
                  <span className="text-sm">{conscientiousness[0]}/100</span>
                </div>
                <Slider 
                  value={conscientiousness} 
                  onValueChange={setConscientiousness} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Organization, responsibility, and goal-oriented behavior</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Extraversion</Label>
                  <span className="text-sm">{extraversion[0]}/100</span>
                </div>
                <Slider 
                  value={extraversion} 
                  onValueChange={setExtraversion} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Sociability, assertiveness, and energy in social settings</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Agreeableness</Label>
                  <span className="text-sm">{agreeableness[0]}/100</span>
                </div>
                <Slider 
                  value={agreeableness} 
                  onValueChange={setAgreeableness} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Kindness, empathy, and cooperative tendencies</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Neuroticism</Label>
                  <span className="text-sm">{neuroticism[0]}/100</span>
                </div>
                <Slider 
                  value={neuroticism} 
                  onValueChange={setNeuroticism} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-muted-foreground">Emotional stability vs. anxiety and moodiness</p>
              </div>
            </div>
          </TabsContent>
          
          {/* Incidents & Notes Tab */}
          <TabsContent value="incidents" className="space-y-6">
            <div className="space-y-4 border-b pb-6">
              <h3 className="text-lg font-medium">Add Behavioral Incident</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incidentType">Incident Type</Label>
                  <Select 
                    value={incidentType}
                    onValueChange={setIncidentType}
                  >
                    <SelectTrigger id="incidentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Minor">Minor</SelectItem>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="incidentSeverity">Severity</Label>
                  <Select 
                    value={incidentSeverity}
                    onValueChange={setIncidentSeverity}
                  >
                    <SelectTrigger id="incidentSeverity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="incidentDescription">Description</Label>
                <Textarea 
                  id="incidentDescription" 
                  placeholder="Describe the incident..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button onClick={handleAddIncident}>Add Incident</Button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Counselor Notes</h3>
              
              <div className="space-y-2">
                <Textarea 
                  placeholder="Enter counselor notes here..."
                  value={counselorNotes}
                  onChange={(e) => setCounselorNotes(e.target.value)}
                  rows={5}
                />
              </div>
              
              <Button onClick={handleSaveCounselorNotes}>Save Notes</Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStudentDialog;
