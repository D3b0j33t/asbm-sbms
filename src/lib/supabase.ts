
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { 
  StudentType, 
  PersonalityTraitsType, 
  BehavioralIncidentType, 
  NotificationType, 
  TeachingMaterialType, 
  StudentMaterialType, 
  MaterialVisibilityType 
} from '@/types/supabase';

// Use consistent variables for Supabase configuration
const SUPABASE_URL = 'https://jvsvvvehimepwnijkmnh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2c3Z2dmVoaW1lcHduaWprbW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzA2ODMsImV4cCI6MjA1OTk0NjY4M30.nJh-9B2zvhX4t8nPpPFyTl0JhKcbK2IxgLOem3mR1s0';

// Create the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Helper functions for common Supabase operations
export const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Create a unique file path using the user ID and timestamp
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Exception during avatar upload:', error);
    return null;
  }
};

// Upload teaching material file
export const uploadTeachingMaterial = async (
  file: File, 
  name: string, 
  description: string, 
  course: string, 
  uploadedBy: string, 
  visibleToAll: boolean = false,
  sharedWithCourse: string = "",
  sharedWithStudentIds: string[] = []
): Promise<{url: string, size: number, type: string} | null> => {
  try {
    console.log('Uploading teaching material:', { 
      name, 
      description, 
      course, 
      visibleToAll,
      sharedWithCourse
    });
    
    // Create a unique file path using timestamp and file name
    const filePath = `${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('teaching_materials')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading teaching material:', error);
      return null;
    }
    
    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('teaching_materials')
      .getPublicUrl(filePath);
    
    console.log('File uploaded successfully, URL:', publicUrl);
    
    return {
      url: publicUrl,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Exception during teaching material upload:', error);
    return null;
  }
};

// Type-safe function to access our tables
export const getStudentsTable = () => {
  return supabase.from('students');
};

export const getPersonalityTraitsTable = () => {
  return supabase.from('personality_traits');
};

export const getBehavioralIncidentsTable = () => {
  return supabase.from('behavioral_incidents');
};

export const getNotificationsTable = () => {
  return supabase.from('notifications');
};

export const getTeachingMaterialsTable = () => {
  return supabase.from('teaching_materials');
};

// Function to check if a student has access to a material
export const checkStudentAccessToMaterial = async (materialId: string, studentId: string, studentCourse: string): Promise<boolean> => {
  try {
    console.log('Checking access for material:', materialId, 'student:', studentId, 'course:', studentCourse);
    
    // Get the material
    const { data: material, error } = await getTeachingMaterialsTable()
      .select('*')
      .eq('id', materialId)
      .single();

    if (error || !material) {
      console.error('Error checking material access:', error);
      return false;
    }

    console.log('Material found:', material);

    // Check if shared with all
    if (material.shared_with_all) {
      console.log('Material is shared with all - access granted');
      return true;
    }

    // Check if shared with the student's course
    if (material.shared_with_course && material.shared_with_course === studentCourse) {
      console.log('Material is shared with student course - access granted');
      return true;
    }

    // Check if specifically shared with this student
    const { data: studentMaterial, error: accessError } = await getStudentMaterialsTable()
      .select('id')
      .eq('material_id', materialId)
      .eq('student_id', studentId);

    if (accessError) {
      console.error('Error checking student material access:', accessError);
      return false;
    }

    if (studentMaterial && studentMaterial.length > 0) {
      console.log('Material is specifically shared with student - access granted');
      return true;
    }
    
    console.log('Student does not have access to this material');
    return false;
  } catch (error) {
    console.error('Exception checking student access:', error);
    return false;
  }
};

export const getMaterialVisibilityTable = () => {
  return supabase.from('teaching_materials');
};

export const getStudentMaterialsTable = () => {
  return supabase.from('student_materials');
};

// Function to get all materials a student has access to
export const getStudentAccessibleMaterials = async (studentId: string, studentCourse: string): Promise<TeachingMaterialType[]> => {
  try {
    console.log('Fetching accessible materials for student:', studentId, 'course:', studentCourse);
    
    // Get all materials
    const { data: allMaterials, error } = await getTeachingMaterialsTable()
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching teaching materials:', error);
      return [];
    }
    
    if (!allMaterials || allMaterials.length === 0) {
      console.log('No teaching materials found');
      return [];
    }
    
    console.log('Found', allMaterials.length, 'total materials, filtering for student access');
    
    // Get materials specifically shared with this student
    const { data: studentMaterials, error: studentMaterialsError } = await getStudentMaterialsTable()
      .select('material_id')
      .eq('student_id', studentId);
      
    if (studentMaterialsError) {
      console.error('Error fetching student materials:', studentMaterialsError);
    }
    
    const studentMaterialIds = studentMaterials ? studentMaterials.map(sm => sm.material_id || '') : [];
    
    // Filter materials based on access
    const accessibleMaterials = allMaterials.filter(material => 
      // Shared with all
      material.shared_with_all === true || 
      // Shared with student's course
      (material.shared_with_course && material.shared_with_course === studentCourse) ||
      // Specifically shared with student
      studentMaterialIds.includes(material.id)
    );
    
    console.log('Student has access to', accessibleMaterials.length, 'materials');
    
    return accessibleMaterials as TeachingMaterialType[];
  } catch (error) {
    console.error('Exception fetching student accessible materials:', error);
    return [];
  }
};

export default supabase;
