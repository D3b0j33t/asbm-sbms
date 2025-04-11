
// Define the types for our Supabase database tables
export interface StudentType {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  course: string;
  semester: number;
  attendance: number;
  behavior_score: number;
  avatar_url?: string;
  academic_score: number;
  participation_score: number;
  created_at: string;
  updated_at: string;
  leaderboard_points?: number;
  cgpa?: number;
}

export interface PersonalityTraitsType {
  id: string;
  student_id: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  created_at: string;
  updated_at: string;
}

export interface BehavioralIncidentType {
  id: string;
  student_id: string;
  incident_date: string;
  type: string;
  description: string;
  severity: string;
  created_at: string;
}

export interface NotificationType {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient_role?: string;
  recipient_id?: string;
  student_id?: string;
  read?: boolean;
  created_at?: string;
}

export interface TeachingMaterialType {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: number;
  course?: string;
  uploaded_by: string;
  shared_with_all?: boolean;
  shared_with_course?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentMaterialType {
  id: string;
  material_id: string;
  student_id: string;
  created_at?: string;
}

export interface MaterialVisibilityType {
  id: string;
  material_id: string;
  user_email: string;
  created_at?: string;
}
