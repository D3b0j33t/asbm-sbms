
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export interface UserData {
  username: string;
  password: string;
  email: string;
}

export interface StudentData {
  name: string;
  email: string;
  roll_number: string;
  course: string;
  semester: number;
  attendance: number;
  behavior_score: number;
  academic_score: number;
  participation_score: number;
  avatar_url?: string;
  leaderboard_points?: number;
  cgpa?: number;
}

export const processFileData = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        if (file.name.endsWith('.csv')) {
          // Process CSV
          const text = data as string;
          const rows = text.split('\n');
          const headers = rows[0].split(',').map(header => header.trim());
          
          const parsedData = rows.slice(1).filter(row => row.trim() !== '').map(row => {
            const values = row.split(',').map(value => value.trim());
            const rowData: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              rowData[header] = values[index] || '';
            });
            
            return rowData;
          });
          
          resolve(parsedData);
        } else if (file.name.endsWith('.xlsx')) {
          // Process XLSX
          const arrayBuffer = data as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const parsedData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(parsedData);
        } else {
          reject(new Error('Unsupported file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

export const uploadUsersData = async (usersData: UserData[]): Promise<{success: boolean; message: string}> => {
  try {
    console.log('Uploading users data:', usersData);
    
    // Use Supabase Edge Function to bypass RLS policy
    const { data, error } = await supabase.functions.invoke('admin-create-users', {
      body: { users: usersData }
    });
    
    if (error) {
      console.error('Error uploading users data:', error);
      return { success: false, message: error.message };
    }
    
    return { 
      success: true, 
      message: `Successfully uploaded ${usersData.length} user records` 
    };
  } catch (error) {
    console.error('Exception uploading users data:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};

export const uploadStudentsData = async (studentsData: StudentData[]): Promise<{success: boolean; message: string}> => {
  try {
    console.log('Uploading students data:', studentsData);
    
    // For each student, check if a corresponding user exists
    for (const student of studentsData) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', student.email)
        .maybeSingle();
      
      // If no user exists with this email, create one
      if (!existingUser) {
        console.log(`No user found for student email ${student.email}, will create user record`);
        
        // Generate default password from roll number
        const defaultPassword = `${student.roll_number}@123`;
        
        await supabase.functions.invoke('admin-create-users', {
          body: { 
            users: [{
              username: student.name.toLowerCase().replace(/\s+/g, '_'),
              email: student.email,
              password: defaultPassword
            }]
          }
        });
      }
    }
    
    // Insert students data into students table
    const { data, error } = await supabase
      .from('students')
      .upsert(
        studentsData.map(student => ({
          name: student.name,
          email: student.email,
          roll_number: student.roll_number,
          course: student.course,
          semester: student.semester,
          attendance: student.attendance,
          behavior_score: student.behavior_score,
          academic_score: student.academic_score || 80,
          participation_score: student.participation_score || 75,
          avatar_url: student.avatar_url || null,
          leaderboard_points: student.leaderboard_points || 0,
          cgpa: student.cgpa || 3.0
        })),
        { onConflict: 'email' }
      );
    
    if (error) {
      console.error('Error uploading students data:', error);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: `Successfully uploaded ${studentsData.length} student records` };
  } catch (error) {
    console.error('Exception uploading students data:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
};
